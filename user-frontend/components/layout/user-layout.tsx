"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import UserHeader from "./user-header";
import UserSidebar from "./user-sidebar";
import DashboardBackLink from "./dashboard-back-link";
import AuthGuard from "@/components/auth/auth-guard";

interface UserLayoutProps {
  children: React.ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed((current) => !current);
  };

  return (
    <AuthGuard>
      <div className="app-shell">
        {/* GLOBAL HEADER */}
        <div className="fixed inset-x-0 top-0 z-50 h-[var(--header-height)]">
          <UserHeader onMenuClick={toggleSidebar} />
        </div>

        {/* GLOBAL SIDEBAR */}
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
            onToggle={toggleSidebar}
          />
        </aside>

        {/* MAIN CONTENT */}
        <main
          className={`app-content pt-[calc(var(--header-height)+30px)] ${
            sidebarCollapsed ? "sidebar-collapsed" : ""
          }`}
        >
          <div className="page-container page-enter">
            {pathname !== "/" && <DashboardBackLink />}
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}