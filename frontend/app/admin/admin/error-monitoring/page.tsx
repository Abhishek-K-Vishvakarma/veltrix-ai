"use client";

import Link from "next/link";
import { Badge, Card, DataTable, PageHeader, QueryState, Stat, StatGrid, statusTone, type Column } from "@/components/admin/ui";
import { useAsync } from "@/hooks/use-async";
import { fmtDate } from "@/lib/format";
import { getErrorMonitoring } from "@/services/admin.service";
import type { ErrorMonitoring, LogRow } from "@/types/admin";

type Failed = ErrorMonitoring["failed_analyses"][number];

export default function ErrorMonitoringPage() {
  const { data, loading, error, reload } = useAsync(() => getErrorMonitoring(30));

  const logCols: Column<LogRow>[] = [
    { header: "Time", cell: (l) => fmtDate(l.created_at) },
    { header: "Level", cell: (l) => <Badge tone={statusTone(l.level)}>{l.level}</Badge> },
    { header: "Action", cell: (l) => <span className="font-mono">{l.action}</span> },
    { header: "User", cell: (l) => l.user_email ?? "system" },
    { header: "Detail", cell: (l) => l.detail },
  ];
  const failedCols: Column<Failed>[] = [
    { header: "Analysis", cell: (a) => <Link href={`/admin/analyses/${a.id}`} className="font-semibold underline">{a.title}</Link> },
    { header: "User", cell: (a) => a.user_email ?? "—" },
    { header: "Error", cell: (a) => <span style={{ color: "#C02A0A" }}>{a.error_message ?? "—"}</span> },
    { header: "When", cell: (a) => fmtDate(a.created_at) },
  ];

  return (
    <div>
      <PageHeader title="Error Monitoring" subtitle="Failed analyses and error-level logs." />
      <QueryState loading={loading} error={error} onRetry={reload} hasData={!!data} />
      {data && (
        <>
          <StatGrid>
            <Stat label="Failed analyses" value={data.total_failed_analyses} />
            <Stat label="Error logs" value={data.total_error_logs} />
          </StatGrid>
          <Card title="Failed analyses"><DataTable columns={failedCols} rows={data.failed_analyses} empty="No failed analyses." /></Card>
          <Card title="Error logs"><DataTable columns={logCols} rows={data.error_logs} empty="No error logs." /></Card>
        </>
      )}
    </div>
  );
}