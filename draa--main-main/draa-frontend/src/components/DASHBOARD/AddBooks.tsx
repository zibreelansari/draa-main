import { useEffect, useState, useCallback } from'react';
import {
  Form, Input, Button, Upload, Table, Select, Switch, message, Row, Col,
  Modal, Card, Space, Typography, Divider, Layout, Tag, Tabs, Badge,
  Alert, InputNumber, Tooltip, Popconfirm, Progress, Statistic,
} from'antd';
import {
  UploadOutlined, ExclamationCircleOutlined, CheckCircleOutlined,
  ClockCircleOutlined, EyeOutlined, BookOutlined, PercentageOutlined,
  DeleteOutlined, PlusOutlined, EditOutlined, ReloadOutlined,
  SearchOutlined, FilterOutlined, StarOutlined, FireOutlined,
  BarChartOutlined, LockOutlined, UnlockOutlined, CopyOutlined,
  GlobalOutlined, FileTextOutlined, TrophyOutlined,
} from'@ant-design/icons';
import axios from'axios';
import { useNavigate } from'react-router-dom';
import Sidebar from'./Sidebar';
import Topbar from'./Topbar';
import Sidebar2 from'./Sidebar2';
import url from'../../url';
import { getAuthHeaders, getUserRole, redirectToLogin } from'../../utils/global_auth';
import usePageTitle from '../../hooks/usePageTitle';

const { confirm } = Modal;
const { TextArea } = Input;
const { Text, Title } = Typography;
const { Content } = Layout;
const { TabPane } = Tabs;

//  Types 
interface Book {
  _id: string;
  title: string;
  author: string;
  description?: string;
  category?: { _id: string; name: string };
  bookType?: string;
  physicalPrice?: number;
  digitalPrice?: number;
  physicalDiscountPercentage?: number;
  digitalDiscountPercentage?: number;
  isFeatured?: boolean;
  isPopular?: boolean;
  isApproved?: boolean;
  views?: number;
  downloads?: number;
  language?: string;
  publicationName?: string;
  publicationYear?: number;
  isbn?: string;
  youtubeUrl?: string;
  features?: string[];
  seo?: Record<string, string>;
  [key: string]: any;
}

interface Stats {
  total: number;
  approved: number;
  pending: number;
  featured: number;
  popular: number;
}

interface LoginUser {
  tname?: string;
  aname?: string;
  isVerified?: boolean;
  Status?: string;
}

//  StatCard 
const StatCard = ({
  title, value, icon, color, prefix,
}: {
  title: string; value: number; icon: React.ReactNode; color: string; prefix?: React.ReactNode;
}) => (
  <Card
    style={{ borderRadius: 12, border: `1px solid ${color}22`, height:'100%' }}
    bodyStyle={{ padding:'20px 24px' }}
  >
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
      <div>
        <Text type="secondary" style={{ fontSize: 12, fontWeight: 500, textTransform:'uppercase', letterSpacing: 0.5 }}>
          {title}
        </Text>
        <Title level={3} style={{ margin:'4px 0 0', color:'#1a1a1a', lineHeight: 1.2 }}>
          {value.toLocaleString()}
        </Title>
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

//  Main Component 
const AddBooks = () => {
  const navigate = useNavigate();

  // Auth
  const [loginUser, setLoginUser] = useState<LoginUser>({});
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  // Forms
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [autoGenerateSEO, setAutoGenerateSEO] = useState(true);
  const [editAutoGenerateSEO, setEditAutoGenerateSEO] = useState(true);

  // Data
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, approved: 0, pending: 0, featured: 0, popular: 0 });

  // UI State
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [bulkSelected, setBulkSelected] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string | undefined>();

  //  PAGINATION (server-side) 
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  //  Auth 
  useEffect(() => {
    const role = getUserRole();
    if (role === "GUEST") {
      redirectToLogin(navigate, "You are not logged in! Please log in first.");
      return;
    }
    
    const userData = localStorage.getItem('edudocs');
    if (!userData) {
      redirectToLogin(navigate, "Session expired. Please login again.");
      return;
    }
    try {
      const user = JSON.parse(userData);
      if (user.tname) {
        if (user.isVerified !== true) {
          message.error('Your account is not verified yet.', 8);
          navigate('/teacher-dashboard');
          return;
        }
        if (user.Status !=='approved') {
          message.error('Your account is not approved yet.', 8);
          navigate('/teacher-dashboard');
          return;
        }
      } else if (!user.aname) {
        message.error('Access denied. Only verified teachers and admins can manage books.', 7);
        navigate('/');
        return;
      }
      setLoginUser(user);
      setIsAuthChecked(true);
    } catch {
      redirectToLogin(navigate, "Invalid session data. Please login again.");
    }
  }, [navigate]);

  //  Fetch Books (server-side pagination) 
  const fetchBooks = useCallback(async (
    tab = activeTab,
    page = currentPage,
    limit = pageSize,
    search = searchTerm,
    type = filterType,
  ) => {
    if (!isAuthChecked) return;
    setLoading(true);
    try {
      // Build endpoint + params
      let endpoint = `${url}/books/all`;
      const params: Record<string, any> = { page, limit };

      switch (tab) {
        case'approved': endpoint = `${url}/books/approved`; break;
        case'pending': endpoint = `${url}/books/pending`; break;
        case'featured': params.isFeatured = true; break;
        case'popular': params.isPopular = true; break;
        default: break;
      }

      if (search) params.search = search;
      if (type) params.bookType = type;

      const res = await axios.get(endpoint, { 
        params,
        headers: getAuthHeaders()
      });
      const data = res.data;

      // Support multiple response shapes from backend
      const bookList: Book[] = data.books ?? data.data?.books ?? [];
      // Total: prefer explicit total field, fallback to array length
      const total: number =
        data.total ??
        data.totalBooks ??
        data.data?.total ??
        data.data?.totalBooks ??
        bookList.length;

      setBooks(bookList);
      setTotalCount(total);
    } catch {
      message.error('Failed to fetch books');
      setBooks([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [isAuthChecked, activeTab, currentPage, pageSize, searchTerm, filterType]);

  const fetchStats = useCallback(async () => {
    if (!isAuthChecked) return;
    try {
      const res = await axios.get(`${url}/books/stats/overview`, {
        headers: getAuthHeaders()
      });
      setStats(res.data.stats ?? { total: 0, approved: 0, pending: 0, featured: 0, popular: 0 });
    } catch {
      // non-critical
    }
  }, [isAuthChecked]);

  const fetchCategories = useCallback(async () => {
    if (!isAuthChecked) return;
    try {
      const res = await axios.get(`${url}/books/categories/all`, {
        headers: getAuthHeaders()
      });
      setCategories(res.data.categories ?? []);
    } catch {
      message.error('Failed to fetch categories');
    }
  }, [isAuthChecked]);

  // Initial load
  useEffect(() => {
    if (isAuthChecked) {
      fetchBooks();
      fetchCategories();
      fetchStats();
    }
  }, [isAuthChecked]);

  // Re-fetch on pagination/tab/filter change
  useEffect(() => {
    if (isAuthChecked) {
      fetchBooks(activeTab, currentPage, pageSize, searchTerm, filterType);
    }
  }, [activeTab, currentPage, pageSize, isAuthChecked]);

  // Reset page to 1 when tab/filters change (not page itself)
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1); //  critical reset
    setBulkSelected([]);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchBooks(activeTab, 1, pageSize, searchTerm, filterType);
  };

  const handleFilterType = (val: string | undefined) => {
    setFilterType(val);
    setCurrentPage(1);
    fetchBooks(activeTab, 1, pageSize, searchTerm, val);
  };

  const handleRefresh = async () => {
    await Promise.all([fetchBooks(), fetchStats()]);
    message.success('Refreshed');
  };

  //  SEO Auto-generate 
  const makeSlug = (title: string) =>
    title.toLowerCase().trim()
      .replace(/[^\w\s-]/g,'')
      .replace(/[\s_-]+/g,'-')
      .replace(/^-+|-+$/g,'');

  const applyAutoSEO = (formInstance: any, title: string, desc?: string) => {
    const slug = makeSlug(title);
    const seoTitle = title.length > 60 ? title.substring(0, 57) +'...' : title;
    
    // Simple Keyword Generator
    const generateKeywords = (t: string, d?: string) => {
      const combined = `${t} ${d ||''}`.toLowerCase();
      const words = combined.match(/\b\w{4,}\b/g) || [];
      const uniqueWords = Array.from(new Set(words)).slice(0, 10);
      return uniqueWords.join(',');
    };

    formInstance.setFieldsValue({ 
      seo_title: seoTitle, 
      slug, 
      og_title: seoTitle,
      meta_keywords: generateKeywords(title, desc)
    });

    if (desc) {
      const metaDesc = desc.length > 160 ? desc.substring(0, 157) +'...' : desc;
      formInstance.setFieldsValue({ meta_description: metaDesc, og_description: metaDesc });
    }
  };

  //  FormData builder 
  const buildFormData = (values: any): FormData => {
    const fd = new FormData();
    const scalars = [
'title','author','description','bookType','language',
'isFeatured','isPopular','youtubeUrl',
'publicationName','publicationYear','isbn',
'physicalPrice','digitalPrice',
'physicalDiscountPercentage','digitalDiscountPercentage',
'seo_title','slug','meta_keywords','meta_description',
'og_title','og_description','canonical_url','robots','schema_markup',
'pages',
    ];
    scalars.forEach(k => {
      if (values[k] !== undefined && values[k] !== null) fd.append(k, String(values[k]));
    });

    if (values.category) {
      const cat = Array.isArray(values.category) ? values.category[0] : values.category;
      if (cat != null) fd.append('category', cat);
    }

    if (Array.isArray(values.features)) {
      values.features.forEach((f: string) => { if (f) fd.append('features[]', f); });
    }
    
    if (Array.isArray(values.tags)) {
      values.tags.forEach((t: string) => { if (t) fd.append('tags[]', t); });
    }

    const fileFields: [string, string][] = [
      ['coverImage','coverImage'],
      ['pdf','pdf'],
    ];
    fileFields.forEach(([field, key]) => {
      const list = values[field];
      if (list?.length > 0 && list[0]?.originFileObj) {
        fd.append(key, list[0].originFileObj);
      }
    });

    if (values.addOnImages?.length > 0) {
      values.addOnImages.forEach((f: any) => {
        if (f.originFileObj) fd.append('addOnImages', f.originFileObj);
      });
    }

    return fd;
  };

  const getFileValue = (e: any) => {
    if (Array.isArray(e)) return e;
    return e?.fileList ?? [];
  };

  //  CRUD 
  const onFinish = async (values: any) => {
    setSubmitLoading(true);
    try {
      await axios.post(`${url}/books/create`, buildFormData(values), {
        headers: { 
          ...getAuthHeaders(),
'Content-Type':'multipart/form-data' 
        },
      });
      message.success('Book created successfully and is pending approval');
      form.resetFields();
      setCurrentPage(1);
      await Promise.all([fetchBooks(activeTab, 1), fetchStats()]);
    } catch (err: any) {
      message.error(err.response?.data?.error ??'Failed to create book');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = async (values: any) => {
    if (!selectedBook) return;
    setSubmitLoading(true);
    try {
      await axios.put(`${url}/books/${selectedBook._id}`, buildFormData(values), {
        headers: { 
          ...getAuthHeaders(),
'Content-Type':'multipart/form-data' 
        },
      });
      message.success('Book updated successfully');
      setEditModalVisible(false);
      setSelectedBook(null);
      await Promise.all([fetchBooks(), fetchStats()]);
    } catch (err: any) {
      message.error(err.response?.data?.error ??'Failed to update book');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${url}/books/${id}`, {
        headers: getAuthHeaders()
      });
      message.success('Book deleted successfully');
      // If deleting last item on page, go back one page
      if (books.length === 1 && currentPage > 1) setCurrentPage(p => p - 1);
      await Promise.all([fetchBooks(), fetchStats()]);
    } catch {
      message.error('Failed to delete book');
    }
  };

  const handleApproval = async (bookId: string, approved: boolean) => {
    try {
      await axios.put(`${url}/books/${bookId}/approve`, 
        { isApproved: approved },
        { headers: getAuthHeaders() }
      );
      message.success(`Book ${approved ?'approved' :'unapproved'} successfully`);
      await Promise.all([fetchBooks(), fetchStats()]);
    } catch {
      message.error('Failed to update approval status');
    }
  };

  const handleBulkApproval = async (approved: boolean) => {
    if (!bulkSelected.length) { message.warning('No books selected'); return; }
    try {
      await axios.post(`${url}/books/bulk-approve`, 
        { bookIds: bulkSelected, isApproved: approved },
        { headers: getAuthHeaders() }
      );
      message.success(`${bulkSelected.length} books ${approved ?'approved' :'unapproved'}`);
      setBulkSelected([]);
      await Promise.all([fetchBooks(), fetchStats()]);
    } catch {
      message.error('Bulk action failed');
    }
  };

  const showEditModal = (book: Book) => {
    setSelectedBook(book);
    let parsedFeatures: string[] = [];
    if (Array.isArray(book.features)) parsedFeatures = book.features;
    else if (typeof book.features ==='string') {
      try { parsedFeatures = JSON.parse(book.features); } catch { parsedFeatures = []; }
    }

    editForm.setFieldsValue({
      title: book.title,
      author: book.author,
      description: book.description,
      features: parsedFeatures,
      category: book.category?.name ??'',
      bookType: book.bookType ??'pdftype',
      physicalPrice: Number(book.physicalPrice) || 0,
      digitalPrice: Number(book.digitalPrice) || 0,
      physicalDiscountPercentage: Number(book.physicalDiscountPercentage) || 0,
      digitalDiscountPercentage: Number(book.digitalDiscountPercentage) || 0,
      isFeatured: book.isFeatured ?? false,
      isPopular: book.isPopular ?? false,
      youtubeUrl: book.youtubeUrl ??'',
      language: book.language ??'English',
      publicationName: book.publicationName ??'',
      publicationYear: book.publicationYear ? Number(book.publicationYear) : undefined,
      isbn: book.isbn ??'',
      seo_title: book.seo?.seo_title ?? book.title,
      meta_keywords: book.seo?.meta_keywords ??'',
      meta_description: book.seo?.meta_description ?? book.description,
      slug: book.seo?.slug ??'',
      og_title: book.seo?.og_title ?? book.title,
      og_description: book.seo?.og_description ??'',
      canonical_url: book.seo?.canonical_url ??'',
      robots: book.seo?.robots ??'index, follow',
      schema_markup: book.seo?.schema_markup ??'',
      pages: book.pages || undefined,
      tags: book.tags || [],
      coverImage: book.coverImage
        ? [{ uid:'-1', name:'cover.jpg', status:'done', url: `${url}/${book.coverImage}` }]
        : [],
      addOnImages: Array.isArray(book.addOnImages)
        ? book.addOnImages.map((img, idx) => ({
            uid: `-${idx + 10}`,
            name: `image-${idx + 1}.jpg`,
            status:'done',
            url: `${url}/${img}`,
          }))
        : [],
      pdf: book.pdfUrl
        ? [{ uid:'-2', name:'book.pdf', status:'done', url: `${url}/${book.pdfUrl}` }]
        : [],
    });
    setEditModalVisible(true);
  };

  //  Loading state 
  if (!isAuthChecked) {
    return (
      <Layout style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Card><Text>Checking permissions</Text></Card>
      </Layout>
    );
  }

  //  Table Columns 
  const columns = [
    {
      title:'Book',
      dataIndex:'title',
      width: 220,
      render: (title: string, record: Book) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>{title}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>{record.author}</Text>
        </div>
      ),
    },
    {
      title:'Category',
      dataIndex: ['category','name'],
      width: 120,
      render: (name: string) => name ? <Tag color="blue">{name}</Tag> :'',
    },
    {
      title:'Type',
      dataIndex:'bookType',
      width: 100,
      render: (t: string) => {
        const map: Record<string, { color: string; label: string }> = {
          paperback: { color:'blue', label:'Paperback' },
'both(ppt+pdf)': { color:'purple', label:'Both' },
          pdftype: { color:'green', label:'PDF' },
        };
        const info = map[t] ?? { color:'default', label: t ??'' };
        return <Tag color={info.color}>{info.label}</Tag>;
      },
    },
    {
      title:'Physical',
      dataIndex:'physicalPrice',
      width: 110,
      render: (p: number, r: Book) => (
        p != null ? (
          <div>
            <Text strong>{p}</Text>
            {r.physicalDiscountPercentage! > 0 && (
              <Tag color="orange" style={{ marginLeft: 4, fontSize: 10 }}>
                -{r.physicalDiscountPercentage}%
              </Tag>
            )}
          </div>
        ) :''
      ),
    },
    {
      title:'Digital',
      dataIndex:'digitalPrice',
      width: 110,
      render: (p: number, r: Book) => (
        p != null ? (
          <div>
            <Text strong>{p}</Text>
            {r.digitalDiscountPercentage! > 0 && (
              <Tag color="cyan" style={{ marginLeft: 4, fontSize: 10 }}>
                -{r.digitalDiscountPercentage}%
              </Tag>
            )}
          </div>
        ) :''
      ),
    },
    {
      title:'Flags',
      width: 100,
      render: (_: any, r: Book) => (
        <Space direction="vertical" size={2}>
          {r.isFeatured && <Tag color="purple" style={{ fontSize: 10 }}> Featured</Tag>}
          {r.isPopular && <Tag color="gold" style={{ fontSize: 10 }}> Popular</Tag>}
        </Space>
      ),
    },
    {
      title:'Status',
      dataIndex:'isApproved',
      width: 110,
      render: (approved: boolean) => (
        <Tag
          icon={approved ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
          color={approved ?'success' :'warning'}
        >
          {approved ?'Approved' :'Pending'}
        </Tag>
      ),
    },
    {
      title:'Stats',
      width: 110,
      render: (_: any, r: Book) => (
        <Space size={8}>
          <Tooltip title="Views"><Text><EyeOutlined /> {r.views ?? 0}</Text></Tooltip>
          <Tooltip title="Downloads"><Text><BookOutlined /> {r.downloads ?? 0}</Text></Tooltip>
        </Space>
      ),
    },
    {
      title:'Actions',
      width: 200,
      fixed:'right' as const,
      render: (_: any, record: Book) => (
        <Space wrap size={4}>
          <Tooltip title="Edit">
            <Button size="small" type="primary" icon={<EditOutlined />} onClick={() => showEditModal(record)}>
              Edit
            </Button>
          </Tooltip>
          <Popconfirm
            title="Delete this book?"
            icon={<ExclamationCircleOutlined style={{ color:'#ff4d4f' }} />}
            onConfirm={() => handleDelete(record._id)}
            okText="Delete"
            okType="danger"
          >
            <Button size="small" danger icon={<DeleteOutlined />}>Delete</Button>
          </Popconfirm>
          {loginUser.aname && (
            <Popconfirm
              title={`${record.isApproved ?'Unapprove' :'Approve'} this book?`}
              onConfirm={() => handleApproval(record._id, !record.isApproved)}
              okText="Yes"
              okType={record.isApproved ?'danger' :'primary'}
            >
              <Button
                size="small"
                icon={record.isApproved ? <LockOutlined /> : <UnlockOutlined />}
                type={record.isApproved ?'default' :'primary'}
              >
                {record.isApproved ?'Unapprove' :'Approve'}
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  //  Reusable Book Form 
  const BookFormContent = ({
    formInstance,
    onFinish: onFinishFn,
    isEdit = false,
    autoSEO,
    setAutoSEO,
  }: {
    formInstance: any;
    onFinish: (v: any) => void;
    isEdit?: boolean;
    autoSEO: boolean;
    setAutoSEO: (v: boolean) => void;
  }) => (
    <Form form={formInstance} layout="vertical" onFinish={onFinishFn}>
      {/*  Basic Info  */}
      <Card
        title={<Space><BookOutlined style={{ color:'#1890ff' }} /><span>Basic Information</span></Space>}
        style={{ marginBottom: 16, borderRadius: 10 }}
      >
        <Row gutter={16}>
          <Col span={isEdit ? 12 : 24}>
            <Form.Item
              name="title"
              label="Book Title"
              rules={[{ required: true, message:'Please enter book title' }]}
            >
              <Input
                placeholder="Enter book title"
                onChange={e => {
                  if (autoSEO) applyAutoSEO(formInstance, e.target.value);
                }}
              />
            </Form.Item>
          </Col>
          {isEdit && (
            <Col span={12}>
              <Form.Item name="author" label="Author" rules={[{ required: true }]}>
                <Input placeholder="Author name" />
              </Form.Item>
            </Col>
          )}
        </Row>

        {!isEdit && (
          <Form.Item name="author" label="Author" rules={[{ required: true }]}>
            <Input placeholder="Enter author name" />
          </Form.Item>
        )}

        <Form.Item name="description" label="Description" rules={[{ required: true }]}>
          <TextArea
            rows={4}
            placeholder="Enter book description"
            onChange={e => {
              if (autoSEO) applyAutoSEO(formInstance, formInstance.getFieldValue('title'), e.target.value);
            }}
          />
        </Form.Item>

        <Divider orientation="left" plain>Book Features</Divider>
        <Form.List name="features">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...rest }) => (
                <Space key={key} style={{ display:'flex', marginBottom: 8 }} align="baseline">
                  <Form.Item {...rest} name={name} rules={[{ required: true, message:'Required' }]}>
                    <Input placeholder="e.g. Chapter-wise PYQ analysis" style={{ width: 280 }} />
                  </Form.Item>
                  <Button danger size="small" onClick={() => remove(name)}></Button>
                </Space>
              ))}
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                Add Feature
              </Button>
            </>
          )}
        </Form.List>

        <Form.Item name="youtubeUrl" label="YouTube URL" style={{ marginTop: 16 }}>
          <Input placeholder="https://www.youtube.com/watch?v=..." prefix={<GlobalOutlined />} />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="category" label="Category" rules={[{ required: true }]}>
              <Select placeholder="Select category" showSearch allowClear mode="multiple"
                filterOption={(input, opt: any) => opt?.children?.toLowerCase().includes(input.toLowerCase())}
              >
                {categories.map(cat => (
                  <Select.Option key={cat._id} value={cat.name}>{cat.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="bookType" label="Book Type" rules={[{ required: true }]}>
              <Select placeholder="Select book type">
                <Select.Option value="pdftype">PDF Type</Select.Option>
                <Select.Option value="paperback">Paperback</Select.Option>
                <Select.Option value="both(ppt+pdf)">Both (PDF &amp; Paperback)</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="language" label="Language" rules={[{ required: true }]}>
              <Input placeholder="e.g. English, Hindi, Bengali" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="pages" label="Number of Pages">
              <InputNumber style={{ width:'100%' }} placeholder="e.g. 350" min={1} />
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item name="tags" label="Tags / Search Keywords" tooltip="Press enter to add multiple tags">
           <Select mode="tags" style={{ width:'100%' }} placeholder="e.g. History, UPSC, 2024" />
        </Form.Item>
      </Card>

      {/*  Publication  */}
      <Card
        title={<Space><FileTextOutlined style={{ color:'#722ed1' }} /><span>Publication Details</span></Space>}
        style={{ marginBottom: 16, borderRadius: 10 }}
      >
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="publicationName" label="Publisher">
              <Input placeholder="e.g. Penguin Books" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="publicationYear"
              label="Publication Year"
              rules={[{
                validator: (_, val) => {
                  if (!val) return Promise.resolve();
                  const yr = new Date().getFullYear();
                  return val >= 1000 && val <= yr + 1 ? Promise.resolve() : Promise.reject(`Must be between 1000 and ${yr + 1}`);
                }
              }]}
            >
              <InputNumber style={{ width:'100%' }} placeholder="e.g. 2024" min={1000} max={new Date().getFullYear() + 1} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="isbn"
              label="ISBN Number"
              rules={[{
                validator: (_, val) => {
                  if (!val) return Promise.resolve();
                  const clean = val.replace(/[-\s]/g,'');
                  return /^\d{10}$|^\d{13}$/.test(clean) ? Promise.resolve() : Promise.reject('ISBN must be 10 or 13 digits');
                }
              }]}
            >
              <Input placeholder="978-0-123456-78-9" maxLength={17} />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/*  Pricing  */}
      <Card
        title={<Space><PercentageOutlined style={{ color:'#52c41a' }} /><span>Pricing</span></Space>}
        style={{ marginBottom: 16, borderRadius: 10 }}
      >
        <Alert
          message="Pricing Guide  Physical price is for Paperback, Digital for PDF."
          type="info" showIcon style={{ marginBottom: 16, borderRadius: 8 }}
        />
        <Row gutter={16}>
          <Col span={12}>
            <Card size="small" title={<Text strong style={{ color:'#1890ff' }}> Physical (Paperback)</Text>}
              style={{ borderRadius: 8, border:'1px solid #91d5ff' }}>
              <Form.Item
                name="physicalPrice"
                label="Physical Price ()"
                rules={[{
                  validator(_, value) {
                    const bt = formInstance.getFieldValue('bookType');
                    if (['paperback','both(ppt+pdf)'].includes(bt) && (!value || value <= 0))
                      return Promise.reject('Required for this book type');
                    return Promise.resolve();
                  },
                }]}
              >
                <InputNumber style={{ width:'100%' }} min={0} placeholder="e.g. 499" prefix="" />
              </Form.Item>
              <Form.Item name="physicalDiscountPercentage" label="Discount (%)">
                <InputNumber style={{ width:'100%' }} min={0} max={100} placeholder="e.g. 10"
                  formatter={v => `${v}%`} parser={(v: any) => v?.replace('%','')} />
              </Form.Item>
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small" title={<Text strong style={{ color:'#52c41a' }}> Digital (PDF)</Text>}
              style={{ borderRadius: 8, border:'1px solid #b7eb8f' }}>
              <Form.Item
                name="digitalPrice"
                label="Digital Price ()"
                rules={[{
                  validator(_, value) {
                    const bt = formInstance.getFieldValue('bookType');
                    if (['pdftype','both(ppt+pdf)'].includes(bt) && (!value || value <= 0))
                      return Promise.reject('Required for this book type');
                    return Promise.resolve();
                  },
                }]}
              >
                <InputNumber style={{ width:'100%' }} min={0} placeholder="e.g. 199" prefix="" />
              </Form.Item>
              <Form.Item name="digitalDiscountPercentage" label="Discount (%)">
                <InputNumber style={{ width:'100%' }} min={0} max={100} placeholder="e.g. 10"
                  formatter={v => `${v}%`} parser={(v: any) => v?.replace('%','')} />
              </Form.Item>
            </Card>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={12}>
            <Form.Item name="isFeatured" label="Featured" valuePropName="checked">
              <Switch checkedChildren=" Featured" unCheckedChildren="No" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="isPopular" label="Popular" valuePropName="checked">
              <Switch checkedChildren=" Popular" unCheckedChildren="No" />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/*  Files  */}
      <Card
        title={<Space><UploadOutlined style={{ color:'#eb2f96' }} /><span>Files & Media</span></Space>}
        style={{ marginBottom: 16, borderRadius: 10 }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="coverImage"
              label="Cover Image (Main)"
              rules={[{ required: !isEdit, message:'Please upload a cover image' }]}
              valuePropName="fileList"
              getValueFromEvent={getFileValue}
            >
              <Upload 
                name="coverImage" 
                maxCount={1} 
                accept="image/*" 
                listType="picture"
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
              >
                <Button icon={<UploadOutlined />}>Upload Cover Image</Button>
                <div style={{ fontSize:'11px', color:'#666', marginTop:'4px' }}>Required: 267x440 pixels (Portrait)</div>
              </Upload>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="addOnImages"
              label="Additional Images (up to 5)"
              valuePropName="fileList"
              getValueFromEvent={getFileValue}
            >
              <Upload name="addOnImages" beforeUpload={() => false} maxCount={5} multiple accept="image/*" listType="picture">
                <Button icon={<PlusOutlined />}>Upload Additional Images</Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          name="pdf"
          label="PDF File"
          rules={[{ required: !isEdit, message:'Please upload a PDF file' }]}
          valuePropName="fileList"
          getValueFromEvent={getFileValue}
        >
          <Upload name="pdf" beforeUpload={() => false} maxCount={1} accept=".pdf,application/pdf">
            <Button icon={<UploadOutlined />}>Upload PDF</Button>
          </Upload>
        </Form.Item>
      </Card>

      {/*  SEO  */}
      <Card
        title={
          <Space>
            <GlobalOutlined style={{ color:'#13c2c2' }} />
            <span>SEO Settings</span>
            <Switch
              checked={autoSEO}
              onChange={setAutoSEO}
              checkedChildren="Auto"
              unCheckedChildren="Manual"
              size="small"
            />
            <Text type="secondary" style={{ fontSize: 12 }}>Auto-fill from title &amp; description</Text>
          </Space>
        }
        style={{ marginBottom: 16, borderRadius: 10 }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="seo_title"
              label="SEO Title (max 60 chars)"
              rules={[{ required: true }, { max: 60 }]}
            >
              <Input showCount maxLength={60} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="slug" label="URL Slug" rules={[{ required: true }]}>
              <Input placeholder="book-title-slug" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="meta_keywords" label="Meta Keywords" rules={[{ required: true }]}
          tooltip="Separate with commas">
          <Input placeholder="book, pdf, download, education" />
        </Form.Item>
        <Form.Item name="meta_description" label="Meta Description (max 160 chars)"
          rules={[{ required: true }, { max: 160 }]}>
          <TextArea rows={3} showCount maxLength={160} />
        </Form.Item>
        <Divider orientation="left" plain>Open Graph &amp; Advanced</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="og_title" label="OG Title"><Input maxLength={60} /></Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="robots" label="Robots">
              <Select>
                <Select.Option value="index, follow">Index, Follow</Select.Option>
                <Select.Option value="noindex, nofollow">No Index, No Follow</Select.Option>
                <Select.Option value="index, nofollow">Index, No Follow</Select.Option>
                <Select.Option value="noindex, follow">No Index, Follow</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="og_description" label="OG Description">
          <TextArea rows={2} maxLength={160} />
        </Form.Item>
        <Form.Item name="canonical_url" label="Canonical URL">
          <Input placeholder="https://yourdomain.com/books/book-title" />
        </Form.Item>
        <Form.Item name="schema_markup" label="Schema Markup (JSON-LD)">
          <TextArea rows={4} placeholder='{"@context":"https://schema.org","@type":"Book", ...}' />
        </Form.Item>
      </Card>

      <Form.Item>
        <Button type="primary" htmlType="submit" block size="large" loading={submitLoading}
          icon={isEdit ? <EditOutlined /> : <PlusOutlined />}>
          {isEdit ?'Update Book' :'Add Book'}
        </Button>
      </Form.Item>
    </Form>
  );

  //  Render 
  return (
    <Layout style={{ minHeight:'100vh' }}>
      {loginUser.aname ? <Sidebar /> : <Sidebar2 />}
      <Layout>
        <Topbar />
        <Content style={{ margin:'16px', padding:'0 8px' }}>

          {/*  Admin Header Banner  */}
          <div style={{
            background:'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            borderRadius: 16, padding:'28px 32px', marginBottom: 24,
            display:'flex', justifyContent:'space-between', alignItems:'center',
            flexWrap:'wrap', gap: 16,
          }}>
            <div>
              <Title level={2} style={{ color:'#fff', margin: 0 }}>
                <BookOutlined style={{ marginRight: 10, color:'#52c41a' }} />
                Book Management
              </Title>
              <Text style={{ color:'rgba(255,255,255,0.6)', fontSize: 14 }}>
                {loginUser.aname ?'Admin Panel  Full control over books & approvals' :'Teacher Panel  Manage your books'}
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
          {loginUser.tname && (
            <Alert
              message="Teacher Account  Verified & Approved"
              description="Your account is verified and approved. You can manage books."
              type="success" showIcon style={{ marginBottom: 24, borderRadius: 10 }}
            />
          )}

          {/*  Stats  */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={12} sm={8} lg={4}>
              <StatCard title="Total Books" value={stats.total} icon={<BookOutlined />} color="#1890ff" />
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
              <Card style={{ borderRadius: 12, border:'1px solid #13c2c222', height:'100%' }}
                bodyStyle={{ padding:'20px 24px' }}>
                <Text type="secondary" style={{ fontSize: 12, fontWeight: 500, textTransform:'uppercase' }}>
                  Approval Rate
                </Text>
                <Title level={3} style={{ margin:'4px 0 6px', color:'#1a1a1a' }}>
                  {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
                </Title>
                <Progress
                  percent={stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}
                  size="small" strokeColor="#52c41a" showInfo={false}
                />
              </Card>
            </Col>
          </Row>

          {/*  Pending alert for admin  */}
          {loginUser.aname && stats.pending > 0 && activeTab !=='pending' && (
            <Alert
              icon={<ExclamationCircleOutlined />}
              message={<Text strong>{stats.pending} books pending approval</Text>}
              type="warning" showIcon closable style={{ marginBottom: 16, borderRadius: 10 }}
              action={<Button size="small" onClick={() => handleTabChange('pending')}>Review Now </Button>}
            />
          )}

          {/*  Main content  */}
          <Row gutter={24}>
            {/* Left: Add Book Form */}
            <Col xs={24} lg={9} xl={8}>
              <Card
                title={<Space><PlusOutlined style={{ color:'#52c41a' }} /><Title level={4} style={{ margin: 0 }}>Add New Book</Title></Space>}
                style={{ borderRadius: 12, position:'sticky', top: 16 }}
                bodyStyle={{ maxHeight:'calc(100vh - 200px)', overflowY:'auto' }}
              >
                <BookFormContent
                  formInstance={form}
                  onFinish={onFinish}
                  isEdit={false}
                  autoSEO={autoGenerateSEO}
                  setAutoSEO={setAutoGenerateSEO}
                />
              </Card>
            </Col>

            {/* Right: Book Table */}
            <Col xs={24} lg={15} xl={16}>
              <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 0 }}>

                {/* Toolbar */}
                <div style={{ padding:'16px 24px', borderBottom:'1px solid #f0f0f0' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap: 12 }}>
                    <Title level={4} style={{ margin: 0 }}>
                      <BarChartOutlined style={{ marginRight: 8, color:'#1890ff' }} />
                      Book Management
                    </Title>

                    {/* Bulk actions */}
                    {loginUser.aname && bulkSelected.length > 0 && (
                      <Space size={6} wrap>
                        <Text type="secondary">{bulkSelected.length} selected</Text>
                        <Popconfirm title={`Approve ${bulkSelected.length} books?`} onConfirm={() => handleBulkApproval(true)}>
                          <Button size="small" type="primary" icon={<UnlockOutlined />}>Bulk Approve</Button>
                        </Popconfirm>
                        <Popconfirm title={`Unapprove ${bulkSelected.length} books?`} onConfirm={() => handleBulkApproval(false)}>
                          <Button size="small" icon={<LockOutlined />}>Unapprove</Button>
                        </Popconfirm>
                        <Button size="small" onClick={() => setBulkSelected([])}>Clear</Button>
                      </Space>
                    )}
                  </div>

                  {/* Search & Filter row */}
                  <Row gutter={[8, 8]} style={{ marginTop: 12 }}>
                    <Col flex="1">
                      <Input
                        placeholder="Search by title, author..."
                        prefix={<SearchOutlined />}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        onPressEnter={handleSearch}
                        allowClear
                        onClear={() => { setSearchTerm(''); setCurrentPage(1); fetchBooks(activeTab, 1, pageSize,'', filterType); }}
                      />
                    </Col>
                    <Col>
                      <Select
                        placeholder="Book type"
                        allowClear
                        style={{ width: 140 }}
                        onChange={handleFilterType}
                        suffixIcon={<FilterOutlined />}
                      >
                        <Select.Option value="pdftype">PDF</Select.Option>
                        <Select.Option value="paperback">Paperback</Select.Option>
                        <Select.Option value="both(ppt+pdf)">Both</Select.Option>
                      </Select>
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
                  dataSource={books}           //  raw server page data (no manual slice!)
                  loading={loading}
                  rowSelection={loginUser.aname ? {
                    selectedRowKeys: bulkSelected,
                    onChange: keys => setBulkSelected(keys as string[]),
                  } : undefined}
                  pagination={{
                    current: currentPage,
                    pageSize,
                    total: totalCount,         //  server total (all pages)
                    onChange: (page, size) => {
                      setCurrentPage(page);
                      setPageSize(size ?? 10);
                      // fetchBooks triggered by useEffect on [currentPage, pageSize]
                    },
                    onShowSizeChange: (_, size) => {
                      setCurrentPage(1);
                      setPageSize(size);
                    },
                    showSizeChanger: true,
                    showQuickJumper: true,
                    pageSizeOptions: ['10','20','50','100'],
                    showTotal: (total, range) => `${range[0]}${range[1]} of ${total} books`,
                    style: { padding:'12px 24px', borderTop:'1px solid #f0f0f0' },
                  }}
                  scroll={{ x: 1600 }}
                  size="small"
                />
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>

      {/*  Edit Modal  */}
      <Modal
        title={
          <Space>
            <EditOutlined style={{ color:'#1890ff' }} />
            <span>Edit Book</span>
            {selectedBook && (
              <Tag color={selectedBook.isApproved ?'success' :'warning'}>
                {selectedBook.isApproved ?'Approved' :'Pending'}
              </Tag>
            )}
          </Space>
        }
        open={editModalVisible}
        onCancel={() => { setEditModalVisible(false); setSelectedBook(null); editForm.resetFields(); }}
        footer={null}
        width="90%"
        style={{ top: 20 }}
        destroyOnClose
      >
        <div style={{ maxHeight:'80vh', overflowY:'auto', paddingRight: 8 }}>
          <BookFormContent
            formInstance={editForm}
            onFinish={handleEdit}
            isEdit={true}
            autoSEO={editAutoGenerateSEO}
            setAutoSEO={setEditAutoGenerateSEO}
          />
        </div>
      </Modal>
    </Layout>
  );
};

export default AddBooks;