from rest_framework import serializers
from apps.feedback.models import Review

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id', 'rating', 'description', 'created_at']
