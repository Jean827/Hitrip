import { Model, Optional } from 'sequelize';
interface ABTestAttributes {
    id: number;
    userId: number;
    testName: string;
    variant: string;
    recommendationType: string;
    productIds: string;
    clicks: boolean;
    purchases: boolean;
    timestamp: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
interface ABTestCreationAttributes extends Optional<ABTestAttributes, 'id' | 'clicks' | 'purchases' | 'createdAt' | 'updatedAt'> {
}
declare class ABTest extends Model<ABTestAttributes, ABTestCreationAttributes> implements ABTestAttributes {
    id: number;
    userId: number;
    testName: string;
    variant: string;
    recommendationType: string;
    productIds: string;
    clicks: boolean;
    purchases: boolean;
    timestamp: Date;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default ABTest;
//# sourceMappingURL=ABTest.d.ts.map