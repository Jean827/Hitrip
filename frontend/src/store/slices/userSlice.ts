import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { userApi } from '../../services/userApi';

// 用户资料更新接口
interface UpdateProfileData {
  nickname?: string;
  realName?: string;
  gender?: 'male' | 'female' | 'other';
  birthday?: string;
  address?: string;
}

// 用户偏好设置接口
interface UpdatePreferencesData {
  language?: string;
  theme?: string;
  notifications?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
  };
}

// 用户状态接口
interface UserState {
  profile: any;
  isLoading: boolean;
  error: string | null;
}

// 初始状态
const initialState: UserState = {
  profile: null,
  isLoading: false,
  error: null,
};

// 异步thunk：获取用户资料
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.getProfile();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取用户资料失败');
    }
  }
);

// 异步thunk：更新用户资料
export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (data: UpdateProfileData, { rejectWithValue }) => {
    try {
      const response = await userApi.updateProfile(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '更新用户资料失败');
    }
  }
);

// 异步thunk：上传头像
export const uploadAvatar = createAsyncThunk(
  'user/uploadAvatar',
  async (file: File, { rejectWithValue }) => {
    try {
      const response = await userApi.uploadAvatar(file);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '上传头像失败');
    }
  }
);

// 异步thunk：更新偏好设置
export const updatePreferences = createAsyncThunk(
  'user/updatePreferences',
  async (data: UpdatePreferencesData, { rejectWithValue }) => {
    try {
      const response = await userApi.updatePreferences(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '更新偏好设置失败');
    }
  }
);

// 异步thunk：修改密码
export const changePassword = createAsyncThunk(
  'user/changePassword',
  async (data: { currentPassword: string; newPassword: string }, { rejectWithValue }) => {
    try {
      const response = await userApi.changePassword(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '修改密码失败');
    }
  }
);

// 异步thunk：绑定手机号
export const bindPhone = createAsyncThunk(
  'user/bindPhone',
  async (data: { phone: string; code: string }, { rejectWithValue }) => {
    try {
      const response = await userApi.bindPhone(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '绑定手机号失败');
    }
  }
);

// 异步thunk：发送短信验证码
export const sendSMS = createAsyncThunk(
  'user/sendSMS',
  async (phone: string, { rejectWithValue }) => {
    try {
      const response = await userApi.sendSMS({ phone });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '发送验证码失败');
    }
  }
);

// 异步thunk：删除账户
export const deleteAccount = createAsyncThunk(
  'user/deleteAccount',
  async (password: string, { rejectWithValue }) => {
    try {
      const response = await userApi.deleteAccount({ password });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '删除账户失败');
    }
  }
);

// 创建用户切片
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // 清除错误
    clearError: (state) => {
      state.error = null;
    },
    
    // 重置状态
    resetUserState: (state) => {
      state.profile = null;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // 获取用户资料
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.user;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 更新用户资料
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.user;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 上传头像
    builder
      .addCase(uploadAvatar.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.profile) {
          state.profile.avatar = action.payload.avatar;
        }
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 更新偏好设置
    builder
      .addCase(updatePreferences.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePreferences.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.profile) {
          state.profile.preferences = action.payload.preferences;
        }
      })
      .addCase(updatePreferences.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 修改密码
    builder
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 绑定手机号
    builder
      .addCase(bindPhone.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(bindPhone.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.profile) {
          state.profile.phone = action.payload.phone;
          state.profile.isPhoneVerified = action.payload.isPhoneVerified;
        }
      })
      .addCase(bindPhone.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 发送短信验证码
    builder
      .addCase(sendSMS.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendSMS.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(sendSMS.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 删除账户
    builder
      .addCase(deleteAccount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.isLoading = false;
        state.profile = null;
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  resetUserState,
} = userSlice.actions;

export default userSlice.reducer; 