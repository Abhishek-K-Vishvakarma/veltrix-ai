import { apiGet, apiPost, apiPostForm } from "@/lib/api";
import { clearSession } from "@/lib/auth";
import { ROUTES } from "@/lib/routes";
import type { AuthUser, TokenResponse } from "@/types/auth";

// Backend /auth/login expects FORM data with the field "username" (= email)
export function login(input: { email: string; password: string }): Promise<TokenResponse> {
  const form = new URLSearchParams({ username: input.email, password: input.password });
  return apiPostForm<TokenResponse>("/auth/login", form, { skipAuth: true });
}

// Backend /auth/register expects { email, full_name, password } and returns the user (no token),
// so we log in right after registering.
export async function register(input: { name: string; email: string; password: string }): Promise<TokenResponse> {
  await apiPost<AuthUser>(
    "/auth/register",
    { email: input.email, full_name: input.name, password: input.password },
    { skipAuth: true }
  );
  return login({ email: input.email, password: input.password });
}

export const getMe = () => apiGet<AuthUser>("/auth/me");
export function logout(): void {
  clearSession();
  window.location.href = ROUTES.login;
}