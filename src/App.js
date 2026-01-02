import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";

/* ================= FIREBASE ================= */
const firebaseConfig = {
  apiKey: "AIzaSyAxaQKdai1nV7coNTkXwnWF6vlXXUlk4aE",
  authDomain: "database-7ce1b.firebaseapp.com",
  projectId: "database-7ce1b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ================= CONSTANTS ================= */
const USERS = [
  { name: "Habo", color: "green" },
  { name: "Puszta", color: "purple" },
  { name: "Jankisz", color: "yellow" },
  { name: "Lidi", color: "orange" },
  { name: "Sho", color: "red" },
  { name: "Dorka", color: "blue" }
];

const WEEKDAYS = ["H", "K", "Sz", "Cs", "P", "Sz", "V"];
const MONTHS = [
  "Január","Február","Március","Április","Május","Június",
  "Július","Augusztus","Szeptember","Október","November","December"
];

/* ================= HELPERS ================= */
const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const firstDayOffset = (y, m) => (new Date(y, m, 1).getDay() + 6) % 7;
const dateKey = (y, m, d) => `${y}-${m + 1}-${d}`;

/* ================= APP ================= */
export default function App() {
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState({});
  const [current, setCurrent] = useState(new Date(2026, 0, 1));
  const [selectedDay, setSelectedDay] = useState(null);
  const [form, setForm] = useState({
    answer: "Igen",
    time: ""
  });

  /* ===== LOAD ===== */
  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, "calendar", "shared"));
      if (snap.exists()) setEntries(snap.data());
    })();
  }, []);

  /* ===== SAVE ===== */
  const saveCloud = async (data) => {
    await setDoc(doc(db, "calendar", "shared"), data);
  };

  /* ===== LOGIN ===== */
  if (!user) {
    return (
      <div style={loginStyle}>
        <h2>Válaszd ki ki vagy</h2>
        {USERS.map(u => (
          <button
            key={u.name}
            onClick={() => setUser(u)}
            style={{
              ...userBtn,
              borderColor: u.color,
              color: u.color
            }}
          >
            ● {u.name}
          </button>
        ))}
      </div>
    );
  }

  /* ===== DAY SAVE ===== */
  const saveDay = () => {
    const key = dateKey(
      current.getFullYear(),
      current.getMonth(),
      selectedDay
    );

    const dayData = entries[key] || [];
    const filtered = dayData.filter(e => e.name !== user.name);

    const updated = [
      ...filtered,
      { ...form, name: user.name, color: user.color }
    ];

    const newEntries = { ...entries, [key]: updated };
    setEntries(newEntries);
    saveCloud(newEntries);
    setSelectedDay(null);
  };

  /* ===== DELETE ===== */
  const deleteMy = () => {
    const key = dateKey(
      current.getFullYear(),
      current.getMonth(),
      selectedDay
    );
    const filtered = (entries[key] || []).filter(e => e.name !== user.name);
    const newEntries = { ...entries, [key]: filtered };
    setEntries(newEntries);
    saveCloud(newEntries);
    setSelectedDay(null);
  };

  /* ===== CALENDAR GRID ===== */
  const y = current.getFullYear();
  const m = current.getMonth();
  const days = daysInMonth(y, m);
  const offset = firstDayOffset(y, m);

  return (
    <div style={appStyle}>
      <div style={header}>
        <button onClick={() => setCurrent(new Date(y, m - 1, 1))}>◀</button>
        <h2>{MONTHS[m]} {y}</h2>
        <button onClick={() => setCurrent(new Date(y, m + 1, 1))}>▶</button>
      </div>

      <div style={grid}>
        {WEEKDAYS.map(d => <div key={d} style={weekday}>{d}</div>)}
        {Array(offset).fill(0).map((_,i)=><div key={"e"+i}/>)}
        {Array(days).fill(0).map((_,i)=>{
          const d = i+1;
          const key = dateKey(y,m,d);
          const dayEntries = entries[key] || [];
          const all = USERS.every(u => dayEntries.some(e=>e.color===u.color));

          return (
            <div
              key={d}
              style={{
                ...dayCell,
                background: all ? "#2ecc71" : "rgba(0,0,0,.4)"
              }}
              onClick={()=>setSelectedDay(d)}
            >
              <div>{d}</div>
              <div style={dots}>
                {dayEntries.map((e,idx)=>(
                  <div
                    key={idx}
                    style={{
                      ...dot,
                      background: e.answer==="Igen"?e.color:"transparent",
                      border: `2px solid ${e.color}`
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selectedDay && (
        <div style={modal}>
          <h3>{MONTHS[m]} {selectedDay}</h3>

          <select
            value={form.answer}
            onChange={e=>setForm({...form,answer:e.target.value})}
          >
            <option>Igen</option>
            <option>Csak ha nagyon muszáj</option>
          </select>

          <button
            onClick={()=>setForm({...form,time:""})}
          >
            Más időben →
          </button>

          {form.time !== null && (
            <input
              type="number"
              placeholder="órától"
              value={form.time}
              onChange={e=>setForm({...form,time:e.target.value})}
            />
          )}

          <div>
            <button onClick={saveDay}>Mentés</button>
            <button onClick={deleteMy}>Törlés</button>
            <button onClick={()=>setSelectedDay(null)}>Mégse</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= STYLES ================= */
const appStyle = {
  minHeight: "100vh",
  background: "url(/assets/hatter.jpg) center/cover",
  color: "white",
  padding: 10
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(7,1fr)",
  gap: 5
};

const weekday = { textAlign: "center", fontSize: 12 };
const dayCell = {
  minHeight: 60,
  padding: 5,
  borderRadius: 6,
  cursor: "pointer"
};
const dots = { display: "flex", flexWrap: "wrap" };
const dot = { width: 10, height: 10, borderRadius: "50%", margin: 1 };

const modal = {
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  background: "#111",
  padding: 10
};

const loginStyle = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center"
};

const userBtn = {
  background: "transparent",
  border: "2px solid",
  padding: 10,
  margin: 5,
  cursor: "pointer"
};
