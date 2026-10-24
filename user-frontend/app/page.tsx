"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bot,
  CheckCircle2,
  Clock3,
  FileSearch,
  FolderOpen,
  Lightbulb,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import UserLayout from "@/components/layout/user-layout";
import { WelcomeProvider } from "@/components/welcome/welcome-provider";
import {
  getAnalysesPage,
  getAnalysisStats,
  type Analysis,
  type AnalysisStats,
} from "@/services/analysis.service";
import { getMe } from "@/services/auth.service";

const emptyStats: AnalysisStats = {
  total: 0,
  completed: 0,
  processing: 0,
  failed: 0,
  pending: 0,
};

function formatDate(value?: string) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}

function statusStyle(status: string) {
  switch (status.toLowerCase()) {
    case "completed":
    case "verified":
      return "bg-[var(--success-soft)] text-[var(--success)]";
    case "processing":
    case "running":
    case "pending":
      return "bg-[var(--warning-soft)] text-[var(--warning)]";
    case "failed":
      return "bg-[var(--danger-soft)] text-[var(--danger)]";
    default:
      return "bg-[var(--primary-soft)] text-[var(--primary)]";
  }
}

export default function HomePage() {
  const [userName, setUserName] = useState("there");
  const [stats, setStats] = useState<AnalysisStats>(emptyStats);
  const [recent, setRecent] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getMe()
      .then((user) => {
        if (!active) return;
        setUserName(user.full_name?.trim() || user.email.split("@")[0] || "there");
      })
      .catch(() => {
        if (active) setUserName("there");
      });

    Promise.all([getAnalysisStats(), getAnalysesPage(undefined, 1, 5)])
      .then(([analysisStats, analyses]) => {
        if (!active) return;
        setStats(analysisStats);
        setRecent(analyses.items);
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Unable to load your workspace overview.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const statCards = [
    {
      label: "Total analyses",
      value: stats.total,
      hint: "Your intelligence history",
      icon: FileSearch,
      tone: "text-[var(--primary)] bg-[var(--primary-soft)]",
    },
    {
      label: "Completed",
      value: stats.completed,
      hint: "Ready to explore",
      icon: CheckCircle2,
      tone: "text-[var(--success)] bg-[var(--success-soft)]",
    },
    {
      label: "In progress",
      value: stats.processing + stats.pending,
      hint: "Being processed now",
      icon: Clock3,
      tone: "text-[var(--warning)] bg-[var(--warning-soft)]",
    },
    {
      label: "Needs attention",
      value: stats.failed,
      hint: "Review failed runs",
      icon: ShieldCheck,
      tone: "text-[var(--signal)] bg-[var(--signal-soft)]",
    },
  ];

  return (
    <WelcomeProvider>
      <UserLayout>
        <div className="space-y-6 pb-10">
          <section className="home-hero relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-[#172b83] via-[#2347f5] to-[#5772ff] px-6 py-8 text-white shadow-xl shadow-blue-950/10 sm:px-9 sm:py-10 xl:px-12 xl:py-12">
            <div className="absolute -right-20 -top-24 -z-10 h-80 w-80 rounded-full border border-white/10" />
            <div className="absolute -right-8 -top-12 -z-10 h-56 w-56 rounded-full border border-white/10" />
            <div className="absolute -bottom-28 right-[18%] -z-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

            <div className="grid items-center gap-9 lg:grid-cols-[1.25fr_0.75fr]">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur">
                  <Sparkles size={13} />
                  <span className="font-mono text-[9px] uppercase tracking-[0.14em]">
                    Your intelligence workspace
                  </span>
                </div>
                <h1 className="home-hero-title max-w-2xl text-4xl font-semibold leading-[1.05] tracking-[-0.055em] text-white sm:text-5xl xl:text-6xl">
                  Good work starts
                  <br />
                  with better{" "}
                  <span className="home-hero-highlight text-[#ffb49e]">insight.</span>
                </h1>
                <p className="mt-5 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
                  Welcome back, {userName}. Bring your evidence, ask the hard
                  questions, and turn complex information into decisions you
                  can trust.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href="/analysis/new"
                    className="home-hero-primary inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-[#1e3ecb] shadow-lg shadow-blue-950/15 transition hover:-translate-y-0.5 hover:bg-blue-50"
                  >
                    <Plus size={15} />
                    Start an analysis
                    <ArrowRight size={14} />
                  </Link>
                  <Link
                    href="/history"
                    className="home-hero-secondary inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/20"
                  >
                    View analysis history
                  </Link>
                </div>
              </div>

              <div className="hidden lg:block">
                <div className="relative mx-auto max-w-sm rounded-2xl border border-white/20 bg-white/10 p-5 shadow-2xl shadow-blue-950/20 backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-blue-100">
                      Intelligence workflow
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                      <Sparkles size={15} />
                    </span>
                  </div>
                  <div className="mt-5 space-y-3">
                    {[
                      ["01", "Observe", "Bring your evidence"],
                      ["02", "Reason", "Find what matters"],
                      ["03", "Verify", "Ground results in facts"],
                      ["04", "Act", "Move forward with clarity"],
                    ].map(([step, title, detail], index) => (
                      <div
                        key={step}
                        className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#142a95]/30 p-3"
                      >
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-lg font-mono text-[9px] ${
                            index === 3
                              ? "bg-[#ff8c6b] text-white"
                              : "bg-white/15 text-blue-100"
                          }`}
                        >
                          {step}
                        </span>
                        <span className="flex-1">
                          <span className="block text-xs font-semibold">
                            {title}
                          </span>
                          <span className="mt-0.5 block text-[9px] text-blue-100">
                            {detail}
                          </span>
                        </span>
                        {index < 3 && (
                          <CheckCircle2
                            size={14}
                            className="text-blue-200/70"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {error && (
            <section
              role="alert"
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--danger)]/30 bg-[var(--danger-soft)] p-4 text-xs text-[var(--danger)]"
            >
              <span>{error}</span>
              <button
                type="button"
                className="btn"
                onClick={() => window.location.reload()}
              >
                <RefreshCw size={13} />
                Retry
              </button>
            </section>
          )}

          <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {statCards.map(({ label, value, hint, icon: Icon, tone }) => (
              <article
                key={label}
                className="card group relative overflow-hidden rounded-2xl p-4 transition hover:-translate-y-0.5 hover:shadow-lg sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-medium text-[var(--muted)]">
                      {label}
                    </p>
                    <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--ink)]">
                      {loading ? "—" : value}
                    </p>
                  </div>
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}
                  >
                    <Icon size={16} />
                  </span>
                </div>
                <p className="mt-2 text-[9px] text-[var(--muted-light)]">
                  {hint}
                </p>
              </article>
            ))}
          </section>

          <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
            <article className="card overflow-hidden rounded-2xl">
              <header className="flex items-center justify-between gap-4 border-b border-[var(--line)] p-5">
                <div>
                  <h2 className="text-sm font-semibold text-[var(--ink)]">
                    Recent analyses
                  </h2>
                  <p className="mt-1 text-[10px] text-[var(--muted)]">
                    Pick up where you left off.
                  </p>
                </div>
                <Link
                  href="/history"
                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--primary)] hover:underline"
                >
                  See all
                  <ArrowUpRight size={13} />
                </Link>
              </header>
              {loading ? (
                <div className="space-y-3 p-5" role="status">
                  {[0, 1, 2].map((item) => (
                    <div
                      key={item}
                      className="h-[58px] animate-pulse rounded-xl bg-[var(--surface-soft)]"
                    />
                  ))}
                </div>
              ) : recent.length ? (
                <div className="divide-y divide-[var(--line)]">
                  {recent.map((analysis) => (
                    <Link
                      key={analysis.id}
                      href={`/analysis/${analysis.id}`}
                      className="group flex items-center gap-3 p-4 transition hover:bg-[var(--surface-soft)] sm:px-5"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
                        <FileSearch size={16} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[11px] font-semibold text-[var(--ink)]">
                          {analysis.title || `Analysis #${analysis.id}`}
                        </span>
                        <span className="mt-1 block truncate text-[9px] text-[var(--muted)]">
                          {analysis.category || "Analysis"} ·{" "}
                          {formatDate(analysis.created_at)}
                        </span>
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[8px] font-semibold uppercase tracking-wide ${statusStyle(analysis.status)}`}
                      >
                        {analysis.status}
                      </span>
                      <ArrowUpRight
                        size={14}
                        className="text-[var(--muted-light)] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--primary)]"
                      />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center px-6 py-10 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface-soft)] text-[var(--primary)]">
                    <Sparkles size={19} />
                  </span>
                  <h3 className="mt-4 text-sm font-semibold text-[var(--ink)]">
                    Your first insight is one analysis away
                  </h3>
                  <p className="mt-1 max-w-sm text-[10px] leading-5 text-[var(--muted)]">
                    Start with a question, upload a file, or choose a document
                    from your Knowledge Base.
                  </p>
                  <Link
                    href="/analysis/new"
                    className="btn btn-primary mt-4"
                  >
                    Start your first analysis
                    <ArrowRight size={13} />
                  </Link>
                </div>
              )}
            </article>

            <article className="card rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--signal-soft)] text-[var(--signal)]">
                  <Sparkles size={17} />
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-[var(--ink)]">
                    Make your next move
                  </h2>
                  <p className="mt-1 text-[10px] text-[var(--muted)]">
                    Your workspace, one click away.
                  </p>
                </div>
              </div>
              <div className="mt-5 space-y-2">
                <HomeAction
                  href="/knowledge"
                  icon={FolderOpen}
                  title="Explore your Knowledge Base"
                  description="Use your indexed documents as evidence."
                  tone="text-[var(--success)] bg-[var(--success-soft)]"
                />
                <HomeAction
                  href="/chat"
                  icon={Bot}
                  title="Ask VELTRIX AI"
                  description="Get answers grounded in your sources."
                  tone="text-[var(--primary)] bg-[var(--primary-soft)]"
                />
                <HomeAction
                  href="/insights"
                  icon={Lightbulb}
                  title="Review your insights"
                  description="See findings and recommended actions."
                  tone="text-[var(--warning)] bg-[var(--warning-soft)]"
                />
                <HomeAction
                  href="/analytics"
                  icon={BarChart3}
                  title="View workspace analytics"
                  description="Track your analysis activity and outcomes."
                  tone="text-[var(--signal)] bg-[var(--signal-soft)]"
                />
              </div>
              <div className="mt-5 flex items-center gap-2 border-t border-[var(--line)] pt-4 text-[9px] text-[var(--muted)]">
                <ShieldCheck size={13} className="text-[var(--success)]" />
                Your analyses and sources stay in your account.
              </div>
            </article>
          </section>

          <section className="flex flex-col justify-between gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] p-4 sm:flex-row sm:items-center sm:px-5">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
                <TrendingUp size={15} />
              </span>
              <div>
                <p className="text-[11px] font-semibold text-[var(--ink)]">
                  Evidence in. Verified action out.
                </p>
                <p className="mt-0.5 text-[9px] text-[var(--muted)]">
                  Each analysis connects your question with evidence-backed findings.
                </p>
              </div>
            </div>
            <Link
              href="/analysis/new"
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--primary)] hover:underline"
            >
              Create an analysis
              <ArrowRight size={13} />
            </Link>
          </section>
        </div>
      </UserLayout>
    </WelcomeProvider>
  );
}

function HomeAction({
  href,
  icon: Icon,
  title,
  description,
  tone,
}: {
  href: string;
  icon: typeof FolderOpen;
  title: string;
  description: string;
  tone: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-transparent p-3 transition hover:border-[var(--line)] hover:bg-[var(--surface-soft)]"
    >
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone}`}>
        <Icon size={15} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-semibold text-[var(--ink)]">
          {title}
        </span>
        <span className="mt-0.5 block text-[9px] leading-4 text-[var(--muted)]">
          {description}
        </span>
      </span>
      <ArrowUpRight
        size={13}
        className="shrink-0 text-[var(--muted-light)] transition group-hover:text-[var(--primary)]"
      />
    </Link>
  );
}
