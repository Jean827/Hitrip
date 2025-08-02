import React from 'react';
import { Card, Typography, Button, Result } from 'antd';
import { CheckCircleOutlined, MailOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const handleVerify = async () => {
    try {
      // TODO: 实现邮箱验证功能
      console.log('Verifying email with token:', token);
    } catch (error) {
      console.error('Email verification failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <Result
            icon={<MailOutlined className="text-blue-600" />}
            title="邮箱验证"
            subTitle="请验证您的邮箱地址以完成注册"
            extra={[
              <Button
                type="primary"
                key="verify"
                onClick={handleVerify}
                className="bg-blue-600 hover:bg-blue-700"
              >
                验证邮箱
              </Button>,
            ]}
          />
        </Card>
      </div>
    </div>
  );
};

export default VerifyEmailPage; 