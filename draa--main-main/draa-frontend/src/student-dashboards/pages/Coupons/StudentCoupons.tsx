import React, { useEffect, useState } from 'react';
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
  Stack,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  CardGiftcard as GiftIcon,
  ContentCopy as CopyIcon,
  Check as CheckedIcon,
  AccessTime as ExpiryIcon,
  LocalActivity as CouponIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';
import url from '../../../url';
import { getAuthHeaders } from '../../../utils/global_auth';
import DashboardLayout from '../../layouts/DashboardLayout';
import dayjs from 'dayjs';
import usePageTitle from '../../../hooks/usePageTitle';
import toast from '../../../utils/toast';

interface StudentCoupon {
  assignmentId: string;
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  description?: string;
  expiryDate: string;
}

const StudentCoupons: React.FC = () => {
  const [coupons, setCoupons] = useState<StudentCoupon[]>([]);
  usePageTitle('My Coupons | Draa');
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchMyCoupons = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${url}/coupons/my-coupons`, {
        headers: getAuthHeaders(),
      });
      if (res.data.success) {
        setCoupons(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load my coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCoupons();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Coupon code copied to clipboard!');
    setTimeout(() => setCopiedCode(null), 3000);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <LinearProgress sx={{ width: 200, borderRadius: 2 }} />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Header Block */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            mb: 4,
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative glows */}
          <Box sx={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(99, 102, 241, 0.15)', filter: 'blur(45px)' }} />
          <Box sx={{ position: 'absolute', bottom: -50, left: '10%', width: 140, height: 140, borderRadius: '50%', background: 'rgba(165, 180, 252, 0.1)', filter: 'blur(35px)' }} />

          <Stack spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
            <Chip
              label="EXCLUSIVE REWARDS"
              size="small"
              sx={{
                width: 'fit-content',
                bgcolor: alpha('#fff', 0.08),
                color: '#a5b4fc',
                fontWeight: 800,
                letterSpacing: 1.2,
                border: '1px solid rgba(255, 255, 255, 0.12)'
              }}
            />
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#ffffff !important', letterSpacing: '-0.02em' }}>
              My Coupons
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 500, fontWeight: 500, color: '#ffffff !important' }}>
              Here are your active assigned discount coupons. Apply these codes at checkout to unlock savings on courses, test series, and books.
            </Typography>
          </Stack>
        </Paper>

        {coupons.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              borderRadius: 3,
              textAlign: 'center',
              border: '1.5px dashed',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Box sx={{ display: 'inline-flex', p: 2, borderRadius: '50%', bgcolor: alpha('#6366f1', 0.06), color: '#6366f1', mb: 2 }}>
              <CouponIcon sx={{ fontSize: 40 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
              No Coupons Available
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 350, mx: 'auto', mb: 3 }}>
              You don't have any active assigned coupons at the moment. Keep an eye out for administrator distributions!
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              onClick={fetchMyCoupons}
              startIcon={<GiftIcon />}
              sx={{ fontWeight: 700, borderRadius: 2 }}
            >
              Refresh My Coupons
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {coupons.map((coupon, index) => {
              const discountStr = coupon.discountType === 'percentage'
                ? `${coupon.discountValue}% OFF`
                : `₹${coupon.discountValue} OFF`;
 
              return (
                <Grid item xs={12} md={6} key={coupon.assignmentId}>
                  <Card
                    component={motion.div}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      borderRadius: '24px',
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.02)',
                      background: 'background.paper',
                      overflow: 'hidden',
                      position: 'relative',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 15px 35px rgba(124, 58, 237, 0.08)',
                        borderColor: alpha('#7C3AED', 0.3)
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: -10,
                        left: { xs: 'none', sm: 160 },
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        bgcolor: 'background.default',
                        border: '1px solid',
                        borderColor: 'divider',
                        display: { xs: 'none', sm: 'block' },
                        zIndex: 2,
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: -10,
                        left: { xs: 'none', sm: 160 },
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        bgcolor: 'background.default',
                        border: '1px solid',
                        borderColor: 'divider',
                        display: { xs: 'none', sm: 'block' },
                        zIndex: 2,
                      }
                    }}
                  >
                    {/* Left Stub - Discount Value */}
                    <Box
                      sx={{
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)',
                        borderRight: { sm: '1px dashed' },
                        borderBottom: { xs: '1px dashed', sm: 'none' },
                        borderColor: 'divider',
                        minWidth: { sm: 170 },
                        maxWidth: { sm: 170 },
                        textAlign: 'center',
                        position: 'relative',
                        zIndex: 1
                      }}
                    >
                      <Box sx={{
                        width: 44, height: 44, borderRadius: '50%',
                        bgcolor: 'background.paper',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.03)',
                        mb: 1.5, color: '#7C3AED'
                      }}>
                        <GiftIcon sx={{ fontSize: 22 }} />
                      </Box>
                      <Typography variant="h4" sx={{ fontWeight: 900, color: '#7C3AED', lineHeight: 1.1, fontSize: '1.75rem', letterSpacing: '-0.02em' }}>
                        {discountStr}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.68rem' }}>
                        Discount Coupon
                      </Typography>
                    </Box>
 
                    {/* Right Stub - Coupon Code details */}
                    <CardContent sx={{ p: 4, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.8, letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                          {coupon.description || 'Promotional Offer'}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                          <ExpiryIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
                            Expires: {dayjs(coupon.expiryDate).format('MMM DD, YYYY')}
                          </Typography>
                        </Stack>
                      </Box>
 
                      <Divider sx={{ my: 2, opacity: 0.4 }} />
 
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                        {/* Monospace Code tag */}
                        <Box
                          sx={{
                            bgcolor: alpha('#7C3AED', 0.04),
                            border: '1.5px dashed',
                            borderColor: alpha('#7C3AED', 0.3),
                            borderRadius: '12px',
                            px: 3,
                            py: 1,
                            fontFamily: 'monospace',
                            fontSize: '1.05rem',
                            fontWeight: 850,
                            letterSpacing: 1.5,
                            color: '#7C3AED',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            userSelect: 'all'
                          }}
                        >
                          {coupon.code}
                        </Box>
 
                        <Tooltip title={copiedCode === coupon.code ? 'Copied!' : 'Copy Code'}>
                          <Button
                            variant="text"
                            onClick={() => handleCopyCode(coupon.code)}
                            startIcon={copiedCode === coupon.code ? <CheckedIcon sx={{ fontSize: 18 }} /> : <CopyIcon sx={{ fontSize: 18 }} />}
                            sx={{
                              fontWeight: 800,
                              borderRadius: '30px',
                              px: 3, py: 1.2,
                              fontSize: '0.85rem',
                              textTransform: 'none',
                              color: copiedCode === coupon.code ? 'success.main' : '#7C3AED',
                              bgcolor: alpha(copiedCode === coupon.code ? '#10b981' : '#7C3AED', 0.08),
                              '&:hover': {
                                bgcolor: alpha(copiedCode === coupon.code ? '#10b981' : '#7C3AED', 0.14),
                                transform: 'translateY(-1px)'
                              },
                              transition: 'all 0.2s'
                            }}
                          >
                            {copiedCode === coupon.code ? 'Copied' : 'Copy'}
                          </Button>
                        </Tooltip>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>

    </DashboardLayout>
  );
};

export default StudentCoupons;
