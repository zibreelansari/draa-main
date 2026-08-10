import React, { useState, useEffect, useCallback } from'react';
import {
  Layout,
  Row,
  Col,
  Card,
  Statistic,
  message,
  Spin,
  Typography,
  Space,
  Tag,
  Progress,
  Table,
  Badge,
  Divider,
  Button,
  Alert,
  Tooltip,
} from'antd';
import {
  UserOutlined,
  BookOutlined,
  FileTextOutlined,
  ReadOutlined,
  TrophyOutlined,
  ExperimentOutlined,
  TeamOutlined,
  StarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  RiseOutlined,
  CalendarOutlined,
  ReloadOutlined,
  TagOutlined,
  EyeOutlined,
  BarChartOutlined,
  CloseCircleOutlined,
} from'@ant-design/icons';
import { useNavigate } from'react-router-dom';
import Topbar from'./Topbar';
import Sidebar2 from'./Sidebar2';
import uri from'../../url';
import { getAuthHeaders } from'../../utils/global_auth';
import usePageTitle from '../../hooks/usePageTitle';

const { Content, Footer } = Layout;
const { Title, Text } = Typography;

//  Types 

interface TeacherDashboardStats {
  courses: {
    total: number;
    active: number;
    students: number;
    revenue: number;
    totalHours: number;
    averageRating: number;
    approved: number;
    pending: number;
    draft: number;
    published: number;
  };
  books: {
    total: number;
    published: number;
    digital: number;
    physical: number;
    totalSales: number;
    approved: number;
    pending: number;
    featured: number;
  };
  testSeries: {
    total: number;
    active: number;
    totalAttempts: number;
    totalQuestions: number;
    averageScore: number;
    approved: number;
    pending: number;
    rejected: number;
  };
  exams: {
    total: number;
    active: number;
    upcoming: number;
    completed: number;
    totalSubmissions: number;
    averageScore: number;
  };
  students: {
    total: number;
    active: number;
    newThisMonth: number;
    averagePerformance: number;
  };
  jobs: {
    total: number;
    approved: number;
    pending: number;
    active: number;
  };
  content: {
    total: number;
    approved: number;
    pending: number;
    totalViews: number;
  };
  totalContent: number;
  notifications: number;
  promocode?: string;
}

interface StudentRow {
  id: number;
  name: string;
  email: string;
  grade: string;
  averageScore: number;
  totalExams: number;
  attendance: number;
  status: string;
  lastActivity: string;
}

//  Helpers 

const safeFetch = async (endpoint: string): Promise<any> => {
  try {
    const res = await fetch(`${uri}${endpoint}`, {
      headers: {
        ...getAuthHeaders()
      }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};

const fmt = (n: number) =>
  n >= 1_00_00_000
    ? `${(n / 1_00_00_000).toFixed(1)}Cr`
    : n >= 1_00_000
      ? `${(n / 1_00_000).toFixed(1)}L`
      : n >= 1_000
        ? `${(n / 1_000).toFixed(1)}K`
        : (n ?? 0).toString();

//  Sub-components 

const StatCard = ({
  title,
  value,
  icon,
  color,
  sub1,
  sub2,
  onClick,
  badge,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  sub1?: { label: string; value: string | number; color?: string };
  sub2?: { label: string; value: string | number; color?: string };
  onClick?: () => void;
  badge?: number;
}) => (
  <Card
    hoverable={!!onClick}
    onClick={onClick}
    style={{
      borderRadius: 12,
      border:'1px solid #f0f0f0',
      cursor: onClick ?'pointer' :'default',
      height:'100%',
      transition:'all 0.2s',
    }}
    bodyStyle={{ padding:'20px 24px' }}
  >
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
      <div style={{ flex: 1 }}>
        <Text
          type="secondary"
          style={{ fontSize: 12, fontWeight: 500, textTransform:'uppercase', letterSpacing: 0.5 }}
        >
          {title}
        </Text>
        <div style={{ display:'flex', alignItems:'center', gap: 8, marginTop: 4 }}>
          <Title level={3} style={{ margin: 0, color:'#1a1a1a', lineHeight: 1.2 }}>
            {value}
          </Title>
          {badge !== undefined && badge > 0 && (
            <Badge count={badge} style={{ backgroundColor:'#faad14' }} />
          )}
        </div>
        {(sub1 || sub2) && (
          <div style={{ marginTop: 8, display:'flex', gap: 12, flexWrap:'wrap' }}>
            {sub1 && (
              <Text style={{ fontSize: 11, color: sub1.color ??'#52c41a' }}>
                <CheckCircleOutlined style={{ marginRight: 3 }} />
                {sub1.value} {sub1.label}
              </Text>
            )}
            {sub2 && (
              <Text style={{ fontSize: 11, color: sub2.color ??'#faad14' }}>
                <ClockCircleOutlined style={{ marginRight: 3 }} />
                {sub2.value} {sub2.label}
              </Text>
            )}
          </div>
        )}
      </div>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: `${color}18`,
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          fontSize: 22,
          color,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
    </div>
  </Card>
);

const PendingRow = ({
  label,
  count,
  total,
  note,
}: {
  label: string;
  count: number;
  total: number;
  note?: string;
}) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 4 }}>
      <Text style={{ fontSize: 13 }}>{label}</Text>
      <Space size={6}>
        <Tag color={count > 0 ?'warning' :'success'} style={{ margin: 0, fontSize: 11 }}>
          {count > 0 ? `${count} pending` :'All approved'}
        </Tag>
      </Space>
    </div>
    <Progress
      percent={total > 0 ? Math.round(((total - count) / total) * 100) : 100}
      size="small"
      showInfo={false}
      strokeColor={count > 0 ?'#faad14' :'#52c41a'}
    />
    {note && (
      <Text type="secondary" style={{ fontSize: 10 }}>
        {note}
      </Text>
    )}
  </div>
);

//  Main Component 

const TeacherDashboard: React.FC = () => {
  usePageTitle('Teacher Dashboard | Draa');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [teacherInfo, setTeacherInfo] = useState<any>({});
  const [studentsData, setStudentsData] = useState<StudentRow[]>([]);

  const [stats, setStats] = useState<TeacherDashboardStats>({
    courses: { total: 0, active: 0, students: 0, revenue: 0, totalHours: 0, averageRating: 0, approved: 0, pending: 0, draft: 0, published: 0 },
    books: { total: 0, published: 0, digital: 0, physical: 0, totalSales: 0, approved: 0, pending: 0, featured: 0 },
    testSeries: { total: 0, active: 0, totalAttempts: 0, totalQuestions: 0, averageScore: 0, approved: 0, pending: 0, rejected: 0 },
    exams: { total: 0, active: 0, upcoming: 0, completed: 0, totalSubmissions: 0, averageScore: 0 },
    students: { total: 0, active: 0, newThisMonth: 0, averagePerformance: 0 },
    jobs: { total: 0, approved: 0, pending: 0, active: 0 },
    content: { total: 0, approved: 0, pending: 0, totalViews: 0 },
    totalContent: 0,
    notifications: 0,
    promocode:'',
  });

  //  Permissions 
  const permissions = teacherInfo.permissions || ['Dashboard Overview','My Profile'];
  const hasPermission = (permission: string) => {
    if (['Dashboard Overview','My Profile'].includes(permission)) return true;
    return permissions.includes(permission);
  };

  //  Auth + load 
  useEffect(() => {
    const raw = localStorage.getItem('edudocs');
    if (!raw) {
      navigate('/teacher-login', { replace: true });
      return;
    }
    try {
      const teacher = JSON.parse(raw);
      // Block non-teachers from teacher dashboard
      if (!teacher.tname && !teacher.T_email && !teacher.T_name && teacher.role !=='teacher') {
        message.error("Access Denied: Teacher privileges required");
        navigate('/teacher-login', { replace: true });
        return;
      }
      setTeacherInfo(teacher);
    } catch {
      navigate('/teacher-login', { replace: true });
    }
  }, [navigate]);

  const loadDashboard = useCallback(
    async (silent = false) => {
      if (!teacherInfo?.id && !teacherInfo?._id) return;
      const tid = teacherInfo._id ?? teacherInfo.id;
      if (!silent) setLoading(true);

      const next: Partial<TeacherDashboardStats> = {};

      //  1. Official analytics endpoint 
      const analyticsRes = await safeFetch(`/teacher/dashboard/analytics/stats/${tid}`);
      if (analyticsRes?.success && analyticsRes.data) {
        const d = analyticsRes.data;
        // Merge deep  keep existing defaults for missing keys
        Object.assign(next, {
          courses: { ...stats.courses, ...d.courses },
          books: { ...stats.books, ...d.books },
          testSeries: { ...stats.testSeries, ...d.testSeries },
          exams: { ...stats.exams, ...d.exams },
          students: { ...stats.students, ...d.students },
          totalContent: d.totalContent ?? 0,
          notifications: d.notifications ?? 0,
          promocode: d.promocode ?? teacherInfo.promocode ??'',
        });
      }

      //  2. Students list 
      const stuRes = await safeFetch(
        `/teacher/dashboard/analytics/students/${tid}?limit=50`
      );
      if (stuRes?.success && stuRes.data) {
        setStudentsData(stuRes.data);
        if (!next.students) next.students = { ...stats.students };
        next.students.total = stuRes.data.length;
        next.students.active = stuRes.data.filter((s: any) => s.status ==='Active').length;
      }

      //  3. Courses fallback 
      // If analytics didn't return course data, try the teacher's own courses
      if (!next.courses?.total) {
        const courseRes = await safeFetch(`/course/teacher/${tid}`);
        if (courseRes) {
          const courses: any[] =
            courseRes.data?.courses ?? courseRes.courses ?? (Array.isArray(courseRes) ? courseRes : []);
          if (!next.courses) next.courses = { ...stats.courses };
          next.courses.total = courses.length;
          next.courses.approved = courses.filter((c) => c.isApproved).length;
          next.courses.pending = courses.filter((c) => !c.isApproved).length;
          next.courses.published = courses.filter((c) => c.status ==='published').length;
          next.courses.draft = courses.filter((c) => c.status ==='draft').length;
          next.courses.students = courses.reduce((acc, c) => acc + (c.enrollmentCount ?? 0), 0);
          next.courses.averageRating =
            courses.filter((c) => c.averageRating).length > 0
              ? parseFloat(
                (
                  courses.reduce((acc, c) => acc + (c.averageRating ?? 0), 0) /
                  courses.filter((c) => c.averageRating).length
                ).toFixed(1)
              )
              : 0;
        }
      }

      //  4. Books fallback 
      if (!next.books?.total) {
        const booksRes = await safeFetch(`/books/all`); // books by this teacher ideally
        if (booksRes?.books) {
          const myBooks: any[] = booksRes.books.filter(
            (b: any) => b.teacher_id === tid || b.teacherId === tid
          );
          if (!next.books) next.books = { ...stats.books };
          next.books.total = myBooks.length;
          next.books.approved = myBooks.filter((b) => b.isApproved).length;
          next.books.pending = myBooks.filter((b) => !b.isApproved).length;
          next.books.featured = myBooks.filter((b) => b.isFeatured).length;
        }
      }

      //  5. Test series fallback 
      if (!next.testSeries?.total) {
        const tsRes = await safeFetch(`/test-series/teacher/${tid}`);
        if (tsRes?.data?.testSeries) {
          const ts: any[] = tsRes.data.testSeries;
          if (!next.testSeries) next.testSeries = { ...stats.testSeries };
          next.testSeries.total = ts.length;
          next.testSeries.approved = ts.filter((t) => t.status ==='approved').length;
          next.testSeries.pending = ts.filter((t) => t.status ==='pending').length;
          next.testSeries.rejected = ts.filter((t) => t.status ==='rejected').length;
          next.testSeries.totalQuestions = ts.reduce((acc, t) => acc + (t.questions?.length ?? 0), 0);
        }
      }

      //  6. Exams fallback 
      if (!next.exams?.total) {
        const examRes = await safeFetch(`/exam/teacher/${tid}`);
        if (examRes?.exams) {
          const exams: any[] = Array.isArray(examRes.exams) ? examRes.exams : [examRes.exams];
          if (!next.exams) next.exams = { ...stats.exams };
          next.exams.total = exams.length;
          next.exams.completed = exams.filter((e) => e.status ==='completed').length;
          next.exams.upcoming = exams.filter((e) => e.status ==='upcoming' || new Date(e.scheduledAt) > new Date()).length;
        }
      }

      //  7. Jobs fallback 
      const jobsRes = await safeFetch(`/jobs?teacher_id=${tid}`);
      if (jobsRes) {
        const jobs: any[] = jobsRes.jobs ?? jobsRes.data?.jobs ?? (Array.isArray(jobsRes) ? jobsRes : []);
        if (!next.jobs) next.jobs = { ...stats.jobs };
        next.jobs.total = jobs.length;
        next.jobs.approved = jobs.filter((j) => j.isApproved).length;
        next.jobs.pending = jobs.filter((j) => !j.isApproved).length;
        next.jobs.active = jobs.filter((j) => j.status ==='Active').length;
      }

      //  8. Course content fallback 
      const contentRes = await safeFetch(`/course/allCourseContent`);
      if (contentRes?.result) {
        const myContent: any[] = contentRes.result.filter(
          (c: any) => c.teacher_id === tid || c.teacherId === tid || c.author === (teacherInfo.tname ?? teacherInfo.name)
        );
        if (!next.content) next.content = { ...stats.content };
        next.content.total = myContent.length;
        next.content.approved = myContent.filter((c) => c.approved).length;
        next.content.pending = myContent.filter((c) => !c.approved).length;
        next.content.totalViews = myContent.reduce((acc, c) => acc + (c.views ?? 0), 0);

        // Also update totalContent if not set
        if (!next.totalContent) {
          next.totalContent =
            (next.courses?.total ?? 0) +
            (next.books?.total ?? 0) +
            (next.testSeries?.total ?? 0) +
            (next.exams?.total ?? 0) +
            myContent.length;
        }
      }

      //  Promo code from teacher profile 
      if (!next.promocode && teacherInfo.promocode) {
        next.promocode = teacherInfo.promocode;
      }

      setStats((prev) => ({ ...prev, ...next }));

      if (!silent) {
        setLoading(false);
        setRefreshing(false);
      } else {
        setRefreshing(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [teacherInfo]
  );

  useEffect(() => {
    if (teacherInfo?._id || teacherInfo?.id) {
      loadDashboard(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherInfo?._id, teacherInfo?.id]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboard(true).then(() => message.success('Dashboard refreshed'));
  };

  //  Total pending across all teacher's content 
  const totalPending =
    (stats.courses.pending ?? 0) +
    (stats.books.pending ?? 0) +
    (stats.testSeries.pending ?? 0) +
    (stats.content.pending ?? 0) +
    (stats.jobs.pending ?? 0);

  //  Students table columns 
  const studentColumns = [
    {
      title:'Student',
      key:'student',
      render: (_: any, r: StudentRow) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>{r.name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>{r.email}</Text>
        </div>
      ),
    },
    {
      title:'Avg Score',
      dataIndex:'averageScore',
      key:'score',
      width: 110,
      render: (v: number) => (
        <Text
          strong
          style={{
            color: v >= 80 ?'#52c41a' : v >= 60 ?'#faad14' :'#ff4d4f',
          }}
        >
          {v}%
        </Text>
      ),
    },
    {
      title:'Exams',
      dataIndex:'totalExams',
      key:'exams',
      width: 80,
      render: (v: number) => <Text>{v}</Text>,
    },
    {
      title:'Attendance',
      dataIndex:'attendance',
      key:'attendance',
      width: 110,
      render: (v: number) => (
        <Progress
          percent={v}
          size="small"
          strokeColor={v >= 80 ?'#52c41a' : v >= 60 ?'#faad14' :'#ff4d4f'}
          format={(p) => `${p}%`}
        />
      ),
    },
    {
      title:'Status',
      dataIndex:'status',
      key:'status',
      width: 90,
      render: (v: string) => (
        <Tag color={v ==='Active' ?'green' : v ==='Moderate' ?'orange' :'red'}>{v}</Tag>
      ),
    },
  ];

  //  Loading state 
  if (loading) {
    return (
      <Layout style={{ minHeight:'100vh' }}>
        <Sidebar2 />
        <Layout>
          <Topbar />
          <Content
            style={{
              display:'flex',
              justifyContent:'center',
              alignItems:'center',
              minHeight:'80vh',
            }}
          >
            <div style={{ textAlign:'center' }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>
                <Text type="secondary">Loading your teaching analytics...</Text>
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }

  const showExams = hasPermission("Manage Courses");
  const showTestSeries = hasPermission("Manage Test Series");
  const assessmentsColSpan = (showExams && showTestSeries) ? 12 : 24;

  const showBooks = hasPermission("Manage Books");
  const showContent = hasPermission("Manage Courses");
  const showJobs = hasPermission("Manage Jobs");
  const visibleContentCards = [showBooks, showContent, showJobs].filter(Boolean).length;
  const contentColSpan = visibleContentCards === 3 ? 8 : visibleContentCards === 2 ? 12 : 24;

  return (
    <Layout style={{ minHeight:'100vh' }}>
      <Sidebar2 />
      <Layout>
        <Topbar />
        <Content style={{ margin:'16px', padding:'0 8px' }}>

          {/*  Header  */}
          <div
            style={{
              background:'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
              borderRadius: 16,
              padding:'28px 32px',
              marginBottom: 24,
              display:'flex',
              justifyContent:'space-between',
              alignItems:'center',
              flexWrap:'wrap',
              gap: 16,
            }}
          >
            <div>
              <Title level={2} style={{ color:'#fff', margin: 0 }}>
                Welcome back, {teacherInfo.tname ?? teacherInfo.name ??'Teacher'} 
              </Title>
              <Text style={{ color:'rgba(255,255,255,0.75)', fontSize: 14 }}>
                Here's your complete teaching performance overview
              </Text>
            </div>
            <Space wrap>
              {stats.promocode && (
                <Tooltip title="Your referral promocode">
                  <Tag
                    icon={<TagOutlined />}
                    color="blue"
                    style={{ fontSize: 13, padding:'4px 12px', borderRadius: 8 }}
                  >
                    PROMO: {stats.promocode}
                  </Tag>
                </Tooltip>
              )}
              <Button
                icon={<ReloadOutlined spin={refreshing} />}
                loading={refreshing}
                onClick={handleRefresh}
                style={{
                  background:'rgba(255,255,255,0.15)',
                  color:'#fff',
                  border:'1px solid rgba(255,255,255,0.3)',
                  borderRadius: 8,
                }}
              >
                Refresh
              </Button>
            </Space>
          </div>

          {/*  Pending Alert  */}
          {totalPending > 0 && (
            <Alert
              message={
                <Text strong>
                  {totalPending} of your submissions are pending admin approval
                </Text>
              }
              description={
                <Space split={<Divider type="vertical" />}>
                  {hasPermission("Manage Courses") && <span>Courses: {stats.courses.pending}</span>}
                  {hasPermission("Manage Books") && <span>Books: {stats.books.pending}</span>}
                  {hasPermission("Manage Test Series") && <span>Test Series: {stats.testSeries.pending}</span>}
                  {hasPermission("Manage Courses") && <span>Content: {stats.content.pending}</span>}
                  {hasPermission("Manage Jobs") && <span>Jobs: {stats.jobs.pending}</span>}
                </Space>
              }
              type="warning"
              showIcon
              style={{ marginBottom: 24, borderRadius: 10 }}
            />
          )}

          {/* 
              SECTION 1  QUICK OVERVIEW STRIP
           */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={12} sm={8} md={6} lg={4}>
              <StatCard
                title="My Students"
                value={stats.students.total}
                icon={<UserOutlined />}
                color="#1890ff"
                sub1={{ label:'active', value: stats.students.active }}
              />
            </Col>
            {hasPermission("Manage Courses") && (
              <Col xs={12} sm={8} md={6} lg={4}>
                <StatCard
                  title="My Courses"
                  value={stats.courses.total}
                  icon={<BookOutlined />}
                  color="#52c41a"
                  sub2={{ label:'pending', value: stats.courses.pending }}
                  badge={stats.courses.pending}
                />
              </Col>
            )}
            {hasPermission("Manage Books") && (
              <Col xs={12} sm={8} md={6} lg={4}>
                <StatCard
                  title="My Books"
                  value={stats.books.total}
                  icon={<ReadOutlined />}
                  color="#13c2c2"
                  sub2={{ label:'pending', value: stats.books.pending }}
                  badge={stats.books.pending}
                />
              </Col>
            )}
            {hasPermission("Manage Test Series") && (
              <Col xs={12} sm={8} md={6} lg={4}>
                <StatCard
                  title="Test Series"
                  value={stats.testSeries.total}
                  icon={<TrophyOutlined />}
                  color="#faad14"
                  sub2={{ label:'pending', value: stats.testSeries.pending }}
                  badge={stats.testSeries.pending}
                />
              </Col>
            )}
            {hasPermission("Manage Courses") && (
              <Col xs={12} sm={8} md={6} lg={4}>
                <StatCard
                  title="Exams Created"
                  value={stats.exams.total}
                  icon={<ExperimentOutlined />}
                  color="#722ed1"
                  sub1={{ label:'active', value: stats.exams.active }}
                  sub2={{ label:'upcoming', value: stats.exams.upcoming }}
                />
              </Col>
            )}
            <Col xs={12} sm={8} md={6} lg={4}>
              <StatCard
                title="Total Content"
                value={stats.totalContent}
                icon={<BarChartOutlined />}
                color="#eb2f96"
              />
            </Col>
          </Row>

          {/* 
              SECTION 2  COURSES DEEP DIVE
           */}
          {hasPermission("Manage Courses") && (
            <>
              <div style={{ marginBottom: 8 }}>
                <Text strong style={{ fontSize: 15, color:'#1a1a1a' }}>
                  <BookOutlined style={{ marginRight: 6, color:'#52c41a' }} />
                  Course Analytics
                </Text>
              </div>
              <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                  <StatCard
                    title="Students Enrolled"
                    value={stats.courses.students}
                    icon={<TeamOutlined />}
                    color="#1890ff"
                  />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <StatCard
                    title="Avg Course Rating"
                    value={`${stats.courses.averageRating ?? 0}/5.0`}
                    icon={<StarOutlined />}
                    color="#faad14"
                  />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <StatCard
                    title="Course Hours"
                    value={`${stats.courses.totalHours ?? 0}h`}
                    icon={<ClockCircleOutlined />}
                    color="#722ed1"
                  />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card style={{ borderRadius: 12, border:'1px solid #f0f0f0', height:'100%' }} bodyStyle={{ padding:'20px 24px' }}>
                    <Text type="secondary" style={{ fontSize: 12, fontWeight: 500, textTransform:'uppercase' }}>
                      Course Status
                    </Text>
                    <div style={{ marginTop: 10 }}>
                      {[
                        { label:'Approved', value: stats.courses.approved, color:'success' as const },
                        { label:'Published', value: stats.courses.published, color:'processing' as const },
                        { label:'Pending', value: stats.courses.pending, color:'warning' as const },
                        { label:'Draft', value: stats.courses.draft, color:'default' as const },
                      ].map((item) => (
                        <div key={item.label} style={{ display:'flex', justifyContent:'space-between', marginBottom: 6 }}>
                          <Text style={{ fontSize: 12 }}>{item.label}</Text>
                          <Tag color={item.color} style={{ margin: 0, fontSize: 11 }}>{item.value}</Tag>
                        </div>
                      ))}
                    </div>
                  </Card>
                </Col>
              </Row>
            </>
          )}

          {/* 
              SECTION 3  ASSESSMENTS (EXAMS + TEST SERIES)
           */}
          {(hasPermission("Manage Courses") || hasPermission("Manage Test Series")) && (
            <>
              <div style={{ marginBottom: 8 }}>
                <Text strong style={{ fontSize: 15, color:'#1a1a1a' }}>
                  <ExperimentOutlined style={{ marginRight: 6, color:'#722ed1' }} />
                  Assessments
                </Text>
              </div>
              <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                {/* Exams */}
                {hasPermission("Manage Courses") && (
                  <Col xs={24} lg={assessmentsColSpan}>
                    <Card
                      title={
                        <Space>
                          <ExperimentOutlined style={{ color:'#722ed1' }} />
                          <Text strong>Exam Overview</Text>
                        </Space>
                      }
                      style={{ borderRadius: 12, height:'100%' }}
                    >
                      <Row gutter={[16, 16]}>
                        <Col span={12}>
                          <Statistic title="Total Exams" value={stats.exams.total} valueStyle={{ fontSize: 20 }} />
                        </Col>
                        <Col span={12}>
                          <Statistic title="Active" value={stats.exams.active} valueStyle={{ fontSize: 20, color:'#52c41a' }} />
                        </Col>
                        <Col span={12}>
                          <Statistic title="Upcoming" value={stats.exams.upcoming} valueStyle={{ fontSize: 20, color:'#1890ff' }} />
                        </Col>
                        <Col span={12}>
                          <Statistic title="Completed" value={stats.exams.completed} valueStyle={{ fontSize: 20, color:'#aaa' }} />
                        </Col>
                        <Col span={12}>
                          <Statistic title="Submissions" value={stats.exams.totalSubmissions} valueStyle={{ fontSize: 20 }} />
                        </Col>
                        <Col span={12}>
                          <Statistic
                            title="Avg Score"
                            value={stats.exams.averageScore}
                            suffix="%"
                            valueStyle={{
                              fontSize: 20,
                              color: stats.exams.averageScore >= 70 ?'#52c41a' :'#faad14',
                            }}
                          />
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                )}

                {/* Test Series */}
                {hasPermission("Manage Test Series") && (
                  <Col xs={24} lg={assessmentsColSpan}>
                    <Card
                      title={
                        <Space>
                          <TrophyOutlined style={{ color:'#faad14' }} />
                          <Text strong>Test Series Overview</Text>
                          {stats.testSeries.pending > 0 && (
                            <Badge count={stats.testSeries.pending} style={{ backgroundColor:'#faad14' }} />
                          )}
                        </Space>
                      }
                      style={{ borderRadius: 12, height:'100%' }}
                    >
                      <Row gutter={[16, 16]}>
                        <Col span={12}>
                          <Statistic title="Total" value={stats.testSeries.total} valueStyle={{ fontSize: 20 }} />
                        </Col>
                        <Col span={12}>
                          <Statistic title="Approved" value={stats.testSeries.approved} valueStyle={{ fontSize: 20, color:'#52c41a' }} />
                        </Col>
                        <Col span={12}>
                          <Statistic title="Pending" value={stats.testSeries.pending} valueStyle={{ fontSize: 20, color:'#faad14' }} />
                        </Col>
                        <Col span={12}>
                          <Statistic title="Rejected" value={stats.testSeries.rejected} valueStyle={{ fontSize: 20, color:'#ff4d4f' }} />
                        </Col>
                        <Col span={12}>
                          <Statistic title="Total Questions" value={stats.testSeries.totalQuestions} valueStyle={{ fontSize: 20 }} />
                        </Col>
                        <Col span={12}>
                          <Statistic title="Total Attempts" value={stats.testSeries.totalAttempts} valueStyle={{ fontSize: 20 }} />
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                )}
              </Row>
            </>
          )}

          {/* 
              SECTION 4  BOOKS + JOBS + CONTENT
           */}
          {(hasPermission("Manage Books") || hasPermission("Manage Courses") || hasPermission("Manage Jobs")) && (
            <>
              <div style={{ marginBottom: 8 }}>
                <Text strong style={{ fontSize: 15, color:'#1a1a1a' }}>
                  <ReadOutlined style={{ marginRight: 6, color:'#13c2c2' }} />
                  Content & Jobs
                </Text>
              </div>
              <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                {/* Books */}
                {hasPermission("Manage Books") && (
                  <Col xs={24} sm={12} lg={contentColSpan}>
                    <Card
                      title={
                        <Space>
                          <ReadOutlined style={{ color:'#13c2c2' }} />
                          <Text strong>Books</Text>
                          {stats.books.pending > 0 && (
                            <Badge count={stats.books.pending} style={{ backgroundColor:'#faad14' }} />
                          )}
                        </Space>
                      }
                      style={{ borderRadius: 12, height:'100%' }}
                    >
                      <Row gutter={[12, 12]}>
                        <Col span={12}><Statistic title="Total" value={stats.books.total} valueStyle={{ fontSize: 18 }} /></Col>
                        <Col span={12}><Statistic title="Approved" value={stats.books.approved} valueStyle={{ fontSize: 18, color:'#52c41a' }} /></Col>
                        <Col span={12}><Statistic title="Pending" value={stats.books.pending} valueStyle={{ fontSize: 18, color:'#faad14' }} /></Col>
                        <Col span={12}><Statistic title="Featured" value={stats.books.featured} valueStyle={{ fontSize: 18, color:'#722ed1' }} /></Col>
                        <Col span={12}><Statistic title="Total Sales" value={stats.books.totalSales} valueStyle={{ fontSize: 18 }} /></Col>
                        <Col span={12}><Statistic title="Digital" value={stats.books.digital} valueStyle={{ fontSize: 18 }} /></Col>
                      </Row>
                    </Card>
                  </Col>
                )}

                {/* Course Content */}
                {hasPermission("Manage Courses") && (
                  <Col xs={24} sm={12} lg={contentColSpan}>
                    <Card
                      title={
                        <Space>
                          <FileTextOutlined style={{ color:'#eb2f96' }} />
                          <Text strong>Course Content</Text>
                          {stats.content.pending > 0 && (
                            <Badge count={stats.content.pending} style={{ backgroundColor:'#faad14' }} />
                          )}
                        </Space>
                      }
                      style={{ borderRadius: 12, height:'100%' }}
                    >
                      <Row gutter={[12, 12]}>
                        <Col span={12}><Statistic title="Total" value={stats.content.total} valueStyle={{ fontSize: 18 }} /></Col>
                        <Col span={12}><Statistic title="Approved" value={stats.content.approved} valueStyle={{ fontSize: 18, color:'#52c41a' }} /></Col>
                        <Col span={12}><Statistic title="Pending" value={stats.content.pending} valueStyle={{ fontSize: 18, color:'#faad14' }} /></Col>
                        <Col span={12}><Statistic title="Total Views" value={fmt(stats.content.totalViews)} valueStyle={{ fontSize: 18, color:'#1890ff' }} /></Col>
                      </Row>
                    </Card>
                  </Col>
                )}

                {/* Jobs */}
                {hasPermission("Manage Jobs") && (
                  <Col xs={24} sm={12} lg={contentColSpan}>
                    <Card
                      title={
                        <Space>
                          <CalendarOutlined style={{ color:'#52c41a' }} />
                          <Text strong>Job Posts</Text>
                          {stats.jobs.pending > 0 && (
                            <Badge count={stats.jobs.pending} style={{ backgroundColor:'#faad14' }} />
                          )}
                        </Space>
                      }
                      style={{ borderRadius: 12, height:'100%' }}
                    >
                      <Row gutter={[12, 12]}>
                        <Col span={12}><Statistic title="Total" value={stats.jobs.total} valueStyle={{ fontSize: 18 }} /></Col>
                        <Col span={12}><Statistic title="Approved" value={stats.jobs.approved} valueStyle={{ fontSize: 18, color:'#52c41a' }} /></Col>
                        <Col span={12}><Statistic title="Pending" value={stats.jobs.pending} valueStyle={{ fontSize: 18, color:'#faad14' }} /></Col>
                        <Col span={12}><Statistic title="Active" value={stats.jobs.active} valueStyle={{ fontSize: 18, color:'#1890ff' }} /></Col>
                      </Row>
                    </Card>
                  </Col>
                )}
              </Row>
            </>
          )}

          {/* 
              SECTION 5  APPROVAL STATUS TRACKER
           */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {/* Approval tracker */}
            <Col xs={24}>
              <Card
                title={
                  <Space>
                    <CheckCircleOutlined style={{ color:'#52c41a' }} />
                    <Text strong>Approval Status Tracker</Text>
                  </Space>
                }
                style={{ borderRadius: 12 }}
              >
                {hasPermission("Manage Courses") && (
                  <PendingRow
                    label="Courses"
                    count={stats.courses.pending}
                    total={stats.courses.total}
                    note={stats.courses.pending > 0 ?'Submitted for admin review' : undefined}
                  />
                )}
                {hasPermission("Manage Books") && (
                  <PendingRow
                    label="Books"
                    count={stats.books.pending}
                    total={stats.books.total}
                    note={stats.books.pending > 0 ?'Awaiting admin approval' : undefined}
                  />
                )}
                {hasPermission("Manage Test Series") && (
                  <PendingRow
                    label="Test Series"
                    count={stats.testSeries.pending}
                    total={stats.testSeries.total}
                  />
                )}
                {stats.testSeries.rejected > 0 && hasPermission("Manage Test Series") && (
                  <div style={{ marginBottom: 14 }}>
                    <Tag icon={<CloseCircleOutlined />} color="error">
                      {stats.testSeries.rejected} test series rejected  please review
                    </Tag>
                  </div>
                )}
                {hasPermission("Manage Courses") && (
                  <PendingRow
                    label="Course Content"
                    count={stats.content.pending}
                    total={stats.content.total}
                  />
                )}
                {hasPermission("Manage Jobs") && (
                  <PendingRow
                    label="Job Posts"
                    count={stats.jobs.pending}
                    total={stats.jobs.total}
                  />
                )}

                <Divider style={{ margin:'12px 0' }} />

                {totalPending === 0 ? (
                  <div style={{ textAlign:'center', padding:'8px 0' }}>
                    <CheckCircleOutlined style={{ fontSize: 28, color:'#52c41a' }} />
                    <div style={{ marginTop: 6 }}>
                      <Text strong style={{ color:'#52c41a' }}>All content approved!</Text>
                    </div>
                  </div>
                ) : (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {totalPending} items pending across all categories. Admin reviews typically take 2448h.
                  </Text>
                )}
              </Card>
            </Col>
          </Row>

          {/*  Quick Nav  */}
          {/* <Card style={{ borderRadius: 12, marginBottom: 24 }}>
            <Text strong style={{ fontSize: 15 }}>Quick Navigation</Text>
            <Divider style={{ margin:'12px 0' }} />
            <Row gutter={[8, 8]}>
              {[
                { label:'My Courses', icon: <BookOutlined />, path:'/teacher/courses', color:'#52c41a' },
                { label:'My Books', icon: <ReadOutlined />, path:'/add-books', color:'#13c2c2' },
                { label:'Test Series', icon: <TrophyOutlined />, path:'/teacher/test-series', color:'#faad14' },
                { label:'Exams', icon: <ExperimentOutlined />, path:'/exam-management', color:'#722ed1' },
                { label:'Course Content', icon: <FileTextOutlined />, path:'/manage-course-content', color:'#eb2f96' },
                { label:'Job Posts', icon: <CalendarOutlined />, path:'/jobs-list', color:'#52c41a' },
              ].map((item) => (
                <Col key={item.path} xs={12} sm={8} md={6} lg={4}>
                  <Button
                    block
                    onClick={() => navigate(item.path)}
                    style={{
                      borderRadius: 8,
                      height: 56,
                      display:'flex',
                      flexDirection:'column',
                      alignItems:'center',
                      justifyContent:'center',
                      gap: 4,
                      border: `1px solid ${item.color}30`,
                      color: item.color,
                      fontSize: 11,
                    }}
                    icon={<span style={{ fontSize: 18, color: item.color }}>{item.icon}</span>}
                  >
                    {item.label}
                  </Button>
                </Col>
              ))}
            </Row>
          </Card> */}
        </Content>

        <Footer style={{ textAlign:'center', background:'transparent' }}>
          <b>© 2026 Draa. All Rights Reserved.</b>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default TeacherDashboard;