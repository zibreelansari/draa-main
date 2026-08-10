import { useEffect, useState } from"react";
import {
  Layout,
  Table,
  Button,
  Modal,
  message,
  Space,
  Card,
  Typography,
  Input,
  Tag,
  Tooltip,
  Avatar,
  Statistic,
  Row,
  Col,
  Dropdown,
  MenuProps,
  Badge,
  Descriptions,
  Divider,
  Select,
  DatePicker,
  Progress,
  Empty,
  Spin
} from"antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  EyeOutlined,
  FilterOutlined,
  DownloadOutlined,
  MoreOutlined,
  BookOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  GlobalOutlined,
  TrophyOutlined,
  UserOutlined,
  CalendarOutlined,
  TeamOutlined,
  StarOutlined,
  ReloadOutlined,
  ClearOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  PlayCircleOutlined,
  TagsOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from"@ant-design/icons";
import { useNavigate } from"react-router-dom";
import axios from"axios";
import Topbar from"./Topbar";
import Sidebar2 from"./Sidebar2";
import url, { getImageUrl } from"../../url";
import type { TableColumnsType, TableProps } from'antd';
import { getUserRole, getStoredUser, getAuthHeaders, redirectToLogin } from"../../utils/global_auth";

const { Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

// 
//  ENHANCED INTERFACE
// 

interface Teacher {
  _id: string;
  name: string;
  email: string;
  profile?: string;
  specialization?: string;
  status?: string;
  isVerified?: boolean;
}

interface Course {
  _id: string;
  title: string;
  short_desc: string;
  long_desc?: string;
  duration: number;
  price: number;
  actual_price?: number;
  discounted_price?: number;
  discount_percentage?: number;
  language: string;
  skill_level: string;
  course_category: string;
  coverphoto?: string;
  youtube_links?: string[];
  enrolled_count?: number;
  rating?: number;
  reviews_count?: number;
  isFeatured?: boolean;
  isApproved: boolean;
  teacher?: Teacher;
  teacher_id?: string;
  chapters_count?: number;
  chapters?: {
    chapter_name: string;
    youtube_video?: string;
    study_material?: string;
    practice_set?: string;
    other_materials?: string[];
  }[];
  tags?: string[];

  createdAt?: string;
  updatedAt?: string;
  status?: string;
}

interface CourseStats {
  total: number;
  approved: number;
  pending: number;
  featured: number;
  totalRevenue: number;
  avgDuration: number;
  avgRating: number;
  totalEnrollments: number;
}

interface FilterState {
  category: string | null;
  skill_level: string | null;
  language: string | null;
  priceRange: [number, number] | null;
  featured: boolean | null;
  approved: boolean | null;
  dateRange: [string, string] | null;
}

// 
//  MAIN COMPONENT
// 

const ManageCourses = () => {
  const navigate = useNavigate();

  // --- Auth state ---
  const [loginUser, setLoginUser] = useState<
    { _id?: string; id?: string; name?: string; tname?: string; aname?: string; role?: string } | null
  >(null);

  useEffect(() => {
    const role = getUserRole();

    //  Not logged in
    if (role ==="GUEST") {
      redirectToLogin(navigate, "Please login to continue");
      return;
    }

    //  Students not allowed
    if (role ==="STUDENT") {
      message.error("Access denied. Admin or Teacher only.", 5);
      navigate("/student-dashboard");
      return;
    }

    //  Any other invalid role
    if (role !=="ADMIN" && role !=="TEACHER") {
      redirectToLogin(navigate, "Unauthorized access");
      return;
    }

    // Load user
    const user = getStoredUser();
    if (!user) {
      redirectToLogin(navigate, "Session expired. Please login again.");
      return;
    }
    setLoginUser(user);
  }, [navigate]);

  // --- Course state ---
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>("");
  const [stats, setStats] = useState<CourseStats>({
    total: 0,
    approved: 0,
    pending: 0,
    featured: 0,
    totalRevenue: 0,
    avgDuration: 0,
    avgRating: 0,
    totalEnrollments: 0
  });

  // --- Filter state ---
  const [filters, setFilters] = useState<FilterState>({
    category: null,
    skill_level: null,
    language: null,
    priceRange: null,
    featured: null,
    approved: null,
    dateRange: null
  });

  // --- Modal state ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"delete" | "approve" | "view" | "reject" | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // --- Pagination state ---
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // 
  // FETCH COURSES (ENHANCED)
  // 

  const fetchCourses = async () => {
    if (!loginUser) return;

    setLoading(true);

    try {
      let endpoint = "";

      let params: any = {
        page: pagination.current,
        limit: pagination.pageSize,
        sortBy: "createdAt",
        sortOrder: "desc"
      };

      // Apply filters
      if (searchText) params.search = searchText;
      if (filters.category) params.category = filters.category;
      if (filters.skill_level) params.skill_level = filters.skill_level;
      if (filters.language) params.language = filters.language;
      if (filters.featured !== null) params.featured = filters.featured;

      if (filters.priceRange) {
        params.priceMin = filters.priceRange[0];
        params.priceMax = filters.priceRange[1];
      }

      // Determine endpoint based on role
      const currentRole = getUserRole();
      if (currentRole === "ADMIN") {
        endpoint = `${url}/course/allCourses`;
      } else if (currentRole === "TEACHER") {
        const userId = loginUser.id || loginUser._id;
        if (userId) {
          endpoint = `${url}/course/courseDetails/teacher/${userId}`;
        } else {
          endpoint = `${url}/course/allCourses`;
        }
      } else {
        endpoint = `${url}/course/allCourses`;
      }

      if (!endpoint) return;

      const response = await axios.get(endpoint, { 
        params,
        headers: {
          ...getAuthHeaders()
        }
      });

      const coursesData =
        response.data.data?.courses ||
        response.data.courses ||
        [];

      const paginationData = response.data.data?.pagination || {};

      //  FETCH REVIEWS FOR EACH COURSE
      const coursesWithReviews = await Promise.all(
        coursesData.map(async (course: Course) => {
          try {
            const reviewRes = await axios.get(
              `${url}/course/review/${course._id}`,
              {
                headers: {
                  ...getAuthHeaders()
                }
              }
            );

            return {
              ...course,
              rating: parseFloat(reviewRes.data.averageRating) || 0,
              reviews_count: reviewRes.data.total || 0
            };
          } catch (error) {
            console.warn("Review fetch failed for course:", course._id);

            return {
              ...course,
              rating: 0,
              reviews_count: 0
            };
          }
        })
      );

      setCourses(coursesWithReviews);
      setFilteredCourses(coursesWithReviews);

      setPagination(prev => ({
        ...prev,
        total: paginationData.totalCount || coursesWithReviews.length,
        current: paginationData.currentPage || prev.current
      }));

      //  Recalculate stats using updated data
      calculateStats(coursesWithReviews);

    } catch (err: any) {
      console.error("Error fetching courses:", err);

      message.error(
        err.response?.data?.message ||"Failed to fetch courses"
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [loginUser, pagination.current, pagination.pageSize, searchText, filters]);

  // 
  //  CALCULATE STATISTICS
  // 

  const calculateStats = (coursesData: Course[]) => {
    const approved = coursesData.filter(c => c.isApproved).length;
    const pending = coursesData.filter(c => !c.isApproved).length;
    const featured = coursesData.filter(c => c.isFeatured).length;
    const totalRevenue = coursesData.reduce((sum, c) => sum + (c.price || 0), 0);
    const avgDuration = coursesData.length > 0
      ? Math.round(coursesData.reduce((sum, c) => sum + (c.duration || 0), 0) / coursesData.length)
      : 0;
    const avgRating = coursesData.length > 0
      ? (coursesData.reduce((sum, c) => sum + (c.rating || 0), 0) / coursesData.length).toFixed(1)
      : 0;
    const totalEnrollments = coursesData.reduce((sum, c) => sum + (c.enrolled_count || 0), 0);

    setStats({
      total: coursesData.length,
      approved,
      pending,
      featured,
      totalRevenue,
      avgDuration,
      avgRating: parseFloat(avgRating.toString()),
      totalEnrollments
    });
  };

  // 
  //  SEARCH & FILTER HANDLERS
  // 

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      category: null,
      skill_level: null,
      language: null,
      priceRange: null,
      featured: null,
      approved: null,
      dateRange: null
    });
    setSearchText("");
    message.success("Filters cleared");
  };

  const handleRefresh = () => {
    message.loading("Refreshing courses...", 1);
    fetchCourses();
  };

  // 
  //  MODAL HANDLERS (ENHANCED)
  // 

  const showModal = (type:"delete" |"approve" |"view" |"reject", course: Course) => {
    setSelectedCourse(course);
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    if (!selectedCourse || !modalType) return;

    setActionLoading(true);
    try {
      if (modalType ==="delete") {
        await axios.delete(`${url}/course/deleteCourse/${selectedCourse._id}`, {
          headers: {
            ...getAuthHeaders()
          }
        });
        message.success(" Course deleted successfully");
        fetchCourses();
      } else if (modalType ==="approve") {
        await axios.put(`${url}/course/UpdateCourseApprovalStatus/${selectedCourse._id}`, {
          isApproved: true
        }, {
          headers: {
            ...getAuthHeaders()
          }
        });
        message.success(" Course approved successfully");
        fetchCourses();
      } else if (modalType ==="reject") {
        await axios.put(`${url}/course/UpdateCourseApprovalStatus/${selectedCourse._id}`, {
          isApproved: false
        }, {
          headers: {
            ...getAuthHeaders()
          }
        });
        message.success("Course rejected");
        fetchCourses();
      }
    } catch (err: any) {
      console.error(err);
      message.error(err.response?.data?.message ||"Action failed");
    } finally {
      setActionLoading(false);
      setIsModalOpen(false);
      setModalType(null);
      setSelectedCourse(null);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setModalType(null);
    setSelectedCourse(null);
  };

  // 
  //  UI HELPERS
  // 

  const getSkillLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case'beginner': return'green';
      case'intermediate': return'orange';
      case'advanced': return'red';
      default: return'blue';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = ['purple','cyan','magenta','volcano','geekblue','lime'];
    const hash = category?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
    return colors[hash % colors.length];
  };

  // 
  //  EXPORT HANDLERS
  // 

  const handleExportCSV = () => {
    try {
      const headers = ['Title','Category','Price','Duration','Language','Level','Enrolled','Rating','Status'];
      const csvContent = [
        headers.join(','),
        ...filteredCourses.map(course => [
          `"${course.title}"`,
          course.course_category,
          course.price,
          course.duration,
          course.language,
          course.skill_level,
          course.enrolled_count || 0,
          course.rating || 0,
          course.isApproved ?'Approved' :'Pending'
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type:'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `courses_export_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      message.success(" Courses exported to CSV");
    } catch (error) {
      message.error("Export failed");
    }
  };

  // 
  //  ACTION MENU
  // 

  const getActionMenu = (record: Course): MenuProps => ({
    items: [
      {
        key:'view',
        icon: <EyeOutlined />,
        label:'View Details',
        onClick: () => showModal("view", record)
      },
      {
        key:'edit',
        icon: <EditOutlined />,
        label:'Edit Course',
        onClick: () => navigate(`/updateCourse/${record._id}`)
      },
      ...(("aname" in (loginUser || {})) && !record.isApproved ? [{
        key:'approve',
        icon: <CheckCircleOutlined style={{ color:'#52c41a' }} />,
        label: <span style={{ color:'#52c41a' }}>Approve Course</span>,
        onClick: () => showModal("approve", record)
      }] : []),
      ...(("aname" in (loginUser || {})) && record.isApproved ? [{
        key:'reject',
        icon: <CloseCircleOutlined style={{ color:'#faad14' }} />,
        label: <span style={{ color:'#faad14' }}>Reject Course</span>,
        onClick: () => showModal("reject", record)
      }] : []),
      {
        type:'divider' as const
      },
      {
        key:'delete',
        icon: <DeleteOutlined />,
        label: <span style={{ color:'#ff4d4f' }}>Delete Course</span>,
        danger: true,
        onClick: () => showModal("delete", record)
      }
    ]
  });

  // 
  //  TABLE COLUMNS (FULLY ENHANCED)
  // 

  const columns: TableColumnsType<Course> = [
    {
      title:'Course Details',
      key:'course',
      width: 320,
      fixed:'left',
      render: (_: any, record: Course) => (
        <div style={{ display:'flex', gap: 12 }}>
          <img
            src={getImageUrl(record.coverphoto || "")}
            alt={record.title || "Course Cover"}
            style={{
              backgroundColor: record.coverphoto ?'transparent' :'#1890ff',
              flexShrink: 0,
              border:'2px solid #f0f0f0',
              width:'80px',
              height:'80px',
              borderRadius:"50px",
              objectFit: "cover"
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ marginBottom: 4 }}>
              <Text strong style={{ fontSize: 14, display:'block' }}>
                {record.title}
              </Text>
              {record.isFeatured && (
                <Tag icon={<StarOutlined />} color="gold" style={{ marginTop: 4 }}>
                  Featured
                </Tag>
              )}
            </div>
            <Paragraph
              ellipsis={{ rows: 2 }}
              type="secondary"
              style={{ fontSize: 12, margin: 0 }}
            >
              {record.short_desc}
            </Paragraph>
            <Space size={4} style={{ marginTop: 4 }}>
              <Tag
                color={getCategoryColor(record.course_category)}
                style={{ fontSize: 11, padding:'0 6px' }}
              >
                {record.course_category}
              </Tag>
              {record.isApproved ? (
                <Tag icon={<CheckCircleOutlined />} color="success" style={{ fontSize: 11 }}>
                  Approved
                </Tag>
              ) : (
                <Tag icon={<ClockCircleOutlined />} color="warning" style={{ fontSize: 11 }}>
                  Pending
                </Tag>
              )}
            </Space>
          </div>
        </div>
      ),
      sorter: (a: Course, b: Course) => a.title.localeCompare(b.title),
    },

    {
      title:'Pricing',
      key:'pricing',
      width: 140,
      render: (_: any, record: Course) => (
        <div>
          <div style={{ display:'flex', alignItems:'center', gap: 6, marginBottom: 4 }}>
            <DollarOutlined style={{ color:'#52c41a' }} />
            <Text strong style={{ fontSize: 15, color:'#52c41a' }}>
              {record.discounted_price || record.price}
            </Text>
          </div>
          {record.discount_percentage && record.discount_percentage > 0 && (
            <>
              <Text delete type="secondary" style={{ fontSize: 12, display:'block' }}>
                {record.actual_price || record.price}
              </Text>
              <Tag color="red" style={{ fontSize: 11, marginTop: 2 }}>
                {record.discount_percentage}% OFF
              </Tag>
            </>
          )}
        </div>
      ),
      sorter: (a: Course, b: Course) => (a.price || 0) - (b.price || 0),
    },
    {
      title:'Duration',
      dataIndex:'duration',
      key:'duration',
      width: 110,
      render: (duration: number) => (
        <div style={{ display:'flex', alignItems:'center', gap: 6 }}>
          <ClockCircleOutlined style={{ color:'#1890ff' }} />
          <Text>{duration} min</Text>
        </div>
      ),
      sorter: (a: Course, b: Course) => (a.duration || 0) - (b.duration || 0),
    },
    {
      title:'Language',
      dataIndex:'language',
      key:'language',
      width: 100,
      render: (language: string) => (
        <Tag icon={<GlobalOutlined />} color="blue">
          {language}
        </Tag>
      ),
    },
    {
      title:'Level',
      dataIndex:'skill_level',
      key:'skill_level',
      width: 120,
      render: (level: string) => (
        <Tag
          icon={<TrophyOutlined />}
          color={getSkillLevelColor(level)}
        >
          {level}
        </Tag>
      ),
    },
    {
      title:'Stats',
      key:'stats',
      width: 120,
      render: (_: any, record: Course) => (
        <div>
          <div style={{ display:'flex', alignItems:'center', gap: 6, marginBottom: 4 }}>
            <TeamOutlined style={{ color:'#722ed1' }} />
            <Text style={{ fontSize: 13 }}>{record.enrolled_count || 0} enrolled</Text>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap: 6 }}>
            <StarOutlined style={{ color:'#faad14' }} />
            <StarOutlined style={{ color:'#faad14' }} />
            <Text style={{ fontSize: 13 }}>
              {record.rating?.toFixed(1) ||'0.0'} ({record.reviews_count || 0})
            </Text>
          </div>
        </div>
      ),
      sorter: (a: Course, b: Course) => (a.enrolled_count || 0) - (b.enrolled_count || 0),
    },
    {
      title:'Chapters',
      key:'chapters',
      width: 90,
      align:'center',
      render: (_: any, record: Course) => (
        <Badge
          count={record.chapters?.length || 0}
          showZero
          style={{ backgroundColor:'#1890ff' }}
        />
      ),
    },
    {
      title:'Actions',
      key:'actions',
      width: 80,
      align:'center',
      fixed:'right',
      render: (_: any, record: Course) => (
        <Dropdown menu={getActionMenu(record)} trigger={['click']} placement="bottomRight">
          <Button
            type="text"
            icon={<MoreOutlined style={{ fontSize: 18 }} />}
            style={{
              display:'flex',
              alignItems:'center',
              justifyContent:'center'
            }}
          />
        </Dropdown>
      ),
    },
  ];

  // 
  //  MODAL CONTENT RENDERER (ENHANCED)
  // 

  const renderModalContent = () => {
    if (modalType ==="view" && selectedCourse) {
      return (
        <div style={{ maxHeight:'65vh', overflowY:'auto', padding:'4px 0' }}>
          {/* Header Section */}
          <div style={{ display:'flex', gap: 20, marginBottom: 24, alignItems:'flex-start' }}>
            <Avatar
              size={80}
              src={getImageUrl(selectedCourse.coverphoto || "")}
              icon={!selectedCourse.coverphoto && <BookOutlined />}
              style={{
                backgroundColor: selectedCourse.coverphoto ?'transparent' :'#1890ff',
                border:'3px solid #f0f0f0',
                flexShrink: 0
              }}
            />
            <div style={{ flex: 1 }}>
              <Title level={3} style={{ margin: 0, marginBottom: 8 }}>
                {selectedCourse.title}
              </Title>
              <Space wrap style={{ marginBottom: 12 }}>
                <Tag
                  icon={<TrophyOutlined />}
                  color={getSkillLevelColor(selectedCourse.skill_level)}
                >
                  {selectedCourse.skill_level}
                </Tag>
                <Tag icon={<GlobalOutlined />} color="blue">
                  {selectedCourse.language}
                </Tag>
                <Tag color={getCategoryColor(selectedCourse.course_category)}>
                  {selectedCourse.course_category}
                </Tag>
                {selectedCourse.isFeatured && (
                  <Tag icon={<StarOutlined />} color="gold">
                    Featured
                  </Tag>
                )}
                {selectedCourse.isApproved ? (
                  <Tag icon={<CheckCircleOutlined />} color="success">
                    Approved
                  </Tag>
                ) : (
                  <Tag icon={<ClockCircleOutlined />} color="warning">
                    Pending Approval
                  </Tag>
                )}
              </Space>
              <Paragraph type="secondary" style={{ margin: 0 }}>
                {selectedCourse.short_desc}
              </Paragraph>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <Row gutter={[12, 12]} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card size="small" style={{ textAlign:'center', background:'#f0f5ff' }}>
                <Statistic
                  title="Price"
                  value={selectedCourse.discounted_price || selectedCourse.price}
                  prefix=""
                  valueStyle={{ color:'#52c41a', fontSize: 20 }}
                />
                {selectedCourse.discount_percentage && selectedCourse.discount_percentage > 0 && (
                  <Tag color="red" style={{ marginTop: 8 }}>
                    {selectedCourse.discount_percentage}% OFF
                  </Tag>
                )}
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small" style={{ textAlign:'center', background:'#f6ffed' }}>
                <Statistic
                  title="Enrolled"
                  value={selectedCourse.enrolled_count || 0}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color:'#722ed1', fontSize: 20 }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small" style={{ textAlign:'center', background:'#fffbe6' }}>
                <Statistic
                  title="Rating"
                  value={selectedCourse.rating || 0}
                  suffix="/ 5"
                  prefix={<StarOutlined />}
                  valueStyle={{ color:'#faad14', fontSize: 20 }}
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  ({selectedCourse.reviews_count || 0} reviews)
                </Text>
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small" style={{ textAlign:'center', background:'#e6f7ff' }}>
                <Statistic
                  title="Duration"
                  value={selectedCourse.duration}
                  suffix="min"
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color:'#1890ff', fontSize: 20 }}
                />
              </Card>
            </Col>
          </Row>

          {/* Main Details */}
          <Descriptions
            bordered
            column={2}
            size="small"
            style={{ marginBottom: 20 }}
            labelStyle={{ fontWeight: 600, background:'#fafafa' }}
          >
            <Descriptions.Item
              label={<><BookOutlined style={{ marginRight: 6 }} />Course ID</>}
              span={2}
            >
              <Text code copyable>{selectedCourse._id}</Text>
            </Descriptions.Item>

            {selectedCourse.teacher && (
              <>
                <Descriptions.Item
                  label={<><UserOutlined style={{ marginRight: 6 }} />Instructor</>}
                >
                  <Space>
                    <Avatar size={24} src={selectedCourse.teacher.profile} icon={<UserOutlined />} />
                    <Text strong>{selectedCourse.teacher.name}</Text>
                    {selectedCourse.teacher.isVerified && (
                      <Tag icon={<CheckCircleOutlined />} color="blue" style={{ fontSize: 11 }}>
                        Verified
                      </Tag>
                    )}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Specialization">
                  {selectedCourse.teacher.specialization ||'N/A'}
                </Descriptions.Item>
              </>
            )}

            <Descriptions.Item label={<><DollarOutlined style={{ marginRight: 6 }} />Original Price</>}>
              {selectedCourse.actual_price || selectedCourse.price}
            </Descriptions.Item>
            <Descriptions.Item label="Discounted Price">
              <Text strong style={{ color:'#52c41a', fontSize: 16 }}>
                {selectedCourse.discounted_price || selectedCourse.price}
              </Text>
            </Descriptions.Item>

            <Descriptions.Item label={<><BookOutlined style={{ marginRight: 6 }} />Chapters</>}>
              <Badge count={selectedCourse.chapters_count || 0} showZero style={{ backgroundColor:'#1890ff' }} />
            </Descriptions.Item>
            <Descriptions.Item label={<><PlayCircleOutlined style={{ marginRight: 6 }} />Videos</>}>
              {selectedCourse.youtube_links?.length || 0}
            </Descriptions.Item>

            <Descriptions.Item
              label={<><CalendarOutlined style={{ marginRight: 6 }} />Created</>}
            >
              {selectedCourse.createdAt
                ? new Date(selectedCourse.createdAt).toLocaleDateString('en-US', {
                  year:'numeric',
                  month:'long',
                  day:'numeric'
                })
                :'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Last Updated">
              {selectedCourse.updatedAt
                ? new Date(selectedCourse.updatedAt).toLocaleDateString('en-US', {
                  year:'numeric',
                  month:'long',
                  day:'numeric'
                })
                :'N/A'}
            </Descriptions.Item>
          </Descriptions>

          {/* Long Description */}
          {selectedCourse.long_desc && (
            <>
              <Divider orientation="left">
                <Space>
                  <BookOutlined />
                  Course Description
                </Space>
              </Divider>
              <Card
                style={{
                  backgroundColor:'#fafafa',
                  border:'1px solid #e8e8e8',
                  borderRadius: 8,
                  marginBottom: 20
                }}
              >
                <Paragraph style={{ fontSize: 14, lineHeight: 1.8, margin: 0 }}>
                  {selectedCourse.long_desc}
                </Paragraph>
              </Card>
            </>
          )}

          {/* Tags */}
          {selectedCourse.tags && selectedCourse.tags.length > 0 && (
            <>
              <Divider orientation="left">
                <Space>
                  <TagsOutlined />
                  Tags
                </Space>
              </Divider>
              <Space wrap style={{ marginBottom: 20 }}>
                {selectedCourse.tags.map((tag, index) => (
                  <Tag key={index} color="processing" style={{ fontSize: 13, padding:'4px 10px' }}>
                    {tag}
                  </Tag>
                ))}
              </Space>
            </>
          )}

          {/* Performance Metrics */}
          <Divider orientation="left">
            <Space>
              <BarChartOutlined />
              Performance Metrics
            </Space>
          </Divider>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card size="small">
                <Text type="secondary" style={{ display:'block', marginBottom: 8 }}>
                  Enrollment Rate
                </Text>
                <Progress
                  percent={Math.min(((selectedCourse.enrolled_count || 0) / 100) * 100, 100)}
                  strokeColor="#722ed1"
                  format={(percent) => `${selectedCourse.enrolled_count || 0} students`}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small">
                <Text type="secondary" style={{ display:'block', marginBottom: 8 }}>
                  Rating Performance
                </Text>
                <Progress
                  percent={((selectedCourse.rating || 0) / 5) * 100}
                  strokeColor="#faad14"
                  format={() => `${selectedCourse.rating?.toFixed(1) ||'0.0'} / 5.0`}
                />
              </Card>
            </Col>
          </Row>
          {/* Chapters Section */}
          {selectedCourse.chapters && selectedCourse.chapters.length > 0 && (
            <>
              <Divider orientation="left">
                <Space>
                  <BookOutlined />
                  Course Chapters & Resources
                </Space>
              </Divider>

              {selectedCourse.chapters.map((chapter, index) => (
                <Card
                  key={index}
                  size="small"
                  style={{
                    marginBottom: 16,
                    borderRadius: 10,
                    border:"1px solid #f0f0f0",
                  }}
                  title={
                    <Space>
                      <BookOutlined style={{ color:"#1890ff" }} />
                      <Text strong>
                        Chapter {index + 1}: {chapter.chapter_name}
                      </Text>
                    </Space>
                  }
                >
                  <Space direction="vertical" style={{ width:"100%" }}>

                    {/* Study Material */}
                    {chapter.study_material && (
                      <Button
                        type="link"
                        icon={<FilePdfOutlined />}
                        href={`${url}/${chapter.study_material}`}
                        target="_blank"
                      >
                        Download Study Material
                      </Button>
                    )}

                    {/* YouTube Video */}
                    {chapter.youtube_video && (
                      <Button
                        type="link"
                        icon={<PlayCircleOutlined />}
                        href={chapter.youtube_video}
                        target="_blank"
                      >
                        Watch YouTube Video
                      </Button>
                    )}

                    {/* Practice Set */}
                    {chapter.practice_set && (
                      <Button
                        type="link"
                        icon={<FileExcelOutlined />}
                        href={`${url}/${chapter.practice_set}`}
                        target="_blank"
                      >
                        Download Practice Set
                      </Button>
                    )}

                    {/* Other Materials */}
                    {chapter.other_materials &&
                      chapter.other_materials.length > 0 && (
                        <>
                          <Text strong>Other Materials:</Text>
                          {chapter.other_materials.map((file, i) => (
                            <Button
                              key={i}
                              type="link"
                              icon={<DownloadOutlined />}
                              href={`${url}/${file}`}
                              target="_blank"
                            >
                              File {i + 1}
                            </Button>
                          ))}
                        </>
                      )}

                  </Space>
                </Card>
              ))}
            </>
          )}

        </div>
      );
    }

    // Delete/Approve/Reject Modals
    return (
      <div style={{ padding:'20px 0', textAlign:'center' }}>
        {modalType ==="delete" ? (
          <>
            <DeleteOutlined style={{ fontSize: 48, color:'#ff4d4f', marginBottom: 16 }} />
            <Paragraph strong style={{ fontSize: 16, marginBottom: 8 }}>
              Delete Course?
            </Paragraph>
            <Paragraph type="secondary">
              Are you sure you want to permanently delete <strong>"{selectedCourse?.title}"</strong>?
              <br />
              This action cannot be undone and will remove all associated data.
            </Paragraph>
          </>
        ) : modalType ==="approve" ? (
          <>
            <CheckCircleOutlined style={{ fontSize: 48, color:'#52c41a', marginBottom: 16 }} />
            <Paragraph strong style={{ fontSize: 16, marginBottom: 8 }}>
              Approve Course?
            </Paragraph>
            <Paragraph type="secondary">
              Approve <strong>"{selectedCourse?.title}"</strong> for publication?
              <br />
              This will make the course visible to all students.
            </Paragraph>
          </>
        ) : (
          <>
            <CloseCircleOutlined style={{ fontSize: 48, color:'#faad14', marginBottom: 16 }} />
            <Paragraph strong style={{ fontSize: 16, marginBottom: 8 }}>
              Reject Course?
            </Paragraph>
            <Paragraph type="secondary">
              Reject <strong>"{selectedCourse?.title}"</strong> from publication?
              <br />
              The course will be moved back to pending status.
            </Paragraph>
          </>
        )}
      </div>
    );
  };

  // 
  //  RENDER
  // 

  return (
    <Layout style={{ minHeight:"100vh", background:'#f0f2f5' }}>
      <Sidebar2 />
      <Layout>
        <Topbar />
        <Content style={{ margin:"24px 24px 0", minHeight: 280 }}>
          {/* Header Section */}
          <div style={{ marginBottom: 24 }}>
            <div style={{
              display:'flex',
              justifyContent:'space-between',
              alignItems:'center',
              marginBottom: 20,
              flexWrap:'wrap',
              gap: 12
            }}>
              <div>
                <Title level={2} style={{ margin: 0, color:'#262626', marginBottom: 4 }}>
                   Course Management
                </Title>
                <Text type="secondary" style={{ fontSize: 15 }}>
                  Manage, monitor and analyze your courses
                </Text>
              </div>
              <Space size="middle">
                <Tooltip title="Refresh courses">
                  <Button
                    icon={<ReloadOutlined />}
                    size="large"
                    onClick={handleRefresh}
                    style={{ borderRadius: 8 }}
                  />
                </Tooltip>
                <Dropdown
                  menu={{
                    items: [
                      {
                        key:'csv',
                        icon: <FileExcelOutlined />,
                        label:'Export as CSV',
                        onClick: handleExportCSV
                      },
                      {
                        key:'pdf',
                        icon: <FilePdfOutlined />,
                        label:'Export as PDF (Coming Soon)',
                        disabled: true
                      }
                    ]
                  }}
                  placement="bottomRight"
                >
                  <Button
                    icon={<DownloadOutlined />}
                    size="large"
                    style={{ borderRadius: 8 }}
                  >
                    Export
                  </Button>
                </Dropdown>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  size="large"
                  onClick={() => navigate('/add-courses')}
                  style={{
                    borderRadius: 8,
                    background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border:'none',
                    boxShadow:'0 4px 12px rgba(102,126,234,0.3)'
                  }}
                >
                  Add New Course
                </Button>
              </Space>
            </div>

            {/* Enhanced Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={12} lg={6}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 12,
                    background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border:'none',
                    boxShadow:'0 4px 12px rgba(102,126,234,0.2)'
                  }}
                  bodyStyle={{ padding:'20px' }}
                >
                  <Statistic
                    title={<span style={{ color:'rgba(255,255,255,0.9)' }}>Total Courses</span>}
                    value={stats.total}
                    prefix={<BookOutlined style={{ color:'#fff' }} />}
                    valueStyle={{ color:'#fff', fontWeight:'bold', fontSize: 28 }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 12,
                    background:'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    border:'none',
                    boxShadow:'0 4px 12px rgba(245,87,108,0.2)'
                  }}
                  bodyStyle={{ padding:'20px' }}
                >
                  <Statistic
                    title={<span style={{ color:'rgba(255,255,255,0.9)' }}>Total Revenue</span>}
                    value={stats.totalRevenue}
                    prefix=""
                    valueStyle={{ color:'#fff', fontWeight:'bold', fontSize: 28 }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 12,
                    background:'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    border:'none',
                    boxShadow:'0 4px 12px rgba(79,172,254,0.2)'
                  }}
                  bodyStyle={{ padding:'20px' }}
                >
                  <Statistic
                    title={<span style={{ color:'rgba(255,255,255,0.9)' }}>Total Enrollments</span>}
                    value={stats.totalEnrollments}
                    prefix={<TeamOutlined style={{ color:'#fff' }} />}
                    valueStyle={{ color:'#fff', fontWeight:'bold', fontSize: 28 }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 12,
                    background:'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                    border:'none',
                    boxShadow:'0 4px 12px rgba(250,112,154,0.2)'
                  }}
                  bodyStyle={{ padding:'20px' }}
                >
                  <Statistic
                    title={<span style={{ color:'rgba(255,255,255,0.9)' }}>Avg Rating</span>}
                    value={stats.avgRating}
                    suffix="/ 5"
                    prefix={<StarOutlined style={{ color:'#fff' }} />}
                    valueStyle={{ color:'#fff', fontWeight:'bold', fontSize: 28 }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Quick Stats Pills */}
            <Space wrap style={{ marginBottom: 16 }}>
              <Tag color="success" style={{ padding:'6px 14px', fontSize: 13, borderRadius: 20 }}>
                <CheckCircleOutlined /> {stats.approved} Approved
              </Tag>
              <Tag color="warning" style={{ padding:'6px 14px', fontSize: 13, borderRadius: 20 }}>
                <ClockCircleOutlined /> {stats.pending} Pending
              </Tag>
              <Tag color="gold" style={{ padding:'6px 14px', fontSize: 13, borderRadius: 20 }}>
                <StarOutlined /> {stats.featured} Featured
              </Tag>
              <Tag color="processing" style={{ padding:'6px 14px', fontSize: 13, borderRadius: 20 }}>
                <ClockCircleOutlined /> Avg {stats.avgDuration}min duration
              </Tag>
            </Space>
          </div>

          {/* Main Content Card */}
          <Card
            style={{
              borderRadius: 12,
              boxShadow:'0 2px 8px rgba(0,0,0,0.06)',
              border:'1px solid #f0f0f0'
            }}
            bodyStyle={{ padding: 24 }}
          >
            {/* Enhanced Search and Filter Bar */}
            <div style={{ marginBottom: 24 }}>
              <Row gutter={[12, 12]}>
                <Col xs={24} md={10}>
                  <Search
                    placeholder=" Search by title, description, instructor..."
                    allowClear
                    size="large"
                    enterButton
                    style={{ borderRadius: 8 }}
                    onSearch={handleSearch}
                    onChange={(e) => handleSearch(e.target.value)}
                    loading={loading}
                  />
                </Col>
                <Col xs={12} md={4}>
                  <Select
                    placeholder="Category"
                    allowClear
                    size="large"
                    style={{ width:'100%', borderRadius: 8 }}
                    value={filters.category}
                    onChange={(value) => handleFilterChange('category', value)}
                  >
                    <Option value="web-development">Web Development</Option>
                    <Option value="data-science">Data Science</Option>
                    <Option value="mobile-development">Mobile Dev</Option>
                    <Option value="machine-learning">Machine Learning</Option>
                    <Option value="cloud-computing">Cloud Computing</Option>
                  </Select>
                </Col>
                <Col xs={12} md={4}>
                  <Select
                    placeholder="Skill Level"
                    allowClear
                    size="large"
                    style={{ width:'100%', borderRadius: 8 }}
                    value={filters.skill_level}
                    onChange={(value) => handleFilterChange('skill_level', value)}
                  >
                    <Option value="Beginner">Beginner</Option>
                    <Option value="Intermediate">Intermediate</Option>
                    <Option value="Advanced">Advanced</Option>
                  </Select>
                </Col>
                <Col xs={12} md={3}>
                  <Select
                    placeholder="Language"
                    allowClear
                    size="large"
                    style={{ width:'100%', borderRadius: 8 }}
                    value={filters.language}
                    onChange={(value) => handleFilterChange('language', value)}
                  >
                    <Option value="English">English</Option>
                    <Option value="Hindi">Hindi</Option>
                    <Option value="Spanish">Spanish</Option>
                  </Select>
                </Col>
                <Col xs={12} md={3}>
                  <Button
                    icon={<ClearOutlined />}
                    size="large"
                    block
                    onClick={clearFilters}
                    style={{ borderRadius: 8 }}
                  >
                    Clear
                  </Button>
                </Col>
              </Row>
            </div>

            {/* Enhanced Table */}
            {loading ? (
              <div style={{ textAlign:'center', padding:'60px 0' }}>
                <Spin size="large" tip="Loading courses..." />
              </div>
            ) : filteredCourses.length === 0 ? (
              <Empty
                description={
                  <div>
                    <Text strong style={{ fontSize: 16 }}>No courses found</Text>
                    <br />
                    <Text type="secondary">
                      {searchText || Object.values(filters).some(f => f !== null)
                        ?'Try adjusting your search or filters'
                        :'Start by adding your first course'}
                    </Text>
                  </div>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ padding:'60px 0' }}
              >
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  size="large"
                  onClick={() => navigate('/add-courses')}
                  style={{ borderRadius: 8 }}
                >
                  Add Your First Course
                </Button>
              </Empty>
            ) : (
              <Table
                rowKey="_id"
                dataSource={filteredCourses}
                columns={columns}
                loading={loading}
                pagination={{
                  ...pagination,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `Showing ${range[0]}-${range[1]} of ${total} courses`,
                  pageSizeOptions: ['10','20','50','100'],
                  style: { marginTop: 20 }
                }}
                onChange={(newPagination: any) => {
                  setPagination({
                    current: newPagination.current,
                    pageSize: newPagination.pageSize,
                    total: pagination.total
                  });
                }}
                scroll={{ x: 1400 }}
                rowClassName={(_, index) =>
                  index % 2 === 0 ?'table-row-even' :'table-row-odd'
                }
                size="middle"
              />
            )}
          </Card>
        </Content>

        <Footer style={{
          textAlign:"center",
          background:'#fafafa',
          borderTop:'1px solid #f0f0f0',
          marginTop: 24,
          padding:'20px 50px'
        }}>
          <Text type="secondary">
            <strong>© 2026 Draa. All Rights Reserved.</strong> | Built with 
          </Text>
        </Footer>
      </Layout>

      {/* Enhanced Modal */}
      <Modal
        title={
          <div style={{ display:'flex', alignItems:'center', gap: 10, padding:'8px 0' }}>
            {modalType ==="delete" ? (
              <DeleteOutlined style={{ color:'#ff4d4f', fontSize: 20 }} />
            ) : modalType ==="approve" ? (
              <CheckCircleOutlined style={{ color:'#52c41a', fontSize: 20 }} />
            ) : modalType ==="reject" ? (
              <CloseCircleOutlined style={{ color:'#faad14', fontSize: 20 }} />
            ) : (
              <EyeOutlined style={{ color:'#1890ff', fontSize: 20 }} />
            )}
            <span style={{ fontSize: 18, fontWeight: 600 }}>
              {modalType ==="delete"
                ?"Delete Course"
                : modalType ==="approve"
                  ?"Approve Course"
                  : modalType ==="reject"
                    ?"Reject Course"
                    :"Course Details"}
            </span>
          </div>
        }
        open={isModalOpen}
        onOk={modalType ==="view" ? undefined : handleOk}
        onCancel={handleCancel}
        okText={
          modalType ==="delete"
            ?"Yes, Delete"
            : modalType ==="approve"
              ?"Yes, Approve"
              :"Yes, Reject"
        }
        confirmLoading={actionLoading}
        okButtonProps={modalType ==="view" ? { style: { display:'none' } } : {
          danger: modalType ==="delete",
          size:'large',
          style: {
            borderRadius: 8,
            minWidth: 120
          }
        }}
        cancelButtonProps={{
          size:'large',
          style: { borderRadius: 8, minWidth: 100 }
        }}
        width={modalType ==="view" ? 900 : 540}
        bodyStyle={{ padding: modalType ==="view" ?'24px' :'32px' }}
        footer={modalType ==="view" ? [
          <Button
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            size="large"
            onClick={() => {
              handleCancel();
              navigate(`/updateCourse/${selectedCourse?._id}`);
            }}
            style={{ borderRadius: 8, marginRight: 8 }}
          >
            Edit Course
          </Button>,
          <Button
            key="close"
            size="large"
            onClick={handleCancel}
            style={{ borderRadius: 8 }}
          >
            Close
          </Button>
        ] : undefined}
        centered
      >
        {renderModalContent()}
      </Modal>

      {/* Custom Styles */}
      <style>{`
        .table-row-even {
          background-color: #fafafa;
          transition: all 0.3s ease;
        }
        .table-row-odd {
          background-color: white;
          transition: all 0.3s ease;
        }
        .ant-table-thead > tr > th {
          background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%) !important;
          border-bottom: 2px solid #e8e8e8;
          font-weight: 600;
          color: #262626;
          font-size: 13px;
          padding: 16px 12px !important;
        }
        .ant-table-tbody > tr:hover > td {
          background: #e6f7ff !important;
          cursor: pointer;
        }
        .ant-table-tbody > tr > td {
          padding: 14px 12px !important;
        }
        .ant-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102,126,234,0.4);
          transition: all 0.3s ease;
        }
        .ant-card {
          transition: all 0.3s ease;
        }
        .ant-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        }
        .ant-descriptions-bordered .ant-descriptions-item-label {
          background: #fafafa;
          font-weight: 600;
          color: #262626;
        }
        .ant-modal-content {
          border-radius: 7px !important;
          overflow: hidden;
          box-shadow: 0 12px 48px rgba(0,0,0,0.18);
        }
        .ant-modal-header {
          background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
          border-bottom: 2px solid #f0f0f0;
          padding: 20px 24px;
        }
        .ant-modal-body {
          max-height: 70vh;
          overflow-y: auto;
        }
        .ant-modal-footer {
          border-top: 2px solid #f0f0f0;
          padding: 16px 24px;
        }
        .ant-select-selector,
        .ant-input-search .ant-input,
        .ant-btn {
          border-radius: 8px !important;
        }
        .ant-statistic-title {
          font-size: 13px;
          margin-bottom: 8px;
        }
        .ant-badge-count {
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .ant-tag {
          border-radius: 4px;
          border: none;
          font-weight: 500;
        }
        .ant-progress-text {
          font-weight: 600 !important;
        }
        .ant-empty-description {
          color: #8c8c8c;
        }
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </Layout>
  );
};

export default ManageCourses;
