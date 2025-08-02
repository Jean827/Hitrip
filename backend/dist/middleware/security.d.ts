import { Request, Response, NextFunction } from 'express';
export declare const securityHeaders: any;
export declare const corsOptions: any;
export declare const inputValidation: (req: Request, res: Response, next: NextFunction) => void;
export declare const fileUploadSecurity: (req: Request, res: Response, next: NextFunction) => void;
export declare const sessionSecurity: (req: Request, res: Response, next: NextFunction) => void;
export declare const permissionCheck: (requiredPermissions: string[]) => (req: Request, res: Response, next: NextFunction) => void;
export declare const securityLogger: (req: Request, res: Response, next: NextFunction) => void;
export declare const securityRateLimit: any;
export declare const loginRateLimit: any;
export declare const securityResponseHeaders: (req: Request, res: Response, next: NextFunction) => void;
export declare const secureErrorHandler: (err: any, req: Request, res: Response, next: NextFunction) => void;
export declare const securityConfig: {
    helmet: any;
    cors: any;
    hpp: any;
    xss: any;
    mongoSanitize: any;
    inputValidation: (req: Request, res: Response, next: NextFunction) => void;
    fileUploadSecurity: (req: Request, res: Response, next: NextFunction) => void;
    sessionSecurity: (req: Request, res: Response, next: NextFunction) => void;
    securityLogger: (req: Request, res: Response, next: NextFunction) => void;
    securityResponseHeaders: (req: Request, res: Response, next: NextFunction) => void;
    secureErrorHandler: (err: any, req: Request, res: Response, next: NextFunction) => void;
};
//# sourceMappingURL=security.d.ts.map