from rest_framework import serializers
from apps.dealerships.models import Dealer
from apps.core.models.address import Address
from apps.core.serializers.address import AddressSerializer

class DealerSerializer(serializers.ModelSerializer):
    address = AddressSerializer(required=False, allow_null=True)
    city = serializers.CharField(source='address.city', read_only=True, default='')
    car_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Dealer
        fields = ['id', 'name', 'city', 'address', 'car_count']

    def create(self, validated_data):
        address_data = validated_data.pop('address', None)
        address = Address.objects.create(**address_data) if address_data else None
        return Dealer.objects.create(address=address, **validated_data)

    def update(self, instance, validated_data):
        address_data = validated_data.pop('address', None)
        if address_data is not None:
            if instance.address:
                for attr, val in address_data.items():
                    setattr(instance.address, attr, val)
                instance.address.save()
            else:
                instance.address = Address.objects.create(**address_data)
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()
        return instance
