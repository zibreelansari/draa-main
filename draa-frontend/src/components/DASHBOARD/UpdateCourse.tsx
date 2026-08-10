import { useEffect, useState, useCallback } from"react";
import {
  Layout,
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  Upload,
  Space,
  Divider,
  Typography,
  message,
  Card,
  Row,
  Col,
  Switch,
  Alert,
  Tag,
  Tabs,
  Spin,
  Modal,
  Popconfirm,
} from "antd";
import {
  UploadOutlined,
  PlusOutlined,
  VideoCameraOutlined,
  TagOutlined,
  UserOutlined,
  FileTextOutlined,
  BookOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  CopyOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  StarOutlined,
  MinusCircleOutlined,
  QuestionCircleOutlined,
  FilePdfOutlined,
  UserSwitchOutlined,
  SearchOutlined,
  DeleteOutlined,
  SaveOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from"react-router-dom";
import axios from"axios";
import Sidebar from"./Sidebar";
import Sidebar2 from"./Sidebar2";
import Topbar from"./Topbar";
import url from "../../url";
import { getUserRole, getStoredUser, getAuthHeaders, redirectToLogin } from "../../utils/global_auth";
import toast from "../../utils/toast";

const { Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

interface Teacher {
  _id: string;
  tname: string;
}

interface CourseCategory {
  _id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  isActive: boolean;
  keywords?: string[];
}

// Helper to normalize a file path/string into an Ant Design fileList array
const normalizeFileToList = (filePath: any, uid: string): any[] => {
  if (!filePath) return [];

  // If it's already an array of Ant Design file objects
  if (Array.isArray(filePath) && filePath.length > 0 && filePath[0]?.uid) return filePath;

  // If it's a single string
  if (typeof filePath ==="string" && filePath.trim() !=="") {
    const clean = filePath.replace(/\\/g,"/");
    return [
      {
        uid,
        name: clean.split("/").pop() ||"file",
        status:"done",
        url: `${url}/${clean}`,
        existingPath: clean,
      },
    ];
  }

  // If it's an array (potentially of strings)
  if (Array.isArray(filePath)) {
    return filePath
      .map((item, index) => {
        if (typeof item ==="string" && item.trim() !=="") {
          const clean = item.replace(/\\/g,"/");
          return {
            uid: `${uid}-${index}`,
            name: clean.split("/").pop() ||"file",
            status:"done",
            url: `${url}/${clean}`,
            existingPath: clean,
          };
        }
        if (item && item.uid) return item;
        return null;
      })
      .filter(Boolean);
  }

  return [];
};

const UpdateCourse = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();

  const [loginUser, setLoginuser] = useState<{
    name?: string;
    tname?: string;
    aname?: string;
    id?: string;
    isVerified?: boolean;
    Status?: string;
  }>({});

  const [teachersName, setTeachersName] = useState<Teacher[]>([]);
  const [courseCategories, setCourseCategories] = useState<CourseCategory[]>([]);
  const [chapters, setChapters] = useState<number>(0);
  const [autoGenerateSEO, setAutoGenerateSEO] = useState(false);
  const [videoCount, setVideoCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState("basic");
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);

  // Draft System State
  const DRAFT_KEY = id ? `draa_course_draft_update_${id}` : "draa_course_draft_update";
  const [hasDraft, setHasDraft] = useState<boolean>(false);
  const [draftLastSaved, setDraftLastSaved] = useState<string | null>(null);

  // Save draft helper
  const saveDraft = useCallback((allValues?: any) => {
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

      localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
      setHasDraft(true);
      setDraftLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (e) {
      console.error("Failed to save edit draft:", e);
    }
  }, [form, chapters, videoCount, DRAFT_KEY]);

  // Clear draft helper
  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY);
    setHasDraft(false);
    setDraftLastSaved(null);
  }, [DRAFT_KEY]);

  // Discard draft handler
  const handleDiscardDraft = () => {
    clearDraft();
    toast.info("Draft Discarded", "Restored original course data.");
    window.location.reload();
  };

  //  AUTH CHECK 
  useEffect(() => {
    const role = getUserRole();
    if (role === "GUEST") {
      redirectToLogin(navigate, "Please login to continue");
      return;
    }
    if (role === "STUDENT") {
      message.error("Access denied. Admin or Teacher only.", 6);
      navigate("/student-dashboard");
      return;
    }

    const user = getStoredUser();
    if (!user) {
      redirectToLogin(navigate, "Session expired. Please login again.");
      return;
    }

    if (role === "TEACHER") {
      if (user.isVerified !== true) {
        message.error("Your account is not verified yet.", 8);
        navigate("/teacher-dashboard");
        return;
      }
      if (user.Status !== "approved") {
        message.error("Your account is not approved yet.", 8);
        navigate("/teacher-dashboard");
        return;
      }
    }

    setLoginuser(user);
  }, [navigate]);

  //  FETCH TEACHERS 
  useEffect(() => {
    fetch(`${url}/allteachersName`, {
      headers: {
        ...getAuthHeaders()
      }
    })
      .then((res) => res.json())
      .then((data) => setTeachersName(data.teachers || []))
      .catch((err) => console.error("Error fetching teachers:", err));
  }, []);

  //  FETCH CATEGORIES 
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${url}/course/categories?active=true`, {
          headers: {
            ...getAuthHeaders()
          }
        });
        const data = await response.json();
        setCourseCategories(data.data?.categories || data.categories || []);
      } catch (error) {
        message.error("Failed to load course categories");
      }
    };
    fetchCategories();
  }, []);

  //  FETCH COURSE & PREFILL 
  useEffect(() => {
    if (!id) return;
    axios
      .get(`${url}/course/courseDetails/${id}`, {
        headers: {
          ...getAuthHeaders()
        }
      })
      .then((res) => {
        const c = res.data.course;

        const chapterCount = c.chapters?.length || 0;
        const vidCount = c.youtube_links?.length || 0;

        setChapters(chapterCount);
        setVideoCount(vidCount);

        // Format chapters with pre-existing files
        const formattedChapters = (c.chapters || []).map((ch: any, i: number) => ({
          chapter_name: ch.chapter_name ||"",
          youtube_video: ch.youtube_video ||"",
          study_material: normalizeFileToList(ch.study_material, `sm-${i}`),
          practice_set: normalizeFileToList(ch.practice_set, `ps-${i}`),
          other_materials: [], // other_materials are complex; start fresh
        }));

        form.setFieldsValue({
          title: c.title,
          short_desc: c.short_desc,
          long_desc: c.long_desc,
          actual_price: c.actual_price,
          discounted_price: c.discounted_price,
          discount_percentage: c.discount_percentage,
          enrolled_count: c.enrolled_count,
          price: c.price,
          duration: c.duration,
          language: c.language,
          skill_level: c.skill_level,
          course_category: c.course_category,
          // c.teacher_id may be populated object {_id, tname} or plain string
          teacher_id: c.teacher_id?._id
            ? String(c.teacher_id._id)
            : c.teacher_id || loginUser.id ||"",

          coverphoto: normalizeFileToList(c.coverphoto,"cover-1"),
          syllabus: normalizeFileToList(c.syllabus,"syllabus-1"),

          youtube_links: c.youtube_links || [],
          videoCount: vidCount,

          chapters: formattedChapters,
          chapterCount: chapterCount,

          who_this_course_is_for:
            c.who_this_course_is_for?.length > 0
              ? c.who_this_course_is_for
              : [{ text:"" }],
          what_you_will_learn:
            c.what_you_will_learn?.length > 0
              ? c.what_you_will_learn
              : [{ text:"" }],
          course_features:
            c.course_features?.length > 0 ? c.course_features : [{ text:"" }],
          course_faqs:
            c.course_faqs?.length > 0
              ? c.course_faqs
              : [{ question:"", answer:"" }],

          seo_title: c.seo?.seo_title,
          meta_keywords: c.seo?.meta_keywords,
          meta_description: c.seo?.meta_description,
          slug: c.seo?.slug,
          og_title: c.seo?.og_title,
          og_description: c.seo?.og_description,
          canonical_url: c.seo?.canonical_url,
          robots: c.seo?.robots ||"index, follow",
          schema_markup: c.seo?.schema_markup,
        });

        // Check if there is an unsaved local edit draft for this course
        try {
          const saved = localStorage.getItem(DRAFT_KEY);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed && parsed.values) {
              form.setFieldsValue(parsed.values);
              if (typeof parsed.chapters === "number") setChapters(parsed.chapters);
              if (typeof parsed.videoCount === "number") setVideoCount(parsed.videoCount);
              setHasDraft(true);
              if (parsed.timestamp) {
                const dt = new Date(parsed.timestamp);
                setDraftLastSaved(dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
              }
              toast.info("Draft Restored", "Unsaved edits for this course were automatically restored from your last session.");
            }
          }
        } catch (e) {
          console.error("Failed to restore course edit draft:", e);
        }

        setIsInitialized(true);
        setLoading(false);
      })
      .catch((err) => {
        message.error("Failed to load course");
        setLoading(false);
        console.error(err);
      });
  }, [id, form, DRAFT_KEY]);

  // Auto-save draft on beforeunload (cut/reload/navigate)
  useEffect(() => {
    const handleBeforeUnload = () => {
      const vals = form.getFieldsValue(true);
      if (vals.title || vals.short_desc || vals.long_desc || (vals.chapters && vals.chapters.length > 0)) {
        saveDraft(vals);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [form, saveDraft]);

  //  CHAPTER SYNC (mirror AddCourse logic) 
  useEffect(() => {
    if (!isInitialized) return;

    const existingChapters: any[] = form.getFieldValue("chapters") || [];
    if (chapters > existingChapters.length) {
      const newChapters = [
        ...existingChapters,
        ...Array(chapters - existingChapters.length).fill({
          chapter_name:"",
          youtube_video:"",
          study_material: [],
          practice_set: [],
          other_materials: [],
        }),
      ];
      form.setFieldsValue({ chapters: newChapters });
    } else if (chapters < existingChapters.length) {
      form.setFieldsValue({ chapters: existingChapters.slice(0, chapters) });
    }
  }, [chapters, isInitialized]);

  //  SEO HANDLERS 
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
      meta_description: desc.length > 160 ? desc.substring(0, 157) +"..." : desc,
      og_description: desc.length > 160 ? desc.substring(0, 157) +"..." : desc,
    });
  };

  //  FILE HELPERS 
  const getFileValue = (e: any): any => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };

  const allowedSyllabusTypes = [
"application/pdf",
"application/msword",
"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const beforeUploadSyllabus = (file: File): boolean | typeof Upload.LIST_IGNORE => {
    const isAllowed = allowedSyllabusTypes.includes(file.type);
    if (!isAllowed)
      message.error(`Syllabus must be PDF, DOC, or DOCX. ${file.name} is not allowed.`);
    return isAllowed ? false : Upload.LIST_IGNORE;
  };

  const beforeUploadStudy = (file: File): boolean | typeof Upload.LIST_IGNORE => {
    const allowedTypes = [
"application/pdf",
"application/msword",
"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
"application/vnd.ms-powerpoint",
"application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ];
    const isAllowed = allowedTypes.includes(file.type);
    if (!isAllowed) message.error(`${file.name} is not a valid file type.`);
    return isAllowed ? false : Upload.LIST_IGNORE;
  };

  //  SUBMIT 
  const onFinish = async (values: any) => {
    try {
      const formData = new FormData();

      // Basic
      formData.append("title", values.title);
      formData.append("short_desc", values.short_desc);
      formData.append("long_desc", values.long_desc);
      formData.append("actual_price", values.actual_price?.toString() ||"0");
      formData.append("discounted_price", values.discounted_price?.toString() ||"0");
      formData.append("discount_percentage", values.discount_percentage?.toString() ||"0");
      formData.append("enrolled_count", values.enrolled_count?.toString() ||"0");
      formData.append("price", values.discounted_price?.toString() ||"0");
      // teacher_id from MongoDB may be a populated object {_id, tname} or plain string.
      // Normalize to plain string ID across all cases.
      const extractId = (val: any): string => {
        if (!val) return"";
        if (typeof val ==="object" && val._id) return String(val._id);
        const s = String(val);
        if (s ==="undefined" || s ==="[object Object]" || s ==="") return"";
        return s;
      };
      const resolvedTeacherId =
        extractId(values.teacher_id) ||
        extractId(form.getFieldValue("teacher_id")) ||
        extractId(loginUser.id) ||
"";
      if (!resolvedTeacherId) {
        message.error("Teacher ID is missing. Please refresh and try again.");
        return;
      }
      formData.append("teacher_id", resolvedTeacherId);

      // language & skill_level: form value  fallback to what's stored in form (pre-filled)
      // Using form.getFieldValue as extra safety net in case values doesn't capture tab fields
      const resolvedLanguage = values.language || form.getFieldValue("language");
      const resolvedSkillLevel = values.skill_level || form.getFieldValue("skill_level");
      const resolvedCategory = values.course_category || form.getFieldValue("course_category");
      const resolvedDuration = values.duration ?? form.getFieldValue("duration") ?? 0;

      if (!resolvedLanguage || resolvedLanguage ==="undefined") {
        message.error("Please select a Language in the Media & Basic tab.");
        setActiveTab("media");
        return;
      }
      if (!resolvedSkillLevel || resolvedSkillLevel ==="undefined") {
        message.error("Please select a Skill Level in the Media & Basic tab.");
        setActiveTab("media");
        return;
      }

      formData.append("language", resolvedLanguage);
      formData.append("skill_level", resolvedSkillLevel);
      formData.append("course_category", resolvedCategory ||"");
      formData.append("duration", resolvedDuration.toString());

      // YouTube links
      formData.append("youtube_links", JSON.stringify(values.youtube_links || []));

      // Course details  truncate text fields to backend limits (200 chars)
      const truncate = (str: string, max: number) =>
        str && str.length > max ? str.substring(0, max) : str;

      const audienceData =
        values.who_this_course_is_for ??
        form.getFieldValue("who_this_course_is_for") ??
        [];

      const learningData =
        values.what_you_will_learn ??
        form.getFieldValue("what_you_will_learn") ??
        [];

      const featuresData =
        values.course_features ??
        form.getFieldValue("course_features") ??
        [];

      const faqData =
        values.course_faqs ??
        form.getFieldValue("course_faqs") ??
        [];

      const sanitizedAudience = audienceData.map((f: any) => ({
        text: truncate(f?.text ||"", 200),
      }));

      const sanitizedLearnings = learningData.map((f: any) => ({
        text: truncate(f?.text ||"", 200),
      }));

      const sanitizedFeatures = featuresData.map((f: any) => ({
        text: truncate(f?.text ||"", 200),
      }));

      const sanitizedFaqs = faqData.map((f: any) => ({
        question: truncate(f?.question ||"", 300),
        answer: truncate(f?.answer ||"", 1000),
      }));

      formData.append("who_this_course_is_for", JSON.stringify(sanitizedAudience));
      formData.append("what_you_will_learn", JSON.stringify(sanitizedLearnings));
      formData.append("course_features", JSON.stringify(sanitizedFeatures));
      formData.append("course_faqs", JSON.stringify(sanitizedFaqs));

      // Cover photo: only append if new file chosen
      if (values.coverphoto?.[0]?.originFileObj) {
        formData.append("coverphoto", values.coverphoto[0].originFileObj);
      } else if (values.coverphoto?.[0]?.existingPath) {
        formData.append("existing_coverphoto", values.coverphoto[0].existingPath);
      }

      // Syllabus: only append if new file chosen
      if (values.syllabus?.[0]?.originFileObj) {
        formData.append("syllabus", values.syllabus[0].originFileObj);
      } else if (values.syllabus?.[0]?.existingPath) {
        formData.append("existing_syllabus", values.syllabus[0].existingPath);
      }

      // SEO
      formData.append("seo_title", values.seo_title ||"");
      formData.append("meta_keywords", values.meta_keywords ||"");
      formData.append("meta_description", values.meta_description ||"");
      formData.append("slug", values.slug ||"");
      formData.append("og_title", values.og_title || values.seo_title ||"");
      formData.append("og_description", values.og_description || values.meta_description ||"");
      formData.append("canonical_url", values.canonical_url ||"");
      formData.append("robots", values.robots ||"index, follow");
      formData.append("schema_markup", values.schema_markup ||"");

      // Chapters - text data only first
      const chaptersTextOnly = (values.chapters || []).map((chapter: any) => {
        // Determine if study_material is existing or being replaced
        let studyMaterialExisting ="";
        if (!chapter.study_material?.[0]?.originFileObj && chapter.study_material?.[0]?.existingPath) {
          studyMaterialExisting = chapter.study_material[0].existingPath;
        }

        let practiceSetExisting ="";
        if (!chapter.practice_set?.[0]?.originFileObj && chapter.practice_set?.[0]?.existingPath) {
          practiceSetExisting = chapter.practice_set[0].existingPath;
        }

        // Handle existing other materials
        const otherMaterialsExisting = (chapter.other_materials || [])
          .filter((f: any) => !f.originFileObj && f.existingPath)
          .map((f: any) => f.existingPath);

        return {
          chapter_name: chapter.chapter_name,
          youtube_video: chapter.youtube_video,
          study_material_existing: studyMaterialExisting,
          practice_set_existing: practiceSetExisting,
          other_materials_existing: otherMaterialsExisting,
        };
      });

      formData.append("chapters", JSON.stringify(chaptersTextOnly));

      // Chapter files
      (values.chapters || []).forEach((chapter: any, index: number) => {
        if (chapter.study_material?.[0]?.originFileObj) {
          formData.append(
            `chapters[${index}][study_material]`,
            chapter.study_material[0].originFileObj
          );
        }
        if (chapter.practice_set?.[0]?.originFileObj) {
          formData.append(
            `chapters[${index}][practice_set]`,
            chapter.practice_set[0].originFileObj
          );
        }
        if (chapter.other_materials) {
          chapter.other_materials.forEach((file: any) => {
            if (file.originFileObj) {
              formData.append(`chapters[${index}][other_materials]`, file.originFileObj);
            }
          });
        }
      });      const cleanedYoutubeLinks = (values.youtube_links || []).filter((link: string) => link && typeof link === 'string' && link.trim() !== "");
      formData.append("youtube_links", JSON.stringify(cleanedYoutubeLinks));

      const res = await axios.put(`${url}/course/updateCourse/${id}`, formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          ...getAuthHeaders()
        },
      });

      clearDraft();
      toast.success("Course Updated", "Course updated successfully!");
      message.success("Course updated successfully!");

      if (loginUser.tname) {
        navigate("/teacher-dashboard");
      } else {
        navigate("/admin-dashboard");
      }
    } catch (err: any) {
      console.error(err);
      const rawMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to update course.";
      toast.error("Course Update Error", rawMsg);
      message.error(rawMsg, 8);
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

  //  LOADING 
  if (loading || !loginUser || Object.keys(loginUser).length === 0) {
    return (
      <Layout style={{ minHeight:"100vh" }}>
        <Content
          style={{ display:"flex", justifyContent:"center", alignItems:"center" }}
        >
          <Spin size="large" tip="Loading course data..." />
        </Content>
      </Layout>
    );
  }

  //  RENDER 
  return (
    <Layout style={{ minHeight:"100vh" }}>
      {"aname" in loginUser ? <Sidebar /> : <Sidebar2 />}
      <Layout>
        <Topbar />
        <Content style={{ margin:"24px 16px", padding: 24 }}>
          <div style={{ maxWidth: 1200, margin:"0 auto" }}>
            <Space
              style={{ width:"100%", justifyContent:"space-between", marginBottom: 24 }}
            >
              <Title level={2}> Update Course</Title>
              <Space>
                <Tag color="blue">
                  <BookOutlined /> {chapters} Chapters 
                  <VideoCameraOutlined /> {videoCount} Videos
                </Tag>
                <Button type="default" onClick={() => setIsPreviewModalVisible(true)}>
                   Preview
                </Button>
              </Space>
            </Space>

            {hasDraft && (
              <Alert
                message="Unsaved Edits Restored"
                description={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <span>
                      Your unsaved edits for this course are automatically saved as a draft. Last saved at <strong>{draftLastSaved || "recently"}</strong>.
                    </span>
                    <Space>
                      <Button size="small" type="primary" ghost icon={<SaveOutlined />} onClick={() => { saveDraft(); toast.success("Draft Saved", "Edit draft updated successfully."); }}>
                        Save Draft Now
                      </Button>
                      <Popconfirm
                        title="Discard unsaved edits?"
                        description="This will clear your draft and restore original course values."
                        onConfirm={handleDiscardDraft}
                        okText="Yes, Discard"
                        cancelText="Cancel"
                      >
                        <Button size="small" danger icon={<DeleteOutlined />}>
                          Discard Draft
                        </Button>
                      </Popconfirm>
                    </Space>
                  </div>
                }
                type="info"
                showIcon
                icon={<HistoryOutlined />}
                style={{ marginBottom: 24, borderRadius: 8 }}
              />
            )}

            {loginUser.tname && (
              <Alert
                message="Teacher Account Status"
                description={
                  <div>
                    <div> <strong>Verified:</strong> {loginUser.isVerified ?"Yes" :"No"}</div>
                    <div> <strong>Status:</strong> {loginUser.Status}</div>
                    <div> <strong>Categories Available:</strong> {courseCategories.length} categories</div>
                  </div>
                }
                type="success"
                showIcon
                style={{ marginBottom: 24 }}
              />
            )}

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              onValuesChange={(changed, all) => {
                saveDraft(all);
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
            >
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab as any}
                tabBarExtraContent={{
                  right: (
                    <Space>
                      <Switch
                        checked={autoGenerateSEO}
                        onChange={setAutoGenerateSEO}
                        checkedChildren="Auto SEO"
                        unCheckedChildren="Manual"
                        size="small"
                      />
                    </Space>
                  ),
                }}
              >
                {/*  TAB 1: BASIC  */}
                <TabPane tab=" Basic Information" key="basic">
                  <Card title="Course Information" style={{ marginBottom: 24 }}>
                    <Form.Item
                      label="Course Title"
                      name="title"
                      rules={[{ required: true }]}
                    >
                      <Input
                        placeholder="Enter course title"
                        onChange={handleTitleChange}
                      />
                    </Form.Item>

                    <Form.Item
                      label="Short Description"
                      name="short_desc"
                      rules={[{ required: true }]}
                    >
                      <Input
                        placeholder="Brief description of the course"
                        onChange={handleShortDescChange}
                      />
                    </Form.Item>

                    <Form.Item
                      label="Long Description"
                      name="long_desc"
                      rules={[{ required: true }]}
                    >
                      <TextArea rows={4} placeholder="Detailed course description" />
                    </Form.Item>

                    <Form.Item
                      label="Course Category"
                      name="course_category"
                      rules={[{ required: true, message:"Please select a course category" }]}
                    >
                      <Select
                        placeholder="Select course category"
                        showSearch
                        filterOption={(input, option) =>
                          (option?.children as any)?.props?.children?.[1]
                            ?.toLowerCase()
                            .includes(input.toLowerCase()) ||
                          (option?.value as string)?.toLowerCase().includes(input.toLowerCase())
                        }
                      >
                        {courseCategories.map((category) => (
                          <Select.Option key={category.name} value={category.name}>
                            <Space>
                              <i
                                className={category.icon}
                                style={{ color: category.color, fontSize:"16px" }}
                              />
                              {category.name}
                            </Space>
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Card title=" Course Syllabus" size="small" style={{ marginBottom: 16 }}>
                      <Form.Item
                        label={
                          <Space>
                            <FilePdfOutlined />
                            Syllabus Document (PDF, DOC, DOCX)
                          </Space>
                        }
                        name="syllabus"
                        valuePropName="fileList"
                        getValueFromEvent={getFileValue}
                        extra="Existing syllabus will be kept if you don't upload a new one."
                      >
                        <Upload
                          name="syllabus"
                          listType="picture"
                          beforeUpload={beforeUploadSyllabus}
                          maxCount={1}
                        >
                          <Button icon={<UploadOutlined />}>Choose Syllabus File</Button>
                        </Upload>
                      </Form.Item>
                    </Card>
                  </Card>
                </TabPane>

                {/*  TAB 2: PRICING  */}
                <TabPane tab=" Pricing" key="pricing">
                  <Card title="Pricing & Enrollment">
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item
                          label="Actual Price ()"
                          name="actual_price"
                          rules={[{ required: true }]}
                        >
                          <InputNumber
                            min={0}
                            style={{ width:"100%" }}
                            formatter={(value) =>
                              ` ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g,",")
                            }
                            parser={(value) => value!.replace(/\s?|(,*)/g,"")}
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
                            formatter={(value) =>
                              ` ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g,",")
                            }
                            parser={(value) => value!.replace(/\s?|(,*)/g,"")}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item label="Discount %" name="discount_percentage">
                          <InputNumber
                            min={0}
                            max={100}
                            style={{ width:"100%" }}
                            formatter={(value) => `${value}%`}
                            parser={(value) => value!.replace("%","")}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item
                      label="Enrolled Students"
                      name="enrolled_count"
                      tooltip="Current enrollment count"
                    >
                      <InputNumber min={0} style={{ width:"100%" }} placeholder="0" />
                    </Form.Item>
                  </Card>
                </TabPane>

                {/*  TAB 3: MEDIA & BASIC  */}
                <TabPane tab=" Media & Basic" key="media">
                  <Card title="Course Media & Settings">
                    <Form.Item
                      label="Cover Photo"
                      name="coverphoto"
                      valuePropName="fileList"
                      getValueFromEvent={getFileValue}
                      extra="Existing cover will be kept if you don't upload a new one."
                    >
                      <Upload
                        name="cover"
                        listType="picture"
                        beforeUpload={() => false}
                        maxCount={1}
                      >
                        <Button icon={<UploadOutlined />}>Upload Cover Photo</Button>
                      </Upload>
                    </Form.Item>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label="Duration (hours)"
                          name="duration"
                          rules={[{ required: true }]}
                        >
                          <InputNumber min={0} style={{ width:"100%" }} placeholder="0" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="Language"
                          name="language"
                          rules={[{ required: true }]}
                        >
                          <Select placeholder="Select language">
                            <Select.Option value="English">English</Select.Option>
                            <Select.Option value="Hindi">Hindi</Select.Option>
                            <Select.Option value="Bengali">Bengali</Select.Option>
                            <Select.Option value="Tamil">Tamil</Select.Option>
                            <Select.Option value="Telugu">Telugu</Select.Option>
                            <Select.Option value="Marathi">Marathi</Select.Option>
                            <Select.Option value="Other">Other</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label="Skill Level"
                          name="skill_level"
                          rules={[{ required: true }]}
                        >
                          <Select placeholder="Select level">
                            <Select.Option value="beginner">Beginner</Select.Option>
                            <Select.Option value="intermediate">Intermediate</Select.Option>
                            <Select.Option value="advanced">Advanced</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        {"aname" in loginUser ? (
                          <Form.Item
                            label="Teacher"
                            name="teacher_id"
                            rules={[{ required: true }]}
                          >
                            <Select placeholder="Select teacher">
                              {teachersName.map((t) => (
                                <Select.Option key={t._id} value={t._id}>
                                  {t.tname}
                                </Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                        ) : (
                          <>
                            <Form.Item label="Teacher">
                              <Input value={`${loginUser.tname} (You)`} disabled />
                            </Form.Item>
                            <Form.Item name="teacher_id" hidden initialValue={loginUser.id}>
                              <Input />
                            </Form.Item>
                          </>
                        )}
                      </Col>
                    </Row>
                  </Card>
                </TabPane>

                {/*  TAB 4: VIDEOS  */}
                <TabPane tab=" Videos" key="videos">
                  <Card title="YouTube Videos (Optional)">
                    <Form.Item
                      label={
                        <Space>
                          <VideoCameraOutlined />
                          Total Preview Videos (Optional)
                        </Space>
                      }
                      name="videoCount"
                      rules={[{ required: false }]}
                    >
                      <InputNumber
                        min={0}
                        max={50}
                        placeholder="0 (Optional)"
                        onChange={(value) => {
                          setVideoCount(
                            typeof value === "number" && value >= 0 ? value : 0
                          );
                        }}
                        addonAfter={<Tag color="blue">{videoCount} videos</Tag>}
                      />
                    </Form.Item>

                    {Array.from({ length: videoCount }, (_, index) => (
                      <Form.Item
                        key={`youtube_${index}`}
                        label={`Video ${index + 1} URL (Optional)`}
                        name={["youtube_links", index]}
                        rules={[{ type: "url", required: false, message: "Please enter valid YouTube URL" }]}
                      >
                        <Input
                          placeholder="https://www.youtube.com/watch?v=... (Optional)"
                          addonBefore="youtu.be/"
                          prefix={<GlobalOutlined />}
                        />
                      </Form.Item>
                    ))}
                  </Card>
                </TabPane>

                {/*  TAB 5: SEO  */}
                <TabPane tab=" SEO" key="seo">
                  <Card title="SEO Settings">
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="SEO Title" name="seo_title" rules={[{ required: true }]}>
                          <Input showCount placeholder="Max 60 characters" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="URL Slug"
                          name="slug"
                          rules={[{ required: true }]}
                        >
                          <Input
                            suffix={<CopyOutlined />}
                            placeholder="Auto-generated from title"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="Meta Keywords" name="meta_keywords">
                          <Input placeholder="course, online, learning, certification" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Meta Description" name="meta_description" rules={[{ required: true }]}>
                          <TextArea showCount rows={3} />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item label="OG Title" name="og_title">
                          <Input placeholder="Open Graph title" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item label="OG Description" name="og_description">
                          <TextArea rows={2} placeholder="Open Graph description" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item label="Canonical URL" name="canonical_url">
                          <Input placeholder="https://yoursite.com/course/slug" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item label="Robots" name="robots">
                          <Input placeholder="index, follow" />
                        </Form.Item>
                      </Col>
                      <Col span={16}>
                        <Form.Item label="Schema Markup" name="schema_markup">
                          <TextArea rows={3} placeholder="Optional JSON-LD schema" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                </TabPane>

                {/*  TAB 6: CHAPTERS  */}
                <TabPane tab=" Chapters" key="chapters">
                  <Card title="Course Chapters" style={{ marginBottom: 20 }}>
                    <Form.Item
                      label="Number of Chapters"
                      name="chapterCount"
                      rules={[{ required: true }]}
                    >
                      <InputNumber
                        min={0}
                        max={50}
                        style={{ width:"100%" }}
                        placeholder="Enter number of chapters"
                        onChange={(value) => {
                          const count =
                            typeof value ==="number" && value > 0 ? value : 0;
                          setChapters(count);
                        }}
                        addonAfter={<Tag color="blue">{chapters} Chapters</Tag>}
                      />
                    </Form.Item>
                  </Card>

                  {/* Dynamic Chapter Cards - EXACTLY like AddCourse */}
                  {Array.from({ length: chapters }, (_, index) => (
                    <Card
                      key={index}
                      size="small"
                      title={`Chapter ${index + 1}`}
                      style={{ marginBottom: 16 }}
                      hoverable
                    >
                      <Space direction="vertical" style={{ width:"100%" }}>
                        <Form.Item
                          label="Chapter Name"
                          name={["chapters", index,"chapter_name"]}
                          rules={[{ required: true }]}
                        >
                          <Input placeholder="Enter chapter name" />
                        </Form.Item>

                        <Form.Item
                          label="Study Material"
                          name={["chapters", index,"study_material"]}
                          valuePropName="fileList"
                          getValueFromEvent={getFileValue}
                          extra="Existing file will be kept if no new file is uploaded."
                        >
                          <Upload beforeUpload={beforeUploadStudy} maxCount={1}>
                            <Button icon={<UploadOutlined />}>Upload Study Material</Button>
                          </Upload>
                        </Form.Item>

                        <Form.Item
                          label="YouTube Video Link (Optional)"
                          name={["chapters", index,"youtube_video"]}
                          rules={[{ type:"url", required: false, message:"Enter valid URL" }]}
                        >
                          <Input placeholder="https://youtube.com/watch?v=... (Optional)" />
                        </Form.Item>

                        <Form.Item
                          label="Practice Set"
                          name={["chapters", index,"practice_set"]}
                          valuePropName="fileList"
                          getValueFromEvent={getFileValue}
                          extra="Existing file will be kept if no new file is uploaded."
                        >
                          <Upload beforeUpload={beforeUploadStudy} maxCount={1}>
                            <Button icon={<UploadOutlined />}>Upload Practice Set</Button>
                          </Upload>
                        </Form.Item>

                        <Form.Item
                          label="Other Materials (Optional)"
                          name={["chapters", index,"other_materials"]}
                          valuePropName="fileList"
                          getValueFromEvent={getFileValue}
                        >
                          <Upload beforeUpload={beforeUploadStudy} multiple>
                            <Button icon={<UploadOutlined />}>Upload Other Files</Button>
                          </Upload>
                        </Form.Item>
                      </Space>
                    </Card>
                  ))}
                </TabPane>

                {/*  TAB 7: COURSE DETAILS  */}
                <TabPane tab=" Course Details" key="details">
                  <Space direction="vertical" style={{ width:"100%" }} size="large">

                    {/* Who This Course Is For */}
                    <Card
                      title={
                        <Space>
                          <UserOutlined />
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
                                style={{ display:"flex", marginBottom: 8 }}
                                align="baseline"
                              >
                                <Form.Item
                                  {...field}
                                  name={[field.name,"text"]}
                                  rules={[
                                    { required: true, message:"Please enter target audience" },
                                  ]}
                                  style={{ flex: 1, marginBottom: 0 }}
                                >
                                  <Input
                                    placeholder="e.g., Beginners in programming, Students preparing for exams"
                                    prefix={
                                      <CheckCircleOutlined style={{ color:"#52c41a" }} />
                                    }
                                    showCount
                                  />
                                </Form.Item>
                                {fields.length > 1 && (
                                  <MinusCircleOutlined
                                    onClick={() => remove(field.name)}
                                    style={{ color:"#ff4d4f", fontSize:"20px" }}
                                  />
                                )}
                              </Space>
                            ))}
                            <Form.Item>
                              <Button
                                type="dashed"
                                onClick={() => add()}
                                block
                                icon={<PlusOutlined />}
                              >
                                Add Target Audience
                              </Button>
                            </Form.Item>
                          </>
                        )}
                      </Form.List>
                    </Card>

                    {/* What You Will Learn */}
                    <Card
                      title={
                        <Space>
                          <TrophyOutlined />
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
                                style={{ display:"flex", marginBottom: 8 }}
                                align="baseline"
                              >
                                <Form.Item
                                  {...field}
                                  name={[field.name,"text"]}
                                  rules={[
                                    { required: true, message:"Please enter learning outcome" },
                                  ]}
                                  style={{ flex: 1, marginBottom: 0 }}
                                >
                                  <Input
                                    placeholder="e.g., Master React components and hooks"
                                    prefix={<StarOutlined style={{ color:"#faad14" }} />}
                                    showCount
                                  />
                                </Form.Item>
                                {fields.length > 1 && (
                                  <MinusCircleOutlined
                                    onClick={() => remove(field.name)}
                                    style={{ color:"#ff4d4f", fontSize:"20px" }}
                                  />
                                )}
                              </Space>
                            ))}
                            <Form.Item>
                              <Button
                                type="dashed"
                                onClick={() => add()}
                                block
                                icon={<PlusOutlined />}
                              >
                                Add Learning Outcome
                              </Button>
                            </Form.Item>
                          </>
                        )}
                      </Form.List>
                    </Card>

                    {/* Course Features */}
                    <Card
                      title={
                        <Space>
                          <TagOutlined />
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
                                style={{ display:"flex", marginBottom: 8 }}
                                align="baseline"
                              >
                                <Form.Item
                                  {...field}
                                  name={[field.name,"text"]}
                                  rules={[
                                    { required: true, message:"Please enter course feature" },
                                  ]}
                                  style={{ flex: 1, marginBottom: 0 }}
                                >
                                  <Input
                                    placeholder="e.g., Lifetime access, Certificate of completion"
                                    prefix={<BookOutlined style={{ color:"#722ed1" }} />}
                                    showCount
                                  />
                                </Form.Item>
                                {fields.length > 1 && (
                                  <MinusCircleOutlined
                                    onClick={() => remove(field.name)}
                                    style={{ color:"#ff4d4f", fontSize:"20px" }}
                                  />
                                )}
                              </Space>
                            ))}
                            <Form.Item>
                              <Button
                                type="dashed"
                                onClick={() => add()}
                                block
                                icon={<PlusOutlined />}
                              >
                                Add Course Feature
                              </Button>
                            </Form.Item>
                          </>
                        )}
                      </Form.List>
                    </Card>
                  </Space>
                </TabPane>

                {/*  TAB 8: FAQs  */}
                <TabPane tab=" Course FAQs" key="faqs">
                  <Card
                    title={
                      <Space>
                        <QuestionCircleOutlined />
                        Frequently Asked Questions
                      </Space>
                    }
                    extra={<Tag color="blue">Student Questions</Tag>}
                  >
                    <Form.List name="course_faqs">
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map((field) => (
                            <Card
                              key={field.key}
                              size="small"
                              style={{ marginBottom: 16 }}
                              extra={
                                fields.length > 1 && (
                                  <MinusCircleOutlined
                                    onClick={() => remove(field.name)}
                                    style={{ color:"red" }}
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
                                <TextArea rows={3} placeholder="Answer..." />
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
                  </Card>
                </TabPane>
              </Tabs>

              <Divider />

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<PlusOutlined />}
                  size="large"
                  style={{ width:"100%" }}
                >
                  Update Course
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Content>

        {/* Preview Modal */}
        <Modal
          title="Course Preview"
          open={isPreviewModalVisible}
          onCancel={() => setIsPreviewModalVisible(false)}
          footer={null}
          width={600}
        >
          <Space direction="vertical" size="large" style={{ width:"100%" }}>
            <Tag color="blue">
              <BookOutlined /> {chapters} Chapters
            </Tag>
            <Tag color="green">
              <VideoCameraOutlined /> {videoCount} Videos
            </Tag>
            <Tag color="purple">
              <ClockCircleOutlined /> Duration:{""}
              {form.getFieldValue("duration") || 0}h
            </Tag>
            <Tag color="orange">
              Enrolled: {form.getFieldValue("enrolled_count") || 0}
            </Tag>
          </Space>
        </Modal>

        <Footer style={{ textAlign:"center" }}>
          <b>© 2026 Draa. All Rights Reserved.</b>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default UpdateCourse;