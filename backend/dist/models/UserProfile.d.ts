import { Model } from 'sequelize';
interface UserProfileAttributes {
    id: string;
    userId: string;
    interests: string[];
    behaviorPatterns: any;
    userValue: number;
    userSegment: string;
    lastUpdated: Date;
}
interface UserProfileCreationAttributes extends Omit<UserProfileAttributes, 'id' | 'lastUpdated'> {
}
declare class UserProfile extends Model<UserProfileAttributes, UserProfileCreationAttributes> {
    id: string;
    userId: string;
    interests: string[];
    behaviorPatterns: any;
    userValue: number;
    userSegment: string;
    lastUpdated: Date;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default UserProfile;
//# sourceMappingURL=UserProfile.d.ts.map