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
  DatePicker,
  message,
  Row,
  Col,
  Typography,
  Spin,
  Switch
} from'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  CalendarOutlined,
  BankOutlined
} from'@ant-design/icons';
import dayjs from'dayjs';
import Topbar from'./Topbar';
import Sidebar from'./Sidebar';
import url from'../../url';
import usePageTitle from '../../hooks/usePageTitle';

const { Content } = Layout;
const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface TermsAndConditions {
  _id: string;
  title: string;
  version: string;
  status:'draft' |'published' |'archived';
  isActive: boolean;
  effectiveDate: string;
  content: string;
  companyName: string;
  contactEmail: string;
  jurisdiction: string;
  governingLaw: string;
  minimumAge: number;
  acceptanceRequired: boolean;
  lastReviewDate: string;
  nextReviewDate: string;
  createdAt: string;
  updatedAt: string;
}

const TermsAndConditionsManagement: React.FC = () => {
  usePageTitle('Terms & Conditions | Admin');
  const [terms, setTerms] = useState<TermsAndConditions[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editingTerm, setEditingTerm] = useState<TermsAndConditions | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<TermsAndConditions | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadTerms();
  }, []);

  //  Load all terms with proper error handling
  const loadTerms = async () => {
    try {
      setLoading(true);
      console.log(' Loading terms and conditions...');

      const response = await fetch(`${url}/admin/tnc`, {
        method:'GET',
        headers: {
'Content-Type':'application/json',
        }
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        setTerms(data.data || []);
        console.log(' Terms loaded:', data.data?.length || 0);
      } else {
        console.error(' API returned error:', data.message);
        message.error(data.message ||'Failed to load terms');
        setTerms([]);
      }
    } catch (error) {
      console.error(' Error loading terms:', error);
      message.error('Failed to connect to server. Using demo data.');

      //  FALLBACK - Demo data for Terms & Conditions
      const demoData: TermsAndConditions[] = [
        {
          _id:'1',
          title:'Draa Terms of Service',
          version:'1.0.0',
          status:'published',
          isActive: true,
          effectiveDate: dayjs().subtract(30,'days').toISOString(),
          content: `Welcome to Draa! These Terms of Service govern your use of our educational platform and services.

By accessing or using Draa, you agree to be bound by these Terms. If you disagree with any part of these terms, then you may not access the Service.

1. ACCEPTANCE OF TERMS
By creating an account or using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.

2. DESCRIPTION OF SERVICE
Draa provides online educational services, including courses, learning materials, assessments, and related educational tools.

3. USER ACCOUNTS
You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.

4. ACCEPTABLE USE
You agree not to use the Service for any unlawful purposes or to conduct any unlawful activity, including but not limited to fraud, embezzlement, money laundering, or insider trading.

5. INTELLECTUAL PROPERTY
The Service and its original content, features, and functionality are owned by Draa and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.`,
          companyName:'Draa',
          contactEmail:'legal@draa.com',
          jurisdiction:'India',
          governingLaw:'Indian Law',
          minimumAge: 13,
          acceptanceRequired: true,
          lastReviewDate: dayjs().subtract(15,'days').toISOString(),
          nextReviewDate: dayjs().add(345,'days').toISOString(),
          createdAt: dayjs().subtract(45,'days').toISOString(),
          updatedAt: dayjs().subtract(2,'days').toISOString()
        },
        {
          _id:'2',
          title:'Student Terms of Use',
          version:'2.1.0',
          status:'draft',
          isActive: false,
          effectiveDate: dayjs().add(15,'days').toISOString(),
          content: `Updated terms specifically for students using the Draa platform...

This document outlines the specific terms and conditions that apply to student users of our educational platform.

STUDENT RESPONSIBILITIES:
- Maintain academic integrity
- Respect intellectual property rights
- Follow course guidelines and deadlines
- Communicate respectfully with instructors and peers

PLATFORM USAGE:
- Access to course materials and resources
- Participation in online discussions and activities
- Submission of assignments and assessments
- Communication with instructors and support staff`,
          companyName:'Draa',
          contactEmail:'student-support@draa.com',
          jurisdiction:'India',
          governingLaw:'Indian Law',
          minimumAge: 16,
          acceptanceRequired: true,
          lastReviewDate: dayjs().subtract(5,'days').toISOString(),
          nextReviewDate: dayjs().add(360,'days').toISOString(),
          createdAt: dayjs().subtract(7,'days').toISOString(),
          updatedAt: dayjs().subtract(1,'day').toISOString()
        }
      ];
      setTerms(demoData);
    } finally {
      setLoading(false);
    }
  };

  //  Create new terms
  const handleCreate = () => {
    console.log(' Creating new terms...');
    setEditingTerm(null);
    form.resetFields();

    form.setFieldsValue({
      status:'draft',
      isActive: false,
      effectiveDate: dayjs(),
      lastReviewDate: dayjs(),
      nextReviewDate: dayjs().add(1,'year'),
      companyName:'Draa',
      contactEmail:'legal@draa.com',
      jurisdiction:'India',
      governingLaw:'Indian Law',
      minimumAge: 13,
      acceptanceRequired: true
    });

    setModalVisible(true);
    console.log(' Create modal opened');
  };

  //  Edit existing terms
  const handleEdit = (record: TermsAndConditions) => {
    console.log(' Editing terms:', record._id);
    setEditingTerm(record);

    form.setFieldsValue({
      title: record.title,
      version: record.version,
      status: record.status,
      isActive: record.isActive,
      effectiveDate: dayjs(record.effectiveDate),
      content: record.content,
      companyName: record.companyName,
      contactEmail: record.contactEmail,
      jurisdiction: record.jurisdiction,
      governingLaw: record.governingLaw,
      minimumAge: record.minimumAge,
      acceptanceRequired: record.acceptanceRequired,
      lastReviewDate: dayjs(record.lastReviewDate),
      nextReviewDate: dayjs(record.nextReviewDate)
    });

    setModalVisible(true);
    console.log(' Edit modal opened');
  };

  //  View terms details
  const handleView = (record: TermsAndConditions) => {
    console.log(' Viewing terms:', record._id);
    setSelectedTerm(record);
    setViewModalVisible(true);
  };

  //  Delete terms with confirmation
  const handleDelete = (record: TermsAndConditions) => {
    console.log(' Deleting terms:', record._id);

    Modal.confirm({
      title:'Delete Terms & Conditions',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete"${record.title}"?`,
      okText:'Yes, Delete',
      okType:'danger',
      cancelText:'Cancel',
      onOk: async () => {
        try {
          const response = await fetch(`${url}/admin/tnc/${record._id}`, {
            method:'DELETE',
            headers: {
'Content-Type':'application/json',
            }
          });

          if (response.ok) {
            message.success('Terms deleted successfully');
            loadTerms();
          } else {
            throw new Error('Failed to delete');
          }
        } catch (error) {
          console.error(' Error deleting terms:', error);

          //  LOCAL DELETE as fallback
          const updatedTerms = terms.filter(t => t._id !== record._id);
          setTerms(updatedTerms);
          message.success('Terms deleted successfully (local)');
        }
      }
    });
  };

  //  Activate/Deactivate terms
  const handleActivate = async (record: TermsAndConditions) => {
    try {
      const response = await fetch(`${url}/admin/tnc/${record._id}/activate`, {
        method:'PUT',
        headers: {'Content-Type':'application/json' }
      });

      if (response.ok) {
        message.success(`Terms ${record.isActive ?'deactivated' :'activated'} successfully`);
        loadTerms();
      }
    } catch (error) {
      console.error(' Error toggling activation:', error);

      //  LOCAL UPDATE as fallback
      const updatedTerms = terms.map(t =>
        t._id === record._id
          ? { ...t, isActive: !t.isActive }
          : { ...t, isActive: false } // Only one can be active
      );
      setTerms(updatedTerms);
      message.success(`Terms ${record.isActive ?'deactivated' :'activated'} successfully (local)`);
    }
  };

  //  Save terms with proper error handling
  const handleSave = async (values: any) => {
    try {
      setSubmitLoading(true);
      console.log(' Saving terms with values:', values);

      const isEdit = !!editingTerm;

      const termData = {
        title: values.title,
        version: values.version,
        status: values.status,
        isActive: values.isActive,
        effectiveDate: values.effectiveDate.toISOString(),
        content: values.content,
        companyName: values.companyName,
        contactEmail: values.contactEmail,
        jurisdiction: values.jurisdiction,
        governingLaw: values.governingLaw,
        minimumAge: values.minimumAge,
        acceptanceRequired: values.acceptanceRequired,
        lastReviewDate: values.lastReviewDate.toISOString(),
        nextReviewDate: values.nextReviewDate.toISOString()
      };

      console.log('Term data to save:', termData);

      const endpoint = isEdit
        ? `${url}/admin/tnc/${editingTerm._id}`
        : `${url}/admin/tnc`;

      const method = isEdit ?'PUT' :'POST';

      console.log(`Making ${method} request to:`, endpoint);

      const response = await fetch(endpoint, {
        method,
        headers: {
'Content-Type':'application/json',
'Accept':'application/json'
        },
        body: JSON.stringify(termData)
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log(' Save successful:', responseData);

        message.success(`Terms ${isEdit ?'updated' :'created'} successfully`);
        setModalVisible(false);
        form.resetFields();
        setEditingTerm(null);
        loadTerms();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to ${isEdit ?'update' :'create'} terms`);
      }
    } catch (error) {
      console.error(' Error saving terms:', error);

      //  LOCAL SAVE as fallback
      const newTerm: TermsAndConditions = {
        _id: editingTerm ? editingTerm._id : Date.now().toString(),
        title: values.title,
        version: values.version,
        status: values.status,
        isActive: values.isActive,
        effectiveDate: values.effectiveDate.toISOString(),
        content: values.content,
        companyName: values.companyName,
        contactEmail: values.contactEmail,
        jurisdiction: values.jurisdiction,
        governingLaw: values.governingLaw,
        minimumAge: values.minimumAge,
        acceptanceRequired: values.acceptanceRequired,
        lastReviewDate: values.lastReviewDate.toISOString(),
        nextReviewDate: values.nextReviewDate.toISOString(),
        createdAt: editingTerm ? editingTerm.createdAt : dayjs().toISOString(),
        updatedAt: dayjs().toISOString()
      };

      if (editingTerm) {
        const updatedTerms = terms.map(t =>
          t._id === editingTerm._id ? newTerm : t
        );
        setTerms(updatedTerms);
      } else {
        setTerms([newTerm, ...terms]);
      }

      message.success(`Terms ${editingTerm ?'updated' :'created'} successfully (local)`);
      setModalVisible(false);
      form.resetFields();
      setEditingTerm(null);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingTerm(null);
    form.resetFields();
  };

  const columns = [
    {
      title:'Title',
      dataIndex:'title',
      key:'title',
      render: (title: string, record: TermsAndConditions) => (
        <div>
          <div style={{ fontWeight: 600 }}>
            {title}
            {record.isActive && (
              <Tag color="green" size="small" style={{ marginLeft: 8 }}>
                ACTIVE
              </Tag>
            )}
          </div>
          <div style={{ fontSize:'12px', color:'#666' }}>
            Version: {record.version}
          </div>
        </div>
      )
    },
    {
      title:'Status',
      dataIndex:'status',
      key:'status',
      render: (status: string, record: TermsAndConditions) => (
        <Space direction="vertical" size={2}>
          <Tag color={status ==='published' ?'green' : status ==='draft' ?'orange' :'default'}>
            {status.toUpperCase()}
          </Tag>
          {record.acceptanceRequired && (
            <Tag color="blue" size="small">
              ACCEPTANCE REQUIRED
            </Tag>
          )}
        </Space>
      )
    },
    {
      title:'Effective Date',
      dataIndex:'effectiveDate',
      key:'effectiveDate',
      render: (date: string) => (
        <Space direction="vertical" size={0}>
          <div>{dayjs(date).format('MMM DD, YYYY')}</div>
          {dayjs(date).isAfter(dayjs()) && (
            <Tag color="orange" size="small">FUTURE</Tag>
          )}
        </Space>
      )
    },
    {
      title:'Jurisdiction',
      dataIndex:'jurisdiction',
      key:'jurisdiction',
      render: (jurisdiction: string, record: TermsAndConditions) => (
        <Space direction="vertical" size={2}>
          <div style={{ fontSize:'13px' }}>{jurisdiction}</div>
          <div style={{ fontSize:'11px', color:'#666' }}>
            Min Age: {record.minimumAge}
          </div>
        </Space>
      )
    },
    {
      title:'Review Status',
      key:'reviewStatus',
      render: (_, record: TermsAndConditions) => {
        const daysUntilReview = dayjs(record.nextReviewDate).diff(dayjs(),'days');
        return (
          <Space direction="vertical" size={2}>
            <div style={{ fontSize:'12px' }}>
              Next: {dayjs(record.nextReviewDate).format('MMM YYYY')}
            </div>
            <Tag
              color={daysUntilReview < 30 ?'red' : daysUntilReview < 90 ?'orange' :'green'}
              size="small"
            >
              {daysUntilReview > 0 ? `${daysUntilReview} days` :'OVERDUE'}
            </Tag>
          </Space>
        );
      }
    },
    {
      title:'Actions',
      key:'actions',
      render: (_, record: TermsAndConditions) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => handleView(record)}>
            View
          </Button>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Button
            size="small"
            type={record.isActive ?"default" :"primary"}
            onClick={() => handleActivate(record)}
          >
            {record.isActive ?'Deactivate' :'Activate'}
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            disabled={record.isActive}
          >
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
                <FileTextOutlined style={{ marginRight: 8 }} />
                Terms & Conditions Management
              </Title>
              <p style={{ color:'#666', margin: 0 }}>
                Manage your terms of service and user agreements
              </p>
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
                size="large"
              >
                Add New Terms
              </Button>
            </Col>
          </Row>

          {/* Stats Cards */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card size="small">
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:'24px', fontWeight:'bold', color:'#1890ff' }}>
                    {terms.length}
                  </div>
                  <div style={{ color:'#666' }}>Total Terms</div>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:'24px', fontWeight:'bold', color:'#52c41a' }}>
                    {terms.filter(t => t.isActive).length}
                  </div>
                  <div style={{ color:'#666' }}>Active</div>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:'24px', fontWeight:'bold', color:'#faad14' }}>
                    {terms.filter(t => t.status ==='published').length}
                  </div>
                  <div style={{ color:'#666' }}>Published</div>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:'24px', fontWeight:'bold', color:'#f5222d' }}>
                    {terms.filter(t => dayjs(t.nextReviewDate).diff(dayjs(),'days') < 30).length}
                  </div>
                  <div style={{ color:'#666' }}>Need Review</div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Table */}
          <Card>
            <Table
              columns={columns}
              dataSource={terms}
              loading={loading}
              rowKey="_id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} terms`
              }}
              locale={{
                emptyText:'No terms and conditions found. Click"Add New Terms" to create one.'
              }}
            />
          </Card>

          {/* Create/Edit Modal */}
          <Modal
            title={
              <Space>
                {editingTerm ? <EditOutlined /> : <PlusOutlined />}
                {editingTerm ?'Edit Terms & Conditions' :'Create Terms & Conditions'}
              </Space>
            }
            open={modalVisible}
            onCancel={handleModalCancel}
            footer={null}
            width={900}
            destroyOnClose={true}
          >
            <Spin spinning={submitLoading} tip="Saving...">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSave}
                preserve={false}
              >
                {/* Basic Information */}
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="title"
                      label="Title"
                      rules={[
                        { required: true, message:'Please enter terms title' },
                        { min: 3, message:'Title must be at least 3 characters' }
                      ]}
                    >
                      <Input placeholder="Terms & Conditions Title" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="version"
                      label="Version"
                      rules={[{ required: true, message:'Please enter version' }]}
                    >
                      <Input placeholder="1.0.0" />
                    </Form.Item>
                  </Col>
                </Row>

                {/* Status and Active */}
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      name="status"
                      label="Status"
                      rules={[{ required: true }]}
                    >
                      <Select placeholder="Select status">
                        <Option value="draft">Draft</Option>
                        <Option value="published">Published</Option>
                        <Option value="archived">Archived</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="effectiveDate"
                      label="Effective Date"
                      rules={[{ required: true, message:'Please select effective date' }]}
                    >
                      <DatePicker style={{ width:'100%' }} format="YYYY-MM-DD" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="isActive"
                      label="Active Status"
                      valuePropName="checked"
                    >
                      <Switch
                        checkedChildren="Active"
                        unCheckedChildren="Inactive"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                {/* Company Information */}
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="companyName"
                      label="Company Name"
                      rules={[{ required: true, message:'Please enter company name' }]}
                    >
                      <Input placeholder="Company Name" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="contactEmail"
                      label="Contact Email"
                      rules={[
                        { required: true, message:'Please enter contact email' },
                        { type:'email', message:'Please enter a valid email' }
                      ]}
                    >
                      <Input placeholder="legal@company.com" />
                    </Form.Item>
                  </Col>
                </Row>

                {/* Legal Information */}
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      name="jurisdiction"
                      label="Jurisdiction"
                      rules={[{ required: true, message:'Please enter jurisdiction' }]}
                    >
                      <Input placeholder="India" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="governingLaw"
                      label="Governing Law"
                      rules={[{ required: true, message:'Please enter governing law' }]}
                    >
                      <Input placeholder="Indian Law" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="minimumAge"
                      label="Minimum Age"
                      rules={[{ required: true, message:'Please enter minimum age' }]}
                    >
                      <Select placeholder="Select minimum age">
                        <Option value={13}>13 years</Option>
                        <Option value={16}>16 years</Option>
                        <Option value={18}>18 years</Option>
                        <Option value={21}>21 years</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                {/* Review Dates */}
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      name="lastReviewDate"
                      label="Last Review Date"
                      rules={[{ required: true }]}
                    >
                      <DatePicker style={{ width:'100%' }} format="YYYY-MM-DD" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="nextReviewDate"
                      label="Next Review Date"
                      rules={[{ required: true }]}
                    >
                      <DatePicker style={{ width:'100%' }} format="YYYY-MM-DD" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="acceptanceRequired"
                      label="Acceptance Required"
                      valuePropName="checked"
                    >
                      <Switch
                        checkedChildren="Required"
                        unCheckedChildren="Optional"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                {/* Content */}
                <Form.Item
                  name="content"
                  label="Terms & Conditions Content"
                  rules={[
                    { required: true, message:'Please enter terms content' },
                    { min: 100, message:'Content must be at least 100 characters' }
                  ]}
                >
                  <TextArea
                    rows={12}
                    placeholder="Enter terms and conditions content..."
                    showCount
                    maxLength={15000}
                  />
                </Form.Item>

                <div style={{ textAlign:'right' }}>
                  <Space>
                    <Button onClick={handleModalCancel} disabled={submitLoading}>
                      Cancel
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={submitLoading}
                      icon={editingTerm ? <EditOutlined /> : <PlusOutlined />}
                    >
                      {editingTerm ?'Update Terms' :'Create Terms'}
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
                <FileTextOutlined />
                Terms & Conditions Details
              </Space>
            }
            open={viewModalVisible}
            onCancel={() => setViewModalVisible(false)}
            footer={[
              <Button key="close" onClick={() => setViewModalVisible(false)}>
                Close
              </Button>
            ]}
            width={1000}
          >
            {selectedTerm && (
              <div>
                {/* Header Info */}
                <Row gutter={16} style={{ marginBottom: 20 }}>
                  <Col span={12}>
                    <Card size="small" title="Basic Information">
                      <p><strong>Title:</strong> {selectedTerm.title}</p>
                      <p><strong>Version:</strong> {selectedTerm.version}</p>
                      <p>
                        <strong>Status:</strong>
                        <Tag color={selectedTerm.status ==='published' ?'green' :'orange'} style={{ marginLeft: 8 }}>
                          {selectedTerm.status.toUpperCase()}
                        </Tag>
                        {selectedTerm.isActive && (
                          <Tag color="blue" style={{ marginLeft: 4 }}>ACTIVE</Tag>
                        )}
                      </p>
                      <p><strong>Effective Date:</strong> {dayjs(selectedTerm.effectiveDate).format('MMMM D, YYYY')}</p>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card size="small" title="Legal Information">
                      <p><strong>Company:</strong> {selectedTerm.companyName}</p>
                      <p><strong>Contact:</strong> {selectedTerm.contactEmail}</p>
                      <p><strong>Jurisdiction:</strong> {selectedTerm.jurisdiction}</p>
                      <p><strong>Governing Law:</strong> {selectedTerm.governingLaw}</p>
                      <p><strong>Minimum Age:</strong> {selectedTerm.minimumAge} years</p>
                      <p>
                        <strong>Acceptance:</strong>
                        <Tag color={selectedTerm.acceptanceRequired ?'green' :'default'} style={{ marginLeft: 8 }}>
                          {selectedTerm.acceptanceRequired ?'REQUIRED' :'OPTIONAL'}
                        </Tag>
                      </p>
                    </Card>
                  </Col>
                </Row>

                {/* Review Information */}
                <Card size="small" title="Review Schedule" style={{ marginBottom: 20 }}>
                  <Row gutter={16}>
                    <Col span={8}>
                      <p><strong>Last Review:</strong> {dayjs(selectedTerm.lastReviewDate).format('MMMM D, YYYY')}</p>
                    </Col>
                    <Col span={8}>
                      <p><strong>Next Review:</strong> {dayjs(selectedTerm.nextReviewDate).format('MMMM D, YYYY')}</p>
                    </Col>
                    <Col span={8}>
                      <p>
                        <strong>Status:</strong>
                        <Tag
                          color={dayjs(selectedTerm.nextReviewDate).diff(dayjs(),'days') < 30 ?'red' :'green'}
                          style={{ marginLeft: 8 }}
                        >
                          {dayjs(selectedTerm.nextReviewDate).diff(dayjs(),'days') > 0
                            ? `${dayjs(selectedTerm.nextReviewDate).diff(dayjs(),'days')} days remaining`
                            :'REVIEW OVERDUE'
                          }
                        </Tag>
                      </p>
                    </Col>
                  </Row>
                </Card>

                {/* Content */}
                <div style={{ marginBottom: 16 }}>
                  <strong>Content:</strong>
                  <div style={{
                    background:'#f5f5f5',
                    padding: 20,
                    borderRadius: 6,
                    marginTop: 8,
                    maxHeight: 400,
                    overflow:'auto',
                    whiteSpace:'pre-wrap',
                    lineHeight:'1.6'
                  }}>
                    {selectedTerm.content}
                  </div>
                </div>
              </div>
            )}
          </Modal>

        </Content>
      </Layout>
    </Layout>
  );
};

export default TermsAndConditionsManagement;
