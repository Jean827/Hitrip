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
  Avatar,
  Row,
  Col,
  Statistic,
  Progress
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  LockOutlined,
  UnlockOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  SettingOutlined,
  ExportOutlined,
  ImportOutlined,
  SearchOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer } from 'recharts';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

interface User {
  _id: string;
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
  status: 'active' | 'inactive' | 'locked';
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  profile?: {
    nickname?: string;
    gender?: 'male' | 'female' | 'other';
    birthday?: string;
    location?: string;
    bio?: string;
  };
  statistics?: {
    totalOrders: number;
    totalSpent: number;
    loginCount: number;
    lastActivity: string;
  };
}

interface Role {
  _id: string;
  name: string;
  description?: string;
}

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number, range: [number, number]) => 
      `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`
  });
  const [form] = Form.useForm();

  // 模拟数据
  const mockUsers: User[] = [
    {
      _id: '1',
      username: 'admin',
      email: 'admin@hitrip.com',
      phone: '13800138000',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      role: '超级管理员',
      status: 'active',
      lastLoginAt: '2024-12-01T10:30:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-12-01T10:30:00Z',
      profile: {
        nickname: '管理员',
        gender: 'male',
        birthday: '1990-01-01',
        location: '海南海口',
        bio: '系统管理员'
      },
      statistics: {
        totalOrders: 0,
        totalSpent: 0,
        loginCount: 156,
        lastActivity: '2024-12-01T10:30:00Z'
      }
    },
    {
      _id: '2',
      username: 'user001',
      email: 'user001@example.com',
      phone: '13800138001',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user001',
      role: '普通用户',
      status: 'active',
      lastLoginAt: '2024-12-01T09:15:00Z',
      createdAt: '2024-02-15T00:00:00Z',
      updatedAt: '2024-12-01T09:15:00Z',
      profile: {
        nickname: '张三',
        gender: 'male',
        birthday: '1995-05-15',
        location: '海南三亚',
        bio: '热爱旅游的用户'
      },
      statistics: {
        totalOrders: 12,
        totalSpent: 3500,
        loginCount: 89,
        lastActivity: '2024-12-01T09:15:00Z'
      }
    },
    {
      _id: '3',
      username: 'user002',
      email: 'user002@example.com',
      phone: '13800138002',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user002',
      role: '普通用户',
      status: 'inactive',
      lastLoginAt: '2024-11-25T14:20:00Z',
      createdAt: '2024-03-20T00:00:00Z',
      updatedAt: '2024-11-25T14:20:00Z',
      profile: {
        nickname: '李四',
        gender: 'female',
        birthday: '1992-08-20',
        location: '海南文昌',
        bio: '旅游爱好者'
      },
      statistics: {
        totalOrders: 8,
        totalSpent: 2200,
        loginCount: 45,
        lastActivity: '2024-11-25T14:20:00Z'
      }
    },
    {
      _id: '4',
      username: 'user003',
      email: 'user003@example.com',
      phone: '13800138003',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user003',
      role: '普通用户',
      status: 'locked',
      lastLoginAt: '2024-11-20T16:45:00Z',
      createdAt: '2024-04-10T00:00:00Z',
      updatedAt: '2024-11-20T16:45:00Z',
      profile: {
        nickname: '王五',
        gender: 'male',
        birthday: '1988-12-10',
        location: '海南琼海',
        bio: '商务旅行者'
      },
      statistics: {
        totalOrders: 5,
        totalSpent: 1800,
        loginCount: 23,
        lastActivity: '2024-11-20T16:45:00Z'
      }
    }
  ];

  const mockRoles: Role[] = [
    { _id: '1', name: '超级管理员', description: '拥有所有权限' },
    { _id: '2', name: '普通管理员', description: '用户管理权限' },
    { _id: '3', name: '普通用户', description: '基础权限' }
  ];

  // 用户行为数据
  const userBehaviorData = [
    { date: '2024-11-25', loginCount: 45, orderCount: 8, spendAmount: 2200 },
    { date: '2024-11-26', loginCount: 52, orderCount: 12, spendAmount: 3500 },
    { date: '2024-11-27', loginCount: 38, orderCount: 6, spendAmount: 1800 },
    { date: '2024-11-28', loginCount: 61, orderCount: 15, spendAmount: 4200 },
    { date: '2024-11-29', loginCount: 47, orderCount: 9, spendAmount: 2800 },
    { date: '2024-11-30', loginCount: 55, orderCount: 11, spendAmount: 3100 },
    { date: '2024-12-01', loginCount: 89, orderCount: 12, spendAmount: 3500 }
  ];

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // TODO: 调用API获取用户列表
      setUsers(mockUsers);
    } catch (error) {
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      // TODO: 调用API获取角色列表
      setRoles(mockRoles);
    } catch (error) {
      message.error('获取角色列表失败');
    }
  };

  const handleView = (record: User) => {
    setSelectedUser(record);
    setDrawerVisible(true);
  };

  const handleEdit = (record: User) => {
    setEditingUser(record);
    form.setFieldsValue({
      username: record.username,
      email: record.email,
      phone: record.phone,
      role: record.role,
      status: record.status,
      profile: record.profile
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      // TODO: 调用API删除用户
      message.success('删除成功');
      fetchUsers();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      // TODO: 调用API更新用户状态
      message.success('状态更新成功');
      fetchUsers();
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingUser) {
        // TODO: 调用API更新用户
        message.success('更新成功');
      } else {
        // TODO: 调用API创建用户
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchUsers();
    } catch (error) {
      message.error(editingUser ? '更新失败' : '创建失败');
    }
  };

  const handleExport = () => {
    // TODO: 实现数据导出功能
    message.success('数据导出成功');
  };

  const handleImport = () => {
    // TODO: 实现数据导入功能
    message.success('数据导入成功');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'orange';
      case 'locked': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '正常';
      case 'inactive': return '未激活';
      case 'locked': return '已锁定';
      default: return '未知';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchText.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchText.toLowerCase()) ||
                         user.profile?.nickname?.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  // 更新分页总数
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      total: filteredUsers.length
    }));
  }, [filteredUsers.length]);

  const columns = [
    {
      title: '用户信息',
      key: 'userInfo',
      render: (record: User) => (
        <Space>
          <Avatar src={record.avatar} icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 'bold' }}>{record.username}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '昵称',
      dataIndex: ['profile', 'nickname'],
      key: 'nickname',
      render: (text: string) => text || '-'
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => <Tag color="blue">{role}</Tag>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge 
          status={status === 'active' ? 'success' : status === 'inactive' ? 'warning' : 'error'} 
          text={getStatusText(status)} 
        />
      )
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      render: (date: string) => date ? new Date(date).toLocaleString() : '-'
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: User) => (
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
          {record.status === 'locked' ? (
            <Tooltip title="解锁">
              <Button 
                type="link" 
                icon={<UnlockOutlined />}
                onClick={() => handleStatusChange(record._id, 'active')}
              />
            </Tooltip>
          ) : (
            <Tooltip title="锁定">
              <Button 
                type="link" 
                icon={<LockOutlined />}
                onClick={() => handleStatusChange(record._id, 'locked')}
              />
            </Tooltip>
          )}
          <Popconfirm
            title="确定要删除这个用户吗？"
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

  return (
    <div>
      <Card 
        title="用户管理" 
        extra={
          <Space>
            <Button icon={<ImportOutlined />} onClick={handleImport}>
              导入
            </Button>
            <Button icon={<ExportOutlined />} onClick={handleExport}>
              导出
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
              新建用户
            </Button>
          </Space>
        }
      >
        {/* 搜索和筛选 */}
        <div style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={6}>
              <Input
                placeholder="搜索用户名、邮箱或昵称"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
            <Col span={4}>
              <Select
                placeholder="状态筛选"
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: '100%' }}
              >
                <Option value="all">全部状态</Option>
                <Option value="active">正常</Option>
                <Option value="inactive">未激活</Option>
                <Option value="locked">已锁定</Option>
              </Select>
            </Col>
            <Col span={4}>
              <Select
                placeholder="角色筛选"
                value={roleFilter}
                onChange={setRoleFilter}
                style={{ width: '100%' }}
              >
                <Option value="all">全部角色</Option>
                {roles.map(role => (
                  <Option key={role._id} value={role.name}>{role.name}</Option>
                ))}
              </Select>
            </Col>
          </Row>
        </div>

        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="_id"
          loading={loading}
          pagination={{
            ...pagination,
            onChange: (page, pageSize) => {
              setPagination(prev => ({
                ...prev,
                current: page,
                pageSize: pageSize || prev.pageSize
              }));
            },
            onShowSizeChange: (current, size) => {
              setPagination(prev => ({
                ...prev,
                current: 1,
                pageSize: size
              }));
            }
          }}
        />
      </Card>

      {/* 用户详情抽屉 */}
      <Drawer
        title="用户详情"
        placement="right"
        width={600}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {selectedUser && (
          <div>
            <Tabs defaultActiveKey="basic">
              <TabPane tab="基本信息" key="basic">
                <Descriptions column={1} bordered>
                  <Descriptions.Item label="用户名">{selectedUser.username}</Descriptions.Item>
                  <Descriptions.Item label="邮箱">{selectedUser.email}</Descriptions.Item>
                  <Descriptions.Item label="手机号">{selectedUser.phone || '-'}</Descriptions.Item>
                  <Descriptions.Item label="昵称">{selectedUser.profile?.nickname || '-'}</Descriptions.Item>
                  <Descriptions.Item label="性别">
                    {selectedUser.profile?.gender === 'male' ? '男' : 
                     selectedUser.profile?.gender === 'female' ? '女' : '其他'}
                  </Descriptions.Item>
                  <Descriptions.Item label="生日">{selectedUser.profile?.birthday || '-'}</Descriptions.Item>
                  <Descriptions.Item label="地区">{selectedUser.profile?.location || '-'}</Descriptions.Item>
                  <Descriptions.Item label="个人简介">{selectedUser.profile?.bio || '-'}</Descriptions.Item>
                  <Descriptions.Item label="角色">{selectedUser.role}</Descriptions.Item>
                  <Descriptions.Item label="状态">
                    <Badge 
                      status={selectedUser.status === 'active' ? 'success' : 
                              selectedUser.status === 'inactive' ? 'warning' : 'error'} 
                      text={getStatusText(selectedUser.status)} 
                    />
                  </Descriptions.Item>
                  <Descriptions.Item label="注册时间">
                    {new Date(selectedUser.createdAt).toLocaleString()}
                  </Descriptions.Item>
                  <Descriptions.Item label="最后登录">
                    {selectedUser.lastLoginAt ? new Date(selectedUser.lastLoginAt).toLocaleString() : '-'}
                  </Descriptions.Item>
                </Descriptions>
              </TabPane>
              
              <TabPane tab="统计数据" key="statistics">
                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col span={8}>
                    <Statistic title="总订单数" value={selectedUser.statistics?.totalOrders || 0} />
                  </Col>
                  <Col span={8}>
                    <Statistic title="总消费" value={selectedUser.statistics?.totalSpent || 0} prefix="¥" />
                  </Col>
                  <Col span={8}>
                    <Statistic title="登录次数" value={selectedUser.statistics?.loginCount || 0} />
                  </Col>
                </Row>
                
                <div style={{ marginTop: 24 }}>
                  <h4>用户行为趋势</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={userBehaviorData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip />
                      <Line type="monotone" dataKey="loginCount" stroke="#8884d8" name="登录次数" />
                      <Line type="monotone" dataKey="orderCount" stroke="#82ca9d" name="订单数" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabPane>
              
              <TabPane tab="操作日志" key="logs">
                <p>用户操作日志功能待开发...</p>
              </TabPane>
            </Tabs>
          </div>
        )}
      </Drawer>

      {/* 编辑用户模态框 */}
      <Modal
        title={editingUser ? '编辑用户' : '新建用户'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入正确的邮箱格式' }
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式' }
            ]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>

          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              {roles.map(role => (
                <Option key={role._id} value={role.name}>{role.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Option value="active">正常</Option>
              <Option value="inactive">未激活</Option>
              <Option value="locked">已锁定</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name={['profile', 'nickname']}
            label="昵称"
          >
            <Input placeholder="请输入昵称" />
          </Form.Item>

          <Form.Item
            name={['profile', 'gender']}
            label="性别"
          >
            <Select placeholder="请选择性别">
              <Option value="male">男</Option>
              <Option value="female">女</Option>
              <Option value="other">其他</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name={['profile', 'location']}
            label="地区"
          >
            <Input placeholder="请输入地区" />
          </Form.Item>

          <Form.Item
            name={['profile', 'bio']}
            label="个人简介"
          >
            <TextArea rows={3} placeholder="请输入个人简介" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingUser ? '更新' : '创建'}
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

export default AdminUsersPage; 