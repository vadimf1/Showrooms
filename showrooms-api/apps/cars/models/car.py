import uuid
from django.db import models
from apps.core.models.enums import CarStatus
from apps.dealerships.models.showroom import Showroom
from apps.dealerships.models.dealer import Dealer
from .car_trim import CarTrim

class Car(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    trim = models.ForeignKey(
        CarTrim,
        on_delete=models.CASCADE,
        related_name="cars"
    )
    showroom = models.ForeignKey(
        Showroom, on_delete=models.SET_NULL, null=True, blank=True
    )
    dealer = models.ForeignKey(
        Dealer, on_delete=models.SET_NULL, null=True, blank=True
    )
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2)
    sale_price = models.DecimalField(max_digits=10, decimal_places=2)
    vin = models.CharField(max_length=17, unique=True)
    color_name = models.CharField(max_length=50, blank=True, default='')
    color_hex = models.CharField(max_length=7, blank=True, default='#cccccc')
    mileage = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=CarStatus.choices)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.sale_price
