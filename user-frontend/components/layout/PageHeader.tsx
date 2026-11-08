import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type PageHeaderProps = {
  breadcrumb: string;
  title: string;
  description?: string;
  action?: ReactNode;
  backHref?: string;
  backLabel?: string;
  variant?: "line" | "card";   // "line" = bottom border, "card" = white card
};

export default function PageHeader({
  breadcrumb,
  title,
  description,
  action,
  backHref,
  backLabel = "Back",
  variant = "line",
}: PageHeaderProps) {
  const isCard = variant === "card";

  return (
    <section
      className={
        isCard ? "card" : "border-b border-[var(--line)]"
      }
      style={
        isCard
          ? { padding: "32px", marginBottom: "24px" }
          : { paddingBottom: "24px" }
      }
    >
      {backHref && (
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm text-[var(--muted)] transition hover:text-[var(--ink)]"
          style={{ marginBottom: "20px" }}
        >
          <ArrowLeft size={14} />
          {backLabel}
        </Link>
      )}

      <div
        className={`flex flex-col justify-between gap-5 md:flex-row ${
          isCard ? "md:items-center" : "md:items-end"
        }`}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2" style={{ marginBottom: "12px" }}>
            <span className="signal-dot" />
            <span className="mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted-light)]">
              {breadcrumb}
            </span>
          </div>

          <h1
            className="font-semibold tracking-[-0.03em] text-[var(--ink)]"
            style={{
              fontSize: "1.875rem",
              lineHeight: 1.2,
              margin: 0,
              wordBreak: "break-word",
            }}
          >
            {title}
          </h1>

          {description && (
            <p
              className="max-w-xl text-[var(--muted)]"
              style={{
                marginTop: "12px",
                marginBottom: 0,
                fontSize: "0.875rem",
                lineHeight: 1.6,
              }}
            >
              {description}
            </p>
          )}
        </div>

        {action && <div className="shrink-0 self-start md:self-auto">{action}</div>}
      </div>
    </section>
  );
}