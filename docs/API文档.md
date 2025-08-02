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