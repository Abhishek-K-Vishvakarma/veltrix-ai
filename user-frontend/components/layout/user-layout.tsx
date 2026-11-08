"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import UserHeader from "./user-header";
import UserSidebar from "./user-sidebar";
import DashboardBackLink from "./dashboard-back-link";
import AuthGuard from "@/components/auth/auth-guard";

interface UserLayoutProps {
  children: React.ReactNode;
}

/**
 * Sidebar behaviour
 *
 *  >= 1024px (laptop / desktop)  fixed sidebar, always visible.
 *                                ☰ or "Collapse" shrinks it to icons; the
 *                                choice is remembered across pages and reloads.
 *  <  1024px (phone / tablet)    sidebar opens as a slide-in drawer from ☰.
 *                                Closes on: link tap, outside tap, X, Esc.
 */

const COLLAPSE_KEY = "veltrix:sidebar-collapsed";
const DESKTOP_QUERY = "(min-width: 1024px)";

export default function UserLayout({ children }: UserLayoutProps) {
  const pathname = usePathname();
  const closeRef = useRef<HTMLButtonElement>(null);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Read the screen size + saved collapse choice, then follow resizes.
  useEffect(() => {
    const media = window.matchMedia(DESKTOP_QUERY);

    function sync() {
      setIsDesktop(media.matches);
      if (media.matches) setDrawerOpen(false);
    }

    sync();

    try {
      setSidebarCollapsed(window.localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {
      /* storage unavailable: keep default */
    }

    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  // Moving to another page closes the drawer.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Drawer open: Esc closes, focus moves inside, page behind does not scroll.
  useEffect(() => {
    if (!drawerOpen) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setDrawerOpen(false);
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen]);

  const toggleCollapsed = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);

    try {
      window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
    } catch {
      /* ignore */
    }
  };

  // ☰ in the header: collapse on desktop, open the drawer elsewhere.
  const handleMenuClick = () => {
    if (isDesktop) toggleCollapsed();
    else setDrawerOpen((open) => !open);
  };

  return (
    <AuthGuard>
      <div className="app-shell">
        {/* GLOBAL HEADER */}
        <div className="fixed inset-x-0 top-0 z-50 h-[var(--header-height)]">
          <UserHeader onMenuClick={handleMenuClick} />
        </div>

        {/* GLOBAL SIDEBAR (laptop / desktop) */}
        <aside
          className="fixed bottom-0 left-0 top-[var(--header-height)] z-40 hidden border-r border-[var(--line)] bg-[var(--surface)] lg:block"
          style={{
            width: sidebarCollapsed
              ? "var(--sidebar-collapsed-width)"
              : "var(--sidebar-width)",
          }}
        >
          <UserSidebar
            collapsed={sidebarCollapsed}
            onToggle={toggleCollapsed}
          />
        </aside>

        {/* SIDEBAR DRAWER (phone / tablet) */}
        <div
          className="fixed inset-0 z-[70] lg:hidden"
          aria-hidden={!drawerOpen}
          style={{
            visibility: drawerOpen ? "visible" : "hidden",
            transition: `visibility 0s linear ${drawerOpen ? 0 : 200}ms`,
          }}
        >
          <div
            className={`absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity duration-200 ${
              drawerOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setDrawerOpen(false)}
          />

          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            onClick={(event) => {
              // Tapping any link closes the drawer, even for the current page.
              if ((event.target as HTMLElement).closest("a")) {
                setDrawerOpen(false);
              }
            }}
            className={`absolute inset-y-0 left-0 flex w-[280px] max-w-[85vw] flex-col border-r border-[var(--line)] bg-[var(--surface)] shadow-2xl transition-transform duration-200 ${
              drawerOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex h-[var(--header-height)] shrink-0 items-center justify-between border-b border-[var(--line)] pl-5 pr-3">
              <div className="flex items-center gap-2.5">
                <Image
                  src="/veltrix-icon.svg"
                  alt=""
                  aria-hidden
                  width={28}
                  height={28}
                  className="h-7 w-7 shrink-0"
                />
                <div className="leading-none">
                  <div className="text-[14px] font-semibold tracking-[-0.02em] text-[var(--ink)]">
                    VELTRIX
                  </div>
                  <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.16em] text-[var(--muted-light)]">
                    Intelligence
                  </div>
                </div>
              </div>

              <button
                ref={closeRef}
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center border border-[var(--line)] text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--ink)]"
              >
                <X size={16} strokeWidth={1.8} />
              </button>
            </div>

            <div className="min-h-0 flex-1">
              <UserSidebar
                collapsed={false}
                onToggle={() => setDrawerOpen(false)}
              />
            </div>
          </aside>
        </div>

        {/* MAIN CONTENT */}
        <main
          className={`app-content pt-[calc(var(--header-height)+30px)] ${
            sidebarCollapsed ? "sidebar-collapsed" : ""
          }`}
        >
          <div className="page-container page-enter">
            {/* {pathname !== "/" && <DashboardBackLink />} */}
            {pathname !== "/"}
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}