import { Model, Optional } from 'sequelize';
export interface PointProductAttributes {
    id: string;
    name: string;
    description: string;
    image: string;
    points: number;
    stock: number;
    status: 'active' | 'inactive' | 'out_of_stock';
    category: string;
    exchangeCount: number;
    createdBy: string;
    updatedBy: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface PointProductCreationAttributes extends Optional<PointProductAttributes, 'id' | 'exchangeCount' | 'createdAt' | 'updatedAt'> {
}
declare class PointProduct extends Model<PointProductAttributes, PointProductCreationAttributes> implements PointProductAttributes {
    id: string;
    name: string;
    description: string;
    image: string;
    points: number;
    stock: number;
    status: 'active' | 'inactive' | 'out_of_stock';
    category: string;
    exchangeCount: number;
    createdBy: string;
    updatedBy: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default PointProduct;
//# sourceMappingURL=PointProduct.d.ts.map