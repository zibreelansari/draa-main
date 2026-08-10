import React, { useEffect, useState, useCallback, useMemo } from"react";
import {
  Layout,
  Table,
  Button,
  message,
  Space,
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  Typography,
  Tooltip,
  Alert,
  Drawer,
  Descriptions,
  Popconfirm,
  Input,
  Select,
  Modal,
  Form,
  InputNumber,
  Upload,
  Switch,
  Tabs,
  Avatar,
  Badge,
  Divider,
  Progress,
  Empty,
  Dropdown,
} from"antd";
import {
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  FilterOutlined,
  ExportOutlined,
  BookOutlined,
  UserOutlined,
  DollarOutlined,
  CalendarOutlined,
  UploadOutlined,
  VideoCameraOutlined,
  TagOutlined,
  FileTextOutlined,
  GlobalOutlined,
  CopyOutlined,
  TrophyOutlined,
  StarOutlined,
  MinusCircleOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  CloseOutlined,
  SaveOutlined,
  EyeInvisibleOutlined,
  StopOutlined,
  PlayCircleOutlined,
  FolderOpenOutlined,
  FolderOutlined,
  DownOutlined,
  InfoCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import toast from "../../utils/toast";
import { useNavigate } from"react-router-dom";
import axios from"axios";
import moment from"moment";
import Topbar from"./Topbar";
import Sidebar from"./Sidebar";
import url, { getImageUrl } from"../../url";
import { getUserRole, getStoredUser, getAuthHeaders, redirectToLogin } from "../../utils/global_auth";
import usePageTitle from '../../hooks/usePageTitle';
const BASE_URL ="https://api.draa.in";
// const BASE_URL ="http://localhost:5000";
const { Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

//  Interfaces 

interface Course {
  _id: string;
  title: string;
  short_desc: string;
  long_desc?: string;
  description?: string;
  duration: number;
  price: number;
  actual_price?: number;
  discounted_price?: number;
  discount_percentage?: number;
  language: string;
  skill_level: string;
  isApproved?: boolean;
  status?: "draft" | "published" | "archived" | "suspended" | "pending";
  instructor?: string;
  category?: string;
  course_category?: string;
  enrolled_count?: number;
  rating?: number;
  ratingCount?: number;
  views?: number;
  chapterCount?: number;
  averageRating?: number;
  totalDuration?: number;
  thumbnail?: string;
  coverphoto?: string;
  syllabus?: any;
  createdAt?: string;
  updatedAt?: string;
  tags?: string[];
  youtube_links?: string[];
  seo_title?: string;
  slug?: string;
  meta_description?: string;
  meta_keywords?: string;
  who_this_course_is_for?: { text: string }[];
  what_you_will_learn?: { text: string }[];
  course_features?: { text: string }[];
  course_faqs?: { question: string; answer: string }[];
  chapters?: any[];
  teacher_id?: {
    _id: string;
    tname: string;
    temail: string;
    tspecialization: string;
    tprofile: string;
  };
  course_category_ref?: {
    _id: string;
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    isActive: boolean;
    order: number;
    slug: string;
  };
  approvedBy?: any;
  rejectedBy?: any;
  rejectionReason?: string;
  approvedAt?: string;
  rejectedAt?: string;
}

interface Teacher {
  _id: string;
  tname: string;
  temail?: string;
  tspecialization?: string;
  tprofile?: string;
}

interface CourseCategory {
  _id: string;
  name: string;
  icon?: string;
  color?: string;
  isActive: boolean;
}

interface Stats {
  total: number;
  approved: number;
  pending: number;
  published: number;
  draft: number;
  archived: number;
  suspended?: number;
  totalRevenue: number;
  totalEnrollments: number;
}

interface LoginUser {
  aname?: string;
  aemail?: string;
  role?: string;
  id?: string;
}

//  Status Config 

const STATUS_CONFIG: Record<
  string,
  { color: string; icon: React.ReactNode; label: string; bg: string }
> = {
  published: {
    color:"#00b96b",
    icon: <PlayCircleOutlined />,
    label:"Published",
    bg:"#f6ffed",
  },
  draft: {
    color:"#fa8c16",
    icon: <EditOutlined />,
    label:"Draft",
    bg:"#fff7e6",
  },
  archived: {
    color:"#8c8c8c",
    icon: <FolderOpenOutlined />,
    label:"Archived",
    bg:"#fafafa",
  },
  suspended: {
    color: "#f5222d",
    icon: <StopOutlined />,
    label: "Suspended",
    bg: "#fff1f0",
  },
  pending: {
    color: "#1890ff",
    icon: <ClockCircleOutlined />,
    label: "Pending",
    bg: "#e6f7ff",
  },
};

//  Helper: always return a valid fileList array 
// This is the KEY FIX  Ant Design Upload crashes if fileList is not an array.
const toFileList = (val: any): any[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return [];
};

//  Main Component 

const ManageCoursesAdmin: React.FC = () => {
  usePageTitle('Manage Courses | Admin');
  const navigate = useNavigate();
  const [form] = Form.useForm();

  //  Core State 
  const [loginUser, setLoginUser] = useState<LoginUser | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  //  Teachers & Categories 
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courseCategories, setCourseCategories] = useState<CourseCategory[]>([]);

  //  Modal States 
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [modalMode, setModalMode] = useState<"add" |"edit" |"duplicate">("add");
  const [activeTab, setActiveTab] = useState("basic");

  //  Chapter / Video state inside modal 
  const [chapters, setChapters] = useState(0);
  const [videoCount, setVideoCount] = useState(0);
  const [autoGenerateSEO, setAutoGenerateSEO] = useState(true);

  // Draft System State for Admin Course Modal
  const ADMIN_DRAFT_KEY = "draa_course_draft_admin_add";
  const [hasAdminDraft, setHasAdminDraft] = useState<boolean>(false);
  const [adminDraftLastSaved, setAdminDraftLastSaved] = useState<string | null>(null);

  // Save admin draft helper
  const saveAdminDraft = useCallback((allValues?: any) => {
    try {
      const values = allValues || form.getFieldsValue(true);
      const serializableValues: any = {};
      Object.keys(values).forEach((key) => {
        if (key === "coverphoto" || key === "syllabus") return;
        if (key === "chapters" && Array.isArray(values.chapters)) {
          serializableValues.chapters = values.chapters.map((ch: any) => ({
            chapter_name: ch?.chapter_name || "",
            youtube_video: ch?.youtube_video || "",
          }));
          return;
        }
        serializableValues[key] = values[key];
      });

      const draftData = {
        values: serializableValues,
        chapters,
        videoCount,
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem(ADMIN_DRAFT_KEY, JSON.stringify(draftData));
      setHasAdminDraft(true);
      setAdminDraftLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (e) {
      console.error("Failed to save admin draft:", e);
    }
  }, [form, chapters, videoCount]);

  // Clear admin draft helper
  const clearAdminDraft = useCallback(() => {
    localStorage.removeItem(ADMIN_DRAFT_KEY);
    setHasAdminDraft(false);
    setAdminDraftLastSaved(null);
  }, []);

  // Discard admin draft handler
  const handleDiscardAdminDraft = () => {
    clearAdminDraft();
    form.resetFields();
    setChapters(0);
    setVideoCount(0);
    toast.info("Draft Discarded", "Admin course draft cleared.");
  };

  //  Filters 
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [skillLevelFilter, setSkillLevelFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  //  Reviews 
  const [courseReviews, setCourseReviews] = useState<Record<string, any>>({});

  //  Stats 
  const [stats, setStats] = useState<Stats>({
    total: 0,
    approved: 0,
    pending: 0,
    published: 0,
    draft: 0,
    archived: 0,
    suspended: 0,
    totalRevenue: 0,
    totalEnrollments: 0,
  });

  //  Auth Check 
  useEffect(() => {
    const role = getUserRole();
    if (role !== "ADMIN") {
      message.error("Access denied. Admin privileges required.");
      navigate("/admin-login");
      return;
    }

    const user = getStoredUser();
    if (!user) {
      redirectToLogin(navigate, "Session expired. Please login again.");
      return;
    }

    setLoginUser(user);
  }, [navigate]);

  //  Fetch Teachers 
  const fetchTeachers = useCallback(async () => {
    try {
      const response = await axios.get(`${url}/updateTeacherStatus/all`, { headers: getAuthHeaders() });
      if (response.data.success && response.data.data?.teachers) {
        setTeachers(response.data.data.teachers);
      } else {
        const fallback = await axios.get(`${url}/count/getAllTeachers`, { headers: getAuthHeaders() });
        setTeachers(fallback.data.Teachers || []);
      }
    } catch {
      try {
        const fallback = await axios.get(`${url}/allteachersName`, { headers: getAuthHeaders() });
        setTeachers(fallback.data.teachers || []);
      } catch {
        console.warn("Could not fetch teachers");
      }
    }
  }, []);

  //  Fetch Categories 
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(`${url}/course/categories?active=true`, { headers: getAuthHeaders() });
      setCourseCategories(response.data.data?.categories || []);
    } catch {
      console.warn("Could not fetch categories");
    }
  }, []);

  //  Calculate Stats Locally 
  const calculateStatsLocally = useCallback((courseList: Course[]) => {
    const local = courseList.reduce(
      (acc, c) => ({
        total: acc.total + 1,
        approved: acc.approved + (c.isApproved ? 1 : 0),
        pending: acc.pending + (c.isApproved ? 0 : 1),
        published: acc.published + (c.status ==="published" ? 1 : 0),
        draft: acc.draft + (c.status ==="draft" ? 1 : 0),
        archived: acc.archived + (c.status ==="archived" ? 1 : 0),
        suspended: acc.suspended + (c.status ==="suspended" ? 1 : 0),
        totalRevenue: acc.totalRevenue + (c.price || 0),
        totalEnrollments: acc.totalEnrollments + (c.enrolled_count || 0),
      }),
      {
        total: 0,
        approved: 0,
        pending: 0,
        published: 0,
        draft: 0,
        archived: 0,
        suspended: 0,
        totalRevenue: 0,
        totalEnrollments: 0,
      }
    );
    setStats(local);
  }, []);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const response = await axios.get(`${url}/admin/courses/stats`, { headers: getAuthHeaders() });
      if (response.data.success && response.data.stats) {
        const s = response.data.stats.overview || response.data.stats;
        setStats(s);
      }
    } catch {
      // Will be calculated locally after courses load
    } finally {
      setStatsLoading(false);
    }
  }, []);

  //  Fetch Courses 
  const fetchCourses = useCallback(async () => {
    if (!loginUser?.aname) return;
    setLoading(true);
    try {
      let courseData: Course[] = [];
      try {
        const response = await axios.get(`${url}/admin/courses`, { headers: getAuthHeaders() });
        courseData = response.data.data?.courses || response.data.courses || [];
      } catch {
        const response = await axios.get(`${url}/course/admin/courses`, { headers: getAuthHeaders() });
        courseData =
          response.data.data?.courses ||
          response.data.courses ||
          response.data ||
          [];
      }
      setCourses(courseData);
      setFilteredCourses(courseData);
      calculateStatsLocally(courseData);
      if (courseData.length > 0)
        message.success(`Loaded ${courseData.length} courses`);
    } catch (error: any) {
      message.error("Failed to fetch courses. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [loginUser, calculateStatsLocally]);

  //  Fetch Reviews 
  const fetchCourseReviews = async (courseId: string) => {
    try {
      const res = await fetch(`${url}/course/review/${courseId}`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        setCourseReviews((prev) => ({
          ...prev,
          [courseId]: { avgRating: data.averageRating, total: data.total },
        }));
      }
    } catch { }
  };

  //  Init 
  useEffect(() => {
    if (loginUser?.aname) {
      fetchCourses();
      fetchStats();
      fetchTeachers();
      fetchCategories();
    }
  }, [loginUser, fetchCourses, fetchStats, fetchTeachers, fetchCategories]);

  useEffect(() => {
    if (courses.length > 0) {
      courses.forEach((c) => fetchCourseReviews(c._id));
    }
  }, [courses]);

  //  Filter Logic 
  useEffect(() => {
    const filtered = courses.filter((course) => {
      const search = searchText.toLowerCase();
      const matchesSearch =
        course.title.toLowerCase().includes(search) ||
        course.short_desc?.toLowerCase().includes(search) ||
        course.teacher_id?.tname.toLowerCase().includes(search) ||
        course.instructor?.toLowerCase().includes(search) ||
        course.course_category?.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter ==="all" || course.status === statusFilter;
      const matchesSkill =
        skillLevelFilter ==="all" || course.skill_level === skillLevelFilter;
      const matchesLang =
        languageFilter ==="all" ||
        course.language?.toLowerCase().includes(languageFilter.toLowerCase());
      const matchesApproval =
        approvalFilter ==="all" ||
        (approvalFilter ==="approved" && course.isApproved) ||
        (approvalFilter ==="pending" && !course.isApproved);
      const matchesCategory =
        categoryFilter ==="all" || course.course_category === categoryFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesSkill &&
        matchesLang &&
        matchesApproval &&
        matchesCategory
      );
    });
    setFilteredCourses(filtered);
  }, [
    courses,
    searchText,
    statusFilter,
    skillLevelFilter,
    languageFilter,
    approvalFilter,
    categoryFilter,
  ]);

  //  Open Add Modal 
  const openAddModal = () => {
    setModalMode("add");
    setEditingCourse(null);
    setChapters(0);
    setVideoCount(0);
    setActiveTab("basic");
    form.resetFields();
    form.setFieldsValue({
      price: 0,
      actual_price: 0,
      discounted_price: 0,
      discount_percentage: 0,
      enrolled_count: 0,
      robots:"index, follow",
      coverphoto: [],
      syllabus: [],
      who_this_course_is_for: [{ text:"" }],
      what_you_will_learn: [{ text:"" }],
      course_features: [{ text:"" }],
      course_faqs: [{ question:"", answer:"" }],
      chapters: [],
      youtube_links: [""]
    });

    // Check if an unsaved admin course draft exists
    try {
      const saved = localStorage.getItem(ADMIN_DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.values) {
          form.setFieldsValue(parsed.values);
          if (typeof parsed.chapters === "number") setChapters(parsed.chapters);
          if (typeof parsed.videoCount === "number") setVideoCount(parsed.videoCount);
          setHasAdminDraft(true);
          if (parsed.timestamp) {
            const dt = new Date(parsed.timestamp);
            setAdminDraftLastSaved(dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          }
          toast.info("Draft Restored", "Unsaved course draft was automatically restored from your last session.");
        }
      }
    } catch (e) {
      console.error("Failed to restore admin course draft:", e);
    }

    setIsCourseModalOpen(true);
  };

  // Auto-save draft on window unload when modal is open
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isCourseModalOpen && modalMode === "add") {
        const vals = form.getFieldsValue(true);
        if (vals.title || vals.short_desc || vals.long_desc || (vals.chapters && vals.chapters.length > 0)) {
          saveAdminDraft(vals);
        }
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [form, isCourseModalOpen, modalMode, saveAdminDraft]);



  const buildFileUrl = (file: any) => {
    if (!file) return undefined;
    const pathStr = typeof file === "object" ? (file.url || file.response?.url || file.name) : file;
    if (!pathStr || typeof pathStr !== "string") return undefined;
    return getImageUrl(pathStr);
  };

  const mapToFileList = (file: any) => {
    if (!file) return [];

    return [
      {
        uid: file._id || Math.random().toString(),
        name: file.originalname || file.name ||"file",
        status:"done",
        url: buildFileUrl(file), //  FIXED
      },
    ];
  };

  const sanitizeChaptersForForm = (rawChapters: any[]): any[] => {
    return rawChapters.map((ch: any) => ({
      chapter_name: ch.chapter_name || ch.name ||"",
      youtube_video: ch.youtube_video || ch.video_url ||"",

      study_material: mapToFileList(ch.study_material),
      practice_set: mapToFileList(ch.practice_set),

      other_materials: Array.isArray(ch.other_materials)
        ? ch.other_materials.map((f: any) => ({
          uid: f._id || Math.random().toString(),
          name: f.originalname || f.name ||"file",
          status:"done",
          url: buildFileUrl(f), //  FIXED
        }))
        : [],
    }));
  };

  const safeParseArray = (data: any, defaultKey?: string): any[] => {
    if (!data) return defaultKey ? [{ [defaultKey]:"" }] : [];

    let parsedData = data;
    if (typeof data ==="string") {
      try {
        parsedData = JSON.parse(data);
      } catch {
        return defaultKey ? [{ [defaultKey]: data }] : [data];
      }
    }

    if (Array.isArray(parsedData)) {
      if (parsedData.length === 0) return defaultKey ? [{ [defaultKey]:"" }] : [];

      return parsedData.map((item) => {
        if (typeof item ==="string") {
          try {
            const parsedItem = JSON.parse(item);
            return typeof parsedItem ==="object" && parsedItem !== null
              ? parsedItem
              : (defaultKey ? { [defaultKey]: item } : item);
          } catch {
            return defaultKey ? { [defaultKey]: item } : item;
          }
        }
        return item;
      });
    }

    return defaultKey ? [{ [defaultKey]:"" }] : [];
  };

  const parseStringArray = (data: any): string[] => {
    if (!data) return [];
    let parsedData = data;
    if (typeof data ==="string") {
      try { parsedData = JSON.parse(data); } catch { return [data]; }
    }
    if (Array.isArray(parsedData)) {
      const flat = parsedData.flat(Infinity);
      return flat.flatMap(item => {
        if (typeof item ==='string' && item.trim().startsWith('[')) {
          try {
            const inner = JSON.parse(item);
            if (Array.isArray(inner)) return inner;
          } catch (e) { }
        }
        return typeof item ==='object' ?"" : String(item);
      }).filter(Boolean) as string[];
    }
    return [];
  };

  //  Open Edit Modal 
  const openEditModal = (course: Course) => {
    setModalMode("edit");
    setEditingCourse(course);
    setActiveTab("basic");

    const chapterCount = course.chapters?.length || course.chapterCount || 0;
    const ytLinks = parseStringArray(course.youtube_links);
    const vCount = ytLinks.length;
    setChapters(chapterCount);
    setVideoCount(vCount);

    const sanitizedChapters = sanitizeChaptersForForm(course.chapters || []);

    // resetFields clears stale data first; setFieldsValue then fills all fields.
    // Form is always mounted (no destroyOnClose), so this runs synchronously.
    form.resetFields();
    form.setFieldsValue({
      title: course.title,
      short_desc: course.short_desc,
      long_desc: course.long_desc || course.description,
      course_category: course.course_category || course.category,
      actual_price: course.actual_price || course.price,
      discounted_price: course.discounted_price || course.price,
      discount_percentage: course.discount_percentage || 0,
      enrolled_count: course.enrolled_count || 0,
      duration: course.duration,
      language: course.language,
      skill_level: course.skill_level,
      teacher_id: course.teacher_id?._id,
      status: course.status ||"draft",
      seo_title: course.seo_title || course.title,
      slug: course.slug || (course.title ? course.title.toLowerCase().trim().replace(/[^\w\s-]/g,"").replace(/[\s_-]+/g,"-").replace(/^-+|-+$/g,"") :""),
      meta_description: course.meta_description || course.short_desc,
      meta_keywords: course.meta_keywords,
      coverphoto: mapToFileList((course as any).coverphoto),
      syllabus: mapToFileList((course as any).syllabus),
      who_this_course_is_for: safeParseArray(course.who_this_course_is_for,"text"),
      what_you_will_learn: safeParseArray(course.what_you_will_learn,"text"),
      course_features: safeParseArray(course.course_features,"text"),
      course_faqs: safeParseArray(course.course_faqs,"question").map((f: any) => ({
        question: f.question || f.text ||"",
        answer: f.answer ||""
      })),
      chapterCount: chapterCount,
      videoCount: vCount,
      chapters: sanitizedChapters,
      youtube_links: ytLinks.length > 0 ? ytLinks : [""],
    });

    setIsCourseModalOpen(true);
  };

  //  Open Duplicate Modal — pre-fills EVERY field from a source course so the
  // admin/teacher only needs to retouch what they want to change before saving
  // as a brand-new course. Files must be re-uploaded (server requires fresh uploads).
  const openDuplicateModal = (course: Course) => {
    // The server-side duplicate endpoint copies every field INCLUDING file paths,
    // so the user doesn't need to fill out a form or re-upload anything.
    // We just show a confirmation first so they know what they're getting.
    Modal.confirm({
      title: "Duplicate Course",
      icon: <CopyOutlined style={{ color:"#722ed1" }} />,
      content: (
        <div>
          <p>Create a copy of <strong>"{course.title}"</strong>?</p>
          <ul style={{ marginBottom: 0, paddingLeft: 18, color:"#666" }}>
            <li>Cover photo, syllabus, chapter files and videos will all be copied as-is.</li>
            <li>The new course will be saved as <strong>Draft</strong> and require admin approval.</li>
            <li>Title will get a " (Copy)" suffix; slug will get a "-copy" suffix.</li>
            <li>Enrollments and ratings reset to 0.</li>
          </ul>
        </div>
      ),
      okText:"Duplicate",
      cancelText:"Cancel",
      okButtonProps:{ icon:<CopyOutlined />, style:{ background:"#722ed1", borderColor:"#722ed1" } },
      onOk: async () => {
        try {
          setActionLoading(course._id);
          const res = await fetch(`${url}/course/duplicate/${course._id}`, {
            method:"POST",
            headers: getAuthHeaders(),
          });
          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data.error || data.message || "Failed to duplicate course");
          }
          message.success(` Course duplicated as "${data.course?.title}"`);
          await fetchCourses();
        } catch (err: any) {
          console.error("Duplicate failed:", err);
          message.error(err.message || "Failed to duplicate course");
        } finally {
          setActionLoading(null);
        }
      },
    });
  }; 
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!autoGenerateSEO) return;
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g,"")
      .replace(/[\s_-]+/g,"-")
      .replace(/^-+|-+$/g,"");
    form.setFieldsValue({
      seo_title: title.length > 60 ? title.substring(0, 57) +"..." : title,
      slug,
      og_title: title.length > 60 ? title.substring(0, 57) +"..." : title,
    });
  };

  const handleShortDescChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!autoGenerateSEO) return;
    const desc = e.target.value;
    form.setFieldsValue({
      meta_description:
        desc.length > 160 ? desc.substring(0, 157) +"..." : desc,
    });
  };

  //  File helpers 
  // FIX: Always return an array. Never return undefined/null/string.
  const getFileValue = (e: any): any[] => {
    if (Array.isArray(e)) return e;
    if (e && Array.isArray(e.fileList)) return e.fileList;
    return [];
  };

  const beforeUpload = () => false;

  //  Form Submit: Add / Edit 
  const onFormFinish = async (values: any) => {
    setFormSubmitting(true);
    try {
      const formData = new FormData();

      const textFields = [
"title",
"short_desc",
"long_desc",
"language",
"skill_level",
"duration",
"teacher_id",
"course_category",
"seo_title",
"slug",
"meta_keywords",
"meta_description",
"og_title",
"og_description",
"canonical_url",
"robots",
"schema_markup",
"status",
      ];

      textFields.forEach((field) => {
        if (values[field] !== undefined && values[field] !== null) {
          formData.append(field, String(values[field]));
        }
      });

      const numFields = [
"actual_price",
"discounted_price",
"discount_percentage",
"enrolled_count",
      ];
      numFields.forEach((field) => {
        formData.append(field, String(values[field] || 0));
      });
      formData.append(
"price",
        String(values.discounted_price || values.actual_price || 0)
      );

      // Arrays
      const cleanedYoutubeLinks = (values.youtube_links || []).filter((link: string) => link && typeof link === 'string' && link.trim() !== "");
      formData.append("youtube_links", JSON.stringify(cleanedYoutubeLinks));
      formData.append(
"who_this_course_is_for",
        JSON.stringify(values.who_this_course_is_for || [])
      );
      formData.append(
"what_you_will_learn",
        JSON.stringify(values.what_you_will_learn || [])
      );
      formData.append(
"course_features",
        JSON.stringify(values.course_features || [])
      );
      formData.append("course_faqs", JSON.stringify(values.course_faqs || []));

      // Cover photo  only append if a new file was actually selected
      const coverList = toFileList(values.coverphoto);
      if (coverList[0]?.originFileObj) {
        formData.append("coverphoto", coverList[0].originFileObj);
      }

      // Syllabus  only append if a new file was actually selected
      const syllabusList = toFileList(values.syllabus);
      if (syllabusList[0]?.originFileObj) {
        formData.append("syllabus", syllabusList[0].originFileObj);
      }

      // Chapters text fields first, then files
      const chaptersText = (values.chapters || []).map((ch: any) => ({
        chapter_name: ch.chapter_name,
        youtube_video: ch.youtube_video,
      }));
      formData.append("chapters", JSON.stringify(chaptersText));

      (values.chapters || []).forEach((ch: any, i: number) => {
        const smList = toFileList(ch.study_material);
        if (smList[0]?.originFileObj) {
          formData.append(`chapters[${i}][study_material]`, smList[0].originFileObj);
        }
        const psList = toFileList(ch.practice_set);
        if (psList[0]?.originFileObj) {
          formData.append(`chapters[${i}][practice_set]`, psList[0].originFileObj);
        }
        const omList = toFileList(ch.other_materials);
        omList.forEach((f: any) => {
          if (f.originFileObj) {
            formData.append(`chapters[${i}][other_materials]`, f.originFileObj);
          }
        });
      });

      let res;
      if (modalMode === "add" || modalMode === "duplicate") {
        res = await fetch(`${url}/course/create-course`, {
          method: "POST",
          body: formData,
          headers: getAuthHeaders(),
        });
      } else {
        res = await fetch(`${url}/course/updateCourse/${editingCourse?._id}`, {
          method: "PUT",
          body: formData,
          headers: getAuthHeaders(),
        });
      }

      const data = await res.json();

      if (res.ok) {
        if (modalMode === "add") clearAdminDraft();
        const succMsg = modalMode === "duplicate"
          ? "Course duplicated successfully!"
          : modalMode === "add"
          ? "Course created successfully!"
          : "Course updated successfully!";
        toast.success(
          modalMode === "duplicate" ? "Course Duplicated" : modalMode === "add" ? "Course Created" : "Course Updated",
          succMsg
        );
        message.success(succMsg);
        setIsCourseModalOpen(false);
        form.resetFields();
        await fetchCourses();
      } else {
        const detailMsg = Array.isArray(data.details) ? data.details.join(", ") : null;
        const errMsg = detailMsg || data.error || data.message || "Failed to save course.";
        toast.error("Course Save Error", errMsg);
        message.error(errMsg);
      }
    } catch (err: any) {
      console.error(err);
      const rawMsg = err?.response?.data?.error || err?.response?.data?.message || err?.message || "Something went wrong while saving course.";
      toast.error("Network Error", rawMsg);
      message.error(rawMsg);
    } finally {
      setFormSubmitting(false);
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.error("Form Validation Failed:", errorInfo);
    const errorFields = errorInfo?.errorFields || [];
    let detailMsg = "";
    if (errorFields.length > 0) {
      detailMsg = errorFields
        .map((f: any) => {
          const fieldLabel = Array.isArray(f.name) ? f.name.join(" > ") : f.name;
          const msg = f.errors?.join(", ");
          return `${fieldLabel}: ${msg}`;
        })
        .filter(Boolean)
        .slice(0, 3)
        .join(" | ");
    }
    const errMsg = detailMsg
      ? `Validation failed on fields: ${detailMsg}`
      : "Form submission failed. Please fill in all required fields marked with * before submitting.";
    toast.error("Form Validation Error", errMsg);
    message.error(errMsg, 8);
  };

  //  Delete 
  const handleDelete = async (courseId: string, courseTitle: string) => {
    setActionLoading(courseId);
    try {
      let response;
      try {
        response = await axios.delete(`${url}/admin/courses/${courseId}`, { headers: getAuthHeaders() });
      } catch {
        response = await axios.delete(`${url}/course/deleteCourse/${courseId}`, { headers: getAuthHeaders() });
      }

      if (response.status === 200) {
        message.success(`"${courseTitle}" deleted`);
        setCourses((prev) => prev.filter((c) => c._id !== courseId));
      }
    } catch (error: any) {
      if (error?.response?.status === 400) {
        message.error(error.response.data?.message ||"Cannot delete: This course has purchases. Please refund/cancel purchases first.");
      } else {
        message.error(error.response?.data?.message ||"Failed to delete course");
      }
    } finally {
      setActionLoading(null);
    }
  };

  //  Approval Toggle 
  const handleApprovalToggle = async (
    courseId: string,
    currentStatus: boolean,
    courseTitle: string,
    reason?: string
  ) => {
    setActionLoading(courseId);
    try {
      const action = currentStatus ?"reject" :"approve";
      if (action ==="reject") {
        try {
          await axios.put(`${url}/admin/courses/${courseId}/reject`, {
            rejectionReason: reason
          }, { headers: getAuthHeaders() });
        } catch {
          await axios.put(`${url}/course/UpdateCourseApprovalStatus/${courseId}`, {
            isApproved: false,
            rejectionReason: reason
          }, { headers: getAuthHeaders() });
        }
      } else {
        try {
          await axios.put(`${url}/admin/courses/${courseId}/approve`, {}, { headers: getAuthHeaders() });
        } catch {
          await axios.put(`${url}/course/UpdateCourseApprovalStatus/${courseId}`, {
            isApproved: true
          }, { headers: getAuthHeaders() });
        }
      }
      
      message.success(`"${courseTitle}" ${!currentStatus ?"approved" :"unapproved"}`);
      setCourses((prev) =>
        prev.map((c) =>
          c._id === courseId ? { ...c, isApproved: !currentStatus } : c
        )
      );
      if (selectedCourse?._id === courseId) {
        setSelectedCourse((prev) =>
          prev ? { ...prev, isApproved: !currentStatus } : prev
        );
      }
    } catch (error: any) {
      message.error(
        error.response?.data?.message ||"Failed to update approval"
      );
    } finally {
      setActionLoading(null);
    }
  };

  //  Status Change 
  const handleStatusChange = async (
    courseId: string,
    newStatus: string,
    courseTitle: string
  ) => {
    setActionLoading(courseId);
    try {
      try {
        await axios.put(`${url}/admin/courses/${courseId}/status`, {
          status: newStatus
        }, { headers: getAuthHeaders() });
      } catch {
        const altResponse = await axios.put(`${url}/course/updateStatus/${courseId}`, {
          status: newStatus
        }, { headers: getAuthHeaders() });
        if (!altResponse.data.success) throw new Error();
      }
      message.success(`"${courseTitle}"  ${newStatus}`);
      setCourses((prev) =>
        prev.map((c) =>
          c._id === courseId
            ? { ...c, status: newStatus as Course["status"] }
            : c
        )
      );
      if (selectedCourse?._id === courseId) {
        setSelectedCourse((prev) =>
          prev ? { ...prev, status: newStatus as Course["status"] } : prev
        );
      }
    } catch (error: any) {
      if (error?.response?.status === 400) {
        message.error(error.response.data?.message ||"Cannot change status: This course has purchases.");
      } else {
        message.error("Failed to update status");
      }
    } finally {
      setActionLoading(null);
    }
  };

  //  Bulk Actions Handlers 
  const handleBulkApprove = async () => {
    if (selectedRowKeys.length === 0) return;
    setBulkActionLoading(true);
    const keys = selectedRowKeys.map(String);
    try {
      try {
        await axios.put(
          `${url}/admin/courses/bulk/approve`,
          { courseIds: keys },
          { headers: getAuthHeaders() }
        );
      } catch {
        await axios.put(
          `${url}/course/admin/courses/bulk/approve`,
          { courseIds: keys },
          { headers: getAuthHeaders() }
        );
      }
      message.success(`${keys.length} course(s) approved successfully`);
      setCourses((prev) =>
        prev.map((c) =>
          keys.includes(c._id) ? { ...c, isApproved: true, status: "published" as const } : c
        )
      );
      setSelectedRowKeys([]);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Failed to bulk approve courses");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedRowKeys.length === 0) return;
    setBulkActionLoading(true);
    const keys = selectedRowKeys.map(String);
    try {
      try {
        await axios.put(
          `${url}/admin/courses/bulk/reject`,
          { courseIds: keys, rejectionReason: "Bulk unapproved by Admin" },
          { headers: getAuthHeaders() }
        );
      } catch {
        await axios.put(
          `${url}/course/admin/courses/bulk/reject`,
          { courseIds: keys, rejectionReason: "Bulk unapproved by Admin" },
          { headers: getAuthHeaders() }
        );
      }
      message.success(`${keys.length} course(s) unapproved successfully`);
      setCourses((prev) =>
        prev.map((c) =>
          keys.includes(c._id) ? { ...c, isApproved: false, status: "pending" as const } : c
        )
      );
      setSelectedRowKeys([]);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Failed to bulk unapprove courses");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedRowKeys.length === 0) return;
    setBulkActionLoading(true);
    const keys = selectedRowKeys.map(String);
    try {
      try {
        await axios.put(
          `${url}/admin/courses/bulk/status`,
          { courseIds: keys, status: newStatus },
          { headers: getAuthHeaders() }
        );
      } catch {
        await axios.put(
          `${url}/course/admin/courses/bulk/status`,
          { courseIds: keys, status: newStatus },
          { headers: getAuthHeaders() }
        );
      }
      message.success(`${keys.length} course(s) status updated to "${newStatus}"`);
      setCourses((prev) =>
        prev.map((c) =>
          keys.includes(c._id) ? { ...c, status: newStatus as Course["status"] } : c
        )
      );
      setSelectedRowKeys([]);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Failed to bulk update course status");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRowKeys.length === 0) return;
    setBulkActionLoading(true);
    const keys = selectedRowKeys.map(String);
    try {
      try {
        await axios.delete(`${url}/admin/courses/bulk/delete`, {
          data: { courseIds: keys },
          headers: getAuthHeaders(),
        });
      } catch {
        await axios.delete(`${url}/course/admin/courses/bulk/delete`, {
          data: { courseIds: keys },
          headers: getAuthHeaders(),
        });
      }
      message.success(`${keys.length} course(s) deleted successfully`);
      setCourses((prev) => prev.filter((c) => !keys.includes(c._id)));
      setSelectedRowKeys([]);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Failed to bulk delete courses");
    } finally {
      setBulkActionLoading(false);
    }
  };

  //  Clear Filters 
  const clearFilters = () => {
    setSearchText("");
    setStatusFilter("all");
    setSkillLevelFilter("all");
    setLanguageFilter("all");
    setApprovalFilter("all");
    setCategoryFilter("all");
  };

  const isFilterActive =
    searchText !=="" ||
    statusFilter !=="all" ||
    skillLevelFilter !=="all" ||
    languageFilter !=="all" ||
    approvalFilter !=="all" ||
    categoryFilter !=="all";

  //  Export 
  const handleExport = async () => {
    try {
      message.loading("Preparing export...", 2);
      try {
        const response = await axios.get(`${url}/admin/courses/export`, {
          responseType:"blob",
          headers: getAuthHeaders()
        });
        const blob = new Blob([response.data]);
        const dl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = dl;
        a.download = `courses-${new Date().toISOString().split("T")[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(dl);
      } catch {
        const headers = [
"ID",
"Title",
"Instructor",
"Category",
"Language",
"Level",
"Duration",
"Price",
"Status",
"Approved",
"Enrollments",
"Created",
        ];
        const rows = filteredCourses.map((c) =>
          [
            c._id,
            `"${c.title}"`,
            `"${c.teacher_id?.tname ||"N/A"}"`,
            `"${c.course_category ||"General"}"`,
            c.language,
            c.skill_level,
            c.duration,
            c.price || 0,
            c.status ||"draft",
            c.isApproved ?"Yes" :"No",
            c.enrolled_count || 0,
            c.createdAt ? new Date(c.createdAt).toLocaleDateString() :"N/A",
          ].join(",")
        );
        const csv = [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csv], { type:"text/csv" });
        const dl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = dl;
        a.download = `courses-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(dl);
      }
      message.success("Exported successfully!");
    } catch {
      message.error("Export failed");
    }
  };

  //  Memoized values 
  const uniqueSkillLevels = useMemo(
    () => [...new Set(courses.map((c) => c.skill_level).filter(Boolean))],
    [courses]
  );
  const uniqueLanguages = useMemo(
    () => [...new Set(courses.map((c) => c.language).filter(Boolean))],
    [courses]
  );
  const uniqueCategories = useMemo(
    () => [
      ...new Set(
        courses.map((c) => c.course_category || c.category).filter(Boolean)
      ),
    ],
    [courses]
  );

  const tableDataSource = useMemo(
    () =>
      filteredCourses.map((c) => ({
        ...c,
        key: c._id,
        instructor: c.teacher_id?.tname || c.instructor ||"Unknown",
        category: c.course_category || c.category ||"General",
        status: c.status ||"draft",
        isApproved: c.isApproved || false,
        enrolled_count: c.enrolled_count || 0,
        rating: c.averageRating || c.rating || 0,
      })),
    [filteredCourses]
  );

  //  Table Columns 
  const columns = [
    {
      title:"Course",
      key:"courseInfo",
      width: 320,
      render: (_: any, record: Course) => {
        const cfg = STATUS_CONFIG[record.status ||"draft"] || STATUS_CONFIG.draft;
        return (
          <div style={{ display:"flex", gap: 12, alignItems:"flex-start" }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 8,
                background: cfg.bg,
                border: `2px solid ${cfg.color}22`,
                display:"flex",
                alignItems:"center",
                justifyContent:"center",
                flexShrink: 0,
                fontSize: 20,
              }}
            >
              {record.coverphoto ? (
                <img
                  src={buildFileUrl(record.coverphoto)}
                  alt=""
                  style={{
                    width:"100%",
                    height:"100%",
                    objectFit:"cover",
                    borderRadius: 6,
                  }}
                />
              ) : (
                <BookOutlined style={{ color: cfg.color }} />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text
                strong
                style={{
                  fontSize: 13,
                  color:"#1677ff",
                  cursor:"pointer",
                  display:"block",
                  overflow:"hidden",
                  textOverflow:"ellipsis",
                  whiteSpace:"nowrap",
                }}
                onClick={() => {
                  setSelectedCourse(record);
                  setIsDetailDrawerOpen(true);
                }}
              >
                {record.title}
              </Text>
              <Text
                type="secondary"
                style={{
                  fontSize: 11,
                  display:"block",
                  overflow:"hidden",
                  textOverflow:"ellipsis",
                  whiteSpace:"nowrap",
                }}
              >
                {record.short_desc}
              </Text>
              <div style={{ marginTop: 4, display:"flex", gap: 4, flexWrap:"wrap" }}>
                {record.teacher_id?.tname && (
                  <Tag color="blue" style={{ fontSize: 10, margin: 0 }}>
                    <UserOutlined /> {record.teacher_id.tname}
                  </Tag>
                )}
                {record.course_category && (
                  <Tag color="purple" style={{ fontSize: 10, margin: 0 }}>
                    {record.course_category}
                  </Tag>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title:"Details",
      key:"details",
      width: 140,
      render: (_: any, record: Course) => (
        <Space direction="vertical" size={2}>
          <Text style={{ fontSize: 11 }}>
            <CalendarOutlined style={{ color:"#1677ff", marginRight: 4 }} />
            {record.duration} mins
          </Text>
          <Text style={{ fontSize: 11 }}>
            <DollarOutlined style={{ color:"#52c41a", marginRight: 4 }} />
            {record.price === 0 ? (
              <span style={{ color:"#52c41a", fontWeight: 600 }}>Free</span>
            ) : (
              `${record.price?.toLocaleString()}`
            )}
          </Text>
          <Text style={{ fontSize: 11 }}>
            <GlobalOutlined style={{ color:"#722ed1", marginRight: 4 }} />
            {record.language}
          </Text>
          <Tag
            style={{
              fontSize: 10,
              padding:"0 4px",
              background:
                record.skill_level ==="beginner"
                  ?"#f6ffed"
                  : record.skill_level ==="intermediate"
                    ?"#fff7e6"
                    :"#fff1f0",
              borderColor:
                record.skill_level ==="beginner"
                  ?"#52c41a"
                  : record.skill_level ==="intermediate"
                    ?"#fa8c16"
                    :"#f5222d",
              color:
                record.skill_level ==="beginner"
                  ?"#52c41a"
                  : record.skill_level ==="intermediate"
                    ?"#fa8c16"
                    :"#f5222d",
            }}
          >
            {record.skill_level?.toUpperCase()}
          </Tag>
        </Space>
      ),
    },
    {
      title:"Status",
      key:"status",
      width: 130,
      render: (_: any, record: Course) => {
        const cfg = STATUS_CONFIG[record.status ||"draft"] || STATUS_CONFIG.draft;
        return (
          <Space direction="vertical" size={4}>
            <Tag
              style={{
                background: cfg.bg,
                borderColor: cfg.color +"44",
                color: cfg.color,
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              {cfg.icon} {cfg.label}
            </Tag>
            <Tag
              color={record.isApproved ?"success" :"warning"}
              icon={
                record.isApproved ? (
                  <CheckCircleOutlined />
                ) : (
                  <ClockCircleOutlined />
                )
              }
              style={{ fontSize: 11 }}
            >
              {record.isApproved ?"Approved" :"Pending"}
            </Tag>
          </Space>
        );
      },
    },
    {
      title:"Performance",
      key:"performance",
      width: 120,
      render: (_: any, record: Course) => (
        <Space direction="vertical" size={2}>
          <Text style={{ fontSize: 11 }}>
            <UserOutlined style={{ color:"#1677ff", marginRight: 4 }} />
            {record.enrolled_count || 0} enrolled
          </Text>
          <Text style={{ fontSize: 11 }}>
            {""}
            {courseReviews[record._id]?.avgRating
              ? Number(courseReviews[record._id].avgRating).toFixed(1)
              :"0.0"}
            /5
          </Text>
          <Text style={{ fontSize: 10, color:"#8c8c8c" }}>
            ({courseReviews[record._id]?.total || 0} reviews)
          </Text>
        </Space>
      ),
    },
    {
      title:"Date",
      key:"date",
      width: 110,
      render: (_: any, record: Course) => (
        <Space direction="vertical" size={2}>
          <Text style={{ fontSize: 11 }}>
            {record.createdAt
              ? moment(record.createdAt).format("DD MMM YY")
              :"N/A"}
          </Text>
          {record.updatedAt && record.updatedAt !== record.createdAt && (
            <Text style={{ fontSize: 10, color:"#8c8c8c" }}>
              Upd: {moment(record.updatedAt).format("DD MMM YY")}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title:"Actions",
      key:"actions",
      width: 230,
      fixed:"right" as const,
      render: (_: any, record: Course) => (
        <Space size={4} wrap>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => {
                setSelectedCourse(record);
                setIsDetailDrawerOpen(true);
              }}
            />
          </Tooltip>

          <Tooltip title="Edit Course">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              style={{ color:"#1677ff" }}
              onClick={() => openEditModal(record)}
            />
          </Tooltip>

          <Tooltip title="Duplicate Course">
            <Button
              type="text"
              icon={<CopyOutlined />}
              size="small"
              style={{ color:"#722ed1" }}
              onClick={() => openDuplicateModal(record)}
            />
          </Tooltip>

          <Select
            value={record.status ||"draft"}
            size="small"
            style={{ width: 100 }}
            onChange={(v) => handleStatusChange(record._id, v, record.title)}
            loading={actionLoading === record._id}
          >
            <Option value="draft">
              <EditOutlined style={{ color:"#fa8c16" }} /> Draft
            </Option>
            <Option value="published">
              <PlayCircleOutlined style={{ color:"#52c41a" }} /> Published
            </Option>
            <Option value="archived">
              <FolderOpenOutlined style={{ color:"#8c8c8c" }} /> Archived
            </Option>
            <Option value="suspended">
              <StopOutlined style={{ color:"#f5222d" }} /> Suspended
            </Option>
          </Select>

          <Popconfirm
            title={`${record.isApproved ?"Unapprove" :"Approve"} Course`}
            description={`${record.isApproved ?"Unapprove" :"Approve"}"${record.title}"?`}
            onConfirm={() =>
              handleApprovalToggle(
                record._id,
                record.isApproved || false,
                record.title
              )
            }
            okText="Yes"
            cancelText="No"
          >
            <Button
              type={record.isApproved ?"default" :"primary"}
              size="small"
              loading={actionLoading === record._id}
              icon={
                record.isApproved ? (
                  <ClockCircleOutlined />
                ) : (
                  <CheckCircleOutlined />
                )
              }
              danger={record.isApproved}
            >
              {record.isApproved ?"Revoke" :"Approve"}
            </Button>
          </Popconfirm>

          <Popconfirm
            title="Delete Course"
            description={(record.enrolled_count || 0) >= 1 ?"Cannot delete course: Students are enrolled." : `Delete"${record.title}"? This cannot be undone.`}
            onConfirm={() => handleDelete(record._id, record.title)}
            okText="Delete"
            cancelText="Cancel"
            okType="danger"
            disabled={(record.enrolled_count || 0) >= 1}
          >
            <Tooltip title={(record.enrolled_count || 0) >= 1 ?"Cannot delete course with active enrollments" :"Delete Course"}>
              <Button
                danger
                type="text"
                icon={<DeleteOutlined />}
                size="small"
                loading={actionLoading === record._id}
                disabled={(record.enrolled_count || 0) >= 1}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  //  Course Form Modal Content 
  const renderCourseForm = () => (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFormFinish}
      onFinishFailed={onFinishFailed}
      onValuesChange={(changed, all) => {
        if (modalMode === "add") saveAdminDraft(all);
        if ('actual_price' in changed ||'discounted_price' in changed) {
          const a = Number(all.actual_price) || 0;
          const d = Number(all.discounted_price) || 0;
          if (a > 0 && d >= 0 && d <= a) {
            form.setFieldsValue({ discount_percentage: Math.round(((a - d) / a) * 100) });
          } else {
            form.setFieldsValue({ discount_percentage: 0 });
          }
        } else if ('discount_percentage' in changed) {
          const a = Number(all.actual_price) || 0;
          const p = Number(all.discount_percentage) || 0;
          if (a > 0 && p >= 0 && p <= 100) {
            form.setFieldsValue({ discounted_price: Math.round(a - (a * p) / 100) });
          }
        }
      }}
      style={{ maxHeight:"65vh", overflowY:"auto", paddingRight: 8 }}
    >
      {modalMode === "add" && hasAdminDraft && (
        <Alert
          message="Unsaved Draft Restored"
          description={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <span>
                Draft automatically saved. Last updated at <strong>{adminDraftLastSaved || "recently"}</strong>.
              </span>
              <Space>
                <Popconfirm
                  title="Discard draft?"
                  description="This will clear draft data and reset form fields."
                  onConfirm={handleDiscardAdminDraft}
                  okText="Yes, Discard"
                  cancelText="Cancel"
                >
                  <Button size="small" danger type="text">
                    Discard Draft
                  </Button>
                </Popconfirm>
              </Space>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 16, borderRadius: 6 }}
        />
      )}
      {modalMode ==="duplicate" && (
        <Alert
          message="Duplicating an existing course"
          description={
            <div>
              <div>The course title, description, pricing, chapters, FAQs and SEO settings have been copied from the source course.</div>
              <div style={{ marginTop: 4 }}>
                <strong>You MUST re-upload the cover photo, syllabus and chapter files</strong> before saving — the server only accepts fresh file uploads and won't reuse URLs from the original course.
              </div>
            </div>
          }
          type="warning"
          showIcon
          icon={<InfoCircleOutlined />}
          style={{ marginBottom: 12 }}
        />
      )}
      <div
        style={{
          display:"flex",
          justifyContent:"flex-end",
          marginBottom: 12,
        }}
      >
        <Space>
          <Text style={{ fontSize: 12 }}>Auto-generate SEO</Text>
          <Switch
            checked={autoGenerateSEO}
            onChange={setAutoGenerateSEO}
            size="small"
          />
        </Space>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        size="small"
        tabBarStyle={{ marginBottom: 16 }}
      >
        {/*  Tab 1: Basic Info  */}
        <TabPane tab=" Basic" key="basic">
          <Row gutter={12}>
            <Col span={24}>
              <Form.Item
                label="Course Title"
                name="title"
                rules={[{ required: true, message:"Title required" }]}
              >
                <Input
                  placeholder="e.g. Complete React Developer Course"
                  onChange={handleTitleChange}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label="Short Description"
                name="short_desc"
                rules={[{ required: true }]}
              >
                <Input
                  placeholder="Brief overview of the course"
                  onChange={handleShortDescChange}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label="Detailed Description"
                name="long_desc"
                rules={[{ required: true }]}
              >
                <TextArea
                  rows={4}
                  placeholder="Comprehensive course description..."
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Course Category"
                name="course_category"
                rules={[{ required: true }]}
              >
                <Select placeholder="Select category" showSearch>
                  {courseCategories.length > 0
                    ? courseCategories.map((cat) => (
                      <Option key={cat.name} value={cat.name}>
                        {cat.name}
                      </Option>
                    ))
                    : uniqueCategories.map((cat) => (
                      <Option key={cat} value={cat}>
                        {cat}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Initial Status" name="status">
                <Select defaultValue="draft">
                  <Option value="draft">Draft</Option>
                  <Option value="published">Published</Option>
                  <Option value="archived">Archived</Option>
                  <Option value="suspended">Suspended</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              {/* FIX: valuePropName + getValueFromEvent guard against non-array */}
              <Form.Item
                label="Syllabus Document (PDF/DOC)"
                name="syllabus"
                valuePropName="fileList"
                getValueFromEvent={getFileValue}
              >
                <Upload
                  beforeUpload={beforeUpload}
                  maxCount={1}
                  accept=".pdf,.doc,.docx"
                  fileList={toFileList(form.getFieldValue("syllabus"))}
                >
                  <Button icon={<UploadOutlined />}>Upload Syllabus</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>
        </TabPane>

        {/*  Tab 2: Pricing  */}
        <TabPane tab=" Pricing" key="pricing">
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item
                label="Actual Price ()"
                name="actual_price"
                rules={[{ required: true }]}
              >
                <InputNumber
                  min={0}
                  style={{ width:"100%" }}
                  formatter={(v) =>
                    ` ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g,",")
                  }
                  parser={(v) => v!.replace(/\s?|(,*)/g,"") as any}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Discounted Price ()"
                name="discounted_price"
                rules={[{ required: true }]}
              >
                <InputNumber
                  min={0}
                  style={{ width:"100%" }}
                  formatter={(v) =>
                    ` ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g,",")
                  }
                  parser={(v) => v!.replace(/\s?|(,*)/g,"") as any}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Discount %" name="discount_percentage">
                <InputNumber
                  min={0}
                  max={100}
                  style={{ width:"100%" }}
                  formatter={(v) => `${v}%`}
                  parser={(v) => v!.replace("%","") as any}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Enrolled Count" name="enrolled_count">
                <InputNumber min={0} style={{ width:"100%" }} />
              </Form.Item>
            </Col>
          </Row>
        </TabPane>

        {/*  Tab 3: Media & Settings  */}
        <TabPane tab=" Media" key="media">
          <Row gutter={12}>
            <Col span={24}>
              {/* FIX: fileList prop always gets a safe array */}
              <Form.Item
                label="Cover Photo"
                name="coverphoto"
                valuePropName="fileList"
                getValueFromEvent={getFileValue}
                rules={modalMode ==="add" ? [{ required: true }] : []}
              >
                <Upload
                  name="coverphoto"
                  listType="picture"
                  beforeUpload={beforeUpload}
                  maxCount={1}
                  accept="image/*"
                  fileList={toFileList(form.getFieldValue("coverphoto"))}
                >
                  <Button icon={<UploadOutlined />}>
                    {modalMode ==="edit" ?"Change Cover Photo" :"Upload Cover Photo"}
                  </Button>
                </Upload>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Duration (hours)"
                name="duration"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width:"100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Language"
                name="language"
                rules={[{ required: true }]}
              >
                <Select placeholder="Select language">
                  {[
"English",
"Hindi",
"Bengali",
"Tamil",
"Telugu",
"Marathi",
"Other",
                  ].map((l) => (
                    <Option key={l} value={l}>
                      {l}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Skill Level"
                name="skill_level"
                rules={[{ required: true }]}
              >
                <Select placeholder="Select level">
                  <Option value="beginner">Beginner</Option>
                  <Option value="intermediate">Intermediate</Option>
                  <Option value="advanced">Advanced</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label={
                  <Space>
                    <UserOutlined />
                    Assign Teacher
                  </Space>
                }
                name="teacher_id"
                rules={[{ required: true, message:"Please select a teacher" }]}
              >
                <Select
                  placeholder="Search and select teacher..."
                  showSearch
                  filterOption={(input, option) =>
                    String(option?.label ||"")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  optionLabelProp="label"
                >
                  {teachers.map((t) => (
                    <Option key={t._id} value={t._id} label={t.tname}>
                      <div style={{ display:"flex", alignItems:"center", gap: 8 }}>
                        <Avatar src={t.tprofile} icon={<UserOutlined />} size={24} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>
                            {t.tname}
                          </div>
                          {t.tspecialization && (
                            <div style={{ fontSize: 11, color:"#8c8c8c" }}>
                              {t.tspecialization}
                            </div>
                          )}
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </TabPane>

        {/*  Tab 4: Videos  */}
        <TabPane tab=" Videos" key="videos">
          <Form.Item
            label="Total Preview Videos (Optional)"
            name="videoCount"
            rules={[{ required: false }]}
          >
            <InputNumber
              min={0}
              max={50}
              placeholder="0 (Optional)"
              onChange={(v) => setVideoCount(typeof v === "number" && v >= 0 ? v : 0)}
              style={{ width: "100%" }}
            />
          </Form.Item>
          {Array.from({ length: videoCount }, (_, i) => (
            <Form.Item
              key={i}
              label={`Video ${i + 1} URL (Optional)`}
              name={["youtube_links", i]}
              rules={[{ type: "url", required: false, message: "Enter valid URL" }]}
            >
              <Input
                placeholder="https://www.youtube.com/watch?v=... (Optional)"
                prefix={<VideoCameraOutlined style={{ color: "#ff4d4f" }} />}
              />
            </Form.Item>
          ))}
        </TabPane>

        {/*  Tab 5: Chapters  */}
        <TabPane tab=" Chapters" key="chapters">
          <Form.Item
            label="Number of Chapters"
            name="chapterCount"
            rules={[{ required: true }]}
          >
            <InputNumber
              min={0}
              max={50}
              style={{ width:"100%" }}
              onChange={(v) => {
                const count = typeof v ==="number" ? v : 0;
                setChapters(count);
                const existing: any[] = form.getFieldValue("chapters") || [];
                if (count > existing.length) {
                  // FIX: new chapter slots get [] for all file fields
                  const newSlots = Array.from(
                    { length: count - existing.length },
                    () => ({
                      chapter_name:"",
                      youtube_video:"",
                      study_material: [],
                      practice_set: [],
                      other_materials: [],
                    })
                  );
                  form.setFieldsValue({ chapters: [...existing, ...newSlots] });
                } else {
                  form.setFieldsValue({ chapters: existing.slice(0, count) });
                }
              }}
            />
          </Form.Item>

          {Array.from({ length: chapters }, (_, i) => (
            <Card
              key={i}
              size="small"
              title={
                <Space>
                  <Tag color="blue">Ch.{i + 1}</Tag>
                  <Text style={{ fontSize: 13 }}>Chapter {i + 1}</Text>
                </Space>
              }
              style={{ marginBottom: 12, borderRadius: 8 }}
            >
              <Row gutter={12}>
                <Col span={24}>
                  <Form.Item
                    label="Chapter Name"
                    name={["chapters", i,"chapter_name"]}
                    rules={[{ required: true }]}
                  >
                    <Input placeholder="Enter chapter name" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label="YouTube Video Link (Optional)"
                    name={["chapters", i,"youtube_video"]}
                    rules={[{ type:"url", required: false, message:"Enter valid URL" }]}
                  >
                    <Input placeholder="https://youtube.com/watch?v=... (Optional)" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  {/*
                    FIX: valuePropName="fileList" + getValueFromEvent ensures
                    the field value is always an array. The Upload's fileList
                    prop also reads from the form safely via toFileList().
                  */}
                  <Form.Item
                    label="Study Material"
                    name={["chapters", i,"study_material"]}
                    valuePropName="fileList"
                    getValueFromEvent={getFileValue}
                    rules={modalMode ==="add" ? [{ required: true }] : []}
                  >
                    <Upload
                      beforeUpload={beforeUpload}
                      maxCount={1}
                      accept=".pdf,.doc,.docx,.ppt,.pptx"
                      fileList={toFileList(
                        form.getFieldValue(["chapters", i,"study_material"])
                      )}
                    >
                      <Button icon={<UploadOutlined />} size="small">
                        Study Material
                      </Button>
                    </Upload>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Practice Set"
                    name={["chapters", i,"practice_set"]}
                    valuePropName="fileList"
                    getValueFromEvent={getFileValue}
                    rules={modalMode ==="add" ? [{ required: true }] : []}
                  >
                    <Upload
                      beforeUpload={beforeUpload}
                      maxCount={1}
                      accept=".pdf,.doc,.docx"
                      fileList={toFileList(
                        form.getFieldValue(["chapters", i,"practice_set"])
                      )}
                    >
                      <Button icon={<UploadOutlined />} size="small">
                        Practice Set
                      </Button>
                    </Upload>
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label="Other Materials (Optional)"
                    name={["chapters", i,"other_materials"]}
                    valuePropName="fileList"
                    getValueFromEvent={getFileValue}
                  >
                    <Upload
                      beforeUpload={beforeUpload}
                      multiple
                      fileList={toFileList(
                        form.getFieldValue(["chapters", i,"other_materials"])
                      )}
                    >
                      <Button icon={<UploadOutlined />} size="small">
                        Other Files
                      </Button>
                    </Upload>
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          ))}
        </TabPane>

        {/*  Tab 6: SEO  */}
        <TabPane tab=" SEO" key="seo">
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                label="SEO Title"
                name="seo_title"
                rules={[{ required: true }]}
              >
                <Input showCount maxLength={60} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="URL Slug"
                name="slug"
                rules={[{ required: true }]}
              >
                <Input prefix="/" suffix={<CopyOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Meta Keywords" name="meta_keywords">
                <Input placeholder="react, javascript, web development" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Meta Description"
                name="meta_description"
                rules={[{ required: true }]}
              >
                <TextArea showCount maxLength={160} rows={2} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Robots" name="robots">
                <Input placeholder="index, follow" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Canonical URL" name="canonical_url">
                <Input placeholder="https://yoursite.com/course/slug" />
              </Form.Item>
            </Col>
          </Row>
        </TabPane>

        {/*  Tab 7: Course Details  */}
        <TabPane tab=" Details" key="details">
          <Space direction="vertical" style={{ width:"100%" }} size={12}>
            {/* Who This Is For */}
            <Card
              size="small"
              title={
                <Space>
                  <UserOutlined style={{ color:"#1677ff" }} />
                  Who This Course Is For
                </Space>
              }
              extra={<Tag color="cyan">Target Audience</Tag>}
            >
              <Form.List name="who_this_course_is_for">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map((field) => (
                      <Space
                        key={field.key}
                        style={{ display:"flex", marginBottom: 6 }}
                        align="baseline"
                      >
                        <Form.Item
                          {...field}
                          name={[field.name,"text"]}
                          rules={[{ required: true }]}
                          style={{ flex: 1, marginBottom: 0 }}
                        >
                          <Input
                            placeholder="e.g., Beginners in programming"
                            prefix={
                              <CheckCircleOutlined style={{ color:"#52c41a" }} />
                            }
                          />
                        </Form.Item>
                        {fields.length > 1 && (
                          <MinusCircleOutlined
                            onClick={() => remove(field.name)}
                            style={{ color:"#ff4d4f" }}
                          />
                        )}
                      </Space>
                    ))}
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                      size="small"
                    >
                      Add
                    </Button>
                  </>
                )}
              </Form.List>
            </Card>

            {/* What You'll Learn */}
            <Card
              size="small"
              title={
                <Space>
                  <TrophyOutlined style={{ color:"#faad14" }} />
                  What You Will Learn
                </Space>
              }
              extra={<Tag color="gold">Learning Outcomes</Tag>}
            >
              <Form.List name="what_you_will_learn">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map((field) => (
                      <Space
                        key={field.key}
                        style={{ display:"flex", marginBottom: 6 }}
                        align="baseline"
                      >
                        <Form.Item
                          {...field}
                          name={[field.name,"text"]}
                          rules={[{ required: true }]}
                          style={{ flex: 1, marginBottom: 0 }}
                        >
                          <Input
                            placeholder="e.g., Master React hooks"
                            prefix={
                              <StarOutlined style={{ color:"#faad14" }} />
                            }
                          />
                        </Form.Item>
                        {fields.length > 1 && (
                          <MinusCircleOutlined
                            onClick={() => remove(field.name)}
                            style={{ color:"#ff4d4f" }}
                          />
                        )}
                      </Space>
                    ))}
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                      size="small"
                    >
                      Add
                    </Button>
                  </>
                )}
              </Form.List>
            </Card>

            {/* Course Features */}
            <Card
              size="small"
              title={
                <Space>
                  <TagOutlined style={{ color:"#722ed1" }} />
                  Course Features
                </Space>
              }
              extra={<Tag color="purple">Key Features</Tag>}
            >
              <Form.List name="course_features">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map((field) => (
                      <Space
                        key={field.key}
                        style={{ display:"flex", marginBottom: 6 }}
                        align="baseline"
                      >
                        <Form.Item
                          {...field}
                          name={[field.name,"text"]}
                          rules={[{ required: true }]}
                          style={{ flex: 1, marginBottom: 0 }}
                        >
                          <Input
                            placeholder="e.g., Lifetime access"
                            prefix={
                              <BookOutlined style={{ color:"#722ed1" }} />
                            }
                          />
                        </Form.Item>
                        {fields.length > 1 && (
                          <MinusCircleOutlined
                            onClick={() => remove(field.name)}
                            style={{ color:"#ff4d4f" }}
                          />
                        )}
                      </Space>
                    ))}
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                      size="small"
                    >
                      Add
                    </Button>
                  </>
                )}
              </Form.List>
            </Card>
          </Space>
        </TabPane>

        {/*  Tab 8: FAQs  */}
        <TabPane tab=" FAQs" key="faqs">
          <Form.List name="course_faqs">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <Card
                    key={field.key}
                    size="small"
                    style={{ marginBottom: 12 }}
                    extra={
                      fields.length > 1 && (
                        <CloseOutlined
                          onClick={() => remove(field.name)}
                          style={{ color:"#ff4d4f" }}
                        />
                      )
                    }
                  >
                    <Form.Item
                      {...field}
                      name={[field.name,"question"]}
                      label="Question"
                      rules={[{ required: true }]}
                    >
                      <Input placeholder="e.g. Do I get lifetime access?" />
                    </Form.Item>
                    <Form.Item
                      {...field}
                      name={[field.name,"answer"]}
                      label="Answer"
                      rules={[{ required: true }]}
                    >
                      <TextArea rows={2} placeholder="Answer..." />
                    </Form.Item>
                  </Card>
                ))}
                <Button
                  block
                  type="dashed"
                  onClick={() => add()}
                  icon={<PlusOutlined />}
                >
                  Add FAQ
                </Button>
              </>
            )}
          </Form.List>
        </TabPane>
      </Tabs>
    </Form>
  );

  //  Guard 
  if (!loginUser?.aname) {
    return (
      <Layout style={{ minHeight:"100vh" }}>
        <Content
          style={{
            display:"flex",
            justifyContent:"center",
            alignItems:"center",
          }}
        >
          <Alert
            message="Access Denied"
            description="Admin privileges required."
            type="error"
            showIcon
          />
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
          <div
            style={{
              display:"flex",
              justifyContent:"space-between",
              alignItems:"flex-start",
              marginBottom: 24,
              flexWrap:"wrap",
              gap: 12,
            }}
          >
            <div>
              <Title level={2} style={{ margin: 0, color:"#1677ff" }}>
                 Course Management
              </Title>
              <Text type="secondary">
                Full control  create, edit, approve, and monitor all courses
              </Text>
            </div>
            <Space wrap>
              <Button
                icon={<ReloadOutlined />}
                onClick={async () => {
                  await fetchCourses();
                  await fetchStats();
                }}
                loading={loading || statsLoading}
              >
                Refresh
              </Button>
              <Button icon={<ExportOutlined />} onClick={handleExport}>
                Export
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openAddModal}
                style={{ background:"#1677ff" }}
              >
                Add New Course
              </Button>
            </Space>
          </div>

          {/*  Stats Cards  */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {[
              {
                title:"Total Courses",
                value: stats.total,
                icon: <BookOutlined />,
                color:"#1677ff",
                sub: `${stats.published} published`,
              },
              {
                title:"Approved",
                value: stats.approved,
                icon: <CheckCircleOutlined />,
                color:"#52c41a",
                sub: `${stats.pending} pending`,
              },
              {
                title:"Total Enrollments",
                value: stats.totalEnrollments,
                icon: <UserOutlined />,
                color:"#722ed1",
                sub:"Across all courses",
              },
              {
                title:"Total Revenue",
                value: stats.totalRevenue,
                icon: <DollarOutlined />,
                color:"#fa8c16",
                prefix:"",
                sub:"Course prices sum",
              },
            ].map((s) => (
              <Col xs={24} sm={12} lg={6} key={s.title}>
                <Card
                  bordered={false}
                  style={{
                    borderRadius: 12,
                    boxShadow:"0 2px 8px rgba(0,0,0,0.06)",
                  }}
                >
                  <div style={{ display:"flex", alignItems:"center", gap: 12 }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: s.color +"18",
                        display:"flex",
                        alignItems:"center",
                        justifyContent:"center",
                        fontSize: 20,
                        color: s.color,
                      }}
                    >
                      {s.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color:"#8c8c8c" }}>
                        {s.title}
                      </div>
                      <div
                        style={{
                          fontSize: 24,
                          fontWeight: 700,
                          color: s.color,
                          lineHeight: 1.2,
                        }}
                      >
                        {(s as any).prefix}
                        {s.value?.toLocaleString()}
                      </div>
                      <div style={{ fontSize: 11, color:"#bfbfbf" }}>
                        {s.sub}
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          {/*  Status breakdown bar  */}
          <Card
            bordered={false}
            style={{
              marginBottom: 24,
              borderRadius: 12,
              boxShadow:"0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <Row gutter={8} align="middle">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                const count =
                  key ==="published"
                    ? stats.published
                    : key ==="draft"
                      ? stats.draft
                      : key ==="archived"
                        ? stats.archived
                        : stats.suspended || 0;
                const pct = stats.total
                  ? Math.round((count / stats.total) * 100)
                  : 0;
                return (
                  <Col xs={12} sm={6} key={key}>
                    <div style={{ padding:"8px 0" }}>
                      <div
                        style={{
                          display:"flex",
                          justifyContent:"space-between",
                          marginBottom: 4,
                        }}
                      >
                        <Text style={{ fontSize: 12, color: cfg.color }}>
                          {cfg.icon} {cfg.label}
                        </Text>
                        <Text style={{ fontSize: 12, fontWeight: 600 }}>
                          {count}
                        </Text>
                      </div>
                      <Progress
                        percent={pct}
                        strokeColor={cfg.color}
                        trailColor={cfg.bg}
                        showInfo={false}
                        size="small"
                      />
                    </div>
                  </Col>
                );
              })}
            </Row>
          </Card>

          {/*  Filters  */}
          <Card
            bordered={false}
            style={{
              marginBottom: 16,
              borderRadius: 12,
              boxShadow:"0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <Row gutter={[12, 12]} align="middle">
              <Col xs={24} sm={8} lg={6}>
                <Search
                  placeholder="Search courses, instructors..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  prefix={<SearchOutlined style={{ color:"#bfbfbf" }} />}
                />
              </Col>
              <Col xs={12} sm={4} lg={3}>
                <Select
                  value={statusFilter}
                  onChange={setStatusFilter}
                  style={{ width:"100%" }}
                >
                  <Option value="all">All Status</Option>
                  <Option value="published">Published</Option>
                  <Option value="draft">Draft</Option>
                  <Option value="archived">Archived</Option>
                  <Option value="suspended">Suspended</Option>
                </Select>
              </Col>
              <Col xs={12} sm={4} lg={3}>
                <Select
                  value={approvalFilter}
                  onChange={setApprovalFilter}
                  style={{ width:"100%" }}
                >
                  <Option value="all">All Approval</Option>
                  <Option value="approved">Approved</Option>
                  <Option value="pending">Pending</Option>
                </Select>
              </Col>
              <Col xs={12} sm={4} lg={3}>
                <Select
                  value={skillLevelFilter}
                  onChange={setSkillLevelFilter}
                  style={{ width:"100%" }}
                >
                  <Option value="all">All Levels</Option>
                  {uniqueSkillLevels.map((l) => (
                    <Option key={l} value={l}>
                      {l}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={12} sm={4} lg={3}>
                <Select
                  value={languageFilter}
                  onChange={setLanguageFilter}
                  style={{ width:"100%" }}
                >
                  <Option value="all">All Languages</Option>
                  {uniqueLanguages.map((l) => (
                    <Option key={l} value={l}>
                      {l}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={12} sm={4} lg={3}>
                <Select
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                  style={{ width:"100%" }}
                >
                  <Option value="all">All Categories</Option>
                  {uniqueCategories.map((c) => (
                    <Option key={c} value={c}>
                      {c}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={4} lg={3}>
                <Button
                  icon={<FilterOutlined />}
                  onClick={clearFilters}
                  disabled={!isFilterActive}
                  block
                >
                  Clear
                </Button>
              </Col>
            </Row>
          </Card>

          {/*  Results alert  */}
          {isFilterActive && (
            <Alert
              message={`Showing ${filteredCourses.length} of ${courses.length} courses`}
              type="info"
              showIcon
              closable={false}
              style={{ marginBottom: 12, borderRadius: 8 }}
            />
          )}

          {/*  Bulk Action Toolbar  */}
          {selectedRowKeys.length > 0 && (
            <Card
              style={{
                marginBottom: 16,
                borderRadius: 12,
                background: "linear-gradient(135deg, #e6f4ff 0%, #f0f5ff 100%)",
                borderColor: "#91caff",
                boxShadow: "0 4px 12px rgba(22, 119, 255, 0.1)",
              }}
              bodyStyle={{ padding: "12px 20px" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <Space size="middle">
                  <Badge count={selectedRowKeys.length} style={{ backgroundColor: "#1677ff" }} />
                  <Text strong style={{ color: "#1d39c4", fontSize: 15 }}>
                    {selectedRowKeys.length} course{selectedRowKeys.length > 1 ? "s" : ""} selected
                  </Text>
                  <Button size="small" type="text" onClick={() => setSelectedRowKeys([])}>
                    Deselect All
                  </Button>
                </Space>

                <Space wrap size="small">
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    style={{ background: "#52c41a", borderColor: "#52c41a" }}
                    loading={bulkActionLoading}
                    onClick={handleBulkApprove}
                  >
                    Bulk Approve
                  </Button>

                  <Button
                    icon={<CloseCircleOutlined />}
                    style={{ color: "#fa8c16", borderColor: "#ffe7ba", background: "#fffbe6" }}
                    loading={bulkActionLoading}
                    onClick={handleBulkReject}
                  >
                    Bulk Unapprove
                  </Button>

                  <Dropdown
                    menu={{
                      items: [
                        { key: "published", label: "Set Status: Published", icon: <CheckOutlined style={{ color: "#52c41a" }} /> },
                        { key: "draft", label: "Set Status: Draft", icon: <EditOutlined style={{ color: "#faad14" }} /> },
                        { key: "pending", label: "Set Status: Pending", icon: <ClockCircleOutlined style={{ color: "#1890ff" }} /> },
                        { key: "archived", label: "Set Status: Archived", icon: <FolderOutlined style={{ color: "#8c8c8c" }} /> },
                        { key: "suspended", label: "Set Status: Suspended", icon: <StopOutlined style={{ color: "#ff4d4f" }} /> },
                      ],
                      onClick: ({ key }) => handleBulkStatusChange(key),
                    }}
                    disabled={bulkActionLoading}
                  >
                    <Button icon={<TagOutlined />}>
                      Set Status <DownOutlined />
                    </Button>
                  </Dropdown>

                  <Popconfirm
                    title="Delete Selected Courses?"
                    description={`Are you sure you want to permanently delete ${selectedRowKeys.length} selected course(s)? This action cannot be undone.`}
                    onConfirm={handleBulkDelete}
                    okText="Yes, Delete All"
                    cancelText="Cancel"
                    okButtonProps={{ danger: true, loading: bulkActionLoading }}
                  >
                    <Button danger icon={<DeleteOutlined />} loading={bulkActionLoading}>
                      Bulk Delete
                    </Button>
                  </Popconfirm>
                </Space>
              </div>
            </Card>
          )}

          {/*  Main Table  */}
          <Card
            title={
              <Space>
                <BookOutlined style={{ color:"#1677ff" }} />
                <Text strong>Course List</Text>
                <Badge
                  count={filteredCourses.length}
                  style={{ background:"#1677ff" }}
                />
              </Space>
            }
            bordered={false}
            style={{ borderRadius: 12, boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}
          >
            <Table
              rowSelection={{
                selectedRowKeys,
                onChange: (keys) => setSelectedRowKeys(keys),
              }}
              rowKey="key"
              dataSource={tableDataSource}
              columns={columns}
              loading={loading}
              bordered={false}
              scroll={{ x: 1200 }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} courses`,
                pageSizeOptions: ["10","20","50"],
              }}
              size="small"
              locale={{
                emptyText: loading ? (
"Loading..."
                ) : (
                  <Empty
                    description="No courses found"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  >
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={openAddModal}
                    >
                      Add First Course
                    </Button>
                  </Empty>
                ),
              }}
              rowClassName={(record) =>
                record.status ==="suspended"
                  ?"row-suspended"
                  : record.isApproved
                    ?""
                    :"row-pending"
              }
            />
          </Card>

          {/*  ADD / EDIT COURSE MODAL  */}
          <Modal
            title={
              <Space>
                {modalMode ==="add" ? (
                  <PlusOutlined style={{ color:"#1677ff" }} />
                ) : modalMode ==="duplicate" ? (
                  <CopyOutlined style={{ color:"#722ed1" }} />
                ) : (
                  <EditOutlined style={{ color:"#fa8c16" }} />
                )}
                <Text strong style={{ fontSize: 16 }}>
                  {modalMode ==="add"
                    ?"Add New Course"
                    : modalMode ==="duplicate"
                    ?"Duplicate Course"
                    : `Edit: ${editingCourse?.title}`}
                </Text>
              </Space>
            }
            open={isCourseModalOpen}
            onCancel={() => {
              setIsCourseModalOpen(false);
              form.resetFields();
            }}
            width={900}
            footer={
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {modalMode ==="add"
                    ?"Fill all required fields across tabs"
                    : modalMode ==="duplicate"
                    ?"Re-upload cover photo & chapter files, then save as a new course"
                    :"Update any fields as needed"}
                </Text>
                <Space>
                  <Button
                    onClick={() => {
                      setIsCourseModalOpen(false);
                      form.resetFields();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    icon={
                      modalMode ==="add" ? <PlusOutlined /> : <SaveOutlined />
                    }
                    loading={formSubmitting}
                    onClick={() => form.submit()}
                  >
                    {modalMode ==="add" ?"Create Course" :"Save Changes"}
                  </Button>
                </Space>
              </div>
            }
            // NOTE: destroyOnClose removed  form persists in memory. openEditModal
            // calls form.resetFields() + setFieldsValue() directly (no timing issues).
            styles={{ body: { padding:"16px 24px" } }}
          >
            {renderCourseForm()}
          </Modal>

          {/*  COURSE DETAIL DRAWER  */}
          <Drawer
            title={
              <Space>
                <InfoCircleOutlined style={{ color:"#1677ff" }} />
                Course Details
              </Space>
            }
            placement="right"
            width={620}
            onClose={() => setIsDetailDrawerOpen(false)}
            open={isDetailDrawerOpen}
            extra={
              selectedCourse && (
                <Space>
                  <Button
                    icon={<CopyOutlined />}
                    size="small"
                    onClick={() => {
                      setIsDetailDrawerOpen(false);
                      openDuplicateModal(selectedCourse);
                    }}
                  >
                    Duplicate
                  </Button>
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    size="small"
                    onClick={() => {
                      setIsDetailDrawerOpen(false);
                      openEditModal(selectedCourse);
                    }}
                  >
                    Edit Course
                  </Button>
                </Space>
              )
            }
          >
            {selectedCourse && (
              <div>
                {selectedCourse.coverphoto && (
                  <img
                    src={buildFileUrl(selectedCourse.coverphoto)}
                    alt="cover"
                    style={{
                      width:"100%",
                      height: 160,
                      objectFit:"cover",
                      borderRadius: 10,
                      marginBottom: 16,
                    }}
                  />
                )}
                <Title level={4} style={{ margin:"0 0 4px" }}>
                  {selectedCourse.title}
                </Title>
                <Text type="secondary">{selectedCourse.short_desc}</Text>
                <Divider />
                <Space wrap style={{ marginBottom: 16 }}>
                  {(() => {
                    const cfg = STATUS_CONFIG[selectedCourse.status ||"draft"] || STATUS_CONFIG.draft;
                    return (
                      <Tag
                        style={{
                          background: cfg.bg,
                          borderColor: cfg.color +"44",
                          color: cfg.color,
                          fontWeight: 600,
                        }}
                      >
                        {cfg.icon} {cfg.label}
                      </Tag>
                    );
                  })()}
                  <Tag
                    color={selectedCourse.isApproved ?"success" :"warning"}
                    icon={
                      selectedCourse.isApproved ? (
                        <CheckCircleOutlined />
                      ) : (
                        <ClockCircleOutlined />
                      )
                    }
                  >
                    {selectedCourse.isApproved ?"Approved" :"Pending"}
                  </Tag>
                  <Tag color="blue">{selectedCourse.skill_level}</Tag>
                  <Tag color="cyan">{selectedCourse.language}</Tag>
                </Space>

                <Descriptions column={2} bordered size="small">
                  <Descriptions.Item label="Instructor" span={2}>
                    <Space>
                      {selectedCourse.teacher_id?.tprofile && (
                        <Avatar
                          src={selectedCourse.teacher_id.tprofile}
                          size={24}
                        />
                      )}
                      <Text strong>
                        {selectedCourse.teacher_id?.tname ||
                          selectedCourse.instructor ||
"Not assigned"}
                      </Text>
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="Category">
                    {selectedCourse.course_category ||
                      selectedCourse.category ||
"General"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Duration">
                    {selectedCourse.duration} mins
                  </Descriptions.Item>
                  <Descriptions.Item label="Price">
                    {selectedCourse.price === 0 ? (
                      <Text style={{ color:"#52c41a", fontWeight: 600 }}>
                        Free
                      </Text>
                    ) : (
                      `${selectedCourse.price?.toLocaleString()}`
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Enrollments">
                    {selectedCourse.enrolled_count || 0}
                  </Descriptions.Item>
                  <Descriptions.Item label="Rating">
                    {""}
                    {courseReviews[selectedCourse._id]?.avgRating
                      ? Number(
                        courseReviews[selectedCourse._id].avgRating
                      ).toFixed(1)
                      :"0.0"}{""}
                    / 5 ({courseReviews[selectedCourse._id]?.total || 0}{""}
                    reviews)
                  </Descriptions.Item>
                  <Descriptions.Item label="Chapters">
                    {selectedCourse.chapterCount ||
                      selectedCourse.chapters?.length ||
                      0}
                  </Descriptions.Item>
                  <Descriptions.Item label="Created" span={2}>
                    {selectedCourse.createdAt
                      ? moment(selectedCourse.createdAt).format("LLLL")
                      :"N/A"}
                  </Descriptions.Item>
                </Descriptions>

                {selectedCourse.what_you_will_learn &&
                  selectedCourse.what_you_will_learn.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                      <Text strong>
                        <TrophyOutlined style={{ color:"#faad14" }} /> What
                        You'll Learn
                      </Text>
                      <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                        {selectedCourse.what_you_will_learn
                          .slice(0, 5)
                          .map((item, i) => (
                            <li key={i} style={{ fontSize: 13 }}>
                              {item.text}
                            </li>
                          ))}
                        {selectedCourse.what_you_will_learn.length > 5 && (
                          <li style={{ color:"#8c8c8c", fontSize: 12 }}>
                            +{selectedCourse.what_you_will_learn.length - 5}{""}
                            more...
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                {selectedCourse.tags && selectedCourse.tags.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <Text strong>Tags: </Text>
                    {selectedCourse.tags.map((t) => (
                      <Tag key={t} style={{ marginBottom: 4 }}>
                        {t}
                      </Tag>
                    ))}
                  </div>
                )}

                <Divider />

                <Space wrap>
                  <Popconfirm
                    title={`${selectedCourse.isApproved ?"Unapprove" :"Approve"} this course?`}
                    onConfirm={() =>
                      handleApprovalToggle(
                        selectedCourse._id,
                        selectedCourse.isApproved || false,
                        selectedCourse.title
                      )
                    }
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button
                      type={selectedCourse.isApproved ?"default" :"primary"}
                      icon={
                        selectedCourse.isApproved ? (
                          <ClockCircleOutlined />
                        ) : (
                          <CheckCircleOutlined />
                        )
                      }
                      loading={actionLoading === selectedCourse._id}
                      danger={selectedCourse.isApproved}
                    >
                      {selectedCourse.isApproved
                        ?"Revoke Approval"
                        :"Approve Course"}
                    </Button>
                  </Popconfirm>

                  <Select
                    value={selectedCourse.status ||"draft"}
                    style={{ width: 130 }}
                    onChange={(v) =>
                      handleStatusChange(
                        selectedCourse._id,
                        v,
                        selectedCourse.title
                      )
                    }
                    loading={actionLoading === selectedCourse._id}
                  >
                    <Option value="draft">
                      <EditOutlined /> Draft
                    </Option>
                    <Option value="published">
                      <PlayCircleOutlined /> Published
                    </Option>
                    <Option value="archived">
                      <FolderOpenOutlined /> Archived
                    </Option>
                    <Option value="suspended">
                      <StopOutlined /> Suspended
                    </Option>
                  </Select>

                  <Popconfirm
                    title="Delete this course?"
                    description={(selectedCourse.enrolled_count || 0) >= 1 ?"Cannot delete course: Students are enrolled." :"This action cannot be undone."}
                    onConfirm={() => {
                      handleDelete(selectedCourse._id, selectedCourse.title);
                      setIsDetailDrawerOpen(false);
                    }}
                    okText="Delete"
                    cancelText="Cancel"
                    okType="danger"
                    disabled={(selectedCourse.enrolled_count || 0) >= 1}
                  >
                    <Tooltip title={(selectedCourse.enrolled_count || 0) >= 1 ?"Cannot delete course with active enrollments" : undefined}>
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        loading={actionLoading === selectedCourse._id}
                        disabled={(selectedCourse.enrolled_count || 0) >= 1}
                      >
                        Delete Course
                      </Button>
                    </Tooltip>
                  </Popconfirm>
                </Space>
              </div>
            )}
          </Drawer>
        </Content>

        <Footer style={{ textAlign:"center" }}>
          <Text type="secondary">
            <b>&copy; 2025 Draa. All Rights Reserved.</b>
          </Text>
        </Footer>
      </Layout>

      <style>{`
        .row-suspended td { background: #fff1f0 !important; opacity: 0.85; }
        .row-pending td { background: #fffbe6 !important; }
        .ant-table-row:hover .row-suspended td,
        .ant-table-row:hover .row-pending td { filter: brightness(0.97); }
      `}</style>
    </Layout>
  );
};

export default ManageCoursesAdmin;