from datetime import datetime, timezone as dt_timezone
from django.core.paginator import Paginator

from django.contrib.auth.hashers import make_password
from django.db.models import Q
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from accounts.admin_permission import IsAdminSecret
from accounts.models import Shop
from accounts.serializers import (
    LoginSerializer, ShopAdminListSerializer, ShopCreateSerializer, ShopSerializer
)
from accounts.jwt_utils import get_tokens_for_shop
from accounts.jwt_auth import ShopJWTAuthentication
from catalogue.models import Product
from catalogue.serializers import ProductSerializer
from catalogue.cloudinary_utils import upload_shop_logo, CloudinaryUploadError


# ─── Auth Views ──────────────────────────────────────────────────────────────

class LoginView(APIView):
    """POST /api/auth/login/ — phone + password → JWT tokens"""
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        phone = serializer.validated_data['phone']
        password = serializer.validated_data['password']

        try:
            shop = Shop.objects.get(phone=phone)
        except Shop.DoesNotExist:
            return Response(
                {'error': 'Invalid phone or password'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not shop.check_password(password):
            return Response(
                {'error': 'Invalid phone or password'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Removed auto-deactivation so users can still remain logged in if already logged in.
        # However, if they are formally logging in from the login screen, reject them.
        if shop.expires_at and shop.expires_at < timezone.now():
            return Response(
                {'error': 'Your subscription has expired. Contact ZeleraDeck to renew.'},
                status=status.HTTP_403_FORBIDDEN
            )

        if not shop.is_active:
            return Response(
                {'error': 'Your store has been deactivated. Contact support.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Update last_login
        shop.last_login = timezone.now()
        shop.save(update_fields=['last_login'])

        tokens = get_tokens_for_shop(shop)
        return Response({
            **tokens,
            'shop_id': str(shop.id),
            'shop_name': shop.name,
            'slug': shop.slug,
            'is_pro': shop.is_pro,
        }, status=status.HTTP_200_OK)


class RefreshTokenView(APIView):
    """POST /api/auth/refresh/ — refresh access token using refresh token"""
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        refresh_str = request.data.get('refresh')
        if not refresh_str:
            return Response(
                {'error': 'Refresh token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            from rest_framework_simplejwt.tokens import RefreshToken
            old_refresh = RefreshToken(refresh_str)
        except Exception:
            return Response(
                {'detail': 'Token is invalid or expired'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        shop_id = old_refresh.get('shop_id')
        if not shop_id:
            return Response(
                {'detail': 'Token is invalid or expired'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            shop = Shop.objects.get(pk=shop_id)
        except Shop.DoesNotExist:
            return Response(
                {'detail': 'Token is invalid or expired'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Check if shop is still active (Must run before version check)
        if not shop.is_active:
            return Response(
                {'detail': 'Your store has been deactivated. Contact support.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Check subscription expiry
        if shop.expires_at and shop.expires_at < timezone.now():
            return Response(
                {'detail': 'Your subscription has expired. Contact support.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Check token_version — force logout if password changed
        token_version_in_token = old_refresh.get('token_version', 0)
        if token_version_in_token != shop.token_version:
            return Response(
                {'detail': 'Session expired. Please log in again.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Generate new access token with current shop data
        tokens = get_tokens_for_shop(shop)
        return Response({
            'access': tokens['access'],
            'shop_name': shop.name,
            'slug': shop.slug,
        })

# ─── Admin Views ─────────────────────────────────────────────────────────────

class AdminShopListCreateView(APIView):
    """GET /api/admin/shops/ and POST /api/admin/shops/"""
    authentication_classes = []
    permission_classes = [IsAdminSecret]

    def get(self, request):
        shops = Shop.objects.all().order_by('-created_at')

        # Search filter
        search = request.query_params.get('search', '').strip()
        if search:
            shops = shops.filter(Q(name__icontains=search) | Q(phone__icontains=search))

        # Status filter
        status_filter = request.query_params.get('status', '').strip().lower()
        if status_filter == 'active':
            shops = shops.filter(is_active=True)
        elif status_filter == 'inactive':
            shops = shops.filter(is_active=False)
        elif status_filter == 'expired':
            shops = shops.filter(expires_at__lt=timezone.now())

        # Pagination
        page = request.query_params.get('page', '1')
        page_size = min(int(request.query_params.get('page_size', '10')), 50)
        paginator = Paginator(shops, page_size)
        page_obj = paginator.get_page(page)

        serializer = ShopAdminListSerializer(list(page_obj), many=True)
        return Response({
            'shops': serializer.data,
            'pagination': {
                'total': paginator.count,
                'page': page_obj.number,
                'page_size': page_size,
                'total_pages': paginator.num_pages,
                'has_next': page_obj.has_next(),
                'has_previous': page_obj.has_previous(),
            },
        })

    def post(self, request):
        serializer = ShopCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data

        if Shop.objects.filter(phone=data['phone']).exists():
            return Response(
                {'error': 'A shop with this phone already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )

        shop = Shop(
            name=data['name'],
            category=data.get('category', '').strip(),
            town=data.get('town', '').strip(),
            phone=data['phone'],
            password=make_password(data['password']),
        )

        # Optional logo upload — read directly from FILES to bypass ImageField
        # extension validation (browser-image-compression strips the extension)
        logo_file = request.FILES.get('logo')
        if logo_file:
            try:
                shop.logo_url = upload_shop_logo(logo_file, shop.name.lower().replace(' ', '-'))
            except CloudinaryUploadError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Optional cover image upload
        cover_file = request.FILES.get('cover')
        if cover_file:
            try:
                shop.cover_image_url = upload_shop_logo(cover_file, f"{shop.name.lower().replace(' ', '-')}-cover")
            except Exception:
                pass
        elif 'cover_image_url' in request.data and request.data['cover_image_url']:
            shop.cover_image_url = request.data['cover_image_url'].strip()

        if 'logo_url' in request.data and request.data['logo_url']:
            shop.logo_url = request.data['logo_url'].strip()

        # Optional fields from admin
        if 'expires_at' in request.data and request.data['expires_at']:
            shop.expires_at = request.data['expires_at']
        if 'admin_notes' in request.data:
            shop.admin_notes = request.data.get('admin_notes', '')

        # Pro Mode toggle
        if 'is_pro' in request.data:
            raw_is_pro = str(request.data.get('is_pro', 'false')).strip().lower()
            shop.is_pro = raw_is_pro in ('true', '1', 'yes')

        # SEO fields overrides (if provided)
        if 'seo_title' in request.data:
            shop.seo_title = request.data.get('seo_title', '').strip()
        if 'seo_description' in request.data:
            shop.seo_description = request.data.get('seo_description', '').strip()
        if 'seo_heading' in request.data:
            shop.seo_heading = request.data.get('seo_heading', '').strip()
        if 'is_indexable' in request.data:
            raw_idx = str(request.data.get('is_indexable', 'true')).strip().lower()
            shop.is_indexable = raw_idx in ('true', '1', 'yes')

        shop.save()  # slug and SEO auto-generated inside model.save()

        return Response({
            'shop_id': str(shop.id),
            'name': shop.name,
            'slug': shop.slug,
            'category': shop.category,
            'town': shop.town,
            'phone': shop.phone,
            'logo_url': shop.logo_url,
            'cover_image_url': shop.cover_image_url,
            'seo_title': shop.seo_title,
            'seo_description': shop.seo_description,
            'seo_heading': shop.seo_heading,
            'is_indexable': shop.is_indexable,
            'structured_data': shop.structured_data,
            'public_url': f'/{shop.slug}',
        }, status=status.HTTP_201_CREATED)


class AdminShopToggleView(APIView):
    """PATCH /api/admin/shops/{id}/toggle/ — flip is_active"""
    authentication_classes = []
    permission_classes = [IsAdminSecret]

    def patch(self, request, pk):
        try:
            shop = Shop.objects.get(pk=pk)
        except Shop.DoesNotExist:
            return Response({'error': 'Shop not found'}, status=status.HTTP_404_NOT_FOUND)

        shop.is_active = not shop.is_active

        if not shop.is_active:
            shop.token_version += 1
            shop.save(update_fields=['is_active', 'token_version'])
        else:
            shop.save(update_fields=['is_active'])

        return Response({
            'id': str(shop.id),
            'name': shop.name,
            'is_active': shop.is_active,
        })


class AdminShopResetPasswordView(APIView):
    """POST /api/admin/shops/{id}/reset-password/"""
    authentication_classes = []
    permission_classes = [IsAdminSecret]

    def post(self, request, pk):
        try:
            shop = Shop.objects.get(pk=pk)
        except Shop.DoesNotExist:
            return Response({'error': 'Shop not found'}, status=status.HTTP_404_NOT_FOUND)

        new_password = request.data.get('new_password', '').strip()
        if len(new_password) < 6:
            return Response(
                {'error': 'new_password must be at least 6 characters'},
                status=status.HTTP_400_BAD_REQUEST
            )

        shop.set_password(new_password)
        shop.token_version += 1
        shop.last_login = None
        shop.save(update_fields=['password', 'token_version', 'last_login'])
        return Response({'message': 'Password updated. Shop owner has been logged out.'})


class AdminShopDeleteView(APIView):
    """DELETE /api/admin/shops/{id}/ — permanently delete shop + all products"""
    authentication_classes = []
    permission_classes = [IsAdminSecret]

    def delete(self, request, pk):
        try:
            shop = Shop.objects.get(pk=pk)
        except Shop.DoesNotExist:
            return Response({'error': 'Shop not found'}, status=status.HTTP_404_NOT_FOUND)

        print(f'[ADMIN] Deleting shop: {shop.name} ({shop.id}) — {shop.products.count()} products')
        shop.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminShopEditView(APIView):
    """PATCH /api/admin/shops/{id}/edit/ — edit shop details"""
    authentication_classes = []
    permission_classes = [IsAdminSecret]

    def patch(self, request, pk):
        try:
            shop = Shop.objects.get(pk=pk)
        except Shop.DoesNotExist:
            return Response({'error': 'Shop not found'}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        phone_changed = False

        # ── Name ──────────────────────────────────────────────────────────
        if 'name' in data:
            name_val = (data['name'] or '').strip()
            if name_val and name_val != shop.name:
                shop.name = name_val
                shop.regenerate_slug()  # Update slug to match new name

        # ── Phone ─────────────────────────────────────────────────────────
        if 'phone' in data:
            raw_phone = (data['phone'] or '').strip()
            # Strip spaces and dashes
            new_phone = raw_phone.replace(' ', '').replace('-', '')
            if new_phone:
                if new_phone != shop.phone:
                    if Shop.objects.filter(phone=new_phone).exclude(pk=pk).exists():
                        return Response(
                            {'error': 'This phone number is already used by another shop.'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    phone_changed = True
                shop.phone = new_phone

        # ── Admin Notes ───────────────────────────────────────────────────
        if 'admin_notes' in data:
            shop.admin_notes = data['admin_notes'] or ''

        # ── Pro Mode toggle ─────────────────────────────────────────
        if 'is_pro' in data:
            raw_is_pro = str(data.get('is_pro', 'false')).strip().lower()
            shop.is_pro = raw_is_pro in ('true', '1', 'yes')

        # ── Expires At ────────────────────────────────────────────────────
        if 'expires_at' in data:
            expires_val = data['expires_at']
            if expires_val is None or expires_val == '' or expires_val == 'null':
                shop.expires_at = None
            else:
                try:
                    # Accept YYYY-MM-DD or full ISO8601
                    date_str = str(expires_val).strip()
                    if 'T' in date_str:
                        parsed = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                    else:
                        parsed = datetime.strptime(date_str, '%Y-%m-%d').replace(
                            tzinfo=dt_timezone.utc
                        )
                    shop.expires_at = parsed
                except (ValueError, TypeError):
                    return Response(
                        {'error': 'Invalid date format. Use YYYY-MM-DD.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

        # ── Logo upload (multipart) ───────────────────────────────────────
        logo_file = request.FILES.get('logo')
        if logo_file:
            try:
                shop.logo_url = upload_shop_logo(logo_file, shop.slug)
            except CloudinaryUploadError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # ── Cover upload (multipart) ──────────────────────────────────────
        cover_file = request.FILES.get('cover')
        if cover_file:
            try:
                shop.cover_image_url = upload_shop_logo(cover_file, f"{shop.slug}-cover")
            except Exception:
                pass

        # ── Category & Town ───────────────────────────────────────────────
        if 'category' in data:
            shop.category = (data.get('category') or '').strip()
        if 'town' in data:
            shop.town = (data.get('town') or '').strip()

        # ── SEO Fields & Indexing ─────────────────────────────────────────
        if 'is_indexable' in data:
            raw_idx = str(data.get('is_indexable', 'true')).strip().lower()
            shop.is_indexable = raw_idx in ('true', '1', 'yes')
        if 'seo_title' in data:
            shop.seo_title = (data.get('seo_title') or '').strip()
        if 'seo_description' in data:
            shop.seo_description = (data.get('seo_description') or '').strip()
        if 'seo_heading' in data:
            shop.seo_heading = (data.get('seo_heading') or '').strip()
        if 'cover_image_url' in data:
            shop.cover_image_url = (data.get('cover_image_url') or '').strip() or None

        # ── Save ──────────────────────────────────────────────────────────
        if phone_changed:
            shop.token_version += 1

        shop.save()

        serializer = ShopAdminListSerializer(shop)
        return Response(serializer.data)


def check_shop_seo_health(shop):
    """
    Evaluates 7 criteria for SEO readiness:
    1. title_length: 30-60 characters
    2. description_present: >= 50 characters (recommended 120-160)
    3. town_present: bool(shop.town.strip())
    4. cover_image_present: bool(shop.cover_image_url or shop.logo_url)
    5. indexing_on: bool(shop.is_indexable)
    6. ready_html: shop exists, is_active, and has valid slug
    7. structured_data_valid: valid JSON-LD schema with @context, @type, name, address
    """
    title = (shop.seo_title or '').strip()
    title_ok = 25 <= len(title) <= 65
    title_msg = f"{len(title)} chars (recommended: 30-60 chars)" if title else "Missing SEO title"

    desc = (shop.seo_description or '').strip()
    desc_ok = len(desc) >= 50
    desc_msg = f"{len(desc)} chars (recommended: 120-160 chars)" if desc else "Missing SEO description"

    town = (shop.town or '').strip()
    town_ok = bool(town)
    town_msg = town if town_ok else "Missing town for local search"

    cover_image_ok = bool(shop.cover_image_url or shop.logo_url)
    if not cover_image_ok and shop.is_pro:
        try:
            from pro.models import ProHeroSettings
            hero = ProHeroSettings.objects.filter(shop=shop).first()
            if hero and (hero.hero_image_url or hero.hero_mobile_image_url):
                cover_image_ok = True
        except Exception:
            pass
    cover_image_msg = "Image set" if cover_image_ok else "No cover image or logo set"

    indexing_ok = bool(shop.is_indexable)
    indexing_msg = "Indexing enabled" if indexing_ok else "Indexing turned off (noindex)"

    ready_html_ok = bool(shop.is_active and shop.slug)
    ready_html_msg = f"Ready HTML at /{shop.slug}" if ready_html_ok else "Store inactive or missing slug"

    sd = shop.structured_data
    sd_ok = False
    if isinstance(sd, dict) and sd:
        has_context = sd.get("@context") in ["https://schema.org", "http://schema.org"]
        has_type = sd.get("@type") in ["Store", "LocalBusiness", "Organization"]
        has_name = bool(sd.get("name"))
        has_addr = bool(sd.get("address"))
        sd_ok = has_context and has_type and has_name and has_addr
    sd_msg = "Valid Schema.org Store JSON-LD" if sd_ok else "Incomplete structured data schema"

    checks = [
        {"id": "title_length", "label": "Title length (30-60 chars)", "passed": title_ok, "detail": title_msg},
        {"id": "description_present", "label": "Meta description present", "passed": desc_ok, "detail": desc_msg},
        {"id": "town_present", "label": "Town present", "passed": town_ok, "detail": town_msg},
        {"id": "cover_image_present", "label": "Cover image present", "passed": cover_image_ok, "detail": cover_image_msg},
        {"id": "indexing_switch", "label": "Indexing switch on", "passed": indexing_ok, "detail": indexing_msg},
        {"id": "ready_html", "label": "Shop page returns ready HTML", "passed": ready_html_ok, "detail": ready_html_msg},
        {"id": "structured_data_valid", "label": "Structured data valid", "passed": sd_ok, "detail": sd_msg},
    ]

    passed_count = sum(1 for c in checks if c["passed"])
    total_count = len(checks)
    is_ready = (passed_count == total_count)
    score = f"{passed_count}/{total_count}"
    score_percentage = int((passed_count / total_count) * 100)
    missing = [c["label"] for c in checks if not c["passed"]]

    return {
        "score": score,
        "score_percentage": score_percentage,
        "is_ready": is_ready,
        "passed_count": passed_count,
        "total_count": total_count,
        "checks": checks,
        "missing": missing,
    }


class AdminShopSeoHealthView(APIView):
    """GET /api/admin/shops/{id}/seo-health/ — evaluates 7-point SEO checklist"""
    authentication_classes = []
    permission_classes = [IsAdminSecret]

    def get(self, request, pk):
        try:
            shop = Shop.objects.get(pk=pk)
        except Shop.DoesNotExist:
            return Response({'error': 'Shop not found'}, status=status.HTTP_404_NOT_FOUND)

        health = check_shop_seo_health(shop)
        return Response(health)


class AdminShopProductsView(APIView):
    """GET /api/admin/shops/{id}/products/"""
    authentication_classes = []
    permission_classes = [IsAdminSecret]

    def get(self, request, pk):
        try:
            shop = Shop.objects.get(pk=pk)
        except Shop.DoesNotExist:
            return Response({'error': 'Shop not found'}, status=status.HTTP_404_NOT_FOUND)

        products = Product.objects.filter(shop=shop).order_by('-created_at')
        return Response({
            'shop_name': shop.name,
            'slug': shop.slug,
            'product_count': products.count(),
            'products': ProductSerializer(products, many=True).data,
        })


class AdminStatsView(APIView):
    """GET /api/admin/stats/"""
    authentication_classes = []
    permission_classes = [IsAdminSecret]

    def get(self, request):
        now = timezone.now()
        seven_days = now + timezone.timedelta(days=7)

        return Response({
            'total_shops': Shop.objects.count(),
            'active_shops': Shop.objects.filter(is_active=True).count(),
            'inactive_shops': Shop.objects.filter(is_active=False).count(),
            'total_products': Product.objects.count(),
            'shops_expiring_soon': Shop.objects.filter(
                expires_at__isnull=False,
                expires_at__gt=now,
                expires_at__lte=seven_days,
                is_active=True,
            ).count(),
        })


class MaintenanceModeView(APIView):
    """GET + POST /api/admin/maintenance/ — toggle maintenance mode"""
    authentication_classes = []
    permission_classes = [IsAdminSecret]

    def get(self, request):
        from accounts.site_settings import SiteSettings
        settings = SiteSettings.get()
        return Response({
            'maintenance': settings.maintenance_mode,
            'message': settings.maintenance_message,
        })

    def post(self, request):
        from accounts.site_settings import SiteSettings, STATUS_CACHE_KEY
        from django.core.cache import cache
        settings = SiteSettings.get()
        if 'maintenance' in request.data:
            settings.maintenance_mode = bool(request.data['maintenance'])
        if 'message' in request.data and request.data['message']:
            settings.maintenance_message = request.data['message']
        settings.save()
        cache.delete(STATUS_CACHE_KEY)
        return Response({
            'maintenance': settings.maintenance_mode,
            'message': settings.maintenance_message,
        })
