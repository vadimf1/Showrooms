from django.urls import path
from rest_framework.routers import DefaultRouter
from apps.core.views.address import AddressViewSet
from apps.core.views.dashboard import DashboardView

router = DefaultRouter()
router.register(r'addresses', AddressViewSet, basename='address')

urlpatterns = router.urls + [
    path('admin/dashboard/', DashboardView.as_view()),
]
