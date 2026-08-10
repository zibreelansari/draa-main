// frontend/src/pages/CourseCategoryManagement.tsx
import { useEffect, useState } from'react';
import {
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  Space,
  Divider,
  message,
  Typography,
  Card,
  Layout,
  Alert,
  Table,
  Modal,
  Switch,
  Popconfirm,
  Tag,
  Tooltip
} from"antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  TagsOutlined,
  InfoCircleOutlined
} from"@ant-design/icons";
import axios from'axios';
import { useNavigate } from'react-router-dom';
import Sidebar from'./Sidebar';
import Topbar from'./Topbar';
import Sidebar2 from'./Sidebar2';
import url from'../../url';
import { getUserRole, getAuthHeaders, redirectToLogin } from'../../utils/global_auth';
import usePageTitle from '../../hooks/usePageTitle';

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;
const { Content, Footer } = Layout;

//  UPDATED: Interface with keywords field
interface CourseCategory {
  _id: string;
  name: string;
  description?: string;
  slug: string;
  icon: string;
  color: string;
  image?: string;
  keywords: string[]; //  NEW: Added keywords field
  isActive: boolean;
  order: number;
  courseCount: number;
}
const CourseCategoryManagement = () => {
  const navigate = useNavigate();
  const [loginUser, setLoginuser] = useState<{
    id?: string;
    name?: string;
    tname?: string;
    aname?: string;
    isVerified?: boolean;
    Status?: string;
  }>({});
  const [form] = Form.useForm();
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CourseCategory | null>(null);

  //  Enhanced Auth & Teacher Verification Check
  useEffect(() => {
    const role = getUserRole();

    //  Not logged in
    if (role ==="GUEST") {
      redirectToLogin(navigate, "Please login to continue");
      return;
    }

    //  Students not allowed
    if (role ==="STUDENT") {
      message.error("Access denied. Admin or Teacher only.", 6);
      navigate("/student-dashboard");
      return;
    }

    // Load user from storage
    const raw = localStorage.getItem("edudocs");
    if (!raw) {
      redirectToLogin(navigate, "Session expired. Please login again.");
      return;
    }

    try {
      const user = JSON.parse(raw);

      //  Teacher extra checks
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

      //  Admin OR verified+approved teacher allowed
      setLoginuser(user);

    } catch {
      redirectToLogin(navigate, "Invalid session. Please login again.");
    }
  }, [navigate]);

  //  Fetch categories based on user role
  useEffect(() => {
    const fetch = async () => {
      if (!loginUser.id) {
        return;
      }
      await fetchCategories();
    };
    fetch();
  }, [loginUser.id, loginUser.tname, loginUser.aname]);

  //  AUTH GUARD: Don't render form until user is verified
  if (!loginUser || Object.keys(loginUser).length === 0) {
    return (
      <Layout style={{ minHeight:"100vh" }}>
        <Content style={{ display:'flex', justifyContent:'center', alignItems:'center' }}>
          <Card>
            <Typography.Text>Checking authentication and permissions...</Typography.Text>
          </Card>
        </Content>
      </Layout>
    );
  }

  const openCreateModal = () => {
    setEditingCategory(null);
    form.resetFields();
    setModalVisible(true);
  };

  const openEditModal = (category: CourseCategory) => {
    setEditingCategory(category);
    form.setFieldsValue({
      ...category,
      keywords: category.keywords || [] //  Ensure keywords is always an array
    });
    setModalVisible(true);
  };

  //  Handle delete category
  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${url}/course/categories/${id}`, {
        headers: {
          ...getAuthHeaders()
        }
      });
      message.success(" Category Deleted Successfully!");
      fetchCategories();
    } catch (err: any) {
      message.error(err.response?.data?.message ||" Error deleting category.");
    }
  };

  //  Separate fetchCategories function for reuse
  const fetchCategories = async () => {
    setLoading(true);
    try {
      let response;

      //  Fetch based on user role
      if (loginUser.tname) {
        // Teacher - fetch only their categories
        response = await axios.get(`${url}/course/categories/teacher/${loginUser.id}?includeCount=true`, {
          headers: {
            ...getAuthHeaders()
          }
        });
      } else if (loginUser.aname) {
        // Admin - fetch all categories
        response = await axios.get(`${url}/course/categories?includeCount=true`, {
          headers: {
            ...getAuthHeaders()
          }
        });
      }

      setCategories(response?.data.data.categories || []);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      message.error('Failed to fetch categories.');
    } finally {
      setLoading(false);
    }
  };

  //  UPDATED: Handle form submission with keywords
  const handleSubmit = async (values: any) => {
    const payload = {
      name: values.name,
      description: values.description,
      icon: values.icon,
      color: values.color,
      order: values.order || 0,
      isActive: values.isActive !== undefined ? values.isActive : true,
      keywords: values.keywords || [], //  NEW: Include keywords
      createdBy: loginUser?.id,
      updatedBy: loginUser?.id
    };

    try {
      if (editingCategory) {
        await axios.put(`${url}/course/categories/${editingCategory._id}`, payload, {
          headers: {
            ...getAuthHeaders()
          }
        });
        message.success(" Category Updated Successfully!");
      } else {
        await axios.post(`${url}/course/categories`, payload, {
          headers: {
            ...getAuthHeaders()
          }
        });
        message.success(" Category Created Successfully!");
      }

      setModalVisible(false);
      form.resetFields();
      setEditingCategory(null);
      fetchCategories();
    } catch (err: any) {
      message.error(err.response?.data?.message ||" Error saving category.");
    }
  };
  const iconOptions = [

    /* ================= CORE / GENERAL ================= */
    { value:'bx bx-category', label:'Category' },
    { value:'bx bx-grid-alt', label:'Modules / Grid' },
    { value:'bx bx-layer', label:'Layers' },
    { value:'bx bx-collection', label:'Collection' },
    { value:'bx bx-bookmark', label:'Bookmark' },

    /* ================= IT / SOFTWARE ================= */
    { value:'bx bx-code-alt', label:'Programming / Coding' },
    { value:'bx bx-terminal', label:'Terminal / CLI' },
    { value:'bx bx-bug', label:'Debugging' },
    { value:'bx bx-server', label:'Server / Backend' },
    { value:'bx bx-cloud', label:'Cloud Computing' },
    { value:'bx bx-chip', label:'Computer Architecture' },
    { value:'bx bx-brain', label:'Artificial Intelligence' },
    { value:'bx bx-bot', label:'Machine Learning / Bots' },
    { value:'bx bx-data', label:'Data Science / Database' },
    { value:'bx bx-analyse', label:'Data Analysis' },
    { value:'bx bx-shield-quarter', label:'Cyber Security' },
    { value:'bx bx-lock-alt', label:'Ethical Hacking' },
    { value:'bx bx-network-chart', label:'Networking' },
    { value:'bx bx-cog', label:'System Engineering' },

    /* ================= ENGINEERING ================= */
    { value:'bx bx-wrench', label:'Mechanical Engineering' },
    { value:'bx bx-buildings', label:'Civil Engineering' },
    { value:'bx bx-bolt-circle', label:'Electrical Engineering' },
    { value:'bx bx-chip', label:'Electronics Engineering' },
    { value:'bx bx-car', label:'Automobile Engineering' },
    { value:'bx bx-hard-hat', label:'Industrial Engineering' },

    /* ================= MEDICAL / PHARMA ================= */
    { value:'bx bx-plus-medical', label:'Medical' },
    { value:'bx bx-pulse', label:'Physiology' },
    { value:'bx bx-capsule', label:'Pharmacy' },
    { value:'bx bx-injection', label:'Nursing' },
    { value:'bx bx-dna', label:'Biotechnology' },
    { value:'bx bx-test-tube', label:'Chemistry' },
    { value:'bx bx-flask', label:'Laboratory' },

    /* ================= EDUCATION ================= */
    { value:'bx bx-book', label:'Books' },
    { value:'bx bx-book-open', label:'Study Material' },
    { value:'bx bx-notepad', label:'Notes' },
    { value:'bx bx-edit', label:'Writing Practice' },
    { value:'bx bx-chalkboard', label:'Classroom' },
    { value:'bx bx-graduation', label:'Graduation' },
    { value:'bx bx-award', label:'Certification' },

    /* ================= SCIENCE / MATH ================= */
    { value:'bx bx-atom', label:'Physics' },
    { value:'bx bx-calculator', label:'Mathematics' },
    { value:'bx bx-math', label:'Advanced Mathematics' },
    { value:'bx bx-line-chart', label:'Statistics' },
    { value:'bx bx-pie-chart-alt', label:'Probability' },

    /* ================= BANKING / FINANCE ================= */
    { value:'bx bx-bank', label:'Banking' },
    { value:'bx bx-rupee', label:'Indian Economy' },
    { value:'bx bx-wallet', label:'Finance' },
    { value:'bx bx-credit-card', label:'Cards / Payments' },
    { value:'bx bx-money', label:'Accounting' },
    { value:'bx bx-bar-chart-alt', label:'Financial Analysis' },
    { value:'bx bx-trending-up', label:'Stock Market' },
    { value:'bx bx-line-chart-down', label:'Risk Management' },

    /* ================= COMMERCE / CA / CS ================= */
    { value:'bx bx-calculator', label:'Accounting & Taxation' },
    { value:'bx bx-receipt', label:'GST / Tax' },
    { value:'bx bx-file', label:'Auditing' },
    { value:'bx bx-spreadsheet', label:'Cost Accounting' },

    /* ================= LAW / JUDICIARY ================= */
    { value:'bx bx-briefcase-alt', label:'Law' },
    { value:'bx bx-balance', label:'Judiciary / Court' },
    { value:'bx bx-gavel', label:'Legal Practice' },
    { value:'bx bx-shield', label:'Constitution / Rights' },
    { value:'bx bx-building-house', label:'Law Firm' },
    { value:'bx bx-file-find', label:'Legal Research' },

    /* ================= GOVERNMENT EXAMS ================= */
    { value:'bx bx-landmark', label:'UPSC' },
    { value:'bx bx-buildings', label:'SSC / CGL' },
    { value:'bx bx-train', label:'Railway Exams' },
    { value:'bx bx-police', label:'Police Exams' },
    { value:'bx bx-flag', label:'State PSC' },
    { value:'bx bx-shield-quarter', label:'Defence Exams' },

    /* ================= PRIVATE / CORPORATE ================= */
    { value:'bx bx-briefcase', label:'Corporate Jobs' },
    { value:'bx bx-building', label:'Private Sector' },
    { value:'bx bx-user-voice', label:'HR / Recruitment' },
    { value:'bx bx-user-check', label:'Interview Prep' },
    { value:'bx bx-presentation', label:'Management' },
    { value:'bx bx-chart', label:'Business Analytics' },

    /* ================= MARKETING / DESIGN ================= */
    { value:'bx bx-palette', label:'UI / UX Design' },
    { value:'bx bx-image', label:'Graphic Design' },
    { value:'bx bx-video', label:'Video Editing' },
    { value:'bx bx-camera', label:'Photography' },
    { value:'bx bx-bullhorn', label:'Digital Marketing' },
    { value:'bx bx-search-alt', label:'SEO' },
    { value:'bx bx-message-dots', label:'Content Writing' },

    /* ================= PRODUCTIVITY ================= */
    { value:'bx bx-task', label:'Task Management' },
    { value:'bx bx-time', label:'Time Management' },
    { value:'bx bx-calendar', label:'Planning' },
    { value:'bx bx-bulb', label:'Innovation' },
    { value:'bx bx-target-lock', label:'Goal Setting' },

    /* ================= GLOBAL ================= */
    { value:'bx bx-globe', label:'International Studies' },
    { value:'bx bx-map', label:'Geography' },
    { value:'bx bx-world', label:'Global Affairs' }

  ];

  const colorOptions = [
'#007bff','#28a745','#dc3545','#ffc107',
'#17a2b8','#6f42c1','#fd7e14','#20c997',
'#e83e8c','#6c757d','#343a40','#f8f9fa'
  ];

  //  NEW: Predefined keyword suggestions
  const keywordSuggestions = [
'class 11',
'class 12',
'dropper',
'dropout',
'beginner',
'intermediate',
'advanced',
'jee',
'jee main',
'jee advanced',
'neet',
'neet ug',
'foundation',
'boards',
'cbse',
'icse',
'state board',
'competitive exam',
'entrance exam',
'olympiad'
  ];

  //  UPDATED: Table columns with keywords column
  const columns = [
    {
      title:'Order',
      dataIndex:'order',
      key:'order',
      width: 80,
      sorter: (a: CourseCategory, b: CourseCategory) => a.order - b.order,
    },
    {
      title:'Name',
      dataIndex:'name',
      key:'name',
      render: (text: string, record: CourseCategory) => (
        <Space>
          <i className={record.icon} style={{ color: record.color, fontSize:'18px' }}></i>
          <span style={{ fontWeight:'600' }}>{text}</span>
        </Space>
      ),
    },
    {
      title:'Description',
      dataIndex:'description',
      key:'description',
      render: (text: string) => text ? (
        <Tooltip title={text}>
          {text?.substring(0, 50) + (text?.length > 50 ?'...' :'')}
        </Tooltip>
      ) : <span style={{ color:'#999' }}>No description</span>,
    },
    //  NEW: Keywords column
    {
      title: (
        <Space>
          <TagsOutlined />
          Keywords
        </Space>
      ),
      dataIndex:'keywords',
      key:'keywords',
      width: 280,
      render: (keywords: string[]) => (
        <div style={{ maxWidth: 250 }}>
          {keywords && keywords.length > 0 ? (
            <>
              {keywords.slice(0, 3).map((keyword, index) => (
                <Tag
                  key={index}
                  color="blue"
                  style={{ marginBottom: 4, marginRight: 4 }}
                >
                  {keyword}
                </Tag>
              ))}
              {keywords.length > 3 && (
                <Tooltip title={keywords.slice(3).join(',')}>
                  <Tag color="purple" style={{ marginBottom: 4 }}>
                    +{keywords.length - 3} more
                  </Tag>
                </Tooltip>
              )}
            </>
          ) : (
            <Tag color="default" icon={<InfoCircleOutlined />}>
              No keywords
            </Tag>
          )}
        </div>
      ),
    },
    {
      title:'Courses',
      dataIndex:'courseCount',
      key:'courseCount',
      width: 100,
      align:'center' as const,
      render: (count: number) => (
        <Tag color={count > 0 ?'blue' :'default'}>{count}</Tag>
      ),
    },
    {
      title:'Status',
      dataIndex:'isActive',
      key:'isActive',
      width: 100,
      align:'center' as const,
      render: (isActive: boolean) => (
        <Tag color={isActive ?'green' :'red'}>
          {isActive ?'Active' :'Inactive'}
        </Tag>
      ),
    },
    {
      title:'Actions',
      key:'actions',
      width: 150,
      align:'center' as const,
      render: (_: any, record: CourseCategory) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Category?"
            description={
              record.courseCount > 0
                ? `Cannot delete! ${record.courseCount} courses are using this category.`
                :"This action cannot be undone. Are you sure?"
            }
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
            disabled={record.courseCount > 0}
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              disabled={record.courseCount > 0}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight:"100vh" }}>
      {/* Sidebar based on role */}
      {"aname" in (loginUser || {}) ? <Sidebar /> : <Sidebar2 />}

      <Layout>
        <Topbar />

        <Content style={{ margin:"24px 16px", padding: 24 }}>
          <Card
            bordered
            style={{
              padding:"2rem",
              borderRadius:"16px",
              boxShadow:"0 4px 14px rgba(0,0,0,0.1)"
            }}
          >
            <Title level={3} style={{ textAlign:"center", marginBottom: 20 }}>
              <TagsOutlined style={{ marginRight: 8 }} />
              Manage Course Categories
            </Title>

            {/*  Status Information for Teachers */}
            {loginUser.tname && (
              <Alert
                message="Teacher Account Status"
                description={
                  <div>
                    <div> <strong>Verified:</strong> {loginUser.isVerified ?'Yes' :'No'}</div>
                    <div> <strong>Status:</strong> {loginUser.Status}</div>
                    <div> <strong>Permissions:</strong> Your Category Management</div>
                    <div style={{ marginTop: 8, color:'#52c41a' }}>
                      Your account is verified and approved. You can manage your course categories.
                    </div>
                  </div>
                }
                type="success"
                showIcon
                style={{ marginBottom: 24 }}
              />
            )}

            {/*  Status Information for Admins */}
            {loginUser.aname && (
              <Alert
                message="Admin Access Granted"
                description={
                  <div>
                    <div> <strong>Role:</strong> Administrator</div>
                    <div> <strong>Permissions:</strong> Full Category Management</div>
                    <div style={{ marginTop: 8, color:'#52c41a' }}>
                      You have full access to manage all course categories.
                    </div>
                  </div>
                }
                type="success"
                showIcon
                style={{ marginBottom: 24 }}
              />
            )}

            {/* Categories Table */}
            <Card
              title={
                <Space>
                  <TagsOutlined />
                  Course Categories
                  {loginUser.tname && <Tag color="blue">Your Categories</Tag>}
                  {loginUser.aname && <Tag color="purple">All Categories</Tag>}
                </Space>
              }
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={openCreateModal}
                  size="large"
                >
                  Add New Category
                </Button>
              }
              style={{ marginBottom: 24 }}
            >
              <Table
                columns={columns}
                dataSource={categories}
                rowKey="_id"
                loading={loading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} categories`,
                }}
                scroll={{ x: 1200 }}
              />
            </Card>

            {/*  UPDATED: Category Modal with Keywords Field */}
            <Modal
              title={
                <Space>
                  <TagsOutlined />
                  {editingCategory ?"Edit Category" :"Add New Category"}
                </Space>
              }
              open={modalVisible}
              onCancel={() => {
                setModalVisible(false);
                setEditingCategory(null);
                form.resetFields();
              }}
              footer={null}
              width={700}
              destroyOnClose
            >
              <Form
                layout="vertical"
                form={form}
                onFinish={handleSubmit}
                initialValues={{
                  icon:'bx bx-category',
                  color:'#007bff',
                  order: 0,
                  isActive: true,
                  keywords: [] //  NEW: Initialize keywords as empty array
                }}
              >
                {/* Hidden input for createdBy */}
                <Form.Item name="createdBy" initialValue={loginUser?.id} style={{ display:'none' }}>
                  <Input type="hidden" />
                </Form.Item>

                {/* Category Name */}
                <Form.Item
                  label="Category Name"
                  name="name"
                  rules={[
                    { required: true, message:'Please enter category name' },
                    { max: 100, message:'Category name must be less than 100 characters' }
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="Enter category name (e.g., JEE Advanced Physics)"
                  />
                </Form.Item>

                {/* Description */}
                <Form.Item
                  label="Description"
                  name="description"
                  rules={[
                    { max: 500, message:'Description must be less than 500 characters' }
                  ]}
                >
                  <TextArea
                    rows={3}
                    placeholder="Enter category description..."
                    showCount
                    maxLength={500}
                  />
                </Form.Item>

                {/*  NEW: Keywords Field */}
                <Form.Item
                  label={
                    <Space>
                      <TagsOutlined />
                      Keywords
                      <Tooltip title="Add keywords to help students find courses. Examples: class 11, class 12, JEE, NEET, dropper, etc. Press Enter or comma to add.">
                        <InfoCircleOutlined style={{ color:'#1890ff' }} />
                      </Tooltip>
                    </Space>
                  }
                  name="keywords"
                  tooltip="Keywords help in search and categorization. Type and press Enter or comma to add multiple keywords."
                  rules={[
                    {
                      validator: (_, value) => {
                        if (value && value.some((k: string) => k.length > 50)) {
                          return Promise.reject('Each keyword must be 50 characters or less');
                        }
                        if (value && value.length > 20) {
                          return Promise.reject('Maximum 20 keywords allowed');
                        }
                        return Promise.resolve();
                      }
                    }
                  ]}
                >
                  <Select
                    mode="tags"
                    size="large"
                    placeholder="Type keyword and press Enter (e.g., class 11, JEE, NEET)"
                    style={{ width:'100%' }}
                    tokenSeparators={[',']}
                    maxTagCount="responsive"
                    maxTagTextLength={30}
                  >
                    {/* Pre-defined keyword suggestions */}
                    {keywordSuggestions.map((keyword) => (
                      <Option key={keyword} value={keyword}>
                        <Space>
                          <TagsOutlined />
                          {keyword}
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Divider style={{ margin:'16px 0' }} />

                {/* Icon, Color, and Order in one row */}
                <Space size="large" wrap style={{ width:'100%', marginBottom: 16 }}>
                  <Form.Item
                    label="Icon"
                    name="icon"
                    rules={[{ required: true, message:'Please select an icon' }]}
                  >
                    <Select
                      size="large"
                      showSearch
                      placeholder="Search icon (e.g. code, mobile, brain)"
                      optionFilterProp="label"
                      filterOption={(input, option) =>
                        option?.label
                          ?.toLowerCase()
                          .includes(input.toLowerCase()) ||
                        option?.value
                          ?.toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      style={{ width: 260 }}
                    >
                      {iconOptions.map((icon) => (
                        <Select.Option
                          key={icon.value}
                          value={icon.value}
                          label={icon.label}
                        >
                          <Space>
                            <i className={icon.value} style={{ fontSize: 18 }} />
                            <span>{icon.label}</span>
                          </Space>
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="Color"
                    name="color"
                    rules={[{ required: true, message:'Please select a color' }]}
                  >
                    <Select placeholder="Choose Color" style={{ width: 180 }} size="large">
                      {colorOptions.map((color) => (
                        <Option key={color} value={color}>
                          <Space>
                            <div style={{
                              width: 20,
                              height: 20,
                              backgroundColor: color,
                              borderRadius:'50%',
                              border:'1px solid #ddd'
                            }}></div>
                            {color}
                          </Space>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="Display Order"
                    name="order"
                    tooltip="Lower numbers appear first"
                  >
                    <InputNumber
                      min={0}
                      max={1000}
                      size="large"
                      style={{ width: 140 }}
                      placeholder="0"
                    />
                  </Form.Item>
                </Space>

                {/* Status */}
                <Form.Item
                  label="Status"
                  name="isActive"
                  valuePropName="checked"
                  tooltip="Inactive categories won't be visible to students"
                >
                  <Switch
                    checkedChildren="Active"
                    unCheckedChildren="Inactive"
                    defaultChecked
                  />
                </Form.Item>

                <Divider />

                {/* Action Buttons */}
                <Form.Item style={{ marginBottom: 0 }}>
                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      icon={editingCategory ? <EditOutlined /> : <PlusOutlined />}
                    >
                      {editingCategory ?"Update Category" :"Create Category"}
                    </Button>
                    <Button
                      size="large"
                      onClick={() => {
                        setModalVisible(false);
                        setEditingCategory(null);
                        form.resetFields();
                      }}
                    >
                      Cancel
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Modal>
          </Card>
        </Content>

        <Footer style={{ textAlign:"center" }}>
          <b>© 2026 Draa. All Rights Reserved.</b>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default CourseCategoryManagement;
