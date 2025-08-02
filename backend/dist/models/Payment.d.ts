import { Model, Optional } from 'sequelize';
import { Order } from './Order';
export declare enum PaymentStatus {
    PENDING = "pending",
    PAID = "paid",
    FAILED = "failed",
    REFUNDED = "refunded",
    PARTIAL_REFUNDED = "partial_refunded"
}
export declare enum PaymentMethod {
    WECHAT = "wechat",
    ALIPAY = "alipay",
    BANK_CARD = "bank_card"
}
interface PaymentAttributes {
    id: string;
    orderId: string;
    userId: string;
    paymentMethod: PaymentMethod;
    amount: number;
    status: PaymentStatus;
    transactionId?: string;
    paymentTime?: Date;
    refundAmount: number;
    refundTime?: Date;
    refundReason?: string;
    callbackData?: any;
    remark?: string;
    createdAt: Date;
    updatedAt: Date;
}
interface PaymentCreationAttributes extends Optional<PaymentAttributes, 'id' | 'status' | 'refundAmount' | 'createdAt' | 'updatedAt'> {
}
export declare class Payment extends Model<PaymentAttributes, PaymentCreationAttributes> implements PaymentAttributes {
    id: string;
    orderId: string;
    userId: string;
    paymentMethod: PaymentMethod;
    amount: number;
    status: PaymentStatus;
    transactionId?: string;
    paymentTime?: Date;
    refundAmount: number;
    refundTime?: Date;
    refundReason?: string;
    callbackData?: any;
    remark?: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly user?: User;
    readonly order?: Order;
}
export default Payment;
//# sourceMappingURL=Payment.d.ts.map