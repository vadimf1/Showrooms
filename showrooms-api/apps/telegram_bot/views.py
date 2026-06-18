from datetime import datetime, timedelta

from django.db import IntegrityError
from django.db.models import Q
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from apps.telegram_bot.models import TelegramLinkToken
from apps.users.models.client import Client
from apps.sales.models.test_drive import TestDrive, TestDriveStatus
from django.conf import settings

class GenerateLinkView(APIView):
    def get(self, request):
        client_id = request.query_params.get('client_id')

        try:
            client = Client.objects.get(id=client_id)
        except Client.DoesNotExist:
            return Response({"error": "Клиент не найден"}, status=status.HTTP_404_NOT_FOUND)

        TelegramLinkToken.objects.filter(client=client).delete()
        token = TelegramLinkToken.objects.create(client=client)

        return Response({
            "url": f"https://t.me/{settings.BOT_USERNAME}?start={token.token}"
        })

class ConfirmLinkView(APIView):
    def post(self, request):
        token_value = request.data.get('token')
        telegram_id = request.data.get('telegram_id')

        if not token_value or not telegram_id:
            return Response({"error": "Не переданы token или telegram_id"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = TelegramLinkToken.objects.get(token=token_value)
        except TelegramLinkToken.DoesNotExist:
            return Response({"error": "Токен не найден"}, status=status.HTTP_400_BAD_REQUEST)

        if not token.is_valid():
            token.delete()
            return Response({"error": "Токен истёк"}, status=status.HTTP_400_BAD_REQUEST)

        telegram_username = request.data.get('telegram_username', '') or ''

        Client.objects.filter(telegram_id=telegram_id).exclude(pk=token.client.pk).update(
            telegram_id=None, telegram_username=''
        )

        token.client.telegram_id = telegram_id
        token.client.telegram_username = telegram_username
        try:
            token.client.save(update_fields=['telegram_id', 'telegram_username'])
        except IntegrityError:
            return Response({"error": "Telegram уже привязан"}, status=status.HTTP_409_CONFLICT)

        token.delete()
        return Response({"ok": True})

class UpcomingRemindersView(APIView):

    def get(self, request):
        if request.headers.get('X-Bot-Secret') != settings.BOT_SECRET:
            return Response(status=status.HTTP_403_FORBIDDEN)

        now = timezone.localtime(timezone.now())
        today = now.date()

        candidates = (
            TestDrive.objects
            .filter(
                status=TestDriveStatus.CONFIRMED,
                preferred_time__isnull=False,
            )
            .filter(
                Q(preferred_date__gt=today) |
                Q(preferred_date=today, preferred_time__gt=now.time())
            )
            .select_related('user__client', 'showroom')
        )

        results = []
        for req in candidates:
            telegram_id = None
            try:
                telegram_id = req.user.client.telegram_id
            except Exception:
                pass
            if not telegram_id:
                continue
            entry = {
                "request_id": str(req.id),
                "telegram_id": telegram_id,
                "car_model_info": req.car_model_info,
                "preferred_date": req.preferred_date.strftime('%d.%m.%Y'),
                "preferred_time": req.preferred_time.strftime('%H:%M'),
                "showroom_name": req.showroom.name,
                "reminder_sent": req.reminder_sent,
                "day_reminder_sent": req.day_reminder_sent,
            }
            results.append(entry)

        return Response(results)

class MarkReminderSentView(APIView):

    def post(self, request):
        if request.headers.get('X-Bot-Secret') != settings.BOT_SECRET:
            return Response(status=status.HTTP_403_FORBIDDEN)

        request_id = request.data.get('id')
        field = request.data.get('field', 'reminder_sent')
        if field not in ('reminder_sent', 'day_reminder_sent'):
            return Response({"error": "invalid field"}, status=status.HTTP_400_BAD_REQUEST)
        updated = TestDrive.objects.filter(pk=request_id).update(**{field: True})
        if not updated:
            return Response({"error": "not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response({"ok": True})

class CancelTestDriveView(APIView):

    def post(self, request):
        if request.headers.get('X-Bot-Secret') != settings.BOT_SECRET:
            return Response(status=status.HTTP_403_FORBIDDEN)

        request_id = request.data.get('id')
        telegram_id = request.data.get('telegram_id')

        try:
            req = TestDrive.objects.select_related('user__client').get(pk=request_id)
        except TestDrive.DoesNotExist:
            return Response({"error": "not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            owner_tg = req.user.client.telegram_id
        except Exception:
            owner_tg = None

        if owner_tg != telegram_id:
            return Response({"error": "forbidden"}, status=status.HTTP_403_FORBIDDEN)

        if req.status not in (TestDriveStatus.PENDING, TestDriveStatus.CONFIRMED):
            return Response({"error": "cannot cancel"}, status=status.HTTP_409_CONFLICT)

        req.status = TestDriveStatus.CANCELLED
        req.save(update_fields=['status'])
        return Response({"ok": True})

class MyDrivesView(APIView):

    def get(self, request):
        if request.headers.get('X-Bot-Secret') != settings.BOT_SECRET:
            return Response(status=status.HTTP_403_FORBIDDEN)

        telegram_id = request.query_params.get('telegram_id')
        if not telegram_id:
            return Response({"error": "telegram_id required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            telegram_id = int(telegram_id)
        except ValueError:
            return Response({"error": "invalid telegram_id"}, status=status.HTTP_400_BAD_REQUEST)

        drives = (
            TestDrive.objects
            .filter(
                user__client__telegram_id=telegram_id,
                status__in=[TestDriveStatus.PENDING, TestDriveStatus.CONFIRMED],
            )
            .select_related('showroom')
            .order_by('preferred_date', 'preferred_time')
        )

        results = []
        for d in drives:
            results.append({
                "request_id": str(d.id),
                "car_model_info": d.car_model_info,
                "status": d.status,
                "preferred_date": d.preferred_date.strftime('%d.%m.%Y') if d.preferred_date else None,
                "preferred_time": d.preferred_time.strftime('%H:%M') if d.preferred_time else None,
                "showroom_name": d.showroom.name,
            })

        return Response(results)
