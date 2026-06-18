from rest_framework import serializers
from apps.sales.models import TestDrive
from apps.dealerships.models import Showroom
from apps.cars.models.car_model import CarModel
from apps.users.models.employee import Employee

class TestDriveSerializer(serializers.ModelSerializer):
    showroom_id = serializers.PrimaryKeyRelatedField(
        queryset=Showroom.objects.all(),
        source='showroom',
    )
    car_model_id = serializers.PrimaryKeyRelatedField(
        queryset=CarModel.objects.all(),
        source='car_model',
        required=False,
        allow_null=True,
    )

    class Meta:
        model = TestDrive
        fields = [
            'id', 'showroom_id', 'car_model_id', 'car_model_info',
            'color_name', 'color_hex',
            'body_style', 'engine_hp', 'fuel_type', 'transmission_type', 'drive_type',
            'name', 'phone', 'preferred_date', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']
        extra_kwargs = {
            'preferred_date':    {'required': False, 'allow_null': True},
            'body_style':        {'required': False},
            'engine_hp':         {'required': False, 'allow_null': True},
            'fuel_type':         {'required': False},
            'transmission_type': {'required': False},
            'drive_type':        {'required': False},
        }

class TestDriveAdminSerializer(serializers.ModelSerializer):
    customer_name  = serializers.CharField(source='name',  read_only=True)
    customer_phone = serializers.CharField(source='phone', read_only=True)
    showroom_name  = serializers.CharField(source='showroom.name', read_only=True, default='')
    showroom_id    = serializers.UUIDField(source='showroom.id',   read_only=True)
    employee_id    = serializers.PrimaryKeyRelatedField(
        queryset=Employee.objects.all(),
        source='employee',
        required=False,
        allow_null=True,
    )

    class Meta:
        model = TestDrive
        fields = [
            'id', 'car_model_info', 'color_name', 'color_hex',
            'customer_name', 'customer_phone',
            'preferred_date', 'preferred_time', 'created_at',
            'status', 'showroom_name', 'showroom_id', 'employee_id',
        ]
        read_only_fields = [
            'id', 'created_at', 'car_model_info', 'color_name', 'color_hex',
            'customer_name', 'customer_phone', 'showroom_name', 'showroom_id',
        ]
        extra_kwargs = {
            'preferred_date': {'required': False, 'allow_null': True},
            'preferred_time': {'required': False, 'allow_null': True},
        }
