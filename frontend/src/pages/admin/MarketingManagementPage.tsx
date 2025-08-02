import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Table, Modal, Form, Input, Select, DatePicker, InputNumber, Switch, Tag, Space, message, Popconfirm, Tabs } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, GiftOutlined, TagOutlined, TrophyOutlined } from '@ant-design/icons';
import { useAuth } from '../../store/slices/authSlice';
import { marketingApi } from '../../services/marketingApi';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

interface Campaign {
  id: string;
  name: string;
  description: string;
  type: 'discount' | 'full_reduction' | 'points' | 'free_shipping';
  startTime: string;
  endTime: string;
  status: 'draft' | 'active' | 'paused' | 'ended';
  budget: number;
  createdBy: string;
  createdAt: string;
}

interface Coupon {
  id: string;
  code: string;
  name: string;
  type: 'discount' | 'full_reduction' | 'free_shipping' | 'points';
  discountValue: number;
  minAmount: number;
  maxDiscount: number;
  startTime: string;
  endTime: string;
  usageLimit: number;
  usedCount: number;
  status: 'active' | 'inactive' | 'expired';
  createdBy: string;
  createdAt: string;
}

interface PointProduct {
  id: string;
  name: string;
  description: string;
  image: string;
  points: number;
  stock: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  category: string;
  exchangeCount: number;
  createdBy: string;
  createdAt: string;
}

const MarketingManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [pointProducts, setPointProducts] = useState<PointProduct[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'campaign' | 'coupon' | 'product'>('campaign');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form] = Form.useForm();

  // 获取活动列表
  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await marketingApi.getCampaigns();
      if (response.success) {
        setCampaigns(response.data.campaigns);
      }
    } catch (error) {
      console.error('获取活动列表失败:', error);
      message.error('获取活动列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取优惠券列表
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await marketingApi.getCoupons();
      if (response.success) {
        setCoupons(response.data.coupons);
      }
    } catch (error) {
      console.error('获取优惠券列表失败:', error);
      message.error('获取优惠券列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取积分商品列表
  const fetchPointProducts = async () => {
    try {
      setLoading(true);
      const response = await marketingApi.getPointProducts();
      if (response.success) {
        setPointProducts(response.data.products);
      }
    } catch (error) {
      console.error('获取积分商品列表失败:', error);
      message.error('获取积分商品列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始化数据
  useEffect(() => {
    fetchCampaigns();
    fetchCoupons();
    fetchPointProducts();
  }, []);

  // 打开创建/编辑模态框
  const openModal = (type: 'campaign' | 'coupon' | 'product', item?: any) => {
    setModalType(type);
    setEditingItem(item);
    setModalVisible(true);
    
    if (item) {
      form.setFieldsValue({
        ...item,
        timeRange: [new Date(item.startTime), new Date(item.endTime)]
      });
    } else {
      form.resetFields();
    }
  };

  // 关闭模态框
  const closeModal = () => {
    setModalVisible(false);
    setEditingItem(null);
    form.resetFields();
  };

  // 提交表单
  const handleSubmit = async (values: any) => {
    try {
      const submitData = {
        ...values,
        startTime: values.timeRange[0].toISOString(),
        endTime: values.timeRange[1].toISOString()
      };
      delete submitData.timeRange;

      if (editingItem) {
        // 更新
        await marketingApi.updateItem(modalType, editingItem.id, submitData);
        message.success('更新成功');
      } else {
        // 创建
        await marketingApi.createItem(modalType, submitData);
        message.success('创建成功');
      }

      closeModal();
      
      // 刷新数据
      switch (modalType) {
        case 'campaign':
          fetchCampaigns();
          break;
        case 'coupon':
          fetchCoupons();
          break;
        case 'product':
          fetchPointProducts();
          break;
      }
    } catch (error) {
      console.error('提交失败:', error);
      message.error('提交失败');
    }
  };

  // 删除项目
  const handleDelete = async (type: 'campaign' | 'coupon' | 'product', id: string) => {
    try {
      await marketingApi.deleteItem(type, id);
      message.success('删除成功');
      
      // 刷新数据
      switch (type) {
        case 'campaign':
          fetchCampaigns();
          break;
        case 'coupon':
          fetchCoupons();
          break;
        case 'product':
          fetchPointProducts();
          break;
      }
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败');
    }
  };

  // 活动列表列定义
  const campaignColumns = [
    {
      title: '活动名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeMap = {
          discount: '折扣',
          full_reduction: '满减',
          points: '积分',
          free_shipping: '免邮'
        };
        return <Tag color="blue">{typeMap[type as keyof typeof typeMap]}</Tag>;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          draft: { text: '草稿', color: 'default' },
          active: { text: '进行中', color: 'green' },
          paused: { text: '暂停', color: 'orange' },
          ended: { text: '已结束', color: 'red' }
        };
        const statusInfo = statusMap[status as keyof typeof statusMap];
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      }
    },
    {
      title: '预算',
      dataIndex: 'budget',
      key: 'budget',
      render: (budget: number) => `¥${budget}`
    },
    {
      title: '时间范围',
      key: 'timeRange',
      render: (record: Campaign) => (
        <span>
          {new Date(record.startTime).toLocaleDateString()} - {new Date(record.endTime).toLocaleDateString()}
        </span>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (record: Campaign) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => openModal('campaign', record)}>
            查看
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => openModal('campaign', record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个活动吗？"
            onConfirm={() => handleDelete('campaign', record.id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // 优惠券列表列定义
  const couponColumns = [
    {
      title: '优惠券代码',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeMap = {
          discount: '折扣',
          full_reduction: '满减',
          free_shipping: '免邮',
          points: '积分'
        };
        return <Tag color="blue">{typeMap[type as keyof typeof typeMap]}</Tag>;
      }
    },
    {
      title: '优惠值',
      dataIndex: 'discountValue',
      key: 'discountValue',
      render: (value: number, record: Coupon) => {
        if (record.type === 'discount') {
          return `${value}%`;
        }
        return `¥${value}`;
      }
    },
    {
      title: '使用限制',
      key: 'usageLimit',
      render: (record: Coupon) => (
        <span>
          {record.usedCount}/{record.usageLimit === -1 ? '无限制' : record.usageLimit}
        </span>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          active: { text: '有效', color: 'green' },
          inactive: { text: '无效', color: 'default' },
          expired: { text: '已过期', color: 'red' }
        };
        const statusInfo = statusMap[status as keyof typeof statusMap];
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (record: Coupon) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => openModal('coupon', record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个优惠券吗？"
            onConfirm={() => handleDelete('coupon', record.id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // 积分商品列表列定义
  const productColumns = [
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '所需积分',
      dataIndex: 'points',
      key: 'points',
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
    },
    {
      title: '兑换次数',
      dataIndex: 'exchangeCount',
      key: 'exchangeCount',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          active: { text: '上架', color: 'green' },
          inactive: { text: '下架', color: 'default' },
          out_of_stock: { text: '缺货', color: 'red' }
        };
        const statusInfo = statusMap[status as keyof typeof statusMap];
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (record: PointProduct) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => openModal('product', record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个积分商品吗？"
            onConfirm={() => handleDelete('product', record.id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // 渲染表单
  const renderForm = () => {
    const commonFields = (
      <>
        <Form.Item
          name="name"
          label="名称"
          rules={[{ required: true, message: '请输入名称' }]}
        >
          <Input placeholder="请输入名称" />
        </Form.Item>
        
        <Form.Item
          name="description"
          label="描述"
        >
          <TextArea rows={3} placeholder="请输入描述" />
        </Form.Item>
      </>
    );

    switch (modalType) {
      case 'campaign':
        return (
          <>
            {commonFields}
            <Form.Item
              name="type"
              label="活动类型"
              rules={[{ required: true, message: '请选择活动类型' }]}
            >
              <Select placeholder="请选择活动类型">
                <Option value="discount">折扣</Option>
                <Option value="full_reduction">满减</Option>
                <Option value="points">积分</Option>
                <Option value="free_shipping">免邮</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="timeRange"
              label="时间范围"
              rules={[{ required: true, message: '请选择时间范围' }]}
            >
              <RangePicker showTime style={{ width: '100%' }} />
            </Form.Item>
            
            <Form.Item
              name="budget"
              label="预算"
              rules={[{ required: true, message: '请输入预算' }]}
            >
              <InputNumber
                min={0}
                precision={2}
                style={{ width: '100%' }}
                placeholder="请输入预算"
                prefix="¥"
              />
            </Form.Item>
          </>
        );

      case 'coupon':
        return (
          <>
            {commonFields}
            <Form.Item
              name="code"
              label="优惠券代码"
              rules={[{ required: true, message: '请输入优惠券代码' }]}
            >
              <Input placeholder="请输入优惠券代码" />
            </Form.Item>
            
            <Form.Item
              name="type"
              label="优惠券类型"
              rules={[{ required: true, message: '请选择优惠券类型' }]}
            >
              <Select placeholder="请选择优惠券类型">
                <Option value="discount">折扣</Option>
                <Option value="full_reduction">满减</Option>
                <Option value="free_shipping">免邮</Option>
                <Option value="points">积分</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="discountValue"
              label="优惠值"
              rules={[{ required: true, message: '请输入优惠值' }]}
            >
              <InputNumber
                min={0}
                precision={2}
                style={{ width: '100%' }}
                placeholder="请输入优惠值"
              />
            </Form.Item>
            
            <Form.Item
              name="minAmount"
              label="最低消费"
              rules={[{ required: true, message: '请输入最低消费' }]}
            >
              <InputNumber
                min={0}
                precision={2}
                style={{ width: '100%' }}
                placeholder="请输入最低消费"
                prefix="¥"
              />
            </Form.Item>
            
            <Form.Item
              name="maxDiscount"
              label="最大优惠"
            >
              <InputNumber
                min={0}
                precision={2}
                style={{ width: '100%' }}
                placeholder="请输入最大优惠金额"
                prefix="¥"
              />
            </Form.Item>
            
            <Form.Item
              name="timeRange"
              label="有效期"
              rules={[{ required: true, message: '请选择有效期' }]}
            >
              <RangePicker showTime style={{ width: '100%' }} />
            </Form.Item>
            
            <Form.Item
              name="usageLimit"
              label="使用限制"
            >
              <InputNumber
                min={-1}
                style={{ width: '100%' }}
                placeholder="-1表示无限制"
              />
            </Form.Item>
          </>
        );

      case 'product':
        return (
          <>
            {commonFields}
            <Form.Item
              name="category"
              label="分类"
              rules={[{ required: true, message: '请输入分类' }]}
            >
              <Input placeholder="请输入分类" />
            </Form.Item>
            
            <Form.Item
              name="points"
              label="所需积分"
              rules={[{ required: true, message: '请输入所需积分' }]}
            >
              <InputNumber
                min={1}
                style={{ width: '100%' }}
                placeholder="请输入所需积分"
              />
            </Form.Item>
            
            <Form.Item
              name="stock"
              label="库存"
              rules={[{ required: true, message: '请输入库存' }]}
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                placeholder="请输入库存"
              />
            </Form.Item>
            
            <Form.Item
              name="image"
              label="图片URL"
            >
              <Input placeholder="请输入图片URL" />
            </Form.Item>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="marketing-management">
      <div className="page-header" style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <h1>营销管理</h1>
            <p>管理营销活动、优惠券和积分商城</p>
          </Col>
        </Row>
      </div>

      <Tabs defaultActiveKey="campaigns">
        <TabPane tab={<span><TrophyOutlined />活动管理</span>} key="campaigns">
          <Card
            title="营销活动"
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal('campaign')}>
                创建活动
              </Button>
            }
          >
            <Table
              columns={campaignColumns}
              dataSource={campaigns}
              rowKey="id"
              loading={loading}
              pagination={{
                total: campaigns.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`
              }}
            />
          </Card>
        </TabPane>

        <TabPane tab={<span><TagOutlined />优惠券管理</span>} key="coupons">
          <Card
            title="优惠券"
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal('coupon')}>
                创建优惠券
              </Button>
            }
          >
            <Table
              columns={couponColumns}
              dataSource={coupons}
              rowKey="id"
              loading={loading}
              pagination={{
                total: coupons.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`
              }}
            />
          </Card>
        </TabPane>

        <TabPane tab={<span><GiftOutlined />积分商城</span>} key="products">
          <Card
            title="积分商品"
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal('product')}>
                创建商品
              </Button>
            }
          >
            <Table
              columns={productColumns}
              dataSource={pointProducts}
              rowKey="id"
              loading={loading}
              pagination={{
                total: pointProducts.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`
              }}
            />
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        title={editingItem ? `编辑${modalType === 'campaign' ? '活动' : modalType === 'coupon' ? '优惠券' : '积分商品'}` : `创建${modalType === 'campaign' ? '活动' : modalType === 'coupon' ? '优惠券' : '积分商品'}`}
        open={modalVisible}
        onCancel={closeModal}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          {renderForm()}
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingItem ? '更新' : '创建'}
              </Button>
              <Button onClick={closeModal}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MarketingManagementPage; 