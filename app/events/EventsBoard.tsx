"use client";

import { useMemo, useState } from "react";

export type EventItem = {
  id: number;
  title: string;
  event_date: string;
  event_time: string;
  mode: string;
  description: string;
  speaker: string;
  registration_link: string;
};

type EventsBoardProps = {
  events: EventItem[];
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function unique(values: string[]) {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

export function EventsBoard({ events }: EventsBoardProps) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("all");
  const [activeEventId, setActiveEventId] = useState(events[0]?.id ?? 0);

  const modes = useMemo(() => unique(events.map((event) => event.mode)), [events]);
  const filteredEvents = useMemo(() => {
    const search = query.trim().toLowerCase();

    return events.filter((event) => {
      const searchable = [
        event.title,
        event.mode,
        event.description,
        event.speaker,
        event.event_date,
        event.event_time,
      ]
        .join(" ")
        .toLowerCase();

      return (!search || searchable.includes(search)) && (mode === "all" || event.mode === mode);
    });
  }, [events, mode, query]);
  const activeEvent = filteredEvents.find((event) => event.id === activeEventId) ?? filteredEvents[0];

  function clearFilters() {
    setQuery("");
    setMode("all");
    setActiveEventId(events[0]?.id ?? 0);
  }

  return (
    <main className="eventsCompactPage">
      <section className="eventsMiniIntro">
        <div className="eventsIntroContent">
          <div>
            <p className="eyebrow">Events</p>
            <h1>Upcoming sessions and practice rooms.</h1>
            <p>Register early, show up prepared, and turn each event into one more proof of skill.</p>
          </div>
          <img
            className="eventsMascot"
            src="https://img.icons8.com/ios-filled/188/1f2937/calendar--v1.png"
            alt="Dark calendar illustration"
          />
        </div>
      </section>

      <section className="eventsBoard">
        <div className="eventsToolbar">
          <label className="eventSearchField">
            <span>Search events</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title, speaker, topic..."
            />
          </label>
          <label className="eventFilterField">
            <span>Mode</span>
            <select value={mode} onChange={(event) => setMode(event.target.value)}>
              <option value="all">All modes</option>
              {modes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="eventsResultBar">
          <p>
            Showing <strong>{filteredEvents.length}</strong> of <strong>{events.length}</strong> events
          </p>
          <button className="secondaryButton" type="button" onClick={clearFilters}>
            Clear filters
          </button>
        </div>

        {filteredEvents.length && activeEvent ? (
          <div className="eventsInteractiveShell">
            <aside className="eventsRailPanel">
              <div className="eventsRailHeader">
                <span>{filteredEvents.length}</span>
                <div>
                  <strong>Event queue</strong>
                  <small>Select one to preview details</small>
                </div>
              </div>
              <div className="eventsRail" aria-label="Event list">
                {filteredEvents.map((event) => (
                  <button
                    className={event.id === activeEvent.id ? "eventRailItem activeEvent" : "eventRailItem"}
                    key={event.id}
                    type="button"
                    onClick={() => setActiveEventId(event.id)}
                  >
                    <span>{formatDate(event.event_date)}</span>
                    <strong>{event.title}</strong>
                    <small>
                      {event.event_time.slice(0, 5)} - {event.mode}
                    </small>
                  </button>
                ))}
              </div>
            </aside>

            <article className="eventSpotlight">
              <div className="eventSpotlightDate">
                <strong>{formatDate(activeEvent.event_date)}</strong>
                <span>{activeEvent.event_time.slice(0, 5)}</span>
              </div>
              <div className="eventSpotlightBody">
                <div className="eventTileTop">
                  <span>{activeEvent.mode}</span>
                  <small>{activeEvent.speaker}</small>
                </div>
                <h2>{activeEvent.title}</h2>
                <p>{activeEvent.description}</p>
                <div className="eventActionStrip">
                  <a className="primaryButton" href={activeEvent.registration_link} target="_blank" rel="noreferrer">
                    Register
                  </a>
                  <button
                    className="secondaryButton"
                    type="button"
                    onClick={() => navigator.clipboard?.writeText(activeEvent.registration_link)}
                  >
                    Copy link
                  </button>
                </div>
              </div>
            </article>
          </div>
        ) : (
          <div className="emptyEvents">
            <h2>No matching events found</h2>
            <p>Try a different keyword or mode.</p>
            <button className="primaryButton" type="button" onClick={clearFilters}>
              Reset search
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
