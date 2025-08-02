import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Avatar, Dropdown, Menu } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { RootState, AppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';
import CustomerServiceChat from '../CustomerServiceChat';

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/auth/login');
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />} onClick={() => navigate('/profile')}>
        个人中心
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />} onClick={() => navigate('/settings')}>
        设置
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        退出登录
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-blue-600">海南文旅</span>
              </Link>
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                <Link to="/" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  首页
                </Link>
                <Link to="/portal" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  门户网站
                </Link>
                <Link to="/attractions" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  景点探索
                </Link>
                <Link to="/map" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  地图服务
                </Link>
                <Link to="/guide" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  电子导游
                </Link>
                <Link to="/community" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  社区交流
                </Link>
                {isAuthenticated && (
                  <>
                    <Link to="/profile" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                      个人中心
                    </Link>
                    <Link to="/points/history" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                      积分历史
                    </Link>
                  </>
                )}
                {user?.role === 'admin' && (
                  <Link to="/admin/dashboard" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                    管理后台
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center">
              {isAuthenticated ? (
                <Dropdown overlay={userMenu} placement="bottomRight">
                  <div className="flex items-center cursor-pointer">
                    <Avatar size="small" src={user?.avatar} icon={<UserOutlined />} className="mr-2" />
                    <span className="text-sm text-gray-700">{user?.nickname || user?.username}</span>
                  </div>
                </Dropdown>
              ) : (
                <div className="space-x-4">
                  <Button type="link" onClick={() => navigate('/auth/login')}>
                    登录
                  </Button>
                  <Button type="primary" onClick={() => navigate('/auth/register')}>
                    注册
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      
      {/* 全局AI客服聊天 */}
      <CustomerServiceChat />
    </div>
  );
};

export default MainLayout; 