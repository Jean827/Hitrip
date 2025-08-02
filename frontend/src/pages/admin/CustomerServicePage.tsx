import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Space,
  message,
  Tabs,
  Badge,
  Statistic,
  Row,
  Col,
  Popconfirm,
  Tooltip,
  InputNumber,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface KnowledgeEntry {
  id: number;
  category: string;
  title: string;
  content: string;
  keywords: string[];
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CustomerTicket {
  id: number;
  userId: number;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: number;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface CustomerServiceStats {
  sessions: Array<{ status: string; count: string }>;
  tickets: Array<{ status: string; count: string }>;
  knowledge: {
    total: number;
    active: number;
    categories: { [key: string]: number };
  };
}

const CustomerServicePage: React.FC = () => {
  const [knowledgeEntries, setKnowledgeEntries] = useState<KnowledgeEntry[]>([]);
  const [tickets, setTickets] = useState<CustomerTicket[]>([]);
  const [stats, setStats] = useState<CustomerServiceStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEntry, setEditingEntry] = useState<KnowledgeEntry | null>(null);
  const [form] = Form.useForm();

  // 获取知识库列表
  const fetchKnowledgeEntries = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/customer-service/knowledge', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setKnowledgeEntries(data.data.items);
      }
    } catch (error) {
      console.error('获取知识库失败:', error);
      message.error('获取知识库失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取工单列表
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/customer-service/tickets', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTickets(data.data.items);
      }
    } catch (error) {
      console.error('获取工单失败:', error);
      message.error('获取工单失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取统计信息
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/customer-service/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('获取统计信息失败:', error);
    }
  };

  useEffect(() => {
    fetchKnowledgeEntries();
    fetchTickets();
    fetchStats();
  }, []);

  // 知识库表单提交
  const handleKnowledgeSubmit = async (values: any) => {
    try {
      const token = localStorage.getItem('token');
      const url = editingEntry 
        ? `/api/customer-service/knowledge/${editingEntry.id}`
        : '/api/customer-service/knowledge';
      
      const response = await fetch(url, {
        method: editingEntry ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        message.success(editingEntry ? '更新成功' : '添加成功');
        setModalVisible(false);
        setEditingEntry(null);
        form.resetFields();
        fetchKnowledgeEntries();
      } else {
        throw new Error('操作失败');
      }
    } catch (error) {
      console.error('操作失败:', error);
      message.error('操作失败');
    }
  };

  // 删除知识库条目
  const handleDeleteKnowledge = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/customer-service/knowledge/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        message.success('删除成功');
        fetchKnowledgeEntries();
      } else {
        throw new Error('删除失败');
      }
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败');
    }
  };

  // 更新工单状态
  const handleUpdateTicketStatus = async (id: number, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/customer-service/tickets/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        message.success('状态更新成功');
        fetchTickets();
      } else {
        throw new Error('状态更新失败');
      }
    } catch (error) {
      console.error('状态更新失败:', error);
      message.error('状态更新失败');
    }
  };

  // 知识库表格列定义
  const knowledgeColumns = [
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '关键词',
      dataIndex: 'keywords',
      key: 'keywords',
      render: (keywords: string[]) => (
        <Space wrap>
          {keywords?.map((keyword, index) => (
            <Tag key={index} color="green">{keyword}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Badge 
          status={isActive ? 'success' : 'default'} 
          text={isActive ? '激活' : '禁用'} 
        />
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: KnowledgeEntry) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingEntry(record);
              form.setFieldsValue(record);
              setModalVisible(true);
            }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个条目吗？"
            onConfirm={() => handleDeleteKnowledge(record.id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 工单表格列定义
  const ticketColumns = [
    {
      title: '工单号',
      dataIndex: 'id',
      key: 'id',
      render: (id: number) => `#${id}`,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => {
        const colors = {
          low: 'green',
          medium: 'orange',
          high: 'red',
          urgent: 'purple',
        };
        return <Tag color={colors[priority as keyof typeof colors]}>{priority.toUpperCase()}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          open: { color: 'red', icon: <ExclamationCircleOutlined />, text: '待处理' },
          in_progress: { color: 'orange', icon: <ClockCircleOutlined />, text: '处理中' },
          resolved: { color: 'green', icon: <CheckCircleOutlined />, text: '已解决' },
          closed: { color: 'default', icon: null, text: '已关闭' },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return (
          <Badge 
            status={config.color as any} 
            text={config.text}
            icon={config.icon}
          />
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: CustomerTicket) => (
        <Space>
          <Tooltip title="查看详情">
            <Button type="link" icon={<EyeOutlined />}>
              查看
            </Button>
          </Tooltip>
          {record.status === 'open' && (
            <Button
              type="link"
              onClick={() => handleUpdateTicketStatus(record.id, 'in_progress')}
            >
              开始处理
            </Button>
          )}
          {record.status === 'in_progress' && (
            <Button
              type="link"
              onClick={() => handleUpdateTicketStatus(record.id, 'resolved')}
            >
              标记解决
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: '#52c41a',
      medium: '#faad14',
      high: '#ff4d4f',
      urgent: '#722ed1',
    };
    return colors[priority as keyof typeof colors];
  };

  const getStatusColor = (status: string) => {
    const colors = {
      open: '#ff4d4f',
      in_progress: '#faad14',
      resolved: '#52c41a',
      closed: '#d9d9d9',
    };
    return colors[status as keyof typeof colors];
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card title="客服管理系统" style={{ marginBottom: '24px' }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="知识库条目"
              value={stats?.knowledge?.total || 0}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="激活条目"
              value={stats?.knowledge?.active || 0}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="待处理工单"
              value={tickets.filter(t => t.status === 'open').length}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="处理中工单"
              value={tickets.filter(t => t.status === 'in_progress').length}
              valueStyle={{ color: '#faad14' }}
            />
          </Col>
        </Row>
      </Card>

      <Tabs defaultActiveKey="knowledge">
        <TabPane tab="知识库管理" key="knowledge">
          <Card
            title="知识库条目"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingEntry(null);
                  form.resetFields();
                  setModalVisible(true);
                }}
              >
                添加条目
              </Button>
            }
          >
            <Table
              columns={knowledgeColumns}
              dataSource={knowledgeEntries}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
            />
          </Card>
        </TabPane>

        <TabPane tab="工单管理" key="tickets">
          <Card title="工单列表">
            <Table
              columns={ticketColumns}
              dataSource={tickets}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* 知识库编辑模态框 */}
      <Modal
        title={editingEntry ? '编辑知识库条目' : '添加知识库条目'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingEntry(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleKnowledgeSubmit}
          initialValues={{
            isActive: true,
            keywords: [],
            tags: [],
          }}
        >
          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select placeholder="请选择分类">
              <Option value="订单">订单</Option>
              <Option value="退款">退款</Option>
              <Option value="物流">物流</Option>
              <Option value="商品">商品</Option>
              <Option value="账户">账户</Option>
              <Option value="优惠">优惠</Option>
              <Option value="客服">客服</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入标题" />
          </Form.Item>

          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入内容' }]}
          >
            <TextArea
              rows={6}
              placeholder="请输入内容"
              showCount
              maxLength={1000}
            />
          </Form.Item>

          <Form.Item
            name="keywords"
            label="关键词"
          >
            <Select
              mode="tags"
              placeholder="请输入关键词"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="tags"
            label="标签"
          >
            <Select
              mode="tags"
              placeholder="请输入标签"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="状态"
            valuePropName="checked"
          >
            <Select>
              <Option value={true}>激活</Option>
              <Option value={false}>禁用</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingEntry ? '更新' : '添加'}
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                setEditingEntry(null);
                form.resetFields();
              }}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CustomerServicePage; 