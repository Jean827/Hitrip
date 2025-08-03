import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Button, 
  Space, 
  Tag, 
  Rate, 
  Divider, 
  List, 
  Avatar, 
  Tabs,
  Image,
  Descriptions,
  Statistic,
  Progress,
  Collapse,
  Timeline,
  Badge
} from 'antd';
import { 
  EnvironmentOutlined, 
  StarOutlined, 
  EyeOutlined, 
  HeartOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  PhoneOutlined,
  GlobalOutlined,
  CarOutlined,
  UserOutlined,
  LikeOutlined,
  DislikeOutlined,
  ShareAltOutlined,
  BookOutlined,
  CameraOutlined,
  TrophyOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;

interface AttractionDetail {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  images: string[];
  rating: number;
  totalRatings: number;
  views: number;
  location: string;
  address: string;
  tags: string[];
  price: number;
  category: string;
  distance: number;
  openTime: string;
  closeTime: string;
  phone: string;
  website: string;
  area: string;
  bestTime: string;
  duration: string;
  facilities: string[];
  transportation: {
    car: string;
    bus: string;
    subway: string;
  };
  highlights: string[];
  tips: string[];
  reviews: Review[];
  nearbyAttractions: NearbyAttraction[];
}

interface Review {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  rating: number;
  content: string;
  date: string;
  likes: number;
  images: string[];
}

interface NearbyAttraction {
  id: string;
  name: string;
  image: string;
  distance: number;
  rating: number;
}

const AttractionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [attraction, setAttraction] = useState<AttractionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isFavorite, setIsFavorite] = useState(false);

  // 模拟数据
  useEffect(() => {
    const mockAttraction: AttractionDetail = {
      id: '1',
      name: '三亚湾',
      description: '三亚湾是三亚市最美丽的海湾之一，拥有绵延的海岸线和洁白的沙滩。',
      longDescription: `三亚湾位于海南省三亚市，是三亚市最美丽的海湾之一。这里拥有绵延的海岸线、洁白的沙滩和清澈的海水，是游客休闲度假的理想去处。

三亚湾的海滩长达20多公里，沙质细腻，海水清澈见底。这里不仅适合游泳、日光浴，还是观赏日落的绝佳地点。每当夕阳西下，金色的阳光洒在海面上，形成"海天一色"的壮美景色。

除了美丽的海滩，三亚湾周边还有许多高档酒店、餐厅和购物中心，为游客提供完善的配套设施。这里也是三亚市重要的旅游区域，每年吸引大量国内外游客前来观光度假。`,
      images: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'
      ],
      rating: 4.8,
      totalRatings: 1250,
      views: 12500,
      location: '三亚市',
      address: '海南省三亚市三亚湾路',
      tags: ['海滩', '日落', '摄影', '游泳', '休闲'],
      price: 0,
      category: '自然景观',
      distance: 2.5,
      openTime: '全天开放',
      closeTime: '全天开放',
      phone: '0898-12345678',
      website: 'https://www.sanyawan.com',
      area: '约20平方公里',
      bestTime: '全年适宜，11月-次年4月最佳',
      duration: '建议游玩2-4小时',
      facilities: ['停车场', '更衣室', '淋浴设施', '救生站', '餐饮区', '休息区'],
      transportation: {
        car: '从三亚市区驾车约15分钟可达',
        bus: '乘坐8路、15路公交车到三亚湾站下车',
        subway: '暂无地铁直达'
      },
      highlights: [
        '绵延20多公里的美丽海滩',
        '观赏日落的绝佳地点',
        '清澈见底的海水',
        '细腻的白色沙滩',
        '完善的配套设施'
      ],
      tips: [
        '建议傍晚时分前往观赏日落',
        '注意防晒，准备防晒用品',
        '游泳时注意安全，遵守救生员指示',
        '保持海滩清洁，不要乱扔垃圾',
        '旺季时建议提前预订酒店'
      ],
      reviews: [
        {
          id: '1',
          user: {
            name: '旅行者小王',
            avatar: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100'
          },
          rating: 5,
          content: '三亚湾真的很美，海水清澈，沙滩细腻，日落时分特别浪漫。强烈推荐！',
          date: '2024-01-15',
          likes: 25,
          images: []
        },
        {
          id: '2',
          user: {
            name: '摄影爱好者',
            avatar: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100'
          },
          rating: 4,
          content: '风景很美，是拍照的好地方。不过人有点多，建议早点去。',
          date: '2024-01-12',
          likes: 18,
          images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300']
        },
        {
          id: '3',
          user: {
            name: '度假达人',
            avatar: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100'
          },
          rating: 5,
          content: '在这里住了三天，每天都能看到不同的美景。酒店服务也很好，值得推荐。',
          date: '2024-01-10',
          likes: 32,
          images: []
        }
      ],
      nearbyAttractions: [
        {
          id: '2',
          name: '天涯海角',
          image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200',
          distance: 15.2,
          rating: 4.6
        },
        {
          id: '3',
          name: '南山文化旅游区',
          image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200',
          distance: 25.8,
          rating: 4.7
        },
        {
          id: '4',
          name: '大东海',
          image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200',
          distance: 5.2,
          rating: 4.4
        }
      ]
    };

    setAttraction(mockAttraction);
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div>加载中...</div>
      </div>
    );
  }

  if (!attraction) {
    return (
      <div className="text-center py-12">
        <div>景点不存在</div>
      </div>
    );
  }

  const ratingDistribution = [
    { rating: 5, count: 750, percentage: 60 },
    { rating: 4, count: 300, percentage: 24 },
    { rating: 3, count: 150, percentage: 12 },
    { rating: 2, count: 30, percentage: 2.4 },
    { rating: 1, count: 20, percentage: 1.6 }
  ];

  return (
    <div className="attraction-detail-page">
      <div className="container mx-auto px-4 py-8">
        {/* 景点基本信息 */}
        <Card className="mb-6">
          <Row gutter={24}>
            <Col xs={24} lg={16}>
              <div className="attraction-header">
                <Title level={1} className="mb-4">
                  {attraction.name}
                </Title>
                
                <div className="attraction-meta mb-4">
                  <Space wrap>
                    <Text type="secondary">
                      <EnvironmentOutlined /> {attraction.location}
                    </Text>
                    <Text type="secondary">
                      <StarOutlined /> {attraction.rating} ({attraction.totalRatings}条评价)
                    </Text>
                    <Text type="secondary">
                      <EyeOutlined /> {attraction.views}次浏览
                    </Text>
                    <Text type="secondary">
                      <CalendarOutlined /> {attraction.category}
                    </Text>
                  </Space>
                </div>

                <div className="attraction-tags mb-4">
                  {attraction.tags.map(tag => (
                    <Tag key={tag} color="blue">{tag}</Tag>
                  ))}
                </div>

                <Paragraph className="text-lg mb-6">
                  {attraction.description}
                </Paragraph>

                <Space size="large">
                  <Button 
                    type="primary" 
                    size="large"
                    icon={<HeartOutlined />}
                    onClick={() => setIsFavorite(!isFavorite)}
                  >
                    {isFavorite ? '已收藏' : '收藏'}
                  </Button>
                  <Button size="large" icon={<ShareAltOutlined />}>
                    分享
                  </Button>
                  <Button size="large" icon={<BookOutlined />}>
                    预订
                  </Button>
                </Space>
              </div>
            </Col>

            <Col xs={24} lg={8}>
              <div className="attraction-stats">
                <Card>
                  <Statistic
                    title="门票价格"
                    value={attraction.price}
                    prefix="¥"
                    suffix={attraction.price === 0 ? '免费' : ''}
                  />
                  <Divider />
                  <Statistic
                    title="开放时间"
                    value={attraction.openTime}
                    suffix={attraction.closeTime !== attraction.openTime ? ` - ${attraction.closeTime}` : ''}
                  />
                  <Divider />
                  <Statistic
                    title="建议游玩时间"
                    value={attraction.duration}
                  />
                  <Divider />
                  <Statistic
                    title="距离市区"
                    value={attraction.distance}
                    suffix="公里"
                  />
                </Card>
              </div>
            </Col>
          </Row>
        </Card>

        {/* 图片展示 */}
        <Card title="景点图片" className="mb-6">
          <Image.PreviewGroup>
            <Row gutter={[16, 16]}>
              {attraction.images.map((image, index) => (
                <Col xs={24} sm={12} lg={8} key={index}>
                  <Image
                    src={image}
                    alt={`${attraction.name} - 图片${index + 1}`}
                    className="w-full h-64 object-cover rounded"
                  />
                </Col>
              ))}
            </Row>
          </Image.PreviewGroup>
        </Card>

        {/* 详细信息标签页 */}
        <Card>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="概览" key="overview">
              <Row gutter={24}>
                <Col xs={24} lg={16}>
                  <div className="overview-content">
                    <Title level={3}>景点介绍</Title>
                    <Paragraph className="text-lg leading-relaxed">
                      {attraction.longDescription}
                    </Paragraph>

                    <Divider />

                    <Title level={3}>景点亮点</Title>
                    <List
                      dataSource={attraction.highlights}
                      renderItem={item => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<TrophyOutlined style={{ color: '#faad14' }} />}
                            title={item}
                          />
                        </List.Item>
                      )}
                    />

                    <Divider />

                    <Title level={3}>游玩贴士</Title>
                    <List
                      dataSource={attraction.tips}
                      renderItem={item => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<CameraOutlined style={{ color: '#52c41a' }} />}
                            title={item}
                          />
                        </List.Item>
                      )}
                    />
                  </div>
                </Col>

                <Col xs={24} lg={8}>
                  <div className="overview-sidebar">
                    <Card title="基本信息" className="mb-4">
                      <Descriptions column={1} size="small">
                        <Descriptions.Item label="地址">{attraction.address}</Descriptions.Item>
                        <Descriptions.Item label="电话">{attraction.phone}</Descriptions.Item>
                        <Descriptions.Item label="官网">
                          <a href={attraction.website} target="_blank" rel="noopener noreferrer">
                            {attraction.website}
                          </a>
                        </Descriptions.Item>
                        <Descriptions.Item label="面积">{attraction.area}</Descriptions.Item>
                        <Descriptions.Item label="最佳游玩时间">{attraction.bestTime}</Descriptions.Item>
                      </Descriptions>
                    </Card>

                    <Card title="交通信息" className="mb-4">
                      <Collapse ghost>
                        <Panel header="自驾" key="1">
                          <Text>{attraction.transportation.car}</Text>
                        </Panel>
                        <Panel header="公交" key="2">
                          <Text>{attraction.transportation.bus}</Text>
                        </Panel>
                        <Panel header="地铁" key="3">
                          <Text>{attraction.transportation.subway}</Text>
                        </Panel>
                      </Collapse>
                    </Card>

                    <Card title="配套设施">
                      <div className="facilities-list">
                        {attraction.facilities.map(facility => (
                          <Tag key={facility} color="green" className="mb-2">
                            {facility}
                          </Tag>
                        ))}
                      </div>
                    </Card>
                  </div>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="评价" key="reviews">
              <div className="reviews-section">
                <Row gutter={24}>
                  <Col xs={24} lg={8}>
                    <Card title="评分统计">
                      <div className="rating-summary text-center mb-4">
                        <Title level={2}>{attraction.rating}</Title>
                        <Rate disabled defaultValue={attraction.rating} />
                        <Paragraph>
                          基于 {attraction.totalRatings} 条评价
                        </Paragraph>
                      </div>

                      <div className="rating-distribution">
                        {ratingDistribution.map(item => (
                          <div key={item.rating} className="rating-bar mb-2">
                            <Row align="middle">
                              <Col span={4}>
                                <Text>{item.rating}星</Text>
                              </Col>
                              <Col span={16}>
                                <Progress 
                                  percent={item.percentage} 
                                  showInfo={false}
                                  strokeColor="#faad14"
                                />
                              </Col>
                              <Col span={4}>
                                <Text type="secondary">{item.count}</Text>
                              </Col>
                            </Row>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </Col>

                  <Col xs={24} lg={16}>
                    <Card title="用户评价">
                      <List
                        dataSource={attraction.reviews}
                        renderItem={review => (
                          <List.Item>
                            <div className="review-item">
                              <div className="review-header flex items-center mb-2">
                                <Avatar src={review.user.avatar} className="mr-2" />
                                <div className="flex-1">
                                  <div className="font-medium">{review.user.name}</div>
                                  <div className="text-xs text-gray-500">{review.date}</div>
                                </div>
                                <Rate disabled defaultValue={review.rating} />
                              </div>
                              <div className="review-content mb-2">
                                {review.content}
                              </div>
                              <div className="review-actions">
                                <Space>
                                  <Button type="text" icon={<LikeOutlined />} size="small">
                                    {review.likes}
                                  </Button>
                                  <Button type="text" icon={<DislikeOutlined />} size="small">
                                    回复
                                  </Button>
                                </Space>
                              </div>
                            </div>
                            {review.images.length > 0 && (
                              <div className="review-images mt-2">
                                <Image.PreviewGroup>
                                  {review.images.map((image, index) => (
                                    <Image
                                      key={index}
                                      src={image}
                                      width={80}
                                      height={80}
                                      className="mr-2 rounded"
                                    />
                                  ))}
                                </Image.PreviewGroup>
                              </div>
                            )}
                          </List.Item>
                        )}
                      />
                    </Card>
                  </Col>
                </Row>
              </div>
            </TabPane>

            <TabPane tab="地图" key="map">
              <Card title="位置信息">
                <div className="map-container">
                  <div className="map-placeholder h-96 bg-gray-100 flex items-center justify-center">
                    <Text type="secondary">地图组件将在这里显示</Text>
                  </div>
                </div>
              </Card>
            </TabPane>

            <TabPane tab="周边景点" key="nearby">
              <Card title="附近推荐">
                <Row gutter={[16, 16]}>
                  {attraction.nearbyAttractions.map(item => (
                    <Col xs={24} sm={12} lg={8} key={item.id}>
                      <Card
                        hoverable
                        cover={
                          <img 
                            alt={item.name} 
                            src={item.image}
                            className="w-full h-32 object-cover"
                          />
                        }
                      >
                        <Card.Meta
                          title={item.name}
                          description={
                            <Space>
                              <Text type="secondary">
                                <EnvironmentOutlined /> {item.distance}km
                              </Text>
                              <Text type="secondary">
                                <StarOutlined /> {item.rating}
                              </Text>
                            </Space>
                          }
                        />
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card>
            </TabPane>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default AttractionDetailPage; 