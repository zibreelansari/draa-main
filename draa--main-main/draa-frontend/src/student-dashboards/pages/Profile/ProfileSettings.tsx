import React, { useState, useEffect, useRef } from'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  alpha,
  Paper,
  Avatar,
  Stack,
  Divider,
  Switch,
  IconButton,
  CircularProgress,
  Chip,
  MenuItem,
  Tooltip,
  Badge,
  useMediaQuery,
  useTheme,
  Alert
} from '@mui/material';
import {
  Person as ProfileIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  LocationOn as LocationIcon,
  Notifications as NotificationsIcon,
  Shield as ShieldIcon,
  Visibility as EyeIcon,
  VisibilityOff as EyeOffIcon,
  Save as SaveIcon,
  CameraAlt as CameraIcon,
  Verified as VerifiedIcon,
  Security as SecurityIcon,
  NotificationsActive as ActiveNotifIcon,
  CheckCircle as CheckIcon,
  AccountBalanceWallet as WalletIcon,
  Error as ErrorIcon,
  AutoGraph as MetricsIcon,
  TrendingUp as TrendIcon,
  EmojiEvents as TrophyIcon,
  ChevronRight as ChevronRightIcon,
  EmojiEvents as LeaderboardIcon,
  Settings as SettingsIcon,
  LocalFireDepartment as StreakIcon,
  WorkspacePremium as LevelIcon,
  Google as GoogleIcon,
  KeyOff as KeyOffIcon,
} from'@mui/icons-material';
import { motion, AnimatePresence } from'framer-motion';
import { useStudentProfile } from'../../hooks/useStudentProfile';
import { useStudentLeaderboard } from'../../hooks/useStudentLeaderboard';
import DashboardLayout from'../../layouts/DashboardLayout';
import { useNavigate } from'react-router-dom';
import { BACKEND_UPLOAD_URL } from'../../../url';
import DashboardLoader from'../../components/DashboardLoader';
import toast from'../../../utils/toast';
import usePageTitle from'../../../hooks/usePageTitle';

const emptyDeliveryAddress = {
  fullName:'',
  phone:'',
  house:'',
  area:'',
  landmark:'',
  pincode:'',
  city:'',
  district:'',
  state:'',
  country:'India'
};

const ProfileSettings: React.FC = () => {
  const { profile, loading, updateProfile, changePassword } = useStudentProfile();
  const { studentRank, achievements } = useStudentLeaderboard(profile?.id || profile?._id, profile?.token);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isExtraSmall = useMediaQuery(theme.breakpoints.down('xs'));

  const [activeTab, setActiveTab] = useState(0);

  // Detect Google SSO user
  const isGoogleUser = !!(profile?.authProvider === 'google' || profile?.googleId);

  const tabTitles = ['Profile Settings', 'My Performance', 'Security', 'Privacy'];
  usePageTitle(tabTitles[activeTab] + ' | Draa');
  const [formData, setFormData] = useState({
    name:'',
    email:'',
    phn:'',
    deliveryAddress: emptyDeliveryAddress
  });
  const [passwordData, setPasswordData] = useState({ currentPassword:'', newPassword:'', confirmPassword:'' });
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ name?: string; email?: string; phn?: string; deliveryPhone?: string; pincode?: string; currentPassword?: string; newPassword?: string; confirmPassword?: string }>({});
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeResults, setPincodeResults] = useState<any[]>([]);
  const [verifiedPincode, setVerifiedPincode] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name ||'',
        email: profile.email ||'',
        phn: profile.phn ||'',
        deliveryAddress: {
          ...emptyDeliveryAddress,
          ...(profile.deliveryAddress || {}),
          fullName: profile.deliveryAddress?.fullName || profile.name ||'',
          phone: profile.deliveryAddress?.phone || profile.phn ||''
        }
      });
      if (profile.deliveryAddress?.pincode && profile.deliveryAddress?.city && profile.deliveryAddress?.state) {
        setVerifiedPincode(profile.deliveryAddress.pincode);
      }
      if (profile.avatar) {
        setAvatarPreview(profile.avatar.startsWith('http') ? profile.avatar : `${BACKEND_UPLOAD_URL}/${profile.avatar}`);
      }
    }
  }, [profile]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeliveryPincodeLookup = async (pin: string) => {
    const pincode = pin.replace(/\D/g,'').slice(0, 6);
    setVerifiedPincode('');
    setPincodeResults([]);
    setFormData(prev => ({
      ...prev,
      deliveryAddress: {
        ...prev.deliveryAddress,
        pincode,
        area:'',
        city:'',
        district:'',
        state:''
      }
    }));

    if (pincode.length !== 6) {
      setErrors(prev => ({
        ...prev,
        pincode: pincode ?'Pincode must be exactly 6 digits' : undefined
      }));
      return;
    }

    setPincodeLoading(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await res.json();
      if (data[0]?.Status ==='Success' && Array.isArray(data[0].PostOffice) && data[0].PostOffice.length > 0) {
        const results = data[0].PostOffice;
        const po = results[0];
        setPincodeResults(results);
        setVerifiedPincode(pincode);
        setFormData(prev => ({
          ...prev,
          deliveryAddress: {
            ...prev.deliveryAddress,
            area: po.Name ||'',
            city: po.Block && po.Block !=='NA' ? po.Block : po.District,
            district: po.District ||'',
            state: po.State ||''
          }
        }));
        setErrors(prev => ({ ...prev, pincode: undefined }));
      } else {
        setErrors(prev => ({ ...prev, pincode:'Invalid pincode or not found' }));
      }
    } catch {
      setErrors(prev => ({ ...prev, pincode:'Could not verify pincode. Please try again.' }));
    } finally {
      setPincodeLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: typeof errors = {};
    if (!formData.name.trim()) {
      newErrors.name ='Full name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name ='Name must be at least 3 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
      newErrors.name ='Name can only contain alphabets and spaces';
    }

    if (!formData.email.trim()) {
      newErrors.email ='Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email ='Please enter a valid email address';
    }

    if (!formData.phn.trim()) {
      newErrors.phn ='Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phn.trim())) {
      newErrors.phn ='Phone number must be exactly 10 digits';
    }

    const address = formData.deliveryAddress;
    const hasDeliveryLocation = ['house','area','landmark','pincode','city','district','state']
      .some(key => String((address as any)[key] ||'').trim());

    if (hasDeliveryLocation) {
      if (address.phone && !/^\d{10}$/.test(address.phone.trim())) {
        newErrors.deliveryPhone ='Delivery phone number must be exactly 10 digits';
      }
      if (!address.pincode || !/^\d{6}$/.test(address.pincode.trim())) {
        newErrors.pincode ='Pincode must be exactly 6 digits';
      } else if (verifiedPincode !== address.pincode.trim()) {
        newErrors.pincode ='Please enter a valid pincode and select one of the suggested areas';
      } else if (!address.area.trim() || !address.city.trim() || !address.state.trim()) {
        newErrors.pincode ='Please select a suggested area for this pincode';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    const data = new FormData();
    data.append('name', formData.name.trim());
    data.append('email', formData.email.trim());
    data.append('phn', formData.phn.trim());
    data.append('deliveryAddress', JSON.stringify({
      ...formData.deliveryAddress,
      fullName: formData.deliveryAddress.fullName.trim(),
      phone: formData.deliveryAddress.phone.trim(),
      house: formData.deliveryAddress.house.trim(),
      area: formData.deliveryAddress.area.trim(),
      landmark: formData.deliveryAddress.landmark.trim(),
      pincode: formData.deliveryAddress.pincode.trim(),
      city: formData.deliveryAddress.city.trim(),
      district: formData.deliveryAddress.district.trim(),
      state: formData.deliveryAddress.state.trim(),
      country: formData.deliveryAddress.country.trim() ||'India'
    }));
    if (avatarFile) {
      data.append('avatar', avatarFile);
    }

    const res = await updateProfile(data, true);
    if (res.success) {
      toast.success('Profile updated successfully!');
      setAvatarFile(null);
    } else {
      toast.error(res.message || 'Update failed');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: typeof errors = {};
    if (!passwordData.currentPassword) {
      newErrors.currentPassword ='Current password is required';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword ='New password is required';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword ='Password must be at least 8 characters';
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword ='Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword ='Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const res = await changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
    if (res.success) {
      if (res.logout) {
        toast.success('Password changed successfully!', 3);
        localStorage.removeItem('edudocs');
        toast.info('You have been logged out from all devices. Please log in with your new password.', 5);
        setTimeout(() => navigate('/student-login'), 1200);
      } else {
        toast.success('Password changed successfully!');
        setPasswordData({ currentPassword:'', newPassword:'', confirmPassword:'' });
      }
    } else {
      toast.error(res.message || 'Password change failed');
    }
  };

  if (!profile && loading) {
    return (
      <DashboardLayout>
        <DashboardLoader />
      </DashboardLayout>
    );
  }

  const tabs = [
    { label:'General Info', icon: <ProfileIcon /> },
    { label:'Performance', icon: <TrendIcon /> },
    { label:'Security', icon: <SecurityIcon /> },
    { label:'Privacy', icon: <ShieldIcon /> },
  ];

  return (
    <DashboardLayout>
      <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap: 2 }}>
          <Box sx={{ flex: 1, minWidth: isMobile ?'100%' :'auto' }}>
            <Box sx={{ display:'flex', alignItems:'center', gap: isMobile ? 1.5 : 2, mb: 1 }}>
              <Avatar sx={{ bgcolor: alpha('#6366f1', 0.1), color:'#6366f1', width: isMobile ? 32 : 40, height: isMobile ? 32 : 40 }}>
                <ProfileIcon sx={{ fontSize: isMobile ? 18 : 22 }} />
              </Avatar>
              <Typography variant={isMobile ?"h5" :"h4"} sx={{ fontWeight: 800 }}>Account Settings</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5, fontWeight: 500, fontSize: isMobile ?'0.75rem' :'0.875rem' }}>
              Manage your personal information and security.
            </Typography>
          </Box>

          {/* Quick Stats with Metrics Integration */}
          <Grid container spacing={isMobile ? 1 : 2} sx={{ width: isMobile ?'100%' :'auto', mt: isMobile ? 2 : 0 }}>
            {[
              { label:'COINS', value: profile?.coins || 0, icon: <WalletIcon />, color:'#f59e0b', bg:'rgba(245,158,11,0.05)' },
              { label:'RANK', value: `#${studentRank?.rank ||'-'}`, icon: <LeaderboardIcon />, color:'#f59e0b', bg:'rgba(245,158,11,0.05)', link:'/v2/student/leaderboard' },
              { label:'STREAK', value: `${studentRank?.streak || 0} d`, icon: <StreakIcon />, color:'#f97316', bg:'rgba(249,115,22,0.05)' },
              { label:'BADGES', value: achievements?.totalEarned || 0, icon: <TrophyIcon />, color:'#ec4899', bg:'rgba(236,72,153,0.05)' },
              { label:'LEVEL', value: studentRank?.level || 1, icon: <LevelIcon />, color:'#10b981', bg:'rgba(16,185,129,0.05)' },
            ].map((stat, i) => (
              <Grid item xs={6} sm="auto" key={i}>
                <Card 
                  onClick={stat.link ? () => navigate(stat.link!) : undefined}
                  sx={{
                    px: isMobile ? 1.5 : 3, py: isMobile ? 1 : 1.5,
                    display:'flex', alignItems:'center', gap: isMobile ? 1 : 1.5,
                    background: `linear-gradient(135deg, ${stat.bg} 0%, transparent 100%)`,
                    border:'1px solid', borderColor: alpha(stat.color, 0.1),
                    borderRadius: 3,
                    cursor: stat.link ?'pointer' :'default',
                    height:'100%',
'&:hover': stat.link ? { borderColor: alpha(stat.color, 0.3) } : {}
                  }}
                >
                  <Avatar sx={{ bgcolor: alpha(stat.color, 0.1), color: stat.color, width: isMobile ? 24 : 32, height: isMobile ? 24 : 32 }}>
                    {React.cloneElement(stat.icon as React.ReactElement, { sx: { fontSize: isMobile ? 14 : 18 } })}
                  </Avatar>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 800, color:'text.secondary', display:'block', fontSize: isMobile ?'0.6rem' :'0.75rem' }}>{stat.label}</Typography>
                    <Typography variant={isMobile ?"subtitle2" :"h6"} sx={{ fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</Typography>
                  </Box>
                </Card>
              </Grid>
            ))}

            <Grid item xs={6} sm="auto">
              <Button
                fullWidth
                variant="outlined"
                size={isMobile ?"small" :"medium"}
                startIcon={<MetricsIcon />}
                onClick={() => navigate('/v2/student/metrics')}
                sx={{
                  height:'100%',
                  borderRadius: 3,
                  borderColor: alpha('#6366f1', 0.3),
                  fontSize: isMobile ?'0.7rem' :'0.875rem',
                  py: isMobile ? 1 : 1.5,
'&:hover': { borderColor:'#6366f1', bgcolor: alpha('#6366f1', 0.05) }
                }}
              >
                Metrics
              </Button>
            </Grid>

            <Grid item xs={6} sm="auto">
              <Button
                fullWidth
                variant="outlined"
                size={isMobile ?"small" :"medium"}
                startIcon={<SettingsIcon />}
                onClick={() => navigate('/v2/student/settings')}
                sx={{
                  height:'100%',
                  borderRadius: 3,
                  borderColor: alpha('#8b5cf6', 0.3),
                  fontSize: isMobile ?'0.7rem' :'0.875rem',
                  py: isMobile ? 1 : 1.5,
'&:hover': { borderColor:'#8b5cf6', bgcolor: alpha('#8b5cf6', 0.05) }
                }}
              >
                Settings
              </Button>
            </Grid>
          </Grid>
        </Box>

        <AnimatePresence>
        </AnimatePresence>

        <Grid container spacing={4}>
          {/* Side Profile Card */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              <Card sx={{ border:'1px solid', borderColor: alpha('#6366f1', 0.08), textAlign:'center', p: 4, position:'relative', overflow:'visible' }}>
                <Box sx={{ position:'relative', width: 120, height: 120, mx:'auto', mb: 2 }}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical:'bottom', horizontal:'right' }}
                    badgeContent={
                      <Tooltip title="Upload Avatar">
                        <IconButton
                          onClick={() => fileInputRef.current?.click()}
                          sx={{
                            bgcolor:'white',
                            boxShadow:'0 4px 12px rgba(0,0,0,0.1)',
                            border:'1px solid',
                            borderColor:'divider',
'&:hover': { bgcolor: alpha('#6366f1', 0.05) },
                            width: 36, height: 36
                          }}
                        >
                          <CameraIcon fontSize="small" sx={{ color:'#6366f1' }} />
                        </IconButton>
                      </Tooltip>
                    }
                  >
                    <Avatar
                      src={avatarPreview ||''}
                      sx={{
                        width: 120, height: 120,
                        fontSize: 48, fontWeight: 800,
                        background:'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        boxShadow:'0 8px 24px rgba(99, 102, 241, 0.3)',
                        border:'4px solid white'
                      }}
                    >
                      {!avatarPreview && (profile?.name?.[0].toUpperCase() ||'U')}
                    </Avatar>
                  </Badge>
                  <input
                    type="file"
                    hidden
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    accept="image/*"
                  />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>{profile?.name ||'Student'}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{profile?.email}</Typography>
                
                <Stack direction="row" spacing={1} justifyContent="center">
                  <Chip
                    icon={profile?.Status ==='Verified' ? <VerifiedIcon sx={{ fontSize:'14px !important' }} /> : <ErrorIcon sx={{ fontSize:'14px !important' }} />}
                    label={profile?.Status ==='Verified' ?'Verified Student' :'Under Review'}
                    size="small"
                    sx={{
                      bgcolor: profile?.Status ==='Verified' ? alpha('#10b981', 0.08) : alpha('#f59e0b', 0.08),
                      color: profile?.Status ==='Verified' ?'#10b981' :'#f59e0b',
                      fontWeight: 800,
                      border:'1px solid',
                      borderColor: profile?.Status ==='Verified' ? alpha('#10b981', 0.2) : alpha('#f59e0b', 0.2),
                    }}
                  />
                  {profile?.isEmailVerified && (
                    <Chip
                      icon={<CheckIcon sx={{ fontSize:'14px !important' }} />}
                      label="Email Verified"
                      size="small"
                      sx={{
                        bgcolor: alpha('#6366f1', 0.08),
                        color:'#6366f1',
                        fontWeight: 800,
                        border:'1px solid',
                        borderColor: alpha('#6366f1', 0.2),
                      }}
                    />
                  )}
                </Stack>
              </Card>

              {/* Tab Navigation */}
              <Card sx={{ border:'1px solid', borderColor: alpha('#6366f1', 0.08) }}>
                <CardContent sx={{ p: 1 }}>
                  {tabs.map((tab, i) => (
                    <Box
                      key={i}
                      onClick={() => setActiveTab(i)}
                      component={motion.div}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      sx={{
                        display:'flex', alignItems:'center', gap: 2, p: 2, borderRadius: 2, cursor:'pointer', transition:'all 0.2s',
                        bgcolor: activeTab === i ? alpha('#6366f1', 0.06) :'transparent',
                        border:'1px solid', borderColor: activeTab === i ? alpha('#6366f1', 0.15) :'transparent',
                        mb: i < tabs.length - 1 ? 1 : 0,
'&:hover': { bgcolor: alpha('#6366f1', 0.04) },
                      }}
                    >
                      <Avatar sx={{ bgcolor: alpha(activeTab === i ?'#6366f1' :'#64748b', 0.1), color: activeTab === i ?'#6366f1' :'text.secondary', width: 36, height: 36 }}>
                        {tab.icon}
                      </Avatar>
                      <Typography variant="subtitle2" sx={{ fontWeight: activeTab === i ? 800 : 600, color: activeTab === i ?'#6366f1' :'text.secondary' }}>
                        {tab.label}
                      </Typography>
                      {activeTab === i && (
                        <Box sx={{ ml:'auto', width: 8, height: 8, borderRadius:'50%', bgcolor:'#6366f1' }} theme={motion.div} layoutId="activeDot" />
                      )}
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          {/* Main Form Area */}
          <Grid item xs={12} md={8}>
            <Card sx={{ border:'1px solid', borderColor: alpha('#6366f1', 0.06), minHeight: 600 }}>
              <CardContent sx={{ p: 4 }}>
                <AnimatePresence mode="wait">
                  {activeTab === 0 && (
                    <Box component={motion.div} key={0} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <Box sx={{ display:'flex', alignItems:'center', gap: 2, mb: 4 }}>
                        <Avatar sx={{ bgcolor: alpha('#6366f1', 0.1), color:'#6366f1' }}>
                          <ProfileIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 800 }}>General Information</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Update your identity and contact details</Typography>
                        </Box>
                      </Box>
                      <Box component="form" onSubmit={handleUpdate}>
                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" sx={{ fontWeight: 800, mb: 1.5, display:'block', color:'text.secondary', letterSpacing: 1 }}>FULL NAME</Typography>
                            <TextField
                              fullWidth
                              error={!!errors.name}
                              helperText={errors.name}
                              value={formData.name}
                              onChange={(e) => {
                                setFormData({ ...formData, name: e.target.value });
                                if (errors.name) setErrors({ ...errors, name: undefined });
                              }}
                              placeholder="Your Name"
                              InputProps={{
                                startAdornment: <InputAdornment position="start"><ProfileIcon sx={{ color:'text.disabled', fontSize: 20 }} /></InputAdornment>,
                                sx: { borderRadius: 3, bgcolor: alpha('#f8fafc', 0.5) },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" sx={{ fontWeight: 800, mb: 1.5, display:'block', color:'text.secondary', letterSpacing: 1 }}>EMAIL ADDRESS</Typography>
                            <TextField
                              fullWidth
                              disabled
                              value={formData.email}
                              placeholder="email@example.com"
                              InputProps={{
                                startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color:'text.disabled', fontSize: 20 }} /></InputAdornment>,
                                sx: { borderRadius: 3, bgcolor: alpha('#f8fafc', 0.5) },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" sx={{ fontWeight: 800, mb: 1.5, display:'block', color:'text.secondary', letterSpacing: 1 }}>PHONE NUMBER</Typography>
                            <TextField
                              fullWidth
                              error={!!errors.phn}
                              helperText={errors.phn}
                              value={formData.phn}
                              onChange={(e) => {
                                setFormData({ ...formData, phn: e.target.value.replace(/\D/g,'').slice(0, 10) });
                                if (errors.phn) setErrors({ ...errors, phn: undefined });
                              }}
                              placeholder="Phone Number"
                              InputProps={{
                                startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ color:'text.disabled', fontSize: 20 }} /></InputAdornment>,
                                sx: { borderRadius: 3, bgcolor: alpha('#f8fafc', 0.5) },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <Divider sx={{ mt: 2, mb: 1 }} />
                            <Box sx={{ display:'flex', alignItems:'center', gap: 1.5, mt: 3, mb: 1 }}>
                              <Avatar sx={{ bgcolor: alpha('#10b981', 0.1), color:'#10b981', width: 34, height: 34 }}>
                                <LocationIcon sx={{ fontSize: 19 }} />
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Default Delivery Address</Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Used automatically on book checkout</Typography>
                              </Box>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" sx={{ fontWeight: 800, mb: 1.5, display:'block', color:'text.secondary', letterSpacing: 1 }}>RECIPIENT NAME</Typography>
                            <TextField
                              fullWidth
                              value={formData.deliveryAddress.fullName}
                              onChange={(e) => setFormData({
                                ...formData,
                                deliveryAddress: { ...formData.deliveryAddress, fullName: e.target.value }
                              })}
                              placeholder="Delivery Name"
                              InputProps={{
                                startAdornment: <InputAdornment position="start"><ProfileIcon sx={{ color:'text.disabled', fontSize: 20 }} /></InputAdornment>,
                                sx: { borderRadius: 3, bgcolor: alpha('#f8fafc', 0.5) },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" sx={{ fontWeight: 800, mb: 1.5, display:'block', color:'text.secondary', letterSpacing: 1 }}>DELIVERY PHONE</Typography>
                            <TextField
                              fullWidth
                              error={!!errors.deliveryPhone}
                              helperText={errors.deliveryPhone}
                              value={formData.deliveryAddress.phone}
                              onChange={(e) => {
                                const phone = e.target.value.replace(/\D/g,'').slice(0, 10);
                                setFormData({
                                  ...formData,
                                  deliveryAddress: { ...formData.deliveryAddress, phone }
                                });
                                if (errors.deliveryPhone) setErrors({ ...errors, deliveryPhone: undefined });
                              }}
                              placeholder="10-digit mobile number"
                              InputProps={{
                                startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ color:'text.disabled', fontSize: 20 }} /></InputAdornment>,
                                sx: { borderRadius: 3, bgcolor: alpha('#f8fafc', 0.5) },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="caption" sx={{ fontWeight: 800, mb: 1.5, display:'block', color:'text.secondary', letterSpacing: 1 }}>HOUSE / BUILDING</Typography>
                            <TextField
                              fullWidth
                              value={formData.deliveryAddress.house}
                              onChange={(e) => setFormData({
                                ...formData,
                                deliveryAddress: { ...formData.deliveryAddress, house: e.target.value }
                              })}
                              placeholder="Door number, building name, floor"
                              InputProps={{
                                startAdornment: <InputAdornment position="start"><HomeIcon sx={{ color:'text.disabled', fontSize: 20 }} /></InputAdornment>,
                                sx: { borderRadius: 3, bgcolor: alpha('#f8fafc', 0.5) },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" sx={{ fontWeight: 800, mb: 1.5, display:'block', color:'text.secondary', letterSpacing: 1 }}>AREA / COLONY</Typography>
                            {pincodeResults.length > 0 ? (
                              <TextField
                                select
                                fullWidth
                                value={formData.deliveryAddress.area}
                                onChange={(e) => {
                                  const po = pincodeResults.find(item => item.Name === e.target.value);
                                  setFormData({
                                    ...formData,
                                    deliveryAddress: {
                                      ...formData.deliveryAddress,
                                      area: e.target.value,
                                      city: po?.Block && po.Block !=='NA' ? po.Block : po?.District || formData.deliveryAddress.city,
                                      district: po?.District || formData.deliveryAddress.district,
                                      state: po?.State || formData.deliveryAddress.state
                                    }
                                  });
                                }}
                                InputProps={{ sx: { borderRadius: 3, bgcolor: alpha('#f8fafc', 0.5) } }}
                              >
                                {pincodeResults.map(po => (
                                  <MenuItem key={`${po.Name}-${po.BranchType}`} value={po.Name}>
                                    {po.Name} ({po.BranchType})
                                  </MenuItem>
                                ))}
                              </TextField>
                            ) : (
                              <TextField
                                fullWidth
                                value={formData.deliveryAddress.area}
                                placeholder="Enter pincode to load area suggestions"
                                disabled
                                InputProps={{ sx: { borderRadius: 3, bgcolor: alpha('#f8fafc', 0.5) } }}
                              />
                            )}
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" sx={{ fontWeight: 800, mb: 1.5, display:'block', color:'text.secondary', letterSpacing: 1 }}>LANDMARK</Typography>
                            <TextField
                              fullWidth
                              value={formData.deliveryAddress.landmark}
                              onChange={(e) => setFormData({
                                ...formData,
                                deliveryAddress: { ...formData.deliveryAddress, landmark: e.target.value }
                              })}
                              placeholder="Optional landmark"
                              InputProps={{ sx: { borderRadius: 3, bgcolor: alpha('#f8fafc', 0.5) } }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Typography variant="caption" sx={{ fontWeight: 800, mb: 1.5, display:'block', color:'text.secondary', letterSpacing: 1 }}>PINCODE</Typography>
                            <TextField
                              fullWidth
                              error={!!errors.pincode}
                              helperText={errors.pincode || (verifiedPincode === formData.deliveryAddress.pincode && pincodeResults.length > 0 ? `${pincodeResults.length} area suggestion${pincodeResults.length > 1 ?'s' :''} found` : '')}
                              value={formData.deliveryAddress.pincode}
                              onChange={(e) => handleDeliveryPincodeLookup(e.target.value)}
                              placeholder="6-digit pincode"
                              InputProps={{
                                endAdornment: pincodeLoading ? <InputAdornment position="end"><CircularProgress size={18} /></InputAdornment> : undefined,
                                sx: { borderRadius: 3, bgcolor: alpha('#f8fafc', 0.5) }
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Typography variant="caption" sx={{ fontWeight: 800, mb: 1.5, display:'block', color:'text.secondary', letterSpacing: 1 }}>CITY / DISTRICT</Typography>
                            <TextField
                              fullWidth
                              value={formData.deliveryAddress.city}
                              onChange={(e) => setFormData({
                                ...formData,
                                deliveryAddress: { ...formData.deliveryAddress, city: e.target.value }
                              })}
                              placeholder="City"
                              InputProps={{ sx: { borderRadius: 3, bgcolor: alpha('#f8fafc', 0.5) } }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Typography variant="caption" sx={{ fontWeight: 800, mb: 1.5, display:'block', color:'text.secondary', letterSpacing: 1 }}>STATE</Typography>
                            <TextField
                              fullWidth
                              value={formData.deliveryAddress.state}
                              onChange={(e) => setFormData({
                                ...formData,
                                deliveryAddress: { ...formData.deliveryAddress, state: e.target.value }
                              })}
                              placeholder="State"
                              InputProps={{ sx: { borderRadius: 3, bgcolor: alpha('#f8fafc', 0.5) } }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <Box sx={{ mt: 4, pt: 4, borderTop:'1px solid', borderColor:'divider' }}>
                              <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                disabled={loading}
                                sx={{
                                  borderRadius: 3, px: 6, py: 1.5, fontWeight: 800,
                                  background:'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                  boxShadow:'0 8px 20px rgba(99, 102, 241, 0.3)',
'&:hover': { transform:'translateY(-2px)', boxShadow:'0 12px 24px rgba(99, 102, 241, 0.4)' }
                                }}
                              >
                                {loading ?'SAVING...' :'SAVE CHANGES'}
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    </Box>
                  )}

                  {activeTab === 1 && (
                    <Box component={motion.div} key={1} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <Box sx={{ display:'flex', alignItems:'center', gap: 2, mb: 4 }}>
                        <Avatar sx={{ bgcolor: alpha('#10b981', 0.1), color:'#10b981' }}>
                          <TrendIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 800 }}>Performance Overview</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>View your metrics and achievements</Typography>
                        </Box>
                      </Box>
                      <Stack spacing={3}>
                        <Card variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: alpha('#6366f1', 0.04) }}>
                          <Stack direction="row" alignItems="center" spacing={3}>
                            <Avatar sx={{ bgcolor:'#6366f1', width: 56, height: 56 }}>
                              <TrophyIcon sx={{ fontSize: 28 }} />
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="caption" sx={{ fontWeight: 800, color:'text.secondary', letterSpacing: 1 }}>ACHIEVEMENT SCORE</Typography>
                              <Typography variant="h4" sx={{ fontWeight: 800, color:'#6366f1' }}>View Full Metrics</Typography>
                              <Typography variant="body2" color="text.secondary">Track your academic performance and learning progress</Typography>
                            </Box>
                            <Button
                              variant="contained"
                              endIcon={<ChevronRightIcon />}
                              onClick={() => navigate('/v2/student/metrics')}
                              sx={{
                                borderRadius: 3,
                                background:'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                boxShadow:'0 8px 20px rgba(99, 102, 241, 0.3)',
                              }}
                            >
                              View Dashboard
                            </Button>
                          </Stack>
                        </Card>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, textAlign:'center' }}>
                              <Typography variant="caption" color="text.secondary">Profile Completion</Typography>
                              <Typography variant="h5" sx={{ fontWeight: 800, color:'#10b981' }}>100%</Typography>
                            </Paper>
                          </Grid>
                          <Grid item xs={6}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, textAlign:'center' }}>
                              <Typography variant="caption" color="text.secondary">Account Status</Typography>
                              <Chip
                                icon={profile?.Status ==='Verified' ? <VerifiedIcon sx={{ fontSize:'14px !important' }} /> : <ErrorIcon sx={{ fontSize:'14px !important' }} />}
                                label={profile?.Status ||'Pending'}
                                size="small"
                                sx={{
                                  bgcolor: profile?.Status ==='Verified' ? alpha('#10b981', 0.08) : alpha('#f59e0b', 0.08),
                                  color: profile?.Status ==='Verified' ?'#10b981' :'#f59e0b',
                                  fontWeight: 800
                                }}
                              />
                            </Paper>
                          </Grid>
                        </Grid>
                        <Alert severity="info" sx={{ borderRadius: 2 }}>
                          Check your detailed metrics dashboard to see your academic performance, exam scores, course progress, and achievements!
                        </Alert>
                      </Stack>
                    </Box>
                  )}

                  {activeTab === 2 && (
                    <Box component={motion.div} key={1} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <Box sx={{ display:'flex', alignItems:'center', gap: 2, mb: 4 }}>
                        <Avatar sx={{ bgcolor: alpha('#f59e0b', 0.1), color:'#f59e0b' }}>
                          <LockIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 800 }}>Account Security</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Manage your password and authentication</Typography>
                        </Box>
                      </Box>

                      {/* ── Google SSO Locked State ── */}
                      {isGoogleUser ? (
                        <Box
                          sx={{
                            maxWidth: 520,
                            p: 4,
                            borderRadius: 4,
                            background:'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                            border:'1.5px solid #bae6fd',
                            display:'flex',
                            flexDirection:'column',
                            alignItems:'center',
                            textAlign:'center',
                            gap: 2,
                          }}
                        >
                          <Box sx={{
                            width: 72, height: 72, borderRadius:'50%',
                            background:'linear-gradient(135deg, #4285f4, #34a853)',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            boxShadow:'0 8px 24px rgba(66,133,244,0.35)',
                          }}>
                            <GoogleIcon sx={{ fontSize: 38, color:'white' }} />
                          </Box>

                          <Typography variant="h6" sx={{ fontWeight: 800, color:'#1e293b' }}>
                            Signed in with Google
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, lineHeight: 1.7 }}>
                            Your account uses <strong>Google SSO</strong> for authentication. Password-based login is
                            disabled for your account — your Google account manages your security.
                          </Typography>

                          <Box sx={{
                            mt: 1, px: 3, py: 1.5,
                            bgcolor:'white', borderRadius: 3,
                            border:'1px solid #bae6fd',
                            display:'flex', alignItems:'center', gap: 1.5,
                          }}>
                            <KeyOffIcon sx={{ color:'#64748b', fontSize: 20 }} />
                            <Typography variant="body2" sx={{ color:'#475569', fontWeight: 600 }}>
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
                              sx={{ color:'#4285f4', fontWeight: 700, textDecoration:'none','&:hover': { textDecoration:'underline' } }}
                            >
                              myaccount.google.com
                            </Box>
                          </Typography>
                        </Box>
                      ) : (
                        /* ── Normal Password Change Form ── */
                        <Box component="form" onSubmit={handlePasswordChange}>
                          <Stack spacing={4} sx={{ maxWidth: 500 }}>
                            {[
                              { key:'currentPassword', label:'Current Password', icon: <LockIcon /> },
                              { key:'newPassword', label:'New Password', icon: <SecurityIcon /> },
                              { key:'confirmPassword', label:'Confirm Password', icon: <CheckIcon /> },
                            ].map((field) => (
                              <Box key={field.key}>
                                <Typography variant="caption" sx={{ fontWeight: 800, mb: 1.5, display:'block', color:'text.secondary', letterSpacing: 1 }}>{field.label.toUpperCase()}</Typography>
                                <TextField
                                  fullWidth
                                  type={showPassword ?'text' :'password'}
                                  value={(passwordData as any)[field.key]}
                                  onChange={(e) => setPasswordData({ ...passwordData, [field.key]: e.target.value })}
                                  InputProps={{
                                    startAdornment: <InputAdornment position="start">{React.cloneElement(field.icon as React.ReactElement, { sx: { fontSize: 20, color:'text.disabled' } })}</InputAdornment>,
                                    endAdornment: field.key ==='currentPassword' && (
                                      <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword(!showPassword)} size="small">
                                          {showPassword ? <EyeOffIcon fontSize="small" /> : <EyeIcon fontSize="small" />}
                                        </IconButton>
                                      </InputAdornment>
                                    ),
                                    sx: { borderRadius: 3, bgcolor: alpha('#f8fafc', 0.5) },
                                  }}
                                />
                              </Box>
                            ))}
                            <Button
                              type="submit"
                              variant="contained"
                              size="large"
                              disabled={loading}
                              sx={{
                                borderRadius: 3, py: 1.5, fontWeight: 800,
                                background:'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                boxShadow:'0 8px 20px rgba(245, 158, 11, 0.3)',
                              }}
                            >
                              {loading ?'UPDATING...' :'UPDATE PASSWORD'}
                            </Button>
                          </Stack>
                        </Box>
                      )}
                    </Box>
                  )}

                  {/* Other tabs remain similar but with updated styling... */}
                  {activeTab === 3 && (
                    <Box component={motion.div} key={3} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <Box sx={{ display:'flex', alignItems:'center', gap: 2, mb: 4 }}>
                        <Avatar sx={{ bgcolor: alpha('#6366f1', 0.1), color:'#6366f1' }}>
                          <ShieldIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 800 }}>Privacy & Policy</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Your data safety and legal agreements</Typography>
                        </Box>
                      </Box>
                      <Stack spacing={2}>
                        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, cursor:'pointer','&:hover': { bgcolor: alpha('#6366f1', 0.03) } }} onClick={() => navigate('/privacy-policy')}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>Privacy Policy</Typography>
                          <Typography variant="caption" color="text.secondary">Review how we handle and protect your personal information.</Typography>
                        </Paper>
                        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, cursor:'pointer','&:hover': { bgcolor: alpha('#6366f1', 0.03) } }} onClick={() => navigate('/tnc')}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>Terms & Conditions</Typography>
                          <Typography variant="caption" color="text.secondary">The legal terms governing your use of the platform.</Typography>
                        </Paper>
                      </Stack>
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

export default ProfileSettings;
