"use client";

import { FormEvent, useState } from "react";
import { API_BASE_URL } from "../lib/api";
import { setStudentToken } from "../lib/studentAuth";

export function StudentLoginForm() {
  const [email, setEmail] = useState("raj@example.com");
  const [password, setPassword] = useState("student123");
  const [message, setMessage] = useState("Use the demo student or register a new account.");

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Checking account...");
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
    setStudentToken(data.token);
    window.location.href = "/student-dashboard";
  }

  return (
    <form className="studentAuthCard" onSubmit={login}>
      <span className="dashboardBadge">Student login</span>
      <h1>Open your placement workspace.</h1>
      <p>Track applications, resume progress, and interview practice from one account.</p>
      <label>
        <span>Email</span>
        <input value={email} onChange={(event) => setEmail(event.target.value)} />
      </label>
      <label>
        <span>Password</span>
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
      </label>
      <button className="primaryButton" type="submit">
        Login
      </button>
      <a className="secondaryButton" href="/student-register">
        Create account
      </a>
      <p>{message}</p>
    </form>
  );
}
