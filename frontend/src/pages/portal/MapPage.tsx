import React, { useState, useEffect, useRef } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Input, 
  Button, 
  Space, 
  Typography, 
  Select, 
  List, 
  Tag, 
  Divider,
  Drawer,
  Form,
  Switch,
  Slider,
  Checkbox,
  message
} from 'antd';
import { 
  SearchOutlined, 
  EnvironmentOutlined, 
  CarOutlined, 
  WalkOutlined, 
  StarOutlined,
  HeartOutlined,
  ShareAltOutlined,
  SettingOutlined,
  MyLocationOutlined,
  RouteOutlined,
  FilterOutlined
} from '@ant-design/icons';
import AmapComponent from '../../components/map/AmapComponent';

const { Search } = Input;
const { Option } = Select;
const { Title, Paragraph, Text } = Typography;

interface MapAttraction {
  id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  location: string;
  coordinates: [number, number]; // [经度, 纬度]
  tags: string[];
  price: number;
  category: string;
  distance: number;
  openTime: string;
  closeTime: string;
}

interface RouteInfo {
  distance: string;
  duration: string;
  steps: string[];
}

const MapPage: React.FC = () => {
  const [attractions, setAttractions] = useState<MapAttraction[]>([]);
  const [filteredAttractions, setFilteredAttractions] = useState<MapAttraction[]>([]);
  const [selectedAttraction, setSelectedAttraction] = useState<MapAttraction | null>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [mapType, setMapType] = useState<'normal' | 'satellite'>('normal');
  const [showTraffic, setShowTraffic] = useState(false);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [routeMode, setRouteMode] = useState<'driving' | 'walking' | 'transit'>('driving');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const amapRef = useRef<any>(null);

  // 模拟数据
  useEffect(() => {
    const mockAttractions: MapAttraction[] = [
      {
        id: '1',
        name: '三亚湾',
        description: '三亚湾是三亚市最美丽的海湾之一，拥有绵延的海岸线和洁白的沙滩。',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
        rating: 4.8,
        location: '三亚市',
        coordinates: [109.5083, 18.2528],
        tags: ['海滩', '日落', '摄影'],
        price: 0,
        category: '自然景观',
        distance: 2.5,
        openTime: '全天开放',
        closeTime: '全天开放'
      },
      {
        id: '2',
        name: '天涯海角',
        description: '天涯海角是海南最著名的旅游景点之一，象征着浪漫与永恒。',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
        rating: 4.6,
        location: '三亚市',
        coordinates: [109.3500, 18.3000],
        tags: ['地标', '文化', '历史'],
        price: 80,
        category: '文化古迹',
        distance: 15.2,
        openTime: '08:00',
        closeTime: '18:00'
      },
      {
        id: '3',
        name: '南山文化旅游区',
        description: '南山文化旅游区是集佛教文化、园林艺术、生态旅游于一体的综合性景区。',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
        rating: 4.7,
        location: '三亚市',
        coordinates: [109.1833, 18.3000],
        tags: ['佛教', '文化', '园林'],
        price: 150,
        category: '宗教文化',
        distance: 25.8,
        openTime: '08:00',
        closeTime: '17:30'
      },
      {
        id: '4',
        name: '蜈支洲岛',
        description: '蜈支洲岛被誉为"东方马尔代夫"，是潜水和水上运动的天堂。',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
        rating: 4.9,
        location: '三亚市',
        coordinates: [109.7667, 18.3167],
        tags: ['海岛', '潜水', '水上运动'],
        price: 200,
        category: '海岛度假',
        distance: 35.6,
        openTime: '08:30',
        closeTime: '17:00'
      },
      {
        id: '5',
        name: '亚龙湾热带天堂森林公园',
        description: '亚龙湾热带天堂森林公园是集热带雨林、海洋风光、民俗文化于一体的生态旅游区。',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
        rating: 4.5,
        location: '三亚市',
        coordinates: [109.6333, 18.2000],
        tags: ['森林', '生态', '徒步'],
        price: 120,
        category: '自然景观',
        distance: 18.3,
        openTime: '08:00',
        closeTime: '17:30'
      },
      {
        id: '6',
        name: '大东海',
        description: '大东海是三亚市区最近的海湾，水质清澈，是游泳和冲浪的理想场所。',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
        rating: 4.4,
        location: '三亚市',
        coordinates: [109.5333, 18.2167],
        tags: ['海滩', '游泳', '冲浪'],
        price: 0,
        category: '自然景观',
        distance: 5.2,
        openTime: '全天开放',
        closeTime: '全天开放'
      }
    ];

    setAttractions(mockAttractions);
    setFilteredAttractions(mockAttractions);
  }, []);

  // 初始化地图
  useEffect(() => {
    if (mapContainerRef.current) {
      // 这里应该初始化高德地图
      // 由于没有实际的API密钥，我们使用占位符
      initializeMap();
    }
  }, []);

  const initializeMap = () => {
    // 模拟地图初始化
    console.log('地图初始化中...');
    // 实际项目中这里应该加载高德地图API
    // AMap.plugin(['AMap.Geolocation', 'AMap.Scale'], function() {
    //   const map = new AMap.Map(mapContainerRef.current, {
    //     zoom: 11,
    //     center: [109.5083, 18.2528]
    //   });
    //   setMapInstance(map);
    // });
  };

  const handleMapReady = (map: any) => {
    setMapInstance(map);
  };

  const handleRoutePlanning = () => {
    if (!selectedAttraction || !userLocation) {
      message.warning('请先选择目的地和获取当前位置');
      return;
    }

    if (amapRef.current) {
      amapRef.current.planRoute(selectedAttraction.coordinates, routeMode);
    }
  };

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

  const handleAttractionClick = (attraction: MapAttraction) => {
    setSelectedAttraction(attraction);
    // 在地图上定位到该景点
    if (mapInstance) {
      // mapInstance.setCenter(attraction.coordinates);
      // mapInstance.setZoom(15);
    }
  };

  const handleRoutePlanningClick = () => {
    if (!selectedAttraction || !userLocation) {
      message.warning('请先选择目的地和获取当前位置');
      return;
    }

    if (amapRef.current) {
      amapRef.current.planRoute(selectedAttraction.coordinates, routeMode);
    }

    // 模拟路线规划信息
    const mockRouteInfo: RouteInfo = {
      distance: '15.2公里',
      duration: '约25分钟',
      steps: [
        '从当前位置出发',
        '沿三亚湾路向东行驶',
        '右转进入天涯海角路',
        '继续行驶约10公里',
        '到达天涯海角景区'
      ]
    };

    setRouteInfo(mockRouteInfo);
    setDrawerVisible(true);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          setUserLocation([longitude, latitude]);
          message.success('已获取当前位置');
        },
        (error) => {
          message.error('获取位置失败: ' + error.message);
        }
      );
    } else {
      message.error('浏览器不支持地理定位');
    }
  };

  const categories = ['全部', '自然景观', '文化古迹', '宗教文化', '海岛度假', '城市公园'];

  return (
    <div className="map-page">
      <div className="map-container">
        <Row gutter={0} style={{ height: '100vh' }}>
          {/* 地图区域 */}
          <Col xs={24} lg={16} style={{ height: '100%' }}>
            <div className="map-wrapper" style={{ height: '100%', position: 'relative' }}>
              {/* 地图工具栏 */}
              <div className="map-toolbar" style={{ position: 'absolute', top: 20, left: 20, zIndex: 1000 }}>
                <Card size="small">
                  <Space direction="vertical">
                    <Button 
                      type="primary" 
                      icon={<MyLocationOutlined />}
                      onClick={getCurrentLocation}
                    >
                      定位
                    </Button>
                    <Button 
                      icon={<RouteOutlined />}
                      onClick={handleRoutePlanningClick}
                      disabled={!selectedAttraction}
                    >
                      路线
                    </Button>
                    <Button 
                      icon={<SettingOutlined />}
                      onClick={() => setDrawerVisible(true)}
                    >
                      设置
                    </Button>
                  </Space>
                </Card>
              </div>

              {/* 地图容器 */}
              <div 
                ref={mapContainerRef}
                className="map-content"
                style={{ 
                  width: '100%', 
                  height: '100%',
                  position: 'relative'
                }}
              >
                <AmapComponent
                  ref={amapRef}
                  attractions={attractions}
                  onAttractionClick={handleAttractionClick}
                  selectedAttraction={selectedAttraction}
                  mapType={mapType}
                  showTraffic={showTraffic}
                  userLocation={userLocation}
                  onMapReady={handleMapReady}
                />
              </div>
            </div>
          </Col>

          {/* 侧边栏 */}
          <Col xs={24} lg={8} style={{ height: '100%', overflow: 'auto' }}>
            <div className="map-sidebar" style={{ height: '100%', padding: '16px' }}>
              {/* 搜索栏 */}
              <Card className="mb-4">
                <Space direction="vertical" className="w-full" size="small">
                  <Search
                    placeholder="搜索景点"
                    onSearch={handleSearch}
                    allowClear
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

              {/* 景点列表 */}
              <Card title={`景点列表 (${filteredAttractions.length})`}>
                <List
                  dataSource={filteredAttractions}
                  renderItem={attraction => (
                    <List.Item
                      className={`attraction-item ${selectedAttraction?.id === attraction.id ? 'selected' : ''}`}
                      onClick={() => handleAttractionClick(attraction)}
                      style={{ cursor: 'pointer' }}
                    >
                      <List.Item.Meta
                        avatar={
                          <img 
                            src={attraction.image} 
                            alt={attraction.name}
                            style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }}
                          />
                        }
                        title={
                          <div className="attraction-title">
                            <Text strong>{attraction.name}</Text>
                            <Space>
                              <Text type="secondary">
                                <StarOutlined /> {attraction.rating}
                              </Text>
                              <Text type="secondary">
                                <EnvironmentOutlined /> {attraction.distance}km
                              </Text>
                            </Space>
                          </div>
                        }
                        description={
                          <div className="attraction-description">
                            <Paragraph ellipsis={{ rows: 2 }} className="mb-2">
                              {attraction.description}
                            </Paragraph>
                            <div className="attraction-tags">
                              {attraction.tags.slice(0, 3).map(tag => (
                                <Tag key={tag} size="small">{tag}</Tag>
                              ))}
                            </div>
                            <div className="attraction-meta mt-2">
                              <Space>
                                <Text type="secondary">
                                  {attraction.price === 0 ? '免费' : `¥${attraction.price}`}
                                </Text>
                                <Text type="secondary">
                                  {attraction.openTime}
                                </Text>
                              </Space>
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </div>
          </Col>
        </Row>
      </div>

      {/* 设置抽屉 */}
      <Drawer
        title="地图设置"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={400}
      >
        <Space direction="vertical" className="w-full" size="large">
          {/* 地图类型 */}
          <div>
            <Title level={5}>地图类型</Title>
            <Select
              value={mapType}
              onChange={setMapType}
              className="w-full"
            >
              <Option value="normal">标准地图</Option>
              <Option value="satellite">卫星地图</Option>
            </Select>
          </div>

          {/* 交通信息 */}
          <div>
            <Title level={5}>交通信息</Title>
            <Switch
              checked={showTraffic}
              onChange={setShowTraffic}
              checkedChildren="显示"
              unCheckedChildren="隐藏"
            />
          </div>

          {/* 路线规划 */}
          {selectedAttraction && (
            <div>
              <Title level={5}>路线规划</Title>
              <Space direction="vertical" className="w-full">
                <div>
                  <Text>目的地: {selectedAttraction.name}</Text>
                </div>
                <div>
                  <Text>出行方式:</Text>
                  <Select
                    value={routeMode}
                    onChange={setRouteMode}
                    className="w-full mt-2"
                  >
                    <Option value="driving">驾车</Option>
                    <Option value="walking">步行</Option>
                    <Option value="transit">公交</Option>
                  </Select>
                </div>
                {routeInfo && (
                  <div className="route-info">
                    <Divider />
                    <div className="route-summary">
                      <Text>距离: {routeInfo.distance}</Text>
                      <br />
                      <Text>时间: {routeInfo.duration}</Text>
                    </div>
                    <Divider />
                    <div className="route-steps">
                      <Title level={6}>路线详情:</Title>
                      <List
                        size="small"
                        dataSource={routeInfo.steps}
                        renderItem={(step, index) => (
                          <List.Item>
                            <Text>{index + 1}. {step}</Text>
                          </List.Item>
                        )}
                      />
                    </div>
                  </div>
                )}
              </Space>
            </div>
          )}

          {/* 当前位置 */}
          <div>
            <Title level={5}>当前位置</Title>
            {userLocation ? (
              <Text>
                经度: {userLocation[0].toFixed(4)}, 纬度: {userLocation[1].toFixed(4)}
              </Text>
            ) : (
              <Button onClick={getCurrentLocation}>
                获取当前位置
              </Button>
            )}
          </div>
        </Space>
      </Drawer>
    </div>
  );
};

export default MapPage; 