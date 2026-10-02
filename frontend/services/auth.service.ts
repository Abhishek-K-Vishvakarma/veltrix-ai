import { apiGet, apiPost, apiPostForm } from "@/lib/api";
import { clearSession, saveSession } from "@/lib/auth";
import { ROUTES } from "@/lib/routes";
import type { AuthUser, TokenResponse } from "@/types/auth";

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

/*
 * Backend uses OAuth2PasswordRequestForm.
 *
 * FastAPI expects:
 * username=email
 * password=password
 *
 * Content-Type:
 * application/x-www-form-urlencoded
 */
export async function login(
  input: LoginInput
): Promise<TokenResponse> {
  const form = new URLSearchParams();

  form.append("username", input.email);
  form.append("password", input.password);

  const response = await apiPostForm<TokenResponse>(
    "/auth/login",
    form,
    {
      skipAuth: true,
    }
  );

  saveSession(response);

  return response;
}

/*
 * Backend register expects:
 *
 * {
 *   email,
 *   full_name,
 *   password
 * }
 *
 * Register ke baad automatically login.
 */
export async function register(
  input: RegisterInput
): Promise<TokenResponse> {
  await apiPost<AuthUser>(
    "/auth/register",
    {
      email: input.email,
      full_name: input.name,
      password: input.password,
    },
    {
      skipAuth: true,
    }
  );

  return login({
    email: input.email,
    password: input.password,
  });
}

export async function getMe(): Promise<AuthUser> {
  return apiGet<AuthUser>("/auth/me");
}

export function logout(): void {
  clearSession();

  if (typeof window !== "undefined") {
    window.location.href = ROUTES.login;
  }
}