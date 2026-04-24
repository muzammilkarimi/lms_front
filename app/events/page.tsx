import { EventsBoard, type EventItem } from "./EventsBoard";
import { fetchFromApi } from "../lib/api";

const fallbackEvents: EventItem[] = [
  {
    id: 1,
    title: "Resume Review Sprint",
    event_date: "2026-05-04",
    event_time: "17:30:00",
    mode: "Online",
    description: "Bring one resume draft and leave with sharper bullets and cleaner structure.",
    speaker: "Placement Cell Mentors",
    registration_link: "https://example.com/events/resume-review",
  },
  {
    id: 2,
    title: "DSA Interview Jam",
    event_date: "2026-05-09",
    event_time: "10:00:00",
    mode: "Lab 2",
    description: "Practice arrays, hashing, and two-pointer patterns with peer review after every round.",
    speaker: "Programming Pathshala Club",
    registration_link: "https://example.com/events/dsa-jam",
  },
  {
    id: 3,
    title: "Coding Evaluation Arena",
    event_date: "2026-05-18",
    event_time: "14:00:00",
    mode: "Assessment room",
    description: "Take a timed coding evaluation with three random Python questions and save your score to the dashboard.",
    speaker: "Placement Tech Panel",
    registration_link: "https://example.com/events/coding-evaluation-arena",
    event_kind: "coding_assessment",
    coding_assessment_id: 1,
  },
];

export default async function EventsPage() {
  const events = await fetchFromApi<EventItem[]>("/api/events", fallbackEvents);

  return <EventsBoard events={events} />;
}
