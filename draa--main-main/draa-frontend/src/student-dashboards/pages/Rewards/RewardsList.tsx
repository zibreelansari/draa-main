import React, { useState, useMemo } from'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton
} from'@mui/material';
import {
  Close as CloseIcon,
  MonetizationOn as CoinsIcon,
  Timeline as HistoryIcon,
  EmojiEvents as TrophyIcon,
  Redeem as RedeemIcon,
  ArrowForward as ArrowIcon,
  TrendingUp as GainIcon,
  TrendingDown as LossIcon,
  CalendarMonth as CalendarIcon,
  Star as StarIcon,
  MilitaryTech as MedalIcon,
  Article as BlogIcon,
  Assignment as ExamIcon,
  People as ReferralIcon,
  AutoGraph as GraphIcon
} from'@mui/icons-material';
import { motion, AnimatePresence } from'framer-motion';
import { useRewards, Transaction } from'../../hooks/useRewards';
import DashboardLayout from'../../layouts/DashboardLayout';
import { useNavigate } from'react-router-dom';
import dayjs from'dayjs';
import EmptyState from'../../components/EmptyState';
import usePageTitle from '../../../hooks/usePageTitle';

const RewardsList: React.FC = () => {
  const { wallet, loading, refresh } = useRewards();
  const navigate = useNavigate();
  usePageTitle('My Rewards | Draa');

  const totalEarned = useMemo(() =>
    wallet.transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0),
    [wallet.transactions]);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

  const stats = useMemo(() => {
    const txns = wallet.transactions;
    return {
      blogs: txns.filter(t => t.source?.includes('blog')).length,
      exams: txns.filter(t => t.source?.includes('exam')).length,
      bonus: txns.filter(t => t.source?.includes('bonus')).length,
    };
  }, [wallet.transactions]);

  const getSourceIcon = (source: string) => {
    const s = source.toLowerCase();
    if (s.includes('blog')) return <BlogIcon sx={{ fontSize: 18 }} />;
    if (s.includes('exam')) return <ExamIcon sx={{ fontSize: 18 }} />;
    if (s.includes('referral')) return <ReferralIcon sx={{ fontSize: 18 }} />;
    if (s.includes('bonus')) return <TrophyIcon sx={{ fontSize: 18 }} />;
    return <StarIcon sx={{ fontSize: 18 }} />;
  };

  const getSourceColor = (source: string) => {
    const s = source.toLowerCase();
    if (s.includes('blog')) return'#6366f1';
    if (s.includes('exam')) return'#10b981';
    if (s.includes('referral')) return'#ec4899';
    if (s.includes('bonus')) return'#f59e0b';
    return'#64748b';
  };

  if (loading && wallet.transactions.length === 0) {
    return (
      <DashboardLayout>
        <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}>
          <LinearProgress sx={{ width: 200, borderRadius: 2 }} />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Hero Section */}
        <Paper
          component={motion.div}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            mb: 4,
            background:'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
            color:'white',
            position:'relative',
            overflow:'hidden',
            border:'1px solid rgba(99, 102, 241, 0.25)',
            boxShadow:'0 20px 40px rgba(30, 27, 75, 0.2)',
          }}
        >
          {/* Decorative Circles */}
          <Box sx={{ position:'absolute', top: -50, right: -30, width: 220, height: 220, borderRadius:'50%', background:'rgba(99, 102, 241, 0.2)', filter:'blur(50px)', pointerEvents:'none' }} />
          <Box sx={{ position:'absolute', bottom: -30, left:'20%', width: 160, height: 160, borderRadius:'50%', background:'rgba(245, 158, 11, 0.1)', filter:'blur(40px)', pointerEvents:'none' }} />
          <Box sx={{ position:'absolute', top: 30, right: 60, width: 40, height: 40, borderRadius:'50%', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.05)', pointerEvents:'none' }} />

          <Grid container spacing={4} alignItems="center" sx={{ position:'relative', zIndex: 2 }}>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Chip
                  label="LOYALTY REWARDS"
                  size="small"
                  sx={{ width:'fit-content', bgcolor: `${alpha('#fff', 0.1)} !important`, color:'#a5b4fc !important', fontWeight: 800, letterSpacing: 1, border:'1px solid rgba(255,255,255,0.15) !important' }}
                />
                <Box>
                  <Box sx={{ display:'flex', alignItems:'center', gap: 1 }}>
                    <CoinsIcon sx={{ fontSize: 36, color:'#fcd34d' }} />
                    <Typography variant="h2" sx={{ fontWeight: 800, color:'#fcd34d !important', lineHeight: 1 }}>
                      {wallet.balance.toLocaleString()}
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#e2e8f0 !important' }}>Available Coins</Typography>
                </Box>
                <Typography variant="body2" sx={{ maxWidth: 420, fontWeight: 500, color: '#cbd5e1 !important', lineHeight: 1.6 }}>
                  Earn coins by writing blogs. Redeem them for exclusive course discounts and premium features!
                </Typography>
                <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                  <Button
                    variant="contained"
                    sx={{
                      background:'#fcd34d !important',
                      color:'#1e1b4b !important',
                      fontWeight: 800,
                      borderRadius: 2,
                      '&:hover': { background:'#fbbf24 !important' },
                      boxShadow:'0 4px 12px rgba(245, 158, 11, 0.3)',
                    }}
                    onClick={() => navigate('/v2/student/blogs')}
                    startIcon={<BlogIcon />}
                  >
                    Earn More Coins
                  </Button>
                  <Button
                    variant="outlined"
                    sx={{ color:'white !important', borderColor: `${alpha('#fff', 0.3)} !important`, fontWeight: 800, borderRadius: 2,'&:hover': { borderColor:'white !important', bgcolor: `${alpha('#fff', 0.05)} !important` } }}
                    onClick={() => setHowItWorksOpen(true)}
                  >
                    How it works
                  </Button>
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                {[
                  { label:'All Time Earned', value: totalEarned, icon: <GainIcon />, color:'#10b981' },
                  { label:'Blog Rewards', value: stats.blogs, icon: <BlogIcon />, color:'#6366f1' },
                ].map((s, i) => (
                  <Grid item xs={6} key={i}>
                    <Paper
                      component={motion.div}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: alpha('#fff', 0.05),
                        border:'1px solid',
                        borderColor: alpha('#fff', 0.1),
                        backdropFilter:'blur(10px)',
                        '&:hover': { bgcolor: alpha('#fff', 0.08) },
                      }}
                    >
                      <Box sx={{ display:'flex', alignItems:'center', gap: 1.5, mb: 0.5 }}>
                        <Avatar sx={{ width: 24, height: 24, bgcolor: alpha(s.color, 0.2), color: s.color }}>
                          {s.icon}
                        </Avatar>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#c7d2fe !important' }}>{s.label}</Typography>
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: 'white !important' }}>{s.value}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={4}>
          {/* Transaction History */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ border:'1px solid', borderColor: alpha('#6366f1', 0.08) }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb: 3 }}>
                  <Box sx={{ display:'flex', alignItems:'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: alpha('#6366f1', 0.1), color:'#6366f1', width: 36, height: 36 }}>
                      <HistoryIcon />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Transaction History</Typography>
                  </Box>
                  <Button variant="soft" size="small" onClick={refresh} startIcon={<CalendarIcon />} sx={{ fontWeight: 700 }}>
                    Refresh
                  </Button>
                </Box>

                <TableContainer>
                  <Table>
                    <TableHead sx={{ bgcolor: alpha('#64748b', 0.04) }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800, fontSize:'0.75rem', letterSpacing: 0.5, color:'text.secondary' }}>ACTIVITY</TableCell>
                        <TableCell sx={{ fontWeight: 800, fontSize:'0.75rem', letterSpacing: 0.5, color:'text.secondary' }}>SOURCE</TableCell>
                        <TableCell sx={{ fontWeight: 800, fontSize:'0.75rem', letterSpacing: 0.5, color:'text.secondary' }} align="center">DATE</TableCell>
                        <TableCell sx={{ fontWeight: 800, fontSize:'0.75rem', letterSpacing: 0.5, color:'text.secondary' }} align="right">AMOUNT</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {wallet.transactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} sx={{ py: 0 }}>
                            <EmptyState
                              type="no-rewards"
                              size="small"
                              title="No Transactions Yet"
                              description="Start earning coins by writing blogs and referring friends!"
                              actionLabel="Start Earning"
                              onAction={() => navigate('/v2/student/blogs')}
                            />
                          </TableCell>
                        </TableRow>
                      ) : (
                        [...wallet.transactions].reverse().map((txn, idx) => (
                          <TableRow
                            key={txn._id}
                            component={motion.tr}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            sx={{'&:hover': { bgcolor: alpha('#64748b', 0.02) } }}
                          >
                            <TableCell>
                              <Box sx={{ display:'flex', alignItems:'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: alpha(getSourceColor(txn.source), 0.1), color: getSourceColor(txn.source), width: 36, height: 36 }}>
                                  {getSourceIcon(txn.source)}
                                </Avatar>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                  {txn.description ||'Reward Earned'}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={txn.source.replace('_','').toUpperCase()}
                                size="small"
                                sx={{
                                  fontWeight: 800,
                                  fontSize:'0.6rem',
                                  bgcolor: alpha(getSourceColor(txn.source), 0.1),
                                  color: getSourceColor(txn.source),
                                }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="caption" sx={{ color:'text.secondary', fontWeight: 600 }}>
                                {dayjs(txn.createdAt).format('MMM DD, YYYY')}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="subtitle2" sx={{ fontWeight: 900, color: txn.amount >= 0 ?'#10b981' :'#ef4444' }}>
                                {txn.amount >= 0 ?'+' :''}{txn.amount}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Ways to Earn Side Panel */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              <Card sx={{ border:'1px solid', borderColor: alpha('#f59e0b', 0.1), bgcolor: alpha('#f59e0b', 0.02) }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 3, display:'flex', alignItems:'center', gap: 1 }}>
                    <MedalIcon sx={{ color:'#f59e0b' }} /> Ways to Earn More
                  </Typography>
                  <Stack spacing={2}>
                    {[
                      { title:'Write a Blog Post', sub:'Earn up to 50 coins per approved blog', icon: <BlogIcon />, color:'#6366f1', to:'/v2/student/blogs' },
                      // { title:'Ace Your Exams', sub:'Top scores yield performance bonuses', icon: <ExamIcon />, color:'#10b981', to:'/v2/student/my-exams' },
                      // { title:'Daily Login', sub:'Keep your streak for daily rewards', icon: <GainIcon />, color:'#7c3aed', to:'#' },
                    ].map((item, i) => (
                      <Box
                        key={i}
                        component={motion.div}
                        whileHover={{ x: 4 }}
                        sx={{
                          display:'flex',
                          alignItems:'center',
                          gap: 2,
                          cursor:'pointer',
                          p: 2,
                          borderRadius: 2,
                          transition:'all 0.2s',
'&:hover': { bgcolor:'white', boxShadow:'0 4px 12px rgba(0,0,0,0.04)' },
                        }}
                        onClick={() => item.to !=='#' && navigate(item.to)}
                      >
                        <Avatar sx={{ bgcolor: alpha(item.color, 0.1), color: item.color, width: 36, height: 36 }}>
                          {item.icon}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{item.title}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>{item.sub}</Typography>
                        </Box>
                        <ArrowIcon sx={{ fontSize: 16, opacity: 0.3 }} />
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>

              {/* Next Milestone */}
              <Card sx={{ border:'1px solid', borderColor: alpha('#6366f1', 0.1), bgcolor: alpha('#6366f1', 0.02) }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>Next Milestone</Typography>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display:'flex', justifyContent:'space-between', mb: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>Pro Badge</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>{Math.min(wallet.balance, 1000)} / 1000</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((wallet.balance / 1000) * 100, 100)}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: alpha('#6366f1', 0.08),
'& .MuiLinearProgress-bar': { background:'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)' },
                      }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, lineHeight: 1.5 }}>
                    Earn <strong>{Math.max(1000 - wallet.balance, 0)}</strong> more coins to unlock the Pro Badge and get a 20% discount on your next course!
                  </Typography>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      {/* How it works Modal */}
      <Dialog
        open={howItWorksOpen}
        onClose={() => setHowItWorksOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, p: 1 }
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>How it works</Typography>
          <IconButton onClick={() => setHowItWorksOpen(false)} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pb: 4 }}>
          <Box sx={{ mb: 4, textAlign:'center' }}>
            <Avatar sx={{ width: 64, height: 64, bgcolor: alpha('#6366f1', 0.1), color:'#6366f1', margin:'0 auto 16px' }}>
              <CoinsIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Earn While Helping Others</Typography>
            <Typography variant="body2" color="text.secondary">Follow these simple steps to earn loyalty coins by sharing your knowledge.</Typography>
          </Box>

          <Stack spacing={3}>
            {[
              { 
                step:'01', 
                title:'Write & Post', 
                desc:'Create unique, high-quality blogs on the platform and submit them for review.',
                icon: <BlogIcon />, 
                color:'#6366f1' 
              },
              { 
                step:'02', 
                title:'Verification', 
                desc:'Our admin team reviews your content to ensure it meets our community guidelines.',
                icon: <HistoryIcon />, 
                color:'#f59e0b' 
              },
              { 
                step:'03', 
                title:'Admin Approval', 
                desc:'Once approved, your blog goes live for thousands of students to learn from.',
                icon: <StarIcon />, 
                color:'#10b981' 
              },
              { 
                step:'04', 
                title:'Instant Credit', 
                desc:'50 Loyalty Coins are instantly credited to your available balance!',
                icon: <CoinsIcon />, 
                color:'#fcd34d' 
              }
            ].map((item, i) => (
              <Box key={i} sx={{ display:'flex', gap: 3 }}>
                <Box sx={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                  <Box 
                    sx={{ 
                      width: 28, 
                      height: 28, 
                      borderRadius:'50%', 
                      bgcolor: item.color, 
                      color: i === 3 ?'#1e1b4b' :'white',
                      display:'flex',
                      alignItems:'center',
                      justifyContent:'center',
                      fontSize: 12,
                      fontWeight: 900,
                      zIndex: 1
                    }}
                  >
                    {item.step}
                  </Box>
                  {i !== 3 && <Box sx={{ width: 2, flexGrow: 1, bgcolor: alpha(item.color, 0.2), my: 0.5 }} />}
                </Box>
                <Box sx={{ pb: i !== 3 ? 3 : 0 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5, display:'flex', alignItems:'center', gap: 1 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, lineHeight: 1.5 }}>
                    {item.desc}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>

          <Button 
            fullWidth 
            variant="contained" 
            size="large"
            onClick={() => { setHowItWorksOpen(false); navigate('/v2/student/blogs'); }}
            sx={{ 
              mt: 4, 
              borderRadius: 2, 
              fontWeight: 800,
              background:'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              boxShadow:'0 4px 12px rgba(99, 102, 241, 0.3)'
            }}
          >
            Start Writing Now
          </Button>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default RewardsList;