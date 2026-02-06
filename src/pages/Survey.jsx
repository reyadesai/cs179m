import { useLocation, useNavigate } from "react-router-dom";

export default function Survey() {
  const location = useLocation();
  const navigate = useNavigate();

  const age = location.state?.age;

  // If user refreshes or visits /survey directly without age
  if (!age) {
    return (
      <div style={{ padding: 32, maxWidth: 500, margin: "0 auto" }}>
        <h2>Oops!</h2>
        <p>Please start the survey from the home page.</p>
        <button onClick={() => navigate("/")}>Go to Home</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 32, maxWidth: 600, margin: "0 auto" }}>
      <h1>Sleep Survey</h1>
      <p>Age: {age}</p>

      <p style={{ marginTop: 16 }}>
        Survey questions will go here.
      </p>

      <div style={{ marginTop: 24 }}>
        <button onClick={() => navigate("/")}>← Back</button>
        <button
          style={{ marginLeft: 12 }}
          onClick={() => navigate("/results")}
        >
          Submit →
        </button>
      </div>
    </div>
  );
}
