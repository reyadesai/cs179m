# shap_overall_score.py
# Explains the LightGBM Overall Lifestyle Score using SHAP

import joblib
import pandas as pd
import shap

# ----------------------------
# 1) Load trained model bundle
# ----------------------------
bundle = joblib.load("lgbm_overall_score.pkl")

model = bundle["model"]
features = bundle["features"]

print("Loaded model with features:")
print(features)


# ----------------------------
# 2) Load merged dataset (for SHAP background)
# ----------------------------
df = pd.read_csv("nhanes_physical_activity/data/paq_activity_clean.csv")
sleep = pd.read_csv("nhanes_sleep/data/slq_sleep_clean.csv")

# normalize seqn
df["seqn"] = df["seqn"].astype(int)
sleep["seqn"] = sleep["seqn"].astype(int)

merged = df.merge(sleep, on="seqn", how="inner", suffixes=("_act", "_slp"))

# pick same columns used during training
X = merged[features].dropna()

# SHAP background sample (important for stability)
background = X.sample(min(200, len(X)), random_state=42)


# ----------------------------
# 3) Build SHAP explainer
# ----------------------------
explainer = shap.TreeExplainer(model, data=background)


# ----------------------------
# 4) Example user input
# (replace with UI input later)
# ----------------------------
user = pd.DataFrame([{
    features[0]: 18,     # age
    features[1]: 1,      # sex
    features[2]: 60,     # moderate_min_week
    features[3]: 9,      # sedentary_hours_day
    features[4]: 6.5,    # avg daily sleep
    features[5]: 2.0,     # social jetlag
    features[6]: 6    # weekend total
}])


# ----------------------------
# 5) Predict overall score
# ----------------------------
score = model.predict(user)[0]

print("\nOverall Lifestyle Score (0–100):", round(score, 2))


# ----------------------------
# 6) Compute SHAP values
# ----------------------------
shap_values = explainer(user)

contrib = pd.Series(
    shap_values.values[0],
    index=features
).sort_values(key=abs, ascending=False)

print("\nFeature contributions:")
print(contrib)


# ----------------------------
# 7) Human-readable explanation
# ----------------------------
print("\nWhat affected your score most:")

for feature, value in contrib.items():
    direction = "increased" if value > 0 else "decreased"
    print(f"• {feature} {direction} your score")


# ----------------------------
# 8) Visualization
# ----------------------------
shap.plots.waterfall(shap_values[0])