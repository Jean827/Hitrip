import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Select, DatePicker, Button, Table, Statistic, Spin, message } from 'antd';
import { DownloadOutlined, ReloadOutlined, FilterOutlined } from '@ant-design/icons';
import DataVisualization from '../../components/charts/DataVisualization';
import { analyticsApi } from '../../services/analyticsApi';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface AnalyticsData {
  userBehavior?: any;
  salesAnalysis?: any;
  geographicAnalysis?: any;
  timeSeries?: any;
  conversionAnalysis?: any;
  retentionAnalysis?: any;
}

const AnalyticsDashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AnalyticsData>({});
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    analysisType: 'user-behavior',
    chartType: 'line',
  });

  useEffect(() => {
    loadAnalyticsData();
  }, [filters]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const { startDate, endDate, analysisType } = filters;
      
      let response;
      switch (analysisType) {
        case 'user-behavior':
          response = await analyticsApi.getUserBehavior({ startDate, endDate });
          break;
        case 'sales-analysis':
          response = await analyticsApi.getSalesAnalysis({ startDate, endDate });
          break;
        case 'geographic-analysis':
          response = await analyticsApi.getGeographicAnalysis({ startDate, endDate });
          break;
        case 'time-series':
          response = await analyticsApi.getTimeSeries({ startDate, endDate });
          break;
        case 'conversion-analysis':
          response = await analyticsApi.getConversionAnalysis({ startDate, endDate });
          break;
        case 'retention-analysis':
          response = await analyticsApi.getRetentionAnalysis({ startDate, endDate });
          break;
        default:
          response = await analyticsApi.getUserBehavior({ startDate, endDate });
      }

      if (response.success) {
        setData({ [analysisType]: response.data });
      } else {
        message.error('获取数据失败');
      }
    } catch (error) {
      console.error('加载分析数据失败:', error);
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (dates: any) => {
    if (dates) {
      setFilters(prev => ({
        ...prev,
        startDate: dates[0].format('YYYY-MM-DD'),
        endDate: dates[1].format('YYYY-MM-DD'),
      }));
    }
  };

  const handleAnalysisTypeChange = (value: string) => {
    setFilters(prev => ({ ...prev, analysisType: value }));
  };

  const handleChartTypeChange = (value: string) => {
    setFilters(prev => ({ ...prev, chartType: value }));
  };

  const exportData = async () => {
    try {
      const { startDate, endDate, analysisType } = filters;
      const response = await analyticsApi.exportData(analysisType, { startDate, endDate });
      
      if (response.success) {
        // 创建下载链接
        const blob = new Blob([JSON.stringify(response.data)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${analysisType}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        message.success('数据导出成功');
      }
    } catch (error) {
      console.error('导出数据失败:', error);
      message.error('导出数据失败');
    }
  };

  const renderUserBehaviorChart = () => {
    const behaviorData = data.userBehavior;
    if (!behaviorData) return null;

    return (
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="事件统计" size="small">
            <DataVisualization
              data={behaviorData.eventStats || []}
              type={filters.chartType as any}
              xAxis="eventType"
              yAxis="count"
              title="用户事件分布"
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="页面访问统计" size="small">
            <DataVisualization
              data={behaviorData.pageStats || []}
              type={filters.chartType as any}
              xAxis="pageUrl"
              yAxis="count"
              title="页面访问量"
            />
          </Card>
        </Col>
        <Col span={24}>
          <Card title="时间趋势" size="small">
            <DataVisualization
              data={behaviorData.timeTrend || []}
              type="line"
              xAxis="date"
              yAxis="count"
              title="用户行为时间趋势"
            />
          </Card>
        </Col>
      </Row>
    );
  };

  const renderSalesAnalysisChart = () => {
    const salesData = data.salesAnalysis;
    if (!salesData) return null;

    return (
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card title="销售统计" size="small">
            <Statistic title="总销售额" value={salesData.summary?.totalSales || 0} prefix="¥" />
            <Statistic title="订单数量" value={salesData.summary?.orderCount || 0} />
            <Statistic title="平均订单金额" value={salesData.summary?.avgOrderValue || 0} prefix="¥" />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="地区销售分布" size="small">
            <DataVisualization
              data={salesData.regionStats || []}
              type="pie"
              xAxis="region"
              yAxis="totalAmount"
              title="地区销售分布"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="渠道销售分布" size="small">
            <DataVisualization
              data={salesData.channelStats || []}
              type="bar"
              xAxis="channel"
              yAxis="totalAmount"
              title="渠道销售分布"
            />
          </Card>
        </Col>
        <Col span={24}>
          <Card title="销售趋势" size="small">
            <DataVisualization
              data={salesData.timeTrend || []}
              type="line"
              xAxis="date"
              yAxis="totalAmount"
              title="销售时间趋势"
            />
          </Card>
        </Col>
      </Row>
    );
  };

  const renderGeographicAnalysisChart = () => {
    const geoData = data.geographicAnalysis;
    if (!geoData) return null;

    return (
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="地区销售统计" size="small">
            <DataVisualization
              data={geoData.regionSales || []}
              type="bar"
              xAxis="region"
              yAxis="totalAmount"
              title="地区销售统计"
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="地区用户活跃度" size="small">
            <DataVisualization
              data={geoData.regionActivity || []}
              type="bar"
              xAxis="ipAddress"
              yAxis="activityCount"
              title="地区用户活跃度"
            />
          </Card>
        </Col>
      </Row>
    );
  };

  const renderTimeSeriesChart = () => {
    const timeData = data.timeSeries;
    if (!timeData) return null;

    return (
      <Card title="时间序列分析" size="small">
        <DataVisualization
          data={timeData.timeSeriesData || []}
          type={filters.chartType as any}
          xAxis="timePeriod"
          yAxis="value"
          title={`时间序列分析 (${timeData.interval || 'day'})`}
        />
      </Card>
    );
  };

  const renderConversionAnalysisChart = () => {
    const conversionData = data.conversionAnalysis;
    if (!conversionData) return null;

    return (
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="转化漏斗" size="small">
            <DataVisualization
              data={conversionData.conversionData || []}
              type="bar"
              xAxis="step"
              yAxis="count"
              title="转化漏斗分析"
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="转化率统计" size="small">
            <Statistic title="总体转化率" value={conversionData.totalConversionRate || 0} suffix="%" />
            <Table
              dataSource={conversionData.conversionData || []}
              columns={[
                { title: '步骤', dataIndex: 'step', key: 'step' },
                { title: '数量', dataIndex: 'count', key: 'count' },
                { title: '转化率', dataIndex: 'conversionRate', key: 'conversionRate', render: (value) => `${value}%` },
              ]}
              size="small"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  const renderRetentionAnalysisChart = () => {
    const retentionData = data.retentionAnalysis;
    if (!retentionData) return null;

    return (
      <Card title="留存率分析" size="small">
        <DataVisualization
          data={retentionData.retentionData || []}
          type="line"
          xAxis="day"
          yAxis="retentionRate"
          title="用户留存率趋势"
        />
      </Card>
    );
  };

  const renderChartContent = () => {
    switch (filters.analysisType) {
      case 'user-behavior':
        return renderUserBehaviorChart();
      case 'sales-analysis':
        return renderSalesAnalysisChart();
      case 'geographic-analysis':
        return renderGeographicAnalysisChart();
      case 'time-series':
        return renderTimeSeriesChart();
      case 'conversion-analysis':
        return renderConversionAnalysisChart();
      case 'retention-analysis':
        return renderRetentionAnalysisChart();
      default:
        return renderUserBehaviorChart();
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card title="数据分析仪表板" extra={
        <div style={{ display: 'flex', gap: '8px' }}>
          <RangePicker onChange={handleDateChange} />
          <Select
            value={filters.analysisType}
            onChange={handleAnalysisTypeChange}
            style={{ width: 150 }}
          >
            <Option value="user-behavior">用户行为分析</Option>
            <Option value="sales-analysis">销售数据分析</Option>
            <Option value="geographic-analysis">地域分布分析</Option>
            <Option value="time-series">时间序列分析</Option>
            <Option value="conversion-analysis">转化率分析</Option>
            <Option value="retention-analysis">留存率分析</Option>
          </Select>
          <Select
            value={filters.chartType}
            onChange={handleChartTypeChange}
            style={{ width: 100 }}
          >
            <Option value="line">折线图</Option>
            <Option value="bar">柱状图</Option>
            <Option value="pie">饼图</Option>
            <Option value="area">面积图</Option>
            <Option value="radar">雷达图</Option>
            <Option value="scatter">散点图</Option>
            <Option value="heatmap">热力图</Option>
          </Select>
          <Button icon={<ReloadOutlined />} onClick={loadAnalyticsData}>
            刷新
          </Button>
          <Button icon={<DownloadOutlined />} onClick={exportData}>
            导出
          </Button>
        </div>
      }>
        <Spin spinning={loading}>
          {renderChartContent()}
        </Spin>
      </Card>
    </div>
  );
};

export default AnalyticsDashboardPage; 