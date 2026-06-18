from django.db import models

class Role(models.TextChoices):
    CLIENT = 'CLIENT', 'Client'
    EMPLOYEE = 'EMPLOYEE', 'Employee'
    ADMIN = 'ADMIN', 'Admin'

class ContactType(models.TextChoices):
    PHONE = 'PHONE', 'Phone'
    EMAIL = 'EMAIL', 'Email'
    SOCIAL_MEDIA = 'SOCIAL_MEDIA', 'Social media'
    FAX = 'FAX', 'Fax'

class CarStatus(models.TextChoices):
    AVAILABLE = 'AVAILABLE', 'Available'
    RESERVED = 'RESERVED', 'Reserved'
    SOLD = 'SOLD', 'Sold'
    SERVICE = 'SERVICE', 'Service'

class DrivenWheels(models.TextChoices):
    FWD = 'FWD', 'Передний привод'
    RWD = 'RWD', 'Задний привод'
    AWD = 'AWD', 'Постоянный полный привод'
    FOUR_WD = '4WD', 'Подключаемый полный привод'

class EngineFuelType(models.TextChoices):
    GASOLINE = "GASOLINE", "Бензин"
    DIESEL = "DIESEL", "Дизель"
    ELECTRIC = "ELECTRIC", "Электро"

class TransmissionType(models.TextChoices):
    AUTOMATIC = "AUTOMATIC", "Автоматический"
    MANUAL = "MANUAL", "Механический"
    ROBOT = "ROBOT", "Робот"
    DIRECT_DRIVE = "DIRECT_DRIVE", "Прямой привод (без коробки передач)"

class VehicleStyle(models.TextChoices):
    SEDAN = "SEDAN", "Седан"
    SUV = "SUV", "Внедорожник"
    COUPE = "COUPE", "Купе"
    CONVERTIBLE = "CONVERTIBLE", "Кабриолет"
    HATCHBACK = "HATCHBACK", "Хэтчбек"
    WAGON = "WAGON", "Универсал"
    PICKUP = "PICKUP", "Пикап"
    MINIVAN = "MINIVAN", "Минивэн"
    VAN = "VAN", "Фургон"
