import type { ApiResult, PublicUser, UserRole } from "@draa/shared";

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const payload = (await response.json()) as ApiResult<T>;
  if (!response.ok || payload.error) throw new Error(payload.error || "Request failed.");
  return payload.data as T;
}

export const authApi = {
  login: (email: string, password: string, role: UserRole) => apiRequest<{ user: PublicUser }>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password, role }) }),
  me: () => apiRequest<{ user: PublicUser }>("/api/auth/me"),
  logout: () => apiRequest<{ success: boolean }>("/api/auth/logout", { method: "POST" }),
};
