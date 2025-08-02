import mongoose, { Document } from 'mongoose';
export interface IPointHistory extends Document {
    user: mongoose.Types.ObjectId;
    type: 'gain' | 'consume';
    amount: number;
    reason: string;
    createdAt: Date;
}
export declare const PointHistory: any;
//# sourceMappingURL=PointHistory.d.ts.map