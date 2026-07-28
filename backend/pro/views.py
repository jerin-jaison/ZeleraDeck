"""
ZeleraDeck Pro Storefront — Views
All views are read-only (GET only) and public (AllowAny).
No new models. No writes. Queries the existing catalogue + accounts models.
"""

import logging

from django.db.models import Q
from django.core.paginator import Paginator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from accounts.models import Shop
from catalogue.models import Product, Category
from pro.serializers import (
    ProShopSerializer,
    ProCategorySerializer,
    ProProductSerializer,
    ProProductCardSerializer,
    ProPublicContactInfoSerializer,
    ProPublicAboutBlockSerializer,
    ProPublicHeroSettingsSerializer,
)

logger = logging.getLogger(__name__)

PAGE_SIZE = 24


def _get_pro_shop(slug):
    """
    Helper: resolve a shop by slug and verify it has an active Pro subscription.
    Returns (shop, error_response). One of them will be None.
    """
    try:
        shop = Shop.objects.get(slug=slug, is_active=True)
    except Shop.DoesNotExist:
        return None, Response({"error": "Store not found."}, status=status.HTTP_404_NOT_FOUND)

    if not shop.is_pro:
        return None, Response(
            {"error": "This store is not available on Pro."},
            status=status.HTTP_404_NOT_FOUND,
        )

    return shop, None


# ─── GET /api/pro/<slug>/ — Home page data ─────────────────────────────────────

class ProStoreHomeView(APIView):
    """
    Returns shop info, categories, featured products (top 8 by display_order / recency),
    and the full product count.
    """

    permission_classes = [AllowAny]

    def get(self, request, slug):
        shop, err = _get_pro_shop(slug)
        if err:
            return err

        categories = Category.objects.filter(shop=shop).order_by("name")
        all_products = Product.objects.filter(shop=shop, is_in_stock=True)

        # Featured = lowest display_order first (admins set this), then newest
        featured = all_products.order_by("display_order", "-created_at")[:8]

        # Hero settings (get_or_create so missing row returns safe empty defaults)
        from pro.models import ProHeroSettings
        hero, _ = ProHeroSettings.objects.get_or_create(shop=shop)

        return Response(
            {
                "shop": ProShopSerializer(shop).data,
                "categories": ProCategorySerializer(categories, many=True).data,
                "featured_products": ProProductCardSerializer(featured, many=True).data,
                "total_products": all_products.count(),
                "hero": ProPublicHeroSettingsSerializer(hero).data,
            }
        )


# ─── GET /api/pro/<slug>/categories/ ──────────────────────────────────────────

class ProCategoryListView(APIView):
    """Returns all categories for the shop — used by the filter panel."""

    permission_classes = [AllowAny]

    def get(self, request, slug):
        shop, err = _get_pro_shop(slug)
        if err:
            return err

        categories = Category.objects.filter(shop=shop).order_by("name")
        return Response(ProCategorySerializer(categories, many=True).data)


# ─── GET /api/pro/<slug>/products/ — Product listing ─────────────────────────

class ProProductListView(APIView):
    """
    Paginated product grid with optional search + filters.

    Query params:
      search        — name substring (case-insensitive)
      category      — category UUID
      min_price     — decimal
      max_price     — decimal
      in_stock      — "true" / "false" (default: no filter)
      sort          — "price_asc" | "price_desc" | "newest" | "oldest" | "display_order"
      page          — int (default 1)
    """

    permission_classes = [AllowAny]

    def get(self, request, slug):
        shop, err = _get_pro_shop(slug)
        if err:
            return err

        qs = Product.objects.filter(shop=shop)

        # ── Filters ─────────────────────────────────────────────────────────────
        search = request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )

        category_id = request.query_params.get("category", "").strip()
        if category_id:
            qs = qs.filter(category__id=category_id)

        min_price = request.query_params.get("min_price", "").strip()
        if min_price:
            try:
                qs = qs.filter(price__gte=float(min_price))
            except ValueError:
                pass

        max_price = request.query_params.get("max_price", "").strip()
        if max_price:
            try:
                qs = qs.filter(price__lte=float(max_price))
            except ValueError:
                pass

        in_stock = request.query_params.get("in_stock", "").strip().lower()
        if in_stock == "true":
            qs = qs.filter(is_in_stock=True)
        elif in_stock == "false":
            qs = qs.filter(is_in_stock=False)

        # ── Sorting ──────────────────────────────────────────────────────────────
        sort = request.query_params.get("sort", "display_order").strip()
        sort_map = {
            "price_asc": "price",
            "price_desc": "-price",
            "newest": "-created_at",
            "oldest": "created_at",
            "display_order": "display_order",
        }
        qs = qs.order_by(sort_map.get(sort, "display_order"), "-created_at")

        # ── Pagination ───────────────────────────────────────────────────────────
        try:
            page_num = max(1, int(request.query_params.get("page", 1)))
        except ValueError:
            page_num = 1

        paginator = Paginator(qs, PAGE_SIZE)
        page = paginator.get_page(page_num)

        return Response(
            {
                "count": paginator.count,
                "num_pages": paginator.num_pages,
                "page": page_num,
                "results": ProProductCardSerializer(page.object_list, many=True).data,
            }
        )


# ─── GET /api/pro/<slug>/products/<display_id>/ — Product detail ──────────────

class ProProductDetailView(APIView):
    """
    Returns full product data + up to 6 similar products from the same category.
    Also returns shop info (needed for the WhatsApp deep-link).
    """

    permission_classes = [AllowAny]

    def get(self, request, slug, display_id):
        shop, err = _get_pro_shop(slug)
        if err:
            return err

        try:
            product = Product.objects.get(shop=shop, display_id=display_id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

        # Similar products: same category, exclude this product, up to 6
        similar_qs = Product.objects.filter(shop=shop, is_in_stock=True).exclude(
            display_id=display_id
        )
        if product.category:
            similar_qs = similar_qs.filter(category=product.category)
        similar = similar_qs.order_by("display_order", "-created_at")[:6]

        return Response(
            {
                "shop": ProShopSerializer(shop).data,
                "product": ProProductSerializer(product).data,
                "similar_products": ProProductCardSerializer(similar, many=True).data,
            }
        )


# ─── GET /api/pro/<slug>/contact/ — Public contact info ──────────────────────────

class ProPublicContactInfoView(APIView):
    """
    Returns the shop's ProContactInfo record.
    If none has been saved yet, returns empty-string defaults so the
    frontend can display sensible fallback states rather than crashing.
    """

    permission_classes = [AllowAny]

    def get(self, request, slug):
        shop, err = _get_pro_shop(slug)
        if err:
            return err

        from pro.models import ProContactInfo
        contact, _ = ProContactInfo.objects.get_or_create(shop=shop)
        return Response(ProPublicContactInfoSerializer(contact).data)


# ─── GET /api/pro/<slug>/about/ — Public about blocks ───────────────────────────

class ProPublicAboutBlocksView(APIView):
    """
    Returns all ProAboutBlock records for the shop, ordered by `order`.
    Returns an empty list if none have been created yet.
    """

    permission_classes = [AllowAny]

    def get(self, request, slug):
        shop, err = _get_pro_shop(slug)
        if err:
            return err

        from pro.models import ProAboutBlock
        blocks = ProAboutBlock.objects.filter(shop=shop).order_by("order", "created_at")
        return Response(ProPublicAboutBlockSerializer(blocks, many=True).data)
