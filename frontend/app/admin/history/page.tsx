"use client";

import { useRouter } from "next/navigation";

const analyses = [
  {
    title: "Electricity Bill",
    type: "UTILITY",
    date: "Oct 02, 2026 · 04:32 PM",
    confidence: "94.2%",
    status: "Verified",
  },
  {
    title: "Contract Analysis",
    type: "DOCUMENT",
    date: "Oct 01, 2026 · 11:18 AM",
    confidence: "91.8%",
    status: "Verified",
  },
  {
    title: "Device Inspection",
    type: "VISUAL",
    date: "Sep 28, 2026 · 02:45 PM",
    confidence: "96.1%",
    status: "Verified",
  },
  {
    title: "Monthly Expense Review",
    type: "DOCUMENT",
    date: "Sep 26, 2026 · 06:12 PM",
    confidence: "89.7%",
    status: "Verified",
  },
  {
    title: "Power Consumption",
    type: "UTILITY",
    date: "Sep 24, 2026 · 03:08 PM",
    confidence: "93.4%",
    status: "Verified",
  },
];

export default function HistoryPage() {
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
              active="History"
              router={router}
            />

            <NavGroup
              label="INTELLIGENCE"
              items={[
                ["Insights", "/admin/insights"],
                ["Analytics", "/admin/analytics"],
                ["Knowledge", "/admin/knowledge"],
              ]}
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
                  Workspace
                </div>

                <h1 className="text-[27px] font-semibold tracking-[-0.025em]">
                  History
                </h1>

                <p
                  className="mt-1 text-[13px]"
                  style={{ color: "#6F6A5E" }}
                >
                  Review previous investigations and intelligence results.
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

            {/* FILTER BAR */}
            <section
              className="mb-5 flex items-center justify-between border p-3"
              style={{
                background: "#FFFFFF",
                borderColor: "#E4E0D5",
              }}
            >
              <div className="flex gap-2">
                {["All", "Visual", "Document", "Utility"].map(
                  (filter, index) => (
                    <button
                      key={filter}
                      className="h-[28px] border px-3 text-[10px]"
                      style={{
                        background:
                          index === 0 ? "#14130F" : "#FFFFFF",
                        color:
                          index === 0 ? "#F6F4EE" : "#6F6A5E",
                        borderColor:
                          index === 0 ? "#14130F" : "#E4E0D5",
                      }}
                    >
                      {filter}
                    </button>
                  )
                )}
              </div>

              <div
                className="text-[10px]"
                style={{ color: "#6F6A5E" }}
              >
                {analyses.length} investigations
              </div>
            </section>

            {/* HISTORY TABLE */}
            <section
              className="border"
              style={{
                background: "#FFFFFF",
                borderColor: "#E4E0D5",
              }}
            >
              {/* TABLE HEADER */}
              <div
                className="grid grid-cols-[1.7fr_0.7fr_1.2fr_0.7fr_0.8fr_30px] border-b px-5 py-3"
                style={{ borderColor: "#E4E0D5" }}
              >
                {[
                  "Investigation",
                  "Type",
                  "Date",
                  "Confidence",
                  "Status",
                  "",
                ].map((heading) => (
                  <div
                    key={heading}
                    className="text-[9px] font-semibold uppercase tracking-[0.08em]"
                    style={{ color: "#6F6A5E" }}
                  >
                    {heading}
                  </div>
                ))}
              </div>

              {/* ROWS */}
              {analyses.map((analysis) => (
                <button
                  key={`${analysis.title}-${analysis.date}`}
                  onClick={() =>
                    console.log("Open analysis:", analysis.title)
                  }
                  className="grid w-full grid-cols-[1.7fr_0.7fr_1.2fr_0.7fr_0.8fr_30px] items-center border-b px-5 py-4 text-left last:border-b-0 hover:bg-[#F6F4EE]"
                  style={{ borderColor: "#E4E0D5" }}
                >
                  <div>
                    <div className="text-[12px] font-semibold">
                      {analysis.title}
                    </div>

                    <div
                      className="mt-1 text-[9px]"
                      style={{ color: "#6F6A5E" }}
                    >
                      Intelligence analysis
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
                    {analysis.type}
                  </div>

                  <div
                    className="text-[10px]"
                    style={{ color: "#6F6A5E" }}
                  >
                    {analysis.date}
                  </div>

                  <div
                    className="font-mono text-[10px]"
                    style={{
                      fontFamily:
                        "var(--font-jetbrains-mono), monospace",
                    }}
                  >
                    {analysis.confidence}
                  </div>

                  <div
                    className="flex items-center gap-1 text-[9px]"
                    style={{ color: "#0E7C66" }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: "#0E7C66" }}
                    />
                    {analysis.status}
                  </div>

                  <div
                    className="text-right text-[12px]"
                    style={{ color: "#6F6A5E" }}
                  >
                    →
                  </div>
                </button>
              ))}
            </section>

            {/* FOOTER */}
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