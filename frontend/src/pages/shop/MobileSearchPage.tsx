import React, { useState, useEffect, useCallback } from 'react';
import { 
  Input, 
  List, 
  Card, 
  Tag, 
  Button, 
  Spin, 
  Empty, 
  message, 
  Drawer,
  Tabs,
  Space,
  Divider,
  Typography,
  Badge
} from 'antd';
import { 
  SearchOutlined, 
  HistoryOutlined, 
  FireOutlined, 
  DeleteOutlined, 
  InfoCircleOutlined,
  StarOutlined,
  EyeOutlined,
  HeartOutlined,
  ShareAltOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  WifiOutlined,
  WifiOutlined as WifiOffOutlined
} from '@ant-design/icons';
import SearchComponent from '../../components/SearchComponent';
import { searchApi } from '../../services/searchApi';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const { Search } = Input;
const { Text, Title } = Typography;
const { TabPane } = Tabs;

interface SearchResult {
  id: number;
  name: string;
  highlightedName: string;
  description: string;
  highlightedDescription: string;
  price: number;
  image: string;
  category: {
    id: number;
    name: string;
  };
  rating?: number;
  reviewCount?: number;
}

interface FilterOptions {
  category: string;
  priceRange: string;
  rating: string;
  sortBy: string;
}

const MobileSearchPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    category: 'all',
    priceRange: 'all',
    rating: 'all',
    sortBy: 'relevance'
  });
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  // 监听网络状态
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 执行搜索
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await searchApi.fulltextSearch({ 
        q: query,
        category: filters.category !== 'all' ? filters.category : undefined,
        sortBy: filters.sortBy
      });
      
      if ('success' in response && response.success) {
        setSearchResults(response.data.results);
        setFilteredResults(response.data.results);
      }
    } catch (error) {
      console.error('搜索失败:', error);
      message.error('搜索失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  }, [filters.category, filters.sortBy]);

  // 处理搜索
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    performSearch(query);
  };

  // 应用过滤器
  const applyFilters = useCallback(() => {
    let filtered = [...searchResults];

    // 分类过滤
    if (filters.category !== 'all') {
      filtered = filtered.filter(item => item.category.name === filters.category);
    }

    // 价格范围过滤
    if (filters.priceRange !== 'all') {
      switch (filters.priceRange) {
        case 'free':
          filtered = filtered.filter(item => item.price === 0);
          break;
        case 'low':
          filtered = filtered.filter(item => item.price > 0 && item.price <= 50);
          break;
        case 'medium':
          filtered = filtered.filter(item => item.price > 50 && item.price <= 200);
          break;
        case 'high':
          filtered = filtered.filter(item => item.price > 200);
          break;
      }
    }

    // 评分过滤
    if (filters.rating !== 'all' && filters.rating) {
      const minRating = parseInt(filters.rating);
      filtered = filtered.filter(item => (item.rating || 0) >= minRating);
    }

    // 排序
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredResults(filtered);
  }, [searchResults, filters]);

  // 当过滤器变化时重新应用
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // 处理结果点击
  const handleResultClick = (result: SearchResult) => {
    setSelectedResult(result);
    setDrawerVisible(true);
  };

  // 处理收藏
  const handleFavorite = (result: SearchResult) => {
    message.success('已添加到收藏');
    // TODO: 实现收藏功能
  };

  // 处理分享
  const handleShare = (result: SearchResult) => {
    if (navigator.share) {
      navigator.share({
        title: result.name,
        text: result.description,
        url: window.location.href
      });
    } else {
      message.success('分享功能开发中');
    }
  };

  // 渲染搜索结果项
  const renderSearchResultItem = (item: SearchResult) => (
    <Card
      hoverable
      style={{ marginBottom: 12 }}
      onClick={() => handleResultClick(item)}
      bodyStyle={{ padding: 12 }}
    >
      <div style={{ display: 'flex' }}>
        <img
          alt={item.name}
          src={item.image}
          style={{ 
            width: 80, 
            height: 80, 
            objectFit: 'cover',
            borderRadius: 8,
            marginRight: 12
          }}
        />
        <div style={{ flex: 1 }}>
          <div 
            dangerouslySetInnerHTML={{ __html: item.highlightedName }}
            style={{ 
              fontSize: 16, 
              fontWeight: 'bold',
              marginBottom: 4,
              lineHeight: 1.4
            }}
          />
          <div 
            dangerouslySetInnerHTML={{ __html: item.highlightedDescription }}
            style={{ 
              fontSize: 14, 
              color: '#666',
              marginBottom: 8,
              lineHeight: 1.3,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text strong style={{ color: '#f50', fontSize: 16 }}>
                ¥{item.price}
              </Text>
              <Tag color="blue" style={{ marginLeft: 8 }}>
                {item.category.name}
              </Tag>
            </div>
            <Space>
              <Button 
                type="text" 
                size="small" 
                icon={<HeartOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleFavorite(item);
                }}
              />
              <Button 
                type="text" 
                size="small" 
                icon={<ShareAltOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare(item);
                }}
              />
            </Space>
          </div>
        </div>
      </div>
    </Card>
  );

  // 渲染过滤器面板
  const renderFilterPanel = () => (
    <Drawer
      title="筛选和排序"
      placement="bottom"
      height="60%"
      visible={showFilters}
      onClose={() => setShowFilters(false)}
      bodyStyle={{ padding: 16 }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* 分类筛选 */}
        <div>
          <Text strong>分类</Text>
          <div style={{ marginTop: 8 }}>
            <Button
              type={filters.category === 'all' ? 'primary' : 'default'}
              size="small"
              style={{ margin: 4 }}
              onClick={() => setFilters({ ...filters, category: 'all' })}
            >
              全部
            </Button>
            {['海滨风光', '文化古迹', '海岛风光', '自然风光', '主题公园'].map(category => (
              <Button
                key={category}
                type={filters.category === category ? 'primary' : 'default'}
                size="small"
                style={{ margin: 4 }}
                onClick={() => setFilters({ ...filters, category })}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <Divider />

        {/* 价格范围 */}
        <div>
          <Text strong>价格范围</Text>
          <div style={{ marginTop: 8 }}>
            {[
              { key: 'all', label: '全部' },
              { key: 'free', label: '免费' },
              { key: 'low', label: '0-50元' },
              { key: 'medium', label: '50-200元' },
              { key: 'high', label: '200元以上' }
            ].map(range => (
              <Button
                key={range.key}
                type={filters.priceRange === range.key ? 'primary' : 'default'}
                size="small"
                style={{ margin: 4 }}
                onClick={() => setFilters({ ...filters, priceRange: range.key })}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>

        <Divider />

        {/* 排序方式 */}
        <div>
          <Text strong>排序方式</Text>
          <div style={{ marginTop: 8 }}>
            {[
              { key: 'relevance', label: '相关度' },
              { key: 'price', label: '价格从低到高' },
              { key: 'price-desc', label: '价格从高到低' },
              { key: 'rating', label: '评分' },
              { key: 'name', label: '名称' }
            ].map(sort => (
              <Button
                key={sort.key}
                type={filters.sortBy === sort.key ? 'primary' : 'default'}
                size="small"
                style={{ margin: 4 }}
                onClick={() => setFilters({ ...filters, sortBy: sort.key })}
              >
                {sort.label}
              </Button>
            ))}
          </div>
        </div>
      </Space>
    </Drawer>
  );

  // 渲染详情抽屉
  const renderDetailDrawer = () => (
    <Drawer
      title={selectedResult?.name}
      placement="right"
      width="100%"
      visible={drawerVisible}
      onClose={() => setDrawerVisible(false)}
      bodyStyle={{ padding: 16 }}
    >
      {selectedResult && (
        <div>
          <img
            alt={selectedResult.name}
            src={selectedResult.image}
            style={{ 
              width: '100%', 
              height: 200, 
              objectFit: 'cover',
              borderRadius: 8,
              marginBottom: 16
            }}
          />
          
          <div 
            dangerouslySetInnerHTML={{ __html: selectedResult.highlightedDescription }}
            style={{ 
              fontSize: 16, 
              lineHeight: 1.6,
              marginBottom: 16
            }}
          />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text strong style={{ color: '#f50', fontSize: 20 }}>
              ¥{selectedResult.price}
            </Text>
            <Tag color="blue">{selectedResult.category.name}</Tag>
          </div>
          
          <Space style={{ width: '100%' }}>
            <Button type="primary" block>
              立即购买
            </Button>
            <Button 
              icon={<HeartOutlined />}
              onClick={() => handleFavorite(selectedResult)}
            >
              收藏
            </Button>
            <Button 
              icon={<ShareAltOutlined />}
              onClick={() => handleShare(selectedResult)}
            >
              分享
            </Button>
          </Space>
        </div>
      )}
    </Drawer>
  );

  return (
    <div style={{ padding: 16, minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* 网络状态提示 */}
      {!isOnline && (
        <div style={{ 
          backgroundColor: '#fff2e8', 
          border: '1px solid #ffbb96', 
          borderRadius: 8, 
          padding: 12, 
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center'
        }}>
          <WifiOffOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
          <Text>当前处于离线模式，部分功能可能受限</Text>
        </div>
      )}

      {/* 搜索栏 */}
      <div style={{ marginBottom: 16 }}>
        <SearchComponent
          onSearch={handleSearch}
          placeholder="搜索景点、商品..."
          mobileOptimized={true}
          showSuggestions={true}
          showHistory={true}
          showPopular={true}
        />
      </div>

      {/* 过滤器按钮 */}
      <div style={{ marginBottom: 16 }}>
        <Button
          icon={<FilterOutlined />}
          onClick={() => setShowFilters(true)}
          style={{ marginRight: 8 }}
        >
          筛选
        </Button>
        <Button
          icon={<SortAscendingOutlined />}
          onClick={() => setShowFilters(true)}
        >
          排序
        </Button>
      </div>

      {/* 搜索结果 */}
      <div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>搜索中...</div>
          </div>
        ) : filteredResults.length > 0 ? (
          <List
            dataSource={filteredResults}
            renderItem={renderSearchResultItem}
            style={{ backgroundColor: 'transparent' }}
          />
        ) : searchQuery ? (
          <Empty 
            description="未找到相关结果" 
            style={{ marginTop: 40 }}
          />
        ) : null}
      </div>

      {/* 过滤器面板 */}
      {renderFilterPanel()}

      {/* 详情抽屉 */}
      {renderDetailDrawer()}
    </div>
  );
};

export default MobileSearchPage; 