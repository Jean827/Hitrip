import { Model, Optional } from 'sequelize';
import Product from './Product';
export interface InventoryAttributes {
    id: string;
    productId: string;
    quantity: number;
    reservedQuantity: number;
    availableQuantity: number;
    lowStockThreshold: number;
    maxStock: number;
    location?: string;
    batchNumber?: string;
    expiryDate?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface InventoryCreationAttributes extends Optional<InventoryAttributes, 'id' | 'reservedQuantity' | 'availableQuantity' | 'createdAt' | 'updatedAt'> {
}
declare class Inventory extends Model<InventoryAttributes, InventoryCreationAttributes> implements InventoryAttributes {
    id: string;
    productId: string;
    quantity: number;
    reservedQuantity: number;
    availableQuantity: number;
    lowStockThreshold: number;
    maxStock: number;
    location?: string;
    batchNumber?: string;
    expiryDate?: Date;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly product?: Product;
}
export default Inventory;
//# sourceMappingURL=Inventory.d.ts.map