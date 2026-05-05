"use client";

import { useEffect, useRef, useState } from "react";
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
type SetupStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

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
  const scrollRef = useRef<HTMLDivElement | null>(null);
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
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [persona, setPersona] = useState<"technical_expert" | "friendly_recruiter" | "tough_manager">("friendly_recruiter");
  const [resumeText, setResumeText] = useState("");
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isInterviewOpen && startTime) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isInterviewOpen, startTime]);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const enVoices = voices.filter(v => v.lang.startsWith("en-"));
      setAvailableVoices(enVoices);
      
      // Auto-select best voice if none selected
      if (!selectedVoiceName && enVoices.length > 0) {
        const best = enVoices.find(v => v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Premium")) || enVoices[0];
        setSelectedVoiceName(best.name);
      }
    };

    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  }, [selectedVoiceName]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/students/dashboard`, {
      headers: studentAuthHeaders(),
    })
      .then(res => res.json())
      .then(data => {
        if (data.student) {
          if (data.student.skills?.length > 0) {
            setSkills(data.student.skills.join(", "));
            setResumeText(`Skills: ${data.student.skills.join(", ")}`);
          }
          if (data.student.desired_role) {
            setRole(data.student.desired_role);
          }
        }
      })
      .catch(() => {});
  }, []);

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

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
    
    // Clean text: Strip markdown symbols (*, #, _, etc.) so they aren't spoken literally
    const cleanText = text
      .replace(/[*#_~`>]/g, "")
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // Strip links but keep text
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.name === selectedVoiceName) || 
                  voices.find(v => v.name.includes("Natural")) || 
                  voices.find(v => v.lang.startsWith("en-"));
    
    if (voice) {
      utterance.voice = voice;
    }

    utterance.rate = 0.88; 
    utterance.pitch = 1.0;
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
    setSetupStep((current) => Math.min(current + 1, 7) as SetupStep);
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
    setProvider("");
    setIsListening(false);
    setIsSpeaking(false);
    setIsInterviewOpen(false);
    setIsResultOpen(false);
    setStartTime(null);
    setElapsed(0);
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
        persona,
        resume_text: resumeText,
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
    setStartTime(Date.now());
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
      if (response.status === 404) {
        setMessage("Session lost due to server update. Please start a new session.");
        setTimeout(() => resetInterviewState(), 3000);
      } else {
        setMessage(data.detail ?? "Could not continue interview.");
      }
      return;
    }
    setTurn(data.turn);
    setProvider(data.provider ?? provider);
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
      if (response.status === 404) {
        setMessage("Session lost due to server update. Please start a new session.");
        setTimeout(() => resetInterviewState(), 3000);
      } else {
        setMessage(data.detail ?? "Could not finish interview.");
      }
      return;
    }
    setFeedback(data);
    setIsResultOpen(true);
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
            <div className="wizardStep">
              <span className="dashboardBadge">Interviewer persona</span>
              <h3>Choose your interviewer style.</h3>
              <p>Different personas will test you in different ways.</p>
              
              <div className="difficultySelector">
                <button 
                  className={persona === "friendly_recruiter" ? "active" : ""} 
                  onClick={() => setPersona("friendly_recruiter")}
                >
                  Friendly Recruiter
                </button>
                <button 
                  className={persona === "technical_expert" ? "active" : ""} 
                  onClick={() => setPersona("technical_expert")}
                >
                  Technical Expert
                </button>
                <button 
                  className={persona === "tough_manager" ? "active" : ""} 
                  onClick={() => setPersona("tough_manager")}
                >
                  Tough Manager
                </button>
              </div>

              <div className="wizardActions">
                <button className="secondaryButton" type="button" onClick={() => setSetupStep(4)}>
                  Back
                </button>
                <button className="primaryButton" type="button" onClick={moveSetupNext}>
                  Next
                </button>
              </div>
            </div>
          ) : null}

          {setupStep === 6 ? (
            <div className="wizardStep">
              <span className="dashboardBadge">Premium Voice Selection</span>
              <h3>Pick a clear, professional voice.</h3>
              <p>Choose the voice that is most understandable for you.</p>
              
              <div className="voiceSelectorGrid">
                {availableVoices.slice(0, 8).map(v => (
                  <button 
                    key={v.name}
                    className={`voiceCard ${selectedVoiceName === v.name ? "active" : ""}`}
                    onClick={() => setSelectedVoiceName(v.name)}
                  >
                    <span>{v.name.replace("Microsoft", "").replace("Google", "").trim()}</span>
                    <small>{v.lang}</small>
                  </button>
                ))}
              </div>

              <div className="voiceTestAction">
                <button 
                  className="secondaryButton" 
                  onClick={() => speak("Hello! This is how I will sound during your interview. Is this voice clear for you?")}
                >
                  🔊 Test Selected Voice
                </button>
              </div>

              <div className="wizardActions">
                <button className="secondaryButton" type="button" onClick={() => setSetupStep(5)}>
                  Back
                </button>
                <button className="primaryButton" type="button" onClick={moveSetupNext}>
                  Next
                </button>
              </div>
            </div>
          ) : null}

          {setupStep === 7 ? (
            <div className="wizardStep compactWizardStep">
              <span className="dashboardBadge">Ready</span>
              <h3>Start your interview.</h3>
              <p>
                {role} • {difficulty} • {persona.replace("_", " ")}
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
          {provider === "gemini" ? "✨ Gemini Pro AI active" : provider === "ollama" ? "Ollama local AI active" : provider === "fallback" ? "Fallback mode active" : "AI model ready"}
          {" - "}
          {message}
        </p>
      </div>


      {isInterviewOpen ? (
        <div className="interviewModalBackdrop" role="dialog" aria-modal="true" aria-label="Live mock interview">
            <div className="interviewModal">
              <div className="interviewModalShell roomLayoutRedesign">
                <header className="interviewRoomHeader">
                  <div className="roomHeaderLeft">
                    <span className="dashboardBadge">Live Interview</span>
                    <h2>{role}</h2>
                    <p>{difficulty} • {roundType} • {formatTime(elapsed)}</p>
                  </div>

                  <div className="roomHeaderCenter">
                    <div className="interviewProgressBar">
                      {Array.from({ length: maxTurns }).map((_, i) => (
                        <div 
                          key={i} 
                          className={`progressSegment ${i + 1 < turn ? "completed" : i + 1 === turn ? "active" : ""}`}
                        />
                      ))}
                    </div>
                    <small>Question {turn} of {maxTurns}</small>
                  </div>
                  
                  <div className="roomHeaderRight">
                    {!isResultOpen && (
                      <button className="secondaryButton" type="button" onClick={finishInterview} disabled={isBusy}>
                        Finish Interview
                      </button>
                    )}
                    <button className="iconButton closeRoomButton" type="button" onClick={resetInterviewState} aria-label="Close interview">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                </header>

                <main className={`interviewRoomBody ${isResultOpen ? "resultViewActive" : ""}`}>
                  {isResultOpen && feedback ? (
                    <section className="interviewResultScreen">
                      <div className="resultIntro">
                        <div className="resultScoreCircle">
                          <svg viewBox="0 0 100 100">
                            <circle className="scoreBase" cx="50" cy="50" r="45" />
                            <circle 
                              className="scoreFill" 
                              cx="50" cy="50" r="45" 
                              style={{ 
                                strokeDashoffset: 283 - (283 * feedback.score) / 10,
                                stroke: feedback.score >= 8 ? "#7cdfd8" : feedback.score >= 6 ? "#f7d794" : "#f19066"
                              }}
                            />
                          </svg>
                          <div className="scoreText">
                            <strong>{feedback.score}</strong>
                            <span>SCORE</span>
                          </div>
                        </div>
                        <div className="resultHero">
                          <span className="performanceBadge">
                            {feedback.score >= 8 ? "🌟 Outstanding" : feedback.score >= 6 ? "📈 Good Progress" : "🎯 Focus Needed"}
                          </span>
                          <h3>Session Performance Report</h3>
                          <p>Targeting the <strong>{role}</strong> position</p>
                        </div>
                      </div>

                      <div className="resultDetailsGrid">
                        <div className="resultBlock strengthBlock">
                          <header>
                            <div className="blockIcon">💪</div>
                            <h4>Key Strengths</h4>
                          </header>
                          <p>{feedback.strength}</p>
                        </div>

                        <div className="resultBlock growthBlock">
                          <header>
                            <div className="blockIcon">🚀</div>
                            <h4>Areas for Growth</h4>
                          </header>
                          <ul>
                            {feedback.suggestions.map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="resultBlock sampleBlock fullWidthBlock">
                          <header>
                            <div className="blockIcon">📖</div>
                            <h4>The "Perfect" Response Structure</h4>
                          </header>
                          <div className="sampleAnswerBox">
                            <p>{feedback.sample_answer}</p>
                          </div>
                          <footer className="sampleTip">
                            💡 <strong>Tip:</strong> Try to incorporate these metrics in your next practice.
                          </footer>
                        </div>
                      </div>

                      <div className="resultActions">
                        <button className="primaryButton glowButton" onClick={resetInterviewState}>
                          Start New Practice
                        </button>
                        <button className="secondaryButton" onClick={() => window.location.href='/student-dashboard'}>
                          Exit to Dashboard
                        </button>
                      </div>
                    </section>
                  ) : (
                    <>
                      <aside className="interviewAvatarSection">
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
                            <h3>{isListening ? "Listening..." : isSpeaking ? "Speaking..." : "Ready"}</h3>
                          </div>
                          {isListening && (
                            <div className="listeningWaves">
                              <span /><span /><span /><span /><span />
                            </div>
                          )}
                        </div>
                      </aside>

                      <section className="interviewWorkspace">
                        <div className="workspaceHeader">
                          <div>
                            <span className="dashboardBadge">Transcript</span>
                            <h3>{isListening ? "Listening" : activeQuestion ? "In progress" : "Ready"}</h3>
                          </div>
                          <small>{conversation.length} messages</small>
                        </div>

                        <div className="workspaceScroll" ref={scrollRef} aria-live="polite">
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
                              rows={2}
                              value={answer}
                              onChange={(event) => setAnswer(event.target.value)}
                              onKeyDown={(event) => {
                                if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
                                  event.preventDefault();
                                  sendAnswer();
                                }
                              }}
                              placeholder="Speak or type your answer here (Ctrl+Enter to send)..."
                            />
                          </label>
                          <div className="answerActions">
                            <button 
                              className={`secondaryButton micActionButton ${isListening ? "activeMic" : ""}`} 
                              type="button" 
                              onClick={isListening ? stopListening : startListening}
                            >
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                                <line x1="12" y1="19" x2="12" y2="23"/>
                                <line x1="8" y1="23" x2="16" y2="23"/>
                              </svg>
                              {isListening ? "Listening..." : "Speak"}
                            </button>
                            {isListening && (
                              <div className="composerWaves">
                                <span /><span /><span /><span /><span />
                              </div>
                            )}
                            <button className="primaryButton" type="button" onClick={sendAnswer} disabled={!sessionId || isBusy}>
                              Submit answer
                            </button>
                          </div>
                        </div>
                      </section>
                    </>
                  )}
                </main>
              </div>
            </div>
        </div>
      ) : null}
    </section>
  );
}
