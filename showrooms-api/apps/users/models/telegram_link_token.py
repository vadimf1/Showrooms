import secrets
from django.db import models
from .user import User

class TelegramLinkToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tg_tokens')
    token = models.CharField(max_length=64, unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    used = models.BooleanField(default=False)

    @classmethod
    def generate(cls, user):
        cls.objects.filter(user=user, used=False).delete()
        return cls.objects.create(user=user, token=secrets.token_hex(16))
