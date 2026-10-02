"use client";

import { useRouter } from "next/navigation";

const insights = [
  {
    number: "01",
    title: "Electricity consumption increased",
    description:
      "Recent analysis detected a 220-unit increase compared with the previous reading.",
    confidence: "94.2%",
    category: "UTILITY",
  },
  {
    number: "02",
    title: "Repeated document patterns detected",
    description:
      "Several analysed documents contain recurring clauses and operational patterns.",
    confidence: "91.8%",
    category: "DOCUMENT",
  },
  {
    number: "03",
    title: "Visual evidence requires verification",
    description:
      "The system identified visual indicators that should be manually verified before action.",
    confidence: "88.6%",
    category: "VISUAL",
  },
];

export default function InsightsPage() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen"
      style={{
        background: "#F6F4EE",
        color: "#14130F",
        fontFamily:
          'var(--font-instrument-sans), "Segoe UI", Helvetica, Arial, sans-serif',
      }}
    >
      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <aside
          className="fixed left-0 top-0 z-30 flex h-screen w-[224px] flex-col border-r"
          style={{
            background: "#F6F4EE",
            borderColor: "#E4E0D5",
          }}
        >
          <div className="flex h-[82px] items-center px-5">
            <button
              onClick={() => router.push("/admin/dashboard")}
              className="flex items-center gap-3"
            >
              <div
                className="relative flex h-9 w-9 items-center justify-center"
                style={{ background: "#14130F" }}
              >
                <span
                  className="text-[21px] font-bold"
                  style={{ color: "#F6F4EE" }}
                >
                  V
                </span>

                <span
                  className="absolute right-[5px] top-[5px] h-[6px] w-[6px]"
                  style={{
                    border: "1px solid #FF4A1C",
                  }}
                />

                <span
                  className="absolute bottom-[5px] right-[5px] h-[5px] w-[5px]"
                  style={{ background: "#FF4A1C" }}
                />
              </div>

              <div className="text-left">
                <div className="text-[15px] font-bold tracking-[0.12em]">
                  VELTRIX
                </div>

                <div
                  className="mt-[2px] text-[8px] uppercase tracking-[0.12em]"
                  style={{ color: "#6F6A5E" }}
                >
                  Intelligence System
                </div>
              </div>
            </button>
          </div>

          <nav className="flex-1 px-3">
            <NavGroup
              label="WORKSPACE"
              items={[
                ["Dashboard", "/admin/dashboard"],
                ["New Analysis", "/admin/analyses"],
                ["History", "/admin/history"],
              ]}
              router={router}
            />

            <NavGroup
              label="INTELLIGENCE"
              items={[
                ["Insights", "/admin/insights"],
                ["Analytics", "/admin/analytics"],
                ["Knowledge", "/admin/knowledge"],
              ]}
              active="Insights"
              router={router}
            />

            <NavGroup
              label="LIBRARY"
              items={[
                ["Projects", "/admin/projects"],
                ["Documents", "/admin/documents"],
              ]}
              router={router}
            />

            <NavGroup
              label="SYSTEM"
              items={[
                ["Settings", "/admin/settings"],
                ["Help", "/admin/help"],
              ]}
              router={router}
            />
          </nav>

          <div
            className="mx-3 mb-4 border p-3"
            style={{
              background: "#FFFFFF",
              borderColor: "#E4E0D5",
            }}
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: "#0E7C66" }}
              />

              <span className="text-[11px] font-semibold">
                AI Online
              </span>
            </div>

            <div
              className="mt-1 text-[9px]"
              style={{ color: "#6F6A5E" }}
            >
              Gemini · Multimodal
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="ml-[224px] min-h-screen flex-1">
          <div className="mx-auto max-w-[1100px] px-8 py-[22px]">
            {/* HEADER */}
            <header className="mb-8 flex items-end justify-between">
              <div>
                <div
                  className="mb-1 text-[10px] font-medium uppercase tracking-[0.14em]"
                  style={{ color: "#6F6A5E" }}
                >
                  Intelligence
                </div>

                <h1 className="text-[27px] font-semibold tracking-[-0.025em]">
                  Insights
                </h1>

                <p
                  className="mt-1 text-[13px]"
                  style={{ color: "#6F6A5E" }}
                >
                  Patterns and observations extracted from your investigations.
                </p>
              </div>

              <button
                onClick={() => router.push("/admin/analyses")}
                className="h-[30px] px-4 text-[11px] font-medium"
                style={{
                  background: "#14130F",
                  color: "#F6F4EE",
                }}
              >
                + New Analysis
              </button>
            </header>

            {/* SUMMARY */}
            <section className="mb-5 grid grid-cols-3 gap-3">
              {[
                ["36", "Problems Solved"],
                ["94.7%", "Average Confidence"],
                ["18", "Actionable Insights"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="border p-4"
                  style={{
                    background: "#FFFFFF",
                    borderColor: "#E4E0D5",
                  }}
                >
                  <div
                    className="font-mono text-[22px]"
                    style={{
                      fontFamily:
                        "var(--font-jetbrains-mono), monospace",
                    }}
                  >
                    {value}
                  </div>

                  <div
                    className="mt-1 text-[10px]"
                    style={{ color: "#6F6A5E" }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </section>

            {/* INSIGHT LIST */}
            <section
              className="border"
              style={{
                background: "#FFFFFF",
                borderColor: "#E4E0D5",
              }}
            >
              <div
                className="border-b px-5 py-4"
                style={{ borderColor: "#E4E0D5" }}
              >
                <div className="text-[13px] font-semibold">
                  Detected Intelligence
                </div>

                <div
                  className="mt-1 text-[10px]"
                  style={{ color: "#6F6A5E" }}
                >
                  Evidence-backed observations from recent analyses.
                </div>
              </div>

              <div>
                {insights.map((insight) => (
                  <div
                    key={insight.number}
                    className="grid grid-cols-[50px_1fr_110px_80px] gap-5 border-b px-5 py-5 last:border-b-0"
                    style={{ borderColor: "#E4E0D5" }}
                  >
                    <div
                      className="font-mono text-[10px]"
                      style={{
                        color: "#FF4A1C",
                        fontFamily:
                          "var(--font-jetbrains-mono), monospace",
                      }}
                    >
                      {insight.number}
                    </div>

                    <div>
                      <div className="text-[12px] font-semibold">
                        {insight.title}
                      </div>

                      <p
                        className="mt-2 max-w-[600px] text-[11px] leading-[1.6]"
                        style={{ color: "#6F6A5E" }}
                      >
                        {insight.description}
                      </p>
                    </div>

                    <div>
                      <div
                        className="font-mono text-[11px]"
                        style={{
                          fontFamily:
                            "var(--font-jetbrains-mono), monospace",
                        }}
                      >
                        {insight.confidence}
                      </div>

                      <div
                        className="mt-1 text-[8px] uppercase tracking-[0.08em]"
                        style={{ color: "#6F6A5E" }}
                      >
                        confidence
                      </div>
                    </div>

                    <div
                      className="font-mono text-[9px]"
                      style={{
                        color: "#6F6A5E",
                        fontFamily:
                          "var(--font-jetbrains-mono), monospace",
                      }}
                    >
                      {insight.category}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* PRINCIPLE */}
            <section
              className="mt-5 border p-5"
              style={{
                background: "#14130F",
                borderColor: "#14130F",
                color: "#F6F4EE",
              }}
            >
              <div
                className="text-[9px] uppercase tracking-[0.14em]"
                style={{ color: "#FF4A1C" }}
              >
                VELTRIX Principle
              </div>

              <div className="mt-3 text-[20px] font-medium tracking-[-0.02em]">
                Don&apos;t just answer.
                <br />
                Understand the problem and produce an actionable solution.
              </div>

              <div
                className="mt-4 font-mono text-[9px]"
                style={{
                  color: "#B8B3A8",
                  fontFamily:
                    "var(--font-jetbrains-mono), monospace",
                }}
              >
                OBSERVE → UNDERSTAND → REASON → VERIFY → ACT
              </div>
            </section>

            <footer
              className="mt-8 flex items-center justify-between border-t pt-4 text-[9px]"
              style={{
                borderColor: "#E4E0D5",
                color: "#6F6A5E",
              }}
            >
              <span>VELTRIX Intelligence System</span>

              <span
                className="font-mono"
                style={{
                  fontFamily:
                    "var(--font-jetbrains-mono), monospace",
                }}
              >
                v0.1.0 · ADMIN
              </span>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

function NavGroup({
  label,
  items,
  active,
  router,
}: {
  label: string;
  items: [string, string][];
  active?: string;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <div className="mb-7">
      <div
        className="mb-2 px-3 text-[9px] font-semibold tracking-[0.16em]"
        style={{ color: "#6F6A5E" }}
      >
        {label}
      </div>

      <div className="space-y-[2px]">
        {items.map(([name, path]) => {
          const isActive = active === name;

          return (
            <button
              key={name}
              onClick={() => router.push(path)}
              className="relative flex h-9 w-full items-center gap-3 border px-3 text-left text-[12px]"
              style={{
                background: isActive ? "#FFFFFF" : "transparent",
                borderColor: isActive
                  ? "#E4E0D5"
                  : "transparent",
                color: isActive ? "#14130F" : "#6F6A5E",
              }}
            >
              {isActive && (
                <span
                  className="absolute left-0 top-0 h-full w-[3px]"
                  style={{ background: "#FF4A1C" }}
                />
              )}

              <span className="w-4 text-center text-[13px]">
                {getIcon(name)}
              </span>

              <span>{name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function getIcon(name: string) {
  const icons: Record<string, string> = {
    Dashboard: "▦",
    "New Analysis": "＋",
    History: "◷",
    Insights: "◇",
    Analytics: "▥",
    Knowledge: "⌁",
    Projects: "□",
    Documents: "▤",
    Settings: "⚙",
    Help: "?",
  };

  return icons[name] ?? "·";
}