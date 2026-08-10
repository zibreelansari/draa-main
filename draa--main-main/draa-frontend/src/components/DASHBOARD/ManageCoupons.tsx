import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  message,
  Tag,
  Layout,
  Card,
  Space,
  Tooltip,
  Row,
  Col,
  Statistic,
  Tabs,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  GiftOutlined,
  UserAddOutlined,
  MailOutlined,
  ReloadOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  TagOutlined,
} from "@ant-design/icons";
import axios from "axios";
import moment from "moment";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import url from "../../url";
import { getAuthHeaders } from "../../utils/global_auth";
import usePageTitle from '../../hooks/usePageTitle';

const { Content, Footer } = Layout;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

interface Coupon {
  _id: string;
  code: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  description?: string;
  expiryDate: string;
  maxUses: number;
  usesCount: number;
  isActive: boolean;
  createdAt: string;
}

interface Assignment {
  _id: string;
  coupon: Coupon;
  student?: {
    name: string;
    email: string;
  };
  email: string;
  assignedType: "online" | "offline";
  isUsed: boolean;
  usedAt?: string;
  createdAt: string;
}

interface StudentOption {
  _id: string;
  name: string;
  email: string;
}

const ManageCoupons: React.FC = () => {
  usePageTitle('Manage Coupons | Admin');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals state
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  const [couponForm] = Form.useForm();
  const [assignForm] = Form.useForm();

  // Fetch Coupons
  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${url}/coupons/admin`, { headers: getAuthHeaders() });
      if (res.data.success) {
        setCoupons(res.data.data);
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || "Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Coupon Assignments
  const fetchAssignments = useCallback(async () => {
    try {
      const res = await axios.get(`${url}/coupons/admin/assignments`, { headers: getAuthHeaders() });
      if (res.data.success) {
        setAssignments(res.data.data);
      }
    } catch (error: any) {
      console.error("Failed to fetch assignments:", error);
    }
  }, []);

  // Fetch Registered Students (for assignment select list)
  const fetchStudentsList = useCallback(async () => {
    setStudentsLoading(true);
    try {
      const res = await axios.get(`${url}/count/getAllStudents`, { headers: getAuthHeaders() });
      if (Array.isArray(res.data.Users)) {
        setStudents(res.data.Users);
      }
    } catch (error: any) {
      console.error("Failed to fetch students list:", error);
    } finally {
      setStudentsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
    fetchAssignments();
    fetchStudentsList();
  }, [fetchCoupons, fetchAssignments, fetchStudentsList]);

  // Create or Update Coupon
  const handleCouponSubmit = async (values: any) => {
    setActionLoading(true);
    try {
      const payload = {
        ...values,
        expiryDate: values.expiryDate.toISOString(),
      };

      if (editingCoupon) {
        const res = await axios.put(`${url}/coupons/admin/${editingCoupon._id}`, payload, { headers: getAuthHeaders() });
        if (res.data.success) {
          message.success("Coupon updated successfully");
          setCoupons(prev => prev.map(c => c._id === editingCoupon._id ? res.data.data : c));
        }
      } else {
        const res = await axios.post(`${url}/coupons/admin`, payload, { headers: getAuthHeaders() });
        if (res.data.success) {
          message.success("Coupon created successfully");
          setCoupons(prev => [res.data.data, ...prev]);
        }
      }
      setIsCouponModalOpen(false);
      couponForm.resetFields();
      setEditingCoupon(null);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Failed to save coupon");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Coupon
  const handleDeleteCoupon = (id: string, code: string) => {
    Modal.confirm({
      title: "Delete Coupon",
      content: `Are you sure you want to delete "${code}"? This will also remove all its assignments.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await axios.delete(`${url}/coupons/admin/${id}`, { headers: getAuthHeaders() });
          message.success(`Coupon ${code} deleted successfully`);
          setCoupons(prev => prev.filter(c => c._id !== id));
          setAssignments(prev => prev.filter(a => a.coupon?._id !== id));
        } catch (error: any) {
          message.error(error.response?.data?.message || "Failed to delete coupon");
        }
      },
    });
  };

  // Assign Coupon
  const handleAssignSubmit = async (values: any) => {
    if (!selectedCoupon) return;
    setActionLoading(true);

    try {
      const emailList: string[] = [];

      // Add selected online student emails
      if (values.onlineStudents && values.onlineStudents.length > 0) {
        values.onlineStudents.forEach((studentId: string) => {
          const student = students.find(s => s._id === studentId);
          if (student) emailList.push(student.email);
        });
      }

      // Add comma-separated offline emails
      if (values.offlineEmails) {
        const offlineList = values.offlineEmails
          .split(",")
          .map((e: string) => e.trim())
          .filter((e: string) => e && e.includes("@"));
        emailList.push(...offlineList);
      }

      if (emailList.length === 0) {
        message.warning("Please select at least one online student or enter a valid offline email address.");
        setActionLoading(false);
        return;
      }

      const res = await axios.post(
        `${url}/coupons/admin/assign`,
        { couponId: selectedCoupon._id, emails: emailList },
        { headers: getAuthHeaders() }
      );

      if (res.data.success) {
        const succeeded = res.data.data.filter((r: any) => r.status === "success").length;
        const failed = res.data.data.filter((r: any) => r.status === "failed").length;

        message.success(`Assigned to ${succeeded} students successfully.${failed > 0 ? ` Failed: ${failed}` : ""}`);
        
        fetchAssignments();
        fetchCoupons(); // Update counts
        setIsAssignModalOpen(false);
        assignForm.resetFields();
        setSelectedCoupon(null);
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || "Failed to assign coupon");
    } finally {
      setActionLoading(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    couponForm.setFieldsValue({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      description: coupon.description,
      expiryDate: moment(coupon.expiryDate),
      maxUses: coupon.maxUses,
    });
    setIsCouponModalOpen(true);
  };

  // Open Assign Modal
  const openAssignModal = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsAssignModalOpen(true);
  };

  // Stats calculation
  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter(c => c.isActive && new Date(c.expiryDate) > new Date()).length;
  const expiredCoupons = coupons.filter(c => new Date(c.expiryDate) < new Date()).length;
  const totalAssigned = assignments.length;
  const totalUsed = assignments.filter(a => a.isUsed).length;

  const couponColumns = [
    {
      title: "Coupon Code",
      dataIndex: "code",
      key: "code",
      render: (code: string) => <Tag color="blue" style={{ fontSize: "13px", fontWeight: "bold" }}>{code}</Tag>,
    },
    {
      title: "Discount",
      key: "discount",
      render: (_: any, record: Coupon) => (
        <span style={{ fontWeight: 600 }}>
          {record.discountType === "percentage" ? `${record.discountValue}% OFF` : `₹${record.discountValue} OFF`}
        </span>
      ),
    },
    {
      title: "Expiry Date",
      dataIndex: "expiryDate",
      key: "expiryDate",
      render: (date: string) => moment(date).format("MMM DD, YYYY"),
    },
    {
      title: "Uses",
      key: "uses",
      render: (_: any, record: Coupon) => (
        <span>
          {record.usesCount} / {record.maxUses === 0 ? "∞" : record.maxUses}
        </span>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_: any, record: Coupon) => {
        const isExpired = new Date(record.expiryDate) < new Date();
        if (isExpired) return <Tag color="error">EXPIRED</Tag>;
        return record.isActive ? <Tag color="success">ACTIVE</Tag> : <Tag color="warning">INACTIVE</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Coupon) => (
        <Space size="middle">
          <Tooltip title="Assign Coupon">
            <Button
              type="primary"
              shape="circle"
              icon={<UserAddOutlined />}
              onClick={() => openAssignModal(record)}
            />
          </Tooltip>
          <Tooltip title="Edit Details">
            <Button
              shape="circle"
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Coupon">
            <Button
              danger
              shape="circle"
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteCoupon(record._id, record.code)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const assignmentColumns = [
    {
      title: "Coupon",
      key: "coupon",
      render: (_: any, record: Assignment) => <Tag color="purple">{record.coupon?.code || "N/A"}</Tag>,
    },
    {
      title: "Assigned To (Email)",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Channel",
      dataIndex: "assignedType",
      key: "assignedType",
      render: (type: string) => (
        <Tag color={type === "online" ? "cyan" : "orange"}>
          {type.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Redemption Status",
      key: "redemption",
      render: (_: any, record: Assignment) => (
        record.isUsed ? (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            REDEEMED ({moment(record.usedAt).format("MMM DD, YYYY")})
          </Tag>
        ) : (
          <Tag color="default" icon={<CloseCircleOutlined />}>
            UNUSED
          </Tag>
        )
      ),
    },
    {
      title: "Assigned Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => moment(date).format("MMM DD, YYYY h:mm A"),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar />
      <Layout>
        <Topbar />
        <Content style={{ margin: "24px 16px", padding: 24, background: "#f0f2f5" }}>
          
          <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ margin: 0, color: "#1890ff" }}>Coupon Management Panel</h2>
              <span style={{ color: "#6b7280" }}>Create discount codes and assign them to online or offline students</span>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => {
                setEditingCoupon(null);
                couponForm.resetFields();
                setIsCouponModalOpen(true);
              }}
            >
              Create New Coupon
            </Button>
          </div>

          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={8} md={4}>
              <Card><Statistic title="Total Coupons" value={totalCoupons} prefix={<TagOutlined />} /></Card>
            </Col>
            <Col xs={24} sm={8} md={5}>
              <Card><Statistic title="Active Coupons" value={activeCoupons} valueStyle={{ color: "#52c41a" }} /></Card>
            </Col>
            <Col xs={24} sm={8} md={5}>
              <Card><Statistic title="Expired Coupons" value={expiredCoupons} valueStyle={{ color: "#ff4d4f" }} /></Card>
            </Col>
            <Col xs={24} sm={12} md={5}>
              <Card><Statistic title="Assigned Users" value={totalAssigned} prefix={<UserAddOutlined />} /></Card>
            </Col>
            <Col xs={24} sm={12} md={5}>
              <Card><Statistic title="Redeemed" value={totalUsed} valueStyle={{ color: "#25d366" }} prefix={<CheckCircleOutlined />} /></Card>
            </Col>
          </Row>

          <Card bordered={false}>
            <Tabs defaultActiveKey="coupons">
              <TabPane tab="Coupons List" key="coupons">
                <div style={{ marginBottom: 16, textAlign: "right" }}>
                  <Button icon={<ReloadOutlined />} onClick={fetchCoupons} loading={loading}>
                    Refresh List
                  </Button>
                </div>
                <Table
                  rowKey="_id"
                  columns={couponColumns}
                  dataSource={coupons}
                  loading={loading}
                  bordered
                  pagination={{ pageSize: 10 }}
                />
              </TabPane>
              
              <TabPane tab="Redemptions & Assignments" key="assignments">
                <div style={{ marginBottom: 16, textAlign: "right" }}>
                  <Button icon={<ReloadOutlined />} onClick={fetchAssignments}>
                    Refresh Logs
                  </Button>
                </div>
                <Table
                  rowKey="_id"
                  columns={assignmentColumns}
                  dataSource={assignments}
                  bordered
                  pagination={{ pageSize: 10 }}
                />
              </TabPane>
            </Tabs>
          </Card>

          {/* Coupon Create/Edit Modal */}
          <Modal
            title={editingCoupon ? "Edit Coupon Details" : "Create New Coupon Code"}
            open={isCouponModalOpen}
            onCancel={() => setIsCouponModalOpen(false)}
            footer={null}
            destroyOnClose
            centered
          >
            <Form
              form={couponForm}
              layout="vertical"
              onFinish={handleCouponSubmit}
              initialValues={{ maxUses: 0 }}
            >
              <Form.Item
                name="code"
                label="Coupon Code"
                rules={[
                  { required: true, message: "Please input coupon code" },
                  { pattern: /^[A-Za-z0-9_-]+$/, message: "Invalid characters (Only alphanumeric, _ and -)" }
                ]}
              >
                <Input placeholder="e.g. WELCOME50" style={{ textTransform: "uppercase" }} disabled={!!editingCoupon} />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="discountType"
                    label="Discount Type"
                    rules={[{ required: true, message: "Select discount type" }]}
                  >
                    <Select placeholder="Select type">
                      <Option value="percentage">Percentage (%)</Option>
                      <Option value="flat">Flat Price (₹)</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="discountValue"
                    label="Discount Value"
                    rules={[{ required: true, message: "Enter discount value" }]}
                  >
                    <InputNumber min={1} style={{ width: "100%" }} placeholder="e.g. 50" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="expiryDate"
                    label="Expiry Date"
                    rules={[{ required: true, message: "Select expiry date" }]}
                  >
                    <DatePicker style={{ width: "100%" }} disabledDate={(current) => current && current < moment().endOf('day')} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="maxUses"
                    label="Max Usage Limits (0 for unlimited)"
                  >
                    <InputNumber min={0} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="description"
                label="Promo Description"
              >
                <TextArea rows={3} placeholder="Provide details, e.g. Valid on all course purchases." />
              </Form.Item>

              <Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
                <Space>
                  <Button onClick={() => setIsCouponModalOpen(false)}>Cancel</Button>
                  <Button type="primary" htmlType="submit" loading={actionLoading}>
                    {editingCoupon ? "Save Changes" : "Create Coupon"}
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Modal>

          {/* Assign Coupon Modal */}
          <Modal
            title={
              <div>
                <GiftOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                Assign Coupon Code: <Tag color="blue" style={{ marginLeft: 6 }}>{selectedCoupon?.code}</Tag>
              </div>
            }
            open={isAssignModalOpen}
            onCancel={() => setIsAssignModalOpen(false)}
            footer={null}
            destroyOnClose
            centered
            width={600}
          >
            {selectedCoupon && (
              <div style={{ marginBottom: 20, padding: "12px", background: "#f9fafb", borderRadius: "8px" }}>
                <strong>Discount Details:</strong> {selectedCoupon.discountType === "percentage" ? `${selectedCoupon.discountValue}% Discount` : `Flat ₹${selectedCoupon.discountValue} Discount`}
                <br />
                <strong>Description:</strong> {selectedCoupon.description || "N/A"}
                <br />
                <strong>Expiry:</strong> {moment(selectedCoupon.expiryDate).format("MMMM Do, YYYY")}
              </div>
            )}

            <Form
              form={assignForm}
              layout="vertical"
              onFinish={handleAssignSubmit}
            >
              <Form.Item
                name="onlineStudents"
                label="Assign to Online Students (Registered users)"
              >
                <Select
                  mode="multiple"
                  placeholder="Search and select student accounts"
                  style={{ width: "100%" }}
                  loading={studentsLoading}
                  filterOption={(input, option) =>
                    (option?.children as any || "").toLowerCase().includes(input.toLowerCase())
                  }
                  allowClear
                >
                  {students.map(s => (
                    <Option key={s._id} value={s._id}>
                      {s.name} ({s.email})
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="offlineEmails"
                label={
                  <span>
                    <MailOutlined style={{ marginRight: 6 }} />
                    Assign &amp; Invite Offline Students (Enter Email Addresses)
                  </span>
                }
                extra="Enter comma-separated emails. An elegant invite with the coupon details will be sent immediately to each address."
              >
                <TextArea
                  rows={4}
                  placeholder="e.g. offline-student1@gmail.com, offline-student2@yahoo.com"
                />
              </Form.Item>

              <Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
                <Space>
                  <Button onClick={() => setIsAssignModalOpen(false)}>Cancel</Button>
                  <Button type="primary" htmlType="submit" loading={actionLoading} icon={<GiftOutlined />}>
                    Send &amp; Assign Coupons
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Modal>

        </Content>
        <Footer style={{ textAlign: "center" }}>
          <b>&copy; {new Date().getFullYear()} Draa. All Rights Reserved.</b>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default ManageCoupons;
