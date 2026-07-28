# POLICY: Existing user videos are never deleted or modified regardless of size.
import logging

from django.core.paginator import Paginator
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from accounts.models import Shop
from accounts.jwt_auth import ShopJWTAuthentication
from catalogue.models import Product, Category
from catalogue.serializers import (
    ProductSerializer, ProductCreateSerializer,
    ProductUpdateSerializer, ProductPublicSerializer,
    CategorySerializer, CategoryCreateSerializer
)
from catalogue.cloudinary_utils import upload_product_image, upload_product_video, CloudinaryUploadError, delete_cloudinary_asset_by_url
from pro.safety import check_labella_write_guard

logger = logging.getLogger(__name__)



# ─── Shop Owner Views ─────────────────────────────────────────────────────────

class ShopMeView(APIView):
    """GET /api/shop/me/ — authenticated shop owner info"""
    authentication_classes = [ShopJWTAuthentication]

    def get(self, request):
        shop = request.user
        return Response({
            'name': shop.name,
            'slug': shop.slug,
            'phone': shop.phone,
            'whatsapp_number': shop.whatsapp_number,
            'logo_url': shop.logo_url,
            'is_pro': shop.is_pro,
            'public_url': f'{settings.FRONTEND_URL}/{shop.slug}',
        })


# ─── Category Views ───────────────────────────────────────────────────────────

class ShopCategoryListCreateView(APIView):
    """GET + POST /api/shop/categories/"""
    authentication_classes = [ShopJWTAuthentication]

    def get(self, request):
        categories = Category.objects.filter(shop=request.user).order_by('name')
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

    def post(self, request):
        guard = check_labella_write_guard(request.user, "ShopCategoryListCreateView.post")
        if guard:
            return guard

        serializer = CategoryCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        name = serializer.validated_data['name']

        # Check for duplicate (case-insensitive)
        if Category.objects.filter(shop=request.user, name__iexact=name).exists():
            return Response(
                {'error': 'Category already exists.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        image_url = serializer.validated_data.get('image_url', None)
        image_file = request.FILES.get('image')
        if image_file:
            try:
                image_url = upload_product_image(image_file, request.user.slug)
            except CloudinaryUploadError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        category = Category.objects.create(shop=request.user, name=name, image_url=image_url)
        return Response(
            CategorySerializer(category).data,
            status=status.HTTP_201_CREATED
        )


class ShopCategoryDetailView(APIView):
    """PATCH + DELETE /api/shop/categories/{id}/"""
    authentication_classes = [ShopJWTAuthentication]

    def _get_category(self, pk, shop):
        try:
            category = Category.objects.get(pk=pk)
        except Category.DoesNotExist:
            return None, Response(
                {'error': 'Category not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        if category.shop_id != shop.id:
            return None, Response(
                {'error': 'Forbidden'},
                status=status.HTTP_403_FORBIDDEN
            )
        return category, None

    def patch(self, request, pk):
        guard = check_labella_write_guard(request.user, "ShopCategoryDetailView.patch")
        if guard:
            return guard

        category, err = self._get_category(pk, request.user)
        if err:
            return err

        name = request.data.get('name', category.name).strip() if 'name' in request.data else category.name
        if not name:
            return Response({'error': 'Category name cannot be empty.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check for duplicate (case-insensitive, excluding self)
        if Category.objects.filter(
            shop=request.user, name__iexact=name
        ).exclude(pk=category.pk).exists():
            return Response(
                {'error': 'Category already exists.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        category.name = name

        image_file = request.FILES.get('image')
        if image_file:
            try:
                old_url = category.image_url
                new_url = upload_product_image(image_file, request.user.slug)
                if old_url and old_url != new_url:
                    delete_cloudinary_asset_by_url(old_url)
                category.image_url = new_url
            except CloudinaryUploadError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        elif 'image_url' in request.data:
            category.image_url = request.data.get('image_url')

        if request.data.get('clear_image') == 'true' and not image_file:
            if category.image_url:
                delete_cloudinary_asset_by_url(category.image_url)
            category.image_url = None

        category.save()
        return Response(CategorySerializer(category).data)

    def delete(self, request, pk):
        guard = check_labella_write_guard(request.user, "ShopCategoryDetailView.delete")
        if guard:
            return guard

        category, err = self._get_category(pk, request.user)
        if err:
            return err

        affected = category.products.count()
        category.delete()
        return Response(
            {'affected_products': affected},
            status=status.HTTP_204_NO_CONTENT
        )


# ─── Product Views ────────────────────────────────────────────────────────────

class ShopProductListCreateView(APIView):
    """GET + POST /api/shop/products/"""
    authentication_classes = [ShopJWTAuthentication]

    def get(self, request):
        shop = request.user
        # Pro users see their custom display_order; free users get newest-first
        if shop.is_pro:
            products = Product.objects.filter(shop=shop).select_related('category').order_by('display_order', '-created_at')
        else:
            products = Product.objects.filter(shop=shop).select_related('category').order_by('-created_at')

        # Search filter
        search = request.query_params.get('search', '').strip()
        if search:
            products = products.filter(
                Q(name__icontains=search) | Q(display_id__icontains=search)
            )

        # Stock filter
        in_stock = request.query_params.get('in_stock', '').strip().lower()
        if in_stock == 'true':
            products = products.filter(is_in_stock=True)
        elif in_stock == 'false':
            products = products.filter(is_in_stock=False)

        # Category filter
        category_id = request.query_params.get('category', '').strip()
        if category_id:
            products = products.filter(category__id=category_id)

        # Pagination
        page = request.query_params.get('page', '1')
        page_size = min(int(request.query_params.get('page_size', '12')), 48)
        paginator = Paginator(products, page_size)
        page_obj = paginator.get_page(page)

        serializer = ProductSerializer(list(page_obj), many=True)
        return Response({
            'products': serializer.data,
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
        guard = check_labella_write_guard(request.user, "ShopProductListCreateView.post")
        if guard:
            return guard

        try:
            # Pre-process category_id (multipart/form-data sends strings)
            raw_category_id = request.data.get('category_id', None)
            mutable_data = request.data.copy()
            mutable_data.pop('category_id', None)

            serializer = ProductCreateSerializer(data=mutable_data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            data = serializer.validated_data
            shop = request.user

            # ── Pro media enforcement ──────────────────────────────────────────
            extra_images = [request.FILES.get(f'image_{i}') for i in range(2, 5)]
            video_file = request.FILES.get('video')

            if not shop.is_pro:
                if any(extra_images) or video_file:
                    return Response(
                        {'error': 'Extra photos and video upload require Pro Mode. Contact admin to upgrade.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            # Read primary image directly from FILES to bypass ImageField extension validation
            # (browser-image-compression produces blobs with no file extension)
            image_file = request.FILES.get('image')
            if not image_file:
                return Response({'error': 'image is required'}, status=status.HTTP_400_BAD_REQUEST)

            try:
                image_url = upload_product_image(image_file, shop.slug)
            except CloudinaryUploadError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

            # Handle optional category
            category = None
            if raw_category_id and str(raw_category_id).strip() not in ('null', 'None', '', 'undefined'):
                try:
                    category = Category.objects.get(id=raw_category_id, shop=shop)
                except Exception:
                    pass  # silently ignore invalid category ID format or missing category

            # Parse sizes and colors JSON if sent via multipart/form-data
            def _parse_json(val):
                if isinstance(val, list):
                    return val
                if isinstance(val, str) and val.strip():
                    try:
                        import json
                        return json.loads(val)
                    except Exception:
                        return [x.strip() for x in val.split(',') if x.strip()]
                return []

            sizes_val = _parse_json(request.data.get('available_sizes', '[]'))
            colors_val = _parse_json(request.data.get('available_colors', '[]'))
            size_scheme_val = str(request.data.get('size_scheme', 'numeric')).strip()
            discount_val = data.get('discount_percent', 0)

            product = Product.objects.create(
                shop=shop,
                name=data['name'],
                price=data['price'],
                description=data.get('description', ''),
                image_url=image_url,
                is_in_stock=data.get('is_in_stock', True),
                # Legacy boolean flags — must always be explicitly supplied to
                # avoid NOT NULL violations on the Render PostgreSQL database.
                is_best_product=False,
                is_offer_product=False,
                is_trending=False,
                is_new_product=False,
                category=category,
                discount_percent=discount_val,
                size_scheme=size_scheme_val,
                available_sizes=sizes_val,
                available_colors=colors_val,
            )

            # ── Pro: upload extra images 2–4 ────────────────────────────────────
            if shop.is_pro:
                url_fields = ['image_url_2', 'image_url_3', 'image_url_4']
                for img_file, url_field in zip(extra_images, url_fields):
                    if img_file:
                        try:
                            url = upload_product_image(img_file, shop.slug)
                            setattr(product, url_field, url)
                        except CloudinaryUploadError as e:
                            product.delete()
                            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

                # ── Pro: video — accept pre-uploaded Cloudinary URL or file ────
                video_url_field = request.data.get('video_url', '').strip()
                video_file = request.FILES.get('video')

                if video_url_field:
                    try:
                        compressed_bytes = int(request.data.get('video_compressed_bytes', 0))
                    except (ValueError, TypeError):
                        compressed_bytes = 0

                    if compressed_bytes > 5 * 1024 * 1024:
                        product.delete()
                        logger.warning(
                            f"Oversized video blocked from DB: url={video_url_field}, "
                            f"size={compressed_bytes / (1024*1024):.2f}MB. Not deleted per policy."
                        )
                        return Response(
                            {'error': 'Video exceeds size limit. Use a shorter clip.'},
                            status=status.HTTP_400_BAD_REQUEST
                        )

                    # Browser already uploaded directly to Cloudinary — just save the URL
                    product.video_url = video_url_field
                elif video_file:
                    allowed_mime = {'video/mp4', 'video/webm', 'video/quicktime'}
                    if video_file.content_type not in allowed_mime:
                        product.delete()
                        return Response(
                            {'error': 'Invalid video type. Allowed: mp4, webm, mov.'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    try:
                        product.video_url = upload_product_video(video_file, shop.slug)
                    except CloudinaryUploadError as e:
                        product.delete()
                        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

                product.save()

            return Response(ProductSerializer(product).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.exception("Error creating product for shop %s: %s", request.user.slug if hasattr(request.user, 'slug') else 'unknown', e)
            return Response(
                {'error': f'Failed to create product: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ShopProductDetailView(APIView):
    """GET + PATCH + DELETE /api/shop/products/{id}/"""
    authentication_classes = [ShopJWTAuthentication]

    def _get_product(self, pk, shop):
        try:
            product = Product.objects.select_related('category').get(pk=pk)
        except Product.DoesNotExist:
            return None, Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        if product.shop_id != shop.id:
            return None, Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        return product, None

    def get(self, request, pk):
        product, err = self._get_product(pk, request.user)
        if err:
            return err
        return Response(ProductSerializer(product).data)

    def patch(self, request, pk):
        guard = check_labella_write_guard(request.user, "ShopProductDetailView.patch")
        if guard:
            return guard

        product, err = self._get_product(pk, request.user)
        if err:
            return err

        # Pre-process category_id from request.data before serializer
        # (multipart/form-data sends strings, not null)
        raw_category_id = request.data.get('category_id', '__absent__')
        has_category_update = raw_category_id != '__absent__'

        # Build a mutable copy without category_id for the serializer
        mutable_data = request.data.copy()
        mutable_data.pop('category_id', None)

        serializer = ProductUpdateSerializer(data=mutable_data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        shop = request.user

        # ── Pro media enforcement ──────────────────────────────────────────
        extra_images = [request.FILES.get(f'image_{i}') for i in range(2, 5)]
        video_file = request.FILES.get('video')

        if not shop.is_pro:
            if any(extra_images) or video_file:
                return Response(
                    {'error': 'Extra photos and video upload require Pro Mode. Contact admin to upgrade.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Handle category_id
        if has_category_update:
            if not raw_category_id or raw_category_id == 'null':
                product.category = None
            else:
                try:
                    product.category = Category.objects.get(id=raw_category_id, shop=request.user)
                except (Category.DoesNotExist, ValueError):
                    pass  # silently ignore invalid category

        def _parse_json(val):
            if isinstance(val, list):
                return val
            if isinstance(val, str) and val.strip():
                try:
                    import json
                    return json.loads(val)
                except Exception:
                    return [x.strip() for x in val.split(',') if x.strip()]
            return []

        if 'available_sizes' in request.data:
            product.available_sizes = _parse_json(request.data.get('available_sizes'))
        if 'available_colors' in request.data:
            product.available_colors = _parse_json(request.data.get('available_colors'))
        if 'size_scheme' in request.data:
            product.size_scheme = str(request.data.get('size_scheme', 'numeric')).strip()
        if 'discount_percent' in request.data or 'discount' in request.data:
            disc = request.data.get('discount_percent', request.data.get('discount', 0))
            try:
                product.discount_percent = max(0, min(100, int(disc)))
            except (ValueError, TypeError):
                product.discount_percent = 0

        # Read primary image directly from FILES to bypass ImageField extension validation
        image_file = request.FILES.get('image')
        if image_file:
            try:
                old_image_url = product.image_url  # snapshot before overwrite
                new_image_url = upload_product_image(image_file, shop.slug)
                # Delete old image from Cloudinary after successful new upload
                if old_image_url and old_image_url != new_image_url:
                    delete_cloudinary_asset_by_url(old_image_url)
                data['image_url'] = new_image_url
            except CloudinaryUploadError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        for field, value in data.items():
            setattr(product, field, value)

        # ── Pro: upload extra images 2–4 ────────────────────────────────────
        if shop.is_pro:
            url_fields = ['image_url_2', 'image_url_3', 'image_url_4']
            for img_file, url_field in zip(extra_images, url_fields):
                if img_file:
                    try:
                        old_extra_url = getattr(product, url_field)  # snapshot before overwrite
                        new_extra_url = upload_product_image(img_file, shop.slug)
                        # Delete old extra image from Cloudinary after successful new upload
                        if old_extra_url and old_extra_url != new_extra_url:
                            delete_cloudinary_asset_by_url(old_extra_url)
                        setattr(product, url_field, new_extra_url)
                    except CloudinaryUploadError as e:
                        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

            # ── Pro: video — accept pre-uploaded Cloudinary URL or file ────
            video_url_field = request.data.get('video_url', '').strip()
            video_file = request.FILES.get('video')

            if video_url_field:
                # Layer 3 safety net: validate compressed byte count sent by frontend.
                # Frontend sends video_compressed_bytes alongside video_url so we can
                # enforce the size limit without a slow network HEAD request.
                try:
                    compressed_bytes = int(request.data.get('video_compressed_bytes', 0))
                except (ValueError, TypeError):
                    compressed_bytes = 0

                if compressed_bytes > 5 * 1024 * 1024:
                    logger.warning(
                        f"Oversized video blocked from DB: url={video_url_field}, "
                        f"size={compressed_bytes / (1024*1024):.2f}MB. Not deleted per policy."
                    )
                    return Response(
                        {'error': 'Video exceeds size limit. Use a shorter clip.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # If a different video URL is being set, remove the old one from Cloudinary.
                # POLICY: only fires when THIS product's video is explicitly replaced right now.
                old_video_url = product.video_url
                if old_video_url and old_video_url != video_url_field:
                    delete_cloudinary_asset_by_url(old_video_url)

                # Browser already uploaded directly to Cloudinary — just save the URL
                product.video_url = video_url_field
            elif video_file:
                allowed_mime = {'video/mp4', 'video/webm', 'video/quicktime'}
                if video_file.content_type not in allowed_mime:
                    return Response(
                        {'error': 'Invalid video type. Allowed: mp4, webm, mov.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                try:
                    old_video_url = product.video_url
                    new_video_url = upload_product_video(video_file, shop.slug)
                    # Delete old video from Cloudinary only after successful new upload
                    if old_video_url and old_video_url != new_video_url:
                        delete_cloudinary_asset_by_url(old_video_url)
                    product.video_url = new_video_url
                except CloudinaryUploadError as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


        product.save()

        return Response(ProductSerializer(product).data)

    def delete(self, request, pk):
        guard = check_labella_write_guard(request.user, "ShopProductDeleteView.delete")
        if guard:
            return guard

        product, err = self._get_product(pk, request.user)
        if err:
            return err

        # Collect all Cloudinary asset URLs before deleting the DB row.
        # We delete from Cloudinary AFTER the DB delete so if Cloudinary
        # fails the product is still gone from the user's catalogue.
        # POLICY: only assets owned by THIS product row are cleaned up.
        media_to_delete = [
            url for url in [
                product.image_url,
                product.image_url_2,
                product.image_url_3,
                product.image_url_4,
                product.video_url,
            ] if url
        ]

        product.delete()

        # Best-effort cleanup — silently skips any URL that fails or isn't Cloudinary
        for url in media_to_delete:
            delete_cloudinary_asset_by_url(url)

        return Response(status=status.HTTP_204_NO_CONTENT)


# ─── Public Views ─────────────────────────────────────────────────────────────

class PublicStoreView(APIView):
    """GET /api/store/{slug}/"""
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request, slug):
        try:
            shop = Shop.objects.get(slug=slug)
        except Shop.DoesNotExist:
            return Response({'error': 'Store not found'}, status=status.HTTP_404_NOT_FOUND)

        if not shop.is_active:
            return Response({
                'is_active': False,
                'name': shop.name,
                'whatsapp_number': shop.whatsapp_number,
            })

        # Check subscription expiry for public store
        if shop.expires_at and shop.expires_at < timezone.now():
            if shop.is_active:
                shop.is_active = False
                shop.token_version += 1
                shop.save(update_fields=['is_active', 'token_version'])
            return Response({
                'is_active': False,
                'name': shop.name,
                'whatsapp_number': shop.whatsapp_number,
            })

        # Ordering: Pro shops use custom display_order; free shops use stock + newest-first
        from django.db.models import Case, When, BooleanField
        if shop.is_pro:
            products = Product.objects.filter(shop=shop).select_related('category').annotate(
                stock_order=Case(
                    When(is_in_stock=True, then=0),
                    When(is_in_stock=False, then=1),
                    output_field=BooleanField(),
                )
            ).order_by('stock_order', 'display_order', '-created_at')
        else:
            products = Product.objects.filter(shop=shop).select_related('category').annotate(
                stock_order=Case(
                    When(is_in_stock=True, then=0),
                    When(is_in_stock=False, then=1),
                    output_field=BooleanField(),
                )
            ).order_by('stock_order', '-created_at')

        # Search filter
        search = request.query_params.get('search', '').strip()
        if search:
            products = products.filter(
                Q(name__icontains=search) | Q(display_id__icontains=search)
            )

        # Stock filter
        in_stock = request.query_params.get('in_stock', '').strip().lower()
        if in_stock == 'true':
            products = products.filter(is_in_stock=True)
        elif in_stock == 'false':
            products = products.filter(is_in_stock=False)

        # Pagination
        page = request.query_params.get('page', '1')
        page_size = min(int(request.query_params.get('page_size', '12')), 48)
        paginator = Paginator(products, page_size)
        page_obj = paginator.get_page(page)

        # All categories for this shop (including empty ones)
        categories = shop.categories.all().order_by('name')

        return Response({
            'is_active': True,
            'name': shop.name,
            'slug': shop.slug,
            'is_pro': shop.is_pro,
            'phone': shop.phone,
            'whatsapp_number': shop.whatsapp_number,
            'logo_url': shop.logo_url,
            'categories': CategorySerializer(categories, many=True).data,
            'products': ProductPublicSerializer(list(page_obj), many=True).data,
            'pagination': {
                'total': paginator.count,
                'page': page_obj.number,
                'page_size': page_size,
                'total_pages': paginator.num_pages,
                'has_next': page_obj.has_next(),
                'has_previous': page_obj.has_previous(),
            },
            'search_query': search or None,
        })


class PublicProductDetailView(APIView):
    """GET /api/store/{slug}/product/{display_id}/"""
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request, slug, display_id):
        try:
            shop = Shop.objects.get(slug=slug)
            product = Product.objects.select_related('category').get(shop=shop, display_id=display_id)
        except (Shop.DoesNotExist, Product.DoesNotExist):
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        return Response({
            'product': ProductPublicSerializer(product).data,
            'shop': {
                'name': shop.name,
                'slug': shop.slug,
                'phone': shop.phone,
                'whatsapp_number': shop.whatsapp_number,
                'logo_url': shop.logo_url,
            }
        })


# ─── OG Preview Views (WhatsApp / Telegram / Twitter) ─────────────────────────

from django.http import HttpResponse
from django.utils.html import escape


def og_store_view(request, slug):
    """GET /og/store/{slug}/ — OG meta tags for store link previews"""
    try:
        shop = Shop.objects.get(slug=slug)
    except Shop.DoesNotExist:
        return HttpResponse("<html><body>Not found</body></html>", status=404)

    real_url = f"{settings.FRONTEND_URL}/{slug}"
    image_url = shop.logo_url or f"{settings.FRONTEND_URL}/logo2.png"
    title = escape(f"{shop.name} — Browse our products")
    description = escape(
        f"Browse {shop.name}'s product catalogue on ZeleraDeck. "
        f"Order directly on WhatsApp."
    )

    html = f"""<!DOCTYPE html>
<html prefix="og: http://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <title>{title}</title>
  <meta name="description" content="{description}">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{description}">
  <meta property="og:image" content="{escape(image_url)}">
  <meta property="og:image:width" content="400">
  <meta property="og:image:height" content="400">
  <meta property="og:url" content="{real_url}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="ZeleraDeck">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{title}">
  <meta name="twitter:description" content="{description}">
  <meta name="twitter:image" content="{escape(image_url)}">
  <meta http-equiv="refresh" content="0;url={real_url}">
</head>
<body>
  <p>Redirecting to <a href="{real_url}">{escape(shop.name)}</a>...</p>
</body>
</html>"""
    return HttpResponse(html, content_type="text/html")


def og_product_view(request, slug, display_id):
    """GET /og/store/{slug}/product/{display_id}/ — OG meta tags for product link previews"""
    try:
        shop = Shop.objects.get(slug=slug)
        product = Product.objects.get(shop=shop, display_id=display_id)
    except (Shop.DoesNotExist, Product.DoesNotExist):
        return HttpResponse("<html><body>Not found</body></html>", status=404)

    real_url = f"{settings.FRONTEND_URL}/{slug}/product/{display_id}"
    image_url = product.image_url or shop.logo_url or f"{settings.FRONTEND_URL}/logo2.png"
    title = escape(f"{product.name} — ₹{product.price}")
    description = escape(
        f"Order {product.name} from {shop.name} on WhatsApp. ID: {product.display_id}"
    )

    html = f"""<!DOCTYPE html>
<html prefix="og: http://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <title>{title}</title>
  <meta name="description" content="{description}">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{description}">
  <meta property="og:image" content="{escape(image_url)}">
  <meta property="og:image:width" content="600">
  <meta property="og:image:height" content="600">
  <meta property="og:url" content="{real_url}">
  <meta property="og:type" content="product">
  <meta property="og:site_name" content="{escape(shop.name)} on ZeleraDeck">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{title}">
  <meta name="twitter:description" content="{description}">
  <meta name="twitter:image" content="{escape(image_url)}">
  <meta http-equiv="refresh" content="0;url={real_url}">
</head>
<body>
  <p>Redirecting to <a href="{real_url}">{escape(product.name)}</a>...</p>
</body>
</html>"""
    return HttpResponse(html, content_type="text/html")


# ─── Pro: Product Reorder ─────────────────────────────────────────────────────

class ReorderProductsView(APIView):
    """PATCH /api/shop/products/reorder/ — Pro only. Bulk-updates display_order."""
    authentication_classes = [ShopJWTAuthentication]

    def patch(self, request):
        shop = request.user
        guard = check_labella_write_guard(shop, "ReorderProductsView.patch")
        if guard:
            return guard

        if not shop.is_pro:
            return Response({'error': 'Product reordering is a Pro feature.'}, status=status.HTTP_403_FORBIDDEN)

        items = request.data.get('order', [])
        if not isinstance(items, list) or not items:
            return Response({'error': 'order must be a non-empty list.'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            for item in items:
                try:
                    Product.objects.filter(
                        id=item['id'], shop=shop
                    ).update(display_order=int(item['display_order']))
                except (KeyError, TypeError, ValueError):
                    return Response(
                        {'error': 'Each item must have id and display_order.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

        return Response({'success': True})
