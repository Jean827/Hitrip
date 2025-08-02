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

// 用户API接口
export const userApi = {
  // 获取用户资料
  getProfile: async () => {
    return apiClient.get('/user/profile');
  },

  // 更新用户资料
  updateProfile: async (data: {
    nickname?: string;
    realName?: string;
    gender?: 'male' | 'female' | 'other';
    birthday?: string;
    address?: string;
  }) => {
    return apiClient.put('/user/profile', data);
  },

  // 上传头像
  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);

    return apiClient.post('/user/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // 更新偏好设置
  updatePreferences: async (data: {
    language?: string;
    theme?: string;
    notifications?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
    };
  }) => {
    return apiClient.put('/user/preferences', data);
  },

  // 修改密码
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    return apiClient.put('/user/password', data);
  },

  // 绑定手机号
  bindPhone: async (data: {
    phone: string;
    code: string;
  }) => {
    return apiClient.post('/user/bind-phone', data);
  },

  // 发送短信验证码
  sendSMS: async (data: { phone: string }) => {
    return apiClient.post('/user/send-sms', data);
  },

  // 获取积分历史
  getPointsHistory: async (params: {
    page?: number;
    limit?: number;
  }) => {
    return apiClient.get('/user/points/history', { params });
  },

  // 删除账户
  deleteAccount: async (data: { password: string }) => {
    return apiClient.delete('/user/account', { data });
  },
};

export default userApi; 