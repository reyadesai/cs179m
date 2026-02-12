import { useLocation, useNavigate } from "react-router-dom";

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const answers = location.state?.answers;

  if (!answers) {
    return (
      <div style={{ padding: 32 }}>
        <p>No results found. Please take the survey first.</p>
        <button onClick={() => navigate("/")}>Go Home</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 32, maxWidth: 800, margin: "0 auto" }}>
      <h1>Results (temporary)</h1>
      <p>This is just to confirm we captured survey responses.</p>
      <pre style={{ background: "#f6f6f6", padding: 16, overflow: "auto" }}>
        {JSON.stringify(answers, null, 2)}
      </pre>
      <button onClick={() => navigate("/survey", { state: { age: answers.age } })}>
        Retake Survey
      </button>
    </div>
  );
}
