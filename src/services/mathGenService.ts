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

class MathQuestionAPI {
    async generateQuestions({
        topic = 'වාරික ගණනය',
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

    async getTopics() {
        try {
            const response = await apiClient.get('/math/topics');
            return response.data;
        } catch (error: any) {
            this.handleError(error);
        }
    }

    async evaluateQuiz(questions: any) {
        try {
            const response = await apiClient.post('/quiz/evaluate/quiz', questions);
            return response.data;
        } catch (error: any) {
            this.handleError(error);
        }
    }

    private handleError(error: any) {
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
