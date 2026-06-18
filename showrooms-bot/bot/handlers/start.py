from aiogram import Router
from aiogram.filters import CommandStart
from aiogram.types import Message
from bot.utils.http import confirm_token
from bot.keyboards.main import main_keyboard

router = Router()

@router.message(CommandStart())
async def start_handler(msg: Message):
    args = msg.text.split()
    token = args[1] if len(args) > 1 else None

    if token:
        username = f'@{msg.from_user.username}' if msg.from_user.username else ''
        success = await confirm_token(token=token, telegram_id=msg.from_user.id, telegram_username=username)
        if success:
            await msg.answer("✅ Аккаунт привязан! Теперь будешь получать уведомления.")
        else:
            await msg.answer("❌ Ссылка устарела. Запроси новую на сайте.")
    else:
        await msg.answer(
            "Привет! Я бот сети автосалонов.\n"
            "Выбери что тебя интересует 👇",
            reply_markup=main_keyboard
        )
