import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

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

export interface UserPointsCreationAttributes extends Optional<UserPointsAttributes, 'id' | 'totalPoints' | 'availablePoints' | 'usedPoints' | 'lastUpdated' | 'createdAt' | 'updatedAt'> {}

class UserPoints extends Model<UserPointsAttributes, UserPointsCreationAttributes> implements UserPointsAttributes {
  public id!: string;
  public userId!: string;
  public totalPoints!: number;
  public availablePoints!: number;
  public usedPoints!: number;
  public lastUpdated!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserPoints.init(
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
    },
    totalPoints: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    availablePoints: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    usedPoints: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    lastUpdated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'user_points',
    timestamps: true,
  }
);

export default UserPoints; 