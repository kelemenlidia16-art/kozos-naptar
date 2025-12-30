import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

/* ========== FIREBASE ========== */
const firebaseConfig = {
  apiKey: "AIzaSyAxaQKdai1nV7coNTkXwnWF6vlXXUlk4aE",
  authDomain: "database-7ce1b.firebaseapp.com",
  projectId: "database-7ce1b",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ========== CONSTANTS ========== */
const COLORS = ["red", "green", "blue", "purple", "orange", "yellow"];
const WEEKDAYS = ["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat", "Vasárnap"];
const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const dateKey = (y, m, d) => `${y}-${m + 1}-${d}`;

/* ========== APP ========== */
export default function App() {
  /* ---- LOGIN ---- */
  const [userColor, setUserColor] = useState(localStorage.getItem("userColor"));

  /* ---- CALENDAR ---- */
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(0);
  const [entries, setEntries] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);

  /* ---- FORM ---- */
  const [form, setForm] = useState({
    availability: "Egész nap",
    answer: "Igen",
  });

  /* ---- DICE / DRAGON ---- */
  const [rolling, setRolling] = useState(false);
  const [diceResult, setDiceResult] = useState(null);
  const [eatDice, setEatDice] = useState(false);

  /* ---- LOAD CLOUD ---- */
  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, "calendar", "shared"));
      if (snap.exists()) setEntries(snap.data().entries || {});
    })();
  }, []);

  async function saveCloud(newEntries) {
    setEntries(newEntries);
    await setDoc(doc(db, "calendar", "shared"), { entries: newEntries });
  }

  /* ---- LOGIN SCREEN ---- */
  if (!userColor) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#111",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <div>
          <h2>Válaszd ki a színed</h2>
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => {
                localStorage.setItem("userColor", c);
                setUserColor(c);
              }}
              style={{
                background: c,
                margin: 5,
                padding: "10px 20px",
                border: "none",
                cursor: "pointer"
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* ---- ANSWERS ---- */
  function saveAnswer() {
    const key = dateKey(year, month, selectedDay);
    const copy = { ...entries };
    if (!copy[key]) copy[key] = [];

    const entry = { ...form, color: userColor };

    if (editingIndex !== null) copy[key][editingIndex] = entry;
    else copy[key].push(entry);

    saveCloud(copy);
    setEditingIndex(null);
  }

  function deleteAnswer(i) {
    const key = dateKey(year, month, selectedDay);
    const copy = { ...entries };
    copy[key].splice(i, 1);
    if (copy[key].length === 0) delete copy[key];
    saveCloud(copy);
  }

  /* ---- DICE ---- */
  function rollDice() {
    setRolling(true);
    setEatDice(false);
    setDiceResult(null);

    setTimeout(() => {
      setEatDice(true);
    }, 800);

    setTimeout(() => {
      setDiceResult(Math.floor(Math.random() * 20) + 1);
      setRolling(false);
    }, 1600);
  }

  /* ---- WEEKDAY OFFSET ---- */
  const firstDayOffset = (new Date(year, month, 1).getDay() + 6) % 7;

  return (
    <div style={{
      minHeight: "100vh",
      backgroundImage: "url('/assets/hatter.jpg')",
      backgroundSize: "cover",
      padding: 20,
      color: "white"
    }}>

      <h1>🐉 Közös Naptár</h1>

      {/* NAV */}
      <div>
        <button onClick={() => month === 0 ? (setMonth(11), setYear(y => y - 1)) : setMonth(m => m - 1)}>◀</button>
        <b style={{ margin: "0 10px" }}>{year}. {month + 1}.</b>
        <button onClick={() => month === 11 ? (setMonth(0), setYear(y => y + 1)) : setMonth(m => m + 1)}>▶</button>
      </div>

      {/* WEEKDAYS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 60px)", marginTop: 10 }}>
        {WEEKDAYS.map(d => <div key={d} style={{ textAlign: "center" }}><b>{d}</b></div>)}
      </div>

      {/* CALENDAR */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 60px)", gap: 6 }}>
        {Array(firstDayOffset).fill(null).map((_, i) => <div key={i}></div>)}

        {Array.from({ length: daysInMonth(year, month) }, (_, i) => i + 1).map(day => {
          const key = dateKey(year, month, day);
          const list = entries[key] || [];
          return (
            <div
              key={day}
              onClick={() => setSelectedDay(day)}
              style={{
                background: "rgba(255,255,255,0.9)",
                color: "black",
                padding: 5,
                cursor: "pointer"
              }}
            >
              <b>{day}</b>
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                {list.map((e, i) => (
                  <div key={i}
                    style={{
                      width: 10,
                      height: 10,
                      margin: 1,
                      borderRadius: "50%",
                      background: e.answer === "Csak ha nagyon muszáj" ? "transparent" : e.color,
                      border: e.answer === "Csak ha nagyon muszáj" ? `2px solid ${e.color}` : "none"
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* DAY PANEL */}
      {selectedDay && (
        <div style={{ background: "white", color: "black", padding: 10, marginTop: 20 }}>
          <h3>{year}.{month + 1}.{selectedDay}</h3>
          {(entries[dateKey(year, month, selectedDay)] || []).map((e, i) => (
            <div key={i}>
              <span style={{ color: e.color }}>⬤</span> {e.availability} – {e.answer}
              {e.color === userColor && (
                <>
                  <button onClick={() => deleteAnswer(i)}>🗑</button>
                </>
              )}
            </div>
          ))}

          <select onChange={e => setForm({ ...form, availability: e.target.value })}>
            <option>Egész nap</option>
            <option>Délután</option>
            <option>Egyéni idő</option>
          </select>

          <select onChange={e => setForm({ ...form, answer: e.target.value })}>
            <option>Igen</option>
            <option>Csak ha nagyon muszáj</option>
          </select>

          <button onClick={saveAnswer}>Mentés</button>
        </div>
      )}

      {/* DRAGON */}
      <img
        src="/assets/dragon.png"
        style={{
          position: "fixed",
          right: 120,
          bottom: 20,
          width: 200,
          animation: eatDice ? "dragonEat 1s forwards" : "tail 2s infinite"
        }}
      />

      {/* DICE */}
      {!eatDice && (
        <img
          src="/assets/dice.png"
          onClick={rollDice}
          style={{
            position: "fixed",
            right: 20,
            bottom: 20,
            width: 80,
            cursor: "pointer",
            animation: rolling ? "spin 0.4s infinite" : "none"
          }}
        />
      )}

      {diceResult && (
        <div style={{
          position: "fixed",
          right: 300,
          bottom: 100,
          fontSize: 36,
          background: "black",
          padding: 10
        }}>
          🎲 {diceResult}
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes tail {
          0%,100% { transform: rotate(0deg); }
          50% { transform: rotate(3deg); }
        }
        @keyframes dragonEat {
          to { transform: translateX(-80px) scale(1.1); }
        }
      `}</style>

    </div>
  );
}
