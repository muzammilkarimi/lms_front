export default function WorkshopsPage() {
  return (
    <main>
      <section className="pageHero">
        <div>
          <p className="eyebrow">Workshops</p>
          <h1>Short, practical sessions for tools you will use this month.</h1>
          <p>
            Learn in focused rooms where every session ends with a working repo, a cleaner
            workflow, or a stronger debugging habit.
          </p>
        </div>
        <img
          src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80"
          alt="A group learning together in a workshop"
        />
      </section>

      <section className="contentSection">
        <div className="sectionHeader">
          <p className="eyebrow">Upcoming sessions</p>
          <h2>Bring your laptop and leave with momentum.</h2>
        </div>
        <div className="featureGrid">
          <article>
            <span>Week 1</span>
            <h3>Git and GitHub workflow</h3>
            <p>Branches, pull requests, code reviews, and the habits teams expect.</p>
          </article>
          <article>
            <span>Week 2</span>
            <h3>API building with FastAPI</h3>
            <p>Routes, validation, CORS, and clean backend structure for real projects.</p>
          </article>
          <article>
            <span>Week 3</span>
            <h3>Next.js deployment</h3>
            <p>Build checks, environment variables, and publishing your frontend with confidence.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
