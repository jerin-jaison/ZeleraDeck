"""
ZeleraDeck Pro Admin — Authenticated Write Views
Authentication: ShopJWTAuthentication (reuses existing JWT system)
Scope guard: every view verifies request.user.is_pro == True
             and that all data belongs to request.user's shop only.

La Bella Write-Protection
--------------------------
Every write method also calls check_labella_write_guard() as an independent,
hardcoded second layer of protection. This guard operates separately from the
owner-scoping/JWT checks and cannot be bypassed from the frontend or request
payload. See pro/safety.py for full documentation.

DO NOT remove the guard calls without explicit written instruction from the
shop owner. They must remain active in all environments.
"""

import logging

from django.db import transaction
from django.core.paginator import Paginator
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from accounts.jwt_auth import ShopJWTAuthentication
from catalogue.models import Product, Category
from catalogue.cloudinary_utils import (
    upload_product_image, CloudinaryUploadError, delete_cloudinary_asset_by_url
)
from pro.models import ProAboutBlock, ProContactInfo, ProHeroSettings
from pro.admin_serializers import (
    ProAdminAboutBlockSerializer,
    ProAdminContactInfoSerializer,
    ProAdminProductSerializer,
    ProAdminCategorySerializer,
    ProAdminHeroSettingsSerializer,
)
from pro.safety import check_labella_write_guard

logger = logging.getLogger(__name__)

PAGE_SIZE = 24


def _require_pro(request):
    """Returns (shop, error_response). error_response is None on success."""
    shop = request.user
    if not shop.is_pro:
        return None, Response(
            {"error": "Pro mode is required."},
            status=status.HTTP_403_FORBIDDEN,
        )
    return shop, None


# ─── GET /api/pro/admin/products/ ─────────────────────────────────────────────

class ProAdminProductListView(APIView):
    """Paginated product list for the admin panel. Authenticated, Pro-gated. GET only (read)."""

    authentication_classes = [ShopJWTAuthentication]

    def get(self, request):
        shop, err = _require_pro(request)
        if err:
            return err

        qs = Product.objects.filter(shop=shop).select_related("category")

        # Filters
        search = request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(
                Q(name__icontains=search) | Q(display_id__icontains=search)
            )

        category_id = request.query_params.get("category", "").strip()
        if category_id:
            qs = qs.filter(category__id=category_id)

        in_stock = request.query_params.get("in_stock", "").strip().lower()
        if in_stock == "true":
            qs = qs.filter(is_in_stock=True)
        elif in_stock == "false":
            qs = qs.filter(is_in_stock=False)

        qs = qs.order_by("display_order", "-created_at")

        try:
            page_num = max(1, int(request.query_params.get("page", 1)))
        except ValueError:
            page_num = 1

        paginator = Paginator(qs, PAGE_SIZE)
        page = paginator.get_page(page_num)

        categories = Category.objects.filter(shop=shop).order_by("display_order", "name")

        return Response({
            "count": paginator.count,
            "num_pages": paginator.num_pages,
            "page": page_num,
            "results": ProAdminProductSerializer(page.object_list, many=True).data,
            "categories": ProAdminCategorySerializer(categories, many=True).data,
        })


# ─── DELETE /api/pro/admin/products/<display_id>/ ─────────────────────────────

class ProAdminProductDeleteView(APIView):
    """Delete a single product. Authenticated, Pro-gated, own-shop only."""

    authentication_classes = [ShopJWTAuthentication]

    def delete(self, request, display_id):
        # ── Layer 1: Pro + scope check ────────────────────────────────────────
        shop, err = _require_pro(request)
        if err:
            return err

        # ── Layer 2: La Bella permanent write-protection guard ────────────────
        guard = check_labella_write_guard(shop, "ProAdminProductDeleteView.delete")
        if guard:
            return guard

        try:
            product = Product.objects.get(shop=shop, display_id=display_id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

        # Collect media to clean up
        media_urls = [
            url for url in [
                product.image_url, product.image_url_2, product.image_url_3,
                product.image_url_4, product.video_url,
            ] if url
        ]

        product.delete()

        # Best-effort Cloudinary cleanup
        for url in media_urls:
            delete_cloudinary_asset_by_url(url)

        return Response(status=status.HTTP_204_NO_CONTENT)


# ─── GET /api/pro/admin/categories/ ───────────────────────────────────────────

class ProAdminCategoryListView(APIView):
    """
    GET  /api/pro/admin/categories/ — list all categories for the authenticated shop.
    POST /api/pro/admin/categories/ — create a new category for the authenticated shop.
    """

    authentication_classes = [ShopJWTAuthentication]

    def get(self, request):
        shop, err = _require_pro(request)
        if err:
            return err

        categories = Category.objects.filter(shop=shop).order_by("display_order", "name")
        return Response(ProAdminCategorySerializer(categories, many=True).data)

    def post(self, request):
        # ── Layer 1: Pro + scope check ────────────────────────────────────────
        shop, err = _require_pro(request)
        if err:
            return err

        # ── Layer 2: La Bella permanent write-protection guard ────────────────
        guard = check_labella_write_guard(shop, "ProAdminCategoryListView.post")
        if guard:
            return guard

        name = request.data.get("name", "").strip()
        if not name:
            return Response({"error": "Category name is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Check for duplicate (case-insensitive)
        if Category.objects.filter(shop=shop, name__iexact=name).exists():
            return Response({"error": "Category already exists."}, status=status.HTTP_400_BAD_REQUEST)

        image_url = None
        image_file = request.FILES.get("image")
        if image_file:
            try:
                image_url = upload_product_image(image_file, shop.slug)
            except CloudinaryUploadError as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        category = Category.objects.create(shop=shop, name=name, image_url=image_url)
        return Response(
            ProAdminCategorySerializer(category).data,
            status=status.HTTP_201_CREATED,
        )



# ─── PATCH/DELETE /api/pro/admin/categories/<pk>/ ────────────────────────────

class ProAdminCategoryDetailView(APIView):
    """
    PATCH  /api/pro/admin/categories/<pk>/ — rename a category / update image.
    DELETE /api/pro/admin/categories/<pk>/ — delete a category;
           products in this category fall back to no-category (category=None).
    """

    authentication_classes = [ShopJWTAuthentication]

    def _get_category(self, pk, shop):
        try:
            return Category.objects.get(pk=pk, shop=shop), None
        except Category.DoesNotExist:
            return None, Response({"error": "Category not found."}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request, pk):
        # ── Layer 1: Pro + scope check ────────────────────────────────────────
        shop, err = _require_pro(request)
        if err:
            return err

        # ── Layer 2: La Bella permanent write-protection guard ────────────────
        guard = check_labella_write_guard(shop, "ProAdminCategoryDetailView.patch")
        if guard:
            return guard

        category, err = self._get_category(pk, shop)
        if err:
            return err

        name = request.data.get("name", "").strip() if "name" in request.data else category.name
        if not name:
            return Response({"error": "Category name is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Check duplicate (excluding self)
        if name != category.name and Category.objects.filter(shop=shop, name__iexact=name).exclude(pk=pk).exists():
            return Response({"error": "A category with this name already exists."}, status=status.HTTP_400_BAD_REQUEST)

        category.name = name

        image_file = request.FILES.get("image")
        if image_file:
            try:
                old_url = category.image_url
                new_url = upload_product_image(image_file, shop.slug)
                if old_url and old_url != new_url:
                    delete_cloudinary_asset_by_url(old_url)
                category.image_url = new_url
            except CloudinaryUploadError as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        if request.data.get("clear_image") == "true" and not image_file:
            if category.image_url:
                delete_cloudinary_asset_by_url(category.image_url)
            category.image_url = None

        category.save()
        return Response(ProAdminCategorySerializer(category).data)

    def delete(self, request, pk):
        # ── Layer 1: Pro + scope check ────────────────────────────────────────
        shop, err = _require_pro(request)
        if err:
            return err

        # ── Layer 2: La Bella permanent write-protection guard ────────────────
        guard = check_labella_write_guard(shop, "ProAdminCategoryDetailView.delete")
        if guard:
            return guard

        category, err = self._get_category(pk, shop)
        if err:
            return err

        old_url = category.image_url

        # Fall products back to no-category before deleting
        with transaction.atomic():
            Product.objects.filter(shop=shop, category=category).update(category=None)
            category.delete()

        if old_url:
            delete_cloudinary_asset_by_url(old_url)

        return Response(status=status.HTTP_204_NO_CONTENT)


# ─── GET /api/pro/admin/shop/ ─────────────────────────────────────────────────

class ProAdminShopInfoView(APIView):
    """Returns current shop info needed by the admin layout. GET only (read)."""

    authentication_classes = [ShopJWTAuthentication]

    def get(self, request):
        shop, err = _require_pro(request)
        if err:
            return err

        return Response({
            "name": shop.name,
            "slug": shop.slug,
            "logo_url": shop.logo_url,
            "whatsapp_number": shop.whatsapp_number,
            "is_pro": shop.is_pro,
        })


# ─── About Blocks ──────────────────────────────────────────────────────────────

class ProAdminAboutBlockListCreateView(APIView):
    """
    GET  /api/pro/admin/about/   — list all blocks, ordered by `order`.
    POST /api/pro/admin/about/   — create a new block.
    """

    authentication_classes = [ShopJWTAuthentication]

    def get(self, request):
        # GET is read-only — no guard needed
        shop, err = _require_pro(request)
        if err:
            return err

        blocks = ProAboutBlock.objects.filter(shop=shop).order_by("order", "created_at")
        return Response(ProAdminAboutBlockSerializer(blocks, many=True).data)

    def post(self, request):
        # ── Layer 1: Pro + scope check ────────────────────────────────────────
        shop, err = _require_pro(request)
        if err:
            return err

        # ── Layer 2: La Bella permanent write-protection guard ────────────────
        guard = check_labella_write_guard(shop, "ProAdminAboutBlockListCreateView.post")
        if guard:
            return guard

        serializer = ProAdminAboutBlockSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Handle image upload if file provided
        image_url = None
        image_file = request.FILES.get("image")
        if image_file:
            try:
                image_url = upload_product_image(image_file, shop.slug)
            except CloudinaryUploadError as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        block = ProAboutBlock.objects.create(
            shop=shop,
            heading=serializer.validated_data["heading"],
            body=serializer.validated_data["body"],
            image_url=image_url or serializer.validated_data.get("image_url", ""),
            order=serializer.validated_data.get("order", 0),
        )

        return Response(
            ProAdminAboutBlockSerializer(block).data,
            status=status.HTTP_201_CREATED,
        )


class ProAdminAboutBlockDetailView(APIView):
    """
    PATCH  /api/pro/admin/about/<id>/ — update heading/body/image/order.
    DELETE /api/pro/admin/about/<id>/ — delete block.
    """

    authentication_classes = [ShopJWTAuthentication]

    def _get_block(self, pk, shop):
        try:
            block = ProAboutBlock.objects.get(pk=pk, shop=shop)
        except ProAboutBlock.DoesNotExist:
            return None, Response({"error": "Block not found."}, status=status.HTTP_404_NOT_FOUND)
        return block, None

    def patch(self, request, pk):
        # ── Layer 1: Pro + scope check ────────────────────────────────────────
        shop, err = _require_pro(request)
        if err:
            return err

        # ── Layer 2: La Bella permanent write-protection guard ────────────────
        guard = check_labella_write_guard(shop, "ProAdminAboutBlockDetailView.patch")
        if guard:
            return guard

        block, err = self._get_block(pk, shop)
        if err:
            return err

        serializer = ProAdminAboutBlockSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Handle image upload
        image_file = request.FILES.get("image")
        if image_file:
            try:
                old_url = block.image_url
                new_url = upload_product_image(image_file, shop.slug)
                if old_url and old_url != new_url:
                    delete_cloudinary_asset_by_url(old_url)
                block.image_url = new_url
            except CloudinaryUploadError as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        for field, value in serializer.validated_data.items():
            if field != "image_url" or not image_file:  # don't double-set image_url if file given
                setattr(block, field, value)

        block.save()
        return Response(ProAdminAboutBlockSerializer(block).data)

    def delete(self, request, pk):
        # ── Layer 1: Pro + scope check ────────────────────────────────────────
        shop, err = _require_pro(request)
        if err:
            return err

        # ── Layer 2: La Bella permanent write-protection guard ────────────────
        guard = check_labella_write_guard(shop, "ProAdminAboutBlockDetailView.delete")
        if guard:
            return guard

        block, err = self._get_block(pk, shop)
        if err:
            return err

        old_image_url = block.image_url
        block.delete()

        if old_image_url:
            delete_cloudinary_asset_by_url(old_image_url)

        return Response(status=status.HTTP_204_NO_CONTENT)


class ProAdminAboutBlockReorderView(APIView):
    """
    POST /api/pro/admin/about/reorder/
    Body: { "order": [{"id": "...", "order": 0}, ...] }
    """

    authentication_classes = [ShopJWTAuthentication]

    def post(self, request):
        # ── Layer 1: Pro + scope check ────────────────────────────────────────
        shop, err = _require_pro(request)
        if err:
            return err

        # ── Layer 2: La Bella permanent write-protection guard ────────────────
        guard = check_labella_write_guard(shop, "ProAdminAboutBlockReorderView.post")
        if guard:
            return guard

        items = request.data.get("order", [])
        if not isinstance(items, list):
            return Response({"error": "order must be a list."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            for item in items:
                try:
                    ProAboutBlock.objects.filter(
                        id=item["id"], shop=shop
                    ).update(order=int(item["order"]))
                except (KeyError, TypeError, ValueError):
                    return Response(
                        {"error": "Each item needs id and order."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

        return Response({"success": True})


# ─── Contact Info ──────────────────────────────────────────────────────────────

class ProAdminContactInfoView(APIView):
    """
    GET   /api/pro/admin/contact/ — get (or create default) contact info.
    PATCH /api/pro/admin/contact/ — update contact info.
    """

    authentication_classes = [ShopJWTAuthentication]

    def _get_or_create(self, shop):
        obj, _ = ProContactInfo.objects.get_or_create(shop=shop)
        return obj

    def get(self, request):
        # GET is read-only — no guard needed
        shop, err = _require_pro(request)
        if err:
            return err

        contact = self._get_or_create(shop)
        return Response(ProAdminContactInfoSerializer(contact).data)

    def patch(self, request):
        # ── Layer 1: Pro + scope check ────────────────────────────────────────
        shop, err = _require_pro(request)
        if err:
            return err

        # ── Layer 2: La Bella permanent write-protection guard ────────────────
        guard = check_labella_write_guard(shop, "ProAdminContactInfoView.patch")
        if guard:
            return guard

        contact = self._get_or_create(shop)
        serializer = ProAdminContactInfoSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        for field, value in serializer.validated_data.items():
            setattr(contact, field, value)

        contact.save()
        return Response(ProAdminContactInfoSerializer(contact).data)


# ─── Hero Settings ─────────────────────────────────────────────────────────────

class ProAdminHeroSettingsView(APIView):
    """
    GET   /api/pro/admin/hero/ — get (or create default) hero settings.
    PATCH /api/pro/admin/hero/ — update hero settings (headline, subheading, image).
    """

    authentication_classes = [ShopJWTAuthentication]

    def _get_or_create(self, shop):
        obj, _ = ProHeroSettings.objects.get_or_create(shop=shop)
        return obj

    def get(self, request):
        shop, err = _require_pro(request)
        if err:
            return err

        hero = self._get_or_create(shop)
        return Response(ProAdminHeroSettingsSerializer(hero).data)

    def patch(self, request):
        # ── Layer 1: Pro + scope check ────────────────────────────────────────
        shop, err = _require_pro(request)
        if err:
            return err

        # ── Layer 2: La Bella permanent write-protection guard ────────────────
        guard = check_labella_write_guard(shop, "ProAdminHeroSettingsView.patch")
        if guard:
            return guard

        hero = self._get_or_create(shop)

        # Handle desktop image upload
        image_file = request.FILES.get("image")
        if image_file:
            try:
                old_url = hero.hero_image_url
                new_url = upload_product_image(image_file, shop.slug)
                if old_url and old_url != new_url:
                    delete_cloudinary_asset_by_url(old_url)
                hero.hero_image_url = new_url
            except CloudinaryUploadError as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Handle mobile image upload
        mobile_image_file = request.FILES.get("mobile_image")
        if mobile_image_file:
            try:
                old_mobile_url = hero.hero_mobile_image_url
                new_mobile_url = upload_product_image(mobile_image_file, shop.slug)
                if old_mobile_url and old_mobile_url != new_mobile_url:
                    delete_cloudinary_asset_by_url(old_mobile_url)
                hero.hero_mobile_image_url = new_mobile_url
            except CloudinaryUploadError as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Update text fields from request data
        if "hero_headline" in request.data:
            hero.hero_headline = request.data["hero_headline"]
        if "hero_subheading" in request.data:
            hero.hero_subheading = request.data["hero_subheading"]

        # Allow clearing the desktop image
        if request.data.get("clear_image") == "true" and not image_file:
            if hero.hero_image_url:
                delete_cloudinary_asset_by_url(hero.hero_image_url)
            hero.hero_image_url = ""

        # Allow clearing the mobile image
        if request.data.get("clear_mobile_image") == "true" and not mobile_image_file:
            if hero.hero_mobile_image_url:
                delete_cloudinary_asset_by_url(hero.hero_mobile_image_url)
            hero.hero_mobile_image_url = ""

        hero.save()
        return Response(ProAdminHeroSettingsSerializer(hero).data)


# ─── POST /api/pro/admin/categories/reorder/ ─────────────────────────

class ProAdminCategoryReorderView(APIView):
    """
    POST /api/pro/admin/categories/reorder/
    Body: { "order": [{"id": "...", "display_order": 0}, ...] }
    """

    authentication_classes = [ShopJWTAuthentication]

    def post(self, request):
        shop, err = _require_pro(request)
        if err:
            return err

        guard = check_labella_write_guard(shop, "ProAdminCategoryReorderView.post")
        if guard:
            return guard

        items = request.data.get("order", [])
        if not isinstance(items, list):
            return Response({"error": "order must be a list."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            for idx, item in enumerate(items):
                try:
                    cat_id = item.get("id") if isinstance(item, dict) else str(item)
                    order_val = item.get("display_order", item.get("order", idx)) if isinstance(item, dict) else idx
                    Category.objects.filter(id=cat_id, shop=shop).update(display_order=int(order_val))
                except (KeyError, TypeError, ValueError):
                    pass

        return Response({"success": True})
