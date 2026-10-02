"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Brain,
  ShieldCheck,
  SlidersHorizontal,
  Save,
  CheckCircle2,
} from "lucide-react";

type Theme = "paper" | "lab";

export default function SettingsPage() {
  const router = useRouter();

  const [theme, setTheme] = useState<Theme>("paper");
  const [temperature, setTemperature] = useState("0.0");
  const [confidenceThreshold, setConfidenceThreshold] = useState("80");
  const [autoVerify, setAutoVerify] = useState(true);
  const [saved, setSaved] = useState(false);

  const isLab = theme === "lab";

  const colors = {
    bg: isLab ? "#F4F7F6" : "#F6F4EE",
    card: "#FFFFFF",
    sand: isLab ? "#E8EFEC" : "#EFEBDF",
    border: isLab ? "#DCE5E1" : "#E4E0D5",
    ink: isLab ? "#0B1F1C" : "#14130F",
    muted: isLab ? "#5B706B" : "#6F6A5E",
    primary: isLab ? "#0F766E" : "#14130F",
    primaryText: "#F6F4EE",
    signal: isLab ? "#F59E0B" : "#FF4A1C",
    verified: "#0E7C66",
  };

  const routeMap: Record<string, string> = {
    Dashboard: "/admin/dashboard",
    "New Analysis": "/admin/analyses",
    History: "/admin/history",
    Insights: "/admin/insights",
    Analytics: "/admin/analytics",
    Knowledge: "/admin/knowledge",
    Projects: "/admin/projects",
    Documents: "/admin/documents",
    Settings: "/admin/settings",
    Help: "/admin/help",
  };

  const navSections = [
    {
      title: "WORKSPACE",
      items: ["Dashboard", "New Analysis", "History"],
    },
    {
      title: "INTELLIGENCE",
      items: ["Insights", "Analytics", "Knowledge"],
    },
    {
      title: "LIBRARY",
      items: ["Projects", "Documents"],
    },
    {
      title: "SYSTEM",
      items: ["Settings", "Help"],
    },
  ];

  const handleSave = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  return (
    <div
      className="min-h-screen flex"
      style={{
        background: colors.bg,
        color: colors.ink,
        fontFamily: "var(--font-veltrix-sans)",
      }}
    >
      {/* SIDEBAR */}
      <aside
        className="w-[224px] min-h-screen border-r flex flex-col shrink-0"
        style={{
          background: colors.bg,
          borderColor: colors.border,
        }}
      >
        {/* LOGO */}
        <div className="px-5 py-5">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 flex items-center justify-center"
              style={{
                background: colors.ink,
                color: colors.card,
              }}
            >
              <span className="font-bold text-lg">V</span>
            </div>

            <div>
              <div className="font-bold tracking-[0.18em] text-[15px]">
                VELTRIX
              </div>

              <div
                className="text-[8px] tracking-[0.12em] uppercase"
                style={{ color: colors.muted }}
              >
                Intelligence System
              </div>
            </div>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="px-3 mt-3 flex-1">
          {navSections.map((section) => (
            <div key={section.title} className="mb-6">
              <div
                className="px-3 mb-2 text-[9px] font-semibold tracking-[0.16em]"
                style={{ color: colors.muted }}
              >
                {section.title}
              </div>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = item === "Settings";

                  return (
                    <button
                      key={item}
                      onClick={() => router.push(routeMap[item])}
                      className="relative w-full flex items-center text-left px-3 py-2.5 text-[12px]"
                      style={{
                        background: active
                          ? colors.card
                          : "transparent",
                        border: active
                          ? `1px solid ${colors.border}`
                          : "1px solid transparent",
                        color: active
                          ? colors.ink
                          : colors.muted,
                      }}
                    >
                      {active && (
                        <span
                          className="absolute left-[-1px] top-[-1px] bottom-[-1px] w-[4px]"
                          style={{
                            background: colors.signal,
                          }}
                        />
                      )}

                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* AI STATUS */}
        <div
          className="mx-4 mb-5 p-3 border"
          style={{
            background: colors.card,
            borderColor: colors.border,
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: colors.verified }}
            />

            <span className="text-[11px] font-medium">
              AI Online
            </span>
          </div>

          <div
            className="mt-1 text-[9px]"
            style={{ color: colors.muted }}
          >
            Gemini Intelligence Engine
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 min-w-0">
        {/* HEADER */}
        <header
          className="h-[70px] border-b flex items-center justify-between px-8"
          style={{ borderColor: colors.border }}
        >
          <div>
            <div
              className="text-[10px] uppercase tracking-[0.14em]"
              style={{ color: colors.muted }}
            >
              System
            </div>

            <h1 className="text-[22px] font-semibold mt-1">
              Settings
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* THEME */}
            <div
              className="flex border"
              style={{ borderColor: colors.border }}
            >
              <button
                onClick={() => setTheme("paper")}
                className="px-3 py-1.5 text-[10px]"
                style={{
                  background:
                    theme === "paper"
                      ? colors.ink
                      : "transparent",
                  color:
                    theme === "paper"
                      ? colors.primaryText
                      : colors.muted,
                }}
              >
                Paper
              </button>

              <button
                onClick={() => setTheme("lab")}
                className="px-3 py-1.5 text-[10px]"
                style={{
                  background:
                    theme === "lab"
                      ? colors.primary
                      : "transparent",
                  color:
                    theme === "lab"
                      ? colors.primaryText
                      : colors.muted,
                }}
              >
                Lab
              </button>
            </div>

            <button
              onClick={() => router.push("/admin/analyses")}
              className="h-[30px] px-3 text-[12px] border"
              style={{
                background: colors.primary,
                color: colors.primaryText,
                borderColor: colors.primary,
              }}
            >
              New Analysis
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <div className="max-w-[1100px] mx-auto px-8 py-7">
          {/* PROFILE */}
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <User size={15} />

              <h2 className="text-[13px] font-semibold">
                Profile
              </h2>
            </div>

            <div
              className="border grid grid-cols-2 gap-5 p-5"
              style={{
                background: colors.card,
                borderColor: colors.border,
              }}
            >
              <div>
                <label
                  className="block text-[9px] font-semibold tracking-[0.1em] mb-2"
                  style={{ color: colors.muted }}
                >
                  NAME
                </label>

                <input
                  defaultValue="Abhishek"
                  className="w-full h-[34px] border px-3 text-[11px] outline-none"
                  style={{
                    borderColor: colors.border,
                    background: colors.bg,
                    color: colors.ink,
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-[9px] font-semibold tracking-[0.1em] mb-2"
                  style={{ color: colors.muted }}
                >
                  EMAIL
                </label>

                <input
                  defaultValue="admin@veltrix.ai"
                  className="w-full h-[34px] border px-3 text-[11px] outline-none"
                  style={{
                    borderColor: colors.border,
                    background: colors.bg,
                    color: colors.ink,
                  }}
                />
              </div>
            </div>
          </section>

          {/* AI CONFIG */}
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Brain size={15} />

              <h2 className="text-[13px] font-semibold">
                Intelligence Engine
              </h2>
            </div>

            <div
              className="border"
              style={{
                background: colors.card,
                borderColor: colors.border,
              }}
            >
              {/* MODEL */}
              <div
                className="p-5 border-b"
                style={{ borderColor: colors.border }}
              >
                <div
                  className="text-[9px] font-semibold tracking-[0.1em]"
                  style={{ color: colors.muted }}
                >
                  PRIMARY MODEL
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <div className="text-[12px] font-medium">
                      Gemini 2.5 Flash
                    </div>

                    <div
                      className="text-[9px] mt-1"
                      style={{ color: colors.muted }}
                    >
                      Multimodal reasoning engine
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-1 text-[9px]"
                    style={{ color: colors.verified }}
                  >
                    <CheckCircle2 size={13} />
                    Connected
                  </div>
                </div>
              </div>

              {/* TEMPERATURE */}
              <div
                className="p-5 border-b"
                style={{ borderColor: colors.border }}
              >
                <div className="flex justify-between">
                  <div>
                    <div className="text-[11px] font-medium">
                      Temperature
                    </div>

                    <div
                      className="text-[9px] mt-1"
                      style={{ color: colors.muted }}
                    >
                      Lower values improve deterministic reasoning.
                    </div>
                  </div>

                  <input
                    value={temperature}
                    onChange={(e) =>
                      setTemperature(e.target.value)
                    }
                    className="w-[70px] h-[30px] border px-2 text-center font-mono text-[10px] outline-none"
                    style={{
                      borderColor: colors.border,
                      background: colors.bg,
                    }}
                  />
                </div>
              </div>

              {/* CONFIDENCE */}
              <div className="p-5">
                <div className="flex justify-between">
                  <div>
                    <div className="text-[11px] font-medium">
                      Minimum Confidence
                    </div>

                    <div
                      className="text-[9px] mt-1"
                      style={{ color: colors.muted }}
                    >
                      Investigations below this value require
                      additional evidence.
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <input
                      value={confidenceThreshold}
                      onChange={(e) =>
                        setConfidenceThreshold(e.target.value)
                      }
                      className="w-[55px] h-[30px] border px-2 text-center font-mono text-[10px] outline-none"
                      style={{
                        borderColor: colors.border,
                        background: colors.bg,
                      }}
                    />

                    <span
                      className="font-mono text-[10px]"
                      style={{ color: colors.muted }}
                    >
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* VERIFICATION */}
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={15} />

              <h2 className="text-[13px] font-semibold">
                Verification
              </h2>
            </div>

            <div
              className="border p-5"
              style={{
                background: colors.card,
                borderColor: colors.border,
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-medium">
                    Automatic evidence verification
                  </div>

                  <div
                    className="text-[9px] mt-1"
                    style={{ color: colors.muted }}
                  >
                    Verify extracted values before producing the
                    final conclusion.
                  </div>
                </div>

                <button
                  onClick={() => setAutoVerify(!autoVerify)}
                  className="w-[38px] h-[21px] relative border"
                  style={{
                    background: autoVerify
                      ? colors.verified
                      : colors.sand,
                    borderColor: autoVerify
                      ? colors.verified
                      : colors.border,
                  }}
                >
                  <span
                    className="absolute top-[3px] w-[13px] h-[13px] bg-white"
                    style={{
                      left: autoVerify ? "20px" : "3px",
                    }}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* PREFERENCES */}
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <SlidersHorizontal size={15} />

              <h2 className="text-[13px] font-semibold">
                Preferences
              </h2>
            </div>

            <div
              className="border p-5"
              style={{
                background: colors.card,
                borderColor: colors.border,
              }}
            >
              <div>
                <div className="text-[11px] font-medium">
                  Interface Theme
                </div>

                <div
                  className="text-[9px] mt-1"
                  style={{ color: colors.muted }}
                >
                  Choose the visual environment for the
                  intelligence workspace.
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setTheme("paper")}
                    className="h-[30px] px-4 border text-[10px]"
                    style={{
                      background:
                        theme === "paper"
                          ? colors.ink
                          : colors.card,
                      color:
                        theme === "paper"
                          ? colors.primaryText
                          : colors.muted,
                      borderColor: colors.border,
                    }}
                  >
                    Paper
                  </button>

                  <button
                    onClick={() => setTheme("lab")}
                    className="h-[30px] px-4 border text-[10px]"
                    style={{
                      background:
                        theme === "lab"
                          ? colors.primary
                          : colors.card,
                      color:
                        theme === "lab"
                          ? colors.primaryText
                          : colors.muted,
                      borderColor: colors.border,
                    }}
                  >
                    Lab
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* SAVE */}
          <div className="flex items-center justify-between">
            <div
              className="text-[9px]"
              style={{ color: colors.muted }}
            >
              Settings are currently stored locally.
            </div>

            <button
              onClick={handleSave}
              className="h-[30px] px-4 flex items-center gap-2 text-[11px]"
              style={{
                background: colors.primary,
                color: colors.primaryText,
              }}
            >
              <Save size={13} />

              {saved ? "Saved" : "Save Changes"}
            </button>
          </div>

          {/* PRINCIPLE */}
          <div
            className="mt-8 border p-5"
            style={{
              background: colors.sand,
              borderColor: colors.border,
            }}
          >
            <div
              className="text-[9px] tracking-[0.14em] font-semibold"
              style={{ color: colors.signal }}
            >
              VELTRIX PRINCIPLE
            </div>

            <div className="mt-2 text-[14px] font-medium">
              Never trade evidence quality for speed.
            </div>

            <div
              className="mt-2 font-mono text-[9px] tracking-[0.1em]"
              style={{ color: colors.muted }}
            >
              OBSERVE → UNDERSTAND → REASON → VERIFY → ACT
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}