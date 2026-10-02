"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken, getUser, homeFor } from "@/lib/auth";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = getAccessToken();
    const user = getUser();

    if (!token || !user) {
      router.replace("/auth/login");
      return;
    }

    router.replace(homeFor(user));
  }, [router]);

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