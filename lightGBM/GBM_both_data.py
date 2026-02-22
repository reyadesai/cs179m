# combined_score_lgbm.py
# Train a LightGBM model to output an overall 0–100 Lifestyle Score (Activity + Sleep)
# and save the model bundle for later SHAP explanations + app usage.

import numpy as np
import pandas as pd
from lightgbm import LGBMRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
import joblib


# ----------------------------
# Helpers
# ----------------------------
def clamp_array(x, lo, hi):
    return np.minimum(np.maximum(x, lo), hi)


def ensure_seqn(df: pd.DataFrame) -> pd.DataFrame:
    """Make sure the id column is named 'seqn' and is integer-like."""
    if "SEQN" in df.columns and "seqn" not in df.columns:
        df = df.rename(columns={"SEQN": "seqn"})
    if "seqn" not in df.columns:
        raise ValueError("Could not find 'seqn' (or 'SEQN') column to merge on.")
    # Some NHANES exports store it like 130378.0
    df["seqn"] = pd.to_numeric(df["seqn"], errors="coerce").astype("Int64")
    df = df.dropna(subset=["seqn"]).copy()
    df["seqn"] = df["seqn"].astype(int)
    return df


# ----------------------------
# Scoring formulas (transparent targets)
# ----------------------------
def add_activity_points(df: pd.DataFrame) -> pd.DataFrame:
    """
    Activity points out of 60.
    Uses MVPA-equivalent minutes/week = moderate + 2*vigorous (if vigorous exists).
    Full credit at 150 MVPA min/week.
    """
    moderate = pd.to_numeric(df.get("moderate_min_week"), errors="coerce").fillna(0)
    vigorous = pd.to_numeric(df.get("vigorous_min_week"), errors="coerce").fillna(0) if "vigorous_min_week" in df.columns else 0

    mvpa = moderate + 2 * vigorous
    mvpa = clamp_array(mvpa, 0, 2000)  # prevent insane values from dominating

    activity_points = 60 * clamp_array(mvpa / 150.0, 0, 1)

    df = df.copy()
    df["mvpa_equiv_from_inputs"] = mvpa
    df["activity_points"] = activity_points
    return df


def add_sleep_points(df: pd.DataFrame) -> pd.DataFrame:
    """
    Sleep points out of 40.
    - Sleep duration: peak at 8 hours; linearly down to 0 at 4 or 12 hours.
    - Social jetlag penalty: up to 10 points penalty by 4+ hours jetlag.
    """
    sleep_hours = pd.to_numeric(df.get("avg daily sleep"), errors="coerce")
    jetlag = pd.to_numeric(df.get("social jetlag (hrs)"), errors="coerce")

    # duration score (0..40), peak at 8
    # 8 hours => 40
    # 4 or 12 => 0
    duration_points = 40 * clamp_array(1 - (np.abs(sleep_hours - 8) / 4), 0, 1)

    # penalty (0..10)
    jetlag_penalty = 10 * clamp_array(jetlag / 4, 0, 1)

    sleep_points = duration_points - jetlag_penalty
    sleep_points = clamp_array(sleep_points, 0, 40)

    df = df.copy()
    df["sleep_points"] = sleep_points
    return df


# ----------------------------
# Main
# ----------------------------
def main():
    
    ACTIVITY_CSV = "nhanes_physical_activity/data/paq_activity_clean.csv"
    SLEEP_CSV = "nhanes_sleep/data/slq_sleep_clean.csv"

    # Load
    activity = pd.read_csv(ACTIVITY_CSV)
    sleep = pd.read_csv(SLEEP_CSV)

    # Normalize merge key
    activity = ensure_seqn(activity)
    sleep = ensure_seqn(sleep)

    # Merge
    df = activity.merge(sleep, on="seqn", how="inner", suffixes=("_act", "_slp"))
    print("Merged rows:", len(df))

    # Build transparent target score (0..100)
    df = add_activity_points(df)
    df = add_sleep_points(df)

    df["overall_score"] = clamp_array(df["activity_points"] + df["sleep_points"], 0, 100)

    age_col = "age_act" if "age_act" in df.columns else ("age" if "age" in df.columns else None)
    sex_col = "sex_act" if "sex_act" in df.columns else ("sex" if "sex" in df.columns else None)
    if age_col is None or sex_col is None:
        raise ValueError("Could not find age/sex columns after merge. Check your column names.")

    feature_candidates = [
        age_col,
        sex_col,
        "moderate_min_week",
        "sedentary_hours_day",
        "avg daily sleep",
        "social jetlag (hrs)",
        "weekend total" 
    ]

    # Clean: ensure features exist + drop rows with missing
    missing_cols = [c for c in feature_candidates if c not in df.columns]
    if missing_cols:
        raise ValueError(f"Missing expected columns in merged df: {missing_cols}")

    df = df.dropna(subset=feature_candidates + ["overall_score"]).copy()

    X = df[feature_candidates].copy()
    y = df["overall_score"].copy()

    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # Train LightGBM regressor (predict score directly)
    model = LGBMRegressor(
        n_estimators=600,
        learning_rate=0.05,
        num_leaves=31,
        random_state=42,
    )
    model.fit(X_train, y_train)

    # Evaluate
    pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, pred)
    print("MAE (score points):", mae)

    # Save model bundle (model + feature list + info you’ll need later)
    bundle = {
        "model": model,
        "features": feature_candidates,
        "score_definition": {
            "activity_points_max": 60,
            "sleep_points_max": 40,
            "mvpa_full_credit": 150,
            "sleep_peak_hours": 8,
            "sleep_zero_at_hours": [4, 12],
            "jetlag_penalty_max": 10,
            "jetlag_full_penalty_at_hours": 4,
        },
    }
    joblib.dump(bundle, "lgbm_overall_score.pkl")
    print("Saved: lgbm_overall_score.pkl")

    # Show a few examples
    out = X_test.copy()
    out["predicted_score"] = pred
    out["actual_score"] = y_test.values
    print("\nSample predictions:")
    print(out.head(10))


if __name__ == "__main__":
    main()