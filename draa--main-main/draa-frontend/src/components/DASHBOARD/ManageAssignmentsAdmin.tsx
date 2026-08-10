import { useEffect, useState } from"react";
import axios from"axios";
// import { Link } from"react-router-dom";
import {
  Layout,
  Table,
  Button,
  Space,
  Modal,
  DatePicker,
  message,
} from"antd";
import dayjs from"dayjs";

import Topbar from"./Topbar";
import Sidebar from"./Sidebar";

import url from"../../url";
import usePageTitle from '../../hooks/usePageTitle';

const { Content, Footer } = Layout;

const ManageAssignmentsAdmin = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loginUser, setLoginUser] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const [showLiveModal, setShowLiveModal] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<any>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("edudocs") ||"{}");
    setLoginUser(user);
    if (user?.aname) fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${url}/assignmments/admin/assignments`);
      setAssignments(res.data.assignments || []);
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch assignments");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenLiveModal = (id: string) => {
    setSelectedAssignmentId(id);
    setShowLiveModal(true);
  };
 
 
  console.log(loginUser);
  console.log(handleOpenLiveModal);
  
  
   
  const handleMakeLiveConfirm = async () => {
    if (!dueDate) return message.warning("Please select a due date");

    try {
      await axios.put(`${url}/assignmments/make-live/${selectedAssignmentId}`, {
        dueDate: dueDate.toISOString(),
      });
      message.success("Assignment is now live");
      setShowLiveModal(false);
      setSelectedAssignmentId(null);
      fetchAssignments();
      setDueDate(null);
    } catch (err) {
      console.error(err);
      message.error("Failed to make assignment live");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${url}/assignmments/delete/${id}`);
      message.success("Assignment deleted");
      fetchAssignments();
    } catch (err) {
      console.error(err);
      message.error("Failed to delete assignment");
    }
  };

  const columns = [
    {
      title:"Title",
      dataIndex:"title",
      key:"title",
    },
    {
      title:"Subject",
      dataIndex:"subject",
      key:"subject",
    },
    {
      title:"Due Date",
      dataIndex:"dueDate",
      key:"dueDate",
      render: (text: string) => (text ? new Date(text).toLocaleString() :""),
    },
    {
      title:"Description",
      dataIndex:"description",
      key:"description",
      render: (text: string) => text ||"",
    },
    {
      title:"Actions",
      key:"actions",
      render: (_: any, record: any) => (
        <Space>
          {/* <Link to={`/upload-assignment/${record._id}`}>
            <Button type="primary" size="small">
              Upload
            </Button>
          </Link> */}
          {/* <Link to={`/edit-assignment/${record._id}`}>
            <Button type="default" size="small">
              Edit
            </Button>
          </Link> */}
          {/* <Button
            type="dashed"
            size="small"
            disabled={record.status ==="live"}
            onClick={() => handleOpenLiveModal(record._id)}
          >
            Make Live
          </Button> */}
          <Button
            onClick={() => handleDelete(record._id)}
            type="primary"
            danger
            size="small"
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight:"100vh" }}>
      {/* Sidebar */}
       <Sidebar />

      <Layout>
        <Topbar />

        <Content style={{ margin:"24px 16px", padding: 24, background:"#fff" }}>
          <h3 className="mb-3">Manage Assignments</h3>
          <Table
            columns={columns}
            dataSource={assignments}
            rowKey="_id"
            loading={loading}
            bordered
            pagination={{ pageSize: 5 }}
          />

          <Modal
            title="Make Assignment Live"
            open={showLiveModal}
            onCancel={() => setShowLiveModal(false)}
            onOk={handleMakeLiveConfirm}
            okText="Make Live"
          >
            <p>Please select a due date:</p>
            <DatePicker
              showTime
              value={dueDate}
              onChange={(date) => setDueDate(date)}
              disabledDate={(current) => current && current < dayjs().startOf("day")}
            />
          </Modal>
        </Content>

        <Footer style={{ textAlign:"center" }}>
          <b>© 2026 Draa. All Rights Reserved.</b>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default ManageAssignmentsAdmin;
