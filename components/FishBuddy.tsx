"use client";
import { useState } from "react";

const messages = [
  "Zebrafish can regenerate damaged heart tissue — talk about having a fin-tastic recovery plan.",
  "Adult zebrafish usually prefer being near other zebrafish. Shoaling is serious social networking.",
  "Zebrafish are diurnal: they are most active during the day. Even fish appreciate a decent sleep schedule.",
  "Their transparent embryos make early development unusually easy to observe. Tiny fish, huge scientific résumé.",
  "Zebrafish can learn visual discriminations and remember rewarded choices. They are not just going with the flow.",
  "A zebrafish has taste buds not only in its mouth but also around the lips and head. Very committed food critics.",
  "Researchers use zebrafish to study behaviour, development, genetics and neuroscience. One fish, many schools of thought.",
  "Zebrafish can distinguish colours. So yes, your experimental colour choices may matter — no need to be koi about it.",
  "Shoaling can reduce perceived risk for zebrafish. There really is safety in numbers — especially underwater.",
  "Why did the zebrafish join the lab? It wanted to make a splash in science.",
  "What is a zebrafish researcher's favourite kind of data? Something with a good school size.",
  "Current mood: just keep swimming… but record the behaviour first."
];

export function FishBuddy() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const next = () => {
    setIndex((i) => (i + 1 + Math.floor(Math.random() * (messages.length - 1))) % messages.length);
    setOpen(true);
  };

  return (
    <div className="fish-buddy-wrap">
      {open && (
        <div className="fish-buddy-card" role="status">
          <div className="fish-buddy-head">
            <strong>Fish Buddy says…</strong>
            <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close Fish Buddy">×</button>
          </div>
          <p>{messages[index]}</p>
          <button className="buddy-more" onClick={next}>Give me another</button>
        </div>
      )}
      <button
        className="fish-buddy"
        onClick={() => open ? next() : setOpen(true)}
        aria-label="Open Fish Buddy for a zebrafish fact or pun"
        title="Fish Buddy"
      >
        <span className="buddy-fish">🐟</span>
        <span>Fish Buddy</span>
      </button>
    </div>
  );
}
