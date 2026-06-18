import requests as http_requests
from rest_framework.views import APIView
from rest_framework.response import Response

from apps.cars.models import Car, CarModel
from apps.cars.serializers.catalog import CarCatalogSerializer
from apps.cars.services.catalog_service import CatalogService
from apps.core.models.enums import CarStatus

RECOMMENDER_URL = "http://recommender:8001/recommend"
RECOMMENDER_MULTI_URL = "http://recommender:8001/recommend_multi"

class RecommendationsView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        car_model_id = request.query_params.get("car_model_id")
        if not car_model_id:
            return Response({"detail": "car_model_id required"}, status=400)

        car = (
            Car.objects
            .filter(trim__car_model_id=car_model_id, status=CarStatus.AVAILABLE)
            .select_related('trim__car_model')
            .order_by('sale_price')
            .first()
        )
        if not car:
            return Response([])

        try:
            resp = http_requests.post(RECOMMENDER_URL, json=_build_car_dict(car), timeout=5)
            car_ids = resp.json().get("recommendations", [])
        except Exception:
            return Response([])

        if not car_ids:
            return Response([])

        result = _build_result(car_ids, excluded_model_ids={str(car_model_id)})
        serializer = CarCatalogSerializer(result, many=True)
        return Response(serializer.data)


def _build_car_dict(car):
    t = car.trim
    cm = t.car_model
    return {
        "id": str(car.id),
        "sale_price": float(car.sale_price),
        "trim": {
            "car_model": {"make": cm.make, "model": cm.model},
            "engine_hp": t.engine_hp,
            "engine_cylinders": t.engine_cylinders,
            "engine_fuel_type": t.engine_fuel_type,
            "transmission_type": t.transmission_type,
            "driven_wheels": t.driven_wheels,
            "vehicle_style": t.vehicle_style,
            "city_mpg": t.city_mpg,
            "highway_mpg": t.highway_mpg,
            "year": t.year,
        },
    }


def _build_result(car_ids, excluded_model_ids):
    cars_qs = (
        Car.objects
        .filter(id__in=car_ids, status=CarStatus.AVAILABLE)
        .select_related('trim__car_model', 'showroom__address', 'dealer')
    )
    car_by_id = {str(c.id): c for c in cars_qs}

    seen_models = set()
    ordered_model_ids = []
    rep_car_by_model = {}

    for car_id in car_ids:
        c = car_by_id.get(car_id)
        if not c:
            continue
        model_id = str(c.trim.car_model_id)
        if model_id in excluded_model_ids or model_id in seen_models:
            continue
        seen_models.add(model_id)
        ordered_model_ids.append(model_id)
        rep_car_by_model[model_id] = c

    if not ordered_model_ids:
        return []

    car_models = {
        str(m.id): m
        for m in CarModel.objects
        .filter(id__in=ordered_model_ids)
        .prefetch_related('trims__images')
    }

    result = []
    for model_id in ordered_model_ids:
        m = car_models.get(model_id)
        if not m:
            continue
        rep = rep_car_by_model[model_id]
        result.append({
            'id': m.id,
            'car_id': rep.id,
            'make': m.make,
            'model': m.model,
            'price_from': rep.sale_price,
            'best_images': CatalogService._get_best_images(m),
            'dealer': {'name': rep.dealer.name} if rep.dealer else None,
            'showroom': {
                'city': rep.showroom.address.city,
                'street': rep.showroom.address.street,
            } if rep.showroom and rep.showroom.address else None,
        })
    return result


class CatalogRecommendationsView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        raw = request.query_params.get("car_model_ids", "")
        car_model_ids = [x.strip() for x in raw.split(",") if x.strip()]
        if not car_model_ids:
            return Response({"detail": "car_model_ids required"}, status=400)

        car_dicts = []
        for model_id in car_model_ids:
            car = (
                Car.objects
                .filter(trim__car_model_id=model_id, status=CarStatus.AVAILABLE)
                .select_related('trim__car_model')
                .order_by('sale_price')
                .first()
            )
            if car:
                car_dicts.append(_build_car_dict(car))

        if not car_dicts:
            return Response([])

        try:
            resp = http_requests.post(RECOMMENDER_MULTI_URL, json=car_dicts, timeout=5)
            car_ids = resp.json().get("recommendations", [])
        except Exception:
            return Response([])

        if not car_ids:
            return Response([])

        result = _build_result(car_ids, excluded_model_ids=set(car_model_ids))
        serializer = CarCatalogSerializer(result, many=True)
        return Response(serializer.data)
