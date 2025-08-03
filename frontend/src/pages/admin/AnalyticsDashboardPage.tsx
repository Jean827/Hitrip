import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Button, DatePicker, Space, Spin, message } from 'antd';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { analyticsApi, AnalyticsFilters } from '../../services/analyticsApi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const AnalyticsDashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[string, string]>([
    dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    dayjs().format('YYYY-MM-DD')
  ]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const [startDate, endDate] = dateRange;
      const filters: AnalyticsFilters = { startDate, endDate };

      // 获取仪表板数据
      const dashboardData = await analyticsApi.getDashboardData(filters);
      
      // 获取用户行为数据
      const userBehaviorData = await analyticsApi.getUserBehavior(filters);
      
      // 获取转化数据
      const conversionData = await analyticsApi.getConversionData(filters);

      setAnalyticsData({
        dashboard: dashboardData,
        userBehavior: userBehaviorData,
        conversion: conversionData
      });
    } catch (error) {
      console.error('加载分析数据失败:', error);
      message.error('加载分析数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (analysisType: string) => {
    try {
      const [startDate, endDate] = dateRange;
      const filters: AnalyticsFilters = { startDate, endDate };
      
      const response = await analyticsApi.exportReport(filters, 'csv');
      
      // 创建下载链接
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${analysisType}_${startDate}_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      message.success('导出成功');
    } catch (error) {
      console.error('导出失败:', error);
      message.error('导出失败');
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>加载分析数据中...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2}>数据分析仪表板</Title>
        <Space>
          <RangePicker
            value={[dayjs(dateRange[0]), dayjs(dateRange[1])]}
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                setDateRange([
                  dates[0].format('YYYY-MM-DD'),
                  dates[1].format('YYYY-MM-DD')
                ]);
              }
            }}
          />
          <Button icon={<ReloadOutlined />} onClick={loadAnalyticsData}>
            刷新
          </Button>
          <Button icon={<DownloadOutlined />} onClick={() => handleExport('analytics')}>
            导出报告
          </Button>
        </Space>
      </div>

      {analyticsData && (
        <>
          {/* 关键指标 */}
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="页面浏览量"
                  value={analyticsData.dashboard.pageViews}
                  suffix="次"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="独立访客"
                  value={analyticsData.dashboard.uniqueVisitors}
                  suffix="人"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="跳出率"
                  value={analyticsData.dashboard.bounceRate}
                  suffix="%"
                  precision={2}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="平均会话时长"
                  value={analyticsData.dashboard.avgSessionDuration}
                  suffix="分钟"
                  precision={1}
                />
              </Card>
            </Col>
          </Row>

          {/* 图表区域 */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="用户行为趋势" style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.userBehavior}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="action" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="转化率分析" style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.conversion}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData.conversion.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          {/* 热门页面 */}
          <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
            <Col xs={24}>
              <Card title="热门页面">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.dashboard.topPages}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="path" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="views" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

// 简单的统计组件
const Statistic: React.FC<{ title: string; value: number; suffix?: string; precision?: number }> = ({ 
  title, 
  value, 
  suffix = '', 
  precision = 0 
}) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
      {value.toFixed(precision)}{suffix}
    </div>
    <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
      {title}
    </div>
  </div>
);

export default AnalyticsDashboardPage; 