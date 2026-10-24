"use client";

import { Badge, Card, PageHeader, QueryState } from "@/components/admin/ui";
import { useAsync } from "@/hooks/use-async";
import { getSystemSettings } from "@/services/admin.service";

export default function SettingsPage() {
  const { data: s, loading, error, reload } = useAsync(getSystemSettings);
  const rows: [string, React.ReactNode][] = s
    ? [
        ["Frontend URL", s.frontend_url],
        ["Access token lifetime", `${s.access_token_minutes} minutes`],
        ["Gemini model", s.gemini_model],
        ["Gemini API key", <Badge key="k" tone={s.gemini_configured ? "green" : "amber"}>{s.gemini_configured ? "configured" : "not set (mock mode)"}</Badge>],
        ["Upload directory", s.upload_dir],
      ]
    : [];

  return (
    <div>
      <PageHeader title="Settings" subtitle="Read-only. Change these in the server environment variables, then restart." />
      <QueryState loading={loading} error={error} onRetry={reload} hasData={!!s} />
      {s && (
        <Card>
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between border-b py-2 text-[12px] last:border-b-0" style={{ borderColor: "#E4E0D5" }}>
              <span style={{ color: "#6F6A5E" }}>{k}</span><span className="font-mono">{v}</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}