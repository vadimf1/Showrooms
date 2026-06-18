from rest_framework import serializers
from apps.cars.models import CarTrim, CarModel
from apps.cars.serializers.car_model import CarModelSerializer

class CarTrimSerializer(serializers.ModelSerializer):
    car_model = CarModelSerializer(read_only=True)

    car_model_id = serializers.PrimaryKeyRelatedField(
        queryset=CarModel.objects.all(),
        source='car_model',
        write_only=True
    )

    class Meta:
        model = CarTrim
        fields = [
            'id',
            'car_model',
            'car_model_id',
            'name',
            'year',
            'engine_fuel_type',
            'engine_hp',
            'engine_cylinders',
            'transmission_type',
            'driven_wheels',
            'number_of_doors',
            'vehicle_style',
            'highway_mpg',
            'city_mpg',
            'created_at'
        ]