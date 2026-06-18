from rest_framework import serializers
from apps.cars.models import Car

class ShowroomPublicSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    name = serializers.CharField()
    city = serializers.SerializerMethodField()
    street = serializers.SerializerMethodField()

    def get_city(self, obj):
        return obj.address.city if obj.address else None

    def get_street(self, obj):
        return obj.address.street if obj.address else None

class CarPublicSerializer(serializers.ModelSerializer):
    showroom = ShowroomPublicSerializer(read_only=True)
    make = serializers.SerializerMethodField()
    model = serializers.SerializerMethodField()

    class Meta:
        model = Car
        fields = ['id', 'vin', 'color_name', 'color_hex', 'sale_price', 'mileage', 'showroom', 'make', 'model']

    def get_make(self, obj):
        return obj.trim.car_model.make

    def get_model(self, obj):
        return obj.trim.car_model.model
