"use client";

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import url, { getImageUrl } from "../../../url";
import {
  CheckCircle2,
  ArrowRight,
  Video,
  Play,
  Pause,
  Users,
  Check,
  X,
  RefreshCw,
  Mail,
  BookOpen,
  Sparkles,
  Award,
  Crown,
  Download,
  Briefcase,
  FileText,
  ChevronRight,
  Star,
  Book,
  File,
  TrendingUp,
  Search
} from "lucide-react";
import "./platformfeatures.css";

// ── TYPES & MOCK DATA ──
interface Course {
  id: number;
  title: string;
  category: "UPSC" | "SSC" | "Banking";
  tutor: string;
  rating: number;
  lessons: number;
  duration: string;
}

interface TestQuestion {
  question: string;
  options: { key: string; text: string }[];
  correctAnswer: string;
  explanation: string;
}

interface StudyBook {
  id: number;
  title: string;
  author: string;
  chapters: number;
  pages: number;
  progress: number;
  color: string;
  details: string;
}

interface JobNotification {
  id: number;
  title: string;
  date: string;
  status: string;
}

interface PYQItem {
  id: number;
  title: string;
  size: string;
}

interface SyllabusTopic {
  id: number;
  title: string;
  checked: boolean;
}

interface BlogArticle {
  id: number;
  title: string;
  readTime: string;
}

const coursesData: Course[] = [
  { id: 1, title: "UPSC CSE Comprehensive 2026", category: "UPSC", tutor: "Dr. Anita Sharma", rating: 4.9, lessons: 180, duration: "350 hrs" },
  { id: 2, title: "SSC CGL Master Class Batch", category: "SSC", tutor: "Rohan Verma", rating: 4.8, lessons: 120, duration: "220 hrs" },
  { id: 3, title: "Bank PO Ultimate Foundation", category: "Banking", tutor: "Sanjay Sen", rating: 4.7, lessons: 95, duration: "160 hrs" }
];

const testQuestion: TestQuestion = {
  question: "Which constitutional amendment is widely referred to as the 'Mini Constitution' of India?",
  options: [
    { key: "A", text: "44th Amendment" },
    { key: "B", text: "42nd Amendment" },
    { key: "C", text: "86th Amendment" },
    { key: "D", text: "73rd Amendment" }
  ],
  correctAnswer: "B",
  explanation: "The 42nd Amendment (1976) introduced massive changes, including adding 'Socialist', 'Secular', and 'Integrity' to the Preamble."
};

const booksData: StudyBook[] = [
  { id: 1, title: "Indian Polity Master Guide", author: "M. Laxmikanth Prep", chapters: 12, pages: 420, progress: 65, color: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)", details: "Constitutional framework, Fundamental Rights, Directive Principles." },
  { id: 2, title: "Quantitative Aptitude Tricks", author: "R.S. Aggarwal Edition", chapters: 18, pages: 550, progress: 40, color: "linear-gradient(135deg, #7c2d12 0%, #ea580c 100%)", details: "Speed math tricks, Arithmetic rules, Shortcuts for banking." },
  { id: 3, title: "Modern Indian History Atlas", author: "Bipin Chandra Guide", chapters: 8, pages: 310, progress: 85, color: "linear-gradient(135deg, #064e3b 0%, #10b981 100%)", details: "Chronology of Freedom movement, British rule, consolidation." }
];

const jobsData: JobNotification[] = [
  { id: 1, title: "UPSC CSE 2026 Notification Out", date: "Apply by July 30", status: "Active" },
  { id: 2, title: "SSC CGL 2026 Registration Open", date: "Apply by Aug 15", status: "Active" },
  { id: 3, title: "IBPS PO Exam Dates Released", date: "Exam Starts Oct 10", status: "Announced" }
];

const pyqsData: PYQItem[] = [
  { id: 1, title: "UPSC Prelims 2025 Polity Paper I", size: "2.4 MB" },
  { id: 2, title: "SSC CGL 2024 Math Paper I", size: "1.8 MB" },
  { id: 3, title: "Bank PO 2023 English PYQ", size: "1.2 MB" }
];

const initialSyllabus: SyllabusTopic[] = [
  { id: 1, title: "Indian Polity - Preamble & Key Features", checked: true },
  { id: 2, title: "Quantitative Aptitude - Percentage & Ratio", checked: true },
  { id: 3, title: "Modern History - Revolt of 1857", checked: false },
  { id: 4, title: "English - Active/Passive Voice Rules", checked: false }
];

const blogsData: BlogArticle[] = [
  { id: 1, title: "How to Crack UPSC Prelims in 1st Attempt", readTime: "5 mins read" },
  { id: 2, title: "10 Math Shortcuts for SSC CGL Exam", readTime: "8 mins read" },
  { id: 3, title: "Best Revision Strategies for Aspirants", readTime: "6 mins read" }
];

const PlatformFeatures = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  // Tab 0: Premium Courses state
  const [courses, setCourses] = useState<Course[]>(coursesData);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [hoveredCourseId, setHoveredCourseId] = useState<number | null>(null);

  // Tab 1: Test Series state
  const [testSeriesList, setTestSeriesList] = useState<any[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });

  // Tab 2: Premium Books state
  const [books, setBooks] = useState<StudyBook[]>(booksData);
  const [activeBookIndex, setActiveBookIndex] = useState<number>(0);

  // Tab 3: Free Resources state
  const [jobs, setJobs] = useState<JobNotification[]>(jobsData);
  const [pyqs, setPyqs] = useState<PYQItem[]>(pyqsData);
  const [activeResourceTab, setActiveResourceTab] = useState<"jobs" | "pyqs" | "syllabus" | "blogs">("jobs");
  const [downloadedPyqs, setDownloadedPyqs] = useState<number[]>([]);
  const [syllabusList, setSyllabusList] = useState<SyllabusTopic[]>(initialSyllabus);
  const [blogs, setBlogs] = useState<any[]>(blogsData);

  // Newsletter state
  const [emailInput, setEmailInput] = useState<string>("");
  const [subscribeStatus, setSubscribeStatus] = useState<"idle" | "loading" | "success" | "error" | "already">("idle");
  const [subscribeMsg, setSubscribeMsg] = useState<string>("");

  const formatDuration = (mins = 0) => {
    if (!mins) return "0m";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const getCategory = (c: any) => {
    const cat = (c.course_category || "").toLowerCase();
    const title = (c.title || "").toLowerCase();
    if (cat.includes("upsc") || title.includes("upsc") || title.includes("ias") || title.includes("civil")) return "UPSC";
    if (cat.includes("ssc") || title.includes("ssc") || title.includes("cgl") || title.includes("chsl")) return "SSC";
    if (cat.includes("bank") || cat.includes("ibps") || cat.includes("sbi") || title.includes("bank") || title.includes("po")) return "Banking";
    return "UPSC";
  };

  // Fetch real data on mount
  useEffect(() => {
    const fetchAllData = async () => {
      // 1. Fetch courses
      try {
        const res = await fetch(`${url}/course/allCourses`);
        const json = await res.json();
        const rawCourses = json?.data?.courses || [];
        if (rawCourses.length > 0) {
          const formatted = rawCourses.map((c: any, index: number) => ({
            id: c._id || index,
            title: c.title,
            category: getCategory(c),
            tutor: c.teacher?.name || c.teacher?.tname || "Atul Biswas",
            rating: c.averageRating || c.rating || 4.8,
            lessons: c.chapters_count || c.video_count || 12,
            duration: formatDuration(c.duration || 200),
            coverphoto: c.coverphoto
          }));
          setCourses(formatted.slice(0, 5));
        }
      } catch (err) {
        console.error("PlatformFeatures: Failed to load courses", err);
      }

      // 2. Fetch books
      try {
        const res = await fetch(`${url}/books/approved?page=1&limit=10`);
        const json = await res.json();
        const rawBooks = json.books || [];
        if (rawBooks.length > 0) {
          const formatted = rawBooks.map((b: any, index: number) => ({
            id: b._id || index,
            title: b.title,
            author: b.author || "Draa",
            chapters: b.chapters || 10,
            pages: b.pages || 250,
            progress: [65, 40, 85, 50, 70][index % 5],
            color: [
              "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
              "linear-gradient(135deg, #7c2d12 0%, #ea580c 100%)",
              "linear-gradient(135deg, #064e3b 0%, #10b981 100%)"
            ][index % 3],
            details: b.description || b.details || "Comprehensive study material for competitive exams.",
            coverImage: b.coverImage
          }));
          setBooks(formatted.slice(0, 5));
        }
      } catch (err) {
        console.error("PlatformFeatures: Failed to load books", err);
      }

      // 3. Fetch jobs
      try {
        const res = await fetch(`${url}/jobs/approved/all`);
        const json = await res.json();
        const rawJobs = json.data || json || [];
        if (rawJobs.length > 0) {
          const formatted = rawJobs.map((j: any, index: number) => ({
            id: j._id || index,
            title: j.jobTitle || j.title,
            date: j.lastDateToApply ? `Apply by ${new Date(j.lastDateToApply).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : "Apply Now",
            status: j.isActive || j.status === "Active" ? "Active" : "Announced"
          }));
          setJobs(formatted.slice(0, 5));
        }
      } catch (err) {
        console.error("PlatformFeatures: Failed to load jobs", err);
      }

      // 4. Fetch PYQs
      try {
        const res = await fetch(`${url}/pyq/approved`);
        const json = await res.json();
        const rawPyqs = json.data || json || [];
        if (rawPyqs.length > 0) {
          const formatted = rawPyqs.map((p: any, index: number) => ({
            id: p._id || index,
            title: p.title || p.pyqTitle,
            size: p.fileSize || "2.5 MB",
            fileUrl: p.file || p.pdfUrl || p.pdf
          }));
          setPyqs(formatted.slice(0, 5));
        }
      } catch (err) {
        console.error("PlatformFeatures: Failed to load PYQs", err);
      }

      // 5. Fetch Test Series
      try {
        const res = await fetch(`${url}/test-series/navigation/examinations`);
        const json = await res.json();
        const rawExams = json?.data?.examinationCategories || [];
        if (rawExams.length > 0) {
          setTestSeriesList(rawExams.slice(0, 4));
        }
      } catch (err) {
        console.error("PlatformFeatures: Failed to load test series", err);
      }

      // 6. Fetch Blogs
      try {
        const res = await fetch(`${url}/course/allCourseContent`);
        const json = await res.json();
        const rawBlogs = json.data || json || [];
        if (rawBlogs.length > 0) {
          const formatted = rawBlogs.map((b: any, index: number) => ({
            id: b._id || index,
            title: b.title,
            readTime: b.readTime || "5 mins read"
          }));
          setBlogs(formatted.slice(0, 5));
        }
      } catch (err) {
        console.error("PlatformFeatures: Failed to load blogs", err);
      }
    };

    fetchAllData();
  }, []);

  // Auto-advance mechanism (cycles every 8 seconds)
  useEffect(() => {
    if (isPaused) return;
    const intervalTime = 80;
    const step = 1;
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveTab((currTab) => (currTab + 1) % 4);
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPaused]);

  // Handle Tab Switch manually
  const handleTabClick = (index: number) => {
    setActiveTab(index);
    setProgress(0);
    setIsPaused(true); // Lock auto-advancing once user manual clicks
  };

  // Quiz handler
  const handleQuizAnswer = (key: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(key);
    if (key === testQuestion.correctAnswer) {
      setQuizScore((prev) => ({ correct: prev.correct + 1, total: prev.total + 1 }));
    } else {
      setQuizScore((prev) => ({ ...prev, total: prev.total + 1 }));
    }
  };

  const resetQuiz = () => {
    setSelectedAnswer(null);
  };

  // PYQ Download simulated click
  const handleDownloadPyq = (id: number) => {
    if (downloadedPyqs.includes(id)) return;
    setDownloadedPyqs((prev) => [...prev, id]);
  };

  // Syllabus Toggle
  const toggleSyllabusTopic = (id: number) => {
    setSyllabusList((prev) =>
      prev.map((topic) =>
        topic.id === id ? { ...topic, checked: !topic.checked } : topic
      )
    );
  };

  // Newsletter subscribe
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailInput.trim();
    if (!email) return;
    setSubscribeStatus("loading");
    try {
      const res = await fetch(`${url}/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setSubscribeStatus("success");
        setSubscribeMsg(data.message || "Check your inbox to confirm!");
        setEmailInput("");
      } else if (res.status === 400 && data.message?.toLowerCase().includes("already")) {
        setSubscribeStatus("already");
        setSubscribeMsg("You're already subscribed!");
      } else {
        setSubscribeStatus("error");
        setSubscribeMsg(data.message || "Something went wrong. Try again.");
      }
    } catch {
      setSubscribeStatus("error");
      setSubscribeMsg("Network error. Please try again.");
    }
    setTimeout(() => { setSubscribeStatus("idle"); setSubscribeMsg(""); }, 4000);
  };

  // Filtered courses
  const filteredCourses = selectedCategory === "All"
    ? courses
    : courses.filter((c) => c.category === selectedCategory);

  return (
    <section 
      className="platform-features"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        if (progress > 0) setIsPaused(false);
      }}
    >
      <div className="pf-container">
        
        {/* Shifting Glow Background Blob */}
        <div className={`pf-bg-glow glow-tab-${activeTab}`} />

        <div className="pf-split-layout">
          
          {/* ════════════════════════════════════════════════
             LEFT: PLAYGROUND FRAME (COMPACT BROWSER PREVIEW)
             ═══════════════════════════════════════════════ */}
          <div className="pf-illustration-side">
            <div className="pf-playground-frame">
              
              {/* Browser Bar */}
              <div className="pf-browser-header">
                <div className="pf-browser-dots">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                </div>
                <div className="pf-browser-address">
                  {activeTab === 0 && "draa.in/academy/courses"}
                  {activeTab === 1 && "draa.in/test-series/practice"}
                  {activeTab === 2 && "draa.in/library/books"}
                  {activeTab === 3 && `draa.in/resources/${activeResourceTab}`}
                </div>
              </div>

              {/* Dashboard Content Container */}
              <div className="pf-playground-content">
                
                {/* ── Tab 0: Premium Courses ── */}
                {activeTab === 0 && (
                  <div className="pf-pane-courses fade-in-panel">
                    <div className="courses-header-row">
                      <div className="courses-search-bar">
                        <Search size={11} />
                        <input type="text" placeholder="Search courses..." readOnly value="" />
                      </div>
                      <span className="premium-academy-badge">
                        <Crown size={10} style={{ display: "inline-block", marginRight: "3px" }} /> ACADEMY
                      </span>
                    </div>

                    {/* Filter Category Chips */}
                    <div className="courses-filter-chips">
                      {["All", "UPSC", "SSC", "Banking"].map((cat) => (
                        <button
                          key={cat}
                          className={`course-chip ${selectedCategory === cat ? "active" : ""}`}
                          onClick={() => setSelectedCategory(cat)}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Courses List */}
                    <div className="courses-list-container">
                      {filteredCourses.map((c) => (
                        <div
                          key={c.id}
                          className={`course-row-card clickable ${hoveredCourseId === c.id ? "hovered" : ""}`}
                          onMouseEnter={() => setHoveredCourseId(c.id)}
                          onMouseLeave={() => setHoveredCourseId(null)}
                          onClick={() => navigate(`/course-details/${c.id}`)}
                          style={{ cursor: "pointer" }}
                        >
                          {/* Course Thumbnail */}
                          <div className="course-row-thumbnail">
                            {c.coverphoto ? (
                              <img 
                                src={getImageUrl(c.coverphoto)} 
                                alt={c.title} 
                                onError={(e) => {
                                  e.currentTarget.src = "/assets/img/default-placeholder.png";
                                }}
                              />
                            ) : (
                              <div className="course-thumbnail-fallback">
                                <BookOpen size={16} />
                              </div>
                            )}
                          </div>

                          <div className="course-card-details">
                            <div className="course-title-block">
                              <h6 className="course-title">{c.title}</h6>
                              <span className={`category-tag cat-${c.category.toLowerCase()}`}>
                                {c.category}
                              </span>
                            </div>
                            <p className="course-meta">By {c.tutor} • {c.lessons} classes • {c.duration}</p>
                          </div>
                          <div className="course-action-block">
                            <div className="course-rating">
                              <Star size={10} fill="#f59e0b" color="#f59e0b" />
                              <span>{c.rating}</span>
                            </div>
                            <span className="premium-label-tag">Premium</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 1 && (
                  <div className="pf-pane-test-series fade-in-panel">
                    <div className="test-series-stats-grid">
                      <div className="test-stat-card">
                        <span className="stat-label">National Percentile</span>
                        <h4 className="stat-value text-blue">98.4%</h4>
                      </div>
                      <div className="test-stat-card">
                        <span className="stat-label">Accuracy Rate</span>
                        <h4 className="stat-value text-green">94%</h4>
                      </div>
                      <div className="test-stat-card">
                        <span className="stat-label">Active Series</span>
                        <h4 className="stat-value text-pink">12</h4>
                      </div>
                    </div>

                    <div className="test-series-list-container">
                      {(testSeriesList.length > 0 ? testSeriesList : [
                        { _id: "1", name: "Haryana Police Constable 2026", code: "POLI", statistics: { totalTestSeries: 12 } },
                        { _id: "2", name: "Mock Test for BPSC TRE 4.0", code: "BPSC", statistics: { totalTestSeries: 15 } },
                        { _id: "3", name: "OPSC/OAS PYQ 2015-2024", code: "OPSC", statistics: { totalTestSeries: 8 } },
                        { _id: "4", name: "Current Affairs Weekly Mock", code: "CA", statistics: { totalTestSeries: 20 } }
                      ]).map((t: any, i: number) => {
                        const colors = ["#bd7b20", "#00d084", "#ff6900", "#06b6d4", "#ec4899", "#66735b"];
                        return (
                          <div
                            key={t._id}
                            className="test-row-card clickable"
                            onClick={() => {
                              if (t._id && t._id !== "1" && t._id !== "2" && t._id !== "3" && t._id !== "4") {
                                navigate(`/exam-topics/${t._id}`);
                              } else {
                                navigate("/online-test-series");
                              }
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            <div className="test-row-icon" style={{ background: colors[i % colors.length] }}>
                              {t.code?.substring(0, 4).toUpperCase()}
                            </div>
                            <div className="test-card-details">
                              <h6 className="test-title">{t.name || t.code}</h6>
                              <p className="test-meta">{t.statistics?.totalTestSeries || 0}+ Mock Tests Available</p>
                            </div>
                            <ChevronRight size={14} className="test-arrow" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── Tab 2: Premium Books (Reader View & Covers) ── */}
                {activeTab === 2 && (
                  <div className="pf-pane-books fade-in-panel">
                    <div className="bookshelf-layout">
                      {/* Left: Book Cover & Progress info */}
                      <div className="active-book-card">
                        <div 
                          className="book-gradient-cover clickable" 
                          style={{ 
                            background: books[activeBookIndex]?.coverImage 
                              ? `url(${getImageUrl(books[activeBookIndex].coverImage)}) center/cover no-repeat` 
                              : (books[activeBookIndex]?.color || "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)"),
                            cursor: "pointer"
                          }}
                          onClick={() => {
                            const bid = books[activeBookIndex]?.id;
                            if (bid && bid !== 1 && bid !== 2 && bid !== 3) {
                              navigate(`/book-details/${bid}`);
                            } else {
                              navigate("/all-books");
                            }
                          }}
                        >
                          {!books[activeBookIndex]?.coverImage && (
                            <>
                              <Crown size={16} className="book-crown" />
                              <h6 className="cover-title">{books[activeBookIndex]?.title}</h6>
                              <span className="cover-author">{books[activeBookIndex]?.author}</span>
                            </>
                          )}
                        </div>

                        <div className="book-progress-details">
                          <div className="book-progress-title-row">
                            <span className="progress-num">{books[activeBookIndex]?.progress}% Read</span>
                            <span className="page-count">{books[activeBookIndex]?.pages} pages</span>
                          </div>
                          <div className="book-progress-bar-wrapper">
                            <div 
                              className="book-progress-bar-filled" 
                              style={{ width: `${books[activeBookIndex]?.progress}%` }}
                            ></div>
                          </div>
                        </div>

                        <button 
                          className="book-read-btn"
                          onClick={() => {
                            const bid = books[activeBookIndex]?.id;
                            if (bid && bid !== 1 && bid !== 2 && bid !== 3) {
                              navigate(`/book-details/${bid}`);
                            } else {
                              navigate("/all-books");
                            }
                          }}
                        >
                          View Details <ArrowRight size={12} />
                        </button>
                      </div>

                      {/* Right: Book Details & Selector list */}
                      <div className="books-list-nav">
                        <span className="shelf-label">Choose Study Guide</span>
                        <div className="books-vertical-list">
                          {books.map((b, idx) => (
                            <button
                              key={b.id}
                              className={`book-nav-item ${activeBookIndex === idx ? "active" : ""}`}
                              onClick={() => setActiveBookIndex(idx)}
                            >
                              <div 
                                className="book-nav-icon-container" 
                                style={{ 
                                  background: b.coverImage 
                                    ? `url(${getImageUrl(b.coverImage)}) center/cover no-repeat` 
                                    : b.color 
                                }}
                              >
                                {!b.coverImage && <BookOpen size={10} color="#fff" />}
                              </div>
                              <div className="book-nav-text">
                                <span className="book-nav-title">{b.title}</span>
                                <span className="book-nav-meta">{b.chapters} Chapters</span>
                              </div>
                              <ChevronRight size={12} className="chevron-icon" />
                            </button>
                          ))}
                        </div>
                        
                        {/* Book Description Snippet */}
                        <div className="book-snippet-info">
                          <p className="snippet-desc">
                            <strong>About Guide:</strong> {books[activeBookIndex]?.details}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Tab 3: Free Resources (Sub-navigation panel) ── */}
                {activeTab === 3 && (
                  <div className="pf-pane-resources fade-in-panel">
                    
                    {/* Inner Sub-navigation */}
                    <div className="resources-subtabs-row">
                      <button
                        className={`res-subtab ${activeResourceTab === "jobs" ? "active" : ""}`}
                        onClick={() => setActiveResourceTab("jobs")}
                      >
                        <Briefcase size={11} /> Job Alerts
                      </button>
                      <button
                        className={`res-subtab ${activeResourceTab === "pyqs" ? "active" : ""}`}
                        onClick={() => setActiveResourceTab("pyqs")}
                      >
                        <Download size={11} /> PYQs
                      </button>
                      <button
                        className={`res-subtab ${activeResourceTab === "syllabus" ? "active" : ""}`}
                        onClick={() => setActiveResourceTab("syllabus")}
                      >
                        <FileText size={11} /> Syllabus
                      </button>
                      <button
                        className={`res-subtab ${activeResourceTab === "blogs" ? "active" : ""}`}
                        onClick={() => setActiveResourceTab("blogs")}
                      >
                        <TrendingUp size={11} /> Blogs
                      </button>
                    </div>

                    {/* Subtabs content */}
                    <div className="res-content-scrollable">
                      
                      {/* Job Alerts */}
                      {activeResourceTab === "jobs" && (
                        <div className="res-jobs-list fade-in-panel">
                          {jobs.map((job) => (
                            <div 
                              key={job.id} 
                              className="res-item-row clickable"
                              onClick={() => navigate("/job-listings")}
                              style={{ cursor: "pointer" }}
                            >
                              <div className="res-item-info">
                                <Briefcase size={12} className="res-row-icon text-orange" />
                                <div>
                                  <h6 className="res-item-title">{job.title}</h6>
                                  <p className="res-item-meta">{job.date}</p>
                                </div>
                              </div>
                              <span className="res-status-tag">{job.status}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* PYQs */}
                      {activeResourceTab === "pyqs" && (
                        <div className="res-pyqs-list fade-in-panel">
                          {pyqs.map((pyq: any) => {
                            const isDownloaded = downloadedPyqs.includes(pyq.id);
                            return (
                              <div key={pyq.id} className="res-item-row">
                                <div className="res-item-info">
                                  <FileText size={12} className="res-row-icon text-blue" />
                                  <div>
                                    <h6 className="res-item-title">{pyq.title}</h6>
                                    <p className="res-item-meta">Size: {pyq.size}</p>
                                  </div>
                                </div>
                                <button 
                                  className={`res-download-btn ${isDownloaded ? "downloaded" : ""}`}
                                  onClick={() => {
                                    handleDownloadPyq(pyq.id);
                                    if (pyq.fileUrl) {
                                      window.open(getImageUrl(pyq.fileUrl), '_blank');
                                    } else {
                                      navigate("/free-resources");
                                    }
                                  }}
                                >
                                  {isDownloaded ? <Check size={11} /> : <Download size={11} />}
                                  {isDownloaded ? "Saved" : "Download"}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Syllabus Tracker */}
                      {activeResourceTab === "syllabus" && (
                        <div className="res-syllabus-list fade-in-panel">
                          {syllabusList.map((topic) => (
                            <div 
                              key={topic.id} 
                              className="res-item-row clickable"
                              onClick={() => toggleSyllabusTopic(topic.id)}
                            >
                              <div className="res-item-info">
                                <div className={`res-custom-checkbox ${topic.checked ? "checked" : ""}`}>
                                  {topic.checked && <Check size={10} color="#fff" />}
                                </div>
                                <h6 className="res-item-title topic-title">{topic.title}</h6>
                              </div>
                              <span className="res-check-tag">{topic.checked ? "Done" : "Pending"}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Educational Blogs */}
                      {activeResourceTab === "blogs" && (
                        <div className="res-blogs-list fade-in-panel">
                          {blogs.map((blog) => (
                            <div 
                              key={blog.id} 
                              className="res-item-row clickable"
                              onClick={() => {
                                if (blog.id && blog.id !== 1 && blog.id !== 2 && blog.id !== 3) {
                                  navigate(`/blog-details/${blog.id}`);
                                } else {
                                  navigate("/free-resources");
                                }
                              }}
                              style={{ cursor: "pointer" }}
                            >
                              <div className="res-item-info">
                                <Book size={12} className="res-row-icon text-pink" />
                                <div>
                                  <h6 className="res-item-title">{blog.title}</h6>
                                  <p className="res-item-meta">{blog.readTime}</p>
                                </div>
                              </div>
                              <span className="blog-open-tag">Read Article</span>
                            </div>
                          ))}
                        </div>
                      )}

                    </div>

                    {/* Compact exam newsletter form */}
                    <div className="alerts-subscribe-form">
                      {subscribeStatus === "success" ? (
                        <div className="subscribe-success-msg">
                          <Check size={14} /> {subscribeMsg}
                        </div>
                      ) : subscribeStatus === "already" ? (
                        <div className="subscribe-success-msg" style={{ background: "rgba(16,185,129,0.12)", color: "#059669" }}>
                          <Check size={14} /> {subscribeMsg}
                        </div>
                      ) : subscribeStatus === "error" ? (
                        <div className="subscribe-success-msg" style={{ background: "rgba(239,68,68,0.1)", color: "#dc2626" }}>
                          <X size={14} /> {subscribeMsg}
                        </div>
                      ) : (
                        <form onSubmit={handleSubscribe} className="subscribe-inputs-row">
                          <input
                            type="email"
                            placeholder="Get free materials in your inbox..."
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            required
                            disabled={subscribeStatus === "loading"}
                          />
                          <button type="submit" disabled={subscribeStatus === "loading"}>
                            <Mail size={12} /> {subscribeStatus === "loading" ? "Sending..." : "Get Alerts"}
                          </button>
                        </form>
                      )}
                    </div>

                  </div>
                )}

              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════════════
             RIGHT: TABS SELECTOR (COMPACT HEIGHTS)
             ═══════════════════════════════════════════════ */}
          <div className="pf-content-side">
            <div className="pf-eyebrow">
              <Sparkles size={13} color="#bd7b20" />
              <span>Prep Suite Spotlight</span>
            </div>
            
            <h2 className="pf-main-title">
              One Platform for Complete<br/>
              <span className="title-accent">Exam Preparation</span>
            </h2>
            
            <p className="pf-sub-text">
              Everything an aspirant needs  <b>learning</b>, <b>practice</b>, <b>books</b>,
              and <b>free resource feeds</b>  integrated in a single smart dashboard. Hover over screens to explore!
            </p>

            <div className="pf-feature-tabs">
              {/* Tab 0: Premium Courses */}
              <button 
                className={`pf-tab-card ${activeTab === 0 ? 'active' : ''}`}
                onClick={() => handleTabClick(0)}
              >
                <div className="pf-tab-icon bg-blue">
                  <Crown size={18} />
                </div>
                <div className="pf-tab-text">
                  <h5 className="pf-tab-title">Premium Courses</h5>
                  <p className="pf-tab-desc">Comprehensive batches for UPSC, SSC, and Banking exams led by experts.</p>
                  
                  {activeTab === 0 && (
                    <div className="pf-tab-progress-wrapper">
                      <div className="pf-tab-progress-bar" style={{ width: `${progress}%` }}></div>
                    </div>
                  )}
                </div>
              </button>

              {/* Tab 1: Premium Test Series */}
              <button 
                className={`pf-tab-card ${activeTab === 1 ? 'active' : ''}`}
                onClick={() => handleTabClick(1)}
              >
                <div className="pf-tab-icon bg-green">
                  <Award size={18} />
                </div>
                <div className="pf-tab-text">
                  <h5 className="pf-tab-title">Premium Test Series</h5>
                  <p className="pf-tab-desc">High-quality mock tests, nationwide percentiles, and instant solutions.</p>
                  
                  {activeTab === 1 && (
                    <div className="pf-tab-progress-wrapper">
                      <div className="pf-tab-progress-bar" style={{ width: `${progress}%` }}></div>
                    </div>
                  )}
                </div>
              </button>

              {/* Tab 2: Premium Books */}
              <button 
                className={`pf-tab-card ${activeTab === 2 ? 'active' : ''}`}
                onClick={() => handleTabClick(2)}
              >
                <div className="pf-tab-icon bg-orange">
                  <BookOpen size={18} />
                </div>
                <div className="pf-tab-text">
                  <h5 className="pf-tab-title">Premium Books & Guides</h5>
                  <p className="pf-tab-desc">Sleek digital editions of top preparation guides with offline reading.</p>
                  
                  {activeTab === 2 && (
                    <div className="pf-tab-progress-wrapper">
                      <div className="pf-tab-progress-bar" style={{ width: `${progress}%` }}></div>
                    </div>
                  )}
                </div>
              </button>

              {/* Tab 3: Free Resources */}
              <button 
                className={`pf-tab-card ${activeTab === 3 ? 'active' : ''}`}
                onClick={() => handleTabClick(3)}
              >
                <div className="pf-tab-icon bg-pink">
                  <FileText size={18} />
                </div>
                <div className="pf-tab-text">
                  <h5 className="pf-tab-title">Free Resources Hub</h5>
                  <p className="pf-tab-desc">Instantly download past papers, track syllabus topics, and view job alerts.</p>
                  
                  {activeTab === 3 && (
                    <div className="pf-tab-progress-wrapper">
                      <div className="pf-tab-progress-bar" style={{ width: `${progress}%` }}></div>
                    </div>
                  )}
                </div>
              </button>
            </div>

            {/* CTAs */}
            <div className="pf-cta-row">
              <Link to="/exams-page" className="pf-primary-btn">
                Explore All Exams <ArrowRight size={16} />
              </Link>
              <Link to="/recorded-videos" className="pf-videography-btn">
                <Video size={16} className="play-icon-anim" /> Watch Video Previews
              </Link>
              <div className="pf-trust-pill">
                <CheckCircle2 size={14} color="#22c55e" />
                <span>Free to get started</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default PlatformFeatures;
