import uuid
from django.db import models
from apps.users.models.client import Client
from apps.users.models.employee import Employee
from apps.cars.models.car import Car
from apps.dealerships.models.showroom import Showroom

class Sale(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    showroom = models.ForeignKey(Showroom, on_delete=models.CASCADE)
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    car = models.OneToOneField(Car, on_delete=models.CASCADE)
    employee = models.ForeignKey(
        Employee, on_delete=models.SET_NULL, null=True, blank=True
    )
    sale_date = models.DateField()
    discount = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    final_price = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=50)
    configuration = models.CharField(max_length=20, null=True, blank=True)
    warranty_period = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
