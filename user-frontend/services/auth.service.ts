import {
  apiGet,
  apiPost,
  clearAccessToken,
  setAccessToken,
} from "./api";

import type {
  AuthResponse,
  AuthUser,
  LoginRequest,
  MeResponse,
  RegisterRequest,
} from "@/types/auth";

/* =========================================================
   VELTRIX AI — AUTH SERVICE
   ========================================================= */

const AUTH_ENDPOINTS = {
  login: "/auth/login",
  register: "/auth/register",
  me: "/auth/me",
} as const;

/* =========================================================
   LOGIN
   ========================================================= */

export async function login(
  credentials: LoginRequest,
): Promise<AuthResponse> {
  const formData = new URLSearchParams();

  formData.set("username", credentials.email.trim());
  formData.set("password", credentials.password);

  const response = await apiPost<AuthResponse>(
    AUTH_ENDPOINTS.login,
    formData,
    { auth: false },
  );

  if (!response.access_token) {
    throw new Error("Authentication token was not returned.");
  }

  setAccessToken(response.access_token);
  window.dispatchEvent(new Event("veltrix:auth-changed"));
  return response;
}

/* =========================================================
   REGISTER
   ========================================================= */

export async function register(
  data: RegisterRequest,
): Promise<AuthResponse> {
  const response = await apiPost<AuthResponse>(
    AUTH_ENDPOINTS.register,
    data,
    {
      auth: false,
    },
  );

  /*
   * Some backend implementations return a token immediately
   * after registration, while others require login afterwards.
   *
   * If a token is returned, store it automatically.
   */
  if (response.access_token) {
    setAccessToken(response.access_token);
    window.dispatchEvent(new Event("veltrix:auth-changed"));
  }

  return response;
}

/* =========================================================
   GET CURRENT USER
   ========================================================= */

export async function getMe(): Promise<AuthUser> {
  const response = await apiGet<MeResponse>(
    AUTH_ENDPOINTS.me,
  );

  return response;
}

/* =========================================================
   LOGOUT
   ========================================================= */

export function logout(): void {
  clearAccessToken();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("veltrix:auth-changed"));
  }
}

/* =========================================================
   CHECK AUTHENTICATION
   ========================================================= */

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return Boolean(
    localStorage.getItem("veltrix_access_token"),
  );
}