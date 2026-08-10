import React from'react';
import {
  Box,
  Typography,
  Tooltip,
  Paper,
  Chip,
  Stack,
  alpha
} from'@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  WorkspacePremium as PremiumIcon,
  MilitaryTech as TechIcon
} from'@mui/icons-material';

interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedAt?: string;
}

interface AchievementBadgeProps {
  badge: Badge;
  size?:'small' |'medium' |'large';
  showName?: boolean;
  showDescription?: boolean;
  earned?: boolean;
  onClick?: () => void;
}

const sizeMap = {
  small: { icon: 24, font: 12 },
  medium: { icon: 40, font: 16 },
  large: { icon: 64, font: 20 }
};

const getIconComponent = (icon: string) => {
  if (icon.includes('') || icon.includes('trophy')) return <TrophyIcon />;
  if (icon.includes('') || icon.includes('star')) return <StarIcon />;
  if (icon.includes('') || icon.includes('premium')) return <PremiumIcon />;
  if (icon.includes('') || icon.includes('tech')) return <TechIcon />;
  return <TrophyIcon />;
};

const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  badge,
  size ='medium',
  showName = true,
  showDescription = false,
  earned = true,
  onClick
}) => {
  const sizes = sizeMap[size];
  const bgColor = earned ?'#f59e0b' :'#94a3b8';

  return (
    <Tooltip
      title={
        <Box sx={{ p: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {badge.name}
          </Typography>
          <Typography variant="caption" sx={{ display:'block', mt: 0.5 }}>
            {badge.description}
          </Typography>
          {badge.earnedAt && (
            <Typography variant="caption" sx={{ display:'block', mt: 0.5, opacity: 0.7 }}>
              Earned: {new Date(badge.earnedAt).toLocaleDateString()}
            </Typography>
          )}
          {!earned && (
            <Typography variant="caption" sx={{ display:'block', mt: 0.5, color:'#f59e0b' }}>
              Locked - Keep learning to unlock!
            </Typography>
          )}
        </Box>
      }
      arrow
    >
      <Paper
        onClick={onClick}
        elevation={earned ? 2 : 0}
        sx={{
          p: 1.5,
          textAlign:'center',
          cursor: onClick ?'pointer' :'default',
          border:'1px solid',
          borderColor: earned ? alpha(bgColor, 0.3) :'divider',
          bgcolor: earned ? alpha(bgColor, 0.08) :'background.paper',
          borderRadius: 2,
          transition:'all 0.2s',
          opacity: earned ? 1 : 0.5,
'&:hover': onClick ? {
            transform:'scale(1.05)',
            borderColor: bgColor
          } : {}
        }}
      >
        <Box
          sx={{
            width: sizes.icon,
            height: sizes.icon,
            borderRadius:'50%',
            bgcolor: alpha(bgColor, 0.15),
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            mx:'auto',
            mb: 1,
            position:'relative'
          }}
        >
          <Typography sx={{ fontSize: sizes.font }}>
            {badge.icon}
          </Typography>
          {!earned && (
            <Box
              sx={{
                position:'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display:'flex',
                alignItems:'center',
                justifyContent:'center',
                bgcolor: alpha('#000', 0.3),
                borderRadius:'50%'
              }}
            >
              <Typography sx={{ fontSize: 10 }}></Typography>
            </Box>
          )}
        </Box>

        {showName && (
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              display:'block',
              color: earned ?'text.primary' :'text.disabled',
              lineHeight: 1.2
            }}
          >
            {badge.name}
          </Typography>
        )}

        {showDescription && earned && (
          <Typography
            variant="caption"
            sx={{
              display:'block',
              color:'text.secondary',
              fontSize:'0.65rem',
              mt: 0.5
            }}
          >
            {badge.description}
          </Typography>
        )}
      </Paper>
    </Tooltip>
  );
};

// Badge Grid Component
interface BadgeGridProps {
  badges: Badge[];
  earnedBadges: Badge[];
  size?:'small' |'medium' |'large';
  limit?: number;
}

export const BadgeGrid: React.FC<BadgeGridProps> = ({
  badges,
  earnedBadges,
  size ='medium',
  limit
}) => {
  const displayedBadges = limit ? badges.slice(0, limit) : badges;

  return (
    <Stack
      direction="row"
      flexWrap="wrap"
      spacing={2}
      sx={{
'& > *': {
          flexBasis: size ==='small' ?'auto' : size ==='medium' ?'calc(33.33% - 16px)' :'calc(25% - 18px)'
        }
      }}
    >
      {displayedBadges.map((badge) => {
        const isEarned = earnedBadges.some(b => b.id === badge.id);
        return (
          <AchievementBadge
            key={badge.id}
            badge={badge}
            size={size}
            earned={isEarned}
          />
        );
      })}
    </Stack>
  );
};

export default AchievementBadge;