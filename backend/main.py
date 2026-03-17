from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import joblib
import pandas as pd
import numpy as np
import pickle
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", # Vite dev server
        "https://cs179m.vercel.app", # Vercel link
        "https://cs179m-production-3be7.up.railway.app", # Railway link
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model once at startup
MODEL_PATH = os.getenv("MODEL_PATH", "lgbm_overall_score.pkl")

# BUNDLE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "lgbm_overall_score.pkl")

# try:
#     bundle = joblib.load(BUNDLE_PATH)
#     model = bundle["model"]
#     features = bundle["features"]
#     print(f"Model loaded. Features: {features}", flush=True)
# except Exception as e:
#     traceback.print_exc()
#     raise RuntimeError(f"Could not load model from {BUNDLE_PATH}: {e}")

def load_model():
    if not os.path.exists(MODEL_PATH):
        raise RuntimeError(f"Model file not found at: {MODEL_PATH}")
    with open(MODEL_PATH, "rb") as f:
        return pickle.load(f)

try:
    bundle   = joblib.load(MODEL_PATH)
    model    = bundle["model"]
    features = bundle["features"]
    print(f"Model loaded from {MODEL_PATH}")
except Exception as e:
    print(f"Model not loaded: {e}")
    model = None

class Time12(BaseModel):
    hour: str
    minute: str
    ampm: str


class FrequencyVal(BaseModel):
    count: str
    per: Optional[str] = "week"


class DurationVal(BaseModel):
    value: str
    unit: str


class SurveyAnswers(BaseModel):
    age: int
    sex: Optional[int] = 1
    language: Optional[str] = "en"

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


def compute_sleep_hours(
    bedtime_dec: Optional[float],
    wake_dec: Optional[float]
) -> Optional[float]:
    if bedtime_dec is None or wake_dec is None:
        return None
    diff = wake_dec - bedtime_dec
    if diff < 0:
        diff += 24
    return diff


def compute_features(answers: SurveyAnswers) -> dict:
    wd_bed = time12_to_decimal(answers.sleep_weekday_bedtime)
    wd_wake = time12_to_decimal(answers.sleep_weekday_wake)
    we_bed = time12_to_decimal(answers.sleep_weekend_bedtime)
    we_wake = time12_to_decimal(answers.sleep_weekend_wake)

    wd_sleep = compute_sleep_hours(wd_bed, wd_wake)
    we_sleep = compute_sleep_hours(we_bed, we_wake)

    if wd_sleep is not None and we_sleep is not None:
        avg_sleep = (5 * wd_sleep + 2 * we_sleep) / 7.0
        weekend_total = we_sleep * 2
        wd_mid = (wd_bed + wd_sleep / 2) % 24
        we_mid = (we_bed + we_sleep / 2) % 24
        diff = abs(we_mid - wd_mid)
        jetlag = min(diff, 24 - diff)
    elif wd_sleep is not None:
        avg_sleep = wd_sleep
        weekend_total = wd_sleep * 2
        jetlag = 0.0
    else:
        avg_sleep = 7.0
        weekend_total = 14.0
        jetlag = 0.0

    mod_freq = frequency_per_week(answers.moderate_min_week) or 0.0
    mod_dur = duration_to_minutes(answers.moderate_duration_each) or 30.0
    vig_freq = frequency_per_week(answers.vigorous_min_week) or 0.0
    vig_dur = duration_to_minutes(answers.vigorous_duration_each) or 20.0

    moderate_min_week = mod_freq * mod_dur
    vigorous_min_week = vig_freq * vig_dur
    sed_hours = duration_to_hours(answers.sedentary_hours_day) or 8.0

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


def generate_recommendations(raw: dict, score: float, language: str = "en") -> list:
    recs = []
    is_es = language == "es"

    age = raw["age"]
    avg_sleep = raw["avg_sleep"]
    jetlag = raw["jetlag"]
    mvpa = raw["mvpa"]
    sed_hours = raw["sed_hours"]

    if age > 65:
        rec_sleep = (7, 8)
    elif age > 61:
        rec_sleep = (7, 9)
    else:
        rec_sleep = (7, 10)

    if avg_sleep < rec_sleep[0]:
        deficit = round(rec_sleep[0] - avg_sleep, 1)
        recs.append({
            "category": "Duración del Sueño" if is_es else "Sleep Duration",
            "status": "below",
            "message": (
                f"Estás promediando aproximadamente {round(avg_sleep, 1)} horas de sueño, lo cual está {deficit} horas por debajo de las {rec_sleep[0]}–{rec_sleep[1]} horas recomendadas por el CDC para tu grupo de edad."
                if is_es
                else f"You're averaging about {round(avg_sleep, 1)} hours of sleep, which is {deficit} hours below the CDC-recommended {rec_sleep[0]}–{rec_sleep[1]} hours for your age group."
            ),
            "recommendation": (
                f"Intenta acostarte {deficit} h más temprano o despertarte más tarde. Mantener horarios de sueño constantes ayuda a que tu cuerpo alcance una duración adecuada de manera natural."
                if is_es
                else f"Try to go to bed {deficit}h earlier or shift your wake time later. Consistent sleep schedules help your body settle into the right duration naturally."
            ),
            "priority": "high" if deficit >= 1.5 else "medium",
        })
    elif avg_sleep > rec_sleep[1]:
        excess = round(avg_sleep - rec_sleep[1], 1)
        recs.append({
            "category": "Duración del Sueño" if is_es else "Sleep Duration",
            "status": "above",
            "message": (
                f"Estás promediando aproximadamente {round(avg_sleep, 1)} horas de sueño, lo cual está {excess} horas por encima de la recomendación típica de {rec_sleep[0]}–{rec_sleep[1]} horas."
                if is_es
                else f"You're averaging about {round(avg_sleep, 1)} hours of sleep, which is {excess} hours above the typical recommendation of {rec_sleep[0]}–{rec_sleep[1]} hours."
            ),
            "recommendation": (
                "Dormir en exceso a veces puede ser una señal de mala calidad del sueño. Considera si tu descanso es reparador e intenta mantener una hora constante para despertarte, incluso los fines de semana."
                if is_es
                else "Oversleeping can sometimes signal poor sleep quality. Consider whether your sleep is restful, and try maintaining a consistent wake time even on weekends."
            ),
            "priority": "low",
        })
    else:
        recs.append({
            "category": "Duración del Sueño" if is_es else "Sleep Duration",
            "status": "good",
            "message": (
                f"Estás promediando {round(avg_sleep, 1)} horas de sueño, justo dentro del rango recomendado por el CDC."
                if is_es
                else f"You're averaging {round(avg_sleep, 1)} hours of sleep, right in the CDC-recommended range."
            ),
            "recommendation": (
                "¡Sigue así! Mantener un horario constante te ayudará a conservar una buena calidad de sueño."
                if is_es
                else "Keep it up! Maintaining a consistent schedule will help sustain your sleep quality."
            ),
            "priority": "good",
        })

    if jetlag >= 2.0:
        recs.append({
            "category": "Consistencia del Sueño" if is_es else "Sleep Consistency",
            "status": "below",
            "message": (
                f"Tu horario de sueño cambia aproximadamente {round(jetlag, 1)} horas los fines de semana en comparación con los días entre semana. Esto se conoce como 'jetlag social'."
                if is_es
                else f"Your sleep schedule shifts by about {round(jetlag, 1)} hours on weekends vs. weekdays. This is known as 'social jetlag'."
            ),
            "recommendation": (
                "Intenta limitar la diferencia entre tus horarios de sueño de entre semana y fines de semana a menos de 1 hora. Los cambios grandes alteran tu ritmo circadiano aunque el tiempo total de sueño sea suficiente."
                if is_es
                else "Try to limit the difference between your weekday and weekend sleep times to under 1 hour. Large shifts disrupt your circadian rhythm even if total sleep time is adequate."
            ),
            "priority": "high" if jetlag >= 3.0 else "medium",
        })
    elif jetlag > 1.0:
        recs.append({
            "category": "Consistencia del Sueño" if is_es else "Sleep Consistency",
            "status": "below",
            "message": (
                f"Tu horario de sueño cambia aproximadamente {round(jetlag, 1)} horas los fines de semana, lo cual muestra un jetlag social leve."
                if is_es
                else f"Your sleep schedule shifts by about {round(jetlag, 1)} hours on weekends, which shows mild social jetlag."
            ),
            "recommendation": (
                "Intenta mantener tus horas de dormir y despertar dentro de 30 a 60 minutos de tu horario entre semana durante los fines de semana para estabilizar tu reloj interno."
                if is_es
                else "Try to keep your sleep and wake times within 30–60 minutes of your weekday schedule on weekends to stabilize your internal clock."
            ),
            "priority": "low",
        })
    else:
        recs.append({
            "category": "Consistencia del Sueño" if is_es else "Sleep Consistency",
            "status": "good",
            "message": (
                "Tu horario de sueño es constante durante la semana, lo cual es excelente para tu ritmo circadiano."
                if is_es
                else "Your sleep schedule is consistent across the week, which is excellent for your circadian rhythm."
            ),
            "recommendation": (
                "Sigue manteniendo ese horario regular."
                if is_es
                else "Keep maintaining that regular schedule."
            ),
            "priority": "good",
        })

    if mvpa < 75:
        recs.append({
            "category": "Actividad Aeróbica" if is_es else "Aerobic Activity",
            "status": "below",
            "message": (
                f"Tu actividad aeróbica semanal (~{round(mvpa)} minutos) está muy por debajo de la guía del CDC de 150 minutos de actividad moderada o 75 minutos de actividad vigorosa por semana."
                if is_es
                else f"Your weekly aerobic activity (~{round(mvpa)} minutes) is well below the CDC guideline of 150 minutes of moderate or 75 minutes of vigorous activity per week."
            ),
            "recommendation": (
                "Empieza poco a poco con una caminata rápida de 20 minutos 3 veces por semana. Aumenta gradualmente hasta llegar a 150 minutos por semana de actividad moderada."
                if is_es
                else "Start small with a 20-minute brisk walk 3 times a week. Gradually build toward 150 min per week of moderate activity."
            ),
            "priority": "high",
        })
    elif mvpa < 150:
        recs.append({
            "category": "Actividad Aeróbica" if is_es else "Aerobic Activity",
            "status": "below",
            "message": (
                f"Estás logrando ~{round(mvpa)} minutos por semana. Es un buen comienzo, pero está por debajo de la meta de 150 minutos del CDC."
                if is_es
                else f"You're getting ~{round(mvpa)} minutes per week. This is a good start, but below the CDC 150-minute target."
            ),
            "recommendation": (
                "Intenta agregar una o dos sesiones activas más por semana. Caminar rápido, andar en bicicleta o nadar cuentan como minutos de intensidad moderada."
                if is_es
                else "Try adding one or two more active sessions per week. Brisk walking, cycling, or swimming all count toward moderate-intensity minutes."
            ),
            "priority": "medium",
        })
    elif mvpa <= 300:
        recs.append({
            "category": "Actividad Aeróbica" if is_es else "Aerobic Activity",
            "status": "good",
            "message": (
                f"Estás cumpliendo con las guías de actividad aeróbica del CDC con ~{round(mvpa)} minutos por semana."
                if is_es
                else f"You're meeting CDC aerobic activity guidelines with ~{round(mvpa)} minutes per week."
            ),
            "recommendation": (
                "¡Muy bien! Si quieres beneficios adicionales para tu salud, el rango superior (300 min por semana) se asocia con un riesgo aún menor de enfermedad."
                if is_es
                else "Well done! If you want additional health benefits, the upper range (300 min per week) is associated with even lower disease risk."
            ),
            "priority": "good",
        })
    else:
        recs.append({
            "category": "Actividad Aeróbica" if is_es else "Aerobic Activity",
            "status": "good",
            "message": (
                f"Estás superando las guías de actividad del CDC (~{round(mvpa)} minutos por semana). Mantén un buen equilibrio."
                if is_es
                else f"You're exceeding CDC activity guidelines (~{round(mvpa)} minutes per week). Keep it balanced."
            ),
            "recommendation": (
                "Excelente nivel de actividad. Asegúrate de incluir suficientes días de descanso y recuperación para evitar el sobreentrenamiento."
                if is_es
                else "Excellent activity level. Make sure to include adequate rest and recovery days to avoid overtraining."
            ),
            "priority": "good",
        })

    if sed_hours >= 10:
        recs.append({
            "category": "Tiempo Sedentario" if is_es else "Sedentary Time",
            "status": "below",
            "message": (
                f"Reportas estar sentado aproximadamente {round(sed_hours, 1)} horas por día, lo cual es alto."
                if is_es
                else f"You report sitting for about {round(sed_hours, 1)} hours per day, which is high."
            ),
            "recommendation": (
                "Intenta ponerte de pie o moverte al menos 5 minutos después de 30 minutos sentado. Considera usar un escritorio de pie, hacer reuniones caminando o programar recordatorios de movimiento cada hora."
                if is_es
                else "Try to stand or move for at least 5 minutes after 30 minutes of sitting. Consider a standing desk, walking meetings, or setting hourly movement reminders."
            ),
            "priority": "high",
        })
    elif sed_hours > 8:
        recs.append({
            "category": "Tiempo Sedentario" if is_es else "Sedentary Time",
            "status": "below",
            "message": (
                f"Estás sentado aproximadamente {round(sed_hours, 1)} horas por día. Esto está por encima del umbral recomendado."
                if is_es
                else f"You sit for about {round(sed_hours, 1)} hours per day. This is above the recommended threshold."
            ),
            "recommendation": (
                "Intenta dividir los periodos largos de estar sentado en bloques de 30 minutos. Caminatas cortas, estar de pie durante llamadas o hacer estiramientos ligeros cada hora pueden reducir el impacto del comportamiento sedentario en la salud."
                if is_es
                else "Try to break up long sitting periods into 30 minute periods. Short walks, standing while on calls, or light stretching every hour can reduce the health impact of sedentary behavior."
            ),
            "priority": "medium",
        })
    else:
        recs.append({
            "category": "Tiempo Sedentario" if is_es else "Sedentary Time",
            "status": "good",
            "message": (
                f"Tu tiempo sedentario (~{round(sed_hours, 1)} horas por día) está dentro de un rango saludable."
                if is_es
                else f"Your sedentary time (~{round(sed_hours, 1)} hours per day) is within a healthy range."
            ),
            "recommendation": (
                "Sigue interrumpiendo el tiempo que pasas sentado a lo largo del día para mantenerlo así."
                if is_es
                else "Keep breaking up your sitting time throughout the day to maintain this."
            ),
            "priority": "good",
        })

    return recs

# check if railway is running
@app.get("/")
def root():
    return {"status": "ok", "message": "ML API is running"}

@app.get("/health")
def health():
    return {"status": "healthy", "model_loaded": model is not None}

@app.post("/predict")
def predict(answers: SurveyAnswers):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    try:
        feat_dict = compute_features(answers)
        raw = feat_dict.pop("_raw")

        if model is None:
            raise HTTPException(status_code=500, detail="Model not loaded on server.")

        X = pd.DataFrame([feat_dict])[features]
        score = float(np.clip(model.predict(X)[0], 0, 100))

        recommendations = generate_recommendations(raw, score, answers.language or "en")

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
#     return {
#         "status": "ok",
#         "model_loaded": model is not None,
#         "cwd": os.getcwd(),
#         "bundle_path": BUNDLE_PATH,
#         "bundle_exists": os.path.exists(BUNDLE_PATH),
#     }
