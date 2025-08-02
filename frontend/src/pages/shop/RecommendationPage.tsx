import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, message, Spin, Tag, Space, Typography, Empty } from 'antd';
import { HeartOutlined, ShoppingCartOutlined, EyeOutlined, StarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

interface RecommendationItem {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  score: number;
  algorithm: string;
  reason: string;
}

const RecommendationPage: React.FC = () => {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personalized');
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecommendations();
  }, [activeTab]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      // TODO: 调用推荐API
      const mockData: RecommendationItem[] = [
        {
          id: '1',
          name: '海南特产椰子糖',
          description: '纯天然椰子制作，香甜可口',
          image: 'https://via.placeholder.com/200x200?text=椰子糖',
          price: 25.8,
          score: 0.9,
          algorithm: 'content',
          reason: '基于您对甜食的偏好推荐',
        },
        {
          id: '2',
          name: '三亚珍珠项链',
          description: '天然海水珍珠，品质优良',
          image: 'https://via.placeholder.com/200x200?text=珍珠项链',
          price: 128.0,
          score: 0.85,
          algorithm: 'content',
          reason: '基于您对饰品的偏好推荐',
        },
        {
          id: '3',
          name: '海南咖啡豆',
          description: '兴隆咖啡，香浓醇厚',
          image: 'https://via.placeholder.com/200x200?text=咖啡豆',
          price: 68.0,
          score: 0.8,
          algorithm: 'content',
          reason: '基于您对饮品的偏好推荐',
        },
        {
          id: '4',
          name: '黎族手工织锦',
          description: '传统手工制作，图案精美',
          image: 'https://via.placeholder.com/200x200?text=手工织锦',
          price: 158.0,
          score: 0.75,
          algorithm: 'content',
          reason: '基于您对传统工艺的偏好推荐',
        },
      ];

      setRecommendations(mockData);
    } catch (error) {
      message.error('获取推荐失败');
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item: RecommendationItem) => {
    // 记录点击行为
    recordBehavior(item.id, 'click');
    navigate(`/shop/product/${item.id}`);
  };

  const handleAddToCart = (item: RecommendationItem) => {
    // 记录加入购物车行为
    recordBehavior(item.id, 'purchase');
    message.success('已加入购物车');
  };

  const handleFavorite = (item: RecommendationItem) => {
    // 记录收藏行为
    recordBehavior(item.id, 'favorite');
    message.success('已添加到收藏');
  };

  const recordBehavior = async (itemId: string, behaviorType: string) => {
    try {
      // TODO: 调用行为记录API
      console.log('记录用户行为:', { itemId, behaviorType });
    } catch (error) {
      console.error('记录行为失败:', error);
    }
  };

  const getAlgorithmColor = (algorithm: string) => {
    switch (algorithm) {
      case 'content':
        return 'blue';
      case 'collaborative':
        return 'green';
      case 'popularity':
        return 'orange';
      default:
        return 'default';
    }
  };

  const getAlgorithmText = (algorithm: string) => {
    switch (algorithm) {
      case 'content':
        return '内容推荐';
      case 'collaborative':
        return '协同过滤';
      case 'popularity':
        return '热门推荐';
      default:
        return algorithm;
    }
  };

  const renderRecommendationCard = (item: RecommendationItem) => (
    <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
      <Card
        hoverable
        cover={
          <div style={{ height: 200, overflow: 'hidden' }}>
            <img
              alt={item.name}
              src={item.image}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        }
        actions={[
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleItemClick(item)}
          >
            查看
          </Button>,
          <Button
            type="text"
            icon={<HeartOutlined />}
            onClick={() => handleFavorite(item)}
          >
            收藏
          </Button>,
          <Button
            type="text"
            icon={<ShoppingCartOutlined />}
            onClick={() => handleAddToCart(item)}
          >
            加入购物车
          </Button>,
        ]}
      >
        <Card.Meta
          title={
            <div>
              <div style={{ marginBottom: 8 }}>
                <Text strong>{item.name}</Text>
              </div>
              <Space>
                <Tag color={getAlgorithmColor(item.algorithm)}>
                  {getAlgorithmText(item.algorithm)}
                </Tag>
                <Tag color="gold">
                  <StarOutlined /> {Math.round(item.score * 100)}%
                </Tag>
              </Space>
            </div>
          }
          description={
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {item.description}
              </Text>
              <div style={{ marginTop: 8 }}>
                <Text type="danger" strong style={{ fontSize: 16 }}>
                  ¥{item.price}
                </Text>
              </div>
              <div style={{ marginTop: 4 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {item.reason}
                </Text>
              </div>
            </div>
          }
        />
      </Card>
    </Col>
  );

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>为您推荐</Title>
        <Text type="secondary">
          基于您的浏览历史和偏好，为您精选以下商品
        </Text>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button
            type={activeTab === 'personalized' ? 'primary' : 'default'}
            onClick={() => setActiveTab('personalized')}
          >
            个性化推荐
          </Button>
          <Button
            type={activeTab === 'popular' ? 'primary' : 'default'}
            onClick={() => setActiveTab('popular')}
          >
            热门推荐
          </Button>
          <Button
            type={activeTab === 'similar' ? 'primary' : 'default'}
            onClick={() => setActiveTab('similar')}
          >
            相似推荐
          </Button>
        </Space>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text>正在为您生成个性化推荐...</Text>
          </div>
        </div>
      ) : recommendations.length > 0 ? (
        <Row gutter={[16, 16]}>
          {recommendations.map(renderRecommendationCard)}
        </Row>
      ) : (
        <Empty
          description="暂无推荐商品"
          style={{ margin: '50px 0' }}
        />
      )}

      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <Button type="primary" onClick={fetchRecommendations}>
          刷新推荐
        </Button>
      </div>
    </div>
  );
};

export default RecommendationPage; 