import React from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';

const DashboardLoader: React.FC = () => {
  return (
    <Box
      sx={{
        width: '100%',
        height: '60vh',
        minHeight: 400,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'transparent',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: 140,
          height: 140,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Outer Ring 1 - Fast Clockwise */}
        <Box
          component={motion.div}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          sx={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '2.5px solid transparent',
            borderTopColor: '#6366f1',
            borderBottomColor: '#ec4899',
            filter: 'drop-shadow(0 0 10px rgba(99, 102, 241, 0.45))',
          }}
        />

        {/* Inner Ring 2 - Slow Counter-Clockwise */}
        <Box
          component={motion.div}
          animate={{ rotate: -360 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
          sx={{
            position: 'absolute',
            inset: 12,
            borderRadius: '50%',
            border: '2.5px solid transparent',
            borderRightColor: '#8b5cf6',
            borderLeftColor: '#f59e0b',
            filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.35))',
          }}
        />

        {/* Logo Center with Pulse & Glow */}
        <Box
          component={motion.div}
          animate={{
            scale: [0.95, 1.05, 0.95],
            boxShadow: [
              '0 0 20px rgba(99, 102, 241, 0.25)',
              '0 0 35px rgba(99, 102, 241, 0.55)',
              '0 0 20px rgba(99, 102, 241, 0.25)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          sx={{
            width: 84,
            height: 84,
            borderRadius: '50%',
            background: '#ffffff',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 3,
            padding: 1.5,
            border: '1px solid rgba(226, 232, 240, 0.8)',
          }}
        >
          <Box
            component="img"
            src="/EduDocsNewLogo.png"
            alt="Draa"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLoader;
