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
  const COLORS = ["red", "blue", "green", "yellow", "purple", "orange"];
  const [entries, setEntries] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [formData, setFormData] = useState({
    availability: "Egész nap",
    answer: "Igen",
    color: "red",
    customTime: "",
  });

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const formatDate = (y, m, d) => `${y}-${m + 1}-${d}`;

  /* ===== FIREBASE ===== */
  async function loadFromCloud() {
    const ref = doc(db, "calendar", "shared");
    const snap = await getDoc(ref);
    if (snap.exists()) setEntries(snap.data().entries || {});
  }

  async function saveToCloud() {
    const ref = doc(db, "calendar", "shared");
    await setDoc(ref, { entries });
    alert("Mentve a felhőbe");
  }

  /* ===== DAY ===== */
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
    const key = formatDate(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      selectedDay
    );

    setEntries(prev => {
      const prevEntries = prev[key] || [];
      return {
        ...prev,
        [key]: [...prevEntries, formData],
      };
    });

    setSelectedDay(null);
  }

  function changeMonth(offset) {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1)
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Közös naptár</h1>

      <div style={{ marginBottom: 10 }}>
        <button onClick={() => changeMonth(-1)}>◀</button>
        <strong style={{ margin: "0 10px" }}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </strong>
        <button onClick={() => changeMonth(1)}>▶</button>
      </div>

      {/* ===== CALENDAR ===== */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 50px)",
          gap: 6,
        }}
      >
        {Array.from(
          { length: daysInMonth(currentDate.getFullYear(), currentDate.getMonth()) },
          (_, i) => i + 1
        ).map(day => {
          const key = formatDate(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            day
          );
          const dayEntries = entries[key] || [];

          const allColorsUsed = COLORS.every(c =>
            dayEntries.some(e => e.color === c)
          );

          return (
            <div
              key={day}
              onClick={() => openDay(day)}
              style={{
                border: "1px solid gray",
                padding: 4,
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              <div style={{ color: allColorsUsed ? "green" : "black" }}>
                {day}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                {dayEntries.map((e, idx) => (
                  <div
                    key={idx}
                    title={`Szín: ${e.color}`}
                    style={{
                      width: 10,
                      height: 10,
                      margin: 1,
                      borderRadius: "50%",
                      backgroundColor:
                        e.answer === "Csak ha nagyon muszáj"
                          ? "transparent"
                          : e.color,
                      border:
                        e.answer === "Csak ha nagyon muszáj"
                          ? `2px solid ${e.color}`
                          : "none",
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ===== POPUP ===== */}
      {selectedDay && (
        <div
          style={{
            marginTop: 20,
            border: "1px solid black",
            padding: 10,
          }}
        >
          <h3>
            {currentDate.getMonth() + 1}/{selectedDay}/{currentDate.getFullYear()}
          </h3>

          <div>
            <label>
              Idő:
              <select
                value={formData.availability}
                onChange={e =>
                  setFormData({ ...formData, availability: e.target.value })
                }
              >
                <option>Egész nap</option>
                <option>Délután</option>
                <option>Egyéni idő</option>
              </select>
              {formData.availability === "Egyéni idő" && (
                <input
                  type="number"
                  value={formData.customTime}
                  onChange={e =>
                    setFormData({ ...formData, customTime: e.target.value })
                  }
                  style={{ width: 50, marginLeft: 5 }}
                />
              )}
            </label>
          </div>

          <div>
            <label>
              Válasz:
              <select
                value={formData.answer}
                onChange={e =>
                  setFormData({ ...formData, answer: e.target.value })
                }
              >
                <option>Igen</option>
                <option>Csak ha nagyon muszáj</option>
              </select>
            </label>
          </div>

          <div>
            <label>
              Szín (ez vagy te):
              <select
                value={formData.color}
                onChange={e =>
                  setFormData({ ...formData, color: e.target.value })
                }
              >
                {COLORS.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button onClick={saveDay}>Mentés</button>
          <button onClick={() => setSelectedDay(null)} style={{ marginLeft: 5 }}>
            Mégse
          </button>
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <button onClick={loadFromCloud}>🔄 Betöltés</button>
        <button onClick={saveToCloud} style={{ marginLeft: 10 }}>
          💾 Mentés
        </button>
      </div>
    </div>
  );
}
