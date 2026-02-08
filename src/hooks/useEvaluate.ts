import { useState, useCallback } from 'react';
import { evaluateService } from '../services/evaluateService';

export const useEvaluate = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const evaluateBatch = useCallback(async (data: any) => {
        setLoading(true);
        try {
            const response = await evaluateService.evaluateBatch(data);
            return response.data; // Assumes response.data is the result
        } catch (err: any) {
            setError(err.message || 'Evaluation failed');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { evaluateBatch, loading, error };
};
