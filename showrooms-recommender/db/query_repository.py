from sqlalchemy import text
from sqlalchemy.orm import Session

def get_cars(db: Session):
    query = text("""
        SELECT DISTINCT ON (c.trim_id, c.sale_price)
            c.id,
            c.sale_price,

            cm.make,
            cm.model,

            ct.year,
            ct.engine_hp,
            ct.engine_cylinders,
            ct.engine_fuel_type,
            ct.transmission_type,
            ct.driven_wheels,
            ct.number_of_doors,
            ct.vehicle_style,
            ct.city_mpg,
            ct.highway_mpg

        FROM cars_car c
        JOIN cars_cartrim ct ON c.trim_id = ct.id
        JOIN cars_carmodel cm ON ct.car_model_id = cm.id

        WHERE c.status = 'AVAILABLE'

        ORDER BY c.trim_id, c.sale_price, c.id;
    """)
    return db.execute(query).fetchall()