import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, message, Popconfirm, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { TextArea } = Input;

interface Permission {
  _id: string;
  name: string;
  code: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

const AdminPermissionsPage: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [form] = Form.useForm();

  // 模拟数据
  const mockPermissions: Permission[] = [
    {
      _id: '1',
      name: '用户查看',
      code: 'user:read',
      description: '查看用户信息权限',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      _id: '2',
      name: '用户编辑',
      code: 'user:write',
      description: '编辑用户信息权限',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      _id: '3',
      name: '角色查看',
      code: 'role:read',
      description: '查看角色信息权限',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      _id: '4',
      name: '角色编辑',
      code: 'role:write',
      description: '编辑角色信息权限',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      _id: '5',
      name: '权限查看',
      code: 'permission:read',
      description: '查看权限信息权限',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      _id: '6',
      name: '权限编辑',
      code: 'permission:write',
      description: '编辑权限信息权限',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }
  ];

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      // TODO: 调用API获取权限列表
      setPermissions(mockPermissions);
    } catch (error) {
      message.error('获取权限列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPermission(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Permission) => {
    setEditingPermission(record);
    form.setFieldsValue({
      name: record.name,
      code: record.code,
      description: record.description
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      // TODO: 调用API删除权限
      message.success('删除成功');
      fetchPermissions();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingPermission) {
        // TODO: 调用API更新权限
        message.success('更新成功');
      } else {
        // TODO: 调用API创建权限
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchPermissions();
    } catch (error) {
      message.error(editingPermission ? '更新失败' : '创建失败');
    }
  };

  const columns = [
    {
      title: '权限名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '权限编码',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => <Tag color="blue">{code}</Tag>
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => text || '-'
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Permission) => (
        <Space>
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个权限吗？"
            onConfirm={() => handleDelete(record._id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card 
        title="权限管理" 
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建权限
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={permissions}
          rowKey="_id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total: number) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      <Modal
        title={editingPermission ? '编辑权限' : '新建权限'}
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
            name="name"
            label="权限名称"
            rules={[{ required: true, message: '请输入权限名称' }]}
          >
            <Input placeholder="请输入权限名称" />
          </Form.Item>

          <Form.Item
            name="code"
            label="权限编码"
            rules={[
              { required: true, message: '请输入权限编码' },
              { pattern: /^[a-z]+:[a-z]+$/, message: '权限编码格式：模块:操作，如 user:read' }
            ]}
          >
            <Input placeholder="如：user:read" />
          </Form.Item>

          <Form.Item
            name="description"
            label="权限描述"
          >
            <TextArea rows={3} placeholder="请输入权限描述" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingPermission ? '更新' : '创建'}
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

export default AdminPermissionsPage;