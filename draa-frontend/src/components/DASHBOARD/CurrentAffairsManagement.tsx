import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form, Input, Button, Select, message, Table, Space, Modal, Tag, Popconfirm,
  Row, Col, Card, Divider, Tabs, Switch, DatePicker, Badge, Pagination,
  Layout, Statistic, Tooltip, Alert, Typography, Avatar, Result, Spin,
} from"antd";
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  FolderAddOutlined, SearchOutlined, UploadOutlined, UserOutlined,
  CalendarOutlined, FileTextOutlined, FolderOutlined, LockOutlined,
  CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined, FilePdfOutlined,
  LinkOutlined, FileOutlined,
} from"@ant-design/icons";
import { Upload } from"antd";
import axios from"axios";
import moment from"moment";
import dayjs from"dayjs";
import Sidebar from"./Sidebar";
import Sidebar2 from"./Sidebar2";
import Topbar from"./Topbar";
import CkEditor from"./CkEditor";
import url from"../../url";
import { getUserRole, getAuthHeaders, UserRole, getStoredUser, redirectToLogin } from"../../utils/global_auth";
import usePageTitle from '../../hooks/usePageTitle';

const { Content } = Layout;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

/* 
   PERMISSIONS
   ADMIN    full CRUD, status toggle, category management, stats
   TEACHER  create + edit affairs only; read-only categories
   Others   blocked entirely
 */

const CAN = {
  create: (r: UserRole) => r ==="ADMIN" || r ==="TEACHER",
  edit: (r: UserRole) => r ==="ADMIN" || r ==="TEACHER",
  delete: (r: UserRole) => r ==="ADMIN",
  toggleStatus: (r: UserRole) => r ==="ADMIN",
  approve: (r: UserRole) => r ==="ADMIN",
  manageCategories: (r: UserRole) => r ==="ADMIN",
  viewStats: (r: UserRole) => r ==="ADMIN",
  hasAccess: (r: UserRole) => r ==="ADMIN" || r ==="TEACHER",
};

/* 
   TYPES  (mirrors Mongoose schema)
 */

type AffairType ="DAILY" |"WEEKLY" |"MONTHLY" |"QUARTERLY" |"YEARLY";

interface CurrentAffair {
  _id: string;
  title: string;
  slug: string;
  type: AffairType;
  categoryId: { _id: string; name: string } | null;
  publishDate: string;
  status:"ACTIVE" |"INACTIVE";
  views?: number;
  rating?: number;
  shortDescription?: string;
  content?: string;
  coverImage?: string;  // stored as /uploads/current-affairs/xxx.jpg
  pdfFile?: string;  // stored as /uploads/current-affairs/xxx.pdf
  isApproved: boolean;
  tags?: string[];
  seo?: { seo_title?: string; meta_description?: string; meta_keywords?: string };
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
}

/* 
   CONSTANTS
 */

const TYPE_COLOR: Record<string, string> = {
  DAILY:"geekblue",
  WEEKLY:"purple",
  MONTHLY:"cyan",
  QUARTERLY:"gold",
  YEARLY:"magenta",
};

const AFFAIR_TYPES: AffairType[] = ["DAILY","WEEKLY","MONTHLY","QUARTERLY","YEARLY"];

/** Converts a human-readable string to a URL slug */
const toSlug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-");

/* 
   SUB-COMPONENTS
 */

const RoleBadge = ({ role }: { role: UserRole }) => {
  const cfg =
    role ==="ADMIN"
      ? { color:"#f5222d", emoji:"", label:"Admin" }
      : { color:"#1677ff", emoji:"", label:"Teacher" };
  return (
    <Tag style={{
      background: cfg.color, color:"#fff", border:"none",
      borderRadius: 20, fontWeight: 600, padding:"2px 12px", fontSize: 12,
    }}>
      {cfg.emoji} {cfg.label}
    </Tag>
  );
};

const AccessDenied = () => (
  <Layout style={{ minHeight:"100vh" }}>
    {getUserRole() ==="ADMIN" ? <Sidebar /> : <Sidebar2 />}
    <Layout>
      <Topbar />
      <Content style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"80vh" }}>
        <Result
          icon={<LockOutlined style={{ color:"#f5222d", fontSize: 64 }} />}
          status="403"
          title="Access Restricted"
          subTitle="You don't have permission to view this section. Contact your administrator."
          extra={
            <Button type="primary" danger onClick={() => (window.location.href ="/")}>
              Go to Home
            </Button>
          }
        />
      </Content>
    </Layout>
  </Layout>
);

/* 
   MAIN COMPONENT
 */

const CurrentAffairsManagement = () => {
  const navigate = useNavigate();
  const role = getUserRole();
  const storedUser = getStoredUser();
  const userName =
    storedUser?.A_name || storedUser?.aname ||
    storedUser?.T_name || storedUser?.tname || "User";

  /* Auth check for guests */
  useEffect(() => {
    if (role === "GUEST") {
      redirectToLogin(navigate, "Please login to continue");
    }
  }, [role, navigate]);

  /*  Access guard (after all hooks)  */
  if (!CAN.hasAccess(role)) return <AccessDenied />;

  /*  State  */
  const [activeTab, setActiveTab] = useState("affairs");
  const [affairs, setAffairs] = useState<CurrentAffair[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [catLoading, setCatLoading] = useState(false);

  const [totalAffairs, setTotalAffairs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<AffairType | undefined>();

  const [affairModalOpen, setAffairModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);

  // CKEditor rich content state
  const [caContent, setCaContent] = useState('');

  const [selectedAffair, setSelectedAffair] = useState<CurrentAffair | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [viewAffair, setViewAffair] = useState<CurrentAffair | null>(null);

  const [form] = Form.useForm();
  const [categoryForm] = Form.useForm();

  /* Admin dashboard stats */
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, categories: 0 });

  /* 
     DATA LOADERS
   */

  useEffect(() => {
    loadAffairs();
    loadCategories();
  }, []);

  useEffect(() => {
    loadAffairs();
  }, [currentPage, pageSize, searchTerm, typeFilter]);

  /**
   * GET /current-affairs/all
   * Backend supports: page, limit, search, type
   *  status is NOT a supported filter in the backend  excluded from params.
   */
  const loadAffairs = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page: currentPage, limit: pageSize };
      if (searchTerm) params.search = searchTerm;
      if (typeFilter) params.type = typeFilter;   // backend uppercases automatically

      const res = await axios.get(`${url}/current-affairs/all`, { 
        params,
        headers: getAuthHeaders() 
      });
      const data: CurrentAffair[] = res.data.data || [];
      const total: number = res.data.total || 0;

      setAffairs(data);
      setTotalAffairs(total);

      if (CAN.viewStats(role)) {
        setStats(prev => ({
          ...prev,
          total,
          active: data.filter(a => a.status ==="ACTIVE").length,
          inactive: data.filter(a => a.status !=="ACTIVE").length,
        }));
      }
    } catch {
      message.error("Failed to load current affairs");
    } finally {
      setLoading(false);
    }
  };

  /**
   * GET /current-affairs/category/all
   * Returns: { success, categories[] }
   */
  const loadCategories = async () => {
    setCatLoading(true);
    try {
      const res = await axios.get(`${url}/current-affairs/category/all`, {
        headers: getAuthHeaders()
      });
      const cats: Category[] = res.data.categories || [];
      setCategories(cats);
      if (CAN.viewStats(role)) {
        setStats(prev => ({ ...prev, categories: cats.length }));
      }
    } catch {
      message.error("Failed to load categories");
    } finally {
      setCatLoading(false);
    }
  };

  /* 
     AFFAIRS  CREATE / UPDATE
     POST /current-affairs/create      (multipart)
     PUT  /current-affairs/:id         (multipart)
     Multer field names: coverImage, pdfFile
   */

  /**
   * Ant Design Upload stores file in value.file (which may have .originFileObj).
   * Backend receives multipart fields named coverImage / pdfFile.
   */
  const buildAffairFormData = (values: any): FormData => {
    const fd = new FormData();
    fd.append("title", values.title);
    fd.append("slug", values.slug);
    fd.append("type", values.type);
    fd.append("categoryId", values.categoryId);
    fd.append("rating", values.rating || 3);
    fd.append("shortDescription", values.shortDescription ||"");
    fd.append("content", caContent ||"");   // from CKEditor state
    fd.append("publishDate",
      values.publishDate ? values.publishDate.toISOString() : new Date().toISOString()
    );
    fd.append("tags", JSON.stringify(values.tags || []));
    fd.append("seo", JSON.stringify(values.seo || {}));

    /* Extract raw File from Ant Design's Upload wrapper */
    const rawFile = (field: any): File | null => {
      if (!field) return null;
      if (field.file?.originFileObj instanceof File) return field.file.originFileObj;
      if (field.file instanceof File) return field.file;
      return null;
    };

    const cover = rawFile(values.coverImage);
    const pdf = rawFile(values.pdfFile);
    const ppt = rawFile(values.pptFile);
    if (cover) fd.append("coverImage", cover);
    if (pdf) fd.append("pdfFile", pdf);
    if (ppt) fd.append("pptFile", ppt);

    return fd;
  };

  const handleAffairSubmit = async (values: any) => {
    try {
      const fd = buildAffairFormData(values);
      const headers = { ...getAuthHeaders(),"Content-Type":"multipart/form-data" };

      if (selectedAffair) {
        await axios.put(`${url}/current-affairs/${selectedAffair._id}`, fd, { headers });
        message.success("Current affair updated successfully");
      } else {
        await axios.post(`${url}/current-affairs/create`, fd, { headers });
        message.success("Current affair created successfully");
      }

      closeAffairModal();
      loadAffairs();
    } catch (err: any) {
      message.error(err.response?.data?.message ||"Failed to save current affair");
    }
  };

  /* 
     AFFAIRS  DELETE / STATUS
     DELETE /current-affairs/:id
     PATCH  /current-affairs/:id/status    body: { status }
   */

  const deleteAffair = async (id: string) => {
    try {
      await axios.delete(`${url}/current-affairs/${id}`, {
        headers: getAuthHeaders()
      });
      message.success("Current affair deleted");
      loadAffairs();
    } catch (err: any) {
      message.error(err.response?.data?.message ||"Failed to delete");
    }
  };

  /** PATCH /:id/status  Admin only */
  const toggleAffairStatus = async (record: CurrentAffair, checked: boolean) => {
    try {
      await axios.patch(`${url}/current-affairs/${record._id}/status`, 
        { status: checked ?"ACTIVE" :"INACTIVE" },
        { headers: getAuthHeaders() }
      );
      message.success(`Marked as ${checked ?"Active" :"Inactive"}`);
      loadAffairs();
    } catch {
      message.error("Failed to update status");
    }
  };
  
  /** PATCH /:id/approve  Admin only */
  const toggleAffairApproval = async (record: CurrentAffair, checked: boolean) => {
    try {
      await axios.patch(`${url}/current-affairs/${record._id}/approve`, 
        { isApproved: checked },
        { headers: getAuthHeaders() }
      );
      message.success(`Affair ${checked ?"Approved" :"Unapproved"}`);
      loadAffairs();
    } catch {
      message.error("Failed to update approval status");
    }
  };

  /* 
     AFFAIRS  VIEW DETAIL
     GET /current-affairs/:id    { success, affair }
   */

  const openViewModal = async (record: CurrentAffair) => {
    setViewAffair(record);       // show partial data immediately while fetching
    setViewModalOpen(true);
    setViewLoading(true);
    try {
      const res = await axios.get(`${url}/current-affairs/${record._id}`, { headers: getAuthHeaders() });
      /* Backend returns affair inside res.data.affair */
      setViewAffair(res.data.affair || res.data.data || record);
    } catch {
      /* silently keep partial list data on fetch failure */
    } finally {
      setViewLoading(false);
    }
  };

  const handleFileDelete = async (fileType:"coverImage" |"pdfFile" |"pptFile") => {
    if (!selectedAffair) return;
    try {
      setLoading(true);
      const res = await axios.delete(`${url}/current-affairs/${selectedAffair._id}/file/${fileType}`, { headers: getAuthHeaders() });
      if (res.data.success) {
        message.success(`${fileType} deleted successfully`);
        /* Refresh the selected affair data */
        const updatedRes = await axios.get(`${url}/current-affairs/${selectedAffair._id}`, { headers: getAuthHeaders() });
        const updatedAffair = updatedRes.data.affair || updatedRes.data.data;
        setSelectedAffair(updatedAffair);
        loadAffairs();
      }
    } catch (err: any) {
      message.error(err.response?.data?.message ||"Failed to delete file");
    } finally {
      setLoading(false);
    }
  };

  /* 
     CATEGORIES  CREATE / UPDATE
     POST /current-affairs/category/create     body: { name, slug, description }
     PUT  /current-affairs/category/:id        body: req.body (any fields)
   */

  const handleCategorySubmit = async (values: any) => {
    try {
      if (selectedCategory) {
        await axios.put(`${url}/current-affairs/category/${selectedCategory._id}`, values, { headers: getAuthHeaders() });
        message.success("Type updated");
      } else {
        await axios.post(`${url}/current-affairs/category/create`, values, {
          headers: getAuthHeaders()
        });
        message.success("Type created");
      }
      closeCategoryModal();
      loadCategories();
    } catch (err: any) {
      message.error(err.response?.data?.message ||"Error saving type");
    }
  };

  /* 
     CATEGORIES  DELETE
     DELETE /current-affairs/category/:id
      Backend returns 400 if any affair is linked to this category.
   */

  const deleteCategory = async (id: string) => {
    try {
      await axios.delete(`${url}/current-affairs/category/${id}`, { headers: getAuthHeaders() });
      message.success("Type deleted");
      loadCategories();
    } catch (err: any) {
      /* Surface the backend's"Cannot delete. Current affairs exist..." message */
      message.error(err.response?.data?.message ||"Failed to delete type");
    }
  };

  /* 
     CATEGORIES  STATUS TOGGLE
      No dedicated PATCH /category/:id/status route exists in backend.
       We reuse PUT /category/:id and send { isActive } in the body.
   */

  const toggleCategoryStatus = async (record: Category, checked: boolean) => {
    try {
      await axios.put(`${url}/current-affairs/category/${record._id}`, {
        isActive: checked,
      });
      loadCategories();
    } catch {
      message.error("Failed to update type status");
    }
  };

  /* 
     MODAL HELPERS
   */

  const openNewAffair = () => {
    setSelectedAffair(null);
    setCaContent('');
    form.resetFields();
    setAffairModalOpen(true);
  };

  const openEditAffair = (record: CurrentAffair) => {
    setSelectedAffair(record);
    setCaContent(record.content ||'');
    form.setFieldsValue({
      title: record.title,
      slug: record.slug,
      type: record.type,
      categoryId: record.categoryId?._id,
      rating: record.rating || 3,
      publishDate: record.publishDate ? dayjs(record.publishDate) : undefined,
      shortDescription: record.shortDescription ||"",
      content: record.content ||"",
      tags: record.tags || [],
      seo: record.seo || {},
      /*
        coverImage / pdfFile Upload fields are intentionally NOT pre-set here.
        Existing paths are displayed as preview links in the Media tab.
        The backend only replaces a file if a new one is uploaded;
        omitting the field keeps the existing stored path intact.
      */
    });
    setAffairModalOpen(true);
  };

  const closeAffairModal = () => {
    setAffairModalOpen(false);
    setSelectedAffair(null);
    setCaContent('');
    form.resetFields();
  };

  const closeCategoryModal = () => {
    setCategoryModalOpen(false);
    setSelectedCategory(null);
    categoryForm.resetFields();
  };

  /* 
     TABLE COLUMNS  AFFAIRS
   */

  const affairColumns = [
    {
      title:"Title",
      dataIndex:"title",
      ellipsis: true,
      render: (title: string, record: CurrentAffair) => (
        <Space>
          <Badge status={record.status ==="ACTIVE" ?"success" :"default"} />
          <Text strong>{title}</Text>
        </Space>
      ),
    },
    {
      title:"Category",
      dataIndex:"type",
      width: 115,
      render: (type: string) => (
        <Tag color={TYPE_COLOR[type] ||"default"} style={{ fontWeight: 600 }}>
          {type}
        </Tag>
      ),
    },
    {
      title:"Type",
      dataIndex: ["categoryId","name"],
      width: 160,
      render: (name: string) =>
        name
          ? <Tag icon={<FolderOutlined />} color="default">{name}</Tag>
          : <Text type="secondary"></Text>,
    },
    {
      title:"Publish Date",
      dataIndex:"publishDate",
      width: 135,
      render: (date: string) => (
        <Space size={4}>
          <CalendarOutlined style={{ color:"#8c8c8c" }} />
          <Text type="secondary">{moment(date).format("DD MMM YYYY")}</Text>
        </Space>
      ),
    },
    {
      title:"Views",
      dataIndex:"views",
      width: 80,
      align:"center" as const,
      render: (v: number) => <Text type="secondary">{(v || 0).toLocaleString()}</Text>,
    },
    {
      title:"Status & Approval",
      width: 170,
      render: (_: any, record: CurrentAffair) => (
        <Space direction="vertical" size={2}>
          <Space>
            <Text type="secondary" style={{ fontSize: 11, minWidth: 55 }}>Status:</Text>
            {CAN.toggleStatus(role) ? (
              <Switch
                checked={record.status ==="ACTIVE"}
                onChange={(checked) => toggleAffairStatus(record, checked)}
                checkedChildren="Active"
                unCheckedChildren="Inactive"
                size="small"
              />
            ) : (
              <Tag color={record.status ==="ACTIVE" ?"success" :"default"} style={{ fontSize: 10 }}>
                {record.status ==="ACTIVE" ?"Active" :"Inactive"}
              </Tag>
            )}
          </Space>
          <Space>
            <Text type="secondary" style={{ fontSize: 11, minWidth: 55 }}>Approval:</Text>
            {CAN.approve(role) ? (
              <Switch
                checked={record.isApproved}
                onChange={(checked) => toggleAffairApproval(record, checked)}
                checkedChildren="Approved"
                unCheckedChildren="Pending"
                size="small"
                style={{ backgroundColor: record.isApproved ?'#52c41a' :'#faad14' }}
              />
            ) : (
              <Tag color={record.isApproved ?"success" :"warning"} style={{ fontSize: 10 }}>
                {record.isApproved ?"Approved" :"Pending"}
              </Tag>
            )}
          </Space>
        </Space>
      ),
    },
    {
      title:"Actions",
      width: 120,
      render: (_: any, record: CurrentAffair) => (
        <Space size={2}>
          {/* View  GET /:id */}
          <Tooltip title="View details">
            <Button
              icon={<EyeOutlined />}
              type="link"
              size="small"
              onClick={() => openViewModal(record)}
            />
          </Tooltip>

          {/* Edit  PUT /:id   ADMIN + TEACHER */}
          {CAN.edit(role) && (
            <Tooltip title="Edit">
              <Button
                icon={<EditOutlined />}
                type="link"
                size="small"
                onClick={() => openEditAffair(record)}
              />
            </Tooltip>
          )}

          {/* Delete  DELETE /:id   ADMIN only */}
          {CAN.delete(role) && (
            <Popconfirm
              title="Delete this current affair?"
              description="This action cannot be undone."
              okText="Delete"
              okButtonProps={{ danger: true }}
              onConfirm={() => deleteAffair(record._id)}
            >
              <Tooltip title="Delete">
                <Button icon={<DeleteOutlined />} type="link" size="small" danger />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  /* 
     TABLE COLUMNS  CATEGORIES
   */

  const categoryColumns = [
    {
      title:"Name",
      dataIndex:"name",
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title:"Slug",
      dataIndex:"slug",
      render: (s: string) => <Text code style={{ fontSize: 12 }}>{s}</Text>,
    },
    {
      title:"Description",
      dataIndex:"description",
      ellipsis: true,
      render: (d: string) => d || <Text type="secondary"></Text>,
    },
    {
      title:"Status",
      width: 140,
      render: (_: any, record: Category) =>
        CAN.manageCategories(role) ? (
          /* ADMIN: toggle  PUT /category/:id with { isActive } */
          <Switch
            checked={record.isActive}
            onChange={(checked) => toggleCategoryStatus(record, checked)}
            checkedChildren="Active"
            unCheckedChildren="Inactive"
            size="small"
          />
        ) : (
          <Tag color={record.isActive ?"green" :"red"}>
            {record.isActive ?"ACTIVE" :"INACTIVE"}
          </Tag>
        ),
    },
    /* Edit + Delete only for ADMIN */
    ...(CAN.manageCategories(role)
      ? [{
        title:"Actions",
        width: 100,
        render: (_: any, record: Category) => (
          <Space size={2}>
            {/* PUT /category/:id */}
            <Tooltip title="Edit type">
              <Button
                icon={<EditOutlined />}
                type="link"
                size="small"
                onClick={() => {
                  setSelectedCategory(record);
                  categoryForm.setFieldsValue({
                    name: record.name,
                    slug: record.slug,
                    description: record.description ||"",
                  });
                  setCategoryModalOpen(true);
                }}
              />
            </Tooltip>

            {/* DELETE /category/:id  backend rejects if affairs are linked */}
            <Popconfirm
              title="Delete this type?"
              description="Will fail if any affairs are linked to it."
              okText="Delete"
              okButtonProps={{ danger: true }}
              onConfirm={() => deleteCategory(record._id)}
            >
              <Tooltip title="Delete type">
                <Button icon={<DeleteOutlined />} type="link" size="small" danger />
              </Tooltip>
            </Popconfirm>
          </Space>
        ),
      }]
      : []),
  ];

  /* 
     RENDER
   */

  return (
    <Layout style={{ minHeight:"100vh" }}>
      {role ==="ADMIN" ? <Sidebar /> : <Sidebar2 />}
      <Layout>
        <Topbar />
        <Content style={{ margin: 24 }}>

          {/*  Page Header  */}
          <Row align="middle" justify="space-between" style={{ marginBottom: 20 }}>
            <Col>
              <Space align="center">
                <Avatar
                  style={{ background: role ==="ADMIN" ?"#f5222d" :"#1677ff" }}
                  icon={<UserOutlined />}
                />
                <div>
                  <Title level={4} style={{ margin: 0, lineHeight: 1.2 }}>
                    Current Affairs Management
                  </Title>
                  <Space size={6}>
                    <Text type="secondary">Welcome, {userName}</Text>
                    <RoleBadge role={role} />
                  </Space>
                </div>
              </Space>
            </Col>
            <Col>
              <Tooltip title="Refresh">
                <Button
                  icon={<ReloadOutlined />}
                  loading={loading}
                  onClick={() => { loadAffairs(); loadCategories(); }}
                >
                  Refresh
                </Button>
              </Tooltip>
            </Col>
          </Row>

          {/*  Teacher banner  */}
          {role ==="TEACHER" && (
            <Alert
              style={{ marginBottom: 16 }}
              type="info"
              showIcon
              icon={<LockOutlined />}
              message="Teacher Mode  Limited Access"
              description="You can create and edit current affairs. Status toggling, deleting records, and managing categories are reserved for Admins."
              closable
            />
          )}

          {/*  Admin Stats Cards  */}
          {CAN.viewStats(role) && (
            <Row gutter={16} style={{ marginBottom: 20 }}>
              {[
                { label:"Total Affairs", value: stats.total, icon: <FileTextOutlined />, color:"#1677ff" },
                { label:"Active (page)", value: stats.active, icon: <CheckCircleOutlined />, color:"#52c41a" },
                { label:"Inactive (page)", value: stats.inactive, icon: <CloseCircleOutlined />, color:"#ff4d4f" },
                { label:"Types", value: stats.categories, icon: <FolderOutlined />, color:"#722ed1" },
              ].map(({ label, value, icon, color }) => (
                <Col span={6} key={label}>
                  <Card size="small" style={{ borderTop: `3px solid ${color}`, borderRadius: 8 }}>
                    <Statistic
                      title={<Space>{icon}<Text style={{ fontSize: 13 }}>{label}</Text></Space>}
                      value={value}
                      valueStyle={{ color, fontWeight: 700 }}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          {/*  Tabs  */}
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            tabBarExtraContent={
              activeTab ==="affairs" ? (
                <Space wrap>
                  {/*  query param: search */}
                  <Input
                    placeholder="Search by title..."
                    prefix={<SearchOutlined />}
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    allowClear
                    style={{ width: 210 }}
                  />
                  {/*  query param: type */}
                  <Select
                    placeholder="All Categories"
                    allowClear
                    style={{ width: 140 }}
                    value={typeFilter}
                    onChange={(val) => { setTypeFilter(val); setCurrentPage(1); }}
                  >
                    {AFFAIR_TYPES.map(t => (
                      <Select.Option key={t} value={t}>
                        <Tag color={TYPE_COLOR[t]}>{t}</Tag>
                      </Select.Option>
                    ))}
                  </Select>
                </Space>
              ) : null
            }
          >

            {/*  Affairs Tab  */}
            <TabPane tab={<><FileTextOutlined /> Current Affairs</>} key="affairs">
              <Card bordered={false} bodyStyle={{ padding: 0 }}>
                {CAN.create(role) && (
                  <div style={{ padding:"16px 16px 0" }}>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={openNewAffair}
                      style={{ marginBottom: 16 }}
                    >
                      Add Current Affair
                    </Button>
                  </div>
                )}

                <Table
                  columns={affairColumns}
                  dataSource={affairs}
                  loading={loading}
                  rowKey="_id"
                  pagination={false}
                  scroll={{ x: 950 }}
                />

                <div style={{ padding:"12px 16px", textAlign:"right" }}>
                  <Pagination
                    current={currentPage}
                    total={totalAffairs}
                    pageSize={pageSize}
                    showSizeChanger
                    showTotal={(t) => `Total ${t} affairs`}
                    pageSizeOptions={["5","10","20","50"]}
                    onChange={(page, size) => {
                      setCurrentPage(page);
                      setPageSize(size ?? 10);
                    }}
                  />
                </div>
              </Card>
            </TabPane>

            {/*  Categories Tab  */}
            <TabPane tab={<><FolderOutlined /> Types</>} key="categories">
              <Card bordered={false}>
                {CAN.manageCategories(role) ? (
                  <Button
                    type="primary"
                    icon={<FolderAddOutlined />}
                    style={{ marginBottom: 16 }}
                    onClick={() => {
                      setSelectedCategory(null);
                      categoryForm.resetFields();
                      setCategoryModalOpen(true);
                    }}
                  >
                    Add Type
                  </Button>
                ) : (
                  <Alert
                    type="warning"
                    showIcon
                    message="Type management is restricted to Admins only."
                    style={{ marginBottom: 16 }}
                  />
                )}

                <Table
                  rowKey="_id"
                  dataSource={categories}
                  columns={categoryColumns}
                  loading={catLoading}
                  pagination={{ pageSize: 10, showTotal: (t) => `${t} categories` }}
                />
              </Card>
            </TabPane>

          </Tabs>
        </Content>
      </Layout>

      {/* 
          AFFAIR MODAL  Create / Edit
          POST /current-affairs/create  (multipart)
          PUT  /current-affairs/:id     (multipart)
          Multer fields: coverImage, pdfFile
       */}
      <Modal
        title={
          <Space>
            <FileTextOutlined />
            {selectedAffair ?"Edit Current Affair" :"Create Current Affair"}
            <RoleBadge role={role} />
          </Space>
        }
        open={affairModalOpen}
        onCancel={closeAffairModal}
        width={1020}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" form={form} onFinish={handleAffairSubmit}>
          <Tabs defaultActiveKey="basic">

            {/* Basic Info */}
            <TabPane tab=" Basic Info" key="basic">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="title"
                    label="Title"
                    rules={[{ required: true, message:"Title is required" }]}
                  >
                    <Input
                      placeholder="Enter affair title"
                      onChange={(e) => {
                        /* Auto-slug only on create, not edit */
                        if (!selectedAffair) {
                          form.setFieldValue("slug", toSlug(e.target.value));
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="slug"
                    label="Slug"
                    rules={[{ required: true, message:"Slug is required" }]}
                    extra={
                      selectedAffair
                        ?" Changing slug may break existing links."
                        :"Auto-generated from title"
                    }
                  >
                    <Input placeholder="url-friendly-slug" />
                  </Form.Item>
                </Col>

                <Col span={6}>
                  <Form.Item
                    name="type"
                    label="Category"
                    rules={[{ required: true, message:"Select a category" }]}
                  >
                    <Select placeholder="Select category">
                      {AFFAIR_TYPES.map(t => (
                        <Select.Option key={t} value={t}>
                          <Tag color={TYPE_COLOR[t]}>{t}</Tag>
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={6}>
                  <Form.Item
                    name="categoryId"
                    label="Type"
                    rules={[{ required: true, message:"Select a type" }]}
                  >
                    <Select placeholder="Select type" showSearch optionFilterProp="children">
                      {categories.map(c => (
                        <Select.Option
                          key={c._id}
                          value={c._id}
                          disabled={!c.isActive && selectedAffair?.categoryId?._id !== c._id}
                        >
                          <Space size={4}>
                            {c.name}
                            {!c.isActive && (
                              <Tag color="default" style={{ fontSize: 10 }}>Inactive</Tag>
                            )}
                          </Space>
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={6}>
                  <Form.Item name="publishDate" label="Publish Date">
                    <DatePicker style={{ width:"100%" }} format="DD MMM YYYY" />
                  </Form.Item>
                </Col>

                <Col span={6}>
                  <Form.Item name="rating" label="CSE Importance" initialValue={3}>
                    <Select placeholder="Select importance">
                      {[1, 2, 3, 4, 5].map(num => (
                        <Select.Option key={num} value={num}>
                          {num} Star{num > 1 ? "s" : ""}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="shortDescription" label="Short Description">
                <TextArea
                  rows={3}
                  placeholder="Brief overview shown in listings..."
                  showCount
                  maxLength={300}
                />
              </Form.Item>

              <Form.Item label="Full Content (Rich Editor)">
                <div style={{ border:'1px solid #d9d9d9', borderRadius: 6, minHeight: 300 }}>
                  <CkEditor
                    value={caContent}
                    onChange={(val: string) => setCaContent(val)}
                  />
                </div>
              </Form.Item>

              <Form.Item name="tags" label="Tags">
                <Select
                  mode="tags"
                  placeholder="Type a tag and press Enter"
                  tokenSeparators={[","]}
                  style={{ width:"100%" }}
                />
              </Form.Item>
            </TabPane>

            {/* Media */}
            <TabPane tab=" Media" key="media">
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item name="coverImage" label="Cover Image">
                    <Upload beforeUpload={() => false} maxCount={1} accept="image/*" listType="picture">
                      <Button icon={<UploadOutlined />}>Upload Cover Image</Button>
                    </Upload>
                  </Form.Item>
                  {/* Show existing file when editing */}
                  {selectedAffair?.coverImage && (
                    <Alert
                      type="info"
                      showIcon={false}
                      style={{ marginTop: 4, fontSize: 12 }}
                      message={
                        <Space style={{ width:'100%', justifyContent:'space-between' }}>
                          <Space>
                            <Text style={{ fontSize: 12 }}>Existing:</Text>
                            <a href={`${url}${selectedAffair.coverImage}`} target="_blank" rel="noreferrer">
                              <LinkOutlined /> View cover image
                            </a>
                            <Text type="secondary" style={{ fontSize: 11 }}>(upload to replace)</Text>
                          </Space>
                          <Popconfirm
                            title="Delete cover image?"
                            onConfirm={() => handleFileDelete("coverImage")}
                            okText="Yes"
                            cancelText="No"
                          >
                            <Button
                              type="text"
                              danger
                              size="small"
                              icon={<DeleteOutlined />}
                            />
                          </Popconfirm>
                        </Space>
                      }
                    />
                  )}
                </Col>

                <Col span={12}>
                  <Form.Item name="pdfFile" label="PDF File">
                    <Upload beforeUpload={() => false} maxCount={1} accept=".pdf">
                      <Button icon={<FilePdfOutlined />}>Upload PDF</Button>
                    </Upload>
                  </Form.Item>
                  {selectedAffair?.pdfFile && (
                    <Alert
                      type="info"
                      showIcon={false}
                      style={{ marginTop: 4, fontSize: 12 }}
                      message={
                        <Space style={{ width:'100%', justifyContent:'space-between' }}>
                          <Space>
                            <Text style={{ fontSize: 12 }}>Existing:</Text>
                            <a href={`${url}${selectedAffair.pdfFile}`} target="_blank" rel="noreferrer">
                              <FilePdfOutlined /> View PDF
                            </a>
                            <Text type="secondary" style={{ fontSize: 11 }}>(upload to replace)</Text>
                          </Space>
                          <Popconfirm
                            title="Delete PDF file?"
                            onConfirm={() => handleFileDelete("pdfFile")}
                            okText="Yes"
                            cancelText="No"
                          >
                            <Button
                              type="text"
                              danger
                              size="small"
                              icon={<DeleteOutlined />}
                            />
                          </Popconfirm>
                        </Space>
                      }
                    />
                  )}
                </Col>

                <Col span={12} style={{ marginTop: 8 }}>
                  <Form.Item name="pptFile" label="PPT / PPTX File">
                    <Upload
                      beforeUpload={() => false}
                      maxCount={1}
                      accept=".ppt,.pptx"
                      onChange={async (info) => {
                        const file = info.file;
                        if (!file) return;
                        const rawFile = file.originFileObj || file;
                        if (rawFile instanceof File) {
                          const hide = message.loading("Parsing PPT content...", 0);
                          try {
                            const formData = new FormData();
                            formData.append("pptFile", rawFile);
                            const res = await axios.post(`${url}/current-affairs/parse-ppt`, formData, {
                              headers: {
                                ...getAuthHeaders(),
                                "Content-Type": "multipart/form-data",
                              },
                            });
                            if (res.data?.success && res.data.text) {
                              setCaContent(res.data.text);
                              message.success("PPT parsed and loaded into full content!");
                            }
                          } catch (err: any) {
                            console.error(err);
                            message.error(err.response?.data?.message || "Failed to parse PPT file");
                          } finally {
                            hide();
                          }
                        }
                      }}
                    >
                      <Button icon={<FileOutlined />}>Upload PPT / PPTX</Button>
                    </Upload>
                  </Form.Item>
                  {(selectedAffair as any)?.pptFile && (
                    <Alert
                      type="info"
                      showIcon={false}
                      style={{ marginTop: 4, fontSize: 12 }}
                      message={
                        <Space style={{ width:'100%', justifyContent:'space-between' }}>
                          <Space>
                            <Text style={{ fontSize: 12 }}>Existing PPT uploaded</Text>
                            <Text type="secondary" style={{ fontSize: 11 }}>(upload to replace)</Text>
                          </Space>
                          <Popconfirm
                            title="Delete PPT file?"
                            onConfirm={() => handleFileDelete("pptFile")}
                            okText="Yes"
                            cancelText="No"
                          >
                            <Button
                              type="text"
                              danger
                              size="small"
                              icon={<DeleteOutlined />}
                            />
                          </Popconfirm>
                        </Space>
                      }
                    />
                  )}
                </Col>
              </Row>
            </TabPane>

            {/* SEO */}
            <TabPane tab=" SEO" key="seo">
              <Form.Item name={["seo","seo_title"]} label="SEO Title">
                <Input placeholder="Optimized title for search engines" showCount maxLength={60} />
              </Form.Item>
              <Form.Item name={["seo","meta_description"]} label="Meta Description">
                <TextArea
                  rows={3}
                  placeholder="Description shown in search results..."
                  showCount
                  maxLength={160}
                />
              </Form.Item>
              <Form.Item name={["seo","meta_keywords"]} label="Meta Keywords">
                <Input placeholder="keyword1, keyword2, keyword3" />
              </Form.Item>
            </TabPane>

          </Tabs>

          <Divider />

          <Row justify="end">
            <Space>
              <Button onClick={closeAffairModal}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {selectedAffair ?"Update Affair" :"Create Affair"}
              </Button>
            </Space>
          </Row>
        </Form>
      </Modal>

      {/* 
          CATEGORY MODAL  Admin only
          POST /current-affairs/category/create
          PUT  /current-affairs/category/:id
       */}
      {CAN.manageCategories(role) && (
        <Modal
          title={
            <Space>
              <FolderOutlined />
              {selectedCategory ?"Edit Type" :"Create Type"}
            </Space>
          }
          open={categoryModalOpen}
          onCancel={closeCategoryModal}
          footer={null}
          width={600}
          destroyOnClose
        >
          <Form layout="vertical" form={categoryForm} onFinish={handleCategorySubmit}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Type Name"
                  rules={[{ required: true, message:"Name is required" }]}
                >
                  <Input
                    placeholder="e.g. Economy"
                    onChange={(e) => {
                      if (!selectedCategory) {
                        categoryForm.setFieldValue("slug", toSlug(e.target.value));
                      }
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="slug"
                  label="Slug"
                  rules={[{ required: true, message:"Slug is required" }]}
                  extra={selectedCategory ?" Changing slug may break links." :"Auto-generated"}
                >
                  <Input placeholder="auto-generated-slug" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="description" label="Description">
              <TextArea rows={3} placeholder="Brief description of this type..." />
            </Form.Item>

            <Divider />

            <Row justify="end">
              <Space>
                <Button onClick={closeCategoryModal}>Cancel</Button>
                <Button type="primary" htmlType="submit">
                  {selectedCategory ?"Update Type" :"Create Type"}
                </Button>
              </Space>
            </Row>
          </Form>
        </Modal>
      )}

      {/* 
          VIEW MODAL
          GET /current-affairs/:id   { success, affair }
       */}
      <Modal
        title={<Space><EyeOutlined />Current Affair Details</Space>}
        open={viewModalOpen}
        onCancel={() => { setViewModalOpen(false); setViewAffair(null); }}
        width={760}
        destroyOnClose
        footer={
          CAN.edit(role) && viewAffair && !viewLoading ? (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                setViewModalOpen(false);
                openEditAffair(viewAffair);
              }}
            >
              Edit This Affair
            </Button>
          ) : null
        }
      >
        {viewLoading ? (
          <div style={{ textAlign:"center", padding: 48 }}>
            <Spin size="large" tip="Loading full details..." />
          </div>
        ) : viewAffair ? (
          <div>
            {/* Badges */}
            <Row gutter={[8, 8]} style={{ marginBottom: 12 }}>
              <Col>
                <Tag color={TYPE_COLOR[viewAffair.type] ||"default"} style={{ fontWeight: 600 }}>
                  {viewAffair.type}
                </Tag>
              </Col>
              <Col>
                <Tag
                  color={viewAffair.status ==="ACTIVE" ?"success" :"default"}
                  icon={viewAffair.status ==="ACTIVE" ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                >
                  {viewAffair.status}
                </Tag>
              </Col>
              {viewAffair.categoryId?.name && (
                <Col><Tag icon={<FolderOutlined />}>{viewAffair.categoryId.name}</Tag></Col>
              )}
            </Row>

            <Title level={4} style={{ marginTop: 4, marginBottom: 8 }}>{viewAffair.title}</Title>

            <Row gutter={24} style={{ marginBottom: 12 }}>
              <Col>
                <Space size={4}>
                  <CalendarOutlined style={{ color:"#8c8c8c" }} />
                  <Text type="secondary">{moment(viewAffair.publishDate).format("DD MMM YYYY")}</Text>
                </Space>
              </Col>
              {viewAffair.views !== undefined && (
                <Col>
                  <Space size={4}>
                    <EyeOutlined style={{ color:"#8c8c8c" }} />
                    <Text type="secondary">{(viewAffair.views || 0).toLocaleString()} views</Text>
                  </Space>
                </Col>
              )}
              <Col>
                <Text code style={{ fontSize: 11 }}>{viewAffair.slug}</Text>
              </Col>
            </Row>

            {/* Tags */}
            {viewAffair.tags && viewAffair.tags.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                {viewAffair.tags.map((t: string) => (
                  <Tag key={t} color="blue" style={{ marginBottom: 4 }}>{t}</Tag>
                ))}
              </div>
            )}

            {/* Short description */}
            {viewAffair.shortDescription && (
              <>
                <Divider orientation="left" orientationMargin={0}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Short Description</Text>
                </Divider>
                <Text>{viewAffair.shortDescription}</Text>
              </>
            )}

            {/* Full content */}
            {viewAffair.content && (
              <>
                <Divider orientation="left" orientationMargin={0}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Full Content</Text>
                </Divider>
                <div style={{
                  background:"#fafafa", padding: 12, borderRadius: 6,
                  whiteSpace:"pre-wrap", maxHeight: 280, overflowY:"auto",
                }}>
                  <Text>{viewAffair.content}</Text>
                </div>
              </>
            )}

            {/* Media links */}
            {(viewAffair.coverImage || viewAffair.pdfFile) && (
              <>
                <Divider orientation="left" orientationMargin={0}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Media</Text>
                </Divider>
                <Space>
                  {viewAffair.coverImage && (
                    <a href={`${url}${viewAffair.coverImage}`} target="_blank" rel="noreferrer">
                      <Button size="small" icon={<LinkOutlined />}>View Cover Image</Button>
                    </a>
                  )}
                  {viewAffair.pdfFile && (
                    <a href={`${url}${viewAffair.pdfFile}`} target="_blank" rel="noreferrer">
                      <Button size="small" icon={<FilePdfOutlined />}>View PDF</Button>
                    </a>
                  )}
                </Space>
              </>
            )}

            {/* SEO  Admin only */}
            {CAN.viewStats(role) && viewAffair.seo && Object.keys(viewAffair.seo).some(k => (viewAffair.seo as any)[k]) && (
              <>
                <Divider orientation="left" orientationMargin={0}>
                  <Text type="secondary" style={{ fontSize: 12 }}>SEO</Text>
                </Divider>
                <Row gutter={[8, 4]}>
                  {viewAffair.seo.seo_title && (
                    <Col span={24}>
                      <Text type="secondary">Title: </Text>
                      <Text>{viewAffair.seo.seo_title}</Text>
                    </Col>
                  )}
                  {viewAffair.seo.meta_description && (
                    <Col span={24}>
                      <Text type="secondary">Meta Desc: </Text>
                      <Text>{viewAffair.seo.meta_description}</Text>
                    </Col>
                  )}
                  {viewAffair.seo.meta_keywords && (
                    <Col span={24}>
                      <Text type="secondary">Keywords: </Text>
                      <Text code style={{ fontSize: 11 }}>{viewAffair.seo.meta_keywords}</Text>
                    </Col>
                  )}
                </Row>
              </>
            )}
          </div>
        ) : null}
      </Modal>

    </Layout>
  );
};

export default CurrentAffairsManagement;