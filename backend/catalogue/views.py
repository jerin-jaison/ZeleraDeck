from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from accounts.models import Shop
from accounts.jwt_auth import ShopJWTAuthentication
from catalogue.models import Product
from catalogue.serializers import (
    ProductSerializer, ProductCreateSerializer,
    ProductUpdateSerializer, ProductPublicSerializer
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
            'public_url': f'https://zeleradeck.com/store/{shop.slug}',
        })


class ShopProductListCreateView(APIView):
    """GET + POST /api/shop/products/"""
    authentication_classes = [ShopJWTAuthentication]

    def get(self, request):
        products = Product.objects.filter(shop=request.user).order_by('-created_at')
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ProductCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        shop = request.user

        try:
            image_url = upload_product_image(data['image'], shop.slug)
        except CloudinaryUploadError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        product = Product.objects.create(
            shop=shop,
            name=data['name'],
            price=data['price'],
            description=data.get('description', ''),
            image_url=image_url,
            is_in_stock=data.get('is_in_stock', True),
        )

        return Response(ProductSerializer(product).data, status=status.HTTP_201_CREATED)


class ShopProductDetailView(APIView):
    """PATCH + DELETE /api/shop/products/{id}/"""
    authentication_classes = [ShopJWTAuthentication]

    def _get_product(self, pk, shop):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return None, Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        if product.shop_id != shop.id:
            return None, Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        return product, None

    def patch(self, request, pk):
        product, err = self._get_product(pk, request.user)
        if err:
            return err

        serializer = ProductUpdateSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data

        if 'image' in data:
            try:
                data['image_url'] = upload_product_image(data.pop('image'), request.user.slug)
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

        # In-stock first, then out-of-stock, each group ordered newest first
        products = list(
            Product.objects.filter(shop=shop, is_in_stock=True).order_by('-created_at')
        ) + list(
            Product.objects.filter(shop=shop, is_in_stock=False).order_by('-created_at')
        )

        return Response({
            'is_active': True,
            'name': shop.name,
            'slug': shop.slug,
            'whatsapp_number': shop.whatsapp_number,
            'products': ProductPublicSerializer(products, many=True).data,
        })


class PublicProductDetailView(APIView):
    """GET /api/store/{slug}/product/{display_id}/"""
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request, slug, display_id):
        try:
            shop = Shop.objects.get(slug=slug)
            product = Product.objects.get(shop=shop, display_id=display_id)
        except (Shop.DoesNotExist, Product.DoesNotExist):
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        data = ProductPublicSerializer(product).data
        data['shop_name'] = shop.name
        data['whatsapp_number'] = shop.whatsapp_number
        return Response(data)
