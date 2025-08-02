import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Breadcrumb } from 'antd';
import { 
  DashboardOutlined, 
  UserOutlined, 
  TeamOutlined, 
  SafetyOutlined,
  HomeOutlined 
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

const AdminLayout: React.FC = () => {
  const location = useLocation();
  
  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/admin/dashboard">仪表盘</Link>,
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: <Link to="/admin/users">用户管理</Link>,
    },
    {
      key: '/admin/roles',
      icon: <TeamOutlined />,
      label: <Link to="/admin/roles">角色管理</Link>,
    },
    {
      key: '/admin/permissions',
      icon: <SafetyOutlined />,
      label: <Link to="/admin/permissions">权限管理</Link>,
    },
  ];

  const getBreadcrumbItems = () => {
    const pathSnippets = location.pathname.split('/').filter(i => i);
    const breadcrumbItems = [
      <Breadcrumb.Item key="home">
        <Link to="/"><HomeOutlined /> 首页</Link>
      </Breadcrumb.Item>,
    ];

    let url = '';
    pathSnippets.forEach((snippet, index) => {
      url += `/${snippet}`;
      if (index === 0) {
        breadcrumbItems.push(
          <Breadcrumb.Item key={url}>
            <Link to={url}>管理后台</Link>
          </Breadcrumb.Item>
        );
      } else {
        const title = snippet === 'dashboard' ? '仪表盘' :
                     snippet === 'users' ? '用户管理' :
                     snippet === 'roles' ? '角色管理' :
                     snippet === 'permissions' ? '权限管理' : snippet;
        breadcrumbItems.push(
          <Breadcrumb.Item key={url}>
            {title}
          </Breadcrumb.Item>
        );
      }
    });

    return breadcrumbItems;
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} theme="light">
        <div className="p-4 text-center">
          <h2 className="text-lg font-bold text-blue-600">管理后台</h2>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{ height: '100%', borderRight: 0 }}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px' }}>
          <Breadcrumb style={{ lineHeight: '64px' }}>
            {getBreadcrumbItems()}
          </Breadcrumb>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout; 