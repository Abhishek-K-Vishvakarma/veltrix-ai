"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Gauge,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import DashboardBackLink from "@/components/layout/dashboard-back-link";

import {
  getAnalytics,
  type AnalyticsData,
  type AnalyticsPeriod,
} from "@/services/analytics.service";

type Preset = "7d" | "30d" | "90d" | "12m" | "all" | "custom";

function dateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function initialPeriod(): AnalyticsPeriod {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 29);
  return { startDate: dateInputValue(start), endDate: dateInputValue(end) };
}

function presetPeriod(preset: Exclude<Preset, "custom" | "all">) {
  const end = new Date();
  const start = new Date(end);
  if (preset === "12m") {
    start.setFullYear(start.getFullYear() - 1);
  } else {
    const days = preset === "7d" ? 6 : preset === "30d" ? 29 : 89;
    start.setDate(start.getDate() - days);
  }
  return { startDate: dateInputValue(start), endDate: dateInputValue(end) };
}

function formatDuration(milliseconds: number | null) {
  if (milliseconds === null) return "—";
  const seconds = Math.round(milliseconds / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainder}s`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Activity;
  tone: string;
}) {
  return (
    <article className="card group relative overflow-hidden p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--primary)] to-[var(--signal)] opacity-70" />
      <div className="flex items-start justify-between">
        <div>
          <p className="mono text-[9px] uppercase tracking-[0.12em] text-[var(--muted-light)]">
            {label}
          </p>
          <p className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-[var(--ink)]">
            {value}
          </p>
        </div>
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-soft)] ${tone}`}>
          <Icon size={18} strokeWidth={1.8} />
        </span>
      </div>
      <p className="mt-3 text-[10px] text-[var(--muted)]">{detail}</p>
    </article>
  );
}

export default function AnalyticsPage() {
  const [preset, setPreset] = useState<Preset>("30d");
  const [period, setPeriod] = useState<AnalyticsPeriod>(initialPeriod);
  const [draftStart, setDraftStart] = useState(period.startDate);
  const [draftEnd, setDraftEnd] = useState(period.endDate);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateError, setDateError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setError(null);
    setLoading(true);
    getAnalytics(preset === "all" ? null : period)
      .then(setData)
      .catch((err: unknown) => {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load workspace analytics.",
        );
      })
      .finally(() => setLoading(false));
  }, [period, preset]);

  useEffect(() => {
    let active = true;
    getAnalytics(preset === "all" ? null : period)
      .then((result) => {
        if (active) setData(result);
      })
      .catch((err: unknown) => {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load workspace analytics.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [period, preset]);

  function selectPreset(value: Preset) {
    setDateError(null);
    setError(null);
    setLoading(true);
    setPreset(value);
    if (value === "all") return;
    if (value === "custom") {
      setDraftStart(period.startDate);
      setDraftEnd(period.endDate);
      return;
    }
    const next = presetPeriod(value);
    setPeriod(next);
    setDraftStart(next.startDate);
    setDraftEnd(next.endDate);
  }

  function applyCustomRange() {
    if (!draftStart || !draftEnd) {
      setDateError("Choose both a start and end date.");
      return;
    }
    if (draftStart > draftEnd) {
      setDateError("The start date must be on or before the end date.");
      return;
    }
    setDateError(null);
    setError(null);
    setLoading(true);
    setPeriod({ startDate: draftStart, endDate: draftEnd });
    setPreset("custom");
  }

  const highestActivity = Math.max(
    1,
    ...(data?.activity.map((item) => item.count) ?? []),
  );
  const confidenceTotal =
    data?.confidence_distribution.reduce((total, item) => total + item.count, 0) ??
    0;
  const confidenceAbove80 =
    (data?.confidence_distribution
      .filter((item) => item.label === "90–100%" || item.label === "80–89%")
      .reduce((total, item) => total + item.count, 0) ?? 0);
  const rangeLabel =
    preset === "all"
      ? "All time"
      : `${period.startDate} — ${period.endDate}`;

  return (
    <div className="space-y-6 pb-8">
      <DashboardBackLink />
      <section className="relative overflow-hidden rounded-2xl border border-[var(--line)] bg-gradient-to-br from-[var(--surface)] via-[var(--surface)] to-[var(--primary-soft)] p-6 sm:p-8">
        <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-[var(--primary)] opacity-[0.06] blur-3xl" />
        <div className="relative flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="signal-dot" />
              <span className="mono text-[9px] uppercase tracking-[0.16em] text-[var(--muted-light)]">
                VELTRIX / INTELLIGENCE / ANALYTICS
              </span>
            </div>
            <h1 className="text-4xl tracking-[-0.05em] sm:text-5xl">
              Analytics<span className="text-[var(--primary)]">.</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              A clear view of your analysis activity, confidence, evidence, and
              outcomes — based on your actual workspace data.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="badge badge-primary">
              <BarChart3 size={11} />
              PRIVATE WORKSPACE
            </span>
            <button
              type="button"
              onClick={refresh}
              disabled={loading}
              className="btn"
            >
              <RefreshCw
                size={13}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="flex flex-col gap-4 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
              <CalendarDays size={17} />
            </span>
            <div>
              <h3 className="text-sm">Date range</h3>
              <p className="mt-1 text-[10px] text-[var(--muted)]">
                {rangeLabel}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(
              [
                ["7d", "7 days"],
                ["30d", "30 days"],
                ["90d", "90 days"],
                ["12m", "12 months"],
                ["all", "All time"],
                ["custom", "Custom"],
              ] as const
            ).map(([value, label]) => (
              <button
                type="button"
                key={value}
                onClick={() => selectPreset(value)}
                aria-pressed={preset === value}
                className={`rounded-lg px-3 py-2 text-[10px] font-medium transition ${
                  preset === value
                    ? "bg-[var(--primary)] text-white shadow-sm"
                    : "bg-[var(--surface-soft)] text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {preset === "custom" && (
          <div className="flex flex-col gap-3 border-t border-[var(--line)] bg-[var(--surface-soft)]/50 p-4 sm:flex-row sm:items-end">
            <label className="space-y-1 text-[10px] text-[var(--muted)]">
              <span>From</span>
              <input
                type="date"
                value={draftStart}
                onChange={(event) => setDraftStart(event.target.value)}
                className="block rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--ink)]"
              />
            </label>
            <label className="space-y-1 text-[10px] text-[var(--muted)]">
              <span>To</span>
              <input
                type="date"
                value={draftEnd}
                onChange={(event) => setDraftEnd(event.target.value)}
                className="block rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--ink)]"
              />
            </label>
            <button
              type="button"
              onClick={applyCustomRange}
              className="btn btn-primary"
            >
              Apply range
            </button>
            {dateError && (
              <p role="alert" className="text-[10px] text-[var(--danger)]">
                {dateError}
              </p>
            )}
          </div>
        )}
      </section>

      {error && (
        <section
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--danger)]/30 bg-[var(--danger-soft)] p-4 text-sm"
        >
          <span className="flex items-center gap-2">
            <AlertCircle size={15} />
            {error}
          </span>
          <button type="button" onClick={refresh} className="btn">
            Try again
          </button>
        </section>
      )}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
        <MetricCard
          label="Analyses"
          value={loading && !data ? "—" : String(data?.total_analyses ?? 0)}
          detail={`${data?.completed_analyses ?? 0} completed · ${data?.partial_analyses ?? 0} partial`}
          icon={Activity}
          tone="text-[var(--primary)]"
        />
        <MetricCard
          label="Average confidence"
          value={
            data?.average_confidence === null ||
            data?.average_confidence === undefined
              ? "—"
              : `${Math.round(data.average_confidence)}%`
          }
          detail="Across analyses with a confidence score"
          icon={Gauge}
          tone="text-[var(--signal)]"
        />
        <MetricCard
          label="Successful outcomes"
          value={`${data?.success_rate ?? 0}%`}
          detail={`${data?.completed_analyses ?? 0} completed · ${data?.failed_analyses ?? 0} failed`}
          icon={ShieldCheck}
          tone="text-[var(--success)]"
        />
        <MetricCard
          label="Avg. processing time"
          value={formatDuration(data?.average_processing_time_ms ?? null)}
          detail="Measured from saved analysis runs"
          icon={Clock3}
          tone="text-[var(--warning)]"
        />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.55fr_1fr]">
        <article className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--line)] p-5">
            <div>
              <h3>Analysis activity</h3>
              <p className="mt-1 text-[10px] text-[var(--muted)]">
                Daily activity for shorter ranges; monthly for longer ranges.
              </p>
            </div>
            <span className="badge">
              {data?.granularity === "month" ? "MONTHLY" : "DAILY"}
            </span>
          </div>
          {data?.activity.length ? (
            <>
              <div className="overflow-x-auto p-5">
                <div
                  className="flex h-64 min-w-[520px] items-end gap-2 border-b border-l border-[var(--line)] px-2 pb-0 pt-4 sm:gap-3"
                  role="img"
                  aria-label="Analysis activity chart"
                >
                  {data.activity.map((item) => {
                    const height = Math.max(
                      item.count ? 8 : 2,
                      (item.count / highestActivity) * 100,
                    );
                    return (
                      <div
                        key={item.date}
                        title={`${item.label}: ${item.count} analyses`}
                        className="flex h-full min-w-0 flex-1 flex-col justify-end"
                      >
                        <span className="mb-2 text-center font-mono text-[8px] text-[var(--muted)]">
                          {item.count || ""}
                        </span>
                        <div
                          className="w-full rounded-t-md bg-gradient-to-t from-[var(--primary)] to-[var(--signal)] transition-all duration-500 hover:brightness-110"
                          style={{ height: `${height}%` }}
                        />
                        <span className="truncate pt-2 text-center font-mono text-[8px] text-[var(--muted-light)]">
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-[var(--line)] px-5 py-3">
                <span className="text-[10px] text-[var(--muted)]">
                  Analyses in selected period
                </span>
                <span className="font-mono text-xs font-semibold text-[var(--ink)]">
                  {data.total_analyses}
                </span>
              </div>
            </>
          ) : (
            <EmptyPanel text="No analysis activity in this date range." />
          )}
        </article>

        <article className="card overflow-hidden">
          <div className="border-b border-[var(--line)] p-5">
            <h3>Confidence distribution</h3>
            <p className="mt-1 text-[10px] text-[var(--muted)]">
              Actual confidence scores in the selected period.
            </p>
          </div>
          <div className="space-y-4 p-5">
            {data?.confidence_distribution.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-[9px] text-[var(--muted)]">
                    {item.label}
                  </span>
                  <span className="font-mono text-[9px] text-[var(--muted-light)]">
                    {item.count}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--line)]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--signal)] transition-all duration-500"
                    style={{
                      width: `${
                        confidenceTotal
                          ? (item.count / confidenceTotal) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
            {!confidenceTotal && (
              <p className="py-5 text-center text-[10px] text-[var(--muted)]">
                Confidence data will appear when analyses are completed.
              </p>
            )}
          </div>
          <div className="border-t border-[var(--line)] bg-[var(--surface-soft)] p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--success-soft)] text-[var(--success)]">
                <CheckCircle2 size={16} />
              </span>
              <div>
                <div className="text-[11px] font-semibold text-[var(--ink)]">
                  {confidenceAbove80} strong confidence result
                  {confidenceAbove80 === 1 ? "" : "s"}
                </div>
                <div className="mt-1 text-[10px] text-[var(--muted)]">
                  {confidenceTotal
                    ? `${Math.round((confidenceAbove80 / confidenceTotal) * 100)}% score 80% or higher`
                    : "No confidence scores in this period yet"}
                </div>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="card p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3>Evidence mix</h3>
              <p className="mt-1 text-[10px] text-[var(--muted)]">
                How source material entered your analyses.
              </p>
            </div>
            <FileCheck2 size={17} className="text-[var(--primary)]" />
          </div>
          {data?.input_mix.length ? (
            <div className="space-y-4">
              {data.input_mix.map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-[var(--ink)]">
                      {item.label}
                    </span>
                    <span className="font-mono text-[9px] text-[var(--muted)]">
                      {item.count} ·{" "}
                      {data.total_analyses
                        ? Math.round((item.count / data.total_analyses) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--line)]">
                    <div
                      className="h-full rounded-full bg-[var(--primary)]"
                      style={{
                        width: `${
                          data.total_analyses
                            ? (item.count / data.total_analyses) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyPanel text="Input source data will appear here." />
          )}
        </article>

        <article className="card p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3>Outcome snapshot</h3>
              <p className="mt-1 text-[10px] text-[var(--muted)]">
                Evidence and actions connected to your analysis runs.
              </p>
            </div>
            <Sparkles size={17} className="text-[var(--signal)]" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <OutcomeMetric
              icon={FileCheck2}
              label="Evidence-backed"
              value={data?.evidence_backed_count ?? 0}
              total={data?.total_analyses ?? 0}
              tone="text-[var(--primary)]"
            />
            <OutcomeMetric
              icon={Target}
              label="With action plans"
              value={data?.actionable_count ?? 0}
              total={data?.total_analyses ?? 0}
              tone="text-[var(--success)]"
            />
            <OutcomeMetric
              icon={CheckCircle2}
              label="Completed"
              value={data?.completed_analyses ?? 0}
              total={data?.total_analyses ?? 0}
              tone="text-[var(--success)]"
            />
            <OutcomeMetric
              icon={TrendingUp}
              label="Success rate"
              value={`${data?.success_rate ?? 0}%`}
              total={null}
              tone="text-[var(--signal)]"
            />
          </div>
        </article>
      </section>

      <section className="flex items-start gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
          <BarChart3 size={15} />
        </span>
        <div>
          <div className="text-[11px] font-semibold text-[var(--ink)]">
            Your workspace, your metrics
          </div>
          <p className="mt-1 text-[10px] leading-5 text-[var(--muted)]">
            All values are calculated from your own analysis records for{" "}
            {rangeLabel.toLowerCase()}. No sample or estimated activity is
            included.
          </p>
        </div>
      </section>
    </div>
  );
}

function EmptyPanel({ text }: { text: string }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center p-6 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-soft)] text-[var(--muted-light)]">
        <BarChart3 size={17} />
      </span>
      <p className="mt-3 text-[10px] text-[var(--muted)]">{text}</p>
    </div>
  );
}

function OutcomeMetric({
  icon: Icon,
  label,
  value,
  total,
  tone,
}: {
  icon: typeof Activity;
  label: string;
  value: number | string;
  total: number | null;
  tone: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-[var(--muted)]">{label}</span>
        <Icon size={14} className={tone} />
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[var(--ink)]">
        {value}
      </div>
      {total !== null && (
        <p className="mt-1 text-[9px] text-[var(--muted-light)]">
          of {total} analyses
        </p>
      )}
    </div>
  );
}
