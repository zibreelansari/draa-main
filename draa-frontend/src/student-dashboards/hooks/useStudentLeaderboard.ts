import { useState, useEffect, useCallback } from'react';
import toast from '../../utils/toast';
import axios from'axios';
import uri from'../../url';

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  name: string;
  email?: string;
  avatar?: string;
  phone?: string;
  status?: string;
  points: number;
  level: number;
  streak: number;
  longestStreak: number;
  badges: number;
  certificates: number;
  avgScore: number;
  coursesCompleted: number;
  examsPassed: number;
  isTopThree: boolean;
}

export interface StudentRank {
  rank: number;
  totalStudents: number;
  percentile: number;
  points: number;
  level: number;
  streak: number;
  prevRank: number | null;
  prevStudent: { name: string; avatar: string; points: number } | null;
  nextRank: number | null;
  nextStudent: { name: string; avatar: string; points: number } | null;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedAt?: string;
}

export interface Achievements {
  earned: Badge[];
  available: Badge[];
  totalEarned: number;
  totalBadges: number;
  nextBadge: Badge | null;
  points: number;
  level: number;
  levelProgress: number;
  pointsToNextLevel: number;
}

export interface FriendsComparison {
  myPoints: number;
  myStreak: number;
  myAvgScore: number;
  myCourses: number;
  comparison: Array<{
    name: string;
    avatar: string;
    points: number;
    streak: number;
    avgScore: number;
    courses: number;
  }>;
}

export const useStudentLeaderboard = (studentId?: string, token?: string) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [monthlyLeaderboard, setMonthlyLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [studentRank, setStudentRank] = useState<StudentRank | null>(null);
  const [achievements, setAchievements] = useState<Achievements | null>(null);
  const [friendsComparison, setFriendsComparison] = useState<FriendsComparison | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch leaderboard
  const fetchLeaderboard = useCallback(async (type:'all' |'weekly' |'monthly' ='all', limit = 20) => {
    try {
      setLoading(true);
      setError(null);

      const endpoint = type ==='all' ?'/list' : `/${type}`;
      const res = await axios.get(`${uri}/student/leaderboard${endpoint}?limit=${limit}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (res.data.success) {
        if (type ==='all') setLeaderboard(res.data.data);
        else if (type ==='weekly') setWeeklyLeaderboard(res.data.data);
        else if (type ==='monthly') setMonthlyLeaderboard(res.data.data);
      }
    } catch (err: any) {
      console.error('Error fetching leaderboard:', err);
      setError(err.response?.data?.message ||'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch student's rank
  const fetchStudentRank = useCallback(async () => {
    if (!studentId) return;

    try {
      const res = await axios.get(`${uri}/student/leaderboard/rank/${studentId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (res.data.success) {
        setStudentRank(res.data.data);
      }
    } catch (err: any) {
      console.error('Error fetching rank:', err);
    }
  }, [studentId, token]);

  // Fetch achievements
  const fetchAchievements = useCallback(async () => {
    if (!studentId) return;

    try {
      const res = await axios.get(`${uri}/student/leaderboard/achievements/${studentId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (res.data.success) {
        setAchievements(res.data.data);
      }
    } catch (err: any) {
      console.error('Error fetching achievements:', err);
    }
  }, [studentId, token]);

  // Fetch friends comparison
  const fetchFriendsComparison = useCallback(async () => {
    if (!studentId) return;

    try {
      const res = await axios.get(`${uri}/student/leaderboard/compare/${studentId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (res.data.success) {
        setFriendsComparison(res.data.data);
      }
    } catch (err: any) {
      console.error('Error fetching comparison:', err);
    }
  }, [studentId, token]);

  // Get top by category
  const fetchTopByCategory = useCallback(async (category: string) => {
    try {
      setLoading(true);
      const res = await axios.get(`${uri}/student/leaderboard/top/${category}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (res.data.success) {
        return res.data.data;
      }
      return [];
    } catch (err: any) {
      console.error('Error fetching top by category:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Award badge
  const awardBadge = useCallback(async (badgeId: string, badgeName: string, badgeIcon: string) => {
    if (!studentId) return { success: false, message:'No student ID' };

    try {
      const res = await axios.post(
        `${uri}/student/leaderboard/badge/${studentId}`,
        { badgeId, badgeName, badgeIcon },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success('Badge awarded!');
        await fetchAchievements();
        return res.data;
      }
      return { success: false };
    } catch (err: any) {
      console.error('Error awarding badge:', err);
      return { success: false, message: err.response?.data?.message ||'Failed to award badge' };
    }
  }, [studentId, token, fetchAchievements]);

  // Initial fetch
  useEffect(() => {
    if (studentId) {
      fetchLeaderboard();
      fetchStudentRank();
      fetchAchievements();
    }
  }, [studentId, fetchLeaderboard, fetchStudentRank, fetchAchievements]);

  return {
    // Data
    leaderboard,
    weeklyLeaderboard,
    monthlyLeaderboard,
    studentRank,
    achievements,
    friendsComparison,

    // Loading & Error
    loading,
    error,

    // Methods
    fetchLeaderboard,
    fetchStudentRank,
    fetchAchievements,
    fetchFriendsComparison,
    fetchTopByCategory,
    awardBadge,
  };
};