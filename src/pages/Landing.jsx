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

  return (
    <div style={{ padding: 32, maxWidth: 500, margin: "0 auto" }}>
      <h1>SleepFit</h1>
      <p>Check your sleep health in under 2 minutes.</p>

      <div style={{ marginTop: 24 }}>
        <label style={{ display: "block", marginBottom: 8 }}>
          Enter your age
        </label>

        <input
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="e.g. 22"
          min={10}
          max={100}
          style={{
            width: "100%",
            padding: 10,
            fontSize: 16,
            marginBottom: 8,
          }}
        />

        {!isValidAge && age !== "" && (
          <p style={{ color: "red", fontSize: 14 }}>
            Please enter a valid age (10–100).
          </p>
        )}
      </div>

      <button
        onClick={handleStart}
        disabled={!isValidAge}
        style={{
          marginTop: 16,
          padding: "12px 16px",
          fontSize: 16,
          cursor: isValidAge ? "pointer" : "not-allowed",
        }}
      >
        Start Survey →
      </button>
    </div>
  );
}
