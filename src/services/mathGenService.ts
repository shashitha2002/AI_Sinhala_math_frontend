import apiClient from './apiClient';

export class APIError extends Error {
    status: number;
    data: any;

    constructor(message: string, status: number, data: any) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.data = data;
    }
}

// ==================== Hardcoded Topics ====================

export const MATH_TOPICS = [
    { sinhala: 'පොළිය', english: 'Interest' },
    { sinhala: 'සමීකරණ', english: 'Equations' },
    { sinhala: 'කොටස් වෙළෙඳපොළ', english: 'Stock Market' },
    { sinhala: 'ලඝුගණක', english: 'Logarithms' },
    { sinhala: 'ශ්‍රීඝ්‍රතාවය', english: 'Speed' },
    { sinhala: 'සමාන්තර ශ්‍රේණි', english: 'Arithmetic Progression' },
];

class MathQuestionAPI {
    async generateQuestions({
        topic = 'පොළිය',
        difficulty = 'medium',
        numQuestions = 5,
    } = {}) {
        try {
            const response = await apiClient.post('/math/generate', {
                topic,
                difficulty,
                num_questions: numQuestions,
            });
            return response.data;
        } catch (error: any) {
            this.handleError(error);
        }
    }

    getTopics() {
        return {
            topics: MATH_TOPICS,
            default_questions: 5,
            max_questions: 10,
        };
    }

    async evaluateQuiz(questions: any) {
        try {
            const response = await apiClient.post('/quiz/evaluate/quiz', questions);
            return response.data;
        } catch (error: any) {
            this.handleError(error);
        }
    }

    private handleError(error: any): never {
        if (error.response) {
            throw new APIError(
                error.response.data?.detail || `HTTP Error: ${error.response.status}`,
                error.response.status,
                error.response.data
            );
        }
        throw new APIError(
            error.message || 'Network error - Is the backend running?',
            0,
            { originalError: error }
        );
    }
}

export const mathGenService = new MathQuestionAPI();