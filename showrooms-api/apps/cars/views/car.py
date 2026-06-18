from django.db.models import Q
from rest_framework import filters
from rest_framework.viewsets import ModelViewSet

from apps.cars.models import Car
from apps.cars.serializers.car import CarSerializer
from apps.cars.serializers.car_public import CarPublicSerializer
from apps.cars.selectors.car_selectors import get_cars_queryset, filter_by_model

class CarViewSet(ModelViewSet):
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['sale_price', 'created_at', 'mileage', 'trim__year']
    ordering = ['-created_at']

    def get_queryset(self):
        if self.action == 'retrieve':
            return Car.objects.select_related('trim__car_model', 'showroom__address')

        queryset = get_cars_queryset()

        model_id = self.request.query_params.get('model_id')
        queryset = filter_by_model(queryset, model_id)

        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)

        search = self.request.query_params.get('search', '').strip()
        for token in search.split():
            queryset = queryset.filter(
                Q(trim__car_model__make__icontains=token) |
                Q(trim__car_model__model__icontains=token) |
                Q(trim__name__icontains=token) |
                Q(vin__icontains=token) |
                Q(color_name__icontains=token)
            )

        return queryset

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CarPublicSerializer
        return CarSerializer
