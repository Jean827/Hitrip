import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Spin, Alert, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { chartCache, ChartCacheService } from '../../utils/chartCache';
import { ChartPaginationService, PaginationParams } from '../../utils/chartPagination';

interface OptimizedChartProps {
  chartType: 'line' | 'bar' | 'pie' | 'area';
  dataSource: (params: PaginationParams) => Promise<any>;
  params?: Record<string, any>;
  height?: number;
  width?: string;
  title?: string;
  loading?: boolean;
  error?: string;
  onDataLoad?: (data: any) => void;
  onError?: (error: Error) => void;
  cacheKey?: string;
  cacheTTL?: number;
  maxDataPoints?: number;
  enableVirtualScroll?: boolean;
  children: React.ReactNode;
}

const OptimizedChart: React.FC<OptimizedChartProps> = ({
  chartType,
  dataSource,
  params = {},
  height = 300,
  width = '100%',
  title,
  loading: externalLoading,
  error: externalError,
  onDataLoad,
  onError,
  cacheKey,
  cacheTTL = 5 * 60 * 1000, // 5分钟
  maxDataPoints = 1000,
  enableVirtualScroll = false,
  children
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [renderTime, setRenderTime] = useState<number>(0);

  // 生成缓存键
  const generatedCacheKey = useMemo(() => {
    if (cacheKey) return cacheKey;
    return ChartCacheService.generateCacheKey(chartType, params);
  }, [chartType, params, cacheKey]);

  // 加载数据
  const loadData = useCallback(async (page: number = 1, useCache: boolean = true) => {
    const startTime = performance.now();
    setLoading(true);
    setError(null);

    try {
      // 尝试从缓存获取数据
      if (useCache) {
        const cachedData = await chartCache.getCachedData(generatedCacheKey);
        if (cachedData) {
          setData(cachedData);
          setRenderTime(performance.now() - startTime);
          onDataLoad?.(cachedData);
          setLoading(false);
          return;
        }
      }

      // 从数据源加载数据
      const result = await dataSource({
        page,
        pageSize: ChartPaginationService.calculateOptimalPageSize(data.length || 1000),
        ...params
      });

      // 优化大数据量
      let optimizedData = result.data || result;
      if (optimizedData.length > maxDataPoints) {
        optimizedData = ChartPaginationService.optimizeLargeDataset(optimizedData, maxDataPoints);
      }

      setData(optimizedData);
      setHasMore(result.hasMore || false);
      setRenderTime(performance.now() - startTime);

      // 缓存数据
      await chartCache.setCachedData(generatedCacheKey, optimizedData, cacheTTL);
      onDataLoad?.(optimizedData);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '加载数据失败';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  }, [dataSource, params, generatedCacheKey, cacheTTL, maxDataPoints, onDataLoad, onError]);

  // 虚拟滚动数据加载
  const loadVirtualScrollData = useCallback(async (startIndex: number, endIndex: number) => {
    if (!enableVirtualScroll) return;

    try {
      const virtualData = await ChartPaginationService.loadVirtualScrollData(
        dataSource,
        startIndex,
        endIndex
      );
      setData(virtualData);
    } catch (err) {
      console.error('虚拟滚动数据加载失败:', err);
    }
  }, [dataSource, enableVirtualScroll]);

  // 预加载数据
  const preloadData = useCallback(async () => {
    if (!enableVirtualScroll) return;

    try {
      await ChartPaginationService.preloadData(dataSource, currentPage);
    } catch (err) {
      console.error('预加载数据失败:', err);
    }
  }, [dataSource, currentPage, enableVirtualScroll]);

  // 初始加载
  useEffect(() => {
    loadData(1, true);
  }, [loadData]);

  // 预加载后续数据
  useEffect(() => {
    if (enableVirtualScroll && hasMore) {
      preloadData();
    }
  }, [preloadData, enableVirtualScroll, hasMore]);

  // 处理外部错误
  useEffect(() => {
    if (externalError) {
      setError(externalError);
    }
  }, [externalError]);

  // 刷新数据
  const handleRefresh = useCallback(() => {
    chartCache.deleteCachedData(generatedCacheKey);
    loadData(1, false);
  }, [loadData, generatedCacheKey]);

  // 加载更多数据
  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadData(nextPage, false);
    }
  }, [hasMore, loading, currentPage, loadData]);

  // 渲染性能监控
  const renderPerformanceInfo = () => {
    if (renderTime > 0) {
      return (
        <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
          渲染时间: {renderTime.toFixed(2)}ms
          {renderTime > 2000 && (
            <span style={{ color: '#ff4d4f', marginLeft: '8px' }}>
              ⚠️ 渲染时间较长，建议优化数据量
            </span>
          )}
        </div>
      );
    }
    return null;
  };

  // 渲染错误信息
  const renderError = () => {
    if (error || externalError) {
      return (
        <Alert
          message="数据加载失败"
          description={error || externalError}
          type="error"
          showIcon
          action={
            <Button size="small" danger onClick={handleRefresh}>
              重试
            </Button>
          }
        />
      );
    }
    return null;
  };

  // 渲染加载状态
  const renderLoading = () => {
    if (loading || externalLoading) {
      return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '8px' }}>加载中...</div>
        </div>
      );
    }
    return null;
  };

  // 渲染图表内容
  const renderChartContent = () => {
    if (loading || externalLoading) {
      return renderLoading();
    }

    if (error || externalError) {
      return renderError();
    }

    if (!data || data.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
          暂无数据
        </div>
      );
    }

    return (
      <div style={{ position: 'relative' }}>
        {children}
        {renderPerformanceInfo()}
        {hasMore && enableVirtualScroll && (
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Button onClick={handleLoadMore} loading={loading}>
              加载更多
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ width, height }}>
      {title && (
        <div style={{ marginBottom: '16px' }}>
          <h3>{title}</h3>
          <Button
            icon={<ReloadOutlined />}
            size="small"
            onClick={handleRefresh}
            loading={loading}
            style={{ marginLeft: '8px' }}
          >
            刷新
          </Button>
        </div>
      )}
      
      <div style={{ height: title ? height - 60 : height }}>
        {renderChartContent()}
      </div>
    </div>
  );
};

export default OptimizedChart; 