"use client";

import { useState } from "react";
import { Badge, Btn, DataTable, Input, Note, PageHeader, Pager, QueryState, Select, statusTone, type Column } from "@/components/admin/ui";
import { useAction, useAsync } from "@/hooks/use-async";
import { fmtDate } from "@/lib/format";
import { cleanupLogs, listLogs } from "@/services/admin.service";
import type { LogRow } from "@/types/admin";

export default function ActivityLogsPage() {
  const [draft, setDraft] = useState("");
  const [q, setQ] = useState("");
  const [level, setLevel] = useState("");
  const [page, setPage] = useState(1);

  const { data, loading, error, reload } = useAsync(() => listLogs({ q, level, page, size: 25 }), [q, level, page]);
  const { run, note } = useAction(reload);

  const columns: Column<LogRow>[] = [
    { header: "Time", cell: (l) => fmtDate(l.created_at) },
    { header: "Level", cell: (l) => <Badge tone={statusTone(l.level)}>{l.level}</Badge> },
    { header: "Action", cell: (l) => <span className="font-mono">{l.action}</span> },
    { header: "User", cell: (l) => l.user_email ?? "system" },
    { header: "Detail", cell: (l) => l.detail },
    { header: "IP", cell: (l) => l.ip ?? "—" },
  ];

  return (
    <div>
      <PageHeader title="Activity Logs" subtitle="Who did what, and when.">
        <Btn tone="danger" onClick={() => {
          const days = window.prompt("Delete logs older than how many days?", "30");
          if (days && Number(days) >= 1) void run(async () => { const r = await cleanupLogs(Number(days)); alert(`${r.deleted} logs deleted`); }, "Cleanup finished");
        }}>Clean old logs</Btn>
      </PageHeader>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Input placeholder="Search action or detail" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { setQ(draft); setPage(1); } }} />
        <Btn onClick={() => { setQ(draft); setPage(1); }}>Search</Btn>
        <Select value={level} onChange={(e) => { setLevel(e.target.value); setPage(1); }}>
          <option value="">All levels</option><option>info</option><option>warning</option><option>error</option>
        </Select>
      </div>
      <Note note={note} />
      <QueryState loading={loading} error={error} onRetry={reload} hasData={!!data} />
      {data && (<><DataTable columns={columns} rows={data.items} empty="No logs found." /><Pager page={data.page} pages={data.pages} total={data.total} onPage={setPage} /></>)}
    </div>
  );
}