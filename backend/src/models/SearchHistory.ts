import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

interface SearchHistoryAttributes {
  id: number;
  userId: number;
  query: string;
  resultCount: number;
  timestamp: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SearchHistoryCreationAttributes extends Optional<SearchHistoryAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class SearchHistory extends Model<SearchHistoryAttributes, SearchHistoryCreationAttributes> implements SearchHistoryAttributes {
  public id!: number;
  public userId!: number;
  public query!: string;
  public resultCount!: number;
  public timestamp!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SearchHistory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    query: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    resultCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'search_history',
    timestamps: true,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['query'],
      },
      {
        fields: ['timestamp'],
      },
      {
        fields: ['userId', 'timestamp'],
      },
    ],
  }
);

export default SearchHistory; 