"use client";

import { useState } from "react";
import { API_BASE_URL } from "../lib/api";

type ClassSchedule = {
  id: number;
  class_date: string;
  title: string;
  mentor: string;
  starts_at: string;
  link: string;
};

export function ClassesCalendar() {
  const [selectedDate, setSelectedDate] = useState("2026-05-06");
  const [classes, setClasses] = useState<ClassSchedule[]>([]);
  const [loaded, setLoaded] = useState(false);

  async function loadClasses(date: string) {
    setSelectedDate(date);
    const response = await fetch(`${API_BASE_URL}/api/classes?class_date=${date}`);
    const data = await response.json();
    setClasses(response.ok ? data : []);
    setLoaded(true);
  }

  return (
    <section className="calendarShell">
      <div>
        <p className="eyebrow">Class calendar</p>
        <h2>Pick a date and check the planned classes.</h2>
        <p>This section is ready as a placeholder now, with full admin scheduling to come later.</p>
        <label>
          <span>Select date</span>
          <input type="date" value={selectedDate} onChange={(event) => loadClasses(event.target.value)} />
        </label>
      </div>
      <div className="classList">
        {!loaded ? (
          <p>Choose a date to load classes.</p>
        ) : classes.length ? (
          classes.map((item) => (
            <article className="classCard" key={item.id}>
              <span>{item.starts_at.slice(0, 5)}</span>
              <h3>{item.title}</h3>
              <p>{item.mentor}</p>
              <small>{item.link}</small>
            </article>
          ))
        ) : (
          <p>No classes scheduled for this date.</p>
        )}
      </div>
    </section>
  );
}
