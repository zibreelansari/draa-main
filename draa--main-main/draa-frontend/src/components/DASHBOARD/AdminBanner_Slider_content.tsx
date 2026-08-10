//  FULLY UPDATED  STYLING FIXED  NON-BORING UI

import React, { useEffect, useState } from"react";
import {
  Layout,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  message,
  Popconfirm,
  Tag,
  Space,
  Card,
  Row,
  Col,
  Typography,
  Upload,
  Image, // Import Image component
  Empty
} from"antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PictureOutlined,
  LinkOutlined,
  UploadOutlined,
  EyeOutlined
} from"@ant-design/icons";
import Sidebar from"./Sidebar";
import Topbar from"./Topbar";
import url from"../../url";
import usePageTitle from '../../hooks/usePageTitle';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const BannerManager = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [mobileFileList, setMobileFileList] = useState([]);
  const [previewMode, setPreviewMode] = useState("desktop");
  const [form] = Form.useForm();

  const [previewData, setPreviewData] = useState({
    title:"Preview Title",
    subtitle:"Your awesome subtitle goes here to show how it looks.",
    imageUrl:"",
    mobileImageUrl:"",
    mobileResizeMode:"padded",
    themeColor:"#ffffff",
    textPosition:"left",
    btnText:"Learn More"
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${url}/admin/banner/all`);
      const data = await res.json();
      if (data.success) setBanners(data.data);
      else message.error("Failed to fetch banners");
    } catch (error) {
      message.error("Connection error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${url}/admin/banner/delete/${id}`, {
        method:"DELETE",
      });
      const data = await res.json();
      if (data.success) {
        message.success("Banner deleted");
        fetchBanners();
      } else message.error(data.message);
    } catch {
      message.error("Error deleting");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await fetch(`${url}/admin/banner/toggle/${id}`, {
        method:"PATCH",
      });
      const data = await res.json();
      if (data.success) fetchBanners();
    } catch {
      message.error("Error updating status");
    }
  };

  // PREVIEW BASE64 ONLY
  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleUploadChange = async ({ fileList: newList }) => {
    setFileList(newList);
    if (newList.length > 0 && newList[0].originFileObj) {
      const previewURL = await getBase64(newList[0].originFileObj);
      setPreviewData((p) => ({ ...p, imageUrl: previewURL }));
    } else {
      if (!editingBanner) setPreviewData((p) => ({ ...p, imageUrl:"" }));
    }
  };

  const handleMobileUploadChange = async ({ fileList: newList }) => {
    setMobileFileList(newList);
    if (newList.length > 0 && newList[0].originFileObj) {
      const previewURL = await getBase64(newList[0].originFileObj);
      setPreviewData((p) => ({ ...p, mobileImageUrl: previewURL }));
    } else {
      if (!editingBanner) setPreviewData((p) => ({ ...p, mobileImageUrl:"" }));
    }
  };

  const handleFinish = async (values) => {
    const formData = new FormData();
    Object.keys(values).forEach((key) => {
      formData.append(key, values[key]);
    });
    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append("image", fileList[0].originFileObj);
    }
    if (mobileFileList.length > 0 && mobileFileList[0].originFileObj) {
      formData.append("mobileImage", mobileFileList[0].originFileObj);
    }

    const endpoint = editingBanner
      ? `${url}/admin/banner/update/${editingBanner._id}`
      : `${url}/admin/banner/create`;

    const method = editingBanner ?"PUT" :"POST";

    try {
      const res = await fetch(endpoint, {
        method,
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        message.success(editingBanner ?"Banner updated" :"Banner created");
        setIsModalVisible(false);
        form.resetFields();
        setFileList([]);
        setMobileFileList([]);
        fetchBanners();
      } else {
        message.error(data.message);
      }
    } catch {
      message.error("Operation failed");
    }
  };

  const openModal = (banner = null) => {
    setEditingBanner(banner);
    if (banner) {
      form.setFieldsValue(banner);
      setPreviewData({
        ...banner,
        imageUrl: banner.imageUrl ? (banner.imageUrl.startsWith("data:") ? banner.imageUrl : `${url}${banner.imageUrl}`) :"",
        mobileImageUrl: banner.mobileImageUrl ? (banner.mobileImageUrl.startsWith("data:") ? banner.mobileImageUrl : `${url}${banner.mobileImageUrl}`) :"",
        mobileResizeMode: banner.mobileResizeMode || "padded"
      });
      if (banner.imageUrl) {
        setFileList([
          {
            uid:"-1",
            name:"Current Banner",
            status:"done",
            url: `${url}${banner.imageUrl}`,
          },
        ]);
      } else {
        setFileList([]);
      }
      if (banner.mobileImageUrl) {
        setMobileFileList([
          {
            uid:"-2",
            name:"Current Mobile Banner",
            status:"done",
            url: `${url}${banner.mobileImageUrl}`,
          },
        ]);
      } else {
        setMobileFileList([]);
      }
    } else {
      form.resetFields();
      setPreviewData({
        title:"Preview Title",
        subtitle:"Your awesome subtitle goes here.",
        imageUrl:"",
        mobileImageUrl:"",
        mobileResizeMode:"padded",
        themeColor:"#ffffff",
        textPosition:"left",
        btnText:"Learn More"
      });
      setFileList([]);
      setMobileFileList([]);
    }
    setIsModalVisible(true);
  };

  const handleFormChange = (_, allValues) => {
    setPreviewData((p) => ({ 
      ...p, 
      ...allValues, 
      imageUrl: p.imageUrl, 
      mobileImageUrl: p.mobileImageUrl,
      mobileResizeMode: allValues.mobileResizeMode || p.mobileResizeMode
    }));
  };

  // --- COLUMNS CONFIGURATION ---
  const columns = [
    {
      title:"Preview",
      dataIndex:"imageUrl",
      width: 150, // Fixed width prevents overlap
      render: (img) => (
        <Image
          width={120}
          height={60}
          src={`${url}${img}`}
          style={{ objectFit:"contain", borderRadius: 6, border:"1px solid #f0f0f0" }}
          preview={{ mask: <EyeOutlined /> }}
        />
      ),
    },
    {
      title:"Details",
      width: 300, // Give text room to breathe
      render: (_, r) => (
        <div style={{ display:'flex', flexDirection:'column' }}>
          <Text strong style={{ fontSize: 16, marginBottom: 4 }}>{r.title}</Text>
          <Paragraph
            type="secondary"
            ellipsis={{ rows: 2, expandable: false, tooltip: r.subtitle }}
            style={{ margin: 0, fontSize: 13 }}
          >
            {r.subtitle}
          </Paragraph>
        </div>
      ),
    },
    {
      title:"Type",
      dataIndex:"type",
      width: 100,
      align:'center',
      render: (t) => {
        let color = t ==='hero' ?'geekblue' : t ==='offer' ?'green' :'purple';
        return <Tag color={color} style={{ minWidth: 60, textAlign:'center' }}>{t.toUpperCase()}</Tag>;
      },
    },
    {
      title:"Device",
      dataIndex:"deviceType",
      width: 110,
      align:'center',
      render: (d) => {
        let color = d ==='mobile' ?'magenta' : d ==='both' ?'gold' :'blue';
        return <Tag color={color} style={{ minWidth: 65, textAlign:'center' }}>{(d ||'both').toUpperCase()}</Tag>;
      },
    },
    {
      title:"Order",
      dataIndex:"order",
      width: 80,
      align:'center',
      sorter: (a, b) => a.order - b.order,
    },
    {
      title:"Status",
      width: 100,
      align:'center',
      render: (_, r) => (
        <Switch
          checkedChildren="Active"
          unCheckedChildren="Off"
          checked={r.isActive}
          onChange={() => handleToggleStatus(r._id)}
        />
      ),
    },
    {
      title:"Actions",
      width: 120,
      align:'right',
      render: (_, r) => (
        <Space>
          <Button type="text" icon={<EditOutlined style={{ color:'#1890ff' }} />} onClick={() => openModal(r)} />
          <Popconfirm title="Delete this banner?" onConfirm={() => handleDelete(r._id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight:"100vh" }}>
      <Topbar />
      <Layout>
        <Sidebar />
        <Layout style={{ padding:"24px", background:"#f0f2f5" }}>
          <Content style={{ maxWidth: 1200, margin:"0 auto", width:"100%" }}>

            <div style={{ marginBottom: 24, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <Title level={3} style={{ margin: 0 }}>Banner Management</Title>
                <Text type="secondary">Manage your website's hero section and sliders</Text>
              </div>
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => openModal()}
                style={{ borderRadius: 6 }}
              >
                Create New Banner
              </Button>
            </div>

            <Card bordered={false} style={{ borderRadius: 8, boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
              <Table
                columns={columns}
                dataSource={banners}
                rowKey="_id"
                loading={loading}
                pagination={{ pageSize: 5 }}
              />
            </Card>

            {/* MODAL */}
            <Modal
              title={editingBanner ?"Edit Banner" :"Create New Banner"}
              open={isModalVisible}
              footer={null}
              onCancel={() => setIsModalVisible(false)}
              width={900}
              centered
              bodyStyle={{ padding:"20px 24px" }}
            >
              <Row gutter={32}>
                {/* LEFT: FORM */}
                <Col span={11}>
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFinish}
                    onValuesChange={handleFormChange}                    initialValues={{
                      order: 0,
                      isActive: true,
                      type:"hero",
                      deviceType:"both",
                      mobileResizeMode:"padded",
                      textPosition:"left",
                      themeColor:"#ffffff",
                    }}
                  >
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="Web Image (2500X400)" required tooltip="Standard wide banner for web desktop layouts">
                          <Upload
                            maxCount={1}
                            beforeUpload={() => false}
                            onChange={handleUploadChange}
                            fileList={fileList}
                            listType="picture-card"
                            showUploadList={{ showPreviewIcon: false }}
                          >
                            {fileList.length < 1 && (
                              <div>
                                <PlusOutlined />
                                <div style={{ marginTop: 8 }}>Web Image</div>
                              </div>
                            )}
                          </Upload>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Mobile Image" tooltip="Optimized for mobile web viewports and app screen dimensions">
                          <Upload
                            maxCount={1}
                            beforeUpload={() => false}
                            onChange={handleMobileUploadChange}
                            fileList={mobileFileList}
                            listType="picture-card"
                            showUploadList={{ showPreviewIcon: false }}
                          >
                            {mobileFileList.length < 1 && (
                              <div>
                                <PlusOutlined />
                                <div style={{ marginTop: 8 }}>Mobile Image</div>
                              </div>
                            )}
                          </Upload>
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      name="title"
                      label="Main Title"
                    >
                      <Input placeholder="e.g., Welcome to Draa" />
                    </Form.Item>

                    <Form.Item name="subtitle" label="Subtitle / Description">
                      <TextArea rows={2} placeholder="Short description..." />
                    </Form.Item>

                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item name="type" label="Banner Type">
                          <Select>
                            <Option value="hero">Hero Section</Option>
                            <Option value="offer">Special Offer</Option>
                            <Option value="popup">Popup Modal</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="deviceType" label="Target Device">
                          <Select>
                            <Option value="both">Both (Web & Mobile)</Option>
                            <Option value="web">Web Only</Option>
                            <Option value="mobile">Mobile / Responsive</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="textPosition" label="Text Alignment">
                          <Select>
                            <Option value="left">Left</Option>
                            <Option value="center">Center</Option>
                            <Option value="right">Right</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>


                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name="btnText" label="Button Label">
                          <Input placeholder="e.g. Get Started" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="themeColor" label="Text Color">
                          <Input type="color" style={{ width:'100%', cursor:'pointer' }} />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item name="link" label="Destination Link">
                      <Input prefix={<LinkOutlined />} placeholder="/courses/all" />
                    </Form.Item>

                    <Row gutter={16} align="middle">
                      <Col span={12}>
                        <Form.Item name="order" label="Display Order">
                          <InputNumber min={0} style={{ width:"100%" }} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="isActive" valuePropName="checked" label="Status">
                          <Switch checkedChildren="Active" unCheckedChildren="Draft" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Button type="primary" htmlType="submit" size="large" block style={{ marginTop: 10 }}>
                      {editingBanner ?"Save Changes" :"Publish Banner"}
                    </Button>
                  </Form>
                </Col>

                {/* RIGHT: LIVE PREVIEW */}
                <Col span={13}>
                  <div style={{ position:'sticky', top: 20 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 15 }}>
                      <Text strong>Live Preview</Text>
                      <Space>
                        <Button 
                          size="small" 
                          type={previewMode === "desktop" ? "primary" : "default"} 
                          onClick={() => setPreviewMode("desktop")}
                        >
                          Desktop View
                        </Button>
                        <Button 
                          size="small" 
                          type={previewMode === "mobile" ? "primary" : "default"} 
                          onClick={() => setPreviewMode("mobile")}
                        >
                          Mobile View
                        </Button>
                      </Space>
                    </div>

                    {previewMode === "desktop" ? (
                      <div
                        style={{
                          height: 180,
                          borderRadius: 12,
                          overflow:'hidden',
                          position:'relative',
                          background:'#f5f5f5',
                          boxShadow:'0 4px 12px rgba(0,0,0,0.1)',
                          border:'1px solid #e0e0e0',
                          backgroundImage: previewData.imageUrl ? `url(${previewData.imageUrl})` :'none',
                          backgroundSize:"cover",
                          backgroundPosition:"center",
                          backgroundRepeat:"no-repeat",
                          display:"flex",
                          flexDirection:'column',
                          justifyContent:"center",
                          alignItems:
                            previewData.textPosition ==="left" ?"flex-start" :
                              previewData.textPosition ==="right" ?"flex-end" :"center",
                          padding: 20,
                        }}
                      >
                        {!previewData.imageUrl && (
                          <Empty description="No Web Image Selected" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ width:'100%' }} />
                        )}

                        {/* TEXT OVERLAY */}
                        {previewData.imageUrl && (
                          <div
                            style={{
                              maxWidth:'70%',
                              background:"rgba(0, 0, 0, 0.4)",
                              backdropFilter:"blur(4px)",
                              padding:"12px 16px",
                              borderRadius: 8,
                              color: previewData.themeColor,
                              textAlign: previewData.textPosition,
                            }}
                          >
                            <h3 style={{ color: previewData.themeColor, margin:"0 0 4px 0", fontSize: 16, fontWeight: 700 }}>
                              {previewData.title ||"Banner Title"}
                            </h3>
                            <p style={{ color: previewData.themeColor, opacity: 0.9, fontSize: 11, lineHeight: 1.3, margin: 0 }}>
                              {previewData.subtitle ||"Subtitle description..."}
                            </p>
                            {previewData.btnText && (
                              <Button type="primary" shape="round" size="small" style={{ marginTop: 6, fontSize: 10, height: 22 }}>
                                {previewData.btnText}
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        style={{
                          width: 200,
                          height: 320,
                          margin: '0 auto',
                          borderRadius: 20,
                          overflow:'hidden',
                          position:'relative',
                          background:'#f5f5f5',
                          boxShadow:'0 4px 16px rgba(0,0,0,0.15)',
                          border:'4px solid #333',
                          display:"flex",
                          flexDirection:'column',
                          justifyContent:"flex-end",
                          padding: 15,
                        }}
                      >
                        {/* BACKGROUND SIMULATION */}
                        {previewData.mobileImageUrl ? (
                          <div
                            style={{
                              position: 'absolute',
                              top: 0, left: 0, right: 0, bottom: 0,
                              backgroundImage: `url(${previewData.mobileImageUrl})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              zIndex: 1
                            }}
                          />
                        ) : previewData.imageUrl ? (
                          <>
                            {/* Blurred backdrop layer */}
                            <div
                              style={{
                                position: 'absolute',
                                top: 0, left: 0, right: 0, bottom: 0,
                                backgroundImage: `url(${previewData.imageUrl})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                filter: 'blur(15px) brightness(0.6)',
                                transform: 'scale(1.2)',
                                zIndex: 1
                              }}
                            />
                            {/* Fitted contain layer */}
                            <div
                              style={{
                                position: 'absolute',
                                top: 0, left: 0, right: 0, bottom: 0,
                                backgroundImage: `url(${previewData.imageUrl})`,
                                backgroundSize: 'contain',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center',
                                zIndex: 2
                              }}
                            />
                          </>
                        ) : null}

                        {(!previewData.mobileImageUrl && !previewData.imageUrl) && (
                          <Empty description="No Image Selected" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ marginTop: 80, zIndex: 3 }} />
                        )}

                        {/* TEXT OVERLAY */}
                        {(previewData.mobileImageUrl || previewData.imageUrl) && (
                          <div
                            style={{
                              width:'100%',
                              background:"rgba(0, 0, 0, 0.5)",
                              backdropFilter:"blur(3px)",
                              padding:"10px",
                              borderRadius: 8,
                              color: previewData.themeColor,
                              textAlign: 'center',
                              zIndex: 3
                            }}
                          >
                            <h4 style={{ color: previewData.themeColor, margin:"0 0 4px 0", fontSize: 13, fontWeight: 700 }}>
                              {previewData.title ||"Banner Title"}
                            </h4>
                            <p style={{ color: previewData.themeColor, opacity: 0.9, fontSize: 10, lineHeight: 1.2, margin: 0 }}>
                              {previewData.subtitle ||"Subtitle..."}
                            </p>
                            {previewData.btnText && (
                              <Button type="primary" shape="round" size="small" style={{ marginTop: 6, fontSize: 9, height: 20, width: '100%' }}>
                                {previewData.btnText}
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div style={{ marginTop: 15, background:'#e6f7ff', padding: 10, borderRadius: 6, border:'1px solid #91d5ff' }}>
                      <Space>
                        <PictureOutlined style={{ color:'#1890ff' }} />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          This is an approximation. Actual render depends on screen size.
                        </Text>
                      </Space>
                    </div>
                  </div>
                </Col>
              </Row>
            </Modal>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default BannerManager;