import mongoose, { Document, Schema } from 'mongoose';

export interface IRole extends Document {
  name: string;
  description?: string;
  permissions: string[];
  menus: string[];
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<IRole>({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  permissions: [{ type: String }],
  menus: [{ type: String }],
}, {
  timestamps: true,
});

export const Role = mongoose.model<IRole>('Role', roleSchema);