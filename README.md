# AutoHub — дипломный проект

Платформа сети автосалонов: каталог автомобилей с конфигуратором, личный кабинет, записи на тест-драйв, система рекомендаций на основе KNN, Telegram-бот для уведомлений.

---

## Состав проекта

| Сервис | Технологии | Порт |
|---|---|---|
| `showrooms-api` | Django 5, DRF, PostgreSQL, Kafka | 8000 |
| `showrooms-frontend` | React 19, TypeScript, Vite | 5173 |
| `showrooms-admin` | React 19, TypeScript, Vite | 5174 |
| `showrooms-recommender` | FastAPI, scikit-learn, SQLAlchemy | 8001 |
| `showrooms-bot` | Python, aiogram 3, Kafka | — |

Инфраструктура: **PostgreSQL 16**, **Apache Kafka** (KRaft-режим, без ZooKeeper).

---

## Архитектура

```
                    ┌─────────────┐
                    │  PostgreSQL │
                    └──────┬──────┘
                           │
         ┌─────────────────┼──────────────────┐
         │                 │                  │
  ┌──────▼──────┐  ┌───────▼───────┐  ┌──────▼──────┐
  │ Django API  │  │  Recommender  │  │   Telegram  │
  │   :8000     │  │   FastAPI     │  │     Bot     │
  │             │  │   :8001       │  │  (aiogram)  │
  └──────┬──────┘  └───────────────┘  └──────┬──────┘
         │                                   │
     Kafka topic                         Kafka topic
  test-drive-events               test-drive-events
         │                                   │
  ┌──────▼──────┐              ┌─────────────▼──────┐
  │  Frontend   │              │  Admin Panel       │
  │  React SPA  │              │  React SPA         │
  │   :5173     │              │   :5174            │
  └─────────────┘              └────────────────────┘
```

**Потоки данных:**
- Frontend ↔ Django API — REST (JWT-токены)
- Django API → Kafka → Telegram Bot — события тест-драйвов (создание, подтверждение)
- Django API → Recommender — HTTP-запросы за рекомендациями
- Recommender → PostgreSQL — чтение актуальных продаж для переобучения

---

## Модули Django API

| Приложение | Отвечает за |
|---|---|
| `users` | Клиенты, JWT-авторизация, привязка Telegram |
| `cars` | Модели авто, комплектации, наличие, рекомендации |
| `dealerships` | Шоурумы, дилеры |
| `sales` | Покупки |
| `telegram_bot` | Генерация токенов привязки, вебхук-эндпоинты для бота |
| `feedback` | Отзывы на модели авто и тест-драйвы |
| `core` | Общие модели (Address и др.) |

---

## Система рекомендаций

Сервис `showrooms-recommender` реализует контентную фильтрацию на основе **KNN (k ближайших соседей)**.

**Признаки модели:** марка, модель, кузов, тип топлива, мощность двигателя, тип привода, коробка передач, цена.

**Режимы работы:**
- `POST /recommend` — похожие авто для одной карточки (10 результатов)
- `POST /recommend_multi` — рекомендации по истории просмотров + избранному (усреднение векторов признаков, 15 результатов)

Модель переобучается автоматически каждые 24 часа на актуальных данных из БД.

---

## Telegram-бот

**Функциональность:**
- Привязка аккаунта к профилю на сайте (одноразовый токен через deep link)
- Уведомления о статусе тест-драйва (создан, подтверждён)
- Напоминания за 3 дня и в день тест-драйва
- Отмена тест-драйва прямо из бота
- Просмотр предстоящих тест-драйвов
- Информация о шоурумах, контакты, FAQ

**Привязка аккаунта:**
1. Пользователь нажимает «Привязать Telegram» в личном кабинете
2. API генерирует одноразовый токен → возвращает ссылку `t.me/bot?start=<token>`
3. Пользователь переходит по ссылке — бот вызывает `/confirm_link` на API
4. API записывает `telegram_id` в профиль клиента, токен удаляется

---

## Запуск

### Требования
- Docker & Docker Compose
- Node.js 20+ (только для локальной разработки фронтенда)

### Переменные окружения

Создать `showrooms-api/.env`:

```env
SECRET_KEY=your-secret-key
DB_NAME=autohub
DB_USER=postgres
DB_PASSWORD=postgres
BOT_TOKEN=your-telegram-bot-token
BOT_USERNAME=your_bot_username
BOT_SECRET=your-bot-secret
```

### Запуск всех сервисов

```bash
cd showrooms-api
docker compose up --build
```

Это поднимает: PostgreSQL, Kafka, Django API, Recommender, Telegram Bot, Frontend, Admin.

### Первоначальная настройка

```bash
# Применить миграции
docker compose exec api python manage.py migrate

# Создать суперпользователя
docker compose exec api python manage.py createsuperuser

# Обучить модель рекомендаций (требует данных в БД)
docker compose exec recommender python -m ml.train
```

### Локальная разработка фронтенда

```bash
cd showrooms-frontend
npm install
npm run dev        # http://localhost:5173

cd showrooms-admin
npm install
npm run dev        # http://localhost:5174
```

---

## Структура репозитория

```
diplom/
├── showrooms-api/          # Django REST API
│   ├── apps/               # Приложения Django
│   ├── config/             # Настройки, urls, wsgi
│   ├── docker-compose.yml  # Оркестрация всех сервисов
│   └── Dockerfile
├── showrooms-frontend/     # Клиентский React SPA
│   └── src/
│       ├── app/            # Роутинг, глобальное состояние
│       ├── features/       # Фичи (cars, auth, account, reviews)
│       ├── pages/          # Страницы
│       └── shared/         # Общие утилиты, иконки, стили
├── showrooms-admin/        # Административная панель React SPA
├── showrooms-recommender/  # FastAPI сервис рекомендаций
│   ├── api/                # FastAPI endpoints
│   ├── ml/                 # Обучение и инференс KNN
│   └── db/                 # Подключение к PostgreSQL
└── showrooms-bot/          # Telegram-бот (aiogram 3)
    └── bot/
        ├── handlers/       # Обработчики команд и кнопок
        ├── keyboards/      # Клавиатуры
        └── utils/          # HTTP-клиент к API
```
