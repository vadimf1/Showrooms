import csv
import os
from django.core.management.base import BaseCommand
from apps.cars.models import CarTrim

FUEL_MAP = {
    'regular unleaded': 'GASOLINE',
    'premium unleaded (required)': 'GASOLINE',
    'premium unleaded (recommended)': 'GASOLINE',
    'diesel': 'DIESEL',
    'electric': 'ELECTRIC',
}
TRANS_MAP = {'AUTOMATED_MANUAL': 'ROBOT'}
WHEEL_MAP = {
    'front wheel drive': 'FWD', 'rear wheel drive': 'RWD',
    'all wheel drive': 'AWD', 'four wheel drive': '4WD',
}
STYLE_MAP = {
    "Sedan": "SEDAN", "4dr SUV": "SUV", "2dr SUV": "SUV",
    "Convertible SUV": "SUV", "Coupe": "COUPE", "Convertible": "CONVERTIBLE",
    "4dr Hatchback": "HATCHBACK", "2dr Hatchback": "HATCHBACK",
    "Wagon": "WAGON", "Extended Cab Pickup": "PICKUP",
    "Crew Cab Pickup": "PICKUP", "Regular Cab Pickup": "PICKUP",
    "Passenger Minivan": "MINIVAN", "Cargo Minivan": "MINIVAN",
    "Passenger Van": "VAN", "Cargo Van": "VAN",
}
VALID_FUELS = set(FUEL_MAP.values())
VALID_TRANS = {'MANUAL', 'AUTOMATIC', 'ROBOT', 'CVT'}

STYLE_LABELS = {
    'SEDAN': 'Sedan', 'WAGON': 'Wagon', 'COUPE': 'Coupe',
    'CONVERTIBLE': 'Convertible', 'HATCHBACK': 'Hatchback',
    'SUV': 'SUV', 'PICKUP': 'Pickup', 'MINIVAN': 'Minivan', 'VAN': 'Van',
}

def category_to_name(raw_category: str, vehicle_style: str = '', driven_wheels: str = '') -> str:
    raw = raw_category.strip()
    if not raw or raw == "N/A":
        style = STYLE_LABELS.get(vehicle_style, '')
        drive = driven_wheels if driven_wheels not in ('FWD', '') else ''
        if drive and style:
            return f"{drive} {style}"
        return style or "Base"
    cats = {c.strip() for c in raw.split(",")}
                                  
    if "Factory Tuner" in cats:
        return "Tuner"
                   
    if "Exotic" in cats and "High-Performance" in cats:
        return "Exotic"
    if "Exotic" in cats:
        return "Exotic"
                       
    if "High-Performance" in cats and "Luxury" in cats:
        return "Sport Premium"
    if "High-Performance" in cats:
        return "Sport+"
    if "Performance" in cats and "Luxury" in cats and "Crossover" in cats:
        return "Sport Premium"
    if "Performance" in cats and "Luxury" in cats:
        return "Sport Luxury"
    if "Performance" in cats and "Crossover" in cats:
        return "Sport Crossover"
    if "Performance" in cats:
        return "Sport"
                        
    if "Luxury" in cats and "Crossover" in cats:
        return "Premium"
    if "Luxury" in cats:
        return "Premium"
    if "Crossover" in cats:
        return "Crossover"
                                                     
    for special in ("Hybrid", "Diesel", "Flex Fuel", "Hatchback"):
        if special in cats:
            return special
    return cats.pop().title()

class Command(BaseCommand):
    help = "Update CarTrim names from Market Category column in cars_dataset.csv"

    def handle(self, *args, **options):
                                                                  
                                                              
        csv_path = os.path.normpath(os.path.join(
            os.path.dirname(os.path.abspath(__file__)),
            '../../../../cars_dataset.csv',
        ))

        if not os.path.exists(csv_path):
            self.stderr.write(f"CSV not found at {csv_path}")
            return

                                               
        key_to_name: dict[tuple, str] = {}
        kept = 0
        skipped = 0

        with open(csv_path, newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                fuel = FUEL_MAP.get(row['Engine Fuel Type'])
                if fuel is None:
                    skipped += 1
                    continue
                trans = TRANS_MAP.get(row['Transmission Type'], row['Transmission Type'])
                if trans not in VALID_TRANS:
                    skipped += 1
                    continue
                if not row.get('Number of Doors') or row['Number of Doors'] in ('', 'nan'):
                    skipped += 1
                    continue
                style = STYLE_MAP.get(row['Vehicle Style'], row['Vehicle Style'])
                wheels = WHEEL_MAP.get(row['Driven_Wheels'], row['Driven_Wheels'])
                hp_raw = row['Engine HP'].strip() if row['Engine HP'].strip() else None
                hp = int(float(hp_raw)) if hp_raw else None

                key = (
                    row['Make'].strip(),
                    row['Model'].strip(),
                    int(float(row['Year'])),
                    fuel,
                    hp,
                    trans,
                    wheels,
                    style,
                    int(float(row['highway MPG'])),
                    int(float(row['city mpg'])),
                )
                name = category_to_name(
                    row.get('Market Category', ''),
                    vehicle_style=style,
                    driven_wheels=wheels,
                )
                                                                                                   
                key_to_name[key] = name
                kept += 1

        self.stdout.write(f"Loaded {kept} rows from CSV ({skipped} skipped)")

                                              
        trims = list(CarTrim.objects.select_related('car_model').all())

        to_update = [
            t for t in trims
            if key_to_name.get((
                t.car_model.make, t.car_model.model, t.year,
                t.engine_fuel_type, t.engine_hp, t.transmission_type,
                t.driven_wheels, t.vehicle_style, t.highway_mpg, t.city_mpg,
            )) is not None
        ]
        for t in to_update:
            t.name = key_to_name[(
                t.car_model.make, t.car_model.model, t.year,
                t.engine_fuel_type, t.engine_hp, t.transmission_type,
                t.driven_wheels, t.vehicle_style, t.highway_mpg, t.city_mpg,
            )]
        CarTrim.objects.bulk_update(to_update, ['name'])

        not_updated = len(trims) - len(to_update)
        self.stdout.write(self.style.SUCCESS(
            f"Updated {len(to_update)} trims. {not_updated} trims had no CSV match (left unchanged)."
        ))
