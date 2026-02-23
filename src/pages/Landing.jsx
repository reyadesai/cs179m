import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const [age, setAge] = useState("");
  const navigate = useNavigate();

  const isValidAge = age !== "" && Number(age) >= 10 && Number(age) <= 100;

  const handleStart = () => {
    if (!isValidAge) return;
    navigate("/survey", { state: { age: Number(age) } });
  };

  const stepMeta = [
    { label: "About You" },
    { label: "Sleep" },
    { label: "Activity" },
    { label: "Summary" },
  ];

  return (
    <div>
      <header className="gv-topbar">
        <div className="gv-brand">SleepFit AI</div>
        <div className="gv-lang">
          <button className="gv-chip" type="button">English</button>
          <button className="gv-chip" type="button">Español</button>
        </div>
      </header>

      <main className="gv-shell">

        {/* progress bar */}
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
          <h2>Tell us about yourself</h2>
          <div className="gv-sub">
            This helps us personalize your sleep and activity insights.
          </div>

          <div className="gv-q">What is your age?</div>
          <input
            className="gv-input"
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            min={10}
            max={100}
          />

          {!isValidAge && age !== "" && (
            <div className="gv-error">Please enter a valid age (10–100).</div>
          )}

          <div className="gv-footer">
            <button
              className="gv-btn primary"
              onClick={handleStart}
              disabled={!isValidAge}
              type="button"
            >
              Next
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}