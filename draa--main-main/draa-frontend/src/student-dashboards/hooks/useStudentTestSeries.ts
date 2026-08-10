import { useState, useEffect, useCallback } from'react';
import toast from '../../utils/toast';
import uri from'../../url';

export interface PurchasedTopic {
  purchaseId: string;
  type:"category" |"subject";
  topicId: string;
  topic: {
    name: string;
    code: string;
    description: string;
    subject?: string;
    examination?: string;
  };
  purchaseDate: string;
  amountPaid: number;
  accessGranted: boolean;
  validityUntil?: string;
  totalTests: number;
  testsAttempted: number;
  testsCompleted: number;
  totalTimeSpent: number;
}

export interface TestSeries {
  _id: string;
  title: string;
  description?: string;
  testType: string;
  difficulty:"beginner" |"intermediate" |"advanced";
  duration: number;
  totalQuestions: number;
  totalMarks: number;
  maxAttempts: number;
  isPaid: boolean;
  isActive: boolean;
  status: string;
  seriesNumber?: number;
}

export const useStudentTestSeries = (studentId?: string, token?: string) => {
  const [purchasedTopics, setPurchasedTopics] = useState<PurchasedTopic[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPurchases = useCallback(async (filters: { exam?: string; subject?: string; search?: string } = {}) => {
    console.log(' fetchPurchasedTopics called with:', { studentId, hasToken: !!token });

    if (!studentId || studentId ==='undefined' || !token) {
      console.log(' fetchPurchases aborted: studentId or token missing or invalid');
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit:"50",
        ...(filters.exam && filters.exam !=='all' && { exam: filters.exam }),
        ...(filters.subject && filters.subject !=='all' && { subject: filters.subject }),
        ...(filters.search && { search: filters.search })
      });

      const endpoint = `${uri}/test-series-enrollment/purchase/my-purchases/${studentId}?${params.toString()}`;
      console.log(' Fetching from:', endpoint);

      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log(' Response status:', res.status);
      const data = await res.json();
      console.log(' Received data:', data);

      if (data.success) {
        const mapped = (data.purchases || []).map((p: any) => ({
          purchaseId: p.enrollmentId,
          type: p.type,
          topicId: p.item.id,
          topic: {
            name: p.item.name,
            code: p.item.code,
            description: p.item.description,
            subject: p.item.subject ||"N/A",
            examination: p.item.examination ||"N/A"
          },
          purchaseDate: p.purchaseDate,
          amountPaid: p.pricing.final_amount,
          accessGranted: p.access.granted,
          validityUntil: p.access.expires_at,
          totalTests: p.totalTests || 0,
          testsAttempted: p.usage.total_tests_attempted || 0,
          testsCompleted: 0,
          totalTimeSpent: p.usage.total_time_spent || 0
        }));
        setPurchasedTopics(mapped);
        setStats(data.stats || null);
      } else {
        throw new Error(data.message ||"Failed to load test series");
      }
    } catch (err: any) {
      console.error(' fetchPurchases Error:', err);
      setError(err.message ||"Failed to connect to server");
      toast.error(err.message ||"Error loading test series");
    } finally {
      setLoading(false);
    }
  }, [studentId, token]);

  const loadTopicTests = async (topic: PurchasedTopic) => {
    try {
      let endpoint ="";
      if (topic.type ==="subject") {
        endpoint = `${uri}/test-series/navigation/subjects/${topic.topicId}/topics`;
      } else if (topic.type ==="category") {
        endpoint = `${uri}/test-series/navigation/examinations/${topic.topicId}/subjects`;
      }

      if (!endpoint) throw new Error("Invalid purchase type");

      const res = await fetch(endpoint);
      const data = await res.json();
      if (!data.success) throw new Error("Failed to load tests");

      let allTests: TestSeries[] = [];
      if (topic.type ==="category") {
        const subjects = data.data?.subjects || [];
        for (const sub of subjects) {
          const tRes = await fetch(`${uri}/test-series/navigation/subjects/${sub._id}/topics`);
          const tData = await tRes.json();
          if (tData.success) {
            const topics = tData.data?.topicCategories || [];
            for (const t of topics) {
              const testRes = await fetch(`${uri}/test-series/navigation/topics/${t._id}/test-series`);
              const testData = await testRes.json();
              if (testData.success) {
                allTests.push(...(testData.data?.testSeries || []));
              }
            }
          }
        }
      } else if (topic.type ==="subject") {
        const topics = data.data?.topicCategories || [];
        for (const t of topics) {
          const testRes = await fetch(`${uri}/test-series/navigation/topics/${t._id}/test-series`);
          const testData = await testRes.json();
          if (testData.success) {
            allTests.push(...(testData.data?.testSeries || []));
          }
        }
      }
      return allTests;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  return { purchasedTopics, stats, loading, error, refresh: fetchPurchases, loadTopicTests };
};
