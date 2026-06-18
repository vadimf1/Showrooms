import uuid
import jwt
from django.contrib.auth.hashers import make_password, check_password
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from apps.users.models.user import User
from apps.users.models.client import Client
from apps.core.models.address import Address
from apps.core.models.enums import Role
from apps.users.jwt_authentication import JWTAuthentication
from apps.users.jwt_utils import generate_tokens, decode_refresh

def _names_for_user(user):
    first_name, last_name = '', ''
    if user.role == Role.CLIENT:
        try:
            c = user.client
            first_name, last_name = c.first_name, c.last_name
        except Exception:
            pass
    elif user.role in (Role.EMPLOYEE, Role.ADMIN):
        try:
            emp = user.employee
            first_name, last_name = emp.first_name, emp.last_name
        except Exception:
            pass
    return first_name, last_name

def _user_data(user, first_name='', last_name=''):
    return {
        'id':         str(user.id),
        'email':      user.username,
        'role':       user.role,
        'first_name': first_name,
        'last_name':  last_name,
    }

def _profile_data(user, client=None):
    if client is None:
        try:
            client = Client.objects.select_related('address').get(user=user)
        except Client.DoesNotExist:
            client = None

    telegram_linked = bool(client and client.telegram_id)

    return {
        'id':               str(user.id),
        'email':            user.username,
        'first_name':       client.first_name if client else '',
        'last_name':        client.last_name if client else '',
        'phone':            client.phone if client else '',
        'birth_date':       str(client.birth_date) if client and client.birth_date else None,
        'city':             client.address.city if client and client.address else '',
        'telegram_linked':  telegram_linked,
        'telegram_username': client.telegram_username if client and client.telegram_username else None,
    }

class AuthRegisterView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        data = request.data
        email      = data.get('email', '').strip()
        password   = data.get('password', '')
        first_name = data.get('first_name', '').strip()
        last_name  = data.get('last_name', '').strip()
        phone      = data.get('phone', '').strip()
        birth_date = data.get('birth_date') or None

        if not email or not password:
            return Response({'detail': 'email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=email).exists():
            return Response({'detail': 'Email already taken'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            user = User.objects.create(
                username=email,
                password_hash=make_password(password),
                role=Role.CLIENT,
            )
            Client.objects.create(
                id=uuid.uuid4(),
                user=user,
                first_name=first_name,
                last_name=last_name,
                phone=phone,
                birth_date=birth_date or '2000-01-01',
            )

        tokens = generate_tokens(user, first_name, last_name)
        return Response(
            {**tokens, 'user': _user_data(user, first_name, last_name)},
            status=status.HTTP_201_CREATED,
        )

class AuthLoginView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        data     = request.data
        email    = data.get('email', '').strip()
        password = data.get('password', '')

        if not email or not password:
            return Response({'detail': 'email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(username=email)
        except User.DoesNotExist:
            return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        if not check_password(password, user.password_hash):
            return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        first_name, last_name = _names_for_user(user)
        tokens = generate_tokens(user, first_name, last_name)
        return Response({**tokens, 'user': _user_data(user, first_name, last_name)})

class AuthTokenRefreshView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        refresh_token = request.data.get('refresh', '')
        if not refresh_token:
            return Response({'detail': 'refresh token required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            payload = decode_refresh(refresh_token)
        except jwt.ExpiredSignatureError:
            return Response({'detail': 'Refresh token expired'}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({'detail': 'Invalid refresh token'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            user = User.objects.get(id=payload['user_id'])
        except User.DoesNotExist:
            return Response({'detail': 'User not found'}, status=status.HTTP_401_UNAUTHORIZED)

        first_name, last_name = _names_for_user(user)
        tokens = generate_tokens(user, first_name, last_name)
        return Response(tokens)

class AuthLogoutView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = []

    def post(self, request):
        return Response(status=status.HTTP_204_NO_CONTENT)

class AuthMeView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = []

    def get(self, request):
        if not request.user or not hasattr(request.user, 'id'):
            return Response({'detail': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(_profile_data(request.user))

    def patch(self, request):
        if not request.user or not hasattr(request.user, 'id'):
            return Response({'detail': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

        user = request.user
        data = request.data

        email = data.get('email')
        if email:
            email = email.strip()
            if User.objects.filter(username=email).exclude(id=user.id).exists():
                return Response({'detail': 'Email already taken'}, status=status.HTTP_400_BAD_REQUEST)
            user.username = email
            user.save(update_fields=['username'])

        first_name = data.get('first_name')
        last_name  = data.get('last_name')
        phone      = data.get('phone')
        birth_date = data.get('birth_date')
        city       = data.get('city')

        try:
            client = Client.objects.select_related('address').get(user=user)
        except Client.DoesNotExist:
            return Response({'detail': 'Client profile not found'}, status=status.HTTP_404_NOT_FOUND)

        if first_name is not None: client.first_name = first_name
        if last_name  is not None: client.last_name  = last_name
        if phone      is not None: client.phone      = phone
        if birth_date is not None: client.birth_date = birth_date
        if city is not None:
            if client.address:
                client.address.city = city
                client.address.save(update_fields=['city'])
            else:
                client.address = Address.objects.create(
                    country='', city=city, state=None, street='', postal_code='',
                )
        client.save()

        return Response(_profile_data(user, client))
