import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import HealthInfoFooter from "../components/HealthInfoFooter";

const PRIORITY_COLORS = {
  high:   { bg: "#fff5f5", border: "#feb2b2", badge: "#e53e3e", text: "#742a2a" },
  medium: { bg: "#fffaf0", border: "#fbd38d", badge: "#dd6b20", text: "#7c2d12" },
  low:    { bg: "#f0f4ff", border: "#a3bffa", badge: "#5a67d8", text: "#2c5282" },
  good:   { bg: "#f0fdf4", border: "#86efac", badge: "#16a34a", text: "#14532d" },
};

// function ScoreRing({ score }) {
//   const radius = 54;
//   const circumference = 2 * Math.PI * radius;
//   const offset = circumference - (score / 100) * circumference;

//   const color =
//     score >= 75 ? "#16a34a" :
//     score >= 50 ? "#dd6b20" :
//     "#e53e3e";

//   return (
//     <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28 }}>
//       <svg width="140" height="140" viewBox="0 0 140 140">
//         {/* Track */}
//         <circle cx="70" cy="70" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="12" />
//         {/* Progress */}
//         <circle
//           cx="70" cy="70" r={radius}
//           fill="none"
//           stroke={color}
//           strokeWidth="12"
//           strokeDasharray={circumference}
//           strokeDashoffset={offset}
//           strokeLinecap="round"
//           transform="rotate(-90 70 70)"
//           style={{ transition: "stroke-dashoffset 1s ease" }}
//         />
//         <text x="70" y="65" textAnchor="middle" fill="#1f2937" fontSize="28" fontWeight="800">
//           {Math.round(score)}
//         </text>
//         <text x="70" y="85" textAnchor="middle" fill="#6b7280" fontSize="11">
//           out of 100
//         </text>
//       </svg>
//       <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
//         Lifestyle Score
//       </div>
//     </div>
//   );
// }

function BreakdownBar({ label, value, unit, max, color }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
        <span style={{ color: "#4b5563" }}>{label}</span>
        <span style={{ color: "#1f2937", fontWeight: 700 }}>{value}{unit}</span>
      </div>
      <div style={{ height: 6, borderRadius: 4, background: "#e5e7eb", overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: color,
          borderRadius: 4,
          transition: "width 0.8s ease",
        }} />
      </div>
    </div>
  );
}

function RecommendationCard({ rec }) {
  const colors = PRIORITY_COLORS[rec.priority] || PRIORITY_COLORS.low;

  return (
    <div style={{
      background: colors.bg,
      border: `2px solid ${colors.border}`,
      borderRadius: 12,
      padding: "16px 18px",
      height: "100%",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: "#1f2937" }}>{rec.category}</span>
        <span style={{
          marginLeft: "auto",
          background: colors.badge,
          color: "#fff",
          fontSize: 11,
          fontWeight: 700,
          padding: "3px 10px",
          borderRadius: 20,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}>
          {rec.priority === "good" ? "On Track" : rec.priority}
        </span>
      </div>
      <p style={{ margin: "0 0 10px 0", fontSize: 14, color: colors.text, lineHeight: 1.5, fontWeight: 500 }}>
        {rec.message}
      </p>
      <p style={{ margin: 0, fontSize: 13, color: "#4b5563", lineHeight: 1.5 }}>
        {rec.recommendation}
      </p>
    </div>
  );
}

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const answers = location.state?.answers;
  const result = location.state?.result;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!answers || !result) {
    return (
      <div>
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

  const { score, recommendations, breakdown } = result;

  const stepMeta = [
    { label: "About You" },
    { label: "Sleep" },
    { label: "Activity" },
    { label: "Summary" },
  ];

  const stepIndex = 3; // Results page = final step

  const scoreLabel =
    score >= 75 ? "Great work!" :
    score >= 50 ? "Room to improve" :
    "Needs attention";

  const issueCount = recommendations.filter(r => r.priority !== "good").length;
  const goodCount  = recommendations.filter(r => r.priority === "good").length;

  // Separate sleep and exercise recommendations
  const sleepRecs = recommendations.filter(r => 
    r.category.toLowerCase().includes("sleep") || 
    r.category.toLowerCase().includes("jetlag") ||
    r.category.toLowerCase().includes("bedtime")
  );
  
  const exerciseRecs = recommendations.filter(r => 
    r.category.toLowerCase().includes("exercise") || 
    r.category.toLowerCase().includes("activity") ||
    r.category.toLowerCase().includes("sedentary") ||
    r.category.toLowerCase().includes("mvpa")
  );

  return (

  <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>

    <main className="gv-shell" style={{ paddingTop: 800 }}> {/* paddingTop pushes content down, otherwise nothing above "Your Results" is visible */}
      {/* Progress stepper*/}
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
          <h2 style={{ color: "#1f2937" }}>Your Results</h2>
          <div className="gv-sub" style={{ color: "#6b7280" , marginBottom: 28}}>
            {goodCount} area{goodCount !== 1 ? "s" : ""} on track
            {issueCount > 0 && ` · ${issueCount} area${issueCount !== 1 ? "s" : ""} to improve`}
          </div>

          {/* Score ring
          <div style={{ marginTop: 24 }}>
            <ScoreRing score={score} />
            <div style={{ textAlign: "center", fontSize: 16, fontWeight: 700, color: "#1f2937", marginTop: -8, marginBottom: 28 }}>
              {scoreLabel}
            </div>
          </div> */}

          {/* Breakdown bars */}
          <div style={{
            background: "#f9fafb",
            border: "2px solid #e5e7eb",
            borderRadius: 12,
            padding: "16px 20px",
            marginBottom: 28,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#6b7280", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Your Metrics
            </div>
            <BreakdownBar
              label="Average Amount of Sleep per Night"
              value={breakdown.avg_sleep_hours}
              unit=" hr"
              max={12}
              color="#5b8dee"
            />
            <BreakdownBar
              label="Weekly Active Minutes (MVPA)"
              value={breakdown.mvpa_minutes_week}
              unit=" min"
              max={300}
              color="#16a34a"
            />
            <BreakdownBar
              label="Daily Sedentary Time"
              value={breakdown.sedentary_hours_day}
              unit="h"
              max={16}
              color="#dd6b20"
            />
            <BreakdownBar
              label="Social Jetlag"
              value={breakdown.social_jetlag_hours}
              unit="h"
              max={6}
              color="#9b59b6"
            />
          </div>

          {/* Recommendations in 4 quadrants */}
          <div style={{ fontSize: 13, fontWeight: 700, color: "#6b7280", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Personalized Recommendations
          </div>

          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "1fr 1fr", 
            gap: 16,
            marginBottom: 24 
          }}>
            {/* Left Column - Sleep Recommendations */}
            <div>
              <div style={{ 
                fontSize: 14, 
                fontWeight: 700, 
                color: "#1f2937", 
                marginBottom: 12,
                paddingBottom: 8,
                borderBottom: "2px solid #e5e7eb"
              }}>
                Sleep & Rest
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {sleepRecs
                  .sort((a, b) => {
                    const order = { high: 0, medium: 1, low: 2, good: 3 };
                    return (order[a.priority] ?? 4) - (order[b.priority] ?? 4);
                  })
                  .map((rec, i) => (
                    <RecommendationCard key={i} rec={rec} />
                  ))}
              </div>
            </div>

            {/* Right Column - Exercise Recommendations */}
            <div>
              <div style={{ 
                fontSize: 14, 
                fontWeight: 700, 
                color: "#1f2937", 
                marginBottom: 12,
                paddingBottom: 8,
                borderBottom: "2px solid #e5e7eb"
              }}>
                Exercise & Activity
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {exerciseRecs
                  .sort((a, b) => {
                    const order = { high: 0, medium: 1, low: 2, good: 3 };
                    return (order[a.priority] ?? 4) - (order[b.priority] ?? 4);
                  })
                  .map((rec, i) => (
                    <RecommendationCard key={i} rec={rec} />
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
              Retake Survey
            </button>
            <button
              className="gv-btn primary"
              onClick={() => navigate("/")}
              type="button"
            >
              Go Home
            </button>
          </div>
        </section>
        <HealthInfoFooter />
      </main>
    </div>
  );
}