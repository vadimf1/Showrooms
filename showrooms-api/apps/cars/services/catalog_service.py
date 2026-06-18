from django.db.models import Min, Max, Prefetch, Q

from apps.cars.models import Car, CarModel
from apps.core.models.enums import CarStatus

ORDERING_MAP = {
    'price_from':  'price_from',
    '-price_from': '-price_from',
    'make':        'make',
    '-make':       '-make',
    'year':        'max_year',
    '-year':       '-max_year',
}

class CatalogService:

    @staticmethod
    def get_catalog(filters: dict = None) -> list[dict]:
        filters = filters or {}

        car_prefetch_q, annotation_q = CatalogService._build_filters(filters)

        car_models = CatalogService._get_queryset(filters, car_prefetch_q, annotation_q)

        return CatalogService._build_catalog(car_models)

                                                                        

    @staticmethod
    def _build_filters(filters: dict) -> tuple[Q, Q]:
        car_q  = Q(status=CarStatus.AVAILABLE)
        ann_q  = Q(trims__cars__status=CarStatus.AVAILABLE)

        city = filters.get('city')
        if city:
            car_q &= Q(showroom__address__city__icontains=city)
            ann_q &= Q(trims__cars__showroom__address__city__icontains=city)

        year_min = filters.get('year_min')
        if year_min:
            car_q &= Q(trim__year__gte=year_min)
            ann_q &= Q(trims__year__gte=year_min)

        year_max = filters.get('year_max')
        if year_max:
            car_q &= Q(trim__year__lte=year_max)
            ann_q &= Q(trims__year__lte=year_max)

        for field in ('vehicle_style', 'engine_fuel_type', 'transmission_type', 'driven_wheels'):
            value = filters.get(field)
            if value:
                car_q &= Q(**{f'trim__{field}': value})
                ann_q &= Q(**{f'trims__{field}': value})

        return car_q, ann_q

    @staticmethod
    def _get_queryset(filters: dict, car_prefetch_q: Q, annotation_q: Q):
        cheapest_prefetch = Prefetch(
            'trims__cars',
            queryset=(
                Car.objects
                .filter(car_prefetch_q)
                .order_by('sale_price')
                .select_related('trim', 'showroom__address', 'dealer')
            ),
            to_attr='prefetched_cars',
        )

        qs = (
            CarModel.objects
            .annotate(
                price_from=Min('trims__cars__sale_price', filter=annotation_q),
                max_year=Max('trims__year'),
            )
            .prefetch_related(cheapest_prefetch, 'trims__images')
            .filter(price_from__isnull=False)
        )

        search = filters.get('search')
        if search:
            qs = qs.filter(Q(make__icontains=search) | Q(model__icontains=search))

        make = filters.get('make')
        if make:
            qs = qs.filter(make__iexact=make)

        price_min = filters.get('price_min')
        if price_min:
            qs = qs.filter(price_from__gte=price_min)

        price_max = filters.get('price_max')
        if price_max:
            qs = qs.filter(price_from__lte=price_max)

        ordering = filters.get('ordering', 'price_from')
        order_field = ORDERING_MAP.get(ordering, 'price_from')
        qs = qs.order_by(order_field)

        return qs.distinct()

    @staticmethod
    def _build_catalog(car_models) -> list[dict]:
        result = []
        for car_model in car_models:
            cheapest = CatalogService._get_cheapest_car(car_model)
            if not cheapest:
                continue
            result.append({
                'id': car_model.id,
                'car_id': cheapest.id,
                'make': car_model.make,
                'model': car_model.model,
                'price_from': car_model.price_from,
                'best_images': CatalogService._get_best_images(car_model),
                'dealer': {'name': cheapest.dealer.name} if cheapest.dealer else None,
                'showroom': {
                    'city': cheapest.showroom.address.city,
                    'street': cheapest.showroom.address.street,
                } if cheapest.showroom and cheapest.showroom.address else None,
            })
        return result

    @staticmethod
    def _get_cheapest_car(car_model) -> Car | None:
        cheapest = None
        for trim in car_model.trims.all():
            cars = getattr(trim, 'prefetched_cars', [])
            if cars:
                candidate = cars[0]
                if cheapest is None or candidate.sale_price < cheapest.sale_price:
                    cheapest = candidate
        return cheapest

    @staticmethod
    def _get_best_images(car_model) -> list:
        PREFERRED = ('SEDAN', 'COUPE', 'HATCHBACK', 'WAGON', 'SUV', 'CONVERTIBLE', 'PICKUP', 'MINIVAN', 'VAN')
        by_style: dict = {}
        for trim in car_model.trims.all():
            imgs = list(trim.images.all())
            if imgs and trim.vehicle_style not in by_style:
                by_style[trim.vehicle_style] = imgs
        for style in PREFERRED:
            if style in by_style:
                return by_style[style]
        return []
