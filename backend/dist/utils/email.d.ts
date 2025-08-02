interface EmailOptions {
    to: string;
    subject: string;
    template?: string;
    data?: any;
    html?: string;
    text?: string;
}
export declare const sendEmail: (options: EmailOptions) => Promise<void>;
export declare const sendVerificationEmail: (email: string, username: string, token: string) => Promise<void>;
export declare const sendPasswordResetEmail: (email: string, username: string, token: string) => Promise<void>;
export declare const sendWelcomeEmail: (email: string, username: string) => Promise<void>;
export {};
//# sourceMappingURL=email.d.ts.map