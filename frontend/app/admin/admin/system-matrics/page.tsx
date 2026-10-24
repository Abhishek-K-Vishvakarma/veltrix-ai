"use client";

import { useEffect } from "react";
import { Badge, Btn, Card, PageHeader, QueryState, Stat, StatGrid } from "@/components/admin/ui";
import { useAsync } from "@/hooks/use-async";
import { fmtUptime } from "@/lib/format";
import { getSystemHealth, getSystemMetrics } from "@/services/admin.service";

export default function SystemMetricsPage() {
  const health = useAsync(getSystemHealth);
  const metrics = useAsync(getSystemMetrics);
  const reloadHealth = health.reload;
  const reloadMetrics = metrics.reload;

  // auto refresh every 15 seconds
  useEffect(() => {
    const t = setInterval(() => { void reloadHealth(); void reloadMetrics(); }, 15000);
    return () => clearInterval(t);
  }, [reloadHealth, reloadMetrics]);

  const h = health.data;
  const m = metrics.data;
  const reloadAll = () => { void health.reload(); void metrics.reload(); };

  return (
    <div>
      <PageHeader title="System Metrics" subtitle="Server health and data volume. Refreshes every 15 seconds.">
        <Btn onClick={reloadAll}>Refresh now</Btn>
      </PageHeader>
      <QueryState loading={health.loading} error={health.error || metrics.error} onRetry={reloadAll} hasData={!!h} />
      {h && (
        <StatGrid>
          <Stat label="API" value={<Badge tone="green">{h.api}</Badge>} />
          <Stat label="Database" value={<Badge tone={h.database.status === "ok" ? "green" : "red"}>{h.database.status}</Badge>} hint={h.database.latency_ms != null ? `${h.database.latency_ms} ms` : h.database.detail} />
          <Stat label="Uptime" value={fmtUptime(h.uptime_seconds)} />
          <Stat label="Gemini" value={<Badge tone={h.gemini_configured ? "green" : "amber"}>{h.gemini_configured ? "configured" : "mock mode"}</Badge>} />
        </StatGrid>
      )}
      {m && (
        <>
          <Card title="Records">
            <div className="grid grid-cols-2 gap-3 text-[12px] md:grid-cols-3">
              {Object.entries(m.counts).map(([k, v]) => (
                <div key={k} className="flex justify-between border-b py-1" style={{ borderColor: "#E4E0D5" }}>
                  <span>{k.replace(/_/g, " ")}</span><span className="font-mono">{v}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Storage"><span className="font-mono text-[18px]">{m.storage_mb} MB</span> <span className="text-[12px]" style={{ color: "#6F6A5E" }}>used by uploaded files</span></Card>
        </>
      )}
      {h && <Card title="Runtime"><p className="font-mono text-[12px]">Python {h.python} · {h.platform}</p></Card>}
    </div>
  );
}