from django.contrib.auth.hashers import make_password
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

        # Look up by phone regardless of is_active first, to give correct error
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

        if not shop.is_active:
            return Response(
                {'error': 'Your store has been deactivated. Contact support.'},
                status=status.HTTP_403_FORBIDDEN
            )

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
            whatsapp_number=data['whatsapp_number'],
            password=make_password(data['password']),
        )
        shop.save()  # slug auto-generated inside model.save()

        return Response({
            'shop_id': str(shop.id),
            'name': shop.name,
            'slug': shop.slug,
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
        return Response({'message': 'Password updated successfully'})
