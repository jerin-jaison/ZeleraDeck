from django.urls import path
from catalogue.views import DirectoryView, PublicStoreView, PublicProductDetailView

urlpatterns = [
    path('directory/', DirectoryView.as_view(), name='public-directory'),
    path('<slug:slug>/', PublicStoreView.as_view(), name='public-store'),
    path('<slug:slug>/product/<str:display_id>/', PublicProductDetailView.as_view(), name='public-product'),
]
