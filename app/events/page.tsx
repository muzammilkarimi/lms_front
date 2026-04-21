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
    title: "GitHub Portfolio Night",
    event_date: "2026-05-16",
    event_time: "18:00:00",
    mode: "Online",
    description: "Clean up pinned repositories, write better READMEs, and prepare a project walkthrough.",
    speaker: "Alumni Mentors",
    registration_link: "https://example.com/events/github-portfolio",
  },
];

export default async function EventsPage() {
  const events = await fetchFromApi<EventItem[]>("/api/events", fallbackEvents);

  return <EventsBoard events={events} />;
}
