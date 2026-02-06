import { Link } from "react-router-dom";

export default function Results() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Results</h1>
      <p>Results dashboard will go here.</p>
      <Link to="/survey">Retake Survey</Link>
    </div>
  );
}
