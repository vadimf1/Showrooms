from rest_framework.viewsets import ModelViewSet
from apps.core.models.address import Address
from apps.core.serializers.address import AddressSerializer

class AddressViewSet(ModelViewSet):
    queryset = Address.objects.all()
    serializer_class = AddressSerializer
