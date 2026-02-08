import { useState, useCallback } from 'react';
import { mathQuizService, type MathQuiz, type QuizHistoryItem, type QuizStats } from '../services/mathQuizService';

export const useMathQuiz = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentQuiz, setCurrentQuiz] = useState<MathQuiz | null>(null);

    /**
     * Save a generated quiz
     */
    const saveQuiz = useCallback(async (quizData: any) => {
        setLoading(true);
        setError(null);
        try {
            const response = await mathQuizService.saveQuiz(quizData);
            if (response.data.success) {
                if (response.data.quizId) {
                    return { id: response.data.quizId, ...quizData };
                }
                return response.data.quiz;
            } else {
                throw new Error(response.data.message || 'Failed to save quiz');
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to save quiz';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Get current in-progress quiz
     */
    const getCurrentQuiz = useCallback(async (topic: string, difficulty: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await mathQuizService.getCurrentQuiz(topic, difficulty);
            if (response.data.success) {
                setCurrentQuiz(response.data.quiz);
                return response.data.quiz;
            } else if (response.data && response.data.id) {
                // Handle Python backend direct response
                setCurrentQuiz(response.data);
                return response.data;
            }
            return null;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to get current quiz';
            setError(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Get quiz by ID
     */
    const getQuizById = useCallback(async (quizId: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await mathQuizService.getQuizById(quizId);
            if (response.data.success) {
                setCurrentQuiz(response.data.quiz);
                return response.data.quiz;
            } else if (response.data && response.data.id) {
                // Handle Python backend direct response
                setCurrentQuiz(response.data);
                return response.data;
            }
            throw new Error('Quiz not found');
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to get quiz';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Start a quiz
     */
    const startQuiz = useCallback(async (quizId: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await mathQuizService.startQuiz(quizId);
            if (response.data.success) {
                return response.data.quiz;
            }
            throw new Error('Failed to start quiz');
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to start quiz';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Submit quiz answers
     */
    const submitQuiz = useCallback(async (quizId: string, userAnswers: any[], evaluationResults: any[]) => {
        setLoading(true);
        setError(null);
        try {
            const response = await mathQuizService.submitQuiz(quizId, {
                userAnswers,
                evaluationResults
            });
            if (response.data.success) {
                return response.data.quiz;
            }
            throw new Error('Failed to submit quiz');
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to submit quiz';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Get quiz history
     */
    const getQuizHistory = useCallback(async (params?: {
        status?: string;
        topic?: string;
        limit?: number;
    }): Promise<QuizHistoryItem[]> => {
        setLoading(true);
        setError(null);
        try {
            const response = await mathQuizService.getQuizHistory(params);
            if (response.data.success) {
                return response.data.quizzes || response.data.history || [];
            }
            return [];
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to get quiz history';
            setError(errorMessage);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Get quiz statistics
     */
    const getQuizStats = useCallback(async (): Promise<QuizStats | null> => {
        setLoading(true);
        setError(null);
        try {
            const response = await mathQuizService.getQuizStats();
            if (response.data.success) {
                return response.data.stats;
            }
            return null;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to get quiz stats';
            setError(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Delete a quiz
     */
    const deleteQuiz = useCallback(async (quizId: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await mathQuizService.deleteQuiz(quizId);
            if (response.data.success) {
                return true;
            }
            throw new Error('Failed to delete quiz');
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to delete quiz';
            setError(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        currentQuiz,
        saveQuiz,
        getCurrentQuiz,
        getQuizById,
        startQuiz,
        submitQuiz,
        getQuizHistory,
        getQuizStats,
        deleteQuiz,
        setError
    };
};
