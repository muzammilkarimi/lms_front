"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../lib/api";
import { clearStudentToken, getStudentToken, STUDENT_AUTH_EVENT } from "../lib/studentAuth";

type MenuItem = {
  label: string;
  href: string;
};

type SiteNavLinksProps = {
  items: MenuItem[];
};

export function SiteNavLinks({ items }: SiteNavLinksProps) {
  const pathname = usePathname();
  const [hasStudentSession, setHasStudentSession] = useState(false);
  const isAccountRoute = pathname.startsWith("/student-dashboard") || pathname.startsWith("/student-login");

  useEffect(() => {
    let isMounted = true;

    async function syncStudentSession() {
      const token = getStudentToken();
      if (!token) {
        if (isMounted) {
          setHasStudentSession(false);
        }
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/students/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          clearStudentToken();
          if (isMounted) {
            setHasStudentSession(false);
          }
          return;
        }

        if (isMounted) {
          setHasStudentSession(true);
        }
      } catch {
        if (isMounted) {
          setHasStudentSession(Boolean(token));
        }
      }
    }

    syncStudentSession();

    function handleStorage() {
      syncStudentSession();
    }

    window.addEventListener("storage", handleStorage);
    window.addEventListener(STUDENT_AUTH_EVENT, handleStorage);
    return () => {
      isMounted = false;
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(STUDENT_AUTH_EVENT, handleStorage);
    };
  }, []);

  return (
    <>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="menuLinks"
        initial={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        {items.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: -6 }}
              key={item.href}
              transition={{ duration: 0.25, ease: "easeOut" }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link className={isActive ? "activeNavLink" : ""} href={item.href}>
                {isActive ? (
                  <motion.span
                    className="activeNavGlow"
                    layoutId="activeNavGlow"
                    transition={{ duration: 0.28, ease: "easeOut" }}
                  />
                ) : null}
                {item.label}
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
      <motion.div whileHover={{ y: -2, scale: 1.04 }} whileTap={{ scale: 0.96 }}>
        <Link
          className={[
            "profileNavButton",
            hasStudentSession ? "profileNavButtonAvatar" : "profileNavButtonLogin",
            isAccountRoute ? "activeProfileNav" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          href={hasStudentSession ? "/student-dashboard" : "/student-login"}
          aria-label={hasStudentSession ? "Open student dashboard" : "Login to student account"}
          title={hasStudentSession ? "Dashboard" : "Login"}
        >
          {hasStudentSession ? (
            <span className="profileNavInitial">D</span>
          ) : (
            <>
              <svg aria-hidden="true" className="profileNavIcon" viewBox="0 0 24 24">
                <path
                  d="M12 12a3.75 3.75 0 1 0-3.75-3.75A3.75 3.75 0 0 0 12 12Zm0 2.25c-3.45 0-6.25 1.96-6.25 4.38 0 .23.19.42.42.42h11.66c.23 0 .42-.19.42-.42 0-2.42-2.8-4.38-6.25-4.38Z"
                  fill="currentColor"
                />
              </svg>
              <span className="profileNavLabel">Login</span>
            </>
          )}
        </Link>
      </motion.div>
    </>
  );
}
