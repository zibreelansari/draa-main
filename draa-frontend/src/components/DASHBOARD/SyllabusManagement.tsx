// frontend/src/pages/SyllabusManagement.tsx
import { useEffect, useState, useCallback, useMemo } from"react";
import {
  Layout, Form, Input, Button, Upload, Table, Select, Switch, message,
  Row, Col, Modal, Card, Space, Typography, Divider, Tag, Tabs, Badge,
  InputNumber, Drawer, Descriptions, Popconfirm, Alert, Empty, Avatar,
  Radio, Progress, Tooltip, Collapse,
} from"antd";
import {
  UploadOutlined, CheckCircleOutlined, ClockCircleOutlined, EyeOutlined,
  DownloadOutlined, BookOutlined, PlusOutlined, MinusCircleOutlined,
  DeleteOutlined, EditOutlined, ReloadOutlined, ExportOutlined,
  FilterOutlined, SearchOutlined, SaveOutlined, TeamOutlined,
  CrownOutlined, UserOutlined, StarOutlined, FilePdfOutlined,
  VideoCameraOutlined, TagsOutlined, TrophyOutlined, AppstoreOutlined,
  CloseCircleOutlined, LinkOutlined,
  GlobalOutlined,
} from"@ant-design/icons";
import axios from"axios";
import { useNavigate } from"react-router-dom";
import moment from"moment";
import Sidebar from"./Sidebar";
import Sidebar2 from"./Sidebar2";
import Topbar from"./Topbar";
import url, { BACKEND_UPLOAD_URL } from"../../url";
import { getAuthHeaders } from"../../utils/global_auth";
import usePageTitle from '../../hooks/usePageTitle';

const { TextArea } = Input;
const { Text, Title } = Typography;
const { Content, Footer } = Layout;
const { Option } = Select;
const { Search } = Input;

//  Constants & Helpers 

const getFileValue = (e: any) => {
  if (Array.isArray(e)) return e;
  return e?.fileList ?? [];
};

const toFileList = (path?: string, label ="file") => {
  if (!path) return [];
  const fullUrl = path.startsWith("http") ? path : `${BACKEND_UPLOAD_URL}/${path}`;
  return [{
    uid:"-1",
    name: path.split("/").pop() || label,
    status:"done" as const,
    url: fullUrl,
    thumbUrl: fullUrl,
  }];
};

//  Interfaces 

interface SubjectType { subjectName: string; topics: string[]; weightage: string; }
interface BookType { bookName: string; author: string; link: string; }
interface ExamPatternType {
  totalMarks: number; duration: number; numberOfQuestions: number;
  negativeMarking: string; examMode: string;
}

interface SyllabusType {
  _id: string;
  examName: string;
  examCategory: string;
  title: string;
  description?: string;
  subjects: SubjectType[];
  examPattern: ExamPatternType;
  importantTopics: string[];
  recommendedBooks: BookType[];
  syllabusPDF: string;
  coverImage?: string;
  videoUrl?: string;
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
  seo?: {
    seo_title?: string; slug?: string;
    meta_keywords?: string; meta_description?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

interface Teacher {
  _id: string; tname: string; temail?: string;
  tspecialization?: string; tprofile?: string; Status?: string;
}

interface LoginUser { id?: string; aname?: string; aemail?: string; }

//  Component 

const SyllabusManagement = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  //  Auth 
  const [loginUser, setLoginUser] = useState<LoginUser | null>(null);

  //  Data 
  const [syllabuses, setSyllabuses] = useState<SyllabusType[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  //  UI state 
  const [activeTab, setActiveTab] = useState("all");
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" |"edit">("add");
  const [editingSyllabus, setEditingSyllabus] = useState<SyllabusType | null>(null);
  const [selectedSyllabus, setSelectedSyllabus] = useState<SyllabusType | null>(null);
  const [bulkSelected, setBulkSelected] = useState<string[]>([]);
  const [creatingFor, setCreatingFor] = useState<"admin" |"teacher">("admin");
  const [autoGenerateSEO, setAutoGenerateSEO] = useState(true);

  //  Filters 
  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [teacherFilter, setTeacherFilter] = useState("all");

  //  Stats 
  const [stats, setStats] = useState({
    total: 0, approved: 0, pending: 0,
    featured: 0, popular: 0, premium: 0,
  });

  //  Auth 
  useEffect(() => {
    const raw = localStorage.getItem("edudocs");
    if (!raw) {
      message.warning("Not logged in!");
      navigate("/admin-login");
      return;
    }
    try {
      const user = JSON.parse(raw);
      if (user.tname) {
        if (user.isVerified !== true || user.Status !=="approved") {
          message.error("Access denied. Teacher account not approved.");
          navigate("/teacher-dashboard");
          return;
        }
      } else if (!user.aname) {
        message.error("Access denied. Admin access required.");
        navigate("/admin-login");
        return;
      }
      setLoginUser(user);
    } catch {
      message.error("Invalid session.");
      navigate("/admin-login");
    }
  }, [navigate]);

  //  Fetch Teachers 
  const fetchTeachers = useCallback(async () => {
    setTeachersLoading(true);
    try {
      const res = await axios.get(`${url}/updateTeacherStatus/all`);
      if (res.data.success && res.data.data?.teachers) {
        setTeachers(res.data.data.teachers.filter((t: Teacher) => t.Status ==="approved"));
        return;
      }
      throw new Error("fallback");
    } catch {
      try {
        const fb = await axios.get(`${url}/count/getAllTeachers`);
        setTeachers(fb.data.Teachers || []);
      } catch {
        try {
          const fb2 = await axios.get(`${url}/allteachersName`);
          setTeachers(fb2.data.teachers || []);
        } catch { console.warn("Teachers not loaded"); }
      }
    } finally { setTeachersLoading(false); }
  }, []);

  //  Fetch Stats 
  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get(`${url}/syllabus/stats/overview`, { headers: getAuthHeaders() });
      if (res.data.stats) setStats(res.data.stats);
    } catch { /* fallback calculated from list */ }
  }, []);

  //  Fetch Syllabuses 
  const fetchSyllabuses = useCallback(async (tab ="all") => {
    if (!loginUser) return;
    setLoading(true);
    try {
      let endpoint = `${url}/syllabus/all`;
      const params: any = {};

      if (loginUser.tname) {
        params.uploadedBy = loginUser.id;
      }

      if (tab ==="approved") params.isApproved = true;
      else if (tab ==="pending") params.isApproved = false;
      else if (tab ==="featured") params.isFeatured = true;
      else if (tab ==="popular") params.isPopular = true;
      else if (tab ==="premium") params.isPremium = true;

      const res = await axios.get(endpoint, { params, headers: getAuthHeaders() });
      const data: SyllabusType[] = res.data.syllabuses || [];
      setSyllabuses(data);

      // Local stats calculation
      setStats({
        total: data.length,
        approved: data.filter((s) => s.isApproved).length,
        pending: data.filter((s) => !s.isApproved).length,
        featured: data.filter((s) => s.isFeatured).length,
        popular: data.filter((s) => s.isPopular).length,
        premium: data.filter((s) => s.isPremium).length,
      });
    } catch {
      message.error("Failed to fetch syllabuses");
    } finally {
      setLoading(false);
    }
  }, [loginUser]);

  useEffect(() => {
    if (loginUser) { fetchSyllabuses("all"); fetchStats(); fetchTeachers(); }
  }, [loginUser, fetchSyllabuses, fetchStats, fetchTeachers]);

  useEffect(() => { if (loginUser) fetchSyllabuses(activeTab); }, [activeTab]);

  //  Filter logic 
  const filteredSyllabuses = useMemo(() => {
    return syllabuses.filter((s) => {
      const src = searchText.toLowerCase();
      const matchSearch =
        s.examName.toLowerCase().includes(src) ||
        s.title.toLowerCase().includes(src) ||
        s.examCategory.toLowerCase().includes(src) ||
        s.uploadedByName?.toLowerCase().includes(src) ||
        s.tags?.some((t) => t.toLowerCase().includes(src));
      const matchCategory = categoryFilter ==="all" || s.examCategory === categoryFilter;
      const matchApproval = approvalFilter ==="all" ||
        (approvalFilter ==="approved" && s.isApproved) ||
        (approvalFilter ==="pending" && !s.isApproved);
      const matchTeacher = teacherFilter ==="all" || s.uploadedByName === teacherFilter;
      return matchSearch && matchCategory && matchApproval && matchTeacher;
    });
  }, [syllabuses, searchText, categoryFilter, approvalFilter, teacherFilter]);

  const isFilterActive = searchText !=="" || categoryFilter !=="all" || approvalFilter !=="all" || teacherFilter !=="all";
  const clearFilters = () => { setSearchText(""); setCategoryFilter("all"); setApprovalFilter("all"); setTeacherFilter("all"); };

  const uniqueCategories = useMemo(() => [...new Set(syllabuses.map((s) => s.examCategory).filter(Boolean))], [syllabuses]);
  const uniqueTeachers = useMemo(() => [...new Set(syllabuses.map((s) => s.uploadedByName).filter(Boolean))], [syllabuses]);

  //  SEO helpers 
  // SEO handlers removed as per user request to disable"auto-catchup" behavior.


  const normalizeUpload = (e: any) => {
    if (e?.fileList && Array.isArray(e.fileList)) return e.fileList;
    if (e?.file) return [e.file];
    if (Array.isArray(e)) return e;
    return [];
  };

  //  Open Add Modal 
  const openAddModal = () => {
    setModalMode("add");
    setEditingSyllabus(null);
    setCreatingFor("admin");
    form.resetFields();
    form.setFieldsValue({
      syllabusPDF: [], coverImage: [],
      examPattern: { totalMarks: 0, duration: 0, numberOfQuestions: 0, negativeMarking:"", examMode:"Online" },
      isFeatured: false, isPopular: false, isPremium: false,
      creatingFor:"admin",
    });
    setFormModalOpen(true);
  };

  //  Open Edit Modal 
  const openEditModal = (syllabus: SyllabusType) => {
    setModalMode("edit");
    setEditingSyllabus(syllabus);

    const isTeacherSyllabus = !!syllabus.uploadedBy; // Basic check
    setCreatingFor(isTeacherSyllabus ?"teacher" :"admin");

    form.setFieldsValue({
      ...syllabus,
      seo_title: syllabus.seo?.seo_title || syllabus.title,
      slug: syllabus.seo?.slug ||"",
      meta_keywords: syllabus.seo?.meta_keywords ||"",
      meta_description: syllabus.seo?.meta_description ||"",
      creatingFor: isTeacherSyllabus ?"teacher" :"admin",
      assignedTeacher: typeof syllabus.uploadedBy ==="string" ? syllabus.uploadedBy : syllabus.uploadedBy?._id,
      syllabusPDF: toFileList(syllabus.syllabusPDF,"Syllabus.pdf"),
      coverImage: toFileList(syllabus.coverImage,"cover-image"),
    });
    setFormModalOpen(true);
  };

  //  Form Submit 
  const onFormFinish = async (values: any) => {
    setFormSubmitting(true);
    try {
      const formData = new FormData();
      const skip = ["syllabusPDF","coverImage","subjects","importantTopics","recommendedBooks","examPattern","tags","creatingFor","assignedTeacher"];

      // Determine uploaded-by
      let userData = {
        _id: loginUser?.id,
        tname: loginUser?.aname || loginUser?.tname ||"Admin",
        isVerified: true,
        Status:"approved"
      };

      if (loginUser?.aname && values.creatingFor ==="teacher" && values.assignedTeacher) {
        const t = teachers.find((t) => t._id === values.assignedTeacher);
        userData = {
          _id: values.assignedTeacher,
          tname: t?.tname ||"Teacher",
          isVerified: true,
          Status:"approved"
        };
      }

      formData.append("uploadedBy", userData._id);
      formData.append("uploadedByName", userData.tname);

      Object.keys(values).forEach((key) => {
        if (!skip.includes(key) && values[key] !== undefined && values[key] !== null) {
          formData.append(key, String(values[key]));
        }
      });

      ["subjects","importantTopics","recommendedBooks","examPattern","tags"].forEach((key) => {
        if (values[key] !== undefined) formData.append(key, JSON.stringify(values[key] ?? []));
      });

      if (values.syllabusPDF?.[0]?.originFileObj)
        formData.append("syllabusPDF", values.syllabusPDF[0].originFileObj);
      else if (modalMode ==="add") { message.error("Syllabus PDF is required!"); setFormSubmitting(false); return; }

      if (values.coverImage?.[0]?.originFileObj)
        formData.append("coverImage", values.coverImage[0].originFileObj);

      if (modalMode ==="edit" && editingSyllabus) {
        await axios.put(`${url}/syllabus/${editingSyllabus._id}`, formData, {
          headers: { ...getAuthHeaders(),"Content-Type":"multipart/form-data" },
        });
        message.success(" Syllabus updated!");
      } else {
        await axios.post(`${url}/syllabus/create`, formData, {
          headers: { ...getAuthHeaders(),"Content-Type":"multipart/form-data" },
        });
        const forWhom = values.creatingFor ==="teacher" && values.assignedTeacher
          ? `for ${teachers.find((t) => t._id === values.assignedTeacher)?.tname}`
          :"";
        message.success(` Syllabus uploaded ${forWhom}!`);
      }

      setFormModalOpen(false);
      form.resetFields();
      setEditingSyllabus(null);
      fetchSyllabuses(activeTab);
      fetchStats();
    } catch (err: any) {
      message.error(err.response?.data?.error ||" Failed to save syllabus");
    } finally { setFormSubmitting(false); }
  };

  //  Delete 
  const handleDelete = async (id: string, title: string) => {
    setActionLoading(id);
    try {
      await axios.delete(`${url}/syllabus/${id}`, { headers: getAuthHeaders() });
      message.success(`"${title}" deleted`);
      setSyllabuses((prev) => prev.filter((s) => s._id !== id));
      if (selectedSyllabus?._id === id) setDetailDrawerOpen(false);
      fetchStats();
    } catch { message.error("Failed to delete"); }
    finally { setActionLoading(null); }
  };

  //  Approve / Revoke 
  const handleApproval = async (id: string, approve: boolean, title: string) => {
    setActionLoading(id);
    try {
      await axios.put(`${url}/syllabus/${id}/approve`, { isApproved: approve, adminId: loginUser?.id }, { headers: getAuthHeaders() });
      message.success(`"${title}" ${approve ?"approved" :"revoked"}`);
      setSyllabuses((prev) => prev.map((s) => s._id === id ? { ...s, isApproved: approve } : s));
      if (selectedSyllabus?._id === id) setSelectedSyllabus((p) => p ? { ...p, isApproved: approve } : p);
      fetchStats();
    } catch { message.error("Failed to update approval"); }
    finally { setActionLoading(null); }
  };

  //  Toggle flags (featured / popular / premium) 
  const handleToggleFlag = async (id: string, flag:"isFeatured" |"isPopular" |"isPremium", current: boolean, title: string) => {
    setActionLoading(id);
    try {
      await axios.put(`${url}/syllabus/${id}`, { [flag]: !current });
      message.success(`"${title}" ${flag.replace("is","")} ${!current ?"enabled" :"disabled"}`);
      setSyllabuses((prev) => prev.map((s) => s._id === id ? { ...s, [flag]: !current } : s));
      if (selectedSyllabus?._id === id)
        setSelectedSyllabus((p) => p ? { ...p, [flag]: !current } : p);
    } catch { message.error("Failed to update"); }
    finally { setActionLoading(null); }
  };

  //  Bulk Approve 
  const handleBulkApproval = async (approve: boolean) => {
    if (!bulkSelected.length) { message.warning("No items selected"); return; }
    try {
      await axios.post(`${url}/syllabus/bulk-approve`, {
        syllabusIds: bulkSelected, isApproved: approve, adminId: loginUser?.id,
      });
      message.success(`${bulkSelected.length} syllabuses ${approve ?"approved" :"unapproved"}`);
      setBulkSelected([]);
      fetchSyllabuses(activeTab);
      fetchStats();
    } catch { message.error("Bulk action failed"); }
  };

  //  Export 
  const handleExport = () => {
    const headers = ["Exam Name","Category","Title","Uploaded By","Status","Featured","Popular","Premium","Views","Downloads","Created"];
    const rows = filteredSyllabuses.map((s) => [
      `"${s.examName}"`, s.examCategory, `"${s.title}"`, `"${s.uploadedByName}"`,
      s.isApproved ?"Approved" :"Pending",
      s.isFeatured ?"Yes" :"No", s.isPopular ?"Yes" :"No", s.isPremium ?"Yes" :"No",
      s.views || 0, s.downloads || 0, moment(s.createdAt).format("YYYY-MM-DD"),
    ].join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type:"text/csv" });
    const dl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = dl; a.download = `syllabuses-${moment().format("YYYY-MM-DD")}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    window.URL.revokeObjectURL(dl);
    message.success("Exported!");
  };

  //  Table Columns 
  const columns = [
    {
      title:"Exam",
      key:"exam",
      width: 260,
      render: (_: any, record: SyllabusType) => (
        <div style={{ display:"flex", alignItems:"flex-start", gap: 10 }}>
          {record.coverImage ? (
            <img src={record.coverImage} alt="" style={{ width: 44, height: 44, objectFit:"cover", borderRadius: 8, flexShrink: 0 }} />
          ) : (
            <div style={{ width: 44, height: 44, borderRadius: 8, background:"#e6f4ff", display:"flex", alignItems:"center", justifyContent:"center", fontSize: 18, color:"#1677ff", flexShrink: 0 }}>
              <FilePdfOutlined />
            </div>
          )}
          <div>
            <Text strong style={{ fontSize: 13, color:"#1677ff", cursor:"pointer", display:"block" }}
              onClick={() => { setSelectedSyllabus(record); setDetailDrawerOpen(true); }}>
              {record.examName}
            </Text>
            <Text type="secondary" style={{ fontSize: 11, display:"block" }}>{record.title}</Text>
            <Space size={3} style={{ marginTop: 3 }}>
              <Tag color="blue" style={{ fontSize: 10, margin: 0 }}>{record.examCategory}</Tag>
              {record.isFeatured && <Tag color="gold" style={{ fontSize: 10, margin: 0 }}> Featured</Tag>}
              {record.isPopular && <Tag color="orange" style={{ fontSize: 10, margin: 0 }}> Popular</Tag>}
              {record.isPremium && <Tag color="purple" style={{ fontSize: 10, margin: 0 }}> Premium</Tag>}
            </Space>
          </div>
        </div>
      ),
    },
    {
      title:"Uploaded By",
      key:"uploadedBy",
      width: 150,
      render: (_: any, record: SyllabusType) => {
        const teacherObj = teachers.find((t) => t.tname === record.uploadedByName);
        return (
          <Space size={6}>
            <Avatar src={teacherObj?.tprofile} icon={<UserOutlined />} size={26}
              style={{ background: teacherObj ?"#52c41a" :"#1677ff" }} />
            <div>
              <Text style={{ fontSize: 12, display:"block", fontWeight: 600 }}>{record.uploadedByName}</Text>
              <Tag color={teacherObj ?"green" :"blue"} style={{ fontSize: 10, padding:"0 4px", lineHeight:"16px", margin: 0 }}>
                {teacherObj ?"Teacher" :"Admin"}
              </Tag>
            </div>
          </Space>
        );
      },
    },
    {
      title:"Pattern",
      key:"pattern",
      width: 130,
      render: (_: any, record: SyllabusType) => (
        <Space direction="vertical" size={2}>
          <Text style={{ fontSize: 11 }}> {record.examPattern?.totalMarks ||""} marks</Text>
          <Text style={{ fontSize: 11 }}> {record.examPattern?.numberOfQuestions ||""} Qs</Text>
          <Text style={{ fontSize: 11 }}> {record.examPattern?.duration ||""} mins</Text>
        </Space>
      ),
    },
    {
      title:"Subjects",
      key:"subjects",
      width: 80,
      align:"center" as const,
      render: (_: any, record: SyllabusType) => (
        <Badge count={record.subjects?.length || 0} showZero
          style={{ background: (record.subjects?.length || 0) > 0 ?"#722ed1" :"#d9d9d9", boxShadow:"none" }} />
      ),
    },
    {
      title:"Status",
      key:"status",
      width: 110,
      render: (_: any, record: SyllabusType) => (
        <Tag color={record.isApproved ?"success" :"warning"}
          icon={record.isApproved ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
          style={{ fontWeight: 600 }}>
          {record.isApproved ?"APPROVED" :"PENDING"}
        </Tag>
      ),
    },
    {
      title:"Stats",
      key:"stats",
      width: 100,
      render: (_: any, record: SyllabusType) => (
        <Space direction="vertical" size={2}>
          <Text style={{ fontSize: 11 }}><EyeOutlined style={{ color:"#1677ff" }} /> {record.views || 0}</Text>
          <Text style={{ fontSize: 11 }}><DownloadOutlined style={{ color:"#52c41a" }} /> {record.downloads || 0}</Text>
        </Space>
      ),
    },
    {
      title:"Created",
      key:"date",
      width: 95,
      render: (_: any, record: SyllabusType) => (
        <Text style={{ fontSize: 11 }}>{moment(record.createdAt).format("DD MMM YY")}</Text>
      ),
    },
    {
      title:"Actions",
      key:"actions",
      width: 220,
      fixed:"right" as const,
      render: (_: any, record: SyllabusType) => (
        <Space size={4} wrap>
          <Tooltip title="View Details">
            <Button type="text" icon={<EyeOutlined />} size="small"
              onClick={() => { setSelectedSyllabus(record); setDetailDrawerOpen(true); }} />
          </Tooltip>
          <Tooltip title="Edit">
            <Button type="text" icon={<EditOutlined />} size="small" style={{ color:"#1677ff" }}
              onClick={() => openEditModal(record)} />
          </Tooltip>

          {/* Approve / Revoke */}
          {loginUser?.aname && (
            !record.isApproved ? (
              <Popconfirm title={`Approve"${record.examName}"?`}
                onConfirm={() => handleApproval(record._id, true, record.examName)}
                okText="Approve" cancelText="Cancel">
                <Button type="primary" size="small" icon={<CheckCircleOutlined />}
                  loading={actionLoading === record._id}>Approve</Button>
              </Popconfirm>
            ) : (
              <Popconfirm title={`Revoke approval for"${record.examName}"?`}
                onConfirm={() => handleApproval(record._id, false, record.examName)}
                okText="Revoke" cancelText="Cancel" okType="danger">
                <Button size="small" danger icon={<CloseCircleOutlined />}
                  loading={actionLoading === record._id}>Revoke</Button>
              </Popconfirm>
            )
          )}

          <Popconfirm title={`Delete"${record.examName}"?`} description="Cannot be undone."
            onConfirm={() => handleDelete(record._id, record.examName)}
            okText="Delete" cancelText="Cancel" okType="danger">
            <Button danger type="text" icon={<DeleteOutlined />} size="small"
              loading={actionLoading === record._id} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  //  Guard 
  if (!loginUser) {
    return (
      <Layout style={{ minHeight:"100vh" }}>
        <Content style={{ display:"flex", justifyContent:"center", alignItems:"center" }}>
          <Card><Text>Verifying permissions...</Text></Card>
        </Content>
      </Layout>
    );
  }

  //  Render 
  return (
    <Layout style={{ minHeight:"100vh", background:"#f0f2f5" }}>
      {loginUser.aname ? <Sidebar /> : <Sidebar2 />}
      <Layout>
        <Topbar />
        <Content style={{ margin:"20px 16px", padding: 24 }}>

          {/*  Header  */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom: 24, flexWrap:"wrap", gap: 12 }}>
            <div>
              <Title level={2} style={{ margin: 0, color:"#1677ff" }}>
                <BookOutlined style={{ marginRight: 10 }} />Syllabus Management
              </Title>
              <Text type="secondary">
                {loginUser.aname ?"Upload, edit, approve and manage syllabuses on behalf of any teacher" :"Manage your uploaded syllabuses"}
              </Text>
            </div>
            <Space wrap>
              {loginUser.aname && bulkSelected.length > 0 && (
                <Space>
                  <Text type="secondary" style={{ fontSize: 12 }}>{bulkSelected.length} selected</Text>
                  <Button size="small" type="primary" onClick={() => handleBulkApproval(true)}>Bulk Approve</Button>
                  <Button size="small" danger onClick={() => handleBulkApproval(false)}>Bulk Revoke</Button>
                  <Button size="small" onClick={() => setBulkSelected([])}>Clear</Button>
                </Space>
              )}
              <Button icon={<ReloadOutlined />} onClick={() => { fetchSyllabuses(activeTab); fetchStats(); }} loading={loading}>Refresh</Button>
              {loginUser.aname && <Button icon={<ExportOutlined />} onClick={handleExport}>Export</Button>}
              <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal} style={{ background:"#1677ff" }}>
                Upload Syllabus
              </Button>
            </Space>
          </div>

          {/*  Stats  */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {[
              { title:"Total", value: stats.total, icon: <BookOutlined />, color:"#1677ff", sub:"All syllabuses" },
              { title:"Approved", value: stats.approved, icon: <CheckCircleOutlined />, color:"#52c41a", sub: `${stats.pending} pending` },
              { title:"Pending", value: stats.pending, icon: <ClockCircleOutlined />, color:"#fa8c16", sub:"Awaiting review" },
              { title:"Featured", value: stats.featured, icon: <StarOutlined />, color:"#fadb14", sub: `${stats.popular} popular` },
              { title:"Premium", value: stats.premium, icon: <TrophyOutlined />, color:"#722ed1", sub:"Paid content" },
            ].map((s) => (
              <Col xs={24} sm={12} lg={24 / 5} key={s.title}>
                <Card bordered={false} style={{ borderRadius: 12, boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap: 10 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: s.color +"18", display:"flex", alignItems:"center", justifyContent:"center", fontSize: 18, color: s.color }}>
                      {s.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color:"#8c8c8c" }}>{s.title}</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: s.color, lineHeight: 1.2 }}>{s.value}</div>
                      <div style={{ fontSize: 10, color:"#bfbfbf" }}>{s.sub}</div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          {/*  Approval progress  */}
          <Card bordered={false} style={{ marginBottom: 16, borderRadius: 12, boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom: 6 }}>
              <Text style={{ fontSize: 13 }}>Approval Progress</Text>
              <Text strong style={{ fontSize: 13 }}>
                {stats.total ? Math.round((stats.approved / stats.total) * 100) : 0}% Approved
              </Text>
            </div>
            <Progress percent={stats.total ? Math.round((stats.approved / stats.total) * 100) : 0}
              strokeColor="#52c41a" trailColor="#fff7e6" showInfo={false} size="small" />
          </Card>

          {/*  Filters  */}
          <Card bordered={false} style={{ marginBottom: 16, borderRadius: 12, boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
            <Row gutter={[12, 12]} align="middle">
              <Col xs={24} sm={8} lg={6}>
                <Search placeholder="Search exam, title, category, teacher..."
                  value={searchText} onChange={(e) => setSearchText(e.target.value)}
                  allowClear prefix={<SearchOutlined style={{ color:"#bfbfbf" }} />} />
              </Col>
              <Col xs={12} sm={4} lg={3}>
                <Select value={approvalFilter} onChange={setApprovalFilter} style={{ width:"100%" }}>
                  <Option value="all">All Status</Option>
                  <Option value="approved">Approved</Option>
                  <Option value="pending">Pending</Option>
                </Select>
              </Col>
              <Col xs={12} sm={4} lg={4}>
                <Select value={categoryFilter} onChange={setCategoryFilter} style={{ width:"100%" }} showSearch optionFilterProp="children">
                  <Option value="all">All Categories</Option>
                  {uniqueCategories.map((c) => <Option key={c} value={c}>{c}</Option>)}
                </Select>
              </Col>
              <Col xs={12} sm={4} lg={4}>
                <Select value={teacherFilter} onChange={setTeacherFilter} style={{ width:"100%" }} showSearch optionFilterProp="children">
                  <Option value="all">All Uploaders</Option>
                  {uniqueTeachers.map((t) => <Option key={t} value={t}>{t}</Option>)}
                </Select>
              </Col>
              <Col xs={12} sm={4} lg={3}>
                <Button icon={<FilterOutlined />} onClick={clearFilters} disabled={!isFilterActive} block>Clear</Button>
              </Col>
            </Row>
          </Card>

          {isFilterActive && (
            <Alert message={`Showing ${filteredSyllabuses.length} of ${syllabuses.length} syllabuses`}
              type="info" showIcon closable={false} style={{ marginBottom: 12, borderRadius: 8 }} />
          )}

          {/*  Tabs + Table  */}
          <Card bordered={false} style={{ borderRadius: 12, boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
            <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ marginBottom: 0 }}>
              {[
                { key:"all", label:"All", count: stats.total },
                { key:"pending", label:"Pending", count: stats.pending },
                { key:"approved", label:"Approved", count: stats.approved },
                { key:"featured", label:"Featured", count: stats.featured },
                { key:"popular", label:"Popular", count: stats.popular },
                { key:"premium", label:"Premium", count: stats.premium },
              ].map((t) => ({
                key: t.key,
                label: <Badge count={t.count} offset={[10, 0]} style={{ background: activeTab === t.key ?"#1677ff" :"#d9d9d9" }}>{t.label}</Badge>,
              })).map((t) => <Tabs.TabPane key={t.key} tab={t.label} />)}
            </Tabs>

            {stats.pending > 0 && activeTab !=="pending" && (
              <Alert message={`${stats.pending} syllabuses pending approval`} type="warning" showIcon
                style={{ marginBottom: 12, borderRadius: 8 }}
                action={<Button size="small" onClick={() => setActiveTab("pending")}>Review Now </Button>} />
            )}

            <Table
              rowKey="_id"
              columns={columns}
              dataSource={filteredSyllabuses}
              loading={loading}
              bordered={false}
              scroll={{ x: 1300 }}
              rowSelection={{
                selectedRowKeys: bulkSelected,
                onChange: (keys) => setBulkSelected(keys as string[]),
              }}
              pagination={{
                pageSize: 10, showSizeChanger: true, showQuickJumper: true,
                pageSizeOptions: ["10","20","50"],
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
              }}
              size="small"
              locale={{
                emptyText: loading ?"Loading..." : (
                  <Empty description="No syllabuses found" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                    <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>Upload First Syllabus</Button>
                  </Empty>
                ),
              }}
            />
          </Card>

          {/* 
              UPLOAD / EDIT MODAL
           */}
          <Modal
            title={
              <Space>
                {modalMode ==="add" ? <PlusOutlined style={{ color:"#1677ff" }} /> : <EditOutlined style={{ color:"#fa8c16" }} />}
                <Text strong style={{ fontSize: 16 }}>
                  {modalMode ==="add" ?"Upload New Syllabus" : `Edit: ${editingSyllabus?.examName}`}
                </Text>
              </Space>
            }
            open={formModalOpen}
            onCancel={() => { setFormModalOpen(false); form.resetFields(); setEditingSyllabus(null); }}
            width={900}
            footer={
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <Space>
                  <Button onClick={() => { setFormModalOpen(false); form.resetFields(); }}>Cancel</Button>
                  <Button type="primary"
                    icon={modalMode ==="add" ? <PlusOutlined /> : <SaveOutlined />}
                    loading={formSubmitting} onClick={() => form.submit()}>
                    {modalMode ==="add" ?"Upload Syllabus" :"Save Changes"}
                  </Button>
                </Space>
              </div>
            }
            destroyOnClose
            styles={{ body: { padding:"16px 24px", maxHeight:"72vh", overflowY:"auto" } }}
          >
            <Form form={form} layout="vertical" onFinish={onFormFinish}
              initialValues={{
                syllabusPDF: [], coverImage: [],
                examPattern: { totalMarks: 0, duration: 0, numberOfQuestions: 0, negativeMarking:"", examMode:"Online" },
                isFeatured: false, isPopular: false, isPremium: false, creatingFor:"admin",
              }}>

              {/*  WHO IS THIS FOR?  */}
              {loginUser?.aname && (
                <div style={{ background:"linear-gradient(135deg, #e6f4ff, #f0f5ff)", border:"1.5px solid #91caff", borderRadius: 10, padding:"16px 18px", marginBottom: 20 }}>
                  <Text strong style={{ display:"block", marginBottom: 12, fontSize: 14, color:"#1677ff" }}>
                    <TeamOutlined style={{ marginRight: 6 }} />Uploading this syllabus for:
                  </Text>
                  <Form.Item name="creatingFor" style={{ marginBottom: 12 }}>
                    <Radio.Group buttonStyle="solid"
                      onChange={(e) => { setCreatingFor(e.target.value); if (e.target.value ==="admin") form.setFieldValue("assignedTeacher", undefined); }}>
                      <Radio.Button value="admin"><CrownOutlined style={{ marginRight: 4 }} />Admin (Me)</Radio.Button>
                      <Radio.Button value="teacher"><TeamOutlined style={{ marginRight: 4 }} />Specific Teacher</Radio.Button>
                    </Radio.Group>
                  </Form.Item>

                  {creatingFor ==="teacher" ? (
                    <Form.Item name="assignedTeacher" label={<Text strong>Select Teacher</Text>}
                      rules={[{ required: true, message:"Please select a teacher" }]}
                      style={{ marginBottom: 0 }}
                      extra="Syllabus will be attributed to this teacher">
                      <Select placeholder="Search teacher..." showSearch loading={teachersLoading}
                        optionFilterProp="label"
                        filterOption={(input, option) => String(option?.label).toLowerCase().includes(input.toLowerCase())}
                        optionLabelProp="label" size="large">
                        {teachers.map((t) => (
                          <Option key={t._id} value={t._id} label={t.tname}>
                            <div style={{ display:"flex", alignItems:"center", gap: 8, padding:"4px 0" }}>
                              <Avatar src={t.tprofile} icon={<UserOutlined />} size={28} style={{ background:"#52c41a" }} />
                              <div>
                                <div style={{ fontWeight: 600, fontSize: 13 }}>{t.tname}</div>
                                {t.tspecialization && <div style={{ fontSize: 11, color:"#8c8c8c" }}>{t.tspecialization}</div>}
                              </div>
                              <Tag color="green" style={{ marginLeft:"auto", fontSize: 10 }}>Approved</Tag>
                            </div>
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  ) : (
                    <Alert message="Syllabus will be owned by Admin account." type="info" showIcon style={{ marginBottom: 0 }} />
                  )}
                </div>
              )}

              <Divider style={{ margin:"0 0 16px" }} />

              {/*  BASIC INFO  */}
              <Card title="Basic Information" size="small" style={{ marginBottom: 16 }}>
                <Row gutter={12}>
                  <Col span={12}>
                    <Form.Item label="Exam Name" name="examName" rules={[{ required: true }]}>
                      <Input placeholder="e.g., SSC CGL" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Category" name="examCategory" rules={[{ required: true }]}>
                      <Select placeholder="Select category">
                        {["SSC","UPSC","Banking","Railway","State PSC","Teaching","Defense","Police","UGC","CUET","WBSSC","BPSC","JEE","NEET","Other"].map((c) => (
                          <Option key={c} value={c}>{c}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item label="Title" name="title" rules={[{ required: true }]}>
                  <Input placeholder="e.g., SSC CGL 2024 Complete Syllabus" />
                </Form.Item>
                <Form.Item label="Description" name="description">
                  <TextArea rows={3} placeholder="Brief overview..." />
                </Form.Item>
                <Form.Item label="Video URL (YouTube)" name="videoUrl">
                  <Input prefix={<VideoCameraOutlined style={{ color:"#ff0000" }} />} placeholder="https://youtube.com/..." />
                </Form.Item>
                <Form.Item label="Tags" name="tags">
                  <Select mode="tags" placeholder="Add tags for better searchability" />
                </Form.Item>
                <Row gutter={12}>
                  <Col span={8}>
                    <Form.Item label="Featured" name="isFeatured" valuePropName="checked">
                      <Switch checkedChildren="Yes" unCheckedChildren="No" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Popular" name="isPopular" valuePropName="checked">
                      <Switch checkedChildren="Yes" unCheckedChildren="No" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Premium" name="isPremium" valuePropName="checked">
                      <Switch checkedChildren="Yes" unCheckedChildren="No" />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              {/*  SUBJECTS  */}
              <Card title="Subjects & Topics" size="small" style={{ marginBottom: 16 }}>
                <Form.List name="subjects">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...rest }) => (
                        <Card key={key} size="small" style={{ marginBottom: 12, background:"#f9f9ff" }}
                          extra={<Button type="link" danger icon={<MinusCircleOutlined />} onClick={() => remove(name)}>Remove</Button>}>
                          <Row gutter={12}>
                            <Col span={12}>
                              <Form.Item {...rest} name={[name,"subjectName"]} label="Subject Name" rules={[{ required: true }]}>
                                <Input placeholder="e.g., General Intelligence" />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item {...rest} name={[name,"weightage"]} label="Weightage">
                                <Input placeholder="e.g., 25%, 50 marks" />
                              </Form.Item>
                            </Col>
                          </Row>
                          <Form.Item {...rest} name={[name,"topics"]} label="Topics">
                            <Select mode="tags" placeholder="Add topics (press Enter)" />
                          </Form.Item>
                        </Card>
                      ))}
                      <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Add Subject</Button>
                    </>
                  )}
                </Form.List>
              </Card>

              {/*  EXAM PATTERN  */}
              <Card title="Exam Pattern" size="small" style={{ marginBottom: 16 }}>
                <Row gutter={12}>
                  <Col span={8}>
                    <Form.Item name={["examPattern","totalMarks"]} label="Total Marks">
                      <InputNumber style={{ width:"100%" }} min={0} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name={["examPattern","duration"]} label="Duration (mins)">
                      <InputNumber style={{ width:"100%" }} min={0} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name={["examPattern","numberOfQuestions"]} label="Questions">
                      <InputNumber style={{ width:"100%" }} min={0} />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={12}>
                  <Col span={12}>
                    <Form.Item name={["examPattern","negativeMarking"]} label="Negative Marking">
                      <Input placeholder="e.g., 0.25 per wrong answer" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name={["examPattern","examMode"]} label="Exam Mode">
                      <Select>
                        <Option value="Online">Online</Option>
                        <Option value="Offline">Offline</Option>
                        <Option value="Both">Both</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              {/*  IMPORTANT TOPICS  */}
              <Card title="Important Topics" size="small" style={{ marginBottom: 16 }}>
                <Form.Item name="importantTopics">
                  <Select mode="tags" placeholder="Add important topics (press Enter)" />
                </Form.Item>
              </Card>

              {/*  RECOMMENDED BOOKS  */}
              <Card title="Recommended Books" size="small" style={{ marginBottom: 16 }}>
                <Form.List name="recommendedBooks">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...rest }) => (
                        <Card key={key} size="small" style={{ marginBottom: 10, background:"#f9fff9" }}
                          extra={<MinusCircleOutlined onClick={() => remove(name)} style={{ color:"#ff4d4f" }} />}>
                          <Row gutter={12}>
                            <Col span={8}>
                              <Form.Item {...rest} name={[name,"bookName"]} label="Book Name">
                                <Input placeholder="Book title" />
                              </Form.Item>
                            </Col>
                            <Col span={8}>
                              <Form.Item {...rest} name={[name,"author"]} label="Author">
                                <Input placeholder="Author name" />
                              </Form.Item>
                            </Col>
                            <Col span={8}>
                              <Form.Item {...rest} name={[name,"link"]} label="Buy Link">
                                <Input prefix={<LinkOutlined />} placeholder="https://..." />
                              </Form.Item>
                            </Col>
                          </Row>
                        </Card>
                      ))}
                      <Button type="dashed" onClick={() => add()} block icon={<BookOutlined />}>Add Book</Button>
                    </>
                  )}
                </Form.List>
              </Card>

              {/*  FILE UPLOADS  */}
              <Card title="File Uploads" size="small" style={{ marginBottom: 16 }}>
                <Row gutter={12}>
                  <Col span={12}>
                    <Form.Item label="Syllabus PDF" name="syllabusPDF"
                      rules={[{ required: modalMode ==="add", message:"PDF is required" }]}
                      valuePropName="fileList" getValueFromEvent={getFileValue}>
                      <Upload accept=".pdf" maxCount={1} beforeUpload={() => false} listType="picture">
                        <Button icon={<FilePdfOutlined style={{ color:"#ff4d4f" }} />}>
                          {modalMode ==="edit" ?"Replace PDF" :"Upload PDF"}
                        </Button>
                      </Upload>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Cover Image (267x440 required)" name="coverImage"
                      valuePropName="fileList" getValueFromEvent={getFileValue}>
                      <Upload accept="image/*" maxCount={1} beforeUpload={() => false} listType="picture">
                        <Button icon={<UploadOutlined />}>
                          {modalMode ==="edit" ?"Change Cover" :"Upload Cover (267x440)"}
                        </Button>
                      </Upload>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              {/*  SEO  */}
              <Collapse ghost>
                <Collapse.Panel
                  key="seo"
                  header={
                    <Space>
                      <GlobalOutlined style={{ color:'#13c2c2' }} />
                      <Text strong>SEO & Social Settings (Auto-generated)</Text>
                    </Space>
                  }
                >
                  <Card size="small" style={{ marginBottom: 16, background:'#f9f9f9' }}>
                    <Row gutter={12}>
                      <Col span={12}>
                        <Form.Item label="SEO Title" name="seo_title" rules={[{ max: 60 }]}>
                          <Input showCount maxLength={60} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="URL Slug" name="slug">
                          <Input prefix="/" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item label="Meta Keywords" name="meta_keywords">
                      <Input placeholder="syllabus, ssc, exam preparation" />
                    </Form.Item>
                    <Form.Item label="Meta Description" name="meta_description" rules={[{ max: 160 }]}>
                      <TextArea rows={2} showCount maxLength={160} />
                    </Form.Item>
                  </Card>
                </Collapse.Panel>
              </Collapse>
            </Form>
          </Modal>

          {/* 
              DETAIL DRAWER
           */}
          <Drawer
            title={<Space><FilePdfOutlined style={{ color:"#1677ff" }} />Syllabus Details</Space>}
            placement="right" width={600}
            onClose={() => setDetailDrawerOpen(false)}
            open={detailDrawerOpen}
            extra={
              selectedSyllabus && (
                <Button type="primary" icon={<EditOutlined />} size="small"
                  onClick={() => { setDetailDrawerOpen(false); openEditModal(selectedSyllabus); }}>
                  Edit
                </Button>
              )
            }
          >
            {selectedSyllabus && (() => {
              const teacherObj = teachers.find((t) => t.tname === selectedSyllabus.uploadedByName);
              return (
                <div>
                  {/* Cover + header */}
                  {selectedSyllabus.coverImage && (
                    <img src={selectedSyllabus.coverImage} alt=""
                      style={{ width:"100%", height: 140, objectFit:"cover", borderRadius: 10, marginBottom: 16 }} />
                  )}

                  <div style={{ marginBottom: 16 }}>
                    <Space wrap>
                      <Tag color={selectedSyllabus.isApproved ?"success" :"warning"}
                        icon={selectedSyllabus.isApproved ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                        style={{ fontWeight: 600 }}>
                        {selectedSyllabus.isApproved ?"APPROVED" :"PENDING"}
                      </Tag>
                      <Tag color="blue">{selectedSyllabus.examCategory}</Tag>
                      {selectedSyllabus.isFeatured && <Tag color="gold"> Featured</Tag>}
                      {selectedSyllabus.isPopular && <Tag color="orange"> Popular</Tag>}
                      {selectedSyllabus.isPremium && <Tag color="purple"> Premium</Tag>}
                    </Space>
                    <Title level={4} style={{ margin:"8px 0 4px" }}>{selectedSyllabus.examName}</Title>
                    <Text type="secondary">{selectedSyllabus.title}</Text>
                  </div>

                  {/* Uploaded By */}
                  <div style={{
                    background: teacherObj ?"#f6ffed" :"#e6f4ff",
                    border: `1px solid ${teacherObj ?"#b7eb8f" :"#91caff"}`,
                    borderRadius: 8, padding:"12px 16px", marginBottom: 16,
                    display:"flex", alignItems:"center", gap: 12,
                  }}>
                    <Avatar src={teacherObj?.tprofile} icon={<UserOutlined />} size={36}
                      style={{ background: teacherObj ?"#52c41a" :"#1677ff" }} />
                    <div>
                      <Text type="secondary" style={{ fontSize: 11 }}>Uploaded by</Text>
                      <Text strong style={{ display:"block" }}>{selectedSyllabus.uploadedByName}</Text>
                      <Tag color={teacherObj ?"green" :"blue"} style={{ fontSize: 11, margin: 0 }}>
                        {teacherObj ?"Teacher" :"Admin"}
                      </Tag>
                      {teacherObj?.tspecialization && (
                        <Text type="secondary" style={{ fontSize: 11, display:"block" }}>{teacherObj.tspecialization}</Text>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <Descriptions column={2} bordered size="small">
                    <Descriptions.Item label="Exam Pattern" span={2}>
                      <Space split="|">
                        <Text>{selectedSyllabus.examPattern?.totalMarks ||""} marks</Text>
                        <Text>{selectedSyllabus.examPattern?.numberOfQuestions ||""} Qs</Text>
                        <Text>{selectedSyllabus.examPattern?.duration ||""} mins</Text>
                        <Text>{selectedSyllabus.examPattern?.examMode ||""}</Text>
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Negative Marking">
                      {selectedSyllabus.examPattern?.negativeMarking ||"None"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Subjects">
                      {selectedSyllabus.subjects?.length || 0} subjects
                    </Descriptions.Item>
                    <Descriptions.Item label="Views"><EyeOutlined /> {selectedSyllabus.views || 0}</Descriptions.Item>
                    <Descriptions.Item label="Downloads"><DownloadOutlined /> {selectedSyllabus.downloads || 0}</Descriptions.Item>
                    {selectedSyllabus.syllabusPDF && (
                      <Descriptions.Item label="PDF" span={2}>
                        <Button type="link" icon={<FilePdfOutlined />} style={{ padding: 0 }}
                          href={selectedSyllabus.syllabusPDF.startsWith("http") ? selectedSyllabus.syllabusPDF : `${BACKEND_UPLOAD_URL}/${selectedSyllabus.syllabusPDF}`}
                          target="_blank">
                          View / Download PDF
                        </Button>
                      </Descriptions.Item>
                    )}
                    {selectedSyllabus.videoUrl && (
                      <Descriptions.Item label="Video" span={2}>
                        <Button type="link" icon={<VideoCameraOutlined />} style={{ padding: 0, color:"#ff0000" }}
                          href={selectedSyllabus.videoUrl} target="_blank">Watch Video</Button>
                      </Descriptions.Item>
                    )}
                    <Descriptions.Item label="Created" span={2}>
                      {moment(selectedSyllabus.createdAt).format("LLLL")}
                    </Descriptions.Item>
                    {selectedSyllabus.approvedAt && (
                      <Descriptions.Item label="Approved At" span={2}>
                        {moment(selectedSyllabus.approvedAt).format("LLLL")}
                      </Descriptions.Item>
                    )}
                  </Descriptions>

                  {/* Subjects list */}
                  {selectedSyllabus.subjects?.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                      <Text strong style={{ display:"block", marginBottom: 8 }}>
                        <BookOutlined style={{ marginRight: 6 }} />Subjects
                      </Text>
                      {selectedSyllabus.subjects.map((s, i) => (
                        <Card key={i} size="small" style={{ marginBottom: 8, borderRadius: 8 }}>
                          <Text strong>{s.subjectName}</Text>
                          {s.weightage && <Tag color="blue" style={{ marginLeft: 8 }}>{s.weightage}</Tag>}
                          {s.topics?.length > 0 && (
                            <div style={{ marginTop: 6 }}>
                              {s.topics.map((t, j) => <Tag key={j} style={{ marginBottom: 3, fontSize: 10 }}>{t}</Tag>)}
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Tags */}
                  {selectedSyllabus.tags?.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <Text strong style={{ display:"block", marginBottom: 6 }}><TagsOutlined style={{ marginRight: 6 }} />Tags</Text>
                      {selectedSyllabus.tags.map((t, i) => <Tag key={i} color="blue" style={{ marginBottom: 4 }}>{t}</Tag>)}
                    </div>
                  )}

                  {/* Flag toggles */}
                  {loginUser?.aname && (
                    <>
                      <Divider />
                      <Row gutter={8} style={{ marginBottom: 16 }}>
                        {([
                          { flag:"isFeatured" as const, label:"Featured", color:"#fadb14" },
                          { flag:"isPopular" as const, label:"Popular", color:"#fa8c16" },
                          { flag:"isPremium" as const, label:"Premium", color:"#722ed1" },
                        ] as const).map(({ flag, label, color }) => (
                          <Col span={8} key={flag}>
                            <Card size="small" style={{ textAlign:"center", borderColor: selectedSyllabus[flag] ? color +"44" : undefined }}>
                              <Text style={{ fontSize: 12, display:"block", color }}>{label}</Text>
                              <Switch
                                checked={selectedSyllabus[flag]}
                                onChange={() => handleToggleFlag(selectedSyllabus._id, flag, selectedSyllabus[flag], selectedSyllabus.examName)}
                                loading={actionLoading === selectedSyllabus._id}
                                size="small"
                                style={{ marginTop: 4, background: selectedSyllabus[flag] ? color : undefined }}
                              />
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </>
                  )}

                  <Space wrap>
                    {loginUser?.aname && (
                      selectedSyllabus.isApproved ? (
                        <Popconfirm title="Revoke approval?" onConfirm={() => handleApproval(selectedSyllabus._id, false, selectedSyllabus.examName)}
                          okText="Revoke" cancelText="Cancel" okType="danger">
                          <Button danger icon={<CloseCircleOutlined />} loading={actionLoading === selectedSyllabus._id}>
                            Revoke Approval
                          </Button>
                        </Popconfirm>
                      ) : (
                        <Popconfirm title="Approve this syllabus?" onConfirm={() => handleApproval(selectedSyllabus._id, true, selectedSyllabus.examName)}
                          okText="Approve" cancelText="Cancel">
                          <Button type="primary" icon={<CheckCircleOutlined />} loading={actionLoading === selectedSyllabus._id}>
                            Approve
                          </Button>
                        </Popconfirm>
                      )
                    )}
                    <Popconfirm title="Delete this syllabus?" description="Cannot be undone."
                      onConfirm={() => handleDelete(selectedSyllabus._id, selectedSyllabus.examName)}
                      okText="Delete" cancelText="Cancel" okType="danger">
                      <Button danger icon={<DeleteOutlined />} loading={actionLoading === selectedSyllabus._id}>Delete</Button>
                    </Popconfirm>
                  </Space>
                </div>
              );
            })()}
          </Drawer>
        </Content>

        <Footer style={{ textAlign:"center" }}>
          <Text type="secondary"><b>&copy; 2026 Draa. All Rights Reserved.</b></Text>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default SyllabusManagement;