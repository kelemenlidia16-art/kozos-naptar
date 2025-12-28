import { useState } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

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
  const [formData, setFormData] = useState({
    availability: "Egész nap",
    answer: "Igen",
    color: "red",
    customTime: "",
  });

  const monthNames = ["January","February","March","April","May","June",
    "July","August","September","October","November","December"];
  const daysInMonth = (y,m) => new Date(y,m+1,0).getDate();
  const formatDate = (y,m,d) => `${y}-${m+1}-${d}`;

  async function loadFromCloud() {
    const ref = doc(db,"calendar","shared");
    const snap = await getDoc(ref);
    if(snap.exists()) setEntries(snap.data().entries || {});
  }

  async function saveToCloud() {
    const ref = doc(db,"calendar","shared");
    await setDoc(ref,{entries});
    alert("Mentve a felhőbe");
  }

  function openDay(day) {
    setSelectedDay(day);
    setFormData({
      availability: "Egész nap",
      answer: "Igen",
      color: "red",
      customTime: "",
    });
  }

  function saveDay() {
    const key = formatDate(currentDate.getFullYear(),currentDate.getMonth(),selectedDay);
    setEntries(prev => {
      const prevEntries = prev[key] || [];
      return {
        ...prev,
        [key]: [...prevEntries, formData]
      }
    });
    setSelectedDay(null);
  }

  function addNewEntry() {
    setFormData({
      availability: "Egész nap",
      answer: "Igen",
      color: "red",
      customTime: "",
    });
  }

  function changeMonth(offset) {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth()+offset, 1));
  }

  const dayEntriesDisplay = selectedDay ? entries[formatDate(currentDate.getFullYear(),currentDate.getMonth(),selectedDay)] || [] : [];

  return (
    <div style={{padding:20, backgroundImage:"url(/hatter.jpeg)", backgroundSize:"cover", minHeight:"100vh"}}>
      <h1 style={{color:"white"}}>Közös naptár</h1>

      <div>
        <button onClick={()=>changeMonth(-1)}>◀</button>
        <strong style={{margin:"0 10px", color:"white"}}>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</strong>
        <button onClick={()=>changeMonth(1)}>▶</button>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"repeat(7,50px)", gap:5, marginTop:10}}>
        {Array.from({length:daysInMonth(currentDate.getFullYear(),currentDate.getMonth())},(_,i)=>i+1).map(day=>{
          const key = formatDate(currentDate.getFullYear(),currentDate.getMonth(),day);
          const dayEntries = entries[key] || [];
          return (
            <div key={day} style={{border:"1px solid gray", padding:5, textAlign:"center", cursor:"pointer", position:"relative"}} onClick={()=>openDay(day)}>
              <div style={{color: dayEntries.length === 6 ? "green" : "white"}}>{day}</div>
              <div style={{display:"flex", justifyContent:"center", flexWrap:"wrap"}}>
                {dayEntries.map((e,idx)=>(
                  <div key={idx} title={`Szín: ${e.color}`} style={{
                    width:10,height:10,margin:1,borderRadius:"50%",
                    backgroundColor:e.answer==="Csak ha nagyon muszáj"?"transparent":e.color,
                    border:e.answer==="Csak ha nagyon muszáj"?`2px solid ${e.color}`:"none"
                  }} />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {selectedDay &&
        <div style={{marginTop:20, border:"1px solid black", padding:10, backgroundColor:"rgba(0,0,0,0.7)", color:"white"}}>
          <h3>{currentDate.getMonth()+1}/{selectedDay}/{currentDate.getFullYear()}</h3>

          <div style={{marginBottom:10}}>
            <button onClick={addNewEntry}>Új bejegyzés</button>
          </div>

          {dayEntriesDisplay.map((e,idx)=>(
            <div key={idx} style={{marginBottom:5, borderBottom:"1px solid white"}}>
              <div>Idő: {e.availability} {e.customTime && `(${e.customTime})`}</div>
              <div>Válasz: {e.answer}</div>
              <div>Szín: <span style={{color:e.color}}>{e.color}</span></div>
            </div>
          ))}

          <div style={{marginTop:10}}>
            <label>Idő:
              <select value={formData.availability} onChange={ev=>setFormData({...formData,availability:ev.target.value})}>
                <option>Egész nap</option><option>Délután</option><option>Egyéni idő</option>
              </select>
              {formData.availability==="Egyéni idő" && <input type="number" value={formData.customTime} onChange={ev=>setFormData({...formData,customTime:ev.target.value})} style={{width:50, marginLeft:5}} />}
            </label>

            <label style={{marginLeft:10}}>Válasz:
              <select value={formData.answer} onChange={ev=>setFormData({...formData,answer:ev.target.value})}>
                <option>Igen</option><option>Csak ha nagyon muszáj</option>
              </select>
            </label>

            <label style={{marginLeft:10}}>Szín:
              <select value={formData.color} onChange={ev=>setFormData({...formData,color:ev.target.value})}>
                {COLORS.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </label>
          </div>

          <div style={{marginTop:10}}>
            <button onClick={saveDay}>Mentés</button>
            <button onClick={()=>setSelectedDay(null)} style={{marginLeft:5}}>Mégse</button>
          </div>

          {/* Dragon & Dice images */}
          <img src="/dragon.png" alt="dragon" style={{position:"absolute", top:0, right:0, width:100}}/>
          <img src="/dice.png" alt="dice" style={{position:"absolute", bottom:0, right:0, width:50}}/>
        </div>
      }

      <div style={{marginTop:20}}>
        <button onClick={loadFromCloud}>🔄 Betöltés</button>
        <button onClick={saveToCloud} style={{marginLeft:10}}>💾 Mentés</button>
      </div>
    </div>
  )
}
