import React, { useState } from'react';
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
  IconButton,
  Tooltip
} from'@mui/material';
import {
  VideoCameraFront as VideoIcon,
  AccessTime as TimeIcon,
  CalendarToday as CalendarIcon,
  Person as TeacherIcon,
  Launch as LaunchIcon,
  OnlinePrediction as OnlineIcon,
  Explore as ExploreIcon,
  LiveTv as LiveIcon,
  Schedule as ScheduleIcon
} from'@mui/icons-material';
import { motion } from'framer-motion';
import { useLiveSessions } from'../../hooks/useLiveSessions';
import DashboardLayout from'../../layouts/DashboardLayout';
import { useNavigate } from'react-router-dom';
import dayjs from'dayjs';
import EmptyState from'../../components/EmptyState';
import usePageTitle from '../../../hooks/usePageTitle';

const LiveSessionsList: React.FC = () => {
  const { liveSessions: rawSessions, loading } = useLiveSessions();
  usePageTitle('Live Sessions | Draa');
  const liveSessions = Array.isArray(rawSessions) ? rawSessions : (rawSessions?.meetings || []);
  const navigate = useNavigate();

  if (loading && (liveSessions?.length || 0) === 0) {
    return (
      <DashboardLayout>
        <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}>
          <LinearProgress sx={{ width: 200, borderRadius: 2 }} />
        </Box>
      </DashboardLayout>
    );
  }

  const safeSessions = Array.isArray(liveSessions) ? liveSessions : [];

  const liveCount = safeSessions.filter(s => {
    const sessionDate = dayjs(s.startTime);
    return Math.abs(dayjs().diff(sessionDate,'minute')) < 15;
  }).length;

  return (
    <DashboardLayout>
      <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap: 2 }}>
          <Box>
            <Box sx={{ display:'flex', alignItems:'center', gap: 2, mb: 1 }}>
              <Avatar sx={{ bgcolor: alpha('#8b5cf6', 0.1), color:'#8b5cf6', width: 40, height: 40 }}>
                <VideoIcon sx={{ fontSize: 22 }} />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>Live Learning Sessions</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5, fontWeight: 500 }}>
              Join interactive live classes with your instructors and clarify your doubts in real-time.
            </Typography>
          </Box>
          {liveCount > 0 && (
            <Chip
              icon={<OnlineIcon />}
              label={`${liveCount} Live Now`}
              color="error"
              sx={{ fontWeight: 800, fontSize:'0.8rem', animation:'pulse 2s infinite','@keyframes pulse': {'0%, 100%': { opacity: 1 },'50%': { opacity: 0.7 } } }}
            />
          )}
        </Box>

        {/* Stats Summary */}
        <Paper sx={{ p: 2.5, mb: 4, borderRadius: 2, display:'flex', gap: 4, overflowX:'auto', bgcolor: alpha('#8b5cf6', 0.02), border:'1px solid', borderColor: alpha('#8b5cf6', 0.08) }}>
          {[
            { label:'Total Sessions', value: safeSessions.length, color:'#8b5cf6' },
            { label:'Live Now', value: liveCount, color:'#ef4444' },
            { label:'Upcoming', value: safeSessions.length - liveCount, color:'#f59e0b' },
          ].map((stat, i) => (
            <Box key={i} sx={{ display:'flex', alignItems:'center', gap: 1.5, minWidth: 120 }}>
              <Box sx={{ width: 10, height: 10, borderRadius:'50%', bgcolor: stat.color }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1 }}>{stat.value}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{stat.label}</Typography>
              </Box>
            </Box>
          ))}
        </Paper>

        {/* Sessions Grid */}
        <Grid container spacing={3}>
          {safeSessions.length === 0 ? (
            <Grid item xs={12}>
              <EmptyState
                type="no-sessions"
                size="large"
                description="There are no upcoming live sessions. Stay tuned for interactive classes and workshops with expert instructors."
                actionLabel="Browse Courses"
                onAction={() => navigate('/courses')}
              />
            </Grid>
          ) : (
            safeSessions.map((session, idx) => {
              const sessionDate = dayjs(session.startTime);
              const isLive = Math.abs(dayjs().diff(sessionDate,'minute')) < 15;

              return (
                <Grid item xs={12} sm={6} md={4} key={session._id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card
                      component={motion.div}
                      whileHover={{ y: -6, boxShadow: isLive ?'0 12px 32px rgba(239, 68, 68, 0.2)' :'0 12px 32px rgba(139, 92, 246, 0.12)' }}
                      sx={{
                        height:'100%',
                        borderRadius: 3,
                        border:'1px solid',
                        borderColor: isLive ? alpha('#ef4444', 0.3) : alpha('#8b5cf6', 0.08),
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
                          background:'linear-gradient(90deg, #ef4444 0%, #f87171 100%)',
                          animation:'glow 2s infinite',
'@keyframes glow': {
'0%, 100%': { opacity: 1 },
'50%': { opacity: 0.7 },
                          },
                        }} />
                      )}

                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display:'flex', justifyContent:'space-between', mb: 2.5, alignItems:'flex-start' }}>
                          <Chip
                            label={isLive ?"LIVE NOW" :"UPCOMING"}
                            color={isLive ?"error" :"primary"}
                            size="small"
                            sx={{
                              fontWeight: 800,
                              fontSize:'0.65rem',
                              ...(isLive ? { animation:'blink 1s infinite','@keyframes blink': {'0%, 100%': { opacity: 1 },'50%': { opacity: 0.6 } } } : {}),
                            }}
                            icon={isLive ? <OnlineIcon sx={{ fontSize:'12px !important' }} /> : undefined}
                          />
                          <Typography variant="caption" sx={{ color:'text.secondary', fontWeight: 700 }}>
                            {session.duration} min
                          </Typography>
                        </Box>

                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2.5, minHeight: 52, lineHeight: 1.3 }}>
                          {session.topic}
                        </Typography>

                        <Stack spacing={2} sx={{ mb: 3 }}>
                          <Box sx={{ display:'flex', alignItems:'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 28, height: 28, bgcolor: alpha('#8b5cf6', 0.1), color:'#8b5cf6' }}>
                              <CalendarIcon sx={{ fontSize: 16 }} />
                            </Avatar>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {sessionDate.format('MMMM DD, YYYY')}
                            </Typography>
                          </Box>
                          <Box sx={{ display:'flex', alignItems:'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 28, height: 28, bgcolor: alpha('#8b5cf6', 0.1), color:'#8b5cf6' }}>
                              <TimeIcon sx={{ fontSize: 16 }} />
                            </Avatar>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {sessionDate.format('hh:mm A')}
                            </Typography>
                          </Box>
                          <Box sx={{ display:'flex', alignItems:'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 28, height: 28, bgcolor: alpha('#8b5cf6', 0.1), color:'#8b5cf6' }}>
                              <TeacherIcon sx={{ fontSize: 16 }} />
                            </Avatar>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {session.createdBy ||'Expert Instructor'}
                            </Typography>
                          </Box>
                        </Stack>

                        <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: alpha('#64748b', 0.02), border:'none', borderRadius: 2 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              color:'text.secondary',
                              fontWeight: 500,
                              display:'-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient:'vertical',
                              overflow:'hidden',
                            }}
                          >
                            {session.description ||'Join this live session to learn and discuss the topic in detail with your mentor.'}
                          </Typography>
                        </Paper>

                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<LaunchIcon />}
                          disabled={!session.joinUrl}
                          href={session.joinUrl}
                          target="_blank"
                          component={!session.joinUrl ?'button' :'a'}
                          onClick={!session.joinUrl ? undefined : undefined}
                          sx={{
                            py: 1.2,
                            fontWeight: 800,
                            background: isLive ?'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' :'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                            boxShadow: isLive ?'0 4px 12px rgba(239, 68, 68, 0.3)' :'0 4px 12px rgba(139, 92, 246, 0.3)',
'&:hover': {
                              background: isLive ?'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' :'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                            },
                          }}
                        >
                          {isLive ?'JOIN LIVE NOW' :'VIEW SESSION'}
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

export default LiveSessionsList;