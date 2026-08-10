import React, { useEffect, useState } from'react';
import toast from '../../../utils/toast';
import { Table, Tag, Button, Space, Card, Typography, Select, Avatar, Tooltip, Row, Col } from'antd';
import { PlusOutlined, MessageOutlined, UserOutlined, CheckCircleOutlined, ClockCircleOutlined, InfoCircleOutlined, BarChartOutlined } from'@ant-design/icons';
import { useNavigate } from'react-router-dom';
import axios from'axios';
import url, { BACKEND_UPLOAD_URL } from'../../../url';
import { getAuthHeaders, getUserRole } from'../../../utils/global_auth';
import SupportLayout from'./SupportLayout';
import { SupportTicket, TicketStatus } from'../../../types/support';
import usePageTitle from '../../../hooks/usePageTitle';

const { Title, Text } = Typography;
const { Option } = Select;

//  StatCard 
const StatCard = ({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) => (
    <Card style={{ borderRadius: 12, border: `1px solid ${color}22`, height:'100%', boxShadow:'0 4px 12px rgba(0,0,0,0.03)' }} bodyStyle={{ padding:'16px 20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
                <Text type="secondary" style={{ fontSize: 11, fontWeight: 600, textTransform:'uppercase', letterSpacing: 0.5 }}>{title}</Text>
                <Title level={3} style={{ margin:'4px 0 0', color:'#1a1a1a' }}>{value}</Title>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize: 18, color }}>
                {icon}
            </div>
        </div>
    </Card>
);

const SupportTicketList: React.FC = () => {
  usePageTitle('Support Tickets | Admin');
    const navigate = useNavigate();
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<TicketStatus | null>(null);
    const role = getUserRole();

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${url}/support/list`, {
                headers: getAuthHeaders(),
                params: { status: filterStatus }
            });
            if (res.data.success) {
                setTickets(res.data.tickets);
            }
        } catch (error) {
            toast.error('Failed to fetch tickets');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, [filterStatus]);

    const columns = [
        {
            title:'Ticket ID',
            dataIndex:'ticketId',
            key:'ticketId',
            width: 140,
            render: (text: string) => <Text strong style={{ color:'#1890ff' }}>{text}</Text>,
        },
        {
            title:'Requester',
            key:'requester',
            hidden: role !=='ADMIN',
            render: (_: any, record: SupportTicket) => {
                const requester = record.requesterId;
                const name = requester?.tname || requester?.name ||'Unknown';
                const email = requester?.temail || requester?.email ||'';
                const avatar = requester?.avatar || requester?.tprofile;
                const roleColor = record.requesterRole ==='Teacher' ?'purple' :'orange';

                return (
                    <Space>
                        <Avatar 
                            src={avatar ? `${BACKEND_UPLOAD_URL}/${avatar}` : undefined} 
                            icon={!avatar && <UserOutlined />} 
                        />
                        <div style={{ display:'flex', flexDirection:'column' }}>
                            <Text strong>{name}</Text>
                            <Space size={4}>
                                <Tag color={roleColor} style={{ fontSize:'10px', lineHeight:'16px' }}>{record.requesterRole}</Tag>
                                <Text type="secondary" style={{ fontSize:'12px' }}>{email}</Text>
                            </Space>
                        </div>
                    </Space>
                );
            },
        },
        {
            title:'Issue Details',
            key:'details',
            render: (_: any, record: SupportTicket) => (
                <div style={{ display:'flex', flexDirection:'column' }}>
                    <Text strong>{record.subject}</Text>
                    <Space size={4}>
                        <Tag color="blue">{record.category}</Tag>
                    </Space>
                </div>
            ),
        },
        {
            title:'Priority',
            dataIndex:'priority',
            key:'priority',
            width: 100,
            render: (priority: string) => {
                const colors: Record<string, string> = {
                    Low:'default',
                    Medium:'blue',
                    High:'orange',
                    Urgent:'red',
                };
                return <Tag color={colors[priority]}>{priority}</Tag>;
            },
        },
        {
            title:'Status',
            dataIndex:'status',
            key:'status',
            width: 120,
            render: (status: string) => {
                const colors: Record<string, string> = {
                    Open:'green',
'In Progress':'processing',
                    Resolved:'success',
                    Closed:'default',
                };
                return <Tag color={colors[status]}>{status}</Tag>;
            },
        },
        {
            title:'Last Update',
            dataIndex:'lastMessageAt',
            key:'lastMessageAt',
            width: 180,
            render: (date: string) => (
                <Tooltip title={new Date(date).toLocaleString()}>
                    <Text type="secondary">{new Date(date).toLocaleDateString()} {new Date(date).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</Text>
                </Tooltip>
            ),
        },
        {
            title:'Action',
            key:'action',
            width: 120,
            render: (_: any, record: SupportTicket) => (
                <Button 
                    type="primary" 
                    icon={<MessageOutlined />} 
                    onClick={() => navigate(`/support/ticket/${record._id}`)}
                    style={{ borderRadius: 6 }}
                >
                    Chat
                </Button>
            ),
        },
    ].filter(col => !col.hidden);

    return (
        <SupportLayout>
            <div style={{ padding:'0 8px' }}>
                {/*  Header Banner  */}
                <div style={{
                    background:'linear-gradient(135deg, #722ed1 0%, #531dab 100%)',
                    borderRadius: 16, padding:'24px 32px', marginBottom: 24,
                    display:'flex', justifyContent:'space-between', alignItems:'center',
                    flexWrap:'wrap', gap: 16, boxShadow:'0 8px 32px rgba(114, 46, 209, 0.2)'
                }}>
                    <div>
                        <Title level={2} style={{ color:'#fff', margin: 0 }}>
                            <MessageOutlined style={{ marginRight: 10, color:'#b7eb8f' }} />
                            Help & Support
                        </Title>
                        <Text style={{ color:'rgba(255,255,255,0.8)', fontSize: 14 }}>
                            {role ==='ADMIN' ?'Support Management Center  Resolving inquiries in real-time' :'We are here to help  Raise a ticket and our team will get back to you.'}
                        </Text>
                    </div>
                    {role !=='ADMIN' && (
                        <Button 
                            type="primary" 
                            size="large" 
                            icon={<PlusOutlined />} 
                            onClick={() => navigate('/support/create')}
                            style={{ 
                                background:'#fff', color:'#722ed1', border:'none', 
                                borderRadius: 10, height: 48, fontWeight: 700, 
                                boxShadow:'0 4px 15px rgba(0,0,0,0.1)' 
                            }}
                        >
                            Raise New Ticket
                        </Button>
                    )}
                </div>

                {/*  Stats Row  */}
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                    <Col xs={24} sm={12} lg={6}>
                        <StatCard title="Total Tickets" value={tickets.length} icon={<BarChartOutlined />} color="#1890ff" />
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <StatCard title="Open Tickets" value={tickets.filter(t => t.status ==='Open').length} icon={<InfoCircleOutlined />} color="#faad14" />
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <StatCard title="In Progress" value={tickets.filter(t => t.status ==='In Progress').length} icon={<ClockCircleOutlined />} color="#13c2c2" />
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <StatCard title="Resolved" value={tickets.filter(t => t.status ==='Resolved').length} icon={<CheckCircleOutlined />} color="#52c41a" />
                    </Col>
                </Row>

                <Card 
                    style={{ borderRadius: 16, boxShadow:'0 8px 24px rgba(0,0,0,0.05)', border:'none' }}
                    bodyStyle={{ padding:'24px' }}
                >
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 20 }}>
                        <Title level={4} style={{ margin: 0 }}>Ticket History</Title>
                        <Space>
                            <Text strong>Filter:</Text>
                            <Select 
                                placeholder="All Status" 
                                style={{ width: 160 }} 
                                allowClear 
                                onChange={(val) => setFilterStatus(val)}
                                size="middle"
                            >
                                <Option value="Open">Open</Option>
                                <Option value="In Progress">In Progress</Option>
                                <Option value="Resolved">Resolved</Option>
                                <Option value="Closed">Closed</Option>
                            </Select>
                        </Space>
                    </div>

                <Table 
                    columns={columns} 
                    dataSource={tickets} 
                    loading={loading}
                    rowKey="_id"
                    pagination={{ pageSize: 10, position: ['bottomCenter'] }}
                    style={{ borderRadius: 12 }}
                />
                </Card>
            </div>
        </SupportLayout>
    );
};

export default SupportTicketList;
