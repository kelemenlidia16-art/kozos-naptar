import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

/* ===== FIREBASE ===== */
const firebaseConfig = {
  apiKey: "AIzaSyAxaQKdai1nV7coNTkXwnWF6vlXXUlk4aE",
  authDomain: "database-7ce1b.firebaseapp.com",
  projectId: "database-7ce1b",
};

const db = getFirestore(initializeApp(firebaseConfig));

/* ===== USERS ===== */
const USERS = [
  { name: "Habo", color: "green" },
  { name: "Puszta", color: "purple" },
  { name: "Jankisz", color: "yellow" },
  { name: "Lidi", color: "orange" },
  { name: "Sho", color: "red" },
  { name: "Dorka", color: "blue" },
];

const WEEKDAYS = ["H", "K", "Sz", "Cs", "P", "Sz", "V"];
const MONTHS = [
  "Január","Február","Március","Április","Május","Június",
  "Július","Augusztus","Szeptember","Október","November","December"
];

/* ===== HELPERS ===== */
const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const firstDayOffset = (y, m) => (new Date(y, m, 1).getDay() + 6) % 7;
const dateKey = (y, m, d) => `${y}-${m + 1}-${d}`;

/* ===== APP ===== */
export default function App() {
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState({});
  const [current, setCurrent] = useState(new Date(2026, 0, 1));
  const [selectedDay, setSelectedDay] = useState(null);

  const [form, setForm] = useState({
    answer: "Igen",
    customTime: "",
  });

  /* LOAD */
  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, "calendar", "shared"));
      if (snap.exists()) setEntries(snap.data());
    })();
  }, []);

  /* SAVE CLOUD */
  const saveCloud = async (data) => {
    await setDoc(doc(db, "calendar", "shared"), data);
  };

  /* LOGIN */
  if (!user) {
    return (
      <div style={login}>
        <h2>Ki vagy?</h2>
        {USERS.map(u => (
          <button
            key={u.name}
            onClick={() => setUser(u)}
            style={{ ...userBtn, borderColor: u.color, color: u.color }}
          >
            ● {u.name}
          </button>
        ))}
      </div>
    );
  }

  /* SAVE DAY */
  const saveDay = () => {
    const key = dateKey(
      current.getFullYear(),
      current.getMonth(),
      selectedDay
    );

    const dayData = entries[key] || [];
    const withoutMe = dayData.filter(e => e.name !== user.name);

    const updated = [
      ...withoutMe,
      {
        name: user.name,
        color: user.color,
        answer: form.answer,
        customTime: form.customTime
      }
    ];

    const newEntries = { ...entries, [key]: updated };
    setEntries(newEntries);
    saveCloud(newEntries);
    setSelectedDay(null);
  };

  /* DELETE */
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

  /* CALENDAR */
  const y = current.getFullYear();
  const m = current.getMonth();
  const days = daysInMonth(y, m);
  const offset = firstDayOffset(y, m);

  const selectedKey = selectedDay
    ? dateKey(y, m, selectedDay)
    : null;

  const selectedEntries = selectedKey ? entries[selectedKey] || [] : [];

  return (
    <div style={initializeApp(firebaseConfig)}>
      <div style={header}>
        <button onClick={() => setCurrent(new Date(y, m - 1, 1))}>◀</button>
        <h2>{MONTHS[m]} {y}</h2>
        <button onClick={() => setCurrent(new Date(y, m + 1, 1))}>▶</button>
      </div>

      <div style={grid}>
        {WEEKDAYS.map(d => <div key={d} style={weekday}>{d}</div>)}
        {Array(offset).fill(0).map((_,i)=><div key={i} />)}

        {Array(days).fill(0).map((_,i)=>{
          const d = i+1;
          const key = dateKey(y,m,d);
          const dayEntries = entries[key] || [];

          return (
            <div
              key={d}
              style={day}
              onClick={() => {
                setSelectedDay(d);
                const mine = dayEntries.find(e => e.name === user.name);
                setForm(
                  mine || { answer: "Igen", customTime: "" }
                );
              }}
            >
              <strong>{d}</strong>
              <div style={{ display:"flex", flexWrap:"wrap" }}>
                {dayEntries.map((e,idx)=>(
                  <div
                    key={idx}
                    style={{
                      width:10,
                      height:10,
                      borderRadius:"50%",
                      margin:1,
                      background:
                        e.answer === "Igen" ? e.color : "transparent",
                      border:`2px solid ${e.color}`
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAILS */}
      {selectedDay && (
        <div style={modal}>
          <h3>{MONTHS[m]} {selectedDay}</h3>

          <h4>Válaszok:</h4>
          {selectedEntries.map((e,idx)=>(
            <div
              key={idx}
              style={{
                border:`2px solid ${e.color}`,
                padding:5,
                marginBottom:5
              }}
            >
              <strong>{e.name}</strong> – {e.answer}
              {e.customTime && ` (${e.customTime} órától)`}
            </div>
          ))}

          <hr />

          <h4>Saját válasz</h4>

          <select
            value={form.answer}
            onChange={e=>setForm({...form,answer:e.target.value})}
          >
            <option>Igen</option>
            <option>Csak ha nagyon muszáj</option>
          </select>

          <div>
            <button onClick={() => setForm({...form,customTime:""})}>
              Más időben →
            </button>
            <input
              type="number"
              placeholder="órától"
              value={form.customTime}
              onChange={e=>setForm({...form,customTime:e.target.value})}
            />
          </div>

          <div>
            <button onClick={saveDay}>Mentés</button>
            <button onClick={deleteMy}>Törlés</button>
            <button onClick={()=>setSelectedDay(null)}>Bezár</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== STYLES ===== */
const app = { minHeight:"100vh", padding:10 };
const header = { display:"flex", justifyContent:"space-between" };
const grid = { display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4 };
const weekday = { textAlign:"center", fontSize:12 };
const day = {
  minHeight:60,
  border:"1px solid #ccc",
  padding:4,
  cursor:"pointer"
};
const modal = {
  position:"fixed",
  bottom:0,
  left:0,
  right:0,
  background:"#fff",
  padding:10,
  maxHeight:"60vh",
  overflow:"auto"
};
const login = {
  minHeight:"100vh",
  display:"flex",
  flexDirection:"column",
  justifyContent:"center",
  alignItems:"center"
};
const userBtn = {
  background:"transparent",
  border:"2px solid",
  padding:10,
  margin:5,
  cursor:"pointer"
};
