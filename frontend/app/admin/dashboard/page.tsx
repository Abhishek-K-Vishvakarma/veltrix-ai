"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {getDashboard,type DashboardResponse,} from "@/services/admin.service";
import { getUser, logout } from "@/lib/auth";
import { getMe } from "@/services/auth.service";
const navGroups = [
  {
    label: "OVERVIEW",
    items: [
      { label: "Dashboard", icon: "▦", active: true },
    ],
  },
  {
    label: "PLATFORM",
    items: [
      { label: "Users & Access", icon: "♙" },
      { label: "Analyses Monitor", icon: "◉" },
      { label: "Analytics", icon: "▥" },
      { label: "Insights", icon: "◈" },
    ],
  },
  {
    label: "WORKSPACE",
    items: [
      { label: "New Analysis", icon: "＋" },
      { label: "History", icon: "◷" },
    ],
  },
  {
    label: "RESOURCES",
    items: [
      { label: "Knowledge", icon: "⌁" },
      { label: "Documents", icon: "▤" },
      { label: "Projects", icon: "□" },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      { label: "System Health", icon: "⌁" },
      { label: "Settings", icon: "⚙" },
      { label: "Help", icon: "?" },
      { label: "Logs", icon: "▤" },
    ],
  },
];


const routeMap: Record<string, string> = {
  Dashboard: "/admin/dashboard",
  "New Analysis": "/admin/analyses",
  History: "/admin/history",
  "Users & Access": "/admin/users",
  "Analyses Monitor": "/admin/analyses",
  Analytics: "/admin/analytics",
  Knowledge: "/admin/knowledge",
  Projects: "/admin/projects",
  Documents: "/admin/documents",
  "System Health": "/admin/admin/system-matrics",
  Settings: "/admin/settings",
  Help: "/admin/help",
  Logs: "/admin/admin/activity-logs",
};

export default function DashboardPage() {
const [theme, setTheme] = useState<"paper" | "lab">("paper");
const [problem, setProblem] = useState("");
const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [profileOpen, setProfileOpen] = useState(false);

  const user = getUser();
  console.log("user:", user);
  const router = useRouter(); 
  const isLab = theme === "lab";
  const activityPoints = dashboard?.analysis_activity ?? [];



const maxActivity = Math.max( 
  ...activityPoints.map((item) => item.count),
  1
);

const activityPolyline = activityPoints
  .map((item, index) => {
    const x =
      activityPoints.length <= 1
        ? 0
        : (index / (activityPoints.length - 1)) * 700;

    const y = 150 - (item.count / maxActivity) * 125;

    return `${x},${y}`;
  })
  .join(" ");

  const categoryData = dashboard?.categories ?? [];

useEffect(() => {
  async function loadDashboard() {
    try {
      setLoading(true);
      setError(null);

      const data = await getDashboard();
      setDashboard(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }

  loadDashboard();
}, []);
  return (
    <div
      data-theme={theme}
      className="min-h-screen"
      style={{
        background: isLab ? "#F4F7F6" : "#F6F4EE",
        color: isLab ? "#0B1F1C" : "#14130F",
        fontFamily:
          'var(--font-instrument-sans), "Segoe UI", Helvetica, Arial, sans-serif',
      }}
    >
      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <aside
          className="fixed left-0 top-0 z-30 flex h-screen w-[224px] flex-col border-r"
          style={{
            background: isLab ? "#F4F7F6" : "#F6F4EE",
            borderColor: isLab ? "#DCE5E1" : "#E4E0D5",
          }}
        >
          {/* Logo */}
          <div className="flex h-[82px] items-center px-5">
            <div className="flex items-center gap-3">
              <div
                className="relative flex h-9 w-9 items-center justify-center"
                style={{ background: "#14130F" }}
              >
                <span
                  className="text-[21px] font-bold leading-none"
                  style={{ color: "#F6F4EE" }}
                >
                  V
                </span>

                <span
                  className="absolute right-[5px] top-[5px] h-[6px] w-[6px]"
                  style={{
                    border: "1px solid #FF4A1C",
                    background: "#14130F",
                  }}
                />

                <span
                  className="absolute bottom-[5px] right-[5px] h-[5px] w-[5px]"
                  style={{ background: "#FF4A1C" }}
                />
              </div>

              <div>
                <div className="text-[15px] font-bold tracking-[0.12em]">
                  VELTRIX
                </div>
                <div
                  className="mt-[2px] text-[8px] uppercase tracking-[0.12em]"
                  style={{
                    color: isLab ? "#5B706B" : "#6F6A5E",
                  }}
                >
                  Intelligence System
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3">
            {navGroups.map((group) => (
              <div key={group.label} className="mb-7">
                <div
                  className="mb-2 px-3 text-[9px] font-semibold tracking-[0.16em]"
                  style={{
                    color: isLab ? "#5B706B" : "#6F6A5E",
                  }}
                >
                  {group.label}
                </div>

                <div className="space-y-[2px]">
                  {group.items.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => router.push(routeMap[item.label])}
                      className="group relative flex h-9 w-full items-center gap-3 border px-3 text-left text-[12px] transition-all"
                      style={{
                        borderColor: item.active
                          ? isLab
                            ? "#DCE5E1"
                            : "#E4E0D5"
                          : "transparent",
                        background: item.active
                          ? "#FFFFFF"
                          : "transparent",
                        color: item.active
                          ? isLab
                            ? "#0B1F1C"
                            : "#14130F"
                          : isLab
                            ? "#5B706B"
                            : "#6F6A5E",
                      }}
                    >
                      {item.active && (
                        <span
                          className="absolute left-0 top-0 h-full w-[3px]"
                          style={{
                            background: "#FF4A1C",
                          }}
                        />
                      )}

                      <span className="w-4 text-center text-[14px]">
                        {item.icon}
                      </span>

                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* AI Status */}
          <div
            className="mx-3 mb-4 border p-3"
            style={{
              background: "#FFFFFF",
              borderColor: isLab ? "#DCE5E1" : "#E4E0D5",
            }}
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: "#0E7C66" }}
              />
              <span className="text-[11px] font-semibold">AI Online</span>
            </div>

            <div
              className="mt-1 text-[9px]"
              style={{
                color: isLab ? "#5B706B" : "#6F6A5E",
              }}
            >
              Gemini · Multimodal
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="ml-[224px] min-h-screen flex-1">
          <div className="mx-auto max-w-[1100px] px-8 py-[22px]">
            {/* TOP BAR */}
            <header className="mb-9 flex items-center justify-between">
              <div>
                <div
                  className="mb-1 text-[10px] font-medium uppercase tracking-[0.14em]"
                  style={{
                    color: isLab ? "#5B706B" : "#6F6A5E",
                  }}
                >
                  Admin Console
                </div>

                <h1 className="text-[26px] font-semibold tracking-[-0.025em]">
                  Good morning, {user ? (user?.full_name) : 'N/A'}
                </h1>

                <p
                  className="mt-1 text-[13px]"
                  style={{
                    color: isLab ? "#5B706B" : "#6F6A5E",
                  }}
                >
                  Give me the evidence. I&apos;ll show you what to do next.
                </p>
              </div>

              <div className="flex items-center gap-2">
  <button
    onClick={() =>
      setTheme(isLab ? "paper" : "lab")
    }
    className="h-[30px] border px-3 text-[11px] transition-colors"
    style={{
      background: "#FFFFFF",
      borderColor: isLab ? "#DCE5E1" : "#E4E0D5",
    }}
  >
    {isLab ? "Paper" : "Lab"}
  </button>

  <button
    onClick={() => router.push("/admin/analyses")}
    className="h-[30px] border px-3 text-[11px] font-medium"
    style={{
      background: isLab ? "#0F766E" : "#14130F",
      color: "#F6F4EE",
      borderColor: isLab ? "#0F766E" : "#14130F",
    }}
  >
    + New Analysis
  </button>
  <button
   onClick={()=> router.push("/admin/users")}
  className="inline-flex h-[30px] items-center border px-3 text-[12px] font-medium transition hover:opacity-75"
  style={{
      background: isLab ? "#0F766E" : "#14130F",
      color: "#F6F4EE",
      borderColor: isLab ? "#0F766E" : "#14130F",
    }}
>
  + Add User
</button>
  {/* PROFILE */}
  <div className="relative">
    <button
      onClick={() => setProfileOpen((value) => !value)}
      className="flex h-[30px] items-center gap-2 border px-2.5 text-[11px]"
      style={{
        background: "#FFFFFF",
        borderColor: isLab ? "#DCE5E1" : "#E4E0D5",
      }}
    >
      <span
        className="flex h-[20px] w-[20px] items-center justify-center text-[9px] font-semibold"
        style={{
          background: isLab ? "#E8EFEC" : "#EFEBDF",
          color: isLab ? "#0B1F1C" : "#14130F",
        }}
      >
        {(user?.full_name?.charAt(0) || "A").toUpperCase()}
      </span>

      <span className="max-w-[100px] truncate">
        {user?.full_name || "Admin"}
      </span>

      <span className="text-[9px]">
        {profileOpen ? "▲" : "▼"}
      </span>
    </button>

    {profileOpen && (
      <div
        className="absolute right-0 top-[36px] z-50 w-[190px] border"
        style={{
          background: "#FFFFFF",
          borderColor: isLab ? "#DCE5E1" : "#E4E0D5",
        }}
      >
        <div
          className="border-b px-4 py-3"
          style={{
            borderColor: isLab ? "#DCE5E1" : "#E4E0D5",
          }}
        >
          <div className="text-[11px] font-semibold">
            {user?.full_name || "Admin"}
          </div>

          <div
            className="mt-1 truncate text-[9px]"
            style={{
              color: isLab ? "#5B706B" : "#6F6A5E",
            }}
          >
            {user?.email || ""}
          </div>

          <div
            className="mt-1 font-mono text-[8px] uppercase"
            style={{
              color: isLab ? "#0F766E" : "#0E7C66",
            }}
          >
            {user?.role || "admin"}
          </div>
        </div>

        <button
          onClick={() => {
            setProfileOpen(false);
            router.push("/admin/profile");
          }}
          className="flex h-[34px] w-full items-center px-4 text-left text-[10px] transition-colors hover:bg-[#EFEBDF]"
        >
          Profile
        </button>

        <button
          onClick={() => {
            setProfileOpen(false);
            logout();
          }}
          className="flex h-[34px] w-full items-center border-t px-4 text-left text-[10px] transition-colors hover:bg-[#EFEBDF]"
          style={{
            borderColor: isLab ? "#DCE5E1" : "#E4E0D5",
            color: "#FF4A1C",
          }}
        >
          Logout
        </button>
      </div>
    )}
  </div>
</div>
            </header>

            {/* ANALYSIS INPUT */}
            <section
              className="mb-7 border"
              style={{
                background: "#FFFFFF",
                borderColor: isLab ? "#DCE5E1" : "#E4E0D5",
              }}
            >
              <div className="border-b px-5 py-4"
                style={{
                  borderColor: isLab ? "#DCE5E1" : "#E4E0D5",
                }}
              >
                <div className="text-[13px] font-semibold">
                  What are you trying to solve?
                </div>

                <div
                  className="mt-1 text-[10px]"
                  style={{
                    color: isLab ? "#5B706B" : "#6F6A5E",
                  }}
                >
                  Describe the problem or provide evidence to investigate.
                </div>
              </div>

              <div className="p-5">
                <textarea
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder="Example: Why is my electricity bill higher this month?"
                  className="h-[105px] w-full resize-none border p-4 text-[13px] outline-none"
                  style={{
                    borderColor: isLab ? "#DCE5E1" : "#E4E0D5",
                    color: isLab ? "#0B1F1C" : "#14130F",
                  }}
                />

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex gap-2">
                    {["Upload", "Image", "File"].map((item) => (
                      <button
                        key={item}
                        className="h-[30px] border px-3 text-[11px]"
                        style={{
                          background: "#FFFFFF",
                          borderColor: isLab ? "#DCE5E1" : "#E4E0D5",
                        }}
                      >
                        + {item}
                      </button>
                    ))}
                  </div>

                 <button
  onClick={() => {
    if (!problem.trim()) return;

    sessionStorage.setItem("veltrix-analysis-problem", problem.trim());
    router.push("/admin/analyses");
  }}
  disabled={!problem.trim()}
  className="h-[30px] px-4 text-[11px] font-semibold disabled:cursor-not-allowed disabled:opacity-50"
  style={{
    background: isLab ? "#0F766E" : "#14130F",
    color: "#F6F4EE",
  }}
>
  Analyze →
</button>
                </div>
              </div>
            </section>

            {/* STATS */}
            <section className="mb-7 grid grid-cols-4 gap-3">
              {[
  [
    dashboard ? String(dashboard.analyses.total) : "—",
    "Analyses",
  ],
  [
    dashboard ? `${dashboard.avg_confidence}%` : "—",
    "Avg Confidence",
  ],
  [
    dashboard ? String(dashboard.analyses.completed) : "—",
    "Problems Solved",
  ],
  [
    dashboard
      ? `${dashboard.estimated_time_saved_hours}h`
      : "—",
    "Time Saved",
  ],
].map(([value, label]) => (
                <div
                  key={label}
                  className="border p-4"
                  style={{
                    background: "#FFFFFF",
                    borderColor: isLab ? "#DCE5E1" : "#E4E0D5",
                  }}
                >
                  <div
                    className="font-mono text-[22px] font-medium tracking-[-0.02em]"
                    style={{
                      fontFamily:
                        "var(--font-jetbrains-mono), monospace",
                    }}
                  >
                    {value}
                  </div>

                  <div
                    className="mt-1 text-[10px]"
                    style={{
                      color: isLab ? "#5B706B" : "#6F6A5E",
                    }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </section>

            {/* TWO COLUMN */}
            <div className="grid grid-cols-[1.5fr_1fr] gap-5">
              {/* ACTIVITY */}
              <section
                className="border"
                style={{
                  background: "#FFFFFF",
                  borderColor: isLab ? "#DCE5E1" : "#E4E0D5",
                }}
              >
                <div
                  className="flex items-center justify-between border-b px-5 py-4"
                  style={{
                    borderColor: isLab ? "#DCE5E1" : "#E4E0D5",
                  }}
                >
                  <div>
                    <div className="text-[13px] font-semibold">
                      Intelligence Activity
                    </div>
                    <div
                      className="mt-1 text-[10px]"
                      style={{
                        color: isLab ? "#5B706B" : "#6F6A5E",
                      }}
                    >
                      Analyses completed over the last 7 days
                    </div>
                  </div>

                  <div
                    className="font-mono text-[11px]"
                    style={{
                      color: "#0E7C66",
                      fontFamily:
                        "var(--font-jetbrains-mono), monospace",
                    }}
                  >
                    +18.4%
                  </div>
                </div>

                <div className="px-5 pb-5 pt-6">
                  <svg
                    viewBox="0 0 700 180"
                    className="h-[180px] w-full"
                    preserveAspectRatio="none"
                  >
                    <line
                      x1="0"
                      y1="145"
                      x2="700"
                      y2="145"
                      stroke="#E4E0D5"
                    />
                    <line
                      x1="0"
                      y1="100"
                      x2="700"
                      y2="100"
                      stroke="#E4E0D5"
                    />
                    <line
                      x1="0"
                      y1="55"
                      x2="700"
                      y2="55"
                      stroke="#E4E0D5"
                    />

                    <polyline
                      fill="none"
                      stroke="#14130F"
                      strokeWidth="2"
                      points={activityPolyline}
                    />

                    <polyline
                      fill="none"
                      stroke="#FF4A1C"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      points="0,150 100,137 200,142 300,119 400,127 500,105 600,112 700,95"
                    />

                    {activityPoints.map((item, index) => {
  const cx =
    activityPoints.length <= 1
      ? 0
      : (index / (activityPoints.length - 1)) * 700;

  const cy = 150 - (item.count / maxActivity) * 125;

  return (
    <circle
      key={index}
      cx={cx}
      cy={cy}
      r="3"
      fill="#14130F"
    />
  );
})}
                  </svg>

                  <div className="mt-2 flex justify-between">
                    {dashboard?.analysis_activity?.map((item) => {
  const date = new Date(`${item.date}T00:00:00`);

  const label = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <span
      key={item.date}
      className="text-[9px]"
      style={{
        color: isLab ? "#5B706B" : "#6F6A5E",
      }}
    >
      {label}
    </span>
  );
})}
                  </div>
                </div>
              </section>

              {/* CATEGORIES */}
              <section
                className="border"
                style={{
                  background: "#FFFFFF",
                  borderColor: isLab ? "#DCE5E1" : "#E4E0D5",
                }}
              >
                <div
                  className="border-b px-5 py-4"
                  style={{
                    borderColor: isLab ? "#DCE5E1" : "#E4E0D5",
                  }}
                >
                  <div className="text-[13px] font-semibold">
                    Analysis Categories
                  </div>

                  <div
                    className="mt-1 text-[10px]"
                    style={{
                      color: isLab ? "#5B706B" : "#6F6A5E",
                    }}
                  >
                    Distribution of investigations
                  </div>
                </div>

                <div className="p-5">
{categoryData.length > 0 ? (
  categoryData.map((category) => (
    <div key={category.name} className="mb-5 last:mb-0">
      <div className="mb-2 flex justify-between">
        <span className="text-[11px]">
          {category.name}
        </span>

        <span
          className="font-mono text-[10px]"
          style={{
            fontFamily:
              "var(--font-jetbrains-mono), monospace",
          }}
        >
          {category.value}%
        </span>
      </div>

      <div
        className="h-[5px] w-full"
        style={{
          background: isLab ? "#E8EFEC" : "#EFEBDF",
        }}
      >
        <div
          className="h-full"
          style={{
            width: `${category.value}%`,
            background:
              category.name === "Utilities"
                ? "#FF4A1C"
                : isLab
                  ? "#0F766E"
                  : "#14130F",
          }}
        />
      </div>
    </div>
  ))
) : (
  <div
    className="py-8 text-center text-[11px]"
    style={{
      color: isLab ? "#5B706B" : "#6F6A5E",
    }}
  >
    No analysis categories yet.
  </div>
)}
                </div>
              </section>
            </div>

            {/* RECENT */}
            <section
              className="mt-5 border"
              style={{
                background: "#FFFFFF",
                borderColor: isLab ? "#DCE5E1" : "#E4E0D5",
              }}
            >
              <div
                className="flex items-center justify-between border-b px-5 py-4"
                style={{
                  borderColor: isLab ? "#DCE5E1" : "#E4E0D5",
                }}
              >
                <div>
                  <div className="text-[13px] font-semibold">
                    Recent Intelligence
                  </div>

                  <div
                    className="mt-1 text-[10px]"
                    style={{
                      color: isLab ? "#5B706B" : "#6F6A5E",
                    }}
                  >
                    Latest completed investigations
                  </div>
                </div>

                <button
                  className="text-[10px] underline underline-offset-4"
                  style={{
                    color: isLab ? "#5B706B" : "#6F6A5E",
                  }}
                >
                  View all →
                </button>
              </div>

              <div>
                {dashboard?.recent_analyses?.length ? (
  dashboard.recent_analyses.map((analysis) => (
    <div
      key={analysis.title}
      className="grid grid-cols-[1.5fr_0.8fr_1fr_0.7fr_0.7fr] items-center border-b px-5 py-4 last:border-b-0"
      style={{
        borderColor: isLab ? "#DCE5E1" : "#E4E0D5",
      }}
    >
      <div>
        <div className="text-[12px] font-semibold">
          {analysis.title}
        </div>

        <div
          className="mt-1 text-[9px]"
          style={{
            color: isLab ? "#5B706B" : "#6F6A5E",
          }}
        >
          {analysis.date}
        </div>
      </div>

      <div
        className="font-mono text-[9px]"
        style={{
          color: isLab ? "#5B706B" : "#6F6A5E",
          fontFamily:
            "var(--font-jetbrains-mono), monospace",
        }}
      >
        {analysis.type}
      </div>

      <div className="font-mono text-[11px]">
        {analysis.confidence}%
      </div>

      <div>
        <span
          className="inline-flex items-center gap-1 text-[9px]"
          style={{
            color: "#0E7C66",
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#0E7C66]" />
          {analysis.status}
        </span>
      </div>

      <button
        className="justify-self-end text-[11px]"
        style={{
          color: isLab ? "#5B706B" : "#6F6A5E",
        }}
      >
        →
      </button>
    </div>
  ))
) : (
  <div
    className="px-5 py-8 text-center text-[11px]"
    style={{
      color: isLab ? "#5B706B" : "#6F6A5E",
    }}
  >
    No completed analyses yet.
  </div>
)}
              </div>
            </section>

            {/* FOOTER */}
            <footer
              className="mt-8 flex items-center justify-between border-t pt-4 text-[9px]"
              style={{
                borderColor: isLab ? "#DCE5E1" : "#E4E0D5",
                color: isLab ? "#5B706B" : "#6F6A5E",
              }}
            >
              <span>VELTRIX Intelligence System</span>
              <span
                className="font-mono"
                style={{
                  fontFamily: "var(--font-jetbrains-mono), monospace",
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