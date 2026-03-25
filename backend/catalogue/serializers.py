from rest_framework import serializers
from catalogue.models import Product


class ProductSerializer(serializers.ModelSerializer):
    """Full product serializer — used by shop owner dashboard."""
    class Meta:
        model = Product
        fields = [
            'id', 'display_id', 'name', 'price', 'description',
            'image_url', 'is_in_stock', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'display_id', 'created_at', 'updated_at']


class ProductCreateSerializer(serializers.Serializer):
    """Used for POST /shop/products/ — image is uploaded as a file."""
    name = serializers.CharField(max_length=100)
    price = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0)
    description = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    # image omitted — read directly from request.FILES in the view to avoid
    # ImageField extension validation rejecting browser-compressed blobs
    is_in_stock = serializers.BooleanField(required=False, default=True)


class ProductUpdateSerializer(serializers.Serializer):
    """Used for PATCH /shop/products/:id — all fields optional."""
    name = serializers.CharField(max_length=100, required=False)
    price = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0, required=False)
    description = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    # image omitted — read directly from request.FILES in the view
    is_in_stock = serializers.BooleanField(required=False)


class ProductPublicSerializer(serializers.ModelSerializer):
    """Public-safe product serializer — no internal UUIDs exposed."""
    class Meta:
        model = Product
        fields = ['display_id', 'name', 'price', 'description', 'image_url', 'is_in_stock']
