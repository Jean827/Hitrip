import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}
export declare const authMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<any>;
export declare const authorize: (...roles: string[]) => (req: Request, res: Response, next: NextFunction) => any;
export declare const optionalAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const generateToken: (userId: string) => string;
export declare const generateRefreshToken: (userId: string) => string;
//# sourceMappingURL=auth.d.ts.map