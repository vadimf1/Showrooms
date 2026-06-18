from django.db.models import Count, Q
from rest_framework.viewsets import ModelViewSet

from apps.dealerships.models import Dealer
from apps.dealerships.serializers.dealer import DealerSerializer

class DealerViewSet(ModelViewSet):
    serializer_class = DealerSerializer

    def get_queryset(self):
        qs = Dealer.objects.annotate(
            car_count=Count('car', distinct=True),
        ).select_related('address').all()

        search = self.request.query_params.get('search', '').strip()
        if search:
            for token in search.split():
                qs = qs.filter(
                    Q(name__icontains=token) |
                    Q(address__city__icontains=token) |
                    Q(address__country__icontains=token)
                )
        return qs
