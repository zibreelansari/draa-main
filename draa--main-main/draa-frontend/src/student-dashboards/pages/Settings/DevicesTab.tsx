import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Divider,
  CircularProgress,
  Chip,
  alpha,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  LaptopMac as LaptopIcon,
  PhoneAndroid as PhoneIcon,
  TabletMac as TabletIcon,
  DevicesOther as DevicesIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Logout as LogoutIcon,
  CheckCircle as CurrentIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import url from '../../../url';
import toast from '../../../utils/toast';

interface Device {
  deviceId: string;
  deviceType: string;
  browser: string;
  os: string;
  ipAddress: string;
  location: string;
  lastUsedAt: string;
  registeredAt: string;
  isCurrent: boolean;
}

interface DevicesTabProps {
  token: string;
}

const DevicesTab: React.FC<DevicesTabProps> = ({ token }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<'single' | 'all' | null>(null);
  const [targetDevice, setTargetDevice] = useState<{ id: string; isCurrent: boolean } | null>(null);

  const fetchDevices = async () => {
    try {
      const res = await axios.get(`${url}/student/devices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setDevices(res.data.devices || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch devices:', err);
      toast.error('Could not load active devices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDevices();
    }
  }, [token]);

  const executeLogout = async (deviceId: string, isCurrent: boolean) => {
    setActionLoading(deviceId);
    try {
      const res = await axios.post(`${url}/student/devices/logout`, { deviceId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success(isCurrent ? 'Logged out of current device' : 'Logged out of device session');
        if (isCurrent) {
          localStorage.removeItem('edudocs');
          window.location.href = '/';
        } else {
          setDevices(prev => prev.filter(d => d.deviceId !== deviceId));
        }
      }
    } catch (err: any) {
      console.error('Failed to log out device:', err);
      toast.error(err.response?.data?.message || 'Failed to log out device');
    } finally {
      setActionLoading(null);
    }
  };

  const executeLogoutAll = async () => {
    setActionLoading('all');
    try {
      const res = await axios.post(`${url}/student/devices/logout`, { all: true }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success('Logged out from all devices');
        localStorage.removeItem('edudocs');
        window.location.href = '/';
      }
    } catch (err: any) {
      console.error('Failed to log out all devices:', err);
      toast.error(err.response?.data?.message || 'Failed to log out all devices');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = (deviceId: string, isCurrent: boolean) => {
    setTargetDevice({ id: deviceId, isCurrent });
    setConfirmType('single');
    setConfirmOpen(true);
  };

  const handleLogoutAll = () => {
    setConfirmType('all');
    setConfirmOpen(true);
  };

  const handleConfirmSubmit = () => {
    setConfirmOpen(false);
    if (confirmType === 'all') {
      executeLogoutAll();
    } else if (confirmType === 'single' && targetDevice) {
      executeLogout(targetDevice.id, targetDevice.isCurrent);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'mobile':
        return <PhoneIcon sx={{ fontSize: 28, color: '#6366F1' }} />;
      case 'tablet':
        return <TabletIcon sx={{ fontSize: 28, color: '#3B82F6' }} />;
      default:
        return <LaptopIcon sx={{ fontSize: 28, color: '#10B981' }} />;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress size={40} sx={{ color: '#7C3AED' }} />
      </Box>
    );
  }

  const currentDevice = devices.find(d => d.isCurrent);
  const otherDevices = devices.filter(d => !d.isCurrent);

  const renderDeviceCard = (device: Device) => (
    <Paper
      key={device.deviceId}
      component={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      sx={{
        p: 3,
        mb: 2.5,
        borderRadius: '20px',
        border: '1px solid',
        borderColor: device.isCurrent ? alpha('#10B981', 0.25) : 'divider',
        bgcolor: device.isCurrent ? alpha('#ECFDF5', 0.4) : 'background.paper',
        boxShadow: 'none',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: 3,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5 }}>
        <Box
          sx={{
            p: 1.8,
            borderRadius: '16px',
            bgcolor: device.isCurrent ? alpha('#10B981', 0.1) : alpha('#6366F1', 0.06),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {getDeviceIcon(device.deviceType)}
        </Box>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.05rem' }}>
              {device.browser} ({device.os})
            </Typography>
            {device.isCurrent && (
              <Chip
                label="This device"
                size="small"
                color="success"
                icon={<CurrentIcon sx={{ fontSize: '12px !important' }} />}
                sx={{
                  height: 20,
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  borderRadius: '6px',
                  bgcolor: '#ECFDF5',
                  color: '#059669',
                  border: '1px solid',
                  borderColor: alpha('#059669', 0.15),
                  '& .MuiChip-icon': { color: '#059669' }
                }}
              />
            )}
            {!device.isCurrent && (
              <Chip
                label="Recent login"
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  borderRadius: '6px',
                  bgcolor: alpha('#6366F1', 0.08),
                  color: '#4F46E5',
                }}
              />
            )}
          </Stack>
          
          <Stack spacing={0.6} sx={{ color: 'text.secondary', fontSize: '0.88rem', fontWeight: 500 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimeIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
              <span>Last used on {formatDate(device.lastUsedAt)}</span>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
              <span>{device.location}</span>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.disabled', fontSize: '0.8rem' }}>
              <span>IP: {device.ipAddress}</span>
              <span>•</span>
              <span>Registered on {formatDate(device.registeredAt)}</span>
            </Box>
          </Stack>
        </Box>
      </Box>

      <Button
        variant="outlined"
        color="error"
        onClick={() => handleLogout(device.deviceId, device.isCurrent)}
        disabled={actionLoading === device.deviceId}
        startIcon={actionLoading === device.deviceId ? <CircularProgress size={16} color="inherit" /> : <LogoutIcon sx={{ fontSize: 16 }} />}
        sx={{
          borderRadius: '12px',
          fontWeight: 700,
          textTransform: 'none',
          px: 3.5,
          py: 1,
          fontSize: '0.85rem',
          borderWidth: '1.5px',
          borderColor: alpha('#EF4444', 0.3),
          '&:hover': {
            borderWidth: '1.5px',
            bgcolor: alpha('#EF4444', 0.04),
          }
        }}
      >
        Log Out
      </Button>
    </Paper>
  );

  return (
    <Box>
      {/* Introduction */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>
          Manage Devices
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          View and manage all active browser and device sessions logged in to your account.
        </Typography>
      </Box>

      <Divider sx={{ mb: 5, opacity: 0.5 }} />

      {/* This Device Section */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '1px', mb: 3 }}>
          This Device
        </Typography>
        {currentDevice ? renderDeviceCard(currentDevice) : (
          <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
            No information available for the current session.
          </Typography>
        )}
      </Box>

      {/* Other Devices Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '1px', mb: 3 }}>
          Other Logged-in Devices
        </Typography>
        
        <AnimatePresence mode="popLayout">
          {otherDevices.length > 0 ? (
            otherDevices.map(renderDeviceCard)
          ) : (
            <Paper
              component={motion.div}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              sx={{
                p: 4,
                borderRadius: '20px',
                border: '1px dashed',
                borderColor: 'divider',
                bgcolor: 'transparent',
                textAlign: 'center',
                boxShadow: 'none'
              }}
            >
              <DevicesIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1.5, opacity: 0.5 }} />
              <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                No other devices are currently logged in.
              </Typography>
            </Paper>
          )}
        </AnimatePresence>
      </Box>

      {/* Logout All Button */}
      {devices.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6, borderTop: '1px solid', borderColor: 'divider', pt: 5 }}>
          <Button
            variant="contained"
            color="error"
            onClick={handleLogoutAll}
            disabled={actionLoading === 'all'}
            startIcon={actionLoading === 'all' ? <CircularProgress size={18} color="inherit" /> : <LogoutIcon />}
            sx={{
              borderRadius: '20px',
              fontWeight: 800,
              px: 6,
              py: 1.8,
              fontSize: '0.95rem',
              textTransform: 'none',
              bgcolor: '#EF4444',
              boxShadow: '0 10px 25px rgba(239, 68, 68, 0.25)',
              '&:hover': {
                bgcolor: '#DC2626',
                boxShadow: '0 15px 30px rgba(239, 68, 68, 0.35)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s'
            }}
          >
            LOG OUT FROM ALL DEVICES
          </Button>
        </Box>
      )}

      {/* Premium Custom Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '24px',
            p: 2.5,
            maxWidth: 440,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
            bgcolor: 'background.paper',
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.25rem', pb: 1, px: 2, pt: 1 }}>
          {confirmType === 'all' ? 'Log Out of All Devices?' : 'Log Out of Device?'}
        </DialogTitle>
        <DialogContent sx={{ px: 2 }}>
          <DialogContentText sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.95rem', lineHeight: 1.5 }}>
            {confirmType === 'all' 
              ? 'Are you sure you want to end all active sessions? You will need to log back in on every device.' 
              : targetDevice?.isCurrent
                ? 'Logging out of this device will end your current session and redirect you to the home page.'
                : 'Are you sure you want to log out of this active session?'}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 1, pt: 2, gap: 1.5 }}>
          <Button
            onClick={() => setConfirmOpen(false)}
            variant="text"
            sx={{
              borderRadius: '12px',
              fontWeight: 700,
              textTransform: 'none',
              color: 'text.secondary',
              px: 3, py: 1.2,
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmSubmit}
            variant="contained"
            color="error"
            autoFocus
            sx={{
              borderRadius: '12px',
              fontWeight: 800,
              textTransform: 'none',
              px: 4, py: 1.2,
              bgcolor: '#EF4444',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)',
              '&:hover': {
                bgcolor: '#DC2626',
                boxShadow: '0 6px 16px rgba(239, 68, 68, 0.25)',
              }
            }}
          >
            Yes, Log Out
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DevicesTab;
