import { useEffect, useState, useCallback } from'react';
import {
  Form, Input, Button, Upload, Table, Select, Switch, message, Row, Col, Modal,
  Card, Space, Typography, Divider, Layout, Tag, Tabs, Badge, Alert,
  InputNumber, Tooltip, Popconfirm, Progress, Image, Collapse,
} from'antd';
import {
  UploadOutlined, ExclamationCircleOutlined, CheckCircleOutlined,
  ClockCircleOutlined, EyeOutlined, DownloadOutlined, FilePdfOutlined,
  VideoCameraOutlined, EditOutlined, DeleteOutlined, PlusOutlined,
  ReloadOutlined, SearchOutlined, FilterOutlined, LockOutlined,
  UnlockOutlined, BarChartOutlined, GlobalOutlined, StarOutlined,
  FireOutlined, TrophyOutlined, SettingOutlined, CopyOutlined,
  PictureOutlined,
  FileTextOutlined,
} from'@ant-design/icons';
import axios from'axios';
import { useNavigate } from'react-router-dom';
import Sidebar from'./Sidebar';
import Topbar from'./Topbar';
import Sidebar2 from'./Sidebar2';
import url from'../../url';
import { getUserRole, getAuthHeaders } from'../../utils/global_auth';
import usePageTitle from '../../hooks/usePageTitle';

const { TextArea } = Input;
const { Text, Title } = Typography;
const { Content, Footer } = Layout;
const { TabPane } = Tabs;
const { Option } = Select;

//  Types 

interface PYQType {
  _id: string;
  examName: string;
  examCategory: string;
  year: number;
  shift: string;
  title: string;
  description?: string;
  subjects: string[];
  totalQuestions: number;
  totalMarks: number;
  duration: number;
  questionPaperPDF: string;
  solutionPDF?: string;
  coverImage?: string;
  memoryBasedPaper: boolean;
  videoSolutionUrl?: string;
  uploadedBy: any;
  uploadedByName: string;
  isApproved: boolean;
  approvedAt?: string;
  rejectionReason?: string;
  isFeatured: boolean;
  isPopular: boolean;
  isPremium: boolean;
  views: number;
  downloads: number;
  tags: string[];
  paper?: string;
  seo?: any;
  createdAt: string;
}

interface Stats {
  total: number;
  approved: number;
  pending: number;
  featured: number;
  popular: number;
  byCategory?: any[];
  byYear?: any[];
}

//  StatCard (matching admin dashboard pattern) 

const StatCard = ({
  title, value, icon, color, sub1, sub2,
}: {
  title: string; value: number; icon: React.ReactNode; color: string;
  sub1?: { label: string; value: number | string; color?: string };
  sub2?: { label: string; value: number | string; color?: string };
}) => (
  <Card
    style={{ borderRadius: 12, border: `1px solid ${color}22`, height:'100%' }}
    bodyStyle={{ padding:'20px 24px' }}
  >
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
      <div style={{ flex: 1 }}>
        <Text type="secondary" style={{ fontSize: 12, fontWeight: 500, textTransform:'uppercase', letterSpacing: 0.5 }}>
          {title}
        </Text>
        <Title level={3} style={{ margin:'4px 0 0', color:'#1a1a1a', lineHeight: 1.2 }}>
          {typeof value ==='number' ? value.toLocaleString() : value}
        </Title>
        {(sub1 || sub2) && (
          <div style={{ marginTop: 8, display:'flex', gap: 12, flexWrap:'wrap' }}>
            {sub1 && (
              <Text style={{ fontSize: 11, color: sub1.color ??'#52c41a' }}>
                <CheckCircleOutlined style={{ marginRight: 3 }} />{sub1.value} {sub1.label}
              </Text>
            )}
            {sub2 && (
              <Text style={{ fontSize: 11, color: sub2.color ??'#faad14' }}>
                <ClockCircleOutlined style={{ marginRight: 3 }} />{sub2.value} {sub2.label}
              </Text>
            )}
          </div>
        )}
      </div>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: `${color}18`, display:'flex',
        alignItems:'center', justifyContent:'center',
        fontSize: 22, color, flexShrink: 0,
      }}>
        {icon}
      </div>
    </div>
  </Card>
);

//  Constants 

const EXAM_CATEGORIES = ['SSC','UPSC','Banking','Railway','State PSC','Teaching','Defense','Police','Insurance','Other'];
const SUBJECTS = ['Reasoning','Quantitative Aptitude','English','General Awareness','Computer Knowledge','Professional Knowledge','Other'];
const SHIFTS = ['Morning','Afternoon','Evening','Single','Not Applicable'];

//  Main Component 

const PYQManagement = () => {
  const navigate = useNavigate();

  // Auth
  const [loginUser, setLoginUser] = useState<any>({});
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  // Forms
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [autoGenerateSEO, setAutoGenerateSEO] = useState(true);
  const [editAutoGenerateSEO, setEditAutoGenerateSEO] = useState(true);

  // Data
  const [pyqs, setPyqs] = useState<PYQType[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, approved: 0, pending: 0, featured: 0, popular: 0 });

  // UI state
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedPYQ, setSelectedPYQ] = useState<PYQType | null>(null);
  const [bulkSelected, setBulkSelected] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | undefined>();
  const [filterYear, setFilterYear] = useState<number | undefined>();

  // Custom Paper Options
  const [paperOptions, setPaperOptions] = useState([
'Paper-I','Paper-II','Paper-III','Paper-IV',
'GS Paper-I','GS Paper-II','CSAT',
'Optional Paper-I','Optional Paper-II','General Paper'
  ]);
  const [newPaperName, setNewPaperName] = useState('');

  // Multi-paper builder state (for batch upload or single record edit)
  const [multiPapers, setMultiPapers] = useState<Array<{ paper: string; file: File | null; serverFile?: string }>>(
    [{ paper:'Paper-I', file: null }]
  );

  //  Server-side Pagination 
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const isAdmin = !!loginUser?.aname;
  const isTeacher = !!loginUser?.tname;

  //  Auth 
  useEffect(() => {
    const role = getUserRole();

    if (role ==='GUEST') {
      message.warning('Please login to continue', 6);
      navigate('/admin-login');
      return;
    }
    if (role ==='STUDENT') {
      message.error('Students are not allowed to manage PYQs.', 6);
      navigate('/student-dashboard');
      return;
    }

    const raw = localStorage.getItem('edudocs');
    if (!raw) {
      message.error('Session expired. Please login again.');
      navigate('/admin-login');
      return;
    }

    try {
      const user = JSON.parse(raw);
      if (role ==='TEACHER') {
        if (user.isVerified !== true) {
          message.error('Your account is not verified yet.', 7);
          navigate('/teacher-dashboard');
          return;
        }
        if (user.Status !=='approved') {
          message.error('Your account is not approved yet.', 7);
          navigate('/teacher-dashboard');
          return;
        }
      }
      setLoginUser(user);
      setIsAuthChecked(true);
    } catch {
      message.error('Invalid session. Please login again.');
      navigate('/admin-login');
    }
  }, [navigate]);

  //  Fetch PYQs (server-side pagination) 
  const fetchPYQs = useCallback(async (
    tab = activeTab,
    page = currentPage,
    limit = pageSize,
    search = searchTerm,
    category = filterCategory,
    year = filterYear,
  ) => {
    setLoading(true);
    try {
      let endpoint = `${url}/pyq/all`;
      const params: Record<string, any> = { page, limit };

      switch (tab) {
        case'approved': endpoint = `${url}/pyq/approved`; break;
        case'pending': endpoint = `${url}/pyq/pending`; break;
        case'featured': params.isFeatured = true; break;
        case'popular': params.isPopular = true; break;
        default: break;
      }

      if (search) params.search = search;
      if (category) params.examCategory = category;
      if (year) params.year = year;

      const res = await axios.get(endpoint, {
        params,
        headers: getAuthHeaders()
      });
      const data = res.data;

      const list: PYQType[] =
        data.pyqs ?? data.data?.pyqs ?? (Array.isArray(data) ? data : []);
      const total: number =
        data.total ?? data.totalPYQs ?? data.data?.total ?? list.length;

      setPyqs(list);
      setTotalCount(total);
    } catch {
      message.error('Failed to fetch PYQs');
      setPyqs([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPage, pageSize, searchTerm, filterCategory, filterYear]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get(`${url}/pyq/stats/overview`, {
        headers: getAuthHeaders()
      });
      if (res.data.stats) setStats(res.data.stats);
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    if (isAuthChecked) {
      fetchPYQs();
      fetchStats();
    }
  }, [isAuthChecked]);

  useEffect(() => {
    if (isAuthChecked) fetchPYQs(activeTab, currentPage, pageSize, searchTerm, filterCategory, filterYear);
  }, [currentPage, pageSize, isAuthChecked]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setBulkSelected([]);
    fetchPYQs(tab, 1, pageSize, searchTerm, filterCategory, filterYear);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchPYQs(activeTab, 1, pageSize, searchTerm, filterCategory, filterYear);
  };

  const handleRefresh = async () => {
    await Promise.all([fetchPYQs(), fetchStats()]);
    message.success('Refreshed');
  };

  //  SEO helpers 
  const makeSlug = (title: string) =>
    title.toLowerCase().trim()
      .replace(/[^\w\s-]/g,'')
      .replace(/[\s_-]+/g,'-')
      .replace(/^-+|-+$/g,'');

  const applyAutoSEO = (formInst: any, title: string, desc?: string) => {
    const slug = makeSlug(title);
    const seoTitle = title.length > 60 ? title.substring(0, 57) +'...' : title;
    formInst.setFieldsValue({ seo_title: seoTitle, slug, og_title: seoTitle });
    if (desc) {
      const metaDesc = desc.length > 160 ? desc.substring(0, 157) +'...' : desc;
      formInst.setFieldsValue({ meta_description: metaDesc, og_description: metaDesc });
    }
  };

  //  normFile 
  const normFile = (e: any) => {
    if (Array.isArray(e)) return e;
    return e?.fileList ?? [];
  };

  //  Build FormData 
  const buildFormData = (values: any, includeUploadedBy = false): FormData => {
    const fd = new FormData();

    const skip = ['questionPaperPDF','solutionPDF','coverImage','subjects','tags'];

    Object.keys(values).forEach(key => {
      if (skip.includes(key) || key ==='paper') return;
      const val = values[key];
      if (val !== undefined && val !== null) fd.append(key, String(val));
    });

    if (values.paper) fd.append('paper', values.paper);
    if (Array.isArray(values.subjects)) fd.append('subjects', JSON.stringify(values.subjects));
    fd.append('tags', JSON.stringify(Array.isArray(values.tags) ? values.tags : []));

    if (includeUploadedBy) {
      const userId = loginUser?.id || loginUser?._id;
      const userName = loginUser?.aname || loginUser?.A_name || loginUser?.tname || loginUser?.T_name || loginUser?.name ||"User";
      if (userId) fd.append('uploadedBy', String(userId));
      fd.append('uploadedByName', userName);
    }

    // Files
    const appendFile = (fieldName: string, fileList: any[]) => {
      if (Array.isArray(fileList) && fileList.length > 0 && fileList[0]?.originFileObj) {
        fd.append(fieldName, fileList[0].originFileObj);
      }
    };
    appendFile('questionPaperPDF', values.questionPaperPDF);
    appendFile('solutionPDF', values.solutionPDF);
    appendFile('coverImage', values.coverImage);

    return fd;
  };

  //  CRUD 
  const onFinish = async (values: any) => {
    if (isTeacher) {
      if (!loginUser.isVerified || loginUser.Status !=='approved') {
        message.error('Your account must be verified and approved');
        return;
      }
    }

    // Validate at least one paper has a file
    const validPapers = multiPapers.filter(p => p.paper && p.file);
    if (validPapers.length === 0) {
      message.error('Please add at least one paper with a PDF file.');
      return;
    }

    setSubmitLoading(true);
    let successCount = 0;
    let failCount = 0;

    try {
      const raw = localStorage.getItem('edudocs');
      // Submit one API request per paper
      for (const paperRow of validPapers) {
        try {
          const fd = new FormData();

          // Core Info (Shared across papers in batch)
          fd.append('examName', values.examName);
          fd.append('year', String(values.year));
          fd.append('examStage', values.examStage ||'Prelims');
          fd.append('examCategory', values.examCategory ||'');
          fd.append('shift', values.shift ||'Single');
          fd.append('title', values.title || `${values.examName} ${values.examStage ||'Prelims'} ${paperRow.paper} ${values.year}`);
          fd.append('description', values.description ||'');
          fd.append('memoryBasedPaper', String(values.memoryBasedPaper || false));
          fd.append('videoSolutionUrl', values.videoSolutionUrl ||'');
          fd.append('subjects', JSON.stringify(values.subjects || []));
          fd.append('tags', JSON.stringify(values.tags || []));
          fd.append('isFeatured', String(values.isFeatured || false));
          fd.append('isPopular', String(values.isPopular || false));
          fd.append('isPremium', String(values.isPremium || false));
          fd.append('paper', paperRow.paper);

          const userId = loginUser?.id || loginUser?._id;
          const userName = loginUser?.aname || loginUser?.A_name || loginUser?.tname || loginUser?.T_name || loginUser?.name ||"User";
          if (userId) fd.append('uploadedBy', String(userId));
          fd.append('uploadedByName', userName);

          // Attach Question Paper (unique per paper in batch)
          fd.append('questionPaperPDF', paperRow.file as File);

          // Shared Files  Attach if they exist
          if (values.coverImage?.[0]?.originFileObj) {
            fd.append('coverImage', values.coverImage[0].originFileObj);
          }
          if (values.solutionPDF?.[0]?.originFileObj) {
            fd.append('solutionPDF', values.solutionPDF[0].originFileObj);
          }

          // SEO Fields  Ensure they are sent
          fd.append('seo_title', values.seo_title || values.title || values.examName);
          fd.append('meta_keywords', values.meta_keywords ||'');
          fd.append('meta_description', values.meta_description || values.description ||'');

          // Generate a safe slug for each paper
          const baseSlug = values.slug || values.examName;
          const paperSuffix = paperRow.paper.toLowerCase().replace(/\s+/g,'-');
          fd.append('slug', `${baseSlug}-${paperSuffix}-${Date.now()}`);

          fd.append('og_title', values.og_title || values.seo_title || values.examName);
          fd.append('og_description', values.og_description || values.meta_description || values.description ||'');
          fd.append('robots', values.robots ||'index, follow');

          await axios.post(`${url}/pyq/create`, fd, {
            headers: {
              ...getAuthHeaders(),
'Content-Type':'multipart/form-data'
            }
          });
          successCount++;
        } catch (err: any) {
          failCount++;
          const errMsg = err.response?.data?.error || `Failed to upload ${paperRow.paper}`;
          message.error(errMsg);
        }
      }

      if (successCount > 0) {
        message.success(`${successCount} paper(s) uploaded successfully and pending approval!`, 5);
      }
      if (failCount > 0) {
        message.warning(`${failCount} paper(s) failed to upload.`, 5);
      }

      // Reset form and multi-paper list
      form.resetFields();
      setMultiPapers([{ paper:'Paper-I', file: null }]);
      setCurrentPage(1);
      await Promise.all([fetchPYQs(activeTab, 1), fetchStats()]);
    } catch (err: any) {
      message.error('Unexpected error during upload.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = async (values: any) => {
    if (!selectedPYQ) return;
    setSubmitLoading(true);

    let successCount = 0;
    let failCount = 0;

    try {
      // 1. Update the PRIMARY record (the one being edited)
      const primaryPaper = multiPapers[0];
      const fd = buildFormData(values, false);

      // Override paper and file from the first row of builder
      fd.set('paper', primaryPaper.paper);
      if (primaryPaper.file) {
        fd.set('questionPaperPDF', primaryPaper.file);
      }

      await axios.put(`${url}/pyq/${selectedPYQ._id}`, fd, {
        headers: {
          ...getAuthHeaders(),
'Content-Type':'multipart/form-data'
        }
      });
      successCount++;

      // 2. Create EXTRA records if added during edit
      const extraPapers = multiPapers.slice(1).filter(p => p.paper && p.file);
      if (extraPapers.length > 0) {
        const raw = localStorage.getItem('edudocs');

        for (const row of extraPapers) {
          try {
            const eFd = new FormData();

            // Core Info (Shared from form values)
            eFd.append('examName', values.examName);
            eFd.append('year', String(values.year));
            eFd.append('examStage', values.examStage ||'Prelims');
            eFd.append('examCategory', values.examCategory ||'');
            eFd.append('shift', values.shift ||'Single');
            eFd.append('title', values.title || `${values.examName} ${values.examStage ||'Prelims'} ${row.paper} ${values.year}`);
            eFd.append('description', values.description ||'');
            eFd.append('memoryBasedPaper', String(values.memoryBasedPaper || false));
            eFd.append('videoSolutionUrl', values.videoSolutionUrl ||'');
            eFd.append('subjects', JSON.stringify(values.subjects || []));
            eFd.append('tags', JSON.stringify(values.tags || []));
            eFd.append('isFeatured', String(values.isFeatured || false));
            eFd.append('isPopular', String(values.isPopular || false));
            eFd.append('isPremium', String(values.isPremium || false));
            eFd.append('paper', row.paper);

            const userId = loginUser?.id || loginUser?._id;
            const userName = loginUser?.aname || loginUser?.A_name || loginUser?.tname || loginUser?.T_name || loginUser?.name ||"User";
            if (userId) eFd.append('uploadedBy', String(userId));
            eFd.append('uploadedByName', userName);

            // New PDF for this extra entry
            eFd.append('questionPaperPDF', row.file as File);

            // Shared Files (Cover/Solution)
            if (values.coverImage?.[0]?.originFileObj) {
              eFd.append('coverImage', values.coverImage[0].originFileObj);
            }
            if (values.solutionPDF?.[0]?.originFileObj) {
              eFd.append('solutionPDF', values.solutionPDF[0].originFileObj);
            }

            // SEO
            eFd.append('seo_title', values.seo_title || values.title || values.examName);
            eFd.append('meta_keywords', values.meta_keywords ||'');
            eFd.append('meta_description', values.meta_description || values.description ||'');
            const baseSlug = values.slug || values.examName;
            const paperSuffix = row.paper.toLowerCase().replace(/\s+/g,'-');
            eFd.append('slug', `${baseSlug}-${paperSuffix}-${Date.now()}`);
            eFd.append('og_title', values.og_title || values.seo_title || values.examName);
            eFd.append('robots', values.robots ||'index, follow');

            await axios.post(`${url}/pyq/create`, eFd, {
              headers: {
                ...getAuthHeaders(),
'Content-Type':'multipart/form-data'
              }
            });
            successCount++;
          } catch (err: any) {
            console.error('Failed to add extra paper:', err);
            failCount++;
            const errMsg = err.response?.data?.error || `Failed to add extra paper: ${row.paper}`;
            message.error(errMsg);
          }
        }
      }

      if (failCount === 0) {
        message.success(extraPapers.length > 0 ? `Updated and ${extraPapers.length} extra paper(s) added!` :'PYQ updated successfully');
      } else {
        message.warning(`Updated original, but ${failCount} extra paper(s) failed.`);
      }

      setEditModalVisible(false);
      setSelectedPYQ(null);
      editForm.resetFields();
      await Promise.all([fetchPYQs(), fetchStats()]);
    } catch (err: any) {
      message.error(err.response?.data?.error ??'Failed to update PYQ');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${url}/pyq/${id}`, {
        headers: getAuthHeaders()
      });
      message.success('PYQ deleted successfully');
      if (pyqs.length === 1 && currentPage > 1) setCurrentPage(p => p - 1);
      await Promise.all([fetchPYQs(), fetchStats()]);
    } catch {
      message.error('Failed to delete PYQ');
    }
  };

  const handleApproval = async (pyqId: string, approved: boolean) => {
    try {
      await axios.put(`${url}/pyq/${pyqId}/approve`,
        { isApproved: approved, adminId: loginUser._id },
        { headers: getAuthHeaders() }
      );
      message.success(`PYQ ${approved ?'approved' :'unapproved'} successfully`);
      await Promise.all([fetchPYQs(), fetchStats()]);
    } catch {
      message.error('Failed to update approval status');
    }
  };

  // Admin: toggle featured/popular inline
  const handleToggleFlag = async (pyqId: string, field:'isFeatured' |'isPopular' |'isPremium', val: boolean) => {
    try {
      await axios.put(`${url}/pyq/${pyqId}`,
        { [field]: val },
        { headers: getAuthHeaders() }
      );
      message.success(`Updated`);
      fetchPYQs();
    } catch {
      message.error('Failed to update');
    }
  };

  const handleBulkApproval = async (approved: boolean) => {
    if (!bulkSelected.length) { message.warning('No PYQs selected'); return; }
    try {
      await axios.post(`${url}/pyq/bulk-approve`,
        { pyqIds: bulkSelected, isApproved: approved, adminId: loginUser._id },
        { headers: getAuthHeaders() }
      );
      message.success(`${bulkSelected.length} PYQs ${approved ?'approved' :'unapproved'}`);
      setBulkSelected([]);
      await Promise.all([fetchPYQs(), fetchStats()]);
    } catch {
      message.error('Bulk action failed');
    }
  };

  const showEditModal = (pyq: PYQType) => {
    setSelectedPYQ(pyq);

    // Ensure file lists are always arrays for Ant Design Upload
    const formatFileList = (path?: string, name: string ='file', uid: string ='-1') => {
      if (!path) return [];
      if (Array.isArray(path)) return path;

      // Ensure we don't double-prefix URLs
      const fileUrl = path.startsWith('http') ? path : `${url}/${path.replace(/\\/g,'/')}`;

      return [{
        uid,
        name: path.split(/[\\/]/).pop() || name,
        status:'done' as const,
        url: fileUrl,
        thumbUrl: fileUrl, // Necessary for'picture' listType preview
      }];
    };

    editForm.setFieldsValue({
      ...pyq,
      subjects: Array.isArray(pyq.subjects) ? pyq.subjects : [],
      tags: Array.isArray(pyq.tags) ? pyq.tags : [],
      questionPaperPDF: formatFileList(pyq.questionPaperPDF,'question-paper.pdf','-2'),
      solutionPDF: formatFileList(pyq.solutionPDF,'solution.pdf','-3'),
      coverImage: formatFileList(pyq.coverImage,'cover.jpg','-1'),
      seo_title: pyq.seo?.seo_title ?? pyq.title,
      meta_keywords: pyq.seo?.meta_keywords ??'',
      meta_description: pyq.seo?.meta_description ?? pyq.description,
      slug: pyq.seo?.slug ??'',
      og_title: pyq.seo?.og_title ?? pyq.title,
      og_description: pyq.seo?.og_description ??'',
    });

    // Prefill the multi-paper state for editing (single record)
    setMultiPapers([{
      paper: pyq.paper ||'Paper-I',
      file: null,
      serverFile: pyq.questionPaperPDF
    }]);

    setEditModalVisible(true);
  };

  //  Table Columns 
  const columns = [
    {
      title:'Cover',
      dataIndex:'coverImage',
      width: 70,
      render: (img: string) => img ? (
        <Image
          src={`${url}/${img}`}
          alt="cover"
          width={48} height={48}
          style={{ objectFit:'cover', borderRadius: 6 }}
          preview={{ mask: <EyeOutlined /> }}
        />
      ) : (
        <div style={{
          width: 48, height: 48, background:'#f5f5f5',
          display:'flex', alignItems:'center', justifyContent:'center', borderRadius: 6,
        }}>
          <PictureOutlined style={{ color:'#bfbfbf' }} />
        </div>
      ),
    },
    {
      title:'Exam',
      dataIndex:'examName',
      width: 180,
      render: (name: string, r: PYQType) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>{name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>{r.title}</Text>
        </div>
      ),
    },
    {
      title:'Category',
      dataIndex:'examCategory',
      width: 110,
      render: (c: string) => <Tag color="blue">{c}</Tag>,
    },
    {
      title:'Year / Shift',
      width: 110,
      render: (_: any, r: PYQType) => (
        <div>
          <Text strong>{r.year}</Text>
          <br />
          <div style={{ display:'flex', gap: 4, flexWrap:'wrap', marginTop: 4 }}>
            <Tag color="cyan" style={{ fontSize: 10, margin: 0 }}>{r.paper ||'Paper 1'}</Tag>
            <Text type="secondary" style={{ fontSize: 11 }}>{r.shift}</Text>
          </div>
        </div>
      ),
    },
    {
      title:'Q / Marks / Dur',
      width: 130,
      render: (_: any, r: PYQType) => (
        <Space size={4} direction="vertical">
          <Text style={{ fontSize: 11 }}>{r.totalQuestions}Q · {r.totalMarks}M</Text>
          <Text style={{ fontSize: 11 }} type="secondary">{r.duration} min</Text>
        </Space>
      ),
    },
    {
      title:'Type',
      width: 110,
      render: (_: any, r: PYQType) => (
        <Space direction="vertical" size={2}>
          {r.memoryBasedPaper && <Tag color="orange" style={{ fontSize: 10 }}>Memory</Tag>}
          {r.videoSolutionUrl && <Tag color="red" icon={<VideoCameraOutlined />} style={{ fontSize: 10 }}>Video</Tag>}
          {r.isPremium && <Tag color="gold" style={{ fontSize: 10 }}>Premium</Tag>}
        </Space>
      ),
    },
    {
      title:'Featured',
      dataIndex:'isFeatured',
      width: 90,
      render: (val: boolean, r: PYQType) => isAdmin ? (
        <Tooltip title="Toggle Featured">
          <Switch size="small" checked={val} onChange={v => handleToggleFlag(r._id,'isFeatured', v)} />
        </Tooltip>
      ) : (
        <Tag color={val ?'purple' :'default'}>{val ?' Yes' :'No'}</Tag>
      ),
    },
    {
      title:'Popular',
      dataIndex:'isPopular',
      width: 90,
      render: (val: boolean, r: PYQType) => isAdmin ? (
        <Tooltip title="Toggle Popular">
          <Switch size="small" checked={val} onChange={v => handleToggleFlag(r._id,'isPopular', v)} />
        </Tooltip>
      ) : (
        <Tag color={val ?'gold' :'default'}>{val ?' Yes' :'No'}</Tag>
      ),
    },
    {
      title:'Status',
      dataIndex:'isApproved',
      width: 110,
      render: (approved: boolean, r: PYQType) => isAdmin ? (
        <Tooltip title={`Click to ${approved ?'unapprove' :'approve'}`}>
          <Switch
            checked={approved}
            onChange={() => handleApproval(r._id, !approved)}
            checkedChildren={<CheckCircleOutlined />}
            unCheckedChildren={<ClockCircleOutlined />}
            size="small"
          />
        </Tooltip>
      ) : (
        <Tag color={approved ?'success' :'warning'}
          icon={approved ? <CheckCircleOutlined /> : <ClockCircleOutlined />}>
          {approved ?'Approved' :'Pending'}
        </Tag>
      ),
    },
    {
      title:'Stats',
      width: 100,
      render: (_: any, r: PYQType) => (
        <Space direction="vertical" size={2}>
          <Text type="secondary" style={{ fontSize: 11 }}><EyeOutlined /> {r.views ?? 0}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}><DownloadOutlined /> {r.downloads ?? 0}</Text>
        </Space>
      ),
    },
    {
      title:'Actions',
      width: 200,
      fixed:'right' as const,
      render: (_: any, r: PYQType) => (
        <Space size={4} wrap>
          {/* Teachers & Admins can both edit */}
          <Tooltip title="Edit">
            <Button size="small" type="primary" icon={<EditOutlined />} onClick={() => showEditModal(r)}>
              Edit
            </Button>
          </Tooltip>

          {/* Admin: duplicate */}
          {isAdmin && (
            <Tooltip title="Duplicate">
              <Button
                size="small"
                icon={<CopyOutlined />}
                onClick={() => {
                  const dup = { ...r, _id: undefined, title: r.title +' (Copy)' };
                  form.setFieldsValue({
                    ...dup,
                    coverImage: [],
                    questionPaperPDF: [],
                    solutionPDF: [],
                  });
                  message.info('Duplicated to create form  update files & submit');
                }}
              />
            </Tooltip>
          )}

          <Popconfirm
            title="Delete this PYQ?"
            icon={<ExclamationCircleOutlined style={{ color:'#ff4d4f' }} />}
            onConfirm={() => handleDelete(r._id)}
            okText="Delete" okType="danger"
          >
            <Button size="small" danger icon={<DeleteOutlined />}>Delete</Button>
          </Popconfirm>

          {/* Admin approval quick button */}
          {isAdmin && (
            <Popconfirm
              title={`${r.isApproved ?'Unapprove' :'Approve'} this PYQ?`}
              onConfirm={() => handleApproval(r._id, !r.isApproved)}
              okType={r.isApproved ?'danger' :'primary'}
            >
              <Button
                size="small"
                icon={r.isApproved ? <LockOutlined /> : <UnlockOutlined />}
                type={r.isApproved ?'default' :'primary'}
              >
                {r.isApproved ?'Unapprove' :'Approve'}
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  //  Reusable PYQ Form 
  const PYQForm = ({
    formInstance, onFinishFn, isEdit = false, autoSEO, setAutoSEO,
  }: {
    formInstance: any; onFinishFn: (v: any) => void; isEdit?: boolean;
    autoSEO: boolean; setAutoSEO: (v: boolean) => void;
  }) => (
    <Form
      form={formInstance}
      layout="vertical"
      onFinish={onFinishFn}
      initialValues={{
        totalQuestions: 0, totalMarks: 0, duration: 60,
        shift:'Single', memoryBasedPaper: false,
        isFeatured: false, isPopular: false, isPremium: false,
        robots:'index, follow',
        questionPaperPDF: [],
        solutionPDF: [],
        coverImage: [],
        subjects: [],
        tags: [],
      }}
      scrollToFirstError
    >

      {/*  Core PYQ Information (Visible)  */}
      <Card title={<Space><TrophyOutlined style={{ color:'#1890ff' }} /><span>Quick Upload - Core Details</span></Space>}
        style={{ marginBottom: 16, borderRadius: 10 }}>

        <Row gutter={16}>
          <Col span={16}>
            <Form.Item name="examName" label="Exam Name" rules={[{ required: true }]}>
              <Input placeholder="e.g. OPSC OAS"
                onChange={e => { if (autoSEO) applyAutoSEO(formInstance, e.target.value); }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="year" label="Year" rules={[{ required: true }]}>
              <InputNumber style={{ width:'100%' }} min={2000} max={new Date().getFullYear()} placeholder="2024" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="examStage" label="Exam Stage" rules={[{ required: true }]} initialValue="Prelims">
              <Select placeholder="Select stage">
                {['Prelims','Mains','Interview','Final','General'].map(s => (
                  <Option key={s} value={s}>{s}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="paper" label="Paper" rules={[{ required: true }]} initialValue="Paper-I">
              <Select
                showSearch
                placeholder="Select paper (e.g. Paper-I)"
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <Divider style={{ margin:'8px 0' }} />
                    <Space style={{ padding:'0 8px 4px' }}>
                      <Input
                        placeholder="Add custom paper"
                        value={newPaperName}
                        onChange={(e) => setNewPaperName(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                      <Button
                        type="text"
                        icon={<PlusOutlined />}
                        onClick={() => {
                          if (newPaperName && !paperOptions.includes(newPaperName)) {
                            setPaperOptions([...paperOptions, newPaperName]);
                            formInstance.setFieldsValue({ paper: newPaperName });
                            setNewPaperName('');
                          }
                        }}
                      >
                        Add
                      </Button>
                    </Space>
                  </>
                )}
              >
                {paperOptions.map(opt => <Option key={opt} value={opt}>{opt}</Option>)}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/*  Multi-Paper Builder (replaces old single paper+PDF)  */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 10 }}>
            <Text strong style={{ fontSize: 14 }}> {isEdit ?'Current & Additional Papers' :'Papers & PDFs'}</Text>
            <Button
              type="dashed"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => setMultiPapers(prev => [...prev, { paper: `Paper-${String.fromCharCode(73 + prev.length)}`, file: null }])}
            >
              Add Extra Paper
            </Button>
          </div>

          {multiPapers.map((row, idx) => (
            <div key={idx} style={{
              background: idx === 0 && isEdit ?'#fffbeb' :'#f8fafc',
              borderRadius: 12, padding:'20px',
              marginBottom: 16, border:'1px solid',
              borderColor: idx === 0 && isEdit ?'#fde68a' :'#e2e8f0',
              position:'relative'
            }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 12 }}>
                <Text strong>Paper #{idx + 1}</Text>
                {((isEdit && idx > 0) || (!isEdit && multiPapers.length > 1)) && (
                  <Button
                    danger size="small" type="link"
                    icon={<DeleteOutlined />}
                    onClick={() => setMultiPapers(prev => prev.filter((_, i) => i !== idx))}
                  >
                    Remove
                  </Button>
                )}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap: 12 }}>
                {/* Status Badge */}
                {isEdit && (
                  <div style={{ position:'absolute', top: -10, left: 10 }}>
                    <Tag color={idx === 0 ?'orange' :'success'} style={{ borderRadius: 4, fontWeight: 700, fontSize: 10 }}>
                      {idx === 0 ?'EDITING ORIGINAL' :'NEW ENTRY'}
                    </Tag>
                  </div>
                )}

                {/* Paper name selector */}
                <div style={{ flex:'0 0 200px' }}>
                  <Text type="secondary" style={{ fontSize: 12, display:'block', marginBottom: 4 }}>Paper Name</Text>
                  <Select
                    value={row.paper}
                    style={{ width:'100%' }}
                    onChange={(val) => {
                      setMultiPapers(prev => prev.map((r, i) => i === idx ? { ...r, paper: val } : r));
                      if (isEdit) formInstance.setFieldsValue({ paper: val });
                    }}
                    showSearch
                    dropdownRender={(menu) => (
                      <>
                        {menu}
                        <Divider style={{ margin:'8px 0' }} />
                        <Space style={{ padding:'0 8px 4px' }}>
                          <Input
                            placeholder="Custom"
                            value={newPaperName}
                            onChange={(e) => setNewPaperName(e.target.value)}
                            onKeyDown={(e) => e.stopPropagation()}
                            size="small"
                          />
                          <Button size="small" type="text" icon={<PlusOutlined />}
                            onClick={() => {
                              if (newPaperName && !paperOptions.includes(newPaperName)) {
                                setPaperOptions(prev => [...prev, newPaperName]);
                                setMultiPapers(prev => prev.map((r, i) => i === idx ? { ...r, paper: newPaperName } : r));
                                if (isEdit) formInstance.setFieldsValue({ paper: newPaperName });
                                setNewPaperName('');
                              }
                            }}
                          >Add</Button>
                        </Space>
                      </>
                    )}
                  >
                    {paperOptions.map(opt => <Option key={opt} value={opt}>{opt}</Option>)}
                  </Select>
                </div>

                {/* PDF Upload */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text type="secondary" style={{ fontSize: 12, display:'block', marginBottom: 4 }}>PDF File</Text>
                  <Upload
                    beforeUpload={(file) => {
                      const isTooLarge = file.size > 100 * 1024 * 1024;
                      if (isTooLarge) {
                        message.error(`${file.name} is larger than 100MB. Please upload a smaller file.`);
                        return Upload.LIST_IGNORE;
                      }
                      setMultiPapers(prev => prev.map((r, i) => i === idx ? { ...r, file } : r));
                      // If editing, also sync the form field so buildFormData picks it up
                      if (isEdit) formInstance.setFieldsValue({ questionPaperPDF: [{ originFileObj: file, name: file.name }] });
                      return false;
                    }}
                    maxCount={1}
                    accept=".pdf"
                    showUploadList={false}
                    onRemove={() => {
                      setMultiPapers(prev => prev.map((r, i) => i === idx ? { ...r, file: null, serverFile: undefined } : r));
                      if (isEdit) formInstance.setFieldsValue({ questionPaperPDF: [] });
                    }}
                    fileList={row.file ? [{ uid: `${idx}`, name: row.file.name, status:'done' as const }] : []}
                  >
                    <Button
                      icon={<FilePdfOutlined />}
                      block
                      style={{
                        background:'white',
                        textAlign:'left',
                        display:'flex',
                        alignItems:'center',
                        overflow:'hidden',
                        borderColor: (row.file || row.serverFile) ?'#5b6cff' :'#d9d9d9',
                        borderWidth: (row.file || row.serverFile) ?'1.5px' :'1px'
                      }}
                    >
                      <span style={{
                        flex: 1,
                        overflow:'hidden',
                        textOverflow:'ellipsis',
                        whiteSpace:'nowrap'
                      }}>
                        {row.file
                          ? row.file.name
                          : (row.serverFile ? row.serverFile.split(/[\\/]/).pop() :'Upload PDF')}
                      </span>
                      {(row.file || row.serverFile) && <CheckCircleOutlined style={{ color:'#5b6cff', marginLeft: 8 }} />}
                    </Button>
                  </Upload>
                </div>

              </div>
            </div>
          ))}
        </div>
      </Card>

      <Collapse ghost accordion expandIconPosition="right" style={{ marginBottom: 16 }}>
        {/*  Section 1: Advanced Exam Details  */}
        <Collapse.Panel header={<Space><SettingOutlined style={{ color:'#722ed1' }} /><strong>Technical Exam Details</strong></Space>} key="details">
          <Card size="small" style={{ borderRadius: 8, background:'#fafafa' }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="examCategory" label="Exam Category">
                  <Select placeholder="Select category">
                    {['SSC','UPSC','Banking','Railway','State PSC','Teaching','Defense','Police','Insurance','Other'].map(cat => (
                      <Option key={cat} value={cat}>{cat}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="shift" label="Shift">
                  <Select placeholder="Select shift">
                    {['Morning','Afternoon','Evening','Single','Not Applicable'].map(s => (
                      <Option key={s} value={s}>{s}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="subjects" label="Subjects Covered">
              <Select mode="multiple" placeholder="Select subjects">
                {SUBJECTS.map(s => <Option key={s} value={s}>{s}</Option>)}
              </Select>
            </Form.Item>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="totalQuestions" label="Total Questions">
                  <InputNumber style={{ width:'100%' }} min={1} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="totalMarks" label="Total Marks">
                  <InputNumber style={{ width:'100%' }} min={1} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="duration" label="Duration (mins)">
                  <InputNumber style={{ width:'100%' }} min={1} />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Collapse.Panel>

        {/*  Section 2: Description & Media  */}
        <Collapse.Panel header={<Space><FileTextOutlined style={{ color:'#52c41a' }} /><strong>Description & Video Help</strong></Space>} key="media">
          <Card size="small" style={{ borderRadius: 8, background:'#fafafa' }}>
            <Form.Item name="description" label="Brief Description">
              <TextArea rows={3} placeholder="Brief description of the paper content" />
            </Form.Item>
            <Form.Item name="videoSolutionUrl" label="Video Solution URL">
              <Input placeholder="https://youtube.com/..." prefix={<VideoCameraOutlined />} />
            </Form.Item>
            <Form.Item name="tags" label="Search Tags">
              <Select mode="tags" placeholder="Add keywords for searchability" />
            </Form.Item>
          </Card>
        </Collapse.Panel>

        {/*  Section 3: Additional Files & Cover  */}
        <Collapse.Panel header={<Space><PictureOutlined style={{ color:'#eb2f96' }} /><strong>Additional Files & Media</strong></Space>} key="files">
          <Card size="small" style={{ borderRadius: 8, background:'#fafafa' }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="solutionPDF" label="Solution (PDF / PPT / Optional)" valuePropName="fileList" getValueFromEvent={normFile}>
                  <Upload
                    beforeUpload={(file) => {
                      const isTooLarge = file.size > 100 * 1024 * 1024;
                      if (isTooLarge) {
                        message.error(`${file.name} is larger than 100MB. Please upload a smaller file.`);
                        return Upload.LIST_IGNORE;
                      }
                      return false;
                    }}
                    maxCount={1}
                    accept=".pdf,.ppt,.pptx"
                  >
                    <Button icon={<FileTextOutlined />} block>Upload Solution / PPT</Button>
                  </Upload>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="coverImage" label="Cover Image" valuePropName="fileList" getValueFromEvent={normFile}>
                  <Upload
                    beforeUpload={(file) => {
                      const isTooLarge = file.size > 100 * 1024 * 1024;
                      if (isTooLarge) {
                        message.error(`${file.name} is larger than 100MB. Please upload a smaller file.`);
                        return Upload.LIST_IGNORE;
                      }
                      return false;
                    }}
                    maxCount={1}
                    accept="image/*"
                    listType="picture-card"
                    className="pyq-cover-uploader"
                  >
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload Cover</div>
                    </div>
                  </Upload>
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Collapse.Panel>

        {/*  Section 4: Admin Controls  */}
        <Collapse.Panel header={<Space><SettingOutlined style={{ color:'#faad14' }} /><strong>Visibility & Promotion</strong></Space>} key="admin">
          <Card size="small" style={{ borderRadius: 8, background:'#fafafa' }}>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={8}>
                <Form.Item name="isFeatured" label="Featured" valuePropName="checked">
                  <Switch checkedChildren=" Yes" unCheckedChildren="No" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="isPopular" label="Popular" valuePropName="checked">
                  <Switch checkedChildren=" Yes" unCheckedChildren="No" />
                </Form.Item>
              </Col>
              {isAdmin && (
                <Col span={8}>
                  <Form.Item name="isPremium" label="Premium" valuePropName="checked">
                    <Switch checkedChildren=" Premium" unCheckedChildren="Free" />
                  </Form.Item>
                </Col>
              )}
            </Row>
            {isAdmin && (
              <>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="priority" label="Display Priority">
                      <InputNumber style={{ width:'100%' }} min={0} placeholder="Lower = higher" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="isApproved" label="Approval Status" valuePropName="checked">
                      <Switch checkedChildren="Approved" unCheckedChildren="Pending" />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item name="adminNotes" label="Admin Notes (Internal only)">
                  <TextArea rows={2} placeholder="Internal notes for admin team..." />
                </Form.Item>
              </>
            )}
          </Card>
        </Collapse.Panel>
      </Collapse>

      {/*  SEO  */}
      <Collapse ghost>
        <Collapse.Panel
          key="seo"
          header={
            <Space>
              <GlobalOutlined style={{ color:'#13c2c2' }} />
              <Text strong>SEO & Social Settings (Auto-generated)</Text>
              <Switch checked={autoSEO} onChange={setAutoSEO} checkedChildren="Auto" unCheckedChildren="Manual" size="small" />
            </Space>
          }
        >
          <Card
            style={{ borderRadius: 10, background:'#fafafa' }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="seo_title" label="SEO Title (max 60)" rules={[{ max: 60 }]}>
                  <Input showCount maxLength={60} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="slug" label="URL Slug">
                  <Input placeholder="ssc-cgl-2024-tier-1" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="meta_keywords" label="Meta Keywords" tooltip="Separate with commas">
              <Input placeholder="pyq, ssc, previous year, 2024" />
            </Form.Item>
            <Form.Item name="meta_description" label="Meta Description (max 160)" rules={[{ max: 160 }]}>
              <TextArea rows={2} showCount maxLength={160} />
            </Form.Item>
            <Divider orientation="left" plain>Open Graph & Advanced</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="og_title" label="OG Title"><Input maxLength={60} /></Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="robots" label="Robots">
                  <Select>
                    <Option value="index, follow">Index, Follow</Option>
                    <Option value="noindex, nofollow">No Index, No Follow</Option>
                    <Option value="index, nofollow">Index, No Follow</Option>
                    <Option value="noindex, follow">No Index, Follow</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="og_description" label="OG Description">
              <TextArea rows={2} maxLength={160} />
            </Form.Item>
            <Form.Item name="canonical_url" label="Canonical URL">
              <Input placeholder="https://yourdomain.com/pyq/ssc-cgl-2024" />
            </Form.Item>
            <Form.Item name="schema_markup" label="Schema Markup (JSON-LD)">
              <TextArea rows={3} placeholder='{"@context":"https://schema.org", ...}' />
            </Form.Item>
          </Card>
        </Collapse.Panel>
      </Collapse>

      <Form.Item>
        <Button type="primary" htmlType="submit" block size="large"
          loading={submitLoading}
          icon={isEdit ? <EditOutlined /> : <PlusOutlined />}>
          {isEdit ?'Update PYQ' :'Upload PYQ'}
        </Button>
      </Form.Item>
    </Form>
  );

  //  Auth gate 
  if (!isAuthChecked) {
    return (
      <Layout style={{ minHeight:'100vh' }}>
        <Content style={{ display:'flex', justifyContent:'center', alignItems:'center' }}>
          <Alert message="Checking authentication" description="Please wait while we verify your permissions" type="info" showIcon />
        </Content>
      </Layout>
    );
  }

  const approvalRate = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;

  //  Render 
  return (
    <Layout style={{ minHeight:'100vh' }}>
      {getUserRole() ==='ADMIN' ? <Sidebar /> : <Sidebar2 />}
      <Layout>
        <Topbar />
        <Content style={{ margin:'16px', padding:'0 8px' }}>

          {/*  Header Banner  */}
          <div style={{
            background:'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            borderRadius: 16, padding:'28px 32px', marginBottom: 24,
            display:'flex', justifyContent:'space-between', alignItems:'center',
            flexWrap:'wrap', gap: 16,
          }}>
            <div>
              <Title level={2} style={{ color:'#fff', margin: 0 }}>
                <FilePdfOutlined style={{ marginRight: 10, color:'#faad14' }} />
                PYQ Management
              </Title>
              <Text style={{ color:'rgba(255,255,255,0.6)', fontSize: 14 }}>
                {isAdmin
                  ?'Admin Panel  Full control: upload, edit, delete, approve & flag PYQs'
                  :'Teacher Panel  Upload & manage your Previous Year Question papers'}
              </Text>
            </div>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading}
              style={{
                background:'rgba(255,255,255,0.12)', color:'#fff',
                border:'1px solid rgba(255,255,255,0.25)', borderRadius: 8,
              }}
            >
              Refresh
            </Button>
          </div>

          {/*  Teacher status alert  */}
          {isTeacher && (
            <Alert
              message="Teacher Account  Verified & Approved"
              description="You can upload, edit and delete PYQs. Admins will approve them before they go live."
              type="success" showIcon style={{ marginBottom: 24, borderRadius: 10 }}
            />
          )}

          {/*  Stats  */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={12} sm={8} lg={4}>
              <StatCard title="Total PYQs" value={stats.total} icon={<FilePdfOutlined />} color="#1890ff" />
            </Col>
            <Col xs={12} sm={8} lg={4}>
              <StatCard title="Approved" value={stats.approved} icon={<CheckCircleOutlined />} color="#52c41a" />
            </Col>
            <Col xs={12} sm={8} lg={4}>
              <StatCard title="Pending" value={stats.pending} icon={<ClockCircleOutlined />} color="#faad14" />
            </Col>
            <Col xs={12} sm={8} lg={4}>
              <StatCard title="Featured" value={stats.featured} icon={<StarOutlined />} color="#722ed1" />
            </Col>
            <Col xs={12} sm={8} lg={4}>
              <StatCard title="Popular" value={stats.popular} icon={<FireOutlined />} color="#eb2f96" />
            </Col>
            <Col xs={12} sm={8} lg={4}>
              <Card style={{ borderRadius: 12, border:'1px solid #52c41a22', height:'100%' }}
                bodyStyle={{ padding:'20px 24px' }}>
                <Text type="secondary" style={{ fontSize: 12, fontWeight: 500, textTransform:'uppercase' }}>
                  Approval Rate
                </Text>
                <Title level={3} style={{ margin:'4px 0 6px', color:'#1a1a1a' }}>{approvalRate}%</Title>
                <Progress percent={approvalRate} size="small" strokeColor="#52c41a" showInfo={false} />
              </Card>
            </Col>
          </Row>

          {/*  Pending alert for admin  */}
          {isAdmin && stats.pending > 0 && activeTab !=='pending' && (
            <Alert
              icon={<ExclamationCircleOutlined />}
              message={<Text strong>{stats.pending} PYQs pending approval</Text>}
              type="warning" showIcon closable style={{ marginBottom: 16, borderRadius: 10 }}
              action={<Button size="small" onClick={() => handleTabChange('pending')}>Review Now </Button>}
            />
          )}

          {/*  Main content  */}
          <Row gutter={24}>
            {/* Left: Upload Form  both admin & teacher can upload */}
            <Col xs={24} lg={9} xl={8}>
              <Card
                title={
                  <Space>
                    <PlusOutlined style={{ color:'#52c41a' }} />
                    <Title level={4} style={{ margin: 0 }}>Upload New PYQ</Title>
                  </Space>
                }
                style={{ borderRadius: 12 }}
                bodyStyle={{ maxHeight:'calc(100vh - 200px)', overflowY:'auto' }}
              >
                <PYQForm
                  formInstance={form}
                  onFinishFn={onFinish}
                  isEdit={false}
                  autoSEO={autoGenerateSEO}
                  setAutoSEO={setAutoGenerateSEO}
                />
              </Card>
            </Col>

            {/* Right: Table */}
            <Col xs={24} lg={15} xl={16}>
              <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 0 }}>

                {/* Toolbar */}
                <div style={{ padding:'16px 24px', borderBottom:'1px solid #f0f0f0' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap: 12 }}>
                    <Title level={4} style={{ margin: 0 }}>
                      <BarChartOutlined style={{ marginRight: 8, color:'#1890ff' }} />
                      PYQ Management
                    </Title>

                    {/* Bulk actions (admin only) */}
                    {isAdmin && bulkSelected.length > 0 && (
                      <Space size={6} wrap>
                        <Text type="secondary">{bulkSelected.length} selected</Text>
                        <Popconfirm title={`Approve ${bulkSelected.length} PYQs?`} onConfirm={() => handleBulkApproval(true)}>
                          <Button size="small" type="primary" icon={<UnlockOutlined />}>Bulk Approve</Button>
                        </Popconfirm>
                        <Popconfirm title={`Unapprove ${bulkSelected.length} PYQs?`} onConfirm={() => handleBulkApproval(false)}>
                          <Button size="small" icon={<LockOutlined />}>Unapprove</Button>
                        </Popconfirm>
                        <Button size="small" onClick={() => setBulkSelected([])}>Clear</Button>
                      </Space>
                    )}
                  </div>

                  {/* Search & Filters */}
                  <Row gutter={[8, 8]} style={{ marginTop: 12 }}>
                    <Col flex="1">
                      <Input
                        placeholder="Search by exam, title..."
                        prefix={<SearchOutlined />}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        onPressEnter={handleSearch}
                        allowClear
                        onClear={() => { setSearchTerm(''); setCurrentPage(1); fetchPYQs(activeTab, 1, pageSize,'', filterCategory, filterYear); }}
                      />
                    </Col>
                    <Col>
                      <Select
                        placeholder="Category"
                        allowClear
                        style={{ width: 130 }}
                        onChange={(val) => { setFilterCategory(val); setCurrentPage(1); fetchPYQs(activeTab, 1, pageSize, searchTerm, val, filterYear); }}
                        suffixIcon={<FilterOutlined />}
                      >
                        {EXAM_CATEGORIES.map(c => <Option key={c} value={c}>{c}</Option>)}
                      </Select>
                    </Col>
                    <Col>
                      <InputNumber
                        placeholder="Year"
                        min={2000}
                        max={new Date().getFullYear()}
                        style={{ width: 90 }}
                        onChange={(val) => { setFilterYear(val ?? undefined); setCurrentPage(1); fetchPYQs(activeTab, 1, pageSize, searchTerm, filterCategory, val ?? undefined); }}
                      />
                    </Col>
                    <Col>
                      <Button icon={<SearchOutlined />} onClick={handleSearch} type="primary">Search</Button>
                    </Col>
                  </Row>
                </div>

                {/* Tabs */}
                <div style={{ padding:'0 24px' }}>
                  <Tabs
                    activeKey={activeTab}
                    onChange={handleTabChange}
                    size="small"
                    tabBarStyle={{ marginBottom: 0 }}
                  >
                    <TabPane tab={<Badge count={stats.total} overflowCount={999} offset={[8, 0]}>All</Badge>} key="all" />
                    <TabPane tab={<Badge count={stats.approved} overflowCount={999} offset={[8, 0]}>Approved</Badge>} key="approved" />
                    <TabPane tab={<Badge count={stats.pending} overflowCount={999} offset={[8, 0]} style={{ backgroundColor:'#faad14' }}>Pending</Badge>} key="pending" />
                    <TabPane tab={<Badge count={stats.featured} overflowCount={999} offset={[8, 0]} style={{ backgroundColor:'#722ed1' }}>Featured</Badge>} key="featured" />
                    <TabPane tab={<Badge count={stats.popular} overflowCount={999} offset={[8, 0]} style={{ backgroundColor:'#eb2f96' }}>Popular</Badge>} key="popular" />
                  </Tabs>
                </div>

                {/* Table */}
                <Table
                  rowKey="_id"
                  columns={columns}
                  dataSource={pyqs}            //  raw server page, no manual slice
                  loading={loading}
                  rowSelection={isAdmin ? {
                    selectedRowKeys: bulkSelected,
                    onChange: keys => setBulkSelected(keys as string[]),
                  } : undefined}
                  pagination={{
                    current: currentPage,
                    pageSize,
                    total: totalCount,          //  server total across all pages
                    onChange: (page, size) => {
                      setCurrentPage(page);
                      setPageSize(size ?? 10);
                    },
                    onShowSizeChange: (_, size) => {
                      setCurrentPage(1);
                      setPageSize(size);
                    },
                    showSizeChanger: true,
                    showQuickJumper: true,
                    pageSizeOptions: ['10','20','50','100'],
                    showTotal: (total, range) => `${range[0]}${range[1]} of ${total} PYQs`,
                    style: { padding:'12px 24px', borderTop:'1px solid #f0f0f0' },
                  }}
                  scroll={{ x: 1600 }}
                  size="small"
                />
              </Card>
            </Col>
          </Row>
        </Content>

        <Footer style={{ textAlign:'center', background:'transparent' }}>
          <Text type="secondary"><b>© 2026 Draa. All Rights Reserved.</b></Text>
        </Footer>
      </Layout>

      {/*  Edit Modal  */}
      <Modal
        title={
          <Space>
            <EditOutlined style={{ color:'#1890ff' }} />
            <span>Edit PYQ</span>
            {selectedPYQ && (
              <Tag color={selectedPYQ.isApproved ?'success' :'warning'}>
                {selectedPYQ.isApproved ?'Approved' :'Pending'}
              </Tag>
            )}
          </Space>
        }
        open={editModalVisible}
        onCancel={() => { setEditModalVisible(false); setSelectedPYQ(null); editForm.resetFields(); }}
        footer={null}
        width="90%"
        style={{ top: 20 }}
        destroyOnClose
      >
        <div style={{ maxHeight:'80vh', overflowY:'auto', paddingRight: 8 }}>
          <PYQForm
            formInstance={editForm}
            onFinishFn={handleEdit}
            isEdit={true}
            autoSEO={editAutoGenerateSEO}
            setAutoSEO={setEditAutoGenerateSEO}
          />
        </div>
      </Modal>
    </Layout>
  );
};

export default PYQManagement;