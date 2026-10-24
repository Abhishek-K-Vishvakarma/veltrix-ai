const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, "");
const API_BASE_URL = configuredApiUrl
  ? /\/api$/i.test(configuredApiUrl)
    ? configuredApiUrl
    : `${configuredApiUrl}/api`
  : "http://localhost:8000/api";

interface ApiError {
  detail?: string | unknown[];
  message?: string;
  [key: string]: unknown;
}

export class ApiRequestError extends Error {
status: number;
data?: ApiError;

constructor(
message: string,
status: number,
data?: ApiError,
) {
super(message);
this.name = "ApiRequestError";
this.status = status;
this.data = data;
}
}

export class ApiConnectionError extends Error {
  readonly cause: unknown;

  constructor(url: string, origin: string, cause: unknown) {
    super(
      `No HTTP response was received from the VELTRIX API at ${url}${origin}. ` +
        `The connection failed before an HTTP response was available. Check the browser network details and backend logs.`,
    );
    this.name = "ApiConnectionError";
    this.cause = cause;
  }
}

interface RequestOptions extends RequestInit {
auth?: boolean;
}

function getAccessToken(): string | null {
if (typeof window === "undefined") {
return null;
}

return localStorage.getItem("veltrix_access_token");
}

function buildHeaders(options: RequestOptions): Headers {
  const headers = new Headers(options.headers);

  const isFormData = options.body instanceof FormData;
  const isUrlEncoded = options.body instanceof URLSearchParams;

  if (
    !headers.has("Content-Type") &&
    !isFormData &&
    !isUrlEncoded
  ) {
    headers.set("Content-Type", "application/json");
  }

  if (options.auth !== false) {
    const token = getAccessToken();

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  return headers;
}

async function parseResponse(response: Response): Promise<unknown> {
const contentType = response.headers.get("content-type") || "";

if (contentType.includes("application/json")) {
return response.json();
}

return response.text();
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log("url:", url);
  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers: buildHeaders(options),
    });
  } catch (error) {
    if (error instanceof TypeError) {
      const origin = typeof window === "undefined" ? "" : ` from ${window.location.origin}`;
      throw new ApiConnectionError(url, origin, error);
    }
    throw error;
  }

  const data = await parseResponse(response);

  if (!response.ok) {
    const errorData: ApiError | undefined =
      typeof data === "object" && data !== null
        ? (data as ApiError)
        : undefined;

    const detail = errorData?.detail;
    let message: string;

    if (typeof detail === "string") {
      message = detail;
    } else if (Array.isArray(detail)) {
      message = detail.map((item: unknown) => {
          if (typeof item === "string") {
            return item;
          }

          if (typeof item === "object" && item !== null) {
            const error = item as {
              loc?: unknown[];
              msg?: string;
            };

            const field = error.loc?.at(-1);

            if (field !== undefined) {
              return `${String(field)}: ${
                error.msg ?? "Invalid value"
              }`;
            }

            return error.msg ?? "Invalid value";
          }

          return String(item);
        })
        .join(". ");
    } else if (typeof errorData?.message === "string") {
      message = errorData.message;
    } else {
      message = `Request failed with status ${response.status}`;
    }

    throw new ApiRequestError(
      message,
      response.status,
      errorData,
    );
  }

  return data as T;
}

export function apiGet<T>(
endpoint: string,
options: RequestOptions = {},
): Promise<T> {
return request<T>(endpoint, {
...options,
method: "GET",
});
}

export function apiPost<T>(
endpoint: string,
body?: unknown,
options: RequestOptions = {},
): Promise<T> {
return request<T>(endpoint, {
...options,
method: "POST",
body:
  body instanceof FormData || body instanceof URLSearchParams
    ? body
    : body !== undefined
      ? JSON.stringify(body)
      : undefined,
});
}

export function apiPut<T>(
endpoint: string,
body?: unknown,
options: RequestOptions = {},
): Promise<T> {
return request<T>(endpoint, {
...options,
method: "PUT",
body:
body instanceof FormData
? body
: body !== undefined
? JSON.stringify(body)
: undefined,
});
}

export function apiPatch<T>(
endpoint: string,
body?: unknown,
options: RequestOptions = {},
): Promise<T> {
return request<T>(endpoint, {
...options,
method: "PATCH",
body:
body instanceof FormData
? body
: body !== undefined
? JSON.stringify(body)
: undefined,
});
}

export function apiDelete<T>(
endpoint: string,
options: RequestOptions = {},
): Promise<T> {
return request<T>(endpoint, {
...options,
method: "DELETE",
});
}

export function setAccessToken(token: string): void {
if (typeof window === "undefined") {
return;
}

localStorage.setItem("veltrix_access_token", token);
}

export function getStoredAccessToken(): string | null {
return getAccessToken();
}

export function clearAccessToken(): void {
if (typeof window === "undefined") {
return;
}

localStorage.removeItem("veltrix_access_token");
}
