import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Row, Col, Typography, Button, Steps, message, Spin } from 'antd';
import { CheckCircleOutlined, CreditCardOutlined, SafetyOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Step } = Steps;

interface PaymentParams {
  orderId: string;
}

const PaymentPage: React.FC = () => {
  const { orderId } = useParams<{ orderId?: string }>();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderInfo, setOrderInfo] = useState<any>(null);

  useEffect(() => {
    if (orderId) {
      loadOrderInfo();
    }
  }, [orderId]);

  const loadOrderInfo = async () => {
    try {
      setLoading(true);
      // 模拟API调用
      const response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrderInfo(data);
      } else {
        message.error('获取订单信息失败');
      }
    } catch (error) {
      console.error('加载订单信息失败:', error);
      message.error('获取订单信息失败');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (paymentMethod: string) => {
    try {
      setLoading(true);
      
      // 模拟支付处理
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 模拟支付成功
      message.success('支付成功！');
      setCurrentStep(2);
      
      // 更新订单状态
      await fetch(`/api/orders/${orderId}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          paymentMethod,
          status: 'paid'
        })
      });
      
    } catch (error) {
      console.error('支付失败:', error);
      message.error('支付失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: '确认订单',
      icon: <CheckCircleOutlined />,
      content: (
        <div>
          <Title level={4}>订单信息</Title>
          {orderInfo && (
            <div>
              <Text>订单号: {orderInfo.orderNumber}</Text><br />
              <Text>总金额: ¥{orderInfo.totalAmount}</Text><br />
              <Text>商品数量: {orderInfo.itemCount}件</Text>
            </div>
          )}
        </div>
      )
    },
    {
      title: '选择支付方式',
      icon: <CreditCardOutlined />,
      content: (
        <div>
          <Title level={4}>选择支付方式</Title>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Card 
                hoverable 
                onClick={() => handlePayment('alipay')}
                style={{ textAlign: 'center' }}
              >
                <SafetyOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                <div>支付宝</div>
              </Card>
            </Col>
            <Col span={8}>
              <Card 
                hoverable 
                onClick={() => handlePayment('wechat')}
                style={{ textAlign: 'center' }}
              >
                <SafetyOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                <div>微信支付</div>
              </Card>
            </Col>
            <Col span={8}>
              <Card 
                hoverable 
                onClick={() => handlePayment('card')}
                style={{ textAlign: 'center' }}
              >
                <CreditCardOutlined style={{ fontSize: '24px', color: '#faad14' }} />
                <div>银行卡</div>
              </Card>
            </Col>
          </Row>
        </div>
      )
    },
    {
      title: '支付完成',
      icon: <CheckCircleOutlined />,
      content: (
        <div style={{ textAlign: 'center' }}>
          <CheckCircleOutlined style={{ fontSize: '64px', color: '#52c41a' }} />
          <Title level={3}>支付成功！</Title>
          <Text>您的订单已支付成功，我们会尽快为您处理。</Text>
          <br />
          <Button type="primary" onClick={() => window.location.href = '/orders'}>
            查看订单
          </Button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>加载中...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>订单支付</Title>
      
      <Card>
        <Steps current={currentStep}>
          {steps.map((step, index) => (
            <Step key={index} title={step.title} icon={step.icon} />
          ))}
        </Steps>
        
        <div style={{ marginTop: '24px', minHeight: '300px' }}>
          {steps[currentStep].content}
        </div>
      </Card>
    </div>
  );
};

export default PaymentPage; 