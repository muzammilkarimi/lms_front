import { ResumeBuilder } from "./ResumeBuilder";

export default function ResumeBuilderPage() {
  return (
    <main className="resumeCompactPage">
      <section className="resumeMiniHero">
        <div>
          <p className="eyebrow">Resume Builder</p>
          <h1>Build your resume with live preview.</h1>
          <p>Edit sections, switch templates, and download a clean one-page resume.</p>
        </div>
        <img
          src="https://img.icons8.com/ios-filled/188/2b2338/resume.png"
          alt="Dark resume illustration"
        />
      </section>
      <ResumeBuilder />
    </main>
  );
}
