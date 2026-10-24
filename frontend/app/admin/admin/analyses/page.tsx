"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge, Btn, DataTable, Input, Note, PageHeader, Pager, QueryState, Select, statusTone, type Column } from "@/components/admin/ui";
import { useAction, useAsync } from "@/hooks/use-async";
import { fmtConf, fmtDate, fmtMs } from "@/lib/format";
import { deleteAnalysis, listAnalyses, retryAnalysis } from "@/services/admin.service";
import type { AnalysisRow } from "@/types/admin";

export default function AnalysesPage() {
  const [draft, setDraft] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);

  const { data, loading, error, reload } = useAsync(() => listAnalyses({ q, status, category, page, size: 15 }), [q, status, category, page]);
  const { run, note } = useAction(reload);

  const columns: Column<AnalysisRow>[] = [
    { header: "Title", cell: (a) => <Link href={`/admin/analyses/${a.id}`} className="font-semibold underline underline-offset-2">{a.title}</Link> },
    { header: "User", cell: (a) => a.user_email ?? "—" },
    { header: "Category", cell: (a) => a.category },
    { header: "Status", cell: (a) => <Badge tone={statusTone(a.status)}>{a.status}</Badge> },
    { header: "Confidence", cell: (a) => <span className="font-mono">{fmtConf(a.confidence)}</span> },
    { header: "Time", cell: (a) => fmtMs(a.processing_time_ms) },
    { header: "Created", cell: (a) => fmtDate(a.created_at) },
    {
      header: "Actions",
      cell: (a) => (
        <div className="flex gap-1">
          {a.status === "failed" && <Btn onClick={() => run(() => retryAnalysis(a.id), "Retry started")}>Retry</Btn>}
          <Btn tone="danger" onClick={() => { if (window.confirm(`Delete "${a.title}"?`)) void run(() => deleteAnalysis(a.id), "Analysis deleted"); }}>Delete</Btn>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Analyses" subtitle="Every investigation across all users." />
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Input placeholder="Search title" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { setQ(draft); setPage(1); } }} />
        <Btn onClick={() => { setQ(draft); setPage(1); }}>Search</Btn>
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">Any status</option><option>completed</option><option>failed</option><option>processing</option><option>pending</option>
        </Select>
        <Select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
          <option value="">Any category</option><option>Financial</option><option>Technical</option><option>Documents</option><option>Other</option>
        </Select>
      </div>
      <Note note={note} />
      <QueryState loading={loading} error={error} onRetry={reload} hasData={!!data} />
      {data && (<><DataTable columns={columns} rows={data.items} empty="No analyses found." /><Pager page={data.page} pages={data.pages} total={data.total} onPage={setPage} /></>)}
    </div>
  );
}