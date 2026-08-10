import React, { useEffect, useCallback, useRef, useState } from"react";
import { useParams, useNavigate, useLocation } from"react-router-dom";
import {
  Card, Row, Col, Button, Typography, Progress, Space, Radio, Divider,
  Modal, Spin, Alert, Tag, Statistic, Tooltip, Badge, Affix, List, Grid,
} from"antd";
import toast from"../../utils/toast";
import {
  ClockCircleOutlined, CheckCircleOutlined, WarningOutlined, FlagOutlined,
  ArrowLeftOutlined, ArrowRightOutlined, SendOutlined, BookOutlined,
  EyeInvisibleOutlined, StopOutlined,
} from"@ant-design/icons";
import uri from"../../url";
import usePageTitle from '../../hooks/usePageTitle';

const { Title, Text, Paragraph } = Typography;

/* =========================================================
    COPY PROTECTION STYLES
========================================================= */
const CopyProtectionStyles = () => (
  <style>{`
    * {
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
      user-select: none !important;
    }
    img {
      -webkit-user-drag: none !important;
      pointer-events: none !important;
    }
    @media print {
      * { display: none !important; visibility: hidden !important; }
      body::after {
        content:"© Draa  Printing is strictly prohibited.";
        display: block !important;
        font-size: 22px;
        text-align: center;
        padding: 100px 40px;
        color: #1a0050;
      }
    }
    @keyframes pulse-clock {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.2); }
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
      20%, 40%, 60%, 80% { transform: translateX(6px); }
    }
    @keyframes pulse-warning {
      0%, 100% { box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.4); }
      50% { box-shadow: 0 0 0 12px rgba(255, 77, 79, 0); }
    }
    @keyframes violation-flash {
      0% { background: #fff2f0; }
      50% { background: #ff4d4f22; }
      100% { background: #fff2f0; }
    }
      pointer-events: none;
      z-index: 8999;
      overflow: hidden;
    }
  `}</style>
);

/* =========================================================
    SCREEN WATERMARK
    Tiled SVG + slowly drifting label with user identity.
    Every screenshot is permanently traceable  same as
    Netflix / Hotstar approach. pointer-events:none so it
    never interferes with any test interaction.
========================================================= */
const ScreenWatermark: React.FC<{ email?: string; name?: string }> = ({ email, name }) => {
  const [pos, setPos] = useState({ x: 12, y: 18 });
  const label = ((email || name ||"Draa User")).toUpperCase();
  const ts = new Date().toLocaleString("en-IN", { dateStyle:"short", timeStyle:"short" });

  useEffect(() => {
    const iv = setInterval(() => {
      setPos({ x: 6 + Math.random() * 60, y: 6 + Math.random() * 60 });
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  // SVG rendered as CSS background-image  cannot be removed via DevTools element panel
  const svgTile = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='420' height='140'>` +
    `<text x='50%' y='44%' font-family='monospace' font-size='11.5'` +
    ` fill='rgba(0,0,0,0.048)' text-anchor='middle' dominant-baseline='middle'` +
    ` transform='rotate(-22 210 70)'>${label} · Draa LMS</text>` +
    `<text x='50%' y='68%' font-family='monospace' font-size='9'` +
    ` fill='rgba(0,0,0,0.035)' text-anchor='middle' dominant-baseline='middle'` +
    ` transform='rotate(-22 210 70)'>${ts} · PROTECTED CONTENT</text>` +
    `</svg>`
  );

  return (
    <div className="wm-layer" aria-hidden="true">
      {/* Layer 1  tiled repeating pattern */}
      <div style={{
        position:"absolute", inset: 0,
        backgroundImage: `url("data:image/svg+xml,${svgTile}")`,
        backgroundRepeat:"repeat",
      }} />
      {/* Layer 2  slowly drifting label */}
      <div style={{
        position:"absolute",
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        transition:"left 4.5s cubic-bezier(.4,0,.2,1), top 4.5s cubic-bezier(.4,0,.2,1)",
        transform:"rotate(-18deg)",
        opacity: 0.065,
        whiteSpace:"nowrap",
        fontSize: 13,
        fontWeight: 800,
        color:"#0f0c3a",
        fontFamily:"monospace",
        letterSpacing:"0.07em",
        userSelect:"none",
        pointerEvents:"none",
      }}>
        {label} · Draa · {ts}
      </div>
    </div>
  );
};

/* =========================================================
    COPY PROTECTION HOOK  (enhanced  adds PrintScreen block)
========================================================= */
const useCopyProtection = () => {
  useEffect(() => {
    const blockContext = (e: MouseEvent) => e.preventDefault();

    const blockKeys = (e: KeyboardEvent) => {
      // Block PrintScreen on keydown
      if (e.key ==="PrintScreen") { e.preventDefault(); e.stopImmediatePropagation(); return; }
      if (e.key ==="F12" || e.key ==="F5") { e.preventDefault(); e.stopPropagation(); return; }
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        if (["c","v","x","a","s","p","u","f","i","j"].includes(key)) {
          e.preventDefault(); e.stopPropagation();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
        const key = e.key.toLowerCase();
        if (["i","j","c","k"].includes(key)) { e.preventDefault(); e.stopPropagation(); }
      }
    };

    // Overwrite clipboard with empty string after PrintScreen fires on keyup
    const clearClipboardOnPrintScreen = (e: KeyboardEvent) => {
      if (e.key ==="PrintScreen") {
        e.preventDefault();
        try { navigator.clipboard.writeText(""); } catch (_) { }
      }
    };

    const blockDrag = (e: DragEvent) => e.preventDefault();

    const devtoolsCheck = setInterval(() => {
      const threshold = 160;
      if (
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold
      ) {
        document.body.innerHTML =
'<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-size:24px;font-family:sans-serif;color:#333;"> Developer tools are not allowed during the test.</div>';
      }
    }, 1000);

    document.addEventListener("contextmenu", blockContext);
    document.addEventListener("keydown", blockKeys, { capture: true });
    document.addEventListener("keyup", clearClipboardOnPrintScreen, { capture: true });
    document.addEventListener("dragstart", blockDrag);

    return () => {
      document.removeEventListener("contextmenu", blockContext);
      document.removeEventListener("keydown", blockKeys, { capture: true });
      document.removeEventListener("keyup", clearClipboardOnPrintScreen, { capture: true });
      document.removeEventListener("dragstart", blockDrag);
      clearInterval(devtoolsCheck);
    };
  }, []);
};

/* =========================================================
    TAB LOCK HOOK
    - Blocks tab switching / window blur
    - Blocks browser back/forward
    - Blocks page refresh & close
    - Tracks violations; auto-submits at MAX_VIOLATIONS
========================================================= */
const MAX_VIOLATIONS = 3;

interface TabLockOptions {
  isActive: boolean;
  onViolation: (count: number, reason: string) => void;
  onAutoSubmit: () => void;
}

const useTabLock = ({ isActive, onViolation, onAutoSubmit }: TabLockOptions) => {
  const violationCountRef = useRef(0);
  const lastViolationTimeRef = useRef(0);

  useEffect(() => {
    if (!isActive) return;

    window.history.pushState(null,"", window.location.href);

    const handlePopState = () => {
      window.history.pushState(null,"", window.location.href);
      triggerViolation("Attempted to navigate away (back/forward button)");
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue ="Leaving will auto-submit your test. Are you sure?";
      return e.returnValue;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) triggerViolation("Tab was switched or window was minimised");
    };

    const handleWindowBlur = () => {
      triggerViolation("Window lost focus (possible tab switch or alt-tab)");
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ["t","n","w","Tab"].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        triggerViolation(`Blocked keyboard shortcut: ${e.ctrlKey ?"Ctrl" :"Cmd"}+${e.key}`);
      }
    };

    const triggerViolation = (reason: string) => {
      const now = Date.now();
      if (now - lastViolationTimeRef.current < 2000) return;
      lastViolationTimeRef.current = now;
      violationCountRef.current += 1;
      const count = violationCountRef.current;
      if (count >= MAX_VIOLATIONS) { onAutoSubmit(); }
      else { onViolation(count, reason); }
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isActive]);

  return { violationCount: violationCountRef.current };
};

/* =========================================================
    TYPES
========================================================= */
interface Question {
  id: string; questionNumber: number; questionText: string;
  options: Array<{ text: string }>; marks: number; negativeMarks: number;
  difficulty:"easy" |"medium" |"hard"; subject?: string; topic?: string;
}
interface TestSeries { id: string; title: string; duration: number; totalMarks: number; instructions: string[]; }
interface AttemptData {
  attemptId: string; testSeries: TestSeries; questions: Question[];
  startTime: string; timeRemaining: number; savedAnswers: Record<string, number>;
}
interface TestStats { correctAnswers: number; incorrectAnswers: number; unanswered: number; totalScore: number; percentage: number; }
interface StudentAuth { id: string; token: string; name?: string; email?: string; }

/* =========================================================
    AUTH UTILS
========================================================= */
const safeJsonParse = (str: string | null) => {
  try { if (!str) return null; return JSON.parse(str); } catch { return null; }
};
const saveAuthToLocal = (auth: StudentAuth) => localStorage.setItem("edudocs", JSON.stringify(auth));
const readAuthFromLocal = (): StudentAuth | null => {
  const parsed = safeJsonParse(localStorage.getItem("edudocs"));
  const studentId = parsed?.id || parsed?._id;
  if (!studentId || !parsed?.token) return null;
  return { ...parsed, id: studentId };
};
const readAuthFromQuery = (search: string): StudentAuth | null => {
  const params = new URLSearchParams(search);
  const token = params.get("token");
  const id = params.get("id") || params.get("_id");
  const name = params.get("name") || undefined;
  const email = params.get("email") || undefined;
  if (!token || !id) return null;
  return { id, token, name, email };
};

declare global { interface Window { ReactNativeWebView?: any; } }

/* =========================================================
    LEGEND ITEM
========================================================= */
const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <div style={{ display:"flex", alignItems:"center", gap: 6 }}>
    <div style={{ width: 14, height: 14, borderRadius: 3, background: color, flexShrink: 0 }} />
    <Text style={{ fontSize: 11, color:"#555" }}>{label}</Text>
  </div>
);

/* =========================================================
    TIMER DISPLAY
========================================================= */
const TimerDisplay = ({
  timeRemaining, totalSeconds, formatTime,
}: { timeRemaining: number; totalSeconds: number; formatTime: (s: number) => string }) => {
  const isCritical = timeRemaining < 180;
  const isWarning = timeRemaining < 600;
  const usedPct = totalSeconds > 0 ? ((totalSeconds - timeRemaining) / totalSeconds) * 100 : 0;
  const bg = isCritical ?"#fff1f0" : isWarning ?"#fff7e6" :"#f6ffed";
  const border = isCritical ?"#ffa39e" : isWarning ?"#ffd591" :"#b7eb8f";
  const color = isCritical ?"#cf1322" : isWarning ?"#d46b08" :"#389e0d";
  const barClr = isCritical ?"#ff4d4f" : isWarning ?"#faad14" :"#52c41a";

  return (
    <div style={{
      background: bg, border: `1.5px solid ${border}`, borderRadius: 10,
      padding:"7px 16px 5px", minWidth: 210,
      display:"flex", flexDirection:"column", alignItems:"center", gap: 3,
    }}>
      <div style={{ display:"flex", alignItems:"center", gap: 6 }}>
        <ClockCircleOutlined style={{ color, fontSize: 15, animation: isCritical ?"pulse-clock 1s infinite" :"none" }} />
        <Text strong style={{ color, fontSize: 17 }}>{formatTime(timeRemaining)}</Text>
        <Text style={{ color:"#bbb" }}>/</Text>
        <Text style={{ color:"#999" }}>{formatTime(totalSeconds)}</Text>
      </div>
      <div style={{ width:"100%", height: 4, background:"#e0e0e0", borderRadius: 2, overflow:"hidden" }}>
        <div style={{ height:"100%", width: `${usedPct}%`, background: barClr, borderRadius: 2, transition:"width 1s linear" }} />
      </div>
      <Text style={{ fontSize: 10, color:"#aaa", lineHeight: 1 }}>
        {isCritical ?" Last few minutes!" : isWarning ?" Running low" :" Time remaining"}
      </Text>
    </div>
  );
};

/* =========================================================
    VIOLATION WARNING MODAL
========================================================= */
interface ViolationModalProps {
  open: boolean; violationCount: number; reason: string; onResume: () => void;
}
const ViolationModal = ({ open, violationCount, reason, onResume }: ViolationModalProps) => {
  const remaining = MAX_VIOLATIONS - violationCount;
  return (
    <Modal
      open={open} closable={false} maskClosable={false} centered width={480}
      footer={
        <div style={{ textAlign:"center" }}>
          <Button type="primary" danger size="large" onClick={onResume} icon={<CheckCircleOutlined />} style={{ minWidth: 160 }}>
            I Understand, Resume Test
          </Button>
        </div>
      }
      title={null}
    >
      <div style={{ textAlign:"center", padding:"12px 0 4px" }}>
        <div style={{
          width: 72, height: 72, borderRadius:"50%",
          background:"#fff2f0", border:"3px solid #ff4d4f",
          display:"flex", alignItems:"center", justifyContent:"center",
          margin:"0 auto 16px", animation:"pulse-warning 1.5s ease-in-out infinite",
        }}>
          <EyeInvisibleOutlined style={{ fontSize: 32, color:"#ff4d4f" }} />
        </div>
        <Title level={4} style={{ color:"#cf1322", margin:"0 0 6px" }}> Violation Detected!</Title>
        <Text type="secondary" style={{ fontSize: 13 }}>{reason}</Text>
        <div style={{
          margin:"20px 0 16px", padding:"14px 20px",
          background:"#fff2f0", border:"1px solid #ffccc7", borderRadius: 10,
          animation:"violation-flash 0.8s ease",
        }}>
          <Row gutter={16} justify="center">
            <Col>
              <Statistic
                title={<Text style={{ fontSize: 12, color:"#666" }}>Violations</Text>}
                value={violationCount} suffix={`/ ${MAX_VIOLATIONS}`}
                valueStyle={{ color:"#cf1322", fontSize: 28, fontWeight: 700 }}
              />
            </Col>
            <Col>
              <Statistic
                title={<Text style={{ fontSize: 12, color:"#666" }}>Warnings Left</Text>}
                value={remaining}
                valueStyle={{ color: remaining === 1 ?"#cf1322" :"#faad14", fontSize: 28, fontWeight: 700 }}
              />
            </Col>
          </Row>
        </div>
        <Alert
          type="error" showIcon icon={<StopOutlined />}
          message={remaining === 1
            ?" FINAL WARNING: One more violation will AUTO-SUBMIT your test!"
            : `Your test will be automatically submitted after ${MAX_VIOLATIONS} violations.`}
          style={{ textAlign:"left", borderRadius: 8 }}
        />
        <Text style={{ display:"block", marginTop: 14, fontSize: 12, color:"#999" }}>
          Switching tabs, minimising, or navigating away is strictly prohibited.
        </Text>
      </div>
    </Modal>
  );
};

/* =========================================================
    AUTO-SUBMIT MODAL
========================================================= */
const AutoSubmitModal = ({ open }: { open: boolean }) => (
  <Modal open={open} closable={false} maskClosable={false} centered width={400} footer={null} title={null}>
    <div style={{ textAlign:"center", padding:"20px 0" }}>
      <div style={{ width: 64, height: 64, borderRadius:"50%", background:"#fff2f0", border:"3px solid #ff4d4f", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
        <StopOutlined style={{ fontSize: 28, color:"#ff4d4f" }} />
      </div>
      <Title level={4} style={{ color:"#cf1322" }}>Auto-Submitting Test</Title>
      <Text type="secondary">Maximum violations reached. Your test is being submitted automatically.</Text>
      <div style={{ marginTop: 20 }}><Spin size="large" /></div>
    </div>
  </Modal>
);

/* =========================================================
    MAIN COMPONENT
========================================================= */
export default function TestInterface() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  useCopyProtection();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attemptData, setAttemptData] = useState<AttemptData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [testStats, setTestStats] = useState<TestStats>({ correctAnswers: 0, incorrectAnswers: 0, unanswered: 0, totalScore: 0, percentage: 0 });
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [markedQuestions, setMarkedQuestions] = useState<Set<string>>(new Set());
  const [visitedQuestions, setVisitedQuestions] = useState<Set<number>>(new Set([0]));
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  //  Tab-lock state 
  const [violationModalOpen, setViolationModalOpen] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [violationReason, setViolationReason] = useState("");
  const [autoSubmitModalOpen, setAutoSubmitModalOpen] = useState(false);

  // Test is"active" once instructions dismissed and data loaded
  const testIsActive = !showInstructions && !!attemptData && !submitting;

  const submittedRef = useRef(false);
  const saveTimeoutRef = useRef<any>(null);
  const submitTestRef = useRef<() => Promise<void>>(async () => { });

  /*  Tab lock  */
  useTabLock({
    isActive: testIsActive,
    onViolation: (count, reason) => {
      setViolationCount(count);
      setViolationReason(reason);
      setViolationModalOpen(true);
    },
    onAutoSubmit: () => {
      setAutoSubmitModalOpen(true);
      setTimeout(() => submitTestRef.current(), 1500);
    },
  });

  /*  Auto fullscreen on load and exit on leave  */
  useEffect(() => {
    const requestFullscreen = () => {
      const el = document.documentElement as any;
      if (el.requestFullscreen) el.requestFullscreen().catch(() => { });
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
      else if (el.msRequestFullscreen) el.msRequestFullscreen();
    };
    const timer = setTimeout(requestFullscreen, 300);
    return () => {
      clearTimeout(timer);
      const doc = document as any;
      if (doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement) {
        if (doc.exitFullscreen) doc.exitFullscreen().catch(() => { });
        else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen();
        else if (doc.mozCancelFullScreen) doc.mozCancelFullScreen();
        else if (doc.msExitFullscreen) doc.msExitFullscreen();
      }
    };
  }, []);

  const getStudentData = (): StudentAuth | null => {
    const localAuth = readAuthFromLocal();
    if (localAuth) return localAuth;
    const queryAuth = readAuthFromQuery(location.search);
    if (queryAuth) { saveAuthToLocal(queryAuth); return queryAuth; }
    return null;
  };

  const getAuthHeaders = (): HeadersInit => {
    const student = getStudentData();
    if (!student?.token) return {"Content-Type":"application/json" };
    return {"Content-Type":"application/json", Authorization: `Bearer ${student.token}` };
  };

  const logoutAndRedirect = () => {
    localStorage.removeItem("edudocs");
    toast.error("Session expired. Please login again.");
    navigate("/student-login");
  };

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      try {
        const data = safeJsonParse(event.data);
        if (data?.token && data?.id) { saveAuthToLocal(data); toast.success("App session loaded"); }
      } catch { }
    };
    window.addEventListener("message", handler);
    document.addEventListener("message", handler as any);
    return () => { window.removeEventListener("message", handler); document.removeEventListener("message", handler as any); };
  }, []);

  const startTest = async () => {
    try {
      setLoading(true); setError(null);
      const student = getStudentData();
      if (!student?.id) { toast.error("Please login to take the test"); navigate("/student-login"); return; }
      if (!testId) { setError("Test ID missing"); return; }
      const response = await fetch(`${uri}/student/test-series/attempt/${testId}/start`, {
        method:"POST", headers: getAuthHeaders(), body: JSON.stringify({ studentId: student.id }),
      });
      const data = await response.json();
      if (response.status === 401) { logoutAndRedirect(); return; }
      if (response.status === 403) {
        const studentId = student?.id || student?._id;
        toast.warning(data.message || "Access denied. Please purchase this test series first.");
        navigate(studentId ? `/v2/student/my-test-series/${studentId}` : "/v2/student/my-test-series");
        return;
      }
      if (!data.success) throw new Error(data.message ||"Failed to start test");

      if (data.timeExpired || data.attempt?.status === "completed") {
        const attemptId = data.attempt?.attemptId || data.attempt?._id || data.attempt?.id || testId;
        toast.warning(data.message || "Test time expired. Directing to results...");
        navigate(`/v2/student/test-results/${attemptId}`);
        return;
      }

      setAttemptData(data.attempt);
      setAnswers(data.attempt.savedAnswers || {});
      setTimeRemaining(data.attempt.timeRemaining);
      setTotalSeconds((data.attempt.testSeries?.duration || 0) * 60);
      setShowInstructions(Object.keys(data.attempt.savedAnswers || {}).length === 0);
      toast.success("Test loaded successfully!");
    } catch (err: any) {
      setError(err.message ||"Failed to load test");
      toast.error(err.message ||"Failed to load test");
    } finally { setLoading(false); }
  };

  const saveAnswer = useCallback(async (questionId: string, selectedOption: number) => {
    if (!attemptData) return;
    try {
      setSaving(true);
      const response = await fetch(`${uri}/student/test-series/attempt/${attemptData.attemptId}/answer`, {
        method:"PUT", headers: getAuthHeaders(), body: JSON.stringify({ questionId, selectedOption, timeSpent: 0 }),
      });
      const data = await response.json();
      if (response.status === 401) { logoutAndRedirect(); return; }
      if (!data.success) throw new Error(data.message ||"Failed to save answer");
      setTestStats(data.stats); setLastSaved(new Date());
    } catch { toast.error("Failed to save answer"); }
    finally { setSaving(false); }
  }, [attemptData]);

  const handleAnswerSelect = (questionId: string, selectedOption: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: selectedOption }));
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => saveAnswer(questionId, selectedOption), 700);
  };

  const goToQuestion = (idx: number) => {
    if (!attemptData || idx < 0 || idx >= attemptData.questions.length) return;
    setCurrentQuestion(idx);
    setVisitedQuestions((prev) => new Set([...prev, idx]));
  };
  const nextQuestion = () => { if (attemptData && currentQuestion < attemptData.questions.length - 1) goToQuestion(currentQuestion + 1); };
  const previousQuestion = () => { if (currentQuestion > 0) goToQuestion(currentQuestion - 1); };

  const toggleMarkForReview = () => {
    if (!attemptData) return;
    const qid = attemptData.questions[currentQuestion].id;
    setMarkedQuestions((prev) => {
      const copy = new Set(prev);
      if (copy.has(qid)) { copy.delete(qid); toast.info("Unmarked"); }
      else { copy.add(qid); toast.success("Marked for review"); }
      return copy;
    });
  };

  const submitTest = async () => {
    if (!attemptData || submittedRef.current) return;
    try {
      submittedRef.current = true; setSubmitting(true);
      const student = getStudentData();
      if (!student?.id) { logoutAndRedirect(); return; }
      const timeTaken = Math.floor((Date.now() - new Date(attemptData.startTime).getTime()) / 1000);
      const response = await fetch(`${uri}/student/test-series/attempt/${attemptData.attemptId}/submit`, {
        method:"POST", headers: getAuthHeaders(), body: JSON.stringify({ timeTaken, studentId: student.id }),
      });
      const data = await response.json();
      if (response.status === 401) { logoutAndRedirect(); return; }
      if (!data.success) throw new Error(data.message ||"Failed to submit test");
      toast.success("Test submitted successfully!");
      navigate(`/v2/student/test-results/${attemptData.attemptId}`, { state: { results: data.results } });
    } catch (err: any) {
      toast.error(err.message ||"Submit failed");
      submittedRef.current = false;
    } finally { setSubmitting(false); setShowSubmitModal(false); }
  };

  useEffect(() => { submitTestRef.current = submitTest; }, [submitTest]);

  useEffect(() => {
    if (!attemptData || timeRemaining <= 0) return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        const t = prev - 1;
        if (t <= 0) { toast.warning("Time expired! Submitting test..."); setTimeout(() => submitTest(), 800); return 0; }
        return t;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeRemaining, attemptData]);

  useEffect(() => { if (testId) startTest(); }, [testId]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
    return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  };

  const getQuestionStatus = (index: number) => {
    if (!attemptData) return"not-visited";
    const q = attemptData.questions[index];
    const hasAnswer = answers[q.id] !== undefined;
    const isMarked = markedQuestions.has(q.id);
    const isVisited = visitedQuestions.has(index);
    if (hasAnswer && isMarked) return"answered-marked";
    if (hasAnswer) return"answered";
    if (isMarked) return"marked";
    if (isVisited) return"visited";
    return"not-visited";
  };

  const STATUS_COLORS: Record<string, string> = {
    answered:"#52c41a","answered-marked":"#722ed1", marked:"#faad14",
    visited:"#ff4d4f","not-visited":"#d9d9d9",
  };

  // Resolve student for watermark label
  const studentData = getStudentData();

  /*  LOADING  */
  if (loading) return (
    <>
      <CopyProtectionStyles />
      <ScreenWatermark email={studentData?.email} name={studentData?.name} />
      <div style={{ display:"flex", justifyContent:"center", alignItems:"center", minHeight:"100vh", flexDirection:"column" }}>
        <Spin size="large" />
        <Title level={4} style={{ marginTop: 16, color:"#1890ff" }}>Preparing your test...</Title>
      </div>
    </>
  );

  /*  ERROR  */
  if (error || !attemptData) return (
    <>
      <CopyProtectionStyles />
      <ScreenWatermark email={studentData?.email} name={studentData?.name} />
      <div style={{ padding: 40, maxWidth: 650, margin:"0 auto" }}>
        <Alert
          message="Unable to Load Test"
          description={error ||"The test could not be loaded."}
          type="error" showIcon
          action={<Space>
            <Button onClick={startTest}>Retry</Button>
            <Button onClick={() => navigate("/student-dashboard")}>Back</Button>
          </Space>}
        />
      </div>
    </>
  );

  const currentQ = attemptData.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / attemptData.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = attemptData.questions.length - answeredCount;

  /*  INSTRUCTIONS SCREEN  */
  if (showInstructions) return (
    <>
      <CopyProtectionStyles />
      <ScreenWatermark email={studentData?.email} name={studentData?.name} />
      <Modal
        className="premium-modal"
        title={
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: '100%', padding: '10px 0 5px' }}>
            <div style={{
              width: 54, height: 54, borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(99, 102, 241, 0.1))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#7C3AED', boxShadow: '0 8px 16px rgba(124, 58, 237, 0.08)'
            }}>
              <BookOutlined style={{ fontSize: 26 }} />
            </div>
            <Title level={3} style={{ margin: '8px 0 0', fontWeight: 800, background: 'linear-gradient(135deg, #1E1B4B, #4F46E5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>
              Test Instructions & Guide
            </Title>
            <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>
              Please read carefully before starting the examination
            </Text>
          </div>
        }
        open={true}
        onCancel={() => navigate("/student-dashboard")}
        centered
        width={720}
        footer={
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, padding: '10px 0 16px', borderTop: 'none' }}>
            <Button 
              onClick={() => navigate("/student-dashboard")}
              style={{
                borderRadius: '30px',
                fontWeight: 800,
                padding: '10px 28px',
                height: 'auto',
                fontSize: 14,
                borderColor: '#CBD5E1',
                color: '#475569',
                transition: 'all 0.2s',
              }}
            >
              Cancel
            </Button>
            <Button 
              type="primary"
              size="large"
              onClick={() => setShowInstructions(false)}
              style={{
                borderRadius: '30px',
                fontWeight: 800,
                padding: '10px 36px',
                height: 'auto',
                fontSize: 14,
                background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
                border: 'none',
                boxShadow: '0 8px 20px rgba(124, 58, 237, 0.25)',
                transition: 'all 0.2s',
              }}
            >
              Start Test
            </Button>
          </div>
        }
      >
        <div style={{ padding: '8px 0' }}>
          
          {/* Stats Cards Row */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {[
              { title: "Duration", value: attemptData.testSeries.duration, suffix: " min", icon: <ClockCircleOutlined style={{ fontSize: 18, color: '#7C3AED' }} />, bg: 'linear-gradient(135deg, rgba(124, 58, 237, 0.03) 0%, rgba(99, 102, 241, 0.03) 100%)', border: '1px solid rgba(124, 58, 237, 0.08)' },
              { title: "Questions", value: attemptData.questions.length, suffix: " Items", icon: <BookOutlined style={{ fontSize: 18, color: '#10B981' }} />, bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.03) 0%, rgba(5, 150, 105, 0.03) 100%)', border: '1px solid rgba(16, 185, 129, 0.08)' },
              { title: "Total Marks", value: attemptData.testSeries.totalMarks, suffix: " Pts", icon: <CheckCircleOutlined style={{ fontSize: 18, color: '#3B82F6' }} />, bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.03) 0%, rgba(37, 99, 235, 0.03) 100%)', border: '1px solid rgba(59, 130, 246, 0.08)' },
              { 
                title: "Time Left", 
                value: formatTime(timeRemaining), 
                suffix: "", 
                icon: <ClockCircleOutlined style={{ fontSize: 18, color: timeRemaining < 600 ? '#EF4444' : '#F59E0B', animation: timeRemaining < 180 ? 'pulse-clock 1s infinite' : 'none' }} />, 
                bg: timeRemaining < 600 ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.04) 0%, rgba(220, 38, 38, 0.04) 100%)' : 'linear-gradient(135deg, rgba(245, 158, 11, 0.03) 0%, rgba(217, 119, 6, 0.03) 100%)', 
                border: timeRemaining < 600 ? '1px solid rgba(239, 68, 68, 0.12)' : '1px solid rgba(245, 158, 11, 0.1)',
                valueColor: timeRemaining < 600 ? '#EF4444' : '#F59E0B'
              }
            ].map((stat, i) => (
              <Col span={6} key={i}>
                <div style={{
                  background: stat.bg,
                  border: stat.border,
                  borderRadius: '16px',
                  padding: '16px 12px',
                  textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.01)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {stat.icon}
                  </div>
                  <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.title}</Text>
                  <Title level={4} style={{ margin: 0, fontWeight: 800, color: stat.valueColor || '#1E1B4B', fontSize: '1.15rem', letterSpacing: '-0.01em' }}>
                    {stat.value}<span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>{stat.suffix}</span>
                  </Title>
                </div>
              </Col>
            ))}
          </Row>

          {/* Strict Warning Alert */}
          <div style={{
            background: 'linear-gradient(to right, rgba(239, 68, 68, 0.06), rgba(248, 113, 113, 0.02))',
            border: '1.5px solid rgba(239, 68, 68, 0.15)',
            borderRadius: '18px',
            padding: '18px 24px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 16
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: '12px',
              background: '#EF4444',
              color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 10px rgba(239, 68, 68, 0.25)',
              marginTop: 2
            }}>
              <StopOutlined style={{ fontSize: 18 }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Text style={{ fontWeight: 800, color: '#991B1B', fontSize: 14 }}>
                Strict Environment: Tab Switching Prohibited
              </Text>
              <Text style={{ color: '#7F1D1D', fontSize: 12.5, lineHeight: 1.5, fontWeight: 500 }}>
                This examination is fully locked. Minimizing the window, opening other tabs, pressing Alt+Tab, or navigating away will be recorded as a violation. Reaching <strong style={{ color: '#B91C1C' }}>{MAX_VIOLATIONS} violations</strong> will automatically submit your test.
              </Text>
            </div>
          </div>

          {/* Important Instructions List */}
          <div style={{ marginBottom: 24 }}>
            <Title level={5} style={{ color: '#1E1B4B', fontWeight: 800, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 4, height: 16, background: '#7C3AED', borderRadius: 2 }} />
              Important Exam Instructions
            </Title>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(attemptData.testSeries.instructions?.length
                ? attemptData.testSeries.instructions
                : [
                    "Read each question carefully before attempting.",
                    "Each question has exactly one correct choice.",
                    "Negative marking will be applied to incorrect responses.",
                    "Use the Next and Previous buttons to navigate the test series.",
                    "Utilize the Mark for Review feature if you want to verify answers later.",
                    "Ensure you submit the examination before the timer expires."
                  ]
              ).map((instruction, index) => (
                <div key={index} className="instruction-item" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  background: '#F8FAFC',
                  border: '1px solid #F1F5F9',
                  borderRadius: '12px',
                  transition: 'all 0.2s ease',
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: '#7C3AED',
                    color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800, flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(124, 58, 237, 0.2)'
                  }}>
                    {index + 1}
                  </div>
                  <Text style={{ fontSize: 13, color: '#334155', fontWeight: 600 }}>{instruction}</Text>
                </div>
              ))}
            </div>
          </div>

          {/* Note Warning Box */}
          <div style={{
            background: 'linear-gradient(to right, rgba(245, 158, 11, 0.05), rgba(251, 191, 36, 0.02))',
            border: '1px solid rgba(245, 158, 11, 0.15)',
            borderRadius: '14px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <WarningOutlined style={{ color: '#F59E0B', fontSize: 16 }} />
            <Text style={{ fontSize: 12, color: '#92400E', fontWeight: 600 }}>
              <strong>Note:</strong> A stable internet connection is required. All your choices are auto-saved in real-time.
            </Text>
          </div>

        </div>
      </Modal>
    </>
  );

  /* =========================================================
      MAIN TEST UI
  ========================================================= */
  return (
    <>
      <CopyProtectionStyles />

      {/*  Screen Watermark (traceable identity on every screenshot)  */}
      <ScreenWatermark email={studentData?.email} name={studentData?.name} />

      {/*  Violation warning modal  */}
      <ViolationModal
        open={violationModalOpen}
        violationCount={violationCount}
        reason={violationReason}
        onResume={() => setViolationModalOpen(false)}
      />

      {/*  Auto-submit modal  */}
      <AutoSubmitModal open={autoSubmitModalOpen} />

      <div style={{ minHeight:"100vh", background:"#f0f2f5" }}>

        {/*  HEADER  */}
        <Affix offsetTop={0}>
          <div style={{ background:"#fff", borderBottom:"2px solid #1890ff", boxShadow:"0 2px 8px rgba(0,0,0,0.1)", padding: isMobile ?"8px 12px" :"10px 20px" }}>
            <Row justify="space-between" align="middle" gutter={[0, 8]}>
              <Col xs={24} md={14}>
                <Space split={!isMobile && <Divider type="vertical" />} direction={isMobile ?"vertical" :"horizontal"} size={isMobile ? 0 :"small"} style={{ width:"100%" }}>
                  <Title level={5} style={{ margin: 0, color:"#1890ff", fontSize: isMobile ? 14 : 16, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth: isMobile ?"70vw" :"auto" }}>
                    {attemptData.testSeries.title}
                  </Title>
                  <div style={{ display:"flex", alignItems:"center", gap: 12 }}>
                    <Text strong style={{ fontSize: isMobile ? 12 : 14 }}>Q {currentQuestion + 1} / {attemptData.questions.length}</Text>
                    {violationCount > 0 && (
                      <Tooltip title={`${violationCount} tab-switch violation(s) recorded`}>
                        <Tag color="error" icon={<EyeInvisibleOutlined />} style={{ animation:"pulse-warning 1.5s infinite", cursor:"default", fontSize: 10, margin: 0 }}>
                          {violationCount}/{MAX_VIOLATIONS}
                        </Tag>
                      </Tooltip>
                    )}
                  </div>
                </Space>
              </Col>
              <Col xs={24} md={10} style={{ textAlign: isMobile ?"left" :"right" }}>
                <div style={{ display:"flex", alignItems:"center", gap: 8, justifyContent: isMobile ?"space-between" :"flex-end", flexWrap:"wrap" }}>
                  <TimerDisplay timeRemaining={timeRemaining} totalSeconds={totalSeconds} formatTime={formatTime} />
                  <div style={{ display:"flex", gap: 8, alignItems:"center" }}>
                    <Button type="primary" danger icon={<SendOutlined />} onClick={() => setShowSubmitModal(true)} size={isMobile ?"middle" :"middle"}>
                      Submit
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>
            <Progress percent={progress} strokeColor="#1890ff" trailColor="#f0f0f0" showInfo={false} size="small" style={{ marginTop: 8, marginBottom: 0 }} />
          </div>
        </Affix>

        {/*  BODY  */}
        <div style={{ display:"flex", flexDirection: isMobile ?"column" :"row", padding: isMobile ?"12px 10px" :"20px 16px", gap: 16, minHeight:"calc(100vh - 80px)" }}>

          {/*  QUESTION AREA (LEFT)  */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Card style={{ borderRadius: 12, boxShadow:"0 4px 16px rgba(0,0,0,0.08)", minHeight: isMobile ?"auto" :"calc(100vh - 140px)" }} bodyStyle={{ padding: isMobile ? 16 : 28 }}>
              <div style={{ marginBottom: 20 }}>
                <Row justify="space-between" align="top">
                  <Col flex="auto">
                    <Space size="small" wrap>
                      <Text strong style={{ fontSize: 15 }}>Question {currentQ.questionNumber}</Text>
                      <Tag color="blue">+{currentQ.marks} marks</Tag>
                      {currentQ.negativeMarks > 0 && <Tag color="red">{currentQ.negativeMarks}</Tag>}
                      <Tag color={currentQ.difficulty ==="easy" ?"green" : currentQ.difficulty ==="medium" ?"orange" :"red"}>{currentQ.difficulty}</Tag>
                      {currentQ.subject && <Tag>{currentQ.subject}</Tag>}
                      {currentQ.topic && <Tag>{currentQ.topic}</Tag>}
                    </Space>
                  </Col>
                  <Col>
                    <Button
                      type={markedQuestions.has(currentQ.id) ?"primary" :"default"}
                      icon={<FlagOutlined />}
                      onClick={toggleMarkForReview}
                      size="small"
                    >
                      {markedQuestions.has(currentQ.id) ?"Marked" :"Mark for Review"}
                    </Button>
                  </Col>
                </Row>
              </div>

              <div style={{ fontSize: 16, lineHeight: 1.7, background:"#fafafa", padding:"18px 22px", borderRadius: 10, border:"1px solid #e8e8e8", marginBottom: 28, color:"#1a1a1a" }}>
                {currentQ.questionText}
              </div>

              <Radio.Group value={answers[currentQ.id]} onChange={(e) => handleAnswerSelect(currentQ.id, e.target.value)} style={{ width:"100%" }}>
                <Space direction="vertical" style={{ width:"100%" }} size="middle">
                  {currentQ.options.map((option, index) => {
                    const isSelected = answers[currentQ.id] === index;
                    return (
                      <Radio
                        key={index}
                        value={index}
                        style={{
                          padding:"12px 16px", borderRadius: 10,
                          border: isSelected ?"2px solid #1890ff" :"1px solid #e8e8e8",
                          background: isSelected ?"#e6f7ff" :"#fff",
                          width:"100%", margin: 0, transition:"all 0.15s ease",
                          boxShadow: isSelected ?"0 2px 8px rgba(24,144,255,0.15)" :"none",
                        }}
                      >
                        <Text style={{ fontSize: 15, marginLeft: 6 }}>
                          <strong style={{ color: isSelected ?"#1890ff" :"#333" }}>{String.fromCharCode(65 + index)}.</strong>{""}
                          {option.text}
                        </Text>
                      </Radio>
                    );
                  })}
                </Space>
              </Radio.Group>

              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop: 32, paddingTop: 20, borderTop:"1px solid #f0f0f0" }}>
                <Button icon={<ArrowLeftOutlined />} onClick={previousQuestion} disabled={currentQuestion === 0} size="large">Previous</Button>
                <Text type="secondary" style={{ fontSize: 13 }}>{currentQuestion + 1} of {attemptData.questions.length}</Text>
                <Button type="primary" icon={<ArrowRightOutlined />} onClick={nextQuestion} disabled={currentQuestion === attemptData.questions.length - 1} size="large">Next</Button>
              </div>
            </Card>
          </div>

          {/*  RIGHT SIDEBAR  */}
          <div style={{ width: isMobile ?"100%" : 240, flexShrink: 0, display:"flex", flexDirection:"column", gap: 12 }}>

            {/* Progress card */}
            <Card
              size="small"
              title={<Text strong style={{ fontSize: 13 }}> Progress</Text>}
              style={{ borderRadius: 10, boxShadow:"0 2px 8px rgba(0,0,0,0.07)" }}
              bodyStyle={{ padding:"10px 12px" }}
            >
              <Row gutter={8} style={{ marginBottom: 8 }}>
                <Col span={12}><div style={{ textAlign:"center", background:"#f6ffed", borderRadius: 6, padding:"6px 4px" }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color:"#52c41a" }}>{answeredCount}</div>
                  <div style={{ fontSize: 10, color:"#666" }}>Answered</div>
                </div></Col>
                <Col span={12}><div style={{ textAlign:"center", background:"#fff7e6", borderRadius: 6, padding:"6px 4px" }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color:"#faad14" }}>{markedQuestions.size}</div>
                  <div style={{ fontSize: 10, color:"#666" }}>Marked</div>
                </div></Col>
              </Row>
              <Row gutter={8}>
                <Col span={12}><div style={{ textAlign:"center", background:"#fff2f0", borderRadius: 6, padding:"6px 4px" }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color:"#ff4d4f" }}>{unansweredCount}</div>
                  <div style={{ fontSize: 10, color:"#666" }}>Pending</div>
                </div></Col>
                <Col span={12}><div style={{ textAlign:"center", background:"#f9f0ff", borderRadius: 6, padding:"6px 4px" }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color:"#722ed1" }}>{attemptData.questions.length}</div>
                  <div style={{ fontSize: 10, color:"#666" }}>Total</div>
                </div></Col>
              </Row>
            </Card>

            {/* Violation tracker card */}
            <Card
              size="small"
              title={<Text strong style={{ fontSize: 13 }}> Tab Lock</Text>}
              style={{
                borderRadius: 10, boxShadow:"0 2px 8px rgba(0,0,0,0.07)",
                border: violationCount > 0 ?"1px solid #ffccc7" :"1px solid #b7eb8f",
                background: violationCount > 0 ?"#fff2f0" :"#f6ffed",
              }}
              bodyStyle={{ padding:"10px 12px" }}
            >
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: violationCount === 0 ?"#52c41a" : violationCount >= MAX_VIOLATIONS - 1 ?"#cf1322" :"#faad14" }}>
                  {violationCount} / {MAX_VIOLATIONS}
                </div>
                <Text style={{ fontSize: 11, color:"#666" }}>Violations</Text>
                <div style={{ marginTop: 8 }}>
                  <Progress
                    percent={(violationCount / MAX_VIOLATIONS) * 100}
                    showInfo={false}
                    strokeColor={violationCount === 0 ?"#52c41a" : violationCount >= MAX_VIOLATIONS - 1 ?"#ff4d4f" :"#faad14"}
                    size="small"
                  />
                </div>
                <Text style={{ fontSize: 10, color:"#999", display:"block", marginTop: 4 }}>
                  {violationCount === 0 ?" No violations" : ` ${MAX_VIOLATIONS - violationCount} warning(s) left`}
                </Text>
              </div>
            </Card>

            {/* Legend */}
            <Card
              size="small"
              title={<Text strong style={{ fontSize: 13 }}> Legend</Text>}
              style={{ borderRadius: 10, boxShadow:"0 2px 8px rgba(0,0,0,0.07)" }}
              bodyStyle={{ padding:"10px 12px" }}
            >
              <Space direction="vertical" size={6} style={{ width:"100%" }}>
                <LegendItem color="#52c41a" label="Answered" />
                <LegendItem color="#722ed1" label="Answered + Marked" />
                <LegendItem color="#faad14" label="Marked for Review" />
                <LegendItem color="#ff4d4f" label="Visited, Not Answered" />
                <LegendItem color="#d9d9d9" label="Not Visited" />
              </Space>
            </Card>

            {/* Question grid */}
            <Card
              size="small"
              title={<Text strong style={{ fontSize: 13 }}> Questions</Text>}
              style={{ borderRadius: 10, boxShadow:"0 2px 8px rgba(0,0,0,0.07)", flex: 1, overflow:"hidden" }}
              bodyStyle={{ padding:"10px 12px", maxHeight: 420, overflowY:"auto" }}
            >
              <div style={{ display:"grid", gridTemplateColumns:"repeat(5, 1fr)", gap: 6 }}>
                {attemptData.questions.map((_, idx) => {
                  const status = getQuestionStatus(idx);
                  const isCurrent = currentQuestion === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => goToQuestion(idx)}
                      style={{
                        width:"100%", aspectRatio:"1", borderRadius: 6,
                        background: STATUS_COLORS[status],
                        color: status ==="not-visited" ?"#555" :"white",
                        border: isCurrent ?"2.5px solid #1890ff" :"2px solid transparent",
                        fontWeight: isCurrent ?"700" :"500",
                        fontSize: 12, cursor:"pointer",
                        boxShadow: isCurrent ?"0 0 0 2px rgba(24,144,255,0.3)" :"none",
                        transition:"all 0.15s ease", outline:"none",
                      }}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>
          {/*  END RIGHT SIDEBAR  */}

        </div>
      </div>

      {/*  SUBMIT MODAL  */}
      <Modal
        title={<div style={{ textAlign:"center" }}><WarningOutlined style={{ color:"#faad14", marginRight: 8 }} />Submit Test Confirmation</div>}
        open={showSubmitModal}
        onCancel={() => setShowSubmitModal(false)}
        centered
        closable={!submitting}
        maskClosable={!submitting}
        footer={
          <div style={{ textAlign:"center" }}>
            <Space>
              <Button onClick={() => setShowSubmitModal(false)} disabled={submitting}>Continue Exam</Button>
              <Button type="primary" danger loading={submitting} onClick={submitTest}>Yes, Submit</Button>
            </Space>
          </div>
        }
      >
        <Alert
          message="Are you sure you want to submit?"
          description={
            <Space direction="vertical" size={4}>
              <Text>Once submitted, you cannot change your answers.</Text>
              <Text>
                Answered: <strong style={{ color:"#52c41a" }}>{answeredCount}</strong>&nbsp;|&nbsp;
                Unanswered: <strong style={{ color:"#ff4d4f" }}>{unansweredCount}</strong>&nbsp;|&nbsp;
                Marked: <strong style={{ color:"#faad14" }}>{markedQuestions.size}</strong>
              </Text>
            </Space>
          }
          type="warning" showIcon style={{ marginBottom: 8 }}
        />
      </Modal>
    </>
  );
}