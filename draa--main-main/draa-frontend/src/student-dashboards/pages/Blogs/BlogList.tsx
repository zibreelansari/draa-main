import React, { useState, useMemo, useRef } from'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  Chip,
  LinearProgress,
  alpha,
  Paper,
  Avatar,
  IconButton,
  Tooltip,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel
} from'@mui/material';
import { LoadingButton } from'@mui/lab';
import {
  Article as BlogIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as WasteIcon,
  Visibility as ViewIcon,
  CloudUpload as UploadIcon,
  YouTube as YoutubeIcon,
  Instagram as InstagramIcon,
  CheckCircle as ApprovedIcon,
  Pending as PendingIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Language as SEOIcon,
  PhotoCamera as PhotoIcon,
  ArrowBack as BackIcon,
  AutoGraph as GraphIcon,
  AutoAwesome as SparkleIcon,
  Close as CloseIconBtn
} from'@mui/icons-material';
import { motion, AnimatePresence } from'framer-motion';
import { useBlogWriting, Blog } from'../../hooks/useBlogWriting';
import DashboardLayout from'../../layouts/DashboardLayout';
import CkEditor from'../../../components/DASHBOARD/CkEditor';
import BlogCopilotWidget from'../../../components/common/AgenticCopilotWidget';
import { useNavigate } from'react-router-dom';
import toast from'../../../utils/toast';
import url, { BACKEND_UPLOAD_URL } from'../../../url';
import axios from'axios';
import dayjs from'dayjs';
import EmptyState from'../../components/EmptyState';
import usePageTitle from '../../../hooks/usePageTitle';
import Swal from 'sweetalert2';

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const BlogWriting: React.FC = () => {
  const { blogs, loading, submitting, deleteBlog, submitBlog, refresh } = useBlogWriting();
  const navigate = useNavigate();
  usePageTitle('My Blogs | Draa');

  const [activeTab, setActiveTab] = useState<'list' |'create'>('list');
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [viewBlog, setViewBlog] = useState<Blog | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [blogTitle, setBlogTitle] = useState('');
  const [category, setCategory] = useState('Current Affairs');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [autoSEO, setAutoSEO] = useState(true);

  // New states for files
  const [schemaImage, setSchemaImage] = useState<File | null>(null);
  const [schemaPreview, setSchemaPreview] = useState('');
  const [featuredImages, setFeaturedImages] = useState<File[]>([]);
  const [featuredPreviews, setFeaturedPreviews] = useState<string[]>([]);
  const [importingWord, setImportingWord] = useState(false);

  // ─── Auto-write (✨ Copilot) flow state ────────────────────────────
  const [autowriteOpen, setAutowriteOpen] = useState(false);
  const [autowriteTopic, setAutowriteTopic] = useState('');
  const [autowriteTone, setAutowriteTone] = useState('friendly');
  const [autowriteLength, setAutowriteLength] = useState('medium');
  const [autowriteAudience, setAutowriteAudience] = useState('');
  const [autowriteAdvanced, setAutowriteAdvanced] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [autowriteLanguage, setAutowriteLanguage] = useState('english');

  // Confirmation card state (sidebar). When this is set, the user can
  // either post the AI-generated blog or go edit it.
  const [autowriteReady, setAutowriteReady] = useState<{
    title: string;
    snippet: string;
    isAiPowered: boolean;
  } | null>(null);

  const titleFieldRef = useRef<HTMLInputElement | null>(null);

  const handleAutowrite = async () => {
    const topic = autowriteTopic.trim();
    if (!topic) return;
    setGenerating(true);
    try {
      const token = (() => {
        try { return JSON.parse(localStorage.getItem('edudocs') || 'null')?.token; } catch { return null; }
      })();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await axios.post(
        `${url}/agent/blog-generate`,
        {
          topic,
          tone: autowriteTone,
          length: autowriteLength,
          audience: autowriteAudience.trim() || undefined,
          language: autowriteLanguage
        },
        { headers }
      );
      const data = res.data?.data;
      if (!data) throw new Error('No data returned from server');

      // Fill the form state. handleTitleChange also auto-fills SEO title + slug.
      handleTitleChange(data.title || topic);
      setContent(data.content || '');
      setMetaDescription(data.metaDescription || '');
      setTags(Array.isArray(data.tags) ? data.tags : []);
      if (data.imageUrl) {
        setSchemaPreview(data.imageUrl);
      }

      // Build a snippet preview for the confirmation card
      const textSnippet = (data.content || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120);
      setAutowriteReady({
        title: data.title || topic,
        snippet: textSnippet,
        isAiPowered: !!res.data?.isAiPowered
      });

      setAutowriteOpen(false);
      setAutowriteTopic('');
      setAutowriteLanguage('english');

      Swal.fire({
        title: 'Content Generated!',
        text: 'Would you like to post it immediately or you will want to review and post by yourself?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Post Immediately',
        cancelButtonText: 'Review First',
        confirmButtonColor: '#8b5cf6',
        cancelButtonColor: '#6b7280'
      }).then((result) => {
        if (result.isConfirmed) {
          setTimeout(() => {
            handleSubmit();
          }, 100);
        } else {
          // Let them edit - focusing title field
          setTimeout(() => titleFieldRef.current?.focus(), 50);
        }
      });

      // Scroll the editor into view so the user sees what was filled.
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
    } catch (err: any) {
      console.error('Autowrite failed:', err);
      toast.error(err.response?.data?.message || 'Failed to generate blog. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handlePostGenerated = () => {
    setAutowriteReady(null);
    handleSubmit();
  };

  const handleEditGenerated = () => {
    setAutowriteReady(null);
    setTimeout(() => titleFieldRef.current?.focus(), 50);
  };

  const schemaInputRef = useRef<HTMLInputElement>(null);
  const featuredInputRef = useRef<HTMLInputElement>(null);
  const wordInputRef = useRef<HTMLInputElement>(null);

  const filteredBlogs = useMemo(() => {
    return blogs.filter(b => b.content_subject.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [blogs, searchQuery]);

  const handleCreateNew = () => {
    setEditingBlog(null);
    setBlogTitle('');
    setCategory('Current Affairs');
    setContent('');
    setTags([]);
    setSeoTitle('');
    setSlug('');
    setMetaDescription('');
    setYoutubeUrl('');
    setInstagramUrl('');
    setAutoSEO(true);
    setSchemaImage(null);
    setSchemaPreview('');
    setFeaturedImages([]);
    setFeaturedPreviews([]);
    setActiveTab('create');
  };

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setBlogTitle(blog.content_subject);
    setCategory(blog.content_category);
    setContent(blog.content);
    
    let parsedTags: string[] = [];
    try {
      if (blog.tags) {
        if (typeof blog.tags === 'string') {
          if (blog.tags.trim().startsWith('[') && blog.tags.trim().endsWith(']')) {
            parsedTags = JSON.parse(blog.tags);
          } else {
            parsedTags = blog.tags.split(',').map(t => t.trim()).filter(Boolean);
          }
        } else if (Array.isArray(blog.tags)) {
          parsedTags = blog.tags;
        }
      }
    } catch (e) {
      console.error('Error parsing tags:', e);
      if (typeof blog.tags === 'string') {
        parsedTags = blog.tags.split(',').map(t => t.trim()).filter(Boolean);
      }
    }
    setTags(parsedTags);

    setSeoTitle(blog.seo_title ||'');
    setSlug(blog.slug ||'');
    setMetaDescription(blog.meta_description ||'');
    setYoutubeUrl(blog.youtube_url ||'');
    setInstagramUrl(blog.instagram_url ||'');
    setAutoSEO(false);
    
    // Set previews for existing images
    setSchemaPreview(blog.schema_image ? `${BACKEND_UPLOAD_URL}/${blog.schema_image}` :'');
    
    let parsedImages: string[] = [];
    try {
      if (blog.featured_images) {
        if (typeof blog.featured_images === 'string') {
          if (blog.featured_images.trim().startsWith('[') && blog.featured_images.trim().endsWith(']')) {
            parsedImages = JSON.parse(blog.featured_images);
          } else {
            parsedImages = blog.featured_images.split(',').map(t => t.trim()).filter(Boolean);
          }
        } else if (Array.isArray(blog.featured_images)) {
          parsedImages = blog.featured_images;
        }
      }
    } catch (e) {
      console.error('Error parsing featured_images:', e);
      if (typeof blog.featured_images === 'string') {
        parsedImages = blog.featured_images.split(',').map(t => t.trim()).filter(Boolean);
      }
    }
    setFeaturedPreviews(parsedImages.map((img: string) => `${BACKEND_UPLOAD_URL}/${img}`));
    
    setActiveTab('create');
  };

  const handleTitleChange = (val: string) => {
    setBlogTitle(val);
    if (autoSEO) {
      setSeoTitle(val.substring(0, 60));
      setSlug(val.toLowerCase().replace(/[^a-z0-9 ]/g,'').replace(/\s+/g,'-'));
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!blogTitle || !category || !content) {
      toast.error("Please fill in all required fields (Title, Category, Content)");
      return;
    }

    const formData = new FormData();
    formData.append('content_subject', blogTitle);
    formData.append('content_category', category);
    formData.append('content', content);
    formData.append('seo_title', seoTitle);
    formData.append('slug', slug);
    formData.append('meta_description', metaDescription);
    formData.append('youtube_url', youtubeUrl);
    formData.append('instagram_url', instagramUrl);
    formData.append('tags', JSON.stringify(tags));

    if (schemaImage) {
      formData.append('schema_image', schemaImage);
    } else if (schemaPreview) {
      const relativePath = schemaPreview.replace(`${BACKEND_UPLOAD_URL}/`, '').replace(`${url}/`, '');
      formData.append('schema_image', relativePath);
    }
    featuredImages.forEach(img => {
      formData.append('featured_images', img);
    });

    const res = await submitBlog(formData, editingBlog?._id || editingBlog?.id);
    if (res.success) setActiveTab('list');
  };

  const handleSchemaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSchemaImage(file);
      setSchemaPreview(URL.createObjectURL(file));
    }
  };

  const handleFeaturedSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = [...featuredImages, ...files].slice(0, 5);
    setFeaturedImages(newFiles);
    setFeaturedPreviews(newFiles.map(f => URL.createObjectURL(f)));
  };

  const handleWordImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportingWord(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${url}/editor/import-word`, formData, {
        headers: {'Content-Type':'multipart/form-data' }
      });
      if (res.data.html) {
        setContent(prev => prev + res.data.html);
        toast.success("Word document imported successfully!");
        if (res.data.firstImageUrl) {
          const fullUrl = res.data.firstImageUrl.startsWith('http') ? res.data.firstImageUrl : `${BACKEND_UPLOAD_URL || url}/${res.data.firstImageUrl}`;
          setSchemaPreview(fullUrl);
        }
      }
    } catch (err) {
      console.error("Word import failed", err);
      toast.error("Failed to import Word document");
    } finally {
      setImportingWord(false);
      if (wordInputRef.current) wordInputRef.current.value ='';
    }
  };

  if (loading && blogs.length === 0) {
    return (
      <DashboardLayout>
        <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}>
          <LinearProgress sx={{ width: 200, borderRadius: 2 }} />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap: 2 }}>
          <Box>
            <Box sx={{ display:'flex', alignItems:'center', gap: 2, mb: 1 }}>
              <Avatar sx={{ bgcolor: alpha('#f59e0b', 0.1), color:'#f59e0b', width: 40, height: 40 }}>
                <BlogIcon sx={{ fontSize: 22 }} />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {activeTab ==='list' ?'My Blogs' : (editingBlog ?'Edit Blog' :'Write New Blog')}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5, fontWeight: 500 }}>
              {activeTab ==='list'
                ?'Manage your published blogs and drafts.'
                :'Create high-quality content and share your knowledge.'}
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            {activeTab ==='list' ? (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateNew}
                sx={{
                  borderRadius: 2,
                  fontWeight: 800,
                  background:'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  boxShadow:'0 4px 14px rgba(245, 158, 11, 0.35)',
'&:hover': { background:'linear-gradient(135deg, #d97706 0%, #b45309 100%)' } }}
              >
                Write Blog
              </Button>
            ) : (
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<SparkleIcon />}
                  onClick={() => setAutowriteOpen(true)}
                  sx={{
                    borderRadius: 2,
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                    boxShadow: '0 4px 14px rgba(139, 92, 246, 0.35)',
                    '&:hover': { background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)' }
                  }}
                >
                  Auto-write with Copilot
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<BackIcon />}
                  onClick={() => setActiveTab('list')}
                  sx={{ borderRadius: 2, fontWeight: 800 }}
                >
                  Back to List
                </Button>
              </Stack>
            )}
          </Stack>
        </Box>

        {activeTab ==='list' ? (
          <>
            {/* Stats Summary */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {[
                { label:'Total Blogs', value: blogs.length, icon: <BlogIcon />, color:'#6366f1' },
                { label:'Approved', value: blogs.filter(b => b.approved).length, icon: <ApprovedIcon />, color:'#10b981' },
                { label:'Pending', value: blogs.filter(b => !b.approved).length, icon: <PendingIcon />, color:'#f59e0b' },
              ].map((s, i) => (
                <Grid item xs={12} md={4} key={i}>
                  <Card
                    component={motion.div}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    sx={{
                      border:'1px solid',
                      borderColor: alpha(s.color, 0.08),
                      cursor:'pointer',
'&:hover': { transform:'translateY(-4px)', boxShadow: `0 8px 24px ${alpha(s.color, 0.15)}` } }}
                  >
                    <CardContent sx={{ display:'flex', alignItems:'center', gap: 2, p: 2.5 }}>
                      <Avatar sx={{ bgcolor: alpha(s.color, 0.1), color: s.color, width: 56, height: 56 }}>
                        {s.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1 }}>{s.value}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{s.label}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Toolbar */}
            <Paper sx={{ p: 2, borderRadius: 2, mb: 3, display:'flex', alignItems:'center', gap: 2, border:'1px solid', borderColor:'divider' }}>
              <TextField
                placeholder="Search through your blogs..."
                size="small"
                fullWidth
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>,
                  sx: { borderRadius: 2 } }}
              />
              <Tooltip title="Refresh">
                <IconButton onClick={refresh}><HistoryIcon /></IconButton>
              </Tooltip>
            </Paper>

            {/* Blog Table */}
            {filteredBlogs.length === 0 ? (
              <EmptyState
                type="no-blogs"
                size="large"
                title="No Blogs Written Yet"
                description="Share your knowledge by writing your first blog post. Earn rewards for every approved blog!"
                actionLabel="Write Your First Blog"
                onAction={handleCreateNew}
              />
            ) : (
              <Card sx={{ overflow:'hidden' }}>
                <Box sx={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead style={{ background: alpha('#6366f1', 0.04) }}>
                      <tr>
                        <th style={{ padding:'16px', textAlign:'left', fontWeight: 800, opacity: 0.6, fontSize:'0.75rem', letterSpacing: 0.5 }}>BLOG TITLE</th>
                        {/* <th style={{ padding:'16px', textAlign:'left', fontWeight: 800, opacity: 0.6, fontSize:'0.75rem', letterSpacing: 0.5 }}>CATEGORY</th> */}
                        <th style={{ padding:'16px', textAlign:'center', fontWeight: 800, opacity: 0.6, fontSize:'0.75rem', letterSpacing: 0.5 }}>DATE</th>
                        <th style={{ padding:'16px', textAlign:'center', fontWeight: 800, opacity: 0.6, fontSize:'0.75rem', letterSpacing: 0.5 }}>STATUS</th>
                        <th style={{ padding:'16px', textAlign:'right', fontWeight: 800, opacity: 0.6, fontSize:'0.75rem', letterSpacing: 0.5 }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBlogs.map((blog, idx) => (
                        <tr
                          key={blog._id}
                          style={{ borderTop: `1px solid ${alpha('#000', 0.05)}` }}
                          component={motion.tr}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.03 }}
                        >
                          <td style={{ padding:'16px' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.3 }}>{blog.content_subject}</Typography>
                          </td>
                          {/*
                          <td style={{ padding:'16px' }}>
                            <Chip
                              label={blog.content_category}
                              size="small"
                              sx={{ fontWeight: 800, bgcolor: alpha('#6366f1', 0.08), color:'#6366f1' }}
                            />
                          </td>
                          */}
                          <td style={{ padding:'16px', textAlign:'center' }}>
                            <Typography variant="caption" sx={{ color:'text.secondary', fontWeight: 600 }}>
                              {dayjs(blog.createdAt).format('MMM DD, YYYY')}
                            </Typography>
                          </td>
                          <td style={{ padding:'16px', textAlign:'center' }}>
                            <Chip
                              label={blog.approved ?'APPROVED' :'PENDING'}
                              size="small"
                              sx={{
                                fontWeight: 800,
                                fontSize:'0.6rem',
                                bgcolor: alpha(blog.approved ?'#10b981' :'#f59e0b', 0.08),
                                color: blog.approved ?'#10b981' :'#f59e0b' }}
                            />
                          </td>
                          <td style={{ padding:'16px', textAlign:'right' }}>
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Tooltip title="View">
                                <IconButton size="small" onClick={() => setViewBlog(blog)}>
                                  <ViewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              {!blog.approved && (
                                <>
                                  <Tooltip title="Edit">
                                    <IconButton size="small" sx={{ color:'primary.main' }} onClick={() => handleEdit(blog)}>
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete">
                                    <IconButton size="small" sx={{ color:'error.main' }} onClick={() => deleteBlog(blog._id || blog.id ||'')}>
                                      <WasteIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                            </Stack>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              </Card>
            )}
          </>
        ) : (
          /* Editor Form */
          <Grid container spacing={4}>
            <Grid item xs={12} lg={8}>
              <Stack spacing={3}>
                <Card sx={{ border:'1px solid', borderColor: alpha('#6366f1', 0.06) }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, display:'flex', alignItems:'center', gap: 1 }}>
                      <EditIcon sx={{ color:'#6366f1' }} /> Step 1: Content Details
                    </Typography>
                    <Stack spacing={3}>
                      <TextField
                        fullWidth
                        label="Blog Title*"
                        placeholder="Enter a catchy title..."
                        value={blogTitle}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        variant="outlined"
                        inputRef={titleFieldRef}
                        sx={{'& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                      <FormControl fullWidth sx={{'& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                        <InputLabel>Category*</InputLabel>
                        <Select
                          value={category}
                          onChange={(e) => setCategory(e.target.value as string)}
                          label="Category*"
                        >
                          {[
                            'Current Affairs',
                            'Governance',
                            'Science & Technology',
                            'Art & Culture',
                            'Ethics',
                          ].map(cat => (
                            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <Box>
                        <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb: 1 }}>
                          <Typography variant="caption" sx={{ fontWeight: 800, color:'text.secondary' }}>MAIN CONTENT*</Typography>
                          <Button 
                            variant="soft" 
                            size="small" 
                            startIcon={importingWord ? <LinearProgress sx={{ width: 16 }} /> : <AddIcon />}
                            onClick={() => wordInputRef.current?.click()}
                            disabled={importingWord}
                          >
                            Import Word (.docx)
                          </Button>
                          <input 
                            type="file" 
                            ref={wordInputRef} 
                            hidden 
                            accept=".docx" 
                            onChange={handleWordImport} 
                          />
                        </Box>
                        <Box sx={{ border:'1px solid', borderColor:'divider', borderRadius: 2, p: 1 }}>
                          <CkEditor
                            value={content}
                            onChange={(val: string) => setContent(val)}
                          />
                        </Box>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                <Card sx={{ border:'1px solid', borderColor: alpha('#6366f1', 0.06) }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, display:'flex', alignItems:'center', gap: 1 }}>
                      <UploadIcon sx={{ color:'#6366f1' }} /> Step 2: Media & Extensions
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Typography variant="caption" sx={{ fontWeight: 800, mb: 1.5, display:'block', color:'text.secondary' }}>COVER IMAGE</Typography>
                        <Box 
                          onClick={() => schemaInputRef.current?.click()}
                          sx={{
                            p: 3,
                            height: 160,
                            border:'2px dashed',
                            borderColor: alpha('#6366f1', 0.15),
                            borderRadius: 2,
                            textAlign:'center',
                            display:'flex',
                            flexDirection:'column',
                            justifyContent:'center',
                            alignItems:'center',
                            bgcolor: alpha('#6366f1', 0.02),
                            cursor:'pointer',
                            transition:'all 0.2s',
                            backgroundImage: schemaPreview ? `url(${schemaPreview})` :'none',
                            backgroundSize:'cover',
                            backgroundPosition:'center',
                            position:'relative',
                            overflow:'hidden',
'&:hover': {
                              bgcolor: alpha('#6366f1', 0.05),
                              borderColor:'#6366f1' } }}
                        >
                          {!schemaPreview && (
                            <>
                              <PhotoIcon sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
                              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                                Select a catchy cover image
                              </Typography>
                              <Typography variant="caption" color="text.disabled">Supports JPG, PNG (Max 5MB)</Typography>
                            </>
                          )}
                          {schemaPreview && (
                            <Box sx={{ 
                              position:'absolute', inset: 0, bgcolor:'rgba(0,0,0,0.3)', 
                              display:'flex', alignItems:'center', justifyContent:'center',
                              opacity: 0,'&:hover': { opacity: 1 }, transition:'opacity 0.2s'
                            }}>
                              <Typography sx={{ color:'white', fontWeight: 800 }}>Change Image</Typography>
                            </Box>
                          )}
                        </Box>
                        <input type="file" ref={schemaInputRef} hidden accept="image/*" onChange={handleSchemaSelect} />
                      </Grid>

                      <Grid item xs={12}>
                        <Typography variant="caption" sx={{ fontWeight: 800, mb: 1.5, display:'block', color:'text.secondary' }}>GALLERY (UP TO 5 IMAGES)</Typography>
                        <Stack direction="row" spacing={2} sx={{ flexWrap:'wrap', gap: 2 }}>
                          {featuredPreviews.map((prev, i) => (
                            <Box key={i} sx={{ width: 80, height: 80, borderRadius: 2, overflow:'hidden', position:'relative' }}>
                              <img src={prev} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt="gallery" />
                              <IconButton 
                                size="small" 
                                onClick={() => {
                                  const nf = featuredImages.filter((_, idx) => idx !== i);
                                  setFeaturedImages(nf);
                                  setFeaturedPreviews(nf.map(f => URL.createObjectURL(f)));
                                }}
                                sx={{ position:'absolute', top: 2, right: 2, bgcolor:'rgba(255,255,255,0.8)' }}
                              >
                                <WasteIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Box>
                          ))}
                          {featuredImages.length < 5 && (
                            <Box 
                              onClick={() => featuredInputRef.current?.click()}
                              sx={{ 
                                width: 80, height: 80, border:'1px dashed', borderColor:'divider', 
                                borderRadius: 2, display:'flex', alignItems:'center', justifyContent:'center',
                                cursor:'pointer','&:hover': { bgcolor:'action.hover' }
                              }}
                            >
                              <AddIcon sx={{ opacity: 0.5 }} />
                            </Box>
                          )}
                        </Stack>
                        <input type="file" ref={featuredInputRef} hidden multiple accept="image/*" onChange={handleFeaturedSelect} />
                      </Grid>

                      <Grid item xs={12}>
                        <Typography variant="caption" sx={{ fontWeight: 800, mb: 1, display:'block', color:'text.secondary' }}>TAGS</Typography>
                        <Stack direction="row" spacing={1} sx={{ flexWrap:'wrap', gap: 1, mb: 1 }}>
                          {tags.map((tag) => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              onDelete={() => setTags(tags.filter(t => t !== tag))}
                              sx={{ fontWeight: 700 }}
                            />
                          ))}
                        </Stack>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Add tag and press enter"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key ==='Enter' && tagInput) {
                              e.preventDefault();
                              setTags([...tags, tagInput]);
                              setTagInput('');
                            }
                          }}
                          sx={{'& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>

            {/* Sidebar */}
            <Grid item xs={12} lg={4}>
              <Stack spacing={3}>
                {/* SEO Settings card hidden as per request */}
                {/*
                <Card sx={{ border:'1px solid', borderColor: alpha('#6366f1', 0.08), bgcolor: alpha('#6366f1', 0.02) }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, display:'flex', alignItems:'center', gap: 1 }}>
                        <SEOIcon sx={{ color:'primary.main' }} /> SEO Settings
                      </Typography>
                      <FormControlLabel
                        control={<Switch size="small" checked={autoSEO} onChange={(e) => setAutoSEO(e.target.checked)} />}
                        label={<Typography variant="caption" sx={{ fontWeight: 800 }}>Auto</Typography>}
                      />
                    </Box>
                    <Stack spacing={2}>
                      <TextField
                        fullWidth
                        label="SEO Title"
                        value={seoTitle}
                        size="small"
                        onChange={(e) => setSeoTitle(e.target.value)}
                        disabled={autoSEO}
                        sx={{'& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                      <TextField
                        fullWidth
                        label="Slug (URL Path)"
                        value={slug}
                        size="small"
                        onChange={(e) => setSlug(e.target.value)}
                        disabled={autoSEO}
                        helperText="Visible in browser address bar"
                        sx={{'& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Meta Description"
                        value={metaDescription}
                        size="small"
                        onChange={(e) => setMetaDescription(e.target.value)}
                        sx={{'& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 800, mb: 1, display:'block', color:'text.secondary' }}>TAGS</Typography>
                        <Stack direction="row" spacing={1} sx={{ flexWrap:'wrap', gap: 1, mb: 1 }}>
                          {tags.map((tag) => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              onDelete={() => setTags(tags.filter(t => t !== tag))}
                              sx={{ fontWeight: 700 }}
                            />
                          ))}
                        </Stack>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Add tag and press enter"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key ==='Enter' && tagInput) {
                              setTags([...tags, tagInput]);
                              setTagInput('');
                            }
                          }}
                          sx={{'& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
                */}

                {autowriteReady && (
                  <Card
                    component={motion.div}
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    sx={{
                      border: '1px solid',
                      borderColor: alpha('#8b5cf6', 0.25),
                      background: `linear-gradient(135deg, ${alpha('#8b5cf6', 0.04)} 0%, ${alpha('#ec4899', 0.04)} 100%)`,
                      boxShadow: '0 8px 24px rgba(139, 92, 246, 0.18)'
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ bgcolor: alpha('#8b5cf6', 0.15), color: '#8b5cf6', width: 36, height: 36 }}>
                            <SparkleIcon fontSize="small" />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                              {autowriteReady.isAiPowered ? '✨ Blog ready!' : 'Blog draft ready'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              {autowriteReady.isAiPowered ? 'Generated by Copilot' : 'Local template (no API key)'}
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton size="small" onClick={() => setAutowriteReady(null)} title="Dismiss">
                          <CloseIconBtn fontSize="small" />
                        </IconButton>
                      </Box>

                      <Typography variant="body2" sx={{ fontWeight: 800, mb: 0.5 }}>
                        {autowriteReady.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2.5, lineHeight: 1.5 }}>
                        {autowriteReady.snippet}{autowriteReady.snippet.length >= 120 ? '…' : ''}
                      </Typography>

                      <Stack spacing={1.5}>
                        <LoadingButton
                          variant="contained"
                          fullWidth
                          size="large"
                          onClick={handlePostGenerated}
                          loading={submitting}
                          startIcon={<SparkleIcon />}
                          sx={{
                            borderRadius: 2,
                            fontWeight: 800,
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                            boxShadow: '0 4px 14px rgba(139, 92, 246, 0.35)',
                            '&:hover': { background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)' }
                          }}
                        >
                          Post this blog
                        </LoadingButton>
                        <Button
                          variant="outlined"
                          fullWidth
                          onClick={handleEditGenerated}
                          sx={{ borderRadius: 2, fontWeight: 700 }}
                        >
                          Let me edit first
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                )}

                <Card sx={{ border:'1px solid', borderColor: alpha('#6366f1', 0.06) }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 3 }}>Publication</Typography>
                    <Stack spacing={2}>
                      <LoadingButton
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={handleSubmit}
                        loading={submitting}
                        sx={{
                          borderRadius: 2,
                          fontWeight: 800,
                          background:'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                          boxShadow:'0 4px 14px rgba(99, 102, 241, 0.35)' }}
                      >
                        {editingBlog ?'Update Changes' :'Submit for Approval'}
                      </LoadingButton>
                      <Typography variant="caption" color="text.secondary" sx={{ textAlign:'center', fontWeight: 500 }}>
                        Blogs are typically reviewed and approved within 24-48 hours.
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>
          </Grid>
        )}

        {/* Auto-write with Copilot Dialog */}
        <Dialog
          open={autowriteOpen}
          onClose={() => !generating && setAutowriteOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: alpha('#8b5cf6', 0.04), borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: alpha('#8b5cf6', 0.15), color: '#8b5cf6', width: 40, height: 40 }}>
                <SparkleIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Auto-write with Copilot</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Tell me a topic — I'll write the whole blog for you
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setAutowriteOpen(false)} disabled={generating} size="small">
              <CloseIconBtn />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ p: 3 }}>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                autoFocus
                label="What should the blog be about?"
                placeholder="e.g. How to study for UPSC without coaching"
                value={autowriteTopic}
                onChange={(e) => setAutowriteTopic(e.target.value)}
                disabled={generating}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              <FormControl fullWidth size="small" disabled={generating}>
                <InputLabel>Language</InputLabel>
                <Select
                  value={autowriteLanguage}
                  label="Language"
                  onChange={(e) => setAutowriteLanguage(e.target.value as string)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="english">English</MenuItem>
                  <MenuItem value="hindi">Hindi (हिंदी)</MenuItem>
                </Select>
              </FormControl>

              <Box>
                <Button
                  size="small"
                  onClick={() => setAutowriteAdvanced(v => !v)}
                  sx={{ fontWeight: 700, textTransform: 'none' }}
                  disabled={generating}
                >
                  {autowriteAdvanced ? '▾ Hide advanced options' : '▸ Show advanced options'}
                </Button>
              </Box>

              {autowriteAdvanced && (
                <Stack spacing={2} sx={{ pt: 1 }}>
                  <FormControl fullWidth size="small" disabled={generating}>
                    <InputLabel>Tone</InputLabel>
                    <Select value={autowriteTone} label="Tone" onChange={(e) => setAutowriteTone(e.target.value as string)} sx={{ borderRadius: 2 }}>
                      <MenuItem value="friendly">Friendly & conversational</MenuItem>
                      <MenuItem value="professional">Professional & authoritative</MenuItem>
                      <MenuItem value="casual">Casual & fun</MenuItem>
                      <MenuItem value="academic">Academic & research-based</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth size="small" disabled={generating}>
                    <InputLabel>Length</InputLabel>
                    <Select value={autowriteLength} label="Length" onChange={(e) => setAutowriteLength(e.target.value as string)} sx={{ borderRadius: 2 }}>
                      <MenuItem value="short">Short (~400 words)</MenuItem>
                      <MenuItem value="medium">Medium (~800 words)</MenuItem>
                      <MenuItem value="long">Long (~1200 words)</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    size="small"
                    label="Target audience (optional)"
                    placeholder="e.g. Class 10 students, UPSC aspirants"
                    value={autowriteAudience}
                    onChange={(e) => setAutowriteAudience(e.target.value)}
                    disabled={generating}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Stack>
              )}

              <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha('#8b5cf6', 0.04), border: '1px dashed', borderColor: alpha('#8b5cf6', 0.2) }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#8b5cf6', display: 'block', mb: 0.5 }}>
                  What I'll do
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  I'll generate a title, full content (with sections), meta description, and tags — all editable. After generation you can review, edit, and post with one click.
                </Typography>
              </Box>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={() => setAutowriteOpen(false)} disabled={generating} sx={{ fontWeight: 700 }}>
              Cancel
            </Button>
            <LoadingButton
              variant="contained"
              onClick={handleAutowrite}
              loading={generating}
              loadingText="Generating..."
              disabled={!autowriteTopic.trim()}
              startIcon={<SparkleIcon />}
              sx={{
                borderRadius: 2,
                fontWeight: 800,
                background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                boxShadow: '0 4px 14px rgba(139, 92, 246, 0.35)',
                '&:hover': { background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)' }
              }}
            >
              Generate Blog
            </LoadingButton>
          </DialogActions>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={!!viewBlog} onClose={() => setViewBlog(null)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle sx={{ p: 3, display:'flex', justifyContent:'space-between', alignItems:'center', bgcolor: alpha('#6366f1', 0.03), borderBottom:'1px solid', borderColor:'divider' }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Preview Blog</Typography>
            <IconButton onClick={() => setViewBlog(null)} size="small"><CloseIcon /></IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 4 }}>
            {viewBlog && (
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>{viewBlog.content_subject}</Typography>
                <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                  <Typography variant="caption" sx={{ pt: 1, fontWeight: 600 }}>Authored by {viewBlog.author}</Typography>
                </Stack>
                <Divider sx={{ mb: 3 }} />
                <Box className="blog-content-preview" dangerouslySetInnerHTML={{ __html: viewBlog.content }} />
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setViewBlog(null)} sx={{ fontWeight: 700 }}>Close Preview</Button>
            {viewBlog && !viewBlog.approved && (
              <Button
                variant="contained"
                onClick={() => { setViewBlog(null); handleEdit(viewBlog); }}
                sx={{ fontWeight: 800 }}
              >
                Edit Content
              </Button>
            )}
          </DialogActions>
        </Dialog>
        <BlogCopilotWidget
          blogTitle={activeTab === 'create' ? blogTitle : undefined}
          blogContent={activeTab === 'create' ? content : undefined}
          mode="blog"
          onApply={activeTab === 'create' ? (text) => setContent(text) : undefined}
        />
      </Box>
    </DashboardLayout>
  );
};

export default BlogWriting;