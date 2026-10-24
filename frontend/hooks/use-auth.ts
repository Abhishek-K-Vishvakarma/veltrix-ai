"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken, getUser, homeFor } from "@/lib/auth";
import { ROUTES } from "@/lib/routes";
import type { Role } from "@/types/auth";

/** Call at the top of a protected layout. Returns true once the user is allowed to see the page. */
export function useRequireAuth(role?: Role): boolean {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user || !getAccessToken()) {
      router.replace(ROUTES.login);
      return;
    }
    if (role && user.role !== role) {
      router.replace(homeFor(user));
      return;
    }
    setReady(true);
  }, [role, router]);

  return ready;
}