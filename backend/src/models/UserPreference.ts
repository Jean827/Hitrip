import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

export interface UserPreferenceAttributes {
  id: string;
  userId: string;
  categoryId: string;
  preferenceScore: number; // 偏好分数 0-1
  lastUpdated: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserPreferenceCreationAttributes extends Optional<UserPreferenceAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class UserPreference extends Model<UserPreferenceAttributes, UserPreferenceCreationAttributes> implements UserPreferenceAttributes {
  public id!: string;
  public userId!: string;
  public categoryId!: string;
  public preferenceScore!: number;
  public lastUpdated!: Date;

  // 时间戳
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserPreference.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    categoryId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    preferenceScore: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 0.0,
      validate: {
        min: 0,
        max: 1,
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
    tableName: 'user_preferences',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'categoryId'],
      },
    ],
  }
);

export default UserPreference; 