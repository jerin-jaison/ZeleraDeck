"""
ZeleraDeck Pro Admin — Serializers
Used exclusively by the authenticated admin views.
"""

from rest_framework import serializers
from catalogue.models import Product, Category
from pro.models import ProAboutBlock, ProContactInfo, ProHeroSettings


class ProAdminCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "image_url"]


class ProAdminProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", allow_null=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "display_id",
            "name",
            "price",
            "description",
            "image_url",
            "image_url_2",
            "image_url_3",
            "image_url_4",
            "video_url",
            "is_in_stock",
            "display_order",
            "discount_percent",
            "size_scheme",
            "available_sizes",
            "available_colors",
            "category",
            "category_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "display_id", "created_at", "updated_at"]


class ProAdminAboutBlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProAboutBlock
        fields = ["id", "heading", "body", "image_url", "order", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class ProAdminContactInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProContactInfo
        fields = [
            "id",
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
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class ProAdminHeroSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProHeroSettings
        fields = ["id", "hero_image_url", "hero_headline", "hero_subheading", "updated_at"]
        read_only_fields = ["id", "updated_at"]
