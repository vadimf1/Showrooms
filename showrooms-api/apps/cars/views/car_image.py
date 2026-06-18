from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet
from rest_framework.mixins import CreateModelMixin, DestroyModelMixin

from apps.cars.models import CarTrimImage
from apps.cars.serializers.car_image import CarTrimImageUploadSerializer, CarTrimImageSerializer

class CarImageViewSet(CreateModelMixin, DestroyModelMixin, GenericViewSet):
    queryset = CarTrimImage.objects.all()
    serializer_class = CarTrimImageUploadSerializer
    parser_classes = [MultiPartParser, FormParser]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        return Response(
            CarTrimImageSerializer(instance).data,
            status=status.HTTP_201_CREATED,
        )