import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const api = axios.create({
    baseURL: `${API_BASE}/model-paper`,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
    const headers = getAuthHeader();
    Object.assign(config.headers, headers);
    return config;
});

// ==================== Types ====================

export interface GenerateFullPaperRequest {
    short_answer_count?: number;
    structured_count?: number;
    essay_count?: number;
}

export interface ShortAnswerAnswer {
    question_number: number;
    step_answers: Record<string, string>; // {"0": "answer", "1": "answer"}
    final_answer: string;
}

export interface SubQuestionAnswer {
    sub_question_label: string;
    step_answers: Record<string, string>;
    final_answer: string;
}

export interface StructuredAnswer {
    question_number: number;
    sub_questions: SubQuestionAnswer[];
}

export interface SubmitPaperRequest {
    paper_id: string;
    time_spent_seconds: number;
    answers: {
        short_answer: ShortAnswerAnswer[];
        structured: StructuredAnswer[];
        essay_type: StructuredAnswer[];
    };
}

export interface AnswerStep {
    description: string;
    value: string;
}

export interface SubQuestion {
    sub_question_label: string;
    sub_question: string;
    answer_steps: AnswerStep[];
    answer?: string;
}

export interface ShortAnswerQuestion {
    question_number: number;
    question: string;
    topics: string[];
    answer_steps: AnswerStep[];
    final_answer?: string;
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

export interface ModelPaper {
    _id: string;
    paper_id: string;
    generated_at: string;
    status: 'generated' | 'in_progress' | 'submitted' | 'evaluated';
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
    student_answers?: any;
    score?: any;
    time_taken_seconds?: number;
    submitted_at?: string;
}

export interface PaperListItem {
    _id: string;
    paper_id: string;
    generated_at: string;
    status: string;
    summary: {
        short_answer: { requested: number; generated: number };
        structured: { requested: number; generated: number };
        essay_type: { requested: number; generated: number };
    };
    topics_used: string[];
    generation_time_seconds: number;
    time_taken_seconds?: number;
    submitted_at?: string;
}

// ==================== Service ====================

export const modelPaperService = {
    /**
     * Generate a full model paper.
     * Paper is saved to MongoDB and returned with answers.
     */
    generateFullPaper: async (request: GenerateFullPaperRequest = {}) => {
        const { data } = await api.post('/generate/full-paper', {
            short_answer_count: request.short_answer_count || 25,
            structured_count: request.structured_count || 5,
            essay_count: request.essay_count || 5,
        });
        return data;
    },

    generateSample: async () => {
        const {data} = await api.get('/sample-output')
        return data;
    },

    /**
     * Start the exam - returns questions WITHOUT answers.
     * Updates paper status to 'in_progress'.
     */
    startPaper: async (paperId: string) => {
        const { data } = await api.post('/start', { paper_id: paperId });
        return data;
    },

    /**
     * Save progress periodically (auto-save).
     * Does NOT mark the paper as submitted.
     */
    saveProgress: async (request: SubmitPaperRequest) => {
        const { data } = await api.post('/save-progress', request);
        return data;
    },

    /**
     * Submit final answers. Marks paper as 'submitted'. Cannot be undone.
     */
    submitPaper: async (request: SubmitPaperRequest) => {
        const { data } = await api.post('/submit', request);
        return data;
    },

    /**
     * Get answer sheet after submission.
     * Returns questions WITH correct answers + student answers.
     */
    getAnswerSheet: async (paperId: string) => {
        const { data } = await api.get(`/answer-sheet/${paperId}`);
        return data;
    },

    /**
     * Get list of user's papers (without questions for performance).
     */
    getMyPapers: async (limit: number = 10, skip: number = 0) => {
        const { data } = await api.get('/my-papers', { params: { limit, skip } });
        return data;
    },

    /**
     * Get a specific paper by ID (includes questions).
     */
    getPaperById: async (paperId: string) => {
        const { data } = await api.get(`/papers/${paperId}`);
        return data;
    },

    /**
     * Initialize all generators (usually auto-done).
     */
    initialize: async () => {
        const { data } = await api.post('/initialize');
        return data;
    },

    /**
     * Get generator status.
     */
    getStatus: async () => {
        const { data } = await api.get('/status');
        return data;
    },

    /**
     * Get available topics.
     */
    getTopics: async () => {
        const { data } = await api.get('/topics');
        return data;
    },
};