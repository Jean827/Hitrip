import React, { useState } from 'react';
import { Button, Badge } from 'antd';
import { RobotOutlined, MessageOutlined } from '@ant-design/icons';
import ChatInterface from './customerService/ChatInterface';
import './CustomerServiceChat.css';

const CustomerServiceChat: React.FC = () => {
  const [isChatVisible, setIsChatVisible] = useState(false);

  const toggleChat = () => {
    setIsChatVisible(!isChatVisible);
  };

  return (
    <>
      {/* 悬浮聊天按钮 */}
      <div className="customer-service-chat-button">
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<MessageOutlined />}
          onClick={toggleChat}
          className="chat-toggle-button"
        />
        <Badge count={0} size="small" className="chat-badge" />
      </div>

      {/* 聊天界面 */}
      {isChatVisible && (
        <ChatInterface
          onClose={() => setIsChatVisible(false)}
          className="global-chat-interface"
        />
      )}
    </>
  );
};

export default CustomerServiceChat; 