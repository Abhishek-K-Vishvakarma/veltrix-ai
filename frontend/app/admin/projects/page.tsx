"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  ChevronRight,
  FileText,
  FolderKanban,
  Lightbulb,
  Menu,
  Moon,
  Plus,
  Settings,
  ShieldCheck,
  Sun,
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
      { label: "Projects", icon: FolderKanban },
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

const projects = [
  {
    id: "PRJ-001",
    name: "Electricity Analysis",
    description:
      "Utility bill investigation and consumption analysis.",
    analyses: 18,
    documents: 12,
    confidence: "94.2%",
    updated: "Today",
    status: "Active",
  },
  {
    id: "PRJ-002",
    name: "Document Intelligence",
    description:
      "Contract and document evidence extraction workflow.",
    analyses: 24,
    documents: 31,
    confidence: "92.8%",
    updated: "Yesterday",
    status: "Active",
  },
  {
    id: "PRJ-003",
    name: "Device Inspection",
    description:
      "Visual inspection and evidence verification project.",
    analyses: 11,
    documents: 8,
    confidence: "88.6%",
    updated: "3 days ago",
    status: "Active",
  },
  {
    id: "PRJ-004",
    name: "Expense Investigation",
    description:
      "Expense records and recurring spending analysis.",
    analyses: 9,
    documents: 16,
    confidence: "91.4%",
    updated: "5 days ago",
    status: "Archived",
  },
];

export default function ProjectsPage() {
  const router = useRouter();

  const [theme, setTheme] = useState<Theme>("paper");
  const [filter, setFilter] = useState("All");

  const filteredProjects =
    filter === "All"
      ? projects
      : projects.filter((project) => project.status === filter);

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
                style={{
                  background: "var(--ink)",
                }}
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
                    const active = item.label === "Projects";

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
                          color: active
                            ? "var(--ink)"
                            : "var(--muted)",
                        }}
                      >
                        {active && (
                          <span
                            className="absolute left-0 top-0 h-full w-[4px]"
                            style={{
                              background: "var(--signal)",
                            }}
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
            style={{
              borderColor: "var(--border)",
            }}
          >
            <div
              className="flex items-center gap-2 text-[11px]"
              style={{
                color: "var(--verified)",
              }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  background: "var(--verified)",
                }}
              />

              AI Online
            </div>

            <div
              className="mt-1 pl-4 text-[9px]"
              style={{
                color: "var(--muted)",
              }}
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
            style={{
              borderColor: "var(--border)",
            }}
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
              style={{
                borderColor: "var(--border)",
              }}
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
                  style={{
                    color: "var(--signal)",
                  }}
                >
                  Library / Projects
                </div>

                <h1 className="text-[28px] font-semibold tracking-[-0.03em]">
                  Projects
                </h1>

                <p
                  className="mt-1 text-[13px]"
                  style={{
                    color: "var(--muted)",
                  }}
                >
                  Organize investigations, evidence, and intelligence
                  workflows.
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
                  New Project
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
                  style={{
                    color: "var(--muted)",
                  }}
                >
                  TOTAL PROJECTS
                </div>

                <div className="mt-3 font-mono text-[27px]">
                  12
                </div>

                <div
                  className="mt-1 text-[10px]"
                  style={{
                    color: "var(--muted)",
                  }}
                >
                  Investigation workspaces
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
                  style={{
                    color: "var(--muted)",
                  }}
                >
                  ACTIVE
                </div>

                <div className="mt-3 font-mono text-[27px]">
                  8
                </div>

                <div
                  className="mt-1 text-[10px]"
                  style={{
                    color: "var(--verified)",
                  }}
                >
                  Currently in use
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
                  style={{
                    color: "var(--muted)",
                  }}
                >
                  ANALYSES
                </div>

                <div className="mt-3 font-mono text-[27px]">
                  128
                </div>

                <div
                  className="mt-1 text-[10px]"
                  style={{
                    color: "var(--muted)",
                  }}
                >
                  Across all projects
                </div>
              </div>
            </div>

            {/* PROJECT LIST */}
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
                style={{
                  borderColor: "var(--border)",
                }}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <FolderKanban size={17} />

                    <span className="text-[14px] font-semibold">
                      Project Workspace
                    </span>
                  </div>

                  <div
                    className="mt-1 text-[11px]"
                    style={{
                      color: "var(--muted)",
                    }}
                  >
                    Keep related investigations and evidence together.
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {["All", "Active", "Archived"].map((item) => (
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
                  ))}
                </div>
              </div>

              {/* PROJECT CARDS */}
              <div className="grid grid-cols-1 gap-3 p-4 lg:grid-cols-2">
                {filteredProjects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() =>
                      console.log("Open project:", project.id)
                    }
                    className="group border p-5 text-left transition-all"
                    style={{
                      background: "var(--card)",
                      borderColor: "var(--border)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center"
                          style={{
                            background: "var(--sand)",
                          }}
                        >
                          <FolderKanban size={17} />
                        </div>

                        <div>
                          <div className="text-[13px] font-semibold">
                            {project.name}
                          </div>

                          <div
                            className="mt-1 text-[10px]"
                            style={{
                              color: "var(--muted)",
                            }}
                          >
                            {project.id}
                          </div>
                        </div>
                      </div>

                      <ChevronRight
                        size={16}
                        className="transition-transform group-hover:translate-x-1"
                        style={{
                          color: "var(--muted)",
                        }}
                      />
                    </div>

                    <p
                      className="mt-4 text-[11px] leading-5"
                      style={{
                        color: "var(--muted)",
                      }}
                    >
                      {project.description}
                    </p>

                    <div
                      className="mt-5 grid grid-cols-3 border-t pt-4"
                      style={{
                        borderColor: "var(--border)",
                      }}
                    >
                      <div>
                        <div
                          className="text-[8px] font-bold tracking-[0.12em]"
                          style={{
                            color: "var(--muted)",
                          }}
                        >
                          ANALYSES
                        </div>

                        <div className="mt-1 font-mono text-[12px]">
                          {project.analyses}
                        </div>
                      </div>

                      <div>
                        <div
                          className="text-[8px] font-bold tracking-[0.12em]"
                          style={{
                            color: "var(--muted)",
                          }}
                        >
                          DOCUMENTS
                        </div>

                        <div className="mt-1 font-mono text-[12px]">
                          {project.documents}
                        </div>
                      </div>

                      <div>
                        <div
                          className="text-[8px] font-bold tracking-[0.12em]"
                          style={{
                            color: "var(--muted)",
                          }}
                        >
                          CONFIDENCE
                        </div>

                        <div className="mt-1 font-mono text-[12px]">
                          {project.confidence}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <span
                        className="text-[9px]"
                        style={{
                          color: "var(--muted)",
                        }}
                      >
                        Updated {project.updated}
                      </span>

                      <span
                        className="border px-2 py-1 text-[8px] font-bold tracking-[0.08em]"
                        style={{
                          borderColor:
                            project.status === "Active"
                              ? "var(--verified)"
                              : "var(--border)",
                          color:
                            project.status === "Active"
                              ? "var(--verified)"
                              : "var(--muted)",
                        }}
                      >
                        {project.status.toUpperCase()}
                      </span>
                    </div>
                  </button>
                ))}
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
                  VELTRIX Project Layer
                </div>

                <div
                  className="mt-1 text-[11px]"
                  style={{
                    color: "var(--muted)",
                  }}
                >
                  Projects connect evidence, analyses, documents, and
                  outcomes into one investigation context.
                </div>
              </div>

              <div
                className="font-mono text-[10px] font-bold tracking-[0.08em]"
                style={{
                  color: "var(--ink)",
                }}
              >
                CONTEXT → EVIDENCE → INTELLIGENCE
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}