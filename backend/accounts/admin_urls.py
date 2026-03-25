from django.urls import path
from accounts.views import (
    AdminShopListCreateView,
    AdminShopToggleView,
    AdminShopResetPasswordView,
)

urlpatterns = [
    path('shops/', AdminShopListCreateView.as_view(), name='admin-shops'),
    path('shops/<uuid:pk>/toggle/', AdminShopToggleView.as_view(), name='admin-shop-toggle'),
    path('shops/<uuid:pk>/reset-password/', AdminShopResetPasswordView.as_view(), name='admin-shop-reset-password'),
]
