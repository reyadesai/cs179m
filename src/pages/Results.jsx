import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import HealthInfoFooter from "../components/HealthInfoFooter";

const PRIORITY_COLORS = {
  high: { bg: "#fff5f5", border: "#feb2b2", badge: "#e53e3e", text: "#742a2a" },
  medium: { bg: "#fffaf0", border: "#fbd38d", badge: "#dd6b20", text: "#7c2d12" },
  low: { bg: "#f0f4ff", border: "#a3bffa", badge: "#5a67d8", text: "#2c5282" },
  good: { bg: "#f0fdf4", border: "#86efac", badge: "#16a34a", text: "#14532d" },
};

function BreakdownBar({ label, value, unit, max, color }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 13,
          marginBottom: 5,
        }}
      >
        <span style={{ color: "#4b5563" }}>{label}</span>
        <span style={{ color: "#1f2937", fontWeight: 700 }}>
          {value}
          {unit}
        </span>
      </div>
      <div style={{ height: 6, borderRadius: 4, background: "#e5e7eb", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: color,
            borderRadius: 4,
            transition: "width 0.8s ease",
          }}
        />
      </div>
    </div>
  );
}

function RecommendationCard({ rec, language, text }) {
  const colors = PRIORITY_COLORS[rec.priority] || PRIORITY_COLORS.low;

  const categoryMap = {
    "Sleep Duration": { en: "Sleep Duration", es: "Duración del Sueño" },
    "Duración del Sueño": { en: "Sleep Duration", es: "Duración del Sueño" },
    "Sleep Consistency": { en: "Sleep Consistency", es: "Consistencia del Sueño" },
    "Consistencia del Sueño": { en: "Sleep Consistency", es: "Consistencia del Sueño" },
    "Aerobic Activity": { en: "Aerobic Activity", es: "Actividad Aeróbica" },
    "Actividad Aeróbica": { en: "Aerobic Activity", es: "Actividad Aeróbica" },
    "Sedentary Time": { en: "Sedentary Time", es: "Tiempo Sedentario" },
    "Tiempo Sedentario": { en: "Sedentary Time", es: "Tiempo Sedentario" },
  };

  const translatedCategory = categoryMap[rec.category]?.[language] || rec.category;

  return (
    <div
      style={{
        background: colors.bg,
        border: `2px solid ${colors.border}`,
        borderRadius: 12,
        padding: "16px 18px",
        height: "100%",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: "#1f2937" }}>
          {translatedCategory}
        </span>
        <span
          style={{
            marginLeft: "auto",
            background: colors.badge,
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            padding: "3px 10px",
            borderRadius: 20,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {rec.priority === "good" ? text.onTrack : rec.priority}
        </span>
      </div>
      <p
        style={{
          margin: "0 0 10px 0",
          fontSize: 14,
          color: colors.text,
          lineHeight: 1.5,
          fontWeight: 500,
        }}
      >
        {rec.message}
      </p>
      <p style={{ margin: 0, fontSize: 13, color: "#4b5563", lineHeight: 1.5 }}>
        {rec.recommendation}
      </p>
    </div>
  );
}

export default function Results({ language = "en" }) {
  const location = useLocation();
  const navigate = useNavigate();
  const answers = location.state?.answers;
  const result = location.state?.result;

  const text = {
    en: {
      noResults: "No results found",
      takeSurveyFirst: "Please take the survey first.",
      goHome: "Go Home",
      steps: ["About You", "Sleep", "Activity", "Summary"],
      yourResults: "Your Results",
      area: "area",
      areas: "areas",
      onTrack: "On Track",
      toImprove: "to improve",
      yourMetrics: "Your Metrics",
      avgSleep: "Average Amount of Sleep per Night",
      weeklyMinutes: "Weekly Active Minutes (MVPA)",
      sedentary: "Daily Sedentary Time",
      jetlag: "Social Jetlag",
      personalized: "Personalized Recommendations",
      sleepRest: "Sleep & Rest",
      exerciseActivity: "Exercise & Activity",
      retake: "Retake Survey",
    },
    es: {
      noResults: "No se encontraron resultados",
      takeSurveyFirst: "Por favor completa la encuesta primero.",
      goHome: "Ir al Inicio",
      steps: ["Sobre Ti", "Sueño", "Actividad", "Resumen"],
      yourResults: "Tus Resultados",
      area: "área",
      areas: "áreas",
      onTrack: "En Buen Camino",
      toImprove: "por mejorar",
      yourMetrics: "Tus Métricas",
      avgSleep: "Promedio de Sueño por Noche",
      weeklyMinutes: "Minutos Activos por Semana (MVPA)",
      sedentary: "Tiempo Sedentario Diario",
      jetlag: "Jetlag Social",
      personalized: "Recomendaciones Personalizadas",
      sleepRest: "Sueño y Descanso",
      exerciseActivity: "Ejercicio y Actividad",
      retake: "Volver a Tomar la Encuesta",
    },
  };

  const t = text[language];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!answers || !result) {
    return (
      <div>
        <main className="gv-shell">
          <section className="gv-card">
            <h2>{t.noResults}</h2>
            <div className="gv-sub">{t.takeSurveyFirst}</div>
            <div className="gv-footer">
              <button className="gv-btn primary" onClick={() => navigate("/")} type="button">
                {t.goHome}
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  const { recommendations, breakdown } = result;
  const stepMeta = t.steps.map((label) => ({ label }));
  const stepIndex = 3;

  const issueCount = recommendations.filter((r) => r.priority !== "good").length;
  const goodCount = recommendations.filter((r) => r.priority === "good").length;

  const sleepRecs = recommendations.filter((r) =>
    ["sleep", "sueño", "jetlag", "bedtime", "consistencia"].some((term) =>
      r.category.toLowerCase().includes(term)
    )
  );

  const exerciseRecs = recommendations.filter((r) =>
    ["exercise", "activity", "actividad", "sedentary", "sedentario", "mvpa", "aeróbica"].some(
      (term) => r.category.toLowerCase().includes(term)
    )
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <main className="gv-shell" style={{ paddingTop: 800 }}>
        <div className="gv-stepper" aria-label="Progress" style={{ marginBottom: 20 }}>
          {stepMeta.map((s, idx) => (
            <div
              key={s.label}
              className={`gv-step ${idx === stepIndex ? "active" : idx < stepIndex ? "done" : ""}`}
            >
              <div className="dot" />
              <label>{s.label}</label>
            </div>
          ))}
        </div>

        <section className="gv-card" style={{ background: "#ffffff" }}>
          <h2 style={{ color: "#1f2937" }}>{t.yourResults}</h2>
          <div className="gv-sub" style={{ color: "#6b7280", marginBottom: 28 }}>
            {goodCount} {goodCount === 1 ? t.area : t.areas} {t.onTrack.toLowerCase()}
            {issueCount > 0 &&
              ` · ${issueCount} ${issueCount === 1 ? t.area : t.areas} ${t.toImprove}`}
          </div>

          <div
            style={{
              background: "#f9fafb",
              border: "2px solid #e5e7eb",
              borderRadius: 12,
              padding: "16px 20px",
              marginBottom: 28,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#6b7280",
                marginBottom: 14,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {t.yourMetrics}
            </div>

            <BreakdownBar
              label={t.avgSleep}
              value={breakdown.avg_sleep_hours}
              unit={language === "es" ? " h" : " hr"}
              max={12}
              color="#5b8dee"
            />
            <BreakdownBar
              label={t.weeklyMinutes}
              value={breakdown.mvpa_minutes_week}
              unit=" min"
              max={300}
              color="#16a34a"
            />
            <BreakdownBar
              label={t.sedentary}
              value={breakdown.sedentary_hours_day}
              unit=" h"
              max={16}
              color="#dd6b20"
            />
            <BreakdownBar
              label={t.jetlag}
              value={breakdown.social_jetlag_hours}
              unit=" h"
              max={6}
              color="#9b59b6"
            />
          </div>

          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#6b7280",
              marginBottom: 14,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {t.personalized}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#1f2937",
                  marginBottom: 12,
                  paddingBottom: 8,
                  borderBottom: "2px solid #e5e7eb",
                }}
              >
                {t.sleepRest}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {sleepRecs
                  .sort((a, b) => {
                    const order = { high: 0, medium: 1, low: 2, good: 3 };
                    return (order[a.priority] ?? 4) - (order[b.priority] ?? 4);
                  })
                  .map((rec, i) => (
                    <RecommendationCard key={i} rec={rec} language={language} text={t} />
                  ))}
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#1f2937",
                  marginBottom: 12,
                  paddingBottom: 8,
                  borderBottom: "2px solid #e5e7eb",
                }}
              >
                {t.exerciseActivity}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {exerciseRecs
                  .sort((a, b) => {
                    const order = { high: 0, medium: 1, low: 2, good: 3 };
                    return (order[a.priority] ?? 4) - (order[b.priority] ?? 4);
                  })
                  .map((rec, i) => (
                    <RecommendationCard key={i} rec={rec} language={language} text={t} />
                  ))}
              </div>
            </div>
          </div>

          <div className="gv-footer" style={{ marginTop: 24 }}>
            <button
              className="gv-btn ghost"
              onClick={() => navigate("/survey", { state: { age: answers.age } })}
              type="button"
            >
              {t.retake}
            </button>
            <button className="gv-btn primary" onClick={() => navigate("/")} type="button">
              {t.goHome}
            </button>
          </div>
        </section>

        <HealthInfoFooter language={language} />
      </main>
    </div>
  );
}