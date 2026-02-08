import { useState, useCallback } from 'react';
import { progressService } from '../services/progressService';

export const useProgress = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getDashboard = useCallback(async () => {
        setLoading(true);
        try {
            const response = await progressService.getDashboard();
            return response.data;
        } catch (err: any) {
            setError(err.message || 'Failed to fetch dashboard');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { getDashboard, loading, error };
};
