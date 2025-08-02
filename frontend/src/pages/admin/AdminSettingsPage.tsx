import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  message, 
  Popconfirm, 
  Tag, 
  Space, 
  Tooltip, 
  Drawer,
  Descriptions,
  Tabs,
  Badge,
  Switch,
  InputNumber,
  Upload,
  Tree,
  Row,
  Col,
  Statistic,
  Progress,
  Alert,
  Divider
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  SaveOutlined,
  ReloadOutlined,
  DownloadOutlined,
  UploadOutlined,
  SettingOutlined,
  SecurityScanOutlined,
  DatabaseOutlined,
  MonitorOutlined,
  FileTextOutlined,
  KeyOutlined,
  UserOutlined,
  MenuOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer } from 'recharts';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { DirectoryTree } = Tree;

interface SystemConfig {
  _id: string;
  category: string;
  key: string;
  value: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  isRequired: boolean;
  isPublic: boolean;
  updatedAt: string;
}

interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: string[];
  menus: string[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Menu {
  _id: string;
  name: string;
  path: string;
  icon: string;
  parentId?: string;
  order: number;
  isVisible: boolean;
  isEnabled: boolean;
  permissions: string[];
  children?: Menu[];
}

interface LogEntry {
  _id: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  category: string;
  message: string;
  details?: any;
  userId?: string;
  username?: string;
  ip?: string;
  userAgent?: string;
  createdAt: string;
}

const AdminSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('system');
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [form] = Form.useForm();

  // 模拟数据
  const mockConfigs: SystemConfig[] = [
    {
      _id: '1',
      category: 'system',
      key: 'site_name',
      value: '海南文旅平台',
      description: '网站名称',
      type: 'string',
      isRequired: true,
      isPublic: true,
      updatedAt: '2024-12-01T10:30:00Z'
    },
    {
      _id: '2',
      category: 'system',
      key: 'site_description',
      value: '海南旅游文化综合服务平台',
      description: '网站描述',
      type: 'string',
      isRequired: false,
      isPublic: true,
      updatedAt: '2024-12-01T10:30:00Z'
    },
    {
      _id: '3',
      category: 'email',
      key: 'smtp_host',
      value: 'smtp.example.com',
      description: 'SMTP服务器地址',
      type: 'string',
      isRequired: true,
      isPublic: false,
      updatedAt: '2024-12-01T10:30:00Z'
    },
    {
      _id: '4',
      category: 'email',
      key: 'smtp_port',
      value: '587',
      description: 'SMTP端口',
      type: 'number',
      isRequired: true,
      isPublic: false,
      updatedAt: '2024-12-01T10:30:00Z'
    },
    {
      _id: '5',
      category: 'security',
      key: 'session_timeout',
      value: '3600',
      description: '会话超时时间（秒）',
      type: 'number',
      isRequired: true,
      isPublic: false,
      updatedAt: '2024-12-01T10:30:00Z'
    },
    {
      _id: '6',
      category: 'security',
      key: 'enable_captcha',
      value: 'true',
      description: '启用验证码',
      type: 'boolean',
      isRequired: false,
      isPublic: false,
      updatedAt: '2024-12-01T10:30:00Z'
    }
  ];

  const mockRoles: Role[] = [
    {
      _id: '1',
      name: '超级管理员',
      description: '拥有所有权限',
      permissions: ['*'],
      menus: ['*'],
      isDefault: false,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-12-01T10:30:00Z'
    },
    {
      _id: '2',
      name: '普通管理员',
      description: '用户管理权限',
      permissions: ['user:read', 'user:write', 'order:read'],
      menus: ['dashboard', 'users', 'orders'],
      isDefault: false,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-12-01T10:30:00Z'
    },
    {
      _id: '3',
      name: '普通用户',
      description: '基础权限',
      permissions: ['user:read'],
      menus: ['dashboard'],
      isDefault: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-12-01T10:30:00Z'
    }
  ];

  const mockMenus: Menu[] = [
    {
      _id: '1',
      name: '仪表盘',
      path: '/dashboard',
      icon: 'DashboardOutlined',
      order: 1,
      isVisible: true,
      isEnabled: true,
      permissions: ['dashboard:read']
    },
    {
      _id: '2',
      name: '用户管理',
      path: '/users',
      icon: 'UserOutlined',
      order: 2,
      isVisible: true,
      isEnabled: true,
      permissions: ['user:read', 'user:write'],
      children: [
        {
          _id: '2-1',
          name: '用户列表',
          path: '/users/list',
          icon: 'UserOutlined',
          parentId: '2',
          order: 1,
          isVisible: true,
          isEnabled: true,
          permissions: ['user:read']
        },
        {
          _id: '2-2',
          name: '角色管理',
          path: '/users/roles',
          icon: 'TeamOutlined',
          parentId: '2',
          order: 2,
          isVisible: true,
          isEnabled: true,
          permissions: ['role:read', 'role:write']
        }
      ]
    },
    {
      _id: '3',
      name: '内容管理',
      path: '/content',
      icon: 'FileTextOutlined',
      order: 3,
      isVisible: true,
      isEnabled: true,
      permissions: ['content:read', 'content:write']
    },
    {
      _id: '4',
      name: '订单管理',
      path: '/orders',
      icon: 'ShoppingOutlined',
      order: 4,
      isVisible: true,
      isEnabled: true,
      permissions: ['order:read', 'order:write']
    },
    {
      _id: '5',
      name: '系统设置',
      path: '/settings',
      icon: 'SettingOutlined',
      order: 5,
      isVisible: true,
      isEnabled: true,
      permissions: ['setting:read', 'setting:write']
    }
  ];

  const mockLogs: LogEntry[] = [
    {
      _id: '1',
      level: 'info',
      category: 'user',
      message: '用户登录成功',
      userId: '1',
      username: 'admin',
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0...',
      createdAt: '2024-12-01T10:30:00Z'
    },
    {
      _id: '2',
      level: 'warn',
      category: 'security',
      message: '登录失败次数过多',
      userId: '2',
      username: 'user001',
      ip: '192.168.1.101',
      userAgent: 'Mozilla/5.0...',
      createdAt: '2024-12-01T10:25:00Z'
    },
    {
      _id: '3',
      level: 'error',
      category: 'system',
      message: '数据库连接失败',
      details: { error: 'Connection timeout' },
      createdAt: '2024-12-01T10:20:00Z'
    },
    {
      _id: '4',
      level: 'info',
      category: 'order',
      message: '订单创建成功',
      userId: '3',
      username: 'user002',
      ip: '192.168.1.102',
      userAgent: 'Mozilla/5.0...',
      createdAt: '2024-12-01T10:15:00Z'
    }
  ];

  // 系统监控数据
  const systemStats = {
    cpu: 45,
    memory: 68,
    disk: 32,
    network: 78
  };

  const logStats = [
    { level: 'info', count: 1250, color: '#52c41a' },
    { level: 'warn', count: 89, color: '#faad14' },
    { level: 'error', count: 23, color: '#ff4d4f' },
    { level: 'debug', count: 567, color: '#1890ff' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // TODO: 调用API获取数据
      setConfigs(mockConfigs);
      setRoles(mockRoles);
      setMenus(mockMenus);
      setLogs(mockLogs);
    } catch (error) {
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (record: any) => {
    setSelectedItem(record);
    setDrawerVisible(true);
  };

  const handleEdit = (record: any) => {
    setEditingItem(record);
    form.setFieldsValue({
      category: record.category,
      key: record.key,
      value: record.value,
      description: record.description,
      type: record.type,
      isRequired: record.isRequired,
      isPublic: record.isPublic
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      // TODO: 调用API删除配置
      message.success('删除成功');
      fetchData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingItem) {
        // TODO: 调用API更新配置
        message.success('更新成功');
      } else {
        // TODO: 调用API创建配置
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchData();
    } catch (error) {
      message.error(editingItem ? '更新失败' : '创建失败');
    }
  };

  const handleBackup = () => {
    // TODO: 实现数据备份功能
    message.success('数据备份成功');
  };

  const handleRestore = () => {
    // TODO: 实现数据恢复功能
    message.success('数据恢复成功');
  };

  const handleClearLogs = () => {
    // TODO: 实现日志清理功能
    message.success('日志清理成功');
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'info': return 'green';
      case 'warn': return 'orange';
      case 'error': return 'red';
      case 'debug': return 'blue';
      default: return 'default';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'info': return '信息';
      case 'warn': return '警告';
      case 'error': return '错误';
      case 'debug': return '调试';
      default: return '未知';
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'system': return '系统';
      case 'email': return '邮件';
      case 'security': return '安全';
      case 'user': return '用户';
      case 'order': return '订单';
      default: return category;
    }
  };

  const filteredConfigs = configs.filter(config => {
    const matchesSearch = config.key.toLowerCase().includes(searchText.toLowerCase()) ||
                         config.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || config.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchText.toLowerCase()) ||
                         (log.username && log.username.toLowerCase().includes(searchText.toLowerCase()));
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const configColumns = [
    {
      title: '配置项',
      key: 'configInfo',
      render: (record: SystemConfig) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.key}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.description}</div>
        </div>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <Tag color="blue">{getCategoryText(category)}</Tag>
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag color="purple">{type}</Tag>
    },
    {
      title: '值',
      dataIndex: 'value',
      key: 'value',
      render: (value: string, record: SystemConfig) => {
        if (record.type === 'boolean') {
          return <Switch checked={value === 'true'} disabled />
        }
        return <span>{value}</span>
      }
    },
    {
      title: '必填',
      dataIndex: 'isRequired',
      key: 'isRequired',
      render: (required: boolean) => (
        <Badge status={required ? 'error' : 'default'} text={required ? '是' : '否'} />
      )
    },
    {
      title: '公开',
      dataIndex: 'isPublic',
      key: 'isPublic',
      render: (public: boolean) => (
        <Badge status={public ? 'success' : 'default'} text={public ? '是' : '否'} />
      )
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: SystemConfig) => (
        <Space>
          <Tooltip title="查看详情">
            <Button 
              type="link" 
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button 
              type="link" 
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个配置吗？"
            onConfirm={() => handleDelete(record._id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const logColumns = [
    {
      title: '日志信息',
      key: 'logInfo',
      render: (record: LogEntry) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.message}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.username && `${record.username} - `}{record.ip}
          </div>
        </div>
      ),
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      render: (level: string) => (
        <Badge 
          status={level === 'info' ? 'success' : 
                  level === 'warn' ? 'warning' : 
                  level === 'error' ? 'error' : 'default'} 
          text={getLevelText(level)} 
        />
      )
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <Tag color="blue">{getCategoryText(category)}</Tag>
    },
    {
      title: '用户',
      dataIndex: 'username',
      key: 'username',
      render: (username: string) => username || '-'
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
      render: (ip: string) => ip || '-'
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString()
    },
  ];

  return (
    <div>
      <Card 
        title="系统设置" 
        extra={
          <Space>
            <Button icon={<DownloadOutlined />} onClick={handleBackup}>
              备份
            </Button>
            <Button icon={<UploadOutlined />} onClick={handleRestore}>
              恢复
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
              新建配置
            </Button>
          </Space>
        }
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="系统配置" key="system">
            {/* 搜索和筛选 */}
            <div style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={6}>
                  <Input
                    placeholder="搜索配置项或描述"
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </Col>
                <Col span={4}>
                  <Select
                    placeholder="分类筛选"
                    value={categoryFilter}
                    onChange={setCategoryFilter}
                    style={{ width: '100%' }}
                  >
                    <Option value="all">全部分类</Option>
                    <Option value="system">系统</Option>
                    <Option value="email">邮件</Option>
                    <Option value="security">安全</Option>
                  </Select>
                </Col>
              </Row>
            </div>

            <Table
              columns={configColumns}
              dataSource={filteredConfigs}
              rowKey="_id"
              loading={loading}
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
            />
          </TabPane>

          <TabPane tab="权限管理" key="permissions">
            <Row gutter={16}>
              <Col span={12}>
                <Card title="角色管理" size="small">
                  <List
                    dataSource={roles}
                    renderItem={(role) => (
                      <List.Item
                        actions={[
                          <Button type="link" icon={<EditOutlined />}>编辑</Button>,
                          <Button type="link" icon={<EyeOutlined />}>查看</Button>
                        ]}
                      >
                        <List.Item.Meta
                          title={role.name}
                          description={role.description}
                        />
                        <div>
                          <Tag color={role.isDefault ? 'green' : 'blue'}>
                            {role.isDefault ? '默认' : '自定义'}
                          </Tag>
                        </div>
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card title="菜单管理" size="small">
                  <DirectoryTree
                    treeData={menus.map(menu => ({
                      title: menu.name,
                      key: menu._id,
                      children: menu.children?.map(child => ({
                        title: child.name,
                        key: child._id
                      }))
                    }))}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="日志管理" key="logs">
            {/* 搜索和筛选 */}
            <div style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={6}>
                  <Input
                    placeholder="搜索日志信息或用户名"
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </Col>
                <Col span={4}>
                  <Select
                    placeholder="级别筛选"
                    value={levelFilter}
                    onChange={setLevelFilter}
                    style={{ width: '100%' }}
                  >
                    <Option value="all">全部级别</Option>
                    <Option value="info">信息</Option>
                    <Option value="warn">警告</Option>
                    <Option value="error">错误</Option>
                    <Option value="debug">调试</Option>
                  </Select>
                </Col>
                <Col span={4}>
                  <Button icon={<ReloadOutlined />} onClick={fetchData}>
                    刷新
                  </Button>
                </Col>
                <Col span={4}>
                  <Button icon={<DeleteOutlined />} onClick={handleClearLogs}>
                    清理日志
                  </Button>
                </Col>
              </Row>
            </div>

            <Table
              columns={logColumns}
              dataSource={filteredLogs}
              rowKey="_id"
              loading={loading}
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
            />
          </TabPane>

          <TabPane tab="系统监控" key="monitor">
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={6}>
                <Statistic title="CPU使用率" value={systemStats.cpu} suffix="%" />
                <Progress percent={systemStats.cpu} status="active" />
              </Col>
              <Col span={6}>
                <Statistic title="内存使用率" value={systemStats.memory} suffix="%" />
                <Progress percent={systemStats.memory} status="active" />
              </Col>
              <Col span={6}>
                <Statistic title="磁盘使用率" value={systemStats.disk} suffix="%" />
                <Progress percent={systemStats.disk} status="active" />
              </Col>
              <Col span={6}>
                <Statistic title="网络使用率" value={systemStats.network} suffix="%" />
                <Progress percent={systemStats.network} status="active" />
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Card title="日志统计" size="small">
                  <Row gutter={16}>
                    {logStats.map(stat => (
                      <Col span={6} key={stat.level}>
                        <Statistic 
                          title={getLevelText(stat.level)} 
                          value={stat.count} 
                          valueStyle={{ color: stat.color }}
                        />
                      </Col>
                    ))}
                  </Row>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="系统状态" size="small">
                  <Alert
                    message="系统运行正常"
                    description="所有服务运行正常，无异常情况"
                    type="success"
                    showIcon
                  />
                  <Divider />
                  <Alert
                    message="数据库连接正常"
                    description="数据库连接稳定，响应时间正常"
                    type="success"
                    showIcon
                  />
                  <Divider />
                  <Alert
                    message="缓存服务正常"
                    description="Redis缓存服务运行正常"
                    type="success"
                    showIcon
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>

      {/* 配置详情抽屉 */}
      <Drawer
        title="配置详情"
        placement="right"
        width={500}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {selectedItem && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="配置键">{selectedItem.key}</Descriptions.Item>
            <Descriptions.Item label="配置值">{selectedItem.value}</Descriptions.Item>
            <Descriptions.Item label="描述">{selectedItem.description}</Descriptions.Item>
            <Descriptions.Item label="分类">{getCategoryText(selectedItem.category)}</Descriptions.Item>
            <Descriptions.Item label="类型">{selectedItem.type}</Descriptions.Item>
            <Descriptions.Item label="必填">
              <Badge status={selectedItem.isRequired ? 'error' : 'default'} text={selectedItem.isRequired ? '是' : '否'} />
            </Descriptions.Item>
            <Descriptions.Item label="公开">
              <Badge status={selectedItem.isPublic ? 'success' : 'default'} text={selectedItem.isPublic ? '是' : '否'} />
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {new Date(selectedItem.updatedAt).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>

      {/* 编辑配置模态框 */}
      <Modal
        title={editingItem ? '编辑配置' : '新建配置'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select placeholder="请选择分类">
              <Option value="system">系统</Option>
              <Option value="email">邮件</Option>
              <Option value="security">安全</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="key"
            label="配置键"
            rules={[{ required: true, message: '请输入配置键' }]}
          >
            <Input placeholder="请输入配置键" />
          </Form.Item>

          <Form.Item
            name="value"
            label="配置值"
            rules={[{ required: true, message: '请输入配置值' }]}
          >
            <Input placeholder="请输入配置值" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: true, message: '请输入描述' }]}
          >
            <TextArea rows={3} placeholder="请输入描述" />
          </Form.Item>

          <Form.Item
            name="type"
            label="类型"
            rules={[{ required: true, message: '请选择类型' }]}
          >
            <Select placeholder="请选择类型">
              <Option value="string">字符串</Option>
              <Option value="number">数字</Option>
              <Option value="boolean">布尔值</Option>
              <Option value="json">JSON</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="isRequired"
            label="必填"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="isPublic"
            label="公开"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingItem ? '更新' : '创建'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminSettingsPage; 