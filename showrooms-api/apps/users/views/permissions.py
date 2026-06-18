from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.users.jwt_authentication import JWTAuthentication as TokenAuthentication
from apps.core.models.enums import Role

class PermissionsView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = []

    def get(self, request):
        if not request.user or not hasattr(request.user, 'id'):
            return Response({'detail': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

        is_admin = request.user.role == Role.ADMIN

        return Response({
            'can_manage_employees': is_admin,
            'can_manage_showrooms': is_admin,
            'can_manage_dealers':   is_admin,
            'can_manage_cars':      is_admin,
            'can_manage_sales':     is_admin,
        })
