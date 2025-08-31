import requests
import pandas as pd
import joblib
from fastapi import FastAPI
from datetime import datetime
import os
import threading
import time

app = FastAPI()

# ---------- CONFIG ----------
BLYNK_TOKEN = "SwxOLEdibSmaMRxiXfmX-Wz-U6t5dkDH"
BLYNK_BASE = "https://blynk.cloud/external/api/get"
VIRTUAL_PINS = {
    "soil_moist": "V2",
    "temp": "V0",
    "humidity": "V1",
    "light": "V3",
    "soil_temp": "V4"
}
AREA_HA = 2.0
C_TO_CO2_EQ = 3.67
HISTORY_FILE = "carbon_history.csv"
POLL_INTERVAL_MIN = 0.1 # minutes

# ---------- LOAD MODEL ----------
model = joblib.load("best_catboost_no_crop.pkl")

# ---------- FETCH FROM BLYNK ----------
def get_sensor_data():
    readings = {}
    for feature, vpin in VIRTUAL_PINS.items():
        r = requests.get(f"{BLYNK_BASE}?token={BLYNK_TOKEN}&{vpin}")

        print(f"{feature} from pin {vpin} -> {r.status_code}: {r.text}")

        readings[feature] = float(r.text) if r.ok else None
    return readings

# ---------- CALCULATE CREDITS ----------
def calculate_incremental_credits(pred_coef, elapsed_hours):
    annual_credits = pred_coef * AREA_HA * C_TO_CO2_EQ
    hourly_rate = annual_credits / (365 * 24)
    return hourly_rate * elapsed_hours

# ---------- SAVE READING ----------
def save_reading(pred_coef, sensor_data, elapsed_hours):
    if os.path.exists(HISTORY_FILE):
        history = pd.read_csv(HISTORY_FILE)
        total_credits = history.iloc[-1]["total_credits_tCO2e"]
    else:
        total_credits = 0

    incremental_credits = calculate_incremental_credits(pred_coef, elapsed_hours)
    total_credits += incremental_credits

    now = datetime.now()
    new_row = {
        "timestamp": now,
        "pred_coef_tCha_year": pred_coef,
        "annual_rate_tCO2e": pred_coef * AREA_HA * C_TO_CO2_EQ,
        "incremental_credits_tCO2e": incremental_credits,
        "total_credits_tCO2e": total_credits,
        **sensor_data
    }

    df = pd.DataFrame([new_row])
    if os.path.exists(HISTORY_FILE):
        df.to_csv(HISTORY_FILE, mode="a", header=False, index=False)
    else:
        df.to_csv(HISTORY_FILE, index=False)

# ---------- POLLING LOOP ----------
def polling_loop():
    last_time = datetime.now()
    while True:
        sensor_data = get_sensor_data()
        sensor_data["area_ha"] = AREA_HA
        sensor_data["moisture_temp"] = sensor_data["soil_moist"] * sensor_data["temp"]
        sensor_data["moisture2"] = sensor_data["soil_moist"] ** 2

        pred_coef = model.predict(pd.DataFrame([sensor_data]))[0]

        now = datetime.now()
        elapsed_hours = (now - last_time).total_seconds() / 3600
        save_reading(pred_coef, sensor_data, elapsed_hours)
        last_time = now

        time.sleep(POLL_INTERVAL_MIN * 60)

# ---------- START POLLING IN BACKGROUND ----------
threading.Thread(target=polling_loop, daemon=True).start()

# ---------- API ROUTES ----------
@app.get("/predict")
def manual_predict():
    """Manual trigger - useful for testing"""
    sensor_data = get_sensor_data()
    sensor_data["area_ha"] = AREA_HA
    sensor_data["moisture_temp"] = sensor_data["soil_moist"] * sensor_data["temp"]
    sensor_data["moisture2"] = sensor_data["soil_moist"] ** 2
    
    pred_coef = model.predict(pd.DataFrame([sensor_data]))[0]
    return {
        "sensor_data": sensor_data,
        "pred_coef_tCha_year": round(pred_coef, 3),
        "annual_rate_tCO2e": round(pred_coef * AREA_HA * C_TO_CO2_EQ, 2)
    }

@app.get("/total")
def get_total_credits():
    if os.path.exists(HISTORY_FILE):
        history = pd.read_csv(HISTORY_FILE)
        return {
            "total_credits_tCO2e": round(history.iloc[-1]["total_credits_tCO2e"], 4),
            "last_timestamp": history.iloc[-1]["timestamp"]
        }
    return {"total_credits_tCO2e": 0, "last_timestamp": None}
