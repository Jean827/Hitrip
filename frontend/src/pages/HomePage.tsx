import React from 'react';
import { Card, Typography, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-lg">
        <div className="text-center">
          <Title level={1} className="text-4xl font-bold text-gray-800 mb-4">
            欢迎来到海南文旅
          </Title>
          <Paragraph className="text-lg text-gray-600 mb-8">
            探索海南的美丽景点，体验独特的旅游文化
          </Paragraph>
          
          <div className="space-x-4">
            <Button 
              type="primary" 
              size="large"
              onClick={() => navigate('/auth/login')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              立即登录
            </Button>
            <Button 
              size="large"
              onClick={() => navigate('/auth/register')}
            >
              注册账户
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default HomePage; 