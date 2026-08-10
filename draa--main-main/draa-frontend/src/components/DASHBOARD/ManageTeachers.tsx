import React, { useEffect, useState, useCallback, useMemo } from'react';
import {
  Layout,
  Table,
  Button,
  Space,
  message,
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  Typography,
  Tooltip,
  Alert,
  Drawer,
  Descriptions,
  Popconfirm,
  Input,
  Select,
  Avatar,
  Checkbox,
  Divider,
} from'antd';
import {
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  FilterOutlined,
  ExportOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  BookOutlined,
  StarOutlined,
  TagOutlined, //  NEW ICON FOR PROMOCODE
} from'@ant-design/icons';
import { useNavigate } from'react-router-dom';
import axios from'axios';
import moment from'moment';
import Topbar from'./Topbar';
import Sidebar from'./Sidebar';
import url, { getImageUrl } from'../../url';
import { getAuthHeaders } from'../../utils/global_auth';

const { Content, Footer } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

//  UPDATED: Teacher Interface with promocode
interface Teacher {
  _id: string;
  tname: string;
  temail: string;
  tphn: string;
  tspecialization: string;
  texp: number;
  Status:'approved' |'pending' |'rejected' |'suspended';
  tprofile?: string;
  tbio?: string;
  tqualification?: string;
  trating?: number;
  coursesCount?: number;
  studentsCount?: number;
  promocode?: string; //  NEW FIELD
  permissions?: string[]; // NEW FIELD
  createdAt?: string;
  updatedAt?: string;
}

interface Stats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  suspended?: number;
  avgRating: number;
  totalCourses: number;
}

interface LoginUser {
  aname?: string;
  aemail?: string;
  role?: string;
}

const ManageTeachers: React.FC = () => {
  const navigate = useNavigate();

  // State Management
  const [loginUser, setLoginUser] = useState<LoginUser | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modal States
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  //  UPDATED: Filter States - Added promocode filter
  const [searchText, setSearchText] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [specializationFilter, setSpecializationFilter] = useState<string>("all");
  const [promocodeFilter, setPromocodeFilter] = useState<string>("all"); //  NEW FILTER

  // Statistics
  const [stats, setStats] = useState<Stats>({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    suspended: 0,
    avgRating: 0,
    totalCourses: 0,
  });

  //  Authentication Check - Only runs once
  useEffect(() => {
    const userData = localStorage.getItem("edudocs");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (!user.aname) {
          message.error("Access denied. Admin privileges required.");
          navigate("/admin-login");
          return;
        }
        setLoginUser(user);
      } catch (error) {
        message.error("Invalid session. Please login again.");
        navigate("/admin-login");
      }
    } else {
      message.warning("You are not logged in! Please log in first.", 5);
      navigate("/admin-login");
    }
  }, [navigate]);

  //  UPDATED: Fetch Teachers - Using your existing endpoint
  const fetchTeachers = useCallback(async () => {
    if (!loginUser) return;

    setLoading(true);
    try {
      //  Using your existing teacher status route that supports getting all teachers
      console.log('Fetching teachers from:', `${url}/updateTeacherStatus/all`);
      const response = await axios.get(`${url}/updateTeacherStatus/all`, { headers: getAuthHeaders() });
      console.log('Teachers API Response:', response.data);

      if (response.data.success && response.data.data?.teachers) {
        const teacherData = response.data.data.teachers;
        setTeachers(teacherData);
        message.success(`Loaded ${teacherData.length} teachers successfully`);
      } else {
        // Fallback to your original endpoint if the new one doesn't work
        const fallbackResponse = await axios.get(`${url}/count/getAllTeachers`, { headers: getAuthHeaders() });
        const teacherData = fallbackResponse.data.Teachers || [];
        setTeachers(teacherData);

        if (teacherData.length > 0) {
          message.success(`Loaded ${teacherData.length} teachers successfully`);
        } else {
          message.info('No teachers found');
        }
      }
    } catch (error: any) {
      console.error("Error fetching teachers:", error);
      // Try fallback endpoint
      try {
        const fallbackResponse = await axios.get(`${url}/count/getAllTeachers`, { headers: getAuthHeaders() });
        const teacherData = fallbackResponse.data.Teachers || [];
        setTeachers(teacherData);
        if (teacherData.length > 0) {
          message.success(`Loaded ${teacherData.length} teachers successfully`);
        }
      } catch (fallbackError: any) {
        message.error(
          error.response?.data?.message ||"Failed to fetch teachers. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [loginUser]);

  //  UPDATED: Fetch Statistics - Using your new stats endpoint
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      console.log('Fetching stats from:', `${url}/teacher/stats/overview`);
      const response = await axios.get(`${url}/teacher/stats/overview`, { headers: getAuthHeaders() });
      console.log('Teacher Stats Response:', response.data);

      if (response.data.success && response.data.stats) {
        setStats(response.data.stats);
      } else {
        console.warn('Stats API response format unexpected:', response.data);
      }
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      // Don't show error message for stats failure, just use local calculation
    } finally {
      setStatsLoading(false);
    }
  }, []);

  //  Calculate stats locally when teachers change (fallback)
  useEffect(() => {
    if (teachers.length > 0) {
      const localStats = teachers.reduce(
        (acc, teacher) => ({
          total: acc.total + 1,
          approved: acc.approved + (teacher.Status ==='approved' ? 1 : 0),
          pending: acc.pending + (teacher.Status ==='pending' ? 1 : 0),
          rejected: acc.rejected + (teacher.Status ==='rejected' ? 1 : 0),
          suspended: acc.suspended + (teacher.Status ==='suspended' ? 1 : 0),
          avgRating: acc.avgRating + (teacher.trating || 0),
          totalCourses: acc.totalCourses + (teacher.coursesCount || 0),
        }),
        {
          total: 0,
          approved: 0,
          pending: 0,
          rejected: 0,
          suspended: 0,
          avgRating: 0,
          totalCourses: 0,
        }
      );

      // Calculate average rating
      if (localStats.total > 0) {
        localStats.avgRating = localStats.avgRating / localStats.total;
      }

      // Only update stats if API didn't provide them
      setStats(prevStats => {
        if (prevStats.total === 0) {
          return localStats;
        }
        return prevStats;
      });
    }
  }, [teachers]);

  //  Fetch data when loginUser is available
  useEffect(() => {
    if (loginUser?.aname) {
      fetchTeachers();
      fetchStats();
    }
  }, [loginUser?.aname, fetchTeachers, fetchStats]);

  //  UPDATED: Filtering Logic - Added promocode search and filter
  useEffect(() => {
    let filtered = teachers.filter((teacher) => {
      const matchesSearch = teacher.tname.toLowerCase().includes(searchText.toLowerCase()) ||
        teacher.temail.toLowerCase().includes(searchText.toLowerCase()) ||
        teacher.tspecialization?.toLowerCase().includes(searchText.toLowerCase()) ||
        teacher.promocode?.toLowerCase().includes(searchText.toLowerCase()); //  ADDED PROMOCODE SEARCH

      const matchesStatus = statusFilter ==="all" || teacher.Status === statusFilter;
      const matchesSpecialization = specializationFilter ==="all" || teacher.tspecialization === specializationFilter;

      //  NEW: Promocode filter logic
      const matchesPromocode = promocodeFilter ==="all" ||
        (promocodeFilter ==="with_code" && teacher.promocode && teacher.promocode.trim() !=="") ||
        (promocodeFilter ==="without_code" && (!teacher.promocode || teacher.promocode.trim() ===""));

      return matchesSearch && matchesStatus && matchesSpecialization && matchesPromocode;
    });

    setFilteredTeachers(filtered);
  }, [teachers, searchText, statusFilter, specializationFilter, promocodeFilter]); //  ADDED promocodeFilter DEPENDENCY

  //  Delete Handler - With teacher association validation
  const handleDelete = useCallback(async (teacherId: string, teacherName: string) => {
    setActionLoading(teacherId);
    try {
      // Use the correct endpoint: /api/v1/deleteTeacher/:id
      const response = await axios.delete(`${url}/deleteTeacher/${teacherId}`, { headers: getAuthHeaders() });

      if (response.data.canDelete === false) {
        // Teacher has associated content - show the detailed error from backend
        message.error(response.data.message ||"Cannot delete teacher with associated content");
        setActionLoading(null);
        return;
      }

      if (response.status === 200) {
        message.success(`Teacher"${teacherName}" deleted successfully`);
        // Update state directly instead of re-fetching
        setTeachers((prev) => prev.filter((teacher) => teacher._id !== teacherId));
      }
    } catch (error: any) {
      console.error("Delete error:", error);
      // Handle validation error (400) - teacher has associated content
      if (error.response?.status === 400) {
        message.error(
          error.response.data?.message ||
"Cannot delete teacher: This teacher has associated content (courses, test series, live sessions, etc.). Please delete or reassign those items first."
        );
      } else if (error.response?.status === 401) {
        message.error("Unauthorized. Please login again.");
      } else if (error.response?.status === 404) {
        message.error("Teacher not found.");
      } else {
        message.error(
          error.response?.data?.message ||"Failed to delete teacher"
        );
      }
    } finally {
      setActionLoading(null);
    }
  }, []);

  //  UPDATED: Status Update Handler - Using your existing endpoint
  const handleApproval = useCallback(async (teacherId: string, newStatus: string, teacherName: string) => {
    setActionLoading(teacherId);
    try {
      console.log(`Updating teacher ${teacherId} status to ${newStatus}`);

      const response = await axios.put(`${url}/updateTeacherStatus/${teacherId}`, {
        status: newStatus,
        rejectionReason: newStatus ==='rejected' || newStatus ==='suspended'
          ? `Status changed to ${newStatus} by admin`
          : undefined
      }, { headers: getAuthHeaders() });

      console.log('Status update response:', response.data);

      if (response.data.success) {
        message.success(`Teacher"${teacherName}" ${newStatus} successfully`);

        // Update state directly instead of re-fetching
        setTeachers((prev) =>
          prev.map((teacher) =>
            teacher._id === teacherId
              ? { ...teacher, Status: newStatus as Teacher['Status'] }
              : teacher
          )
        );
      } else {
        throw new Error(response.data.message ||'Status update failed');
      }
    } catch (error: any) {
      console.error("Status update error:", error);
      message.error(
        error.response?.data?.message ||"Failed to update teacher status"
      );
    } finally {
      setActionLoading(null);
    }
  }, []);

  //  Unchanged handlers
  const [permissionLoading, setPermissionLoading] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const handlePermissionChange = (checkedValues: any) => {
    setSelectedPermissions(checkedValues);
  };

  const savePermissions = async () => {
    if (!selectedTeacher) return;
    setPermissionLoading(true);
    try {
      const response = await axios.put(`${url}/updateTeacherStatus/${selectedTeacher._id}/permissions`, {
        permissions: selectedPermissions
      }, { headers: getAuthHeaders() });

      if (response.data.success) {
        message.success("Permissions updated successfully");
        setTeachers(prev => prev.map(t => 
          t._id === selectedTeacher._id ? { ...t, permissions: selectedPermissions } : t
        ));
        setSelectedTeacher(prev => prev ? { ...prev, permissions: selectedPermissions } : null);
      }
    } catch (error: any) {
      message.error(error.response?.data?.message ||"Failed to update permissions");
    } finally {
      setPermissionLoading(false);
    }
  };

  const showTeacherDetails = useCallback((teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setSelectedPermissions(teacher.permissions || []);
    setIsDetailDrawerOpen(true);
  }, []);

  //  UPDATED: Clear filters - Added promocode filter
  const clearFilters = useCallback(() => {
    setSearchText("");
    setStatusFilter("all");
    setSpecializationFilter("all");
    setPromocodeFilter("all"); //  ADDED PROMOCODE FILTER RESET
  }, []);

  //  UPDATED: Export with promocode included
  const handleExport = useCallback(async () => {
    try {
      message.loading('Preparing export...', 2);

      try {
        // Try dedicated export endpoint first
        const response = await axios.get(`${url}/teacher/export`, {
          responseType:'blob',
          headers: getAuthHeaders()
        });

        const blob = new Blob([response.data]);
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `teachers-export-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        message.success('Teachers exported successfully!');
      } catch (error) {
        //  UPDATED: Fallback CSV export with promocode
        const csvContent ="data:text/csv;charset=utf-8,"
          +"Name,Email,Phone,Specialization,Experience,Promocode,Status,Created\n" //  ADDED PROMOCODE COLUMN
          + teachers.map(teacher =>
            `"${teacher.tname}","${teacher.temail}","${teacher.tphn}","${teacher.tspecialization}",${teacher.texp},"${teacher.promocode ||'N/A'}","${teacher.Status}","${moment(teacher.createdAt).format('YYYY-MM-DD')}"`
          ).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `teachers_${moment().format('YYYY-MM-DD')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        message.success('Teachers data exported as CSV successfully!');
      }
    } catch (error: any) {
      console.error('Export error:', error);
      message.error('Failed to export teachers');
    }
  }, [teachers]);

  //  Manual refresh function
  const handleRefresh = useCallback(async () => {
    await Promise.all([fetchTeachers(), fetchStats()]);
  }, [fetchTeachers, fetchStats]);

  //  UPDATED: Table Columns - Added promocode column
  const columns = [
    {
      title:"Teacher Info",
      key:"teacherInfo",
      width: 280,
      render: (_: any, record: Teacher) => (
        <div>
          <div style={{ display:"flex", alignItems:"center", marginBottom: 8 }}>
            <Avatar
              src={getImageUrl(record.tprofile ||'')}
              icon={<UserOutlined />}
              size="large"
              style={{ marginRight: 12 }}
            />
            <div>
              <Text strong style={{ fontSize:"14px", color:"#1890ff", cursor:"pointer" }}
                onClick={() => showTeacherDetails(record)}>
                {record.tname}
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize:"12px" }}>
                <MailOutlined /> {record.temail}
              </Text>
            </div>
          </div>
        </div>
      ),
    },
    {
      title:"Contact & Details",
      key:"details",
      width: 180,
      render: (_: any, record: Teacher) => (
        <Space direction="vertical" size="small">
          <div>
            <PhoneOutlined style={{ marginRight: 4, color:"#52c41a" }} />
            <Text style={{ fontSize:"12px" }}>{record.tphn}</Text>
          </div>
          <div>
            <BookOutlined style={{ marginRight: 4, color:"#722ed1" }} />
            <Text style={{ fontSize:"12px" }}>{record.tspecialization}</Text>
          </div>
          <div>
            <StarOutlined style={{ marginRight: 4, color:"#faad14" }} />
            <Text style={{ fontSize:"12px" }}>{record.texp} years exp</Text>
          </div>
        </Space>
      ),
    },
    //  NEW COLUMN: Promocode
    // {
    //   title:"Promocode",
    //   key:"promocode",
    //   width: 120,
    //   render: (_: any, record: Teacher) => (
    //     <div style={{ textAlign:'center' }}>
    //       {record.promocode && record.promocode.trim() ? (
    //         <Tooltip title={`Promocode: ${record.promocode}`}>
    //           <Tag 
    //             color="blue" 
    //             icon={<TagOutlined />}
    //             style={{ 
    //               fontWeight:'bold',
    //               fontSize:'11px',
    //               padding:'2px 8px',
    //               border:'1px solid #1890ff',
    //               cursor:'pointer'
    //             }}
    //           >
    //             {record.promocode}
    //           </Tag>
    //         </Tooltip>
    //       ) : (
    //         <Text type="secondary" style={{ fontSize:"11px", fontStyle:'italic' }}>
    //           No Code
    //         </Text>
    //       )}
    //     </div>
    //   ),
    // },
    {
      title:"Status",
      key:"status",
      width: 110,
      render: (_: any, record: Teacher) => {
        const statusColors = {
          approved:'success',
          pending:'warning',
          rejected:'error',
          suspended:'error'
        };
        const statusIcons = {
          approved: <CheckCircleOutlined />,
          pending: <ClockCircleOutlined />,
          rejected: <ClockCircleOutlined />,
          suspended: <ClockCircleOutlined />
        };

        return (
          <Tag
            color={statusColors[record.Status]}
            icon={statusIcons[record.Status]}
          >
            {record.Status.toUpperCase()}
          </Tag>
        );
      },
    },

    {
      title:"Date",
      key:"date",
      width: 110,
      render: (_: any, record: Teacher) => (
        <Space direction="vertical" size="small">
          <Text style={{ fontSize:"11px" }}>
            Joined: {record.createdAt ? moment(record.createdAt).format("MM/DD/YY") :"N/A"}
          </Text>
          {record.updatedAt && record.updatedAt !== record.createdAt && (
            <Text style={{ fontSize:"11px" }}>
              Updated: {moment(record.updatedAt).format("MM/DD/YY")}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title:"Actions",
      key:"actions",
      width: 200,
      fixed:'right' as const,
      render: (_: any, record: Teacher) => (
        <Space size="small" wrap>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => showTeacherDetails(record)}
            />
          </Tooltip>

          <Tooltip title="View Profile">
            <Button
              type="text"
              icon={<UserOutlined />}
              size="small"
              onClick={() => window.open(`/teacherProfile/${record._id}`,'_blank')}
            />
          </Tooltip>

          <Select
            value={record.Status}
            size="small"
            style={{ width: 100 }}
            onChange={(value) => handleApproval(record._id, value, record.tname)}
            loading={actionLoading === record._id}
          >
            <Option value="approved">Approve</Option>
            <Option value="pending">Pending</Option>
            <Option value="rejected">Reject</Option>
            <Option value="suspended">Suspend</Option>
          </Select>

          <Popconfirm
            title="Delete Teacher"
            description={
              <span>
                Are you sure you want to delete <strong>"{record.tname}"</strong>?
                <br />
                <span style={{ color:'#ff4d4f', fontSize:'12px' }}>
                  Note: Deletion will be blocked if the teacher has any courses, test series,
                  live sessions, assignments, PYQs, syllabi, or other content.
                </span>
              </span>
            }
            onConfirm={() => handleDelete(record._id, record.tname)}
            okText="Delete"
            cancelText="Cancel"
            okType="danger"
            placement="topRight"
          >
            <Button
              danger
              type="text"
              icon={<DeleteOutlined />}
              size="small"
              loading={actionLoading === record._id}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  //  Unchanged memoized values
  const uniqueSpecializations = useMemo(() =>
    [...new Set(teachers.map(teacher => teacher.tspecialization).filter(Boolean))], [teachers]
  );

  //  Unchanged auth guard
  if (!loginUser?.aname) {
    return (
      <Layout style={{ minHeight:"100vh" }}>
        <Content style={{ display:'flex', justifyContent:'center', alignItems:'center' }}>
          <Alert
            message="Access Denied"
            description="Admin privileges required to access this page."
            type="error"
            showIcon
          />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight:"100vh" }}>
      <Sidebar />
      <Layout>
        <Topbar />
        <Content style={{ margin:"24px 16px", padding: 24 }}>
          {/* Header Section */}
          <div style={{ marginBottom: 24 }}>
            <Title level={2} style={{ margin: 0, color:"#1890ff" }}>
              Teacher Management Dashboard
            </Title>
            <Text type="secondary">
              Manage teacher profiles, approvals, and monitor performance
            </Text>
          </div>

          {/* Statistics Cards - UPDATED: Added suspended count */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Teachers"
                  value={stats.total}
                  prefix={<UserOutlined />}
                  valueStyle={{ color:"#1890ff" }}
                  loading={statsLoading}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Approved"
                  value={stats.approved}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color:"#52c41a" }}
                  loading={statsLoading}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Pending Approval"
                  value={stats.pending}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color:"#faad14" }}
                  loading={statsLoading}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Average Rating"
                  value={stats.avgRating}
                  prefix=""
                  precision={1}
                  valueStyle={{ color:"#722ed1" }}
                  loading={statsLoading}
                />
              </Card>
            </Col>
          </Row>

          {/*  UPDATED: Filters and Actions - Added promocode filter */}
          <Card style={{ marginBottom: 24 }}>
            <Row gutter={16} align="middle">
              <Col xs={24} sm={8} lg={5}>
                <Search
                  placeholder="Search teachers, emails, promocodes..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                />
              </Col>
              <Col xs={12} sm={4} lg={3}>
                <Select
                  value={statusFilter}
                  onChange={setStatusFilter}
                  placeholder="Status"
                  style={{ width:"100%" }}
                >
                  <Option value="all">All Status</Option>
                  <Option value="approved">Approved</Option>
                  <Option value="pending">Pending</Option>
                  <Option value="rejected">Rejected</Option>
                  <Option value="suspended">Suspended</Option>
                </Select>
              </Col>
              <Col xs={12} sm={4} lg={3}>
                <Select
                  value={specializationFilter}
                  onChange={setSpecializationFilter}
                  placeholder="Specialization"
                  style={{ width:"100%" }}
                >
                  <Option value="all">All Specializations</Option>
                  {uniqueSpecializations.map(spec => (
                    <Option key={spec} value={spec}>{spec}</Option>
                  ))}
                </Select>
              </Col>
              {/*  NEW: Promocode Filter */}
              {/* <Col xs={12} sm={4} lg={3}>
                <Select
                  value={promocodeFilter}
                  onChange={setPromocodeFilter}
                  placeholder="Promocode"
                  style={{ width:"100%" }}
                >
                  <Option value="all">All</Option>
                  <Option value="with_code">With Code</Option>
                  <Option value="without_code">No Code</Option>
                </Select>
              </Col> */}
              <Col xs={24} sm={8} lg={8}>
                <Space wrap>
                  <Button
                    icon={<FilterOutlined />}
                    onClick={clearFilters}
                    disabled={searchText ==="" && statusFilter ==="all" && specializationFilter ==="all" && promocodeFilter ==="all"}
                  >
                    Clear
                  </Button>
                  {/* <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => navigate("/teacher-register")}
                  >
                    Add Teacher
                  </Button> */}
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={handleRefresh}
                    loading={loading || statsLoading}
                  >
                    Refresh
                  </Button>
                  <Button
                    icon={<ExportOutlined />}
                    onClick={handleExport}
                  >
                    Export
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Results Summary */}
          {(searchText || statusFilter !=="all" || specializationFilter !=="all" || promocodeFilter !=="all") && (
            <Alert
              message={`Showing ${filteredTeachers.length} of ${teachers.length} teachers`}
              type="info"
              showIcon
              closable={false}
              style={{ marginBottom: 16 }}
            />
          )}

          {/* Main Table */}
          <Card title={`Teacher List (${filteredTeachers.length})`} bordered={false}>
            <Table
              rowKey="_id"
              dataSource={filteredTeachers}
              columns={columns}
              loading={loading}
              bordered
              scroll={{ x: 1300 }} //  UPDATED: Increased scroll width for new column
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} teachers`,
                pageSizeOptions: ['10','20','50','100'],
              }}
              size="small"
            />
          </Card>

          {/*  UPDATED: Teacher Details Drawer - Added promocode display */}
          <Drawer
            title="Teacher Details"
            placement="right"
            width={600}
            onClose={() => setIsDetailDrawerOpen(false)}
            open={isDetailDrawerOpen}
          >
            {selectedTeacher && (
              <div>
                <div style={{ textAlign:'center', marginBottom: 24 }}>
                  <Avatar
                    src={getImageUrl(selectedTeacher.tprofile ||'')}
                    icon={<UserOutlined />}
                    size={80}
                  />
                  <Title level={4} style={{ margin:'8px 0' }}>
                    {selectedTeacher.tname}
                  </Title>
                  <Tag
                    color={selectedTeacher.Status ==='approved' ?'success' :
                      selectedTeacher.Status ==='pending' ?'warning' :'error'}
                    style={{ marginBottom: 16 }}
                  >
                    {selectedTeacher.Status.toUpperCase()}
                  </Tag>
                  {/*  NEW: Promocode display in header */}
                  {selectedTeacher.promocode && selectedTeacher.promocode.trim() && (
                    <div style={{ marginTop: 8 }}>
                      <Tag color="blue" icon={<TagOutlined />} style={{ fontSize:'12px', padding:'4px 12px' }}>
                        PROMOCODE: {selectedTeacher.promocode}
                      </Tag>
                    </div>
                  )}
                </div>

                <Descriptions column={1} bordered>
                  <Descriptions.Item label="Full Name">
                    {selectedTeacher.tname}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    {selectedTeacher.temail}
                  </Descriptions.Item>
                  <Descriptions.Item label="Phone">
                    {selectedTeacher.tphn}
                  </Descriptions.Item>
                  <Descriptions.Item label="Specialization">
                    {selectedTeacher.tspecialization}
                  </Descriptions.Item>
                  <Descriptions.Item label="Experience">
                    {selectedTeacher.texp} years
                  </Descriptions.Item>
                  {/*  NEW: Promocode as description item */}
                  <Descriptions.Item label="Promocode">
                    {selectedTeacher.promocode && selectedTeacher.promocode.trim() ? (
                      <Tag color="blue" icon={<TagOutlined />} style={{ fontWeight:'bold' }}>
                        {selectedTeacher.promocode}
                      </Tag>
                    ) : (
                      <Text type="secondary" style={{ fontStyle:'italic' }}>
                        No promocode provided
                      </Text>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Qualification">
                    {selectedTeacher.tqualification ||"Not specified"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Bio">
                    {selectedTeacher.tbio ||"No bio available"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Rating">
                    {selectedTeacher.trating ? ` ${selectedTeacher.trating}/5.0` :'No ratings yet'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Courses">
                    {selectedTeacher.coursesCount || 0} courses
                  </Descriptions.Item>
                  <Descriptions.Item label="Students">
                    {selectedTeacher.studentsCount || 0} students
                  </Descriptions.Item>
                  <Descriptions.Item label="Joined">
                    {selectedTeacher.createdAt ? moment(selectedTeacher.createdAt).format("LLLL") :"N/A"}
                  </Descriptions.Item>
                  {selectedTeacher.updatedAt && (
                    <Descriptions.Item label="Last Updated">
                      {moment(selectedTeacher.updatedAt).format("LLLL")}
                    </Descriptions.Item>
                  )}
                </Descriptions>

                <Divider orientation="left">Role-Based Access Control (Permissions)</Divider>
                <div style={{ marginBottom: 24, padding:'0 12px' }}>
                  <Text type="secondary" style={{ display:'block', marginBottom: 12 }}>
                    Grant or revoke access to specific dashboard sections for this teacher.
                  </Text>
                  <Checkbox.Group 
                    style={{ width:'100%' }} 
                    value={selectedPermissions}
                    onChange={handlePermissionChange}
                  >
                    <Row gutter={[16, 16]}>
                      <Col span={12}><Checkbox value="Manage Courses">Manage Courses</Checkbox></Col>
                      <Col span={12}><Checkbox value="Manage Exams">Manage Exams</Checkbox></Col>
                      <Col span={12}><Checkbox value="Manage Books">Manage Books</Checkbox></Col>
                      <Col span={12}><Checkbox value="Manage Jobs">Manage Jobs</Checkbox></Col>
                      <Col span={12}><Checkbox value="Manage Live Sessions">Live Sessions</Checkbox></Col>
                      <Col span={12}><Checkbox value="Manage Test Series">Test Series</Checkbox></Col>
                      <Col span={12}><Checkbox value="Manage Exam Sections">Exam Sections</Checkbox></Col>
                      <Col span={12}><Checkbox value="My Attendance">My Attendance</Checkbox></Col>
                      <Col span={12}><Checkbox value="Manage Videography">Manage Videography</Checkbox></Col>
                    </Row>
                  </Checkbox.Group>
                  <div style={{ marginTop: 16 }}>
                    <Button 
                      type="primary" 
                      onClick={savePermissions} 
                      loading={permissionLoading}
                      size="small"
                    >
                      Update Permissions
                    </Button>
                  </div>
                </div>

                <div style={{ marginTop: 24 }}>
                  <Space>
                    <Button
                      type="primary"
                      icon={<UserOutlined />}
                      onClick={() => {
                        window.open(`/teacherProfile/${selectedTeacher._id}`,'_blank');
                        setIsDetailDrawerOpen(false);
                      }}
                    >
                      View Full Profile
                    </Button>
                    <Button
                      type={selectedTeacher.Status ==='approved' ?"default" :"primary"}
                      icon={selectedTeacher.Status ==='approved' ? <ClockCircleOutlined /> : <CheckCircleOutlined />}
                      onClick={() => handleApproval(
                        selectedTeacher._id,
                        selectedTeacher.Status ==='approved' ?'pending' :'approved',
                        selectedTeacher.tname
                      )}
                      loading={actionLoading === selectedTeacher._id}
                    >
                      {selectedTeacher.Status ==='approved' ?'Set Pending' :'Approve'}
                    </Button>
                  </Space>
                </div>
              </div>
            )}
          </Drawer>
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

export default ManageTeachers;
