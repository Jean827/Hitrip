import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// UI状态接口
interface UIState {
  theme: 'light' | 'dark';
  language: 'zh-CN' | 'en-US';
  sidebarCollapsed: boolean;
  loading: boolean;
  modal: {
    visible: boolean;
    type: string | null;
    data: any;
  };
  notification: {
    visible: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    description?: string;
  };
}

// 初始状态
const initialState: UIState = {
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
  language: (localStorage.getItem('language') as 'zh-CN' | 'en-US') || 'zh-CN',
  sidebarCollapsed: false,
  loading: false,
  modal: {
    visible: false,
    type: null,
    data: null,
  },
  notification: {
    visible: false,
    type: 'info',
    message: '',
    description: '',
  },
};

// 创建UI切片
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // 切换主题
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.theme);
    },
    
    // 设置主题
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    
    // 设置语言
    setLanguage: (state, action: PayloadAction<'zh-CN' | 'en-US'>) => {
      state.language = action.payload;
      localStorage.setItem('language', action.payload);
    },
    
    // 切换侧边栏
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    
    // 设置侧边栏状态
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    
    // 设置加载状态
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    // 显示模态框
    showModal: (state, action: PayloadAction<{ type: string; data?: any }>) => {
      state.modal.visible = true;
      state.modal.type = action.payload.type;
      state.modal.data = action.payload.data || null;
    },
    
    // 隐藏模态框
    hideModal: (state) => {
      state.modal.visible = false;
      state.modal.type = null;
      state.modal.data = null;
    },
    
    // 显示通知
    showNotification: (state, action: PayloadAction<{
      type: 'success' | 'error' | 'warning' | 'info';
      message: string;
      description?: string;
    }>) => {
      state.notification.visible = true;
      state.notification.type = action.payload.type;
      state.notification.message = action.payload.message;
      state.notification.description = action.payload.description;
    },
    
    // 隐藏通知
    hideNotification: (state) => {
      state.notification.visible = false;
    },
    
    // 重置UI状态
    resetUI: (state) => {
      state.sidebarCollapsed = false;
      state.loading = false;
      state.modal = {
        visible: false,
        type: null,
        data: null,
      };
      state.notification = {
        visible: false,
        type: 'info',
        message: '',
        description: '',
      };
    },
  },
});

export const {
  toggleTheme,
  setTheme,
  setLanguage,
  toggleSidebar,
  setSidebarCollapsed,
  setLoading,
  showModal,
  hideModal,
  showNotification,
  hideNotification,
  resetUI,
} = uiSlice.actions;

export default uiSlice.reducer; 