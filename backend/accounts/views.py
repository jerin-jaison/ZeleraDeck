from datetime import datetime, timezone as dt_timezone

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

        # Check subscription expiry at login time
        if shop.expires_at and shop.expires_at < timezone.now():
            if shop.is_active:
                shop.is_active = False
                shop.token_version += 1
                shop.save(update_fields=['is_active', 'token_version'])
            return Response(
                {'error': 'Your subscription has expired. Contact support.'},
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
        }, status=status.HTTP_200_OK)


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

        serializer = ShopAdminListSerializer(shops, many=True)
        return Response(serializer.data)

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

        # Optional fields from admin
        if 'expires_at' in request.data and request.data['expires_at']:
            shop.expires_at = request.data['expires_at']
        if 'admin_notes' in request.data:
            shop.admin_notes = request.data.get('admin_notes', '')

        shop.save()  # slug auto-generated inside model.save()

        return Response({
            'shop_id': str(shop.id),
            'name': shop.name,
            'slug': shop.slug,
            'phone': shop.phone,
            'logo_url': shop.logo_url,
            'public_url': f'/store/{shop.slug}',
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

        if 'name' in data and data['name'].strip():
            shop.name = data['name'].strip()

        if 'phone' in data and data['phone'].strip():
            new_phone = data['phone'].strip()
            if new_phone != shop.phone and Shop.objects.filter(phone=new_phone).exists():
                return Response(
                    {'error': 'A shop with this phone already exists'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            shop.phone = new_phone

        if 'admin_notes' in data:
            shop.admin_notes = data['admin_notes'] or ''

        if 'expires_at' in data:
            shop.expires_at = data['expires_at'] or None

        # Logo upload (multipart)
        logo_file = request.FILES.get('logo')
        if logo_file:
            try:
                shop.logo_url = upload_shop_logo(logo_file, shop.slug)
            except CloudinaryUploadError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        shop.save()

        serializer = ShopAdminListSerializer(shop)
        return Response(serializer.data)


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
