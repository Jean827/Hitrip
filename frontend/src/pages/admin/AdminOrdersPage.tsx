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
  Image,
  Row,
  Col,
  Statistic,
  Progress,
  Timeline,
  Divider,
  List,
  Avatar
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  PrinterOutlined,
  ExportOutlined,
  SearchOutlined,
  FilterOutlined,
  DollarOutlined,
  ShoppingOutlined,
  UserOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  userInfo: {
    username: string;
    email: string;
    phone: string;
    avatar?: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  };
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  refundedAt?: string;
  notes?: string;
  refundReason?: string;
}

interface OrderItem {
  _id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface RefundRequest {
  _id: string;
  orderId: string;
  orderNumber: string;
  userId: string;
  userInfo: {
    username: string;
    email: string;
  };
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
  processedBy?: string;
  notes?: string;
}

const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [form] = Form.useForm();

  // 模拟数据
  const mockOrders: Order[] = [
    {
      _id: '1',
      orderNumber: 'ORD20241201001',
      userId: '1',
      userInfo: {
        username: 'user001',
        email: 'user001@example.com',
        phone: '13800138001',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user001'
      },
      items: [
        {
          _id: '1',
          productId: 'prod1',
          productName: '三亚湾一日游',
          productImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
          price: 299,
          quantity: 2,
          subtotal: 598
        },
        {
          _id: '2',
          productId: 'prod2',
          productName: '天涯海角门票',
          productImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
          price: 80,
          quantity: 1,
          subtotal: 80
        }
      ],
      totalAmount: 678,
      status: 'paid',
      paymentStatus: 'paid',
      paymentMethod: '微信支付',
      shippingAddress: {
        name: '张三',
        phone: '13800138001',
        address: '海南省三亚市天涯区',
        city: '三亚市',
        postalCode: '572000'
      },
      createdAt: '2024-12-01T10:30:00Z',
      updatedAt: '2024-12-01T10:35:00Z',
      paidAt: '2024-12-01T10:35:00Z',
      notes: '客户要求尽快发货'
    },
    {
      _id: '2',
      orderNumber: 'ORD20241201002',
      userId: '2',
      userInfo: {
        username: 'user002',
        email: 'user002@example.com',
        phone: '13800138002',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user002'
      },
      items: [
        {
          _id: '3',
          productId: 'prod3',
          productName: '南山文化旅游区门票',
          productImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
          price: 150,
          quantity: 1,
          subtotal: 150
        }
      ],
      totalAmount: 150,
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: '支付宝',
      shippingAddress: {
        name: '李四',
        phone: '13800138002',
        address: '海南省海口市美兰区',
        city: '海口市',
        postalCode: '570000'
      },
      createdAt: '2024-12-01T11:15:00Z',
      updatedAt: '2024-12-01T11:15:00Z'
    },
    {
      _id: '3',
      orderNumber: 'ORD20241201003',
      userId: '3',
      userInfo: {
        username: 'user003',
        email: 'user003@example.com',
        phone: '13800138003',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user003'
      },
      items: [
        {
          _id: '4',
          productId: 'prod4',
          productName: '海南特产礼盒',
          productImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
          price: 199,
          quantity: 1,
          subtotal: 199
        }
      ],
      totalAmount: 199,
      status: 'refunded',
      paymentStatus: 'refunded',
      paymentMethod: '微信支付',
      shippingAddress: {
        name: '王五',
        phone: '13800138003',
        address: '海南省文昌市',
        city: '文昌市',
        postalCode: '571300'
      },
      createdAt: '2024-12-01T09:45:00Z',
      updatedAt: '2024-12-01T14:20:00Z',
      paidAt: '2024-12-01T09:50:00Z',
      refundedAt: '2024-12-01T14:20:00Z',
      refundReason: '客户取消订单'
    }
  ];

  const mockRefundRequests: RefundRequest[] = [
    {
      _id: '1',
      orderId: '3',
      orderNumber: 'ORD20241201003',
      userId: '3',
      userInfo: {
        username: 'user003',
        email: 'user003@example.com'
      },
      amount: 199,
      reason: '客户取消订单',
      status: 'approved',
      createdAt: '2024-12-01T14:15:00Z',
      updatedAt: '2024-12-01T14:20:00Z',
      processedAt: '2024-12-01T14:20:00Z',
      processedBy: 'admin',
      notes: '已退款到原支付账户'
    },
    {
      _id: '2',
      orderId: '4',
      orderNumber: 'ORD20241201004',
      userId: '4',
      userInfo: {
        username: 'user004',
        email: 'user004@example.com'
      },
      amount: 299,
      reason: '商品质量问题',
      status: 'pending',
      createdAt: '2024-12-01T15:30:00Z',
      updatedAt: '2024-12-01T15:30:00Z'
    }
  ];

  // 销售统计数据
  const salesData = [
    { date: '2024-11-25', orders: 45, revenue: 12500 },
    { date: '2024-11-26', orders: 52, revenue: 15800 },
    { date: '2024-11-27', orders: 38, revenue: 9800 },
    { date: '2024-11-28', orders: 61, revenue: 18200 },
    { date: '2024-11-29', orders: 47, revenue: 13500 },
    { date: '2024-11-30', orders: 55, revenue: 16200 },
    { date: '2024-12-01', orders: 42, revenue: 12800 }
  ];

  useEffect(() => {
    fetchOrders();
    fetchRefundRequests();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // TODO: 调用API获取订单列表
      setOrders(mockOrders);
    } catch (error) {
      message.error('获取订单列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchRefundRequests = async () => {
    try {
      // TODO: 调用API获取退款申请列表
      setRefundRequests(mockRefundRequests);
    } catch (error) {
      message.error('获取退款申请列表失败');
    }
  };

  const handleView = (record: Order) => {
    setSelectedOrder(record);
    setDrawerVisible(true);
  };

  const handleEdit = (record: Order) => {
    setEditingOrder(record);
    form.setFieldsValue({
      status: record.status,
      notes: record.notes
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      // TODO: 调用API删除订单
      message.success('删除成功');
      fetchOrders();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      // TODO: 调用API更新订单状态
      message.success('状态更新成功');
      fetchOrders();
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  const handleRefundApproval = async (id: string, approved: boolean) => {
    try {
      // TODO: 调用API处理退款申请
      message.success(approved ? '退款申请已通过' : '退款申请已拒绝');
      fetchRefundRequests();
    } catch (error) {
      message.error('处理失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingOrder) {
        // TODO: 调用API更新订单
        message.success('更新成功');
      }
      setModalVisible(false);
      fetchOrders();
    } catch (error) {
      message.error('更新失败');
    }
  };

  const handleExport = () => {
    // TODO: 实现订单数据导出功能
    message.success('数据导出成功');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'paid': return 'blue';
      case 'shipped': return 'purple';
      case 'delivered': return 'green';
      case 'cancelled': return 'red';
      case 'refunded': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待付款';
      case 'paid': return '已付款';
      case 'shipped': return '已发货';
      case 'delivered': return '已送达';
      case 'cancelled': return '已取消';
      case 'refunded': return '已退款';
      default: return '未知';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'paid': return 'green';
      case 'failed': return 'red';
      case 'refunded': return 'red';
      default: return 'default';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待支付';
      case 'paid': return '已支付';
      case 'failed': return '支付失败';
      case 'refunded': return '已退款';
      default: return '未知';
    }
  };

  const getRefundStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'approved': return 'green';
      case 'rejected': return 'red';
      default: return 'default';
    }
  };

  const getRefundStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待审核';
      case 'approved': return '已通过';
      case 'rejected': return '已拒绝';
      default: return '未知';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchText.toLowerCase()) ||
                         order.userInfo.username.toLowerCase().includes(searchText.toLowerCase()) ||
                         order.userInfo.email.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPaymentStatus = paymentStatusFilter === 'all' || order.paymentStatus === paymentStatusFilter;
    const matchesDateRange = !dateRange || (
      new Date(order.createdAt) >= new Date(dateRange[0]) &&
      new Date(order.createdAt) <= new Date(dateRange[1])
    );
    return matchesSearch && matchesStatus && matchesPaymentStatus && matchesDateRange;
  });

  const filteredRefundRequests = refundRequests.filter(request => {
    const matchesSearch = request.orderNumber.toLowerCase().includes(searchText.toLowerCase()) ||
                         request.userInfo.username.toLowerCase().includes(searchText.toLowerCase());
    return matchesSearch;
  });

  const orderColumns = [
    {
      title: '订单信息',
      key: 'orderInfo',
      render: (record: Order) => (
        <Space>
          <Avatar src={record.userInfo.avatar} icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 'bold' }}>{record.orderNumber}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.userInfo.username}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '商品信息',
      key: 'items',
      render: (record: Order) => (
        <div>
          {record.items.map((item, index) => (
            <div key={item._id} style={{ marginBottom: index < record.items.length - 1 ? 4 : 0 }}>
              <div style={{ fontSize: '12px' }}>{item.productName}</div>
              <div style={{ fontSize: '10px', color: '#666' }}>
                ¥{item.price} × {item.quantity}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: '总金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => `¥${amount.toFixed(2)}`
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge 
          status={status === 'delivered' ? 'success' : 
                  status === 'shipped' ? 'processing' : 
                  status === 'paid' ? 'default' : 
                  status === 'pending' ? 'warning' : 'error'} 
          text={getStatusText(status)} 
        />
      )
    },
    {
      title: '支付状态',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status: string) => (
        <Badge 
          status={status === 'paid' ? 'success' : 
                  status === 'pending' ? 'warning' : 'error'} 
          text={getPaymentStatusText(status)} 
        />
      )
    },
    {
      title: '支付方式',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method: string) => <Tag color="blue">{method}</Tag>
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Order) => (
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
          {record.status === 'pending' && (
            <>
              <Tooltip title="标记已付款">
                <Button 
                  type="link" 
                  icon={<CheckOutlined />}
                  onClick={() => handleStatusChange(record._id, 'paid')}
                />
              </Tooltip>
              <Tooltip title="取消订单">
                <Button 
                  type="link" 
                  icon={<CloseOutlined />}
                  onClick={() => handleStatusChange(record._id, 'cancelled')}
                />
              </Tooltip>
            </>
          )}
          {record.status === 'paid' && (
            <Tooltip title="标记已发货">
              <Button 
                type="link" 
                icon={<CheckOutlined />}
                onClick={() => handleStatusChange(record._id, 'shipped')}
              />
            </Tooltip>
          )}
          {record.status === 'shipped' && (
            <Tooltip title="标记已送达">
              <Button 
                type="link" 
                icon={<CheckOutlined />}
                onClick={() => handleStatusChange(record._id, 'delivered')}
              />
            </Tooltip>
          )}
          <Popconfirm
            title="确定要删除这个订单吗？"
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

  const refundColumns = [
    {
      title: '退款信息',
      key: 'refundInfo',
      render: (record: RefundRequest) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 'bold' }}>{record.orderNumber}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.userInfo.username}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '退款金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `¥${amount.toFixed(2)}`
    },
    {
      title: '退款原因',
      dataIndex: 'reason',
      key: 'reason',
      render: (reason: string) => <div style={{ maxWidth: 200 }}>{reason}</div>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge 
          status={status === 'approved' ? 'success' : 
                  status === 'pending' ? 'warning' : 'error'} 
          text={getRefundStatusText(status)} 
        />
      )
    },
    {
      title: '申请时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: RefundRequest) => (
        <Space>
          {record.status === 'pending' && (
            <>
              <Tooltip title="通过">
                <Button 
                  type="link" 
                  icon={<CheckOutlined />}
                  onClick={() => handleRefundApproval(record._id, true)}
                />
              </Tooltip>
              <Tooltip title="拒绝">
                <Button 
                  type="link" 
                  icon={<CloseOutlined />}
                  onClick={() => handleRefundApproval(record._id, false)}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card 
        title="订单管理" 
        extra={
          <Space>
            <Button icon={<ExportOutlined />} onClick={handleExport}>
              导出
            </Button>
            <Button type="primary" icon={<PlusOutlined />}>
              新建订单
            </Button>
          </Space>
        }
      >
        <Tabs defaultActiveKey="orders">
          <TabPane tab="订单管理" key="orders">
            {/* 搜索和筛选 */}
            <div style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={6}>
                  <Input
                    placeholder="搜索订单号、用户名或邮箱"
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </Col>
                <Col span={4}>
                  <Select
                    placeholder="订单状态"
                    value={statusFilter}
                    onChange={setStatusFilter}
                    style={{ width: '100%' }}
                  >
                    <Option value="all">全部状态</Option>
                    <Option value="pending">待付款</Option>
                    <Option value="paid">已付款</Option>
                    <Option value="shipped">已发货</Option>
                    <Option value="delivered">已送达</Option>
                    <Option value="cancelled">已取消</Option>
                    <Option value="refunded">已退款</Option>
                  </Select>
                </Col>
                <Col span={4}>
                  <Select
                    placeholder="支付状态"
                    value={paymentStatusFilter}
                    onChange={setPaymentStatusFilter}
                    style={{ width: '100%' }}
                  >
                    <Option value="all">全部状态</Option>
                    <Option value="pending">待支付</Option>
                    <Option value="paid">已支付</Option>
                    <Option value="failed">支付失败</Option>
                    <Option value="refunded">已退款</Option>
                  </Select>
                </Col>
                <Col span={6}>
                  <RangePicker
                    placeholder={['开始日期', '结束日期']}
                    onChange={(dates) => {
                      if (dates) {
                        setDateRange([dates[0]!.toISOString(), dates[1]!.toISOString()]);
                      } else {
                        setDateRange(null);
                      }
                    }}
                    style={{ width: '100%' }}
                  />
                </Col>
              </Row>
            </div>

            <Table
              columns={orderColumns}
              dataSource={filteredOrders}
              rowKey="_id"
              loading={loading}
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
            />
          </TabPane>

          <TabPane tab="退款管理" key="refunds">
            {/* 搜索和筛选 */}
            <div style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={6}>
                  <Input
                    placeholder="搜索订单号或用户名"
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </Col>
              </Row>
            </div>

            <Table
              columns={refundColumns}
              dataSource={filteredRefundRequests}
              rowKey="_id"
              loading={loading}
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
            />
          </TabPane>

          <TabPane tab="销售统计" key="statistics">
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={6}>
                <Statistic title="今日订单" value={42} prefix={<ShoppingOutlined />} />
              </Col>
              <Col span={6}>
                <Statistic title="今日收入" value={12800} prefix={<DollarOutlined />} />
              </Col>
              <Col span={6}>
                <Statistic title="本月订单" value={1247} prefix={<ShoppingOutlined />} />
              </Col>
              <Col span={6}>
                <Statistic title="本月收入" value={356800} prefix={<DollarOutlined />} />
              </Col>
            </Row>

            <div style={{ marginTop: 24 }}>
              <h4>销售趋势</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip />
                  <Line type="monotone" dataKey="orders" stroke="#8884d8" name="订单数" />
                  <Line type="monotone" dataKey="revenue" stroke="#82ca9d" name="收入" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabPane>
        </Tabs>
      </Card>

      {/* 订单详情抽屉 */}
      <Drawer
        title="订单详情"
        placement="right"
        width={600}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {selectedOrder && (
          <div>
            <Tabs defaultActiveKey="basic">
              <TabPane tab="基本信息" key="basic">
                <Descriptions column={1} bordered>
                  <Descriptions.Item label="订单号">{selectedOrder.orderNumber}</Descriptions.Item>
                  <Descriptions.Item label="用户信息">
                    <Space>
                      <Avatar src={selectedOrder.userInfo.avatar} icon={<UserOutlined />} />
                      <div>
                        <div>{selectedOrder.userInfo.username}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{selectedOrder.userInfo.email}</div>
                      </div>
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="联系电话">{selectedOrder.userInfo.phone}</Descriptions.Item>
                  <Descriptions.Item label="订单状态">
                    <Badge 
                      status={selectedOrder.status === 'delivered' ? 'success' : 
                              selectedOrder.status === 'shipped' ? 'processing' : 
                              selectedOrder.status === 'paid' ? 'default' : 
                              selectedOrder.status === 'pending' ? 'warning' : 'error'} 
                      text={getStatusText(selectedOrder.status)} 
                    />
                  </Descriptions.Item>
                  <Descriptions.Item label="支付状态">
                    <Badge 
                      status={selectedOrder.paymentStatus === 'paid' ? 'success' : 
                              selectedOrder.paymentStatus === 'pending' ? 'warning' : 'error'} 
                      text={getPaymentStatusText(selectedOrder.paymentStatus)} 
                    />
                  </Descriptions.Item>
                  <Descriptions.Item label="支付方式">{selectedOrder.paymentMethod}</Descriptions.Item>
                  <Descriptions.Item label="总金额">¥{selectedOrder.totalAmount.toFixed(2)}</Descriptions.Item>
                  <Descriptions.Item label="创建时间">{new Date(selectedOrder.createdAt).toLocaleString()}</Descriptions.Item>
                  {selectedOrder.paidAt && (
                    <Descriptions.Item label="付款时间">{new Date(selectedOrder.paidAt).toLocaleString()}</Descriptions.Item>
                  )}
                  {selectedOrder.shippedAt && (
                    <Descriptions.Item label="发货时间">{new Date(selectedOrder.shippedAt).toLocaleString()}</Descriptions.Item>
                  )}
                  {selectedOrder.deliveredAt && (
                    <Descriptions.Item label="送达时间">{new Date(selectedOrder.deliveredAt).toLocaleString()}</Descriptions.Item>
                  )}
                  {selectedOrder.cancelledAt && (
                    <Descriptions.Item label="取消时间">{new Date(selectedOrder.cancelledAt).toLocaleString()}</Descriptions.Item>
                  )}
                  {selectedOrder.refundedAt && (
                    <Descriptions.Item label="退款时间">{new Date(selectedOrder.refundedAt).toLocaleString()}</Descriptions.Item>
                  )}
                  {selectedOrder.notes && (
                    <Descriptions.Item label="备注">{selectedOrder.notes}</Descriptions.Item>
                  )}
                  {selectedOrder.refundReason && (
                    <Descriptions.Item label="退款原因">{selectedOrder.refundReason}</Descriptions.Item>
                  )}
                </Descriptions>
              </TabPane>
              
              <TabPane tab="商品信息" key="items">
                <List
                  dataSource={selectedOrder.items}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Image width={60} height={40} src={item.productImage} />}
                        title={item.productName}
                        description={`¥${item.price} × ${item.quantity}`}
                      />
                      <div>¥{item.subtotal.toFixed(2)}</div>
                    </List.Item>
                  )}
                />
              </TabPane>
              
              <TabPane tab="收货地址" key="address">
                <Descriptions column={1} bordered>
                  <Descriptions.Item label="收货人">{selectedOrder.shippingAddress.name}</Descriptions.Item>
                  <Descriptions.Item label="联系电话">{selectedOrder.shippingAddress.phone}</Descriptions.Item>
                  <Descriptions.Item label="详细地址">{selectedOrder.shippingAddress.address}</Descriptions.Item>
                  <Descriptions.Item label="城市">{selectedOrder.shippingAddress.city}</Descriptions.Item>
                  <Descriptions.Item label="邮政编码">{selectedOrder.shippingAddress.postalCode}</Descriptions.Item>
                </Descriptions>
              </TabPane>
              
              <TabPane tab="操作记录" key="timeline">
                <Timeline>
                  <Timeline.Item>
                    <p>订单创建</p>
                    <p style={{ fontSize: '12px', color: '#666' }}>
                      {new Date(selectedOrder.createdAt).toLocaleString()}
                    </p>
                  </Timeline.Item>
                  {selectedOrder.paidAt && (
                    <Timeline.Item>
                      <p>订单付款</p>
                      <p style={{ fontSize: '12px', color: '#666' }}>
                        {new Date(selectedOrder.paidAt).toLocaleString()}
                      </p>
                    </Timeline.Item>
                  )}
                  {selectedOrder.shippedAt && (
                    <Timeline.Item>
                      <p>订单发货</p>
                      <p style={{ fontSize: '12px', color: '#666' }}>
                        {new Date(selectedOrder.shippedAt).toLocaleString()}
                      </p>
                    </Timeline.Item>
                  )}
                  {selectedOrder.deliveredAt && (
                    <Timeline.Item>
                      <p>订单送达</p>
                      <p style={{ fontSize: '12px', color: '#666' }}>
                        {new Date(selectedOrder.deliveredAt).toLocaleString()}
                      </p>
                    </Timeline.Item>
                  )}
                  {selectedOrder.cancelledAt && (
                    <Timeline.Item>
                      <p>订单取消</p>
                      <p style={{ fontSize: '12px', color: '#666' }}>
                        {new Date(selectedOrder.cancelledAt).toLocaleString()}
                      </p>
                    </Timeline.Item>
                  )}
                  {selectedOrder.refundedAt && (
                    <Timeline.Item>
                      <p>订单退款</p>
                      <p style={{ fontSize: '12px', color: '#666' }}>
                        {new Date(selectedOrder.refundedAt).toLocaleString()}
                      </p>
                    </Timeline.Item>
                  )}
                </Timeline>
              </TabPane>
            </Tabs>
          </div>
        )}
      </Drawer>

      {/* 编辑订单模态框 */}
      <Modal
        title="编辑订单"
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
            name="status"
            label="订单状态"
            rules={[{ required: true, message: '请选择订单状态' }]}
          >
            <Select placeholder="请选择订单状态">
              <Option value="pending">待付款</Option>
              <Option value="paid">已付款</Option>
              <Option value="shipped">已发货</Option>
              <Option value="delivered">已送达</Option>
              <Option value="cancelled">已取消</Option>
              <Option value="refunded">已退款</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="notes"
            label="备注"
          >
            <TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                更新
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

export default AdminOrdersPage; 