export const STUDENT_TOKEN_KEY = "pp_student_token";
export const STUDENT_TOKEN_COOKIE = "pp_student_token";
export const STUDENT_AUTH_EVENT = "pp-student-auth-change";

function cookieSecuritySuffix() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.location.protocol === "https:" ? "; Secure" : "";
}

function readStudentTokenCookie() {
  if (typeof document === "undefined") {
    return "";
  }

  const prefix = `${STUDENT_TOKEN_COOKIE}=`;
  const match = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(prefix));

  if (!match) {
    return "";
  }

  return decodeURIComponent(match.slice(prefix.length));
}

function writeStudentTokenCookie(token: string) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${STUDENT_TOKEN_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax${cookieSecuritySuffix()}`;
}

function clearStudentTokenCookie() {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${STUDENT_TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${cookieSecuritySuffix()}`;
}

export function getStudentToken() {
  if (typeof window === "undefined") {
    return "";
  }

  const localToken = window.localStorage.getItem(STUDENT_TOKEN_KEY) ?? "";
  if (localToken) {
    return localToken;
  }

  const cookieToken = readStudentTokenCookie();
  if (cookieToken) {
    window.localStorage.setItem(STUDENT_TOKEN_KEY, cookieToken);
  }
  return cookieToken;
}

export async function setStudentToken(token: string) {
  window.localStorage.setItem(STUDENT_TOKEN_KEY, token);
  writeStudentTokenCookie(token);

  try {
    await fetch("/api/student-session", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
  } catch {
    // Keep the local cookie/localStorage fallback even if the sync call fails.
  }

  window.dispatchEvent(new Event(STUDENT_AUTH_EVENT));
}

export function clearStudentToken() {
  window.localStorage.removeItem(STUDENT_TOKEN_KEY);
  clearStudentTokenCookie();

  if (typeof window !== "undefined") {
    void fetch("/api/student-session", { method: "DELETE", credentials: "same-origin" }).catch(() => {
      // Local cleanup already happened.
    });
    window.dispatchEvent(new Event(STUDENT_AUTH_EVENT));
  }
}

export function studentAuthHeaders(): Record<string, string> {
  const token = getStudentToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
