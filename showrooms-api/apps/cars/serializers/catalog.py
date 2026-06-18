from rest_framework import serializers

from apps.cars.serializers.car_image import CarTrimImageSerializer

class DealerCatalogSerializer(serializers.Serializer):
    name = serializers.CharField()

class ShowroomCatalogSerializer(serializers.Serializer):
    city = serializers.CharField()
    street = serializers.CharField()

class CarCatalogSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    car_id = serializers.UUIDField(allow_null=True)
    make = serializers.CharField()
    model = serializers.CharField()
    price_from = serializers.DecimalField(max_digits=10, decimal_places=2)
    dealer = DealerCatalogSerializer(allow_null=True)
    showroom = ShowroomCatalogSerializer(allow_null=True)
    images = serializers.SerializerMethodField()

    def get_images(self, obj):
        images = obj.get('best_images', [])
        return CarTrimImageSerializer(images, many=True, context=self.context).data