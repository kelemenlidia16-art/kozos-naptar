
import { useState } from "react";

export default function DragonDice() {
  const [roll, setRoll] = useState(null);
  const [showDice, setShowDice] = useState(false);

  const rollDice = () => {
    setShowDice(false);
    setRoll(null);

    setTimeout(() => {
      const r = Math.floor(Math.random() * 6) + 1;
      setRoll(r);
      setShowDice(true);
    }, 2000);
  };

  return (
    <div className="dice-box">
      <button onClick={rollDice}>🎲 Dobás</button>

      {!showDice && <img src="/assets/dragon.gif" alt="dragon" />}
      {showDice && (
        <>
          <img src="/assets/dice.gif" alt="dice" />
          <div className="roll-number">{roll}</div>
        </>
      )}
    </div>
  );
}
