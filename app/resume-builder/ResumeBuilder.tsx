"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { API_BASE_URL } from "../lib/api";
import { getStudentToken, studentAuthHeaders } from "../lib/studentAuth";

type ResumeSectionKey = "summary" | "skills" | "education" | "projects" | "experience" | "achievements" | "certifications";
type ResumeTemplate = "clean" | "accent" | "compact";

type ResumeState = {
  name: string;
  role: string;
  email: string;
  phone: string;
  links: string;
  summary: string;
  education: string;
  skills: string;
  projects: string;
  experience: string;
  achievements: string;
  certifications: string;
};

const initialResume: ResumeState = {
  name: "Raj Student",
  role: "Frontend Developer",
  email: "raj@example.com",
  phone: "+91 98765 43210",
  links: "linkedin.com/in/raj | github.com/raj",
  summary: "Computer Science student seeking a fresher software role with strong foundations in frontend development, APIs, SQL, and problem solving.",
  education: "B.Tech Computer Science, 2026 - ABC Institute of Technology, CGPA: 8.4/10\nClass XII - Science Stream, 2022, 86%",
  skills: "React, TypeScript, JavaScript, Python, SQL, HTML, CSS, Git",
  projects: "Gyansutra AI - Built job listing and resume builder screens using Next.js.\nAPI Tracker - Created a FastAPI service for tracking study tasks.",
  experience: "Frontend Intern - Improved reusable components and fixed responsive layout bugs.",
  achievements: "Solved 250+ DSA problems across arrays, strings, trees, and dynamic programming.\nLed a team of 4 for a college hackathon prototype.",
  certifications: "Python Basics Certificate\nWeb Development Bootcamp",
};

const sections: {
  id: string;
  title: string;
  hint: string;
  fields: { key: keyof ResumeState; label: string; multiline?: boolean }[];
}[] = [
  {
    id: "profile",
    title: "Profile",
    hint: "Name, role, and contact details.",
    fields: [
      { key: "name", label: "Full name" },
      { key: "role", label: "Target role" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "links", label: "Links" },
    ],
  },
  {
    id: "summary",
    title: "Summary",
    hint: "Short objective and core skills.",
    fields: [
      { key: "summary", label: "Objective", multiline: true },
      { key: "skills", label: "Technical skills" },
    ],
  },
  {
    id: "work",
    title: "Projects",
    hint: "Projects and internships.",
    fields: [
      { key: "projects", label: "Academic projects", multiline: true },
      { key: "experience", label: "Experience / internships", multiline: true },
    ],
  },
  {
    id: "education",
    title: "Education",
    hint: "Education and proof points.",
    fields: [
      { key: "education", label: "Education", multiline: true },
      { key: "achievements", label: "Achievements", multiline: true },
      { key: "certifications", label: "Certifications", multiline: true },
    ],
  },
];

const previewSections: { key: ResumeSectionKey; title: string }[] = [
  { key: "summary", title: "Objective" },
  { key: "skills", title: "Technical Skills" },
  { key: "education", title: "Education" },
  { key: "projects", title: "Academic Projects" },
  { key: "experience", title: "Experience" },
  { key: "achievements", title: "Achievements" },
  { key: "certifications", title: "Certifications" },
];

function lines(value: string) {
  return value.split("\n").filter(Boolean);
}

function educationRows(value: string) {
  return lines(value).map((item) => {
    const score = item.match(/(?:CGPA[:\s]*[\d.]+\/?\d*|[\d.]+%)/i)?.[0] ?? "-";
    const year = item.match(/\b(20\d{2}|19\d{2})\b/)?.[0] ?? "-";
    const [qualificationPart, rest = ""] = item.split(" - ");
    const qualification = qualificationPart.split(",")[0]?.trim() || item;
    const institute = rest.split(",")[0]?.trim() || qualificationPart.split(",").slice(1).join(",").trim() || "-";

    return {
      qualification,
      institute,
      year,
      score,
    };
  });
}

export function ResumeBuilder() {
  const resumeRef = useRef<HTMLElement | null>(null);
  const resumeContentRef = useRef<HTMLDivElement | null>(null);
  const [resume, setResume] = useState(initialResume);
  const [activeSection, setActiveSection] = useState(sections[0].id);
  const [template, setTemplate] = useState<ResumeTemplate>("clean");
  const [hiddenSections, setHiddenSections] = useState<ResumeSectionKey[]>([]);
  const [fitToOnePage, setFitToOnePage] = useState(false);
  const [fitScale, setFitScale] = useState(1);
  const [isOverOnePage, setIsOverOnePage] = useState(false);
  const [saveMessage, setSaveMessage] = useState("Login to save this resume to your student account.");
  const skillList = useMemo(
    () => resume.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
    [resume.skills],
  );
  const activeGroup = sections.find((section) => section.id === activeSection) ?? sections[0];
  const filledFields = Object.values(resume).filter((value) => value.trim()).length;
  const totalFields = Object.keys(resume).length;
  const completion = Math.round((filledFields / totalFields) * 100);
  const visibleSections = previewSections.filter((section) => !hiddenSections.includes(section.key));

  useEffect(() => {
    if (!getStudentToken()) {
      return;
    }
    fetch(`${API_BASE_URL}/api/students/resume`, {
      headers: studentAuthHeaders(),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.detail ?? "Could not load saved resume.");
        }
        setResume({
          name: data.name ?? "",
          role: data.role ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
          links: data.links ?? "",
          summary: data.summary ?? "",
          education: data.education ?? "",
          skills: data.skills ?? "",
          projects: data.projects ?? "",
          experience: data.experience ?? "",
          achievements: data.achievements ?? "",
          certifications: data.certifications ?? "",
        });
        const params = new URLSearchParams(window.location.search);
        setSaveMessage(params.get("jobId") ? "Saved resume loaded. Apply the suggestions, save, then return to jobs." : "Saved resume loaded.");
      })
      .catch((error: Error) => setSaveMessage(error.message));
  }, []);

  useEffect(() => {
    const measureResume = () => {
      const paper = resumeRef.current;
      const content = resumeContentRef.current;
      if (!paper || !content) return;
      const styles = window.getComputedStyle(paper);
      const availableHeight =
        paper.clientHeight - parseFloat(styles.paddingTop) - parseFloat(styles.paddingBottom);
      const contentHeight = content.scrollHeight;
      const overflowAmount = contentHeight - availableHeight;
      const overflows = overflowAmount > 12;
      setIsOverOnePage(overflows);
      if (fitToOnePage && overflows) {
        const nextScale = Math.max(0.92, Math.min(fitScale, fitScale * (availableHeight / contentHeight) * 0.99));
        if (Math.abs(nextScale - fitScale) > 0.01) {
          setFitScale(Number(nextScale.toFixed(2)));
        }
      }
    };

    const resizeObserver = new ResizeObserver(measureResume);
    if (resumeRef.current) {
      resizeObserver.observe(resumeRef.current);
    }
    if (resumeContentRef.current) {
      resizeObserver.observe(resumeContentRef.current);
    }
    window.setTimeout(measureResume, 0);
    window.addEventListener("resize", measureResume);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measureResume);
    };
  }, [resume, template, hiddenSections, fitToOnePage, fitScale, visibleSections.length]);

  async function saveResume() {
    if (!getStudentToken()) {
      window.location.href = "/student-login";
      return;
    }
    setSaveMessage("Saving resume...");
    const response = await fetch(`${API_BASE_URL}/api/students/resume`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...studentAuthHeaders(),
      },
      body: JSON.stringify(resume),
    });
    const data = await response.json();
    setSaveMessage(response.ok ? "Resume saved to your account." : data.detail ?? "Could not save resume.");
  }

  function toggleSection(section: ResumeSectionKey) {
    setHiddenSections((current) =>
      current.includes(section) ? current.filter((item) => item !== section) : [...current, section],
    );
  }

  function fitResumeToPage() {
    const paper = resumeRef.current;
    const content = resumeContentRef.current;
    setFitToOnePage(true);
    if (paper && content) {
      const styles = window.getComputedStyle(paper);
      const availableHeight =
        paper.clientHeight - parseFloat(styles.paddingTop) - parseFloat(styles.paddingBottom);
      const nextScale = Math.max(0.92, Math.min(0.99, (availableHeight / content.scrollHeight) * 0.99));
      setFitScale(Number(nextScale.toFixed(2)));
    }
    setSaveMessage("Readable one-page fit applied. If it still feels crowded, hide one optional section before downloading.");
  }

  function chooseTemplate(item: ResumeTemplate) {
    setTemplate(item);
    setFitToOnePage(false);
    setFitScale(1);
  }

  function downloadResume() {
    const paper = resumeRef.current;
    if (!paper) return;

    const printFrame = document.createElement("iframe");
    printFrame.className = "resumePrintFrame";
    document.body.appendChild(printFrame);

    const printDocument = printFrame.contentDocument;
    if (!printDocument) {
      printFrame.remove();
      return;
    }

    printDocument.open();
    printDocument.write(`
      <!doctype html>
      <html>
        <head>
          <title>${resume.name || "Resume"}</title>
          <style>
            @page { size: A4; margin: 0; }
            * { box-sizing: border-box; }
            html, body { margin: 0; background: #ffffff; }
            body { width: 210mm; min-height: 297mm; }
            .resumePaper {
              --resume-fit-scale: ${fitScale};
              background: #f8faf4;
              color: #151515;
              font-family: Georgia, "Times New Roman", serif;
              font-size: 18px;
              height: 297mm;
              margin: 0;
              overflow: hidden;
              padding: 10.5mm 12mm;
              width: 210mm;
            }
            .resumePaper header {
              border-bottom: 2px solid #111827;
              display: grid;
              gap: calc(4px * var(--resume-fit-scale));
              padding-bottom: calc(10px * var(--resume-fit-scale));
              text-align: left;
            }
            .resumePaper h2, .resumePaper h3, .resumePaper p, .resumePaper li, .resumePaper small {
              color: #151515;
            }
            .resumePaper h2 {
              font-size: calc(2.15rem * var(--resume-fit-scale));
              line-height: 1.05;
              margin: 0;
              text-transform: uppercase;
            }
            .resumePaper header p {
              font-weight: 700;
              margin: 0;
              text-transform: uppercase;
            }
            .resumePaper h3 {
              border-bottom: 1px solid #222222;
              font-family: Arial, sans-serif;
              font-size: calc(0.9rem * var(--resume-fit-scale));
              margin: 0 0 calc(4px * var(--resume-fit-scale));
              padding-bottom: calc(3px * var(--resume-fit-scale));
              text-transform: uppercase;
            }
            .resumePaper section { padding: calc(4.5px * var(--resume-fit-scale)) 0; }
            .resumePaper p, .resumePaper li, .resumePaper small {
              font-size: calc(1rem * var(--resume-fit-scale));
              line-height: 1.34;
            }
            .resumePaper p, .resumePaper ul { margin: 0; }
            .resumePaper ul { padding-left: calc(14px * var(--resume-fit-scale)); }
            .educationTable {
              border-collapse: collapse;
              font-family: Arial, sans-serif;
              width: 100%;
            }
            .educationTable th,
            .educationTable td {
              border: 1px solid #c7cbd1;
              color: #151515;
              font-size: calc(0.82rem * var(--resume-fit-scale));
              line-height: 1.25;
              padding: calc(7px * var(--resume-fit-scale));
              text-align: left;
              vertical-align: top;
            }
            .educationTable th {
              background: #eef4ee;
              font-weight: 800;
            }
            .resumeTemplate-accent { border-top: calc(7mm * var(--resume-fit-scale)) solid #45e0a8; padding-top: calc(12mm * var(--resume-fit-scale)); }
            .resumeTemplate-accent h3 { border-bottom-color: #45e0a8; color: #0d5f48; }
            .resumeTemplate-compact {
              padding: 9mm 10mm;
            }
            .resumeTemplate-compact h2 {
              font-size: calc(1.95rem * var(--resume-fit-scale));
            }
            .resumeTemplate-compact h3 {
              font-size: calc(0.86rem * var(--resume-fit-scale));
              margin-bottom: 3px;
            }
            .resumeTemplate-compact section {
              padding: 2.5px 0;
            }
            .resumeTemplate-compact p,
            .resumeTemplate-compact li,
            .resumeTemplate-compact small {
              font-size: calc(0.94rem * var(--resume-fit-scale));
              line-height: 1.26;
            }
          </style>
        </head>
        <body>${paper.outerHTML}</body>
      </html>
    `);
    printDocument.close();

    window.setTimeout(() => {
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();
      window.setTimeout(() => printFrame.remove(), 500);
    }, 100);
  }

  return (
    <section className="resumeBuilderPage">
      <div className="resumeBuilderShell">
        <div className="resumeWorkspace">
        <aside className="resumeStepper" aria-label="Resume sections">
          <div className="resumeScore">
            <div>
              <span>{completion}%</span>
              <strong>Resume ready</strong>
            </div>
            <progress value={filledFields} max={totalFields} />
          </div>
          {sections.map((section, index) => (
            <button
              className={section.id === activeSection ? "activeResumeStep" : ""}
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
            >
              <b>{index + 1}</b>
              <span>{section.title}</span>
              <small>{section.hint}</small>
            </button>
          ))}
        </aside>

        <div className="resumeEditorStack">
          <form className="resumeForm">
            <div className="formIntro">
              <span>One-page fresher format</span>
              <h2>{activeGroup.title}</h2>
              <p>{activeGroup.hint}</p>
            </div>
            {activeGroup.fields.map((field) => (
              <label key={field.key}>
                <span>{field.label}</span>
                {field.multiline ? (
                  <textarea
                    rows={5}
                    value={resume[field.key]}
                    onChange={(event) => setResume({ ...resume, [field.key]: event.target.value })}
                  />
                ) : (
                  <input
                    value={resume[field.key]}
                    onChange={(event) => setResume({ ...resume, [field.key]: event.target.value })}
                  />
                )}
              </label>
            ))}
            <div className="resumeSaveBar">
              <button className="primaryButton" type="button" onClick={saveResume}>
                Save resume
              </button>
              {isOverOnePage && !fitToOnePage ? (
                <button className="secondaryButton" type="button" onClick={fitResumeToPage}>
                  Fit to one page
                </button>
              ) : null}
              <button className="secondaryButton" type="button" onClick={downloadResume}>
                Download PDF
              </button>
              <p>{saveMessage}</p>
            </div>
          </form>

        </div>
      </div>

        <div className="resumePreviewStage">
          <div className="resumePreviewTopbar">
            <span>Live preview</span>
            <strong>{fitToOnePage ? "Fit applied" : isOverOnePage ? "Needs fit" : "A4 one page"}</strong>
          </div>
          <div className="resumeTemplateBar">
            <div className="previewControlGroup">
              <span>Template</span>
              <div className="templatePicker">
                {(["clean", "accent", "compact"] as const).map((item) => (
                  <button
                    className={template === item ? "activeTemplate" : ""}
                    key={item}
                    type="button"
                    onClick={() => chooseTemplate(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div className="previewControlGroup visibleSectionGroup">
              <span>Visible sections</span>
              <div className="sectionToggleScroller">
                {previewSections.map((section) => (
                  <button
                    className={hiddenSections.includes(section.key) ? "" : "activeSectionToggle"}
                    key={section.key}
                    type="button"
                    onClick={() => toggleSection(section.key)}
                  >
                    {section.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {isOverOnePage && !fitToOnePage ? (
            <button className="fitResumeButton" type="button" onClick={fitResumeToPage}>
              Fit this resume into one page
            </button>
          ) : null}
          <article
            className={`resumePreview resumePaper resumeTemplate-${template}${fitToOnePage ? " resumeFitOnePage" : ""}`}
            ref={resumeRef}
            style={{ "--resume-fit-scale": fitScale } as CSSProperties}
          >
            <div className="resumePaperContent" ref={resumeContentRef}>
              <header>
                <h2>{resume.name}</h2>
                <p>{resume.role}</p>
                <small>
                  {resume.email} | {resume.phone} | {resume.links}
                </small>
              </header>
              {visibleSections.map((section) => (
                <section key={section.key}>
                  <h3>{section.title}</h3>
                  {section.key === "summary" ? <p>{resume.summary}</p> : null}
                  {section.key === "skills" ? <p>{skillList.join(" | ")}</p> : null}
                  {section.key === "education" ? (
                    <table className="educationTable">
                      <thead>
                        <tr>
                          <th>Qualification</th>
                          <th>Institute</th>
                          <th>Year</th>
                          <th>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {educationRows(resume.education).map((item) => (
                          <tr key={`${item.qualification}-${item.institute}`}>
                            <td>{item.qualification}</td>
                            <td>{item.institute}</td>
                            <td>{item.year}</td>
                            <td>{item.score}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : null}
                  {!["summary", "skills", "education"].includes(section.key) ? (
                    <ul>
                      {lines(resume[section.key]).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
