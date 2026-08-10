import React, { useEffect, useState, useRef } from'react';
import toast from '../../../utils/toast';
import dayjs from 'dayjs';
import { Card, Input, Button, Avatar, Typography, Tag, Space, Divider, Spin, Upload, Image, Tooltip, Badge } from'antd';
import { 
    SendOutlined, 
    ArrowLeftOutlined, 
    UserOutlined, 
    RobotOutlined, 
    CheckCircleOutlined, 
    UploadOutlined, 
    FileTextOutlined,
    ClockCircleOutlined,
    CheckOutlined
} from'@ant-design/icons';
import { useParams, useNavigate } from'react-router-dom';
import axios from'axios';
import socket from'../../../utils/socket';
import url, { BACKEND_UPLOAD_URL } from'../../../url';
import { getAuthHeaders, getStoredUser, getUserRole } from'../../../utils/global_auth';
import SupportLayout from'./SupportLayout';
import { SupportTicket, SupportMessage } from'../../../types/support';
import usePageTitle from '../../../hooks/usePageTitle';

const { Title, Text } = Typography;

const SupportTicketChat: React.FC = () => {
  usePageTitle('Support Chat | Admin');
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState<SupportTicket | null>(null);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [fileList, setFileList] = useState<any[]>([]);
    const [sending, setSending] = useState(false);
    const [typingStatus, setTypingStatus] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<any>(null);
    
    const user = getStoredUser();
    const role = getUserRole();
    const myId = user?.id || user?._id;

    const fetchTicket = async () => {
        try {
            const res = await axios.get(`${url}/support/${id}`, {
                headers: getAuthHeaders()
            });
            if (res.data.success) {
                setTicket(res.data.ticket);
                setLoading(false);
            }
        } catch (error) {
            toast.error('Failed to load ticket details');
            navigate('/support');
        }
    };

    useEffect(() => {
        fetchTicket();

        const onConnect = () => {
            console.log("Socket connected, joining ticket room:", id);
            socket.emit('join_ticket', id);
            socket.emit('user_online', { userId: myId, role: role.toLowerCase() });
        };

        if (socket.connected) {
            onConnect();
        }

        socket.on('connect', onConnect);

        const handleReceiveMessage = (data: any) => {
            if (data.ticketId === id) {
                // Don't add if it's my own message (we already added it optimistically)
                setTicket((prev: any) => {
                    if (!prev) return prev;
                    
                    const messageExists = prev.messages.some((m: any) => 
                        (m.tempId && m.tempId === data.tempId) || 
                        (m._id && m._id === data._id)
                    );
                    
                    if (messageExists) return prev;

                    return {
                        ...prev,
                        messages: [...prev.messages, {
                            ...data,
                            timestamp: data.timestamp || new Date().toISOString()
                        }]
                    };
                });
                
                if (document.visibilityState ==='visible' && data.senderId.toString() !== myId?.toString()) {
                    markAsRead();
                }
            }
        };

        const handleUserTyping = (data: any) => {
            if (data.ticketId === id && data.userId.toString() !== myId?.toString()) {
                setTypingStatus(`${data.userName} is typing...`);
            }
        };

        const handleUserStopTyping = (data: any) => {
            if (data.ticketId === id && data.userId.toString() !== myId?.toString()) {
                setTypingStatus(null);
            }
        };

        const handleMessagesRead = (data: any) => {
            if (data.ticketId === id && data.userId.toString() !== myId?.toString()) {
                setTicket((prev: any) => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        messages: prev.messages.map((m: any) => ({
                            ...m,
                            isRead: true
                        }))
                    };
                });
            }
        };

        socket.on('receive_message', handleReceiveMessage);
        socket.on('user_typing', handleUserTyping);
        socket.on('user_stop_typing', handleUserStopTyping);
        socket.on('messages_read', handleMessagesRead);

        if (!socket.connected) {
            socket.connect();
        }

        return () => {
            socket.emit('leave_ticket', id);
            socket.off('connect', onConnect);
            socket.off('receive_message', handleReceiveMessage);
            socket.off('user_typing', handleUserTyping);
            socket.off('user_stop_typing', handleUserStopTyping);
            socket.off('messages_read', handleMessagesRead);
        };
    }, [id, myId]);

    const markAsRead = async () => {
        try {
            await axios.put(`${url}/support/${id}/read`, {}, {
                headers: getAuthHeaders()
            });
            socket.emit('message_seen', { ticketId: id, userId: myId });
            window.dispatchEvent(new Event('refresh_notifications'));
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    useEffect(() => {
        if (ticket && !loading) {
            markAsRead();
        }
    }, [id, loading]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [ticket?.messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() && fileList.length === 0) return;

        const tempId = Date.now().toString();
        const messageText = newMessage;
        const currentFiles = [...fileList];

        try {
            setSending(true);
            
            // Optimistic update
            const optimisticMsg = {
                tempId,
                senderId: myId,
                senderModel: role ==='ADMIN' ?'Admin' : role ==='TEACHER' ?'Teacher' :'User',
                text: messageText,
                attachments: [], // Will be updated after upload
                timestamp: new Date().toISOString(),
                isRead: false,
                sending: true
            };

            setTicket((prev: any) => ({
                ...prev,
                messages: [...prev.messages, optimisticMsg]
            }));
            
            setNewMessage('');
            setFileList([]);

            const formData = new FormData();
            formData.append('text', messageText);
            currentFiles.forEach(file => {
                if (file.originFileObj) {
                    formData.append('attachments', file.originFileObj);
                }
            });

            const res = await axios.post(`${url}/support/${id}/message`, formData, {
                headers: {
                    ...getAuthHeaders(),
'Content-Type':'multipart/form-data'
                }
            });

            if (res.data.success) {
                const latestMsg = res.data.ticket.messages[res.data.ticket.messages.length - 1];
                
                // Replace optimistic message with real one
                setTicket((prev: any) => ({
                    ...prev,
                    messages: prev.messages.map((m: any) => 
                        m.tempId === tempId ? { ...latestMsg, sending: false } : m
                    )
                }));

                const messageData = {
                    ...latestMsg,
                    ticketId: id,
                    tempId
                };
                
                socket.emit('send_message', messageData);
                socket.emit('stop_typing', { ticketId: id, userId: myId });
            }
        } catch (error) {
            toast.error('Failed to send message');
            // Remove optimistic message on failure
            setTicket((prev: any) => ({
                ...prev,
                messages: prev.messages.filter((m: any) => m.tempId !== tempId)
            }));
            setNewMessage(messageText);
            setFileList(currentFiles);
        } finally {
            setSending(false);
        }
    };

    const updateStatus = async (status: string) => {
        try {
            const res = await axios.put(`${url}/support/${id}/status`, { status }, {
                headers: getAuthHeaders()
            });
            if (res.data.success) {
                toast.success(`Ticket status updated to ${status}`);
                setTicket(res.data.ticket);
                window.dispatchEvent(new Event('refresh_notifications'));
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const groupMessagesByDate = (messages: SupportMessage[]) => {
        const groups: { [key: string]: SupportMessage[] } = {};
        messages.forEach(msg => {
            const d = dayjs(msg.timestamp);
            if (!d.isValid()) return;
            const dateKey = d.format('YYYY-MM-DD');
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(msg);
        });
        return groups;
    };

    const formatGroupDate = (dateStr: string) => {
        const d = dayjs(dateStr);
        if (!d.isValid()) return 'Unknown Date';
        const today = dayjs().startOf('day');
        const yesterday = dayjs().subtract(1, 'day').startOf('day');
        const msgDate = d.startOf('day');

        if (msgDate.isSame(today, 'day')) return 'Today';
        if (msgDate.isSame(yesterday, 'day')) return 'Yesterday';
        return d.format('D MMM YYYY');
    };

    if (loading || !ticket) return <div style={{ textAlign:'center', padding: 100 }}><Spin size="large" tip="Loading Chat..." /></div>;

    const renderAttachments = (attachments: string[]) => {
        if (!attachments || attachments.length === 0) return null;
        return (
            <div style={{ marginTop: 8, display:'flex', flexWrap:'wrap', gap: 8 }}>
                {attachments.map((path, idx) => {
                    const fullUrl = `${BACKEND_UPLOAD_URL}/${path}`;
                    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(path);
                    return (
                        <div key={idx} style={{ position:'relative', borderRadius: 8, overflow:'hidden', border:'1px solid #f0f0f0' }}>
                            {isImage ? (
                                <Image 
                                    src={fullUrl} 
                                    width={100} 
                                    height={100} 
                                    style={{ objectFit:'cover' }} 
                                />
                            ) : (
                                <Card size="small" style={{ width: 100, height: 100, display:'flex', alignItems:'center', justifyContent:'center', background:'#fafafa' }}>
                                    <Button 
                                        type="link" 
                                        icon={<FileTextOutlined style={{ fontSize: 24 }} />} 
                                        href={fullUrl} 
                                        target="_blank"
                                    >
                                        DOC
                                    </Button>
                                </Card>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    const requester = ticket.requesterId;
    const requesterName = requester?.tname || requester?.name ||'User';
    const requesterAvatar = requester?.avatar || requester?.tprofile;

    // senderModel in DB is 'admins' (not 'Admin') — normalize both
    const isAdminMsg = (model: string) => model === 'admins' || model === 'Admin';

    return (
        <SupportLayout>
            <div style={{ display:'flex', flexDirection:'column', maxWidth: 1200, margin:'0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: 20, display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <Space size={16}>
                        <Button 
                            shape="circle" 
                            icon={<ArrowLeftOutlined />} 
                            onClick={() => navigate('/support')} 
                            style={{ boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}
                        />
                        <div>
                            <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
                                <Title level={4} style={{ margin: 0 }}>{ticket.subject}</Title>
                                <Tag color={ticket.status ==='Open' ?'green' : ticket.status ==='In Progress' ?'blue' :'default'} style={{ borderRadius: 12 }}>
                                    {ticket.status}
                                </Tag>
                            </div>
                            <Space size={8} style={{ marginTop: 4 }}>
                                <Text type="secondary" style={{ fontSize: 13 }}>ID: {ticket.ticketId}</Text>
                                <Divider type="vertical" />
                                <Tag color="blue" plain style={{ border:'none', background:'#e6f7ff', color:'#1890ff' }}>{ticket.category}</Tag>
                                <Divider type="vertical" />
                                <Text type="secondary" style={{ fontSize: 13 }}>
                                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                                    Opened on {dayjs(ticket.createdAt).format('D/M/YYYY')}
                                </Text>
                            </Space>
                        </div>
                    </Space>
                    <Space>
                        {role ==='ADMIN' && ticket.status !=='Resolved' && (
                            <Button 
                                type="primary" 
                                icon={<CheckCircleOutlined />} 
                                onClick={() => updateStatus('Resolved')}
                                style={{ borderRadius: 8, height: 40, fontWeight: 500 }}
                            >
                                Resolve Ticket
                            </Button>
                        )}
                    </Space>
                </div>

                {/* Chat Container */}
                <Card 
                    style={{ 
                        flex: 1, 
                        display:'flex', 
                        flexDirection:'column', 
                        borderRadius: 20, 
                        overflow:'hidden',
                        boxShadow:'0 10px 30px rgba(0,0,0,0.08)',
                        border:'none'
                    }}
                    bodyStyle={{ flex: 1, display:'flex', flexDirection:'column', padding: 0 }}
                >
                    {/* Chat Messages */}
                    <div 
                        ref={scrollRef}
                        style={{ 
                            minHeight:'400px',
                            maxHeight:'65vh',
                            overflowY:'auto', 
                            padding:'30px 40px', 
                            background:'#f0f2f5',
                            scrollBehavior:'smooth'
                        }}
                    >
                        <div style={{ textAlign:'center', marginBottom: 30 }}>
                            <Badge status="processing" text={<Text type="secondary" style={{ fontSize: 12 }}>Secure end-to-end support session</Text>} />
                        </div>

                        {Object.entries(groupMessagesByDate(ticket.messages)).map(([date, msgs]) => (
                            <React.Fragment key={date}>
                                <div style={{ textAlign:'center', margin:'20px 0' }}>
                                    <Tag style={{ borderRadius: 12, background:'rgba(0,0,0,0.05)', border:'none', color:'#586069', fontSize: 11, padding:'2px 12px', fontWeight: 600 }}>
                                        {formatGroupDate(date)}
                                    </Tag>
                                </div>
                                {msgs.map((msg: any, index: number) => {
                                    const isMe = msg.senderId.toString() === myId?.toString() || msg.senderId?._id?.toString() === myId?.toString();
                                    
                                    // Check if previous message was from the same sender to group them
                                    const prevMsg = index > 0 ? msgs[index - 1] : null;
                                    const isSameSender = prevMsg && (
                                        (prevMsg.senderId.toString() === msg.senderId.toString()) ||
                                        (prevMsg.senderId?._id?.toString() === msg.senderId?._id?.toString())
                                    );

                                    return (
                                        <div 
                                            key={msg._id || msg.tempId || index} 
                                            style={{ 
                                                display:'flex', 
                                                justifyContent: isMe ?'flex-end' :'flex-start',
                                                marginBottom: isSameSender ? 4 : 16,
                                                paddingTop: isSameSender ? 0 : 8
                                            }}
                                        >
                                            <div style={{ 
                                                display:'flex', 
                                                flexDirection: isMe ?'row-reverse' :'row',
                                                maxWidth:'80%',
                                                alignItems:'flex-end'
                                            }}>
                                                {!isMe && (
                                                    <div style={{ width: 32, marginRight: 8, flexShrink: 0 }}>
                                                        {!isSameSender && (
                                                            <Avatar 
                                                                src={isAdminMsg(msg.senderModel) ? undefined : (requesterAvatar ? `${BACKEND_UPLOAD_URL}/${requesterAvatar}` : undefined)}
                                                                icon={isAdminMsg(msg.senderModel) ? <RobotOutlined /> : <UserOutlined />} 
                                                                style={{ 
                                                                    backgroundColor: isAdminMsg(msg.senderModel) ? '#722ed1' : '#1890ff',
                                                                    boxShadow:'0 2px 8px rgba(0,0,0,0.1)',
                                                                    marginBottom: 4
                                                                }} 
                                                                size={32}
                                                            />
                                                        )}
                                                    </div>
                                                )}
                                                
                                                <div style={{ display:'flex', flexDirection:'column', alignItems: isMe ?'flex-end' :'flex-start' }}>
                                                    <div style={{ 
                                                        padding:'12px 16px', 
                                                        borderRadius: 18, 
                                                        background: isMe ?'linear-gradient(135deg, #0084ff 0%, #0073e6 100%)' :'#fff',
                                                        color: isMe ?'#fff' :'#1a1a1a',
                                                        boxShadow:'0 2px 8px rgba(0,0,0,0.06)',
                                                        borderBottomRightRadius: (isMe && !isSameSender) ? 4 : 18,
                                                        borderBottomLeftRadius: (!isMe && !isSameSender) ? 4 : 18,
                                                        position:'relative',
                                                        minWidth: 80,
                                                        transition:'all 0.2s ease'
                                                    }}>
                                                        {!isMe && !isSameSender && (
                                                            <div style={{ fontSize: 11, fontWeight: 800, marginBottom: 4, color: isAdminMsg(msg.senderModel) ? '#722ed1' : '#1890ff', letterSpacing: 0.3 }}>
                                                                {isAdminMsg(msg.senderModel) ? 'SUPPORT AGENT' : requesterName.toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div style={{ fontSize: 14.5, lineHeight: 1.5, wordBreak:'break-word' }}>{msg.text}</div>
                                                        {renderAttachments(msg.attachments)}
                                                        
                                                        <div style={{ 
                                                            display:'flex', 
                                                            alignItems:'center', 
                                                            justifyContent:'flex-end',
                                                            gap: 6, 
                                                            marginTop: 6,
                                                            opacity: 0.8
                                                        }}>
                                                            <span style={{ fontSize: 10, color: isMe ?'rgba(255,255,255,0.9)' :'#8c8c8c', fontWeight: 500 }}>
                                                                {dayjs(msg.timestamp).format('hh:mm A')}
                                                            </span>
                                                            {isMe && (
                                                                <span style={{ display:'flex' }}>
                                                                    {msg.sending ? (
                                                                        <ClockCircleOutlined style={{ fontSize: 10, color:'rgba(255,255,255,0.8)' }} />
                                                                    ) : (
                                                                        <>
                                                                            <CheckOutlined style={{ fontSize: 10, color: msg.isRead ?'#b7eb8f' :'rgba(255,255,255,0.7)', marginRight: -6 }} />
                                                                            <CheckOutlined style={{ fontSize: 10, color: msg.isRead ?'#b7eb8f' :'rgba(255,255,255,0.7)' }} />
                                                                        </>
                                                                    )}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </React.Fragment>
                        ))}

                        {typingStatus && (
                            <div style={{ display:'flex', gap: 8, alignItems:'center', marginBottom: 10, marginLeft: 50 }}>
                                <Badge status="processing" color="blue" />
                                <Text italic type="secondary" style={{ fontSize: 12 }}>{typingStatus}</Text>
                            </div>
                        )}
                    </div>

                    {/* Chat Input */}
                    <div style={{ padding:'20px 30px', background:'#fff', borderTop:'1px solid #f0f0f0' }}>
                        <div style={{ marginBottom: 12 }}>
                            <Upload
                                fileList={fileList}
                                onChange={({ fileList }) => setFileList(fileList)}
                                beforeUpload={() => false}
                                multiple
                                maxCount={5}
                            >
                                <Button shape="round" icon={<UploadOutlined />} style={{ border:'1px dashed #d9d9d9' }}>Attach Files</Button>
                            </Upload>
                        </div>
                        <div style={{ display:'flex', gap: 16, alignItems:'flex-end' }}>
                            <Input.TextArea 
                                autoSize={{ minRows: 1, maxRows: 6 }}
                                placeholder="Write a message..."
                                value={newMessage}
                                onChange={(e) => {
                                    setNewMessage(e.target.value);
                                    
                                    // Typing logic
                                    socket.emit('typing', { 
                                        ticketId: id, 
                                        userId: myId, 
                                        userName: role ==='ADMIN' ?'Support Assistant' : requesterName 
                                    });

                                    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                                    typingTimeoutRef.current = setTimeout(() => {
                                        socket.emit('stop_typing', { ticketId: id, userId: myId });
                                    }, 2000);
                                }}
                                onPressEnter={(e) => {
                                    if (!e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                style={{ 
                                    borderRadius: 12, 
                                    background:'#f5f5f5', 
                                    border:'none', 
                                    padding:'12px 16px',
                                    fontSize: 14 
                                }}
                            />
                            <Tooltip title="Send Message">
                                <Button 
                                    type="primary" 
                                    icon={<SendOutlined />} 
                                    size="large"
                                    shape="circle"
                                    loading={sending}
                                    onClick={handleSendMessage}
                                    style={{ 
                                        width: 50, 
                                        height: 50, 
                                        boxShadow:'0 4px 10px rgba(24,144,255,0.3)',
                                        display:'flex',
                                        alignItems:'center',
                                        justifyContent:'center'
                                    }}
                                />
                            </Tooltip>
                        </div>
                    </div>
                </Card>
            </div>
        </SupportLayout>
    );
};

export default SupportTicketChat;
