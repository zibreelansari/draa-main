import React, { useState, useMemo } from'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  Chip,
  LinearProgress,
  alpha,
  Paper,
  Avatar,
  IconButton,
  Tooltip,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from'@mui/material';
import {
  Search as SearchIcon,
  Favorite as HeartIcon,
  Delete as TrashIcon,
  GridView as GridIcon,
  List as ListIcon,
  Star as StarIcon,
  ArrowForward as ArrowIcon,
  ShoppingCart as CartIcon
} from'@mui/icons-material';
import { motion, AnimatePresence } from'framer-motion';
import { useWishlist, WishlistItem } from'../../hooks/useWishlist';
import DashboardLayout from'../../layouts/DashboardLayout';
import { useNavigate } from'react-router-dom';
import EmptyState from'../../components/EmptyState';
import DashboardLoader from'../../components/DashboardLoader';
import usePageTitle from '../../../hooks/usePageTitle';
import ImgWithFallback from '../../../components/common/ImgWithFallback';
import { getImageUrl } from '../../../url';

const formatPrice = (price: any) => {
  if (price === undefined || price === null) return 'FREE';
  const num = Number(price);
  if (Number.isNaN(num) || num <= 0) return 'FREE';
  return `₹${Math.round(num)}`;
};

const WishlistList: React.FC = () => {
  const { wishlist, loading, removing, removeItem, clearAll } = useWishlist();
  const navigate = useNavigate();
  usePageTitle('My Wishlist | Draa');

  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' |'list'>('grid');
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);

  const filteredItems = useMemo(() => {
    let result = [...wishlist];

    if (activeType !=='all') {
      result = result.filter(item => item.item_type === activeType);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item =>
        (item.snapshot?.title || item.snapshot?.name ||'').toLowerCase().includes(q)
      );
    }

    return result;
  }, [wishlist, activeType, searchQuery]);

  const handleNavigate = (item: WishlistItem) => {
    if (item.item_type ==='course') navigate(`/course-details/${item.item_id}`);
    if (item.item_type ==='book') navigate(`/book-details/${item.item_id}`);
    if (item.item_type ==='test_series') navigate(`/exam-topics/${item.item_id}`);
  };

  if (loading && wishlist.length === 0) {
    return (
      <DashboardLayout>
        <DashboardLoader />
      </DashboardLayout>
    );
  }

  const typeColors: Record<string, string> = {
    course:'#6366f1',
    book:'#10b981',
    test_series:'#f59e0b',
  };

  return (
    <DashboardLayout>
      <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap: 2 }}>
          <Box>
            <Box sx={{ display:'flex', alignItems:'center', gap: 2, mb: 1 }}>
              <Avatar sx={{ bgcolor: alpha('#ef4444', 0.1), color:'#ef4444', width: 40, height: 40 }}>
                <HeartIcon sx={{ fontSize: 22 }} />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>My Wishlist</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5, fontWeight: 500 }}>
              {wishlist.length} items saved  Review and manage the items you've saved for later.
            </Typography>
          </Box>
          <Stack direction="row" spacing={2} alignItems="center">
            {wishlist.length > 0 && (
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<TrashIcon />}
                onClick={() => setClearAllDialogOpen(true)}
                sx={{
                  fontWeight: 800,
                  borderRadius: 2,
                  px: 2,
                  py: 0.5,
                  borderColor: 'error.light',
                  '&:hover': { bgcolor: alpha('#ef4444', 0.05), borderColor: 'error.main' }
                }}
              >
                Clear Wishlist
              </Button>
            )}
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="caption" sx={{ fontWeight: 700, color:'text.secondary' }}>VIEW</Typography>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_, val) => val && setViewMode(val)}
                size="small"
                sx={{ bgcolor:'background.paper', borderRadius: 2 }}
              >
                <ToggleButton value="grid" sx={{ px: 2, py: 0.5, borderRadius:'4px 0 0 4px' }}>
                  <GridIcon fontSize="small" />
                </ToggleButton>
                <ToggleButton value="list" sx={{ px: 2, py: 0.5, borderRadius:'0 4px 4px 0' }}>
                  <ListIcon fontSize="small" />
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </Stack>
        </Box>

        {/* Filters and Search */}
        <Box sx={{ mb: 4, display:'flex', flexWrap:'wrap', gap: 2, alignItems:'center' }}>
          <Box sx={{ flexGrow: 1, minWidth: 280 }}>
            <TextField
              fullWidth
              placeholder="Search your saved items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color:'text.secondary' }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2, bgcolor:'background.paper' },
              }}
            />
          </Box>
          <Stack direction="row" spacing={1}>
            {[
              { key:'all', label:'All' },
              { key:'course', label:'Courses' },
              { key:'book', label:'Books' },
              { key:'test_series', label:'Tests' },
            ].map((type) => (
              <Chip
                key={type.key}
                label={type.label}
                onClick={() => setActiveType(type.key)}
                sx={{
                  fontWeight: 800,
                  borderRadius: 2,
                  px: 1,
                  bgcolor: activeType === type.key ? (type.key ==='all' ?'primary.main' : typeColors[type.key] ||'primary.main') :'background.paper',
                  color: activeType === type.key ?'white' :'text.primary',
'&:hover': { bgcolor: activeType === type.key ? (type.key ==='all' ?'primary.dark' : typeColors[type.key]) : alpha('#6366f1', 0.1) },
                }}
                variant={activeType === type.key ?'filled' :'outlined'}
              />
            ))}
          </Stack>
        </Box>

        {/* Wishlist Items */}
        <AnimatePresence mode="popLayout">
          <Grid container spacing={3}>
            {filteredItems.length === 0 ? (
              <Grid item xs={12}>
                <EmptyState
                  type="no-wishlist"
                  size="large"
                  description="Save courses, books, and test series you love by clicking the heart icon. Your wishlist helps you keep track of items you're interested in."
                  actionLabel="Browse Courses"
                  onAction={() => navigate('/courses')}
                />
              </Grid>
            ) : (
              filteredItems.map((item, idx) => (
                <Grid
                  item
                  xs={12}
                  sm={viewMode ==='grid' ? 6 : 12}
                  md={viewMode ==='grid' ? 4 : 12}
                  key={item._id}
                >
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card
                      component={motion.div}
                      whileHover={{ y: -4, boxShadow:'0 12px 30px rgba(0,0,0,0.08)' }}
                      sx={{
                        borderRadius: 3,
                        overflow:'hidden',
                        height:'100%',
                        display: viewMode ==='list' ? { xs:'flex', md:'flex' } :'block',
                        flexDirection: viewMode ==='list' ?'row' :'column',
                        border:'1px solid',
                        borderColor: alpha('#ef4444', 0.08),
                      }}
                    >
                      {/* Image */}
                      <Box sx={{
                        position:'relative',
                        width: viewMode ==='list' ? { xs: 140, md: 160 } :'100%',
                        height: viewMode ==='list' 
                          ? { xs: 140, md: 160 } 
                          : (item.item_type === 'book' ? 240 : 160),
                        flexShrink: 0,
                        bgcolor: item.item_type === 'book' ? '#f1f5f9' : alpha('#ef4444', 0.04),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: item.item_type === 'book' ? 2 : 0,
                      }}>
                        <ImgWithFallback
                          src={getImageUrl(item.snapshot?.image || item.snapshot?.coverImage)}
                          alt={item.snapshot?.title || ''}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: item.item_type === 'book' ? 'contain' : 'cover' 
                          }}
                        />
                        <Chip
                          label={item.item_type.replace('_','').toUpperCase()}
                          size="small"
                          sx={{
                            position:'absolute',
                            top: 10,
                            left: 10,
                            fontWeight: 800,
                            fontSize:'0.6rem',
                            bgcolor: typeColors[item.item_type] ||'#6366f1',
                            color:'white',
                          }}
                        />
                        <Tooltip title="Remove from wishlist">
                          <IconButton
                            component={motion.button}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            sx={{
                              position:'absolute',
                              top: 8,
                              right: 8,
                              bgcolor:'rgba(255,255,255,0.95)',
                              backdropFilter:'blur(4px)',
'&:hover': { bgcolor:'#fee2e2', color:'error.main' },
                            }}
                            size="small"
                            disabled={removing === item._id}
                            onClick={() => removeItem(item)}
                          >
                            <TrashIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>

                      {/* Content */}
                      <CardContent sx={{ p: 2.5, flex: 1, display:'flex', flexDirection:'column' }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontWeight: 800, mb: 0.5, display:'block', textTransform:'uppercase', letterSpacing: 0.5 }}
                        >
                          {item.snapshot?.category || item.snapshot?.language ||'General'}
                        </Typography>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 800,
                            mb: 1,
                            lineHeight: 1.3,
                            minHeight: viewMode ==='grid' ? 44 :'auto',
                            display:'-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient:'vertical',
                            overflow:'hidden',
                          }}
                        >
                          {item.snapshot?.title || item.snapshot?.name}
                        </Typography>

                        <Box sx={{ display:'flex', alignItems:'center', mb: 2, gap: 0.5 }}>
                          <StarIcon sx={{ fontSize: 16, color:'#f59e0b' }} />
                          <Typography variant="caption" sx={{ fontWeight: 800 }}>{item.snapshot?.rating ||'4.5'}</Typography>
                          <Typography variant="caption" color="text.disabled">({item.snapshot?.ratingCount ||'1.2k'})</Typography>
                        </Box>

                        <Box sx={{ mt:'auto', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <Typography variant="h6" sx={{ fontWeight: 800, color:'primary.main' }}>
                            {item.snapshot?.price
                              ? formatPrice(item.snapshot.price)
                              : item.snapshot?.digitalFinalPrice
                                ? formatPrice(item.snapshot.digitalFinalPrice)
                                :'FREE'}
                          </Typography>
                          <Button
                            variant="contained"
                            size="small"
                            endIcon={<ArrowIcon />}
                            onClick={() => handleNavigate(item)}
                            sx={{
                              fontWeight: 800,
                              borderRadius: 2,
                              background:'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                              boxShadow:'0 4px 12px rgba(99, 102, 241, 0.3)',
                            }}
                          >
                            View Details
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))
            )}
          </Grid>
        </AnimatePresence>
      </Box>

      {/* Premium Clear All Confirmation Dialog */}
      <Dialog
        open={clearAllDialogOpen}
        onClose={() => setClearAllDialogOpen(false)}
        aria-labelledby="clear-wishlist-dialog-title"
        aria-describedby="clear-wishlist-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: 4,
            p: 1.5,
            maxWidth: 400
          }
        }}
      >
        <DialogTitle id="clear-wishlist-dialog-title" sx={{ fontWeight: 800, fontSize: '1.2rem', pb: 1 }}>
          Clear Entire Wishlist?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="clear-wishlist-dialog-description" sx={{ fontWeight: 500, color: 'text.secondary' }}>
            Are you sure you want to clear your entire wishlist? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setClearAllDialogOpen(false)} sx={{ fontWeight: 700, borderRadius: 2, color: 'text.secondary', textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              await clearAll();
              setClearAllDialogOpen(false);
            }}
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
    </DashboardLayout>
  );
};

export default WishlistList;