import { useState, useCallback } from 'react';
import { stressService } from '../services/stressService';

export const useStress = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const analyzeStress = useCallback(async (data: any) => {
        setLoading(true);
        try {
            const response = await stressService.analyze(data);
            return response.data;
        } catch (err: any) {
            setError(err.message || 'Failed to analyze stress');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { analyzeStress, loading, error };
};
