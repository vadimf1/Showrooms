import asyncio
import logging

from aiogram import Bot, Dispatcher

from bot.handlers import start
from bot.handlers import drives
from bot.handlers import info
from bot.kafka_consumer import consume_events
from bot.reminders import schedule_reminder
from bot.utils.http import get_upcoming_reminders
from core.config import settings

logger = logging.getLogger(__name__)

async def recover_reminders(bot: Bot) -> None:
    reminders = await get_upcoming_reminders()
    for event in reminders:
        await schedule_reminder(
            bot,
            event,
            reminder_sent=event.get("reminder_sent", False),
            day_reminder_sent=event.get("day_reminder_sent", False),
        )
    if reminders:
        logger.info("Recovered %d reminder(s) after restart", len(reminders))

async def main():
    bot = Bot(token=settings.bot_token)

    dp = Dispatcher()
    dp.include_router(start.router)
    dp.include_router(drives.router)
    dp.include_router(info.router)

    asyncio.create_task(consume_events(bot))
    await recover_reminders(bot)

    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
