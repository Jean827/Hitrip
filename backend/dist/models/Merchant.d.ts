import { Model, Optional } from 'sequelize';
export declare enum MerchantStatus {
    PENDING = "pending",
    ACTIVE = "active",
    SUSPENDED = "suspended",
    REJECTED = "rejected",
    CLOSED = "closed"
}
export declare enum VerificationStatus {
    PENDING = "pending",
    VERIFIED = "verified",
    REJECTED = "rejected"
}
interface MerchantAttributes {
    id: string;
    userId: string;
    name: string;
    description: string;
    logo: string;
    banner: string;
    contactPhone: string;
    contactEmail: string;
    address: string;
    businessLicense: string;
    idCardFront: string;
    idCardBack: string;
    status: MerchantStatus;
    verificationStatus: VerificationStatus;
    verificationTime?: Date;
    verificationRemark?: string;
    commissionRate: number;
    settlementAccount: string;
    settlementBank: string;
    totalSales: number;
    totalOrders: number;
    rating: number;
    createdAt: Date;
    updatedAt: Date;
}
interface MerchantCreationAttributes extends Optional<MerchantAttributes, 'id' | 'status' | 'verificationStatus' | 'commissionRate' | 'totalSales' | 'totalOrders' | 'rating' | 'createdAt' | 'updatedAt'> {
}
export declare class Merchant extends Model<MerchantAttributes, MerchantCreationAttributes> implements MerchantAttributes {
    id: string;
    userId: string;
    name: string;
    description: string;
    logo: string;
    banner: string;
    contactPhone: string;
    contactEmail: string;
    address: string;
    businessLicense: string;
    idCardFront: string;
    idCardBack: string;
    status: MerchantStatus;
    verificationStatus: VerificationStatus;
    verificationTime?: Date;
    verificationRemark?: string;
    commissionRate: number;
    settlementAccount: string;
    settlementBank: string;
    totalSales: number;
    totalOrders: number;
    rating: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly user?: User;
    readonly products?: any[];
}
export default Merchant;
//# sourceMappingURL=Merchant.d.ts.map