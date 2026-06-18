import httpx
from core.config import settings

client = httpx.AsyncClient(base_url=settings.django_api_url)
_BOT_SECRET_HEADER = {"X-Bot-Secret": settings.bot_secret}

async def confirm_token(token: str, telegram_id: int, telegram_username: str = '') -> bool:
    try:
        response = await client.post(
            "/api/telegram/confirm/",
            json={"token": token, "telegram_id": telegram_id, "telegram_username": telegram_username},
        )
        return response.status_code == 200
    except httpx.RequestError:
        return False

async def get_upcoming_reminders() -> list[dict]:
    try:
        response = await client.get("/api/telegram/upcoming-reminders/", headers=_BOT_SECRET_HEADER)
        if response.status_code == 200:
            return response.json()
    except httpx.RequestError:
        pass
    return []

async def mark_reminder_sent(request_id: str, field: str = 'reminder_sent') -> None:
    try:
        await client.post(
            "/api/telegram/reminders/mark-sent/",
            json={"id": request_id, "field": field},
            headers=_BOT_SECRET_HEADER,
        )
    except httpx.RequestError:
        pass

async def cancel_test_drive(request_id: str, telegram_id: int) -> bool:
    try:
        response = await client.post(
            "/api/telegram/test-drive/cancel/",
            json={"id": request_id, "telegram_id": telegram_id},
            headers=_BOT_SECRET_HEADER,
        )
        return response.status_code == 200
    except httpx.RequestError:
        return False

async def get_my_drives(telegram_id: int) -> list[dict]:
    try:
        response = await client.get(
            "/api/telegram/my-drives/",
            params={"telegram_id": telegram_id},
            headers=_BOT_SECRET_HEADER,
        )
        if response.status_code == 200:
            return response.json()
    except httpx.RequestError:
        pass
    return []

async def get_showrooms() -> list[dict]:
    try:
        response = await client.get("/api/showrooms/")
        if response.status_code == 200:
            return response.json().get("results", response.json())
    except httpx.RequestError:
        pass
    return []
