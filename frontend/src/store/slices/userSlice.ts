import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userApi, UserProfile, UpdateProfileRequest, ChangePasswordRequest } from '../../services/userApi';

export interface UserState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  loading: false,
  error: null,
};

// 获取用户资料
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async () => {
    const response = await userApi.getProfile();
    return response;
  }
);

// 更新用户资料
export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (data: UpdateProfileRequest) => {
    const response = await userApi.updateProfile(data);
    return response;
  }
);

// 修改密码
export const changePassword = createAsyncThunk(
  'user/changePassword',
  async (data: ChangePasswordRequest) => {
    const response = await userApi.changePassword(data);
    return response;
  }
);

// 上传头像
export const uploadAvatar = createAsyncThunk(
  'user/uploadAvatar',
  async (file: File) => {
    const response = await userApi.uploadAvatar(file);
    return response;
  }
);

// 删除账户
export const deleteAccount = createAsyncThunk(
  'user/deleteAccount',
  async (password: string) => {
    const response = await userApi.deleteAccount(password);
    return response;
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // 获取用户资料
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取用户资料失败';
      })
      // 更新用户资料
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '更新用户资料失败';
      })
      // 修改密码
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '修改密码失败';
      })
      // 上传头像
      .addCase(uploadAvatar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.loading = false;
        if (state.profile) {
          state.profile.avatar = action.payload.avatar;
        }
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '上传头像失败';
      })
      // 删除账户
      .addCase(deleteAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.loading = false;
        state.profile = null;
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '删除账户失败';
      });
  },
});

export const { clearError, setProfile } = userSlice.actions;
export default userSlice.reducer; 