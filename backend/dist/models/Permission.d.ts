import { Document } from 'mongoose';
export interface IPermission extends Document {
    name: string;
    code: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Permission: any;
//# sourceMappingURL=Permission.d.ts.map