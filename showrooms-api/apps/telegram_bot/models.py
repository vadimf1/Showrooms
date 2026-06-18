import secrets
from django.db import models
from apps.users.models.client import Client
from django.utils import timezone
from datetime import timedelta

def get_expiry():
    return timezone.now() + timedelta(minutes=10)

class TelegramLinkToken(models.Model):
    token = models.CharField(max_length=64, primary_key=True, default=secrets.token_hex)
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    expires_at = models.DateTimeField(default=get_expiry)

    def is_valid(self):
        return timezone.now() < self.expires_at