"use client";

import { useRef, useState } from "react";
import { API_BASE_URL } from "../lib/api";
import { studentAuthHeaders } from "../lib/studentAuth";

type Feedback = {
  score: number;
  strength: string;
  suggestions: string[];
  sample_answer: string;
  saved?: boolean;
};

type AnswerCoaching = {
  score: number;
  what_worked: string;
  missing: string[];
  better_answer: string;
};

type ConversationItem = {
  id: string;
  speaker: "Interviewer" | "Candidate";
  text: string;
};

type Difficulty = "beginner" | "intermediate" | "advanced";
type SetupStep = 1 | 2 | 3 | 4 | 5;

type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionEvent = {
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: {
        transcript: string;
      };
    };
  };
};

type SpeechWindow = Window & {
  SpeechRecognition?: new () => BrowserSpeechRecognition;
  webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
};

function cleanSkills(value: string) {
  return value
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

function skillPreview(value: string) {
  const items = cleanSkills(value).slice(0, 3);
  return items.length ? items.join(", ") : "No skills added";
}

export function MockInterviewTool() {
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const [skills, setSkills] = useState("React, TypeScript, SQL");
  const [role, setRole] = useState("Frontend Developer");
  const [difficulty, setDifficulty] = useState<Difficulty>("intermediate");
  const [roundType, setRoundType] = useState("mixed");
  const [setupStep, setSetupStep] = useState<SetupStep>(1);
  const [sessionId, setSessionId] = useState("");
  const [turn, setTurn] = useState(0);
  const [maxTurns, setMaxTurns] = useState(5);
  const [activeQuestion, setActiveQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [conversation, setConversation] = useState<ConversationItem[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [answerCoaching, setAnswerCoaching] = useState<AnswerCoaching | null>(null);
  const [message, setMessage] = useState("Add interview details, then start the live interview.");
  const [provider, setProvider] = useState<"ollama" | "fallback" | "">("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [isInterviewOpen, setIsInterviewOpen] = useState(false);

  function addConversation(speaker: ConversationItem["speaker"], text: string) {
    setConversation((items) => [
      ...items,
      {
        id: `${speaker}-${Date.now()}-${items.length}`,
        speaker,
        text,
      },
    ]);
  }

  function speak(text = activeQuestion) {
    if (!text || typeof window === "undefined" || !("speechSynthesis" in window)) {
      setMessage("Question is ready. Speech is not available in this browser.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 0.92;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }

  function startListening() {
    if (typeof window === "undefined") {
      return;
    }

    const speechWindow = window as SpeechWindow;
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setMessage("Speech recognition is not available in this browser. Try Chrome or Edge.");
      return;
    }

    recognitionRef.current?.stop();
    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";
    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";

      for (let index = 0; index < event.results.length; index += 1) {
        const result = event.results[index];
        if (result.isFinal) {
          finalText += `${result[0].transcript} `;
        } else {
          interimText += result[0].transcript;
        }
      }

      setAnswer((current) => {
        const baseAnswer = current.replace(/\n\nListening:[\s\S]*$/, "").trim();
        const finalAnswer = finalText ? `${baseAnswer} ${finalText}`.trim() : baseAnswer;
        return interimText ? `${finalAnswer}\n\nListening: ${interimText}`.trim() : finalAnswer;
      });
    };
    recognition.onerror = () => {
      setIsListening(false);
      setMessage("Could not capture voice clearly. You can try again or type your answer.");
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
    setMessage("Listening. Answer like you are in a real interview.");
  }

  function stopListening() {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setAnswer((current) => current.replace(/\n\nListening:[\s\S]*$/, "").trim());
    setIsListening(false);
    setMessage("Voice captured. Review it, then send your answer.");
  }

  function moveSetupNext() {
    if (setupStep === 1 && !role.trim()) {
      setMessage("Add the role first.");
      return;
    }
    if (setupStep === 4 && cleanSkills(skills).length === 0) {
      setMessage("Add at least one skill.");
      return;
    }
    setMessage("Interview details saved.");
    setSetupStep((current) => Math.min(current + 1, 5) as SetupStep);
  }

  function resetInterviewState() {
    recognitionRef.current?.stop();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSessionId("");
    setTurn(0);
    setActiveQuestion("");
    setAnswer("");
    setConversation([]);
    setAnswerCoaching(null);
    setProvider("");
    setIsListening(false);
    setIsSpeaking(false);
    setIsInterviewOpen(false);
  }

  async function startInterview() {
    if (!role.trim()) {
      setMessage("Add the role first.");
      setSetupStep(1);
      return;
    }
    if (cleanSkills(skills).length === 0) {
      setMessage("Add at least one skill.");
      setSetupStep(4);
      return;
    }

    setIsBusy(true);
    setFeedback(null);
    setAnswerCoaching(null);
    setConversation([]);
    setAnswer("");
    setMessage("Opening interview room...");

    const response = await fetch(`${API_BASE_URL}/api/mock-interview/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role,
        difficulty,
        round_type: roundType,
        skills: cleanSkills(skills),
      }),
    });
    const data = await response.json();
    setIsBusy(false);
    if (!response.ok) {
      setMessage(data.detail ?? "Could not start interview.");
      return;
    }
    setSessionId(data.session_id);
    setTurn(data.turn);
    setMaxTurns(data.max_turns);
    setProvider(data.provider);
    setActiveQuestion(data.question);
    setIsInterviewOpen(true);
    setMessage(data.message);
    addConversation("Interviewer", data.question);
    speak(data.question);
  }

  async function sendAnswer() {
    const cleanAnswer = answer.replace(/\n\nListening:[\s\S]*$/, "").trim();
    if (!sessionId || !cleanAnswer) {
      setMessage("Answer the current question first.");
      return;
    }

    setIsBusy(true);
    setMessage("Interviewer is thinking...");
    setAnswerCoaching(null);
    addConversation("Candidate", cleanAnswer);
    setAnswer("");

    const response = await fetch(`${API_BASE_URL}/api/mock-interview/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        answer: cleanAnswer,
      }),
    });
    const data = await response.json();
    setIsBusy(false);
    if (!response.ok) {
      setMessage(data.detail ?? "Could not continue interview.");
      return;
    }
    setTurn(data.turn);
    setProvider(data.provider ?? provider);
    setAnswerCoaching(data.answer_coaching ?? null);
    setMessage(data.message);
    if (data.question) {
      setActiveQuestion(data.question);
      addConversation("Interviewer", data.question);
      speak(data.question);
      return;
    }
    setActiveQuestion("");
  }

  async function finishInterview() {
    if (!sessionId) {
      setMessage("Start an interview before finishing it.");
      return;
    }

    setIsBusy(true);
    setMessage("Preparing your interview score...");
    const finalAnswer = answer.replace(/\n\nListening:[\s\S]*$/, "").trim();
    if (finalAnswer) {
      addConversation("Candidate", finalAnswer);
    }
    setAnswer("");

    const response = await fetch(`${API_BASE_URL}/api/mock-interview/end`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...studentAuthHeaders(),
      },
      body: JSON.stringify({
        session_id: sessionId,
        answer: finalAnswer,
      }),
    });
    const data = await response.json();
    setIsBusy(false);
    if (!response.ok) {
      setMessage(data.detail ?? "Could not finish interview.");
      return;
    }
    setFeedback(data);
    resetInterviewState();
    setMessage(data.saved ? "Score saved to student dashboard." : "Feedback ready. Login to save future scores.");
  }

  return (
    <section className="toolPanel interviewToolPanel interviewSetupShell">
      <div className="toolControls interviewSetupPanel interviewDetailsPanel">
        <div className="interviewSetupIntro">
          <span className="dashboardBadge">Interview setup</span>
          <h2>Tell us the interview details first.</h2>
          <p>Once setup is ready, the live interview opens in a focused room with avatar, transcript, voice, coaching, and finish button.</p>
        </div>

        <div className="interviewWizard">
          <div className="wizardProgress">
            {[1, 2, 3, 4].map((step) => (
              <span className={setupStep >= step ? "wizardDot activeWizardDot" : "wizardDot"} key={step} />
            ))}
          </div>

          {setupStep === 1 ? (
            <div className="wizardStep">
              <span className="dashboardBadge">Step 1</span>
              <h3>Which role are you preparing for?</h3>
              <label>
                <span>Target role</span>
                <input value={role} onChange={(event) => setRole(event.target.value)} />
              </label>
              <button className="primaryButton" type="button" onClick={moveSetupNext}>
                Continue
              </button>
            </div>
          ) : null}

          {setupStep === 2 ? (
            <div className="wizardStep">
              <span className="dashboardBadge">Step 2</span>
              <h3>Choose difficulty.</h3>
              <div className="wizardOptionGrid">
                {[
                  ["beginner", "Beginner", "Clear basics and confidence."],
                  ["intermediate", "Intermediate", "Project depth and tradeoffs."],
                  ["advanced", "Advanced", "Architecture, impact, edge cases."],
                ].map(([value, label, description]) => (
                  <button
                    className={difficulty === value ? "wizardOption selectedWizardOption" : "wizardOption"}
                    key={value}
                    type="button"
                    onClick={() => setDifficulty(value as Difficulty)}
                  >
                    <strong>{label}</strong>
                    <span>{description}</span>
                  </button>
                ))}
              </div>
              <div className="wizardNavActions">
                <button className="secondaryButton" type="button" onClick={() => setSetupStep(1)}>
                  Back
                </button>
                <button className="primaryButton" type="button" onClick={moveSetupNext}>
                  Continue
                </button>
              </div>
            </div>
          ) : null}

          {setupStep === 3 ? (
            <div className="wizardStep">
              <span className="dashboardBadge">Step 3</span>
              <h3>Pick interview type.</h3>
              <div className="wizardOptionGrid">
                {[
                  ["mixed", "Mixed", "Technical plus HR."],
                  ["technical", "Technical", "Skills, projects, debugging."],
                  ["hr", "HR", "Behavior, clarity, confidence."],
                ].map(([value, label, description]) => (
                  <button
                    className={roundType === value ? "wizardOption selectedWizardOption" : "wizardOption"}
                    key={value}
                    type="button"
                    onClick={() => setRoundType(value)}
                  >
                    <strong>{label}</strong>
                    <span>{description}</span>
                  </button>
                ))}
              </div>
              <div className="wizardNavActions">
                <button className="secondaryButton" type="button" onClick={() => setSetupStep(2)}>
                  Back
                </button>
                <button className="primaryButton" type="button" onClick={moveSetupNext}>
                  Continue
                </button>
              </div>
            </div>
          ) : null}

          {setupStep === 4 ? (
            <div className="wizardStep">
              <span className="dashboardBadge">Step 4</span>
              <h3>Add skills for the interviewer.</h3>
              <label>
                <span>Skills</span>
                <input value={skills} onChange={(event) => setSkills(event.target.value)} />
              </label>
              <div className="wizardNavActions">
                <button className="secondaryButton" type="button" onClick={() => setSetupStep(3)}>
                  Back
                </button>
                <button className="primaryButton" type="button" onClick={moveSetupNext}>
                  Review details
                </button>
              </div>
            </div>
          ) : null}

          {setupStep === 5 ? (
            <div className="wizardStep compactWizardStep">
              <span className="dashboardBadge">Ready</span>
              <h3>Start your interview.</h3>
              <p>
                {role} - {difficulty} difficulty - {roundType} round - {skillPreview(skills)}
              </p>
              <div className="interviewSessionActions">
                <button className="secondaryButton" type="button" onClick={() => setSetupStep(1)} disabled={isBusy}>
                  Change details
                </button>
                <button className="primaryButton" type="button" onClick={startInterview} disabled={isBusy}>
                  Start interview
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <p className="interviewStatus">
          {provider === "ollama" ? "Ollama local AI active" : provider === "fallback" ? "Fallback mode active" : "Local-first mode"}
          {" - "}
          {message}
        </p>
      </div>

      {feedback ? (
        <article className="feedbackBox liveFeedbackBox interviewResultPanel">
          <div>
            <span>Interview score</span>
            <h3>{feedback.score}/10</h3>
          </div>
          <p>{feedback.strength}</p>
          <ul>
            {feedback.suggestions.map((suggestion) => (
              <li key={suggestion}>{suggestion}</li>
            ))}
          </ul>
          <p>
            <strong>Better structure:</strong> {feedback.sample_answer}
          </p>
        </article>
      ) : null}

      {isInterviewOpen ? (
        <div className="interviewModalBackdrop" role="dialog" aria-modal="true" aria-label="Live mock interview">
          <div className="interviewModal">
            <div className="interviewModalShell">
              <aside className="interviewSidebar">
                <div className="interviewSidebarTop">
                  <span className="dashboardBadge">Live interview</span>
                  <h2>{role}</h2>
                  <p>
                    {difficulty} difficulty - {roundType} round - Question {turn || 1}/{maxTurns}
                  </p>
                </div>

                <div className={`interviewerCard ${isSpeaking ? "speaking" : ""} ${isListening ? "listening" : ""}`}>
                  <div className="cornerAvatar" aria-hidden="true">
                    <div className="avatarStage">
                      <div className="avatarHalo" />
                      <div className="humanAvatar">
                        <span className="avatarHair" />
                        <div className="humanFace">
                          <span className="avatarBrow leftBrow" />
                          <span className="avatarBrow rightBrow" />
                          <span className="avatarEye" />
                          <span className="avatarEye" />
                          <span className="avatarNose" />
                          <span className="avatarMouth" />
                        </div>
                        <span className="avatarNeck" />
                        <span className="avatarShirt" />
                        <span className="avatarMic" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className="dashboardBadge">Interviewer</span>
                    <h3>{isListening ? "Listening now" : isSpeaking ? "Speaking now" : "Ready"}</h3>
                    <p>{activeQuestion || "Use the controls or finish the interview when you are done."}</p>
                  </div>
                </div>

                <div className="sidebarMetaList">
                  <span>{provider === "ollama" ? "Local AI active" : "Fallback interviewer"}</span>
                  <span>{conversation.length} messages</span>
                  <span>{skillPreview(skills)}</span>
                </div>

                <div className="sidebarControls">
                  <button className="secondaryButton compactSideButton" type="button" onClick={() => speak()} disabled={!activeQuestion}>
                    Repeat question
                  </button>
                  <button className="secondaryButton compactSideButton" type="button" onClick={isListening ? stopListening : startListening}>
                    {isListening ? "Stop voice capture" : "Speak answer"}
                  </button>
                  <button className="secondaryButton compactSideButton finishSideButton" type="button" onClick={finishInterview} disabled={isBusy}>
                    Finish interview
                  </button>
                </div>
              </aside>

              <section className="interviewWorkspace">
                <div className="workspaceHeader">
                  <div>
                    <span className="dashboardBadge">Transcript</span>
                    <h3>{isListening ? "Listening now" : activeQuestion ? "Question in progress" : "Ready to finish"}</h3>
                  </div>
                  <small>{conversation.length} messages</small>
                </div>

                <div className="workspaceScroll" aria-live="polite">
                  <div className="conversationStream">
                    {conversation.map((item) => (
                      <article className={`conversationBubble ${item.speaker === "Candidate" ? "candidateBubble" : ""}`} key={item.id}>
                        <span>{item.speaker}</span>
                        <p>{item.text}</p>
                      </article>
                    ))}
                  </div>

                </div>

                <div className="workspaceComposer">
                  <label className="liveAnswerBox">
                    <span>Your answer</span>
                    <textarea
                      rows={3}
                      value={answer}
                      onChange={(event) => setAnswer(event.target.value)}
                      placeholder="Speak or type your answer here..."
                    />
                  </label>
                  <div className="answerActions">
                    <button className="primaryButton" type="button" onClick={sendAnswer} disabled={!sessionId || isBusy}>
                      Submit answer
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
