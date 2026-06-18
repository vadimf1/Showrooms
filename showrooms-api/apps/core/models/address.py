import uuid
from django.db import models

class Address(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    country = models.CharField(max_length=50)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=50, null=True, blank=True)
    street = models.CharField(max_length=50)
    postal_code = models.CharField(max_length=10)

    def __str__(self):
        return f"{self.city}, {self.street}"
