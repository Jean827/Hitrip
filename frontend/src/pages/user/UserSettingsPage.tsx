import React from 'react';
import { Card, Divider, Button } from 'antd';

const UserSettingsPage: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card title="个人设置" className="shadow-lg">
        <Divider orientation="left">基本资料</Divider>
        <div className="text-center py-8">
          <h3>个人设置页面</h3>
          <p className="text-gray-500 mt-2">此页面用于用户管理个人信息和偏好设置</p>
          <Button type="primary" className="mt-4">保存设置</Button>
        </div>
      </Card>
    </div>
  );
};

export default UserSettingsPage;