import { Document } from 'mongoose';
export interface IRole extends Document {
    name: string;
    description?: string;
    permissions: string[];
    menus: string[];
    createdAt: Date;
    updatedAt: Date;
}
export declare const Role: any;
//# sourceMappingURL=Role.d.ts.map