import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Carousel, Tag, Button, Input, Select, Space, Spin, message } from 'antd';
import { SearchOutlined, FireOutlined, StarOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Search } = Input;
const { Option } = Select;

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
  category: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon?: string;
  image?: string;
  children?: Category[];
}

const ShopHomePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [hotProducts, setHotProducts] = useState<Product[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [searchValue, setSearchValue] = useState('');

  // 轮播图数据
  const bannerImages = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=400&fit=crop',
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 获取分类树
      const categoriesResponse = await axios.get('/api/categories/tree');
      setCategories(categoriesResponse.data.data);

      // 获取热门商品
      const hotProductsResponse = await axios.get('/api/products/featured/hot?limit=8');
      setHotProducts(hotProductsResponse.data.data);

      // 获取推荐商品
      const recommendedResponse = await axios.get('/api/products/featured/recommended?limit=8');
      setRecommendedProducts(recommendedResponse.data.data);

      // 获取新品
      const newProductsResponse = await axios.get('/api/products?sortBy=createdAt&sortOrder=DESC&limit=8');
      setNewProducts(newProductsResponse.data.data.products);
    } catch (error) {
      message.error('获取数据失败');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    if (value.trim()) {
      navigate(`/shop/products?search=${encodeURIComponent(value)}`);
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/shop/products?categoryId=${categoryId}`);
  };

  const handleProductClick = (productId: string) => {
    navigate(`/shop/products/${productId}`);
  };

  const addToCart = async (productId: string) => {
    try {
      await axios.post('/api/cart/items', {
        productId,
        quantity: 1,
      });
      message.success('已添加到购物车');
    } catch (error) {
      message.error('添加到购物车失败');
    }
  };

  const renderProductCard = (product: Product) => (
    <Card
      key={product.id}
      hoverable
      cover={
        <div style={{ height: 200, overflow: 'hidden' }}>
          <img
            alt={product.name}
            src={product.images[0] || 'https://via.placeholder.com/300x200'}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      }
      actions={[
        <Button
          key="cart"
          type="primary"
          icon={<ShoppingCartOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            addToCart(product.id);
          }}
        >
          加入购物车
        </Button>
      ]}
      onClick={() => handleProductClick(product.id)}
    >
      <Card.Meta
        title={
          <div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
              {product.name}
            </div>
            <div style={{ color: '#666', fontSize: '12px', marginBottom: '8px' }}>
              {product.category.name}
            </div>
          </div>
        }
        description={
          <div>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ color: '#ff4d4f', fontSize: '18px', fontWeight: 'bold' }}>
                ¥{product.price}
              </span>
              {product.originalPrice > product.price && (
                <span style={{ color: '#999', textDecoration: 'line-through', marginLeft: '8px' }}>
                  ¥{product.originalPrice}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <StarOutlined style={{ color: '#faad14', marginRight: '4px' }} />
              <span style={{ color: '#666' }}>{product.rating}</span>
              <span style={{ color: '#999', marginLeft: '8px' }}>({product.reviewCount})</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {product.tags.slice(0, 3).map((tag, index) => (
                <Tag key={index} color="blue" size="small">
                  {tag}
                </Tag>
              ))}
            </div>
          </div>
        }
      />
    </Card>
  );

  const renderCategoryCard = (category: Category) => (
    <Card
      key={category.id}
      hoverable
      style={{ textAlign: 'center', cursor: 'pointer' }}
      onClick={() => handleCategoryClick(category.id)}
      cover={
        <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {category.image ? (
            <img
              alt={category.name}
              src={category.image}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ fontSize: '48px', color: '#1890ff' }}>
              {category.icon || '📦'}
            </div>
          )}
        </div>
      }
    >
      <Card.Meta title={category.name} description={category.description} />
    </Card>
  );

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* 搜索栏 */}
      <div style={{ marginBottom: '24px' }}>
        <Search
          placeholder="搜索商品..."
          enterButton={<SearchOutlined />}
          size="large"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onSearch={handleSearch}
          style={{ maxWidth: '600px' }}
        />
      </div>

      {/* 轮播图 */}
      <div style={{ marginBottom: '32px' }}>
        <Carousel autoplay>
          {bannerImages.map((image, index) => (
            <div key={index}>
              <div
                style={{
                  height: '300px',
                  background: `url(${image}) center/cover`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '24px',
                  fontWeight: 'bold',
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <h2>海南特色商品</h2>
                  <p>发现最优质的海南特产</p>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </div>

      {/* 商品分类 */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ marginBottom: '16px' }}>商品分类</h2>
        <Row gutter={[16, 16]}>
          {categories.slice(0, 8).map(renderCategoryCard)}
        </Row>
      </div>

      {/* 热门商品 */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <FireOutlined style={{ color: '#ff4d4f', fontSize: '20px', marginRight: '8px' }} />
          <h2 style={{ margin: 0 }}>热门商品</h2>
        </div>
        <Row gutter={[16, 16]}>
          {hotProducts.map(renderProductCard)}
        </Row>
      </div>

      {/* 推荐商品 */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <StarOutlined style={{ color: '#faad14', fontSize: '20px', marginRight: '8px' }} />
          <h2 style={{ margin: 0 }}>推荐商品</h2>
        </div>
        <Row gutter={[16, 16]}>
          {recommendedProducts.map(renderProductCard)}
        </Row>
      </div>

      {/* 新品上架 */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ marginBottom: '16px' }}>新品上架</h2>
        <Row gutter={[16, 16]}>
          {newProducts.map(renderProductCard)}
        </Row>
      </div>
    </div>
  );
};

export default ShopHomePage; 