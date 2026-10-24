import { clearSession, getAccessToken } from "@/lib/auth";
import { ROUTES } from "@/lib/routes";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type RequestOptions = RequestInit & { skipAuth?: boolean };

// FastAPI errors: {"detail": "text"} or {"detail": [{loc, msg}]} (422)
function extractMessage(data: unknown, fallback: string): string {
  if (data && typeof data === "object" && "detail" in data) {
    const detail = (data as { detail: unknown }).detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail
        .map((d) => {
          const item = d as { loc?: (string | number)[]; msg?: string };
          const field = item.loc?.slice(1).join(".") ?? "";
          return field ? `${field}: ${item.msg}` : String(item.msg);
        })
        .join(", ");
    }
  }
  return fallback;
}

async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuth, ...init } = options;
  const headers = new Headers(init.headers);

  // JSON header only for JSON bodies (form bodies set their own content type)
  if (typeof init.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = skipAuth ? null : getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, { ...init, headers, cache: "no-store" });
  } catch {
    throw new ApiError(0, `Cannot reach the server at ${API_BASE_URL}. Is the backend running?`);
  }

  if (!response.ok) {
    let data: unknown = null;
    try {
      data = await response.json();
    } catch {
      // response had no JSON body
    }
    // Only a request that SENT a token can mean "session expired" (a wrong-password 401 must show its own message)
    if (response.status === 401 && token) {
      clearSession();
      const authPages: string[] = [ROUTES.login, ROUTES.register];
      if (typeof window !== "undefined" && !authPages.includes(window.location.pathname)) {
        window.location.href = ROUTES.login;
      }
      throw new ApiError(401, "Session expired. Please login again.");
    }
    throw new ApiError(response.status, extractMessage(data, response.statusText || "Request failed"));
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const apiGet = <T>(endpoint: string, opts?: RequestOptions) =>
  apiRequest<T>(endpoint, { ...opts, method: "GET" });

export const apiPost = <T>(endpoint: string, body: unknown, opts?: RequestOptions) =>
  apiRequest<T>(endpoint, { ...opts, method: "POST", body: JSON.stringify(body) });

export const apiPatch = <T>(endpoint: string, body: unknown, opts?: RequestOptions) =>
  apiRequest<T>(endpoint, { ...opts, method: "PATCH", body: JSON.stringify(body) });

export const apiPut = <T>(endpoint: string, body: unknown, opts?: RequestOptions) =>
  apiRequest<T>(endpoint, { ...opts, method: "PUT", body: JSON.stringify(body) });

export const apiDelete = <T>(endpoint: string, opts?: RequestOptions) =>
  apiRequest<T>(endpoint, { ...opts, method: "DELETE" });

// form-encoded (login) or multipart (file upload)
export const apiPostForm = <T>(endpoint: string, form: URLSearchParams | FormData, opts?: RequestOptions) =>
  apiRequest<T>(endpoint, { ...opts, method: "POST", body: form });

export function qs(params: Record<string, string | number | boolean | null | undefined>): string {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export { clearSession as clearAuth };