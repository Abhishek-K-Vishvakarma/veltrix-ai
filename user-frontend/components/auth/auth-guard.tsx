"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const {user, isAuthenticated, isLoading, logout } = useAuth();

  useEffect(() => {
  if (isLoading) return;

  if (!isAuthenticated || !user) {
    logout();
    const next = encodeURIComponent(pathname);
    router.replace(`/auth/login?next=${next}`);
    return;
  }

  if (user.role?.toLowerCase() === "admin") {
    logout();
    router.replace("/auth/login?error=admin-access-denied");
    return;
  }
}, [user, isAuthenticated, isLoading, logout, pathname, router]);

  if (isLoading || !isAuthenticated || !user || user.role?.toLowerCase() === "admin") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F2F5FB]">
        <div className="flex flex-col items-center gap-3">
          <LoaderCircle
            size={25}
            className="animate-spin text-[#2347F5]"
          />
          <p className="text-sm text-slate-500">
            Verifying your session...
          </p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}