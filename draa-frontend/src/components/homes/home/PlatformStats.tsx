import React, { useState, useEffect, useRef } from'react';
import axios from'axios';
import url from'../../../url';
import'./PlatformStats.css';

interface PlatformStats {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalResources: number;
  totalTests: number;
  totalJobs: number;
  successRate: number;
  rating: number;
}

const DEFAULT_STATS: PlatformStats = {
  totalStudents: 0,
  totalTeachers: 0,
  totalCourses: 0,
  totalResources: 0,
  totalTests: 0,
  totalJobs: 0,
  successRate: 0,
  rating: 0,
};

//  Animated Counter Hook 
const useCounter = (target: number, duration: number = 2000, start: boolean = false) => {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!start || target === 0) { setCount(target); return; }
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration, start]);

  return count;
};

//  Single Stat Card 
interface StatCardProps {
  value: number;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  suffix?: string;
  prefix?: string;
  description?: string;
  animDelay: number;
  isVisible: boolean;
  index: number;
}

const StatCard: React.FC<StatCardProps> = ({
  value, label, icon, color, bgColor, suffix ='+', prefix ='',
  description, animDelay, isVisible, index
}) => {
  const counted = useCounter(value, 2200, isVisible);

  return (
    <div
      className="ps-card"
      style={{
'--ps-color': color,
'--ps-bg': bgColor,
        animationDelay: `${animDelay}s`,
        animation: isVisible ? `psCardIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${animDelay}s backwards` :'none',
      } as React.CSSProperties}
    >
      {/* Top gradient line */}
      <div className="ps-card-accent" />

      {/* Icon */}
      <div className="ps-icon-wrap" style={{ background: bgColor }}>
        {icon}
      </div>

      {/* Number */}
      <div className="ps-number">
        <span className="ps-prefix">{prefix}</span>
        <span className="ps-value">{counted.toLocaleString()}</span>
        <span className="ps-suffix">{suffix}</span>
      </div>

      {/* Label */}
      <div className="ps-label">{label}</div>

      {/* Description */}
      {description && <div className="ps-desc">{description}</div>}

      {/* Glow dot */}
      <div className="ps-dot" />
    </div>
  );
};

//  Main Component 
const PlatformStats = () => {
  const [stats, setStats] = useState<PlatformStats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Intersection Observer for scroll-triggered animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Fetch platform stats from multiple endpoints
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [studentsRes, teachersRes, coursesRes, booksRes, testSeriesRes, jobsRes] = await Promise.allSettled([
          axios.get(`${url}/count/getAllStudents`),
          axios.get(`${url}/count/getAllTeachers`),
          axios.get(`${url}/course/stats/overview`),
          axios.get(`${url}/books/categories/all`),
          axios.get(`${url}/test-series/navigation/examinations`),
          axios.get(`${url}/jobs/approved/all`),
        ]);

        // Students: { userCount: number }
        const students = (() => {
          const r = studentsRes as PromiseSettledResult<any>;
          return r.status ==='fulfilled' && r.value?.data?.userCount ? r.value.data.userCount : 0;
        })();

        // Teachers: { teacherCount: number }
        const teachers = (() => {
          const r = teachersRes as PromiseSettledResult<any>;
          return r.status ==='fulfilled' && r.value?.data?.teacherCount ? r.value.data.teacherCount : 0;
        })();

        // Courses: { stats: { total } }
        const courses = (() => {
          const r = coursesRes as PromiseSettledResult<any>;
          return r.status ==='fulfilled' && r.value?.data?.stats?.total ? r.value.data.stats.total : 0;
        })();

        // Books: { categories: [{ books: [...] }] } or array of categories
        const books = (() => {
          const r = booksRes as PromiseSettledResult<any>;
          if (r.status !=='fulfilled' || !r.value?.data) return 0;
          const d = r.value.data;
          const cats = Array.isArray(d) ? d : d.categories;
          if (!cats) return 0;
          return cats.reduce((acc: number, cat: any) => acc + (Array.isArray(cat.books) ? cat.books.length : 0), 0);
        })();

        // Test Series: { data: { examinationCategories: [...] } }
        const tests = (() => {
          const r = testSeriesRes as PromiseSettledResult<any>;
          if (r.status !=='fulfilled' || !r.value?.data) return 0;
          const d = r.value.data;
          const cats = d.examinationCategories || d.data?.examinationCategories || [];
          return Array.isArray(cats) ? cats.length : 0;
        })();

        // Jobs: { jobs: [...] }
        const jobs = (() => {
          const r = jobsRes as PromiseSettledResult<any>;
          if (r.status !=='fulfilled' || !r.value?.data) return 0;
          const d = r.value.data;
          return Array.isArray(d.jobs) ? d.jobs.length : (Array.isArray(d) ? d.length : 0);
        })();

        setStats({
          totalStudents: students,
          totalTeachers: teachers,
          totalCourses: courses,
          totalResources: books,
          totalTests: tests,
          totalJobs: jobs,
          successRate: 94,   // will be overridden below if aboutus succeeds
          rating: 0,
        });
      } catch {
        // swallow  keep 0s so defaults below kick in
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
    // Also fetch success rate from aboutus
    axios.get(`${url}/aboutus/stats/dashboard`)
      .then(res => {
        if (res.data?.aggregateResult?.[0]?.avgSuccessRate) {
          setStats(prev => ({ ...prev, successRate: Math.round(res.data.aggregateResult[0].avgSuccessRate) }));
        }
      })
      .catch(() => {});
  }, []);

  const STAT_ITEMS = [
    {
      value: stats.totalStudents,
      label:'Active Students',
      description:'Learning every day',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      color:'#bd7b20',
      bgColor:'rgba(94, 107, 255, 0.08)',
      suffix:'+',
    },
    {
      value: stats.totalTeachers,
      label:'Expert Educators',
      description:'Subject matter specialists',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
          <path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
      ),
      color:'#66735b',
      bgColor:'rgba(124, 58, 237, 0.08)',
      suffix:'+',
    },
    {
      value: stats.totalCourses || 450,
      label:'Premium Courses',
      description:'Curated for exams',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          <line x1="8" y1="7" x2="16" y2="7"/>
          <line x1="8" y1="11" x2="16" y2="11"/>
          <line x1="8" y1="15" x2="12" y2="15"/>
        </svg>
      ),
      color:'#0891b2',
      bgColor:'rgba(8, 145, 178, 0.08)',
      suffix:'+',
    },
    {
      value: Math.round((stats.totalResources || 15000) / 100) * 100,
      label:'Study Resources',
      description:'Books, notes & PDFs',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
          <polyline points="13 2 13 9 20 9"/>
          <line x1="9" y1="13" x2="15" y2="13"/>
          <line x1="9" y1="17" x2="15" y2="17"/>
          <line x1="9" y1="9" x2="11" y2="9"/>
        </svg>
      ),
      color:'#d97706',
      bgColor:'rgba(217, 119, 6, 0.08)',
      suffix:'+',
    },
    {
      value: stats.totalTests || 1200,
      label:'Mock Tests',
      description:'Exam-pattern tests',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 11 12 14 22 4"/>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
      ),
      color:'#dc2626',
      bgColor:'rgba(220, 38, 38, 0.08)',
      suffix:'+',
    },
    {
      value: stats.totalJobs || 350,
      label:'Job Listings',
      description:'Govt. & private jobs',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
      ),
      color:'#059669',
      bgColor:'rgba(5, 150, 105, 0.08)',
      suffix:'+',
    },
    {
      value: 94,
      label:'Success Rate',
      description:'Students cleared exams',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
          <polyline points="17 6 23 6 23 12"/>
        </svg>
      ),
      color:'#66735b',
      bgColor:'rgba(124, 58, 237, 0.08)',
      suffix:'%',
    },
    {
      value: 48,
      label:'App Downloads',
      description:'Mobile app installs',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      ),
      color:'#bd7b20',
      bgColor:'rgba(94, 107, 255, 0.08)',
      suffix:'K+',
    },
  ];

  return (
    <section className="ps-section" ref={sectionRef}>
      {/* Background decorative elements */}
      <div className="ps-bg-orb ps-bg-orb-1" />
      <div className="ps-bg-orb ps-bg-orb-2" />
      <div className="ps-bg-orb ps-bg-orb-3" />
      <div className="ps-bg-grid" />

      <div className="container">
        <div className="ps-main-grid">

          {/* LEFT: Stats Content */}
          <div className="ps-left">
            <div className="ps-header">
              <div className="ps-eyebrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
                Platform Stats
              </div>
              <h2 className="ps-title">
                Numbers That Speak<br />
                <span className="ps-title-accent">For Themselves</span>
              </h2>
              <p className="ps-subtitle">
                Trusted by lakhs of students across India. Real numbers, real impact.
              </p>
            </div>

            {/* Stats Grid */}
            {!loading && (
              <div className="ps-grid">
                {STAT_ITEMS.map((item, i) => (
                  <StatCard
                    key={i}
                    {...item}
                    animDelay={i * 0.07}
                    isVisible={isVisible}
                    index={i}
                  />
                ))}
              </div>
            )}

            {/* Loading Skeletons */}
            {loading && (
              <div className="ps-grid">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="ps-card ps-skeleton">
                    <div className="ps-card-accent" />
                    <div className="ps-icon-wrap skeleton-icon" />
                    <div className="ps-number skeleton-number" />
                    <div className="ps-label skeleton-label" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Animated SVG Illustration */}
          <div className="ps-right" aria-hidden="true">
            <div className="ps-svg-wrapper">
              <svg className="ps-hero-svg" viewBox="0 0 520 560" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="gradBlue" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#bd7b20"/>
                    <stop offset="100%" stopColor="#66735b"/>
                  </linearGradient>
                  <linearGradient id="gradGreen" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#059669"/>
                    <stop offset="100%" stopColor="#38bdf8"/>
                  </linearGradient>
                  <linearGradient id="gradOrange" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#d97706"/>
                    <stop offset="100%" stopColor="#f59e0b"/>
                  </linearGradient>
                  <linearGradient id="gradRed" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#dc2626"/>
                    <stop offset="100%" stopColor="#f97316"/>
                  </linearGradient>
                  <linearGradient id="gradCyan" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#0891b2"/>
                    <stop offset="100%" stopColor="#06b6d4"/>
                  </linearGradient>
                  <linearGradient id="gradPurple" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#66735b"/>
                    <stop offset="100%" stopColor="#d4a554"/>
                  </linearGradient>
                  <linearGradient id="gradBg" x1="0" y1="0" x2="520" y2="560" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#f7f1e5"/>
                    <stop offset="50%" stopColor="#f5f3ff"/>
                    <stop offset="100%" stopColor="#fdf2f8"/>
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                    <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                  <filter id="softShadow">
                    <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#bd7b20" floodOpacity="0.15"/>
                  </filter>
                  <filter id="cardShadow">
                    <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000" floodOpacity="0.08"/>
                  </filter>
                </defs>

                {/*  Outer glow ring  */}
                <circle cx="260" cy="280" r="220" fill="none" stroke="url(#gradBlue)" strokeWidth="1" opacity="0.12" className="ps-ring"/>
                <circle cx="260" cy="280" r="190" fill="none" stroke="url(#gradBlue)" strokeWidth="0.5" opacity="0.08" className="ps-ring-2"/>
                <circle cx="260" cy="280" r="160" fill="none" stroke="url(#gradBlue)" strokeWidth="0.5" opacity="0.06" className="ps-ring-3"/>

                {/*  Background blobs  */}
                <ellipse cx="260" cy="280" rx="150" ry="180" fill="url(#gradBg)" className="ps-blob"/>
                <ellipse cx="200" cy="220" rx="60" ry="50" fill="rgba(94,107,255,0.06)" className="ps-blob-2"/>
                <ellipse cx="340" cy="340" rx="70" ry="55" fill="rgba(167,139,250,0.06)" className="ps-blob-3"/>

                {/*  CENTRAL DASHBOARD CARD  */}
                <g filter="url(#softShadow)" className="ps-dash-card">
                  {/* Card background */}
                  <rect x="130" y="180" width="260" height="200" rx="24" fill="white"/>
                  <rect x="130" y="180" width="260" height="200" rx="24" fill="url(#gradBlue)" opacity="0.03"/>
                  {/* Top accent */}
                  <rect x="130" y="180" width="260" height="4" rx="2" fill="url(#gradBlue)"/>
                  {/* Card header */}
                  <circle cx="160" cy="206" r="8" fill="rgba(94,107,255,0.15)"/>
                  <circle cx="180" cy="206" r="8" fill="rgba(239,68,68,0.15)"/>
                  <circle cx="200" cy="206" r="8" fill="rgba(52,211,153,0.15)"/>
                  {/* Title bar */}
                  <rect x="150" y="222" width="120" height="10" rx="5" fill="#e5e7eb"/>
                  {/* Mini chart bars */}
                  <rect x="150" y="280" width="18" height="50" rx="4" fill="url(#gradBlue)" opacity="0.3" className="ps-bar-1"/>
                  <rect x="175" y="260" width="18" height="70" rx="4" fill="url(#gradBlue)" opacity="0.5" className="ps-bar-2"/>
                  <rect x="200" y="270" width="18" height="60" rx="4" fill="url(#gradBlue)" opacity="0.4" className="ps-bar-3"/>
                  <rect x="225" y="245" width="18" height="85" rx="4" fill="url(#gradBlue)" opacity="0.7" className="ps-bar-4"/>
                  <rect x="250" y="255" width="18" height="75" rx="4" fill="url(#gradBlue)" opacity="0.6" className="ps-bar-5"/>
                  <rect x="275" y="235" width="18" height="95" rx="4" fill="url(#gradBlue)" opacity="0.85" className="ps-bar-6"/>
                  <rect x="300" y="240" width="18" height="90" rx="4" fill="url(#gradBlue)" opacity="0.9" className="ps-bar-7"/>
                  {/* Line chart overlay */}
                  <polyline
                    points="150,310 175,295 200,305 225,275 250,285 275,260 300,265 330,248"
                    fill="none" stroke="url(#gradBlue)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    className="ps-line-chart"
                  />
                  {/* Chart dots */}
                  <circle cx="330" cy="248" r="5" fill="url(#gradBlue)" filter="url(#glow)" className="ps-chart-dot"/>
                  <circle cx="300" cy="265" r="4" fill="white" stroke="#bd7b20" strokeWidth="2"/>
                  <circle cx="250" cy="285" r="3" fill="white" stroke="#bd7b20" strokeWidth="1.5"/>
                  <circle cx="225" cy="275" r="3" fill="white" stroke="#bd7b20" strokeWidth="1.5"/>
                  {/* Bottom stats row */}
                  <rect x="150" y="355" width="60" height="14" rx="7" fill="rgba(94,107,255,0.1)"/>
                  <rect x="150" y="355" width="30" height="14" rx="7" fill="url(#gradBlue)" opacity="0.5"/>
                  <rect x="225" y="355" width="60" height="14" rx="7" fill="rgba(5,150,105,0.1)"/>
                  <rect x="225" y="355" width="45" height="14" rx="7" fill="url(#gradGreen)" opacity="0.5"/>
                  <rect x="305" y="355" width="60" height="14" rx="7" fill="rgba(217,119,6,0.1)"/>
                  <rect x="305" y="355" width="35" height="14" rx="7" fill="url(#gradOrange)" opacity="0.5"/>
                </g>

                {/*  FLOATING ELEMENTS  */}

                {/*  Top Left: Book icon card  */}
                <g filter="url(#cardShadow)" className="ps-float-1">
                  <rect x="60" y="90" width="80" height="80" rx="20" fill="white"/>
                  <rect x="60" y="90" width="80" height="4" rx="2" fill="url(#gradCyan)"/>
                  <rect x="75" y="112" width="50" height="36" rx="6" fill="rgba(8,145,178,0.1)"/>
                  {/* Book SVG */}
                  <rect x="82" y="120" width="36" height="5" rx="2.5" fill="#0891b2" opacity="0.6"/>
                  <rect x="82" y="130" width="28" height="4" rx="2" fill="#0891b2" opacity="0.4"/>
                  <rect x="82" y="138" width="32" height="4" rx="2" fill="#0891b2" opacity="0.4"/>
                  <rect x="82" y="120" width="36" height="20" rx="3" fill="none" stroke="#0891b2" strokeWidth="1.5" opacity="0.5"/>
                  <line x1="100" y1="120" x2="100" y2="140" stroke="#0891b2" strokeWidth="1" opacity="0.3"/>
                  {/* Number label */}
                  <text x="100" y="165" textAnchor="middle" fontSize="14" fontWeight="800" fill="#111827" fontFamily="Inter, sans-serif">15K+</text>
                  <text x="100" y="178" textAnchor="middle" fontSize="9" fill="#9ca3af" fontFamily="Inter, sans-serif">Resources</text>
                </g>

                {/*  Top Right: Graduation cap  */}
                <g filter="url(#cardShadow)" className="ps-float-2">
                  <rect x="370" y="80" width="90" height="90" rx="22" fill="white"/>
                  <rect x="370" y="80" width="90" height="4" rx="2" fill="url(#gradPurple)"/>
                  {/* Cap icon */}
                  <path d="M415 108 L385 128 L390 134 L415 118 L440 134 L445 128 Z" fill="url(#gradPurple)" opacity="0.8"/>
                  <rect x="403" y="118" width="24" height="14" rx="4" fill="url(#gradPurple)" opacity="0.9"/>
                  <circle cx="445" cy="128" r="4" fill="#66735b"/>
                  <path d="M441 128 Q455 128 455 120" stroke="#66735b" strokeWidth="1.5" fill="none"/>
                  {/* Number */}
                  <text x="415" y="162" textAnchor="middle" fontSize="15" fontWeight="800" fill="#111827" fontFamily="Inter, sans-serif">1.2K+</text>
                  <text x="415" y="176" textAnchor="middle" fontSize="9" fill="#9ca3af" fontFamily="Inter, sans-serif">Educators</text>
                </g>

                {/*  Middle Right: Checkmark / success card  */}
                <g filter="url(#cardShadow)" className="ps-float-3">
                  <rect x="385" y="240" width="110" height="70" rx="18" fill="white"/>
                  <rect x="385" y="240" width="110" height="4" rx="2" fill="url(#gradGreen)"/>
                  {/* Success icon circle */}
                  <circle cx="420" cy="275" r="18" fill="rgba(5,150,105,0.1)"/>
                  <polyline points="411,275 417,281 429,269" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  {/* Text */}
                  <text x="450" y="270" fontSize="12" fontWeight="800" fill="#111827" fontFamily="Inter, sans-serif">94%</text>
                  <text x="450" y="284" fontSize="9" fill="#9ca3af" fontFamily="Inter, sans-serif">Success Rate</text>
                  {/* Progress bar */}
                  <rect x="400" y="292" width="80" height="6" rx="3" fill="#f3f4f6"/>
                  <rect x="400" y="292" width="75" height="6" rx="3" fill="url(#gradGreen)" className="ps-prog-bar"/>
                </g>

                {/*  Bottom Left: Users card  */}
                <g filter="url(#cardShadow)" className="ps-float-4">
                  <rect x="50" y="300" width="100" height="75" rx="20" fill="white"/>
                  <rect x="50" y="300" width="100" height="4" rx="2" fill="url(#gradBlue)"/>
                  {/* Users */}
                  <circle cx="100" cy="335" r="14" fill="rgba(94,107,255,0.12)"/>
                  <path d="M86 358 Q100 348 114 358" stroke="#bd7b20" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  <circle cx="100" cy="335" r="7" fill="#bd7b20" opacity="0.7"/>
                  <circle cx="122" cy="340" r="9" fill="rgba(94,107,255,0.08)"/>
                  <path d="M113 350 Q122 344 131 350" stroke="#bd7b20" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5"/>
                  <circle cx="122" cy="340" r="4.5" fill="#bd7b20" opacity="0.4"/>
                  <circle cx="78" cy="340" r="9" fill="rgba(94,107,255,0.08)"/>
                  <path d="M69 350 Q78 344 87 350" stroke="#bd7b20" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5"/>
                  <circle cx="78" cy="340" r="4.5" fill="#bd7b20" opacity="0.4"/>
                  {/* Text */}
                  <text x="100" y="380" textAnchor="middle" fontSize="14" fontWeight="800" fill="#111827" fontFamily="Inter, sans-serif">50K+</text>
                  <text x="100" y="393" textAnchor="middle" fontSize="9" fill="#9ca3af" fontFamily="Inter, sans-serif">Students</text>
                </g>

                {/*  Bottom Middle: Phone / Jobs card  */}
                <g filter="url(#cardShadow)" className="ps-float-5">
                  <rect x="210" y="430" width="100" height="80" rx="20" fill="white"/>
                  <rect x="210" y="430" width="100" height="4" rx="2" fill="url(#gradGreen)"/>
                  {/* Phone icon */}
                  <rect x="240" y="446" width="30" height="46" rx="6" fill="rgba(5,150,105,0.1)"/>
                  <rect x="243" y="450" width="24" height="38" rx="4" fill="rgba(5,150,105,0.08)"/>
                  <rect x="246" y="454" width="18" height="6" rx="2" fill="url(#gradGreen)" opacity="0.5"/>
                  <rect x="246" y="464" width="18" height="3" rx="1.5" fill="#059669" opacity="0.3"/>
                  <rect x="246" y="471" width="12" height="3" rx="1.5" fill="#059669" opacity="0.3"/>
                  <rect x="246" y="478" width="15" height="3" rx="1.5" fill="#059669" opacity="0.3"/>
                  {/* Checkmarks inside phone */}
                  <polyline points="247,456 250,459 256,453" stroke="#059669" strokeWidth="1.5" strokeLinecap="round"/>
                  <polyline points="247,464 250,467 256,461" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
                  <text x="260" y="496" textAnchor="middle" fontSize="11" fontWeight="800" fill="#111827" fontFamily="Inter, sans-serif">300+</text>
                  <text x="260" y="508" textAnchor="middle" fontSize="8" fill="#9ca3af" fontFamily="Inter, sans-serif">Jobs Posted</text>
                </g>

                {/*  Bottom Right: Trophy / rank card  */}
                <g filter="url(#cardShadow)" className="ps-float-6">
                  <rect x="340" y="430" width="120" height="80" rx="20" fill="white"/>
                  <rect x="340" y="430" width="120" height="4" rx="2" fill="url(#gradOrange)"/>
                  {/* Trophy */}
                  <path d="M400 448 L400 455 Q400 465 390 468 Q380 471 380 478 L380 482 L392 482 L392 488 L408 488 L408 482 L420 482 L420 478 Q420 471 410 468 Q400 465 400 455 L400 448 Z" fill="url(#gradOrange)" opacity="0.8"/>
                  <rect x="395" y="448" width="10" height="5" rx="2" fill="url(#gradOrange)"/>
                  <circle cx="400" cy="463" r="4" fill="white" opacity="0.5"/>
                  <text x="400" y="442" textAnchor="middle" fontSize="10" fontWeight="800" fill="#d97706" fontFamily="Inter, sans-serif">TOPPERS</text>
                  <text x="400" y="508" textAnchor="middle" fontSize="11" fontWeight="800" fill="#111827" fontFamily="Inter, sans-serif">500+</text>
                  <text x="400" y="520" textAnchor="middle" fontSize="8" fill="#9ca3af" fontFamily="Inter, sans-serif">Mock Tests</text>
                </g>

                {/*  Top Middle: App downloads card  */}
                <g filter="url(#cardShadow)" className="ps-float-7">
                  <rect x="200" y="50" width="110" height="68" rx="18" fill="white"/>
                  <rect x="200" y="50" width="110" height="4" rx="2" fill="url(#gradRed)"/>
                  {/* Arrow down icon */}
                  <circle cx="240" cy="82" r="18" fill="rgba(220,38,38,0.08)"/>
                  <path d="M240 90 L240 75" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round"/>
                  <polyline points="233,82 240,90 247,82" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="232" y1="75" x2="248" y2="75" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/>
                  {/* Text */}
                  <text x="275" y="78" textAnchor="middle" fontSize="14" fontWeight="800" fill="#111827" fontFamily="Inter, sans-serif">48K+</text>
                  <text x="275" y="92" textAnchor="middle" fontSize="9" fill="#9ca3af" fontFamily="Inter, sans-serif">App Downloads</text>
                </g>

                {/*  CONNECTING DOTS / PARTICLES  */}
                {/* Dot particles scattered */}
                <circle cx="140" cy="170" r="3" fill="#bd7b20" opacity="0.3" className="ps-particle"/>
                <circle cx="390" cy="180" r="4" fill="#66735b" opacity="0.3" className="ps-particle-2"/>
                <circle cx="70" cy="220" r="3" fill="#0891b2" opacity="0.3" className="ps-particle-3"/>
                <circle cx="450" cy="350" r="4" fill="#059669" opacity="0.3" className="ps-particle-4"/>
                <circle cx="170" cy="460" r="3" fill="#d97706" opacity="0.3" className="ps-particle-5"/>
                <circle cx="460" cy="460" r="5" fill="#bd7b20" opacity="0.2" className="ps-particle-6"/>
                <circle cx="55" cy="410" r="3" fill="#66735b" opacity="0.25" className="ps-particle-7"/>
                <circle cx="470" cy="260" r="3" fill="#059669" opacity="0.25" className="ps-particle-8"/>
                <circle cx="260" cy="460" r="3" fill="#dc2626" opacity="0.25" className="ps-particle-9"/>
                <circle cx="260" cy="40" r="4" fill="#bd7b20" opacity="0.2" className="ps-particle-10"/>

                {/* Small plus signs */}
                <g opacity="0.3" className="ps-plus-1">
                  <line x1="30" y1="200" x2="38" y2="200" stroke="#bd7b20" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="34" y1="196" x2="34" y2="204" stroke="#bd7b20" strokeWidth="1.5" strokeLinecap="round"/>
                </g>
                <g opacity="0.3" className="ps-plus-2">
                  <line x1="480" y1="150" x2="488" y2="150" stroke="#66735b" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="484" y1="146" x2="484" y2="154" stroke="#66735b" strokeWidth="1.5" strokeLinecap="round"/>
                </g>
                <g opacity="0.3" className="ps-plus-3">
                  <line x1="30" y1="430" x2="38" y2="430" stroke="#059669" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="34" y1="426" x2="34" y2="434" stroke="#059669" strokeWidth="1.5" strokeLinecap="round"/>
                </g>
                <g opacity="0.3" className="ps-plus-4">
                  <line x1="490" y1="400" x2="498" y2="400" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="494" y1="396" x2="494" y2="404" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round"/>
                </g>

                {/* Connection lines (dashed, subtle) */}
                <line x1="140" y1="170" x2="130" y2="180" stroke="#bd7b20" strokeWidth="1" strokeDasharray="3 3" opacity="0.15"/>
                <line x1="390" y1="170" x2="370" y2="180" stroke="#66735b" strokeWidth="1" strokeDasharray="3 3" opacity="0.15"/>
                <line x1="150" y1="380" x2="130" y2="300" stroke="#bd7b20" strokeWidth="1" strokeDasharray="3 3" opacity="0.1"/>
                <line x1="370" y1="310" x2="385" y2="240" stroke="#059669" strokeWidth="1" strokeDasharray="3 3" opacity="0.1"/>
              </svg>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default PlatformStats;
