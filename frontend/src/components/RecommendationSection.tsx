import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Spin, Empty, Tabs, Button, Space } from 'antd';
import { ReloadOutlined, FireOutlined, StarOutlined, TeamOutlined } from '@ant-design/icons';
import RecommendationCard from './RecommendationCard';
import { message } from 'antd';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface RecommendationSectionProps {
  userId?: number;
  onViewProduct?: (productId: number) => void;
  onAddToCart?: (productId: number) => void;
  onFavorite?: (productId: number) => void;
}

interface RecommendationItem {
  productId: number;
  score: number;
  reason: string;
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
    category?: {
      id: number;
      name: string;
    };
  };
}

const RecommendationSection: React.FC<RecommendationSectionProps> = ({
  userId,
  onViewProduct,
  onAddToCart,
  onFavorite,
}) => {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<{
    personalized: RecommendationItem[];
    popular: RecommendationItem[];
    similar: RecommendationItem[];
  }>({
    personalized: [],
    popular: [],
    similar: [],
  });
  const [activeTab, setActiveTab] = useState('personalized');

  const fetchRecommendations = async (type: string) => {
    if (!userId) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/recommendations/${type}?limit=12`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(prev => ({
          ...prev,
          [type]: data.data || [],
        }));
      } else {
        message.error('获取推荐失败');
      }
    } catch (error) {
      console.error('获取推荐失败:', error);
      message.error('获取推荐失败');
    } finally {
      setLoading(false);
    }
  };

  const recordRecommendationClick = async (productId: number, reason: string) => {
    if (!userId) return;

    try {
      const token = localStorage.getItem('token');
      await fetch('/api/recommendations/click', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          recommendationType: activeTab === 'personalized' ? 'hybrid' : activeTab,
        }),
      });
    } catch (error) {
      console.error('记录推荐点击失败:', error);
    }
  };

  const recordBehavior = async (productId: number, behaviorType: string) => {
    if (!userId) return;

    try {
      const token = localStorage.getItem('token');
      await fetch('/api/recommendations/behavior', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          behaviorType,
          sessionId: sessionStorage.getItem('sessionId') || 'unknown',
          userAgent: navigator.userAgent,
          ipAddress: 'unknown', // 实际应用中应该从服务器获取
          referrer: document.referrer,
        }),
      });
    } catch (error) {
      console.error('记录用户行为失败:', error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchRecommendations('personalized');
      fetchRecommendations('popular');
    }
  }, [userId]);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    if (recommendations[key as keyof typeof recommendations].length === 0) {
      fetchRecommendations(key);
    }
  };

  const handleRefresh = () => {
    fetchRecommendations(activeTab);
  };

  const handleViewProduct = (productId: number) => {
    recordBehavior(productId, 'view');
    onViewProduct?.(productId);
  };

  const handleAddToCart = (productId: number) => {
    recordBehavior(productId, 'cart');
    onAddToCart?.(productId);
  };

  const handleFavorite = (productId: number) => {
    recordBehavior(productId, 'favorite');
    onFavorite?.(productId);
  };

  const handleRecommendationClick = (productId: number, reason: string) => {
    recordRecommendationClick(productId, reason);
    recordBehavior(productId, 'click');
  };

  const getTabIcon = (key: string) => {
    switch (key) {
      case 'personalized':
        return <StarOutlined />;
      case 'popular':
        return <FireOutlined />;
      case 'similar':
        return <TeamOutlined />;
      default:
        return null;
    }
  };

  const getTabTitle = (key: string) => {
    switch (key) {
      case 'personalized':
        return '个性化推荐';
      case 'popular':
        return '热门商品';
      case 'similar':
        return '相似商品';
      default:
        return '';
    }
  };

  const currentRecommendations = recommendations[activeTab as keyof typeof recommendations] || [];

  return (
    <div className="recommendation-section">
      <div className="recommendation-header">
        <Title level={3} className="recommendation-title">
          为您推荐
        </Title>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
          >
            刷新
          </Button>
        </Space>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        className="recommendation-tabs"
      >
        <TabPane
          tab={
            <span>
              {getTabIcon('personalized')}
              {getTabTitle('personalized')}
            </span>
          }
          key="personalized"
        >
          <div className="recommendation-content">
            {loading ? (
              <div className="loading-container">
                <Spin size="large" />
                <Text>正在为您生成个性化推荐...</Text>
              </div>
            ) : currentRecommendations.length > 0 ? (
              <Row gutter={[16, 16]}>
                {currentRecommendations.map((item) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={item.productId}>
                    <RecommendationCard
                      product={item.product}
                      score={item.score}
                      reason={item.reason}
                      onView={handleViewProduct}
                      onAddToCart={handleAddToCart}
                      onFavorite={handleFavorite}
                      onRecommendationClick={handleRecommendationClick}
                    />
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty
                description="暂无推荐商品"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </div>
        </TabPane>

        <TabPane
          tab={
            <span>
              {getTabIcon('popular')}
              {getTabTitle('popular')}
            </span>
          }
          key="popular"
        >
          <div className="recommendation-content">
            {loading ? (
              <div className="loading-container">
                <Spin size="large" />
                <Text>正在获取热门商品...</Text>
              </div>
            ) : currentRecommendations.length > 0 ? (
              <Row gutter={[16, 16]}>
                {currentRecommendations.map((item) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={item.productId}>
                    <RecommendationCard
                      product={item.product}
                      score={item.score}
                      reason={item.reason}
                      onView={handleViewProduct}
                      onAddToCart={handleAddToCart}
                      onFavorite={handleFavorite}
                      onRecommendationClick={handleRecommendationClick}
                    />
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty
                description="暂无热门商品"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </div>
        </TabPane>
      </Tabs>

      <style jsx>{`
        .recommendation-section {
          padding: 24px;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .recommendation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .recommendation-title {
          margin: 0 !important;
        }

        .recommendation-tabs {
          margin-top: 16px;
        }

        .recommendation-content {
          min-height: 400px;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 400px;
          gap: 16px;
        }

        .recommendation-card {
          height: 100%;
          transition: all 0.3s ease;
        }

        .recommendation-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        .product-image-container {
          position: relative;
          cursor: pointer;
          overflow: hidden;
        }

        .product-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .product-image-container:hover .product-image {
          transform: scale(1.05);
        }

        .recommendation-badge {
          position: absolute;
          top: 8px;
          right: 8px;
        }

        .recommendation-content {
          padding: 16px;
        }

        .product-info {
          margin-bottom: 12px;
        }

        .product-name {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
          color: #333;
          cursor: pointer;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .product-name:hover {
          color: #1890ff;
        }

        .product-price {
          font-size: 18px;
          font-weight: bold;
          color: #f5222d;
        }

        .recommendation-reason {
          margin-bottom: 8px;
        }

        .reason-text {
          font-size: 12px;
          color: #666;
          background: #f5f5f5;
          padding: 4px 8px;
          border-radius: 4px;
          display: inline-block;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .recommendation-score {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .score-label {
          font-size: 12px;
          color: #999;
        }

        .score-value {
          font-size: 12px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default RecommendationSection; 