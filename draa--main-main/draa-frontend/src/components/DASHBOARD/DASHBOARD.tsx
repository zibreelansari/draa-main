import { useEffect, useState, useCallback } from"react";
import {
  Layout,
  Row,
  Col,
  Card,
  message,
  Typography,
  Space,
  Button,
  Spin,
  Tag,
  Table,
  Progress,
  Badge,
  Divider,
  Alert,
} from"antd";
import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  
  StarOutlined,
  SolutionOutlined,
  FileTextOutlined,
  GlobalOutlined,
  TrophyOutlined,
  CalendarOutlined,
  ReadOutlined,
  ExclamationCircleOutlined,
  BankOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  RiseOutlined,
  ShoppingCartOutlined,
  TagOutlined,
  BarChartOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from"@ant-design/icons";
import { getAuthHeaders } from"../../utils/global_auth";
import"./dashboard.css";
import { useNavigate } from"react-router-dom";
import Sidebar from"./Sidebar";
import Topbar from"./Topbar";
import url from"../../url";
import usePageTitle from"../../hooks/usePageTitle";

const { Content, Footer } = Layout;
const { Title, Text } = Typography;

//  Types 

interface DashboardData {
  // Students
  totalStudents: number;
  VerifiedStudents: number;
  pendingStudents: number;
  rejectedStudents: number;

  // Teachers
  totalTeachers: number;
  approvedTeachers: number;
  pendingTeachers: number;
  rejectedTeachers: number;
  suspendedTeachers: number;
  avgTeacherRating: number;

  // Courses
  totalCourses: number;
  approvedCourses: number;
  pendingCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalEnrollments: number;
  totalCourseRevenue: number;

  // Course Content
  totalCourseContent: number;
  approvedContent: number;
  pendingContent: number;
  totalContentViews: number;

  // Test Series
  totalTestSeries: number;
  approvedTestSeries: number;
  pendingTestSeries: number;
  rejectedTestSeries: number;

  // Exams
  totalExams: number;

  // Assignments
  totalAssignments: number;

  // Jobs
  totalJobs: number;
  approvedJobs: number;
  pendingJobs: number;
  activeJobs: number;
  expiredJobs: number;

  // Books
  totalBooks: number;
  approvedBooks: number;
  pendingBooks: number;
  featuredBooks: number;
  popularBooks: number;

  // Payments
  totalRevenue: number;
  monthlyRevenue: number;
  totalTransactions: number;
  successfulTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  avgOrderValue: number;
  successRate: number;

  // Top selling
  topSellingItems: Array<{
    itemId: string;
    name: string;
    type: string;
    totalSales: number;
    totalRevenue: number;
  }>;

  // Recent payments
  recentPayments: Array<{
    id: string;
    customer: { name: string; email: string };
    item: { name: string; type: string };
    financial: { finalAmount: number };
    payment: { status: string; gateway: string };
    status: string;
    purchaseDate: string;
  }>;
}

//  Helper 

const safeFetch = async (endpoint: string): Promise<any> => {
  try {
    const res = await fetch(`${url}${endpoint}`, {
      headers: getAuthHeaders()
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
        : n?.toString() ??"0";

//  StatCard 

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
      border:"1px solid #f0f0f0",
      cursor: onClick ?"pointer" :"default",
      transition:"all 0.2s",
      height:"100%",
    }}
    bodyStyle={{ padding:"20px 24px" }}
  >
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
      <div style={{ flex: 1 }}>
        <Text type="secondary" style={{ fontSize: 12, fontWeight: 500, textTransform:"uppercase", letterSpacing: 0.5 }}>
          {title}
        </Text>
        <div style={{ display:"flex", alignItems:"center", gap: 8, marginTop: 4 }}>
          <Title level={3} style={{ margin: 0, color:"#1a1a1a", lineHeight: 1.2 }}>
            {value}
          </Title>
          {badge !== undefined && badge > 0 && (
            <Badge count={badge} style={{ backgroundColor:"#ff4d4f" }} />
          )}
        </div>
        {(sub1 || sub2) && (
          <div style={{ marginTop: 8, display:"flex", gap: 12, flexWrap:"wrap" }}>
            {sub1 && (
              <Text style={{ fontSize: 11, color: sub1.color ??"#52c41a" }}>
                <CheckCircleOutlined style={{ marginRight: 3 }} />
                {sub1.value} {sub1.label}
              </Text>
            )}
            {sub2 && (
              <Text style={{ fontSize: 11, color: sub2.color ??"#faad14" }}>
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
          display:"flex",
          alignItems:"center",
          justifyContent:"center",
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

//  PendingItem 

const PendingRow = ({
  label,
  count,
  total,
  onReview,
  color ="#faad14",
}: {
  label: string;
  count: number;
  total: number;
  onReview?: () => void;
  color?: string;
}) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ display:"flex", justifyContent:"space-between", marginBottom: 4 }}>
      <Text style={{ fontSize: 13 }}>{label}</Text>
      <Space size={8}>
        <Tag color={count > 0 ?"warning" :"success"} style={{ margin: 0 }}>
          {count} pending
        </Tag>
        {count > 0 && onReview && (
          <Button size="small" type="link" onClick={onReview} style={{ padding: 0, height:"auto" }}>
            Review 
          </Button>
        )}
      </Space>
    </div>
    <Progress
      percent={total > 0 ? Math.round(((total - count) / total) * 100) : 100}
      size="small"
      showInfo={false}
      strokeColor={count > 0 ?"#faad14" :"#52c41a"}
    />
  </div>
);

//  Main Dashboard 

const Dashboard = () => {
  usePageTitle('Admin Dashboard | Draa');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loginUser, setLoginUser] = useState<any>({});
  const [data, setData] = useState<DashboardData>({
    totalStudents: 0,
    VerifiedStudents: 0,
    pendingStudents: 0,
    rejectedStudents: 0,
    totalTeachers: 0,
    approvedTeachers: 0,
    pendingTeachers: 0,
    rejectedTeachers: 0,
    suspendedTeachers: 0,
    avgTeacherRating: 0,
    totalCourses: 0,
    approvedCourses: 0,
    pendingCourses: 0,
    publishedCourses: 0,
    draftCourses: 0,
    totalEnrollments: 0,
    totalCourseRevenue: 0,
    totalCourseContent: 0,
    approvedContent: 0,
    pendingContent: 0,
    totalContentViews: 0,
    totalTestSeries: 0,
    approvedTestSeries: 0,
    pendingTestSeries: 0,
    rejectedTestSeries: 0,
    totalExams: 0,
    totalAssignments: 0,
    totalJobs: 0,
    approvedJobs: 0,
    pendingJobs: 0,
    activeJobs: 0,
    expiredJobs: 0,
    totalBooks: 0,
    approvedBooks: 0,
    pendingBooks: 0,
    featuredBooks: 0,
    popularBooks: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalTransactions: 0,
    successfulTransactions: 0,
    pendingTransactions: 0,
    failedTransactions: 0,
    avgOrderValue: 0,
    successRate: 0,
    topSellingItems: [],
    recentPayments: [],
  });

  useEffect(() => {
    const raw = localStorage.getItem("edudocs");
    if (!raw) {
      navigate("/admin-login", { replace: true });
      return;
    }
    try {
      const user = JSON.parse(raw);
      // Block non-admins from admin dashboard
      if (!user.aname && !user.A_email && !user.A_name && user.role !=='admin') {
        message.error("Access Denied: Admin privileges required");
        navigate("/admin-login", { replace: true });
        return;
      }
      setLoginUser(user);
    } catch {
      navigate("/admin-login", { replace: true });
    }
  }, [navigate]);

  const loadAll = useCallback(async () => {
    const next: Partial<DashboardData> = {};

    //  1. Students 
    const stuRes = await safeFetch("/count/getAllStudents");
    if (stuRes) {
      next.totalStudents = stuRes.userCount ?? stuRes.Users?.length ?? 0;
      const users: any[] = stuRes.Users ?? [];
      next.VerifiedStudents = users.filter(
        (u) => u.status ==="approved" || u.Status ==="Verified" || u.Status ==="approved"
      ).length;
      next.pendingStudents = users.filter(
        (u) => u.status ==="pending" || (!u.status && u.Status !=="Verified" && u.Status !=="approved" && u.Status !=="rejected")
      ).length;
      next.rejectedStudents = users.filter(
        (u) => u.status ==="rejected" || u.Status ==="rejected"
      ).length;
    }

    //  2. Teachers 
    // First try detailed endpoint
    const teacherDetailRes = await safeFetch("/updateTeacherStatus/all");
    if (teacherDetailRes?.success && teacherDetailRes.data?.teachers?.length) {
      const teachers: any[] = teacherDetailRes.data.teachers;
      next.totalTeachers = teachers.length;
      next.approvedTeachers = teachers.filter((t) => t.Status ==="approved").length;
      next.pendingTeachers = teachers.filter((t) => t.Status ==="pending").length;
      next.rejectedTeachers = teachers.filter((t) => t.Status ==="rejected").length;
      next.suspendedTeachers = teachers.filter((t) => t.Status ==="suspended").length;
      const ratings = teachers.filter((t) => t.trating).map((t) => t.trating);
      next.avgTeacherRating = ratings.length
        ? parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1))
        : 0;
    } else {
      // Fallback to count endpoint + stats
      const tcCountRes = await safeFetch("/count/getAllTeachers");
      next.totalTeachers = tcCountRes?.teacherCount ?? 0;
      const tcStatsRes = await safeFetch("/teacher/stats/overview");
      if (tcStatsRes?.success && tcStatsRes.stats) {
        const s = tcStatsRes.stats;
        next.approvedTeachers = s.approved ?? 0;
        next.pendingTeachers = s.pending ?? 0;
        next.rejectedTeachers = s.rejected ?? 0;
        next.avgTeacherRating = s.avgRating ?? 0;
      }
    }

    //  3. Courses 
    const courseRes = await safeFetch("/admin/courses");
    if (courseRes) {
      const courses: any[] =
        courseRes.data?.courses ?? courseRes.courses ?? [];
      next.totalCourses = courses.length;
      next.approvedCourses = courses.filter((c) => c.isApproved).length;
      next.pendingCourses = courses.filter((c) => !c.isApproved).length;
      next.publishedCourses = courses.filter((c) => c.status ==="published").length;
      next.draftCourses = courses.filter((c) => c.status ==="draft").length;
      next.totalEnrollments = courses.reduce((acc, c) => acc + (c.enrollmentCount ?? 0), 0);
      // Try stats endpoint for revenue
      const cStatsRes = await safeFetch("/admin/courses/stats");
      if (cStatsRes?.success && cStatsRes.stats) {
        const s = cStatsRes.stats.overview ?? cStatsRes.stats;
        next.totalCourseRevenue = s.totalRevenue ?? 0;
        // override with more accurate numbers if available
        if (s.totalEnrollments) next.totalEnrollments = s.totalEnrollments;
      }
    } else {
      // Fallback
      const cFallbackRes = await safeFetch("/course/admin/courses");
      if (cFallbackRes) {
        const courses: any[] =
          cFallbackRes.data?.courses ?? cFallbackRes.courses ?? [];
        next.totalCourses = courses.length;
        next.approvedCourses = courses.filter((c) => c.isApproved).length;
        next.pendingCourses = courses.filter((c) => !c.isApproved).length;
        next.publishedCourses = courses.filter((c) => c.status ==="published").length;
        next.draftCourses = courses.filter((c) => c.status ==="draft").length;
        next.totalEnrollments = courses.reduce((acc, c) => acc + (c.enrollmentCount ?? 0), 0);
      }
    }

    //  4. Course Content 
    const contentRes = await safeFetch("/course/allCourseContent");
    if (contentRes?.result) {
      const content: any[] = contentRes.result;
      next.totalCourseContent = content.length;
      next.approvedContent = content.filter((c) => c.approved).length;
      next.pendingContent = content.filter((c) => !c.approved).length;
      next.totalContentViews = content.reduce((acc, c) => acc + (c.views ?? 0), 0);
    }

    //  5. Test Series 
    const testRes = await safeFetch("/test-series/admin/pending");
    if (testRes?.data?.testSeries) {
      const tests: any[] = testRes.data.testSeries;
      next.totalTestSeries = tests.length;
      next.approvedTestSeries = tests.filter((t) => t.status ==="approved").length;
      next.pendingTestSeries = tests.filter((t) => t.status ==="pending").length;
      next.rejectedTestSeries = tests.filter((t) => t.status ==="rejected").length;
    }

    //  6. Exams 
    const examRes = await safeFetch("/exam/admin");
    if (examRes) {
      const exams = examRes.exams ?? [];
      next.totalExams = Array.isArray(exams) ? exams.length : 1;
    }

    //  7. Assignments 
    const assignRes = await safeFetch("/assignmments/admin/assignments");
    if (assignRes?.assignments) {
      next.totalAssignments = assignRes.assignments.length;
    }

    //  8. Jobs 
    const jobStatsRes = await safeFetch("/jobs/stats/overview");
    if (jobStatsRes?.stats) {
      const s = jobStatsRes.stats;
      next.totalJobs = s.total ?? 0;
      next.approvedJobs = s.approved ?? 0;
      next.pendingJobs = s.pending ?? 0;
      next.activeJobs = s.active ?? 0;
      next.expiredJobs = s.expired ?? 0;
    } else {
      // Fallback to listing
      const jobsRes = await safeFetch("/jobs");
      const jobs: any[] = jobsRes?.jobs ?? jobsRes?.data?.jobs ?? (Array.isArray(jobsRes) ? jobsRes : []);
      next.totalJobs = jobs.length;
      next.approvedJobs = jobs.filter((j) => j.isApproved).length;
      next.pendingJobs = jobs.filter((j) => !j.isApproved).length;
      next.activeJobs = jobs.filter((j) => j.status ==="Active").length;
      next.expiredJobs = jobs.filter((j) => j.status ==="Expired").length;
    }

    //  9. Books 
    const bookStatsRes = await safeFetch("/books/stats/overview");
    if (bookStatsRes?.stats) {
      const s = bookStatsRes.stats;
      next.totalBooks = s.total ?? 0;
      next.approvedBooks = s.approved ?? 0;
      next.pendingBooks = s.pending ?? 0;
      next.featuredBooks = s.featured ?? 0;
      next.popularBooks = s.popular ?? 0;
    } else {
      const booksRes = await safeFetch("/books/all");
      const books: any[] = booksRes?.books ?? [];
      next.totalBooks = books.length;
      next.approvedBooks = books.filter((b) => b.isApproved).length;
      next.pendingBooks = books.filter((b) => !b.isApproved).length;
      next.featuredBooks = books.filter((b) => b.isFeatured).length;
      next.popularBooks = books.filter((b) => b.isPopular).length;
    }

    //  10. Payments 
    const payStatsRes = await safeFetch("/admin/payments/dashboard/stats");
    if (payStatsRes?.success && payStatsRes.data?.overview) {
      const o = payStatsRes.data.overview;
      next.totalRevenue = o.totalRevenue ?? 0;
      next.monthlyRevenue = o.monthlyRevenue ?? 0;
      next.totalTransactions = o.totalTransactions ?? 0;
      next.successfulTransactions = o.successfulTransactions ?? 0;
      next.pendingTransactions = o.pendingTransactions ?? 0;
      next.failedTransactions = o.failedTransactions ?? 0;
      next.avgOrderValue = o.avgOrderValue ?? 0;
      next.successRate = o.successRate ?? 0;
    }

    const topRes = await safeFetch("/admin/payments/top-selling?limit=5");
    if (topRes?.success && topRes.data) {
      next.topSellingItems = topRes.data.slice(0, 5);
    }

    const recentRes = await safeFetch("/admin/payments/payments?page=1&limit=5");
    if (recentRes?.success && recentRes.data?.payments) {
      next.recentPayments = recentRes.data.payments;
    }

    setData((prev) => ({ ...prev, ...next }));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      await loadAll();
      message.success("Dashboard refreshed");
    } catch (e) {
      message.error("Some data failed to load");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loadAll]);

  useEffect(() => {
    if (loginUser?.aname) load();
  }, [loginUser?.aname, load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
  };

  //  Pending totals (for alert banner)
  const totalPending =
    data.pendingTeachers +
    data.pendingCourses +
    data.pendingStudents +
    data.pendingTestSeries +
    data.pendingContent +
    data.pendingBooks +
    data.pendingJobs;

  const recentPaymentColumns = [
    {
      title:"Customer",
      key:"customer",
      render: (r: any) => (
        <div>
          <Text strong style={{ fontSize: 12 }}>{r.customer?.name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>{r.customer?.email}</Text>
        </div>
      ),
    },
    {
      title:"Item",
      key:"item",
      render: (r: any) => (
        <Text style={{ fontSize: 12 }}>{r.item?.name ??""}</Text>
      ),
    },
    {
      title:"Amount",
      key:"amount",
      render: (r: any) => (
        <Text strong style={{ color:"#52c41a", fontSize: 12 }}>
          {(r.financial?.finalAmount ?? 0).toLocaleString("en-IN")}
        </Text>
      ),
    },
    {
      title:"Status",
      key:"status",
      render: (r: any) => {
        const s = r.payment?.status ?? r.status ??"unknown";
        const colorMap: Record<string, string> = {
          paid:"success",
          completed:"success",
          pending:"warning",
          failed:"error",
          refunded:"orange",
        };
        return <Tag color={colorMap[s] ??"default"}>{s.toUpperCase()}</Tag>;
      },
    },
  ];

  const topSellingColumns = [
    {
      title:"Item",
      key:"item",
      render: (r: any) => (
        <div>
          <Text strong style={{ fontSize: 12 }}>{r.name}</Text>
          <br />
          <Tag color="blue" style={{ fontSize: 10 }}>{r.type}</Tag>
        </div>
      ),
    },
    {
      title:"Sales",
      dataIndex:"totalSales",
      key:"sales",
      render: (v: number) => <Text strong>{v}</Text>,
    },
    {
      title:"Revenue",
      dataIndex:"totalRevenue",
      key:"revenue",
      render: (v: number) => (
        <Text strong style={{ color:"#52c41a" }}>
          {fmt(v)}
        </Text>
      ),
    },
  ];

  if (loading) {
    return (
      <Layout style={{ minHeight:"100vh" }}>
        <Sidebar />
        <Layout>
          <Topbar />
          <Content
            style={{
              display:"flex",
              justifyContent:"center",
              alignItems:"center",
              minHeight:"80vh",
            }}
          >
            <div style={{ textAlign:"center" }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>
                <Text type="secondary">Loading dashboard data from all systems...</Text>
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight:"100vh" }}>
      <Sidebar />
      <Layout>
        <Topbar />
        <Content style={{ margin:"16px", padding:"0 8px" }}>

          {/*  Header  */}
          <div
            style={{
              background:"linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
              borderRadius: 16,
              padding:"28px 32px",
              marginBottom: 24,
              display:"flex",
              justifyContent:"space-between",
              alignItems:"center",
              flexWrap:"wrap",
              gap: 16,
            }}
          >
            <div>
              <Title level={2} style={{ color:"#fff", margin: 0 }}>
                Welcome back, {loginUser.aname ??"Admin"} 
              </Title>
              <Text style={{ color:"rgba(255,255,255,0.6)", fontSize: 14 }}>
                Here's your complete platform overview  all systems loaded
              </Text>
            </div>
            <Button
              icon={<ReloadOutlined spin={refreshing} />}
              loading={refreshing}
              onClick={handleRefresh}
              style={{
                background:"rgba(255,255,255,0.12)",
                color:"#fff",
                border:"1px solid rgba(255,255,255,0.25)",
                borderRadius: 8,
              }}
            >
              Refresh All
            </Button>
          </div>

          {/*  Pending Alert  */}
          {totalPending > 0 && (
            <Alert
              icon={<ExclamationCircleOutlined />}
              message={
                <Text strong>
                  {totalPending} item{totalPending > 1 ?"s" :""} require your attention across the platform
                </Text>
              }
              description={`Teachers: ${data.pendingTeachers} · Courses: ${data.pendingCourses} · Students: ${data.pendingStudents} · Test Series: ${data.pendingTestSeries} · Content: ${data.pendingContent} · Books: ${data.pendingBooks} · Jobs: ${data.pendingJobs}`}
              type="warning"
              showIcon
              style={{ marginBottom: 24, borderRadius: 10 }}
            />
          )}

          {/* 
              SECTION 1  REVENUE & TRANSACTIONS
           */}
          <div style={{ marginBottom: 8 }}>
            <Text strong style={{ fontSize: 16, color:"#1a1a1a" }}>
              <DollarOutlined style={{ marginRight: 6, color:"#52c41a" }} />
              Revenue & Payments
            </Text>
          </div>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Total Revenue"
                value={`${fmt(data.totalRevenue)}`}
                icon={<DollarOutlined />}
                color="#52c41a"
                sub1={{ label:"this month", value: `${fmt(data.monthlyRevenue)}`, color:"#52c41a" }}
                onClick={() => navigate("/admin/manage-all-payments")}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Total Transactions"
                value={data.totalTransactions}
                icon={<ShoppingCartOutlined />}
                color="#1890ff"
                sub1={{ label:"successful", value: data.successfulTransactions, color:"#52c41a" }}
                sub2={{ label:"pending", value: data.pendingTransactions, color:"#faad14" }}
                onClick={() => navigate("/admin/manage-all-payments")}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ borderRadius: 12, border:"1px solid #f0f0f0", height:"100%" }} bodyStyle={{ padding:"20px 24px" }}>
                <Text type="secondary" style={{ fontSize: 12, fontWeight: 500, textTransform:"uppercase" }}>
                  Success Rate
                </Text>
                <Title level={3} style={{ margin:"4px 0 8px" }}>
                  {data.successRate?.toFixed(1) ?? 0}%
                </Title>
                <Progress
                  percent={data.successRate ?? 0}
                  size="small"
                  strokeColor="#52c41a"
                  showInfo={false}
                />
                <div style={{ marginTop: 8 }}>
                  <Text style={{ fontSize: 11, color:"#ff4d4f" }}>
                    {data.failedTransactions} failed transactions
                  </Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Avg Order Value"
                value={`${fmt(data.avgOrderValue)}`}
                icon={<BarChartOutlined />}
                color="#722ed1"
              />
            </Col>
          </Row>

          {/* 
              SECTION 2  USERS
           */}
          <div style={{ marginBottom: 8 }}>
            <Text strong style={{ fontSize: 16, color:"#1a1a1a" }}>
              <TeamOutlined style={{ marginRight: 6, color:"#1890ff" }} />
              Users
            </Text>
          </div>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Total Students"
                value={data.totalStudents}
                icon={<UserOutlined />}
                color="#1890ff"
                sub1={{ label:"Verified", value: data.VerifiedStudents }}
                sub2={{ label:"pending", value: data.pendingStudents }}
                badge={data.pendingStudents}
                onClick={() => navigate("/manage-students")}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Total Teachers"
                value={data.totalTeachers}
                icon={<TeamOutlined />}
                color="#52c41a"
                sub1={{ label:"approved", value: data.approvedTeachers }}
                sub2={{ label:"pending", value: data.pendingTeachers }}
                badge={data.pendingTeachers}
                onClick={() => navigate("/manage-teachers")}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ borderRadius: 12, border:"1px solid #f0f0f0", height:"100%" }} bodyStyle={{ padding:"20px 24px" }}>
                <Text type="secondary" style={{ fontSize: 12, fontWeight: 500, textTransform:"uppercase" }}>
                  Teacher Status Breakdown
                </Text>
                <div style={{ marginTop: 12 }}>
                  {[
                    { label:"Approved", value: data.approvedTeachers, color:"#52c41a" },
                    { label:"Pending", value: data.pendingTeachers, color:"#faad14" },
                    { label:"Rejected", value: data.rejectedTeachers, color:"#ff4d4f" },
                    { label:"Suspended", value: data.suspendedTeachers, color:"#d9d9d9" },
                  ].map((item) => (
                    <div key={item.label} style={{ display:"flex", justifyContent:"space-between", marginBottom: 6 }}>
                      <Text style={{ fontSize: 12 }}>{item.label}</Text>
                      <Tag color={item.color ==="#52c41a" ?"success" : item.color ==="#faad14" ?"warning" : item.color ==="#ff4d4f" ?"error" :"default"} style={{ margin: 0, fontSize: 11 }}>
                        {item.value}
                      </Tag>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Avg Teacher Rating"
                value={`${data.avgTeacherRating}/5.0`}
                icon={<StarOutlined />}
                color="#faad14"
              />
            </Col>
          </Row>

          {/* 
              SECTION 3  COURSES & CONTENT
           */}
          <div style={{ marginBottom: 8 }}>
            <Text strong style={{ fontSize: 16, color:"#1a1a1a" }}>
              <BookOutlined style={{ marginRight: 6, color:"#722ed1" }} />
              Courses & Content
            </Text>
          </div>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Total Courses"
                value={data.totalCourses}
                icon={<BookOutlined />}
                color="#722ed1"
                sub1={{ label:"approved", value: data.approvedCourses }}
                sub2={{ label:"pending", value: data.pendingCourses }}
                badge={data.pendingCourses}
                onClick={() => navigate("/admin/manage-courses")}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Total Enrollments"
                value={data.totalEnrollments}
                icon={<SolutionOutlined />}
                color="#eb2f96"
                sub1={{ label:"published courses", value: data.publishedCourses }}
                sub2={{ label:"drafts", value: data.draftCourses, color:"#aaaaaa" }}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Course Content"
                value={data.totalCourseContent}
                icon={<FileTextOutlined />}
                color="#13c2c2"
                sub1={{ label:"approved", value: data.approvedContent }}
                sub2={{ label:"pending", value: data.pendingContent }}
                badge={data.pendingContent}
                onClick={() => navigate("/manage-courses-content")}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Content Views"
                value={fmt(data.totalContentViews)}
                icon={<GlobalOutlined />}
                color="#1890ff"
              />
            </Col>
          </Row>

          {/* 
              SECTION 4  EXAMS, TESTS, ASSIGNMENTS
           */}
          <div style={{ marginBottom: 8 }}>
            <Text strong style={{ fontSize: 16, color:"#1a1a1a" }}>
              <TrophyOutlined style={{ marginRight: 6, color:"#faad14" }} />
              Assessments
            </Text>
          </div>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={8}>
              <StatCard
                title="Test Series"
                value={data.totalTestSeries}
                icon={<TrophyOutlined />}
                color="#faad14"
                sub1={{ label:"approved", value: data.approvedTestSeries }}
                sub2={{ label:"pending review", value: data.pendingTestSeries }}
                badge={data.pendingTestSeries}
                onClick={() => navigate("/admin/manage-test-series")}
              />
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <StatCard
                title="Total Exams"
                value={data.totalExams}
                icon={<FileTextOutlined />}
                color="#f5222d"
                onClick={() => navigate("/admin/manage-exams")}
              />
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <StatCard
                title="Assignments"
                value={data.totalAssignments}
                icon={<CalendarOutlined />}
                color="#eb2f96"
                onClick={() => navigate("/admin/manage-assignments")}
              />
            </Col>
          </Row>

          {/* 
              SECTION 5  JOBS & BOOKS
           */}
          <div style={{ marginBottom: 8 }}>
            <Text strong style={{ fontSize: 16, color:"#1a1a1a" }}>
              <ReadOutlined style={{ marginRight: 6, color:"#52c41a" }} />
              Jobs & Books
            </Text>
          </div>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Total Jobs"
                value={data.totalJobs}
                icon={<SolutionOutlined />}
                color="#52c41a"
                sub1={{ label:"active", value: data.activeJobs }}
                sub2={{ label:"pending", value: data.pendingJobs }}
                badge={data.pendingJobs}
                onClick={() => navigate("/jobs")}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ borderRadius: 12, border:"1px solid #f0f0f0", height:"100%" }} bodyStyle={{ padding:"20px 24px" }}>
                <Text type="secondary" style={{ fontSize: 12, fontWeight: 500, textTransform:"uppercase" }}>
                  Job Breakdown
                </Text>
                <div style={{ marginTop: 10 }}>
                  {[
                    { label:"Approved", value: data.approvedJobs, color:"success" as const },
                    { label:"Pending", value: data.pendingJobs, color:"warning" as const },
                    { label:"Active", value: data.activeJobs, color:"processing" as const },
                    { label:"Expired", value: data.expiredJobs, color:"error" as const },
                  ].map((item) => (
                    <div key={item.label} style={{ display:"flex", justifyContent:"space-between", marginBottom: 6 }}>
                      <Text style={{ fontSize: 12 }}>{item.label}</Text>
                      <Tag color={item.color} style={{ margin: 0, fontSize: 11 }}>{item.value}</Tag>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Total Books"
                value={data.totalBooks}
                icon={<ReadOutlined />}
                color="#13c2c2"
                sub1={{ label:"approved", value: data.approvedBooks }}
                sub2={{ label:"pending", value: data.pendingBooks }}
                badge={data.pendingBooks}
                onClick={() => navigate("/books")}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ borderRadius: 12, border:"1px solid #f0f0f0", height:"100%" }} bodyStyle={{ padding:"20px 24px" }}>
                <Text type="secondary" style={{ fontSize: 12, fontWeight: 500, textTransform:"uppercase" }}>
                  Books Highlights
                </Text>
                <div style={{ marginTop: 10 }}>
                  {[
                    { label:"Approved", value: data.approvedBooks, color:"success" as const },
                    { label:"Pending", value: data.pendingBooks, color:"warning" as const },
                    { label:"Featured", value: data.featuredBooks, color:"purple" as const },
                    { label:"Popular", value: data.popularBooks, color:"gold" as const },
                  ].map((item) => (
                    <div key={item.label} style={{ display:"flex", justifyContent:"space-between", marginBottom: 6 }}>
                      <Text style={{ fontSize: 12 }}>{item.label}</Text>
                      <Tag color={item.color} style={{ margin: 0, fontSize: 11 }}>{item.value}</Tag>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
          </Row>

          {/* 
              SECTION 6  PENDING ACTIONS + TOP SELLING + RECENT PAYMENTS
           */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {/* Pending Actions Panel */}
            <Col xs={24} lg={8}>
              <Card
                title={
                  <Space>
                    <ExclamationCircleOutlined style={{ color:"#faad14" }} />
                    <Text strong>Pending Actions</Text>
                    {totalPending > 0 && (
                      <Badge count={totalPending} style={{ backgroundColor:"#ff4d4f" }} />
                    )}
                  </Space>
                }
                style={{ borderRadius: 12, height:"100%" }}
                bodyStyle={{ paddingTop: 16 }}
              >
                <PendingRow
                  label="Teacher Approvals"
                  count={data.pendingTeachers}
                  total={data.totalTeachers}
                  onReview={() => navigate("/manage-teachers")}
                />
                <PendingRow
                  label="Course Approvals"
                  count={data.pendingCourses}
                  total={data.totalCourses}
                  onReview={() => navigate("/admin/manage-courses")}
                />
                <PendingRow
                  label="Student Verifications"
                  count={data.pendingStudents}
                  total={data.totalStudents}
                  onReview={() => navigate("/manage-students")}
                />
                <PendingRow
                  label="Test Series Reviews"
                  count={data.pendingTestSeries}
                  total={data.totalTestSeries}
                  onReview={() => navigate("/admin/manage-test-series")}
                />
                <PendingRow
                  label="Content Approvals"
                  count={data.pendingContent}
                  total={data.totalCourseContent}
                  onReview={() => navigate("/manage-courses-content")}
                />
                <PendingRow
                  label="Book Approvals"
                  count={data.pendingBooks}
                  total={data.totalBooks}
                  onReview={() => navigate("/books")}
                />
                <PendingRow
                  label="Job Approvals"
                  count={data.pendingJobs}
                  total={data.totalJobs}
                  onReview={() => navigate("/jobs")}
                />
              </Card>
            </Col>

            {/* Top Selling Items */}
            <Col xs={24} lg={8}>
              <Card
                title={
                  <Space>
                    <TrophyOutlined style={{ color:"#faad14" }} />
                    <Text strong>Top Selling Items</Text>
                  </Space>
                }
                extra={
                  <Button type="link" size="small" onClick={() => navigate("/admin/manage-all-payments")}>
                    View All
                  </Button>
                }
                style={{ borderRadius: 12, height:"100%" }}
              >
                {data.topSellingItems.length > 0 ? (
                  <Table
                    dataSource={data.topSellingItems}
                    columns={topSellingColumns}
                    pagination={false}
                    size="small"
                    rowKey="itemId"
                  />
                ) : (
                  <div style={{ textAlign:"center", padding:"32px 0", color:"#999" }}>
                    <TrophyOutlined style={{ fontSize: 32, opacity: 0.3 }} />
                    <div style={{ marginTop: 8 }}>No sales data available</div>
                  </div>
                )}
              </Card>
            </Col>

            {/* Recent Payments */}
            <Col xs={24} lg={8}>
              <Card
                title={
                  <Space>
                    <BankOutlined style={{ color:"#52c41a" }} />
                    <Text strong>Recent Transactions</Text>
                  </Space>
                }
                extra={
                  <Button type="link" size="small" onClick={() => navigate("/admin/manage-all-payments")}>
                    View All
                  </Button>
                }
                style={{ borderRadius: 12, height:"100%" }}
              >
                {data.recentPayments.length > 0 ? (
                  <Table
                    dataSource={data.recentPayments}
                    columns={recentPaymentColumns}
                    pagination={false}
                    size="small"
                    rowKey="id"
                  />
                ) : (
                  <div style={{ textAlign:"center", padding:"32px 0", color:"#999" }}>
                    <BankOutlined style={{ fontSize: 32, opacity: 0.3 }} />
                    <div style={{ marginTop: 8 }}>No recent transactions</div>
                  </div>
                )}
              </Card>
            </Col>
          </Row>

          {/* 
              SECTION 7  QUICK ACTIONS
           */}
          <Card style={{ borderRadius: 12, marginBottom: 24 }}>
            <Text strong style={{ fontSize: 15 }}>Quick Navigation</Text>
            <Divider style={{ margin:"12px 0" }} />
            <Row gutter={[8, 8]}>
              {[
                { label:"Students", icon: <UserOutlined />, path:"/manage-students", color:"#1890ff" },
                { label:"Teachers", icon: <TeamOutlined />, path:"/manage-teachers", color:"#52c41a" },
                { label:"Courses", icon: <BookOutlined />, path:"/admin/manage-courses", color:"#722ed1" },
                { label:"Test Series", icon: <TrophyOutlined />, path:"/admin/manage-test-series", color:"#faad14" },
                { label:"Course Content", icon: <FileTextOutlined />, path:"/manage-courses-content", color:"#13c2c2" },
                { label:"Assignments", icon: <CalendarOutlined />, path:"/admin/manage-assignments", color:"#eb2f96" },
                { label:"Exams", icon: <CheckCircleOutlined />, path:"/admin/manage-exams", color:"#f5222d" },
                { label:"Jobs", icon: <SolutionOutlined />, path:"/jobs", color:"#52c41a" },
                { label:"Books", icon: <ReadOutlined />, path:"/books", color:"#13c2c2" },
                { label:"Payments", icon: <DollarOutlined />, path:"/admin/manage-all-payments", color:"#52c41a" },
              ].map((item) => (
                <Col key={item.path} xs={12} sm={8} md={6} lg={4} xl={4}>
                  <Button
                    block
                    onClick={() => navigate(item.path)}
                    style={{
                      borderRadius: 8,
                      height: 56,
                      display:"flex",
                      flexDirection:"column",
                      alignItems:"center",
                      justifyContent:"center",
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
          </Card>
        </Content>

        <Footer style={{ textAlign:"center", background:"transparent" }}>
          <Text type="secondary">
            <b>© 2026 Draa Admin Panel. All Rights Reserved.</b>
          </Text>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default Dashboard;