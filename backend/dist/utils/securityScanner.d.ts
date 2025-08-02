import { Request } from 'express';
declare class SecurityScanner {
    private static instance;
    private securityEvents;
    private blockedIPs;
    private rateLimitMap;
    static getInstance(): SecurityScanner;
    checkSqlInjection(input: string): boolean;
    checkXSS(input: string): boolean;
    checkPathTraversal(input: string): boolean;
    checkCommandInjection(input: string): boolean;
    checkMaliciousUserAgent(userAgent: string): boolean;
    checkRequestSize(req: Request): boolean;
    checkRateLimit(ip: string): boolean;
    checkCSRF(req: Request): boolean;
    sanitizeInput(input: string): string;
    checkPasswordStrength(password: string): {
        isValid: boolean;
        score: number;
        suggestions: string[];
    };
    generateSecureToken(): string;
    generateCSRFToken(): string;
    hashPassword(password: string): Promise<string>;
    verifyPassword(password: string, hash: string): Promise<boolean>;
    logSecurityEvent(type: string, data: any): void;
    getSecurityEvents(): any[];
    clearSecurityEvents(): void;
    isIPBlocked(ip: string): boolean;
    blockIP(ip: string): void;
    unblockIP(ip: string): void;
    getBlockedIPs(): string[];
    performSecurityCheck(req: Request): {
        isSafe: boolean;
        threats: string[];
        recommendations: string[];
    };
    generateSecurityReport(): any;
}
export declare const securityScanner: SecurityScanner;
export {};
//# sourceMappingURL=securityScanner.d.ts.map