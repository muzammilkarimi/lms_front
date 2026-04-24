"use client";

import { useCallback } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

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

type Action = {
  label: string;
  title: string;
  detail: string;
  href: string;
};

type WorkflowItem = {
  step: string;
  title: string;
  detail: string;
};

type HeroMetric = {
  value: string;
  label: string;
};

type HeroNetworkNode = {
  delay: string;
  depth: number;
  left: string;
  size: number;
  top: string;
};

type HeroNetworkLink = {
  angle: number;
  delay: string;
  depth: number;
  left: string;
  top: string;
  width: string;
};

type HomeLandingProps = {
  portal: PortalData;
  actions: Action[];
  workflow: WorkflowItem[];
  heroMetrics: HeroMetric[];
};

const easing = [0.22, 1, 0.36, 1] as const;

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, ease: easing },
  },
};

const staggerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.08,
      staggerChildren: 0.12,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.62, ease: easing },
  },
};

const heroNetworkNodes: HeroNetworkNode[] = [
  { left: "12%", top: "24%", size: 12, depth: 0.65, delay: "0s" },
  { left: "28%", top: "14%", size: 10, depth: 0.5, delay: "1.1s" },
  { left: "48%", top: "20%", size: 11, depth: 0.85, delay: "2.1s" },
  { left: "71%", top: "13%", size: 10, depth: 0.45, delay: "2.8s" },
  { left: "87%", top: "24%", size: 12, depth: 0.72, delay: "3.6s" },
  { left: "18%", top: "46%", size: 11, depth: 0.8, delay: "1.8s" },
  { left: "40%", top: "38%", size: 9, depth: 0.6, delay: "0.7s" },
  { left: "66%", top: "42%", size: 10, depth: 0.75, delay: "2.4s" },
  { left: "86%", top: "50%", size: 9, depth: 0.55, delay: "1.5s" },
  { left: "26%", top: "72%", size: 11, depth: 0.7, delay: "3.1s" },
  { left: "52%", top: "64%", size: 10, depth: 0.9, delay: "2.9s" },
  { left: "76%", top: "78%", size: 12, depth: 0.68, delay: "1.9s" },
];

const heroNetworkLinks: HeroNetworkLink[] = [
  { left: "12%", top: "24%", width: "18%", angle: -28, depth: 0.55, delay: "0s" },
  { left: "28%", top: "14%", width: "22%", angle: 18, depth: 0.45, delay: "0.9s" },
  { left: "48%", top: "20%", width: "24%", angle: -18, depth: 0.75, delay: "1.8s" },
  { left: "71%", top: "13%", width: "18%", angle: 34, depth: 0.42, delay: "2.8s" },
  { left: "12%", top: "24%", width: "26%", angle: 58, depth: 0.7, delay: "1.2s" },
  { left: "18%", top: "46%", width: "23%", angle: -18, depth: 0.58, delay: "2.1s" },
  { left: "40%", top: "38%", width: "27%", angle: 10, depth: 0.68, delay: "0.5s" },
  { left: "66%", top: "42%", width: "22%", angle: 24, depth: 0.5, delay: "3s" },
  { left: "18%", top: "46%", width: "30%", angle: 69, depth: 0.8, delay: "1.6s" },
  { left: "40%", top: "38%", width: "29%", angle: 52, depth: 0.72, delay: "2.6s" },
  { left: "52%", top: "64%", width: "28%", angle: 26, depth: 0.74, delay: "3.4s" },
];

function createLinkStyle(link: HeroNetworkLink): CSSProperties {
  return {
    "--link-angle": `${link.angle}deg`,
    "--link-depth": link.depth,
    left: link.left,
    top: link.top,
    width: link.width,
  } as CSSProperties;
}

function createNodeStyle(node: HeroNetworkNode): CSSProperties {
  return {
    animationDelay: node.delay,
    "--node-depth": node.depth,
    height: `${node.size}px`,
    left: node.left,
    top: node.top,
    width: `${node.size}px`,
  } as CSSProperties;
}

export function HomeLanding({ portal, actions, workflow, heroMetrics }: HomeLandingProps) {
  const reduceMotion = useReducedMotion();

  const sectionInitial = reduceMotion ? false : "hidden";
  const sectionWhileInView = reduceMotion ? undefined : "visible";

  const handleHeroPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (reduceMotion) {
        return;
      }

      const rect = event.currentTarget.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const shiftX = (x - 0.5) * 24;
      const shiftY = (y - 0.5) * 20;
      const tiltX = (0.5 - y) * 6;
      const tiltY = (x - 0.5) * 8;

      event.currentTarget.style.setProperty("--network-cursor-x", `${(x * 100).toFixed(2)}%`);
      event.currentTarget.style.setProperty("--network-cursor-y", `${(y * 100).toFixed(2)}%`);
      event.currentTarget.style.setProperty("--network-shift-x", `${shiftX.toFixed(2)}px`);
      event.currentTarget.style.setProperty("--network-shift-y", `${shiftY.toFixed(2)}px`);
      event.currentTarget.style.setProperty("--network-tilt-x", `${tiltX.toFixed(2)}deg`);
      event.currentTarget.style.setProperty("--network-tilt-y", `${tiltY.toFixed(2)}deg`);
    },
    [reduceMotion],
  );

  const handleHeroPointerLeave = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      event.currentTarget.style.setProperty("--network-cursor-x", "50%");
      event.currentTarget.style.setProperty("--network-cursor-y", "38%");
      event.currentTarget.style.setProperty("--network-shift-x", "0px");
      event.currentTarget.style.setProperty("--network-shift-y", "0px");
      event.currentTarget.style.setProperty("--network-tilt-x", "0deg");
      event.currentTarget.style.setProperty("--network-tilt-y", "0deg");
    },
    [],
  );

  const heroInteractiveStyle = {
    "--network-cursor-x": "50%",
    "--network-cursor-y": "38%",
    "--network-shift-x": "0px",
    "--network-shift-y": "0px",
    "--network-tilt-x": "0deg",
    "--network-tilt-y": "0deg",
  } as CSSProperties;

  return (
    <main className="homePage">
      <motion.section
        className="homeHero"
        onPointerLeave={reduceMotion ? undefined : handleHeroPointerLeave}
        onPointerMove={reduceMotion ? undefined : handleHeroPointerMove}
        style={heroInteractiveStyle}
      >
        <div aria-hidden="true" className="homeHeroBackdrop" />
        <div className="homeHeroShade" aria-hidden="true" />
        <div className="homeHeroNetwork" aria-hidden="true">
          {heroNetworkLinks.map((link, index) => (
            <span className="homeNetworkLink" key={`link-${index}`} style={createLinkStyle(link)}>
              <span className="homeNetworkLinkBeam" style={{ animationDelay: link.delay }} />
            </span>
          ))}
          {heroNetworkNodes.map((node, index) => (
            <span className="homeNetworkNode" key={`node-${index}`} style={createNodeStyle(node)} />
          ))}
        </div>

        <motion.div
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          className="homeHeroGrid"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          transition={{ duration: 0.78, ease: easing }}
        >
          <div className="homeHeroCopy">
            <motion.p
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              className="eyebrow"
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              transition={{ delay: 0.08, duration: 0.46, ease: easing }}
            >
              Placement workspace
            </motion.p>
            <motion.h1
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              transition={{ delay: 0.12, duration: 0.72, ease: easing }}
            >
              Prep, practice, and placement in one workspace.
            </motion.h1>
            <motion.p
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              transition={{ delay: 0.18, duration: 0.68, ease: easing }}
            >
              {portal.tagline}
            </motion.p>
            <motion.div
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              className="homeActions"
              initial={reduceMotion ? false : { opacity: 0, y: 22 }}
              transition={{ delay: 0.24, duration: 0.64, ease: easing }}
            >
              <motion.a href="/student-dashboard" className="primaryButton" whileHover={reduceMotion ? undefined : { y: -3 }}>
                Open dashboard
              </motion.a>
              <motion.a href="/jobs" className="secondaryButton" whileHover={reduceMotion ? undefined : { y: -3 }}>
                Explore jobs
              </motion.a>
            </motion.div>
          </div>

          <motion.div
            aria-label="Portal highlights"
            className="homeHeroMetrics"
            initial={sectionInitial}
            variants={staggerVariants}
            whileInView={sectionWhileInView}
            viewport={{ once: true, amount: 0.35 }}
          >
            {heroMetrics.map((item) => (
              <motion.article className="homeHeroMetric" key={item.label} variants={itemVariants}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </motion.article>
            ))}
          </motion.div>
        </motion.div>

        <motion.div aria-hidden="true" className="homeScrollCue">
          <span />
          <small>Scroll</small>
        </motion.div>
      </motion.section>

      <motion.section
        className="homeLaunchpad"
        initial={sectionInitial}
        variants={sectionVariants}
        viewport={{ once: true, amount: 0.22 }}
        whileInView={sectionWhileInView}
      >
        <div className="homeSectionHeader">
          <p className="eyebrow">Launch faster</p>
          <h2>Move through the whole placement loop without leaving context behind.</h2>
          <p>
            Jobs, resume edits, mock rounds, coding events, and dashboard history stay connected so the
            student always knows the next move.
          </p>
        </div>

        <motion.div
          aria-label="Placement actions"
          className="homeLaunchGrid"
          initial={sectionInitial}
          variants={staggerVariants}
          viewport={{ once: true, amount: 0.22 }}
          whileInView={sectionWhileInView}
        >
          {actions.map((action) => (
            <motion.a
              className="homeLaunchCard"
              href={action.href}
              key={action.title}
              variants={itemVariants}
              whileHover={reduceMotion ? undefined : { y: -6 }}
            >
              <span>{action.label}</span>
              <strong>{action.title}</strong>
              <p>{action.detail}</p>
            </motion.a>
          ))}
        </motion.div>
      </motion.section>

      <motion.section
        className="homeJourney"
        initial={sectionInitial}
        variants={sectionVariants}
        viewport={{ once: true, amount: 0.22 }}
        whileInView={sectionWhileInView}
      >
        <div className="homeSectionHeader">
          <p className="eyebrow">Journey</p>
          <h2>One path from first draft to final offer.</h2>
          <p>
            Each step stays small and clear for the student, while the backend keeps progress, scores,
            and applications easy to follow.
          </p>
        </div>

        <motion.div
          className="homeJourneyRail"
          initial={sectionInitial}
          variants={staggerVariants}
          viewport={{ once: true, amount: 0.22 }}
          whileInView={sectionWhileInView}
        >
          {workflow.map((item) => (
            <motion.article key={item.step} variants={itemVariants}>
              <b>{item.step}</b>
              <div>
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </motion.section>

      <motion.section
        className="homeShowcase"
        initial={sectionInitial}
        variants={sectionVariants}
        viewport={{ once: true, amount: 0.18 }}
        whileInView={sectionWhileInView}
      >
        <motion.div
          className="homeShowcaseMedia"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.98, y: 24 }}
          transition={{ duration: 0.74, ease: easing }}
          viewport={{ once: true, amount: 0.3 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
        >
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80"
            alt="Students discussing projects together"
          />
        </motion.div>

        <motion.div
          className="homeShowcasePanels"
          initial={sectionInitial}
          variants={staggerVariants}
          viewport={{ once: true, amount: 0.18 }}
          whileInView={sectionWhileInView}
        >
          <motion.section className="homePanel" variants={itemVariants}>
            <p className="eyebrow">Learning tracks</p>
            <h2>Class prep that still points toward placement.</h2>
            <div className="homeTrackList">
              {portal.tracks.slice(0, 3).map((track) => (
                <motion.article key={track.title} variants={itemVariants}>
                  <span>
                    {track.level} - {track.duration}
                  </span>
                  <strong>{track.title}</strong>
                  <p>{track.description}</p>
                </motion.article>
              ))}
            </div>
          </motion.section>

          <motion.section className="homePanel" variants={itemVariants}>
            <p className="eyebrow">Live rooms</p>
            <h2>Stay close to the club while the work gets real.</h2>
            <div className="homeEventList">
              {portal.events.slice(0, 3).map((event) => (
                <motion.article key={event} variants={itemVariants}>
                  <strong>{event}</strong>
                  <p>Open the room, keep the discussion moving, and leave with something concrete.</p>
                </motion.article>
              ))}
            </div>
          </motion.section>
        </motion.div>
      </motion.section>

      <motion.section
        className="homeClosing"
        initial={sectionInitial}
        variants={sectionVariants}
        viewport={{ once: true, amount: 0.3 }}
        whileInView={sectionWhileInView}
      >
        <div>
          <p className="eyebrow">Ready when they are</p>
          <h2>Give every student one place to prepare, apply, and keep moving.</h2>
          <p>{portal.club_name} already has the loop. Now the home page feels like it.</p>
        </div>
        <motion.div
          className="homeClosingActions"
          initial={sectionInitial}
          variants={staggerVariants}
          viewport={{ once: true, amount: 0.3 }}
          whileInView={sectionWhileInView}
        >
          <motion.a className="primaryButton" href="/resume-builder" variants={itemVariants} whileHover={reduceMotion ? undefined : { y: -3 }}>
            Build resume
          </motion.a>
          <motion.a className="secondaryButton" href="/events" variants={itemVariants} whileHover={reduceMotion ? undefined : { y: -3 }}>
            Open events
          </motion.a>
        </motion.div>
      </motion.section>
    </main>
  );
}
