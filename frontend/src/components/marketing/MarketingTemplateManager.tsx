import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Switch, 
  InputNumber, 
  Space, 
  Tag, 
  message,
  Popconfirm,
  Tooltip,
  Row,
  Col,
  Typography
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  CopyOutlined,
  EyeOutlined,
  SettingOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface MarketingTemplate {
  id: string;
  name: string;
  type: 'discount' | 'fullReduction' | 'points' | 'freeShipping';
  description: string;
  config: {
    discountRate?: number;
    minAmount?: number;
    maxDiscount?: number;
    pointsMultiplier?: number;
    freeShippingThreshold?: number;
    applicableProducts?: string[];
    applicableCategories?: string[];
    userGroups?: string[];
    usageLimit?: number;
    perUserLimit?: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
  conversionRate: number;
}

interface MarketingTemplateManagerProps {
  onTemplateSelect?: (template: MarketingTemplate) => void;
  onTemplateCreate?: (template: MarketingTemplate) => void;
  onTemplateUpdate?: (template: MarketingTemplate) => void;
  onTemplateDelete?: (templateId: string) => void;
}

const MarketingTemplateManager: React.FC<MarketingTemplateManagerProps> = ({
  onTemplateSelect,
  onTemplateCreate,
  onTemplateUpdate,
  onTemplateDelete
}) => {
  const [templates, setTemplates] = useState<MarketingTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MarketingTemplate | null>(null);
  const [form] = Form.useForm();

  // 模拟数据
  useEffect(() => {
    const mockTemplates: MarketingTemplate[] = [
      {
        id: '1',
        name: '新用户专享折扣',
        type: 'discount',
        description: '新注册用户享受9折优惠',
        config: {
          discountRate: 0.9,
          minAmount: 100,
          maxDiscount: 50,
          applicableProducts: [],
          applicableCategories: ['all'],
          userGroups: ['new'],
          usageLimit: 1000,
          perUserLimit: 1
        },
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
        usageCount: 856,
        conversionRate: 0.23
      },
      {
        id: '2',
        name: '满减活动模板',
        type: 'fullReduction',
        description: '满200减30，满500减100',
        config: {
          minAmount: 200,
          maxDiscount: 100,
          applicableProducts: [],
          applicableCategories: ['all'],
          userGroups: ['all'],
          usageLimit: 5000,
          perUserLimit: 3
        },
        isActive: true,
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-20'),
        usageCount: 2341,
        conversionRate: 0.18
      },
      {
        id: '3',
        name: '积分翻倍活动',
        type: 'points',
        description: '购物获得双倍积分',
        config: {
          pointsMultiplier: 2,
          minAmount: 50,
          applicableProducts: [],
          applicableCategories: ['all'],
          userGroups: ['vip'],
          usageLimit: 2000,
          perUserLimit: 5
        },
        isActive: false,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-25'),
        usageCount: 1234,
        conversionRate: 0.31
      }
    ];
    setTemplates(mockTemplates);
  }, []);

  const handleCreate = () => {
    setEditingTemplate(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (template: MarketingTemplate) => {
    setEditingTemplate(template);
    form.setFieldsValue({
      ...template,
      dateRange: [template.createdAt, template.updatedAt]
    });
    setModalVisible(true);
  };

  const handleDelete = async (templateId: string) => {
    try {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      onTemplateDelete?.(templateId);
      message.success('模板删除成功');
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleCopy = (template: MarketingTemplate) => {
    const newTemplate: MarketingTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} - 副本`,
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0,
      conversionRate: 0
    };
    setTemplates(prev => [...prev, newTemplate]);
    message.success('模板复制成功');
  };

  const handleSubmit = async (values: any) => {
    try {
      const templateData: MarketingTemplate = {
        id: editingTemplate?.id || Date.now().toString(),
        name: values.name,
        type: values.type,
        description: values.description,
        config: {
          discountRate: values.discountRate,
          minAmount: values.minAmount,
          maxDiscount: values.maxDiscount,
          pointsMultiplier: values.pointsMultiplier,
          freeShippingThreshold: values.freeShippingThreshold,
          applicableProducts: values.applicableProducts || [],
          applicableCategories: values.applicableCategories || ['all'],
          userGroups: values.userGroups || ['all'],
          usageLimit: values.usageLimit,
          perUserLimit: values.perUserLimit
        },
        isActive: values.isActive,
        createdAt: editingTemplate?.createdAt || new Date(),
        updatedAt: new Date(),
        usageCount: editingTemplate?.usageCount || 0,
        conversionRate: editingTemplate?.conversionRate || 0
      };

      if (editingTemplate) {
        setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? templateData : t));
        onTemplateUpdate?.(templateData);
        message.success('模板更新成功');
      } else {
        setTemplates(prev => [...prev, templateData]);
        onTemplateCreate?.(templateData);
        message.success('模板创建成功');
      }

      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      discount: 'blue',
      fullReduction: 'green',
      points: 'orange',
      freeShipping: 'purple'
    };
    return colors[type] || 'default';
  };

  const getTypeText = (type: string) => {
    const texts: Record<string, string> = {
      discount: '折扣',
      fullReduction: '满减',
      points: '积分',
      freeShipping: '免邮'
    };
    return texts[type] || type;
  };

  const columns = [
    {
      title: '模板名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: MarketingTemplate) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.description}
          </Text>
        </div>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={getTypeColor(type)}>
          {getTypeText(type)}
        </Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? '启用' : '禁用'}
        </Tag>
      )
    },
    {
      title: '使用次数',
      dataIndex: 'usageCount',
      key: 'usageCount',
      render: (count: number) => count.toLocaleString()
    },
    {
      title: '转化率',
      dataIndex: 'conversionRate',
      key: 'conversionRate',
      render: (rate: number) => `${(rate * 100).toFixed(1)}%`
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: Date) => date.toLocaleDateString()
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record: MarketingTemplate) => (
        <Space>
          <Tooltip title="查看详情">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => onTemplateSelect?.(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="复制">
            <Button 
              type="text" 
              icon={<CopyOutlined />} 
              onClick={() => handleCopy(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个模板吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />} 
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const renderConfigForm = () => {
    const type = form.getFieldValue('type');
    
    switch (type) {
      case 'discount':
        return (
          <>
            <Form.Item
              name="discountRate"
              label="折扣率"
              rules={[{ required: true, message: '请输入折扣率' }]}
            >
              <InputNumber
                min={0}
                max={1}
                step={0.1}
                placeholder="0.9表示9折"
                style={{ width: '100%' }}
              />
            </Form.Item>
            <Form.Item
              name="maxDiscount"
              label="最大优惠金额"
            >
              <InputNumber
                min={0}
                placeholder="最大优惠金额"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </>
        );
      
      case 'fullReduction':
        return (
          <>
            <Form.Item
              name="minAmount"
              label="最低消费金额"
              rules={[{ required: true, message: '请输入最低消费金额' }]}
            >
              <InputNumber
                min={0}
                placeholder="最低消费金额"
                style={{ width: '100%' }}
              />
            </Form.Item>
            <Form.Item
              name="maxDiscount"
              label="优惠金额"
              rules={[{ required: true, message: '请输入优惠金额' }]}
            >
              <InputNumber
                min={0}
                placeholder="优惠金额"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </>
        );
      
      case 'points':
        return (
          <>
            <Form.Item
              name="pointsMultiplier"
              label="积分倍数"
              rules={[{ required: true, message: '请输入积分倍数' }]}
            >
              <InputNumber
                min={1}
                placeholder="积分倍数"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </>
        );
      
      case 'freeShipping':
        return (
          <>
            <Form.Item
              name="freeShippingThreshold"
              label="免邮门槛"
              rules={[{ required: true, message: '请输入免邮门槛' }]}
            >
              <InputNumber
                min={0}
                placeholder="免邮门槛金额"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div>
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ margin: 0 }}>
              <SettingOutlined style={{ marginRight: 8 }} />
              营销活动模板管理
            </Title>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              创建模板
            </Button>
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={templates}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `第 ${range[0]}-${range[1]} 条/共 ${total} 条`
          }}
        />
      </Card>

      <Modal
        title={editingTemplate ? '编辑模板' : '创建模板'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            isActive: true,
            applicableCategories: ['all'],
            userGroups: ['all']
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="模板名称"
                rules={[{ required: true, message: '请输入模板名称' }]}
              >
                <Input placeholder="请输入模板名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="活动类型"
                rules={[{ required: true, message: '请选择活动类型' }]}
              >
                <Select placeholder="请选择活动类型">
                  <Option value="discount">折扣</Option>
                  <Option value="fullReduction">满减</Option>
                  <Option value="points">积分</Option>
                  <Option value="freeShipping">免邮</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="模板描述"
            rules={[{ required: true, message: '请输入模板描述' }]}
          >
            <Input.TextArea rows={3} placeholder="请输入模板描述" />
          </Form.Item>

          {renderConfigForm()}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="usageLimit"
                label="使用次数限制"
              >
                <InputNumber
                  min={0}
                  placeholder="0表示无限制"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="perUserLimit"
                label="每人使用限制"
              >
                <InputNumber
                  min={0}
                  placeholder="0表示无限制"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="isActive"
            label="启用状态"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                {editingTemplate ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MarketingTemplateManager; 