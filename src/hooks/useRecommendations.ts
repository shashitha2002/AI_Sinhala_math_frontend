import { useState, useCallback } from 'react';
import { recommendationService } from '../services/recommendationService';

export const useRecommendations = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getAdaptiveRecommendations = useCallback(async (includeXAI = true) => {
        setLoading(true);
        try {
            const response = await recommendationService.getAdaptive(includeXAI);
            return response.data;
        } catch (err: any) {
            setError(err.message || 'Failed to fetch recommendations');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { getAdaptiveRecommendations, loading, error };
};
