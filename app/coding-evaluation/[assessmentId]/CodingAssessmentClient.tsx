"use client";

import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { API_BASE_URL } from "../../lib/api";
import { getStudentToken, studentAuthHeaders } from "../../lib/studentAuth";

type CodingLanguage = "python" | "cpp";

type CodingQuestionResult = {
  question_id: number;
  language: CodingLanguage;
  code: string;
  passed_tests: number;
  total_tests: number;
  score: number;
  verdict: string;
  feedback: string;
  last_submitted_at: string | null;
};

type CodingAttemptQuestion = {
  id: number;
  title: string;
  prompt: string;
  difficulty: string;
  topic: string;
  language: CodingLanguage;
  languages: CodingLanguage[];
  function_name: string;
  signature: string;
  starter_code: string;
  signatures: Record<string, string>;
  starter_codes: Record<string, string>;
  examples: string[];
  result: CodingQuestionResult;
};

type CodingAttemptPayload = {
  id: number;
  status: "in_progress" | "submitted";
  total_score: number;
  solved_count: number;
  started_at: string;
  submitted_at: string | null;
  assessment: {
    id: number;
    title: string;
    description: string;
    duration_minutes: number;
    question_count: number;
  };
  questions: CodingAttemptQuestion[];
};

type CodingAssessmentClientProps = {
  assessmentId: string;
};

function formatRemaining(startedAt: string, durationMinutes: number) {
  const started = new Date(startedAt).getTime();
  const endsAt = started + durationMinutes * 60 * 1000;
  const remaining = Math.max(0, endsAt - Date.now());
  const totalSeconds = Math.floor(remaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function verdictLabel(value: string) {
  return value.replaceAll("_", " ");
}

function verdictTone(value: string) {
  if (value === "accepted") {
    return "success";
  }
  if (value === "partial") {
    return "warning";
  }
  if (value === "failed" || value === "runtime_error" || value === "syntax_error") {
    return "danger";
  }
  return "pending";
}

function draftKey(questionId: number, language: CodingLanguage) {
  return `${questionId}:${language}`;
}

function currentLanguage(question: CodingAttemptQuestion, selectedLanguages: Record<number, CodingLanguage>) {
  return (
    selectedLanguages[question.id] ??
    (question.languages.includes(question.result.language) ? question.result.language : undefined) ??
    question.languages[0] ??
    question.language
  );
}

function starterFor(question: CodingAttemptQuestion, language: CodingLanguage) {
  return question.starter_codes?.[language] ?? question.starter_code;
}

function signatureFor(question: CodingAttemptQuestion, language: CodingLanguage) {
  return question.signatures?.[language] ?? question.signature;
}

export function CodingAssessmentClient({ assessmentId }: CodingAssessmentClientProps) {
  const [attempt, setAttempt] = useState<CodingAttemptPayload | null>(null);
  const [activeQuestionId, setActiveQuestionId] = useState<number>(0);
  const [message, setMessage] = useState("Preparing your coding room...");
  const [submitting, setSubmitting] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [selectedLanguages, setSelectedLanguages] = useState<Record<number, CodingLanguage>>({});
  const [timerText, setTimerText] = useState("--:--");
  const [questionWidth, setQuestionWidth] = useState(40);
  const [isResizing, setIsResizing] = useState(false);
  const workspaceSplitRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!getStudentToken()) {
      setMessage("Login to start the coding evaluation.");
      return;
    }

    fetch(`${API_BASE_URL}/api/coding-assessments/${assessmentId}/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...studentAuthHeaders(),
      },
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.detail ?? "Could not start the coding assessment.");
        }
        setAttempt(payload);
        setActiveQuestionId(payload.questions[0]?.id ?? 0);

        const nextSelectedLanguages = Object.fromEntries(
          payload.questions.map((question: CodingAttemptQuestion) => [question.id, currentLanguage(question, {})]),
        ) as Record<number, CodingLanguage>;
        setSelectedLanguages(nextSelectedLanguages);

        setDrafts(
          Object.fromEntries(
            payload.questions.flatMap((question: CodingAttemptQuestion) =>
              question.languages.map((language) => [
                draftKey(question.id, language),
                question.result.language === language && question.result.code
                  ? question.result.code
                  : starterFor(question, language),
              ]),
            ),
          ),
        );
        setMessage("");
      })
      .catch((error: Error) => setMessage(error.message));
  }, [assessmentId]);

  useEffect(() => {
    if (!attempt) {
      return;
    }

    const update = () => {
      setTimerText(formatRemaining(attempt.started_at, attempt.assessment.duration_minutes));
    };

    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [attempt]);

  useEffect(() => {
    if (!isResizing) {
      return;
    }

    const previousUserSelect = document.body.style.userSelect;
    const previousCursor = document.body.style.cursor;
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";

    const handlePointerMove = (event: PointerEvent) => {
      if (!workspaceSplitRef.current) {
        return;
      }

      const rect = workspaceSplitRef.current.getBoundingClientRect();
      const nextWidth = ((event.clientX - rect.left) / rect.width) * 100;
      setQuestionWidth(Math.min(68, Math.max(32, nextWidth)));
    };

    const handlePointerUp = () => {
      setIsResizing(false);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      document.body.style.userSelect = previousUserSelect;
      document.body.style.cursor = previousCursor;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isResizing]);

  const activeQuestion = useMemo(
    () => attempt?.questions.find((question) => question.id === activeQuestionId) ?? attempt?.questions[0] ?? null,
    [activeQuestionId, attempt],
  );
  const activeQuestionIndex = attempt?.questions.findIndex((question) => question.id === activeQuestion?.id) ?? -1;
  const activeLanguage = activeQuestion ? currentLanguage(activeQuestion, selectedLanguages) : "python";
  const workspaceSplitStyle = { "--coding-question-width": `${questionWidth}%` } as CSSProperties;

  function startResize() {
    if (window.innerWidth < 981) {
      return;
    }
    setIsResizing(true);
  }

  function nudgeResize(direction: "left" | "right") {
    setQuestionWidth((current) => {
      const next = direction === "left" ? current - 4 : current + 4;
      return Math.min(68, Math.max(32, next));
    });
  }

  function closeAssessment() {
    window.location.href = "/student-dashboard";
  }

  async function submitQuestion() {
    if (!attempt || !activeQuestion) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/coding-attempts/${attempt.id}/questions/${activeQuestion.id}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...studentAuthHeaders(),
          },
          body: JSON.stringify({
            code: drafts[draftKey(activeQuestion.id, activeLanguage)] ?? "",
            language: activeLanguage,
          }),
        },
      );
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.detail ?? "Could not submit this question.");
      }
      setAttempt(payload);
      setSelectedLanguages((current) => ({
        ...current,
        [activeQuestion.id]: activeLanguage,
      }));
      setDrafts((current) => ({
        ...current,
        [draftKey(activeQuestion.id, activeLanguage)]:
          current[draftKey(activeQuestion.id, activeLanguage)] ?? starterFor(activeQuestion, activeLanguage),
      }));
      setMessage("Tests completed. You can keep refining the solution before ending the test.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not submit this question.");
    } finally {
      setSubmitting(false);
    }
  }

  async function finishAssessment() {
    if (!attempt) {
      return;
    }

    setFinishing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/coding-attempts/${attempt.id}/finish`, {
        method: "POST",
        headers: studentAuthHeaders(),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.detail ?? "Could not finish the assessment.");
      }
      setAttempt(payload);
      setMessage("Test finished. The result is now saved in your dashboard.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not finish the assessment.");
    } finally {
      setFinishing(false);
    }
  }

  if (!attempt) {
    return (
      <main className="codingPage">
        <section className="codingEmptyState">
          <h2>{message}</h2>
          <p>The coding event needs a logged-in student account before the room can start.</p>
          <a className="primaryButton" href="/student-login">
            Login
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className="codingPage">
      <section className="codingTopBar">
        <div className="codingTopBarCopy">
          <span className="dashboardBadge">Live test</span>
          <h2>{attempt.assessment.title}</h2>
          <p>
            {attempt.assessment.question_count} questions - {attempt.assessment.duration_minutes} minute room
          </p>
        </div>

        <div className="codingTopActions">
          <article className="codingQuickStat">
            <strong>{attempt.total_score}</strong>
            <span>Score</span>
          </article>
          <article className="codingQuickStat">
            <strong>
              {attempt.solved_count}/{attempt.assessment.question_count}
            </strong>
            <span>Solved</span>
          </article>
          <div className="codingTimer">
            <strong>{timerText}</strong>
            <span>Time left</span>
          </div>
          {attempt.status === "submitted" ? (
            <button className="primaryButton" type="button" onClick={closeAssessment}>
              Close test
            </button>
          ) : (
            <button className="primaryButton" type="button" onClick={finishAssessment} disabled={finishing}>
              {finishing ? "Ending..." : "End test"}
            </button>
          )}
        </div>
      </section>

      <section className="codingRoomShell">
        <aside className="codingQuestionRailPanel">
          <span className="dashboardBadge">Questions</span>
          <div className="codingQuestionRail">
            {attempt.questions.map((question, index) => (
              <button
                className={
                  question.id === activeQuestion?.id
                    ? `codingQuestionPill codingQuestionPill-${verdictTone(question.result.verdict)} activeCodingQuestionPill`
                    : `codingQuestionPill codingQuestionPill-${verdictTone(question.result.verdict)}`
                }
                key={question.id}
                type="button"
                onClick={() => setActiveQuestionId(question.id)}
                aria-label={`Question ${index + 1}`}
              >
                <strong>{index + 1}</strong>
                <small>{question.result.score}</small>
              </button>
            ))}
          </div>
        </aside>

        {activeQuestion ? (
          <section className="codingMainWorkspace">
            <div className="codingWorkspaceSplit" ref={workspaceSplitRef} style={workspaceSplitStyle}>
              <div className="codingQuestionCard">
                <div className="codingQuestionTop">
                  <div>
                    <span className="dashboardBadge">Question {activeQuestionIndex + 1}</span>
                    <h2>{activeQuestion.title}</h2>
                  </div>
                  <div className="codingQuestionMeta">
                    <span>{activeQuestion.topic}</span>
                    <span>{activeQuestion.difficulty}</span>
                    <span>{activeLanguage.toUpperCase()}</span>
                  </div>
                </div>

                <p>{activeQuestion.prompt}</p>

                <div className="codingSignature">{signatureFor(activeQuestion, activeLanguage)}</div>
              </div>

              <button
                aria-label="Resize question and editor panels"
                className={isResizing ? "codingSplitHandle activeCodingSplitHandle" : "codingSplitHandle"}
                onKeyDown={(event) => {
                  if (event.key === "ArrowLeft") {
                    event.preventDefault();
                    nudgeResize("left");
                  }
                  if (event.key === "ArrowRight") {
                    event.preventDefault();
                    nudgeResize("right");
                  }
                }}
                onPointerDown={startResize}
                type="button"
              >
                <span />
                <span />
                <span />
              </button>

              <div className="codingEditorCard">
                <div className="codingEditorHeader">
                  <div>
                    <strong>{activeLanguage === "cpp" ? "C++ editor" : "Python editor"}</strong>
                    <small>Return the value from the required function. Do not use input prompts.</small>
                  </div>

                  <label className="codingLanguageSelect">
                    <span>Language</span>
                    <select
                      value={activeLanguage}
                      onChange={(event) => {
                        const nextLanguage = event.target.value as CodingLanguage;
                        setSelectedLanguages((current) => ({
                          ...current,
                          [activeQuestion.id]: nextLanguage,
                        }));
                        setDrafts((current) => {
                          const key = draftKey(activeQuestion.id, nextLanguage);
                          if (current[key] !== undefined) {
                            return current;
                          }
                          return {
                            ...current,
                            [key]: starterFor(activeQuestion, nextLanguage),
                          };
                        });
                      }}
                    >
                      {activeQuestion.languages.map((language) => (
                        <option key={language} value={language}>
                          {language === "cpp" ? "C++" : "Python"}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <textarea
                  className="codingEditor"
                  spellCheck={false}
                  value={drafts[draftKey(activeQuestion.id, activeLanguage)] ?? starterFor(activeQuestion, activeLanguage)}
                  onChange={(event) =>
                    setDrafts((current) => ({
                      ...current,
                      [draftKey(activeQuestion.id, activeLanguage)]: event.target.value,
                    }))
                  }
                />

                <div className="codingEditorActions">
                  <button
                    className="secondaryButton"
                    type="button"
                    onClick={() =>
                      setDrafts((current) => ({
                        ...current,
                        [draftKey(activeQuestion.id, activeLanguage)]: starterFor(activeQuestion, activeLanguage),
                      }))
                    }
                  >
                    Reset starter
                  </button>
                  <button
                    className="primaryButton"
                    type="button"
                    onClick={submitQuestion}
                    disabled={attempt.status === "submitted" || submitting}
                  >
                    {submitting ? "Running..." : "Run tests"}
                  </button>
                </div>
              </div>
            </div>

            <div className={`codingResultCard codingResultCard-${verdictTone(activeQuestion.result.verdict)}`}>
              <div className="codingResultTop">
                <div>
                  <span className="dashboardBadge">Test cases</span>
                  <h3 className={`codingVerdictBadge codingVerdictBadge-${verdictTone(activeQuestion.result.verdict)}`}>
                    {verdictLabel(activeQuestion.result.verdict)}
                  </h3>
                </div>
                <div className="codingResultStats">
                  <span className={`codingResultStat codingResultStat-${verdictTone(activeQuestion.result.verdict)}`}>
                    {activeQuestion.result.score} score
                  </span>
                  <span className={`codingResultStat codingResultStat-${verdictTone(activeQuestion.result.verdict)}`}>
                    {activeQuestion.result.passed_tests}/{activeQuestion.result.total_tests} tests
                  </span>
                </div>
              </div>

              <div className="codingResultGrid">
                <div className="codingExamples">
                  <strong>Sample cases</strong>
                  <ul>
                    {activeQuestion.examples.map((example) => (
                      <li key={example}>{example}</li>
                    ))}
                  </ul>
                </div>

                <div className="codingFeedbackPanel">
                  <strong>Latest feedback</strong>
                  <p>{activeQuestion.result.feedback || "Run the tests to see feedback here."}</p>
                </div>
              </div>
            </div>

            {message ? <div className="codingInlineMessage">{message}</div> : null}
          </section>
        ) : null}
      </section>
    </main>
  );
}
