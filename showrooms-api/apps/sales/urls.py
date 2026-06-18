from django.urls import path
from rest_framework.routers import DefaultRouter
from apps.sales.views import SaleViewSet, TestDriveViewSet
from apps.sales.views.availability import AvailabilityView

router = DefaultRouter()
router.register(r'sales', SaleViewSet, basename='sale')
router.register(r'test-drive-requests', TestDriveViewSet, basename='test-drive-request')

urlpatterns = router.urls + [
    path('availability/', AvailabilityView.as_view()),
]
