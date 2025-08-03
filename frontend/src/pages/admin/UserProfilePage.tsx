import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Tabs, Progress, Row, Col, Statistic, Typography, Space } from 'antd';
import { 
  UserOutlined, 
  RiseOutlined, 
  HeartOutlined, 
  BarChartOutlined,
  ReloadOutlined,
  EditOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface UserProfile {
  id: string;
  userId: string;
  interests: InterestTag[];
  behaviorPatterns: BehaviorPattern[];
  userValue: number;
  userSegment: string;
  lastUpdated: string;
}

interface InterestTag {
  id: string;
  name: string;
  score: number;
  frequency: number;
}

interface BehaviorPattern {
  patternType: string;
  frequency: number;
  timeSlot: string;
  context: any;
}

interface UserSegment {
  segment: string;
  segmentName: string;
  description: string;
  valueMetrics: {
    totalPurchases: number;
    totalSpent: number;
    avgOrderValue: number;
    purchaseFrequency: number;
    lastPurchaseDate: string | null;
    engagementScore: number;
  };
}

const UserProfilePage: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userSegment, setUserSegment] = useState<UserSegment | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      // 模拟数据
      const mockUserProfile: UserProfile = {
        id: '1',
        userId: 'user123',
        interests: [
          { id: '1', name: '旅游', score: 0.9, frequency: 15 },
          { id: '2', name: '美食', score: 0.8, frequency: 12 },
          { id: '3', name: '购物', score: 0.7, frequency: 8 },
          { id: '4', name: '文化', score: 0.6, frequency: 6 }
        ],
        behaviorPatterns: [
          { patternType: '浏览行为', frequency: 25, timeSlot: '上午', context: {} },
          { patternType: '购买行为', frequency: 8, timeSlot: '下午', context: {} },
          { patternType: '搜索行为', frequency: 15, timeSlot: '晚上', context: {} }
        ],
        userValue: 85,
        userSegment: 'high_value',
        lastUpdated: new Date().toISOString()
      };

      const mockUserSegment: UserSegment = {
        segment: 'high_value',
        segmentName: '高价值用户',
        description: '消费能力强，活跃度高的用户群体',
        valueMetrics: {
          totalPurchases: 25,
          totalSpent: 15000,
          avgOrderValue: 600,
          purchaseFrequency: 2.5,
          lastPurchaseDate: '2024-01-15',
          engagementScore: 85
        }
      };

      setUserProfile(mockUserProfile);
      setUserSegment(mockUserSegment);
    } catch (error) {
      console.error('加载用户档案失败:', error);
    }
  };

  const refreshUserProfile = async () => {
    await loadUserProfile();
  };

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'high_value': return 'success';
      case 'medium_value': return 'warning';
      case 'low_value': return 'default';
      default: return 'default';
    }
  };

  const getBehaviorPatternIcon = (patternType: string) => {
    switch (patternType) {
      case '浏览行为': return <UserOutlined />;
      case '购买行为': return <RiseOutlined />;
      case '搜索行为': return <BarChartOutlined />;
      default: return <UserOutlined />;
    }
  };

  const tabItems = [
    {
      key: 'overview',
      label: '概览',
      children: (
        <div>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="用户分群"
                  value={userSegment?.segmentName || '未知'}
                  prefix={<UserOutlined />}
                />
                <Text type="secondary" className="text-xs">
                  {userSegment?.description || '暂无描述'}
                </Text>
                {userSegment && (
                  <Badge 
                    status={getSegmentColor(userSegment.segment) as any} 
                    text={userSegment.segmentName}
                    className="mt-2"
                  />
                )}
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="用户价值"
                  value={userProfile?.userValue || 0}
                  prefix={<RiseOutlined />}
                  suffix="分"
                />
                <Text type="secondary" className="text-xs">
                  参与度分数
                </Text>
                <Progress 
                  percent={userProfile?.userValue || 0} 
                  size="small"
                  className="mt-2"
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="兴趣标签"
                  value={userProfile?.interests?.length || 0}
                  prefix={<HeartOutlined />}
                  suffix="个"
                />
                <Text type="secondary" className="text-xs">
                  个兴趣分类
                </Text>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="行为模式"
                  value={userProfile?.behaviorPatterns?.length || 0}
                  prefix={<BarChartOutlined />}
                  suffix="种"
                />
                <Text type="secondary" className="text-xs">
                  种行为模式
                </Text>
              </Card>
            </Col>
          </Row>

          {userSegment && (
            <Card title="用户价值详情" className="mt-6">
              <Row gutter={[16, 16]}>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="总购买次数"
                    value={userSegment.valueMetrics.totalPurchases}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="总消费金额"
                    value={userSegment.valueMetrics.totalSpent}
                    valueStyle={{ color: '#52c41a' }}
                    suffix="元"
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="平均订单价值"
                    value={userSegment.valueMetrics.avgOrderValue}
                    valueStyle={{ color: '#faad14' }}
                    suffix="元"
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="购买频率"
                    value={userSegment.valueMetrics.purchaseFrequency}
                    valueStyle={{ color: '#f5222d' }}
                    suffix="次/月"
                  />
                </Col>
              </Row>
            </Card>
          )}
        </div>
      )
    },
    {
      key: 'interests',
      label: '兴趣标签',
      children: (
        <Card title="兴趣标签分析">
          <Row gutter={[16, 16]}>
            {userProfile?.interests?.map((interest, index) => (
              <Col xs={24} sm={12} lg={6} key={interest.id}>
                <Card size="small">
                  <div className="flex justify-between items-center">
                    <div>
                      <Text strong>{interest.name}</Text>
                      <div className="text-xs text-gray-500">
                        频率: {interest.frequency}次
                      </div>
                    </div>
                    <Badge count={index + 1} style={{ backgroundColor: '#1890ff' }} />
                  </div>
                  <Progress 
                    percent={interest.score * 100} 
                    size="small"
                    className="mt-2"
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )
    },
    {
      key: 'patterns',
      label: '行为模式',
      children: (
        <Card title="行为模式分析">
          <Row gutter={[16, 16]}>
            {userProfile?.behaviorPatterns?.map((pattern, index) => (
              <Col xs={24} sm={12} lg={8} key={index}>
                <Card size="small">
                  <div className="flex items-center mb-2">
                    {getBehaviorPatternIcon(pattern.patternType)}
                    <Text strong className="ml-2">{pattern.patternType}</Text>
                  </div>
                  <div className="text-sm text-gray-600">
                    频率: {pattern.frequency}次
                  </div>
                  <div className="text-sm text-gray-600">
                    时间段: {pattern.timeSlot}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )
    },
    {
      key: 'value',
      label: '用户价值',
      children: (
        <Card title="用户价值评估">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Card title="参与度评分" size="small">
                <Progress 
                  type="circle"
                  percent={userSegment?.valueMetrics.engagementScore || 0}
                  format={percent => `${percent}分`}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card title="价值指标" size="small">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Text>用户等级:</Text>
                    <Badge status="success" text="高价值" />
                  </div>
                  <div className="flex justify-between">
                    <Text>活跃度:</Text>
                    <Text strong>{userProfile?.userValue || 0}%</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text>忠诚度:</Text>
                    <Text strong>高</Text>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </Card>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>用户档案分析</Title>
        <Space>
          <Button icon={<EditOutlined />}>编辑档案</Button>
          <Button icon={<ReloadOutlined />} onClick={refreshUserProfile}>
            刷新数据
          </Button>
        </Space>
      </div>

      <Tabs defaultActiveKey="overview" items={tabItems} />
    </div>
  );
};

export default UserProfilePage; 