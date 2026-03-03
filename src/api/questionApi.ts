import { apiClient } from './client';

export const DifficultyLevel = {
  Easy: "easy",
  Medium: "medium",
  Hard: "hard"
} as const;

export type DifficultyLevel = typeof DifficultyLevel[keyof typeof DifficultyLevel];

export interface QuestionRequest {
  topic: string;
  difficulty: DifficultyLevel;
  num_questions: number;
}

export interface Question {
  question: string;
  solution: string;
  answer: string;
}

export interface QuestionResponse {
  success: boolean;
  topic: string;
  difficulty: string;
  questions: Question[];
  count: number;
  requested: number;
  generation_time_seconds: number;
  model_used: string;
  rag_context_used: boolean;
}

// ==================== Topic Notation Config ====================

export interface MathTopic {
  sinhala: string;
  english: string;
}

export interface MathNotation {
  symbol: string;
  label: string;
}

/**
 * Common notations shared across all topics
 */
export const COMMON_NOTATIONS: MathNotation[] = [
  { symbol: "+", label: "+" },
  { symbol: "-", label: "-" },
  { symbol: "×", label: "×" },
  { symbol: "÷", label: "÷" },
  { symbol: "=", label: "=" },
  { symbol: "(", label: "(" },
  { symbol: ")", label: ")" },
  { symbol: ",", label: "," },
  { symbol: ".", label: "." },
];

/**
 * Topic-specific notations that get appended to common notations.
 * Key = Sinhala topic name (matches API topic field).
 */
export const TOPIC_NOTATIONS: Record<string, MathNotation[]> = {
  "පොළිය": [
    { symbol: "රු.", label: "රු." },
    { symbol: "%", label: "%" },
    { symbol: "/", label: "/" },
  ],
  "සමීකරණ": [
    { symbol: "x", label: "x" },
    { symbol: "y", label: "y" },
    { symbol: "²", label: "²" },
    { symbol: "³", label: "³" },
    { symbol: "√", label: "√" },
    { symbol: "±", label: "±" },
  ],
  "කොටස් වෙළෙඳපොළ": [
    { symbol: "රු.", label: "රු." },
    { symbol: "%", label: "%" },
    { symbol: "/", label: "/" },
  ],
  "ලඝුගණක": [
    { symbol: "log", label: "log" },
    { symbol: "lg", label: "lg" },
    { symbol: "²", label: "²" },
    { symbol: "³", label: "³" },
    { symbol: "√", label: "√" },
    { symbol: "¹", label: "¹" },
    { symbol: "⁻", label: "⁻" },
    { symbol: "̄", label: " ̄" },  // overline for negative characteristic
    { symbol: "^", label: "^" },
  ],
  "ශ්‍රීඝ්‍රතාවය": [
    { symbol: "km", label: "km" },
    { symbol: "m", label: "m" },
    { symbol: "s", label: "s" },
    { symbol: "h", label: "h" },
    { symbol: "/", label: "/" },
  ],
  "සමාන්තර ශ්‍රේණි": [
    { symbol: "a", label: "a" },
    { symbol: "d", label: "d" },
    { symbol: "n", label: "n" },
    { symbol: "T", label: "T" },
    { symbol: "S", label: "S" },
    { symbol: "l", label: "l" },
    { symbol: "₁", label: "₁" },
    { symbol: "₂", label: "₂" },
    { symbol: "ₙ", label: "ₙ" },
  ],
};

/**
 * Returns the full notation set for a given topic:
 * common notations + topic-specific notations.
 */
export function getNotationsForTopic(topic: string): MathNotation[] {
  const topicSpecific = TOPIC_NOTATIONS[topic] || [];
  return [...COMMON_NOTATIONS, ...topicSpecific];
}

// ==================== Step Parsing ====================

/**
 * Represents a single parsed step from the solution text.
 *
 * - `type: "readonly"` → The step header / description line. Display only.
 * - `type: "input"` → A sub-step with a description and expected answer.
 *   The student sees the description and types the answer.
 */
export interface ParsedStep {
  type: "readonly" | "input";
  /** Full original line text (for reference / display fallback) */
  raw: string;
  /** Step group number (e.g. 1, 2, 3 for පියවර 1, 2, 3) */
  stepNumber: number;
  /**
   * For readonly: the header text, e.g. "පියවර 1: මාසික පොලී අනුපාතිකය සොයා ගැනීම."
   * For input: the left-hand description, e.g. "වාර්ෂික පොලී අනුපාතිකය"
   */
  description: string;
  /**
   * For input: the expected answer (right side of '='), e.g. "12%"
   * For readonly: empty string.
   */
  expectedAnswer: string;
}

/**
 * Parses a solution string (as returned by the API) into structured steps.
 *
 * Rules:
 * - Lines starting with "පියවර" are readonly headers.
 * - Lines containing "=" are input steps — split at the FIRST "=" to get
 *   description (left) and expectedAnswer (right).
 * - Blank lines or double \n separate step groups.
 * - Other non-empty lines are readonly descriptions within the current step.
 */
export function parseSolutionSteps(solution: string): ParsedStep[] {
  if (!solution) return [];

  const steps: ParsedStep[] = [];
  let currentStepNumber = 0;

  // Normalize: the API sometimes returns literal "\n" (escaped) inside JSON strings.
  // JSON.parse already handles this, but just in case:
  const lines = solution.split("\n").map((l) => l.trim());

  for (const line of lines) {
    if (!line) continue; // skip blank lines

    // Check if this is a step header line
    const stepHeaderMatch = line.match(/^පියවර\s*(\d+)\s*[:\uff1a]/);
    if (stepHeaderMatch) {
      currentStepNumber = parseInt(stepHeaderMatch[1], 10);
      steps.push({
        type: "readonly",
        raw: line,
        stepNumber: currentStepNumber,
        description: line,
        expectedAnswer: "",
      });
      continue;
    }

    // Check if this line has an "=" (input step)
    if (line.includes("=")) {
      // Split at first "=" only
      const eqIndex = line.indexOf("=");
      const left = line.substring(0, eqIndex).trim();
      const right = line.substring(eqIndex + 1).trim();

      // If the right side is non-empty, this is an input step
      if (right) {
        steps.push({
          type: "input",
          raw: line,
          stepNumber: currentStepNumber || 1,
          description: left,
          expectedAnswer: right,
        });
      } else {
        // Just "something =" with nothing after — still readonly
        steps.push({
          type: "readonly",
          raw: line,
          stepNumber: currentStepNumber || 1,
          description: line,
          expectedAnswer: "",
        });
      }
      continue;
    }

    // Otherwise it's a plain description line (readonly)
    steps.push({
      type: "readonly",
      raw: line,
      stepNumber: currentStepNumber || 1,
      description: line,
      expectedAnswer: "",
    });
  }

  return steps;
}

// ==================== API Calls ====================

export async function generateQuestions(request: QuestionRequest): Promise<QuestionResponse> {
  const { data } = await apiClient.post<QuestionResponse>('/math/generate', request);
  return data;
}