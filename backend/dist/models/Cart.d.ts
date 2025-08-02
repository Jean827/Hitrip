import { Model, Optional } from 'sequelize';
import User from './User';
import Product from './Product';
export interface CartAttributes {
    id: string;
    userId: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface CartCreationAttributes extends Optional<CartAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class Cart extends Model<CartAttributes, CartCreationAttributes> implements CartAttributes {
    id: string;
    userId: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly user?: User;
    readonly items?: CartItem[];
}
export interface CartItemAttributes {
    id: string;
    cartId: string;
    productId: string;
    quantity: number;
    price: number;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface CartItemCreationAttributes extends Optional<CartItemAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class CartItem extends Model<CartItemAttributes, CartItemCreationAttributes> implements CartItemAttributes {
    id: string;
    cartId: string;
    productId: string;
    quantity: number;
    price: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly cart?: Cart;
    readonly product?: Product;
}
export { Cart, CartItem };
export default Cart;
//# sourceMappingURL=Cart.d.ts.map