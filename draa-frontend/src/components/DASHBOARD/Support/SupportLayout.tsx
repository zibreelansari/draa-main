import React from'react';
import { Layout } from'antd';
import Sidebar from'../Sidebar';
import Sidebar2 from'../Sidebar2';
import Topbar from'../Topbar';
import DashboardLayout from'../../../student-dashboards/layouts/DashboardLayout';
import { getUserRole } from'../../../utils/global_auth';

const { Content } = Layout;

interface SupportLayoutProps {
    children: React.ReactNode;
}

const SupportLayout: React.FC<SupportLayoutProps> = ({ children }) => {
    const role = getUserRole();

    if (role ==='ADMIN') {
        return (
            <Layout style={{ minHeight:'100vh' }}>
                <Sidebar />
                <Layout>
                    <Topbar />
                    <Content style={{ margin:'24px', minHeight: 280, paddingBottom:'24px' }}>
                        {children}
                    </Content>
                </Layout>
            </Layout>
        );
    }

    if (role ==='TEACHER') {
        return (
            <Layout style={{ minHeight:'100vh' }}>
                <Sidebar2 />
                <Layout>
                    <Topbar />
                    <Content style={{ margin:'24px', minHeight: 280, paddingBottom:'24px' }}>
                        {children}
                    </Content>
                </Layout>
            </Layout>
        );
    }

    if (role ==='STUDENT') {
        return (
            <DashboardLayout>
                {children}
            </DashboardLayout>
        );
    }

    return <>{children}</>;
};

export default SupportLayout;
