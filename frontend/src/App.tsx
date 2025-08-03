import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { Toaster } from 'react-hot-toast';

// 导入页面组件
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';

import HomePage from './pages/HomePage';
import UserProfilePage from './pages/user/UserProfilePage';
import UserSettingsPage from './pages/user/UserSettingsPage';
// import PointsHistoryPage from './pages/user/PointsHistoryPage';
import StatusPage from './pages/StatusPage';

// 第三阶段：门户网站页面
import PortalHomePage from './pages/portal/PortalHomePage';
import AttractionsPage from './pages/portal/AttractionsPage';
import AttractionDetailPage from './pages/portal/AttractionDetailPage';
import MapPage from './pages/portal/MapPage';
import GuidePage from './pages/portal/GuidePage';
import CommunityPage from './pages/portal/CommunityPage';

import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminRolesPage from './pages/admin/AdminRolesPage';
import AdminPermissionsPage from './pages/admin/AdminPermissionsPage';
import CustomerServicePage from './pages/admin/CustomerServicePage';

// 第四阶段：商城相关页面
import ShopHomePage from './pages/shop/ShopHomePage';
import ProductListPage from './pages/shop/ProductListPage';
import ProductDetailPage from './pages/shop/ProductDetailPage';
import CartPage from './pages/shop/CartPage';
import OrderConfirmPage from './pages/shop/OrderConfirmPage';
import OrderListPage from './pages/shop/OrderListPage';
import OrderDetailPage from './pages/shop/OrderDetailPage';

// 导入布局组件
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';
import AdminLayout from './components/layout/AdminLayout';

// 导入样式
import './App.css';

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <div className="App">
        <Routes>
                {/* 认证相关路由 */}
                <Route path="/auth" element={<AuthLayout />}>
                  <Route path="login" element={<LoginPage />} />
                  <Route path="register" element={<RegisterPage />} />
                  <Route path="forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="reset-password" element={<ResetPasswordPage />} />
                  <Route path="verify-email" element={<VerifyEmailPage />} />
                </Route>

                {/* 管理员路由 */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route path="users" element={<AdminUsersPage />} />
                  <Route path="roles" element={<AdminRolesPage />} />
                  <Route path="permissions" element={<AdminPermissionsPage />} />
                  <Route path="customer-service" element={<CustomerServicePage />} />
                </Route>

                {/* 主要应用路由 */}
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<PortalHomePage />} />
                  <Route path="profile" element={<UserProfilePage />} />
                  <Route path="settings" element={<UserSettingsPage />} />
                  {/* <Route path="points/history" element={<PointsHistoryPage />} /> */}
                  <Route path="status" element={<StatusPage />} />
                  
                  {/* 第三阶段：门户网站路由 */}
                  <Route path="portal" element={<PortalHomePage />} />
                  <Route path="attractions" element={<AttractionsPage />} />
                  <Route path="attractions/:id" element={<AttractionDetailPage />} />
                  <Route path="map" element={<MapPage />} />
                  <Route path="guide" element={<GuidePage />} />
                  <Route path="community" element={<CommunityPage />} />
                  
                  {/* 第四阶段：商城相关路由 */}
                  <Route path="shop" element={<ShopHomePage />} />
                  <Route path="shop/products" element={<ProductListPage />} />
                  <Route path="shop/products/:id" element={<ProductDetailPage />} />
                  <Route path="shop/cart" element={<CartPage />} />
                  <Route path="shop/order-confirm" element={<OrderConfirmPage />} />
                  <Route path="shop/orders" element={<OrderListPage />} />
                  <Route path="shop/orders/:id" element={<OrderDetailPage />} />
                </Route>
              </Routes>

              {/* 全局通知 */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#4ade80',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </div>
          </ConfigProvider>
        );
      }

export default App; 