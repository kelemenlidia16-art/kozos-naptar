import { useState, useEffect } from "react";

const USERS = {
  green: "Habo",
  purple: "Puszta",
  yellow: "Jankisz",
  orange: "Lidi",
  red: "Sho",
  blue: "Dorka"
};

const MONTHS = [
  "Január","Február","Március","Április","Május","Június",
  "Július","Augusztus","Szeptember","Október","November","December"
];

const DAYS = ["H", "K", "Sze", "Cs", "P", "Szo", "V"];

export default function App() {
  const [color, setColor] = useState(localStorage.getItem("userColor"));
  const [month, setMonth] = useState(0);
  const [year] = useState(2026);
  const [selectedDay, setSelectedDay] = useState(null);
  const [data, setData] = useState(
    JSON.parse(localStorage.getItem("calendarData") || "{}")
  );
  const [text, setText] = useState("");

  useEffect(() => {
    localStorage.setItem("calendarData", JSON.stringify(data));
  }, [data]);

  if (!color) {
    const usedColors = Object.keys(data);

    return (
      <div style={loginStyle}>
        <h2>Válaszd ki magad</h2>

        {Object.entries(USERS).map(([c, name]) => (
          <button
            key={c}
            onClick={()=>{
              setColor(c);
              localStorage.setItem("userColor", c);
            }}
            style={{
              margin:5,
              padding:10,
              textDecoration: usedColors.includes(c) ? "line-through" : "none"
            }}
          >
            🟢 {name}
          </button>
        ))}

        <br />

        <button
          style={{marginTop:20}}
          onClick={()=>{
            localStorage.clear();
            window.location.reload();
          }}
        >
          🔄 Minden adat törlése
        </button>
      </div>
    );
  }

  const daysInMonth = new Date(year, month+1, 0).getDate();

  const saveAnswer = () => {
    const key = `${year}-${month}-${selectedDay}`;
    setData({
      ...data,
      [key]: { color, text }
    });
    setText("");
  };

  const deleteAnswer = () => {
    const key = `${year}-${month}-${selectedDay}`;
    const copy = {...data};
    delete copy[key];
    setData(copy);
  };

  return (
    <div style={wrapperStyle}>
      <h1>{MONTHS[month]} {year}</h1>

      <div>
        <button onClick={()=>setMonth((month+11)%12)}>◀</button>
        <button onClick={()=>setMonth((month+1)%12)}>▶</button>
      </div>

      <div style={dayHeader}>
        {DAYS.map(d=>(
          <div key={d} style={{fontSize:12}}>{d}</div>
        ))}
      </div>

      <div style={calendarGrid}>
        {[...Array(daysInMonth)].map((_,i)=>{
          const d = i+1;
          const key = `${year}-${month}-${d}`;
          return (
            <div
              key={d}
              onClick={()=>setSelectedDay(d)}
              style={dayCell}
            >
              {d}
              {data[key] && (
                <div
                  style={{
                    width:10,
                    height:10,
                    borderRadius:"50%",
                    background:data[key].color,
                    margin:"auto"
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {selectedDay && (
        <div style={modal}>
          <h3>{year}.{month+1}.{selectedDay}</h3>

          <textarea
            value={text}
            onChange={e=>setText(e.target.value)}
            placeholder="Saját válasz"
          />

          <br />

          <button onClick={saveAnswer}>💾 Mentés</button>
          <button onClick={deleteAnswer}>🗑 Törlés</button>

          <br />
          <button onClick={()=>setSelectedDay(null)}>❌ Bezár</button>
        </div>
      )}
    </div>
  );
}

const wrapperStyle = {
  minHeight:"100vh",
  backgroundImage:"url('/assets/hatter.jpg')",
  backgroundSize:"cover",
  padding:20,
  backgroundColor:"rgba(255,255,255,0.85)"
};

const calendarGrid = {
  display:"grid",
  gridTemplateColumns:"repeat(7,1fr)",
  gap:5
};

const dayCell = {
  border:"1px solid #333",
  padding:5,
  cursor:"pointer",
  background:"rgba(255,255,255,0.7)"
};

const modal = {
  position:"fixed",
  top:"20%",
  left:"50%",
  transform:"translateX(-50%)",
  background:"#fff",
  padding:20,
  border:"2px solid #333",
  zIndex:10
};

const dayHeader = {
  display:"grid",
  gridTemplateColumns:"repeat(7,1fr)",
  marginBottom:5
};

const loginStyle = {
  minHeight:"100vh",
  display:"flex",
  flexDirection:"column",
  justifyContent:"center",
  alignItems:"center"
};
