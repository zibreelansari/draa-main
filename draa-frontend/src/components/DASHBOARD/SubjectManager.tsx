import React, { useEffect, useState, useCallback, useMemo } from"react";
import {
  Layout, Row, Col, Card, message, Typography, Space, Button, Tag,
  Table, Progress, Tooltip, Alert, Form, Input, InputNumber, Popconfirm,
  Modal, Select, Switch, Drawer, Descriptions, Divider, Avatar, Badge,
} from"antd";
import {
  BookOutlined, CheckCircleOutlined, ClockCircleOutlined, ReloadOutlined,
  TrophyOutlined, BarChartOutlined, PlusOutlined, EditOutlined, DeleteOutlined,
  EyeOutlined, FilterOutlined, SearchOutlined, UserOutlined, CopyOutlined,
  ExportOutlined, StarOutlined, FireOutlined, LockOutlined, UnlockOutlined,
  ArrowUpOutlined, ArrowDownOutlined, ExclamationCircleOutlined,
} from"@ant-design/icons";
import axios from"axios";
import { useNavigate } from"react-router-dom";
import url from"../../url";
import Topbar from"./Topbar";
import Sidebar from"./Sidebar";
import usePageTitle from '../../hooks/usePageTitle';

const { Content, Footer } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

//  Types 

interface ExaminationCategory {
  _id: string;
  name: string;
  code: string;
  year: number;
  createdBy?: string | { _id: string; tname?: string; name?: string; email?: string } | null;
}

interface Teacher {
  _id: string;
  tname: string;
  temail?: string;
  tspecialization?: string;
  tprofile?: string;
  Status: string;
}

interface Subject {
  _id: string;
  name: string;
  code: string;
  examinationCategory: ExaminationCategory;
  description?: string;
  syllabus?: string[];
  totalMarks?: number;
  duration?: number;
  questionPattern?: { mcq?: number; msa?: number; numerical?: number };
  weightage?: number;
  isActive: boolean;
  isFeatured?: boolean;
  isPremium?: boolean;
  priority?: number;
  icon?: string;
  color?: string;
  prerequisites?: string[];
  careerOpportunities?: string[];
  assignedTeacher?: string | null;
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

interface SubjectStats {
  total: number;
  active: number;
  inactive: number;
  avgWeightage: number;
  totalExams: number;
  featured: number;
}

interface LoginUser { aname?: string; aemail?: string; }

//  StatCard 

const StatCard = ({
  title, value, icon, color, sub1, sub2,
}: {
  title: string; value: string | number; icon: React.ReactNode; color: string;
  sub1?: { label: string; value: string | number; color?: string };
  sub2?: { label: string; value: string | number; color?: string };
}) => (
  <Card
    style={{ borderRadius: 12, border: `1px solid ${color}22`, height:"100%" }}
    bodyStyle={{ padding:"20px 24px" }}
  >
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
      <div style={{ flex: 1 }}>
        <Text type="secondary" style={{ fontSize: 11, fontWeight: 600, textTransform:"uppercase", letterSpacing: 0.5 }}>
          {title}
        </Text>
        <Title level={3} style={{ margin:"4px 0 0", color:"#1a1a1a", lineHeight: 1.2 }}>{value}</Title>
        {(sub1 || sub2) && (
          <div style={{ marginTop: 8, display:"flex", gap: 12, flexWrap:"wrap" }}>
            {sub1 && (
              <Text style={{ fontSize: 11, color: sub1.color ??"#52c41a" }}>
                <CheckCircleOutlined style={{ marginRight: 3 }} />{sub1.value} {sub1.label}
              </Text>
            )}
            {sub2 && (
              <Text style={{ fontSize: 11, color: sub2.color ??"#faad14" }}>
                <ClockCircleOutlined style={{ marginRight: 3 }} />{sub2.value} {sub2.label}
              </Text>
            )}
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

const SubjectManager: React.FC = () => {
  usePageTitle('Subjects | Admin');
  const navigate = useNavigate();

  // Auth
  const [loginUser, setLoginUser] = useState<LoginUser | null>(null);

  // Data
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [examCategories, setExamCategories] = useState<ExaminationCategory[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modal / Drawer
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  // Form
  const [form] = Form.useForm();

  // Filters
  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Pagination
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
    } catch { message.error("Failed to load exam categories"); }
  }, []);

  //  Fetch Subjects 
  const fetchSubjects = useCallback(async (examCategoryId?: string | null) => {
    if (!examCategoryId) { setSubjects([]); return; }
    setLoading(true);
    try {
      const res = await axios.get(
        `${url}/test-series/navigation/examinations/${examCategoryId}/subjects`
      );
      if (res.data.success) setSubjects(res.data.data.subjects ?? []);
    } catch { message.error("Failed to load subjects"); setSubjects([]); }
    finally { setLoading(false); }
  }, []);

  //  Initial Load 
  useEffect(() => {
    if (loginUser?.aname) { fetchExamCategories(); fetchTeachers(); }
  }, [loginUser?.aname, fetchExamCategories, fetchTeachers]);

  useEffect(() => {
    fetchSubjects(selectedCategoryId);
  }, [selectedCategoryId, fetchSubjects]);

  //  Stats 
  const stats = useMemo<SubjectStats>(() => {
    const total = subjects.length;
    const active = subjects.filter(s => s.isActive).length;
    const featured = subjects.filter(s => s.isFeatured).length;
    const ws = subjects.filter(s => s.weightage).map(s => s.weightage as number);
    const avg = ws.length ? parseFloat((ws.reduce((a, b) => a + b, 0) / ws.length).toFixed(1)) : 0;
    return { total, active, inactive: total - active, avgWeightage: avg, totalExams: examCategories.length, featured };
  }, [subjects, examCategories]);

  //  Filtered Data 
  const filteredSubjects = useMemo(() => {
    return subjects.filter(s => {
      const q = searchText.toLowerCase();
      const matchSearch = !q ||
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        (s.description ??"").toLowerCase().includes(q);
      const matchStatus =
        statusFilter ==="all" ||
        (statusFilter ==="active" && s.isActive) ||
        (statusFilter ==="inactive" && !s.isActive) ||
        (statusFilter ==="featured" && s.isFeatured) ||
        (statusFilter ==="premium" && s.isPremium);
      return matchSearch && matchStatus;
    });
  }, [subjects, searchText, statusFilter]);

  //  FIXED handleEdit 
  // Original bug: used dot-notation"questionPattern.mcq" which doesn't populate
  // nested Form.Item name={["questionPattern","mcq"]}. Must set as nested object.
  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);

    form.setFieldsValue({
      //  Basic Info
      name: subject.name,
      code: subject.code,
      description: subject.description ??"",
      totalMarks: subject.totalMarks,
      duration: subject.duration,
      weightage: subject.weightage,
      priority: subject.priority ?? 0,
      isActive: subject.isActive,
      isFeatured: subject.isFeatured ?? false,
      isPremium: subject.isPremium ?? false,
      icon: subject.icon ??"",
      color: subject.color ??"",
      adminNotes: subject.adminNotes ??"",

      //  Category
      examinationCategory: subject.examinationCategory._id,

      //   PRICING (VERY IMPORTANT)
      isPaid: subject.isPaid ?? false,
      price: subject.price ?? 0,
      originalPrice: subject.originalPrice ?? 0,
      discount: subject.discount ?? 0,

      //  Question Pattern (nested)
      questionPattern: {
        mcq: subject.questionPattern?.mcq,
        msa: subject.questionPattern?.msa,
        numerical: subject.questionPattern?.numerical,
      },

      //  Arrays  textarea
      syllabus: (subject.syllabus ?? []).join("\n"),
      prerequisites: (subject.prerequisites ?? []).join("\n"),
      careerOpportunities: (subject.careerOpportunities ?? []).join("\n"),

      //  Teacher
      assignedTeacher: subject.assignedTeacher ?? undefined,
    });

    setModalVisible(true);
  };

  //  Submit 
  const handleSubmit = async (values: any) => {
    setSubmitLoading(true);

    try {
      //  VALIDATION (VERY IMPORTANT)
      if (values.isPaid && (!values.price || values.price <= 0)) {
        message.error("Please enter a valid price for paid subject");
        return;
      }

      const payload = {
        ...values,

        //  Arrays
        syllabus: (values.syllabus ??"")
          .split("\n").map((s: string) => s.trim()).filter(Boolean),

        prerequisites: (values.prerequisites ??"")
          .split("\n").map((s: string) => s.trim()).filter(Boolean),

        careerOpportunities: (values.careerOpportunities ??"")
          .split("\n").map((s: string) => s.trim()).filter(Boolean),

        //  PRICING (IMPORTANT)
        isPaid: values.isPaid ?? false,
        price: values.isPaid ? values.price || 0 : 0,
        originalPrice: values.isPaid ? values.originalPrice || 0 : 0,

        //  NEVER SEND DISCOUNT (backend handles)
        discount: undefined
      };

      if (editingSubject) {
        await axios.put(
          `${url}/test-series/admin/subjects/${editingSubject._id}`,
          payload
        );
        message.success("Subject updated successfully!");
      } else {
        await axios.post(
          `${url}/test-series/admin/subjects`,
          payload
        );
        message.success("Subject created successfully!");
      }

      //  RESET
      setModalVisible(false);
      setEditingSubject(null);
      form.resetFields();
      fetchSubjects(selectedCategoryId);

    } catch (err: any) {
      message.error(err.response?.data?.message ??"Failed to save subject");
    } finally {
      setSubmitLoading(false);
    }
  };

  //  Delete 
  const handleDelete = useCallback(async (id: string, name: string) => {
    setActionLoading(id);
    try {
      await axios.delete(`${url}/test-series/admin/subjects/${id}`);
      message.success(`"${name}" deleted successfully!`);
      setSubjects(prev => prev.filter(s => s._id !== id));
    } catch (err: any) {
      message.error(err.response?.data?.message ??"Failed to delete subject");
    } finally { setActionLoading(null); }
  }, []);

  //  Toggle Active 
  const handleToggleActive = useCallback(async (subject: Subject) => {
    setActionLoading(subject._id);
    try {
      await axios.put(`${url}/test-series/admin/subjects/${subject._id}`, { isActive: !subject.isActive });
      message.success(`"${subject.name}" ${!subject.isActive ?"activated" :"deactivated"}!`);
      fetchSubjects(selectedCategoryId);
    } catch (err: any) {
      message.error(err.response?.data?.message ??"Failed to update status");
    } finally { setActionLoading(null); }
  }, [selectedCategoryId, fetchSubjects]);

  //  Toggle Featured 
  const handleToggleFeatured = useCallback(async (subject: Subject) => {
    try {
      await axios.put(`${url}/test-series/admin/subjects/${subject._id}`, { isFeatured: !subject.isFeatured });
      message.success(`${!subject.isFeatured ?"Featured!" :"Unfeatured"}`);
      fetchSubjects(selectedCategoryId);
    } catch { message.error("Failed to update featured status"); }
  }, [selectedCategoryId, fetchSubjects]);

  //  Duplicate 
  const handleDuplicate = (subject: Subject) => {
    setEditingSubject(null);
    form.resetFields();
    form.setFieldsValue({
      name: subject.name +" (Copy)",
      code: subject.code +"-COPY",
      description: subject.description,
      totalMarks: subject.totalMarks,
      duration: subject.duration,
      weightage: subject.weightage,
      priority: subject.priority ?? 0,
      isActive: false,
      isFeatured: false,
      examinationCategory: subject.examinationCategory._id,
      questionPattern: subject.questionPattern,
      syllabus: (subject.syllabus ?? []).join("\n"),
      prerequisites: (subject.prerequisites ?? []).join("\n"),
      careerOpportunities: (subject.careerOpportunities ?? []).join("\n"),
    });
    setModalVisible(true);
    message.info("Duplicated  update name & code before saving");
  };

  //  Export CSV 
  const handleExport = () => {
    const rows = [
"Name,Code,Category,Marks,Duration,Weightage,Status,Featured,Priority,Created At",
      ...filteredSubjects.map(s => [
        `"${s.name}"`, `"${s.code}"`,
        `"${s.examinationCategory.name} (${s.examinationCategory.year})"`,
        s.totalMarks ?? 0, s.duration ?? 0, s.weightage ?? 0,
        `"${s.isActive ?"Active" :"Inactive"}"`,
        `"${s.isFeatured ?"Yes" :"No"}"`,
        s.priority ?? 0,
        `"${new Date(s.createdAt).toLocaleDateString()}"`,
      ].join(",")),
    ].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", `data:text/csv;charset=utf-8,${encodeURI(rows)}`);
    link.setAttribute("download", `subjects-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success("Exported!");
  };

  const clearFilters = () => { setSearchText(""); setStatusFilter("all"); setCurrentPage(1); };

  const isFiltered = !!(searchText || statusFilter !=="all");

  const openCreateModal = () => {
    setEditingSubject(null);
    form.resetFields();
    if (selectedCategoryId) form.setFieldsValue({ examinationCategory: selectedCategoryId, isActive: true, priority: 0 });
    setModalVisible(true);
  };

  //  Table Columns 
  const columns = [
    {
      title:"Subject",
      key:"subject",
      width: 280,
      render: (_: any, r: Subject) => (
        <div>
          <Space size={6} style={{ marginBottom: 4 }}>
            <Tag color={r.color ||"blue"} style={{ fontWeight: 700, letterSpacing: 1 }}>{r.code}</Tag>
            <Text strong style={{ color:"#1890ff", cursor:"pointer" }}
              onClick={() => { setSelectedSubject(r); setDetailDrawerOpen(true); }}>
              {r.name}
            </Text>
            {r.isFeatured && <Tag color="gold" style={{ fontSize: 10 }}></Tag>}
            {r.isPremium && <Tag color="purple" style={{ fontSize: 10 }}></Tag>}
          </Space>
          <div>
            <Tag color="default" style={{ fontSize: 10 }}>{r.examinationCategory.code}</Tag>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {r.examinationCategory.name} ({r.examinationCategory.year})
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
      title:"Marks / Duration / Wt",
      key:"marks",
      width: 150,
      render: (_: any, r: Subject) => (
        <Space direction="vertical" size={1}>
          <Text style={{ fontSize: 12 }}><b>Marks:</b> {r.totalMarks ??""}</Text>
          <Text style={{ fontSize: 12 }}><b>Duration:</b> {r.duration ? `${r.duration}m` :""}</Text>
          <Text style={{ fontSize: 12 }}><b>Weightage:</b> {r.weightage ? `${r.weightage}%` :""}</Text>
          {r.weightage ? (
            <Progress percent={r.weightage} size="small" showInfo={false} strokeColor="#1890ff" style={{ width: 80 }} />
          ) : null}
        </Space>
      ),
    },
    {
      title:"Pattern",
      key:"pattern",
      width: 140,
      render: (_: any, r: Subject) => {
        if (!r.questionPattern) return <Text type="secondary" style={{ fontSize: 11 }}>Not set</Text>;
        return (
          <Space direction="vertical" size={2}>
            {r.questionPattern.mcq != null && <Tag color="blue" style={{ fontSize: 10 }}>MCQ: {r.questionPattern.mcq}</Tag>}
            {r.questionPattern.msa != null && <Tag color="purple" style={{ fontSize: 10 }}>MSA: {r.questionPattern.msa}</Tag>}
            {r.questionPattern.numerical != null && <Tag color="cyan" style={{ fontSize: 10 }}>Num: {r.questionPattern.numerical}</Tag>}
          </Space>
        );
      },
    },
    {
      title:"Status",
      key:"status",
      width: 110,
      render: (_: any, r: Subject) => (
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
      render: (_: any, r: Subject) => (
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
      sorter: (a: Subject, b: Subject) => (a.priority ?? 0) - (b.priority ?? 0),
      render: (v: number) => <Text style={{ fontSize: 12 }}>{v ?? 0}</Text>,
    },
    {
      title:"Actions",
      key:"actions",
      width: 200,
      fixed:"right" as const,
      render: (_: any, r: Subject) => (
        <Space size={4} wrap>
          <Tooltip title="View Details">
            <Button type="text" size="small" icon={<EyeOutlined />}
              onClick={() => { setSelectedSubject(r); setDetailDrawerOpen(true); }} />
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

  if (!loginUser?.aname) return null;

  const activeRate = stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0;

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
                <BookOutlined style={{ marginRight: 10, color:"#52c41a" }} />
                Subject Management
              </Title>
              <Text style={{ color:"rgba(255,255,255,0.6)", fontSize: 14 }}>
                Admin Panel  Create, manage &amp; assign subjects to examination categories on behalf of teachers
              </Text>
            </div>
            <Space wrap>
              <Button icon={<ReloadOutlined />}
                onClick={() => { fetchExamCategories(); fetchTeachers(); fetchSubjects(selectedCategoryId); }}
                loading={loading}
                style={{ background:"rgba(255,255,255,0.12)", color:"#fff", border:"1px solid rgba(255,255,255,0.25)", borderRadius: 8 }}>
                Refresh
              </Button>
              <Button icon={<ExportOutlined />} onClick={handleExport}
                disabled={filteredSubjects.length === 0}
                style={{ background:"rgba(255,255,255,0.12)", color:"#fff", border:"1px solid rgba(255,255,255,0.25)", borderRadius: 8 }}>
                Export CSV
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal} style={{ borderRadius: 8 }}>
                Add Subject
              </Button>
            </Space>
          </div>

          {/*  Stats  */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={12} sm={8} lg={4}>
              <StatCard title="Total Subjects" value={stats.total} icon={<BookOutlined />} color="#1890ff"
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
              <StatCard title="Avg Weightage" value={`${stats.avgWeightage}%`} icon={<BarChartOutlined />} color="#722ed1" />
            </Col>
            <Col xs={12} sm={8} lg={4}>
              <StatCard title="Exam Categories" value={stats.totalExams} icon={<TrophyOutlined />} color="#faad14"
                sub1={{ label:"loaded", value: examCategories.length }} />
            </Col>
            <Col xs={12} sm={8} lg={4}>
              <Card style={{ borderRadius: 12, border:"1px solid #52c41a22", height:"100%" }} bodyStyle={{ padding:"20px 24px" }}>
                <Text type="secondary" style={{ fontSize: 11, fontWeight: 600, textTransform:"uppercase" }}>Active Rate</Text>
                <Title level={3} style={{ margin:"4px 0 6px", color:"#1a1a1a" }}>{activeRate}%</Title>
                <Progress percent={activeRate} size="small" strokeColor="#52c41a" showInfo={false} />
              </Card>
            </Col>
          </Row>

          {/*  Filters  */}
          <Card style={{ marginBottom: 16, borderRadius: 12 }} bodyStyle={{ padding:"16px 20px" }}>
            <Row gutter={[12, 12]} align="middle">
              <Col xs={24} sm={10} lg={7}>
                <Select
                  placeholder="Select Examination Category to load subjects"
                  value={selectedCategoryId ?? undefined}
                  onChange={v => { setSelectedCategoryId(v ?? null); setCategoryFilter(v ??"all"); setCurrentPage(1); }}
                  style={{ width:"100%" }}
                  allowClear
                  showSearch
                  optionFilterProp="children"
                >
                  {examCategories.map(e => (
                    <Option key={e._id} value={e._id}>
                      <Tag>{e.code}</Tag> {e.name} ({e.year})
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={8} lg={6}>
                <Input
                  placeholder="Search by name, code, description..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  allowClear
                />
              </Col>
              <Col xs={12} sm={4} lg={3}>
                <Select value={statusFilter}
                  onChange={v => { setStatusFilter(v); setCurrentPage(1); }}
                  style={{ width:"100%" }}>
                  <Option value="all">All Status</Option>
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                  <Option value="featured"> Featured</Option>
                  <Option value="premium"> Premium</Option>
                </Select>
              </Col>
              <Col xs={12} sm={2} lg={2}>
                <Button icon={<FilterOutlined />} onClick={clearFilters} disabled={!isFiltered} block>
                  Clear
                </Button>
              </Col>
            </Row>
          </Card>

          {isFiltered && (
            <Alert message={`Showing ${filteredSubjects.length} of ${subjects.length} subjects`}
              type="info" showIcon closable style={{ marginBottom: 12, borderRadius: 8 }} />
          )}

          {/*  Table  */}
          <Card
            title={
              <Space>
                <BookOutlined style={{ color:"#1890ff" }} />
                <Text strong>
                  {selectedCategoryId
                    ? `Subjects  ${examCategories.find(e => e._id === selectedCategoryId)?.name ??""} (${filteredSubjects.length})`
                    : `All Subjects (${filteredSubjects.length})`}
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
              dataSource={filteredSubjects}
              loading={loading}
              scroll={{ x: 1200 }}
              pagination={{
                current: currentPage,
                pageSize,
                total: filteredSubjects.length,
                onChange: (p, s) => { setCurrentPage(p); setPageSize(s ?? 10); },
                onShowSizeChange: (_, s) => { setCurrentPage(1); setPageSize(s); },
                showSizeChanger: true,
                showQuickJumper: true,
                pageSizeOptions: ["10","20","50","100"],
                showTotal: (tot, range) => `${range[0]}-${range[1]} of ${tot} subjects`,
                style: { padding:"12px 24px", borderTop:"1px solid #f0f0f0" },
              }}
              size="small"
              locale={{
                emptyText: selectedCategoryId
                  ?"No subjects found in this category."
                  :"Select an examination category above to load subjects.",
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
              {editingSubject ? <EditOutlined style={{ color:"#1890ff" }} /> : <PlusOutlined style={{ color:"#52c41a" }} />}
              <span>{editingSubject ? `Edit: ${editingSubject.name}` :"Create New Subject"}</span>
              {editingSubject && <Tag color={editingSubject.isActive ?"success" :"error"}>{editingSubject.isActive ?"Active" :"Inactive"}</Tag>}
            </Space>
          }
          open={modalVisible}
          onCancel={() => { setModalVisible(false); setEditingSubject(null); form.resetFields(); }}
          footer={null}
          width={860}
          destroyOnClose
          style={{ top: 20 }}
        >
          <div style={{ maxHeight:"80vh", overflowY:"auto", paddingRight: 8 }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{ isActive: true, priority: 0, isFeatured: false, isPremium: false }}
            >
              {/*  Admin: Assign Teacher  */}
              <Card size="small" style={{ marginBottom: 16, background:"#f0f7ff", border:"1px solid #91caff", borderRadius: 8 }}>
                <Row gutter={16} align="middle">
                  <Col xs={24} sm={14}>
                    <Form.Item
                      name="assignedTeacher"
                      label={
                        <Space>
                          <UserOutlined style={{ color:"#1890ff" }} />
                          <Text strong style={{ color:"#1890ff" }}>Assign to Teacher (on behalf of)</Text>
                        </Space>
                      }
                      style={{ marginBottom: 0 }}
                    >
                      <Select showSearch placeholder="Select teacher (optional)" optionFilterProp="children"
                        allowClear style={{ width:"100%" }}>
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
                         <strong>Admin Action</strong>: You are creating this subject on behalf of the selected teacher.
                      </Text>
                    </div>
                  </Col>
                </Row>
              </Card>

              <Divider orientation="left" plain>Basic Information</Divider>
              <Form.Item name="examinationCategory" label="Examination Category" rules={[{ required: true }]}>
                <Select placeholder="Select examination category" showSearch optionFilterProp="children"
                  disabled={!!editingSubject}>
                  {examCategories.map(e => (
                    <Option key={e._id} value={e._id}>
                      <Tag>{e.code}</Tag> {e.name} ({e.year})
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Row gutter={16}>
                <Col span={16}>
                  <Form.Item name="name" label="Subject Name" rules={[{ required: true }]}>
                    <Input placeholder="e.g., Aerospace Engineering" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="code" label="Subject Code" rules={[{ required: true }]}>
                    <Input placeholder="e.g., AE" style={{ textTransform:"uppercase" }} maxLength={10} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="description" label="Description">
                <TextArea rows={3} placeholder="Brief description of the subject" maxLength={500} showCount />
              </Form.Item>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="totalMarks" label="Total Marks">
                    <InputNumber min={1} style={{ width:"100%" }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="duration" label="Duration (minutes)">
                    <InputNumber min={30} style={{ width:"100%" }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="weightage" label="Weightage (%)">
                    <InputNumber min={0} max={100} style={{ width:"100%" }} />
                  </Form.Item>
                </Col>
              </Row>

              <Divider orientation="left" plain>Question Pattern</Divider>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name={["questionPattern","mcq"]} label="MCQ Questions">
                    <InputNumber min={0} style={{ width:"100%" }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name={["questionPattern","msa"]} label="MSA Questions">
                    <InputNumber min={0} style={{ width:"100%" }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name={["questionPattern","numerical"]} label="Numerical Questions">
                    <InputNumber min={0} style={{ width:"100%" }} />
                  </Form.Item>
                </Col>
              </Row>

              <Divider orientation="left" plain>Appearance & Settings</Divider>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="icon" label="Icon (CSS class)">
                    <Input placeholder="e.g., fa-rocket" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="color" label="Color (hex)">
                    <Input placeholder="e.g., #1890ff" />
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
              <Divider orientation="left" plain>Pricing</Divider>

              <Form.Item
                shouldUpdate={(prev, curr) =>
                  prev.isPaid !== curr.isPaid ||
                  prev.price !== curr.price ||
                  prev.originalPrice !== curr.originalPrice
                }
              >
                {({ getFieldValue, setFieldsValue }) => {
                  const isPaid = getFieldValue("isPaid");
                  const price = getFieldValue("price") || 0;
                  const originalPrice = getFieldValue("originalPrice") || 0;

                  let discount = 0;
                  if (originalPrice > price && price > 0) {
                    discount = Math.round(((originalPrice - price) / originalPrice) * 100);
                  }

                  setFieldsValue({ discount });

                  return (
                    <Row gutter={16}>
                      <Col span={6}>
                        <Form.Item
                          name="isPaid"
                          label="Paid Subject"
                          valuePropName="checked"
                        >
                          <Switch checkedChildren="Paid" unCheckedChildren="Free" />
                        </Form.Item>
                      </Col>

                      <Col span={6}>
                        <Form.Item
                          name="price"
                          label="Selling Price ()"
                          rules={isPaid ? [{ required: true, message:"Enter price" }] : []}
                        >
                          <InputNumber
                            min={0}
                            style={{ width:"100%" }}
                            disabled={!isPaid}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={6}>
                        <Form.Item name="originalPrice" label="Original Price ()">
                          <InputNumber
                            min={0}
                            style={{ width:"100%" }}
                            disabled={!isPaid}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={6}>
                        <Form.Item name="discount" label="Discount (%)">
                          <InputNumber disabled style={{ width:"100%" }} />
                        </Form.Item>
                      </Col>
                    </Row>
                  );
                }}
              </Form.Item>
              <Divider orientation="left" plain>Content</Divider>
              <Form.Item name="syllabus" label="Syllabus Topics (one per line)">
                <TextArea rows={4} placeholder={"e.g.\nEngineering Mathematics\nFluid Mechanics\nThermodynamics"} />
              </Form.Item>
              <Form.Item name="prerequisites" label="Prerequisites (one per line)">
                <TextArea rows={2} placeholder="e.g. Bachelor's degree in Engineering" />
              </Form.Item>
              <Form.Item name="careerOpportunities" label="Career Opportunities (one per line)">
                <TextArea rows={2} placeholder="e.g. ISRO Scientist, Aerospace Engineer" />
              </Form.Item>

              {/*  Admin Notes  */}
              <Card size="small" style={{ marginBottom: 16, background:"#fffbf0", border:"1px solid #ffe58f", borderRadius: 8 }}>
                <Form.Item name="adminNotes" label={
                  <Text strong style={{ color:"#d48806" }}>Admin Notes (Internal Only)</Text>
                } style={{ marginBottom: 0 }}>
                  <TextArea rows={2} placeholder="Internal notes  not visible to students" />
                </Form.Item>
              </Card>

              <Form.Item style={{ marginBottom: 0 }}>
                <Space>
                  <Button type="primary" htmlType="submit" loading={submitLoading}
                    icon={editingSubject ? <EditOutlined /> : <PlusOutlined />}>
                    {editingSubject ?"Update Subject" :"Create Subject"}
                  </Button>
                  <Button onClick={() => { setModalVisible(false); setEditingSubject(null); form.resetFields(); }}>
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
              <Tag color={selectedSubject?.color ||"blue"} style={{ fontWeight: 700 }}>
                {selectedSubject?.code}
              </Tag>
              {selectedSubject?.name}
              {selectedSubject?.isFeatured && <Tag color="gold"> Featured</Tag>}
              {selectedSubject?.isPremium && <Tag color="purple"> Premium</Tag>}
            </Space>
          }
          placement="right"
          width={580}
          onClose={() => { setDetailDrawerOpen(false); setSelectedSubject(null); }}
          open={detailDrawerOpen}
          extra={
            <Space>
              <Button type="primary" icon={<EditOutlined />}
                onClick={() => { setDetailDrawerOpen(false); if (selectedSubject) handleEdit(selectedSubject); }}>
                Edit
              </Button>
            </Space>
          }
        >
          {selectedSubject && (
            <div>
              <Space wrap style={{ marginBottom: 16 }}>
                <Tag color={selectedSubject.isActive ?"success" :"error"}>
                  {selectedSubject.isActive ?"Active" :"Inactive"}
                </Tag>
                <Tag color="blue">{selectedSubject.examinationCategory.name} ({selectedSubject.examinationCategory.year})</Tag>
                <Tag>Priority: {selectedSubject.priority ?? 0}</Tag>
              </Space>

              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Description">{selectedSubject.description ||""}</Descriptions.Item>
                <Descriptions.Item label="Total Marks">{selectedSubject.totalMarks ??""}</Descriptions.Item>
                <Descriptions.Item label="Duration">{selectedSubject.duration ? `${selectedSubject.duration} minutes` :""}</Descriptions.Item>
                <Descriptions.Item label="Weightage">{selectedSubject.weightage ? `${selectedSubject.weightage}%` :""}</Descriptions.Item>
                <Descriptions.Item label="Question Pattern">
                  {selectedSubject.questionPattern ? (
                    <Space wrap>
                      {selectedSubject.questionPattern.mcq != null && <Tag color="blue">MCQ: {selectedSubject.questionPattern.mcq}</Tag>}
                      {selectedSubject.questionPattern.msa != null && <Tag color="purple">MSA: {selectedSubject.questionPattern.msa}</Tag>}
                      {selectedSubject.questionPattern.numerical != null && <Tag color="cyan">Numerical: {selectedSubject.questionPattern.numerical}</Tag>}
                    </Space>
                  ) :""}
                </Descriptions.Item>
                <Descriptions.Item label="Syllabus Topics">
                  {selectedSubject.syllabus?.length ? (
                    <Space wrap>
                      {selectedSubject.syllabus.map((t, i) => <Tag key={i} style={{ fontSize: 11 }}>{t}</Tag>)}
                    </Space>
                  ) :""}
                </Descriptions.Item>
                <Descriptions.Item label="Prerequisites">
                  {selectedSubject.prerequisites?.length ? (
                    <Space wrap>
                      {selectedSubject.prerequisites.map((p, i) => <Tag key={i} color="orange">{p}</Tag>)}
                    </Space>
                  ) :""}
                </Descriptions.Item>
                <Descriptions.Item label="Career Opportunities">
                  {selectedSubject.careerOpportunities?.length ? (
                    <Space wrap>
                      {selectedSubject.careerOpportunities.map((c, i) => <Tag key={i} color="green">{c}</Tag>)}
                    </Space>
                  ) :""}
                </Descriptions.Item>
                {selectedSubject.adminNotes && (
                  <Descriptions.Item label="Admin Notes">
                    <Text style={{ color:"#d48806" }}>{selectedSubject.adminNotes}</Text>
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Created">
                  {new Date(selectedSubject.createdAt).toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" })}
                </Descriptions.Item>
              </Descriptions>

              <div style={{ marginTop: 24 }}>
                <Space wrap>
                  <Button type="primary" icon={<EditOutlined />}
                    onClick={() => { setDetailDrawerOpen(false); handleEdit(selectedSubject); }}>
                    Edit
                  </Button>
                  <Button onClick={() => handleToggleActive(selectedSubject)}>
                    {selectedSubject.isActive ?"Deactivate" :"Activate"}
                  </Button>
                  <Button onClick={() => handleToggleFeatured(selectedSubject)}>
                    {selectedSubject.isFeatured ?"Unfeature" :" Feature"}
                  </Button>
                  <Button icon={<CopyOutlined />}
                    onClick={() => { setDetailDrawerOpen(false); handleDuplicate(selectedSubject); }}>
                    Duplicate
                  </Button>
                  <Popconfirm
                    title={`Delete"${selectedSubject.name}"?`}
                    onConfirm={() => { handleDelete(selectedSubject._id, selectedSubject.name); setDetailDrawerOpen(false); }}
                    okText="Delete" okType="danger"
                  >
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

export default SubjectManager;