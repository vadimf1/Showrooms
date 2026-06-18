from django.db.models import Count, Q
from rest_framework.viewsets import ModelViewSet

from apps.dealerships.models import Showroom
from apps.dealerships.serializers import ShowroomSerializer

class ShowroomViewSet(ModelViewSet):
    serializer_class = ShowroomSerializer

    def get_queryset(self):
        qs = Showroom.objects.annotate(
            car_count=Count('car', distinct=True),
            dealer_count=Count('car__dealer', distinct=True),
        ).select_related('address').all()

        search = self.request.query_params.get('search', '').strip()
        if search:
            for token in search.split():
                qs = qs.filter(
                    Q(name__icontains=token) |
                    Q(address__city__icontains=token) |
                    Q(address__street__icontains=token) |
                    Q(address__country__icontains=token)
                )
        return qs
