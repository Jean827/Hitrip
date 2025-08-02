import { Model, Optional } from 'sequelize';
export interface CouponAttributes {
    id: string;
    code: string;
    name: string;
    type: 'discount' | 'full_reduction' | 'free_shipping' | 'points';
    discountValue: number;
    minAmount: number;
    maxDiscount: number;
    startTime: Date;
    endTime: Date;
    usageLimit: number;
    usedCount: number;
    status: 'active' | 'inactive' | 'expired';
    applicableProducts: string[];
    applicableUsers: string[];
    createdBy: string;
    updatedBy: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface CouponCreationAttributes extends Optional<CouponAttributes, 'id' | 'usedCount' | 'createdAt' | 'updatedAt'> {
}
declare class Coupon extends Model<CouponAttributes, CouponCreationAttributes> implements CouponAttributes {
    id: string;
    code: string;
    name: string;
    type: 'discount' | 'full_reduction' | 'free_shipping' | 'points';
    discountValue: number;
    minAmount: number;
    maxDiscount: number;
    startTime: Date;
    endTime: Date;
    usageLimit: number;
    usedCount: number;
    status: 'active' | 'inactive' | 'expired';
    applicableProducts: string[];
    applicableUsers: string[];
    createdBy: string;
    updatedBy: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Coupon;
//# sourceMappingURL=Coupon.d.ts.map