import React, { useState, useEffect, useRef } from"react";
import toast from '../../utils/toast';
import { useNavigate, Link } from"react-router-dom";
import uri from"../../url";
import StudentSidebar from"./StudentSidebar";
import StudentHeader from"./StudentTopbr";
import { useStudentAuthGuard } from"../../utils/global_auth";
import { useStudentLeaderboard } from"../../student-dashboards/hooks/useStudentLeaderboard";
import LeaderboardRow from"../../student-dashboards/components/LeaderboardRow";
import StreakCounter from"../../student-dashboards/components/StreakCounter";

//  TYPES 
interface LoginUser {
  name?: string;
  email?: string;
  id?: string;
  token?: string;
  [key: string]: any;
}

interface DashboardStats {
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

//  SVG ICONS 
const Ico = ({ d, size = 18, color ="currentColor", fill ="none", strokeW = 1.8 }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color}
    strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const Icons: Record<string, (size?: number, color?: string) => React.ReactNode> = {
  grid: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
  book: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>,
  video: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>,
  chart: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
  flash: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
  trophy: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>,
  fire: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>,
  clock: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  star: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  bell: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
  user: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  logout: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
  play: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" /></svg>,
  file: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
  calendar: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  trend: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>,
  rocket: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" /></svg>,
  crown: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20h20" /><path d="m4 8 4 4 4-8 4 8 4-4v12H4V8Z" /></svg>,
  check: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  menu: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>,
  search: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
  chevron: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>,
  home: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
  experiment: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11l-4 6h14l-4-6V3" /></svg>,
  bulb: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6" /><path d="M10 22h4" /><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" /></svg>,
  x: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
};

//  MINI COMPONENTS 
const LinearBar = ({ pct, color, h = 4, bg ="rgba(0,0,0,0.06)" }: any) => (
  <div style={{ height: h, background: bg, borderRadius: 99, overflow:"hidden" }}>
    <div style={{ height:"100%", width: `${Math.min(pct, 100)}%`, background: color, borderRadius: 99, transition:"width 1.2s cubic-bezier(.4,0,.2,1)" }} />
  </div>
);

const RingProgress = ({ pct, size = 88, stroke = 7, color ="#6366f1", bg ="rgba(255,255,255,0.15)" }: any) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ position:"relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke={bg} strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={circ} strokeDashoffset={circ - (Math.min(pct, 100) / 100) * circ}
          strokeLinecap="round" style={{ transition:"stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1)" }} />
      </svg>
      <div style={{ position:"absolute", inset: 0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontFamily:"var(--font)", fontWeight: 800, fontSize: 18, color:"white", lineHeight: 1 }}>{pct}%</span>
      </div>
    </div>
  );
};

const Sparkline = ({ data, color, w = 72, h = 28 }: any) => {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
  const pts = data.map((v: number, i: number) =>
    `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`
  ).join("");
  const last = pts.split("").pop()!.split(",");
  return (
    <svg width={w} height={h} style={{ overflow:"visible" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
      <circle cx={last[0]} cy={last[1]} r="3" fill={color} />
    </svg>
  );
};

const Avatar = ({ name, size = 34 }: { name: string; size?: number }) => {
  const initials = name ? name.split("").map(n => n[0]).join("").toUpperCase().slice(0, 2) :"?";
  return (
    <div style={{
      width: size, height: size, borderRadius:"50%", flexShrink: 0,
      background:"#5E6BFF",
      display:"flex", alignItems:"center", justifyContent:"center",
      color:"white", fontSize: size * 0.36, fontWeight: 800,
      fontFamily:"var(--font)",
    }}>{initials}</div>
  );
};

//  MAIN DASHBOARD 
export default function EnhancedStudentDashboard() {
  const navigate = useNavigate();
  useStudentAuthGuard();

  //  State (exact mirrors of original) 
  const [loginUser, setLoginUser] = useState<LoginUser>({});
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [notifications, setNotifications] = useState<number>(0);
  const [totalBooksCounter, settotalBooksCounter] = useState(0);
  const [totalcourseCounter, settotalcourseCounter] = useState(0);
  const [testCount, setTestCount] = useState(0);

  //  Leaderboard Hook 
  const {
    leaderboard,
    studentRank,
    achievements: leaderboardAchievements,
    loading: lbLoading,
    fetchLeaderboard,
  } = useStudentLeaderboard(loginUser?.id || loginUser?._id, loginUser?.token);

  //  UI State 
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  //  Close profile dropdown on outside click 
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  //  Auth + Main Data (EXACT from original) 
  useEffect(() => {
    const userStr = localStorage.getItem("edudocs");
    if (userStr) {
      try {
        const user: LoginUser = JSON.parse(userStr);
        // Block non-students from student dashboard
        if (!user.email && !user.name && user.role !=='student') {
          toast.error("Access Denied: Student privileges required");
          navigate("/student-login", { replace: true });
          return;
        }
        setLoginUser(user);
        if (user.id && user.token) loadDashboardData(user.id);
      } catch {
        toast.warning("Please log in first");
        navigate("/student-login", { replace: true });
      }
    } else {
      toast.warning("Please log in first");
      navigate("/student-login", { replace: true });
    }
  }, [navigate]);

  const loadDashboardData = async (studentId: string) => {
    try {
      setLoading(true);
      const userStr = localStorage.getItem("edudocs");
      const token = userStr ? JSON.parse(userStr).token : null;
      if (!token) throw new Error("No token found.");
      const response = await fetch(`${uri}/student/dashboard/analytics/stats/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to fetch dashboard data");
      const result = await response.json();
      if (result.success) {
        setStats(result.data);
        setNotifications(result.data.notifications || 0);
      } else throw new Error(result.message ||"Failed to load dashboard");
    } catch (error) {
      console.error("Error loading dashboard:", error);
      toast.error("Failed to load dashboard data");
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  //  Books Counter (EXACT from original) 
  useEffect(() => {
    const fetchBookCount = async () => {
      const userStr = localStorage.getItem("edudocs");
      if (!userStr) { setLoading(false); return; }
      let lu;
      try { lu = JSON.parse(userStr); } catch { setLoading(false); return; }
      try {
        const res = await fetch(`${uri}/student/books/purchase/my-books/${lu.id}?limit=1`, {
          headers: { Authorization: `Bearer ${lu.token}` }
        });
        const data = await res.json();
        if (data.success && data.stats) settotalBooksCounter(data.stats.totalBooks || 0);
      } catch (e) { console.error("Error fetching book count:", e); }
      finally { setLoading(false); }
    };
    fetchBookCount();
  }, []);

  //  Course Counter (EXACT from original) 
  useEffect(() => {
    const fetchtotalcourseCounter = async () => {
      const userStr = localStorage.getItem("edudocs");
      if (!userStr) { setLoading(false); return; }
      let lu;
      try { lu = JSON.parse(userStr); } catch { setLoading(false); return; }
      if (!lu.id || !lu.token) { setLoading(false); return; }
      try {
        const res = await fetch(`${uri}/students/course/payment/my-courses/${lu.id}`, {
          headers: { Authorization: `Bearer ${lu.token}` }
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.courses)) settotalcourseCounter(data.courses.length);
        else settotalcourseCounter(0);
      } catch (e) { console.error("Error fetching course count:", e); }
      finally { setLoading(false); }
    };
    fetchtotalcourseCounter();
  }, []);

  //  Test Series Counter (EXACT from original) 
  useEffect(() => {
    const fetchTestCount = async () => {
      const userStr = localStorage.getItem("edudocs");
      if (!userStr) { setLoading(false); return; }
      let lu;
      try { lu = JSON.parse(userStr); } catch { setLoading(false); return; }
      if (!lu.id || !lu.token) { setLoading(false); return; }
      try {
        const res = await fetch(`${uri}/student/test-series/purchase/my-test-series/${lu.id}?limit=1`, {
          headers: { Authorization: `Bearer ${lu.token}` }
        });
        const data = await res.json();
        if (data.success) {
          if (data.stats && typeof data.stats.totalPurchased ==="number") setTestCount(data.stats.totalPurchased);
          else if (Array.isArray(data.testSeries)) setTestCount(data.testSeries.length);
          else setTestCount(0);
        }
      } catch (e) { console.error("Error fetching test series count:", e); }
      finally { setLoading(false); }
    };
    fetchTestCount();
  }, []);

  //  Logout (EXACT from original) 
  const logoutHandler = () => {
    localStorage.removeItem("edudocs");
    toast.success("Logged out successfully");
    navigate("/");
  };

  //  Fetch Leaderboard Data 
  useEffect(() => {
    if (loginUser?.id || loginUser?._id) {
      fetchLeaderboard('all');
    }
  }, [loginUser?.id, loginUser?._id, fetchLeaderboard]);

  //  Helpers 
  const getPriorityMeta = (p: string) => ({
    high: { color:"#ef4444", bg:"#fff1f0", border:"rgba(239,68,68,0.2)" },
    medium: { color:"#f59e0b", bg:"#fffbeb", border:"rgba(245,158,11,0.2)" },
    low: { color:"#10b981", bg:"#ecfdf5", border:"rgba(16,185,129,0.2)" },
  }[p] || { color:"#6366f1", bg:"#eff6ff", border:"rgba(99,102,241,0.2)" });

  const emojiToIcon = (emoji: string) => ({
"":"book","":"book","":"trophy",
"":"check","":"file",
  }[emoji] ||"star");

  const userName = loginUser.name ??"Student";
  const firstName = userName.split("")[0];

  //  Sparkline seed data (driven off real stats once loaded) 
  const courseSparkData = stats ? [stats.courses.notStarted, stats.courses.active, stats.courses.completed].map((v, i, a) => a.slice(0, i + 1).reduce((s, x) => s + x, 0)) : [0, 1, 2];
  const scoreSparkData = stats ? [stats.exams.averageScore * 0.85, stats.exams.averageScore * 0.9, stats.exams.averageScore * 0.95, stats.exams.averageScore] : [70, 75, 80, 82];
  const streakSparkData = stats ? Array.from({ length: 7 }, (_, i) => Math.min(i + 1, stats.learningStreak.currentStreak)) : [1, 2, 3];
  const hoursSparkData = stats ? [stats.courses.totalHours * 0.5, stats.courses.totalHours * 0.7, stats.courses.totalHours * 0.85, stats.courses.totalHours] : [40, 60, 80, 100];

  // 
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --ink:       #0d0c1d;
          --ink2:      #4b4966;
          --ink3:      #9896b8;
          --surface:   #ffffff;
          --surface2:  #f5f4ff;
          --edge:      rgba(99,102,241,0.1);
          --edge2:     #e8e7f8;
          --accent:    #6366f1;
          --accent2:   #5E6BFF;
          --accent-bg: rgba(99,102,241,0.07);
          --green:     #10b981;
          --amber:     #f59e0b;
          --red:       #ef4444;
          --pink:      #ec4899;
          --sky:       #0ea5e9;
          --sh:  0 1px 3px rgba(13,12,29,.05), 0 4px 16px rgba(94,107,255,.07);
          --sh2: 0 4px 24px rgba(94,107,255,.13), 0 1px 4px rgba(13,12,29,.07);
          --sh3: 0 8px 40px rgba(94,107,255,.18);
          --r:   7px;
          --rs:  7px;
          --tr:  0.2s cubic-bezier(.4,0,.2,1);
          --sidebar: 252px;
          --header:  60px;
          --font:'Inter', system-ui, -apple-system, BlinkMacSystemFont,'Segoe UI', Roboto, sans-serif;
          /* --display removed */
        }
        html,body { height:100%; font-family:var(--font); background:var(--surface2); color:var(--ink); -webkit-font-smoothing:antialiased; }
        * { font-family: var(--font); }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:var(--edge2); border-radius:99px; }
        ::-webkit-scrollbar-thumb:hover { background:var(--accent2); }

        /* Layout */
        .app-shell { display:flex; min-height:100vh; }
        .sidebar {
          width:var(--sidebar); min-width:var(--sidebar); height:100vh;
          position:sticky; top:0; background:var(--surface);
          border-right:1px solid var(--edge2);
          display:flex; flex-direction:column; overflow:hidden;
          transition:width var(--tr), min-width var(--tr), transform var(--tr);
          z-index:200;
        }
        .sidebar.closed { width:0; min-width:0; }
        .main { flex:1; display:flex; flex-direction:column; min-width:0; overflow:hidden; }
        .topbar {
          height:var(--header); position:sticky; top:0; z-index:150;
          background:rgba(245,244,255,0.88); backdrop-filter:blur(18px);
          border-bottom:1px solid var(--edge2);
          display:flex; align-items:center; gap:12px; padding:0 24px;
        }
        .content { flex:1; overflow-y:auto; padding:28px 28px 48px; }

        /* Nav */
        .nav-label { font-size:10px; font-weight:700; color:var(--ink3); text-transform:uppercase; letter-spacing:.1em; padding:6px 14px 3px; }
        .nav-item {
          display:flex; align-items:center; gap:10px;
          padding:9px 14px; border-radius:7px; cursor:pointer;
          font-size:13.5px; font-weight:500; color:var(--ink2);
          transition:all var(--tr); margin:1px 8px; white-space:nowrap; overflow:hidden;
        }
        .nav-item:hover  { background:var(--accent-bg); color:var(--accent); }
        .nav-item.active { background:linear-gradient(135deg,rgba(99,102,241,.14),rgba(94,107,255,.08)); color:var(--accent); font-weight:700; }
        .nav-item .nav-icon { flex-shrink:0; }

        /* Cards */
        .card { background:var(--surface); border-radius:var(--r); border:1px solid var(--edge2); box-shadow:var(--sh); }
        .card-sm { background:var(--surface); border-radius:var(--rs); border:1px solid var(--edge2); box-shadow:var(--sh); }

        /* Buttons */
        .btn { display:inline-flex; align-items:center; gap:7px; padding:9px 18px; border-radius:7px; border:none; cursor:pointer; font-size:13px; font-weight:600; transition:all var(--tr); font-family:var(--font); white-space:nowrap; }
        .btn-primary { background:#5E6BFF; color:#fff; box-shadow:0 4px 14px rgba(94,107,255,.35); }
        .btn-primary:hover { box-shadow:0 4px 14px rgba(94,107,255,.35); }
        .btn-ghost  { background:var(--surface); color:var(--ink2); border:1px solid var(--edge2); }
        .btn-ghost:hover { background:var(--accent-bg); color:var(--accent); border-color:rgba(94,107,255,.3); }
        .btn-icon { padding:8px; border-radius:7px; }

        /* Typography */
        .display { font-family:var(--font); }
        .stat-val { font-family:var(--font); font-weight:800; line-height:1; color:var(--ink); }

        /* Animations */
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulseRing { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.15);opacity:.6} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .fade-up { opacity:0; animation:fadeUp .45s cubic-bezier(.4,0,.2,1) forwards; }
        .pulse-ring { animation:pulseRing 2s ease-in-out infinite; }
        .spinner { animation:spin 1s linear infinite; }

        /* Grid helpers */
        .grid-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
        .grid-3 { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        .grid-2 { display:grid; grid-template-columns:repeat(2,1fr); gap:14px; }
        .grid-4-tiles { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }

        /* Hover lift */
        .lift { transition:transform var(--tr), box-shadow var(--tr); }
        .lift:hover { transform:translateY(-2px); box-shadow:var(--sh2); }

        /* Badge / pill */
        .badge { display:inline-flex; align-items:center; gap:4px; padding:3px 9px; border-radius:99px; font-size:11px; font-weight:700; }
        .tag { display:inline-block; padding:2px 8px; border-radius:7px; font-size:10.5px; font-weight:700; }

        /* Divider */
        .div { height:1px; background:var(--edge2); margin:12px 0; }

        /* Alert banner */
        .alert-success {
          display:flex; align-items:center; gap:12px;
          background:#ecfdf5; border:1px solid rgba(16,185,129,.25);
          border-radius:7px; padding:14px 18px; margin-top:20px;
          font-size:13.5px; color:#065f46; font-weight:500;
        }

        /* Overlay */
        .overlay { position:fixed; inset:0; background:rgba(13,12,29,.45); z-index:190; }

        /* Responsive */
        @media(max-width:900px) {
          .grid-4,.grid-3 { grid-template-columns:repeat(2,1fr) !important; }
          .grid-4-tiles { grid-template-columns:repeat(2,1fr) !important; }
          .hero-cols { grid-template-columns:1fr !important; }
          .bottom-grid { grid-template-columns:1fr !important; }
        }
        @media(max-width:600px) {
          .grid-4,.grid-3,.grid-2 { grid-template-columns:1fr !important; }
          .grid-4-tiles { grid-template-columns:repeat(2,1fr); }
          .content { padding:16px 12px 40px; }
          .topbar { padding:0 14px; }
        }
        @media(max-width:420px) {
          .dashboard-page-actions {
            width: 100%;
            display: grid !important;
            grid-template-columns: 1fr;
          }
          .dashboard-page-actions .btn {
            width: 100%;
            justify-content: center;
          }
          .dashboard-hero-actions {
            width: 100%;
            display: grid !important;
            grid-template-columns: 1fr;
          }
          .dashboard-hero-actions .btn {
            width: 100%;
            justify-content: center;
          }
        }
        @media(max-width:360px) {
          .content { padding: 12px 8px 32px; }
          .dashboard-main-wrap { max-width: 100% !important; }
          .dashboard-hero-card { padding: 20px 12px !important; }
          .dashboard-hero-title {
            font-size: 24px !important;
            line-height: 1.15 !important;
          }
          .dashboard-hero-right-grid {
            grid-template-columns: 1fr !important;
          }
          .dashboard-hero-mini-stats {
            grid-template-columns: 1fr !important;
          }
          .grid-4-tiles {
            grid-template-columns: 1fr !important;
          }
        }
        @media(max-width:900px) {
          .sidebar { position:fixed!important; top:0; left:0; height:100vh; z-index:300; }
          .sidebar.closed { transform:translateX(-100%); width:var(--sidebar)!important; min-width:var(--sidebar)!important; }
        }
      `}</style>

      <div className="app-shell">

        {/*  SIDEBAR  */}
        <StudentSidebar
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          loginUser={loginUser}
          stats={stats}
        />
        {/* Mobile overlay */}
        {!sidebarOpen && (
          <div className="overlay" style={{ display:"none" }} onClick={() => setSidebarOpen(false)} />
        )}

        {/*  MAIN  */}
        <div className="main">

          {/*  TOPBAR  */}
          <StudentHeader
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            loginUser={loginUser}
            notifications={notifications}
            currentPage="Dashboard"
          />


          {/*  CONTENT  */}
          <main className="content">

            {/* LOADING */}
            {loading && (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"60vh", gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius:"50%", border:"3px solid var(--edge2)", borderTopColor:"var(--accent)" }} className="spinner" />
                <div style={{ color:"var(--ink2)", fontSize: 14, fontWeight: 500 }}>Loading your dashboard</div>
              </div>
            )}

            {/* ERROR */}
            {!loading && !stats && (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"50vh", gap: 16, textAlign:"center" }}>
                <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="var(--ink3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                <div style={{ fontFamily:"var(--font)", fontSize: 22, fontWeight: 800, color:"var(--ink)" }}>Couldn't load dashboard</div>
                <div style={{ color:"var(--ink2)", fontSize: 14 }}>There was an error fetching your data.</div>
                <button className="btn btn-primary" onClick={() => loginUser.id && loadDashboardData(loginUser.id)}>
                  Try Again
                </button>
              </div>
            )}

            {/* DASHBOARD */}
            {!loading && stats && (
              <div className="dashboard-main-wrap" style={{ maxWidth: 1320, margin:"0 auto" }}>

                {/* Page header */}
                <div className="fade-up" style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap: 12, marginBottom: 24 }}>
                  <div>
                    <h1 className="display" style={{ fontSize: 28, fontWeight: 800, color:"var(--ink)", lineHeight: 1.15, marginBottom: 4, display:"flex", alignItems:"center", gap: 8 }}>
                      Good {new Date().getHours() < 12 ?"morning" : new Date().getHours() < 18 ?"afternoon" :"evening"}, {firstName}!
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8Z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" /></svg>
                    </h1>
                    <p style={{ color:"var(--ink2)", fontSize: 13.5 }}>
                      {new Date().toLocaleDateString("en-IN", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}
                      &nbsp;·&nbsp;Here's your learning overview
                    </p>
                  </div>
                  <div className="dashboard-page-actions" style={{ display:"flex", gap: 8 }}>
                    <button className="btn btn-ghost" onClick={() => navigate("/student/my-exams")}>
                      {Icons.experiment?.(15)} Practice Test
                    </button>
                    <button className="btn btn-primary" onClick={() => navigate(`/sudent/my-courses/${loginUser.id}`)}>
                      {Icons.play?.(15)} Continue Learning
                    </button>
                  </div>
                </div>

                {/*  HERO BANNER  */}
                <div className="fade-up" style={{ animationDelay:".06s", marginBottom: 22 }}>
                  <div className="dashboard-hero-card" style={{
                    borderRadius: 7, overflow:"hidden", position:"relative",
                    background:"linear-gradient(135deg,#0f0b2d 0%,#1e1060 40%,#3b1fa8 70%,#1a0e4f 100%)",
                    padding:"36px 40px", boxShadow:"var(--sh3)"
                  }}>
                    {/* Decorative blobs */}
                    <div style={{ position:"absolute", top: -50, right: -50, width: 240, height: 240, borderRadius:"50%", background:"rgba(94,107,255,.22)", filter:"blur(50px)", pointerEvents:"none" }} />
                    <div style={{ position:"absolute", bottom: -30, left:"35%", width: 160, height: 160, borderRadius:"50%", background:"rgba(94,107,255,.18)", filter:"blur(35px)", pointerEvents:"none" }} />
                    <div style={{ position:"absolute", top: 10, left:"60%", width: 120, height: 120, borderRadius:"50%", background:"rgba(236,72,153,.1)", filter:"blur(25px)", pointerEvents:"none" }} />

                    <div className="hero-cols" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 32, position:"relative" }}>
                      {/* Left */}
                      <div style={{ display:"flex", flexDirection:"column", gap: 20 }}>
                        <div>
                          {stats.performance.performanceTrend ==="improving" && (
                            <span className="badge" style={{ background:"rgba(16,185,129,.2)", color:"#6ee7b7", border:"1px solid rgba(16,185,129,.3)", marginBottom: 10, display:"inline-flex", gap: 5 }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                              Performance Improving
                            </span>
                          )}
                          <h2 className="display dashboard-hero-title" style={{ fontSize: 30, fontWeight: 800, color:"white", lineHeight: 1.2, marginBottom: 10 }}>
                            Your Learning<br />Journey
                          </h2>
                          <p style={{ color:"rgba(255,255,255,.65)", fontSize: 14, lineHeight: 1.65, maxWidth: 380 }}>
                            You're on a&nbsp;
                            <strong style={{ color:"#c4b5fd" }}>{stats.learningStreak.currentStreak}-day streak</strong>
                            &nbsp;and your scores show great momentum. Beat your record of&nbsp;
                            <strong style={{ color:"#c4b5fd" }}>{stats.learningStreak.longestStreak} days</strong>!
                          </p>
                        </div>

                        {/* Rank + Points */}
                        <div className="dashboard-hero-mini-stats" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 10 }}>
                          {[
                            { label:"Your Rank", value: `#${stats.achievements.rank}`, icon:"crown", color:"#fbbf24" },
                            { label:"Total Points", value: stats.achievements.totalPoints.toLocaleString(), icon:"star", color:"#a78bfa" },
                          ].map(m => (
                            <div key={m.label} style={{ background:"rgba(255,255,255,.07)", backdropFilter:"blur(10px)", borderRadius: 7, padding:"14px", border:"1px solid rgba(255,255,255,.1)" }}>
                              <div style={{ fontSize: 11, color:"rgba(255,255,255,.5)", marginBottom: 4, fontWeight: 600 }}>{m.label.toUpperCase()}</div>
                              <div className="display" style={{ fontSize: 21, fontWeight: 800, color:"white" }}>{m.value}</div>
                            </div>
                          ))}
                        </div>

                        <div className="dashboard-hero-actions" style={{ display:"flex", gap: 10, flexWrap:"wrap" }}>
                          <button className="btn" style={{ background:"white", color:"#3b1fa8", fontWeight: 800 }}
                            onClick={() => navigate(`/sudent/my-courses/${loginUser.id}`)}>
                            {Icons.play?.(15,"#3b1fa8")} Continue Learning
                          </button>
                          <button className="btn" style={{ background:"rgba(255,255,255,.12)", color:"white", border:"1px solid rgba(255,255,255,.25)" }}
                            onClick={() => navigate("/courses")}>
                            Explore Courses
                          </button>
                        </div>
                      </div>

                      {/* Right: ring charts */}
                      <div className="dashboard-hero-right-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 12, alignItems:"center" }}>
                        {[
                          { label:"Course Progress", pct: stats.courses.completionRate, color:"#a78bfa" },
                          { label:"Pass Rate", pct: stats.exams.passRate, color:"#34d399" },
                          { label:"Reading Rate", pct: stats.books.readingCompletionRate, color:"#60a5fa" },
                          { label:"Avg Score", pct: stats.exams.averageScore, color:"#f472b6" },
                        ].map(ring => (
                          <div key={ring.label} style={{ background:"rgba(255,255,255,.07)", backdropFilter:"blur(8px)", borderRadius: 7, padding:"16px", textAlign:"center", border:"1px solid rgba(255,255,255,.08)" }}>
                            <RingProgress pct={ring.pct} size={84} stroke={7} color={ring.color} />
                            <div style={{ color:"rgba(255,255,255,.65)", fontSize: 11, fontWeight: 600, marginTop: 8 }}>{ring.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/*  PRIMARY STAT CARDS  */}
                <div className="grid-4 fade-up" style={{ animationDelay:".12s", marginBottom: 16 }}>
                  {[
                    {
                      label:"Total Courses", value: totalcourseCounter, unit:"",
                      color:"#6366f1", bg:"rgba(99,102,241,.09)", icon:"book",
                      s1: { l:"Active", v: stats.courses.active, c:"#6366f1" },
                      s2: { l:"Completed", v: stats.courses.completed, c:"#10b981" },
                      spark: courseSparkData, pct: stats.courses.completionRate,
                      onClick: () => navigate(`/sudent/my-courses/${loginUser.id}`)
                    },
                    {
                      label:"Avg Score", value: stats.exams.averageScore, unit:"%",
                      color:"#f59e0b", bg:"rgba(245,158,11,.09)", icon:"flash",
                      s1: { l:"Passed", v: stats.exams.passedExams, c:"#10b981" },
                      s2: { l:"Pending", v: stats.exams.pending, c:"#f59e0b" },
                      spark: scoreSparkData, pct: stats.exams.passRate,
                      onClick: () => navigate("/student/my-exams")
                    },
                    {
                      label:"Learning Hours", value: stats.courses.totalHours, unit:"hrs",
                      color:"#5E6BFF", bg:"rgba(94,107,255,.09)", icon:"clock",
                      s1: { l:"Per course", v: `${stats.courses.averageTimePerCourse}h`, c:"#5E6BFF" },
                      s2: { l:"Activity", v: stats.performance.activitiesLast7Days, c:"#6366f1" },
                      spark: hoursSparkData, pct: 62,
                      onClick: undefined
                    },
                    {
                      label:"Day Streak", value: stats.learningStreak.currentStreak, unit:"days",
                      color:"#ef4444", bg:"rgba(239,68,68,.09)", icon:"fire",
                      s1: { l:"Longest", v: `${stats.learningStreak.longestStreak}d`, c:"#ef4444" },
                      s2: { l:"Last active", v:"Today", c:"#10b981" },
                      spark: streakSparkData,
                      pct: Math.min(100, Math.round((stats.learningStreak.currentStreak / (stats.learningStreak.longestStreak || 1)) * 100)),
                      onClick: undefined
                    },
                  ].map((s, i) => (
                    <div key={i} className="card lift" style={{ padding:"18px 20px", cursor: s.onClick ?"pointer" :"default", animationDelay: `${.14 + i * .04}s` }}
                      onClick={s.onClick}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom: 12 }}>
                        <div>
                          <div style={{ fontSize: 11.5, fontWeight: 700, color:"var(--ink2)", textTransform:"uppercase", letterSpacing:".06em", marginBottom: 5 }}>{s.label}</div>
                          <div style={{ display:"flex", alignItems:"baseline", gap: 4 }}>
                            <span className="stat-val" style={{ fontSize: 32 }}>{s.value}</span>
                            {s.unit && <span style={{ fontSize: 13, color:"var(--ink2)", fontWeight: 600 }}>{s.unit}</span>}
                          </div>
                        </div>
                        <div style={{ width: 38, height: 38, borderRadius: 7, background: s.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink: 0 }}>
                          {Icons[s.icon]?.(18, s.color)}
                        </div>
                      </div>
                      <div style={{ marginBottom: 10 }}>
                        <Sparkline data={s.spark} color={s.color} w={90} h={26} />
                      </div>
                      <LinearBar pct={s.pct} color={s.color} h={3} bg={s.bg} />
                      <div style={{ display:"flex", justifyContent:"space-between", marginTop: 10 }}>
                        <div>
                          <div style={{ fontSize: 10, color:"var(--ink3)" }}>{s.s1.l}</div>
                          <div style={{ fontSize: 12, fontWeight: 800, color: s.s1.c }}>{s.s1.v}</div>
                        </div>
                        <div style={{ textAlign:"right" }}>
                          <div style={{ fontSize: 10, color:"var(--ink3)" }}>{s.s2.l}</div>
                          <div style={{ fontSize: 12, fontWeight: 800, color: s.s2.c }}>{s.s2.v}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/*  QUICK TILES  */}
                <div className="grid-4-tiles fade-up" style={{ animationDelay:".2s", marginBottom: 20 }}>
                  {[
                    { label:"My Books", value: totalBooksCounter, sub: `${stats.books.readBooks} read`, color:"#ef4444", bg:"#fff1f0", icon:"file", onClick: () => navigate(`/sudent/my-books/purchased/${loginUser.id}`) },
                    { label:"Test Series", value: testCount, sub: `Avg ${stats.testSeries.averageScore}%`, color:"#10b981", bg:"#ecfdf5", icon:"flash", onClick: () => navigate(`/v2/student/my-test-series/${loginUser.id}`) },
                    { label:"Achievements", value: stats.achievements.badges, sub: `${stats.achievements.certificates} certs`, color:"#f59e0b", bg:"#fffbeb", icon:"trophy", onClick: () => navigate("/student/achievements") },
                    { label:"Activity 7d", value: stats.performance.activitiesLast7Days, sub:"Actions taken", color:"#6366f1", bg:"var(--accent-bg)", icon:"trend", onClick: undefined },
                  ].map((t, i) => (
                    <div key={i} className="card lift" style={{ padding:"14px 16px", cursor: t.onClick ?"pointer" :"default" }} onClick={t.onClick}>
                      <div style={{ display:"flex", alignItems:"center", gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 7, background: t.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink: 0 }}>
                          {Icons[t.icon]?.(19, t.color)}
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color:"var(--ink2)", fontWeight: 700, textTransform:"uppercase", letterSpacing:".05em" }}>{t.label}</div>
                          <div className="stat-val" style={{ fontSize: 24 }}>{t.value}</div>
                          <div style={{ fontSize: 11, color:"var(--ink3)" }}>{t.sub}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/*  BOTTOM 3-COL GRID  */}
                <div className="bottom-grid" style={{ display:"grid", gridTemplateColumns:"1.3fr 1fr 0.9fr", gap: 18 }}>

                  {/* Recent Activity */}
                  <div className="card" style={{ padding:"20px 22px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: 18 }}>
                      <div style={{ display:"flex", alignItems:"center", gap: 7 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                        <span className="display" style={{ fontSize: 15, fontWeight: 700, color:"var(--ink)" }}>Monthly Progress</span>
                        <span className="badge" style={{ background:"rgba(16,185,129,.1)", color:"#10b981" }}>{stats.recentActivity.length}</span>
                      </div>
                      <button className="btn btn-ghost" style={{ padding:"4px 10px", fontSize: 12 }}>View all</button>
                    </div>

                    {stats.recentActivity.length === 0 ? (
                      <div style={{ textAlign:"center", padding:"30px 0", color:"var(--ink3)" }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--ink3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 8 }}><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                        <div style={{ fontSize: 13 }}>No recent activities</div>
                      </div>
                    ) : (
                      <div style={{ maxHeight: 390, overflowY:"auto", paddingRight: 4 }}>
                        {stats.recentActivity.map((a, i) => (
                          <div key={a.id} style={{ display:"flex", gap: 12, paddingBottom: i < stats.recentActivity.length - 1 ? 16 : 0, position:"relative" }}>
                            {i < stats.recentActivity.length - 1 && (
                              <div style={{ position:"absolute", left: 17, top: 36, bottom: 0, width: 1.5, background:"var(--edge2)" }} />
                            )}
                            <div style={{ width: 35, height: 35, borderRadius: 7, background: `${a.color}18`, border: `1.5px solid ${a.color}30`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink: 0, zIndex: 1, fontSize: 15 }}>
                              {a.icon}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color:"var(--ink)", marginBottom: 2 }}>{a.title}</div>
                              <div style={{ fontSize: 12, color:"var(--ink2)", marginBottom: 4 }}>{a.description}</div>
                              <div style={{ display:"flex", alignItems:"center", gap: 7, flexWrap:"wrap" }}>
                                <span style={{ fontSize: 11, color:"var(--ink3)" }}>{a.relativeTime}</span>
                                {a.score != null && (
                                  <span className="badge" style={{ background:"#ecfdf5", color:"#10b981", fontSize: 10 }}>Score: {a.score}%</span>
                                )}
                                {a.progress != null && (
                                  <span className="badge" style={{ background:"var(--accent-bg)", color:"var(--accent)", fontSize: 10 }}>{a.progress}% done</span>
                                )}
                              </div>
                              {a.progress != null && (
                                <div style={{ marginTop: 6 }}>
                                  <LinearBar pct={a.progress} color={a.color} h={2.5} bg={`${a.color}18`} />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Deadlines + Grade chart */}
                  <div style={{ display:"flex", flexDirection:"column", gap: 16 }}>
                    <div className="card" style={{ padding:"18px 20px", flex: 1 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: 16 }}>
                        <span className="display" style={{ fontSize: 15, fontWeight: 700, color:"var(--ink)" }}>Deadlines</span>
                        <span className="badge" style={{ background:"#fff1f0", color:"#ef4444" }}>{stats.upcomingDeadlines.length}</span>
                      </div>
                      {stats.upcomingDeadlines.length === 0 ? (
                        <div style={{ textAlign:"center", padding:"20px 0", color:"var(--ink3)" }}>
                          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 6 }}><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="18" width="12" height="4" /></svg>
                          <div style={{ fontSize: 12 }}>All clear!</div>
                        </div>
                      ) : (
                        <div style={{ display:"flex", flexDirection:"column", gap: 9, maxHeight: 260, overflowY:"auto" }}>
                          {stats.upcomingDeadlines.map(d => {
                            const m = getPriorityMeta(d.priority);
                            return (
                              <div key={d.id} style={{ padding:"10px 13px", borderRadius: 7, background: m.bg, border: `1px solid ${m.border}`, position:"relative", overflow:"hidden" }}>
                                <div style={{ position:"absolute", left: 0, top: 0, bottom: 0, width: 3, background: m.color, borderRadius:"3px 0 0 3px" }} />
                                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: 5 }}>
                                  <span style={{ fontSize: 13, fontWeight: 700, color:"var(--ink)" }}>{d.title}</span>
                                  <span className="tag" style={{ background: m.color, color:"white", fontSize: 9 }}>{d.priority.toUpperCase()}</span>
                                </div>
                                <div style={{ display:"flex", alignItems:"center", gap: 6 }}>
                                  {Icons.calendar?.(12,"var(--ink3)")}
                                  <span style={{ fontSize: 11, color:"var(--ink3)" }}>{d.dueDateFormatted}</span>
                                  <span style={{ fontSize: 11, fontWeight: 800, color: m.color, marginLeft: 4 }}>
                                    {d.daysUntil === 0 ?"Today!" : d.daysUntil === 1 ?"Tomorrow" : `${d.daysUntil} days left`}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Grade distribution */}
                    <div className="card" style={{ padding:"16px 18px" }}>
                      <div className="display" style={{ fontSize: 14, fontWeight: 700, color:"var(--ink)", marginBottom: 12 }}>Grade Distribution</div>
                      <div style={{ display:"flex", alignItems:"flex-end", gap: 6, height: 52 }}>
                        {(Object.entries(stats.exams.gradesDistribution) as [string, number][]).map(([grade, count]) => {
                          const gc: Record<string, string> = { A:"#10b981", B:"#6366f1", C:"#f59e0b", D:"#f97316", F:"#ef4444" };
                          const maxG = Math.max(...Object.values(stats.exams.gradesDistribution));
                          return (
                            <div key={grade} style={{ flex: 1, display:"flex", flexDirection:"column", alignItems:"center", gap: 2 }}>
                              <div style={{
                                width:"100%", borderRadius:"4px 4px 0 0",
                                background: gc[grade], height: `${(count / (maxG || 1)) * 38}px`,
                                minHeight: count > 0 ? 5 : 0, transition:"height 1.2s cubic-bezier(.4,0,.2,1)"
                              }} />
                              <span style={{ fontSize: 10, fontWeight: 800, color: gc[grade] }}>{grade}</span>
                              <span style={{ fontSize: 10, color:"var(--ink3)" }}>{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="card" style={{ padding:"18px 20px" }}>
                    <div className="display" style={{ fontSize: 15, fontWeight: 700, color:"var(--ink)", marginBottom: 14 }}>Quick Actions</div>
                    <div style={{ display:"flex", flexDirection:"column", gap: 7 }}>
                      {[
                        { label:"Continue Learning", icon:"play", color:"#6366f1", bg:"rgba(94,107,255,.1)", primary: true, to: `/sudent/my-courses/${loginUser.id}` },
                        { label:"Join Live Session", icon:"video", color:"#ef4444", bg:"rgba(239,68,68,.08)", primary: false, to:"/students/my-live-sessions" },
                        { label:"Take Practice Test", icon:"experiment", color:"#f59e0b", bg:"rgba(245,158,11,.08)", primary: false, to:"/student/my-exams" },
                        { label:"Explore New Courses", icon:"bulb", color:"#5E6BFF", bg:"rgba(94,107,255,.08)", primary: false, to:"/courses" },
                        { label:"My Books Library", icon:"book", color:"#10b981", bg:"rgba(16,185,129,.08)", primary: false, to: `/sudent/my-books/purchased/${loginUser.id}` },
                        // { label:"View Achievements",   icon:"trophy",     color:"#f59e0b", bg:"rgba(245,158,11,.08)", primary:false, to:"/student/achievements" },
                      ].map((a, i) => (
                        <button key={i} onClick={() => navigate(a.to)} style={{
                          display:"flex", alignItems:"center", gap: 10,
                          padding:"10px 12px", borderRadius: 7,
                          border: `1px solid ${a.primary ?"transparent" :"var(--edge2)"}`,
                          background: a.primary ?"#5E6BFF" : a.bg,
                          cursor:"pointer", width:"100%", textAlign:"left",
                          boxShadow: a.primary ?"0 4px 14px rgba(94,107,255,.28)" :"none",
                          transition:"all var(--tr)"
                        }}
                          onMouseEnter={e => { if (!a.primary) { e.currentTarget.style.borderColor = `${a.color}50`; e.currentTarget.style.background = a.bg; } }}
                          onMouseLeave={e => { if (!a.primary) { e.currentTarget.style.borderColor ="var(--edge2)"; e.currentTarget.style.background = a.bg; } }}>
                          <div style={{ width: 28, height: 28, borderRadius: 7, background: a.primary ?"rgba(255,255,255,.2)" :"white", display:"flex", alignItems:"center", justifyContent:"center", flexShrink: 0 }}>
                            {Icons[a.icon]?.(14, a.primary ?"white" : a.color)}
                          </div>
                          <span style={{ fontSize: 12.5, fontWeight: 700, color: a.primary ?"white" :"var(--ink)" }}>{a.label}</span>
                          <div style={{ marginLeft:"auto" }}>{Icons.chevron?.(13, a.primary ?"rgba(255,255,255,.5)" :"var(--ink3)")}</div>
                        </button>
                      ))}
                    </div>

                    {/* Badge progress */}
                    {/* <div style={{ marginTop:16, paddingTop:14, borderTop:"1px solid var(--edge2)" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                        <span style={{ fontSize:12, fontWeight:700, color:"var(--ink)" }}>Badge Progress</span>
                        <span style={{ fontSize:12, color:"var(--accent)", fontWeight:700 }}>{stats.achievements.badges} earned</span>
                      </div>
                      {[
                        { label:"Learner",  count:stats.achievements.badgesBreakdown.learner,   total:5, color:"#6366f1" },
                        { label:"Expert",   count:stats.achievements.badgesBreakdown.expert,    total:5, color:"#5E6BFF" },
                        { label:"Achiever", count:stats.achievements.badgesBreakdown.achiever,  total:4, color:"#f59e0b" },
                        { label:"Dedicated",count:stats.achievements.badgesBreakdown.dedicated, total:4, color:"#ef4444" },
                      ].map(b => (
                        <div key={b.label} style={{ marginBottom:8 }}>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                            <span style={{ fontSize:11, color:"var(--ink2)", fontWeight:600 }}>{b.label}</span>
                            <span style={{ fontSize:11, color:"var(--ink3)" }}>{b.count}/{b.total}</span>
                          </div>
                          <LinearBar pct={Math.round((b.count/b.total)*100)} color={b.color} h={4} />
                        </div>
                      ))}
                    </div> */}
                  </div>
                </div>

                {/*  PERFORMANCE TREND ALERT  */}
                {stats.performance.performanceTrend ==="improving" && (
                  <div className="alert-success fade-up" style={{ animationDelay:".4s" }}>
                    <span style={{ fontSize: 20 }}></span>
                    <div>
                      <strong>Performance Improving!</strong>&nbsp;
                      <span>Your recent exam scores show consistent improvement. Keep up the excellent work!</span>
                    </div>
                    <button style={{ marginLeft:"auto", background:"none", border:"none", cursor:"pointer", color:"#065f46", opacity: .6 }}>
                      {Icons.x?.(16,"#065f46")}
                    </button>
                  </div>
                )}

                {/*  LEADERBOARD SECTION  */}
                {!lbLoading && leaderboard.length > 0 && (
                  <div className="fade-up" style={{ animationDelay:".45s", marginTop: 20 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: 16 }}>
                      <div style={{ display:"flex", alignItems:"center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 7, background:"rgba(245,158,11,.1)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>
                        </div>
                        <div>
                          <h3 className="display" style={{ fontSize: 16, fontWeight: 800, color:"var(--ink)", margin: 0 }}>Leaderboard</h3>
                          <p style={{ fontSize: 11, color:"var(--ink2)", margin: 0 }}>Top performers this month</p>
                        </div>
                      </div>
                      <button className="btn btn-ghost" onClick={() => navigate("/v2/student/leaderboard")} style={{ fontSize: 12 }}>
                        View All {Icons.chevron?.(13)}
                      </button>
                    </div>

                    {/* Top 3 Podium */}
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
                      {leaderboard.slice(0, 3).map((student, idx) => {
                        const podiumColors = [
                          { bg:"rgba(255,215,0,.12)", border:"#ffd700", name:"1st", emoji:"" },
                          { bg:"rgba(192,192,192,.1)", border:"#c0c0c0", name:"2nd", emoji:"" },
                          { bg:"rgba(205,127,50,.1)", border:"#cd7f32", name:"3rd", emoji:"" },
                        ];
                        const colors = podiumColors[idx];
                        return (
                          <div key={student.studentId || idx} className="card" style={{
                            padding:"18px",
                            textAlign:"center",
                            background: colors.bg,
                            border: `2px solid ${colors.border}`,
                            boxShadow: idx === 0 ? `0 4px 20px rgba(255,215,0,.2)` :"none",
                          }}>
                            <div style={{ fontSize: 22, marginBottom: 4 }}>{colors.emoji}</div>
                            <div style={{
                              width: 50, height: 50, borderRadius:"50%", background:"#5E6BFF",
                              display:"flex", alignItems:"center", justifyContent:"center",
                              color:"white", fontSize: 18, fontWeight: 800, margin:"0 auto 10px",
                              border: `3px solid ${colors.border}`
                            }}>
                              {student.name?.[0] ||"?"}
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 700, color:"var(--ink)", marginBottom: 4 }}>{student.name}</div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: colors.border }}>{student.points}</div>
                            <div style={{ fontSize: 10, color:"var(--ink3)", marginTop: 4 }}>points</div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Leaderboard Rows */}
                    <div className="card" style={{ padding:"16px 18px" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color:"var(--ink2)", marginBottom: 12, textTransform:"uppercase", letterSpacing:".06em" }}>Full Rankings</div>
                      {leaderboard.slice(3, 8).map((student) => (
                        <LeaderboardRow
                          key={student.studentId || student.rank}
                          rank={student.rank}
                          name={student.name}
                          avatar={student.avatar}
                          points={student.points}
                          streak={student.streak}
                          avgScore={student.avgScore}
                          coursesCompleted={student.coursesCompleted}
                          isCurrentUser={student.studentId === (loginUser?.id || loginUser?._id)}
                          level={student.level}
                        />
                      ))}
                      {leaderboard.length <= 3 && (
                        <div style={{ textAlign:"center", padding:"20px 0", color:"var(--ink3)", fontSize: 13 }}>
                          Be the first to climb the rankings!
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/*  ACHIEVEMENTS & BADGES SECTION  */}
                {!lbLoading && leaderboardAchievements && (
                  <div className="fade-up" style={{ animationDelay:".5s", marginTop: 20 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: 16 }}>
                      <div style={{ display:"flex", alignItems:"center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 7, background:"rgba(236,72,153,.1)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></svg>
                        </div>
                        <div>
                          <h3 className="display" style={{ fontSize: 16, fontWeight: 800, color:"var(--ink)", margin: 0 }}>Your Achievements</h3>
                          <p style={{ fontSize: 11, color:"var(--ink2)", margin: 0 }}>{leaderboardAchievements.totalEarned} badges earned</p>
                        </div>
                      </div>
                      <button className="btn btn-ghost" onClick={() => navigate("/v2/student/profile")} style={{ fontSize: 12 }}>
                        View Profile {Icons.chevron?.(13)}
                      </button>
                    </div>

                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 16 }}>
                      {/* Earned Badges */}
                      <div className="card" style={{ padding:"18px" }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color:"var(--ink2)", marginBottom: 12, textTransform:"uppercase", letterSpacing:".06em" }}>Earned Badges</div>
                        {leaderboardAchievements.earned.length > 0 ? (
                          <div style={{ display:"flex", flexWrap:"wrap", gap: 10 }}>
                            {leaderboardAchievements.earned.slice(0, 6).map((badge) => (
                              <div key={badge.id} style={{
                                padding:"10px 14px", borderRadius: 7,
                                background:"rgba(245,158,11,.1)",
                                border:"1px solid rgba(245,158,11,.3)",
                                textAlign:"center", minWidth: 80
                              }}>
                                <div style={{ fontSize: 24, marginBottom: 4 }}>{badge.icon}</div>
                                <div style={{ fontSize: 10, fontWeight: 700, color:"var(--ink)" }}>{badge.name}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ textAlign:"center", padding:"20px 0", color:"var(--ink3)", fontSize: 13 }}>
                            Start earning badges by completing courses!
                          </div>
                        )}
                      </div>

                      {/* Next Badge to Unlock */}
                      <div className="card" style={{ padding:"18px" }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color:"var(--ink2)", marginBottom: 12, textTransform:"uppercase", letterSpacing:".06em" }}>Next Badge</div>
                        {leaderboardAchievements.nextBadge ? (
                          <div style={{ display:"flex", alignItems:"center", gap: 14, padding:"14px", borderRadius: 7, background:"rgba(148,163,184,.1)" }}>
                            <div style={{ fontSize: 36 }}>{leaderboardAchievements.nextBadge.icon}</div>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 700, color:"var(--ink)", marginBottom: 4 }}>{leaderboardAchievements.nextBadge.name}</div>
                              <div style={{ fontSize: 11, color:"var(--ink2)" }}>{leaderboardAchievements.nextBadge.description}</div>
                            </div>
                          </div>
                        ) : (
                          <div style={{ textAlign:"center", padding:"20px 0", color:"#10b981", fontSize: 13, fontWeight: 600 }}>
                            All badges unlocked! Amazing!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/*  QUICK LINKS TO NEW DASHBOARD SECTIONS  */}
                <div className="fade-up" style={{ animationDelay:".55s", marginTop: 20 }}>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap: 12 }}>
                    <button onClick={() => navigate("/v2/student/leaderboard")} className="card lift" style={{ padding:"16px 20px", cursor:"pointer", border:"none", textAlign:"left", transition:"all var(--tr)" }}>
                      <div style={{ display:"flex", alignItems:"center", gap: 12 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 7, background:"rgba(99,102,241,.1)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                          {Icons.trophy?.(20,"#6366f1")}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color:"var(--ink)" }}>Full Leaderboard</div>
                          <div style={{ fontSize: 11, color:"var(--ink2)" }}>See all rankings & compete</div>
                        </div>
                        <div style={{ marginLeft:"auto" }}>{Icons.chevron?.(16,"var(--ink3)")}</div>
                      </div>
                    </button>
                    <button onClick={() => navigate("/v2/student/settings")} className="card lift" style={{ padding:"16px 20px", cursor:"pointer", border:"none", textAlign:"left", transition:"all var(--tr)" }}>
                      <div style={{ display:"flex", alignItems:"center", gap: 12 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 7, background:"rgba(16,185,129,.1)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color:"var(--ink)" }}>Settings</div>
                          <div style={{ fontSize: 11, color:"var(--ink2)" }}>Customize your experience</div>
                        </div>
                        <div style={{ marginLeft:"auto" }}>{Icons.chevron?.(16,"var(--ink3)")}</div>
                      </div>
                    </button>
                  </div>
                </div>

              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}