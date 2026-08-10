import React from'react';
import { Box, Typography, alpha } from'@mui/material';

interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  sublabel?: string;
  showValue?: boolean;
  backgroundColor?: string;
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  size = 120,
  strokeWidth = 10,
  color ='#6366f1',
  label,
  sublabel,
  showValue = true,
  backgroundColor = alpha('#000', 0.1)
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <Box
      sx={{
        position:'relative',
        width: size,
        height: size,
        display:'inline-flex',
        alignItems:'center',
        justifyContent:'center'
      }}
    >
      <svg
        width={size}
        height={size}
        style={{ transform:'rotate(-90deg)', position:'absolute' }}
      >
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition:'stroke-dashoffset 0.5s ease-in-out',
            filter: `drop-shadow(0 0 6px ${alpha(color, 0.5)})`
          }}
        />
      </svg>

      {/* Center Content */}
      <Box
        sx={{
          position:'relative',
          textAlign:'center',
          zIndex: 1
        }}
      >
        {showValue && (
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: color,
              lineHeight: 1
            }}
          >
            {Math.round(value)}%
          </Typography>
        )}
        {label && (
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color:'text.secondary',
              display:'block',
              mt: 0.5
            }}
          >
            {label}
          </Typography>
        )}
        {sublabel && (
          <Typography
            variant="caption"
            sx={{
              color:'text.disabled',
              display:'block'
            }}
          >
            {sublabel}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

// Compact Progress Ring for inline use
interface CompactProgressRingProps {
  value: number;
  size?: number;
  color?: string;
}

export const CompactProgressRing: React.FC<CompactProgressRingProps> = ({
  value,
  size = 40,
  color ='#6366f1'
}) => {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <Box sx={{ position:'relative', width: size, height: size }}>
      <svg
        width={size}
        height={size}
        style={{ transform:'rotate(-90deg)' }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={alpha(color, 0.15)}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition:'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <Typography
        variant="caption"
        sx={{
          position:'absolute',
          top:'50%',
          left:'50%',
          transform:'translate(-50%, -50%)',
          fontWeight: 700,
          fontSize:'0.65rem',
          color
        }}
      >
        {Math.round(value)}%
      </Typography>
    </Box>
  );
};

export default ProgressRing;