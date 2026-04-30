import { HomeLanding } from "./HomeLanding";

type Track = {
  title: string;
  level: string;
  duration: string;
  description: string;
};

type PortalData = {
  club_name: string;
  tagline: string;
  tracks: Track[];
  events: string[];
};

const fallbackData: PortalData = {
  club_name: "Gyansutra AI",
  tagline: "Jobs, resumes, interviews, events, and classes in one student workspace.",
  tracks: [
    {
      title: "Python Foundations",
      level: "Beginner",
      duration: "4 weeks",
      description: "Write clean Python, solve problems, and build command-line mini projects.",
    },
    {
      title: "Web Dev Sprint",
      level: "Intermediate",
      duration: "6 weeks",
      description: "Create responsive apps with Next.js, APIs, auth basics, and deployment habits.",
    },
    {
      title: "DSA Practice Lab",
      level: "All levels",
      duration: "Ongoing",
      description: "Practice patterns, discuss approaches, and prepare for coding interviews together.",
    },
  ],
  events: ["Saturday code jam", "Peer review circle", "Project demo night"],
};

async function getPortalData(): Promise<PortalData> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000"}/api/portal`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return fallbackData;
    }

    return response.json();
  } catch {
    return fallbackData;
  }
}

export default async function Home() {
  const portal = await getPortalData();

  const actions = [
    {
      label: "Jobs",
      title: "Find openings",
      detail: "Filter openings, compare fit, and decide whether to apply now or tune first.",
      href: "/jobs",
    },
    {
      label: "Resume",
      title: "Shape the resume",
      detail: "Edit sections, fit to one page, score it, and keep better versions ready.",
      href: "/resume-builder",
    },
    {
      label: "AI Interview",
      title: "Practice answers",
      detail: "Run live mock rounds with voice, feedback, and a final review that feels useful.",
      href: "/mock-ai-interview",
    },
    {
      label: "Events",
      title: "Join rooms",
      detail: "Move through coding events, workshops, and drive prep without losing context.",
      href: "/events",
    },
  ];

  const workflow = [
    {
      step: "01",
      title: "Build your resume",
      detail: "Keep it one page, improve ATS fit, and save versions in one place.",
    },
    {
      step: "02",
      title: "Match before you apply",
      detail: "Compare your resume with the role and decide whether to fix first or apply now.",
    },
    {
      step: "03",
      title: "Practice the interview",
      detail: "Use AI mock rounds, voice answers, and final score reviews before the real call.",
    },
    {
      step: "04",
      title: "Track everything",
      detail: "See applied jobs, status changes, resume progress, and mock scores from one dashboard.",
    },
  ];

  const heroMetrics = [
    { value: "1", label: "student workspace" },
    { value: `${portal.tracks.length}+`, label: "prep tracks" },
    { value: `${portal.events.length}+`, label: "live rooms" },
    { value: "AI", label: "resume and interview help" },
  ];

  return <HomeLanding actions={actions} heroMetrics={heroMetrics} portal={portal} workflow={workflow} />;
}
