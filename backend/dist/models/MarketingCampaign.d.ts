import { Model, Optional } from 'sequelize';
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
export interface MarketingCampaignCreationAttributes extends Optional<MarketingCampaignAttributes, 'id' | 'statistics' | 'createdAt' | 'updatedAt'> {
}
declare class MarketingCampaign extends Model<MarketingCampaignAttributes, MarketingCampaignCreationAttributes> implements MarketingCampaignAttributes {
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
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default MarketingCampaign;
//# sourceMappingURL=MarketingCampaign.d.ts.map