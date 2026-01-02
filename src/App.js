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
  { color: "green", name: "Habo" },
  { color: "purple", name: "Puszta" },
  { color: "yellow", name: "Jankisz" },
  { color: "orange", name: "Lidi" },
  { color: "red", name: "Sho" },
  { color: "blue", name: "Dorka" },
];

const WEEKDAYS = ["Hétfő","Kedd","Szerda","Csütörtök","Péntek","Szombat","Vasárnap"];
const MONTHS = ["Január","Február","Március","Április","Május","Június","Július","Augusztus","Szeptember","Október","November","December"];

const daysInMonth = (y,m)=> new Date(y,m+1,0).getDate();
const firstWeekday = (y,m)=> (new Date(y,m,1).getDay()+6)%7;
const dateKey = (y,m,d)=>`${y}-${m+1}-${d}`;

export default function App(){
  const [year] = useState(2026);
  const [month,setMonth] = useState(0);
  const [entries,setEntries] = useState({});
  const [user,setUser] = useState(null);
  const [selectedDay,setSelectedDay] = useState(null);
  const [form,setForm] = useState({availability:"Egész nap",answer:"Igen"});

  /* 🎲🐉 animation states */
  const [diceValue,setDiceValue] = useState(null);
  const [showDragon,setShowDragon] = useState(false);
  const [eating,setEating] = useState(false);

  useEffect(()=>{
    getDoc(doc(db,"calendar","shared")).then(s=>{
      if(s.exists()) setEntries(s.data());
    });
  },[]);

  const saveCloud = data => setDoc(doc(db,"calendar","shared"),data);

  function openDay(d){
    setSelectedDay(d);
    const mine = (entries[dateKey(year,month,d)]||[]).find(e=>e.color===user.color);
    setForm(mine || {availability:"Egész nap",answer:"Igen"});
  }

  function saveDay(){
    const key = dateKey(year,month,selectedDay);
    const list = (entries[key]||[]).filter(e=>e.color!==user.color);
    const updated = [...list,{...form,color:user.color}];
    const n = {...entries,[key]:updated};
    setEntries(n); saveCloud(n); setSelectedDay(null);
  }

  function deleteDay(){
    const key = dateKey(year,month,selectedDay);
    const n = {...entries,[key]:(entries[key]||[]).filter(e=>e.color!==user.color)};
    setEntries(n); saveCloud(n); setSelectedDay(null);
  }

  /* 🎲🐉 DICE + DRAGON */
  function rollDice(){
    const r = Math.floor(Math.random()*20)+1;
    setDiceValue(r);
    setShowDragon(true);

    setTimeout(()=>setEating(true),1000);
    setTimeout(()=>{
      setDiceValue(null);
      setEating(false);
      setShowDragon(false);
    },3500);
  }

  /* ===== LOGIN ===== */
  if(!user){
    const used = Object.values(entries).flat().map(e=>e.color);
    return(
      <div style={{
        minHeight:"100vh",
        background:"url(/assets/hatter.jpg) center/cover",
        padding:40,
        color:"white"
      }}>
        <h2>Ki vagy?</h2>
        {USERS.map(u=>(
          <button key={u.color}
            onClick={()=>setUser(u)}
            style={{
              display:"block",
              margin:10,
              padding:10,
              background:u.color,
              color:"black",
              textDecoration:used.includes(u.color)?"line-through":"none"
            }}>
            ● {u.name}
          </button>
        ))}
      </div>
    );
  }

  const blanks = firstWeekday(year,month);
  const days = daysInMonth(year,month);

  return(
    <div style={{
      minHeight:"100vh",
      background:"url(/assets/hatter.jpg) center/cover",
      padding:20,
      color:"white"
    }}>
      <h1>{MONTHS[month]} {year}</h1>
      <button onClick={()=>setMonth(m=>m-1)} disabled={month===0}>◀</button>
      <button onClick={()=>setMonth(m=>m+1)} disabled={month===11}>▶</button>

      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",marginTop:10}}>
        {WEEKDAYS.map(d=><b key={d} style={{fontSize:12}}>{d}</b>)}
        {[...Array(blanks)].map((_,i)=><div key={i}/>)}
        {[...Array(days)].map((_,i)=>{
          const day=i+1;
          const list=entries[dateKey(year,month,day)]||[];
          const allSix=USERS.every(u=>list.some(e=>e.color===u.color));
          return(
            <div key={day}
              onClick={()=>openDay(day)}
              style={{
                border:"1px solid #aaa",
                padding:5,
                background:allSix?"rgba(0,255,0,0.3)":"rgba(0,0,0,0.5)",
                cursor:"pointer"
              }}>
              {day}
              <div style={{display:"flex",flexWrap:"wrap"}}>
                {list.map((e,i)=>(
                  <div key={i}
                    style={{
                      width:10,
                      height:10,
                      margin:1,
                      borderRadius:"50%",
                      background:e.answer==="Csak ha nagyon muszáj"?"transparent":e.color,
                      border:`2px solid ${e.color}`
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selectedDay && (
        <div style={{marginTop:20,background:"#000c",padding:10}}>
          <h3>{selectedDay}. {MONTHS[month]}</h3>
          <select value={form.availability} onChange={e=>setForm({...form,availability:e.target.value})}>
            <option>Egész nap</option>
            <option>Délután</option>
            <option>Egyéni idő</option>
          </select>
          <select value={form.answer} onChange={e=>setForm({...form,answer:e.target.value})}>
            <option>Igen</option>
            <option>Csak ha nagyon muszáj</option>
          </select>
          <br/>
          <button onClick={saveDay}>Mentés</button>
          <button onClick={deleteDay}>Törlés</button>
          <button onClick={()=>setSelectedDay(null)}>Mégse</button>
        </div>
      )}

      {/* 🎲 DICE */}
      {!diceValue && (
        <img
          src="/assets/dice.png"
          alt="dice"
          onClick={rollDice}
          style={{
            position:"fixed",
            right:20,
            bottom:20,
            width:60,
            cursor:"pointer"
          }}
        />
      )}

      {/* 🎲 RESULT */}
      {diceValue && (
        <div style={{
          position:"fixed",
          right:eating ? "50%" : "100px",
          bottom:eating ? "200px" : "40px",
          transition:"all 1s ease",
          fontSize:30
        }}>
          🎲 {diceValue}
        </div>
      )}

      {/* 🐉 DRAGON */}
      {showDragon && (
        <img
          src="/assets/dragon.png"
          alt="dragon"
          style={{
            position:"fixed",
            right:"40%",
            bottom:"150px",
            width:200,
            transform:eating?"scale(1.1)":"scale(1)",
            transition:"0.5s"
          }}
        />
      )}
    </div>
  );
}
