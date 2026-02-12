import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { surveyQuestions } from "../data/surveyQuestions";




function InfoTip({ text }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // close when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
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
          width: 2,
          height: 30,
          borderRadius: "50%",
          border: "1px solid #aaa",
          background: "transparent",
          color: "#ddd",
          fontSize: 12,
          fontWeight: 800,
          cursor: "pointer",
          lineHeight: "18px",
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
            width: 320,
            padding: 12,
            borderRadius: 10,
            background: "#111",
            color: "#eee",
            border: "1px solid rgba(255,255,255,0.15)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
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



export default function Survey() {
  const location = useLocation();
  const navigate = useNavigate();
  const age = location.state?.age;

  if (!age) {
    return (
      <div style={{ padding: 32, maxWidth: 600, margin: "0 auto" }}>
        <h2>Oops!</h2>
        <p>Please start the survey from the home page.</p>
        <button onClick={() => navigate("/")}>Go to Home</button>
      </div>
    );
  }

  const [answers, setAnswers] = useState({ age });
  const [step, setStep] = useState(0);

  function updateAnswer(id, value) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function isAnswered(question, ans = answers) {
    const val = ans[question.id];
    if (val === undefined || val === null) return false;

    if (question.type === "yesno") return val === "Yes" || val === "No";

    if (question.type === "time12") {
      if (typeof val !== "object" || !val) return false;

      const hourNum = Number(val.hour);
      const minuteNum = Number(val.minute);

      const hourOk =
        val.hour !== "" &&
        !Number.isNaN(hourNum) &&
        hourNum >= 1 &&
        hourNum <= 12;

      const minuteOk =
        val.minute !== "" &&
        !Number.isNaN(minuteNum) &&
        minuteNum >= 0 &&
        minuteNum <= 59;

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

    return true;
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

  const q = visibleQuestions[step];
  const progressText = `${step + 1} / ${visibleQuestions.length}`;

  function handleBack() {
    if (step === 0) navigate("/");
    else setStep((s) => s - 1);
  }

  function handleNext() {
    if (!isAnswered(q)) return;

    if (step === visibleQuestions.length - 1) {
      navigate("/results", { state: { answers } });
    } else {
      setStep((s) => s + 1);
    }
  }

  const currentValue =
    answers[q.id] ??
    (q.type === "frequency"
      ? { count: "", per: "week" }
      : q.type === "duration"
      ? { value: "", unit: "minutes" }
      : q.type === "time12"
      ? { hour: "", minute: "", ampm: "AM" }
      : "");

  return (
    <div style={{ padding: 32, maxWidth: 900, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <div style={{ textAlign: "center", width: "100%" }}>
        <h1 style={{ marginBottom: 4 }}>{q.section}</h1>

          <div style={{ opacity: 0.8 }}>Age: {age}</div>
        </div>
        <div style={{ fontWeight: 600, whiteSpace: "nowrap" }}>
          {progressText}
        </div>
      </div>

      <div
        style={{
          marginTop: 20,
          padding: 18,
          border: "1px solid #ddd",
          maxWidth: 760,
          marginLeft: "auto",
          marginRight: "auto",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 6 }}>
          {q.section}
        </div>
        <h2 style={{ marginTop: 0 }}>
  {q.question}
  {q.info && <InfoTip text={q.info} />}
</h2>

        {q.helper && <p style={{ opacity: 0.8 }}>{q.helper}</p>}

        {q.sublabel && (
          <div style={{ fontWeight: 600, marginTop: 18, marginBottom: 10 }}>
            {q.sublabel}
          </div>
        )}

        {/* y/n */}
        {q.type === "yesno" && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 16,
              marginTop: 20,
            }}
          >
            <div
              onClick={() => updateAnswer(q.id, "Yes")}
              style={{
                padding: "14px 28px",
                borderRadius: 8,
                cursor: "pointer",
                border: "2px solid",
                borderColor: answers[q.id] === "Yes" ? "#4CAF50" : "#777",
                backgroundColor:
                  answers[q.id] === "Yes" ? "#e8f5e9" : "transparent",
                color: answers[q.id] === "Yes" ? "#1b5e20" : "#ccc",
                fontWeight: 700,
                minWidth: 120,
                textAlign: "center",
                transition: "all 0.2s ease",
              }}
            >
              Yes
            </div>

            <div
              onClick={() => updateAnswer(q.id, "No")}
              style={{
                padding: "14px 28px",
                borderRadius: 8,
                cursor: "pointer",
                border: "2px solid",
                borderColor: answers[q.id] === "No" ? "#f44336" : "#777",
                backgroundColor:
                  answers[q.id] === "No" ? "#fdecea" : "transparent",
                color: answers[q.id] === "No" ? "#7f1d1d" : "#ccc",
                fontWeight: 700,
                minWidth: 120,
                textAlign: "center",
                transition: "all 0.2s ease",
              }}
            >
              No
            </div>
          </div>
        )}

        {/* time*/}
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
                a. Time (12-hour format)
              </div>
            )}

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {/* hour */}
              <input
                type="number"
                min="1"
                max="12"
                value={currentValue.hour}
                onChange={(e) =>
                  updateAnswer(q.id, { ...currentValue, hour: e.target.value })
                }
                placeholder="hh"
                style={{
                  width: 70,
                  padding: 10,
                  fontSize: 16,
                  textAlign: "center",
                }}
              />

              <span style={{ fontSize: 18, fontWeight: 700 }}>:</span>

              {/* Minute */}
              <input
                type="number"
                min="0"
                max="59"
                value={currentValue.minute}
                onChange={(e) =>
                  updateAnswer(q.id, {
                    ...currentValue,
                    minute: e.target.value,
                  })
                }
                placeholder="mm"
                style={{
                  width: 70,
                  padding: 10,
                  fontSize: 16,
                  textAlign: "center",
                }}
              />

              {/* AM/PM */}
              <select
                value={currentValue.ampm}
                onChange={(e) =>
                  updateAnswer(q.id, { ...currentValue, ampm: e.target.value })
                }
                style={{ padding: 10, fontSize: 16 }}
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>

            <div style={{ fontSize: 12, opacity: 0.8 }}>
              Example: 10 : 30 PM
            </div>
          </div>
        )}

        {/* freq */}
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
              placeholder="0"
              style={{
                padding: 10,
                fontSize: 16,
                width: 120,
                textAlign: "center",
              }}
            />
            <span>per</span>
            <select
              value={currentValue.per}
              onChange={(e) =>
                updateAnswer(q.id, { ...currentValue, per: e.target.value })
              }
              style={{ padding: 10, fontSize: 16 }}
            >
              <option value="day">day</option>
              <option value="week">week</option>
              <option value="year">year</option>
            </select>
          </div>
        )}

        {/* duration  */}
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
              placeholder="0"
              style={{
                padding: 10,
                fontSize: 16,
                width: 120,
                textAlign: "center",
              }}
            />
            <select
              value={currentValue.unit}
              onChange={(e) =>
                updateAnswer(q.id, { ...currentValue, unit: e.target.value })
              }
              style={{ padding: 10, fontSize: 16 }}
            >
              <option value="minutes">minutes</option>
              <option value="hours">hours</option>
            </select>
          </div>
        )}

        {!isAnswered(q) && (
          <div style={{ marginTop: 12, color: "crimson" }}>
            Please answer to continue.
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: 18,
          display: "flex",
          justifyContent: "center",
          gap: 12,
        }}
      >
        <button onClick={handleBack}>← Back</button>
        <button onClick={handleNext}>
          {step === visibleQuestions.length - 1 ? "Submit →" : "Next →"}
        </button>
      </div>
    </div>
  );
}
