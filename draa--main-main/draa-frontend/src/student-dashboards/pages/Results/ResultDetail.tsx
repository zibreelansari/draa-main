import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  Avatar,
  Divider,
  Stack,
  alpha,
  LinearProgress,
  CircularProgress,
  Tooltip,
  useTheme,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField as MuiTextField,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  EmojiEvents as TrophyIcon,
  Timer as TimeIcon,
  CheckCircle as CorrectIcon,
  Cancel as WrongIcon,
  Help as UnansweredIcon,
  KeyboardArrowDown as ExpandMoreIcon,
  KeyboardArrowUp as ExpandLessIcon,
  Home as HomeIcon,
  TrendingUp as RankIcon,
  MenuBook as SubjectIcon,
  Lightbulb as TopicIcon,
  Speed as ScoreIcon,
  RocketLaunch as RocketIcon,
  RestartAlt as RestartIcon,
  Timeline as ResultsIcon,
  AssignmentTurnedIn as ReportIcon,
  Flag as FlagIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  Cell
} from 'recharts';
import dayjs from 'dayjs';
import DashboardLayout from '../../layouts/DashboardLayout';
import uri from '../../../url';
import usePageTitle from '../../../hooks/usePageTitle';

// --- Types ---
interface TestResults {
  attemptId: string;
  testSeries: {
    id: string;
    title: string;
    duration: number;
    totalMarks: number;
    maxAttempts?: number;
  };
  student?: {
    name?: string;
    email?: string;
  };
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
  timing: {
    startTime: string;
    endTime: string;
    duration: number;
  };
  grade: {
    grade: string;
    description: string;
  };
  questionAnalysis: Array<{
    questionNumber: number;
    questionText: string;
    options: Array<{
      text: string;
      isCorrect: boolean;
      selected: boolean;
    }>;
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
  attemptNumber?: number;
  maxAttempts?: number;
  attemptsRemaining?: number;
}

// --- Localised keyframes (kept in-file to avoid touching global styles) ---
const HERO_KEYFRAMES = `
@keyframes hero-gradient-shift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes hero-float-a {
  0%, 100% { transform: translate(0,0) scale(1); }
  50%      { transform: translate(20px,-30px) scale(1.08); }
}
@keyframes hero-float-b {
  0%, 100% { transform: translate(0,0) scale(1); }
  50%      { transform: translate(-25px,20px) scale(1.05); }
}
@keyframes hero-pulse-ring {
  0%   { box-shadow: 0 0 0 0   rgba(236,72,153,0.55); }
  70%  { box-shadow: 0 0 0 14px rgba(236,72,153,0); }
  100% { box-shadow: 0 0 0 0   rgba(236,72,153,0); }
}
@keyframes trophy-spin {
  to { transform: rotate(360deg); }
}
`;

/**
 * Animates a numeric value from 0 → target over `duration` ms with ease-out.
 * Used for the hero score and quick-stat counters.
 */
function useCountUp(target: number, duration = 1200): number {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const to = Number.isFinite(target) ? target : 0;

    const step = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(from + (to - from) * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return value;
}

const ResultDetailV2: React.FC = () => {
  usePageTitle('Test Result | Draa');
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const user = JSON.parse(localStorage.getItem('edudocs') || '{}');

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return '0s';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const [results, setResults] = useState<TestResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'correct' | 'wrong' | 'unanswered'>('all');
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  // --- Report Issue state ---
  const [reportDialog, setReportDialog] = useState<{
    open: boolean;
    questionId: string;
    questionNumber: number;
    questionText: string;
  } | null>(null);
  const [issueType, setIssueType] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportedQuestions, setReportedQuestions] = useState<Set<string>>(new Set());
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const ISSUE_TYPES = [
    { value: 'wrong_answer', label: 'Wrong Answer / Correct Key Incorrect' },
    { value: 'wrong_explanation', label: 'Wrong / Misleading Explanation' },
    { value: 'typo_in_question', label: 'Typo / Error in Question' },
    { value: 'typo_in_options', label: 'Typo / Error in Options' },
    { value: 'image_not_loading', label: 'Image Not Loading' },
    { value: 'other', label: 'Other Issue' },
  ];

  const openReportDialog = (q: { questionId: string; questionNumber: number; questionText: string }) => {
    setIssueType('');
    setIssueDescription('');
    setReportDialog({ open: true, ...q });
  };

  const handleSubmitReport = async () => {
    if (!issueType || !results || !reportDialog) return;
    setReportSubmitting(true);
    try {
      const userRaw = localStorage.getItem('edudocs');
      const token = JSON.parse(userRaw || '{}')?.token;
      const res = await fetch(`${uri}/student/test-series/attempt/report-issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          attemptId: results.attemptId,
          questionId: reportDialog.questionId,
          questionNumber: reportDialog.questionNumber,
          questionText: reportDialog.questionText,
          testSeriesId: results.testSeries.id,
          testSeriesTitle: results.testSeries.title,
          issueType,
          description: issueDescription,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReportedQuestions(prev => new Set(prev).add(reportDialog.questionId));
        setSnackbar({ open: true, message: 'Issue reported! Our team will review it soon.', severity: 'success' });
        setReportDialog(null);
      } else {
        setSnackbar({ open: true, message: data.message || 'Failed to report issue.', severity: 'error' });
      }
    } catch {
      setSnackbar({ open: true, message: 'Network error. Please try again.', severity: 'error' });
    } finally {
      setReportSubmitting(false);
    }
  };

  // Count-up targets (hoisted above early returns so hook order is stable).
  // NOTE: results?.performance may be undefined here, so we use optional chaining + nullish
  // coalescing for the hook arguments. The `performance` const is declared AFTER the early
  // returns below so TypeScript can narrow it to a non-undefined type in the JSX.
  const animatedScore = useCountUp(results?.performance?.percentage ?? 0);
  const animatedTime = useCountUp(results?.performance?.timeTaken ?? 0);
  const animatedAccuracy = useCountUp(
    Math.round(((results?.performance?.correctAnswers ?? 0) / Math.max(1, (results?.performance?.totalQuestions ?? 0) - (results?.performance?.unanswered ?? 0))) * 100) || 0
  );
  const animatedQuestions = useCountUp(results?.performance?.totalQuestions ?? 0);

  // Load results
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId, location.state]);

  const loadResults = async () => {
    try {
      setLoading(true);
      const userRaw = localStorage.getItem("edudocs");
      const token = JSON.parse(userRaw || "{}")?.token;

      const response = await fetch(`${uri}/student/test-series/attempt/${attemptId}/results`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch results');
      const data = await response.json();

      if (data.success) {
        setResults(data.results);
      } else {
        throw new Error(data.message || 'Results not found');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Retake: always redirect to test series list ---
  const maxAttempts = results?.maxAttempts ?? results?.testSeries?.maxAttempts ?? 3;
  const attemptNumber = results?.attemptNumber ?? 1;
  const attemptsRemaining = typeof results?.attemptsRemaining === 'number'
    ? results.attemptsRemaining
    : Math.max(0, maxAttempts - attemptNumber);
  const canRetake = attemptsRemaining > 0;

  const handleRetakeRedirect = () => {
    const studentId = user?.id || user?._id;
    const subject = results?.questionAnalysis[0]?.subject || '';
    const topic = results?.questionAnalysis[0]?.topic || '';
    const title = results?.testSeries?.title || '';
    navigate(`/v2/student/my-test-series/${studentId}?subject=${encodeURIComponent(subject)}&topic=${encodeURIComponent(topic)}&title=${encodeURIComponent(title)}`);
  };

  const filteredQuestions = useMemo(() => {
    if (!results) return [];
    if (filter === 'all') return results.questionAnalysis;
    if (filter === 'correct') return results.questionAnalysis.filter(q => q.isCorrect);
    if (filter === 'wrong') return results.questionAnalysis.filter(q => !q.isCorrect && q.userAnswer !== null);
    if (filter === 'unanswered') return results.questionAnalysis.filter(q => q.userAnswer === null);
    return results.questionAnalysis;
  }, [results, filter]);

  const performanceChartData = useMemo(() => {
    if (!results?.questionAnalysis?.length) return [];

    const subjectMap = new Map<string, { subject: string; correct: number; wrong: number; skipped: number }>();

    results.questionAnalysis.forEach((question) => {
      const subject = (question.subject || 'General').trim() || 'General';
      const entry = subjectMap.get(subject) || { subject, correct: 0, wrong: 0, skipped: 0 };

      if (question.userAnswer === null) {
        entry.skipped += 1;
      } else if (question.isCorrect) {
        entry.correct += 1;
      } else {
        entry.wrong += 1;
      }

      subjectMap.set(subject, entry);
    });

    return Array.from(subjectMap.values())
      .map((item) => ({
        ...item,
        total: item.correct + item.wrong + item.skipped
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [results]);

  if (loading) return (
    <DashboardLayout>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress size={60} thickness={4} sx={{ color: 'primary.main' }} />
      </Box>
    </DashboardLayout>
  );

  if (error || !results) return (
    <DashboardLayout>
      <Container maxWidth="md">
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4 }}>
          <Typography variant="h5" color="error" gutterBottom>Error</Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>{error || 'Unable to load results'}</Typography>
          <Button variant="contained" onClick={() => navigate('/v2/student/exam-results')}>Back to Results</Button>
        </Paper>
      </Container>
    </DashboardLayout>
  );

  // Now that early returns have run, `results` is guaranteed non-null.
  // Declaring `performance` here lets TypeScript narrow its type to the full
  // non-optional shape, eliminating all "possibly undefined" errors in the JSX.
  const performance = results.performance;

  return (
    <DashboardLayout>
      <style>{HERO_KEYFRAMES}</style>
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
        <Box component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

          {/* ============== HEADER ROW ============== */}
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
              <BackIcon color="primary" />
            </IconButton>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: 1.2, color: 'primary.main' }}>
                Test Analysis
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
                {results.testSeries.title}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<RocketIcon />}
              onClick={handleRetakeRedirect}
              sx={{
                borderRadius: 999,
                px: 2.5,
                py: 1.1,
                fontWeight: 800,
                textTransform: 'none',
                color: 'white',
                background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 60%, #6366f1 100%)',
                boxShadow: '0 12px 30px rgba(139,92,246,0.45)',
                animation: 'hero-pulse-ring 2.4s ease-out infinite',
                '&:hover': {
                  background: 'linear-gradient(135deg, #db2777 0%, #7c3aed 60%, #4f46e5 100%)',
                },
              }}
            >
              Retake Test
            </Button>
          </Box>

          {/* ============== HERO BANNER ============== */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            sx={{
              position: 'relative',
              borderRadius: 5,
              overflow: 'hidden',
              mb: 4,
              px: { xs: 3, md: 5 },
              py: { xs: 3.5, md: 4 },
              color: 'white',
              background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              boxShadow: '0 24px 60px rgba(99, 102, 241, 0.2)',
            }}
          >
            {/* floating blobs */}
            <Box sx={{
              position: 'absolute', top: -60, right: -40, width: 280, height: 280,
              borderRadius: '50%', background: 'rgba(99, 102, 241, 0.25)', filter: 'blur(60px)',
              animation: 'hero-float-a 9s ease-in-out infinite', pointerEvents: 'none'
            }} />
            <Box sx={{
              position: 'absolute', bottom: -80, left: -20, width: 220, height: 220,
              borderRadius: '50%', background: 'rgba(236, 72, 153, 0.15)', filter: 'blur(50px)',
              animation: 'hero-float-b 11s ease-in-out infinite', pointerEvents: 'none'
            }} />
            <Box sx={{
              position: 'absolute', top: 20, right: 40, width: 60, height: 60,
              borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
              pointerEvents: 'none'
            }} />
            <Box sx={{
              position: 'absolute', bottom: 40, right: 120, width: 30, height: 30,
              borderRadius: '50%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
              pointerEvents: 'none'
            }} />

            <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} justifyContent="space-between" spacing={3} sx={{ position: 'relative' }}>
              <Box sx={{ flexGrow: 1 }}>
                <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                  {/* <Chip
                    label={`Attempt ${attemptNumber} of ${maxAttempts}`}
                    sx={{
                      fontWeight: 800,
                      color: 'white',
                      bgcolor: canRetake ? 'rgba(255,255,255,0.22)' : 'rgba(239,68,68,0.85)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.3)',
                    }}
                  /> */}
                  <Chip
                    label={`Grade: ${results.grade.grade}`}
                    sx={{
                      fontWeight: 800,
                      color: '#1e293b',
                      bgcolor: '#fde68a',
                      border: '1px solid rgba(255,255,255,0.4)',
                    }}
                  />
                  <Chip
                    label={dayjs(results.timing.startTime).format('MMM DD, YYYY · hh:mm A')}
                    sx={{
                      fontWeight: 700,
                      color: 'white',
                      bgcolor: 'rgba(255,255,255,0.18)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      backdropFilter: 'blur(8px)',
                    }}
                  />
                </Stack>
                <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: -0.5, mb: 0.5, color: 'white !important' }}>
                  {results.grade.description}!
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500, maxWidth: 560, color: 'white !important' }}>
                  You scored <b>{Math.round(performance.percentage)}%</b> on this test. Want to beat it?
                </Typography>
              </Box>

              <Stack direction="row" spacing={1.5} sx={{ flexShrink: 0 }}>

              </Stack>
            </Stack>
          </Box>

          {/* ============== SCORE + STATS ============== */}
          <Grid container spacing={3}>
            {/* Main Score Card */}
            <Grid item xs={12} lg={4}>
              <Card sx={{
                height: '100%',
                borderRadius: 6,
                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 30px 60px rgba(99,102,241,0.2)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
              }}>
                {/* dot pattern overlay */}
                <Box sx={{
                  position: 'absolute', inset: 0,
                  backgroundImage: 'radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)',
                  backgroundSize: '18px 18px', opacity: 0.5, pointerEvents: 'none',
                }} />
                {/* rotating trophy watermark */}
                <Box sx={{
                  position: 'absolute', top: -30, right: -30, opacity: 0.18,
                  animation: 'trophy-spin 22s linear infinite',
                }}>
                  <TrophyIcon sx={{ fontSize: 220 }} />
                </Box>

                <CardContent sx={{ p: 4, textAlign: 'center', position: 'relative', zIndex: 1 }}>
                  <Typography variant="subtitle1" sx={{ opacity: 0.8, fontWeight: 700, mb: 3, letterSpacing: 0.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.8) !important' }}>
                    Final Score
                  </Typography>
                  <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
                    {/* Track ring (always full circle, low-opacity white) */}
                    <CircularProgress
                      variant="determinate"
                      value={100}
                      size={170}
                      thickness={4}
                      sx={{
                        color: 'rgba(255,255,255,0.22) !important',
                        position: 'absolute',
                        [`& .MuiCircularProgress-circle`]: { strokeLinecap: 'round' },
                      }}
                    />
                    {/* Progress ring (the actual score) */}
                    <CircularProgress
                      variant="determinate"
                      value={performance.percentage}
                      size={170}
                      thickness={4}
                      sx={{
                        color: 'white !important',
                        [`& .MuiCircularProgress-circle`]: { strokeLinecap: 'round' },
                      }}
                    />
                    <Box sx={{
                      position: 'absolute', top: 0, left: 0, bottom: 0, right: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
                      textAlign: 'center',
                    }}>
                      <Typography variant="h2" sx={{ fontWeight: 900, lineHeight: 1, color: 'white !important' }}>
                        {Math.round(animatedScore)}%
                      </Typography>
                      <Typography variant="caption" sx={{ mt: 0.5, fontWeight: 700, color: 'rgba(255,255,255,0.8) !important' }}>
                        {performance.totalScore} / {performance.maxScore}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={`Grade ${results.grade.grade} — ${results.grade.description}`}
                    sx={{
                      fontWeight: 800,
                      color: '#4338ca',
                      bgcolor: '#fde68a',
                      borderRadius: 999,
                      px: 1,
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Quick Stats Grid + Analytics */}
            <Grid item xs={12} lg={8}>
              <Grid container spacing={2}>
                {[
                  { label: 'Rank', value: `#${performance.rank || 0}`, icon: <RankIcon />, color: '#f59e0b', numeric: false },
                  { label: 'Time Taken', value: formatDuration(Math.round(animatedTime)), icon: <TimeIcon />, color: '#10b981', numeric: false },
                  { label: 'Accuracy', value: `${Math.round(animatedAccuracy)}%`, icon: <ScoreIcon />, color: '#3b82f6', numeric: false },
                  { label: 'Questions', value: `${Math.round(animatedQuestions)}`, icon: <SubjectIcon />, color: '#6366f1', numeric: false },
                ].map((stat, i) => (
                  <Grid item xs={6} md={3} key={i}>
                    <Box
                      component={motion.div}
                      whileHover={{ y: -4 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                      sx={{
                        position: 'relative',
                        overflow: 'hidden',
                        borderRadius: 4,
                        bgcolor: 'background.paper',
                        boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
                        border: '1px solid',
                        borderColor: 'divider',
                        height: '100%',
                      }}
                    >
                      {/* colored top stripe */}
                      <Box sx={{
                        height: 4,
                        background: `linear-gradient(90deg, ${stat.color} 0%, ${alpha(stat.color, 0.35)} 100%)`,
                      }} />
                      <CardContent sx={{ p: 2, textAlign: 'center' }}>
                        <Avatar sx={{ bgcolor: alpha(stat.color, 0.12), color: stat.color, mx: 'auto', mb: 1.5 }}>
                          {stat.icon}
                        </Avatar>
                        <Typography variant="h6" sx={{ fontWeight: 900 }}>{stat.value}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          {stat.label}
                        </Typography>
                      </CardContent>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              {/* Performance Breakdown */}
              <Card sx={{ mt: 2, borderRadius: 4, boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} sx={{ mb: 2.5 }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Performance Analytics</Typography>
                      <Typography variant="body2" color="text.secondary">Analytical view of your performance by subject.</Typography>
                    </Box>
                    <Stack direction="row" spacing={1.5} flexWrap="wrap"
                      sx={{
                        px: 1.5, py: 1, borderRadius: 999,
                        bgcolor: alpha(theme.palette.background.paper, 0.6),
                        backdropFilter: 'blur(8px)',
                        border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                      }}
                    >
                      {[
                        { label: 'Correct', color: '#10b981' },
                        { label: 'Wrong', color: '#ef4444' },
                        { label: 'Skipped', color: '#f59e0b' }
                      ].map((item) => (
                        <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1, py: 0.4, borderRadius: 999, bgcolor: alpha(item.color, 0.08) }}>
                          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }} />
                          <Typography variant="caption" sx={{ fontWeight: 700, color: item.color }}>{item.label}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Stack>

                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={performanceChartData} barGap={8} margin={{ top: 10, right: 10, left: -12, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.6)} />
                        <XAxis dataKey="subject" tickLine={false} axisLine={false} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                        <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                        <RechartsTooltip
                          cursor={{ fill: alpha(theme.palette.primary.main, 0.06) }}
                          contentStyle={{
                            borderRadius: 14,
                            border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                            boxShadow: '0 12px 30px rgba(15, 23, 42, 0.12)'
                          }}
                        />
                        <Legend wrapperStyle={{ paddingTop: 8 }} />
                        <Bar dataKey="correct" radius={[6, 6, 0, 0]} fill="#10b981">
                          {performanceChartData.map((entry, index) => (
                            <Cell key={`${entry.subject}-correct-${index}`} fill="#10b981" />
                          ))}
                        </Bar>
                        <Bar dataKey="wrong" radius={[6, 6, 0, 0]} fill="#ef4444">
                          {performanceChartData.map((entry, index) => (
                            <Cell key={`${entry.subject}-wrong-${index}`} fill="#ef4444" />
                          ))}
                        </Bar>
                        <Bar dataKey="skipped" radius={[6, 6, 0, 0]} fill="#f59e0b">
                          {performanceChartData.map((entry, index) => (
                            <Cell key={`${entry.subject}-skipped-${index}`} fill="#f59e0b" />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* ============== QUESTION ANALYSIS ============== */}
          <Box sx={{ mt: 6, mb: 5 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} sx={{ mb: 3, gap: 2 }}>
              <Box>
                <Typography variant="overline" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: 1.2 }}>
                  Deep Dive
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>Question Analysis</Typography>
              </Box>
              <Stack
                direction="row"
                gap={1}
                flexWrap="wrap"
                sx={{
                  px: 1.25, py: 1, borderRadius: 999,
                  bgcolor: alpha(theme.palette.background.paper, 0.6),
                  backdropFilter: 'blur(8px)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                }}
              >
                {[
                  { id: 'all', label: 'All', count: results.performance.totalQuestions, icon: <ResultsIcon sx={{ fontSize: 16 }} />, color: 'primary' },
                  { id: 'correct', label: 'Correct', count: performance.correctAnswers, icon: <CorrectIcon sx={{ fontSize: 16 }} />, color: 'success' },
                  { id: 'wrong', label: 'Wrong', count: performance.incorrectAnswers, icon: <WrongIcon sx={{ fontSize: 16 }} />, color: 'error' },
                  { id: 'unanswered', label: 'Skipped', count: performance.unanswered, icon: <UnansweredIcon sx={{ fontSize: 16 }} />, color: 'warning' }
                ].map((tab) => (
                  <Chip
                    key={tab.id}
                    icon={tab.icon}
                    label={`${tab.label} (${tab.count})`}
                    onClick={() => setFilter(tab.id as any)}
                    variant={filter === tab.id ? 'filled' : 'outlined'}
                    color={(tab.color as any) || 'primary'}
                    sx={{ fontWeight: 800, borderRadius: 999 }}
                  />
                ))}
              </Stack>
            </Stack>

            <Stack spacing={2}>
              <AnimatePresence initial={false}>
                {filteredQuestions.map((q, idx) => {
                  const isOpen = expandedQuestion === idx;
                  const borderColor = q.isCorrect
                    ? alpha('#10b981', 0.25)
                    : q.userAnswer === null ? alpha('#f59e0b', 0.25) : alpha('#ef4444', 0.25);
                  const bgColor = q.isCorrect
                    ? alpha('#10b981', 0.025)
                    : q.userAnswer === null ? alpha('#f59e0b', 0.025) : alpha('#ef4444', 0.025);
                  const yourAnswerLabel = q.userAnswer === null ? '—' : String.fromCharCode(65 + q.userAnswer);
                  const correctAnswerLabel = String.fromCharCode(65 + q.correctAnswer);

                  return (
                    <Box
                      key={idx}
                      component={motion.div}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      whileHover={{ y: -2 }}
                      transition={{ duration: 0.25 }}
                      sx={{
                        borderRadius: 4,
                        border: '1px solid', borderColor,
                        bgcolor: bgColor,
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        onClick={() => setExpandedQuestion(isOpen ? null : idx)}
                        sx={{ p: 2, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}
                      >
                        <Avatar sx={{
                          bgcolor: q.isCorrect ? 'success.main' : q.userAnswer === null ? 'warning.main' : 'error.main',
                          color: 'white',
                          width: 36, height: 36, fontSize: 14, fontWeight: 800,
                        }}>
                          {q.questionNumber}
                        </Avatar>

                        <Typography variant="body1" sx={{ fontWeight: 600, flexGrow: 1, py: 1 }}>
                          {q.questionText}
                        </Typography>

                        {/* inline answer pills */}
                        <Stack direction="row" spacing={0.75} sx={{ display: { xs: 'none', md: 'flex' } }}>
                          <Chip
                            size="small"
                            label={`Your: ${yourAnswerLabel}`}
                            sx={{
                              fontWeight: 800,
                              borderRadius: 999,
                              bgcolor: q.userAnswer === null
                                ? alpha('#f59e0b', 0.18)
                                : q.isCorrect
                                  ? alpha('#10b981', 0.18)
                                  : alpha('#ef4444', 0.18),
                              color: q.userAnswer === null ? '#b45309' : q.isCorrect ? '#047857' : '#b91c1c',
                            }}
                          />
                          <Chip
                            size="small"
                            label={`Correct: ${correctAnswerLabel}`}
                            sx={{
                              fontWeight: 800,
                              borderRadius: 999,
                              bgcolor: alpha('#10b981', 0.18),
                              color: '#047857',
                            }}
                          />
                          {q.subject && (
                            <Chip label={q.subject} size="small" variant="outlined" sx={{ borderStyle: 'dashed' }} />
                          )}
                          <Chip
                            label={q.difficulty?.toUpperCase()}
                            size="small"
                            color={q.difficulty === 'easy' ? 'success' : q.difficulty === 'hard' ? 'error' : 'warning'}
                            variant="outlined"
                          />
                        </Stack>

                        <IconButton size="small">
                          {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </Box>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.28, ease: 'easeOut' }}
                            style={{ overflow: 'hidden' }}
                          >
                            <Box sx={{ px: { xs: 2, md: 4 }, pb: 4, pt: 2 }}>
                              <Divider sx={{ mb: 3 }} />

                              {/* Mobile tags */}
                              <Stack direction="row" gap={1} sx={{ mb: 3, display: { xs: 'flex', md: 'none' } }}>
                                <Chip
                                  size="small"
                                  label={`Your: ${yourAnswerLabel}`}
                                  sx={{ fontWeight: 800, borderRadius: 999 }}
                                />
                                <Chip
                                  size="small"
                                  label={`Correct: ${correctAnswerLabel}`}
                                  sx={{ fontWeight: 800, borderRadius: 999, bgcolor: alpha('#10b981', 0.18), color: '#047857' }}
                                />
                                {q.subject && <Chip label={q.subject} size="small" variant="outlined" sx={{ borderStyle: 'dashed' }} />}
                                <Chip label={q.difficulty?.toUpperCase()} size="small" variant="outlined" />
                              </Stack>

                              <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
                                {q.questionText}
                              </Typography>

                              <Grid container spacing={2}>
                                {q.options.map((option, optIdx) => {
                                  const isCorrect = option.isCorrect;
                                  const isSelected = option.selected;
                                  return (
                                    <Grid item xs={12} md={6} key={optIdx}>
                                      <Box sx={{
                                        p: 2,
                                        borderRadius: 3,
                                        border: '1.5px solid',
                                        borderColor: isCorrect
                                          ? 'success.main'
                                          : isSelected
                                            ? 'error.main'
                                            : alpha(theme.palette.divider, 0.5),
                                        bgcolor: isCorrect
                                          ? alpha(theme.palette.success.main, 0.05)
                                          : isSelected
                                            ? alpha(theme.palette.error.main, 0.05)
                                            : 'transparent',
                                        display: 'flex', alignItems: 'center', gap: 2,
                                        transition: 'all 0.15s',
                                      }}>
                                        <Avatar sx={{
                                          width: 26, height: 26, fontSize: 12,
                                          bgcolor: isCorrect ? 'success.main' : isSelected ? 'error.main' : alpha(theme.palette.divider, 0.8),
                                          color: isCorrect || isSelected ? 'white' : 'text.primary',
                                          fontWeight: 800,
                                        }}>
                                          {String.fromCharCode(65 + optIdx)}
                                        </Avatar>
                                        <Typography variant="body1" sx={{ fontSize: '0.875rem', fontWeight: isCorrect || isSelected ? 700 : 500, color: 'text.primary !important' }}>
                                          {option.text}
                                        </Typography>
                                        <Box sx={{ flexGrow: 1 }} />
                                        {isCorrect && <CorrectIcon sx={{ color: 'success.main' }} fontSize="small" />}
                                        {isSelected && !isCorrect && <WrongIcon sx={{ color: 'error.main' }} fontSize="small" />}
                                      </Box>
                                    </Grid>
                                  );
                                })}
                              </Grid>

                              {/* Explanation */}
                              {q.explanation && (
                                <Box sx={{
                                  mt: 4, p: 3,
                                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                                  borderRadius: 4,
                                  borderLeft: '4px solid', borderLeftColor: 'primary.main',
                                }}>
                                  <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1, color: 'primary.main' }}>
                                    <TopicIcon fontSize="small" />
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Explanation</Typography>
                                  </Stack>
                                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                                    {q.explanation}
                                  </Typography>
                                </Box>
                              )}

                              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 3 }}>
                                <Tooltip title={reportedQuestions.has(String(q.questionNumber)) ? 'Already reported' : 'Report an issue with this question'} arrow>
                                  <span>
                                    <Button
                                      size="small"
                                      startIcon={<FlagIcon />}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openReportDialog({
                                          questionId: String(q.questionNumber),
                                          questionNumber: q.questionNumber,
                                          questionText: q.questionText,
                                        });
                                      }}
                                      disabled={reportedQuestions.has(String(q.questionNumber))}
                                      sx={{
                                        fontWeight: 700,
                                        fontSize: '0.78rem',
                                        color: reportedQuestions.has(String(q.questionNumber)) ? 'text.disabled' : '#ef4444',
                                        borderColor: reportedQuestions.has(String(q.questionNumber)) ? 'divider' : alpha('#ef4444', 0.4),
                                        borderRadius: 999,
                                        textTransform: 'none',
                                        px: 2,
                                        '&:hover': {
                                          bgcolor: alpha('#ef4444', 0.06),
                                          borderColor: '#ef4444',
                                        },
                                      }}
                                      variant="outlined"
                                    >
                                      {reportedQuestions.has(String(q.questionNumber)) ? '✓ Reported' : 'Report Issue'}
                                    </Button>
                                  </span>
                                </Tooltip>
                                <Typography variant="caption" color="text.secondary">
                                  Marks: {q.marksObtained}/{q.marks}
                                </Typography>
                              </Stack>
                            </Box>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Box>
                  );
                })}
              </AnimatePresence>
            </Stack>
          </Box>

          {/* ============== FOOTER RETAKE CARD ============== */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.4 }}
            sx={{
              position: 'relative',
              borderRadius: 5,
              overflow: 'hidden',
              mt: 2, mb: 6,
              p: { xs: 3, md: 5 },
              color: 'white',
              background: 'radial-gradient(circle at 20% 20%, rgba(236,72,153,0.55), transparent 50%), radial-gradient(circle at 80% 80%, rgba(99,102,241,0.55), transparent 50%), linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
              boxShadow: '0 24px 60px rgba(30,27,75,0.45)',
            }}
          >
            <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} justifyContent="space-between" spacing={3}>
              <Box>
                <Typography variant="overline" sx={{ letterSpacing: 2, opacity: 0.85, fontWeight: 800 }}>
                  Next Step
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5 }}>
                  🎯 Ready to beat your score?
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.85, maxWidth: 560, fontWeight: 500 }}>
                  Reattempt this test now to improve your rank and score.
                </Typography>
              </Box>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>

                <Button
                  variant="outlined"
                  startIcon={<HomeIcon />}
                  onClick={() => navigate('/v2/student/exam-results')}
                  sx={{
                    borderRadius: 999,
                    px: 2.5, py: 1.4,
                    fontWeight: 700,
                    textTransform: 'none',
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.6)',
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.12)' },
                  }}
                >
                  Back to Results
                </Button>
              </Stack>
            </Stack>
          </Box>

        </Box>
      </Container>


      {/* ============== REPORT ISSUE DIALOG ============== */}
      <Dialog
        open={!!reportDialog?.open}
        onClose={() => !reportSubmitting && setReportDialog(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}
      >
        {/* Header */}
        <Box sx={{
          px: 3, pt: 3, pb: 2,
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
          color: 'white',
        }}>
          <Stack direction="row" alignItems="center" gap={1.5}>
            <Avatar sx={{ bgcolor: alpha('#ef4444', 0.85), width: 38, height: 38 }}>
              <FlagIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
                Report an Issue
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Question {reportDialog?.questionNumber} · Help us improve the test content
              </Typography>
            </Box>
          </Stack>
        </Box>

        <DialogContent sx={{ pt: 3, pb: 1 }}>
          {/* Question preview */}
          <Box sx={{
            p: 2, mb: 3,
            bgcolor: alpha('#6366f1', 0.04),
            borderRadius: 3,
            border: '1px solid',
            borderColor: alpha('#6366f1', 0.15),
          }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', display: 'block', mb: 0.5 }}>
              Question {reportDialog?.questionNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              {reportDialog?.questionText?.length! > 160
                ? reportDialog?.questionText?.substring(0, 160) + '…'
                : reportDialog?.questionText}
            </Typography>
          </Box>

          {/* Issue type */}
          <FormControl fullWidth sx={{ mb: 2.5 }}>
            <InputLabel id="issue-type-label">Issue Type *</InputLabel>
            <Select
              labelId="issue-type-label"
              value={issueType}
              label="Issue Type *"
              onChange={(e) => setIssueType(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              {ISSUE_TYPES.map((it) => (
                <MenuItem key={it.value} value={it.value}>
                  {it.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Optional description */}
          <MuiTextField
            fullWidth
            multiline
            rows={3}
            label="Additional details (optional)"
            placeholder="Describe the issue in more detail so our team can fix it quickly…"
            value={issueDescription}
            onChange={(e) => setIssueDescription(e.target.value)}
            inputProps={{ maxLength: 500 }}
            helperText={`${issueDescription.length}/500`}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 1.5, gap: 1.5 }}>
          <Button
            onClick={() => setReportDialog(null)}
            disabled={reportSubmitting}
            variant="outlined"
            sx={{ borderRadius: 999, fontWeight: 700, textTransform: 'none', flex: 1 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitReport}
            disabled={!issueType || reportSubmitting}
            variant="contained"
            startIcon={reportSubmitting ? <CircularProgress size={16} color="inherit" /> : <FlagIcon />}
            sx={{
              borderRadius: 999,
              fontWeight: 800,
              textTransform: 'none',
              flex: 1,
              bgcolor: '#ef4444',
              '&:hover': { bgcolor: '#dc2626' },
              '&:disabled': { bgcolor: alpha('#ef4444', 0.4), color: 'white' },
            }}
          >
            {reportSubmitting ? 'Submitting…' : 'Submit Report'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ============== SUCCESS / ERROR SNACKBAR ============== */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4500}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: 3, fontWeight: 700 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

    </DashboardLayout>
  );
};

export default ResultDetailV2;
