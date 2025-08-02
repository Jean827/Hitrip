import { apiClient } from './apiClient';

export interface Campaign {
  id: string;
  name: string;
  description: string;
  type: 'discount' | 'full_reduction' | 'points' | 'free_shipping';
  startTime: string;
  endTime: string;
  status: 'draft' | 'active' | 'paused' | 'ended';
  budget: number;
  targetAudience?: any;
  rules?: any;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  name: string;
  type: 'discount' | 'full_reduction' | 'free_shipping' | 'points';
  discountValue: number;
  minAmount: number;
  maxDiscount?: number;
  startTime: string;
  endTime: string;
  usageLimit: number;
  usedCount: number;
  status: 'active' | 'inactive' | 'expired';
  applicableProducts?: string[];
  applicableUsers?: string[];
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PointProduct {
  id: string;
  name: string;
  description: string;
  image: string;
  points: number;
  stock: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  category: string;
  exchangeCount: number;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserPoints {
  id: string;
  userId: string;
  totalPoints: number;
  availablePoints: number;
  usedPoints: number;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

export const marketingApi = {
  // ==================== 营销活动管理 ====================
  
  // 获取活动列表
  getCampaigns: async (params?: { page?: number; limit?: number; status?: string; type?: string }): Promise<{ success: boolean; data: { campaigns: Campaign[]; total: number; page: number; totalPages: number } }> => {
    const response = await apiClient.get('/marketing/campaigns', { params });
    return response.data;
  },

  // 创建营销活动
  createCampaign: async (data: Partial<Campaign>): Promise<{ success: boolean; data: Campaign }> => {
    const response = await apiClient.post('/marketing/campaigns', data);
    return response.data;
  },

  // 更新营销活动
  updateCampaign: async (id: string, data: Partial<Campaign>): Promise<{ success: boolean; data: Campaign }> => {
    const response = await apiClient.put(`/marketing/campaigns/${id}`, data);
    return response.data;
  },

  // 删除营销活动
  deleteCampaign: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/marketing/campaigns/${id}`);
    return response.data;
  },

  // 获取活动统计
  getCampaignStats: async (id: string, timeRange?: string): Promise<{ success: boolean; data: { campaign: Campaign; stats: any } }> => {
    const response = await apiClient.get(`/marketing/campaigns/${id}/stats`, { params: { timeRange } });
    return response.data;
  },

  // ==================== 优惠券管理 ====================
  
  // 获取优惠券列表
  getCoupons: async (params?: { page?: number; limit?: number; status?: string; type?: string }): Promise<{ success: boolean; data: { coupons: Coupon[]; total: number; page: number; totalPages: number } }> => {
    const response = await apiClient.get('/marketing/coupons', { params });
    return response.data;
  },

  // 创建优惠券
  createCoupon: async (data: Partial<Coupon>): Promise<{ success: boolean; data: Coupon }> => {
    const response = await apiClient.post('/marketing/coupons', data);
    return response.data;
  },

  // 更新优惠券
  updateCoupon: async (id: string, data: Partial<Coupon>): Promise<{ success: boolean; data: Coupon }> => {
    const response = await apiClient.put(`/marketing/coupons/${id}`, data);
    return response.data;
  },

  // 删除优惠券
  deleteCoupon: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/marketing/coupons/${id}`);
    return response.data;
  },

  // 应用优惠券
  applyCoupon: async (data: { code: string; orderId?: string; amount: number }): Promise<{ success: boolean; data: { coupon: Coupon; discountAmount: number; finalAmount: number } }> => {
    const response = await apiClient.post('/marketing/coupons/apply', data);
    return response.data;
  },

  // ==================== 积分商城管理 ====================
  
  // 获取积分商品列表
  getPointProducts: async (params?: { page?: number; limit?: number; status?: string; category?: string }): Promise<{ success: boolean; data: { products: PointProduct[]; total: number; page: number; totalPages: number } }> => {
    const response = await apiClient.get('/marketing/point-products', { params });
    return response.data;
  },

  // 创建积分商品
  createPointProduct: async (data: Partial<PointProduct>): Promise<{ success: boolean; data: PointProduct }> => {
    const response = await apiClient.post('/marketing/point-products', data);
    return response.data;
  },

  // 更新积分商品
  updatePointProduct: async (id: string, data: Partial<PointProduct>): Promise<{ success: boolean; data: PointProduct }> => {
    const response = await apiClient.put(`/marketing/point-products/${id}`, data);
    return response.data;
  },

  // 删除积分商品
  deletePointProduct: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/marketing/point-products/${id}`);
    return response.data;
  },

  // 兑换积分商品
  exchangePointProduct: async (data: { productId: string; quantity?: number }): Promise<{ success: boolean; message: string; data: { product: PointProduct; usedPoints: number; remainingPoints: number } }> => {
    const response = await apiClient.post('/marketing/point-products/exchange', data);
    return response.data;
  },

  // ==================== 用户积分管理 ====================
  
  // 获取用户积分信息
  getUserPoints: async (): Promise<{ success: boolean; data: UserPoints }> => {
    const response = await apiClient.get('/marketing/user-points');
    return response.data;
  },

  // 赚取积分
  earnPoints: async (data: { points: number; reason?: string }): Promise<{ success: boolean; message: string; data: UserPoints }> => {
    const response = await apiClient.post('/marketing/user-points/earn', data);
    return response.data;
  },

  // 使用积分
  usePoints: async (data: { points: number; reason?: string }): Promise<{ success: boolean; message: string; data: UserPoints }> => {
    const response = await apiClient.post('/marketing/user-points/use', data);
    return response.data;
  },

  // ==================== 通用方法 ====================
  
  // 创建项目（通用方法）
  createItem: async (type: 'campaign' | 'coupon' | 'product', data: any): Promise<any> => {
    switch (type) {
      case 'campaign':
        return await marketingApi.createCampaign(data);
      case 'coupon':
        return await marketingApi.createCoupon(data);
      case 'product':
        return await marketingApi.createPointProduct(data);
      default:
        throw new Error('不支持的类型');
    }
  },

  // 更新项目（通用方法）
  updateItem: async (type: 'campaign' | 'coupon' | 'product', id: string, data: any): Promise<any> => {
    switch (type) {
      case 'campaign':
        return await marketingApi.updateCampaign(id, data);
      case 'coupon':
        return await marketingApi.updateCoupon(id, data);
      case 'product':
        return await marketingApi.updatePointProduct(id, data);
      default:
        throw new Error('不支持的类型');
    }
  },

  // 删除项目（通用方法）
  deleteItem: async (type: 'campaign' | 'coupon' | 'product', id: string): Promise<any> => {
    switch (type) {
      case 'campaign':
        return await marketingApi.deleteCampaign(id);
      case 'coupon':
        return await marketingApi.deleteCoupon(id);
      case 'product':
        return await marketingApi.deletePointProduct(id);
      default:
        throw new Error('不支持的类型');
    }
  }
}; 