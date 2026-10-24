"use client";

import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

export const C = {
  ink: "#14130F", muted: "#6F6A5E", line: "#E4E0D5", sand: "#EFEBDF", paper: "#F6F4EE",
  sig: "#FF4A1C", ok: "#0E7C66", warn: "#B45309", bad: "#C02A0A",
};

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em]">{title}</h1>
        {subtitle && <p className="mt-1 text-[12px]" style={{ color: C.muted }}>{subtitle}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

export function Card({ title, right, children }: { title?: string; right?: ReactNode; children: ReactNode }) {
  return (
    <section className="mb-4 border bg-white p-4" style={{ borderColor: C.line }}>
      {(title || right) && (
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: C.muted }}>{title}</h2>
          {right}
        </div>
      )}
      {children}
    </section>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="border bg-white p-4" style={{ borderColor: C.line }}>
      <div className="font-mono text-[24px]">{value}</div>
      <div className="mt-1 text-[11px]" style={{ color: C.muted }}>{label}</div>
      {hint && <div className="mt-1 text-[10px]" style={{ color: C.muted }}>{hint}</div>}
    </div>
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  return <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">{children}</div>;
}

export function Btn({ tone = "ghost", className = "", style, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "primary" | "ghost" | "danger" }) {
  const t =
    tone === "primary" ? { background: C.ink, color: C.paper, borderColor: C.ink }
    : tone === "danger" ? { background: "#fff", color: C.bad, borderColor: C.bad }
    : { background: "#fff", color: C.ink, borderColor: C.line };
  return (
    <button
      {...props}
      style={{ ...t, ...style }}
      className={`h-[30px] border px-3 text-[12px] font-medium transition hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    />
  );
}

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ borderColor: C.line }} className={`h-[30px] border bg-white px-2 text-[12px] outline-none focus:border-[#14130F] ${className}`} />;
}

export function Select({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} style={{ borderColor: C.line }} className={`h-[30px] border bg-white px-2 text-[12px] outline-none focus:border-[#14130F] ${className}`} />;
}

const TONES = {
  green: [C.ok, "#E6F4F0"], red: [C.bad, "#FDECE8"], amber: [C.warn, "#FFF4E0"], gray: [C.muted, C.sand], ink: [C.paper, C.ink],
} as const;

export function Badge({ tone = "gray", children }: { tone?: keyof typeof TONES; children: ReactNode }) {
  return <span className="inline-block px-2 py-[2px] text-[11px] font-medium" style={{ color: TONES[tone][0], background: TONES[tone][1] }}>{children}</span>;
}

export function statusTone(s: string): keyof typeof TONES {
  if (["completed", "indexed", "ok", "info", "active"].includes(s)) return "green";
  if (["failed", "error"].includes(s)) return "red";
  if (["processing", "pending", "warning"].includes(s)) return "amber";
  return "gray";
}

export interface Column<T> { header: string; cell: (row: T) => ReactNode; className?: string }

export function DataTable<T>({ columns, rows, empty = "Nothing here yet." }: { columns: Column<T>[]; rows: T[]; empty?: string }) {
  return (
    <div className="mb-3 overflow-x-auto border bg-white" style={{ borderColor: C.line }}>
      <table className="w-full text-left text-[12px]">
        <thead>
          <tr style={{ background: C.sand }}>
            {columns.map((c) => <th key={c.header} className={`px-3 py-2 font-semibold ${c.className ?? ""}`}>{c.header}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={columns.length} className="px-3 py-8 text-center" style={{ color: C.muted }}>{empty}</td></tr>
          ) : (
            rows.map((r, i) => (
              <tr key={i} className="border-t hover:bg-[#F6F4EE]" style={{ borderColor: C.line }}>
                {columns.map((c) => <td key={c.header} className={`px-3 py-2 align-middle ${c.className ?? ""}`}>{c.cell(r)}</td>)}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Pager({ page, pages, total, onPage }: { page: number; pages: number; total: number; onPage: (p: number) => void }) {
  return (
    <div className="mb-4 flex items-center justify-between text-[12px]" style={{ color: C.muted }}>
      <span>{total} total</span>
      <div className="flex items-center gap-2">
        <Btn disabled={page <= 1} onClick={() => onPage(page - 1)}>← Prev</Btn>
        <span>Page {page} of {Math.max(pages, 1)}</span>
        <Btn disabled={page >= pages} onClick={() => onPage(page + 1)}>Next →</Btn>
      </div>
    </div>
  );
}

export function QueryState({ loading, error, onRetry, hasData }: { loading: boolean; error: string; onRetry: () => void; hasData: boolean }) {
  if (error)
    return (
      <div className="mb-4 flex items-center justify-between border px-3 py-2 text-[12px]" style={{ borderColor: C.bad, color: C.bad, background: "#FFF8F5" }}>
        <span>{error}</span><Btn onClick={onRetry}>Retry</Btn>
      </div>
    );
  if (loading && !hasData) return <p className="mb-4 text-[12px]" style={{ color: C.muted }}>Loading…</p>;
  return null;
}

export function Note({ note }: { note: { ok: boolean; text: string } | null }) {
  if (!note) return null;
  const c = note.ok ? C.ok : C.bad;
  return <div className="mb-3 border px-3 py-2 text-[12px]" style={{ borderColor: c, color: c, background: "#fff" }}>{note.text}</div>;
}

export function Bars({ rows }: { rows: { label: string; value: number; extra?: string }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="space-y-2">
      {rows.length === 0 && <p className="text-[12px]" style={{ color: C.muted }}>No data in this period.</p>}
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-3 text-[11px]">
          <span className="w-20 shrink-0" style={{ color: C.muted }}>{r.label}</span>
          <div className="h-3 flex-1" style={{ background: C.sand }}>
            <div className="h-3" style={{ width: `${(r.value / max) * 100}%`, background: C.ink }} />
          </div>
          <span className="w-28 shrink-0 text-right font-mono">{r.value}{r.extra ? ` · ${r.extra}` : ""}</span>
        </div>
      ))}
    </div>
  );
}