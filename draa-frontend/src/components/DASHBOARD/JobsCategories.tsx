import React, { useEffect, useState } from'react';
import {
  Table,
  Form,
  Input,
  Button,
  Space,
  Modal,
  Popconfirm,
  message,
  Tag,
  Layout,
  Alert,
} from'antd';
import axios from'axios';
import { useNavigate } from'react-router-dom';
import Sidebar from'./Sidebar';
import Topbar from'./Topbar';
import Sidebar2 from'./Sidebar2';
import url from'../../url';
import { getUserRole } from'../../utils/global_auth';
import usePageTitle from '../../hooks/usePageTitle';

const { Content, Footer } = Layout;

interface LoginUser {
  name?: string;
  tname?: string;
  aname?: string;
  isVerified?: boolean;
  Status?: string;
}

interface Category {
  _id: string;
  name: string;
  subcategories?: string[];
}

interface FormValues {
  name: string;
  subcategories?: string;
}

const JobCategories: React.FC = () => {
  usePageTitle('Job Categories | Admin');
  const navigate = useNavigate();

  //  ALL HOOKS AT TOP LEVEL - NEVER CONDITIONAL
  const [loginUser, setLoginuser] = useState<LoginUser>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  //  SINGLE AUTH CHECK useEffect
  useEffect(() => {
    const role = getUserRole();

    //  Guest
    if (role ==="GUEST") {
      message.warning("Please login to continue", 6);
      navigate("/admin-login");
      return;
    }

    //  Student
    if (role ==="STUDENT") {
      message.error("Students are not allowed to manage job categories.", 6);
      navigate("/student-dashboard");
      return;
    }

    const raw = localStorage.getItem("edudocs");
    if (!raw) {
      message.error("Session expired. Please login again.");
      navigate("/admin-login");
      return;
    }

    try {
      const user = JSON.parse(raw);

      //  Teacher validation
      if (role ==="TEACHER") {
        if (user.isVerified !== true) {
          message.error("Your account is not verified yet.", 7);
          navigate("/teacher-dashboard");
          return;
        }

        if (user.Status !=="approved") {
          message.error("Your account is not approved yet.", 7);
          navigate("/teacher-dashboard");
          return;
        }
      }

      //  Admin OR verified teacher
      setLoginuser(user);
      setIsAuthChecked(true);
    } catch {
      message.error("Invalid session. Please login again.");
      navigate("/admin-login");
    }
  }, [navigate]);
  //  FETCH CATEGORIES useEffect
  const fetchCategories = async () => {
    if (!loginUser || Object.keys(loginUser).length === 0) return;

    try {
      setLoading(true);
      const res = await axios.get<{ categories: Category[] }>(`${url}/jobs/categories/fetch`);
      setCategories(res.data.categories || []);
    } catch (err) {
      message.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthChecked) {
      fetchCategories();
    }
  }, [isAuthChecked]);

  //  CONDITIONAL RENDERING AFTER ALL HOOKS
  if (!loginUser || Object.keys(loginUser).length === 0) {
    return (
      <Layout style={{ minHeight:"100vh" }}>
        <Content style={{ display:"flex", justifyContent:"center", alignItems:"center" }}>
          <Alert
            message="Checking authentication"
            description="Please wait while we verify your permissions..."
            type="info"
            showIcon
          />
        </Content>
      </Layout>
    );
  }

  const openModal = (category: Category | null = null) => {
    if (category) {
      form.setFieldsValue({
        name: category.name,
        subcategories: category.subcategories?.join(','),
      });
    } else {
      form.resetFields();
    }
    setEditingCategory(category);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingCategory(null);
    form.resetFields();
  };

  const handleFinish = async (values: FormValues) => {
    const payload = {
      name: values.name,
      subcategories: values.subcategories
        ? values.subcategories.split(',').map((s) => s.trim())
        : [],
    };

    try {
      if (editingCategory) {
        await axios.put(`${url}/jobs/categories/${editingCategory._id}`, payload);
        message.success('Category updated');
      } else {
        await axios.post(`${url}/jobs/categories/create`, payload);
        message.success('Category created');
      }
      fetchCategories();
      handleCancel();
    } catch (err: any) {
      message.error('Operation failed:' + (err.response?.data?.message || err.message));
    }
  };

  const onDelete = async (id: string) => {
    try {
      await axios.delete(`${url}/jobs/categories/${id}`);
      message.success('Category deleted');
      fetchCategories();
    } catch {
      message.error('Failed to delete');
    }
  };

  const columns = [
    {
      title:'Category Name',
      dataIndex:'name',
      key:'name',
    },
    {
      title:'Subcategories',
      dataIndex:'subcategories',
      key:'subcategories',
      render: (subs: string[] | undefined) =>
        subs && subs.length > 0 ? subs.map((sub, idx) => <Tag key={idx}>{sub}</Tag>) :'-',
    },
    {
      title:'Actions',
      key:'actions',
      render: (_: any, record: Category) => (
        <Space>
          <Button onClick={() => openModal(record)} type="link">
            Edit
          </Button>
          <Popconfirm
            title="Are you sure to delete this category?"
            onConfirm={() => onDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (!loginUser || Object.keys(loginUser).length === 0) {
    return (
      <Layout style={{ minHeight:"100vh" }}>
        <Content style={{ display:"flex", justifyContent:"center", alignItems:"center" }}>
          <Alert
            message="Checking authentication"
            description="Please wait while we verify your permissions..."
            type="info"
            showIcon
          />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight:'100vh' }}>
      {getUserRole() ==="ADMIN" ? <Sidebar /> : <Sidebar2 />}

      <Layout>
        <Topbar />

        <Content style={{ margin:'24px 16px', padding: 24 }}>
          {/*  ADDED: Status Information for Teachers */}
          {loginUser.tname && (
            <Alert
              message="Teacher Account Status"
              description={
                <div>
                  <div> <strong>Verified:</strong> {loginUser.isVerified ?'Yes' :'No'}</div>
                  <div> <strong>Status:</strong> {loginUser.Status}</div>
                  <div style={{ marginTop: 8, color:'#52c41a' }}>
                    Your account is verified and approved. You can manage job categories.
                  </div>
                </div>
              }
              type="success"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          <h2>Manage Job Categories</h2>

          <Button type="primary" onClick={() => openModal()} style={{ marginBottom: 20 }}>
            Add New Category
          </Button>

          <Table dataSource={categories} columns={columns} rowKey="_id" loading={loading} />

          <Modal
            title={editingCategory ?'Edit Category' :'Add Category'}
            open={isModalVisible}
            onCancel={handleCancel}
            footer={null}
            destroyOnClose
          >
            <Form form={form} layout="vertical" onFinish={handleFinish}>
              <Form.Item
                name="name"
                label="Category Name"
                rules={[{ required: true, message:'Please enter a category name' }]}
              >
                <Input placeholder="e.g. Government Jobs" />
              </Form.Item>

              <Form.Item name="subcategories" label="Subcategories (comma-separated)">
                <Input placeholder="e.g. Clerk, Engineering, Teaching" />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    {editingCategory ?'Update' :'Add'}
                  </Button>
                  <Button onClick={handleCancel}>Cancel</Button>
                </Space>
              </Form.Item>
            </Form>
          </Modal>
        </Content>

        <Footer style={{ textAlign:'center' }}>
          <b>© 2026 Draa. All Rights Reserved.</b>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default JobCategories;
