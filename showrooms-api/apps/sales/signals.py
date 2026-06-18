from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from apps.sales.models.test_drive import TestDrive, TestDriveStatus

_EVENT_TYPE = {
    TestDriveStatus.CONFIRMED:  "test_drive_confirmed",
    TestDriveStatus.COMPLETED:  "test_drive_completed",
    TestDriveStatus.CANCELLED:  "test_drive_cancelled",
}

@receiver(pre_save, sender=TestDrive)
def publish_status_change(sender, instance, **kwargs):
    if not instance.pk:
        return

    try:
        previous = TestDrive.objects.get(pk=instance.pk)
    except TestDrive.DoesNotExist:
        return

    if previous.status == instance.status:
        return

    event_type = _EVENT_TYPE.get(instance.status)
    if not event_type:
        return

    telegram_id = _get_telegram_id(instance)
    if not telegram_id:
        return

    from apps.telegram_bot.kafka_producer import publish_event

    publish_event({
        "event_type": event_type,
        "telegram_id": telegram_id,
        "request_id": str(instance.pk),
        "car_model_info": instance.car_model_info,
        "preferred_date": instance.preferred_date.strftime('%d.%m.%Y') if instance.preferred_date else None,
        "preferred_time": instance.preferred_time.strftime('%H:%M') if instance.preferred_time else None,
        "showroom_name": instance.showroom.name,
    })

@receiver(post_save, sender=TestDrive)
def publish_created(sender, instance, created, **kwargs):
    if not created:
        return

    telegram_id = _get_telegram_id(instance)
    if not telegram_id:
        return

    from apps.telegram_bot.kafka_producer import publish_event

    publish_event({
        "event_type": "test_drive_created",
        "telegram_id": telegram_id,
        "request_id": str(instance.pk),
        "car_model_info": instance.car_model_info,
        "showroom_name": instance.showroom.name,
    })

def _get_telegram_id(instance: TestDrive):
    if not instance.user_id:
        return None
    try:
        return instance.user.client.telegram_id
    except Exception:
        return None
