"use client";

import { useState } from "react";
import { Badge, Btn, Card, DataTable, Input, Note, PageHeader, QueryState, type Column } from "@/components/admin/ui";
import { useAction, useAsync } from "@/hooks/use-async";
import { fmtDate, fmtMs } from "@/lib/format";
import { getModels, setActiveModel } from "@/services/admin.service";
import type { ModelsInfo } from "@/types/admin";

type Usage = ModelsInfo["usage"][number];

export default function ModelsPage() {
  const { data, loading, error, reload } = useAsync(getModels);
  const { run, note } = useAction(reload);
  const [model, setModel] = useState("");

  const columns: Column<Usage>[] = [
    { header: "Model", cell: (u) => <span className="font-mono">{u.model}</span> },
    { header: "Requests", cell: (u) => u.requests },
    { header: "Success", cell: (u) => `${u.success_rate}%` },
    { header: "Avg latency", cell: (u) => fmtMs(u.avg_latency_ms) },
    { header: "Tokens", cell: (u) => u.total_tokens.toLocaleString() },
    { header: "Last used", cell: (u) => fmtDate(u.last_used) },
  ];

  return (
    <div>
      <PageHeader title="Models" subtitle="Which AI model runs new analyses." />
      <Note note={note} />
      <QueryState loading={loading} error={error} onRetry={reload} hasData={!!data} />
      {data && (
        <>
          {data.mock_mode && (
            <div className="mb-4 border px-3 py-2 text-[12px]" style={{ borderColor: "#B45309", color: "#B45309", background: "#FFF4E0" }}>
              Mock mode: GEMINI_API_KEY is not set, so results are sample data.
            </div>
          )}
          <Card title="Active model">
            <div className="mb-3 flex flex-wrap items-center gap-3 text-[13px]">
              <span className="font-mono text-[16px]">{data.active_model}</span>
              <Badge tone={data.api_key_configured ? "green" : "amber"}>{data.api_key_configured ? "API key set" : "No API key"}</Badge>
              <span style={{ color: "#6F6A5E" }}>Provider: {data.provider} · Default from .env: {data.configured_model}</span>
            </div>
            <form className="flex gap-2" onSubmit={async (e) => { e.preventDefault(); await run(() => setActiveModel(model.trim()), `Active model is now ${model.trim()}`); setModel(""); }}>
              <Input required placeholder="gemini-… (model name)" pattern="gemini-[A-Za-z0-9._-]+" value={model} onChange={(e) => setModel(e.target.value)} className="w-72" />
              <Btn tone="primary" type="submit">Switch model</Btn>
            </form>
            <p className="mt-2 text-[11px]" style={{ color: "#6F6A5E" }}>The switch lasts until the server restarts. Set GEMINI_MODEL in the environment to make it permanent.</p>
          </Card>
          <Card title="Usage by model"><DataTable columns={columns} rows={data.usage} empty="No AI requests yet." /></Card>
        </>
      )}
    </div>
  );
}