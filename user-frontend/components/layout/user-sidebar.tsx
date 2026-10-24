"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Brain,
  Bot,
  ChevronLeft,
  ChevronRight,
  FileText,
  FolderKanban,
  History,
  Home,
  Lightbulb,
  Plus,
  Settings,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { getAnalysisStats } from "@/services/analysis.service";
import { useAuthStore } from "@/store/auth-store";

interface UserSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

interface NavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface NavigationSection {
  label: string;
  items: NavigationItem[];
}

const navigation: NavigationSection[] = [
  {
    label: "Main",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: Home,
      },
      {
        label: "New Analysis",
        href: "/analysis/new",
        icon: Plus,
      },
      {
        label: "History",
        href: "/history",
        icon: History,
      },
    ],
  },
  {
    label: "Workspace",
    items: [
      {
        label: "Documents",
        href: "/documents",
        icon: FileText,
      },
      {
        label: "Knowledge",
        href: "/knowledge",
        icon: Brain,
      },
      {
        label: "AI Chat",
        href: "/chat",
        icon: Bot,
      },
      {
        label: "Projects",
        href: "/projects",
        icon: FolderKanban,
      },
    ],
  },
  {
    label: "Intelligence",
    items: [
      {
        label: "Insights",
        href: "/insights",
        icon: Lightbulb,
      },
      {
        label: "Analytics",
        href: "/analytics",
        icon: BarChart3,
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        label: "Settings",
        href: "/settings",
        icon: Settings,
      },
    ],
  },
];

export default function UserSidebar({
  collapsed = false,
  onToggle,
}: UserSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [analysisTotal, setAnalysisTotal] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    getAnalysisStats()
      .then((stats) => {
        if (active) setAnalysisTotal(stats.total);
      })
      .catch((error: unknown) => {
        console.error("Could not load sidebar analysis usage.", error);
        if (active) setAnalysisTotal(null);
      });

    return () => {
      active = false;
    };
  }, [pathname]);

  const displayName = user?.full_name?.trim() || user?.email || "User";
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const analysisLimit = 5;
  const usagePercent =
    analysisTotal === null
      ? 0
      : Math.min((analysisTotal / analysisLimit) * 100, 100);

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="flex h-full flex-col bg-[var(--surface)]">
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {navigation.map((section) => (
          <div key={section.label} className="mb-6 last:mb-0">
            {!collapsed && (
              <div className="mb-2 px-2 font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-[var(--muted-light)]">
                {section.label}
              </div>
            )}

            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`group relative flex h-9 items-center gap-3 border px-2.5 transition ${
                      active
                        ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]"
                        : "border-transparent text-[var(--muted)] hover:border-[var(--line)] hover:bg-[var(--surface-soft)] hover:text-[var(--ink)]"
                    } ${collapsed ? "justify-center px-0" : ""}`}
                  >
                    {active && (
                      <span className="absolute bottom-0 left-0 top-0 w-[2px] bg-[var(--primary)]" />
                    )}

                    <Icon
                      size={16}
                      strokeWidth={active ? 2 : 1.7}
                      className="shrink-0"
                    />

                    {!collapsed && (
                      <span className="truncate text-[12px] font-medium">
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom user area */}
      <div className="border-t border-[var(--line)] p-3">
        {!collapsed ? (
          <div className="border border-[var(--line)] bg-[var(--surface-soft)] p-3">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center bg-[var(--ink)] text-[10px] font-semibold text-[var(--surface)]">
                {initials}
              </div>

              <div className="min-w-0">
                <div className="truncate text-[11px] font-semibold text-[var(--ink)]">
                  {displayName}
                </div>

                <div className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.08em] text-[var(--muted-light)]">
                  Free Plan
                </div>
              </div>
            </div>

            <div className="mb-3 h-px bg-[var(--line)]" />

            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] text-[var(--muted)]">
                Analysis usage
              </span>

              <span className="font-mono text-[9px] text-[var(--muted-light)]">
                {analysisTotal === null ? "—" : analysisTotal} / {analysisLimit}
              </span>
            </div>

            <div
              className="h-1 bg-[var(--line)]"
              role="progressbar"
              aria-label="Analysis usage"
              aria-valuemin={0}
              aria-valuemax={analysisLimit}
              aria-valuenow={Math.min(analysisTotal ?? 0, analysisLimit)}
            >
              <div
                className="h-full bg-[var(--primary)] transition-[width]"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="flex h-8 w-8 items-center justify-center bg-[var(--ink)] text-[10px] font-semibold text-[var(--surface)]">
              {initials}
            </div>
          </div>
        )}

        {/* Collapse button */}
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`mt-3 flex h-8 w-full items-center border border-[var(--line)] text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--ink)] ${
            collapsed ? "justify-center" : "justify-center gap-2"
          }`}
        >
          {collapsed ? (
            <ChevronRight size={14} strokeWidth={1.8} />
          ) : (
            <>
              <ChevronLeft size={14} strokeWidth={1.8} />
              <span className="font-mono text-[9px] uppercase tracking-[0.08em]">
                Collapse
              </span>
            </>
          )}
        </button>

        <div
          className={`mt-3 flex items-center text-[var(--muted-light)] ${
            collapsed ? "justify-center" : "gap-2 px-1"
          }`}
        >
          <Sparkles size={11} strokeWidth={1.8} />

          {!collapsed && (
            <span className="font-mono text-[8px] uppercase tracking-[0.1em]">
              VELTRIX AI
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
