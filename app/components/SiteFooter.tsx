"use client";

import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="siteFooter">
      <div className="footerGrid">
        <div>
          <h2>Programming Pathshala Club</h2>
          <p>Code together, learn in public, and keep shipping useful things.</p>
        </div>
        <div>
          <h3>Quick Links</h3>
          <Link href="/">Home</Link>
          <Link href="/jobs">Jobs</Link>
          <Link href="/events">Events</Link>
          <Link href="/resume-builder">Resume Builder</Link>
          <Link href="/mock-ai-interview">Mock AI Interview</Link>
          <Link href="/classes">Classes</Link>
        </div>
        <div>
          <h3>Social Links</h3>
          <a href="https://www.linkedin.com" target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a href="https://github.com" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href="https://www.instagram.com" target="_blank" rel="noreferrer">
            Instagram
          </a>
          <a href="https://discord.com" target="_blank" rel="noreferrer">
            Discord
          </a>
        </div>
        <div>
          <h3>Contact</h3>
          <a href="mailto:club@example.com">club@example.com</a>
          <p>Saturday code jam starts at 10:00 AM.</p>
        </div>
      </div>
      <p className="footerBottom">&copy; 2026 Programming Pathshala Club. Keep building.</p>
    </footer>
  );
}
