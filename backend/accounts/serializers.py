from django.utils import timezone
from rest_framework import serializers
from accounts.models import Shop


class LoginSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=15)
    password = serializers.CharField(write_only=True)


class ShopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shop
        fields = ['id', 'name', 'slug', 'phone', 'whatsapp_number', 'is_active', 'created_at']


class ShopCreateSerializer(serializers.Serializer):
    """Used by admin to create new shops."""
    name = serializers.CharField(max_length=200)
    phone = serializers.CharField(max_length=15)
    whatsapp_number = serializers.CharField(max_length=15)
    password = serializers.CharField(write_only=True, min_length=6)


class ShopAdminListSerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()
    is_expiring_soon = serializers.SerializerMethodField()

    class Meta:
        model = Shop
        fields = [
            'id', 'name', 'slug', 'phone', 'whatsapp_number',
            'is_active', 'product_count', 'created_at',
            'expires_at', 'admin_notes', 'last_login', 'is_expiring_soon',
        ]

    def get_product_count(self, obj):
        return obj.products.count()

    def get_is_expiring_soon(self, obj):
        if not obj.expires_at:
            return False
        now = timezone.now()
        return obj.expires_at > now and obj.expires_at <= now + timezone.timedelta(days=7)
