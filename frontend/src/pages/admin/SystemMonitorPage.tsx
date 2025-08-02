import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Progress, 
  Table, 
  Tag, 
  Space, 
  Button, 
  DatePicker, 
  Select,
  Alert,
  Timeline,
  Descriptions,
  Badge
} from 'antd';
import { 
  DashboardOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface SystemStatus {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  uptime: string;
  activeUsers: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  source: string;
  userId?: string;
}

interface PerformanceData {
  time: string;
  responseTime: number;
  throughput: number;
  errorRate: number;
  activeConnections: number;
}

const SystemMonitorPage: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    cpu: 45,
    memory: 68,
    disk: 72,
    network: 85,
    uptime: '15天 8小时 32分钟',
    activeUsers: 156,
    totalUsers: 1247,
    totalOrders: 89,
    totalRevenue: 15680
  });

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(false);

  // 模拟性能数据
  const mockPerformanceData: PerformanceData[] = [
    { time: '00:00', responseTime: 120, throughput: 150, errorRate: 0.5, activeConnections: 45 },
    { time: '02:00', responseTime: 95, throughput: 120, errorRate: 0.2, activeConnections: 32 },
    { time: '04:00', responseTime: 85, throughput: 90, errorRate: 0.1, activeConnections: 28 },
    { time: '06:00', responseTime: 110, throughput: 130, errorRate: 0.3, activeConnections: 38 },
    { time: '08:00', responseTime: 140, throughput: 180, errorRate: 0.8, activeConnections: 65 },
    { time: '10:00', responseTime: 160, throughput: 220, errorRate: 1.2, activeConnections: 89 },
    { time: '12:00', responseTime: 180, throughput: 250, errorRate: 1.5, activeConnections: 120 },
    { time: '14:00', responseTime: 170, throughput: 240, errorRate: 1.3, activeConnections: 110 },
    { time: '16:00', responseTime: 150, throughput: 200, errorRate: 0.9, activeConnections: 95 },
    { time: '18:00', responseTime: 130, throughput: 170, errorRate: 0.6, activeConnections: 75 },
    { time: '20:00', responseTime: 145, throughput: 190, errorRate: 0.7, activeConnections: 85 },
    { time: '22:00', responseTime: 125, throughput: 160, errorRate: 0.4, activeConnections: 55 }
  ];

  // 模拟日志数据
  const mockLogs: LogEntry[] = [
    {
      id: '1',
      timestamp: '2024-12-01 14:30:25',
      level: 'info',
      message: '用户登录成功: user001@example.com',
      source: 'auth',
      userId: 'user001'
    },
    {
      id: '2',
      timestamp: '2024-12-01 14:28:15',
      level: 'warning',
      message: '数据库连接池使用率超过80%',
      source: 'database'
    },
    {
      id: '3',
      timestamp: '2024-12-01 14:25:42',
      level: 'error',
      message: '支付接口调用失败: 网络超时',
      source: 'payment'
    },
    {
      id: '4',
      timestamp: '2024-12-01 14:22:18',
      level: 'info',
      message: '新订单创建: ORDER-20241201-001',
      source: 'order'
    },
    {
      id: '5',
      timestamp: '2024-12-01 14:20:33',
      level: 'debug',
      message: '缓存更新: 用户权限数据',
      source: 'cache'
    }
  ];

  useEffect(() => {
    fetchSystemStatus();
    fetchLogs();
    fetchPerformanceData();
  }, []);

  const fetchSystemStatus = async () => {
    setLoading(true);
    try {
      // TODO: 调用API获取系统状态
      // 模拟数据更新
      setTimeout(() => {
        setSystemStatus(prev => ({
          ...prev,
          cpu: Math.floor(Math.random() * 30) + 30,
          memory: Math.floor(Math.random() * 20) + 60,
          activeUsers: Math.floor(Math.random() * 50) + 120
        }));
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('获取系统状态失败:', error);
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      // TODO: 调用API获取日志
      setLogs(mockLogs);
    } catch (error) {
      console.error('获取日志失败:', error);
    }
  };

  const fetchPerformanceData = async () => {
    try {
      // TODO: 调用API获取性能数据
      setPerformanceData(mockPerformanceData);
    } catch (error) {
      console.error('获取性能数据失败:', error);
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'red';
      case 'warning': return 'orange';
      case 'info': return 'blue';
      case 'debug': return 'green';
      default: return 'default';
    }
  };

  const getLogLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return <ExclamationCircleOutlined />;
      case 'warning': return <ExclamationCircleOutlined />;
      case 'info': return <CheckCircleOutlined />;
      case 'debug': return <SyncOutlined />;
      default: return <ClockCircleOutlined />;
    }
  };

  const logColumns = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 150,
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: 80,
      render: (level: string) => (
        <Tag color={getLogLevelColor(level)} icon={getLogLevelIcon(level)}>
          {level.toUpperCase()}
        </Tag>
      )
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      width: 100,
    },
    {
      title: '消息',
      dataIndex: 'message',
      key: 'message',
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 100,
      render: (userId: string) => userId || '-'
    }
  ];

  return (
    <div>
      {/* 系统状态概览 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="CPU使用率"
              value={systemStatus.cpu}
              suffix="%"
              prefix={<DashboardOutlined />}
            />
            <Progress percent={systemStatus.cpu} status={systemStatus.cpu > 80 ? 'exception' : 'normal'} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="内存使用率"
              value={systemStatus.memory}
              suffix="%"
              prefix={<DashboardOutlined />}
            />
            <Progress percent={systemStatus.memory} status={systemStatus.memory > 80 ? 'exception' : 'normal'} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="磁盘使用率"
              value={systemStatus.disk}
              suffix="%"
              prefix={<DashboardOutlined />}
            />
            <Progress percent={systemStatus.disk} status={systemStatus.disk > 80 ? 'exception' : 'normal'} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="网络使用率"
              value={systemStatus.network}
              suffix="%"
              prefix={<DashboardOutlined />}
            />
            <Progress percent={systemStatus.network} status={systemStatus.network > 80 ? 'exception' : 'normal'} />
          </Card>
        </Col>
      </Row>

      {/* 业务指标 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="在线用户"
              value={systemStatus.activeUsers}
              prefix={<UserOutlined />}
            />
            <div style={{ fontSize: '12px', color: '#666' }}>
              总用户: {systemStatus.totalUsers}
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日订单"
              value={systemStatus.totalOrders}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日收入"
              value={systemStatus.totalRevenue}
              prefix="¥"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="系统运行时间"
              value={systemStatus.uptime}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 性能监控图表 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Card title="响应时间趋势" extra={<Button size="small">刷新</Button>}>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="responseTime" stroke="#8884d8" name="响应时间(ms)" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="吞吐量趋势" extra={<Button size="small">刷新</Button>}>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="throughput" stroke="#82ca9d" fill="#82ca9d" name="吞吐量(QPS)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* 系统告警 */}
      <Card title="系统告警" style={{ marginBottom: 16 }}>
        <Alert
          message="数据库连接池使用率过高"
          description="当前使用率85%，建议增加连接池大小或优化查询"
          type="warning"
          showIcon
          action={
            <Button size="small" type="link">
              处理
            </Button>
          }
          style={{ marginBottom: 8 }}
        />
        <Alert
          message="支付接口响应超时"
          description="微信支付接口响应时间超过5秒，请检查网络连接"
          type="error"
          showIcon
          action={
            <Button size="small" type="link">
              处理
            </Button>
          }
        />
      </Card>

      {/* 系统日志 */}
      <Card 
        title="系统日志" 
        extra={
          <Space>
            <Select defaultValue="all" style={{ width: 120 }}>
              <Option value="all">全部级别</Option>
              <Option value="error">错误</Option>
              <Option value="warning">警告</Option>
              <Option value="info">信息</Option>
              <Option value="debug">调试</Option>
            </Select>
            <RangePicker />
            <Button type="primary" size="small">刷新</Button>
          </Space>
        }
      >
        <Table
          columns={logColumns}
          dataSource={logs}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          size="small"
        />
      </Card>
    </div>
  );
};

export default SystemMonitorPage; 