import React, { useEffect, useState, useRef, useLayoutEffect } from"react";
import toast from '../../utils/toast';
import { useNavigate } from"react-router-dom";
import moment from"moment";
import axios from"axios";
import url from"../../url";
import StudentSidebar from"./StudentSidebar";
import StudentHeader from"./StudentTopbr";
import { useStudentAuthGuard } from"../../utils/global_auth";
import usePageTitle from '../../hooks/usePageTitle';

//  TYPES 
interface LoginUser {
  name?: string;
  email?: string;
  id?: string;
  [key: string]: any;
}

interface Course {
  purchaseId: string;
  courseId: string;
  course: { title: string; _id?: string };
  purchaseDate: string;
  amountPaid: number;
}

interface LiveSession {
  _id: string;
  topic: string;
  startTime: string;
  duration: number;
  description?: string;
  courseId: { _id: string; title: string };
  zoomMeetingId: string;
  joinUrl: string;
  status:"scheduled" |"started" |"ended";
  createdBy: { name?: string; tname?: string };
}

//  SVG ICONS 
const Icons: Record<string, (s?: number, c?: string) => React.ReactNode> = {
  grid: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
  book: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>,
  video: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>,
  clock: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  calendar: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  bell: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
  play: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" /></svg>,
  search: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
  home: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
  compass: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>,
  info: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>,
  x: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  link: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>,
  grid2: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
  list: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>,
  user: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  zap: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
};

//  HELPERS 
const LinearBar = ({ pct, color, h = 4, bg ="rgba(0,0,0,0.06)" }: any) => (
  <div style={{ height: h, background: bg, borderRadius: 99, overflow:"hidden" }}>
    <div style={{ height:"100%", width: `${Math.min(pct, 100)}%`, background: color, borderRadius: 99, transition:"width 1.2s cubic-bezier(.4,0,.2,1)" }} />
  </div>
);

const getSessionStatus = (session: LiveSession): { label: string; color: string; bg: string } => {
  const now = moment();
  const start = moment(session.startTime);
  const end = moment(session.startTime).add(session.duration,"minutes");

  if (now.isBefore(start)) {
    const hoursUntil = start.diff(now,"hours");
    return hoursUntil < 1
      ? { label:"Starting Soon", color:"#f59e0b", bg:"rgba(245,158,11,.1)" }
      : { label:"Scheduled", color:"#6366f1", bg:"rgba(94,107,255,.1)" };
  }
  if (now.isBetween(start, end)) return { label:"LIVE NOW", color:"#ef4444", bg:"rgba(239,68,68,.1)" };
  return { label:"Ended", color:"#9ca3af", bg:"rgba(156,163,175,.1)" };
};

//  MAIN COMPONENT 
const StudentLiveSessionsDashboard = () => {
  useStudentAuthGuard();
  const navigate = useNavigate();

  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<LiveSession[]>([]);
  const [purchasedCourses, setPurchasedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [studentData, setStudentData] = useState<LoginUser | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [selectedSession, setSelectedSession] = useState<LiveSession | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" |"upcoming" |"live" |"ended">("all");
  const [viewMode, setViewMode] = useState<"grid" |"list">("grid");
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window ==="undefined") return true;
    return !window.matchMedia("(max-width: 768px)").matches;
  });
  const [loginUser, setLoginUser] = useState<LoginUser>({});

  useLayoutEffect(() => {
    if (typeof window ==="undefined") return;
    const mq = window.matchMedia("(max-width: 768px)");
    const syncSidebar = () => {
      if (mq.matches) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    syncSidebar();
    mq.addEventListener("change", syncSidebar);
    return () => mq.removeEventListener("change", syncSidebar);
  }, []);

  // Auth check
  useEffect(() => {
    const userData = localStorage.getItem("edudocs");
    if (!userData) {
      toast.warning("Please login to view live sessions.", 5);
      navigate("/student-login");
      return;
    }
    try {
      const user = JSON.parse(userData);
      if (!user.name || !user.id || !user.email) {
        toast.error("Invalid student account. Please login again.");
        navigate("/student-login");
        return;
      }
      setStudentData(user);
      setLoginUser(user);
      setIsAuthChecked(true);
    } catch {
      toast.error("Invalid session data. Please login again.");
      navigate("/student-login");
    }
  }, [navigate]);

  // Fetch courses
  useEffect(() => {
    const fetchPurchasedCourses = async () => {
      if (!studentData?.id) return;
      try {
        const res = await axios.get(`${url}/students/course/payment/my-courses/${studentData.id}`);
        if (res.data.success) setPurchasedCourses(res.data.courses || []);
        else setPurchasedCourses([]);
      } catch (error: any) {
        if (error.response?.status !== 404) toast.error("Failed to load your courses.");
        setPurchasedCourses([]);
      }
    };
    if (isAuthChecked && studentData) fetchPurchasedCourses();
  }, [studentData, isAuthChecked]);

  // Fetch sessions
  useEffect(() => {
    const fetchLiveSessions = async () => {
      if (!isAuthChecked || !studentData || purchasedCourses.length === 0) return;
      setLoading(true);
      try {
        const res = await axios.get(`${url}/live-sessions`);
        const allSessions = res.data.meetings || res.data || [];
        const purchasedCourseIds = purchasedCourses.map((pc: Course) => pc.courseId);
        const studentSessions = allSessions.filter((s: LiveSession) =>
          purchasedCourseIds.includes(s.courseId?._id)
        );
        setLiveSessions(studentSessions);
        setFilteredSessions(studentSessions);
      } catch {
        toast.error("Failed to load live sessions");
      } finally {
        setLoading(false);
      }
    };
    fetchLiveSessions();
  }, [isAuthChecked, studentData, purchasedCourses]);

  // Search & filter
  useEffect(() => {
    let result = liveSessions;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.topic.toLowerCase().includes(q) ||
        s.courseId?.title.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q)
      );
    }
    if (filterStatus !=="all") {
      const now = moment();
      result = result.filter(s => {
        const start = moment(s.startTime);
        const end = moment(s.startTime).add(s.duration,"minutes");
        if (filterStatus ==="upcoming") return start.isAfter(now);
        if (filterStatus ==="live") return now.isBetween(start, end);
        if (filterStatus ==="ended") return end.isBefore(now);
        return true;
      });
    }
    setFilteredSessions(result);
  }, [searchQuery, filterStatus, liveSessions]);

  const handleJoinSession = (session: LiveSession) => {
    const { label } = getSessionStatus(session);
    if (label ==="Ended") { toast.info("This session has already ended."); return; }
    if (label ==="Scheduled") {
      const minutesUntil = moment(session.startTime).diff(moment(),"minutes");
      if (minutesUntil > 15) {
        toast.warning(`Session starts in ${minutesUntil} minutes. Join closer to the start time.`, 5);
        return;
      }
    }
    if (session.joinUrl) {
      window.open(session.joinUrl,"_blank");
      toast.success("Opening Zoom meeting");
    } else {
      toast.error("Meeting link not available yet.");
    }
  };

  // Derived stats
  const now = moment();
  const liveNow = liveSessions.filter(s => now.isBetween(moment(s.startTime), moment(s.startTime).add(s.duration,"minutes")));
  const upcoming = liveSessions.filter(s => moment(s.startTime).isAfter(now));
  const ended = liveSessions.filter(s => moment(s.startTime).add(s.duration,"minutes").isBefore(now));

  // Filtered sections
  const filteredLive = filteredSessions.filter(s => now.isBetween(moment(s.startTime), moment(s.startTime).add(s.duration,"minutes")));
  const filteredUpcoming = filteredSessions.filter(s => moment(s.startTime).isAfter(now));
  const filteredEnded = filteredSessions.filter(s => moment(s.startTime).add(s.duration,"minutes").isBefore(now));

  const userName = studentData?.name ??"Student";

  // Loading
  if (!isAuthChecked || (loading && purchasedCourses.length === 0)) {
    return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", flexDirection:"column", gap: 16 }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}} .sp{animation:spin 1s linear infinite;}`}</style>
        <div className="sp" style={{ width: 48, height: 48, borderRadius:"50%", border:"3px solid #e8e7f8", borderTopColor:"#6366f1" }} />
        <div style={{ fontSize: 16, fontWeight: 700, color:"#4b4966" }}>Loading Live Sessions</div>
      </div>
    );
  }

  //  SESSION CARD (Grid) 
  const SessionCardGrid = ({ session, idx }: { session: LiveSession; idx: number }) => {
    const { label, color, bg } = getSessionStatus(session);
    const isLive = label ==="LIVE NOW";
    const isJoinable = label ==="LIVE NOW" || label ==="Starting Soon";
    const gradients = [
"135deg, #667eea, #764ba2",
"135deg, #f093fb, #f5576c",
"135deg, #4facfe, #00f2fe",
"135deg, #43e97b, #38f9d7",
"135deg, #fa709a, #fee140",
"135deg, #30cfd0, #667eea",
    ];
    return (
      <div className="session-card" style={{ animationDelay: `${0.12 + idx * 0.04}s` }}>
        {/* Header Banner */}
        <div style={{
          height: 90,
          background: `linear-gradient(${gradients[idx % gradients.length]})`,
          display:"flex", alignItems:"center", justifyContent:"center",
          position:"relative",
        }}>
          {Icons.video?.(36,"rgba(255,255,255,.85)")}
          <div style={{
            position:"absolute", top: 8, right: 8,
            background:"rgba(255,255,255,.2)", borderRadius: 8, padding:"2px 8px",
            fontSize: 10, fontWeight: 700, color:"white", backdropFilter:"blur(8px)",
          }}>LIVE SESSION</div>
          {isLive && (
            <div style={{
              position:"absolute", top: 8, left: 8,
              display:"flex", alignItems:"center", gap: 5,
              background:"rgba(239,68,68,.85)", borderRadius: 8, padding:"3px 8px",
              fontSize: 10, fontWeight: 800, color:"white",
            }}>
              <span style={{ width: 6, height: 6, borderRadius:"50%", background:"white", animation:"livePulse 1.4s infinite" }} />
              LIVE
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding:"16px 18px", flex: 1, display:"flex", flexDirection:"column" }}>
          {/* Status badge */}
          <div style={{ marginBottom: 10 }}>
            <span className="badge" style={{ background: bg, color }}>
              {label}
            </span>
          </div>

          <h4 style={{ fontSize: 14, fontWeight: 800, color:"var(--ink)", marginBottom: 4, lineHeight: 1.35 }}>
            {session.topic}
          </h4>
          <p style={{ fontSize: 12, color:"var(--ink3)", marginBottom: 12, lineHeight: 1.4 }}>
            {session.courseId?.title}
          </p>

          {/* Meta */}
          <div style={{ display:"flex", flexDirection:"column", gap: 6, fontSize: 12, color:"var(--ink2)", marginBottom: 14 }}>
            <div style={{ display:"flex", alignItems:"center", gap: 6 }}>
              {Icons.calendar(13,"var(--ink3)")}
              {moment(session.startTime).format("MMM DD, YYYY")}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap: 6 }}>
              {Icons.clock(13,"var(--ink3)")}
              {moment(session.startTime).format("hh:mm A")} &nbsp;·&nbsp; {session.duration} min
            </div>
            {session.createdBy?.tname && (
              <div style={{ display:"flex", alignItems:"center", gap: 6 }}>
                {Icons.user(13,"var(--ink3)")}
                {session.createdBy.tname}
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ marginTop:"auto", display:"flex", gap: 8 }}>
            <button
              className="btn btn-ghost"
              style={{ flex: 1, justifyContent:"center", padding:"8px 10px", fontSize: 12 }}
              onClick={() => { setSelectedSession(session); setShowDetailsModal(true); }}
            >
              {Icons.info(13)} Details
            </button>
            {isJoinable && (
              <button
                className="btn btn-primary"
                style={{ flex: 1, justifyContent:"center", padding:"8px 10px", fontSize: 12 }}
                onClick={() => handleJoinSession(session)}
              >
                {Icons.play(13,"white")} Join
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  //  SESSION ROW (List) 
  const SessionRowList = ({ session }: { session: LiveSession }) => {
    const { label, color, bg } = getSessionStatus(session);
    const isLive = label ==="LIVE NOW";
    const isJoinable = label ==="LIVE NOW" || label ==="Starting Soon";
    return (
      <div className="session-list-item">
        <div style={{
          width: 46, height: 46, borderRadius: 12,
          background: isLive ?"rgba(239,68,68,.12)" :"rgba(94,107,255,.1)",
          display:"flex", alignItems:"center", justifyContent:"center",
          flexShrink: 0,
        }}>{Icons.video?.(22, isLive ?"#ef4444" :"#6366f1")}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color:"var(--ink)", marginBottom: 2 }}>{session.topic}</div>
          <div style={{ fontSize: 12, color:"var(--ink3)" }}>
            {session.courseId?.title}
            &nbsp;·&nbsp;{moment(session.startTime).format("MMM DD, YYYY")}
            &nbsp;·&nbsp;{moment(session.startTime).format("hh:mm A")}
            &nbsp;·&nbsp;{session.duration} min
          </div>
        </div>
        <span className="tag" style={{ background: bg, color, flexShrink: 0 }}>{label}</span>
        <button
          className="btn btn-ghost"
          style={{ padding:"7px 14px", fontSize: 12 }}
          onClick={() => { setSelectedSession(session); setShowDetailsModal(true); }}
        >
          Details
        </button>
        {isJoinable && (
          <button
            className="btn btn-primary"
            style={{ padding:"7px 14px", fontSize: 12 }}
            onClick={() => handleJoinSession(session)}
          >
            Join
          </button>
        )}
      </div>
    );
  };

  //  SECTION RENDERER 
  const Section = ({
    title, dot, countBg, countColor, sessions, show,
  }: {
    title: string; dot: string; countBg: string; countColor: string;
    sessions: LiveSession[]; show: boolean;
  }) => {
    if (!show || sessions.length === 0) return null;
    return (
      <div className="fade-up">
        <div className="section-head">
          <div className="section-dot" style={{ background: dot }} />
          <span className="section-title">{title}</span>
          <span className="section-count" style={{ background: countBg, color: countColor }}>{sessions.length}</span>
        </div>
        {viewMode ==="grid" ? (
          <div className="sessions-grid" style={{ marginBottom: 8 }}>
            {sessions.map((s, i) => <SessionCardGrid key={s._id} session={s} idx={i} />)}
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap: 8, marginBottom: 8 }}>
            {sessions.map(s => <SessionRowList key={s._id} session={s} />)}
          </div>
        )}
      </div>
    );
  };

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
        ::-webkit-scrollbar-thumb { background:var(--edge2); border-radius:7px; }
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
          padding:9px 14px; border-radius:12px; cursor:pointer;
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
        .btn-icon { padding:8px; border-radius:10px; }

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
        .badge { display:inline-flex; align-items:center; gap:4px; padding:3px 9px; border-radius:7px; font-size:11px; font-weight:700; }
        .tag { display:inline-block; padding:2px 8px; border-radius:6px; font-size:10.5px; font-weight:700; }

        /* Divider */
        .div { height:1px; background:var(--edge2); margin:12px 0; }

        /* Alert banner */
        .alert-success {
          display:flex; align-items:center; gap:12px;
          background:#ecfdf5; border:1px solid rgba(16,185,129,.25);
          border-radius:14px; padding:14px 18px; margin-top:20px;
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
        @media(max-width:900px) {
          .sidebar { position:fixed!important; top:0; left:0; height:100vh; z-index:300; }
          .sidebar.closed { transform:translateX(-100%); width:var(--sidebar)!important; min-width:var(--sidebar)!important; }
        }
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
          --red:       #ef4444;
          --amber:     #f59e0b;
          --green:     #10b981;
          --sh:  0 1px 3px rgba(13,12,29,.05), 0 4px 16px rgba(94,107,255,.07);
          --sh2: 0 4px 24px rgba(94,107,255,.13), 0 1px 4px rgba(13,12,29,.07);
          --r:   16px;
          --tr:  0.2s cubic-bezier(.4,0,.2,1);
          --sidebar: 252px;
          --header:  60px;
          --font:'Inter', system-ui, -apple-system, BlinkMacSystemFont,'Segoe UI', Roboto, sans-serif;
          /* --display removed */
        }
        html, body { height: 100%; font-family: var(--font); background: var(--surface2); color: var(--ink); -webkit-font-smoothing: antialiased; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--edge2); border-radius: 7px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--accent2); }

        .app-shell { display: flex; min-height: 100vh; }
        .main { flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: hidden; }
        .content { flex: 1; overflow-y: auto; padding: 28px 28px 48px; }

        /* Buttons */
        .btn { display: inline-flex; align-items: center; gap: 7px; padding: 9px 18px; border-radius: 7px; border: none; cursor: pointer; font-size: 13px; font-weight: 600; transition: all var(--tr); font-family: var(--font); white-space: nowrap; }
        .btn-primary { background: #5E6BFF; color: #fff; box-shadow: 0 4px 14px rgba(94,107,255,.35); }
        .btn-primary:hover { box-shadow: 0 4px 14px rgba(94,107,255,.35); }
        .btn-ghost { background: var(--surface); color: var(--ink2); border: 1px solid var(--edge2); }
        .btn-ghost:hover { background: var(--accent-bg); color: var(--accent); border-color: rgba(94,107,255,.3); }

        /* Typography */
        .display { font-family: var(--font); }
        .stat-val { font-family: var(--font); font-weight: 800; line-height: 1; }

        /* Cards */
        .card { background: var(--surface); border-radius: var(--r); border: 1px solid var(--edge2); box-shadow: var(--sh); }
        .lift { transition: transform var(--tr), box-shadow var(--tr); }
        .lift:hover { transform: translateY(-3px); box-shadow: var(--sh2); }

        /* Session grid card */
        .session-card {
          background: var(--surface); border-radius: 7px;
          border: 1px solid var(--edge2); box-shadow: var(--sh);
          overflow: hidden; display: flex; flex-direction: column;
          transition: transform var(--tr), box-shadow var(--tr);
        }
        .session-card:hover { transform: translateY(-4px); box-shadow: var(--sh2); }

        /* Session list item */
        .session-list-item {
          background: var(--surface); border-radius: 7px;
          border: 1px solid var(--edge2); box-shadow: var(--sh);
          display: flex; align-items: center; gap: 14px;
          padding: 14px 18px;
          transition: transform var(--tr), box-shadow var(--tr);
        }
        .session-list-item:hover { transform: translateX(4px); box-shadow: var(--sh2); }

        /* Grid */
        .sessions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 18px; margin-top: 4px; }

        /* Badges / pills */
        .badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 7px; font-size: 11px; font-weight: 700; }
        .tag { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 10.5px; font-weight: 700; }

        /* Filter pills */
        .filter-pill {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 14px; border-radius: 7px; font-size: 12.5px; font-weight: 700;
          cursor: pointer; border: 1.5px solid var(--edge2);
          background: var(--surface); color: var(--ink2);
          transition: all var(--tr);
        }
        .filter-pill:hover { border-color: rgba(99,102,241,.4); color: var(--accent); background: var(--accent-bg); }
        .filter-pill.active { background: #5E6BFF; color: white; border-color: transparent; box-shadow: 0 4px 14px rgba(94,107,255,.3); }

        /* View toggle */
        .view-toggle { display: flex; border: 1px solid var(--edge2); border-radius: 7px; overflow: hidden; }
        .view-btn { padding: 7px 10px; background: none; border: none; cursor: pointer; color: var(--ink3); transition: all var(--tr); }
        .view-btn.active { background: var(--accent-bg); color: var(--accent); }
        .view-btn:hover:not(.active) { background: var(--surface2); }

        /* Section header */
        .section-head { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; margin-top: 28px; }
        .section-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .section-title { font-family: var(--font); font-size: 17px; font-weight: 700; color: var(--ink); }
        .section-count { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 7px; }

        /* Animations */
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes livePulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(1.3)} }
        .fade-up { opacity: 0; animation: fadeUp .45s cubic-bezier(.4,0,.2,1) forwards; }
        .spinner { animation: spin 1s linear infinite; }

        /* Modal */
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(13,12,29,0.55);
          backdrop-filter: blur(4px); z-index: 1000;
          display: flex; align-items: center; justify-content: center; padding: 20px;
        }
        .modal-box {
          background: var(--surface); border-radius: 7px;
          width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto;
          box-shadow: 0 24px 80px rgba(13,12,29,.24);
          animation: fadeUp .3s cubic-bezier(.4,0,.2,1);
        }

        /* Responsive */
        @media(max-width:900px) {
          .sessions-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media(max-width:600px) {
          .sessions-grid { grid-template-columns: 1fr !important; }
          .content { padding: 16px 12px 40px; }
        }
        @media(max-width:768px) {
          .sidebar {
            position: fixed !important;
            top: 0;
            left: 0;
            height: 100vh;
            z-index: 400;
            width: min(86vw, 280px) !important;
            min-width: min(86vw, 280px) !important;
          }
          .sidebar.closed {
            transform: translateX(-100%);
            width: min(86vw, 280px) !important;
            min-width: min(86vw, 280px) !important;
          }
          .content {
            padding: 16px 12px 36px;
          }
        }
      `}</style>

      <div className="app-shell">
        <StudentSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} loginUser={loginUser} />

        <div className="main">
          <StudentHeader
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            loginUser={loginUser}
            currentPage="Live Sessions"
          />

          <main className="content">
            <div style={{ maxWidth: 1320, margin:"0 auto" }}>

              {/*  PAGE HEADER  */}
              <div className="fade-up" style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap: 12, marginBottom: 24 }}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap: 10, marginBottom: 6 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 13,
                      background:"#5E6BFF",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      boxShadow:"0 4px 14px rgba(94,107,255,.3)",
                    }}>{Icons.video?.(20,"white")}</div>
                    <h1 className="display" style={{ fontSize: 28, fontWeight: 800, color:"var(--ink)", lineHeight: 1.15 }}>
                      Live Sessions
                    </h1>
                  </div>
                  <p style={{ color:"var(--ink2)", fontSize: 13.5 }}>
                    All live classes for your enrolled courses
                    {liveSessions.length > 0 && (
                      <span style={{ color:"var(--accent)", fontWeight: 700 }}>
                        {""}· {liveSessions.length} session{liveSessions.length !== 1 ?"s" :""}
                      </span>
                    )}
                    {liveNow.length > 0 && (
                      <span style={{ color:"#ef4444", fontWeight: 700 }}>
                        {""}· {liveNow.length} live now
                      </span>
                    )}
                  </p>
                </div>
                <div style={{ display:"flex", gap: 8 }}>
                  <button className="btn btn-ghost" onClick={() => navigate("/courses")}>
                    {Icons.compass?.(15)} Explore Courses
                  </button>
                  <button className="btn btn-primary" onClick={() => navigate(`/sudent/my-courses/${studentData?.id}`)}>
                    {Icons.book?.(15)} My Courses
                  </button>
                </div>
              </div>

              {/*  STATS BAR  */}
              {!loading && liveSessions.length > 0 && (
                <div className="fade-up" style={{ animationDelay:".06s", display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
                  {[
                    { label:"Live Now", value: liveNow.length, color:"#ef4444", bg:"rgba(239,68,68,.09)", icon:"zap" },
                    { label:"Upcoming", value: upcoming.length, color:"#6366f1", bg:"rgba(99,102,241,.09)", icon:"calendar" },
                    { label:"Completed", value: ended.length, color:"#9ca3af", bg:"rgba(156,163,175,.09)", icon:"clock" },
                  ].map((s, i) => (
                    <div key={i} className="card lift" style={{ padding:"16px 20px", display:"flex", alignItems:"center", gap: 14 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink: 0 }}>
                        {Icons[s.icon]?.(20, s.color)}
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color:"var(--ink3)", fontWeight: 700, textTransform:"uppercase", letterSpacing:".05em" }}>{s.label}</div>
                        <div className="stat-val" style={{ fontSize: 26, color: s.color }}>{s.value}</div>
                      </div>
                      <div style={{ marginLeft:"auto" }}>
                        <LinearBar pct={liveSessions.length > 0 ? (s.value / liveSessions.length) * 100 : 0} color={s.color} h={3} bg={s.bg} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/*  FILTER + SEARCH + VIEW TOGGLE  */}
              {!loading && liveSessions.length > 0 && (
                <div className="fade-up" style={{ animationDelay:".1s", display:"flex", alignItems:"center", gap: 10, flexWrap:"wrap", marginBottom: 20 }}>
                  {[
                    { key:"all", label: `All (${liveSessions.length})` },
                    { key:"live", label: `Live Now (${liveNow.length})` },
                    { key:"upcoming", label: `Upcoming (${upcoming.length})` },
                    { key:"ended", label: `Ended (${ended.length})` },
                  ].map(f => (
                    <button
                      key={f.key}
                      className={`filter-pill ${filterStatus === f.key ?"active" :""}`}
                      onClick={() => setFilterStatus(f.key as any)}
                    >
                      {f.label}
                    </button>
                  ))}

                  {/* Search */}
                  <div style={{ marginLeft:"auto", position:"relative", display:"flex", alignItems:"center" }}>
                    <span style={{ position:"absolute", left: 12, pointerEvents:"none" }}>{Icons.search(14,"var(--ink3)")}</span>
                    <input
                      type="text"
                      placeholder="Search sessions"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      style={{
                        paddingLeft: 36, paddingRight: 14, paddingTop: 7, paddingBottom: 7,
                        border:"1.5px solid var(--edge2)", borderRadius: 99, fontSize: 12.5,
                        fontFamily:"var(--body)", color:"var(--ink)", background:"var(--surface)",
                        outline:"none", width: 200, transition:"border-color var(--tr)",
                      }}
                      onFocus={e => e.target.style.borderColor ="rgba(99,102,241,.5)"}
                      onBlur={e => e.target.style.borderColor ="var(--edge2)"}
                    />
                  </div>

                  {/* View toggle */}
                  <div className="view-toggle">
                    <button className={`view-btn ${viewMode ==="grid" ?"active" :""}`} onClick={() => setViewMode("grid")}>
                      {Icons.grid2?.(15)}
                    </button>
                    <button className={`view-btn ${viewMode ==="list" ?"active" :""}`} onClick={() => setViewMode("list")}>
                      {Icons.list?.(15)}
                    </button>
                  </div>
                </div>
              )}

              {/*  LOADING  */}
              {loading && (
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"50vh", gap: 16 }}>
                  <div className="spinner" style={{ width: 44, height: 44, borderRadius:"50%", border:"3px solid var(--edge2)", borderTopColor:"var(--accent)" }} />
                  <div style={{ color:"var(--ink2)", fontSize: 14, fontWeight: 500 }}>Loading live sessions</div>
                </div>
              )}

              {/*  EMPTY STATE (no courses)  */}
              {!loading && purchasedCourses.length === 0 && (
                <div className="fade-up" style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"80px 0", textAlign:"center" }}>
                  <div style={{
                    width: 100, height: 100, borderRadius:"50%",
                    background:"linear-gradient(135deg,rgba(94,107,255,.1),rgba(94,107,255,.1))",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize: 44, marginBottom: 20, border:"2px dashed rgba(99,102,241,.2)",
                  }}></div>
                  <h3 className="display" style={{ fontSize: 24, fontWeight: 800, color:"var(--ink)", marginBottom: 8 }}>No Courses Enrolled Yet</h3>
                  <p style={{ color:"var(--ink2)", fontSize: 14, marginBottom: 24, maxWidth: 380 }}>
                    Enroll in a course to access its live sessions and classes.
                  </p>
                  <div style={{ display:"flex", gap: 10 }}>
                    <button className="btn btn-ghost" onClick={() => navigate("/")}>
                      {Icons.home?.(15)} Go Home
                    </button>
                    <button className="btn btn-primary" onClick={() => navigate("/courses")}>
                      {Icons.compass?.(15)} Browse Courses
                    </button>
                  </div>
                </div>
              )}

              {/*  EMPTY STATE (no sessions)  */}
              {!loading && purchasedCourses.length > 0 && liveSessions.length === 0 && (
                <div className="fade-up" style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"80px 0", textAlign:"center" }}>
                  <div style={{
                    width: 100, height: 100, borderRadius:"50%",
                    background:"linear-gradient(135deg,rgba(239,68,68,.08),rgba(99,102,241,.08))",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize: 44, marginBottom: 20, border:"2px dashed rgba(94,107,255,.18)",
                  }}></div>
                  <h3 className="display" style={{ fontSize: 24, fontWeight: 800, color:"var(--ink)", marginBottom: 8 }}>No Live Sessions Yet</h3>
                  <p style={{ color:"var(--ink2)", fontSize: 14, marginBottom: 24, maxWidth: 380 }}>
                    Your instructors haven't scheduled any live sessions for your courses yet. Check back soon!
                  </p>
                  <button className="btn btn-primary" onClick={() => navigate(`/sudent/my-courses/${studentData?.id}`)}>
                    {Icons.book?.(15)} View My Courses
                  </button>
                </div>
              )}

              {/*  NO SEARCH RESULTS  */}
              {!loading && liveSessions.length > 0 && filteredSessions.length === 0 && (
                <div className="fade-up" style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"60px 0", textAlign:"center" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}></div>
                  <h3 className="display" style={{ fontSize: 20, fontWeight: 700, color:"var(--ink)", marginBottom: 6 }}>No results found</h3>
                  <p style={{ color:"var(--ink2)", fontSize: 13 }}>Try adjusting your search or filter.</p>
                  <button className="btn btn-ghost" style={{ marginTop: 14 }} onClick={() => { setSearchQuery(""); setFilterStatus("all"); }}>
                    Clear filters
                  </button>
                </div>
              )}

              {/*  LIVE NOW SECTION  */}
              <Section
                title="Live Now"
                dot="#ef4444"
                countBg="rgba(239,68,68,.1)"
                countColor="#ef4444"
                sessions={filteredLive}
                show={filterStatus ==="all" || filterStatus ==="live"}
              />

              {/*  UPCOMING SECTION  */}
              <Section
                title="Upcoming"
                dot="#6366f1"
                countBg="rgba(94,107,255,.1)"
                countColor="#6366f1"
                sessions={filteredUpcoming}
                show={filterStatus ==="all" || filterStatus ==="upcoming"}
              />

              {/*  ENDED SECTION  */}
              <Section
                title="Completed"
                dot="#9ca3af"
                countBg="rgba(156,163,175,.1)"
                countColor="#9ca3af"
                sessions={filteredEnded}
                show={filterStatus ==="all" || filterStatus ==="ended"}
              />

            </div>
          </main>
        </div>
      </div>

      {/*  DETAILS MODAL  */}
      {showDetailsModal && selectedSession && (() => {
        const { label, color, bg } = getSessionStatus(selectedSession);
        const isJoinable = label ==="LIVE NOW" || label ==="Starting Soon";
        return (
          <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              {/* Modal header gradient */}
              <div style={{
                height: 80,
                background:"#5E6BFF",
                borderRadius:"20px 20px 0 0",
                display:"flex", alignItems:"center", justifyContent:"space-between",
                padding:"0 24px",
              }}>
                <span style={{ fontSize: 28 }}></span>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  style={{ background:"rgba(255,255,255,.2)", border:"none", borderRadius: 10, padding:"6px 8px", cursor:"pointer", color:"white" }}
                >
                  {Icons.x(16,"white")}
                </button>
              </div>

              <div style={{ padding:"22px 24px 28px" }}>
                <span className="badge" style={{ background: bg, color, marginBottom: 10, display:"inline-flex" }}>
                  {label}
                </span>
                <h2 className="display" style={{ fontSize: 22, fontWeight: 800, color:"var(--ink)", marginBottom: 6, lineHeight: 1.25 }}>
                  {selectedSession.topic}
                </h2>
                <p style={{ fontSize: 13, color:"var(--accent)", fontWeight: 600, marginBottom: 16 }}>
                  {selectedSession.courseId?.title}
                </p>

                {selectedSession.description && (
                  <div style={{ background:"var(--surface2)", borderRadius: 12, padding:"14px 16px", marginBottom: 18 }}>
                    <p style={{ fontSize: 13.5, color:"var(--ink2)", lineHeight: 1.65 }}>{selectedSession.description}</p>
                  </div>
                )}

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 12, marginBottom: 20 }}>
                  {[
                    { icon:"calendar", label:"Date", value: moment(selectedSession.startTime).format("MMM DD, YYYY") },
                    { icon:"clock", label:"Time", value: moment(selectedSession.startTime).format("hh:mm A") },
                    { icon:"zap", label:"Duration", value: `${selectedSession.duration} minutes` },
                    { icon:"user", label:"Instructor", value: selectedSession.createdBy?.tname ||"N/A" },
                    { icon:"link", label:"Meeting ID", value: selectedSession.zoomMeetingId ||"N/A" },
                  ].map((item, i) => (
                    <div key={i} style={{
                      background:"var(--surface2)", borderRadius: 10, padding:"12px 14px",
                      display:"flex", alignItems:"flex-start", gap: 10,
                      gridColumn: i === 4 ?"1 / -1" :"auto",
                    }}>
                      <div style={{ marginTop: 2 }}>{Icons[item.icon]?.(14,"var(--ink3)")}</div>
                      <div>
                        <div style={{ fontSize: 10.5, color:"var(--ink3)", fontWeight: 700, textTransform:"uppercase", letterSpacing:".05em", marginBottom: 2 }}>{item.label}</div>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color:"var(--ink)" }}>{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display:"flex", gap: 10 }}>
                  <button className="btn btn-ghost" style={{ flex: 1, justifyContent:"center" }} onClick={() => setShowDetailsModal(false)}>
                    Close
                  </button>
                  {isJoinable && (
                    <button className="btn btn-primary" style={{ flex: 1, justifyContent:"center" }} onClick={() => { setShowDetailsModal(false); handleJoinSession(selectedSession); }}>
                      {Icons.play?.(14,"white")} Join Session
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
};

export default StudentLiveSessionsDashboard;