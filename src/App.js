import { useState } from "react";
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

/* ================= APP ================= */
export default function App() {
  const COLORS = ["red","blue","green","yellow","purple","orange"];

  const [entries, setEntries] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [diceRolling, setDiceRolling] = useState(false);
  const [diceGone, setDiceGone] = useState(false);

  const [form, setForm] = useState({
    availability:"Egész nap",
    answer:"Igen",
    color:"red"
  });

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const daysInMonth = (y,m)=>new Date(y,m+1,0).getDate();
  const dateKey = (y,m,d)=>`${y}-${m+1}-${d}`;

  /* ===== CLOUD ===== */
  async function loadCloud(){
    const ref = doc(db,"calendar","shared");
    const snap = await getDoc(ref);
    if(snap.exists()) setEntries(snap.data().entries||{});
  }

  async function saveCloud(){
    const ref = doc(db,"calendar","shared");
    await setDoc(ref,{entries});
    alert("Mentve – mindenki látja");
  }

  /* ===== DAY ===== */
  function openDay(day){
    setSelectedDay(day);
    setShowForm(false);
  }

  function addOwnAnswer(){
    setShowForm(true);
    setForm({availability:"Egész nap",answer:"Igen",color:"red"});
  }

  function saveAnswer(){
    const key = dateKey(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      selectedDay
    );
    const copy = {...entries};
    if(!copy[key]) copy[key]=[];
    copy[key].push({...form});
    setEntries(copy);
    setShowForm(false);
  }

  /* ===== DICE ===== */
  function rollDice(){
    setDiceRolling(true);
    setTimeout(()=>{
      setDiceGone(true);
      setDiceRolling(false);
    },2000);
  }

  return (
    <div style={{
      minHeight:"100vh",
      padding:20,
      backgroundImage:"url('/assets/hatter.jpg')",
      backgroundSize:"cover",
      color:"white"
    }}>

      <h1 style={{textShadow:"2px 2px black"}}>🎲 Közös D&D Naptár 🐉</h1>

      <div>
        <button onClick={()=>setCurrentDate(new Date(
          currentDate.getFullYear(),
          currentDate.getMonth()-1,1))}>◀</button>

        <strong style={{margin:"0 10px"}}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </strong>

        <button onClick={()=>setCurrentDate(new Date(
          currentDate.getFullYear(),
          currentDate.getMonth()+1,1))}>▶</button>
      </div>

      {/* ===== CALENDAR ===== */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(7,60px)",
        gap:6,
        marginTop:15
      }}>
        {Array.from(
          {length:daysInMonth(currentDate.getFullYear(),currentDate.getMonth())},
          (_,i)=>i+1
        ).map(day=>{
          const key = dateKey(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            day
          );
          const dayEntries = entries[key]||[];
          return (
            <div key={day}
              onClick={()=>openDay(day)}
              style={{
                background:"rgba(255,255,255,0.8)",
                color:"black",
                padding:5,
                cursor:"pointer"
              }}>
              <div>{day}</div>
              <div style={{display:"flex",flexWrap:"wrap"}}>
                {dayEntries.map((e,i)=>(
                  <div key={i}
                    style={{
                      width:10,height:10,margin:1,
                      borderRadius:"50%",
                      border:e.answer==="Csak ha nagyon muszáj"
                        ?`2px solid ${e.color}`:"none",
                      background:
                        e.answer==="Csak ha nagyon muszáj"
                        ?"transparent":e.color
                    }}/>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ===== DAY DETAILS ===== */}
      {selectedDay && (
        <div style={{
          marginTop:20,
          background:"white",
          color:"black",
          padding:10
        }}>
          <h3>{selectedDay}. nap válaszai</h3>

          {(entries[
            dateKey(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              selectedDay
            )
          ]||[]).map((e,i)=>(
            <div key={i}>
              <span style={{color:e.color}}>⬤</span>
              {" "}
              {e.availability} – {e.answer}
            </div>
          ))}

          {!showForm && (
            <button onClick={addOwnAnswer}>
              Saját válasz hozzáadása
            </button>
          )}

          {showForm && (
            <div>
              <select
                onChange={e=>setForm({...form,availability:e.target.value})}>
                <option>Egész nap</option>
                <option>Délután</option>
                <option>Egyéni idő</option>
              </select>

              <select
                onChange={e=>setForm({...form,answer:e.target.value})}>
                <option>Igen</option>
                <option>Csak ha nagyon muszáj</option>
              </select>

              <select
                onChange={e=>setForm({...form,color:e.target.value})}>
                {COLORS.map(c=><option key={c}>{c}</option>)}
              </select>

              <button onClick={saveAnswer}>Mentés</button>
            </div>
          )}
        </div>
      )}

      {/* ===== DICE + DRAGON ===== */}
      {!diceGone && (
        <img
          src="/assets/dice.png"
          onClick={rollDice}
          style={{
            position:"fixed",
            right:20,
            bottom:20,
            width:80,
            cursor:"pointer",
            animation: diceRolling
              ?"spin 0.5s linear infinite":"none"
          }}
        />
      )}

      {diceRolling && (
        <img
          src="/assets/dragon.png"
          style={{
            position:"fixed",
            right:120,
            bottom:20,
            width:200,
            animation:"dragon 2s forwards"
          }}
        />
      )}

      <style>{`
        @keyframes spin {
          from {transform:rotate(0deg);}
          to {transform:rotate(360deg);}
        }
        @keyframes dragon {
          0% {transform:translateX(0);}
          100% {transform:translateX(120px);}
        }
      `}</style>

      <div style={{marginTop:20}}>
        <button onClick={loadCloud}>🔄 Betöltés</button>
        <button onClick={saveCloud}>💾 Mentés</button>
      </div>

    </div>
  );
}
