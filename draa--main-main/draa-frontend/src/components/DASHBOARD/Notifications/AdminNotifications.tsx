import React, { useEffect, useState, useMemo } from 'react';
import toast from '../../../utils/toast';
import { 
  Table, Button, Space, Card, Typography, Tabs, Input, 
  Tooltip, Popconfirm, Badge
} from 'antd';
import { 
  BellOutlined, CheckOutlined, DeleteOutlined, 
  SearchOutlined, ClearOutlined 
} from '@ant-design/icons';
import axios from 'axios';
import url from '../../../url';
import { getAuthHeaders } from '../../../utils/global_auth';
import SupportLayout from '../Support/SupportLayout';
import usePageTitle from '../../../hooks/usePageTitle';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: string;
}

const AdminNotifications: React.FC = () => {
  usePageTitle('Notifications Manager | Admin');
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${url}/notifications`, {
        headers: getAuthHeaders()
      });
      if (res.data.success) {
        setNotifications(res.data.data || []);
      }
    } catch (error) {
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Filtered Notifications based on active tab and search query
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      // Tab filter
      if (activeTab === 'unread' && n.isRead) return false;
      if (activeTab === 'read' && !n.isRead) return false;
      
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          n.title.toLowerCase().includes(query) ||
          n.message.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [notifications, activeTab, searchQuery]);

  const handleMarkRead = async (id: string) => {
    try {
      const res = await axios.put(`${url}/notifications/${id}/read`, {}, {
        headers: getAuthHeaders()
      });
      if (res.data.success) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        toast.success('Notification marked as read');
        window.dispatchEvent(new Event('refresh_notifications'));
      }
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await axios.delete(`${url}/notifications/${id}`, {
        headers: getAuthHeaders()
      });
      if (res.data.success) {
        setNotifications(prev => prev.filter(n => n._id !== id));
        toast.success('Notification deleted successfully');
        setSelectedRowKeys(prev => prev.filter(key => key !== id));
        window.dispatchEvent(new Event('refresh_notifications'));
      }
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  // Bulk Actions
  const handleMarkAllRead = async () => {
    try {
      const res = await axios.put(`${url}/notifications/read-all`, {}, {
        headers: getAuthHeaders()
      });
      if (res.data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        toast.success('All notifications marked as read');
        window.dispatchEvent(new Event('refresh_notifications'));
      }
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleClearAll = async () => {
    try {
      const res = await axios.delete(`${url}/notifications/clear-all`, {
        headers: getAuthHeaders()
      });
      if (res.data.success) {
        setNotifications([]);
        toast.success('All notifications deleted successfully');
        setSelectedRowKeys([]);
        window.dispatchEvent(new Event('refresh_notifications'));
      }
    } catch (error) {
      toast.error('Failed to delete all notifications');
    }
  };

  const handleBulkMarkRead = async () => {
    if (selectedRowKeys.length === 0) return;
    try {
      setLoading(true);
      await Promise.all(
        selectedRowKeys.map(id => 
          axios.put(`${url}/notifications/${id}/read`, {}, { headers: getAuthHeaders() }).catch(e => console.error(e))
        )
      );
      setNotifications(prev => prev.map(n => selectedRowKeys.includes(n._id) ? { ...n, isRead: true } : n));
      toast.success('Selected notifications marked as read');
      setSelectedRowKeys([]);
      window.dispatchEvent(new Event('refresh_notifications'));
    } catch (error) {
      toast.error('Failed to mark selected notifications as read');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRowKeys.length === 0) return;
    try {
      setLoading(true);
      await Promise.all(
        selectedRowKeys.map(id => 
          axios.delete(`${url}/notifications/${id}`, { headers: getAuthHeaders() }).catch(e => console.error(e))
        )
      );
      setNotifications(prev => prev.filter(n => !selectedRowKeys.includes(n._id)));
      toast.success('Selected notifications deleted successfully');
      setSelectedRowKeys([]);
      window.dispatchEvent(new Event('refresh_notifications'));
    } catch (error) {
      toast.error('Failed to delete selected notifications');
    } finally {
      setLoading(false);
    }
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const columns = [
    {
      title: 'Status',
      dataIndex: 'isRead',
      key: 'isRead',
      width: 100,
      render: (isRead: boolean) => (
        <Badge status={isRead ? 'default' : 'processing'} text={isRead ? 'Read' : 'New'} />
      )
    },
    {
      title: 'Details',
      key: 'details',
      render: (_: any, record: NotificationItem) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Text strong style={{ fontSize: '14px', color: record.isRead ? '#595959' : '#1a1a1a' }}>{record.title}</Text>
          <Text type="secondary" style={{ fontSize: '13px', marginTop: '4px', whiteSpace: 'pre-wrap' }}>{record.message}</Text>
        </div>
      )
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => (
        <Tooltip title={dayjs(date).format('YYYY-MM-DD HH:mm:ss')}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {dayjs(date).format('D MMM YYYY, h:mm A')}
          </Text>
        </Tooltip>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: NotificationItem) => (
        <Space size="middle">
          {!record.isRead && (
            <Tooltip title="Mark as Read">
              <Button 
                type="text" 
                icon={<CheckOutlined style={{ color: '#52c41a' }} />} 
                onClick={() => handleMarkRead(record._id)}
              />
            </Tooltip>
          )}
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete notification?"
              onConfirm={() => handleDelete(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <Button 
                type="text" 
                danger
                icon={<DeleteOutlined />} 
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <SupportLayout>
      <div style={{ padding: '0 8px' }}>
        {/* Header Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
          borderRadius: 16, padding: '24px 32px', marginBottom: 24,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 16, boxShadow: '0 8px 32px rgba(24, 144, 255, 0.2)'
        }}>
          <div>
            <Title level={2} style={{ color: '#fff', margin: 0 }}>
              <BellOutlined style={{ marginRight: 10, color: '#e6f7ff' }} />
              Notification Center
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>
              Manage system alerts, updates, and support notifications.
            </Text>
          </div>
          <Space size="middle">
            {notifications.some(n => !n.isRead) && (
              <Button 
                type="primary"
                onClick={handleMarkAllRead}
                style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 8 }}
              >
                Mark All Read
              </Button>
            )}
            {notifications.length > 0 && (
              <Popconfirm
                title="Are you sure you want to clear all notifications? This action is permanent."
                onConfirm={handleClearAll}
                okText="Clear All"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <Button 
                  danger
                  type="primary"
                  icon={<ClearOutlined />}
                  style={{ borderRadius: 8 }}
                >
                  Clear All
                </Button>
              </Popconfirm>
            )}
          </Space>
        </div>

        {/* Bulk Actions Panel */}
        {selectedRowKeys.length > 0 && (
          <Card 
            style={{ 
              borderRadius: 12, 
              background: '#e6f7ff', 
              border: '1px solid #91d5ff', 
              marginBottom: 16,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}
            bodyStyle={{ padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Space>
              <Text strong>{selectedRowKeys.length} items selected</Text>
            </Space>
            <Space size="middle">
              <Button 
                type="primary"
                icon={<CheckOutlined />}
                onClick={handleBulkMarkRead}
                style={{ borderRadius: 6 }}
              >
                Mark Selected Read
              </Button>
              <Popconfirm
                title={`Delete ${selectedRowKeys.length} selected notifications?`}
                onConfirm={handleBulkDelete}
                okText="Yes"
                cancelText="No"
                okButtonProps={{ danger: true }}
              >
                <Button 
                  danger
                  type="primary"
                  icon={<DeleteOutlined />}
                  style={{ borderRadius: 6 }}
                >
                  Delete Selected
                </Button>
              </Popconfirm>
            </Space>
          </Card>
        )}

        <Card 
          style={{ borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', border: 'none' }}
          bodyStyle={{ padding: '24px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
            <Tabs 
              activeKey={activeTab} 
              onChange={(key) => {
                setActiveTab(key);
                setSelectedRowKeys([]);
              }}
              style={{ flex: 1 }}
            >
              <Tabs.TabPane tab={<span>All <Badge count={notifications.length} overflowCount={99} style={{ backgroundColor: '#1890ff', marginLeft: 4 }} /></span>} key="all" />
              <Tabs.TabPane tab={<span>Unread <Badge count={notifications.filter(n => !n.isRead).length} overflowCount={99} style={{ backgroundColor: '#ef4444', marginLeft: 4 }} /></span>} key="unread" />
              <Tabs.TabPane tab={<span>Read <Badge count={notifications.filter(n => n.isRead).length} overflowCount={99} style={{ backgroundColor: '#52c41a', marginLeft: 4 }} /></span>} key="read" />
            </Tabs>

            <Input 
              placeholder="Search notifications..." 
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 300, borderRadius: 8 }}
              allowClear
            />
          </div>

          <Table 
            rowSelection={rowSelection}
            columns={columns} 
            dataSource={filteredNotifications} 
            loading={loading}
            rowKey="_id"
            pagination={{ pageSize: 15, position: ['bottomCenter'] }}
            style={{ borderRadius: 12 }}
          />
        </Card>
      </div>
    </SupportLayout>
  );
};

export default AdminNotifications;
