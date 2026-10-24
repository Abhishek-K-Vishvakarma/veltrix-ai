"use client";

import { useState } from "react";
import { Bars, Card, PageHeader, QueryState, Select, Stat, StatGrid } from "@/components/admin/ui";
import { useAsync } from "@/hooks/use-async";
import { fmtConf, fmtMs } from "@/lib/format";
import { getAiPerformance } from "@/services/admin.service";

export default function AiPerformancePage() {
  const [days, setDays] = useState(7);
  const { data: d, loading, error, reload } = useAsync(() => getAiPerformance(days), [days]);

  return (
    <div>
      <PageHeader title="AI Performance" subtitle="Requests, latency and token usage of the AI pipeline.">
        <Select value={days} onChange={(e) => setDays(Number(e.target.value))}>
          <option value={1}>Last 24 hours</option><option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option>
        </Select>
      </PageHeader>
      <QueryState loading={loading} error={error} onRetry={reload} hasData={!!d} />
      {d && (
        <>
          <StatGrid>
            <Stat label="Total requests" value={d.total_requests} hint={`${d.failed} failed`} />
            <Stat label="Success rate" value={`${d.success_rate}%`} />
            <Stat label="Avg latency" value={fmtMs(d.avg_latency_ms)} hint={`p95 ${fmtMs(d.p95_latency_ms)}`} />
            <Stat label="Avg confidence" value={fmtConf(d.avg_confidence)} />
            <Stat label="Total tokens" value={d.total_tokens.toLocaleString()} />
            <Stat label="Prompt tokens" value={d.prompt_tokens.toLocaleString()} />
            <Stat label="Completion tokens" value={d.completion_tokens.toLocaleString()} />
          </StatGrid>
          <Card title="Requests per day">
            <Bars rows={d.daily.map((x) => ({ label: x.date.slice(5), value: x.requests, extra: `${fmtMs(x.avg_latency_ms)}${x.failures ? ` · ${x.failures} failed` : ""}` }))} />
          </Card>
        </>
      )}
    </div>
  );
}