import React from'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  LinearProgress,
  Stack,
  alpha,
  useMediaQuery,
  useTheme
} from'@mui/material';
import {
  TrendingUp as UpIcon,
  TrendingDown as DownIcon,
  Remove as StableIcon
} from'@mui/icons-material';

interface MetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color?: string;
  trend?:'up' |'down' |'stable';
  trendValue?: string;
  progress?: number;
  progressLabel?: string;
  onClick?: () => void;
}

const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color ='#6366f1',
  trend,
  trendValue,
  progress,
  progressLabel,
  onClick
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: onClick ?'pointer' :'default',
        transition:'all 0.3s ease',
'&:hover': onClick ? {
          transform:'translateY(-4px)',
          boxShadow: `0 12px 24px ${alpha(color, 0.3)}`,
          borderColor: alpha(color, 0.5)
        } : {}
      }}
    >
      <CardContent>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 800,
                color:'text.secondary',
                letterSpacing: 1,
                textTransform:'uppercase'
              }}
            >
              {title}
            </Typography>

            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
              <Typography
                variant={isMobile ?"h5" :"h4"}
                sx={{
                  fontWeight: 800,
                  color: color,
                  lineHeight: 1.2
                }}
              >
                {value}
              </Typography>

              {trend && (
                <Box sx={{ display:'flex', alignItems:'center' }}>
                  {trend ==='up' && <UpIcon sx={{ color:'#10b981', fontSize: 18 }} />}
                  {trend ==='down' && <DownIcon sx={{ color:'#ef4444', fontSize: 18 }} />}
                  {trend ==='stable' && <StableIcon sx={{ color:'#94a3b8', fontSize: 18 }} />}
                  {trendValue && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: trend ==='up' ?'#10b981' : trend ==='down' ?'#ef4444' :'#94a3b8',
                        fontWeight: 700
                      }}
                    >
                      {trendValue}
                    </Typography>
                  )}
                </Box>
              )}
            </Stack>

            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display:'block' }}>
                {subtitle}
              </Typography>
            )}

            {progress !== undefined && (
              <Box sx={{ mt: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {progressLabel ||'Progress'}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color }}>
                    {progress}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: alpha(color, 0.1),
'& .MuiLinearProgress-bar': {
                      bgcolor: color,
                      borderRadius: 4
                    }
                  }}
                />
              </Box>
            )}
          </Box>

          <Avatar
            sx={{
              bgcolor: alpha(color, 0.1),
              color: color,
              width: 56,
              height: 56
            }}
          >
            {icon}
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default MetricsCard;