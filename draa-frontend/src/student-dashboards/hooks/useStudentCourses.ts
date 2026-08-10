import { useState, useEffect, useCallback } from'react';
import toast from '../../utils/toast';
import uri from'../../url';

export interface Course {
  purchaseId: string;
  courseId: string;
  course: {
    _id: string;
    title: string;
    short_desc: string;
    coverphoto: string;
    duration: number;
    skill_level: string;
    youtube_link?: string;
    teacher_details: {
      tname: string;
      tprofile: string;
    };
    chapters?: any[];
  };
  purchaseDate: string;
  amountPaid: number;
  progress?: number;
  lastAccessed?: string;
  timeSpent?: number;
  status?: string;
  realTimeProgress?: {
    chapters_completed: number;
    total_time_spent: number;
    daily_streak: number;
  };
}

export interface CourseProgress {
  overall_progress: {
    completion_percentage: number;
    status: string;
    total_time_spent: number;
    chapters_completed: number;
    chapters_in_progress: number;
    last_chapter_accessed?: {
      chapter_id: string;
      chapter_index: number;
      accessed_at: string;
    };
  };
  analytics: {
    daily_streaks: {
      current_streak: number;
      longest_streak: number;
    };
    performance_metrics: {
      overall_performance_score: number;
      focus_score: number;
      consistency_score: number;
      engagement_score: number;
    };
  };
  milestones: Array<{
    type: string;
    description: string;
    achieved_at: string;
    points_earned: number;
  }>;
}

const API_BASE = `${uri}/student/courses/progress`;

export const useStudentCourses = (studentId?: string, token?: string, studentName?: string, studentEmail?: string) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    console.log(' fetchCourses called with:', { studentId, hasToken: !!token });
    
    if (!studentId || !token) {
      console.log(' fetchCourses aborted: studentId or token missing');
      return;
    }

    try {
      setLoading(true);
      const endpoint = `${uri}/students/course/payment/my-courses/${studentId}`;
      console.log(' Fetching from:', endpoint);
      
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log(' Response status:', res.status);
      const data = await res.json();
      console.log(' Received data:', data);

      if (data.success) {
        const coursesArray = data.courses || [];
        setCourses(coursesArray);
        await fetchAllProgress(coursesArray);
      } else {
        throw new Error(data.message ||'Failed to load courses');
      }
    } catch (err: any) {
      console.error(' fetchCourses Error:', err);
      setError(err.message);
      toast.error(err.message ||"Failed to load courses");
    } finally {
      setLoading(false);
    }
  }, [studentId, token]);

  const fetchAllProgress = useCallback(async (coursesArray: Course[]) => {
    if (!studentId || !token) return;

    try {
      setProgressLoading(true);
      const updatedCourses = [...coursesArray];

      for (let i = 0; i < updatedCourses.length; i++) {
        const course = updatedCourses[i];
        try {
          const params = new URLSearchParams({
            student_name: studentName ||'',
            student_email: studentEmail ||'',
            course_title: course.course.title,
            course_duration: course.course.duration?.toString() ||'0',
            total_chapters: course.course.chapters?.length.toString() ||'0'
          });

          const response = await fetch(`${API_BASE}/${studentId}/${course.courseId}?${params.toString()}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const progressData = await response.json();

          if (progressData.success) {
            const p = progressData.data as CourseProgress;
            updatedCourses[i] = {
              ...course,
              progress: p.overall_progress.completion_percentage,
              status: p.overall_progress.status,
              timeSpent: p.overall_progress.total_time_spent,
              lastAccessed: p.overall_progress.last_chapter_accessed?.accessed_at,
              realTimeProgress: {
                chapters_completed: p.overall_progress.chapters_completed,
                total_time_spent: p.overall_progress.total_time_spent,
                daily_streak: p.analytics.daily_streaks.current_streak
              }
            };
          }
        } catch (err) {
          console.error(`Error loading progress for course ${course.courseId}:`, err);
        }
      }

      setCourses(updatedCourses);
    } catch (err) {
      console.error('Error loading all progress:', err);
    } finally {
      setProgressLoading(false);
    }
  }, [studentId, token, studentName, studentEmail]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return { courses, loading, progressLoading, error, refresh: fetchCourses };
};
