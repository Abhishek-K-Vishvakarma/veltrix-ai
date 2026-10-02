"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getAccessToken, getUser, homeFor } from "@/lib/auth";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    const user = getUser();

    if (token && user) {
      router.replace(homeFor(user));
      return;
    }

    setChecking(false);
  }, [router, pathname]);

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