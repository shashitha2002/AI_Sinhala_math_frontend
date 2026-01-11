import { useState, useCallback } from 'react';
import { mathGenService } from '../services/mathGenService';

export const useMathGen = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateQuestions = useCallback(async (params?: any) => {
        setLoading(true);
        setError(null);
        try {
            const data = await mathGenService.generateQuestions(params);
            return data;
        } catch (err: any) {
            setError(err.message || 'Failed to generate questions');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getTopics = useCallback(async () => {
        setLoading(true);
        try {
            const data = await mathGenService.getTopics();
            return data;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        generateQuestions,
        getTopics,
        loading,
        error
    };
};
