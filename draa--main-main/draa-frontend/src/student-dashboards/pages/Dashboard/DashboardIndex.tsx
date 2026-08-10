import React from'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  IconButton,
  LinearProgress,
  alpha,
  Paper,
  Chip,
  Stack,
  Tooltip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slide
} from'@mui/material';
import {
  Close as CloseIcon,
  PlayArrow as PlayIcon,
  TrendingUp as TrendIcon,
  School as CourseIcon,
  EmojiEvents as TrophyIcon,
  Timer as ClockIcon,
  LocalFireDepartment as StreakIcon,
  ChevronRight as ChevronRightIcon,
  NotificationsNone as BellIcon,
  AutoGraph as GraphIcon,
  MenuBook as BookIcon,
  WorkspacePremium as PremiumIcon,
  Explore as ExploreIcon,
  ArrowForward as ArrowIcon,
  EmojiEvents as MedalIcon,
  Speed as SpeedIcon,
  CalendarMonth as CalendarIcon,
  Assignment as AssignmentIcon,
  EventNote as EventNoteIcon,
  BarChart as ResultIcon,
  CardGiftcard as RewardIcon,
  Favorite as WishlistIcon
} from'@mui/icons-material';
import { motion, AnimatePresence } from'framer-motion';
import { useDashboardStats } from'../../hooks/useDashboardStats';
import DashboardLayout from'../../layouts/DashboardLayout';
import { useNavigate } from'react-router-dom';
import { useStudentProfile } from'../../hooks/useStudentProfile';
import { BACKEND_UPLOAD_URL } from'../../../url';
import uri from'../../../url';
import DashboardLoader from'../../components/DashboardLoader';
import EmptyState from'../../components/EmptyState';
import ToppersWidget from'../../components/ToppersWidget';
import usePageTitle from '../../../hooks/usePageTitle';

const Transition = React.forwardRef(function Transition(
  props: any,
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const DashboardIndex: React.FC = () => {
  const { profile: user, loading: profileLoading } = useStudentProfile();
  const { stats, loading, bookCount, courseCount, testCount } = useDashboardStats(user?.id || user?._id, user?.token);
  const navigate = useNavigate();
  usePageTitle('Dashboard | Draa');

  const [activitiesDialogOpen, setActivitiesDialogOpen] = React.useState(false);
  const [fullActivities, setFullActivities] = React.useState<any[]>([]);
  const [loadingFullActivities, setLoadingFullActivities] = React.useState(false);
  const [testChooserOpen, setTestChooserOpen] = React.useState(false);
  const [learningPathOpen, setLearningPathOpen] = React.useState(false);

  const handleViewAllActivities = async () => {
    setActivitiesDialogOpen(true);
    if (fullActivities.length > 0) return;

    try {
      setLoadingFullActivities(true);
      const studentId = user?.id || user?._id;
      const res = await fetch(`${uri}/student/dashboard/analytics/recent-activity/${studentId}?limit=30`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const data = await res.json();
      if (data.success) {
        setFullActivities(data.data);
      }
    } catch (error) {
      console.error("Error fetching full activities:", error);
    } finally {
      setLoadingFullActivities(false);
    }
  };

  if (loading || profileLoading || !stats || !user) {
    return (
      <DashboardLayout>
        <DashboardLoader />
      </DashboardLayout>
    );
  }

  const mainStats = [
    { label:'Courses', value: courseCount, icon: <CourseIcon />, color:'#6366f1', sub:'Enrolled', gradient:'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(99,102,241,0.05) 100%)' },
    { label:'Avg Score', value: `${stats.exams.averageScore}%`, icon: <TrendIcon />, color:'#f59e0b', sub:'Accuracy', gradient:'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(245,158,11,0.05) 100%)' },
    { label:'Study Hours', value: `${stats.courses.totalHours}h`, icon: <ClockIcon />, color:'#ec4899', sub:'Total', gradient:'linear-gradient(135deg, rgba(236,72,153,0.1) 0%, rgba(236,72,153,0.05) 100%)' },
    { label:'Streak', value: `${stats.learningStreak.currentStreak}d`, icon: <StreakIcon />, color:'#ef4444', sub:'Consecutive', gradient:'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(239,68,68,0.05) 100%)' },
  ];

  const quickActions = [
    { label:'Browse Courses', icon: <BookIcon />, color:'#6366f1', path:'/courses' },
    { label:'Take Test', icon: <GraphIcon />, color:'#10b981', path:'__openTestChooser' },
    { label:'Live Sessions', icon: <ExploreIcon />, color:'#f59e0b', path:'/v2/student/live-sessions' },
    { label:'My Results', icon: <ResultIcon />, color:'#8b5cf6', path:'/v2/student/exam-results' },
    { label:'My Rewards', icon: <RewardIcon />, color:'#ec4899', path:'/v2/student/rewards' },
    { label:'Wishlist', icon: <WishlistIcon />, color:'#ef4444', path:'/v2/student/wishlist' },
  ];

  return (
    <DashboardLayout>
      <Box component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

        {/* Welcome Header */}
        <Box sx={{ mb: 4, display:'flex', justifyContent:'space-between', alignItems: { xs:'flex-start', md:'flex-end' }, flexDirection: { xs:'column', md:'row' }, gap: 2 }}>
          <Box>
            <Box sx={{ display:'flex', alignItems:'center', gap: 2, mb: 1, flexWrap:'wrap' }}>
              <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs:'1.5rem', sm:'2rem', md:'2.125rem' } }}>
                Welcome back, {user.name?.split('')[0] ||'Student'}!
              </Typography>
              <Chip
                icon={<MedalIcon sx={{ fontSize:'14px !important' }} />}
                label={`${stats.learningStreak.currentStreak} Day Streak`}
                size="small"
                sx={{
                  bgcolor: alpha('#ef4444', 0.08),
                  color:'#ef4444',
                  fontWeight: 800,
                  fontSize:'0.7rem',
                  border:'1px solid',
                  borderColor: alpha('#ef4444', 0.2),
                }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              {new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
              &nbsp;&nbsp;You have completed <b style={{ color:'#818cf8' }}>{stats.courses.completionRate}%</b> of your curriculum.
            </Typography>
          </Box>
          <Box sx={{ display:'flex', gap: 1.5, width: { xs:'100%', sm:'auto' }, flexDirection: { xs:'column', sm:'row' } }}>
            <Button
              variant="outlined"
              onClick={() => setTestChooserOpen(true)}
              startIcon={<GraphIcon sx={{ fontSize: 18 }} />}
              sx={{ borderRadius: 2, flex: { xs: 1, sm:'none' } }}
            >
              Practice Test
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate(`/v2/student/my-courses/${user.id || user._id}`)}
              startIcon={<PlayIcon />}
              sx={{
                flex: { xs: 1, sm:'none' },
                background:'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                boxShadow:'0 4px 14px rgba(99, 102, 241, 0.35)',
'&:hover': {
                  background:'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  boxShadow:'0 6px 20px rgba(99, 102, 241, 0.45)',
                },
              }}
            >
              Continue Learning
            </Button>
          </Box>
        </Box>

        {/* Hero Card */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            mb: 4,
            borderRadius: 3,
            background:'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
            color:'white',
            position:'relative',
            overflow:'hidden',
            border:'1px solid rgba(99, 102, 241, 0.3)',
          }}
        >
          {/* Decorative elements */}
          <Box sx={{ position:'absolute', top: -60, right: -40, width: 280, height: 280, borderRadius:'50%', background:'rgba(99, 102, 241, 0.25)', filter:'blur(60px)', pointerEvents:'none' }} />
          <Box sx={{ position:'absolute', bottom: -80, left: -20, width: 220, height: 220, borderRadius:'50%', background:'rgba(236, 72, 153, 0.15)', filter:'blur(50px)', pointerEvents:'none' }} />
          <Box sx={{ position:'absolute', top: 20, right: 40, width: 60, height: 60, borderRadius:'50%', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.05)', pointerEvents:'none' }} />
          <Box sx={{ position:'absolute', bottom: 40, right: 120, width: 30, height: 30, borderRadius:'50%', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.04)', pointerEvents:'none' }} />

          <Grid container spacing={3} alignItems="center" sx={{ position:'relative', zIndex: 2 }}>
            <Grid item xs={12} md={7}>
              <Chip
                icon={<PremiumIcon sx={{ fontSize:'14px !important', color: '#a5b4fc !important' }} />}
                label="Dashboard overview"
                size="small"
                sx={{
                  bgcolor:'rgba(255,255,255,0.1) !important',
                  color:'#a5b4fc !important',
                  fontWeight: 800,
                  letterSpacing: 1,
                  border:'1px solid rgba(255,255,255,0.15) !important',
                  mb: 1.5,
                }}
              />
              <Typography variant="h3" sx={{ mt: 1, mb: 2, fontWeight: 800, lineHeight: 1.2, color: 'white !important' }}>
                Master Your Future with Draa
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mb: 3, maxWidth: 450, fontWeight: 500, color: 'white !important' }}>
                You're on a <strong style={{ color:'#fcd34d' }}>{stats.learningStreak.currentStreak}-day streak</strong>! Keep going to reach your goal.
              </Typography>
              <Button
                variant="contained"
                onClick={() => setLearningPathOpen(true)}
                sx={{
                  background:'white !important',
                  color:'#1e1b4b !important',
                  fontWeight: 800,
                  '&:hover': { background: `${alpha('#fff', 0.9)} !important` },
                  borderRadius: 2,
                  px: 3,
                }}
              >
                View Learning Path
              </Button>
            </Grid>
            <Grid item xs={12} md={5} sx={{ display:'flex', justifyContent: { xs:'flex-start', md:'center' } }}>
              <Box sx={{ position:'relative' }}>
                <Avatar
                  src={user.avatar ? `${BACKEND_UPLOAD_URL}/${user.avatar}` :''}
                  sx={{
                    width: 140,
                    height: 140,
                    border:'4px solid rgba(255,255,255,0.15)',
                    boxShadow:'0 20px 40px rgba(0,0,0,0.3)',
                    fontSize:'3rem',
                    fontWeight: 800
                  }}
                >
                  {user.name?.charAt(0)}
                </Avatar>
                <Box
                  sx={{
                    position:'absolute',
                    bottom: 8,
                    right: 8,
                    bgcolor:'#10b981',
                    width: 22,
                    height: 22,
                    borderRadius:'50%',
                    border:'3px solid #1e1b4b',
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center',
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="white">
                    <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Box>
                {/* Floating badge */}

              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Stat Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {mainStats.map((stat, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                sx={{
                  border:'1px solid',
                  borderColor:'transparent',
                  background: stat.gradient,
                  cursor:'pointer',
                  transition:'all 0.3s ease',
'&:hover': {
                    transform:'translateY(-6px)',
                    boxShadow: `0 12px 28px ${alpha(stat.color, 0.2)}`,
                    borderColor: alpha(stat.color, 0.2),
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display:'flex', justifyContent:'space-between', mb: 2.5, alignItems:'flex-start' }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: alpha(stat.color, 0.12),
                        color: stat.color,
                        display:'flex',
                        alignItems:'center',
                        justifyContent:'center',
'& svg': { fontSize: 22 },
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Box sx={{ display:'flex', gap: 0.5 }}>
                      <SpeedIcon sx={{ fontSize: 14, color:'success.main' }} />
                      <Typography variant="caption" sx={{ color:'success.main', fontWeight: 700 }}>+12.5%</Typography>
                    </Box>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, color:'text.primary' }}>{stat.value}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color:'text.secondary', mb: 1.5 }}>{stat.label}</Typography>
                  <Divider sx={{ mb: 1.5, opacity: 0.3 }} />
                  <Typography variant="caption" sx={{ color:'text.disabled', fontWeight: 600 }}>{stat.sub}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Quick Actions */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, color:'text.secondary' }}>
            QUICK ACTIONS
          </Typography>
          <Grid container spacing={2}>
            {quickActions.map((action, i) => (
              <Grid item xs={6} sm={4} md={2} key={i}>
                <Card
                  component={motion.div}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    action.path === '__openTestChooser'
                      ? setTestChooserOpen(true)
                      : navigate(action.path)
                  }
                  sx={{
                    width: '100%',
                    p: 2.5,
                    cursor:'pointer',
                    border:'1px solid',
                    borderColor: alpha(action.color, 0.15),
                    bgcolor: alpha(action.color, 0.03),
                    transition:'all 0.3s ease',
                    '&:hover': {
                      bgcolor: alpha(action.color, 0.08),
                      boxShadow: `0 6px 20px ${alpha(action.color, 0.15)}`,
                      borderColor: alpha(action.color, 0.3),
                    },
                  }}
                >
                  <Box sx={{ display:'flex', alignItems:'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: alpha(action.color, 0.12), color: action.color, width: 36, height: 36 }}>
                      {action.icon}
                    </Avatar>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 800,
                        color: action.color,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {action.label}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Grid container spacing={3}>
          {/* Recent Activity */}
          <Grid item xs={12} md={8}>
            <Card sx={{ height:'100%', border:'1px solid', borderColor: alpha('#6366f1', 0.08) }}>
              <Box sx={{ p: 3, display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid', borderColor:'divider' }}>
                <Box sx={{ display:'flex', alignItems:'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: alpha('#6366f1', 0.1), color:'#6366f1', width: 32, height: 32 }}>
                    <CalendarIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>Recent Activities</Typography>
                </Box>
                <Button
                  endIcon={<ChevronRightIcon />}
                  size="small"
                  sx={{ fontWeight: 700 }}
                  onClick={handleViewAllActivities}
                >
                  View All
                </Button>
              </Box>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{
                  maxHeight: 450,
                  overflowY:'auto',
'&::-webkit-scrollbar': { width:'4px' },
'&::-webkit-scrollbar-thumb': { bgcolor: alpha('#6366f1', 0.1), borderRadius:'10px' },
'&::-webkit-scrollbar-track': { bgcolor:'transparent' }
                }}>
                  {stats.recentActivity.length === 0 ? (
                    <Box sx={{ p: 4 }}>
                      <EmptyState type="no-data" size="small" />
                    </Box>
                  ) : (
                    stats.recentActivity.map((activity, idx) => (
                      <Box
                        key={activity.id}
                        component={motion.div}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        sx={{
                          p: 3,
                          display:'flex',
                          alignItems:'center',
                          gap: 2,
                          borderBottom: idx === stats.recentActivity.length - 1 ?'none' :'1px solid',
                          borderColor:'divider',
                          cursor:'pointer',
                          transition:'background 0.2s',
'&:hover': { bgcolor: alpha('#6366f1', 0.03) },
                        }}
                      >
                        <Avatar sx={{ bgcolor: alpha(activity.color ||'#6366f1', 0.1), color: activity.color ||'#6366f1', width: 44, height: 44, fontSize:'1.2rem' }}>
                          {activity.icon || <CourseIcon />}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.3 }}>{activity.title}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>{activity.description}</Typography>
                        </Box>
                        <Box sx={{ textAlign:'right', minWidth: 70 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color:'#6366f1' }}>
                            {activity.progress ? `${activity.progress}%` : activity.score ? `${activity.score}%` :''}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{activity.relativeTime}</Typography>
                        </Box>
                      </Box>
                    ))
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display:'flex', flexDirection:'column', gap: 3 }}>
              {/* Toppers Widget */}
              {/* <ToppersWidget /> */}

              {/* Deadlines Card */}
              <Card sx={{ border:'1px solid', borderColor: alpha('#6366f1', 0.08) }}>
                <Box sx={{ p: 3, pb: 0, display:'flex', gap: 1.5, alignItems:'center' }}>
                  <Avatar sx={{ bgcolor: alpha('#6366f1', 0.1), color:'#6366f1', width: 36, height: 36 }}>
                    <BellIcon />
                  </Avatar>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Upcoming Deadlines</Typography>
                </Box>
                <CardContent sx={{ pt: 2 }}>
                  {stats.upcomingDeadlines.length === 0 ? (
                    <Box sx={{ textAlign:'center', py: 3 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                        No immediate deadlines. Keep crushing it!
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        endIcon={<ArrowIcon />}
                        onClick={() => setTestChooserOpen(true)}
                        sx={{ mt: 2, fontWeight: 700 }}
                      >
                        Start a test
                      </Button>
                    </Box>
                  ) : (
                    stats.upcomingDeadlines.slice(0, 3).map((item) => (
                      <Box
                        key={item.id}
                        sx={{
                          mb: 2,
                          p: 2,
                          borderRadius: 2,
                          bgcolor: alpha(item.priority ==='high' ?'#ef4444' :'#6366f1', 0.04),
                          border:'1px solid',
                          borderColor: alpha(item.priority ==='high' ?'#ef4444' :'#6366f1', 0.12),
                          transition:'all 0.2s',
'&:hover': {
                            bgcolor: alpha(item.priority ==='high' ?'#ef4444' :'#6366f1', 0.08),
                            transform:'translateX(4px)',
                          },
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>{item.title}</Typography>
                        <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <Typography variant="caption" sx={{ color: item.priority ==='high' ?'error.main' :'primary.main', fontWeight: 700 }}>
                            {item.daysUntil === 0 ?'Due Today' : `${item.daysUntil} days left`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{item.dueDateFormatted}</Typography>
                        </Box>
                      </Box>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Digital Library Card */}
              <Card
                component={motion.div}
                whileHover={{ scale: 1.02 }}
                sx={{
                  background:'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color:'white',
                  border:'none',
                  cursor:'pointer',
                  overflow:'hidden',
                  position:'relative',
                }}
                onClick={() => navigate(`/v2/student/my-books/purchased/${user.id || user._id}`)}
              >
                {/* Decorative circles */}
                <Box sx={{ position:'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius:'50%', background:'rgba(255,255,255,0.1)', pointerEvents:'none' }} />
                <Box sx={{ position:'absolute', bottom: -30, left: -10, width: 100, height: 100, borderRadius:'50%', background:'rgba(255,255,255,0.05)', pointerEvents:'none' }} />
                <CardContent sx={{ p: 3, position:'relative', zIndex: 1 }}>
                  <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, opacity: 0.9, mb: 0.5, color: 'white !important' }}>Digital Library</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, color: 'white !important' }}>{bookCount} Books</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.7, fontWeight: 500, color: 'white !important' }}>Available to read</Typography>
                    </Box>
                    <Avatar sx={{ bgcolor:'rgba(255,255,255,0.2)', color:'white', width: 44, height: 44 }}>
                      <BookIcon />
                    </Avatar>
                  </Box>
                  <Box sx={{ mt: 3 }}>
                    <Box sx={{ display:'flex', justifyContent:'space-between', mb: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color:'rgba(255, 255, 255, 0.97) !important' }}>Reading Progress</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color:'#fcd34d !important' }}>75%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={75}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor:'rgba(255,255,255,0.2)',
'& .MuiLinearProgress-bar': { bgcolor:'white' },
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Full Activity Timeline Modal */}
      <Dialog
        fullWidth
        maxWidth="sm"
        open={activitiesDialogOpen}
        TransitionComponent={Transition}
        onClose={() => setActivitiesDialogOpen(false)}
        PaperProps={{
          sx: { borderRadius: 4, overflow:'hidden' }
        }}
      >
        <DialogTitle sx={{ p: 3, display:'flex', justifyContent:'space-between', alignItems:'center', bgcolor: alpha('#6366f1', 0.04) }}>
          <Box sx={{ display:'flex', alignItems:'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor:'#6366f1', color:'white', width: 40, height: 40 }}>
              <CalendarIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Activity History</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Your learning journey timeline</Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setActivitiesDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, maxHeight:'70vh' }}>
          {loadingFullActivities ? (
            <Box sx={{ p: 6, textAlign:'center' }}>
              <LinearProgress sx={{ borderRadius: 2 }} />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display:'block', fontWeight: 600 }}>Loading full history...</Typography>
            </Box>
          ) : (
            <Box sx={{ p: 1 }}>
              {fullActivities.map((activity, idx) => (
                <Box
                  key={activity.id}
                  sx={{
                    p: 2.5,
                    display:'flex',
                    alignItems:'flex-start',
                    gap: 2,
                    borderBottom: idx === fullActivities.length - 1 ?'none' :'1px solid',
                    borderColor:'divider',
                  }}
                >
                  <Avatar sx={{ bgcolor: alpha(activity.color ||'#6366f1', 0.1), color: activity.color ||'#6366f1', width: 44, height: 44, fontSize:'1.2rem', mt: 0.5 }}>
                    {activity.icon || <CourseIcon />}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', mb: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{activity.title}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>{activity.relativeTime}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 1.5 }}>{activity.description}</Typography>

                    {activity.progress !== undefined && (
                      <Box sx={{ width:'100%', maxWidth: 200 }}>
                        <Box sx={{ display:'flex', justifyContent:'space-between', mb: 0.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 800 }}>Progress</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 800, color:'#6366f1' }}>{activity.progress}%</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={activity.progress} sx={{ height: 4, borderRadius: 2 }} />
                      </Box>
                    )}

                    {activity.score !== undefined && (
                      <Chip
                        label={`Score: ${activity.score}%`}
                        size="small"
                        sx={{ fontWeight: 800, bgcolor: alpha(activity.color, 0.1), color: activity.color }}
                      />
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop:'1px solid', borderColor:'divider' }}>
          <Button onClick={() => setActivitiesDialogOpen(false)} sx={{ fontWeight: 700 }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Test Type Chooser Modal */}
      <Dialog
        fullWidth
        maxWidth="sm"
        open={testChooserOpen}
        TransitionComponent={Transition}
        onClose={() => setTestChooserOpen(false)}
        PaperProps={{
          sx: { borderRadius: 4, overflow:'hidden' }
        }}
      >
        <DialogTitle sx={{ p: 3, display:'flex', justifyContent:'space-between', alignItems:'center', bgcolor: alpha('#6366f1', 0.04) }}>
          <Box sx={{ display:'flex', alignItems:'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor:'#6366f1', color:'white', width: 40, height: 40 }}>
              <GraphIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Choose Test Type</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Pick where you want to practice today
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setTestChooserOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body1" sx={{ fontWeight: 600, color:'text.secondary', mb: 3, textAlign:'center' }}>
            Would you like to give <b style={{ color:'#6366f1' }}>Tests</b> or <b style={{ color:'#10b981' }}>Course Exams</b>?
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Card
                component={motion.div}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setTestChooserOpen(false);
                  const studentId = user?.id || user?._id;
                  navigate(studentId ? `/v2/student/my-test-series/${studentId}` :'/v2/student/my-test-series');
                }}
                sx={{
                  p: 3,
                  cursor:'pointer',
                  border:'2px solid',
                  borderColor: alpha('#6366f1', 0.15),
                  bgcolor: alpha('#6366f1', 0.03),
                  textAlign:'center',
                  transition:'all 0.25s ease',
'&:hover': {
                    borderColor:'#6366f1',
                    bgcolor: alpha('#6366f1', 0.08),
                    boxShadow: `0 10px 24px ${alpha('#6366f1', 0.2)}`,
                  },
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: alpha('#6366f1', 0.12),
                    color:'#6366f1',
                    width: 56,
                    height: 56,
                    mx:'auto',
                    mb: 2,
                  }}
                >
                  <EventNoteIcon sx={{ fontSize: 30 }} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 800, color:'#6366f1', mb: 0.5 }}>
                  Tests
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, color:'text.secondary' }}>
                  Practice mock tests linked to your enrolled courses
                </Typography>
                <Chip
                  label="My Test Series"
                  size="small"
                  sx={{
                    mt: 2,
                    fontWeight: 700,
                    bgcolor: alpha('#6366f1', 0.1),
                    color:'#6366f1',
                  }}
                />
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card
                component={motion.div}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setTestChooserOpen(false);
                  navigate('/v2/student/my-exams');
                }}
                sx={{
                  p: 3,
                  cursor:'pointer',
                  border:'2px solid',
                  borderColor: alpha('#10b981', 0.15),
                  bgcolor: alpha('#10b981', 0.03),
                  textAlign:'center',
                  transition:'all 0.25s ease',
'&:hover': {
                    borderColor:'#10b981',
                    bgcolor: alpha('#10b981', 0.08),
                    boxShadow: `0 10px 24px ${alpha('#10b981', 0.2)}`,
                  },
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: alpha('#10b981', 0.12),
                    color:'#10b981',
                    width: 56,
                    height: 56,
                    mx:'auto',
                    mb: 2,
                  }}
                >
                  <AssignmentIcon sx={{ fontSize: 30 }} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 800, color:'#10b981', mb: 0.5 }}>
                  Course Exams
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, color:'text.secondary' }}>
                  Scheduled examinations across your enrolled exams
                </Typography>
                <Chip
                  label="My Exams"
                  size="small"
                  sx={{
                    mt: 2,
                    fontWeight: 700,
                    bgcolor: alpha('#10b981', 0.1),
                    color:'#10b981',
                  }}
                />
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>


        {/* Learning Path Dialog */}

        <Dialog 
          open={learningPathOpen} 
          onClose={() => setLearningPathOpen(false)}
          TransitionComponent={Transition}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3, overflow: 'hidden' }
          }}
        >
          <DialogTitle sx={{ 
            pb: 2, 
            pt: 3, 
            px: 3, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
                Explore Learning Path
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Choose a module to continue your learning journey
              </Typography>
            </Box>
            <IconButton onClick={() => setLearningPathOpen(false)} sx={{ bgcolor: alpha('#64748b', 0.1) }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 3, bgcolor: alpha('#64748b', 0.02) }}>
            <Grid container spacing={3}>
              {[
                { label: 'My Test Series', icon: <EventNoteIcon sx={{ fontSize: 30 }} />, color: '#6366f1', path: user?.id || user?._id ? `/v2/student/my-test-series/${user.id || user._id}` : '/v2/student-dashboard', desc: 'Practice mock tests' },
                { label: 'Exams', icon: <AssignmentIcon sx={{ fontSize: 30 }} />, color: '#10b981', path: '/v2/student/my-exams', desc: 'Attempt standard exams' },
                { label: 'Live Sessions', icon: <PlayIcon sx={{ fontSize: 30 }} />, color: '#f59e0b', path: '/v2/student/live-sessions', desc: 'Join ongoing classes' },
                { label: 'Results', icon: <ResultIcon sx={{ fontSize: 30 }} />, color: '#8b5cf6', path: '/v2/student/exam-results', desc: 'Check your performance' },
              ].map((item, i) => (
                <Grid item xs={12} sm={6} key={i}>
                  <Card
                    component={motion.div}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setLearningPathOpen(false);
                      navigate(item.path);
                    }}
                    sx={{
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: alpha(item.color, 0.15),
                      bgcolor: alpha(item.color, 0.03),
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: alpha(item.color, 0.08),
                        boxShadow: `0 8px 24px ${alpha(item.color, 0.15)}`,
                        borderColor: alpha(item.color, 0.3),
                      },
                      height: '100%'
                    }}
                  >
                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                      <Avatar
                        sx={{
                          bgcolor: alpha(item.color, 0.12),
                          color: item.color,
                          width: 60,
                          height: 60,
                          mx: 'auto',
                          mb: 2,
                        }}
                      >
                        {item.icon}
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: item.color, mb: 0.5 }}>
                        {item.label}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                        {item.desc}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </DialogContent>
        </Dialog>

    </DashboardLayout>
  );
};

export default DashboardIndex;