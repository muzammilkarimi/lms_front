import Link from "next/link";
import { SiteNavLinks } from "./SiteNavLinks";

export const menuItems = [
  { label: "Home", href: "/" },
  { label: "Jobs", href: "/jobs" },
  { label: "Events", href: "/events" },
  { label: "Resume", href: "/resume-builder" },
  { label: "AI Interview", href: "/mock-ai-interview" },
  { label: "Classes", href: "/classes" },
];

export function SiteHeader() {
  return (
    <header className="siteHeader">
      <nav className="nav" aria-label="Main navigation">
        <Link className="brand logoOnlyBrand" href="/" aria-label="Programming Pathshala Club home">
          <span className="brandMark">PP</span>
        </Link>
        <SiteNavLinks items={menuItems} />
      </nav>
    </header>
  );
}
