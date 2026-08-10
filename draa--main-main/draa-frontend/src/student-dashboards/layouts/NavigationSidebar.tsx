import React from'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Avatar,
  Chip,
  alpha
} from'@mui/material';
import {
  Dashboard as DashboardIcon,
  Book as BookIcon,
  MenuBook as ManualIcon,
  Assignment as TestIcon,
  Event as ExamIcon,
  VideoCameraFront as LiveIcon,
  BarChart as ResultIcon,
  AutoGraph as MetricsIcon,
  Favorite as WishlistIcon,
  ShoppingCart as PurchaseIcon,
  Create as BlogIcon,
  CardGiftcard as RewardIcon,
  Person as ProfileIcon,
  Home as HomeIcon,
  Logout as LogoutIcon,
  EmojiEvents as LeaderboardIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  DevicesOther as DevicesIcon,
  Notifications as NotificationsIcon,
} from'@mui/icons-material';
import { Link, useLocation } from'react-router-dom';

const DRAWER_WIDTH = 280;

interface SidebarProps {
  open: boolean;
  onClose?: () => void;
  variant?:'permanent' |'temporary';
  loginUser: any;
}

const NavigationSidebar: React.FC<SidebarProps> = ({ onClose, loginUser }) => {
  const location = useLocation();
  const studentId = loginUser?.id || loginUser?._id;
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const scrollSidebar = () => {
      const container = scrollContainerRef.current;
      if (!container) return;
      const activeElement = container.querySelector('.Mui-selected') as HTMLElement;
      if (activeElement) {
        // Set scrollTop directly to align the active item near the top of the viewport
        container.scrollTop = activeElement.offsetTop - container.offsetTop - 15;
      }
    };

    // Trigger scroll at multiple intervals to handle layout and animation delays
    scrollSidebar();
    const timer1 = setTimeout(scrollSidebar, 50);
    const timer2 = setTimeout(scrollSidebar, 150);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [location.pathname, location.search]);
    const menuItems = [
      { label:'MAIN', type:'header' },
      { label:'Dashboard', icon: <DashboardIcon />, path:'/v2/student-dashboard' },
      { label:'Notifications', icon: <NotificationsIcon />, path:'/v2/student/notifications' },
      { label:'Metrics', icon: <MetricsIcon />, path:'/v2/student/metrics' },
      { label:'Leaderboard', icon: <LeaderboardIcon />, path:'/v2/student/leaderboard' },
      { label:'My Courses', icon: <BookIcon />, path: studentId ? `/v2/student/my-courses/${studentId}` :'/v2/student-dashboard' },
      { label:'My Books', icon: <ManualIcon />, path: studentId ? `/v2/student/my-books/purchased/${studentId}` :'/v2/student-dashboard' },
      { label:'My Test Series', icon: <TestIcon />, path: studentId ? `/v2/student/my-test-series/${studentId}` :'/v2/student-dashboard' },
      { label:'Exams', icon: <ExamIcon />, path:'/v2/student/my-exams' },
      { label:'Live Sessions', icon: <LiveIcon />, path:'/v2/student/live-sessions', badge:'LIVE', badgeColor:'error' },
      { label:'My Coupons', icon: <RewardIcon />, path:'/v2/student/coupons' },
    { label:'Results', icon: <ResultIcon />, path:'/v2/student/exam-results' },
    { label:'Wishlist', icon: <WishlistIcon />, path:'/v2/student/wishlist' },
    { label:'Purchases', icon: <PurchaseIcon />, path:'/v2/student/purchases' },
    { label:'Blogs Writing', icon: <BlogIcon />, path:'/v2/student/blogs' },
    { label:'Rewards', icon: <RewardIcon />, path:'/v2/student/rewards' },
    { label:'Help & Support', icon: <HelpIcon />, path:'/v2/student/support' },
    { label:'ACCOUNT', type:'header' },
    { label:'My Profile', icon: <ProfileIcon />, path:'/v2/student/profile' },
    { label:'Settings', icon: <SettingsIcon />, path:'/v2/student/settings' },
    { label:'Manage Devices', icon: <DevicesIcon />, path:'/v2/student/settings?tab=devices' },
    { label:'Home', icon: <HomeIcon />, path:'/' },
  ];

  return (
    <Box sx={{ height:'100%', display:'flex', flexDirection:'column', bgcolor:'background.paper', overflow:'hidden' }}>
      {/* Logo Section */}
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <Link 
          to="/" 
          style={{ 
            textDecoration:'none', 
            display:'flex', 
            justifyContent:'center',
            alignItems:'center',
            width: '100%'
          }}
        >
          <Box
            sx={{
              width: 200,
              height: 70,
              overflow:'hidden',
              display:'flex',
              alignItems:'center',
              justifyContent:'center',
              bgcolor:'transparent',
            }}
          >
            <img 
              src="/EduDocsNewLogo.png" 
              alt="Logo" 
              style={{ width:'100%', height:'100%', objectFit:'contain' }} 
            />
          </Box>
        </Link>
      </Box>

      <Divider sx={{ mx: 2, opacity: 0.5 }} />

      {/* Navigation List */}
      <Box ref={scrollContainerRef} sx={{ flex: 1, overflowY:'auto', px: 2, py: 2, pb: 4 }}>
        <List disablePadding>
          {menuItems.map((item, index) => {
            if (item.type ==='header') {
              return (
                <Typography
                  key={index}
                  variant="caption"
                  sx={{ px: 2, py: 1.5, display:'block', fontWeight: 800, color:'text.secondary', letterSpacing:'0.1em' }}
                >
                  {item.label}
                </Typography>
              );
            }

            const isActive = item.path?.includes('?')
              ? (location.pathname + location.search) === item.path
              : (location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path + '/')));

            return (
              <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={Link}
                  to={item.path!}
                  selected={isActive}
                  onClick={onClose}
                  sx={{
                    borderRadius: 2,
                    py: 1.2,
                    transition:'all 0.2s',
'&.Mui-selected': {
                      bgcolor: alpha('#6366f1', 0.1),
                      color:'#6366f1',
                      border:'1px solid',
                      borderColor: alpha('#6366f1', 0.15),
'&:hover': { bgcolor: alpha('#6366f1', 0.15) },
'& .MuiListItemIcon-root': { color:'#6366f1' },
'& .MuiTypography-root': { fontWeight: 700 },
                    },
'&:hover': {
                      bgcolor: alpha('#6366f1', 0.05),
                      color:'#6366f1',
'& .MuiListItemIcon-root': { color:'#6366f1' },
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: isActive ?'#6366f1' :'text.secondary' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ variant:'body2', sx: { fontWeight: isActive ? 700 : 500 } }}
                  />
                  {item.badge && (
                    <Chip
                      label={item.badge}
                      size="small"
                      color={item.badgeColor as any}
                      sx={{ height: 18, fontSize:'0.6rem', fontWeight: 800, borderRadius: 1 }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Logout Section */}
      <Box sx={{ p: 2, borderTop:'1px solid', borderColor:'divider' }}>
        <ListItemButton
          sx={{
            borderRadius: 2,
            color:'error.main',
            transition:'all 0.2s',
'&:hover': {
              bgcolor: alpha('#ef4444', 0.08),
              border:'1px solid',
              borderColor: alpha('#ef4444', 0.15),
            }
          }}
          onClick={() => {
            localStorage.removeItem('edudocs');
            window.location.href ='/';
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color:'inherit' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ variant:'body2', sx: { fontWeight: 700 } }} />
        </ListItemButton>
      </Box>
    </Box>
  );
};

export default NavigationSidebar;