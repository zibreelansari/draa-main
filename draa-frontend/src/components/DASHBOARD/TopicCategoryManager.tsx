import React, { useEffect, useState, useCallback, useMemo } from"react";
import {
  Form, Input, InputNumber, Button, Space, Typography, message,
  Popconfirm, Row, Col, Table, Layout, Switch, Tag, Modal, Select,
  Alert, Divider, Card, Drawer, Descriptions, Avatar, Tooltip,
  Progress, Badge,
} from"antd";
import {
  PlusOutlined, DeleteOutlined, EditOutlined, FileTextOutlined,
  UserOutlined, ReloadOutlined, EyeOutlined, CopyOutlined,
  ExportOutlined, FilterOutlined, SearchOutlined, CheckCircleOutlined,
  ClockCircleOutlined, StarOutlined, FireOutlined, BarChartOutlined,
  TrophyOutlined, BookOutlined, LockOutlined, UnlockOutlined,
  DollarOutlined, GlobalOutlined, SettingOutlined,
} from"@ant-design/icons";
import axios from"axios";
import { useNavigate } from"react-router-dom";
import url from"../../url";
import Topbar from"./Topbar";
import Sidebar from"./Sidebar";
import usePageTitle from '../../hooks/usePageTitle';

const { Title, Text } = Typography;
const { Content, Footer } = Layout;
const { TextArea } = Input;
const { Option } = Select;

//  Types 

interface ExaminationCategory {
  _id: string;
  name: string;
  code: string;
  year: number;
}

interface Subject {
  _id: string;
  name: string;
  code: string;
  examinationCategory: ExaminationCategory;
}

interface Teacher {
  _id: string;
  tname: string;
  temail?: string;
  tspecialization?: string;
  tprofile?: string;
  Status: string;
}

interface TopicCategory {
  _id: string;
  name: string;
  code: string;
  subject: Subject;
  description?: string;
  topicsCovered?: string[];
  difficulty?:"beginner" |"intermediate" |"advanced" |"mixed";
  estimatedStudyTime?: number;
  isActive: boolean;
  isFeatured?: boolean;
  isPremium?: boolean;
  priority?: number;
  icon?: string;
  color?: string;
  prerequisites?: string[];
  learningOutcomes?: string[];
  recommendedBooks?: Array<{ title: string; author: string; isbn?: string; link?: string }>;
  createdBy?: string | null;
  adminNotes?: string;

  createdAt: string;
  updatedAt?: string;
}

interface LoginUser { aname?: string; aemail?: string; }

interface Stats {
  total: number; active: number; inactive: number;
  paid: number; free: number; featured: number;
}

//  DIFFICULTY CONFIG 

const DIFFICULTY_COLOR: Record<string, string> = {
  advanced:"red", intermediate:"orange", beginner:"green", mixed:"blue",
};

//  StatCard 

const StatCard = ({
  title, value, icon, color, sub1, sub2,
}: {
  title: string; value: string | number; icon: React.ReactNode; color: string;
  sub1?: { label: string; value: string | number; color?: string };
  sub2?: { label: string; value: string | number; color?: string };
}) => (
  <Card style={{ borderRadius: 12, border: `1px solid ${color}22`, height:"100%" }} bodyStyle={{ padding:"20px 24px" }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
      <div style={{ flex: 1 }}>
        <Text type="secondary" style={{ fontSize: 11, fontWeight: 600, textTransform:"uppercase", letterSpacing: 0.5 }}>
          {title}
        </Text>
        <Title level={3} style={{ margin:"4px 0 0", color:"#1a1a1a", lineHeight: 1.2 }}>{value}</Title>
        {(sub1 || sub2) && (
          <div style={{ marginTop: 8, display:"flex", gap: 12, flexWrap:"wrap" }}>
            {sub1 && <Text style={{ fontSize: 11, color: sub1.color ??"#52c41a" }}><CheckCircleOutlined style={{ marginRight: 3 }} />{sub1.value} {sub1.label}</Text>}
            {sub2 && <Text style={{ fontSize: 11, color: sub2.color ??"#faad14" }}><ClockCircleOutlined style={{ marginRight: 3 }} />{sub2.value} {sub2.label}</Text>}
          </div>
        )}
      </div>
      <div style={{
        width: 48, height: 48, borderRadius: 12, background: `${color}18`,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize: 22, color, flexShrink: 0,
      }}>{icon}</div>
    </div>
  </Card>
);

//  Main Component 

const TopicCategoryManager: React.FC = () => {
  usePageTitle('Topics | Admin');
  const navigate = useNavigate();

  // Auth
  const [loginUser, setLoginUser] = useState<LoginUser | null>(null);

  // Data
  const [topicCategories, setTopicCategories] = useState<TopicCategory[]>([]);
  const [examCategories, setExamCategories] = useState<ExaminationCategory[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  // Loading
  const [loading, setLoading] = useState(false);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Selection
  const [selectedExamCategory, setSelectedExamCategory] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  // Modal / Drawer
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTopic, setEditingTopic] = useState<TopicCategory | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<TopicCategory | null>(null);

  // Form
  const [form] = Form.useForm();

  // Filters & Pagination
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  //  Auth 
  useEffect(() => {
    const raw = localStorage.getItem("edudocs");
    if (!raw) { navigate("/admin-login"); return; }
    try {
      const user = JSON.parse(raw);
      if (!user.aname) { message.error("Admin access required."); navigate("/admin-login"); return; }
      setLoginUser(user);
    } catch { navigate("/admin-login"); }
  }, [navigate]);

  //  Fetch Teachers 
  const fetchTeachers = useCallback(async () => {
    try {
      const res = await axios.get(`${url}/updateTeacherStatus/all`);
      if (res.data.success && res.data.data?.teachers) {
        setTeachers(res.data.data.teachers.filter((t: Teacher) => t.Status ==="approved"));
      } else {
        const fb = await axios.get(`${url}/count/getAllTeachers`);
        setTeachers(fb.data.Teachers ?? []);
      }
    } catch { /* non-critical */ }
  }, []);

  //  Fetch Exam Categories 
  const fetchExamCategories = useCallback(async () => {
    try {
      const res = await axios.get(`${url}/test-series/navigation/examinations`);
      if (res.data.success) setExamCategories(res.data.data.examinationCategories ?? []);
    } catch { message.error("Failed to load examination categories"); }
  }, []);

  //  Fetch Subjects 
  const fetchSubjects = useCallback(async (examCategoryId: string) => {
    if (!examCategoryId) { setSubjects([]); return; }
    setSubjectsLoading(true);
    try {
      const res = await axios.get(`${url}/test-series/navigation/examinations/${examCategoryId}/subjects`);
      if (res.data.success) setSubjects(res.data.data.subjects ?? []);
      else setSubjects([]);
    } catch { message.error("Failed to load subjects"); setSubjects([]); }
    finally { setSubjectsLoading(false); }
  }, []);

  //  Fetch Topic Categories 
  const fetchTopicCategories = useCallback(async (subjectId: string) => {
    if (!subjectId) {
      setTopicCategories([]);
      return;
    }

    setLoading(true);

    try {
      const res = await axios.get(
        `${url}/test-series/navigation/subjects/${subjectId}/topics`
      );

      if (res.data.success) {
        //  CLEAN DATA (REMOVE ANY OLD PRICING FIELDS IF STILL COMING)
        const cleaned = (res.data.data.topicCategories ?? []).map((t: any) => ({
          ...t,

          //  HARD REMOVE (defensive)
          isPaid: undefined,
          price: undefined,
          originalPrice: undefined,
          discount: undefined,
        }));

        setTopicCategories(cleaned);
      } else {
        setTopicCategories([]);
      }

    } catch (error) {
      message.error("Failed to load topic categories");
      setTopicCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  //  Initial Load 
  useEffect(() => {
    if (loginUser?.aname) { fetchExamCategories(); fetchTeachers(); }
  }, [loginUser?.aname, fetchExamCategories, fetchTeachers]);

  //  Stats 
  const stats = useMemo<Stats>(() => ({
    total: topicCategories.length,
    active: topicCategories.filter(t => t.isActive).length,
    inactive: topicCategories.filter(t => !t.isActive).length,
    paid: topicCategories.filter(t => t.isPaid).length,
    free: topicCategories.filter(t => !t.isPaid).length,
    featured: topicCategories.filter(t => t.isFeatured).length,
  }), [topicCategories]);

  //  Filtered Data 
  const filteredTopics = useMemo(() => {
    return topicCategories.filter(t => {
      const q = searchText.toLowerCase();
      const matchSearch = !q ||
        t.name.toLowerCase().includes(q) ||
        t.code.toLowerCase().includes(q) ||
        (t.description ??"").toLowerCase().includes(q);
      const matchStatus =
        statusFilter ==="all" ||
        (statusFilter ==="active" && t.isActive) ||
        (statusFilter ==="inactive" && !t.isActive) ||
        (statusFilter ==="featured" && t.isFeatured) ||
        (statusFilter ==="paid" && t.isPaid) ||
        (statusFilter ==="free" && !t.isPaid);
      const matchDiff =
        difficultyFilter ==="all" || t.difficulty === difficultyFilter;
      return matchSearch && matchStatus && matchDiff;
    });
  }, [topicCategories, searchText, statusFilter, difficultyFilter]);

  //  Selection Handlers 
  const onExamCategoryChange = (v: string) => {
    setSelectedExamCategory(v ??"");
    setSelectedSubject("");
    setSubjects([]);
    setTopicCategories([]);
    if (v) fetchSubjects(v);
  };

  const onSubjectChange = (v: string) => {
    setSelectedSubject(v ??"");
    setTopicCategories([]);
    if (v) fetchTopicCategories(v);
  };

  //  FIXED handleEdit 
  // No dot-notation keys  all nested via proper objects
  const handleEdit = (topic: TopicCategory) => {
    setEditingTopic(topic);

    //  Restore hierarchy
    setSelectedExamCategory(topic.subject.examinationCategory._id);
    setSelectedSubject(topic.subject._id);
    fetchSubjects(topic.subject.examinationCategory._id);

    form.setFieldsValue({
      name: topic.name,
      code: topic.code,
      description: topic.description ??"",
      difficulty: topic.difficulty ??"intermediate",
      estimatedStudyTime: topic.estimatedStudyTime,
      priority: topic.priority ?? 0,
      isActive: topic.isActive,
      isFeatured: topic.isFeatured ?? false,
      isPremium: topic.isPremium ?? false,
      icon: topic.icon ??"",
      color: topic.color ??"",
      adminNotes: topic.adminNotes ??"",

      //  REMOVED PRICING COMPLETELY

      assignedTeacher:
        typeof topic.createdBy ==="string" ? topic.createdBy : undefined,

      topicsCovered: (topic.topicsCovered ?? []).join("\n"),
      prerequisites: (topic.prerequisites ?? []).join("\n"),
      learningOutcomes: (topic.learningOutcomes ?? []).join("\n"),

      //  Books
      bookTitle: topic.recommendedBooks?.[0]?.title ??"",
      bookAuthor: topic.recommendedBooks?.[0]?.author ??"",
      bookIsbn: topic.recommendedBooks?.[0]?.isbn ??"",
      bookLink: topic.recommendedBooks?.[0]?.link ??"",
    });

    setModalVisible(true);
  };

  //  Submit 
  const handleSubmit = async (values: any) => {
    if (!selectedSubject) {
      message.error("Please select a subject first");
      return;
    }

    setSubmitLoading(true);

    try {
      const payload = {
        ...values,

        subject: selectedSubject,
        createdBy: values.assignedTeacher ?? null,

        //  Arrays
        topicsCovered: (values.topicsCovered ??"")
          .split("\n").map((s: string) => s.trim()).filter(Boolean),

        prerequisites: (values.prerequisites ??"")
          .split("\n").map((s: string) => s.trim()).filter(Boolean),

        learningOutcomes: (values.learningOutcomes ??"")
          .split("\n").map((s: string) => s.trim()).filter(Boolean),

        //  REMOVE PRICING COMPLETELY
        // isPaid 
        // price 
        // originalPrice 
        // discount 

        //  Books
        recommendedBooks: values.bookTitle
          ? [{
            title: values.bookTitle,
            author: values.bookAuthor,
            isbn: values.bookIsbn,
            link: values.bookLink
          }]
          : [],
      };

      //  Remove UI-only fields
      delete payload.assignedTeacher;
      delete payload.bookTitle;
      delete payload.bookAuthor;
      delete payload.bookIsbn;
      delete payload.bookLink;

      if (editingTopic) {
        await axios.put(
          `${url}/test-series/admin/topics/${editingTopic._id}`,
          payload
        );
        message.success("Topic category updated successfully!");
      } else {
        await axios.post(
          `${url}/test-series/admin/topics`,
          payload
        );
        message.success("Topic category created successfully!");
      }

      //  Reset
      setModalVisible(false);
      setEditingTopic(null);
      form.resetFields();
      fetchTopicCategories(selectedSubject);

    } catch (err: any) {
      message.error(err.response?.data?.message ??"Failed to save topic category");
    } finally {
      setSubmitLoading(false);
    }
  };

  //  Delete 
  const handleDelete = useCallback(async (id: string, name: string) => {
    setActionLoading(id);
    try {
      await axios.delete(`${url}/test-series/admin/topics/${id}`);
      message.success(`"${name}" deleted successfully!`);
      setTopicCategories(prev => prev.filter(t => t._id !== id));
    } catch (err: any) {
      message.error(err.response?.data?.message ??"Failed to delete");
    } finally { setActionLoading(null); }
  }, []);

  //  Toggle Active 
  const handleToggleActive = useCallback(async (topic: TopicCategory) => {
    setActionLoading(topic._id);
    try {
      await axios.put(`${url}/test-series/admin/topics/${topic._id}`, { isActive: !topic.isActive });
      message.success(`"${topic.name}" ${!topic.isActive ?"activated" :"deactivated"}!`);
      fetchTopicCategories(selectedSubject);
    } catch { message.error("Failed to update status"); }
    finally { setActionLoading(null); }
  }, [selectedSubject, fetchTopicCategories]);

  //  Toggle Featured 
  const handleToggleFeatured = useCallback(async (topic: TopicCategory) => {
    try {
      await axios.put(`${url}/test-series/admin/topics/${topic._id}`, { isFeatured: !topic.isFeatured });
      message.success(`${!topic.isFeatured ?"Featured!" :"Unfeatured"}`);
      fetchTopicCategories(selectedSubject);
    } catch { message.error("Failed to update featured status"); }
  }, [selectedSubject, fetchTopicCategories]);

  //  Duplicate 
  const handleDuplicate = (topic: TopicCategory) => {
    setEditingTopic(null);
    form.resetFields();

    form.setFieldsValue({
      name: topic.name +" (Copy)",
      code: topic.code +"-COPY",
      description: topic.description,
      difficulty: topic.difficulty,
      estimatedStudyTime: topic.estimatedStudyTime,
      priority: topic.priority ?? 0,
      isActive: false,
      isFeatured: false,

      //  REMOVED PRICING COMPLETELY

      topicsCovered: (topic.topicsCovered ?? []).join("\n"),
      prerequisites: (topic.prerequisites ?? []).join("\n"),
      learningOutcomes: (topic.learningOutcomes ?? []).join("\n"),
    });

    setModalVisible(true);
    message.info("Duplicated  update name & code before saving");
  };

  //  Export CSV 
  const handleExport = () => {
    const rows = [
"Name,Code,Subject,Difficulty,Study Time,Status,Featured,Priority,Topics Count,Created At",

      ...filteredTopics.map(t => [
        `"${t.name}"`,
        `"${t.code}"`,
        `"${t.subject.name} (${t.subject.examinationCategory.name})"`,
        `"${t.difficulty ??"mixed"}"`,
        t.estimatedStudyTime ?? 0,

        //  REMOVED PRICING
        // isPaid 
        // price 

        `"${t.isActive ?"Active" :"Inactive"}"`,
        `"${t.isFeatured ?"Yes" :"No"}"`,
        t.priority ?? 0,
        t.topicsCovered?.length ?? 0,
        `"${new Date(t.createdAt).toLocaleDateString()}"`,
      ].join(",")),
    ].join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", `data:text/csv;charset=utf-8,${encodeURI(rows)}`);
    link.setAttribute("download", `topic-categories-${Date.now()}.csv`);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    message.success("Exported!");
  };

  const clearFilters = () => { setSearchText(""); setStatusFilter("all"); setDifficultyFilter("all"); setCurrentPage(1); };
  const isFiltered = !!(searchText || statusFilter !=="all" || difficultyFilter !=="all");

  const openCreateModal = () => {
    if (!selectedSubject) { message.error("Please select a subject first"); return; }
    setEditingTopic(null);
    form.resetFields();
    form.setFieldsValue({
      isActive: true, isFeatured: false, isPremium: false,
      priority: 0, difficulty:"intermediate", isPaid: false, price: 0,
    });
    setModalVisible(true);
  };

  if (!loginUser?.aname) return null;

  const activeRate = stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0;

  //  Table Columns 
  const columns = [
    {
      title:"Topic Category",
      key:"topic",
      width: 300,
      render: (_: any, r: TopicCategory) => (
        <div>
          <Space size={6} style={{ marginBottom: 4 }}>
            <Tag color={r.color ||"green"} style={{ fontWeight: 700 }}>{r.code}</Tag>
            <Text strong style={{ color:"#1890ff", cursor:"pointer" }}
              onClick={() => { setSelectedTopic(r); setDetailDrawerOpen(true); }}>
              {r.name}
            </Text>
            {r.isFeatured && <Tag color="gold" style={{ fontSize: 10 }}></Tag>}
            {r.isPremium && <Tag color="purple" style={{ fontSize: 10 }}></Tag>}
          </Space>
          <div>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {r.subject.examinationCategory.name}  {r.subject.name}
            </Text>
          </div>
          {r.description && (
            <Text type="secondary" style={{ fontSize: 11, display:"block", marginTop: 2 }}>
              {r.description.length > 70 ? r.description.substring(0, 70) +"" : r.description}
            </Text>
          )}
        </div>
      ),
    },
    {
      title:"Difficulty & Time",
      key:"difficulty",
      width: 160,
      render: (_: any, r: TopicCategory) => (
        <Space direction="vertical" size={2}>
          <Tag color={DIFFICULTY_COLOR[r.difficulty ??"mixed"]}>
            {(r.difficulty ??"MIXED").toUpperCase()}
          </Tag>
          <Text style={{ fontSize: 11 }}>
            {r.estimatedStudyTime ? ` ${r.estimatedStudyTime} hrs` :"No estimate"}
          </Text>
          <Text style={{ fontSize: 11 }}>
             {r.topicsCovered?.length ?? 0} topics
          </Text>
        </Space>
      ),
    },

    {
      title:"Status",
      key:"status",
      width: 110,
      render: (_: any, r: TopicCategory) => (
        <Tooltip title="Toggle Active/Inactive">
          <Switch
            checked={r.isActive}
            onChange={() => handleToggleActive(r)}
            checkedChildren="Active"
            unCheckedChildren="Off"
            size="small"
            loading={actionLoading === r._id}
          />
        </Tooltip>
      ),
    },
    {
      title:"Featured",
      key:"featured",
      width: 90,
      render: (_: any, r: TopicCategory) => (
        <Tooltip title="Toggle Featured">
          <Switch
            checked={r.isFeatured ?? false}
            onChange={() => handleToggleFeatured(r)}
            checkedChildren=""
            unCheckedChildren="No"
            size="small"
          />
        </Tooltip>
      ),
    },
    {
      title:"Priority",
      dataIndex:"priority",
      width: 80,
      sorter: (a: TopicCategory, b: TopicCategory) => (a.priority ?? 0) - (b.priority ?? 0),
      render: (v: number) => <Text style={{ fontSize: 12 }}>{v ?? 0}</Text>,
    },
    {
      title:"Actions",
      key:"actions",
      width: 200,
      fixed:"right" as const,
      render: (_: any, r: TopicCategory) => (
        <Space size={4} wrap>
          <Tooltip title="View Details">
            <Button type="text" size="small" icon={<EyeOutlined />}
              onClick={() => { setSelectedTopic(r); setDetailDrawerOpen(true); }} />
          </Tooltip>
          <Tooltip title="Edit">
            <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)} />
          </Tooltip>
          <Tooltip title="Duplicate">
            <Button type="text" size="small" icon={<CopyOutlined />} onClick={() => handleDuplicate(r)} />
          </Tooltip>
          <Popconfirm
            title={`Delete"${r.name}"?`}
            description="This cannot be undone."
            onConfirm={() => handleDelete(r._id, r.name)}
            okText="Delete" cancelText="Cancel" okType="danger"
          >
            <Tooltip title="Delete">
              <Button danger type="text" size="small" icon={<DeleteOutlined />} loading={actionLoading === r._id} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  //  Render 
  return (
    <Layout style={{ minHeight:"100vh" }}>
      <Sidebar />
      <Layout>
        <Topbar />
        <Content style={{ margin:"16px", padding:"0 8px" }}>

          {/*  Header Banner  */}
          <div style={{
            background:"linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
            borderRadius: 16, padding:"28px 32px", marginBottom: 24,
            display:"flex", justifyContent:"space-between", alignItems:"center",
            flexWrap:"wrap", gap: 16,
          }}>
            <div>
              <Title level={2} style={{ color:"#fff", margin: 0 }}>
                <FileTextOutlined style={{ marginRight: 10, color:"#faad14" }} />
                Topic Category Management
              </Title>
              <Text style={{ color:"rgba(255,255,255,0.6)", fontSize: 14 }}>
                Admin Panel  Create, manage &amp; assign topic categories to subjects on behalf of teachers
              </Text>
            </div>
            <Space wrap>
              <Button icon={<ReloadOutlined />}
                onClick={() => { fetchExamCategories(); fetchTeachers(); if (selectedSubject) fetchTopicCategories(selectedSubject); }}
                loading={loading}
                style={{ background:"rgba(255,255,255,0.12)", color:"#fff", border:"1px solid rgba(255,255,255,0.25)", borderRadius: 8 }}>
                Refresh
              </Button>
              <Button icon={<ExportOutlined />} onClick={handleExport}
                disabled={filteredTopics.length === 0}
                style={{ background:"rgba(255,255,255,0.12)", color:"#fff", border:"1px solid rgba(255,255,255,0.25)", borderRadius: 8 }}>
                Export CSV
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}
                disabled={!selectedSubject} style={{ borderRadius: 8 }}>
                Add Topic Category
              </Button>
            </Space>
          </div>

          {/*  Stats  */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={12} sm={8} lg={4}>
              <StatCard title="Total Topics" value={stats.total} icon={<FileTextOutlined />} color="#1890ff"
                sub1={{ label:"active", value: stats.active }}
                sub2={{ label:"inactive", value: stats.inactive, color:"#ff4d4f" }} />
            </Col>
            <Col xs={12} sm={8} lg={4}>
              <StatCard title="Active" value={stats.active} icon={<CheckCircleOutlined />} color="#52c41a"
                sub1={{ label:"of total", value: `${activeRate}%` }} />
            </Col>
            <Col xs={12} sm={8} lg={4}>
              <StatCard title="Featured" value={stats.featured} icon={<StarOutlined />} color="#eb2f96" />
            </Col>
            <Col xs={12} sm={8} lg={4}>
              <StatCard title="Paid Topics" value={stats.paid} icon={<DollarOutlined />} color="#faad14"
                sub2={{ label:"free", value: stats.free, color:"#52c41a" }} />
            </Col>
            <Col xs={12} sm={8} lg={4}>
              <StatCard title="Exam Categories" value={examCategories.length} icon={<TrophyOutlined />} color="#722ed1" />
            </Col>
            <Col xs={12} sm={8} lg={4}>
              <Card style={{ borderRadius: 12, border:"1px solid #52c41a22", height:"100%" }} bodyStyle={{ padding:"20px 24px" }}>
                <Text type="secondary" style={{ fontSize: 11, fontWeight: 600, textTransform:"uppercase" }}>Active Rate</Text>
                <Title level={3} style={{ margin:"4px 0 6px", color:"#1a1a1a" }}>{activeRate}%</Title>
                <Progress percent={activeRate} size="small" strokeColor="#52c41a" showInfo={false} />
              </Card>
            </Col>
          </Row>

          {/*  Hierarchy Selectors  */}
          <Card style={{ marginBottom: 16, borderRadius: 12 }} bodyStyle={{ padding:"16px 20px" }}>
            <Row gutter={[16, 12]} align="middle">
              <Col xs={24} sm={10} lg={7}>
                <Text strong style={{ display:"block", marginBottom: 6 }}>Examination Category</Text>
                <Select
                  placeholder="1. Select Examination Category"
                  value={selectedExamCategory || undefined}
                  onChange={onExamCategoryChange}
                  style={{ width:"100%" }}
                  showSearch optionFilterProp="children" allowClear
                >
                  {examCategories.map(e => (
                    <Option key={e._id} value={e._id}>
                      <Tag>{e.code}</Tag> {e.name} ({e.year})
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={10} lg={7}>
                <Text strong style={{ display:"block", marginBottom: 6 }}>Subject</Text>
                <Select
                  placeholder="2. Select Subject"
                  value={selectedSubject || undefined}
                  onChange={onSubjectChange}
                  style={{ width:"100%" }}
                  disabled={!selectedExamCategory}
                  loading={subjectsLoading}
                  showSearch optionFilterProp="children" allowClear
                >
                  {subjects.map(s => (
                    <Option key={s._id} value={s._id}>
                      <Tag>{s.code}</Tag> {s.name}
                    </Option>
                  ))}
                </Select>
                {selectedExamCategory && !subjectsLoading && subjects.length === 0 && (
                  <Text type="secondary" style={{ fontSize: 11, display:"block", marginTop: 4 }}>
                    No subjects found. Create subjects first.
                  </Text>
                )}
              </Col>
              <Col xs={24} sm={4} lg={10}>
                <div style={{ fontSize: 12, color:"#666", display:"flex", gap: 16, flexWrap:"wrap", paddingTop: 22 }}>
                  <span> Categories: <b>{examCategories.length}</b></span>
                  <span> Subjects: <b>{subjects.length}</b></span>
                  <span> Topics: <b>{topicCategories.length}</b></span>
                </div>
              </Col>
            </Row>
          </Card>

          {/*  Filters  */}
          <Card style={{ marginBottom: 16, borderRadius: 12 }} bodyStyle={{ padding:"12px 20px" }}>
            <Row gutter={[12, 12]} align="middle">
              <Col xs={24} sm={8} lg={6}>
                <Input placeholder="Search name, code, description..."
                  prefix={<SearchOutlined />} value={searchText}
                  onChange={e => setSearchText(e.target.value)} allowClear
                  disabled={!selectedSubject} />
              </Col>
              <Col xs={12} sm={4} lg={3}>
                <Select value={statusFilter} onChange={v => { setStatusFilter(v); setCurrentPage(1); }}
                  style={{ width:"100%" }} disabled={!selectedSubject}>
                  <Option value="all">All Status</Option>
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                  <Option value="featured"> Featured</Option>
                  <Option value="paid"> Paid</Option>
                  <Option value="free"> Free</Option>
                </Select>
              </Col>
              <Col xs={12} sm={4} lg={3}>
                <Select value={difficultyFilter} onChange={v => { setDifficultyFilter(v); setCurrentPage(1); }}
                  style={{ width:"100%" }} disabled={!selectedSubject}>
                  <Option value="all">All Levels</Option>
                  <Option value="beginner">Beginner</Option>
                  <Option value="intermediate">Intermediate</Option>
                  <Option value="advanced">Advanced</Option>
                  <Option value="mixed">Mixed</Option>
                </Select>
              </Col>
              <Col xs={12} sm={3} lg={2}>
                <Button icon={<FilterOutlined />} onClick={clearFilters} disabled={!isFiltered} block>
                  Clear
                </Button>
              </Col>
            </Row>
          </Card>

          {isFiltered && (
            <Alert message={`Showing ${filteredTopics.length} of ${topicCategories.length} topic categories`}
              type="info" showIcon closable style={{ marginBottom: 12, borderRadius: 8 }} />
          )}

          {selectedSubject && topicCategories.length === 0 && !loading && (
            <Alert message="No Topic Categories Found"
              description='No topic categories exist for this subject yet. Click"Add Topic Category" to create one.'
              type="info" showIcon style={{ marginBottom: 16, borderRadius: 8 }} />
          )}

          {/*  Table  */}
          <Card
            title={
              <Space>
                <FileTextOutlined style={{ color:"#faad14" }} />
                <Text strong>
                  {selectedSubject
                    ? `Topic Categories  ${subjects.find(s => s._id === selectedSubject)?.name ??""} (${filteredTopics.length})`
                    :"Topic Categories"}
                </Text>
                {isFiltered && <Tag color="blue">Filtered</Tag>}
              </Space>
            }
            style={{ borderRadius: 12 }}
            bodyStyle={{ padding: 0 }}
          >
            <Table
              rowKey="_id"
              columns={columns}
              dataSource={filteredTopics}
              loading={loading}
              scroll={{ x: 1200 }}
              pagination={{
                current: currentPage,
                pageSize,
                total: filteredTopics.length,
                onChange: (p, s) => { setCurrentPage(p); setPageSize(s ?? 10); },
                onShowSizeChange: (_, s) => { setCurrentPage(1); setPageSize(s); },
                showSizeChanger: true,
                showQuickJumper: true,
                pageSizeOptions: ["10","20","50","100"],
                showTotal: (tot, range) => `${range[0]}-${range[1]} of ${tot} topics`,
                style: { padding:"12px 24px", borderTop:"1px solid #f0f0f0" },
              }}
              size="small"
              locale={{
                emptyText: selectedSubject
                  ?"No topic categories found."
                  :"Select an examination category and subject above.",
              }}
            />
          </Card>
        </Content>

        {/* 
            CREATE / EDIT MODAL
         */}
        <Modal
          title={
            <Space>
              {editingTopic ? <EditOutlined style={{ color:"#1890ff" }} /> : <PlusOutlined style={{ color:"#52c41a" }} />}
              <span>{editingTopic ? `Edit: ${editingTopic.name}` :"Create Topic Category"}</span>
              {editingTopic && <Tag color={editingTopic.isActive ?"success" :"error"}>{editingTopic.isActive ?"Active" :"Inactive"}</Tag>}
            </Space>
          }
          open={modalVisible}
          onCancel={() => { setModalVisible(false); setEditingTopic(null); form.resetFields(); }}
          footer={null}
          width={920}
          destroyOnClose
          style={{ top: 20 }}
        >
          <div style={{ maxHeight:"80vh", overflowY:"auto", paddingRight: 8 }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{ isActive: true, isFeatured: false, isPremium: false, priority: 0, difficulty:"intermediate", isPaid: false, price: 0, originalPrice: 0, discount: 0 }}
            >
              {/*  Admin: Assign Teacher  */}
              <Card size="small" style={{ marginBottom: 16, background:"#f0f7ff", border:"1px solid #91caff", borderRadius: 8 }}>
                <Row gutter={16} align="middle">
                  <Col xs={24} sm={14}>
                    <Form.Item name="assignedTeacher"
                      label={<Space><UserOutlined style={{ color:"#1890ff" }} /><Text strong style={{ color:"#1890ff" }}>Assign to Teacher (on behalf of)</Text></Space>}
                      style={{ marginBottom: 0 }}>
                      <Select showSearch placeholder="Select teacher (optional)" optionFilterProp="children" allowClear style={{ width:"100%" }}>
                        {teachers.map(t => (
                          <Option key={t._id} value={t._id}>
                            <Space>
                              <Avatar icon={<UserOutlined />} size="small" />
                              {t.tname}
                              {t.tspecialization && <Text type="secondary" style={{ fontSize: 11 }}> {t.tspecialization}</Text>}
                            </Space>
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={10}>
                    <div style={{ background:"#fff", border:"1px dashed #91caff", borderRadius: 6, padding:"8px 12px" }}>
                      <Text style={{ fontSize: 11, color:"#1890ff" }}>
                         <strong>Admin Action</strong>: Creating this topic on behalf of the selected teacher.
                      </Text>
                    </div>
                  </Col>
                </Row>
              </Card>

              {/* Context info */}
              <Alert
                message="Selected Hierarchy"
                description={
                  <span>
                    <strong>Exam:</strong> {examCategories.find(e => e._id === selectedExamCategory)?.name ??"Not selected"} &nbsp;&nbsp;
                    <strong>Subject:</strong> {subjects.find(s => s._id === selectedSubject)?.name ??"Not selected"}
                  </span>
                }
                type="info" style={{ marginBottom: 16, borderRadius: 8 }}
              />

              <Divider orientation="left" plain>Basic Information</Divider>
              <Row gutter={16}>
                <Col span={16}>
                  <Form.Item name="name" label="Topic Category Name" rules={[{ required: true }]}>
                    <Input placeholder="e.g., Reasoning and Comprehension" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="code" label="Topic Code" rules={[{ required: true }]}>
                    <Input placeholder="e.g., RC" style={{ textTransform:"uppercase" }} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="description" label="Description">
                <TextArea rows={3} placeholder="Brief description of the topic category" maxLength={500} showCount />
              </Form.Item>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="difficulty" label="Difficulty Level">
                    <Select>
                      <Option value="beginner">Beginner</Option>
                      <Option value="intermediate">Intermediate</Option>
                      <Option value="advanced">Advanced</Option>
                      <Option value="mixed">Mixed</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="estimatedStudyTime" label="Study Time (hours)">
                    <InputNumber min={1} max={500} style={{ width:"100%" }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="priority" label="Priority">
                    <InputNumber min={0} max={100} style={{ width:"100%" }} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="icon" label="Icon (CSS class)">
                    <Input placeholder="e.g., fa-brain" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="color" label="Color (hex)">
                    <Input placeholder="e.g., #52c41a" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="isActive" label="Active" valuePropName="checked">
                    <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="isFeatured" label="Featured" valuePropName="checked">
                    <Switch checkedChildren=" Featured" unCheckedChildren="No" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="isPremium" label="Premium" valuePropName="checked">
                    <Switch checkedChildren=" Premium" unCheckedChildren="Free" />
                  </Form.Item>
                </Col>
              </Row>

              {/* <Divider orientation="left" plain> Pricing</Divider>
              <Alert
                message="Bulk Purchase Pricing  students get access to ALL test series under this topic after purchasing"
                type="info" showIcon style={{ marginBottom: 16, borderRadius: 8 }} closable
              />
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="isPaid" label="Paid Topic?" valuePropName="checked">
                    <Switch checkedChildren=" Paid" unCheckedChildren=" Free" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item noStyle shouldUpdate={(p, c) => p.isPaid !== c.isPaid || p.price !== c.price || p.originalPrice !== c.originalPrice}>
                {({ getFieldValue, setFieldsValue }) => {
                  const isPaid = getFieldValue("isPaid");
                  const price = getFieldValue("price") ?? 0;
                  const orig  = getFieldValue("originalPrice") ?? 0;
                  if (orig > price && price > 0) {
                    const calc = Math.round(((orig - price) / orig) * 100);
                    if (getFieldValue("discount") !== calc) setTimeout(() => setFieldsValue({ discount: calc }), 0);
                  } else if (getFieldValue("discount") !== 0) {
                    setTimeout(() => setFieldsValue({ discount: 0 }), 0);
                  }
                  return isPaid ? (
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item name="price" label="Selling Price ()" rules={[{ required: true, message:"Enter price" }]}>
                          <InputNumber min={0} style={{ width:"100%" }} prefix="" size="large" placeholder="e.g., 344" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="originalPrice" label="Original Price ()">
                          <InputNumber min={0} style={{ width:"100%" }} prefix="" size="large" placeholder="e.g., 500" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="discount" label="Discount (%)  auto">
                          <InputNumber min={0} max={100} style={{ width:"100%" }} suffix="%" size="large" disabled />
                        </Form.Item>
                      </Col>
                    </Row>
                  ) : (
                    <Alert message=" Free Topic  All test series under this topic will be freely accessible"
                      type="success" showIcon style={{ marginBottom: 16, borderRadius: 8 }} />
                  );
                }}
              </Form.Item> */}

              <Divider orientation="left" plain>Content</Divider>
              <Form.Item name="topicsCovered" label="Topics Covered (one per line)">
                <TextArea rows={4} placeholder={"e.g.\nSyllogisms\nBlood Relations\nCoding-Decoding"} />
              </Form.Item>
              <Form.Item name="prerequisites" label="Prerequisites (one per line)">
                <TextArea rows={2} placeholder="e.g. Basic Mathematics" />
              </Form.Item>
              <Form.Item name="learningOutcomes" label="Learning Outcomes (one per line)">
                <TextArea rows={3} placeholder="e.g. Solve 50+ problem types" />
              </Form.Item>

              <Divider orientation="left" plain>Recommended Book</Divider>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="bookTitle" label="Book Title">
                    <Input placeholder="Enter book title" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="bookAuthor" label="Author">
                    <Input placeholder="Enter author name" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="bookIsbn" label="ISBN">
                    <Input placeholder="Enter ISBN" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="bookLink" label="Purchase Link">
                    <Input placeholder="https://..." />
                  </Form.Item>
                </Col>
              </Row>

              {/* Admin Notes */}
              <Card size="small" style={{ marginBottom: 16, background:"#fffbf0", border:"1px solid #ffe58f", borderRadius: 8 }}>
                <Form.Item name="adminNotes"
                  label={<Text strong style={{ color:"#d48806" }}>Admin Notes (Internal Only)</Text>}
                  style={{ marginBottom: 0 }}>
                  <TextArea rows={2} placeholder="Internal notes  not visible to students" />
                </Form.Item>
              </Card>

              <Form.Item style={{ marginBottom: 0 }}>
                <Space>
                  <Button type="primary" htmlType="submit" loading={submitLoading}
                    icon={editingTopic ? <EditOutlined /> : <PlusOutlined />}>
                    {editingTopic ?"Update Topic Category" :"Create Topic Category"}
                  </Button>
                  <Button onClick={() => { setModalVisible(false); setEditingTopic(null); form.resetFields(); }}>
                    Cancel
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        </Modal>

        {/* 
            DETAIL DRAWER
         */}
        <Drawer
          title={
            <Space>
              <Tag color={selectedTopic?.color ||"green"} style={{ fontWeight: 700 }}>{selectedTopic?.code}</Tag>
              {selectedTopic?.name}
              {selectedTopic?.isFeatured && <Tag color="gold"> Featured</Tag>}
              {selectedTopic?.isPremium && <Tag color="purple"> Premium</Tag>}
            </Space>
          }
          placement="right"
          width={580}
          onClose={() => { setDetailDrawerOpen(false); setSelectedTopic(null); }}
          open={detailDrawerOpen}
          extra={
            <Button type="primary" icon={<EditOutlined />}
              onClick={() => { setDetailDrawerOpen(false); if (selectedTopic) handleEdit(selectedTopic); }}>
              Edit
            </Button>
          }
        >
          {selectedTopic && (
            <div>
              <Space wrap style={{ marginBottom: 16 }}>
                <Tag color={selectedTopic.isActive ?"success" :"error"}>{selectedTopic.isActive ?"Active" :"Inactive"}</Tag>
                <Tag color={DIFFICULTY_COLOR[selectedTopic.difficulty ??"mixed"]}>{(selectedTopic.difficulty ??"mixed").toUpperCase()}</Tag>
                <Tag>Priority: {selectedTopic.priority ?? 0}</Tag>
                {selectedTopic.isPaid ? <Tag color="orange">{selectedTopic.price}</Tag> : <Tag color="green"> FREE</Tag>}
              </Space>

              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Hierarchy">
                  {selectedTopic.subject.examinationCategory.name}  {selectedTopic.subject.name}
                </Descriptions.Item>
                <Descriptions.Item label="Description">{selectedTopic.description ||""}</Descriptions.Item>
                <Descriptions.Item label="Study Time">
                  {selectedTopic.estimatedStudyTime ? `${selectedTopic.estimatedStudyTime} hours` :""}
                </Descriptions.Item>
                <Descriptions.Item label="Pricing">
                  {selectedTopic.isPaid ? (
                    <Space>
                      <Text strong style={{ color:"#52c41a" }}>{selectedTopic.price}</Text>
                      {selectedTopic.originalPrice && selectedTopic.originalPrice > (selectedTopic.price ?? 0) && (
                        <Text delete type="secondary">{selectedTopic.originalPrice}</Text>
                      )}
                      {selectedTopic.discount ? <Tag color="red">{selectedTopic.discount}% OFF</Tag> : null}
                    </Space>
                  ) : <Tag color="green"> FREE</Tag>}
                </Descriptions.Item>
                <Descriptions.Item label="Topics Covered">
                  {selectedTopic.topicsCovered?.length ? (
                    <Space wrap>{selectedTopic.topicsCovered.map((t, i) => <Tag key={i} style={{ fontSize: 11 }}>{t}</Tag>)}</Space>
                  ) :""}
                </Descriptions.Item>
                <Descriptions.Item label="Prerequisites">
                  {selectedTopic.prerequisites?.length ? (
                    <Space wrap>{selectedTopic.prerequisites.map((p, i) => <Tag key={i} color="orange">{p}</Tag>)}</Space>
                  ) :""}
                </Descriptions.Item>
                <Descriptions.Item label="Learning Outcomes">
                  {selectedTopic.learningOutcomes?.length ? (
                    <Space wrap>{selectedTopic.learningOutcomes.map((l, i) => <Tag key={i} color="blue">{l}</Tag>)}</Space>
                  ) :""}
                </Descriptions.Item>
                {selectedTopic.recommendedBooks?.length ? (
                  <Descriptions.Item label="Recommended Book">
                    <div>
                      <Text strong>{selectedTopic.recommendedBooks[0].title}</Text>  {selectedTopic.recommendedBooks[0].author}
                      {selectedTopic.recommendedBooks[0].link && (
                        <div><a href={selectedTopic.recommendedBooks[0].link} target="_blank" rel="noreferrer">Buy </a></div>
                      )}
                    </div>
                  </Descriptions.Item>
                ) : null}
                {selectedTopic.adminNotes && (
                  <Descriptions.Item label="Admin Notes">
                    <Text style={{ color:"#d48806" }}>{selectedTopic.adminNotes}</Text>
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Created">
                  {new Date(selectedTopic.createdAt).toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" })}
                </Descriptions.Item>
              </Descriptions>

              <div style={{ marginTop: 24 }}>
                <Space wrap>
                  <Button type="primary" icon={<EditOutlined />}
                    onClick={() => { setDetailDrawerOpen(false); handleEdit(selectedTopic); }}>Edit</Button>
                  <Button onClick={() => handleToggleActive(selectedTopic)}>
                    {selectedTopic.isActive ?"Deactivate" :"Activate"}
                  </Button>
                  <Button onClick={() => handleToggleFeatured(selectedTopic)}>
                    {selectedTopic.isFeatured ?"Unfeature" :" Feature"}
                  </Button>
                  <Button icon={<CopyOutlined />}
                    onClick={() => { setDetailDrawerOpen(false); handleDuplicate(selectedTopic); }}>Duplicate</Button>
                  <Popconfirm title={`Delete"${selectedTopic.name}"?`}
                    onConfirm={() => { handleDelete(selectedTopic._id, selectedTopic.name); setDetailDrawerOpen(false); }}
                    okText="Delete" okType="danger">
                    <Button danger icon={<DeleteOutlined />}>Delete</Button>
                  </Popconfirm>
                </Space>
              </div>
            </div>
          )}
        </Drawer>

        <Footer style={{ textAlign:"center", background:"transparent" }}>
          <Text type="secondary"><b>© 2026 Draa Admin Panel. All Rights Reserved.</b></Text>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default TopicCategoryManager;