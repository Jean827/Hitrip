import { Model, Optional } from 'sequelize';
export interface UserPointsAttributes {
    id: string;
    userId: string;
    totalPoints: number;
    availablePoints: number;
    usedPoints: number;
    lastUpdated: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface UserPointsCreationAttributes extends Optional<UserPointsAttributes, 'id' | 'totalPoints' | 'availablePoints' | 'usedPoints' | 'lastUpdated' | 'createdAt' | 'updatedAt'> {
}
declare class UserPoints extends Model<UserPointsAttributes, UserPointsCreationAttributes> implements UserPointsAttributes {
    id: string;
    userId: string;
    totalPoints: number;
    availablePoints: number;
    usedPoints: number;
    lastUpdated: Date;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default UserPoints;
//# sourceMappingURL=UserPoints.d.ts.map