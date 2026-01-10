export interface Question {
  id: string;
  text: string; // Sinhala text
  expression: string; // Math expression (TeX/KaTeX)
  answer?: string;
}

export interface QuestionResponse {
  question: Question;
  metadata?: {
    generatedAt: string;
    difficulty?: 'easy' | 'medium' | 'hard';
  };
}

export interface ApiError {
  message: string;
  code?: string | number;
}
