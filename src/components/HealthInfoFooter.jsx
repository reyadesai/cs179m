import { useState } from "react";

function AccordionItem({ id, title, items, openItems, onToggle }) {
  const isOpen = openItems.includes(id);

  return (
    <div
      style={{
        width: "100%",
        border: "1px solid #dbe3f0",
        borderRadius: 12,
        background: "#ffffff",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <button
        type="button"
        onClick={() => onToggle(id)}
        aria-expanded={isOpen}
        style={{
          width: "100%",
          border: "none",
          background: "#ffffff",
          padding: "18px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          fontSize: 15,
          fontWeight: 700,
          color: "#1f2937",
          textAlign: "left",
          boxSizing: "border-box",
        }}
      >
        <span>{title}</span>

        <span
          style={{
            width: 24,
            minWidth: 24,
            textAlign: "center",
            fontSize: 22,
            fontWeight: 700,
            color: "#5b8dee",
            lineHeight: 1,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isOpen ? "−" : "+"}
        </span>
      </button>

      {isOpen && (
        <div
          style={{
            padding: "14px 20px 16px 26px",
            borderTop: "1px solid #e5e7eb",
            background: "#ffffff",
            boxSizing: "border-box",
          }}
        >
          <ul
            style={{
              margin: 0,
              paddingLeft: 18,
              color: "#4b5563",
              lineHeight: 1.65,
              fontSize: 14,
            }}
          >
            {items.map((item, idx) => (
              <li key={idx} style={{ marginBottom: 8 }}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function HealthInfoFooter() {
  const [openItems, setOpenItems] = useState([]);

  const toggleItem = (id) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const sleepSections = [
    {
      id: "sleep-benefits",
      title: "Health benefits of sleep",
      items: [
        "Can help support your immune system and lower how often you get sick.",
        "Helps with stress, mood, attention, memory, and day-to-day performance.",
        "Supports heart and metabolic health and is linked with lower risk of conditions like type 2 diabetes, heart disease, high blood pressure, and stroke.",
        "May also help lower risk tied to fatigue-related injuries, including drowsy driving.",
      ],
    },
    {
      id: "sleep-what-to-do",
      title: "What to do",
      items: [
        "Try to go to bed and wake up at the same time each day.",
        "Keep your bedroom quiet, relaxing, and cool.",
        "Turn off screens and electronic devices before bed.",
        "Avoid heavy meals, alcohol, and late caffeine close to bedtime.",
        "Exercise regularly and keep a healthy overall routine.",
      ],
    },
    {
      id: "sleep-quality",
      title: "Sleep quality",
      items: [
        "Good sleep quality means your sleep feels restful and is not constantly interrupted.",
        "Trouble falling asleep can be a sign your sleep quality needs work.",
        "Waking up repeatedly during the night can also be a sign of poor sleep quality.",
        "Feeling sleepy or tired even after enough hours in bed may mean your sleep is not restorative.",
      ],
    },
  ];

  const activitySections = [
    {
      id: "activity-brain",
      title: "Brain, mood, and sleep",
      items: [
        "Physical activity can help reduce anxiety and support better mood.",
        "It can help keep thinking, learning, and judgment skills sharper as you age.",
        "Being active is also linked with better sleep.",
      ],
    },
    {
      id: "activity-health",
      title: "Weight and health risks",
      items: [
        "Regular activity helps with weight management and overall metabolic health.",
        "It lowers risk for heart disease, stroke, type 2 diabetes, and some cancers.",
        "It can also help lower blood pressure and improve long-term health outcomes.",
      ],
    },
    {
      id: "activity-function",
      title: "Bones, muscles, and daily life",
      items: [
        "Activity strengthens bones and muscles and supports healthier aging.",
        "It can improve your ability to do everyday activities and lower fall risk, especially in older adults.",
        "Staying active is also associated with living longer and functioning better over time.",
      ],
    },
  ];

  return (
    <section
      className="gv-card"
      style={{
        marginTop: 28,
        marginBottom: 60,
        background: "#ffffff",
        padding: "28px 28px 30px 28px",
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <h3
          style={{
            margin: "0 0 8px 0",
            fontSize: 28,
            color: "#1f2937",
            fontWeight: 800,
            textAlign: "center",
          }}
        >
          Learn More
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: "#6b7280",
            lineHeight: 1.6,
            textAlign: "center",
          }}
        >
          Quick CDC-based reference tabs for sleep and physical activity.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 28,
          alignItems: "start",
        }}
      >
        <div style={{ width: "100%" }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: "#1f2937",
              marginBottom: 16,
              paddingBottom: 10,
              borderBottom: "2px solid #e5e7eb",
              textAlign: "left",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            Sleep
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
            {sleepSections.map((section) => (
              <AccordionItem
                key={section.id}
                id={section.id}
                title={section.title}
                items={section.items}
                openItems={openItems}
                onToggle={toggleItem}
              />
            ))}
          </div>
        </div>

        <div style={{ width: "100%" }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: "#1f2937",
              marginBottom: 16,
              paddingBottom: 10,
              borderBottom: "2px solid #e5e7eb",
              textAlign: "left",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            Physical Activity
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
            {activitySections.map((section) => (
              <AccordionItem
                key={section.id}
                id={section.id}
                title={section.title}
                items={section.items}
                openItems={openItems}
                onToggle={toggleItem}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}