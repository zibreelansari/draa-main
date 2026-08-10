import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { Spin } from 'antd';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Home,
  RefreshCw,
  Clock,
  CalendarDays,
  Target,
  Award,
  TrendingUp,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  BookOpen,
  User,
  Lightbulb,
  ChevronDown,
} from 'lucide-react';
import StudentSidebar from './StudentSidebar';
import StudentHeader from './StudentTopbr';
import { useStudentAuthGuard } from '../../utils/global_auth';
import uri from '../../url';
import usePageTitle from '../../hooks/usePageTitle';
import './TestResults.css';

/* ───────────────────────── Types ───────────────────────── */
interface TestResultsData {
  attemptId: string;
  testSeries: { id: string; title: string; duration: number; totalMarks: number };
  student?: { name?: string; email?: string };
  performance: {
    totalScore: number;
    maxScore: number;
    percentage: number;
    correctAnswers: number;
    incorrectAnswers: number;
    unanswered: number;
    totalQuestions: number;
    timeTaken: number;
    rank: number;
    totalAttempts: number;
  };
  timing: { startTime: string; endTime: string; duration: number };
  grade: { grade: string; description: string };
  questionAnalysis: Array<{
    questionNumber: number;
    questionText: string;
    options: Array<{ text: string; isCorrect: boolean; selected: boolean }>;
    userAnswer: number | null;
    correctAnswer: number;
    isCorrect: boolean;
    marks: number;
    marksObtained: number;
    explanation?: string;
    difficulty?: string;
    subject?: string;
    topic?: string;
  }>;
  submittedAt: string;
}

type StatusFilter = 'all' | 'correct' | 'incorrect' | 'unanswered';

/* ──────────────────────── Helpers ──────────────────────── */
const formatTime = (seconds: number) => {
  if (!seconds || seconds < 0) return '0s';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${secs}s`;
};

const formatDateTime = (iso?: string) => {
  if (!iso) return 'N/A';
  try {
    return new Date(iso).toLocaleString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'N/A';
  }
};

const getRankSuffix = (rank: number) => {
  if (!rank || rank < 1) return '—';
  const lastDigit = rank % 10;
  const lastTwo = rank % 100;
  if (lastTwo >= 11 && lastTwo <= 13) return `${rank}th`;
  if (lastDigit === 1) return `${rank}st`;
  if (lastDigit === 2) return `${rank}nd`;
  if (lastDigit === 3) return `${rank}rd`;
  return `${rank}th`;
};

const gradeInfo = (pct: number) => {
  if (pct >= 90) return { tag: 'Outstanding', color: '#7c3aed' };
  if (pct >= 80) return { tag: 'Excellent',   color: '#10b981' };
  if (pct >= 70) return { tag: 'Great job',   color: '#3b82f6' };
  if (pct >= 60) return { tag: 'Good effort', color: '#f59e0b' };
  if (pct >= 50) return { tag: 'Keep going',  color: '#f97316' };
  return                    { tag: 'Need work',  color: '#ef4444' };
};

/* ───────────────── Subject Breakdown ─────────────────── */
type SubjectStat = { name: string; total: number; correct: number; pct: number; tone: 'success' | 'danger' | 'warning' };

const PALETTE = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#84cc16', '#f43f5e'];

const computeSubjectBreakdown = (questions: TestResultsData['questionAnalysis']): SubjectStat[] => {
  const map = new Map<string, { total: number; correct: number }>();
  for (const q of questions) {
    const key = (q.subject || 'General').trim();
    const cur = map.get(key) || { total: 0, correct: 0 };
    cur.total += 1;
    if (q.isCorrect) cur.correct += 1;
    map.set(key, cur);
  }
  const list: SubjectStat[] = [];
  for (const [name, { total, correct }] of map.entries()) {
    const pct = total ? Math.round((correct / total) * 100) : 0;
    const tone = pct >= 75 ? 'success' : pct >= 50 ? 'warning' : 'danger';
    list.push({ name, total, correct, pct, tone });
  }
  return list.sort((a, b) => b.total - a.total);
};

/* ────────────────── Score Ring (SVG) ──────────────────── */
const ScoreRing: React.FC<{ pct: number; size?: number }> = ({ pct, size = 168 }) => {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (pct / 100) * circ;
  const grade = gradeInfo(pct);

  return (
    <div className="tr-ring-wrap" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="tr-ring-track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
        />
        <circle
          className="tr-ring-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={grade.color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="tr-ring-center">
        <div className="tr-ring-pct">
          {Math.round(pct)}
          <span className="tr-ring-pct-suffix">%</span>
        </div>
        <div className="tr-ring-grade">{grade.tag}</div>
      </div>
    </div>
  );
};

/* ════════════════════════ Component ════════════════════ */
export default function TestResults() {
  usePageTitle('Test Results | Draa');
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  useStudentAuthGuard();

  const [loginUser, setLoginUser] = useState<any>({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [results, setResults] = useState<TestResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* question panel state */
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [activeQNum, setActiveQNum] = useState<number | null>(null);
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raw = localStorage.getItem('edudocs');
    if (raw) {
      try { setLoginUser(JSON.parse(raw)); } catch { /* ignore */ }
    }
  }, []);

  const loadResults = async () => {
    try {
      setLoading(true);
      const user = localStorage.getItem('edudocs');
      const token = JSON.parse(user || '{}')?.token;

      const response = await fetch(
        `${uri}/student/test-series/attempt/${attemptId}/results`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data.success && data.results) {
        setResults(data.results);
        setError(null);
      } else {
        throw new Error(data.message || 'Failed to load results');
      }
    } catch (err: any) {
      console.error('Error loading results:', err);
      setError(err.message || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location.state?.results) {
      setResults(location.state.results);
      setLoading(false);
    } else if (attemptId) {
      loadResults();
    } else {
      setError('No attempt ID provided');
      setLoading(false);
    }
  }, [attemptId, location.state]);

  /* derived data */
  const filteredQuestions = useMemo(() => {
    if (!results) return [];
    switch (statusFilter) {
      case 'correct':    return results.questionAnalysis.filter(q => q.isCorrect);
      case 'incorrect':  return results.questionAnalysis.filter(q => !q.isCorrect && q.userAnswer !== null);
      case 'unanswered': return results.questionAnalysis.filter(q => q.userAnswer === null);
      default:           return results.questionAnalysis;
    }
  }, [results, statusFilter]);

  const activeQuestion = useMemo(() => {
    if (!results) return null;
    if (activeQNum === null) return filteredQuestions[0] || null;
    return results.questionAnalysis.find(q => q.questionNumber === activeQNum) || filteredQuestions[0] || null;
  }, [results, activeQNum, filteredQuestions]);

  /* scroll active chip into view */
  useEffect(() => {
    if (!activeQuestion || !railRef.current) return;
    const el = railRef.current.querySelector<HTMLButtonElement>(`[data-qnum="${activeQuestion.questionNumber}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  }, [activeQuestion?.questionNumber]);

  const subjectBreakdown = useMemo(
    () => (results ? computeSubjectBreakdown(results.questionAnalysis) : []),
    [results]
  );

  /* ─────────── Render guards ─────────── */
  if (loading) {
    return (
      <div className="dashboard-layout" style={{ display: 'flex', height: '100vh', background: 'var(--bg-body)' }}>
        <StudentSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} loginUser={loginUser} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
          <StudentHeader loginUser={loginUser} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentPage="test-results" />
          <main style={{ flex: 1, overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Spin size="large" />
          </main>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="dashboard-layout" style={{ display: 'flex', height: '100vh', background: 'var(--bg-body)' }}>
        <StudentSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} loginUser={loginUser} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
          <StudentHeader loginUser={loginUser} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentPage="test-results" />
          <main style={{ flex: 1, overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
            <p style={{ color: '#ef4444', fontWeight: 600 }}>{error || 'The results could not be loaded.'}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="tr-btn" onClick={loadResults}><RefreshCw size={14} /> Try again</button>
              <button className="tr-btn tr-btn-primary" onClick={() => navigate('/student-dashboard')}><Home size={14} /> Dashboard</button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const perf = results.performance;
  const pct = perf.percentage || 0;
  const gradeMeta = gradeInfo(pct);
  const betterThan = perf.totalAttempts > 0
    ? Math.round(((perf.totalAttempts - perf.rank) / perf.totalAttempts) * 100)
    : 0;
  const accuracy = perf.totalQuestions
    ? Math.round((perf.correctAnswers / perf.totalQuestions) * 100)
    : 0;

  const goPrev = () => {
    if (!activeQuestion) return;
    const idx = results.questionAnalysis.findIndex(q => q.questionNumber === activeQuestion.questionNumber);
    if (idx > 0) setActiveQNum(results.questionAnalysis[idx - 1].questionNumber);
  };
  const goNext = () => {
    if (!activeQuestion) return;
    const idx = results.questionAnalysis.findIndex(q => q.questionNumber === activeQuestion.questionNumber);
    if (idx < results.questionAnalysis.length - 1) setActiveQNum(results.questionAnalysis[idx + 1].questionNumber);
  };

  const questionStatus = (q: TestResultsData['questionAnalysis'][number]): 'correct' | 'incorrect' | 'unanswered' =>
    q.isCorrect ? 'correct' : q.userAnswer === null ? 'unanswered' : 'incorrect';

  const optionLetter = (i: number) => String.fromCharCode(65 + i);

  /* ─────────────────── Render ─────────────────── */
  return (
    <div className="dashboard-layout" style={{ display: 'flex', height: '100vh', background: 'var(--bg-body)' }}>
      <StudentSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} loginUser={loginUser} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <StudentHeader loginUser={loginUser} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentPage="test-results" />

        <main style={{ flex: 1, overflowY: 'auto' }}>
          <div className="tr-v2" style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 48px' }}>
            {/* breadcrumb */}
            <nav className="tr-crumb">
              <Link to="/student-dashboard"><Home size={13} /> Dashboard</Link>
              <ChevronRight size={13} className="tr-crumb-sep" />
              <span>Test analysis</span>
            </nav>

            {/* ═══════════ HERO ═══════════ */}
            <section className="tr-surface tr-hero">
              <div className="tr-hero-left">
                <span className="tr-hero-eyebrow">
                  <Trophy size={12} /> {gradeMeta.tag} performance
                </span>
                <h1 className="tr-hero-title">{results.testSeries?.title || 'Test Series'}</h1>
                <p className="tr-hero-subtitle">
                  <span>Submitted {formatDateTime(results.timing?.endTime)}</span>
                  <span className="tr-dot" />
                  <span>Grade {results.grade?.grade || '—'}</span>
                  <span className="tr-dot" />
                  <span>Rank {getRankSuffix(perf.rank)} of {perf.totalAttempts}</span>
                </p>

                <div className="tr-hero-meta">
                  <div className="tr-hero-meta-item">
                    <div className="tr-meta-label">Score</div>
                    <div className="tr-meta-value">
                      <Target size={14} />
                      {perf.totalScore}
                      <span style={{ color: 'var(--tr-fg-3)', fontWeight: 600 }}>/ {perf.maxScore}</span>
                    </div>
                  </div>
                  <div className="tr-hero-meta-item">
                    <div className="tr-meta-label">Accuracy</div>
                    <div className="tr-meta-value">
                      <TrendingUp size={14} />
                      {accuracy}%
                    </div>
                  </div>
                  <div className="tr-hero-meta-item">
                    <div className="tr-meta-label">Time taken</div>
                    <div className="tr-meta-value">
                      <Clock size={14} />
                      {formatTime(perf.timeTaken)}
                    </div>
                  </div>
                  <div className="tr-hero-meta-item">
                    <div className="tr-meta-label">Better than</div>
                    <div className="tr-meta-value">
                      <Award size={14} />
                      {betterThan}%
                    </div>
                  </div>
                </div>

                <div className="tr-hero-actions">
                  <button className="tr-btn tr-btn-primary" onClick={() => navigate('/student-dashboard')}>
                    <Home size={14} /> Dashboard
                  </button>
                  <button className="tr-btn" onClick={() => {
                    const el = document.getElementById('tr-solution-anchor');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}>
                    <ChevronDown size={14} /> View solution
                  </button>
                </div>
              </div>

              <div className="tr-hero-right">
                <ScoreRing pct={pct} />
              </div>
            </section>

            {/* ═══════════ STATS GRID ═══════════ */}
            <section className="tr-surface tr-stats">
              <div className="tr-stat tr-success">
                <div className="tr-stat-top">
                  <span className="tr-stat-label">Correct</span>
                  <span className="tr-stat-icon"><CheckCircle2 /></span>
                </div>
                <div className="tr-stat-value">
                  {perf.correctAnswers}
                  <span className="tr-stat-suffix">/ {perf.totalQuestions}</span>
                </div>
                <div className="tr-stat-trend">+{perf.correctAnswers * 4} marks</div>
              </div>

              <div className="tr-stat tr-danger">
                <div className="tr-stat-top">
                  <span className="tr-stat-label">Wrong</span>
                  <span className="tr-stat-icon"><XCircle /></span>
                </div>
                <div className="tr-stat-value">{perf.incorrectAnswers}</div>
                <div className="tr-stat-trend">−{perf.incorrectAnswers} mark penalty</div>
              </div>

              <div className="tr-stat tr-warning">
                <div className="tr-stat-top">
                  <span className="tr-stat-label">Skipped</span>
                  <span className="tr-stat-icon"><HelpCircle /></span>
                </div>
                <div className="tr-stat-value">{perf.unanswered}</div>
                <div className="tr-stat-trend">No marks awarded</div>
              </div>

              <div className="tr-stat tr-accent">
                <div className="tr-stat-top">
                  <span className="tr-stat-label">Rank</span>
                  <span className="tr-stat-icon"><Award /></span>
                </div>
                <div className="tr-stat-value">{getRankSuffix(perf.rank)}</div>
                <div className="tr-stat-trend">of {perf.totalAttempts} attempts</div>
              </div>

              <div className="tr-stat">
                <div className="tr-stat-top">
                  <span className="tr-stat-label">Grade</span>
                  <span className="tr-stat-icon"><Trophy /></span>
                </div>
                <div className="tr-stat-value">{results.grade?.grade || '—'}</div>
                <div className="tr-stat-trend">{results.grade?.description || ''}</div>
              </div>
            </section>

            {/* ═══════════ BREAKDOWN + INFO ═══════════ */}
            <section className="tr-row-2">
              {/* subject breakdown */}
              <div className="tr-surface tr-section">
                <div className="tr-section-title">
                  <h3>Subject breakdown</h3>
                  <span className="tr-section-sub">{subjectBreakdown.length} subjects</span>
                </div>
                {subjectBreakdown.length === 0 ? (
                  <div className="tr-empty-mini">No subject data available</div>
                ) : (
                  <div className="tr-subj-list">
                    {subjectBreakdown.map((s, i) => (
                      <div className="tr-subj-row" key={s.name}>
                        <div className="tr-subj-name" title={s.name}>
                          <span style={{
                            display: 'inline-block', width: 8, height: 8, borderRadius: 999,
                            background: PALETTE[i % PALETTE.length], marginRight: 8, verticalAlign: 'middle'
                          }} />
                          {s.name}
                        </div>
                        <div className="tr-subj-bar">
                          <div
                            className={`tr-subj-bar-fill ${s.tone}`}
                            style={{ width: `${s.pct}%` }}
                          />
                        </div>
                        <div className="tr-subj-pct">{s.pct}% <span style={{ color: 'var(--tr-fg-3)', fontWeight: 500 }}>· {s.correct}/{s.total}</span></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* test info */}
              <div className="tr-surface" style={{ overflow: 'hidden' }}>
                <div className="tr-section">
                  <div className="tr-section-title">
                    <h3>Test information</h3>
                  </div>
                </div>
                <div className="tr-info-strip">
                  <div className="tr-info-cell">
                    <div className="tr-info-label">Duration</div>
                    <div className="tr-info-value"><Clock size={14} /> {results.testSeries?.duration || 0} min</div>
                  </div>
                  <div className="tr-info-cell">
                    <div className="tr-info-label">Total questions</div>
                    <div className="tr-info-value"><BookOpen size={14} /> {perf.totalQuestions}</div>
                  </div>
                  <div className="tr-info-cell">
                    <div className="tr-info-label">Started</div>
                    <div className="tr-info-value"><CalendarDays size={14} /> {formatDateTime(results.timing?.startTime)}</div>
                  </div>
                  <div className="tr-info-cell">
                    <div className="tr-info-label">Student</div>
                    <div className="tr-info-value"><User size={14} /> {results.student?.name || 'You'}</div>
                  </div>
                </div>
              </div>
            </section>

            {/* ═══════════ SOLUTION PANEL ═══════════ */}
            <section id="tr-solution-anchor" className="tr-surface tr-solution">
              <header className="tr-solution-head">
                <h3>
                  Solution review
                  <span className="tr-solution-count">{filteredQuestions.length}</span>
                </h3>
                <div className="tr-solution-filters" role="tablist">
                  <button
                    className={`tr-filter-pill ${statusFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('all')}
                  >
                    <span className="tr-filter-dot neutral" /> All
                  </button>
                  <button
                    className={`tr-filter-pill ${statusFilter === 'correct' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('correct')}
                  >
                    <span className="tr-filter-dot success" /> Correct
                  </button>
                  <button
                    className={`tr-filter-pill ${statusFilter === 'incorrect' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('incorrect')}
                  >
                    <span className="tr-filter-dot danger" /> Wrong
                  </button>
                  <button
                    className={`tr-filter-pill ${statusFilter === 'unanswered' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('unanswered')}
                  >
                    <span className="tr-filter-dot warning" /> Skipped
                  </button>
                </div>
              </header>

              <div className="tr-solution-body">
                {/* left rail */}
                <aside className="tr-q-rail" ref={railRef}>
                  <div className="tr-q-rail-label">Questions</div>
                  <div className="tr-q-chips">
                    {results.questionAnalysis.map((q) => {
                      const s = questionStatus(q);
                      const isActive = activeQuestion?.questionNumber === q.questionNumber;
                      return (
                        <button
                          key={q.questionNumber}
                          data-qnum={q.questionNumber}
                          className={`tr-q-chip ${s} ${isActive ? 'active' : ''}`}
                          onClick={() => setActiveQNum(q.questionNumber)}
                          title={`Q${q.questionNumber} · ${s}`}
                        >
                          {q.questionNumber}
                        </button>
                      );
                    })}
                  </div>
                </aside>

                {/* right pane */}
                <div className="tr-q-pane">
                  {!activeQuestion ? (
                    <div className="tr-solution-empty">
                      <div className="tr-solution-empty-icon">
                        <HelpCircle />
                      </div>
                      <h4>No questions in this view</h4>
                      <p>Try a different filter above.</p>
                    </div>
                  ) : (
                    <>
                      <div className="tr-q-pane-head">
                        <div className="tr-q-pane-title">
                          <span className="tr-q-pane-num">Q{activeQuestion.questionNumber}</span>
                          {(() => {
                            const s = questionStatus(activeQuestion);
                            const Icon = s === 'correct' ? CheckCircle2 : s === 'incorrect' ? XCircle : HelpCircle;
                            return (
                              <span className={`tr-q-pane-status ${s}`}>
                                <Icon />
                                {s === 'correct' ? 'Correct' : s === 'incorrect' ? 'Incorrect' : 'Skipped'}
                              </span>
                            );
                          })()}
                          <div className="tr-q-pane-tags">
                            {activeQuestion.subject && <span className="tr-q-tag">{activeQuestion.subject}</span>}
                            {activeQuestion.topic && <span className="tr-q-tag">{activeQuestion.topic}</span>}
                            {activeQuestion.difficulty && (
                              <span className={`tr-q-tag ${activeQuestion.difficulty}`}>{activeQuestion.difficulty}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <p className="tr-q-text">{activeQuestion.questionText}</p>

                      <div className="tr-options">
                        {activeQuestion.options.map((opt, i) => {
                          const isCorrect = opt.isCorrect;
                          const isSelected = opt.selected;
                          const isWrongPick = isSelected && !isCorrect;
                          const cls = isCorrect ? 'is-correct' : isWrongPick ? 'is-wrong-pick' : '';
                          return (
                            <div className={`tr-option ${cls}`} key={i}>
                              <span className="tr-option-letter">{optionLetter(i)}</span>
                              <span className="tr-option-text">{opt.text}</span>
                              {isCorrect && <span className="tr-option-tag correct">Correct</span>}
                              {isSelected && <span className="tr-option-tag your-answer">Your answer</span>}
                            </div>
                          );
                        })}
                      </div>

                      {activeQuestion.explanation && (
                        <div className="tr-explain">
                          <div className="tr-explain-icon"><Lightbulb /></div>
                          <div className="tr-explain-body">
                            <div className="tr-explain-title">Explanation</div>
                            <p className="tr-explain-text">{activeQuestion.explanation}</p>
                          </div>
                        </div>
                      )}

                      <div className="tr-q-summary">
                        <div className="tr-q-summary-cell">
                          <div className="tr-q-summary-label">Your answer</div>
                          <div className={`tr-q-summary-value ${
                            activeQuestion.userAnswer === null ? 'warning' :
                            activeQuestion.isCorrect ? 'success' : 'danger'
                          }`}>
                            {activeQuestion.userAnswer !== null ? optionLetter(activeQuestion.userAnswer) : 'Not attempted'}
                          </div>
                        </div>
                        <div className="tr-q-summary-cell">
                          <div className="tr-q-summary-label">Correct answer</div>
                          <div className="tr-q-summary-value success">{optionLetter(activeQuestion.correctAnswer)}</div>
                        </div>
                        <div className="tr-q-summary-cell">
                          <div className="tr-q-summary-label">Marks</div>
                          <div className={`tr-q-summary-value ${(activeQuestion.marksObtained || 0) > 0 ? 'success' : 'danger'}`}>
                            {(activeQuestion.marksObtained || 0) > 0 ? '+' : ''}{activeQuestion.marksObtained || 0}
                            <span style={{ color: 'var(--tr-fg-3)', fontWeight: 500 }}> / {activeQuestion.marks || 0}</span>
                          </div>
                        </div>
                      </div>

                      <div className="tr-q-nav">
                        <button
                          className="tr-btn"
                          onClick={goPrev}
                          disabled={results.questionAnalysis.findIndex(q => q.questionNumber === activeQuestion.questionNumber) === 0}
                        >
                          <ArrowLeft size={14} /> Previous
                        </button>
                        <button
                          className="tr-btn"
                          onClick={goNext}
                          disabled={results.questionAnalysis.findIndex(q => q.questionNumber === activeQuestion.questionNumber) === results.questionAnalysis.length - 1}
                        >
                          Next <ArrowRight size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
