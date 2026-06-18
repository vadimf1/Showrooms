from rest_framework import serializers
from apps.cars.models import CarModel

class CarModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarModel
        fields = ['id', 'make', 'model']