"""
ZeleraDeck — URL Configuration
Phase 2: All API routes registered.
"""

from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

from catalogue.views import og_store_view, og_product_view
from config.seo_views import sitemap_stores_view


def health_check(request):
    """Phase 1 — Link verification endpoint."""
    return JsonResponse({"status": "ok"})


def site_status(request):
    """GET /api/status/ — public maintenance status check."""
    from django.core.cache import cache
    from accounts.site_settings import SiteSettings, STATUS_CACHE_KEY, STATUS_CACHE_TIMEOUT

    cached = cache.get(STATUS_CACHE_KEY)
    if cached is not None:
        return JsonResponse(cached)

    try:
        settings = SiteSettings.get()
        data = {
            "maintenance": settings.maintenance_mode,
            "message": settings.maintenance_message,
        }
        cache.set(STATUS_CACHE_KEY, data, STATUS_CACHE_TIMEOUT)
        return JsonResponse(data)
    except Exception:
        return JsonResponse({"maintenance": False, "message": ""})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health_check, name="health-check"),
    path("api/status/", site_status, name="site-status"),
    path("api/auth/", include("accounts.urls")),
    path("api/admin/", include("accounts.admin_urls")),
    path("api/shop/", include("catalogue.shop_urls")),
    path("api/store/", include("catalogue.public_urls")),
    # OG meta tag pages for WhatsApp / Telegram link previews
    path("og/store/<slug:slug>/", og_store_view, name="og-store"),
    path("og/store/<slug:slug>/product/<str:display_id>/", og_product_view, name="og-product"),
    # SEO — dynamic sitemap with all active store slugs
    path("sitemap-stores.xml", sitemap_stores_view, name="sitemap-stores"),
    # Pro storefront API — read-only, AllowAny, internal preview only
    path("api/pro/", include("pro.urls")),
]
