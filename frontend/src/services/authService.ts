import { apiRequest, clearToken, getToken, setToken } from "../api/client";
import type { LoginRequest } from "../interfaces/LoginRequest";
import type { LoginResponse } from "../interfaces/LoginResponse";

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await apiRequest<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: credentials,
    auth: false,
  });
  setToken(response.token);
  return response;
}

export function logout(): void {
  clearToken();
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}
