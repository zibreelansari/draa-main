import React, { useState, useEffect, useMemo } from'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  alpha,
  InputBase,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ClickAwayListener,
  useMediaQuery,
  useTheme,
  Popover,
  Button
} from'@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  Person as ProfileIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  School as CourseIcon,
  Dashboard as DashboardIcon,
  Book as BookIcon,
  MenuBook as ManualIcon,
  Assignment as TestIcon,
  Event as ExamIcon,
  VideoCameraFront as LiveIcon,
  BarChart as ResultIcon,
  Favorite as WishlistIcon,
  ShoppingCart as PurchaseIcon,
  Create as BlogIcon,
  CardGiftcard as RewardIcon,
  Home as HomeIcon,
  Clear as ClearIcon,
  ArrowForward as ArrowIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon
} from'@mui/icons-material';
import { useNavigate } from'react-router-dom';
import { BACKEND_UPLOAD_URL, default as uri } from'../../url';
import socket from '../../utils/socket';

const DRAWER_WIDTH = 280;

interface HeaderProps {
  onMenuClick: () => void;
  loginUser: any;
  notifications: number;
  onThemeToggle?: () => void;
  isDarkMode?: boolean;
}

// Search data based on sidebar navigation items
const searchIndex = [
  { id:'dashboard', type:'page', title:'Dashboard', subtitle:'Student dashboard overview', path:'/v2/student-dashboard', icon: <DashboardIcon /> },
  { id:'courses', type:'page', title:'My Courses', subtitle:'View your enrolled courses', path:'/v2/student/my-courses', icon: <BookIcon /> },
  { id:'books', type:'page', title:'My Books', subtitle:'Access your digital library', path:'/v2/student/my-books/purchased', icon: <ManualIcon /> },
  { id:'test-series', type:'page', title:'My Test Series', subtitle:'Practice mock tests', path: (() => {
    const user = JSON.parse(localStorage.getItem('edudocs') ||'{}');
    return user.id ? `/v2/student/my-test-series/${user.id}` :'/v2/student-dashboard';
  })(), icon: <TestIcon /> },
  { id:'exams', type:'page', title:'Exams', subtitle:'View scheduled examinations', path:'/v2/student/my-exams', icon: <ExamIcon /> },
  { id:'live-sessions', type:'page', title:'Live Sessions', subtitle:'Join interactive live classes', path:'/v2/student/live-sessions', icon: <LiveIcon /> },
  { id:'results', type:'page', title:'Results', subtitle:'View exam results & analytics', path:'/v2/student/exam-results', icon: <ResultIcon /> },
  { id:'wishlist', type:'page', title:'Wishlist', subtitle:'Manage saved items', path:'/v2/student/wishlist', icon: <WishlistIcon /> },
  { id:'purchases', type:'page', title:'Purchases', subtitle:'Order history & invoices', path:'/v2/student/purchases', icon: <PurchaseIcon /> },
  { id:'blogs', type:'page', title:'Blog Writing', subtitle:'Write and manage blogs', path:'/v2/student/blogs', icon: <BlogIcon /> },
  { id:'rewards', type:'page', title:'Rewards', subtitle:'View coins & loyalty rewards', path:'/v2/student/rewards', icon: <RewardIcon /> },
  { id:'profile', type:'page', title:'My Profile', subtitle:'Account settings & profile', path:'/v2/student/profile', icon: <ProfileIcon /> },
  { id:'home', type:'page', title:'Home', subtitle:'Go to main website', path:'/', icon: <HomeIcon /> },
];

const DashboardHeader: React.FC<HeaderProps> = ({ onMenuClick, loginUser, notifications: ignoredNotifs, onThemeToggle, isDarkMode }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationsList, setNotificationsList] = useState<any[]>([]);

  const fetchStudentNotifications = async () => {
    try {
      const response = await fetch(`${uri}/notifications`, {
        headers: {
          Authorization: `Bearer ${loginUser?.token}`
        }
      });
      const resData = await response.json();
      if (resData.success && resData.data) {
        setNotificationsList(resData.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (loginUser?.token) {
      fetchStudentNotifications();
      const interval = setInterval(fetchStudentNotifications, 30000);

      // Handle new notification from WebSocket instantly
      const handleNewNotification = (newNotif: any) => {
        console.log("Real-time notification received via Socket.io:", newNotif);
        const notifData = newNotif.data || newNotif;
        setNotificationsList(prev => {
          // Avoid duplicate entries
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

      const handleRefreshNotifs = () => {
        fetchStudentNotifications();
      };
      window.addEventListener('refresh_notifications', handleRefreshNotifs);

      return () => {
        clearInterval(interval);
        window.removeEventListener('refresh_notifications', handleRefreshNotifs);
        socket.off('new_notification', handleNewNotification);
        if (userId) {
          socket.off(`new_notification_${userId}`, handleNewNotification);
        }
        socket.off('new_notification_student', handleNewNotification);
      };
    }
  }, [loginUser?.token]);

  const handleNotifClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchorEl(event.currentTarget);
  };

  const handleNotifClose = () => {
    setNotifAnchorEl(null);
  };

  const handleMarkNotifRead = async (id: string) => {
    try {
      const response = await fetch(`${uri}/notifications/${id}/read`, {
        method:'PUT',
        headers: {
          Authorization: `Bearer ${loginUser?.token}`
        }
      });
      const resData = await response.json();
      if (resData.success) {
        setNotificationsList(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllNotifRead = async () => {
    try {
      const response = await fetch(`${uri}/notifications/read-all`, {
        method:'PUT',
        headers: {
          Authorization: `Bearer ${loginUser?.token}`
        }
      });
      const resData = await response.json();
      if (resData.success) {
        setNotificationsList(prev => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const unreadNotifCount = notificationsList.filter(n => !n.isRead).length;
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [filteredResults, setFilteredResults] = useState<typeof searchIndex>([]);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const open = Boolean(anchorEl);

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('edudocs');
    navigate('/');
  };

  // Search functionality based on sidebar items
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase();
      const results = searchIndex.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.subtitle.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query)
      ).slice(0, 6);
      setFilteredResults(results);
      setSearchOpen(true);
    } else {
      setFilteredResults([]);
      setSearchOpen(false);
    }
  }, [searchQuery]);

  const handleSearchResultClick = (path: string) => {
    navigate(path);
    setSearchQuery('');
    setSearchOpen(false);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setFilteredResults([]);
    setSearchOpen(false);
  };

  const handleClickAway = () => {
    setSearchOpen(false);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case'page': return'#6366f1';
      case'course': return'#10b981';
      case'exam': return'#f59e0b';
      default: return'#64748b';
    }
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: isDarkMode ? alpha(theme.palette.background.paper, 0.9) :'rgba(255, 255, 255, 0.98)',
        backdropFilter:'blur(12px)',
        color:'text.primary',
        borderBottom:'1px solid',
        borderColor:'divider',
        width:'100%',
      }}
    >
      <Toolbar sx={{ justifyContent:'space-between', px: { xs: 1.5, sm: 2, md: 3 }, minHeight:'64px !important' }}>
        {/* Left Section */}
        <Box sx={{ display:'flex', alignItems:'center', gap: 2 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMenuClick}
            sx={{ display: { lg:'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Search Bar */}
          <ClickAwayListener onClickAway={handleClickAway}>
            <Box sx={{ position:'relative', width: { xs:'100%', sm: 320, md: 460 }, maxWidth: { xs: 180, sm: 380, md: 460 } }}>
              <Paper
                elevation={0}
                sx={{
                  display:'flex',
                  alignItems:'center',
                  width:'100%',
                  borderRadius: 2,
                  border:'1px solid',
                  borderColor: searchOpen ?'primary.main' :'divider',
                  bgcolor:'background.paper',
                  transition:'all 0.2s',
'&:hover': {
                    borderColor: searchOpen ?'primary.main' : alpha('#6366f1', 0.3),
                  },
'&:focus-within': {
                    borderColor:'primary.main',
                    boxShadow: `0 0 0 3px ${alpha('#6366f1', 0.1)}`,
                  },
                }}
              >
                <Box sx={{ pl: 2, display:'flex', alignItems:'center' }}>
                  <SearchIcon sx={{ color:'text.secondary', fontSize: 20 }} />
                </Box>
                <InputBase
                  ref={searchInputRef}
                  placeholder="Search pages, courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length > 0 && setSearchOpen(true)}
                  sx={{
                    flex: 1,
                    py: 1.2,
                    px: 1.5,
                    fontSize:'0.9rem',
'& input': {
                      padding: 0,
                    },
                  }}
                />
                {searchQuery && (
                  <IconButton
                    size="small"
                    onClick={handleClearSearch}
                    sx={{ mr: 1 }}
                  >
                    <ClearIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                )}
              </Paper>

              {/* Search Results Dropdown */}
              {searchOpen && filteredResults.length > 0 && (
                <Paper
                  elevation={4}
                  sx={{
                    position:'absolute',
                    top:'100%',
                    left: 0,
                    right: 0,
                    mt: 1,
                    borderRadius: 2,
                    border:'1px solid',
                    borderColor:'divider',
                    overflow:'hidden',
                    zIndex: 1400,
                    maxHeight: 400,
                    overflowY:'auto',
                  }}
                >
                  <Box sx={{ p: 1.5, borderBottom:'1px solid', borderColor:'divider' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color:'text.secondary', letterSpacing: 0.5 }}>
                      QUICK LINKS ({filteredResults.length})
                    </Typography>
                  </Box>
                  <List disablePadding>
                    {filteredResults.map((result) => (
                      <ListItem key={result.id} disablePadding>
                        <ListItemButton
                          onClick={() => handleSearchResultClick(result.path)}
                          sx={{
                            py: 1.5,
                            px: 2,
'&:hover': { bgcolor: alpha('#6366f1', 0.05) },
                          }}
                        >
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 2,
                              bgcolor: alpha(getTypeColor(result.type), 0.1),
                              color: getTypeColor(result.type),
                              display:'flex',
                              alignItems:'center',
                              justifyContent:'center',
                              mr: 2,
                              flexShrink: 0,
                            }}
                          >
                            {result.icon}
                          </Box>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                                {result.title}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                {result.subtitle}
                              </Typography>
                            }
                          />
                          <ArrowIcon sx={{ fontSize: 18, color:'text.disabled', ml: 1 }} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}

              {/* No Results */}
              {searchOpen && searchQuery.length > 0 && filteredResults.length === 0 && (
                <Paper
                  elevation={4}
                  sx={{
                    position:'absolute',
                    top:'100%',
                    left: 0,
                    right: 0,
                    mt: 1,
                    borderRadius: 2,
                    border:'1px solid',
                    borderColor:'divider',
                    p: 4,
                    textAlign:'center',
                  }}
                >
                  <SearchIcon sx={{ fontSize: 48, color:'text.disabled', mb: 2, opacity: 0.5 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color:'text.secondary' }}>
                    No results found for"{searchQuery}"
                  </Typography>
                  <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 500 }}>
                    Try searching for Dashboard, Courses, Exams, etc.
                  </Typography>
                </Paper>
              )}
            </Box>
          </ClickAwayListener>
        </Box>

        {/* Right Section */}
        <Box sx={{ display:'flex', alignItems:'center', gap: { xs: 0.5, sm: 1, md: 2 } }}>
          {/* Notifications */}
          <IconButton
            size="large"
            onClick={handleNotifClick}
            sx={{
              color:'text.secondary',
              bgcolor: alpha('#64748b', 0.05),
'&:hover': { bgcolor: alpha('#6366f1', 0.08) },
            }}
          >
            <Badge badgeContent={unreadNotifCount} color="error" overlap="circular">
              <NotificationsIcon fontSize="small" />
            </Badge>
          </IconButton>

          <Popover
            open={Boolean(notifAnchorEl)}
            anchorEl={notifAnchorEl}
            onClose={handleNotifClose}
            anchorOrigin={{
              vertical:'bottom',
              horizontal:'right',
            }}
            transformOrigin={{
              vertical:'top',
              horizontal:'right',
            }}
            PaperProps={{
              sx: {
                width: 360,
                maxHeight: 480,
                borderRadius: 3,
                boxShadow:'0 10px 40px rgba(0,0,0,0.1)',
                border:'1px solid',
                borderColor:'divider',
                overflow:'hidden'
              }
            }}
          >
            <Box sx={{ p: 2, display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid', borderColor:'divider', bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Notifications ({unreadNotifCount})</Typography>
              {unreadNotifCount > 0 && (
                <Button size="small" variant="text" onClick={handleMarkAllNotifRead} sx={{ p: 0, textTransform:'none', fontWeight: 700 }}>
                  Mark all read
                </Button>
              )}
            </Box>
            <List sx={{ p: 0, maxHeight: 400, overflowY:'auto' }}>
              {notificationsList.length === 0 ? (
                <Box sx={{ p: 4, textAlign:'center', color:'text.secondary' }}>
                  <NotificationsIcon sx={{ fontSize: 32, mb: 1, opacity: 0.5, color:'text.disabled' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>All caught up!</Typography>
                  <Typography variant="caption" color="text.disabled">No new notifications</Typography>
                </Box>
              ) : (
                notificationsList.map((notif) => (
                  <ListItem 
                    key={notif._id} 
                    disablePadding 
                    divider
                    onClick={() => {
                      if (!notif.isRead) handleMarkNotifRead(notif._id);
                    }}
                  >
                    <ListItemButton 
                      sx={{ 
                        p: 2, 
                        alignItems:'flex-start',
                        bgcolor: notif.isRead ?'transparent' : alpha(theme.palette.primary.main, 0.03),
'&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.06) }
                      }}
                    >
                      <Box 
                        sx={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius:'50%', 
                          bgcolor:'primary.main', 
                          mt: 0.8, 
                          mr: 1.5, 
                          opacity: notif.isRead ? 0 : 1, 
                          flexShrink: 0 
                        }} 
                      />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: notif.isRead ? 600 : 800, fontSize:'0.85rem', mb: 0.5 }}>
                          {notif.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize:'0.8rem', lineHeight: 1.4, mb: 0.5 }}>
                          {notif.message}
                        </Typography>
                        <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 600, display:'block' }}>
                          {new Date(notif.createdAt).toLocaleDateString('en-IN', { hour:'2-digit', minute:'2-digit' })}
                        </Typography>
                      </Box>
                    </ListItemButton>
                  </ListItem>
                ))
              )}
            </List>
          </Popover>

          {/* Theme Toggle */}
          <IconButton
            size="large"
            onClick={onThemeToggle}
            sx={{
              color:'text.secondary',
              bgcolor: alpha('#64748b', 0.05),
'&:hover': { bgcolor: isDarkMode ? alpha('#fcd34d', 0.1) : alpha('#6366f1', 0.08) },
            }}
          >
            {isDarkMode ? <LightModeIcon fontSize="small" sx={{ color:'#fcd34d' }} /> : <DarkModeIcon fontSize="small" />}
          </IconButton>

          {/* Profile Menu */}
          <Box
            onClick={handleProfileClick}
            sx={{
              display:'flex',
              alignItems:'center',
              gap: 1.5,
              cursor:'pointer',
              px: 1.5,
              py: 0.8,
              borderRadius:'99px',
              transition:'all 0.2s',
'&:hover': { bgcolor: alpha('#6366f1', 0.05) },
            }}
          >
            <Avatar
              src={loginUser?.avatar ? `${BACKEND_UPLOAD_URL}/${loginUser.avatar}` :''}
              sx={{
                width: 36,
                height: 36,
                bgcolor:'primary.main',
                fontWeight: 700,
                fontSize: 14,
                boxShadow:'0 2px 8px rgba(99, 102, 241, 0.25)',
              }}
            >
              {loginUser?.name?.charAt(0) ||'S'}
            </Avatar>
            <Box sx={{ display: { xs:'none', md:'block' } }}>
              <Typography variant="subtitle2" sx={{ lineHeight: 1.2, fontWeight: 700 }}>
                {loginUser?.name ||'Student'}
              </Typography>
              <Typography variant="caption" sx={{ color:'text.secondary', fontWeight: 600, fontSize:'0.7rem' }}>
                Student since {loginUser?.createdAt ? loginUser.createdAt.split('T')[0] :'Joining...'}
              </Typography>

            </Box>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            PaperProps={{
              sx: {
                width: 240,
                mt: 1.5,
                borderRadius: 3,
                boxShadow:'0 10px 40px rgba(0,0,0,0.1)',
                border:'1px solid',
                borderColor:'divider',
              }
            }}
            transformOrigin={{ horizontal:'right', vertical:'top' }}
            anchorOrigin={{ horizontal:'right', vertical:'bottom' }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>My Account</Typography>
              <Typography variant="caption" sx={{ color:'text.secondary', display:'block', mt: 0.3 }}>
                {loginUser?.email}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={() => navigate('/v2/student/profile')} sx={{ py: 1.5 }}>
              <ListItemIcon><ProfileIcon fontSize="small" /></ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={() => navigate(`/v2/student/my-courses/${loginUser?.id || loginUser?._id}`)} sx={{ py: 1.5 }}>
              <ListItemIcon><CourseIcon fontSize="small" /></ListItemIcon>
              My Learning
            </MenuItem>
            <MenuItem onClick={() => navigate('/v2/student/settings')} sx={{ py: 1.5 }}>
              <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
              Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ py: 1.5, color:'error.main' }}>
              <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default DashboardHeader;