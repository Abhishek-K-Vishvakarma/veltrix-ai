"use client";

import { useEffect } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";

import "./welcome-overlay.css";

const STEPS = [
  { label: "Observe", color: "#8b5cf6" },
  { label: "Reason", color: "#0E9F8E" },
  { label: "Verify", color: "#D97706" },
  { label: "Act", color: "#22d3ee" },
];

type CSSVars = CSSProperties & Record<`--${string}`, string | number>;

export function WelcomeOverlay({
  name,
  duration,
  onDone,
}: {
  name?: string;
  duration: number;
  onDone: () => void;
}) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, duration);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDone();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onDone, duration]);

  const rootStyle: CSSVars = { "--dur": `${duration}ms` };

  return (
    <div
      className="wo-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to VELTRIX AI"
      style={rootStyle}
    >
      <div className="wo-grid" />

      <div className="wo-stage">
        {/* Stage 1: Observe → Reason → Verify → Act */}
        <div className="wo-steps" aria-hidden="true">
          <div className="wo-steps-row">
            <div className="wo-track">
              <i />
            </div>
            {STEPS.map((s, i) => {
              const stepStyle: CSSVars = { "--i": i, "--c": s.color };
              return (
                <div key={s.label} className="wo-step" style={stepStyle}>
                  <span className="wo-node" />
                  <span className="wo-step-label">{s.label}</span>
                </div>
              );
            })}
          </div>
          <div className="wo-caption">Preparing your workspace</div>
        </div>

        {/* Stage 2: logo reveal */}
        <div className="wo-logo-stage">
          <div className="wo-logo-wrap">
            <div className="wo-halo">
              <span />
            </div>
            <span className="wo-ring" />
            <span className="wo-ring wo-ring-2" />
            <Image
              className="wo-logo"
              src="/veltrix-icon.svg"
              alt="Veltrix AI logo"
              width={132}
              height={132}
              priority
            />
          </div>

          <div className="wo-eyebrow">WELCOME TO</div>
          <h2 className="wo-title">
            VELTRIX <span>AI</span>
          </h2>
          <p className="wo-greet">
            {name ? `Good to see you, ${name}.` : "Good to see you."}
          </p>
          <p className="wo-tagline">Evidence in. Verified action out.</p>
        </div>
      </div>

      <div className="wo-progress">
        <i />
      </div>

      <button type="button" className="wo-skip" onClick={onDone}>
        Skip ›
      </button>
    </div>
  );
}