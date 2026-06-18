from django.contrib.auth.hashers import make_password
from rest_framework import serializers
from apps.users.models.employee import Employee
from apps.users.models.user import User
from apps.core.models.enums import Role
from apps.dealerships.models.showroom import Showroom

class EmployeeSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    showroom_id = serializers.PrimaryKeyRelatedField(
        queryset=Showroom.objects.all(),
        source='showrooms',
        required=False,
        allow_null=True,
    )
    city = serializers.CharField(source='address.city', read_only=True, default='')

    class Meta:
        model = Employee
        fields = [
            'id', 'first_name', 'last_name',
            'username', 'password',
            'position', 'salary',
            'showroom_id', 'city',
        ]
        read_only_fields = ['id']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['username'] = instance.user.username
        ret['role'] = instance.user.role
        ret['showroom_name'] = instance.showrooms.name if instance.showrooms else ''
        return ret

    def create(self, validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password', 'changeme')
        showroom = validated_data.pop('showrooms', None)
        user = User.objects.create(
            username=username,
            password_hash=make_password(password),
            role=Role.EMPLOYEE,
        )
        return Employee.objects.create(user=user, showrooms=showroom, **validated_data)

    def update(self, instance, validated_data):
        username = validated_data.pop('username', None)
        password = validated_data.pop('password', None)
        showroom = validated_data.pop('showrooms', 'UNCHANGED')

        if username:
            instance.user.username = username
        if password:
            instance.user.password_hash = make_password(password)
        if username or password:
            instance.user.save()

        if showroom != 'UNCHANGED':
            instance.showrooms = showroom

        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()
        return instance
