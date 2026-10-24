"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getAnalysis } from "@/services/admin.service";
import type { AnalysisDetail } from "@/types/admin";
import {
  Badge,
  Card,
  PageHeader,
  QueryState,
  statusTone,
} from "@/components/admin/ui";

export default function AnalysisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [data, setData] = useState<AnalysisDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
  setLoading(true);
  setError("");

  try {
    const { id } = await params;
    console.log(id)
    const parsedId = Number(id);
    console.log(parsedId)
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      throw new Error("Invalid analysis ID");
    }

    const result = await getAnalysis(parsedId);
    setData(result);
  } catch (err) {
    setError(
      err instanceof Error ? err.message : "Failed to load analysis"
    );
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  load();
}, [params]);
    

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8">
      <Link
        href="/admin/analyses"
        className="mb-5 text-[10px] underline underline-offset-4 inline-block font-medium transition hover:opacity-60"
        style={{ color: "#6F6A5E" }}
      >
        ← Analyses
      </Link>
      <PageHeader
        title={data?.title || "Analysis Detail"}
        subtitle={data ? `Analysis #${data.id}` : "Loading analysis..."}
      >
        {data && (
          <Badge tone={statusTone(data.status)}>
            {data.status}
          </Badge>
        )}
      </PageHeader>

      <QueryState
        loading={loading}
        error={error}
        onRetry={load}
        hasData={!!data}
      />

      {data && (
        <>
          {/* Overview */}
          <Card title="Overview">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Info label="Category" value={data.category} />
              <Info label="Input Type" value={data.input_type} />
              <Info label="User" value={data.user_email || "—"} />
              <Info
                label="Confidence"
                value={
                  data.confidence !== null
                    ? `${data.confidence}%`
                    : "—"
                }
              />
              <Info
                label="Processing Time"
                value={
                  data.processing_time_ms !== null
                    ? `${data.processing_time_ms} ms`
                    : "—"
                }
              />
              <Info label="User ID" value={String(data.user_id)} />
              <Info
                label="Created"
                value={formatDate(data.created_at)}
              />
              <Info
                label="Completed"
                value={
                  data.completed_at
                    ? formatDate(data.completed_at)
                    : "—"
                }
              />
            </div>
          </Card>

          {/* Summary */}
          <Card title="Summary">
            {data.summary ? (
              <p className="whitespace-pre-wrap text-[13px] leading-6">
                {data.summary}
              </p>
            ) : (
              <Empty text="No summary available." />
            )}
          </Card>

          {/* Error */}
          {data.error_message && (
            <Card title="Error">
              <div
                className="border px-3 py-3 text-[12px]"
                style={{
                  borderColor: "#C02A0A",
                  color: "#C02A0A",
                  background: "#FFF8F5",
                }}
              >
                {data.error_message}
              </div>
            </Card>
          )}

          {/* Evidence */}
          <Card title={`Evidence Files (${data.evidence_files.length})`}>
            {data.evidence_files.length === 0 ? (
              <Empty text="No evidence files." />
            ) : (
              <div className="space-y-2">
                {data.evidence_files.map((file) => (
                  <div
                    key={file.id}
                    className="flex flex-wrap items-center justify-between gap-3 border p-3"
                    style={{ borderColor: "#E4E0D5" }}
                  >
                    <div>
                      <div className="text-[12px] font-medium">
                        {file.filename}
                      </div>
                      <div
                        className="mt-1 text-[10px]"
                        style={{ color: "#6F6A5E" }}
                      >
                        {file.content_type}
                      </div>
                    </div>

                    <div
                      className="font-mono text-[11px]"
                      style={{ color: "#6F6A5E" }}
                    >
                      {formatBytes(file.size_bytes)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Findings */}
          <Card title={`Findings (${data.findings.length})`}>
            {data.findings.length === 0 ? (
              <Empty text="No findings available." />
            ) : (
              <div className="space-y-3">
                {data.findings.map((finding) => (
                  <div
                    key={finding.id}
                    className="border p-3"
                    style={{ borderColor: "#E4E0D5" }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-[13px] font-semibold">
                        {finding.title}
                      </h3>

                      {finding.confidence !== null && (
                        <span className="font-mono text-[11px]">
                          {finding.confidence}%
                        </span>
                      )}
                    </div>

                    <p
                      className="mt-2 text-[12px] leading-5"
                      style={{ color: "#6F6A5E" }}
                    >
                      {finding.description}
                    </p>

                    {finding.source && (
                      <div
                        className="mt-2 text-[10px]"
                        style={{ color: "#6F6A5E" }}
                      >
                        Source: {finding.source}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Actions */}
          <Card title={`Action Plan (${data.actions.length})`}>
            {data.actions.length === 0 ? (
              <Empty text="No action items available." />
            ) : (
              <div className="space-y-2">
                {data.actions.map((action) => (
                  <div
                    key={action.id}
                    className="flex items-center gap-3 border p-3"
                    style={{ borderColor: "#E4E0D5" }}
                  >
                    <span
                      className="font-mono text-[11px]"
                      style={{ color: "#6F6A5E" }}
                    >
                      P{action.priority}
                    </span>

                    <span className="flex-1 text-[12px]">
                      {action.action}
                    </span>

                    <Badge tone={action.is_done ? "green" : "gray"}>
                      {action.is_done ? "done" : "pending"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Reasoning Logs */}
          <Card title={`Reasoning / Pipeline (${data.reasoning_logs.length})`}>
            {data.reasoning_logs.length === 0 ? (
              <Empty text="No reasoning logs available." />
            ) : (
              <div className="space-y-2">
                {data.reasoning_logs.map((log, index) => (
                  <div
                    key={log.id}
                    className="flex gap-3 border p-3"
                    style={{ borderColor: "#E4E0D5" }}
                  >
                    <div className="w-6 shrink-0 text-center font-mono text-[11px]">
                      {index + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[12px] font-semibold">
                          {log.step}
                        </span>

                        <Badge tone={statusTone(log.status)}>
                          {log.status}
                        </Badge>
                      </div>

                      <p
                        className="mt-1 text-[12px]"
                        style={{ color: "#6F6A5E" }}
                      >
                        {log.message}
                      </p>

                      <div
                        className="mt-2 text-[10px]"
                        style={{ color: "#6F6A5E" }}
                      >
                        {formatDate(log.created_at)}
                        {log.duration_ms !== null &&
                          ` · ${log.duration_ms} ms`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div
        className="text-[10px] uppercase tracking-[0.08em]"
        style={{ color: "#6F6A5E" }}
      >
        {label}
      </div>
      <div className="mt-1 break-words text-[12px] font-medium">
        {value}
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <p className="py-5 text-center text-[12px]" style={{ color: "#6F6A5E" }}>
      {text}
    </p>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}