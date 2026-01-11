import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

/* ===== FIREBASE ===== */
const firebaseConfig = {
  apiKey: "AIzaSyAxaQKdai1nV7coNTkXwnWF6vlXXUlk4aE",
  authDomain: "database-7ce1b.firebaseapp.com",
  projectId: "database-7ce1b",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ===== SZÍNEK / NEVEK ===== */
const USERS = [
  { color: "green", name: "Habo" },
  { color: "purple", name: "Puszta" },
  { color: "yellow", name: "Jankisz" },
  { color: "orange", name: "Lidi" },
  { color: "red", name: "Sho" },
  { color: "blue", name: "Dorka" },
];

const monthNames = [
  "Január","Február","Március","Április","Május","Június",
  "Július","Augusztus","Szeptember","Október","November","December"
];

const weekDays = ["H", "K", "Sze", "Cs", "P", "Szo", "V"];

export default function App() {
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));
  const [selectedDay, setSelectedDay] = useState(null);
  const [customTime, setCustomTime] = useState("");

  /* ===== FIREBASE LOAD ===== */
  useEffect(() => {
    async function load() {
      const ref = doc(db, "calendar", "shared");
      const snap = await getDoc(ref);
      if (snap.exists()) setEntries(snap.data());
    }
    load();
  }, []);

  async function saveCloud(data) {
    await setDoc(doc(db, "calendar", "shared"), data);
  }

  /* ===== DATE HELPERS ===== */
  function formatKey(y, m, d) {
    return `${y}-${m + 1}-${d}`;
  }

  function daysInMonth(y, m) {
    return new Date(y, m + 1, 0).getDate();
  }

  const firstDayOffset =
    (new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() + 6) % 7;

  /* ===== SAVE ANSWER ===== */
  function saveAnswer(type) {
    const key = formatKey(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      selectedDay
    );

    const list = entries[key] || [];
    const filtered = list.filter((e) => e.color !== user.color);

    filtered.push({
      name: user.name,
      color: user.color,
      type,
      time: type === "custom" ? customTime : null,
    });

    const updated = { ...entries, [key]: filtered };
    setEntries(updated);
    saveCloud(updated);
    setSelectedDay(null);
    setCustomTime("");
  }

  function deleteOwn() {
    const key = formatKey(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      selectedDay
    );
    const filtered = (entries[key] || []).filter(
      (e) => e.color !== user.color
    );
    const updated = { ...entries, [key]: filtered };
    setEntries(updated);
    saveCloud(updated);
    setSelectedDay(null);
  }

  /* ===== LOGIN ===== */
  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Válaszd ki magad</h2>
        {USERS.map((u) => (
          <button
            key={u.color}
            onClick={() => setUser(u)}
            style={{
              margin: 5,
              padding: 10,
              border: `3px solid ${u.color}`,
              background: "white",
              cursor: "pointer",
            }}
          >
            ● {u.name}
          </button>
        ))}
      </div>
    );
  }

  /* ===== RENDER ===== */
  return (
    <div style={{ padding: 10 }}>
      <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>

      <button onClick={() => setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
      )}>◀</button>

      <button onClick={() => setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
      )}>▶</button>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        marginTop: 10
      }}>
        {weekDays.map(d => <div key={d} style={{fontSize:12,textAlign:"center"}}>{d}</div>)}
        {Array(firstDayOffset).fill(null).map((_,i)=><div key={i}></div>)}

        {Array.from({ length: daysInMonth(currentDate.getFullYear(), currentDate.getMonth()) }, (_, i) => {
          const day = i + 1;
          const key = formatKey(currentDate.getFullYear(), currentDate.getMonth(), day);
          const list = entries[key] || [];

          return (
            <div
              key={day}
              onClick={() => setSelectedDay(day)}
              style={{
                border: "1px solid #ccc",
                minHeight: 60,
                padding: 3,
                cursor: "pointer",
              }}
            >
              <strong>{day}</strong>
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                {list.map((e, idx) => (
                  <div
                    key={idx}
                    title={e.name}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      margin: 2,
                      background: e.type === "maybe" ? "transparent" : e.color,
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
        <div style={{ marginTop: 20, border: "2px solid black", padding: 10 }}>
          <h3>{selectedDay}. nap válaszai</h3>

          {(entries[formatKey(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            selectedDay
          )] || []).map((e, i) => (
            <div key={i} style={{ marginBottom: 4 }}>
              <span style={{ color: e.color, fontWeight: "bold" }}>
                {e.name}
              </span>{" "}
              – {e.type === "yes" && "Igen"}
              {e.type === "maybe" && "Csak ha nagyon muszáj"}
              {e.type === "custom" && ` ${e.time} órától`}
            </div>
          ))}

          <hr />

          <button onClick={() => saveAnswer("yes")}>Igen</button>
          <button onClick={() => saveAnswer("maybe")}>Csak ha nagyon muszáj</button>

          <div style={{ marginTop: 5 }}>
            <button onClick={() => saveAnswer("custom")}>Más időben →</button>
            <input
              type="number"
              placeholder="óra"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              style={{ marginLeft: 5, width: 60 }}
            />
          </div>

          <button onClick={deleteOwn} style={{ marginTop: 5 }}>
            Saját válasz törlése
          </button>

          <button onClick={() => setSelectedDay(null)}>Bezár</button>
        </div>
      )}
    </div>
  );
}
