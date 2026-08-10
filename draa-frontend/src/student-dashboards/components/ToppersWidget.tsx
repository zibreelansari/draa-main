import React, { useState, useEffect } from'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Stack,
  alpha,
  Skeleton,
  IconButton,
  Tooltip
} from'@mui/material';
import {
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
  EmojiEvents as MedalIcon,
  Star as StarIcon
} from'@mui/icons-material';
import { motion, AnimatePresence } from'framer-motion';
import axios from'axios';
import url from'../../url';

interface Topper {
  _id: string;
  name: string;
  rank: string;
  examName: string;
  year: string;
  imageUrl?: string;
}

const ToppersWidget: React.FC = () => {
  const [toppers, setToppers] = useState<Topper[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchToppers = async () => {
      try {
        const res = await axios.get(`${url}/toppers/all`);
        if (res.data.success) {
          setToppers(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch toppers');
      } finally {
        setLoading(false);
      }
    };
    fetchToppers();
  }, []);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % toppers.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + toppers.length) % toppers.length);
  };

  if (loading) {
    return (
      <Card sx={{ border:'1px solid', borderColor: alpha('#6366f1', 0.08) }}>
        <CardContent sx={{ p: 3 }}>
          <Skeleton variant="text" width={100} height={24} sx={{ mb: 2 }} />
          <Box sx={{ display:'flex', gap: 2, alignItems:'center' }}>
            <Skeleton variant="circular" width={60} height={60} />
            <Box sx={{ flexGrow: 1 }}>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" />
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (toppers.length === 0) return null;

  const current = toppers[activeIndex];

  return (
    <Card
      sx={{
        border:'1px solid',
        borderColor: alpha('#f59e0b', 0.15),
        background:'linear-gradient(135deg, rgba(245,158,11,0.03) 0%, rgba(245,158,11,0.01) 100%)',
        position:'relative',
        overflow:'hidden'
      }}
    >
      <Box sx={{ position:'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius:'50%', background:'rgba(245,158,11,0.05)', filter:'blur(10px)' }} />

      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb: 2 }}>
          <Box sx={{ display:'flex', alignItems:'center', gap: 1 }}>
            <MedalIcon sx={{ color:'#f59e0b', fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color:'warning.main' }}>
              WALL OF FAME
            </Typography>
          </Box>
          <Box>
            <IconButton size="small" onClick={handlePrev} disabled={toppers.length <= 1}>
              <ChevronLeftIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton size="small" onClick={handleNext} disabled={toppers.length <= 1}>
              <ChevronRightIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>

        <AnimatePresence mode="wait">
          <Box
            key={current._id}
            component={motion.div}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            sx={{ display:'flex', alignItems:'center', gap: 2 }}
          >
            <Avatar
              src={current.imageUrl}
              sx={{
                width: 60,
                height: 60,
                border:'2px solid #f59e0b',
                boxShadow: `0 4px 12px ${alpha('#f59e0b', 0.2)}`,
                bgcolor: alpha('#f59e0b', 0.1),
                color:'#f59e0b',
                fontWeight: 800
              }}
            >
              {current.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color:'text.primary', mb: 0.2 }}>
                {current.name}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography
                  variant="caption"
                  sx={{
                    bgcolor: alpha('#f59e0b', 0.1),
                    color:'#f59e0b',
                    px: 1,
                    py: 0.2,
                    borderRadius: 1,
                    fontWeight: 800
                  }}
                >
                  {current.rank}
                </Typography>
                <Typography variant="caption" sx={{ color:'text.secondary', fontWeight: 600 }}>
                  {current.examName}  {current.year}
                </Typography>
              </Stack>
            </Box>
          </Box>
        </AnimatePresence>

        <Box sx={{ mt: 2.5, px: 1, py: 1.5, bgcolor: alpha('#6366f1', 0.05), borderRadius: 2, border:'1px solid', borderColor: alpha('#6366f1', 0.1) }}>
          <Typography variant="body2" sx={{ fontStyle:'italic', color:'text.secondary', fontWeight: 500, fontSize:'0.8rem' }}>
            Thousands of students cracked their dreams with Draa. You're next!
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ToppersWidget;
