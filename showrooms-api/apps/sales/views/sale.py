from rest_framework.viewsets import ModelViewSet
from apps.sales.models.sale import Sale
from apps.sales.serializers.sale import SaleSerializer, SaleListSerializer

class SaleViewSet(ModelViewSet):
    queryset = Sale.objects.select_related(
        'showroom', 'showroom__address',
        'client',
        'car', 'car__trim', 'car__trim__car_model',
        'employee',
    )

    def get_serializer_class(self):
        if self.action == 'list':
            return SaleListSerializer
        return SaleSerializer
