import React, { useState } from "react";

const USERS = {
  green: "Habo",
  purple: "Puszta",
  yellow: "Jankisz",
  orange: "Lidi",
  red: "Sho",
  blue: "Dorka",
};

const COLORS = Object.keys(USERS);

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function App() {
  const [year] = useState(2026);
  const [month, setMonth] = useState(0);
  const [userColor, setUserColor] = useState("");
  const [data, setData] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = new Date(year, month, 1).getDay();
  const offset = (firstDay + 6) % 7;

  const monthName = new Date(year, month).toLocaleString("hu-HU", {
    month: "long",
  });

  function saveAnswer(day, answer) {
    setData((prev) => {
      const dayKey = `${year}-${month}-${day}`;
      const dayData = prev[dayKey] || [];
      const filtered = dayData.filter((a) => a.color !== userColor);
      return {
        ...prev,
        [dayKey]: [...filtered, answer],
      };
    });
  }

  if (!userColor) {
    return (
      <div style={styles.login}>
        <h2>Válassz színt</h2>
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setUserColor(c)}
            style={{ ...styles.colorBtn, borderColor: c }}
          >
            {USERS[c]}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div style={styles.app}>
      <h1>{monthName} {year}</h1>

      <div style={styles.nav}>
        <button onClick={() => setMonth((m) => Math.max(0, m - 1))}>◀</button>
        <button onClick={() => setMonth((m) => Math.min(11, m + 1))}>▶</button>
      </div>

      <div style={styles.grid}>
        {["H", "K", "Sze", "Cs", "P", "Szo", "V"].map((d) => (
          <div key={d} style={styles.weekday}>{d}</div>
        ))}

        {[...Array(offset)].map((_, i) => (
          <div key={"e" + i} />
        ))}

        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const key = `${year}-${month}-${day}`;
          const answers = data[key] || [];

          return (
            <div
              key={day}
              style={styles.day}
              onClick={() => setSelectedDay(day)}
            >
              <strong>{day}</strong>
              <div style={styles.dots}>
                {answers.map((a, i) => (
                  <span
                    key={i}
                    style={{
                      ...styles.dot,
                      background:
                        a.type === "muszaj" ? "transparent" : a.color,
                      borderColor: a.color,
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selectedDay && (
        <DayModal
          day={selectedDay}
          data={data}
          userColor={userColor}
          saveAnswer={saveAnswer}
          close={() => setSelectedDay(null)}
        />
      )}
    </div>
  );
}

function DayModal({ day, data, userColor, saveAnswer, close }) {
  const key = `2026-${new Date().getMonth()}-${day}`;
  const answers = data[key] || [];
  const myAnswer = answers.find((a) => a.color === userColor);

  const [type, setType] = useState(myAnswer?.type || "igen");
  const [time, setTime] = useState(myAnswer?.time || "");

  function submit() {
    saveAnswer(day, {
      color: userColor,
      name: USERS[userColor],
      type,
      time,
    });
    close();
  }

  return (
    <div style={styles.modalBg}>
      <div style={styles.modal}>
        <h3>{day}. nap válaszai</h3>

        {answers.map((a, i) => (
          <div
            key={i}
            style={{ ...styles.answer, borderColor: a.color }}
          >
            <b>{a.name}</b> – {a.type}
            {a.time && ` (${a.time}h)`}
          </div>
        ))}

        <hr />

        <h4>Saját válasz</h4>

        <button onClick={() => setType("igen")}>Igen</button>
        <button onClick={() => setType("muszaj")}>Csak ha nagyon muszáj</button>
        <button onClick={() => setType("egyeni")}>Más időben</button>

        {type === "egyeni" && (
          <input
            type="number"
            placeholder="óra"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        )}

        <div style={{ marginTop: 10 }}>
          <button onClick={submit}>Mentés</button>
          <button onClick={close}>Bezár</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  app: { padding: 20, color: "white" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 6,
  },
  weekday: { fontSize: 12, textAlign: "center" },
  day: {
    background: "rgba(255,255,255,0.1)",
    padding: 6,
    borderRadius: 6,
    cursor: "pointer",
  },
  dots: { display: "flex", gap: 3, flexWrap: "wrap" },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    border: "2px solid",
  },
  modalBg: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
  },
  modal: {
    background: "#222",
    padding: 20,
    margin: "10% auto",
    width: 300,
  },
  answer: {
    border: "2px solid",
    padding: 4,
    marginBottom: 4,
  },
  login: { padding: 40 },
  colorBtn: {
    display: "block",
    margin: 8,
    padding: 10,
    border: "3px solid",
    background: "transparent",
    color: "white",
  },
  nav: { marginBottom: 10 },
};

export default App;
