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

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '登录失败');
    }
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '注册失败');
    }
  },

  logout: async (): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('登出失败:', error);
    } finally {
      localStorage.removeItem('token');
    }
  },

  forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '发送重置邮件失败');
    }
  },

  resetPassword: async (token: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, { token, password });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '重置密码失败');
    }
  },

  verifyEmail: async (token: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify-email`, { token });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '邮箱验证失败');
    }
  }
}; 