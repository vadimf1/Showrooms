import uuid
from django.db import models
from .car_trim import CarTrim

def _trim_image_path(instance, filename):
    ext = filename.rsplit('.', 1)[-1] if '.' in filename else 'jpg'
    return f'trim_images/{uuid.uuid4()}.{ext}'

class CarTrimImage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    trim = models.ForeignKey(CarTrim, on_delete=models.CASCADE, related_name='images')
    is_default = models.BooleanField(default=False)
    color_name = models.CharField(max_length=50, blank=True, default='')
    color_hex = models.CharField(max_length=7, blank=True, default='')
    image = models.ImageField(upload_to=_trim_image_path)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['order']
        indexes = [
            models.Index(fields=['trim', 'is_default']),
            models.Index(fields=['trim', 'color_hex']),
        ]
