import React, { useState } from'react';
import toast from '../../../utils/toast';
import { Card, Form, Input, Select, Button, Typography, Space, Upload } from'antd';
import { ArrowLeftOutlined, SendOutlined, UploadOutlined } from'@ant-design/icons';
import { useNavigate } from'react-router-dom';
import axios from'axios';
import url from'../../../url';
import { getAuthHeaders } from'../../../utils/global_auth';
import SupportLayout from'./SupportLayout';
import usePageTitle from '../../../hooks/usePageTitle';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const SupportTicketCreate: React.FC = () => {
  usePageTitle('New Ticket | Admin');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState<any[]>([]);
    const [form] = Form.useForm();

    const onFinish = async (values: any) => {
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('subject', values.subject);
            formData.append('category', values.category);
            formData.append('priority', values.priority);
            formData.append('message', values.message);
            
            fileList.forEach(file => {
                if (file.originFileObj) {
                    formData.append('attachments', file.originFileObj);
                }
            });

            const res = await axios.post(`${url}/support/create`, formData, {
                headers: {
                    ...getAuthHeaders(),
'Content-Type':'multipart/form-data'
                }
            });

            if (res.data.success) {
                toast.success('Ticket raised successfully');
                navigate('/support');
            }
        } catch (error) {
            toast.error('Failed to create ticket');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SupportLayout>
            <div style={{ maxWidth: 800, margin:'0 auto' }}>
                <Button 
                    type="link" 
                    icon={<ArrowLeftOutlined />} 
                    onClick={() => navigate('/support')}
                    style={{ marginBottom: 16 }}
                >
                    Back to Tickets
                </Button>

                <Card style={{ borderRadius: 12, boxShadow:'0 4px 12px rgba(0,0,0,0.05)' }}>
                    <div style={{ marginBottom: 24 }}>
                        <Title level={3} style={{ margin: 0 }}>Raise a New Ticket</Title>
                        <Text type="secondary">Tell us what's wrong and we'll get back to you as soon as possible.</Text>
                    </div>

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                        initialValues={{ priority:'Medium' }}
                    >
                        <Form.Item
                            label="Subject"
                            name="subject"
                            rules={[{ required: true, message:'Please enter a subject' }]}
                        >
                            <Input placeholder="e.g., Unable to access course materials" size="large" />
                        </Form.Item>

                        <div style={{ display:'flex', gap: 16 }}>
                            <Form.Item
                                label="Category"
                                name="category"
                                rules={[{ required: true, message:'Please select a category' }]}
                                style={{ flex: 1 }}
                            >
                                <Select size="large">
                                    <Option value="Technical">Technical Issue</Option>
                                    <Option value="Billing">Billing & Payments</Option>
                                    <Option value="Course Content">Course Content</Option>
                                    <Option value="Exam Issue">Exam/Test Issue</Option>
                                    <Option value="Other">Other</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                label="Priority"
                                name="priority"
                                rules={[{ required: true, message:'Please select priority' }]}
                                style={{ flex: 1 }}
                            >
                                <Select size="large">
                                    <Option value="Low">Low</Option>
                                    <Option value="Medium">Medium</Option>
                                    <Option value="High">High</Option>
                                    <Option value="Urgent">Urgent</Option>
                                </Select>
                            </Form.Item>
                        </div>

                        <Form.Item
                            label="Detailed Description"
                            name="message"
                            rules={[{ required: true, message:'Please provide details' }]}
                        >
                            <TextArea 
                                rows={6} 
                                placeholder="Please describe the issue in detail..." 
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item label="Attachments (Optional)">
                            <Upload
                                fileList={fileList}
                                onChange={({ fileList }) => setFileList(fileList)}
                                beforeUpload={() => false}
                                multiple
                            >
                                <Button icon={<UploadOutlined />}>Select Files</Button>
                            </Upload>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                You can upload up to 5 files (Images/PDFs, max 10MB each)
                            </Text>
                        </Form.Item>

                        <Form.Item>
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                size="large" 
                                loading={loading}
                                icon={<SendOutlined />}
                                style={{ width:'100%', borderRadius: 8, height: 48 }}
                            >
                                Submit Ticket
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </div>
        </SupportLayout>
    );
};

export default SupportTicketCreate;
