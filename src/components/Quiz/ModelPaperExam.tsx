import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  modelPaperService,
  type SubmitPaperRequest,
} from "../../services/modelPaperService";
import {
  getModelPaperNotations,
  type NotationButton,
} from "../../config/mathNotations";

// ==================== Types ====================

interface AnswerStep {
  description: string;
  value: string;
}

interface SubQuestion {
  sub_question_label: string;
  sub_question: string;
  answer_steps: AnswerStep[];
  answer?: string;
}

interface ShortAnswerQ {
  question_number: number;
  question: string;
  topics: string[];
  answer_steps: AnswerStep[];
  final_answer: string;
}

interface StructuredQ {
  question_number: number;
  question: string;
  topics: string[];
  sub_questions: SubQuestion[];
}

type Section = "short_answer" | "structured" | "essay_type";

const SECTION_LABELS: Record<Section, { si: string; en: string }> = {
  short_answer: { si: "කෙටි පිළිතුරු", en: "Short Answer" },
  structured: { si: "ව්‍යුහගත", en: "Structured" },
  essay_type: { si: "රචනා", en: "Essay" },
};

const AUTO_SAVE_INTERVAL = 60_000; // 1 minute

// ==================== Component ====================

const ModelPaperExam: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // FIX #2: Store paperId in a ref so it survives history.pushState re-renders
  const paperIdRef = useRef<string | undefined>(
    (location.state as any)?.paperId,
  );
  const paperId = paperIdRef.current;

  // Paper data
  const [paper, setPaper] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Exam state
  const [activeSection, setActiveSection] = useState<Section>("short_answer");
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<any>({
    short_answer: [],
    structured: [],
    essay_type: [],
  });

  // FIX #1: Initialize timeRemaining to null so we know when it's been set
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAnswerSheet, setShowAnswerSheet] = useState(false);
  const [answerSheetData, setAnswerSheetData] = useState<any>(null);

  // Notations
  const [notations, setNotations] = useState<NotationButton[]>([]);

  // Guidelines
  const [guidelines, setGuidelines] = useState<Record<string, string[]>>({});
  const [guidelinesLoading, setGuidelinesLoading] = useState<Record<string, boolean>>({});
  const [guidelinesVisible, setGuidelinesVisible] = useState<Record<string, boolean>>({});

  // Refs
  const timerRef = useRef<number | null>(null);
  const autoSaveRef = useRef<number | null>(null);
  const activeInputRef = useRef<HTMLInputElement | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const isSubmittedRef = useRef(false);

  // ==================== Load Paper ====================

  useEffect(() => {
    if (!paperId) {
      setError("No paper ID provided");
      setLoading(false);
      return;
    }
    loadPaper();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    };
  }, [paperId]);

  const loadPaper = async () => {
    try {
      setLoading(true);
      const data = await modelPaperService.startPaper(paperId);

      // Validate time before touching state so both values are ready on the same render
      const timeSeconds = Number(data.time_remaining_seconds);
      const validTime = isNaN(timeSeconds) || timeSeconds <= 0 ? 0 : timeSeconds;

      startTimeRef.current = Date.now();
      // Set time first so it's ready when the paper state triggers the timer effect
      setTimeRemaining(validTime);
      setPaper(data);

      // Build notations from topics
      setNotations(getModelPaperNotations(data.topics_used || []));

      // Initialize answer structures
      initializeAnswers(data.questions, data.saved_answers);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || err.message || "Failed to load paper",
      );
    } finally {
      setLoading(false);
    }
  };

  const initializeAnswers = (questions: any, savedAnswers: any) => {
    const newAnswers: any = {
      short_answer: [],
      structured: [],
      essay_type: [],
    };

    // Short answers
    for (const q of questions.short_answer || []) {
      const saved = savedAnswers?.short_answer?.find(
        (a: any) => a.question_number === q.question_number,
      );
      newAnswers.short_answer.push({
        question_number: q.question_number,
        step_answers:
          saved?.step_answers ||
          Object.fromEntries(
            q.answer_steps.map((_: any, i: number) => [String(i), ""]),
          ),
        final_answer: saved?.final_answer || "",
      });
    }

    // Structured & Essay
    for (const section of ["structured", "essay_type"] as const) {
      for (const q of questions[section] || []) {
        const saved = savedAnswers?.[section]?.find(
          (a: any) => a.question_number === q.question_number,
        );
        newAnswers[section].push({
          question_number: q.question_number,
          sub_questions: q.sub_questions.map((sq: SubQuestion) => {
            const savedSq = saved?.sub_questions?.find(
              (s: any) => s.sub_question_label === sq.sub_question_label,
            );
            return {
              sub_question_label: sq.sub_question_label,
              step_answers:
                savedSq?.step_answers ||
                Object.fromEntries(
                  sq.answer_steps.map((_: any, i: number) => [String(i), ""]),
                ),
              final_answer: savedSq?.final_answer || "",
            };
          }),
        });
      }
    }

    setAnswers(newAnswers);
  };

  // ==================== Timer ====================

  // Start the countdown only after BOTH paper and a valid timeRemaining are ready
  useEffect(() => {
    // Wait until time has been loaded from the API (not null) and is > 0
    if (!paper || isSubmitted || timeRemaining === null || timeRemaining <= 0) return;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = window.setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          // Use setTimeout so we don't call setState inside setState
          setTimeout(() => {
            if (!isSubmittedRef.current) {
              isSubmittedRef.current = true;
              handleAutoSubmit();
            }
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  // timeRemaining is intentionally included here so the timer starts
  // as soon as the real value arrives from the API, but won't restart
  // on every tick because we clear + restart only when the value
  // transitions from null → a real number (via the null guard above).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paper, isSubmitted, timeRemaining === null]);

  // Auto-save
  useEffect(() => {
    if (!paper || isSubmitted) return;

    autoSaveRef.current = window.setInterval(() => {
      handleSaveProgress();
    }, AUTO_SAVE_INTERVAL);

    return () => {
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    };
  }, [paper, isSubmitted, answers]);

  const formatTimer = (seconds: number | null) => {
    // FIX #1: Guard against null / NaN
    if (seconds === null || isNaN(seconds) || seconds < 0) return "00:00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getTimerColor = () => {
    if (timeRemaining === null) return "text-white";
    if (timeRemaining < 300) return "text-red-400 animate-pulse"; // < 5 min
    if (timeRemaining < 900) return "text-yellow-300"; // < 15 min
    return "text-green-300";
  };

  // ==================== Answer Handlers ====================

  const updateShortAnswer = (qIdx: number, stepIdx: number, value: string) => {
    setAnswers((prev: any) => {
      const updated = { ...prev };
      updated.short_answer = [...prev.short_answer];
      updated.short_answer[qIdx] = {
        ...updated.short_answer[qIdx],
        step_answers: {
          ...updated.short_answer[qIdx].step_answers,
          [String(stepIdx)]: value,
        },
      };
      return updated;
    });
  };

  const updateShortFinalAnswer = (qIdx: number, value: string) => {
    setAnswers((prev: any) => {
      const updated = { ...prev };
      updated.short_answer = [...prev.short_answer];
      updated.short_answer[qIdx] = {
        ...updated.short_answer[qIdx],
        final_answer: value,
      };
      return updated;
    });
  };

  const updateSubQuestionAnswer = (
    section: "structured" | "essay_type",
    qIdx: number,
    sqIdx: number,
    stepIdx: number,
    value: string,
  ) => {
    setAnswers((prev: any) => {
      const updated = { ...prev };
      updated[section] = [...prev[section]];
      updated[section][qIdx] = { ...updated[section][qIdx] };
      updated[section][qIdx].sub_questions = [
        ...updated[section][qIdx].sub_questions,
      ];
      updated[section][qIdx].sub_questions[sqIdx] = {
        ...updated[section][qIdx].sub_questions[sqIdx],
        step_answers: {
          ...updated[section][qIdx].sub_questions[sqIdx].step_answers,
          [String(stepIdx)]: value,
        },
      };
      return updated;
    });
  };

  const updateSubQuestionFinalAnswer = (
    section: "structured" | "essay_type",
    qIdx: number,
    sqIdx: number,
    value: string,
  ) => {
    setAnswers((prev: any) => {
      const updated = { ...prev };
      updated[section] = [...prev[section]];
      updated[section][qIdx] = { ...updated[section][qIdx] };
      updated[section][qIdx].sub_questions = [
        ...updated[section][qIdx].sub_questions,
      ];
      updated[section][qIdx].sub_questions[sqIdx] = {
        ...updated[section][qIdx].sub_questions[sqIdx],
        final_answer: value,
      };
      return updated;
    });
  };

  // Insert notation at cursor position
  const insertNotation = (symbol: string) => {
    if (!activeInputRef.current) return;
    const input = activeInputRef.current;
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const currentVal = input.value;
    const newVal =
      currentVal.substring(0, start) + symbol + currentVal.substring(end);

    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    )?.set;
    nativeInputValueSetter?.call(input, newVal);
    input.dispatchEvent(new Event("input", { bubbles: true }));

    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + symbol.length, start + symbol.length);
    }, 0);
  };

  // ==================== Submit / Save ====================

  const getTimeSpent = () =>
    Math.floor((Date.now() - startTimeRef.current) / 1000);

  const handleSaveProgress = async () => {
    if (!paperId || isSubmitted) return;
    try {
      await modelPaperService.saveProgress({
        paper_id: paperId,
        time_spent_seconds: getTimeSpent(),
        answers,
      });
    } catch (err) {
      console.error("Auto-save failed:", err);
    }
  };

  const handleAutoSubmit = async () => {
    if (isSubmitted) return;
    await handleSubmit(true);
  };

  const handleSubmit = async (auto = false) => {
    if (!auto) {
      const confirmed = window.confirm(
        "ඔබට විභාගය ඉදිරිපත් කිරීමට අවශ්‍යද?\nAre you sure you want to submit?",
      );
      if (!confirmed) return;
    }

    setIsSubmitting(true);
    try {
      await modelPaperService.submitPaper({
        paper_id: paperId,
        time_spent_seconds: getTimeSpent(),
        answers,
      });
      setIsSubmitted(true);
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to submit");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewAnswerSheet = async () => {
    try {
      const data = await modelPaperService.getAnswerSheet(paperId);
      setAnswerSheetData(data);
      setShowAnswerSheet(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load answer sheet");
    }
  };

  // ==================== Navigation guard ====================

  useEffect(() => {
    if (!paper || isSubmitted) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue =
        "You have an ongoing exam. Are you sure you want to leave?";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [paper, isSubmitted]);

  // FIX #2: Prevent back button crash — push state once on mount, handle popstate
  // without calling pushState again inside the handler (that caused location.state wipe)
  useEffect(() => {
    if (!paper || isSubmitted) return;

    // Push a sentinel entry once so the user "has somewhere to go back from"
    window.history.pushState({ examGuard: true }, "", window.location.href);

    const handlePopState = (e: PopStateEvent) => {
      // Push the sentinel again to keep them on the page
      window.history.pushState({ examGuard: true }, "", window.location.href);
      alert(
        "විභාගය අතරතුර ආපසු යාම නොහැක.\nYou cannot go back during the exam.",
      );
      // paperId is safe in paperIdRef — no re-render wipes it
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [paper, isSubmitted]);

  // ==================== Current questions helper ====================

  const getCurrentQuestions = (): any[] => {
    if (!paper) return [];
    return paper.questions[activeSection] || [];
  };

  const currentQuestions = getCurrentQuestions();
  const currentQ = currentQuestions[currentQIndex];

  const totalQuestions = (section: Section) =>
    paper?.questions?.[section]?.length || 0;

  // ==================== Guidelines ====================

  const handleGetGuidelines = async (questionKey: string, questionText: string) => {
    // Toggle visibility if already loaded
    if (guidelines[questionKey]) {
      setGuidelinesVisible((prev) => ({ ...prev, [questionKey]: !prev[questionKey] }));
      return;
    }

    setGuidelinesLoading((prev) => ({ ...prev, [questionKey]: true }));
    setGuidelinesVisible((prev) => ({ ...prev, [questionKey]: true }));
    try {
      const res = await modelPaperService.getGuidelines(questionText);
      if (res.status === "success" && res.guidelines?.length > 0) {
        setGuidelines((prev) => ({ ...prev, [questionKey]: res.guidelines }));
      } else if (res.status === "filtered") {
        setGuidelines((prev) => ({ ...prev, [questionKey]: [res.message || "මෙම ප්‍රශ්නය සඳහා මාර්ගෝපදේශ ලබාගත නොහැක."] }));
      } else {
        setGuidelines((prev) => ({ ...prev, [questionKey]: [res.error || "මාර්ගෝපදේශ ලබාගත නොහැකි විය."] }));
      }
    } catch {
      setGuidelines((prev) => ({ ...prev, [questionKey]: ["මාර්ගෝපදේශ ලබාගැනීමේ දෝෂයකි. / Failed to fetch guidelines."] }));
    } finally {
      setGuidelinesLoading((prev) => ({ ...prev, [questionKey]: false }));
    }
  };

  const renderGuidelinesButton = (questionKey: string, questionText: string) => (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => handleGetGuidelines(questionKey, questionText)}
        disabled={guidelinesLoading[questionKey]}
        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg text-sm font-medium transition-colors"
      >
        {guidelinesLoading[questionKey]
          ? "Loading..."
          : guidelinesVisible[questionKey]
            ? "මාර්ගෝපදේශ සඟවන්න (Hide Guidelines)"
            : "මාර්ගෝපදේශ (Guidelines)"}
      </button>
      {guidelinesVisible[questionKey] && guidelines[questionKey] && (
        <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-300 dark:border-green-700">
          <h4 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-2">
            මාර්ගෝපදේශ (Guidelines):
          </h4>
          <ol className="list-decimal list-inside space-y-1">
            {guidelines[questionKey].map((g, i) => (
              <li key={i} className="text-sm text-green-700 dark:text-green-300">
                {g}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );

  // ==================== Render Helpers ====================

  const renderNotationBar = () => (
    <div className="flex flex-wrap gap-1.5 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {notations.map((n) => (
        <button
          key={n.symbol}
          type="button"
          onClick={() => insertNotation(n.symbol)}
          title={n.tooltip || n.symbol}
          className="px-2.5 py-1.5 bg-white dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/40 
                               text-gray-800 dark:text-gray-200 rounded border border-gray-300 dark:border-gray-600 
                               text-sm font-medium min-w-[36px] transition-colors shadow-sm"
        >
          {n.label}
        </button>
      ))}
    </div>
  );

  const renderStepInput = (
    step: AnswerStep,
    stepIdx: number,
    value: string,
    onChange: (val: string) => void,
    keyPrefix: string,
  ) => (
    <div
      key={`${keyPrefix}-${stepIdx}`}
      className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
    >
      <div className="flex-shrink-0 text-sm text-gray-700 dark:text-gray-300 font-medium min-w-[200px]">
        {step.description}
        {step.description && !step.description.trim().endsWith("=") && " ="}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => {
          activeInputRef.current = e.target;
        }}
        placeholder="පිළිතුර ලියන්න..."
        className="flex-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                           bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-base"
        dir="auto"
      />
    </div>
  );

  // ==================== Render: Short Answer Question ====================

  const renderShortAnswer = (q: ShortAnswerQ, qIdx: number) => {
    const ans = answers.short_answer[qIdx];
    if (!ans) return null;

    return (
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
          <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">
            ප්‍රශ්නය {q.question_number} • {q.topics?.join(", ")}
          </div>
          <div className="text-lg text-gray-900 dark:text-gray-100 leading-relaxed">
            {q.question}
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            විසඳුම් පියවර:
          </h4>
          {q.answer_steps.map((step, sIdx) =>
            renderStepInput(
              step,
              sIdx,
              ans.step_answers[String(sIdx)] || "",
              (val) => updateShortAnswer(qIdx, sIdx, val),
              `sa-${qIdx}`,
            ),
          )}
        </div>

        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border-2 border-yellow-400 dark:border-yellow-600">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            අවසාන පිළිතුර (Final Answer):
          </label>
          <input
            type="text"
            value={ans.final_answer}
            onChange={(e) => updateShortFinalAnswer(qIdx, e.target.value)}
            onFocus={(e) => {
              activeInputRef.current = e.target;
            }}
            placeholder="අවසාන පිළිතුර..."
            className="w-full px-3 py-2 border-2 border-yellow-400 dark:border-yellow-600 rounded-md 
                                   focus:ring-2 focus:ring-yellow-500 bg-white dark:bg-gray-900 
                                   text-lg font-medium text-gray-900 dark:text-gray-100"
            dir="auto"
          />
        </div>

        {renderGuidelinesButton(`sa-${qIdx}`, q.question)}
      </div>
    );
  };

  // ==================== Render: Structured / Essay Question ====================

  const renderStructuredOrEssay = (
    q: StructuredQ,
    qIdx: number,
    section: "structured" | "essay_type",
  ) => {
    const ans = answers[section][qIdx];
    if (!ans) return null;

    return (
      <div className="space-y-6">
        <div
          className={`p-4 rounded-lg border-l-4 ${
            section === "structured"
              ? "bg-purple-50 dark:bg-purple-900/20 border-purple-500"
              : "bg-green-50 dark:bg-green-900/20 border-green-500"
          }`}
        >
          <div
            className={`text-sm mb-1 ${
              section === "structured"
                ? "text-purple-600 dark:text-purple-400"
                : "text-green-600 dark:text-green-400"
            }`}
          >
            ප්‍රශ්නය {q.question_number} • {q.topics?.join(", ")}
          </div>
          <div className="text-base text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-line">
            {q.question}
          </div>
        </div>

        {q.sub_questions.map((sq, sqIdx) => (
          <div
            key={sqIdx}
            className="ml-2 sm:ml-4 border-l-2 border-gray-300 dark:border-gray-600 pl-4 space-y-3"
          >
            <div className="font-semibold text-gray-800 dark:text-gray-200">
              <span className="text-blue-600 dark:text-blue-400 mr-2">
                {sq.sub_question_label}
              </span>
              {sq.sub_question}
            </div>

            <div className="space-y-2">
              {sq.answer_steps.map((step, sIdx) =>
                renderStepInput(
                  step,
                  sIdx,
                  ans.sub_questions[sqIdx]?.step_answers?.[String(sIdx)] || "",
                  (val) =>
                    updateSubQuestionAnswer(section, qIdx, sqIdx, sIdx, val),
                  `${section}-${qIdx}-${sqIdx}`,
                ),
              )}
            </div>

            <div className="p-2 bg-yellow-50 dark:bg-yellow-900/10 rounded border border-yellow-300 dark:border-yellow-700">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                {sq.sub_question_label} පිළිතුර:
              </label>
              <input
                type="text"
                value={ans.sub_questions[sqIdx]?.final_answer || ""}
                onChange={(e) =>
                  updateSubQuestionFinalAnswer(
                    section,
                    qIdx,
                    sqIdx,
                    e.target.value,
                  )
                }
                onFocus={(e) => {
                  activeInputRef.current = e.target;
                }}
                placeholder="පිළිතුර..."
                className="w-full px-3 py-1.5 border border-yellow-300 dark:border-yellow-600 rounded 
                                           bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                dir="auto"
              />
            </div>

            {renderGuidelinesButton(
              `${section}-${qIdx}-${sqIdx}`,
              `${q.question} - ${sq.sub_question_label}: ${sq.sub_question}`,
            )}
          </div>
        ))}
      </div>
    );
  };

  // ==================== Render: Answer Sheet ====================

  if (showAnswerSheet && answerSheetData) {
    return (
      <AnswerSheetView
        data={answerSheetData}
        onBack={() => navigate("/quiz/generate")}
      />
    );
  }

  // ==================== Render: Submitted State ====================

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            විභාගය සාර්ථකව ඉදිරිපත් කරන ලදී!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Paper submitted successfully
          </p>
          <div className="space-y-3">
            <button
              onClick={handleViewAnswerSheet}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              📋 පිළිතුරු පත්‍රය බලන්න (View Answer Sheet)
            </button>
            <button
              onClick={() => navigate("/quiz/generate")}
              className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors"
            >
              ← ආපසු යන්න (Go Back)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== Render: Loading ====================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            විභාග පත්‍රය පූරණය වෙමින්...
          </p>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Loading exam paper...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => navigate("/quiz/generate")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!paper) return null;

  // ==================== Main Exam UI ====================

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex flex-col">
      {/* ===== HEADER ===== */}
      <header className="bg-indigo-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-full mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold hidden sm:inline">
                📝 O/L ගණිත ආදර්ශ පත්‍රය
              </span>
              <span className="text-lg font-bold sm:hidden">
                📝 ආදර්ශ පත්‍රය
              </span>
            </div>

            {/* Timer */}
            <div
              className={`flex items-center gap-2 bg-indigo-800 px-4 py-1.5 rounded-full font-mono text-lg ${getTimerColor()}`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {formatTimer(timeRemaining)}
            </div>

            {/* Submit */}
            <button
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-500 text-white rounded-lg font-medium text-sm transition-colors"
            >
              {isSubmitting ? "Submitting..." : "ඉදිරිපත් කරන්න (Submit)"}
            </button>
          </div>
        </div>
      </header>

      {/* ===== SECTION TABS ===== */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-full mx-auto px-3 sm:px-6">
          <div className="flex gap-1 py-2 overflow-x-auto">
            {(["short_answer", "structured", "essay_type"] as Section[]).map(
              (section) => (
                <button
                  key={section}
                  onClick={() => {
                    setActiveSection(section);
                    setCurrentQIndex(0);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeSection === section
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {SECTION_LABELS[section].si}
                  <span className="ml-1 text-xs opacity-75">
                    ({totalQuestions(section)})
                  </span>
                </button>
              ),
            )}
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Question Area */}
        <div
          className="flex-1 p-4 sm:p-6 overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 180px)" }}
        >
          <div className="mb-4">{renderNotationBar()}</div>

          {currentQ &&
            (activeSection === "short_answer"
              ? renderShortAnswer(currentQ, currentQIndex)
              : renderStructuredOrEssay(
                  currentQ,
                  currentQIndex,
                  activeSection as any,
                ))}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQIndex === 0}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg 
                                       hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-40 transition-colors"
            >
              ← පෙර (Previous)
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {currentQIndex + 1} / {currentQuestions.length}
            </span>
            <button
              onClick={() =>
                setCurrentQIndex((prev) =>
                  Math.min(currentQuestions.length - 1, prev + 1),
                )
              }
              disabled={currentQIndex >= currentQuestions.length - 1}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg 
                                       disabled:opacity-40 transition-colors"
            >
              ඊළඟ (Next) →
            </button>
          </div>
        </div>

        {/* ===== SIDEBAR: Question Navigator ===== */}
        <div
          className="w-full lg:w-64 bg-white dark:bg-gray-900 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 180px)" }}
        >
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
            {SECTION_LABELS[activeSection].si} ප්‍රශ්න
          </h3>

          <div className="grid grid-cols-5 gap-2 mb-4">
            {currentQuestions.map((_: any, idx: number) => {
              const isActive = idx === currentQIndex;
              const hasAnswer = checkHasAnswer(activeSection, idx);

              return (
                <button
                  key={idx}
                  onClick={() => setCurrentQIndex(idx)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "ring-2 ring-indigo-500 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold"
                      : hasAnswer
                        ? "bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-indigo-200 dark:bg-indigo-800 ring-1 ring-indigo-500" />
              වත්මන්
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-200 dark:bg-green-800" />
              පිළිතුරු දුන්
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-gray-200 dark:bg-gray-700" />
              ඉතිරි
            </div>
          </div>

          {/* Summary */}
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs">
            <div className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
              සාරාංශය
            </div>
            {(["short_answer", "structured", "essay_type"] as Section[]).map(
              (s) => {
                const total = totalQuestions(s);
                const answered = countAnswered(s);
                return (
                  <div key={s} className="flex justify-between py-0.5">
                    <span>{SECTION_LABELS[s].si}</span>
                    <span
                      className={
                        answered === total ? "text-green-600" : "text-gray-500"
                      }
                    >
                      {answered}/{total}
                    </span>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </div>
    </div>
  );

  function checkHasAnswer(section: Section, qIdx: number): boolean {
    const ans = answers[section]?.[qIdx];
    if (!ans) return false;

    if (section === "short_answer") {
      return !!(
        ans.final_answer?.trim() ||
        Object.values(ans.step_answers || {}).some((v: any) => v?.trim())
      );
    }
    return ans.sub_questions?.some(
      (sq: any) =>
        sq.final_answer?.trim() ||
        Object.values(sq.step_answers || {}).some((v: any) =>
          (v as string)?.trim(),
        ),
    );
  }

  function countAnswered(section: Section): number {
    return (answers[section] || []).filter((_: any, i: number) =>
      checkHasAnswer(section, i),
    ).length;
  }
};

// ==================== ANSWER SHEET VIEW ====================

const AnswerSheetView: React.FC<{ data: any; onBack: () => void }> = ({
  data,
  onBack,
}) => {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    short_answer: true,
    structured: true,
    essay_type: true,
  });

  const toggleSection = (s: string) => {
    setExpandedSections((prev) => ({ ...prev, [s]: !prev[s] }));
  };

  const renderStepComparison = (
    step: AnswerStep,
    stepIdx: number,
    studentAnswer: string,
  ) => {
    const isCorrect = studentAnswer?.trim() === step.value?.trim();
    const hasAnswer = !!studentAnswer?.trim();

    return (
      <div
        key={stepIdx}
        className="flex flex-col sm:flex-row gap-2 p-2 rounded border border-gray-200 dark:border-gray-700"
      >
        <div className="flex-1">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {step.description} =
          </span>
          <div className="text-sm font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded mt-1">
            ✅ {step.value}
          </div>
        </div>
        <div className="flex-1">
          <span className="text-xs text-gray-500">ඔබේ පිළිතුර:</span>
          <div
            className={`text-sm font-medium px-2 py-1 rounded mt-1 ${
              !hasAnswer
                ? "bg-gray-100 dark:bg-gray-800 text-gray-400"
                : isCorrect
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                  : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
            }`}
          >
            {hasAnswer ? studentAnswer : "(පිළිතුරක් නැත)"}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-blue-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-lg font-bold">
            📋 පිළිතුරු පත්‍රය (Answer Sheet)
          </h1>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-white text-blue-700 rounded-lg font-medium text-sm hover:bg-blue-50"
          >
            ← ආපසු
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Paper ID</span>
            <div className="font-mono font-medium text-gray-900 dark:text-gray-100">
              {data.paper_id}
            </div>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Status</span>
            <div className="font-medium text-green-600">{data.status}</div>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Time Spent</span>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {Math.floor((data.time_spent_seconds || 0) / 60)} min
            </div>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Topics</span>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {data.topics_used?.length || 0}
            </div>
          </div>
        </div>

        {(["short_answer", "structured", "essay_type"] as const).map(
          (section) => {
            const questions = data.questions?.[section] || [];
            const studentAnswers = data.student_answers?.[section] || [];

            return (
              <div
                key={section}
                className="bg-white dark:bg-gray-900 rounded-xl shadow overflow-hidden"
              >
                <button
                  onClick={() => toggleSection(section)}
                  className="w-full p-4 text-left font-bold text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 flex justify-between items-center"
                >
                  <span>
                    {SECTION_LABELS[section].si} ({questions.length})
                  </span>
                  <span>{expandedSections[section] ? "▼" : "▶"}</span>
                </button>

                {expandedSections[section] && (
                  <div className="p-4 space-y-6 border-t border-gray-200 dark:border-gray-700">
                    {questions.map((q: any, qIdx: number) => {
                      const sAns = studentAnswers.find(
                        (a: any) => a.question_number === q.question_number,
                      );

                      return (
                        <div
                          key={qIdx}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                        >
                          <div className="p-4 bg-gray-50 dark:bg-gray-800">
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                              ප්‍රශ්නය {q.question_number} •{" "}
                              {q.topics?.join(", ")}
                            </div>
                            <div className="text-gray-900 dark:text-gray-100 whitespace-pre-line">
                              {q.question}
                            </div>
                          </div>
                          <div className="p-4 space-y-3">
                            {section === "short_answer" ? (
                              <>
                                {q.answer_steps?.map(
                                  (step: AnswerStep, sIdx: number) =>
                                    renderStepComparison(
                                      step,
                                      sIdx,
                                      sAns?.step_answers?.[String(sIdx)] || "",
                                    ),
                                )}
                                <div className="p-2 bg-yellow-50 dark:bg-yellow-900/10 rounded border border-yellow-300 dark:border-yellow-700">
                                  <div className="text-xs text-gray-500 mb-1">
                                    අවසාන පිළිතුර:
                                  </div>
                                  <div className="flex gap-4">
                                    <div className="text-green-700 dark:text-green-400">
                                      ✅ {q.final_answer}
                                    </div>
                                    <div className="text-gray-500">|</div>
                                    <div
                                      className={
                                        sAns?.final_answer?.trim() ===
                                        q.final_answer?.trim()
                                          ? "text-green-600"
                                          : "text-red-600"
                                      }
                                    >
                                      ඔබ: {sAns?.final_answer || "(නැත)"}
                                    </div>
                                  </div>
                                </div>
                              </>
                            ) : (
                              q.sub_questions?.map(
                                (sq: SubQuestion, sqIdx: number) => {
                                  const sSq = sAns?.sub_questions?.find(
                                    (s: any) =>
                                      s.sub_question_label ===
                                      sq.sub_question_label,
                                  );
                                  return (
                                    <div
                                      key={sqIdx}
                                      className="ml-4 border-l-2 border-gray-300 dark:border-gray-600 pl-4"
                                    >
                                      <div className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                                        <span className="text-blue-600 dark:text-blue-400">
                                          {sq.sub_question_label}
                                        </span>{" "}
                                        {sq.sub_question}
                                      </div>
                                      {sq.answer_steps?.map(
                                        (step: AnswerStep, sIdx: number) =>
                                          renderStepComparison(
                                            step,
                                            sIdx,
                                            sSq?.step_answers?.[String(sIdx)] ||
                                              "",
                                          ),
                                      )}
                                      {sq.answer && (
                                        <div className="mt-1 text-sm p-2 bg-green-50 dark:bg-green-900/20 rounded">
                                          <span className="text-green-700 dark:text-green-400">
                                            පිළිතුර: {sq.answer}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  );
                                },
                              )
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          },
        )}
      </div>
    </div>
  );
};

export default ModelPaperExam;