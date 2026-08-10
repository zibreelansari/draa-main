import React, { useEffect, useState } from'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  alpha,
  Paper,
  Avatar,
  Stack,
  IconButton,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  useMediaQuery,
  useTheme
} from'@mui/material';
import {
  Help as HelpIcon,
  PlusOne as PlusIcon,
  Message as ChatIcon,
  Schedule as TimeIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  FiberManualRecord as StatusIcon,
  Add as AddIcon,
  HeadsetMic as SupportIcon
} from'@mui/icons-material';
import { motion, AnimatePresence } from'framer-motion';
import axios from'axios';
import { useNavigate } from'react-router-dom';
import url from'../../../url';
import { getAuthHeaders } from'../../../utils/global_auth';
import DashboardLayout from'../../layouts/DashboardLayout';
import DashboardLoader from'../../components/DashboardLoader';
import EmptyState from'../../components/EmptyState';
import dayjs from'dayjs';
import relativeTime from'dayjs/plugin/relativeTime';
import { Divider } from'antd';
import { useStudentProfile } from'../../hooks/useStudentProfile';
import usePageTitle from '../../../hooks/usePageTitle';

dayjs.extend(relativeTime);

interface SupportTicket {
  _id: string;
  ticketId: string;
  subject: string;
  category: string;
  priority:'Low' |'Medium' |'High' |'Urgent';
  status:'Open' |'In Progress' |'Resolved' |'Closed';
  lastMessageAt: string;
  createdAt: string;
}

const SupportListV2: React.FC = () => {
  usePageTitle('Support Tickets | Draa');
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { profile: user, loading: profileLoading } = useStudentProfile();

  const fetchTickets = async () => {
    if (!user?.token) return;
    try {
      setLoading(true);
      const res = await axios.get(`${url}/support/list`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.data.success) {
        setTickets(res.data.tickets);
      }
    } catch (error) {
      console.error('Failed to fetch tickets', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!profileLoading && user) {
      fetchTickets();
    }
  }, [profileLoading, user]);

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         t.ticketId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter ==='all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case'Open': return'#10b981';
      case'In Progress': return'#3b82f6';
      case'Resolved': return'#8b5cf6';
      case'Closed': return'#64748b';
      default: return'#64748b';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case'Urgent': return'#ef4444';
      case'High': return'#f59e0b';
      case'Medium': return'#3b82f6';
      case'Low': return'#10b981';
      default: return'#10b981';
    }
  };

  if (loading && tickets.length === 0) {
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
        <Box sx={{ mb: 4, display:'flex', justifyContent:'space-between', alignItems: isMobile ?'flex-start' :'center', flexWrap:'wrap', gap: 2 }}>
          <Box sx={{ flex: 1, minWidth: isMobile ?'100%' :'auto' }}>
            <Box sx={{ display:'flex', alignItems:'center', gap: isMobile ? 1.5 : 2, mb: 1 }}>
              <Avatar sx={{ bgcolor: alpha('#6366f1', 0.1), color:'#6366f1', width: isMobile ? 32 : 40, height: isMobile ? 32 : 40 }}>
                <SupportIcon sx={{ fontSize: isMobile ? 18 : 22 }} />
              </Avatar>
              <Typography variant={isMobile ?"h5" :"h4"} sx={{ fontWeight: 800 }}>Help & Support</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5, fontWeight: 500, fontSize: isMobile ?'0.75rem' :'0.875rem' }}>
              Have a question or facing an issue? Raise a ticket and we'll help you out.
            </Typography>
          </Box>
          <Button
            fullWidth={isMobile}
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/v2/student/support/create')}
            sx={{
              background:'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              boxShadow:'0 4px 14px rgba(99, 102, 241, 0.35)',
'&:hover': { background:'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' },
              height: isMobile ? 48 : 50,
              borderRadius: 3,
              px: 3,
              fontWeight: 800
            }}
          >
            New Ticket
          </Button>
        </Box>

        {/* Stats & Filters */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} md={8}>
                <TextField
                    fullWidth
                    placeholder="Search by Ticket ID or Subject..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color:'text.secondary' }} />
                            </InputAdornment>
                        ),
                        sx: { borderRadius: 3, bgcolor:'background.paper' }
                    }}
                />
            </Grid>
            <Grid item xs={12} md={4}>
                <Select
                    fullWidth
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    startAdornment={<FilterIcon sx={{ mr: 1, color:'text.secondary', fontSize: 20 }} />}
                    sx={{ borderRadius: 3, bgcolor:'background.paper' }}
                >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="Open">Open</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Resolved">Resolved</MenuItem>
                    <MenuItem value="Closed">Closed</MenuItem>
                </Select>
            </Grid>
        </Grid>

        {/* Tickets Grid */}
        <Grid container spacing={3}>
          {filteredTickets.length === 0 ? (
            <Grid item xs={12}>
              <EmptyState
                type="no-data"
                size="large"
                title="No Support Tickets Found"
                description="You haven't raised any support tickets yet. If you have any issues, we are here to help!"
                actionLabel="Raise New Ticket"
                onAction={() => navigate('/v2/student/support/create')}
              />
            </Grid>
          ) : (
            filteredTickets.map((ticket, idx) => (
              <Grid item xs={12} md={6} key={ticket._id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card
                    component={motion.div}
                    whileHover={{ y: -4, boxShadow:'0 12px 32px rgba(99, 102, 241, 0.1)' }}
                    sx={{
                      borderRadius: 4,
                      border:'1px solid',
                      borderColor: alpha('#6366f1', 0.08),
                      position:'relative',
                      cursor:'pointer',
                      overflow:'hidden'
                    }}
                    onClick={() => navigate(`/v2/student/support/ticket/${ticket._id}`)}
                  >
                    <CardContent sx={{ p: isMobile ? 2.5 : 3 }}>
                      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', mb: 2 }}>
                        <Box>
                            <Typography variant="caption" sx={{ fontWeight: 800, color:'#6366f1', display:'block', mb: 0.5 }}>
                                #{ticket.ticketId}
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.3, mb: 1 }}>
                                {ticket.subject}
                            </Typography>
                        </Box>
                        <Chip
                          label={ticket.status}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            fontSize:'0.65rem',
                            bgcolor: alpha(getStatusColor(ticket.status), 0.1),
                            color: getStatusColor(ticket.status),
                            border:'1px solid',
                            borderColor: alpha(getStatusColor(ticket.status), 0.2)
                          }}
                        />
                      </Box>

                      <Box sx={{ display:'flex', flexWrap:'wrap', gap: 2, mb: 2.5 }}>
                        <Box sx={{ display:'flex', alignItems:'center', gap: 1 }}>
                            <Box sx={{ width: 6, height: 6, borderRadius:'50%', bgcolor: getPriorityColor(ticket.priority) }} />
                            <Typography variant="caption" sx={{ fontWeight: 700, color:'text.secondary' }}>
                                {ticket.priority} Priority
                            </Typography>
                        </Box>
                        <Box sx={{ display:'flex', alignItems:'center', gap: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color:'text.secondary' }}>
                                 {ticket.category}
                            </Typography>
                        </Box>
                      </Box>

                      <Divider sx={{ mb: 2, opacity: 0.5 }} />

                      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <Box sx={{ display:'flex', alignItems:'center', gap: 1 }}>
                            <TimeIcon sx={{ fontSize: 16, color:'text.secondary' }} />
                            <Typography variant="caption" sx={{ fontWeight: 600, color:'text.secondary' }}>
                                Updated {dayjs(ticket.lastMessageAt).fromNow()}
                            </Typography>
                        </Box>
                        <Button 
                            variant="text" 
                            size="small" 
                            endIcon={<ChatIcon sx={{ fontSize: 16 }} />}
                            sx={{ fontWeight: 800, color:'#6366f1' }}
                        >
                            Open Chat
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))
          )}
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default SupportListV2;
