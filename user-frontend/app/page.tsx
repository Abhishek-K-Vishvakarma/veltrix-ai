"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  BarChart3,
  Bot,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  FileSearch,
  FolderOpen,
  History,
  Lightbulb,
  Paperclip,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Eye,
  Zap,
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
const WORKFLOW = [
  { step: "01", title: "Observe", detail: "Bring your evidence", icon: Eye, color: "#8b5cf6" },
  { step: "02", title: "Reason", detail: "Find what matters", icon: BrainCircuit, color: "#14b8a6" },
  { step: "03", title: "Verify", detail: "Ground results in facts", icon: ShieldCheck, color: "#f59e0b" },
  { step: "04", title: "Act", detail: "Move forward with clarity", icon: Zap, color: "#22d3ee" },
];
const QUICK_STARTS = [
  { label: "Upload evidence", icon: Paperclip },
  { label: "Ask a hard question", icon: BrainCircuit },
  { label: "Verify a claim", icon: FileSearch },
];
  return (
    <WelcomeProvider>
      <UserLayout>
        <div className="space-y-6 pb-10">
          <section className="relative isolate overflow-hidden rounded-[28px] border border-white/10 bg-[#070b1f] px-6 py-8 text-white shadow-2xl shadow-indigo-950/30 sm:px-9 sm:py-10 xl:px-12 xl:py-12">
      {/* Background: aurora + grid + brand watermark */}
      <div className="pointer-events-none absolute -left-24 -top-32 -z-10 h-[420px] w-[420px] rounded-full bg-violet-600/35 blur-[110px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 -z-10 h-[460px] w-[460px] rounded-full bg-cyan-500/25 blur-[120px]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(148,163,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,255,0.07)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_at_60%_40%,black,transparent_75%)]" />
      <Image src="/veltrix-icon.svg"
        alt=""
        aria-hidden
        width={460}
        height={460}
        className="pointer-events-none absolute -bottom-24 -right-20 -z-10 hidden w-[420px] select-none opacity-[0.06] lg:block"
      />
 
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-12">
        {/* ───────── Left: message + prompt ───────── */}
        <div className="min-w-0">
          <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-300" />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-200">
              Your intelligence workspace
            </span>
          </div>
 
          <h1 className="max-w-2xl text-4xl font-semibold leading-[1.06] tracking-[-0.045em] sm:text-5xl xl:text-[3.6rem]">
            Good work starts
            <br />
            with better{" "}
            <span className="bg-gradient-to-r from-violet-300 via-sky-300 to-cyan-300 bg-clip-text text-transparent">
              insight.
            </span>
          </h1>
 
          <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
            Welcome back, <span className="font-medium text-white">{userName}</span>.
            Bring your evidence, ask the hard questions, and turn complex
            information into decisions you can trust.
          </p>
 
          {/* Prompt-style primary action */}
          <Link
            href="/analysis/new"
            className="group mt-8 flex max-w-xl items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.07] p-2 pl-4 shadow-lg shadow-indigo-950/30 backdrop-blur-xl transition hover:border-cyan-300/50 hover:bg-white/[0.1] hover:shadow-cyan-500/10"
          >
            <Paperclip size={17} className="shrink-0 text-slate-400" />
            <span className="min-w-0 flex-1 truncate text-sm text-slate-300">
              Ask a question or bring your evidence…
            </span>
            <span className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-4 text-xs font-semibold text-white shadow-lg shadow-violet-900/40 transition group-hover:brightness-110">
              <span className="hidden sm:inline">Start an analysis</span>
              <ArrowUp size={16} className="sm:hidden" />
              <ArrowRight size={15} className="hidden transition group-hover:translate-x-0.5 sm:inline" />
            </span>
          </Link>
 
          {/* Quick starts + history */}
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            {QUICK_STARTS.map(({ label, icon: Icon }) => (
              <Link
                key={label}
                href="/analysis/new"
                className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3.5 py-2 text-xs text-slate-200 transition hover:border-white/30 hover:bg-white/10"
              >
                <Icon size={13} className="text-cyan-300" />
                {label}
              </Link>
            ))}
            <Link
              href="/history"
              className="ml-1 inline-flex items-center gap-2 px-2 py-2 text-xs font-medium text-slate-300 underline-offset-4 transition hover:text-white hover:underline"
            >
              <History size={14} />
              View analysis history
            </Link>
          </div>
        </div>
 
        {/* ───────── Right: workflow card ───────── */}
        <div className="relative mx-auto w-full min-w-0 max-w-md">
          <div className="absolute -inset-px -z-10 rounded-3xl bg-gradient-to-br from-violet-400/40 via-transparent to-cyan-300/40 blur-[1px]" />
          <div className="rounded-3xl border border-white/10 bg-[#0b1030]/80 p-5 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <Image
                src="/veltrix-icon.svg"
                alt="Veltrix AI"
                width={40}
                height={40}
                className="h-10 w-10 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold tracking-tight">
                  Intelligence workflow
                </div>
                <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-slate-400">
                  Evidence in. Verified action out.
                </div>
              </div>
            </div>
 
            <div className="relative mt-5 space-y-2.5">
              <div className="absolute bottom-7 left-[2.1rem] top-7 w-px bg-gradient-to-b from-violet-400/60 via-teal-400/40 to-cyan-300/60" />
 
              {WORKFLOW.map(({ step, title, detail, icon: Icon, color }, index) => {
                const isLast = index === WORKFLOW.length - 1;
                return (
                  <div
                    key={step}
                    className={`relative flex items-center gap-3.5 rounded-2xl border p-3 transition hover:translate-x-1 ${
                      isLast
                        ? "border-cyan-300/30 bg-gradient-to-r from-violet-500/15 to-cyan-400/15"
                        : "border-white/10 bg-white/[0.035] hover:bg-white/[0.06]"
                    }`}
                  >
                    <span
                      className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border"
                      style={{
                        background: `linear-gradient(${color}30, ${color}30), #0b1030`,
                        borderColor: `${color}66`,
                        color,
                      }}
                    >
                      <Icon size={18} strokeWidth={2} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-semibold">{title}</span>
                      <span className="mt-0.5 block text-[11px] text-slate-400">{detail}</span>
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">{step}</span>
                  </div>
                );
              })}
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
  const QUICK_STARTS = [
  { label: "Upload evidence", icon: Paperclip },
  { label: "Ask a hard question", icon: BrainCircuit },
  { label: "Verify a claim", icon: FileSearch },
];
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
