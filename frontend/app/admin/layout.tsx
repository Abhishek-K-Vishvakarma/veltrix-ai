"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken, getUser, homeFor } from "@/lib/auth";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    const user = getUser();

    if (!token || !user) {
      router.replace("/auth/login");
      return;
    }

    if (user.role !== "admin") {
      router.replace(homeFor(user));
      return;
    }

    setChecking(false);
  }, [router]);

  if (checking) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{
          background: "#F6F4EE",
          color: "#14130F",
        }}
      >
        <div className="text-[11px]">
          Checking session...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}