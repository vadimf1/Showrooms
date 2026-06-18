from django.db.models import Q
from rest_framework import mixins, viewsets
from apps.sales.models import TestDrive
from apps.sales.serializers import TestDriveSerializer, TestDriveAdminSerializer
from apps.users.jwt_authentication import JWTAuthentication

class TestDriveViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    queryset = TestDrive.objects.select_related('showroom').order_by('-created_at')
    permission_classes = []
    authentication_classes = [JWTAuthentication]

    def get_serializer_class(self):
        if self.action == 'create':
            return TestDriveSerializer
        return TestDriveAdminSerializer

    def perform_create(self, serializer):
        user = self.request.user if hasattr(self.request.user, 'id') else None
        serializer.save(user=user)

    def get_queryset(self):
        qs = super().get_queryset()
        status = self.request.query_params.get('status')
        if status:
            qs = qs.filter(status=status)
        search = self.request.query_params.get('search', '').strip()
        if search:
            for token in search.split():
                qs = qs.filter(
                    Q(name__icontains=token) |
                    Q(phone__icontains=token) |
                    Q(car_model_info__icontains=token)
                )
        return qs
