from apps.cars.models import Car, CarTrim
from apps.core.models.enums import CarStatus

BODY_ORDER = ['SEDAN', 'WAGON', 'COUPE', 'HATCHBACK', 'SUV', 'CONVERTIBLE', 'PICKUP', 'MINIVAN', 'VAN']

class ConfigureService:

    @staticmethod
    def configure(model_id, body=None, hp=None, fuel=None, trans=None, drive=None, color=None):
                                                    
        all_trims = list(
            CarTrim.objects
            .filter(car_model_id=model_id)
            .prefetch_related('images')
        )
        all_cars = list(
            Car.objects
            .filter(trim__car_model_id=model_id, status=CarStatus.AVAILABLE)
            .select_related('trim', 'showroom__address', 'dealer')
        )

        cars_by_trim = {}
        for car in all_cars:
            cars_by_trim.setdefault(car.trim_id, []).append(car)

        def trim_cars(t):
            return cars_by_trim.get(t.id, [])

                                                                                
        body_trims = [t for t in all_trims if t.vehicle_style == body] if body else all_trims

        engine_map = {}
        for t in body_trims:
            count = len(trim_cars(t))
            if count:
                key = (t.engine_hp, t.engine_fuel_type)
                engine_map[key] = engine_map.get(key, 0) + count
        available_engines = sorted(
            [{'hp': k[0], 'fuel': k[1], 'count': v} for k, v in engine_map.items()],
            key=lambda x: x['hp'] or 0,
        )

        body_map = {}
        for t in all_trims:
            count = len(trim_cars(t))
            if count:
                style = t.vehicle_style
                body_map[style] = body_map.get(style, 0) + count
        available_bodies = sorted(
            [{'style': k, 'count': v} for k, v in body_map.items()],
            key=lambda x: BODY_ORDER.index(x['style']) if x['style'] in BODY_ORDER else 99,
        )

                                                                                
        engine_trims = (
            [t for t in body_trims if t.engine_hp == hp and t.engine_fuel_type == fuel]
            if hp is not None else body_trims
        )

        trans_map = {}
        for t in engine_trims:
            count = len(trim_cars(t))
            if count:
                trans_map[t.transmission_type] = trans_map.get(t.transmission_type, 0) + count
        available_trans = [{'trans': k, 'count': v} for k, v in trans_map.items()]

                                                                                
        trans_trims = [t for t in engine_trims if t.transmission_type == trans] if trans else engine_trims

        drive_map = {}
        for t in trans_trims:
            count = len(trim_cars(t))
            if count:
                drive_map[t.driven_wheels] = drive_map.get(t.driven_wheels, 0) + count
        available_drives = [{'drive': k, 'count': v} for k, v in drive_map.items()]

                                                                                
        matching_trims = [t for t in trans_trims if t.driven_wheels == drive] if drive else trans_trims
        matching_cars = [car for t in matching_trims for car in trim_cars(t)]

        color_map = {}
        for car in matching_cars:
            if car.color_hex not in color_map:
                color_map[car.color_hex] = {'hex': car.color_hex, 'name': car.color_name, 'count': 0}
            color_map[car.color_hex]['count'] += 1
        available_colors = list(color_map.values())

        prices = [c.sale_price for c in matching_cars]
        matching = {
            'price_from': str(min(prices)) if prices else None,
            'stock_count': len(matching_cars),
            'years': sorted({t.year for t in matching_trims}),
        }

        specs = None
        if matching_trims:
            t = matching_trims[0]
            specs = {
                'hp': t.engine_hp,
                'fuel': t.engine_fuel_type,
                'trans': t.transmission_type,
                'drive': t.driven_wheels,
                'doors': t.number_of_doors,
                'highway_mpg': t.highway_mpg,
                'city_mpg': t.city_mpg,
            }

                                                                               
        stock_cars = [c for c in matching_cars if c.color_hex == color] if color else matching_cars
        groups_map = {}
        for car in stock_cars:
            key = str(car.showroom.id) if car.showroom else 'unknown'
            if key not in groups_map:
                groups_map[key] = {
                    'showroom_id': str(car.showroom.id) if car.showroom else None,
                    'showroom': car.showroom.name if car.showroom else '—',
                    'city': car.showroom.address.city if car.showroom and car.showroom.address else '—',
                    'address': car.showroom.address.street if car.showroom and car.showroom.address else '',
                    'price_from': None,
                    'cars': [],
                }
            groups_map[key]['cars'].append(car)
            p = car.sale_price
            if groups_map[key]['price_from'] is None or p < groups_map[key]['price_from']:
                groups_map[key]['price_from'] = p
        for g in groups_map.values():
            if g['price_from'] is not None:
                g['price_from'] = str(g['price_from'])
        stock_groups = list(groups_map.values())

                                                                                
        seen = set()
        gallery_images = []
        for t in matching_trims:
            imgs = list(t.images.all())
            color_specific = [i for i in imgs if not i.is_default and i.color_hex == color] if color else []
            defaults = [i for i in imgs if i.is_default]
            for img in (color_specific if color_specific else defaults):
                if img.id not in seen:
                    seen.add(img.id)
                    gallery_images.append(img)

        return {
            'available_bodies': available_bodies,
            'available_engines': available_engines,
            'available_trans': available_trans,
            'available_drives': available_drives,
            'available_colors': available_colors,
            'matching': matching,
            'specs': specs,
            'stock_groups': stock_groups,
            'gallery_images': gallery_images,
        }

                                                                               

    @staticmethod
    def configurations(model_id):
        all_trims = list(CarTrim.objects.filter(car_model_id=model_id))
        all_cars = list(
            Car.objects
            .filter(trim__car_model_id=model_id, status=CarStatus.AVAILABLE)
            .select_related('trim')
        )

        cars_by_trim = {}
        for car in all_cars:
            cars_by_trim.setdefault(car.trim_id, []).append(car)

        body_map = {}
        for t in all_trims:
            count = len(cars_by_trim.get(t.id, []))
            if count:
                body_map[t.vehicle_style] = body_map.get(t.vehicle_style, 0) + count
        available_bodies = sorted(
            [{'style': k, 'count': v} for k, v in body_map.items()],
            key=lambda x: BODY_ORDER.index(x['style']) if x['style'] in BODY_ORDER else 99,
        )

        combo_map = {}
        for t in all_trims:
            cars = cars_by_trim.get(t.id, [])
            if not cars:
                continue
            key = (t.vehicle_style, t.engine_hp, t.engine_fuel_type, t.transmission_type, t.driven_wheels)
            if key not in combo_map:
                combo_map[key] = {
                    'body': t.vehicle_style,
                    'hp': t.engine_hp,
                    'fuel': t.engine_fuel_type,
                    'trans': t.transmission_type,
                    'drive': t.driven_wheels,
                    'stock_count': 0,
                    'price_from': None,
                    'specs': {
                        'doors': t.number_of_doors,
                        'highway_mpg': t.highway_mpg,
                        'city_mpg': t.city_mpg,
                    },
                }
            combo_map[key]['stock_count'] += len(cars)
            prices = [c.sale_price for c in cars]
            if prices:
                min_p = min(prices)
                if combo_map[key]['price_from'] is None or min_p < combo_map[key]['price_from']:
                    combo_map[key]['price_from'] = min_p

        configurator_options = [
            {**v, 'price_from': str(v['price_from']) if v['price_from'] else None}
            for v in combo_map.values()
        ]

        return {'available_bodies': available_bodies, 'configurator_options': configurator_options}

                                                                                

    @staticmethod
    def stock(model_id, body, hp, fuel, trans, drive, color=None):
        trims = list(
            CarTrim.objects
            .filter(
                car_model_id=model_id,
                vehicle_style=body,
                engine_hp=hp,
                engine_fuel_type=fuel,
                transmission_type=trans,
                driven_wheels=drive,
            )
            .prefetch_related('images')
        )

        all_cars = list(
            Car.objects
            .filter(trim__in=trims, status=CarStatus.AVAILABLE)
            .select_related('showroom__address')
        )

        color_map = {}
        for car in all_cars:
            if car.color_hex not in color_map:
                color_map[car.color_hex] = {'hex': car.color_hex, 'name': car.color_name, 'count': 0}
            color_map[car.color_hex]['count'] += 1
        colors = list(color_map.values())

        prices = [c.sale_price for c in all_cars]
        years = sorted({t.year for t in trims})
        matching = {
            'price_from': str(min(prices)) if prices else None,
            'stock_count': len(all_cars),
            'years': years,
        }

        stock_cars = [c for c in all_cars if c.color_hex == color] if color else all_cars

        groups_map = {}
        for car in stock_cars:
            key = str(car.showroom.id) if car.showroom else 'unknown'
            if key not in groups_map:
                groups_map[key] = {
                    'showroom_id': str(car.showroom.id) if car.showroom else None,
                    'showroom': car.showroom.name if car.showroom else '—',
                    'city': car.showroom.address.city if car.showroom and car.showroom.address else '—',
                    'address': car.showroom.address.street if car.showroom and car.showroom.address else '',
                    'price_from': None,
                    'cars': [],
                }
            groups_map[key]['cars'].append(car)
            p = car.sale_price
            if groups_map[key]['price_from'] is None or p < groups_map[key]['price_from']:
                groups_map[key]['price_from'] = p
        for g in groups_map.values():
            if g['price_from'] is not None:
                g['price_from'] = str(g['price_from'])
        groups = list(groups_map.values())

        seen = set()
        gallery_images = []
        trim_map = {t.id: t for t in trims}
        seen_trims = set()
        for car in stock_cars:
            t = trim_map.get(car.trim_id)
            if not t or t.id in seen_trims:
                continue
            seen_trims.add(t.id)
            imgs = list(t.images.all())
            if color:
                imgs_to_show = [i for i in imgs if not i.is_default and i.color_hex == color]
            else:
                imgs_to_show = [i for i in imgs if i.is_default]
            for img in imgs_to_show:
                if img.id not in seen:
                    seen.add(img.id)
                    gallery_images.append(img)

        return {
            'colors': colors,
            'matching': matching,
            'groups': groups,
            'gallery_images': gallery_images,
        }
