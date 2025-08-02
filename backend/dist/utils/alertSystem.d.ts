export declare enum AlertLevel {
    INFO = "info",
    WARNING = "warning",
    ERROR = "error",
    CRITICAL = "critical"
}
export declare enum AlertType {
    PERFORMANCE = "performance",
    ERROR = "error",
    SECURITY = "security",
    BUSINESS = "business",
    SYSTEM = "system"
}
interface Alert {
    id: string;
    type: AlertType;
    level: AlertLevel;
    title: string;
    message: string;
    details: any;
    timestamp: Date;
    resolved: boolean;
    resolvedAt?: Date;
    resolvedBy?: string;
}
interface AlertNotificationConfig {
    email: {
        enabled: boolean;
        recipients: string[];
        smtp: {
            host: string;
            port: number;
            secure: boolean;
            auth: {
                user: string;
                pass: string;
            };
        };
    };
    webhook: {
        enabled: boolean;
        url: string;
        headers?: Record<string, string>;
    };
    slack: {
        enabled: boolean;
        webhookUrl: string;
        channel: string;
    };
}
declare class AlertStore {
    private alerts;
    private maxAlerts;
    addAlert(alert: Omit<Alert, 'id' | 'timestamp' | 'resolved'>): Alert;
    getAllAlerts(): Alert[];
    getActiveAlerts(): Alert[];
    getAlertsByType(type: AlertType): Alert[];
    getAlertsByLevel(level: AlertLevel): Alert[];
    resolveAlert(alertId: string, resolvedBy?: string): boolean;
    private generateAlertId;
    cleanupResolvedAlerts(olderThanDays?: number): number;
}
declare class AlertNotifier {
    private config;
    constructor(config: AlertNotificationConfig);
    sendAlertNotification(alert: Alert): Promise<void>;
    private sendEmailNotification;
    private sendWebhookNotification;
    private sendSlackNotification;
    private generateEmailContent;
    private getSlackColor;
    private getEmailColor;
}
declare class AlertManager {
    private store;
    private notifier;
    constructor(notificationConfig: AlertNotificationConfig);
    createAlert(type: AlertType, level: AlertLevel, title: string, message: string, details?: any): Promise<Alert>;
    resolveAlert(alertId: string, resolvedBy?: string): boolean;
    getAllAlerts(): Alert[];
    getActiveAlerts(): Alert[];
    getAlertsByType(type: AlertType): Alert[];
    getAlertsByLevel(level: AlertLevel): Alert[];
    cleanupResolvedAlerts(olderThanDays?: number): number;
    getAlertStatistics(): {
        total: number;
        active: number;
        resolved: number;
        byType: Record<AlertType, number>;
        byLevel: Record<AlertLevel, number>;
    };
}
export declare const alertManager: AlertManager;
export { AlertManager, AlertStore, AlertNotifier };
export type { Alert, AlertNotificationConfig };
//# sourceMappingURL=alertSystem.d.ts.map