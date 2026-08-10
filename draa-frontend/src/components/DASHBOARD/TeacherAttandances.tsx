import { useEffect, useState } from"react";
import {
  Layout,
  Card,
  Button,
  message,
  Typography,
  Row,
  Col,
  Space,
  Statistic,
  Tag,
  Table,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  Alert,
  Upload,
  Progress,
  Tabs,
  Badge,
  Avatar,
  Tooltip,
  Radio,
  Switch,
} from"antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CameraOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  FileTextOutlined,
  UserOutlined,
  PlusOutlined,
  DownloadOutlined,
  FilterOutlined,
  ReloadOutlined,
} from"@ant-design/icons";
import axios from"axios";
import { useNavigate } from"react-router-dom";
import moment from"moment";
import Sidebar2 from"./Sidebar2";
import Topbar from"./Topbar";
import url from"../../url";
import { getUserRole } from"../../utils/global_auth";
import usePageTitle from '../../hooks/usePageTitle';

const { Content, Footer } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

interface TeacherData {
  id: string;
  tname: string;
  temail: string;
  tprofile?: string;
  tspecialization?: string;
  tcity?: string;
  isVerified: boolean;
  Status: string;
}

interface AttendanceRecord {
  _id?: string;
  teacher_id: string;
  teacher_name: string;
  date: string;
  check_in_time: string;
  check_out_time?: string;
  status:"present" |"absent" |"half-day" |"late" |"leave";
  work_hours?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  check_in_photo?: string;
  check_out_photo?: string;
  notes?: string;
  leave_type?: string;
  leave_reason?: string;
  approved_by?: string;
  created_at?: string;
}

const TeacherAttendance = () => {
  const navigate = useNavigate();
  const [loginUser, setLoginUser] = useState<TeacherData | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkInModal, setCheckInModal] = useState(false);
  const [checkOutModal, setCheckOutModal] = useState(false);
  const [leaveModal, setLeaveModal] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selfieFile, setSelfieFile] = useState<any>(null);
  const [form] = Form.useForm();
  const [leaveForm] = Form.useForm();
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    halfDay: 0,
    late: 0,
    leaves: 0,
    workingDays: 0,
    attendancePercentage: 0,
  });

  //  Authentication & Load Teacher Data
  useEffect(() => {
    const role = getUserRole();

    //  Not logged in
    if (role ==="GUEST") {
      message.warning("Please login to continue", 6);
      navigate("/teacher-login");
      return;
    }

    //  Not a teacher
    if (role !=="TEACHER") {
      message.error("Access denied. Teacher access only.", 6);

      if (role ==="ADMIN") {
        navigate("/admin-dashboard");
      } else if (role ==="STUDENT") {
        navigate("/student-dashboard");
      } else {
        navigate("/teacher-login");
      }
      return;
    }

    //  Load teacher data
    const raw = localStorage.getItem("edudocs");
    if (!raw) {
      message.error("Session expired. Please login again.");
      navigate("/teacher-login");
      return;
    }

    try {
      const user = JSON.parse(raw);

      //  Not verified
      if (user.isVerified !== true) {
        message.error("Your account is not verified yet.", 7);
        navigate("/teacher-dashboard");
        return;
      }

      //  Not approved
      if (user.Status !=="approved") {
        message.error("Your account is not approved yet. Please wait for admin approval.", 7);
        navigate("/teacher-dashboard");
        return;
      }

      setLoginUser(user);
      fetchAttendanceRecords(user.id);
      checkTodayAttendance(user.id);
    } catch {
      message.error("Invalid session. Please login again.");
      navigate("/teacher-login");
    }
  }, [navigate]);

  //  Fetch All Attendance Records
  const fetchAttendanceRecords = async (teacherId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`${url}/teachers/attandances/teacher/${teacherId}`);

      if (response.data.success) {
        setAttendanceRecords(response.data.records);
        calculateStats(response.data.records);
      }
    } catch (error: any) {
      console.error("Error fetching attendance:", error);
      if (error.response?.status !== 404) {
        message.error("Error loading attendance records");
      }
    } finally {
      setLoading(false);
    }
  };

  //  Check Today's Attendance
  const checkTodayAttendance = async (teacherId: string) => {
    try {
      const today = moment().format("YYYY-MM-DD");
      const response = await axios.get(`${url}/teachers/attandances/teacher/${teacherId}/date/${today}`);

      if (response.data.success && response.data.record) {
        setTodayAttendance(response.data.record);
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error("Error checking today's attendance:", error);
      }
    }
  };

  //  Calculate Statistics
  const calculateStats = (records: AttendanceRecord[]) => {
    const currentMonth = moment().month();
    const currentYear = moment().year();

    const monthRecords = records.filter((r) => {
      const recordDate = moment(r.date);
      return recordDate.month() === currentMonth && recordDate.year() === currentYear;
    });

    const present = monthRecords.filter((r) => r.status ==="present").length;
    const absent = monthRecords.filter((r) => r.status ==="absent").length;
    const halfDay = monthRecords.filter((r) => r.status ==="half-day").length;
    const late = monthRecords.filter((r) => r.status ==="late").length;
    const leaves = monthRecords.filter((r) => r.status ==="leave").length;
    const workingDays = monthRecords.length;
    const attendancePercentage = workingDays > 0 ? ((present + halfDay * 0.5) / workingDays) * 100 : 0;

    setStats({
      present,
      absent,
      halfDay,
      late,
      leaves,
      workingDays,
      attendancePercentage: Math.round(attendancePercentage * 100) / 100,
    });
  };

  //  Get Current Location (Geo-Location)
  const getCurrentLocation = (): Promise<{ latitude: number; longitude: number; address: string }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        message.error("Geolocation is not supported by your browser");
        reject("Geolocation not supported");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          try {
            // Reverse geocoding to get address
            const response = await axios.get(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const address = response.data.display_name ||"Unknown location";

            setLocation({ latitude, longitude });
            resolve({ latitude, longitude, address });
          } catch (error) {
            console.error("Error getting address:", error);
            resolve({ latitude, longitude, address:"Location captured" });
          }
        },
        (error) => {
          message.error("Unable to retrieve your location. Please enable location services.");
          reject(error);
        }
      );
    });
  };

  //  Handle Check-In
  const handleCheckIn = async () => {
    if (!loginUser) return;

    try {
      setLoading(true);

      // Get location
      const locationData = await getCurrentLocation();

      const formData = new FormData();
      formData.append("teacher_id", loginUser.id);
      formData.append("teacher_name", loginUser.tname);
      formData.append("date", moment().format("YYYY-MM-DD"));
      formData.append("check_in_time", moment().format("HH:mm:ss"));
      formData.append("latitude", locationData.latitude.toString());
      formData.append("longitude", locationData.longitude.toString());
      formData.append("address", locationData.address);

      // Check if late (after 9:30 AM)
      const checkInTime = moment();
      const cutoffTime = moment().set({ hour: 9, minute: 30, second: 0 });
      const status = checkInTime.isAfter(cutoffTime) ?"late" :"present";
      formData.append("status", status);

      if (selfieFile) {
        formData.append("check_in_photo", selfieFile);
      }

      const response = await axios.post(`${url}/teachers/attandances/check-in`, formData, {
        headers: {"Content-Type":"multipart/form-data" },
      });

      if (response.data.success) {
        message.success(`Checked in successfully! Status: ${status.toUpperCase()}`);
        setCheckInModal(false);
        setSelfieFile(null);
        fetchAttendanceRecords(loginUser.id);
        checkTodayAttendance(loginUser.id);
      }
    } catch (error: any) {
      console.error("Check-in error:", error);
      message.error(error.response?.data?.message ||"Error during check-in");
    } finally {
      setLoading(false);
    }
  };

  //  Handle Check-Out
  const handleCheckOut = async () => {
    if (!loginUser || !todayAttendance) return;

    try {
      setLoading(true);

      const locationData = await getCurrentLocation();

      const formData = new FormData();
      formData.append("attendance_id", todayAttendance._id ||"");
      formData.append("check_out_time", moment().format("HH:mm:ss"));
      formData.append("latitude", locationData.latitude.toString());
      formData.append("longitude", locationData.longitude.toString());
      formData.append("address", locationData.address);

      if (selfieFile) {
        formData.append("check_out_photo", selfieFile);
      }

      // Calculate work hours
      const checkIn = moment(`${todayAttendance.date} ${todayAttendance.check_in_time}`);
      const checkOut = moment();
      const workHours = checkOut.diff(checkIn,"hours", true).toFixed(2);
      formData.append("work_hours", workHours);

      const response = await axios.put(`${url}/teachers/attandances/check-out`, formData, {
        headers: {"Content-Type":"multipart/form-data" },
      });

      if (response.data.success) {
        message.success(`Checked out successfully! Work Hours: ${workHours} hrs`);
        setCheckOutModal(false);
        setSelfieFile(null);
        fetchAttendanceRecords(loginUser.id);
        checkTodayAttendance(loginUser.id);
      }
    } catch (error: any) {
      console.error("Check-out error:", error);
      message.error(error.response?.data?.message ||"Error during check-out");
    } finally {
      setLoading(false);
    }
  };

  //  Apply for Leave
  const handleLeaveApplication = async (values: any) => {
    if (!loginUser) return;

    try {
      setLoading(true);

      const leaveData = {
        teacher_id: loginUser.id,
        teacher_name: loginUser.tname,
        start_date: values.leave_dates[0].format("YYYY-MM-DD"),
        end_date: values.leave_dates[1].format("YYYY-MM-DD"),
        leave_type: values.leave_type,
        reason: values.reason,
        status:"pending",
      };

      const response = await axios.post(`${url}/teachers/attandances/apply-leave`, leaveData);

      if (response.data.success) {
        message.success("Leave application submitted successfully!");
        setLeaveModal(false);
        leaveForm.resetFields();
        fetchAttendanceRecords(loginUser.id);
      }
    } catch (error: any) {
      console.error("Leave application error:", error);
      message.error(error.response?.data?.message ||"Error applying for leave");
    } finally {
      setLoading(false);
    }
  };

  //  Download Attendance Report
  const downloadReport = async () => {
    if (!loginUser) return;

    try {
      const response = await axios.get(`${url}/attendance/report/${loginUser.id}`, {
        responseType:"blob",
      });

      const blob = new Blob([response.data], { type:"application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `Attendance_Report_${loginUser.tname}_${moment().format("YYYY-MM")}.pdf`;
      link.click();

      message.success("Report downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      message.error("Error downloading report");
    }
  };

  //  Table Columns
  const columns = [
    {
      title:"Date",
      dataIndex:"date",
      key:"date",
      render: (date: string) => moment(date).format("DD MMM YYYY"),
      sorter: (a: AttendanceRecord, b: AttendanceRecord) => moment(a.date).unix() - moment(b.date).unix(),
    },
    {
      title:"Check-In",
      dataIndex:"check_in_time",
      key:"check_in_time",
      render: (time: string) => time ? moment(time,"HH:mm:ss").format("hh:mm A") :"-",
    },
    {
      title:"Check-Out",
      dataIndex:"check_out_time",
      key:"check_out_time",
      render: (time: string) => time ? moment(time,"HH:mm:ss").format("hh:mm A") :"-",
    },
    {
      title:"Work Hours",
      dataIndex:"work_hours",
      key:"work_hours",
      render: (hours: string) => hours ? `${hours} hrs` :"-",
    },
    {
      title:"Status",
      dataIndex:"status",
      key:"status",
      render: (status: string) => {
        const colors: any = {
          present:"green",
          absent:"red",
"half-day":"orange",
          late:"volcano",
          leave:"blue",
        };
        return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
      },
      filters: [
        { text:"Present", value:"present" },
        { text:"Absent", value:"absent" },
        { text:"Half Day", value:"half-day" },
        { text:"Late", value:"late" },
        { text:"Leave", value:"leave" },
      ],
      onFilter: (value: any, record: AttendanceRecord) => record.status === value,
    },
    {
      title:"Location",
      dataIndex:"location",
      key:"location",
      render: (location: any) =>
        location ? (
          <Tooltip title={location.address}>
            <Button
              type="link"
              icon={<EnvironmentOutlined />}
              href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
              target="_blank"
            >
              View Map
            </Button>
          </Tooltip>
        ) : (
"-"
        ),
    },
  ];

  //  Guard Render
  if (!loginUser) {
    return (
      <Layout style={{ minHeight:"100vh" }}>
        <Content style={{ display:"flex", justifyContent:"center", alignItems:"center" }}>
          <Card>
            <Text>Checking authentication...</Text>
          </Card>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight:"100vh" }}>
      <Sidebar2 />
      <Layout>
        <Topbar />
        <Content style={{ margin:"24px 16px", padding: 24, background:"#f0f2f5" }}>
          {/* Header */}
          <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
            <Col>
              <Space direction="vertical" size={0}>
                <Title level={3} style={{ margin: 0 }}>
                  Teacher Attendance Management
                </Title>
                <Text type="secondary">Track your attendance, work hours, and leave records</Text>
              </Space>
            </Col>
            <Col>
              <Space>
                <Button icon={<DownloadOutlined />} onClick={downloadReport}>
                  Download Report
                </Button>
                <Button icon={<ReloadOutlined />} onClick={() => fetchAttendanceRecords(loginUser.id)}>
                  Refresh
                </Button>
              </Space>
            </Col>
          </Row>

          {/* Teacher Info Card */}
          <Card style={{ marginBottom: 24 }}>
            <Row align="middle">
              <Col>
                <Avatar size={64} src={loginUser.tprofile} icon={<UserOutlined />} />
              </Col>
              <Col flex={1} style={{ paddingLeft: 16 }}>
                <Title level={4} style={{ margin: 0 }}>
                  {loginUser.tname}
                </Title>
                <Text type="secondary">{loginUser.tspecialization ||"Teacher"}</Text>
                <br />
                <Text type="secondary">{loginUser.temail}</Text>
              </Col>
              <Col>
                <Space>
                  <Badge status={loginUser.isVerified ?"success" :"error"} text={loginUser.isVerified ?"Verified" :"Not Verified"} />
                  <Badge status={loginUser.Status ==="approved" ?"success" :"warning"} text={loginUser.Status} />
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Quick Actions */}
          <Card title="Quick Actions" style={{ marginBottom: 24 }}>
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<CheckCircleOutlined />}
                  onClick={() => setCheckInModal(true)}
                  disabled={!!todayAttendance && !!todayAttendance.check_in_time}
                >
                  Check In
                </Button>
              </Col>
              <Col xs={24} sm={8}>
                <Button
                  size="large"
                  block
                  icon={<CloseCircleOutlined />}
                  onClick={() => setCheckOutModal(true)}
                  disabled={!todayAttendance || !!todayAttendance.check_out_time}
                >
                  Check Out
                </Button>
              </Col>
              <Col xs={24} sm={8}>
                <Button
                  size="large"
                  block
                  icon={<CalendarOutlined />}
                  onClick={() => setLeaveModal(true)}
                >
                  Apply Leave
                </Button>
              </Col>
            </Row>

            {todayAttendance && (
              <Alert
                message={`Today's Status: ${todayAttendance.status.toUpperCase()}`}
                description={
                  <Space direction="vertical">
                    <Text>Check-In: {moment(todayAttendance.check_in_time,"HH:mm:ss").format("hh:mm A")}</Text>
                    {todayAttendance.check_out_time && (
                      <Text>Check-Out: {moment(todayAttendance.check_out_time,"HH:mm:ss").format("hh:mm A")}</Text>
                    )}
                    {todayAttendance.work_hours && <Text>Work Hours: {todayAttendance.work_hours} hrs</Text>}
                  </Space>
                }
                type={todayAttendance.status ==="present" ?"success" : todayAttendance.status ==="late" ?"warning" :"info"}
                showIcon
                style={{ marginTop: 16 }}
              />
            )}
          </Card>

          {/* Statistics */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={8} lg={4}>
              <Card>
                <Statistic
                  title="Present Days"
                  value={stats.present}
                  valueStyle={{ color:"#3f8600" }}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <Card>
                <Statistic
                  title="Absent Days"
                  value={stats.absent}
                  valueStyle={{ color:"#cf1322" }}
                  prefix={<CloseCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <Card>
                <Statistic
                  title="Half Days"
                  value={stats.halfDay}
                  valueStyle={{ color:"#fa8c16" }}
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <Card>
                <Statistic
                  title="Late Days"
                  value={stats.late}
                  valueStyle={{ color:"#faad14" }}
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <Card>
                <Statistic
                  title="Leaves"
                  value={stats.leaves}
                  valueStyle={{ color:"#1890ff" }}
                  prefix={<CalendarOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <Card>
                <Statistic
                  title="Attendance %"
                  value={stats.attendancePercentage}
                  precision={2}
                  suffix="%"
                  valueStyle={{ color: stats.attendancePercentage >= 75 ?"#3f8600" :"#cf1322" }}
                />
                <Progress
                  percent={stats.attendancePercentage}
                  showInfo={false}
                  strokeColor={stats.attendancePercentage >= 75 ?"#52c41a" :"#ff4d4f"}
                />
              </Card>
            </Col>
          </Row>

          {/* Attendance Records Table */}
          <Card title="Attendance History" extra={<Text type="secondary">Current Month: {moment().format("MMMM YYYY")}</Text>}>
            <Table
              columns={columns}
              dataSource={attendanceRecords}
              rowKey="_id"
              loading={loading}
              pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total ${total} records` }}
              scroll={{ x: 800 }}
            />
          </Card>

          {/* Check-In Modal */}
          <Modal
            title={
              <Space>
                <CheckCircleOutlined style={{ color:"#52c41a" }} />
                Check In
              </Space>
            }
            open={checkInModal}
            onCancel={() => {
              setCheckInModal(false);
              setSelfieFile(null);
            }}
            onOk={handleCheckIn}
            confirmLoading={loading}
            okText="Check In Now"
          >
            <Space direction="vertical" style={{ width:"100%" }} size="large">
              <Alert
                message="Location Tracking"
                description="Your location will be captured for attendance verification."
                type="info"
                showIcon
                icon={<EnvironmentOutlined />}
              />

              <Upload
                listType="picture-card"
                maxCount={1}
                beforeUpload={(file) => {
                  setSelfieFile(file);
                  return false;
                }}
                onRemove={() => setSelfieFile(null)}
                accept="image/*"
              >
                <div>
                  <CameraOutlined />
                  <div style={{ marginTop: 8 }}>Take Selfie (Optional)</div>
                </div>
              </Upload>

              <Text type="secondary">
                Current Time: <strong>{moment().format("hh:mm:ss A")}</strong>
              </Text>
              {location && (
                <Text type="success">
                  Location captured: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </Text>
              )}
            </Space>
          </Modal>

          {/* Check-Out Modal */}
          <Modal
            title={
              <Space>
                <CloseCircleOutlined style={{ color:"#1890ff" }} />
                Check Out
              </Space>
            }
            open={checkOutModal}
            onCancel={() => {
              setCheckOutModal(false);
              setSelfieFile(null);
            }}
            onOk={handleCheckOut}
            confirmLoading={loading}
            okText="Check Out Now"
          >
            <Space direction="vertical" style={{ width:"100%" }} size="large">
              <Alert
                message="Work Summary"
                description={
                  todayAttendance && (
                    <Space direction="vertical">
                      <Text>Check-In Time: {moment(todayAttendance.check_in_time,"HH:mm:ss").format("hh:mm A")}</Text>
                      <Text>
                        Duration: {moment().diff(moment(`${todayAttendance.date} ${todayAttendance.check_in_time}`),"hours", true).toFixed(2)} hours
                      </Text>
                    </Space>
                  )
                }
                type="info"
                showIcon
              />

              <Upload
                listType="picture-card"
                maxCount={1}
                beforeUpload={(file) => {
                  setSelfieFile(file);
                  return false;
                }}
                onRemove={() => setSelfieFile(null)}
                accept="image/*"
              >
                <div>
                  <CameraOutlined />
                  <div style={{ marginTop: 8 }}>Take Selfie (Optional)</div>
                </div>
              </Upload>

              <Text type="secondary">
                Current Time: <strong>{moment().format("hh:mm:ss A")}</strong>
              </Text>
            </Space>
          </Modal>

          {/* Leave Application Modal */}
          <Modal
            title={
              <Space>
                <CalendarOutlined style={{ color:"#1890ff" }} />
                Apply for Leave
              </Space>
            }
            open={leaveModal}
            onCancel={() => {
              setLeaveModal(false);
              leaveForm.resetFields();
            }}
            onOk={() => leaveForm.submit()}
            confirmLoading={loading}
            okText="Submit Application"
            width={600}
          >
            <Form form={leaveForm} layout="vertical" onFinish={handleLeaveApplication}>
              <Form.Item
                name="leave_type"
                label="Leave Type"
                rules={[{ required: true, message:"Please select leave type" }]}
              >
                <Select placeholder="Select leave type">
                  <Select.Option value="sick">Sick Leave</Select.Option>
                  <Select.Option value="casual">Casual Leave</Select.Option>
                  <Select.Option value="earned">Earned Leave</Select.Option>
                  <Select.Option value="maternity">Maternity Leave</Select.Option>
                  <Select.Option value="paternity">Paternity Leave</Select.Option>
                  <Select.Option value="unpaid">Unpaid Leave</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="leave_dates"
                label="Leave Period"
                rules={[{ required: true, message:"Please select leave dates" }]}
              >
                <RangePicker style={{ width:"100%" }} format="DD MMM YYYY" />
              </Form.Item>

              <Form.Item
                name="reason"
                label="Reason"
                rules={[{ required: true, message:"Please provide a reason" }]}
              >
                <Input.TextArea rows={4} placeholder="Explain your reason for leave..." />
              </Form.Item>

              <Alert
                message="Leave Policy"
                description="All leave applications are subject to admin approval. You will be notified via email once processed."
                type="info"
                showIcon
              />
            </Form>
          </Modal>
        </Content>

        <Footer style={{ textAlign:"center" }}>
          <b>© 2026 Draa. All Rights Reserved.</b>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default TeacherAttendance;
