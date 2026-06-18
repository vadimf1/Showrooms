from aiogram.types import ReplyKeyboardMarkup, KeyboardButton

main_keyboard = ReplyKeyboardMarkup(
    keyboard=[
        [KeyboardButton(text="📋 Мои записи")],
        [KeyboardButton(text="📍 Адреса салонов"), KeyboardButton(text="📞 Контакты")],
        [KeyboardButton(text="❓ FAQ")],
    ],
    resize_keyboard=True,
)