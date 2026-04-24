"use client";

import { FormEvent, useEffect, useState } from "react";
import { API_BASE_URL } from "../lib/api";
import { clearStudentToken, getStudentToken, setStudentToken } from "../lib/studentAuth";

export function StudentLoginForm() {
  const [email, setEmail] = useState("raj@example.com");
  const [password, setPassword] = useState("student123");
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
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
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
            <code>raj@example.com</code> / <code>student123</code>
          </span>
        </div>

        <p className="studentAuthMessage">{message}</p>
      </form>
    </section>
  );
}
