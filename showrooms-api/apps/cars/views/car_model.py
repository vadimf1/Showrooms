from django.shortcuts import get_object_or_404
from django.db.models import Prefetch
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from apps.feedback.models import Review

from apps.cars.models import CarModel, Car
from apps.cars.serializers.car_model import CarModelSerializer
from apps.cars.serializers.car_model_detail import CarModelDetailSerializer
from apps.cars.serializers.configure import (
    ConfigureResponseSerializer,
    ConfigurationsResponseSerializer,
    StockResponseSerializer,
)
from apps.cars.services.configure_service import ConfigureService
from apps.core.models.enums import CarStatus

class CarModelViewSet(ModelViewSet):
    serializer_class = CarModelSerializer

    def get_queryset(self):
        if self.action in ('retrieve', 'configure', 'configurations', 'stock'):
            available_cars = (
                Car.objects
                .filter(status=CarStatus.AVAILABLE)
                .select_related('dealer', 'showroom', 'showroom__address')
            )
            return CarModel.objects.prefetch_related(
                Prefetch('trims__cars', queryset=available_cars, to_attr='available_cars'),
                'trims__images',
            )
        return CarModel.objects.all()

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CarModelDetailSerializer
        return CarModelSerializer

    @action(detail=True, methods=['get'])
    def configure(self, request, pk=None):
        get_object_or_404(CarModel, pk=pk)

        hp_raw = request.query_params.get('hp')
        data = ConfigureService.configure(
            model_id=pk,
            body=request.query_params.get('body') or None,
            hp=int(hp_raw) if hp_raw else None,
            fuel=request.query_params.get('fuel') or None,
            trans=request.query_params.get('trans') or None,
            drive=request.query_params.get('drive') or None,
            color=request.query_params.get('color') or None,
        )
        return Response(ConfigureResponseSerializer(data, context={'request': request}).data)

    @action(detail=True, methods=['get'])
    def configurations(self, request, pk=None):
        get_object_or_404(CarModel, pk=pk)
        data = ConfigureService.configurations(model_id=pk)
        return Response(ConfigurationsResponseSerializer(data, context={'request': request}).data)

    @action(detail=True, methods=['get'])
    def stock(self, request, pk=None):
        get_object_or_404(CarModel, pk=pk)
        p = request.query_params
        hp_raw = p.get('hp')
        body  = p.get('body')
        fuel  = p.get('fuel')
        trans = p.get('trans')
        drive = p.get('drive')
        if not all([body, hp_raw, fuel, trans, drive]):
            return Response({'detail': 'body, hp, fuel, trans, drive are required.'}, status=400)
        data = ConfigureService.stock(
            model_id=pk,
            body=body,
            hp=int(hp_raw),
            fuel=fuel,
            trans=trans,
            drive=drive,
            color=p.get('color') or None,
        )
        return Response(StockResponseSerializer(data, context={'request': request}).data)

    @action(detail=True, methods=['get'])
    def reviews(self, request, pk=None):
        get_object_or_404(CarModel, pk=pk)

        qs = (
            Review.objects
            .filter(car_model_id=pk)
            .select_related('user__client')
            .order_by('-created_at')
        )

        results = []
        for r in qs:
            client = getattr(r.user, 'client', None) if r.user else None
            if client:
                first = client.first_name or ''
                last  = client.last_name  or ''
                author   = f"{first} {last[0]}." if last else first or 'Аноним'
                initials = ((first[0] if first else '') + (last[0] if last else '')).upper() or 'А'
            else:
                author, initials = 'Аноним', 'А'

            results.append({
                'id':          str(r.id),
                'author':      author,
                'initials':    initials,
                'rating':      r.rating,
                'description': r.description,
                'created_at':  r.created_at.isoformat(),
            })

        avg = round(sum(r['rating'] for r in results) / len(results), 1) if results else 0

        return Response({
            'count':      len(results),
            'avg_rating': avg,
            'results':    results,
        })
