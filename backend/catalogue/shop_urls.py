from django.urls import path
from catalogue.views import (
    ShopMeView, ShopProductListCreateView, ShopProductDetailView,
    ShopCategoryListCreateView, ShopCategoryDetailView
)

urlpatterns = [
    path('me/', ShopMeView.as_view(), name='shop-me'),
    path('products/', ShopProductListCreateView.as_view(), name='shop-products'),
    path('products/<uuid:pk>/', ShopProductDetailView.as_view(), name='shop-product-detail'),
    path('categories/', ShopCategoryListCreateView.as_view(), name='shop-categories'),
    path('categories/<uuid:pk>/', ShopCategoryDetailView.as_view(), name='shop-category-detail'),
]
