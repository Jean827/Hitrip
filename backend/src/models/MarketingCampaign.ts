import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

export interface MarketingCampaignAttributes {
  id: string;
  name: string;
  description: string;
  type: 'discount' | 'full_reduction' | 'points' | 'free_shipping';
  startTime: Date;
  endTime: Date;
  status: 'draft' | 'active' | 'paused' | 'ended';
  rules: any;
  budget: number;
  targetAudience: any;
  statistics: any;
  createdBy: string;
  updatedBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MarketingCampaignCreationAttributes extends Optional<MarketingCampaignAttributes, 'id' | 'statistics' | 'createdAt' | 'updatedAt'> {}

class MarketingCampaign extends Model<MarketingCampaignAttributes, MarketingCampaignCreationAttributes> implements MarketingCampaignAttributes {
  public id!: string;
  public name!: string;
  public description!: string;
  public type!: 'discount' | 'full_reduction' | 'points' | 'free_shipping';
  public startTime!: Date;
  public endTime!: Date;
  public status!: 'draft' | 'active' | 'paused' | 'ended';
  public rules!: any;
  public budget!: number;
  public targetAudience!: any;
  public statistics!: any;
  public createdBy!: string;
  public updatedBy!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

MarketingCampaign.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM('discount', 'full_reduction', 'points', 'free_shipping'),
      allowNull: false,
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('draft', 'active', 'paused', 'ended'),
      defaultValue: 'draft',
    },
    rules: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    budget: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    targetAudience: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    statistics: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    updatedBy: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'marketing_campaigns',
    timestamps: true,
  }
);

export default MarketingCampaign; 