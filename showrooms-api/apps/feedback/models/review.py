import uuid
from django.db import models

class Review(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='reviews')
    car_model = models.ForeignKey(
        'cars.CarModel', on_delete=models.CASCADE,
        null=True, blank=True, related_name='reviews',
    )
    test_drive = models.OneToOneField(
        'sales.TestDrive', on_delete=models.CASCADE,
        null=True, blank=True, related_name='review',
    )
    rating = models.PositiveSmallIntegerField()
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'car_model'],
                condition=models.Q(car_model__isnull=False),
                name='unique_user_car_model_review',
            ),
        ]

    def __str__(self):
        return f"Review by {self.user} ({self.rating}★)"
