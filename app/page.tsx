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
  club_name: "Programming Pathshala Club",
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
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8001"}/api/portal`, {
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
      detail: "Filter by skills, location, and type.",
      href: "/jobs",
    },
    {
      label: "Resume",
      title: "Fix the page",
      detail: "Build, fit, score, and download.",
      href: "/resume-builder",
    },
    {
      label: "AI Interview",
      title: "Practice answers",
      detail: "Speak, review, and improve.",
      href: "/mock-ai-interview",
    },
    {
      label: "Events",
      title: "Join sessions",
      detail: "Workshops, drives, and prep rooms.",
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

  const statusCards = [
    {
      id: "01",
      title: "Resume fit check",
      detail: "Compare the current resume against role needs before the student applies.",
    },
    {
      id: "02",
      title: "Application tracking",
      detail: "Keep jobs, status updates, and admin handoff in one shared workflow.",
    },
    {
      id: "03",
      title: "Interview practice",
      detail: "Run mock rounds with voice, feedback, and end-of-session scoring.",
    },
  ];

  return (
    <main className="homePage">
      <section className="homeHero">
        <div className="homeHeroCopy">
          <p className="eyebrow">Placement workspace</p>
          <h1>Build a darker, sharper workspace from prep to placement.</h1>
          <p>{portal.tagline}</p>
          <div className="homeActions">
            <a className="primaryButton" href="/jobs">
              Explore jobs
            </a>
            <a className="secondaryButton" href="/student-dashboard">
              Open dashboard
            </a>
          </div>
        </div>

        <div className="homeCommand" aria-label="Placement workspace preview">
          <div className="homeCommandTop" aria-hidden="true">
            <span />
            <span />
            <span />
            <strong>{portal.club_name}</strong>
          </div>

          <div className="homePulseGrid" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>

          <div className="homeStatusStack">
            {statusCards.map((card) => (
              <article key={card.id}>
                <b>{card.id}</b>
                <div>
                  <strong>{card.title}</strong>
                  <p>{card.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="homeQuickRail" aria-label="Portal actions">
        {actions.map((action) => (
          <a href={action.href} key={action.title}>
            <span>{action.label}</span>
            <strong>{action.title}</strong>
            <p>{action.detail}</p>
          </a>
        ))}
      </section>

      <section className="homeFlow">
        <div>
          <p className="eyebrow">Workflow</p>
          <h2>One loop from readiness to application.</h2>
          <p>
            Keep resume changes, job decisions, mock rounds, and student progress inside one connected
            placement flow.
          </p>
        </div>
        <div className="homeFlowSteps">
          {workflow.map((item) => (
            <article key={item.step}>
              <span>{item.step}</span>
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="homeSplit">
        <div className="homeImagePanel">
          <img
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80"
            alt="Students working together in a computer lab"
          />
        </div>

        <div className="homeTracks">
          <p className="eyebrow">Learning tracks</p>
          <h2>Class prep that connects to placements.</h2>
          {portal.tracks.slice(0, 3).map((track) => (
            <article key={track.title}>
              <span>{track.level}</span>
              <strong>{track.title}</strong>
              <p>
                {track.duration} - {track.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="homeFinal">
        <div>
          <p className="eyebrow">Live rooms</p>
          <h2>Stay close to the community while you prepare.</h2>
          <p>{portal.events.slice(0, 3).join(" | ")}</p>
        </div>
        <a className="primaryButton" href="/resume-builder">
          Build resume
        </a>
      </section>
    </main>
  );
}
