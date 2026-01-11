const API_BASE_URL = process.env.REACT_APP_MATH_API_URL || 'http://localhost:8000';

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
    baseUrl: string;

    constructor(baseUrl = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    async request(endpoint: string, options: any = {}) {
        const url = `${this.baseUrl}${endpoint}`;

        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const config = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new APIError(
                    errorData.detail || `HTTP Error: ${response.status}`,
                    response.status,
                    errorData
                );
            }

            return await response.json();
        } catch (error: any) {
            if (error instanceof APIError) {
                throw error;
            }
            throw new APIError(
                error.message || 'Network error - Is the backend running?',
                0,
                { originalError: error }
            );
        }
    }

    async checkHealth() {
        return this.request('/health');
    }

    async generateQuestions({
        topic = 'වාරික ගණනය',
        difficulty = 'medium',
        numQuestions = 5,
    } = {}) {
        return this.request('/generate', {
            method: 'POST',
            body: JSON.stringify({
                topic,
                difficulty,
                num_questions: numQuestions,
            }),
        });
    }

    async getTopics() {
        return this.request('/topics');
    }

    async evaluateQuiz(questions: any) {
        return this.request('/evaluate/quiz', {
            method: 'POST',
            body: JSON.stringify({ questions }),
        });
    }
}

export const mathGenService = new MathQuestionAPI();
