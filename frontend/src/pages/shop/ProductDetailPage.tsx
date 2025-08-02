import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, InputNumber, Tag, Rate, Divider, Spin, message, Empty, Image, Tabs } from 'antd';
import { ShoppingCartOutlined, HeartOutlined, ShareAltOutlined, StarOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const { TabPane } = Tabs;

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  discountPrice?: number;
  memberPrice?: number;
  images: string[];
  tags: string[];
  rating: number;
  reviewCount: number;
  salesCount: number;
  stock: number;
  weight?: number;
  dimensions?: string;
  brand?: string;
  model?: string;
  warranty?: string;
  category: {
    id: string;
    name: string;
  };
  inventory?: {
    availableQuantity: number;
    lowStockThreshold: number;
  };
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/products/${id}`);
      setProduct(response.data.data);
    } catch (error) {
      message.error('获取商品详情失败');
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    if (!product) return;

    try {
      await axios.post('/api/cart/items', {
        productId: product.id,
        quantity,
      });
      message.success('已添加到购物车');
    } catch (error) {
      message.error('添加到购物车失败');
    }
  };

  const buyNow = () => {
    if (!product) return;

    // 先添加到购物车，然后跳转到订单确认页
    addToCart().then(() => {
      navigate('/shop/cart');
    });
  };

  const handleQuantityChange = (value: number | null) => {
    if (value && value > 0 && value <= (product?.stock || 0)) {
      setQuantity(value);
    }
  };

  const handleImageClick = (index: number) => {
    setSelectedImage(index);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <Empty
        description="商品不存在"
        style={{ padding: '50px' }}
      />
    );
  }

  const isLowStock = product.inventory && product.inventory.availableQuantity <= product.inventory.lowStockThreshold;

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Row gutter={[32, 32]}>
        {/* 商品图片 */}
        <Col xs={24} md={12}>
          <div style={{ marginBottom: '16px' }}>
            <Image
              src={product.images[selectedImage] || 'https://via.placeholder.com/500x500'}
              alt={product.name}
              style={{ width: '100%', maxHeight: '500px', objectFit: 'contain' }}
            />
          </div>
          {product.images.length > 1 && (
            <Row gutter={[8, 8]}>
              {product.images.map((image, index) => (
                <Col key={index} span={6}>
                  <div
                    style={{
                      border: selectedImage === index ? '2px solid #1890ff' : '1px solid #d9d9d9',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      overflow: 'hidden',
                    }}
                    onClick={() => handleImageClick(index)}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      style={{ width: '100%', height: '80px', objectFit: 'cover' }}
                    />
                  </div>
                </Col>
              ))}
            </Row>
          )}
        </Col>

        {/* 商品信息 */}
        <Col xs={24} md={12}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
              {product.name}
            </h1>
            
            <div style={{ marginBottom: '16px' }}>
              <Tag color="blue">{product.category.name}</Tag>
              {product.brand && <Tag color="green">{product.brand}</Tag>}
            </div>

            {/* 评分 */}
            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
              <Rate disabled defaultValue={product.rating} style={{ fontSize: '16px' }} />
              <span style={{ marginLeft: '8px', color: '#666' }}>
                {product.rating} ({product.reviewCount} 条评价)
              </span>
            </div>

            {/* 价格 */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '8px' }}>
                <span style={{ color: '#ff4d4f', fontSize: '28px', fontWeight: 'bold' }}>
                  ¥{product.price}
                </span>
                {product.originalPrice > product.price && (
                  <span style={{ color: '#999', textDecoration: 'line-through', marginLeft: '12px' }}>
                    ¥{product.originalPrice}
                  </span>
                )}
                {product.discountPrice && (
                  <Tag color="red" style={{ marginLeft: '8px' }}>
                    限时特价
                  </Tag>
                )}
              </div>
              {product.memberPrice && (
                <div style={{ color: '#666', fontSize: '14px' }}>
                  会员价: ¥{product.memberPrice}
                </div>
              )}
            </div>

            {/* 库存信息 */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ color: '#666', marginBottom: '8px' }}>
                库存: {product.inventory?.availableQuantity || product.stock} 件
              </div>
              {isLowStock && (
                <div style={{ color: '#ff4d4f', fontSize: '14px' }}>
                  库存紧张，请尽快购买
                </div>
              )}
            </div>

            {/* 商品标签 */}
            {product.tags.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ marginBottom: '8px', color: '#666' }}>商品标签:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {product.tags.map((tag, index) => (
                    <Tag key={index} color="blue">
                      {tag}
                    </Tag>
                  ))}
                </div>
              </div>
            )}

            {/* 数量选择 */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ marginBottom: '8px', color: '#666' }}>购买数量:</div>
              <InputNumber
                min={1}
                max={product.inventory?.availableQuantity || product.stock}
                value={quantity}
                onChange={handleQuantityChange}
                style={{ width: '120px' }}
              />
            </div>

            {/* 操作按钮 */}
            <div style={{ marginBottom: '24px' }}>
              <Row gutter={[16, 16]}>
                <Col xs={12}>
                  <Button
                    type="primary"
                    size="large"
                    icon={<ShoppingCartOutlined />}
                    onClick={addToCart}
                    style={{ width: '100%' }}
                    disabled={!product.inventory?.availableQuantity && product.stock === 0}
                  >
                    加入购物车
                  </Button>
                </Col>
                <Col xs={12}>
                  <Button
                    size="large"
                    onClick={buyNow}
                    style={{ width: '100%' }}
                    disabled={!product.inventory?.availableQuantity && product.stock === 0}
                  >
                    立即购买
                  </Button>
                </Col>
              </Row>
            </div>

            {/* 其他操作 */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <Button icon={<HeartOutlined />} type="text">
                收藏
              </Button>
              <Button icon={<ShareAltOutlined />} type="text">
                分享
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* 商品详情 */}
      <Divider />
      <div style={{ marginTop: '32px' }}>
        <Tabs defaultActiveKey="detail">
          <TabPane tab="商品详情" key="detail">
            <div style={{ lineHeight: '1.8' }}>
              <div dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>
          </TabPane>
          
          <TabPane tab="规格参数" key="specs">
            <Row gutter={[16, 16]}>
              {product.brand && (
                <Col span={12}>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ color: '#666' }}>品牌:</span>
                    <span style={{ marginLeft: '8px' }}>{product.brand}</span>
                  </div>
                </Col>
              )}
              {product.model && (
                <Col span={12}>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ color: '#666' }}>型号:</span>
                    <span style={{ marginLeft: '8px' }}>{product.model}</span>
                  </div>
                </Col>
              )}
              {product.weight && (
                <Col span={12}>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ color: '#666' }}>重量:</span>
                    <span style={{ marginLeft: '8px' }}>{product.weight}kg</span>
                  </div>
                </Col>
              )}
              {product.dimensions && (
                <Col span={12}>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ color: '#666' }}>尺寸:</span>
                    <span style={{ marginLeft: '8px' }}>{product.dimensions}</span>
                  </div>
                </Col>
              )}
              {product.warranty && (
                <Col span={12}>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ color: '#666' }}>保修:</span>
                    <span style={{ marginLeft: '8px' }}>{product.warranty}</span>
                  </div>
                </Col>
              )}
            </Row>
          </TabPane>
          
          <TabPane tab="用户评价" key="reviews">
            <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
              评价功能开发中...
            </div>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default ProductDetailPage; 