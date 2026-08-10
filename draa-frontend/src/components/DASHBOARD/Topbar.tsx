import { useEffect, useState, useMemo } from'react';
import toast from '../../utils/toast';
import { Layout, Dropdown, Menu, Avatar, Space, Select, Badge, Button, Tooltip } from'antd';
import { useNavigate, Link } from'react-router-dom';
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  SearchOutlined,
  BellOutlined,
  QuestionCircleOutlined,
  ThunderboltOutlined
} from'@ant-design/icons';
import { getStoredUser, getUserRole, getAuthHeaders } from'../../utils/global_auth'; //  update path
import uri from'../../url';
import"./topbar.css";
import socket from '../../utils/socket';

const { Header } = Layout;

interface NavItem {
  label: string;
  path: string;
  role:'admin' |'teacher' |'both';
  permission?: string;
}

const Topbar = () => {
  const navigate = useNavigate();
  const [loginUser, setLoginUser] = useState<any>({});
  const [role, setRole] = useState(getUserRole()); //  role from utility
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${uri}/notifications`, {
        headers: {
          ...getAuthHeaders()
        }
      });
      const resData = await response.json();
      if (resData.success && resData.data) {
        setNotifications(resData.data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await fetch(`${uri}/notifications/${id}/read`, {
        method:'PUT',
        headers: {
          ...getAuthHeaders()
        }
      });
      const resData = await response.json();
      if (resData.success) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        toast.success('Notification marked as read');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch(`${uri}/notifications/read-all`, {
        method:'PUT',
        headers: {
          ...getAuthHeaders()
        }
      });
      const resData = await response.json();
      if (resData.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        toast.success('All notifications marked as read');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const unreadSupportCount = useMemo(() => {
    return notifications.filter(n => {
      if (n.isRead) return false;
      const title = (n.title || "").toLowerCase();
      const msg = (n.message || "").toLowerCase();
      return (
        title.includes("[support]") ||
        title.includes("support reply") ||
        title.includes("reply on ticket") ||
        title.includes("ticket ") ||
        msg.includes("support ticket")
      );
    }).length;
  }, [notifications]);

  const isAdmin = role ==='ADMIN';
  const isTeacher = role ==='TEACHER';
  const teacherId = loginUser?.id;

  const permissions = useMemo(() => loginUser?.permissions || [], [loginUser]);

  const hasPermission = (perm?: string) => {
    if (isAdmin) return true; // Admins see everything
    if (!perm) return true; // Items with no specific permission required
    return permissions.includes(perm);
  };

  const searchItems: NavItem[] = useMemo(() => [
    { label:'Admin Dashboard', path:'/admin-dashboard', role:'admin' },
    { label:'Manage Teachers', path:'/manage-teachers', role:'admin' },
    { label:'Manage Students', path:'/manage-students', role:'both' },
    { label:'Attendance Reports', path:'/admin/teachers/attandances', role:'admin' },
    { label:'Finance / Payments', path:'/admin/manage-all-payments', role:'admin' },
    { label:'Teacher Dashboard', path:'/teacher-dashboard', role:'teacher' },
    { label:'My Attendance', path:'/teacher/attandances', role:'teacher', permission:'My Attendance' },
    { label:'Manage My Courses', path: `/manage-courses/${teacherId}`, role:'teacher', permission:'Manage Courses' },
    { label:'Create Exam', path:'/exams', role:'teacher', permission:'Manage Courses' },
    { label:'Manage Assignments', path: `/manage-assignments/${teacherId}`, role:'teacher', permission:'Manage Courses' },
    { label:'Library Books', path:'/books', role:'both', permission:'Manage Books' },
    { label:'Syllabus Management', path:'/syllabus/manage', role:'both', permission:'Manage Books' },
    { label:'Previous Year Questions (PYQs)', path:'/previous-year-questios/manage', role:'both', permission:'Manage Books' },
    { label:'Job Postings', path:'/jobs', role:'both', permission:'Manage Jobs' },
  ], [teacherId]);

  useEffect(() => {
    const user = getStoredUser(); //  use utility
    const userRole = getUserRole(); //  use utility

    // Declare event handler variables in outer scope for cleanup access
    let handleNewNotification: (newNotif: any) => void;
    let userId: string | undefined;

    if (user && userRole !=='GUEST') {
      setLoginUser(user);
      setRole(userRole);
      fetchNotifications();

      if (!socket.connected) {
        socket.connect();
      }

      handleNewNotification = (newNotif: any) => {
        console.log("Instant notification received via socket in Topbar:", newNotif);
        const notifData = newNotif.data || newNotif;
        setNotifications((prev) => {
          if (prev.some((n) => n._id === notifData._id)) return prev;
          return [notifData, ...prev];
        });
        toast.info(`New Notification: ${notifData.title}`);
      };

      userId = user.id || user._id;
      socket.on('new_notification', handleNewNotification);
      if (userId) {
        socket.on(`new_notification_${userId}`, handleNewNotification);
      }
      if (userRole === 'ADMIN') {
        socket.on('new_notification_admin', handleNewNotification);
      } else if (userRole === 'TEACHER') {
        socket.on('new_notification_teacher', handleNewNotification);
      }
    } else {
      toast.warning('You are not logged in!');
      navigate('/admin-login');
    }

    const interval = setInterval(fetchNotifications, 30000);

    const handleRefreshNotifs = () => {
      fetchNotifications();
    };
    window.addEventListener('refresh_notifications', handleRefreshNotifs);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key ==='k') {
        e.preventDefault();
        document.getElementById('topbar-search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('refresh_notifications', handleRefreshNotifs);
      clearInterval(interval);
      if (handleNewNotification) {
        socket.off('new_notification', handleNewNotification);
        if (userId) {
          socket.off(`new_notification_${userId}`, handleNewNotification);
        }
        socket.off('new_notification_admin', handleNewNotification);
        socket.off('new_notification_teacher', handleNewNotification);
      }
    };
  }, [navigate]);

  const logoutHandler = () => {
    localStorage.removeItem('edudocs');
    toast.success('Logged out successfully');

    if (role ==='ADMIN') navigate('/admin-login');
    else if (role ==='TEACHER') navigate('/');
    else navigate('/'); // fallback
  };

  const filteredOptions = searchItems
    .filter(item => {
      // 1. Role Check
      const roleMatch = item.role ==='both' ||
        (isAdmin && item.role ==='admin') ||
        (isTeacher && item.role ==='teacher');
      
      if (!roleMatch) return false;

      // 2. Permission Check (for Teachers)
      return hasPermission(item.permission);
    })
    .map(item => ({
      value: item.path,
      label: (
        <div style={{ display:'flex', justifyContent:'space-between' }}>
          <span>{item.label}</span>
          <span style={{ fontSize:'10px', opacity: 0.5 }}>{item.path}</span>
        </div>
      )
    }));

  //  Display name from correct field based on role
  const displayName =
    loginUser?.aname || loginUser?.A_name ||   // admin
    loginUser?.tname || loginUser?.T_name ||   // teacher
    loginUser?.name ||                          // student
'User';

  const menu = (
    <Menu className="topbar-dropdown-menu">
      <div className="dropdown-profile-info">
        <div className="user-label-tag">{role}</div>
        <div className="user-full-name">{displayName}</div>
      </div>
      <Menu.Divider />
      <Menu.Item key="1" icon={<UserOutlined />}>
        <Link to={isAdmin ? `/admin/profile` : `/teacher-dashboard/teacher/MyProfile/${loginUser?.id}`}>
          My Account
        </Link>
      </Menu.Item>
      {/* <Menu.Item key="2" icon={<SettingOutlined />}>Settings</Menu.Item> */}
      <Menu.Divider />
      <Menu.Item key="3" icon={<LogoutOutlined />} onClick={logoutHandler} danger>
        Logout
      </Menu.Item>
    </Menu>
  );

  const notificationMenu = (
    <Menu className="topbar-dropdown-menu notification-dropdown-menu" style={{ width: 340, maxHeight: 480, overflowY:'auto', borderRadius: 12, boxShadow:'0 8px 30px rgba(0,0,0,0.12)', border:'1px solid #f0f0f0' }}>
      <div style={{ padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #f0f0f0' }}>
        <span style={{ fontWeight: 700, fontSize:'15px' }}>Notifications ({unreadCount})</span>
        {unreadCount > 0 && (
          <Button type="link" size="small" onClick={handleMarkAllAsRead} style={{ padding: 0, fontSize:'12px' }}>
            Mark all read
          </Button>
        )}
      </div>
      {notifications.length === 0 ? (
        <div style={{ padding:'24px', textAlign:'center', color:'#8c8c8c' }}>
          <BellOutlined style={{ fontSize: 24, marginBottom: 8, opacity: 0.5 }} />
          <div>All caught up! No notifications.</div>
        </div>
      ) : (
        notifications.map(notif => (
          <Menu.Item 
            key={notif._id} 
            onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
            style={{ 
              padding:'12px 16px', 
              borderBottom:'1px solid #f5f5f5', 
              backgroundColor: notif.isRead ?'#ffffff' :'#f4f6ff',
              transition:'background 0.2s',
              whiteSpace:'normal'
            }}
          >
            <div style={{ display:'flex', gap: 10, alignItems:'flex-start' }}>
              <div style={{ width: 8, height: 8, borderRadius:'50%', backgroundColor:'#5b6cff', marginTop: 6, opacity: notif.isRead ? 0 : 1, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: notif.isRead ? 500 : 700, fontSize:'13px', color:'#262626' }}>{notif.title}</div>
                <div style={{ fontSize:'12px', color:'#595959', marginTop: 4, lineHeight: 1.4 }}>{notif.message}</div>
                <div style={{ fontSize:'10px', color:'#bfbfbf', marginTop: 6 }}>
                  {new Date(notif.createdAt).toLocaleDateString('en-IN', { hour:'2-digit', minute:'2-digit' })}
                </div>
              </div>
            </div>
          </Menu.Item>
        ))
      )}
      <Menu.Divider style={{ margin: 0 }} />
      <div style={{ padding: '10px 16px', textAlign: 'center', background: '#fafafa', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
        <Link to="/admin/notifications" style={{ fontWeight: 600, fontSize: '13px', color: 'var(--primary)' }}>
          View All Notifications
        </Link>
      </div>
    </Menu>
  );

  return (
    <Header className="prod-topbar">
      <div className="topbar-left">
        <Select
          showSearch
          id="topbar-search-input"
          placeholder={
            <span className="search-placeholder">
              <SearchOutlined /> Search Menu... <kbd className="search-kbd">Ctrl K</kbd>
            </span>
          }
          className="topbar-search-field"
          suffixIcon={<ThunderboltOutlined style={{ color:'var(--primary)' }} />}
          onSelect={(value) => navigate(value)}
          options={filteredOptions}
          filterOption={(input, option) =>
            (option?.value as string ??'').toLowerCase().includes(input.toLowerCase()) ||
            (option?.label as any).props.children[0].props.children.toLowerCase().includes(input.toLowerCase())
          }
        />
      </div>

      <div className="topbar-right">
        <Space size={20}>
          <Tooltip title="Help Center">
            <Badge 
              dot={unreadSupportCount > 0} 
              offset={[-2, 6]} 
              color="#ef4444" 
              style={{ cursor: 'pointer' }}
              className={`unique-support-badge ${unreadSupportCount > 0 ? 'has-unread' : ''}`}
            >
              <Button 
                type="text" 
                icon={<QuestionCircleOutlined />} 
                className="action-icon-btn" 
                onClick={() => navigate('/support')}
              />
            </Badge>
          </Tooltip>

          <Dropdown overlay={notificationMenu} trigger={['click']} placement="bottomRight">
            <Badge count={unreadCount} size="small" offset={[-2, 6]} color="#1890ff" style={{ cursor:'pointer' }}>
              <Button type="text" icon={<BellOutlined />} className="action-icon-btn" />
            </Badge>
          </Dropdown>

          <div className="topbar-vertical-divider" />

          <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
            <div className="profile-trigger-box">
              <div className="profile-text-meta">
                <span className="welcome-label">Hello,</span>
                <span className="user-display-name">{displayName}</span>
              </div>
              <Avatar
                className="prod-top-avatar"
                shape="square"
                size={40}
                icon={<UserOutlined />}
                style={{ backgroundColor:'var(--primary)' }}
              />
            </div>
          </Dropdown>
        </Space>
      </div>
    </Header>
  );
};

export default Topbar;