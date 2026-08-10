import { useState, useEffect } from"react";
import toast from '../../utils/toast';
import axios from"axios";
import { Form, Input, InputNumber, Button, Card, Typography, Layout, Alert } from"antd";
import { useNavigate } from"react-router-dom";
import url from"../../url";

import Sidebar from"./Sidebar";
import Topbar from"./Topbar";
import Sidebar2 from"./Sidebar2";
import { getUserRole, redirectToLogin } from"../../utils/global_auth";
const { Title, Text } = Typography;
const { Content, Footer } = Layout;

const CreateAssignment = () => {
  const navigate = useNavigate();
  const [loginUser, setLoginUser] = useState<{
    id?: string;
    name?: string;
    tname?: string;
    aname?: string;
    isVerified?: boolean;
    Status?: string;
  }>({});

  //  UPDATED: Enhanced Auth & Teacher Verification Check
  useEffect(() => {
    const role = getUserRole();

    //  Not logged in
    if (role ==="GUEST") {
      redirectToLogin(navigate, "Please login to continue");
      return;
    }

    //  Students not allowed
    if (role ==="STUDENT") {
      toast.error("Students are not allowed to create assignments.", 6);
      navigate("/student-dashboard");
      return;
    }

    const raw = localStorage.getItem("edudocs");
    if (!raw) {
      redirectToLogin(navigate, "Session expired. Please login again.");
      return;
    }

    try {
      const user = JSON.parse(raw);

      //  Teacher checks
      if (role ==="TEACHER") {
        if (user.isVerified !== true) {
          toast.error("Your account is not verified yet.", 7);
          navigate("/teacher-dashboard");
          return;
        }

        if (user.Status !=="approved") {
          toast.error("Your account is not approved yet.", 7);
          navigate("/teacher-dashboard");
          return;
        }
      }

      //  Admin or verified teacher
      setLoginUser(user);
    } catch {
      redirectToLogin(navigate, "Invalid session. Please login again.");
    }
  }, [navigate]);

  //  AUTH GUARD: Don't render form until user is verified
  if (!loginUser || Object.keys(loginUser).length === 0) {
    return (
      <Layout style={{ minHeight:"100vh" }}>
        <Content style={{ display:'flex', justifyContent:'center', alignItems:'center' }}>
          <Card>
            <Text>Checking authentication and permissions...</Text>
          </Card>
        </Content>
      </Layout>
    );
  }

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        ...values,
        createdBy: loginUser?.id,
      };
      const response = await axios.post(`${url}/assignmments/create`, payload);
      toast.success(" Assignment created successfully!");
      setTimeout(() => {
        navigate(`/manage-assignments/${response.data.assignment._id}`);
      }, 1000);
    } catch (err) {
      console.error(err);
      toast.error(" Failed to create assignment.");
    }
  };

  return (
    <Layout style={{ minHeight:"100vh" }}>
      {getUserRole() ==="ADMIN" ? <Sidebar /> : <Sidebar2 />}

      <Layout>
        <Topbar />

        <Content style={{ margin:"24px 16px", padding: 24 }}>
          <Card
            style={{
              borderRadius: 12,
              boxShadow:"0 4px 14px rgba(0,0,0,0.1)",
              maxWidth: 800,
              margin:"0 auto",
            }}
          >
            <Title level={3} style={{ marginBottom: 20 }}>
              Create Assignment
            </Title>

            {/*  ADDED: Status Information for Teachers */}
            {loginUser.tname && (
              <Alert
                message="Teacher Account Status"
                description={
                  <div>
                    <div> <strong>Verified:</strong> {loginUser.isVerified ?'Yes' :'No'}</div>
                    <div> <strong>Status:</strong> {loginUser.Status}</div>
                    <div style={{ marginTop: 8, color:'#52c41a' }}>
                      Your account is verified and approved. You can create assignments.
                    </div>
                  </div>
                }
                type="success"
                showIcon
                style={{ marginBottom: 24 }}
              />
            )}

            <Form layout="vertical" onFinish={handleSubmit}>
              <Form.Item
                label="Title"
                name="title"
                rules={[{ required: true, message:"Please enter assignment title" }]}
              >
                <Input placeholder="Assignment Title" />
              </Form.Item>

              <Form.Item
                label="Subject"
                name="subject"
                rules={[{ required: true, message:"Please enter subject" }]}
              >
                <Input placeholder="Subject" />
              </Form.Item>

              <Form.Item
                label="Marks"
                name="marks"
                rules={[{ required: true, message:"Please enter total marks" }]}
              >
                <InputNumber style={{ width:"100%" }} placeholder="Marks" min={1} />
              </Form.Item>

              <Form.Item
                label="Pass Marks"
                name="passmarks"
                rules={[{ required: true, message:"Please enter pass marks" }]}
              >
                <InputNumber style={{ width:"100%" }} placeholder="Pass Marks" min={1} />
              </Form.Item>

              {/* If you want deadline later, uncomment */}
              {/* <Form.Item
                label="Deadline"
                name="dueDate"
                rules={[{ required: true, message:"Please select deadline" }]}
              >
                <DatePicker showTime style={{ width:"100%" }} />
              </Form.Item> */}

              <Form.Item label="Description" name="description">
                <Input.TextArea rows={4} placeholder="Assignment Description" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Create Assignment
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Content>

        <Footer style={{ textAlign:"center" }}>
          <b>© 2026 Draa. All Rights Reserved.</b>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default CreateAssignment;
