import secrets
from django.db import models
from .user import User

class AuthToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tokens')
    token = models.CharField(max_length=64, unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    @classmethod
    def generate(cls, user):
        tok = secrets.token_hex(32)
        return cls.objects.create(user=user, token=tok)
