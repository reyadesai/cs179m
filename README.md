# SleepFit AI
 > Expanding access to preventative healthcare through personalized risk assessments based on CDC sleep and exercise data.
 
Contributors: [Reya Desai](https://github.com/reyadesai), [Mehakdeep Kaeley](https://github.com/Macd1p), [Angel Montes](https://github.com/Aimgel), [Nada Salib](https://github.com/nadasalib)

---

## Motivation
Healthcare is currently a luxury of the well-resourced. By using sleep and exercise data recorded by the CDC, we alleviate the financial and geographic barriers to preventative care. Our goal is to expand access to healthcare information to neglected populations in a quick and affordable way. We encourage preventative measures for at-risk individuals by providing risk assessments and actionable recommendations.

---

## How It Works
The user completes a short questionnaire covering lifestyle habits like sleep duration and physical activity. This input is passed to a **Light Gradient Boosting Machine (LGBM)** trained on NHANES data from the CDC. The model produces an overall health risk score, and **SHAP values** are used to identify which factors contributed most to that score. The result is a plain-language report with personalized CDC-backed recommendations.

---

## Features
- **Comprehensive Questionnaire** — Digestible questions designed to gauge lifestyle habits without requiring medical knowledge.
- **Risk Assessment** — A scored evaluation of the user's current habits relative to CDC guidelines.
- **Personalized Report** — Summarizes the user's risk level, the habits contributing to it, and concrete recommendations to improve.
- **Privacy-First** — No personal data is stored. The session is stateless by design.

---

## Tech Stack
| Layer | Technology | Why |
|---|---|---|
| Frontend | React + Vite | Component-based UI with fast development builds |
| Backend | FastAPI | Lightweight and fast for serving ML model responses |
| ML Model | Python (LightGBM) | Efficient gradient boosting for tabular health data |
| Explainability | SHAP | Surfaces which factors drive each user's risk score |
| Data | CDC NHANES | Nationally representative sleep and activity datasets |

---

## Project Structure
```
backend/
├── main.py                  # FastAPI app and API endpoints
├── GBM_both_data.py         # Model training and evaluation logic
├── lgbm_overall_score.pkl   # Trained LightGBM model (serialized)
└── shap_overallScore.py     # SHAP explainability scoring

data/
├── nhanes_physical_activity/
│   ├── data/                # Raw and cleaned CDC activity datasets
│   └── notebooks/           # Exploratory analysis and preprocessing
└── nhanes_sleep/
    ├── data/                # Raw and cleaned CDC sleep datasets
    └── notebooks/           # Exploratory analysis and preprocessing

src/
├── components/
├── pages/
│   ├── Landing.jsx          # Home/intro page
│   ├── Survey.jsx           # Questionnaire interface
│   └── Results.jsx          # Summary & recommendation display
└── assets/
```

---

## Demo
![Website Demonstration](https://github.com/user-attachments/assets/88705e03-b4d3-41f8-ac63-25641bd3f5f1)

---

## Navigation
<img src="SleepFitAI_Navigation_Diagram.png?raw=true" width="1000">

---

## Acknowledgements
This project was completed as part of CS179M (Project in Computer Science: Artificial Intelligence) under the guidance of Professor LePendu and client discussions with Dr. Rodriguez.
