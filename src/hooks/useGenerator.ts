import { useEffect, useState } from 'react';
import type { Question } from '../types/api';
import { fetchRandomQuestion } from '../api/questionApi';

export type UseGeneratorResult = {
  loading: boolean;
  data: Question | null;
};

export function useGenerator(): UseGeneratorResult {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<Question | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetchRandomQuestion();
        if (mounted) setData(res.question);
      } catch (e) {
        // scaffold: ignore errors
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return { loading, data };
}
