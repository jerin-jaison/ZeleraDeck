"""
ZeleraDeck — URL Configuration
Phase 2: All API routes registered.
"""

from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def health_check(request):
    """Phase 1 — Link verification endpoint."""
    return JsonResponse({"status": "ok"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health_check, name="health-check"),
    path("api/auth/", include("accounts.urls")),
    path("api/admin/", include("accounts.admin_urls")),
    path("api/shop/", include("catalogue.shop_urls")),
    path("api/store/", include("catalogue.public_urls")),
]
