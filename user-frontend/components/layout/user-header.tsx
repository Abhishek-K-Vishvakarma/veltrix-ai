"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  Command,
  Search,
  Sparkles,
  LogOut,
  UserRound,
  ShieldCheck,
  CalendarDays,
  Clock3,
  LoaderCircle,
} from "lucide-react";

import { getMe, isAuthenticated } from "@/services/auth.service";
import { authStore, useAuthStore } from "@/store/auth-store";

interface UserHeaderProps {
  onMenuClick?: () => void;
}

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

export default function UserHeader({ onMenuClick }: UserHeaderProps) {
  const router = useRouter();
  const { user } = useAuthStore();

  const [profileOpen, setProfileOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  const [logoutLoading, setLogoutLoading] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

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
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
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
    <header className="flex h-full items-center border-b border-[var(--line)] bg-[var(--surface)]">
      <div className="flex h-full w-full items-center justify-between px-5">
        {/* Brand */}
        <div className="flex min-w-[220px] items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Toggle sidebar"
            className="hidden h-8 w-8 items-center justify-center border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] transition hover:border-[var(--line-strong)] hover:bg-[var(--surface-soft)] lg:flex"
          >
            <Command size={15} strokeWidth={1.8} />
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center bg-[var(--primary)] text-white">
              <Sparkles size={14} strokeWidth={2} />
            </div>

            <div className="leading-none">
              <div className="text-[14px] font-semibold tracking-[-0.02em] text-[var(--ink)]">
                VELTRIX
              </div>

              <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.16em] text-[var(--muted-light)]">
                Intelligence
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="hidden max-w-xl flex-1 px-8 md:block">
          <button
            type="button"
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

            <span className="font-mono text-[9px] text-[var(--muted-light)]">
              CTRL K
            </span>
          </button>
        </div>

        {/* Right actions */}
        <div className="flex min-w-[220px] items-center justify-end gap-2">
          {/* Notifications */}
          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-9 w-9 items-center justify-center border border-transparent text-[var(--muted)] transition hover:border-[var(--line)] hover:bg-[var(--surface-soft)] hover:text-[var(--ink)]"
          >
            <Bell size={16} strokeWidth={1.8} />

            <span className="absolute right-[7px] top-[7px] h-1.5 w-1.5 bg-[var(--signal)]" />
          </button>

          <div className="mx-1 h-6 w-px bg-[var(--line)]" />

          {/* Plan */}
          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex h-7 w-7 items-center justify-center bg-[var(--primary-soft)] text-[var(--primary)]">
              <Sparkles size={13} strokeWidth={2} />
            </div>

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
          <div ref={profileRef} className="relative ml-1">
            <button
              type="button"
              aria-label="Open profile menu"
              aria-expanded={profileOpen}
              onClick={() => setProfileOpen((current) => !current)}
              className="flex items-center gap-2 border border-transparent py-1.5 pl-2 pr-1.5 transition hover:border-[var(--line)] hover:bg-[var(--surface-soft)]"
            >
              <div className="flex h-7 w-7 items-center justify-center bg-[var(--ink)] text-[10px] font-semibold text-[var(--surface)]">
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
  );
}