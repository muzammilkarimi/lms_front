import { ClassesCalendar } from "./ClassesCalendar";

export default function ClassesPage() {
  return (
    <main>
      <section className="pageHero">
        <div>
          <p className="eyebrow">Classes</p>
          <h1>Calendar-wise classes will live here.</h1>
          <p>For now, pick a date and see the sample schedule section working end to end.</p>
        </div>
        <img
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80"
          alt="Students studying together in a classroom"
        />
      </section>
      <ClassesCalendar />
    </main>
  );
}
