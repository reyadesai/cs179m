import { Link, useNavigate } from "react-router-dom";

export default function Survey() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 24 }}>
      <h1>Survey</h1>
      <p>Survey will go here.</p>

      <div style={{ display: "flex", gap: 12 }}>
        <Link to="/">← Back</Link>
        <button onClick={() => navigate("/results")}>Submit →</button>
      </div>
    </div>
  );
}
