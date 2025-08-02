import React from 'react';
import { Card, Badge, Button, Tooltip } from 'antd';
import { HeartOutlined, ShoppingCartOutlined, EyeOutlined } from '@ant-design/icons';

interface RecommendationCardProps {
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
  score: number;
  reason: string;
  onView?: (productId: number) => void;
  onAddToCart?: (productId: number) => void;
  onFavorite?: (productId: number) => void;
  onRecommendationClick?: (productId: number, reason: string) => void;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  product,
  score,
  reason,
  onView,
  onAddToCart,
  onFavorite,
  onRecommendationClick,
}) => {
  const handleCardClick = () => {
    onRecommendationClick?.(product.id, reason);
    onView?.(product.id);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.(product.id);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavorite?.(product.id);
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return '#52c41a';
    if (score >= 0.6) return '#faad14';
    if (score >= 0.4) return '#fa8c16';
    return '#f5222d';
  };

  const getScoreText = (score: number) => {
    if (score >= 0.8) return '强烈推荐';
    if (score >= 0.6) return '推荐';
    if (score >= 0.4) return '一般';
    return '不推荐';
  };

  return (
    <Card
      hoverable
      className="recommendation-card"
      cover={
        <div className="product-image-container" onClick={handleCardClick}>
          <img
            alt={product.name}
            src={product.image || '/placeholder-product.jpg'}
            className="product-image"
          />
          <div className="recommendation-badge">
            <Badge
              count={`${(score * 100).toFixed(0)}%`}
              style={{
                backgroundColor: getScoreColor(score),
                color: '#fff',
                fontSize: '12px',
                fontWeight: 'bold',
              }}
            />
          </div>
        </div>
      }
      actions={[
        <Tooltip title="查看详情" key="view">
          <EyeOutlined onClick={handleCardClick} />
        </Tooltip>,
        <Tooltip title="加入购物车" key="cart">
          <ShoppingCartOutlined onClick={handleAddToCart} />
        </Tooltip>,
        <Tooltip title="收藏" key="favorite">
          <HeartOutlined onClick={handleFavorite} />
        </Tooltip>,
      ]}
    >
      <div className="recommendation-content">
        <div className="product-info">
          <h4 className="product-name" onClick={handleCardClick}>
            {product.name}
          </h4>
          {product.category && (
            <Badge
              count={product.category.name}
              style={{
                backgroundColor: '#1890ff',
                color: '#fff',
                fontSize: '10px',
                marginBottom: '8px',
              }}
            />
          )}
          <div className="product-price">
            ¥{product.price.toFixed(2)}
          </div>
        </div>
        
        <div className="recommendation-reason">
          <Tooltip title={reason}>
            <span className="reason-text">{reason}</span>
          </Tooltip>
        </div>
        
        <div className="recommendation-score">
          <span className="score-label">推荐度:</span>
          <span
            className="score-value"
            style={{ color: getScoreColor(score) }}
          >
            {getScoreText(score)}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default RecommendationCard; 