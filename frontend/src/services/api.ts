import { localDb } from "@/services/localDb";

const HOSTINGER_API_URL = "https://lightseagreen-baboon-179690.hostingersite.com/api";
const SESSION_KEY = "tdefa.session";

const API_BASE =
  import.meta.env.VITE_API_URL ??
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:3001/api"
    : HOSTINGER_API_URL);

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = options.method ?? "GET";
  const session = localDb.get<{ token?: string }>(SESSION_KEY);
  const requestId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `req_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const startedAt = performance.now();
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);

  console.info("[api] request", { requestId, method, path });

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        "X-Request-Id": requestId,
        ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
        ...(options.body ? { "Content-Type": "application/json" } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    const durationMs = Math.round(performance.now() - startedAt);
    console.error("[api] network error", { requestId, method, path, durationMs, error });
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("La solicitud tardó demasiado. Revisá la API y volvé a intentar.", {
        cause: error,
      });
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }

  if (!response.ok) {
    let message = "No se pudo completar la solicitud";
    try {
      const payload = (await response.json()) as { message?: string };
      message = payload.message ?? message;
    } catch {
      // ignore invalid JSON errors and keep generic message
    }
    console.error("[api] response error", {
      requestId,
      method,
      path,
      status: response.status,
      durationMs: Math.round(performance.now() - startedAt),
      message,
    });
    throw new Error(message);
  }

  console.info("[api] response", {
    requestId,
    method,
    path,
    status: response.status,
    durationMs: Math.round(performance.now() - startedAt),
  });

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
