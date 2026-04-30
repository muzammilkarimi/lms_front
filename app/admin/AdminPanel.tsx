"use client";

import { FormEvent, useEffect, useState } from "react";
import { API_BASE_URL } from "../lib/api";
import { adminAuthHeaders, clearAdminToken, getAdminToken, setAdminToken } from "../lib/adminAuth";

type AdminMode = "overview" | "job" | "event" | "applicants" | "class";

type AdminJob = {
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
  attachment_name: string | null;
  attachment_url: string | null;
  total_applicants: number;
  status_counts: Record<string, number>;
};

type AdminEvent = {
  id: number;
  title: string;
  event_date: string;
  event_time: string;
  mode: string;
  description: string;
  speaker: string;
  registration_link: string;
  attachment_name: string | null;
  attachment_url: string | null;
};

type AdminApplication = {
  application_id: number;
  status: string;
  admin_note: string;
  ats_score: number | null;
  matched_keywords: string[];
  missing_keywords: string[];
  ai_suggestions: string[];
  applied_with_ai_fix: boolean;
  resume_completion: number;
  latest_mock_score: number | null;
  student: {
    name: string;
    email: string;
    phone: string;
    skills: string[];
  };
};

type AdminModalState =
  | {
      type: "job";
      item: AdminJob | null;
    }
  | {
      type: "event";
      item: AdminEvent | null;
    }
  | null;

const statuses = ["applied", "under_review", "shortlisted", "interview_scheduled", "selected", "rejected"];

const adminTabs: Array<{ value: AdminMode; label: string }> = [
  { value: "overview", label: "Overview" },
  { value: "job", label: "Jobs" },
  { value: "event", label: "Events" },
  { value: "applicants", label: "Applicants" },
  { value: "class", label: "Classes" },
];

function formatDate(value: string) {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatStatusLabel(value: string) {
  return value.replaceAll("_", " ");
}

function statusEntries(statusCounts: Record<string, number>) {
  return Object.entries(statusCounts).filter(([, count]) => count > 0);
}

function assetUrl(value: string | null | undefined) {
  if (!value) {
    return "";
  }
  return value.startsWith("http") ? value : `${API_BASE_URL}${value}`;
}

export function AdminPanel() {
  const [email, setEmail] = useState("admin@gyansutra.com");
  const [password, setPassword] = useState("admin123");
  const [token, setToken] = useState("");
  const [mode, setMode] = useState<AdminMode>("overview");
  const [message, setMessage] = useState("Login to open the admin dashboard.");
  const [adminJobs, setAdminJobs] = useState<AdminJob[]>([]);
  const [adminEvents, setAdminEvents] = useState<AdminEvent[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [activeModal, setActiveModal] = useState<AdminModalState>(null);
  const [busyKey, setBusyKey] = useState("");

  const totalApplications = adminJobs.reduce((sum, job) => sum + job.total_applicants, 0);
  const selectedJob = adminJobs.find((job) => job.id === selectedJobId) ?? null;
  const selectedJobStatuses = selectedJob ? statusEntries(selectedJob.status_counts) : [];

  function resetAdminSession(nextMessage = "Login to open the admin dashboard.") {
    clearAdminToken();
    setToken("");
    setMode("overview");
    setAdminJobs([]);
    setAdminEvents([]);
    setSelectedJobId(null);
    setApplications([]);
    setActiveModal(null);
    setBusyKey("");
    setMessage(nextMessage);
  }

  async function loadAdminJobs(authToken = token) {
    if (!authToken) {
      return;
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/jobs`, {
      headers: adminAuthHeaders(authToken),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        resetAdminSession("Admin session expired. Login again.");
      }
      return;
    }

    const data: AdminJob[] = await response.json();
    setAdminJobs(data);
    setSelectedJobId((current) => {
      if (data.length === 0) {
        return null;
      }
      if (current && data.some((job) => job.id === current)) {
        return current;
      }
      return data[0].id;
    });
  }

  async function loadAdminEvents(authToken = token) {
    if (!authToken) {
      return;
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/events`, {
      headers: adminAuthHeaders(authToken),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        resetAdminSession("Admin session expired. Login again.");
      }
      return;
    }

    setAdminEvents(await response.json());
  }

  async function loadApplications(jobId = selectedJobId, authToken = token) {
    if (!authToken || !jobId) {
      setApplications([]);
      return;
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/jobs/${jobId}/applications`, {
      headers: adminAuthHeaders(authToken),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        resetAdminSession("Admin session expired. Login again.");
      }
      return;
    }

    setApplications(await response.json());
  }

  useEffect(() => {
    let isMounted = true;

    async function restoreAdminSession() {
      const storedToken = getAdminToken();
      if (!storedToken) {
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
          headers: adminAuthHeaders(storedToken),
        });

        if (!response.ok) {
          if (isMounted) {
            resetAdminSession("Admin session expired. Login again.");
          }
          return;
        }

        if (!isMounted) {
          return;
        }

        setToken(storedToken);
        setMessage("Admin session restored.");
        loadAdminJobs(storedToken);
        loadAdminEvents(storedToken);
      } catch {
        if (!isMounted) {
          return;
        }

        setToken(storedToken);
        setMessage("Admin session restored.");
        loadAdminJobs(storedToken);
        loadAdminEvents(storedToken);
      }
    }

    restoreAdminSession();

    function handleStorage() {
      const storedToken = getAdminToken();
      if (!storedToken) {
        if (isMounted) {
          resetAdminSession();
        }
        return;
      }
      if (isMounted) {
        setToken(storedToken);
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => {
      isMounted = false;
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }
    loadAdminJobs();
    loadAdminEvents();
  }, [token]);

  useEffect(() => {
    if (mode === "applicants" && token) {
      loadApplications();
    }
  }, [mode, selectedJobId, token]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      setMessage(data.detail ?? "Login failed.");
      return;
    }

    setAdminToken(data.token);
    setToken(data.token);
    setMode("overview");
    setMessage("Admin login successful.");
  }

  function openJobModal(job: AdminJob | null = null) {
    setActiveModal({ type: "job", item: job });
  }

  function openEventModal(item: AdminEvent | null = null) {
    setActiveModal({ type: "event", item });
  }

  async function submitEntity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeModal) {
      return;
    }

    const form = new FormData(event.currentTarget);
    const isEditing = Boolean(activeModal.item);
    const busyToken = `${activeModal.type}-submit`;
    setBusyKey(busyToken);

    const endpoint =
      activeModal.type === "job"
        ? `${API_BASE_URL}/api/jobs${isEditing ? `/${activeModal.item?.id}` : ""}`
        : `${API_BASE_URL}/api/events${isEditing ? `/${activeModal.item?.id}` : ""}`;

    let attachmentName =
      activeModal.type === "job" ? activeModal.item?.attachment_name ?? null : activeModal.item?.attachment_name ?? null;
    let attachmentUrl =
      activeModal.type === "job" ? activeModal.item?.attachment_url ?? null : activeModal.item?.attachment_url ?? null;

    const attachmentFile = form.get("attachment");
    if (attachmentFile instanceof File && attachmentFile.size > 0) {
      const uploadPayload = new FormData();
      uploadPayload.append("file", attachmentFile);
      uploadPayload.append("entity_type", activeModal.type === "job" ? "job-attachment" : "event-attachment");

      const uploadResponse = await fetch(`${API_BASE_URL}/api/admin/uploads`, {
        method: "POST",
        headers: adminAuthHeaders(token),
        body: uploadPayload,
      });

      const uploadData = await uploadResponse.json().catch(() => ({}));
      if (!uploadResponse.ok) {
        setBusyKey("");
        if (uploadResponse.status === 401 || uploadResponse.status === 403) {
          resetAdminSession("Admin session expired. Login again.");
          return;
        }
        setMessage(uploadData.detail ?? "Could not upload attachment.");
        return;
      }

      attachmentName = String(uploadData.filename ?? attachmentFile.name);
      attachmentUrl = String(uploadData.url ?? "");
    }

    const payload =
      activeModal.type === "job"
        ? {
            title: String(form.get("title") ?? ""),
            company: String(form.get("company") ?? ""),
            location: String(form.get("location") ?? ""),
            job_type: String(form.get("type") ?? ""),
            skills: String(form.get("skills") ?? "")
              .split(",")
              .map((skill) => skill.trim())
              .filter(Boolean),
            description: String(form.get("description") ?? ""),
            eligibility: String(form.get("eligibility") ?? ""),
            compensation: String(form.get("compensation") ?? ""),
            last_date: String(form.get("date") ?? ""),
            apply_link: String(form.get("link") ?? ""),
            attachment_name: attachmentName,
            attachment_url: attachmentUrl,
          }
        : {
            title: String(form.get("title") ?? ""),
            event_date: String(form.get("date") ?? ""),
            event_time: String(form.get("time") ?? ""),
            mode: String(form.get("type") ?? ""),
            description: String(form.get("description") ?? ""),
            speaker: String(form.get("speaker") ?? ""),
            registration_link: String(form.get("link") ?? ""),
            attachment_name: attachmentName,
            attachment_url: attachmentUrl,
          };

    const response = await fetch(endpoint, {
      method: isEditing ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json",
        ...adminAuthHeaders(token),
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setBusyKey("");
      if (response.status === 401 || response.status === 403) {
        resetAdminSession("Admin session expired. Login again.");
        return;
      }
      setMessage(data.detail ?? "Could not save item.");
      return;
    }

    setMessage(
      `${activeModal.type === "job" ? "Job" : "Event"} ${isEditing ? "updated" : "created"}.`,
    );
    setActiveModal(null);
    setBusyKey("");

    if (activeModal.type === "job") {
      await loadAdminJobs();
    } else {
      await loadAdminEvents();
    }
  }

  async function deleteJob(job: AdminJob) {
    if (!window.confirm(`Delete "${job.title}" from ${job.company}?`)) {
      return;
    }

    const nextBusyKey = `job-delete-${job.id}`;
    setBusyKey(nextBusyKey);

    const response = await fetch(`${API_BASE_URL}/api/jobs/${job.id}`, {
      method: "DELETE",
      headers: adminAuthHeaders(token),
    });

    if (!response.ok) {
      setBusyKey("");
      if (response.status === 401 || response.status === 403) {
        resetAdminSession("Admin session expired. Login again.");
        return;
      }
      const data = await response.json().catch(() => ({}));
      setMessage(data.detail ?? "Could not delete job.");
      return;
    }

    setSelectedJobId((current) => (current === job.id ? null : current));
    setBusyKey("");
    setMessage("Job deleted.");
    await loadAdminJobs();
  }

  async function deleteEventItem(item: AdminEvent) {
    if (!window.confirm(`Delete "${item.title}"?`)) {
      return;
    }

    const nextBusyKey = `event-delete-${item.id}`;
    setBusyKey(nextBusyKey);

    const response = await fetch(`${API_BASE_URL}/api/events/${item.id}`, {
      method: "DELETE",
      headers: adminAuthHeaders(token),
    });

    if (!response.ok) {
      setBusyKey("");
      if (response.status === 401 || response.status === 403) {
        resetAdminSession("Admin session expired. Login again.");
        return;
      }
      const data = await response.json().catch(() => ({}));
      setMessage(data.detail ?? "Could not delete event.");
      return;
    }

    setBusyKey("");
    setMessage("Event deleted.");
    await loadAdminEvents();
  }

  async function updateApplication(application: AdminApplication, form: FormData) {
    const response = await fetch(`${API_BASE_URL}/api/admin/applications/${application.application_id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...adminAuthHeaders(token),
      },
      body: JSON.stringify({
        status: form.get("status"),
        admin_note: form.get("admin_note"),
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        resetAdminSession("Admin session expired. Login again.");
        return;
      }
      setMessage(data.detail ?? "Could not update application.");
      return;
    }

    setMessage("Application updated.");
    await loadApplications();
    await loadAdminJobs();
  }

  async function downloadApplicantSheet() {
    if (!selectedJobId) {
      setMessage("Select a job before downloading applicants.");
      return;
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/jobs/${selectedJobId}/applicants-export`, {
      headers: adminAuthHeaders(token),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setMessage(data.detail ?? "Could not download applicant sheet.");
      return;
    }

    const disposition = response.headers.get("content-disposition") ?? "";
    const filename = disposition.match(/filename=\"(.+)\"/)?.[1] ?? `job-${selectedJobId}-applicants.csv`;
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setMessage("Applicant sheet downloaded.");
  }

  function renderOverview() {
    return (
      <>
        <div className="adminOverviewGrid">
          <article className="adminOverviewCard">
            <span className="adminEntityLabel">Jobs</span>
            <strong>{adminJobs.length}</strong>
            <p>Open roles ready for review and update.</p>
          </article>
          <article className="adminOverviewCard">
            <span className="adminEntityLabel">Applicants</span>
            <strong>{totalApplications}</strong>
            <p>Students currently in the hiring pipeline.</p>
          </article>
          <article className="adminOverviewCard">
            <span className="adminEntityLabel">Events</span>
            <strong>{adminEvents.length}</strong>
            <p>Upcoming sessions and drives published.</p>
          </article>
        </div>

        <div className="adminPreviewGrid">
          <section className="adminPreviewPanel">
            <div className="adminSectionCopy">
              <span className="adminEntityLabel">Recent jobs</span>
              <h2>Latest openings</h2>
            </div>
            <div className="adminPreviewList">
              {adminJobs.slice(0, 4).map((job) => (
                <article key={job.id}>
                  <strong>{job.title}</strong>
                  <span>
                    {job.company} | {job.location}
                  </span>
                </article>
              ))}
              {!adminJobs.length ? <p>No jobs published yet.</p> : null}
            </div>
          </section>

          <section className="adminPreviewPanel">
            <div className="adminSectionCopy">
              <span className="adminEntityLabel">Recent events</span>
              <h2>Upcoming sessions</h2>
            </div>
            <div className="adminPreviewList">
              {adminEvents.slice(0, 4).map((item) => (
                <article key={item.id}>
                  <strong>{item.title}</strong>
                  <span>
                    {formatDate(item.event_date)} | {item.mode}
                  </span>
                </article>
              ))}
              {!adminEvents.length ? <p>No events published yet.</p> : null}
            </div>
          </section>
        </div>
      </>
    );
  }

  function renderJobs() {
    return (
      <>
        <header className="adminSectionBar">
          <div className="adminSectionCopy">
            <span className="adminEntityLabel">Jobs</span>
            <h2>Existing roles</h2>
          </div>
          <button className="primaryButton" type="button" onClick={() => openJobModal()}>
            New job
          </button>
        </header>

        <div className="adminEntityGrid">
          {adminJobs.map((job) => (
            <article className="adminEntityCard" key={job.id}>
              <div className="adminEntityTop">
                <div>
                  <span className="adminEntityLabel">{job.company}</span>
                  <h3>{job.title}</h3>
                </div>
                <span className="adminMiniBadge">{job.job_type}</span>
              </div>

              <div className="adminEntitySub">
                <span>
                  {job.location} | Apply by {formatDate(job.last_date)}
                </span>
                <span>{job.compensation}</span>
              </div>

              <p>{job.description}</p>

              <div className="adminEntityMeta">
                {job.skills.slice(0, 5).map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>

              <div className="adminStatusRow">
                <span>{job.total_applicants} applicants</span>
                {statusEntries(job.status_counts).slice(0, 3).map(([status, count]) => (
                  <span key={status}>
                    {count} {formatStatusLabel(status)}
                  </span>
                ))}
              </div>

              {job.attachment_url ? (
                <a className="adminAttachmentLink" href={assetUrl(job.attachment_url)} rel="noreferrer" target="_blank">
                  {job.attachment_name ?? "Open attachment"}
                </a>
              ) : null}

              <div className="adminCardActions">
                <button className="secondaryButton" type="button" onClick={() => openJobModal(job)}>
                  Update
                </button>
                <button
                  className="dangerButton"
                  disabled={busyKey === `job-delete-${job.id}`}
                  type="button"
                  onClick={() => deleteJob(job)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}

          {!adminJobs.length ? (
            <div className="adminEmptyPanel">
              <h3>No jobs yet</h3>
              <p>Create the first job from the top-right button.</p>
            </div>
          ) : null}
        </div>
      </>
    );
  }

  function renderEvents() {
    return (
      <>
        <header className="adminSectionBar">
          <div className="adminSectionCopy">
            <span className="adminEntityLabel">Events</span>
            <h2>Existing events</h2>
          </div>
          <button className="primaryButton" type="button" onClick={() => openEventModal()}>
            New event
          </button>
        </header>

        <div className="adminEntityGrid">
          {adminEvents.map((item) => (
            <article className="adminEntityCard" key={item.id}>
              <div className="adminEntityTop">
                <div>
                  <span className="adminEntityLabel">{item.mode}</span>
                  <h3>{item.title}</h3>
                </div>
                <span className="adminMiniBadge">{item.event_time.slice(0, 5)}</span>
              </div>

              <div className="adminEntitySub">
                <span>{formatDate(item.event_date)}</span>
                <span>{item.speaker}</span>
              </div>

              <p>{item.description}</p>

              <div className="adminEntityMeta">
                <span>{item.mode}</span>
                <span>{item.speaker}</span>
                <span>{formatDate(item.event_date)}</span>
              </div>

              {item.attachment_url ? (
                <a className="adminAttachmentLink" href={assetUrl(item.attachment_url)} rel="noreferrer" target="_blank">
                  {item.attachment_name ?? "Open attachment"}
                </a>
              ) : null}

              <div className="adminCardActions">
                <button className="secondaryButton" type="button" onClick={() => openEventModal(item)}>
                  Update
                </button>
                <button
                  className="dangerButton"
                  disabled={busyKey === `event-delete-${item.id}`}
                  type="button"
                  onClick={() => deleteEventItem(item)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}

          {!adminEvents.length ? (
            <div className="adminEmptyPanel">
              <h3>No events yet</h3>
              <p>Create the first event from the top-right button.</p>
            </div>
          ) : null}
        </div>
      </>
    );
  }

  function renderApplicants() {
    return (
      <>
        <header className="adminSectionBar">
          <div className="adminSectionCopy">
            <span className="adminEntityLabel">Applicants</span>
            <h2>Applications by job</h2>
          </div>
          {selectedJob ? (
            <button className="primaryButton" type="button" onClick={downloadApplicantSheet}>
              Download sheet
            </button>
          ) : null}
        </header>

        <div className="adminApplicantsLayout">
          <aside className="adminApplicantsRail">
            {adminJobs.map((job) => (
              <button
                className={job.id === selectedJobId ? "activeAdminJob" : ""}
                key={job.id}
                type="button"
                onClick={() => setSelectedJobId(job.id)}
              >
                <small>{job.company}</small>
                <strong>{job.title}</strong>
                <span>
                  {job.total_applicants} applicants | {job.location}
                </span>
              </button>
            ))}

            {!adminJobs.length ? (
              <div className="adminEmptyPanel">
                <h3>No jobs yet</h3>
                <p>Create a job first to track applicants.</p>
              </div>
            ) : null}
          </aside>

          <div className="adminApplicantsDetail">
            {selectedJob ? (
              <>
                <section className="adminCompanyHeader">
                  <span className="adminEntityLabel">{selectedJob.company}</span>
                  <h2>{selectedJob.title}</h2>
                  <div className="adminCompanyMeta">
                    <span>{selectedJob.location}</span>
                    <span>{selectedJob.job_type}</span>
                    <span>Apply by {formatDate(selectedJob.last_date)}</span>
                    <span>{selectedJob.total_applicants} applicants</span>
                  </div>
                  <div className="adminStatusRow">
                    {selectedJobStatuses.map(([status, count]) => (
                      <span key={status}>
                        {count} {formatStatusLabel(status)}
                      </span>
                    ))}
                    {!selectedJobStatuses.length ? <span>No status updates yet</span> : null}
                  </div>
                </section>

                <div className="adminApplicantCards">
                  {applications.map((application) => (
                    <form
                      className="adminApplicantCard"
                      key={application.application_id}
                      onSubmit={(event) => {
                        event.preventDefault();
                        updateApplication(application, new FormData(event.currentTarget));
                      }}
                    >
                      <div className="adminApplicantSummary">
                        <div>
                          <h3>{application.student.name}</h3>
                          <p>
                            {application.student.email} | {application.student.phone}
                          </p>
                        </div>

                        <div className="adminApplicantSignals">
                          <span>Resume {application.resume_completion}%</span>
                          <span>Mock {application.latest_mock_score ?? "-"}</span>
                          <span>ATS {application.ats_score ?? "-"}</span>
                        </div>

                        {application.student.skills.length ? (
                          <div className="pillRow">
                            {application.student.skills.slice(0, 6).map((skill) => (
                              <span key={skill}>{skill}</span>
                            ))}
                          </div>
                        ) : null}

                        {application.missing_keywords.length ? (
                          <small>Missing: {application.missing_keywords.slice(0, 5).join(", ")}</small>
                        ) : null}
                        {application.ai_suggestions.length ? <small>AI note: {application.ai_suggestions[0]}</small> : null}
                        <small>{application.applied_with_ai_fix ? "Applied after AI fix" : "Applied without AI fix"}</small>
                      </div>

                      <div className="adminApplicantControls">
                        <label>
                          <span>Status</span>
                          <select name="status" defaultValue={application.status}>
                            {statuses.map((status) => (
                              <option key={status} value={status}>
                                {formatStatusLabel(status)}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="adminNoteField">
                          <span>Admin note</span>
                          <textarea name="admin_note" defaultValue={application.admin_note} rows={4} />
                        </label>
                        <button className="secondaryButton" type="submit">
                          Save update
                        </button>
                      </div>
                    </form>
                  ))}

                  {!applications.length ? (
                    <div className="adminEmptyPanel">
                      <h3>No applicants yet</h3>
                      <p>Applications for this job will appear here.</p>
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              <div className="adminEmptyPanel">
                <h3>Select a job</h3>
                <p>Choose a company from the left to view applicant details.</p>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  function renderClasses() {
    return (
      <div className="adminEmptyPanel">
        <h3>Classes</h3>
        <p>Coming soon.</p>
      </div>
    );
  }

  function renderModal() {
    if (!activeModal) {
      return null;
    }

    const isJobModal = activeModal.type === "job";
    const item = activeModal.item;
    const title = isJobModal
      ? item
        ? "Update job"
        : "New job"
      : item
        ? "Update event"
        : "New event";

    return (
      <div
        className="adminModalBackdrop"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            setActiveModal(null);
          }
        }}
      >
        <div className="adminModalCard">
          <div className="adminModalHeader">
            <div className="adminSectionCopy">
              <span className="adminEntityLabel">{isJobModal ? "Jobs" : "Events"}</span>
              <h2>{title}</h2>
            </div>
            <button className="adminCloseButton" type="button" onClick={() => setActiveModal(null)}>
              Close
            </button>
          </div>

          <form
            className="adminModalForm"
            key={`${activeModal.type}-${item?.id ?? "new"}`}
            onSubmit={submitEntity}
          >
            <div className="adminModalGrid">
              <label>
                <span>Title</span>
                <input name="title" defaultValue={item?.title ?? ""} required />
              </label>

              {isJobModal ? (
                <label>
                  <span>Company</span>
                  <input name="company" defaultValue={(item as AdminJob | null)?.company ?? ""} required />
                </label>
              ) : (
                <label>
                  <span>Speaker</span>
                  <input name="speaker" defaultValue={(item as AdminEvent | null)?.speaker ?? ""} required />
                </label>
              )}

              {isJobModal ? (
                <>
                  <label>
                    <span>Location</span>
                    <input name="location" defaultValue={(item as AdminJob | null)?.location ?? ""} required />
                  </label>
                  <label>
                    <span>Job type</span>
                    <input name="type" defaultValue={(item as AdminJob | null)?.job_type ?? ""} required />
                  </label>
                  <label>
                    <span>Eligibility</span>
                    <input name="eligibility" defaultValue={(item as AdminJob | null)?.eligibility ?? ""} required />
                  </label>
                  <label>
                    <span>Compensation</span>
                    <input name="compensation" defaultValue={(item as AdminJob | null)?.compensation ?? ""} required />
                  </label>
                  <label className="adminModalWide">
                    <span>Skills</span>
                    <input
                      name="skills"
                      defaultValue={(item as AdminJob | null)?.skills.join(", ") ?? ""}
                      placeholder="React, Python, SQL"
                      required
                    />
                  </label>
                </>
              ) : (
                <>
                  <label>
                    <span>Date</span>
                    <input name="date" type="date" defaultValue={(item as AdminEvent | null)?.event_date ?? ""} required />
                  </label>
                  <label>
                    <span>Time</span>
                    <input
                      name="time"
                      type="time"
                      defaultValue={(item as AdminEvent | null)?.event_time?.slice(0, 5) ?? ""}
                      required
                    />
                  </label>
                  <label>
                    <span>Mode or venue</span>
                    <input name="type" defaultValue={(item as AdminEvent | null)?.mode ?? ""} required />
                  </label>
                </>
              )}

              {isJobModal ? (
                <>
                  <label>
                    <span>Last date</span>
                    <input name="date" type="date" defaultValue={(item as AdminJob | null)?.last_date ?? ""} required />
                  </label>
                  <label>
                    <span>Apply link</span>
                    <input name="link" type="url" defaultValue={(item as AdminJob | null)?.apply_link ?? ""} required />
                  </label>
                </>
              ) : (
                <label className="adminModalWide">
                  <span>Registration link</span>
                  <input
                    name="link"
                    type="url"
                    defaultValue={(item as AdminEvent | null)?.registration_link ?? ""}
                    required
                  />
                </label>
              )}

              <label className="adminModalWide adminUploadField">
                <span>{isJobModal ? "JD or document" : "Poster or document"}</span>
                <input
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
                  name="attachment"
                  type="file"
                />
                <small>PDF, DOC, DOCX, PNG, JPG, JPEG, or WEBP up to 8 MB.</small>
                {item?.attachment_url ? (
                  <a href={assetUrl(item.attachment_url)} rel="noreferrer" target="_blank">
                    Current file: {item.attachment_name ?? "Open attachment"}
                  </a>
                ) : null}
              </label>

              <label className="adminModalWide">
                <span>Description</span>
                <textarea
                  name="description"
                  defaultValue={item?.description ?? ""}
                  rows={5}
                  required
                />
              </label>
            </div>

            <div className="adminModalActions">
              <button className="secondaryButton" type="button" onClick={() => setActiveModal(null)}>
                Cancel
              </button>
              <button className="primaryButton" disabled={busyKey === `${activeModal.type}-submit`} type="submit">
                {item ? "Save changes" : isJobModal ? "Create job" : "Create event"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <section className="adminLoginGate">
        <form className="adminLogin adminLoginCompact gateCard" onSubmit={login}>
          <label>
            <span>Email</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            <span>Password</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          <button className="primaryButton" type="submit">
            Open dashboard
          </button>
          <p className="adminLoginMessage">{message}</p>
        </form>
      </section>
    );
  }

  return (
    <>
      <section className="adminShell adminWorkbench">
        <aside className="adminWorkbenchSidebar">
          <div className="adminWorkbenchBrand">
            <span className="dashboardBadge">Admin panel</span>
            <h2>Control center</h2>
            <p>Manage roles, events, and applicant movement from one place.</p>
          </div>

          <nav className="adminWorkbenchNav" aria-label="Admin sections">
            {adminTabs.map((item) => (
              <button
                className={mode === item.value ? "activeAdminTab" : ""}
                key={item.value}
                type="button"
                onClick={() => setMode(item.value)}
              >
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="adminWorkbenchSidebarFoot">
            <p className="adminWorkbenchStatus">{message}</p>
            <button className="secondaryButton adminLogoutButton" type="button" onClick={() => resetAdminSession()}>
              Logout
            </button>
          </div>
        </aside>

        <div className="adminWorkbenchMain">
          {mode === "overview" ? renderOverview() : null}
          {mode === "job" ? renderJobs() : null}
          {mode === "event" ? renderEvents() : null}
          {mode === "applicants" ? renderApplicants() : null}
          {mode === "class" ? renderClasses() : null}
        </div>
      </section>

      {renderModal()}
    </>
  );
}
