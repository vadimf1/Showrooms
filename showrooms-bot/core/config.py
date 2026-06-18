from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    bot_token: str
    bot_secret: str
    django_api_url: str
    kafka_bootstrap_servers: str = 'localhost:9092'
    kafka_test_drive_topic: str = 'test-drive-events'
    app_timezone: str = 'Europe/Moscow'

    class Config:
        env_file = ".env"

settings = Settings()