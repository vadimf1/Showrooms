from django.urls import path
from rest_framework.routers import DefaultRouter

from apps.feedback.views import ContactViewSet, ReviewCreateView, MyReviewsView

router = DefaultRouter()
router.register(r'contacts', ContactViewSet, basename='contact')

urlpatterns = router.urls + [
    path('reviews/', ReviewCreateView.as_view()),
    path('reviews/mine/', MyReviewsView.as_view()),
]
