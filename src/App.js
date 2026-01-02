import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

/* ================= FIREBASE ================= */
const firebaseConfig = {
  apiKey: "AIzaSyAxaQKdai1nV7coNTkXwnWF6vlXXUlk4aE",
  authDomain: "database-7ce1b.firebaseapp.com",
  projectId: "database-7ce1b",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ================= CONSTANTS ================= */
const USERS = [
  { color: "green", name: "Habo" },
  { color: "purple", name: "Puszta" },
  { color: "yellow", name: "Jankisz" },
  { color: "orange", name: "Lidi" },
  { color: "red", name: "Sho" },
  { color: "blue", name: "Dorka" },
];

const WEEKDAYS = ["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat", "Vasárnap"];
const MONTHS = [
  "Január", "Február", "Március", "Április", "Május", "Június",
  "Július", "Augusztus", "Szeptember", "Október", "November", "December"
];

/* ================= HELPERS ================= */
function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function firstWeekday(year, month) {
  const d = new Date(year, month, 1);
  return (d.getDay() + 6) % 7; // hétfő = 0
}

function dateKey(y, m, d) {
  return `${y}-${m + 1}-${d}`;
}

/* ================= APP ================= */
export default function App() {
  const [year] = useState(2026);
  const [month, setMonth] = useState(0);
  const [entries, setEntries] = useState({});
  const [user, setUser] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [form, setForm] = useState({
    availability: "Egész nap",
    answer: "Igen",
  });

  /* ----- LOAD ----- */
  useEffect(() => {
    (async () => {
      const ref = doc(db, "calendar", "shared");
      const snap = await getDoc(ref);
      if (snap.exists()) setEntries(snap.data());
    })();
  }, []);

  /* ----- SAVE CLOUD ----- */
  async function saveCloud(data) {
    await setDoc(doc(db, "calendar", "shared"), data);
  }

  /* ----- DAY CLICK ----- */
  function openDay(day) {
    setSelectedDay(day);
    const key = dateKey(year, month, day);
    const mine = (entries[key] || []).find(e => e.color === user.color);
    if (mine) setForm(mine);
    else setForm({ availability: "Egész nap", answer: "Igen" });
  }

  function saveDay() {
    const key = dateKey(year, month, selectedDay);
    const list = entries[key] || [];
    const filtered = list.filter(e => e.color !== user.color);
    const updated = [...filtered, { ...form, color: user.color }];
    const newEntries = { ...entries, [key]: updated };
    setEntries(newEntries);
    saveCloud(newEntries);
    setSelectedDay(null);
  }

  function deleteDay() {
    const key = dateKey(year, month, selectedDay);
    const list = (entries[key] || []).filter(e => e.color !== user.color);
    const newEntries = { ...entries, [key]: list };
    setEntries(newEntries);
    saveCloud(newEntries);
    setSelectedDay(null);
  }

  /* ================= LOGIN ================= */
  if (!user) {
    const used = Object.values(entries).flat().map(e => e.color);
    return (
      <div style={{ padding: 20 }}>
        <h2>Válaszd ki ki vagy</h2>
        {USERS.map(u => (
          <button
            key={u.color}
            onClick={() => setUser(u)}
            style={{
              margin: 5,
              padding: 10,
              textDecoration: used.includes(u.color) ? "line-through" : "none",
            }}
          >
            🟢 {u.name}
          </button>
        ))}
      </div>
    );
  }

  /* ================= CALENDAR ================= */
  const blanks = firstWeekday(year, month);
  const days = daysInMonth(year, month);

  return (
    <div style={{ padding: 20 }}>
      <h1>{MONTHS[month]} {year}</h1>
      <button onClick={() => setMonth(m => m - 1)} disabled={month === 0}>◀</button>
      <button onClick={() => setMonth(m => m + 1)} disabled={month === 11}>▶</button>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginTop: 10 }}>
        {WEEKDAYS.map(d => <b key={d}>{d}</b>)}
        {[...Array(blanks)].map((_, i) => <div key={"b" + i} />)}

        {[...Array(days)].map((_, i) => {
          const day = i + 1;
          const key = dateKey(year, month, day);
          const list = entries[key] || [];
          const allSix = USERS.every(u => list.some(e => e.color === u.color));

          return (
            <div
              key={day}
              onClick={() => openDay(day)}
              style={{
                border: "1px solid #999",
                padding: 5,
                background: allSix ? "#9f9" : "transparent",
                cursor: "pointer"
              }}
            >
              <div>{day}</div>
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                {list.map((e, idx) => (
                  <div
                    key={idx}
                    style={{
                      width: 10,
                      height: 10,
                      margin: 1,
                      borderRadius: "50%",
                      background: e.answer === "Csak ha nagyon muszáj" ? "transparent" : e.color,
                      border: `2px solid ${e.color}`,
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selectedDay && (
        <div style={{ marginTop: 20 }}>
          <h3>{selectedDay}. {MONTHS[month]}</h3>

          <select value={form.availability}
            onChange={e => setForm({ ...form, availability: e.target.value })}>
            <option>Egész nap</option>
            <option>Délután</option>
            <option>Egyéni idő</option>
          </select>

          <select value={form.answer}
            onChange={e => setForm({ ...form, answer: e.target.value })}>
            <option>Igen</option>
            <option>Csak ha nagyon muszáj</option>
          </select>

          <br /><br />
          <button onClick={saveDay}>Mentés</button>
          <button onClick={deleteDay}>Törlés</button>
          <button onClick={() => setSelectedDay(null)}>Mégse</button>
        </div>
      )}
    </div>
  );
}
