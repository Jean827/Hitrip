import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Input, Select, Slider, Pagination, Spin, message, Empty, Tag, Button } from 'antd';
import { ShoppingCartOutlined, StarOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  children?: Category[];
}

const ProductListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // 筛选状态
  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');

  useEffect(() => {
    // 从URL参数初始化状态
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const sort = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('sortOrder') || 'DESC';

    setSearchValue(search);
    setSelectedCategory(categoryId);
    setCurrentPage(page);
    setSortBy(sort);
    setSortOrder(order);

    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, selectedCategory, priceRange, sortBy, sortOrder, searchValue]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories/tree');
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        sortBy,
        sortOrder,
      });

      if (searchValue) {
        params.append('search', searchValue);
      }
      if (selectedCategory) {
        params.append('categoryId', selectedCategory);
      }
      if (priceRange[0] > 0) {
        params.append('minPrice', priceRange[0].toString());
      }
      if (priceRange[1] < 10000) {
        params.append('maxPrice', priceRange[1].toString());
      }

      const response = await axios.get(`/api/products?${params.toString()}`);
      setProducts(response.data.data.products);
      setTotal(response.data.data.pagination.total);

      // 更新URL参数
      const newSearchParams = new URLSearchParams();
      if (searchValue) newSearchParams.set('search', searchValue);
      if (selectedCategory) newSearchParams.set('categoryId', selectedCategory);
      if (currentPage > 1) newSearchParams.set('page', currentPage.toString());
      if (sortBy !== 'createdAt') newSearchParams.set('sortBy', sortBy);
      if (sortOrder !== 'DESC') newSearchParams.set('sortOrder', sortOrder);
      setSearchParams(newSearchParams);
    } catch (error) {
      message.error('获取商品列表失败');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  const handlePriceRangeChange = (value: [number, number]) => {
    setPriceRange(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    const [sort, order] = value.split('-');
    setSortBy(sort);
    setSortOrder(order);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size) setPageSize(size);
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
    <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
      <Card
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
              <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                {product.name}
              </div>
              <div style={{ color: '#666', fontSize: '12px', marginBottom: '4px' }}>
                {product.category.name}
              </div>
            </div>
          }
          description={
            <div>
              <div style={{ marginBottom: '4px' }}>
                <span style={{ color: '#ff4d4f', fontSize: '16px', fontWeight: 'bold' }}>
                  ¥{product.price}
                </span>
                {product.originalPrice > product.price && (
                  <span style={{ color: '#999', textDecoration: 'line-through', marginLeft: '4px' }}>
                    ¥{product.originalPrice}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                <StarOutlined style={{ color: '#faad14', marginRight: '2px', fontSize: '12px' }} />
                <span style={{ color: '#666', fontSize: '12px' }}>{product.rating}</span>
                <span style={{ color: '#999', marginLeft: '4px', fontSize: '12px' }}>({product.reviewCount})</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
                {product.tags.slice(0, 2).map((tag, index) => (
                  <Tag key={index} color="blue">
                    {tag}
                  </Tag>
                ))}
              </div>
            </div>
          }
        />
      </Card>
    </Col>
  );

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* 搜索和筛选区域 */}
      <div style={{ marginBottom: '24px', background: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="搜索商品..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="选择分类"
              value={selectedCategory}
              onChange={handleCategoryChange}
              style={{ width: '100%' }}
              allowClear
            >
              {categories.map(category => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="排序方式"
              value={`${sortBy}-${sortOrder}`}
              onChange={handleSortChange}
              style={{ width: '100%' }}
            >
              <Option value="createdAt-DESC">最新上架</Option>
              <Option value="price-ASC">价格从低到高</Option>
              <Option value="price-DESC">价格从高到低</Option>
              <Option value="rating-DESC">评分最高</Option>
              <Option value="salesCount-DESC">销量最高</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div>
              <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>
                价格范围: ¥{priceRange[0]} - ¥{priceRange[1]}
              </div>
              <Slider
                range
                min={0}
                max={10000}
                value={priceRange}
                onChange={(value: number[]) => handlePriceRangeChange(value as [number, number])}
                style={{ width: '100%' }}
              />
            </div>
          </Col>
        </Row>
      </div>

      {/* 商品列表 */}
      <div style={{ marginBottom: '24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        ) : products.length > 0 ? (
          <Row gutter={[16, 16]}>
            {products.map(renderProductCard)}
          </Row>
        ) : (
          <Empty
            description="暂无商品"
            style={{ padding: '50px' }}
          />
        )}
      </div>

      {/* 分页 */}
      {total > 0 && (
        <div style={{ textAlign: 'center' }}>
          <Pagination
            current={currentPage}
            total={total}
            pageSize={pageSize}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`}
            onChange={handlePageChange}
            onShowSizeChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default ProductListPage; 