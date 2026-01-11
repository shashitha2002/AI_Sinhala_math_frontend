import { useState, useCallback } from 'react';
import { gameService } from '../services/gameService';

export const useGames = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getStats = useCallback(async () => {
        setLoading(true);
        try {
            const response = await gameService.getStats();
            return response.data;
        } catch (err: any) {
            setError(err.message || 'Failed to fetch game stats');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const saveGamePlay = useCallback(async (data: any) => {
        setLoading(true);
        try {
            const response = await gameService.play(data);
            return response.data;
        } catch (err: any) {
            setError(err.message || 'Failed to save game play');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { getStats, saveGamePlay, loading, error };
};
