from contextlib import asynccontextmanager
from fastapi import FastAPI, Body
from apscheduler.schedulers.background import BackgroundScheduler

from ml.recommend import get_recommendations, get_multi_recommendations
from ml.train import retrain_and_reload

@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler = BackgroundScheduler()
    scheduler.add_job(retrain_and_reload, "interval", hours=24, id="retrain")
    scheduler.start()
    print("Scheduler started: retraining every 24 hours.")
    yield
    scheduler.shutdown()

app = FastAPI(title="Car Recommender API", lifespan=lifespan)

@app.post("/recommend")
def recommend(car: dict = Body(...)):
    try:
        result = get_recommendations(car, n=10)
        return {"recommendations": result}
    except Exception as e:
        return {"error": str(e)}

@app.post("/recommend_multi")
def recommend_multi(cars: list = Body(...)):
    try:
        result = get_multi_recommendations(cars, n=15)
        return {"recommendations": result}
    except Exception as e:
        return {"error": str(e)}
