import React, { useEffect, useState, useCallback, useMemo } from"react";
import {
  Layout, Row, Col, Card, Typography, Table, Tag, Button, Space,
  message, Modal, Form, Input, Popconfirm, Alert, Tabs, Badge,
  Tooltip, Divider, Progress, Switch, Drawer, Descriptions, Select,
  InputNumber,
} from"antd";
import {
  CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined,
  EyeOutlined, BookOutlined, DashboardOutlined, FileTextOutlined,
  ReloadOutlined, TrophyOutlined, TeamOutlined, FireOutlined,
  EditOutlined, DeleteOutlined, SearchOutlined, FilterOutlined,
  ExportOutlined, StarOutlined, LockOutlined, UnlockOutlined,
  BarChartOutlined, BankOutlined, UserOutlined, CopyOutlined,
  GlobalOutlined,
} from"@ant-design/icons";
import axios from"axios";
import dayjs from"dayjs";
import relativeTime from"dayjs/plugin/relativeTime";
import url from"../../url";
import Sidebar from"./Sidebar";
import Topbar from"./Topbar";
import usePageTitle from '../../hooks/usePageTitle';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { Content, Footer } = Layout;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Option } = Select;

//  Types 

interface ExaminationCategory { _id: string; name: string; code: string; year: number; }
interface Subject            { _id?: string; name?: string; code?: string; }
interface TopicCategory      { _id?: string; name?: string; code?: string; }

interface TestSeries {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  subCategory?: string;
  examinationCategory?: ExaminationCategory;
  subject?: Subject;
  topicCategory?: TopicCategory;
  seriesNumber?: number;
  testType?: string;
  createdBy: { _id: string; name?: string; tname?: string; email?: string } | string;
  questions: Array<{
    _id?: string;
    questionText: string;
    options: Array<{ text: string; isCorrect: boolean }>;
    marks: number;
    negativeMarks: number;
    difficulty?: string;
    explanation?: string;
  }>;
  duration: number;
  totalMarks?: number;
  maxAttempts: number;
  status:"draft" |"pending" |"approved" |"rejected";
  isPaid?: boolean;
  price?: number;
  difficulty:"beginner" |"intermediate" |"advanced" |"mixed";
  rejectionReason?: string;
  isFeatured?: boolean;
  adminNotes?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

interface DashboardStats {
  total: number; approved: number; pending: number; rejected: number; draft: number;
}

interface LoginUser { _id?: string; aname?: string; aemail?: string; }

//  StatCard 

const StatCard = ({
  title, value, icon, color, gradient, sub,
}: {
  title: string; value: number; icon: React.ReactNode; color: string;
  gradient?: string; sub?: string;
}) => (
  <Card
    bordered={false}
    style={{
      borderRadius: 12, height:"100%",
      background: gradient ?? `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
    }}
    bodyStyle={{ padding:"20px 24px" }}
  >
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
      <div>
        <Text style={{ color:"rgba(255,255,255,0.85)", fontSize: 12, fontWeight: 600, textTransform:"uppercase", letterSpacing: 0.5 }}>
          {title}
        </Text>
        <Title level={2} style={{ color:"#fff", margin:"4px 0 0", lineHeight: 1.1 }}>{value}</Title>
        {sub && <Text style={{ color:"rgba(255,255,255,0.7)", fontSize: 11 }}>{sub}</Text>}
      </div>
      <div style={{
        width: 48, height: 48, borderRadius: 12, background:"rgba(255,255,255,0.2)",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize: 22, color:"#fff",
      }}>{icon}</div>
    </div>
  </Card>
);

//  Helpers 

const statusColor = (s: string) =>
  ({ approved:"green", pending:"orange", rejected:"red", draft:"blue" }[s] ??"default");

const difficultyColor = (d: string) =>
  ({ beginner:"cyan", intermediate:"orange", advanced:"red", mixed:"purple" }[d] ??"default");

const creatorName = (createdBy: TestSeries["createdBy"]) =>
  typeof createdBy ==="object"
    ? (createdBy.tname || createdBy.name ||"Unknown")
    : createdBy ??"Unknown";

const creatorEmail = (createdBy: TestSeries["createdBy"]) =>
  typeof createdBy ==="object" ? createdBy.email ??"" :"";

//  Main Component 

const AdminTestSeriesDashboard: React.FC = () => {
  usePageTitle('Test Series | Admin');
  // Auth
  const [loginUser, setLoginUser] = useState<LoginUser | null>(null);

  // Data
  const [allTestSeries, setAllTestSeries] = useState<TestSeries[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ total: 0, approved: 0, pending: 0, rejected: 0, draft: 0 });
  const [loading, setLoading] = useState(false);

  // Modal / Drawer
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [viewingTest, setViewingTest] = useState<TestSeries | null>(null);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectingTestId, setRejectingTestId] = useState<string | null>(null);
  const [notesModal, setNotesModal] = useState(false);
  const [notesTestId, setNotesTestId] = useState<string | null>(null);

  // Forms
  const [rejectForm] = Form.useForm();
  const [notesForm] = Form.useForm();

  // Filters & Pagination
  const [activeTab, setActiveTab] = useState("pending");
  const [searchText, setSearchText] = useState("");
  const [diffFilter, setDiffFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  //  Auth 
  useEffect(() => {
    const raw = localStorage.getItem("edudocs");
    if (!raw) return;
    try {
      const user = JSON.parse(raw);
      setLoginUser(user);
    } catch { /* ignore */ }
  }, []);

  //  Fetch 
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${url}/test-series/admin/all`);
      const list: TestSeries[] = res.data.data?.testSeries ?? [];
      setAllTestSeries(list);
      setStats({
        total:    list.length,
        approved: list.filter(t => t.status ==="approved").length,
        pending:  list.filter(t => t.status ==="pending").length,
        rejected: list.filter(t => t.status ==="rejected").length,
        draft:    list.filter(t => t.status ==="draft").length,
      });
    } catch { message.error("Failed to load test series data"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  //  Filtered data 
  const filteredData = useMemo(() => {
    let list = allTestSeries;
    // Tab filter
    if (activeTab !=="all") list = list.filter(t => t.status === activeTab);
    // Search
    if (searchText) {
      const q = searchText.toLowerCase();
      list = list.filter(t =>
        t.title.toLowerCase().includes(q) ||
        creatorName(t.createdBy).toLowerCase().includes(q) ||
        (t.category ??"").toLowerCase().includes(q)
      );
    }
    if (diffFilter !=="all") list = list.filter(t => t.difficulty === diffFilter);
    if (typeFilter !=="all") list = list.filter(t => (t.isPaid ?"paid" :"free") === typeFilter);
    return list;
  }, [allTestSeries, activeTab, searchText, diffFilter, typeFilter]);

  const pendingList   = useMemo(() => allTestSeries.filter(t => t.status ==="pending"), [allTestSeries]);
  const isFiltered    = !!(searchText || diffFilter !=="all" || typeFilter !=="all");

  //  CRUD 
  const handleApprove = async (id: string) => {
    try {
      await axios.put(`${url}/test-series/update/${id}/status`, { status:"approved" });
      message.success("Test series approved!");
      fetchAll();
    } catch { message.error("Failed to approve"); }
  };

  const handleReject = async (values: { reason: string }) => {
    if (!rejectingTestId) return;
    try {
      await axios.put(`${url}/test-series/${rejectingTestId}/status`, {
        status:"rejected", rejectionReason: values.reason,
      });
      message.success("Test series rejected.");
      setRejectModal(false); setRejectingTestId(null); rejectForm.resetFields();
      fetchAll();
    } catch { message.error("Failed to reject"); }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${url}/test-series/${id}`);
      message.success("Deleted successfully!");
      fetchAll();
    } catch { message.error("Failed to delete"); }
  };

  // Admin: toggle featured
  const handleToggleFeatured = async (t: TestSeries) => {
    try {
      await axios.put(`${url}/test-series/${t._id}`, { isFeatured: !t.isFeatured });
      message.success(`${!t.isFeatured ?"Featured!" :"Unfeatured"}`);
      fetchAll();
    } catch { message.error("Failed to update"); }
  };

  // Admin: save notes
  const handleSaveNotes = async (values: { adminNotes: string }) => {
    if (!notesTestId) return;
    try {
      await axios.put(`${url}/test-series/${notesTestId}`, { adminNotes: values.adminNotes });
      message.success("Admin notes saved.");
      setNotesModal(false); notesForm.resetFields(); setNotesTestId(null);
      fetchAll();
    } catch { message.error("Failed to save notes"); }
  };

  // Export CSV
  const handleExport = () => {
    const rows = [
"Title,Creator,Category,Questions,Duration,Marks,Difficulty,Status,Paid,Price,Created At",
      ...filteredData.map(t => [
        `"${t.title}"`, `"${creatorName(t.createdBy)}"`,
        `"${t.examinationCategory?.name ?? t.category ??""}"`,
        t.questions?.length ?? 0, t.duration, t.totalMarks ?? 0,
        t.difficulty, t.status,
        `"${t.isPaid ?"Paid" :"Free"}"`, t.price ?? 0,
        `"${dayjs(t.createdAt).format("YYYY-MM-DD")}"`,
      ].join(",")),
    ].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", `data:text/csv;charset=utf-8,${encodeURI(rows)}`);
    link.setAttribute("download", `test-series-${Date.now()}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    message.success("Exported!");
  };

  const showRejectModal  = (id: string) => { setRejectingTestId(id); setRejectModal(true); };
  const openNotesModal   = (t: TestSeries) => { setNotesTestId(t._id); notesForm.setFieldsValue({ adminNotes: t.adminNotes ??"" }); setNotesModal(true); };
  const clearFilters     = () => { setSearchText(""); setDiffFilter("all"); setTypeFilter("all"); setCurrentPage(1); };

  //  Shared action column cells 
  const ActionButtons = ({ record }: { record: TestSeries }) => (
    <Space size={4} wrap>
      <Tooltip title="View Details">
        <Button type="text" size="small" icon={<EyeOutlined />}
          onClick={() => { setViewingTest(record); setViewDrawerOpen(true); }} />
      </Tooltip>

      {record.status ==="pending" && (
        <>
          <Popconfirm title="Approve this test series?" onConfirm={() => handleApprove(record._id)}
            okText="Approve" cancelText="Cancel">
            <Button type="primary" size="small" icon={<CheckCircleOutlined />}
              style={{ background:"#52c41a", borderColor:"#52c41a" }}>Approve</Button>
          </Popconfirm>
          <Button danger size="small" icon={<CloseCircleOutlined />}
            onClick={() => showRejectModal(record._id)}>Reject</Button>
        </>
      )}

      {record.status ==="approved" && (
        <Button size="small" icon={<LockOutlined />}
          onClick={() => showRejectModal(record._id)}>Unapprove</Button>
      )}

      <Tooltip title="Toggle Featured">
        <Switch checked={record.isFeatured ?? false} onChange={() => handleToggleFeatured(record)}
          checkedChildren="" unCheckedChildren="" size="small" />
      </Tooltip>

      <Tooltip title="Admin Notes">
        <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openNotesModal(record)} />
      </Tooltip>

      <Popconfirm title="Delete this test series?" description="Cannot be undone."
        onConfirm={() => handleDelete(record._id)} okText="Delete" okType="danger">
        <Button danger type="text" size="small" icon={<DeleteOutlined />} />
      </Popconfirm>
    </Space>
  );

  //  Pending columns 
  const pendingColumns = [
    {
      title:"#",
      render: (_: any, __: TestSeries, i: number) => <Text type="secondary">{i + 1}</Text>,
      width: 48,
    },
    {
      title:"Test Details",
      key:"details",
      width: 280,
      render: (_: any, r: TestSeries) => (
        <div>
          <Text strong style={{ display:"block", fontSize: 13, marginBottom: 4 }}>{r.title}</Text>
          {r.examinationCategory ? (
            <Space size={4} wrap>
              <Tag color="red" style={{ fontSize: 10 }}>{r.examinationCategory.code}</Tag>
              {r.subject?.code && <Tag color="blue" style={{ fontSize: 10 }}>{r.subject.code}</Tag>}
              {r.topicCategory?.code && <Tag color="green" style={{ fontSize: 10 }}>{r.topicCategory.code}</Tag>}
              {r.seriesNumber && <Tag color="purple" style={{ fontSize: 10 }}>S{r.seriesNumber}</Tag>}
            </Space>
          ) : (
            <Tag color="blue" style={{ fontSize: 10 }}>{r.category}</Tag>
          )}
          {r.testType && <Tag color="geekblue" style={{ fontSize: 10, marginTop: 2 }}>{r.testType.replace("_","").toUpperCase()}</Tag>}
        </div>
      ),
    },
    {
      title:"Creator",
      key:"creator",
      width: 160,
      render: (_: any, r: TestSeries) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>{creatorName(r.createdBy)}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>{creatorEmail(r.createdBy)}</Text>
        </div>
      ),
    },
    {
      title:"Q / Dur / Marks",
      key:"stats",
      width: 130,
      render: (_: any, r: TestSeries) => (
        <Space direction="vertical" size={1}>
          <Text style={{ fontSize: 12 }}> {r.questions?.length ?? 0} Qs</Text>
          <Text style={{ fontSize: 12 }}> {r.duration} min</Text>
          <Text style={{ fontSize: 12 }}> {r.totalMarks ?? 0} marks</Text>
        </Space>
      ),
    },
    {
      title:"Difficulty",
      dataIndex:"difficulty",
      width: 110,
      render: (d: string) => <Tag color={difficultyColor(d)}>{d?.toUpperCase()}</Tag>,
    },
    {
      title:"Submitted",
      dataIndex:"createdAt",
      width: 100,
      render: (d: string) => (
        <Tooltip title={dayjs(d).format("DD/MM/YYYY HH:mm")}>
          <Text style={{ fontSize: 12 }}>{dayjs(d).fromNow()}</Text>
        </Tooltip>
      ),
    },
    {
      title:"Actions",
      key:"actions",
      width: 280,
      fixed:"right" as const,
      render: (_: any, r: TestSeries) => <ActionButtons record={r} />,
    },
  ];

  //  All columns 
  const allColumns = [
    {
      title:"Test",
      key:"test",
      width: 260,
      render: (_: any, r: TestSeries) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>{r.title}</Text>
          {r.isFeatured && <Tag color="gold" style={{ marginLeft: 4, fontSize: 10 }}> Featured</Tag>}
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>
            {r.questions?.length ?? 0} Qs · {r.duration}m · {r.totalMarks ?? 0} marks
          </Text>
        </div>
      ),
    },
    {
      title:"Hierarchy / Category",
      key:"cat",
      width: 180,
      render: (_: any, r: TestSeries) => r.examinationCategory ? (
        <Space direction="vertical" size={1}>
          <Tag color="red" style={{ fontSize: 10 }}>{r.examinationCategory.code} {r.examinationCategory.year}</Tag>
          {r.subject?.code && <Tag color="blue" style={{ fontSize: 10 }}>{r.subject.code}</Tag>}
          {r.topicCategory?.code && <Tag color="green" style={{ fontSize: 10 }}>{r.topicCategory.code}</Tag>}
        </Space>
      ) : (
        <Tag color="default">{r.category ??""}</Tag>
      ),
    },
    {
      title:"Creator",
      key:"creator",
      width: 140,
      render: (_: any, r: TestSeries) => (
        <Text style={{ fontSize: 12 }}>{creatorName(r.createdBy)}</Text>
      ),
    },
    {
      title:"Difficulty",
      dataIndex:"difficulty",
      width: 110,
      render: (d: string) => <Tag color={difficultyColor(d)}>{d?.toUpperCase()}</Tag>,
      filters: ["beginner","intermediate","advanced","mixed"].map(v => ({ text: v, value: v })),
      onFilter: (v: any, r: TestSeries) => r.difficulty === v,
    },
    {
      title:"Status",
      dataIndex:"status",
      width: 110,
      render: (s: string) => (
        <Tag color={statusColor(s)} style={{ fontWeight: 600 }}>{s?.toUpperCase()}</Tag>
      ),
      filters: ["approved","pending","rejected","draft"].map(v => ({ text: v, value: v })),
      onFilter: (v: any, r: TestSeries) => r.status === v,
    },
    {
      title:"Pricing",
      key:"pricing",
      width: 90,
      render: (_: any, r: TestSeries) => r.isPaid
        ? <Tag color="gold">{r.price}</Tag>
        : <Tag color="green">FREE</Tag>,
    },
    {
      title:"Created",
      dataIndex:"createdAt",
      width: 100,
      sorter: (a: TestSeries, b: TestSeries) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
      render: (d: string) => <Text style={{ fontSize: 11 }}>{dayjs(d).format("DD/MM/YY")}</Text>,
    },
    {
      title:"Actions",
      key:"actions",
      width: 300,
      fixed:"right" as const,
      render: (_: any, r: TestSeries) => <ActionButtons record={r} />,
    },
  ];

  const approvalRate = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;

  //  Render 
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
                <DashboardOutlined style={{ marginRight: 10, color:"#faad14" }} />
                Test Series Management
              </Title>
              <Text style={{ color:"rgba(255,255,255,0.6)", fontSize: 14 }}>
                Admin Panel  Review, approve, manage &amp; monitor all test series across the platform
              </Text>
            </div>
            <Space wrap>
              <Button icon={<ReloadOutlined />} onClick={fetchAll} loading={loading}
                style={{ background:"rgba(255,255,255,0.12)", color:"#fff", border:"1px solid rgba(255,255,255,0.25)", borderRadius: 8 }}>
                Refresh
              </Button>
              <Button icon={<ExportOutlined />} onClick={handleExport}
                disabled={filteredData.length === 0}
                style={{ background:"rgba(255,255,255,0.12)", color:"#fff", border:"1px solid rgba(255,255,255,0.25)", borderRadius: 8 }}>
                Export CSV
              </Button>
            </Space>
          </div>

          {/*  Stats  */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={12} sm={8} lg={4}>
              <StatCard title="Total" value={stats.total} icon={<BookOutlined />}
                gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" color="#667eea" />
            </Col>
            <Col xs={12} sm={8} lg={4}>
              <StatCard title="Approved" value={stats.approved} icon={<CheckCircleOutlined />}
                gradient="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)" color="#11998e" />
            </Col>
            <Col xs={12} sm={8} lg={4}>
              <StatCard title="Pending" value={stats.pending} icon={<ClockCircleOutlined />}
                gradient="linear-gradient(135deg, #f7971e 0%, #ffd200 100%)" color="#f7971e"
                sub="awaiting review" />
            </Col>
            <Col xs={12} sm={8} lg={4}>
              <StatCard title="Rejected" value={stats.rejected} icon={<CloseCircleOutlined />}
                gradient="linear-gradient(135deg, #f5222d 0%, #fa8c16 100%)" color="#f5222d" />
            </Col>
            <Col xs={12} sm={8} lg={4}>
              <StatCard title="Draft" value={stats.draft} icon={<FileTextOutlined />}
                gradient="linear-gradient(135deg, #1890ff 0%, #096dd9 100%)" color="#1890ff" />
            </Col>
            <Col xs={12} sm={8} lg={4}>
              <Card bordered={false} style={{ borderRadius: 12, background:"linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", height:"100%" }}
                bodyStyle={{ padding:"20px 24px" }}>
                <Text style={{ color:"rgba(255,255,255,0.85)", fontSize: 12, fontWeight: 600, textTransform:"uppercase" }}>
                  Approval Rate
                </Text>
                <Title level={2} style={{ color:"#fff", margin:"4px 0 6px", lineHeight: 1.1 }}>{approvalRate}%</Title>
                <Progress percent={approvalRate} size="small" strokeColor="rgba(255,255,255,0.9)"
                  trailColor="rgba(255,255,255,0.3)" showInfo={false} />
              </Card>
            </Col>
          </Row>

          {/*  Quick Overview  */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} md={10}>
              <Card bordered={false} style={{ borderRadius: 12, height:"100%" }} bodyStyle={{ padding:"20px 24px" }}>
                <Space style={{ marginBottom: 12 }}>
                  <TrophyOutlined style={{ color:"#faad14", fontSize: 18 }} />
                  <Text strong style={{ fontSize: 15 }}>Approval Rate Breakdown</Text>
                </Space>
                <Progress
                  percent={approvalRate}
                  strokeColor={{"0%":"#108ee9","100%":"#87d068" }}
                  format={pct => <Text strong style={{ fontSize: 18 }}>{pct}%</Text>}
                  strokeWidth={14}
                />
                <Text type="secondary" style={{ fontSize: 12, marginTop: 8, display:"block" }}>
                  {stats.approved} approved out of {stats.total} total test series
                </Text>
              </Card>
            </Col>
            <Col xs={24} md={14}>
              <Card bordered={false} style={{ borderRadius: 12, height:"100%" }} bodyStyle={{ padding:"20px 24px" }}>
                <Space style={{ marginBottom: 12 }}>
                  <FireOutlined style={{ color:"#f5222d", fontSize: 18 }} />
                  <Text strong style={{ fontSize: 15 }}>Quick Overview</Text>
                </Space>
                <Row gutter={16} style={{ textAlign:"center" }}>
                  {[
                    { icon: <TeamOutlined />, color:"#722ed1", val: stats.total,    label:"Total" },
                    { icon: <ClockCircleOutlined />, color:"#fa8c16", val: stats.pending, label:"Need Review" },
                    { icon: <CheckCircleOutlined />, color:"#52c41a", val: stats.approved, label:"Live Now" },
                    { icon: <CloseCircleOutlined />, color:"#ff4d4f", val: stats.rejected, label:"Rejected" },
                  ].map(item => (
                    <Col span={6} key={item.label}>
                      <div style={{ fontSize: 22, color: item.color, marginBottom: 4 }}>{item.icon}</div>
                      <Text style={{ display:"block", fontSize: 20, fontWeight: 700, color: item.color }}>{item.val}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>{item.label}</Text>
                    </Col>
                  ))}
                </Row>
              </Card>
            </Col>
          </Row>

          {/*  Pending alert  */}
          {stats.pending > 0 && (
            <Alert
              message={<Text strong>{stats.pending} test series awaiting approval</Text>}
              description="Review and approve or reject pending test series to make them available to students."
              type="warning" showIcon closable
              action={<Button size="small" onClick={() => setActiveTab("pending")}>Review Now </Button>}
              style={{ marginBottom: 16, borderRadius: 10 }}
            />
          )}

          {/*  Filters  */}
          <Card style={{ marginBottom: 16, borderRadius: 12 }} bodyStyle={{ padding:"12px 20px" }}>
            <Row gutter={[12, 12]} align="middle">
              <Col xs={24} sm={8} lg={7}>
                <Input placeholder="Search title, creator, category..."
                  prefix={<SearchOutlined />} value={searchText}
                  onChange={e => setSearchText(e.target.value)} allowClear />
              </Col>
              <Col xs={12} sm={4} lg={3}>
                <Select value={diffFilter} onChange={v => { setDiffFilter(v); setCurrentPage(1); }} style={{ width:"100%" }}>
                  <Option value="all">All Levels</Option>
                  <Option value="beginner">Beginner</Option>
                  <Option value="intermediate">Intermediate</Option>
                  <Option value="advanced">Advanced</Option>
                  <Option value="mixed">Mixed</Option>
                </Select>
              </Col>
              <Col xs={12} sm={4} lg={3}>
                <Select value={typeFilter} onChange={v => { setTypeFilter(v); setCurrentPage(1); }} style={{ width:"100%" }}>
                  <Option value="all">All Pricing</Option>
                  <Option value="free"> Free</Option>
                  <Option value="paid"> Paid</Option>
                </Select>
              </Col>
              <Col xs={12} sm={2} lg={2}>
                <Button icon={<FilterOutlined />} onClick={clearFilters} disabled={!isFiltered} block>Clear</Button>
              </Col>
            </Row>
          </Card>

          {isFiltered && (
            <Alert message={`Showing ${filteredData.length} of ${allTestSeries.length} test series`}
              type="info" showIcon closable style={{ marginBottom: 12, borderRadius: 8 }} />
          )}

          {/*  Main Tabbed Table  */}
          <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 0 }}>
            <Tabs
              activeKey={activeTab}
              onChange={tab => { setActiveTab(tab); setCurrentPage(1); }}
              size="large"
              style={{ padding:"0 24px" }}
              tabBarExtraContent={
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Last updated: {dayjs().format("HH:mm:ss")}
                </Text>
              }
            >
              {/*  Pending Tab  */}
              <TabPane
                tab={
                  <span>
                    <ClockCircleOutlined />
                    Pending Approvals {""}
                    {stats.pending > 0 && (
                      <Badge count={stats.pending} style={{ backgroundColor:"#fa8c16", marginLeft: 4 }} />
                    )}
                  </span>
                }
                key="pending"
              >
                {pendingList.length > 0 ? (
                  <Table
                    columns={pendingColumns}
                    dataSource={pendingList.filter(t => {
                      const q = searchText.toLowerCase();
                      return !q || t.title.toLowerCase().includes(q) || creatorName(t.createdBy).toLowerCase().includes(q);
                    })}
                    rowKey="_id"
                    loading={loading}
                    scroll={{ x: 1200 }}
                    pagination={{
                      current: currentPage, pageSize,
                      onChange: (p, s) => { setCurrentPage(p); setPageSize(s ?? 15); },
                      showSizeChanger: true, showQuickJumper: true,
                      pageSizeOptions: ["10","15","30","50"],
                      showTotal: (tot, range) => `${range[0]}-${range[1]} of ${tot} pending`,
                      style: { padding:"12px 24px", borderTop:"1px solid #f0f0f0" },
                    }}
                    size="small"
                  />
                ) : (
                  <div style={{ textAlign:"center", padding:"72px 0" }}>
                    <CheckCircleOutlined style={{ fontSize: 72, color:"#52c41a", marginBottom: 20 }} />
                    <Title level={3} type="secondary">No Pending Approvals</Title>
                    <Text type="secondary">All test series have been reviewed. Great work! </Text>
                  </div>
                )}
              </TabPane>

              {/*  All Tab  */}
              <TabPane
                tab={<span><FileTextOutlined />All Test Series ({stats.total})</span>}
                key="all"
              >
                <Table
                  columns={allColumns}
                  dataSource={filteredData}
                  rowKey="_id"
                  loading={loading}
                  scroll={{ x: 1400 }}
                  pagination={{
                    current: currentPage, pageSize,
                    onChange: (p, s) => { setCurrentPage(p); setPageSize(s ?? 15); },
                    onShowSizeChange: (_, s) => { setCurrentPage(1); setPageSize(s); },
                    showSizeChanger: true, showQuickJumper: true,
                    pageSizeOptions: ["15","30","50","100"],
                    showTotal: (tot, range) => `${range[0]}-${range[1]} of ${tot} test series`,
                    style: { padding:"12px 24px", borderTop:"1px solid #f0f0f0" },
                  }}
                  size="small"
                />
              </TabPane>

              {/*  Approved Tab  */}
              <TabPane tab={<span><CheckCircleOutlined />Approved ({stats.approved})</span>} key="approved">
                <Table
                  columns={allColumns}
                  dataSource={filteredData}
                  rowKey="_id"
                  loading={loading}
                  scroll={{ x: 1400 }}
                  pagination={{ current: currentPage, pageSize, onChange: (p, s) => { setCurrentPage(p); setPageSize(s ?? 15); }, showSizeChanger: true, showTotal: (tot, range) => `${range[0]}-${range[1]} of ${tot}`, style: { padding:"12px 24px", borderTop:"1px solid #f0f0f0" } }}
                  size="small"
                />
              </TabPane>

              {/*  Rejected Tab  */}
              <TabPane tab={<span><CloseCircleOutlined />Rejected ({stats.rejected})</span>} key="rejected">
                <Table
                  columns={allColumns}
                  dataSource={filteredData}
                  rowKey="_id"
                  loading={loading}
                  scroll={{ x: 1400 }}
                  pagination={{ current: currentPage, pageSize, onChange: (p, s) => { setCurrentPage(p); setPageSize(s ?? 15); }, showSizeChanger: true, showTotal: (tot, range) => `${range[0]}-${range[1]} of ${tot}`, style: { padding:"12px 24px", borderTop:"1px solid #f0f0f0" } }}
                  size="small"
                />
              </TabPane>
            </Tabs>
          </Card>
        </Content>

        {/* 
            VIEW DETAIL DRAWER
         */}
        <Drawer
          title={
            <Space>
              <EyeOutlined style={{ color:"#1890ff" }} />
              <span>{viewingTest?.title}</span>
              {viewingTest && <Tag color={statusColor(viewingTest.status)}>{viewingTest.status?.toUpperCase()}</Tag>}
              {viewingTest?.isFeatured && <Tag color="gold"> Featured</Tag>}
            </Space>
          }
          open={viewDrawerOpen}
          onClose={() => { setViewDrawerOpen(false); setViewingTest(null); }}
          width={680}
          extra={
            viewingTest?.status ==="pending" ? (
              <Space>
                <Popconfirm title="Approve?" onConfirm={() => { handleApprove(viewingTest._id); setViewDrawerOpen(false); }}>
                  <Button type="primary" icon={<CheckCircleOutlined />}
                    style={{ background:"#52c41a", borderColor:"#52c41a" }}>Approve</Button>
                </Popconfirm>
                <Button danger icon={<CloseCircleOutlined />}
                  onClick={() => { setViewDrawerOpen(false); showRejectModal(viewingTest._id); }}>
                  Reject
                </Button>
              </Space>
            ) : undefined
          }
        >
          {viewingTest && (
            <div>
              {/* Hierarchy breadcrumb */}
              {viewingTest.examinationCategory && (
                <Card size="small" style={{ marginBottom: 16, background:"#f0f7ff", border:"1px solid #91caff", borderRadius: 8 }}>
                  <Text strong style={{ color:"#1890ff" }}>Hierarchy: </Text>
                  <Space size={4} wrap style={{ marginTop: 4 }}>
                    <Tag color="red">{viewingTest.examinationCategory.code}</Tag>
                    <Text type="secondary"></Text>
                    {viewingTest.subject?.code && <><Tag color="blue">{viewingTest.subject.code}</Tag><Text type="secondary"></Text></>}
                    {viewingTest.topicCategory?.code && <><Tag color="green">{viewingTest.topicCategory.code}</Tag><Text type="secondary"></Text></>}
                    {viewingTest.seriesNumber && <Tag color="purple">Series {viewingTest.seriesNumber}</Tag>}
                  </Space>
                </Card>
              )}

              <Descriptions column={1} bordered size="small" style={{ marginBottom: 16 }}>
                <Descriptions.Item label="Creator">
                  <Text strong>{creatorName(viewingTest.createdBy)}</Text>
                  <br /><Text type="secondary" style={{ fontSize: 11 }}>{creatorEmail(viewingTest.createdBy)}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Category">{viewingTest.category ?? viewingTest.examinationCategory?.name ??""}</Descriptions.Item>
                <Descriptions.Item label="Test Type">{viewingTest.testType?.replace("_","") ??""}</Descriptions.Item>
                <Descriptions.Item label="Duration">{viewingTest.duration} minutes</Descriptions.Item>
                <Descriptions.Item label="Max Attempts">{viewingTest.maxAttempts}</Descriptions.Item>
                <Descriptions.Item label="Difficulty"><Tag color={difficultyColor(viewingTest.difficulty)}>{viewingTest.difficulty}</Tag></Descriptions.Item>
                <Descriptions.Item label="Questions">{viewingTest.questions?.length ?? 0}</Descriptions.Item>
                <Descriptions.Item label="Total Marks">{viewingTest.totalMarks ?? 0}</Descriptions.Item>
                <Descriptions.Item label="Pricing">
                  {viewingTest.isPaid ? <Tag color="gold">PAID  {viewingTest.price}</Tag> : <Tag color="green">FREE</Tag>}
                </Descriptions.Item>
                <Descriptions.Item label="Description">{viewingTest.description ||"No description"}</Descriptions.Item>
                <Descriptions.Item label="Created">{dayjs(viewingTest.createdAt).format("DD MMMM YYYY, HH:mm")}</Descriptions.Item>
                <Descriptions.Item label="Updated">{dayjs(viewingTest.updatedAt).format("DD MMMM YYYY, HH:mm")}</Descriptions.Item>
              </Descriptions>

              {viewingTest.rejectionReason && (
                <Alert message="Rejection Reason" description={viewingTest.rejectionReason}
                  type="error" showIcon style={{ marginBottom: 16, borderRadius: 8 }} />
              )}

              {viewingTest.adminNotes && (
                <Alert message="Admin Notes (Internal)"
                  description={<Text style={{ color:"#d48806" }}>{viewingTest.adminNotes}</Text>}
                  type="warning" style={{ marginBottom: 16, borderRadius: 8 }} />
              )}

              {/* Questions Preview */}
              {viewingTest.questions?.length > 0 && (
                <div>
                  <Divider orientation="left" plain>Questions Preview (first 3)</Divider>
                  {viewingTest.questions.slice(0, 3).map((q, i) => (
                    <Card key={i} size="small" style={{ marginBottom: 8, borderRadius: 8 }}>
                      <Text strong>Q{i + 1}. {q.questionText}</Text>
                      <div style={{ marginTop: 6 }}>
                        <Tag color="blue">+{q.marks}</Tag>
                        <Tag color="red">-{q.negativeMarks}</Tag>
                        {q.difficulty && <Tag color={difficultyColor(q.difficulty)}>{q.difficulty.toUpperCase()}</Tag>}
                      </div>
                      <div style={{ marginTop: 6 }}>
                        {q.options.map((opt, j) => (
                          <div key={j} style={{ fontSize: 12, color: opt.isCorrect ?"#52c41a" : undefined }}>
                            {opt.isCorrect ?"" :""} {opt.text}
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                  {viewingTest.questions.length > 3 && (
                    <Text type="secondary">and {viewingTest.questions.length - 3} more questions</Text>
                  )}
                </div>
              )}

              <div style={{ marginTop: 24 }}>
                <Space wrap>
                  {viewingTest.status ==="pending" && (
                    <>
                      <Popconfirm title="Approve?" onConfirm={() => { handleApprove(viewingTest._id); setViewDrawerOpen(false); }}>
                        <Button type="primary" icon={<CheckCircleOutlined />}
                          style={{ background:"#52c41a", borderColor:"#52c41a" }}>Approve</Button>
                      </Popconfirm>
                      <Button danger icon={<CloseCircleOutlined />}
                        onClick={() => { setViewDrawerOpen(false); showRejectModal(viewingTest._id); }}>
                        Reject
                      </Button>
                    </>
                  )}
                  <Button icon={<EditOutlined />} onClick={() => { openNotesModal(viewingTest); setViewDrawerOpen(false); }}>
                    Admin Notes
                  </Button>
                  <Button icon={viewingTest.isFeatured ? <StarOutlined /> : <StarOutlined />}
                    onClick={() => handleToggleFeatured(viewingTest)}>
                    {viewingTest.isFeatured ?"Unfeature" :" Feature"}
                  </Button>
                  <Popconfirm title="Delete this test series?" onConfirm={() => { handleDelete(viewingTest._id); setViewDrawerOpen(false); }}
                    okText="Delete" okType="danger">
                    <Button danger icon={<DeleteOutlined />}>Delete</Button>
                  </Popconfirm>
                </Space>
              </div>
            </div>
          )}
        </Drawer>

        {/* 
            REJECT MODAL
         */}
        <Modal
          title={<Space><CloseCircleOutlined style={{ color:"#f5222d" }} /><span>Reject Test Series</span></Space>}
          open={rejectModal}
          onCancel={() => { setRejectModal(false); setRejectingTestId(null); rejectForm.resetFields(); }}
          footer={null}
          width={580}
          destroyOnClose
        >
          <Alert message="Rejection Notice"
            description="Provide a clear, detailed reason so the teacher knows what to fix before resubmitting."
            type="warning" showIcon style={{ marginBottom: 20, borderRadius: 8 }} />
          <Form form={rejectForm} layout="vertical" onFinish={handleReject}>
            <Form.Item name="reason" label="Rejection Reason"
              rules={[{ required: true, message:"Please provide a reason" }, { min: 10, message:"At least 10 characters" }]}>
              <TextArea rows={5} showCount maxLength={500}
                placeholder="e.g. Questions are incomplete, incorrect answers marked, content is off-topic..." />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0, textAlign:"right" }}>
              <Space>
                <Button onClick={() => { setRejectModal(false); rejectForm.resetFields(); }}>Cancel</Button>
                <Button type="primary" danger htmlType="submit" icon={<CloseCircleOutlined />}>
                  Confirm Rejection
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* 
            ADMIN NOTES MODAL
         */}
        <Modal
          title={<Space><EditOutlined style={{ color:"#d48806" }} /><span>Admin Notes (Internal)</span></Space>}
          open={notesModal}
          onCancel={() => { setNotesModal(false); notesForm.resetFields(); setNotesTestId(null); }}
          footer={null}
          width={520}
          destroyOnClose
        >
          <Alert message="These notes are internal  not visible to teachers or students."
            type="info" showIcon style={{ marginBottom: 16, borderRadius: 8 }} />
          <Form form={notesForm} layout="vertical" onFinish={handleSaveNotes}>
            <Form.Item name="adminNotes" label="Notes">
              <TextArea rows={5} showCount maxLength={1000}
                placeholder="Internal review notes, flags, action items..." />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0, textAlign:"right" }}>
              <Space>
                <Button onClick={() => { setNotesModal(false); notesForm.resetFields(); }}>Cancel</Button>
                <Button type="primary" htmlType="submit" icon={<EditOutlined />}>Save Notes</Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        <Footer style={{ textAlign:"center", background:"transparent" }}>
          <Text type="secondary"><b>© 2026 Draa Admin Panel. All Rights Reserved.</b></Text>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default AdminTestSeriesDashboard;