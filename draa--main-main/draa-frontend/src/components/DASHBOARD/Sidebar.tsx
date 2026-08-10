import React, { useState } from'react';
import { Layout, Menu, Space, Avatar, Divider } from'antd';
import { Link, useLocation } from'react-router-dom';
import {
  UserOutlined,
  CreditCardOutlined,
  BookOutlined,
  TeamOutlined,
  BellOutlined,
  FormOutlined,
  VideoCameraOutlined,
  HomeOutlined,
  HomeFilled,
  LayoutOutlined,
  MessageOutlined,
  FileSearchOutlined,
  FlagOutlined,
} from'@ant-design/icons';
import logo from'../../../public/EduDocsNewLogo.png';
import { ComputerIcon } from'lucide-react';
import"./sidebar.css";
import axios from'axios';
import url from'../../url';
import { getAuthHeaders } from'../../utils/global_auth';

const { Sider } = Layout;
const { SubMenu } = Menu;

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const admin = JSON.parse(localStorage.getItem('edudocs') ||'{}');

  React.useEffect(() => {
    const timer = setTimeout(() => {
      const activeElement = document.querySelector('.custom-sidebar .ant-menu-item-selected');
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'auto', block: 'nearest' });
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  //  Real-time session check
  React.useEffect(() => {
    if (!admin.token) return;

    const checkSession = async () => {
      try {
        // Use a lightweight endpoint to verify session
        await axios.get(`${url}/admin/verify-session`, {
          headers: getAuthHeaders()
        });
      } catch (err) {
        // The global axios interceptor (setupAxios.ts) will handle 401
      }
    };

    checkSession();
    const interval = setInterval(checkSession, 15000);
    return () => clearInterval(interval);
  }, [admin.token]);

  const menuItems = [
    { key:'/admin-dashboard', icon: <HomeOutlined />, label:'Admin Dashboard' },
    {
      key:'user-mgt',
      icon: <TeamOutlined />,
      label:'User Management',
      children: [
        { key:'/manage-teachers', label:'Manage Teachers' },
        { key:'/manage-students', label:'Manage Students' },
        // { key:'/admin/teachers/attandances', label:'Attendance Reports' },
      ],
    },
    {
      key:'course-mgt',
      icon: <BookOutlined />,
      label:'Courses & Classes',
      children: [
        { key:'/admin/manage-courses', label:'Manage Courses' },
        { key:'/admin/course-categories', label:'Categories' },
        // { key:'/add-courses', label:'Add New Course' },
        { key:'/manage-courses-content', label:'Content Review' },
      ],
    },
    {
      key: 'exam-mgt',
      icon: <FormOutlined />,
      label: 'Exams & Tests',
      children: [
        { key: '/admin/manage-exams', label: 'All Courses Exams' },
        // { key: '/admin/manage-assignments', label: 'Assignments' },
        { key: '/admin/test-series/categories', label: 'Examination Categories(Test Series)' },
        { key: '/admin/test-series/subjects', label: 'Subject Management' },
        { key: '/admin/test-series/topics', label: 'Topics Management' },
        { key: '/admin/manage-test-series', label: 'Test Series' },
        { key: '/admin/exam-sections', label: 'Exam Sections' },
        { key: '/admin/question-issues', label: '🚩 Question Issue Reports' },
      ],
    },
    {
      key:'live-sessions',
      icon: <VideoCameraOutlined />,
      label:'Live Sessions',
      children: [
        { key:'/admin/live-sessions', label:'Schedules' },
      ],
    },
    {
      key:'/jobs-section',
      icon: <BellOutlined />,
      label:'Job Board',
      children: [
        { key:'/jobs', label:'Post a Job' },
        { key:'/job-categories', label:'Job Categories' },
      ],
    },
    {
      key:'payments',
      icon: <CreditCardOutlined />,
      label:'Finance',
      children: [
        { key:'/admin/manage-all-payments', label:'All Payments' },
        { key:'/admin/manage-coupons', label:'Manage Coupons' },
      ],
    },
    {
      key:'resources',
      icon: <LayoutOutlined />,
      label:'Library / PDFs',
      children: [
        { key:'/books', label:'Books' },
        { key:'/book-categories', label:'Book Categories' },
        { key:'/previous-year-questions/manage', label:'PYQs' },
        { key:'/syllabus/manage', label:'Syllabus' },
        { key:'/current-affairs/management', label:'Current Affairs' },
      ],
    },
    {
      key:'cms',
      icon: <HomeFilled />,
      label:'Site Settings (CMS)',
      children: [
        { key:'/admin/privacy-policies', label:'Privacy Policy' },
        { key:'/admin/tnc', label:'T&C' },
        { key:'/admin/faqs', label:'FAQs' },
        { key:'/admin/banner', label:'Banners' },
        { key:'/admin/footer', label:'Footer Links' },
        { key:'/admin/videography', label:'Videography' },
        { key:'/admin/chatbot-faqs', label:'Chatbot FAQs' },
      ],
    },
    {
      key:'/support',
      icon: <MessageOutlined />,
      label:'Support Tickets',
    },
    {
      key:'/admin/notifications',
      icon: <BellOutlined />,
      label:'Notifications',
    },
    {
      key:'/admin/logs',
      icon: <FileSearchOutlined />,
      label:'Application Logs',
    },
  ];

  const [openKeys, setOpenKeys] = useState<string[]>([]);

  React.useEffect(() => {
    const keys: string[] = [];
    menuItems.forEach(item => {
      if (item.children) {
        if (item.children.some(child => location.pathname === child.key || location.pathname.startsWith(child.key + '/'))) {
          keys.push(item.key);
        }
      }
    });
    setOpenKeys(prev => [...new Set([...prev, ...keys])]);
  }, [location.pathname]);

  const onOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      width={260}
      className="custom-sidebar"
    >
      <div className="sidebar-logo-container">
        <Link to="/">
          <img src={logo} alt="logo" className="sidebar-logo" />
        </Link>
      </div>

      {!collapsed && (
        <div className="sidebar-user-card">
          <Avatar size={48} icon={<UserOutlined />} className="user-avatar" />
          <div className="user-info">
            <span className="user-name">{admin.aname ||"Admin"}</span>
            <span className="user-role">Super Admin</span>
          </div>
        </div>
      )}

      <Divider className="sidebar-divider" />

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        openKeys={openKeys}
        onOpenChange={onOpenChange}
        className="sidebar-menu"
      >
        {menuItems.map((item) => {
          if (item.children) {
            return (
              <SubMenu key={item.key} icon={item.icon} title={item.label}>
                {item.children.map((child) => (
                  <Menu.Item key={child.key}>
                    <Link to={child.key}>{child.label}</Link>
                  </Menu.Item>
                ))}
              </SubMenu>
            );
          }
          return (
            <Menu.Item key={item.key} icon={item.icon}>
              <Link to={item.key}>{item.label}</Link>
            </Menu.Item>
          );
        })}
      </Menu>
    </Sider>
  );
};

export default Sidebar;