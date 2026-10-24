"use client";

import { Sparkles } from "lucide-react";
import { useEffect } from "react";

const STEPS = [
  { label: "Observe", color: "var(--primary)" },
  { label: "Reason", color: "#0E9F8E" },
  { label: "Verify", color: "#D97706" },
  { label: "Act", color: "var(--signal)" },
];

export function WelcomeOverlay({ name, duration, onDone }: { name?: string; duration: number; onDone: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, duration);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onDone(); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onDone, duration]);

  return (
    <div className="welcome-overlay" role="dialog" aria-modal="true" aria-label="Welcome to VELTRIX AI" style={{ animationDuration: `${duration}ms` }}>
      <div className="welcome-content">
        <div className="welcome-logo"><Sparkles size={24} strokeWidth={2} /></div>
        <div className="welcome-eyebrow">WELCOME TO</div>
        <h2 className="welcome-title">VELTRIX AI</h2>
        <p className="welcome-greet">{name ? `Good to see you, ${name}.` : "Good to see you."}</p>
        <div className="welcome-steps">
          {STEPS.map((s, i) => (
            <span key={s.label} style={{ background: s.color, animationDelay: `${1.4 + i * 0.4}s` }}>{s.label}</span>
          ))}
        </div>
        <p className="welcome-tagline">Evidence in. Verified action out.</p>
        <div className="welcome-progress"><i style={{ animationDuration: `${duration - 400}ms` }} /></div>
      </div>
      <button type="button" className="welcome-skip" onClick={onDone}>Skip ›</button>
    </div>
  );
}