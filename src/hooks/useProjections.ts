import { useState, useCallback } from 'react';
import { projectionService } from '../services/projectionService';

export const useProjections = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const runProjection = useCallback(async (params: any) => {
        setLoading(true);
        try {
            const response = await projectionService.runProjection(params);
            return response.data;
        } catch (err: any) {
            setError(err.message || 'Failed to run projection');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { runProjection, loading, error };
};
