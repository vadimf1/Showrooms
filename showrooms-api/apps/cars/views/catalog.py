from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet

from apps.cars.serializers.catalog import CarCatalogSerializer
from apps.cars.services.catalog_service import CatalogService

FILTER_PARAMS = (
    'search',
    'make',
    'city',
    'price_min',
    'price_max',
    'year_min',
    'year_max',
    'vehicle_style',
    'engine_fuel_type',
    'transmission_type',
    'driven_wheels',
    'ordering',
)

class CarCatalogViewSet(GenericViewSet):
    serializer_class = CarCatalogSerializer

    def list(self, request):
        filters = {
            key: request.query_params.get(key)
            for key in FILTER_PARAMS
            if request.query_params.get(key)
        }

        catalog = CatalogService.get_catalog(filters)

        page = self.paginate_queryset(catalog)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(catalog, many=True)
        return Response(serializer.data)
