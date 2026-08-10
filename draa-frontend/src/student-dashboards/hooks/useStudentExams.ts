import { useState, useEffect, useCallback } from'react';
import toast from '../../utils/toast';
import axios from'axios';
import url from'../../url';
import dayjs from'dayjs';

export interface Exam {
  _id: string;
  title: string;
  subject: string;
  totalMarks: number;
  durationMinutes: number;
  scheduledAt?: string;
  description?: string;
  difficulty?:"easy" |"medium" |"hard";
  passingMarks?: number;
}

export interface ExamStats {
  total: number;
  upcoming: number;
  ongoing: number;
  expired: number;
  completed: number;
}

export const useStudentExams = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ExamStats>({ total: 0, upcoming: 0, ongoing: 0, expired: 0, completed: 0 });

  const getExamStatus = (scheduledAt?: string, durationMinutes?: number):"Upcoming" |"Ongoing" |"Expired" |"Unscheduled" => {
    if (!scheduledAt) return"Unscheduled";
    const now = dayjs();
    const start = dayjs(scheduledAt);
    const end = start.add(durationMinutes || 0,"minute");
    if (now.isBefore(start)) return"Upcoming";
    if (now.isAfter(end)) return"Expired";
    return"Ongoing";
  };

  const calculateStats = useCallback((examsList: Exam[]) => {
    const newStats = examsList.reduce((acc, exam) => {
      const s = getExamStatus(exam.scheduledAt, exam.durationMinutes);
      acc.total++;
      if (s ==="Upcoming") acc.upcoming++;
      else if (s ==="Ongoing") acc.ongoing++;
      else if (s ==="Expired") acc.expired++;
      return acc;
    }, { total: 0, upcoming: 0, ongoing: 0, expired: 0, completed: 0 });
    setStats(newStats);
  }, []);

  const fetchExams = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${url}/exam/student/list`);
      if (res.data.success) {
        setExams(res.data.exams);
        calculateStats(res.data.exams);
      } else {
        toast.warning("No exams found");
      }
    } catch (err: any) {
      setError(err.message);
      // Fallback to mock data if API fails (as seen in original component)
      const mock: Exam[] = [
        { _id:"1", title:"React.js Fundamentals Test", subject:"Web Development", totalMarks: 100, durationMinutes: 120, scheduledAt: dayjs().add(2,"days").toISOString(), difficulty:"medium", passingMarks: 60 },
        { _id:"2", title:"Node.js Backend Assessment", subject:"Backend Development", totalMarks: 150, durationMinutes: 180, scheduledAt: dayjs().add(5,"days").toISOString(), difficulty:"hard", passingMarks: 90 },
        { _id:"3", title:"Database Design Quiz", subject:"Database", totalMarks: 80, durationMinutes: 90, scheduledAt: dayjs().subtract(1,"hour").toISOString(), difficulty:"easy", passingMarks: 48 },
        { _id:"4", title:"TypeScript Advanced Patterns", subject:"Programming", totalMarks: 120, durationMinutes: 150, scheduledAt: dayjs().add(1,"day").toISOString(), difficulty:"hard", passingMarks: 72 },
      ];
      setExams(mock);
      calculateStats(mock);
    } finally {
      setLoading(false);
    }
  }, [calculateStats]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  return { exams, loading, error, stats, refresh: fetchExams, getExamStatus };
};
