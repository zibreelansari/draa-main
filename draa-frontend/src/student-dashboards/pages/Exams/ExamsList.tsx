import React, { useState, useMemo } from'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  TextField,
  InputAdornment,
  LinearProgress,
  alpha,
  Paper,
  Avatar,
  Stack,
  IconButton,
  useMediaQuery,
  useTheme
} from'@mui/material';
import {
  Search as SearchIcon,
  PlayCircleOutline as PlayIcon,
  Timer as ClockIcon,
  Star as StarIcon,
  EmojiEvents as TrophyIcon,
  History as HistoryIcon,
  CheckCircle as SuccessIcon,
  Cancel as FailIcon,
  Schedule as ScheduleIcon,
  OnlinePrediction as LiveIcon,
  Warning as WarningIcon,
  ChevronRight as ChevronRightIcon
} from'@mui/icons-material';
import { motion } from'framer-motion';
import { useStudentExams, Exam } from'../../hooks/useStudentExams';
import DashboardLayout from'../../layouts/DashboardLayout';
import { useNavigate } from'react-router-dom';
import dayjs from'dayjs';
import EmptyState from'../../components/EmptyState';
import DashboardLoader from'../../components/DashboardLoader';
import usePageTitle from '../../../hooks/usePageTitle';

const ExamsList: React.FC = () => {
  const { exams, loading, stats, getExamStatus } = useStudentExams();
  const navigate = useNavigate();
  usePageTitle('My Exams | Draa');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredExams = useMemo(() => {
    let result = [...exams];

    if (activeTab ==='live') {
      result = result.filter(e => getExamStatus(e.scheduledAt, e.durationMinutes) ==='Ongoing');
    } else if (activeTab ==='upcoming') {
      result = result.filter(e => getExamStatus(e.scheduledAt, e.durationMinutes) ==='Upcoming');
    } else if (activeTab ==='expired') {
      result = result.filter(e => getExamStatus(e.scheduledAt, e.durationMinutes) ==='Expired');
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.subject.toLowerCase().includes(q)
      );
    }

    return result;
  }, [exams, activeTab, searchQuery, getExamStatus]);

  const ongoingCount = exams.filter(e => getExamStatus(e.scheduledAt, e.durationMinutes) ==='Ongoing').length;

  if (loading && exams.length === 0) {
    return (
      <DashboardLayout>
        <DashboardLoader />
      </DashboardLayout>
    );
  }

  const getDifficultyColor = (diff?: string) => {
    if (diff ==='hard') return'#ef4444';
    if (diff ==='medium') return'#f59e0b';
    return'#10b981';
  };

  return (
    <DashboardLayout>
      <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display:'flex', justifyContent:'space-between', alignItems: isMobile ?'flex-start' :'center', flexWrap:'wrap', gap: 2 }}>
          <Box sx={{ flex: 1, minWidth: isMobile ?'100%' :'auto' }}>
            <Box sx={{ display:'flex', alignItems:'center', gap: isMobile ? 1.5 : 2, mb: 1 }}>
              <Avatar sx={{ bgcolor: alpha('#6366f1', 0.1), color:'#6366f1', width: isMobile ? 32 : 40, height: isMobile ? 32 : 40 }}>
                <ScheduleIcon sx={{ fontSize: isMobile ? 18 : 22 }} />
              </Avatar>
              <Typography variant={isMobile ?"h5" :"h4"} sx={{ fontWeight: 800 }}>Examinations</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5, fontWeight: 500, fontSize: isMobile ?'0.75rem' :'0.875rem' }}>
              Check your scheduled exams and take live tests.
            </Typography>
          </Box>
          <Button
            fullWidth={isMobile}
            variant="outlined"
            size={isMobile ?"small" :"medium"}
            startIcon={<HistoryIcon />}
            onClick={() => navigate('/v2/student/exam-results')}
            sx={{ borderRadius: 3, py: isMobile ? 1.2 : 1 }}
          >
            My Results
          </Button>
        </Box>

        {/* Live Banner */}
        {ongoingCount > 0 && (
          <Paper
            component={motion.div}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            elevation={0}
            sx={{
              p: isMobile ? 2 : 3,
              mb: 4,
              borderRadius: 3,
              background:'linear-gradient(135deg, #065f46 0%, #047857 100%)',
              color:'white',
              display:'flex',
              alignItems:'center',
              justifyContent:'space-between',
              flexWrap:'wrap',
              gap: 2,
              border:'1px solid rgba(16, 185, 129, 0.3)',
              boxShadow:'0 8px 24px rgba(16, 185, 129, 0.2)',
            }}
          >
            <Box sx={{ display:'flex', alignItems:'center', gap: isMobile ? 1.5 : 2 }}>
              <Box
                sx={{
                  width: isMobile ? 40 : 48,
                  height: isMobile ? 40 : 48,
                  borderRadius: 2,
                  bgcolor:'rgba(255,255,255,0.2)',
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  animation:'pulse 2s infinite',
                }}
              >
                <LiveIcon sx={{ fontSize: isMobile ? 22 : 28 }} />
              </Box>
              <Box>
                <Typography variant={isMobile ?"subtitle1" :"h6"} sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                  {ongoingCount} Live Exam{ongoingCount > 1 ?'s' :''} Active
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: 500, display:'block' }}>
                  Complete your tests before time runs out.
                </Typography>
              </Box>
            </Box>
            <Button
              fullWidth={isMobile}
              variant="contained"
              sx={{
                bgcolor:'white',
                color:'#065f46',
                fontWeight: 800,
'&:hover': { bgcolor: alpha('#fff', 0.9) },
                borderRadius: 2.5,
                height: isMobile ? 40 :'auto',
                fontSize: isMobile ?'0.75rem' :'0.875rem'
              }}
              onClick={() => setActiveTab('live')}
            >
              View Live Now
            </Button>
          </Paper>
        )}

        {/* Stats Bar */}
        <Paper sx={{ p: isMobile ? 2 : 2.5, mb: 4, borderRadius: 3, display:'flex', gap: isMobile ? 2 : 4, overflowX:'auto', bgcolor: alpha('#6366f1', 0.02), border:'1px solid', borderColor: alpha('#6366f1', 0.08),'&::-webkit-scrollbar': { display:'none' } }}>
          {[
            { label:'Total', value: stats.total, color:'#6366f1' },
            { label:'Live', value: ongoingCount, color:'#10b981' },
            { label:'Upcoming', value: stats.upcoming, color:'#f59e0b' },
            { label:'Expired', value: stats.expired, color:'#94a3b8' },
          ].map((stat, i) => (
            <Box key={i} sx={{ display:'flex', alignItems:'center', gap: 1.5, minWidth: isMobile ? 80 : 120 }}>
              <Box sx={{ width: 8, height: 8, borderRadius:'50%', bgcolor: stat.color }} />
              <Box>
                <Typography variant={isMobile ?"subtitle2" :"h6"} sx={{ fontWeight: 800, lineHeight: 1 }}>{stat.value}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: isMobile ?'0.65rem' :'0.75rem' }}>{stat.label}</Typography>
              </Box>
            </Box>
          ))}
        </Paper>

        {/* Filters */}
        <Box sx={{ mb: 4, display:'flex', flexWrap:'wrap', gap: 2, alignItems:'center' }}>
          <Box sx={{ flexGrow: 1, minWidth: 280 }}>
            <TextField
              fullWidth
              placeholder="Search by exam title or subject..."
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
        </Box>

        {/* Tabs */}
        <Box sx={{ mb: 4, overflowX:'auto','&::-webkit-scrollbar': { display:'none' } }}>
          <Stack direction="row" spacing={1} sx={{ minWidth:'max-content' }}>
            {[
              { key:'all', label:'All', value: stats.total },
              { key:'live', label:'Live', value: ongoingCount, pulse: true },
              { key:'upcoming', label:'Upcoming', value: stats.upcoming },
              { key:'expired', label:'Expired', value: stats.expired },
            ].map((tab) => (
              <Button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                variant={activeTab === tab.key ?'contained' :'outlined'}
                sx={{
                  borderRadius: 2.5,
                  px: isMobile ? 2 : 2.5,
                  py: 1,
                  fontSize: isMobile ?'0.75rem' :'0.875rem',
                  fontWeight: 800,
                  whiteSpace:'nowrap',
                  position:'relative',
                  ...(activeTab === tab.key ? {
                    background:'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    boxShadow:'0 4px 12px rgba(99, 102, 241, 0.3)',
                    color:'white',
                    border:'none'
                  } : {
                    borderColor: alpha('#6366f1', 0.2),
                    color:'text.secondary'
                  }),
                }}
              >
                {tab.pulse && tab.value > 0 && (
                  <Box sx={{
                    position:'absolute',
                    top: 6,
                    right: 6,
                    width: 6,
                    height: 6,
                    borderRadius:'50%',
                    bgcolor:'#ef4444',
                    animation:'blink 1s infinite',
                  }} />
                )}
                {tab.label}
                <Chip
                  label={tab.value}
                  size="small"
                  sx={{
                    ml: 1,
                    height: 18,
                    fontSize:'0.65rem',
                    fontWeight: 800,
                    bgcolor: activeTab === tab.key ?'rgba(255,255,255,0.2)' : alpha('#6366f1', 0.08),
                    color: activeTab === tab.key ?'white' :'#6366f1',
                  }}
                />
              </Button>
            ))}
          </Stack>
        </Box>

        {/* Exams Grid */}
        <Grid container spacing={3}>
          {filteredExams.length === 0 ? (
            <Grid item xs={12}>
              <EmptyState
                type="no-exams"
                size="large"
                actionLabel="Browse More"
                onAction={() => navigate('/exams-page')}
              />
            </Grid>
          ) : (
            filteredExams.map((exam, idx) => {
              const status = getExamStatus(exam.scheduledAt, exam.durationMinutes);
              const isLive = status ==='Ongoing';
              const isExpired = status ==='Expired';
              const diffColor = getDifficultyColor(exam.difficulty);

              return (
                <Grid item xs={12} sm={6} md={4} key={exam._id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card
                      component={motion.div}
                      whileHover={{ y: -6, boxShadow: isLive ?'0 12px 32px rgba(16, 185, 129, 0.2)' :'0 12px 32px rgba(99, 102, 241, 0.1)' }}
                      sx={{
                        height:'100%',
                        border:'1px solid',
                        borderColor: isLive ?'#10b981' : alpha('#6366f1', 0.06),
                        borderWidth: isLive ? 2 : 1,
                        position:'relative',
                        overflow:'hidden',
                      }}
                    >
                      {/* Live top bar */}
                      {isLive && (
                        <Box sx={{
                          position:'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 3,
                          background:'linear-gradient(90deg, #10b981 0%, #6ee7b7 100%)',
                        }} />
                      )}

                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display:'flex', justifyContent:'space-between', mb: 2, alignItems:'flex-start' }}>
                          <Chip
                            label={status.toUpperCase()}
                            size="small"
                            color={isLive ?'success' : isExpired ?'error' :'primary'}
                            sx={{
                              fontWeight: 800,
                              fontSize:'0.65rem',
                              ...(isLive ? { animation:'glow 2s infinite','@keyframes glow': {'0%, 100%': { boxShadow:'0 0 5px rgba(16, 185, 129, 0.3)' },'50%': { boxShadow:'0 0 15px rgba(16, 185, 129, 0.5)' } } } : {}),
                            }}
                          />
                          {exam.difficulty && (
                            <Typography variant="caption" sx={{ color: diffColor, fontWeight: 800, textTransform:'uppercase', fontSize:'0.7rem' }}>
                              {exam.difficulty}
                            </Typography>
                          )}
                        </Box>

                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, minHeight: 52, lineHeight: 1.3 }}>
                          {exam.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontWeight: 500, minHeight: 22 }}>
                          {exam.subject}
                        </Typography>

                        <Grid container spacing={2} sx={{ mb: 3 }}>
                          <Grid item xs={4}>
                            <Box sx={{ textAlign:'center', p: 1.5, borderRadius: 2, bgcolor: alpha('#6366f1', 0.04), border:'1px solid', borderColor: alpha('#6366f1', 0.06) }}>
                              <ClockIcon sx={{ fontSize: 18, color:'primary.main', mb: 0.5 }} />
                              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{exam.durationMinutes}m</Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>TIME</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={4}>
                            <Box sx={{ textAlign:'center', p: 1.5, borderRadius: 2, bgcolor: alpha('#f59e0b', 0.04), border:'1px solid', borderColor: alpha('#f59e0b', 0.06) }}>
                              <StarIcon sx={{ fontSize: 18, color:'warning.main', mb: 0.5 }} />
                              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{exam.totalMarks}</Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>MARKS</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={4}>
                            <Box sx={{ textAlign:'center', p: 1.5, borderRadius: 2, bgcolor: alpha('#10b981', 0.04), border:'1px solid', borderColor: alpha('#10b981', 0.06) }}>
                              <TrophyIcon sx={{ fontSize: 18, color:'success.main', mb: 0.5 }} />
                              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{exam.passingMarks || Math.floor(exam.totalMarks * 0.4)}</Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>PASS</Typography>
                            </Box>
                          </Grid>
                        </Grid>

                        <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: alpha('#64748b', 0.02), border:'none', borderRadius: 2 }}>
                          <Box sx={{ display:'flex', alignItems:'center', gap: 1 }}>
                            <ScheduleIcon sx={{ fontSize: 16, color:'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>SCHEDULED FOR</Typography>
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.5 }}>
                            {exam.scheduledAt ? dayjs(exam.scheduledAt).format('MMM DD, YYYY  hh:mm A') :'TBA'}
                          </Typography>
                        </Paper>

                        <Button
                          fullWidth
                          variant={isLive ?"contained" :"outlined"}
                          color={isLive ?"success" :"primary"}
                          disabled={isExpired}
                          startIcon={isLive ? <PlayIcon /> : <ChevronRightIcon />}
                          onClick={() => {
                            if (isLive) navigate(`/student/exams/ongoing/${exam._id}`);
                            else navigate(`/v2/student/exams/details/${exam._id}`);
                          }}
                          sx={{
                            py: 1.2,
                            fontWeight: 800,
                            ...(isLive ? { background:'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow:'0 4px 12px rgba(16, 185, 129, 0.3)' } : {}),
                          }}
                        >
                          {isLive ?'START EXAM' : isExpired ?'EXPIRED' :'VIEW DETAILS'}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              );
            })
          )}
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default ExamsList;