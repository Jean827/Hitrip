import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../../services/authApi';

// 用户接口
export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  nickname?: string;
  realName?: string;
  gender?: 'male' | 'female' | 'other';
  birthday?: string;
  address?: string;
  avatar?: string;
  role: 'user' | 'admin' | 'moderator';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  points: number;
  level: number;
  vipLevel: number;
  vipExpiresAt?: string;
  preferences: {
    language: string;
    theme: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };
  socialAccounts: {
    wechat?: string;
    alipay?: string;
    qq?: string;
    weibo?: string;
  };
  createdAt: string;
  lastLoginAt?: string;
}

// 认证状态接口
interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// 初始状态
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// 异步thunk：登录
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '登录失败');
    }
  }
);

// 异步thunk：注册
export const register = createAsyncThunk(
  'auth/register',
  async (userData: {
    username: string;
    email: string;
    password: string;
    phone?: string;
    nickname?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await authApi.register(userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '注册失败');
    }
  }
);

// 异步thunk：刷新token
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const refreshToken = state.auth.refreshToken;
      
      if (!refreshToken) {
        throw new Error('没有刷新token');
      }

      const response = await authApi.refreshToken({ refreshToken });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '刷新token失败');
    }
  }
);

// 异步thunk：登出
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const refreshToken = state.auth.refreshToken;
      
      if (refreshToken) {
        await authApi.logout({ refreshToken });
      }
      
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '登出失败');
    }
  }
);

// 异步thunk：忘记密码
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await authApi.forgotPassword({ email });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '发送重置邮件失败');
    }
  }
);

// 异步thunk：重置密码
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (data: { token: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authApi.resetPassword(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '重置密码失败');
    }
  }
);

// 异步thunk：验证邮箱
export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await authApi.verifyEmail({ token });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '邮箱验证失败');
    }
  }
);

// 创建认证切片
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // 设置用户信息
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    
    // 设置token
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      localStorage.setItem('token', action.payload);
    },
    
    // 设置刷新token
    setRefreshToken: (state, action: PayloadAction<string>) => {
      state.refreshToken = action.payload;
      localStorage.setItem('refreshToken', action.payload);
    },
    
    // 清除错误
    clearError: (state) => {
      state.error = null;
    },
    
    // 初始化认证状态
    initializeAuth: (state) => {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (token && refreshToken) {
        state.token = token;
        state.refreshToken = refreshToken;
        state.isAuthenticated = true;
      }
    },
  },
  extraReducers: (builder) => {
    // 登录
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 注册
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 刷新token
    builder
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      });

    // 登出
    builder
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      });

    // 忘记密码
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 重置密码
    builder
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 验证邮箱
    builder
      .addCase(verifyEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state) => {
        state.isLoading = false;
        if (state.user) {
          state.user.isEmailVerified = true;
        }
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setUser,
  setToken,
  setRefreshToken,
  clearError,
  initializeAuth,
} = authSlice.actions;

export default authSlice.reducer; 