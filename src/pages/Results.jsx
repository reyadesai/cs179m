import { useLocation, useNavigate } from "react-router-dom";

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const answers = location.state?.answers;

  if (!answers) {
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
          <section className="gv-card">
            <h2>No results found</h2>
            <div className="gv-sub">Please take the survey first.</div>
            <div className="gv-footer">
              <button className="gv-btn primary" onClick={() => navigate("/")} type="button">
                Go Home
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }

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
        <section className="gv-card">
          <h2>Results</h2>
          <div className="gv-sub">Temporary screen — confirming we captured responses.</div>

          <pre
            style={{
              marginTop: 18,
              background: "#f6f8ff",
              border: "1px solid var(--gv-border)",
              padding: 16,
              borderRadius: 12,
              overflow: "auto",
              textAlign: "left",
              maxHeight: 380,
            }}
          >
            {JSON.stringify(answers, null, 2)}
          </pre>

          <div className="gv-footer">
            <button
              className="gv-btn primary"
              onClick={() => navigate("/survey", { state: { age: answers.age } })}
              type="button"
            >
              Retake Survey
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}