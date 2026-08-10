import React, { useState, useEffect } from'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Avatar,
  Chip,
  Stack,
  Paper,
  alpha,
  useMediaQuery,
  useTheme
} from'@mui/material';
import {
  EmojiEvents as TrophyIcon,
  LocalFireDepartment as FireIcon,
  TrendingUp as TrendIcon,
  AutoGraph as GraphIcon,
  MilitaryTech as MedalIcon,
} from'@mui/icons-material';
import { motion } from'framer-motion';
import DashboardLayout from'../../layouts/DashboardLayout';
import { useStudentLeaderboard } from'../../hooks/useStudentLeaderboard';
import { useStudentProfile } from'../../hooks/useStudentProfile';
import LeaderboardRow from'../../components/LeaderboardRow';
import MetricsCard from'../../components/MetricsCard';
import DashboardLoader from'../../components/DashboardLoader';
import usePageTitle from '../../../hooks/usePageTitle';

const LeaderboardIndex: React.FC = () => {
  const { profile } = useStudentProfile();
  const {
    leaderboard,
    weeklyLeaderboard,
    monthlyLeaderboard,
    studentRank,
    achievements,
    loading,
    fetchLeaderboard,
  } = useStudentLeaderboard(profile?.id || profile?._id, profile?.token);

  const [activeTab, setActiveTab] = useState(0);
  usePageTitle('Leaderboard | Draa');

  useEffect(() => {
    if (activeTab === 0) fetchLeaderboard('all');
    else if (activeTab === 1) fetchLeaderboard('weekly');
    else if (activeTab === 2) fetchLeaderboard('monthly');
  }, [activeTab, fetchLeaderboard]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const currentLeaderboard = activeTab === 0 ? leaderboard : activeTab === 1 ? weeklyLeaderboard : monthlyLeaderboard;
  const currentLabel = activeTab === 0 ?'All Time' : activeTab === 1 ?'This Week' :'This Month';

  const topThree = currentLeaderboard.slice(0, 3);
  const restOfLeaderboard = currentLeaderboard.slice(3);

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardLoader />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display:'flex', alignItems:'center', gap: 2, mb: 1 }}>
            <Avatar sx={{
              background:'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              color:'white', width: 44, height: 44, boxShadow:'0 8px 18px rgba(245,158,11,0.4)',
            }}>
              <TrophyIcon />
            </Avatar>
            <Box>
              <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: 1.2, color:'warning.main' }}>
                Compete & climb
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing:'-0.02em' }}>Leaderboard</Typography>
            </Box>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
            See how you rank against other learners and celebrate top performers!
          </Typography>
        </Box>

        {/* Student Rank Hero */}
        {studentRank && (
          <Card sx={{
            mb: 4,
            borderRadius: 3,
            position:'relative', overflow:'hidden',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
            color:'white',
            border:'1px solid rgba(99, 102, 241, 0.3)',
            boxShadow:'0 20px 50px rgba(99, 102, 241, 0.2)',
          }}>
            {/* Decorative elements */}
            <Box sx={{ position:'absolute', top: -60, right: -40, width: 280, height: 280, borderRadius:'50%', background:'rgba(99, 102, 241, 0.25)', filter:'blur(60px)', pointerEvents:'none' }} />
            <Box sx={{ position:'absolute', bottom: -80, left: -20, width: 220, height: 220, borderRadius:'50%', background:'rgba(236, 72, 153, 0.15)', filter:'blur(50px)', pointerEvents:'none' }} />
            <Box sx={{ position:'absolute', top: 20, right: 40, width: 60, height: 60, borderRadius:'50%', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.05)', pointerEvents:'none' }} />
            <Box sx={{ position:'absolute', bottom: 40, right: 120, width: 30, height: 30, borderRadius:'50%', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.04)', pointerEvents:'none' }} />
            <CardContent sx={{ position:'relative', zIndex: 1 }}>
              <Grid container spacing={isMobile ? 2 : 3} alignItems="center">
                <Grid item xs={12} md={4}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{
                      bgcolor:'rgba(255,255,255,0.95)',
                      color:'#6366f1',
                      width: isMobile ? 56 : 72, height: isMobile ? 56 : 72,
                      fontSize: isMobile ? 20 : 26, fontWeight: 900,
                      boxShadow:'0 8px 24px rgba(0,0,0,0.18)',
                    }}>
                      #{studentRank.rank}
                    </Avatar>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.8, letterSpacing: 1, color: 'rgba(255,255,255,0.8) !important' }}>
                        YOUR RANK
                      </Typography>
                      <Typography variant={isMobile ?"h5" :"h4"} sx={{ fontWeight: 900, lineHeight: 1.1, color: 'white !important' }}>
                        {studentRank.percentile}th percentile
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9, color: 'rgba(255,255,255,0.9) !important' }}>
                        Out of {studentRank.totalStudents} students
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={4} md={2}>
                  <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.8, letterSpacing: 1, color: 'rgba(255,255,255,0.8) !important' }}>POINTS</Typography>
                  <Typography variant={isMobile ?"subtitle1" :"h5"} sx={{ fontWeight: 900, color: 'white !important' }}>
                    {studentRank.points.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={4} md={2}>
                  <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.8, letterSpacing: 1, color: 'rgba(255,255,255,0.8) !important' }}>LEVEL</Typography>
                  <Typography variant={isMobile ?"subtitle1" :"h5"} sx={{ fontWeight: 900, color: 'white !important' }}>
                    Lv.{studentRank.level}
                  </Typography>
                </Grid>
                <Grid item xs={4} md={2}>
                  <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.8, letterSpacing: 1, color: 'rgba(255,255,255,0.8) !important' }}>STREAK</Typography>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <FireIcon sx={{ color:'#fcd34d', fontSize: isMobile ? 18 : 24 }} />
                    <Typography variant={isMobile ?"subtitle1" :"h5"} sx={{ fontWeight: 900, color: 'white !important' }}>
                      {studentRank.streak}d
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Box sx={{
                    p: 1.5, borderRadius: 3,
                    bgcolor:'rgba(255,255,255,0.18)',
                    border:'1px solid rgba(255,255,255,0.3)',
                    backdropFilter:'blur(8px)',
                  }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.8, letterSpacing: 0.5, color: 'rgba(255,255,255,0.8) !important' }}>
                      TO NEXT LEVEL
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, mt: 0.3, color: 'white !important' }}>
                      {Math.max(0, 100 - (studentRank.points % 100))} XP
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats — removed duplicate streak card */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <MetricsCard
              title="Total Points"
              value={studentRank?.points.toLocaleString() ||'0'}
              icon={<TrophyIcon />}
              color="#f59e0b"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <MetricsCard
              title="Badges Earned"
              value={achievements?.totalEarned ?? 0}
              icon={<GraphIcon />}
              color="#ec4899"
              subtitle={`of ${achievements?.totalBadges ?? 0} total`}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <MetricsCard
              title="Current Streak"
              value={`${studentRank?.streak ?? 0} days`}
              icon={<FireIcon />}
              color="#f97316"
              subtitle={studentRank && studentRank.streak > 0 ?'Keep the fire going!' :'Take a test to begin'}
            />
          </Grid>
        </Grid>

        {/* Tabs */}
        <Card sx={{ mb: 3, overflow:'hidden' }}>
          <Box sx={{ borderBottom: 1, borderColor:'divider', px: 2 }}>
            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant={isMobile ?"fullWidth" :"standard"}>
              <Tab label="All Time" icon={<TrophyIcon />} iconPosition={isMobile ?"top" :"start"} sx={{ minHeight: isMobile ? 64 : 48, fontSize: isMobile ?'0.7rem' :'0.875rem', textTransform:'none', fontWeight: 700 }} />
              <Tab label="This Week" icon={<FireIcon />} iconPosition={isMobile ?"top" :"start"} sx={{ minHeight: isMobile ? 64 : 48, fontSize: isMobile ?'0.7rem' :'0.875rem', textTransform:'none', fontWeight: 700 }} />
              <Tab label="This Month" icon={<TrendIcon />} iconPosition={isMobile ?"top" :"start"} sx={{ minHeight: isMobile ? 64 : 48, fontSize: isMobile ?'0.7rem' :'0.875rem', textTransform:'none', fontWeight: 700 }} />
            </Tabs>
          </Box>

          <CardContent>
            {/* Top 3 Podium */}
            {topThree.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>Top Performers</Typography>
                  <Chip label={currentLabel} size="small" sx={{ fontWeight: 700 }} />
                </Stack>
                <Grid container spacing={isMobile ? 1 : 2} justifyContent="center" alignItems="flex-end">
                  {/* 2nd Place */}
                  {topThree[1] && (
                    <Grid item xs={4}>
                      <Paper
                        sx={{
                          p: isMobile ? 1 : 2, textAlign:'center', borderRadius: 4,
                          background: 'linear-gradient(180deg, rgba(192,192,192,0.25) 0%, rgba(192,192,192,0.08) 100%)',
                          border:'2px solid', borderColor:'#c0c0c0',
                          minHeight: isMobile ? 130 : 220,
                          display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center',
                          gap: 0.5,
                          position:'relative',
                          boxShadow:'0 8px 24px rgba(192,192,192,0.25)',
                        }}
                      >
                        <Chip label="2nd" size="small" sx={{
                          position:'absolute', top: 10, right: 12,
                          fontWeight: 800, fontSize:'0.65rem',
                          bgcolor:'#c0c0c0', color:'#1f2937',
                        }} />
                        <MedalIcon sx={{
                          fontSize: isMobile ? 32 : 48,
                          color:'#71717a',
                          filter:'drop-shadow(0 4px 6px rgba(0,0,0,0.15))',
                        }} />
                        <Avatar src={topThree[1].avatar} sx={{ width: isMobile ? 48 : 72, height: isMobile ? 48 : 72, border:'2px solid #c0c0c0' }}>
                          {topThree[1].name?.[0]}
                        </Avatar>
                        <Typography variant="caption" sx={{ fontWeight: 800, color:'#1f2937', maxWidth:'90%', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {topThree[1].name}
                        </Typography>
                        <Typography variant={isMobile ?"subtitle2" :"h5"} sx={{ fontWeight: 900, color:'#71717a' }}>
                          {topThree[1].points.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color:'#71717a' }}>points</Typography>
                      </Paper>
                    </Grid>
                  )}
                  {/* 1st Place */}
                  {topThree[0] && (
                    <Grid item xs={4}>
                      <Paper
                        sx={{
                          p: isMobile ? 1.5 : 3, textAlign:'center', borderRadius: 4,
                          background: 'linear-gradient(180deg, rgba(255,215,0,0.30) 0%, rgba(255,215,0,0.08) 100%)',
                          border:'2px solid', borderColor:'#ffd700',
                          minHeight: isMobile ? 160 : 260,
                          zIndex: 2,
                          position:'relative',
                          display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center',
                          gap: 0.5,
                          boxShadow:'0 12px 32px rgba(255,215,0,0.35)',
                        }}
                      >
                        <Chip label="1st" size="small" sx={{
                          position:'absolute', top: 12, right: 14,
                          fontWeight: 800, fontSize:'0.65rem',
                          bgcolor:'#ffd700', color:'#1f2937',
                        }} />
                        <MedalIcon sx={{
                          fontSize: isMobile ? 40 : 60,
                          color:'#b45309',
                          filter:'drop-shadow(0 6px 10px rgba(180, 83, 9, 0.35))',
                        }} />
                        <Avatar src={topThree[0].avatar} sx={{
                          width: isMobile ? 60 : 88, height: isMobile ? 60 : 88,
                          mx:'auto', border:'3px solid #ffd700',
                          boxShadow:'0 8px 20px rgba(255,215,0,0.4)',
                        }}>
                          {topThree[0].name?.[0]}
                        </Avatar>
                        <Typography variant="caption" sx={{ fontWeight: 800, color:'#1f2937', maxWidth:'90%', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {topThree[0].name}
                        </Typography>
                        <Typography variant={isMobile ?"h6" :"h4"} sx={{ fontWeight: 900, color:'#b45309' }}>
                          {topThree[0].points.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 800, color:'#b45309' }}>points</Typography>
                      </Paper>
                    </Grid>
                  )}
                  {/* 3rd Place */}
                  {topThree[2] && (
                    <Grid item xs={4}>
                      <Paper
                        sx={{
                          p: isMobile ? 1 : 2, textAlign:'center', borderRadius: 4,
                          background: 'linear-gradient(180deg, rgba(205,127,50,0.22) 0%, rgba(205,127,50,0.08) 100%)',
                          border:'2px solid', borderColor:'#cd7f32',
                          minHeight: isMobile ? 130 : 220,
                          display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center',
                          gap: 0.5,
                          position:'relative',
                          boxShadow:'0 8px 24px rgba(205,127,50,0.25)',
                        }}
                      >
                        <Chip label="3rd" size="small" sx={{
                          position:'absolute', top: 10, right: 12,
                          fontWeight: 800, fontSize:'0.65rem',
                          bgcolor:'#cd7f32', color:'#fff',
                        }} />
                        <MedalIcon sx={{
                          fontSize: isMobile ? 32 : 48,
                          color:'#92400e',
                          filter:'drop-shadow(0 4px 6px rgba(0,0,0,0.15))',
                        }} />
                        <Avatar src={topThree[2].avatar} sx={{ width: isMobile ? 48 : 72, height: isMobile ? 48 : 72, border:'2px solid #cd7f32' }}>
                          {topThree[2].name?.[0]}
                        </Avatar>
                        <Typography variant="caption" sx={{ fontWeight: 800, color:'#1f2937', maxWidth:'90%', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {topThree[2].name}
                        </Typography>
                        <Typography variant={isMobile ?"subtitle2" :"h5"} sx={{ fontWeight: 900, color:'#92400e' }}>
                          {topThree[2].points.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color:'#92400e' }}>points</Typography>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}

            {/* Rest of Leaderboard */}
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Full Rankings</Typography>
            <Stack spacing={2}>
              {restOfLeaderboard.map((student) => (
                <LeaderboardRow
                  key={student.studentId || student.rank}
                  rank={student.rank}
                  name={student.name}
                  avatar={student.avatar}
                  points={student.points}
                  streak={student.streak}
                  avgScore={student.avgScore}
                  coursesCompleted={student.coursesCompleted}
                  isCurrentUser={student.studentId === (profile?.id || profile?._id)}
                  level={student.level}
                />
              ))}
              {restOfLeaderboard.length === 0 && (
                <Paper sx={{ p: 4, textAlign:'center', borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                  <Typography variant="body2" color="text.secondary">
                    No other students in this ranking yet. Be the first!
                  </Typography>
                </Paper>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Achievements Section */}
        {achievements && (
          <Card sx={{ borderRadius: 4 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Your Achievements</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                    Earned Badges ({achievements.totalEarned})
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" spacing={2}>
                    {achievements.earned.map((badge) => (
                      <Paper
                        key={badge.id}
                        sx={{
                          p: 1.5, textAlign:'center', borderRadius: 2,
                          bgcolor: alpha('#f59e0b', 0.1),
                          border:'1px solid',
                          borderColor: alpha('#f59e0b', 0.3),
                          minWidth: 96,
                        }}
                      >
                        <Typography sx={{ fontSize: 24 }}>{badge.icon}</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>{badge.name}</Typography>
                      </Paper>
                    ))}
                    {achievements.earned.length === 0 && (
                      <Typography variant="body2" color="text.secondary">
                        No badges earned yet. Keep learning!
                      </Typography>
                    )}
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Next Badge to Unlock</Typography>
                  {achievements.nextBadge ? (
                    <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha('#94a3b8', 0.1) }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Typography sx={{ fontSize: 32 }}>{achievements.nextBadge.icon}</Typography>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{achievements.nextBadge.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{achievements.nextBadge.description}</Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  ) : (
                    <Typography variant="body2" color="text.secondary">All badges unlocked! Amazing!</Typography>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default LeaderboardIndex;