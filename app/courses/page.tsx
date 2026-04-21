const courses = [
  {
    title: "Python Foundations",
    level: "Beginner",
    duration: "4 weeks",
    description: "Write clean Python, solve problems, and build command-line mini projects.",
  },
  {
    title: "Web Dev Sprint",
    level: "Intermediate",
    duration: "6 weeks",
    description: "Create responsive apps with Next.js, APIs, auth basics, and deployment habits.",
  },
  {
    title: "DSA Practice Lab",
    level: "All levels",
    duration: "Ongoing",
    description: "Practice patterns, discuss approaches, and prepare for coding interviews together.",
  },
  {
    title: "Backend Builder",
    level: "Intermediate",
    duration: "5 weeks",
    description: "Design APIs, connect databases, and ship service code that is easy to test.",
  },
];

export default function CoursesPage() {
  return (
    <main>
      <section className="pageHero">
        <div>
          <p className="eyebrow">Courses</p>
          <h1>Pick a learning path and build your next proof of skill.</h1>
          <p>
            Every course is designed around practice, peer discussion, and portfolio-ready
            assignments.
          </p>
        </div>
        <img
          src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80"
          alt="A coding course open on a laptop"
        />
      </section>

      <section className="section">
        <div className="trackGrid">
          {courses.map((course) => (
            <article className="trackCard" key={course.title}>
              <span>{course.level}</span>
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <small>{course.duration}</small>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
