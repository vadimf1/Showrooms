from django.core.management.base import BaseCommand
from django.db import transaction
from apps.cars.models import Car

                              
PALETTE = [
    ("Pearl White",          "#f0efe8"),
    ("Alpine White",         "#f5f5f2"),
    ("Jet Black",            "#111111"),
    ("Obsidian Black",       "#1c1c1e"),
    ("Arctic Silver",        "#c0c0c8"),
    ("Space Silver",         "#a8a8b0"),
    ("Nardo Grey",           "#9b9b9b"),
    ("Mineral Grey",         "#6e6e76"),
    ("Dravit Grey",          "#3a3a42"),
    ("Portimao Blue",        "#1e3a5f"),
    ("Estoril Blue",         "#1c4a8a"),
    ("Moonlight Blue",       "#3a5f8a"),
    ("Barcelona Red",        "#8b1111"),
    ("Melbourne Red",        "#b01020"),
    ("British Racing Green", "#004225"),
    ("Java Green",           "#2d6a4f"),
    ("Sakhir Orange",        "#c45a00"),
    ("Brooklyn Grey",        "#7a7a7a"),
]

class Command(BaseCommand):
    help = "Reassign car colors from expanded realistic palette"

    def handle(self, *args, **options):
        cars = list(Car.objects.order_by('id'))

        to_update = []
        from collections import defaultdict
        trim_seen: dict = defaultdict(set)

        for car in cars:
                                                                                      
            base = hash(str(car.id))
            seen = trim_seen[car.trim_id]
                                                                                        
            for offset in range(len(PALETTE)):
                idx = (base + offset) % len(PALETTE)
                if idx not in seen:
                    break
            seen.add(idx)
            name, hex_ = PALETTE[idx]
            car.color_name = name
            car.color_hex = hex_
            to_update.append(car)

        with transaction.atomic():
            Car.objects.bulk_update(to_update, ['color_name', 'color_hex'], batch_size=500)

        self.stdout.write(self.style.SUCCESS(
            f"Updated {len(to_update)} cars with {len(PALETTE)}-color palette."
        ))
