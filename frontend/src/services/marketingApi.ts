import apiClient from './apiClient';

export interface Campaign {
  id: string;
  name: string;
  description: string;
  type: 'email' | 'sms' | 'push' | 'banner';
  status: 'draft' | 'active' | 'paused' | 'completed';
  startDate: string;
  endDate: string;
  targetAudience: string[];
  content: any;
  metrics: {
    sent: number;
    opened: number;
    clicked: number;
    converted: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  maxDiscount?: number;
  minAmount: number;
  maxUses: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive' | 'expired';
  applicableProducts: string[];
  applicableCategories: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PointProduct {
  id: string;
  name: string;
  description: string;
  points: number;
  price: number;
  stock: number;
  image: string;
  status: 'active' | 'inactive';
  category: string;
  createdAt: string;
  updatedAt: string;
}

export const marketingApi = {
  // 活动管理
  getCampaigns: async (): Promise<Campaign[]> => {
    try {
      const response = await apiClient.get('/marketing/campaigns');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取活动列表失败');
    }
  },

  createCampaign: async (data: Partial<Campaign>): Promise<Campaign> => {
    try {
      const response = await apiClient.post('/marketing/campaigns', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '创建活动失败');
    }
  },

  updateCampaign: async (id: string, data: Partial<Campaign>): Promise<Campaign> => {
    try {
      const response = await apiClient.put(`/marketing/campaigns/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '更新活动失败');
    }
  },

  deleteCampaign: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/marketing/campaigns/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '删除活动失败');
    }
  },

  // 优惠券管理
  getCoupons: async (): Promise<Coupon[]> => {
    try {
      const response = await apiClient.get('/marketing/coupons');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取优惠券列表失败');
    }
  },

  createCoupon: async (data: Partial<Coupon>): Promise<Coupon> => {
    try {
      const response = await apiClient.post('/marketing/coupons', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '创建优惠券失败');
    }
  },

  updateCoupon: async (id: string, data: Partial<Coupon>): Promise<Coupon> => {
    try {
      const response = await apiClient.put(`/marketing/coupons/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '更新优惠券失败');
    }
  },

  deleteCoupon: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/marketing/coupons/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '删除优惠券失败');
    }
  },

  // 积分商城
  getPointProducts: async (): Promise<PointProduct[]> => {
    try {
      const response = await apiClient.get('/marketing/point-products');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取积分商品列表失败');
    }
  },

  createPointProduct: async (data: Partial<PointProduct>): Promise<PointProduct> => {
    try {
      const response = await apiClient.post('/marketing/point-products', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '创建积分商品失败');
    }
  },

  updatePointProduct: async (id: string, data: Partial<PointProduct>): Promise<PointProduct> => {
    try {
      const response = await apiClient.put(`/marketing/point-products/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '更新积分商品失败');
    }
  },

  deletePointProduct: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/marketing/point-products/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '删除积分商品失败');
    }
  }
}; 