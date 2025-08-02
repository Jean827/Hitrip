import { apiClient } from './apiClient';

export const analyticsApi = {
  // 用户行为分析
  getUserBehavior: async (params: { startDate?: string; endDate?: string; eventType?: string; userId?: string }) => {
    return apiClient.get('/analytics/user-behavior', { params });
  },

  // 销售数据分析
  getSalesAnalysis: async (params: { startDate?: string; endDate?: string; region?: string; channel?: string; status?: string }) => {
    return apiClient.get('/analytics/sales-analysis', { params });
  },

  // 实时数据监控
  getRealTime: async () => {
    return apiClient.get('/analytics/real-time');
  },

  // 业务指标统计
  getBusinessMetrics: async (params: { period?: string; startDate?: string; endDate?: string; category?: string }) => {
    return apiClient.get('/analytics/business-metrics', { params });
  },

  // 用户路径分析
  getUserPath: async (params: { userId?: string; sessionId?: string; limit?: number }) => {
    return apiClient.get('/analytics/user-path', { params });
  },

  // 漏斗分析
  getFunnel: async (params: { startDate?: string; endDate?: string; steps?: string[] }) => {
    return apiClient.get('/analytics/funnel', { params });
  },

  // 记录用户行为
  trackBehavior: async (data: {
    userId?: string;
    sessionId?: string;
    eventType: string;
    eventName?: string;
    pageUrl?: string;
    referrer?: string;
    userAgent?: string;
    ipAddress?: string;
    metadata?: any;
  }) => {
    return apiClient.post('/analytics/track', data);
  },

  // 记录系统指标
  trackSystemMetrics: async (data: {
    metricName: string;
    metricValue: number;
    metricUnit?: string;
    serverId?: string;
    component?: string;
    metadata?: any;
  }) => {
    return apiClient.post('/analytics/system-metrics', data);
  },

  // 记录业务指标
  trackBusinessMetrics: async (data: {
    metricName: string;
    metricValue: number;
    metricUnit?: string;
    period?: string;
    startTime: string;
    endTime: string;
    category?: string;
    metadata?: any;
  }) => {
    return apiClient.post('/analytics/business-metrics', data);
  },

  // 增强版分析API
  // 用户画像分析
  getUserProfile: async (params: { userId?: string; startDate?: string; endDate?: string }) => {
    return apiClient.get('/analytics-enhanced/user-profile', { params });
  },

  // 商品销售趋势分析
  getProductTrends: async (params: { startDate?: string; endDate?: string; categoryId?: string; productId?: string }) => {
    return apiClient.get('/analytics-enhanced/product-trends', { params });
  },

  // 地域分布分析
  getGeographicAnalysis: async (params: { startDate?: string; endDate?: string; region?: string }) => {
    return apiClient.get('/analytics-enhanced/geographic-analysis', { params });
  },

  // 时间序列分析
  getTimeSeries: async (params: { startDate?: string; endDate?: string; interval?: string; metric?: string }) => {
    return apiClient.get('/analytics-enhanced/time-series', { params });
  },

  // 转化率分析
  getConversionAnalysis: async (params: { startDate?: string; endDate?: string; funnel?: string[] }) => {
    return apiClient.get('/analytics-enhanced/conversion-analysis', { params });
  },

  // 留存率分析
  getRetentionAnalysis: async (params: { startDate?: string; endDate?: string; days?: number }) => {
    return apiClient.get('/analytics-enhanced/retention-analysis', { params });
  },

  // 数据导出
  exportData: async (type: string, params: { startDate?: string; endDate?: string; format?: string }) => {
    return apiClient.get(`/analytics-enhanced/export/${type}`, { params });
  },

  // 数据筛选
  filterData: async (data: {
    dataType: string;
    filters?: any;
    sortBy?: string;
    sortOrder?: string;
    limit?: number;
    offset?: number;
  }) => {
    return apiClient.post('/analytics-enhanced/filter', data);
  },

  // 推荐系统API
  // 获取个性化推荐
  getPersonalizedRecommendations: async (params: { type?: string; limit?: number }) => {
    return apiClient.get('/recommendations/personalized', { params });
  },

  // 获取热门推荐
  getPopularRecommendations: async (params: { limit?: number; categoryId?: string }) => {
    return apiClient.get('/recommendations/popular', { params });
  },

  // 获取相似商品推荐
  getSimilarRecommendations: async (productId: string, params: { limit?: number }) => {
    return apiClient.get(`/recommendations/similar/${productId}`, { params });
  },

  // 记录用户行为
  recordBehavior: async (data: {
    productId: string;
    behaviorType: string;
    behaviorData?: any;
    sessionId?: string;
    userAgent?: string;
    ipAddress?: string;
    referrer?: string;
  }) => {
    return apiClient.post('/recommendations/behavior', data);
  },

  // 记录推荐点击
  recordClick: async (data: { productId: string; recommendationType?: string }) => {
    return apiClient.post('/recommendations/click', data);
  },

  // 记录推荐购买
  recordPurchase: async (data: { productId: string; recommendationType?: string }) => {
    return apiClient.post('/recommendations/purchase', data);
  },

  // 获取推荐统计
  getRecommendationStats: async (params: { startDate?: string; endDate?: string }) => {
    return apiClient.get('/recommendations/stats', { params });
  },

  // 获取推荐效果评估
  getRecommendationEvaluation: async (params: { startDate?: string; endDate?: string; metrics?: string[] }) => {
    return apiClient.get('/recommendations/evaluation', { params });
  },

  // 计算用户相似度
  calculateUserSimilarity: async (data: { userId1: string; userId2: string }) => {
    return apiClient.post('/recommendations/calculate-similarity', data);
  },

  // 计算商品相似度
  calculateItemSimilarity: async (data: { productId1: string; productId2: string }) => {
    return apiClient.post('/recommendations/calculate-item-similarity', data);
  },

  // A/B测试API
  // 记录A/B测试
  recordABTest: async (data: {
    testName: string;
    variant: string;
    recommendationType: string;
    productIds: string[];
  }) => {
    return apiClient.post('/recommendations/ab-test', data);
  },

  // 获取A/B测试结果
  getABTestResults: async (params: { testName?: string; startDate?: string; endDate?: string }) => {
    return apiClient.get('/recommendations/ab-test-results', { params });
  },

  // 记录A/B测试点击
  recordABClick: async (data: { testName: string; variant: string; productId: string }) => {
    return apiClient.post('/recommendations/ab-click', data);
  },

  // 记录A/B测试购买
  recordABPurchase: async (data: { testName: string; variant: string; productId: string }) => {
    return apiClient.post('/recommendations/ab-purchase', data);
  },

  // 监控API
  // 获取监控指标
  getMonitoringMetrics: async () => {
    return apiClient.get('/monitoring/metrics');
  },

  // 获取告警列表
  getAlerts: async (params: { level?: string; type?: string; status?: string }) => {
    return apiClient.get('/monitoring/alerts', { params });
  },

  // 获取系统状态
  getSystemStatus: async () => {
    return apiClient.get('/monitoring/system-status');
  },

  // 获取实时监控数据
  getRealTimeMonitoring: async () => {
    return apiClient.get('/monitoring/real-time');
  },

  // 创建告警
  createAlert: async (data: {
    level: string;
    type: string;
    message: string;
    metadata?: any;
  }) => {
    return apiClient.post('/monitoring/alerts', data);
  },

  // 更新告警状态
  updateAlertStatus: async (alertId: string, data: { status: string; notes?: string }) => {
    return apiClient.put(`/monitoring/alerts/${alertId}`, data);
  },

  // 删除告警
  deleteAlert: async (alertId: string) => {
    return apiClient.delete(`/monitoring/alerts/${alertId}`);
  },
}; 