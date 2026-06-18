from rest_framework import serializers
from apps.sales.models.sale import Sale
from apps.users.models.client import Client
from apps.users.models.employee import Employee
from apps.cars.models.car import Car
from apps.dealerships.models.showroom import Showroom
from apps.users.serializers.client import ClientListSerializer
from apps.users.serializers.employee import EmployeeSerializer
from apps.cars.serializers.car import CarSerializer
from apps.dealerships.serializers.showroom import ShowroomSerializer

class SaleSerializer(serializers.ModelSerializer):
    showroom = ShowroomSerializer(read_only=True)
    showroom_id = serializers.PrimaryKeyRelatedField(
        queryset=Showroom.objects.all(),
        source='showroom',
        write_only=True,
    )

    client = ClientListSerializer(read_only=True)
    client_id = serializers.PrimaryKeyRelatedField(
        queryset=Client.objects.all(),
        source='client',
        write_only=True,
    )

    car = CarSerializer(read_only=True)
    car_id = serializers.PrimaryKeyRelatedField(
        queryset=Car.objects.all(),
        source='car',
        write_only=True,
    )

    employee = EmployeeSerializer(read_only=True)
    employee_id = serializers.PrimaryKeyRelatedField(
        queryset=Employee.objects.all(),
        source='employee',
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Sale
        fields = [
            'id',
            'showroom', 'showroom_id',
            'client', 'client_id',
            'car', 'car_id',
            'employee', 'employee_id',
            'sale_date', 'discount', 'final_price',
            'payment_method', 'configuration', 'warranty_period',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

class SaleListSerializer(serializers.ModelSerializer):
    client_name  = serializers.SerializerMethodField()
    car_name     = serializers.SerializerMethodField()
    car_trim     = serializers.SerializerMethodField()
    car_year     = serializers.SerializerMethodField()
    car_color    = serializers.CharField(source='car.color_name', read_only=True)
    car_hex      = serializers.CharField(source='car.color_hex', read_only=True)
    car_vin      = serializers.CharField(source='car.vin', read_only=True)
    showroom_name = serializers.CharField(source='showroom.name', read_only=True)
    showroom_city = serializers.CharField(source='showroom.address.city', read_only=True, default='')
    employee_name = serializers.SerializerMethodField()
    employee_initials = serializers.SerializerMethodField()
    employee_grad = serializers.SerializerMethodField()

    def get_client_name(self, obj):
        return f"{obj.client.first_name} {obj.client.last_name}"

    def get_car_name(self, obj):
        m = obj.car.trim.car_model
        return f"{m.make} {m.model}"

    def get_car_trim(self, obj):
        return obj.car.trim.name

    def get_car_year(self, obj):
        return obj.car.trim.year

    def get_employee_name(self, obj):
        if not obj.employee:
            return None
        return f"{obj.employee.first_name} {obj.employee.last_name}"

    def get_employee_initials(self, obj):
        if not obj.employee:
            return '—'
        return (obj.employee.first_name[:1] + obj.employee.last_name[:1]).upper()

    def get_employee_grad(self, obj):
        if not obj.employee:
            return 'g1'
        grads = ['g1', 'g2', 'g3', 'g4']
        return grads[hash(str(obj.employee.id)) % 4]

    class Meta:
        model = Sale
        fields = [
            'id',
            'client_name',
            'car_name', 'car_trim', 'car_year', 'car_color', 'car_hex', 'car_vin',
            'showroom_name', 'showroom_city',
            'employee_name', 'employee_initials', 'employee_grad',
            'sale_date', 'final_price', 'payment_method',
        ]
