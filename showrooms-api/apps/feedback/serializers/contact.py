from rest_framework import serializers
from django.contrib.contenttypes.models import ContentType

from apps.feedback.models import Contact
from apps.dealerships.models import Showroom, Dealer
from apps.dealerships.serializers.showroom import ShowroomSerializer
from apps.dealerships.serializers.dealer import DealerSerializer

class ContactSerializer(serializers.ModelSerializer):
    showroom_id = serializers.PrimaryKeyRelatedField(
        queryset=Showroom.objects.all(),
        write_only=True,
        required=False
    )

    dealer_id = serializers.PrimaryKeyRelatedField(
        queryset=Dealer.objects.all(),
        write_only=True,
        required=False
    )

    showroom = serializers.SerializerMethodField()
    dealer = serializers.SerializerMethodField()

    class Meta:
        model = Contact
        fields = [
            'id',
            'contact_type',
            'contact_value',
            'showroom_id',
            'dealer_id',
            'showroom',
            'dealer',
            'created_at'
        ]

    def create(self, validated_data):
        showroom = validated_data.pop('showroom_id', None)
        dealer = validated_data.pop('dealer_id', None)

        if showroom:
            validated_data['content_type'] = ContentType.objects.get_for_model(Showroom)
            validated_data['object_id'] = showroom.id

        elif dealer:
            validated_data['content_type'] = ContentType.objects.get_for_model(Dealer)
            validated_data['object_id'] = dealer.id

        else:
            raise serializers.ValidationError("Provide showroom_id or dealer_id")

        return super().create(validated_data)

    def get_showroom(self, obj):
        if obj.content_type.model == 'showroom':
            from apps.dealerships.serializers.showroom import ShowroomSerializer
            return ShowroomSerializer(obj.owner).data
        return None

    def get_dealer(self, obj):
        if obj.content_type.model == 'dealer':
            from apps.dealerships.serializers.dealer import DealerSerializer
            return DealerSerializer(obj.owner).data
        return None