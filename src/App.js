import { useState, useEffect } from "react";
import "./App.css";

const USERS = {
  green: "Habo",
  purple: "Puszta",
  yellow: "Jankisz",
  orange: "Lidi",
  red: "Sho",
  blue: "Dorka"
};

const MONTHS = ["Január","Február","Március","Április","Május","Június",
"Július","Augusztus","Szeptember","Október","November","December"];

const DAYS = ["H","K","Sze","Cs","P","Szo","V"];

export default function App() {
  const [userColor, setUserColor] = useState(localStorage.getItem("color"));
  const [calendar, setCalendar] = useState(
    JSON.parse(localStorage.getItem("calendar") || "{}")
  );
  const [month, setMonth] = useState(0);
  const [year] = useState(2026);
  const [selectedDay, setSelectedDay] = useState(null);
  const [text, setText] = useState("");
  const [dice, setDice] = useState(null);

  useEffect(() => {
    localStorage.setItem("calendar", JSON.stringify(calendar));
  }, [calendar]);

  /* LOGIN */
  if (!userColor) {
    return (
      <div className="login">
        <h2>Ki vagy?</h2>
        {Object.entries(USERS).map(([c,name])=>(
          <button key={c} onClick={()=>{
            setUserColor(c);
            localStorage.setItem("color",c);
          }}>
            {name}
          </button>
        ))}
        <button className="danger" onClick={()=>{
          localStorage.clear();
          location.reload();
        }}>
          🔥 MINDEN TÖRLÉSE
        </button>
      </div>
    );
  }

  const daysInMonth = new Date(year, month+1, 0).getDate();

  const save = () => {
    const key = `${year}-${month}-${selectedDay}`;
    const entry = {
      user: USERS[userColor],
      color: userColor,
      text
    };
    setCalendar({
      ...calendar,
      [key]: [...(calendar[key] || []), entry]
    });
    setText("");
  };

  const rollDice = () => {
    const r = Math.floor(Math.random()*6)+1;
    setDice(r);
    setTimeout(()=>setDice(null), 3000);
  };

  return (
    <div className="app">
      <h1>{MONTHS[month]} {year}</h1>

      <div className="nav">
        <button onClick={()=>setMonth((month+11)%12)}>◀</button>
        <button onClick={()=>setMonth((month+1)%12)}>▶</button>
      </div>

      <div className="days">
        {DAYS.map(d=><div key={d}>{d}</div>)}
      </div>

      <div className="grid">
        {[...Array(daysInMonth)].map((_,i)=>{
          const d=i+1;
          const key=`${year}-${month}-${d}`;
          return (
            <div key={d} className="cell" onClick={()=>setSelectedDay(d)}>
              {d}
              {(calendar[key]||[]).map((e,idx)=>(
                <span key={idx} className="dot" style={{background:e.color}} />
              ))}
            </div>
          );
        })}
      </div>

      {selectedDay && (
        <div className="modal">
          <h3>{year}.{month+1}.{selectedDay}</h3>

          {(calendar[`${year}-${month}-${selectedDay}`]||[]).map((e,i)=>(
            <div key={i} className="entry">
              <b style={{color:e.color}}>{e.user}</b>: {e.text}
            </div>
          ))}

          <textarea
            value={text}
            onChange={e=>setText(e.target.value)}
            placeholder="Írj valamit..."
          />

          <button onClick={save}>Mentés</button>
          <button onClick={rollDice}>🎲 Dobás</button>
          <button onClick={()=>setSelectedDay(null)}>Bezár</button>
        </div>
      )}

      {dice && (
        <div className="dice">
          🎲 {dice}
        </div>
      )}
    </div>
  );
}
