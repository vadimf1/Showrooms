from rest_framework.routers import DefaultRouter

from apps.dealerships.views.dealer import DealerViewSet
from apps.dealerships.views.showroom import ShowroomViewSet

router = DefaultRouter()
router.register(r'showrooms', ShowroomViewSet, basename='showroom')
router.register(r'dealers', DealerViewSet, basename='dealer')

urlpatterns = router.urls
