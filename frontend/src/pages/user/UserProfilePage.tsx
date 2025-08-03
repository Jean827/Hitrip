import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Avatar, Button, Descriptions, Spin, Typography, Divider, Row, Col, Statistic } from 'antd';
import { EditOutlined, UserOutlined, StarOutlined, PhoneOutlined, MailOutlined, CalendarOutlined } from '@ant-design/icons';
import { fetchUserProfile } from '../../store/slices/userSlice';
import { RootState, AppDispatch } from '../../store';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const UserProfilePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { profile, loading } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  if (isLoading || !profile) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Title level={2} className="mb-6">个人中心</Title>
      
      <Row gutter={16}>
        <Col xs={24} lg={8}>
          <Card className="text-center">
            <Avatar size={120} src={profile.avatar} icon={<UserOutlined />} className="mb-4" />
            <Title level={3}>{profile.name || profile.email}</Title>
            <Text type="secondary">{profile.email}</Text>
            <div className="mt-4">
              <Button type="primary" icon={<EditOutlined />} onClick={() => navigate('/settings')}>
                编辑资料
              </Button>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={16}>
          <Card title="基本信息">
            <Row gutter={16} className="mb-6">
              <Col xs={12} sm={6}>
                <Statistic
                  title="积分"
                  value={0}
                  prefix={<StarOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="等级"
                  value={1}
                  prefix={<StarOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="VIP等级"
                  value={0}
                  prefix={<StarOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="注册天数"
                  value={Math.floor((Date.now() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                  suffix="天"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
            </Row>
            
            <Descriptions column={2} bordered>
              <Descriptions.Item label="用户名">{profile.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="昵称">{profile.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="真实姓名">{profile.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="性别">
                {'-'}
              </Descriptions.Item>
              <Descriptions.Item label="生日">
                {'-'}
              </Descriptions.Item>
              <Descriptions.Item label="地址">{'-'}</Descriptions.Item>
              <Descriptions.Item label="邮箱验证">
                {'已验证'}
              </Descriptions.Item>
              <Descriptions.Item label="手机号验证">
                {'已验证'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
          
          <Card title="快捷操作" className="mt-4">
            <Row gutter={16}>
              <Col xs={12} sm={8}>
                <Button 
                  type="primary" 
                  block 
                  onClick={() => navigate('/points/history')}
                >
                  积分历史
                </Button>
              </Col>
              <Col xs={12} sm={8}>
                <Button 
                  block 
                  onClick={() => navigate('/settings')}
                >
                  个人设置
                </Button>
              </Col>
              <Col xs={12} sm={8}>
                <Button 
                  block 
                  onClick={() => navigate('/')}
                >
                  返回首页
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UserProfilePage; 