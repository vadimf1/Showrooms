from rest_framework import serializers
from apps.cars.models import CarTrimImage

class CarTrimImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarTrimImage
        fields = ['id', 'is_default', 'color_name', 'color_hex', 'image', 'order']

class CarTrimImageUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarTrimImage
        fields = ['id', 'trim', 'is_default', 'color_name', 'color_hex', 'image', 'order']
