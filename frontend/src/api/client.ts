const configuredApiUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");
const apiBaseUrl = configuredApiUrl || (import.meta.env.DEV ? "http://localhost:5000/api" : "");

if (!apiBaseUrl) {
  throw new Error("Set VITE_API_URL to the Express backend API URL.");
}

export function apiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith("/api/") ? path.slice(4) : path;
  return `${apiBaseUrl}${normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`}`;
}

function normalizeImageUrls(value: unknown): unknown {
  if (typeof value === "string" && value.startsWith("/api/images/")) {
    return apiUrl(value);
  }
  if (Array.isArray(value)) return value.map(normalizeImageUrls);
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, normalizeImageUrls(entry)]),
    );
  }
  return value;
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const response = await fetch(apiUrl(path), {
    ...init,
    credentials: "include",
  });
  if (!response.headers.get("content-type")?.includes("application/json")) {
    return response;
  }

  let payload: unknown;
  try {
    payload = await response.clone().json();
  } catch {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.delete("content-encoding");
  return new Response(JSON.stringify(normalizeImageUrls(payload)), {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
