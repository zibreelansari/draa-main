import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Form, Input, InputNumber, Button, Space, Typography, message,
  Row, Col, Table, Layout, Tag, Card, Modal,
  Select, Alert,
  Tooltip,
  Switch,
} from "antd";
import {
  PlusOutlined, EditOutlined,
  ReloadOutlined, SearchOutlined, VideoCameraOutlined,
  YoutubeOutlined, LockOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import url from "../../url";
import Topbar from "./Topbar";
import Sidebar2 from "./Sidebar2";
import usePageTitle from '../../hooks/usePageTitle';

const { Title, Text } = Typography;
const { Content, Footer } = Layout;
const { TextArea } = Input;
const { Option } = Select;

interface VideoItem {
  _id: string;
  title: string;
  url: string;
  category: "YouTube" | "Shorts";
  description?: string;
  isActive: boolean;
  priority: number;
  createdAt: string;
}

const TeacherVideographyManager: React.FC = () => {
  usePageTitle('Videos | Teacher');
  const navigate = useNavigate();

  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Auth check — teacher only, must have "Manage Videography" permission
  useEffect(() => {
    const raw = localStorage.getItem("edudocs");
    if (!raw) {
      navigate("/teacher-login");
      return;
    }
    try {
      const user = JSON.parse(raw);
      // Must be a teacher (has tname), not admin
      if (!user.tname && !user.T_name) {
        message.error("Teacher access required.");
        navigate("/teacher-login");
        return;
      }
      // Must have the Manage Videography permission
      const perms: string[] = user.permissions || [];
      if (!perms.includes("Manage Videography")) {
        message.error("You don't have permission to access Videography Management.");
        navigate("/teacher-dashboard");
        return;
      }
    } catch {
      navigate("/teacher-login");
    }
  }, [navigate]);

  // Fetch videos (same endpoint — teacher can view all)
  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${url}/videography/all`);
      if (res.data?.success) {
        setVideos(res.data.data || []);
      }
    } catch {
      message.error("Failed to load videos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // Handle Edit
  const handleEdit = (video: VideoItem) => {
    setEditingVideo(video);
    form.setFieldsValue({
      title: video.title,
      url: video.url,
      category: video.category,
      description: video.description || "",
      isActive: video.isActive,
      priority: video.priority || 0,
    });
    setModalVisible(true);
  };

  // Submit form (create or update only)
  const handleSubmit = async (values: any) => {
    setSubmitLoading(true);
    try {
      const payload = {
        ...values,
        isActive: values.isActive ?? true,
        priority: values.priority ?? 0,
      };

      if (editingVideo) {
        await axios.put(`${url}/videography/update/${editingVideo._id}`, payload);
        message.success("Video updated successfully!");
      } else {
        await axios.post(`${url}/videography/create`, payload);
        message.success("Video added successfully!");
      }

      setModalVisible(false);
      setEditingVideo(null);
      form.resetFields();
      fetchVideos();
    } catch (err: any) {
      message.error(err.response?.data?.message || "Failed to save video");
    } finally {
      setSubmitLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingVideo(null);
    form.resetFields();
    form.setFieldsValue({ isActive: true, priority: 0, category: "YouTube" });
    setModalVisible(true);
  };

  // Filtered data
  const filteredVideos = useMemo(() => {
    return videos.filter((v) => {
      const q = searchText.toLowerCase();
      const matchSearch =
        !q ||
        v.title.toLowerCase().includes(q) ||
        v.url.toLowerCase().includes(q) ||
        (v.description || "").toLowerCase().includes(q);

      const matchCategory =
        categoryFilter === "all" || v.category === categoryFilter;

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && v.isActive) ||
        (statusFilter === "inactive" && !v.isActive);

      return matchSearch && matchCategory && matchStatus;
    });
  }, [videos, searchText, categoryFilter, statusFilter]);

  const clearFilters = () => {
    setSearchText("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const isFiltered = !!(searchText || categoryFilter !== "all" || statusFilter !== "all");

  // Columns — NO delete column for teachers
  const columns = [
    {
      title: "#",
      key: "index",
      width: 50,
      render: (_: any, __: any, idx: number) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {(currentPage - 1) * pageSize + idx + 1}
        </Text>
      ),
    },
    {
      title: "Title & Description",
      key: "details",
      width: 350,
      render: (_: any, r: VideoItem) => (
        <div>
          <Text strong style={{ fontSize: 14 }}>{r.title}</Text>
          {r.description && (
            <Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 4 }}>
              {r.description}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 120,
      render: (cat: string) => {
        const isYT = cat === "YouTube";
        return (
          <Tag color={isYT ? "red" : "volcano"} style={{ padding: "4px 8px", fontSize: 12 }}>
            <Space size={4}>
              {isYT ? <YoutubeOutlined /> : <VideoCameraOutlined />}
              {cat}
            </Space>
          </Tag>
        );
      },
    },
    {
      title: "Video Link",
      dataIndex: "url",
      key: "url",
      width: 250,
      render: (link: string) => (
        <a href={link} target="_blank" rel="noreferrer" style={{ fontSize: 13 }}>
          {link}
        </a>
      ),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      width: 90,
      sorter: (a: VideoItem, b: VideoItem) => a.priority - b.priority,
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      render: (_: any, r: VideoItem) => (
        <Space size={8}>
          <Tooltip title="Edit Video">
            <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(r)} />
          </Tooltip>
          {/* Delete is intentionally omitted — only admin can delete */}
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar2 />
      <Layout>
        <Topbar />
        <Content style={{ margin: "16px", padding: "0 8px" }}>

          {/* Header Banner */}
          <div style={{
            background: "linear-gradient(135deg, #1a3a4a 0%, #1e5c6e 50%, #2d8b94 100%)",
            borderRadius: 16, padding: "28px 32px", marginBottom: 24,
            display: "flex", justifyContent: "space-between", alignItems: "center",
            flexWrap: "wrap", gap: 16,
          }}>
            <div>
              <Title level={2} style={{ color: "#fff", margin: 0 }}>
                <VideoCameraOutlined style={{ marginRight: 10, color: "#64dfdf" }} />
                Videography Management
              </Title>
              <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>
                Add and manage YouTube lectures and YouTube Shorts for the portal.
              </Text>
            </div>
            <Space wrap>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchVideos}
                loading={loading}
                style={{ background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 8 }}
              >
                Refresh
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal} style={{ borderRadius: 8 }}>
                Add Video
              </Button>
            </Space>
          </div>

          {/* Permission Notice */}
          <Alert
            message={
              <span>
                <LockOutlined style={{ marginRight: 6, color: "#fa8c16" }} />
                <strong>Note:</strong> As a teacher, you can <strong>create</strong>, <strong>edit</strong>, and <strong>toggle visibility</strong> of videos. Only admins can <strong>delete</strong> videos.
              </span>
            }
            type="warning"
            showIcon={false}
            style={{ marginBottom: 16, borderRadius: 10 }}
          />

          {/* Filters */}
          <Card style={{ marginBottom: 16, borderRadius: 12 }} bodyStyle={{ padding: "14px 20px" }}>
            <Row gutter={[10, 10]} align="middle">
              <Col xs={24} sm={10} lg={8}>
                <Input
                  placeholder="Search title, description, url..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                />
              </Col>
              <Col xs={12} sm={5} lg={4}>
                <Select value={categoryFilter} onChange={(v) => { setCategoryFilter(v); setCurrentPage(1); }} style={{ width: "100%" }}>
                  <Option value="all">All Categories</Option>
                  <Option value="YouTube">YouTube</Option>
                  <Option value="Shorts">Shorts</Option>
                </Select>
              </Col>
              <Col xs={12} sm={5} lg={4}>
                <Select value={statusFilter} onChange={(v) => { setStatusFilter(v); setCurrentPage(1); }} style={{ width: "100%" }}>
                  <Option value="all">All Status</Option>
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                </Select>
              </Col>
              <Col xs={24} sm={4} lg={4}>
                <Button onClick={clearFilters} disabled={!isFiltered} style={{ width: "100%" }}>
                  Clear Filters
                </Button>
              </Col>
            </Row>
          </Card>

          {/* Table */}
          <Card
            title={
              <Space>
                <VideoCameraOutlined />
                <Text strong>Videos List ({filteredVideos.length})</Text>
                {isFiltered && <Tag color="blue">Filtered</Tag>}
              </Space>
            }
            style={{ borderRadius: 12 }}
            bodyStyle={{ padding: 0 }}
          >
            <Table
              columns={columns}
              dataSource={filteredVideos}
              rowKey="_id"
              loading={loading}
              pagination={{
                current: currentPage,
                pageSize,
                total: filteredVideos.length,
                onChange: (p, s) => { setCurrentPage(p); setPageSize(s ?? 10); },
                onShowSizeChange: (_, s) => { setCurrentPage(1); setPageSize(s); },
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50"],
                style: { padding: "12px 24px" },
              }}
              size="small"
            />
          </Card>

        </Content>

        {/* Create / Edit Modal */}
        <Modal
          title={
            <Space>
              {editingVideo ? <EditOutlined style={{ color: "#1890ff" }} /> : <PlusOutlined style={{ color: "#52c41a" }} />}
              <span>{editingVideo ? "Edit Video Info" : "Add New Video"}</span>
            </Space>
          }
          open={modalVisible}
          onCancel={() => { setModalVisible(false); setEditingVideo(null); form.resetFields(); }}
          footer={null}
          destroyOnClose
          width={650}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ isActive: true, priority: 0, category: "YouTube" }}
          >
            <Form.Item name="title" label="Video Title" rules={[{ required: true, message: "Please enter video title" }]}>
              <Input placeholder="e.g. Masterclass on Indian History" />
            </Form.Item>

            <Form.Item name="url" label="Video Link (YouTube Video / Shorts URL)" rules={[{ required: true, message: "Please enter video URL" }]}>
              <Input placeholder="e.g. https://www.youtube.com/watch?v=... or https://youtube.com/shorts/..." />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="category" label="Platform Category" rules={[{ required: true }]}>
                  <Select style={{ width: "100%" }}>
                    <Option value="YouTube">YouTube</Option>
                    <Option value="Shorts">Shorts</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="priority" label="Priority Order">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="description" label="Short Description">
              <TextArea rows={3} placeholder="Brief summary of the video topic..." />
            </Form.Item>

            <Form.Item name="isActive" label="Active Status" valuePropName="checked">
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
              <Space>
                <Button onClick={() => { setModalVisible(false); setEditingVideo(null); form.resetFields(); }}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" loading={submitLoading}>
                  {editingVideo ? "Update Video" : "Add Video"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        <Footer style={{ textAlign: "center", background: "transparent" }}>
          <Text type="secondary"><b>© 2026 Draa. All Rights Reserved.</b></Text>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default TeacherVideographyManager;
