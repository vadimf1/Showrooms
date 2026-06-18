from rest_framework import serializers
from apps.cars.models import Car
from apps.cars.serializers.car_image import CarTrimImageSerializer

class StockCarInGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Car
        fields = ['id', 'color_name', 'color_hex', 'sale_price', 'mileage', 'vin']

class StockGroupSerializer(serializers.Serializer):
    showroom_id = serializers.CharField(allow_null=True)
    showroom = serializers.CharField()
    city = serializers.CharField()
    address = serializers.CharField()
    price_from = serializers.CharField(allow_null=True)
    cars = serializers.SerializerMethodField()

    def get_cars(self, obj):
        return StockCarInGroupSerializer(obj['cars'], many=True, context=self.context).data

class BodyOptionSerializer(serializers.Serializer):
    style = serializers.CharField()
    count = serializers.IntegerField()

class EngineOptionSerializer(serializers.Serializer):
    hp = serializers.IntegerField(allow_null=True)
    fuel = serializers.CharField()
    count = serializers.IntegerField()

class TransOptionSerializer(serializers.Serializer):
    trans = serializers.CharField()
    count = serializers.IntegerField()

class DriveOptionSerializer(serializers.Serializer):
    drive = serializers.CharField()
    count = serializers.IntegerField()

class ColorOptionSerializer(serializers.Serializer):
    hex = serializers.CharField()
    name = serializers.CharField()
    count = serializers.IntegerField()

class MatchingSerializer(serializers.Serializer):
    price_from = serializers.CharField(allow_null=True)
    stock_count = serializers.IntegerField()
    years = serializers.ListField(child=serializers.IntegerField())

class SpecsSerializer(serializers.Serializer):
    hp = serializers.IntegerField(allow_null=True)
    fuel = serializers.CharField()
    trans = serializers.CharField()
    drive = serializers.CharField()
    doors = serializers.IntegerField()
    highway_mpg = serializers.IntegerField()
    city_mpg = serializers.IntegerField()

class ConfigureResponseSerializer(serializers.Serializer):
    available_bodies = BodyOptionSerializer(many=True)
    available_engines = EngineOptionSerializer(many=True)
    available_trans = TransOptionSerializer(many=True)
    available_drives = DriveOptionSerializer(many=True)
    available_colors = ColorOptionSerializer(many=True)
    matching = MatchingSerializer()
    specs = SpecsSerializer(allow_null=True)
    stock_groups = StockGroupSerializer(many=True)
    gallery_images = serializers.SerializerMethodField()

    def get_gallery_images(self, obj):
        return CarTrimImageSerializer(obj['gallery_images'], many=True, context=self.context).data

                                                                               

class ComboSpecsSerializer(serializers.Serializer):
    doors = serializers.IntegerField()
    highway_mpg = serializers.IntegerField()
    city_mpg = serializers.IntegerField()

class ConfiguratorOptionSerializer(serializers.Serializer):
    body = serializers.CharField()
    hp = serializers.IntegerField(allow_null=True)
    fuel = serializers.CharField()
    trans = serializers.CharField()
    drive = serializers.CharField()
    stock_count = serializers.IntegerField()
    price_from = serializers.CharField(allow_null=True)
    specs = ComboSpecsSerializer()

class ConfigurationsResponseSerializer(serializers.Serializer):
    available_bodies = BodyOptionSerializer(many=True)
    configurator_options = ConfiguratorOptionSerializer(many=True)

                                                                               

class StockResponseSerializer(serializers.Serializer):
    colors = ColorOptionSerializer(many=True)
    matching = MatchingSerializer()
    groups = StockGroupSerializer(many=True)
    gallery_images = serializers.SerializerMethodField()

    def get_gallery_images(self, obj):
        return CarTrimImageSerializer(obj['gallery_images'], many=True, context=self.context).data
