from aiogram import Router, F
from aiogram.types import Message

from bot.utils.http import get_showrooms

router = Router()

_FAQ = """❓ <b>Часто задаваемые вопросы</b>

<b>Как записаться на тест-драйв?</b>
Выберите автомобиль на сайте, нажмите «Тест-драйв» и заполните форму. Мы свяжемся с вами для подтверждения.

<b>Как привязать аккаунт к боту?</b>
Перейдите в личный кабинет на сайте → раздел «Профиль» → «Привязать Telegram».

<b>Можно ли отменить запись?</b>
Да, через раздел «Мои записи» в этом боте или через личный кабинет на сайте.

<b>Как узнать статус моей записи?</b>
Нажмите «📋 Мои записи» — там отображается актуальный статус каждого тест-драйва.

<b>Какие документы нужны для тест-драйва?</b>
Водительское удостоверение и паспорт. Возраст — от 18 лет, стаж — от 1 года.

<b>Есть ли Trade-in?</b>
Да, принимаем автомобили в зачёт стоимости нового. Оценка бесплатна, обратитесь к менеджеру в салоне.
"""

_CONTACTS = """📞 <b>Контакты AutoHub</b>

📱 <b>Телефон:</b> 8 800 555-35-35
   Бесплатно по России, пн–вс 9:00–21:00

✉️ <b>Email:</b> info@autohub.ru
   Ответим в течение 24 часов

💬 <b>Telegram:</b> @autohub_support
   Быстрые ответы и уведомления

🏢 <b>Главный офис:</b>
   Москва, ул. Автомобильная, 1
   Пн–Сб 9:00–20:00, Вс 10:00–18:00
"""


@router.message(F.text == "📍 Адреса салонов")
async def showrooms_handler(msg: Message):
    showrooms = await get_showrooms()

    if not showrooms:
        await msg.answer("Не удалось загрузить список салонов. Попробуйте позже.")
        return

    lines = ["🏢 <b>Наши автосалоны:</b>\n"]
    for s in showrooms:
        addr = s.get("address") or {}
        city = addr.get("city", "")
        street = addr.get("street", "")
        name = s.get("name", "")
        lines.append(f"<b>{name}</b>\n📍 {city}, {street}\n")

    await msg.answer("\n".join(lines), parse_mode="HTML")


@router.message(F.text == "📞 Контакты")
async def contacts_handler(msg: Message):
    await msg.answer(_CONTACTS, parse_mode="HTML")


@router.message(F.text == "❓ FAQ")
async def faq_handler(msg: Message):
    await msg.answer(_FAQ, parse_mode="HTML")
