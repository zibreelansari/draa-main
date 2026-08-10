import React, { useState, useMemo, useEffect } from'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  LinearProgress,
  alpha,
  Paper,
  Avatar,
  Stack,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  Tooltip,
  useMediaQuery,
  useTheme
} from'@mui/material';
import {
  Search as SearchIcon,
  EmojiEvents as TrophyIcon,
  Assignment as AssignmentIcon,
  Timer as ClockIcon,
  PlayArrow as PlayIcon,
  Star as StarIcon,
  ChevronRight as ChevronRightIcon,
  AutoGraph as GraphIcon,
  TrendingUp as TrendIcon,
  CheckCircle as CheckIcon,
  EmojiEvents as MedalIcon
} from'@mui/icons-material';
import { motion, AnimatePresence } from'framer-motion';
import { useStudentTestSeries, PurchasedTopic, TestSeries } from'../../hooks/useStudentTestSeries';
// import Breadcrumb from'../../../components/common/Breadcrumb';
import DashboardLayout from'../../layouts/DashboardLayout';
import { useNavigate, useParams, useLocation } from'react-router-dom';
import EmptyState from'../../components/EmptyState';
import DashboardLoader from'../../components/DashboardLoader';
import usePageTitle from '../../../hooks/usePageTitle';

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const TestSeriesList: React.FC = () => {
  const { studentId: urlStudentId } = useParams<{ studentId: string }>();
  const user = JSON.parse(localStorage.getItem('edudocs') ||'{}');

  // Use ID from URL if it's a valid ObjectId, otherwise fallback to localStorage
  const isValidObjectId = (id?: string) => id && id.length === 24 && /^[0-9a-fA-F]+$/.test(id);
  const effectiveStudentId = isValidObjectId(urlStudentId) ? urlStudentId : (user.id || user._id);

  const { purchasedTopics, stats, loading, error, loadTopicTests } = useStudentTestSeries(effectiveStudentId, user.token);
  const navigate = useNavigate();
  const location = useLocation();
  usePageTitle('My Test Series | Draa');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExam, setSelectedExam] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState<PurchasedTopic | null>(null);
  const [topicTests, setTopicTests] = useState<TestSeries[]>([]);
  const [loadingTests, setLoadingTests] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    if (!loading && purchasedTopics.length > 0) {
      const queryParams = new URLSearchParams(location.search);
      const qSub = queryParams.get('subject')?.toLowerCase();
      const qTop = queryParams.get('topic')?.toLowerCase();
      const qTitle = queryParams.get('title')?.toLowerCase();

      if (qSub || qTop || qTitle) {
        const match = purchasedTopics.find(t => {
          const tName = t.topic.name?.toLowerCase() || '';
          const sName = t.topic.subject?.toLowerCase() || '';
          
          return (qSub && tName.includes(qSub)) || 
                 (qTop && tName.includes(qTop)) ||
                 (qSub && sName.includes(qSub)) ||
                 (qTitle && qTitle.includes(tName)) ||
                 (qTitle && tName.includes(qTitle));
        });

        if (match) {
          handleOpenTopic(match);
          navigate(location.pathname, { replace: true });
        }
      }
    }
  }, [loading, purchasedTopics, location.search, location.pathname, navigate]);

  const filteredTopics = useMemo(() => {
    let result = [...purchasedTopics];

    if (selectedExam !=='all') {
      result = result.filter(t => t.topic.examination === selectedExam);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.topic.name.toLowerCase().includes(q) ||
        t.topic.examination?.toLowerCase().includes(q) ||
        t.topic.subject?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [purchasedTopics, selectedExam, searchQuery]);

  const exams = useMemo(() => {
    return Array.from(new Set(purchasedTopics.map(t => t.topic.examination).filter(Boolean)));
  }, [purchasedTopics]);

  const handleOpenTopic = async (topic: PurchasedTopic) => {
    setSelectedTopic(topic);
    setLoadingTests(true);
    setOpenModal(true);
    const tests = await loadTopicTests(topic);
    setTopicTests(tests);
    setLoadingTests(false);
  };

  if (loading && purchasedTopics.length === 0) {
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

        </Box>

        <Box sx={{ p: { xs: 0, md: 0 } }}>
          <Box sx={{ mb: 4, display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                My Test Series
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Practice with high-quality mock tests and track your performance across subjects.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<GraphIcon />}
              onClick={() => navigate('/online-test-series')}
              sx={{
                background:'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                boxShadow:'0 4px 14px rgba(245, 158, 11, 0.35)',
'&:hover': { background:'linear-gradient(135deg, #d97706 0%, #b45309 100%)' },
              }}
            >
              Buy New Series
            </Button>
          </Box>
        </Box>

        {/* Filters */}
        <Box sx={{ mb: 4, display:'flex', flexWrap:'wrap', gap: 2, alignItems:'center' }}>
          <Box sx={{ flexGrow: 1, minWidth: 280 }}>
            <TextField
              fullWidth
              placeholder="Search by series name, examination or subject..."
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
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            size="small"
            sx={{ borderRadius: 2, bgcolor:'background.paper', minWidth: 200 }}
          >
            <MenuItem value="all">All Examinations</MenuItem>
            {exams.map(e => <MenuItem key={e} value={e}>{e}</MenuItem>)}
          </Select>
        </Box>

        {/* Series Grid */}
        <AnimatePresence mode="popLayout">
          <Grid container spacing={3}>
            {filteredTopics.length === 0 ? (
              <Grid item xs={12}>
                <EmptyState
                  type="no-results"
                  size="large"
                  title="No Test Series Found"
                  description="You haven't purchased any test series yet. Browse our catalog and start practicing!"
                  actionLabel="Explore Test Series"
                  onAction={() => navigate('/online-test-series')}
                />
              </Grid>
            ) : (
              filteredTopics.map((topic, idx) => (
                <Grid item xs={12} sm={6} md={4} key={topic.purchaseId}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    layout
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card
                      component={motion.div}
                      whileHover={{ y: -6, boxShadow:'0 12px 32px rgba(99, 102, 241, 0.12)' }}
                      sx={{
                        height:'100%',
                        border:'1px solid',
                        borderColor: alpha('#6366f1', 0.08),
                        position:'relative',
                        overflow:'hidden',
                      }}
                    >
                      {/* Top accent bar */}
                      <Box sx={{
                        height: 3,
                        background:'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
                      }} />

                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display:'flex', justifyContent:'space-between', mb: 2, alignItems:'flex-start' }}>
                          <Chip
                            label={topic.topic.examination ||'General'}
                            size="small"
                            sx={{
                              bgcolor: alpha('#6366f1', 0.08),
                              color:'#6366f1',
                              fontWeight: 800,
                              fontSize:'0.65rem',
                            }}
                          />
                        </Box>

                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5, minHeight: 52, lineHeight: 1.3 }}>
                          {topic.topic.name}
                        </Typography>

                        <Box sx={{ display:'flex', alignItems:'center', gap: 1, mb: 2.5 }}>
                          <MedalIcon sx={{ fontSize: 16, color:'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, fontSize:'0.8rem' }}>
                            Subject: {topic.topic.subject}
                          </Typography>
                        </Box>

                        <Button
                          fullWidth
                          variant="contained"
                          endIcon={<ChevronRightIcon />}
                          onClick={() => handleOpenTopic(topic)}
                          sx={{
                            py: 1.2,
                            fontWeight: 800,
                            background:'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            boxShadow:'0 4px 12px rgba(99, 102, 241, 0.3)',
'&:hover': { background:'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' },
                          }}
                        >
                          PRACTICE TESTS
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

      {/* Test List Modal */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow:'hidden' } }}
      >
        <DialogTitle sx={{
          p: { xs: 2, sm: 3 },
          display:'flex',
          justifyContent:'space-between',
          alignItems:'center',
          bgcolor: alpha('#6366f1', 0.04),
          borderBottom:'1px solid',
          borderColor:'divider',
        }}>
          <Box sx={{ pr: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: { xs:'1.1rem', sm:'1.25rem' }, lineHeight: 1.2 }}>
              {selectedTopic?.topic.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display:'block', mt: 0.5 }}>
              Select a test to start practicing
            </Typography>
          </Box>
          <IconButton onClick={() => setOpenModal(false)} size="small" sx={{ color:'text.secondary' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {loadingTests ? (
            <Box sx={{ textAlign:'center', py: 6 }}>
              <LinearProgress sx={{ borderRadius: 2, width: 200, mx:'auto' }} />
              <Typography variant="body2" sx={{ mt: 2, color:'text.secondary', fontWeight: 600 }}>Fetching test papers...</Typography>
            </Box>
          ) : topicTests.length === 0 ? (
            <Box sx={{ textAlign:'center', py: 6 }}>
              <AssignmentIcon sx={{ fontSize: 48, opacity: 0.2, mb: 2 }} />
              <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>No tests available in this series yet.</Typography>
            </Box>
          ) : (
            <List sx={{ pt: 2, px: 2 }}>
              {topicTests.map((test, i) => (
                <motion.div
                  key={test._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <ListItem
                    sx={{
                      py: 2.5,
                      px: { xs: 2, sm: 2.5 },
                      mb: 1.5,
                      borderRadius: 3,
                      bgcolor: alpha('#64748b', 0.02),
                      border:'1px solid',
                      borderColor:'divider',
                      transition:'all 0.2s',
                      flexDirection: { xs:'column', sm:'row' },
                      alignItems: { xs:'stretch', sm:'center' },
                      gap: { xs: 2, sm: 0 },
'&:hover': {
                        bgcolor: alpha('#6366f1', 0.04),
                        borderColor:'#6366f1',
                        transform: { xs:'none', sm:'translateX(4px)' },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: { xs: 0, sm: 56 }, mb: { xs: 0.5, sm: 0 } }}>
                      <Avatar sx={{ bgcolor: alpha('#6366f1', 0.1), color:'#6366f1', width: 44, height: 44 }}>
                        <AssignmentIcon />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5, lineHeight: 1.3, fontSize: { xs:'1rem', sm:'1.1rem' } }}>
                          {test.title}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ display:'flex', gap: { xs: 1, sm: 2 }, mt: 0.5, flexWrap:'wrap' }}>
                          <Box sx={{ display:'flex', alignItems:'center', gap: 0.5 }}>
                            <ClockIcon sx={{ fontSize: 14 }} />
                            <Typography variant="caption" sx={{ fontWeight: 700 }}>{test.duration}m</Typography>
                          </Box>
                          <Box sx={{ display:'flex', alignItems:'center', gap: 0.5 }}>
                            <StarIcon sx={{ fontSize: 14, color:'#f59e0b' }} />
                            <Typography variant="caption" sx={{ fontWeight: 700 }}>{test.totalMarks} Marks</Typography>
                          </Box>
                          <Chip
                            label={test.difficulty ||'Intermediate'}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize:'0.65rem',
                              fontWeight: 800,
                              bgcolor: alpha(test.difficulty ==='beginner' ?'#10b981' :'#f59e0b', 0.1),
                              color: test.difficulty ==='beginner' ?'#10b981' :'#f59e0b',
                            }}
                          />
                        </Box>
                      }
                      sx={{ pr: { xs: 0, sm: 2 } }}
                    />
                    <Button
                      variant="contained"
                      size={isMobile ?"medium" :"small"}
                      startIcon={<PlayIcon />}
                      onClick={() => navigate(`/student/test-interface/${test._id}?topicId=${selectedTopic?.topicId}`)}
                      sx={{
                        borderRadius: 2.5,
                        fontWeight: 800,
                        px: 3,
                        py: { xs: 1.2, sm: 1 },
                        whiteSpace:'nowrap',
                        background:'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        boxShadow:'0 4px 12px rgba(99, 102, 241, 0.3)',
'&:hover': { background:'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' },
                        width: { xs:'100%', sm:'auto' },
                        mt: { xs: 1, sm: 0 }
                      }}
                    >
                      START
                    </Button>
                  </ListItem>
                </motion.div>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default TestSeriesList;