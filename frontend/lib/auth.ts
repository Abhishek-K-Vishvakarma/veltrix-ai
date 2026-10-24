import { ROUTES } from "@/lib/routes";
import type { AuthUser, TokenResponse } from "@/types/auth";

const TOKEN_KEY = "veltrix_access_token";
const REFRESH_KEY = "veltrix_refresh_token";
const USER_KEY = "veltrix_user";

export const USER_APP_URL =
  process.env.NEXT_PUBLIC_USER_APP_URL?.replace(/\/+$/, "") ||
  "http://localhost:3000";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getAccessToken(): string | null {
  if (!isBrowser()) {
    return null;
  }

  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): AuthUser | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const rawUser = localStorage.getItem(USER_KEY);

    if (!rawUser) {
      return null;
    }

    return JSON.parse(rawUser) as AuthUser;
  } catch {
    return null;
  }
}

export function saveSession(
  response: TokenResponse
): void {
  if (!isBrowser()) {
    return;
  }

  localStorage.setItem(
    TOKEN_KEY,
    response.access_token
  );

  if (response.refresh_token) {
    localStorage.setItem(
      REFRESH_KEY,
      response.refresh_token
    );
  }

  localStorage.setItem(
    USER_KEY,
    JSON.stringify(response.user)
  );
}

export function clearSession(): void {
  if (!isBrowser()) {
    return;
  }

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

export function homeFor(
  user: Pick<AuthUser, "role"> | null
): string {
  if (user?.role === "admin") {
    return ROUTES.adminDashboard;
  }

  return `${USER_APP_URL}/auth/login`;
}

export function logout(): void {
  clearSession();

  if (isBrowser()) {
    window.location.href = ROUTES.login;
  }
}