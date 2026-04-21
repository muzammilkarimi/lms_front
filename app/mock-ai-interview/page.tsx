import { MockInterviewTool } from "./MockInterviewTool";

export default function MockAiInterviewPage() {
  return (
    <main className="interviewCompactPage">
      <section className="interviewMiniIntro">
        <div className="interviewIntroContent">
          <div>
            <p className="eyebrow">AI Interview</p>
            <h1>Set up a realistic mock interview.</h1>
            <p>Choose the role, difficulty, round type, and skills. Then enter a focused interview room with voice, transcript, coaching, and final score.</p>
          </div>
          <img
            className="interviewMascot"
            src="https://img.icons8.com/ios-filled/188/1d1520/conference-call.png"
            alt="Dark interview illustration"
          />
        </div>
      </section>

      <section className="interviewPracticeStrip" aria-label="Practice flow">
        {["Details first", "Focused room", "Voice answers", "AI coaching"].map((item, index) => (
          <article key={item}>
            <span>{index + 1}</span>
            <strong>{item}</strong>
          </article>
        ))}
      </section>

      <MockInterviewTool />
    </main>
  );
}
