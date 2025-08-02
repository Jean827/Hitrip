import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  InputNumber, 
  Button, 
  Table, 
  Progress, 
  message,
  Space,
  Row,
  Col,
  Typography,
  Alert,
  Divider,
  Tag,
  Modal,
  Upload,
  Tooltip
} from 'antd';
import { 
  PlusOutlined, 
  DownloadOutlined, 
  UploadOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface CouponTemplate {
  id: string;
  name: string;
  type: 'discount' | 'fullReduction' | 'freeShipping' | 'points';
  value: number;
  minAmount: number;
  maxDiscount?: number;
  description: string;
}

interface BatchGenerationConfig {
  templateId: string;
  quantity: number;
  prefix: string;
  length: number;
  validFrom: Date;
  validTo: Date;
  userGroups: string[];
  applicableProducts: string[];
  applicableCategories: string[];
  usageLimit: number;
  perUserLimit: number;
  description: string;
}

interface GeneratedCoupon {
  id: string;
  code: string;
  type: string;
  value: number;
  minAmount: number;
  validFrom: Date;
  validTo: Date;
  status: 'active' | 'inactive' | 'used' | 'expired';
  usageCount: number;
  createdAt: Date;
}

interface CouponBatchGeneratorProps {
  onBatchGenerated?: (coupons: GeneratedCoupon[]) => void;
  onExport?: (coupons: GeneratedCoupon[], format: string) => void;
}

const CouponBatchGenerator: React.FC<CouponBatchGeneratorProps> = ({
  onBatchGenerated,
  onExport
}) => {
  const [form] = Form.useForm();
  const [templates, setTemplates] = useState<CouponTemplate[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generatedCoupons, setGeneratedCoupons] = useState<GeneratedCoupon[]>([]);
  const [progress, setProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<GeneratedCoupon[]>([]);

  // 模拟优惠券模板数据
  useEffect(() => {
    const mockTemplates: CouponTemplate[] = [
      {
        id: '1',
        name: '新用户9折券',
        type: 'discount',
        value: 0.9,
        minAmount: 100,
        maxDiscount: 50,
        description: '新用户专享9折优惠'
      },
      {
        id: '2',
        name: '满200减30券',
        type: 'fullReduction',
        value: 30,
        minAmount: 200,
        description: '满200减30优惠券'
      },
      {
        id: '3',
        name: '免邮券',
        type: 'freeShipping',
        value: 0,
        minAmount: 0,
        description: '全场免邮优惠券'
      },
      {
        id: '4',
        name: '积分翻倍券',
        type: 'points',
        value: 2,
        minAmount: 50,
        description: '购物获得双倍积分'
      }
    ];
    setTemplates(mockTemplates);
  }, []);

  // 生成优惠券代码
  const generateCouponCode = (prefix: string, length: number): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = prefix;
    for (let i = 0; i < length - prefix.length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // 批量生成优惠券
  const handleBatchGenerate = async (values: BatchGenerationConfig) => {
    setGenerating(true);
    setProgress(0);

    const template = templates.find(t => t.id === values.templateId);
    if (!template) {
      message.error('请选择优惠券模板');
      setGenerating(false);
      return;
    }

    const coupons: GeneratedCoupon[] = [];
    const batchSize = 100; // 每批处理100个
    const totalBatches = Math.ceil(values.quantity / batchSize);

    for (let batch = 0; batch < totalBatches; batch++) {
      const currentBatchSize = Math.min(batchSize, values.quantity - batch * batchSize);
      
      // 模拟批量处理
      await new Promise(resolve => setTimeout(resolve, 100));

      for (let i = 0; i < currentBatchSize; i++) {
        const coupon: GeneratedCoupon = {
          id: Date.now().toString() + i,
          code: generateCouponCode(values.prefix, values.length),
          type: template.type,
          value: template.value,
          minAmount: template.minAmount,
          validFrom: values.validFrom,
          validTo: values.validTo,
          status: 'active',
          usageCount: 0,
          createdAt: new Date()
        };
        coupons.push(coupon);
      }

      setProgress(((batch + 1) / totalBatches) * 100);
    }

    setGeneratedCoupons(coupons);
    setGenerating(false);
    setProgress(100);
    
    message.success(`成功生成 ${coupons.length} 张优惠券`);
    onBatchGenerated?.(coupons);
  };

  // 预览生成结果
  const handlePreview = async (values: BatchGenerationConfig) => {
    const template = templates.find(t => t.id === values.templateId);
    if (!template) {
      message.error('请选择优惠券模板');
      return;
    }

    const previewCoupons: GeneratedCoupon[] = [];
    for (let i = 0; i < Math.min(10, values.quantity); i++) {
      const coupon: GeneratedCoupon = {
        id: `preview-${i}`,
        code: generateCouponCode(values.prefix, values.length),
        type: template.type,
        value: template.value,
        minAmount: template.minAmount,
        validFrom: values.validFrom,
        validTo: values.validTo,
        status: 'active',
        usageCount: 0,
        createdAt: new Date()
      };
      previewCoupons.push(coupon);
    }

    setPreviewData(previewCoupons);
    setShowPreview(true);
  };

  // 导出优惠券
  const handleExport = (format: string) => {
    if (generatedCoupons.length === 0) {
      message.warning('没有可导出的优惠券');
      return;
    }

    onExport?.(generatedCoupons, format);
    message.success(`优惠券已导出为${format}格式`);
  };

  // 获取类型颜色
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      discount: 'blue',
      fullReduction: 'green',
      freeShipping: 'purple',
      points: 'orange'
    };
    return colors[type] || 'default';
  };

  // 获取类型文本
  const getTypeText = (type: string) => {
    const texts: Record<string, string> = {
      discount: '折扣',
      fullReduction: '满减',
      freeShipping: '免邮',
      points: '积分'
    };
    return texts[type] || type;
  };

  const columns = [
    {
      title: '优惠券代码',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => (
        <Text code style={{ fontSize: '14px' }}>
          {code}
        </Text>
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
      title: '面值',
      dataIndex: 'value',
      key: 'value',
      render: (value: number, record: GeneratedCoupon) => {
        switch (record.type) {
          case 'discount':
            return `${(value * 10).toFixed(1)}折`;
          case 'fullReduction':
            return `¥${value}`;
          case 'freeShipping':
            return '免邮';
          case 'points':
            return `${value}倍积分`;
          default:
            return value;
        }
      }
    },
    {
      title: '最低消费',
      dataIndex: 'minAmount',
      key: 'minAmount',
      render: (amount: number) => `¥${amount}`
    },
    {
      title: '有效期',
      key: 'validity',
      render: (_, record: GeneratedCoupon) => (
        <div>
          <div>{record.validFrom.toLocaleDateString()}</div>
          <div>至</div>
          <div>{record.validTo.toLocaleDateString()}</div>
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '有效' : '无效'}
        </Tag>
      )
    },
    {
      title: '使用次数',
      dataIndex: 'usageCount',
      key: 'usageCount',
      render: (count: number) => count
    }
  ];

  return (
    <div>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FileTextOutlined style={{ marginRight: 8 }} />
            <Title level={4} style={{ margin: 0 }}>
              优惠券批量生成
            </Title>
          </div>
        }
      >
        <Alert
          message="批量生成说明"
          description="支持批量生成多种类型的优惠券，可设置生成数量、有效期、使用限制等参数。生成的优惠券可以导出为CSV或Excel格式。"
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleBatchGenerate}
          initialValues={{
            quantity: 100,
            prefix: 'COUPON',
            length: 12,
            usageLimit: 0,
            perUserLimit: 1
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="templateId"
                label="优惠券模板"
                rules={[{ required: true, message: '请选择优惠券模板' }]}
              >
                <Select placeholder="请选择优惠券模板">
                  {templates.map(template => (
                    <Option key={template.id} value={template.id}>
                      <div>
                        <div>{template.name}</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {template.description}
                        </Text>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="quantity"
                label="生成数量"
                rules={[{ required: true, message: '请输入生成数量' }]}
              >
                <InputNumber
                  min={1}
                  max={10000}
                  placeholder="生成数量"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="prefix"
                label="代码前缀"
                rules={[{ required: true, message: '请输入代码前缀' }]}
              >
                <Input placeholder="如：COUPON" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="length"
                label="代码长度"
                rules={[{ required: true, message: '请输入代码长度' }]}
              >
                <InputNumber
                  min={8}
                  max={20}
                  placeholder="代码长度"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="validFrom"
                label="生效时间"
                rules={[{ required: true, message: '请选择生效时间' }]}
              >
                <DatePicker
                  showTime
                  placeholder="生效时间"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="validTo"
                label="失效时间"
                rules={[{ required: true, message: '请选择失效时间' }]}
              >
                <DatePicker
                  showTime
                  placeholder="失效时间"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="userGroups"
                label="适用用户群"
              >
                <Select
                  mode="multiple"
                  placeholder="选择适用用户群"
                  allowClear
                >
                  <Option value="all">所有用户</Option>
                  <Option value="new">新用户</Option>
                  <Option value="vip">VIP用户</Option>
                  <Option value="regular">普通用户</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
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
            <Col span={8}>
              <Form.Item
                name="perUserLimit"
                label="每人使用限制"
              >
                <InputNumber
                  min={1}
                  placeholder="每人使用限制"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="description"
                label="备注"
              >
                <Input placeholder="优惠券备注" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                htmlType="submit"
                loading={generating}
              >
                开始生成
              </Button>
              <Button 
                icon={<InfoCircleOutlined />}
                onClick={() => form.validateFields().then(handlePreview)}
              >
                预览
              </Button>
            </Space>
          </Form.Item>
        </Form>

        {generating && (
          <div style={{ marginTop: 16 }}>
            <Progress percent={progress} status="active" />
            <Text type="secondary">正在生成优惠券，请稍候...</Text>
          </div>
        )}

        {generatedCoupons.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <Divider>生成结果</Divider>
            
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Text>共生成 {generatedCoupons.length} 张优惠券</Text>
                <Button 
                  icon={<DownloadOutlined />}
                  onClick={() => handleExport('csv')}
                >
                  导出CSV
                </Button>
                <Button 
                  icon={<DownloadOutlined />}
                  onClick={() => handleExport('excel')}
                >
                  导出Excel
                </Button>
              </Space>
            </div>

            <Table
              columns={columns}
              dataSource={generatedCoupons.slice(0, 20)} // 只显示前20条
              rowKey="id"
              pagination={false}
              size="small"
            />

            {generatedCoupons.length > 20 && (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Text type="secondary">
                  仅显示前20条记录，完整数据请导出查看
                </Text>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* 预览模态框 */}
      <Modal
        title="生成预览"
        open={showPreview}
        onCancel={() => setShowPreview(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowPreview(false)}>
            取消
          </Button>,
          <Button 
            key="generate" 
            type="primary"
            onClick={() => {
              setShowPreview(false);
              form.submit();
            }}
          >
            确认生成
          </Button>
        ]}
        width={800}
      >
        <Alert
          message="预览信息"
          description="以下是即将生成的优惠券预览，确认无误后点击确认生成。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Table
          columns={columns}
          dataSource={previewData}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Modal>
    </div>
  );
};

export default CouponBatchGenerator; 