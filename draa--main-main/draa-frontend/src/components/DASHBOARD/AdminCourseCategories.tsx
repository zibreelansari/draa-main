// frontend/src/pages/AdminCategoryManagement.tsx
import { useEffect, useState, useCallback, useMemo } from"react";
import {
  Typography,
  Card,
  Layout,
  Table,
  Modal,
  Tag,
  Space,
  Button,
  message,
  Popconfirm,
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  Tooltip,
  Row,
  Col,
  Badge,
  Divider,
  Alert,
  Empty,
  Avatar,
  Radio,
} from"antd";
import {
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  ExportOutlined,
  FilterOutlined,
  TagsOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  BookOutlined,
  UserOutlined,
  SearchOutlined,
  SaveOutlined,
  AppstoreOutlined,
  CrownOutlined,
  TeamOutlined,
} from"@ant-design/icons";
import axios from"axios";
import { useNavigate } from"react-router-dom";
import moment from"moment";
import Sidebar from"./Sidebar";
import Topbar from"./Topbar";
import url from"../../url";
import { getAuthHeaders } from"../../utils/global_auth";
import usePageTitle from '../../hooks/usePageTitle';

const { Content, Footer } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

//  Interfaces 

interface CourseCategory {
  _id: string;
  name: string;
  description?: string;
  slug: string;
  icon: string;
  color: string;
  keywords?: string[];
  isActive: boolean;
  order: number;
  courseCount: number;
  createdBy?: {
    _id: string;
    name?: string;
    tname?: string;
    aname?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Teacher {
  _id: string;
  tname: string;
  temail?: string;
  tspecialization?: string;
  tprofile?: string;
  Status?: string;
}

interface LoginUser {
  id?: string;
  aname?: string;
  aemail?: string;
}

//  Static data 

const ICON_OPTIONS = [
  { value:"bx bx-category", label:"Category" },
  { value:"bx bx-grid-alt", label:"Modules / Grid" },
  { value:"bx bx-layer", label:"Layers" },
  { value:"bx bx-collection", label:"Collection" },
  { value:"bx bx-bookmark", label:"Bookmark" },
  { value:"bx bx-code-alt", label:"Programming / Coding" },
  { value:"bx bx-terminal", label:"Terminal / CLI" },
  { value:"bx bx-bug", label:"Debugging" },
  { value:"bx bx-server", label:"Server / Backend" },
  { value:"bx bx-cloud", label:"Cloud Computing" },
  { value:"bx bx-chip", label:"Computer Architecture" },
  { value:"bx bx-brain", label:"Artificial Intelligence" },
  { value:"bx bx-bot", label:"Machine Learning / Bots" },
  { value:"bx bx-data", label:"Data Science / Database" },
  { value:"bx bx-analyse", label:"Data Analysis" },
  { value:"bx bx-shield-quarter", label:"Cyber Security" },
  { value:"bx bx-lock-alt", label:"Ethical Hacking" },
  { value:"bx bx-network-chart", label:"Networking" },
  { value:"bx bx-cog", label:"System Engineering" },
  { value:"bx bx-wrench", label:"Mechanical Engineering" },
  { value:"bx bx-buildings", label:"Civil Engineering" },
  { value:"bx bx-bolt-circle", label:"Electrical Engineering" },
  { value:"bx bx-car", label:"Automobile Engineering" },
  { value:"bx bx-hard-hat", label:"Industrial Engineering" },
  { value:"bx bx-plus-medical", label:"Medical" },
  { value:"bx bx-pulse", label:"Physiology" },
  { value:"bx bx-capsule", label:"Pharmacy" },
  { value:"bx bx-dna", label:"Biotechnology" },
  { value:"bx bx-test-tube", label:"Chemistry" },
  { value:"bx bx-flask", label:"Laboratory" },
  { value:"bx bx-book", label:"Books" },
  { value:"bx bx-book-open", label:"Study Material" },
  { value:"bx bx-notepad", label:"Notes" },
  { value:"bx bx-chalkboard", label:"Classroom" },
  { value:"bx bx-graduation", label:"Graduation" },
  { value:"bx bx-award", label:"Certification" },
  { value:"bx bx-atom", label:"Physics" },
  { value:"bx bx-calculator", label:"Mathematics" },
  { value:"bx bx-math", label:"Advanced Mathematics" },
  { value:"bx bx-line-chart", label:"Statistics" },
  { value:"bx bx-bank", label:"Banking" },
  { value:"bx bx-rupee", label:"Indian Economy" },
  { value:"bx bx-wallet", label:"Finance" },
  { value:"bx bx-money", label:"Accounting" },
  { value:"bx bx-trending-up", label:"Stock Market" },
  { value:"bx bx-briefcase-alt", label:"Law" },
  { value:"bx bx-balance", label:"Judiciary / Court" },
  { value:"bx bx-gavel", label:"Legal Practice" },
  { value:"bx bx-landmark", label:"UPSC" },
  { value:"bx bx-train", label:"Railway Exams" },
  { value:"bx bx-flag", label:"State PSC" },
  { value:"bx bx-palette", label:"UI / UX Design" },
  { value:"bx bx-image", label:"Graphic Design" },
  { value:"bx bx-video", label:"Video Editing" },
  { value:"bx bx-camera", label:"Photography" },
  { value:"bx bx-bullhorn", label:"Digital Marketing" },
  { value:"bx bx-search-alt", label:"SEO" },
  { value:"bx bx-globe", label:"International Studies" },
  { value:"bx bx-map", label:"Geography" },
];

const COLOR_OPTIONS = [
  { hex:"#007bff", name:"Blue" },
  { hex:"#28a745", name:"Green" },
  { hex:"#dc3545", name:"Red" },
  { hex:"#ffc107", name:"Yellow" },
  { hex:"#17a2b8", name:"Cyan" },
  { hex:"#6f42c1", name:"Purple" },
  { hex:"#fd7e14", name:"Orange" },
  { hex:"#20c997", name:"Teal" },
  { hex:"#e83e8c", name:"Pink" },
  { hex:"#6c757d", name:"Gray" },
  { hex:"#343a40", name:"Dark" },
  { hex:"#f8f9fa", name:"Light" },
];

const KEYWORD_SUGGESTIONS = [
"class 11","class 12","dropper","dropout","beginner",
"intermediate","advanced","jee","jee main","jee advanced",
"neet","neet ug","foundation","boards","cbse","icse",
"state board","competitive exam","entrance exam","olympiad",
];

//  Component 

const AdminCategoryManagement = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [loginUser, setLoginUser] = useState<LoginUser | null>(null);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"add" |"edit">("add");
  const [editingCategory, setEditingCategory] = useState<CourseCategory | null>(null);
  const [detailModalCat, setDetailModalCat] = useState<CourseCategory | null>(null);

  //"creating for admin" or"creating for teacher"  controls teacher picker visibility
  const [creatingFor, setCreatingFor] = useState<"admin" |"teacher">("admin");

  // filters
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [creatorFilter, setCreatorFilter] = useState("all");
  const [teacherFilter, setTeacherFilter] = useState("all");

  //  Auth 
  useEffect(() => {
    const raw = localStorage.getItem("edudocs");
    if (!raw) { message.warning("Not logged in!", 5); navigate("/admin-login"); return; }
    try {
      const user = JSON.parse(raw);
      if (!user.aname) { message.error("Admin access required."); navigate("/admin-login"); return; }
      setLoginUser(user);
    } catch {
      message.error("Invalid session."); navigate("/admin-login");
    }
  }, [navigate]);

  //  Fetch Teachers (same pattern as ManageTeachers) 
  const fetchTeachers = useCallback(async () => {
    setTeachersLoading(true);
    try {
      const res = await axios.get(`${url}/updateTeacherStatus/all`, {
        headers: {
          ...getAuthHeaders()
        }
      });
      if (res.data.success && res.data.data?.teachers) {
        // Only approved teachers appear in the dropdown
        setTeachers(res.data.data.teachers.filter((t: Teacher) => t.Status ==="approved"));
        return;
      }
      throw new Error("fallback");
    } catch {
      try {
        const fb = await axios.get(`${url}/count/getAllTeachers`, {
          headers: {
            ...getAuthHeaders()
          }
        });
        setTeachers(fb.data.Teachers || []);
      } catch {
        try {
          const fb2 = await axios.get(`${url}/allteachersName`, {
            headers: {
              ...getAuthHeaders()
            }
          });
          setTeachers(fb2.data.teachers || []);
        } catch { console.warn("Could not load teachers"); }
      }
    } finally {
      setTeachersLoading(false);
    }
  }, []);

  //  Fetch Categories 
  const fetchCategories = useCallback(async () => {
    if (!loginUser?.id) return;
    setLoading(true);
    try {
      const res = await axios.get(`${url}/course/categories?includeCount=true`, {
        headers: {
          ...getAuthHeaders()
        }
      });
      setCategories(res.data.data?.categories || []);
    } catch (e: any) {
      message.error(e.response?.data?.message ||"Failed to fetch categories.");
    } finally {
      setLoading(false);
    }
  }, [loginUser?.id]);

  useEffect(() => {
    if (loginUser?.id) { fetchCategories(); fetchTeachers(); }
  }, [loginUser?.id, fetchCategories, fetchTeachers]);

  //  Derived / filtered 
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const s = searchText.toLowerCase();
      const matchSearch =
        cat.name.toLowerCase().includes(s) ||
        cat.description?.toLowerCase().includes(s) ||
        cat.slug?.toLowerCase().includes(s) ||
        cat.keywords?.some((k) => k.toLowerCase().includes(s)) ||
        cat.createdBy?.tname?.toLowerCase().includes(s) ||
        cat.createdBy?.aname?.toLowerCase().includes(s);
      const matchStatus = statusFilter ==="all" || (statusFilter ==="active" ? cat.isActive : !cat.isActive);
      const matchCreator = creatorFilter ==="all" || (creatorFilter ==="admin" ? !!cat.createdBy?.aname : !!cat.createdBy?.tname);
      const matchTeacher = teacherFilter ==="all" || cat.createdBy?._id === teacherFilter;
      return matchSearch && matchStatus && matchCreator && matchTeacher;
    });
  }, [categories, searchText, statusFilter, creatorFilter, teacherFilter]);

  const isFilterActive = searchText !=="" || statusFilter !=="all" || creatorFilter !=="all" || teacherFilter !=="all";

  const stats = useMemo(() => ({
    total: categories.length,
    active: categories.filter((c) => c.isActive).length,
    inactive: categories.filter((c) => !c.isActive).length,
    totalCourses: categories.reduce((s, c) => s + (c.courseCount || 0), 0),
    adminCreated: categories.filter((c) => c.createdBy?.aname).length,
    teacherCreated: categories.filter((c) => c.createdBy?.tname).length,
  }), [categories]);

  // Teachers who actually have categories (for filter dropdown)
  const teachersInCategories = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => { if (c.createdBy?.tname && c.createdBy?._id) map.set(c.createdBy._id, c.createdBy.tname); });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [categories]);

  //  Open Add 
  const openAddModal = () => {
    setModalMode("add");
    setEditingCategory(null);
    setCreatingFor("admin");
    form.resetFields();
    form.setFieldsValue({ icon:"bx bx-category", color:"#007bff", order: 0, isActive: true, keywords: [], creatingFor:"admin" });
    setModalVisible(true);
  };

  //  Open Edit 
  const openEditModal = (cat: CourseCategory) => {
    setModalMode("edit");
    setEditingCategory(cat);
    const wasTeacher = !!cat.createdBy?.tname;
    setCreatingFor(wasTeacher ?"teacher" :"admin");
    form.setFieldsValue({
      ...cat,
      keywords: cat.keywords || [],
      creatingFor: wasTeacher ?"teacher" :"admin",
      assignedTeacher: wasTeacher ? cat.createdBy?._id : undefined,
    });
    setModalVisible(true);
  };

  //  Submit 
  const handleSubmit = async (values: any) => {
    setFormSubmitting(true);
    // If admin is creating for a teacher  use teacher's ID as createdBy
    const createdById =
      values.creatingFor ==="teacher" && values.assignedTeacher
        ? values.assignedTeacher
        : loginUser?.id;

    const payload = {
      name: values.name,
      description: values.description,
      icon: values.icon,
      color: values.color,
      order: values.order || 0,
      isActive: values.isActive !== undefined ? values.isActive : true,
      keywords: values.keywords || [],
      createdBy: createdById,
      updatedBy: loginUser?.id,
    };
    try {
      if (modalMode ==="edit" && editingCategory) {
        await axios.put(`${url}/course/categories/${editingCategory._id}`, payload, {
          headers: {
            ...getAuthHeaders()
          }
        });
        message.success(" Category updated!");
      } else {
        await axios.post(`${url}/course/categories`, payload, {
          headers: {
            ...getAuthHeaders()
          }
        });
        const forWhom = values.creatingFor ==="teacher" && values.assignedTeacher
          ? `for ${teachers.find((t) => t._id === values.assignedTeacher)?.tname}`
          :"for Admin";
        message.success(` Category created ${forWhom}!`);
      }
      setModalVisible(false);
      form.resetFields();
      setEditingCategory(null);
      fetchCategories();
    } catch (err: any) {
      message.error(err.response?.data?.message ||" Error saving category.");
    } finally {
      setFormSubmitting(false);
    }
  };

  //  Delete 
  const handleDelete = async (id: string, name: string) => {
    setActionLoading(id);
    try {
      const response = await axios.delete(`${url}/course/categories/${id}`, {
        headers: {
          ...getAuthHeaders()
        }
      });
      if (response.data.success !== false) {
        message.success(`"${name}" deleted`);
        setCategories((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (e: any) {
      if (e?.response?.status === 400) {
        message.error(e?.response?.data?.message ||"Cannot delete: This category has associated courses. Please delete courses first.");
      } else {
        message.error(e?.response?.data?.message ||"Failed to delete");
      }
    } finally {
      setActionLoading(null);
    }
  };

  //  Toggle Active 
  const handleToggleActive = async (cat: CourseCategory) => {
    setActionLoading(cat._id);
    try {
      await axios.put(`${url}/course/categories/${cat._id}`, { ...cat, isActive: !cat.isActive, updatedBy: loginUser?.id }, {
        headers: {
          ...getAuthHeaders()
        }
      });
      message.success(`"${cat.name}" ${!cat.isActive ?"activated" :"deactivated"}`);
      setCategories((prev) => prev.map((c) => c._id === cat._id ? { ...c, isActive: !c.isActive } : c));
    } catch (e: any) {
      if (e?.response?.status === 400) {
        message.error(e?.response?.data?.message ||"Cannot deactivate: This category has associated courses.");
      } else {
        message.error("Failed to update status");
      }
    } finally { setActionLoading(null); }
  };

  //  Export 
  const handleExport = () => {
    const headers = ["Name","Slug","Description","Keywords","Icon","Color","Order","Courses","Status","Created By","Creator Role","Created At"];
    const rows = filteredCategories.map((c) => [
      `"${c.name}"`, c.slug, `"${c.description ||""}"`,
      `"${(c.keywords || []).join(",")}"`, c.icon, c.color, c.order, c.courseCount,
      c.isActive ?"Active" :"Inactive",
      `"${c.createdBy?.aname || c.createdBy?.tname ||"Unknown"}"`,
      c.createdBy?.aname ?"Admin" :"Teacher",
      moment(c.createdAt).format("YYYY-MM-DD"),
    ].join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type:"text/csv" });
    const dl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = dl; a.download = `categories-${moment().format("YYYY-MM-DD")}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    window.URL.revokeObjectURL(dl);
    message.success("Exported!");
  };

  const clearFilters = () => { setSearchText(""); setStatusFilter("all"); setCreatorFilter("all"); setTeacherFilter("all"); };

  //  Columns 
  const columns = [
    {
      title:"#",
      dataIndex:"order",
      key:"order",
      width: 60,
      sorter: (a: CourseCategory, b: CourseCategory) => a.order - b.order,
      render: (order: number) => (
        <Tag style={{ fontWeight: 700, fontSize: 11, background:"#f0f5ff", borderColor:"#adc6ff", color:"#2f54eb", margin: 0 }}>#{order}</Tag>
      ),
    },
    {
      title:"Category",
      key:"name",
      width: 230,
      render: (_: any, record: CourseCategory) => (
        <div style={{ display:"flex", alignItems:"center", gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: record.color +"18", border: `2px solid ${record.color}33`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink: 0 }}>
            <i className={record.icon} style={{ color: record.color, fontSize: 17 }} />
          </div>
          <div>
            <Text strong style={{ fontSize: 13, color:"#1677ff", cursor:"pointer", display:"block" }} onClick={() => setDetailModalCat(record)}>
              {record.name}
            </Text>
            <Text type="secondary" style={{ fontSize: 11 }}>/{record.slug}</Text>
          </div>
        </div>
      ),
    },
    {
      title:"Description",
      dataIndex:"description",
      key:"description",
      ellipsis: true,
      render: (text: string) => text
        ? <Tooltip title={text}><Text style={{ fontSize: 12 }}>{text.length > 50 ? text.substring(0, 50) +"" : text}</Text></Tooltip>
        : <Text type="secondary" style={{ fontSize: 11, fontStyle:"italic" }}>No description</Text>,
    },
    {
      title: <Space><TagsOutlined />Keywords</Space>,
      key:"keywords",
      width: 200,
      render: (_: any, record: CourseCategory) =>
        record.keywords && record.keywords.length > 0 ? (
          <div>
            {record.keywords.slice(0, 3).map((k, i) => <Tag key={i} color="blue" style={{ marginBottom: 3, fontSize: 10 }}>{k}</Tag>)}
            {record.keywords.length > 3 && (
              <Tooltip title={record.keywords.slice(3).join(",")}>
                <Tag color="purple" style={{ fontSize: 10 }}>+{record.keywords.length - 3}</Tag>
              </Tooltip>
            )}
          </div>
        ) : <Text type="secondary" style={{ fontSize: 11, fontStyle:"italic" }}>None</Text>,
    },
    {
      title:"Courses",
      dataIndex:"courseCount",
      key:"courseCount",
      width: 80,
      align:"center" as const,
      sorter: (a: CourseCategory, b: CourseCategory) => a.courseCount - b.courseCount,
      render: (count: number) => <Badge count={count} style={{ background: count > 0 ?"#1677ff" :"#d9d9d9", boxShadow:"none" }} showZero />,
    },
    {
      title:"Assigned To",
      key:"creator",
      width: 170,
      render: (_: any, record: CourseCategory) => {
        const isAdmin = !!record.createdBy?.aname;
        const name = record.createdBy?.aname || record.createdBy?.tname || record.createdBy?.name ||"Unknown";
        const teacherObj = isAdmin ? null : teachers.find((t) => t._id === record.createdBy?._id);
        return (
          <Space size={8} align="center">
            <Avatar
              src={teacherObj?.tprofile}
              icon={isAdmin ? <CrownOutlined /> : <UserOutlined />}
              size={28}
              style={{ background: isAdmin ?"#1677ff" :"#52c41a", flexShrink: 0 }}
            />
            <div>
              <Text style={{ fontSize: 12, display:"block", fontWeight: 600 }}>{name}</Text>
              <Tag color={isAdmin ?"blue" :"green"} style={{ fontSize: 10, padding:"0 4px", lineHeight:"16px", margin: 0 }}>
                {isAdmin ?"Admin" :"Teacher"}
              </Tag>
              {!isAdmin && teacherObj?.tspecialization && (
                <Text type="secondary" style={{ fontSize: 10, display:"block" }}>{teacherObj.tspecialization}</Text>
              )}
            </div>
          </Space>
        );
      },
    },
    {
      title:"Status",
      key:"status",
      width: 100,
      render: (_: any, record: CourseCategory) => (
        <Switch
          checked={record.isActive}
          onChange={() => handleToggleActive(record)}
          loading={actionLoading === record._id}
          checkedChildren="On"
          unCheckedChildren="Off"
          size="small"
          style={{ background: record.isActive ?"#52c41a" : undefined }}
        />
      ),
    },
    {
      title:"Created",
      key:"date",
      width: 95,
      render: (_: any, record: CourseCategory) => <Text style={{ fontSize: 11 }}>{moment(record.createdAt).format("DD MMM YY")}</Text>,
    },
    {
      title:"Actions",
      key:"actions",
      width: 120,
      fixed:"right" as const,
      render: (_: any, record: CourseCategory) => (
        <Space size={4}>
          <Tooltip title="View Details">
            <Button type="text" icon={<EyeOutlined />} size="small" onClick={() => setDetailModalCat(record)} />
          </Tooltip>
          <Tooltip title="Edit">
            <Button type="text" icon={<EditOutlined />} size="small" style={{ color:"#1677ff" }} onClick={() => openEditModal(record)} />
          </Tooltip>
          <Popconfirm
            title="Delete Category"
            description={record.courseCount > 0 ? ` ${record.courseCount} course(s) use this category.` : `Delete"${record.name}"? Cannot be undone.`}
            onConfirm={() => record.courseCount === 0 && handleDelete(record._id, record.name)}
            okText="Delete"
            cancelText="Cancel"
            okType="danger"
            disabled={record.courseCount > 0}
          >
            <Tooltip title={record.courseCount > 0 ? `${record.courseCount} courses using this` :"Delete"}>
              <Button danger type="text" icon={<DeleteOutlined />} size="small" disabled={record.courseCount > 0} loading={actionLoading === record._id} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  //  Guard 
  if (!loginUser?.aname) {
    return (
      <Layout style={{ minHeight:"100vh" }}>
        <Content style={{ display:"flex", justifyContent:"center", alignItems:"center" }}>
          <Card><Text>Verifying admin permissions...</Text></Card>
        </Content>
      </Layout>
    );
  }

  //  Render 
  return (
    <Layout style={{ minHeight:"100vh", background:"#f0f2f5" }}>
      <Sidebar />
      <Layout>
        <Topbar />
        <Content style={{ margin:"20px 16px", padding: 24 }}>

          {/* Header */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom: 24, flexWrap:"wrap", gap: 12 }}>
            <div>
              <Title level={2} style={{ margin: 0, color:"#1677ff" }}>
                <AppstoreOutlined style={{ marginRight: 10 }} />Category Management
              </Title>
              <Text type="secondary">Create categories for Admin or assign directly to a specific teacher</Text>
            </div>
            <Space wrap>
              <Button icon={<ReloadOutlined />} onClick={fetchCategories} loading={loading}>Refresh</Button>
              <Button icon={<ExportOutlined />} onClick={handleExport}>Export</Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal} style={{ background:"#1677ff" }}>
                Add Category
              </Button>
            </Space>
          </div>

          {/* Stats */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {[
              { title:"Total Categories", value: stats.total, icon: <AppstoreOutlined />, color:"#1677ff", sub:"All categories" },
              { title:"Active", value: stats.active, icon: <CheckCircleOutlined />, color:"#52c41a", sub: `${stats.inactive} inactive` },
              { title:"Total Courses", value: stats.totalCourses, icon: <BookOutlined />, color:"#722ed1", sub:"Across all categories" },
              { title:"Admin Created", value: stats.adminCreated, icon: <CrownOutlined />, color:"#1677ff", sub: `${stats.teacherCreated} teacher-assigned` },
            ].map((s) => (
              <Col xs={24} sm={12} lg={6} key={s.title}>
                <Card bordered={false} style={{ borderRadius: 12, boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: s.color +"18", display:"flex", alignItems:"center", justifyContent:"center", fontSize: 20, color: s.color }}>
                      {s.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color:"#8c8c8c" }}>{s.title}</div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: s.color, lineHeight: 1.2 }}>{s.value}</div>
                      <div style={{ fontSize: 11, color:"#bfbfbf" }}>{s.sub}</div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Filters */}
          <Card bordered={false} style={{ marginBottom: 16, borderRadius: 12, boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
            <Row gutter={[12, 12]} align="middle">
              <Col xs={24} sm={8} lg={7}>
                <Search
                  placeholder="Search name, slug, keywords, teacher..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  prefix={<SearchOutlined style={{ color:"#bfbfbf" }} />}
                />
              </Col>
              <Col xs={12} sm={4} lg={3}>
                <Select value={statusFilter} onChange={setStatusFilter} style={{ width:"100%" }}>
                  <Option value="all">All Status</Option>
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                </Select>
              </Col>
              <Col xs={12} sm={4} lg={3}>
                <Select
                  value={creatorFilter}
                  onChange={(v) => { setCreatorFilter(v); if (v !=="teacher") setTeacherFilter("all"); }}
                  style={{ width:"100%" }}
                >
                  <Option value="all">All Creators</Option>
                  <Option value="admin"><CrownOutlined /> Admin</Option>
                  <Option value="teacher"><TeamOutlined /> Teacher</Option>
                </Select>
              </Col>
              {/* Teacher drill-down  only when creator = teacher */}
              {creatorFilter ==="teacher" && (
                <Col xs={12} sm={5} lg={4}>
                  <Select
                    value={teacherFilter}
                    onChange={setTeacherFilter}
                    style={{ width:"100%" }}
                    placeholder="Filter by teacher"
                    showSearch
                    optionFilterProp="children"
                  >
                    <Option value="all">All Teachers</Option>
                    {teachersInCategories.map((t) => (
                      <Option key={t.id} value={t.id}>{t.name}</Option>
                    ))}
                  </Select>
                </Col>
              )}
              <Col xs={12} sm={4} lg={3}>
                <Button icon={<FilterOutlined />} onClick={clearFilters} disabled={!isFilterActive} block>Clear</Button>
              </Col>
            </Row>
          </Card>

          {isFilterActive && (
            <Alert
              message={`Showing ${filteredCategories.length} of ${categories.length} categories`}
              type="info" showIcon closable={false}
              style={{ marginBottom: 12, borderRadius: 8 }}
            />
          )}

          {/* Table */}
          <Card
            title={<Space><TagsOutlined style={{ color:"#1677ff" }} /><Text strong>Category List</Text><Badge count={filteredCategories.length} style={{ background:"#1677ff" }} showZero /></Space>}
            bordered={false}
            style={{ borderRadius: 12, boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}
          >
            <Table
              columns={columns}
              dataSource={filteredCategories}
              rowKey="_id"
              loading={loading}
              bordered={false}
              scroll={{ x: 1300 }}
              pagination={{ pageSize: 15, showSizeChanger: true, showQuickJumper: true, pageSizeOptions: ["10","15","30","50"], showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}` }}
              size="small"
              locale={{
                emptyText: loading ?"Loading..." : (
                  <Empty description="No categories found" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                    <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>Create First Category</Button>
                  </Empty>
                ),
              }}
            />
          </Card>

          {/* 
              ADD / EDIT MODAL
           */}
          <Modal
            title={
              <Space>
                {modalMode ==="add" ? <PlusOutlined style={{ color:"#1677ff" }} /> : <EditOutlined style={{ color:"#fa8c16" }} />}
                <Text strong style={{ fontSize: 16 }}>
                  {modalMode ==="add" ?"Add New Category" : `Edit: ${editingCategory?.name}`}
                </Text>
              </Space>
            }
            open={modalVisible}
            onCancel={() => { setModalVisible(false); setEditingCategory(null); form.resetFields(); }}
            width={720}
            footer={
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {modalMode ==="add" ?"Fill required fields to create" :"Edit and save changes"}
                </Text>
                <Space>
                  <Button onClick={() => { setModalVisible(false); form.resetFields(); }}>Cancel</Button>
                  <Button type="primary" icon={modalMode ==="add" ? <PlusOutlined /> : <SaveOutlined />} loading={formSubmitting} onClick={() => form.submit()}>
                    {modalMode ==="add" ?"Create Category" :"Save Changes"}
                  </Button>
                </Space>
              </div>
            }
            destroyOnClose
            styles={{ body: { padding:"16px 24px", maxHeight:"72vh", overflowY:"auto" } }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{ icon:"bx bx-category", color:"#007bff", order: 0, isActive: true, keywords: [], creatingFor:"admin" }}
            >

              {/*  WHO IS THIS FOR?  */}
              <div
                style={{
                  background:"linear-gradient(135deg, #e6f4ff, #f0f5ff)",
                  border:"1.5px solid #91caff",
                  borderRadius: 10,
                  padding:"16px 18px",
                  marginBottom: 20,
                }}
              >
                <Text strong style={{ display:"block", marginBottom: 12, fontSize: 14, color:"#1677ff" }}>
                  <TeamOutlined style={{ marginRight: 6 }} />
                  Create this category for:
                </Text>

                <Form.Item name="creatingFor" style={{ marginBottom: 14 }}>
                  <Radio.Group
                    onChange={(e) => {
                      setCreatingFor(e.target.value);
                      if (e.target.value ==="admin") form.setFieldValue("assignedTeacher", undefined);
                    }}
                    buttonStyle="solid"
                    size="middle"
                  >
                    <Radio.Button value="admin">
                      <Space><CrownOutlined />Admin (Me)</Space>
                    </Radio.Button>
                    <Radio.Button value="teacher">
                      <Space><TeamOutlined />Specific Teacher</Space>
                    </Radio.Button>
                  </Radio.Group>
                </Form.Item>

                {creatingFor ==="teacher" ? (
                  <Form.Item
                    name="assignedTeacher"
                    label={<Text strong>Select Teacher</Text>}
                    rules={[{ required: true, message:"Please select a teacher" }]}
                    style={{ marginBottom: 0 }}
                    extra="The category will appear in this teacher's category list and they can assign it to their courses."
                  >
                    <Select
                      placeholder="Search teacher by name or specialization..."
                      showSearch
                      loading={teachersLoading}
                      optionFilterProp="label"
                      filterOption={(input, option) =>
                        String(option?.label).toLowerCase().includes(input.toLowerCase())
                      }
                      optionLabelProp="label"
                      size="large"
                      notFoundContent={teachersLoading ?"Loading teachers..." :"No approved teachers found"}
                    >
                      {teachers.map((t) => (
                        <Option key={t._id} value={t._id} label={t.tname}>
                          <div style={{ display:"flex", alignItems:"center", gap: 10, padding:"4px 0" }}>
                            <Avatar
                              src={t.tprofile}
                              icon={<UserOutlined />}
                              size={32}
                              style={{ background:"#52c41a", flexShrink: 0 }}
                            />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600, fontSize: 13 }}>{t.tname}</div>
                              {t.tspecialization && (
                                <div style={{ fontSize: 11, color:"#8c8c8c" }}>{t.tspecialization}</div>
                              )}
                              {t.temail && (
                                <div style={{ fontSize: 11, color:"#bfbfbf" }}>{t.temail}</div>
                              )}
                            </div>
                            <Tag color="green" style={{ fontSize: 10, flexShrink: 0 }}>Approved</Tag>
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                ) : (
                  <Alert
                    message="This category will be owned by Admin and visible across all courses on the platform."
                    type="info"
                    showIcon
                    style={{ marginBottom: 0 }}
                  />
                )}
              </div>

              <Divider style={{ margin:"0 0 16px" }} />

              {/*  CATEGORY DETAILS  */}
              <Form.Item
                label="Category Name"
                name="name"
                rules={[
                  { required: true, message:"Please enter category name" },
                  { max: 100, message:"Must be less than 100 characters" },
                ]}
              >
                <Input size="large" placeholder="e.g., JEE Advanced Physics, Web Development" />
              </Form.Item>

              <Form.Item
                label="Description"
                name="description"
                rules={[{ max: 500, message:"Must be less than 500 characters" }]}
              >
                <TextArea rows={3} placeholder="Brief description of the category..." showCount maxLength={500} />
              </Form.Item>

              {/* Keywords */}
              <Form.Item
                label={
                  <Space>
                    <TagsOutlined />Keywords
                    <Tooltip title="Add keywords so students can find courses via search. Press Enter or comma to add.">
                      <InfoCircleOutlined style={{ color:"#1677ff" }} />
                    </Tooltip>
                  </Space>
                }
                name="keywords"
                rules={[{
                  validator: (_, value) => {
                    if (value?.some((k: string) => k.length > 50)) return Promise.reject("Each keyword  50 chars");
                    if (value?.length > 20) return Promise.reject("Max 20 keywords");
                    return Promise.resolve();
                  },
                }]}
              >
                <Select
                  mode="tags"
                  size="large"
                  placeholder="Type keyword + Enter (e.g., class 11, JEE)"
                  tokenSeparators={[","]}
                  maxTagCount="responsive"
                  style={{ width:"100%" }}
                >
                  {KEYWORD_SUGGESTIONS.map((k) => (
                    <Option key={k} value={k}><Space><TagsOutlined />{k}</Space></Option>
                  ))}
                </Select>
              </Form.Item>

              <Divider style={{ margin:"12px 0" }} />

              {/* Icon + Color + Order */}
              <Row gutter={12}>
                <Col span={10}>
                  <Form.Item label="Icon" name="icon" rules={[{ required: true }]}>
                    <Select
                      size="large"
                      showSearch
                      placeholder="Search icon..."
                      optionFilterProp="label"
                      filterOption={(input, option) =>
                        option?.label?.toLowerCase().includes(input.toLowerCase()) ||
                        option?.value?.toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {ICON_OPTIONS.map((icon) => (
                        <Option key={icon.value} value={icon.value} label={icon.label}>
                          <Space><i className={icon.value} style={{ fontSize: 16 }} /><span>{icon.label}</span></Space>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Color" name="color" rules={[{ required: true }]}>
                    <Select size="large" placeholder="Choose color">
                      {COLOR_OPTIONS.map((c) => (
                        <Option key={c.hex} value={c.hex}>
                          <Space>
                            <div style={{ width: 16, height: 16, borderRadius:"50%", background: c.hex, border:"1px solid #ddd" }} />
                            {c.name}
                          </Space>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Order" name="order" tooltip="Lower = appears first">
                    <InputNumber min={0} max={1000} size="large" style={{ width:"100%" }} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Status" name="isActive" valuePropName="checked" tooltip="Inactive categories won't appear to students">
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" defaultChecked style={{ background:"#52c41a" }} />
              </Form.Item>
            </Form>
          </Modal>

          {/* 
              DETAIL VIEW MODAL
           */}
          <Modal
            title={
              detailModalCat && (
                <Space>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: detailModalCat.color +"18", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <i className={detailModalCat.icon} style={{ color: detailModalCat.color, fontSize: 16 }} />
                  </div>
                  <Text strong>{detailModalCat.name}</Text>
                </Space>
              )
            }
            open={!!detailModalCat}
            onCancel={() => setDetailModalCat(null)}
            width={540}
            footer={
              <Space>
                <Button type="primary" icon={<EditOutlined />} onClick={() => { setDetailModalCat(null); openEditModal(detailModalCat!); }}>
                  Edit Category
                </Button>
                <Button onClick={() => setDetailModalCat(null)}>Close</Button>
              </Space>
            }
          >
            {detailModalCat && (() => {
              const isAdmin = !!detailModalCat.createdBy?.aname;
              const teacherObj = isAdmin ? null : teachers.find((t) => t._id === detailModalCat.createdBy?._id);
              return (
                <div>
                  {/* Color header */}
                  <div style={{ background: `linear-gradient(135deg, ${detailModalCat.color}22, ${detailModalCat.color}08)`, border: `1px solid ${detailModalCat.color}33`, borderRadius: 10, padding:"16px 20px", marginBottom: 16, display:"flex", alignItems:"center", gap: 16 }}>
                    <div style={{ width: 54, height: 54, borderRadius: 14, background: detailModalCat.color +"22", border: `2px solid ${detailModalCat.color}44`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <i className={detailModalCat.icon} style={{ color: detailModalCat.color, fontSize: 26 }} />
                    </div>
                    <div>
                      <Text strong style={{ fontSize: 17, display:"block" }}>{detailModalCat.name}</Text>
                      <Text type="secondary">/{detailModalCat.slug}</Text>
                    </div>
                    <div style={{ marginLeft:"auto" }}>
                      <Tag color={detailModalCat.isActive ?"success" :"error"} icon={detailModalCat.isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
                        {detailModalCat.isActive ?"Active" :"Inactive"}
                      </Tag>
                    </div>
                  </div>

                  {/* Assigned To panel */}
                  <div style={{ background: isAdmin ?"#e6f4ff" :"#f6ffed", border: `1px solid ${isAdmin ?"#91caff" :"#b7eb8f"}`, borderRadius: 8, padding:"12px 16px", marginBottom: 16, display:"flex", alignItems:"center", gap: 12 }}>
                    <Avatar
                      src={teacherObj?.tprofile}
                      icon={isAdmin ? <CrownOutlined /> : <UserOutlined />}
                      size={40}
                      style={{ background: isAdmin ?"#1677ff" :"#52c41a" }}
                    />
                    <div>
                      <Text type="secondary" style={{ fontSize: 11, display:"block" }}>
                        {isAdmin ?"Created & owned by" :"Assigned to teacher"}
                      </Text>
                      <Text strong style={{ display:"block", fontSize: 14 }}>
                        {detailModalCat.createdBy?.aname || detailModalCat.createdBy?.tname ||"Unknown"}
                      </Text>
                      <Tag color={isAdmin ?"blue" :"green"} style={{ fontSize: 11 }}>
                        {isAdmin ?"Admin-owned" :"Teacher-assigned"}
                      </Tag>
                      {!isAdmin && teacherObj?.tspecialization && (
                        <Text type="secondary" style={{ fontSize: 11, display:"block" }}>{teacherObj.tspecialization}</Text>
                      )}
                    </div>
                  </div>

                  {/* Info rows */}
                  {[
                    { label:"Description", value: detailModalCat.description ||"No description" },
                    { label:"Display Order", value: `#${detailModalCat.order}` },
                    { label:"Total Courses", value: `${detailModalCat.courseCount} courses` },
                    { label:"Created On", value: moment(detailModalCat.createdAt).format("LLLL") },
                    { label:"Last Updated", value: moment(detailModalCat.updatedAt).format("LLLL") },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display:"flex", padding:"7px 0", borderBottom:"1px solid #f0f0f0" }}>
                      <Text type="secondary" style={{ width: 120, flexShrink: 0, fontSize: 13 }}>{label}</Text>
                      <Text style={{ fontSize: 13 }}>{value}</Text>
                    </div>
                  ))}

                  {/* Keywords */}
                  {detailModalCat.keywords && detailModalCat.keywords.length > 0 && (
                    <div style={{ marginTop: 14, paddingTop: 12, borderTop:"1px solid #f0f0f0" }}>
                      <Text strong style={{ display:"block", marginBottom: 8 }}><TagsOutlined style={{ marginRight: 6 }} />Keywords</Text>
                      {detailModalCat.keywords.map((k, i) => <Tag key={i} color="blue" style={{ marginBottom: 4 }}>{k}</Tag>)}
                    </div>
                  )}
                </div>
              );
            })()}
          </Modal>

        </Content>
        <Footer style={{ textAlign:"center" }}>
          <Text type="secondary"><b>&copy; 2026 Draa. All Rights Reserved.</b></Text>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default AdminCategoryManagement;