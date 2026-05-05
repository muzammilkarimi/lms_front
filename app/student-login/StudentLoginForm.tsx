"use client";

import { FormEvent, useEffect, useState } from "react";
import { API_BASE_URL } from "../lib/api";
import { clearStudentToken, getStudentToken, setStudentToken } from "../lib/studentAuth";

export function StudentLoginForm() {
  const [email, setEmail] = useState("student@example.com");
  const [password, setPassword] = useState("student123");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("Use the demo student or register a new account.");

  useEffect(() => {
    let ignore = false;

    async function resumeSession() {
      const token = getStudentToken();
      if (!token) {
        return;
      }

      setMessage("Restoring your session...");

      try {
        const response = await fetch(`${API_BASE_URL}/api/students/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          clearStudentToken();
          if (!ignore) {
            setMessage("Use the demo student or register a new account.");
          }
          return;
        }

        await setStudentToken(token);

        if (!ignore) {
          window.location.replace("/student-dashboard");
        }
      } catch {
        if (!ignore) {
          setMessage("Could not verify the current session. Try logging in again.");
        }
      }
    }

    resumeSession();

    return () => {
      ignore = true;
    };
  }, []);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Checking account...");

    try {
      const response = await fetch(`${API_BASE_URL}/api/students/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.detail ?? "Login failed.");
        return;
      }
      await setStudentToken(data.token);
      window.location.replace("/student-dashboard");
    } catch {
      setMessage("Login service is not reachable right now. Please try again.");
    }
  }

  return (
    <section className="studentAuthShell">
      <div className="studentAuthIntro">
        <span className="dashboardBadge">Student login</span>
        <h1>Welcome back</h1>
        <p>Sign in to your placement workspace and pick up your jobs, resume, interviews, and coding tests from where you left off.</p>
      </div>

      <form className="studentAuthCard studentLoginCard" onSubmit={login}>
        <div className="studentAuthFields">
          <label>
            <span>Email</span>
            <input
              type="email"
              name="email"
              id="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label>
            <span>Password</span>
            <div className="passwordInputWrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button 
                type="button" 
                className="passwordToggleBtn" 
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </label>
        </div>

        <div className="studentAuthActions">
          <button className="primaryButton" type="submit">
            Login
          </button>
          <a className="secondaryButton" href="/student-register">
            Create account
          </a>
        </div>

        <div className="studentAuthHint">
          <strong>Demo login</strong>
          <span>
            <code>student@example.com</code> / <code>student123</code>
          </span>
        </div>

        <p className="studentAuthMessage">{message}</p>
      </form>
    </section>
  );
}
