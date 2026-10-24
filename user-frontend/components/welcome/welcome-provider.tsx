"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { consumeWelcomePending } from "@/lib/welcome";
import { WelcomeOverlay } from "./welcome-overlay";

const OVERLAY_MS = 4800; // welcome screen
const GLOW_MS = 4600;    // uske baad chat-box border animation

const WelcomeContext = createContext({ glowing: false });

/** Welcome screen ke turant baad ~4.6s ke liye `glowing` true rehta hai. */
export const useWelcome = () => useContext(WelcomeContext);

export function WelcomeProvider({ name, children }: { name?: string; children: ReactNode }) {
  const [showing, setShowing] = useState(false);
  const [glowing, setGlowing] = useState(false);
  const checked = useRef(false);

  useEffect(() => {
    if (checked.current) return; // dev StrictMode effect 2 baar chalata hai
    checked.current = true;
    if (consumeWelcomePending()) setShowing(true);
  }, []);

  const finish = useCallback(() => {
    setShowing(false);
    setGlowing(true);
    window.setTimeout(() => setGlowing(false), GLOW_MS + 200);
  }, []);

  return (
    <WelcomeContext.Provider value={{ glowing }}>
      {children}
      {showing && <WelcomeOverlay name={name} duration={OVERLAY_MS} onDone={finish} />}
    </WelcomeContext.Provider>
  );
}