import React, { useEffect, useState, useCallback } from 'react';
import {
  Layout, Form, Input, Button, Upload, Table, Select, Switch, message,
  Row, Col, Modal, Card, Space, Typography, Divider, Tag, Tabs, Badge,
  InputNumber, Tooltip, Popconfirm, Progress, Image, Collapse,
  DatePicker,
  Alert,
} from 'antd';
import {
  UploadOutlined, ExclamationCircleOutlined, CheckCircleOutlined,
  ClockCircleOutlined, EyeOutlined, BookOutlined, PictureOutlined,
  EditOutlined, DeleteOutlined, PlusOutlined, ReloadOutlined,
  SearchOutlined, FilterOutlined, LockOutlined, UnlockOutlined,
  BarChartOutlined, GlobalOutlined, FileTextOutlined, BankOutlined,
  TeamOutlined, FireOutlined, CalendarOutlined, DollarOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import moment, { Moment } from 'moment';
import { useNavigate } from 'react-router-dom';

import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Sidebar2 from './Sidebar2';
import url from '../../url';
import { getUserRole, getAuthHeaders } from '../../utils/global_auth';
import usePageTitle from '../../hooks/usePageTitle';

const { Option } = Select;
const { TextArea } = Input;
const { Text, Title } = Typography;
const { Content, Footer } = Layout;
const { TabPane } = Tabs;

//  Types 

interface LoginUser {
  name?: string;
  tname?: string;
  aname?: string;
  isVerified?: boolean;
  Status?: string;
}

interface Category {
  _id: string;
  name: string;
}

interface JobCategory {
  _id: string;
  name: string;
}

interface ReservationDetails {
  general?: number; obc?: number; sc?: number; st?: number;
  ews?: number; pwd?: number;[key: string]: number | undefined;
}

// Flat Application Fee fields (no nested object)
interface ApplicationFee {
  general?: number; obc?: number; ews?: number; sc?: number; st?: number;
  pwd?: number; female?: number;[key: string]: number | undefined;
}

// Flat date fields for Important Dates (no nested object)
interface JobSEO {
  seo_title?: string; meta_keywords?: string; meta_description?: string;
  slug?: string; og_title?: string; og_description?: string;
  canonical_url?: string; robots?: string; schema_markup?: string;
}

interface Job {
  _id: string;
  title: string;
  job_type: string;
  organization_name: string;
  job_category: JobCategory;
  location: string;
  advertisement_number?: string;
  deadline: string | Date;
  isApproved?: boolean;
  approvedBy?: { _id: string; aname: string; aemail: string };
  approvedAt?: string;
  rejectedBy?: { _id: string; aname: string; aemail: string };
  rejectedAt?: string;
  rejectionReason?: string;
  subcategory?: string;
  qualifications_required?: string[];
  experience_required?: string;
  salary_min?: number;
  salary_max?: number;
  salary_type?: string;
  age_limit_min?: number;
  age_limit_max?: number;
  application_link?: string;
  official_website?: string;
  reservation_details?: ReservationDetails;
  // Flat Application Fee fields
  application_fee_general?: number;
  application_fee_obc?: number;
  application_fee_ews?: number;
  application_fee_sc?: number;
  application_fee_st?: number;
  application_fee_pwd?: number;
  application_fee_female?: number;
  // Flat Important Date fields
  start_date?: string | Date | null;
  last_date?: string | Date | null;
  fee_last_date?: string | Date | null;
  exam_date?: string | Date | null;
  result_date?: string | Date | null;
  admit_card_release?: string | Date | null;
  job_description?: string;
  cover_image?: string;
  seo?: JobSEO;
  views?: number;
  applications?: number;
  createdAt?: string;
  [key: string]: any;
}

interface FormValues {
  title: string;
  job_type: string;
  organization_name: string;
  job_category: string;
  location: string;
  advertisement_number?: string;
  total_vacancies: number;
  status: string;
  deadline?: Moment;
  seo_title?: string;
  meta_keywords?: string;
  meta_description?: string;
  slug?: string;
  og_title?: string;
  og_description?: string;
  canonical_url?: string;
  robots?: string;
  schema_markup?: string;
  subcategory?: string;
  qualifications_required?: string[];
  experience_required?: string;
  salary_min?: number;
  salary_max?: number;
  salary_type?: string;
  age_limit_min?: number;
  age_limit_max?: number;
  application_link?: string;
  official_website?: string;
  reservation_details?: ReservationDetails;
  // Flat Application Fee fields (no nested object)
  application_fee_general?: number | null;
  application_fee_obc?: number | null;
  application_fee_ews?: number | null;
  application_fee_sc?: number | null;
  application_fee_st?: number | null;
  application_fee_pwd?: number | null;
  application_fee_female?: number | null;
  // Flat Important Date fields (no nested object)
  start_date?: Moment | null;
  last_date?: Moment | null;
  fee_last_date?: Moment | null;
  exam_date?: Moment | null;
  result_date?: Moment | null;
  admit_card_release?: Moment | null;
  job_description?: string;
  cover_image?: any[];
  job_pdf_file?: any[];
  syllabus_file?: any[];
}

interface Stats {
  total: number;
  approved: number;
  pending: number;
  active: number;
  expired: number;
}

//  StatCard 

const StatCard = ({
  title, value, icon, color, sub1, sub2,
}: {
  title: string; value: number; icon: React.ReactNode; color: string;
  sub1?: { label: string; value: number; color?: string };
  sub2?: { label: string; value: number; color?: string };
}) => (
  <Card
    style={{ borderRadius: 12, border: `1px solid ${color}22`, height: '100%' }}
    bodyStyle={{ padding: '20px 24px' }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ flex: 1 }}>
        <Text type="secondary" style={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {title}
        </Text>
        <Title level={3} style={{ margin: '4px 0 0', color: '#1a1a1a', lineHeight: 1.2 }}>
          {value.toLocaleString()}
        </Title>
        {(sub1 || sub2) && (
          <div style={{ marginTop: 8, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {sub1 && (
              <Text style={{ fontSize: 11, color: sub1.color ?? '#52c41a' }}>
                <CheckCircleOutlined style={{ marginRight: 3 }} />{sub1.value} {sub1.label}
              </Text>
            )}
            {sub2 && (
              <Text style={{ fontSize: 11, color: sub2.color ?? '#faad14' }}>
                <ClockCircleOutlined style={{ marginRight: 3 }} />{sub2.value} {sub2.label}
              </Text>
            )}
          </div>
        )}
      </div>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: `${color}18`, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: 22, color, flexShrink: 0,
      }}>
        {icon}
      </div>
    </div>
  </Card>
);

//  Main Component 

const JobsList: React.FC = () => {
  usePageTitle('Job Listings | Admin');
  const navigate = useNavigate();

  // Auth
  const [loginUser, setLoginUser] = useState<LoginUser>({});
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  // Forms
  const [form] = Form.useForm<FormValues>();
  const [editForm] = Form.useForm<FormValues>();
  const [autoGenerateSEO, setAutoGenerateSEO] = useState(true);
  const [editAutoGenerateSEO, setEditAutoGenerateSEO] = useState(true);

  // Data
  const [jobList, setJobList] = useState<Job[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, approved: 0, pending: 0, active: 0, expired: 0 });

  // UI State
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [bulkSelected, setBulkSelected] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string | undefined>();

  //  Server-side Pagination 
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  //  Auth 
  useEffect(() => {
    const role = getUserRole();

    if (role === 'GUEST') {
      message.warning('Please login to continue', 6);
      navigate('/admin-login');
      return;
    }
    if (role === 'STUDENT') {
      message.error('Students are not allowed to manage job posts.', 6);
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
      if (role === 'TEACHER') {
        if (user.isVerified !== true) {
          message.error('Your account is not verified yet.', 7);
          navigate('/teacher-dashboard');
          return;
        }
        if (user.Status !== 'approved') {
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

  //  Fetch Jobs (server-side pagination) 
  const fetchJobs = useCallback(async (
    tab = activeTab,
    page = currentPage,
    limit = pageSize,
    search = searchTerm,
    type = filterType,
  ) => {
    setLoading(true);
    try {
      let endpoint = `${url}/jobs`;
      const params: Record<string, any> = { page, limit };

      switch (tab) {
        case 'approved': endpoint = `${url}/jobs/approved/all`; break;
        case 'pending': endpoint = `${url}/jobs/pending/all`; break;
        case 'active': params.status = 'Active'; break;
        case 'expired': params.status = 'Expired'; break;
        default: break;
      }

      if (search) params.search = search;
      if (type) params.job_type = type;

      const res = await axios.get(endpoint, {
        params,
        headers: getAuthHeaders()
      });
      const data = res.data;

      let jobs: Job[] = [];
      if (Array.isArray(data.jobs)) jobs = data.jobs;
      else if (Array.isArray(data.data?.jobs)) jobs = data.data.jobs;
      else if (Array.isArray(data)) jobs = data;

      const total: number =
        data.total ?? data.totalJobs ??
        data.data?.total ?? data.data?.totalJobs ??
        jobs.length;

      setJobList(jobs);
      setTotalCount(total);
    } catch {
      message.error('Failed to fetch job posts');
      setJobList([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPage, pageSize, searchTerm, filterType]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get(`${url}/jobs/stats/overview`, {
        headers: getAuthHeaders()
      });
      if (res.data.stats) setStats(res.data.stats);
    } catch {
      // non-critical  silently ignore
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const res = await axios.get(`${url}/jobs/categories/fetch`, {
        headers: getAuthHeaders()
      });
      setCategories(res.data.categories ?? []);
    } catch {
      message.error('Failed to load categories');
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthChecked) {
      fetchJobs();
      fetchCategories();
      fetchStats();
    }
  }, [isAuthChecked]);

  // Re-fetch when pagination changes
  useEffect(() => {
    if (isAuthChecked) fetchJobs(activeTab, currentPage, pageSize, searchTerm, filterType);
  }, [currentPage, pageSize, isAuthChecked]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setBulkSelected([]);
    fetchJobs(tab, 1, pageSize, searchTerm, filterType);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchJobs(activeTab, 1, pageSize, searchTerm, filterType);
  };

  const handleFilterType = (val: string | undefined) => {
    setFilterType(val);
    setCurrentPage(1);
    fetchJobs(activeTab, 1, pageSize, searchTerm, val);
  };

  const handleRefresh = async () => {
    await Promise.all([fetchJobs(), fetchStats()]);
    message.success('Refreshed');
  };

  //  SEO helpers 
  const makeSlug = (title: string) =>
    title.toLowerCase().trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

  // Only apply SEO if autoSEO is enabled AND user has entered a title/description
  const applyAutoSEO = (formInst: any, title: string, org?: string, loc?: string) => {
    if (!title) return;
    const slug = makeSlug(title);
    const seoTitle = title.length > 60 ? title.substring(0, 57) + '...' : title;

    // Keyword Generator for Jobs
    const generateKeywords = () => {
      const words = `${title} ${org || ''} ${loc || ''}`.toLowerCase().match(/\b\w{4,}\b/g) || [];
      return Array.from(new Set(words)).slice(0, 10).join(',');
    };

    const metaDesc = `${title} at ${org || 'Organization'}. ${loc ? 'Location:' + loc + '.' : ''} Apply now!`;
    const seoDesc = metaDesc.length > 160 ? metaDesc.substring(0, 157) + '...' : metaDesc;

    formInst.setFieldsValue({
      slug,
      seo_title: seoTitle,
      og_title: seoTitle,
      meta_keywords: generateKeywords(),
      meta_description: seoDesc,
      og_description: seoDesc
    });
  };

  //  FormData builder 
  const buildFormData = (values: FormValues): FormData => {
    const fd = new FormData();

    const scalars: (keyof FormValues)[] = [
      'title', 'job_type', 'organization_name', 'job_category', 'location',
      'total_vacancies', 'status', 'job_description', 'subcategory',
      'experience_required', 'salary_min', 'salary_max', 'salary_type',
      'age_limit_min', 'age_limit_max', 'application_link', 'official_website',
      'advertisement_number', 'salary_range', 'selection_mode', 'featured',
      'exam_mode', 'application_mode', 'admit_card_url', 'result_url', 'syllabus_url',
      'seo_title', 'slug', 'meta_keywords', 'meta_description',
      'og_title', 'og_description', 'canonical_url', 'robots', 'schema_markup',
    ];

    scalars.forEach(k => {
      const v = values[k];
      if (v !== undefined && v !== null) {
        fd.append(k as string, String(v));
      }
    });

    // Special handling for preserving existing file URLs if no new file is uploaded
    if (!values.job_pdf_file?.[0]?.originFileObj && currentJob?.job_pdf_url) {
      fd.append('job_pdf_url', currentJob.job_pdf_url);
    }
    if (!values.syllabus_file?.[0]?.originFileObj && currentJob?.syllabus_url) {
      fd.append('syllabus_url', currentJob.syllabus_url);
    }
    if (!values.cover_image?.[0]?.originFileObj && currentJob?.cover_image) {
      fd.append('cover_image_url', currentJob.cover_image);
    }

    // Slug fallback if not provided
    if (!fd.has('slug') || !fd.get('slug')) {
      fd.set('slug', values.title ? makeSlug(values.title) : `job-${Date.now()}`);
    }

    fd.set('deadline', values.deadline ? values.deadline.toISOString() : moment().add(30, 'days').toISOString());
    fd.append('qualifications_required', JSON.stringify(values.qualifications_required ?? []));
    fd.append('tags', JSON.stringify(values.tags ?? []));
    fd.append('reservation_details', JSON.stringify(values.reservation_details ?? {}));

    // Build important_dates from FLAT fields
    const datesToSubmit: Record<string, string | null> = {};
    const dateKeys = ['start_date', 'last_date', 'fee_last_date', 'exam_date', 'admit_card_release', 'result_date'];

    dateKeys.forEach(key => {
      const val = values[key as keyof FormValues];
      const isDayjs = val && typeof val === 'object' && ('$y' in val || '$isDayjsObject' in val);
      const isMomentObj = moment.isMoment(val) && val.isValid();

      if (isDayjs || isMomentObj) {
        datesToSubmit[key] = val.toISOString();
      } else if (typeof val === 'string' && val) {
        datesToSubmit[key] = val;
      } else {
        datesToSubmit[key] = '';
      }
    });

    if (values.deadline) {
      datesToSubmit['last_date'] = values.deadline.toISOString();
    }

    dateKeys.forEach(key => {
      const val = datesToSubmit[key];
      fd.append(key, val || '');
    });

    fd.append('important_dates', JSON.stringify(datesToSubmit));

    const feeFields = ['application_fee_general', 'application_fee_obc', 'application_fee_ews', 'application_fee_sc', 'application_fee_st', 'application_fee_pwd', 'application_fee_female'];
    const applicationFeeObj: Record<string, number | null> = {};
    feeFields.forEach(field => {
      const val = values[field as keyof FormValues];
      if (val !== null && val !== undefined && val !== '') {
        fd.append(field, String(val));
        applicationFeeObj[field] = val as number;
      } else {
        fd.append(field, '');
        applicationFeeObj[field] = null;
      }
    });
    fd.append('application_fee', JSON.stringify(applicationFeeObj));

    // File Uploads (Only if NEW)
    if (values.cover_image?.[0]?.originFileObj) fd.append('cover_image', values.cover_image[0].originFileObj);
    if (values.job_pdf_file?.[0]?.originFileObj) fd.append('job_pdf_file', values.job_pdf_file[0].originFileObj);
    if (values.syllabus_file?.[0]?.originFileObj) fd.append('syllabus_file', values.syllabus_file[0].originFileObj);

    return fd;
  };


  const getFileValue = (e: any) => Array.isArray(e) ? e : e?.fileList;

  //  CRUD 
  const onFinish = async (values: FormValues) => {
    setSubmitLoading(true);
    try {
      await axios.post(`${url}/jobs/create`, buildFormData(values), {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      message.success('Job posted successfully and is pending approval!');
      form.resetFields();
      setCurrentPage(1);
      await Promise.all([fetchJobs(activeTab, 1), fetchStats()]);
    } catch (err: any) {
      const d = err.response?.data;
      if (d?.missing_fields) message.error(`Missing fields: ${d.missing_fields.join(',')}`);
      else if (d?.missing_seo_fields) message.error(`Missing SEO fields: ${d.missing_seo_fields.join(',')}`);
      else message.error('Error posting job. Check console for details.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEditSubmit = async (values: FormValues) => {
    if (!currentJob) return;
    setSubmitLoading(true);
    try {
      await axios.put(`${url}/jobs/update/${currentJob._id}`, buildFormData(values), {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      message.success('Job updated successfully');
      setEditModalVisible(false);
      setCurrentJob(null);
      await Promise.all([fetchJobs(), fetchStats()]);
    } catch {
      message.error('Error updating job');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${url}/jobs/delete/${id}`, {
        headers: getAuthHeaders()
      });
      message.success('Job deleted successfully');
      if (jobList.length === 1 && currentPage > 1) setCurrentPage(p => p - 1);
      await Promise.all([fetchJobs(), fetchStats()]);
    } catch {
      message.error('Error deleting job');
    }
  };

  const handleApproval = async (jobId: string, approved: boolean) => {
    try {
      await axios.put(`${url}/jobs/${jobId}/approve`,
        { isApproved: approved },
        { headers: getAuthHeaders() }
      );
      message.success(`Job ${approved ? 'approved' : 'unapproved'} successfully`);
      await Promise.all([fetchJobs(), fetchStats()]);
    } catch {
      message.error('Failed to update approval status');
    }
  };

  const handleBulkApproval = async (approved: boolean) => {
    if (!bulkSelected.length) { message.warning('No jobs selected'); return; }
    try {
      await axios.post(`${url}/jobs/bulk-approve`,
        { jobIds: bulkSelected, isApproved: approved },
        { headers: getAuthHeaders() }
      );
      message.success(`${bulkSelected.length} jobs ${approved ? 'approved' : 'unapproved'}`);
      setBulkSelected([]);
      await Promise.all([fetchJobs(), fetchStats()]);
    } catch {
      message.error('Bulk action failed');
    }
  };

  const handleEdit = (job: Job) => {
    setCurrentJob(job);

    // Flat date and fee fields from job
    const editData: Partial<FormValues> = {
      ...job,
      deadline: job.deadline ? moment(job.deadline) : undefined,
      job_category: job.job_category?._id,
      advertisement_number: job.advertisement_number,
      salary_range: job.salary_range,
      selection_mode: job.selection_mode,
      // Flat date fields
      start_date: job.start_date ? moment(job.start_date) : null,
      last_date: job.last_date ? moment(job.last_date) : (job.deadline ? moment(job.deadline) : null),
      fee_last_date: job.fee_last_date ? moment(job.fee_last_date) : null,
      exam_date: job.exam_date ? moment(job.exam_date) : null,
      result_date: job.result_date ? moment(job.result_date) : null,
      admit_card_release: job.admit_card_release ? moment(job.admit_card_release) : null,
      // Flat application fee fields
      application_fee_general: job.application_fee_general,
      application_fee_obc: job.application_fee_obc,
      application_fee_ews: job.application_fee_ews,
      application_fee_sc: job.application_fee_sc,
      application_fee_st: job.application_fee_st,
      application_fee_pwd: job.application_fee_pwd,
      application_fee_female: job.application_fee_female,
      // Reservation details
      reservation_details: {
        general: null, obc: null, sc: null, st: null, ews: null, pwd: null,
        ...(job.reservation_details || {})
      },
      featured: job.featured || false,
      tags: job.tags || [],
      exam_mode: job.exam_mode || '',
      application_mode: job.application_mode || '',
      admit_card_url: job.admit_card_url || '',
      result_url: job.result_url || '',
      syllabus_url: job.syllabus_url || '',
      cover_image: job.cover_image
        ? [{ uid: '-1', name: 'cover.jpg', status: 'done', url: `${url}/${job.cover_image}` }]
        : [],
      job_pdf_file: job.job_pdf_url
        ? [{ uid: '-2', name: 'notification.pdf', status: 'done', url: `${url}/${job.job_pdf_url}` }]
        : [],
      syllabus_file: job.syllabus_url
        ? [{ uid: '-3', name: 'syllabus.pdf', status: 'done', url: `${url}/${job.syllabus_url}` }]
        : [],
    };

    if (job.seo) {
      editData.seo_title = job.seo.seo_title;
      editData.meta_keywords = job.seo.meta_keywords;
      editData.meta_description = job.seo.meta_description;
      editData.slug = job.seo.slug;
      editData.og_title = job.seo.og_title;
      editData.og_description = job.seo.og_description;
      editData.canonical_url = job.seo.canonical_url;
      editData.robots = job.seo.robots;
      editData.schema_markup = job.seo.schema_markup;
    }

    editForm.setFieldsValue(editData);
    setEditModalVisible(true);
  };

  const isAdmin = !!loginUser.aname;

  //  Table Columns 
  const columns = [
    {
      title: 'Image',
      dataIndex: 'cover_image',
      width: 80,
      fixed: 'left' as const,
      render: (img: string) => img ? (
        <Image
          src={`${url}/${img}`}
          alt="Cover"
          width={50} height={50}
          style={{ objectFit: 'cover', borderRadius: 6 }}
          preview={{ mask: <EyeOutlined /> }}
        />
      ) : (
        <div style={{
          width: 50, height: 50, background: '#f5f5f5',
          display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6,
        }}>
          <PictureOutlined style={{ color: '#bfbfbf' }} />
        </div>
      ),
    },
    {
      title: 'Advt. No',
      dataIndex: 'advertisement_number',
      width: 200,
      fixed: 'left' as const,
      render: (n: string) => (
        <div style={{ padding: '4px 0' }}>
          <Tag color="cyan" style={{ margin: 0, width: '100%', textAlign: 'center', fontSize: 12, fontWeight: 500 }}>
            {n || ''}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Job & Organization',
      dataIndex: 'title',
      width: 450,
      render: (title: string, r: Job) => (
        <div style={{ padding: '8px 0' }}>
          <Text strong style={{ fontSize: 15, color: '#1890ff', display: 'block', marginBottom: 4, lineHeight: 1.3 }}>{title}</Text>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BankOutlined style={{ fontSize: 13, color: '#8c8c8c' }} />
            <Text type="secondary" style={{ fontSize: 12, fontWeight: 500 }}>{r.organization_name || 'Organization Not Specified'}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'job_type',
      width: 110,
      render: (t: string) => (
        <Tag color={t === 'Government' ? 'blue' : 'orange'} style={{ borderRadius: 4 }}>{t}</Tag>
      ),
    },
    {
      title: 'Salary Band',
      dataIndex: 'salary_range',
      width: 160,
      render: (s: string) => s ? (
        <Tag color="success" style={{ fontWeight: 600 }}>{s}</Tag>
      ) : (
        <Text type="secondary" style={{ fontSize: 11 }}>Not Disclosed</Text>
      ),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      width: 120,
    },
    {
      title: 'Vacancies',
      dataIndex: 'total_vacancies',
      width: 90,
      render: (v: number) => <Badge count={v} showZero color="#1890ff" />,
    },
    {
      title: 'Deadline',
      dataIndex: 'deadline',
      width: 110,
      render: (d: string | Date) => {
        const isExpired = moment(d).isBefore(moment());
        return (
          <Text style={{ color: isExpired ? '#ff4d4f' : undefined }}>
            {moment(d).format('DD MMM YYYY')}
          </Text>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 90,
      render: (s: string) => (
        <Tag color={s === 'Active' ? 'green' : 'red'}>{s}</Tag>
      ),
    },
    {
      title: 'Approval',
      dataIndex: 'isApproved',
      width: 110,
      render: (approved: boolean, record: Job) => isAdmin ? (
        <Tooltip title={`Click to ${approved ? 'unapprove' : 'approve'}`}>
          <Switch
            checked={approved}
            onChange={() => handleApproval(record._id, !approved)}
            checkedChildren={<CheckCircleOutlined />}
            unCheckedChildren={<ClockCircleOutlined />}
            size="small"
          />
        </Tooltip>
      ) : (
        <Tag
          color={approved ? 'success' : 'warning'}
          icon={approved ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
        >
          {approved ? 'Approved' : 'Pending'}
        </Tag>
      ),
    },
    {
      title: 'Stats',
      width: 100,
      render: (_: any, r: Job) => (
        <Space direction="vertical" size={2}>
          <Text type="secondary" style={{ fontSize: 11 }}><EyeOutlined /> {r.views ?? 0} views</Text>
          <Text type="secondary" style={{ fontSize: 11 }}><BookOutlined /> {r.applications ?? 0} apps</Text>
        </Space>
      ),
    },
    {
      title: 'Actions',
      width: 180,
      fixed: 'right' as const,
      render: (_: any, record: Job) => (
        <Space size={4} wrap>
          <Tooltip title="Edit">
            <Button size="small" type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
              Edit
            </Button>
          </Tooltip>
          <Popconfirm
            title="Delete this job post?"
            icon={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
            onConfirm={() => handleDelete(record._id)}
            okText="Delete"
            okType="danger"
          >
            <Button size="small" danger icon={<DeleteOutlined />}>Delete</Button>
          </Popconfirm>
          {isAdmin && (
            <Popconfirm
              title={`${record.isApproved ? 'Unapprove' : 'Approve'} this job?`}
              onConfirm={() => handleApproval(record._id, !record.isApproved)}
              okType={record.isApproved ? 'danger' : 'primary'}
            >
              <Button
                size="small"
                icon={record.isApproved ? <LockOutlined /> : <UnlockOutlined />}
                type={record.isApproved ? 'default' : 'primary'}
              >
                {record.isApproved ? 'Unapprove' : 'Approve'}
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  //  Reusable Job Form 
  const JobForm: React.FC<{
    formInstance: any;
    onFinish: (v: FormValues) => void;
    isEdit?: boolean;
    autoSEO: boolean;
    setAutoSEO: React.Dispatch<React.SetStateAction<boolean>>;
  }> = ({ formInstance, onFinish: onFinishFn, isEdit = false, autoSEO, setAutoSEO }) => (
    <Form
      form={formInstance}
      layout="vertical"
      onFinish={onFinishFn}
      initialValues={{
        job_type: 'Government',
        status: 'Active',
        robots: 'index, follow',
        salary_type: 'Monthly',
        start_date: null,
        last_date: null,
        fee_last_date: null,
        exam_date: null,
        admit_card_release: null,
        result_date: null,
        application_fee_general: null,
        application_fee_obc: null,
        application_fee_ews: null,
        application_fee_sc: null,
        application_fee_st: null,
        application_fee_pwd: null,
        application_fee_female: null
      }}
      scrollToFirstError
      preserve={true}
    >
      {/*  Basic Job Information (Visible)  */}
      <Card title={<Space><BankOutlined style={{ color: '#1890ff' }} /><span>Basic Information</span></Space>}
        style={{ marginBottom: 16, borderRadius: 10 }}>
        <Row gutter={16}>
          <Col span={16}>
            <Form.Item name="title" label="Job Title" rules={[{ required: true }]}>
              <Input
                placeholder="e.g. SSC CGL 2024"
                onChange={e => {
                  if (autoSEO) applyAutoSEO(formInstance, e.target.value, formInstance.getFieldValue('organization_name'), formInstance.getFieldValue('location'));
                }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="advertisement_number" label="Advertisement No.">
              <Input placeholder="e.g. 01/2024" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="job_type" label="Job Type" rules={[{ required: true }]}>
              <Select>
                <Option value="Government">Government</Option>
                <Option value="Private">Private</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="status" label="Status">
              <Select>
                <Option value="Active">Active</Option>
                <Option value="Expired">Expired</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="selection_mode" label="Mode of Selection">
              <Input placeholder="e.g. Written Exam, Interview" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="organization_name" label="Organization Name" rules={[{ required: true }]}>
          <Input
            placeholder="e.g. Staff Selection Commission"
            onChange={e => {
              if (autoSEO) applyAutoSEO(formInstance, formInstance.getFieldValue('title'), e.target.value, formInstance.getFieldValue('location'));
            }}
          />
        </Form.Item>

        <Form.Item name="job_category" label="Job Category" rules={[{ required: true, message: 'Please select a job category' }]}>
          <Select placeholder="Select Category" loading={categoriesLoading}>
            {categories.map((cat) => (
              <Option key={cat._id} value={cat._id}>
                {cat.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="cover_image"
          label="Cover Image (Job Banner)"
          valuePropName="fileList"
          getValueFromEvent={getFileValue}
        >
          <Upload
            beforeUpload={(file) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                const img = document.createElement('img');
                img.onload = () => {
                  const width = 267;
                  const height = 440;
                  if (img.width !== width || img.height !== height) {
                    message.warning(`Recommended size: ${width}x${height}px. Your image is ${img.width}x${img.height}px. It will work, but may look best at the recommended size.`);
                  } else {
                    message.success('Image dimensions validated (267x440).');
                  }
                };
                img.src = e.target?.result as string;
              };
              reader.readAsDataURL(file);
              return false;
            }}
            maxCount={1}
            accept="image/*"
            listType="picture"
          >
            <div>
              <Button icon={<PictureOutlined />} block>Upload Cover Image</Button>
              <Text type="secondary" style={{ display: 'block', marginTop: 4, fontSize: 11 }}>
                Required: 267x440px (Portrait). JPG, PNG, WEBP
              </Text>
            </div>
          </Upload>
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="location" label="Location" rules={[{ required: true }]}>
              <Input
                placeholder="e.g. PAN India, Delhi"
                onChange={e => {
                  if (autoSEO) applyAutoSEO(formInstance, formInstance.getFieldValue('title'), formInstance.getFieldValue('organization_name'), e.target.value);
                }}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="total_vacancies" label="No. of Post">
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="deadline" label="Last Date" rules={[{ required: true }]}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Collapse ghost accordion expandIconPosition="right" style={{ marginBottom: 16 }}>
        {/*  Section 1: Dates & Deadlines  */}
        <Collapse.Panel header={<Space><CalendarOutlined style={{ color: '#eb2f96' }} /><strong>Important Dates & Deadlines</strong></Space>} key="dates" forceRender>
          <Card size="small" style={{ borderRadius: 8, background: '#fafafa' }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="start_date" label="Registration Start Date">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="fee_last_date" label="Fee Payment Last Date">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="exam_date" label="Online Examination Date">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="admit_card_release" label="Admit Card Release">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="result_date" label="Result Declaration Date">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="last_date" label="Application Last Date" tooltip="Override the main deadline for this specific date">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Collapse.Panel>

        {/*  Section 2: Application Fees  */}
        <Collapse.Panel header={<Space><DollarOutlined style={{ color: '#faad14' }} /><strong>Examination Fees</strong></Space>} key="fees" forceRender>
          <Card size="small" style={{ borderRadius: 8, background: '#fafafa' }}>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="application_fee_general" label="General/UR ()">
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="application_fee_obc" label="OBC ()">
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="application_fee_ews" label="EWS ()">
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item name="application_fee_sc" label="SC ()">
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="application_fee_st" label="ST ()">
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="application_fee_pwd" label="PWD ()">
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="application_fee_female" label="Female ()">
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Collapse.Panel>

        {/*  Section 3: Requirements & Documentation  */}
        <Collapse.Panel header={<Space><BookOutlined style={{ color: '#722ed1' }} /><strong>Requirements & Official Documents</strong></Space>} key="requirements">
          <Card size="small" style={{ borderRadius: 8, background: '#fafafa' }}>
            <Form.Item name="qualifications_required" label="Minimum Educational Qualifications">
              <Select mode="tags" placeholder="e.g. Graduate, B.Tech, 12th Pass" />
            </Form.Item>

            <Row gutter={24}>
              <Col span={24} md={12}>
                <Form.Item name="job_pdf_file" label="Official Notification PDF" valuePropName="fileList" getValueFromEvent={getFileValue}>
                  <Upload beforeUpload={() => false} maxCount={1} accept=".pdf">
                    <Button icon={<UploadOutlined />} block>Upload Notification</Button>
                  </Upload>
                </Form.Item>
              </Col>
              <Col span={24} md={12}>
                <Form.Item name="syllabus_file" label="Syllabus PDF" valuePropName="fileList" getValueFromEvent={getFileValue}>
                  <Upload beforeUpload={() => false} maxCount={1} accept=".pdf">
                    <Button icon={<UploadOutlined />} block>Upload Syllabus</Button>
                  </Upload>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="official_website" label="Official Website">
              <Input placeholder="https://..." prefix={<GlobalOutlined />} />
            </Form.Item>
            <Form.Item name="application_link" label="Apply Online Link">
              <Input placeholder="https://..." prefix={<GlobalOutlined />} />
            </Form.Item>
          </Card>
        </Collapse.Panel>

        {/*  Section 4: Description & Salary  */}
        <Collapse.Panel header={<Space><FileTextOutlined style={{ color: '#52c41a' }} /><strong>Job Description & Salary Details</strong></Space>} key="desc">
          <Card size="small" style={{ borderRadius: 8, background: '#fafafa' }}>
            <Form.Item name="salary_range" label="Salary / Paycheck Band">
              <Input placeholder="e.g. 44,900 - 1,42,400 (Level 7)" />
            </Form.Item>

            <Form.Item name="job_description" label="Detailed Job Description">
              <TextArea
                rows={6}
                placeholder={"Describe selection process, exam pattern, and other details..."}
                showCount maxLength={10000}
              />
            </Form.Item>

            <Divider plain>Modes & Metadata</Divider>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="exam_mode" label="Exam Mode">
                  <Select placeholder="Select Mode">
                    <Option value="Online (CBT)">Online (CBT)</Option>
                    <Option value="Offline (OMR)">Offline (OMR)</Option>
                    <Option value="Both">Both</Option>
                    <Option value="N/A">N/A</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="application_mode" label="App. Mode">
                  <Select placeholder="Select Mode">
                    <Option value="Online">Online</Option>
                    <Option value="Offline">Offline</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="featured" label="Featured" valuePropName="checked">
                  <Switch checkedChildren="Yes" unCheckedChildren="No" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="tags" label="Job Tags / Search Terms">
              <Select mode="tags" style={{ width: '100%' }} placeholder="e.g. UPSC, Civil Services, 2024" />
            </Form.Item>

            <Divider plain>Reservation Details (Vacancy breakdown)</Divider>
            <Row gutter={16}>
              {['general', 'obc', 'sc', 'st', 'ews', 'pwd'].map(cat => (
                <Col span={8} key={cat}>
                  <Form.Item name={['reservation_details', cat]} label={cat.toUpperCase()}>
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              ))}
            </Row>
          </Card>
        </Collapse.Panel>
      </Collapse>

      {/*  SEO  */}
      <Collapse ghost accordion>
        <Collapse.Panel
          key="seo"
          header={
            <Space>
              <GlobalOutlined style={{ color: '#13c2c2' }} />
              <Text strong>SEO & Social Settings</Text>
              <Switch
                checked={autoSEO}
                onChange={setAutoSEO}
                size="small"
                checkedChildren="Auto"
                unCheckedChildren="Manual"
              />
            </Space>
          }
        >
          <Card
            style={{ borderRadius: 10, background: '#fafafa' }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="seo_title" label="SEO Title (max 60)" rules={[{ required: true }, { max: 60 }]}>
                  <Input showCount maxLength={60} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="slug" label="URL Slug" rules={[{ required: true }]}>
                  <Input placeholder="job-title-slug" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="meta_keywords" label="Meta Keywords" rules={[{ required: true }]} tooltip="Separate with commas">
              <Input placeholder="government job, recruitment, ssc, banking" />
            </Form.Item>
            <Form.Item name="meta_description" label="Meta Description (max 160)" rules={[{ required: true }, { max: 160 }]}>
              <TextArea rows={3} showCount maxLength={160} />
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
              <Input placeholder="https://yourdomain.com/jobs/job-title" />
            </Form.Item>
            <Form.Item name="schema_markup" label="Schema Markup (JSON-LD)">
              <TextArea rows={4} placeholder='{"@context":"https://schema.org","@type":"JobPosting", ...}' />
            </Form.Item>
          </Card>
        </Collapse.Panel>
      </Collapse>

      <Form.Item>
        <Button type="primary" htmlType="submit" block size="large"
          loading={submitLoading}
          icon={isEdit ? <EditOutlined /> : <PlusOutlined />}>
          {isEdit ? 'Update Job' : 'Submit Job'}
        </Button>
      </Form.Item>
    </Form>
  );

  //  Render 
  if (!isAuthChecked) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Alert message="Checking authentication" description="Please wait while we verify your permissions" type="info" showIcon />
        </Content>
      </Layout>
    );
  }

  const approvalRate = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {getUserRole() === 'ADMIN' ? <Sidebar /> : <Sidebar2 />}
      <Layout>
        <Topbar />
        <Content style={{ margin: '16px', padding: '0 8px' }}>

          {/*  Header Banner  */}
          <div style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            borderRadius: 16, padding: '28px 32px', marginBottom: 24,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: 16,
          }}>
            <div>
              <Title level={2} style={{ color: '#fff', margin: 0 }}>
                <BankOutlined style={{ marginRight: 10, color: '#faad14' }} />
                Job Management
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
                {isAdmin ? 'Admin Panel  Full control over job posts & approvals' : 'Teacher Panel  Manage your job posts'}
              </Text>
            </div>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading}
              style={{
                background: 'rgba(255,255,255,0.12)', color: '#fff',
                border: '1px solid rgba(255,255,255,0.25)', borderRadius: 8,
              }}
            >
              Refresh
            </Button>
          </div>

          {/*  Teacher status alert  */}
          {loginUser.tname && (
            <Alert
              message="Teacher Account  Verified & Approved"
              description="Your account is verified and approved. You can manage job posts."
              type="success" showIcon style={{ marginBottom: 24, borderRadius: 10 }}
            />
          )}

          {/*  Stats  */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={12} sm={8} lg={4}>
              <StatCard title="Total Jobs" value={stats.total} icon={<BookOutlined />} color="#1890ff" />
            </Col>
            <Col xs={12} sm={8} lg={4}>
              <StatCard title="Approved" value={stats.approved} icon={<CheckCircleOutlined />} color="#52c41a" />
            </Col>
            <Col xs={12} sm={8} lg={4}>
              <StatCard title="Pending" value={stats.pending} icon={<ClockCircleOutlined />} color="#faad14" />
            </Col>
            <Col xs={12} sm={8} lg={4}>
              <StatCard title="Active" value={stats.active} icon={<FireOutlined />} color="#eb2f96" />
            </Col>
            <Col xs={12} sm={8} lg={4}>
              <StatCard title="Expired" value={stats.expired} icon={<CalendarOutlined />} color="#ff4d4f" />
            </Col>
            <Col xs={12} sm={8} lg={4}>
              <Card style={{ borderRadius: 12, border: '1px solid #52c41a22', height: '100%' }}
                bodyStyle={{ padding: '20px 24px' }}>
                <Text type="secondary" style={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase' }}>
                  Approval Rate
                </Text>
                <Title level={3} style={{ margin: '4px 0 6px', color: '#1a1a1a' }}>{approvalRate}%</Title>
                <Progress percent={approvalRate} size="small" strokeColor="#52c41a" showInfo={false} />
              </Card>
            </Col>
          </Row>

          {/*  Pending alert for admin  */}
          {isAdmin && stats.pending > 0 && activeTab !== 'pending' && (
            <Alert
              icon={<ExclamationCircleOutlined />}
              message={<Text strong>{stats.pending} jobs pending approval</Text>}
              type="warning" showIcon closable style={{ marginBottom: 16, borderRadius: 10 }}
              action={<Button size="small" onClick={() => handleTabChange('pending')}>Review Now </Button>}
            />
          )}

          {/*  Main content  */}
          <Row gutter={[0, 24]}>
            {/* Top: Post Job Form */}
            <Col span={24}>
              <Card
                title={<Space><PlusOutlined style={{ color: '#52c41a' }} /><Title level={4} style={{ margin: 0 }}>Post New Job</Title></Space>}
                style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
              >
                <JobForm
                  formInstance={form}
                  onFinish={onFinish}
                  isEdit={false}
                  autoSEO={autoGenerateSEO}
                  setAutoSEO={setAutoGenerateSEO}
                />
              </Card>
            </Col>

            {/* Bottom: Job Table */}
            <Col span={24}>
              <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} bodyStyle={{ padding: 0 }}>

                {/* Toolbar */}
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <Title level={4} style={{ margin: 0 }}>
                      <BarChartOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                      Job Management
                    </Title>

                    {/* Bulk actions */}
                    {isAdmin && bulkSelected.length > 0 && (
                      <Space size={6} wrap>
                        <Text type="secondary">{bulkSelected.length} selected</Text>
                        <Popconfirm title={`Approve ${bulkSelected.length} jobs?`} onConfirm={() => handleBulkApproval(true)}>
                          <Button size="small" type="primary" icon={<UnlockOutlined />}>Bulk Approve</Button>
                        </Popconfirm>
                        <Popconfirm title={`Unapprove ${bulkSelected.length} jobs?`} onConfirm={() => handleBulkApproval(false)}>
                          <Button size="small" icon={<LockOutlined />}>Unapprove</Button>
                        </Popconfirm>
                        <Button size="small" onClick={() => setBulkSelected([])}>Clear</Button>
                      </Space>
                    )}
                  </div>

                  {/* Search & Filter */}
                  <Row gutter={[8, 8]} style={{ marginTop: 12 }}>
                    <Col flex="1">
                      <Input
                        placeholder="Search by title, organization..."
                        prefix={<SearchOutlined />}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        onPressEnter={handleSearch}
                        allowClear
                        onClear={() => { setSearchTerm(''); setCurrentPage(1); fetchJobs(activeTab, 1, pageSize, '', filterType); }}
                      />
                    </Col>
                    <Col>
                      <Select
                        placeholder="Job type"
                        allowClear
                        style={{ width: 140 }}
                        onChange={handleFilterType}
                        suffixIcon={<FilterOutlined />}
                      >
                        <Option value="Government">Government</Option>
                        <Option value="Private">Private</Option>
                      </Select>
                    </Col>
                    <Col>
                      <Button icon={<SearchOutlined />} onClick={handleSearch} type="primary">Search</Button>
                    </Col>
                  </Row>
                </div>

                {/* Tabs */}
                <div style={{ padding: '0 24px' }}>
                  <Tabs
                    activeKey={activeTab}
                    onChange={handleTabChange}
                    size="small"
                    tabBarStyle={{ marginBottom: 0 }}
                  >
                    <TabPane tab={<Badge count={stats.total} overflowCount={999} offset={[12, 0]}><span style={{ paddingRight: 8 }}>All</span></Badge>} key="all" />
                    <TabPane tab={<Badge count={stats.approved} overflowCount={999} offset={[12, 0]}><span style={{ paddingRight: 8 }}>Approved</span></Badge>} key="approved" />
                    <TabPane tab={<Badge count={stats.pending} overflowCount={999} offset={[12, 0]} style={{ backgroundColor: '#faad14' }}><span style={{ paddingRight: 8 }}>Pending</span></Badge>} key="pending" />
                    <TabPane tab={<Badge count={stats.active} overflowCount={999} offset={[12, 0]} style={{ backgroundColor: '#eb2f96' }}><span style={{ paddingRight: 8 }}>Active</span></Badge>} key="active" />
                    <TabPane tab={<Badge count={stats.expired} overflowCount={999} offset={[12, 0]} style={{ backgroundColor: '#ff4d4f' }}><span style={{ paddingRight: 8 }}>Expired</span></Badge>} key="expired" />
                  </Tabs>
                </div>

                {/* Table */}
                <Table
                  columns={columns}
                  dataSource={jobList}          //  raw server page, no manual slice
                  rowKey="_id"
                  loading={loading}
                  rowSelection={isAdmin ? {
                    selectedRowKeys: bulkSelected,
                    onChange: keys => setBulkSelected(keys as string[]),
                  } : undefined}
                  pagination={{
                    current: currentPage,
                    pageSize,
                    total: totalCount,           //  server total across all pages
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
                    pageSizeOptions: ['10', '20', '50', '100'],
                    showTotal: (total, range) => `${range[0]}${range[1]} of ${total} jobs`,
                    style: { padding: '12px 24px', borderTop: '1px solid #f0f0f0' },
                  }}
                  scroll={{ x: 2000 }}
                  size="small"
                />
              </Card>
            </Col>
          </Row>
        </Content>

        <Footer style={{ textAlign: 'center', background: 'transparent' }}>
          <Text type="secondary"><b>© 2026 Draa. All Rights Reserved.</b></Text>
        </Footer>
      </Layout>

      {/*  Edit Modal  */}
      <Modal
        title={
          <Space>
            <EditOutlined style={{ color: '#1890ff' }} />
            <span>Edit Job Post</span>
            {currentJob && (
              <Tag color={currentJob.isApproved ? 'success' : 'warning'}>
                {currentJob.isApproved ? 'Approved' : 'Pending'}
              </Tag>
            )}
          </Space>
        }
        open={editModalVisible}
        onCancel={() => { setEditModalVisible(false); setCurrentJob(null); editForm.resetFields(); }}
        footer={null}
        width="90%"
        style={{ top: 20 }}
        destroyOnClose
      >
        <div style={{ maxHeight: '80vh', overflowY: 'auto', paddingRight: 8 }}>
          <JobForm
            formInstance={editForm}
            onFinish={handleEditSubmit}
            isEdit={true}
            autoSEO={editAutoGenerateSEO}
            setAutoSEO={setEditAutoGenerateSEO}
          />
        </div>
      </Modal>
    </Layout>
  );
};

export default JobsList;