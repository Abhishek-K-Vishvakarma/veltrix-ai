
"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  FileSearch,
  FolderOpen,
  Home,
  Plus,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import { getAnalysesPage, getAnalysisStats, type AnalysisStats } from "@/services/analysis.service";
import { getMe } from "@/services/auth.service";

/* =========================================================
   TYPES
   ========================================================= */

interface DashboardAnalysis {
  id: string | number;
  title?: string;
  status: string;
  summary?: string | null;
  category?: string;
  input_type?: string;
  created_at?: string;
  confidence?: number | null;
  processing_time_ms?: number | null;
}

/* =========================================================
   INTELLIGENCE PIPELINE
   ========================================================= */

const pipeline = [
  {
    step: "01",
    title: "Observe",
    description: "Collect evidence from your input.",
    icon: FileSearch,
  },
  {
    step: "02",
    title: "Reason",
    description: "Understand context and relationships.",
    icon: Sparkles,
  },
  {
    step: "03",
    title: "Verify",
    description: "Validate findings against evidence.",
    icon: ShieldCheck,
  },
  {
    step: "04",
    title: "Act",
    description: "Turn verified intelligence into action.",
    icon: TrendingUp,
  },
];

/* =========================================================
   HELPERS
   ========================================================= */

function normalizeStatus(status?: string): string {
  return (status || "").toLowerCase();
}

function formatDate(value?: string): string {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* =========================================================
   DASHBOARD PAGE
   ========================================================= */

export default function DashboardPage() {
  const [analyses, setAnalyses] = useState<DashboardAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalAnalyses, setTotalAnalyses] = useState(0);
  const [userName, setUserName] = useState("there");
  const [dashboardStats, setDashboardStats] = useState<AnalysisStats>({
  total: 0,
  completed: 0,
  processing: 0,
  failed: 0,
  pending: 0,
});

useEffect(() => {
  let active = true;

  getMe()
    .then((user) => {
      if (!active) return;

      const name =
        user.full_name ||
        user.email?.split("@")[0];

      if (name) {
        setUserName(name);
      }
    })
    .catch((error) => {
      console.error("Failed to fetch logged-in user:", error);
    });

  return () => {
    active = false;
  };
}, []);


const loadDashboard = useCallback(async () => {
  setLoading(true);
  setError("");

  try {
    const [analysesResponse, statsResponse] = await Promise.all([
      getAnalysesPage(undefined, 1, 20),
      getAnalysisStats(),
    ]);

    setAnalyses(analysesResponse.items);
    setTotalAnalyses(statsResponse.total);
    setDashboardStats(statsResponse);
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Unable to load dashboard data."
    );
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  /* =========================================================
     DYNAMIC STATS
     ========================================================= */

  const verifiedCount = analyses.filter((analysis) =>
    ["completed", "verified"].includes(
      normalizeStatus(analysis.status)
    )
  ).length;

  const processingCount = analyses.filter((analysis) =>
    ["processing", "running"].includes(
      normalizeStatus(analysis.status)
    )
  ).length; 


const stats = [
  {
    label: "Total Analyses",
    value: loading ? "—" : String(totalAnalyses),
    detail: "All your analyses",
    icon: FileSearch,
  },
  {
    label: "Verified",
    value: loading ? "—" : String(dashboardStats.completed),
    detail: "Completed analyses",
    icon: CheckCircle2,
  },
  {
    label: "Processing",
    value: loading ? "—" : String(dashboardStats.processing),
    detail: "Analyses in progress",
    icon: Clock3,
  },
  {
    label: "Failed",
    value: loading ? "—" : String(dashboardStats.failed),
    detail: "Analyses that failed",
    icon: AlertCircle,
  },
];


  /* =========================================================
     RECENT ANALYSES
     ========================================================= */

  const recentAnalyses = [...analyses]
    .sort((a, b) => {
      const dateA = a.created_at
        ? new Date(a.created_at).getTime()
        : 0;

      const dateB = b.created_at
        ? new Date(b.created_at).getTime()
        : 0;

      return dateB - dateA;
    })
    .slice(0, 3);

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="page-container page-enter pb-12">
      {/* PAGE HEADER */}
      <section className="card mb-6 p-6 md:p-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--muted)] transition hover:text-[var(--primary)]"
            >
              <Home size={12} />
              Home
            </Link>
            <div className="mb-3 flex items-center gap-2">
              <span className="signal-dot" />

              <span className="mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted-light)]">
                VELTRIX / USER
              </span>
            </div>

           <h1 className="text-2xl font-bold text-[var(--ink)] md:text-3xl">
             Welcome, {userName}.
           </h1>

            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
              Evidence in. Verified action out. Start an analysis and let
              VELTRIX turn complex information into actionable intelligence.
            </p>
          </div>

          <Link
            href="/analysis/new"
            className="btn btn-primary flex shrink-0 items-center gap-2 self-start font-medium md:self-auto"
          >
            <Plus size={16} strokeWidth={2} />
            New Analysis
          </Link>
        </div>
      </section>

      {/* DYNAMIC STATS */}
      <section className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="card card-hover flex flex-col justify-between p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--muted-light)]">
                  {stat.label}
                </span>

                <Icon
                  size={18}
                  strokeWidth={1.7}
                  className="text-[var(--muted-light)]"
                />
              </div>

              <div className="text-3xl font-bold tracking-tight text-[var(--ink)]">
                {stat.value}
              </div>

              <div className="mt-2 text-xs text-[var(--muted)]">
                {stat.detail}
              </div>
            </div>
          );
        })}
      </section>

      {/* DASHBOARD ERROR */}
      {error && (
        <section
          role="alert"
          className="card mb-6 flex flex-col gap-3 border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0 text-red-600"
            />

            <div>
              <h3 className="text-sm font-semibold text-red-800">
                Could not load dashboard data
              </h3>

              <p className="mt-1 text-xs leading-relaxed text-red-700">
                {error}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void loadDashboard()}
            disabled={loading}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 border border-red-200 bg-white px-4 text-xs font-semibold text-red-700 disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={loading ? "animate-spin" : ""}
            />
            Retry
          </button>
        </section>
      )}

      {/* QUICK ACTIONS */}
      <section className="mb-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-[var(--ink)]">
            Quick actions
          </h3>

          <p className="mt-1 text-xs text-[var(--muted)]">
            Start working with your intelligence workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <Link
            href="/analysis/new"
            className="card card-hover group flex flex-col justify-between gap-6 p-6"
          >
            <div className="flex h-10 w-10 items-center justify-center bg-[var(--primary-soft)] text-[var(--primary)]">
              <Plus size={18} strokeWidth={2} />
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-sm font-semibold text-[var(--ink)]">
                  Start New Analysis
                </h4>

                <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">
                  Upload evidence or provide information for VELTRIX to
                  analyze.
                </p>
              </div>

              <ArrowUpRight
                size={16}
                className="shrink-0 text-[var(--muted-light)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </div>
          </Link>

          <Link
            href="/documents"
            className="card card-hover group flex flex-col justify-between gap-6 p-6"
          >
            <div className="flex h-10 w-10 items-center justify-center bg-[var(--success-soft)] text-[var(--success)]">
              <FolderOpen size={18} strokeWidth={2} />
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-sm font-semibold text-[var(--ink)]">
                  Manage Documents
                </h4>

                <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">
                  Organize the documents that power your analysis workflow.
                </p>
              </div>

              <ArrowUpRight
                size={16}
                className="shrink-0 text-[var(--muted-light)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </div>
          </Link>

          <Link
            href="/knowledge"
            className="card card-hover group flex flex-col justify-between gap-6 p-6"
          >
            <div className="flex h-10 w-10 items-center justify-center bg-[var(--signal-soft)] text-[var(--signal)]">
              <Sparkles size={18} strokeWidth={2} />
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-sm font-semibold text-[var(--ink)]">
                  Knowledge Base
                </h4>

                <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">
                  Build a trusted knowledge layer for future analyses.
                </p>
              </div>

              <ArrowUpRight
                size={16}
                className="shrink-0 text-[var(--muted-light)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </div>
          </Link>
        </div>
      </section>

      {/* INTELLIGENCE PIPELINE */}
      <section className="card mb-6 overflow-hidden">
        <div className="flex flex-col justify-between gap-3 border-b border-[var(--line)] p-6 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[var(--ink)]">
                Intelligence pipeline
              </h3>

              <span className="badge badge-primary px-2.5 py-0.5 text-[10px]">
                VELTRIX CORE
              </span>
            </div>

            <p className="mt-1 text-xs text-[var(--muted)]">
              Every analysis moves through evidence, reasoning, verification,
              and action.
            </p>
          </div>

          <span className="mono text-[10px] font-medium tracking-[0.1em] text-[var(--muted-light)]">
            Observe → Reason → Verify → Act
          </span>
        </div>

        <div className="grid grid-cols-1 divide-y divide-[var(--line)] md:grid-cols-4 md:divide-x md:divide-y-0">
          {pipeline.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.step} className="space-y-3 p-6">
                <div className="flex items-center justify-between">
                  <span className="mono text-xs font-semibold text-[var(--muted-light)]">
                    {item.step}
                  </span>

                  <Icon
                    size={18}
                    strokeWidth={1.7}
                    className="text-[var(--primary)]"
                  />
                </div>

                <h4 className="text-sm font-semibold text-[var(--ink)]">
                  {item.title}
                </h4>

                <p className="text-xs leading-relaxed text-[var(--muted)]">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* RECENT INTELLIGENCE */}
      <section className="card mb-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--line)] p-6">
          <div>
            <h3 className="text-sm font-semibold text-[var(--ink)]">
              Recent intelligence
            </h3>

            <p className="mt-1 text-xs text-[var(--muted)]">
              Your latest analysis results will appear here.
            </p>
          </div>

          <Link
            href="/history"
            className="btn btn-ghost flex items-center gap-1.5 px-3 py-1.5 text-xs"
          >
            View history
            <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="min-h-[220px] p-6">
          {loading ? (
            <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 text-[var(--muted)]">
              <RefreshCw
                size={22}
                className="animate-spin"
              />

              <p className="text-xs">
                Loading recent analyses...
              </p>
            </div>
          ) : error ? (
            <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 text-center">
              <AlertCircle
                size={22}
                className="text-[var(--signal)]"
              />

              <h4 className="text-sm font-semibold text-[var(--ink)]">
                Recent analyses unavailable
              </h4>

              <p className="max-w-md text-xs text-[var(--muted)]">
                Refresh the dashboard to try loading your analyses again.
              </p>

              <button
                type="button"
                onClick={() => void loadDashboard()}
                className="btn btn-primary mt-2 px-4 py-2 text-xs"
              >
                Try again
              </button>
            </div>
          ) : recentAnalyses.length === 0 ? (
            <div className="flex min-h-[180px] flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center border border-[var(--line)] bg-[var(--surface-soft)]">
                <FileSearch
                  size={20}
                  strokeWidth={1.6}
                  className="text-[var(--muted-light)]"
                />
              </div>

              <h4 className="text-sm font-semibold text-[var(--ink)]">
                No intelligence yet
              </h4>

              <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-[var(--muted)]">
                Once you create an analysis, it will appear here.
              </p>

              <Link
                href="/analysis/new"
                className="btn btn-primary mt-6 flex items-center gap-2 px-5 py-2.5 text-xs font-medium"
              >
                <Plus size={15} />
                Create first analysis
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[var(--line)]">
              {recentAnalyses.map((analysis) => (
                <Link
                  key={analysis.id}
                  href={`/analysis/${analysis.id}`}
                  className="flex flex-col gap-3 py-4 transition hover:opacity-75 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center bg-[var(--primary-soft)] text-[var(--primary)]">
                      <FileSearch size={17} />
                    </div>

                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-semibold text-[var(--ink)]">
                        {analysis.title || `Analysis #${analysis.id}`}
                      </h4>

                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--muted)]">
                        {analysis.summary ||
                          analysis.category ||
                          "No summary available"}
                      </p>

                      <p className="mt-1.5 text-[10px] text-[var(--muted-light)]">
                        {formatDate(analysis.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                    <span className="text-xs font-medium text-[var(--muted)]">
                      {analysis.status}
                    </span>

                    <ArrowUpRight
                      size={15}
                      className="text-[var(--primary)]"
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FREE PLAN NOTICE */}
      <section className="card mb-6 bg-[var(--surface-soft)] p-5 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[var(--primary-soft)] text-[var(--primary)]">
              <Sparkles size={16} />
            </div>

            <div>
              <div className="text-xs font-semibold text-[var(--ink)]">
                You are currently using the Free plan.
              </div>

              <div className="mt-0.5 text-xs text-[var(--muted)]">
                Your workspace is ready for your next analysis.
              </div>
            </div>
          </div>

          <div className="badge badge-success flex shrink-0 items-center gap-1.5 px-3 py-1 text-[11px] font-medium">
            <CheckCircle2 size={12} />
            ACTIVE
          </div>
        </div>
      </section>
    </div>
  );
}
