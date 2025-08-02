import { Document } from 'mongoose';
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
export declare const User: any;
//# sourceMappingURL=User.d.ts.map