import React, { useState, useEffect } from"react";
import {
  Layout,
  Upload,
  Button,
  Card,
  Typography,
  message,
} from"antd";
import { UploadOutlined } from"@ant-design/icons";
import { useParams } from"react-router-dom";
import axios from"axios";
import Topbar from"./Topbar";
import Sidebar from"./Sidebar";
import Sidebar2 from"./Sidebar2";
import url from"../../url";

const { Content, Footer } = Layout;
const { Title, Paragraph } = Typography;

interface LoginUser {
  aname?: string;
  [key: string]: any;
}

interface Assignment {
  _id: string;
  title: string;
  subject: string;
  dueDate: string;
  description?: string;
}

const UploadAssignment: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  // const navigate = useNavigate();

  const [fileList, setFileList] = useState<any[]>([]);
  const [loginUser, setLoginUser] = useState<LoginUser>({});
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  // Load user and fetch assignment details
  useEffect(() => {
    const userStr = localStorage.getItem("edudocs");
    if (userStr) {
      try {
        const user: LoginUser = JSON.parse(userStr);
        setLoginUser(user);
      } catch {
        setLoginUser({});
      }
    }

    const fetchAssignment = async () => {
      if (!assignmentId) return;
      try {
        const res = await axios.get<{ assignment: Assignment }>(`${url}/assignmments/${assignmentId}`);
        setAssignment(res.data.assignment);
      } catch (err) {
        console.error(err);
        message.error("Failed to load assignment");
      }
    };

    fetchAssignment();
  }, [assignmentId]);

  // Handle file upload
  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning("Please select at least one file.");
      return;
    }

    const formData = new FormData();
    fileList.forEach((file) => {
      if (file.originFileObj) {
        formData.append("fileUrl", file.originFileObj);
      }
    });

    setUploading(true);
    try {
      await axios.post(`${url}/assignmments/upload/${assignmentId}`, formData, {
        headers: {
"Content-Type":"multipart/form-data",
        },
      });
      message.success("Files uploaded successfully!");
      setFileList([]);
      // Uncomment if want to navigate away after upload:
      // navigate("/manage-assignments");
    } catch (err) {
      console.error(err);
      message.error("File upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout style={{ minHeight:"100vh" }}>
      {/* Sidebar depending on user role */}
      {"aname" in loginUser ? <Sidebar /> : <Sidebar2 />}

      <Layout>
        <Topbar />

        <Content style={{ margin:"24px 16px", padding: 24 }}>
          <Title level={4}>Upload Assignment Files</Title>

          {assignment ? (
            <>
              <Card className="mb-4">
                <Title level={5}>{assignment.title}</Title>
                <Paragraph>
                  <strong>Subject:</strong> {assignment.subject}
                </Paragraph>
                <Paragraph>
                  <strong>Due Date:</strong>{""}
                  {new Date(assignment.dueDate).toLocaleString()}
                </Paragraph>
                <Paragraph>
                  <strong>Description:</strong>{""}
                  {assignment.description ||""}
                </Paragraph>
              </Card>

              <Upload
                multiple
                beforeUpload={() => false} // Prevent auto-upload
                onChange={({ fileList }) => setFileList(fileList)}
                fileList={fileList}
              >
                <Button icon={<UploadOutlined />}>Select Files</Button>
              </Upload>

              <Button
                type="primary"
                onClick={handleUpload}
                disabled={fileList.length === 0 || uploading}
                loading={uploading}
                style={{ marginTop: 16 }}
                block
              >
                {uploading ?"Uploading..." :"Upload Files"}
              </Button>
            </>
          ) : (
            <p>Loading assignment details...</p>
          )}
        </Content>

        <Footer style={{ textAlign:"center" }}>
          <b>© 2026 Draa. All Rights Reserved.</b>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default UploadAssignment;
