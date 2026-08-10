import { useEffect, useState, useCallback } from"react";
import {
  Form, Input, Button, Select, message, Table, Space, Modal, Tag, Popconfirm,
  Row, Col, Card, Divider, Tabs, Switch, DatePicker, InputNumber, Badge,
  Pagination, Layout, Typography, Statistic, Progress, Alert, Tooltip,
  Upload, Spin
} from"antd";
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  FolderAddOutlined, FolderOutlined, SearchOutlined, ReloadOutlined,
  UploadOutlined, TrophyOutlined, FileTextOutlined, TagOutlined,
  CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined,
  BarChartOutlined, GlobalOutlined, StarOutlined, LockOutlined,
  UnlockOutlined, SettingOutlined, CopyOutlined, ExportOutlined,
} from"@ant-design/icons";
import axios from"axios";
import moment from"moment";
import dayjs from"dayjs";
import { useNavigate } from"react-router-dom";
import Sidebar from"./Sidebar";
import Topbar from"./Topbar";
import url from"../../url";
import ViewExamModal from"./ViewExamModal";
import usePageTitle from '../../hooks/usePageTitle';

const { Content } = Layout;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Text, Title } = Typography;
const { Option } = Select;

//  Types 

interface Exam {
  _id: string;
  name: string;
  slug: string;
  categoryId: string | { _id: string; name: string; [key: string]: any };
  status: string;
  examLevel?: string;
  mode?: string;
  views?: number;
  createdAt?: string;
  [key: string]: any;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  isActive?: boolean;
  [key: string]: any;
}

//  StatCard (mirroring admin dashboard pattern) 

const StatCard = ({
  title, value, icon, color, sub1, sub2, badge, onClick,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  sub1?: { label: string; value: string | number; color?: string };
  sub2?: { label: string; value: string | number; color?: string };
  badge?: number;
  onClick?: () => void;
}) => (
  <Card
    hoverable={!!onClick}
    onClick={onClick}
    style={{ borderRadius: 12, border:"1px solid #f0f0f0", cursor: onClick ?"pointer" :"default", height:"100%" }}
    bodyStyle={{ padding:"20px 24px" }}
  >
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
      <div style={{ flex: 1 }}>
        <Text type="secondary" style={{ fontSize: 12, fontWeight: 500, textTransform:"uppercase", letterSpacing: 0.5 }}>
          {title}
        </Text>
        <div style={{ display:"flex", alignItems:"center", gap: 8, marginTop: 4 }}>
          <Title level={3} style={{ margin: 0, color:"#1a1a1a", lineHeight: 1.2 }}>{value}</Title>
          {badge !== undefined && badge > 0 && <Badge count={badge} style={{ backgroundColor:"#ff4d4f" }} />}
        </div>
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
        width: 48, height: 48, borderRadius: 12,
        background: `${color}18`, display:"flex",
        alignItems:"center", justifyContent:"center",
        fontSize: 22, color, flexShrink: 0,
      }}>
        {icon}
      </div>
    </div>
  </Card>
);

//  Main Component 

const AdminExamManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("exams");

  // Data
  const [exams, setExams] = useState<Exam[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalExams, setTotalExams] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [allBooks, setAllBooks] = useState<any[]>([]);
  const [allCourseContents, setAllCourseContents] = useState<any[]>([]);
  const [allTestCategories, setAllTestCategories] = useState<any[]>([]);

  // Mapping Lists
  const [syllabusList, setSyllabusList] = useState<any[]>([]);
  const [pyqList, setPyqList] = useState<any[]>([]);
  const [caList, setCaList] = useState<any[]>([]);
  const [jobList, setJobList] = useState<any[]>([]);

  // Stats
  const [stats, setStats] = useState({
    totalActive: 0,
    totalInactive: 0,
    totalNational: 0,
    totalState: 0,
    totalOnline: 0,
    totalOffline: 0,
    totalViews: 0,
    categoriesActive: 0,
  });

  // Pagination & Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [examModalVisible, setExamModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [viewExam, setViewExam] = useState<Exam | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [bulkSelected, setBulkSelected] = useState<string[]>([]);

  const [form] = Form.useForm();
  const [categoryForm] = Form.useForm();

  //  Auth check 
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [loginUser, setLoginUser] = useState<any>(null);

  useEffect(() => {
    const raw = localStorage.getItem("edudocs");
    if (!raw) { navigate("/admin-login"); return; }
    try {
      const user = JSON.parse(raw);
      if (!user.aname) { navigate("/admin-login"); return; }
      setLoginUser(user);
      setIsAuthChecked(true);
    } catch {
      navigate("/admin-login");
    }
  }, [navigate]);

  const getAuthHeaders = (): Record<string, string> => {
    const raw = localStorage.getItem("edudocs");
    if (!raw) return {};
    try {
      const user = JSON.parse(raw);
      if (user && user.token) {
        return { Authorization: `Bearer ${user.token}` };
      }
    } catch { }
    return {};
  };

  //  Load Data 
  const loadExams = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: pageSize,
        search: searchTerm || undefined,
        isManagement:"true",
        ...filters,
      };
      const res = await axios.get(`${url}/exams/all`, { params, headers: getAuthHeaders() });
      const examList: Exam[] = res.data.exams || [];
      setExams(examList);
      setTotalExams(res.data.totalExams || 0);

      // Compute stats
      setStats({
        totalActive: examList.filter(e => e.status ==="ACTIVE").length,
        totalInactive: examList.filter(e => e.status !=="ACTIVE").length,
        totalNational: examList.filter(e => e.examLevel ==="National").length,
        totalState: examList.filter(e => e.examLevel ==="State").length,
        totalOnline: examList.filter(e => e.mode ==="Online").length,
        totalOffline: examList.filter(e => e.mode ==="Offline").length,
        totalViews: examList.reduce((acc, e) => acc + (e.views || 0), 0),
        categoriesActive: 0, // will be updated in loadCategories
      });
    } catch {
      message.error("Failed to load exams");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, filters]);

  const loadCategories = useCallback(async () => {
    try {
      const res = await axios.get(`${url}/exam-categories/all`, { headers: getAuthHeaders() });
      const cats: Category[] = res.data.categories || [];
      setCategories(cats);
      setTotalCategories(cats.length);
      setStats(prev => ({ ...prev, categoriesActive: cats.filter(c => c.isActive !== false).length }));
    } catch {
      message.error("Failed to load categories");
    }
  }, []);

  const loadResources = useCallback(async () => {
    try {
      const [coursesRes, booksRes, contentRes, testCatRes, syllabusRes, pyqRes, caRes, jobRes] = await Promise.all([
        axios.get(`${url}/course/admin/courses/?limit=0`, { headers: getAuthHeaders() }),
        axios.get(`${url}/books/approved?limit=0`, { headers: getAuthHeaders() }),
        axios.get(`${url}/course/allCourseContent?limit=0`, { headers: getAuthHeaders() }),
        axios.get(`${url}/test-series/navigation/examinations?limit=0`, { headers: getAuthHeaders() }),
        axios.get(`${url}/syllabus/all?limit=0`, { headers: getAuthHeaders() }),
        axios.get(`${url}/pyq/all?limit=0`, { headers: getAuthHeaders() }),
        axios.get(`${url}/current-affairs/all?limit=0`, { headers: getAuthHeaders() }),
        axios.get(`${url}/jobs?limit=0`, { headers: getAuthHeaders() }),
      ]);
      setAllCourses(coursesRes.data.data?.courses || []);
      setAllBooks(booksRes.data.books || []);
      setAllCourseContents(contentRes.data.result || []);
      setAllTestCategories(testCatRes.data.data?.examinationCategories || []);
      setSyllabusList(syllabusRes.data.syllabuses || []);
      setPyqList(pyqRes.data.pyqs || []);
      setCaList(caRes.data.data || []);
      setJobList(jobRes.data.jobs || jobRes.data.data?.jobs || []);
    } catch {
      message.error("Failed to load resources");
    }
  }, []);

  useEffect(() => {
    if (isAuthChecked) {
      loadExams();
      loadCategories();
      loadResources();
    }
  }, [isAuthChecked, loadExams, loadCategories, loadResources]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadExams(), loadCategories()]);
    setRefreshing(false);
    message.success("Data refreshed");
  };

  //  Exam CRUD 
  const buildFormData = (values: any): FormData => {
    const fd = new FormData();
    const primitives = ["name","slug","categoryId","examLevel","mode","status",
"officialWebsite","notificationLink","shortDescription"];
    primitives.forEach(k => { if (values[k] !== undefined) fd.append(k, values[k]); });

    const objects = ["phases","eligibility","seo","courses","books","courseContents","testSeries"];
    objects.forEach(k => { if (values[k]) fd.append(k, JSON.stringify(values[k])); });

    if (values.importantDates) {
      const d = values.importantDates;
      fd.append("importantDates", JSON.stringify({
        notificationDate: d.notificationDate?.toISOString(),
        applicationStart: d.applicationStart?.toISOString(),
        applicationEnd: d.applicationEnd?.toISOString(),
        examDate: d.examDate?.toISOString(),
        resultDate: d.resultDate?.toISOString(),
      }));
    }

    // Pack extended mapped resources
    const mappedRes = {
      syllabus: values.mappedSyllabus || [],
      pyqs: values.mappedPyqs || [],
      notifications: values.mappedNotifications || [],
      currentAffairs: values.mappedCurrentAffairs || []
    };
    fd.append("mappedResources", JSON.stringify(mappedRes));

    if (values.examImage?.file) fd.append("examImage", values.examImage.file);
    return fd;
  };

  const createExam = async (values: any) => {
    try {
      await axios.post(`${url}/exams/create`, buildFormData(values), {
        headers: { 
"Content-Type":"multipart/form-data",
          ...getAuthHeaders()
        },
      });
      message.success("Exam created successfully");
      setExamModalVisible(false);
      form.resetFields();
      loadExams();
    } catch (err: any) {
      message.error(err.response?.data?.message ||"Failed to create exam");
    }
  };

  const updateExam = async (values: any) => {
    if (!selectedExam) return;
    try {
      await axios.put(`${url}/exams/${selectedExam._id}`, buildFormData(values), {
        headers: { 
"Content-Type":"multipart/form-data",
          ...getAuthHeaders()
        },
      });
      message.success("Exam updated successfully");
      setExamModalVisible(false);
      setSelectedExam(null);
      form.resetFields();
      loadExams();
    } catch (err: any) {
      message.error(err.response?.data?.message ||"Failed to update exam");
    }
  };

  const deleteExam = async (id: string) => {
    try {
      await axios.delete(`${url}/exams/${id}`, { headers: getAuthHeaders() });
      message.success("Exam deactivated successfully");
      loadExams();
    } catch (err: any) {
      message.error(err.response?.data?.message ||"Failed to delete exam");
    }
  };

  // Admin-only: Force status toggle
  const forceToggleExamStatus = async (exam: Exam) => {
    try {
      const newStatus = exam.status ==="ACTIVE" ?"INACTIVE" :"ACTIVE";
      const fd = new FormData();
      fd.append("status", newStatus);

      await axios.put(`${url}/exams/${exam._id}`, fd, {
        headers: {
"Content-Type":"multipart/form-data",
          ...getAuthHeaders()
        }
      });
      message.success(`Exam ${newStatus ==="ACTIVE" ?"activated" :"deactivated"}`);
      loadExams();
    } catch {
      message.error("Failed to update status");
    }
  };

  // Admin-only: Bulk actions
  const bulkUpdateStatus = async (status: string) => {
    if (!bulkSelected.length) { message.warning("No exams selected"); return; }
    try {
      await Promise.all(bulkSelected.map(id => axios.put(`${url}/exams/${id}`, { status }, { headers: getAuthHeaders() })));
      message.success(`${bulkSelected.length} exams updated`);
      setBulkSelected([]);
      loadExams();
    } catch {
      message.error("Bulk update failed");
    }
  };

  //  Category CRUD 
  const createCategory = async (values: any) => {
    try {
      await axios.post(`${url}/exam-categories/create`, values, { headers: getAuthHeaders() });
      message.success("Category created successfully");
      setCategoryModalVisible(false);
      categoryForm.resetFields();
      loadCategories();
      loadExams();
    } catch (err: any) {
      message.error(err.response?.data?.message ||"Failed to create category");
    }
  };

  const updateCategory = async (values: any) => {
    if (!selectedCategory) return;
    try {
      await axios.put(`${url}/exam-categories/${selectedCategory._id}`, values, { headers: getAuthHeaders() });
      message.success("Category updated");
      setCategoryModalVisible(false);
      setSelectedCategory(null);
      categoryForm.resetFields();
      loadCategories();
    } catch (err: any) {
      message.error(err.response?.data?.message ||"Failed to update category");
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await axios.delete(`${url}/exam-categories/${id}`, { headers: getAuthHeaders() });
      message.success("Category deleted");
      loadCategories();
    } catch (err: any) {
      message.error(err.response?.data?.message ||"Failed to delete category");
    }
  };

  //  Modal Handlers 
  const openExamModal = (exam: Exam | null = null) => {
    if (exam) {
      form.setFieldsValue({
        ...exam,
        categoryId: typeof exam.categoryId ==="object" ? exam.categoryId._id : exam.categoryId,
        importantDates: {
          notificationDate: exam.importantDates?.notificationDate ? dayjs(exam.importantDates.notificationDate) : null,
          applicationStart: exam.importantDates?.applicationStart ? dayjs(exam.importantDates.applicationStart) : null,
          applicationEnd: exam.importantDates?.applicationEnd ? dayjs(exam.importantDates.applicationEnd) : null,
          examDate: exam.importantDates?.examDate ? dayjs(exam.importantDates.examDate) : null,
          resultDate: exam.importantDates?.resultDate ? dayjs(exam.importantDates.resultDate) : null,
        },
        eligibility: exam.eligibility || {},
        seo: exam.seo || {},
        courses: (exam.courses || []).map((c: any) => typeof c === "object" ? c._id : c),
        books: (exam.books || []).map((b: any) => typeof b === "object" ? b._id : b),
        courseContents: (exam.courseContents || []).map((c: any) => typeof c === "object" ? c._id : c),
        testSeries: (exam.testSeries || []).map((c: any) => typeof c === "object" ? c._id : c),
        mappedSyllabus: (exam.mappedResources?.syllabus || []).map((s: any) => typeof s === "object" ? s._id : s),
        mappedPyqs: (exam.mappedResources?.pyqs || []).map((p: any) => typeof p === "object" ? p._id : p),
        mappedNotifications: (exam.mappedResources?.notifications || []).map((n: any) => typeof n === "object" ? n._id : n),
        mappedCurrentAffairs: (exam.mappedResources?.currentAffairs || []).map((ca: any) => typeof ca === "object" ? ca._id : ca),
      });
      setSelectedExam(exam);
    } else {
      form.resetFields();
      setSelectedExam(null);
    }
    setExamModalVisible(true);
  };

  const openCategoryModal = (category: Category | null = null) => {
    if (category) {
      categoryForm.setFieldsValue(category);
      setSelectedCategory(category);
    } else {
      categoryForm.resetFields();
      setSelectedCategory(null);
    }
    setCategoryModalVisible(true);
  };

  //  Table Columns 
  const examColumns = [
    {
      title:"Exam Name",
      dataIndex:"name",
      render: (name: string, record: Exam) => (
        <Space>
          <Badge status={record.status ==="ACTIVE" ?"success" :"default"} />
          <div>
            <strong>{name}</strong>
            <br />
            <Text type="secondary" style={{ fontSize: 11 }}>{record.slug}</Text>
          </div>
          {record.views && record.views > 100 && <Tag color="blue">Popular</Tag>}
        </Space>
      ),
    },
    {
      title:"Category",
      dataIndex: ["categoryId","name"],
      render: (name: string) => name ||"Uncategorized",
    },
    {
      title:"Level",
      dataIndex:"examLevel",
      render: (level: string) => level ? <Tag color="geekblue">{level}</Tag> :"",
    },
    {
      title:"Mode",
      dataIndex:"mode",
      render: (mode: string) => mode ? <Tag color="purple">{mode}</Tag> :"",
    },
    {
      title:"Status",
      dataIndex:"status",
      render: (status: string, record: Exam) => (
        <Tooltip title="Admin: Click to toggle status">
          <Switch
            checked={status ==="ACTIVE"}
            onChange={() => forceToggleExamStatus(record)}
            checkedChildren="ACTIVE"
            unCheckedChildren="OFF"
            size="small"
          />
        </Tooltip>
      ),
    },
    {
      title:"Views",
      dataIndex:"views",
      sorter: (a: Exam, b: Exam) => (a.views || 0) - (b.views || 0),
      render: (v: number) => v || 0,
    },
    {
      title:"Created",
      dataIndex:"createdAt",
      render: (d: string) => moment(d).format("MMM DD, YYYY"),
    },
    {
      title:"Actions",
      render: (_: any, record: Exam) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button type="link" icon={<EyeOutlined />} onClick={() => { setViewExam(record); setViewModalOpen(true); }} />
          </Tooltip>
          <Tooltip title="Edit Exam">
            <Button type="link" icon={<EditOutlined />} onClick={() => openExamModal(record)} />
          </Tooltip>
          <Tooltip title="Duplicate">
            <Button
              type="link"
              icon={<CopyOutlined />}
              onClick={() => {
                const dup = { ...record, name: record.name +" (Copy)", slug: record.slug +"-copy", _id: undefined };
                openExamModal(dup as any);
                setSelectedExam(null); // treat as create
              }}
            />
          </Tooltip>
          <Tooltip title="Deactivate / Delete">
            <Popconfirm title="Deactivate this exam?" onConfirm={() => deleteExam(record._id)}>
              <Button type="link" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const categoryColumns = [
    {
      title:"Category Name",
      dataIndex:"name",
      render: (name: string, record: Category) => (
        <Space>
          <FolderOutlined style={{ color:"#faad14" }} />
          <strong>{name}</strong>
          {record.isActive === false && <Tag color="red">Inactive</Tag>}
        </Space>
      ),
    },
    {
      title:"Slug",
      dataIndex:"slug",
      render: (slug: string) => <code style={{ background:"#f5f5f5", padding:"2px 6px", borderRadius: 4 }}>{slug}</code>,
    },
    {
      title:"Exams Count",
      render: (_: any, record: Category) => {
        const count = exams.filter(e => {
          const cid = typeof e.categoryId ==="object" ? e.categoryId._id : e.categoryId;
          return cid === record._id;
        }).length;
        return <Badge count={count} showZero style={{ backgroundColor: count > 0 ?"#1890ff" :"#d9d9d9" }} />;
      },
    },
    {
      title:"Status",
      dataIndex:"isActive",
      render: (active: boolean, record: Category) => (
        <Switch
          checked={active !== false}
          onChange={(checked) => updateCategory({ ...record, isActive: checked })}
          checkedChildren="Active"
          unCheckedChildren="Off"
          size="small"
        />
      ),
    },
    {
      title:"Actions",
      render: (_: any, record: Category) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => openCategoryModal(record)} />
          <Popconfirm
            title="Delete Category?"
            description="Works only if no active exams are linked."
            onConfirm={() => deleteCategory(record._id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  //  Auth Gate 
  if (!isAuthChecked) {
    return (
      <Layout style={{ minHeight:"100vh" }}>
        <Content style={{ display:"flex", justifyContent:"center", alignItems:"center" }}>
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  //  Render 
  return (
    <Layout style={{ minHeight:"100vh" }}>
      <Sidebar />
      <Layout>
        <Topbar />
        <Content style={{ margin: 16, padding:"0 8px" }}>

          {/*  Admin Header Banner (matching dashboard style)  */}
          <div style={{
            background:"linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
            borderRadius: 16, padding:"28px 32px", marginBottom: 24,
            display:"flex", justifyContent:"space-between", alignItems:"center",
            flexWrap:"wrap", gap: 16,
          }}>
            <div>
              <Title level={2} style={{ color:"#fff", margin: 0 }}>
                <TrophyOutlined style={{ marginRight: 10, color:"#faad14" }} />
                Exam Management
              </Title>
              <Text style={{ color:"rgba(255,255,255,0.6)", fontSize: 14 }}>
                Admin Panel  Full control over exams, categories & resource mappings
              </Text>
            </div>
            <Space wrap>
              <Button
                icon={<ReloadOutlined spin={refreshing} />}
                loading={refreshing}
                onClick={handleRefresh}
                style={{
                  background:"rgba(255,255,255,0.12)", color:"#fff",
                  border:"1px solid rgba(255,255,255,0.25)", borderRadius: 8,
                }}
              >
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => openExamModal()}
                style={{ borderRadius: 8 }}
              >
                Add Exam
              </Button>
              <Button
                icon={<FolderAddOutlined />}
                onClick={() => openCategoryModal()}
                style={{
                  background:"rgba(255,255,255,0.12)", color:"#fff",
                  border:"1px solid rgba(255,255,255,0.25)", borderRadius: 8,
                }}
              >
                Add Category
              </Button>
            </Space>
          </div>

          {/*  Stats Row (dashboard-style)  */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={12} sm={8} lg={4}>
              <StatCard title="Total Exams" value={totalExams} icon={<FileTextOutlined />} color="#1890ff" />
            </Col>
            <Col xs={12} sm={8} lg={4}>
              <StatCard
                title="Active Exams"
                value={stats.totalActive}
                icon={<CheckCircleOutlined />}
                color="#52c41a"
                sub2={{ label:"inactive", value: stats.totalInactive, color:"#ff4d4f" }}
              />
            </Col>
            <Col xs={12} sm={8} lg={4}>
              <StatCard
                title="By Level"
                value={stats.totalNational}
                icon={<GlobalOutlined />}
                color="#722ed1"
                sub1={{ label:"National", value: stats.totalNational }}
                sub2={{ label:"State", value: stats.totalState, color:"#13c2c2" }}
              />
            </Col>
            <Col xs={12} sm={8} lg={4}>
              <StatCard
                title="By Mode"
                value={stats.totalOnline}
                icon={<BarChartOutlined />}
                color="#eb2f96"
                sub1={{ label:"Online", value: stats.totalOnline }}
                sub2={{ label:"Offline", value: stats.totalOffline, color:"#faad14" }}
              />
            </Col>
            <Col xs={12} sm={8} lg={4}>
              <StatCard
                title="Categories"
                value={totalCategories}
                icon={<FolderOutlined />}
                color="#faad14"
                sub1={{ label:"active", value: stats.categoriesActive }}
              />
            </Col>
            <Col xs={12} sm={8} lg={4}>
              <StatCard
                title="Total Views"
                value={stats.totalViews.toLocaleString()}
                icon={<StarOutlined />}
                color="#13c2c2"
              />
            </Col>
          </Row>

          {/*  Bulk Actions Alert  */}
          {bulkSelected.length > 0 && (
            <Alert
              icon={<SettingOutlined />}
              message={
                <Space>
                  <Text strong>{bulkSelected.length} exam(s) selected</Text>
                  <Button size="small" type="primary" icon={<UnlockOutlined />} onClick={() => bulkUpdateStatus("ACTIVE")}>
                    Activate All
                  </Button>
                  <Button size="small" danger icon={<LockOutlined />} onClick={() => bulkUpdateStatus("INACTIVE")}>
                    Deactivate All
                  </Button>
                  <Button size="small" onClick={() => setBulkSelected([])}>Clear</Button>
                </Space>
              }
              type="info"
              style={{ marginBottom: 16, borderRadius: 8 }}
            />
          )}

          {/*  Main Tabs  */}
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            tabBarExtraContent={
              <Space>
                <Input
                  placeholder="Search exams..."
                  prefix={<SearchOutlined />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onPressEnter={loadExams}
                  style={{ width: 220, borderRadius: 8 }}
                  allowClear
                />
              </Space>
            }
          >
            {/*  EXAMS TAB  */}
            <TabPane tab={<span> Exams <Badge count={totalExams} style={{ backgroundColor:"#1890ff", marginLeft: 4 }} /></span>} key="exams">
              <Card bodyStyle={{ padding: 0 }}>
                <div style={{ padding:"16px 24px", borderBottom:"1px solid #f0f0f0" }}>
                  <Row gutter={[12, 12]} align="middle">
                    <Col>
                      <Select
                        placeholder="Filter by Level"
                        onChange={(val) => setFilters((prev: any) => ({ ...prev, level: val || undefined }))}
                        allowClear style={{ width: 140 }} size="small"
                      >
                        <Select.Option value="National">National</Select.Option>
                        <Select.Option value="State">State</Select.Option>
                        <Select.Option value="Regional">Regional</Select.Option>
                      </Select>
                    </Col>
                    <Col>
                      <Select
                        placeholder="Filter by Mode"
                        onChange={(val) => setFilters((prev: any) => ({ ...prev, mode: val || undefined }))}
                        allowClear style={{ width: 130 }} size="small"
                      >
                        <Select.Option value="Online">Online</Select.Option>
                        <Select.Option value="Offline">Offline</Select.Option>
                      </Select>
                    </Col>
                    <Col>
                      <Select
                        placeholder="Filter by Status"
                        onChange={(val) => setFilters((prev: any) => ({ ...prev, status: val || undefined }))}
                        allowClear style={{ width: 140 }} size="small"
                      >
                        <Select.Option value="ACTIVE"><Tag color="green">ACTIVE</Tag></Select.Option>
                        <Select.Option value="INACTIVE"><Tag color="red">INACTIVE</Tag></Select.Option>
                      </Select>
                    </Col>
                    <Col>
                      <Select
                        placeholder="Filter by Category"
                        onChange={(val) => setFilters((prev: any) => ({ ...prev, categoryId: val || undefined }))}
                        allowClear style={{ width: 180 }} size="small" showSearch optionFilterProp="children"
                      >
                        {categories.map(c => (
                          <Select.Option key={c._id} value={c._id}>{c.name}</Select.Option>
                        ))}
                      </Select>
                    </Col>
                  </Row>
                </div>

                <Table
                  columns={examColumns}
                  dataSource={exams}
                  loading={loading}
                  rowKey="_id"
                  pagination={false}
                  scroll={{ x: 1100 }}
                  rowSelection={{
                    selectedRowKeys: bulkSelected,
                    onChange: (keys) => setBulkSelected(keys as string[]),
                  }}
                  style={{ padding:"0 0" }}
                />

                <div style={{ padding:"16px 24px", textAlign:"right", borderTop:"1px solid #f0f0f0" }}>
                  <Pagination
                    current={currentPage}
                    total={totalExams}
                    pageSize={pageSize}
                    onChange={(page, size) => { setCurrentPage(page); setPageSize(size || 10); }}
                    showSizeChanger
                    showQuickJumper
                    showTotal={(total) => `Total ${total} exams`}
                  />
                </div>
              </Card>
            </TabPane>

            {/*  CATEGORIES TAB  */}
            <TabPane tab={<span> Categories <Badge count={totalCategories} style={{ backgroundColor:"#faad14", marginLeft: 4 }} /></span>} key="categories">
              <Card>
                <div style={{ marginBottom: 16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <Text type="secondary">{totalCategories} categories · {stats.categoriesActive} active</Text>
                  <Button type="primary" icon={<FolderAddOutlined />} onClick={() => openCategoryModal()}>
                    Add Category
                  </Button>
                </div>
                <Table
                  columns={categoryColumns}
                  dataSource={categories}
                  rowKey="_id"
                  scroll={{ x: 700 }}
                  pagination={{ pageSize: 50, showSizeChanger: false, total: totalCategories }}
                />
              </Card>
            </TabPane>

            {/*  ANALYTICS TAB (Admin-only overview)  */}
            <TabPane tab=" Analytics" key="analytics">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Card title="Exams by Level" style={{ borderRadius: 12 }}>
                    {[
                      { label:"National", value: stats.totalNational, color:"#1890ff" },
                      { label:"State", value: stats.totalState, color:"#52c41a" },
                      { label:"Regional", value: totalExams - stats.totalNational - stats.totalState, color:"#faad14" },
                    ].map(item => (
                      <div key={item.label} style={{ marginBottom: 12 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom: 4 }}>
                          <Text>{item.label}</Text>
                          <Text strong>{item.value}</Text>
                        </div>
                        <Progress
                          percent={totalExams > 0 ? Math.round((item.value / totalExams) * 100) : 0}
                          strokeColor={item.color}
                          size="small"
                          showInfo={false}
                        />
                      </div>
                    ))}
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card title="Exams by Status & Mode" style={{ borderRadius: 12 }}>
                    {[
                      { label:"Active", value: stats.totalActive, total: totalExams, color:"#52c41a" },
                      { label:"Inactive", value: stats.totalInactive, total: totalExams, color:"#ff4d4f" },
                      { label:"Online Mode", value: stats.totalOnline, total: totalExams, color:"#1890ff" },
                      { label:"Offline Mode", value: stats.totalOffline, total: totalExams, color:"#722ed1" },
                    ].map(item => (
                      <div key={item.label} style={{ marginBottom: 12 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom: 4 }}>
                          <Text>{item.label}</Text>
                          <Text strong>{item.value} / {item.total}</Text>
                        </div>
                        <Progress
                          percent={item.total > 0 ? Math.round((item.value / item.total) * 100) : 0}
                          strokeColor={item.color}
                          size="small"
                          showInfo={false}
                        />
                      </div>
                    ))}
                  </Card>
                </Col>
                <Col xs={24}>
                  <Card title="Top Exams by Views" style={{ borderRadius: 12 }}>
                    <Table
                      dataSource={[...exams].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10)}
                      rowKey="_id"
                      size="small"
                      pagination={false}
                      columns={[
                        { title:"#", render: (_: any, __: any, idx: number) => idx + 1, width: 40 },
                        { title:"Exam", dataIndex:"name", render: (n: string) => <strong>{n}</strong> },
                        {
                          title:"Category",
                          dataIndex: ["categoryId","name"],
                          render: (n: string) => n ||"",
                        },
                        { title:"Level", dataIndex:"examLevel", render: (l: string) => l ? <Tag color="geekblue">{l}</Tag> :"" },
                        { title:"Views", dataIndex:"views", render: (v: number) => <strong>{v || 0}</strong> },
                        {
                          title:"Status",
                          dataIndex:"status",
                          render: (s: string) => <Tag color={s ==="ACTIVE" ?"green" :"red"}>{s}</Tag>,
                        },
                      ]}
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>
          </Tabs>
        </Content>
      </Layout>

      {/* 
          EXAM CREATE / EDIT MODAL
       */}
      <Modal
        title={
          <Space>
            {selectedExam ? <EditOutlined style={{ color:"#1890ff" }} /> : <PlusOutlined style={{ color:"#52c41a" }} />}
            <span>{selectedExam ? `Edit: ${selectedExam.name}` :"Create New Exam"}</span>
            {selectedExam && <Tag color={selectedExam.status ==="ACTIVE" ?"green" :"red"}>{selectedExam.status}</Tag>}
          </Space>
        }
        open={examModalVisible}
        onCancel={() => { setExamModalVisible(false); form.resetFields(); setSelectedExam(null); }}
        width={1000}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" form={form} onFinish={selectedExam ? updateExam : createExam}>
          <Tabs defaultActiveKey="1">

            {/* TAB 1: Basic Info */}
            <TabPane tab="Basic Info" key="1">
              <Card>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="name" label="Exam Name" rules={[{ required: true }]}>
                      <Input placeholder="e.g. UPSC Civil Services" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="slug" label="Slug" rules={[{ required: true }]}>
                      <Input placeholder="upsc-civil-services" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="shortDescription" label="Short Description">
                      <TextArea rows={3} placeholder="Brief overview of the exam" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="examImage" label="Exam Image" valuePropName="file">
                      <Upload listType="picture-card" maxCount={1} beforeUpload={() => false}>
                        <div><UploadOutlined /><div style={{ marginTop: 8 }}>Upload</div></div>
                      </Upload>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item name="categoryId" label="Category" rules={[{ required: true }]}>
                      <Select placeholder="Select category" showSearch optionFilterProp="children">
                        {categories.map(c => (
                          <Select.Option key={c._id} value={c._id}>{c.name}</Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="examLevel" label="Exam Level">
                      <Select placeholder="Select level">
                        <Select.Option value="National">National</Select.Option>
                        <Select.Option value="State">State</Select.Option>
                        <Select.Option value="Regional">Regional</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="mode" label="Mode">
                      <Select placeholder="Select mode">
                        <Select.Option value="Online">Online</Select.Option>
                        <Select.Option value="Offline">Offline</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item name="status" label="Status" initialValue="ACTIVE" rules={[{ required: true }]}>
                      <Select>
                        <Select.Option value="ACTIVE"><Tag color="green">ACTIVE</Tag></Select.Option>
                        <Select.Option value="INACTIVE"><Tag color="red">INACTIVE</Tag></Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </TabPane>

            {/* TAB 2: Dates & Eligibility */}
            <TabPane tab="Dates & Eligibility" key="2">
              <Card>
                <Row gutter={16}>
                  {[
                    ["importantDates","notificationDate","Notification Date"],
                    ["importantDates","applicationStart","Application Start"],
                    ["importantDates","applicationEnd","Application End"],
                    ["importantDates","examDate","Exam Date"],
                    ["importantDates","resultDate","Result Date"],
                  ].map(([group, field, label]) => (
                    <Col span={6} key={field}>
                      <Form.Item name={[group, field]} label={label}>
                        <DatePicker style={{ width:"100%" }} />
                      </Form.Item>
                    </Col>
                  ))}
                </Row>
                <Divider>Eligibility</Divider>
                <Row gutter={16}>
                  <Col span={6}>
                    <Form.Item name={["eligibility","ageMin"]} label="Min Age"><InputNumber style={{ width:"100%" }} /></Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item name={["eligibility","ageMax"]} label="Max Age"><InputNumber style={{ width:"100%" }} /></Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name={["eligibility","education"]} label="Education Qualification"><Input /></Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name={["eligibility","nationality"]} label="Nationality"><Input /></Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name={["eligibility","attempts"]} label="Max Attempts"><InputNumber style={{ width:"100%" }} /></Form.Item>
                  </Col>
                </Row>
              </Card>
            </TabPane>

            {/* TAB 3: Phases & Cutoffs */}
            <TabPane tab="Phases & Cutoffs" key="3">
              <Card>
                <Form.List name="phases">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name }) => (
                        <Card key={key} style={{ marginBottom: 16 }} type="inner"
                          title={<Space><TrophyOutlined />Phase {key + 1}</Space>}
                          extra={<Button danger size="small" onClick={() => remove(name)}>Remove</Button>}
                        >
                          <Row gutter={16}>
                            <Col span={6}><Form.Item name={[name,"name"]} label="Phase Name"><Input /></Form.Item></Col>
                            <Col span={6}><Form.Item name={[name,"duration"]} label="Duration (min)"><InputNumber style={{ width:"100%" }} /></Form.Item></Col>
                            <Col span={6}><Form.Item name={[name,"totalQuestions"]} label="Total Questions"><InputNumber style={{ width:"100%" }} /></Form.Item></Col>
                            <Col span={6}><Form.Item name={[name,"totalMarks"]} label="Total Marks"><InputNumber style={{ width:"100%" }} /></Form.Item></Col>
                          </Row>
                          <Form.List name={[name,"sections"]}>
                            {(secFields, { add: addSec, remove: removeSec }) => (
                              <>
                                {secFields.map((sec, i) => (
                                  <Space key={sec.key} align="baseline" style={{ display:"flex", marginBottom: 8 }} size={12}>
                                    <Form.Item name={[sec.name,"name"]} label={`Section ${i + 1}`}>
                                      <Input placeholder="Section name" style={{ width: 160 }} />
                                    </Form.Item>
                                    <Form.Item name={[sec.name,"questions"]} label="Questions">
                                      <InputNumber style={{ width: 100 }} />
                                    </Form.Item>
                                    <Form.Item name={[sec.name,"marks"]} label="Marks">
                                      <InputNumber style={{ width: 100 }} />
                                    </Form.Item>
                                    <Form.Item name={[sec.name,"negativeMarks"]} label="Negative">
                                      <InputNumber style={{ width: 90 }} step={0.25} />
                                    </Form.Item>
                                    <Button danger size="small" onClick={() => removeSec(sec.name)}></Button>
                                  </Space>
                                ))}
                                <Button type="dashed" onClick={() => addSec()} block style={{ marginBottom: 16 }}>
                                  + Add Section
                                </Button>
                              </>
                            )}
                          </Form.List>
                        </Card>
                      ))}
                      <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                        Add Phase
                      </Button>
                    </>
                  )}
                </Form.List>
              </Card>
            </TabPane>

            {/* TAB 4: SEO & Links */}
            <TabPane tab="SEO & Links" key="4">
              <Card>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="officialWebsite" label="Official Website"><Input prefix={<GlobalOutlined />} /></Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="notificationLink" label="Notification PDF Link"><Input /></Form.Item>
                  </Col>
                </Row>
                <Divider>SEO Settings</Divider>
                <Form.Item name={["seo","seo_title"]} label="SEO Title"><Input /></Form.Item>
                <Form.Item name={["seo","meta_description"]} label="Meta Description"><TextArea rows={3} /></Form.Item>
                <Form.Item name={["seo","meta_keywords"]} label="Keywords (comma separated)"><Input /></Form.Item>
                <Form.Item name={["seo","canonical_url"]} label="Canonical URL"><Input /></Form.Item>
              </Card>
            </TabPane>

            {/* TAB 5: Resources Mapping */}
            <TabPane tab=" Resources" key="5">
              <Card>
                <Form.Item name="courses" label="Linked Courses">
                  <Select mode="multiple" placeholder="Select courses" showSearch optionFilterProp="label">
                    {allCourses.map(c => (
                      <Select.Option key={c._id} value={c._id} label={c.title}>
                        {c.title}  {c.price}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item name="books" label="Linked Books">
                  <Select mode="multiple" placeholder="Select books" showSearch optionFilterProp="label">
                    {allBooks.map(b => (
                      <Select.Option key={b._id} value={b._id} label={b.title}>
                        {b.title}  {b.price}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item name="courseContents" label="Linked Course Content">
                  <Select mode="multiple" placeholder="Select content" showSearch optionFilterProp="label">
                    {allCourseContents.map(c => (
                      <Select.Option key={c._id} value={c._id} label={c.content_subject}>
                        {c.content_subject}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item name="testSeries" label="Linked Exam Categories">
                  <Select mode="multiple" placeholder="Select exam categories" showSearch optionFilterProp="label">
                    {allTestCategories.map(c => (
                      <Select.Option key={c._id} value={c._id} label={c.name}>
                        {c.name}{c.code ? ` (${c.code})` :''}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Divider style={{ margin:"20px 0 10px" }}> Extended Resource Mapping (New)</Divider>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="mappedSyllabus" label="Map Syllabus">
                      <Select mode="multiple" placeholder="Select syllabus" allowClear showSearch optionFilterProp="children">
                        {syllabusList.map(s => <Option key={s._id} value={s._id}>{s.examName} - {s.title}</Option>)}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="mappedPyqs" label="Map PYQs">
                      <Select mode="multiple" placeholder="Select PYQs" allowClear showSearch optionFilterProp="children">
                        {pyqList.map(p => <Option key={p._id} value={p._id}>{p.examName} ({p.year})</Option>)}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="mappedNotifications" label="Map Notifications">
                      <Select mode="multiple" placeholder="Select notifications" allowClear showSearch optionFilterProp="children">
                        {jobList.map(j => <Option key={j._id} value={j._id}>{j.title} ({j.organization_name})</Option>)}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="mappedCurrentAffairs" label="Map Current Affairs">
                      <Select mode="multiple" placeholder="Select current affairs" allowClear showSearch optionFilterProp="children">
                        {caList.map(ca => <Option key={ca._id} value={ca._id}>{ca.title} ({ca.type})</Option>)}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </TabPane>

            {/* TAB 6: Admin Controls (Admin-only) */}
            <TabPane tab={<span><SettingOutlined /> Admin Controls</span>} key="6">
              <Card>
                <Alert
                  message="Admin-only section"
                  description="These controls are only visible to admins and override teacher-level settings."
                  type="warning"
                  showIcon
                  style={{ marginBottom: 16, borderRadius: 8 }}
                />
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item name="isFeatured" label="Featured Exam" valuePropName="checked">
                      <Switch checkedChildren="Featured" unCheckedChildren="Normal" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="isPopular" label="Mark as Popular" valuePropName="checked">
                      <Switch checkedChildren="Popular" unCheckedChildren="No" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="showOnHomepage" label="Show on Homepage" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item name="priority" label="Display Priority (lower = higher)">
                      <InputNumber min={0} max={999} style={{ width:"100%" }} />
                    </Form.Item>
                  </Col>
                  <Col span={16}>
                    <Form.Item name="adminNotes" label="Admin Notes (internal)">
                      <TextArea rows={3} placeholder="Internal notes for admin team only..." />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </TabPane>

          </Tabs>

          <Divider />
          <Row justify="end">
            <Space>
              <Button onClick={() => { setExamModalVisible(false); form.resetFields(); setSelectedExam(null); }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading} icon={selectedExam ? <EditOutlined /> : <PlusOutlined />}>
                {selectedExam ?"Update Exam" :"Create Exam"}
              </Button>
            </Space>
          </Row>
        </Form>
      </Modal>

      {/* 
          CATEGORY MODAL
       */}
      <Modal
        title={selectedCategory ? `Edit: ${selectedCategory.name}` :"Create New Category"}
        open={categoryModalVisible}
        onCancel={() => { setCategoryModalVisible(false); categoryForm.resetFields(); setSelectedCategory(null); }}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form layout="vertical" form={categoryForm} onFinish={selectedCategory ? updateCategory : createCategory}>
          <Form.Item name="name" label="Category Name" rules={[{ required: true }]}>
            <Input prefix={<FolderOutlined />} />
          </Form.Item>
          <Form.Item name="slug" label="Slug" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={4} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="isActive" label="Active Status" valuePropName="checked" initialValue={true}>
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="isFeatured" label="Featured" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="priority" label="Priority">
                <InputNumber min={0} max={999} style={{ width:"100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="seoTitle" label="SEO Title">
            <Input />
          </Form.Item>
          <Form.Item name="metaDescription" label="Meta Description">
            <TextArea rows={2} />
          </Form.Item>
          <Divider />
          <Row justify="end">
            <Space>
              <Button onClick={() => setCategoryModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {selectedCategory ?"Update Category" :"Create Category"}
              </Button>
            </Space>
          </Row>
        </Form>
      </Modal>

      {/* View Exam Modal */}
      <ViewExamModal exam={viewExam} open={viewModalOpen} onClose={() => setViewModalOpen(false)} />
    </Layout>
  );
};

export default AdminExamManagement;