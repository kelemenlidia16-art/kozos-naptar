import { useState } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

/* ================= FIREBASE CONFIG ================= */
const firebaseConfig = {
  apiKey: "AIzaSyAxaQKdai1nV7coNTkXwnWF6vlXXUlk4aE",
  authDomain: "database-7ce1b.firebaseapp.com",
  projectId: "database-7ce1b",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function App() {
  const COLORS = ["red","blue","green","yellow","purple","orange"];
  const [entries, setEntries] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [formData, setFormData] = useState({availability:"Egész nap", answer:"Igen", color:"red", customTime:""});

  const [diceRoll, setDiceRoll] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [showDragon, setShowDragon] = useState(false);
  const [diceAnimating, setDiceAnimating] = useState(false);

  const monthNames = ["January","February","March","April","May","June",
                      "July","August","September","October","November","December"];

  const daysInMonth = (year, month) => new Date(year, month+1, 0).getDate();

  async function loadFromCloud() {
    const ref = doc(db, "calendar", "shared");
    const snap = await getDoc(ref);
    if (snap.exists()) {
      setEntries(snap.data().entries || {});
      alert("Betöltve a közös adat");
    } else {
      alert("Még nincs közös adat");
    }
  }

  async function saveToCloud() {
    const ref = doc(db, "calendar", "shared");
    await setDoc(ref, { entries });
    alert("Elmentve a közös adat");
  }

  function formatDate(year, month, day) {
    return `${year}-${month+1}-${day}`;
  }

  function openDay(day) {
    setSelectedDay(day);
    const key = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day);
    if(entries[key] && entries[key][0]) setFormData(entries[key][0]);
    else setFormData({availability:"Egész nap", answer:"Igen", color:"red", customTime:""});
  }

  function saveDay() {
    const key = formatDate(currentDate.getFullYear(), currentDate.getMonth(), selectedDay);
    setEntries(prev => ({...prev, [key]: [formData]}));
    setSelectedDay(null);
  }

  function deleteDay() {
    const key = formatDate(currentDate.getFullYear(), currentDate.getMonth(), selectedDay);
    const copy = {...entries};
    delete copy[key];
    setEntries(copy);
    setSelectedDay(null);
  }

  function changeMonth(offset){
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth()+offset, 1);
    setCurrentDate(newDate);
  }

  /* ===== Profi dobás animáció ===== */
  function rollDice() {
    if (rolling) return;
    setRolling(true);
    setDiceAnimating(true);
    setShowDragon(false);

    let i = 0;
    const interval = setInterval(() => {
      setDiceRoll(Math.floor(Math.random() * 20) + 1);
      i++;
      if(i > 20) {
        clearInterval(interval);
        setRolling(false);
        setTimeout(() => {
          setDiceAnimating(false);
          setShowDragon(true);
          setTimeout(()=>setShowDragon(false), 2000);
        }, 500);
      }
    }, 50);
  }

  return (
    <div style={{
      padding:20, 
      fontFamily:"'Cinzel', serif", 
      color:"#f5deb3", 
      minHeight:"100vh",
      backgroundImage:"url('/assets/hatter.jpg')",
      backgroundSize:"cover",
      backgroundPosition:"center",
      position:"relative",
      overflow:"hidden"
    }}>
      <h1 style={{textAlign:"center"}}>Közös naptár – Firebase</h1>
      <div style={{textAlign:"center", marginBottom:10}}>
        <button onClick={() => changeMonth(-1)}>◀</button>
        <strong style={{margin:"0 10px"}}>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</strong>
        <button onClick={() => changeMonth(1)}>▶</button>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"repeat(7,70px)", gap:5}}>
        {Array.from({length:daysInMonth(currentDate.getFullYear(), currentDate.getMonth())}, (_,i)=>i+1).map(day => {
          const key = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day);
          const dayEntries = entries[key] || [];
          const allColorsUsed = COLORS.every(c => dayEntries.some(e => e.color===c));

          return (
            <div key={day} style={{
              border:"2px solid #8b4513", 
              borderRadius:8,
              padding:5, 
              textAlign:"center", 
              cursor:"pointer",
              backgroundColor:"rgba(30,30,30,0.8)",
              position:"relative"
            }} onClick={()=>openDay(day)}>
              <>
                <div style={{color: allColorsUsed ? "lime" : "white", fontWeight:"bold", fontSize:18}}>{day}</div>
                <div style={{display:"flex", justifyContent:"center", flexWrap:"wrap", marginTop:5}}>
                  {dayEntries.map((e, idx) => (
                    <div key={idx} style={{
                      width:12, height:12, margin:1,
                      border:e.answer==="Csak ha nagyon muszáj"?"2px solid white":"none",
                      borderRadius:"50%",
                      backgroundColor:e.answer==="Csak ha nagyon muszáj"? "transparent": e.color,
                      boxShadow: e.answer==="Csak ha nagyon muszáj"? "none":"0 0 4px rgba(0,0,0,0.7)"
                    }}></div>
                  ))}
                </div>
              </>
            </div>
          )
        })}
      </div>

      {selectedDay &&
        <div style={{marginTop:20, border:"2px solid #8b4513", borderRadius:8, padding:15, backgroundColor:"rgba(20,20,20,0.9)"}}>
          <h3>{currentDate.getMonth()+1}/{selectedDay}/{currentDate.getFullYear()}</h3>
          <div>
            <label>Idő: 
              <select value={formData.availability} onChange={e=>setFormData({...formData, availability:e.target.value})}>
                <option>Egész nap</option>
                <option>Délután</option>
                <option>Egyéni idő</option>
              </select>
              {formData.availability==="Egyéni idő" && <input type="number" value={formData.customTime} onChange={e=>setFormData({...formData, customTime:e.target.value})} style={{width:50, marginLeft:5}} />}
            </label>
          </div>
          <div>
            <label>Válasz: 
              <select value={formData.answer} onChange={e=>setFormData({...formData, answer:e.target.value})}>
                <option>Igen</option>
                <option>Csak ha nagyon muszáj</option>
              </select>
            </label>
          </div>
          <div>
            <label>Szín: 
              <select value={formData.color} onChange={e=>setFormData({...formData, color:e.target.value})}>
                {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
          </div>
          <button onClick={saveDay} style={{marginTop:5}}>Mentés</button>
          <button onClick={deleteDay} style={{marginLeft:5, marginTop:5}}>Törlés</button>
          <button onClick={()=>setSelectedDay(null)} style={{marginLeft:5, marginTop:5}}>Mégse</button>
        </div>
      }

      <div style={{marginTop:20, textAlign:"center"}}>
        <button onClick={loadFromCloud}>🔄 Betöltés</button>
        <button onClick={saveToCloud} style={{marginLeft:10}}>💾 Mentés a felhőbe</button>
      </div>

      {/* Dobókocka sarok */}
      <div style={{position:"fixed", bottom:20, right:20, width:50, height:50}}>
        {diceAnimating &&
          <img src="/assets/dice.png" alt="dice" style={{
            width:50, height:50,
            animation: "diceToDragon 1s forwards"
          }}/>
        }
        {!diceAnimating && !showDragon &&
          <img src="/assets/dice.png" alt="dice" style={{width:50, height:50, cursor:"pointer"}} onClick={rollDice}/>
        }
        {diceRoll && !diceAnimating &&
          <div style={{
            position:"absolute", bottom:60, right:0, color:"white", fontSize:18, fontWeight:"bold", textShadow:"1px 1px 2px black"
          }}>Dobás: {diceRoll}</div>
        }
      </div>

      {/* Sárkány animáció */}
      {showDragon &&
        <img src="/assets/dragon.png" alt="dragon" style={{
          position:"fixed",
          bottom:100,
          right:100,
          width:150,
          height:150,
          animation: "dragonAttack 2s ease-in-out",
          border:"2px solid gold",
          borderRadius:10
        }}/>
      }

      <style>{`
        @keyframes diceToDragon {
          0% { transform: translate(0,0) rotate(0deg); opacity:1; }
          50% { transform: translate(-60px,-60px) rotate(180deg); opacity:1; }
          100% { transform: translate(-80px,-80px) rotate(360deg); opacity:0; }
        }

        @keyframes dragonAttack {
          0% { transform: translate(0,0) rotate(0deg); }
          25% { transform: translate(-30px,-10px) rotate(-5deg); }
          50% { transform: translate(-60px,-20px) rotate(5deg); }
          75% { transform: translate(-30px,-10px) rotate(-5deg); }
          100% { transform: translate(0,0) rotate(0deg); }
        }
      `}</style>
    </div>
  );
}
