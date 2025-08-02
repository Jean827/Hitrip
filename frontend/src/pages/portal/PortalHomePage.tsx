import React, { useState, useEffect } from 'react';
import { Carousel, Card, Row, Col, Typography, Button, Space, Tag, Avatar } from 'antd';
import { 
  EnvironmentOutlined, 
  StarOutlined, 
  EyeOutlined, 
  HeartOutlined,
  CalendarOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;

interface Attraction {
  id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  views: number;
  location: string;
  tags: string[];
  price: number;
}

interface News {
  id: string;
  title: string;
  summary: string;
  image: string;
  publishDate: string;
  author: string;
  category: string;
}

const PortalHomePage: React.FC = () => {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  // 模拟数据
  useEffect(() => {
    const mockAttractions: Attraction[] = [
      {
        id: '1',
        name: '三亚湾',
        description: '三亚湾是三亚市最美丽的海湾之一，拥有绵延的海岸线和洁白的沙滩。',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
        rating: 4.8,
        views: 12500,
        location: '三亚市',
        tags: ['海滩', '日落', '摄影'],
        price: 0
      },
      {
        id: '2',
        name: '天涯海角',
        description: '天涯海角是海南最著名的旅游景点之一，象征着浪漫与永恒。',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
        rating: 4.6,
        views: 9800,
        location: '三亚市',
        tags: ['地标', '文化', '历史'],
        price: 80
      },
      {
        id: '3',
        name: '南山文化旅游区',
        description: '南山文化旅游区是集佛教文化、园林艺术、生态旅游于一体的综合性景区。',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
        rating: 4.7,
        views: 11200,
        location: '三亚市',
        tags: ['佛教', '文化', '园林'],
        price: 150
      },
      {
        id: '4',
        name: '蜈支洲岛',
        description: '蜈支洲岛被誉为"东方马尔代夫"，是潜水和水上运动的天堂。',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
        rating: 4.9,
        views: 15800,
        location: '三亚市',
        tags: ['海岛', '潜水', '水上运动'],
        price: 200
      }
    ];

    const mockNews: News[] = [
      {
        id: '1',
        title: '海南自贸港建设新政策发布，旅游业迎来新机遇',
        summary: '最新政策将为海南旅游业带来更多发展机遇，包括免税购物、签证便利等多项利好。',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300',
        publishDate: '2024-01-15',
        author: '海南日报',
        category: '政策动态'
      },
      {
        id: '2',
        title: '三亚新增5A级景区，旅游品质再升级',
        summary: '三亚市新增一处5A级旅游景区，为游客提供更优质的旅游体验。',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300',
        publishDate: '2024-01-12',
        author: '三亚晚报',
        category: '景区动态'
      },
      {
        id: '3',
        title: '海南特色美食推荐：不可错过的地道美味',
        summary: '盘点海南最具代表性的特色美食，带你品尝最地道的海南味道。',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300',
        publishDate: '2024-01-10',
        author: '美食达人',
        category: '美食攻略'
      }
    ];

    setAttractions(mockAttractions);
    setNews(mockNews);
    setLoading(false);
  }, []);

  const carouselItems = [
    {
      id: '1',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200',
      title: '探索海南之美',
      subtitle: '发现热带天堂的无限魅力'
    },
    {
      id: '2',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200',
      title: '三亚湾日落',
      subtitle: '感受海天一色的壮美景色'
    },
    {
      id: '3',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200',
      title: '热带雨林探险',
      subtitle: '体验原始森林的神秘魅力'
    }
  ];

  return (
    <div className="portal-home-page">
      {/* 轮播图 */}
      <section className="hero-section">
        <Carousel autoplay effect="fade" className="hero-carousel">
          {carouselItems.map(item => (
            <div key={item.id} className="carousel-item">
              <div 
                className="carousel-bg" 
                style={{ backgroundImage: `url(${item.image})` }}
              >
                <div className="carousel-content">
                  <Title level={1} className="carousel-title">
                    {item.title}
                  </Title>
                  <Paragraph className="carousel-subtitle">
                    {item.subtitle}
                  </Paragraph>
                  <Space>
                    <Button type="primary" size="large">
                      开始探索
                    </Button>
                    <Button size="large">
                      了解更多
                    </Button>
                  </Space>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </section>

      {/* 景点推荐 */}
      <section className="attractions-section">
        <div className="container mx-auto px-4 py-12">
          <div className="section-header text-center mb-12">
            <Title level={2}>热门景点推荐</Title>
            <Paragraph className="text-gray-600">
              精选海南最受欢迎的旅游景点，带您领略热带天堂的独特魅力
            </Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            {attractions.map(attraction => (
              <Col xs={24} sm={12} lg={6} key={attraction.id}>
                <Card
                  hoverable
                  cover={
                    <div className="attraction-image">
                      <img 
                        alt={attraction.name} 
                        src={attraction.image}
                        className="w-full h-48 object-cover"
                      />
                      <div className="attraction-overlay">
                        <Button type="primary" size="small">
                          查看详情
                        </Button>
                      </div>
                    </div>
                  }
                  className="attraction-card"
                >
                  <div className="attraction-content">
                    <Title level={4} className="mb-2">
                      <Link to={`/attractions/${attraction.id}`}>
                        {attraction.name}
                      </Link>
                    </Title>
                    
                    <Paragraph className="text-gray-600 mb-3" ellipsis={{ rows: 2 }}>
                      {attraction.description}
                    </Paragraph>

                    <div className="attraction-meta mb-3">
                      <Space>
                        <Text type="secondary">
                          <EnvironmentOutlined /> {attraction.location}
                        </Text>
                        <Text type="secondary">
                          <StarOutlined /> {attraction.rating}
                        </Text>
                        <Text type="secondary">
                          <EyeOutlined /> {attraction.views}
                        </Text>
                      </Space>
                    </div>

                    <div className="attraction-tags mb-3">
                      {attraction.tags.map(tag => (
                        <Tag key={tag} color="blue">{tag}</Tag>
                      ))}
                    </div>

                    <div className="attraction-footer">
                      <Space className="w-full justify-between">
                        <Text strong className="text-lg">
                          {attraction.price === 0 ? '免费' : `¥${attraction.price}`}
                        </Text>
                        <Button type="primary" size="small">
                          <HeartOutlined /> 收藏
                        </Button>
                      </Space>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          <div className="text-center mt-8">
            <Button type="primary" size="large">
              查看更多景点
            </Button>
          </div>
        </div>
      </section>

      {/* 新闻资讯 */}
      <section className="news-section bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="section-header text-center mb-12">
            <Title level={2}>最新资讯</Title>
            <Paragraph className="text-gray-600">
              了解海南旅游最新动态，获取实用的旅游攻略和资讯
            </Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            {news.map(item => (
              <Col xs={24} sm={12} lg={8} key={item.id}>
                <Card
                  hoverable
                  className="news-card"
                  cover={
                    <img 
                      alt={item.title} 
                      src={item.image}
                      className="w-full h-48 object-cover"
                    />
                  }
                >
                  <div className="news-content">
                    <div className="news-meta mb-2">
                      <Space>
                        <Tag color="green">{item.category}</Tag>
                        <Text type="secondary">
                          <CalendarOutlined /> {item.publishDate}
                        </Text>
                        <Text type="secondary">
                          <UserOutlined /> {item.author}
                        </Text>
                      </Space>
                    </div>

                    <Title level={4} className="mb-3">
                      <Link to={`/news/${item.id}`}>
                        {item.title}
                      </Link>
                    </Title>

                    <Paragraph className="text-gray-600 mb-4" ellipsis={{ rows: 3 }}>
                      {item.summary}
                    </Paragraph>

                    <Button type="link" className="p-0">
                      阅读更多 →
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          <div className="text-center mt-8">
            <Button size="large">
              查看更多资讯
            </Button>
          </div>
        </div>
      </section>

      {/* 特色服务 */}
      <section className="services-section">
        <div className="container mx-auto px-4 py-12">
          <div className="section-header text-center mb-12">
            <Title level={2}>特色服务</Title>
            <Paragraph className="text-gray-600">
              为您提供全方位的旅游服务，让您的海南之旅更加完美
            </Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} lg={6}>
              <Card className="service-card text-center">
                <div className="service-icon mb-4">
                  <EnvironmentOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                </div>
                <Title level={4}>智能导航</Title>
                <Paragraph className="text-gray-600">
                  精准定位，智能路线规划，让您轻松到达目的地
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="service-card text-center">
                <div className="service-icon mb-4">
                  <StarOutlined style={{ fontSize: '48px', color: '#52c41a' }} />
                </div>
                <Title level={4}>电子导游</Title>
                <Paragraph className="text-gray-600">
                  专业语音讲解，历史文化介绍，深度了解景点故事
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="service-card text-center">
                <div className="service-icon mb-4">
                  <HeartOutlined style={{ fontSize: '48px', color: '#f5222d' }} />
                </div>
                <Title level={4}>社区交流</Title>
                <Paragraph className="text-gray-600">
                  分享旅行体验，结识志同道合的旅行者
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="service-card text-center">
                <div className="service-icon mb-4">
                  <UserOutlined style={{ fontSize: '48px', color: '#722ed1' }} />
                </div>
                <Title level={4}>在线客服</Title>
                <Paragraph className="text-gray-600">
                  24小时在线服务，解答您的任何疑问
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
      </section>
    </div>
  );
};

export default PortalHomePage; 