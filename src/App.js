import { useState, useEffect } from "react";

/* ===== KONFIG ===== */
const COLORS = ["green","purple","yellow","orange","red","blue"];
const COLOR_NAMES = {
  green: "Habo",
  purple: "Puszta",
  yellow: "Jankisz",
  orange: "Lidi",
  red: "Sho",
  blue: "Dorka"
};
const WEEKDAYS = ["H","K","Sze","Cs","P","Szo","V"];

/* ===== APP ===== */
export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date(2026,0,1));
  const [entries, setEntries] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);

  const [userColor, setUserColor] = useState(
    localStorage.getItem("userColor")
  );

  /* === Dice / Dragon === */
  const [rolling,setRolling] = useState(false);
  const [diceResult,setDiceResult] = useState(null);
  const [showDice,setShowDice] = useState(true);
  const [eatDice,setEatDice] = useState(false);

  function rollDice(){
    if(rolling) return;
    setRolling(true);
    setDiceResult(null);
    setEatDice(false);
    setShowDice(true);

    setTimeout(()=>setEatDice(true),800);
    setTimeout(()=>setShowDice(false),1200);
    setTimeout(()=>{
      setDiceResult(Math.floor(Math.random()*20)+1);
    },1600);
    setTimeout(()=>{
      setShowDice(true);
      setEatDice(false);
      setRolling(false);
    },3600);
  }

  function daysInMonth(y,m){
    return new Date(y,m+1,0).getDate();
  }

  function keyOf(d){
    return `${currentDate.getFullYear()}-${currentDate.getMonth()+1}-${d}`;
  }

  function saveAnswer(day,answer){
    const key = keyOf(day);
    setEntries(prev=>{
      const arr = prev[key]||[];
      const filtered = arr.filter(a=>a.color!==userColor);
      return {...prev,[key]:[...filtered,answer]};
    });
  }

  function deleteAnswer(day){
    const key = keyOf(day);
    setEntries(prev=>{
      const arr = (prev[key]||[]).filter(a=>a.color!==userColor);
      return {...prev,[key]:arr};
    });
  }

  if(!userColor){
    return (
      <div style={{padding:30}}>
        <h2>Válaszd ki magad</h2>
        {COLORS.map(c=>(
          <button
            key={c}
            onClick={()=>{
              localStorage.setItem("userColor",c);
              setUserColor(c);
            }}
            style={{
              background:c,
              margin:5,
              padding:"10px 20px",
              textDecoration:
                localStorage.getItem("userColor")===c?"line-through":"none",
              opacity:
                localStorage.getItem("userColor")===c?0.6:1
            }}
          >
            ● {COLOR_NAMES[c]}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div style={{
      minHeight:"100vh",
      backgroundImage:"url('/assets/hatter.jpg')",
      backgroundSize:"cover",
      padding:20
    }}>

      <h1>Közös naptár</h1>

      {/* ===== NAV ===== */}
      <button onClick={()=>setCurrentDate(
        new Date(currentDate.getFullYear(),currentDate.getMonth()-1,1)
      )}>◀</button>
      <b style={{margin:"0 10px"}}>
        {currentDate.getFullYear()} / {currentDate.getMonth()+1}
      </b>
      <button onClick={()=>setCurrentDate(
        new Date(currentDate.getFullYear(),currentDate.getMonth()+1,1)
      )}>▶</button>

      {/* ===== WEEKDAYS ===== */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(7,1fr)",
        marginTop:10
      }}>
        {WEEKDAYS.map(d=>(
          <div key={d} style={{fontSize:12,textAlign:"center"}}>{d}</div>
        ))}
      </div>

      {/* ===== CALENDAR ===== */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(7,1fr)",
        gap:5
      }}>
        {Array.from(
          {length:daysInMonth(currentDate.getFullYear(),currentDate.getMonth())},
          (_,i)=>i+1
        ).map(day=>{
          const arr = entries[keyOf(day)]||[];
          const allUsed = COLORS.every(c=>arr.some(a=>a.color===c));
          return (
            <div key={day}
              onClick={()=>setSelectedDay(day)}
              style={{
                border:"1px solid #333",
                padding:5,
                cursor:"pointer"
              }}>
              <div style={{color:allUsed?"green":"black"}}>
                {day}
              </div>
              <div style={{display:"flex",flexWrap:"wrap"}}>
                {arr.map((a,i)=>(
                  <div key={i} style={{
                    width:10,height:10,
                    borderRadius:"50%",
                    margin:1,
                    border:a.answer==="muszaj"
                      ?`2px solid ${a.color}`:"none",
                    background:
                      a.answer==="muszaj"?"transparent":a.color
                  }} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ===== MODAL ===== */}
      {selectedDay && (
        <div style={{background:"#fff",padding:10,marginTop:20}}>
          <h3>{selectedDay}. nap válaszai</h3>

          {(entries[keyOf(selectedDay)]||[]).map((a,i)=>(
            <div key={i}>
              {COLOR_NAMES[a.color]} – {a.answer}
            </div>
          ))}

          <button onClick={()=>saveAnswer(selectedDay,{
            color:userColor,
            answer:"igen"
          })}>Igen</button>

          <button onClick={()=>saveAnswer(selectedDay,{
            color:userColor,
            answer:"muszaj"
          })}>Csak ha nagyon muszáj</button>

          <button onClick={()=>deleteAnswer(selectedDay)}>Törlés</button>
          <button onClick={()=>setSelectedDay(null)}>Bezár</button>
        </div>
      )}

      {/* ===== DICE ===== */}
      {showDice && (
        <img
          src="/assets/dice.png"
          alt="dice"
          onClick={rollDice}
          style={{
            width:80,
            position:"fixed",
            bottom:20,
            right:20,
            cursor:"pointer"
          }}
        />
      )}

      {diceResult && (
        <div style={{
          position:"fixed",
          bottom:120,
          right:40,
          fontSize:24
        }}>
          🎲 {diceResult}
        </div>
      )}

      {eatDice && (
        <img
          src="/assets/dragon.png"
          alt="dragon"
          style={{
            width:200,
            position:"fixed",
            bottom:20,
            right:20
          }}
        />
      )}
    </div>
  );
}
