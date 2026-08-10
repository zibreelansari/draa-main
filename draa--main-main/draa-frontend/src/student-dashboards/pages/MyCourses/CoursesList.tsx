import React, { useState, useMemo } from'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Avatar,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  Chip,
  LinearProgress,
  alpha,
  Paper,
  IconButton,
  Rating,
  Stack,
  Divider,
  Tooltip,
  useMediaQuery,
  useTheme
} from'@mui/material';
import { getImageUrl } from '../../../url';
import {
  Search as SearchIcon,
  PlayCircleOutline as PlayIcon,
  Person as TeacherIcon,
  Timer as ClockIcon,
  Sort as SortIcon,
  TrendingUp as TrendIcon,
  CheckCircle as CheckIcon,
  MenuBook as BookIcon,
  ChevronRight as ChevronRightIcon,
  AutoGraph as GraphIcon
} from'@mui/icons-material';
import { motion, AnimatePresence } from'framer-motion';
import { useStudentCourses, Course } from'../../hooks/useStudentCourses';
// import Breadcrumb from'../../../components/common/Breadcrumb';
import DashboardLayout from'../../layouts/DashboardLayout';
import { useNavigate, useParams } from'react-router-dom';
import EmptyState from'../../components/EmptyState';
import DashboardLoader from'../../components/DashboardLoader';
import usePageTitle from '../../../hooks/usePageTitle';

const CoursesList: React.FC = () => {
  const { studentId: urlStudentId } = useParams<{ studentId: string }>();
  const user = JSON.parse(localStorage.getItem('edudocs') ||'{}');

  // Use ID from URL if it's a valid ObjectId, otherwise fallback to localStorage
  const isValidObjectId = (id?: string) => id && id.length === 24 && /^[0-9a-fA-F]+$/.test(id);
  const effectiveStudentId = isValidObjectId(urlStudentId) ? urlStudentId : (user.id || user._id);

  const { courses, loading, progressLoading, error } = useStudentCourses(
    effectiveStudentId,
    user.token,
    user.name,
    user.email
  );
  const navigate = useNavigate();
  usePageTitle('My Courses | Draa');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isExtraSmall = useMediaQuery(theme.breakpoints.down('xs'));

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const filteredCourses = useMemo(() => {
    let result = [...courses];

    if (activeTab ==='in-progress') {
      result = result.filter(c => (c.progress || 0) > 0 && (c.progress || 0) < 100);
    } else if (activeTab ==='completed') {
      result = result.filter(c => (c.progress || 0) === 100);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.course.title.toLowerCase().includes(q) ||
        c.course.teacher_details?.tname.toLowerCase().includes(q)
      );
    }

    if (sortBy ==='title') {
      result.sort((a, b) => a.course.title.localeCompare(b.course.title));
    } else if (sortBy ==='progress') {
      result.sort((a, b) => (b.progress || 0) - (a.progress || 0));
    } else {
      result.sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
    }

    return result;
  }, [courses, activeTab, searchQuery, sortBy]);

  const tabCounts = {
    all: courses.length,
'in-progress': courses.filter(c => (c.progress || 0) > 0 && (c.progress || 0) < 100).length,
    completed: courses.filter(c => (c.progress || 0) === 100).length,
  };

  if (loading && courses.length === 0) {
    return (
      <DashboardLayout>
        <DashboardLoader />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Modern Hero Section */}
        <Box sx={{ mb: 4, mx: { xs: -2, sm: -3, md: -4 }, mt: { xs: -2, sm: -3, md: -4 } }}>
          {/* <Breadcrumb
            title="My Learning Journey"
            subtitle="Access and manage all your enrolled courses, track your progress, and continue mastering your skills."
            category="Dashboard"
            paths={[{ pathName:'My Courses' }]}
            showSearch={false}
            stats={[
              { label:'Total Enrolled', value: String(tabCounts.all) },
              { label:'In Progress', value: String(tabCounts['in-progress']) },
              { label:'Completed', value: String(tabCounts.completed) }
            ]}
          /> */}
        </Box>

        {/* Existing Content Header */}
        <Box sx={{ mb: 4, display:'flex', justifyContent:'space-between', alignItems: isMobile ?'flex-start' :'center', flexWrap:'wrap', gap: 2 }}>
          <Box sx={{ flex: 1, minWidth: isMobile ?'100%' :'auto' }}>
            <Box sx={{ display:'flex', alignItems:'center', gap: isMobile ? 1.5 : 2, mb: 1 }}>
              <Avatar sx={{ bgcolor: alpha('#6366f1', 0.1), color:'#6366f1', width: isMobile ? 32 : 40, height: isMobile ? 32 : 40 }}>
                <BookIcon sx={{ fontSize: isMobile ? 18 : 22 }} />
              </Avatar>
              <Typography variant={isMobile ?"h5" :"h4"} sx={{ fontWeight: 800 }}>My Learning Journey</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5, fontWeight: 500, fontSize: isMobile ?'0.75rem' :'0.875rem' }}>
              Manage your enrolled courses and track your progress in real-time.
            </Typography>
          </Box>
          <Button
            fullWidth={isMobile}
            variant="contained"
            startIcon={<GraphIcon />}
            onClick={() => navigate('/courses')}
            sx={{
              background:'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              boxShadow:'0 4px 14px rgba(99, 102, 241, 0.35)',
'&:hover': { background:'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' },
              height: isMobile ? 48 :'auto',
              borderRadius: 3
            }}
          >
            Browse Courses
          </Button>
        </Box>

        {/* Stats Summary Bar */}
        <Paper sx={{ p: isMobile ? 2 : 2.5, mb: 4, borderRadius: 3, display:'flex', gap: isMobile ? 2 : 4, overflowX:'auto', bgcolor: alpha('#6366f1', 0.02), border:'1px solid', borderColor: alpha('#6366f1', 0.08),'&::-webkit-scrollbar': { display:'none' } }}>
          {[
            { label:'Total', value: courses.length, color:'#6366f1' },
            { label:'Progress', value: tabCounts['in-progress'], color:'#f59e0b' },
            { label:'Done', value: tabCounts['completed'], color:'#10b981' },
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

        {/* Filters & Actions bar */}
        <Box sx={{ mb: 4, display:'flex', flexWrap:'wrap', gap: 2, alignItems:'center' }}>
          <Box sx={{ flexGrow: 1, minWidth: 280 }}>
            <TextField
              fullWidth
              placeholder="Search courses or instructors..."
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
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            size="small"
            startAdornment={<SortIcon sx={{ mr: 1, fontSize: 18, color:'text.secondary' }} />}
            sx={{ borderRadius: 2, bgcolor:'background.paper', minWidth: 160 }}
          >
            <MenuItem value="recent">Most Recent</MenuItem>
            <MenuItem value="title">By Title</MenuItem>
            <MenuItem value="progress">By Progress</MenuItem>
          </Select>
        </Box>

        {/* Status Tabs */}
        <Box sx={{ borderBottom:'1px solid', borderColor:'divider', mb: 4, overflowX:'auto','&::-webkit-scrollbar': { display:'none' } }}>
          <Stack direction="row" spacing={0.5} sx={{ minWidth:'max-content', pb: 0.5 }}>
            {[
              { key:'all', label:'All Courses' },
              { key:'in-progress', label:'In Progress' },
              { key:'completed', label:'Completed' },
            ].map((tab) => (
              <Button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                variant={activeTab === tab.key ?'contained' :'text'}
                sx={{
                  borderRadius: 2,
                  px: isMobile ? 1.5 : 2.5,
                  py: 1,
                  fontSize: isMobile ?'0.75rem' :'0.875rem',
                  fontWeight: 800,
                  whiteSpace:'nowrap',
                  color: activeTab === tab.key ?'white' :'text.secondary',
                  bgcolor: activeTab === tab.key ?'#6366f1' :'transparent',
'&:hover': { bgcolor: activeTab === tab.key ?'#4f46e5' : alpha('#6366f1', 0.05) }
                }}
              >
                {tab.label}
                <Chip
                  label={tabCounts[tab.key as keyof typeof tabCounts]}
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

        {/* Courses Grid */}
        <AnimatePresence mode="popLayout">
          <Grid container spacing={3}>
            {filteredCourses.length === 0 ? (
              <Grid item xs={12}>
                <EmptyState
                  type="no-courses"
                  size="large"
                  actionLabel="Browse Courses"
                  onAction={() => navigate('/courses')}
                />
              </Grid>
            ) : (
              filteredCourses.map((item, idx) => (
                <Grid item xs={12} sm={6} md={4} key={item.courseId}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    layout
                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                  >
                    <Card
                      component={motion.div}
                      whileHover={{ y: -8, boxShadow:'0 16px 40px rgba(99, 102, 241, 0.12)' }}
                      sx={{
                        height:'100%',
                        display:'flex',
                        flexDirection:'column',
                        border:'1px solid',
                        borderColor: alpha('#6366f1', 0.06),
                        overflow:'hidden',
                        position:'relative',
                      }}
                    >
                      {/* Completed Overlay */}
                      {item.progress === 100 && (
                        <Box sx={{
                          position:'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 3,
                          background:'linear-gradient(90deg, #10b981 0%, #6ee7b7 100%)',
                          zIndex: 1,
                        }} />
                      )}

                      <Box sx={{ position:'relative' }}>
                        <CardMedia
                          component="img"
                          height="160"
                          image={getImageUrl(item.course.coverphoto)}
                          alt={item.course.title}
                          sx={{ objectFit:'cover', bgcolor:'#f1f5f9' }}
                          onError={(e: any) => { e.currentTarget.src = `${typeof window !== 'undefined' && window.location.origin.includes('localhost') ? 'http://127.0.0.1:5000' : 'https://api.draa.in'}/assets/img/default-placeholder.png`; }}
                        />
                        {/* Gradient overlay */}
                        <Box sx={{
                          position:'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: 60,
                          background:'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 100%)',
                        }} />

                        <Chip
                          label={item.course.skill_level ||'Beginner'}
                          size="small"
                          sx={{
                            position:'absolute',
                            top: 10,
                            left: 10,
                            bgcolor:'rgba(255,255,255,0.95)',
                            fontWeight: 800,
                            fontSize:'0.65rem',
                            backdropFilter:'blur(4px)',
                            border:'1px solid rgba(255,255,255,0.5)',
                          }}
                        />
                        {item.progress === 100 && (
                          <Box sx={{
                            position:'absolute',
                            top: 10,
                            right: 10,
                            bgcolor:'#10b981',
                            color:'white',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1.5,
                            display:'flex',
                            alignItems:'center',
                            gap: 0.5,
                            fontSize:'0.65rem',
                            fontWeight: 800,
                            boxShadow:'0 2px 8px rgba(16, 185, 129, 0.3)',
                          }}>
                            <CheckIcon sx={{ fontSize: 12 }} /> DONE
                          </Box>
                        )}
                      </Box>

                      <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                        <Typography
                          variant="caption"
                          color="primary.main"
                          sx={{ fontWeight: 800, mb: 0.5, display:'block', letterSpacing: 0.5 }}
                        >
                          {item.course.skill_level?.toUpperCase()}
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 800, mb: 1.5, lineHeight: 1.3, minHeight: 52, display:'-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient:'vertical', overflow:'hidden' }}
                        >
                          {item.course.title}
                        </Typography>

                        <Box sx={{ display:'flex', alignItems:'center', gap: 1.5, mb: 2.5 }}>
                          <Avatar sx={{ width: 28, height: 28, bgcolor: alpha('#6366f1', 0.1), color:'#6366f1' }}>
                            <TeacherIcon sx={{ fontSize: 16 }} />
                          </Avatar>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, fontSize:'0.8rem' }}>
                            {item.course.teacher_details?.tname ||'Expert Instructor'}
                          </Typography>
                        </Box>

                        {/* Progress Section */}
                        <Box sx={{ mb: 2.5 }}>
                          <Box sx={{ display:'flex', justifyContent:'space-between', mb: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700 }}>
                              {item.progress || 0}% Complete
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              {item.realTimeProgress?.chapters_completed || 0} / {item.course.chapters?.length || 0} Chapters
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={item.progress || 0}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              bgcolor: alpha('#6366f1', 0.08),
'& .MuiLinearProgress-bar': {
                                background: item.progress === 100
                                  ?'linear-gradient(90deg, #10b981 0%, #6ee7b7 100%)'
                                  :'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
                              },
                            }}
                          />
                        </Box>

                        <Box sx={{ display:'flex', gap: 2, mb: 2.5 }}>
                          <Box sx={{ display:'flex', alignItems:'center', gap: 0.5, color:'text.secondary' }}>
                            <ClockIcon sx={{ fontSize: 14 }} />
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>{item.course.duration}h</Typography>
                          </Box>
                          {item.realTimeProgress?.daily_streak ? (
                            <Box sx={{ display:'flex', alignItems:'center', gap: 0.5, color:'error.main' }}>
                              <Typography variant="caption" sx={{ fontWeight: 800 }}> {item.realTimeProgress.daily_streak}d</Typography>
                            </Box>
                          ) : null}
                        </Box>

                        <Button
                          fullWidth
                          variant={item.progress === 100 ?"outlined" :"contained"}
                          startIcon={<PlayIcon />}
                          onClick={() => navigate(`/student/my-courses/learn/${item.courseId}`)}
                          sx={{
                            py: 1.2,
                            fontWeight: 800,
                            background: item.progress === 100 ?'transparent' :'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            boxShadow: item.progress === 100 ?'none' :'0 4px 12px rgba(99, 102, 241, 0.3)',
'&:hover': {
                              background: item.progress === 100 ? alpha('#6366f1', 0.05) :'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                              boxShadow: item.progress === 100 ?'none' :'0 6px 16px rgba(99, 102, 241, 0.4)',
                            },
                          }}
                        >
                          {item.progress === 100 ?"Watch Again" : item.progress ?"Continue" :"Start Learning"}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))
            )}
          </Grid>
        </AnimatePresence>
      </Box>
    </DashboardLayout>
  );
};

export default CoursesList;