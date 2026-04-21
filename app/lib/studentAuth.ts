export const STUDENT_TOKEN_KEY = "pp_student_token";

export function getStudentToken() {
  if (typeof window === "undefined") {
    return "";
  }
  return window.localStorage.getItem(STUDENT_TOKEN_KEY) ?? "";
}

export function setStudentToken(token: string) {
  window.localStorage.setItem(STUDENT_TOKEN_KEY, token);
}

export function clearStudentToken() {
  window.localStorage.removeItem(STUDENT_TOKEN_KEY);
}

export function studentAuthHeaders(): Record<string, string> {
  const token = getStudentToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
