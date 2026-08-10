import { useState, useEffect } from'react';
import { Layout, Menu, Space, Avatar, Divider } from'antd';
import { Link, useLocation } from'react-router-dom';
import axios from'axios';
import {
  HomeOutlined,
  TeamOutlined,
  ReadOutlined,
  CheckCircleOutlined,
  WifiOutlined,
  BellOutlined,
  UserOutlined,
  BookOutlined,
  CheckSquareOutlined,
  FileTextOutlined,
  MessageOutlined,
  VideoCameraOutlined,
} from'@ant-design/icons';
import Logo from'../../../public/EduDocsNewLogo.png';
import"./sidebar.css"; // Ensure this matches the Admin Sidebar CSS
import { WrapText } from'lucide-react';
import { getAuthHeaders, getStoredUser } from'../../utils/global_auth';
import url from'../../url';

const { Sider } = Layout;
const { SubMenu } = Menu;

const Sidebar2 = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      const activeElement = document.querySelector('.custom-sidebar .ant-menu-item-selected');
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'auto', block: 'nearest' });
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Use getStoredUser() so _id is normalized to id automatically
  const teacher = getStoredUser() || {};
  const teacherId = (teacher.id || teacher._id || '') as string;
  const permissions = teacher.permissions || ['Dashboard Overview', 'My Profile'];

  const hasPermission = (permission: string) => {
    // If it's a basic permission that everyone has
    if (['Dashboard Overview','My Profile'].includes(permission)) return true;
    return permissions.includes(permission);
  };

  //  Real-time session check
  useEffect(() => {
    if (!teacher.token) return;

    const checkSession = async () => {
      try {
        await axios.get(`${url}/teachers/verify-session`, {
          headers: getAuthHeaders()
        });
      } catch (err) {
        // The global axios interceptor (setupAxios.ts) will catch 401
        // and handle the logout/redirect automatically.
      }
    };

    // Initial check
    checkSession();

    // Poll every 15 seconds for real-time security updates
    const interval = setInterval(checkSession, 15000);
    return () => clearInterval(interval);
  }, [teacher.token]);

  const [openKeys, setOpenKeys] = useState<string[]>([]);

  useEffect(() => {
    const routeMap = {
      'students': ['/teacher/attandances'],
      'courses': [`/manage-courses/`, `/course-categories/`, '/add-courses', `/manage-exams/`],
      'courses content': ['/manage-courses-content', '/publish-course-content'],
      'live': ['/live-sessions'],
      'notifications': ['/jobs', '/job-categories'],
      'resources': ['/books', '/book-categories', '/previous-year-questions/manage', '/syllabus/manage', '/current-affairs/management'],
      'sub7': [`/test-series/`, '/admin/question-issues']
    };

    const keys: string[] = [];
    Object.entries(routeMap).forEach(([parentKey, paths]) => {
      if (paths.some(p => location.pathname === p || location.pathname.startsWith(p))) {
        keys.push(parentKey);
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
      className="custom-sidebar" // Uses shared production-grade styles
    >
      {/* Logo Section */}
      <div className="sidebar-logo-container">
        <Link to="/">
          <img 
            src={Logo} 
            alt="logo" 
            className="sidebar-logo" 
            style={{ height: collapsed ?'30px' :'45px' }} 
          />
        </Link>
      </div>

      {/* Profile Card - Only visible when expanded */}
      {!collapsed && (
        <div className="sidebar-user-card">
          <Avatar 
            size={48} 
            icon={<UserOutlined />} 
            className="user-avatar"
            style={{ backgroundColor:'var(--primary)' }}
          />
          <div className="user-info">
            <span className="user-name">{teacher.tname }</span>
            <span className="user-role">Teacher / Instructor</span>
          </div>
        </div>
      )}

      <Divider className="sidebar-divider" />

      {/* Menu - Every Item Preserved Exactly */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        className="sidebar-menu"
        openKeys={openKeys}
        onOpenChange={onOpenChange}
      >
        <Menu.Item key="/teacher-dashboard" icon={<HomeOutlined />}>
          <Link to="/teacher-dashboard">Teacher Dashboard</Link>
        </Menu.Item>

        <Menu.Item key={`/teacher-dashboard/teacher/MyProfile/${teacherId}`} icon={<UserOutlined />}>
          <Link to={`/teacher-dashboard/teacher/MyProfile/${teacherId}`}>My Profile</Link>
        </Menu.Item>

        {hasPermission("My Attendance") && (
          <SubMenu key="students" icon={<TeamOutlined />} title="My Attendance">
            <Menu.Item key="/teacher/attandances">
              <Link to="/teacher/attandances">My Attendance</Link>
            </Menu.Item>
          </SubMenu>
        )}

        {hasPermission("Manage Courses") && (
          <>
            <SubMenu key="courses" icon={<BookOutlined />} title="Course & Course Exam Mgt">
              <Menu.Item key={`/manage-courses/${teacherId}`}>
                <Link to={`/manage-courses/${teacherId}`}>Manage My Courses</Link>
              </Menu.Item>
              <Menu.Item key={`/course-categories/${teacherId}`}>
                <Link to={`/course-categories/${teacherId}`}>Manage Categories</Link>
              </Menu.Item>
              {/* <Menu.Item key="/add-courses">
                <Link to="/add-courses">Add New Course</Link>
              </Menu.Item> */}
              <Menu.Item key={`/manage-exams/${teacherId}`}>
                <Link to={`/manage-exams/${teacherId}`}>Manage All Exams</Link>
              </Menu.Item>
            </SubMenu>

            <SubMenu key="courses content" icon={<WrapText />} title="Course Content/Blogs">
              <Menu.Item key="/manage-courses-content">
                <Link to="/manage-courses-content">Review & Manage Content</Link>
              </Menu.Item>
              <Menu.Item key="/publish-course-content">
                <Link to="/publish-course-content">Publish Contents</Link>
              </Menu.Item>
            </SubMenu>
          </>
        )}

        {hasPermission("Manage Live Sessions") && (
          <SubMenu key="live" icon={<WifiOutlined />} title="Manage Live Sessions">
            <Menu.Item key="/live-sessions">
              <Link to="/live-sessions">Create New Sessions</Link>
            </Menu.Item>
          </SubMenu>
        )}

        {hasPermission("Manage Jobs") && (
          <SubMenu key="notifications" icon={<BellOutlined />} title="Jobs Notifications">
            <Menu.Item key="/jobs">
              <Link to="/jobs">Post a Job</Link>
            </Menu.Item>
            <Menu.Item key="/job-categories">
              <Link to="/job-categories">Create Job Categories</Link>
            </Menu.Item>
          </SubMenu>
        )}

        {hasPermission("Manage Books") && (
          <SubMenu key="resources" icon={<ReadOutlined />} title="Books / PDFs">
            <Menu.Item key="/books">
              <Link to="/books">Books</Link>
            </Menu.Item>
            <Menu.Item key="/book-categories">
              <Link to="/book-categories">Book Categories</Link>
            </Menu.Item>
            <Menu.Item key="/previous-year-questions/manage">
              <Link to="/previous-year-questions/manage">PYQs</Link>
            </Menu.Item>
            <Menu.Item key="/syllabus/manage">
              <Link to="/syllabus/manage">Syllabus</Link>
            </Menu.Item>
            <Menu.Item key="/current-affairs/management">
              <Link to="/current-affairs/management">Current Affairs</Link>
            </Menu.Item>
          </SubMenu>
        )}

        {hasPermission('Manage Test Series') && (
          <SubMenu key="sub7" icon={<CheckCircleOutlined />} title="Test Series (Extra)">
            <Menu.Item key="27">
              <Link to={`/test-series/${(teacher._id || teacher.id)}`}>Create Test Series</Link>
            </Menu.Item>
            <Menu.Item key="/admin/question-issues">
              <Link to="/admin/question-issues">🚩 Question Issue Reports</Link>
            </Menu.Item>
          </SubMenu>
        )}

        {hasPermission("Manage Exam Sections") && (
          <Menu.Item key="/exam-sections" icon={<FileTextOutlined />}>
            <Link to="/exam-sections">Exam Sections</Link>
          </Menu.Item>
        )}

        {hasPermission("Manage Videography") && (
          <Menu.Item key="/teacher/videography" icon={<VideoCameraOutlined />}>
            <Link to="/teacher/videography">Manage Videography</Link>
          </Menu.Item>
        )}

        <Menu.Item key="/support" icon={<MessageOutlined />}>
          <Link to="/support">Help & Support</Link>
        </Menu.Item>

      </Menu>
    </Sider>
  );
};

export default Sidebar2;