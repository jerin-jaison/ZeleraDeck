"""
ZeleraDeck Pro Storefront — URL Configuration
Public routes:  /api/pro/<slug>/...
Admin routes:   /api/pro/admin/...
"""

from django.urls import path, include
from pro.views import (
    ProStoreHomeView,
    ProCategoryListView,
    ProProductListView,
    ProProductDetailView,
    ProPublicContactInfoView,
    ProPublicAboutBlocksView,
)

urlpatterns = [
    # ── Admin (authenticated) ────────────────────────────────────────────
    path("admin/", include("pro.admin_urls")),

    # ── Public storefront ────────────────────────────────────────────────
    path("<slug:slug>/", ProStoreHomeView.as_view(), name="pro-store-home"),
    path("<slug:slug>/categories/", ProCategoryListView.as_view(), name="pro-categories"),
    path("<slug:slug>/products/", ProProductListView.as_view(), name="pro-products"),
    path(
        "<slug:slug>/products/<str:display_id>/",
        ProProductDetailView.as_view(),
        name="pro-product-detail",
    ),
    path("<slug:slug>/contact/", ProPublicContactInfoView.as_view(), name="pro-contact"),
    path("<slug:slug>/about/", ProPublicAboutBlocksView.as_view(), name="pro-about"),
]
