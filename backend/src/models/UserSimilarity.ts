import { DataTypes, Model, Sequelize } from 'sequelize';
import sequelize from '../config/sequelize';

interface UserSimilarityAttributes {
  id: string;
  userId: string;
  similarUserId: string;
  similarity: number;
  algorithm: string;
  lastUpdated: Date;
}

interface UserSimilarityCreationAttributes extends Omit<UserSimilarityAttributes, 'id' | 'lastUpdated'> {}

class UserSimilarity extends Model<UserSimilarityAttributes, UserSimilarityCreationAttributes> {
  public id!: string;
  public userId!: string;
  public similarUserId!: string;
  public similarity!: number;
  public algorithm!: string;
  public lastUpdated!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserSimilarity.init(
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
        model: 'Users',
        key: 'id',
      },
    },
    similarUserId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    similarity: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: false,
      validate: {
        min: 0,
        max: 1,
      },
    },
    algorithm: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'cosine',
    },
    lastUpdated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'user_similarities',
    timestamps: true,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['similarUserId'],
      },
      {
        fields: ['similarity'],
      },
    ],
  }
);

export default UserSimilarity; 