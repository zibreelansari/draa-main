import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Box, Typography, Paper, Avatar, TextField, IconButton,
  alpha, useMediaQuery, useTheme, Chip, CircularProgress,
  Tooltip } from '@mui/material';
import {
  ArrowBack as BackIcon, Send as SendIcon,
  AttachFile as AttachIcon, DoneAll as DoneAllIcon,
  Done as DoneIcon, AccessTime as ClockIcon,
  Circle as CircleIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import url, { BACKEND_UPLOAD_URL } from '../../../url';
import { useStudentProfile } from '../../hooks/useStudentProfile';
import DashboardLayout from '../../layouts/DashboardLayout';
import DashboardLoader from '../../components/DashboardLoader';
import toast from '../../../utils/toast';
import dayjs from 'dayjs';
import socket from '../../../utils/socket';
import usePageTitle from '../../../hooks/usePageTitle';

interface SupportMessage {
  _id?: string;
  tempId?: string;
  senderId: { _id: string; name?: string; tname?: string; A_name?: string } | string;
  senderModel: string;
  text: string;
  attachments?: string[];
  timestamp: string;
  isRead?: boolean;
  sending?: boolean;
}

interface SupportTicket {
  _id: string;
  ticketId: string;
  subject: string;
  status: string;
  category: string;
  priority: string;
  messages: SupportMessage[];
  requesterId: { _id: string; name?: string };
}

const SupportChatV2: React.FC = () => {
  usePageTitle('Support Chat | Draa');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [typingText, setTypingText] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Sync theme changes in real-time bypassing parent context limitations
  useEffect(() => {
    const saved = localStorage.getItem('studentAppSettings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        setIsDarkMode(!!settings.darkMode);
      } catch (e) {}
    }
    const handleThemeChange = () => {
      const savedNew = localStorage.getItem('studentAppSettings');
      if (savedNew) {
        try {
          const settings = JSON.parse(savedNew);
          setIsDarkMode(!!settings.darkMode);
        } catch (e) {}
      }
    };
    window.addEventListener('storage', handleThemeChange);
    window.addEventListener('themeChange', handleThemeChange);
    return () => {
      window.removeEventListener('storage', handleThemeChange);
      window.removeEventListener('themeChange', handleThemeChange);
    };
  }, []);

  const { profile: user } = useStudentProfile();
  const myId = user?.id || user?._id;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // -- Fetch ticket --------------------------------------------------
  const fetchTicket = useCallback(async () => {
    if (!user?.token) return;
    try {
      const res = await axios.get(`${url}/support/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` } });
      if (res.data.success) {
        setTicket(res.data.ticket);
      }
    } catch {
      toast.error('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  }, [id, user?.token]);

  // -- Mark messages as read -----------------------------------------
  const markAsRead = useCallback(async () => {
    if (!user?.token) return;
    try {
      await axios.put(`${url}/support/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${user.token}` } });
      socket.emit('message_seen', { ticketId: id, userId: myId });
      window.dispatchEvent(new Event('refresh_notifications'));
    } catch { /* silent */ }
  }, [id, user?.token, myId]);

  // -- Socket setup --------------------------------------------------
  useEffect(() => {
    if (!id || !myId) return;

    const onConnect = () => {
      console.log("Socket connected (student), joining ticket room:", id);
      socket.emit('join_ticket', id);
    };

    if (socket.connected) {
      onConnect();
    }

    socket.on('connect', onConnect);

    const onReceiveMessage = (data: any) => {
      if (data.ticketId !== id) return;
      setTicket(prev => {
        if (!prev) return prev;
        // Deduplicate by _id or tempId
        const exists = prev.messages.some(
          m => (m._id && m._id === data._id) || (m.tempId && m.tempId === data.tempId)
        );
        if (exists) return prev;
        return { ...prev, messages: [...prev.messages, { ...data, timestamp: data.timestamp || new Date().toISOString() }] };
      });
      // Auto-mark read if tab is visible and message is from someone else
      if (document.visibilityState === 'visible') {
        const senderId = typeof data.senderId === 'object' ? data.senderId._id : data.senderId;
        if (senderId?.toString() !== myId?.toString()) markAsRead();
      }
    };

    const onUserTyping = (data: any) => {
      if (data.ticketId === id && data.userId?.toString() !== myId?.toString()) {
        setTypingText(`${data.userName || 'Support'} is typing...`);
      }
    };

    const onUserStopTyping = (data: any) => {
      if (data.ticketId === id) setTypingText(null);
    };

    const onMessagesRead = (data: any) => {
      if (data.ticketId === id && data.userId?.toString() !== myId?.toString()) {
        setTicket(prev => prev ? {
          ...prev, messages: prev.messages.map(m => ({ ...m, isRead: true })) } : prev);
      }
    };

    const onPresence = (data: any) => {
      // Show admin as online (we don't know admin's userId here, so show generic)
      if (data.role === 'admin' || data.role === 'ADMIN') setIsOnline(data.online);
    };

    socket.on('receive_message', onReceiveMessage);
    socket.on('user_typing', onUserTyping);
    socket.on('user_stop_typing', onUserStopTyping);
    socket.on('messages_read', onMessagesRead);
    socket.on('presence_update', onPresence);

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.emit('leave_ticket', id);
      socket.off('connect', onConnect);
      socket.off('receive_message', onReceiveMessage);
      socket.off('user_typing', onUserTyping);
      socket.off('user_stop_typing', onUserStopTyping);
      socket.off('messages_read', onMessagesRead);
      socket.off('presence_update', onPresence);
    };
  }, [id, myId, markAsRead]);

  // -- Initial load + mark read --------------------------------------
  useEffect(() => {
    if (user) {
      fetchTicket().then(() => markAsRead());
    }
  }, [user, fetchTicket, markAsRead]);

  useEffect(() => { scrollToBottom(); }, [ticket?.messages, typingText]);

  // -- Typing emit ---------------------------------------------------
  const handleTyping = (val: string) => {
    setNewMessage(val);
    if (!id || !myId) return;
    socket.emit('typing', {
      ticketId: id,
      userId: myId,
      userName: user?.name || 'Student' });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { ticketId: id, userId: myId });
    }, 2000);
  };

  // -- Send message --------------------------------------------------
  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!newMessage.trim() && attachments.length === 0) || sending || !user?.token) return;

    const tempId = `temp-${Date.now()}`;
    const msgText = newMessage;
    const msgFiles = [...attachments];

    // Optimistic update
    const optimistic: SupportMessage = {
      tempId,
      senderId: { _id: myId! },
      senderModel: 'users',
      text: msgText,
      attachments: [],
      timestamp: new Date().toISOString(),
      isRead: false,
      sending: true };
    setTicket(prev => prev ? { ...prev, messages: [...prev.messages, optimistic] } : prev);
    setNewMessage('');
    setAttachments([]);
    socket.emit('stop_typing', { ticketId: id, userId: myId });

    try {
      setSending(true);
      const fd = new FormData();
      fd.append('text', msgText);
      msgFiles.forEach(f => fd.append('attachments', f));

      const res = await axios.post(`${url}/support/${id}/message`, fd, {
        headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'multipart/form-data' } });

      if (res.data.success) {
        const saved = res.data.ticket.messages[res.data.ticket.messages.length - 1];
        // Replace optimistic with real
        setTicket(prev => prev ? {
          ...prev, messages: prev.messages.map(m => m.tempId === tempId ? { ...saved, sending: false } : m) } : prev);
        // Broadcast to other party via socket
        socket.emit('send_message', { ...saved, ticketId: id, tempId });
      }
    } catch {
      toast.error('Failed to send message');
      // Rollback
      setTicket(prev => prev ? { ...prev, messages: prev.messages.filter(m => m.tempId !== tempId) } : prev);
      setNewMessage(msgText);
      setAttachments(msgFiles);
    } finally {
      setSending(false);
    }
  };

  // -- Helpers -------------------------------------------------------
  const getSenderId = (msg: SupportMessage): string => {
    if (typeof msg.senderId === 'object') return msg.senderId._id;
    return msg.senderId as string;
  };

  const getSenderName = (msg: SupportMessage): string => {
    if (typeof msg.senderId === 'object') {
      return msg.senderId.name || msg.senderId.tname || msg.senderId.A_name || 'Support';
    }
    return 'Support';
  };

  const isAdmin = (msg: SupportMessage) =>
    msg.senderModel === 'admins' || msg.senderModel === 'Admin';

  const getMessageStatus = (msg: SupportMessage) => {
    if (msg.sending) return <ClockIcon sx={{ fontSize: 12, opacity: 0.7 }} />;
    if (msg.isRead) return <DoneAllIcon sx={{ fontSize: 12, color: '#93c5fd' }} />;
    return <DoneIcon sx={{ fontSize: 12, opacity: 0.7 }} />;
  };

  if (loading) return <DashboardLayout><DashboardLoader /></DashboardLayout>;
  if (!ticket) return null;

  const isClosed = ticket.status === 'Closed' || ticket.status === 'Resolved';

  return (
    <DashboardLayout>
      <Box
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        sx={{ height: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column', gap: 1.5 }}
      >
        {/* -- Header -- */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={() => navigate('/v2/student/support')} size="small">
              <BackIcon />
            </IconButton>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', display: 'block', lineHeight: 1 }}>
                #{ticket.ticketId}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: isMobile ? '0.95rem' : '1.15rem', lineHeight: 1.2 }}>
                {ticket.subject}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Online indicator */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CircleIcon sx={{ fontSize: 10, color: isOnline ? '#10b981' : '#94a3b8' }} />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                {isOnline ? 'Support Online' : 'Support Offline'}
              </Typography>
            </Box>
            <Chip
              label={ticket.status}
              size="small"
              sx={{
                fontWeight: 800, fontSize: '0.65rem',
                bgcolor: alpha(isClosed ? '#64748b' : '#10b981', 0.1),
                color: isClosed ? '#64748b' : '#10b981' }}
            />
          </Box>
        </Box>

        {/* -- Messages -- */}
        <Paper
          elevation={0}
          sx={{
            flex: 1, borderRadius: 4, overflowY: 'auto', p: { xs: 2, sm: 3 },
            bgcolor: isDarkMode ? alpha(theme.palette.background.default, 0.5) : alpha(theme.palette.background.paper, 0.95),
            border: '1px solid', borderColor: theme.palette.divider,
            display: 'flex', flexDirection: 'column', gap: 1 }}
        >
          {ticket.messages.map((msg, idx) => {
            const isMe = getSenderId(msg) === myId?.toString();
            const prev = idx > 0 ? ticket.messages[idx - 1] : null;
            const sameSender = prev && getSenderId(prev) === getSenderId(msg);

            return (
              <Box
                key={msg._id || msg.tempId || idx}
                sx={{
                  display: 'flex',
                  justifyContent: isMe ? 'flex-end' : 'flex-start',
                  mb: sameSender ? 0.25 : 1 }}
              >
                {/* Avatar for other party */}
                {!isMe && !sameSender && (
                  <Avatar
                    sx={{
                      width: 28, height: 28, mr: 1, mt: 0.5, flexShrink: 0,
                      bgcolor: isAdmin(msg) ? '#7c3aed' : '#3b82f6',
                      fontSize: '0.7rem', fontWeight: 800 }}
                  >
                    {isAdmin(msg) ? 'S' : (getSenderName(msg)[0] || 'U')}
                  </Avatar>
                )}
                {!isMe && sameSender && <Box sx={{ width: 36, flexShrink: 0 }} />}

                <Box sx={{ maxWidth: isMobile ? '85%' : '68%', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                  {/* Sender label */}
                  {!isMe && !sameSender && (
                    <Typography variant="caption" sx={{ fontWeight: 700, color: isAdmin(msg) ? '#7c3aed' : '#3b82f6', px: 1, mb: 0.25 }}>
                      {isAdmin(msg) ? 'Support Team' : getSenderName(msg)}
                    </Typography>
                  )}

                  {/* Bubble */}
                  <Paper
                    sx={{
                      px: 2, py: 1.25,
                      borderRadius: isMe
                        ? (sameSender ? '18px 4px 4px 18px' : '18px 4px 18px 18px')
                        : (sameSender ? '4px 18px 18px 4px' : '4px 18px 18px 18px'),
                      bgcolor: isMe ? '#6366f1' : 'background.paper',
                      color: isMe ? 'white' : 'text.primary',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      border: isMe ? 'none' : '1px solid',
                      borderColor: alpha('#6366f1', 0.08),
                      opacity: msg.sending ? 0.7 : 1,
                      transition: 'opacity 0.2s' }}
                  >
                    <Typography variant="body1" sx={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.5, color: isMe ? 'white !important' : 'text.primary !important' }}>
                      {msg.text}
                    </Typography>

                    {/* Attachments */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {msg.attachments.map((f, fi) => (
                          <Chip
                            key={fi}
                            label={`Attachment ${fi + 1}`}
                            size="small"
                            component="a"
                            href={`${BACKEND_UPLOAD_URL}/${f}`}
                            target="_blank"
                            clickable
                            icon={<AttachIcon sx={{ fontSize: '14px !important' }} />}
                            sx={{
                              fontSize: '0.65rem', fontWeight: 700,
                              bgcolor: isMe ? alpha('#fff', 0.15) : alpha('#6366f1', 0.08),
                              color: isMe ? 'white' : '#6366f1',
                              border: 'none' }}
                          />
                        ))}
                      </Box>
                    )}

                    {/* Time + status */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5, mt: 0.5 }}>
                      <Typography variant="caption" sx={{ fontSize: '0.6rem', opacity: 0.85, color: isMe ? 'white !important' : 'text.secondary !important' }}>
                        {dayjs(msg.timestamp).format('hh:mm A')}
                      </Typography>
                      {isMe && getMessageStatus(msg)}
                    </Box>
                  </Paper>
                </Box>
              </Box>
            );
          })}

          {/* Typing indicator */}
          {typingText && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 5, py: 0.5 }}>
              <Box sx={{ display: 'flex', gap: 0.4 }}>
                {[0, 1, 2].map(i => (
                  <Box
                    key={i}
                    component={motion.div}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#94a3b8' }}
                  />
                ))}
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                {typingText}
              </Typography>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Paper>

        {/* -- Input -- */}
        {isClosed ? (
          <Paper sx={{ p: 2, borderRadius: 3, textAlign: 'center', bgcolor: alpha('#64748b', 0.05), border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              This ticket is {ticket.status.toLowerCase()}. Raise a new ticket if you need further help.
            </Typography>
          </Paper>
        ) : (
          <Paper
            component="form"
            onSubmit={handleSend}
            elevation={0}
            sx={{ p: 1.5, borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', display: 'flex', gap: 1, alignItems: 'flex-end' }}
          >
            {/* Attach */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              hidden
              accept="image/*,application/pdf"
              onChange={e => {
                if (e.target.files) setAttachments(prev => [...prev, ...Array.from(e.target.files!)].slice(0, 5));
              }}
            />
            <Tooltip title="Attach files">
              <IconButton size="small" onClick={() => fileInputRef.current?.click()} sx={{ color: 'text.secondary' }}>
                <AttachIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Box sx={{ flex: 1 }}>
              {attachments.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 0.75 }}>
                  {attachments.map((f, i) => (
                    <Chip
                      key={i}
                      label={f.name}
                      size="small"
                      onDelete={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                      sx={{ fontSize: '0.65rem', maxWidth: 140 }}
                    />
                  ))}
                </Box>
              )}
              <TextField
                fullWidth
                multiline
                maxRows={5}
                placeholder="Type your message..."
                value={newMessage}
                onChange={e => handleTyping(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
                }}
                variant="standard"
                InputProps={{ disableUnderline: true, sx: { fontSize: '0.9rem', px: 1, color: theme.palette.text.primary } }}
              />
            </Box>

            <IconButton
              type="submit"
              disabled={(!newMessage.trim() && attachments.length === 0) || sending}
              sx={{
                bgcolor: '#6366f1', color: 'white', width: 40, height: 40,
                '&:hover': { bgcolor: '#4f46e5' },
                '&.Mui-disabled': { bgcolor: alpha('#64748b', 0.15) } }}
            >
              {sending ? <CircularProgress size={18} sx={{ color: 'white' }} /> : <SendIcon sx={{ fontSize: 18 }} />}
            </IconButton>
          </Paper>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default SupportChatV2;
