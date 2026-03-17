import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Landing({ language = "en" }) {
  const [age, setAge] = useState("");
  const navigate = useNavigate();

  const text = {
    en: {
      steps: ["About You", "Sleep", "Activity", "Summary"],
      title: "Tell us about yourself",
      subtitle: "This helps us personalize your sleep and activity insights.",
      ageQuestion: "What is your age?",
      next: "Next",
    },
    es: {
      steps: ["Sobre Ti", "Sueño", "Actividad", "Resumen"],
      title: "Cuéntanos sobre ti",
      subtitle: "Esto nos ayuda a personalizar tus recomendaciones de sueño y actividad.",
      ageQuestion: "¿Cuál es tu edad?",
      next: "Siguiente",
    },
  };

  const t = text[language];
  const isValidAge = age !== "" && Number(age) >= 18 && Number(age) <= 100;

  const handleStart = () => {
    if (!isValidAge) return;
    navigate("/survey", { state: { age: Number(age) } });
  };

  const stepMeta = t.steps.map((label) => ({ label }));

  return (
    <div>
      <main className="gv-shell">
        <div className="gv-stepper" aria-label="Progress">
          {stepMeta.map((s, idx) => (
            <div
              key={s.label}
              className={`gv-step ${idx === 0 ? "active" : ""}`}
            >
              <div className="dot" />
              <label>{s.label}</label>
            </div>
          ))}
        </div>

        <section className="gv-card">
          <h2>{t.title}</h2>
          <div className="gv-sub">{t.subtitle}</div>

          <div className="gv-q">{t.ageQuestion}</div>
          <input
            className="gv-input"
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            min={18}
            max={100}
            style={{
              background: "#f5f7fa",
              color: "#000000",
              border: "2px solid #d1d9e6",
            }}
          />

          <div className="gv-footer">
            <button
              className="gv-btn primary"
              onClick={handleStart}
              disabled={!isValidAge}
              type="button"
            >
              {t.next}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}