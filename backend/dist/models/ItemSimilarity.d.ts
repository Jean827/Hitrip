import { Model } from 'sequelize';
export interface ItemSimilarityAttributes {
    id: number;
    productId1: number;
    productId2: number;
    similarity: number;
    similarityType: 'content' | 'collaborative' | 'hybrid';
    lastCalculated: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface ItemSimilarityCreationAttributes extends Omit<ItemSimilarityAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class ItemSimilarity extends Model<ItemSimilarityAttributes, ItemSimilarityCreationAttributes> implements ItemSimilarityAttributes {
    id: number;
    productId1: number;
    productId2: number;
    similarity: number;
    similarityType: 'content' | 'collaborative' | 'hybrid';
    lastCalculated: Date;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default ItemSimilarity;
//# sourceMappingURL=ItemSimilarity.d.ts.map