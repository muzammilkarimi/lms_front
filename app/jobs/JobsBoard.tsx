"use client";

import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../lib/api";
import { getStudentToken, studentAuthHeaders } from "../lib/studentAuth";

export type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  job_type: string;
  skills: string[];
  description: string;
  eligibility: string;
  compensation: string;
  last_date: string;
  apply_link: string;
};

type JobsBoardProps = {
  jobs: Job[];
};

type ResumeCheck = {
  score: number;
  verdict: string;
  can_apply: boolean;
  matched_keywords: string[];
  missing_keywords: string[];
  weak_sections: string[];
  suggestions: string[];
  suggested_resume_patch: Record<string, string>;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function unique(values: string[]) {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

export function JobsBoard({ jobs }: JobsBoardProps) {
  const [query, setQuery] = useState("");
  const [jobType, setJobType] = useState("all");
  const [location, setLocation] = useState("all");
  const [skill, setSkill] = useState("all");
  const [applications, setApplications] = useState<Record<number, string>>({});
  const [message, setMessage] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [resumeCheck, setResumeCheck] = useState<ResumeCheck | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const jobTypes = useMemo(() => unique(jobs.map((job) => job.job_type)), [jobs]);
  const locations = useMemo(() => unique(jobs.map((job) => job.location)), [jobs]);
  const skills = useMemo(() => unique(jobs.flatMap((job) => job.skills)), [jobs]);

  const filteredJobs = useMemo(() => {
    const search = query.trim().toLowerCase();

    return jobs.filter((job) => {
      const searchable = [
        job.title,
        job.company,
        job.location,
        job.job_type,
        job.description,
        job.eligibility,
        job.compensation,
        ...job.skills,
      ]
        .join(" ")
        .toLowerCase();

      return (
        (!search || searchable.includes(search)) &&
        (jobType === "all" || job.job_type === jobType) &&
        (location === "all" || job.location === location) &&
        (skill === "all" || job.skills.includes(skill))
      );
    });
  }, [jobs, jobType, location, query, skill]);

  useEffect(() => {
    if (!getStudentToken()) {
      return;
    }
    fetch(`${API_BASE_URL}/api/students/applications`, {
      headers: studentAuthHeaders(),
    })
      .then((response) => response.ok ? response.json() : [])
      .then((items: { job_id: number; status: string }[]) => {
        setApplications(Object.fromEntries(items.map((item) => [item.job_id, item.status])));
      });
  }, []);

  function clearFilters() {
    setQuery("");
    setJobType("all");
    setLocation("all");
    setSkill("all");
  }

  async function submitApplication(jobId: number, check?: ResumeCheck, appliedWithAiFix = false) {
    setMessage("Saving application...");
    const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/apply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...studentAuthHeaders(),
      },
      body: JSON.stringify({
        ats_score: check?.score ?? null,
        matched_keywords: check?.matched_keywords ?? [],
        missing_keywords: check?.missing_keywords ?? [],
        ai_suggestions: check?.suggestions ?? [],
        applied_with_ai_fix: appliedWithAiFix,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.detail ?? "Could not apply.");
      return;
    }
    setApplications((current) => ({ ...current, [jobId]: data.status }));
    setSelectedJob(null);
    setResumeCheck(null);
    setMessage("Application saved. Track status in your dashboard.");
  }

  async function checkAndApply(job: Job) {
    if (!getStudentToken()) {
      window.location.href = "/student-login";
      return;
    }
    setSelectedJob(job);
    setIsChecking(true);
    setMessage("Checking resume with AI...");
    const response = await fetch(`${API_BASE_URL}/api/jobs/${job.id}/ai-resume-check`, {
      method: "POST",
      headers: studentAuthHeaders(),
    });
    const data = await response.json();
    setIsChecking(false);
    if (!response.ok) {
      setSelectedJob(null);
      setMessage(data.detail ?? "Could not check resume.");
      return;
    }
    setResumeCheck(data);
    setMessage("");
    if (data.can_apply) {
      await submitApplication(job.id, data);
    }
  }

  async function applyAiFix() {
    if (!selectedJob || !resumeCheck) {
      return;
    }
    setMessage("Applying AI suggestions to resume...");
    const response = await fetch(`${API_BASE_URL}/api/students/resume/apply-ai-patch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...studentAuthHeaders(),
      },
      body: JSON.stringify({ patch: resumeCheck.suggested_resume_patch }),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.detail ?? "Could not apply AI suggestions.");
      return;
    }
    await submitApplication(selectedJob.id, resumeCheck, true);
  }

  return (
    <main className="jobsCompactPage">
      <section className="jobsMiniIntro">
        <div className="jobsIntroContent">
          <div>
            <p className="eyebrow">Job board</p>
            <h1>Discover your ideal career right here!</h1>
            <p>Find roles that match your skills, location, and placement goals.</p>
          </div>
          <img
            className="jobBoardMascot"
            src="https://img.icons8.com/ios-filled/188/1f2937/briefcase.png"
            alt="Dark briefcase illustration"
          />
        </div>
      </section>

      <section className="jobsBoard">
        <div className="jobsToolbar">
          <label className="jobSearchField">
            <span>Search jobs</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title, company, skill..."
            />
          </label>
          <label className="filterField">
            <span>Type</span>
            <select value={jobType} onChange={(event) => setJobType(event.target.value)}>
              <option value="all">All types</option>
              {jobTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label className="filterField">
            <span>Location</span>
            <select value={location} onChange={(event) => setLocation(event.target.value)}>
              <option value="all">All locations</option>
              {locations.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="filterField">
            <span>Skill</span>
            <select value={skill} onChange={(event) => setSkill(event.target.value)}>
              <option value="all">All skills</option>
              {skills.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="jobsResultBar">
          <p>
            Showing <strong>{filteredJobs.length}</strong> of <strong>{jobs.length}</strong> roles
          </p>
          {message ? <p>{message}</p> : null}
          <button className="secondaryButton" type="button" onClick={clearFilters}>
            Clear filters
          </button>
        </div>

        {filteredJobs.length ? (
          <div className="jobGrid">
            {filteredJobs.map((job) => (
              <article className="jobCard" key={job.id}>
                <div className="cardTopline">
                  <span>{job.job_type}</span>
                  <small>{formatDate(job.last_date)}</small>
                </div>
                <div className="jobCompanyRow">
                  <div className="jobCompanyMark" aria-hidden="true">
                    {job.company.slice(0, 1)}
                  </div>
                  <div>
                    <strong>{job.company}</strong>
                    <span>{job.location}</span>
                  </div>
                </div>
                <h2>{job.title}</h2>
                <p className="jobDescription">{job.description}</p>
                <div className="jobQuickInfo">
                  <p>
                    <span>Pay</span>
                    {job.compensation}
                  </p>
                  <p>
                    <span>Fit</span>
                    {job.eligibility}
                  </p>
                </div>
                <div className="pillRow">
                  {job.skills.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
                <div className="jobCardFooter">
                  {applications[job.id] ? <small>{applications[job.id].replaceAll("_", " ")}</small> : null}
                  <button className="primaryButton" type="button" onClick={() => checkAndApply(job)}>
                    {applications[job.id] ? "Applied" : "Apply now"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="emptyJobs">
            <h2>No matching jobs found</h2>
            <p>Try a different skill, location, role type, or search keyword.</p>
            <button className="primaryButton" type="button" onClick={clearFilters}>
              Reset search
            </button>
          </div>
        )}
      </section>
      {selectedJob && resumeCheck && !resumeCheck.can_apply ? (
        <div className="resumeCheckOverlay" role="dialog" aria-modal="true">
          <article className="resumeCheckModal">
            <div className="resumeCheckTop">
              <span>{resumeCheck.score}/100</span>
              <div>
                <p className="eyebrow">AI resume match</p>
                <h2>{selectedJob.title}</h2>
                <p>{resumeCheck.verdict}</p>
              </div>
            </div>
            <div className="resumeCheckGrid">
              <div>
                <h3>Missing keywords</h3>
                <div className="pillRow">
                  {resumeCheck.missing_keywords.map((keyword) => (
                    <span key={keyword}>{keyword}</span>
                  ))}
                </div>
              </div>
              <div>
                <h3>Suggestions</h3>
                <ul>
                  {resumeCheck.suggestions.map((suggestion) => (
                    <li key={suggestion}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="resumeCheckActions">
              <button className="primaryButton" type="button" onClick={applyAiFix}>
                Apply AI fix and apply
              </button>
              <a className="secondaryButton" href={`/resume-builder?jobId=${selectedJob.id}`}>
                Open resume builder
              </a>
              <button className="secondaryButton" type="button" onClick={() => submitApplication(selectedJob.id, resumeCheck)}>
                Apply anyway
              </button>
              <button
                className="secondaryButton"
                type="button"
                onClick={() => {
                  setSelectedJob(null);
                  setResumeCheck(null);
                }}
              >
                Cancel
              </button>
            </div>
          </article>
        </div>
      ) : null}
      {isChecking ? (
        <div className="resumeCheckOverlay" role="status">
          <article className="resumeCheckModal compactCheckModal">
            <h2>Checking your resume with AI...</h2>
            <p>Comparing your saved resume with the selected job description.</p>
          </article>
        </div>
      ) : null}
    </main>
  );
}
