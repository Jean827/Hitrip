import { Model, Optional } from 'sequelize';
export interface UserPreferenceAttributes {
    id: string;
    userId: string;
    categoryId: string;
    preferenceScore: number;
    lastUpdated: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface UserPreferenceCreationAttributes extends Optional<UserPreferenceAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class UserPreference extends Model<UserPreferenceAttributes, UserPreferenceCreationAttributes> implements UserPreferenceAttributes {
    id: string;
    userId: string;
    categoryId: string;
    preferenceScore: number;
    lastUpdated: Date;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default UserPreference;
//# sourceMappingURL=UserPreference.d.ts.map