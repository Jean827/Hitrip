import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, DatePicker, Select, Button, Typography, Spin } from 'antd';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { UserOutlined, EyeOutlined, ShoppingCartOutlined, HeartOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalViews: number;
    totalPurchases: number;
    totalFavorites: number;
  };
  userBehavior: any[];
  conversionFunnel: any[];
  topProducts: any[];
  userProfile: any[];
}

const AnalyticsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[Date, Date]>([new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // TODO: 调用数据分析API
      const mockData: AnalyticsData = {
        overview: {
          totalUsers: 1250,
          totalViews: 15680,
          totalPurchases: 890,
          totalFavorites: 2340,
        },
        userBehavior: [
          { date: '2024-01-01', views: 1200, clicks: 800, purchases: 120, favorites: 300 },
          { date: '2024-01-02', views: 1350, clicks: 920, purchases: 150, favorites: 350 },
          { date: '2024-01-03', views: 1100, clicks: 750, purchases: 100, favorites: 280 },
          { date: '2024-01-04', views: 1600, clicks: 1100, purchases: 180, favorites: 400 },
          { date: '2024-01-05', views: 1400, clicks: 950, purchases: 140, favorites: 320 },
          { date: '2024-01-06', views: 1800, clicks: 1200, purchases: 200, favorites: 450 },
          { date: '2024-01-07', views: 2000, clicks: 1400, purchases: 250, favorites: 500 },
        ],
        conversionFunnel: [
          { stage: '访问', count: 2000, rate: 100 },
          { stage: '浏览', count: 1400, rate: 70 },
          { stage: '加购', count: 800, rate: 40 },
          { stage: '购买', count: 250, rate: 12.5 },
        ],
        topProducts: [
          { name: '海南特产椰子糖', views: 1200, purchases: 180, revenue: 4500 },
          { name: '三亚珍珠项链', views: 980, purchases: 120, revenue: 15000 },
          { name: '海南咖啡豆', views: 850, purchases: 95, revenue: 6460 },
          { name: '黎族手工织锦', views: 720, purchases: 68, revenue: 10744 },
          { name: '热带水果礼盒', views: 650, purchases: 75, revenue: 3750 },
        ],
        userProfile: [
          { category: '年龄18-25岁', percentage: 35 },
          { category: '年龄26-35岁', percentage: 45 },
          { category: '年龄36-45岁', percentage: 15 },
          { category: '年龄46岁以上', percentage: 5 },
        ],
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('获取数据分析失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const behaviorColumns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: '浏览量',
      dataIndex: 'views',
      key: 'views',
      render: (value: number) => <Text strong>{value.toLocaleString()}</Text>,
    },
    {
      title: '点击量',
      dataIndex: 'clicks',
      key: 'clicks',
      render: (value: number) => <Text strong>{value.toLocaleString()}</Text>,
    },
    {
      title: '购买量',
      dataIndex: 'purchases',
      key: 'purchases',
      render: (value: number) => <Text strong>{value.toLocaleString()}</Text>,
    },
    {
      title: '收藏量',
      dataIndex: 'favorites',
      key: 'favorites',
      render: (value: number) => <Text strong>{value.toLocaleString()}</Text>,
    },
  ];

  const productColumns = [
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '浏览量',
      dataIndex: 'views',
      key: 'views',
      render: (value: number) => <Text strong>{value.toLocaleString()}</Text>,
    },
    {
      title: '购买量',
      dataIndex: 'purchases',
      key: 'purchases',
      render: (value: number) => <Text strong>{value.toLocaleString()}</Text>,
    },
    {
      title: '收入(元)',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (value: number) => <Text type="danger" strong>¥{value.toLocaleString()}</Text>,
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>正在加载数据分析...</Text>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>数据分析</Title>
        <Text type="secondary">
          实时监控用户行为和业务数据
        </Text>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col>
            <Text>时间范围：</Text>
          </Col>
          <Col>
            <RangePicker
              value={[dateRange[0], dateRange[1]]}
              onChange={(dates) => {
                if (dates) {
                  setDateRange([dates[0]!.toDate(), dates[1]!.toDate()]);
                }
              }}
            />
          </Col>
          <Col>
            <Button type="primary" onClick={fetchAnalyticsData}>
              刷新数据
            </Button>
          </Col>
        </Row>
      </div>

      {analyticsData && (
        <>
          {/* 概览统计 */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="总用户数"
                  value={analyticsData.overview.totalUsers}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="总浏览量"
                  value={analyticsData.overview.totalViews}
                  prefix={<EyeOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="总购买量"
                  value={analyticsData.overview.totalPurchases}
                  prefix={<ShoppingCartOutlined />}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="总收藏量"
                  value={analyticsData.overview.totalFavorites}
                  prefix={<HeartOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>

          {/* 用户行为趋势 */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={24}>
              <Card title="用户行为趋势" size="small">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.userBehavior}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="views" stroke="#8884d8" name="浏览量" />
                    <Line type="monotone" dataKey="clicks" stroke="#82ca9d" name="点击量" />
                    <Line type="monotone" dataKey="purchases" stroke="#ffc658" name="购买量" />
                    <Line type="monotone" dataKey="favorites" stroke="#ff7300" name="收藏量" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          {/* 转化漏斗和用户画像 */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={12}>
              <Card title="转化漏斗" size="small">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.conversionFunnel}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="用户年龄分布" size="small">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.userProfile}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="percentage"
                    >
                      {analyticsData.userProfile.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          {/* 热门商品 */}
          <Row gutter={16}>
            <Col span={24}>
              <Card title="热门商品排行" size="small">
                <Table
                  columns={productColumns}
                  dataSource={analyticsData.topProducts}
                  pagination={false}
                  rowKey="name"
                />
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage; 