from aiogram import Router, F
from aiogram.filters import Command
from aiogram.types import Message, CallbackQuery

from bot.utils.http import get_my_drives, cancel_test_drive

router = Router()

_STATUS_LABEL = {
    "PENDING":   "⏳ Ожидает подтверждения",
    "CONFIRMED": "✅ Подтверждён",
}

@router.message(Command("my_drives"))
@router.message(F.text == "📋 Мои записи")
async def my_drives_handler(msg: Message):
    drives = await get_my_drives(msg.from_user.id)

    if not drives:
        await msg.answer("У вас нет активных записей на тест-драйв.")
        return

    lines = ["<b>Ваши тест-драйвы:</b>\n"]
    for d in drives:
        status = _STATUS_LABEL.get(d["status"], d["status"])
        date_str = d["preferred_date"] or "—"
        time_str = f" в {d['preferred_time']}" if d["preferred_time"] else ""
        lines.append(
            f"🚗 <b>{d['car_model_info']}</b>\n"
            f"   {status}\n"
            f"   📅 {date_str}{time_str}\n"
            f"   🏢 {d['showroom_name']}\n"
        )

    await msg.answer("\n".join(lines), parse_mode="HTML")

@router.callback_query(F.data.startswith("cancel_drive:"))
async def cancel_drive_callback(call: CallbackQuery):
    request_id = call.data.split(":", 1)[1]
    ok = await cancel_test_drive(request_id=request_id, telegram_id=call.from_user.id)

    if ok:
        await call.message.edit_reply_markup(reply_markup=None)
        await call.answer("Тест-драйв отменён.", show_alert=True)
    else:
        await call.answer("Не удалось отменить. Возможно, уже обработан.", show_alert=True)
