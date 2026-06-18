from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer

def build_preprocessor(df):
    numeric_features = [
        "sale_price",
        "engine_hp",
        "engine_cylinders",
        "city_mpg",
        "year",
        "highway_mpg",
    ]

    categorical_features = [
        "engine_fuel_type",
        "transmission_type",
        "driven_wheels",
        "vehicle_style",
    ]

    preprocessor = ColumnTransformer([
        ("num", StandardScaler(), numeric_features),
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_features),
    ])

    X = preprocessor.fit_transform(df)

    return X, preprocessor