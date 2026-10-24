"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  BarChart3,
  ChevronDown,
  FileText,
  Lightbulb,
  Menu,
  Moon,
  Plus,
  Settings,
  ShieldCheck,
  Sun,
  Trash2,
  Upload,
  Users,
  Zap,
} from "lucide-react";

type Theme = "paper" | "lab";

const navGroups = [
  {
    title: "OVERVIEW",
    items: [
      { label: "Dashboard", icon: BarChart3 },
    ],
  },
  {
    title: "PLATFORM",
    items: [
      { label: "Users & Access", icon: Users },
      { label: "Analyses Monitor", icon: FileText },
      { label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    title: "WORKSPACE",
    items: [
      { label: "New Analysis", icon: Zap },
      { label: "History", icon: FileText },
    ],
  },
  {
    title: "RESOURCES",
    items: [
      { label: "Knowledge", icon: ShieldCheck },
      { label: "Documents", icon: FileText },
      { label: "Projects", icon: FileText },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { label: "System Health", icon: ShieldCheck },
      { label: "Settings", icon: Settings },
      { label: "Help", icon: Users },
      { label: "Logs", icon: FileText },
    ],
  },
];

const routeMap: Record<string, string> = {
  Dashboard: "/admin/dashboard",
  "New Analysis": "/admin/analyses",
  History: "/admin/history",
  Insights: "/admin/insights",
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

const knowledgeSources = [
  {
    id: 1,
    name: "Electricity Tariff Rules",
    type: "PDF",
    category: "UTILITY",
    chunks: 184,
    updated: "Today",
    status: "Indexed",
  },
  {
    id: 2,
    name: "VELTRIX Reasoning Guidelines",
    type: "DOCUMENT",
    category: "SYSTEM",
    chunks: 96,
    updated: "Yesterday",
    status: "Indexed",
  },
  {
    id: 3,
    name: "Device Inspection Manual",
    type: "PDF",
    category: "VISUAL",
    chunks: 241,
    updated: "3 days ago",
    status: "Indexed",
  },
  {
    id: 4,
    name: "General Problem Solving Knowledge",
    type: "DOCUMENT",
    category: "GENERAL",
    chunks: 327,
    updated: "5 days ago",
    status: "Indexed",
  },
];

export default function KnowledgePage() {
  const router = useRouter();
  const [theme, setTheme] = useState<Theme>("paper");
  const [filter, setFilter] = useState("All");

  const filteredSources =
    filter === "All"
      ? knowledgeSources
      : knowledgeSources.filter((source) => source.category === filter);

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
          {/* LOGO */}
          <div className="px-5 py-5">
            <button
              onClick={() => router.push("/admin/dashboard")}
              className="flex items-center gap-3 text-left"
            >
              <div
                className="relative flex h-9 w-9 items-center justify-center"
                style={{ background: "var(--ink)" }}
              >
                <span
                  className="absolute left-[8px] top-[9px] h-[14px] w-[7px] border-b-2 border-l-2"
                  style={{ borderColor: "var(--card)" }}
                />

                <span
                  className="absolute right-[8px] top-[9px] h-[14px] w-[7px] border-b-2 border-r-2"
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
                    const active = item.label === "Knowledge";

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
          <div
            className="border-t p-4"
            style={{ borderColor: "var(--border)" }}
          >
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

              <span className="font-bold tracking-[0.14em]">
                VELTRIX
              </span>
            </div>

            <button
              onClick={() =>
                setTheme(theme === "paper" ? "lab" : "paper")
              }
              className="border p-2"
              style={{ borderColor: "var(--border)" }}
            >
              {theme === "paper" ? (
                <Moon size={15} />
              ) : (
                <Sun size={15} />
              )}
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
                  Intelligence / Knowledge
                </div>

                <h1 className="text-[28px] font-semibold tracking-[-0.03em]">
                  Knowledge
                </h1>

                <p
                  className="mt-1 text-[13px]"
                  style={{ color: "var(--muted)" }}
                >
                  Manage the knowledge sources used by VELTRIX.
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
                    background: "var(--ink)",
                    borderColor: "var(--ink)",
                    color: "var(--primary-text)",
                  }}
                >
                  <Plus size={14} />
                  Add Knowledge
                </button>
              </div>
            </div>

            {/* SUMMARY */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div
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
                  SOURCES
                </div>

                <div className="mt-3 font-mono text-[27px]">
                  24
                </div>

                <div
                  className="mt-1 text-[10px]"
                  style={{ color: "var(--muted)" }}
                >
                  Knowledge documents
                </div>
              </div>

              <div
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
                  INDEXED CHUNKS
                </div>

                <div className="mt-3 font-mono text-[27px]">
                  1,842
                </div>

                <div
                  className="mt-1 text-[10px]"
                  style={{ color: "var(--verified)" }}
                >
                  Vector search ready
                </div>
              </div>

              <div
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
                  EMBEDDING MODEL
                </div>

                <div className="mt-3 text-[15px] font-semibold">
                  MiniLM
                </div>

                <div
                  className="mt-1 text-[10px]"
                  style={{ color: "var(--muted)" }}
                >
                  all-MiniLM-L6-v2
                </div>
              </div>
            </div>

            {/* KNOWLEDGE BASE */}
            <div
              className="mt-5 border"
              style={{
                background: "var(--card)",
                borderColor: "var(--border)",
              }}
            >
              {/* TOOLBAR */}
              <div
                className="flex flex-col justify-between gap-4 border-b p-5 sm:flex-row sm:items-center"
                style={{ borderColor: "var(--border)" }}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <BookOpen size={17} />

                    <span className="text-[14px] font-semibold">
                      Knowledge Sources
                    </span>
                  </div>

                  <div
                    className="mt-1 text-[11px]"
                    style={{ color: "var(--muted)" }}
                  >
                    Documents available to the intelligence pipeline.
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {["All", "UTILITY", "DOCUMENT", "VISUAL", "GENERAL"].map(
                    (item) => (
                      <button
                        key={item}
                        onClick={() => setFilter(item)}
                        className="h-[28px] border px-3 text-[10px]"
                        style={{
                          background:
                            filter === item
                              ? "var(--ink)"
                              : "var(--card)",
                          color:
                            filter === item
                              ? "var(--primary-text)"
                              : "var(--muted)",
                          borderColor:
                            filter === item
                              ? "var(--ink)"
                              : "var(--border)",
                        }}
                      >
                        {item}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse">
                  <thead>
                    <tr
                      className="border-b text-left"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <th
                        className="px-5 py-3 text-[9px] font-bold tracking-[0.14em]"
                        style={{ color: "var(--muted)" }}
                      >
                        SOURCE
                      </th>

                      <th
                        className="px-4 py-3 text-[9px] font-bold tracking-[0.14em]"
                        style={{ color: "var(--muted)" }}
                      >
                        TYPE
                      </th>

                      <th
                        className="px-4 py-3 text-[9px] font-bold tracking-[0.14em]"
                        style={{ color: "var(--muted)" }}
                      >
                        CATEGORY
                      </th>

                      <th
                        className="px-4 py-3 text-[9px] font-bold tracking-[0.14em]"
                        style={{ color: "var(--muted)" }}
                      >
                        CHUNKS
                      </th>

                      <th
                        className="px-4 py-3 text-[9px] font-bold tracking-[0.14em]"
                        style={{ color: "var(--muted)" }}
                      >
                        UPDATED
                      </th>

                      <th className="px-4 py-3" />
                    </tr>
                  </thead>

                  <tbody>
                    {filteredSources.map((source) => (
                      <tr
                        key={source.id}
                        className="border-b last:border-b-0"
                        style={{ borderColor: "var(--border)" }}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-8 w-8 items-center justify-center border"
                              style={{
                                background: "var(--sand)",
                                borderColor: "var(--border)",
                              }}
                            >
                              <FileText size={14} />
                            </div>

                            <div>
                              <div className="text-[12px] font-medium">
                                {source.name}
                              </div>

                              <div
                                className="mt-0.5 text-[9px]"
                                style={{ color: "var(--muted)" }}
                              >
                                Knowledge source #{source.id
                                  .toString()
                                  .padStart(3, "0")}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td
                          className="px-4 py-4 font-mono text-[10px]"
                          style={{ color: "var(--muted)" }}
                        >
                          {source.type}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className="border px-2 py-1 text-[9px] font-bold tracking-[0.08em]"
                            style={{
                              borderColor: "var(--border)",
                              color: "var(--muted)",
                            }}
                          >
                            {source.category}
                          </span>
                        </td>

                        <td className="px-4 py-4 font-mono text-[11px]">
                          {source.chunks}
                        </td>

                        <td
                          className="px-4 py-4 text-[11px]"
                          style={{ color: "var(--muted)" }}
                        >
                          {source.updated}
                        </td>

                        <td className="px-4 py-4">
                          <button
                            onClick={() =>
                              console.log(
                                "Delete knowledge source:",
                                source.id,
                              )
                            }
                            className="border p-2"
                            style={{
                              borderColor: "var(--border)",
                              color: "var(--muted)",
                            }}
                            title="Delete source"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RAG STATUS */}
            <div
              className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2"
            >
              <div
                className="border p-5"
                style={{
                  background: "var(--card)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center"
                    style={{ background: "var(--sand)" }}
                  >
                    <ShieldCheck size={17} />
                  </div>

                  <div>
                    <div className="text-[13px] font-semibold">
                      Vector Index
                    </div>

                    <div
                      className="mt-1 text-[10px]"
                      style={{ color: "var(--muted)" }}
                    >
                      ChromaDB knowledge retrieval
                    </div>
                  </div>
                </div>

                <div
                  className="mt-5 flex items-center gap-2 text-[10px]"
                  style={{ color: "var(--verified)" }}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: "var(--verified)" }}
                  />
                  Index healthy
                </div>
              </div>

              <div
                className="border p-5"
                style={{
                  background: "var(--sand)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="flex items-center gap-3">
                  <Upload size={17} />

                  <div>
                    <div className="text-[13px] font-semibold">
                      Add Evidence
                    </div>

                    <div
                      className="mt-1 text-[10px]"
                      style={{ color: "var(--muted)" }}
                    >
                      Upload PDF, DOCX, CSV or other supported sources.
                    </div>
                  </div>
                </div>

                <button
                  className="mt-5 flex h-[30px] items-center gap-2 border px-3 text-[11px]"
                  style={{
                    background: "var(--card)",
                    borderColor: "var(--border)",
                  }}
                >
                  <Plus size={13} />
                  Upload Source
                </button>
              </div>
            </div>

            {/* PRINCIPLE */}
            <div
              className="mt-4 flex flex-col justify-between gap-3 border p-5 sm:flex-row sm:items-center"
              style={{
                background: "var(--sand)",
                borderColor: "var(--border)",
              }}
            >
              <div>
                <div className="text-[12px] font-semibold">
                  VELTRIX Knowledge Layer
                </div>

                <div
                  className="mt-1 text-[11px]"
                  style={{ color: "var(--muted)" }}
                >
                  Retrieve evidence first. Reason over grounded knowledge.
                </div>
              </div>

              <div
                className="font-mono text-[10px] font-bold tracking-[0.08em]"
                style={{ color: "var(--ink)" }}
              >
                EVIDENCE → RETRIEVE → REASON
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}