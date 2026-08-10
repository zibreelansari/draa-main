import React, { useEffect, useState } from'react';
import {
  Layout,
  Card,
  Avatar,
  Typography,
  Row,
  Col,
  Space,
  Tag,
  Descriptions,
  Statistic,
  Button,
  message,
  Spin,
  Alert,
  Divider,
  Badge,
  Tooltip,
  List,
  Tabs,
  Empty
} from'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  SecurityScanFilled,
  CalendarOutlined,
  CheckCircleOutlined,
  StarOutlined,
  BookOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  EditOutlined,
  ShareAltOutlined,
  MessageOutlined,
  FileTextOutlined,
  ExperimentOutlined,
  ReadOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  DownloadOutlined,
  FileAddOutlined
} from'@ant-design/icons';
import { useNavigate, useParams } from'react-router-dom';
import Topbar from'./Topbar';
import Sidebar2 from'./Sidebar2';
import Sidebar from'./Sidebar';
import url from'../../url';
import { getAuthHeaders } from'../../utils/global_auth';

const { Header, Sider, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

interface User {
  name?: string;
  aname?: string;
  tname?: string;
  temail?: string;
  tphn?: string;
  Status?: string;
  tspecialization?: string;
  texp?: string;
  updatedAt?: string;
  createdAt?: string;
  tprofile?: string;
  tbio?: string;
  tqualification?: string;
  tlocation?: string;
  trating?: number;
  tstudents?: number;
  tcourses?: number;
}

interface LoginUser {
  name?: string;
  tname?: string;
  aname?: string;
  id?: string;
}

interface TeacherContent {
  courses: any[];
  books: any[];
  testSeries: any[];
  exams: any[];
  blogs?: any[];
}

interface TeacherStats {
  totalCourses: number;
  totalBooks: number;
  totalTestSeries: number;
  totalExams: number;
  totalStudents: number;
  totalSubmissions: number;
  averageRating: number;
  totalEarnings: number;
  totalBlogs?: number;
}

const TeacherProfile: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [teacher, setTeacher] = useState<User>({});
  const [loginUser, setLoginUser] = useState<LoginUser>({});
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teacherContent, setTeacherContent] = useState<TeacherContent>({
    courses: [],
    books: [],
    testSeries: [],
    exams: [],
    blogs: []
  });
  const [teacherStats, setTeacherStats] = useState<TeacherStats>({
    totalCourses: 0,
    totalBooks: 0,
    totalTestSeries: 0,
    totalExams: 0,
    totalStudents: 0,
    totalSubmissions: 0,
    averageRating: 0,
    totalEarnings: 0,
    totalBlogs: 0
  });

  //  Check authentication
  useEffect(() => {
    const userStr = localStorage.getItem('edudocs');
    if (!userStr) {
      message.warning("Please log in first!");
      navigate('/admin-login');
      return;
    }

    try {
      const user = JSON.parse(userStr);
      setLoginUser(user);
    } catch (error) {
      message.error("Invalid session. Please log in again.");
      navigate('/admin-login');
    }
  }, [navigate]);

  //  Fetch teacher data
  useEffect(() => {
    if (!id) {
      setError("Teacher ID not provided");
      setLoading(false);
      return;
    }

    const fetchTeacherData = async () => {
      try {
        setLoading(true);
        console.log(' Fetching teacher profile for ID:', id);

        //  Use existing API that works
        const response = await fetch(`${url}/teacherProfile/${id}`, {
          headers: {
            ...getAuthHeaders()
          }
        });
        const data = await response.json();

        if (data && data.teacher) {
          setTeacher(data.teacher);
          console.log(' Teacher data loaded:', data.teacher);

          // Load teacher's content (pass teacher name for blog filtering)
          await loadTeacherContent(id, data.teacher.tname);
        } else {
          throw new Error('Teacher not found');
        }
      } catch (error) {
        console.error(" Error fetching teacher:", error);
        setError("Failed to load teacher profile");
        message.error("Unable to load teacher profile");
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, [id]);

  //  SMART Content Loading - Uses real APIs where available
  const loadTeacherContent = async (teacherId: string, teacherName?: string) => {
    try {
      setContentLoading(true);
      console.log(' Loading teacher content for ID:', teacherId);

      const content: TeacherContent = {
        courses: [],
        books: [],
        testSeries: [],
        exams: []
      };

      //  1. Load real Courses from teacher courses endpoint
      try {
        console.log(' Loading courses from API...');
        const coursesRes = await fetch(`${url}/course/courseDetails/teacher/${teacherId}`, {
          headers: {
            ...getAuthHeaders()
          }
        });
        if (coursesRes.ok) {
          const cData = await coursesRes.json();
          const coursesList = cData.courses || cData.data?.courses || [];
          if (Array.isArray(coursesList) && coursesList.length > 0) {
            content.courses = coursesList;
            console.log(' Real courses loaded:', coursesList.length);
          }
        }
        if (content.courses.length === 0) {
          const fbRes = await fetch(`${url}/course/allCourses?teacherId=${teacherId}`, {
            headers: {
              ...getAuthHeaders()
            }
          });
          if (fbRes.ok) {
            const fbData = await fbRes.json();
            const fbCourses: any[] = fbData.data?.courses || fbData.courses || [];
            if (Array.isArray(fbCourses)) content.courses = fbCourses;
          }
        }
      } catch (e) { console.log('Courses API error:', e); }

      //  2. Load real Test Series
      try {
        console.log(' Loading test series from API...');
        const tsRes = await fetch(`${url}/test-series/teacher/${teacherId}`, {
          headers: {
            ...getAuthHeaders()
          }
        });
        if (tsRes.ok) {
          try {
            const tsData = await tsRes.json();
            // Response shape: { success: true, data: { testSeries: [...] } }
            const tsRaw = tsData.data?.testSeries || tsData.testSeries || [];
            content.testSeries = Array.isArray(tsRaw) ? tsRaw : [];
            console.log(' Real test series loaded:', content.testSeries.length);
          } catch {
            content.testSeries = [];
            console.log('  Test series JSON parse failed');
          }
        }
        if (content.testSeries.length === 0) {
          // Fallback: try admin all-test-series endpoint filtered by teacher
          const fbTs = await fetch(`${url}/test-series/admin?teacherId=${teacherId}&limit=100`, {
            headers: {
              ...getAuthHeaders()
            }
          });
          if (fbTs.ok) {
            try {
              const fbTsData = await fbTs.json();
              const fbList = fbTsData.data?.testSeries || fbTsData.testSeries || fbTsData.data || [];
              content.testSeries = Array.isArray(fbList) ? fbList.filter((t: any) => {
                const created = typeof t.createdBy ==='object' ? t.createdBy?._id : t.createdBy;
                return created === teacherId;
              }) : [];
            } catch {
              content.testSeries = [];
            }
          }
        }
      } catch (e) { console.log('Test Series API error:', e); }

      //  3. Load real Books
      try {
        console.log(' Loading books from API...');
        const booksRes = await fetch(`${url}/books/teacher/${teacherId}`, {
          headers: {
            ...getAuthHeaders()
          }
        });
        if (booksRes.ok) {
          const bData = await booksRes.json();
          const bRaw = bData.books || bData.data || [];
          content.books = Array.isArray(bRaw) ? bRaw : [];
          console.log(' Real books loaded:', content.books.length);
        }
        if (content.books.length === 0) {
          const fbBooks = await fetch(`${url}/books/approved`, {
            headers: {
              ...getAuthHeaders()
            }
          });
          if (fbBooks.ok) {
            const fbBooksData = await fbBooks.json();
            const fbList: any[] = fbBooksData.books || fbBooksData.data || [];
            if (Array.isArray(fbList)) {
              content.books = fbList.filter((b: any) =>
                b.teacherId === teacherId || b.createdBy === teacherId
              );
            }
          }
        }
      } catch (e) { console.log('Books API error:', e); }

      //  4. Load real Exams
      try {
        console.log(' Loading exams from API...');
        const examsRes = await fetch(`${url}/exam/teacher/${teacherId}`, {
          headers: {
            ...getAuthHeaders()
          }
        });
        if (examsRes.ok || examsRes.status === 304) {
          const examsData = await examsRes.json();
          const examsRaw = examsData.exams || examsData.data || [];
          if (Array.isArray(examsRaw)) {
            content.exams = examsRaw;
            console.log(' Real exams loaded:', content.exams.length);
          }
        }
      } catch (e) { console.log('Exams API error:', e); }

      //  5. Load real Blogs (course content written by this teacher)
      try {
        const blogsRes = await fetch(`${url}/course/allCourseContent`, {
          headers: {
            ...getAuthHeaders()
          }
        });
        if (blogsRes.ok) {
          try {
            const blogsData = await blogsRes.json();
            const allContent: any[] = Array.isArray(blogsData.result)
              ? blogsData.result
              : Array.isArray(blogsData.data)
              ? blogsData.data
              : [];
            const teacherBlogs = allContent.filter((c: any) =>
              c.author === teacherName ||
              c.createdBy === teacherId ||
              c.createdBy?._id === teacherId
            );
            (content as any).blogs = teacherBlogs;
            console.log(' Teacher blogs loaded:', teacherBlogs.length);
          } catch {
            (content as any).blogs = [];
            console.log('  Blogs JSON parse failed, skipping blogs');
          }
        } else {
          (content as any).blogs = [];
        }
      } catch (e) {
        (content as any).blogs = [];
        console.log('  Blogs API error:', e);
      }

      //  Calculate comprehensive stats from real data
      const stats = calculateComprehensiveStats(content, teacher);
      setTeacherStats(stats);
      setTeacherContent(content);

      console.log(' All teacher content loaded:', {
        courses: content.courses.length,
        books: content.books.length,
        testSeries: content.testSeries.length,
        exams: content.exams.length,
        blogs: (content as any).blogs?.length || 0,
      });

    } catch (error) {
      console.error(' Error loading teacher content:', error);
      setTeacherStats({
        totalCourses: 0,
        totalBooks: 0,
        totalTestSeries: 0,
        totalExams: 0,
        totalStudents: 0,
        totalSubmissions: 0,
        averageRating: 0,
        totalEarnings: 0,
        totalBlogs: 0
      });
    } finally {
      setContentLoading(false);
    }
  };

  //  Comprehensive Stats Calculator  works with real API data
  const calculateComprehensiveStats = (content: TeacherContent, teacherData: User): TeacherStats => {
    const totalCourses = content.courses.length;
    const totalBooks = content.books.length;
    const totalTestSeries = content.testSeries.length;
    const totalExams = content.exams.length;
    const totalBlogs = content.blogs?.length || 0;

    // Students from enrolled_count on real courses
    const totalStudents = content.courses.reduce((sum, course) => {
      return sum + (course.enrolled_count || course.enrollmentCount || 0);
    }, 0);

    // Submissions from exam question counts or submission arrays
    const totalSubmissions = content.exams.reduce((sum, exam) => {
      return sum + (exam.submissions?.length || exam.questions?.length || 0);
    }, 0);

    // Average rating from real course ratings
    const coursesWithRating = content.courses.filter(course =>
      (course.rating || course.averageRating || 0) > 0
    );
    const averageRating = coursesWithRating.length > 0
      ? coursesWithRating.reduce((sum, course) =>
          sum + (course.rating || course.averageRating || 0), 0
        ) / coursesWithRating.length
      : teacherData.trating || 0;

    // Earnings from real course prices × enrollments
    const totalEarnings = content.courses.reduce((sum, course) => {
      const price = course.discounted_price || course.price || 0;
      const enrollments = course.enrolled_count || course.enrollmentCount || 0;
      return sum + (price * enrollments);
    }, 0);

    return {
      totalCourses,
      totalBooks,
      totalTestSeries,
      totalExams,
      totalStudents,
      totalSubmissions,
      averageRating: Math.round(averageRating * 10) / 10,
      totalEarnings,
      totalBlogs,
    };
  };

  //  Safe image URL handler
  const getProfileImageUrl = (profilePath: string | undefined) => {
    if (!profilePath) return undefined;

    // Handle different possible image path formats
    if (profilePath.startsWith('http')) {
      return profilePath; // Full URL
    } else if (profilePath.startsWith('/')) {
      return `${url}${profilePath}`; // Absolute path
    } else {
      return `${url}/${profilePath}`; // Relative path
    }
  };

  //  Get status color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case'verified':
      case'active':
      case'approved':
        return'success';
      case'pending':
        return'warning';
      case'rejected':
      case'inactive':
        return'error';
      default:
        return'default';
    }
  };

  //  Get experience level
  const getExperienceLevel = (exp: string | number) => {
    const years = parseInt(exp as string) || 0;
    if (years >= 10) return { text:'Senior Expert', color:'#722ed1' };
    if (years >= 5) return { text:'Experienced', color:'#1890ff' };
    if (years >= 2) return { text:'Intermediate', color:'#52c41a' };
    return { text:'Beginner', color:'#faad14' };
  };

  if (loading) {
    return (
      <Layout style={{ minHeight:'100vh' }}>
        {"aname" in loginUser ? <Sidebar /> : <Sidebar2 />}
        <Layout>
          <Topbar />
          <Content style={{
            margin:'24px 16px',
            padding: 24,
            background:'#fff',
            display:'flex',
            justifyContent:'center',
            alignItems:'center',
            flexDirection:'column'
          }}>
            <Spin size="large" />
            <Title level={4} style={{ marginTop: 16, color:'#666' }}>
              Loading Teacher Profile...
            </Title>
          </Content>
        </Layout>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout style={{ minHeight:'100vh' }}>
        {"aname" in loginUser ? <Sidebar /> : <Sidebar2 />}
        <Layout>
          <Topbar />
          <Content style={{ margin:'24px 16px', padding: 24, background:'#fff' }}>
            <Alert
              message="Error Loading Profile"
              description={error}
              type="error"
              action={
                <Button size="small" danger onClick={() => window.location.reload()}>
                  Retry
                </Button>
              }
            />
          </Content>
        </Layout>
      </Layout>
    );
  }

  const experienceLevel = getExperienceLevel(teacher.texp ||'0');

  return (
    <Layout style={{ minHeight:'100vh' }}>
      {/* Sidebar */}
      {"aname" in loginUser ? <Sidebar /> : <Sidebar2 />}

      <Layout>
        {/* Topbar */}
        <Topbar />

        {/* Main Content */}
        <Content style={{ margin:'24px 16px 0', overflow:'initial' }}>
          <div style={{ padding: 24, background:'#fff', borderRadius: 8 }}>

            {/* Enhanced Header Section */}
            <div style={{
              background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding:'40px 32px',
              borderRadius:'12px',
              marginBottom:'24px',
              color:'white'
            }}>
              <Row align="middle" justify="space-between">
                <Col>
                  <Space size="large" align="start">
                    <div style={{ position:'relative' }}>
                      <Avatar
                        size={120}
                        src={getProfileImageUrl(teacher.tprofile)}
                        icon={<UserOutlined />}
                        style={{
                          border:'4px solid rgba(255,255,255,0.3)',
                          boxShadow:'0 8px 24px rgba(0,0,0,0.2)'
                        }}
                        onError={() => {
                          // Handle image load error gracefully
                          console.log('Profile image failed to load');
                          return true;
                        }}
                      />
                      {/* Online status indicator */}
                      <div style={{
                        position:'absolute',
                        bottom:'10px',
                        right:'10px',
                        width:'20px',
                        height:'20px',
                        borderRadius:'50%',
                        backgroundColor:'#52c41a',
                        border:'3px solid white'
                      }} />
                    </div>
                    <div>
                      <Title level={2} style={{ color:'white', margin: 0 }}>
                        {teacher.tname ||'Teacher Name'}
                      </Title>
                      <Text style={{ color:'rgba(255,255,255,0.8)', fontSize:'16px' }}>
                        {teacher.tspecialization ||'Subject Specialist'}
                      </Text>
                      <div style={{ marginTop:'12px' }}>
                        <Space wrap>
                          <Tag
                            color="rgba(255,255,255,0.2)"
                            style={{ color:'white', border:'none' }}
                          >
                            <TrophyOutlined /> {teacher.texp ||'0'} Years Experience
                          </Tag>
                          <Tag
                            color="rgba(255,255,255,0.2)"
                            style={{ color:'white', border:'none' }}
                          >
                            <BookOutlined /> {teacherStats.totalCourses} Courses
                          </Tag>
                          <Tag
                            color="rgba(255,255,255,0.2)"
                            style={{ color:'white', border:'none' }}
                          >
                            <TeamOutlined /> {teacherStats.totalStudents} Students
                          </Tag>
                          <Tag
                            color="rgba(255,255,255,0.2)"
                            style={{ color:'white', border:'none' }}
                          >
                            <StarOutlined /> {teacherStats.averageRating}/5.0 Rating
                          </Tag>
                        </Space>
                      </div>
                    </div>
                  </Space>
                </Col>
                <Col>
                  <Space direction="vertical" align="end">
                    <Button
                      type="primary"
                      icon={<MessageOutlined />}
                      size="large"
                      style={{
                        background:'rgba(255,255,255,0.2)',
                        border:'none',
                        backdropFilter:'blur(10px)'
                      }}
                    >
                      Contact Teacher
                    </Button>
                    <Button
                      icon={<ShareAltOutlined />}
                      size="large"
                      style={{
                        background:'rgba(255,255,255,0.1)',
                        border:'none',
                        color:'white',
                        backdropFilter:'blur(10px)'
                      }}
                    >
                      Share Profile
                    </Button>
                  </Space>
                </Col>
              </Row>
            </div>

            {/*  ENHANCED STATS ROW  */}
            {/* Row 1: Primary stats  full width cards */}
            <div style={{ marginBottom:'20px' }}>
              <Row gutter={[12, 12]}>
                {/* Courses */}
                <Col xs={12} sm={6}>
                  <div style={{
                    background:'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                    border:'1.5px solid #bfdbfe',
                    borderRadius:'14px',
                    padding:'20px 20px 16px',
                    display:'flex',
                    alignItems:'center',
                    gap:'14px',
                  }}>
                    <div style={{
                      width:'52px', height:'52px', borderRadius:'14px',
                      background:'#3b82f6', display:'flex', alignItems:'center',
                      justifyContent:'center', flexShrink: 0,
                    }}>
                      <BookOutlined style={{ color:'#fff', fontSize:'22px' }} />
                    </div>
                    <div>
                      <div style={{ fontSize:'28px', fontWeight: 800, color:'#1e40af', lineHeight: 1 }}>
                        {teacherStats.totalCourses}
                      </div>
                      <div style={{ fontSize:'12px', color:'#64748b', fontWeight: 600, marginTop:'3px', letterSpacing:'0.3px' }}>
                        COURSES
                      </div>
                    </div>
                  </div>
                </Col>
                {/* Students */}
                <Col xs={12} sm={6}>
                  <div style={{
                    background:'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
                    border:'1.5px solid #99f6e4',
                    borderRadius:'14px',
                    padding:'20px 20px 16px',
                    display:'flex',
                    alignItems:'center',
                    gap:'14px',
                  }}>
                    <div style={{
                      width:'52px', height:'52px', borderRadius:'14px',
                      background:'#10b981', display:'flex', alignItems:'center',
                      justifyContent:'center', flexShrink: 0,
                    }}>
                      <TeamOutlined style={{ color:'#fff', fontSize:'22px' }} />
                    </div>
                    <div>
                      <div style={{ fontSize:'28px', fontWeight: 800, color:'#065f46', lineHeight: 1 }}>
                        {teacherStats.totalStudents}
                      </div>
                      <div style={{ fontSize:'12px', color:'#64748b', fontWeight: 600, marginTop:'3px', letterSpacing:'0.3px' }}>
                        STUDENTS
                      </div>
                    </div>
                  </div>
                </Col>
                {/* Test Series */}
                <Col xs={12} sm={6}>
                  <div style={{
                    background:'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
                    border:'1.5px solid #fdba74',
                    borderRadius:'14px',
                    padding:'20px 20px 16px',
                    display:'flex',
                    alignItems:'center',
                    gap:'14px',
                  }}>
                    <div style={{
                      width:'52px', height:'52px', borderRadius:'14px',
                      background:'#f97316', display:'flex', alignItems:'center',
                      justifyContent:'center', flexShrink: 0,
                    }}>
                      <FileAddOutlined style={{ color:'#fff', fontSize:'22px' }} />
                    </div>
                    <div>
                      <div style={{ fontSize:'28px', fontWeight: 800, color:'#9a3412', lineHeight: 1 }}>
                        {teacherStats.totalTestSeries}
                      </div>
                      <div style={{ fontSize:'12px', color:'#64748b', fontWeight: 600, marginTop:'3px', letterSpacing:'0.3px' }}>
                        TEST SERIES
                      </div>
                    </div>
                  </div>
                </Col>
                {/* Exams */}
                <Col xs={12} sm={6}>
                  <div style={{
                    background:'linear-gradient(135deg, #faf5ff 0%, #ede9fe 100%)',
                    border:'1.5px solid #c4b5fd',
                    borderRadius:'14px',
                    padding:'20px 20px 16px',
                    display:'flex',
                    alignItems:'center',
                    gap:'14px',
                  }}>
                    <div style={{
                      width:'52px', height:'52px', borderRadius:'14px',
                      background:'#7c3aed', display:'flex', alignItems:'center',
                      justifyContent:'center', flexShrink: 0,
                    }}>
                      <ExperimentOutlined style={{ color:'#fff', fontSize:'22px' }} />
                    </div>
                    <div>
                      <div style={{ fontSize:'28px', fontWeight: 800, color:'#5b21b6', lineHeight: 1 }}>
                        {teacherStats.totalExams}
                      </div>
                      <div style={{ fontSize:'12px', color:'#64748b', fontWeight: 600, marginTop:'3px', letterSpacing:'0.3px' }}>
                        EXAMS
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Row 2: Secondary stats */}
            <div style={{ marginBottom:'20px' }}>
              <Row gutter={[12, 12]}>
                {/* Books */}
                <Col xs={8} sm={4}>
                  <div style={{
                    background:'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                    border:'1.5px solid #86efac',
                    borderRadius:'12px',
                    padding:'16px 16px 14px',
                    display:'flex',
                    alignItems:'center',
                    gap:'10px',
                  }}>
                    <div style={{
                      width:'40px', height:'40px', borderRadius:'10px',
                      background:'#22c55e', display:'flex', alignItems:'center',
                      justifyContent:'center', flexShrink: 0,
                    }}>
                      <ReadOutlined style={{ color:'#fff', fontSize:'18px' }} />
                    </div>
                    <div>
                      <div style={{ fontSize:'22px', fontWeight: 800, color:'#15803d', lineHeight: 1 }}>
                        {teacherStats.totalBooks}
                      </div>
                      <div style={{ fontSize:'10px', color:'#64748b', fontWeight: 600, marginTop:'2px', letterSpacing:'0.3px' }}>
                        BOOKS
                      </div>
                    </div>
                  </div>
                </Col>
                {/* Rating */}
                <Col xs={8} sm={4}>
                  <div style={{
                    background:'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                    border:'1.5px solid #fcd34d',
                    borderRadius:'12px',
                    padding:'16px 16px 14px',
                    display:'flex',
                    alignItems:'center',
                    gap:'10px',
                  }}>
                    <div style={{
                      width:'40px', height:'40px', borderRadius:'10px',
                      background:'#f59e0b', display:'flex', alignItems:'center',
                      justifyContent:'center', flexShrink: 0,
                    }}>
                      <StarOutlined style={{ color:'#fff', fontSize:'18px' }} />
                    </div>
                    <div>
                      <div style={{ fontSize:'22px', fontWeight: 800, color:'#92400e', lineHeight: 1 }}>
                        {teacherStats.averageRating > 0 ? `${teacherStats.averageRating}/5` :''}
                      </div>
                      <div style={{ fontSize:'10px', color:'#64748b', fontWeight: 600, marginTop:'2px', letterSpacing:'0.3px' }}>
                        RATING
                      </div>
                    </div>
                  </div>
                </Col>
                {/* Blogs */}
                <Col xs={8} sm={4}>
                  <div style={{
                    background:'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
                    border:'1.5px solid #f9a8d4',
                    borderRadius:'12px',
                    padding:'16px 16px 14px',
                    display:'flex',
                    alignItems:'center',
                    gap:'10px',
                  }}>
                    <div style={{
                      width:'40px', height:'40px', borderRadius:'10px',
                      background:'#ec4899', display:'flex', alignItems:'center',
                      justifyContent:'center', flexShrink: 0,
                    }}>
                      <FileTextOutlined style={{ color:'#fff', fontSize:'18px' }} />
                    </div>
                    <div>
                      <div style={{ fontSize:'22px', fontWeight: 800, color:'#9d174d', lineHeight: 1 }}>
                        {teacherStats.totalBlogs || 0}
                      </div>
                      <div style={{ fontSize:'10px', color:'#64748b', fontWeight: 600, marginTop:'2px', letterSpacing:'0.3px' }}>
                        BLOGS
                      </div>
                    </div>
                  </div>
                </Col>
                {/* Earnings */}
                <Col xs={8} sm={4}>
                  <div style={{
                    background:'linear-gradient(135deg, #f0fdf4 0%, #bbf7d0 100%)',
                    border:'1.5px solid #86efac',
                    borderRadius:'12px',
                    padding:'16px 16px 14px',
                    display:'flex',
                    alignItems:'center',
                    gap:'10px',
                  }}>
                    <div style={{
                      width:'40px', height:'40px', borderRadius:'10px',
                      background:'#16a34a', display:'flex', alignItems:'center',
                      justifyContent:'center', flexShrink: 0,
                    }}>
                      <span style={{ color:'#fff', fontSize:'18px', fontWeight: 800 }}></span>
                    </div>
                    <div>
                      <div style={{ fontSize:'22px', fontWeight: 800, color:'#14532d', lineHeight: 1 }}>
                        {teacherStats.totalEarnings > 0 ? `${(teacherStats.totalEarnings / 1000).toFixed(0)}K` :'0'}
                      </div>
                      <div style={{ fontSize:'10px', color:'#64748b', fontWeight: 600, marginTop:'2px', letterSpacing:'0.3px' }}>
                        EARNINGS
                      </div>
                    </div>
                  </div>
                </Col>
                {/* Submissions */}
                <Col xs={8} sm={4}>
                  <div style={{
                    background:'linear-gradient(135deg, #eff6ff 0%, #bfdbfe 100%)',
                    border:'1.5px solid #93c5fd',
                    borderRadius:'12px',
                    padding:'16px 16px 14px',
                    display:'flex',
                    alignItems:'center',
                    gap:'10px',
                  }}>
                    <div style={{
                      width:'40px', height:'40px', borderRadius:'10px',
                      background:'#2563eb', display:'flex', alignItems:'center',
                      justifyContent:'center', flexShrink: 0,
                    }}>
                      <CheckCircleOutlined style={{ color:'#fff', fontSize:'18px' }} />
                    </div>
                    <div>
                      <div style={{ fontSize:'22px', fontWeight: 800, color:'#1e40af', lineHeight: 1 }}>
                        {teacherStats.totalSubmissions}
                      </div>
                      <div style={{ fontSize:'10px', color:'#64748b', fontWeight: 600, marginTop:'2px', letterSpacing:'0.3px' }}>
                        SUBMISSIONS
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Main Content Grid */}
            <Row gutter={[24, 24]}>
              {/* Left Column - Personal Information & Portfolio */}
              <Col xs={24} lg={24}>
                <Card
                  title={
                    <Space>
                      <UserOutlined />
                      <span>Personal Information</span>
                    </Space>
                  }
                  style={{ marginBottom:'24px', borderRadius:'8px' }}
                >
                  <Descriptions column={{ xs: 1, sm: 2 }} bordered>
                    <Descriptions.Item
                      label={<><UserOutlined /> Full Name</>}
                      span={2}
                    >
                      {teacher.tname ||'Not provided'}
                    </Descriptions.Item>

                    <Descriptions.Item
                      label={<><MailOutlined /> Email Address</>}
                    >
                      <Text copyable>{teacher.temail ||'Not provided'}</Text>
                    </Descriptions.Item>

                    <Descriptions.Item
                      label={<><PhoneOutlined /> Phone Number</>}
                    >
                      <Text copyable>{teacher.tphn ||'Not provided'}</Text>
                    </Descriptions.Item>

                    <Descriptions.Item
                      label={<><TrophyOutlined /> Specialization</>}
                      span={2}
                    >
                      <Tag color="blue" style={{ fontSize:'14px', padding:'4px 8px' }}>
                        {teacher.tspecialization ||'Not specified'}
                      </Tag>
                    </Descriptions.Item>

                    <Descriptions.Item
                      label={<><SecurityScanFilled /> Experience</>}
                    >
                      <Space>
                        <Text strong>{teacher.texp ||'0'} Years</Text>
                        <Tag color={experienceLevel.color}>{experienceLevel.text}</Tag>
                      </Space>
                    </Descriptions.Item>

                    <Descriptions.Item
                      label={<><CheckCircleOutlined /> Status</>}
                    >
                      <Badge
                        status={getStatusColor(teacher.Status ||'') as any}
                        text={teacher.Status ||'Pending'}
                      />
                    </Descriptions.Item>

                    <Descriptions.Item
                      label={<><CalendarOutlined /> Joined Draa</>}
                    >
                      {teacher.updatedAt ? new Date(teacher.updatedAt).toLocaleDateString('en-US', {
                        year:'numeric',
                        month:'long',
                        day:'numeric'
                      }) :'Not available'}
                    </Descriptions.Item>

                    <Descriptions.Item
                      label={<><ClockCircleOutlined /> Teaching Duration</>}
                    >
                      {teacher.updatedAt ?
                        `${Math.floor((new Date().getTime() - new Date(teacher.updatedAt).getTime()) / (1000 * 60 * 60 * 24))} days` :
'Recently joined'
                      }
                    </Descriptions.Item>
                  </Descriptions>

                  {teacher.tbio && (
                    <>
                      <Divider orientation="left">Biography</Divider>
                      <Paragraph style={{ fontSize:'14px', lineHeight:'1.6' }}>
                        {teacher.tbio}
                      </Paragraph>
                    </>
                  )}
                </Card>

                {/*  Teaching Portfolio Showcase */}
                <Card
                  title={
                    <Space>
                      <BookOutlined />
                      <span>Teaching Portfolio</span>
                      <Badge
                        count={teacherStats.totalCourses + teacherStats.totalBooks + teacherStats.totalTestSeries + teacherStats.totalExams + (teacherStats.totalBlogs || 0)}
                        style={{ backgroundColor:'#52c41a' }}
                      />
                    </Space>
                  }
                  style={{ borderRadius:'8px' }}
                  loading={contentLoading}
                >
                  <Tabs
                    items={[
                      {
                        key:'courses',
                        label: (
                          <Space>
                            <BookOutlined />
                            Courses ({teacherStats.totalCourses})
                          </Space>
                        ),
                        children: (
                          <List
                            dataSource={(teacherContent.courses || []).slice(0, 4)}
                            renderItem={(course) => (
                              <List.Item
                                actions={[
                                  <Button size="small" type="primary" icon={<EyeOutlined />}>
                                    View Course
                                  </Button>
                                ]}
                              >
                                <List.Item.Meta
                                  avatar={
                                    <Avatar
                                      src={course.coverphoto ? getProfileImageUrl(course.coverphoto) : undefined}
                                      icon={<BookOutlined />}
                                      size={50}
                                      style={{ backgroundColor:'#1890ff' }}
                                    />
                                  }
                                  title={
                                    <Space>
                                      {course.title}
                                      <Tag color="blue">{course.price?.toLocaleString('en-IN') ||'Free'}</Tag>
                                      {course.rating >= 4.5 && <Tag color="gold"> Popular</Tag>}
                                    </Space>
                                  }
                                  description={
                                    <Space direction="vertical" size={4}>
                                      <Text type="secondary">{course.short_desc}</Text>
                                      <Space size={16}>
                                        <Text type="secondary">
                                          <TeamOutlined /> {course.enrollmentCount || 0} students
                                        </Text>
                                        <Text type="secondary">
                                          <StarOutlined /> {course.rating?.toFixed(1) || 4.5} rating
                                        </Text>
                                        <Text type="secondary">
                                          <ClockCircleOutlined /> {course.duration || 0}h duration
                                        </Text>
                                      </Space>
                                    </Space>
                                  }
                                />
                              </List.Item>
                            )}
                          />
                        ),
                      },
                      {
                        key:'books',
                        label: (
                          <Space>
                            <ReadOutlined />
                            Books ({teacherStats.totalBooks})
                          </Space>
                        ),
                        children: (
                          <List
                            dataSource={teacherContent.books || []}
                            renderItem={(book) => (
                              <List.Item
                                actions={[
                                  <Button size="small" type="primary" icon={<DownloadOutlined />}>
                                    Download
                                  </Button>
                                ]}
                              >
                                <List.Item.Meta
                                  avatar={
                                    <Avatar
                                      icon={<ReadOutlined />}
                                      size={50}
                                      style={{ backgroundColor:'#52c41a' }}
                                    />
                                  }
                                  title={
                                    <Space>
                                      {book.title}
                                      <Tag color="green">{book.price?.toLocaleString('en-IN') ||'Free'}</Tag>
                                      <Tag color="blue">{book.format}</Tag>
                                    </Space>
                                  }
                                  description={
                                    <Space direction="vertical" size={4}>
                                      <Text type="secondary">{book.description}</Text>
                                      <Space size={16}>
                                        <Text type="secondary">
                                          <DownloadOutlined /> {book.downloads || 0} downloads
                                        </Text>
                                        <Text type="secondary">
                                          <FileTextOutlined /> {book.pages || 0} pages
                                        </Text>
                                      </Space>
                                    </Space>
                                  }
                                />
                              </List.Item>
                            )}
                          />
                        ),
                      },
                      {
                        key:'testSeries',
                        label: (
                          <Space>
                            <FileAddOutlined />
                            Test Series ({teacherStats.totalTestSeries})
                          </Space>
                        ),
                        children: (
                          <List
                            dataSource={teacherContent.testSeries || []}
                            renderItem={(testSeries) => (
                              <List.Item
                                actions={[
                                  <Button size="small" type="primary" icon={<PlayCircleOutlined />}>
                                    New Tests
                                  </Button>
                                ]}
                              >
                                <List.Item.Meta
                                  avatar={<Avatar icon={<FileAddOutlined />} size={50} style={{ backgroundColor:'#faad14' }} />}
                                  title={
                                    <Space>
                                      {testSeries.title}
                                      <Tag color="orange">{testSeries.price?.toLocaleString('en-IN') ||'Free'}</Tag>
                                    </Space>
                                  }
                                  description={
                                    <Space direction="vertical" size={4}>
                                      <Text type="secondary">{testSeries.description}</Text>
                                      <Space size={16}>
                                        <Text type="secondary">
                                          <FileTextOutlined /> {testSeries.questions?.length || 0} questions
                                        </Text>
                                        <Text type="secondary">
                                          <ClockCircleOutlined /> {testSeries.duration || 0} minutes
                                        </Text>
                                        <Text type="secondary">
                                          <TeamOutlined /> {testSeries.attempts || 0} attempts
                                        </Text>
                                      </Space>
                                    </Space>
                                  }
                                />
                              </List.Item>
                            )}
                          />
                        ),
                      },
                      {
                        key:'exams',
                        label: (
                          <Space>
                            <ExperimentOutlined />
                            Exams ({teacherStats.totalExams})
                          </Space>
                        ),
                        children: teacherContent.exams.length === 0 ? (
                          <Empty description="No exams created yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        ) : (
                          <List
                            dataSource={(teacherContent.exams || []).slice(0, 4)}
                            renderItem={(exam) => (
                              <List.Item
                                actions={[
                                  <Button size="small" type="primary" icon={<ExperimentOutlined />}>
                                    View Results
                                  </Button>
                                ]}
                              >
                                <List.Item.Meta
                                  avatar={<Avatar icon={<ExperimentOutlined />} size={50} style={{ backgroundColor:'#722ed1' }} />}
                                  title={
                                    <Space>
                                      {exam.title}
                                      <Tag color="purple">{exam.totalMarks} marks</Tag>
                                      {(exam.submissions?.length || 0) > 50 && <Tag color="green">Popular</Tag>}
                                    </Space>
                                  }
                                  description={
                                    <Space direction="vertical" size={4}>
                                      <Text type="secondary">{exam.subject}</Text>
                                      <Space size={16}>
                                        <Text type="secondary">
                                          <FileTextOutlined /> {exam.questions?.length || 0} questions
                                        </Text>
                                        <Text type="secondary">
                                          <ClockCircleOutlined /> {exam.durationMinutes || 0} minutes
                                        </Text>
                                        <Text type="secondary">
                                          <TeamOutlined /> {exam.submissions?.length || 0} submissions
                                        </Text>
                                      </Space>
                                    </Space>
                                  }
                                />
                              </List.Item>
                            )}
                          />
                        ),
                      },
                      {
                        key:'blogs',
                        label: (
                          <Space>
                            <FileTextOutlined />
                            Blogs ({teacherContent.blogs?.length || 0})
                          </Space>
                        ),
                        children: !teacherContent.blogs?.length ? (
                          <Empty description="No blogs written yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        ) : (
                          <List
                            dataSource={(teacherContent.blogs || []).slice(0, 6)}
                            renderItem={(blog: any) => (
                              <List.Item
                                actions={[
                                  <Button size="small" type="primary" icon={<EyeOutlined />}
                                    onClick={() => window.open(`/blog-details/${blog._id}`,'_blank')}>
                                    View Blog
                                  </Button>
                                ]}
                              >
                                <List.Item.Meta
                                  avatar={
                                    <Avatar
                                      src={blog.schema_image ? `${url}/${blog.schema_image}` : undefined}
                                      icon={<FileTextOutlined />}
                                      size={50}
                                      style={{ backgroundColor:'#5b6cff' }}
                                    />
                                  }
                                  title={<Text strong>{blog.content_subject}</Text>}
                                  description={
                                    <Space direction="vertical" size={2}>
                                      <Space size={12}>
                                        <Tag color={blog.approved ?'success' :'warning'} style={{ fontSize: 10 }}>
                                          {blog.approved ?' Published' :' Pending'}
                                        </Tag>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                          <EyeOutlined /> {blog.views || 0} views
                                        </Text>
                                      </Space>
                                      {/* Category hidden as requested */}
                                      {/* 
                                      {Array.isArray(blog.content_category) ? (
                                        <Text type="secondary" style={{ fontSize: 11 }}>
                                          {blog.content_category.slice(0, 3).join(',')}
                                        </Text>
                                      ) : blog.content_category ? (
                                        <Text type="secondary" style={{ fontSize: 11 }}>{blog.content_category}</Text>
                                      ) : null}
                                      */}
                                    </Space>
                                  }
                                />
                              </List.Item>
                            )}
                          />
                        ),
                      },
                    ]}
                  />
                </Card>
              </Col>

              {/* Right Column - Quick Actions & Performance */}

            </Row>
          </div>
        </Content>

        {/* Enhanced Footer */}
        <Footer style={{
          textAlign:'center',
          background:'#f0f2f5',
          borderTop:'1px solid #d9d9d9'
        }}>
          <Text type="secondary">
            <strong>© 2026 Draa. All Rights Reserved.</strong>
          </Text>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default TeacherProfile;
