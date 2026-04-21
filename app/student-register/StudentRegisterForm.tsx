"use client";

import { FormEvent, useState } from "react";
import { API_BASE_URL } from "../lib/api";
import { setStudentToken } from "../lib/studentAuth";

export function StudentRegisterForm() {
  const [message, setMessage] = useState("Create a student account to save your progress.");

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setMessage("Creating account...");
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
    setStudentToken(data.token);
    window.location.href = "/student-dashboard";
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
          <input name="email" type="email" required />
        </label>
        <label>
          <span>Password</span>
          <input name="password" type="password" required />
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
