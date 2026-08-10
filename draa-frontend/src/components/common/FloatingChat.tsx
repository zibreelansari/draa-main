import React, { useState, useEffect, useRef } from'react';
import {
  Box,
  Fab,
  Paper,
  Typography,
  IconButton,
  TextField,
  Avatar,
  Stack,
  alpha,
  Badge,
  useTheme,
  Collapse,
  CircularProgress,
  Button,
  Divider
} from'@mui/material';
import {
  Chat as ChatIcon,
  Close as CloseIcon,
  Send as SendIcon,
  Minimize as MinimizeIcon,
  HeadsetMic as SupportIcon,
  Add as CreateIcon
} from'@mui/icons-material';
import axios from'axios';
import url from'../../url';
import { useStudentProfile } from'../../hooks/useStudentProfile';
import dayjs from'dayjs';

const FloatingChat: React.FC = () => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  const [view, setView] = useState<'list' |'chat' |'create'>('list');
  const [newSubject, setNewSubject] = useState('');
  
  const { profile: user } = useStudentProfile();
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior:"smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      fetchTickets();
    }
  }, [isOpen, user]);

  useEffect(() => {
    let interval: any;
    if (isOpen && activeTicketId && view ==='chat') {
      fetchTicketDetails(activeTicketId);
      interval = setInterval(() => fetchTicketDetails(activeTicketId), 8000);
    }
    return () => clearInterval(interval);
  }, [isOpen, activeTicketId, view]);

  useEffect(() => {
    if (view ==='chat') scrollToBottom();
  }, [messages]);

  const fetchTickets = async () => {
    if (!user?.token) return;
    try {
      setLoading(true);
      const res = await axios.get(`${url}/support`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.data.success) {
        setTickets(res.data.tickets);
        // If there's an open ticket, maybe jump to it?
        const active = res.data.tickets.find((t: any) => t.status !=='Closed');
        if (active && !activeTicketId) {
            // Optional: Auto-select active ticket
        }
      }
    } catch (error) {
      console.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketDetails = async (id: string) => {
    if (!user?.token) return;
    try {
      const res = await axios.get(`${url}/support/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.data.success) {
        setMessages(res.data.ticket.messages);
      }
    } catch (error) {
      console.error('Failed to fetch ticket details');
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !activeTicketId || !user?.token || sending) return;

    try {
      setSending(true);
      const res = await axios.post(`${url}/support/${activeTicketId}/message`, {
        text: newMessage
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.data.success) {
        setNewMessage('');
        fetchTicketDetails(activeTicketId);
      }
    } catch (error) {
      console.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleCreateTicket = async () => {
      if (!newSubject.trim() || !newMessage.trim() || !user?.token || sending) return;
      try {
          setSending(true);
          const res = await axios.post(`${url}/support`, {
              subject: newSubject,
              category:'General Support',
              priority:'Medium',
              message: newMessage
          }, {
              headers: { Authorization: `Bearer ${user.token}` }
          });
          if (res.data.success) {
              setActiveTicketId(res.data.ticket._id);
              setView('chat');
              setNewMessage('');
              setNewSubject('');
              fetchTickets();
          }
      } catch (error) {
          console.error('Failed to create ticket');
      } finally {
          setSending(false);
      }
  };

  if (!user) return null;

  return (
    <Box sx={{ position:'fixed', bottom: 30, right: 30, zIndex: 10000 }}>
      {/* Chat Window */}
      <Collapse in={isOpen}>
        <Paper
          elevation={12}
          sx={{
            width: 350,
            height: 500,
            mb: 2,
            borderRadius: 4,
            overflow:'hidden',
            display:'flex',
            flexDirection:'column',
            border:'1px solid',
            borderColor: alpha('#bd7b20', 0.1),
            boxShadow:'0 24px 48px rgba(0,0,0,0.15)'
          }}
        >
          {/* Header */}
          <Box sx={{ p: 2, bgcolor:'#bd7b20', color:'white', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar sx={{ bgcolor: alpha('#fff', 0.2), width: 32, height: 32 }}>
                <SupportIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1 }}>Draa Support</Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>Online to help you</Typography>
              </Box>
            </Stack>
            <IconButton size="small" color="inherit" onClick={() => setIsOpen(false)}>
              <MinimizeIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Body Content */}
          <Box sx={{ flex: 1, overflowY:'auto', p: 2, bgcolor:'#f8fafc' }}>
            {view ==='list' && (
              <Stack spacing={1.5}>
                <Typography variant="overline" sx={{ fontWeight: 800, color:'text.secondary', px: 1 }}>Your Conversations</Typography>
                {loading && <CircularProgress size={20} sx={{ m:'auto' }} />}
                {tickets.length === 0 && !loading && (
                    <Box sx={{ textAlign:'center', py: 4 }}>
                        <Typography variant="body2" color="text.secondary">No active support tickets.</Typography>
                    </Box>
                )}
                {tickets.map((t) => (
                  <Paper
                    key={t._id}
                    onClick={() => { setActiveTicketId(t._id); setView('chat'); }}
                    sx={{
                      p: 1.5,
                      cursor:'pointer',
                      borderRadius: 3,
                      border:'1px solid transparent',
'&:hover': { borderColor:'#bd7b20', bgcolor: alpha('#bd7b20', 0.02) },
                      transition:'all 0.2s'
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>{t.subject}</Typography>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                        <Box sx={{ width: 6, height: 6, borderRadius:'50%', bgcolor: t.status ==='Open' ?'#10b981' :'#64748b' }} />
                        <Typography variant="caption" color="text.secondary">{t.status}</Typography>
                    </Stack>
                  </Paper>
                ))}
                <Button 
                    startIcon={<CreateIcon />}
                    variant="contained" 
                    fullWidth 
                    onClick={() => setView('create')}
                    sx={{ borderRadius: 3, bgcolor:'#bd7b20', mt: 2, py: 1 }}
                >
                    Start New Chat
                </Button>
              </Stack>
            )}

            {view ==='create' && (
                <Stack spacing={2}>
                    <IconButton size="small" sx={{ alignSelf:'flex-start' }} onClick={() => setView('list')}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Start a conversation</Typography>
                    <TextField
                        fullWidth
                        label="Subject"
                        size="small"
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        placeholder="e.g. Course access issue"
                    />
                    <TextField
                        fullWidth
                        label="Message"
                        multiline
                        rows={3}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="How can we help?"
                    />
                    <Button 
                        variant="contained" 
                        fullWidth 
                        onClick={handleCreateTicket}
                        disabled={sending || !newSubject.trim() || !newMessage.trim()}
                        sx={{ borderRadius: 3, bgcolor:'#bd7b20', py: 1 }}
                    >
                        {sending ? <CircularProgress size={20} /> :'Send Message'}
                    </Button>
                </Stack>
            )}

            {view ==='chat' && (
              <Stack spacing={2}>
                <Box sx={{ display:'flex', alignItems:'center', gap: 1 }}>
                    <IconButton size="small" onClick={() => setView('list')}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, flex: 1 }} noWrap>
                        {tickets.find(t => t._id === activeTicketId)?.subject ||'Chat'}
                    </Typography>
                </Box>
                <Divider />
                {messages.map((msg, idx) => {
                  const isMe = msg.senderModel ==='users';
                  return (
                    <Box key={idx} sx={{ alignSelf: isMe ?'flex-end' :'flex-start', maxWidth:'85%' }}>
                      <Paper
                        sx={{
                          p: 1.5,
                          borderRadius: isMe ?'15px 15px 4px 15px' :'15px 15px 15px 4px',
                          bgcolor: isMe ?'#bd7b20' :'white',
                          color: isMe ?'white' :'text.primary',
                          boxShadow:'0 2px 8px rgba(0,0,0,0.05)'
                        }}
                      >
                        <Typography variant="body2" sx={{ fontSize:'0.85rem' }}>{msg.text}</Typography>
                      </Paper>
                      <Typography variant="caption" sx={{ fontSize:'0.65rem', opacity: 0.5, mt: 0.2, display:'block', textAlign: isMe ?'right' :'left' }}>
                        {dayjs(msg.createdAt).format('hh:mm A')}
                      </Typography>
                    </Box>
                  );
                })}
                <div ref={messagesEndRef} />
              </Stack>
            )}
          </Box>

          {/* Input Area (only for active chat) */}
          {view ==='chat' && (
            <Box component="form" onSubmit={handleSend} sx={{ p: 2, bgcolor:'white', borderTop:'1px solid', borderColor:'divider' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={sending}
                InputProps={{
                  sx: { borderRadius: 3, bgcolor:'#f1f5f9' },
                  endAdornment: (
                    <IconButton size="small" color="primary" onClick={handleSend} disabled={!newMessage.trim() || sending}>
                      <SendIcon fontSize="small" />
                    </IconButton>
                  )
                }}
              />
            </Box>
          )}
        </Paper>
      </Collapse>

      {/* Trigger Button */}
      <Badge color="error" overlap="circular" variant="dot" invisible={!isOpen}>
        <Fab
          onClick={() => setIsOpen(!isOpen)}
          sx={{
            bgcolor: isOpen ?'#64748b' :'#bd7b20',
            color:'white',
'&:hover': { bgcolor: isOpen ?'#475569' :'#9b6118' },
            boxShadow:'0 8px 24px rgba(99, 102, 241, 0.4)'
          }}
        >
          {isOpen ? <CloseIcon /> : <ChatIcon />}
        </Fab>
      </Badge>
    </Box>
  );
};

export default FloatingChat;
