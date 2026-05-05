"use client";

import { FormEvent, useState } from "react";
import { API_BASE_URL } from "../lib/api";
import { setStudentToken } from "../lib/studentAuth";

export function StudentRegisterForm() {
  const [message, setMessage] = useState("Create a student account to save your progress.");
  const [showPassword, setShowPassword] = useState(false);

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setMessage("Creating account...");

    try {
      const response = await fetch(`${API_BASE_URL}/api/students/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          password: form.get("password"),
          phone: form.get("phone"),
          college: form.get("college"),
          course: form.get("course"),
          graduation_year: form.get("graduation_year"),
          skills: String(form.get("skills")).split(",").map((skill) => skill.trim()).filter(Boolean),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.detail ?? "Could not create account.");
        return;
      }
      await setStudentToken(data.token);
      window.location.replace("/student-dashboard");
    } catch {
      setMessage("Registration service is not reachable right now. Please try again.");
    }
  }

  return (
    <form className="studentAuthCard wideAuthCard" onSubmit={register}>
      <span className="dashboardBadge">Student register</span>
      <h1>Create your placement profile.</h1>
      <p>Your resume, applications, and mock interview history will stay attached to this account.</p>
      <div className="studentAuthGrid">
        <label>
          <span>Name</span>
          <input name="name" required />
        </label>
        <label>
          <span>Email</span>
          <input name="email" id="email" type="email" autoComplete="username" required />
        </label>
        <label>
          <span>Password</span>
          <div className="passwordInputWrapper">
            <input name="password" id="password" type={showPassword ? "text" : "password"} autoComplete="new-password" required />
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
        <label>
          <span>Phone</span>
          <input name="phone" />
        </label>
        <label>
          <span>College</span>
          <input name="college" />
        </label>
        <label>
          <span>Course</span>
          <input name="course" />
        </label>
        <label>
          <span>Graduation year</span>
          <input name="graduation_year" />
        </label>
        <label>
          <span>Skills</span>
          <input name="skills" placeholder="React, Python, SQL" />
        </label>
      </div>
      <button className="primaryButton" type="submit">
        Create account
      </button>
      <a className="secondaryButton" href="/student-login">
        Login instead
      </a>
      <p>{message}</p>
    </form>
  );
}
