import { Model, Optional } from 'sequelize';
export declare enum OrderStatus {
    PENDING = "pending",
    PAID = "paid",
    SHIPPED = "shipped",
    DELIVERED = "delivered",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    REFUNDED = "refunded"
}
export declare enum PaymentStatus {
    PENDING = "pending",
    PAID = "paid",
    FAILED = "failed",
    REFUNDED = "refunded"
}
export declare enum PaymentMethod {
    WECHAT = "wechat",
    ALIPAY = "alipay",
    BANK_CARD = "bank_card"
}
interface Address {
    name: string;
    phone: string;
    province: string;
    city: string;
    district: string;
    address: string;
    zipCode?: string;
}
interface OrderAttributes {
    id: string;
    userId: string;
    orderNumber: string;
    status: OrderStatus;
    totalAmount: number;
    paymentAmount: number;
    discountAmount: number;
    shippingFee: number;
    shippingAddress: Address;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    paymentTime?: Date;
    shippedTime?: Date;
    deliveredTime?: Date;
    completedTime?: Date;
    cancelledTime?: Date;
    cancelReason?: string;
    remark?: string;
    createdAt: Date;
    updatedAt: Date;
}
interface OrderCreationAttributes extends Optional<OrderAttributes, 'id' | 'orderNumber' | 'status' | 'paymentStatus' | 'createdAt' | 'updatedAt'> {
}
export declare class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
    id: string;
    userId: string;
    orderNumber: string;
    status: OrderStatus;
    totalAmount: number;
    paymentAmount: number;
    discountAmount: number;
    shippingFee: number;
    shippingAddress: Address;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    paymentTime?: Date;
    shippedTime?: Date;
    deliveredTime?: Date;
    completedTime?: Date;
    cancelledTime?: Date;
    cancelReason?: string;
    remark?: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly user?: User;
    readonly orderItems?: any[];
}
export default Order;
//# sourceMappingURL=Order.d.ts.map