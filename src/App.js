import { useEffect, useState } from "react";
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

/* ===== USERS ===== */
const USERS = [
  { name: "Habo", color: "green" },
  { name: "Puszta", color: "purple" },
  { name: "Jankisz", color: "gold" },
  { name: "Lidi", color: "orange" },
  { name: "Sho", color: "red" },
  { name: "Dorka", color: "blue" },
];

const WEEKDAYS = ["H", "K", "Sz", "Cs", "P", "Sz", "V"];
const MONTHS = [
  "Január","Február","Március","Április","Május","Június",
  "Július","Augusztus","Szeptember","Október","November","December"
];

const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const firstOffset = (y, m) => (new Date(y, m, 1).getDay() + 6) % 7;
const keyFor = (y, m, d) => `${y}-${m+1}-${d}`;

/* ===== APP ===== */
export default function App() {
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState({});
  const [date, setDate] = useState(new Date(2026, 0, 1));
  const [selectedDay, setSelectedDay] = useState(null);
  const [form, setForm] = useState({ answer: "Igen", time: "" });

  /* LOAD */
  useEffect(() => {
    getDoc(doc(db, "calendar", "shared")).then(snap => {
      if (snap.exists()) setEntries(snap.data());
    });
  }, []);

  const saveCloud = (data) =>
    setDoc(doc(db, "calendar", "shared"), data);

  /* LOGIN */
  if (!user) {
    return (
      <div style={login}>
        <h2>Válaszd ki magad</h2>
        {USERS.map(u => (
          <button
            key={u.name}
            onClick={() => setUser(u)}
            style={{ ...btn, borderColor: u.color, color: u.color }}
          >
            ● {u.name}
          </button>
        ))}
      </div>
    );
  }

  const y = date.getFullYear();
  const m = date.getMonth();
  const days = daysInMonth(y, m);
  const offset = firstOffset(y, m);

  const saveDay = () => {
    const key = keyFor(y, m, selectedDay);
    const prev = entries[key] || [];
    const filtered = prev.filter(e => e.name !== user.name);

    const updated = [
      ...filtered,
      { name: user.name, color: user.color, ...form }
    ];

    const all = { ...entries, [key]: updated };
    setEntries(all);
    saveCloud(all);
    setSelectedDay(null);
  };

  const deleteMine = () => {
    const key = keyFor(y, m, selectedDay);
    const filtered = (entries[key] || []).filter(e => e.name !== user.name);
    const all = { ...entries, [key]: filtered };
    setEntries(all);
    saveCloud(all);
    setSelectedDay(null);
  };

  return (
    <div style={{ padding: 10 }}>
      <div style={header}>
        <button onClick={() => setDate(new Date(y, m-1, 1))}>◀</button>
        <h2>{MONTHS[m]} {y}</h2>
        <button onClick={() => setDate(new Date(y, m+1, 1))}>▶</button>
      </div>

      <div style={grid}>
        {WEEKDAYS.map(d => <div key={d} style={weekday}>{d}</div>)}
        {Array(offset).fill(0).map((_,i)=><div key={i} />)}

        {Array(days).fill(0).map((_,i)=>{
          const d = i+1;
          const key = keyFor(y,m,d);
          const dayEntries = entries[key] || [];

          return (
            <div key={d} style={day} onClick={()=>{
              setSelectedDay(d);
              const mine = dayEntries.find(e=>e.name===user.name);
              setForm(mine || { answer:"Igen", time:"" });
            }}>
              <strong>{d}</strong>
              <div style={{ display:"flex", flexWrap:"wrap" }}>
                {dayEntries.map((e,idx)=>(
                  <div key={idx} style={{
                    width:10,height:10,borderRadius:"50%",
                    margin:1,
                    border:`2px solid ${e.color}`,
                    background:e.answer==="Igen"?e.color:"transparent"
                  }} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selectedDay && (
        <div style={modal}>
          <h3>{MONTHS[m]} {selectedDay}</h3>

          {(entries[keyFor(y,m,selectedDay)]||[]).map((e,idx)=>(
            <div key={idx} style={{
              border:`2px solid ${e.color}`,
              padding:4, marginBottom:4
            }}>
              <strong>{e.name}</strong> – {e.answer}
              {e.time && ` (${e.time}:00-tól)`}
            </div>
          ))}

          <select value={form.answer}
            onChange={e=>setForm({...form,answer:e.target.value})}>
            <option>Igen</option>
            <option>Csak ha nagyon muszáj</option>
          </select>

          <input
            type="number"
            placeholder="órától"
            value={form.time}
            onChange={e=>setForm({...form,time:e.target.value})}
          />

          <div>
            <button onClick={saveDay}>Mentés</button>
            <button onClick={deleteMine}>Törlés</button>
            <button onClick={()=>setSelectedDay(null)}>Bezár</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== STYLES ===== */
const grid = { display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4 };
const day = { border:"1px solid #ccc", minHeight:60, padding:4 };
const weekday = { textAlign:"center", fontSize:12 };
const header = { display:"flex", justifyContent:"space-between" };
const modal = {
  position:"fixed", bottom:0, left:0, right:0,
  background:"#fff", padding:10, maxHeight:"60vh", overflow:"auto"
};
const login = {
  minHeight:"100vh", display:"flex",
  flexDirection:"column", alignItems:"center", justifyContent:"center"
};
const btn = { background:"none", border:"2px solid", padding:10, margin:5 };
