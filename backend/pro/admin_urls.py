"""
Pro admin API URL routes.
All views require ShopJWTAuthentication + is_pro.
"""

from django.urls import path
from pro.admin_views import (
    ProAdminShopInfoView,
    ProAdminProductListView,
    ProAdminProductDeleteView,
    ProAdminCategoryListView,
    ProAdminCategoryDetailView,
    ProAdminCategoryReorderView,
    ProAdminAboutBlockListCreateView,
    ProAdminAboutBlockDetailView,
    ProAdminAboutBlockReorderView,
    ProAdminContactInfoView,
    ProAdminHeroSettingsView,
)

urlpatterns = [
    # Shop info
    path("shop/", ProAdminShopInfoView.as_view(), name="pro-admin-shop"),

    # Products
    path("products/", ProAdminProductListView.as_view(), name="pro-admin-products"),
    path("products/<str:display_id>/", ProAdminProductDeleteView.as_view(), name="pro-admin-product-delete"),

    # Categories
    path("categories/", ProAdminCategoryListView.as_view(), name="pro-admin-categories"),
    path("categories/reorder/", ProAdminCategoryReorderView.as_view(), name="pro-admin-categories-reorder"),
    path("categories/<str:pk>/", ProAdminCategoryDetailView.as_view(), name="pro-admin-category-detail"),

    # About blocks
    path("about/", ProAdminAboutBlockListCreateView.as_view(), name="pro-admin-about"),
    path("about/reorder/", ProAdminAboutBlockReorderView.as_view(), name="pro-admin-about-reorder"),
    path("about/<str:pk>/", ProAdminAboutBlockDetailView.as_view(), name="pro-admin-about-detail"),

    # Contact info
    path("contact/", ProAdminContactInfoView.as_view(), name="pro-admin-contact"),

    # Hero settings
    path("hero/", ProAdminHeroSettingsView.as_view(), name="pro-admin-hero"),
]
