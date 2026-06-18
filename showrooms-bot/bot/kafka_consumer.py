import json
import logging

from aiogram import Bot
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from aiokafka import AIOKafkaConsumer

from bot.reminders import schedule_reminder
from core.config import settings

logger = logging.getLogger(__name__)

_HANDLERS = {}

def event_handler(event_type: str):
    def decorator(fn):
        _HANDLERS[event_type] = fn
        return fn
    return decorator

def _datetime_str(event: dict) -> str:
    date = event.get("preferred_date") or "уточнить у менеджера"
    time = event.get("preferred_time")
    return f"{date} в {time}" if time else date

def _cancel_kb(request_id: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(
            text="❌ Отменить тест-драйв",
            callback_data=f"cancel_drive:{request_id}",
        )
    ]])

@event_handler("test_drive_created")
async def handle_created(bot: Bot, event: dict):
    text = (
        "📋 <b>Заявка на тест-драйв принята!</b>\n\n"
        f"🚗 Автомобиль: {event['car_model_info']}\n"
        f"🏢 Салон: {event['showroom_name']}\n\n"
        "Менеджер свяжется для подтверждения времени."
    )
    await bot.send_message(chat_id=event["telegram_id"], text=text, parse_mode="HTML")

@event_handler("test_drive_confirmed")
async def handle_confirmed(bot: Bot, event: dict):
    text = (
        "✅ <b>Ваш тест-драйв подтверждён!</b>\n\n"
        f"🚗 Автомобиль: {event['car_model_info']}\n"
        f"📅 Дата: {_datetime_str(event)}\n"
        f"🏢 Салон: {event['showroom_name']}\n\n"
        "Ждём вас! Если возникнут вопросы — свяжитесь с нами."
    )
    await bot.send_message(
        chat_id=event["telegram_id"],
        text=text,
        parse_mode="HTML",
        reply_markup=_cancel_kb(event["request_id"]),
    )

    if event.get("preferred_time"):
        await schedule_reminder(bot, event)

@event_handler("test_drive_completed")
async def handle_completed(bot: Bot, event: dict):
    text = (
        "🏁 <b>Тест-драйв завершён!</b>\n\n"
        f"🚗 Автомобиль: {event['car_model_info']}\n"
        f"🏢 Салон: {event['showroom_name']}\n\n"
        "Спасибо, что посетили нас! Будем рады видеть вас снова."
    )
    await bot.send_message(chat_id=event["telegram_id"], text=text, parse_mode="HTML")

@event_handler("test_drive_cancelled")
async def handle_cancelled(bot: Bot, event: dict):
    text = (
        "❌ <b>Тест-драйв отменён</b>\n\n"
        f"🚗 Автомобиль: {event['car_model_info']}\n"
        f"🏢 Салон: {event['showroom_name']}\n\n"
        "Если хотите перенести — свяжитесь с нами или запишитесь снова."
    )
    await bot.send_message(chat_id=event["telegram_id"], text=text, parse_mode="HTML")

@event_handler("car_price_drop")
async def handle_price_drop(bot: Bot, event: dict):
    old = f"{event['old_price']:,}".replace(",", " ")
    new = f"{event['new_price']:,}".replace(",", " ")
    text = (
        "🔔 <b>Снижение цены!</b>\n\n"
        f"🚗 {event['car_model_info']}\n"
        f"Было: <s>{old} ₽</s>\n"
        f"Стало: <b>{new} ₽</b>"
    )
    await bot.send_message(chat_id=event["telegram_id"], text=text, parse_mode="HTML")

async def consume_events(bot: Bot):
    consumer = AIOKafkaConsumer(
        settings.kafka_test_drive_topic,
        bootstrap_servers=settings.kafka_bootstrap_servers,
        group_id="telegram-bot",
        auto_offset_reset="latest",
        value_deserializer=lambda v: json.loads(v.decode("utf-8")),
    )

    await consumer.start()
    logger.info("Kafka consumer started, topic=%s", settings.kafka_test_drive_topic)

    try:
        async for msg in consumer:
            event = msg.value
            event_type = event.get("event_type")
            handler = _HANDLERS.get(event_type)
            if handler is None:
                logger.warning("Unknown event_type: %s", event_type)
                continue
            try:
                await handler(bot, event)
            except Exception as e:
                logger.error("Error handling event_type=%s: %s", event_type, e)
    finally:
        await consumer.stop()
