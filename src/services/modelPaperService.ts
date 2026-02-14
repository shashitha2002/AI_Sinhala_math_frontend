import apiClient from './apiClient';

// ==================== TypeScript Interfaces ====================

export interface AnswerStep {
    description: string;
    value: string;
}

export interface ShortAnswerQuestion {
    question_number: number;
    question: string;
    topics: string[];
    answer_steps: AnswerStep[];
    final_answer?: string;
}

export interface SubQuestion {
    sub_question_label: string;
    sub_question: string;
    answer_steps: AnswerStep[];
    answer?: string;
}

export interface StructuredQuestion {
    question_number: number;
    question: string;
    topics: string[];
    sub_questions: SubQuestion[];
}

export interface EssayQuestion {
    question_number: number;
    question: string;
    topics: string[];
    sub_questions: SubQuestion[];
}

export interface GenerationResponse {
    success: boolean;
    type: string;
    questions: any[];
    count: number;
    requested: number;
    topics_used: string[];
    generation_time_seconds: number;
}

export interface TopicsResponse {
    available_topics: string[];
    total_topics: number;
    questions_by_topic: { [key: string]: number };
    questions_by_type: { [key: string]: number };
}

export interface FullPaperResponse {
    success: boolean;
    paper_id: string;
    generated_at: string;
    questions: {
        short_answer: ShortAnswerQuestion[];
        structured: StructuredQuestion[];
        essay_type: EssayQuestion[];
    };
    summary: {
        short_answer: { requested: number; generated: number };
        structured: { requested: number; generated: number };
        essay_type: { requested: number; generated: number };
    };
    topics_used: string[];
    generation_time_seconds: number;
}

// ==================== API Service Functions ====================

/**
 * Get available topics from the backend
 */
export const getAvailableTopics = async (): Promise<TopicsResponse> => {
    const response = await apiClient.get('/model-paper/topics');
    return response.data;
};

/**
 * Generate short answer questions
 */
export const generateShortAnswer = async (
    count: number = 5,
    topics?: string[]
): Promise<GenerationResponse> => {
    const response = await apiClient.post('/model-paper/generate/short-answer', {
        count,
        topics
    });
    return response.data;
};

/**
 * Generate structured questions with sub-questions
 */
export const generateStructured = async (
    count: number = 3,
    topics?: string[]
): Promise<GenerationResponse> => {
    const response = await apiClient.post('/model-paper/generate/structured', {
        count,
        topics
    });
    return response.data;
};

/**
 * Generate essay type questions with real-life scenarios
 */
export const generateEssay = async (
    count: number = 2,
    topics?: string[]
): Promise<GenerationResponse> => {
    const response = await apiClient.post('/model-paper/generate/essay', {
        count,
        topics
    });
    return response.data;
};

/**
 * Generate a complete model paper with all question types
 * Warning: This can take 5-10 minutes
 */
export const generateFullPaper = async (
    shortAnswerCount: number = 25,
    structuredCount: number = 5,
    essayCount: number = 10
): Promise<FullPaperResponse> => {
    const response = await apiClient.post('/model-paper/generate/full-paper', {
        short_answer_count: shortAnswerCount,
        structured_count: structuredCount,
        essay_count: essayCount
    });
    return response.data;
};

/**
 * Check if the model paper generator is initialized
 */
export const checkStatus = async (): Promise<{
    initialized: boolean;
    past_papers_loaded: boolean;
    available_topics: string[];
    total_topics: number;
}> => {
    const response = await apiClient.get('/model-paper/status');
    return response.data;
};

export default {
    getAvailableTopics,
    generateShortAnswer,
    generateStructured,
    generateEssay,
    generateFullPaper,
    checkStatus
};
