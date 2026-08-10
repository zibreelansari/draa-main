import { useEffect, useState, useRef } from"react";
import {
  message,
  notification,
} from"antd";
import {
  CheckCircleOutlined,
  FileTextOutlined,
  VideoCameraOutlined,
  EyeOutlined,
  BookOutlined,
} from"@ant-design/icons";
import { useParams, useNavigate } from"react-router-dom";
import axios from"axios";
import url from"../../url";
import usePageTitle from '../../hooks/usePageTitle';

const MAX_VIOLATIONS = 3;

interface ExamQuestion {
  _id?: string;
  questionText: string;
  type:"mcq" |"short" |"paragraph";
  options?: string[];
  marks?: number;
}

interface ExamData {
  _id: string;
  title: string;
  subject: string;
  instructions?: string;
  durationMinutes: number;
  totalMarks?: number;
  questions: ExamQuestion[];
  scheduledAt?: string;
  courseId?: string;
}

//  SVG ICONS 
const Icons: Record<string, (s?: number, c?: string) => React.ReactNode> = {
  check: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  file: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
  video: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>,
  eye: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
  book: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>,
  warning: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  clock: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
};

export default function StudentOngoingExam() {
  usePageTitle('Ongoing Exam | Draa');
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  const [showRulesModal, setShowRulesModal] = useState<boolean>(true);
  const [exam, setExam] = useState<ExamData | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [violationCount, setViolationCount] = useState<number>(0);
  const [violations, setViolations] = useState<string[]>([]);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [examStartTime, setExamStartTime] = useState<Date | null>(null);
  const [isProctoring, setIsProctoring] = useState<boolean>(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const studentInfo = JSON.parse(localStorage.getItem("edudocs") ||"{}");

  useEffect(() => {
    if (!examId) {
      message.error("Invalid exam ID");
      navigate("/student/my-exams");
      return;
    }

    axios.get(`${url}/exam/student/fetch/${examId}`)
      .then(res => {
        if (res.data.success) {
          const examData = res.data.exam as ExamData;
          setExam(examData);
          setTimeLeft(examData.durationMinutes * 60);
          setExamStartTime(new Date());
        } else {
          message.error("Exam not found");
          navigate("/student/my-exams");
        }
      })
      .catch(() => {
        message.error("Failed to fetch exam");
        navigate("/student/my-exams");
      });
  }, [examId, navigate]);

  useEffect(() => {
    if (!exam || timeLeft <= 0) {
      if (exam && timeLeft <= 0 && !isSubmitting) {
        handleSubmit(true,"Time expired");
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          handleSubmit(true,"Time expired");
          return 0;
        }
        if (prevTime === 300) {
          notification.warning({
            message:'5 Minutes Remaining!',
            description:'Please review your answers.',
            placement:'topRight',
            duration: 5
          });
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft, exam, isSubmitting]);

  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach(track => track.stop());
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("contextmenu", preventEvent);
      document.removeEventListener("copy", preventEvent);
      document.removeEventListener("paste", preventEvent);
      document.removeEventListener("cut", preventEvent);
      document.removeEventListener("selectstart", preventEvent);
    };
  }, []);

  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    if (hours > 0) return `${hours.toString().padStart(2,"0")}:${minutes.toString().padStart(2,"0")}:${seconds.toString().padStart(2,"0")}`;
    return `${minutes.toString().padStart(2,"0")}:${seconds.toString().padStart(2,"0")}`;
  };

  const requestPermissions = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode:"user" }, audio: true });
      mediaStreamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); setIsProctoring(true); }
      message.success("Camera and microphone access granted");
      return true;
    } catch (error) {
      message.error("Camera & microphone access is required to take this exam");
      return false;
    }
  };

  const enterFullscreen = () => {
    const element = document.documentElement;
    if (element.requestFullscreen) element.requestFullscreen().catch(() => message.warning("Please manually enter fullscreen mode"));
  };

  const addViolation = (type: string) => {
    const newCount = violationCount + 1;
    const violationMessage = `${type} - ${new Date().toLocaleTimeString()}`;
    setViolationCount(newCount);
    setViolations(prev => [...prev, violationMessage]);
    setIsLocked(true);
    message.warning({ content: ` Violation ${newCount}/${MAX_VIOLATIONS}: ${type}`, duration: 3 });
    if (newCount >= MAX_VIOLATIONS) {
      message.error("Maximum violations reached! Auto-submitting exam...");
      setTimeout(() => handleSubmit(true, `Max violations reached (${newCount})`), 2000);
    } else {
      setTimeout(() => { if (newCount < MAX_VIOLATIONS) setIsLocked(false); }, 5000);
    }
  };

  const handleVisibilityChange = () => {
    if (document.hidden || document.visibilityState !=="visible") addViolation("Tab/window switch detected");
  };

  const preventEvent = (e: Event) => e.preventDefault();

  const startExam = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;
    setShowRulesModal(false);
    enterFullscreen();
    document.addEventListener("contextmenu", preventEvent);
    document.addEventListener("copy", preventEvent);
    document.addEventListener("paste", preventEvent);
    document.addEventListener("cut", preventEvent);
    document.addEventListener("selectstart", preventEvent);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    message.success("Exam started! Good luck!");
  };

  const handleAnswerChange = (qIndex: number, val: string) => {
    if (isLocked) { message.error("Exam is temporarily locked due to violation. Please wait..."); return; }
    setAnswers(prev => ({ ...prev, [qIndex]: val }));
  };

  const handleSubmit = async (isAutoSubmit: boolean = false, reason?: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    document.removeEventListener("contextmenu", preventEvent);
    document.removeEventListener("copy", preventEvent);
    document.removeEventListener("paste", preventEvent);
    document.removeEventListener("cut", preventEvent);
    document.removeEventListener("selectstart", preventEvent);
    if (mediaStreamRef.current) { mediaStreamRef.current.getTracks().forEach(track => track.stop()); setIsProctoring(false); }
    if (document.exitFullscreen && document.fullscreenElement) document.exitFullscreen().catch(() => {});

    const submissionData = {
      studentId: studentInfo.id,
      answers,
      submissionTime: new Date().toISOString(),
      timeSpent: exam ? (exam.durationMinutes * 60 - timeLeft) : 0,
      violations: { count: violationCount, details: violations },
      isAutoSubmit,
      autoSubmitReason: reason,
      examStartTime: examStartTime?.toISOString(),
      userAgent: navigator.userAgent,
      metadata: {
        browserInfo: navigator.userAgent,
        screenResolution: `${screen.width}x${screen.height}`,
        examDuration: exam?.durationMinutes,
        totalQuestions: exam?.questions.length,
        answeredQuestions: Object.keys(answers).length
      }
    };

    try {
      message.loading({ content: isAutoSubmit ?"Auto-submitting exam..." :"Submitting your answers...", key:"submit" });
      const response = await axios.post(`${url}/exam/student/submit/${examId}`, submissionData);
      if (response.data.success) {
        message.success({ content: isAutoSubmit ? `Exam auto-submitted: ${reason}` :"Exam submitted successfully!", key:"submit", duration: 3 });
        navigate("/v2/student/exam-results", {
          state: {
            submissionId: response.data.submissionId,
            examTitle: exam?.title,
            isAutoSubmit,
            violationCount,
            timeSpent: exam ? (exam.durationMinutes * 60 - timeLeft) : 0
          }
        });
      } else {
        throw new Error(response.data.message ||"Submission failed");
      }
    } catch (error: any) {
      message.error({ content: `Submission failed: ${error.response?.data?.message || error.message}`, key:"submit", duration: 5 });
      setIsSubmitting(false);
    }
  };

  const getProgressColor = () => {
    const percentage = (timeLeft / (exam?.durationMinutes * 60 || 1)) * 100;
    if (percentage > 50) return"#10b981";
    if (percentage > 25) return"#f59e0b";
    return"#ef4444";
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = exam?.questions.length || 0;
  const progressPct = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  if (!exam) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --ink: #0d0c1d; --ink2: #4b4966; --ink3: #9896b8;
          --bg: #f5f4ff; --surface: #ffffff; --edge: #e8e7f8; --edge2: rgba(94,107,255,.1);
          --accent: #6366f1; --accent2: #5E6BFF; --accent-bg: rgba(94,107,255,.07);
          --green: #10b981; --amber: #f59e0b; --red: #ef4444; --sky: #0ea5e9;
          --sh: 0 1px 3px rgba(13,12,29,.05), 0 4px 16px rgba(94,107,255,.07);
          --sh2: 0 4px 24px rgba(94,107,255,.13), 0 1px 4px rgba(13,12,29,.07);
          --r: 7px; --rs: 7px; --tr: .2s cubic-bezier(.4,0,.2,1);
          --font:'Inter', system-ui, -apple-system, BlinkMacSystemFont,'Segoe UI', Roboto, sans-serif; /* --display removed */
        }
        html, body { height: 100%; font-family: var(--font); background: var(--bg); color: var(--ink); -webkit-font-smoothing: antialiased; }
        * { font-family: var(--font); }

        .btn { display: inline-flex; align-items: center; gap: 7px; padding: 9px 18px; border-radius: 7px; border: none; cursor: pointer; font-size: 13px; font-weight: 600; transition: all var(--tr); font-family: var(--font); white-space: nowrap; }
        .btn-primary { background: #5E6BFF; color: #fff; box-shadow: 0 4px 14px rgba(94,107,255,.35); }
        .btn-primary:hover { box-shadow: 0 4px 14px rgba(94,107,255,.35); }
        .btn-ghost { background: var(--surface); color: var(--ink2); border: 1px solid var(--edge); }
        .btn-ghost:hover { background: var(--accent-bg); color: var(--accent); }
        .btn-green { background: linear-gradient(135deg,#10b981,#059669); color: #fff; box-shadow: 0 4px 14px rgba(16,185,129,.32); }
        .btn:disabled { opacity: .4; cursor: not-allowed; transform: none !important; }
        .btn-sm { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: var(--r); border: none; cursor: pointer; font-size: 12px; font-weight: 600; transition: all var(--tr); font-family: var(--font); }

        .card { background: var(--surface); border-radius: var(--r); border: 1px solid var(--edge); box-shadow: var(--sh); }
        .display { font-family: var(--font); }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .7; } }
        .spinner { animation: spin 1s linear infinite; }
        .fade-up { opacity: 0; animation: fadeUp .35s cubic-bezier(.4,0,.2,1) forwards; }
        .pulse { animation: pulse 1.5s ease-in-out infinite; }

        .modal-overlay { position: fixed; inset: 0; background: rgba(13,12,29,.55); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(4px); }
        .modal-box { background: var(--surface); border-radius: var(--r); width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(13,12,29,.25); animation: fadeUp .3s cubic-bezier(.4,0,.2,1); }
        .modal-body { padding: 28px 32px; }
        .modal-footer { padding: 0 32px 28px; }

        .alert { padding: 12px 16px; border-radius: var(--r); display: flex; align-items: flex-start; gap: 10px; font-size: 13px; margin-bottom: 20px; }
        .alert-warning { background: rgba(245,158,11,.1); border: 1px solid rgba(245,158,11,.3); color: #92400e; }
        .alert-error { background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.3); color: #991b1b; }
        .alert-info { background: rgba(94,107,255,.1); border: 1px solid rgba(94,107,255,.3); color: #3730a3; }

        .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }

        .q-card { background: var(--surface); border-radius: var(--r); border: 1px solid var(--edge); margin-bottom: 20px; overflow: hidden; }
        .q-card-header { padding: 16px 20px; border-bottom: 1px solid var(--edge); display: flex; justify-content: space-between; align-items: center; }
        .q-card-body { padding: 20px; }

        .radio-option { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: var(--r); border: 1.5px solid var(--edge); margin-bottom: 8px; cursor: pointer; transition: all var(--tr); font-size: 13.5px; font-weight: 500; color: var(--ink); }
        .radio-option:hover { border-color: rgba(94,107,255,.4); background: var(--accent-bg); }
        .radio-option.selected { border-color: var(--accent); background: rgba(94,107,255,.07); color: var(--accent); }
        .radio-dot { width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--edge); display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all var(--tr); }
        .radio-option.selected .radio-dot { border-color: var(--accent); background: var(--accent); }
        .radio-dot-check { width: 8px; height: 8px; border-radius: 50%; background: white; }

        .text-input { width: 100%; padding: 10px 14px; border-radius: var(--r); border: 1.5px solid var(--edge); font-size: 13.5px; font-family: var(--body); color: var(--ink); background: var(--surface); outline: none; transition: all var(--tr); box-sizing: border-box; }
        .text-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(94,107,255,.1); }
        .text-input::placeholder { color: var(--ink3); }

        .textarea-input { width: 100%; padding: 10px 14px; border-radius: var(--r); border: 1.5px solid var(--edge); font-size: 13.5px; font-family: var(--body); color: var(--ink); background: var(--surface); outline: none; transition: all var(--tr); box-sizing: border-box; resize: vertical; }
        .textarea-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(94,107,255,.1); }

        .tag { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: var(--r); font-size: 11px; font-weight: 700; }
        .tag-blue { background: rgba(94,107,255,.1); color: var(--accent); }
        .tag-green { background: rgba(16,185,129,.1); color: var(--green); }
        .tag-amber { background: rgba(245,158,11,.1); color: var(--amber); }

        .progress-bar { height: 4px; background: var(--edge); border-radius: 7px; overflow: hidden; }
        .progress-fill { height: 100%; background: var(--green); border-radius: 7px; transition: width .5s cubic-bezier(.4,0,.2,1); }

        .avatar { width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: var(--font); font-weight: 800; font-size: 22px; color: white; }
      `}</style>

      {/*  RULES MODAL  */}
      {showRulesModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-body">
              {/* Header */}
              <div style={{ textAlign:"center", marginBottom: 24 }}>
                <div className="avatar" style={{ background:"#5E6BFF", margin:"0 auto 16px", boxShadow:"0 4px 14px rgba(94,107,255,.3)" }}>
                  <BookOutlined />
                </div>
                <h2 className="display" style={{ fontSize: 22, fontWeight: 800, color:"var(--accent)", marginBottom: 6 }}>Exam Instructions</h2>
                <p style={{ fontSize: 15, fontWeight: 700, color:"var(--ink)", marginBottom: 4 }}>{exam.title}</p>
                <p style={{ fontSize: 13, color:"var(--ink2)" }}>Subject: {exam.subject}</p>
              </div>

              {/* Warning alert */}
              <div className="alert alert-warning fade-up">
                <div style={{ flexShrink: 0, marginTop: 1 }}>{Icons.warning?.(16,"#f59e0b")}</div>
                <div>
                  <strong>Important Proctoring Rules</strong>
                  <ul style={{ margin:"8px 0 0 0", paddingLeft: 18 }}>
                    <li>Camera and microphone will remain active during the exam</li>
                    <li>Tab switching or window changes are not allowed</li>
                    <li>Right-click, copy, paste are disabled</li>
                    <li>Maximum {MAX_VIOLATIONS} violations allowed before auto-submit</li>
                    <li>Exam auto-submits when time expires</li>
                  </ul>
                </div>
              </div>

              {/* Stats */}
              <div className="stat-grid fade-up" style={{ animationDelay:".05s", marginBottom: 20 }}>
                {[
                  { label:"Duration", val: `${exam.durationMinutes} min`, color:"var(--accent)" },
                  { label:"Questions", val: exam.questions.length, color:"var(--green)" },
                  { label:"Total Marks", val: exam.totalMarks || exam.questions.length, color:"var(--amber)" },
                ].map((s, i) => (
                  <div key={i} className="card" style={{ padding:"14px", textAlign:"center" }}>
                    <div style={{ fontSize: 11, color:"var(--ink3)", fontWeight: 700, textTransform:"uppercase", letterSpacing:".05em", marginBottom: 4 }}>{s.label}</div>
                    <div className="display" style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.val}</div>
                  </div>
                ))}
              </div>

              {/* Special instructions */}
              {exam.instructions && (
                <div className="alert alert-info fade-up" style={{ animationDelay:".1s" }}>
                  <div style={{ flexShrink: 0, marginTop: 1 }}>{Icons.warning?.(16,"var(--accent)")}</div>
                  <div><strong>Special Instructions:</strong><br />{exam.instructions}</div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-primary" style={{ width:"100%", justifyContent:"center" }} onClick={startExam}>
                <CheckCircleOutlined /> I Understand  Start Exam
              </button>
            </div>
          </div>
        </div>
      )}

      {/*  EXAM INTERFACE  */}
      {!showRulesModal && (
        <div style={{
          minHeight:"100vh",
          background:"var(--bg)",
          userSelect: isLocked ?"none" :"auto",
          pointerEvents: isLocked ?"none" :"auto"
        }}>
          {/* Sticky Header */}
          <div style={{
            background:"linear-gradient(135deg,#0d0c1d,#1e1b4b)",
            padding:"14px 28px",
            borderBottom:"1px solid rgba(255,255,255,.1)",
            position:"sticky",
            top: 0,
            zIndex: 100,
            boxShadow:"0 4px 20px rgba(13,12,29,.3)"
          }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap: 12 }}>
              <div>
                <h2 className="display" style={{ fontSize: 17, fontWeight: 800, color:"#fff", marginBottom: 2 }}>{exam.title}</h2>
                <p style={{ fontSize: 12, color:"rgba(255,255,255,.55)" }}>Subject: {exam.subject} · Student: {studentInfo.name}</p>
              </div>
              <div style={{ display:"flex", gap: 24, alignItems:"center", flexWrap:"wrap" }}>
                {/* Answered */}
                <div style={{ textAlign:"center" }}>
                  <div className="display" style={{ fontSize: 18, fontWeight: 800, color:"var(--green)" }}>{answeredCount}/{totalQuestions}</div>
                  <div style={{ fontSize: 11, color:"rgba(255,255,255,.45)" }}>Answered</div>
                </div>
                {/* Violations */}
                <div style={{ textAlign:"center" }}>
                  <div className="display" style={{ fontSize: 18, fontWeight: 800, color: violationCount > 0 ?"var(--red)" :"var(--green)" }}>{violationCount}/{MAX_VIOLATIONS}</div>
                  <div style={{ fontSize: 11, color:"rgba(255,255,255,.45)" }}>Violations</div>
                </div>
                {/* Timer */}
                <div style={{ textAlign:"center" }}>
                  <div className="display" style={{ fontSize: 24, fontWeight: 800, color: getProgressColor(), fontFamily:"monospace" }}>{formatTime(timeLeft)}</div>
                  <div style={{ fontSize: 11, color:"rgba(255,255,255,.45)" }}>Time Left</div>
                </div>
              </div>
            </div>
            {/* Progress bar */}
            <div className="progress-bar" style={{ marginTop: 12 }}>
              <div className="progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          {/* Lock overlay */}
          {isLocked && (
            <div style={{ margin:"16px 28px" }}>
              <div className="alert alert-error fade-up">
                <div style={{ flexShrink: 0, marginTop: 1 }}>{Icons.warning?.(16,"var(--red)")}</div>
                <div>
                  <strong>Exam Temporarily Locked</strong><br />
                  Violation detected. Please wait 5 seconds... ({violationCount}/{MAX_VIOLATIONS} violations)
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div style={{ maxWidth: 900, margin:"0 auto", padding:"24px 28px", opacity: isLocked ? 0.5 : 1 }}>
            {exam.questions.map((question, index) => {
              const isAnswered = !!answers[index];
              return (
                <div key={question._id || index} className="q-card fade-up" style={{ animationDelay: `${index * .04}s`, borderLeft: isAnswered ?"4px solid var(--green)" :"4px solid var(--edge)" }}>
                  <div className="q-card-header">
                    <div style={{ display:"flex", alignItems:"center", gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color:"var(--ink)" }}>Q{index + 1}.</span>
                      <span style={{ fontSize: 13.5, color:"var(--ink)", fontWeight: 500, lineHeight: 1.4 }}>{question.questionText}</span>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap: 8, flexShrink: 0 }}>
                      {isAnswered && <span style={{ color:"var(--green)", display:"flex", alignItems:"center" }}>{Icons.check?.(14,"var(--green)")}</span>}
                      <span className="tag tag-blue">{question.marks || 1} marks</span>
                    </div>
                  </div>

                  <div className="q-card-body">
                    {/* MCQ */}
                    {question.type ==="mcq" && question.options && (
                      <div>
                        {question.options.map((option, optionIndex) => {
                          const isSelected = answers[index] === option;
                          return (
                            <div key={optionIndex} className={`radio-option ${isSelected ?"selected" :""}`} onClick={() => handleAnswerChange(index, option)}>
                              <div className="radio-dot">{isSelected && <div className="radio-dot-check" />}</div>
                              <span>{option}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Short answer */}
                    {question.type ==="short" && (
                      <input
                        type="text"
                        className="text-input"
                        placeholder="Enter your answer here..."
                        value={answers[index] ||""}
                        onChange={e => handleAnswerChange(index, e.target.value)}
                        disabled={isLocked}
                      />
                    )}

                    {/* Paragraph */}
                    {question.type ==="paragraph" && (
                      <div>
                        <textarea
                          className="textarea-input"
                          rows={6}
                          placeholder="Write your detailed answer here..."
                          value={answers[index] ||""}
                          onChange={e => handleAnswerChange(index, e.target.value)}
                          disabled={isLocked}
                          maxLength={1000}
                        />
                        <div style={{ textAlign:"right", fontSize: 11, color:"var(--ink3)", marginTop: 4 }}>
                          {(answers[index] ||"").length} / 1000
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Submit Section */}
            <div className="card fade-up" style={{ padding:"28px", textAlign:"center", animationDelay: `${exam.questions.length * .04}s` }}>
              <h3 className="display" style={{ fontSize: 18, fontWeight: 700, color:"var(--ink)", marginBottom: 8 }}>Ready to Submit?</h3>
              <p style={{ fontSize: 13, color:"var(--ink2)", marginBottom: 16 }}>
                You have answered {answeredCount} out of {totalQuestions} questions.
                {answeredCount < totalQuestions && ` ${totalQuestions - answeredCount} questions remaining.`}
              </p>
              <button
                className="btn btn-primary"
                onClick={() => handleSubmit(false)}
                disabled={isLocked || isSubmitting}
                style={{ minWidth: 200, justifyContent:"center" }}
              >
                {isSubmitting ? (
                  <div style={{ width: 14, height: 14, borderRadius:"50%", border:"2px solid rgba(255,255,255,.4)", borderTopColor:"white" }} className="spinner" />
                ) : (
                  <FileTextOutlined />
                )}
                {isSubmitting ?"Submitting..." :"Submit Exam"}
              </button>
            </div>
          </div>

          {/* Video Proctoring Feed */}
          {isProctoring && (
            <div style={{
              position:"fixed",
              top: 80,
              right: 20,
              width: 180,
              height: 135,
              borderRadius:"var(--r)",
              overflow:"hidden",
              boxShadow:"0 4px 20px rgba(0,0,0,.3)",
              zIndex: 1000,
              border:"2px solid var(--accent)"
            }}>
              <video ref={videoRef} autoPlay muted style={{ width:"100%", height:"100%", objectFit:"cover" }} />
              <div style={{
                position:"absolute", bottom: 4, left: 4, background:"rgba(0,0,0,.7)",
                color:"white", padding:"2px 6px", borderRadius: 4, fontSize: 9,
                fontWeight: 700, display:"flex", alignItems:"center", gap: 4
              }}>
                <VideoCameraOutlined /> <EyeOutlined /> Proctoring
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
