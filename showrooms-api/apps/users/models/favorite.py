from django.db import models
from .user import User
from apps.cars.models.car_model import CarModel

class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    car_model = models.ForeignKey(CarModel, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'car_model')
        ordering = ['-created_at']
