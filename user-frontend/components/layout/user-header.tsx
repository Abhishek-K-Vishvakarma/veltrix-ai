"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent as ReactKeyboardEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Clock3,
  CornerDownLeft,
  LoaderCircle,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";

import { getAnalysesPage, type Analysis } from "@/services/analysis.service";
import { getMe, isAuthenticated } from "@/services/auth.service";
import { authStore, useAuthStore } from "@/store/auth-store";

interface UserHeaderProps {
  onMenuClick?: () => void;
}

const NOTIF_SEEN_KEY = "veltrix:notifications-seen-at";

function timeAgo(value?: string): string {
  if (!value) return "";
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return "";

  const minutes = Math.max(0, Math.floor((Date.now() - then) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function describeStatus(status: string) {
  switch (status.toLowerCase()) {
    case "completed":
    case "verified":
      return { text: "Analysis completed", tone: "ok" as const };
    case "failed":
      return { text: "Analysis failed, review it", tone: "bad" as const };
    default:
      return { text: "Analysis in progress", tone: "wait" as const };
  }
}

/**
 * Pages the search box can jump to.
 * Check the `href` values against your real routes.
 */
const SEARCH_ITEMS = [
  { label: "Dashboard", href: "/dashboard", hint: "Overview", keywords: "home main overview" },
  { label: "New Analysis", href: "/analysis/new", hint: "Start an analysis", keywords: "create upload evidence question" },
  { label: "History", href: "/history", hint: "Past analyses", keywords: "previous recent results" },
  { label: "Documents", href: "/documents", hint: "Your files", keywords: "files upload pdf" },
  { label: "Knowledge", href: "/knowledge", hint: "Knowledge Base", keywords: "kb sources indexed" },
  { label: "AI Chat", href: "/chat", hint: "Ask VELTRIX AI", keywords: "assistant ask bot" },
  { label: "Projects", href: "/projects", hint: "Your projects", keywords: "workspace" },
  { label: "Insights", href: "/insights", hint: "Findings and actions", keywords: "recommendations findings" },
  { label: "Analytics", href: "/analytics", hint: "Workspace activity", keywords: "stats charts report" },
  { label: "Settings", href: "/settings", hint: "Account settings", keywords: "profile account preferences" },
];

function formatDate(value?: string | null): string {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getInitials(name?: string): string {
  if (!name?.trim()) return "U";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

/* ───────────────────────── Search palette ───────────────────────── */

function SearchPalette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SEARCH_ITEMS;
    return SEARCH_ITEMS.filter((item) =>
      `${item.label} ${item.hint} ${item.keywords}`.toLowerCase().includes(q),
    );
  }, [query]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setActive(0);
  }, [query]);

  function go(href: string) {
    onClose();
    router.push(href);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const target = results[active];
    if (target) go(target.href);
  }

  function onKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      onClose();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    }
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center bg-black/50 px-3 pt-[12vh] backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Search VELTRIX"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={onSubmit}
        className="w-full max-w-lg border border-[var(--line)] bg-[var(--surface)] shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-[var(--line)] px-4">
          <Search size={16} strokeWidth={1.8} className="shrink-0 text-[var(--muted)]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search pages…"
            aria-label="Search pages"
            className="h-12 min-w-0 flex-1 bg-transparent text-sm text-[var(--ink)] outline-none placeholder:text-[var(--muted)]"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="flex h-8 w-8 shrink-0 items-center justify-center text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--ink)]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-2">
          {results.length ? (
            results.map((item, index) => (
              <button
                key={item.href}
                type="button"
                onClick={() => go(item.href)}
                onMouseEnter={() => setActive(index)}
                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition ${
                  index === active ? "bg-[var(--surface-soft)]" : ""
                }`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium text-[var(--ink)]">
                    {item.label}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-[var(--muted)]">
                    {item.hint}
                  </span>
                </span>
                {index === active ? (
                  <CornerDownLeft size={13} className="shrink-0 text-[var(--muted)]" />
                ) : (
                  <ArrowUpRight size={13} className="shrink-0 text-[var(--muted-light)]" />
                )}
              </button>
            ))
          ) : (
            <p className="px-3 py-8 text-center text-xs text-[var(--muted)]">
              No matching pages for “{query}”.
            </p>
          )}
        </div>

        <div className="hidden items-center justify-between border-t border-[var(--line)] px-4 py-2 font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--muted-light)] sm:flex">
          <span>↑ ↓ to move</span>
          <span>Enter to open · Esc to close</span>
        </div>
      </form>
    </div>
  );
}

/* ───────────────────────────── Header ───────────────────────────── */

export default function UserHeader({ onMenuClick }: UserHeaderProps) {
  const router = useRouter();
  const { user } = useAuthStore();

  const [profileOpen, setProfileOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifItems, setNotifItems] = useState<Analysis[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState(false);
  const [seenAt, setSeenAt] = useState(0);

  const [logoutLoading, setLogoutLoading] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Recent analysis activity powers the bell.
  async function loadNotifications() {
    setNotifLoading(true);
    setNotifError(false);

    try {
      const page = await getAnalysesPage(undefined, 1, 6);
      setNotifItems(page.items);
    } catch {
      setNotifError(true);
    } finally {
      setNotifLoading(false);
    }
  }

  useEffect(() => {
    if (!isAuthenticated()) return;

    try {
      setSeenAt(Number(window.localStorage.getItem(NOTIF_SEEN_KEY)) || 0);
    } catch {
      /* storage unavailable: treat everything as unseen */
    }

    void loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unreadCount = notifItems.filter((item) => {
    const created = new Date(item.created_at ?? "").getTime();
    return !Number.isNaN(created) && created > seenAt;
  }).length;

  function toggleNotifications() {
    const next = !notifOpen;
    setNotifOpen(next);
    setProfileOpen(false);

    if (next) {
      void loadNotifications();
      const now = Date.now();
      setSeenAt(now);
      try {
        window.localStorage.setItem(NOTIF_SEEN_KEY, String(now));
      } catch {
        /* ignore */
      }
    }
  }

  // Fetch the current user if the shared auth store has no user yet.
  useEffect(() => {
    if (user || !isAuthenticated()) return;

    let cancelled = false;

    async function loadProfile() {
      setProfileLoading(true);

      try {
        const currentUser = await getMe();

        if (!cancelled) {
          authStore.setUser(currentUser);
        }
      } catch {
        if (!cancelled) {
          authStore.clearUser();
          router.replace("/auth/login");
        }
      } finally {
        if (!cancelled) {
          setProfileLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [user, router]);

  // Close dropdown when clicking outside it.
  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node;

      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }

      if (notifRef.current && !notifRef.current.contains(target)) {
        setNotifOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // Ctrl/Cmd + K opens search.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setProfileOpen(false);
        setNotifOpen(false);
        setSearchOpen(true);
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function handleLogout() {
    if (logoutLoading) return;

    setLogoutLoading(true);
    setProfileOpen(false);

    authStore.clearUser();
    router.replace("/auth/login");
  }

  const displayName = user?.full_name || "Loading profile";
  const initials = getInitials(user?.full_name);

  return (
    <>
      <header className="flex h-full items-center border-b border-[var(--line)] bg-[var(--surface)]">
        <div className="flex h-full w-full items-center justify-between gap-2 pl-5 pr-3 sm:pl-7 sm:pr-5 lg:pl-8">
          {/* Brand */}
          <div className="flex min-w-0 items-center gap-3 lg:min-w-[220px]">
            <button
              type="button"
              onClick={onMenuClick}
              aria-label="Toggle sidebar"
              className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] transition hover:border-[var(--line-strong)] hover:bg-[var(--surface-soft)] lg:h-8 lg:w-8"
            >
              <Menu size={16} strokeWidth={1.8} />
            </button>
            <a href="/">
            <div className="flex min-w-0 items-center gap-2.5">
              {/* Veltrix AI logo */}
              <Image
                src="/veltrix-icon.svg"
                alt="Veltrix AI logo"
                width={40}
                height={40}
                priority
                className="h-12 w-12 shrink-0 object-contain"
              />

              <div className="min-w-0 leading-none">
                <div className="text-[14px] font-semibold tracking-[-0.02em] text-[var(--ink)]">
                  VELTRIX
                </div>

                <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.16em] text-[var(--muted-light)]">
                  Intelligence
                </div>
              </div>
            </div>
            </a>
          </div>
          {/* Search bar (tablet / desktop) */}
          <div className="hidden max-w-xl flex-1 px-4 md:block lg:px-8">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Open search"
              className="flex h-9 w-full items-center justify-between border border-[var(--line)] bg-[var(--surface-soft)] px-3 text-left transition hover:border-[var(--line-strong)]"
            >
              <div className="flex items-center gap-2">
                <Search
                  size={14}
                  strokeWidth={1.8}
                  className="text-[var(--muted)]"
                />

                <span className="text-[12px] text-[var(--muted)]">
                  Search VELTRIX...
                </span>
              </div>

              <span className="hidden font-mono text-[9px] text-[var(--muted-light)] lg:inline">
                CTRL K
              </span>
            </button>
          </div>

          {/* Right actions */}
          <div className="flex shrink-0 items-center justify-end gap-1 sm:gap-2 lg:min-w-[220px]">
            {/* Search icon (mobile) */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Open search"
              className="flex h-9 w-9 items-center justify-center border border-transparent text-[var(--muted)] transition hover:border-[var(--line)] hover:bg-[var(--surface-soft)] hover:text-[var(--ink)] md:hidden"
            >
              <Search size={17} strokeWidth={1.8} />
            </button>

            {/* Notifications: recent analysis activity */}
            <div ref={notifRef} className="relative">
              <button
                type="button"
                aria-label={
                  unreadCount
                    ? `Notifications, ${unreadCount} new`
                    : "Notifications"
                }
                aria-expanded={notifOpen}
                onClick={toggleNotifications}
                className={`relative flex h-9 w-9 items-center justify-center border text-[var(--muted)] transition hover:border-[var(--line)] hover:bg-[var(--surface-soft)] hover:text-[var(--ink)] ${
                  notifOpen
                    ? "border-[var(--line)] bg-[var(--surface-soft)]"
                    : "border-transparent"
                }`}
              >
                <Bell size={16} strokeWidth={1.8} />

                {unreadCount > 0 && (
                  <span className="absolute right-[7px] top-[7px] h-1.5 w-1.5 bg-[var(--signal)]" />
                )}
              </button>

              {notifOpen && (
                <div className="fixed left-3 right-3 top-[60px] z-[60] border border-[var(--line)] bg-[var(--surface)] shadow-xl sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[360px]">
                  <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
                    <div>
                      <div className="text-[13px] font-semibold text-[var(--ink)]">
                        Notifications
                      </div>
                      <div className="mt-0.5 text-[10px] text-[var(--muted)]">
                        Recent analysis activity
                      </div>
                    </div>

                    <Link
                      href="/history"
                      onClick={() => setNotifOpen(false)}
                      className="text-[10px] font-semibold text-[var(--ink)] underline-offset-4 hover:underline"
                    >
                      View all
                    </Link>
                  </div>

                  <div className="max-h-[60vh] overflow-y-auto">
                    {notifLoading && notifItems.length === 0 ? (
                      <div className="space-y-2 p-3" role="status">
                        {[0, 1, 2].map((item) => (
                          <div
                            key={item}
                            className="h-12 animate-pulse bg-[var(--surface-soft)]"
                          />
                        ))}
                      </div>
                    ) : notifError && notifItems.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <p className="text-xs text-[var(--muted)]">
                          Could not load notifications.
                        </p>
                        <button
                          type="button"
                          onClick={() => void loadNotifications()}
                          className="mt-3 border border-[var(--line)] px-3 py-1.5 text-[11px] font-medium text-[var(--ink)] transition hover:bg-[var(--surface-soft)]"
                        >
                          Try again
                        </button>
                      </div>
                    ) : notifItems.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <Bell
                          size={20}
                          strokeWidth={1.6}
                          className="mx-auto text-[var(--muted-light)]"
                        />
                        <p className="mt-3 text-xs font-medium text-[var(--ink)]">
                          You&apos;re all caught up
                        </p>
                        <p className="mt-1 text-[11px] text-[var(--muted)]">
                          Updates on your analyses will show up here.
                        </p>
                      </div>
                    ) : (
                      <ul className="divide-y divide-[var(--line)]">
                        {notifItems.map((item) => {
                          const info = describeStatus(item.status);
                          const Icon =
                            info.tone === "ok"
                              ? CheckCircle2
                              : info.tone === "bad"
                                ? CircleAlert
                                : Clock3;
                          const color =
                            info.tone === "ok"
                              ? "text-emerald-600"
                              : info.tone === "bad"
                                ? "text-red-600"
                                : "text-amber-600";

                          return (
                            <li key={item.id}>
                              <Link
                                href={`/analysis/${item.id}`}
                                onClick={() => setNotifOpen(false)}
                                className="flex items-start gap-3 px-4 py-3 transition hover:bg-[var(--surface-soft)]"
                              >
                                <Icon
                                  size={16}
                                  strokeWidth={1.8}
                                  className={`mt-0.5 shrink-0 ${color}`}
                                />
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate text-[12px] font-medium text-[var(--ink)]">
                                    {item.title || `Analysis #${item.id}`}
                                  </span>
                                  <span className="mt-0.5 block text-[11px] text-[var(--muted)]">
                                    {info.text}
                                  </span>
                                </span>
                                <span className="shrink-0 font-mono text-[9px] text-[var(--muted-light)]">
                                  {timeAgo(item.created_at)}
                                </span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mx-1 hidden h-6 w-px bg-[var(--line)] sm:block" />

            {/* Plan */}
            <div className="hidden items-center sm:flex">
              <div className="leading-none">
                <div className="text-[11px] font-medium text-[var(--ink)]">
                  Free
                </div>

                <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.08em] text-[var(--muted-light)]">
                  Plan
                </div>
              </div>
            </div>

            {/* Profile menu */}
            <div ref={profileRef} className="relative sm:ml-1">
              <button
                type="button"
                aria-label="Open profile menu"
                aria-expanded={profileOpen}
                onClick={() => setProfileOpen((current) => !current)}
                className="flex items-center gap-2 border border-transparent py-1.5 pl-1.5 pr-1.5 transition hover:border-[var(--line)] hover:bg-[var(--surface-soft)] sm:pl-2"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-[var(--ink)] text-[10px] font-semibold text-[var(--surface)] sm:h-7 sm:w-7">
                  {profileLoading ? (
                    <LoaderCircle size={13} className="animate-spin" />
                  ) : (
                    initials
                  )}
                </div>

                <div className="hidden text-left sm:block">
                  <div className="max-w-[130px] truncate text-[11px] font-medium text-[var(--ink)]">
                    {displayName}
                  </div>

                  <div className="mt-0.5 font-mono text-[8px] uppercase text-[var(--muted-light)]">
                    {user?.role || "USER"}
                  </div>
                </div>

                <ChevronDown
                  size={13}
                  strokeWidth={1.8}
                  className={`text-[var(--muted)] transition-transform ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full z-[60] mt-2 w-[min(340px,calc(100vw-24px))] border border-[var(--line)] bg-[var(--surface)] shadow-xl">
                  {/* Profile heading */}
                  <div className="border-b border-[var(--line)] p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-[var(--ink)] text-sm font-semibold text-[var(--surface)]">
                        {initials}
                      </div>

                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-[var(--ink)]">
                          {user?.full_name || "Loading profile..."}
                        </div>

                        <div className="mt-1 break-all text-[11px] text-[var(--muted)]">
                          {user?.email || "—"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Account details */}
                  <div className="space-y-4 p-4">
                    <div className="flex items-start gap-3">
                      <ShieldCheck
                        size={15}
                        className="mt-0.5 shrink-0 text-[var(--muted)]"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] text-[var(--muted)]">
                          Account role
                        </div>

                        <div className="mt-1 text-xs font-medium capitalize text-[var(--ink)]">
                          {user?.role || "—"}
                        </div>
                      </div>

                      <span
                        className={`border px-2 py-1 text-[9px] font-medium ${
                          user?.is_active
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-red-200 bg-red-50 text-red-700"
                        }`}
                      >
                        {user ? (user.is_active ? "Active" : "Inactive") : "—"}
                      </span>
                    </div>

                    <div className="flex items-start gap-3">
                      <CalendarDays
                        size={15}
                        className="mt-0.5 shrink-0 text-[var(--muted)]"
                      />

                      <div>
                        <div className="text-[10px] text-[var(--muted)]">
                          Account created
                        </div>

                        <div className="mt-1 text-xs text-[var(--ink)]">
                          {formatDate(user?.created_at)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock3
                        size={15}
                        className="mt-0.5 shrink-0 text-[var(--muted)]"
                      />

                      <div>
                        <div className="text-[10px] text-[var(--muted)]">
                          Last login
                        </div>

                        <div className="mt-1 text-xs text-[var(--ink)]">
                          {formatDate(user?.last_login_at)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Logout — last action */}
                  <div className="border-t border-[var(--line)] p-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={logoutLoading}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                    >
                      {logoutLoading ? (
                        <LoaderCircle size={15} className="animate-spin" />
                      ) : (
                        <LogOut size={15} />
                      )}

                      {logoutLoading ? "Signing out..." : "Logout"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {searchOpen && <SearchPalette onClose={() => setSearchOpen(false)} />}
    </>
  );
}