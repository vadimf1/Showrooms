from apps.cars.models import Car

def get_cars_queryset():
    return (
        Car.objects
        .select_related(
            'trim',
            'trim__car_model',
            'showroom',
            'showroom__address',
            'dealer',
        )
    )

def filter_by_model(queryset, model_id):
    if model_id:
        queryset = queryset.filter(trim__car_model__id=model_id)
    return queryset