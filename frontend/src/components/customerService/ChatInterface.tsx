import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, Card, Avatar, Badge, Spin, message, Tooltip } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined, CloseOutlined, HistoryOutlined, ClearOutlined } from '@ant-design/icons';
import './ChatInterface.css';

const { TextArea } = Input;

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  confidence?: number;
  source?: string;
  suggestions?: string[];
  category?: string;
  questionType?: string;
  context?: any;
}

interface ChatInterfaceProps {
  onClose?: () => void;
  className?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onClose, className = '' }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [conversationContext, setConversationContext] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<any>(null);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 初始化会话
  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // 未登录用户也可以使用AI客服
        const tempSessionId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setSessionId(tempSessionId);
        return;
      }

      const response = await fetch('/api/customer-service/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSessionId(data.data.id);
      }
    } catch (error) {
      console.error('初始化会话失败:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/customer-service/ai/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          question: userMessage.content,
          sessionId,
          userId: token ? undefined : null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: data.data.answer,
          timestamp: new Date(),
          confidence: data.data.confidence,
          source: data.data.source,
          suggestions: data.data.suggestions,
          category: data.data.category,
          questionType: data.data.questionType,
          context: data.data.context,
        };

        setMessages(prev => [...prev, botMessage]);
        
        // 更新对话上下文
        if (data.data.context) {
          setConversationContext(data.data.context);
        }
      } else {
        throw new Error('发送消息失败');
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      message.error('发送消息失败，请稍后重试');
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: '抱歉，我现在无法回答您的问题。请稍后再试或联系人工客服。',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  const clearConversation = async () => {
    try {
      const token = localStorage.getItem('token');
      if (sessionId && token) {
        await fetch(`/api/customer-service/sessions/${sessionId}/clear`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
      
      setMessages([]);
      setConversationContext(null);
      message.success('对话已清空');
    } catch (error) {
      console.error('清空对话失败:', error);
      message.error('清空对话失败');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'default';
    if (confidence >= 0.7) return 'success';
    if (confidence >= 0.4) return 'warning';
    return 'error';
  };

  const getCategoryColor = (category?: string) => {
    const colors: { [key: string]: string } = {
      '订单': 'blue',
      '退款': 'orange',
      '物流': 'green',
      '商品': 'purple',
      '账户': 'cyan',
      '优惠': 'magenta',
      '客服': 'red',
      '支付': 'geekblue',
      '会员': 'volcano',
      '活动': 'lime',
    };
    return colors[category || ''] || 'default';
  };

  return (
    <div className={`chat-interface ${className} ${isMinimized ? 'minimized' : ''}`}>
      {/* 聊天窗口头部 */}
      <div className="chat-header">
        <div className="chat-header-left">
          <Avatar 
            icon={<RobotOutlined />} 
            style={{ backgroundColor: '#1890ff' }}
            size="small"
          />
          <span className="chat-title">AI智能客服</span>
          <Badge status="processing" text="在线" />
          {conversationContext && (
            <Tooltip title={`当前话题: ${conversationContext.currentTopic || '无'}`}>
              <Badge 
                color={getCategoryColor(conversationContext.currentTopic)}
                text={conversationContext.currentTopic || '新话题'}
              />
            </Tooltip>
          )}
        </div>
        <div className="chat-header-right">
          <Button
            type="text"
            icon={<HistoryOutlined />}
            onClick={() => setShowHistory(!showHistory)}
            size="small"
            title="对话历史"
          />
          <Button
            type="text"
            icon={<ClearOutlined />}
            onClick={clearConversation}
            size="small"
            title="清空对话"
          />
          <Button
            type="text"
            icon={isMinimized ? <RobotOutlined /> : <CloseOutlined />}
            onClick={() => isMinimized ? setIsMinimized(false) : onClose?.()}
            size="small"
          />
        </div>
      </div>

      {/* 聊天消息区域 */}
      {!isMinimized && (
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="welcome-message">
              <RobotOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
              <h3>欢迎使用AI智能客服</h3>
              <p>我可以帮助您解答关于订单、退款、物流等问题</p>
              <div className="quick-questions">
                <Button 
                  size="small" 
                  onClick={() => handleSuggestionClick('如何查看订单状态？')}
                >
                  如何查看订单状态？
                </Button>
                <Button 
                  size="small" 
                  onClick={() => handleSuggestionClick('退款多久到账？')}
                >
                  退款多久到账？
                </Button>
                <Button 
                  size="small" 
                  onClick={() => handleSuggestionClick('物流信息在哪里查看？')}
                >
                  物流信息在哪里查看？
                </Button>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${msg.type === 'user' ? 'user-message' : 'bot-message'}`}
            >
              <div className="message-avatar">
                {msg.type === 'user' ? (
                  <Avatar icon={<UserOutlined />} size="small" />
                ) : (
                  <Avatar icon={<RobotOutlined />} size="small" style={{ backgroundColor: '#1890ff' }} />
                )}
              </div>
              <div className="message-content">
                <div className="message-text">{msg.content}</div>
                <div className="message-meta">
                  <span className="message-time">{formatTime(msg.timestamp)}</span>
                  {msg.type === 'bot' && msg.confidence && (
                    <Badge 
                      color={getConfidenceColor(msg.confidence)}
                      text={`置信度: ${(msg.confidence * 100).toFixed(0)}%`}
                    />
                  )}
                  {msg.type === 'bot' && msg.category && (
                    <Badge 
                      color={getCategoryColor(msg.category)}
                      text={msg.category}
                    />
                  )}
                </div>
                {msg.type === 'bot' && msg.source && (
                  <div className="message-source">
                    来源: {msg.source}
                  </div>
                )}
                {msg.type === 'bot' && msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="message-suggestions">
                    <span>您可能还想问：</span>
                    {msg.suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        type="link"
                        size="small"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="message bot-message">
              <div className="message-avatar">
                <Avatar icon={<RobotOutlined />} size="small" style={{ backgroundColor: '#1890ff' }} />
              </div>
              <div className="message-content">
                <div className="message-text">
                  <Spin size="small" /> 正在思考中...
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* 输入区域 */}
      {!isMinimized && (
        <div className="chat-input">
          <TextArea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="请输入您的问题..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            disabled={isLoading}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={sendMessage}
            disabled={!inputValue.trim() || isLoading}
            loading={isLoading}
          >
            发送
          </Button>
        </div>
      )}
    </div>
  );
};

export default ChatInterface; 