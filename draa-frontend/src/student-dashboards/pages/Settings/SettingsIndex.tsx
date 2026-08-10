import React, { useState, useEffect, useRef } from'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Switch,
  FormControlLabel,
  TextField,
  Select,
  MenuItem,
  Avatar,
  Stack,
  Divider,
  Paper,
  CircularProgress,
  Chip,
  alpha,
  IconButton,
  InputAdornment,
  Tooltip,
  Badge,
} from'@mui/material';
import {
  Settings as SettingsIcon,
  DarkMode as DarkModeIcon,
  Notifications as NotificationsIcon,
  Language as LanguageIcon,
  Security as SecurityIcon,
  Brush as ThemeIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Person as ProfileIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Visibility as EyeIcon,
  VisibilityOff as EyeOffIcon,
  CameraAlt as CameraIcon,
  Verified as VerifiedIcon,
  CheckCircle as CheckIcon,
  Shield as ShieldIcon,
  DevicesOther as DevicesIcon,
  Google as GoogleIcon,
  Info as InfoIcon,
  KeyOff as KeyOffIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from'framer-motion';
import DashboardLayout from'../../layouts/DashboardLayout';
import DevicesTab from './DevicesTab';
import { useStudentProfile } from'../../hooks/useStudentProfile';
import { BACKEND_UPLOAD_URL } from'../../../url';
import usePageTitle from '../../../hooks/usePageTitle';
import toast from '../../../utils/toast';

interface AppSettings {
  darkMode: boolean;
  language: string;
  privacy: {
    showProfile: boolean;
    showRanking: boolean;
  };
}

const SettingsIndex: React.FC = () => {
  const { profile, loading: profileLoading, updateProfile, changePassword, refreshProfile } = useStudentProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  
  const [appSettings, setAppSettings] = useState<AppSettings>({
    darkMode: false,
    language:'en',
    privacy: {
      showProfile: true,
      showRanking: true,
    },
  });

  const [profileData, setProfileData] = useState({ name:'', email:'', phn:'' });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // Detect Google SSO user
  const isGoogleUser = !!(profile?.authProvider === 'google' || profile?.googleId);

  // Password strength
  const getPasswordStrength = (pw: string) => {
    if (!pw) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const map = [
      { score: 0, label: '', color: '' },
      { score: 1, label: 'Weak', color: '#ef4444' },
      { score: 2, label: 'Fair', color: '#f59e0b' },
      { score: 3, label: 'Good', color: '#3b82f6' },
      { score: 4, label: 'Strong', color: '#10b981' },
    ];
    return map[score];
  };
  const pwStrength = getPasswordStrength(passwordData.newPassword);


  const [saving, setSaving] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState<'profile' |'security' |'devices'>(
    (tabParam === 'devices' || tabParam === 'security' || tabParam === 'profile')
      ? tabParam
      : 'profile'
  );

  // Sync tab if query param changes
  useEffect(() => {
    if (tabParam && ['profile', 'security', 'devices'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [tabParam]);

  usePageTitle('Settings | Draa');

  useEffect(() => {
    if (profile) {
      setProfileData({
        name: profile.name ||'',
        email: profile.email ||'',
        phn: profile.phn ||''
      });
      if (profile.avatar) {
        setAvatarPreview(profile.avatar.startsWith('http') ? profile.avatar : `${BACKEND_UPLOAD_URL}/${profile.avatar}`);
      }
    }
  }, [profile]);

  // Refresh settings from server on component mount
  useEffect(() => {
    refreshProfile(true);
  }, []);

  useEffect(() => {
    if (profile?.settings) {
      setAppSettings({
        darkMode: !!profile.settings.darkMode,
        language: profile.settings.language || 'en',
        privacy: {
          showProfile: profile.settings.privacy?.showProfile ?? true,
          showRanking: profile.settings.privacy?.showRanking ?? true,
        }
      });
    } else {
      const saved = localStorage.getItem('studentAppSettings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setAppSettings({
            darkMode: !!parsed?.darkMode,
            language: parsed?.language || 'en',
            privacy: {
              showProfile: parsed?.privacy?.showProfile ?? true,
              showRanking: parsed?.privacy?.showRanking ?? true,
            }
          });
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [profile?.settings]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateProfileFields = () => {
    if (!profileData.name.trim()) {
      toast.error('Please enter your full name.');
      return false;
    }
    if (!profileData.email.trim()) {
      toast.error('Please enter your email address.');
      return false;
    }
    if (!validateEmail(profileData.email.trim())) {
      toast.error('Please enter a valid email address.');
      return false;
    }
    if (!profileData.phn.trim()) {
      toast.error('Please enter your phone number.');
      return false;
    }
    const phone = profileData.phn.trim();
    if (phone.length < 7 || phone.length > 10 || !/^[0-9]+$/.test(phone)) {
      toast.error('Please enter a valid 7-10 digit phone number.');
      return false;
    }
    return true;
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProfileFields()) return;
    setSaving(true);
    const data = new FormData();
    data.append('name', profileData.name.trim());
    data.append('email', profileData.email.trim());
    data.append('phn', profileData.phn.trim());
    if (avatarFile) data.append('avatar', avatarFile);

    const res = await updateProfile(data, true);
    if (res.success) {
      toast.success('Profile updated successfully!');
      setAvatarFile(null);
    } else {
      toast.error(res.message || 'Update failed');
    }
    setSaving(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordData.currentPassword.trim()) {
      toast.error('Please enter your current password.');
      return;
    }
    if (!passwordData.newPassword.trim()) {
      toast.error('Please enter a new password.');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setSaving(true);
    const res = await changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });

    if (res.success) {
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword:'', newPassword:'', confirmPassword:'' });

      // Backend invalidated all sessions (tokenVersion bumped) — kick the user out
      if ((res as any).logout) {
        localStorage.removeItem('edudocs');
        toast.info('You have been logged out from all devices. Please log in with your new password.', 5);
        setTimeout(() => navigate('/student-login'), 1500);
      }
    } else {
      toast.error(res.message || 'Password change failed');
    }
    setSaving(false);
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    localStorage.setItem('studentAppSettings', JSON.stringify(appSettings));
    
    const res = await updateProfile({ settings: appSettings });
    if (res.success) {
      toast.success('Preferences saved successfully!');
      // Dispatch custom event for real-time theme update in DashboardLayout
      window.dispatchEvent(new Event('themeChange'));
    } else {
      toast.error(res.message || 'Failed to save preferences');
    }
    setSaving(false);
  };

  if (profileLoading && !profile) {
    return (
      <DashboardLayout>
        <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  const tabItems = [
    { id:'profile', label:'Profile Information', icon: <ProfileIcon /> },
    { id:'security', label:'Login & Security', icon: <SecurityIcon /> },
    // { id:'preferences', label:'App Preferences', icon: <ThemeIcon /> },
    { id:'devices', label:'Manage Devices', icon: <DevicesIcon /> },
  ];

  return (
    <DashboardLayout>
      <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} sx={{ pb: 6 }}>
        {/* Header Section */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display:'flex', alignItems:'center', gap: 2.5, mb: 1.5 }}>
            <Box 
              sx={{ 
                width: 48, height: 48, 
                bgcolor: alpha('#5E6BFF', 0.1), 
                borderRadius:'12px',
                display:'flex', alignItems:'center', justifyContent:'center',
                color:'#5E6BFF'
              }}
            >
              <SettingsIcon sx={{ fontSize: 26 }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color:'text.primary', letterSpacing:'-0.02em' }}>
                Settings
              </Typography>
              <Typography variant="body1" sx={{ color:'text.secondary', fontWeight: 500 }}>
                Manage your account, security, and personalize your dashboard experience.
              </Typography>
            </Box>
          </Box>
        </Box>

        <AnimatePresence>
        </AnimatePresence>

        <Grid container spacing={5}>
          {/* Enhanced Navigation Sidebar */}
          <Grid item xs={12} md={3.2}>
            <Stack spacing={1.5}>
              {tabItems.map((tab) => (
                <Button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  variant="text"
                  startIcon={React.cloneElement(tab.icon as React.ReactElement, { 
                    sx: { fontSize: 22, color: activeTab === tab.id ?'#FFF' :'text.secondary' } 
                  })}
                  sx={{
                    justifyContent:'flex-start',
                    py: 2, px: 3,
                    borderRadius:'50px',
                    fontWeight: 700,
                    textTransform:'none',
                    fontSize:'1rem',
                    transition:'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    bgcolor: activeTab === tab.id ?'#7C3AED' :'transparent',
                    color: activeTab === tab.id ?'#FFF' :'text.secondary',
                    boxShadow: activeTab === tab.id ?'0 10px 20px rgba(124, 58, 237, 0.25)' :'none',
'&:hover': {
                      bgcolor: activeTab === tab.id ?'#6D28D9' : alpha('#7C3AED', 0.06),
                      transform: activeTab === tab.id ?'none' :'translateX(5px)',
                    }
                  }}
                >
                  {tab.label}
                </Button>
              ))}
            </Stack>
          </Grid>

          {/* Precise Content Area Matching Screenshot */}
          <Grid item xs={12} md={8.8}>
            <Card 
              sx={{ 
                borderRadius:'32px', 
                border:'1px solid', 
                borderColor:'divider',
                boxShadow:'0 20px 50px rgba(0,0,0,0.04)',
                bgcolor:'background.paper',
                overflow:'visible'
              }}
            >
              <CardContent sx={{ p: { xs: 4, md: 7 } }}>
                
                <AnimatePresence mode="wait">
                  {/* APP PREFERENCES (Hidden) */}
                  {false && activeTab ==='preferences' && (
                    <Box component={motion.div} key="prefs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      <Box sx={{ mb: 6 }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, color:'text.primary', mb: 1 }}>
                          Dashboard Preferences
                        </Typography>
                        <Typography variant="body1" sx={{ color:'text.secondary', fontWeight: 500 }}>
                          Customize how the platform looks and behaves.
                        </Typography>
                      </Box>

                      <Grid container spacing={8}>
                        {/* Appearance Column */}
                        <Grid item xs={12} sm={6}>
                          <Typography variant="h6" sx={{ fontWeight: 800, color:'#7C3AED', mb: 4, fontSize:'1.1rem' }}>
                            Appearance
                          </Typography>
                          
                          <Stack spacing={5}>
                            <FormControlLabel
                              control={
                                <Switch 
                                  checked={appSettings.darkMode} 
                                  onChange={(e) => setAppSettings({ ...appSettings, darkMode: e.target.checked })} 
                                  sx={{
'& .MuiSwitch-switchBase.Mui-checked': { color:'#7C3AED' },
'& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor:'#7C3AED' }
                                  }}
                                />
                              }
                              label={
                                <Typography sx={{ fontWeight: 700, color:'text.primary', ml: 1 }}>
                                  Dark Mode Theme
                                </Typography>
                              }
                            />

                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 800, color:'text.primary', mb: 1.5 }}>
                                Platform Language
                              </Typography>
                              <Select
                                fullWidth
                                value={appSettings.language}
                                onChange={(e) => setAppSettings({ ...appSettings, language: e.target.value })}
                                sx={{ 
                                  borderRadius:'16px',
'& .MuiOutlinedInput-notchedOutline': { border:'2px solid', borderColor:'divider' },
'&:hover .MuiOutlinedInput-notchedOutline': { borderColor:'#7C3AED' },
'&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor:'#7C3AED', borderWidth:'2px' },
                                  fontWeight: 600,
                                  color:'text.primary'
                                }}
                              >
                                <MenuItem value="en" sx={{ fontWeight: 600 }}>English (US)</MenuItem>
                                <MenuItem value="hi" sx={{ fontWeight: 600 }}>Hindi ()</MenuItem>
                                <MenuItem value="bn" sx={{ fontWeight: 600 }}>Bengali ()</MenuItem>
                              </Select>
                            </Box>
                          </Stack>
                        </Grid>

                        {/* Privacy Column */}
                        <Grid item xs={12} sm={6}>
                          <Typography variant="h6" sx={{ fontWeight: 800, color:'#7C3AED', mb: 4, fontSize:'1.1rem' }}>
                            Privacy
                          </Typography>
                          
                          <Stack spacing={4}>
                            <FormControlLabel
                              control={
                                <Switch 
                                  checked={appSettings.privacy?.showProfile ?? true} 
                                  onChange={(e) => setAppSettings({ ...appSettings, privacy: { ...(appSettings.privacy || { showRanking: true }), showProfile: e.target.checked } })}
                                  sx={{
'& .MuiSwitch-switchBase.Mui-checked': { color:'#7C3AED' },
'& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor:'#7C3AED' }
                                  }}
                                />
                              }
                              label={
                                <Typography sx={{ fontWeight: 700, color:'text.primary', ml: 1 }}>
                                  Public Profile
                                </Typography>
                              }
                            />

                            <FormControlLabel
                              control={
                                <Switch 
                                  checked={appSettings.privacy?.showRanking ?? true} 
                                  onChange={(e) => setAppSettings({ ...appSettings, privacy: { ...(appSettings.privacy || { showProfile: true }), showRanking: e.target.checked } })}
                                  sx={{
'& .MuiSwitch-switchBase.Mui-checked': { color:'#7C3AED' },
'& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor:'#7C3AED' }
                                  }}
                                />
                              }
                              label={
                                <Typography sx={{ fontWeight: 700, color:'text.primary', ml: 1 }}>
                                  Show in Leaderboards
                                </Typography>
                              }
                            />
                          </Stack>
                        </Grid>
                      </Grid>

                      <Box sx={{ display:'flex', justifyContent:'flex-end', mt: 10 }}>
                        <Button
                          variant="contained"
                          onClick={handleSavePreferences}
                          sx={{ 
                            borderRadius:'20px', 
                            fontWeight: 800, 
                            px: 5, py: 1.8,
                            fontSize:'1rem',
                            textTransform:'none',
                            bgcolor:'#7C3AED',
                            boxShadow:'0 10px 25px rgba(124, 58, 237, 0.35)',
'&:hover': {
                              bgcolor:'#6D28D9',
                              boxShadow:'0 15px 30px rgba(124, 58, 237, 0.45)',
                              transform:'translateY(-2px)'
                            },
                            transition:'all 0.3s'
                          }}
                        >
                          SAVE PREFERENCES
                        </Button>
                      </Box>
                    </Box>
                  )}

                  {/* PROFILE TAB (Retained but styled to match) */}
                  {activeTab ==='profile' && (
                    <Box component={motion.div} key="profile" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                      <Box sx={{ mb: 5, display:'flex', alignItems:'center', gap: 4 }}>
                        <Box sx={{ position:'relative' }}>
                          <Avatar
                            src={avatarPreview ||''}
                            sx={{ width: 110, height: 110, border:'4px solid white', boxShadow:'0 10px 30px rgba(0,0,0,0.1)' }}
                          >
                            {!avatarPreview && profile?.name?.[0]}
                          </Avatar>
                          <IconButton
                            size="small"
                            onClick={() => fileInputRef.current?.click()}
                            sx={{
                              position:'absolute', bottom: 5, right: 5,
                              bgcolor:'white', boxShadow:'0 4px 12px rgba(0,0,0,0.1)',
                              border:'1px solid #E2E8F0','&:hover': { bgcolor:'#F8FAFC' }
                            }}
                          >
                            <CameraIcon sx={{ fontSize: 20, color:'#7C3AED' }} />
                          </IconButton>
                          <input type="file" hidden ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" />
                        </Box>
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: 800, color:'text.primary' }}>{profile?.name ||'Student'}</Typography>
                          <Typography variant="body1" sx={{ color:'text.secondary', fontWeight: 500 }}>{profile?.email}</Typography>
                          <Chip 
                            label={profile?.Status ||'Active Student'} 
                            size="small" 
                            sx={{ mt: 1.5, fontWeight: 800, bgcolor: alpha('#10B981', 0.1), color:'#10B981', py: 2, px: 1 }} 
                          />
                        </Box>
                      </Box>

                      <Divider sx={{ mb: 6, borderColor:'#F1F5F9' }} />

                      <Grid container spacing={4}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 800, color:'text.primary' }}>FULL NAME</Typography>
                          <TextField
                            fullWidth
                            value={profileData.name}
                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                            placeholder="Your full name"
                            InputProps={{ sx: { borderRadius:'16px', fontWeight: 600 } }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 800, color:'text.primary' }}>PHONE NUMBER</Typography>
                          <TextField
                            fullWidth
                            value={profileData.phn}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9]/g, '');
                              setProfileData({ ...profileData, phn: value.slice(0, 10) });
                            }}
                            placeholder="Your mobile number"
                            inputProps={{ maxLength: 10 }}
                            InputProps={{ sx: { borderRadius:'16px', fontWeight: 600 } }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 800, color:'text.primary' }}>EMAIL ADDRESS</Typography>
                          <TextField
                            fullWidth
                            disabled
                            value={profileData.email}
                            helperText="Email is verified and cannot be changed directly."
                            InputProps={{ sx: { borderRadius:'16px', fontWeight: 600 } }}
                          />
                        </Grid>
                        <Grid item xs={12} sx={{ mt: 4 }}>
                          <Button
                            variant="contained"
                            size="large"
                            onClick={handleUpdateProfile}
                            disabled={saving}
                            sx={{ 
                              borderRadius:'20px', px: 6, py: 1.8, fontWeight: 800, 
                              bgcolor:'#7C3AED', boxShadow:'0 10px 25px rgba(124, 58, 237, 0.35)',
'&:hover': { bgcolor:'#6D28D9' }
                            }}
                          >
                            {saving ?'SAVING...' :'SAVE PROFILE CHANGES'}
                          </Button>
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {/* SECURITY TAB */}
                  {activeTab === 'security' && (
                    <Box component={motion.div} key="security" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                      <Box sx={{ mb: 4 }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>Account Security</Typography>
                        <Typography variant="body1" color="text.secondary">Manage your password and authentication settings.</Typography>
                      </Box>

                      {/* ── Google SSO Locked State ── */}
                      {isGoogleUser ? (
                        <Box
                          sx={{
                            maxWidth: 550,
                            p: 4,
                            borderRadius: 4,
                            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                            border: '1.5px solid #bae6fd',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            gap: 2,
                          }}
                        >
                          <Box sx={{
                            width: 72, height: 72, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #4285f4, #34a853)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 8px 24px rgba(66,133,244,0.35)',
                          }}>
                            <GoogleIcon sx={{ fontSize: 38, color: 'white' }} />
                          </Box>

                          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b' }}>
                            Signed in with Google
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, lineHeight: 1.7 }}>
                            Your account uses <strong>Google SSO</strong> for authentication. Password-based login is
                            disabled for your account — your Google account manages your security.
                          </Typography>

                          <Box sx={{
                            mt: 1, px: 3, py: 1.5,
                            bgcolor: 'white', borderRadius: 3,
                            border: '1px solid #bae6fd',
                            display: 'flex', alignItems: 'center', gap: 1.5,
                          }}>
                            <KeyOffIcon sx={{ color: '#64748b', fontSize: 20 }} />
                            <Typography variant="body2" sx={{ color: '#475569', fontWeight: 600 }}>
                              Password change is not available for Google-linked accounts.
                            </Typography>
                          </Box>

                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                            To manage your Google account security, visit{' '}
                            <Box
                              component="a"
                              href="https://myaccount.google.com/security"
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ color: '#4285f4', fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                            >
                              myaccount.google.com
                            </Box>
                          </Typography>
                        </Box>
                      ) : (

                      /* ── Normal Password Change Form ── */
                      <Box component="form" onSubmit={handleUpdatePassword} sx={{ maxWidth: 550 }}>
                        <Stack spacing={3}>

                          {/* Current Password */}
                          <Box>
                            <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 800, color: 'text.primary', letterSpacing: 0.5 }}>CURRENT PASSWORD</Typography>
                            <TextField
                              fullWidth
                              required
                              type={showCurrentPw ? 'text' : 'password'}
                              value={passwordData.currentPassword}
                              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                              placeholder="Enter your current password"
                              InputProps={{
                                startAdornment: <InputAdornment position="start"><LockIcon sx={{ fontSize: 20, color: '#64748B' }} /></InputAdornment>,
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton onClick={() => setShowCurrentPw(!showCurrentPw)} size="small">
                                      {showCurrentPw ? <EyeOffIcon fontSize="small" /> : <EyeIcon fontSize="small" />}
                                    </IconButton>
                                  </InputAdornment>
                                ),
                                sx: { borderRadius: '16px', fontWeight: 600 }
                              }}
                            />
                          </Box>

                          {/* New Password */}
                          <Box>
                            <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 800, color: 'text.primary', letterSpacing: 0.5 }}>NEW PASSWORD</Typography>
                            <TextField
                              fullWidth
                              required
                              type={showNewPw ? 'text' : 'password'}
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                              placeholder="Minimum 6 characters"
                              InputProps={{
                                startAdornment: <InputAdornment position="start"><SecurityIcon sx={{ fontSize: 20, color: '#64748B' }} /></InputAdornment>,
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton onClick={() => setShowNewPw(!showNewPw)} size="small">
                                      {showNewPw ? <EyeOffIcon fontSize="small" /> : <EyeIcon fontSize="small" />}
                                    </IconButton>
                                  </InputAdornment>
                                ),
                                sx: { borderRadius: '16px', fontWeight: 600 }
                              }}
                            />
                            {/* Strength bar */}
                            {passwordData.newPassword.length > 0 && (
                              <Box sx={{ mt: 1.5 }}>
                                <Box sx={{ display: 'flex', gap: 0.75, mb: 0.5 }}>
                                  {[1, 2, 3, 4].map((i) => (
                                    <Box key={i} sx={{
                                      flex: 1, height: 4, borderRadius: 99,
                                      bgcolor: i <= pwStrength.score ? pwStrength.color : '#e2e8f0',
                                      transition: 'background-color 0.3s',
                                    }} />
                                  ))}
                                </Box>
                                {pwStrength.label && (
                                  <Typography variant="caption" sx={{ color: pwStrength.color, fontWeight: 700 }}>
                                    {pwStrength.label} password
                                  </Typography>
                                )}
                              </Box>
                            )}
                          </Box>

                          {/* Confirm Password */}
                          <Box>
                            <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 800, color: 'text.primary', letterSpacing: 0.5 }}>CONFIRM NEW PASSWORD</Typography>
                            <TextField
                              fullWidth
                              required
                              type={showConfirmPw ? 'text' : 'password'}
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                              placeholder="Re-enter new password"
                              error={!!(passwordData.confirmPassword && passwordData.confirmPassword !== passwordData.newPassword)}
                              helperText={passwordData.confirmPassword && passwordData.confirmPassword !== passwordData.newPassword ? 'Passwords do not match' : ''}
                              InputProps={{
                                startAdornment: <InputAdornment position="start"><CheckIcon sx={{ fontSize: 20, color: '#64748B' }} /></InputAdornment>,
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton onClick={() => setShowConfirmPw(!showConfirmPw)} size="small">
                                      {showConfirmPw ? <EyeOffIcon fontSize="small" /> : <EyeIcon fontSize="small" />}
                                    </IconButton>
                                  </InputAdornment>
                                ),
                                sx: { borderRadius: '16px', fontWeight: 600 }
                              }}
                            />
                          </Box>

                          {/* Submit */}
                          <Box sx={{ pt: 1 }}>
                            <Button
                              type="submit"
                              variant="contained"
                              size="large"
                              disabled={saving}
                              startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <LockIcon />}
                              sx={{
                                borderRadius: '20px', px: 6, py: 1.8, fontWeight: 800,
                                bgcolor: '#F59E0B', boxShadow: '0 10px 25px rgba(245,158,11,0.35)',
                                '&:hover': { bgcolor: '#D97706' },
                                '&:disabled': { bgcolor: 'rgba(245,158,11,0.5)', color: 'white' },
                              }}
                            >
                              {saving ? 'UPDATING...' : 'UPDATE PASSWORD'}
                            </Button>
                          </Box>

                        </Stack>
                      </Box>
                      )}
                    </Box>
                  )}

                  {/* DEVICES TAB */}
                  {activeTab ==='devices' && (
                    <Box component={motion.div} key="devices" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                      <DevicesTab token={profile?.token || ''} />
                    </Box>
                  )}
                </AnimatePresence>

              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default SettingsIndex;