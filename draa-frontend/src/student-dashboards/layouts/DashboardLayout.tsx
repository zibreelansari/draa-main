import React, { useState, useEffect } from'react';
import { Box, CssBaseline, Drawer, ThemeProvider, useMediaQuery, useTheme } from'@mui/material';
import NavigationSidebar from'./NavigationSidebar';
import DashboardHeader from'./DashboardHeader';
import dashboardTheme, { getDashboardTheme } from'../theme/dashboardTheme';
import { useStudentAuthGuard } from'../../utils/global_auth';
import { useSocketConnection } from'../../utils/useSocket';
import { useNavigate } from'react-router-dom';
import { useStudentProfile } from'../hooks/useStudentProfile';

const DRAWER_WIDTH = 280;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { profile: loginUser, loading, updateProfile, refreshProfile } = useStudentProfile();
  const [mode, setMode] = useState<'light' |'dark'>('light');

  // Silently refresh profile from server on layout mount to sync settings
  useEffect(() => {
    if (loginUser?.token) {
      refreshProfile(false);
    }
  }, [loginUser?.token]);
  
  useEffect(() => {
    if (loginUser?.settings) {
      setMode(loginUser.settings.darkMode ? 'dark' : 'light');
    } else {
      const saved = localStorage.getItem('studentAppSettings');
      if (saved) {
        try {
          const settings = JSON.parse(saved);
          setMode(settings.darkMode ? 'dark' : 'light');
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [loginUser?.settings]);

  // Listen for storage changes (to sync theme across tabs/windows)
  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('studentAppSettings');
      if (saved) {
        try {
          const settings = JSON.parse(saved);
          setMode(settings.darkMode ?'dark' :'light');
        } catch (e) { }
      }
    };
    window.addEventListener('storage', handleStorage);
    // Custom event for same-window updates
    window.addEventListener('themeChange', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('themeChange', handleStorage);
    };
  }, []);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const navigate = useNavigate();

  // Auth Guard
  useStudentAuthGuard();
  // Socket connection + presence
  useSocketConnection();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
 
  const handleThemeToggle = async () => {
    const newMode = mode ==='light' ?'dark' :'light';
    setMode(newMode);
    
    // Save to localStorage
    const saved = localStorage.getItem('studentAppSettings');
    let settings = saved ? JSON.parse(saved) : {};
    settings.darkMode = newMode ==='dark';
    localStorage.setItem('studentAppSettings', JSON.stringify(settings));
    
    // Dispatch custom event for same-window updates
    window.dispatchEvent(new Event('themeChange'));

    // Persist to database in background
    try {
      const currentSettings = loginUser?.settings || {};
      const updatedSettings = {
        ...currentSettings,
        darkMode: newMode === 'dark',
        privacy: {
          showProfile: currentSettings.privacy?.showProfile ?? true,
          showRanking: currentSettings.privacy?.showRanking ?? true,
          ...currentSettings.privacy
        }
      };
      await updateProfile({ settings: updatedSettings });
    } catch (e) {
      console.error("Failed to update theme preference in database", e);
    }
  };

  if (loading) return null;

  const activeTheme = getDashboardTheme(mode);

  return (
    <ThemeProvider theme={activeTheme}>
      <CssBaseline />
      <Box sx={{ display:'flex', minHeight:'100vh', bgcolor:'background.default', color:'text.primary' }}>

        {/* Desktop Sidebar */}
        {!isMobile && (
          <Drawer
            variant="permanent"
            open
            sx={{
              display: { xs:'none', lg:'block' },
'& .MuiDrawer-paper': { 
                width: DRAWER_WIDTH, 
                boxSizing:'border-box',
                borderRight:'1px solid',
                borderColor:'divider',
                bgcolor:'background.paper',
              },
            }}
          >
            <NavigationSidebar loginUser={loginUser} />
          </Drawer>
        )}

        {/* Mobile Sidebar */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs:'block', lg:'none' },
'& .MuiDrawer-paper': { 
              width: DRAWER_WIDTH, 
              boxSizing:'border-box',
            },
          }}
        >
          <NavigationSidebar onClose={handleDrawerToggle} loginUser={loginUser} />
        </Drawer>

        {/* Main Content Area */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display:'flex',
            flexDirection:'column',
            minHeight:'100vh',
            width: { xs:'100%', lg: `calc(100% - ${DRAWER_WIDTH}px)` },
            ml: isMobile ? 0 : `${DRAWER_WIDTH}px`,
            transition:'all 0.3s ease',
          }}
        >
          {/* Header */}
          <DashboardHeader
            onMenuClick={handleDrawerToggle}
            loginUser={loginUser}
            notifications={0}
            onThemeToggle={handleThemeToggle}
            isDarkMode={mode ==='dark'}
          />

          {/* Page Content */}
          <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            {children}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default DashboardLayout;