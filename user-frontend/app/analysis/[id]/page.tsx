
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  ShieldCheck,
  Sparkles,
  Target,
  TriangleAlert,
  RefreshCw,
  LoaderCircle,
} from "lucide-react";

import { getAnalysis } from "@/services/analysis.service";
import type { AnalysisDetail } from "@/services/analysis.service";
import DashboardBackLink from "@/components/layout/dashboard-back-link";

export default function AnalysisResultPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [analysis, setAnalysis] = useState<AnalysisDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalysis = useCallback(async () => {
    try {
      const data = await getAnalysis(id);
      setAnalysis(data);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load this analysis."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      try {
        const data = await getAnalysis(id);

        if (cancelled) return;

        setAnalysis(data);
        setError("");
        setLoading(false);

        if (
          data.status?.toLowerCase() === "processing" ||
          data.status?.toLowerCase() === "pending"
        ) {
          timer = setTimeout(poll, 2500);
        }
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load this analysis."
        );
        setLoading(false);

        // Retry temporary fetch failures.
        timer = setTimeout(poll, 5000);
      }
    };

    void poll();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <DashboardBackLink />
        <div className="flex items-center gap-3 border-b border-[var(--line)] pb-5">
          <LoaderCircle className="animate-spin" size={20} />
          <div>
            <h2>Loading analysis...</h2>
            <p className="mt-1 text-sm">
              Fetching your analysis from VELTRIX.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !analysis) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <DashboardBackLink />
        <section className="card space-y-4 p-6">
          <TriangleAlert size={24} />
          <h2>Unable to load analysis</h2>
          <p role="alert">{error}</p>

          <div className="flex gap-2">
            <button onClick={() => {
              setLoading(true);
              void loadAnalysis();
            }} className="btn btn-primary">
              <RefreshCw size={14} />
              Retry
            </button>
            <Link href="/history" className="btn">
              Back to history
            </Link>
          </div>
        </section>
      </div>
    );
  }

  if (!analysis) return null;

  const status = analysis.status.toLowerCase();
  const isProcessing =
    status === "processing" || status === "pending";
  const isFailed = status === "failed";
  const isPartial = status === "partial";
  const hasResult = status === "completed" || isPartial;

  const evidence = analysis.evidence ?? [];
  const findings = analysis.findings ?? [];
  const calculations = analysis.calculations ?? [];
  const actions = analysis.actions ?? [];
  const logs = analysis.reasoning_logs ?? [];
  const files = analysis.evidence_files ?? [];
  const knowledgeSources = analysis.knowledge_sources ?? [];

  const elapsed = analysis.processing_time_ms;
  const elapsedLabel =
    elapsed == null
      ? "Not available"
      : elapsed >= 1000
        ? `${(elapsed / 1000).toFixed(2)} s`
        : `${elapsed} ms`;

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <DashboardBackLink />
      <section className="border-b border-[var(--line)] pb-6">
        <Link
          href="/history"
          className="mb-5 inline-flex items-center gap-2 text-sm text-[var(--muted)]"
        >
          <ArrowLeft size={14} />
          Back to history
        </Link>

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mono mb-2 text-[10px] uppercase tracking-widest text-[var(--muted)]">
              VELTRIX / ANALYSIS / #{analysis.id}
            </div>
            <h1>{analysis.title || "Untitled analysis"}</h1>
            <p className="mt-2 text-sm">
              {analysis.problem || "Analysis submitted with uploaded evidence."}
            </p>
          </div>

          <span className="badge">
            {isProcessing && <LoaderCircle size={12} className="animate-spin" />}
            {isFailed && <TriangleAlert size={12} />}
            {status === "completed" && <CheckCircle2 size={12} />}
            {analysis.status.toUpperCase()}
          </span>
        </div>
      </section>

      {isProcessing && (
        <section className="card space-y-3 p-5">
          <div className="flex items-center gap-2">
            <LoaderCircle size={18} className="animate-spin" />
            <h3>Analysis in progress</h3>
          </div>
          <p className="text-sm">
            VELTRIX is processing your evidence. This page will refresh
            automatically when the status changes.
          </p>
          {logs.length > 0 && (
            <div className="space-y-2 border-t border-[var(--line)] pt-3">
              {logs.map((log) => (
                <div key={log.id} className="text-sm">
                  <strong>{log.step}</strong>: {log.message}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {isFailed && (
        <section className="card space-y-3 p-5">
          <TriangleAlert size={22} />
          <h3>Analysis failed</h3>
          <p role="alert" className="text-sm">
            {analysis.error_message || "The backend could not complete this analysis."}
          </p>
          <p className="text-xs text-[var(--muted)]">
            Check the backend logs and configuration before retrying.
          </p>
        </section>
      )}

      {isPartial && (
        <section className="card space-y-2 border-amber-500/40 p-5">
          <div className="flex items-center gap-2">
            <TriangleAlert size={18} />
            <h3>Limited analysis</h3>
          </div>
          <p className="text-sm">
            {analysis.error_message ||
              "AI interpretation was unavailable. The displayed result may contain local text extraction only."}
          </p>
          {analysis.provider_status && (
            <p className="text-xs text-[var(--muted)]">
              Result source: {analysis.provider_status}
            </p>
          )}
        </section>
      )}

      {hasResult && (
        <>
          <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="card p-5">
              <ShieldCheck size={17} />
              <p className="mt-3 text-xs">Confidence</p>
              <div className="mt-1 text-3xl font-semibold">
                {analysis.confidence == null
                  ? "N/A"
                  : `${analysis.confidence}%`}
              </div>
            </div>

            <div className="card p-5">
              <FileText size={17} />
              <p className="mt-3 text-xs">Evidence items</p>
              <div className="mt-1 text-3xl font-semibold">
                {evidence.length}
              </div>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {files.length} uploaded file(s) · {knowledgeSources.length} Knowledge Base document(s)
              </p>
            </div>

            <div className="card p-5">
              <Clock3 size={17} />
              <p className="mt-3 text-xs">Processing time</p>
              <div className="mt-1 text-2xl font-semibold">
                {elapsedLabel}
              </div>
            </div>
          </section>

          {knowledgeSources.length > 0 && (
            <section className="card p-5">
              <h3>Knowledge Base sources</h3>
              <ul className="mt-3 divide-y divide-[var(--line)]">
                {knowledgeSources.map((source) => (
                  <li key={source.document_id} className="py-3">
                    <p className="text-sm font-medium">{source.filename}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {source.chunk_count} indexed chunk(s)
                      {source.pages.length > 0
                        ? ` · Pages ${source.pages.join(", ")}`
                        : ""}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="card p-5">
            <div className="flex items-center gap-2">
              <Sparkles size={16} />
              <h3>Analysis summary</h3>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7">
              {analysis.summary || "No summary was returned."}
            </p>
            {analysis.reasoning_summary && (
              <p className="mt-3 border-l-2 border-[var(--line)] pl-3 text-sm text-[var(--muted)]">
                {analysis.reasoning_summary}
              </p>
            )}

            {analysis.needs_more_evidence && (
              <div className="mt-4 border border-[var(--line)] p-4">
                <div className="flex items-center gap-2">
                  <TriangleAlert size={16} />
                  <strong className="text-sm">More evidence needed</strong>
                </div>
                <p className="mt-2 text-sm">
                  {analysis.missing_evidence_message ||
                    "Upload clearer or additional evidence to improve the analysis."}
                </p>
              </div>
            )}
          </section>

          {(analysis.uncertainties?.length || analysis.follow_up_questions?.length) ? (
            <section className="card space-y-4 p-5">
              {Boolean(analysis.uncertainties?.length) && (
                <div>
                  <h3>Uncertainties</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                    {analysis.uncertainties?.map((item, index) => <li key={index}>{item}</li>)}
                  </ul>
                </div>
              )}
              {Boolean(analysis.follow_up_questions?.length) && (
                <div>
                  <h3>Follow-up questions</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                    {analysis.follow_up_questions?.map((item, index) => <li key={index}>{item}</li>)}
                  </ul>
                </div>
              )}
            </section>
          ) : null}

          <section className="card p-5">
            <h3>Evidence</h3>
            {evidence.length === 0 ? (
              <p className="mt-3 text-sm">No extracted evidence available.</p>
            ) : (
              <div className="mt-4 divide-y divide-[var(--line)]">
                {evidence.map((item, index) => (
                  <div key={`${item.label}-${index}`} className="py-4">
                    <div className="text-sm font-medium">{item.label}</div>
                    <p className="mt-1 text-sm">{item.value}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Source: {item.source}
                      {item.page != null ? ` · Page ${item.page}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="card p-5">
            <h3>Calculations</h3>
            {calculations.length === 0 ? (
              <p className="mt-3 text-sm">No calculations returned.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {calculations.map((item, index) => (
                  <div key={`${item.label}-${index}`} className="border border-[var(--line)] p-4">
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className="mt-2 font-mono text-xs">
                      {item.expression}
                    </div>
                    <div className="mt-2 text-sm">
                      Result: {item.result == null ? "Could not calculate" : item.result}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="card p-5">
            <h3>Findings</h3>
            {findings.length === 0 ? (
              <p className="mt-3 text-sm">No findings returned.</p>
            ) : (
              <div className="mt-4 divide-y divide-[var(--line)]">
                {findings.map((item) => (
                  <div key={item.id} className="py-4">
                    <h4>{item.title}</h4>
                    <p className="mt-2 text-sm">{item.description}</p>
                    <p className="mt-2 text-xs text-[var(--muted)]">
                      Source: {item.source} · Confidence: {item.confidence}%
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="card p-5">
            <div className="flex items-center gap-2">
              <Target size={16} />
              <h3>Recommended actions</h3>
            </div>
            {actions.length === 0 ? (
              <p className="mt-3 text-sm">No actions returned.</p>
            ) : (
              <div className="mt-4 divide-y divide-[var(--line)]">
                {actions.map((item) => (
                  <div key={item.id} className="flex gap-3 py-4">
                    <span className="mono text-xs">
                      {String(item.priority).padStart(2, "0")}
                    </span>
                    <div className="text-sm">
                      {item.action}
                      {item.is_done && (
                        <span className="ml-2 text-xs">Completed</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {files.length > 0 && (
        <section className="card p-5">
          <h3>Uploaded files</h3>
          <div className="mt-3 divide-y divide-[var(--line)]">
            {files.map((file) => (
              <div key={file.id} className="flex items-center gap-3 py-3">
                <FileText size={16} />
                <div>
                  <p className="text-sm">{file.filename}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {file.content_type} · {(file.size_bytes / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {logs.length > 0 && (
        <section className="card p-5">
          <h3>Processing logs</h3>
          <div className="mt-4 divide-y divide-[var(--line)]">
            {logs.map((log) => (
              <div key={log.id} className="py-3">
                <div className="flex items-center justify-between gap-3">
                  <strong className="text-sm">{log.step}</strong>
                  <span className="text-xs">{log.status}</span>
                </div>
                <p className="mt-1 text-sm">{log.message}</p>
                {log.duration_ms != null && (
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {log.duration_ms} ms
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="flex justify-between gap-3 border-t border-[var(--line)] pt-5">
        <span className="mono text-xs text-[var(--muted)]">
          ANALYSIS ID / {analysis.id}
        </span>
        <Link href="/analysis/new" className="btn btn-primary">
          New Analysis <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
