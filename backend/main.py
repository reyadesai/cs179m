from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import joblib
import pandas as pd
import numpy as np
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","https://cs179m.vercel.app","https://cs179m-production-c459.up.railway.app"],
    #allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# # Load model
# BUNDLE_PATH = os.path.join(os.path.dirname(__file__), "lgbm_overall_score.pkl")

# try:
#     bundle = joblib.load(BUNDLE_PATH)
#     model = bundle["model"]
#     features = bundle["features"]
#     print("Model loaded. Features:", features)
# except Exception as e:
#     print(f"WARNING: Could not load model: {e}")
#     model = None
#     features = []

# --------- TEST---------
import traceback
import joblib

BUNDLE_PATH = os.path.join(os.path.dirname(__file__), "lgbm_overall_score.pkl")
print("DEBUG __file__ =", __file__)
print("DEBUG cwd =", os.getcwd())
print("DEBUG bundle path =", BUNDLE_PATH)
print("DEBUG bundle exists =", os.path.exists(BUNDLE_PATH))

try:
    bundle = joblib.load(BUNDLE_PATH)
    model = bundle["model"]
    features = bundle["features"]
    print("DEBUG model loaded successfully")
    print("DEBUG features =", features)
except Exception as e:
    print("DEBUG model load failed:", repr(e))
    traceback.print_exc()
    model = None
    features = []
# --------- TEST---------


# request schema, follows surveyQuestions.jsx field IDs
class Time12(BaseModel):
    hour: str
    minute: str
    ampm: str


class FrequencyVal(BaseModel):
    count: str
    per: str


class DurationVal(BaseModel):
    value: str
    unit: str


class SurveyAnswers(BaseModel):
    age: int
    # sex is not in the survey UI yet — optional, default to 1
    sex: Optional[int] = 1

    work: Optional[str] = None
    sleep_weekend_diff: Optional[str] = None

    sleep_weekday_bedtime: Optional[Time12] = None
    sleep_weekday_wake: Optional[Time12] = None
    sleep_weekend_bedtime: Optional[Time12] = None
    sleep_weekend_wake: Optional[Time12] = None

    moderate_min_week: Optional[FrequencyVal] = None
    moderate_duration_each: Optional[DurationVal] = None
    vigorous_min_week: Optional[FrequencyVal] = None
    vigorous_duration_each: Optional[DurationVal] = None
    sedentary_hours_day: Optional[DurationVal] = None


# helper function to convert 12-hour time dict → decimal hours (0..24)
# needed to calculate social jetlag
def time12_to_decimal(t: Optional[Time12]) -> Optional[float]:
    if t is None:
        return None
    try:
        h = int(t.hour)
        m = int(t.minute)
        if t.ampm == "PM" and h != 12:
            h += 12
        if t.ampm == "AM" and h == 12:
            h = 0
        return h + m / 60.0
    except Exception:
        return None


def duration_to_minutes(d: Optional[DurationVal]) -> Optional[float]:
    if d is None:
        return None
    try:
        v = float(d.value)
        return v * 60 if d.unit == "hours" else v
    except Exception:
        return None


def duration_to_hours(d: Optional[DurationVal]) -> Optional[float]:
    mins = duration_to_minutes(d)
    return mins / 60.0 if mins is not None else None


def frequency_per_week(f: Optional[FrequencyVal]) -> Optional[float]:
    if f is None:
        return None
    try:
        return float(f.count)
    except Exception:
        return None



# feature engineering
def compute_sleep_hours(bedtime_dec: Optional[float], wake_dec: Optional[float]) -> Optional[float]:
    """Return hours of sleep, handling midnight crossover."""
    if bedtime_dec is None or wake_dec is None:
        return None
    diff = wake_dec - bedtime_dec
    if diff < 0:
        diff += 24
    return diff


def compute_features(answers: SurveyAnswers) -> dict:
    # sleep times
    wd_bed = time12_to_decimal(answers.sleep_weekday_bedtime)
    wd_wake = time12_to_decimal(answers.sleep_weekday_wake)
    we_bed = time12_to_decimal(answers.sleep_weekend_bedtime)
    we_wake = time12_to_decimal(answers.sleep_weekend_wake)

    wd_sleep = compute_sleep_hours(wd_bed, wd_wake)
    we_sleep = compute_sleep_hours(we_bed, we_wake)

    # avg daily sleep — weight weekdays 5/7, weekends 2/7
    if wd_sleep is not None and we_sleep is not None:
        avg_sleep = (5 * wd_sleep + 2 * we_sleep) / 7.0
        # weekend total: total sleep over the weekend
        weekend_total = we_sleep * 2
        # social jetlag: difference in midpoints of sleep window
        wd_mid = (wd_bed + wd_sleep / 2) % 24
        we_mid = (we_bed + we_sleep / 2) % 24
        diff = abs(we_mid - wd_mid)
        jetlag = min(diff, 24 - diff)  # take the shorter arc around the clock


    elif wd_sleep is not None:
        avg_sleep = wd_sleep
        weekend_total = wd_sleep * 2  # fallback
        jetlag = 0.0
    else:
        avg_sleep = 7.0   # population default
        weekend_total = 14.0
        jetlag = 0.0

    # activity
    mod_freq = frequency_per_week(answers.moderate_min_week) or 0.0
    mod_dur = duration_to_minutes(answers.moderate_duration_each) or 30.0
    vig_freq = frequency_per_week(answers.vigorous_min_week) or 0.0
    vig_dur = duration_to_minutes(answers.vigorous_duration_each) or 20.0

    moderate_min_week = mod_freq * mod_dur
    vigorous_min_week = vig_freq * vig_dur

    sed_hours = duration_to_hours(answers.sedentary_hours_day) or 8.0

    # age column name may be "age_act" or "age" depending on training
    age_col = features[0] if features else "age"
    sex_col = features[1] if len(features) > 1 else "sex"

    return {
        age_col: answers.age,
        sex_col: answers.sex,
        "moderate_min_week": moderate_min_week,
        "sedentary_hours_day": sed_hours,
        "avg daily sleep": avg_sleep,
        "social jetlag (hrs)": jetlag,
        "weekend total": weekend_total,
        # keep raw values for recommendations
        "_raw": {
            "avg_sleep": avg_sleep,
            "jetlag": jetlag,
            "moderate_min_week": moderate_min_week,
            "vigorous_min_week": vigorous_min_week,
            "mvpa": moderate_min_week + 2 * vigorous_min_week,
            "sed_hours": sed_hours,
            "age": answers.age,
            "wd_sleep": wd_sleep,
            "we_sleep": we_sleep,
        }
    }



# rule-based recommendations (CDC guidelines)
def generate_recommendations(raw: dict, score: float) -> list:
    recs = []

    age = raw["age"]
    avg_sleep = raw["avg_sleep"]
    jetlag = raw["jetlag"]
    mvpa = raw["mvpa"]
    moderate_min = raw["moderate_min_week"]
    vigorous_min = raw["vigorous_min_week"]
    sed_hours = raw["sed_hours"]
    wd_sleep = raw.get("wd_sleep")
    we_sleep = raw.get("we_sleep")

    # CDC sleep guidelines by age
    if age > 65:
        rec_sleep = (7, 8)
    elif age > 61:
        rec_sleep = (7, 9)
    else:
        rec_sleep = (7, 10)

    # Sleep duration
    if avg_sleep < rec_sleep[0]:
        deficit = round(rec_sleep[0] - avg_sleep, 1)
        recs.append({
            "category": "Sleep Duration",
            "status": "below",
            "message": f"You're averaging about {round(avg_sleep, 1)} hours of sleep, which is {deficit} hours below the CDC-recommended {rec_sleep[0]}–{rec_sleep[1]} hours for your age group.",
            "recommendation": f"Try to go to bed {deficit}h earlier or shift your wake time later. Consistent sleep schedules help your body settle into the right duration naturally.",
            "priority": "high" if deficit >= 1.5 else "medium",
        })
    elif avg_sleep > rec_sleep[1]:
        excess = round(avg_sleep - rec_sleep[1], 1)
        recs.append({
            "category": "Sleep Duration",
            "status": "above",
            "message": f"You're averaging about {round(avg_sleep, 1)} hours of sleep, which is {excess} hours above the typical recommendation of {rec_sleep[0]}–{rec_sleep[1]} hours.",
            "recommendation": "Oversleeping can sometimes signal poor sleep quality. Consider whether your sleep is restful, and try maintaining a consistent wake time even on weekends.",
            "priority": "low",
        })
    else:
        recs.append({
            "category": "Sleep Duration",
            "status": "good",
            "message": f"You're averaging {round(avg_sleep, 1)} hours of sleep, right in the CDC-recommended range.",
            "recommendation": "Keep it up! Maintaining a consistent schedule will help sustain your sleep quality.",
            "priority": "good",
        })

    # Social jetlag
    if jetlag >= 2.0:
        recs.append({
            "category": "Sleep Consistency",
            "status": "below",
            "message": f"Your sleep schedule shifts by about {round(jetlag, 1)} hours on weekends vs. weekdays. This is known as 'social jetlag'.",
            "recommendation": "Try to limit the difference between your weekday and weekend sleep times to under 1 hour. Large shifts disrupt your circadian rhythm even if total sleep time is adequate.",
            "priority": "high" if jetlag >= 3.0 else "medium",
        })
    elif jetlag > 1.0:
        recs.append({
            "category": "Sleep Consistency",
            "status": "below",
            "message": f"Your sleep schedule shifts by about {round(jetlag, 1)} hours on weekends, which shows mild social jetlag.",
            "recommendation": "Try to keep your sleep and wake times within 30–60 minutes of your weekday schedule on weekends to stabilize your internal clock.",
            "priority": "low",
        })
    else:
        recs.append({
            "category": "Sleep Consistency",
            "status": "good",
            "message": "Your sleep schedule is consistent across the week, which is excellent for your circadian rhythm.",
            "recommendation": "Keep maintaining that regular schedule.",
            "priority": "good",
        })

    # MVPA (CDC: 150–300 min/week moderate, or 75–150 min vigorous)
    if mvpa < 75:
        recs.append({
            "category": "Aerobic Activity",
            "status": "below",
            "message": f"Your weekly aerobic activity (~{round(mvpa)} minutes) is well below the CDC guideline of 150 minutes of moderate or 75 minutes of vigorous activity per week.",
            "recommendation": "Start small with a 20-minute brisk walk 3 times a week. Gradually build toward 150 min per week of moderate activity.",
            "priority": "high",
        })
    elif mvpa < 150:
        recs.append({
            "category": "Aerobic Activity",
            "status": "below",
            "message": f"You're getting ~{round(mvpa)} minutes per week. This is a good start, but below the CDC 150-minute target.",
            "recommendation": "Try adding one or two more active sessions per week. Brisk walking, cycling, or swimming all count toward moderate-intensity minutes.",
            "priority": "medium",
        })
    elif mvpa <= 300:
        recs.append({
            "category": "Aerobic Activity",
            "status": "good",
            "message": f"You're meeting CDC aerobic activity guidelines with ~{round(mvpa)} minutes per week.",
            "recommendation": "Well done! If you want additional health benefits, the upper range (300 min per week) is associated with even lower disease risk.",
            "priority": "good",
        })
    else:
        recs.append({
            "category": "Aerobic Activity",
            "status": "good",
            "message": f"You're exceeding CDC activity guidelines (~{round(mvpa)} minutes per week). Keep it balanced.",
            "recommendation": "Excellent activity level. Make sure to include adequate rest and recovery days to avoid overtraining.",
            "priority": "good",
        })

    # Sedentary time (CDC: minimize prolonged sitting; >8h/day is high risk)
    if sed_hours >= 10:
        recs.append({
            "category": "Sedentary Time",
            "status": "below",
            "message": f"You report sitting for about {round(sed_hours, 1)} hours per day, which is high.",
            "recommendation": "Try to stand or move for at least 5 minutes after 30 minutes of sitting. Consider a standing desk, walking meetings, or setting hourly movement reminders.",
            "priority": "high",
        })
    elif sed_hours > 8:
        recs.append({
            "category": "Sedentary Time",
            "status": "below",
            "message": f"You sit for about {round(sed_hours, 1)} hours per day. This is above the recommended threshold.",
            "recommendation": "Try to break up long sitting periods into 30 minute periods. Short walks, standing while on calls, or light stretching every hour can reduce the health impact of sedentary behavior.",
            "priority": "medium",
        })
    else:
        recs.append({
            "category": "Sedentary Time",
            "status": "good",
            "message": f"Your sedentary time (~{round(sed_hours, 1)} hours per day) is within a healthy range.",
            "recommendation": "Keep breaking up your sitting time throughout the day to maintain this.",
            "priority": "good",
        })

    return recs



@app.post("/predict")
def predict(answers: SurveyAnswers):
    try:
        feat_dict = compute_features(answers)
        raw = feat_dict.pop("_raw")

        if model is None:
            raise HTTPException(status_code=500, detail="Model not loaded on server.")

        X = pd.DataFrame([feat_dict])[features]
        score = float(np.clip(model.predict(X)[0], 0, 100))

        recommendations = generate_recommendations(raw, score)

        return {
            "score": round(score, 1),
            "recommendations": recommendations,
            "breakdown": {
                "avg_sleep_hours": round(raw["avg_sleep"], 2),
                "social_jetlag_hours": round(raw["jetlag"], 2),
                "mvpa_minutes_week": round(raw["mvpa"], 1),
                "sedentary_hours_day": round(raw["sed_hours"], 1),
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# @app.get("/health")
# def health():
#     return {"status": "ok", "model_loaded": model is not None}
@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "cwd": os.getcwd(),
        "bundle_path": BUNDLE_PATH,
        "bundle_exists": os.path.exists(BUNDLE_PATH),
    }