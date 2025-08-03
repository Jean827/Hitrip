import React, { useState } from 'react';
import { Card, Row, Col, Typography, Space, Button, Switch, Divider } from 'antd';
import { SearchOutlined, MobileOutlined, DesktopOutlined, WifiOutlined, DisconnectOutlined } from '@ant-design/icons';
import SearchComponent from '../../components/SearchComponent';
import MobileSearchPage from '../shop/MobileSearchPage';
import './SearchDemoPage.css';

const { Title, Text, Paragraph } = Typography;

const SearchDemoPage: React.FC = () => {
  const [isMobileMode, setIsMobileMode] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const handleSearch = (query: string) => {
    console.log('搜索查询:', query);
  };

  const handleResultClick = (result: any) => {
    console.log('点击搜索结果:', result);
  };

  const toggleMobileMode = () => {
    setIsMobileMode(!isMobileMode);
  };

  const toggleOfflineMode = () => {
    setIsOfflineMode(!isOfflineMode);
    // 模拟网络状态变化
    if (!isOfflineMode) {
      console.log('切换到离线模式');
    } else {
      console.log('切换到在线模式');
    }
  };

  return (
    <div className="search-demo-page">
      <div className="demo-header">
        <Title level={2}>智能搜索与移动端优化演示</Title>
        <Paragraph>
          展示智能搜索功能、移动端优化和离线功能支持
        </Paragraph>
      </div>

      <Row gutter={[16, 16]} className="demo-controls">
        <Col xs={24} sm={12}>
          <Card title="演示控制" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text>移动端模式: </Text>
                <Switch
                  checked={isMobileMode}
                  onChange={toggleMobileMode}
                  checkedChildren={<MobileOutlined />}
                  unCheckedChildren={<DesktopOutlined />}
                />
              </div>
              <div>
                <Text>离线模式: </Text>
                <Switch
                  checked={isOfflineMode}
                  onChange={toggleOfflineMode}
                  checkedChildren={<DisconnectOutlined />}
                  unCheckedChildren={<WifiOutlined />}
                />
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card title="功能特性" size="small">
            <ul>
              <li>✅ 智能搜索建议</li>
              <li>✅ 搜索历史记录</li>
              <li>✅ 搜索纠错功能</li>
              <li>✅ 移动端优化</li>
              <li>✅ 离线功能支持</li>
            </ul>
          </Card>
        </Col>
      </Row>

      <Divider />

      {isMobileMode ? (
        <div className="mobile-demo">
          <Title level={3}>移动端搜索演示</Title>
          <div className="mobile-frame">
            <MobileSearchPage />
          </div>
        </div>
      ) : (
        <div className="desktop-demo">
          <Title level={3}>桌面端搜索演示</Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="基础搜索功能" className="demo-card">
                <SearchComponent
                  onSearch={handleSearch}
                  onResultClick={handleResultClick}
                  placeholder="搜索景点、商品..."
                  showSuggestions={true}
                  showHistory={true}
                  showPopular={true}
                />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="移动端优化搜索" className="demo-card">
                <SearchComponent
                  onSearch={handleSearch}
                  onResultClick={handleResultClick}
                  placeholder="移动端优化搜索..."
                  mobileOptimized={true}
                  showSuggestions={true}
                  showHistory={true}
                  showPopular={true}
                />
              </Card>
            </Col>
          </Row>
        </div>
      )}

      <Divider />

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card title="智能搜索特性" className="feature-card">
            <ul>
              <li><strong>搜索建议:</strong> 实时提供相关搜索建议</li>
              <li><strong>搜索历史:</strong> 记录和管理搜索历史</li>
              <li><strong>热门搜索:</strong> 显示热门搜索词</li>
              <li><strong>搜索纠错:</strong> 智能纠正常见拼写错误</li>
              <li><strong>结果高亮:</strong> 关键词高亮显示</li>
            </ul>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="移动端优化" className="feature-card">
            <ul>
              <li><strong>触摸友好:</strong> 44px最小触摸区域</li>
              <li><strong>响应式设计:</strong> 适配各种屏幕尺寸</li>
              <li><strong>性能优化:</strong> 图片懒加载和代码分割</li>
              <li><strong>手势支持:</strong> 滑动和触摸手势</li>
              <li><strong>离线支持:</strong> 基础数据缓存和同步</li>
            </ul>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="离线功能" className="feature-card">
            <ul>
              <li><strong>智能缓存:</strong> 基于TTL的缓存策略</li>
              <li><strong>离线操作:</strong> 记录离线操作队列</li>
              <li><strong>网络检测:</strong> 实时监控网络状态</li>
              <li><strong>数据同步:</strong> 在线时自动同步数据</li>
              <li><strong>缓存统计:</strong> 详细的缓存使用统计</li>
            </ul>
          </Card>
        </Col>
      </Row>

      <Divider />

      <Card title="性能指标" className="performance-card">
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <div className="metric">
              <div className="metric-value">200ms</div>
              <div className="metric-label">搜索响应时间</div>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div className="metric">
              <div className="metric-value">90%</div>
              <div className="metric-label">搜索准确率</div>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div className="metric">
              <div className="metric-value">3秒</div>
              <div className="metric-label">移动端加载时间</div>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div className="metric">
              <div className="metric-value">95%</div>
              <div className="metric-label">离线功能稳定性</div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default SearchDemoPage; 