import { clearSession, getAccessToken } from "@/lib/auth";
import { ROUTES } from "@/lib/routes";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type RequestOptions = RequestInit & {
  skipAuth?: boolean;
};

function extractMessage(
  data: unknown,
  fallback: string
): string {
  if (
    data &&
    typeof data === "object" &&
    "detail" in data
  ) {
    const detail = (data as { detail: unknown }).detail;

    if (typeof detail === "string") {
      return detail;
    }

    if (Array.isArray(detail)) {
      return detail
        .map((item) => {
          const error = item as {
            loc?: (string | number)[];
            msg?: string;
          };

          const field =
            error.loc?.slice(1).join(".") ?? "";

          return field
            ? `${field}: ${error.msg}`
            : String(error.msg);
        })
        .join(", ");
    }
  }

  return fallback;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { skipAuth, ...init } = options;

  const headers = new Headers(init.headers);

  /*
   * JSON body ke liye Content-Type automatically set hoga.
   * FormData ke case mein browser ko khud boundary set karne denge.
   */
  if (
    typeof init.body === "string" &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const token = skipAuth
    ? null
    : getAccessToken();

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`
    );
  }

  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        ...init,
        headers,
        cache: "no-store",
      }
    );
  } catch {
    throw new ApiError(
      0,
      `Cannot reach the server at ${API_BASE_URL}. Is the backend running?`
    );
  }

  if (!response.ok) {
    let data: unknown = null;

    try {
      data = await response.json();
    } catch {
      // Empty/non-JSON response
    }

    /*
     * IMPORTANT:
     * Sirf tab automatic logout hoga jab request
     * mein actual token bheja gaya tha.
     *
     * Isliye wrong email/password wale login 401 par
     * session accidentally clear nahi hoga.
     */
    if (response.status === 401 && token) {
      clearSession();

      const authPages = [
        ROUTES.login,
        ROUTES.register,
      ];

      if (
        typeof window !== "undefined" &&
        !authPages.includes(window.location.pathname as any)
      ) {
        window.location.href = ROUTES.login;
      }

      throw new ApiError(
        401,
        "Session expired. Please login again."
      );
    }

    throw new ApiError(
      response.status,
      extractMessage(
        data,
        response.statusText || "Request failed"
      )
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const apiGet = <T>(
  endpoint: string,
  opts?: RequestOptions
) =>
  apiRequest<T>(endpoint, {
    ...opts,
    method: "GET",
  });

export const apiPost = <T>(
  endpoint: string,
  body: unknown,
  opts?: RequestOptions
) =>
  apiRequest<T>(endpoint, {
    ...opts,
    method: "POST",
    body: JSON.stringify(body),
  });

export const apiPatch = <T>(
  endpoint: string,
  body: unknown,
  opts?: RequestOptions
) =>
  apiRequest<T>(endpoint, {
    ...opts,
    method: "PATCH",
    body: JSON.stringify(body),
  });

export const apiPut = <T>(
  endpoint: string,
  body: unknown,
  opts?: RequestOptions
) =>
  apiRequest<T>(endpoint, {
    ...opts,
    method: "PUT",
    body: JSON.stringify(body),
  });

export const apiDelete = <T>(
  endpoint: string,
  opts?: RequestOptions
) =>
  apiRequest<T>(endpoint, {
    ...opts,
    method: "DELETE",
  });

/*
 * FormData / URLSearchParams
 *
 * Login ke liye URLSearchParams.
 * File upload ke liye FormData.
 */
export const apiPostForm = <T>(
  endpoint: string,
  form: URLSearchParams | FormData,
  opts?: RequestOptions
) =>
  apiRequest<T>(endpoint, {
    ...opts,
    method: "POST",
    body: form,
  });

/*
 * Query string helper
 *
 * Example:
 * qs({
 *   page: 1,
 *   size: 20,
 *   status: "completed"
 * })
 *
 * => ?page=1&size=20&status=completed
 */
export function qs(
  params: Record<
    string,
    string | number | boolean | null | undefined
  >
): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();

  return query ? `?${query}` : "";
}

export { clearSession as clearAuth };