"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  Lightbulb,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import {
  getAnalysisInsights,
  type AnalysisInsight,
  type AnalysisInsights,
  type InsightType,
} from "@/services/analysis.service";
import DashboardBackLink from "@/components/layout/dashboard-back-link";

const typeConfig = {
  OPPORTUNITY: {
    label: "Opportunity",
    className: "badge-success",
    icon: TrendingUp,
  },
  RISK: {
    label: "Risk",
    className: "badge-danger",
    icon: TrendingDown,
  },
  TREND: {
    label: "Finding",
    className: "badge-primary",
    icon: BarChart3,
  },
  RECOMMENDATION: {
    label: "Recommendation",
    className: "badge-warning",
    icon: Target,
  },
};

function InsightBadge({ type }: { type: InsightType }) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <span className={`badge ${config.className}`}>
      <Icon size={11} />
      {config.label}
    </span>
  );
}

function formatDate(value: string | null) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleDateString();
}

function InsightCard({ insight }: { insight: AnalysisInsight }) {
  return (
    <article className="card card-hover p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[var(--surface-soft)] text-[var(--primary)]">
          <Lightbulb size={17} strokeWidth={1.7} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <InsightBadge type={insight.type} />
            {insight.confidence !== null && (
              <span className="font-mono text-[9px] text-[var(--success)]">
                {Math.round(insight.confidence)}% confidence
              </span>
            )}
          </div>

          <h4 className="mt-3">{insight.title}</h4>
          <p className="mt-1 max-w-3xl text-[11px] leading-5">
            {insight.description}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-[9px] text-[var(--muted)]">
            <span>{insight.analysis_title}</span>
            {insight.source && (
              <>
                <span aria-hidden="true">·</span>
                <span>Source: {insight.source}</span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <time dateTime={insight.date ?? undefined}>
              {formatDate(insight.date)}
            </time>
          </div>
        </div>

        <Link
          href={`/analysis/${insight.analysis_id}`}
          aria-label={`View analysis: ${insight.analysis_title}`}
          className="flex h-9 w-9 shrink-0 items-center justify-center border border-transparent text-[var(--muted)] transition hover:border-[var(--line)] hover:bg-[var(--surface-soft)] hover:text-[var(--primary)]"
        >
          <ArrowUpRight size={15} />
        </Link>
      </div>
    </article>
  );
}

export default function InsightsPage() {
  const [data, setData] = useState<AnalysisInsights | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadInsights = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getAnalysisInsights());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load your insights.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    getAnalysisInsights()
      .then((result) => {
        if (active) setData(result);
      })
      .catch((err: unknown) => {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Unable to load your insights.",
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

  const summaryCards = [
    {
      label: "Insights",
      value: data?.total,
      detail: "Findings and actions",
      icon: Lightbulb,
      color: "text-[var(--primary)]",
    },
    {
      label: "High confidence",
      value: data?.high_confidence_count,
      detail: "Above 80% confidence",
      icon: ShieldCheck,
      color: "text-[var(--success)]",
    },
    {
      label: "Risks",
      value: data?.risk_count,
      detail: "Require attention",
      icon: TrendingDown,
      color: "text-[var(--danger)]",
    },
    {
      label: "Opportunities",
      value: data?.opportunity_count,
      detail: "Identified in findings",
      icon: TrendingUp,
      color: "text-[var(--success)]",
    },
  ];

  return (
    <div className="space-y-7">
      <DashboardBackLink />
      <section className="flex flex-col justify-between gap-5 border-b border-[var(--line)] pb-6 md:flex-row md:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="signal-dot" />
            <span className="mono text-[9px] uppercase tracking-[0.14em] text-[var(--muted-light)]">
              VELTRIX / INTELLIGENCE / INSIGHTS
            </span>
          </div>
          <h1>Insights.</h1>
          <p className="mt-2 max-w-2xl">
            Findings and recommendations from your completed analyses.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadInsights()}
          disabled={loading}
          className="btn shrink-0"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {summaryCards.map(({ label, value, detail, icon: Icon, color }) => (
          <div className="card p-5" key={label}>
            <div className="mb-4 flex items-center justify-between">
              <span className="mono text-[9px] uppercase tracking-[0.08em] text-[var(--muted-light)]">
                {label}
              </span>
              <Icon size={16} className={color} strokeWidth={1.7} />
            </div>
            <div className={`text-[27px] font-semibold tracking-[-0.04em] ${color}`}>
              {loading && data === null ? "—" : value ?? 0}
            </div>
            <div className="mt-1 text-[10px] text-[var(--muted)]">{detail}</div>
          </div>
        ))}
      </section>

      {error && (
        <section
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 border border-[var(--danger)]/30 bg-[var(--danger-soft)] p-4 text-sm"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => void loadInsights()}
            className="btn"
          >
            Try again
          </button>
        </section>
      )}

      {data?.featured && (
        <section className="card border-l-2 border-l-[var(--signal)]">
          <div className="border-b border-[var(--line)] p-5">
            <div className="flex items-center gap-2">
              <Lightbulb
                size={15}
                className="text-[var(--signal)]"
                strokeWidth={1.8}
              />
              <h3>Featured insight</h3>
            </div>
          </div>
          <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3">
                <InsightBadge type={data.featured.type} />
              </div>
              <h2 className="text-[22px]">{data.featured.title}</h2>
              <p className="mt-3 text-[12px] leading-6">
                {data.featured.description}
              </p>
              {data.featured.confidence !== null && (
                <p className="mt-3 font-mono text-[10px] text-[var(--success)]">
                  {Math.round(data.featured.confidence)}% confidence
                </p>
              )}
            </div>
            <Link
              href={`/analysis/${data.featured.analysis_id}`}
              className="btn btn-primary shrink-0"
            >
              View analysis
              <ArrowUpRight size={13} />
            </Link>
          </div>
        </section>
      )}

      <section>
        <div className="mb-3">
          <h3>Latest insights</h3>
          <p className="mt-1 text-[11px]">
            Real findings and recommendations saved from your analyses.
          </p>
        </div>

        {loading && !data ? (
          <div className="card p-6 text-sm text-[var(--muted)]" role="status">
            Loading insights…
          </div>
        ) : data?.items.length ? (
          <div className="space-y-3">
            {data.items.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        ) : !error ? (
          <div className="card p-8 text-center">
            <Sparkles
              size={20}
              className="mx-auto text-[var(--muted-light)]"
            />
            <h4 className="mt-3">No insights yet</h4>
            <p className="mt-1 text-[11px] text-[var(--muted)]">
              Complete an analysis to see its findings and recommendations here.
            </p>
            <Link href="/analysis/new" className="btn btn-primary mt-4">
              Start an analysis
            </Link>
          </div>
        ) : null}
      </section>
    </div>
  );
}
