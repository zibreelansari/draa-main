import React, { useState, useEffect } from'react';
import {
  Layout,
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  message,
  Row,
  Col,
  Typography,
  Spin,
  Switch,
  Tabs,
  InputNumber,
  Divider,
  Collapse,
  Badge,
  Tooltip,
  Progress,
} from'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  StarOutlined,
  HeartOutlined,
  DislikeOutlined,
  BarChartOutlined,
  TagOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from'@ant-design/icons';
import dayjs from'dayjs';
import Topbar from'./Topbar';
import Sidebar from'./Sidebar';
import url from'../../url';
import usePageTitle from '../../hooks/usePageTitle';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;

interface FAQ {
  _id: string;
  question: string;
  answer: string;
  category: string;
  status:'draft' |'published' |'archived';
  isActive: boolean;
  priority: number;
  tags: string[];
  viewCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
  lastUpdatedBy: string;
  searchKeywords: string[];
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

const categories = [
'General',
'Account',
'Courses',
'Payment',
'Technical',
'Certificates',
'Refunds',
'Support',
'Mobile App',
'Instructors'
];

const FAQManagement: React.FC = () => {
  usePageTitle('FAQs Management | Admin');
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [form] = Form.useForm();

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    loadFAQs();
  }, [selectedCategory, selectedStatus, searchTerm]);

  //  Load all FAQs
  const loadFAQs = async () => {
    try {
      setLoading(true);
      console.log(' Loading FAQs...');

      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !=='All') params.append('category', selectedCategory);
      if (selectedStatus) params.append('status', selectedStatus);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`${url}/admin/faqs?${params.toString()}`, {
        method:'GET',
        headers: {
'Content-Type':'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setFaqs(data.data || []);
        console.log(' FAQs loaded:', data.data?.length || 0);
      } else {
        throw new Error(data.message ||'Failed to load FAQs');
      }
    } catch (error) {
      console.error(' Error loading FAQs:', error);
      message.error('Failed to connect to server. Using demo data.');

      // Demo data
      const demoData: FAQ[] = [
        {
          _id:'1',
          question:'How do I create an account?',
          answer:'To create an account, click on the"Sign Up" button on the top right corner of our homepage. Fill in your details including name, email, and password. Verify your email address to complete the registration process.',
          category:'Account',
          status:'published',
          isActive: true,
          priority: 8,
          tags: ['account','registration','sign up'],
          viewCount: 245,
          helpfulCount: 198,
          notHelpfulCount: 12,
          lastUpdatedBy:'Admin',
          searchKeywords: ['account','create','sign','registration'],
          createdAt: dayjs().subtract(30,'days').toISOString(),
          updatedAt: dayjs().subtract(5,'days').toISOString()
        },
        {
          _id:'2',
          question:'How do I access my purchased courses?',
          answer:'After logging into your account, go to"My Courses" section from the dashboard. All your purchased and enrolled courses will be displayed there. Click on any course to start learning.',
          category:'Courses',
          status:'published',
          isActive: true,
          priority: 9,
          tags: ['courses','access','dashboard'],
          viewCount: 312,
          helpfulCount: 287,
          notHelpfulCount: 8,
          lastUpdatedBy:'Admin',
          searchKeywords: ['courses','purchased','access','dashboard'],
          createdAt: dayjs().subtract(25,'days').toISOString(),
          updatedAt: dayjs().subtract(3,'days').toISOString()
        },
        {
          _id:'3',
          question:'What payment methods do you accept?',
          answer:'We accept all major credit cards (Visa, MasterCard, American Express), debit cards, PayPal, and various digital wallets. For Indian users, we also support UPI, net banking, and EMI options.',
          category:'Payment',
          status:'published',
          isActive: true,
          priority: 7,
          tags: ['payment','credit card','paypal','upi'],
          viewCount: 189,
          helpfulCount: 156,
          notHelpfulCount: 15,
          lastUpdatedBy:'Admin',
          searchKeywords: ['payment','credit','card','paypal','methods'],
          createdAt: dayjs().subtract(20,'days').toISOString(),
          updatedAt: dayjs().subtract(1,'day').toISOString()
        }
      ];
      setFaqs(demoData);
    } finally {
      setLoading(false);
    }
  };

  //  Create new FAQ
  const handleCreate = () => {
    console.log(' Creating new FAQ...');
    setEditingFAQ(null);
    form.resetFields();

    form.setFieldsValue({
      category:'General',
      status:'draft',
      isActive: true,
      priority: 5,
      tags: []
    });

    setModalVisible(true);
  };

  //  Edit existing FAQ
  const handleEdit = (record: FAQ) => {
    console.log(' Editing FAQ:', record._id);
    setEditingFAQ(record);

    form.setFieldsValue({
      ...record
    });

    setModalVisible(true);
  };

  //  View FAQ details
  const handleView = (record: FAQ) => {
    console.log(' Viewing FAQ:', record._id);
    setSelectedFAQ(record);
    setViewModalVisible(true);
  };

  //  Delete FAQ
  const handleDelete = (record: FAQ) => {
    Modal.confirm({
      title:'Delete FAQ',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete"${record.question}"?`,
      okText:'Yes, Delete',
      okType:'danger',
      cancelText:'Cancel',
      onOk: async () => {
        try {
          const response = await fetch(`${url}/admin/faqs/${record._id}`, {
            method:'DELETE'
          });

          if (response.ok) {
            message.success('FAQ deleted successfully');
            loadFAQs();
          }
        } catch (error) {
          const updatedFAQs = faqs.filter(f => f._id !== record._id);
          setFaqs(updatedFAQs);
          message.success('FAQ deleted successfully (local)');
        }
      }
    });
  };

  //  Save FAQ
  const handleSave = async (values: any) => {
    try {
      setSubmitLoading(true);
      console.log(' Saving FAQ...');

      const isEdit = !!editingFAQ;
      const endpoint = isEdit
        ? `${url}/admin/faqs/${editingFAQ._id}`
        : `${url}/admin/faqs`;

      const method = isEdit ?'PUT' :'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
'Content-Type':'application/json',
'Accept':'application/json'
        },
        body: JSON.stringify(values)
      });

      if (response.ok) {
        message.success(`FAQ ${isEdit ?'updated' :'created'} successfully`);
        setModalVisible(false);
        form.resetFields();
        setEditingFAQ(null);
        loadFAQs();
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      // Local save as fallback
      const newFAQ: FAQ = {
        _id: editingFAQ ? editingFAQ._id : Date.now().toString(),
        ...values,
        viewCount: editingFAQ ? editingFAQ.viewCount : 0,
        helpfulCount: editingFAQ ? editingFAQ.helpfulCount : 0,
        notHelpfulCount: editingFAQ ? editingFAQ.notHelpfulCount : 0,
        searchKeywords: [],
        lastUpdatedBy:'Admin',
        createdAt: editingFAQ ? editingFAQ.createdAt : dayjs().toISOString(),
        updatedAt: dayjs().toISOString()
      };

      if (editingFAQ) {
        const updatedFAQs = faqs.map(f =>
          f._id === editingFAQ._id ? newFAQ : f
        );
        setFaqs(updatedFAQs);
      } else {
        setFaqs([newFAQ, ...faqs]);
      }

      message.success(`FAQ ${editingFAQ ?'updated' :'created'} successfully (local)`);
      setModalVisible(false);
      form.resetFields();
      setEditingFAQ(null);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingFAQ(null);
    form.resetFields();
  };

  const columns = [
    {
      title:'Question',
      key:'question',
      render: (_, record: FAQ) => (
        <div style={{ maxWidth:'300px' }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>
            {record.question.length > 80 ? `${record.question.substring(0, 80)}...` : record.question}
          </div>
          <Space size={4}>
            <Tag color="blue">{record.category}</Tag>
            <Tag color={record.priority >= 8 ?'red' : record.priority >= 6 ?'orange' :'default'}>
              Priority: {record.priority}
            </Tag>
          </Space>
        </div>
      )
    },
    {
      title:'Status',
      dataIndex:'status',
      key:'status',
      render: (status: string, record: FAQ) => (
        <Space direction="vertical" size={2}>
          <Tag color={status ==='published' ?'green' : status ==='draft' ?'orange' :'default'}>
            {status.toUpperCase()}
          </Tag>
          {!record.isActive && <Tag color="red">INACTIVE</Tag>}
        </Space>
      )
    },
    {
      title:'Engagement',
      key:'engagement',
      render: (_, record: FAQ) => (
        <Space direction="vertical" size={2}>
          <div style={{ fontSize:'12px' }}>
            <EyeOutlined /> {record.viewCount} views
          </div>
          <Space size={8}>
            <span style={{ color:'#52c41a', fontSize:'12px' }}>
              <HeartOutlined /> {record.helpfulCount}
            </span>
            <span style={{ color:'#ff4d4f', fontSize:'12px' }}>
              <DislikeOutlined /> {record.notHelpfulCount}
            </span>
          </Space>
        </Space>
      )
    },
    {
      title:'Tags',
      dataIndex:'tags',
      key:'tags',
      render: (tags: string[]) => (
        <div style={{ maxWidth:'200px' }}>
          {tags.slice(0, 2).map(tag => (
            <Tag key={tag} size="small" color="geekblue" style={{ marginBottom: 2 }}>
              {tag}
            </Tag>
          ))}
          {tags.length > 2 && (
            <Tag size="small" color="default">
              +{tags.length - 2} more
            </Tag>
          )}
        </div>
      )
    },
    {
      title:'Updated',
      dataIndex:'updatedAt',
      key:'updatedAt',
      render: (date: string, record: FAQ) => (
        <div>
          <div style={{ fontSize:'12px' }}>{dayjs(date).format('MMM DD, YYYY')}</div>
          <div style={{ fontSize:'11px', color:'#666' }}>by {record.lastUpdatedBy}</div>
        </div>
      )
    },
    {
      title:'Actions',
      key:'actions',
      render: (_, record: FAQ) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => handleView(record)}>
            View
          </Button>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
            Delete
          </Button>
        </Space>
      )
    }
  ];

  return (
    <Layout style={{ minHeight:'100vh' }}>
      <Sidebar />
      <Layout>
        <Topbar />
        <Content style={{ margin:'24px 16px', padding: 24, background:'#fff' }}>

          {/* Header */}
          <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
            <Col>
              <Title level={2}>
                <QuestionCircleOutlined style={{ marginRight: 8 }} />
                FAQ Management
              </Title>
              <p style={{ color:'#666', margin: 0 }}>
                Manage frequently asked questions and help content
              </p>
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
                size="large"
              >
                Add New FAQ
              </Button>
            </Col>
          </Row>

          {/* Stats Cards */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card size="small">
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:'24px', fontWeight:'bold', color:'#1890ff' }}>
                    {faqs.length}
                  </div>
                  <div style={{ color:'#666' }}>Total FAQs</div>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:'24px', fontWeight:'bold', color:'#52c41a' }}>
                    {faqs.filter(f => f.status ==='published' && f.isActive).length}
                  </div>
                  <div style={{ color:'#666' }}>Published</div>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:'24px', fontWeight:'bold', color:'#faad14' }}>
                    {faqs.reduce((sum, f) => sum + f.viewCount, 0).toLocaleString()}
                  </div>
                  <div style={{ color:'#666' }}>Total Views</div>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:'24px', fontWeight:'bold', color:'#722ed1' }}>
                    {Math.round((faqs.reduce((sum, f) => sum + f.helpfulCount, 0) /
                      Math.max(faqs.reduce((sum, f) => sum + f.helpfulCount + f.notHelpfulCount, 0), 1)) * 100)}%
                  </div>
                  <div style={{ color:'#666' }}>Helpful Rate</div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Filters */}
          <Card style={{ marginBottom: 24 }}>
            <Row gutter={16} align="middle">
              <Col span={6}>
                <Input
                  placeholder="Search FAQs..."
                  prefix={<SearchOutlined />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  allowClear
                />
              </Col>
              <Col span={6}>
                <Select
                  placeholder="Filter by Category"
                  style={{ width:'100%' }}
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                >
                  <Option value="All">All Categories</Option>
                  {categories.map(cat => (
                    <Option key={cat} value={cat}>{cat}</Option>
                  ))}
                </Select>
              </Col>
              <Col span={6}>
                <Select
                  placeholder="Filter by Status"
                  style={{ width:'100%' }}
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                  allowClear
                >
                  <Option value="published">Published</Option>
                  <Option value="draft">Draft</Option>
                  <Option value="archived">Archived</Option>
                </Select>
              </Col>
              <Col span={6}>
                <Button onClick={() => {
                  setSelectedCategory('All');
                  setSelectedStatus('');
                  setSearchTerm('');
                }}>
                  Clear Filters
                </Button>
              </Col>
            </Row>
          </Card>

          {/* Table */}
          <Card>
            <Table
              columns={columns}
              dataSource={faqs}
              loading={loading}
              rowKey="_id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} FAQs`
              }}
              locale={{
                emptyText:'No FAQs found. Click"Add New FAQ" to create one.'
              }}
            />
          </Card>

          {/* Create/Edit Modal */}
          <Modal
            title={
              <Space>
                {editingFAQ ? <EditOutlined /> : <PlusOutlined />}
                {editingFAQ ?'Edit FAQ' :'Create New FAQ'}
              </Space>
            }
            open={modalVisible}
            onCancel={handleModalCancel}
            footer={null}
            width={800}
            destroyOnClose={true}
          >
            <Spin spinning={submitLoading} tip="Saving...">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSave}
                preserve={false}
              >
                <Tabs defaultActiveKey="basic">
                  {/* Basic Information Tab */}
                  <TabPane tab="Basic Info" key="basic">
                    <Form.Item
                      name="question"
                      label="Question"
                      rules={[
                        { required: true, message:'Please enter the question' },
                        { max: 500, message:'Question cannot exceed 500 characters' }
                      ]}
                    >
                      <TextArea
                        rows={3}
                        placeholder="Enter the frequently asked question..."
                        showCount
                        maxLength={500}
                      />
                    </Form.Item>

                    <Form.Item
                      name="answer"
                      label="Answer"
                      rules={[
                        { required: true, message:'Please enter the answer' },
                        { max: 2000, message:'Answer cannot exceed 2000 characters' }
                      ]}
                    >
                      <TextArea
                        rows={6}
                        placeholder="Enter the detailed answer..."
                        showCount
                        maxLength={2000}
                      />
                    </Form.Item>

                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                          <Select placeholder="Select category">
                            {categories.map(cat => (
                              <Option key={cat} value={cat}>{cat}</Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                          <Select>
                            <Option value="draft">Draft</Option>
                            <Option value="published">Published</Option>
                            <Option value="archived">Archived</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="priority" label="Priority" rules={[{ required: true }]}>
                          <InputNumber
                            min={1}
                            max={10}
                            style={{ width:'100%' }}
                            placeholder="1-10"
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name="isActive" label="Active" valuePropName="checked">
                          <Switch />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="lastUpdatedBy" label="Updated By">
                          <Input placeholder="Admin" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item name="tags" label="Tags">
                      <Select
                        mode="tags"
                        placeholder="Add tags for better searchability..."
                        style={{ width:'100%' }}
                      />
                    </Form.Item>
                  </TabPane>

                  {/* SEO Tab */}
                  <TabPane tab="SEO" key="seo">
                    <Form.Item name="metaTitle" label="Meta Title">
                      <Input
                        placeholder="SEO title (auto-generated if empty)"
                        showCount
                        maxLength={60}
                      />
                    </Form.Item>

                    <Form.Item name="metaDescription" label="Meta Description">
                      <TextArea
                        rows={3}
                        placeholder="SEO description (auto-generated if empty)"
                        showCount
                        maxLength={160}
                      />
                    </Form.Item>
                  </TabPane>
                </Tabs>

                <div style={{ textAlign:'right', marginTop: 24 }}>
                  <Space>
                    <Button onClick={handleModalCancel} disabled={submitLoading}>
                      Cancel
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={submitLoading}
                      icon={editingFAQ ? <EditOutlined /> : <PlusOutlined />}
                    >
                      {editingFAQ ?'Update FAQ' :'Create FAQ'}
                    </Button>
                  </Space>
                </div>
              </Form>
            </Spin>
          </Modal>

          {/* View Modal */}
          <Modal
            title={
              <Space>
                <QuestionCircleOutlined />
                FAQ Details
              </Space>
            }
            open={viewModalVisible}
            onCancel={() => setViewModalVisible(false)}
            footer={[
              <Button key="close" onClick={() => setViewModalVisible(false)}>
                Close
              </Button>
            ]}
            width={900}
          >
            {selectedFAQ && (
              <div style={{ maxHeight:'70vh', overflow:'auto' }}>
                {/* Header Info */}
                <Card style={{ marginBottom: 16 }}>
                  <Row>
                    <Col span={16}>
                      <Title level={4} style={{ margin: 0, marginBottom: 8 }}>
                        {selectedFAQ.question}
                      </Title>
                      <Space wrap>
                        <Tag color="blue">{selectedFAQ.category}</Tag>
                        <Tag color={selectedFAQ.status ==='published' ?'green' :'orange'}>
                          {selectedFAQ.status.toUpperCase()}
                        </Tag>
                        <Tag color={selectedFAQ.priority >= 8 ?'red' : selectedFAQ.priority >= 6 ?'orange' :'default'}>
                          Priority: {selectedFAQ.priority}
                        </Tag>
                        {!selectedFAQ.isActive && <Tag color="red">INACTIVE</Tag>}
                      </Space>
                    </Col>
                    <Col span={8} style={{ textAlign:'right' }}>
                      <div style={{ fontSize:'14px', color:'#666' }}>
                        <div><EyeOutlined /> {selectedFAQ.viewCount} views</div>
                        <div style={{ marginTop: 4 }}>
                          <Space>
                            <span style={{ color:'#52c41a' }}>
                              <HeartOutlined /> {selectedFAQ.helpfulCount}
                            </span>
                            <span style={{ color:'#ff4d4f' }}>
                              <DislikeOutlined /> {selectedFAQ.notHelpfulCount}
                            </span>
                          </Space>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card>

                {/* Engagement Stats */}
                <Card title="Engagement Statistics" size="small" style={{ marginBottom: 16 }}>
                  <Row gutter={16}>
                    <Col span={8}>
                      <div style={{ textAlign:'center' }}>
                        <div style={{ fontSize:'24px', fontWeight:'bold', color:'#1890ff' }}>
                          {selectedFAQ.viewCount}
                        </div>
                        <div style={{ color:'#666' }}>Total Views</div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ textAlign:'center' }}>
                        <div style={{ fontSize:'24px', fontWeight:'bold', color:'#52c41a' }}>
                          {selectedFAQ.helpfulCount}
                        </div>
                        <div style={{ color:'#666' }}>Helpful Votes</div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ textAlign:'center' }}>
                        <div style={{ fontSize:'24px', fontWeight:'bold', color:'#722ed1' }}>
                          {selectedFAQ.helpfulCount + selectedFAQ.notHelpfulCount > 0 ?
                            Math.round((selectedFAQ.helpfulCount / (selectedFAQ.helpfulCount + selectedFAQ.notHelpfulCount)) * 100) : 0}%
                        </div>
                        <div style={{ color:'#666' }}>Helpful Rate</div>
                      </div>
                    </Col>
                  </Row>

                  <Divider />

                  <div style={{ marginBottom: 8 }}>
                    <Text strong>Helpfulness Progress</Text>
                  </div>
                  <Progress
                    percent={selectedFAQ.helpfulCount + selectedFAQ.notHelpfulCount > 0 ?
                      Math.round((selectedFAQ.helpfulCount / (selectedFAQ.helpfulCount + selectedFAQ.notHelpfulCount)) * 100) : 0
                    }
                    strokeColor={{
'0%':'#ff4d4f',
'50%':'#faad14',
'100%':'#52c41a',
                    }}
                    format={(percent) => `${percent}% helpful`}
                  />
                </Card>

                {/* Content */}
                <Card title="Answer" style={{ marginBottom: 16 }}>
                  <div style={{
                    lineHeight:'1.8',
                    whiteSpace:'pre-wrap',
                    fontSize:'15px'
                  }}>
                    {selectedFAQ.answer}
                  </div>
                </Card>

                {/* Tags and Metadata */}
                <Card title="Metadata" size="small">
                  <Row gutter={16}>
                    <Col span={12}>
                      <div style={{ marginBottom: 12 }}>
                        <Text strong>Tags:</Text>
                        <div style={{ marginTop: 4 }}>
                          {selectedFAQ.tags.length > 0 ? (
                            selectedFAQ.tags.map(tag => (
                              <Tag key={tag} color="geekblue" style={{ marginBottom: 4 }}>
                                {tag}
                              </Tag>
                            ))
                          ) : (
                            <Text type="secondary">No tags</Text>
                          )}
                        </div>
                      </div>

                      <div>
                        <Text strong>Last Updated:</Text>
                        <div style={{ color:'#666' }}>
                          {dayjs(selectedFAQ.updatedAt).format('MMMM D, YYYY HH:mm')}
                        </div>
                        <div style={{ fontSize:'12px', color:'#999' }}>
                          by {selectedFAQ.lastUpdatedBy}
                        </div>
                      </div>
                    </Col>
                    <Col span={12}>
                      {selectedFAQ.metaTitle && (
                        <div style={{ marginBottom: 12 }}>
                          <Text strong>Meta Title:</Text>
                          <div style={{ color:'#666', fontSize:'14px' }}>
                            {selectedFAQ.metaTitle}
                          </div>
                        </div>
                      )}

                      {selectedFAQ.metaDescription && (
                        <div>
                          <Text strong>Meta Description:</Text>
                          <div style={{ color:'#666', fontSize:'14px' }}>
                            {selectedFAQ.metaDescription}
                          </div>
                        </div>
                      )}
                    </Col>
                  </Row>
                </Card>
              </div>
            )}
          </Modal>

        </Content>
      </Layout>
    </Layout>
  );
};

export default FAQManagement;
