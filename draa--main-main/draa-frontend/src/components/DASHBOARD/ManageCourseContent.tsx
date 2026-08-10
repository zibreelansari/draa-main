// frontend/src/pages/ManageCoursesContent.tsx
import React, { useEffect, useState, useCallback, useMemo } from"react";
import {
  Layout,
  Table,
  Button,
  Modal,
  message,
  Space,
  Card,
  Input,
  Tag,
  Tooltip,
  Row,
  Col,
  Select,
  Avatar,
  Typography,
  Badge,
  Descriptions,
  Form,
  Switch,
  Divider,
  Upload,
  Alert,
  Drawer,
  Popconfirm,
  Progress,
  Empty,
  Radio,
  Collapse,
} from"antd";
import CkEditor from"./CkEditor";
import {
  DeleteOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  EditOutlined,
  UserOutlined,
  BookOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  FilterOutlined,
  ReloadOutlined,
  ExportOutlined,
  PlusOutlined,
  SearchOutlined,
  SaveOutlined,
  CloseCircleOutlined,
  UploadOutlined,
  TagsOutlined,
  YoutubeOutlined,
  InstagramOutlined,
  CrownOutlined,
  TeamOutlined,
  GlobalOutlined,
  BarChartOutlined,
  RobotOutlined,
} from"@ant-design/icons";
import { useNavigate } from"react-router-dom";
import axios from"axios";
import moment from"moment";
import Topbar from"./Topbar";
import Sidebar from"./Sidebar";
import Sidebar2 from"./Sidebar2";
import url, { BACKEND_UPLOAD_URL } from"../../url";
import { getStoredUser, getUserRole, getAuthHeaders } from"../../utils/global_auth";
import ContentCopilotWidget from "../common/AgenticCopilotWidget";
import Swal from "sweetalert2";

const { Content, Footer } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

//  Interfaces 

interface CourseContent {
  _id: string;
  content_subject: string;
  content_category: string | string[];
  content: string;
  author: string;
  approved: boolean;
  seo?: {
    seo_title?: string;
    meta_keywords?: string;
    meta_description?: string;
    slug?: string;
    og_title?: string;
    og_description?: string;
    canonical_url?: string;
    robots?: string;
    schema_markup?: string;
    focus_keyword?: string;
    readability_score?: string;
  };
  content_type?: string;
  youtube_url?: string;
  instagram_url?: string;
  views?: number;
  tags?: string[];
  featured_image?: string;
  schema_image?: string;
  featured_images?: string[];
  createdBy?: { _id: string; tname?: string; aname?: string } | string;
  createdAt?: string;
  updatedAt?: string;
}

interface Teacher {
  _id: string;
  tname: string;
  temail?: string;
  tspecialization?: string;
  tprofile?: string;
  Status?: string;
}

interface Student {
  _id: string;
  name: string;
  email?: string;
  avatar?: string;
  Status?: string;
}

interface LoginUser {
  id?: string;
  aname?: string;
  aemail?: string;
}

//  Category options (from PublishCourseContent) 

const CATEGORY_OPTIONS = [
"UPSC","CIVIL SERVICES","SSC","BANKING","IBPS","SBI PO","RRB","NDA","CDS","CAPF","STATE PSC",
"JEE","JEE Advanced","NEET","GATE","CLAT","CAT","MAT","XAT","CMAT","SNAP","GMAT",
"Technology","IT","Software Engineering","Computer Science","Artificial Intelligence",
"Machine Learning","Deep Learning","Data Science","Big Data","Cyber Security","Cloud Computing","DevOps",
"JAVA","Python","C","C++","C#","JavaScript","TypeScript","PHP","Go","Rust","Swift","Kotlin",
"Frontend Development","Backend Development","Full Stack Development","React","Next.js","Angular","Vue","Node.js",
"Android Development","iOS Development","React Native","Flutter",
"CORE SECTOR","Mechanical Engineering","Civil Engineering","Electrical Engineering","Electronics Engineering",
"AGRICULTURE","Agricultural Science","Agricultural Engineering",
"LAW","Corporate Law","Criminal Law","International Law",
"Business","Entrepreneurship","Startup","Finance","Accounting","Stock Market","Digital Marketing","SEO","Marketing",
"UI/UX Design","Graphic Design","Product Design",
"Soft Skills","Personality Development","Communication Skills","Interview Preparation","Career Development",
];

//  Helpers 

const BASE_URL = BACKEND_UPLOAD_URL || "https://api.draa.in";
const buildFileUrl = (pathOrObj: any): string => {
  if (!pathOrObj) return"";
  let p = typeof pathOrObj ==="string" ? pathOrObj : pathOrObj.url || pathOrObj.name ||"";
  if (!p) return"";
  if (p.startsWith("http://") || p.startsWith("https://") || p.startsWith("blob:") || p.startsWith("data:")) {
    return p;
  }
  return `${BASE_URL.replace(/\/$/,"")}/${p.replace(/^\//,"")}`;
};

const mapToFileList = (val: any): any[] => {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.map((f, i) => {
      if (f.uid) return f;
      return {
        uid: f._id || `prev-${i}`,
        name: f.originalname || f.name ||"file",
        status:"done",
        url: buildFileUrl(f),
      };
    });
  }
  if (typeof val ==="string") {
    const isUrl = val.startsWith("http");
    const nameStr = isUrl ? val.substring(val.lastIndexOf("/") + 1) : val;
    return [
      {
        uid:"-1",
        name: nameStr,
        status:"done",
        url: buildFileUrl(val),
      },
    ];
  }
  return [];
};

const validateImageDimensions = (file: File, width: number, height: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        if (img.width === width && img.height === height) {
          resolve(true);
        } else {
          message.error(`Image must be exactly ${width}x${height} pixels! (Current: ${img.width}x${img.height})`);
          resolve(false);
        }
      };
      img.onerror = () => {
        message.error("Invalid image file.");
        resolve(false);
      };
    };
  });
};

const getFileValue = (e: any) => {
  if (Array.isArray(e)) return e;
  return e?.fileList;
};

const getYouTubeEmbedUrl = (link: string) => {
  try {
    const u = new URL(link);
    if (u.hostname ==="youtu.be") return `https://www.youtube.com/embed${u.pathname}`;
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
    return link;
  } catch { return link; }
};

//  Component 

const ManageCoursesContent: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  //  Auth 
  const [loginUser, setLoginUser] = useState<LoginUser | null>(null);

  //  Data 
  const [courseContent, setCourseContent] = useState<CourseContent[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  //  Modal/Drawer 
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<CourseContent | null>(null);
  const [editingContent, setEditingContent] = useState<CourseContent | null>(null);
  const [modalMode, setModalMode] = useState<"add" |"edit">("add");

  //"Creating for" admin or teacher 
  const [creatingFor, setCreatingFor] = useState<"admin" |"teacher">("admin");

  //  Form inner state 
  const [autoGenerateSEO, setAutoGenerateSEO] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [readabilityScore, setReadabilityScore] = useState("ok");
  const [youtubePreview, setYoutubePreview] = useState("");
  const [editorContent, setEditorContent] = useState("");

  //  Filters 
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [authorFilter, setAuthorFilter] = useState("all");

  // ─── Auto-write with Copilot flow (admin publish-content) ─────────────────
  const [autowriteOpen, setAutowriteOpen] = useState(false);
  const [autowriteTopic, setAutowriteTopic] = useState("");
  const [autowriteTone, setAutowriteTone] = useState("friendly");
  const [autowriteLength, setAutowriteLength] = useState("medium");
  const [autowriteAudience, setAutowriteAudience] = useState("");
  const [autowriteAdvanced, setAutowriteAdvanced] = useState(false);
  const [autowriteLoading, setAutowriteLoading] = useState(false);
  const [autowriteLanguage, setAutowriteLanguage] = useState("english");
  const [autowriteResult, setAutowriteResult] = useState<{
    title: string;
    snippet: string;
    isAiPowered: boolean;
  } | null>(null);

  const handleAutowrite = async () => {
    const topic = autowriteTopic.trim();
    if (!topic) return;
    setAutowriteLoading(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };

      const res = await axios.post(
        `${url}/agent/blog-generate`,
        {
          topic,
          tone: creatingFor === "teacher" ? "professional" : autowriteTone,
          length: autowriteLength,
          audience: autowriteAudience.trim() || (creatingFor === "teacher" ? "students enrolled in the course" : "students preparing for exams"),
          language: autowriteLanguage
        },
        { headers }
      );
      const data = res.data?.data;
      if (!data) throw new Error("No data returned");

      // Fill the AntD form
      form.setFieldsValue({
        content_subject: data.title || topic,
        content: data.content || "",
        tags: Array.isArray(data.tags) ? data.tags : []
      });
      if (data.imageUrl) {
        form.setFieldsValue({
          schema_image: [{
            uid: '-1',
            name: 'ai-generated-image.jpg',
            status: 'done',
            url: data.imageUrl
          }]
        });
      }
      // Sync React state too
      setEditorContent(data.content || "");
      setTags(Array.isArray(data.tags) ? data.tags : []);

      const snippet = (data.content || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 140);
      setAutowriteResult({
        title: data.title || topic,
        snippet,
        isAiPowered: !!res.data?.isAiPowered
      });

      setAutowriteOpen(false);
      setAutowriteTopic("");
      setAutowriteLanguage("english");

      Swal.fire({
        title: 'Content Generated!',
        text: 'Would you like to post it immediately or you will want to review and post by yourself?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Post Immediately',
        cancelButtonText: 'Review First',
        confirmButtonColor: '#8b5cf6',
        cancelButtonColor: '#6b7280'
      }).then((result) => {
        if (result.isConfirmed) {
          setTimeout(() => {
            form.submit();
          }, 100);
        }
      });
    } catch (err: any) {
      console.error("Autowrite failed:", err);
      message.error(err.response?.data?.message || "Failed to generate content. Please try again.");
    } finally {
      setAutowriteLoading(false);
    }
  };

  //  Auth 
  useEffect(() => {
    const role = getUserRole();
    const user = getStoredUser();

    if (role ==="ADMIN" || role ==="TEACHER") {
      setLoginUser(user);
    } else {
      message.error("Access denied. Please login.");
      navigate(role ==="STUDENT" ?"/student-login" :"/admin-login");
    }
  }, [navigate]);

  //  Fetch Teachers 
  const fetchTeachers = useCallback(async () => {
    setTeachersLoading(true);
    try {
      const res = await axios.get(`${url}/updateTeacherStatus/all`, { headers: getAuthHeaders() });
      if (res.data.success && res.data.data?.teachers) {
        setTeachers(res.data.data.teachers.filter((t: Teacher) => t.Status ==="approved"));
        return;
      }
      throw new Error("fallback");
    } catch {
      try {
        const fb = await axios.get(`${url}/count/getAllTeachers`, { headers: getAuthHeaders() });
        setTeachers(fb.data.Teachers || []);
      } catch {
        try {
          const fb2 = await axios.get(`${url}/allteachersName`, { headers: getAuthHeaders() });
          setTeachers(fb2.data.teachers || []);
        } catch { console.warn("Could not load teachers"); }
      }
    } finally {
      setTeachersLoading(false);
    }
  }, []);

  //  Fetch Students 
  const fetchStudents = useCallback(async () => {
    try {
      const res = await axios.get(`${url}/users/all`, { headers: getAuthHeaders() });
      const data: Student[] = res.data.users || res.data.data || [];
      setStudents(data.filter((s: any) => s.Status ==="approved" || !s.Status));
    } catch {
      try {
        const fb = await axios.get(`${url}/allstudents`, { headers: getAuthHeaders() });
        setStudents(fb.data.students || []);
      } catch {
        try {
          const fb2 = await axios.get(`${url}/count/getAllStudents`, { headers: getAuthHeaders() });
          setStudents(fb2.data.Students || []);
        } catch { console.warn("Could not load students"); }
      }
    }
  }, []);

  //  Fetch Content 
  const fetchContents = useCallback(async () => {
    if (!loginUser) return;
    setLoading(true);
    try {
      const role = getUserRole();
      let queryUrl = `${url}/course/allCourseContent`;
      
      // If teacher, filter by their ID
      if (role ==="TEACHER") {
        queryUrl += `?teacherId=${loginUser.id || loginUser._id}`;
      }
      
      const res = await axios.get(queryUrl, { headers: getAuthHeaders() });
      const data: CourseContent[] = Array.isArray(res.data.result) ? res.data.result : [];
      setCourseContent(data);
    } catch (err: any) {
      message.error(err.response?.data?.message ||"Failed to fetch content");
    } finally {
      setLoading(false);
    }
  }, [loginUser]);

  useEffect(() => {
    if (loginUser) { fetchContents(); fetchTeachers(); fetchStudents(); }
  }, [loginUser, fetchContents, fetchTeachers, fetchStudents]);

  //  Stats 
  const stats = useMemo(() => {
    return courseContent.reduce(
      (acc, c) => ({
        total: acc.total + 1,
        approved: acc.approved + (c.approved ? 1 : 0),
        pending: acc.pending + (!c.approved ? 1 : 0),
        totalViews: acc.totalViews + (c.views || 0),
      }),
      { total: 0, approved: 0, pending: 0, totalViews: 0 }
    );
  }, [courseContent]);

  //  Filter 
  const filteredContent = useMemo(() => {
    return courseContent.filter((c) => {
      const s = searchText.toLowerCase();
      const categoryStr = Array.isArray(c.content_category)
        ? c.content_category.join("")
        : c.content_category ||"";
      const matchSearch =
        c.content_subject?.toLowerCase().includes(s) ||
        categoryStr.toLowerCase().includes(s) ||
        c.author?.toLowerCase().includes(s) ||
        c.tags?.some((t) => t.toLowerCase().includes(s));
      const matchStatus =
        statusFilter ==="all" ||
        (statusFilter ==="approved" && c.approved) ||
        (statusFilter ==="pending" && !c.approved);
      const matchCategory =
        categoryFilter ==="all" || categoryStr.includes(categoryFilter);
      const matchAuthor =
        authorFilter ==="all" || c.author === authorFilter;
      return matchSearch && matchStatus && matchCategory && matchAuthor;
    });
  }, [courseContent, searchText, statusFilter, categoryFilter, authorFilter]);

  const isFilterActive =
    searchText !=="" || statusFilter !=="all" || categoryFilter !=="all" || authorFilter !=="all";

  const clearFilters = () => {
    setSearchText(""); setStatusFilter("all"); setCategoryFilter("all"); setAuthorFilter("all");
  };

  const uniqueCategories = useMemo(() => {
    const all: string[] = [];
    courseContent.forEach((c) => {
      if (Array.isArray(c.content_category)) all.push(...c.content_category);
      else if (c.content_category) all.push(c.content_category);
    });
    return [...new Set(all)];
  }, [courseContent]);

  const uniqueAuthors = useMemo(
    () => [...new Set(courseContent.map((c) => c.author).filter(Boolean))],
    [courseContent]
  );

  //  Open Add Modal 
  const openAddModal = () => {
    setModalMode("add");
    setEditingContent(null);
    setCreatingFor("admin");
    setTags([]);
    setTagInput("");
    setYoutubePreview("");
    setReadabilityScore("ok");
    setEditorContent("");
    setAutowriteResult(null);
    form.resetFields();
    form.setFieldsValue({ robots:"index, follow", content_type:"article", creatingFor:"admin" });
    setFormModalOpen(true);
  };

  //  Open Edit Modal
  const openEditModal = (content: CourseContent) => {
    setModalMode("edit");
    setEditingContent(content);
    setAutowriteResult(null);

    const category = Array.isArray(content.content_category)
      ? content.content_category
      : content.content_category ? [content.content_category] : ["General"];

    const t = typeof content.createdBy ==="object" ? content.createdBy : null;
    const wasTeacher = !!t?.tname;
    setCreatingFor(wasTeacher ?"teacher" :"admin");

    const initialTags = content.tags || [];
    setTags(initialTags);
    setYoutubePreview(content.youtube_url ||"");
    setReadabilityScore(content.seo?.readability_score ||"ok");
    setEditorContent(content.content ||"");

    form.setFieldsValue({
      content_subject: content.content_subject,
      content_category: category,
      content: content.content,
      youtube_url: content.youtube_url ||"",
      instagram_url: content.instagram_url ||"",
      content_type: content.content_type ||"article",
      creatingFor: wasTeacher ?"teacher" :"admin",
      assignedTeacher: wasTeacher ? t?._id : undefined,
      schema_image: mapToFileList(content.schema_image),
      featured_images: mapToFileList(content.featured_images || content.featured_image),
    });
    setFormModalOpen(true);
  };

  //  SEO helpers 
  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // SEO auto-generation removed
  };

  const handleDocImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const hide = message.loading("Importing Word document...", 0);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const resp = await axios.post(`${url}/editor/import-word`, fd);
      if (resp.data.html) {
        setEditorContent(resp.data.html);
        form.setFieldsValue({ content: resp.data.html });

        if (resp.data.firstImageUrl) {
          form.setFieldsValue({
            schema_image: [{
              uid: "-1",
              name: "extracted-cover.png",
              status: "done",
              url: buildFileUrl(resp.data.firstImageUrl),
            }]
          });
        }

        message.success("Document imported successfully!");
      }
    } catch {
      message.error("Failed to import document");
    } finally {
      hide();
      e.target.value ="";
    }
  };

  const handleContentChange = (html: string) => {
    setEditorContent(html);
    form.setFieldsValue({ content: html });
  };

  //  Tag helpers 
  const handleTagAdd = () => {
    const v = tagInput.trim();
    if (!v || tags.includes(v)) return;
    const next = [...tags, v];
    setTags(next);
    form.setFieldsValue({ tags: next });
    setTagInput("");
  };
  const handleTagRemove = (tag: string) => {
    const next = tags.filter((t) => t !== tag);
    setTags(next);
    form.setFieldsValue({ tags: next });
  };

  //  Form Submit 
  const onFinish = async (values: any) => {
    setFormSubmitting(true);
    try {
      const contentText = editorContent || values.content ||"";
      if (!contentText.trim()) { message.error("Content cannot be empty!"); setFormSubmitting(false); return; }

      // Determine author name from selected teacher or admin
      let authorName = loginUser?.aname ||"Admin";
      let createdByTeacherId: string | undefined;
      if (values.creatingFor ==="teacher" && values.assignedTeacher) {
        const t = teachers.find((t) => t._id === values.assignedTeacher);
        authorName = t?.tname ||"Teacher";
        createdByTeacherId = values.assignedTeacher;
      }

      const formData = new FormData();
      formData.append("content_subject", values.content_subject);
      formData.append("content_category", JSON.stringify(
        Array.isArray(values.content_category) ? values.content_category : [values.content_category]
      ));
      formData.append("content", contentText);
      formData.append("author", authorName);
      formData.append("content_type", values.content_type ||"article");
      formData.append("youtube_url", values.youtube_url ||"");
      formData.append("instagram_url", values.instagram_url ||"");
      formData.append("tags", JSON.stringify(tags));
      if (createdByTeacherId) {
        formData.append("createdBy", createdByTeacherId);
        formData.append("creatorRole","teacher");
      } else {
        formData.append("createdBy", loginUser?.id || loginUser?._id ||"");
        formData.append("creatorRole", getUserRole().toLowerCase());
      }

      if (values.schema_image?.[0]?.originFileObj) {
        formData.append("schema_image", values.schema_image[0].originFileObj);
      } else if (values.schema_image?.[0]?.url) {
        const relativeUrl = values.schema_image[0].url.replace(`${BASE_URL}/`, '').replace(`${url}/`, '');
        formData.append("schema_image", relativeUrl);
      }

      (values.featured_images || []).forEach((f: any) => {
        if (f.originFileObj) {
          formData.append("featured_images", f.originFileObj);
        } else if (f.url) {
          const relativeUrl = f.url.replace(`${BASE_URL}/`, '').replace(`${url}/`, '');
          formData.append("featured_images", relativeUrl);
        }
      });

      if (modalMode ==="edit" && editingContent) {
        await axios.put(`${url}/course/updateCourseContent/${editingContent._id}`, formData, {
          headers: { ...getAuthHeaders(),"Content-Type":"multipart/form-data" },
        });
        message.success(" Content updated successfully!");
      } else {
        await axios.post(`${url}/course/createCourseContent`, formData, {
          headers: { ...getAuthHeaders(),"Content-Type":"multipart/form-data" },
        });
        const forWhom =
          values.creatingFor ==="teacher" && values.assignedTeacher
            ? `for ${teachers.find((t) => t._id === values.assignedTeacher)?.tname}`
            :"";
        message.success(` Content published ${forWhom}!`);
      }

      setFormModalOpen(false);
      form.resetFields();
      setTags([]);
      setEditingContent(null);
      fetchContents();
    } catch (err: any) {
      message.error(err.response?.data?.error ||" Error saving content");
    } finally {
      setFormSubmitting(false);
    }
  };

  //  Approve 
  const handleApprove = async (content: CourseContent) => {
    setActionLoading(content._id);
    try {
      const res = await axios.put(`${url}/course/courseContent/updateStatus/${content._id}`, {}, { headers: getAuthHeaders() });
      if (res.data.message) {
        message.success(`"${content.content_subject}" approved!`);
        setCourseContent((prev) =>
          prev.map((c) => c._id === content._id ? { ...c, approved: true } : c)
        );
        if (selectedContent?._id === content._id)
          setSelectedContent((prev) => prev ? { ...prev, approved: true } : prev);
      }
    } catch (err: any) {
      message.error(err.response?.data?.message ||"Failed to approve");
    } finally {
      setActionLoading(null);
    }
  };

  //  Revoke Approval 
  const handleRevokeApproval = async (content: CourseContent) => {
    setActionLoading(content._id);
    try {
      // Try dedicated unapprove endpoint first, fallback to generic status update
      await axios.put(`${url}/course/courseContent/updateStatus/${content._id}`, { approved: false }, { headers: getAuthHeaders() });
      message.success(`"${content.content_subject}" approval revoked`);
      setCourseContent((prev) =>
        prev.map((c) => c._id === content._id ? { ...c, approved: false } : c)
      );
      if (selectedContent?._id === content._id)
        setSelectedContent((prev) => prev ? { ...prev, approved: false } : prev);
    } catch (err: any) {
      message.error(err.response?.data?.message ||"Failed to revoke approval");
    } finally {
      setActionLoading(null);
    }
  };

  //  Delete 
  const handleDelete = async (content: CourseContent) => {
    setActionLoading(content._id);
    try {
      await axios.delete(`${url}/course/deleteCourseContent/${content._id}`, { headers: getAuthHeaders() });
      message.success(`"${content.content_subject}" deleted`);
      setCourseContent((prev) => prev.filter((c) => c._id !== content._id));
      if (selectedContent?._id === content._id) setDetailDrawerOpen(false);
    } catch (err: any) {
      message.error(err.response?.data?.message ||"Failed to delete");
    } finally {
      setActionLoading(null);
    }
  };

  //  Export 
  const handleExport = () => {
    const headers = ["Subject","Author","Status","Views","Tags","Created"];
    const rows = filteredContent.map((c) => [
      `"${c.content_subject}"`,
      `"${c.author}"`,
      c.approved ?"Approved" :"Pending",
      c.views || 0,
      `"${(c.tags || []).join(",")}"`,
      moment(c.createdAt).format("YYYY-MM-DD"),
    ].join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type:"text/csv" });
    const dl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = dl; a.download = `content-${moment().format("YYYY-MM-DD")}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    window.URL.revokeObjectURL(dl);
    message.success("Exported!");
  };

  //  Readability color 
  const readabilityColor = (score: string) =>
    score ==="good" ?"#52c41a" : score ==="ok" ?"#faad14" :"#ff4d4f";

  //  Table Columns 
  const columns = [
    {
      title:"Content",
      key:"info",
      width: 300,
      render: (_: any, record: CourseContent) => (
        <div style={{ display:"flex", alignItems:"flex-start", gap: 10 }}>
          {record.schema_image || record.featured_image || (record.featured_images && record.featured_images.length > 0) ? (
            <img
              src={buildFileUrl(record.schema_image || record.featured_image || (record.featured_images && record.featured_images[0]))}
              alt=""
              style={{ width: 44, height: 44, objectFit:"cover", borderRadius: 8, flexShrink: 0 }}
            />
          ) : (
            <div style={{
              width: 44, height: 44, borderRadius: 8, background:"#e6f4ff",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize: 18, color:"#1677ff", flexShrink: 0,
            }}>
              <FileTextOutlined />
            </div>
          )}
          <div>
            <Text
              strong
              style={{ fontSize: 13, color:"#1677ff", cursor:"pointer", display:"block" }}
              onClick={() => { setSelectedContent(record); setDetailDrawerOpen(true); }}
            >
              {record.content_subject}
            </Text>
            {/* Category hidden as requested */}
            {/*
            <Text type="secondary" style={{ fontSize: 11, display:"block" }}>
              {Array.isArray(record.content_category)
                ? record.content_category.slice(0, 2).join(",")
                : record.content_category}
            </Text>
            */}
            <div style={{ marginTop: 3 }}>
              {(record.tags || []).slice(0, 2).map((t) => (
                <Tag key={t} style={{ fontSize: 10, margin:"0 2px 2px 0" }}>{t}</Tag>
              ))}
              {(record.tags || []).length > 2 && (
                <Tag style={{ fontSize: 10 }}>+{record.tags!.length - 2}</Tag>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      title:"Author",
      key:"author",
      width: 150,
      render: (_: any, record: CourseContent) => {
        const creatorObj = typeof record.createdBy ==="object" ? record.createdBy : null;
        const isAdmin = !!creatorObj?.aname;
        const teacherObj = teachers.find((t) => t._id === creatorObj?._id);
        const studentObj = students.find((s) => s._id === creatorObj?._id);
        const isStudent = !isAdmin && !!studentObj && !teacherObj;
        const isTeacher = !isAdmin && !!teacherObj;
        return (
          <Space size={6}>
            <Avatar
              src={isTeacher ? teacherObj?.tprofile : studentObj?.avatar}
              icon={isAdmin ? <CrownOutlined /> : <UserOutlined />}
              size={26}
              style={{
                background: isAdmin ?"#1677ff" : isTeacher ?"#52c41a" :"#722ed1",
              }}
            />
            <div>
              <Text style={{ fontSize: 12, display:"block", fontWeight: 600 }}>{record.author}</Text>
              {isAdmin && (
                <Tag color="blue" style={{ fontSize: 10, padding:"0 4px", lineHeight:"16px", margin: 0 }}>
                  Admin
                </Tag>
              )}
              {isTeacher && (
                <Tag color="green" style={{ fontSize: 10, padding:"0 4px", lineHeight:"16px", margin: 0 }}>
                  Teacher
                </Tag>
              )}
              {isStudent && (
                <Tag color="purple" style={{ fontSize: 10, padding:"0 4px", lineHeight:"16px", margin: 0 }}>
                  Student
                </Tag>
              )}
            </div>
          </Space>
        );
      },
    },
    {
      title:"Status",
      key:"status",
      width: 110,
      render: (_: any, record: CourseContent) => (
        <Tag
          color={record.approved ?"success" :"warning"}
          icon={record.approved ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
          style={{ fontWeight: 600 }}
        >
          {record.approved ?"APPROVED" :"PENDING"}
        </Tag>
      ),
    },
    {
      title:"Views",
      key:"views",
      width: 75,
      align:"center" as const,
      render: (_: any, record: CourseContent) => (
        <Badge
          count={record.views || 0}
          showZero
          style={{ background: (record.views || 0) > 0 ?"#1677ff" :"#d9d9d9", boxShadow:"none" }}
        />
      ),
    },
    {
      title:"Type",
      key:"type",
      width: 90,
      render: (_: any, record: CourseContent) => (
        <Tag color="purple" style={{ fontSize: 10 }}>
          {record.content_type ||"article"}
        </Tag>
      ),
    },
    {
      title:"Created",
      key:"created",
      width: 100,
      render: (_: any, record: CourseContent) => (
        <Text style={{ fontSize: 11 }}>
          {record.createdAt ? moment(record.createdAt).format("DD MMM YY") :"N/A"}
        </Text>
      ),
    },
    {
      title:"Actions",
      key:"actions",
      width: 200,
      fixed:"right" as const,
      render: (_: any, record: CourseContent) => (
        <Space size={4} wrap>
          <Tooltip title="View Details">
            <Button type="text" icon={<EyeOutlined />} size="small"
              onClick={() => { setSelectedContent(record); setDetailDrawerOpen(true); }} />
          </Tooltip>

          <Tooltip title="Edit Content">
            <Button type="text" icon={<EditOutlined />} size="small"
              style={{ color:"#1677ff" }}
              onClick={() => openEditModal(record)} />
          </Tooltip>

          {/* Approve / Revoke (Admin Only) */}
          {getUserRole() ==="ADMIN" && (
            !record.approved ? (
              <Popconfirm
                title={`Approve"${record.content_subject}"?`}
                description="It will be visible to all students."
                onConfirm={() => handleApprove(record)}
                okText="Approve" cancelText="Cancel"
              >
                <Button
                  type="primary" size="small"
                  icon={<CheckCircleOutlined />}
                  loading={actionLoading === record._id}
                >
                  Approve
                </Button>
              </Popconfirm>
            ) : (
              <Popconfirm
                title={`Revoke approval for"${record.content_subject}"?`}
                onConfirm={() => handleRevokeApproval(record)}
                okText="Revoke" cancelText="Cancel" okType="danger"
              >
                <Button
                  size="small" danger
                  icon={<CloseCircleOutlined />}
                  loading={actionLoading === record._id}
                >
                  Revoke
                </Button>
              </Popconfirm>
            )
          )}

          <Popconfirm
            title={`Delete"${record.content_subject}"?`}
            description="This cannot be undone."
            onConfirm={() => handleDelete(record)}
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
      {getUserRole() ==="ADMIN" ? <Sidebar /> : <Sidebar2 />}
      <Layout>
        <Topbar />
        <Content style={{ margin:"20px 16px", padding: 24 }}>

          {/*  Header  */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom: 24, flexWrap:"wrap", gap: 12 }}>
            <div>
              <Title level={2} style={{ margin: 0, color:"#1677ff" }}>
                <FileTextOutlined style={{ marginRight: 10 }} />
                Course Content Management
              </Title>
              <Text type="secondary">
                Publish, edit, approve and manage content on behalf of teachers or as admin
              </Text>
            </div>
            <Space wrap>
              {getUserRole() ==="ADMIN" && (
                <>
                  <Button icon={<ReloadOutlined />} onClick={fetchContents} loading={loading}>Refresh</Button>
                  <Button icon={<ExportOutlined />} onClick={handleExport}>Export</Button>
                  <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal} style={{ background:"#1677ff" }}>
                    Publish Content
                  </Button>
                </>
              )}
            </Space>
          </div>

          {/*  Stats  */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {[
              { title:"Total Content", value: stats.total, icon: <BookOutlined />, color:"#1677ff", sub:"All published" },
              { title:"Approved", value: stats.approved, icon: <CheckCircleOutlined />, color:"#52c41a", sub: `${stats.pending} pending` },
              { title:"Pending Review", value: stats.pending, icon: <ClockCircleOutlined />, color:"#fa8c16", sub:"Awaiting approval" },
              { title:"Total Views", value: stats.totalViews, icon: <BarChartOutlined />, color:"#722ed1", sub:"Across all content" },
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

          {/*  Approval progress bar  */}
          <Card bordered={false} style={{ marginBottom: 16, borderRadius: 12, boxShadow:"0 2px 8px rgba(0,0,0,0.06)", padding:"8px 16px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom: 6 }}>
              <Text style={{ fontSize: 13 }}>Approval Progress</Text>
              <Text style={{ fontSize: 13, fontWeight: 600 }}>
                {stats.total ? Math.round((stats.approved / stats.total) * 100) : 0}% Approved
              </Text>
            </div>
            <Progress
              percent={stats.total ? Math.round((stats.approved / stats.total) * 100) : 0}
              strokeColor="#52c41a" trailColor="#fff7e6"
              showInfo={false} size="small"
            />
          </Card>

          {/*  Filters  */}
          <Card bordered={false} style={{ marginBottom: 16, borderRadius: 12, boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
            <Row gutter={[12, 12]} align="middle">
              <Col xs={24} sm={8} lg={6}>
                <Search
                  placeholder="Search subject, category, author, tags..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  prefix={<SearchOutlined style={{ color:"#bfbfbf" }} />}
                />
              </Col>
              <Col xs={12} sm={4} lg={3}>
                <Select value={statusFilter} onChange={setStatusFilter} style={{ width:"100%" }}>
                  <Option value="all">All Status</Option>
                  <Option value="approved">Approved</Option>
                  <Option value="pending">Pending</Option>
                </Select>
              </Col>
              {/* Hide category filter as requested */}
              {/*
              <Col xs={12} sm={4} lg={4}>
                <Select value={categoryFilter} onChange={setCategoryFilter} style={{ width:"100%" }} showSearch optionFilterProp="children">
                  <Option value="all">All Categories</Option>
                  {uniqueCategories.map((c) => <Option key={c} value={c}>{c}</Option>)}
                </Select>
              </Col>
              */}
              <Col xs={12} sm={4} lg={4}>
                <Select value={authorFilter} onChange={setAuthorFilter} style={{ width:"100%" }} showSearch optionFilterProp="children">
                  <Option value="all">All Authors</Option>
                  {uniqueAuthors.map((a) => <Option key={a} value={a}>{a}</Option>)}
                </Select>
              </Col>
              <Col xs={12} sm={4} lg={3}>
                <Button icon={<FilterOutlined />} onClick={clearFilters} disabled={!isFilterActive} block>Clear</Button>
              </Col>
            </Row>
          </Card>

          {isFilterActive && (
            <Alert
              message={`Showing ${filteredContent.length} of ${courseContent.length} content items`}
              type="info" showIcon closable={false}
              style={{ marginBottom: 12, borderRadius: 8 }}
            />
          )}

          {/*  Table  */}
          <Card
            title={
              <Space>
                <FileTextOutlined style={{ color:"#1677ff" }} />
                <Text strong>Content List</Text>
                <Badge count={filteredContent.length} style={{ background:"#1677ff" }} showZero />
                {stats.pending > 0 && (
                  <Badge count={stats.pending} style={{ background:"#fa8c16" }}>
                    <Tag color="warning">Pending Review</Tag>
                  </Badge>
                )}
              </Space>
            }
            bordered={false}
            style={{ borderRadius: 12, boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}
          >
            <Table
              rowKey="_id"
              columns={columns}
              dataSource={filteredContent}
              loading={loading}
              bordered={false}
              scroll={{ x: 1200 }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                pageSizeOptions: ["10","20","50"],
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
              }}
              size="small"
              locale={{
                emptyText: loading ?"Loading..." : (
                  <Empty description="No content found" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                    <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
                      Publish First Content
                    </Button>
                  </Empty>
                ),
              }}
            />
          </Card>

          {/* 
              PUBLISH / EDIT CONTENT MODAL
           */}
          <Modal
            title={
              <Space>
                {modalMode ==="add" ? <PlusOutlined style={{ color:"#1677ff" }} /> : <EditOutlined style={{ color:"#fa8c16" }} />}
                <Text strong style={{ fontSize: 16 }}>
                  {modalMode ==="add" ?"Publish New Content" : `Edit: ${editingContent?.content_subject}`}
                </Text>
              </Space>
            }
            open={formModalOpen}
            onCancel={() => { setFormModalOpen(false); form.resetFields(); setEditingContent(null); setTags([]); }}
            width={900}
            footer={
              <div style={{ display:"flex", justifyContent:"flex-end" }}>
                {/* 
                <Space>
                  <Text type="secondary" style={{ fontSize: 12 }}>Auto SEO</Text>
                  <Switch checked={autoGenerateSEO} onChange={setAutoGenerateSEO} size="small" checkedChildren="On" unCheckedChildren="Off" />
                </Space>
                */}
                <Space>
                  <Button onClick={() => { setFormModalOpen(false); form.resetFields(); setTags([]); }}>Cancel</Button>
                  <Button
                    type="primary"
                    icon={modalMode ==="add" ? <PlusOutlined /> : <SaveOutlined />}
                    loading={formSubmitting}
                    onClick={() => form.submit()}
                  >
                    {modalMode ==="add" ?"Publish Content" :"Save Changes"}
                  </Button>
                </Space>
              </div>
            }
            destroyOnClose
            styles={{ body: { padding:"16px 24px", maxHeight:"72vh", overflowY:"auto" } }}
          >
            <Form form={form} layout="vertical" onFinish={onFinish}
              initialValues={{ robots:"index, follow", content_type:"article", creatingFor:"admin", content_category: ["General"] }}
            >
              {/*  WHO IS THIS FOR?  */}
              <div style={{
                background:"linear-gradient(135deg, #e6f4ff, #f0f5ff)",
                border:"1.5px solid #91caff",
                borderRadius: 10, padding:"16px 18px", marginBottom: 20,
              }}>
                <Text strong style={{ display:"block", marginBottom: 12, fontSize: 14, color:"#1677ff" }}>
                  <TeamOutlined style={{ marginRight: 6 }} />
                  Publishing this content for:
                </Text>
                <Form.Item name="creatingFor" style={{ marginBottom: 12 }}>
                  <Radio.Group
                    buttonStyle="solid"
                    onChange={(e) => {
                      setCreatingFor(e.target.value);
                      if (e.target.value ==="admin") form.setFieldValue("assignedTeacher", undefined);
                    }}
                  >
                    <Radio.Button value="admin"><CrownOutlined style={{ marginRight: 4 }} />Admin (Me)</Radio.Button>
                    <Radio.Button value="teacher"><TeamOutlined style={{ marginRight: 4 }} />Specific Teacher</Radio.Button>
                  </Radio.Group>
                </Form.Item>

                {creatingFor ==="teacher" ? (
                  <Form.Item
                    name="assignedTeacher"
                    label={<Text strong>Select Teacher</Text>}
                    rules={[{ required: true, message:"Please select a teacher" }]}
                    style={{ marginBottom: 0 }}
                    extra="Content will be attributed to this teacher"
                  >
                    <Select
                      placeholder="Search teacher..."
                      showSearch loading={teachersLoading}
                      optionFilterProp="label"
                      filterOption={(input, option) => String(option?.label).toLowerCase().includes(input.toLowerCase())}
                      optionLabelProp="label"
                      size="large"
                    >
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
                  <Alert message="Content will be published under Admin account." type="info" showIcon style={{ marginBottom: 0 }} />
                )}
              </div>

              <Divider style={{ margin:"0 0 16px" }} />

              {/*  CONTENT DETAILS  */}
              <Row gutter={12}>
                <Col span={14}>
                  <Form.Item label="Subject / Title" name="content_subject" rules={[{ required: true }]}>
                    <Input placeholder="e.g., React Hooks Complete Guide" onChange={handleSubjectChange} />
                  </Form.Item>
                </Col>
                <Col span={10}>
                  <Form.Item label="Content Type" name="content_type">
                    <Select>
                      <Option value="article">Article</Option>
                      <Option value="tutorial">Tutorial</Option>
                      <Option value="guide">Guide</Option>
                      <Option value="news">News</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              {/*
              <Form.Item
                label="Category"
                name="content_category"
                rules={[{ required: true, message:"Please select a category" }]}
                extra="Select one or more categories, or type a new one"
              >
                <Select mode="tags" showSearch placeholder="Select or type category" optionFilterProp="children">
                  {CATEGORY_OPTIONS.map((c) => <Option key={c} value={c}>{c}</Option>)}
                </Select>
              </Form.Item>
              */}

              {/* Images */}
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item
                    label={<Space><FileTextOutlined />Schema / Thumbnail Image (1) [1550x650]</Space>}
                    name="schema_image"
                    valuePropName="fileList"
                    getValueFromEvent={getFileValue}
                  >
                    <Upload
                      name="schema_image"
                      listType="picture-card"
                      beforeUpload={async (file) => {
                        const isValid = await validateImageDimensions(file, 1550, 650);
                        return isValid ? false : Upload.LIST_IGNORE;
                      }}
                      maxCount={1}
                      accept="image/*"
                    >
                      <div><UploadOutlined /><div style={{ marginTop: 6 }}>Upload</div></div>
                    </Upload>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<Space><FileTextOutlined />Featured Gallery Images (Max 5) [1550x650]</Space>}
                    name="featured_images"
                    valuePropName="fileList"
                    getValueFromEvent={getFileValue}
                  >
                    <Upload
                      name="featured_images"
                      listType="picture-card"
                      multiple
                      beforeUpload={async (file) => {
                        const isValid = await validateImageDimensions(file, 1550, 650);
                        return isValid ? false : Upload.LIST_IGNORE;
                      }}
                      maxCount={5}
                      accept="image/*"
                    >
                      <div><UploadOutlined /><div style={{ marginTop: 6 }}>Upload</div></div>
                    </Upload>
                  </Form.Item>
                </Col>
              </Row>

              {/* Word Import */}
              <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <Button
                  icon={<FileTextOutlined />}
                  onClick={() => document.getElementById("adminWordImport")?.click()}
                  style={{ borderRadius: 8 }}
                >
                  Import Word (.docx)
                </Button>
                <input
                  id="adminWordImport"
                  type="file"
                  accept=".docx"
                  hidden
                  onChange={handleDocImport}
                />
                <Button
                  icon={<RobotOutlined />}
                  onClick={() => setAutowriteOpen(true)}
                  style={{
                    borderRadius: 8,
                    fontWeight: 700,
                    background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
                    border: "none",
                    color: "white",
                    boxShadow: "0 4px 14px rgba(139, 92, 246, 0.35)"
                  }}
                >
                  ✨ Auto-write with Copilot
                </Button>
                {autowriteResult && (
                  <Alert
                    type="success"
                    showIcon
                    style={{ flex: 1, minWidth: 240, borderRadius: 8 }}
                    message={
                      <Text strong>
                        {autowriteResult.isAiPowered ? "✨ Content generated" : "Content draft ready"}
                      </Text>
                    }
                    description={
                      <span>
                        <strong>{autowriteResult.title}</strong>
                        {autowriteResult.snippet && <> — {autowriteResult.snippet}{autowriteResult.snippet.length >= 140 ? "…" : ""}</>}
                        <Text type="secondary" style={{ marginLeft: 8 }}>· Review and click Publish Content to post.</Text>
                      </span>
                    }
                    closable
                    onClose={() => setAutowriteResult(null)}
                  />
                )}
              </div>

              {/* Main Content */}
              <Form.Item
                label={
                  <Space>
                    Main Content
                    <Text style={{ color: readabilityColor(readabilityScore), fontSize: 11 }}>
                      Readability: {readabilityScore.toUpperCase()}
                    </Text>
                  </Space>
                }
                name="content"
                rules={[{ required: true, message:"Content cannot be empty" }]}
              >
                <CkEditor
                  value={editorContent}
                  onChange={handleContentChange}
                />
              </Form.Item>

              {/* Media Embeds */}
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item name="youtube_url" label={<Space><YoutubeOutlined />YouTube URL</Space>}>
                    <Input
                      placeholder="https://youtube.com/watch?v=..."
                      onChange={(e) => setYoutubePreview(e.target.value)}
                    />
                  </Form.Item>
                  {youtubePreview && (
                    <div style={{ marginBottom: 16 }}>
                      <iframe width="100%" height="180" src={getYouTubeEmbedUrl(youtubePreview)}
                        frameBorder="0" allowFullScreen title="YT Preview" style={{ borderRadius: 8 }} />
                    </div>
                  )}
                </Col>
                <Col span={12}>
                  <Form.Item name="instagram_url" label={<Space><InstagramOutlined />Instagram URL</Space>}>
                    <Input placeholder="https://instagram.com/p/..." />
                  </Form.Item>
                </Col>
              </Row>

              {/* Tags */}
              <Form.Item label={<Space><TagsOutlined />Tags</Space>}>
                <Space direction="vertical" style={{ width:"100%" }}>
                  <Space>
                    <Input
                      placeholder="Add tag..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onPressEnter={handleTagAdd}
                      style={{ width: 220 }}
                    />
                    <Button onClick={handleTagAdd} icon={<PlusOutlined />}>Add</Button>
                  </Space>
                  <div>
                    {tags.map((tag) => (
                      <Tag key={tag} closable onClose={() => handleTagRemove(tag)} style={{ marginBottom: 6 }}>
                        {tag}
                      </Tag>
                    ))}
                  </div>
                </Space>
              </Form.Item>

              {/* SEO Settings Panel Hidden as requested */}
              {/*
              <Collapse ghost accordion style={{ marginTop: 16 }}>
                <Collapse.Panel
                  header={
                    <div style={{ display:'flex', justifyContent:'space-between', width:'95%' }}>
                      <Space><GlobalOutlined style={{ color:'#1677ff' }} /><strong>Search Engine Optimization (SEO)</strong></Space>
                      <div onClick={e => e.stopPropagation()}>
                        <Switch checked={autoGenerateSEO} onChange={setAutoGenerateSEO} checkedChildren="Auto" unCheckedChildren="Manual" size="small" />
                      </div>
                    </div>
                  }
                  key="seo"
                >
                  <Card size="small" style={{ borderRadius: 12, border:'1px dashed #1677ff' }}>
                    <Row gutter={12}>
                      <Col span={12}>
                        <Form.Item label="SEO Title" name="seo_title" rules={[{ max: 60 }]}>
                          <Input showCount maxLength={60} disabled={autoGenerateSEO} placeholder="Auto-generated if empty" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="URL Slug" name="slug">
                          <Input prefix="/" disabled={autoGenerateSEO} placeholder="Auto-generated URL" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={12}>
                      <Col span={12}>
                        <Form.Item label="Meta Keywords" name="meta_keywords">
                          <Input placeholder="keyword1, keyword2" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Focus Keyword" name="focus_keyword">
                          <Input />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item label="Meta Description" name="meta_description" rules={[{ max: 160 }]}>
                      <TextArea rows={2} showCount maxLength={160} disabled={autoGenerateSEO} placeholder="Auto-generated from content preview" />
                    </Form.Item>

                    <Row gutter={12}>
                      <Col span={8}>
                        <Form.Item label="Robots" name="robots">
                          <Select>
                            <Option value="index, follow">Index, Follow</Option>
                            <Option value="noindex, nofollow">No Index</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item label="Readability" name="readability_score">
                          <Select value={readabilityScore} onChange={setReadabilityScore}>
                            <Option value="good"><span style={{ color:"#52c41a" }}> Good</span></Option>
                            <Option value="ok"><span style={{ color:"#faad14" }}> OK</span></Option>
                            <Option value="poor"><span style={{ color:"#ff4d4f" }}> Poor</span></Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item label="OG Title" name="og_title">
                          <Input maxLength={60} />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item label="Canonical URL" name="canonical_url">
                      <Input placeholder="https://yoursite.com/content/slug" />
                    </Form.Item>

                    <Form.Item label="Schema Markup (JSON-LD)" name="schema_markup">
                      <TextArea rows={3} placeholder='{"@context":"https://schema.org", ...}' />
                    </Form.Item>
                  </Card>
                </Collapse.Panel>
              </Collapse>
              */}
            </Form>
          </Modal>

          {/* 
              CONTENT DETAIL DRAWER
           */}
          <Drawer
            title={
              <Space>
                <FileTextOutlined style={{ color:"#1677ff" }} />
                Content Details
              </Space>
            }
            placement="right"
            width={640}
            onClose={() => setDetailDrawerOpen(false)}
            open={detailDrawerOpen}
            extra={
              selectedContent && (
                <Space>
                  <Button icon={<EditOutlined />} size="small"
                    onClick={() => { setDetailDrawerOpen(false); openEditModal(selectedContent); }}>
                    Edit
                  </Button>
                  {!selectedContent.approved && (
                    <Popconfirm
                      title="Approve this content?"
                      onConfirm={() => handleApprove(selectedContent)}
                      okText="Approve" cancelText="Cancel"
                    >
                      <Button type="primary" icon={<CheckCircleOutlined />} size="small"
                        loading={actionLoading === selectedContent._id}>
                        Approve
                      </Button>
                    </Popconfirm>
                  )}
                </Space>
              )
            }
          >
            {selectedContent && (() => {
              const creatorObj = typeof selectedContent.createdBy ==="object" ? selectedContent.createdBy : null;
              const isAdmin = !!creatorObj?.aname;
              const teacherObj = teachers.find((t) => t._id === creatorObj?._id);
              const studentObj = students.find((s) => s._id === creatorObj?._id);
              const isStudent = !isAdmin && !!studentObj && !teacherObj;
              const isTeacher = !isAdmin && !!teacherObj;
              const authorBg = isAdmin ?"#e6f4ff" : isTeacher ?"#f6ffed" :"#f9f0ff";
              const authorBorder = isAdmin ?"#91caff" : isTeacher ?"#b7eb8f" :"#d3adf7";
              const category = Array.isArray(selectedContent.content_category)
                ? selectedContent.content_category.join(",")
                : selectedContent.content_category;
              return (
                <div>
                  {/* Cover image */}
                  {(selectedContent.schema_image || selectedContent.featured_image || (selectedContent.featured_images && selectedContent.featured_images.length > 0)) && (
                    <img
                      src={buildFileUrl(selectedContent.schema_image || selectedContent.featured_image || (selectedContent.featured_images && selectedContent.featured_images[0]))}
                      alt=""
                      style={{ width:"100%", height: 160, objectFit:"cover", borderRadius: 10, marginBottom: 16 }}
                    />
                  )}

                  {/* Status + title */}
                  <div style={{ marginBottom: 16 }}>
                    <Tag
                      color={selectedContent.approved ?"success" :"warning"}
                      icon={selectedContent.approved ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                      style={{ marginBottom: 8, fontWeight: 600 }}
                    >
                      {selectedContent.approved ?"APPROVED" :"PENDING REVIEW"}
                    </Tag>
                    <Title level={4} style={{ margin: 0 }}>{selectedContent.content_subject}</Title>
                    {/* <Text type="secondary">{category}</Text> */}
                  </div>

                  {/* Author panel */}
                  <div style={{
                    background: authorBg,
                    border: `1px solid ${authorBorder}`,
                    borderRadius: 8, padding:"12px 16px", marginBottom: 16,
                    display:"flex", alignItems:"center", gap: 12,
                  }}>
                    <Avatar
                      src={isTeacher ? teacherObj?.tprofile : studentObj?.avatar}
                      icon={isAdmin ? <CrownOutlined /> : <UserOutlined />}
                      size={36}
                      style={{ background: isAdmin ?"#1677ff" : isTeacher ?"#52c41a" :"#722ed1" }}
                    />
                    <div>
                      <Text type="secondary" style={{ fontSize: 11 }}>Published by</Text>
                      <Text strong style={{ display:"block" }}>{selectedContent.author}</Text>
                      {isAdmin && <Tag color="blue" style={{ fontSize: 11, margin: 0 }}>Admin</Tag>}
                      {isTeacher && <Tag color="green" style={{ fontSize: 11, margin: 0 }}>Teacher</Tag>}
                      {isStudent && <Tag color="purple" style={{ fontSize: 11, margin: 0 }}>Student</Tag>}
                      {isTeacher && teacherObj?.tspecialization && (
                        <Text type="secondary" style={{ fontSize: 11, display:"block" }}>{teacherObj.tspecialization}</Text>
                      )}
                      {isStudent && studentObj?.email && (
                        <Text type="secondary" style={{ fontSize: 11, display:"block" }}>{studentObj.email}</Text>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <Descriptions column={2} bordered size="small">
                    <Descriptions.Item label="Type">
                      <Tag color="purple">{selectedContent.content_type ||"article"}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Views">{selectedContent.views || 0}</Descriptions.Item>
                    <Descriptions.Item label="Created" span={2}>
                      {selectedContent.createdAt ? moment(selectedContent.createdAt).format("LLLL") :"N/A"}
                    </Descriptions.Item>
                    {/* SEO Details Hidden as requested */}
                    {/*
                    {selectedContent.seo?.slug && (
                      <Descriptions.Item label="Slug" span={2}>
                        <Text copyable>/{selectedContent.seo.slug}</Text>
                      </Descriptions.Item>
                    )}
                    {selectedContent.seo?.seo_title && (
                      <Descriptions.Item label="SEO Title" span={2}>{selectedContent.seo.seo_title}</Descriptions.Item>
                    )}
                    {selectedContent.seo?.meta_description && (
                      <Descriptions.Item label="Meta Desc" span={2}>{selectedContent.seo.meta_description}</Descriptions.Item>
                    )}
                    {selectedContent.seo?.focus_keyword && (
                      <Descriptions.Item label="Focus KW">{selectedContent.seo.focus_keyword}</Descriptions.Item>
                    )}
                    {selectedContent.seo?.readability_score && (
                      <Descriptions.Item label="Readability">
                        <Tag color={selectedContent.seo.readability_score ==="good" ?"success" : selectedContent.seo.readability_score ==="ok" ?"warning" :"error"}>
                          {selectedContent.seo.readability_score}
                        </Tag>
                      </Descriptions.Item>
                    )}
                    */}
                    {selectedContent.youtube_url && (
                      <Descriptions.Item label="YouTube" span={2}>
                        <a href={selectedContent.youtube_url} target="_blank" rel="noreferrer">
                          <YoutubeOutlined style={{ color:"#ff0000", marginRight: 4 }} />
                          Watch Video
                        </a>
                      </Descriptions.Item>
                    )}
                  </Descriptions>

                  {/* Tags */}
                  {selectedContent.tags && selectedContent.tags.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                      <Text strong style={{ display:"block", marginBottom: 8 }}>
                        <TagsOutlined style={{ marginRight: 6 }} />Tags
                      </Text>
                      {selectedContent.tags.map((t) => (
                        <Tag key={t} color="blue" style={{ marginBottom: 4 }}>{t}</Tag>
                      ))}
                    </div>
                  )}

                  {/* Content preview */}
                  <Divider />
                  <Text strong style={{ display:"block", marginBottom: 8 }}>Content Preview</Text>
                  <div
                    style={{
                      maxHeight: 200, overflowY:"auto", background:"#fafafa",
                      border:"1px solid #f0f0f0", borderRadius: 8, padding: 12,
                      fontSize: 13, lineHeight: 1.7,
                    }}
                    dangerouslySetInnerHTML={{ __html: selectedContent.content ||"" }}
                  />

                  <Divider />
                  <Space wrap>
                    {selectedContent.approved ? (
                      <Popconfirm
                        title="Revoke approval for this content?"
                        onConfirm={() => handleRevokeApproval(selectedContent)}
                        okText="Revoke" cancelText="Cancel" okType="danger"
                      >
                        <Button danger icon={<CloseCircleOutlined />} loading={actionLoading === selectedContent._id}>
                          Revoke Approval
                        </Button>
                      </Popconfirm>
                    ) : (
                      <Popconfirm
                        title="Approve this content?"
                        onConfirm={() => handleApprove(selectedContent)}
                        okText="Approve" cancelText="Cancel"
                      >
                        <Button type="primary" icon={<CheckCircleOutlined />} loading={actionLoading === selectedContent._id}>
                          Approve Content
                        </Button>
                      </Popconfirm>
                    )}

                    <Popconfirm
                      title="Delete this content?" description="Cannot be undone."
                      onConfirm={() => handleDelete(selectedContent)}
                      okText="Delete" cancelText="Cancel" okType="danger"
                    >
                      <Button danger icon={<DeleteOutlined />} loading={actionLoading === selectedContent._id}>
                        Delete
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
      <ContentCopilotWidget mode="course" />

      {/* ✨ Auto-write with Copilot dialog */}
      <Modal
        title={
          <Space>
            <RobotOutlined style={{ color: "#8b5cf6" }} />
            <Text strong>Auto-write with Copilot</Text>
          </Space>
        }
        open={autowriteOpen}
        onCancel={() => !autowriteLoading && setAutowriteOpen(false)}
        width={560}
        footer={
          <Space>
            <Button onClick={() => setAutowriteOpen(false)} disabled={autowriteLoading}>Cancel</Button>
            <Button
              type="primary"
              icon={<RobotOutlined />}
              loading={autowriteLoading}
              disabled={!autowriteTopic.trim()}
              onClick={handleAutowrite}
              style={{
                background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
                border: "none",
                fontWeight: 700,
                boxShadow: "0 4px 14px rgba(139, 92, 246, 0.35)"
              }}
            >
              {autowriteLoading ? "Generating..." : "Generate Content"}
            </Button>
          </Space>
        }
        destroyOnClose
      >
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div>
            <Text strong style={{ display: "block", marginBottom: 6 }}>What should the content be about?</Text>
            <Input.TextArea
              autoFocus
              rows={2}
              placeholder={creatingFor === "teacher"
                ? "e.g. A lesson on photosynthesis for Class 9 students"
                : "e.g. How to study for UPSC without coaching"}
              value={autowriteTopic}
              onChange={(e) => setAutowriteTopic(e.target.value)}
              disabled={autowriteLoading}
            />
          </div>

          <div>
            <Text strong style={{ display: "block", marginBottom: 6 }}>Language</Text>
            <Select
              value={autowriteLanguage}
              onChange={setAutowriteLanguage}
              style={{ width: "100%" }}
              disabled={autowriteLoading}
            >
              <Option value="english">English</Option>
              <Option value="hindi">Hindi (हिंदी)</Option>
            </Select>
          </div>

          <div>
            <Button
              type="link"
              size="small"
              onClick={() => setAutowriteAdvanced(v => !v)}
              style={{ padding: 0, fontWeight: 600 }}
              disabled={autowriteLoading}
            >
              {autowriteAdvanced ? "▾ Hide advanced options" : "▸ Show advanced options"}
            </Button>
          </div>

          {autowriteAdvanced && (
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              {creatingFor !== "teacher" && (
                <div>
                  <Text strong style={{ display: "block", marginBottom: 6 }}>Tone</Text>
                  <Select
                    value={autowriteTone}
                    onChange={setAutowriteTone}
                    style={{ width: "100%" }}
                    disabled={autowriteLoading}
                  >
                    <Option value="friendly">Friendly & conversational</Option>
                    <Option value="professional">Professional & authoritative</Option>
                    <Option value="casual">Casual & fun</Option>
                    <Option value="academic">Academic & research-based</Option>
                  </Select>
                </div>
              )}
              {creatingFor === "teacher" && (
                <Alert
                  type="info"
                  showIcon
                  message="Publishing for a teacher — tone will be set to Professional automatically."
                />
              )}
              <div>
                <Text strong style={{ display: "block", marginBottom: 6 }}>Length</Text>
                <Select
                  value={autowriteLength}
                  onChange={setAutowriteLength}
                  style={{ width: "100%" }}
                  disabled={autowriteLoading}
                >
                  <Option value="short">Short (~400 words)</Option>
                  <Option value="medium">Medium (~800 words)</Option>
                  <Option value="long">Long (~1200 words)</Option>
                </Select>
              </div>
              <div>
                <Text strong style={{ display: "block", marginBottom: 6 }}>Target audience (optional)</Text>
                <Input
                  placeholder={creatingFor === "teacher" ? "e.g. Class 9 students, beginners" : "e.g. UPSC aspirants, working professionals"}
                  value={autowriteAudience}
                  onChange={(e) => setAutowriteAudience(e.target.value)}
                  disabled={autowriteLoading}
                />
              </div>
            </Space>
          )}

          <Alert
            type="info"
            showIcon
            message="What I'll do"
            description={creatingFor === "teacher"
              ? "I'll generate a teacher-grade lesson with title, structured sections, tags, and SEO-ready meta — editable before publishing."
              : "I'll generate a blog-grade article with title, content sections, tags, and SEO-friendly meta — editable before publishing."
            }
            style={{ borderRadius: 8 }}
          />
        </Space>
      </Modal>
    </Layout>
  );
};

export default ManageCoursesContent;