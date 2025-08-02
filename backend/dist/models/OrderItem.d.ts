import { Model, Optional } from 'sequelize';
import { Order } from './Order';
import { Product } from './Product';
interface OrderItemAttributes {
    id: string;
    orderId: string;
    productId: string;
    productName: string;
    productImage: string;
    productSku?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    discountPrice?: number;
    specifications?: any;
    createdAt: Date;
    updatedAt: Date;
}
interface OrderItemCreationAttributes extends Optional<OrderItemAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
export declare class OrderItem extends Model<OrderItemAttributes, OrderItemCreationAttributes> implements OrderItemAttributes {
    id: string;
    orderId: string;
    productId: string;
    productName: string;
    productImage: string;
    productSku?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    discountPrice?: number;
    specifications?: any;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly order?: Order;
    readonly product?: Product;
}
export default OrderItem;
//# sourceMappingURL=OrderItem.d.ts.map