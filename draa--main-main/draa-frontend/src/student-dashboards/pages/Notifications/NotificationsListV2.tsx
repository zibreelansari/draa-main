import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  Chip,
  alpha,
  Avatar,
  IconButton,
  Tooltip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Badge,
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  Notifications as BellIcon,
  Delete as TrashIcon,
  Drafts as UnreadIcon,
  MarkEmailRead as ReadIcon,
  Refresh as RefreshIcon,
  School as CourseIcon,
  Book as BookIcon,
  Work as JobIcon,
  Info as InfoIcon,
  DoneAll as DoubleTickIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { default as uri } from '../../../url';
import socket from '../../../utils/socket';
import DashboardLayout from '../../layouts/DashboardLayout';
import EmptyState from '../../components/EmptyState';
import DashboardLoader from '../../components/DashboardLoader';
import usePageTitle from '../../../hooks/usePageTitle';
import toast from '../../../utils/toast';

export interface NotificationItem {
  _id: string;
  recipient: string;
  recipientModel: string;
  sender: string | null;
  senderModel: string;
  senderName: string;
  type: 'course_upload' | 'content_upload' | 'book_upload' | 'job_alert' | 'general';
  title: string;
  message: string;
  referenceId: string | null;
  isRead: boolean;
  readBy: string[];
  createdAt: string;
}

const NotificationsListV2: React.FC = () => {
  usePageTitle('Notifications | Draa');
  const theme = useTheme();

  // Load user data
  const loginUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('edudocs') || '{}');
    } catch {
      return {};
    }
  }, []);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'read'>('all');

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [notifToDelete, setNotifToDelete] = useState<string | null>(null);
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState<boolean>(false);

  const fetchNotifications = async () => {
    if (!loginUser?.token) return;
    try {
      setLoading(true);
      const response = await fetch(`${uri}/notifications`, {
        headers: {
          Authorization: `Bearer ${loginUser.token}`
        }
      });
      const resData = await response.json();
      if (resData.success && resData.data) {
        setNotifications(resData.data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    if (loginUser?.token) {
      // Socket.io Real-Time Listener
      const handleNewNotification = (newNotif: any) => {
        console.log('Real-time notification received on notifications page:', newNotif);
        const notifData = newNotif.data || newNotif;
        setNotifications(prev => {
          if (prev.some(n => n._id === notifData._id)) return prev;
          return [notifData, ...prev];
        });
      };

      const userId = loginUser.id || loginUser._id;
      if (!socket.connected) {
        socket.connect();
      }

      socket.on('new_notification', handleNewNotification);
      if (userId) {
        socket.on(`new_notification_${userId}`, handleNewNotification);
      }
      socket.on('new_notification_student', handleNewNotification);

      return () => {
        socket.off('new_notification', handleNewNotification);
        if (userId) {
          socket.off(`new_notification_${userId}`, handleNewNotification);
        }
        socket.off('new_notification_student', handleNewNotification);
      };
    }
  }, [loginUser?.token]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await fetch(`${uri}/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${loginUser?.token}`
        }
      });
      const resData = await response.json();
      if (resData.success) {
        setNotifications(prev =>
          prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
        );
        toast.success("Notification marked as read");
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setActionLoading(true);
      const response = await fetch(`${uri}/notifications/read-all`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${loginUser?.token}`
        }
      });
      const resData = await response.json();
      if (resData.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        toast.success("All notifications marked as read");
      }
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const openDeleteDialog = (id: string) => {
    setNotifToDelete(id);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setNotifToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleDeleteNotification = async () => {
    if (!notifToDelete) return;
    try {
      const response = await fetch(`${uri}/notifications/${notifToDelete}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${loginUser?.token}`
        }
      });
      const resData = await response.json();
      if (resData.success) {
        setNotifications(prev => prev.filter(n => n._id !== notifToDelete));
        toast.success("Notification deleted successfully");
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    } finally {
      closeDeleteDialog();
    }
  };

  const handleClearAllNotifications = async () => {
    try {
      setActionLoading(true);
      const response = await fetch(`${uri}/notifications/clear-all`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${loginUser?.token}`
        }
      });
      const resData = await response.json();
      if (resData.success) {
        setNotifications([]);
        toast.success("All notifications cleared successfully");
      }
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    } finally {
      setActionLoading(false);
      setClearAllDialogOpen(false);
    }
  };

  // Filter & Search Logic
  const filteredNotifications = useMemo(() => {
    let list = [...notifications];

    if (activeTab === 'unread') {
      list = list.filter(n => !n.isRead);
    } else if (activeTab === 'read') {
      list = list.filter(n => n.isRead);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        n =>
          n.title.toLowerCase().includes(q) ||
          n.message.toLowerCase().includes(q)
      );
    }

    return list;
  }, [notifications, activeTab, searchQuery]);

  const typeConfig = {
    course_upload: { icon: <CourseIcon />, color: '#6366f1', label: 'Course' },
    content_upload: { icon: <CourseIcon />, color: '#8b5cf6', label: 'Content' },
    book_upload: { icon: <BookIcon />, color: '#10b981', label: 'Book' },
    job_alert: { icon: <JobIcon />, color: '#f59e0b', label: 'Job' },
    general: { icon: <InfoIcon />, color: '#64748b', label: 'Info' }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading && notifications.length === 0) {
    return (
      <DashboardLayout>
        <DashboardLoader />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', width: 44, height: 44 }}>
                <BellIcon sx={{ fontSize: 24 }} />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>Notifications</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5, fontWeight: 500 }}>
              Stay updated with your courses, exams, announcements, and wallet rewards.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Tooltip title="Refresh notifications">
              <IconButton 
                onClick={fetchNotifications} 
                sx={{ 
                  bgcolor: 'background.paper', 
                  border: '1px solid', 
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: 1.2,
                  '&:hover': { bgcolor: alpha('#6366f1', 0.05), color: '#6366f1' }
                }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {unreadCount > 0 && (
              <Button
                variant="contained"
                size="small"
                startIcon={actionLoading ? <CircularProgress size={16} color="inherit" /> : <DoubleTickIcon />}
                onClick={handleMarkAllAsRead}
                disabled={actionLoading}
                sx={{
                  fontWeight: 800,
                  borderRadius: 2.5,
                  px: 2.5,
                  py: 1.2,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
                }}
              >
                Mark all as read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<TrashIcon />}
                onClick={() => setClearAllDialogOpen(true)}
                disabled={actionLoading}
                sx={{
                  fontWeight: 800,
                  borderRadius: 2.5,
                  px: 2.5,
                  py: 1.2,
                  borderColor: 'error.light',
                  '&:hover': { bgcolor: alpha('#ef4444', 0.05), borderColor: 'error.main' }
                }}
              >
                Clear All
              </Button>
            )}
          </Stack>
        </Box>

        {/* Search & Tabs Controls */}
        <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1} sx={{ bgcolor: 'background.paper', p: 0.6, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            {[
              { key: 'all', label: 'All', badge: notifications.length },
              { key: 'unread', label: 'Unread', badge: unreadCount, color: 'error' },
              { key: 'read', label: 'Read', badge: notifications.length - unreadCount }
            ].map((tab) => (
              <Chip
                key={tab.key}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{tab.label}</span>
                    {tab.badge > 0 && (
                      <Chip 
                        label={tab.badge} 
                        size="small" 
                        color={tab.color as any || 'primary'} 
                        sx={{ height: 16, fontSize: '0.65rem', fontWeight: 900, px: 0.2, minWidth: 20 }} 
                      />
                    )}
                  </Box>
                }
                onClick={() => setActiveTab(tab.key as any)}
                variant={activeTab === tab.key ? 'filled' : 'text'}
                sx={{
                  fontWeight: 800,
                  borderRadius: 2,
                  px: 1.2,
                  py: 2,
                  bgcolor: activeTab === tab.key ? alpha('#6366f1', 0.1) : 'transparent',
                  color: activeTab === tab.key ? '#6366f1' : 'text.primary',
                  '&:hover': { bgcolor: activeTab === tab.key ? alpha('#6366f1', 0.15) : alpha('#6366f1', 0.05) },
                }}
              />
            ))}
          </Stack>

          <Box sx={{ minWidth: 280, width: { xs: '100%', sm: 320 } }}>
            <TextField
              fullWidth
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: 3, bgcolor: 'background.paper' },
              }}
            />
          </Box>
        </Box>

        {/* Notifications List */}
        <AnimatePresence mode="popLayout">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filteredNotifications.length === 0 ? (
              <EmptyState
                type="no-data"
                title={searchQuery ? 'No Results Found' : 'No Notifications'}
                size="large"
                description={
                  searchQuery 
                    ? `We couldn't find any notifications matching "${searchQuery}". Try adjusting your keywords.`
                    : activeTab === 'unread' 
                      ? 'You are all caught up! There are no unread notifications.'
                      : 'You do not have any notifications yet.'
                }
              />
            ) : (
              filteredNotifications.map((notif, idx) => {
                const config = typeConfig[notif.type] || typeConfig.general;
                return (
                  <motion.div
                    key={notif._id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.2, delay: Math.min(idx * 0.03, 0.3) }}
                  >
                    <Card
                      sx={{
                        borderRadius: 3.5,
                        border: '1px solid',
                        borderColor: notif.isRead ? 'divider' : alpha('#6366f1', 0.15),
                        boxShadow: notif.isRead ? 'none' : '0 4px 18px rgba(99, 102, 241, 0.04)',
                        bgcolor: notif.isRead ? 'background.paper' : alpha('#6366f1', 0.02),
                        transition: 'all 0.3s',
                        overflow: 'hidden',
                        position: 'relative',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
                          borderColor: alpha(config.color, 0.3)
                        }
                      }}
                    >
                      {/* Unread indicator sidebar line */}
                      {!notif.isRead && (
                        <Box
                          sx={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: 5,
                            bgcolor: config.color
                          }}
                        />
                      )}

                      <CardContent sx={{ p: '20px !important' }}>
                        <Stack direction="row" spacing={2.5} alignItems="flex-start">
                          {/* Type-based Indicator Icon */}
                          <Avatar
                            sx={{
                              bgcolor: alpha(config.color, 0.1),
                              color: config.color,
                              width: 44,
                              height: 44,
                              borderRadius: 2.5
                            }}
                          >
                            {config.icon}
                          </Avatar>

                          {/* Message Body */}
                          <Box sx={{ flexGrow: 1 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1}>
                              <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5, pr: 2 }}>
                                  {notif.title}
                                </Typography>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: alpha(config.color, 0.85), textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                  {config.label}
                                </Typography>
                              </Box>
                              <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 600 }}>
                                {new Date(notif.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </Typography>
                            </Stack>

                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, mb: 1, lineHeight: 1.6, fontWeight: 500, fontSize: '0.9rem' }}>
                              {notif.message}
                            </Typography>

                            {/* Actions bar inside card */}
                            <Stack direction="row" spacing={2} sx={{ mt: 2 }} justifyContent="flex-end">
                              {!notif.isRead && (
                                <Tooltip title="Mark as read">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleMarkAsRead(notif._id)}
                                    sx={{
                                      color: 'primary.main',
                                      bgcolor: alpha('#6366f1', 0.06),
                                      '&:hover': { bgcolor: alpha('#6366f1', 0.15) }
                                    }}
                                  >
                                    <ReadIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              <Tooltip title="Delete notification">
                                <IconButton
                                  size="small"
                                  onClick={() => openDeleteDialog(notif._id)}
                                  sx={{
                                    color: 'error.main',
                                    bgcolor: alpha('#ef4444', 0.06),
                                    '&:hover': { bgcolor: alpha('#ef4444', 0.15) }
                                  }}
                                >
                                  <TrashIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </Box>
        </AnimatePresence>

        {/* Premium Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={closeDeleteDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          PaperProps={{
            sx: {
              borderRadius: 4,
              p: 1.5,
              maxWidth: 400
            }
          }}
        >
          <DialogTitle id="alert-dialog-title" sx={{ fontWeight: 800, fontSize: '1.2rem', pb: 1 }}>
            Delete Notification?
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description" sx={{ fontWeight: 500, color: 'text.secondary' }}>
              Are you sure you want to delete this notification? This action is permanent and cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={closeDeleteDialog} sx={{ fontWeight: 700, borderRadius: 2, color: 'text.secondary', textTransform: 'none' }}>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteNotification}
              variant="contained"
              color="error"
              autoFocus
              sx={{
                fontWeight: 800,
                borderRadius: 2,
                px: 2.5,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Premium Clear All Confirmation Dialog */}
        <Dialog
          open={clearAllDialogOpen}
          onClose={() => setClearAllDialogOpen(false)}
          aria-labelledby="clear-all-dialog-title"
          aria-describedby="clear-all-dialog-description"
          PaperProps={{
            sx: {
              borderRadius: 4,
              p: 1.5,
              maxWidth: 400
            }
          }}
        >
          <DialogTitle id="clear-all-dialog-title" sx={{ fontWeight: 800, fontSize: '1.2rem', pb: 1 }}>
            Clear All Notifications?
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="clear-all-dialog-description" sx={{ fontWeight: 500, color: 'text.secondary' }}>
              Are you sure you want to clear all notifications? This action is permanent and cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setClearAllDialogOpen(false)} sx={{ fontWeight: 700, borderRadius: 2, color: 'text.secondary', textTransform: 'none' }}>
              Cancel
            </Button>
            <Button
              onClick={handleClearAllNotifications}
              variant="contained"
              color="error"
              autoFocus
              sx={{
                fontWeight: 800,
                borderRadius: 2,
                px: 2.5,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
              }}
            >
              Clear All
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default NotificationsListV2;
