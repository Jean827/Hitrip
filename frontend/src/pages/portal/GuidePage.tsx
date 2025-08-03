import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  List, 
  Typography, 
  Space, 
  Tag, 
  Button, 
  Input, 
  Select, 
  Divider,
  message,
  Drawer,
  Image,
  Rate,
  Progress
} from 'antd';
import { 
  SearchOutlined, 
  PlayCircleOutlined, 
  DownloadOutlined,
  StarOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  HeartOutlined,
  ShareAltOutlined,
  SettingOutlined
} from '@ant-design/icons';
import AudioPlayer from '../../components/audio/AudioPlayer';

const { Search } = Input;
const { Option } = Select;
const { Title, Paragraph, Text } = Typography;

interface GuideAttraction {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  image: string;
  rating: number;
  location: string;
  coordinates: [number, number];
  tags: string[];
  price: number;
  category: string;
  openTime: string;
  closeTime: string;
  audioTracks: {
    id: string;
    title: string;
    description: string;
    language: 'zh' | 'en';
    url: string;
    duration: number;
    size: number;
    isDownloaded: boolean;
  }[];
  historicalInfo: string;
  culturalSignificance: string;
  tips: string[];
  nearbyAttractions: string[];
}

const GuidePage: React.FC = () => {
  const [attractions, setAttractions] = useState<GuideAttraction[]>([]);
  const [filteredAttractions, setFilteredAttractions] = useState<GuideAttraction[]>([]);
  const [selectedAttraction, setSelectedAttraction] = useState<GuideAttraction | null>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<'zh' | 'en'>('zh');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [audioDrawerVisible, setAudioDrawerVisible] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<{[key: string]: number}>({});

  // 模拟数据
  useEffect(() => {
    const mockAttractions: GuideAttraction[] = [
      {
        id: '1',
        name: '天涯海角',
        description: '天涯海角是海南最著名的旅游景点之一，象征着浪漫与永恒。',
        longDescription: '天涯海角位于海南省三亚市天涯区，是海南岛最南端的标志性景点。这里有着悠久的历史文化，自古以来就是文人墨客吟诗作赋的地方。景区内有着"天涯"、"海角"、"南天一柱"等著名石刻，以及美丽的海滩和椰林。',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
        rating: 4.6,
        location: '三亚市天涯区',
        coordinates: [109.3500, 18.3000],
        tags: ['地标', '文化', '历史', '海滩'],
        price: 80,
        category: '文化古迹',
        openTime: '08:00',
        closeTime: '18:00',
        audioTracks: [
          {
            id: '1-zh',
            title: '天涯海角中文导览',
            description: '详细介绍天涯海角的历史文化和景点特色',
            language: 'zh',
            url: 'https://example.com/audio/tianyahaijiao-zh.mp3',
            duration: 180,
            size: 2.5,
            isDownloaded: false
          },
          {
            id: '1-en',
            title: 'Tianya Haijiao English Guide',
            description: 'Detailed introduction to Tianya Haijiao history and culture',
            language: 'en',
            url: 'https://example.com/audio/tianyahaijiao-en.mp3',
            duration: 200,
            size: 3.0,
            isDownloaded: false
          }
        ],
        historicalInfo: '天涯海角的历史可以追溯到汉代，当时这里被称为"天涯"。唐代诗人张九龄曾在此留下"海内存知己，天涯若比邻"的千古名句。明清时期，这里成为文人墨客的朝圣之地。',
        culturalSignificance: '天涯海角不仅是一个地理概念，更是一个文化符号。它象征着中国最南端的边界，也代表着人们对远方和未知的向往。这里的石刻文化、海洋文化和椰林文化相互交融，形成了独特的海南文化景观。',
        tips: [
          '建议在日落时分前往，可以欣赏到最美的海景',
          '景区内设有休息区和餐饮区',
          '注意防晒和防暑',
          '可以购买纪念品和特产'
        ],
        nearbyAttractions: ['南山文化旅游区', '大小洞天', '三亚湾']
      },
      {
        id: '2',
        name: '南山文化旅游区',
        description: '南山文化旅游区是集佛教文化、园林艺术、生态旅游于一体的综合性景区。',
        longDescription: '南山文化旅游区位于海南省三亚市南山镇，是一个集佛教文化、园林艺术、生态旅游、民俗文化于一体的综合性景区。景区内有108米高的海上观音像，是世界上最高的海上观音像。',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
        rating: 4.7,
        location: '三亚市南山镇',
        coordinates: [109.1833, 18.3000],
        tags: ['佛教', '文化', '园林', '观音'],
        price: 150,
        category: '宗教文化',
        openTime: '08:00',
        closeTime: '17:30',
        audioTracks: [
          {
            id: '2-zh',
            title: '南山文化旅游区中文导览',
            description: '详细介绍南山佛教文化和园林艺术',
            language: 'zh',
            url: 'https://example.com/audio/nanshan-zh.mp3',
            duration: 240,
            size: 3.5,
            isDownloaded: false
          },
          {
            id: '2-en',
            title: 'Nanshan Cultural Tourism Zone English Guide',
            description: 'Detailed introduction to Nanshan Buddhist culture and garden art',
            language: 'en',
            url: 'https://example.com/audio/nanshan-en.mp3',
            duration: 260,
            size: 4.0,
            isDownloaded: false
          }
        ],
        historicalInfo: '南山文化旅游区始建于1995年，以"福寿南山，海天佛国"为主题，融合了佛教文化、园林艺术和现代旅游理念。景区内的海上观音像于2005年建成，是海南的标志性建筑之一。',
        culturalSignificance: '南山文化旅游区体现了中国传统文化中"福寿"的理念，将佛教文化与现代旅游相结合，为游客提供了一个了解中国传统文化和佛教文化的平台。',
        tips: [
          '建议穿着得体，注意礼仪',
          '可以参与佛教文化活动',
          '景区内设有素食餐厅',
          '注意保持安静，尊重宗教场所'
        ],
        nearbyAttractions: ['天涯海角', '大小洞天', '三亚湾']
      },
      {
        id: '3',
        name: '蜈支洲岛',
        description: '蜈支洲岛被誉为"东方马尔代夫"，是潜水和水上运动的天堂。',
        longDescription: '蜈支洲岛位于海南省三亚市海棠湾，是一个集海岛观光、潜水、水上运动、休闲度假于一体的综合性海岛景区。岛上有清澈的海水、洁白的沙滩和丰富的海洋生物。',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
        rating: 4.9,
        location: '三亚市海棠湾',
        coordinates: [109.7667, 18.3167],
        tags: ['海岛', '潜水', '水上运动', '度假'],
        price: 200,
        category: '海岛度假',
        openTime: '08:30',
        closeTime: '17:00',
        audioTracks: [
          {
            id: '3-zh',
            title: '蜈支洲岛中文导览',
            description: '详细介绍蜈支洲岛的海洋生态和旅游项目',
            language: 'zh',
            url: 'https://example.com/audio/wuzhizhou-zh.mp3',
            duration: 200,
            size: 3.0,
            isDownloaded: false
          },
          {
            id: '3-en',
            title: 'Wuzhizhou Island English Guide',
            description: 'Detailed introduction to Wuzhizhou marine ecology and tourism',
            language: 'en',
            url: 'https://example.com/audio/wuzhizhou-en.mp3',
            duration: 220,
            size: 3.5,
            isDownloaded: false
          }
        ],
        historicalInfo: '蜈支洲岛原名"牛奇洲"，因岛形似蜈蚣而得名。岛上有着丰富的海洋生态资源，是海南重要的海洋保护区之一。近年来，岛上开发了多种水上运动项目，成为著名的旅游胜地。',
        culturalSignificance: '蜈支洲岛体现了海南海洋文化的特色，将海洋生态保护与旅游开发相结合，为游客提供了一个了解海洋文化和体验海洋运动的机会。',
        tips: [
          '建议提前预订船票和住宿',
          '注意防晒和防暑',
          '可以参与潜水和水上运动',
          '注意保护海洋环境'
        ],
        nearbyAttractions: ['海棠湾', '亚龙湾', '大东海']
      }
    ];

    setAttractions(mockAttractions);
    setFilteredAttractions(mockAttractions);
  }, []);

  // 筛选逻辑
  useEffect(() => {
    let filtered = [...attractions];

    if (searchText) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.description.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    setFilteredAttractions(filtered);
  }, [attractions, searchText, selectedCategory]);

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  const handleAttractionClick = (attraction: GuideAttraction) => {
    setSelectedAttraction(attraction);
    setDrawerVisible(true);
  };

  const handleAudioClick = (attraction: GuideAttraction) => {
    setSelectedAttraction(attraction);
    setAudioDrawerVisible(true);
  };

  const handleDownload = (track: any) => {
    // 模拟下载进度
    setDownloadProgress(prev => ({ ...prev, [track.id]: 0 }));
    
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        const newProgress = (prev[track.id] || 0) + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          message.success('下载完成');
          return { ...prev, [track.id]: 100 };
        }
        return { ...prev, [track.id]: newProgress };
      });
    }, 200);
  };

  const categories = ['全部', '文化古迹', '宗教文化', '海岛度假', '自然景观', '城市公园'];

  return (
    <div className="guide-page">
      <div className="guide-container">
        <Row gutter={[16, 16]}>
          {/* 搜索和筛选 */}
          <Col span={24}>
            <Card>
              <Space direction="vertical" className="w-full" size="middle">
                <Search
                  placeholder="搜索景点"
                  onSearch={handleSearch}
                  allowClear
                  size="large"
                />
                <Select
                  placeholder="选择分类"
                  className="w-full"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  allowClear
                >
                  {categories.map(category => (
                    <Option key={category} value={category}>
                      {category}
                    </Option>
                  ))}
                </Select>
              </Space>
            </Card>
          </Col>

          {/* 景点列表 */}
          <Col span={24}>
            <List
              grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }}
              dataSource={filteredAttractions}
              renderItem={attraction => (
                <List.Item>
                  <Card
                    hoverable
                    cover={
                      <Image
                        alt={attraction.name}
                        src={attraction.image}
                        style={{ height: 200, objectFit: 'cover' }}
                      />
                    }
                    actions={[
                      <Button 
                        key="audio" 
                        icon={<PlayCircleOutlined />}
                        onClick={() => handleAudioClick(attraction)}
                      >
                        导览
                      </Button>,
                      <Button 
                        key="detail" 
                        onClick={() => handleAttractionClick(attraction)}
                      >
                        详情
                      </Button>
                    ]}
                  >
                    <Card.Meta
                      title={
                        <div className="attraction-title">
                          <Text strong>{attraction.name}</Text>
                          <Rate disabled defaultValue={attraction.rating} style={{ fontSize: 12 }} />
                        </div>
                      }
                      description={
                        <div className="attraction-description">
                          <Paragraph ellipsis={{ rows: 2 }}>
                            {attraction.description}
                          </Paragraph>
                          <div className="attraction-tags">
                            {attraction.tags.slice(0, 3).map(tag => (
                              <Tag key={tag}>{tag}</Tag>
                            ))}
                          </div>
                          <div className="attraction-meta">
                            <Space>
                              <Text type="secondary">
                                <EnvironmentOutlined /> {attraction.location}
                              </Text>
                              <Text type="secondary">
                                <DollarOutlined /> {attraction.price === 0 ? '免费' : `¥${attraction.price}`}
                              </Text>
                            </Space>
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </List.Item>
              )}
            />
          </Col>
        </Row>
      </div>

      {/* 景点详情抽屉 */}
      <Drawer
        title={selectedAttraction?.name}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={600}
      >
        {selectedAttraction && (
          <div className="attraction-detail">
            <Image
              src={selectedAttraction.image}
              alt={selectedAttraction.name}
              style={{ width: '100%', height: 200, objectFit: 'cover', marginBottom: 16 }}
            />
            
            <Title level={4}>{selectedAttraction.name}</Title>
            <Paragraph>{selectedAttraction.longDescription}</Paragraph>
            
            <Divider />
            
            <Title level={5}>历史文化</Title>
            <Paragraph>{selectedAttraction.historicalInfo}</Paragraph>
            
            <Title level={5}>文化意义</Title>
            <Paragraph>{selectedAttraction.culturalSignificance}</Paragraph>
            
            <Divider />
            
            <Title level={5}>实用贴士</Title>
            <ul>
              {selectedAttraction.tips.map((tip, index) => (
                <li key={index}>
                  <Text>{tip}</Text>
                </li>
              ))}
            </ul>
            
            <Divider />
            
            <Title level={5}>附近景点</Title>
            <Space wrap>
              {selectedAttraction.nearbyAttractions.map(attraction => (
                <Tag key={attraction} color="blue">{attraction}</Tag>
              ))}
            </Space>
            
            <Divider />
            
            <Space>
              <Button 
                type="primary" 
                icon={<PlayCircleOutlined />}
                onClick={() => {
                  setDrawerVisible(false);
                  setAudioDrawerVisible(true);
                }}
              >
                开始导览
              </Button>
              <Button icon={<HeartOutlined />}>收藏</Button>
              <Button icon={<ShareAltOutlined />}>分享</Button>
            </Space>
          </div>
        )}
      </Drawer>

      {/* 音频导览抽屉 */}
      <Drawer
        title={`${selectedAttraction?.name} - 电子导览`}
        placement="right"
        onClose={() => setAudioDrawerVisible(false)}
        open={audioDrawerVisible}
        width={500}
      >
        {selectedAttraction && (
          <AudioPlayer
            tracks={selectedAttraction.audioTracks}
            onDownload={handleDownload}
            autoPlay={false}
          />
        )}
      </Drawer>
    </div>
  );
};

export default GuidePage; 