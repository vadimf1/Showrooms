from .user import UserViewSet
from .client import ClientViewSet
from .employee import EmployeeViewSet
from .auth import AuthRegisterView, AuthLoginView, AuthLogoutView, AuthMeView, AuthTokenRefreshView
from .permissions import PermissionsView
from .account import (
    FavoritesView,
    FavoriteDetailView,
    TestDrivesView,
    TestDriveCancelView,
    PurchasesView,
    TelegramUnlinkView,
    TelegramLinkView,
)
