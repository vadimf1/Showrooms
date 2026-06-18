import asyncio
import logging
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from aiogram import Bot

from bot.utils.http import mark_reminder_sent
from core.config import settings

logger = logging.getLogger(__name__)

                           
_scheduled: dict[str, asyncio.Task] = {}

async def schedule_reminder(bot: Bot, event: dict, reminder_sent: bool = False, day_reminder_sent: bool = False) -> None:
    request_id = event.get("request_id")
    preferred_date = event.get("preferred_date")
    preferred_time = event.get("preferred_time")

    if not all([request_id, preferred_date, preferred_time]):
        return

    if not day_reminder_sent:
        key_day = f"{request_id}_day"
        if key_day not in _scheduled or _scheduled[key_day].done():
            delay = _seconds_until(preferred_date, preferred_time, offset_hours=24)
            if delay is not None:
                _scheduled[key_day] = asyncio.create_task(
                    _fire(bot, event, delay, kind="day")
                )
                logger.info("Day reminder scheduled: request=%s delay=%.0fs", request_id, delay)

    if not reminder_sent:
        key_hour = f"{request_id}_hour"
        if key_hour not in _scheduled or _scheduled[key_hour].done():
            delay = _seconds_until(preferred_date, preferred_time, offset_hours=1)
            if delay is not None:
                _scheduled[key_hour] = asyncio.create_task(
                    _fire(bot, event, delay, kind="hour")
                )
                logger.info("Hour reminder scheduled: request=%s delay=%.0fs", request_id, delay)

def _seconds_until(preferred_date: str, preferred_time: str, offset_hours: int) -> float | None:
    tz = ZoneInfo(settings.app_timezone)
    dt = datetime.strptime(f"{preferred_date} {preferred_time}", "%d.%m.%Y %H:%M")
    dt_local = dt.replace(tzinfo=tz)
    fire_at = dt_local - timedelta(hours=offset_hours)
    delay = (fire_at - datetime.now(timezone.utc)).total_seconds()
    return delay if delay > 0 else None

async def _fire(bot: Bot, event: dict, delay: float, kind: str) -> None:
    await asyncio.sleep(delay)

    request_id = event.get("request_id", "")
    key = f"{request_id}_{kind}"

    if kind == "day":
        text = (
            "📅 <b>Напоминание: тест-драйв завтра!</b>\n\n"
            f"🚗 Автомобиль: {event['car_model_info']}\n"
            f"🕐 Время: {event['preferred_date']} в {event['preferred_time']}\n"
            f"🏢 Салон: {event['showroom_name']}\n\n"
            "Не забудьте взять документы!"
        )
        db_field = "day_reminder_sent"
    else:
        text = (
            "⏰ <b>Напоминание: тест-драйв через 1 час!</b>\n\n"
            f"🚗 Автомобиль: {event['car_model_info']}\n"
            f"📅 Дата: {event['preferred_date']} в {event['preferred_time']}\n"
            f"🏢 Салон: {event['showroom_name']}\n\n"
            "Ждём вас!"
        )
        db_field = "reminder_sent"

    try:
        await bot.send_message(chat_id=event["telegram_id"], text=text, parse_mode="HTML")
        await mark_reminder_sent(request_id, field=db_field)
    except Exception as e:
        logger.error("Failed to send %s reminder request=%s: %s", kind, request_id, e)
    finally:
        _scheduled.pop(key, None)
