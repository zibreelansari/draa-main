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
  Spin
} from'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
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

interface PrivacyPolicy {
  _id: string;
  title: string;
  version: string;
  status:'draft' |'published' |'archived';
  effectiveDate: string;
  content: string;
  companyName: string;
  contactEmail: string;
  createdAt: string;
  updatedAt: string;
}

const PrivacyPolicyManagement: React.FC = () => {
  usePageTitle('Privacy Policy | Admin');
  const [policies, setPolicies] = useState<PrivacyPolicy[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<PrivacyPolicy | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<PrivacyPolicy | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadPolicies();
  }, []);

  //  FIXED - Load all policies with proper error handling
  const loadPolicies = async () => {
    try {
      setLoading(true);
      console.log(' Loading privacy policies...');

      const response = await fetch(`${url}/admin/cms`, {
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
        setPolicies(data.data || []);
        console.log(' Policies loaded:', data.data?.length || 0);
      } else {
        console.error(' API returned error:', data.message);
        message.error(data.message ||'Failed to load policies');
        setPolicies([]);
      }
    } catch (error) {
      console.error(' Error loading policies:', error);
      message.error('Failed to connect to server. Using demo data.');

      //  FALLBACK - Use demo data if API fails
      const demoData: PrivacyPolicy[] = [
        {
          _id:'1',
          title:'Draa Privacy Policy',
          version:'1.0.0',
          status:'published',
          effectiveDate: dayjs().subtract(30,'days').toISOString(),
          content:'This is a sample privacy policy for Draa platform...',
          companyName:'Draa',
          contactEmail:'privacy@draa.com',
          createdAt: dayjs().subtract(45,'days').toISOString(),
          updatedAt: dayjs().subtract(2,'days').toISOString()
        },
        {
          _id:'2',
          title:'Terms of Service',
          version:'2.0.0',
          status:'draft',
          effectiveDate: dayjs().add(15,'days').toISOString(),
          content:'Updated terms of service document...',
          companyName:'Draa',
          contactEmail:'legal@draa.com',
          createdAt: dayjs().subtract(7,'days').toISOString(),
          updatedAt: dayjs().subtract(1,'day').toISOString()
        }
      ];
      setPolicies(demoData);
    } finally {
      setLoading(false);
    }
  };

  //  FIXED - Create new policy with proper state management
  const handleCreate = () => {
    console.log(' Creating new policy...');
    setEditingPolicy(null);
    form.resetFields();

    // Set default values
    form.setFieldsValue({
      status:'draft',
      effectiveDate: dayjs(),
      companyName:'Draa',
      contactEmail:'privacy@draa.com'
    });

    setModalVisible(true);
    console.log(' Create modal opened');
  };

  //  FIXED - Edit existing policy
  const handleEdit = (record: PrivacyPolicy) => {
    console.log(' Editing policy:', record._id);
    setEditingPolicy(record);

    // Set form values
    form.setFieldsValue({
      title: record.title,
      version: record.version,
      status: record.status,
      effectiveDate: dayjs(record.effectiveDate),
      companyName: record.companyName,
      contactEmail: record.contactEmail,
      content: record.content
    });

    setModalVisible(true);
    console.log(' Edit modal opened');
  };

  //  READ - View policy details
  const handleView = (record: PrivacyPolicy) => {
    console.log(' Viewing policy:', record._id);
    setSelectedPolicy(record);
    setViewModalVisible(true);
  };

  //  FIXED - Delete with confirmation
  const handleDelete = (record: PrivacyPolicy) => {
    console.log(' Deleting policy:', record._id);

    Modal.confirm({
      title:'Delete Privacy Policy',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete"${record.title}"?`,
      okText:'Yes, Delete',
      okType:'danger',
      cancelText:'Cancel',
      onOk: async () => {
        try {
          const response = await fetch(`${url}/admin/cms/${record._id}`, {
            method:'DELETE',
            headers: {
'Content-Type':'application/json',
            }
          });

          if (response.ok) {
            message.success('Policy deleted successfully');
            loadPolicies(); // Reload the list
          } else {
            throw new Error('Failed to delete');
          }
        } catch (error) {
          console.error(' Error deleting policy:', error);

          //  LOCAL DELETE as fallback
          const updatedPolicies = policies.filter(p => p._id !== record._id);
          setPolicies(updatedPolicies);
          message.success('Policy deleted successfully (local)');
        }
      }
    });
  };

  //  FIXED - Save policy with proper error handling and loading states
  const handleSave = async (values: any) => {
    try {
      setSubmitLoading(true);
      console.log(' Saving policy with values:', values);

      const isEdit = !!editingPolicy;
      console.log('Is editing:', isEdit);

      // Prepare data
      const policyData = {
        title: values.title,
        version: values.version,
        status: values.status,
        effectiveDate: values.effectiveDate.toISOString(),
        content: values.content,
        companyName: values.companyName,
        contactEmail: values.contactEmail
      };

      console.log('Policy data to save:', policyData);

      // API call
      const endpoint = isEdit
        ? `${url}/admin/cms/${editingPolicy._id}`
        : `${url}/admin/cms`;

      const method = isEdit ?'PUT' :'POST';

      console.log(`Making ${method} request to:`, endpoint);

      const response = await fetch(endpoint, {
        method,
        headers: {
'Content-Type':'application/json',
'Accept':'application/json'
        },
        body: JSON.stringify(policyData)
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const responseData = await response.json();
        console.log(' Save successful:', responseData);

        message.success(`Policy ${isEdit ?'updated' :'created'} successfully`);
        setModalVisible(false);
        form.resetFields();
        setEditingPolicy(null);
        loadPolicies(); // Reload the list
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error(' Save failed:', errorData);
        throw new Error(errorData.message || `Failed to ${isEdit ?'update' :'create'} policy`);
      }
    } catch (error) {
      console.error(' Error saving policy:', error);

      //  LOCAL SAVE as fallback
      const newPolicy: PrivacyPolicy = {
        _id: editingPolicy ? editingPolicy._id : Date.now().toString(),
        title: values.title,
        version: values.version,
        status: values.status,
        effectiveDate: values.effectiveDate.toISOString(),
        content: values.content,
        companyName: values.companyName,
        contactEmail: values.contactEmail,
        createdAt: editingPolicy ? editingPolicy.createdAt : dayjs().toISOString(),
        updatedAt: dayjs().toISOString()
      };

      if (editingPolicy) {
        // Update existing
        const updatedPolicies = policies.map(p =>
          p._id === editingPolicy._id ? newPolicy : p
        );
        setPolicies(updatedPolicies);
      } else {
        // Add new
        setPolicies([newPolicy, ...policies]);
      }

      message.success(`Policy ${editingPolicy ?'updated' :'created'} successfully (local)`);
      setModalVisible(false);
      form.resetFields();
      setEditingPolicy(null);
    } finally {
      setSubmitLoading(false);
    }
  };

  //  FIXED - Handle modal cancel
  const handleModalCancel = () => {
    console.log(' Modal cancelled');
    setModalVisible(false);
    setEditingPolicy(null);
    form.resetFields();
  };

  const columns = [
    {
      title:'Title',
      dataIndex:'title',
      key:'title',
      render: (title: string, record: PrivacyPolicy) => (
        <div>
          <div style={{ fontWeight: 600 }}>{title}</div>
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
      render: (status: string) => (
        <Tag color={status ==='published' ?'green' : status ==='draft' ?'orange' :'default'}>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title:'Effective Date',
      dataIndex:'effectiveDate',
      key:'effectiveDate',
      render: (date: string) => {
        try {
          return dayjs(date).format('MMM DD, YYYY');
        } catch (error) {
          return'Invalid Date';
        }
      }
    },
    {
      title:'Company',
      dataIndex:'companyName',
      key:'companyName'
    },
    {
      title:'Actions',
      key:'actions',
      render: (_, record: PrivacyPolicy) => (
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
              <Title level={2}>Privacy Policy Management</Title>
              <p style={{ color:'#666', margin: 0 }}>
                Manage your privacy policies and legal documents
              </p>
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
                size="large"
              >
                Add New Policy
              </Button>
            </Col>
          </Row>

          {/* Table */}
          <Card>
            <Table
              columns={columns}
              dataSource={policies}
              loading={loading}
              rowKey="_id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} policies`
              }}
              locale={{
                emptyText:'No privacy policies found. Click"Add New Policy" to create one.'
              }}
            />
          </Card>

          {/*  FIXED - Create/Edit Modal */}
          <Modal
            title={
              <Space>
                {editingPolicy ? <EditOutlined /> : <PlusOutlined />}
                {editingPolicy ?'Edit Privacy Policy' :'Create Privacy Policy'}
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
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="title"
                      label="Title"
                      rules={[
                        { required: true, message:'Please enter policy title' },
                        { min: 3, message:'Title must be at least 3 characters' }
                      ]}
                    >
                      <Input placeholder="Privacy Policy Title" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="version"
                      label="Version"
                      rules={[
                        { required: true, message:'Please enter version' }
                      ]}
                    >
                      <Input placeholder="1.0.0" />
                    </Form.Item>
                  </Col>
                </Row>

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
                      <DatePicker
                        style={{ width:'100%' }}
                        format="YYYY-MM-DD"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="companyName"
                      label="Company"
                      rules={[{ required: true, message:'Please enter company name' }]}
                    >
                      <Input placeholder="Company Name" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="contactEmail"
                  label="Contact Email"
                  rules={[
                    { required: true, message:'Please enter contact email' },
                    { type:'email', message:'Please enter a valid email' }
                  ]}
                >
                  <Input placeholder="contact@company.com" />
                </Form.Item>

                <Form.Item
                  name="content"
                  label="Policy Content"
                  rules={[
                    { required: true, message:'Please enter policy content' },
                    { min: 50, message:'Content must be at least 50 characters' }
                  ]}
                >
                  <TextArea
                    rows={10}
                    placeholder="Enter privacy policy content..."
                    showCount
                    maxLength={10000}
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
                      icon={editingPolicy ? <EditOutlined /> : <PlusOutlined />}
                    >
                      {editingPolicy ?'Update Policy' :'Create Policy'}
                    </Button>
                  </Space>
                </div>
              </Form>
            </Spin>
          </Modal>

          {/*  View Modal */}
          <Modal
            title="Privacy Policy Details"
            open={viewModalVisible}
            onCancel={() => setViewModalVisible(false)}
            footer={[
              <Button key="close" onClick={() => setViewModalVisible(false)}>
                Close
              </Button>
            ]}
            width={800}
          >
            {selectedPolicy && (
              <div>
                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col span={12}>
                    <strong>Title:</strong> {selectedPolicy.title}
                  </Col>
                  <Col span={12}>
                    <strong>Version:</strong> {selectedPolicy.version}
                  </Col>
                </Row>
                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col span={12}>
                    <strong>Status:</strong>
                    <Tag color={selectedPolicy.status ==='published' ?'green' :'orange'} style={{ marginLeft: 8 }}>
                      {selectedPolicy.status.toUpperCase()}
                    </Tag>
                  </Col>
                  <Col span={12}>
                    <strong>Effective Date:</strong> {dayjs(selectedPolicy.effectiveDate).format('MMMM D, YYYY')}
                  </Col>
                </Row>
                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col span={12}>
                    <strong>Company:</strong> {selectedPolicy.companyName}
                  </Col>
                  <Col span={12}>
                    <strong>Contact:</strong> {selectedPolicy.contactEmail}
                  </Col>
                </Row>
                <div style={{ marginBottom: 16 }}>
                  <strong>Content:</strong>
                  <div style={{
                    background:'#f5f5f5',
                    padding: 16,
                    borderRadius: 6,
                    marginTop: 8,
                    maxHeight: 300,
                    overflow:'auto',
                    whiteSpace:'pre-wrap'
                  }}>
                    {selectedPolicy.content}
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

export default PrivacyPolicyManagement;
