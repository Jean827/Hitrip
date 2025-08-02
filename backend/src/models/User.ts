import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         _id:
 *           type: string
 *           description: 用户ID
 *         username:
 *           type: string
 *           description: 用户名
 *           minLength: 3
 *           maxLength: 20
 *         email:
 *           type: string
 *           format: email
 *           description: 邮箱地址
 *         password:
 *           type: string
 *           description: 密码（加密后）
 *           minLength: 6
 *         nickname:
 *           type: string
 *           description: 昵称
 *           maxLength: 50
 *         avatar:
 *           type: string
 *           description: 头像URL
 *         realName:
 *           type: string
 *           description: 真实姓名
 *         gender:
 *           type: string
 *           enum: [male, female, other]
 *           description: 性别
 *         birthday:
 *           type: string
 *           format: date
 *           description: 生日
 *         address:
 *           type: string
 *           description: 地址
 *         phone:
 *           type: string
 *           description: 手机号
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           default: user
 *           description: 用户角色
 *         status:
 *           type: string
 *           enum: [active, inactive, banned]
 *           default: active
 *           description: 用户状态
 *         points:
 *           type: number
 *           default: 0
 *           description: 积分
 *         level:
 *           type: number
 *           default: 1
 *           description: 等级
 *         vipLevel:
 *           type: number
 *           default: 0
 *           description: VIP等级
 *         isEmailVerified:
 *           type: boolean
 *           default: false
 *           description: 邮箱是否已验证
 *         isPhoneVerified:
 *           type: boolean
 *           default: false
 *           description: 手机号是否已验证
 *         loginAttempts:
 *           type: number
 *           default: 0
 *           description: 登录尝试次数
 *         lockUntil:
 *           type: string
 *           format: date
 *           description: 账户锁定时间
 *         lastLoginAt:
 *           type: string
 *           format: date
 *           description: 最后登录时间
 *         preferences:
 *           type: object
 *           description: 用户偏好设置
 *           properties:
 *             language:
 *               type: string
 *               default: zh-CN
 *             theme:
 *               type: string
 *               enum: [light, dark]
 *               default: light
 *             notifications:
 *               type: object
 *               properties:
 *                 email:
 *                   type: boolean
 *                   default: true
 *                 sms:
 *                   type: boolean
 *                   default: false
 *                 push:
 *                   type: boolean
 *                   default: true
 *         socialAccounts:
 *           type: object
 *           description: 社交账号绑定
 *           properties:
 *             wechat:
 *               type: string
 *             alipay:
 *               type: string
 *             qq:
 *               type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 */

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  nickname?: string;
  avatar?: string;
  realName?: string;
  gender?: 'male' | 'female' | 'other';
  birthday?: Date;
  address?: string;
  phone?: string;
  role: 'user' | 'admin';
  status: 'active' | 'inactive' | 'banned';
  points: number;
  level: number;
  vipLevel: number;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  loginAttempts: number;
  lockUntil?: Date;
  lastLoginAt?: Date;
  preferences: {
    language: string;
    theme: 'light' | 'dark';
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
  };
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateEmailVerificationToken(): string;
  generatePasswordResetToken(): string;
  incrementLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
  nickname: {
    type: String,
    trim: true,
    maxlength: 50
  },
  avatar: {
    type: String
  },
  realName: {
    type: String,
    trim: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  birthday: {
    type: Date
  },
  address: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    match: /^1[3-9]\d{9}$/
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'banned'],
    default: 'active'
  },
  points: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  vipLevel: {
    type: Number,
    default: 0
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  lastLoginAt: {
    type: Date
  },
  preferences: {
    language: {
      type: String,
      default: 'zh-CN'
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  },
  socialAccounts: {
    wechat: String,
    alipay: String,
    qq: String
  }
}, {
  timestamps: true
});

// 密码加密中间件
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// 密码比较方法
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// 生成邮箱验证token
userSchema.methods.generateEmailVerificationToken = function(): string {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { userId: this._id, type: 'email_verification' },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  );
};

// 生成密码重置token
userSchema.methods.generatePasswordResetToken = function(): string {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { userId: this._id, type: 'password_reset' },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );
};

// 增加登录尝试次数
userSchema.methods.incrementLoginAttempts = async function(): Promise<void> {
  this.loginAttempts += 1;
  
  if (this.loginAttempts >= 5) {
    this.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 锁定30分钟
  }
  
  await this.save();
};

// 重置登录尝试次数
userSchema.methods.resetLoginAttempts = async function(): Promise<void> {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  await this.save();
};

export const User = mongoose.model<IUser>('User', userSchema); 