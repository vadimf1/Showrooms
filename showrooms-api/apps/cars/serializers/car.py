from rest_framework import serializers
from apps.cars.models import Car, CarTrim
from apps.dealerships.models import Showroom, Dealer

from apps.cars.serializers.car_trim import CarTrimSerializer
from apps.dealerships.serializers.showroom import ShowroomSerializer
from apps.dealerships.serializers.dealer import DealerSerializer

class CarSerializer(serializers.ModelSerializer):
    trim = CarTrimSerializer(read_only=True)
    showroom = ShowroomSerializer(read_only=True)
    dealer = DealerSerializer(read_only=True)
    trim_id = serializers.PrimaryKeyRelatedField(
        queryset=CarTrim.objects.all(),
        source='trim',
        write_only=True
    )
    showroom_id = serializers.PrimaryKeyRelatedField(
        queryset=Showroom.objects.all(),
        source='showroom',
        write_only=True,
        required=False,
        allow_null=True
    )
    dealer_id = serializers.PrimaryKeyRelatedField(
        queryset=Dealer.objects.all(),
        source='dealer',
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = Car
        fields = [
            'id',
            'trim', 'trim_id',
            'showroom', 'showroom_id',
            'dealer', 'dealer_id',
            'vin',
            'color_name',
            'color_hex',
            'mileage',
            'purchase_price',
            'sale_price',
            'status',
            'created_at'
        ]
