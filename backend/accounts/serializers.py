from django.utils import timezone
from rest_framework import serializers
from accounts.models import Shop


class LoginSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=15)
    password = serializers.CharField(write_only=True)


class ShopSerializer(serializers.ModelSerializer):
    whatsapp_number = serializers.SerializerMethodField()

    class Meta:
        model = Shop
        fields = ['id', 'name', 'slug', 'phone', 'whatsapp_number', 'is_active', 'logo_url', 'created_at']

    def get_whatsapp_number(self, obj):
        return obj.whatsapp_number


class ShopCreateSerializer(serializers.Serializer):
    """Used by admin to create new shops. Phone is used for both login AND WhatsApp."""
    name = serializers.CharField(max_length=200)
    phone = serializers.CharField(max_length=15)
    password = serializers.CharField(write_only=True, min_length=6)
    # logo is intentionally excluded — read directly from request.FILES in the view
    # to avoid ImageField extension validation failing on browser-compressed blobs


class ShopAdminListSerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()
    is_expiring_soon = serializers.SerializerMethodField()
    whatsapp_number = serializers.SerializerMethodField()

    class Meta:
        model = Shop
        fields = [
            'id', 'name', 'slug', 'phone', 'whatsapp_number', 'logo_url',
            'is_active', 'product_count', 'created_at',
            'expires_at', 'admin_notes', 'last_login', 'is_expiring_soon',
        ]

    def get_product_count(self, obj):
        return obj.products.count()

    def get_whatsapp_number(self, obj):
        return obj.whatsapp_number

    def get_is_expiring_soon(self, obj):
        if not obj.expires_at:
            return False
        now = timezone.now()
        return obj.expires_at > now and obj.expires_at <= now + timezone.timedelta(days=7)


class ShopPublicSerializer(serializers.ModelSerializer):
    """Used by public store page — no internal fields exposed."""
    whatsapp_number = serializers.SerializerMethodField()

    class Meta:
        model = Shop
        fields = ['name', 'slug', 'phone', 'whatsapp_number', 'logo_url']

    def get_whatsapp_number(self, obj):
        return obj.whatsapp_number
