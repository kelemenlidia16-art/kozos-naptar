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

/* ========== HELPERS ========== */
const COLORS = ["red", "green", "blue", "purple", "orange", "yellow"];
const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const dateKey = (y, m, d) => `${y}-${m + 1}-${d}`;

/* ========== APP ========== */
export default function App() {
  const [userColor, setUserColor] = useState(
    localStorage.getItem("userColor")
  );
  const [entries, setEntries] = useState({});
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);

  const [form, setForm] = useState({
    availability: "Egész nap",
    answer: "Igen",
  });

  const [rolling, setRolling] = useState(false);
  const [diceResult, setDiceResult] = useState(null);

  /* ========== CLOUD ========== */
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

  /* ========== LOGIN ========== */
  if (!userColor) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#111",
        color: "white"
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

  /* ========== ANSWERS ========== */
  function saveAnswer() {
    const key = dateKey(year, month, selectedDay);
    const copy = { ...entries };
    if (!copy[key]) copy[key] = [];

    const entry = {
      ...form,
      color: userColor
    };

    if (editingIndex !== null) {
      copy[key][editingIndex] = entry;
    } else {
      copy[key].push(entry);
    }

    saveCloud(copy);
    setEditingIndex(null);
  }

  function editAnswer(i) {
    const key = dateKey(year, month, selectedDay);
    setForm({
      availability: entries[key][i].availability,
      answer: entries[key][i].answer,
    });
    setEditingIndex(i);
  }

  function deleteAnswer(i) {
    const key = dateKey(year, month, selectedDay);
    const copy = { ...entries };
    copy[key].splice(i, 1);
    if (copy[key].length === 0) delete copy[key];
    saveCloud(copy);
    setEditingIndex(null);
  }

  /* ========== DICE ========== */
  function rollDice() {
    setRolling(true);
    setDiceResult(null);
    setTimeout(() => {
      setDiceResult(Math.floor(Math.random() * 20) + 1);
      setRolling(false);
    }, 1200);
  }

  /* ========== UI ========== */
  return (
    <div style={{
      minHeight: "100vh",
      backgroundImage: "url('/assets/hatter.jpg')",
      backgroundSize: "cover",
      padding: 20,
      color: "white"
    }}>

      <h1>🎲 Közös Naptár</h1>

      {/* MONTH NAV */}
      <div style={{ marginBottom: 10 }}>
        <button onClick={() => setMonth(m => m === 0 ? 11 : m - 1)}>◀</button>
        <b style={{ margin: "0 10px" }}>
          {year}. {month + 1}.
        </b>
        <button onClick={() => setMonth(m => m === 11 ? 0 : m + 1)}>▶</button>
      </div>

      {/* CALENDAR */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 60px)", gap: 6 }}>
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
                  <div
                    key={i}
                    style={{
                      width: 10,
                      height: 10,
                      margin: 1,
                      borderRadius: "50%",
                      background: e.answer === "Csak ha nagyon muszáj"
                        ? "transparent"
                        : e.color,
                      border: e.answer === "Csak ha nagyon muszáj"
                        ? `2px solid ${e.color}`
                        : "none"
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
        <div style={{ marginTop: 20, background: "white", color: "black", padding: 10 }}>
          <h3>{year}.{month + 1}.{selectedDay}</h3>

          {(entries[dateKey(year, month, selectedDay)] || []).map((e, i) => (
            <div key={i}>
              <span style={{ color: e.color }}>⬤</span>
              {" "}{e.availability} – {e.answer}
              {e.color === userColor && (
                <>
                  <button onClick={() => editAnswer(i)}>✏️</button>
                  <button onClick={() => deleteAnswer(i)}>🗑</button>
                </>
              )}
            </div>
          ))}

          <hr />

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

      {/* DICE */}
      <img
        src="/assets/dice.png"
        onClick={rollDice}
        style={{
          position: "fixed",
          right: 20,
          bottom: 20,
          width: 80,
          cursor: "pointer",
          animation: rolling ? "spin 0.5s linear infinite" : "none"
        }}
      />

      {diceResult && (
        <div style={{
          position: "fixed",
          right: 120,
          bottom: 40,
          fontSize: 32,
          background: "black",
          padding: 10
        }}>
          🎲 {diceResult}
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
