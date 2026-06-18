from sklearn.neighbors import NearestNeighbors
import joblib
from db.database import SessionLocal
from services.data_loader import load_dataframe
from ml.preprocessing import build_preprocessor

def train():
    db = SessionLocal()

    df = load_dataframe(db)

    X, preprocessor = build_preprocessor(df)

    model = NearestNeighbors(n_neighbors=15, metric="euclidean")
    model.fit(X)

    joblib.dump(model, "ml/model/knn.pkl")
    joblib.dump(preprocessor, "ml/model/preprocessor.pkl")
    joblib.dump(df, "ml/model/df.pkl")

    db.close()

    print("Model trained!")

def retrain_and_reload():
    print("Retraining model...")
    train()
    from ml.recommend import reload_artifacts
    reload_artifacts()
    print("Model reloaded into memory.")

if __name__ == "__main__":
    train()