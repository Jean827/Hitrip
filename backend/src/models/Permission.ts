import mongoose, { Document, Schema } from 'mongoose';

export interface IPermission extends Document {
  name: string;
  code: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const permissionSchema = new Schema<IPermission>({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  description: { type: String },
}, {
  timestamps: true,
});

export const Permission = mongoose.model<IPermission>('Permission', permissionSchema);