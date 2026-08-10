import { useState, useEffect, useCallback } from 'react';
import uri from '../../url';

export interface DashboardStats {
  courses: {
    total: number; active: number; completed: number; notStarted: number;
    totalHours: number; averageTimePerCourse: number; completionRate: number;
    categoriesCount: number; categories: string[];
  };
  books: {
    total: number; pdfBooks: number; physicalBooks: number; readBooks: number;
    unreadBooks: number; totalSpent: number; averageBookCost: number;
    readingCompletionRate: number; categoriesBreakdown: { [key: string]: number };
  };
  testSeries: {
    total: number; completed: number; active: number; notStarted: number;
    averageScore: number; highestScore: number; lowestScore: number; attempted: number;
  };
  exams: {
    total: number; completed: number; pending: number; averageScore: number;
    passedExams: number; failedExams: number; passRate: number;
    gradesDistribution: { A: number; B: number; C: number; D: number; F: number };
  };
  achievements: {
    certificates: number; badges: number;
    badgesBreakdown: { learner: number; expert: number; achiever: number; dedicated: number };
    streak: number; longestStreak: number; rank: number; totalPoints: number;
  };
  performance: {
    activitiesLast30Days: number; activitiesLast7Days: number;
    weeklyActivityTrend: string; averageRecentScore: number;
    performanceTrend: string; totalAssessments: number;
  };
  learningStreak: { currentStreak: number; longestStreak: number; lastActivity: string | null };
  monthlyProgress: Array<{ month: string; coursesEnrolled: number; examsCompleted: number; totalActivity: number }>;
  recentActivity: Array<{
    id: string; type: string; title: string; description: string;
    timestamp: string; relativeTime: string; icon: string; color: string;
    progress?: number; score?: number;
  }>;
  upcomingDeadlines: Array<{
    id: string; title: string; type: string; dueDate: string;
    dueDateFormatted: string; daysUntil: number; priority: string; completed: boolean;
  }>;
  notifications: number;
  lastUpdated: string;
}

export const useDashboardStats = (studentId?: string, token?: string) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookCount, setBookCount] = useState(0);
  const [courseCount, setCourseCount] = useState(0);
  const [testCount, setTestCount] = useState(0);

  const fetchStats = useCallback(async () => {
    if (!studentId || !token) return;

    try {
      setLoading(true);
      
      // 1. Fetch Analytics Stats
      const analyticsRes = await fetch(`${uri}/student/dashboard/analytics/stats/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Don't treat 401 as a crash — just skip silently (session handled by axios interceptor)
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        if (analyticsData.success) {
          setStats(analyticsData.data);
        }
      }

      // 2. Fetch Book Count
      const bookRes = await fetch(`${uri}/student/books/purchase/my-books/${studentId}?limit=1`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (bookRes.ok) {
        const bookData = await bookRes.json();
        if (bookData.success && bookData.stats) setBookCount(bookData.stats.totalBooks || 0);
      }

      // 3. Fetch Course Count
      const courseRes = await fetch(`${uri}/students/course/payment/my-courses/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (courseRes.ok) {
        const courseData = await courseRes.json();
        if (courseData.success && Array.isArray(courseData.courses)) setCourseCount(courseData.courses.length);
      }

      // 4. Fetch Test Count
      const testRes = await fetch(`${uri}/student/test-series/purchase/my-test-series/${studentId}?limit=1`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (testRes.ok) {
        const testData = await testRes.json();
        if (testData.success) {
          if (testData.stats && typeof testData.stats.totalPurchased === "number") setTestCount(testData.stats.totalPurchased);
          else if (Array.isArray(testData.testSeries)) setTestCount(testData.testSeries.length);
        }
      }

    } catch (err: any) {
      setError(err.message);
      // Don't show error toast for network issues on dashboard stats — non-critical
    } finally {
      setLoading(false);
    }
  }, [studentId, token]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, bookCount, courseCount, testCount, refresh: fetchStats };
};
