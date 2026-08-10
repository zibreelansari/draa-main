import { useEffect, useState } from"react";
import {
  Layout,
  Card,
  Form,
  Input,
  Button,
  Typography,
  Row,
  Col,
  message,
  Divider,
  Spin,
  Alert,
} from"antd";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  SaveOutlined,
  SafetyOutlined,
} from"@ant-design/icons";
import { useNavigate } from"react-router-dom";
import Sidebar from"./Sidebar";
import Topbar from"./Topbar";
import url from"../../url";
import usePageTitle from '../../hooks/usePageTitle';

const { Content, Footer } = Layout;
const { Title, Text } = Typography;

const AdminUpdateProfile = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  //  SINGLE SOURCE OF TRUTH 
  const storedAdminRaw = localStorage.getItem("edudocs");
  let storedAdmin = null;
  let token = null;

  try {
    storedAdmin = storedAdminRaw ? JSON.parse(storedAdminRaw) : null;
    token = storedAdmin?.token || null;
  } catch {
    storedAdmin = null;
    token = null;
  }

  //  AUTH GUARD 
  useEffect(() => {
    if (!storedAdmin || !token) {
      localStorage.removeItem("edudocs");
      navigate("/admin-login");
      return;
    }

    if (!storedAdmin.aname || !storedAdmin.aemail) {
      localStorage.removeItem("edudocs");
      navigate("/admin-login");
      return;
    }

    form.setFieldsValue({
      aname: storedAdmin.aname,
      aemail: storedAdmin.aemail,
      apassword:"",
    });

    setInitializing(false);
  }, [navigate, form]);

  //  SUBMIT HANDLER 
  const onFinish = async (values) => {
    setLoading(true);

    try {
      const res = await fetch(`${url}/admin/update-profile`, {
        method:"PUT",
        headers: {
"Content-Type":"application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message ||"Update failed");

      // Update localStorage safely
      const updatedAdmin = {
        ...storedAdmin,
        ...data.admin,
      };

      localStorage.setItem("edudocs", JSON.stringify(updatedAdmin));

      message.success("Profile updated successfully");

      // SECURITY: password change  force logout
      if (values.apassword) {
        message.warning("Password changed. Please login again.");
        localStorage.removeItem("edudocs");
        setTimeout(() => navigate("/admin-login"), 1500);
        return;
      }

      form.setFieldsValue({ apassword:"" });
    } catch (err) {
      message.error(err.message ||"Profile update failed");
    } finally {
      setLoading(false);
    }
  };

  //  LOADING STATE 
  if (initializing) {
    return (
      <Layout style={{ minHeight:"100vh" }}>
        <Sidebar />
        <Layout>
          <Topbar />
          <Content style={{ display:"flex", justifyContent:"center", alignItems:"center" }}>
            <Spin size="large" />
          </Content>
        </Layout>
      </Layout>
    );
  }

  //  UI 
  return (
    <Layout style={{ minHeight:"100vh" }}>
      <Sidebar />
      <Layout>
        <Topbar />

        <Content style={{ margin:"16px", padding:"0 8px" }}>
          {/* Header */}
          <div
            style={{
              background:"linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)",
              borderRadius: 16,
              padding:"28px 32px",
              marginBottom: 24,
            }}
          >
            <Title level={2} style={{ color:"#fff", marginBottom: 4 }}>
              Admin Profile Settings
            </Title>
            <Text style={{ color:"rgba(255,255,255,0.65)" }}>
              Manage your account credentials and security preferences
            </Text>
          </div>

          {/* Form */}
          <Row justify="center">
            <Col xs={24} md={16} lg={12}>
              <Card bordered style={{ borderRadius: 12 }} bodyStyle={{ padding: 28 }}>
                <Title level={4} style={{ marginBottom: 4 }}>
                  <SafetyOutlined /> Account Information
                </Title>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Keep your admin details accurate and secure
                </Text>

                <Divider />

                <Alert
                  type="info"
                  showIcon
                  message="Security Notice"
                  description="Changing your password will log you out from all active sessions."
                  style={{ marginBottom: 20 }}
                />

                <Form layout="vertical" form={form} onFinish={onFinish}>
                  <Form.Item
                    label="Admin Name"
                    name="aname"
                    rules={[{ required: true, message:"Admin name is required" }]}
                  >
                    <Input size="large" prefix={<UserOutlined />} />
                  </Form.Item>

                  <Form.Item
                    label="Email Address"
                    name="aemail"
                    rules={[
                      { required: true, message:"Email is required" },
                      { type:"email", message:"Invalid email format" },
                    ]}
                  >
                    <Input size="large" prefix={<MailOutlined />} />
                  </Form.Item>

                  <Form.Item
                    label="New Password (Optional)"
                    name="apassword"
                    rules={[
                      { min: 8, message:"Password must be at least 8 characters" },
                    ]}
                  >
                    <Input.Password
                      size="large"
                      prefix={<LockOutlined />}
                      placeholder="Leave blank to keep current password"
                    />
                  </Form.Item>

                  <Divider />

                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    icon={<SaveOutlined />}
                    loading={loading}
                    block
                  >
                    Save Changes
                  </Button>
                </Form>
              </Card>
            </Col>
          </Row>
        </Content>

        <Footer style={{ textAlign:"center", background:"transparent" }}>
          <Text type="secondary">
            <b>© 2026 Draa Admin Panel. All Rights Reserved.</b>
          </Text>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default AdminUpdateProfile;