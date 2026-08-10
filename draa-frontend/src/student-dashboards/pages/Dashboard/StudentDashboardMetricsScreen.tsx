import React, { useState, useEffect, useCallback, useMemo } from'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Stack,
  Divider,
  Button,
  CircularProgress,
  Avatar,
  Paper,
  Tooltip,
  IconButton,
  Tab,
  Tabs,
  alpha,
  useTheme,
  useMediaQuery,
} from'@mui/material';
import {
  ArrowForwardIos as ArrowForwardIosIcon,
  AutoGraph as MetricsIcon,
  TrendingUp as TrendIcon,
  CheckCircle as PassIcon,
  Bolt as StreakIcon,
  EmojiEvents as TrophyIcon,
  Refresh as RefreshIcon,
  Whatshot as FireIcon,
  School as LearnIcon,
  TrendingUp as UpIcon,
  TrendingDown as DownIcon,
  Remove as StableIcon,
  Leaderboard as LeaderboardIcon,
  ChevronRight as ChevronRightIcon,
  MenuBook as BookIcon,
  Assignment as TestIcon,
  AccessTime as TimeIcon,
  RocketLaunch as RocketIcon,
} from'@mui/icons-material';
import { useNavigate } from'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, Cell 
} from'recharts';
import DashboardLayout from'../../layouts/DashboardLayout';
import { useStudentProfile } from'../../hooks/useStudentProfile';
import uri from'../../../url';
import DashboardLoader from'../../components/DashboardLoader';
import usePageTitle from '../../../hooks/usePageTitle';

interface MetricsData {
  academic: {
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    totalExamsTaken: number;
    examsPassed: number;
    examsFailed: number;
    passRate: number;
    gradeDistribution: { A: number; B: number; C: number; D: number; F: number };
    improvementRate: number;
    totalStudyTime: number;
  };
  courses: {
    totalEnrolled: number;
    completed: number;
    inProgress: number;
    completionRate: number;
    averageProgress: number;
  };
  testSeries: {
    totalPurchased: number;
    attempted: number;
    averageScore: number;
    accuracyRate: number;
    questionsAnswered: number;
  };
  books: {
    totalPurchased: number;
    readBooks: number;
    readingProgress: number;
  };
  achievements: {
    totalPoints: number;
    rank: number;
    totalStudents?: number;
    percentile?: number;
    level: number;
    streak: { current: number; longest: number };
  };
  activity: {
    activitiesLast30Days: number;
    weeklyTrend: string;
    preferredStudyTime: string;
  };
  monthlyProgress: Array<{
    month: string;
    totalActivities: number;
    averageScore: number;
  }>;
  recentActivity: Array<any>;
}

const StudentDashboardMetricsScreen: React.FC = () => {
  usePageTitle('My Metrics | Draa');
  const { profile: user, loading: profileLoading } = useStudentProfile();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const fetchMetrics = useCallback(async () => {
    if (!user?.id && !user?._id) {
        if (!profileLoading) setLoading(false);
        return;
    }

    const studentId = user.id || user._id;

    try {
      setLoading(true);
      const res = await fetch(`${uri}/student/metrics/metrics/${studentId}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setMetrics(data.data);
        } else {
          setError('Failed to fetch metrics');
        }
      }
    } catch (err: any) {
      console.error('Error fetching metrics:', err);
      setError('Failed to load metrics data');
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?._id, user?.token, profileLoading]);

  const refreshMetrics = async () => {
    if (!user?.id && !user?._id) return;
    setRefreshing(true);
    try {
      const studentId = user.id || user._id;
      await fetch(`${uri}/student/metrics/refresh/${studentId}`, {
        method:'POST',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      await fetchMetrics();
    } catch (err) {
      console.error('Error refreshing metrics:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const topStats = useMemo(() => {
    const rank = metrics?.achievements?.rank;
    const totalStudents = metrics?.achievements?.totalStudents;
    const topPercent = rank && totalStudents
      ? `${Math.max(1, Math.round((rank / totalStudents) * 100))}%`
      :'—';
    const improvement = metrics?.academic?.improvementRate;
    return [
      {
        title:'Global Rank',
        value: rank ? `#${rank}` :'—',
        subtitle: rank && totalStudents ? `Top ${topPercent} of ${totalStudents} students` :'Earn points by taking tests',
        icon: <LeaderboardIcon />,
        color: theme.palette.primary.main,
        trend: rank ? `of ${totalStudents ??'—'}` :'—',
        trendUp: !!rank
      },
      {
        title:'Current Streak',
        value: `${metrics?.achievements?.streak?.current ?? 0} Days`,
        subtitle: `Best: ${metrics?.achievements?.streak?.longest ?? 0} days`,
        icon: <FireIcon />,
        color:'#f59e0b',
        trend: (metrics?.achievements?.streak?.current ?? 0) > 0 ?'Keep it up!' :'Start today',
        trendUp: (metrics?.achievements?.streak?.current ?? 0) > 0
      },
      {
        title:'Mastery Score',
        value: `${metrics?.academic?.averageScore ?? 0}%`,
        subtitle:'Across all subjects',
        icon: <TrophyIcon />,
        color:'#ec4899',
        trend: typeof improvement ==='number' ? `${improvement > 0 ?'+' :''}${improvement}%` :'—',
        trendUp: typeof improvement ==='number' && improvement >= 0
      },
      {
        title:'Learning Hours',
        value: `${metrics?.academic?.totalStudyTime ?? 0}h`,
        subtitle:'Total focus time',
        icon: <TimeIcon />,
        color:'#10b981',
        trend: (metrics?.academic?.totalStudyTime ?? 0) > 0 ?'Logged' :'Start now',
        trendUp: (metrics?.academic?.totalStudyTime ?? 0) > 0
      }
    ];
  }, [metrics, theme]);

  if (loading || profileLoading) {
    return (
      <DashboardLayout>
        <DashboardLoader />
      </DashboardLayout>
    );
  }

  const hasMonthlyData = (metrics?.monthlyProgress ?? []).some(
    (m) => (m.averageScore ?? 0) > 0 || (m.totalActivities ?? 0) > 0
  );

  return (
    <DashboardLayout>
      <Box sx={{ width:'100%', pb: 6 }}>
        {/* Header Section */}
        <Box sx={{ mb: 3, display:'flex', justifyContent:'space-between', alignItems: { xs:'flex-start', md:'flex-end' }, flexDirection: { xs:'column', md:'row' }, gap: 2.5 }}>
          <Box>
            <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: 1.2, color:'primary.main' }}>
              My Performance
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5, letterSpacing:'-0.02em', fontSize: { xs:'1.75rem', md:'2.125rem' } }}>
              Performance Analytics
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth:'600px', fontSize: { xs:'0.9rem', md:'1rem' } }}>
              Detailed tracking of your academic growth, course progress, and exam metrics.
            </Typography>
          </Box>
          <Stack direction={{ xs:'column', sm:'row' }} spacing={1.5} sx={{ width: { xs:'100%', sm:'auto' } }}>
            <Button
              variant="outlined"
              fullWidth={isMobile}
              startIcon={<RefreshIcon sx={{ animation: refreshing ?'spin 1s linear infinite' :'none','@keyframes spin': {'100%': { transform:'rotate(360deg)' } } } } />}
              onClick={refreshMetrics}
              disabled={refreshing}
              sx={{ borderRadius:'12px', textTransform:'none', fontWeight: 700, py: 1.2 }}
            >
              Sync Data
            </Button>
            <Button
              variant="contained"
              fullWidth={isMobile}
              startIcon={<LeaderboardIcon />}
              onClick={() => navigate('/v2/student/leaderboard')}
              sx={{
                borderRadius:'12px',
                textTransform:'none',
                fontWeight: 700,
                px: 3, py: 1.2,
                background:'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                boxShadow:'0 8px 20px rgba(99,102,241,0.35)',
                '&:hover': { background:'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' },
              }}
            >
              Global Leaderboard
            </Button>
          </Stack>
        </Box>

        {/* Top Highlight Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {topStats.map((stat, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card sx={{
                borderRadius:'20px',
                position:'relative',
                overflow:'hidden',
                transition:'transform 0.2s, box-shadow 0.2s',
                '&:hover': { transform:'translateY(-4px)', boxShadow:'0 12px 32px rgba(15,23,42,0.12)' },
'&::after': {
                    content:'""',
                    position:'absolute',
                    top: 0, right: 0,
                    width:'120px', height:'120px',
                    background: `radial-gradient(circle at top right, ${alpha(stat.color, 0.12)}, transparent 70%)`,
                    pointerEvents:'none',
                }
              }}>
                {/* Color top stripe */}
                <Box sx={{
                  height: 4,
                  background:`linear-gradient(90deg, ${stat.color} 0%, ${alpha(stat.color, 0.4)} 100%)`,
                }} />
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color:'text.secondary', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                        {stat.title}
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 900, my: 0.5, lineHeight: 1.15 }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" sx={{ color:'text.secondary', fontSize:'0.8rem' }}>
                        {stat.subtitle}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: alpha(stat.color, 0.12), color: stat.color, borderRadius:'12px', width: 44, height: 44 }}>
                      {stat.icon}
                    </Avatar>
                  </Stack>
                  <Divider sx={{ my: 2, opacity: 0.5 }} />
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    {stat.trendUp
                      ? <UpIcon sx={{ color: stat.color, fontSize: 16 }} />
                      : <DownIcon sx={{ color:'#ef4444', fontSize: 16 }} />}
                    <Typography variant="caption" sx={{ fontWeight: 800, color: stat.trendUp ? stat.color :'#ef4444' }}>
                      {stat.trend}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          {/* Main Performance Chart */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ borderRadius:'24px', height:'100%', overflow:'hidden' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ mb: 3, display:'flex', justifyContent:'space-between', alignItems: { xs:'flex-start', sm:'center' }, flexDirection: { xs:'column', sm:'row' }, gap: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Growth Trajectory</Typography>
                    <Typography variant="body2" color="text.secondary">Monthly performance & activity trend</Typography>
                  </Box>
                  <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto" sx={{
                    minHeight: 0,
'& .MuiTabs-indicator': { display:'none' },
'& .MuiTab-root': {
                      minHeight: 0,
                      borderRadius:'8px',
                      mx: 0.5,
                      textTransform:'none',
                      fontWeight: 700,
                      px: 2,
                      py: 0.75,
'&.Mui-selected': { bgcolor:'primary.main', color:'white' }
                    }
                  }}>
                    <Tab label="Performance" />
                    <Tab label="Activity" />
                  </Tabs>
                </Box>
                <Box sx={{ height: 350, width:'100%' }}>
                  {hasMonthlyData ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={metrics?.monthlyProgress || []}>
                        <defs>
                          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.5)} />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: theme.palette.text.secondary }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: theme.palette.text.secondary }} />
                        <RechartsTooltip
                          contentStyle={{ borderRadius:'12px', border:'none', boxShadow:'0 8px 32px rgba(0,0,0,0.12)' }}
                        />
                        <Area
                          type="monotone"
                          dataKey={activeTab === 0 ?"averageScore" :"totalActivities"}
                          stroke={theme.palette.primary.main}
                          strokeWidth={4}
                          fillOpacity={1}
                          fill="url(#colorScore)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <Stack alignItems="center" justifyContent="center" sx={{ height:'100%', textAlign:'center', color:'text.secondary' }} spacing={1.5}>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color:'primary.main', width: 56, height: 56 }}>
                        <MetricsIcon />
                      </Avatar>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color:'text.primary' }}>
                        No activity yet
                      </Typography>
                      <Typography variant="body2" sx={{ maxWidth: 320 }}>
                        Take your first test or enroll in a course — your monthly trend will appear here.
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<RocketIcon />}
                        onClick={() => navigate('/v2/student/my-exams')}
                        sx={{
                          mt: 1,
                          borderRadius: 999,
                          textTransform:'none',
                          fontWeight: 700,
                          background:'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                          boxShadow:'0 8px 20px rgba(99,102,241,0.35)',
                          '&:hover': { background:'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' },
                        }}
                      >
                        Take a Test
                      </Button>
                    </Stack>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Course Completion */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ borderRadius:'24px', height:'100%' }}>
              <CardContent sx={{ p: 3, display:'flex', flexDirection:'column', height:'100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Course Completion</Typography>
                <Box sx={{ position:'relative', display:'flex', justifyContent:'center', my: 2, alignItems:'center', height: 140 }}>
                  <CircularProgress
                    variant="determinate"
                    value={100}
                    size={140}
                    thickness={5}
                    sx={{ color: alpha(theme.palette.primary.main, 0.1), position:'absolute' }}
                  />
                  <CircularProgress
                    variant="determinate"
                    value={metrics?.courses?.completionRate || 0}
                    size={140}
                    thickness={5}
                    sx={{
                      color: theme.palette.primary.main,
                      position:'absolute',
                      [`& .MuiCircularProgress-circle`]: { strokeLinecap:'round' },
                    }}
                  />
                  <Box sx={{ position:'absolute', textAlign:'center', pointerEvents:'none' }}>
                    <Typography variant="h4" sx={{ fontWeight: 900, lineHeight: 1 }}>
                      {metrics?.courses?.completionRate ?? 0}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                      Done
                    </Typography>
                  </Box>
                </Box>
                <Stack spacing={1.5} sx={{ mt:'auto' }}>
                  <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Completed Courses</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>{metrics?.courses?.completed ?? 0}</Typography>
                  </Box>
                  <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>In Progress</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>{metrics?.courses?.inProgress ?? 0}</Typography>
                  </Box>
                  <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Total Enrolled</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>{metrics?.courses?.totalEnrolled ?? 0}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Test Series Performance */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius:'24px', height:'100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Test Series Breakdown</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper sx={{
                      p: 2, borderRadius:'16px',
                      background: `linear-gradient(135deg, ${alpha('#10b981', 0.10)} 0%, ${alpha('#10b981', 0.03)} 100%)`,
                      border:`1px solid ${alpha('#10b981', 0.2)}`,
                    }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
                        ACCURACY
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 900, color:'#10b981', mt: 0.5 }}>
                        {metrics?.testSeries?.accuracyRate ?? 0}%
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper sx={{
                      p: 2, borderRadius:'16px',
                      background: `linear-gradient(135deg, ${alpha('#6366f1', 0.10)} 0%, ${alpha('#6366f1', 0.03)} 100%)`,
                      border:`1px solid ${alpha('#6366f1', 0.2)}`,
                    }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
                        AVG SCORE
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 900, color:'#6366f1', mt: 0.5 }}>
                        {metrics?.testSeries?.averageScore ?? 0}%
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack spacing={2}>
                      <Box>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>Questions Answered</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 800 }}>{metrics?.testSeries?.questionsAnswered ?? 0}</Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, ((metrics?.testSeries?.questionsAnswered ?? 0) / Math.max(1, (metrics?.testSeries?.questionsAnswered ?? 0) + 1)) * 100)}
                          sx={{
                            height: 8, borderRadius: 3,
                            bgcolor: alpha('#6366f1', 0.1),
'& .MuiLinearProgress-bar': { borderRadius: 3, background:'linear-gradient(90deg, #6366f1, #8b5cf6)' },
                          }}
                        />
                      </Box>
                      <Box>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>Tests Attempted</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 800 }}>{metrics?.testSeries?.attempted ?? 0}</Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, ((metrics?.testSeries?.attempted ?? 0) / Math.max(1, metrics?.testSeries?.totalPurchased ?? 1)) * 100)}
                          sx={{
                            height: 8, borderRadius: 3,
                            bgcolor: alpha('#10b981', 0.1),
'& .MuiLinearProgress-bar': { borderRadius: 3, background:'linear-gradient(90deg, #10b981, #34d399)' },
                          }}
                        />
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Academic Highlights */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius:'24px', height:'100%' }}>
              <CardContent sx={{ p: 3, display:'flex', flexDirection:'column', height:'100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Academic Highlights</Typography>
                <Stack spacing={2.5} sx={{ flex: 1 }}>
                  {[
                    { label:'Exams Passed', value: metrics?.academic?.examsPassed ?? 0, total: metrics?.academic?.totalExamsTaken ?? 0, color:'#10b981', icon: <PassIcon /> },
                    { label:'Average Performance', value: `${metrics?.academic?.averageScore ?? 0}%`, color:'#6366f1', icon: <LearnIcon /> },
                    { label:'Highest Achievement', value: `${metrics?.academic?.highestScore ?? 0}%`, color:'#f59e0b', icon: <TrophyIcon /> },
                    { label:'Total Learning Assets', value: (metrics?.courses?.totalEnrolled ?? 0) + (metrics?.books?.totalPurchased ?? 0), color:'#ec4899', icon: <MetricsIcon /> },
                  ].map((item, i) => (
                    <Box key={i} sx={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: alpha(item.color, 0.12), color: item.color, width: 40, height: 40 }}>
                          {item.icon}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{item.label}</Typography>
                      </Stack>
                      <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                        {item.value}
                        {item.total ? (
                          <Typography component="span" variant="caption" sx={{ color:'text.secondary', ml: 0.5 }}>
                            / {item.total}
                          </Typography>
                        ) : null}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
                <Button
                  fullWidth
                  variant="outlined"
                  endIcon={<ArrowForwardIosIcon sx={{ fontSize: 14 }} />}
                  sx={{ mt: 4, py: 1.5, borderRadius:'16px', textTransform:'none', fontWeight: 700 }}
                  onClick={() => navigate('/v2/student/exam-results')}
                >
                  View Detailed Exam Results
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default StudentDashboardMetricsScreen;
