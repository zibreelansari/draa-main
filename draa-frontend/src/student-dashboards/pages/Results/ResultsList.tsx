import React, { useState, useMemo } from'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  Chip,
  LinearProgress,
  alpha,
  Paper,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Stack,
  Tooltip,
  IconButton,
  Divider,
  useTheme
} from'@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  Legend,
  Label
} from'recharts';
import {
  Search as SearchIcon,
  Timeline as ResultsIcon,
  EmojiEvents as TrophyIcon,
  CheckCircle as SuccessIcon,
  Cancel as FailIcon,
  TrendingUp as TrendIcon,
  AccessTime as TimeIcon,
  Visibility as ViewIcon,
  Speed as SpeedIcon,
  EmojiEvents as MedalIcon,
  AutoGraph as GraphIcon
} from'@mui/icons-material';
import { motion } from'framer-motion';
import { useExamResults, TestAttempt } from'../../hooks/useExamResults';
import DashboardLayout from'../../layouts/DashboardLayout';
import { useNavigate, useParams } from'react-router-dom';
import dayjs from'dayjs';
import EmptyState from'../../components/EmptyState';
import DashboardLoader from'../../components/DashboardLoader';
import usePageTitle from '../../../hooks/usePageTitle';

const ResultsList: React.FC = () => {
  const { studentId: urlStudentId } = useParams<{ studentId: string }>();
  const user = JSON.parse(localStorage.getItem('edudocs') ||'{}');
  
  // Use ID from URL if it's a valid ObjectId, otherwise fallback to localStorage
  const isValidObjectId = (id?: string) => id && id.length === 24 && /^[0-9a-fA-F]+$/.test(id);
  const effectiveStudentId = isValidObjectId(urlStudentId) ? urlStudentId : (user.id || user._id);

  const { attempts, totalPages, loading, currentPage, setCurrentPage, calculateStats } = useExamResults(effectiveStudentId);
  const navigate = useNavigate();
  const theme = useTheme();
  usePageTitle('My Results | Draa');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const stats = useMemo(() => calculateStats(attempts), [attempts, calculateStats]);

  const renderCenterLabel = ({ viewBox }: any) => {
    const { cx, cy } = viewBox;
    const passRate = stats.totalAttempts > 0 
      ? ((stats.passedTests / stats.totalAttempts) * 100).toFixed(0) 
      : '0';

    return (
      <g>
        <text
          x={cx}
          y={cy - 5}
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            fontSize: '24px',
            fontWeight: 800,
            fill: theme.palette.text.primary,
            fontFamily: 'Plus Jakarta Sans',
          }}
        >
          {passRate}%
        </text>
        <text
          x={cx}
          y={cy + 18}
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            fontSize: '11px',
            fontWeight: 600,
            fill: theme.palette.text.secondary,
            fontFamily: 'Plus Jakarta Sans',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          Pass Rate
        </text>
      </g>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <Box sx={{
          bgcolor: 'background.paper',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid',
          borderColor: 'divider',
          p: 1,
          px: 1.5,
          borderRadius: 2,
        }}>
          <Typography variant="caption" sx={{ fontWeight: 800, color: data.payload.name === 'Passed' ? 'success.main' : 'error.main' }}>
            {data.payload.name}: {data.value}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  // Compute current learning streak (consecutive days with at least one attempt,
  // counting back from today). If no activity today, count back from yesterday.
  const currentStreak = useMemo(() => {
    if (!attempts || attempts.length === 0) return 0;

    const daysWithActivity = new Set<string>();
    for (const a of attempts) {
      const ts = a.endTime || a.startTime;
      if (!ts) continue;
      const d = new Date(ts);
      if (Number.isNaN(d.getTime())) continue;
      daysWithActivity.add(d.toDateString());
    }

    if (daysWithActivity.size === 0) return 0;

    const oneDayMs = 24 * 60 * 60 * 1000;
    let cursor = new Date();
    cursor.setHours(0, 0, 0, 0);

    // If no activity today, start counting from yesterday so the streak still shows.
    if (!daysWithActivity.has(cursor.toDateString())) {
      cursor = new Date(cursor.getTime() - oneDayMs);
    }

    let streak = 0;
    while (daysWithActivity.has(cursor.toDateString())) {
      streak += 1;
      cursor = new Date(cursor.getTime() - oneDayMs);
    }
    return streak;
  }, [attempts]);

  const filteredAttempts = useMemo(() => {
    let result = attempts.filter(a => a.status !=='ongoing');

    if (statusFilter ==='passed') {
      result = result.filter(a => a.percentage >= 40);
    } else if (statusFilter ==='failed') {
      result = result.filter(a => a.percentage < 40);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(a => a.testTitle.toLowerCase().includes(q));
    }

    return result;
  }, [attempts, statusFilter, searchQuery]);

  if (loading && attempts.length === 0) {
    return (
      <DashboardLayout>
        <DashboardLoader />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Modern Hero Section (Compact) */}
        <Box sx={{ mb: 4, borderRadius: 4, overflow:'hidden' }}>
        
        </Box>

        <Box sx={{ p: { xs: 0, md: 0 } }}>
          <Box sx={{ mb: 4, display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                My Results
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Historical performance overview and detailed test analysis.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<GraphIcon />}
              onClick={() => navigate('/v2/student/my-exams')}
              sx={{
                background:'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                boxShadow:'0 4px 14px rgba(99, 102, 241, 0.35)',
'&:hover': { background:'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' },
              }}
            >
              Take New Test
            </Button>
          </Box>

          {/* Analytics Dashboard */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} lg={4}>
              <Card sx={{ height:'100%', border:'1px solid', borderColor: alpha('#6366f1', 0.1) }}>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, display:'flex', alignItems:'center', gap: 1 }}>
                    <ResultsIcon sx={{ color:'#6366f1', fontSize: 20 }} /> Performance Ratio
                  </Typography>
                  <Box sx={{ width:'100%', height: 200, position: 'relative' }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={[
                            { name:'Passed', value: stats.passedTests },
                            { name:'Failed', value: stats.failedTests }
                          ]}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          <Cell fill="#10b981" />
                          <Cell fill="#ef4444" />
                          <Label content={renderCenterLabel} position="center" />
                        </Pie>
                        <ChartTooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 3, pt: 2, borderTop: '1px solid', borderColor: alpha(theme.palette.divider, 0.5) }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: 'success.main', lineHeight: 1 }}>
                        {stats.passedTests}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Passed</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: 'error.main', lineHeight: 1 }}>
                        {stats.failedTests}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Failed</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} lg={8}>
              <Grid container spacing={2}>
                {[
                  { label:'Average Score', value: `${stats.averageScore.toFixed(1)}%`, icon: <TrendIcon />, color:'#6366f1', sub:'Across all attempts' },
                  { label:'Highest Score', value: `${stats.highestScore.toFixed(1)}%`, icon: <TrophyIcon />, color:'#f59e0b', sub:'Your personal best' },
                  { label:'Total Attempts', value: stats.totalAttempts, icon: <SpeedIcon />, color:'#10b981', sub:'Tests completed' },
                  { label:'Learning Streak', value: currentStreak === 0 ?'0 Days' : `${currentStreak} ${currentStreak === 1 ?'Day' :'Days'}`, icon: <TrendIcon />, color:'#ec4899', sub: currentStreak === 0 ?'Take a test to start!' : currentStreak === 1 ?'Keep it up!' :'Keep it up!' },
                ].map((item, i) => (
                  <Grid item xs={12} sm={6} key={i}>
                    <Paper
                      component={motion.div}
                      whileHover={{ scale: 1.02 }}
                      sx={{
                        p: 2.5,
                        height:'100%',
                        borderRadius: 3,
                        bgcolor: alpha(item.color, 0.03),
                        border:'1px solid',
                        borderColor: alpha(item.color, 0.1),
                        display:'flex',
                        alignItems:'center',
                        gap: 2.5
                      }}
                    >
                      <Avatar sx={{ bgcolor: alpha(item.color, 0.1), color: item.color, width: 48, height: 48, borderRadius: 2 }}>
                        {item.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 700, color:'text.secondary', textTransform:'uppercase', letterSpacing: 0.5 }}>
                          {item.label}
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 900, lineHeight: 1.2 }}>
                          {item.value}
                        </Typography>
                        <Typography variant="caption" sx={{ color:'text.secondary', fontWeight: 500 }}>
                          {item.sub}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Box>



        {/* Filters */}
        <Box sx={{ mb: 4, display:'flex', flexWrap:'wrap', gap: 2, alignItems:'center' }}>
          <Box sx={{ flexGrow: 1, minWidth: 280 }}>
            <TextField
              fullWidth
              placeholder="Search by test title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color:'text.secondary' }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2, bgcolor:'background.paper' },
              }}
            />
          </Box>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            size="small"
            sx={{ borderRadius: 2, bgcolor:'background.paper', minWidth: 160 }}
          >
            <MenuItem value="all">All Results</MenuItem>
            <MenuItem value="passed">Passed</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
          </Select>
        </Box>

        {/* Results Table */}
        <Card sx={{ mb: 4, overflow:'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: alpha('#6366f1', 0.04) }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, fontSize:'0.75rem', letterSpacing: 0.5, color:'text.secondary' }}>TEST DETAILS</TableCell>
                  <TableCell sx={{ fontWeight: 800, fontSize:'0.75rem', letterSpacing: 0.5, color:'text.secondary' }} align="center">SCORE (%)</TableCell>
                  <TableCell sx={{ fontWeight: 800, fontSize:'0.75rem', letterSpacing: 0.5, color:'text.secondary' }} align="center">RANK</TableCell>
                  <TableCell sx={{ fontWeight: 800, fontSize:'0.75rem', letterSpacing: 0.5, color:'text.secondary' }} align="center">STATUS</TableCell>
                  <TableCell sx={{ fontWeight: 800, fontSize:'0.75rem', letterSpacing: 0.5, color:'text.secondary' }} align="right">ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAttempts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ py: 0 }}>
                      <EmptyState
                        type="no-results"
                        size="small"
                        title="No Results Found"
                        description="You haven't taken any tests yet. Start practicing to see your performance here."
                        actionLabel="Take a Test"
                        onAction={() => navigate('/v2/student/my-exams')}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAttempts.map((attempt, idx) => (
                    <TableRow
                      key={attempt.id}
                      component={motion.tr}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      sx={{
'&:hover': { bgcolor: alpha('#6366f1', 0.03) },
                        cursor:'pointer',
                      }}
                      onClick={() => navigate(`/v2/student/test-results/${attempt.id}`)}
                    >
                      <TableCell>
                        <Box sx={{ display:'flex', alignItems:'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: alpha(attempt.percentage >= 40 ?'#10b981' :'#ef4444', 0.1), color: attempt.percentage >= 40 ?'#10b981' :'#ef4444', width: 40, height: 40 }}>
                            {attempt.percentage >= 40 ? <SuccessIcon /> : <FailIcon />}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.3 }}>{attempt.testTitle}</Typography>
                            <Box sx={{ display:'flex', alignItems:'center', gap: 0.5 }}>
                              <TimeIcon sx={{ fontSize: 12, color:'text.disabled' }} />
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                {dayjs(attempt.startTime).format('MMM DD, YYYY  hh:mm A')}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display:'flex', flexDirection:'column', alignItems:'center', gap: 1 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 800,
                              color: attempt.percentage >= 40 ?'success.main' :'error.main',
                            }}
                          >
                            {attempt.percentage.toFixed(1)}%
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={attempt.percentage}
                            sx={{
                              width: 60,
                              height: 4,
                              borderRadius: 2,
                              bgcolor: alpha('#64748b', 0.08),
'& .MuiLinearProgress-bar': {
                                bgcolor: attempt.percentage >= 40 ?'#10b981' :'#ef4444',
                              },
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`#${attempt.rank ||''}`}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            bgcolor: alpha('#6366f1', 0.08),
                            color:'#6366f1',
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={attempt.percentage >= 40 ?'PASSED' :'FAILED'}
                          size="small"
                          color={attempt.percentage >= 40 ?'success' :'error'}
                          sx={{
                            fontWeight: 800,
                            fontSize:'0.65rem',
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Full Report">
                          <IconButton
                            size="small"
                            onClick={(e) => { e.stopPropagation(); navigate(`/v2/student/test-results/${attempt.id}`); }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display:'flex', justifyContent:'center' }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(_, page) => setCurrentPage(page)}
              color="primary"
              variant="outlined"
              shape="rounded"
              sx={{'& .MuiPaginationItem-root': { fontWeight: 700 } }}
            />
          </Box>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default ResultsList;