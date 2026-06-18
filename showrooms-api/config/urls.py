from django.urls import path, include

urlpatterns = [
    path('api/', include('apps.core.urls')),
    path('api/', include('apps.dealerships.urls')),
    path('api/', include('apps.feedback.urls')),
    path('api/', include('apps.cars.urls')),
    path('api/', include('apps.users.urls')),
    path('api/', include('apps.sales.urls')),
    path('api/', include('apps.telegram_bot.urls')),
]
