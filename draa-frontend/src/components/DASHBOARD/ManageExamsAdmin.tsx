import { useEffect, useState, useCallback, useMemo } from'react';
import {
  Form, Input, Button, Select, DatePicker, TimePicker, InputNumber,
  Space, Divider, message, Typography, Card, Layout, Alert, Table,
  Tag, Avatar, Tooltip, Drawer, Descriptions, Row, Col, Steps,
  Badge, Popconfirm, Modal, Empty, Tabs,
} from"antd";
import {
  PlusOutlined, DeleteOutlined, UploadOutlined, DownloadOutlined,
  UserOutlined, MailOutlined, CheckCircleOutlined, ClockCircleOutlined,
  ArrowLeftOutlined, SearchOutlined, ReloadOutlined,
  EditOutlined, EyeOutlined, SendOutlined, TeamOutlined,
  FileTextOutlined,
} from"@ant-design/icons";
import axios from'axios';
import { useNavigate } from'react-router-dom';
import * as XLSX from'xlsx';
import moment from"moment";
import dayjs from"dayjs";
import Sidebar from'./Sidebar';
import Topbar from'./Topbar';
import url from'../../url';
import { getUserRole, getAuthHeaders } from'../../utils/global_auth';
import { validateQuestionRow } from"../../utils/questionValidator";
import usePageTitle from '../../hooks/usePageTitle';


const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;
const { Content, Footer } = Layout;
const { Search } = Input;
const { Step } = Steps;

//  Types 
interface Teacher {
  _id: string;
  tname: string;
  temail: string;
  tphn: string;
  tspecialization: string;
  texp: number;
  Status:'approved' |'pending' |'rejected' |'suspended';
  tprofile?: string;
  tbio?: string;
  tqualification?: string;
  trating?: number;
  coursesCount?: number;
  promocode?: string;
  createdAt?: string;
}

interface Course { _id: string; title: string; price?: number; }

interface Exam {
  _id: string;
  title: string;
  subject?: string;
  durationMinutes?: number;
  totalMarks?: number;
  scheduledAt?: string;
  courseId?: string | { _id: string; title: string };
  questions?: any[];
  instructions?: string;
  seo?: { title?: string; keywords?: string[]; description?: string };
  mappedResources?: {
    syllabus?: string[];
    pyqs?: string[];
    notifications?: string[];
    currentAffairs?: string[];
  };
  createdAt?: string;
  createdBy?: string | { _id: string };
}

//  Stat Mini Card 
const MiniStat = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div style={{
    background:"#fff", borderRadius: 12, padding:"14px 20px",
    boxShadow:"0 1px 8px rgba(0,0,0,0.07)", borderLeft: `4px solid ${color}`, minWidth: 120,
  }}>
    <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
    <div style={{ fontSize: 12, color:"#6b7280", fontWeight: 600, letterSpacing: 0.5 }}>{label}</div>
  </div>
);

//  Main Component 
const AdminExamCreation = () => {
  const navigate = useNavigate();
  const [loginUser, setLoginUser] = useState<any>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  // Steps: 0 = pick teacher | 1 = manage exams for teacher | 2 = create/edit exam form
  const [currentStep, setCurrentStep] = useState(0);

  // Teacher list
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [teacherDrawerOpen, setTeacherDrawerOpen] = useState(false);
  const [previewTeacher, setPreviewTeacher] = useState<Teacher | null>(null);

  // Selected teacher
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  // Exams for selected teacher
  const [teacherExams, setTeacherExams] = useState<Exam[]>([]);
  const [examsLoading, setExamsLoading] = useState(false);

  // All exams (for computing counts per teacher)
  const [allExams, setAllExams] = useState<Exam[]>([]);
  const [allExamsLoading, setAllExamsLoading] = useState(false);

  // View exam modal
  const [viewExam, setViewExam] = useState<Exam | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  // Edit mode
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  // Exam form
  const [form] = Form.useForm();
  const [questions, setQuestions] = useState<any[]>([]);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Resource lists for mapping
  const [syllabusList, setSyllabusList] = useState<any[]>([]);
  const [pyqList, setPyqList] = useState<any[]>([]);
  const [caList, setCaList] = useState<any[]>([]);
  const [jobList, setJobList] = useState<any[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);

  //  Auth 
  useEffect(() => {
    const role = getUserRole();
    if (role ==="GUEST") { message.warning("Please login to continue", 5); navigate("/admin-login"); return; }
    if (role ==="STUDENT") { message.error("Students are not allowed here", 5); navigate("/student-dashboard"); return; }
    if (role !=="ADMIN" && role !=="TEACHER") { message.error("Unauthorized access", 5); navigate("/admin-login"); return; }
    const raw = localStorage.getItem("edudocs");
    if (!raw) { message.error("Session expired."); navigate("/admin-login"); return; }
    try {
      const user = JSON.parse(raw);
      if (role ==="TEACHER") {
        if (!user.isVerified) { message.error("Account not verified.", 6); navigate("/teacher-dashboard"); return; }
        if (user.Status !=="approved") { message.error("Account not approved.", 6); navigate("/teacher-dashboard"); return; }
      }
      setLoginUser(user);
      setIsAuthChecked(true);
    } catch { message.error("Invalid session."); navigate("/admin-login"); }
  }, [navigate]);

  //  Fetch all exams (for teacher exam counts) 
  const fetchAllExams = useCallback(async () => {
    setAllExamsLoading(true);
    try {
      const res = await axios.get(`${url}/exam/admin`, { headers: getAuthHeaders() });
      setAllExams(res.data.exams || []);
    } catch {
      try {
        const res = await axios.get(`${url}/exam/all`, { headers: getAuthHeaders() });
        setAllExams(res.data.exams || res.data || []);
      } catch {
        setAllExams([]);
      }
    } finally {
      setAllExamsLoading(false);
    }
  }, []);

  //  Derived: exam count per teacher 
  const teacherExamCounts = useMemo(() => {
    const map: Record<string, number> = {};
    allExams.forEach((e) => {
      const teacherId = typeof e.createdBy ==="object" ? e.createdBy?._id : e.createdBy;
      if (teacherId) map[teacherId] = (map[teacherId] || 0) + 1;
    });
    return map;
  }, [allExams]);

  //  Fetch all teachers 
  const fetchTeachers = useCallback(async () => {
    setTeachersLoading(true);
    try {
      let data: Teacher[] = [];
      try {
        const res = await axios.get(`${url}/updateTeacherStatus/all`, { headers: getAuthHeaders() });
        if (res.data.success && res.data.data?.teachers) data = res.data.data.teachers;
        else throw new Error("fallback");
      } catch {
        const res = await axios.get(`${url}/count/getAllTeachers`, { headers: getAuthHeaders() });
        data = res.data.Teachers || [];
      }
      setTeachers(data);
    } catch { message.error("Failed to load teachers"); }
    finally { setTeachersLoading(false); }
  }, []);

  useEffect(() => { if (isAuthChecked) { fetchTeachers(); fetchAllExams(); } }, [isAuthChecked, fetchTeachers, fetchAllExams]);

  //  Fetch Resource Lists 
  const fetchResourceLists = useCallback(async () => {
    setResourcesLoading(true);
    try {
      const [sRes, pRes, cRes, jRes] = await Promise.all([
        axios.get(`${url}/syllabus/all?limit=0`, { headers: getAuthHeaders() }),
        axios.get(`${url}/pyq/all?limit=0`, { headers: getAuthHeaders() }),
        axios.get(`${url}/current-affairs/all?limit=0`, { headers: getAuthHeaders() }),
        axios.get(`${url}/jobs?limit=0`, { headers: getAuthHeaders() }),
      ]);
      setSyllabusList(sRes.data.syllabuses || []);
      setPyqList(pRes.data.pyqs || []);
      setCaList(cRes.data.data || []);
      setJobList(jRes.data.jobs || jRes.data.data?.jobs || []);
    } catch (err) {
      console.error("Failed to fetch resources for mapping", err);
    } finally {
      setResourcesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthChecked) fetchResourceLists();
  }, [isAuthChecked, fetchResourceLists]);

  //  Filter teachers 
  useEffect(() => {
    setFilteredTeachers(teachers.filter(t => {
      const ms = t.tname.toLowerCase().includes(searchText.toLowerCase()) ||
        t.temail.toLowerCase().includes(searchText.toLowerCase()) ||
        t.tspecialization?.toLowerCase().includes(searchText.toLowerCase());
      const mst = statusFilter ==="all" || t.Status === statusFilter;
      return ms && mst;
    }));
  }, [teachers, searchText, statusFilter]);

  //  Load teacher courses 
  const loadTeacherCourses = async (teacherId: string) => {
    setCoursesLoading(true);
    try {
      const res = await axios.get(`${url}/course/courseDetails/teacher/${teacherId}`, { headers: getAuthHeaders() });
      setCourses(res.data.courses || []);
    } catch { message.warning("Could not load courses"); setCourses([]); }
    finally { setCoursesLoading(false); }
  };

  //  Load exams for selected teacher 
  const loadTeacherExams = useCallback(async (teacherId: string) => {
    setExamsLoading(true);
    try {
      // Try teacher-specific exam endpoint, fallback to admin all exams
      let exams: Exam[] = [];
      try {
        const res = await axios.get(`${url}/exam/teacher/${teacherId}`, { headers: getAuthHeaders() });
        exams = res.data.exams || res.data || [];
      } catch {
        const res = await axios.get(`${url}/exam/admin`, { headers: getAuthHeaders() });
        const all: Exam[] = res.data.exams || [];
        exams = all.filter((e: any) => e.createdBy === teacherId || e.createdBy?._id === teacherId);
      }
      setTeacherExams(exams);
    } catch { message.error("Failed to load exams for this teacher"); setTeacherExams([]); }
    finally { setExamsLoading(false); }
  }, []);

  //  Select teacher  go to manage exams 
  const selectTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    loadTeacherCourses(teacher._id);
    loadTeacherExams(teacher._id);
    setCurrentStep(1);
  };

  //  Open create exam form 
  const openCreateForm = () => {
    setEditingExam(null);
    form.resetFields();
    setQuestions([]);
    setCurrentStep(2);
  };

  //  Open edit exam form 
  const openEditForm = (exam: Exam) => {
    setEditingExam(exam);
    form.setFieldsValue({
      title: exam.title,
      subject: exam.subject,
      instructions: exam.instructions,
      duration: exam.durationMinutes,
      scheduledDate: exam.scheduledAt ? dayjs(exam.scheduledAt) : null,
      scheduledTime: exam.scheduledAt ? dayjs(exam.scheduledAt) : null,
      courseId: typeof exam.courseId ==="object" ? exam.courseId._id : exam.courseId,
      seoTitle: exam.seo?.title,
      seoKeywords: exam.seo?.keywords?.join(","),
      seoDescription: exam.seo?.description,
      mappedSyllabus: (exam.mappedResources?.syllabus || []).map((s: any) => typeof s === "object" ? s._id : s),
      mappedPyqs: (exam.mappedResources?.pyqs || []).map((p: any) => typeof p === "object" ? p._id : p),
      mappedNotifications: (exam.mappedResources?.notifications || []).map((n: any) => typeof n === "object" ? n._id : n),
      mappedCurrentAffairs: (exam.mappedResources?.currentAffairs || []).map((ca: any) => typeof ca === "object" ? ca._id : ca),
    });
    setQuestions(exam.questions || []);
    setCurrentStep(2);
  };

  //  Delete exam 
  const deleteExam = async (examId: string, examTitle: string) => {
    try {
      await axios.delete(`${url}/exam/delete/${examId}`, { headers: getAuthHeaders() });
      message.success(`"${examTitle}" deleted successfully`);
      if (selectedTeacher) loadTeacherExams(selectedTeacher._id);
    } catch (err: any) {
      message.error(err.response?.data?.message ||"Failed to delete exam");
    }
  };

  //  Bulk upload helpers 
  const downloadTemplate = () => {
    const template = [
      { questionText:"What is React?", type:"mcq", option1:"A library", option2:"A framework", option3:"A language", option4:"A database", option5:"", correctAnswer:"A library", marks: 2, explanation:"React is a JS library" },
      { questionText:"Explain the virtual DOM", type:"short", option1:"", option2:"", option3:"", option4:"", option5:"", correctAnswer:"", marks: 5, explanation:"Lightweight copy of the DOM" },
      { questionText:"Describe React lifecycle", type:"paragraph", option1:"", option2:"", option3:"", option4:"", option5:"", correctAnswer:"", marks: 10, explanation:"Special methods in class components" },
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    ws['!cols'] = [{ wch: 50 }, { wch: 12 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 8 }, { wch: 50 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws,"Questions");
    XLSX.writeFile(wb,"exam_questions_template.xlsx");
    message.success("Template downloaded!");
  };

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target?.result, { type:"array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows: any[] = XLSX.utils.sheet_to_json(ws);
        if (!rows.length) { message.warning("File is empty."); return; }
        // Transform uploaded data to question format with standardized validation
        const parsed: any[] = [];
        const errors: string[] = [];

        rows.forEach((row: any, index: number) => {
          const { question, errors: rowErrors } = validateQuestionRow(row, index, { 
            mode:'exam',
            maxOptions: 10 
          });

          if (rowErrors.length > 0) {
            errors.push(...rowErrors);
          }
          
          if (question) {
            parsed.push(question);
          }
        });

        // Show errors if any
        if (errors.length > 0) {
          Modal.error({
            title:' Validation Errors Found',
            content: (
              <div style={{ maxHeight: 400, overflowY:'auto' }}>
                <ul style={{ paddingLeft: 20 }}>
                  {errors.map((err, idx) => (
                    <li key={idx} style={{ color:'#ff4d4f', marginBottom: 8 }}>{err}</li>
                  ))}
                </ul>
              </div>
            ),
            width: 600
          });

          if (parsed.length === 0) {
            e.target.value ="";
            return;
          }
        }

        setQuestions(prev => [...prev, ...parsed]);
        message.success(`${parsed.length} questions uploaded!`);
        e.target.value ="";
      } catch { message.error("Error parsing file."); }
    };
    reader.readAsArrayBuffer(file);
  };

  //  Question helpers 
  const addQuestion = () => setQuestions(prev => [...prev, { type:"mcq", questionText:"", options: [""], correctAnswer:"", explanation:"", marks: 1 }]);
  const removeQuestion = (i: number) => setQuestions(prev => prev.filter((_, idx) => idx !== i));
  const clearAllQuestions = () => { setQuestions([]); message.success("All questions cleared."); };
  const updateQuestion = (i: number, field: string, value: any) => setQuestions(prev => { const u = [...prev]; u[i][field] = value; return u; });
  const updateOption = (qi: number, oi: number, val: string) => setQuestions(prev => { const u = [...prev]; u[qi].options[oi] = val; return u; });
  const addOption = (qi: number) => setQuestions(prev => { const u = [...prev]; if (u[qi].options.length < 5) u[qi].options.push(""); else message.warning("Max 5 options."); return u; });
  const removeOption = (qi: number, oi: number) => setQuestions(prev => { const u = [...prev]; if (u[qi].options.length > 1) u[qi].options.splice(oi, 1); else message.warning("Need at least 1 option."); return u; });

  //  Submit (create or update) 
  const handleSubmit = async (values: any) => {
    if (!selectedTeacher) { message.error("No teacher selected."); return; }
    if (!questions.length) { message.error("Add at least one question."); return; }
    const invalid = questions.findIndex((q, i) => {
      const qText = (q.questionText ||"").toString().trim();
      if (!qText) { 
        message.error(`Q${i + 1}: Question text required.`); 
        return true; 
      }
      if (q.type ==="mcq" && q.options.filter((o: string) => o.trim()).length < 2) { message.error(`Q${i + 1}: MCQ needs 2+ options.`); return true; }
      if (q.type ==="mcq" && !q.correctAnswer?.trim()) { message.error(`Q${i + 1}: Correct answer required.`); return true; }
      return false;
    });
    if (invalid !== -1) return;

    const scheduledAt = values.scheduledDate && values.scheduledTime
      ? moment(values.scheduledDate.toDate()).set({ hour: values.scheduledTime.hour(), minute: values.scheduledTime.minute() }).toISOString()
      : null;

    const payload = {
      title: values.title,
      subject: values.subject,
      instructions: values.instructions,
      totalMarks: questions.reduce((s, q) => s + Number(q.marks || 0), 0),
      durationMinutes: values.duration,
      scheduledAt,
      courseId: values.courseId,
      createdBy: selectedTeacher._id,
      createdByAdmin: loginUser?._id || loginUser?.id,
      questions,
      seo: {
        title: values.seoTitle,
        keywords: values.seoKeywords ? values.seoKeywords.split(",").map((k: string) => k.trim()) : [],
        description: values.seoDescription,
      },
      mappedResources: {
        syllabus: values.mappedSyllabus || [],
        pyqs: values.mappedPyqs || [],
        notifications: values.mappedNotifications || [],
        currentAffairs: values.mappedCurrentAffairs || [],
      },
    };

    setSubmitLoading(true);
    try {
      if (editingExam) {
        await axios.put(`${url}/exam/update/${editingExam._id}`, payload, { headers: getAuthHeaders() });
        message.success(` Exam updated successfully!`);
      } else {
        await axios.post(`${url}/exam/create`, payload, { headers: getAuthHeaders() });
        message.success(` Exam created on behalf of ${selectedTeacher.tname}!`);
      }
      form.resetFields();
      setQuestions([]);
      setEditingExam(null);
      setCurrentStep(1);
      loadTeacherExams(selectedTeacher._id);
    } catch (err: any) {
      message.error(err.response?.data?.message ||"Failed to save exam.");
    } finally { setSubmitLoading(false); }
  };

  //  Derived 
  const approvedCount = teachers.filter(t => t.Status ==="approved").length;
  const pendingCount = teachers.filter(t => t.Status ==="pending").length;
  const totalMarks = questions.reduce((s, q) => s + Number(q.marks || 0), 0);

  //  Exam list columns 
  const examColumns = [
    {
      title:"Title",
      dataIndex:"title",
      render: (title: string) => <Text strong style={{ fontSize: 14 }}>{title}</Text>,
    },
    {
      title:"Subject",
      dataIndex:"subject",
      render: (s: string) => s ? <Tag color="geekblue">{s}</Tag> : <Text type="secondary"></Text>,
    },
    {
      title:"Duration",
      dataIndex:"durationMinutes",
      render: (d: number) => d ? <Text>{d} min</Text> : <Text type="secondary"></Text>,
      width: 90,
    },
    {
      title:"Total Marks",
      dataIndex:"totalMarks",
      render: (m: number) => m ? <Tag color="gold">{m} marks</Tag> : <Text type="secondary"></Text>,
      width: 110,
    },
    {
      title:"Questions",
      dataIndex:"questions",
      render: (qs: any[]) => <Badge count={qs?.length || 0} style={{ backgroundColor:"#6366f1" }} showZero />,
      width: 100,
    },
    {
      title:"Scheduled",
      dataIndex:"scheduledAt",
      render: (d: string) => d
        ? <Text style={{ fontSize: 12 }}>{moment(d).format("DD MMM YYYY HH:mm")}</Text>
        : <Tag color="default">Not scheduled</Tag>,
    },
    {
      title:"Created",
      dataIndex:"createdAt",
      render: (d: string) => <Text type="secondary" style={{ fontSize: 12 }}>{d ? moment(d).format("DD MMM YYYY") :""}</Text>,
      width: 110,
    },
    {
      title:"Actions",
      key:"actions",
      fixed:"right" as const,
      width: 130,
      render: (_: any, record: Exam) => (
        <Space size={4}>
          <Tooltip title="View details">
            <Button type="text" icon={<EyeOutlined />} size="small"
              style={{ color:"#6366f1" }}
              onClick={() => { setViewExam(record); setViewModalOpen(true); }} />
          </Tooltip>
          <Tooltip title="Edit exam">
            <Button type="text" icon={<EditOutlined />} size="small"
              style={{ color:"#10b981" }}
              onClick={() => openEditForm(record)} />
          </Tooltip>
          <Tooltip title="Delete exam">
            <Popconfirm
              title={`Delete"${record.title}"?`}
              description="This cannot be undone."
              onConfirm={() => deleteExam(record._id, record.title)}
              okText="Delete" okButtonProps={{ danger: true }}
            >
              <Button type="text" danger icon={<DeleteOutlined />} size="small" />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  //  Teacher table columns 
  const teacherColumns = [
    {
      title:"Teacher",
      key:"teacher",
      render: (_: any, record: Teacher) => (
        <Space>
          <Avatar src={record.tprofile} icon={<UserOutlined />} size={40}
            style={{ background: record.Status ==="approved" ?"#10b981" :"#9ca3af" }} />
          <div>
            <Text strong style={{ fontSize: 14, display:"block" }}>{record.tname}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <MailOutlined style={{ marginRight: 4 }} />{record.temail}
            </Text>
          </div>
        </Space>
      ),
    },
    { title:"Specialization", dataIndex:"tspecialization", render: (s: string) => <Tag color="geekblue">{s ||""}</Tag> },
    {
      title:"Exams Created",
      key:"examCount",
      width: 120,
      render: (_: any, record: Teacher) => {
        const count = teacherExamCounts[record._id] || 0;
        return (
          <Badge
            count={count}
            showZero
            style={{ backgroundColor: count > 0 ?"#6366f1" :"#d9d9d9" }}
            title={`${count} exam${count !== 1 ?"s" :""} created`}
          />
        );
      },
    },
    { title:"Exp", dataIndex:"texp", render: (e: number) => <Text style={{ fontSize: 13 }}>{e} yrs</Text>, width: 70 },
    {
      title:"Status", dataIndex:"Status", width: 110,
      render: (s: string) => (
        <Tag color={s ==="approved" ?"success" : s ==="pending" ?"warning" :"error"}
          icon={s ==="approved" ? <CheckCircleOutlined /> : <ClockCircleOutlined />}>
          {s?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title:"Actions", key:"actions",
      render: (_: any, record: Teacher) => (
        <Space size={6}>
          <Tooltip title="Preview teacher">
            <Button type="text" icon={<EyeOutlined />} size="small"
              onClick={() => { setPreviewTeacher(record); setTeacherDrawerOpen(true); }} />
          </Tooltip>
          <Tooltip title="Manage exams for this teacher">
            <Button type="primary" size="small" icon={<EditOutlined />}
              onClick={() => selectTeacher(record)}
              style={{ background: record.Status ==="approved" ?"#6366f1" :"#f59e0b", border:"none", borderRadius: 6 }}>
              Manage
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  //  Auth guard 
  if (!isAuthChecked) {
    return (
      <Layout style={{ minHeight:"100vh" }}>
        <Content style={{ display:"flex", justifyContent:"center", alignItems:"center" }}>
          <Card><Text>Checking permissions</Text></Card>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight:"100vh", background:"#f8fafc" }}>
      <Sidebar />
      <Layout style={{ background:"#f8fafc" }}>
        <Topbar />

        <Content style={{ margin:"24px 20px", paddingBottom: 40 }}>

          {/*  Page Header  */}
          <Row align="middle" justify="space-between" style={{ marginBottom: 24 }}>
            <Col>
              <Title level={3} style={{ margin: 0, fontWeight: 800, color:"#1a1a2e" }}>
                 Exam Management  Admin Panel
              </Title>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Select a teacher to view, create, edit or delete their exams
              </Text>
            </Col>
            <Col>
              <Space>
                {currentStep >= 1 && (
                  <Button icon={<ArrowLeftOutlined />}
                    onClick={() => {
                      if (currentStep === 2) { setCurrentStep(1); setEditingExam(null); form.resetFields(); setQuestions([]); }
                      else { setCurrentStep(0); setSelectedTeacher(null); setTeacherExams([]); }
                    }}>
                    {currentStep === 2 ?"Back to Exams" :"Change Teacher"}
                  </Button>
                )}
                {currentStep === 1 && (
                  <Button type="primary" icon={<PlusOutlined />} onClick={openCreateForm}
                    style={{ background:"#6366f1", border:"none" }}>
                    New Exam for {selectedTeacher?.tname?.split("")[0]}
                  </Button>
                )}
              </Space>
            </Col>
          </Row>

          {/*  Step Indicator  */}
          <Card style={{ marginBottom: 24, borderRadius: 14, border:"none", boxShadow:"0 1px 10px rgba(0,0,0,0.07)" }}
            bodyStyle={{ padding:"20px 32px" }}>
            <Steps current={currentStep} size="small">
              <Step title="Select Teacher" description="Choose who to manage" icon={<TeamOutlined />} />
              <Step title="Manage Exams" description="View, edit, delete, create" icon={<EyeOutlined />} />
              <Step title={editingExam ?"Edit Exam" :"Create Exam"} description="Build the exam form" icon={<EditOutlined />} />
            </Steps>
          </Card>

          {/* 
              STEP 0  TEACHER SELECTION
           */}
          {currentStep === 0 && (
            <>
              <Row gutter={12} style={{ marginBottom: 20 }}>
                <Col><MiniStat label="Total Teachers" value={teachers.length} color="#6366f1" /></Col>
                <Col><MiniStat label="Approved" value={approvedCount} color="#10b981" /></Col>
                <Col><MiniStat label="Pending" value={pendingCount} color="#f59e0b" /></Col>
                <Col><MiniStat label="Total Exams" value={allExams.length} color="#f59e0b" /></Col>
                <Col><MiniStat label="Teachers w/ Exams" value={Object.keys(teacherExamCounts).length} color="#722ed1" /></Col>
              </Row>

              <Tabs
                defaultActiveKey="teachers"
                type="card"
                className="custom-tabs"
                items={[
                  {
                    key:"teachers",
                    label: (
                      <Space>
                        <TeamOutlined />
                        <span>Teachers ({teachers.length})</span>
                      </Space>
                    ),
                    children: (
                      <Card style={{ borderRadius: 16, border:"none", boxShadow:"0 2px 16px rgba(0,0,0,0.07)" }}
                        title={<Space><TeamOutlined style={{ color:"#6366f1" }} /><Text strong style={{ fontSize: 15 }}>All Teachers  Select one to manage their exams</Text></Space>}
                        extra={<Button icon={<ReloadOutlined />} size="small" onClick={() => { fetchTeachers(); fetchAllExams(); }} loading={teachersLoading || allExamsLoading}>Refresh</Button>}
                      >
                        <Row gutter={12} style={{ marginBottom: 16 }}>
                          <Col xs={24} sm={14} md={10}>
                            <Search placeholder="Search by name, email, specialization..."
                              value={searchText} onChange={e => setSearchText(e.target.value)} allowClear />
                          </Col>
                          <Col xs={12} sm={6} md={4}>
                            <Select value={statusFilter} onChange={setStatusFilter} style={{ width:"100%" }}>
                              <Option value="all">All Status</Option>
                              <Option value="approved">Approved</Option>
                              <Option value="pending">Pending</Option>
                              <Option value="rejected">Rejected</Option>
                              <Option value="suspended">Suspended</Option>
                            </Select>
                          </Col>
                          <Col><Text type="secondary" style={{ lineHeight:"32px", fontSize: 13 }}>{filteredTeachers.length} of {teachers.length} shown</Text></Col>
                        </Row>

                        <Table columns={teacherColumns} dataSource={filteredTeachers} loading={teachersLoading}
                          rowKey="_id" size="middle" scroll={{ x: 800 }}
                          pagination={{ pageSize: 8, showSizeChanger: false, showTotal: (t, r) => `${r[0]}${r[1]} of ${t}` }}
                          onRow={(record) => ({
                            style: { cursor:"pointer" },
                            onMouseEnter: e => (e.currentTarget.style.background ="#f0f4ff"),
                            onMouseLeave: e => (e.currentTarget.style.background =""),
                          })}
                        />
                      </Card>
                    )
                  },
                  {
                    key:"allExams",
                    label: (
                      <Space>
                        <FileTextOutlined />
                        <span>All Exams ({allExams.length})</span>
                      </Space>
                    ),
                    children: (
                      <Card style={{ borderRadius: 16, border:"none", boxShadow:"0 2px 16px rgba(0,0,0,0.07)" }}
                        title={<Space><FileTextOutlined style={{ color:"#6366f1" }} /><Text strong style={{ fontSize: 15 }}>Global Exam List  All exams across all teachers</Text></Space>}
                        extra={<Button icon={<ReloadOutlined />} size="small" onClick={fetchAllExams} loading={allExamsLoading}>Refresh</Button>}
                      >
                        <Table 
                          columns={[
                            ...examColumns.slice(0, 1),
                            {
                              title:"Teacher",
                              key:"teacher",
                              width: 150,
                              render: (_: any, r: Exam) => {
                                const teacher: any = r.createdBy;
                                return (
                                  <Space>
                                    <Avatar src={teacher?.tprofile} size="small" icon={<UserOutlined />} />
                                    <Text style={{ fontSize: 12 }}>{teacher?.tname ||"System"}</Text>
                                  </Space>
                                );
                              }
                            },
                            ...examColumns.slice(1)
                          ]} 
                          dataSource={allExams} 
                          loading={allExamsLoading}
                          rowKey="_id" 
                          scroll={{ x: 1200 }} 
                          size="middle"
                          pagination={{ pageSize: 10, showTotal: (t, r) => `${r[0]}${r[1]} of ${t} exams` }}
                        />
                      </Card>
                    )
                  }
                ]}
              />
            </>
          )}

          {/* 
              STEP 1  EXAM LIST FOR TEACHER
           */}
          {currentStep === 1 && selectedTeacher && (
            <>
              {/* Teacher banner */}
              <Card style={{ marginBottom: 20, borderRadius: 14, border:"2px solid #6366f1", background:"linear-gradient(135deg,#eef2ff 0%,#f0fdf4 100%)", boxShadow:"none" }}
                bodyStyle={{ padding:"16px 24px" }}>
                <Row align="middle" justify="space-between">
                  <Col>
                    <Space size={14}>
                      <Avatar src={selectedTeacher.tprofile} icon={<UserOutlined />} size={48} style={{ background:"#6366f1" }} />
                      <div>
                        <Text strong style={{ fontSize: 15, color:"#1a1a2e" }}>
                          Managing exams for: <span style={{ color:"#6366f1" }}>{selectedTeacher.tname}</span>
                        </Text>
                        <div style={{ marginTop: 2 }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {selectedTeacher.temail} · {selectedTeacher.tspecialization} · {selectedTeacher.texp} yrs exp
                          </Text>
                        </div>
                      </div>
                    </Space>
                  </Col>
                  <Col>
                    <Space>
                      <Tag color={selectedTeacher.Status ==="approved" ?"success" :"warning"}
                        icon={selectedTeacher.Status ==="approved" ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                        style={{ fontSize: 12, padding:"2px 10px" }}>
                        {selectedTeacher.Status?.toUpperCase()}
                      </Tag>
                      <Button icon={<ReloadOutlined />} size="small" onClick={() => loadTeacherExams(selectedTeacher._id)} loading={examsLoading}>
                        Refresh
                      </Button>
                    </Space>
                  </Col>
                </Row>
              </Card>

              <Card style={{ borderRadius: 16, border:"none", boxShadow:"0 2px 16px rgba(0,0,0,0.07)" }}
                title={
                  <Space>
                    <Text strong style={{ fontSize: 15 }}>
                      Exams <Badge count={teacherExams.length} style={{ backgroundColor:"#6366f1" }} showZero />
                    </Text>
                  </Space>
                }
                extra={
                  <Button type="primary" icon={<PlusOutlined />} onClick={openCreateForm}
                    style={{ background:"#6366f1", border:"none" }}>
                    Create New Exam
                  </Button>
                }
              >
                {teacherExams.length === 0 && !examsLoading ? (
                  <Empty description={
                    <span>No exams yet for <b>{selectedTeacher.tname}</b>.{""}
                      <Button type="link" onClick={openCreateForm} style={{ padding: 0 }}>Create the first one </Button>
                    </span>
                  } style={{ padding:"40px 0" }} />
                ) : (
                  <Table columns={examColumns} dataSource={teacherExams} loading={examsLoading}
                    rowKey="_id" scroll={{ x: 1000 }} size="middle"
                    pagination={{ pageSize: 8, showTotal: (t, r) => `${r[0]}${r[1]} of ${t} exams` }}
                  />
                )}
              </Card>
            </>
          )}

          {/* 
              STEP 2  CREATE / EDIT EXAM FORM
           */}
          {currentStep === 2 && selectedTeacher && (
            <>
              {/* Teacher banner */}
              <Card style={{ marginBottom: 20, borderRadius: 14, border:"2px solid #6366f1", background:"linear-gradient(135deg,#eef2ff 0%,#f0fdf4 100%)", boxShadow:"none" }}
                bodyStyle={{ padding:"14px 24px" }}>
                <Row align="middle" justify="space-between">
                  <Col>
                    <Space size={12}>
                      <Avatar src={selectedTeacher.tprofile} icon={<UserOutlined />} size={40} style={{ background:"#6366f1" }} />
                      <Text strong style={{ fontSize: 14, color:"#1a1a2e" }}>
                        {editingExam ?"Editing exam on behalf of" :"Creating exam on behalf of"}:{""}
                        <span style={{ color:"#6366f1" }}>{selectedTeacher.tname}</span>
                      </Text>
                    </Space>
                  </Col>
                  {editingExam && (
                    <Col><Tag color="orange"><EditOutlined /> Editing: {editingExam.title}</Tag></Col>
                  )}
                </Row>
              </Card>

              {selectedTeacher.Status !=="approved" && (
                <Alert message={` ${selectedTeacher.tname}'s account is"${selectedTeacher.Status}". Exam will be saved but the teacher account may have limited access.`}
                  type="warning" showIcon style={{ marginBottom: 16, borderRadius: 10 }} />
              )}

              <Card style={{ borderRadius: 16, border:"none", boxShadow:"0 2px 16px rgba(0,0,0,0.07)" }}
                bodyStyle={{ padding:"28px 32px" }}>
                <Form layout="vertical" form={form} onFinish={handleSubmit}>

                  {/* Basic Info */}
                  <Title level={5} style={{ color:"#6366f1", marginBottom: 16 }}> Basic Information</Title>
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item name="title" label="Exam Title" rules={[{ required: true, message:"Title required" }]}>
                        <Input size="large" placeholder="e.g. React Fundamentals Quiz" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="subject" label="Subject" rules={[{ required: true, message:"Subject required" }]}>
                        <Input size="large" placeholder="e.g. Web Development" />
                      </Form.Item>
                    </Col>
                    <Col xs={24}>
                      <Form.Item name="instructions" label="Instructions">
                        <TextArea rows={3} placeholder="Any instructions for students..." />
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* Scheduling */}
                  <Title level={5} style={{ color:"#6366f1", marginBottom: 16, marginTop: 8 }}> Scheduling & Course</Title>
                  <Row gutter={16}>
                    <Col xs={12} md={6}>
                      <Form.Item name="duration" label="Duration (min)" rules={[{ required: true }]}>
                        <InputNumber min={1} size="large" style={{ width:"100%" }} />
                      </Form.Item>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Item name="scheduledDate" label="Scheduled Date">
                        <DatePicker size="large" style={{ width:"100%" }} />
                      </Form.Item>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Item name="scheduledTime" label="Scheduled Time">
                        <TimePicker format="HH:mm" size="large" style={{ width:"100%" }} />
                      </Form.Item>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Item name="courseId" label="Course" rules={[{ required: true, message:"Select a course" }]}>
                        <Select placeholder={coursesLoading ?"Loading" :"Choose course"} size="large" loading={coursesLoading}>
                          {courses.length === 0 && !coursesLoading && (
                            <Option value="" disabled>No courses found for this teacher</Option>
                          )}
                          {courses.map(c => (
                            <Option key={c._id} value={c._id}>{c.title}{c.price ? `  ${c.price}` :""}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* SEO */}
                  <Divider style={{ margin:"12px 0 20px" }}>
                    <Text type="secondary" style={{ fontSize: 13 }}> SEO Details (optional)</Text>
                  </Divider>
                  <Row gutter={16}>
                    <Col xs={24} md={8}><Form.Item name="seoTitle" label="SEO Title"><Input placeholder="SEO title" /></Form.Item></Col>
                    <Col xs={24} md={8}><Form.Item name="seoKeywords" label="Keywords (comma separated)"><Input placeholder="react, quiz, frontend" /></Form.Item></Col>
                    <Col xs={24} md={8}><Form.Item name="seoDescription" label="SEO Description"><Input placeholder="Brief description for search engines" /></Form.Item></Col>
                  </Row>

                  {/* Resources Mapping */}
                  <Divider style={{ margin:"12px 0 20px" }}>
                    <Text type="secondary" style={{ fontSize: 13 }}> Resources Mapping (Optional)</Text>
                  </Divider>
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item name="mappedSyllabus" label="Map Syllabus">
                        <Select mode="multiple" placeholder="Select syllabus" loading={resourcesLoading} allowClear showSearch optionFilterProp="children">
                          {syllabusList.map(s => <Option key={s._id} value={s._id}>{s.examName} - {s.title}</Option>)}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="mappedPyqs" label="Map PYQs">
                        <Select mode="multiple" placeholder="Select PYQs" loading={resourcesLoading} allowClear showSearch optionFilterProp="children">
                          {pyqList.map(p => <Option key={p._id} value={p._id}>{p.examName} ({p.year})</Option>)}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="mappedNotifications" label="Map Notifications">
                        <Select mode="multiple" placeholder="Select notifications" loading={resourcesLoading} allowClear showSearch optionFilterProp="children">
                          {jobList.map(j => <Option key={j._id} value={j._id}>{j.title} ({j.organization_name})</Option>)}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="mappedCurrentAffairs" label="Map Current Affairs">
                        <Select mode="multiple" placeholder="Select current affairs" loading={resourcesLoading} allowClear showSearch optionFilterProp="children">
                          {caList.map(ca => <Option key={ca._id} value={ca._id}>{ca.title} ({ca.type})</Option>)}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* Bulk Upload */}
                  <Divider style={{ margin:"12px 0 20px" }}>
                    <Text type="secondary" style={{ fontSize: 13 }}> Bulk Question Upload</Text>
                  </Divider>
                  <Space size={12} style={{ marginBottom: 16 }} wrap>
                    <Button icon={<DownloadOutlined />} onClick={downloadTemplate}>Download Template</Button>
                    <Button icon={<UploadOutlined />} type="primary"
                      style={{ background:"#10b981", border:"none" }}
                      onClick={() => document.getElementById("bulk-upload-admin")?.click()}>
                      Upload Questions (Excel/CSV)
                    </Button>
                    <input id="bulk-upload-admin" type="file" accept=".csv,.xlsx,.xls"
                      onChange={handleBulkUpload} style={{ display:"none" }} />
                  </Space>
                  <Alert message="Bulk Upload: Download template  fill  upload. MCQ needs option15 + correctAnswer. Short/Paragraph: leave options blank."
                    type="info" showIcon style={{ marginBottom: 20, borderRadius: 8, fontSize: 12 }} />

                  {/* Questions */}
                  <Divider style={{ margin:"4px 0 16px" }}>
                    <Space>
                      <Text type="secondary" style={{ fontSize: 13 }}>Questions</Text>
                      <Badge count={questions.length} style={{ backgroundColor:"#6366f1" }} showZero />
                      {questions.length > 0 && <Tag color="green">Total Marks: {totalMarks}</Tag>}
                    </Space>
                  </Divider>

                  {questions.length > 0 && (
                    <div style={{ marginBottom: 12, textAlign:"right" }}>
                      <Button danger size="small" onClick={clearAllQuestions}>Clear All</Button>
                    </div>
                  )}

                  {questions.map((q, index) => (
                    <Card key={index} style={{ marginBottom: 16, borderRadius: 12, border:"1px solid #e5e7eb", boxShadow:"0 1px 6px rgba(99,102,241,0.06)" }}
                      bodyStyle={{ padding:"16px 20px" }}
                      title={
                        <Row align="middle" justify="space-between">
                          <Col>
                            <Space size={8}>
                              <div style={{ width: 28, height: 28, borderRadius:"50%", background:"#6366f1", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize: 13, fontWeight: 700 }}>{index + 1}</div>
                              <Text strong style={{ fontSize: 14 }}>Question {index + 1}</Text>
                              <Tag color={q.type ==="mcq" ?"blue" : q.type ==="short" ?"cyan" :"purple"}>{q.type?.toUpperCase()}</Tag>
                              <Tag color="gold">{q.marks} mark{q.marks > 1 ?"s" :""}</Tag>
                            </Space>
                          </Col>
                          <Col>
                            <Popconfirm title="Remove this question?" onConfirm={() => removeQuestion(index)} okText="Remove" okButtonProps={{ danger: true }}>
                              <Button danger size="small" icon={<DeleteOutlined />}>Remove</Button>
                            </Popconfirm>
                          </Col>
                        </Row>
                      }
                    >
                      <Space direction="vertical" style={{ width:"100%" }} size={10}>
                        <Row gutter={12}>
                          <Col xs={24} md={6}>
                            <Select value={q.type} style={{ width:"100%" }} onChange={val => updateQuestion(index,"type", val)}>
                              <Option value="mcq">MCQ</Option>
                              <Option value="short">Short Answer</Option>
                              <Option value="paragraph">Paragraph</Option>
                            </Select>
                          </Col>
                          <Col xs={24} md={6}>
                            <InputNumber min={1} value={q.marks} style={{ width:"100%" }}
                              onChange={val => updateQuestion(index,"marks", val)} addonBefore="Marks" />
                          </Col>
                        </Row>

                        <TextArea rows={2} placeholder="Question text" value={q.questionText}
                          onChange={e => updateQuestion(index,"questionText", e.target.value)} />

                        {q.type ==="mcq" && (
                          <>
                            {q.options.map((opt: string, i: number) => (
                              <Row gutter={8} key={i}>
                                <Col flex="auto">
                                  <Input value={opt} placeholder={`Option ${i + 1}`}
                                    prefix={<span style={{ color:"#9ca3af", fontSize: 12 }}>{String.fromCharCode(65 + i)}.</span>}
                                    onChange={e => updateOption(index, i, e.target.value)} />
                                </Col>
                                <Col>
                                  <Button danger icon={<DeleteOutlined />} size="small" onClick={() => removeOption(index, i)} />
                                </Col>
                              </Row>
                            ))}
                            <Button icon={<PlusOutlined />} size="small" onClick={() => addOption(index)} style={{ marginBottom: 4 }}>Add Option</Button>
                            <Input placeholder=" Correct answer (must match one option exactly)"
                              value={q.correctAnswer}
                              onChange={e => updateQuestion(index,"correctAnswer", e.target.value)}
                              style={{ borderColor: q.correctAnswer ?"#10b981" : undefined }} />
                          </>
                        )}

                        <TextArea rows={1} placeholder="Explanation / Solution (optional)"
                          value={q.explanation} onChange={e => updateQuestion(index,"explanation", e.target.value)} />
                      </Space>
                    </Card>
                  ))}

                  <Button type="dashed" block onClick={addQuestion} icon={<PlusOutlined />}
                    size="large" style={{ marginBottom: 24, borderColor:"#6366f1", color:"#6366f1" }}>
                    Add Question Manually
                  </Button>

                  <Divider />
                  <Row gutter={12} justify="end">
                    <Col>
                      <Button size="large" icon={<ArrowLeftOutlined />}
                        onClick={() => { setCurrentStep(1); setEditingExam(null); form.resetFields(); setQuestions([]); }}>
                        Back to Exam List
                      </Button>
                    </Col>
                    <Col>
                      <Button type="primary" htmlType="submit" size="large" loading={submitLoading}
                        icon={editingExam ? <EditOutlined /> : <SendOutlined />}
                        style={{ background:"#6366f1", border:"none", minWidth: 220, fontWeight: 700 }}
                        disabled={questions.length === 0}>
                        {editingExam ? `Update Exam` : `Publish Exam for ${selectedTeacher.tname?.split("")[0]}`}
                        {totalMarks > 0 && ` (${totalMarks} marks)`}
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Card>
            </>
          )}
        </Content>

        <Footer style={{ textAlign:"center", background:"#f8fafc", color:"#9ca3af", fontSize: 13 }}>
          © 2026 Draa  Admin Panel
        </Footer>
      </Layout>

      {/*  Teacher Preview Drawer  */}
      <Drawer title="Teacher Details" placement="right" width={520}
        open={teacherDrawerOpen} onClose={() => setTeacherDrawerOpen(false)}>
        {previewTeacher && (
          <>
            <div style={{ textAlign:"center", marginBottom: 24 }}>
              <Avatar src={previewTeacher.tprofile} icon={<UserOutlined />} size={72} style={{ background:"#6366f1" }} />
              <Title level={4} style={{ margin:"10px 0 4px" }}>{previewTeacher.tname}</Title>
              <Tag color={previewTeacher.Status ==="approved" ?"success" :"warning"} style={{ marginBottom: 12 }}>
                {previewTeacher.Status?.toUpperCase()}
              </Tag>
              {previewTeacher.promocode && <div><Tag color="blue">PROMO: {previewTeacher.promocode}</Tag></div>}
            </div>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Email">{previewTeacher.temail}</Descriptions.Item>
              <Descriptions.Item label="Phone">{previewTeacher.tphn}</Descriptions.Item>
              <Descriptions.Item label="Specialization">{previewTeacher.tspecialization}</Descriptions.Item>
              <Descriptions.Item label="Experience">{previewTeacher.texp} years</Descriptions.Item>
              <Descriptions.Item label="Qualification">{previewTeacher.tqualification ||"N/A"}</Descriptions.Item>
              <Descriptions.Item label="Rating">{previewTeacher.trating ? ` ${previewTeacher.trating}/5.0` :"No ratings"}</Descriptions.Item>
              <Descriptions.Item label="Joined">{previewTeacher.createdAt ? moment(previewTeacher.createdAt).format("DD MMM YYYY") :"N/A"}</Descriptions.Item>
              {previewTeacher.tbio && <Descriptions.Item label="Bio">{previewTeacher.tbio}</Descriptions.Item>}
            </Descriptions>
            <div style={{ marginTop: 24, display:"flex", gap: 12 }}>
              <Button type="primary" block icon={<EditOutlined />}
                style={{ background:"#6366f1", border:"none" }}
                onClick={() => { selectTeacher(previewTeacher); setTeacherDrawerOpen(false); }}>
                Manage Exams for {previewTeacher.tname.split("")[0]}
              </Button>
              <Button block icon={<EyeOutlined />}
                onClick={() => window.open(`/teacherProfile/${previewTeacher._id}`,"_blank")}>
                View Profile
              </Button>
            </div>
          </>
        )}
      </Drawer>

      {/*  View Exam Modal  */}
      <Modal
        title={
          <Space>
            <EyeOutlined style={{ color:"#6366f1" }} />
            <Text strong>{viewExam?.title}</Text>
          </Space>
        }
        open={viewModalOpen}
        onCancel={() => { setViewModalOpen(false); setViewExam(null); }}
        footer={[
          <Button key="edit" type="primary" icon={<EditOutlined />}
            style={{ background:"#6366f1", border:"none" }}
            onClick={() => { setViewModalOpen(false); if (viewExam) openEditForm(viewExam); }}>
            Edit This Exam
          </Button>,
          <Button key="close" onClick={() => { setViewModalOpen(false); setViewExam(null); }}>Close</Button>,
        ]}
        width={720}
      >
        {viewExam && (
          <>
            <Descriptions column={2} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Subject">{viewExam.subject ||""}</Descriptions.Item>
              <Descriptions.Item label="Duration">{viewExam.durationMinutes} min</Descriptions.Item>
              <Descriptions.Item label="Total Marks">{viewExam.totalMarks}</Descriptions.Item>
              <Descriptions.Item label="Questions">{viewExam.questions?.length || 0}</Descriptions.Item>
              <Descriptions.Item label="Scheduled" span={2}>
                {viewExam.scheduledAt ? moment(viewExam.scheduledAt).format("DD MMM YYYY HH:mm") :"Not scheduled"}
              </Descriptions.Item>
              {viewExam.instructions && (
                <Descriptions.Item label="Instructions" span={2}>{viewExam.instructions}</Descriptions.Item>
              )}
            </Descriptions>

            {/* Mapped Resources in View Modal */}
            {(viewExam.mappedResources?.syllabus?.length || 0) + 
             (viewExam.mappedResources?.pyqs?.length || 0) + 
             (viewExam.mappedResources?.notifications?.length || 0) + 
             (viewExam.mappedResources?.currentAffairs?.length || 0) > 0 && (
              <div style={{ marginBottom: 16 }}>
                <Divider orientation="left" plain><Text type="secondary" style={{ fontSize: 13 }}> Mapped Resources</Text></Divider>
                <Space wrap>
                  {viewExam.mappedResources?.syllabus?.length ? <Tag color="blue">{viewExam.mappedResources.syllabus.length} Syllabus</Tag> : null}
                  {viewExam.mappedResources?.pyqs?.length ? <Tag color="cyan">{viewExam.mappedResources.pyqs.length} PYQs</Tag> : null}
                  {viewExam.mappedResources?.notifications?.length ? <Tag color="orange">{viewExam.mappedResources.notifications.length} Notifications</Tag> : null}
                  {viewExam.mappedResources?.currentAffairs?.length ? <Tag color="purple">{viewExam.mappedResources.currentAffairs.length} Current Affairs</Tag> : null}
                </Space>
              </div>
            )}

            {viewExam.questions && viewExam.questions.length > 0 && (
              <>
                <Divider><Text type="secondary" style={{ fontSize: 13 }}>Questions ({viewExam.questions.length})</Text></Divider>
                {viewExam.questions.slice(0, 5).map((q: any, i: number) => (
                  <Card key={i} size="small" style={{ marginBottom: 10, borderRadius: 8 }}
                    title={
                      <Space>
                        <div style={{ width: 22, height: 22, borderRadius:"50%", background:"#6366f1", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize: 11, fontWeight: 700 }}>{i + 1}</div>
                        <Tag color={q.type ==="mcq" ?"blue" : q.type ==="short" ?"cyan" :"purple"} style={{ fontSize: 10 }}>{q.type?.toUpperCase()}</Tag>
                        <Tag color="gold" style={{ fontSize: 10 }}>{q.marks} mark{q.marks > 1 ?"s" :""}</Tag>
                      </Space>
                    }
                  >
                    <Text>{q.questionText}</Text>
                    {q.type ==="mcq" && q.options?.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        {q.options.map((opt: string, j: number) => (
                          <div key={j} style={{
                            padding:"3px 8px", marginBottom: 4, borderRadius: 6, fontSize: 13,
                            background: opt === q.correctAnswer ?"#f0fdf4" :"#f9fafb",
                            border: `1px solid ${opt === q.correctAnswer ?"#86efac" :"#e5e7eb"}`,
                            color: opt === q.correctAnswer ?"#15803d" :"#374151",
                          }}>
                            {String.fromCharCode(65 + j)}. {opt}
                            {opt === q.correctAnswer &&""}
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
                {viewExam.questions.length > 5 && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    + {viewExam.questions.length - 5} more questions. Click Edit to see all.
                  </Text>
                )}
              </>
            )}
          </>
        )}
      </Modal>

      <style>{`
        .ant-table-row:hover td { background: #f0f4ff !important; }
      `}</style>
    </Layout>
  );
};

export default AdminExamCreation;