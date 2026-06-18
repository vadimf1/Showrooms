import uuid
from django.db import models
from apps.dealerships.models.showroom import Showroom
from apps.users.models.user import User

class TestDriveStatus(models.TextChoices):
    PENDING   = 'PENDING',   'Pending'
    CONFIRMED = 'CONFIRMED', 'Confirmed'
    COMPLETED = 'COMPLETED', 'Completed'
    CANCELLED = 'CANCELLED', 'Cancelled'

class TestDrive(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    showroom = models.ForeignKey(Showroom, on_delete=models.CASCADE, related_name='test_drive_requests')
    car_model = models.ForeignKey(
        'cars.CarModel',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='test_drive_requests',
    )
    car_model_info      = models.CharField(max_length=255)
    body_style          = models.CharField(max_length=20, blank=True, default='')
    engine_hp           = models.IntegerField(null=True, blank=True)
    fuel_type           = models.CharField(max_length=20, blank=True, default='')
    transmission_type   = models.CharField(max_length=20, blank=True, default='')
    drive_type          = models.CharField(max_length=10, blank=True, default='')
    color_name          = models.CharField(max_length=50, blank=True, default='')
    color_hex           = models.CharField(max_length=7,  blank=True, default='')
    name                = models.CharField(max_length=100)
    phone               = models.CharField(max_length=20)
    preferred_date      = models.DateField(null=True, blank=True)
    preferred_time      = models.TimeField(null=True, blank=True)
    created_at          = models.DateTimeField(auto_now_add=True)
    user                = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='test_drive_requests',
    )
    status = models.CharField(
        max_length=20, choices=TestDriveStatus.choices, default=TestDriveStatus.PENDING,
    )
    reminder_sent     = models.BooleanField(default=False)
    day_reminder_sent = models.BooleanField(default=False)
    employee          = models.ForeignKey(
        'users.Employee', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='test_drive_requests',
    )

    class Meta:
        ordering = ['-created_at']
