import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function DashboardBackLink() {
  return (
    <Link
      href="/dashboard"
      className="mb-5 inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--muted)] transition hover:text-[var(--ink)]"
    >
      <ArrowLeft aria-hidden="true" size={12} />
      Back to dashboard
    </Link>
  );
}
