import { useState } from "react";
import { getMonth, dayNames, monthNames } from "./calendar";
import DragonDice from "./DragonDice";

const COLORS = {
  Habo: "green",
  Puszta: "purple",
  Jankisz: "yellow",
  Lidi: "orange",
  Sho: "red",
  Dorka: "blue",
};

export default function App() {
  const [user, setUser] = useState(null);
  const [color, setColor] = useState(null);
  const [month, setMonth] = useState(0);
  const [data, setData] = useState({});

  if (!user) {
    return (
      <div className="login">
        <h1>Válaszd ki ki vagy</h1>
        {Object.keys(COLORS).map(name => (
          <button key={name} onClick={() => {
            setUser(name);
            setColor(COLORS[name]);
          }}>
            🟢 {name}
          </button>
        ))}
      </div>
    );
  }

  const weeks = getMonth(2026, month);

  const save = (day, time) => {
    setData({
      ...data,
      [`${month}-${day}-${user}`]: { user, time, color }
    });
  };

  return (
    <div className="app">
      <h1>{monthNames[month]} 2026</h1>

      <div className="nav">
        <button onClick={() => setMonth(m => Math.max(0, m - 1))}>◀</button>
        <button onClick={() => setMonth(m => Math.min(11, m + 1))}>▶</button>
      </div>

      <div className="calendar">
        {dayNames.map(d => <div key={d} className="day-name">{d}</div>)}

        {weeks.flat().map((d, i) => (
          <div key={i} className="day">
            {d && (
              <>
                <span>{d}</span>
                <input
                  placeholder="Innentől érek rá"
                  type="number"
                  onBlur={e => save(d, e.target.value)}
                />
                <div className="dots">
                  {Object.values(data)
                    .filter(v => v && v.user && `${month}-${d}-${v.user}` in data)
                    .map((v, i) => (
                      <span key={i} className="dot" style={{ background: v.color }} />
                    ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <DragonDice />
    </div>
  );
}
