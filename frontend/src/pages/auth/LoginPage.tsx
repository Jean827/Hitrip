import React from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../store/slices/authSlice';
import { RootState, AppDispatch } from '../../store';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, isAuthenticated } = useSelector((state: RootState) => state.auth);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onFinish = async (values: any) => {
    try {
      const loginData = {
        email: values.email,
        password: values.password,
      };
      
      const result = await dispatch(login(loginData));
      
      if (login.fulfilled.match(result)) {
        message.success('登录成功！');
        navigate('/');
      } else {
        message.error('登录失败，请检查邮箱和密码');
      }
    } catch (error) {
      message.error('登录失败，请重试');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card style={{ width: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: 8 }}>
            欢迎回来
          </Title>
          <Text type="secondary">请登录您的账户</Text>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="请输入邮箱"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6位' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="请输入密码"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              style={{ width: '100%', height: 40 }}
            >
              登录
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">
              还没有账户？{' '}
              <Link to="/auth/register" style={{ color: '#1890ff' }}>
                立即注册
              </Link>
            </Text>
          </div>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Link to="/auth/forgot-password" style={{ color: '#1890ff' }}>
              忘记密码？
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage; 