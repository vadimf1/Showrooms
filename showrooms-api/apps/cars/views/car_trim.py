from rest_framework.viewsets import ModelViewSet
from apps.cars.models import CarTrim
from apps.cars.serializers.car_trim import CarTrimSerializer

class CarTrimViewSet(ModelViewSet):
    queryset = CarTrim.objects.select_related('car_model').order_by('car_model__make', 'car_model__model', 'year')
    serializer_class = CarTrimSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        car_model_id = self.request.query_params.get('car_model_id')
        if car_model_id:
            qs = qs.filter(car_model_id=car_model_id)
        return qs
