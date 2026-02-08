import apiClient from './apiClient';

export interface MathQuizQuestion {
    question: string;
    answer: string;
    solution: string;
    steps: {
        header: string;
        description: string;
        calculation: string;
        answer: string;
    }[];
    rag_context_used?: boolean;
}

export interface UserAnswer {
    stepAnswers: string[];
    finalAnswer: string;
    timeSpent: number;
    marksObtained?: number;
    isCorrect?: boolean;
    feedback?: string;
    explanation?: string;
}

export interface MathQuiz {
    id: string;
    topic: string;
    topicEnglish?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    questions: MathQuizQuestion[];
    userAnswers?: UserAnswer[];
    status: 'not-started' | 'in-progress' | 'completed' | 'abandoned';
    timeStarted?: Date;
    timeCompleted?: Date;
    totalTimeSpent?: number;
    score?: {
        totalQuestions: number;
        correctAnswers: number;
        totalMarks: number;
        obtainedMarks: number;
        percentage: number;
    };
    rag_context_used?: boolean;
    createdAt: Date;
}

export interface QuizHistoryItem {
    id: string;
    topic: string;
    topicEnglish?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    status: string;
    score?: {
        totalQuestions: number;
        correctAnswers: number;
        percentage: number;
    };
    questionsCount: number;
    timeStarted?: Date;
    timeCompleted?: Date;
    totalTimeSpent?: number;
    createdAt: Date;
}

export interface QuizStats {
    totalQuizzes: number;
    averageScore: number;
    totalTimeSpent: number;
    totalQuestions: number;
    totalCorrect: number;
}

export const mathQuizService = {
    /**
     * Save a generated quiz to the database
     */
    saveQuiz: (quizData: {
        topic: string;
        topicEnglish?: string;
        difficulty: 'easy' | 'medium' | 'hard';
        questions: MathQuizQuestion[];
        rag_context_used?: boolean;
    }) => apiClient.post('/math-quiz/save', quizData),

    /**
     * Get current in-progress quiz for a topic/difficulty
     */
    getCurrentQuiz: (topic: string, difficulty: string) =>
        apiClient.get(`/math-quiz/current?topic=${encodeURIComponent(topic)}&difficulty=${difficulty}`),

    /**
     * Get quiz by ID
     */
    getQuizById: (quizId: string) =>
        apiClient.get(`/math-quiz/${quizId}`),

    /**
     * Mark quiz as started
     */
    startQuiz: (quizId: string) =>
        apiClient.put(`/math-quiz/${quizId}/start`),

    /**
     * Submit quiz answers
     */
    submitQuiz: (quizId: string, data: {
        userAnswers: UserAnswer[];
        evaluationResults: any[];
    }) => apiClient.put(`/math-quiz/${quizId}/submit`, data),

    /**
     * Get quiz history
     */
    getQuizHistory: (params?: {
        status?: string;
        topic?: string;
        limit?: number;
    }) => {
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.append('status', params.status);
        if (params?.topic) queryParams.append('topic', params.topic);
        if (params?.limit) queryParams.append('limit', params.limit.toString());

        const queryString = queryParams.toString();
        return apiClient.get(`/math-quiz/history/all${queryString ? `?${queryString}` : ''}`);
    },

    /**
     * Get quiz statistics
     */
    getQuizStats: () =>
        apiClient.get('/math-quiz/stats/summary'),

    /**
     * Delete a quiz (only if not completed)
     */
    deleteQuiz: (quizId: string) =>
        apiClient.delete(`/math-quiz/${quizId}`)
};
