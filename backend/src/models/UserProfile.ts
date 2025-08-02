import { DataTypes, Model, Sequelize } from 'sequelize';
import sequelize from '../config/sequelize';

interface UserProfileAttributes {
  id: string;
  userId: string;
  interests: string[]; // 兴趣标签
  behaviorPatterns: any; // 行为模式
  userValue: number; // 用户价值
  userSegment: string; // 用户分群
  lastUpdated: Date;
}

interface UserProfileCreationAttributes extends Omit<UserProfileAttributes, 'id' | 'lastUpdated'> {}

class UserProfile extends Model<UserProfileAttributes, UserProfileCreationAttributes> {
  public id!: string;
  public userId!: string;
  public interests!: string[];
  public behaviorPatterns!: any;
  public userValue!: number;
  public userSegment!: string;
  public lastUpdated!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserProfile.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    interests: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    behaviorPatterns: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
    },
    userValue: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
    userSegment: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'new',
      validate: {
        isIn: [['new', 'active', 'vip', 'inactive']],
      },
    },
    lastUpdated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'user_profiles',
    timestamps: true,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['userSegment'],
      },
      {
        fields: ['userValue'],
      },
    ],
  }
);

export default UserProfile; 