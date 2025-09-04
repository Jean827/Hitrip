# 海南文旅平台 API 文档

## 📋 概述

海南文旅平台API提供完整的电商功能，包括用户认证、商品管理、订单处理、支付系统和商家管理等功能。

### 基础信息
- **基础URL**: `http://localhost:3001/api`
- **认证方式**: Bearer Token
- **数据格式**: JSON
- **字符编码**: UTF-8

### 通用响应格式
```json
{
  "message": "操作成功",
  "data": {
    // 响应数据
  }
}
```

### 错误响应格式
```json
{
  "message": "错误信息",
  "error": "详细错误描述"
}
```

## 🔐 认证相关

### 用户注册
```http
POST /api/auth/register
```

**请求参数:**
```json
{
  "username": "用户名",
  "email": "邮箱",
  "password": "密码"
}
```

**响应示例:**
```json
{
  "message": "注册成功",
  "data": {
    "id": "用户ID",
    "username": "用户名",
    "email": "邮箱",
    "role": "user"
  }
}
```

### 用户登录
```http
POST /api/auth/login
```

**请求参数:**
```json
{
  "email": "邮箱",
  "password": "密码"
}
```

**响应示例:**
```json
{
  "message": "登录成功",
  "data": {
    "token": "JWT令牌",
    "user": {
      "id": "用户ID",
      "username": "用户名",
      "email": "邮箱",
      "role": "user"
    }
  }
}
```

## 🛍️ 商品管理

### 获取商品列表
```http
GET /api/products
```

**查询参数:**
- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 10)
- `search`: 搜索关键词
- `categoryId`: 分类ID
- `minPrice`: 最低价格
- `maxPrice`: 最高价格
- `sort`: 排序字段 (price, rating, salesCount, createdAt)
- `order`: 排序方向 (asc, desc)

**响应示例:**
```json
{
  "message": "获取商品列表成功",
  "data": {
    "products": [
      {
        "id": "商品ID",
        "name": "商品名称",
        "description": "商品描述",
        "price": 100.00,
        "originalPrice": 120.00,
        "images": ["图片URL"],
        "tags": ["标签"],
        "stock": 100,
        "salesCount": 50,
        "rating": 4.5,
        "isActive": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  }
}
```

### 获取商品详情
```http
GET /api/products/:id
```

**响应示例:**
```json
{
  "message": "获取商品详情成功",
  "data": {
    "id": "商品ID",
    "name": "商品名称",
    "description": "商品描述",
    "price": 100.00,
    "originalPrice": 120.00,
    "images": ["图片URL"],
    "tags": ["标签"],
    "stock": 100,
    "salesCount": 50,
    "rating": 4.5,
    "isActive": true,
    "category": {
      "id": "分类ID",
      "name": "分类名称"
    }
  }
}
```

### 创建商品 (管理员/商家)
```http
POST /api/products
Authorization: Bearer <token>
```

**请求参数:**
```json
{
  "name": "商品名称",
  "description": "商品描述",
  "price": 100.00,
  "originalPrice": 120.00,
  "categoryId": "分类ID",
  "images": ["图片URL"],
  "tags": ["标签"],
  "stock": 100,
  "isActive": true
}
```

### 更新商品 (管理员/商家)
```http
PUT /api/products/:id
Authorization: Bearer <token>
```

### 删除商品 (管理员/商家)
```http
DELETE /api/products/:id
Authorization: Bearer <token>
```

## 🛒 购物车管理

### 获取购物车
```http
GET /api/cart
Authorization: Bearer <token>
```

**响应示例:**
```json
{
  "message": "获取购物车成功",
  "data": {
    "items": [
      {
        "id": "购物车项ID",
        "productId": "商品ID",
        "quantity": 2,
        "price": 100.00,
        "product": {
          "id": "商品ID",
          "name": "商品名称",
          "image": "商品图片"
        }
      }
    ],
    "totalAmount": 200.00,
    "itemCount": 2
  }
}
```

### 添加商品到购物车
```http
POST /api/cart/items
Authorization: Bearer <token>
```

**请求参数:**
```json
{
  "productId": "商品ID",
  "quantity": 1
}
```

### 更新购物车商品数量
```http
PUT /api/cart/items/:id
Authorization: Bearer <token>
```

**请求参数:**
```json
{
  "quantity": 3
}
```

### 删除购物车商品
```http
DELETE /api/cart/items/:id
Authorization: Bearer <token>
```

### 清空购物车
```http
DELETE /api/cart
Authorization: Bearer <token>
```

## 📦 订单管理

### 创建订单
```http
POST /api/orders
Authorization: Bearer <token>
```

**请求参数:**
```json
{
  "items": [
    {
      "productId": "商品ID",
      "quantity": 2,
      "price": 100.00
    }
  ],
  "shippingAddress": {
    "name": "收货人姓名",
    "phone": "联系电话",
    "province": "省份",
    "city": "城市",
    "district": "区县",
    "address": "详细地址"
  },
  "paymentMethod": "wechat",
  "remark": "订单备注"
}
```

**响应示例:**
```json
{
  "message": "订单创建成功",
  "data": {
    "id": "订单ID",
    "orderNumber": "订单号",
    "status": "pending",
    "totalAmount": 200.00,
    "paymentAmount": 200.00,
    "items": [
      {
        "productId": "商品ID",
        "productName": "商品名称",
        "quantity": 2,
        "price": 100.00,
        "totalPrice": 200.00
      }
    ]
  }
}
```

### 获取订单列表
```http
GET /api/orders
Authorization: Bearer <token>
```

**查询参数:**
- `page`: 页码
- `limit`: 每页数量
- `status`: 订单状态

### 获取订单详情
```http
GET /api/orders/:id
Authorization: Bearer <token>
```

### 更新订单状态
```http
PUT /api/orders/:id/status
Authorization: Bearer <token>
```

**请求参数:**
```json
{
  "status": "paid"
}
```

### 取消订单
```http
POST /api/orders/:id/cancel
Authorization: Bearer <token>
```

**请求参数:**
```json
{
  "reason": "取消原因"
}
```

### 确认收货
```http
POST /api/orders/:id/confirm
Authorization: Bearer <token>
```

## 💳 支付系统

### 创建支付
```http
POST /api/payments
Authorization: Bearer <token>
```

**请求参数:**
```json
{
  "orderId": "订单ID",
  "paymentMethod": "wechat",
  "amount": 200.00
}
```

**响应示例:**
```json
{
  "message": "支付创建成功",
  "data": {
    "paymentId": "支付ID",
    "paymentParams": {
      "appId": "微信AppID",
      "timeStamp": "时间戳",
      "nonceStr": "随机字符串",
      "package": "预支付ID",
      "signType": "MD5",
      "paySign": "签名"
    }
  }
}
```

### 支付回调处理
```http
POST /api/payments/callback/:paymentMethod
```

**回调数据示例 (微信支付):**
```json
{
  "transaction_id": "微信交易ID",
  "result_code": "SUCCESS",
  "total_fee": 20000
}
```

### 申请退款
```http
POST /api/payments/refund
Authorization: Bearer <token>
```

**请求参数:**
```json
{
  "paymentId": "支付ID",
  "refundAmount": 100.00,
  "refundReason": "退款原因"
}
```

### 获取支付详情
```http
GET /api/payments/:id
Authorization: Bearer <token>
```

### 获取支付记录
```http
GET /api/payments
Authorization: Bearer <token>
```

**查询参数:**
- `page`: 页码
- `limit`: 每页数量
- `status`: 支付状态

## 🏪 商家管理

### 商家入驻申请
```http
POST /api/merchants/register
Authorization: Bearer <token>
```

**请求参数:**
```json
{
  "name": "商家名称",
  "description": "商家描述",
  "logo": "商家Logo",
  "banner": "商家横幅",
  "contactPhone": "联系电话",
  "contactEmail": "联系邮箱",
  "address": "商家地址",
  "businessLicense": "营业执照",
  "idCardFront": "身份证正面",
  "idCardBack": "身份证背面",
  "settlementAccount": "结算账户",
  "settlementBank": "结算银行"
}
```

### 获取商家信息
```http
GET /api/merchants/profile
Authorization: Bearer <token>
```

### 更新商家信息
```http
PUT /api/merchants/profile
Authorization: Bearer <token>
```

**请求参数:**
```json
{
  "name": "更新后的商家名称",
  "description": "更新后的描述",
  "logo": "更新后的Logo",
  "banner": "更新后的横幅",
  "contactPhone": "更新后的电话",
  "contactEmail": "更新后的邮箱",
  "address": "更新后的地址"
}
```

### 获取商家统计数据
```http
GET /api/merchants/stats
Authorization: Bearer <token>
```

**响应示例:**
```json
{
  "message": "获取商家统计数据成功",
  "data": {
    "productStats": {
      "totalProducts": 50,
      "totalSales": 1000,
      "avgRating": 4.5
    },
    "orderStats": {
      "totalOrders": 100,
      "totalRevenue": 10000.00,
      "completedOrders": 80
    },
    "dailyStats": [
      {
        "date": "2024-01-01",
        "orderCount": 10,
        "revenue": 1000.00
      }
    ]
  }
}
```

### 获取商家列表 (管理员)
```http
GET /api/merchants
Authorization: Bearer <admin_token>
```

**查询参数:**
- `page`: 页码
- `limit`: 每页数量
- `status`: 商家状态
- `verificationStatus`: 认证状态

### 审核商家 (管理员)
```http
PUT /api/merchants/:id/verify
Authorization: Bearer <admin_token>
```

**请求参数:**
```json
{
  "status": "active",
  "verificationStatus": "verified",
  "verificationRemark": "审核通过"
}
```

### 获取商家详情 (管理员)
```http
GET /api/merchants/:id
Authorization: Bearer <admin_token>
```

### 更新商家状态 (管理员)
```http
PATCH /api/merchants/:id/status
Authorization: Bearer <admin_token>
```

**请求参数:**
```json
{
  "status": "suspended"
}
```

## 📊 分类管理

### 获取分类列表
```http
GET /api/categories
```

**响应示例:**
```json
{
  "message": "获取分类列表成功",
  "data": [
    {
      "id": "分类ID",
      "name": "分类名称",
      "description": "分类描述",
      "icon": "分类图标",
      "image": "分类图片",
      "level": 1,
      "parentId": null,
      "children": [
        {
          "id": "子分类ID",
          "name": "子分类名称",
          "level": 2,
          "parentId": "父分类ID"
        }
      ]
    }
  ]
}
```

### 创建分类 (管理员)
```http
POST /api/categories
Authorization: Bearer <admin_token>
```

**请求参数:**
```json
{
  "name": "分类名称",
  "description": "分类描述",
  "icon": "分类图标",
  "image": "分类图片",
  "parentId": "父分类ID",
  "sortOrder": 1
}
```

### 更新分类 (管理员)
```http
PUT /api/categories/:id
Authorization: Bearer <admin_token>
```

### 删除分类 (管理员)
```http
DELETE /api/categories/:id
Authorization: Bearer <admin_token>
```

## 👤 用户管理

### 获取用户信息
```http
GET /api/user/profile
Authorization: Bearer <token>
```

### 更新用户信息
```http
PUT /api/user/profile
Authorization: Bearer <token>
```

**请求参数:**
```json
{
  "username": "新用户名",
  "email": "新邮箱",
  "phone": "新电话",
  "avatar": "新头像"
}
```

### 修改密码
```http
PUT /api/user/password
Authorization: Bearer <token>
```

**请求参数:**
```json
{
  "oldPassword": "旧密码",
  "newPassword": "新密码"
}
```

### 获取用户订单
```http
GET /api/user/orders
Authorization: Bearer <token>
```

### 获取用户积分
```http
GET /api/user/points
Authorization: Bearer <token>
```

## 🔧 管理员功能

### 获取用户列表 (管理员)
```http
GET /api/admin/users
Authorization: Bearer <admin_token>
```

### 获取订单列表 (管理员)
```http
GET /api/admin/orders
Authorization: Bearer <admin_token>
```

### 获取商品列表 (管理员)
```http
GET /api/admin/products
Authorization: Bearer <admin_token>
```

### 获取统计数据 (管理员)
```http
GET /api/admin/stats
Authorization: Bearer <admin_token>
```

## 📝 状态码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 409 | 资源冲突 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |

## 🔒 安全说明

### 认证
- 所有需要认证的接口都需要在请求头中包含 `Authorization: Bearer <token>`
- Token 有效期为 24 小时
- 过期后需要重新登录获取新的 Token

### 权限控制
- `user`: 普通用户权限
- `merchant`: 商家权限
- `admin`: 管理员权限

### 数据验证
- 所有输入数据都会进行验证
- 支持 XSS 防护
- 支持 SQL 注入防护
- 文件上传有类型和大小限制

### 限流
- API 接口有请求频率限制
- 每个 IP 15 分钟内最多 100 个请求
- 超过限制会返回 429 状态码

## 📞 技术支持

如有问题，请联系技术支持团队：
- 邮箱: support@hitrip.com
- 电话: 400-123-4567
- 工作时间: 周一至周五 9:00-18:00

## ❌ 错误码列表

### 通用错误码

| 错误码 | 描述 | HTTP状态码 |
|--------|------|------------|
| 10000 | 成功 | 200 |
| 10001 | 系统错误 | 500 |
| 10002 | 数据库错误 | 500 |
| 10003 | 网络错误 | 500 |
| 10004 | 参数错误 | 400 |
| 10005 | 未授权访问 | 401 |
| 10006 | 权限不足 | 403 |
| 10007 | 资源不存在 | 404 |
| 10008 | 资源已存在 | 409 |
| 10009 | 请求频率过高 | 429 |
| 10010 | 操作失败 | 400 |

### 认证相关错误码

| 错误码 | 描述 | HTTP状态码 |
|--------|------|------------|
| 20001 | 用户名或密码错误 | 401 |
| 20002 | 账号不存在 | 404 |
| 20003 | 账号已被禁用 | 403 |
| 20004 | 账号未激活 | 403 |
| 20005 | 验证码错误 | 400 |
| 20006 | 验证码过期 | 400 |
| 20007 | Token过期 | 401 |
| 20008 | Token无效 | 401 |
| 20009 | 旧密码错误 | 400 |
| 20010 | 邮箱已被注册 | 409 |
| 20011 | 手机号已被注册 | 409 |

### 商品相关错误码

| 错误码 | 描述 | HTTP状态码 |
|--------|------|------------|
| 30001 | 商品不存在 | 404 |
| 30002 | 商品已下架 | 400 |
| 30003 | 商品库存不足 | 400 |
| 30004 | 分类不存在 | 404 |
| 30005 | 商品图片上传失败 | 400 |

### 订单相关错误码

| 错误码 | 描述 | HTTP状态码 |
|--------|------|------------|
| 40001 | 订单不存在 | 404 |
| 40002 | 订单状态错误 | 400 |
| 40003 | 订单金额错误 | 400 |
| 40004 | 订单已支付 | 400 |
| 40005 | 订单已取消 | 400 |
| 40006 | 订单已完成 | 400 |
| 40007 | 订单已退款 | 400 |
| 40008 | 商品已从订单移除 | 400 |
| 40009 | 地址信息错误 | 400 |

### 支付相关错误码

| 错误码 | 描述 | HTTP状态码 |
|--------|------|------------|
| 50001 | 支付失败 | 400 |
| 50002 | 支付金额错误 | 400 |
| 50003 | 支付方式不支持 | 400 |
| 50004 | 支付参数错误 | 400 |
| 50005 | 支付超时 | 400 |
| 50006 | 支付记录不存在 | 404 |
| 50007 | 退款失败 | 400 |
| 50008 | 退款金额超过支付金额 | 400 |
| 50009 | 支付回调验证失败 | 400 |

### 商家相关错误码

| 错误码 | 描述 | HTTP状态码 |
|--------|------|------------|
| 60001 | 商家不存在 | 404 |
| 60002 | 商家申请已提交 | 400 |
| 60003 | 商家审核中 | 400 |
| 60004 | 商家审核失败 | 400 |
| 60005 | 商家已被禁用 | 403 |
| 60006 | 商家信息不完整 | 400 |

## 🚀 API测试示例

### 使用curl测试

#### 1. 用户登录

```bash
curl -X POST http://localhost:3001/api/auth/login \-H "Content-Type: application/json" \-d '{"email": "user@example.com", "password": "password123"}'
```

响应示例：
```json
{
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "123",
      "username": "testuser",
      "email": "user@example.com",
      "role": "user"
    }
  }
}
```

#### 2. 获取商品列表 (带认证)

```bash
curl -X GET http://localhost:3001/api/products?page=1&limit=10 \-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### 3. 创建订单 (带认证)

```bash
curl -X POST http://localhost:3001/api/orders \-H "Content-Type: application/json" \-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
-d '{
  "items": [
    {"productId": "456", "quantity": 2, "price": 100.00}
  ],
  "shippingAddress": {
    "name": "张三",
    "phone": "13800138000",
    "province": "海南省",
    "city": "三亚市",
    "district": "天涯区",
    "address": "三亚湾路123号"
  },
  "paymentMethod": "wechat",
  "remark": "请尽快发货"
}'
```

### 使用Postman测试

1. 下载并安装 [Postman](https://www.postman.com/)
2. 导入API集合：
   - 点击"Import"按钮
   - 选择"Link"选项卡
   - 输入API文档链接或上传本地文件
   - 点击"Continue"完成导入
3. 设置环境变量：
   - 点击右上角"Manage Environments"图标
   - 点击"Add"添加新环境
   - 填写环境名称 (如："Hitrip Dev")
   - 添加变量：
     - `base_url`: `http://localhost:3001/api`
     - `token`: (登录后获取的token值)
   - 点击"Save"保存
4. 测试API：
   - 选择导入的API请求
   - 选择设置的环境
   - 点击"Send"发送请求
   - 查看响应结果

### 使用JavaScript测试

```javascript
// 使用fetch API测试

// 1. 用户登录
async function login() {
  try {
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'password123'
      })
    });
    const data = await response.json();
    console.log('Login response:', data);
    return data.data.token;
  } catch (error) {
    console.error('Login failed:', error);
  }
}

// 2. 获取商品列表
async function getProducts() {
  try {
    const token = await login();
    const response = await fetch('http://localhost:3001/api/products?page=1&limit=10', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    console.log('Products:', data);
  } catch (error) {
    console.error('Get products failed:', error);
  }
}

// 调用函数测试
getProducts();
```

## 📊 API调用示例代码

### Node.js示例

```javascript
const axios = require('axios');

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器 - 添加token
apis.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器 - 统一错误处理
apis.interceptors.response.use(
  response => response.data,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
);

// API方法封装
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout')
};

export const productAPI = {
  getList: (params) => api.get('/products', { params }),
  getDetail: (id) => api.get(`/products/${id}`)
};

export const orderAPI = {
  create: (orderData) => api.post('/orders', orderData),
  getList: (params) => api.get('/orders', { params }),
  getDetail: (id) => api.get(`/orders/${id}`)
};

// 使用示例
async function example() {
  try {
    // 登录
    const loginResult = await authAPI.login({
      email: 'user@example.com',
      password: 'password123'
    });
    
    // 保存token
    localStorage.setItem('token', loginResult.data.token);
    
    // 获取商品列表
    const products = await productAPI.getList({ page: 1, limit: 10 });
    console.log('Products:', products.data.products);
    
    // 创建订单
    const order = await orderAPI.create({
      items: [{ productId: '456', quantity: 2, price: 100.00 }],
      shippingAddress: {
        name: '张三',
        phone: '13800138000',
        province: '海南省',
        city: '三亚市',
        district: '天涯区',
        address: '三亚湾路123号'
      },
      paymentMethod: 'wechat'
    });
    
    console.log('Order created:', order.data);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### React示例

```jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3001/api/products', {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: {
            page: 1,
            limit: 10
          }
        });
        setProducts(response.data.data.products);
      } catch (err) {
        setError(err.response?.data?.message || '获取商品列表失败');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;

  return (
    <div className="product-list">
      <h2>商品列表</h2>
      {products.map(product => (
        <div key={product.id} className="product-item">
          <h3>{product.name}</h3>
          <p>¥{product.price}</p>
          <img src={product.images[0]} alt={product.name} />
        </div>
      ))}
    </div>
  );
}

export default ProductList;
```