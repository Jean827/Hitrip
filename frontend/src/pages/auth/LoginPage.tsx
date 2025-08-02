import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Input, Button, Card, message, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { login, clearError } from '../../store/slices/authSlice';
import { RootState, AppDispatch } from '../../store';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { isLoading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [form] = Form.useForm();
  const [loginType, setLoginType] = useState<'username' | 'email'>('username');

  // 如果已经登录，跳转到首页
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // 清除错误信息
  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // 处理登录
  const handleLogin = async (values: any) => {
    const loginData = {
      username: values.username, // 支持用户名或邮箱
      password: values.password,
    };

    const result = await dispatch(login(loginData));
    
    if (login.fulfilled.match(result)) {
      message.success('登录成功！');
      navigate('/');
    }
  };

  // 切换登录方式
  const toggleLoginType = () => {
    setLoginType(loginType === 'username' ? 'email' : 'username');
    form.resetFields();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">欢迎回来</h1>
            <p className="text-gray-600">登录您的海南文旅账户</p>
          </div>

          <Form
            form={form}
            name="login"
            onFinish={handleLogin}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: '请输入用户名或邮箱' },
                {
                  type: loginType === 'email' ? 'email' : undefined,
                  message: '请输入有效的邮箱地址',
                },
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder={loginType === 'username' ? '用户名或邮箱' : '邮箱地址'}
                className="h-12"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6位' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="密码"
                className="h-12"
              />
            </Form.Item>

            <Form.Item>
              <div className="flex justify-between items-center">
                <Checkbox>记住我</Checkbox>
                <Link
                  to="/auth/forgot-password"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  忘记密码？
                </Link>
              </div>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 border-0 hover:from-blue-700 hover:to-indigo-700"
              >
                {isLoading ? '登录中...' : '登录'}
              </Button>
            </Form.Item>

            <div className="text-center">
              <span className="text-gray-600">还没有账户？</span>
              <Link
                to="/auth/register"
                className="text-blue-600 hover:text-blue-800 ml-1 font-medium"
              >
                立即注册
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-center">
                <button
                  type="button"
                  onClick={toggleLoginType}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  使用{loginType === 'username' ? '邮箱' : '用户名'}登录
                </button>
              </div>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage; 