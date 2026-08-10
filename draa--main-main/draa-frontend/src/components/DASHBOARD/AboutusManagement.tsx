import React, { useState, useEffect } from'react';
import toast from '../../utils/toast';
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
  Row,
  Col,
  Typography,
  Spin,
  Switch,
  Tabs,
  InputNumber,
  Divider
} from'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  TeamOutlined,
  BankOutlined,
  UserOutlined,
  GlobalOutlined,
  HeartOutlined,
  TrophyOutlined,
  RocketOutlined
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
const { TabPane } = Tabs;

interface TeamMember {
  _id?: string;
  name: string;
  position: string;
  bio: string;
  email: string;
  linkedin: string;
  order: number;
}

interface AboutUs {
  _id: string;
  title: string;
  version: string;
  status:'draft' |'published' |'archived';
  isActive: boolean;
  companyName: string;
  tagline: string;
  foundedYear: number;
  headquarters: string;
  website: string;
  email: string;
  phone: string;

  overview: string;
  mission: string;
  vision: string;
  values: string[];
  story: string;

  teamMembers: TeamMember[];

  statistics: {
    studentsServed: number;
    coursesOffered: number;
    yearsExperience: number;
    successRate: number;
  };

  socialMedia: {
    facebook: string;
    twitter: string;
    linkedin: string;
    instagram: string;
    youtube: string;
  };

  metaTitle: string;
  metaDescription: string;
  keywords: string[];

  createdAt: string;
  updatedAt: string;
}

const AboutUsManagement: React.FC = () => {
  usePageTitle('About Us Management | Admin');
  const [aboutPages, setAboutPages] = useState<AboutUs[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editingAbout, setEditingAbout] = useState<AboutUs | null>(null);
  const [selectedAbout, setSelectedAbout] = useState<AboutUs | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [form] = Form.useForm();

  // Team member states
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    loadAboutPages();
  }, []);

  //  Load all about pages
  const loadAboutPages = async () => {
    try {
      setLoading(true);
      console.log(' Loading about us pages...');

      const response = await fetch(`${url}/admin/aboutus`, {
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
        setAboutPages(data.data || []);
        console.log(' About pages loaded:', data.data?.length || 0);
      } else {
        throw new Error(data.message ||'Failed to load about pages');
      }
    } catch (error) {
      console.error(' Error loading about pages:', error);
      toast.error('Failed to connect to server. Using demo data.');

      // Demo data
      const demoData: AboutUs[] = [
        {
          _id:'1',
          title:'About Draa',
          version:'1.0.0',
          status:'published',
          isActive: true,
          companyName:'Draa',
          tagline:'Empowering Education, Transforming Lives',
          foundedYear: 2020,
          headquarters:'Mumbai, India',
          website:'https://draa.com',
          email:'info@draa.com',
          phone:'+91-9876543210',

          overview:'Draa is a leading educational technology platform.',
          mission:'To democratize education by providing quality online learning.',
          vision:'To become the most trusted educational platform worldwide.',
          values: ['Excellence','Innovation','Accessibility'],
          story:'Founded in 2020 with a mission to transform education.',

          teamMembers: [
            {
              _id:'tm1',
              name:'Rahul Sharma',
              position:'CEO & Founder',
              bio:'Visionary leader with 15+ years in EdTech.',
              email:'rahul@draa.com',
              linkedin:'https://linkedin.com/in/rahulsharma',
              order: 1
            }
          ],

          statistics: {
            studentsServed: 25000,
            coursesOffered: 150,
            yearsExperience: 5,
            successRate: 94
          },

          socialMedia: {
            facebook:'https://facebook.com/draa',
            twitter:'https://twitter.com/draa',
            linkedin:'https://linkedin.com/company/draa',
            instagram:'https://instagram.com/draa',
            youtube:'https://youtube.com/draa'
          },

          metaTitle:'About Draa - Leading Online Education Platform',
          metaDescription:'Learn about Draa and our mission to transform education.',
          keywords: ['education','online learning','Draa'],

          createdAt: dayjs().subtract(45,'days').toISOString(),
          updatedAt: dayjs().subtract(2,'days').toISOString()
        }
      ];
      setAboutPages(demoData);
    } finally {
      setLoading(false);
    }
  };

  //  Create new about page
  const handleCreate = () => {
    console.log(' Creating new about page...');
    setEditingAbout(null);
    form.resetFields();

    form.setFieldsValue({
      status:'draft',
      isActive: false,
      companyName:'Draa',
      tagline:'Empowering Education, Transforming Lives',
      foundedYear: new Date().getFullYear(),
      headquarters:'Mumbai, India',
      website:'https://draa.com',
      email:'info@draa.com',
      phone:'+91-9876543210',
      values: ['Excellence','Innovation','Accessibility'],
      statistics: {
        studentsServed: 0,
        coursesOffered: 0,
        yearsExperience: 1,
        successRate: 95
      }
    });

    setTeamMembers([]);
    setModalVisible(true);
  };

  //  Edit existing about page
  const handleEdit = (record: AboutUs) => {
    console.log(' Editing about page:', record._id);
    setEditingAbout(record);

    form.setFieldsValue({
      ...record,
      foundedYear: record.foundedYear
    });

    setTeamMembers(record.teamMembers || []);
    setModalVisible(true);
  };

  //  View about page details
  const handleView = (record: AboutUs) => {
    console.log(' Viewing about page:', record._id);
    setSelectedAbout(record);
    setViewModalVisible(true);
  };

  //  Delete about page
  const handleDelete = (record: AboutUs) => {
    Modal.confirm({
      title:'Delete About Us Page',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete"${record.title}"?`,
      okText:'Yes, Delete',
      okType:'danger',
      cancelText:'Cancel',
      onOk: async () => {
        try {
          const response = await fetch(`${url}/admin/aboutus/${record._id}`, {
            method:'DELETE'
          });

          if (response.ok) {
            toast.success('About page deleted successfully');
            loadAboutPages();
          }
        } catch (error) {
          const updatedPages = aboutPages.filter(p => p._id !== record._id);
          setAboutPages(updatedPages);
          toast.success('About page deleted successfully (local)');
        }
      }
    });
  };

  //  Activate about page
  const handleActivate = async (record: AboutUs) => {
    try {
      const response = await fetch(`${url}/admin/aboutus/${record._id}/activate`, {
        method:'PUT'
      });

      if (response.ok) {
        toast.success('About page activated successfully');
        loadAboutPages();
      }
    } catch (error) {
      const updatedPages = aboutPages.map(p =>
        p._id === record._id
          ? { ...p, isActive: true }
          : { ...p, isActive: false }
      );
      setAboutPages(updatedPages);
      toast.success('About page activated successfully (local)');
    }
  };

  //  Save about page
  const handleSave = async (values: any) => {
    try {
      setSubmitLoading(true);
      console.log(' Saving about page...');

      const isEdit = !!editingAbout;
      const endpoint = isEdit
        ? `${url}/admin/aboutus/${editingAbout._id}`
        : `${url}/admin/aboutus`;

      const method = isEdit ?'PUT' :'POST';

      const aboutData = {
        ...values,
        teamMembers: teamMembers
      };

      const response = await fetch(endpoint, {
        method,
        headers: {
'Content-Type':'application/json',
'Accept':'application/json'
        },
        body: JSON.stringify(aboutData)
      });

      if (response.ok) {
        toast.success(`About page ${isEdit ?'updated' :'created'} successfully`);
        setModalVisible(false);
        form.resetFields();
        setEditingAbout(null);
        setTeamMembers([]);
        loadAboutPages();
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      // Local save as fallback
      const newAbout: AboutUs = {
        _id: editingAbout ? editingAbout._id : Date.now().toString(),
        ...values,
        teamMembers: teamMembers,
        createdAt: editingAbout ? editingAbout.createdAt : dayjs().toISOString(),
        updatedAt: dayjs().toISOString()
      };

      if (editingAbout) {
        const updatedPages = aboutPages.map(p =>
          p._id === editingAbout._id ? newAbout : p
        );
        setAboutPages(updatedPages);
      } else {
        setAboutPages([newAbout, ...aboutPages]);
      }

      toast.success(`About page ${editingAbout ?'updated' :'created'} successfully (local)`);
      setModalVisible(false);
      form.resetFields();
      setEditingAbout(null);
      setTeamMembers([]);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingAbout(null);
    setTeamMembers([]);
    form.resetFields();
  };

  //  Team member management
  const addTeamMember = () => {
    const newMember: TeamMember = {
      name:'',
      position:'',
      bio:'',
      email:'',
      linkedin:'',
      order: teamMembers.length + 1
    };
    setTeamMembers([...teamMembers, newMember]);
  };

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string | number) => {
    const updatedMembers = [...teamMembers];
    updatedMembers[index][field] = value as any;
    setTeamMembers(updatedMembers);
  };

  const removeTeamMember = (index: number) => {
    const updatedMembers = teamMembers.filter((_, i) => i !== index);
    updatedMembers.forEach((member, i) => {
      member.order = i + 1;
    });
    setTeamMembers(updatedMembers);
  };

  const columns = [
    {
      title:'Company Info',
      key:'company',
      render: (_, record: AboutUs) => (
        <div>
          <div style={{ fontWeight: 600 }}>
            {record.companyName}
            {record.isActive && (
              <Tag color="green" size="small" style={{ marginLeft: 8 }}>
                ACTIVE
              </Tag>
            )}
          </div>
          <div style={{ fontSize:'12px', color:'#666' }}>
            {record.tagline}
          </div>
          <div style={{ fontSize:'11px', color:'#999' }}>
            Founded: {record.foundedYear} | v{record.version}
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
      title:'Location',
      dataIndex:'headquarters',
      key:'headquarters',
      render: (headquarters: string, record: AboutUs) => (
        <Space direction="vertical" size={2}>
          <div style={{ fontSize:'13px' }}>{headquarters}</div>
          <div style={{ fontSize:'11px', color:'#666' }}>
            {record.phone}
          </div>
        </Space>
      )
    },
    {
      title:'Team Size',
      key:'teamSize',
      render: (_, record: AboutUs) => (
        <Space direction="vertical" size={2}>
          <div style={{ fontSize:'14px', fontWeight:'bold' }}>
            {record.teamMembers?.length || 0} members
          </div>
          <div style={{ fontSize:'11px', color:'#666' }}>
            {record.statistics?.studentsServed?.toLocaleString() || 0} students
          </div>
        </Space>
      )
    },
    {
      title:'Last Updated',
      dataIndex:'updatedAt',
      key:'updatedAt',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY')
    },
    {
      title:'Actions',
      key:'actions',
      render: (_, record: AboutUs) => (
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
            {record.isActive ?'Active' :'Activate'}
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
                <TeamOutlined style={{ marginRight: 8 }} />
                About Us Management
              </Title>
              <p style={{ color:'#666', margin: 0 }}>
                Manage your company information and about page content
              </p>
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
                size="large"
              >
                Create About Page
              </Button>
            </Col>
          </Row>

          {/* Stats Cards */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card size="small">
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:'24px', fontWeight:'bold', color:'#1890ff' }}>
                    {aboutPages.length}
                  </div>
                  <div style={{ color:'#666' }}>Total Pages</div>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:'24px', fontWeight:'bold', color:'#52c41a' }}>
                    {aboutPages.filter(p => p.isActive).length}
                  </div>
                  <div style={{ color:'#666' }}>Active</div>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:'24px', fontWeight:'bold', color:'#faad14' }}>
                    {aboutPages.reduce((sum, p) => sum + (p.teamMembers?.length || 0), 0)}
                  </div>
                  <div style={{ color:'#666' }}>Team Members</div>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:'24px', fontWeight:'bold', color:'#722ed1' }}>
                    {aboutPages.reduce((sum, p) => sum + (p.statistics?.studentsServed || 0), 0).toLocaleString()}
                  </div>
                  <div style={{ color:'#666' }}>Total Students</div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Table */}
          <Card>
            <Table
              columns={columns}
              dataSource={aboutPages}
              loading={loading}
              rowKey="_id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} pages`
              }}
              locale={{
                emptyText:'No about pages found. Click"Create About Page" to create one.'
              }}
            />
          </Card>

          {/* Create/Edit Modal */}
          <Modal
            title={
              <Space>
                {editingAbout ? <EditOutlined /> : <PlusOutlined />}
                {editingAbout ?'Edit About Us Page' :'Create About Us Page'}
              </Space>
            }
            open={modalVisible}
            onCancel={handleModalCancel}
            footer={null}
            width={1000}
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
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="title"
                          label="Page Title"
                          rules={[{ required: true, message:'Please enter page title' }]}
                        >
                          <Input placeholder="About Draa" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="version"
                          label="Version"
                          rules={[{ required: true }]}
                        >
                          <Input placeholder="1.0.0" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
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
                        <Form.Item name="isActive" label="Active" valuePropName="checked">
                          <Switch />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="foundedYear" label="Founded Year" rules={[{ required: true }]}>
                          <InputNumber
                            min={1900}
                            max={new Date().getFullYear()}
                            style={{ width:'100%' }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name="companyName" label="Company Name" rules={[{ required: true }]}>
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="tagline" label="Tagline">
                          <Input placeholder="Your company tagline" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item name="headquarters" label="Headquarters" rules={[{ required: true }]}>
                          <Input placeholder="Mumbai, India" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="email" label="Email" rules={[{ required: true, type:'email' }]}>
                          <Input placeholder="info@company.com" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="phone" label="Phone">
                          <Input placeholder="+91-9876543210" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item name="website" label="Website" rules={[{ type:'url' }]}>
                      <Input placeholder="https://draa.com" />
                    </Form.Item>
                  </TabPane>

                  {/* Content Tab */}
                  <TabPane tab="Content" key="content">
                    <Form.Item name="overview" label="Company Overview" rules={[{ required: true }]}>
                      <TextArea rows={4} placeholder="Brief overview of your company..." />
                    </Form.Item>

                    <Form.Item name="mission" label="Mission Statement" rules={[{ required: true }]}>
                      <TextArea rows={3} placeholder="Your company's mission..." />
                    </Form.Item>

                    <Form.Item name="vision" label="Vision Statement" rules={[{ required: true }]}>
                      <TextArea rows={3} placeholder="Your company's vision..." />
                    </Form.Item>

                    <Form.Item name="story" label="Company Story">
                      <TextArea rows={5} placeholder="Tell your company's story..." />
                    </Form.Item>

                    <Form.Item name="values" label="Company Values">
                      <Select
                        mode="tags"
                        placeholder="Add company values..."
                        style={{ width:'100%' }}
                      />
                    </Form.Item>
                  </TabPane>

                  {/* Team Tab */}
                  <TabPane tab="Team" key="team">
                    <div style={{ marginBottom: 16 }}>
                      <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        onClick={addTeamMember}
                        block
                      >
                        Add Team Member
                      </Button>
                    </div>

                    {teamMembers.map((member, index) => (
                      <Card
                        key={index}
                        size="small"
                        style={{ marginBottom: 16 }}
                        title={`Team Member ${index + 1}`}
                        extra={
                          <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => removeTeamMember(index)}
                          />
                        }
                      >
                        <Row gutter={16}>
                          <Col span={12}>
                            <Input
                              placeholder="Name"
                              value={member.name}
                              onChange={(e) => updateTeamMember(index,'name', e.target.value)}
                              style={{ marginBottom: 8 }}
                            />
                          </Col>
                          <Col span={12}>
                            <Input
                              placeholder="Position"
                              value={member.position}
                              onChange={(e) => updateTeamMember(index,'position', e.target.value)}
                              style={{ marginBottom: 8 }}
                            />
                          </Col>
                        </Row>
                        <Row gutter={16}>
                          <Col span={12}>
                            <Input
                              placeholder="Email"
                              value={member.email}
                              onChange={(e) => updateTeamMember(index,'email', e.target.value)}
                              style={{ marginBottom: 8 }}
                            />
                          </Col>
                          <Col span={12}>
                            <Input
                              placeholder="LinkedIn URL"
                              value={member.linkedin}
                              onChange={(e) => updateTeamMember(index,'linkedin', e.target.value)}
                              style={{ marginBottom: 8 }}
                            />
                          </Col>
                        </Row>
                        <TextArea
                          rows={2}
                          placeholder="Bio"
                          value={member.bio}
                          onChange={(e) => updateTeamMember(index,'bio', e.target.value)}
                        />
                      </Card>
                    ))}
                  </TabPane>

                  {/* Statistics Tab */}
                  <TabPane tab="Statistics" key="statistics">
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name={['statistics','studentsServed']} label="Students Served">
                          <InputNumber min={0} style={{ width:'100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name={['statistics','coursesOffered']} label="Courses Offered">
                          <InputNumber min={0} style={{ width:'100%' }} />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name={['statistics','yearsExperience']} label="Years Experience">
                          <InputNumber min={0} style={{ width:'100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name={['statistics','successRate']} label="Success Rate (%)">
                          <InputNumber min={0} max={100} style={{ width:'100%' }} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </TabPane>

                  {/* Social Media Tab */}
                  <TabPane tab="Social Media" key="social">
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name={['socialMedia','facebook']} label="Facebook URL">
                          <Input placeholder="https://facebook.com/company" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name={['socialMedia','twitter']} label="Twitter URL">
                          <Input placeholder="https://twitter.com/company" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name={['socialMedia','linkedin']} label="LinkedIn URL">
                          <Input placeholder="https://linkedin.com/company/company" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name={['socialMedia','instagram']} label="Instagram URL">
                          <Input placeholder="https://instagram.com/company" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item name={['socialMedia','youtube']} label="YouTube URL">
                      <Input placeholder="https://youtube.com/company" />
                    </Form.Item>
                  </TabPane>

                  {/* SEO Tab */}
                  <TabPane tab="SEO" key="seo">
                    <Form.Item name="metaTitle" label="Meta Title">
                      <Input placeholder="About Company - Leading Education Platform" />
                    </Form.Item>

                    <Form.Item name="metaDescription" label="Meta Description">
                      <TextArea rows={3} placeholder="Brief description for search engines..." />
                    </Form.Item>

                    <Form.Item name="keywords" label="Keywords">
                      <Select
                        mode="tags"
                        placeholder="Add SEO keywords..."
                        style={{ width:'100%' }}
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
                      icon={editingAbout ? <EditOutlined /> : <PlusOutlined />}
                    >
                      {editingAbout ?'Update About Page' :'Create About Page'}
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
                <TeamOutlined />
                About Us Details
              </Space>
            }
            open={viewModalVisible}
            onCancel={() => setViewModalVisible(false)}
            footer={[
              <Button key="close" onClick={() => setViewModalVisible(false)}>
                Close
              </Button>
            ]}
            width={1200}
          >
            {selectedAbout && (
              <div style={{ maxHeight:'70vh', overflow:'auto' }}>
                {/* Company Header */}
                <Card style={{ marginBottom: 16 }}>
                  <Row>
                    <Col span={16}>
                      <Title level={3} style={{ margin: 0 }}>
                        {selectedAbout.companyName}
                        {selectedAbout.isActive && (
                          <Tag color="green" style={{ marginLeft: 8 }}>ACTIVE</Tag>
                        )}
                      </Title>
                      <p style={{ fontSize:'16px', color:'#666', margin:'8px 0' }}>
                        {selectedAbout.tagline}
                      </p>
                      <Space wrap>
                        <Tag icon={<BankOutlined />}>Founded {selectedAbout.foundedYear}</Tag>
                        <Tag icon={<GlobalOutlined />}>{selectedAbout.headquarters}</Tag>
                        <Tag color="blue">{selectedAbout.status.toUpperCase()}</Tag>
                      </Space>
                    </Col>
                    <Col span={8} style={{ textAlign:'right' }}>
                      <div style={{ fontSize:'14px', color:'#666' }}>
                        <p> {selectedAbout.email}</p>
                        <p> {selectedAbout.phone}</p>
                        <p> {selectedAbout.website}</p>
                      </div>
                    </Col>
                  </Row>
                </Card>

                {/* Statistics */}
                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col span={6}>
                    <Card size="small" style={{ textAlign:'center' }}>
                      <div style={{ fontSize:'24px', fontWeight:'bold', color:'#1890ff' }}>
                        {selectedAbout.statistics?.studentsServed?.toLocaleString() || 0}
                      </div>
                      <div>Students Served</div>
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small" style={{ textAlign:'center' }}>
                      <div style={{ fontSize:'24px', fontWeight:'bold', color:'#52c41a' }}>
                        {selectedAbout.statistics?.coursesOffered || 0}
                      </div>
                      <div>Courses Offered</div>
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small" style={{ textAlign:'center' }}>
                      <div style={{ fontSize:'24px', fontWeight:'bold', color:'#faad14' }}>
                        {selectedAbout.statistics?.yearsExperience || 0}
                      </div>
                      <div>Years Experience</div>
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small" style={{ textAlign:'center' }}>
                      <div style={{ fontSize:'24px', fontWeight:'bold', color:'#722ed1' }}>
                        {selectedAbout.statistics?.successRate || 0}%
                      </div>
                      <div>Success Rate</div>
                    </Card>
                  </Col>
                </Row>

                {/* Content Sections */}
                <Tabs defaultActiveKey="overview">
                  <TabPane tab="Overview" key="overview">
                    <div style={{ lineHeight:'1.8', whiteSpace:'pre-wrap' }}>
                      {selectedAbout.overview}
                    </div>
                  </TabPane>
                  <TabPane tab="Mission & Vision" key="mission">
                    <Card title={<Space><HeartOutlined />Mission</Space>} style={{ marginBottom: 16 }}>
                      <div style={{ lineHeight:'1.8', whiteSpace:'pre-wrap' }}>
                        {selectedAbout.mission}
                      </div>
                    </Card>
                    <Card title={<Space><TrophyOutlined />Vision</Space>}>
                      <div style={{ lineHeight:'1.8', whiteSpace:'pre-wrap' }}>
                        {selectedAbout.vision}
                      </div>
                    </Card>
                  </TabPane>
                  <TabPane tab="Our Story" key="story">
                    <div style={{ lineHeight:'1.8', whiteSpace:'pre-wrap' }}>
                      {selectedAbout.story}
                    </div>
                  </TabPane>
                  <TabPane tab="Team" key="team">
                    <Row gutter={[16, 16]}>
                      {selectedAbout.teamMembers?.map((member, index) => (
                        <Col span={8} key={index}>
                          <Card size="small">
                            <div style={{ textAlign:'center' }}>
                              <UserOutlined style={{ fontSize:'48px', color:'#1890ff', marginBottom: 8 }} />
                              <div style={{ fontWeight:'bold', fontSize:'16px' }}>{member.name}</div>
                              <div style={{ color:'#666', marginBottom: 8 }}>{member.position}</div>
                              <div style={{ fontSize:'12px', color:'#999' }}>{member.bio}</div>
                              {member.email && (
                                <div style={{ marginTop: 8 }}>
                                  <a href={`mailto:${member.email}`} style={{ fontSize:'12px' }}>
                                    {member.email}
                                  </a>
                                </div>
                              )}
                            </div>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </TabPane>
                  <TabPane tab="Values" key="values">
                    <Row gutter={[16, 16]}>
                      {selectedAbout.values?.map((value, index) => (
                        <Col span={8} key={index}>
                          <Card size="small" style={{ textAlign:'center' }}>
                            <RocketOutlined style={{ fontSize:'24px', color:'#1890ff', marginBottom: 8 }} />
                            <div style={{ fontWeight:'bold' }}>{value}</div>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </TabPane>
                </Tabs>
              </div>
            )}
          </Modal>

        </Content>
      </Layout>
    </Layout>
  );
};

export default AboutUsManagement;
