from django.urls import path
from rest_framework.routers import DefaultRouter
from apps.users.views import (
    UserViewSet,
    ClientViewSet,
    EmployeeViewSet,
    AuthRegisterView,
    AuthLoginView,
    AuthLogoutView,
    AuthMeView,
    AuthTokenRefreshView,
    PermissionsView,
    FavoritesView,
    FavoriteDetailView,
    TestDrivesView,
    PurchasesView,
    TestDriveCancelView,
    TelegramUnlinkView,
    TelegramLinkView,
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'clients', ClientViewSet, basename='client')
router.register(r'employees', EmployeeViewSet, basename='employee')

urlpatterns = router.urls + [
    path('auth/register/', AuthRegisterView.as_view()),
    path('auth/login/', AuthLoginView.as_view()),
    path('auth/logout/', AuthLogoutView.as_view()),
    path('auth/me/', AuthMeView.as_view()),
    path('auth/token/refresh/', AuthTokenRefreshView.as_view()),
    path('auth/permissions/', PermissionsView.as_view()),
    path('account/favorites/', FavoritesView.as_view()),
    path('account/favorites/<uuid:car_model_id>/', FavoriteDetailView.as_view()),
    path('account/test-drives/', TestDrivesView.as_view()),
    path('account/test-drives/<uuid:pk>/cancel/', TestDriveCancelView.as_view()),
    path('account/purchases/', PurchasesView.as_view()),
    path('account/telegram/unlink/', TelegramUnlinkView.as_view()),
    path('account/telegram/link/', TelegramLinkView.as_view()),
]
