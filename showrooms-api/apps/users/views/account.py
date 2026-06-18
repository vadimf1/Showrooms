from django.db.models import Prefetch, Min, Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from django.conf import settings as django_settings
from apps.users.jwt_authentication import JWTAuthentication as TokenAuthentication
from apps.users.models.favorite import Favorite
from apps.users.models.client import Client
from apps.telegram_bot.models import TelegramLinkToken
from apps.cars.models.car_model import CarModel
from apps.cars.models.car import Car as CarInstance
from apps.cars.models.car_trim import CarTrim
from apps.cars.models.car_trim_image import CarTrimImage
from apps.core.models.enums import CarStatus
from apps.cars.serializers.car_image import CarTrimImageSerializer
from apps.sales.models.test_drive import TestDrive
from apps.sales.models.sale import Sale

def _require_auth(request):
    user = request.user
    if not user or not hasattr(user, 'id'):
        return None, Response({'detail': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
    return user, None

class FavoritesView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = []

    def get(self, request):
        user, err = _require_auth(request)
        if err:
            return err

        favorites = (
            Favorite.objects
            .filter(user=user)
            .select_related('car_model')
            .prefetch_related(
                Prefetch(
                    'car_model__trims__images',
                    queryset=CarTrimImage.objects.order_by('order'),
                )
            )
            .annotate(price_from=Min(
                'car_model__trims__cars__sale_price',
                filter=Q(car_model__trims__cars__status=CarStatus.AVAILABLE)
            ))
        )

        result = []
        for fav in favorites:
            car_model = fav.car_model
            images = _get_best_images(car_model)
            result.append({
                'car_model_id': str(car_model.id),
                'make': car_model.make,
                'model': car_model.model,
                'price_from': str(fav.price_from) if fav.price_from else None,
                'images': CarTrimImageSerializer(images, many=True, context={'request': request}).data,
            })

        return Response(result)

class FavoriteDetailView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = []

    def post(self, request, car_model_id):
        user, err = _require_auth(request)
        if err:
            return err

        try:
            car_model = CarModel.objects.get(id=car_model_id)
        except CarModel.DoesNotExist:
            return Response({'detail': 'Car model not found'}, status=status.HTTP_404_NOT_FOUND)

        _, created = Favorite.objects.get_or_create(user=user, car_model=car_model)
        if created:
            return Response({'detail': 'Added to favorites'}, status=status.HTTP_201_CREATED)
        return Response({'detail': 'Already in favorites'}, status=status.HTTP_200_OK)

    def delete(self, request, car_model_id):
        user, err = _require_auth(request)
        if err:
            return err

        deleted, _ = Favorite.objects.filter(user=user, car_model_id=car_model_id).delete()
        if deleted:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

class TestDrivesView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = []

    def get(self, request):
        user, err = _require_auth(request)
        if err:
            return err

        requests = (
            TestDrive.objects
            .filter(user=user)
            .select_related('showroom__address')
        )

        result = []
        for tdr in requests:
            showroom_name = tdr.showroom.name if tdr.showroom else ''
            city = ''
            if tdr.showroom and tdr.showroom.address:
                city = tdr.showroom.address.city

            result.append({
                'id': str(tdr.id),
                'car_model_id': str(tdr.car_model_id) if tdr.car_model_id else None,
                'car_model_info': tdr.car_model_info,
                'color_name': tdr.color_name,
                'color_hex': tdr.color_hex,
                'body_style': tdr.body_style or None,
                'engine_hp': tdr.engine_hp,
                'fuel_type': tdr.fuel_type or None,
                'transmission_type': tdr.transmission_type or None,
                'drive_type': tdr.drive_type or None,
                'showroom_name': showroom_name,
                'city': city,
                'preferred_date': str(tdr.preferred_date) if tdr.preferred_date else None,
                'created_at': tdr.created_at.isoformat(),
                'status': tdr.status,
            })

        return Response(result)

class TestDriveCancelView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = []

    def patch(self, request, pk):
        user, err = _require_auth(request)
        if err:
            return err

        try:
            tdr = TestDrive.objects.get(pk=pk, user=user)
        except TestDrive.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        if tdr.status not in ('PENDING', 'CONFIRMED'):
            return Response({'detail': 'Cannot cancel'}, status=status.HTTP_400_BAD_REQUEST)

        tdr.status = 'CANCELLED'
        tdr.save(update_fields=['status'])
        return Response({'status': tdr.status})

class PurchasesView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = []

    def get(self, request):
        user, err = _require_auth(request)
        if err:
            return err

        try:
            client = Client.objects.get(user=user)
        except Client.DoesNotExist:
            return Response([])

        sales = (
            Sale.objects
            .filter(client=client)
            .select_related(
                'car__trim__car_model',
                'showroom__address',
                'employee',
            )
        )

        result = []
        for sale in sales:
            car = sale.car
            trim = car.trim if car else None
            car_model = trim.car_model if trim else None

            car_name = f"{car_model.make} {car_model.model}" if car_model else ''
            year = trim.year if trim else None
            color_name = car.color_name if car else ''
            vin = car.vin if car else ''

            showroom_name = sale.showroom.name if sale.showroom else ''
            city = ''
            if sale.showroom and sale.showroom.address:
                city = sale.showroom.address.city

            dealer_name = ''
            if sale.employee:
                dealer_name = f"{sale.employee.first_name} {sale.employee.last_name}".strip()

            result.append({
                'id': str(sale.id),
                'car_model_id': str(car_model.id) if car_model else None,
                'car_name': car_name,
                'year': year,
                'color_name': color_name,
                'vin': vin,
                'sale_date': str(sale.sale_date),
                'final_price': str(sale.final_price),
                'showroom_name': showroom_name,
                'city': city,
                'dealer_name': dealer_name,
            })

        return Response(result)

class TelegramUnlinkView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = []

    def delete(self, request):
        user, err = _require_auth(request)
        if err:
            return err

        try:
            client = Client.objects.get(user=user)
        except Client.DoesNotExist:
            return Response({'detail': 'Client profile not found'}, status=status.HTTP_404_NOT_FOUND)

        client.telegram_id = None
        client.telegram_username = ''
        client.save(update_fields=['telegram_id', 'telegram_username'])
        return Response(status=status.HTTP_204_NO_CONTENT)

class TelegramLinkView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = []

    def post(self, request):
        user, err = _require_auth(request)
        if err:
            return err

        try:
            client = Client.objects.get(user=user)
        except Client.DoesNotExist:
            return Response({'detail': 'Client profile not found'}, status=status.HTTP_404_NOT_FOUND)

        TelegramLinkToken.objects.filter(client=client).delete()
        tlt = TelegramLinkToken.objects.create(client=client)

        bot_username = getattr(django_settings, 'BOT_USERNAME', 'autohub_dealer_bot')
        url = f'https://t.me/{bot_username}?start={tlt.token}'
        return Response({'url': url})

def _get_best_images(car_model):
    PREFERRED = ('SEDAN', 'COUPE', 'HATCHBACK', 'WAGON', 'SUV', 'CONVERTIBLE', 'PICKUP', 'MINIVAN', 'VAN')
    by_style = {}
    for trim in car_model.trims.all():
        imgs = list(trim.images.all())
        if imgs and trim.vehicle_style not in by_style:
            by_style[trim.vehicle_style] = imgs
    for style in PREFERRED:
        if style in by_style:
            return by_style[style]
    return []
