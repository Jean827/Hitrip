import { Model, Optional } from 'sequelize';
export interface CategoryAttributes {
    id: string;
    name: string;
    description: string;
    parentId?: string;
    level: number;
    sortOrder: number;
    isActive: boolean;
    icon?: string;
    image?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface CategoryCreationAttributes extends Optional<CategoryAttributes, 'id' | 'level' | 'sortOrder' | 'isActive' | 'createdAt' | 'updatedAt'> {
}
declare class Category extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryAttributes {
    id: string;
    name: string;
    description: string;
    parentId?: string;
    level: number;
    sortOrder: number;
    isActive: boolean;
    icon?: string;
    image?: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly parent?: Category;
    readonly children?: Category[];
}
export default Category;
//# sourceMappingURL=Category.d.ts.map