import { useState, useCallback } from 'react';
import { quizService } from '../services/quizService';

export const useQuiz = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateQuiz = useCallback(async (params: any) => {
        setLoading(true);
        try {
            const response = await quizService.generate(params);
            return response.data;
        } catch (err: any) {
            setError(err.message || 'Failed to generate quiz');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getQuizById = useCallback(async (id: string) => {
        setLoading(true);
        try {
            const response = await quizService.getById(id);
            return response.data;
        } catch (err: any) {
            setError(err.message || 'Failed to fetch quiz');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const submitQuiz = useCallback(async (data: any) => {
        setLoading(true);
        try {
            const response = await quizService.submit(data);
            return response.data;
        } catch (err: any) {
            setError(err.message || 'Failed to submit quiz');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getTopics = useCallback(async (params: any) => {
        setLoading(true);
        try {
            const response = await quizService.getTopics(params);
            return response.data;
        } catch (err: any) {
            setError(err.message || 'Failed to fetch topics');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        generateQuiz,
        getQuizById,
        submitQuiz,
        getTopics,
        loading,
        error
    };
};
