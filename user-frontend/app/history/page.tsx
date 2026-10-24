
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  RefreshCw,
  FileText,
  CheckCircle2,
  Clock3,
  AlertCircle,
  ArrowUpRight,
  LoaderCircle,
  Database,
} from "lucide-react";
import { apiGet } from "@/services/api";
import { getAnalyses} from "@/services/analysis.service";
import DashboardBackLink from "@/components/layout/dashboard-back-link";
type AnalysisStatus = "VERIFIED" | "PROCESSING" | "FAILED" | "PENDING";

interface Analysis {
  id: number | string;
  title?: string;
  category?: string;
  input_type?: string;
  status?: string;
  confidence?: number | string | null;
  summary?: string | null;
  needs_more_evidence?: boolean;
  processing_time_ms?: number | null;
  created_at?: string | null;
  evidence_count?: number;
  evidence?: unknown[];
  files?: unknown[];
  attachments?: unknown[];
}

interface AnalysesResponse {
  items?: Analysis[];
  total?: number;
  page?: number;
  size?: number;
  pages?: number;
}

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

function getAnalysesUrl() {
  const base = API_BASE.endsWith("/api")
    ? API_BASE
    : `${API_BASE}/api`;

  return `${base}/analyses?page=1&size=100`;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;

  // Check common token keys used by frontend authentication.
  const keys = ["access_token", "token", "accessToken"];

  for (const key of keys) {
    const value = localStorage.getItem(key);
    if (value) return value;
  }

  return null;
}

function normalizeStatus(status?: string): AnalysisStatus {
  switch ((status || "").toLowerCase()) {
    case "completed":
    case "verified":
      return "VERIFIED";

    case "processing":
    case "running":
      return "PROCESSING";

    case "failed":
    case "error":
      return "FAILED";

    default:
      return "PENDING";
  }
}

function formatDate(value?: string | null) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatDuration(value?: number | null) {
  if (value == null || value < 0) return "—";

  if (value < 1000) return `${value} ms`;

  const seconds = Math.round(value / 1000);

  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}m ${remainingSeconds}s`;
}

function formatConfidence(value?: number | string | null) {
  if (value == null || value === "") return "—";

  const number = Number(value);

  if (!Number.isFinite(number)) return "—";

  return `${number.toFixed(1).replace(/\.0$/, "")}%`;
}

function getEvidenceCount(analysis: Analysis) {
  if (typeof analysis.evidence_count === "number") {
    return analysis.evidence_count;
  }

  if (Array.isArray(analysis.evidence)) {
    return analysis.evidence.length;
  }

  if (Array.isArray(analysis.files)) {
    return analysis.files.length;
  }

  if (Array.isArray(analysis.attachments)) {
    return analysis.attachments.length;
  }

  return null;
}

const statusStyles: Record<AnalysisStatus, string> = {
  VERIFIED: "bg-[var(--success-soft)] text-[var(--success)]",
  PROCESSING: "bg-[var(--primary-soft)] text-[var(--primary)]",
  FAILED: "bg-[var(--danger-soft)] text-[var(--danger)]",
  PENDING: "bg-[var(--warning-soft)] text-[var(--warning)]",
};

const statusLabels: Record<AnalysisStatus, string> = {
  VERIFIED: "Verified",
  PROCESSING: "Processing",
  FAILED: "Failed",
  PENDING: "Pending",
};

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | AnalysisStatus>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  

const loadAnalyses = useCallback(async () => {
  setLoading(true);
  setError("");

  try {
    const response = await getAnalyses();

    // Support both a direct array and a paginated API response.
    const result = response as unknown as
      | Analysis[]
      | { items?: Analysis[]; total?: number };

    const items = Array.isArray(result)
      ? result
      : result.items ?? [];

    setAnalyses(items);
    setTotal(
      Array.isArray(result)
        ? items.length
        : result.total ?? items.length
    );
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Unable to load analysis history."
    );
  } finally {
    setLoading(false);
  }
}, []);



  useEffect(() => {
    void loadAnalyses();
  }, [loadAnalyses]);

  const filteredAnalyses = useMemo(() => {
    const query = search.trim().toLowerCase();

    return analyses.filter((analysis) => {
      const status = normalizeStatus(analysis.status);

      const matchesFilter = filter === "ALL" || status === filter;

      const searchableText = [
        analysis.title,
        analysis.category,
        analysis.summary,
        analysis.input_type,
        String(analysis.id),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesFilter && searchableText.includes(query);
    });
  }, [analyses, search, filter]);

  const verifiedCount = analyses.filter(
    (item) => normalizeStatus(item.status) === "VERIFIED"
  ).length;

  const processingCount = analyses.filter(
    (item) => normalizeStatus(item.status) === "PROCESSING"
  ).length;

  const evidenceTotal = analyses.reduce((sum, item) => {
    return sum + (getEvidenceCount(item) ?? 0);
  }, 0);

  const evidenceIsKnown = analyses.some(
    (item) => getEvidenceCount(item) !== null
  );

  const stats = [
    {
      label: "Total analyses",
      value: total,
      icon: FileText,
      detail: "Records reported by the server",
    },
    {
      label: "Verified",
      value: verifiedCount,
      icon: CheckCircle2,
      detail: "Completed analyses loaded",
    },
    {
      label: "Processing",
      value: processingCount,
      icon: Clock3,
      detail: "Currently in progress",
    },
    {
      label: "Evidence files",
      value: evidenceIsKnown ? evidenceTotal : "—",
      icon: Database,
      detail: evidenceIsKnown
        ? "Evidence available in returned records"
        : "Evidence counts not provided by API",
    },
  ];

  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 py-8 text-[var(--text)] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <DashboardBackLink />
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
              VELTRIX AI / WORKSPACE
            </p>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Analysis History
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Review your previous analyses, monitor their status, and revisit
              completed work.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadAnalyses()}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-semibold transition hover:bg-[var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <article
                key={stat.label}
                className="border border-[var(--line)] bg-[var(--surface)] p-5"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[var(--muted)]">{stat.label}</p>
                  <Icon size={19} className="text-[var(--primary)]" />
                </div>

                <p className="mt-4 text-3xl font-semibold tabular-nums">
                  {stat.value}
                </p>

                <p className="mt-2 text-xs text-[var(--muted)]">
                  {stat.detail}
                </p>
              </article>
            );
          })}
        </section>

        <section className="border border-[var(--line)] bg-[var(--surface)]">
          <div className="flex flex-col gap-4 border-b border-[var(--line)] p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold">All analyses</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Showing {filteredAnalyses.length} matching records
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex h-11 min-w-0 items-center gap-2 border border-[var(--line)] px-3 sm:w-72">
                <Search size={17} className="shrink-0 text-[var(--muted-light)]" />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search analyses..."
                  aria-label="Search analyses"
                  className="min-w-0 flex-1 bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted-light)]"
                />
              </div>

              <select
                value={filter}
                onChange={(event) =>
                  setFilter(event.target.value as "ALL" | AnalysisStatus)
                }
                aria-label="Filter by status"
                className="h-11 border border-[var(--line)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] outline-none"
              >
                <option value="ALL">All statuses</option>
                <option value="VERIFIED">Verified</option>
                <option value="PROCESSING">Processing</option>
                <option value="FAILED">Failed</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="m-5 flex items-start gap-3 border border-[var(--danger)]/30 bg-[var(--danger-soft)] p-4 text-sm text-[var(--danger)]"
            >
              <AlertCircle size={19} className="mt-0.5 shrink-0" />

              <div className="flex-1">
                <p className="font-semibold">Could not load analysis history</p>
                <p className="mt-1">{error}</p>
                <p className="mt-2 text-xs">
                  Check that the backend is running and your login session is
                  valid.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void loadAnalyses()}
                className="shrink-0 font-semibold underline"
              >
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-[var(--muted)]">
              <LoaderCircle size={28} className="animate-spin text-[var(--primary)]" />
              <p className="text-sm">Loading your analyses...</p>
            </div>
          ) : !error && filteredAnalyses.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center bg-[var(--primary-soft)]">
                <FileText size={25} className="text-[var(--primary)]" />
              </div>

              <h3 className="font-semibold">
                {search || filter !== "ALL"
                  ? "No matching analyses"
                  : "No analyses yet"}
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">
                {search || filter !== "ALL"
                  ? "Try another search term or change the status filter."
                  : "Create your first analysis to see it appear in your history."}
              </p>

              {!search && filter === "ALL" && (
                <Link
                  href="/analysis/new"
                  className="mt-5 inline-flex h-11 items-center gap-2 bg-[var(--primary)] px-4 text-sm font-semibold text-white hover:bg-[var(--primary-hover)]"
                >
                  Create analysis <ArrowUpRight size={16} />
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-[var(--line)]">
              {filteredAnalyses.map((analysis) => {
                const status = normalizeStatus(analysis.status);
                const evidenceCount = getEvidenceCount(analysis);
                const title =
                  analysis.title?.trim() || `Analysis #${analysis.id}`;

                return (
                  <article
                    key={analysis.id}
                    className="flex flex-col gap-5 p-5 transition hover:bg-[var(--surface-soft)] sm:p-6 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div className="flex min-w-0 flex-1 gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-[var(--primary-soft)]">
                        <FileText size={20} className="text-[var(--primary)]" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="break-words font-semibold">
                            {title}
                          </h3>

                          <span
                            className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}
                          >
                            {statusLabels[status]}
                          </span>
                        </div>

                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--muted)]">
                          {analysis.summary ||
                            analysis.category ||
                            "No summary was provided for this analysis."}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[var(--muted)]">
                          <span>{formatDate(analysis.created_at)}</span>

                          <span>
                            ID: {analysis.id}
                          </span>

                          {analysis.category && (
                            <span>{analysis.category}</span>
                          )}

                          {analysis.input_type && (
                            <span>
                              Input: {analysis.input_type}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-[var(--line)] pt-4 sm:grid-cols-3 lg:min-w-[330px] lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                      <div>
                        <p className="text-xs text-[var(--muted)]">Confidence</p>
                        <p className="mt-2 text-sm font-semibold">
                          {formatConfidence(analysis.confidence)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-[var(--muted)]">Evidence</p>
                        <p className="mt-2 text-sm font-semibold">
                          {evidenceCount === null ? "—" : evidenceCount}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-[var(--muted)]">Duration</p>
                        <p className="mt-2 text-sm font-semibold">
                          {formatDuration(analysis.processing_time_ms)}
                        </p>
                      </div>

                      <div className="col-span-2 sm:col-span-3 lg:col-span-3">
                        <Link
                          href={`/analysis/${analysis.id}`}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] hover:underline"
                        >
                          View analysis <ArrowUpRight size={15} />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <p className="text-xs leading-5 text-[var(--muted)]">
          History data is loaded from your VELTRIX AI backend. Evidence counts
          are shown only when the API provides evidence information.
        </p>
      </div>
    </main>
  );
}
