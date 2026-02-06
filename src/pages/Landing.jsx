import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div style={{ padding: 24 }}>
      <h1>SleepFit</h1>
      <p>Check your sleep health.</p>
      <Link to="/survey">Start Survey →</Link>
    </div>
  );
}
