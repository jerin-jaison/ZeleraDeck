"""
ZeleraDeck Pro Storefront — Serializers
Read-only. No new models created.
Extends the existing public serializers from `catalogue`.
"""

from rest_framework import serializers
from catalogue.models import Product, Category
from accounts.models import Shop
from pro.models import ProContactInfo, ProAboutBlock, ProHeroSettings


class ProShopSerializer(serializers.ModelSerializer):
    """Public shop info for the Pro storefront — no sensitive fields."""

    whatsapp_number = serializers.SerializerMethodField()

    class Meta:
        model = Shop
        fields = [
            "name",
            "slug",
            "logo_url",
            "whatsapp_number",
        ]

    def get_whatsapp_number(self, obj):
        return obj.whatsapp_number


class ProCategorySerializer(serializers.ModelSerializer):
    """Category with product count for the Pro filter panel."""

    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "image_url", "product_count"]

    def get_product_count(self, obj):
        return obj.products.filter(is_in_stock=True).count()


class ProProductSerializer(serializers.ModelSerializer):
    """
    Full Pro product serializer — exposes all 4 media fields.
    Used by list and detail views alike.
    """

    category_id = serializers.UUIDField(source="category.id", read_only=True, allow_null=True)
    category_name = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "display_id",
            "name",
            "price",
            "description",
            "image_url",
            "image_url_2",
            "image_url_3",
            "image_url_4",
            "video_url",
            "display_order",
            "is_in_stock",
            "discount_percent",
            "size_scheme",
            "available_sizes",
            "available_colors",
            "category_id",
            "category_name",
        ]

    def get_category_name(self, obj):
        return obj.category.name if obj.category else None


class ProProductCardSerializer(serializers.ModelSerializer):
    """
    Lightweight card serializer for list/grid views — omits description & specs.
    """

    category_name = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "display_id",
            "name",
            "price",
            "image_url",
            "image_url_2",
            "is_in_stock",
            "display_order",
            "discount_percent",
            "category_name",
        ]

    def get_category_name(self, obj):
        return obj.category.name if obj.category else None


class ProPublicContactInfoSerializer(serializers.ModelSerializer):
    """Public read-only contact info for the Pro storefront Contact page."""

    class Meta:
        model = ProContactInfo
        fields = [
            "address_line1",
            "address_line2",
            "city",
            "postal_code",
            "state",
            "country",
            "phone",
            "whatsapp_override",
            "email",
            "hours_mon",
            "hours_tue",
            "hours_wed",
            "hours_thu",
            "hours_fri",
            "hours_sat",
            "hours_sun",
            "google_maps_embed_url",
            "instagram_url",
            "facebook_url",
            "youtube_url",
        ]


class ProPublicAboutBlockSerializer(serializers.ModelSerializer):
    """Public read-only about block for the Pro storefront About page."""

    class Meta:
        model = ProAboutBlock
        fields = ["id", "heading", "body", "image_url", "order"]


class ProPublicHeroSettingsSerializer(serializers.ModelSerializer):
    """Public read-only hero settings for the Pro storefront Home page."""

    class Meta:
        model = ProHeroSettings
        fields = ["hero_image_url", "hero_headline", "hero_subheading"]
