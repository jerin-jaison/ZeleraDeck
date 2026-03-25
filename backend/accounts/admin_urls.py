from django.urls import path
from accounts.views import (
    AdminShopListCreateView,
    AdminShopToggleView,
    AdminShopResetPasswordView,
    AdminShopDeleteView,
    AdminShopEditView,
    AdminShopProductsView,
    AdminStatsView,
)

urlpatterns = [
    path('shops/', AdminShopListCreateView.as_view(), name='admin-shops'),
    path('shops/<uuid:pk>/toggle/', AdminShopToggleView.as_view(), name='admin-shop-toggle'),
    path('shops/<uuid:pk>/reset-password/', AdminShopResetPasswordView.as_view(), name='admin-shop-reset-password'),
    path('shops/<uuid:pk>/', AdminShopDeleteView.as_view(), name='admin-shop-delete'),
    path('shops/<uuid:pk>/edit/', AdminShopEditView.as_view(), name='admin-shop-edit'),
    path('shops/<uuid:pk>/products/', AdminShopProductsView.as_view(), name='admin-shop-products'),
    path('stats/', AdminStatsView.as_view(), name='admin-stats'),
]
