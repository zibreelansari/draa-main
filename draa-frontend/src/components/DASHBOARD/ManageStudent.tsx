import React, { useEffect, useState, useCallback } from"react";
import {
  Table,
  Button,
  Modal,
  message,
  Tag,
  Layout,
  Card,
  Space,
  Tooltip,
  Avatar,
  Row,
  Col,
  Statistic,
  Input,
  Select,
  Typography,
  Descriptions,
} from"antd";
import {
  DeleteOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  ReloadOutlined,
  FilterOutlined,
  ExportOutlined,
  CalendarOutlined,
  CloseCircleOutlined,
  StopOutlined,
} from"@ant-design/icons";
import { useNavigate } from"react-router-dom";
import axios from"axios";
import moment from"moment";
import Topbar from"./Topbar";
import Sidebar2 from"./Sidebar2";
import Sidebar from"./Sidebar";
import url, { getImageUrl } from"../../url";
import { getUserRole, getAuthHeaders } from"../../utils/global_auth";

const { Content, Footer } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

interface Student {
  _id: string;
  name: string;
  email: string;
  phn: string;

  //  NEW STANDARD STATUS
  status:"approved" |"pending" |"rejected";

  createdAt?: string;
  updatedAt?: string;
  profile?: string;
  bio?: string;
  address?: string;
  city?: string;
  state?: string;
}

const ManageStudents: React.FC = () => {
  const navigate = useNavigate();

  const [loginUser, setLoginUser] = useState<any>({});
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });

  //  Check if user is admin (has aname property)
  const isAdmin = useCallback(() => {
    return getUserRole() ==="ADMIN";
  }, []);

  //  Authentication check
  useEffect(() => {
    const role = getUserRole();

    if (role ==="GUEST") {
      message.warning("Please login to continue", 4);
      navigate("/admin-login");
      return;
    }

    if (role !=="ADMIN" && role !=="TEACHER") {
      message.error("Access denied. Admin or Teacher only.", 4);

      if (role ==="STUDENT") {
        navigate("/student-login");
      } else {
        navigate("/admin-login");
      }
      return;
    }

    //  Load logged user safely
    const raw = localStorage.getItem("edudocs");
    if (raw) {
      try {
        setLoginUser(JSON.parse(raw));
      } catch {
        message.error("Session expired. Please login again.");
        navigate("/admin-login");
      }
    }
  }, [navigate]);

  //  Normalize backend student status into approved/pending/rejected
  const normalizeStatus = (student: any):"approved" |"pending" |"rejected" => {
    //  If backend already sends status
    if (student.status) {
      const s = student.status.toLowerCase();
      if (s ==="approved" || s ==="pending" || s ==="rejected") return s;
    }

    //  old backend: Status = Verified / Not Verified
    if (student.Status) {
      const s = student.Status.toLowerCase();
      if (s ==="verified") return"approved";
      if (s ==="approved") return"approved";
      if (s ==="rejected") return"rejected";
      return"pending";
    }

    return"pending";
  };

  //  Fetch students
  const fetchStudents = useCallback(async () => {
    if (!loginUser || Object.keys(loginUser).length === 0) return;

    setLoading(true);
    try {
      const response = await axios.get(`${url}/count/getAllStudents`, { headers: getAuthHeaders() });

      if (Array.isArray(response.data.Users)) {
        const normalizedStudents: Student[] = response.data.Users.map((student: any) => ({
          ...student,
          status: normalizeStatus(student),
        }));

        setStudents(normalizedStudents);
        message.success(`Loaded ${normalizedStudents.length} students successfully`);
      } else {
        setStudents([]);
        message.info("No students found");
      }
    } catch (error: any) {
      console.error("Error fetching students:", error);
      message.error(error.response?.data?.message ||"Failed to fetch student data");
    } finally {
      setLoading(false);
    }
  }, [loginUser]);

  //  Stats
  useEffect(() => {
    const localStats = students.reduce(
      (acc, student) => ({
        total: acc.total + 1,
        approved: acc.approved + (student.status ==="approved" ? 1 : 0),
        pending: acc.pending + (student.status ==="pending" ? 1 : 0),
        rejected: acc.rejected + (student.status ==="rejected" ? 1 : 0),
      }),
      { total: 0, approved: 0, pending: 0, rejected: 0 }
    );

    setStats(localStats);
  }, [students]);

  //  Filter
  //  Filter
  useEffect(() => {
    let filtered = students.filter((student) => {
      // Safely check name, email, and phone
      const matchesSearch =
        (student.name?.toLowerCase() ||"").includes(searchText.toLowerCase()) ||
        (student.email?.toLowerCase() ||"").includes(searchText.toLowerCase()) ||
        (student.phn ? student.phn.toString().includes(searchText) : false); // Safety check here

      const matchesStatus = statusFilter ==="all" || student.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    setFilteredStudents(filtered);
  }, [students, searchText, statusFilter]);

  //  Fetch on auth
  useEffect(() => {
    if (loginUser && Object.keys(loginUser).length > 0) fetchStudents();
  }, [loginUser, fetchStudents]);

  const showStudentDetails = useCallback((student: Student) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  }, []);

  const closeViewModal = useCallback(() => {
    setIsViewModalOpen(false);
    setSelectedStudent(null);
  }, []);

  //  Delete student - With purchase/activity validation
  const handleDelete = useCallback((id: string, name: string) => {
    Modal.confirm({
      title:"Delete Student",
      content: (
        <span>
          Are you sure you want to delete student <strong>"{name}"</strong>?
          <br />
          <span style={{ color:'#ff4d4f', fontSize:'12px' }}>
            Note: Deletion will be blocked if the student has any purchases (courses, test series,
            books, topics) or activity (progress, reviews, wishlists, exam submissions).
          </span>
        </span>
      ),
      okText:"Delete",
      okType:"danger",
      cancelText:"Cancel",
      icon: <DeleteOutlined style={{ color:"#ff4d4f" }} />,
      onOk: async () => {
        setActionLoading(id);
    try {
          const response = await axios.delete(`${url}/deleteStudent/${id}`, { headers: getAuthHeaders() });

          if (response.data.canDelete === false) {
            message.error(response.data.message ||"Cannot delete student with purchases or activity");
            setActionLoading(null);
            return;
          }

          message.success(`Student"${name}" deleted successfully`);
          setStudents((prev) => prev.filter((student) => student._id !== id));
        } catch (error: any) {
          console.error("Delete error:", error);
          if (error.response?.status === 400) {
            message.error(
              error.response.data?.message ||
"Cannot delete student: This student has purchases (courses, test series, books, topics) or activity. Please handle those first."
            );
          } else if (error.response?.status === 401) {
            message.error("Unauthorized. Please login again.");
          } else if (error.response?.status === 404) {
            message.error("Student not found.");
          } else {
            message.error(error.response?.data?.message ||"Failed to delete student");
          }
        } finally {
          setActionLoading(null);
        }
      },
    });
  }, []);

  //  ONE STATUS UPDATE HANDLER
  const updateStatus = useCallback(
    async (id: string, name: string, newStatus:"approved" |"pending" |"rejected") => {
      if (!isAdmin()) {
        message.error("Only admin users can update status");
        return;
      }

      const statusText =
        newStatus ==="approved"
          ?"Approve"
          : newStatus ==="rejected"
            ?"Reject"
            :"Set Pending";

      Modal.confirm({
        title: `${statusText} Student`,
        content: `Are you sure you want to set"${name}" status as"${newStatus.toUpperCase()}" ?`,
        okText:"Confirm",
        cancelText:"Cancel",
        icon:
          newStatus ==="approved" ? (
            <CheckCircleOutlined style={{ color:"#52c41a" }} />
          ) : newStatus ==="rejected" ? (
            <StopOutlined style={{ color:"#ff4d4f" }} />
          ) : (
            <CloseCircleOutlined style={{ color:"#faad14" }} />
          ),
        onOk: async () => {
          setActionLoading(id);
          try {
            //  NEW SINGLE API
            await axios.put(`${url}/users/status/${id}`, { status: newStatus }, { headers: getAuthHeaders() });

            message.success(`Student"${name}" status updated to ${newStatus}`);

            setStudents((prev) =>
              prev.map((s) => (s._id === id ? { ...s, status: newStatus } : s))
            );
          } catch (error: any) {
            console.error("Status update error:", error);
            message.error(error.response?.data?.message ||"Failed to update status");
          } finally {
            setActionLoading(null);
          }
        },
      });
    },
    [isAdmin]
  );

  const clearFilters = useCallback(() => {
    setSearchText("");
    setStatusFilter("all");
  }, []);

  //  Export
  const handleExport = useCallback(() => {
    try {
      const csvContent =
"data:text/csv;charset=utf-8," +
"Name,Email,Phone,Status,Registered\n" +
        students
          .map(
            (student) =>
              `"${student.name}","${student.email}","${student.phn}","${student.status}","${moment(
                student.createdAt
              ).format("YYYY-MM-DD")}"`
          )
          .join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `students_${moment().format("YYYY-MM-DD")}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      message.success("Students data exported successfully!");
    } catch (error) {
      message.error("Export failed");
    }
  }, [students]);

  //  Tag UI for status
  const renderStatusTag = (status: Student["status"]) => {
    if (status ==="approved") {
      return (
        <Tag color="success" icon={<CheckCircleOutlined />}>
          APPROVED
        </Tag>
      );
    }
    if (status ==="rejected") {
      return (
        <Tag color="error" icon={<StopOutlined />}>
          REJECTED
        </Tag>
      );
    }
    return (
      <Tag color="warning" icon={<CloseCircleOutlined />}>
        PENDING
      </Tag>
    );
  };

  const columns = [
    {
      title:"Student Info",
      key:"studentInfo",
      width: 320,
      render: (_: any, record: Student) => (
        <div style={{ display:"flex", alignItems:"center" }}>
          <Avatar src={getImageUrl(record.profile)} icon={<UserOutlined />} size="large" style={{ marginRight: 12 }} />
          <div>
            <Text
              strong
              style={{ fontSize:"14px", color:"#1890ff", cursor:"pointer" }}
              onClick={() => showStudentDetails(record)}
            >
              {record.name}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize:"12px" }}>
              <MailOutlined style={{ marginRight: 4 }} />
              {record.email}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title:"Contact",
      key:"contact",
      width: 180,
      render: (_: any, record: Student) => (
        <div>
          <PhoneOutlined style={{ marginRight: 6, color:"#52c41a" }} />
          <Text style={{ fontSize:"12px" }}>{record.phn}</Text>
        </div>
      ),
    },
    {
      title:"Status",
      key:"status",
      width: 150,
      render: (_: any, record: Student) => renderStatusTag(record.status),
    },
    {
      title:"Registered",
      key:"registered",
      width: 160,
      render: (_: any, record: Student) => (
        <Text style={{ fontSize:"11px" }}>
          <CalendarOutlined style={{ marginRight: 4 }} />
          {record.createdAt ? moment(record.createdAt).format("MMM DD, YYYY") :"N/A"}
        </Text>
      ),
    },
    {
      title:"Actions",
      key:"actions",
      width: 320,
      fixed:"right" as const,
      render: (_: any, record: Student) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button type="default" icon={<EyeOutlined />} size="small" onClick={() => showStudentDetails(record)}>
              View
            </Button>
          </Tooltip>

          {/*  Admin Only Controls */}
          {isAdmin() && (
            <>
              {record.status !=="approved" && (
                <Tooltip title="Approve Student">
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    size="small"
                    loading={actionLoading === record._id}
                    onClick={() => updateStatus(record._id, record.name,"approved")}
                  >
                    Approve
                  </Button>
                </Tooltip>
              )}

              {record.status !=="pending" && (
                <Tooltip title="Set Pending">
                  <Button
                    size="small"
                    loading={actionLoading === record._id}
                    onClick={() => updateStatus(record._id, record.name,"pending")}
                  >
                    Pending
                  </Button>
                </Tooltip>
              )}

              {record.status !=="rejected" && (
                <Tooltip title="Reject Student">
                  <Button
                    danger
                    size="small"
                    icon={<StopOutlined />}
                    loading={actionLoading === record._id}
                    onClick={() => updateStatus(record._id, record.name,"rejected")}
                  >
                    Reject
                  </Button>
                </Tooltip>
              )}
            </>
          )}

          <Tooltip title="Delete Student">
            <Button
              danger
              type="text"
              icon={<DeleteOutlined />}
              size="small"
              loading={actionLoading === record._id}
              onClick={() => handleDelete(record._id, record.name)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (!loginUser || Object.keys(loginUser).length === 0) {
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
      {isAdmin() ? <Sidebar /> : <Sidebar2 />}

      <Layout>
        <Topbar />

        <Content style={{ margin:"24px 16px", padding: 24, background:"#f0f2f5" }}>
          <div style={{ marginBottom: 24 }}>
            <Title level={2} style={{ margin: 0, color:"#1890ff" }}>
              Student Management Dashboard
            </Title>
            <Text type="secondary">Manage student accounts, approvals, and registrations</Text>
          </div>

          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic title="Total Students" value={stats.total} prefix={<UserOutlined />} valueStyle={{ color:"#1890ff" }} />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic title="Approved" value={stats.approved} prefix={<CheckCircleOutlined />} valueStyle={{ color:"#52c41a" }} />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic title="Pending" value={stats.pending} prefix={<CloseCircleOutlined />} valueStyle={{ color:"#faad14" }} />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic title="Rejected" value={stats.rejected} prefix={<StopOutlined />} valueStyle={{ color:"#ff4d4f" }} />
              </Card>
            </Col>
          </Row>

          <Card style={{ marginBottom: 24 }}>
            <Row gutter={16} align="middle">
              <Col xs={24} sm={8} lg={6}>
                <Search placeholder="Search students..." value={searchText} onChange={(e) => setSearchText(e.target.value)} allowClear enterButton />
              </Col>

              <Col xs={12} sm={6} lg={4}>
                <Select value={statusFilter} onChange={setStatusFilter} style={{ width:"100%" }}>
                  <Option value="all">All Status</Option>
                  <Option value="approved">Approved</Option>
                  <Option value="pending">Pending</Option>
                  <Option value="rejected">Rejected</Option>
                </Select>
              </Col>

              <Col xs={24} sm={10} lg={14}>
                <Space>
                  <Button icon={<FilterOutlined />} onClick={clearFilters} disabled={searchText ==="" && statusFilter ==="all"}>
                    Clear
                  </Button>
                  <Button icon={<ReloadOutlined />} onClick={fetchStudents} loading={loading}>
                    Refresh
                  </Button>
                  <Button icon={<ExportOutlined />} onClick={handleExport}>
                    Export
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          {(searchText || statusFilter !=="all") && (
            <Card size="small" style={{ marginBottom: 16, background:"#e6f7ff" }}>
              <Text type="secondary">
                Showing {filteredStudents.length} of {students.length} students
              </Text>
            </Card>
          )}

          <Card title={`Student List (${filteredStudents.length})`} bordered={false}>
            <Table
              rowKey="_id"
              columns={columns}
              dataSource={filteredStudents}
              loading={loading}
              bordered
              scroll={{ x: 1200 }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} students`,
                pageSizeOptions: ["10","20","50"],
              }}
              size="small"
            />
          </Card>

          {/*  MODAL */}
          <Modal
            title={
              <div style={{ display:"flex", alignItems:"center" }}>
                <UserOutlined style={{ marginRight: 8, color:"#1890ff" }} />
                Student Details
              </div>
            }
            open={isViewModalOpen}
            onCancel={closeViewModal}
            width={720}
            centered
            footer={[
              <Button key="close" onClick={closeViewModal}>
                Close
              </Button>,

              isAdmin() && selectedStudent && (
                <Space key="admin-actions">
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    disabled={selectedStudent.status ==="approved"}
                    onClick={() => updateStatus(selectedStudent._id, selectedStudent.name,"approved")}
                  >
                    Approve
                  </Button>

                  <Button
                    disabled={selectedStudent.status ==="pending"}
                    onClick={() => updateStatus(selectedStudent._id, selectedStudent.name,"pending")}
                  >
                    Pending
                  </Button>

                  <Button
                    danger
                    icon={<StopOutlined />}
                    disabled={selectedStudent.status ==="rejected"}
                    onClick={() => updateStatus(selectedStudent._id, selectedStudent.name,"rejected")}
                  >
                    Reject
                  </Button>
                </Space>
              ),
            ]}
          >
            {selectedStudent && (
              <div>
                <div style={{ textAlign:"center", marginBottom: 24 }}>
                  <Avatar src={getImageUrl(selectedStudent.profile)} icon={<UserOutlined />} size={100} style={{ marginBottom: 16 }} />
                  <Title level={3} style={{ margin: 0 }}>
                    {selectedStudent.name}
                  </Title>
                  <div style={{ marginTop: 10 }}>{renderStatusTag(selectedStudent.status)}</div>
                </div>

                <Descriptions column={1} bordered>
                  <Descriptions.Item label={<><UserOutlined style={{ marginRight: 8 }} />Full Name</>}>
                    {selectedStudent.name}
                  </Descriptions.Item>
                  <Descriptions.Item label={<><MailOutlined style={{ marginRight: 8 }} />Email Address</>}>
                    {selectedStudent.email}
                  </Descriptions.Item>
                  <Descriptions.Item label={<><PhoneOutlined style={{ marginRight: 8 }} />Phone Number</>}>
                    {selectedStudent.phn}
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    {renderStatusTag(selectedStudent.status)}
                  </Descriptions.Item>

                  {selectedStudent.address && <Descriptions.Item label="Address">{selectedStudent.address}</Descriptions.Item>}
                  {(selectedStudent.city || selectedStudent.state) && (
                    <Descriptions.Item label="Location">
                      {[selectedStudent.city, selectedStudent.state].filter(Boolean).join(",")}
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label={<><CalendarOutlined style={{ marginRight: 8 }} />Registration Date</>}>
                    {selectedStudent.createdAt ? moment(selectedStudent.createdAt).format("MMMM Do, YYYY [at] h:mm A") :"N/A"}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            )}
          </Modal>
        </Content>

        <Footer style={{ textAlign:"center" }}>
          <Text type="secondary">
            <b>&copy; 2025 Draa. All Rights Reserved.</b>
          </Text>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default ManageStudents;
