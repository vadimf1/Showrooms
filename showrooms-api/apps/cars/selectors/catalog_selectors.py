from django.db.models import Min, Count
from apps.cars.models import Car

def get_catalog_queryset():
    return (
        Car.objects
        .values(
            'trim__car_model__id',
            'trim__car_model__make',
            'trim__car_model__model',
        )
        .annotate(
            min_price=Min('sale_price'),
            cars_count=Count('id'),
        )
    )