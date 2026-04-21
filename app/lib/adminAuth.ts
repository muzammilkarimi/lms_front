export const ADMIN_TOKEN_KEY = "pp_admin_token";

export function getAdminToken() {
  if (typeof window === "undefined") {
    return "";
  }
  return window.localStorage.getItem(ADMIN_TOKEN_KEY) ?? "";
}

export function setAdminToken(token: string) {
  window.localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken() {
  window.localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export function adminAuthHeaders(token = getAdminToken()): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}
