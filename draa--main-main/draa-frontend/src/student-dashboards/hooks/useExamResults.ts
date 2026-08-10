import { useState, useEffect, useCallback } from'react';
import uri from'../../url';

export interface TestAttempt {
  id: string;
  testTitle: string;
  testId: string;
  status:'completed' |'ongoing' |'submitted';
  startTime: string;
  endTime: string;
  score: number;
  percentage: number;
  rank: number;
}

export interface ResultsStats {
  totalAttempts: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  totalTimeSpent: number;
  passedTests: number;
  failedTests: number;
}

export const useExamResults = (studentId?: string, pageSize: number = 10) => {
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchResults = useCallback(async (page: number = 1) => {
    console.log(' fetchResults called:', { studentId, page, pageSize });

    if (!studentId) {
      console.log(' fetchResults aborted: studentId missing');
      return;
    }

    try {
      setLoading(true);
      const token = (() => {
        try {
          const edudocsData = localStorage.getItem("edudocs");
          const token = edudocsData ? JSON.parse(edudocsData)?.token : null;
          console.log(' Token found:', !!token);
          return token;
        } catch (e) { 
          console.error(' Error parsing token:', e);
          return null; 
        }
      })();

      const endpoint = `${uri}/student/test-series/attempt/user/${studentId}/attempts?limit=${pageSize}&page=${page}`;
      console.log(' Fetching from:', endpoint);

      const response = await fetch(endpoint, { 
        method:"GET", 
        headers: { 
"Content-Type":"application/json", 
          ...(token ? { Authorization: `Bearer ${token}` } : {}) 
        } 
      });

      console.log(' Response status:', response.status);
      const data = await response.json();
      console.log(' Received data:', data);

      if (data.success) {
        setAttempts(data.attempts || []);
        setTotalAttempts(data.totalAttempts || 0);
        setTotalPages(data.totalPages || 1);
      } else {
        throw new Error(data.message ||'Failed to load results');
      }
    } catch (err: any) {
      console.error(' fetchResults Error:', err);
      setError(err.message ||'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  }, [studentId, pageSize]);

  const calculateStats = useCallback((attemptsList: TestAttempt[]): ResultsStats => {
    if (attemptsList.length === 0) {
      return { totalAttempts: 0, averageScore: 0, highestScore: 0, lowestScore: 0, totalTimeSpent: 0, passedTests: 0, failedTests: 0 };
    }
    const scores = attemptsList.map(a => a.percentage || 0);
    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    const avgScore = totalScore / scores.length;
    const highScore = Math.max(...scores);
    const lowScore = Math.min(...scores);
    const passed = attemptsList.filter(a => (a.percentage || 0) >= 40).length;
    const failed = attemptsList.length - passed;
    
    return {
      totalAttempts: totalAttempts || attemptsList.length,
      averageScore: avgScore,
      highestScore: highScore,
      lowestScore: lowScore,
      totalTimeSpent: 0, // Backend might not provide this directly per list call
      passedTests: passed,
      failedTests: failed
    };
  }, [totalAttempts]);

  useEffect(() => {
    fetchResults(currentPage);
  }, [fetchResults, currentPage]);

  return { attempts, totalAttempts, totalPages, loading, error, currentPage, setCurrentPage, refresh: fetchResults, calculateStats };
};
