import axios from 'axios';

// 声明 import.meta.env 的类型
declare global {
  interface ImportMeta {
    env: {
      VITE_API_URL?: string;
      MODE?: string;
    };
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  bio?: string;
  location?: string;
  website?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const userApi = {
  getProfile: async (): Promise<UserProfile> => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取用户信息失败');
    }
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<UserProfile> => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_BASE_URL}/user/profile`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '更新用户信息失败');
    }
  },

  changePassword: async (data: ChangePasswordRequest): Promise<{ success: boolean; message: string }> => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_BASE_URL}/user/change-password`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '修改密码失败');
    }
  },

  uploadAvatar: async (file: File): Promise<{ avatar: string }> => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await axios.post(`${API_BASE_URL}/user/avatar`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '上传头像失败');
    }
  },

  deleteAccount: async (password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_BASE_URL}/user/account`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { password }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '删除账户失败');
    }
  }
}; 