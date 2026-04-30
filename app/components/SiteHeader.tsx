"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { SiteNavLinks } from "./SiteNavLinks";

export const menuItems = [
  { label: "Home", href: "/" },
  { label: "Jobs", href: "/jobs" },
  { label: "Events", href: "/events" },
  { label: "Resources", href: "/resources" },
  { label: "Alumni", href: "/alumni" },
  { label: "Resume", href: "/resume-builder" },
  { label: "AI Interview", href: "/mock-ai-interview" },
];

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  // Handle scroll for navbar background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className={`siteHeader ${isScrolled ? "scrolled" : ""} ${isHome ? "onHome" : ""}`}>
        <Link href="/" className="mobileBrand">
          Gyansutra <span className="brandAI">AI</span>
        </Link>

        <nav className="nav" aria-label="Main navigation">
          <Link href="/" className="desktopBrand">
            Gyansutra <span className="brandAI">AI</span>
          </Link>
          <div className="navSeparator" />
          <SiteNavLinks items={menuItems} />
        </nav>

        <button 
          className="menuToggle" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <AnimatePresence mode="wait">
              {isMenuOpen ? (
                <motion.path 
                  key="close"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  exit={{ pathLength: 0 }}
                  d="M18 6L6 18M6 6l12 12" 
                />
              ) : (
                <motion.path 
                  key="menu"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  exit={{ pathLength: 0 }}
                  d="M4 6h16M4 12h16M4 18h16" 
                />
              )}
            </AnimatePresence>
          </svg>
        </button>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="mobileMenuOverlay"
          >
            <SiteNavLinks 
              items={menuItems} 
              mode="mobile" 
              onItemClick={() => setIsMenuOpen(false)} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
