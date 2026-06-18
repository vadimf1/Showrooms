from rest_framework import serializers
from apps.cars.models import CarModel
from apps.cars.serializers.car_image import CarTrimImageSerializer

BODY_ORDER = ['SEDAN', 'WAGON', 'COUPE', 'HATCHBACK', 'SUV', 'CONVERTIBLE', 'PICKUP', 'MINIVAN', 'VAN']

class CarModelDetailSerializer(serializers.ModelSerializer):
    year_range = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()
    price_from = serializers.SerializerMethodField()
    total_stock = serializers.SerializerMethodField()

    class Meta:
        model = CarModel
        fields = ['id', 'make', 'model', 'year_range', 'images', 'price_from', 'total_stock']

    def get_year_range(self, model):
        years = [t.year for t in model.trims.all()]
        if not years:
            return ''
        mn, mx = min(years), max(years)
        return f"{mn}–{mx}" if mn != mx else str(mn)

    def get_images(self, model):
                                                 
        by_style = {}
        for trim in model.trims.all():
            style = trim.vehicle_style
            if style not in by_style:
                imgs = [img for img in trim.images.all() if img.is_default]
                if imgs:
                    by_style[style] = imgs
        for style in BODY_ORDER:
            if style in by_style:
                return CarTrimImageSerializer(by_style[style], many=True, context=self.context).data
        return []

    def get_price_from(self, model):
        prices = [
            car.sale_price
            for trim in model.trims.all()
            for car in getattr(trim, 'available_cars', [])
        ]
        return str(min(prices)) if prices else None

    def get_total_stock(self, model):
        return sum(len(getattr(t, 'available_cars', [])) for t in model.trims.all())
