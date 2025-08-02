import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Input, Button, Card, message, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { register, clearError } from '../../store/slices/authSlice';
import { RootState, AppDispatch } from '../../store';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { isLoading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [form] = Form.useForm();

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

  // 处理注册
  const handleRegister = async (values: any) => {
    const registerData = {
      username: values.username,
      email: values.email,
      password: values.password,
      phone: values.phone,
      nickname: values.nickname,
    };

    const result = await dispatch(register(registerData));
    
    if (register.fulfilled.match(result)) {
      message.success('注册成功！请检查邮箱验证您的账户。');
      navigate('/auth/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">创建账户</h1>
            <p className="text-gray-600">加入海南文旅，开启您的旅游之旅</p>
          </div>

          <Form
            form={form}
            name="register"
            onFinish={handleRegister}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: '请输入用户名' },
                { min: 3, message: '用户名至少3个字符' },
                { max: 20, message: '用户名最多20个字符' },
                {
                  pattern: /^[a-zA-Z0-9_]+$/,
                  message: '用户名只能包含字母、数字和下划线',
                },
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="用户名"
                className="h-12"
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: '请输入邮箱地址' },
                { type: 'email', message: '请输入有效的邮箱地址' },
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-gray-400" />}
                placeholder="邮箱地址"
                className="h-12"
              />
            </Form.Item>

            <Form.Item
              name="phone"
              rules={[
                {
                  pattern: /^1[3-9]\d{9}$/,
                  message: '请输入有效的手机号',
                },
              ]}
            >
              <Input
                prefix={<PhoneOutlined className="text-gray-400" />}
                placeholder="手机号（可选）"
                className="h-12"
              />
            </Form.Item>

            <Form.Item
              name="nickname"
              rules={[
                { max: 20, message: '昵称最多20个字符' },
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="昵称（可选）"
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

            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: '请确认密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="确认密码"
                className="h-12"
              />
            </Form.Item>

            <Form.Item
              name="agreement"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value ? Promise.resolve() : Promise.reject(new Error('请同意用户协议和隐私政策')),
                },
              ]}
            >
              <Checkbox>
                我已阅读并同意
                <Link to="/terms" className="text-blue-600 hover:text-blue-800 ml-1">
                  用户协议
                </Link>
                和
                <Link to="/privacy" className="text-blue-600 hover:text-blue-800 ml-1">
                  隐私政策
                </Link>
              </Checkbox>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 border-0 hover:from-blue-700 hover:to-indigo-700"
              >
                {isLoading ? '注册中...' : '注册'}
              </Button>
            </Form.Item>

            <div className="text-center">
              <span className="text-gray-600">已有账户？</span>
              <Link
                to="/auth/login"
                className="text-blue-600 hover:text-blue-800 ml-1 font-medium"
              >
                立即登录
              </Link>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage; 