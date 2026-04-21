import { JobsBoard, type Job } from "./JobsBoard";
import { fetchFromApi } from "../lib/api";

const fallbackJobs: Job[] = [
  {
    id: 1,
    title: "Frontend Developer Intern",
    company: "CodeCraft Labs",
    location: "Remote",
    job_type: "Internship",
    skills: ["React", "TypeScript", "CSS"],
    description: "Build responsive UI screens, fix accessibility issues, and ship small product improvements.",
    eligibility: "Students with at least two frontend projects or a strong GitHub portfolio.",
    compensation: "Rs. 12,000/month stipend",
    last_date: "2026-05-15",
    apply_link: "https://example.com/apply/frontend-intern",
  },
  {
    id: 2,
    title: "Backend API Trainee",
    company: "StackFoundry",
    location: "Bengaluru",
    job_type: "Trainee",
    skills: ["Python", "FastAPI", "SQL"],
    description: "Support API development, write validation logic, and document endpoints for internal tools.",
    eligibility: "Students comfortable with Python basics, databases, and Git workflow.",
    compensation: "Rs. 18,000/month stipend",
    last_date: "2026-05-22",
    apply_link: "https://example.com/apply/backend-trainee",
  },
  {
    id: 3,
    title: "QA Automation Intern",
    company: "PixelBridge",
    location: "Hybrid",
    job_type: "Internship",
    skills: ["JavaScript", "Testing", "Playwright"],
    description: "Create regression checks, test user flows, and help teams catch UI issues before release.",
    eligibility: "Students who enjoy debugging and can explain bugs clearly with screenshots or logs.",
    compensation: "Rs. 10,000/month stipend",
    last_date: "2026-05-28",
    apply_link: "https://example.com/apply/qa-automation",
  },
];

export default async function JobsPage() {
  const jobs = await fetchFromApi<Job[]>("/api/jobs", fallbackJobs);

  return <JobsBoard jobs={jobs} />;
}
