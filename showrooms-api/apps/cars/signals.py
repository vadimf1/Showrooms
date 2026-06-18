from django.db.models.signals import pre_save
from django.dispatch import receiver
from apps.cars.models.car import Car
from apps.users.models.favorite import Favorite

@receiver(pre_save, sender=Car)
def publish_price_drop(sender, instance, **kwargs):
    if not instance.pk:
        return

    try:
        previous = Car.objects.get(pk=instance.pk)
    except Car.DoesNotExist:
        return

    if instance.sale_price >= previous.sale_price:
        return

    try:
        car_model = instance.trim.car_model
    except Exception:
        return

    telegram_ids = list(
        Favorite.objects
        .filter(car_model=car_model)
        .select_related('user__client')
        .values_list('user__client__telegram_id', flat=True)
    )
    telegram_ids = [tid for tid in telegram_ids if tid]
    if not telegram_ids:
        return

    from apps.telegram_bot.kafka_producer import publish_event

    for telegram_id in telegram_ids:
        publish_event({
            "event_type": "car_price_drop",
            "telegram_id": telegram_id,
            "car_model_info": str(car_model),
            "old_price": int(previous.sale_price),
            "new_price": int(instance.sale_price),
        })
