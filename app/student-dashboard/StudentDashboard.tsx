"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "../lib/api";
import { clearStudentToken, getStudentToken, studentAuthHeaders } from "../lib/studentAuth";

type DashboardApplication = {
  id: number;
  job_id: number;
  job_title: string;
  company: string;
  location: string;
  status: string;
  admin_note: string;
};

type DashboardCodingAttempt = {
  id: number;
  assessment_id: number;
  assessment_title: string;
  status: string;
  total_score: number;
  solved_count: number;
  question_count: number;
  started_at: string;
  submitted_at: string | null;
};

type StudentDashboardData = {
  student: {
    name: string;
    email: string;
    skills: string[];
  };
  resume_completion: number;
  applied_jobs: number;
  latest_mock_score: number | null;
  latest_coding_score: number | null;
  applications: DashboardApplication[];
  coding_attempts: DashboardCodingAttempt[];
};

function statusLabel(value: string) {
  return value.replaceAll("_", " ");
}

export function StudentDashboard() {
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [message, setMessage] = useState("Loading your workspace...");

  useEffect(() => {
    const token = getStudentToken();
    if (!token) {
      setMessage("Login to open your student dashboard.");
      return;
    }

    fetch(`${API_BASE_URL}/api/students/dashboard`, {
      headers: studentAuthHeaders(),
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.detail ?? "Could not load dashboard.");
        }
        setData(payload);
        setMessage("");
      })
      .catch((error: Error) => setMessage(error.message));
  }, []);

  if (!data) {
    return (
      <main className="studentDashboardPage">
        <section className="studentEmptyPanel">
          <span className="dashboardBadge">Student workspace</span>
          <h1>{message}</h1>
          <a className="primaryButton" href="/student-login">
            Login
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className="studentDashboardPage">
      <section className="studentDashboardHero">
        <div>
          <p className="eyebrow">Student dashboard</p>
          <h1>Welcome back, {data.student.name}.</h1>
          <p>Keep your resume, applications, and practice work moving from one calm workspace.</p>
        </div>
        <button
          className="secondaryButton"
          type="button"
          onClick={() => {
            clearStudentToken();
            window.location.href = "/student-login";
          }}
        >
          Logout
        </button>
      </section>

      <section className="studentMetricGrid">
        <article>
          <span>{data.resume_completion}%</span>
          <p>Resume complete</p>
        </article>
        <article>
          <span>{data.applied_jobs}</span>
          <p>Jobs applied</p>
        </article>
        <article>
          <span>{data.latest_mock_score ?? "-"}</span>
          <p>Latest mock score</p>
        </article>
        <article>
          <span>{data.latest_coding_score ?? "-"}</span>
          <p>Latest coding score</p>
        </article>
      </section>

      <section className="studentDashboardGrid">
        <div className="studentActionPanel">
          <span className="dashboardBadge">Quick actions</span>
          <h2>Next best move</h2>
          <a className="primaryButton" href="/resume-builder">
            Edit resume
          </a>
          <a className="secondaryButton" href="/jobs">
            Browse jobs
          </a>
          <a className="secondaryButton" href="/mock-ai-interview">
            Practice interview
          </a>
          <a className="secondaryButton" href="/events">
            Open coding event
          </a>
        </div>

        <div className="studentDashboardStack">
          <div className="studentApplicationsPanel">
            <span className="dashboardBadge">Applications</span>
            <h2>Job status tracker</h2>
            {data.applications.length ? (
              <div className="studentApplicationList">
                {data.applications.map((application) => (
                  <article key={application.id}>
                    <div>
                      <strong>{application.job_title}</strong>
                      <p>
                        {application.company} - {application.location}
                      </p>
                    </div>
                    <span>{statusLabel(application.status)}</span>
                    {application.admin_note ? <small>{application.admin_note}</small> : null}
                  </article>
                ))}
              </div>
            ) : (
              <p>No applications yet. Apply to a role from the Jobs page.</p>
            )}
          </div>

          <div className="studentCodingPanel">
            <span className="dashboardBadge">Coding evaluation</span>
            <h2>Recent assessment attempts</h2>
            {data.coding_attempts.length ? (
              <div className="studentCodingList">
                {data.coding_attempts.map((attempt) => (
                  <article key={attempt.id}>
                    <div>
                      <strong>{attempt.assessment_title}</strong>
                      <p>
                        {attempt.solved_count}/{attempt.question_count} solved - {statusLabel(attempt.status)}
                      </p>
                    </div>
                    <span>{attempt.total_score}</span>
                  </article>
                ))}
              </div>
            ) : (
              <p>No coding attempts yet. Start one from the Events page.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
