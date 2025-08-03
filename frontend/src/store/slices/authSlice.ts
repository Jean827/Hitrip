import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../../services/authApi';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
};

// 登录
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }) => {
    const response = await authApi.login(credentials);
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    return response;
  }
);

// 注册
export const register = createAsyncThunk(
  'auth/register',
  async (userData: { name: string; email: string; password: string; confirmPassword: string }) => {
    const response = await authApi.register(userData);
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    return response;
  }
);

// 登出
export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    await authApi.logout();
    localStorage.removeItem('token');
  }
);

// 忘记密码
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email: string) => {
    const response = await authApi.forgotPassword(email);
    return response;
  }
);

// 重置密码
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (data: { token: string; password: string }) => {
    const response = await authApi.resetPassword(data.token, data.password);
    return response;
  }
);

// 验证邮箱
export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token: string) => {
    const response = await authApi.verifyEmail(token);
    return response;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // 登录
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user || null;
        state.token = action.payload.token || null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '登录失败';
      })
      // 注册
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user || null;
        state.token = action.payload.token || null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '注册失败';
      })
      // 登出
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // 忘记密码
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '发送重置邮件失败';
      })
      // 重置密码
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '重置密码失败';
      })
      // 验证邮箱
      .addCase(verifyEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '邮箱验证失败';
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer; 