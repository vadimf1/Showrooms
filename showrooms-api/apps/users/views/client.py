from django.db.models import Q
from rest_framework.viewsets import ModelViewSet
from apps.users.models.client import Client
from apps.users.serializers.client import ClientSerializer, ClientListSerializer

class ClientViewSet(ModelViewSet):
    def get_queryset(self):
        qs = Client.objects.select_related('user', 'address')
        search = self.request.query_params.get('search', '').strip()
        if search:
            for token in search.split():
                qs = qs.filter(
                    Q(first_name__icontains=token) |
                    Q(last_name__icontains=token) |
                    Q(user__username__icontains=token)
                )
        return qs

    def get_serializer_class(self):
        if self.action == 'list':
            return ClientListSerializer
        return ClientSerializer
