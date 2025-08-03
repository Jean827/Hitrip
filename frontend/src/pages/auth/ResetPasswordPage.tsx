import React from 'react';
import { Card, Form, Input, Button, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';

const ResetPasswordPage: React.FC = () => {
  const [form] = Form.useForm();

  const handleSubmit = async (_values: any) => {
    try {
      // TODO: 实现重置密码功能
      message.success('密码重置成功');
    } catch (error) {
      message.error('重置失败，请重试');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">重置密码</h1>
            <p className="text-gray-600">请输入您的新密码</p>
          </div>

          <Form form={form} onFinish={handleSubmit} size="large">
            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 6, message: '密码至少6位' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="新密码"
                className="h-12"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: '请确认新密码' },
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
                placeholder="确认新密码"
                className="h-12"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 border-0 hover:from-blue-700 hover:to-indigo-700"
              >
                重置密码
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordPage; 