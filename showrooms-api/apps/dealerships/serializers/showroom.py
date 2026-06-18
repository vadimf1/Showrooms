from rest_framework import serializers
from apps.dealerships.models.showroom import Showroom
from apps.core.models.address import Address
from apps.core.serializers.address import AddressSerializer

class ShowroomSerializer(serializers.ModelSerializer):
    address = AddressSerializer()
    dealer_count = serializers.IntegerField(read_only=True, default=0)
    car_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Showroom
        fields = ['id', 'name', 'address', 'dealer_count', 'car_count']

    def create(self, validated_data):
        address_data = validated_data.pop('address')
        address = Address.objects.create(**address_data)
        return Showroom.objects.create(address=address, **validated_data)

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
