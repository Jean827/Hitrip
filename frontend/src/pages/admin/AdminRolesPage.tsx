import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, message, Popconfirm, Tag, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

interface Role {
  _id: string;
  name: string;
  description?: string;
  permissions: string[];
  menus: string[];
  createdAt: string;
  updatedAt: string;
}

interface Permission {
  _id: string;
  name: string;
  code: string;
  description?: string;
}

const AdminRolesPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form] = Form.useForm();

  // 模拟数据
  const mockRoles: Role[] = [
    {
      _id: '1',
      name: '超级管理员',
      description: '拥有所有权限',
      permissions: ['user:read', 'user:write', 'role:read', 'role:write'],
      menus: ['dashboard', 'users', 'roles', 'permissions'],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      _id: '2',
      name: '普通管理员',
      description: '用户管理权限',
      permissions: ['user:read', 'user:write'],
      menus: ['dashboard', 'users'],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      _id: '3',
      name: '普通用户',
      description: '基础权限',
      permissions: ['user:read'],
      menus: ['dashboard'],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }
  ];

  const mockPermissions: Permission[] = [
    { _id: '1', name: '用户查看', code: 'user:read', description: '查看用户信息' },
    { _id: '2', name: '用户编辑', code: 'user:write', description: '编辑用户信息' },
    { _id: '3', name: '角色查看', code: 'role:read', description: '查看角色信息' },
    { _id: '4', name: '角色编辑', code: 'role:write', description: '编辑角色信息' },
    { _id: '5', name: '权限查看', code: 'permission:read', description: '查看权限信息' },
    { _id: '6', name: '权限编辑', code: 'permission:write', description: '编辑权限信息' }
  ];

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      // TODO: 调用API获取角色列表
      setRoles(mockRoles);
    } catch (error) {
      message.error('获取角色列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      // TODO: 调用API获取权限列表
      setPermissions(mockPermissions);
    } catch (error) {
      message.error('获取权限列表失败');
    }
  };

  const handleCreate = () => {
    setEditingRole(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Role) => {
    setEditingRole(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      permissions: record.permissions,
      menus: record.menus
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      // TODO: 调用API删除角色
      message.success('删除成功');
      fetchRoles();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingRole) {
        // TODO: 调用API更新角色
        message.success('更新成功');
      } else {
        // TODO: 调用API创建角色
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchRoles();
    } catch (error) {
      message.error(editingRole ? '更新失败' : '创建失败');
    }
  };

  const columns = [
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => text || '-'
    },
    {
      title: '权限',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: string[]) => (
        <div>
          {permissions.map(permission => (
            <Tag key={permission} color="blue">{permission}</Tag>
          ))}
        </div>
      )
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
      render: (_: any, record: Role) => (
        <Space>
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个角色吗？"
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
        title="角色管理" 
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建角色
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={roles}
          rowKey="_id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      <Modal
        title={editingRole ? '编辑角色' : '新建角色'}
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
            name="name"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="请输入角色名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="角色描述"
          >
            <TextArea rows={3} placeholder="请输入角色描述" />
          </Form.Item>

          <Form.Item
            name="permissions"
            label="权限分配"
            rules={[{ required: true, message: '请选择权限' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择权限"
              optionFilterProp="children"
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {permissions.map(permission => (
                <Option key={permission.code} value={permission.code}>
                  {permission.name} ({permission.code})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="menus"
            label="菜单权限"
          >
            <Select
              mode="multiple"
              placeholder="请选择菜单"
            >
              <Option value="dashboard">仪表盘</Option>
              <Option value="users">用户管理</Option>
              <Option value="roles">角色管理</Option>
              <Option value="permissions">权限管理</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingRole ? '更新' : '创建'}
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

export default AdminRolesPage;