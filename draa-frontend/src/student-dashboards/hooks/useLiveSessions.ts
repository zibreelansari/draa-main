import { useState, useEffect, useCallback } from'react';
import axios from'axios';
import url from'../../url';

export interface LiveSession {
  _id: string;
  topic: string;
  startTime: string;
  duration: number;
  createdBy: string;
  description?: string;
  joinUrl: string;
}

export const useLiveSessions = () => {
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLiveSessions = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await axios.get<any>(`${url}/live-sessions`);
      const sessions = Array.isArray(resp.data) ? resp.data : (resp.data.meetings || []);
      setLiveSessions(sessions);
    } catch (err: any) {
      setError(err.message ||"Failed to fetch live sessions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveSessions();
  }, [fetchLiveSessions]);

  return { liveSessions, loading, error, refresh: fetchLiveSessions };
};
