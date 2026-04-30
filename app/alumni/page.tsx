"use client";

import { useMemo, useState } from "react";

type Alumnus = {
  id: number;
  name: string;
  role: string;
  company: string;
  year: string;
  expertise: string[];
  avatar: string;
  linkedin: string;
};

const alumniData: Alumnus[] = [
  {
    id: 1,
    name: "Arjun Sharma",
    role: "Software Engineer",
    company: "Google",
    year: "Batch of 2022",
    expertise: ["DSA", "Distributed Systems"],
    avatar: "https://i.pravatar.cc/150?u=arjun",
    linkedin: "#"
  },
  {
    id: 2,
    name: "Priya Patel",
    role: "Product Designer",
    company: "Meta",
    year: "Batch of 2021",
    expertise: ["UI/UX", "Product Strategy"],
    avatar: "https://i.pravatar.cc/150?u=priya",
    linkedin: "#"
  },
  {
    id: 3,
    name: "Rohan Gupta",
    role: "Data Scientist",
    company: "Amazon",
    year: "Batch of 2023",
    expertise: ["Machine Learning", "Python"],
    avatar: "https://i.pravatar.cc/150?u=rohan",
    linkedin: "#"
  },
  {
    id: 4,
    name: "Sneha Reddy",
    role: "Backend Lead",
    company: "Microsoft",
    year: "Batch of 2020",
    expertise: ["Java", "System Design"],
    avatar: "https://i.pravatar.cc/150?u=sneha",
    linkedin: "#"
  },
  {
    id: 5,
    name: "Vikram Singh",
    role: "Frontend Engineer",
    company: "Netflix",
    year: "Batch of 2022",
    expertise: ["React", "Performance"],
    avatar: "https://i.pravatar.cc/150?u=vikram",
    linkedin: "#"
  }
];

export default function AlumniPage() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"directory" | "mentorship">("directory");

  const filteredAlumni = useMemo(() => {
    const s = query.toLowerCase();
    return alumniData.filter(a => 
      a.name.toLowerCase().includes(s) || 
      a.company.toLowerCase().includes(s) || 
      a.role.toLowerCase().includes(s) ||
      a.year.toLowerCase().includes(s) ||
      a.expertise.some(e => e.toLowerCase().includes(s))
    );
  }, [query]);

  return (
    <main className="alumniPage">
      <section className="alumniMiniHero">
        <div className="alumniIntroContent">
          <div>
            <p className="eyebrow">Alumni Network</p>
            <h1>Connect with the global Gyansutra community.</h1>
            <p>Access 1:1 mentorship and career advice from alumni working at world-class technology companies.</p>
          </div>
          <img
            src="https://img.icons8.com/ios-filled/188/ffffff/conference-call.png"
            alt="Alumni icon"
            className="alumniMascot"
          />
        </div>
      </section>

      <section className="alumniContent">
        <div className="alumniToolbar">
          <label className="alumniSearchField">
            <span>Search alumni directory</span>
            <input 
              placeholder="Search by name, company, or skill..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>

        <div className="alumniGrid">
          {filteredAlumni.map(alumnus => (
            <article key={alumnus.id} className="alumniCard">
              <div className="alumniCardHead">
                <img src={alumnus.avatar} alt={alumnus.name} className="alumniAvatar" />
                <div>
                  <h3>{alumnus.name}</h3>
                  <p className="alumniBatch">{alumnus.year}</p>
                </div>
              </div>
              <div className="alumniCardBody">
                <div className="alumniWork">
                  <strong>{alumnus.role}</strong>
                  <span>at {alumnus.company}</span>
                </div>
                <div className="alumniExpertise">
                  {alumnus.expertise.map(exp => (
                    <span key={exp}>{exp}</span>
                  ))}
                </div>
              </div>
              <div className="alumniCardFoot">
                <a href={alumnus.linkedin} className="primaryButton" target="_blank" rel="noopener noreferrer">Connect on LinkedIn</a>
              </div>
            </article>
          ))}
        </div>

        <div className="mentorshipSection">
          <div className="mentorshipInfo">
            <span className="dashboardBadge">Mentorship</span>
            <h2>Book a 1:1 Session</h2>
            <p>Get personalized guidance from alumni who have already succeeded in the industry.</p>
          </div>
          <div className="mentorshipGrid">
            <article className="mentorshipCard">
              <div className="mentorshipIcon">🎯</div>
              <h3>Resume Review</h3>
              <p>Get actionable feedback on your resume bullets and structure.</p>
              <button className="secondaryButton">View Mentors</button>
            </article>
            <article className="mentorshipCard">
              <div className="mentorshipIcon">💻</div>
              <h3>Mock Interview</h3>
              <p>Practice technical or behavioral rounds with industry experts.</p>
              <button className="secondaryButton">View Mentors</button>
            </article>
            <article className="mentorshipCard">
              <div className="mentorshipIcon">🚀</div>
              <h3>Career Roadmap</h3>
              <p>Discuss your long-term goals and how to achieve them.</p>
              <button className="secondaryButton">View Mentors</button>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
