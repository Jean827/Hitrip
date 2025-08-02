import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Input, 
  Select, 
  Button, 
  Tag, 
  Rate, 
  Space, 
  Pagination,
  Empty,
  Spin,
  Drawer,
  Descriptions,
  Image,
  Divider,
  Typography
} from 'antd';
import { 
  SearchOutlined,
  EnvironmentOutlined,
  StarOutlined,
  EyeOutlined,
  HeartOutlined,
  ShareAltOutlined,
  FilterOutlined,
  SortAscendingOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { Text, Title, Paragraph } = Typography;

interface Attraction {
  id: string;
  name: string;
  location: string;
  description: string;
  images: string[];
  rating: number;
  reviewCount: number;
  price: number;
  category: string;
  tags: string[];
  openingHours: string;
  contact: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  features: string[];
  tips: string[];
}

const AttractionsPage: React.FC = () => {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [filteredAttractions, setFilteredAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('rating');
  const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // 模拟景点数据
  const mockAttractions: Attraction[] = [
    {
      id: '1',
      name: '天涯海角',
      location: '三亚市天涯区',
      description: '天涯海角是海南省三亚市著名的海滨风景区，位于三亚市天涯区，距市区约23公里。这里碧海蓝天，椰风海韵，是著名的旅游胜地。',
      images: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'
      ],
      rating: 4.5,
      reviewCount: 1250,
      price: 120,
      category: '海滨风光',
      tags: ['5A景区', '海滨', '摄影'],
      openingHours: '08:00-18:00',
      contact: '0898-88888888',
      coordinates: {
        latitude: 18.252847,
        longitude: 109.511909
      },
      features: ['观海平台', '天涯石', '海角石', '椰林大道'],
      tips: ['建议傍晚时分前往，可以欣赏日落', '注意防晒，带好遮阳伞', '可以乘坐观光车游览']
    },
    {
      id: '2',
      name: '南山文化旅游区',
      location: '三亚市崖州区',
      description: '南山文化旅游区是国家5A级旅游景区，以佛教文化为主题，集观光、朝拜、休闲、度假于一体。',
      images: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'
      ],
      rating: 4.8,
      reviewCount: 980,
      price: 150,
      category: '文化古迹',
      tags: ['5A景区', '佛教文化', '祈福'],
      openingHours: '08:30-17:30',
      contact: '0898-88888889',
      coordinates: {
        latitude: 18.302847,
        longitude: 109.171909
      },
      features: ['海上观音', '南山寺', '不二法门', '长寿谷'],
      tips: ['注意着装得体，不要穿短裤拖鞋', '可以请香祈福', '建议请导游了解文化背景']
    },
    {
      id: '3',
      name: '亚龙湾',
      location: '三亚市吉阳区',
      description: '亚龙湾被誉为"天下第一湾"，拥有7公里长的月牙形海湾，沙质细腻，海水清澈，是著名的海滨度假胜地。',
      images: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'
      ],
      rating: 4.7,
      reviewCount: 2100,
      price: 0,
      category: '海滨风光',
      tags: ['免费', '海滨', '游泳', '潜水'],
      openingHours: '全天开放',
      contact: '0898-88888890',
      coordinates: {
        latitude: 18.202847,
        longitude: 109.651909
      },
      features: ['海滩', '潜水', '水上运动', '海鲜餐厅'],
      tips: ['最佳游泳时间是上午和下午', '注意安全，不要游得太远', '可以体验潜水和水上运动']
    },
    {
      id: '4',
      name: '蜈支洲岛',
      location: '三亚市海棠区',
      description: '蜈支洲岛是海南省著名的海岛旅游胜地，以其清澈的海水、丰富的海洋生物和多样的水上活动而闻名。',
      images: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'
      ],
      rating: 4.6,
      reviewCount: 1680,
      price: 180,
      category: '海岛风光',
      tags: ['海岛', '潜水', '水上运动', '珊瑚'],
      openingHours: '08:00-17:00',
      contact: '0898-88888891',
      coordinates: {
        latitude: 18.312847,
        longitude: 109.751909
      },
      features: ['潜水', '浮潜', '海钓', '珊瑚礁', '观海平台'],
      tips: ['需要乘船前往，注意晕船', '潜水需要提前预约', '注意保护海洋环境']
    }
  ];

  useEffect(() => {
    fetchAttractions();
  }, []);

  useEffect(() => {
    filterAndSortAttractions();
  }, [attractions, searchText, categoryFilter, priceFilter, sortBy]);

  const fetchAttractions = async () => {
    setLoading(true);
    try {
      // TODO: 调用API获取景点数据
      setTimeout(() => {
        setAttractions(mockAttractions);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('获取景点数据失败:', error);
      setLoading(false);
    }
  };

  const filterAndSortAttractions = () => {
    let filtered = attractions.filter(attraction => {
      const matchesSearch = attraction.name.toLowerCase().includes(searchText.toLowerCase()) ||
                           attraction.description.toLowerCase().includes(searchText.toLowerCase()) ||
                           attraction.location.toLowerCase().includes(searchText.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || attraction.category === categoryFilter;
      const matchesPrice = priceFilter === 'all' || 
                          (priceFilter === 'free' && attraction.price === 0) ||
                          (priceFilter === 'paid' && attraction.price > 0);
      
      return matchesSearch && matchesCategory && matchesPrice;
    });

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'price':
          return a.price - b.price;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredAttractions(filtered);
  };

  const handleViewDetails = (attraction: Attraction) => {
    setSelectedAttraction(attraction);
    setDrawerVisible(true);
  };

  const handleFavorite = (id: string) => {
    // TODO: 实现收藏功能
    console.log('收藏景点:', id);
  };

  const handleShare = (attraction: Attraction) => {
    // TODO: 实现分享功能
    console.log('分享景点:', attraction.name);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      '海滨风光': 'blue',
      '文化古迹': 'green',
      '海岛风光': 'cyan',
      '自然风光': 'orange',
      '主题公园': 'purple'
    };
    return colors[category] || 'default';
  };

  const renderAttractionCard = (attraction: Attraction) => (
    <Col xs={24} sm={12} md={8} lg={6} key={attraction.id}>
      <Card
        hoverable
        cover={
          <div style={{ height: 200, overflow: 'hidden' }}>
            <img
              alt={attraction.name}
              src={attraction.images[0]}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        }
        actions={[
          <EyeOutlined key="view" onClick={() => handleViewDetails(attraction)} />,
          <HeartOutlined key="favorite" onClick={() => handleFavorite(attraction.id)} />,
          <ShareAltOutlined key="share" onClick={() => handleShare(attraction)} />
        ]}
      >
        <Card.Meta
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text strong style={{ fontSize: '16px' }}>{attraction.name}</Text>
              <Tag color={getCategoryColor(attraction.category)}>{attraction.category}</Tag>
            </div>
          }
          description={
            <div>
              <div style={{ marginBottom: 8 }}>
                <EnvironmentOutlined style={{ marginRight: 4 }} />
                <Text type="secondary">{attraction.location}</Text>
              </div>
              <div style={{ marginBottom: 8 }}>
                <Rate disabled defaultValue={attraction.rating} style={{ fontSize: '12px' }} />
                <Text type="secondary" style={{ marginLeft: 4 }}>
                  ({attraction.reviewCount}条评价)
                </Text>
              </div>
              <div style={{ marginBottom: 8 }}>
                <Text strong style={{ color: '#f50' }}>
                  {attraction.price === 0 ? '免费' : `¥${attraction.price}`}
                </Text>
              </div>
              <div>
                {attraction.tags.slice(0, 2).map(tag => (
                  <Tag key={tag} size="small" style={{ marginBottom: 4 }}>
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

  const paginatedAttractions = filteredAttractions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>海南景点</Title>
        <Paragraph>
          探索海南最美的景点，感受热带海岛的魅力
        </Paragraph>
      </div>

      {/* 搜索和筛选 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8}>
            <Input
              placeholder="搜索景点名称、描述或位置"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={4}>
            <Select
              placeholder="分类筛选"
              value={categoryFilter}
              onChange={setCategoryFilter}
              style={{ width: '100%' }}
            >
              <Option value="all">全部分类</Option>
              <Option value="海滨风光">海滨风光</Option>
              <Option value="文化古迹">文化古迹</Option>
              <Option value="海岛风光">海岛风光</Option>
              <Option value="自然风光">自然风光</Option>
              <Option value="主题公园">主题公园</Option>
            </Select>
          </Col>
          <Col xs={12} sm={4}>
            <Select
              placeholder="价格筛选"
              value={priceFilter}
              onChange={setPriceFilter}
              style={{ width: '100%' }}
            >
              <Option value="all">全部价格</Option>
              <Option value="free">免费</Option>
              <Option value="paid">收费</Option>
            </Select>
          </Col>
          <Col xs={12} sm={4}>
            <Select
              placeholder="排序方式"
              value={sortBy}
              onChange={setSortBy}
              style={{ width: '100%' }}
            >
              <Option value="rating">按评分排序</Option>
              <Option value="price">按价格排序</Option>
              <Option value="name">按名称排序</Option>
            </Select>
          </Col>
          <Col xs={12} sm={4}>
            <Button type="primary" icon={<FilterOutlined />}>
              高级筛选
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 景点列表 */}
      <Spin spinning={loading}>
        {paginatedAttractions.length > 0 ? (
          <>
            <Row gutter={[16, 16]}>
              {paginatedAttractions.map(renderAttractionCard)}
            </Row>
            
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Pagination
                current={currentPage}
                total={filteredAttractions.length}
                pageSize={pageSize}
                onChange={setCurrentPage}
                showSizeChanger={false}
                showQuickJumper
                showTotal={(total, range) => 
                  `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`
                }
              />
            </div>
          </>
        ) : (
          <Empty
            description="暂无符合条件的景点"
            style={{ marginTop: 100 }}
          />
        )}
      </Spin>

      {/* 景点详情抽屉 */}
      <Drawer
        title={selectedAttraction?.name}
        placement="right"
        width={600}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {selectedAttraction && (
          <div>
            <Image.PreviewGroup>
              <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
                {selectedAttraction.images.map((image, index) => (
                  <Col span={12} key={index}>
                    <Image
                      src={image}
                      alt={`${selectedAttraction.name} ${index + 1}`}
                      style={{ width: '100%', height: 120, objectFit: 'cover' }}
                    />
                  </Col>
                ))}
              </Row>
            </Image.PreviewGroup>

            <Descriptions column={1} bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="位置">
                <EnvironmentOutlined style={{ marginRight: 4 }} />
                {selectedAttraction.location}
              </Descriptions.Item>
              <Descriptions.Item label="评分">
                <Rate disabled defaultValue={selectedAttraction.rating} />
                <Text type="secondary" style={{ marginLeft: 8 }}>
                  ({selectedAttraction.reviewCount}条评价)
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="门票价格">
                <Text strong style={{ color: '#f50' }}>
                  {selectedAttraction.price === 0 ? '免费' : `¥${selectedAttraction.price}`}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="开放时间">
                {selectedAttraction.openingHours}
              </Descriptions.Item>
              <Descriptions.Item label="联系电话">
                {selectedAttraction.contact}
              </Descriptions.Item>
            </Descriptions>

            <Divider>景点介绍</Divider>
            <Paragraph>{selectedAttraction.description}</Paragraph>

            <Divider>特色亮点</Divider>
            <div style={{ marginBottom: 16 }}>
              {selectedAttraction.features.map(feature => (
                <Tag key={feature} color="blue" style={{ marginBottom: 8 }}>
                  {feature}
                </Tag>
              ))}
            </div>

            <Divider>游玩贴士</Divider>
            <ul>
              {selectedAttraction.tips.map((tip, index) => (
                <li key={index} style={{ marginBottom: 8 }}>
                  <Text>{tip}</Text>
                </li>
              ))}
            </ul>

            <Divider>标签</Divider>
            <div>
              {selectedAttraction.tags.map(tag => (
                <Tag key={tag} style={{ marginBottom: 8 }}>
                  {tag}
                </Tag>
              ))}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default AttractionsPage; 