import { Model, Optional } from 'sequelize';
import Category from './Category';
export interface ProductAttributes {
    id: string;
    name: string;
    description: string;
    categoryId: string;
    price: number;
    originalPrice: number;
    discountPrice?: number;
    memberPrice?: number;
    images: string[];
    tags: string[];
    isActive: boolean;
    stock: number;
    salesCount: number;
    rating: number;
    reviewCount: number;
    weight?: number;
    dimensions?: string;
    brand?: string;
    model?: string;
    warranty?: string;
    merchantId?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface ProductCreationAttributes extends Optional<ProductAttributes, 'id' | 'salesCount' | 'rating' | 'reviewCount' | 'isActive' | 'createdAt' | 'updatedAt'> {
}
declare class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
    id: string;
    name: string;
    description: string;
    categoryId: string;
    price: number;
    originalPrice: number;
    discountPrice?: number;
    memberPrice?: number;
    images: string[];
    tags: string[];
    isActive: boolean;
    stock: number;
    salesCount: number;
    rating: number;
    reviewCount: number;
    weight?: number;
    dimensions?: string;
    brand?: string;
    model?: string;
    warranty?: string;
    merchantId?: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly category?: Category;
}
export default Product;
//# sourceMappingURL=Product.d.ts.map