"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Merchant = exports.VerificationStatus = exports.MerchantStatus = void 0;
const sequelize_1 = require("sequelize");
const sequelize_2 = require("../config/sequelize");
const User_1 = require("./User");
var MerchantStatus;
(function (MerchantStatus) {
    MerchantStatus["PENDING"] = "pending";
    MerchantStatus["ACTIVE"] = "active";
    MerchantStatus["SUSPENDED"] = "suspended";
    MerchantStatus["REJECTED"] = "rejected";
    MerchantStatus["CLOSED"] = "closed";
})(MerchantStatus || (exports.MerchantStatus = MerchantStatus = {}));
var VerificationStatus;
(function (VerificationStatus) {
    VerificationStatus["PENDING"] = "pending";
    VerificationStatus["VERIFIED"] = "verified";
    VerificationStatus["REJECTED"] = "rejected";
})(VerificationStatus || (exports.VerificationStatus = VerificationStatus = {}));
class Merchant extends sequelize_1.Model {
}
exports.Merchant = Merchant;
Merchant.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    name: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    logo: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    banner: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    contactPhone: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false,
    },
    contactEmail: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    address: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    businessLicense: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    idCardFront: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    idCardBack: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(MerchantStatus)),
        allowNull: false,
        defaultValue: MerchantStatus.PENDING,
    },
    verificationStatus: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(VerificationStatus)),
        allowNull: false,
        defaultValue: VerificationStatus.PENDING,
    },
    verificationTime: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    verificationRemark: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    commissionRate: {
        type: sequelize_1.DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 5.00,
    },
    settlementAccount: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
    },
    settlementBank: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
    },
    totalSales: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
    },
    totalOrders: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    rating: {
        type: sequelize_1.DataTypes.DECIMAL(3, 2),
        allowNull: false,
        defaultValue: 5.00,
    },
}, {
    sequelize: sequelize_2.sequelize,
    tableName: 'merchants',
    timestamps: true,
    indexes: [
        {
            fields: ['userId'],
        },
        {
            fields: ['status'],
        },
        {
            fields: ['verificationStatus'],
        },
        {
            fields: ['name'],
        },
    ],
});
Merchant.belongsTo(User_1.User, { foreignKey: 'userId', as: 'user' });
exports.default = Merchant;
//# sourceMappingURL=Merchant.js.map