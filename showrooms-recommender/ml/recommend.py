import joblib
import numpy as np
import pandas as pd

_state: dict = {}

def _load_artifacts():
    _state["model"] = joblib.load("ml/model/knn.pkl")
    _state["preprocessor"] = joblib.load("ml/model/preprocessor.pkl")
    _state["df"] = joblib.load("ml/model/df.pkl")

_load_artifacts()

def reload_artifacts():
    _load_artifacts()

def _car_to_row(car: dict) -> dict:
    trim = car["trim"]
    return {
        "sale_price": float(car["sale_price"]),
        "make": trim["car_model"]["make"],
        "model": trim["car_model"]["model"],
        "engine_hp": trim["engine_hp"] or 0,
        "engine_cylinders": trim["engine_cylinders"] or 0,
        "engine_fuel_type": trim["engine_fuel_type"],
        "transmission_type": trim["transmission_type"],
        "driven_wheels": trim["driven_wheels"],
        "vehicle_style": trim["vehicle_style"],
        "city_mpg": trim["city_mpg"],
        "highway_mpg": trim["highway_mpg"],
        "year": trim["year"],
    }

def _knn_search(X_query, excluded_ids: set, n: int):
    model = _state["model"]
    df = _state["df"]

    distances, indices = model.kneighbors(X_query, n_neighbors=60)
    similar_indices = indices.flatten()
    distances = distances.flatten()

    result_df = df.iloc[similar_indices].copy()
    result_df["distance"] = distances
    result_df = result_df[~result_df["id"].isin(excluded_ids)]
    result_df = result_df.sort_values("distance")
    result_df = result_df.drop_duplicates(subset=["make", "model"], keep="first")
    result_df = result_df.head(n)
    return result_df["id"].tolist()


def get_recommendations(car: dict, n: int = 10):
    preprocessor = _state["preprocessor"]
    input_df = pd.DataFrame([_car_to_row(car)])
    X_input = preprocessor.transform(input_df)
    return _knn_search(X_input, excluded_ids={car["id"]}, n=n)


def get_multi_recommendations(cars: list, n: int = 15):
    preprocessor = _state["preprocessor"]
    input_df = pd.DataFrame([_car_to_row(c) for c in cars])
    X_input = preprocessor.transform(input_df)
    if hasattr(X_input, "toarray"):
        X_input = X_input.toarray()
    X_mean = np.mean(X_input, axis=0, keepdims=True)
    excluded_ids = {c["id"] for c in cars}
    return _knn_search(X_mean, excluded_ids=excluded_ids, n=n)