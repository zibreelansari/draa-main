import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Form, Input, InputNumber, Button, Space, Typography, message,
  Popconfirm, Row, Col, Table, Layout, Switch, Tag, Card, Modal,
  Select, Tooltip, AutoComplete,
} from "antd";
import {
  PlusOutlined, DeleteOutlined, EditOutlined,
  ReloadOutlined, SearchOutlined, CommentOutlined,
  QuestionCircleOutlined, BulbOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import url from "../../url";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import usePageTitle from '../../hooks/usePageTitle';

const { Title, Text } = Typography;
const { Content, Footer } = Layout;
const { TextArea } = Input;
const { Option } = Select;

interface FAQItem {
  _id: string;
  question: string;
  answer: string;
  category: string;
  isActive: boolean;
  priority: number;
  createdAt: string;
}

const CATEGORY_OPTIONS = [
  "Purchase & Payments",
  "Access & Login",
  "Test Series & Exams",
  "Careers & Placements",
  "Offers & Rewards",
  "Technical Support",
  "General Help"
];

const ChatbotFAQManager: React.FC = () => {
  usePageTitle('Chatbot FAQs | Admin');
  const navigate = useNavigate();

  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const dynamicCategories = useMemo(() => {
    const uniqueCats = faqs.map(f => f.category).filter(Boolean);
    return Array.from(new Set([...CATEGORY_OPTIONS, ...uniqueCats]));
  }, [faqs]);

  // Auth check
  useEffect(() => {
    const raw = localStorage.getItem("edudocs");
    if (!raw) {
      navigate("/admin-login");
      return;
    }
    try {
      const user = JSON.parse(raw);
      if (!user.aname) {
        message.error("Admin access required.");
        navigate("/admin-login");
        return;
      }
    } catch {
      navigate("/admin-login");
    }
  }, [navigate]);

  // Fetch FAQs
  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${url}/chatbot/all`);
      if (res.data?.success) {
        setFaqs(res.data.data || []);
      }
    } catch (err) {
      message.error("Failed to load Chatbot FAQs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  // Handle Edit
  const handleEdit = (faq: FAQItem) => {
    setEditingFaq(faq);
    form.setFieldsValue({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      isActive: faq.isActive,
      priority: faq.priority || 0,
    });
    setModalVisible(true);
  };

  // Submit form
  const handleSubmit = async (values: any) => {
    setSubmitLoading(true);
    try {
      const payload = {
        ...values,
        isActive: values.isActive ?? true,
        priority: values.priority ?? 0,
      };

      if (editingFaq) {
        await axios.put(`${url}/chatbot/update/${editingFaq._id}`, payload);
        message.success("FAQ updated successfully!");
      } else {
        await axios.post(`${url}/chatbot/create`, payload);
        message.success("FAQ added successfully!");
      }

      setModalVisible(false);
      setEditingFaq(null);
      form.resetFields();
      fetchFaqs();
    } catch (err: any) {
      message.error(err.response?.data?.message || "Failed to save FAQ");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Delete FAQ
  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${url}/chatbot/delete/${id}`);
      message.success("FAQ deleted successfully!");
      setFaqs((prev) => prev.filter((f) => f._id !== id));
    } catch (err: any) {
      message.error(err.response?.data?.message || "Failed to delete FAQ");
    }
  };

  // Toggle active status
  const toggleStatus = async (faq: FAQItem) => {
    try {
      await axios.patch(`${url}/chatbot/toggle/${faq._id}`);
      message.success(`FAQ is now ${faq.isActive ? "Inactive" : "Active"}`);
      fetchFaqs();
    } catch {
      message.error("Failed to update status");
    }
  };

  const openCreateModal = () => {
    setEditingFaq(null);
    form.resetFields();
    form.setFieldsValue({ isActive: true, priority: 0, category: CATEGORY_OPTIONS[0] });
    setModalVisible(true);
  };

  // Filtered data
  const filteredFaqs = useMemo(() => {
    return faqs.filter((f) => {
      const q = searchText.toLowerCase();
      const matchSearch =
        !q ||
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q);

      const matchCategory =
        categoryFilter === "all" || f.category === categoryFilter;

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && f.isActive) ||
        (statusFilter === "inactive" && !f.isActive);

      return matchSearch && matchCategory && matchStatus;
    });
  }, [faqs, searchText, categoryFilter, statusFilter]);

  const clearFilters = () => {
    setSearchText("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const isFiltered = !!(searchText || categoryFilter !== "all" || statusFilter !== "all");

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
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 150,
      render: (cat: string) => (
        <Tag color="geekblue" style={{ padding: "4px 10px", fontSize: 12, borderRadius: 4 }}>
          {cat}
        </Tag>
      ),
    },
    {
      title: "Question & Answer Response",
      key: "qa",
      render: (_: any, r: FAQItem) => (
        <div style={{ padding: "4px 0" }}>
          <div style={{ marginBottom: 4 }}>
            <BadgeIcon type="question" />
            <Text strong style={{ fontSize: 14, color: "#1e293b" }}>{r.question}</Text>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
            <BadgeIcon type="answer" />
            <Text type="secondary" style={{ fontSize: 13, whiteSpace: "pre-line" }}>
              {r.answer}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      width: 90,
      sorter: (a: FAQItem, b: FAQItem) => a.priority - b.priority,
      align: "center" as const,
    },
    {
      title: "Status",
      key: "status",
      width: 120,
      render: (_: any, r: FAQItem) => (
        <Tooltip title="Toggle Active/Inactive">
          <Switch
            checked={r.isActive}
            onChange={() => toggleStatus(r)}
            checkedChildren="Active"
            unCheckedChildren="Off"
            size="small"
          />
        </Tooltip>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_: any, r: FAQItem) => (
        <Space size={8}>
          <Tooltip title="Edit">
            <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(r)} />
          </Tooltip>
          <Popconfirm
            title="Delete this FAQ?"
            description="Cannot be undone."
            onConfirm={() => handleDelete(r._id)}
            okText="Delete"
            cancelText="Cancel"
            okType="danger"
          >
            <Tooltip title="Delete">
              <Button danger type="text" icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar />
      <Layout>
        <Topbar />
        <Content style={{ margin: "16px", padding: "0 8px" }}>
          
          {/* Header Banner */}
          <div style={{
            background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
            borderRadius: 16, padding: "28px 32px", marginBottom: 24,
            display: "flex", justifyContent: "space-between", alignItems: "center",
            flexWrap: "wrap", gap: 16,
            border: "1px solid rgba(255, 255, 255, 0.08)"
          }}>
            <div>
              <Title level={2} style={{ color: "#fff", margin: 0 }}>
                <CommentOutlined style={{ marginRight: 10, color: "#3b82f6" }} />
                Chatbot FAQs CMS
              </Title>
              <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>
                Configure chatbot responses and automated message flows matching user queries.
              </Text>
            </div>
            <Space wrap>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchFaqs}
                loading={loading}
                style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8 }}
              >
                Refresh
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal} style={{ borderRadius: 8 }}>
                Add FAQ
              </Button>
            </Space>
          </div>

          {/* Filters */}
          <Card style={{ marginBottom: 16, borderRadius: 12 }} bodyStyle={{ padding: "14px 20px" }}>
            <Row gutter={[10, 10]} align="middle">
              <Col xs={24} sm={10} lg={8}>
                <Input
                  placeholder="Search question, answer, category..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                />
              </Col>
              <Col xs={12} sm={5} lg={4}>
                <Select value={categoryFilter} onChange={(v) => { setCategoryFilter(v); setCurrentPage(1); }} style={{ width: "100%" }}>
                  <Option value="all">All Categories</Option>
                  {dynamicCategories.map(cat => (
                    <Option key={cat} value={cat}>{cat}</Option>
                  ))}
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
                <CommentOutlined />
                <Text strong>FAQ Items ({filteredFaqs.length})</Text>
                {isFiltered && <Tag color="blue">Filtered</Tag>}
              </Space>
            }
            style={{ borderRadius: 12 }}
            bodyStyle={{ padding: 0 }}
          >
            <Table
              columns={columns}
              dataSource={filteredFaqs}
              rowKey="_id"
              loading={loading}
              pagination={{
                current: currentPage,
                pageSize,
                total: filteredFaqs.length,
                onChange: (p, s) => { setCurrentPage(p); setPageSize(s ?? 10); },
                onShowSizeChange: (_, s) => { setCurrentPage(1); setPageSize(s); },
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50"],
                style: { padding: "12px 24px" },
              }}
              size="middle"
            />
          </Card>

        </Content>

        {/* Create / Edit Modal */}
        <Modal
          title={
            <Space>
              {editingFaq ? <EditOutlined style={{ color: "#1890ff" }} /> : <PlusOutlined style={{ color: "#52c41a" }} />}
              <span>{editingFaq ? "Edit Chatbot FAQ" : "Add Chatbot FAQ"}</span>
            </Space>
          }
          open={modalVisible}
          onCancel={() => { setModalVisible(false); setEditingFaq(null); form.resetFields(); }}
          footer={null}
          destroyOnClose
          width={650}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ isActive: true, priority: 0, category: CATEGORY_OPTIONS[0] }}
          >
            <Form.Item name="question" label="User Question / Trigger Pattern" rules={[{ required: true, message: "Please enter user question trigger" }]}>
              <Input placeholder="e.g. How to buy a test series?" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="category" label="Bot Category" rules={[{ required: true, message: "Please select or type a category" }]}>
                  <AutoComplete
                    placeholder="Select or type a category..."
                    options={dynamicCategories.map(cat => ({ value: cat }))}
                    filterOption={(inputValue, option) =>
                      option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="priority" label="Priority Order">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="answer" label="Bot Response Answer" rules={[{ required: true, message: "Please enter bot response answer" }]}>
              <TextArea rows={5} placeholder="Type the automated response..." />
            </Form.Item>

            <Form.Item name="isActive" label="Active Status" valuePropName="checked">
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
              <Space>
                <Button onClick={() => { setModalVisible(false); setEditingFaq(null); form.resetFields(); }}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" loading={submitLoading}>
                  {editingFaq ? "Update FAQ" : "Add FAQ"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        <Footer style={{ textAlign: "center", background: "transparent" }}>
          <Text type="secondary"><b>© 2026 Draa Admin Panel. All Rights Reserved.</b></Text>
        </Footer>
      </Layout>
    </Layout>
  );
};

// Helper badge component for Q/A tags
const BadgeIcon: React.FC<{ type: "question" | "answer" }> = ({ type }) => {
  const isQ = type === "question";
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 20,
      height: 20,
      borderRadius: "50%",
      fontSize: 10,
      fontWeight: "bold",
      marginRight: 8,
      background: isQ ? "#fee2e2" : "#dcfce7",
      color: isQ ? "#ef4444" : "#22c55e",
      verticalAlign: "middle"
    }}>
      {isQ ? "Q" : "A"}
    </span>
  );
};

export default ChatbotFAQManager;
