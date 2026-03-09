import { useState, useCallback } from "react";
import { stressService } from "../services/stressService";

export const useStress = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startStress = useCallback(async (username: string, email: string) => {
    setLoading(true);
    setError(null);

    try {
      const data = await stressService.start(username, email);
      return data;
    } catch (err: any) {
      setError(err?.message || "Failed to start stress detection");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const stopStress = useCallback(async (username: string) => {
    setLoading(true);
    setError(null);

    try {
      const data = await stressService.stop(username);
      return data;
    } catch (err: any) {
      setError(err?.message || "Failed to stop stress detection");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getStatus = useCallback(async (username: string) => {
    try {
      const data = await stressService.status(username);
      return data;
    } catch (err: any) {
      setError(err?.message || "Failed to fetch stress status");
      throw err;
    }
  }, []);

  const sendEmotion = useCallback(async (data: any) => {
    try {
      const res = await stressService.emotion(data);
      return res;
    } catch (err: any) {
      setError(err?.message || "Failed to send emotion data");
      throw err;
    }
  }, []);

  const skipQuestion = useCallback(async (data: any) => {
    try {
      const res = await stressService.skipQuestion(data);
      return res;
    } catch (err: any) {
      setError(err?.message || "Failed to record skipped question");
      throw err;
    }
  }, []);

  return {
    startStress,
    stopStress,
    getStatus,
    sendEmotion,
    skipQuestion,
    loading,
    error,
  };
};