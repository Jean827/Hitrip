import React from 'react';
import { Card, Row, Col, Statistic, Button, Typography } from 'antd';
import { UserOutlined, TeamOutlined, SafetyOutlined, StarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Title level={2}>管理员仪表盘</Title>
      
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={1128}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="活跃用户"
              value={93}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="角色数量"
              value={5}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="权限数量"
              value={24}
              prefix={<SafetyOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Card title="快速操作" className="mb-4">
            <div className="space-y-4">
              <Button 
                type="primary" 
                size="large" 
                block 
                onClick={() => navigate('/admin/users')}
              >
                用户管理
              </Button>
              <Button 
                size="large" 
                block 
                onClick={() => navigate('/admin/roles')}
              >
                角色管理
              </Button>
              <Button 
                size="large" 
                block 
                onClick={() => navigate('/admin/permissions')}
              >
                权限管理
              </Button>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="系统信息" className="mb-4">
            <div className="space-y-2 text-sm">
              <div>系统版本: v1.0.0</div>
              <div>Node.js版本: v18.0.0</div>
              <div>数据库: MongoDB</div>
              <div>缓存: Redis</div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboardPage; 