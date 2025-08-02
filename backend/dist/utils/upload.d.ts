interface UploadResult {
    url: string;
    key: string;
    size: number;
    mimeType: string;
}
export declare const uploadToCloud: (buffer: Buffer, fileName: string) => Promise<UploadResult>;
export declare const deleteFromCloud: (key: string) => Promise<void>;
export declare const generateFileName: (originalName: string, prefix?: string) => string;
export {};
//# sourceMappingURL=upload.d.ts.map