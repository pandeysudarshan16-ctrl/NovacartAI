export class ApiClientError extends Error {
  public readonly status: number;
  public readonly details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  let data: { success: boolean; data: T; error?: string; details?: unknown };
  try {
    data = await res.json();
  } catch {
    throw new ApiClientError("Failed to parse response JSON", res.status);
  }

  if (!res.ok || !data.success) {
    throw new ApiClientError(data.error || "Request failed", res.status, data.details);
  }

  return data.data;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestInit) => request<T>(path, { method: "GET", ...options }),
  post: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined, ...options }),
  put: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined, ...options }),
  delete: <T>(path: string, options?: RequestInit) => request<T>(path, { method: "DELETE", ...options }),
};
