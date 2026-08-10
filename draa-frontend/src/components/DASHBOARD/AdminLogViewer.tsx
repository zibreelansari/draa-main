import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  Button,
  Tag,
  Layout,
  Card,
  Space,
  Row,
  Col,
  Statistic,
  Input,
  Select,
  Typography,
  Drawer,
  Descriptions,
  message,
  Tooltip
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  FilterOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  FileTextOutlined,
  GlobalOutlined,
  DashboardOutlined,
  ShoppingOutlined,
  CloudUploadOutlined,
  SafetyCertificateOutlined,
  ExportOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import url from "../../url";
import { getUserRole, getAuthHeaders } from "../../utils/global_auth";
import socket from "../../utils/socket";

const { Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface LogEntry {
  _id: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  userRole: "student" | "teacher" | "admin" | "guest";
  actionType: "page_visit" | "purchase" | "upload" | "auth" | "api_hit" | "system_event" | "other";
  description: string;
  status: "success" | "failure";
  ipAddress: string;
  userAgent: string;
  metadata: any;
  timestamp: string;
  createdAt: string;
}

interface LogStats {
  total: number;
  success: number;
  failure: number;
  successRate: number;
  actions: {
    page_visit: number;
    purchase: number;
    upload: number;
    auth: number;
    api_hit: number;
    system_event: number;
    other: number;
  };
}

const AdminLogViewer: React.FC = () => {
  const navigate = useNavigate();

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalLogs, setTotalLogs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Stats State
  const [logStats, setLogStats] = useState<LogStats>({
    total: 0,
    success: 0,
    failure: 0,
    successRate: 100,
    actions: {
      page_visit: 0,
      purchase: 0,
      upload: 0,
      auth: 0,
      api_hit: 0,
      system_event: 0,
      other: 0
    }
  });

  // Filter States
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Drawer Detail State
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  // Authentication guard
  useEffect(() => {
    const role = getUserRole();
    if (role !== "ADMIN") {
      message.error("Access denied. Admin privileges required.", 4);
      navigate("/admin-login");
    }
  }, [navigate]);

  // Fetch log statistics
  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get(`${url}/admin/logs/stats`, {
        headers: getAuthHeaders()
      });
      if (response.data.success) {
        setLogStats(response.data.stats);
      }
    } catch (error: any) {
      console.error("Failed to fetch log statistics:", error);
    }
  }, []);

  // Fetch Paginated Logs
  const fetchLogs = useCallback(async (page: number, size: number) => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: size
      };

      if (searchText.trim() !== "") params.search = searchText.trim();
      if (roleFilter !== "all") params.userRole = roleFilter;
      if (actionFilter !== "all") params.actionType = actionFilter;
      if (statusFilter !== "all") params.status = statusFilter;

      const response = await axios.get(`${url}/admin/logs`, {
        params,
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        setLogs(response.data.logs);
        setTotalLogs(response.data.pagination.total);
      }
    } catch (error: any) {
      console.error("Failed to fetch logs:", error);
      message.error(error.response?.data?.message || "Failed to load application logs");
    } finally {
      setLoading(false);
    }
  }, [searchText, roleFilter, actionFilter, statusFilter]);

  // Handle Load/Refresh
  const handleRefresh = () => {
    fetchStats();
    fetchLogs(currentPage, pageSize);
  };

  useEffect(() => {
    fetchStats();
    fetchLogs(currentPage, pageSize);
  }, [currentPage, pageSize, searchText, roleFilter, actionFilter, statusFilter, fetchStats, fetchLogs]);

  // Connect to socket and listen for live activity logs
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleNewLog = (newLog: LogEntry) => {
      // 1. Check if filters match the new log. If yes (or filter is 'all'), append it.
      const searchLower = searchText.toLowerCase().trim();
      const matchesSearch =
        searchLower === "" ||
        (newLog.userName && newLog.userName.toLowerCase().includes(searchLower)) ||
        (newLog.userEmail && newLog.userEmail.toLowerCase().includes(searchLower)) ||
        (newLog.description && newLog.description.toLowerCase().includes(searchLower)) ||
        (newLog.ipAddress && newLog.ipAddress.toLowerCase().includes(searchLower));

      const matchesRole = roleFilter === "all" || newLog.userRole === roleFilter;
      const matchesAction = actionFilter === "all" || newLog.actionType === actionFilter;
      const matchesStatus = statusFilter === "all" || newLog.status === statusFilter;

      if (matchesSearch && matchesRole && matchesAction && matchesStatus) {
        setLogs((prev) => [newLog, ...prev]);
        setTotalLogs((prev) => prev + 1);
      }

      // 2. Dynamically update dashboard statistics
      setLogStats((prev) => {
        const isSuccess = newLog.status === "success";
        const newTotal = prev.total + 1;
        const newSuccess = prev.success + (isSuccess ? 1 : 0);
        const newFailure = prev.failure + (isSuccess ? 0 : 1);

        const actions = { ...prev.actions };
        if (newLog.actionType in actions) {
          const actionKey = newLog.actionType as keyof typeof actions;
          actions[actionKey] = (actions[actionKey] || 0) + 1;
        }

        return {
          total: newTotal,
          success: newSuccess,
          failure: newFailure,
          successRate: newTotal > 0 ? Math.round((newSuccess / newTotal) * 100) : 100,
          actions,
        };
      });

      // Show real-time feedback toast
      message.info(`New Activity: ${newLog.description}`);
    };

    socket.on("new_activity_log", handleNewLog);

    return () => {
      socket.off("new_activity_log", handleNewLog);
    };
  }, [searchText, roleFilter, actionFilter, statusFilter]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchText("");
    setRoleFilter("all");
    setActionFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  // Export logs to CSV
  const handleExportCSV = () => {
    try {
      const headers = ["Timestamp", "User Name", "User Email", "Role", "Action Type", "Status", "Description", "IP Address", "User Agent"];
      const rows = logs.map(log => [
        moment(log.timestamp).format("YYYY-MM-DD HH:mm:ss"),
        log.userName || "N/A",
        log.userEmail || "N/A",
        log.userRole.toUpperCase(),
        log.actionType.toUpperCase(),
        log.status.toUpperCase(),
        `"${log.description.replace(/"/g, '""')}"`,
        log.ipAddress,
        `"${log.userAgent.replace(/"/g, '""')}"`
      ]);

      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `app_activity_logs_${moment().format("YYYYMMDD_HHmmss")}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      message.success("Successfully exported logs page data to CSV!");
    } catch (err) {
      message.error("Failed to export logs data");
    }
  };

  // Helper styles for Action badges
  const renderActionBadge = (action: LogEntry["actionType"]) => {
    switch (action) {
      case "page_visit":
        return <Tag color="cyan" icon={<GlobalOutlined />}>PAGE VISIT</Tag>;
      case "purchase":
        return <Tag color="gold" icon={<ShoppingOutlined />}>PURCHASE</Tag>;
      case "upload":
        return <Tag color="purple" icon={<CloudUploadOutlined />}>UPLOAD</Tag>;
      case "auth":
        return <Tag color="blue" icon={<SafetyCertificateOutlined />}>AUTH</Tag>;
      case "system_event":
        return <Tag color="magenta" icon={<DashboardOutlined />}>SYSTEM</Tag>;
      case "api_hit":
        return <Tag color="orange" icon={<FileTextOutlined />}>API HIT</Tag>;
      default:
        return <Tag color="default">OTHER</Tag>;
    }
  };

  // Helper styles for user role badge
  const renderRoleBadge = (role: LogEntry["userRole"]) => {
    switch (role) {
      case "admin":
        return <Tag color="red">ADMIN</Tag>;
      case "teacher":
        return <Tag color="blue">TEACHER</Tag>;
      case "student":
        return <Tag color="green">STUDENT</Tag>;
      default:
        return <Tag color="orange">GUEST</Tag>;
    }
  };

  // Table structure
  const columns = [
    {
      title: "Time",
      key: "time",
      width: 150,
      render: (_: any, record: LogEntry) => (
        <Tooltip title={moment(record.timestamp).format("LLLL")}>
          <Text style={{ fontSize: "12px" }}>
            {moment(record.timestamp).fromNow()}
          </Text>
        </Tooltip>
      )
    },
    {
      title: "User Info",
      key: "userInfo",
      width: 250,
      render: (_: any, record: LogEntry) => (
        <div>
          {record.userName ? (
            <div>
              <Text strong style={{ fontSize: "13px" }}>{record.userName}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: "11px" }}>{record.userEmail}</Text>
            </div>
          ) : (
            <Text type="secondary" italic style={{ fontSize: "12px" }}>Anonymous / Guest</Text>
          )}
          <div style={{ marginTop: 4 }}>
            {renderRoleBadge(record.userRole)}
          </div>
        </div>
      )
    },
    {
      title: "Action Type",
      dataIndex: "actionType",
      key: "actionType",
      width: 130,
      render: (value: LogEntry["actionType"]) => renderActionBadge(value)
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (text: string) => (
        <Text style={{ fontSize: "13px" }} strong={text.includes("purchased") || text.includes("uploaded")}>
          {text}
        </Text>
      )
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: LogEntry["status"]) => (
        status === "success" ? (
          <Tag color="success" icon={<CheckCircleOutlined />}>SUCCESS</Tag>
        ) : (
          <Tag color="error" icon={<CloseCircleOutlined />}>FAILURE</Tag>
        )
      )
    },
    {
      title: "Action",
      key: "view",
      width: 80,
      fixed: "right" as const,
      render: (_: any, record: LogEntry) => (
        <Button
          type="default"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => {
            setSelectedLog(record);
            setDrawerVisible(true);
          }}
        >
          Details
        </Button>
      )
    }
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar />

      <Layout>
        <Topbar />

        <Content style={{ margin: "24px 16px", padding: 24, background: "#f0f2f5" }}>
          {/* Header */}
          <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
                Application Logs & Audits
              </Title>
              <Text type="secondary">Monitor user navigation, uploads, payments, and system integrity in real-time</Text>
            </div>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
                Refresh
              </Button>
              <Button type="primary" icon={<ExportOutlined />} onClick={handleExportCSV}>
                Export Page Logs
              </Button>
            </Space>
          </div>

          {/* Statistics Grid */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={4}>
              <Card bordered={false}>
                <Statistic
                  title="Total Events Logged"
                  value={logStats.total}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={4}>
              <Card bordered={false}>
                <Statistic
                  title="System Success Rate"
                  value={logStats.successRate}
                  suffix="%"
                  valueStyle={{ color: logStats.successRate > 95 ? "#52c41a" : "#faad14" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={4}>
              <Card bordered={false}>
                <Statistic
                  title="Page Views"
                  value={logStats.actions.page_visit}
                  valueStyle={{ color: "#13c2c2" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={4}>
              <Card bordered={false}>
                <Statistic
                  title="Purchases"
                  value={logStats.actions.purchase}
                  valueStyle={{ color: "#faad14" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={4}>
              <Card bordered={false}>
                <Statistic
                  title="Teacher Uploads"
                  value={logStats.actions.upload}
                  valueStyle={{ color: "#722ed1" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={4}>
              <Card bordered={false}>
                <Statistic
                  title="Errors / Failures"
                  value={logStats.failure}
                  valueStyle={{ color: logStats.failure > 0 ? "#ff4d4f" : "#8c8c8c" }}
                />
              </Card>
            </Col>
          </Row>

          {/* Filter Panel */}
          <Card style={{ marginBottom: 24 }} bordered={false}>
            <Row gutter={16} align="middle">
              <Col xs={24} md={6}>
                <Input
                  prefix={<SearchOutlined />}
                  placeholder="Search logs (name, email, desc, IP)..."
                  value={searchText}
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    setCurrentPage(1);
                  }}
                  allowClear
                />
              </Col>
              <Col xs={12} md={4}>
                <Select
                  value={roleFilter}
                  onChange={(val) => {
                    setRoleFilter(val);
                    setCurrentPage(1);
                  }}
                  style={{ width: "100%" }}
                >
                  <Option value="all">All User Roles</Option>
                  <Option value="admin">Admin Only</Option>
                  <Option value="teacher">Teacher Only</Option>
                  <Option value="student">Student Only</Option>
                  <Option value="guest">Guest / Anon</Option>
                </Select>
              </Col>
              <Col xs={12} md={4}>
                <Select
                  value={actionFilter}
                  onChange={(val) => {
                    setActionFilter(val);
                    setCurrentPage(1);
                  }}
                  style={{ width: "100%" }}
                >
                  <Option value="all">All Action Types</Option>
                  <Option value="page_visit">Page Visit</Option>
                  <Option value="purchase">Purchase</Option>
                  <Option value="upload">Upload</Option>
                  <Option value="auth">Auth Event</Option>
                  <Option value="api_hit">API Endpoint Hits</Option>
                  <Option value="system_event">System Audits</Option>
                  <Option value="other">Other Activity</Option>
                </Select>
              </Col>
              <Col xs={12} md={4}>
                <Select
                  value={statusFilter}
                  onChange={(val) => {
                    setStatusFilter(val);
                    setCurrentPage(1);
                  }}
                  style={{ width: "100%" }}
                >
                  <Option value="all">All Statuses</Option>
                  <Option value="success">Success Only</Option>
                  <Option value="failure">Failure Only</Option>
                </Select>
              </Col>
              <Col xs={12} md={6}>
                <Button
                  icon={<FilterOutlined />}
                  onClick={handleResetFilters}
                  disabled={
                    searchText === "" &&
                    roleFilter === "all" &&
                    actionFilter === "all" &&
                    statusFilter === "all"
                  }
                  style={{ width: "100%" }}
                >
                  Clear Filters
                </Button>
              </Col>
            </Row>
          </Card>

          {/* Logs Table */}
          <Card bordered={false}>
            <Table
              rowKey="_id"
              dataSource={logs}
              columns={columns}
              loading={loading}
              bordered
              size="middle"
              scroll={{ x: 1200 }}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: totalLogs,
                showSizeChanger: true,
                showQuickJumper: true,
                pageSizeOptions: ["10", "20", "50", "100"],
                onChange: (page, size) => {
                  setCurrentPage(page);
                  setPageSize(size || 20);
                },
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} logs`
              }}
            />
          </Card>
        </Content>

        {/* Log Inspect Drawer */}
        <Drawer
          title={
            <Space>
              <FileTextOutlined style={{ color: "#1890ff" }} />
              <span>Log Event Details</span>
            </Space>
          }
          placement="right"
          width={650}
          onClose={() => {
            setDrawerVisible(false);
            setSelectedLog(null);
          }}
          open={drawerVisible}
        >
          {selectedLog && (
            <div>
              <Descriptions title="Summary Information" bordered column={1} size="small" style={{ marginBottom: 24 }}>
                <Descriptions.Item label="Event ID">{selectedLog._id}</Descriptions.Item>
                <Descriptions.Item label="Timestamp">
                  {moment(selectedLog.timestamp).format("LLLL")} ({moment(selectedLog.timestamp).fromNow()})
                </Descriptions.Item>
                <Descriptions.Item label="User Role">
                  {renderRoleBadge(selectedLog.userRole)}
                </Descriptions.Item>
                <Descriptions.Item label="Action Category">
                  {renderActionBadge(selectedLog.actionType)}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  {selectedLog.status === "success" ? (
                    <Tag color="success">SUCCESS</Tag>
                  ) : (
                    <Tag color="error">FAILURE</Tag>
                  )}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions title="Actor Profile" bordered column={1} size="small" style={{ marginBottom: 24 }}>
                <Descriptions.Item label="User ID">{selectedLog.userId || "N/A"}</Descriptions.Item>
                <Descriptions.Item label="User Name">{selectedLog.userName || "Guest / Anonymous"}</Descriptions.Item>
                <Descriptions.Item label="User Email">{selectedLog.userEmail || "N/A"}</Descriptions.Item>
                <Descriptions.Item label="IP Address">
                  <span style={{ fontFamily: "monospace", background: "#f5f5f5", padding: "2px 6px", borderRadius: 4 }}>
                    {selectedLog.ipAddress}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Browser User Agent">
                  <Text style={{ fontSize: "11px", fontFamily: "monospace" }}>{selectedLog.userAgent}</Text>
                </Descriptions.Item>
              </Descriptions>

              <Title level={5}>Event Description</Title>
              <Paragraph style={{ padding: 12, background: "#f9f9f9", borderLeft: "4px solid #1890ff", borderRadius: 4 }}>
                {selectedLog.description}
              </Paragraph>

              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <Title level={5}>Event Metadata / Payload</Title>
                  <pre
                    style={{
                      background: "#2d3748",
                      color: "#f7fafc",
                      padding: 16,
                      borderRadius: 6,
                      overflowX: "auto",
                      fontFamily: "Courier New, monospace",
                      fontSize: "12px"
                    }}
                  >
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </Drawer>

        <Footer style={{ textAlign: "center" }}>
          <Text type="secondary">
            <b>&copy; 2026 Draa. All Rights Reserved.</b>
          </Text>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default AdminLogViewer;
