import React, { useState, useMemo } from'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  Chip,
  LinearProgress,
  alpha,
  Paper,
  IconButton,
  Rating,
  Avatar,
  Stack,
  Tooltip,
  useMediaQuery,
  useTheme
} from'@mui/material';
import {
  Search as SearchIcon,
  MenuBook as BookIcon,
  LocalShipping as ShippingIcon,
  Download as DownloadIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Star as StarIcon,
  LibraryBooks as LibraryIcon,
  AutoGraph as GraphIcon,
  TrendingUp as TrendIcon
} from'@mui/icons-material';
import { motion, AnimatePresence } from'framer-motion';
import { useStudentBooks, Book } from'../../hooks/useStudentBooks';
import DashboardLayout from'../../layouts/DashboardLayout';
import { useNavigate, useParams } from'react-router-dom';
import uri from'../../../url';
import EmptyState from'../../components/EmptyState';
import DashboardLoader from'../../components/DashboardLoader';
import usePageTitle from '../../../hooks/usePageTitle';

const BooksList: React.FC = () => {
  const { studentId: urlStudentId } = useParams<{ studentId: string }>();
  const user = JSON.parse(localStorage.getItem('edudocs') ||'{}');

  // Use ID from URL if it's a valid ObjectId, otherwise fallback to localStorage
  const isValidObjectId = (id?: string) => id && id.length === 24 && /^[0-9a-fA-F]+$/.test(id);
  const effectiveStudentId = isValidObjectId(urlStudentId) ? urlStudentId : (user.id || user._id);

  const { books, categories, stats, loading, refresh } = useStudentBooks(effectiveStudentId, user.token);
  const navigate = useNavigate();
  usePageTitle('My Books | Draa');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isExtraSmall = useMediaQuery(theme.breakpoints.down('xs'));

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFormat, setSelectedFormat] = useState('all');

  const filteredBooks = useMemo(() => {
    let result = [...books];

    if (selectedCategory !=='all') {
      result = result.filter(b => b.book.category === selectedCategory);
    }

    if (selectedFormat !=='all') {
      result = result.filter(b => b.purchaseType === selectedFormat);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b =>
        b.book.title.toLowerCase().includes(q) ||
        b.book.author.toLowerCase().includes(q)
      );
    }

    return result;
  }, [books, selectedCategory, selectedFormat, searchQuery]);

  if (loading && books.length === 0) {
    return (
      <DashboardLayout>
        <DashboardLoader />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Modern Hero Section */}
        <Box sx={{ mb: 4, mx: { xs: -2, sm: -3, md: -4 }, mt: { xs: -2, sm: -3, md: -4 } }}>
         
        </Box>

        <Box sx={{ p: { xs: 0, md: 0 } }}>
          <Box sx={{ mb: 4, display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                My Books
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Explore your collection of knowledge and resources.
              </Typography>
            </Box>
          </Box>  <Button
            variant="contained"
            startIcon={<GraphIcon />}
            onClick={() => navigate('/all-books')}
            sx={{
              background:'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow:'0 4px 14px rgba(16, 185, 129, 0.35)',
'&:hover': { background:'linear-gradient(135deg, #059669 0%, #047857 100%)' },
            }}
          >
            Browse Books
          </Button>
        </Box>

        {stats && (
          <Grid container spacing={isMobile ? 1.5 : 3} sx={{ mb: 4 }}>
            {[
              { label:'Total Books', value: stats.totalBooks, icon: <BookIcon />, color:'#6366f1', gradient:'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(99,102,241,0.03) 100%)' },
              { label:'eBooks', value: stats.ebooks, icon: <DownloadIcon />, color:'#10b981', gradient:'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.03) 100%)' },
              { label:'Physical', value: stats.physicalBooks, icon: <ShippingIcon />, color:'#f59e0b', gradient:'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(245,158,11,0.03) 100%)' },
              { label:'Favorites', value: stats.favoriteBooks, icon: <FavoriteIcon />, color:'#ec4899', gradient:'linear-gradient(135deg, rgba(236,72,153,0.08) 0%, rgba(236,72,153,0.03) 100%)' },
            ].map((stat, i) => (
              <Grid item xs={6} md={3} key={i}>
                <Card
                  component={motion.div}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  sx={{
                    bgcolor: stat.gradient,
                    border:'1px solid',
                    borderColor: alpha(stat.color, 0.08),
                    cursor:'pointer',
'&:hover': { transform:'translateY(-4px)', boxShadow: `0 8px 24px ${alpha(stat.color, 0.15)}` },
                  }}
                >
                  <CardContent sx={{ display:'flex', alignItems:'center', gap: isMobile ? 1 : 2, p: isMobile ? 1.5 : 2.5 }}>
                    <Avatar sx={{ bgcolor: alpha(stat.color, 0.12), color: stat.color, width: isMobile ? 32 : 44, height: isMobile ? 32 : 44 }}>
                      {React.cloneElement(stat.icon as React.ReactElement, { sx: { fontSize: isMobile ? 18 : 24 } })}
                    </Avatar>
                    <Box>
                      <Typography variant={isMobile ?"subtitle1" :"h5"} sx={{ fontWeight: 800, lineHeight: 1 }}>{stat.value}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: isMobile ?'0.65rem' :'0.75rem' }}>{stat.label}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Filters */}
        <Box sx={{ mb: 4, display:'flex', flexWrap:'wrap', gap: 2, alignItems:'center' }}>
          <Box sx={{ flexGrow: 1, minWidth: 280 }}>
            <TextField
              fullWidth
              placeholder="Search by book title or author..."
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
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            size="small"
            sx={{ borderRadius: 2, bgcolor:'background.paper', minWidth: 160 }}
          >
            <MenuItem value="all">All Categories</MenuItem>
            {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
          <Select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            size="small"
            sx={{ borderRadius: 2, bgcolor:'background.paper', minWidth: 160 }}
          >
            <MenuItem value="all">All Formats</MenuItem>
            <MenuItem value="book">Physical Book</MenuItem>
            <MenuItem value="ebook">eBook (Digital)</MenuItem>
          </Select>
        </Box>

        {/* Books Grid */}
        <AnimatePresence mode="popLayout">
          <Grid container spacing={3}>
            {filteredBooks.length === 0 ? (
              <Grid item xs={12}>
                <EmptyState
                  type="no-books"
                  size="large"
                  actionLabel="Browse Books"
                  onAction={() => navigate('/all-books')}
                />
              </Grid>
            ) : (
              filteredBooks.map((item, idx) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={item.purchaseId}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    layout
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card
                      component={motion.div}
                      whileHover={{ y: -8, boxShadow:'0 16px 40px rgba(99, 102, 241, 0.12)' }}
                      sx={{
                        height:'100%',
                        display:'flex',
                        flexDirection:'column',
                        border:'1px solid',
                        borderColor: alpha('#6366f1', 0.06),
                        overflow:'hidden',
                        position:'relative',
                      }}
                    >
                      <Box sx={{ position:'relative' }}>
                        <CardMedia
                          component="img"
                          height="240"
                          image={item.book.coverImage ? `${uri}${item.book.coverImage}` :'/placeholder-book.jpg'}
                          alt={item.book.title}
                          sx={{ objectFit:'cover', transition:'transform 0.4s','&:hover': { transform:'scale(1.05)' } }}
                        />
                        {/* Gradient overlay */}
                        <Box sx={{
                          position:'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: 60,
                          background:'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)',
                        }} />

                        <Chip
                          label={item.purchaseType ==='ebook' ?'eBook' :'Physical'}
                          size="small"
                          color={item.purchaseType ==='ebook' ?'primary' :'success'}
                          sx={{
                            position:'absolute',
                            top: 10,
                            left: 10,
                            fontWeight: 800,
                            fontSize:'0.65rem',
                            backdropFilter:'blur(4px)',
                          }}
                        />
                        <IconButton
                          sx={{
                            position:'absolute',
                            top: 8,
                            right: 8,
                            bgcolor:'rgba(255,255,255,0.9)',
                            backdropFilter:'blur(4px)',
'&:hover': { bgcolor:'#fee2e2', color:'error.main' },
                            color: item.isFavorite ?'error.main' :'text.secondary',
                          }}
                          size="small"
                        >
                          {item.isFavorite ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
                        </IconButton>
                      </Box>

                      <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontWeight: 800, mb: 0.5, display:'block', textTransform:'uppercase', letterSpacing: 0.5 }}
                        >
                          {item.book.category ||'Educational'}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 800,
                            mb: 0.5,
                            minHeight: 44,
                            lineHeight: 1.3,
                            display:'-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient:'vertical',
                            overflow:'hidden',
                          }}
                        >
                          {item.book.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color:'text.secondary', fontWeight: 600, mb: 1.5, display:'block' }}>
                          By {item.book.author}
                        </Typography>

                        <Box sx={{ display:'flex', alignItems:'center', gap: 1, mb: 2 }}>
                          <Rating value={item.book.rating || 5} readOnly size="small" />
                          <Typography variant="caption" color="text.secondary">({item.book.reviews || 0})</Typography>
                        </Box>

                        {item.purchaseType ==='ebook' ? (
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display:'flex', justifyContent:'space-between', mb: 0.5 }}>
                              <Typography variant="caption" sx={{ fontWeight: 700 }}>Reading Progress</Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{item.readingProgress}%</Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={item.readingProgress}
                              sx={{
                                height: 5,
                                borderRadius: 3,
                                bgcolor: alpha('#10b981', 0.08),
'& .MuiLinearProgress-bar': { background:'linear-gradient(90deg, #10b981 0%, #6ee7b7 100%)' },
                              }}
                            />
                          </Box>
                        ) : (
                          <Box sx={{ mb: 2, p: 1.5, borderRadius: 2, bgcolor: alpha('#f59e0b', 0.05), border:'1px solid', borderColor: alpha('#f59e0b', 0.1) }}>
                            <Typography
                              variant="caption"
                              color="warning.main"
                              sx={{ fontWeight: 800, textTransform:'uppercase', display:'flex', alignItems:'center', gap: 0.5 }}
                            >
                              <ShippingIcon sx={{ fontSize: 14 }} /> {item.deliveryStatus ||'Processing'}
                            </Typography>
                          </Box>
                        )}

                        <Button
                          fullWidth
                          variant="contained"
                          size="small"
                          onClick={() => item.purchaseType ==='ebook' ? navigate(`/student/books/read/${item.bookId}`) : navigate(`/student/orders/${item.purchaseId}`)}
                          sx={{
                            py: 1,
                            fontWeight: 800,
                            background: item.purchaseType ==='ebook'
                              ?'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                              :'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            boxShadow: item.purchaseType ==='ebook'
                              ?'0 4px 12px rgba(16, 185, 129, 0.3)'
                              :'0 4px 12px rgba(245, 158, 11, 0.3)',
'&:hover': {
                              background: item.purchaseType ==='ebook'
                                ?'linear-gradient(135deg, #059669 0%, #047857 100%)'
                                :'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                            },
                          }}
                        >
                          {item.purchaseType ==='ebook' ?'READ NOW' :'TRACK ORDER'}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))
            )}
          </Grid>
        </AnimatePresence>
      </Box>
    </DashboardLayout>
  );
};

export default BooksList;