from django.core.paginator import Paginator
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
from catalogue.cloudinary_utils import upload_product_image, CloudinaryUploadError


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

        category = Category.objects.create(shop=request.user, name=name)
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
        category, err = self._get_category(pk, request.user)
        if err:
            return err

        serializer = CategoryCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        name = serializer.validated_data['name']

        # Check for duplicate (case-insensitive, excluding self)
        if Category.objects.filter(
            shop=request.user, name__iexact=name
        ).exclude(pk=category.pk).exists():
            return Response(
                {'error': 'Category already exists.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        category.name = name
        category.save()
        return Response(CategorySerializer(category).data)

    def delete(self, request, pk):
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
        products = Product.objects.filter(shop=request.user).select_related('category').order_by('-created_at')

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
        # Pre-process category_id (multipart/form-data sends strings)
        raw_category_id = request.data.get('category_id', None)
        mutable_data = request.data.copy()
        mutable_data.pop('category_id', None)

        serializer = ProductCreateSerializer(data=mutable_data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        shop = request.user

        # Read image directly from FILES to bypass ImageField extension validation
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
        if raw_category_id and raw_category_id != 'null':
            try:
                category = Category.objects.get(id=raw_category_id, shop=shop)
            except (Category.DoesNotExist, ValueError):
                pass  # silently ignore invalid category

        product = Product.objects.create(
            shop=shop,
            name=data['name'],
            price=data['price'],
            description=data.get('description', ''),
            image_url=image_url,
            is_in_stock=data.get('is_in_stock', True),
            category=category,
        )

        return Response(ProductSerializer(product).data, status=status.HTTP_201_CREATED)


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

        # Handle category_id
        if has_category_update:
            if not raw_category_id or raw_category_id == 'null':
                product.category = None
            else:
                try:
                    product.category = Category.objects.get(id=raw_category_id, shop=request.user)
                except (Category.DoesNotExist, ValueError):
                    pass  # silently ignore invalid category

        # Read image directly from FILES to bypass ImageField extension validation
        image_file = request.FILES.get('image')
        if image_file:
            try:
                data['image_url'] = upload_product_image(image_file, request.user.slug)
            except CloudinaryUploadError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        for field, value in data.items():
            setattr(product, field, value)
        product.save()

        return Response(ProductSerializer(product).data)

    def delete(self, request, pk):
        product, err = self._get_product(pk, request.user)
        if err:
            return err

        product.delete()
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

        # Base queryset: in-stock first, then out-of-stock, newest first
        from django.db.models import Case, When, BooleanField
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
