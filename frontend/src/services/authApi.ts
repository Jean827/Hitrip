import axios from 'axios';

// API基础URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：添加token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：处理token过期
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { token, refreshToken: newRefreshToken } = response.data.data;
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // 刷新token失败，清除本地存储并跳转到登录页
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject(error);
  }
);

// 认证API接口
export const authApi = {
  // 用户注册
  register: async (userData: {
    username: string;
    email: string;
    password: string;
    phone?: string;
    nickname?: string;
  }) => {
    return apiClient.post('/auth/register', userData);
  },

  // 用户登录
  login: async (credentials: {
    username: string;
    password: string;
  }) => {
    return apiClient.post('/auth/login', credentials);
  },

  // 刷新token
  refreshToken: async (data: { refreshToken: string }) => {
    return apiClient.post('/auth/refresh', data);
  },

  // 用户登出
  logout: async (data: { refreshToken: string }) => {
    return apiClient.post('/auth/logout', data);
  },

  // 忘记密码
  forgotPassword: async (data: { email: string }) => {
    return apiClient.post('/auth/forgot-password', data);
  },

  // 重置密码
  resetPassword: async (data: { token: string; password: string }) => {
    return apiClient.post('/auth/reset-password', data);
  },

  // 验证邮箱
  verifyEmail: async (data: { token: string }) => {
    return apiClient.post('/auth/verify-email', data);
  },

  // 重新发送验证邮件
  resendVerification: async (data: { email: string }) => {
    return apiClient.post('/auth/resend-verification', data);
  },
};

export default authApi; 