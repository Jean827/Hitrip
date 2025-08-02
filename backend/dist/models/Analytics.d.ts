import { Model, Optional } from 'sequelize';
export interface UserBehaviorAttributes {
    id: number;
    userId?: number;
    sessionId: string;
    eventType: 'page_view' | 'click' | 'search' | 'purchase' | 'add_to_cart' | 'remove_from_cart' | 'login' | 'logout' | 'register';
    eventName: string;
    pageUrl?: string;
    referrer?: string;
    userAgent?: string;
    ipAddress?: string;
    timestamp: Date;
    metadata?: any;
    createdAt: Date;
}
export interface UserBehaviorCreationAttributes extends Optional<UserBehaviorAttributes, 'id' | 'createdAt'> {
}
export declare class UserBehavior extends Model<UserBehaviorAttributes, UserBehaviorCreationAttributes> implements UserBehaviorAttributes {
    id: number;
    userId?: number;
    sessionId: string;
    eventType: 'page_view' | 'click' | 'search' | 'purchase' | 'add_to_cart' | 'remove_from_cart' | 'login' | 'logout' | 'register';
    eventName: string;
    pageUrl?: string;
    referrer?: string;
    userAgent?: string;
    ipAddress?: string;
    timestamp: Date;
    metadata?: any;
    readonly createdAt: Date;
}
export interface SalesDataAttributes {
    id: number;
    orderId: number;
    productId: number;
    userId: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    discountAmount: number;
    finalPrice: number;
    paymentMethod: string;
    orderStatus: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
    orderDate: Date;
    paymentDate?: Date;
    shippingDate?: Date;
    deliveryDate?: Date;
    region: string;
    channel: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface SalesDataCreationAttributes extends Optional<SalesDataAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
export declare class SalesData extends Model<SalesDataAttributes, SalesDataCreationAttributes> implements SalesDataAttributes {
    id: number;
    orderId: number;
    productId: number;
    userId: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    discountAmount: number;
    finalPrice: number;
    paymentMethod: string;
    orderStatus: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
    orderDate: Date;
    paymentDate?: Date;
    shippingDate?: Date;
    deliveryDate?: Date;
    region: string;
    channel: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export interface SystemMetricsAttributes {
    id: number;
    metricName: string;
    metricValue: number;
    metricUnit: string;
    timestamp: Date;
    serverId?: string;
    component?: string;
    metadata?: any;
    createdAt: Date;
}
export interface SystemMetricsCreationAttributes extends Optional<SystemMetricsAttributes, 'id' | 'createdAt'> {
}
export declare class SystemMetrics extends Model<SystemMetricsAttributes, SystemMetricsCreationAttributes> implements SystemMetricsAttributes {
    id: number;
    metricName: string;
    metricValue: number;
    metricUnit: string;
    timestamp: Date;
    serverId?: string;
    component?: string;
    metadata?: any;
    readonly createdAt: Date;
}
export interface BusinessMetricsAttributes {
    id: number;
    metricName: string;
    metricValue: number;
    metricUnit: string;
    period: 'hourly' | 'daily' | 'weekly' | 'monthly';
    startTime: Date;
    endTime: Date;
    category: string;
    metadata?: any;
    createdAt: Date;
}
export interface BusinessMetricsCreationAttributes extends Optional<BusinessMetricsAttributes, 'id' | 'createdAt'> {
}
export declare class BusinessMetrics extends Model<BusinessMetricsAttributes, BusinessMetricsCreationAttributes> implements BusinessMetricsAttributes {
    id: number;
    metricName: string;
    metricValue: number;
    metricUnit: string;
    period: 'hourly' | 'daily' | 'weekly' | 'monthly';
    startTime: Date;
    endTime: Date;
    category: string;
    metadata?: any;
    readonly createdAt: Date;
}
declare const _default: {
    UserBehavior: typeof UserBehavior;
    SalesData: typeof SalesData;
    SystemMetrics: typeof SystemMetrics;
    BusinessMetrics: typeof BusinessMetrics;
};
export default _default;
//# sourceMappingURL=Analytics.d.ts.map