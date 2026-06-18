from django.urls import path
from apps.telegram_bot.views import (
    GenerateLinkView,
    ConfirmLinkView,
    UpcomingRemindersView,
    MarkReminderSentView,
    CancelTestDriveView,
    MyDrivesView,
)

urlpatterns = [
    path('telegram/link/', GenerateLinkView.as_view()),
    path('telegram/confirm/', ConfirmLinkView.as_view()),
    path('telegram/upcoming-reminders/', UpcomingRemindersView.as_view()),
    path('telegram/reminders/mark-sent/', MarkReminderSentView.as_view()),
    path('telegram/test-drive/cancel/', CancelTestDriveView.as_view()),
    path('telegram/my-drives/', MyDrivesView.as_view()),
]
