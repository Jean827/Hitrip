import mongoose, { Document, Schema } from 'mongoose';

export interface IPointHistory extends Document {
  user: mongoose.Types.ObjectId;
  type: 'gain' | 'consume';
  amount: number;
  reason: string;
  createdAt: Date;
}

const pointHistorySchema = new Schema<IPointHistory>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['gain', 'consume'], required: true },
  amount: { type: Number, required: true },
  reason: { type: String, required: true },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

export const PointHistory = mongoose.model<IPointHistory>('PointHistory', pointHistorySchema);