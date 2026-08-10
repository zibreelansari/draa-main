import { useEffect, useState } from"react";
import axios from"axios";
import { useParams, Link, useNavigate } from"react-router-dom";
import {
  Table,
  Button,
  message,
  Modal,
  Card,
  Typography,
  Layout,
  Space,
  Tag,
  Avatar,
  Statistic,
  Row,
  Col,
  Dropdown,
  MenuProps,
  Badge,
  Input,
  Tooltip,
  Divider,
} from"antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  ClockCircleOutlined,
  BookOutlined,
  TrophyOutlined,
  CalendarOutlined,
  MoreOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FilterOutlined,
  DownloadOutlined,
  FileTextOutlined,
  SearchOutlined,
  QuestionCircleOutlined,
  UserOutlined,
} from"@ant-design/icons";
import dayjs from"dayjs";

import Topbar from"./Topbar";
import Sidebar from"./Sidebar";
import Sidebar2 from"./Sidebar2";
import url from"../../url";
import { getUserRole, getAuthHeaders } from"../../utils/global_auth";

const { Title, Text } = Typography;
const { Content, Footer } = Layout;
const { Search } = Input;

interface LoginUser {
  id?: string;
  name?: string;
  tname?: string;
  aname?: string;
  [key: string]: any;
}

interface Exam {
  _id: string;
  title: string;
  subject?: string;
  durationMinutes: number;
  totalMarks: number;
  scheduledAt?: string;
  status?: string;
  isLive?: boolean;
  createdAt?: string;
  questionCount?: number;
  passingMarks?: number;
  description?: string;
  [key: string]: any;
}

const ExamManagement = () => {
  const navigate = useNavigate();
  const [loginUser, setLoginUser] = useState<LoginUser>({});
  const [exams, setExams] = useState<Exam[]>([]);
  const [filteredExams, setFilteredExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>("");
  const { teacherId } = useParams();

  // Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("edudocs");
    if (storedUser) {
      setLoginUser(JSON.parse(storedUser));
    }
  }, []);


  useEffect(() => {
    const role = getUserRole();

    //  Guest
    if (role ==="GUEST") {
      message.warning("Please login to continue", 6);
      navigate("/admin-login");
      return;
    }

    //  Student
    if (role ==="STUDENT") {
      message.error("Students are not allowed to manage exams.", 6);
      navigate("/student-dashboard");
      return;
    }

    const raw = localStorage.getItem("edudocs");
    if (!raw) {
      message.error("Session expired. Please login again.");
      navigate("/admin-login");
      return;
    }

    try {
      const user = JSON.parse(raw);

      //  Teacher validation
      if (role ==="TEACHER") {
        if (user.isVerified !== true) {
          message.error("Your account is not verified yet.", 7);
          navigate("/teacher-dashboard");
          return;
        }

        if (user.Status !=="approved") {
          message.error("Your account is not approved yet.", 7);
          navigate("/teacher-dashboard");
          return;
        }
      }

      //  Admin OR verified teacher
      setLoginUser(user);
    } catch {
      message.error("Invalid session. Please login again.");
      navigate("/admin-login");
    }
  }, [navigate]);

  // Fetch exams when user or teacherId changes
  useEffect(() => {
    if (!loginUser?.id && !teacherId) return;
    fetchExams(loginUser?.id || teacherId!);
  }, [loginUser?.id, teacherId]);
  const fetchExams = async (id: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`${url}/exam/teacher/${id}`, {
        headers: getAuthHeaders()
      });
      const response = res.data.exams;
      const examData = Array.isArray(response) ? response : [response];
      setExams(examData);
      setFilteredExams(examData);
    } catch (err) {
      console.error(err);
      message.error("Failed to load exams");
    }
    setLoading(false);
  };

  // Search functionality
  const handleSearch = (value: string) => {
    setSearchText(value);
    const filtered = exams.filter(exam =>
      exam.title.toLowerCase().includes(value.toLowerCase()) ||
      (exam.subject && exam.subject.toLowerCase().includes(value.toLowerCase()))
    );
    setFilteredExams(filtered);
  };

  // Modal handlers
  const openDeleteModal = (exam: Exam) => {
    setCurrentExam(exam);
    setIsDeleteModalOpen(true);
  };

  const openViewModal = (exam: Exam) => {
    setCurrentExam(exam);
    setIsViewModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsDeleteModalOpen(false);
    setIsViewModalOpen(false);
    setCurrentExam(null);
  };

  // Handle exam delete
  const handleDelete = async () => {
    try {
      await axios.delete(`${url}/exam/delete/${currentExam?._id}`, {
        headers: getAuthHeaders()
      });
      message.success("Exam deleted successfully");
      setIsDeleteModalOpen(false);
      fetchExams(loginUser?.id || teacherId);
    } catch (err) {
      console.error(err);
      message.error("Failed to delete exam");
    }
  };

  // Get exam status
  const getExamStatus = (exam: Exam) => {
    if (exam.isLive) return { status:'Live', color:'success' };
    if (exam.scheduledAt && dayjs(exam.scheduledAt).isBefore(dayjs())) {
      return { status:'Completed', color:'default' };
    }
    if (exam.scheduledAt && dayjs(exam.scheduledAt).isAfter(dayjs())) {
      return { status:'Scheduled', color:'processing' };
    }
    return { status:'Draft', color:'warning' };
  };

  // Action menu for each row
  const getActionMenu = (record: Exam): MenuProps => ({
    items: [
      {
        key:'view',
        icon: <EyeOutlined />,
        label:'View Details',
        onClick: () => openViewModal(record)
      },
      {
        key:'edit',
        icon: <EditOutlined />,
        label:'Edit Exam',
        onClick: () => navigate(`/exam/edit/${record._id}`)
      },
      // {
      //   key:'questions',
      //   icon: <FileTextOutlined />,
      //   label:'Manage Questions',
      //   onClick: () => navigate(`/exam/questions/${record._id}`)
      // },
      // {
      //   key:'results',
      //   icon: <TrophyOutlined />,
      //   label:'View Results',
      //   onClick: () => navigate(`/exam/results/${record._id}`)
      // },
      {
        type:'divider' as const
      },
      {
        key:'delete',
        icon: <DeleteOutlined />,
        label:'Delete Exam',
        danger: true,
        onClick: () => openDeleteModal(record)
      }
    ]
  });

  const columns = [
    {
      title:'Exam Details',
      key:'exam',
      width: 350,
      render: (_: any, record: Exam) => {
        const statusInfo = getExamStatus(record);
        return (
          <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
            <Avatar
              size={48}
              icon={<BookOutlined />}
              style={{
                backgroundColor: statusInfo.color ==='success' ?'#52c41a' :'#1890ff',
                flexShrink: 0
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text strong style={{ fontSize: 14, display:'block', marginBottom: 4 }}>
                {record.title}
              </Text>
              <Text type="secondary" style={{ fontSize: 12, display:'block', marginBottom: 4 }}>
                Subject: {record.subject ||'Not specified'}
              </Text>
              <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
                <Tag
                  icon={statusInfo.color ==='success' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                  color={statusInfo.color}
                  size="small"
                >
                  {statusInfo.status}
                </Tag>
                {record.questionCount && (
                  <Tag icon={<QuestionCircleOutlined />} color="purple" size="small">
                    {record.questionCount} Questions
                  </Tag>
                )}
              </div>
            </div>
          </div>
        );
      },
      sorter: (a: Exam, b: Exam) => a.title.localeCompare(b.title),
    },
    {
      title:'Duration',
      dataIndex:'durationMinutes',
      key:'durationMinutes',
      width: 120,
      render: (duration: number) => (
        <div style={{ display:'flex', alignItems:'center', gap: 6, justifyContent:'center' }}>
          <ClockCircleOutlined style={{ color:'#52c41a' }} />
          <Text strong>{duration} min</Text>
        </div>
      ),
      sorter: (a: Exam, b: Exam) => a.durationMinutes - b.durationMinutes,
      align:'center' as const,
    },
    {
      title:'Total Marks',
      dataIndex:'totalMarks',
      key:'totalMarks',
      width: 120,
      render: (marks: number) => (
        <div style={{ display:'flex', alignItems:'center', gap: 6, justifyContent:'center' }}>
          <TrophyOutlined style={{ color:'#1890ff' }} />
          <Text strong style={{ color:'#1890ff' }}>{marks}</Text>
        </div>
      ),
      sorter: (a: Exam, b: Exam) => a.totalMarks - b.totalMarks,
      align:'center' as const,
    },
    {
      title:'Scheduled At',
      dataIndex:'scheduledAt',
      key:'scheduledAt',
      width: 180,
      render: (text: string) => (
        <div style={{ display:'flex', alignItems:'center', gap: 6 }}>
          <CalendarOutlined style={{ color: text ?'#52c41a' :'#d9d9d9' }} />
          <div>
            <Text style={{ fontSize: 12, display:'block' }}>
              {text ? dayjs(text).format('MMM DD, YYYY') :'Not scheduled'}
            </Text>
            {text && (
              <Text type="secondary" style={{ fontSize: 10 }}>
                {dayjs(text).format('HH:mm')}
              </Text>
            )}
          </div>
        </div>
      ),
      sorter: (a: Exam, b: Exam) => {
        const dateA = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
        const dateB = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
        return dateA - dateB;
      },
    },
    {
      title:'Actions',
      key:'actions',
      width: 80,
      align:'center' as const,
      render: (_: any, record: Exam) => (
        <Dropdown menu={getActionMenu(record)} trigger={['click']} placement="bottomRight">
          <Button
            type="text"
            icon={<MoreOutlined />}
            style={{
              border:'none',
              boxShadow:'none',
              display:'flex',
              alignItems:'center',
              justifyContent:'center'
            }}
          />
        </Dropdown>
      ),
    },
  ];

  // Stats calculation
  const totalExams = exams.length;
  const liveExams = exams.filter(exam => exam.isLive).length;
  const scheduledExams = exams.filter(exam =>
    exam.scheduledAt && dayjs(exam.scheduledAt).isAfter(dayjs())
  ).length;
  const totalMarks = exams.reduce((sum, exam) => sum + exam.totalMarks, 0);

  // Render view modal content
  const renderViewModalContent = () => {
    if (!currentExam) return null;

    const statusInfo = getExamStatus(currentExam);
    if (!loginUser || Object.keys(loginUser).length === 0) {
      return (
        <Layout style={{ minHeight:"100vh" }}>
          <Content style={{ display:"flex", justifyContent:"center", alignItems:"center" }}>
            <Card>
              <Text>Checking authentication and permissions...</Text>
            </Card>
          </Content>
        </Layout>
      );
    }
    return (
      <div style={{ maxHeight:'60vh', overflowY:'auto', padding:'8px 0' }}>
        <div style={{ display:'flex', alignItems:'center', gap: 16, marginBottom: 24 }}>
          <Avatar
            size={64}
            icon={<BookOutlined />}
            style={{ backgroundColor:'#1890ff' }}
          />
          <div>
            <Title level={3} style={{ margin: 0, marginBottom: 8 }}>
              {currentExam.title}
            </Title>
            <Space>
              <Tag color={statusInfo.color}>{statusInfo.status}</Tag>
              {currentExam.subject && (
                <Tag color="blue">{currentExam.subject}</Tag>
              )}
            </Space>
          </div>
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ textAlign:'center' }}>
              <Statistic
                title="Duration"
                value={currentExam.durationMinutes}
                suffix="min"
                valueStyle={{ color:'#52c41a', fontSize: 16 }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ textAlign:'center' }}>
              <Statistic
                title="Total Marks"
                value={currentExam.totalMarks}
                valueStyle={{ color:'#1890ff', fontSize: 16 }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ textAlign:'center' }}>
              <Statistic
                title="Pass Marks"
                value={currentExam.passingMarks || 0}
                valueStyle={{ color:'#fa8c16', fontSize: 16 }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ textAlign:'center' }}>
              <Statistic
                title="Questions"
                value={currentExam.questionCount || 0}
                valueStyle={{ color:'#722ed1', fontSize: 16 }}
              />
            </Card>
          </Col>
        </Row>

        {currentExam.description && (
          <>
            <Divider orientation="left">Description</Divider>
            <Card style={{ backgroundColor:'#f8f9fa', marginBottom: 16 }}>
              <Text>{currentExam.description}</Text>
            </Card>
          </>
        )}

        <Divider orientation="left">Schedule Information</Divider>
        <Card style={{ backgroundColor:'#f8f9fa', marginBottom: 16 }}>
          <Text strong>Scheduled Date: </Text>
          <Text>
            {currentExam.scheduledAt
              ? dayjs(currentExam.scheduledAt).format('MMMM DD, YYYY at HH:mm')
              :'Not scheduled'}
          </Text>
        </Card>

        <Divider orientation="left">Created</Divider>
        <Card style={{ backgroundColor:'#f8f9fa', marginBottom: 16 }}>
          <Text strong>Created At: </Text>
          <Text>
            {currentExam.createdAt
              ? dayjs(currentExam.createdAt).format('MMMM DD, YYYY at HH:mm')
              :'Unknown'}
          </Text>
        </Card>

        <Divider orientation="left">Exam ID</Divider>
        <Card style={{ backgroundColor:'#f8f9fa' }}>
          <Text code style={{ fontSize: 12 }}>{currentExam._id}</Text>
        </Card>
      </div>
    );
  };

  return (
    <Layout style={{ minHeight:"100vh", background:'#f5f5f5' }}>
      {"aname" in (loginUser || {}) ? <Sidebar /> : <Sidebar2 />}

      <Layout>
        <Topbar />

        <Content style={{ margin:"24px 24px 0", minHeight: 280 }}>
          {/* Header Section */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 16 }}>
              <div>
                <Title level={2} style={{ margin: 0, color:'#262626' }}>
                  Exam Management
                </Title>
                <Text type="secondary">Create, schedule and monitor all your exams</Text>
              </div>
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  size="large"
                  onClick={() => navigate('/exams')}
                  style={{
                    borderRadius: 8,
                    boxShadow:'0 2px 4px rgba(24,144,255,0.2)'
                  }}
                >
                  Create Exam
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  size="large"
                  style={{ borderRadius: 8 }}
                >
                  Export
                </Button>
              </Space>
            </div>

            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={12} lg={6}>
                <Card style={{ borderRadius: 12, boxShadow:'0 1px 3px rgba(0,0,0,0.1)' }}>
                  <Statistic
                    title="Total Exams"
                    value={totalExams}
                    prefix={<BookOutlined style={{ color:'#1890ff' }} />}
                    valueStyle={{ color:'#1890ff', fontWeight:'bold' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card style={{ borderRadius: 12, boxShadow:'0 1px 3px rgba(0,0,0,0.1)' }}>
                  <Statistic
                    title="Live Exams"
                    value={liveExams}
                    prefix={<CheckCircleOutlined style={{ color:'#52c41a' }} />}
                    valueStyle={{ color:'#52c41a', fontWeight:'bold' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card style={{ borderRadius: 12, boxShadow:'0 1px 3px rgba(0,0,0,0.1)' }}>
                  <Statistic
                    title="Scheduled Exams"
                    value={scheduledExams}
                    prefix={<CalendarOutlined style={{ color:'#fa8c16' }} />}
                    valueStyle={{ color:'#fa8c16', fontWeight:'bold' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card style={{ borderRadius: 12, boxShadow:'0 1px 3px rgba(0,0,0,0.1)' }}>
                  <Statistic
                    title="Total Marks"
                    value={totalMarks}
                    prefix={<TrophyOutlined style={{ color:'#722ed1' }} />}
                    valueStyle={{ color:'#722ed1', fontWeight:'bold' }}
                  />
                </Card>
              </Col>
            </Row>
          </div>

          {/* Main Content Card */}
          <Card style={{ borderRadius: 12, boxShadow:'0 1px 3px rgba(0,0,0,0.1)' }}>
            {/* Search and Filter Bar */}
            <div style={{
              display:'flex',
              justifyContent:'space-between',
              alignItems:'center',
              marginBottom: 20,
              flexWrap:'wrap',
              gap: 12
            }}>
              <Search
                placeholder="Search exams by title or subject..."
                allowClear
                size="large"
                style={{ maxWidth: 400, borderRadius: 8 }}
                onSearch={handleSearch}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <Space>
                <Badge count={filteredExams.length} showZero>
                  <Button
                    icon={<FilterOutlined />}
                    style={{ borderRadius: 8 }}
                  >
                    Filters
                  </Button>
                </Badge>
              </Space>
            </div>

            <Table
              columns={columns}
              dataSource={filteredExams}
              rowKey="_id"
              loading={loading}
              pagination={{
                pageSize: 8,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} exams`,
              }}
              style={{ background:'white', borderRadius: 8 }}
              rowClassName={(_, index) =>
                index % 2 === 0 ?'table-row-even' :'table-row-odd'
              }
              scroll={{ x: 800 }}
            />
          </Card>
        </Content>

        {/* Delete Modal */}
        <Modal
          title={
            <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
              <ExclamationCircleOutlined style={{ color:'#ff4d4f' }} />
              Delete Exam
            </div>
          }
          open={isDeleteModalOpen}
          onCancel={handleCloseModals}
          onOk={handleDelete}
          okText="Delete"
          okButtonProps={{
            danger: true,
            size:'large',
            style: { borderRadius: 6 }
          }}
          cancelButtonProps={{
            size:'large',
            style: { borderRadius: 6 }
          }}
          style={{ borderRadius: 12 }}
        >
          <div style={{ padding:'16px 0' }}>
            <Text>
              Are you sure you want to delete the exam <strong>"{currentExam?.title}"</strong>?
              This action cannot be undone and will remove all associated questions and results.
            </Text>
          </div>
        </Modal>

        {/* View Modal */}
        <Modal
          title={
            <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
              <EyeOutlined style={{ color:'#1890ff' }} />
              Exam Details
            </div>
          }
          open={isViewModalOpen}
          onCancel={handleCloseModals}
          footer={[
            <Button
              key="edit"
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                handleCloseModals();
                navigate(`/exam/edit/${currentExam?._id}`);
              }}
              style={{ borderRadius: 6 }}
            >
              Edit Exam
            </Button>,
            <Button key="close" size="large" onClick={handleCloseModals} style={{ borderRadius: 6 }}>
              Close
            </Button>
          ]}
          width={800}
          style={{ borderRadius: 12 }}
        >
          {renderViewModalContent()}
        </Modal>

        <Footer style={{
          textAlign:"center",
          background:'#fafafa',
          borderTop:'1px solid #f0f0f0',
          marginTop: 24
        }}>
          <Text type="secondary">
            <strong>&copy; 2025 Draa. All Rights Reserved.</strong>
          </Text>
        </Footer>
      </Layout>

      {/* Custom Styles */}
      <style>{`
        .table-row-even {
          background-color: #fafafa;
        }
        .table-row-odd {
          background-color: white;
        }
        .ant-table-thead > tr > th {
          background: #f8f9fa !important;
          border-bottom: 2px solid #e8e8e8;
          font-weight: 600;
          color: #262626;
        }
        .ant-table-tbody > tr:hover > td {
          background: #e6f7ff !important;
        }
        .ant-btn-primary {
          background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
          border: none;
        }
        .ant-btn-primary:hover {
          background: linear-gradient(135deg, #40a9ff 0%, #1890ff 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(24,144,255,0.3);
        }
        .ant-card {
          transition: all 0.3s ease;
        }
        .ant-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .ant-modal-content {
          border-radius: 12px !important;
          overflow: hidden;
        }
        .ant-modal-header {
          background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
          border-bottom: 1px solid #f0f0f0;
        }
      `}</style>
    </Layout>
  );
};

export default ExamManagement;
