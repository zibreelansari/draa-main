import React from'react';
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Chip,
  Stack,
  alpha,
  useMediaQuery,
  useTheme
} from'@mui/material';
import {
  EmojiEvents as TrophyIcon,
  LocalFireDepartment as FireIcon
} from'@mui/icons-material';

interface LeaderboardRowProps {
  rank: number;
  name: string;
  avatar?: string;
  points: number;
  streak?: number;
  avgScore?: number;
  coursesCompleted?: number;
  isCurrentUser?: boolean;
  level?: number;
  onClick?: () => void;
}

const getRankColor = (rank: number) => {
  switch (rank) {
    case 1: return'#ffd700'; // Gold
    case 2: return'#c0c0c0'; // Silver
    case 3: return'#cd7f32'; // Bronze
    default: return'#94a3b8';
  }
};

const getRankIcon = (rank: number) => {
  if (rank === 1) return'';
  if (rank === 2) return'';
  if (rank === 3) return'';
  return `#${rank}`;
};

const LeaderboardRow: React.FC<LeaderboardRowProps> = ({
  rank,
  name,
  avatar,
  points,
  streak = 0,
  avgScore = 0,
  coursesCompleted = 0,
  isCurrentUser = false,
  level = 1,
  onClick
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTopThree = rank <= 3;
  const rankColor = getRankColor(rank);

  return (
    <Paper
      onClick={onClick}
      sx={{
        p: 2,
        borderRadius: 2,
        cursor: onClick ?'pointer' :'default',
        transition:'all 0.2s',
        border:'1px solid',
        borderColor: isCurrentUser
          ? alpha('#6366f1', 0.5)
          : isTopThree
            ? alpha(rankColor, 0.3)
            :'transparent',
        bgcolor: isCurrentUser
          ? alpha('#6366f1', 0.05)
          : isTopThree
            ? alpha(rankColor, 0.05)
            :'background.paper',
        boxShadow: isTopThree
          ? `0 4px 12px ${alpha(rankColor, 0.2)}`
          :'none',
'&:hover': onClick ? {
          transform:'translateX(4px)',
          boxShadow: `0 4px 12px ${alpha('#6366f1', 0.15)}`,
          borderColor: alpha('#6366f1', 0.3)
        } : {},
        position:'relative',
        overflow:'hidden'
      }}
    >
      {/* Background Decoration for Top 3 */}
      {isTopThree && (
        <Box
          sx={{
            position:'absolute',
            right: -20,
            top: -20,
            width: 80,
            height: 80,
            borderRadius:'50%',
            bgcolor: alpha(rankColor, 0.1),
            opacity: 0.5
          }}
        />
      )}

      <Stack direction="row" alignItems="center" spacing={2}>
        {/* Rank */}
        <Box
          sx={{
            width: isMobile ? 36 : 48,
            height: isMobile ? 36 : 48,
            borderRadius:'50%',
            bgcolor: isTopThree ? alpha(rankColor, 0.2) : alpha('#94a3b8', 0.1),
            border: isMobile ?'1px solid' :'2px solid',
            borderColor: rankColor,
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            flexShrink: 0
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 800,
              color: rankColor,
              fontSize: isTopThree ? (isMobile ?'0.875rem' :'1rem') : (isMobile ?'0.75rem' :'0.875rem')
            }}
          >
            {rank <= 3 ? (
              <TrophyIcon sx={{ fontSize: isMobile ? 18 : 24, color: rankColor }} />
            ) : (
              rank
            )}
          </Typography>
        </Box>

        {/* Avatar */}
        <Avatar
          src={avatar}
          sx={{
            width: isMobile ? 36 : 48,
            height: isMobile ? 36 : 48,
            border:'2px solid',
            borderColor: isCurrentUser ?'#6366f1' :'transparent',
            boxShadow: isCurrentUser ? `0 0 0 2px ${alpha('#6366f1', 0.3)}` :'none'
          }}
        >
          {name?.[0]?.toUpperCase() ||'U'}
        </Avatar>

        {/* Name & Stats */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                overflow:'hidden',
                textOverflow:'ellipsis',
                whiteSpace:'nowrap',
                color: isCurrentUser ?'#6366f1' :'text.primary'
              }}
            >
              {name}
            </Typography>
            {isCurrentUser && (
              <Chip
                label="You"
                size="small"
                sx={{
                  height: 18,
                  fontSize:'0.65rem',
                  fontWeight: 700,
                  bgcolor:'#6366f1',
                  color:'#fff'
                }}
              />
            )}
            {level > 1 && (
              <Chip
                label={`Lv.${level}`}
                size="small"
                sx={{
                  height: 18,
                  fontSize:'0.65rem',
                  fontWeight: 700,
                  bgcolor: alpha('#10b981', 0.1),
                  color:'#10b981'
                }}
              />
            )}
          </Stack>

          {/* Mini Stats */}
          <Stack direction="row" flexWrap="wrap" gap={isMobile ? 1 : 2} sx={{ mt: 0.5 }}>
            {streak > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ display:'flex', alignItems:'center', gap: 0.5, fontSize: isMobile ?'0.65rem' :'0.75rem' }}>
                 {streak}
              </Typography>
            )}
            {avgScore > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: isMobile ?'0.65rem' :'0.75rem' }}>
                Avg: {avgScore}%
              </Typography>
            )}
            {coursesCompleted > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: isMobile ?'0.65rem' :'0.75rem' }}>
                 {coursesCompleted}
              </Typography>
            )}
          </Stack>
        </Box>

        {/* Points */}
        <Box sx={{ textAlign:'right', flexShrink: 0 }}>
          <Typography
            variant={isMobile ?"subtitle1" :"h6"}
            sx={{
              fontWeight: 800,
              color: isTopThree ? rankColor :'#6366f1'
            }}
          >
            {points.toLocaleString()}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: isMobile ?'0.65rem' :'0.75rem' }}>
            points
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

export default LeaderboardRow;