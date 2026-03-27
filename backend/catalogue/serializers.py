from rest_framework import serializers
from catalogue.models import Product, Category


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'product_count', 'created_at']

    def get_product_count(self, obj):
        return obj.products.count()


class CategoryCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['name']

    def validate_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError(
                "Category name cannot be empty."
            )
        if len(value) > 80:
            raise serializers.ValidationError(
                "Category name must be 80 characters or less."
            )
        return value


class ProductSerializer(serializers.ModelSerializer):
    """Full product serializer — used by shop owner dashboard."""
    category = CategorySerializer(read_only=True)
    category_id = serializers.UUIDField(
        write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = Product
        fields = [
            'id', 'display_id', 'name', 'price', 'description',
            'image_url', 'is_in_stock', 'category', 'category_id',
            'created_at', 'updated_at'
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
    category_name = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['display_id', 'name', 'price', 'description', 'image_url', 'is_in_stock', 'category_name']

    def get_category_name(self, obj):
        return obj.category.name if obj.category else None
