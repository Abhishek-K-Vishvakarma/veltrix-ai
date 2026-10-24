"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge, Btn, Card, Note, PageHeader, QueryState, Stat, StatGrid, statusTone } from "@/components/admin/ui";
import { useAction, useAsync } from "@/hooks/use-async";
import { fmtBytes, fmtConf, fmtDate, fmtMs } from "@/lib/format";
import { getAnalysis, retryAnalysis } from "@/services/admin.service";

export default function AnalysisDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: a, loading, error, reload } = useAsync(() => getAnalysis(Number(id)), [id]);
  const { run, note } = useAction(reload);

  return (
    <div>
      <PageHeader title={a?.title ?? "Analysis"} subtitle={a ? `#${a.id} · ${a.user_email ?? "unknown user"} · ${fmtDate(a.created_at)}` : undefined}>
        <Link href="/admin/analyses" className="text-[12px] underline">← Back</Link>
        {a && a.status !== "processing" && <Btn onClick={() => run(() => retryAnalysis(a.id), "Retry started")}>Re-run</Btn>}
      </PageHeader>
      <Note note={note} />
      <QueryState loading={loading} error={error} onRetry={reload} hasData={!!a} />
      {a && (
        <>
          <StatGrid>
            <Stat label="Status" value={<Badge tone={statusTone(a.status)}>{a.status}</Badge>} />
            <Stat label="Confidence" value={fmtConf(a.confidence)} />
            <Stat label="Processing time" value={fmtMs(a.processing_time_ms)} />
            <Stat label="Category" value={a.category} />
          </StatGrid>
          {a.error_message && <Card title="Error"><p className="text-[12px]" style={{ color: "#C02A0A" }}>{a.error_message}</p></Card>}
          {a.summary && <Card title="Summary"><p className="text-[13px]">{a.summary}</p></Card>}
          <Card title="Findings">
            {a.findings.length === 0 ? <p className="text-[12px]">No findings.</p> : a.findings.map((f) => (
              <div key={f.id} className="border-t py-2 text-[12px]" style={{ borderColor: "#E4E0D5" }}>
                <div className="font-semibold">{f.title}</div><div>{f.description}</div>
                <div style={{ color: "#6F6A5E" }}>Source: {f.source ?? "—"} · Confidence: {fmtConf(f.confidence)}</div>
              </div>
            ))}
          </Card>
          <Card title="Actions">
            {a.actions.map((x) => <div key={x.id} className="border-t py-2 text-[12px]" style={{ borderColor: "#E4E0D5" }}>{x.is_done ? "✓" : "○"} {x.action}</div>)}
            {a.actions.length === 0 && <p className="text-[12px]">No actions.</p>}
          </Card>
          <Card title="Pipeline log">
            {a.reasoning_logs.map((l) => (
              <div key={l.id} className="flex items-center gap-3 border-t py-2 text-[12px]" style={{ borderColor: "#E4E0D5" }}>
                <Badge tone={statusTone(l.status === "done" ? "ok" : l.status)}>{l.step}</Badge>
                <span className="flex-1">{l.message}</span><span className="font-mono">{fmtMs(l.duration_ms)}</span>
              </div>
            ))}
            {a.reasoning_logs.length === 0 && <p className="text-[12px]">No log entries.</p>}
          </Card>
          <Card title="Evidence files">
            {a.evidence_files.map((e) => <div key={e.id} className="border-t py-2 text-[12px]" style={{ borderColor: "#E4E0D5" }}>{e.filename} · {e.content_type} · {fmtBytes(e.size_bytes)}</div>)}
            {a.evidence_files.length === 0 && <p className="text-[12px]">No files (text-only analysis).</p>}
          </Card>
        </>
      )}
    </div>
  );
}