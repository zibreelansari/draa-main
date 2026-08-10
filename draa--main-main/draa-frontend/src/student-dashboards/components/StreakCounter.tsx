import React from'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  LinearProgress,
  alpha,
  keyframes
} from'@mui/material';
import {
  LocalFireDepartment as FireIcon,
  Whatshot as FireOutlineIcon
} from'@mui/icons-material';

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
  goal?: number;
  compact?: boolean;
  showDetails?: boolean;
}

// Flame animation
const flickerAnimation = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
`;

const StreakCounter: React.FC<StreakCounterProps> = ({
  currentStreak,
  longestStreak,
  goal = 7,
  compact = false,
  showDetails = true
}) => {
  const progressToGoal = Math.min((currentStreak / goal) * 100, 100);
  const isOnFire = currentStreak >= 7;
  const isMilestone = currentStreak === 7 || currentStreak === 14 || currentStreak === 30 || currentStreak === 100;

  if (compact) {
    return (
      <Paper
        sx={{
          px: 2,
          py: 1,
          borderRadius: 2,
          bgcolor: alpha(isOnFire ?'#f59e0b' :'#94a3b8', 0.1),
          border:'1px solid',
          borderColor: alpha(isOnFire ?'#f59e0b' :'#94a3b8', 0.2),
          display:'flex',
          alignItems:'center',
          gap: 1
        }}
      >
        <FireIcon sx={{ color: isOnFire ?'#f59e0b' :'#94a3b8', fontSize: 20 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: isOnFire ?'#f59e0b' :'text.secondary' }}>
          {currentStreak}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          day streak
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 3,
        background: isOnFire
          ?'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.1) 100%)'
          :'background.paper',
        border:'1px solid',
        borderColor: alpha(isOnFire ?'#f59e0b' :'#94a3b8', 0.2),
        textAlign:'center'
      }}
    >
      {/* Fire Icon with Animation */}
      <Box
        sx={{
          display:'inline-flex',
          alignItems:'center',
          justifyContent:'center',
          animation: isOnFire ? `${flickerAnimation} 1.5s ease-in-out infinite` :'none'
        }}
      >
        {isOnFire ? (
          <FireIcon
            sx={{
              fontSize: 80,
              color:'#f59e0b',
              filter:'drop-shadow(0 0 12px rgba(245, 158, 11, 0.6))'
            }}
          />
        ) : (
          <FireOutlineIcon
            sx={{
              fontSize: 80,
              color:'#94a3b8',
              opacity: 0.5
            }}
          />
        )}
      </Box>

      {/* Streak Count */}
      <Typography
        variant="h2"
        sx={{
          fontWeight: 900,
          color: isOnFire ?'#f59e0b' :'text.primary',
          lineHeight: 1,
          mt: 2
        }}
      >
        {currentStreak}
      </Typography>

      <Typography variant="h6" sx={{ fontWeight: 700, color:'text.secondary', mt: 0.5 }}>
        Day Streak
      </Typography>

      {isMilestone && (
        <Box
          sx={{
            display:'inline-block',
            mt: 1,
            px: 2,
            py: 0.5,
            borderRadius: 2,
            bgcolor:'#10b981',
            color:'#fff'
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 800 }}>
             MILESTONE!
          </Typography>
        </Box>
      )}

      {showDetails && (
        <>
          {/* Progress to Goal */}
          <Box sx={{ mt: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Goal: {goal} days
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 800, color:'#f59e0b' }}>
                {Math.round(progressToGoal)}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={progressToGoal}
              sx={{
                height: 10,
                borderRadius: 5,
                backgroundColor: alpha('#f59e0b', 0.15),
'& .MuiLinearProgress-bar': {
                  bgcolor:'#f59e0b',
                  borderRadius: 5,
                  boxShadow: isOnFire ?'0 0 10px rgba(245, 158, 11, 0.5)' :'none'
                }
              }}
            />
          </Box>

          {/* Longest Streak */}
          <Stack
            direction="row"
            justifyContent="center"
            spacing={4}
            sx={{ mt: 3, pt: 2, borderTop:'1px solid', borderColor:'divider' }}
          >
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {longestStreak}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Best Streak
              </Typography>
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color:'#10b981' }}>
                {goal - currentStreak > 0 ? goal - currentStreak : 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                To Next Goal
              </Typography>
            </Box>
          </Stack>
        </>
      )}

      {/* Motivational Message */}
      {currentStreak === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Start your streak today! Complete an activity to begin.
        </Typography>
      )}
      {currentStreak > 0 && currentStreak < 7 && (
        <Typography variant="body2" sx={{ mt: 2, color:'#f59e0b' }}>
          Keep going! {7 - currentStreak} more days to reach Week Warrior!
        </Typography>
      )}
      {currentStreak >= 7 && currentStreak < 30 && (
        <Typography variant="body2" sx={{ mt: 2, color:'#10b981' }}>
          Week Warrior achieved! {30 - currentStreak} days to Month Master!
        </Typography>
      )}
      {currentStreak >= 30 && (
        <Typography variant="body2" sx={{ mt: 2, color:'#10b981' }}>
          Month Master! You're on fire! 
        </Typography>
      )}
    </Paper>
  );
};

export default StreakCounter;