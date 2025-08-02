import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Form, Input, Button, Select, DatePicker, message, Upload, Avatar, Divider, Spin } from 'antd';
import { UploadOutlined, UserOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons';
import { fetchUserProfile, updateUserProfile, uploadAvatar, updatePreferences, changePassword, bindPhone, sendSMS } from '../../store/slices/userSlice';
import { RootState, AppDispatch } from '../../store';
import dayjs from 'dayjs';

const { Option } = Select;

const UserSettingsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, isLoading } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  if (isLoading || !profile) {
    return <Spin className="mt-20" size="large" />;
  }

  // 资料编辑
  const handleProfileFinish = async (values: any) => {
    const res = await dispatch(updateUserProfile({
      ...values,
      birthday: values.birthday ? values.birthday.format('YYYY-MM-DD') : undefined,
    }));
    if (updateUserProfile.fulfilled.match(res)) {
      message.success('资料更新成功');
    }
  };

  // 头像上传
  const handleAvatarChange = async (info: any) => {
    if (info.file.status === 'done' || info.file.status === 'uploading') {
      const file = info.file.originFileObj;
      if (file) {
        const res = await dispatch(uploadAvatar(file));
        if (uploadAvatar.fulfilled.match(res)) {
          message.success('头像上传成功');
        }
      }
    }
  };

  // 偏好设置
  const handlePreferencesFinish = async (values: any) => {
    const res = await dispatch(updatePreferences(values));
    if (updatePreferences.fulfilled.match(res)) {
      message.success('偏好设置已保存');
    }
  };

  // 修改密码
  const handlePasswordFinish = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('两次输入的新密码不一致');
      return;
    }
    const res = await dispatch(changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    }));
    if (changePassword.fulfilled.match(res)) {
      message.success('密码修改成功');
    }
  };

  // 绑定手机号
  const handleBindPhone = async (values: any) => {
    const res = await dispatch(bindPhone({ phone: values.phone, code: values.code }));
    if (bindPhone.fulfilled.match(res)) {
      message.success('手机号绑定成功');
    }
  };

  // 发送验证码
  const handleSendSMS = async (phone: string) => {
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      message.error('请输入有效的手机号');
      return;
    }
    const res = await dispatch(sendSMS(phone));
    if (sendSMS.fulfilled.match(res)) {
      message.success('验证码已发送');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card title="个人设置" className="shadow-lg">
        <Divider orientation="left">基本资料</Divider>
        <Form
          layout="vertical"
          initialValues={{
            nickname: profile.nickname,
            realName: profile.realName,
            gender: profile.gender,
            birthday: profile.birthday ? dayjs(profile.birthday) : undefined,
            address: profile.address,
          }}
          onFinish={handleProfileFinish}
        >
          <Form.Item label="头像">
            <Upload
              showUploadList={false}
              customRequest={({ file, onSuccess }) => {
                handleAvatarChange({ file: { originFileObj: file } });
                setTimeout(() => onSuccess && onSuccess('ok'), 0);
              }}
            >
              <Avatar size={64} src={profile.avatar} icon={<UserOutlined />} className="mr-4" />
              <Button icon={<UploadOutlined />}>更换头像</Button>
            </Upload>
          </Form.Item>
          <Form.Item label="昵称" name="nickname">
            <Input maxLength={20} />
          </Form.Item>
          <Form.Item label="真实姓名" name="realName">
            <Input maxLength={20} />
          </Form.Item>
          <Form.Item label="性别" name="gender">
            <Select allowClear>
              <Option value="male">男</Option>
              <Option value="female">女</Option>
              <Option value="other">其他</Option>
            </Select>
          </Form.Item>
          <Form.Item label="生日" name="birthday">
            <DatePicker allowClear style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="地址" name="address">
            <Input maxLength={200} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">保存资料</Button>
          </Form.Item>
        </Form>

        <Divider orientation="left">偏好设置</Divider>
        <Form
          layout="vertical"
          initialValues={profile.preferences}
          onFinish={handlePreferencesFinish}
        >
          <Form.Item label="语言" name="language">
            <Select>
              <Option value="zh-CN">简体中文</Option>
              <Option value="en-US">English</Option>
            </Select>
          </Form.Item>
          <Form.Item label="主题" name="theme">
            <Select>
              <Option value="light">明亮</Option>
              <Option value="dark">暗黑</Option>
            </Select>
          </Form.Item>
          <Form.Item label="邮件通知" name={["notifications", "email"]} valuePropName="checked">
            <Input type="checkbox" />
          </Form.Item>
          <Form.Item label="短信通知" name={["notifications", "sms"]} valuePropName="checked">
            <Input type="checkbox" />
          </Form.Item>
          <Form.Item label="推送通知" name={["notifications", "push"]} valuePropName="checked">
            <Input type="checkbox" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">保存偏好</Button>
          </Form.Item>
        </Form>

        <Divider orientation="left">修改密码</Divider>
        <Form layout="vertical" onFinish={handlePasswordFinish}>
          <Form.Item label="当前密码" name="currentPassword" rules={[{ required: true, message: '请输入当前密码' }]}> <Input.Password prefix={<LockOutlined />} /></Form.Item>
          <Form.Item label="新密码" name="newPassword" rules={[{ required: true, message: '请输入新密码' }, { min: 6, message: '密码至少6位' }]}> <Input.Password prefix={<LockOutlined />} /></Form.Item>
          <Form.Item label="确认新密码" name="confirmPassword" dependencies={["newPassword"]} rules={[{ required: true, message: '请确认新密码' }]}> <Input.Password prefix={<LockOutlined />} /></Form.Item>
          <Form.Item><Button type="primary" htmlType="submit">修改密码</Button></Form.Item>
        </Form>

        <Divider orientation="left">绑定手机号</Divider>
        <Form layout="vertical" onFinish={handleBindPhone} initialValues={{ phone: profile.phone }}>
          <Form.Item label="手机号" name="phone" rules={[{ required: true, message: '请输入手机号' }, { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }]}> <Input prefix={<PhoneOutlined />} /></Form.Item>
          <Form.Item label="验证码" name="code" rules={[{ required: true, message: '请输入验证码' }]}> <Input style={{ width: 160, marginRight: 8 }} /> <Button onClick={() => handleSendSMS(profile.phone)}>发送验证码</Button></Form.Item>
          <Form.Item><Button type="primary" htmlType="submit">绑定手机号</Button></Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default UserSettingsPage;