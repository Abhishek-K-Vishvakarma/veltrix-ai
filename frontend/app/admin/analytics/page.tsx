
"use client";

import { useState } from "react"
import { useRouter } from "next/navigation";
import {
  BarChart3,
  ChevronDown,
  FileText,
  Image as ImageIcon,
  Lightbulb,
  Menu,
  Moon,
  Settings,
  ShieldCheck,
  Sun,
  Upload,
  Users,
  Zap,
} from "lucide-react";

type Theme = "paper" | "lab";

const navGroups = [
  {
    title: "WORKSPACE",
    items: [
      { label: "Dashboard", icon: BarChart3 },
      { label: "New Analysis", icon: Zap },
      { label: "History", icon: FileText },
    ],
  },
  {
    title: "INTELLIGENCE",
    items: [
      { label: "Insights", icon: Lightbulb },
      { label: "Analytics", icon: BarChart3 },
      { label: "Knowledge", icon: ShieldCheck },
    ],
  },
  {
    title: "LIBRARY",
    items: [
      { label: "Projects", icon: FileText },
      { label: "Documents", icon: FileText },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { label: "Settings", icon: Settings },
      { label: "Help", icon: Users },
    ],
  },
];

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

const activityData = [
  { day: "Mon", analyses: 18 },
  { day: "Tue", analyses: 26 },
  { day: "Wed", analyses: 22 },
  { day: "Thu", analyses: 34 },
  { day: "Fri", analyses: 29 },
  { day: "Sat", analyses: 17 },
  { day: "Sun", analyses: 24 },
];

const categoryData = [
  { name: "Utility", value: 40 },
  { name: "Document", value: 26 },
  { name: "Visual", value: 20 },
  { name: "Problem", value: 14 },
];

export default function AnalyticsPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<Theme>("paper");
  const [range, setRange] = useState("Last 7 days");

  const maxActivity = Math.max(...activityData.map((item) => item.analyses));

  return (
    <main
      data-theme={theme}
      className="min-h-screen"
      style={{
        background: "var(--bg)",
        color: "var(--ink)",
        fontFamily: "var(--font-veltrix-sans)",
      }}
    >
      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <aside
          className="hidden w-[224px] shrink-0 border-r lg:flex lg:flex-col"
          style={{
            background: "var(--bg)",
            borderColor: "var(--border)",
          }}
        >
          {/* Logo */}
          <div className="px-5 py-5">
            <button
              onClick={() => router.push("/admin/dashboard")}
              className="flex items-center gap-3 text-left"
            >
              <div
                className="relative flex h-9 w-9 items-center justify-center"
                style={{
                  background: "var(--ink)",
                }}
              >
                <span
                  className="absolute left-[8px] top-[9px] h-[14px] w-[7px] border-l-2 border-b-2"
                  style={{ borderColor: "var(--card)" }}
                />
                <span
                  className="absolute right-[8px] top-[9px] h-[14px] w-[7px] border-r-2 border-b-2"
                  style={{ borderColor: "var(--card)" }}
                />
                <span
                  className="absolute right-[6px] top-[5px] h-1.5 w-1.5 rotate-45"
                  style={{ background: "var(--signal)" }}
                />
              </div>

              <div>
                <div
                  className="text-[15px] font-bold tracking-[0.16em]"
                  style={{ color: "var(--ink)" }}
                >
                  VELTRIX
                </div>
                <div
                  className="text-[8px] uppercase tracking-[0.14em]"
                  style={{ color: "var(--muted)" }}
                >
                  Intelligence System
                </div>
              </div>
            </button>
          </div>

          {/* NAVIGATION */}
          <nav className="flex-1 px-3">
            {navGroups.map((group) => (
              <div key={group.title} className="mb-6">
                <div
                  className="mb-2 px-3 text-[9px] font-bold tracking-[0.16em]"
                  style={{ color: "var(--muted)" }}
                >
                  {group.title}
                </div>

                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = item.label === "Analytics";

                    return (
                      <button
                        key={item.label}
                        onClick={() => router.push(routeMap[item.label])}
                        className="relative flex h-9 w-full items-center gap-3 border px-3 text-left text-[12px] transition-all"
                        style={{
                          background: active
                            ? "var(--card)"
                            : "transparent",
                          borderColor: active
                            ? "var(--border)"
                            : "transparent",
                          color: active ? "var(--ink)" : "var(--muted)",
                        }}
                      >
                        {active && (
                          <span
                            className="absolute left-0 top-0 h-full w-[4px]"
                            style={{ background: "var(--signal)" }}
                          />
                        )}

                        <Icon size={15} strokeWidth={1.8} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* AI STATUS */}
          <div className="border-t p-4" style={{ borderColor: "var(--border)" }}>
            <div
              className="flex items-center gap-2 text-[11px]"
              style={{ color: "var(--verified)" }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: "var(--verified)" }}
              />
              AI Online
            </div>

            <div
              className="mt-1 pl-4 text-[9px]"
              style={{ color: "var(--muted)" }}
            >
              Gemini Intelligence Core
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <section className="min-w-0 flex-1">
          {/* MOBILE HEADER */}
          <div
            className="flex items-center justify-between border-b px-5 py-4 lg:hidden"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-2">
              <Menu size={18} />
              <span className="font-bold tracking-[0.14em]">VELTRIX</span>
            </div>

            <button
              onClick={() =>
                setTheme(theme === "paper" ? "lab" : "paper")
              }
              className="border p-2"
              style={{ borderColor: "var(--border)" }}
            >
              {theme === "paper" ? <Moon size={15} /> : <Sun size={15} />}
            </button>
          </div>

          <div className="mx-auto max-w-[1100px] px-6 py-7 lg:px-8">
            {/* HEADER */}
            <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <div
                  className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em]"
                  style={{ color: "var(--signal)" }}
                >
                  Intelligence / Analytics
                </div>

                <h1 className="text-[28px] font-semibold tracking-[-0.03em]">
                  Analytics
                </h1>

                <p
                  className="mt-1 text-[13px]"
                  style={{ color: "var(--muted)" }}
                >
                  Understand how VELTRIX is performing across analyses.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setTheme(theme === "paper" ? "lab" : "paper")
                  }
                  className="hidden h-[30px] items-center gap-2 border px-3 text-[12px] sm:flex"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--card)",
                  }}
                >
                  {theme === "paper" ? (
                    <>
                      <Moon size={14} />
                      Lab
                    </>
                  ) : (
                    <>
                      <Sun size={14} />
                      Paper
                    </>
                  )}
                </button>

                <button
                  className="flex h-[30px] items-center gap-2 border px-3 text-[12px]"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--card)",
                  }}
                >
                  {range}
                  <ChevronDown size={13} />
                </button>
              </div>
            </div>

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "TOTAL ANALYSES",
                  value: "128",
                  change: "+18.4%",
                },
                {
                  label: "AVG CONFIDENCE",
                  value: "94.7%",
                  change: "+2.1%",
                },
                {
                  label: "PROBLEMS SOLVED",
                  value: "36",
                  change: "+12.5%",
                },
                {
                  label: "TIME SAVED",
                  value: "12.4h",
                  change: "+3.8h",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="border p-4"
                  style={{
                    background: "var(--card)",
                    borderColor: "var(--border)",
                  }}
                >
                  <div
                    className="text-[9px] font-bold tracking-[0.14em]"
                    style={{ color: "var(--muted)" }}
                  >
                    {stat.label}
                  </div>

                  <div
                    className="mt-3 font-mono text-[27px] font-medium tracking-[-0.04em]"
                    style={{ color: "var(--ink)" }}
                  >
                    {stat.value}
                  </div>

                  <div
                    className="mt-2 text-[10px]"
                    style={{ color: "var(--verified)" }}
                  >
                    {stat.change} vs previous period
                  </div>
                </div>
              ))}
            </div>

            {/* ACTIVITY + CATEGORY */}
            <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
              {/* ACTIVITY */}
              <div
                className="border p-5"
                style={{
                  background: "var(--card)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[14px] font-semibold">
                      Analysis Activity
                    </div>
                    <div
                      className="mt-1 text-[11px]"
                      style={{ color: "var(--muted)" }}
                    >
                      Number of investigations completed
                    </div>
                  </div>

                  <BarChart3
                    size={18}
                    style={{ color: "var(--muted)" }}
                  />
                </div>

                <div className="mt-8 flex h-[230px] items-end gap-3 border-b border-l px-3 pb-0 pt-5">
                  {activityData.map((item) => {
                    const height = (item.analyses / maxActivity) * 100;

                    return (
                      <div
                        key={item.day}
                        className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                      >
                        <div
                          className="font-mono text-[9px]"
                          style={{ color: "var(--muted)" }}
                        >
                          {item.analyses}
                        </div>

                        <div
                          className="w-full max-w-[38px] border"
                          style={{
                            height: `${height}%`,
                            minHeight: "8px",
                            background: "var(--sand)",
                            borderColor: "var(--ink)",
                          }}
                        />

                        <div
                          className="translate-y-5 font-mono text-[9px]"
                          style={{ color: "var(--muted)" }}
                        >
                          {item.day}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CATEGORIES */}
              <div
                className="border p-5"
                style={{
                  background: "var(--card)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="text-[14px] font-semibold">
                  Analysis Categories
                </div>

                <div
                  className="mt-1 text-[11px]"
                  style={{ color: "var(--muted)" }}
                >
                  Distribution of investigation types
                </div>

                <div className="mt-7 space-y-5">
                  {categoryData.map((category) => (
                    <div key={category.name}>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-[12px]">
                          {category.name}
                        </span>

                        <span
                          className="font-mono text-[11px]"
                          style={{ color: "var(--muted)" }}
                        >
                          {category.value}%
                        </span>
                      </div>

                      <div
                        className="h-2 w-full"
                        style={{ background: "var(--sand)" }}
                      >
                        <div
                          className="h-full"
                          style={{
                            width: `${category.value}%`,
                            background: "var(--ink)",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className="mt-8 border-t pt-4 text-[10px] leading-5"
                  style={{ borderColor: "var(--border)", color: "var(--muted)" }}
                >
                  Utility and document investigations currently represent the
                  largest share of system usage.
                </div>
              </div>
            </div>

            {/* AI PERFORMANCE */}
            <div
              className="mt-4 border"
              style={{
                background: "var(--card)",
                borderColor: "var(--border)",
              }}
            >
              <div
                className="flex flex-col justify-between gap-3 border-b px-5 py-4 sm:flex-row sm:items-center"
                style={{ borderColor: "var(--border)" }}
              >
                <div>
                  <div className="text-[14px] font-semibold">
                    AI Performance
                  </div>
                  <div
                    className="mt-1 text-[11px]"
                    style={{ color: "var(--muted)" }}
                  >
                    Intelligence pipeline performance indicators
                  </div>
                </div>

                <div
                  className="flex items-center gap-2 text-[10px]"
                  style={{ color: "var(--verified)" }}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: "var(--verified)" }}
                  />
                  System operating normally
                </div>
              </div>

              <div className="grid grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                <div className="p-5">
                  <div
                    className="text-[9px] font-bold tracking-[0.14em]"
                    style={{ color: "var(--muted)" }}
                  >
                    EVIDENCE EXTRACTION
                  </div>

                  <div className="mt-3 font-mono text-[22px]">
                    97.2%
                  </div>

                  <div
                    className="mt-1 text-[10px]"
                    style={{ color: "var(--muted)" }}
                  >
                    Accuracy
                  </div>
                </div>

                <div className="p-5">
                  <div
                    className="text-[9px] font-bold tracking-[0.14em]"
                    style={{ color: "var(--muted)" }}
                  >
                    REASONING
                  </div>

                  <div className="mt-3 font-mono text-[22px]">
                    94.2%
                  </div>

                  <div
                    className="mt-1 text-[10px]"
                    style={{ color: "var(--muted)" }}
                  >
                    Confidence
                  </div>
                </div>

                <div className="p-5">
                  <div
                    className="text-[9px] font-bold tracking-[0.14em]"
                    style={{ color: "var(--muted)" }}
                  >
                    VERIFICATION
                  </div>

                  <div className="mt-3 font-mono text-[22px]">
                    96.8%
                  </div>

                  <div
                    className="mt-1 text-[10px]"
                    style={{ color: "var(--muted)" }}
                  >
                    Success rate
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER PRINCIPLE */}
            <div
              className="mt-4 flex flex-col justify-between gap-3 border p-5 sm:flex-row sm:items-center"
              style={{
                background: "var(--sand)",
                borderColor: "var(--border)",
              }}
            >
              <div>
                <div className="text-[12px] font-semibold">
                  VELTRIX Principle
                </div>

                <div
                  className="mt-1 text-[11px]"
                  style={{ color: "var(--muted)" }}
                >
                  Metrics describe how the intelligence system understands,
                  verifies, and acts.
                </div>
              </div>

              <div
                className="font-mono text-[10px] font-bold tracking-[0.08em]"
                style={{ color: "var(--ink)" }}
              >
                OBSERVE → UNDERSTAND → REASON → VERIFY → ACT
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

