from django.urls import path
from rest_framework.routers import DefaultRouter

from apps.cars.views.car import CarViewSet
from apps.cars.views.car_image import CarImageViewSet
from apps.cars.views.car_model import CarModelViewSet
from apps.cars.views.car_trim import CarTrimViewSet
from apps.cars.views.catalog import CarCatalogViewSet
from apps.cars.views.recommendations import RecommendationsView, CatalogRecommendationsView

router = DefaultRouter()
router.register(r'car-trims', CarTrimViewSet, basename='car_trim')
router.register(r'car-models', CarModelViewSet, basename='car_model')
router.register(r'cars', CarViewSet, basename='car')
router.register(r'catalog', CarCatalogViewSet, basename='car-catalog')
router.register(r'images', CarImageViewSet, basename='car-images')

urlpatterns = router.urls + [
    path('recommendations/', RecommendationsView.as_view(), name='recommendations'),
    path('recommendations/catalog/', CatalogRecommendationsView.as_view(), name='recommendations-catalog'),
]
