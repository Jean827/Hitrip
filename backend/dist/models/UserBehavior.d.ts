import { Model } from 'sequelize';
export interface UserBehaviorAttributes {
    id: number;
    userId: number;
    productId?: number;
    categoryId?: number;
    behaviorType: 'view' | 'click' | 'purchase' | 'cart' | 'favorite' | 'search';
    behaviorData?: any;
    sessionId?: string;
    userAgent?: string;
    ipAddress?: string;
    referrer?: string;
    timestamp: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface UserBehaviorCreationAttributes extends Omit<UserBehaviorAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class UserBehavior extends Model<UserBehaviorAttributes, UserBehaviorCreationAttributes> implements UserBehaviorAttributes {
    id: number;
    userId: number;
    productId?: number;
    categoryId?: number;
    behaviorType: 'view' | 'click' | 'purchase' | 'cart' | 'favorite' | 'search';
    behaviorData?: any;
    sessionId?: string;
    userAgent?: string;
    ipAddress?: string;
    referrer?: string;
    timestamp: Date;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default UserBehavior;
//# sourceMappingURL=UserBehavior.d.ts.map