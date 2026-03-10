import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { surveyQuestions } from "../data/surveyQuestions";

function InfoTip({ text }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <span
      ref={ref}
      style={{ position: "relative", display: "inline-flex", marginLeft: 10 }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label="More information"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          border: "1px solid var(--gv-border)",
          background: "transparent",
          color: "var(--gv-muted)",
          fontSize: 12,
          fontWeight: 800,
          cursor: "pointer",
          lineHeight: "22px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        i
      </button>

      {open && (
        <div
          role="tooltip"
          style={{
            position: "absolute",
            top: "110%",
            right: 0,
            width: 260,
            padding: 12,
            borderRadius: 10,
            background: "#0b1220",
            color: "#eef2ff",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 16px 46px rgba(0,0,0,0.35)",
            fontSize: 13,
            textAlign: "left",
            zIndex: 9999,
          }}
        >
          {text}
        </div>
      )}
    </span>
  );
}

export default function Survey({ language = "en" }) {
  const location = useLocation();
  const navigate = useNavigate();
  const age = location.state?.age;

  const text = {
    en: {
      oops: "Oops!",
      startFromHome: "Please start the survey from the home page.",
      goHome: "Go to Home",
      stepMeta: [
        {
          label: "About You",
          title: "Tell us about yourself",
          subtitle: "This helps us personalize your sleep and activity insights.",
        },
        {
          label: "Sleep",
          title: "Sleep",
          subtitle: "Questions about your sleep habits and schedule.",
        },
        {
          label: "Activity",
          title: "Physical Activity",
          subtitle: "Questions about your daily movement and exercise.",
        },
        {
          label: "Summary",
          title: "Review",
          subtitle: "Double-check your responses before submitting.",
        },
      ],
      yes: "Yes",
      no: "No",
      timeFormat: "Time (12-hour format)",
      perWeek: "per week",
      minutes: "minutes",
      hours: "hours",
      back: "← Back",
      next: "Next",
      submit: "Submit",
      analyzing: "Analyzing…",
      serverError: "Could not reach the server. Is the backend running?",
    },
    es: {
      oops: "¡Ups!",
      startFromHome: "Por favor comienza la encuesta desde la página principal.",
      goHome: "Ir al Inicio",
      stepMeta: [
        {
          label: "Sobre Ti",
          title: "Cuéntanos sobre ti",
          subtitle: "Esto nos ayuda a personalizar tus recomendaciones de sueño y actividad.",
        },
        {
          label: "Sueño",
          title: "Sueño",
          subtitle: "Preguntas sobre tus hábitos y horario de sueño.",
        },
        {
          label: "Actividad",
          title: "Actividad Física",
          subtitle: "Preguntas sobre tu movimiento diario y ejercicio.",
        },
        {
          label: "Resumen",
          title: "Revisar",
          subtitle: "Verifica tus respuestas antes de enviarlas.",
        },
      ],
      yes: "Sí",
      no: "No",
      timeFormat: "Hora (formato de 12 horas)",
      perWeek: "por semana",
      minutes: "minutos",
      hours: "horas",
      back: "← Regresar",
      next: "Siguiente",
      submit: "Enviar",
      analyzing: "Analizando…",
      serverError: "No se pudo conectar con el servidor. ¿Está corriendo el backend?",
    },
  };

  const t = text[language];

  if (!age) {
    return (
      <div style={{ padding: 32, maxWidth: 600, margin: "0 auto" }}>
        <h2>{t.oops}</h2>
        <p>{t.startFromHome}</p>
        <button onClick={() => navigate("/")}>{t.goHome}</button>
      </div>
    );
  }

  const [answers, setAnswers] = useState({ age });
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const stepMeta = t.stepMeta;

  function updateAnswer(id, value) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function isAnswered(question, ans = answers) {
    const val = ans[question.id];
    if (val === undefined || val === null) return false;

    if (question.type === "yesno") return val === "yes" || val === "no";

    if (question.type === "time12") {
      if (typeof val !== "object" || !val) return false;
      const hourNum = Number(val.hour);
      const minuteNum = Number(val.minute);
      const hourOk =
        val.hour !== "" && !Number.isNaN(hourNum) && hourNum >= 1 && hourNum <= 12;
      const minuteOk =
        val.minute !== "" && !Number.isNaN(minuteNum) && minuteNum >= 0 && minuteNum <= 59;
      const ampmOk = val.ampm === "AM" || val.ampm === "PM";
      return hourOk && minuteOk && ampmOk;
    }

    if (question.type === "frequency") {
      return (
        val &&
        val.count !== "" &&
        !Number.isNaN(Number(val.count)) &&
        val.per !== ""
      );
    }

    if (question.type === "duration") {
      return (
        val &&
        val.value !== "" &&
        !Number.isNaN(Number(val.value)) &&
        val.unit !== ""
      );
    }

    return String(val).trim() !== "";
  }

  const visibleQuestions = useMemo(() => {
    return surveyQuestions.filter((q) => {
      if (q.dependsOn) {
        const depVal = answers[q.dependsOn.id];
        if (depVal !== q.dependsOn.equals) return false;
      }
      if (q.dependsOnAnswered) {
        const depQ = surveyQuestions.find((x) => x.id === q.dependsOnAnswered);
        if (!depQ) return true;
        if (!isAnswered(depQ)) return false;
      }
      if (q.optionalIf) {
        const depVal = answers[q.optionalIf.id];
        if (depVal === q.optionalIf.equals) return false;
      }
      return true;
    });
  }, [answers]);

  const safeStep = Math.min(step, visibleQuestions.length - 1);
  const q = visibleQuestions[safeStep];
  const progressText = `${safeStep + 1} / ${visibleQuestions.length}`;

  function sectionToStepIndex(section) {
    const s = String(
      typeof section === "object" ? section[language] : section || ""
    ).toLowerCase();

    if (s.includes("about") || s.includes("sobre") || s.includes("you") || s.includes("ti")) return 0;
    if (s.includes("sleep") || s.includes("sueño")) return 1;
    if (
      s.includes("activity") ||
      s.includes("exercise") ||
      s.includes("physical") ||
      s.includes("actividad")
    ) return 2;
    if (
      s.includes("summary") ||
      s.includes("review") ||
      s.includes("resumen") ||
      s.includes("revisar")
    ) return 3;

    const ratio = visibleQuestions.length
      ? safeStep / Math.max(1, visibleQuestions.length - 1)
      : 0;
    return Math.min(3, Math.max(0, Math.floor(ratio * 4)));
  }

  const stepIndex = sectionToStepIndex(q?.section);

  function handleBack() {
    if (safeStep === 0) navigate("/");
    else setStep((s) => Math.max(0, s - 1));
  }

  async function handleNext() {
    if (!isAnswered(q)) return;

    if (safeStep === visibleQuestions.length - 1) {
      setSubmitting(true);
      setSubmitError(null);

      try {
        const payload = {
          ...answers,
          language,
        };

        console.log("Submitting payload:", payload);

        const response = await fetch("/api/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const err = await response.json();
          console.log("Backend error:", err);
          throw new Error(JSON.stringify(err.detail) || "Server error");
        }

        const result = await response.json();
        navigate("/results", { state: { answers, result } });
      } catch (err) {
        setSubmitError(err.message || t.serverError);
      } finally {
        setSubmitting(false);
      }
    } else {
      setStep((s) => s + 1);
    }
  }

  const getDefaultAmPm = (questionId) => {
    const pmDefaults = ["bedtime", "usual_bedtime", "sleep_time"];
    const amDefaults = ["waketime", "wake_time", "usual_waketime"];

    if (pmDefaults.some((id) => questionId.includes(id))) return "PM";
    if (amDefaults.some((id) => questionId.includes(id))) return "AM";
    return "AM";
  };

  const currentValue =
    answers[q.id] ??
    (q.type === "frequency"
      ? { count: "", per: "week" }
      : q.type === "duration"
      ? { value: "", unit: "minutes" }
      : q.type === "time12"
      ? { hour: "", minute: "", ampm: getDefaultAmPm(q.id) }
      : "");

  return (
    <div>
      <main className="gv-shell">
        <div className="gv-stepper" aria-label="Progress">
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

        <section className="gv-card">
          <h2>{stepMeta[stepIndex]?.title}</h2>
          <div className="gv-sub">{stepMeta[stepIndex]?.subtitle}</div>

          <div
            style={{
              marginTop: 12,
              color: "var(--gv-muted)",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            {progressText}
          </div>

          <div className="gv-q">
            {q.question[language]}
            {q.info && (
              <InfoTip text={typeof q.info === "object" ? q.info[language] : q.info} />
            )}
          </div>

          {q.helper && (
            <p style={{ opacity: 0.8 }}>
              {typeof q.helper === "object" ? q.helper[language] : q.helper}
            </p>
          )}

          {q.sublabel && (
            <div style={{ fontWeight: 600, marginTop: 18, marginBottom: 10 }}>
              {q.sublabel[language]}
            </div>
          )}

          {q.type === "yesno" && (
            <div className="gv-options" style={{ marginTop: 14 }}>
              <div
                onClick={() => updateAnswer(q.id, "yes")}
                className={`gv-option ${answers[q.id] === "yes" ? "selected" : ""}`}
                role="button"
                tabIndex={0}
              >
                {t.yes}
              </div>
              <div
                onClick={() => updateAnswer(q.id, "no")}
                className={`gv-option ${answers[q.id] === "no" ? "selected" : ""}`}
                role="button"
                tabIndex={0}
              >
                {t.no}
              </div>
            </div>
          )}

          {q.type === "time12" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                marginTop: 10,
              }}
            >
              {!q.sublabel && (
                <div style={{ fontWeight: 600, marginTop: 10 }}>
                  {t.timeFormat}
                </div>
              )}

              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <select
                  value={currentValue.hour}
                  onChange={(e) =>
                    updateAnswer(q.id, { ...currentValue, hour: e.target.value })
                  }
                  style={{
                    width: 90,
                    padding: 12,
                    fontSize: 16,
                    textAlign: "center",
                    borderRadius: 12,
                    border: "2px solid var(--gv-border)",
                    background: "#f5f7fa",
                    color: "#000000",
                  }}
                >
                  <option value="" disabled>
                    hh
                  </option>
                  {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>

                <span style={{ fontSize: 18, fontWeight: 700 }}>:</span>

                <select
                  value={currentValue.minute}
                  onChange={(e) =>
                    updateAnswer(q.id, { ...currentValue, minute: e.target.value })
                  }
                  style={{
                    width: 90,
                    padding: 12,
                    fontSize: 16,
                    textAlign: "center",
                    borderRadius: 12,
                    border: "2px solid var(--gv-border)",
                    background: "#f5f7fa",
                    color: "#000000",
                  }}
                >
                  <option value="" disabled>
                    mm
                  </option>
                  {["00", "15", "30", "45"].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>

                <select
                  value={currentValue.ampm}
                  onChange={(e) =>
                    updateAnswer(q.id, { ...currentValue, ampm: e.target.value })
                  }
                  style={{
                    width: 90,
                    padding: 12,
                    fontSize: 16,
                    borderRadius: 12,
                    border: "2px solid var(--gv-border)",
                    background: "#f5f7fa",
                    color: "#000000",
                  }}
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
          )}

          {q.type === "frequency" && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 12,
                alignItems: "center",
              }}
            >
              <input
                type="number"
                min="0"
                value={currentValue.count}
                onChange={(e) =>
                  updateAnswer(q.id, { ...currentValue, count: e.target.value })
                }
                className="gv-input"
                style={{
                  width: 140,
                  textAlign: "center",
                  marginTop: 0,
                  background: "#f5f7fa",
                  color: "#000000",
                }}
              />
              <span>{t.perWeek}</span>
            </div>
          )}

          {q.type === "duration" && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 12,
                alignItems: "center",
              }}
            >
              <input
                type="number"
                min="0"
                value={currentValue.value}
                onChange={(e) =>
                  updateAnswer(q.id, { ...currentValue, value: e.target.value })
                }
                className="gv-input"
                style={{
                  width: 140,
                  textAlign: "center",
                  marginTop: 0,
                  background: "#f5f7fa",
                  color: "#000000",
                }}
              />
              <select
                value={currentValue.unit}
                onChange={(e) =>
                  updateAnswer(q.id, { ...currentValue, unit: e.target.value })
                }
                style={{
                  padding: 12,
                  fontSize: 16,
                  borderRadius: 12,
                  border: "2px solid var(--gv-border)",
                  background: "#f5f7fa",
                  color: "#000000",
                }}
              >
                <option value="minutes">{t.minutes}</option>
                <option value="hours">{t.hours}</option>
              </select>
            </div>
          )}

          {q.type !== "yesno" &&
            q.type !== "time12" &&
            q.type !== "frequency" &&
            q.type !== "duration" && (
              <input
                className="gv-input"
                value={currentValue}
                onChange={(e) => updateAnswer(q.id, e.target.value)}
              />
            )}

          {submitError && (
            <div className="gv-error" style={{ marginTop: 12 }}>
              ⚠ {submitError}
            </div>
          )}

          <div className="gv-footer">
            <button
              className="gv-btn ghost"
              onClick={handleBack}
              type="button"
              disabled={submitting}
            >
              {t.back}
            </button>
            <button
              className="gv-btn primary"
              onClick={handleNext}
              disabled={!isAnswered(q) || submitting}
              type="button"
            >
              {submitting
                ? t.analyzing
                : safeStep === visibleQuestions.length - 1
                ? t.submit
                : t.next}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}