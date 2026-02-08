import { useState, useCallback } from 'react';
import { badgeService } from '../services/badgeService';

export const useBadges = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getAllBadges = useCallback(async () => {
        setLoading(true);
        try {
            const response = await badgeService.getAll();
            return response.data;
        } catch (err: any) {
            setError(err.message || 'Failed to fetch badges');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getMyBadges = useCallback(async () => {
        setLoading(true);
        try {
            const response = await badgeService.getMyBadges();
            return response.data;
        } catch (err: any) {
            setError(err.message || 'Failed to fetch my badges');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { getAllBadges, getMyBadges, loading, error };
};
