import { useEffect, useState } from'react';
import {
  Form,
  Input,
  Button,
  Table,
  message as antdMessage,
  Space,
  Card,
  Layout,
  Alert
} from'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, CloseOutlined } from'@ant-design/icons';
import axios from'axios';
import { useNavigate } from'react-router-dom';
import Sidebar from'./Sidebar';
import Topbar from'./Topbar';
import Sidebar2 from'./Sidebar2';
import url from'../../url';
import usePageTitle from '../../hooks/usePageTitle';

const { Content, Footer } = Layout;

const BookCategoriesManager = () => {
  const navigate = useNavigate();

  //  ALL HOOKS AT TOP LEVEL - NEVER CONDITIONAL
  const [loginUser, setLoginuser] = useState<{
    tname?: string;
    aname?: string;
    isVerified?: boolean;
    Status?: string;
  }>({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  //  SINGLE AUTH CHECK useEffect
  useEffect(() => {
    const edudocsStr = localStorage.getItem('edudocs');

    if (!edudocsStr) {
      antdMessage.warning("You are not logged in! Please log in first.", 7);
      navigate("/admin-login");
      return;
    }

    try {
      const user = JSON.parse(edudocsStr);

      //  CHECK: If user is a teacher, verify they are approved and verified
      if (user.tname) {
        if (user.isVerified !== true) {
          antdMessage.error("Your account is not verified yet. Please verify your email before managing book categories.", 8);
          navigate("/teacher-dashboard");
          return;
        }

        if (user.Status !=="approved") {
          antdMessage.error("Your account is not approved yet. Please wait for admin approval before managing book categories.", 8);
          navigate("/teacher-dashboard");
          return;
        }

        antdMessage.success("Welcome! You can now manage book categories.", 3);
      } else if (!user.aname) {
        antdMessage.error("Access denied. Only verified teachers and admins can manage book categories.", 7);
        navigate("/login");
        return;
      }

      setLoginuser(user);
      setIsAuthChecked(true);

    } catch (error) {
      console.error('Error parsing user data:', error);
      antdMessage.error("Invalid session data. Please login again.");
      navigate("/admin-login");
    }
  }, [navigate]);

  //  FETCH CATEGORIES useEffect
  const fetchCategories = async () => {
    if (!isAuthChecked) return;

    try {
      const res = await axios.get(`${url}/books/categories/all`);
      setCategories(res.data.categories);
    } catch (err) {
      antdMessage.error('Failed to load categories');
    }
  };

  useEffect(() => {
    if (isAuthChecked) {
      fetchCategories();
    }
  }, [isAuthChecked]);

  //  CONDITIONAL RENDERING AFTER ALL HOOKS
  if (!isAuthChecked) {
    return (
      <Layout style={{ minHeight:'100vh' }}>
        <Content style={{ display:'flex', justifyContent:'center', alignItems:'center' }}>
          <Alert
            message="Checking Authentication"
            description="Please wait while we verify your permissions..."
            type="info"
            showIcon
          />
        </Content>
      </Layout>
    );
  }

  interface FormValues {
    name: string;
  }

  const handleSubmit = async (values: FormValues): Promise<void> => {
    setLoading(true);
    try {
      if (editingId) {
        await axios.put(`${url}/books/categories/${editingId}`, { name: values.name });
        antdMessage.success('Category updated successfully');
      } else {
        await axios.post(`${url}/books/categories/create`, { name: values.name });
        antdMessage.success('Category created successfully');
      }
      form.resetFields();
      setEditingId(null);
      fetchCategories();
    } catch (err: any) {
      antdMessage.error(err.response?.data?.message ||'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  interface HandleDeleteProps {
    id: string;
  }

  const handleDelete = async (id: HandleDeleteProps['id']): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await axios.delete(`${url}/books/categories/${id}`);
      antdMessage.success('Category deleted');
      fetchCategories();
    } catch (err) {
      antdMessage.error('Failed to delete category');
    }
  };

  interface StartEditCategory {
    _id: string;
    name: string;
    createdAt?: string;
  }

  const startEdit = (category: StartEditCategory): void => {
    setEditingId(category._id);
    form.setFieldsValue({ name: category.name });
  };

  const cancelEdit = () => {
    setEditingId(null);
    form.resetFields();
  };

  interface CategoryTableRecord {
    _id: string;
    name: string;
    createdAt: string;
  }

  interface ColumnsType {
    title: string;
    dataIndex?: keyof CategoryTableRecord;
    key?: string;
    render?: (value: any, record?: CategoryTableRecord, index?: number) => React.ReactNode;
    width?: string | number;
  }

  const columns: ColumnsType[] = [
    {
      title:'#',
      render: (_: any, _record?: CategoryTableRecord, index?: number) => <span>{(index ?? 0) + 1}</span>,
      width:'5%',
    },
    {
      title:'Category Name',
      dataIndex:'name',
      key:'name',
    },
    {
      title:'Created At',
      dataIndex:'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title:'Actions',
      key:'actions',
      render: (_: any, record?: CategoryTableRecord) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => record && startEdit(record)}
            disabled={!record}
          >
            Edit
          </Button>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => record && handleDelete(record._id)}
            disabled={!record}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight:"100vh" }}>
      {/* Sidebar based on role (kept integrity) */}
      {"aname" in (loginUser || {}) ? <Sidebar /> : <Sidebar2 />}

      <Layout>
        <Topbar />

        <Content style={{ margin:"24px 16px", padding: 24 }}>
          {/*  ADDED: Status Information for Teachers */}
          {loginUser.tname && (
            <Alert
              message="Teacher Account Status"
              description={
                <div>
                  <div> <strong>Verified:</strong> {loginUser.isVerified ?'Yes' :'No'}</div>
                  <div> <strong>Status:</strong> {loginUser.Status}</div>
                  <div style={{ marginTop: 8, color:'#52c41a' }}>
                    Your account is verified and approved. You can manage book categories.
                  </div>
                </div>
              }
              type="success"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          <Card
            title="Manage Book Categories"
            bordered
            style={{ maxWidth:'800px', margin:'auto' }}
          >
            <Form
              form={form}
              layout="inline"
              onFinish={handleSubmit}
              style={{ marginBottom: 20 }}
            >
              <Form.Item
                name="name"
                rules={[{ required: true, message:'Category name is required' }]}
              >
                <Input placeholder="Enter category name" style={{ width: 250 }} />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={editingId ? <EditOutlined /> : <PlusOutlined />}
                  loading={loading}
                >
                  {editingId ?'Update' :'Add'}
                </Button>
              </Form.Item>
              {editingId && (
                <Form.Item>
                  <Button
                    icon={<CloseOutlined />}
                    onClick={cancelEdit}
                  >
                    Cancel
                  </Button>
                </Form.Item>
              )}
            </Form>

            <Table
              columns={columns}
              dataSource={categories}
              rowKey="_id"
              bordered
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Content>

        <Footer style={{ textAlign:"center" }}>
          <b>© 2026 Draa. All Rights Reserved.</b>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default BookCategoriesManager;
