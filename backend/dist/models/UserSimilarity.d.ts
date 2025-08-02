import { Model } from 'sequelize';
interface UserSimilarityAttributes {
    id: string;
    userId: string;
    similarUserId: string;
    similarity: number;
    algorithm: string;
    lastUpdated: Date;
}
interface UserSimilarityCreationAttributes extends Omit<UserSimilarityAttributes, 'id' | 'lastUpdated'> {
}
declare class UserSimilarity extends Model<UserSimilarityAttributes, UserSimilarityCreationAttributes> {
    id: string;
    userId: string;
    similarUserId: string;
    similarity: number;
    algorithm: string;
    lastUpdated: Date;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default UserSimilarity;
//# sourceMappingURL=UserSimilarity.d.ts.map