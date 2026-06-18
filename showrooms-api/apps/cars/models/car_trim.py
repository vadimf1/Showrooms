import uuid
from django.db import models
from apps.core.models.enums import (
    EngineFuelType,
    TransmissionType,
    DrivenWheels,
    VehicleStyle,
)
from .car_model import CarModel

class CarTrim(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    car_model = models.ForeignKey(
        CarModel,
        on_delete=models.CASCADE,
        related_name="trims"
    )
    name = models.CharField(max_length=100, blank=True, default='')
    year = models.PositiveIntegerField()
    engine_fuel_type = models.CharField(max_length=30, choices=EngineFuelType.choices)
    engine_hp = models.IntegerField(null=True)
    engine_cylinders = models.IntegerField(null=True)
    transmission_type = models.CharField(max_length=30, choices=TransmissionType.choices )
    driven_wheels = models.CharField(max_length=30, choices=DrivenWheels.choices)
    number_of_doors = models.PositiveIntegerField()
    vehicle_style = models.CharField(max_length=30, choices=VehicleStyle.choices)
    highway_mpg = models.IntegerField()
    city_mpg = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)