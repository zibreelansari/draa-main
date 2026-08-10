import React, { useState } from'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  alpha,
  Avatar,
  TextField,
  MenuItem,
  Select,
  useMediaQuery,
  useTheme,
  FormControl,
  InputLabel,
  Stack,
  IconButton,
  Paper,
  Divider,
  Chip
} from'@mui/material';
import {
  ArrowBack as BackIcon,
  Send as SendIcon,
  CloudUpload as UploadIcon,
  Close as CloseIcon,
  HeadsetMic as SupportIcon
} from'@mui/icons-material';
import { motion } from'framer-motion';
import axios from'axios';
import { useNavigate } from'react-router-dom';
import url from'../../../url';
import { getAuthHeaders } from'../../../utils/global_auth';
import { useStudentProfile } from'../../hooks/useStudentProfile';
import DashboardLayout from'../../layouts/DashboardLayout';
import toast from'../../../utils/toast';
import usePageTitle from '../../../hooks/usePageTitle';

const SupportCreateV2: React.FC = () => {
  usePageTitle('Create Support Ticket | Draa');
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { profile: user, loading: profileLoading } = useStudentProfile();
  
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    subject:'',
    category:'Technical',
    priority:'Medium'
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles].slice(0, 5));
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (!user?.token) return;
      setLoading(true);
      const data = new FormData();
      data.append('subject', formData.subject);
      data.append('category', formData.category);
      data.append('priority', formData.priority);
      data.append('message', formData.message);
      
      files.forEach(file => {
        data.append('attachments', file);
      });

      const res = await axios.post(`${url}/support/create`, data, {
        headers: {
'Content-Type':'multipart/form-data',
          Authorization: `Bearer ${user.token}`
        }
      });

      if (res.data.success) {
        toast.success('Ticket raised successfully');
        navigate('/v2/student/support');
      }
    } catch (error) {
      toast.error('Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/v2/student/support')}
          sx={{ mb: 3, fontWeight: 700, color:'text.secondary' }}
        >
          Back to Tickets
        </Button>

        <Box sx={{ maxWidth: 800, mx:'auto' }}>
          <Card sx={{ borderRadius: 4, border:'1px solid', borderColor: alpha('#6366f1', 0.08) }}>
            <CardContent sx={{ p: isMobile ? 3 : 5 }}>
              <Box sx={{ mb: 4, display:'flex', alignItems:'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: alpha('#6366f1', 0.1), color:'#6366f1' }}>
                  <SupportIcon />
                </Avatar>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>Raise a New Ticket</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Tell us what's wrong and we'll get back to you soon.
                    </Typography>
                </Box>
              </Box>

              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Subject"
                    placeholder="e.g., Unable to access course materials"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    InputProps={{ sx: { borderRadius: 2.5 } }}
                  />

                  <Box sx={{ display:'flex', gap: 2, flexWrap: isMobile ?'wrap' :'nowrap' }}>
                    <FormControl fullWidth>
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={formData.category}
                        label="Category"
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        sx={{ borderRadius: 2.5 }}
                      >
                        <MenuItem value="Technical">Technical Issue</MenuItem>
                        <MenuItem value="Billing">Billing & Payments</MenuItem>
                        <MenuItem value="Course Content">Course Content</MenuItem>
                        <MenuItem value="Exam Issue">Exam/Test Issue</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl fullWidth>
                      <InputLabel>Priority</InputLabel>
                      <Select
                        value={formData.priority}
                        label="Priority"
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        sx={{ borderRadius: 2.5 }}
                      >
                        <MenuItem value="Low">Low</MenuItem>
                        <MenuItem value="Medium">Medium</MenuItem>
                        <MenuItem value="High">High</MenuItem>
                        <MenuItem value="Urgent">Urgent</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <TextField
                    fullWidth
                    label="Detailed Description"
                    multiline
                    rows={6}
                    placeholder="Please describe the issue in detail..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    InputProps={{ sx: { borderRadius: 2.5 } }}
                  />

                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, display:'block' }}>
                        Attachments (Optional)
                    </Typography>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 3,
                        textAlign:'center',
                        borderRadius: 3,
                        border:'2px dashed',
                        borderColor: alpha('#6366f1', 0.2),
                        bgcolor: alpha('#6366f1', 0.02),
                        cursor:'pointer',
'&:hover': { borderColor:'#6366f1', bgcolor: alpha('#6366f1', 0.04) }
                      }}
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      <input
                        type="file"
                        id="file-upload"
                        hidden
                        multiple
                        onChange={handleFileChange}
                        accept="image/*,application/pdf"
                      />
                      <UploadIcon sx={{ fontSize: 40, color:'#6366f1', mb: 1, opacity: 0.8 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Click to upload files
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Max 5 files (Images/PDFs, max 10MB each)
                      </Typography>
                    </Paper>

                    {files.length > 0 && (
                      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2, gap: 1 }}>
                        {files.map((file, i) => (
                          <Chip
                            key={i}
                            label={file.name}
                            onDelete={() => removeFile(i)}
                            deleteIcon={<CloseIcon sx={{ fontSize:'14px !important' }} />}
                            sx={{ borderRadius: 1.5, fontWeight: 600, bgcolor: alpha('#6366f1', 0.08) }}
                          />
                        ))}
                      </Stack>
                    )}
                  </Box>

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    loading={loading}
                    startIcon={<SendIcon />}
                    sx={{
                      py: 1.5,
                      borderRadius: 3,
                      background:'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      boxShadow:'0 4px 14px rgba(99, 102, 241, 0.3)',
                      fontWeight: 800,
'&:hover': { background:'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }
                    }}
                  >
                    Submit Ticket
                  </Button>
                </Stack>
              </form>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default SupportCreateV2;
