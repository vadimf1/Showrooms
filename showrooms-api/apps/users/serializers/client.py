from rest_framework import serializers
from apps.users.models.client import Client
from apps.users.models.user import User
from apps.core.models.address import Address
from apps.core.serializers.address import AddressSerializer
from apps.users.serializers.user import UserSerializer

class ClientSerializer(serializers.ModelSerializer):
    address = AddressSerializer(read_only=True)
    address_id = serializers.PrimaryKeyRelatedField(
        queryset=Address.objects.all(),
        source='address',
        write_only=True,
    )

    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='user',
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Client
        fields = [
            'id', 'first_name', 'last_name',
            'user', 'user_id',
            'address', 'address_id',
            'birth_date', 'telegram_id',
        ]
        read_only_fields = ['id', 'telegram_id']

class ClientListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ['id', 'first_name', 'last_name', 'telegram_id']
