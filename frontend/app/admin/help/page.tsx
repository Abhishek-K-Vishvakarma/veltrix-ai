"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Brain,
  CircleHelp,
  FileText,
  ShieldCheck,
  ArrowRight,
  ChevronDown,
  MessageSquare,
} from "lucide-react";

type Theme = "paper" | "lab";

const faqs = [
  {
    question: "What is VELTRIX?",
    answer:
      "VELTRIX is an intelligence system that uses visual and document evidence to understand real-world problems, reason over the evidence, verify important values, and produce actionable solutions.",
  },
  {
    question: "How does an analysis work?",
    answer:
      "An investigation follows the pipeline Observe → Understand → Reason → Verify → Act. Evidence is first collected and extracted, then reasoning is performed and important conclusions are verified before actions are generated.",
  },
  {
    question: "Can VELTRIX analyze images?",
    answer:
      "Yes. Visual evidence can be provided during an investigation. The AI can inspect relevant visual information and use it as part of the reasoning process.",
  },
  {
    question: "Does the AI perform calculations?",
    answer:
      "Important numerical calculations should be performed using deterministic tools rather than relying on the language model to calculate values directly.",
  },
  {
    question: "What happens when confidence is low?",
    answer:
      "When the available evidence is insufficient or confidence is below the configured threshold, VELTRIX can request additional evidence instead of presenting an unsupported conclusion.",
  },
  {
    question: "Are my analyses isolated?",
    answer:
      "VELTRIX is designed with strict user isolation so that one user's analysis and evidence should not be accessible to another user.",
  },
];

export default function HelpPage() {
  const router = useRouter();

  const [theme, setTheme] = useState<Theme>("paper");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
                  const active = item === "Help";

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
              Help & Documentation
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
          {/* HERO */}
          <section
            className="border p-7"
            style={{
              background: colors.card,
              borderColor: colors.border,
            }}
          >
            <div className="flex items-start justify-between">
              <div className="max-w-[650px]">
                <div
                  className="text-[9px] font-semibold tracking-[0.16em]"
                  style={{ color: colors.signal }}
                >
                  VELTRIX INTELLIGENCE SYSTEM
                </div>

                <h2 className="text-[25px] font-semibold mt-3">
                  Understand the problem before solving it.
                </h2>

                <p
                  className="text-[11px] leading-6 mt-3"
                  style={{ color: colors.muted }}
                >
                  VELTRIX combines visual evidence, document
                  understanding, deterministic calculations and
                  AI reasoning to transform real-world evidence
                  into actionable solutions.
                </p>
              </div>

              <div
                className="w-14 h-14 flex items-center justify-center"
                style={{
                  background: colors.ink,
                  color: colors.card,
                }}
              >
                <Brain size={25} />
              </div>
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section className="mt-7">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen size={15} />

              <h2 className="text-[13px] font-semibold">
                How VELTRIX Works
              </h2>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {[
                {
                  step: "01",
                  title: "OBSERVE",
                  text: "Collect visual, document or problem evidence.",
                },
                {
                  step: "02",
                  title: "UNDERSTAND",
                  text: "Extract relevant information from the evidence.",
                },
                {
                  step: "03",
                  title: "REASON",
                  text: "Connect evidence and identify possible causes.",
                },
                {
                  step: "04",
                  title: "VERIFY",
                  text: "Check important conclusions and calculations.",
                },
                {
                  step: "05",
                  title: "ACT",
                  text: "Generate practical actions based on findings.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="border p-4"
                  style={{
                    background: colors.card,
                    borderColor: colors.border,
                  }}
                >
                  <div
                    className="font-mono text-[10px]"
                    style={{ color: colors.signal }}
                  >
                    {item.step}
                  </div>

                  <div className="text-[11px] font-semibold mt-3">
                    {item.title}
                  </div>

                  <div
                    className="text-[9px] leading-5 mt-2"
                    style={{ color: colors.muted }}
                  >
                    {item.text}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CORE FEATURES */}
          <section className="mt-7">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={15} />

              <h2 className="text-[13px] font-semibold">
                Core Intelligence Features
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  icon: FileText,
                  title: "Evidence Analysis",
                  text: "Analyze documents and extracted evidence as part of an investigation.",
                },
                {
                  icon: Brain,
                  title: "AI Reasoning",
                  text: "Use multimodal AI to connect observations and identify findings.",
                },
                {
                  icon: ShieldCheck,
                  title: "Verification",
                  text: "Validate important values and conclusions before taking action.",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="border p-5"
                    style={{
                      background: colors.card,
                      borderColor: colors.border,
                    }}
                  >
                    <div
                      className="w-8 h-8 flex items-center justify-center"
                      style={{
                        background: colors.sand,
                      }}
                    >
                      <Icon size={16} />
                    </div>

                    <div className="text-[12px] font-medium mt-4">
                      {item.title}
                    </div>

                    <div
                      className="text-[9px] leading-5 mt-2"
                      style={{ color: colors.muted }}
                    >
                      {item.text}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* FAQ */}
          <section className="mt-7">
            <div className="flex items-center gap-2 mb-3">
              <CircleHelp size={15} />

              <h2 className="text-[13px] font-semibold">
                Frequently Asked Questions
              </h2>
            </div>

            <div
              className="border"
              style={{
                background: colors.card,
                borderColor: colors.border,
              }}
            >
              {faqs.map((faq, index) => {
                const open = openFaq === index;

                return (
                  <div
                    key={faq.question}
                    className="border-b last:border-b-0"
                    style={{ borderColor: colors.border }}
                  >
                    <button
                      onClick={() =>
                        setOpenFaq(open ? null : index)
                      }
                      className="w-full flex items-center justify-between text-left px-5 py-4"
                    >
                      <span className="text-[11px] font-medium">
                        {faq.question}
                      </span>

                      <ChevronDown
                        size={15}
                        style={{
                          color: colors.muted,
                          transform: open
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                          transition: "transform 150ms",
                        }}
                      />
                    </button>

                    {open && (
                      <div
                        className="px-5 pb-4 text-[10px] leading-5 max-w-[850px]"
                        style={{ color: colors.muted }}
                      >
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* SUPPORT */}
          <section className="mt-7 grid grid-cols-2 gap-3">
            <div
              className="border p-5"
              style={{
                background: colors.card,
                borderColor: colors.border,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 flex items-center justify-center"
                  style={{ background: colors.sand }}
                >
                  <BookOpen size={15} />
                </div>

                <div>
                  <div className="text-[12px] font-medium">
                    Documentation
                  </div>

                  <div
                    className="text-[9px] mt-1"
                    style={{ color: colors.muted }}
                  >
                    Technical documentation and system guides.
                  </div>
                </div>
              </div>

              <button
                onClick={() =>
                  console.log("Documentation clicked")
                }
                className="mt-5 flex items-center gap-2 text-[10px] font-medium"
                style={{ color: colors.signal }}
              >
                View Documentation
                <ArrowRight size={13} />
              </button>
            </div>

            <div
              className="border p-5"
              style={{
                background: colors.card,
                borderColor: colors.border,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 flex items-center justify-center"
                  style={{ background: colors.sand }}
                >
                  <MessageSquare size={15} />
                </div>

                <div>
                  <div className="text-[12px] font-medium">
                    Support
                  </div>

                  <div
                    className="text-[9px] mt-1"
                    style={{ color: colors.muted }}
                  >
                    Report an issue or request assistance.
                  </div>
                </div>
              </div>

              <button
                onClick={() =>
                  console.log("Support clicked")
                }
                className="mt-5 flex items-center gap-2 text-[10px] font-medium"
                style={{ color: colors.signal }}
              >
                Contact Support
                <ArrowRight size={13} />
              </button>
            </div>
          </section>

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
              Don&apos;t just answer. Understand the problem and
              produce an actionable solution.
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