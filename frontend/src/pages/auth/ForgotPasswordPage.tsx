import React from 'react';
import { Card, Form, Input, Button, message } from 'antd';
import { MailOutlined } from '@ant-design/icons';

const ForgotPasswordPage: React.FC = () => {
  const [form] = Form.useForm();

  const handleSubmit = async (_values: any) => {
    try {
      // TODO: 实现忘记密码功能
      message.success('重置密码邮件已发送，请检查您的邮箱');
    } catch (error) {
      message.error('发送失败，请重试');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">忘记密码</h1>
            <p className="text-gray-600">输入您的邮箱地址，我们将发送重置密码链接</p>
          </div>

          <Form form={form} onFinish={handleSubmit} size="large">
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

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 border-0 hover:from-blue-700 hover:to-indigo-700"
              >
                发送重置邮件
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage; 