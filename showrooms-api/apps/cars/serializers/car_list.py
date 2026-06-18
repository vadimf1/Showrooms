from rest_framework import serializers
from apps.cars.models import Car

class CarListSerializer(serializers.ModelSerializer):
    make = serializers.CharField(
        source='trim.car_model.make',
        read_only=True
    )
    model = serializers.CharField(
        source='trim.car_model.model',
        read_only=True
    )
    city = serializers.CharField(
        source='showroom.address.city',
        read_only=True
    )

    class Meta:
        model = Car
        fields = [
            'id',
            'make',
            'model',
            'sale_price',
            'city',
        ]
