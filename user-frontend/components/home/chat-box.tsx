"use client";

import { useState } from "react";
import { useWelcome } from "@/components/welcome/welcome-provider";
import { useCyclingPlaceholder } from "@/hooks/use-cycling-placeholder";

const EXAMPLES = [
  "Describe a problem...",
  "Mera electricity bill itna high kyu aaya?",
  "Is contract mein risky clause kaunsa hai?",
  "Error E21 ka solution kya hai?",
];

export function ChatBox({ onSubmit }: { onSubmit: (text: string) => void }) {
  const { glowing } = useWelcome();
  const [text, setText] = useState("");
  const placeholder = useCyclingPlaceholder(EXAMPLES, text.length === 0);

  return (
    <div className={`border border-[var(--line)] bg-white p-4 ${glowing ? "glow-border" : ""}`}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="h-20 w-full resize-none bg-transparent text-sm outline-none"
      />
      <div className="flex justify-end">
        <button type="button" className="btn btn-primary" disabled={!text.trim()} onClick={() => onSubmit(text.trim())}>
          Analyze
        </button>
      </div>
    </div>
  );
}