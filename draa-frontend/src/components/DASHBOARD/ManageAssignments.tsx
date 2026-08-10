import React, { useEffect, useState } from"react";
import axios from"axios";
import { Link } from"react-router-dom";
import {
  Layout,
  Table,
  Button,
  Space,
  Modal,
  DatePicker,
  message,
  Card,
  Typography,
  Input,
  Form,
  Row,
  Col,
  Statistic,
  Tag,
  Avatar,
  Dropdown,
  MenuProps,
  Badge,
  Divider,
  InputNumber,
} from"antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  UploadOutlined,
  BookOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  CalendarOutlined,
  MoreOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from"@ant-design/icons";
import dayjs, { Dayjs } from"dayjs";

import Topbar from"./Topbar";
import Sidebar from"./Sidebar";
import Sidebar2 from"./Sidebar2";
import url from"../../url";
import { getUserRole } from"../../utils/global_auth";

const { Content, Footer } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

interface LoginUser {
  id?: string;
  name?: string;
  tname?: string;
  aname?: string;
  [key: string]: any;
}

interface Assignment {
  _id: string;
  title: string;
  subject: string;
  dueDate?: string | null;
  description?: string;
  status?: string;
  marks?: number;
  passmarks?: number;
  live_Status?: boolean;
  createdAt?: string;
  [key: string]: any;
}

const ManageAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loginUser, setLoginUser] = useState<LoginUser>({});
  const [loading, setLoading] = useState<boolean>(false);

  // Modal states
  const [showLiveModal, setShowLiveModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [dueDate, setDueDate] = useState<Dayjs | null>(null);

  // Form instance
  const [editForm] = Form.useForm();

  useEffect(() => {
    const role = getUserRole();

    //  Guest
    if (role ==="GUEST") {
      message.warning("Please login to continue", 6);
      window.location.href ="/admin-login";
      return;
    }

    //  Student
    if (role ==="STUDENT") {
      message.error("Students are not allowed to manage assignments.", 6);
      window.location.href ="/student-dashboard";
      return;
    }

    const raw = localStorage.getItem("edudocs");
    if (!raw) {
      message.error("Session expired. Please login again.");
      window.location.href ="/admin-login";
      return;
    }

    try {
      const user = JSON.parse(raw);

      //  Teacher checks
      if (role ==="TEACHER") {
        if (user.isVerified !== true) {
          message.error("Your account is not verified yet.", 7);
          window.location.href ="/teacher-dashboard";
          return;
        }

        if (user.Status !=="approved") {
          message.error("Your account is not approved yet.", 7);
          window.location.href ="/teacher-dashboard";
          return;
        }
      }

      //  Admin OR verified teacher
      setLoginUser(user);
      fetchAssignments(user.id);
    } catch {
      message.error("Invalid session. Please login again.");
      window.location.href ="/admin-login";
    }
  }, []);
  const fetchAssignments = async (teacherId: string) => {
    try {
      setLoading(true);
      const res = await axios.get<{ assignments: Assignment[] }>(
        `${url}/assignmments/all/${teacherId}`
      );
      setAssignments(res.data.assignments || []);
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch assignments");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenLiveModal = (id: string) => {
    setSelectedAssignmentId(id);
    setShowLiveModal(true);
  };

  const handleOpenEditModal = async (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setSelectedAssignmentId(assignment._id);

    // Populate form with existing data
    editForm.setFieldsValue({
      title: assignment.title,
      subject: assignment.subject,
      description: assignment.description,
      marks: assignment.marks,
      passmarks: assignment.passmarks,
    });

    setShowEditModal(true);
  };

  const handleMakeLiveConfirm = async () => {
    if (!dueDate) {
      message.warning("Please select a due date");
      return;
    }

    try {
      await axios.put(
        `${url}/assignmments/make-live/${selectedAssignmentId}`,
        {
          dueDate: dueDate.toISOString(),
        }
      );
      message.success("Assignment is now live");
      setShowLiveModal(false);
      setSelectedAssignmentId(null);
      setDueDate(null);
      if (loginUser.id) fetchAssignments(loginUser.id);
    } catch (err) {
      console.error(err);
      message.error("Failed to make assignment live");
    }
  };

  const handleEditSubmit = async (values: any) => {
    try {
      await axios.put(`${url}/assignmments/update/${selectedAssignmentId}`, values);
      message.success("Assignment updated successfully");
      setShowEditModal(false);
      setSelectedAssignment(null);
      setSelectedAssignmentId(null);
      editForm.resetFields();
      if (loginUser.id) fetchAssignments(loginUser.id);
    } catch (err) {
      console.error(err);
      message.error("Failed to update assignment");
    }
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title:'Delete Assignment',
      icon: <ExclamationCircleOutlined />,
      content:'Are you sure you want to delete this assignment? This action cannot be undone.',
      okText:'Delete',
      okType:'danger',
      cancelText:'Cancel',
      onOk: async () => {
        try {
          await axios.delete(`${url}/assignmments/delete/${id}`);
          message.success("Assignment deleted successfully");
          if (loginUser.id) fetchAssignments(loginUser.id);
        } catch (err) {
          console.error(err);
          message.error("Failed to delete assignment");
        }
      },
    });
  };

  const handleModalCancel = () => {
    setShowLiveModal(false);
    setShowEditModal(false);
    setSelectedAssignmentId(null);
    setSelectedAssignment(null);
    setDueDate(null);
    editForm.resetFields();
  };

  // Action menu for each row
  const getActionMenu = (record: Assignment): MenuProps => ({
    items: [
      {
        key:'edit',
        icon: <EditOutlined />,
        label:'Edit Assignment',
        onClick: () => handleOpenEditModal(record)
      },
      {
        key:'upload',
        icon: <UploadOutlined />,
        label:'Upload Files',
        onClick: () => window.open(`/upload-assignment/${record._id}`,'_blank')
      },
      {
        key:'live',
        icon: <PlayCircleOutlined />,
        label:'Make Live',
        disabled: record.live_Status,
        onClick: () => handleOpenLiveModal(record._id)
      },
      {
        type:'divider' as const
      },
      {
        key:'delete',
        icon: <DeleteOutlined />,
        label:'Delete Assignment',
        danger: true,
        onClick: () => handleDelete(record._id)
      }
    ]
  });

  const columns = [
    {
      title:'Assignment',
      key:'assignment',
      width: 300,
      render: (_: any, record: Assignment) => (
        <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
          <Avatar
            size={48}
            icon={<FileTextOutlined />}
            style={{
              backgroundColor: record.live_Status ?'#52c41a' :'#1890ff',
              flexShrink: 0
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text strong style={{ fontSize: 14, display:'block', marginBottom: 4 }}>
              {record.title}
            </Text>
            <Text type="secondary" style={{ fontSize: 12, display:'block' }}>
              Subject: {record.subject}
            </Text>
            <div style={{ marginTop: 4 }}>
              {record.live_Status ? (
                <Tag icon={<CheckCircleOutlined />} color="success" size="small">
                  Live
                </Tag>
              ) : (
                <Tag icon={<ClockCircleOutlined />} color="warning" size="small">
                  Draft
                </Tag>
              )}
            </div>
          </div>
        </div>
      ),
      sorter: (a: Assignment, b: Assignment) => a.title.localeCompare(b.title),
    },
    {
      title:'Marks',
      key:'marks',
      width: 120,
      render: (_: any, record: Assignment) => (
        <div style={{ textAlign:'center' }}>
          <Text strong style={{ fontSize: 16, color:'#1890ff' }}>
            {record.marks ||'N/A'}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            Pass: {record.passmarks ||'N/A'}
          </Text>
        </div>
      ),
      sorter: (a: Assignment, b: Assignment) => (a.marks || 0) - (b.marks || 0),
    },
    {
      title:'Due Date',
      dataIndex:'dueDate',
      key:'dueDate',
      width: 150,
      render: (text: string | null | undefined) => (
        <div style={{ display:'flex', alignItems:'center', gap: 6 }}>
          <CalendarOutlined style={{ color: text ?'#52c41a' :'#d9d9d9' }} />
          <Text style={{ fontSize: 12 }}>
            {text ? dayjs(text).format('MMM DD, YYYY HH:mm') :'Not set'}
          </Text>
        </div>
      ),
      sorter: (a: Assignment, b: Assignment) => {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        return dateA - dateB;
      },
    },
    {
      title:'Description',
      dataIndex:'description',
      key:'description',
      width: 200,
      render: (text: string | null | undefined) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {text ? (text.length > 50 ? `${text.substring(0, 50)}...` : text) :'No description'}
        </Text>
      ),
    },
    {
      title:'Actions',
      key:'actions',
      width: 80,
      align:'center' as const,
      render: (_: any, record: Assignment) => (
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
  const totalAssignments = assignments.length;
  const liveAssignments = assignments.filter(a => a.live_Status).length;
  const draftAssignments = totalAssignments - liveAssignments;
  const totalMarks = assignments.reduce((sum, assignment) => sum + (assignment.marks || 0), 0);
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
    <Layout style={{ minHeight:"100vh", background:'#f5f5f5' }}>
      {getUserRole() ==="ADMIN" ? <Sidebar /> : <Sidebar2 />}

      <Layout>
        <Topbar />

        <Content style={{ margin:"24px 24px 0", minHeight: 280 }}>
          {/* Header Section */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 16 }}>
              <div>
                <Title level={2} style={{ margin: 0, color:'#262626' }}>
                  Assignment Management
                </Title>
                <Text type="secondary">Create, manage and monitor all your assignments</Text>
              </div>
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  size="large"
                  onClick={() => window.open('/assignments','_blank')}
                  style={{
                    borderRadius: 8,
                    boxShadow:'0 2px 4px rgba(24,144,255,0.2)'
                  }}
                >
                  Create Assignment
                </Button>
              </Space>
            </div>

            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={12} lg={6}>
                <Card style={{ borderRadius: 12, boxShadow:'0 1px 3px rgba(0,0,0,0.1)' }}>
                  <Statistic
                    title="Total Assignments"
                    value={totalAssignments}
                    prefix={<FileTextOutlined style={{ color:'#1890ff' }} />}
                    valueStyle={{ color:'#1890ff', fontWeight:'bold' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card style={{ borderRadius: 12, boxShadow:'0 1px 3px rgba(0,0,0,0.1)' }}>
                  <Statistic
                    title="Live Assignments"
                    value={liveAssignments}
                    prefix={<CheckCircleOutlined style={{ color:'#52c41a' }} />}
                    valueStyle={{ color:'#52c41a', fontWeight:'bold' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card style={{ borderRadius: 12, boxShadow:'0 1px 3px rgba(0,0,0,0.1)' }}>
                  <Statistic
                    title="Draft Assignments"
                    value={draftAssignments}
                    prefix={<ClockCircleOutlined style={{ color:'#fa8c16' }} />}
                    valueStyle={{ color:'#fa8c16', fontWeight:'bold' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card style={{ borderRadius: 12, boxShadow:'0 1px 3px rgba(0,0,0,0.1)' }}>
                  <Statistic
                    title="Total Marks"
                    value={totalMarks}
                    prefix={<BookOutlined style={{ color:'#722ed1' }} />}
                    valueStyle={{ color:'#722ed1', fontWeight:'bold' }}
                  />
                </Card>
              </Col>
            </Row>
          </div>

          {/* Main Content Card */}
          <Card style={{ borderRadius: 12, boxShadow:'0 1px 3px rgba(0,0,0,0.1)' }}>
            <Table
              columns={columns}
              dataSource={assignments}
              rowKey="_id"
              loading={loading}
              pagination={{
                pageSize: 8,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} assignments`,
              }}
              style={{ background:'white', borderRadius: 8 }}
              rowClassName={(_, index) =>
                index % 2 === 0 ?'table-row-even' :'table-row-odd'
              }
              scroll={{ x: 800 }}
            />
          </Card>
        </Content>

        {/* Make Live Modal */}
        <Modal
          title={
            <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
              <PlayCircleOutlined style={{ color:'#52c41a' }} />
              Make Assignment Live
            </div>
          }
          open={showLiveModal}
          onCancel={handleModalCancel}
          onOk={handleMakeLiveConfirm}
          okText="Make Live"
          okButtonProps={{
            size:'large',
            style: { borderRadius: 6, background:'#52c41a', borderColor:'#52c41a' }
          }}
          cancelButtonProps={{
            size:'large',
            style: { borderRadius: 6 }
          }}
          style={{ borderRadius: 12 }}
        >
          <div style={{ padding:'16px 0' }}>
            <Text style={{ display:'block', marginBottom: 16 }}>
              Please select a due date and time for this assignment:
            </Text>
            <DatePicker
              showTime
              value={dueDate}
              onChange={(date) => setDueDate(date)}
              disabledDate={(current) =>
                current ? current < dayjs().startOf("day") : false
              }
              style={{ width:'100%', borderRadius: 6 }}
              placeholder="Select due date and time"
              format="YYYY-MM-DD HH:mm"
            />
          </div>
        </Modal>

        {/* Edit Assignment Modal */}
        <Modal
          title={
            <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
              <EditOutlined style={{ color:'#1890ff' }} />
              Edit Assignment
            </div>
          }
          open={showEditModal}
          onCancel={handleModalCancel}
          footer={null}
          width={600}
          style={{ borderRadius: 12 }}
        >
          <Form
            form={editForm}
            layout="vertical"
            onFinish={handleEditSubmit}
            style={{ marginTop: 16 }}
          >
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="title"
                  label="Assignment Title"
                  rules={[{ required: true, message:'Please enter assignment title' }]}
                >
                  <Input
                    placeholder="Enter assignment title"
                    style={{ borderRadius: 6 }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="subject"
                  label="Subject"
                  rules={[{ required: true, message:'Please enter subject' }]}
                >
                  <Input
                    placeholder="Enter subject"
                    style={{ borderRadius: 6 }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="marks"
                  label="Total Marks"
                  rules={[
                    { required: true, message:'Please enter total marks' },
                    { type:'number', min: 1, message:'Marks must be greater than 0' }
                  ]}
                >
                  <InputNumber
                    placeholder="Enter total marks"
                    style={{ width:'100%', borderRadius: 6 }}
                    min={1}
                    precision={0}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="passmarks"
                  label="Pass Marks"
                  rules={[
                    { required: true, message:'Please enter pass marks' },
                    { type:'number', min: 1, message:'Pass marks must be greater than 0' }
                  ]}
                >
                  <InputNumber
                    placeholder="Enter pass marks"
                    style={{ width:'100%', borderRadius: 6 }}
                    min={1}
                    precision={0}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="description"
              label="Description"
            >
              <TextArea
                rows={4}
                placeholder="Enter assignment description (optional)"
                style={{ borderRadius: 6 }}
              />
            </Form.Item>

            <div style={{ display:'flex', justifyContent:'flex-end', gap: 12, marginTop: 24 }}>
              <Button
                onClick={handleModalCancel}
                size="large"
                style={{ borderRadius: 6 }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                style={{ borderRadius: 6 }}
              >
                Update Assignment
              </Button>
            </div>
          </Form>
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
        .ant-input-number {
          width: 100%;
        }
        .ant-input-number-input {
          text-align: left;
        }
      `}</style>
    </Layout>
  );
};

export default ManageAssignments;
