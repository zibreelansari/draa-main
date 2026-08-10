// import React, { useEffect, useState, useCallback, useMemo } from"react";
// import {
//   Form, Input, InputNumber, Button, DatePicker, Space, Typography, message,
//   Popconfirm, Row, Col, Table, Divider, Layout, Switch, Tag, Card, Modal,
//   Select, Avatar, Drawer, Descriptions, Alert, Tooltip, Progress,
// } from"antd";
// import {
//   PlusOutlined, DeleteOutlined, EditOutlined, EyeOutlined, UserOutlined,
//   ReloadOutlined, FilterOutlined, ExportOutlined, SearchOutlined,
//   TrophyOutlined, CheckCircleOutlined, ClockCircleOutlined, TeamOutlined,
//   CalendarOutlined, FileTextOutlined, StarOutlined, CopyOutlined,
// } from"@ant-design/icons";
// import dayjs from"dayjs";
// import axios from"axios";
// import { useNavigate } from"react-router-dom";
// import url from"../../url";
// import Topbar from"./Topbar";
// import Sidebar from"./Sidebar";

// const { Title, Text } = Typography;
// const { Content, Footer } = Layout;
// const { TextArea } = Input;
// const { Option } = Select;
// const { Search } = Input;

// //  Types 

// interface ExaminationCategory {
//   _id: string;
//   name: string;
//   code: string;
//   description?: string;
//   year: number;
//   examDate?: string;
//   registrationStartDate?: string;
//   registrationEndDate?: string;
//   resultDate?: string;
//   admitCardDate?: string;
//   applicationFee?: {
//     general?: number; reserved?: number;
//     obc?: number; sc?: number; st?: number; pwd?: number;
//   };
//   totalSeats?: number;
//   examPattern?: {
//     totalQuestions?: number; duration?: number;
//     totalMarks?: number; negativeMarking?: boolean; markingScheme?: string;
//   };
//   eligibilityCriteria?: string[];
//   syllabus?: string[];
//   isActive: boolean;
//   isFeatured?: boolean;
//   priority?: number;
//   officialWebsite?: string;
//   adminNotes?: string;
//   bannerImage?: string;
//   brochurePdf?: string;
//   createdBy?: string | { _id: string; name: string; email: string; tname?: string };
//   createdAt: string;
//   updatedAt?: string;
// }

// interface Teacher {
//   _id: string;
//   tname: string;
//   temail: string;
//   tspecialization?: string;
//   tprofile?: string;
//   Status: string;
// }

// interface LoginUser { aname?: string; aemail?: string; }

// //  StatCard 

// const StatCard = ({
//   title, value, icon, color, sub,
// }: {
//   title: string; value: string | number; icon: React.ReactNode; color: string; sub?: string;
// }) => (
//   <Card style={{ borderRadius: 12, border: `1px solid ${color}22`, height:"100%" }} bodyStyle={{ padding:"20px 24px" }}>
//     <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
//       <div style={{ flex: 1 }}>
//         <Text type="secondary" style={{ fontSize: 11, fontWeight: 600, textTransform:"uppercase", letterSpacing: 0.5 }}>
//           {title}
//         </Text>
//         <Title level={3} style={{ margin:"4px 0 0", color:"#1a1a1a", lineHeight: 1.2 }}>{value}</Title>
//         {sub && <Text style={{ fontSize: 11, color:"#aaa", marginTop: 4, display:"block" }}>{sub}</Text>}
//       </div>
//       <div style={{
//         width: 48, height: 48, borderRadius: 12, background: `${color}18`,
//         display:"flex", alignItems:"center", justifyContent:"center",
//         fontSize: 22, color, flexShrink: 0,
//       }}>{icon}</div>
//     </div>
//   </Card>
// );

// //  Main Component 

// const AdminExaminationCategoryManager: React.FC = () => {
//   usePageTitle('Examination Categories | Admin');
//   const navigate = useNavigate();

//   const [loginUser, setLoginUser] = useState<LoginUser | null>(null);
//   const [examCategories, setExamCategories] = useState<ExaminationCategory[]>([]);
//   const [teachers, setTeachers] = useState<Teacher[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [submitLoading, setSubmitLoading] = useState(false);
//   const [teachersLoading, setTeachersLoading] = useState(false);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [editingCategory, setEditingCategory] = useState<ExaminationCategory | null>(null);
//   const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
//   const [selectedCategory, setSelectedCategory] = useState<ExaminationCategory | null>(null);
//   const [form] = Form.useForm();
//   const [searchText, setSearchText] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [yearFilter, setYearFilter] = useState("all");
//   const [creatorFilter, setCreatorFilter] = useState("all");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);

//   //  Auth 
//   useEffect(() => {
//     const raw = localStorage.getItem("edudocs");
//     if (!raw) { navigate("/admin-login"); return; }
//     try {
//       const user = JSON.parse(raw);
//       if (!user.aname) { message.error("Admin access required."); navigate("/admin-login"); return; }
//       setLoginUser(user);
//     } catch { navigate("/admin-login"); }
//   }, [navigate]);

//   //  Fetch Teachers 
//   const fetchTeachers = useCallback(async () => {
//     setTeachersLoading(true);
//     try {
//       const res = await axios.get(`${url}/updateTeacherStatus/all`);
//       if (res.data.success && res.data.data?.teachers) {
//         setTeachers(res.data.data.teachers.filter((t: Teacher) => t.Status ==="approved"));
//       } else {
//         const fb = await axios.get(`${url}/count/getAllTeachers`);
//         setTeachers(fb.data.Teachers ?? []);
//       }
//     } catch {
//       try {
//         const fb = await axios.get(`${url}/count/getAllTeachers`);
//         setTeachers(fb.data.Teachers ?? []);
//       } catch { message.error("Failed to load teachers"); }
//     } finally { setTeachersLoading(false); }
//   }, []);

//   //  Fetch Categories 
//   const fetchExamCategories = useCallback(async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get(`${url}/test-series/navigation/examinations`);
//       if (res.data.success) setExamCategories(res.data.data.examinationCategories ?? []);
//     } catch { message.error("Failed to load examination categories"); }
//     finally { setLoading(false); }
//   }, []);

//   useEffect(() => {
//     if (loginUser?.aname) { fetchExamCategories(); fetchTeachers(); }
//   }, [loginUser?.aname, fetchExamCategories, fetchTeachers]);

//   //  FIXED handleEdit 
//   // Root cause of edit modal not working: dot-notation keys like
//   //"applicationFee.general" don't match nested Form.Item name={["applicationFee","general"]}.
//   // Fix: set nested objects directly. Also moment() replaced with dayjs() for AntD v5.
//   const handleEdit = (category: ExaminationCategory) => {
//     setEditingCategory(category);

//     form.setFieldsValue({
//       //  Basic Fields
//       name: category.name,
//       code: category.code,
//       description: category.description ??"",
//       year: category.year,
//       priority: category.priority ?? 0,
//       isActive: category.isActive,
//       isFeatured: category.isFeatured ?? false,
//       totalSeats: category.totalSeats,
//       officialWebsite: category.officialWebsite ??"",
//       adminNotes: category.adminNotes ??"",

//       //   PRICING (NEW - IMPORTANT)
//       isPaid: category.isPaid ?? false,
//       price: category.price ?? 0,
//       originalPrice: category.originalPrice ?? 0,
//       discount: category.discount ?? 0, // read-only display

//       //  createdBy
//       createdBy:
//         category.createdBy && typeof category.createdBy ==="object"
//           ? category.createdBy._id
//           : category.createdBy ?? undefined,

//       //  Dates
//       examDate: category.examDate ? dayjs(category.examDate) : null,
//       registrationStartDate: category.registrationStartDate ? dayjs(category.registrationStartDate) : null,
//       registrationEndDate: category.registrationEndDate ? dayjs(category.registrationEndDate) : null,
//       resultDate: category.resultDate ? dayjs(category.resultDate) : null,
//       admitCardDate: category.admitCardDate ? dayjs(category.admitCardDate) : null,

//       //  Application Fee
//       applicationFee: {
//         general: category.applicationFee?.general,
//         reserved: category.applicationFee?.reserved,
//         obc: category.applicationFee?.obc,
//         sc: category.applicationFee?.sc,
//         st: category.applicationFee?.st,
//         pwd: category.applicationFee?.pwd,
//       },

//       //  Exam Pattern
//       examPattern: {
//         totalQuestions: category.examPattern?.totalQuestions,
//         duration: category.examPattern?.duration,
//         totalMarks: category.examPattern?.totalMarks,
//         negativeMarking: category.examPattern?.negativeMarking ?? false,
//         markingScheme: category.examPattern?.markingScheme ??"",
//       },

//       //  Arrays  textarea
//       eligibilityCriteria: (category.eligibilityCriteria ?? []).join("\n"),
//       syllabus: (category.syllabus ?? []).join("\n"),
//     });

//     setModalVisible(true);
//   };

//   //  Submit 
//   const handleSubmit = async (values: any) => {
//     setSubmitLoading(true);

//     try {
//       //  BASIC VALIDATION (IMPORTANT)
//       if (values.isPaid && (!values.price || values.price <= 0)) {
//         message.error("Please enter a valid price for paid category");
//         return;
//       }

//       //  CLEAN PAYLOAD
//       const payload = {
//         ...values,

//         //  Dates
//         examDate: values.examDate?.format("YYYY-MM-DD") ?? null,
//         registrationStartDate: values.registrationStartDate?.format("YYYY-MM-DD") ?? null,
//         registrationEndDate: values.registrationEndDate?.format("YYYY-MM-DD") ?? null,
//         resultDate: values.resultDate?.format("YYYY-MM-DD") ?? null,
//         admitCardDate: values.admitCardDate?.format("YYYY-MM-DD") ?? null,

//         //  Arrays
//         eligibilityCriteria: (values.eligibilityCriteria ??"")
//           .split("\n").map((s: string) => s.trim()).filter(Boolean),

//         syllabus: (values.syllabus ??"")
//           .split("\n").map((s: string) => s.trim()).filter(Boolean),

//         //  PRICING CLEANUP (VERY IMPORTANT)
//         isPaid: values.isPaid ?? false,
//         price: values.isPaid ? values.price || 0 : 0,
//         originalPrice: values.isPaid ? values.originalPrice || 0 : 0,

//         //  NEVER SEND DISCOUNT FROM FRONTEND
//         discount: undefined
//       };

//       if (editingCategory) {
//         await axios.put(
//           `${url}/test-series/admin/examinations/${editingCategory._id}`,
//           payload
//         );
//         message.success("Examination category updated successfully!");
//       } else {
//         await axios.post(
//           `${url}/test-series/admin/examinations`,
//           payload
//         );
//         message.success("Examination category created successfully!");
//       }

//       //  RESET UI
//       setModalVisible(false);
//       setEditingCategory(null);
//       form.resetFields();
//       fetchExamCategories();

//     } catch (err: any) {
//       message.error(err.response?.data?.message ??"Failed to save examination category");
//     } finally {
//       setSubmitLoading(false);
//     }
//   };

//   //  Delete 
//   const handleDelete = async (id: string) => {
//     try {
//       await axios.delete(`${url}/test-series/admin/examinations/${id}`);
//       message.success("Deleted successfully!");
//       setExamCategories(prev => prev.filter(c => c._id !== id));
//     } catch (err: any) {
//       message.error(err.response?.data?.message ??"Failed to delete");
//     }
//   };

//   //  Toggle Status 
//   const toggleStatus = async (category: ExaminationCategory) => {
//     try {
//       await axios.patch(`${url}/test-series/admin/examinations/${category._id}/toggle`);
//       message.success(`Category ${category.isActive ?"deactivated" :"activated"}!`);
//       fetchExamCategories();
//     } catch { message.error("Failed to update status"); }
//   };

//   //  Toggle Featured (admin-only) 
//   const toggleFeatured = async (category: ExaminationCategory) => {
//     try {
//       await axios.patch(`${url}/test-series/admin/examinations/${category._id}`, {
//         isFeatured: !category.isFeatured,
//       });
//       message.success(`${!category.isFeatured ?"Featured!" :"Unfeatured"}`);
//       fetchExamCategories();
//     } catch { message.error("Failed to update featured status"); }
//   };

//   //  Duplicate 
//   const handleDuplicate = (category: ExaminationCategory) => {
//     setEditingCategory(null);
//     form.resetFields();
//     form.setFieldsValue({
//       name: category.name +" (Copy)",
//       code: category.code +"-COPY",
//       description: category.description,
//       year: new Date().getFullYear(),
//       priority: category.priority ?? 0,
//       isActive: false,
//       isFeatured: false,
//       totalSeats: category.totalSeats,
//       applicationFee: category.applicationFee,
//       examPattern: category.examPattern,
//       eligibilityCriteria: (category.eligibilityCriteria ?? []).join("\n"),
//       syllabus: (category.syllabus ?? []).join("\n"),
//     });
//     setModalVisible(true);
//     message.info("Duplicated  update code & name before saving");
//   };

//   //  Export CSV 
//   const handleExport = () => {
//     const rows = [
//"Name,Code,Year,Exam Date,Reg End,Total Seats,Status,Featured,Priority,Created By,Created At",
//       ...filteredCategories.map(c => {
//         const creator = (c.createdBy && typeof c.createdBy ==="object")
//           ? (c.createdBy.tname || c.createdBy.name)
//           : (c.createdBy ??"");
//         return [
//           `"${c.name}"`, `"${c.code}"`, c.year,
//           `"${c.examDate ??""}"`, `"${c.registrationEndDate ??""}"`,
//           c.totalSeats ?? 0,
//           `"${c.isActive ?"Active" :"Inactive"}"`,
//           `"${c.isFeatured ?"Yes" :"No"}"`,
//           c.priority ?? 0, `"${creator}"`,
//           `"${dayjs(c.createdAt).format("YYYY-MM-DD")}"`,
//         ].join(",");
//       }),
//     ].join("\n");

//     const link = document.createElement("a");
//     link.setAttribute("href", `data:text/csv;charset=utf-8,${encodeURI(rows)}`);
//     link.setAttribute("download", `exam-categories-${dayjs().format("YYYY-MM-DD")}.csv`);
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     message.success("Exported!");
//   };

//   //  Stats 
//   const stats = useMemo(() => {
//     const active = examCategories.filter(c => c.isActive).length;
//     const featured = examCategories.filter(c => c.isFeatured).length;
//     return {
//       total: examCategories.length,
//       active, inactive: examCategories.length - active, featured,
//       years: [...new Set(examCategories.map(c => c.year))],
//     };
//   }, [examCategories]);

//   //  Filtered data 
//   const filteredCategories = useMemo(() => {
//     return examCategories.filter(c => {
//       const q = searchText.toLowerCase();
//       const matchSearch = !q ||
//         c.name.toLowerCase().includes(q) ||
//         c.code.toLowerCase().includes(q) ||
//         (c.description ??"").toLowerCase().includes(q);
//       const matchStatus =
//         statusFilter ==="all" ||
//         (statusFilter ==="active" && c.isActive) ||
//         (statusFilter ==="inactive" && !c.isActive) ||
//         (statusFilter ==="featured" && c.isFeatured);
//       const matchYear = yearFilter ==="all" || c.year.toString() === yearFilter;
//       const creatorId = c.createdBy && typeof c.createdBy ==="object" ? c.createdBy._id : (c.createdBy ?? null);
//       const matchCreator = creatorFilter ==="all" || creatorId === creatorFilter;
//       return matchSearch && matchStatus && matchYear && matchCreator;
//     });
//   }, [examCategories, searchText, statusFilter, yearFilter, creatorFilter]);

//   const uniqueYears = useMemo(
//     () => [...new Set(examCategories.map(c => c.year))].sort((a, b) => b - a),
//     [examCategories]
//   );

//   const clearFilters = () => {
//     setSearchText(""); setStatusFilter("all"); setYearFilter("all");
//     setCreatorFilter("all"); setCurrentPage(1);
//   };

//   const isFiltered = !!(searchText || statusFilter !=="all" || yearFilter !=="all" || creatorFilter !=="all");

//   const openCreateModal = () => {
//     setEditingCategory(null);
//     form.resetFields();
//     form.setFieldsValue({ year: new Date().getFullYear(), isActive: true, priority: 0, isFeatured: false });
//     setModalVisible(true);
//   };

//   //  Table Columns 
//   const columns = [
//     {
//       title:"Examination",
//       key:"exam",
//       width: 300,
//       render: (_: any, r: ExaminationCategory) => (
//         <div>
//           <Space size={6} style={{ marginBottom: 4 }}>
//             <Tag color="red" style={{ fontWeight: 700, letterSpacing: 1 }}>{r.code}</Tag>
//             <Text strong style={{ cursor:"pointer", color:"#1890ff" }}
//               onClick={() => { setSelectedCategory(r); setDetailDrawerOpen(true); }}>
//               {r.name}
//             </Text>
//             {r.isFeatured && <Tag color="gold" style={{ fontSize: 10 }}> Featured</Tag>}
//           </Space>
//           <div style={{ fontSize: 11, color:"#999" }}>
//             Year: {r.year} | Priority: {r.priority ?? 0}
//             {r.totalSeats ? ` | Seats: ${r.totalSeats}` :""}
//           </div>
//           {r.description && (
//             <Text type="secondary" style={{ fontSize: 11, display:"block", marginTop: 2 }} ellipsis>
//               {r.description}
//             </Text>
//           )}
//         </div>
//       ),
//     },
//     {
//       title:"Created By",
//       key:"createdBy",
//       width: 180,
//       render: (_: any, r: ExaminationCategory) => {
//         const creator = (r.createdBy && typeof r.createdBy ==="object") ? r.createdBy : null;
//         const name = creator?.tname || creator?.name || (typeof r.createdBy ==="string" ? r.createdBy :"");
//         const cId = creator?._id || (typeof r.createdBy ==="string" ? r.createdBy : null);
//         const teacher = teachers.find(t => t._id === cId);
//         return (
//           <Space>
//             <Avatar src={teacher?.tprofile} icon={<UserOutlined />} size="small" />
//             <div>
//               <Text style={{ fontSize: 12, display:"block" }}>{name}</Text>
//               {creator?.email && <Text type="secondary" style={{ fontSize: 10 }}>{creator.email}</Text>}
//             </div>
//           </Space>
//         );
//       },
//     },
//     {
//       title:"Dates",
//       key:"dates",
//       width: 160,
//       render: (_: any, r: ExaminationCategory) => (
//         <Space direction="vertical" size={2}>
//           {r.examDate && (
//             <Tag color="blue" icon={<CalendarOutlined />} style={{ fontSize: 10 }}>
//               Exam: {dayjs(r.examDate).format("DD/MM/YY")}
//             </Tag>
//           )}
//           {r.registrationEndDate && (
//             <Tag color="orange" style={{ fontSize: 10 }}>
//               Reg End: {dayjs(r.registrationEndDate).format("DD/MM/YY")}
//             </Tag>
//           )}
//           {!r.examDate && !r.registrationEndDate && <Text type="secondary" style={{ fontSize: 11 }}>Not set</Text>}
//         </Space>
//       ),
//     },
//     {
//       title:"Pattern",
//       key:"pattern",
//       width: 130,
//       render: (_: any, r: ExaminationCategory) => (
//         <Space direction="vertical" size={0}>
//           {r.examPattern?.totalQuestions && <Text style={{ fontSize: 11 }}>Q: {r.examPattern.totalQuestions}</Text>}
//           {r.examPattern?.duration && <Text style={{ fontSize: 11 }}> {r.examPattern.duration}m</Text>}
//           {r.examPattern?.totalMarks && <Text style={{ fontSize: 11 }}> {r.examPattern.totalMarks} marks</Text>}
//           {r.examPattern?.negativeMarking && <Tag color="orange" style={{ fontSize: 10, padding:"0 4px" }}>-ve Mark</Tag>}
//         </Space>
//       ),
//     },
//     {
//       title:"Fees",
//       key:"fees",
//       width: 100,
//       render: (_: any, r: ExaminationCategory) => (
//         r.applicationFee?.general != null ? (
//           <Space direction="vertical" size={1}>
//             <Text style={{ fontSize: 11 }}>Gen: {r.applicationFee.general}</Text>
//             {r.applicationFee.reserved != null && <Text style={{ fontSize: 11 }}>Res: {r.applicationFee.reserved}</Text>}
//           </Space>
//         ) : <Text type="secondary" style={{ fontSize: 11 }}></Text>
//       ),
//     },
//     {
//       title:"Status",
//       key:"status",
//       width: 110,
//       render: (_: any, r: ExaminationCategory) => (
//         <Tooltip title="Toggle Active/Inactive">
//           <Switch checked={r.isActive} onChange={() => toggleStatus(r)}
//             checkedChildren="Active" unCheckedChildren="Off" size="small" />
//         </Tooltip>
//       ),
//     },
//     {
//       title:"Featured",
//       key:"featured",
//       width: 90,
//       render: (_: any, r: ExaminationCategory) => (
//         <Tooltip title="Toggle Featured">
//           <Switch checked={r.isFeatured ?? false} onChange={() => toggleFeatured(r)}
//             checkedChildren="" unCheckedChildren="No" size="small" />
//         </Tooltip>
//       ),
//     },
//     {
//       title:"Created",
//       dataIndex:"createdAt",
//       width: 90,
//       render: (t: string) => <Text style={{ fontSize: 11 }}>{dayjs(t).format("DD/MM/YY")}</Text>,
//     },
//     {
//       title:"Actions",
//       key:"actions",
//       width: 180,
//       fixed:"right" as const,
//       render: (_: any, r: ExaminationCategory) => (
//         <Space size={4} wrap>
//           <Tooltip title="View Details">
//             <Button type="text" size="small" icon={<EyeOutlined />}
//               onClick={() => { setSelectedCategory(r); setDetailDrawerOpen(true); }} />
//           </Tooltip>
//           <Tooltip title="Edit">
//             <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)} />
//           </Tooltip>
//           <Tooltip title="Duplicate">
//             <Button type="text" size="small" icon={<CopyOutlined />} onClick={() => handleDuplicate(r)} />
//           </Tooltip>
//           <Popconfirm
//             title="Delete this category?" description="Cannot be undone."
//             onConfirm={() => handleDelete(r._id)}
//             okText="Delete" cancelText="Cancel" okType="danger"
//           >
//             <Tooltip title="Delete">
//               <Button danger type="text" size="small" icon={<DeleteOutlined />} />
//             </Tooltip>
//           </Popconfirm>
//         </Space>
//       ),
//     },
//   ];

//   if (!loginUser?.aname) {
//     return (
//       <Layout style={{ minHeight:"100vh" }}>
//         <Content style={{ display:"flex", justifyContent:"center", alignItems:"center" }}>
//           <Alert message="Access Denied" description="Admin privileges required." type="error" showIcon />
//         </Content>
//       </Layout>
//     );
//   }

//   const activeRate = stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0;

//   return (
//     <Layout style={{ minHeight:"100vh" }}>
//       <Sidebar />
//       <Layout>
//         <Topbar />
//         <Content style={{ margin:"16px", padding:"0 8px" }}>

//           {/*  Header Banner  */}
//           <div style={{
//             background:"linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
//             borderRadius: 16, padding:"28px 32px", marginBottom: 24,
//             display:"flex", justifyContent:"space-between", alignItems:"center",
//             flexWrap:"wrap", gap: 16,
//           }}>
//             <div>
//               <Title level={2} style={{ color:"#fff", margin: 0 }}>
//                 <TrophyOutlined style={{ marginRight: 10, color:"#faad14" }} />
//                 Examination Category Management
//               </Title>
//               <Text style={{ color:"rgba(255,255,255,0.6)", fontSize: 14 }}>
//                 Admin Panel  Create, manage &amp; assign exam categories on behalf of teachers
//               </Text>
//             </div>
//             <Space wrap>
//               <Button icon={<ReloadOutlined />}
//                 onClick={() => { fetchExamCategories(); fetchTeachers(); }}
//                 loading={loading}
//                 style={{
//                   background:"rgba(255,255,255,0.12)", color:"#fff",
//                   border:"1px solid rgba(255,255,255,0.25)", borderRadius: 8,
//                 }}>
//                 Refresh
//               </Button>
//               <Button icon={<ExportOutlined />} onClick={handleExport}
//                 style={{
//                   background:"rgba(255,255,255,0.12)", color:"#fff",
//                   border:"1px solid rgba(255,255,255,0.25)", borderRadius: 8,
//                 }}>
//                 Export CSV
//               </Button>
//               <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal} style={{ borderRadius: 8 }}>
//                 Add Category
//               </Button>
//             </Space>
//           </div>

//           {/*  Stats  */}
//           <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
//             <Col xs={12} sm={8} lg={4}>
//               <StatCard title="Total" value={stats.total} icon={<FileTextOutlined />} color="#1890ff"
//                 sub={`${stats.years.length} year(s)`} />
//             </Col>
//             <Col xs={12} sm={8} lg={4}>
//               <StatCard title="Active" value={stats.active} icon={<CheckCircleOutlined />} color="#52c41a"
//                 sub={`${activeRate}% of total`} />
//             </Col>
//             <Col xs={12} sm={8} lg={4}>
//               <StatCard title="Inactive" value={stats.inactive} icon={<ClockCircleOutlined />} color="#faad14" />
//             </Col>
//             <Col xs={12} sm={8} lg={4}>
//               <StatCard title="Featured" value={stats.featured} icon={<StarOutlined />} color="#eb2f96" />
//             </Col>
//             <Col xs={12} sm={8} lg={4}>
//               <StatCard title="Teachers" value={teachers.length} icon={<TeamOutlined />} color="#722ed1"
//                 sub="approved & available" />
//             </Col>
//             <Col xs={12} sm={8} lg={4}>
//               <Card style={{ borderRadius: 12, border:"1px solid #52c41a22", height:"100%" }} bodyStyle={{ padding:"20px 24px" }}>
//                 <Text type="secondary" style={{ fontSize: 11, fontWeight: 600, textTransform:"uppercase" }}>Active Rate</Text>
//                 <Title level={3} style={{ margin:"4px 0 6px", color:"#1a1a1a" }}>{activeRate}%</Title>
//                 <Progress percent={activeRate} size="small" strokeColor="#52c41a" showInfo={false} />
//               </Card>
//             </Col>
//           </Row>

//           {/*  Filters  */}
//           <Card style={{ marginBottom: 16, borderRadius: 12 }} bodyStyle={{ padding:"16px 20px" }}>
//             <Row gutter={[12, 12]} align="middle">
//               <Col xs={24} sm={8} lg={7}>
//                 <Search placeholder="Search name, code, description..."
//                   value={searchText} onChange={e => setSearchText(e.target.value)}
//                   allowClear prefix={<SearchOutlined />} />
//               </Col>
//               <Col xs={12} sm={4} lg={3}>
//                 <Select value={statusFilter} onChange={v => { setStatusFilter(v); setCurrentPage(1); }} style={{ width:"100%" }}>
//                   <Option value="all">All Status</Option>
//                   <Option value="active">Active</Option>
//                   <Option value="inactive">Inactive</Option>
//                   <Option value="featured"> Featured</Option>
//                 </Select>
//               </Col>
//               <Col xs={12} sm={3} lg={2}>
//                 <Select value={yearFilter} onChange={v => { setYearFilter(v); setCurrentPage(1); }} style={{ width:"100%" }}>
//                   <Option value="all">All Years</Option>
//                   {uniqueYears.map(y => <Option key={y} value={y.toString()}>{y}</Option>)}
//                 </Select>
//               </Col>
//               <Col xs={12} sm={5} lg={4}>
//                 <Select value={creatorFilter}
//                   onChange={v => { setCreatorFilter(v); setCurrentPage(1); }}
//                   style={{ width:"100%" }} placeholder="All Creators"
//                   showSearch optionFilterProp="children">
//                   <Option value="all">All Creators</Option>
//                   {teachers.map(t => <Option key={t._id} value={t._id}>{t.tname}</Option>)}
//                 </Select>
//               </Col>
//               <Col xs={12} sm={4} lg={3}>
//                 <Space>
//                   <Button icon={<FilterOutlined />} onClick={clearFilters} disabled={!isFiltered}>Clear</Button>
//                 </Space>
//               </Col>
//             </Row>
//           </Card>

//           {isFiltered && (
//             <Alert message={`Showing ${filteredCategories.length} of ${examCategories.length} categories`}
//               type="info" showIcon closable style={{ marginBottom: 12, borderRadius: 8 }} />
//           )}

//           {/*  Table  */}
//           <Card
//             title={
//               <Space>
//                 <TrophyOutlined style={{ color:"#faad14" }} />
//                 <Text strong>Examination Categories ({filteredCategories.length})</Text>
//                 {isFiltered && <Tag color="blue">Filtered</Tag>}
//               </Space>
//             }
//             style={{ borderRadius: 12 }}
//             bodyStyle={{ padding: 0 }}
//           >
//             <Table
//               columns={columns}
//               dataSource={filteredCategories}
//               rowKey="_id"
//               loading={loading}
//               scroll={{ x: 1400 }}
//               pagination={{
//                 current: currentPage,
//                 pageSize,
//                 total: filteredCategories.length,
//                 onChange: (p, s) => { setCurrentPage(p); setPageSize(s ?? 10); },
//                 onShowSizeChange: (_, s) => { setCurrentPage(1); setPageSize(s); },
//                 showSizeChanger: true,
//                 showQuickJumper: true,
//                 pageSizeOptions: ["10","20","50"],
//                 showTotal: (tot, range) => `${range[0]}-${range[1]} of ${tot} categories`,
//                 style: { padding:"12px 24px", borderTop:"1px solid #f0f0f0" },
//               }}
//               size="small"
//             />
//           </Card>
//         </Content>

//         {/* 
//             CREATE / EDIT MODAL
//          */}
//         <Modal
//           title={
//             <Space>
//               {editingCategory ? <EditOutlined style={{ color:"#1890ff" }} /> : <PlusOutlined style={{ color:"#52c41a" }} />}
//               <span>{editingCategory ?"Edit" :"Create"} Examination Category</span>
//               {editingCategory && <Tag color="blue">{editingCategory.code}</Tag>}
//             </Space>
//           }
//           open={modalVisible}
//           onCancel={() => { setModalVisible(false); setEditingCategory(null); form.resetFields(); }}
//           footer={null}
//           width={900}
//           destroyOnClose
//           style={{ top: 20 }}
//         >
//           <div style={{ maxHeight:"80vh", overflowY:"auto", paddingRight: 8 }}>
//             <Form
//               form={form}
//               layout="vertical"
//               onFinish={handleSubmit}
//               initialValues={{ year: new Date().getFullYear(), isActive: true, priority: 0, isFeatured: false }}
//             >
//               {/*  Assign Teacher (Admin-only)  */}
//               <Card size="small" style={{ marginBottom: 16, background:"#f0f7ff", border:"1px solid #91caff", borderRadius: 8 }}>
//                 <Row gutter={16} align="middle">
//                   <Col xs={24} sm={14}>
//                     <Form.Item
//                       name="createdBy"
//                       label={
//                         <Space>
//                           <UserOutlined style={{ color:"#1890ff" }} />
//                           <Text strong style={{ color:"#1890ff" }}>Assign to Teacher (Created By)</Text>
//                         </Space>
//                       }
//                       rules={[{ required: true, message:"Please select a teacher" }]}
//                       style={{ marginBottom: 0 }}
//                     >
//                       <Select showSearch placeholder="Select teacher to assign"
//                         optionFilterProp="children" loading={teachersLoading} style={{ width:"100%" }}>
//                         {teachers.map(t => (
//                           <Option key={t._id} value={t._id}>
//                             <Space>
//                               <Avatar src={t.tprofile} icon={<UserOutlined />} size="small" />
//                               {t.tname}
//                               {t.tspecialization && (
//                                 <Text type="secondary" style={{ fontSize: 11 }}> {t.tspecialization}</Text>
//                               )}
//                             </Space>
//                           </Option>
//                         ))}
//                       </Select>
//                     </Form.Item>
//                   </Col>
//                   <Col xs={24} sm={10}>
//                     <div style={{ background:"#fff", border:"1px dashed #91caff", borderRadius: 6, padding:"8px 12px" }}>
//                       <Text style={{ fontSize: 11, color:"#1890ff" }}>
//                          <strong>Admin Action</strong>: Creating on behalf of the selected teacher. They will be listed as creator.
//                       </Text>
//                     </div>
//                   </Col>
//                 </Row>
//               </Card>

//               <Divider orientation="left" plain>Basic Information</Divider>
//               <Row gutter={16}>
//                 <Col span={16}>
//                   <Form.Item name="name" label="Examination Name" rules={[{ required: true }]}>
//                     <Input placeholder="e.g., Graduate Aptitude Test in Engineering" />
//                   </Form.Item>
//                 </Col>
//                 <Col span={8}>
//                   <Form.Item name="code" label="Code" rules={[{ required: true }]}>
//                     <Input placeholder="e.g., GATE" style={{ textTransform:"uppercase" }} />
//                   </Form.Item>
//                 </Col>
//               </Row>

//               <Row gutter={16}>
//                 <Col span={8}>
//                   <Form.Item name="year" label="Year" rules={[{ required: true }]}>
//                     <InputNumber min={2020} max={2035} style={{ width:"100%" }} />
//                   </Form.Item>
//                 </Col>
//                 <Col span={8}>
//                   <Form.Item name="priority" label="Priority (for sorting)">
//                     <InputNumber min={0} max={100} style={{ width:"100%" }} />
//                   </Form.Item>
//                 </Col>
//                 <Col span={8}>
//                   <Form.Item name="totalSeats" label="Total Seats">
//                     <InputNumber min={0} style={{ width:"100%" }} />
//                   </Form.Item>
//                 </Col>
//               </Row>

//               <Form.Item name="description" label="Description">
//                 <TextArea rows={3} placeholder="Brief description of the examination" />
//               </Form.Item>

//               <Row gutter={16}>
//                 <Col span={12}>
//                   <Form.Item name="officialWebsite" label="Official Website">
//                     <Input placeholder="https://..." />
//                   </Form.Item>
//                 </Col>
//                 <Col span={6}>
//                   <Form.Item name="isActive" label="Active Status" valuePropName="checked">
//                     <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
//                   </Form.Item>
//                 </Col>
//                 <Col span={6}>
//                   <Form.Item name="isFeatured" label="Featured" valuePropName="checked">
//                     <Switch checkedChildren=" Featured" unCheckedChildren="No" />
//                   </Form.Item>
//                 </Col>
//               </Row>

//               <Divider orientation="left" plain>Important Dates</Divider>
//               <Row gutter={16}>
//                 <Col span={8}>
//                   <Form.Item name="examDate" label="Exam Date">
//                     <DatePicker style={{ width:"100%" }} />
//                   </Form.Item>
//                 </Col>
//                 <Col span={8}>
//                   <Form.Item name="registrationStartDate" label="Registration Start">
//                     <DatePicker style={{ width:"100%" }} />
//                   </Form.Item>
//                 </Col>
//                 <Col span={8}>
//                   <Form.Item name="registrationEndDate" label="Registration End">
//                     <DatePicker style={{ width:"100%" }} />
//                   </Form.Item>
//                 </Col>
//               </Row>
//               <Row gutter={16}>
//                 <Col span={8}>
//                   <Form.Item name="admitCardDate" label="Admit Card Date">
//                     <DatePicker style={{ width:"100%" }} />
//                   </Form.Item>
//                 </Col>
//                 <Col span={8}>
//                   <Form.Item name="resultDate" label="Result Date">
//                     <DatePicker style={{ width:"100%" }} />
//                   </Form.Item>
//                 </Col>
//               </Row>

//               <Divider orientation="left" plain>Application Fees</Divider>
//               <Row gutter={16}>
//                 <Col span={8}>
//                   <Form.Item name={["applicationFee","general"]} label="General ()">
//                     <InputNumber min={0} style={{ width:"100%" }} prefix="" />
//                   </Form.Item>
//                 </Col>
//                 <Col span={8}>
//                   <Form.Item name={["applicationFee","reserved"]} label="Reserved ()">
//                     <InputNumber min={0} style={{ width:"100%" }} prefix="" />
//                   </Form.Item>
//                 </Col>
//                 <Col span={8}>
//                   <Form.Item name={["applicationFee","obc"]} label="OBC ()">
//                     <InputNumber min={0} style={{ width:"100%" }} prefix="" />
//                   </Form.Item>
//                 </Col>
//               </Row>
//               <Row gutter={16}>
//                 <Col span={8}>
//                   <Form.Item name={["applicationFee","sc"]} label="SC ()">
//                     <InputNumber min={0} style={{ width:"100%" }} prefix="" />
//                   </Form.Item>
//                 </Col>
//                 <Col span={8}>
//                   <Form.Item name={["applicationFee","st"]} label="ST ()">
//                     <InputNumber min={0} style={{ width:"100%" }} prefix="" />
//                   </Form.Item>
//                 </Col>
//                 <Col span={8}>
//                   <Form.Item name={["applicationFee","pwd"]} label="PwD ()">
//                     <InputNumber min={0} style={{ width:"100%" }} prefix="" />
//                   </Form.Item>
//                 </Col>
//               </Row>

//               <Divider orientation="left" plain>Exam Pattern</Divider>
//               <Row gutter={16}>
//                 <Col span={6}>
//                   <Form.Item name={["examPattern","totalQuestions"]} label="Total Questions">
//                     <InputNumber min={1} style={{ width:"100%" }} />
//                   </Form.Item>
//                 </Col>
//                 <Col span={6}>
//                   <Form.Item name={["examPattern","duration"]} label="Duration (mins)">
//                     <InputNumber min={30} style={{ width:"100%" }} />
//                   </Form.Item>
//                 </Col>
//                 <Col span={6}>
//                   <Form.Item name={["examPattern","totalMarks"]} label="Total Marks">
//                     <InputNumber min={1} style={{ width:"100%" }} />
//                   </Form.Item>
//                 </Col>
//                 <Col span={6}>
//                   <Form.Item name={["examPattern","negativeMarking"]} label="Negative Marking" valuePropName="checked">
//                     <Switch />
//                   </Form.Item>
//                 </Col>
//               </Row>
//               <Divider orientation="left" plain> Pricing</Divider>

//               <Row gutter={16}>
//                 <Form.Item
//                   shouldUpdate={(prev, curr) =>
//                     prev.isPaid !== curr.isPaid ||
//                     prev.price !== curr.price ||
//                     prev.originalPrice !== curr.originalPrice
//                   }
//                 >
//                   {({ getFieldValue, setFieldsValue }) => {
//                     const isPaid = getFieldValue("isPaid");
//                     const price = getFieldValue("price") || 0;
//                     const originalPrice = getFieldValue("originalPrice") || 0;

//                     //  Auto calculate discount (UI only)
//                     let discount = 0;
//                     if (originalPrice > price && price > 0) {
//                       discount = Math.round(((originalPrice - price) / originalPrice) * 100);
//                     }

//                     //  Sync discount to form
//                     setFieldsValue({ discount });

//                     return (
//                       <Row gutter={16}>
//                         {/*  Paid Toggle */}
//                         <Col span={6}>
//                           <Form.Item
//                             name="isPaid"
//                             label="Paid Category"
//                             valuePropName="checked"
//                           >
//                             <Switch checkedChildren="Paid" unCheckedChildren="Free" />
//                           </Form.Item>
//                         </Col>

//                         {/*  Selling Price */}
//                         <Col span={6}>
//                           <Form.Item
//                             name="price"
//                             label="Selling Price ()"
//                             rules={
//                               isPaid
//                                 ? [{ required: true, message:"Enter selling price" }]
//                                 : []
//                             }
//                           >
//                             <InputNumber
//                               min={0}
//                               style={{ width:"100%" }}
//                               disabled={!isPaid}
//                             />
//                           </Form.Item>
//                         </Col>

//                         {/*  Original Price */}
//                         <Col span={6}>
//                           <Form.Item name="originalPrice" label="Original Price ()">
//                             <InputNumber
//                               min={0}
//                               style={{ width:"100%" }}
//                               disabled={!isPaid}
//                             />
//                           </Form.Item>
//                         </Col>

//                         {/*  Discount */}
//                         <Col span={6}>
//                           <Form.Item name="discount" label="Discount (%)">
//                             <InputNumber
//                               disabled
//                               style={{ width:"100%" }}
//                               value={discount}
//                             />
//                           </Form.Item>
//                         </Col>
//                       </Row>
//                     );
//                   }}
//                 </Form.Item>
//               </Row>
//               <Form.Item name={["examPattern","markingScheme"]} label="Marking Scheme">
//                 <Input placeholder="e.g. +4 for correct, -1 for wrong" />
//               </Form.Item>

//               <Form.Item name="eligibilityCriteria" label="Eligibility Criteria (one per line)">
//                 <TextArea rows={4} placeholder={"e.g.\nBachelor's degree in Engineering\nAge: 18-28 years"} />
//               </Form.Item>

//               <Form.Item name="syllabus" label="Syllabus Topics (one per line)">
//                 <TextArea rows={5} placeholder={"e.g.\nEngineering Mathematics\nGeneral Aptitude\nComputer Science"} />
//               </Form.Item>

//               {/* Admin-only notes */}
//               <Card size="small" style={{ marginBottom: 16, background:"#fffbf0", border:"1px solid #ffe58f", borderRadius: 8 }}>
//                 <Form.Item name="adminNotes" label={
//                   <Space>
//                     <Text strong style={{ color:"#d48806" }}>Admin Notes (Internal Only)</Text>
//                   </Space>
//                 } style={{ marginBottom: 0 }}>
//                   <TextArea rows={2} placeholder="Internal notes  not visible to teachers or students" />
//                 </Form.Item>
//               </Card>

//               <Form.Item style={{ marginBottom: 0 }}>
//                 <Space>
//                   <Button type="primary" htmlType="submit" loading={submitLoading}
//                     icon={editingCategory ? <EditOutlined /> : <PlusOutlined />}>
//                     {editingCategory ?"Update Category" :"Create Category"}
//                   </Button>
//                   <Button onClick={() => { setModalVisible(false); setEditingCategory(null); form.resetFields(); }}>
//                     Cancel
//                   </Button>
//                 </Space>
//               </Form.Item>
//             </Form>
//           </div>
//         </Modal>

//         {/* 
//             DETAIL DRAWER
//          */}
//         <Drawer
//           title={
//             <Space>
//               <Tag color="red" style={{ fontWeight: 700 }}>{selectedCategory?.code}</Tag>
//               {selectedCategory?.name}
//               {selectedCategory?.isFeatured && <Tag color="gold"> Featured</Tag>}
//             </Space>
//           }
//           placement="right"
//           width={620}
//           onClose={() => setDetailDrawerOpen(false)}
//           open={detailDrawerOpen}
//           extra={
//             <Space>
//               <Button icon={<EditOutlined />} type="primary"
//                 onClick={() => { setDetailDrawerOpen(false); if (selectedCategory) handleEdit(selectedCategory); }}>
//                 Edit
//               </Button>
//             </Space>
//           }
//         >
//           {selectedCategory && (
//             <div>
//               <Space wrap style={{ marginBottom: 16 }}>
//                 <Tag color={selectedCategory.isActive ?"success" :"default"}>
//                   {selectedCategory.isActive ?"Active" :"Inactive"}
//                 </Tag>
//                 <Tag color="blue">Year: {selectedCategory.year}</Tag>
//                 {selectedCategory.priority !== undefined && <Tag>Priority: {selectedCategory.priority}</Tag>}
//                 {selectedCategory.totalSeats && <Tag color="geekblue">Seats: {selectedCategory.totalSeats}</Tag>}
//               </Space>

//               {selectedCategory.createdBy && typeof selectedCategory.createdBy ==="object" && (
//                 <Card size="small" style={{ marginBottom: 16, background:"#f0f7ff", border:"1px solid #91caff" }}>
//                   <Space>
//                     <Avatar icon={<UserOutlined />} />
//                     <div>
//                       <Text strong style={{ color:"#1890ff" }}>
//                         Created by: {selectedCategory.createdBy.tname || selectedCategory.createdBy.name}
//                       </Text>
//                       <br />
//                       <Text type="secondary" style={{ fontSize: 11 }}>{selectedCategory.createdBy.email}</Text>
//                     </div>
//                   </Space>
//                 </Card>
//               )}

//               <Descriptions column={1} bordered size="small">
//                 <Descriptions.Item label="Description">{selectedCategory.description ||""}</Descriptions.Item>
//                 <Descriptions.Item label="Official Website">
//                   {selectedCategory.officialWebsite
//                     ? <a href={selectedCategory.officialWebsite} target="_blank" rel="noreferrer">{selectedCategory.officialWebsite}</a>
//                     :""}
//                 </Descriptions.Item>
//                 <Descriptions.Item label="Exam Date">
//                   {selectedCategory.examDate ? dayjs(selectedCategory.examDate).format("DD MMMM YYYY") :"Not set"}
//                 </Descriptions.Item>
//                 <Descriptions.Item label="Registration Period">
//                   {selectedCategory.registrationStartDate
//                     ? `${dayjs(selectedCategory.registrationStartDate).format("DD MMM YYYY")}  ${selectedCategory.registrationEndDate ? dayjs(selectedCategory.registrationEndDate).format("DD MMM YYYY") :"?"}`
//                     :""}
//                 </Descriptions.Item>
//                 <Descriptions.Item label="Result Date">
//                   {selectedCategory.resultDate ? dayjs(selectedCategory.resultDate).format("DD MMMM YYYY") :""}
//                 </Descriptions.Item>
//                 <Descriptions.Item label="Admit Card Date">
//                   {selectedCategory.admitCardDate ? dayjs(selectedCategory.admitCardDate).format("DD MMMM YYYY") :""}
//                 </Descriptions.Item>
//                 <Descriptions.Item label="Application Fees">
//                   {selectedCategory.applicationFee ? (
//                     <Space wrap>
//                       {Object.entries(selectedCategory.applicationFee).map(([k, v]) =>
//                         v != null ? <Tag key={k}>{k.toUpperCase()}: {v}</Tag> : null
//                       )}
//                     </Space>
//                   ) :""}
//                 </Descriptions.Item>
//                 <Descriptions.Item label="Exam Pattern">
//                   {selectedCategory.examPattern ? (
//                     <Space direction="vertical" size={0}>
//                       {selectedCategory.examPattern.totalQuestions && <span>Questions: {selectedCategory.examPattern.totalQuestions}</span>}
//                       {selectedCategory.examPattern.duration && <span>Duration: {selectedCategory.examPattern.duration} mins</span>}
//                       {selectedCategory.examPattern.totalMarks && <span>Total Marks: {selectedCategory.examPattern.totalMarks}</span>}
//                       {selectedCategory.examPattern.markingScheme && <span>Scheme: {selectedCategory.examPattern.markingScheme}</span>}
//                       <span>Negative Marking: {selectedCategory.examPattern.negativeMarking ?"Yes" :"No"}</span>
//                     </Space>
//                   ) :""}
//                 </Descriptions.Item>
//                 <Descriptions.Item label="Eligibility Criteria">
//                   {selectedCategory.eligibilityCriteria?.length ? (
//                     <ul style={{ margin: 0, paddingLeft: 16 }}>
//                       {selectedCategory.eligibilityCriteria.map((e, i) => <li key={i} style={{ fontSize: 12 }}>{e}</li>)}
//                     </ul>
//                   ) :""}
//                 </Descriptions.Item>
//                 <Descriptions.Item label="Syllabus Topics">
//                   {selectedCategory.syllabus?.length ? (
//                     <Space wrap>
//                       {selectedCategory.syllabus.map((s, i) => <Tag key={i} style={{ fontSize: 11 }}>{s}</Tag>)}
//                     </Space>
//                   ) :""}
//                 </Descriptions.Item>
//                 {selectedCategory.adminNotes && (
//                   <Descriptions.Item label="Admin Notes">
//                     <Text style={{ color:"#d48806" }}>{selectedCategory.adminNotes}</Text>
//                   </Descriptions.Item>
//                 )}
//                 <Descriptions.Item label="Created At">
//                   {dayjs(selectedCategory.createdAt).format("DD MMMM YYYY, HH:mm")}
//                 </Descriptions.Item>
//                 {selectedCategory.updatedAt && (
//                   <Descriptions.Item label="Last Updated">
//                     {dayjs(selectedCategory.updatedAt).format("DD MMMM YYYY, HH:mm")}
//                   </Descriptions.Item>
//                 )}
//               </Descriptions>

//               <div style={{ marginTop: 24 }}>
//                 <Space wrap>
//                   <Button type="primary" icon={<EditOutlined />}
//                     onClick={() => { setDetailDrawerOpen(false); handleEdit(selectedCategory); }}>
//                     Edit Category
//                   </Button>
//                   <Button onClick={() => toggleStatus(selectedCategory)}>
//                     {selectedCategory.isActive ?"Deactivate" :"Activate"}
//                   </Button>
//                   <Button onClick={() => toggleFeatured(selectedCategory)}>
//                     {selectedCategory.isFeatured ?"Unfeature" :" Feature"}
//                   </Button>
//                   <Button onClick={() => { setDetailDrawerOpen(false); handleDuplicate(selectedCategory); }}
//                     icon={<CopyOutlined />}>
//                     Duplicate
//                   </Button>
//                   <Popconfirm title="Delete this category?" onConfirm={() => { handleDelete(selectedCategory._id); setDetailDrawerOpen(false); }}
//                     okText="Delete" cancelText="Cancel" okType="danger">
//                     <Button danger icon={<DeleteOutlined />}>Delete</Button>
//                   </Popconfirm>
//                 </Space>
//               </div>
//             </div>
//           )}
//         </Drawer>

//         <Footer style={{ textAlign:"center", background:"transparent" }}>
//           <Text type="secondary"><b>© 2026 Draa Admin Panel. All Rights Reserved.</b></Text>
//         </Footer>
//       </Layout>
//     </Layout>
//   );
// };

// export default AdminExaminationCategoryManager;


import React, { useEffect, useState, useCallback, useMemo } from"react";
import {
  Form, Input, InputNumber, Button, DatePicker, Space, Typography, message,
  Popconfirm, Row, Col, Table, Layout, Switch, Tag, Card, Modal,
  Select, Avatar, Drawer, Descriptions, Alert, Tooltip, Progress,
  Segmented, Empty, Skeleton, Steps, Upload,
} from"antd";
import {
  PlusOutlined, DeleteOutlined, EditOutlined, EyeOutlined, UserOutlined,
  ReloadOutlined, FilterOutlined, ExportOutlined,
  TrophyOutlined, CheckCircleOutlined, ClockCircleOutlined, TeamOutlined,
  CalendarOutlined, FileTextOutlined, StarOutlined, CopyOutlined,
  DollarOutlined, BookOutlined, GlobalOutlined,
  BarChartOutlined, SettingOutlined, CheckSquareOutlined, UploadOutlined,
} from"@ant-design/icons";
import dayjs from"dayjs";
import axios from"axios";
import { useNavigate } from"react-router-dom";
import url, { BACKEND_UPLOAD_URL } from"../../url";
import Topbar from"./Topbar";
import Sidebar from"./Sidebar";
import { getUserRole } from"../../utils/global_auth";
import usePageTitle from '../../hooks/usePageTitle';

const { Title, Text } = Typography;
const { Content, Footer } = Layout;
const { TextArea } = Input;
const { Option } = Select;
const { Search } = Input;

//  Types 

interface ExaminationCategory {
  _id: string;
  name: string;
  code: string;
  description?: string;
  year: number;
  examDate?: string;
  registrationStartDate?: string;
  registrationEndDate?: string;
  resultDate?: string;
  admitCardDate?: string;
  applicationFee?: {
    general?: number; reserved?: number;
    obc?: number; sc?: number; st?: number; pwd?: number;
  };
  totalSeats?: number;
  examPattern?: {
    totalQuestions?: number; duration?: number;
    totalMarks?: number; negativeMarking?: boolean; markingScheme?: string;
  };
  eligibilityCriteria?: string[];
  syllabus?: string[];
  isActive: boolean;
  isFeatured?: boolean;
  isPaid?: boolean;
  price?: number;
  originalPrice?: number;
  discount?: number;
  priority?: number;
  officialWebsite?: string;
  adminNotes?: string;
  bannerImage?: string;
  brochurePdf?: string;
  createdBy?: string | { _id: string; name: string; email: string; tname?: string };
  createdAt: string;
  updatedAt?: string;
}

interface Teacher {
  _id: string;
  tname: string;
  temail: string;
  tspecialization?: string;
  tprofile?: string;
  Status: string;
}

interface LoginUser { aname?: string; aemail?: string; }

//  StatCard 

const StatCard = ({
  title, value, icon, color, sub, loading,
}: {
  title: string; value: string | number; icon: React.ReactNode;
  color: string; sub?: string; loading?: boolean;
}) => (
  <Card
    style={{ borderRadius: 12, border: `1px solid ${color}22`, height:"100%" }}
    bodyStyle={{ padding:"20px 24px" }}
    hoverable
  >
    {loading ? (
      <Skeleton active paragraph={{ rows: 1 }} title={false} />
    ) : (
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div style={{ flex: 1 }}>
          <Text type="secondary" style={{ fontSize: 11, fontWeight: 600, textTransform:"uppercase", letterSpacing: 0.5 }}>
            {title}
          </Text>
          <Title level={3} style={{ margin:"4px 0 0", color:"#1a1a1a", lineHeight: 1.2 }}>{value}</Title>
          {sub && <Text style={{ fontSize: 11, color:"#aaa", marginTop: 4, display:"block" }}>{sub}</Text>}
        </div>
        <div style={{
          width: 48, height: 48, borderRadius: 12, background: `${color}18`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize: 22, color, flexShrink: 0,
        }}>{icon}</div>
      </div>
    )}
  </Card>
);

//  FormSection 

const FormSection = ({
  title, children, style,
}: {
  title: React.ReactNode; children: React.ReactNode; style?: React.CSSProperties;
}) => (
  <div style={{
    border:"1px solid #f0f0f0",
    borderRadius: 10,
    padding:"16px 18px 4px",
    marginBottom: 14,
    background:"#fff",
    ...style,
  }}>
    <div style={{
      fontSize: 11, fontWeight: 700, textTransform:"uppercase",
      letterSpacing: 1, color:"#999",
      marginBottom: 14, paddingBottom: 10, borderBottom:"1px solid #f5f5f5",
    }}>
      {title}
    </div>
    {children}
  </div>
);

//  Main Component 

const AdminExaminationCategoryManager: React.FC = () => {
  usePageTitle('Examination Categories | Admin');
  const navigate = useNavigate();

  const [loginUser, setLoginUser] = useState<LoginUser | null>(null);
  const [examCategories, setExamCategories] = useState<ExaminationCategory[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExaminationCategory | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ExaminationCategory | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [creatorFilter, setCreatorFilter] = useState("all");
  const [paidFilter, setPaidFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewMode, setViewMode] = useState<"table" |"grid">("table");
  const [formStep, setFormStep] = useState(0);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

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
    setTeachersLoading(true);
    try {
      const res = await axios.get(`${url}/updateTeacherStatus/all`);
      if (res.data.success && res.data.data?.teachers) {
        setTeachers(res.data.data.teachers.filter((t: Teacher) => t.Status ==="approved"));
      } else {
        const fb = await axios.get(`${url}/count/getAllTeachers`);
        setTeachers(fb.data.Teachers ?? []);
      }
    } catch {
      try {
        const fb = await axios.get(`${url}/count/getAllTeachers`);
        setTeachers(fb.data.Teachers ?? []);
      } catch { message.error("Failed to load teachers"); }
    } finally { setTeachersLoading(false); }
  }, []);

  //  Fetch Categories 
  const fetchExamCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${url}/test-series/navigation/examinations`);
      if (res.data.success) {
        let categories = res.data.data.examinationCategories ?? [];
        
        // Filter for teachers
        const role = getUserRole();
        if (role ==='TEACHER' && (loginUser?._id || loginUser?.id)) {
          const currentId = loginUser._id || loginUser.id;
          categories = categories.filter((c: any) => {
            const creatorId = c.createdBy && typeof c.createdBy ==="object" ? c.createdBy._id : c.createdBy;
            return creatorId === currentId;
          });
        }
        
        setExamCategories(categories);
      }
    } catch { message.error("Failed to load examination categories"); }
    finally { setLoading(false); }
  }, [loginUser]);

  useEffect(() => {
    const role = getUserRole();
    if (role ==='ADMIN' || role ==='TEACHER') {
      fetchExamCategories();
      fetchTeachers();
    }
  }, [loginUser, fetchExamCategories, fetchTeachers]);

  //  Handle Edit 
  const handleEdit = (category: ExaminationCategory) => {
    setEditingCategory(category);
    setFormStep(0);
    form.setFieldsValue({
      name: category.name,
      code: category.code,
      description: category.description ??"",
      year: category.year,
      priority: category.priority ?? 0,
      isActive: category.isActive,
      isFeatured: category.isFeatured ?? false,
      totalSeats: category.totalSeats,
      officialWebsite: category.officialWebsite ??"",
      adminNotes: category.adminNotes ??"",
      isPaid: category.isPaid ?? false,
      price: category.price ?? 0,
      originalPrice: category.originalPrice ?? 0,
      discount: category.discount ?? 0,
      bannerImage: category.bannerImage ?? "",
      createdBy:
        category.createdBy && typeof category.createdBy ==="object"
          ? category.createdBy._id
          : category.createdBy ?? undefined,
      examDate: category.examDate ? dayjs(category.examDate) : null,
      registrationStartDate: category.registrationStartDate ? dayjs(category.registrationStartDate) : null,
      registrationEndDate: category.registrationEndDate ? dayjs(category.registrationEndDate) : null,
      resultDate: category.resultDate ? dayjs(category.resultDate) : null,
      admitCardDate: category.admitCardDate ? dayjs(category.admitCardDate) : null,
      applicationFee: {
        general: category.applicationFee?.general,
        reserved: category.applicationFee?.reserved,
        obc: category.applicationFee?.obc,
        sc: category.applicationFee?.sc,
        st: category.applicationFee?.st,
        pwd: category.applicationFee?.pwd,
      },
      examPattern: {
        totalQuestions: category.examPattern?.totalQuestions,
        duration: category.examPattern?.duration,
        totalMarks: category.examPattern?.totalMarks,
        negativeMarking: category.examPattern?.negativeMarking ?? false,
        markingScheme: category.examPattern?.markingScheme ??"",
      },
      eligibilityCriteria: (category.eligibilityCriteria ?? []).join("\n"),
      syllabus: (category.syllabus ?? []).join("\n"),
    });
    setModalVisible(true);
  };

  //  Submit 
  const handleSubmit = async (values: any) => {
    setSubmitLoading(true);
    try {
      if (values.isPaid && (!values.price || values.price <= 0)) {
        message.error("Please enter a valid price for paid category");
        return;
      }
      const payload = {
        ...values,
        examDate: values.examDate?.format("YYYY-MM-DD") ?? null,
        registrationStartDate: values.registrationStartDate?.format("YYYY-MM-DD") ?? null,
        registrationEndDate: values.registrationEndDate?.format("YYYY-MM-DD") ?? null,
        resultDate: values.resultDate?.format("YYYY-MM-DD") ?? null,
        admitCardDate: values.admitCardDate?.format("YYYY-MM-DD") ?? null,
        eligibilityCriteria: (values.eligibilityCriteria ??"")
          .split("\n").map((s: string) => s.trim()).filter(Boolean),
        syllabus: (values.syllabus ??"")
          .split("\n").map((s: string) => s.trim()).filter(Boolean),
        isPaid: values.isPaid ?? false,
        price: values.isPaid ? values.price || 0 : 0,
        originalPrice: values.isPaid ? values.originalPrice || 0 : 0,
        discount: undefined,
      };

      if (editingCategory) {
        await axios.put(`${url}/test-series/admin/examinations/${editingCategory._id}`, payload);
        message.success("Examination category updated successfully!");
      } else {
        await axios.post(`${url}/test-series/admin/examinations`, payload);
        message.success("Examination category created successfully!");
      }

      setModalVisible(false);
      setEditingCategory(null);
      setFormStep(0);
      form.resetFields();
      fetchExamCategories();
    } catch (err: any) {
      message.error(err.response?.data?.message ??"Failed to save examination category");
    } finally { setSubmitLoading(false); }
  };

  //  Delete 
  const handleDelete = async (id: string) => {
    setDeletingIds(prev => new Set(prev).add(id));
    try {
      await axios.delete(`${url}/test-series/admin/examinations/${id}`);
      message.success("Deleted successfully!");
      setExamCategories(prev => prev.filter(c => c._id !== id));
    } catch (err: any) {
      message.error(err.response?.data?.message ??"Failed to delete");
    } finally {
      setDeletingIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    }
  };

  //  Toggle Status 
  const toggleStatus = async (category: ExaminationCategory) => {
    try {
      await axios.patch(`${url}/test-series/admin/examinations/${category._id}/toggle`);
      message.success(`Category ${category.isActive ?"deactivated" :"activated"}!`);
      fetchExamCategories();
    } catch { message.error("Failed to update status"); }
  };

  //  Toggle Featured 
  const toggleFeatured = async (category: ExaminationCategory) => {
    try {
      await axios.patch(`${url}/test-series/admin/examinations/${category._id}`, {
        isFeatured: !category.isFeatured,
      });
      message.success(category.isFeatured ?"Unfeatured" :"Marked as featured!");
      fetchExamCategories();
    } catch { message.error("Failed to update featured status"); }
  };

  //  Duplicate 
  const handleDuplicate = (category: ExaminationCategory) => {
    setEditingCategory(null);
    setFormStep(0);
    form.resetFields();
    form.setFieldsValue({
      name: category.name +" (Copy)",
      code: category.code +"-COPY",
      description: category.description,
      year: new Date().getFullYear(),
      priority: category.priority ?? 0,
      isActive: false,
      bannerImage: category.bannerImage ?? "",
      isFeatured: false,
      totalSeats: category.totalSeats,
      applicationFee: category.applicationFee,
      examPattern: category.examPattern,
      eligibilityCriteria: (category.eligibilityCriteria ?? []).join("\n"),
      syllabus: (category.syllabus ?? []).join("\n"),
    });
    setModalVisible(true);
    message.info("Duplicated  update code & name before saving");
  };

  //  Export CSV 
  const handleExport = () => {
    const rows = [
"Name,Code,Year,Exam Date,Reg End,Total Seats,Status,Featured,Paid,Price,Priority,Created By,Created At",
      ...filteredCategories.map(c => {
        const creator = (c.createdBy && typeof c.createdBy ==="object")
          ? (c.createdBy.tname || c.createdBy.name)
          : (c.createdBy ??"");
        return [
          `"${c.name}"`, `"${c.code}"`, c.year,
          `"${c.examDate ??""}"`, `"${c.registrationEndDate ??""}"`,
          c.totalSeats ?? 0,
          `"${c.isActive ?"Active" :"Inactive"}"`,
          `"${c.isFeatured ?"Yes" :"No"}"`,
          `"${c.isPaid ?"Paid" :"Free"}"`,
          c.price ?? 0, c.priority ?? 0, `"${creator}"`,
          `"${dayjs(c.createdAt).format("YYYY-MM-DD")}"`,
        ].join(",");
      }),
    ].join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", `data:text/csv;charset=utf-8,${encodeURI(rows)}`);
    link.setAttribute("download", `exam-categories-${dayjs().format("YYYY-MM-DD")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success("Exported!");
  };

  //  Stats 
  const stats = useMemo(() => {
    const active = examCategories.filter(c => c.isActive).length;
    const featured = examCategories.filter(c => c.isFeatured).length;
    const paid = examCategories.filter(c => c.isPaid).length;
    const years = [...new Set(examCategories.map(c => c.year))];
    return { total: examCategories.length, active, inactive: examCategories.length - active, featured, paid, years };
  }, [examCategories]);

  //  Filtered data 
  const filteredCategories = useMemo(() => {
    return examCategories.filter(c => {
      const q = searchText.toLowerCase();
      const matchSearch = !q ||
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        (c.description ??"").toLowerCase().includes(q);
      const matchStatus =
        statusFilter ==="all" ||
        (statusFilter ==="active" && c.isActive) ||
        (statusFilter ==="inactive" && !c.isActive) ||
        (statusFilter ==="featured" && c.isFeatured);
      const matchYear = yearFilter ==="all" || c.year.toString() === yearFilter;
      const creatorId = c.createdBy && typeof c.createdBy ==="object" ? c.createdBy._id : (c.createdBy ?? null);
      const matchCreator = creatorFilter ==="all" || creatorId === creatorFilter;
      const matchPaid = paidFilter ==="all" || (paidFilter ==="paid" && c.isPaid) || (paidFilter ==="free" && !c.isPaid);
      return matchSearch && matchStatus && matchYear && matchCreator && matchPaid;
    });
  }, [examCategories, searchText, statusFilter, yearFilter, creatorFilter, paidFilter]);

  const uniqueYears = useMemo(
    () => [...new Set(examCategories.map(c => c.year))].sort((a, b) => b - a),
    [examCategories]
  );

  const clearFilters = () => {
    setSearchText(""); setStatusFilter("all"); setYearFilter("all");
    setCreatorFilter("all"); setPaidFilter("all"); setCurrentPage(1);
  };

  const isFiltered = !!(searchText || statusFilter !=="all" || yearFilter !=="all" || creatorFilter !=="all" || paidFilter !=="all");

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormStep(0);
    form.resetFields();
    form.setFieldsValue({ year: new Date().getFullYear(), isActive: true, priority: 0, isFeatured: false, isPaid: false });
    setModalVisible(true);
  };

  const activeRate = stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0;

  //  Grid Card 
  const ExamGridCard: React.FC<{ record: ExaminationCategory }> = ({ record: r }) => {
    const creator = r.createdBy && typeof r.createdBy ==="object"
      ? (r.createdBy.tname || r.createdBy.name)
      : (r.createdBy ??"");
    return (
      <Card
        hoverable
        style={{ borderRadius: 10, border:"1px solid #f0f0f0", height:"100%" }}
        cover={r.bannerImage ? (
          <img
            alt={r.name}
            src={r.bannerImage.startsWith("http") ? r.bannerImage : `${BACKEND_UPLOAD_URL}/${r.bannerImage}`}
            style={{ height: 140, objectFit: "cover", borderRadius: "10px 10px 0 0" }}
          />
        ) : undefined}
        bodyStyle={{ padding:"16px" }}
      >
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom: 10 }}>
          <Tag color="red" style={{ fontWeight: 700, letterSpacing: 1, fontSize: 11 }}>{r.code}</Tag>
          <Space size={4}>
            {r.isFeatured && <Tag color="gold" style={{ fontSize: 10 }}></Tag>}
            {r.isPaid && <Tag color="purple" style={{ fontSize: 10 }}>Paid</Tag>}
            <Tag color={r.isActive ?"success" :"default"} style={{ fontSize: 10 }}>
              {r.isActive ?"Active" :"Off"}
            </Tag>
          </Space>
        </div>
        <Text strong style={{ fontSize: 13, display:"block", marginBottom: 4, lineHeight: 1.4 }}>
          {r.name}
        </Text>
        {r.description && (
          <Text type="secondary" style={{ fontSize: 11, display:"block", marginBottom: 10 }} ellipsis={{ tooltip: r.description }}>
            {r.description}
          </Text>
        )}
        <div style={{ display:"flex", gap: 4, flexWrap:"wrap", marginBottom: 10 }}>
          <Tag style={{ fontSize: 10 }}>{r.year}</Tag>
          {r.totalSeats && <Tag style={{ fontSize: 10 }}> {r.totalSeats}</Tag>}
          {r.examPattern?.totalQuestions && <Tag style={{ fontSize: 10 }}>{r.examPattern.totalQuestions} Qs</Tag>}
          {r.examPattern?.duration && <Tag style={{ fontSize: 10 }}> {r.examPattern.duration}m</Tag>}
        </div>
        {r.examDate && (
          <div style={{ marginBottom: 8, fontSize: 11, color:"#666" }}>
            <CalendarOutlined style={{ marginRight: 4, fontSize: 10 }} />
            Exam: {dayjs(r.examDate).format("DD MMM YYYY")}
          </div>
        )}
        <div style={{ display:"flex", alignItems:"center", gap: 6, marginBottom: 12 }}>
          <Avatar size={16} icon={<UserOutlined />} style={{ background:"#f0f0f0", color:"#888" }} />
          <Text style={{ fontSize: 11, color:"#888" }}>{creator}</Text>
        </div>
        <div style={{ display:"flex", gap: 6, borderTop:"1px solid #f5f5f5", paddingTop: 10 }}>
          <Button size="small" icon={<EyeOutlined />} style={{ flex: 1, fontSize: 11 }}
            onClick={() => { setSelectedCategory(r); setDetailDrawerOpen(true); }}>View</Button>
          <Button size="small" type="primary" icon={<EditOutlined />} style={{ flex: 1, fontSize: 11 }}
            onClick={() => handleEdit(r)}>Edit</Button>
          {getUserRole() ==='ADMIN' && (
            <Popconfirm title="Delete this category?" description="Cannot be undone." onConfirm={() => handleDelete(r._id)} okType="danger">
              <Button size="small" danger icon={<DeleteOutlined />} loading={deletingIds.has(r._id)} />
            </Popconfirm>
          )}
        </div>
      </Card>
    );
  };

  //  Table Columns 
  const columns = [
    {
      title:"#",
      key:"index",
      width: 46,
      render: (_: any, __: any, idx: number) => (
        <Text type="secondary" style={{ fontSize: 11 }}>
          {(currentPage - 1) * pageSize + idx + 1}
        </Text>
      ),
    },
    {
      title: "Examination",
      key: "exam",
      width: 300,
      render: (_: any, r: ExaminationCategory) => (
        <div style={{ display: "flex", gap: 12, alignItems: "center", width: 280 }}>
          {r.bannerImage && (
            <Avatar
              shape="square"
              size={48}
              src={r.bannerImage.startsWith("http") ? r.bannerImage : `${BACKEND_UPLOAD_URL}/${r.bannerImage}`}
              style={{ flexShrink: 0, borderRadius: 6 }}
            />
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <Space size={6} style={{ marginBottom: 4 }} wrap>
              <Tag color="red" style={{ fontWeight: 700, letterSpacing: 1 }}>{r.code}</Tag>
              <Text strong style={{ cursor: "pointer", color: "#1890ff" }}
                onClick={() => { setSelectedCategory(r); setDetailDrawerOpen(true); }}>
                {r.name}
              </Text>
              {r.isFeatured && <Tag color="gold" style={{ fontSize: 10 }}> Featured</Tag>}
              {r.isPaid && <Tag color="purple" style={{ fontSize: 10 }}>Paid</Tag>}
            </Space>
            <div style={{ fontSize: 11, color: "#999" }}>
              Year: {r.year} | Priority: {r.priority ?? 0}
              {r.totalSeats ? ` | Seats: ${r.totalSeats.toLocaleString()}` : ""}
            </div>
            {r.description && (
              <Text type="secondary" style={{ fontSize: 11, display: "block", marginTop: 2 }} ellipsis={{ tooltip: r.description }}>
                {r.description}
              </Text>
            )}
          </div>
        </div>
      ),
    },
    // {
    //   title:"Created By",
    //   key:"createdBy",
    //   width: 180,
    //   render: (_: any, r: ExaminationCategory) => {
    //     const creator = r.createdBy && typeof r.createdBy ==="object" ? r.createdBy : null;
    //     const name = creator?.tname || creator?.name || (typeof r.createdBy ==="string" ? r.createdBy :"");
    //     const cId = creator?._id || (typeof r.createdBy ==="string" ? r.createdBy : null);
    //     const teacher = teachers.find(t => t._id === cId);
    //     return (
    //       <Space>
    //         <Avatar src={teacher?.tprofile} icon={<UserOutlined />} size="small" />
    //         <div>
    //           <Text style={{ fontSize: 12, display:"block" }}>{name}</Text>
    //           {creator?.email && <Text type="secondary" style={{ fontSize: 10 }}>{creator.email}</Text>}
    //         </div>
    //       </Space>
    //     );
    //   },
    // },
    {
      title:"Dates",
      key:"dates",
      width: 165,
      render: (_: any, r: ExaminationCategory) => (
        <Space direction="vertical" size={2}>
          {r.examDate && (
            <Tag color="blue" icon={<CalendarOutlined />} style={{ fontSize: 10 }}>
              Exam: {dayjs(r.examDate).format("DD/MM/YY")}
            </Tag>
          )}
          {r.registrationEndDate && (
            <Tag color="orange" style={{ fontSize: 10 }}>
              Reg End: {dayjs(r.registrationEndDate).format("DD/MM/YY")}
            </Tag>
          )}
          {r.resultDate && (
            <Tag color="green" style={{ fontSize: 10 }}>
              Result: {dayjs(r.resultDate).format("DD/MM/YY")}
            </Tag>
          )}
          {!r.examDate && !r.registrationEndDate && !r.resultDate && (
            <Text type="secondary" style={{ fontSize: 11 }}></Text>
          )}
        </Space>
      ),
    },
    {
      title:"Pattern",
      key:"pattern",
      width: 130,
      render: (_: any, r: ExaminationCategory) => (
        r.examPattern ? (
          <Space direction="vertical" size={0}>
            {r.examPattern.totalQuestions && <Text style={{ fontSize: 11 }}>Q: {r.examPattern.totalQuestions}</Text>}
            {r.examPattern.duration && <Text style={{ fontSize: 11 }}> {r.examPattern.duration}m</Text>}
            {r.examPattern.totalMarks && <Text style={{ fontSize: 11 }}> {r.examPattern.totalMarks} marks</Text>}
            {r.examPattern.negativeMarking && <Tag color="orange" style={{ fontSize: 10, padding:"0 4px" }}>ve Mark</Tag>}
          </Space>
        ) : <Text type="secondary" style={{ fontSize: 11 }}></Text>
      ),
    },
    {
      title:"Fees / Price",
      key:"fees",
      width: 120,
      render: (_: any, r: ExaminationCategory) => (
        r.isPaid ? (
          <Space direction="vertical" size={2}>
            <Text strong style={{ fontSize: 12, color:"#722ed1" }}>{r.price?.toLocaleString()}</Text>
            {r.originalPrice && r.originalPrice > (r.price ?? 0) && (
              <Text delete type="secondary" style={{ fontSize: 10 }}>{r.originalPrice}</Text>
            )}
            {r.discount && r.discount > 0 ? (
              <Tag color="red" style={{ fontSize: 10, padding:"0 4px" }}>{r.discount}% off</Tag>
            ) : null}
          </Space>
        ) : r.applicationFee?.general != null ? (
          <Space direction="vertical" size={1}>
            <Text style={{ fontSize: 11 }}>Gen: {r.applicationFee.general}</Text>
            {r.applicationFee.reserved != null && <Text style={{ fontSize: 11 }}>Res: {r.applicationFee.reserved}</Text>}
          </Space>
        ) : <Text type="secondary" style={{ fontSize: 11 }}></Text>
      ),
    },
    {
      title:"Status",
      key:"status",
      width: 110,
      render: (_: any, r: ExaminationCategory) => (
        <Tooltip title="Toggle Active/Inactive">
          <Switch checked={r.isActive} onChange={() => toggleStatus(r)}
            checkedChildren="Active" unCheckedChildren="Off" size="small" />
        </Tooltip>
      ),
    },
    {
      title:"Featured",
      key:"featured",
      width: 90,
      render: (_: any, r: ExaminationCategory) => (
        <Tooltip title="Toggle Featured">
          <Switch checked={r.isFeatured ?? false} onChange={() => toggleFeatured(r)}
            checkedChildren="" unCheckedChildren="No" size="small" />
        </Tooltip>
      ),
    },
    {
      title:"Created",
      dataIndex:"createdAt",
      width: 90,
      render: (t: string) => <Text style={{ fontSize: 11 }}>{dayjs(t).format("DD/MM/YY")}</Text>,
    },
    {
      title:"Actions",
      key:"actions",
      width: 180,
      fixed:"right" as const,
      render: (_: any, r: ExaminationCategory) => (
        <Space size={4} wrap>
          <Tooltip title="View Details">
            <Button type="text" size="small" icon={<EyeOutlined />}
              onClick={() => { setSelectedCategory(r); setDetailDrawerOpen(true); }} />
          </Tooltip>
          <Tooltip title="Edit">
            <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)} />
          </Tooltip>
          {getUserRole() ==='ADMIN' && (
            <>
              <Tooltip title="Duplicate">
                <Button type="text" size="small" icon={<CopyOutlined />} onClick={() => handleDuplicate(r)} />
              </Tooltip>
              <Popconfirm
                title="Delete this category?" description="Cannot be undone."
                onConfirm={() => handleDelete(r._id)}
                okText="Delete" cancelText="Cancel" okType="danger"
              >
                <Tooltip title="Delete">
                  <Button danger type="text" size="small" icon={<DeleteOutlined />} loading={deletingIds.has(r._id)} />
                </Tooltip>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  if (getUserRole() ==="GUEST") {
    return (
      <Layout style={{ minHeight:"100vh" }}>
        <Content style={{ display:"flex", justifyContent:"center", alignItems:"center" }}>
          <Alert message="Access Denied" description="Authentication required." type="error" showIcon />
        </Content>
      </Layout>
    );
  }

  const formSteps = [
    { title:"Basic Info" },
    { title:"Dates & Fees" },
    { title:"Pattern & Pricing" },
    { title:"Content" },
  ];

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
                <TrophyOutlined style={{ marginRight: 10, color:"#faad14" }} />
                Examination Category Management
              </Title>
              <Text style={{ color:"rgba(255,255,255,0.6)", fontSize: 14 }}>
                Admin Panel  Create, manage &amp; assign exam categories on behalf of teachers
              </Text>
            </div>
            <Space wrap>
              <Button icon={<ReloadOutlined />}
                onClick={() => { fetchExamCategories(); fetchTeachers(); }}
                loading={loading}
                style={{ background:"rgba(255,255,255,0.12)", color:"#fff", border:"1px solid rgba(255,255,255,0.25)", borderRadius: 8 }}>
                Refresh
              </Button>
              <Button icon={<ExportOutlined />} onClick={handleExport}
                style={{ background:"rgba(255,255,255,0.12)", color:"#fff", border:"1px solid rgba(255,255,255,0.25)", borderRadius: 8 }}>
                Export CSV
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal} style={{ borderRadius: 8 }}>
                Add Category
              </Button>
            </Space>
          </div>

          {/*  Stats  */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={12} sm={8} lg={4}>
              <StatCard title="Total" value={stats.total} icon={<FileTextOutlined />} color="#1890ff"
                sub={`${stats.years.length} year(s)`} loading={loading} />
            </Col>
            <Col xs={12} sm={8} lg={4}>
              <StatCard title="Active" value={stats.active} icon={<CheckCircleOutlined />} color="#52c41a"
                sub={`${activeRate}% of total`} loading={loading} />
            </Col>
            <Col xs={12} sm={8} lg={4}>
              <StatCard title="Inactive" value={stats.inactive} icon={<ClockCircleOutlined />} color="#faad14" loading={loading} />
            </Col>
            <Col xs={12} sm={8} lg={4}>
              <StatCard title="Featured" value={stats.featured} icon={<StarOutlined />} color="#eb2f96" loading={loading} />
            </Col>
            <Col xs={12} sm={8} lg={4}>
              <StatCard title="Teachers" value={teachers.length} icon={<TeamOutlined />} color="#722ed1"
                sub="approved & available" loading={loading} />
            </Col>
            <Col xs={12} sm={8} lg={4}>
              <Card hoverable style={{ borderRadius: 12, border:"1px solid #52c41a22", height:"100%" }} bodyStyle={{ padding:"20px 24px" }}>
                {loading ? <Skeleton active paragraph={{ rows: 1 }} title={false} /> : (
                  <>
                    <Text type="secondary" style={{ fontSize: 11, fontWeight: 600, textTransform:"uppercase" }}>Active Rate</Text>
                    <Title level={3} style={{ margin:"4px 0 6px", color:"#1a1a1a" }}>{activeRate}%</Title>
                    <Progress percent={activeRate} size="small" strokeColor="#52c41a" showInfo={false} />
                  </>
                )}
              </Card>
            </Col>
          </Row>

          {/*  Filters  */}
          <Card style={{ marginBottom: 16, borderRadius: 12 }} bodyStyle={{ padding:"14px 20px" }}>
            <Row gutter={[10, 10]} align="middle">
              <Col xs={24} sm={8} lg={6}>
                <Search placeholder="Search name, code, description..."
                  value={searchText} onChange={e => setSearchText(e.target.value)} allowClear />
              </Col>
              <Col xs={12} sm={4} lg={3}>
                <Select value={statusFilter} onChange={v => { setStatusFilter(v); setCurrentPage(1); }} style={{ width:"100%" }}>
                  <Option value="all">All Status</Option>
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                  <Option value="featured"> Featured</Option>
                </Select>
              </Col>
              <Col xs={12} sm={3} lg={2}>
                <Select value={yearFilter} onChange={v => { setYearFilter(v); setCurrentPage(1); }} style={{ width:"100%" }}>
                  <Option value="all">All Years</Option>
                  {uniqueYears.map(y => <Option key={y} value={y.toString()}>{y}</Option>)}
                </Select>
              </Col>
              <Col xs={12} sm={3} lg={2}>
                <Select value={paidFilter} onChange={v => { setPaidFilter(v); setCurrentPage(1); }} style={{ width:"100%" }}>
                  <Option value="all">All Plans</Option>
                  <Option value="paid">Paid</Option>
                  <Option value="free">Free</Option>
                </Select>
              </Col>
              <Col xs={12} sm={5} lg={4}>
                <Select value={creatorFilter} onChange={v => { setCreatorFilter(v); setCurrentPage(1); }}
                  style={{ width:"100%" }} placeholder="All Creators" showSearch optionFilterProp="children">
                  <Option value="all">All Creators</Option>
                  {teachers.map(t => <Option key={t._id} value={t._id}>{t.tname}</Option>)}
                </Select>
              </Col>
              <Col xs={12} sm={3} lg={2}>
                <Button icon={<FilterOutlined />} onClick={clearFilters} disabled={!isFiltered}>Clear</Button>
              </Col>
              <Col xs={12} sm={4} lg={2}>
                <Segmented
                  value={viewMode}
                  onChange={v => setViewMode(v as"table" |"grid")}
                  options={[{ value:"table", label:"Table" }, { value:"grid", label:"Grid" }]}
                />
              </Col>
            </Row>
          </Card>

          {isFiltered && (
            <Alert
              message={`Showing ${filteredCategories.length} of ${examCategories.length} categories`}
              type="info" showIcon closable style={{ marginBottom: 12, borderRadius: 8 }}
            />
          )}

          {/*  Table / Grid  */}
          {viewMode ==="table" ? (
            <Card
              title={
                <Space>
                  <TrophyOutlined style={{ color:"#faad14" }} />
                  <Text strong>Examination Categories ({filteredCategories.length})</Text>
                  {isFiltered && <Tag color="blue">Filtered</Tag>}
                </Space>
              }
              style={{ borderRadius: 12 }}
              bodyStyle={{ padding: 0 }}
            >
              <Table
                columns={columns}
                dataSource={filteredCategories}
                rowKey="_id"
                loading={loading}
                scroll={{ x: 1460 }}
                locale={{ emptyText: <Empty description="No examination categories found" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
                pagination={{
                  current: currentPage,
                  pageSize,
                  total: filteredCategories.length,
                  onChange: (p, s) => { setCurrentPage(p); setPageSize(s ?? 10); },
                  onShowSizeChange: (_, s) => { setCurrentPage(1); setPageSize(s); },
                  showSizeChanger: true,
                  showQuickJumper: true,
                  pageSizeOptions: ["10","20","50"],
                  showTotal: (tot, range) => `${range[0]}-${range[1]} of ${tot} categories`,
                  style: { padding:"12px 24px", borderTop:"1px solid #f0f0f0" },
                }}
                size="small"
              />
            </Card>
          ) : (
            <>
              {loading ? (
                <Row gutter={[14, 14]}>
                  {[...Array(6)].map((_, i) => (
                    <Col key={i} xs={24} sm={12} lg={8} xl={6}>
                      <Card bodyStyle={{ padding: 16 }} style={{ borderRadius: 10 }}><Skeleton active /></Card>
                    </Col>
                  ))}
                </Row>
              ) : filteredCategories.length === 0 ? (
                <Empty description="No examination categories found" />
              ) : (
                <>
                  <Row gutter={[14, 14]}>
                    {filteredCategories.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(r => (
                      <Col key={r._id} xs={24} sm={12} lg={8} xl={6}>
                        <ExamGridCard record={r} />
                      </Col>
                    ))}
                  </Row>
                  <div style={{ textAlign:"right", marginTop: 16 }}>
                    <Space>
                      <Button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}> Prev</Button>
                      <Text style={{ fontSize: 12 }}>
                        Page {currentPage} / {Math.max(1, Math.ceil(filteredCategories.length / pageSize))}
                      </Text>
                      <Button disabled={currentPage >= Math.ceil(filteredCategories.length / pageSize)}
                        onClick={() => setCurrentPage(p => p + 1)}>Next </Button>
                    </Space>
                  </div>
                </>
              )}
            </>
          )}
        </Content>

        {/* 
            CREATE / EDIT MODAL
         */}
        <Modal
          title={
            <Space>
              {editingCategory ? <EditOutlined style={{ color:"#1890ff" }} /> : <PlusOutlined style={{ color:"#52c41a" }} />}
              <span>{editingCategory ?"Edit" :"Create"} Examination Category</span>
              {editingCategory && <Tag color="blue">{editingCategory.code}</Tag>}
            </Space>
          }
          open={modalVisible}
          onCancel={() => { setModalVisible(false); setEditingCategory(null); setFormStep(0); form.resetFields(); }}
          footer={null}
          width={920}
          destroyOnClose
          style={{ top: 20 }}
        >
          <div style={{ padding:"14px 0 10px", borderBottom:"1px solid #f0f0f0", marginBottom: 16 }}>
            <Steps current={formStep} size="small" onChange={setFormStep}
              items={formSteps.map(s => ({ title: s.title }))} />
          </div>

          <div style={{ maxHeight:"74vh", overflowY:"auto", paddingRight: 4 }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{ year: new Date().getFullYear(), isActive: true, priority: 0, isFeatured: false, isPaid: false }}
            >

              {/*  Step 0: Basic Info  */}
              <div style={{ display: formStep === 0 ?"block" :"none" }}>
                <FormSection
                  title={<><UserOutlined style={{ marginRight: 6 }} />Assign to Teacher</>}
                  style={{ background:"#f0f7ff", border:"1px solid #bae0ff" }}
                >
                  <Row gutter={16} align="middle">
                    <Col xs={24} sm={15}>
                      <Form.Item
                        name="createdBy"
                        label="Teacher (Created By)"
                        rules={[{ required: true, message:"Please select a teacher" }]}
                        style={{ marginBottom: 0 }}
                      >
                        <Select showSearch placeholder="Select teacher to assign"
                          optionFilterProp="children" loading={teachersLoading} style={{ width:"100%" }}>
                          {teachers.map(t => (
                            <Option key={t._id} value={t._id}>
                              <Space>
                                <Avatar src={t.tprofile} icon={<UserOutlined />} size="small" />
                                {t.tname}
                                {t.tspecialization && (
                                  <Text type="secondary" style={{ fontSize: 11 }}> {t.tspecialization}</Text>
                                )}
                              </Space>
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={9}>
                      <Alert
                        message="Admin action  creating on behalf of selected teacher."
                        type="info" showIcon={false}
                        style={{ borderRadius: 7, fontSize: 11, padding:"6px 10px" }}
                      />
                    </Col>
                  </Row>
                </FormSection>

                <FormSection title={<><FileTextOutlined style={{ marginRight: 6 }} />Basic Information</>}>
                  <Row gutter={14}>
                    <Col span={16}>
                      <Form.Item name="name" label="Examination Name" rules={[{ required: true }]}>
                        <Input placeholder="e.g., Graduate Aptitude Test in Engineering" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="code" label="Code" rules={[{ required: true }]}>
                        <Input placeholder="e.g., GATE" style={{ textTransform:"uppercase" }}
                          onChange={e => form.setFieldValue("code", e.target.value.toUpperCase())} />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item name="description" label="Description">
                    <TextArea rows={2} placeholder="Brief description of the examination" />
                  </Form.Item>
                  <Row gutter={14}>
                    <Col span={12}>
                      <Form.Item name="bannerImage" label="Banner Image (URL / Path)">
                        <Input placeholder="e.g., /uploads/banners/... (Auto-populated on upload)" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Upload Banner File">
                        <Upload
                          maxCount={1}
                          customRequest={async ({ file, onSuccess, onError }: any) => {
                            const formData = new FormData();
                            formData.append("bannerImage", file);
                            try {
                              const res = await axios.post(`${url}/test-series/admin/examinations/upload-banner`, formData, {
                                headers: { 'Content-Type': 'multipart/form-data' }
                              });
                              if (res.data.success) {
                                form.setFieldValue("bannerImage", res.data.bannerImage);
                                message.success("Banner uploaded successfully!");
                                onSuccess?.(res.data);
                              } else {
                                throw new Error("Upload failed");
                              }
                            } catch (err) {
                              message.error("Banner upload failed!");
                              onError?.(err);
                            }
                          }}
                          showUploadList={false}
                        >
                          <Button icon={<UploadOutlined />}>Click to Upload Banner</Button>
                        </Upload>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item shouldUpdate={(prev, curr) => prev.bannerImage !== curr.bannerImage} style={{ marginBottom: 0 }}>
                    {({ getFieldValue }) => {
                      const img = getFieldValue("bannerImage");
                      if (!img) return null;
                      const imgSrc = img.startsWith("http") ? img : `${BACKEND_UPLOAD_URL}/${img}`;
                      return (
                        <div style={{ marginBottom: 16 }}>
                          <Text type="secondary" style={{ fontSize: 11, display: "block", marginBottom: 6 }}>Banner Preview:</Text>
                          <img src={imgSrc} alt="Banner Preview" style={{ maxWidth: "100%", maxHeight: 150, borderRadius: 8, objectFit: "cover", border: "1px solid #d9d9d9" }} />
                        </div>
                      );
                    }}
                  </Form.Item>
                  <Row gutter={14}>
                    <Col span={6}>
                      <Form.Item name="year" label="Year" rules={[{ required: true }]}>
                        <InputNumber min={2020} max={2035} style={{ width:"100%" }} />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item name="priority" label="Priority">
                        <InputNumber min={0} max={100} style={{ width:"100%" }} />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item name="totalSeats" label="Total Seats">
                        <InputNumber min={0} style={{ width:"100%" }} />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item name="officialWebsite" label="Official Website">
                        <Input placeholder="https://..." prefix={<GlobalOutlined style={{ color:"#bbb" }} />} />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={14}>
                    <Col span={8}>
                      <Form.Item name="isActive" label="Active Status" valuePropName="checked">
                        <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="isFeatured" label="Featured" valuePropName="checked">
                        <Switch checkedChildren=" Featured" unCheckedChildren="No" />
                      </Form.Item>
                    </Col>
                  </Row>
                </FormSection>
              </div>

              {/*  Step 1: Dates & Fees  */}
              <div style={{ display: formStep === 1 ?"block" :"none" }}>
                <FormSection title={<><CalendarOutlined style={{ marginRight: 6 }} />Important Dates</>}>
                  <Row gutter={14}>
                    <Col span={8}>
                      <Form.Item name="examDate" label="Exam Date">
                        <DatePicker style={{ width:"100%" }} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="registrationStartDate" label="Registration Start">
                        <DatePicker style={{ width:"100%" }} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="registrationEndDate" label="Registration End">
                        <DatePicker style={{ width:"100%" }} />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={14}>
                    <Col span={8}>
                      <Form.Item name="admitCardDate" label="Admit Card Date">
                        <DatePicker style={{ width:"100%" }} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="resultDate" label="Result Date">
                        <DatePicker style={{ width:"100%" }} />
                      </Form.Item>
                    </Col>
                  </Row>
                </FormSection>

                <FormSection title={<><DollarOutlined style={{ marginRight: 6 }} />Application Fees</>}>
                  <Row gutter={14}>
                    {[
                      { name:"general", label:"General" },
                      { name:"reserved", label:"Reserved" },
                      { name:"obc", label:"OBC" },
                      { name:"sc", label:"SC" },
                      { name:"st", label:"ST" },
                      { name:"pwd", label:"PwD" },
                    ].map(f => (
                      <Col key={f.name} xs={12} sm={8}>
                        <Form.Item name={["applicationFee", f.name]} label={`${f.label} ()`}>
                          <InputNumber min={0} style={{ width:"100%" }} prefix="" />
                        </Form.Item>
                      </Col>
                    ))}
                  </Row>
                </FormSection>
              </div>

              {/*  Step 2: Pattern & Pricing  */}
              <div style={{ display: formStep === 2 ?"block" :"none" }}>
                <FormSection title={<><BarChartOutlined style={{ marginRight: 6 }} />Exam Pattern</>}>
                  <Row gutter={14}>
                    <Col span={6}>
                      <Form.Item name={["examPattern","totalQuestions"]} label="Total Questions">
                        <InputNumber min={1} style={{ width:"100%" }} />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item name={["examPattern","duration"]} label="Duration (mins)">
                        <InputNumber min={30} style={{ width:"100%" }} />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item name={["examPattern","totalMarks"]} label="Total Marks">
                        <InputNumber min={1} style={{ width:"100%" }} />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item name={["examPattern","negativeMarking"]} label="Negative Marking" valuePropName="checked">
                        <Switch checkedChildren="Yes" unCheckedChildren="No" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item name={["examPattern","markingScheme"]} label="Marking Scheme">
                    <Input placeholder="e.g. +4 for correct, -1 for wrong" />
                  </Form.Item>
                </FormSection>

                <FormSection title={<><DollarOutlined style={{ marginRight: 6 }} />Pricing</>}>
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
                      
                      return (
                        <Row gutter={14}>
                          <Col span={6}>
                            <Form.Item name="isPaid" label="Category Type" valuePropName="checked">
                              <Switch checkedChildren="Paid" unCheckedChildren="Free" />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item name="price" label="Selling Price ()"
                              rules={isPaid ? [{ required: true, message:"Enter selling price" }] : []}>
                              <InputNumber min={0} style={{ width:"100%" }} disabled={!isPaid} />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item name="originalPrice" label="Original Price ()">
                              <InputNumber min={0} style={{ width:"100%" }} disabled={!isPaid} />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item label="Discount (%)">
                              <div style={{ 
                                padding:"4px 11px", 
                                background:"#f5f5f5", 
                                border:"1px solid #d9d9d9", 
                                borderRadius: 4,
                                height: 32,
                                display:'flex',
                                alignItems:'center'
                              }}>
                                <Text strong style={{ color: discount > 0 ?'#52c41a' :'#bfbfbf' }}>
                                  {discount}%
                                </Text>
                              </div>
                            </Form.Item>
                          </Col>
                        </Row>
                      );
                    }}
                  </Form.Item>
                </FormSection>
              </div>

              {/*  Step 3: Content  */}
              <div style={{ display: formStep === 3 ?"block" :"none" }}>
                <FormSection title={<><CheckSquareOutlined style={{ marginRight: 6 }} />Eligibility Criteria</>}>
                  <Form.Item name="eligibilityCriteria" label="One criterion per line">
                    <TextArea rows={5}
                      placeholder={"Bachelor's degree in Engineering\nAge: 18-28 years\nMinimum 60% in qualifying exam"} />
                  </Form.Item>
                </FormSection>

                <FormSection title={<><BookOutlined style={{ marginRight: 6 }} />Syllabus Topics</>}>
                  <Form.Item name="syllabus" label="One topic per line">
                    <TextArea rows={5} placeholder={"Engineering Mathematics\nGeneral Aptitude\nComputer Science"} />
                  </Form.Item>
                </FormSection>

                <Card size="small" style={{ marginBottom: 14, background:"#fffbf0", border:"1px solid #ffe58f", borderRadius: 8 }}>
                  <Form.Item name="adminNotes"
                    label={<Text strong style={{ color:"#d48806" }}><SettingOutlined style={{ marginRight: 6 }} />Admin Notes (Internal Only)</Text>}
                    style={{ marginBottom: 0 }}>
                    <TextArea rows={2} placeholder="Internal notes  not visible to teachers or students" />
                  </Form.Item>
                </Card>
              </div>

              {/*  Step Navigation Footer  */}
              <div style={{
                display:"flex", justifyContent:"space-between", alignItems:"center",
                paddingTop: 14, borderTop:"1px solid #f0f0f0", marginTop: 6,
              }}>
                <Button onClick={() => setFormStep(s => Math.max(0, s - 1))} disabled={formStep === 0}>
                   Back
                </Button>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Step {formStep + 1} / {formSteps.length}
                </Text>
                {formStep < formSteps.length - 1 ? (
                  <Button type="primary" onClick={() => setFormStep(s => Math.min(formSteps.length - 1, s + 1))}>
                    Next 
                  </Button>
                ) : (
                  <Space>
                    <Button type="primary" htmlType="submit" loading={submitLoading}
                      icon={editingCategory ? <EditOutlined /> : <PlusOutlined />}>
                      {editingCategory ?"Update Category" :"Create Category"}
                    </Button>
                    <Button onClick={() => { setModalVisible(false); setEditingCategory(null); setFormStep(0); form.resetFields(); }}>
                      Cancel
                    </Button>
                  </Space>
                )}
              </div>
              {formStep < formSteps.length - 1 && (
                <div style={{ textAlign:"center", marginTop: 8 }}>
                  <Button type="link" htmlType="submit" loading={submitLoading} style={{ fontSize: 12, color:"#aaa" }}>
                    Save now (skip remaining steps)
                  </Button>
                </div>
              )}
            </Form>
          </div>
        </Modal>

        {/* 
            DETAIL DRAWER
         */}
        <Drawer
          title={
            <Space>
              <Tag color="red" style={{ fontWeight: 700 }}>{selectedCategory?.code}</Tag>
              {selectedCategory?.name}
              {selectedCategory?.isFeatured && <Tag color="gold"> Featured</Tag>}
              {selectedCategory?.isPaid && <Tag color="purple">Paid</Tag>}
            </Space>
          }
          placement="right"
          width={640}
          onClose={() => setDetailDrawerOpen(false)}
          open={detailDrawerOpen}
          extra={
            <Space>
              <Button icon={<EditOutlined />} type="primary"
                onClick={() => { setDetailDrawerOpen(false); if (selectedCategory) handleEdit(selectedCategory); }}>
                Edit
              </Button>
            </Space>
          }
        >
          {selectedCategory && (
            <div>
              {selectedCategory.bannerImage && (
                <div style={{ marginBottom: 16, borderRadius: 8, overflow: "hidden", maxHeight: 180, border: "1px solid #f0f0f0" }}>
                  <img
                    src={selectedCategory.bannerImage.startsWith("http") ? selectedCategory.bannerImage : `${BACKEND_UPLOAD_URL}/${selectedCategory.bannerImage}`}
                    alt={selectedCategory.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              )}
              <Space wrap style={{ marginBottom: 16 }}>
                <Tag color={selectedCategory.isActive ?"success" :"default"}>
                  {selectedCategory.isActive ?"Active" :"Inactive"}
                </Tag>
                <Tag color="blue">Year: {selectedCategory.year}</Tag>
                {selectedCategory.priority !== undefined && <Tag>Priority: {selectedCategory.priority}</Tag>}
                {selectedCategory.totalSeats && <Tag color="geekblue">Seats: {selectedCategory.totalSeats.toLocaleString()}</Tag>}
              </Space>

              {selectedCategory.createdBy && typeof selectedCategory.createdBy ==="object" && (
                <Card size="small" style={{ marginBottom: 14, background:"#f0f7ff", border:"1px solid #bae0ff", borderRadius: 8 }}>
                  <Space>
                    <Avatar icon={<UserOutlined />} />
                    <div>
                      <Text strong style={{ color:"#1890ff", display:"block" }}>
                        Created by: {selectedCategory.createdBy.tname || selectedCategory.createdBy.name}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>{selectedCategory.createdBy.email}</Text>
                    </div>
                  </Space>
                </Card>
              )}

              {selectedCategory.isPaid && (
                <Card size="small" style={{ marginBottom: 14, background:"#f9f0ff", border:"1px solid #d3adf7", borderRadius: 8 }}>
                  <Space align="center">
                    <div>
                      <Text type="secondary" style={{ fontSize: 11, display:"block" }}>Selling Price</Text>
                      <Text strong style={{ fontSize: 20, color:"#722ed1" }}>{selectedCategory.price?.toLocaleString()}</Text>
                    </div>
                    {selectedCategory.originalPrice && selectedCategory.originalPrice > (selectedCategory.price ?? 0) && (
                      <div>
                        <Text type="secondary" style={{ fontSize: 11, display:"block" }}>Original</Text>
                        <Text delete type="secondary">{selectedCategory.originalPrice}</Text>
                      </div>
                    )}
                    {selectedCategory.discount && selectedCategory.discount > 0 ? (
                      <Tag color="red">{selectedCategory.discount}% OFF</Tag>
                    ) : null}
                  </Space>
                </Card>
              )}

              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Description">{selectedCategory.description ||""}</Descriptions.Item>
                <Descriptions.Item label="Official Website">
                  {selectedCategory.officialWebsite
                    ? <a href={selectedCategory.officialWebsite} target="_blank" rel="noreferrer">{selectedCategory.officialWebsite}</a>
                    :""}
                </Descriptions.Item>
                <Descriptions.Item label="Exam Date">
                  {selectedCategory.examDate ? dayjs(selectedCategory.examDate).format("DD MMMM YYYY") :""}
                </Descriptions.Item>
                <Descriptions.Item label="Registration Period">
                  {selectedCategory.registrationStartDate
                    ? `${dayjs(selectedCategory.registrationStartDate).format("DD MMM YYYY")}  ${selectedCategory.registrationEndDate
                      ? dayjs(selectedCategory.registrationEndDate).format("DD MMM YYYY") :"?"}`
                    :""}
                </Descriptions.Item>
                <Descriptions.Item label="Result Date">
                  {selectedCategory.resultDate ? dayjs(selectedCategory.resultDate).format("DD MMMM YYYY") :""}
                </Descriptions.Item>
                <Descriptions.Item label="Admit Card Date">
                  {selectedCategory.admitCardDate ? dayjs(selectedCategory.admitCardDate).format("DD MMMM YYYY") :""}
                </Descriptions.Item>
                <Descriptions.Item label="Application Fees">
                  {selectedCategory.applicationFee ? (
                    <Space wrap>
                      {Object.entries(selectedCategory.applicationFee).map(([k, v]) =>
                        v != null ? <Tag key={k}>{k.toUpperCase()}: {v}</Tag> : null
                      )}
                    </Space>
                  ) :""}
                </Descriptions.Item>
                <Descriptions.Item label="Exam Pattern">
                  {selectedCategory.examPattern ? (
                    <Space direction="vertical" size={0}>
                      {selectedCategory.examPattern.totalQuestions && <span>Questions: {selectedCategory.examPattern.totalQuestions}</span>}
                      {selectedCategory.examPattern.duration && <span>Duration: {selectedCategory.examPattern.duration} mins</span>}
                      {selectedCategory.examPattern.totalMarks && <span>Total Marks: {selectedCategory.examPattern.totalMarks}</span>}
                      {selectedCategory.examPattern.markingScheme && <span>Scheme: {selectedCategory.examPattern.markingScheme}</span>}
                      <span>Negative Marking: {selectedCategory.examPattern.negativeMarking ?"Yes" :"No"}</span>
                    </Space>
                  ) :""}
                </Descriptions.Item>
                <Descriptions.Item label="Eligibility Criteria">
                  {selectedCategory.eligibilityCriteria?.length ? (
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                      {selectedCategory.eligibilityCriteria.map((e, i) => <li key={i} style={{ fontSize: 12 }}>{e}</li>)}
                    </ul>
                  ) :""}
                </Descriptions.Item>
                <Descriptions.Item label="Syllabus Topics">
                  {selectedCategory.syllabus?.length ? (
                    <Space wrap>
                      {selectedCategory.syllabus.map((s, i) => <Tag key={i} style={{ fontSize: 11 }}>{s}</Tag>)}
                    </Space>
                  ) :""}
                </Descriptions.Item>
                {selectedCategory.adminNotes && (
                  <Descriptions.Item label="Admin Notes">
                    <Text style={{ color:"#d48806" }}>{selectedCategory.adminNotes}</Text>
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Created At">
                  {dayjs(selectedCategory.createdAt).format("DD MMMM YYYY, HH:mm")}
                </Descriptions.Item>
                {selectedCategory.updatedAt && (
                  <Descriptions.Item label="Last Updated">
                    {dayjs(selectedCategory.updatedAt).format("DD MMMM YYYY, HH:mm")}
                  </Descriptions.Item>
                )}
              </Descriptions>

              <div style={{ marginTop: 20 }}>
                <Row gutter={[8, 8]}>
                  <Col span={12}>
                    <Button block type="primary" icon={<EditOutlined />}
                      onClick={() => { setDetailDrawerOpen(false); handleEdit(selectedCategory); }}>
                      Edit Category
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button block onClick={() => toggleStatus(selectedCategory)}>
                      {selectedCategory.isActive ?"Deactivate" :"Activate"}
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button block onClick={() => toggleFeatured(selectedCategory)}>
                      {selectedCategory.isFeatured ?"Unfeature" :" Feature"}
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button block icon={<CopyOutlined />}
                      onClick={() => { setDetailDrawerOpen(false); handleDuplicate(selectedCategory); }}>
                      Duplicate
                    </Button>
                  </Col>
                  <Col span={24}>
                    <Popconfirm title="Delete this category?" description="Cannot be undone."
                      onConfirm={() => { handleDelete(selectedCategory._id); setDetailDrawerOpen(false); }}
                      okText="Delete" cancelText="Cancel" okType="danger">
                      <Button block danger icon={<DeleteOutlined />} loading={deletingIds.has(selectedCategory._id)}>
                        Delete Category
                      </Button>
                    </Popconfirm>
                  </Col>
                </Row>
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

export default AdminExaminationCategoryManager;