import { useEffect, useState } from"react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  DatePicker,
  Space,
  Typography,
  message,
  Popconfirm,
  Row,
  Col,
  Table,
  Divider,
  Layout,
  Alert,
  Select,
  Card,
} from"antd";
import { PlusOutlined, DeleteOutlined, EditOutlined } from"@ant-design/icons";
import moment from"moment";
import axios from"axios";
import { useNavigate } from"react-router-dom";
import url from"../../url";

import Sidebar from'./Sidebar';
import Sidebar2 from'./Sidebar2';
import Topbar from'./Topbar';
import { getUserRole, getAuthHeaders } from"../../utils/global_auth";
import usePageTitle from "../../hooks/usePageTitle";

const { Title } = Typography;
const { Content, Footer } = Layout;
const { Option } = Select;
const { TextArea } = Input;

interface Course {
  _id: string;
  title: string;
  description?: string;
}

interface LiveSession {
  _id: string;
  topic: string;
  startTime: string;
  duration: number;
  description?: string;
  courseId: {
    _id: string;
    title: string;
  };
  createdBy: any;
  zoomMeetingId: string;
  joinUrl: string;
  status: string;
}

const LiveSessionManager = () => {
  usePageTitle(getUserRole() === "ADMIN" ? "Live Sessions | Admin" : "Live Sessions | Teacher");
  const navigate = useNavigate();

  //  ALL HOOKS AT TOP LEVEL
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loginUser, setLoginuser] = useState<{
    id?: string;
    name?: string;
    tname?: string;
    aname?: string;
    isVerified?: boolean;
    Status?: string;
  }>({});
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [form] = Form.useForm();

  //  SINGLE AUTH CHECK useEffect
  useEffect(() => {
    const role = getUserRole();

    if (role ==="GUEST") {
      message.warning("Please login to continue", 6);
      navigate("/admin-login");
      return;
    }

    if (role ==="STUDENT") {
      message.error("Students are not allowed to manage live sessions.", 6);
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

      setLoginuser(user);

      //  ADD THIS LINE
      setIsAuthChecked(true);

    } catch {
      message.error("Invalid session. Please login again.");
      navigate("/admin-login");
    }
  }, [navigate]);

  //  FETCH TEACHER'S COURSES
  useEffect(() => {
    if (!loginUser?.id) return;

    const fetchTeacherCourses = async () => {
      setLoadingCourses(true);
      try {
        const response = await axios.get(`${url}/course/courseDetails/teacher/${loginUser.id}`, {
          headers: getAuthHeaders()
        });
        setCourses(response.data.courses || []);
      } catch (error) {
        message.error("Failed to load courses");
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchTeacherCourses();
  }, [loginUser.id]);
  //  FETCH SESSIONS
  useEffect(() => {
    const fetchSessions = async () => {
      if (!isAuthChecked || (!loginUser?.name && !loginUser?.tname && !loginUser?.aname)) {
        return;
      }

      setLoading(true);
      try {
        const resp = await axios.get(`${url}/live-sessions`, {
          headers: getAuthHeaders()
        });
        setLiveSessions(resp.data.meetings || resp.data || []);
        console.log(' Sessions loaded:', resp.data);
      } catch (error) {
        console.error("Error fetching sessions:", error);
        message.error("Failed to load live sessions");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [isAuthChecked, loginUser]);

  //  CONDITIONAL RENDERING AFTER ALL HOOKS
  if (!loginUser || Object.keys(loginUser).length === 0) {
    return (
      <Layout style={{ minHeight:"100vh" }}>
        <Content style={{ display:"flex", justifyContent:"center", alignItems:"center" }}>
          <Alert
            message="Checking authentication"
            description="Please wait while we verify your permissions..."
            type="info"
            showIcon
          />
        </Content>
      </Layout>
    );
  }

  //  SUBMIT HANDLER (Create/Update)
  const onFinish = async (values: any) => {
    const payload = {
      topic: values.topic,
      startTime: values.startTime.toISOString(),
      duration: values.duration,
      description: values.description ||"",
      courseId: values.courseId, //  ADDED
      createdBy: loginUser?.id ||"admin",
    };

    try {
      if (selectedSessionId) {
        // Update existing session
        await axios.put(`${url}/live-sessions/${selectedSessionId}`, payload, {
          headers: getAuthHeaders()
        });
        message.success(" Live session updated successfully!");
      } else {
        // Create new session
        await axios.post(`${url}/live-sessions`, payload, {
          headers: getAuthHeaders()
        });
        message.success(" Live session created successfully!");
      }

      form.resetFields();
      setSelectedSessionId(null);

      // Refetch sessions
      const resp = await axios.get(`${url}/live-sessions`, {
        headers: getAuthHeaders()
      });
      setLiveSessions(resp.data.meetings || resp.data || []);
    } catch (error: any) {
      console.error("Error saving session:", error);
      message.error(error.response?.data?.error ||"Failed to save live session");
    }
  };

  //  EDIT HANDLER
  const onEdit = (session: LiveSession) => {
    form.setFieldsValue({
      topic: session.topic,
      startTime: moment(session.startTime),
      duration: session.duration,
      description: session.description ||"",
      courseId: session.courseId?._id || null, //  ADDED
    });
    setSelectedSessionId(session._id);
  };

  //  DELETE HANDLER
  const onDelete = async (id: string) => {
    try {
      await axios.delete(`${url}/live-sessions/${id}`, {
        headers: getAuthHeaders()
      });
      message.success(" Live session deleted successfully!");

      if (selectedSessionId === id) {
        form.resetFields();
        setSelectedSessionId(null);
      }

      // Refetch sessions
      const resp = await axios.get(`${url}/live-sessions`, {
        headers: getAuthHeaders()
      });
      setLiveSessions(resp.data.meetings || resp.data || []);
    } catch (error) {
      console.error("Error deleting session:", error);
      message.error(" Failed to delete live session");
    }
  };

  //  TABLE COLUMNS
  const columns = [
    {
      title:"Session Title",
      dataIndex:"topic",
      key:"topic",
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title:"Course", //  ADDED
      dataIndex: ["courseId","title"],
      key:"course",
      render: (text: string) => (
        <span style={{ color:'#1890ff' }}> {text ||'N/A'}</span>
      ),
    },
    {
      title:"Start Time",
      dataIndex:"startTime",
      key:"startTime",
      render: (text: string) => moment(text).format("YYYY-MM-DD HH:mm"),
    },
    {
      title:"Duration (mins)",
      dataIndex:"duration",
      key:"duration",
    },
    {
      title:"Status",
      dataIndex:"status",
      key:"status",
      render: (status: string) => {
        const color = status ==='scheduled' ?'blue' : status ==='started' ?'green' :'gray';
        return <span style={{ color, fontWeight:'bold' }}>{status.toUpperCase()}</span>;
      },
    },
    {
      title:"Actions",
      key:"actions",
      render: (_: any, record: LiveSession) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
            type="primary"
            size="small"
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this session?"
            onConfirm={() => onDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} size="small">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight:"100vh" }}>
      {getUserRole() ==="ADMIN" ? <Sidebar /> : <Sidebar2 />}

      <Layout>
        <Topbar />

        <Content style={{ margin:"24px 16px", padding: 24 }}>
          {loginUser.tname && (
            <Alert
              message="Teacher Account Status"
              description={
                <div>
                  <div> <strong>Verified:</strong> {loginUser.isVerified ?'Yes' :'No'}</div>
                  <div> <strong>Status:</strong> {loginUser.Status}</div>
                  <div style={{ marginTop: 8, color:'#52c41a' }}>
                    Your account is verified and approved. You can manage live sessions.
                  </div>
                </div>
              }
              type="success"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          <Row gutter={24}>
            {/*  LEFT SIDE: FORM */}
            <Col xs={24} md={10}>
              <Card
                bordered
                style={{
                  borderRadius:'12px',
                  boxShadow:'0 4px 14px rgba(0,0,0,0.1)'
                }}
              >
                <Title level={3} style={{ textAlign:'center', marginBottom: 24 }}>
                  {selectedSessionId ?" Edit Live Session" :" Create Live Session"}
                </Title>

                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                  requiredMark="optional"
                >
                  <Form.Item
                    name="topic"
                    label="Session Title"
                    rules={[{ required: true, message:"Please enter the session title" }]}
                  >
                    <Input size="large" placeholder="Enter session title" />
                  </Form.Item>

                  {/*  COURSE SELECTION */}
                  <Form.Item
                    name="courseId"
                    label="Select Course"
                    rules={[{ required: true, message:"Please select a course" }]}
                  >
                    <Select
                      size="large"
                      placeholder="Choose a course"
                      loading={loadingCourses}
                      showSearch
                      filterOption={(input, option) =>
                        (option?.children as unknown as string)
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    >
                      {courses.map((course) => (
                        <Option key={course._id} value={course._id}>
                           {course.title}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="startTime"
                    label="Start Date & Time"
                    rules={[{ required: true, message:"Please select start date and time" }]}
                  >
                    <DatePicker
                      showTime={{ format:"HH:mm" }}
                      format="YYYY-MM-DD HH:mm"
                      size="large"
                      style={{ width:"100%" }}
                      disabledDate={(current) => current && current < moment().startOf("day")}
                    />
                  </Form.Item>

                  <Form.Item
                    name="duration"
                    label="Duration (minutes)"
                    rules={[{ required: true, message:"Please enter session duration" }]}
                  >
                    <InputNumber
                      min={1}
                      max={180}
                      size="large"
                      style={{ width:"100%" }}
                      placeholder="e.g., 60"
                    />
                  </Form.Item>

                  <Form.Item name="description" label="Description (optional)">
                    <TextArea
                      rows={4}
                      placeholder="Add session description, agenda, or notes..."
                    />
                  </Form.Item>

                  <Form.Item>
                    <Space style={{ width:'100%' }}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        icon={<PlusOutlined />}
                        size="large"
                        block
                      >
                        {selectedSessionId ?"Update Session" :"Create Session"}
                      </Button>
                      {selectedSessionId && (
                        <Button
                          size="large"
                          onClick={() => {
                            form.resetFields();
                            setSelectedSessionId(null);
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    </Space>
                  </Form.Item>
                </Form>
              </Card>
            </Col>

            {/*  RIGHT SIDE: TABLE */}
            <Col xs={24} md={14}>
              <Card
                bordered
                style={{
                  borderRadius:'12px',
                  boxShadow:'0 4px 14px rgba(0,0,0,0.1)'
                }}
              >
                <Title level={3} style={{ textAlign:'center', marginBottom: 24 }}>
                   Manage Live Sessions
                </Title>
                <Divider />
                <Table
                  columns={columns}
                  dataSource={liveSessions}
                  rowKey="_id"
                  loading={loading}
                  scroll={{ x:"100%" }}
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            </Col>
          </Row>
        </Content>

        <Footer style={{ textAlign:"center" }}>
          <b>© 2026 Draa. All Rights Reserved.</b>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default LiveSessionManager;
