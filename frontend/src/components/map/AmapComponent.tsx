import React, { useEffect, useRef, useState } from 'react';
import { message } from 'antd';

// 声明全局AMap类型
declare global {
  interface Window {
    AMap: any;
  }
}

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

interface AmapComponentProps {
  attractions: MapAttraction[];
  onAttractionClick?: (attraction: MapAttraction) => void;
  selectedAttraction?: MapAttraction | null;
  mapType?: 'normal' | 'satellite';
  showTraffic?: boolean;
  userLocation?: [number, number] | null;
  onMapReady?: (map: any) => void;
}

const AmapComponent = React.forwardRef<any, AmapComponentProps>(({
  attractions,
  onAttractionClick,
  selectedAttraction,
  mapType = 'normal',
  showTraffic = false,
  userLocation,
  onMapReady
}, ref) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  // 加载高德地图API
  useEffect(() => {
    const loadAmapScript = () => {
      return new Promise<void>((resolve, reject) => {
        // 检查是否已经加载
        if (window.AMap) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        // 使用公版地图，不需要key
        script.src = `https://webapi.amap.com/maps?v=1.4.15&plugin=AMap.Geolocation,AMap.Scale,AMap.ToolBar,AMap.Driving,AMap.Walking,AMap.Transit`;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load AMap script'));
        document.head.appendChild(script);
      });
    };

    const initializeMap = async () => {
      try {
        setIsLoading(true);
        setMapError(null);
        
        await loadAmapScript();
        
        if (!mapContainerRef.current) {
          throw new Error('地图容器未找到');
        }

        // 检查AMap是否可用
        if (!window.AMap) {
          throw new Error('高德地图API加载失败');
        }

        // 初始化地图
        const map = new window.AMap.Map(mapContainerRef.current, {
          zoom: 11,
          center: [109.5083, 18.2528], // 三亚市中心
          mapStyle: mapType === 'satellite' ? 'amap://styles/satellite' : 'amap://styles/normal'
        });

        // 安全地添加控件
        try {
          if (window.AMap.Scale) {
            map.addControl(new window.AMap.Scale());
          }
          if (window.AMap.ToolBar) {
            map.addControl(new window.AMap.ToolBar());
          }
        } catch (controlError) {
          console.warn('控件加载失败，但不影响地图基本功能:', controlError);
        }

        // 设置地图实例
        mapInstanceRef.current = map;
        setIsMapLoaded(true);
        setIsLoading(false);

        if (onMapReady) {
          onMapReady(map);
        }

        message.success('地图加载成功');
      } catch (error) {
        console.error('地图初始化失败:', error);
        setMapError(error instanceof Error ? error.message : '地图加载失败');
        setIsLoading(false);
        message.error('地图加载失败，将显示静态地图');
      }
    };

    initializeMap();
  }, [onMapReady]);

  // 添加景点标记
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current || !window.AMap) return;

    try {
      // 清除现有标记
      markersRef.current.forEach(marker => {
        try {
          mapInstanceRef.current.remove(marker);
        } catch (error) {
          console.warn('移除标记失败:', error);
        }
      });
      markersRef.current = [];

      // 添加新标记
      attractions.forEach(attraction => {
        try {
          const marker = new window.AMap.Marker({
            position: attraction.coordinates,
            title: attraction.name,
            icon: new window.AMap.Icon({
              size: new window.AMap.Size(32, 32),
              image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
              imageSize: new window.AMap.Size(32, 32)
            })
          });

          // 添加信息窗口
          const infoWindow = new window.AMap.InfoWindow({
            content: `
              <div style="padding: 10px; max-width: 300px;">
                <h4 style="margin: 0 0 8px 0;">${attraction.name}</h4>
                <p style="margin: 0 0 8px 0; color: #666;">${attraction.description}</p>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="color: #ff6b35;">★ ${attraction.rating}</span>
                  <span style="color: #666;">${attraction.price === 0 ? '免费' : `¥${attraction.price}`}</span>
                </div>
                <div style="margin-top: 8px;">
                  ${attraction.tags.slice(0, 3).map(tag => `<span style="background: #f0f0f0; padding: 2px 6px; margin-right: 4px; border-radius: 2px; font-size: 12px;">${tag}</span>`).join('')}
                </div>
              </div>
            `,
            offset: new window.AMap.Pixel(0, -30)
          });

          // 点击标记事件
          marker.on('click', () => {
            try {
              infoWindow.open(mapInstanceRef.current, marker.getPosition());
            } catch (error) {
              console.warn('打开信息窗口失败:', error);
            }
            if (onAttractionClick) {
              onAttractionClick(attraction);
            }
          });

          // 添加到地图
          mapInstanceRef.current.add(marker);
          markersRef.current.push(marker);
        } catch (error) {
          console.warn(`添加景点标记失败 ${attraction.name}:`, error);
        }
      });
    } catch (error) {
      console.error('添加景点标记失败:', error);
    }
  }, [attractions, isMapLoaded, onAttractionClick]);

  // 选中景点高亮
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current || !selectedAttraction || !window.AMap) return;

    try {
      // 清除所有标记的高亮
      markersRef.current.forEach(marker => {
        try {
          marker.setIcon(new window.AMap.Icon({
            size: new window.AMap.Size(32, 32),
            image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
            imageSize: new window.AMap.Size(32, 32)
          }));
        } catch (error) {
          console.warn('设置标记图标失败:', error);
        }
      });

      // 高亮选中的景点
      const selectedMarker = markersRef.current.find(marker => {
        try {
          const position = marker.getPosition();
          return position.lng === selectedAttraction.coordinates[0] && 
                 position.lat === selectedAttraction.coordinates[1];
        } catch (error) {
          return false;
        }
      });

      if (selectedMarker) {
        try {
          selectedMarker.setIcon(new window.AMap.Icon({
            size: new window.AMap.Size(32, 32),
            image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_r.png',
            imageSize: new window.AMap.Size(32, 32)
          }));

          // 居中显示选中的景点
          mapInstanceRef.current.setCenter(selectedAttraction.coordinates);
          mapInstanceRef.current.setZoom(15);
        } catch (error) {
          console.warn('高亮选中景点失败:', error);
        }
      }
    } catch (error) {
      console.error('选中景点高亮失败:', error);
    }
  }, [selectedAttraction, isMapLoaded]);

  // 地图类型切换
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current) return;

    try {
      const mapStyle = mapType === 'satellite' ? 'amap://styles/satellite' : 'amap://styles/normal';
      mapInstanceRef.current.setMapStyle(mapStyle);
    } catch (error) {
      console.warn('切换地图类型失败:', error);
    }
  }, [mapType, isMapLoaded]);

  // 交通信息显示
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current || !window.AMap) return;

    try {
      if (showTraffic) {
        const traffic = new window.AMap.TileLayer.Traffic({
          zIndex: 10
        });
        mapInstanceRef.current.add(traffic);
      } else {
        // 移除交通图层
        mapInstanceRef.current.getLayers().forEach((layer: any) => {
          if (layer instanceof window.AMap.TileLayer.Traffic) {
            mapInstanceRef.current.remove(layer);
          }
        });
      }
    } catch (error) {
      console.warn('交通信息显示失败:', error);
    }
  }, [showTraffic, isMapLoaded]);

  // 用户位置标记
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current || !userLocation || !window.AMap) return;

    try {
      // 清除现有用户位置标记
      const existingUserMarker = mapInstanceRef.current.getAllOverlays('marker').find((marker: any) => 
        marker.getExtData()?.type === 'user'
      );
      if (existingUserMarker) {
        mapInstanceRef.current.remove(existingUserMarker);
      }

      // 添加用户位置标记
      const userMarker = new window.AMap.Marker({
        position: userLocation,
        icon: new window.AMap.Icon({
          size: new window.AMap.Size(32, 32),
          image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_bs.png',
          imageSize: new window.AMap.Size(32, 32)
        }),
        extData: { type: 'user' }
      });

      mapInstanceRef.current.add(userMarker);
    } catch (error) {
      console.warn('用户位置标记失败:', error);
    }
  }, [userLocation, isMapLoaded]);

  // 路线规划功能
  const planRoute = (destination: [number, number], mode: 'driving' | 'walking' | 'transit' = 'driving') => {
    if (!isMapLoaded || !mapInstanceRef.current || !userLocation || !window.AMap) {
      message.warning('请先获取当前位置');
      return;
    }

    try {
      let routing: any;

      switch (mode) {
        case 'driving':
          if (window.AMap.Driving) {
            routing = new window.AMap.Driving({
              map: mapInstanceRef.current,
              policy: window.AMap.DrivingPolicy.LEAST_TIME
            });
          }
          break;
        case 'walking':
          if (window.AMap.Walking) {
            routing = new window.AMap.Walking({
              map: mapInstanceRef.current
            });
          }
          break;
        case 'transit':
          if (window.AMap.Transit) {
            routing = new window.AMap.Transit({
              map: mapInstanceRef.current,
              policy: window.AMap.TransitPolicy.LEAST_TIME
            });
          }
          break;
      }

      if (routing) {
        routing.search(userLocation, destination, (status: string, result: any) => {
          if (status === 'complete') {
            message.success('路线规划完成');
          } else {
            message.error('路线规划失败');
          }
        });
      } else {
        message.warning('路线规划功能暂不可用');
      }
    } catch (error) {
      console.error('路线规划失败:', error);
      message.error('路线规划失败');
    }
  };

  // 暴露方法给父组件
  React.useImperativeHandle(ref, () => ({
    planRoute,
    getMap: () => mapInstanceRef.current,
    setCenter: (position: [number, number]) => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.setCenter(position);
        } catch (error) {
          console.warn('设置地图中心失败:', error);
        }
      }
    },
    setZoom: (zoom: number) => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.setZoom(zoom);
        } catch (error) {
          console.warn('设置地图缩放失败:', error);
        }
      }
    }
  }));

  // 如果地图加载失败，显示静态地图
  if (mapError) {
    return (
      <div 
        style={{ 
          width: '100%', 
          height: '100%',
          position: 'relative',
          background: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '16px', color: '#666', marginBottom: '10px' }}>
            地图暂时无法加载
          </div>
          <div style={{ fontSize: '14px', color: '#999' }}>
            请检查网络连接或稍后重试
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapContainerRef} 
      style={{ 
        width: '100%', 
        height: '100%',
        position: 'relative'
      }}
    >
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div>地图加载中...</div>
        </div>
      )}
    </div>
  );
});

export default AmapComponent; 