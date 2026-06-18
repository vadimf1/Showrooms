import pandas as pd
from db.query_repository import get_cars

def load_dataframe(db):
    rows = get_cars(db)

    df = pd.DataFrame(rows)

    df = df.fillna({
        "engine_hp": 0,
        "engine_cylinders": 0,
    })

    return df