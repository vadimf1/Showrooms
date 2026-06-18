from rest_framework import serializers
from apps.users.models.user import User

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, source='password_hash')

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'role', 'created_at']
        read_only_fields = ['id', 'created_at']
