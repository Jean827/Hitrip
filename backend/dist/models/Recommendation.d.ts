import { Model } from 'sequelize';
export interface RecommendationAttributes {
    id: number;
    userId: number;
    productId: number;
    score: number;
    recommendationType: 'collaborative' | 'content' | 'popular' | 'hybrid';
    reason?: string;
    isDisplayed: boolean;
    isClicked?: boolean;
    isPurchased?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface RecommendationCreationAttributes extends Omit<RecommendationAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class Recommendation extends Model<RecommendationAttributes, RecommendationCreationAttributes> implements RecommendationAttributes {
    id: number;
    userId: number;
    productId: number;
    score: number;
    recommendationType: 'collaborative' | 'content' | 'popular' | 'hybrid';
    reason?: string;
    isDisplayed: boolean;
    isClicked?: boolean;
    isPurchased?: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Recommendation;
//# sourceMappingURL=Recommendation.d.ts.map