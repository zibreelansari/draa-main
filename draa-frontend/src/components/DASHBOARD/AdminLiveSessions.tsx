// frontend/src/pages/AdminLiveSessionManager.tsx
import { useEffect, useState, useCallback, useMemo } from"react";
import {
  Layout,
  Form,
  Input,
  InputNumber,
  Button,
  DatePicker,
  Space,
  Typography,
  message,
  Popconfirm,
  Row,
  Col,
  Table,
  Divider,
  Card,
  Select,
  Tag,
  Avatar,
  Badge,
  Tooltip,
  Alert,
  Empty,
  Modal,
  Drawer,
  Descriptions,
} from"antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  ReloadOutlined,
  ExportOutlined,
  UserOutlined,
  BookOutlined,
  VideoCameraOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  FilterOutlined,
  SearchOutlined,
  EyeOutlined,
  LinkOutlined,
  CopyOutlined,
  TeamOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  StopOutlined,
  SaveOutlined,
} from"@ant-design/icons";
import moment from"moment";
import axios from"axios";
import { useNavigate } from"react-router-dom";
import Sidebar from"./Sidebar";
import Topbar from"./Topbar";
import url from"../../url";
import { getAuthHeaders } from"../../utils/global_auth";
import usePageTitle from "../../hooks/usePageTitle";

const { Content, Footer } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Search } = Input;

//  Interfaces 

interface Teacher {
  _id: string;
  tname: string;
  temail?: string;
  tspecialization?: string;
  tprofile?: string;
  Status?: string;
}

interface Course {
  _id: string;
  title: string;
  description?: string;
  teacher_id?: { _id: string; tname: string };
  status?: string;
}

interface LiveSession {
  _id: string;
  topic: string;
  startTime: string;
  duration: number;
  description?: string;
  courseId?: { _id: string; title: string } | null;
  createdBy?: { _id: string; tname?: string; aname?: string } | string | null;
  zoomMeetingId?: string;
  joinUrl?: string;
  startUrl?: string;
  status?: string;
  createdAt?: string;
}

interface LoginUser {
  id?: string;
  aname?: string;
  aemail?: string;
}

//  Status config 

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  scheduled: { color:"#1677ff", icon: <ClockCircleOutlined />, label:"Scheduled" },
  started: { color:"#52c41a", icon: <PlayCircleOutlined />, label:"Live" },
  ended: { color:"#8c8c8c", icon: <StopOutlined />, label:"Ended" },
  cancelled: { color:"#f5222d", icon: <StopOutlined />, label:"Cancelled" },
};

//  Component 

const AdminLiveSessionManager = () => {
  usePageTitle('Live Sessions | Admin');
  const navigate = useNavigate();
  const [form] = Form.useForm();

  //  Auth 
  const [loginUser, setLoginUser] = useState<LoginUser | null>(null);

  //  Data 
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]); // full list for filter

  //  Loading 
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  //  Modal / Drawer 
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<LiveSession | null>(null);
  const [editingSession, setEditingSession] = useState<LiveSession | null>(null);
  const [modalMode, setModalMode] = useState<"add" |"edit">("add");

  //  Form internal state: selected teacher in modal 
  const [modalTeacherId, setModalTeacherId] = useState<string | null>(null);
  const [modalCourses, setModalCourses] = useState<Course[]>([]);
  const [modalCoursesLoading, setModalCoursesLoading] = useState(false);

  //  Filters 
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [teacherFilter, setTeacherFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");

  //  Auth 
  useEffect(() => {
    const raw = localStorage.getItem("edudocs");
    if (!raw) { message.warning("Not logged in!"); navigate("/admin-login"); return; }
    try {
      const user = JSON.parse(raw);
      if (!user.aname) { message.error("Admin access required."); navigate("/admin-login"); return; }
      setLoginUser(user);
    } catch {
      message.error("Invalid session."); navigate("/admin-login");
    }
  }, [navigate]);

  //  Fetch Teachers 
  const fetchTeachers = useCallback(async () => {
    setTeachersLoading(true);
    try {
      const res = await axios.get(`${url}/updateTeacherStatus/all`, {
        headers: getAuthHeaders()
      });
      if (res.data.success && res.data.data?.teachers) {
        setTeachers(res.data.data.teachers.filter((t: Teacher) => t.Status ==="approved"));
        return;
      }
      throw new Error("fallback");
    } catch {
      try {
        const fb = await axios.get(`${url}/count/getAllTeachers`, {
          headers: getAuthHeaders()
        });
        setTeachers(fb.data.Teachers || []);
      } catch {
        try {
          const fb2 = await axios.get(`${url}/allteachersName`, {
            headers: getAuthHeaders()
          });
          setTeachers(fb2.data.teachers || []);
        } catch { console.warn("Could not load teachers"); }
      }
    } finally {
      setTeachersLoading(false);
    }
  }, []);

  //  Fetch All Sessions 
  const fetchSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const res = await axios.get(`${url}/live-sessions`, {
        headers: getAuthHeaders()
      });
      const data = res.data?.meetings || res.data?.data || res.data;
      setSessions(Array.isArray(data) ? data : []);
    } catch {
      message.error("Failed to load live sessions");
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  //  Fetch All Courses (for filter dropdown) 
  const fetchAllCourses = useCallback(async () => {
    try {
      let courseData: Course[] = [];
      try {
        const res = await axios.get(`${url}/admin/courses`, {
          headers: getAuthHeaders()
        });
        courseData = res.data.data?.courses || res.data.courses || [];
      } catch {
        const res = await axios.get(`${url}/course/admin/courses`, {
          headers: getAuthHeaders()
        });
        courseData = res.data.data?.courses || res.data.courses || res.data || [];
      }
      setAllCourses(courseData);
    } catch { console.warn("Could not load all courses"); }
  }, []);

  //  Init 
  useEffect(() => {
    if (loginUser?.aname) {
      fetchSessions();
      fetchTeachers();
      fetchAllCourses();
    }
  }, [loginUser, fetchSessions, fetchTeachers, fetchAllCourses]);

  //  Load courses for a specific teacher (inside modal) 
  const loadCoursesForTeacher = useCallback(async (teacherId: string) => {
    setModalCoursesLoading(true);
    try {
      const res = await axios.get(`${url}/course/courseDetails/teacher/${teacherId}`, {
        headers: getAuthHeaders()
      });
      setModalCourses(res.data.courses || []);
    } catch {
      // fallback: filter from allCourses
      const filtered = allCourses.filter(
        (c) =>
          (c as any).teacher_id?._id === teacherId ||
          (c as any).teacher_id === teacherId
      );
      setModalCourses(filtered);
    } finally {
      setModalCoursesLoading(false);
    }
  }, [allCourses]);

  //  Open Add Modal 
  const openAddModal = () => {
    setModalMode("add");
    setEditingSession(null);
    setModalTeacherId(null);
    setModalCourses([]);
    form.resetFields();
    setFormModalOpen(true);
  };

  //  Open Edit Modal 
  const openEditModal = (session: LiveSession) => {
    setModalMode("edit");
    setEditingSession(session);

    const teacherId =
      typeof session.createdBy ==="object"
        ? session.createdBy?._id
        : session.createdBy as string | undefined;

    setModalTeacherId(teacherId || null);

    if (teacherId) loadCoursesForTeacher(teacherId);

    form.setFieldsValue({
      topic: session.topic,
      startTime: moment(session.startTime),
      duration: session.duration,
      description: session.description ||"",
      courseId: session.courseId?._id || null,
      teacherId: teacherId || null,
    });
    setFormModalOpen(true);
  };

  //  Form Submit 
  const onFinish = async (values: any) => {
    setFormSubmitting(true);
    const payload = {
      topic: values.topic,
      startTime: values.startTime.toISOString(),
      duration: values.duration,
      description: values.description ||"",
      courseId: values.courseId || null,
      createdBy: values.teacherId || loginUser?.id ||"admin",
    };

    try {
      if (modalMode ==="edit" && editingSession) {
        await axios.put(`${url}/live-sessions/${editingSession._id}`, payload, {
          headers: getAuthHeaders()
        });
        message.success(" Live session updated!");
      } else {
        await axios.post(`${url}/live-sessions`, payload, {
          headers: getAuthHeaders()
        });
        const teacherName = teachers.find((t) => t._id === values.teacherId)?.tname;
        message.success(
          teacherName
            ? ` Session created on behalf of ${teacherName}!`
            :" Live session created!"
        );
      }
      setFormModalOpen(false);
      form.resetFields();
      setEditingSession(null);
      fetchSessions();
    } catch (error: any) {
      message.error(error.response?.data?.error ||" Failed to save session");
    } finally {
      setFormSubmitting(false);
    }
  };

  //  Delete 
  const onDelete = async (id: string, topic: string) => {
    setActionLoading(id);
    try {
      await axios.delete(`${url}/live-sessions/${id}`, {
        headers: getAuthHeaders()
      });
      message.success(`"${topic}" deleted`);
      setSessions((prev) => prev.filter((s) => s._id !== id));
      if (selectedSession?._id === id) setDetailDrawerOpen(false);
    } catch {
      message.error("Failed to delete session");
    } finally {
      setActionLoading(null);
    }
  };

  //  Copy join URL 
  const copyJoinUrl = (joinUrl: string) => {
    navigator.clipboard.writeText(joinUrl);
    message.success("Join URL copied!");
  };

  //  Filtered sessions 
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const search = searchText.toLowerCase();
      const matchSearch =
        s.topic.toLowerCase().includes(search) ||
        s.courseId?.title?.toLowerCase().includes(search) ||
        (typeof s.createdBy ==="object" && s.createdBy?.tname?.toLowerCase().includes(search));

      const matchStatus =
        statusFilter ==="all" || (s.status ||"scheduled") === statusFilter;

      const creatorId =
        typeof s.createdBy ==="object" ? s.createdBy?._id : s.createdBy;
      const matchTeacher = teacherFilter ==="all" || creatorId === teacherFilter;
      const matchCourse = courseFilter ==="all" || s.courseId?._id === courseFilter;

      return matchSearch && matchStatus && matchTeacher && matchCourse;
    });
  }, [sessions, searchText, statusFilter, teacherFilter, courseFilter]);

  const isFilterActive =
    searchText !=="" || statusFilter !=="all" || teacherFilter !=="all" || courseFilter !=="all";

  const clearFilters = () => {
    setSearchText("");
    setStatusFilter("all");
    setTeacherFilter("all");
    setCourseFilter("all");
  };

  //  Stats 
  const stats = useMemo(() => ({
    total: sessions.length,
    scheduled: sessions.filter((s) => (s.status ||"scheduled") ==="scheduled").length,
    live: sessions.filter((s) => s.status ==="started").length,
    ended: sessions.filter((s) => s.status ==="ended").length,
  }), [sessions]);

  //  Export 
  const handleExport = () => {
    const headers = ["Topic","Course","Teacher","Start Time","Duration (mins)","Status","Join URL"];
    const rows = filteredSessions.map((s) => [
      `"${s.topic}"`,
      `"${s.courseId?.title ||"N/A"}"`,
      `"${typeof s.createdBy ==="object" ? s.createdBy?.tname || s.createdBy?.aname ||"Admin" :"Admin"}"`,
      moment(s.startTime).format("YYYY-MM-DD HH:mm"),
      s.duration,
      s.status ||"scheduled",
      s.joinUrl ||"N/A",
    ].join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type:"text/csv" });
    const dl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = dl; a.download = `live-sessions-${moment().format("YYYY-MM-DD")}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    window.URL.revokeObjectURL(dl);
    message.success("Exported!");
  };

  //  Unique teachers in sessions (for filter) 
  const teachersInSessions = useMemo(() => {
    const map = new Map<string, string>();
    sessions.forEach((s) => {
      if (typeof s.createdBy ==="object" && s.createdBy?._id) {
        map.set(s.createdBy._id, s.createdBy.tname || s.createdBy.aname ||"Unknown");
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [sessions]);

  const coursesInSessions = useMemo(() => {
    const map = new Map<string, string>();
    sessions.forEach((s) => { if (s.courseId?._id) map.set(s.courseId._id, s.courseId.title); });
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [sessions]);

  //  Table Columns 
  const columns = [
    {
      title:"Session",
      key:"topic",
      width: 240,
      render: (_: any, record: LiveSession) => {
        const cfg = STATUS_CONFIG[record.status ||"scheduled"];
        return (
          <div>
            <Text
              strong
              style={{ fontSize: 13, color:"#1677ff", cursor:"pointer", display:"block" }}
              onClick={() => { setSelectedSession(record); setDetailDrawerOpen(true); }}
            >
              {record.topic}
            </Text>
            {record.description && (
              <Text type="secondary" style={{ fontSize: 11 }}>
                {record.description.length > 55 ? record.description.substring(0, 55) +"" : record.description}
              </Text>
            )}
            <div style={{ marginTop: 4 }}>
              <Tag
                style={{
                  fontSize: 10, background: cfg.color +"18",
                  borderColor: cfg.color +"44", color: cfg.color,
                }}
              >
                {cfg.icon} {cfg.label}
              </Tag>
            </div>
          </div>
        );
      },
    },
    {
      title:"Course",
      key:"course",
      width: 180,
      render: (_: any, record: LiveSession) =>
        record.courseId ? (
          <Space size={6}>
            <BookOutlined style={{ color:"#722ed1" }} />
            <Text style={{ fontSize: 12 }}>{record.courseId.title}</Text>
          </Space>
        ) : (
          <Text type="secondary" style={{ fontSize: 11, fontStyle:"italic" }}>No course linked</Text>
        ),
    },
    {
      title:"Teacher",
      key:"teacher",
      width: 160,
      render: (_: any, record: LiveSession) => {
        const creator = typeof record.createdBy ==="object" ? record.createdBy : null;
        const name = creator?.tname || creator?.aname ||"Admin";
        const isAdmin = !!creator?.aname;
        const teacherObj = teachers.find((t) => t._id === creator?._id);
        return (
          <Space size={6}>
            <Avatar
              src={teacherObj?.tprofile}
              icon={<UserOutlined />}
              size={26}
              style={{ background: isAdmin ?"#1677ff" :"#52c41a" }}
            />
            <div>
              <Text style={{ fontSize: 12, display:"block", fontWeight: 600 }}>{name}</Text>
              <Tag color={isAdmin ?"blue" :"green"} style={{ fontSize: 10, padding:"0 4px", lineHeight:"16px", margin: 0 }}>
                {isAdmin ?"Admin" :"Teacher"}
              </Tag>
            </div>
          </Space>
        );
      },
    },
    {
      title:"Schedule",
      key:"schedule",
      width: 150,
      render: (_: any, record: LiveSession) => (
        <Space direction="vertical" size={2}>
          <Text style={{ fontSize: 12 }}>
            <CalendarOutlined style={{ color:"#1677ff", marginRight: 4 }} />
            {moment(record.startTime).format("DD MMM YYYY")}
          </Text>
          <Text style={{ fontSize: 12 }}>
            <ClockCircleOutlined style={{ color:"#fa8c16", marginRight: 4 }} />
            {moment(record.startTime).format("hh:mm A")}
          </Text>
          <Text style={{ fontSize: 11, color:"#8c8c8c" }}>{record.duration} mins</Text>
        </Space>
      ),
    },
    {
      title:"Join URL",
      key:"joinUrl",
      width: 120,
      render: (_: any, record: LiveSession) =>
        record.joinUrl ? (
          <Space size={4}>
            <Tooltip title={record.joinUrl}>
              <Button
                type="link"
                icon={<LinkOutlined />}
                size="small"
                href={record.joinUrl}
                target="_blank"
                style={{ padding: 0 }}
              >
                Join
              </Button>
            </Tooltip>
            <Tooltip title="Copy link">
              <Button
                type="text"
                icon={<CopyOutlined />}
                size="small"
                onClick={() => copyJoinUrl(record.joinUrl!)}
              />
            </Tooltip>
          </Space>
        ) : (
          <Text type="secondary" style={{ fontSize: 11 }}></Text>
        ),
    },
    {
      title:"Actions",
      key:"actions",
      width: 130,
      fixed:"right" as const,
      render: (_: any, record: LiveSession) => (
        <Space size={4}>
          <Tooltip title="View Details">
            <Button type="text" icon={<EyeOutlined />} size="small"
              onClick={() => { setSelectedSession(record); setDetailDrawerOpen(true); }} />
          </Tooltip>
          <Tooltip title="Edit Session">
            <Button type="text" icon={<EditOutlined />} size="small"
              style={{ color:"#1677ff" }}
              onClick={() => openEditModal(record)} />
          </Tooltip>
          <Popconfirm
            title="Delete Session"
            description={`Delete"${record.topic}"? This cannot be undone.`}
            onConfirm={() => onDelete(record._id, record.topic)}
            okText="Delete" cancelText="Cancel" okType="danger"
          >
            <Button danger type="text" icon={<DeleteOutlined />} size="small"
              loading={actionLoading === record._id} />
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

          {/*  Header  */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom: 24, flexWrap:"wrap", gap: 12 }}>
            <div>
              <Title level={2} style={{ margin: 0, color:"#1677ff" }}>
                <VideoCameraOutlined style={{ marginRight: 10 }} />
                Live Session Management
              </Title>
              <Text type="secondary">
                Create & manage live sessions on behalf of any teacher for any course
              </Text>
            </div>
            <Space wrap>
              <Button icon={<ReloadOutlined />} onClick={fetchSessions} loading={sessionsLoading}>Refresh</Button>
              <Button icon={<ExportOutlined />} onClick={handleExport}>Export</Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal} style={{ background:"#1677ff" }}>
                Schedule Session
              </Button>
            </Space>
          </div>

          {/*  Stats  */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {[
              { title:"Total Sessions", value: stats.total, icon: <VideoCameraOutlined />, color:"#1677ff", sub:"All time" },
              { title:"Scheduled", value: stats.scheduled, icon: <CalendarOutlined />, color:"#fa8c16", sub:"Upcoming" },
              { title:"Live Now", value: stats.live, icon: <PlayCircleOutlined />, color:"#52c41a", sub:"In progress" },
              { title:"Ended", value: stats.ended, icon: <CheckCircleOutlined />, color:"#8c8c8c", sub:"Completed" },
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

          {/*  Filters  */}
          <Card bordered={false} style={{ marginBottom: 16, borderRadius: 12, boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
            <Row gutter={[12, 12]} align="middle">
              <Col xs={24} sm={8} lg={6}>
                <Search
                  placeholder="Search topic, course, teacher..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  prefix={<SearchOutlined style={{ color:"#bfbfbf" }} />}
                />
              </Col>
              <Col xs={12} sm={4} lg={3}>
                <Select value={statusFilter} onChange={setStatusFilter} style={{ width:"100%" }}>
                  <Option value="all">All Status</Option>
                  <Option value="scheduled">Scheduled</Option>
                  <Option value="started">Live</Option>
                  <Option value="ended">Ended</Option>
                  <Option value="cancelled">Cancelled</Option>
                </Select>
              </Col>
              <Col xs={12} sm={5} lg={4}>
                <Select
                  value={teacherFilter}
                  onChange={setTeacherFilter}
                  style={{ width:"100%" }}
                  placeholder="Filter by teacher"
                  showSearch optionFilterProp="children"
                >
                  <Option value="all">All Teachers</Option>
                  {teachersInSessions.map((t) => (
                    <Option key={t.id} value={t.id}>{t.name}</Option>
                  ))}
                </Select>
              </Col>
              <Col xs={12} sm={5} lg={4}>
                <Select
                  value={courseFilter}
                  onChange={setCourseFilter}
                  style={{ width:"100%" }}
                  placeholder="Filter by course"
                  showSearch optionFilterProp="children"
                >
                  <Option value="all">All Courses</Option>
                  {coursesInSessions.map((c) => (
                    <Option key={c.id} value={c.id}>{c.title}</Option>
                  ))}
                </Select>
              </Col>
              <Col xs={12} sm={4} lg={3}>
                <Button icon={<FilterOutlined />} onClick={clearFilters} disabled={!isFilterActive} block>Clear</Button>
              </Col>
            </Row>
          </Card>

          {isFilterActive && (
            <Alert
              message={`Showing ${filteredSessions.length} of ${sessions.length} sessions`}
              type="info" showIcon closable={false}
              style={{ marginBottom: 12, borderRadius: 8 }}
            />
          )}

          {/*  Table  */}
          <Card
            title={
              <Space>
                <VideoCameraOutlined style={{ color:"#1677ff" }} />
                <Text strong>Live Sessions</Text>
                <Badge count={filteredSessions.length} style={{ background:"#1677ff" }} showZero />
              </Space>
            }
            bordered={false}
            style={{ borderRadius: 12, boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}
          >
            <Table
              columns={columns}
              dataSource={filteredSessions}
              rowKey="_id"
              loading={sessionsLoading}
              bordered={false}
              scroll={{ x: 1100 }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                pageSizeOptions: ["10","20","50"],
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} sessions`,
              }}
              size="small"
              locale={{
                emptyText: sessionsLoading ?"Loading..." : (
                  <Empty description="No sessions found" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                    <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
                      Schedule First Session
                    </Button>
                  </Empty>
                ),
              }}
            />
          </Card>

          {/* 
              ADD / EDIT SESSION MODAL
           */}
          <Modal
            title={
              <Space>
                {modalMode ==="add"
                  ? <PlusOutlined style={{ color:"#1677ff" }} />
                  : <EditOutlined style={{ color:"#fa8c16" }} />}
                <Text strong style={{ fontSize: 16 }}>
                  {modalMode ==="add" ?"Schedule New Live Session" : `Edit: ${editingSession?.topic}`}
                </Text>
              </Space>
            }
            open={formModalOpen}
            onCancel={() => { setFormModalOpen(false); form.resetFields(); setEditingSession(null); setModalTeacherId(null); setModalCourses([]); }}
            width={680}
            footer={
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {modalMode ==="add" ?"Select teacher & course, then fill session details" :"Edit session details"}
                </Text>
                <Space>
                  <Button onClick={() => { setFormModalOpen(false); form.resetFields(); }}>Cancel</Button>
                  <Button
                    type="primary"
                    icon={modalMode ==="add" ? <PlusOutlined /> : <SaveOutlined />}
                    loading={formSubmitting}
                    onClick={() => form.submit()}
                  >
                    {modalMode ==="add" ?"Create Session" :"Save Changes"}
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
              onFinish={onFinish}
              initialValues={{ duration: 60 }}
            >
              {/*  TEACHER + COURSE SECTION  */}
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
                  Creating session on behalf of:
                </Text>

                <Row gutter={12}>
                  <Col span={12}>
                    <Form.Item
                      label={<Text strong>Select Teacher</Text>}
                      name="teacherId"
                      rules={[{ required: true, message:"Please select a teacher" }]}
                      style={{ marginBottom: 0 }}
                    >
                      <Select
                        placeholder="Search teacher..."
                        showSearch
                        loading={teachersLoading}
                        optionFilterProp="label"
                        filterOption={(input, option) =>
                          String(option?.label).toLowerCase().includes(input.toLowerCase())
                        }
                        optionLabelProp="label"
                        size="large"
                        onChange={(teacherId: string) => {
                          setModalTeacherId(teacherId);
                          form.setFieldValue("courseId", undefined);
                          loadCoursesForTeacher(teacherId);
                        }}
                      >
                        {teachers.map((t) => (
                          <Option key={t._id} value={t._id} label={t.tname}>
                            <div style={{ display:"flex", alignItems:"center", gap: 8, padding:"4px 0" }}>
                              <Avatar src={t.tprofile} icon={<UserOutlined />} size={28} style={{ background:"#52c41a" }} />
                              <div>
                                <div style={{ fontWeight: 600, fontSize: 13 }}>{t.tname}</div>
                                {t.tspecialization && (
                                  <div style={{ fontSize: 11, color:"#8c8c8c" }}>{t.tspecialization}</div>
                                )}
                              </div>
                            </div>
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={<Text strong>Select Course</Text>}
                      name="courseId"
                      rules={[{ required: true, message:"Please select a course" }]}
                      style={{ marginBottom: 0 }}
                    >
                      <Select
                        placeholder={
                          !modalTeacherId
                            ?"Select a teacher first"
                            : modalCoursesLoading
                              ?"Loading courses..."
                              :"Choose a course"
                        }
                        showSearch
                        disabled={!modalTeacherId}
                        loading={modalCoursesLoading}
                        optionFilterProp="children"
                        size="large"
                        notFoundContent={
                          modalCoursesLoading
                            ?"Loading..."
                            : modalTeacherId
                              ?"No courses found for this teacher"
                              :"Select a teacher first"
                        }
                      >
                        {modalCourses.map((c) => (
                          <Option key={c._id} value={c._id}>
                            <Space>
                              <BookOutlined style={{ color:"#722ed1" }} />
                              {c.title}
                            </Space>
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                {modalTeacherId && modalCourses.length === 0 && !modalCoursesLoading && (
                  <Alert
                    message="This teacher has no courses yet. You can still create the session without a course."
                    type="warning"
                    showIcon
                    style={{ marginTop: 10 }}
                  />
                )}
              </div>

              <Divider style={{ margin:"0 0 16px" }} />

              {/*  SESSION DETAILS  */}
              <Form.Item
                label="Session Title / Topic"
                name="topic"
                rules={[{ required: true, message:"Please enter the session title" }]}
              >
                <Input size="large" placeholder="e.g., Introduction to Calculus  Live Q&A" />
              </Form.Item>

              <Row gutter={12}>
                <Col span={14}>
                  <Form.Item
                    label="Start Date & Time"
                    name="startTime"
                    rules={[{ required: true, message:"Please select start date & time" }]}
                  >
                    <DatePicker
                      showTime={{ format:"HH:mm" }}
                      format="YYYY-MM-DD HH:mm"
                      size="large"
                      style={{ width:"100%" }}
                      disabledDate={(current) =>
                        current && current < moment().startOf("day")
                      }
                      placeholder="Select date & time"
                    />
                  </Form.Item>
                </Col>
                <Col span={10}>
                  <Form.Item
                    label="Duration (minutes)"
                    name="duration"
                    rules={[{ required: true, message:"Enter duration" }]}
                  >
                    <InputNumber
                      min={1}
                      max={480}
                      size="large"
                      style={{ width:"100%" }}
                      placeholder="e.g., 60"
                      addonAfter="mins"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Description / Agenda (optional)" name="description">
                <TextArea
                  rows={4}
                  placeholder="What will be covered in this session? Add agenda, notes, or instructions for students..."
                />
              </Form.Item>
            </Form>
          </Modal>

          {/* 
              SESSION DETAIL DRAWER
           */}
          <Drawer
            title={
              <Space>
                <VideoCameraOutlined style={{ color:"#1677ff" }} />
                Session Details
              </Space>
            }
            placement="right"
            width={540}
            onClose={() => setDetailDrawerOpen(false)}
            open={detailDrawerOpen}
            extra={
              selectedSession && (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() => { setDetailDrawerOpen(false); openEditModal(selectedSession); }}
                >
                  Edit
                </Button>
              )
            }
          >
            {selectedSession && (() => {
              const cfg = STATUS_CONFIG[selectedSession.status ||"scheduled"];
              const creator = typeof selectedSession.createdBy ==="object" ? selectedSession.createdBy : null;
              const teacherObj = teachers.find((t) => t._id === creator?._id);
              const isAdmin = !!creator?.aname;
              return (
                <div>
                  {/* Status + title banner */}
                  <div
                    style={{
                      background: `linear-gradient(135deg, ${cfg.color}18, ${cfg.color}08)`,
                      border: `1px solid ${cfg.color}33`,
                      borderRadius: 10,
                      padding:"16px 20px",
                      marginBottom: 16,
                    }}
                  >
                    <Tag style={{ background: cfg.color +"18", borderColor: cfg.color +"44", color: cfg.color, fontWeight: 600, marginBottom: 8 }}>
                      {cfg.icon} {cfg.label}
                    </Tag>
                    <Title level={4} style={{ margin: 0 }}>{selectedSession.topic}</Title>
                    {selectedSession.description && (
                      <Text type="secondary" style={{ fontSize: 12, display:"block", marginTop: 6 }}>
                        {selectedSession.description}
                      </Text>
                    )}
                  </div>

                  {/* Teacher panel */}
                  <div
                    style={{
                      background: isAdmin ?"#e6f4ff" :"#f6ffed",
                      border: `1px solid ${isAdmin ?"#91caff" :"#b7eb8f"}`,
                      borderRadius: 8, padding:"12px 16px", marginBottom: 16,
                      display:"flex", alignItems:"center", gap: 12,
                    }}
                  >
                    <Avatar src={teacherObj?.tprofile} icon={<UserOutlined />} size={40}
                      style={{ background: isAdmin ?"#1677ff" :"#52c41a" }} />
                    <div>
                      <Text type="secondary" style={{ fontSize: 11 }}>Session by</Text>
                      <Text strong style={{ display:"block" }}>
                        {creator?.tname || creator?.aname ||"Admin"}
                      </Text>
                      <Tag color={isAdmin ?"blue" :"green"} style={{ fontSize: 11, margin: 0 }}>
                        {isAdmin ?"Admin" :"Teacher"}
                      </Tag>
                      {!isAdmin && teacherObj?.tspecialization && (
                        <Text type="secondary" style={{ fontSize: 11, display:"block" }}>
                          {teacherObj.tspecialization}
                        </Text>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="Course">
                      {selectedSession.courseId ? (
                        <Space><BookOutlined style={{ color:"#722ed1" }} />{selectedSession.courseId.title}</Space>
                      ) : (
                        <Text type="secondary">No course linked</Text>
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Start Time">
                      {moment(selectedSession.startTime).format("DD MMMM YYYY, hh:mm A")}
                    </Descriptions.Item>
                    <Descriptions.Item label="Duration">
                      {selectedSession.duration} minutes
                    </Descriptions.Item>
                    {selectedSession.zoomMeetingId && (
                      <Descriptions.Item label="Zoom Meeting ID">
                        <Text copyable>{selectedSession.zoomMeetingId}</Text>
                      </Descriptions.Item>
                    )}
                    {selectedSession.joinUrl && (
                      <Descriptions.Item label="Join URL">
                        <Space>
                          <Button type="link" href={selectedSession.joinUrl} target="_blank" icon={<LinkOutlined />} style={{ padding: 0 }}>
                            Open Join Link
                          </Button>
                          <Button type="text" icon={<CopyOutlined />} size="small" onClick={() => copyJoinUrl(selectedSession.joinUrl!)} />
                        </Space>
                      </Descriptions.Item>
                    )}
                    {selectedSession.startUrl && (
                      <Descriptions.Item label="Host URL">
                        <Button type="link" href={selectedSession.startUrl} target="_blank" icon={<PlayCircleOutlined />} style={{ padding: 0 }}>
                          Start as Host
                        </Button>
                      </Descriptions.Item>
                    )}
                    {selectedSession.createdAt && (
                      <Descriptions.Item label="Created">
                        {moment(selectedSession.createdAt).format("DD MMM YYYY, hh:mm A")}
                      </Descriptions.Item>
                    )}
                  </Descriptions>

                  <Divider />

                  <Space wrap>
                    <Popconfirm
                      title="Delete this session?"
                      description="This action cannot be undone."
                      onConfirm={() => { onDelete(selectedSession._id, selectedSession.topic); }}
                      okText="Delete" cancelText="Cancel" okType="danger"
                    >
                      <Button danger icon={<DeleteOutlined />} loading={actionLoading === selectedSession._id}>
                        Delete Session
                      </Button>
                    </Popconfirm>
                  </Space>
                </div>
              );
            })()}
          </Drawer>
        </Content>

        <Footer style={{ textAlign:"center" }}>
          <Text type="secondary">
            <b>&copy; 2026 Draa. All Rights Reserved.</b>
          </Text>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default AdminLiveSessionManager;