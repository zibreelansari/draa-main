import { useEffect, useState } from"react";
import {
  Form, Input, Button, Select, message, Table, Space, Modal, Tag, Popconfirm,
  Row, Col, Card, Divider, Tabs, Switch, DatePicker, InputNumber, Badge, Pagination, Layout
} from"antd";
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  FolderAddOutlined, FolderOutlined, SearchOutlined
} from"@ant-design/icons";
import axios from"axios";
import Sidebar from"./Sidebar";
import Topbar from"./Topbar";
import url from"../../url";
import moment from"moment";
import dayjs from"dayjs";
import ViewExamModal from"./ViewExamModal";
import { Upload } from"antd";
import { UploadOutlined } from"@ant-design/icons";
import { useNavigate } from"react-router-dom";
import Sidebar2 from"./Sidebar2";
import { getUserRole, getAuthHeaders } from"../../utils/global_auth";
import usePageTitle from '../../hooks/usePageTitle';

const { Content } = Layout;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

interface Exam {
  _id: string;
  name: string;
  slug: string;
  categoryId: string | { _id: string; name: string;[key: string]: any };
  [key: string]: any;
}

interface Category {
  _id: string;
  [key: string]: any;
}

const ExamManagement = () => {
  const [activeTab, setActiveTab] = useState("exams");
  const [exams, setExams] = useState<Exam[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalExams, setTotalExams] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);

  // Modals
  const [examModalVisible, setExamModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();
  const [categoryForm] = Form.useForm();
  const [viewExam, setViewExam] = useState<Exam | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [allBooks, setAllBooks] = useState<any[]>([]);
  const [allCourseContents, setAllCourseContents] = useState<any[]>([]);

  // Exam Form States
  const [phases, setPhases] = useState([]);
  const [cutoffs, setCutoffs] = useState([]);


  const navigate = useNavigate();
  const [loginUser, setLoginUser] = useState<any>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);


  useEffect(() => {
    const role = getUserRole();

    //  Guest
    if (role ==="GUEST") {
      message.warning("Please login to continue", 5);
      navigate("/admin-login");
      return;
    }

    //  Student
    if (role ==="STUDENT") {
      message.error("Students are not allowed to access exam management", 5);
      navigate("/student-dashboard");
      return;
    }

    //  Invalid role
    if (role !=="ADMIN" && role !=="TEACHER") {
      message.error("Unauthorized access", 5);
      navigate("/admin-login");
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

      //  Teacher extra checks
      if (role ==="TEACHER") {
        if (user.isVerified !== true) {
          message.error("Your account is not verified yet.", 6);
          navigate("/teacher-dashboard");
          return;
        }

        if (user.Status !=="approved") {
          message.error("Your account is not approved yet.", 6);
          navigate("/teacher-dashboard");
          return;
        }
      }

      setLoginUser(user);
      setIsAuthChecked(true);
    } catch {
      message.error("Invalid session. Please login again.");
      navigate("/admin-login");
    }
  }, [navigate]);


  // Load initial data
  useEffect(() => {
    loadExams();
    loadCategories();
    loadResources();   //  ADD THIS LINE
  }, []);


  useEffect(() => {
    loadExams();
  }, [currentPage, pageSize, searchTerm, filters]);

  // ================= EXAMS API CALLS =================
  const loadExams = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: pageSize,
        search: searchTerm || undefined,
        isManagement:"true",
        ...filters
      };
      const res = await axios.get(`${url}/exams/all`, { params, headers: getAuthHeaders() });
      setExams(res.data.exams || []);
      setTotalExams(res.data.totalExams || 0);
    } catch (err) {
      message.error("Failed to load exams");
    } finally {
      setLoading(false);
    }
  };

  const createExam = async (values: any) => {
    const formData = new FormData();

    //  Primitive fields (NO stringify)
    formData.append("name", values.name);
    formData.append("slug", values.slug);
    formData.append("categoryId", values.categoryId);
    formData.append("examLevel", values.examLevel);
    formData.append("mode", values.mode);
    formData.append("status", values.status ||"ACTIVE");

    //  Objects / Arrays (stringify)
    if (values.phases) {
      formData.append("phases", JSON.stringify(values.phases));
    }

    if (values.eligibility) {
      formData.append("eligibility", JSON.stringify(values.eligibility));
    }

    if (values.importantDates) {
      const formattedDates = {
        notificationDate: values.importantDates.notificationDate?.toISOString(),
        applicationStart: values.importantDates.applicationStart?.toISOString(),
        applicationEnd: values.importantDates.applicationEnd?.toISOString(),
        examDate: values.importantDates.examDate?.toISOString(),
        resultDate: values.importantDates.resultDate?.toISOString(),
      };

      formData.append("importantDates", JSON.stringify(formattedDates));
    }


    if (values.seo) {
      formData.append("seo", JSON.stringify(values.seo));
    }


    if (values.courses) {
      formData.append("courses", JSON.stringify(values.courses));
    }

    if (values.books) {
      formData.append("books", JSON.stringify(values.books));
    }

    if (values.courseContents) {
      formData.append("courseContents", JSON.stringify(values.courseContents));
    }

    //  Image
    if (values.examImage?.file) {
      formData.append("examImage", values.examImage.file);
    }

    await axios.post(`${url}/exams/create`, formData, {
      headers: { 
"Content-Type":"multipart/form-data",
        ...getAuthHeaders()
      }
    });

    message.success("Exam created successfully");
    setExamModalVisible(false);
    form.resetFields();
    loadExams();
  };



  const updateExam = async (values: any) => {
    if (!selectedExam) return;

    const formData = new FormData();

    formData.append("name", values.name);
    formData.append("slug", values.slug);
    formData.append("categoryId", values.categoryId);
    formData.append("examLevel", values.examLevel);
    formData.append("mode", values.mode);
    formData.append("status", values.status);

    if (values.phases) {
      formData.append("phases", JSON.stringify(values.phases));
    }

    if (values.eligibility) {
      formData.append("eligibility", JSON.stringify(values.eligibility));
    }

    if (values.importantDates) {
      const formattedDates = {
        notificationDate: values.importantDates.notificationDate?.toISOString(),
        applicationStart: values.importantDates.applicationStart?.toISOString(),
        applicationEnd: values.importantDates.applicationEnd?.toISOString(),
        examDate: values.importantDates.examDate?.toISOString(),
        resultDate: values.importantDates.resultDate?.toISOString(),
      };

      formData.append("importantDates", JSON.stringify(formattedDates));
    }


    if (values.seo) {
      formData.append("seo", JSON.stringify(values.seo));
    }
    if (values.courses) {
      formData.append("courses", JSON.stringify(values.courses));
    }

    if (values.books) {
      formData.append("books", JSON.stringify(values.books));
    }

    if (values.courseContents) {
      formData.append("courseContents", JSON.stringify(values.courseContents));
    }

    if (values.examImage?.file) {
      formData.append("examImage", values.examImage.file);
    }

    await axios.put(`${url}/exams/${selectedExam._id}`, formData, {
      headers: { 
"Content-Type":"multipart/form-data",
        ...getAuthHeaders()
      }
    });

    message.success("Exam updated successfully");
    setExamModalVisible(false);
    setSelectedExam(null);
    form.resetFields();
    loadExams();
  };



  // ================= CATEGORIES API CALLS =================
  const loadCategories = async () => {
    try {
      const res = await axios.get(`${url}/exam-categories/all`, { headers: getAuthHeaders() });
      setCategories(res.data.categories || []);
      setTotalCategories(res.data.categories?.length || 0);
    } catch (err) {
      message.error("Failed to load categories");
    }
  };

  const createCategory = async (values) => {
    try {
      await axios.post(`${url}/exam-categories/create`, values, { headers: getAuthHeaders() });
      message.success("Category created successfully");
      setCategoryModalVisible(false);
      categoryForm.resetFields();
      loadCategories();
      loadExams(); // Reload exams to update category names
    } catch (err: any) {
      message.error(err.response?.data?.message ||"Failed to create category");
    }
  };
  const loadResources = async () => {
    try {
      const [coursesRes, booksRes, contentRes] = await Promise.all([
        axios.get(`${url}/course/admin/courses/?limit=1000`, { headers: getAuthHeaders() }),
        axios.get(`${url}/books/approved?limit=1000`, { headers: getAuthHeaders() }),
        axios.get(`${url}/course/allCourseContent?limit=1000`, { headers: getAuthHeaders() })
      ]);

      setAllCourses(coursesRes.data.data?.courses || []);
      setAllBooks(booksRes.data.books || []);
      setAllCourseContents(contentRes.data.data || []);
    } catch {
      message.error("Failed to load resources");
    }
  };
  const updateCategory = async (values: any) => {
    try {
      if (!selectedCategory) {
        message.error("No category selected");
        return;
      }
      await axios.put(`${url}/exam-categories/${selectedCategory._id}`, values, { headers: getAuthHeaders() });
      message.success("Category updated successfully");
      setCategoryModalVisible(false);
      setSelectedCategory(null);
      categoryForm.resetFields();
      loadCategories();
    } catch (err: any) {
      message.error(err.response?.data?.message ||"Failed to update category");
    }
  };

  const deleteCategory = async (id) => {
    try {
      await axios.delete(`${url}/exam-categories/${id}`, { headers: getAuthHeaders() });
      message.success("Category deleted successfully");
      loadCategories();
    } catch (err: any) {
      message.error(err.response?.data?.message ||"Failed to delete category");
    }
  };

  const deleteExam = async (id) => {
    try {
      await axios.delete(`${url}/exams/${id}`, { headers: getAuthHeaders() });
      message.success("Exam deactivated successfully");
      loadExams();
    } catch (err: any) {
      message.error(err.response?.data?.message ||"Failed to delete exam");
    }
  };

  // ================= MODAL HANDLERS =================
  const openExamModal = (exam: Exam | null = null) => {
    if (exam) {
      form.setFieldsValue({
        ...exam,
        categoryId: typeof exam.categoryId ==='object' ? exam.categoryId._id : exam.categoryId,

        importantDates: {
          notificationDate: exam.importantDates?.notificationDate
            ? dayjs(exam.importantDates.notificationDate)
            : null,

          applicationStart: exam.importantDates?.applicationStart
            ? dayjs(exam.importantDates.applicationStart)
            : null,

          applicationEnd: exam.importantDates?.applicationEnd
            ? dayjs(exam.importantDates.applicationEnd)
            : null,

          examDate: exam.importantDates?.examDate
            ? dayjs(exam.importantDates.examDate)
            : null,

          resultDate: exam.importantDates?.resultDate
            ? dayjs(exam.importantDates.resultDate)
            : null,
        },

        eligibility: exam.eligibility || {},
        seo: exam.seo || {},
      });

      setSelectedExam(exam);
    } else {
      form.resetFields();
      setSelectedExam(null);
    }

    setExamModalVisible(true);
  };


  const openCategoryModal = (category = null) => {
    if (category) {
      categoryForm.setFieldsValue(category);
      setSelectedCategory(category);
    } else {
      categoryForm.resetFields();
      setSelectedCategory(null);
    }
    setCategoryModalVisible(true);
  };

  // ================= EXAM TABLE COLUMNS =================
  const examColumns = [
    {
      title:"Exam Name",
      dataIndex:"name",
      render: (name, record) => (
        <Space>
          <Badge status={record.status ==="ACTIVE" ?"success" :"default"} />
          <strong>{name}</strong>
          {record.views > 100 && <Tag color="blue">Popular</Tag>}
        </Space>
      )
    },
    {
      title:"Category",
      dataIndex: ["categoryId","name"],
      render: (name) => name ||"Uncategorized"
    },
    {
      title:"Level",
      dataIndex:"examLevel",
      render: (level) => <Tag color="geekblue">{level}</Tag>
    },
    {
      title:"Mode",
      dataIndex:"mode",
      render: (mode) => <Tag color="purple">{mode}</Tag>
    },
    {
      title:"Views",
      dataIndex:"views",
      sorter: true
    },
    {
      title:"Created",
      dataIndex:"createdAt",
      render: (date) => moment(date).format("MMM DD, YYYY")
    },
    {
      title:"Actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              setViewExam(record);
              setViewModalOpen(true);
            }}
          />

          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => openExamModal(record)}
          />
          <Popconfirm
            title="Deactivate Exam?"
            onConfirm={() => deleteExam(record._id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // ================= CATEGORY TABLE COLUMNS =================
  const categoryColumns = [
    {
      title:"Category Name",
      dataIndex:"name",
      render: (name, record) => (
        <Space>
          <FolderOutlined />
          <strong>{name}</strong>
          {record.isActive === false && <Tag color="red">Inactive</Tag>}
        </Space>
      )
    },
    {
      title:"Slug",
      dataIndex:"slug",
      render: (slug) => <code>{slug}</code>
    },
    {
      title:"Exams Count",
      render: (_, record) => {
        const count = exams.filter(e => {
          const categoryId = typeof e.categoryId ==='object' ? e.categoryId._id : e.categoryId;
          return categoryId === record._id;
        }).length;
        return <Badge count={count} />;
      }
    },
    {
      title:"Status",
      dataIndex:"isActive",
      render: (active, record) => (
        <Switch
          checked={active}
          onChange={(checked) => updateCategory({ ...record, isActive: checked })}
          loading={loading}
        />
      )
    },
    {
      title:"Actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => openCategoryModal(record)}
          />
          <Popconfirm
            title="Delete Category?"
            description="This will only work if no active exams exist."
            onConfirm={() => deleteCategory(record._id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];


  if (!isAuthChecked) {
    return (
      <Layout style={{ minHeight:"100vh" }}>
        <Content style={{ display:"flex", justifyContent:"center", alignItems:"center" }}>
          <Card>
            <div>Checking permissions</div>
          </Card>
        </Content>
      </Layout>
    );
  }



  return (

    <Layout style={{ minHeight:"100vh" }}>
      {loginUser?.aname ? <Sidebar /> : <Sidebar2 />}
      <Layout>
        <Topbar />
        <Content style={{ margin: 24 }}>

          {/* ================= TABS ================= */}
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            tabBarExtraContent={
              <Space>
                <Input
                  placeholder="Search..."
                  prefix={<SearchOutlined />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: 200 }}
                  onPressEnter={loadExams}
                />
              </Space>
            }
          >

            {/* ================= EXAMS TAB ================= */}
            <TabPane tab=" Exams" key="exams">
              <Card>
                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => openExamModal()}
                    >
                      Add New Exam
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Space>
                      <Select
                        placeholder="Filter by Level"
                        onChange={(val) => setFilters(prev => ({ ...prev, level: val || undefined }))}
                        allowClear
                        style={{ width: 120 }}
                      >
                        <Select.Option value="National">National</Select.Option>
                        <Select.Option value="State">State</Select.Option>
                        <Select.Option value="Regional">Regional</Select.Option>
                      </Select>
                      <Select
                        placeholder="Filter by Mode"
                        onChange={(val) => setFilters(prev => ({ ...prev, mode: val || undefined }))}
                        allowClear
                        style={{ width: 120 }}
                      >
                        <Select.Option value="Online">Online</Select.Option>
                        <Select.Option value="Offline">Offline</Select.Option>
                      </Select>
                    </Space>
                  </Col>
                </Row>

                <Table
                  columns={examColumns}
                  dataSource={exams}
                  loading={loading}
                  rowKey="_id"
                  pagination={false}
                  scroll={{ x: 1000 }}
                />

                <div style={{ marginTop: 16, textAlign:"right" }}>
                  <Pagination
                    current={currentPage}
                    total={totalExams}
                    pageSize={pageSize}
                    onChange={(page, size) => {
                      setCurrentPage(page);
                      setPageSize(size);
                    }}
                    showSizeChanger
                    showQuickJumper
                  />
                </div>
              </Card>
            </TabPane>

            {/* ================= CATEGORIES TAB ================= */}
            <TabPane tab=" Categories" key="categories">
              <Card>
                <div style={{ marginBottom: 16 }}>
                  <Button
                    type="primary"
                    icon={<FolderAddOutlined />}
                    onClick={() => openCategoryModal()}
                  >
                    Add New Category
                  </Button>
                </div>

                <Table
                  columns={categoryColumns}
                  dataSource={categories}
                  rowKey="_id"
                  scroll={{ x: 800 }}
                  pagination={{
                    pageSize: 50,
                    total: totalCategories,
                    showSizeChanger: false
                  }}
                />
              </Card>
            </TabPane>
          </Tabs>

        </Content>
      </Layout>

      {/* ================= EXAM MODAL ================= */}
      <Modal
        title={selectedExam ?"Edit Exam" :"Create New Exam"}
        open={examModalVisible}
        onCancel={() => {
          setExamModalVisible(false);
          form.resetFields();
          setSelectedExam(null);
        }}
        width={1000}
        footer={null}
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={selectedExam ? updateExam : createExam}
          initialValues={selectedExam || {}}
        >
          <Tabs defaultActiveKey="1">
            <TabPane tab="Basic Info" key="1">
              <Card>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="name"
                      label="Exam Name"
                      rules={[{ required: true, message:"Exam name is required" }]}
                    >
                      <Input placeholder="e.g. UPSC Civil Services" />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      name="slug"
                      label="Slug"
                      rules={[{ required: true, message:"Slug is required" }]}
                    >
                      <Input placeholder="upsc-civil-services" />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      name="shortDescription"
                      label="Short Description"
                    >
                      <TextArea rows={3} placeholder="Brief overview of the exam" />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      name="examImage"
                      label="Exam Image"
                      valuePropName="file"
                    >
                      <Upload
                        listType="picture-card"
                        maxCount={1}
                        beforeUpload={() => false}
                      >
                        <div>
                          <UploadOutlined />
                          <div style={{ marginTop: 8 }}>Upload</div>
                        </div>
                      </Upload>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      name="categoryId"
                      label="Category"
                      rules={[{ required: true, message:"Category is required" }]}
                    >
                      <Select placeholder="Select category">
                        {categories.map(c => (
                          <Select.Option key={c._id} value={c._id}>
                            {c.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col span={8}>
                    <Form.Item name="examLevel" label="Exam Level">
                      <Select placeholder="Select level">
                        <Select.Option value="National">National</Select.Option>
                        <Select.Option value="State">State</Select.Option>
                        <Select.Option value="Regional">Regional</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col span={8}>
                    <Form.Item name="mode" label="Mode">
                      <Select placeholder="Select mode">
                        <Select.Option value="Online">Online</Select.Option>
                        <Select.Option value="Offline">Offline</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      name="status"
                      label="Exam Status"
                      initialValue="ACTIVE"
                      rules={[{ required: true }]}
                    >
                      <Select>
                        <Select.Option value="ACTIVE">
                          <Tag color="green">ACTIVE</Tag>
                        </Select.Option>
                        <Select.Option value="INACTIVE">
                          <Tag color="red">INACTIVE</Tag>
                        </Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </TabPane>


            <TabPane tab="Dates & Eligibility" key="2">
              <Card>
                <Row gutter={16}>
                  <Col span={6}>
                    <Form.Item name={["importantDates","notificationDate"]} label="Notification Date">
                      <DatePicker style={{ width:"100%" }} />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item name={["importantDates","applicationStart"]} label="Application Start">
                      <DatePicker style={{ width:"100%" }} />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item name={["importantDates","applicationEnd"]} label="Application End">
                      <DatePicker style={{ width:"100%" }} />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item name={["importantDates","examDate"]} label="Exam Date">
                      <DatePicker style={{ width:"100%" }} />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider>Eligibility</Divider>
                <Row gutter={16}>
                  <Col span={6}>
                    <Form.Item name={["eligibility","ageMin"]} label="Min Age">
                      <InputNumber />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item name={["eligibility","ageMax"]} label="Max Age">
                      <InputNumber />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name={["eligibility","education"]} label="Education">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </TabPane>

            <TabPane tab="Phases & Cutoffs" key="3">
              <Card>
                <Form.List name="phases">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name }) => (
                        <Card key={key} style={{ marginBottom: 16 }} type="inner">
                          <Space style={{ width:"100%", justifyContent:"space-between" }}>
                            <h4>Phase {key + 1}</h4>
                            <Button danger onClick={() => remove(name)}>Remove Phase</Button>
                          </Space>

                          <Row gutter={16}>
                            <Col span={6}>
                              <Form.Item name={[name,"name"]} label="Phase Name">
                                <Input />
                              </Form.Item>
                            </Col>
                            <Col span={6}><Form.Item name={[name,"duration"]} label="Duration (min)"><InputNumber /></Form.Item></Col>
                            <Col span={6}><Form.Item name={[name,"totalQuestions"]} label="Total Questions"><InputNumber /></Form.Item></Col>
                            <Col span={6}><Form.Item name={[name,"totalMarks"]} label="Total Marks"><InputNumber /></Form.Item></Col>
                          </Row>

                          <Form.List name={[name,"sections"]}>
                            {(sectionFields, { add: addSection, remove: removeSection }) => (
                              <>
                                {sectionFields.map((section, index) => (
                                  <Space key={section.key} style={{ display:'flex', marginBottom: 8 }} align="baseline" size={12}>
                                    <Form.Item name={[section.name,"name"]} label={`Section ${index + 1}`}>
                                      <Input placeholder="Section name" style={{ width: 150 }} />
                                    </Form.Item>
                                    <Form.Item name={[section.name,"questions"]} label="Questions">
                                      <InputNumber style={{ width: 100 }} />
                                    </Form.Item>
                                    <Form.Item name={[section.name,"marks"]} label="Marks">
                                      <InputNumber style={{ width: 100 }} />
                                    </Form.Item>
                                    <Button danger onClick={() => removeSection(section.name)}>Remove</Button>
                                  </Space>
                                ))}
                                <Button type="dashed" onClick={() => addSection()} block style={{ marginBottom: 16 }}>
                                  Add Section
                                </Button>
                              </>
                            )}
                          </Form.List>
                        </Card>
                      ))}
                      <Button type="dashed" onClick={() => add()} block>
                        Add Phase
                      </Button>
                    </>
                  )}
                </Form.List>
              </Card>
            </TabPane>

            <TabPane tab="SEO & Links" key="4">
              <Card>
                <Form.Item name="officialWebsite" label="Official Website">
                  <Input />
                </Form.Item>
                <Form.Item name="notificationLink" label="Notification PDF">
                  <Input />
                </Form.Item>

                <Divider>SEO Settings</Divider>
                <Form.Item name={["seo","seo_title"]} label="SEO Title">
                  <Input />
                </Form.Item>
                <Form.Item name={["seo","meta_description"]} label="Meta Description">
                  <TextArea rows={3} />
                </Form.Item>
                <Form.Item name={["seo","meta_keywords"]} label="Keywords">
                  <Input />
                </Form.Item>
              </Card>
            </TabPane>

            <TabPane tab=" Resources Mapping" key="5">
              <Card>

                <Form.Item name="courses" label="Linked Courses">
                  <Select mode="multiple" placeholder="Select courses" showSearch optionFilterProp="label">
                    {allCourses.map(course => (
                      <Select.Option key={course._id} value={course._id} label={course.title}>
                        {course.title}  {course.price}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item name="books" label="Linked Books">
                  <Select mode="multiple" placeholder="Select books" showSearch optionFilterProp="label">
                    {allBooks.map(book => (
                      <Select.Option key={book._id} value={book._id} label={book.title}>
                        {book.title}  {book.price}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item name="courseContents" label="Linked Course Content">
                  <Select mode="multiple" placeholder="Select content" showSearch optionFilterProp="label">
                    {allCourseContents.map(content => (
                      <Select.Option key={content._id} value={content._id} label={content.content_subject}>
                        {content.content_subject}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

              </Card>
            </TabPane>

          </Tabs>

          <Divider />
          <Row justify="end">
            <Space>
              <Button onClick={() => setExamModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {selectedExam ?"Update Exam" :"Create Exam"}
              </Button>
            </Space>
          </Row>
        </Form>
      </Modal>

      {/* ================= CATEGORY MODAL ================= */}
      <Modal
        title={selectedCategory ?"Edit Category" :"Create New Category"}
        open={categoryModalVisible}
        onCancel={() => {
          setCategoryModalVisible(false);
          categoryForm.resetFields();
          setSelectedCategory(null);
        }}
        footer={null}
        width={600}
      >
        <Form layout="vertical" form={categoryForm} onFinish={selectedCategory ? updateCategory : createCategory}>
          <Form.Item name="name" label="Category Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="slug" label="Slug" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item name="isActive" label="Status" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Divider />
          <Row justify="end">
            <Space>
              <Button onClick={() => setCategoryModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {selectedCategory ?"Update Category" :"Create Category"}
              </Button>
            </Space>
          </Row>
        </Form>
      </Modal>
      <ViewExamModal
        exam={viewExam}
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
      />

    </Layout>
  );
};

export default ExamManagement;
