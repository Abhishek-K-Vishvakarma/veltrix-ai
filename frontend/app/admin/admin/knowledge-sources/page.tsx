"use client";

import { useState } from "react";
import { Badge, Btn, DataTable, Input, Note, PageHeader, Pager, QueryState, statusTone, type Column } from "@/components/admin/ui";
import { useAction, useAsync } from "@/hooks/use-async";
import { fmtBytes, fmtDate } from "@/lib/format";
import { deleteKnowledgeSource, listKnowledgeSources, uploadKnowledgeSource } from "@/services/admin.service";
import type { KnowledgeSourceRow } from "@/types/admin";

export default function KnowledgeSourcesPage() {
  const [page, setPage] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [inputKey, setInputKey] = useState(0);
  const { data, loading, error, reload } = useAsync(() => listKnowledgeSources({ page, size: 15 }), [page]);
  const { run, note } = useAction(reload);

  const columns: Column<KnowledgeSourceRow>[] = [
    { header: "Name", cell: (s) => <span className="font-semibold">{s.name}</span> },
    { header: "Type", cell: (s) => s.source_type.toUpperCase() },
    { header: "Status", cell: (s) => <Badge tone={statusTone(s.status)}>{s.status}</Badge> },
    { header: "Chunks", cell: (s) => s.chunk_count },
    { header: "Size", cell: (s) => fmtBytes(s.size_bytes) },
    { header: "Owner", cell: (s) => s.owner_email ?? "—" },
    { header: "Added", cell: (s) => fmtDate(s.created_at) },
    { header: "", cell: (s) => <Btn tone="danger" onClick={() => { if (window.confirm(`Delete ${s.name}?`)) void run(() => deleteKnowledgeSource(s.id), "Source deleted"); }}>Delete</Btn> },
  ];

  return (
    <div>
      <PageHeader title="Knowledge Sources" subtitle="Documents the AI can use as reference. Status stays pending until indexing (RAG) is built.">
        <Input key={inputKey} type="file" accept=".pdf,.txt,.csv,.docx" className="w-64" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <Btn tone="primary" disabled={!file} onClick={() => {
          if (!file) return;
          void run(() => uploadKnowledgeSource(file), "Uploaded").then(() => { setFile(null); setInputKey((k) => k + 1); });
        }}>Upload</Btn>
      </PageHeader>
      <Note note={note} />
      <QueryState loading={loading} error={error} onRetry={reload} hasData={!!data} />
      {data && (<><DataTable columns={columns} rows={data.items} empty="No knowledge sources yet." /><Pager page={data.page} pages={data.pages} total={data.total} onPage={setPage} /></>)}
    </div>
  );
}