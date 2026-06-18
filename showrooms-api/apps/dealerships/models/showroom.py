import uuid
from django.db import models
from apps.core.models import Address

class Showroom(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    address = models.OneToOneField(Address, on_delete=models.SET_NULL, null=True, blank=True)
    work_start = models.TimeField(default='09:00')
    work_end = models.TimeField(default='19:00')

    def __str__(self):
        return self.name