from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from apps.users.jwt_authentication import JWTAuthentication
from apps.feedback.models import Review
from apps.cars.models.car_model import CarModel
from apps.sales.models.test_drive import TestDrive

def _require_auth(request):
    user = request.user
    if not user or not hasattr(user, 'id'):
        return None, Response({'detail': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
    return user, None

class ReviewCreateView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = []

    def post(self, request):
        user, err = _require_auth(request)
        if err:
            return err

        review_type = request.data.get('type')
        object_id = request.data.get('object_id')
        rating = request.data.get('rating')
        description = (request.data.get('description') or '').strip()

        if review_type not in ('car_model', 'test_drive'):
            return Response({'detail': 'type must be car_model or test_drive'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            rating = int(rating)
            if not 1 <= rating <= 5:
                raise ValueError
        except (TypeError, ValueError):
            return Response({'detail': 'rating must be 1–5'}, status=status.HTTP_400_BAD_REQUEST)

        if len(description) < 3:
            return Response({'detail': 'description too short'}, status=status.HTTP_400_BAD_REQUEST)

        if review_type == 'car_model':
            try:
                car_model = CarModel.objects.get(id=object_id)
            except CarModel.DoesNotExist:
                return Response({'detail': 'Car model not found'}, status=status.HTTP_404_NOT_FOUND)

            if Review.objects.filter(user=user, car_model=car_model).exists():
                return Response({'detail': 'Already reviewed'}, status=status.HTTP_400_BAD_REQUEST)

            review = Review.objects.create(
                user=user, car_model=car_model,
                rating=rating, description=description,
            )

        else:
            try:
                td = TestDrive.objects.get(id=object_id, user=user)
            except TestDrive.DoesNotExist:
                return Response({'detail': 'Test drive not found'}, status=status.HTTP_404_NOT_FOUND)

            if hasattr(td, 'review'):
                return Response({'detail': 'Already reviewed'}, status=status.HTTP_400_BAD_REQUEST)

            review = Review.objects.create(
                user=user, test_drive=td,
                rating=rating, description=description,
            )

        return Response({
            'id': str(review.id),
            'rating': review.rating,
            'description': review.description,
            'created_at': review.created_at.isoformat(),
        }, status=status.HTTP_201_CREATED)

class MyReviewsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = []

    def get(self, request):
        user, err = _require_auth(request)
        if err:
            return err

        reviews = Review.objects.filter(user=user).select_related('car_model', 'test_drive')

        car_model_reviews = {}
        test_drive_reviews = {}

        for r in reviews:
            data = {
                'id': str(r.id),
                'rating': r.rating,
                'description': r.description,
                'created_at': r.created_at.isoformat(),
            }
            if r.car_model_id:
                car_model_reviews[str(r.car_model_id)] = data
            elif r.test_drive_id:
                test_drive_reviews[str(r.test_drive_id)] = data

        return Response({'car_model': car_model_reviews, 'test_drive': test_drive_reviews})
