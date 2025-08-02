"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertNotifier = exports.AlertStore = exports.AlertManager = exports.alertManager = exports.AlertType = exports.AlertLevel = void 0;
const logger_1 = require("./logger");
const nodemailer_1 = __importDefault(require("nodemailer"));
var AlertLevel;
(function (AlertLevel) {
    AlertLevel["INFO"] = "info";
    AlertLevel["WARNING"] = "warning";
    AlertLevel["ERROR"] = "error";
    AlertLevel["CRITICAL"] = "critical";
})(AlertLevel || (exports.AlertLevel = AlertLevel = {}));
var AlertType;
(function (AlertType) {
    AlertType["PERFORMANCE"] = "performance";
    AlertType["ERROR"] = "error";
    AlertType["SECURITY"] = "security";
    AlertType["BUSINESS"] = "business";
    AlertType["SYSTEM"] = "system";
})(AlertType || (exports.AlertType = AlertType = {}));
class AlertStore {
    constructor() {
        this.alerts = [];
        this.maxAlerts = 1000;
    }
    addAlert(alert) {
        const newAlert = {
            ...alert,
            id: this.generateAlertId(),
            timestamp: new Date(),
            resolved: false
        };
        this.alerts.unshift(newAlert);
        if (this.alerts.length > this.maxAlerts) {
            this.alerts = this.alerts.slice(0, this.maxAlerts);
        }
        return newAlert;
    }
    getAllAlerts() {
        return [...this.alerts];
    }
    getActiveAlerts() {
        return this.alerts.filter(alert => !alert.resolved);
    }
    getAlertsByType(type) {
        return this.alerts.filter(alert => alert.type === type);
    }
    getAlertsByLevel(level) {
        return this.alerts.filter(alert => alert.level === level);
    }
    resolveAlert(alertId, resolvedBy) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert && !alert.resolved) {
            alert.resolved = true;
            alert.resolvedAt = new Date();
            alert.resolvedBy = resolvedBy;
            return true;
        }
        return false;
    }
    generateAlertId() {
        return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    cleanupResolvedAlerts(olderThanDays = 7) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
        const initialCount = this.alerts.length;
        this.alerts = this.alerts.filter(alert => !alert.resolved || (alert.resolvedAt && alert.resolvedAt > cutoffDate));
        return initialCount - this.alerts.length;
    }
}
exports.AlertStore = AlertStore;
class AlertNotifier {
    constructor(config) {
        this.config = config;
    }
    async sendAlertNotification(alert) {
        try {
            if (this.config.email.enabled) {
                await this.sendEmailNotification(alert);
            }
            if (this.config.webhook.enabled) {
                await this.sendWebhookNotification(alert);
            }
            if (this.config.slack.enabled) {
                await this.sendSlackNotification(alert);
            }
            logger_1.logger.info('Alert notification sent', {
                alertId: alert.id,
                type: alert.type,
                level: alert.level,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to send alert notification', {
                alertId: alert.id,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }
    async sendEmailNotification(alert) {
        if (!this.config.email.enabled || this.config.email.recipients.length === 0) {
            return;
        }
        const transporter = nodemailer_1.default.createTransporter(this.config.email.smtp);
        const mailOptions = {
            from: this.config.email.smtp.auth.user,
            to: this.config.email.recipients.join(', '),
            subject: `[${alert.level.toUpperCase()}] ${alert.title}`,
            html: this.generateEmailContent(alert)
        };
        await transporter.sendMail(mailOptions);
    }
    async sendWebhookNotification(alert) {
        if (!this.config.webhook.enabled) {
            return;
        }
        const response = await fetch(this.config.webhook.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...this.config.webhook.headers
            },
            body: JSON.stringify({
                alert: {
                    id: alert.id,
                    type: alert.type,
                    level: alert.level,
                    title: alert.title,
                    message: alert.message,
                    details: alert.details,
                    timestamp: alert.timestamp.toISOString()
                }
            })
        });
        if (!response.ok) {
            throw new Error(`Webhook notification failed: ${response.statusText}`);
        }
    }
    async sendSlackNotification(alert) {
        if (!this.config.slack.enabled) {
            return;
        }
        const slackMessage = {
            channel: this.config.slack.channel,
            text: `*[${alert.level.toUpperCase()}] ${alert.title}*`,
            attachments: [
                {
                    color: this.getSlackColor(alert.level),
                    fields: [
                        {
                            title: 'Type',
                            value: alert.type,
                            short: true
                        },
                        {
                            title: 'Level',
                            value: alert.level,
                            short: true
                        },
                        {
                            title: 'Message',
                            value: alert.message,
                            short: false
                        },
                        {
                            title: 'Timestamp',
                            value: alert.timestamp.toISOString(),
                            short: true
                        }
                    ]
                }
            ]
        };
        const response = await fetch(this.config.slack.webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(slackMessage)
        });
        if (!response.ok) {
            throw new Error(`Slack notification failed: ${response.statusText}`);
        }
    }
    generateEmailContent(alert) {
        return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${this.getEmailColor(alert.level)};">[${alert.level.toUpperCase()}] ${alert.title}</h2>
        <p><strong>Type:</strong> ${alert.type}</p>
        <p><strong>Level:</strong> ${alert.level}</p>
        <p><strong>Message:</strong> ${alert.message}</p>
        <p><strong>Timestamp:</strong> ${alert.timestamp.toISOString()}</p>
        ${alert.details ? `<p><strong>Details:</strong> <pre>${JSON.stringify(alert.details, null, 2)}</pre></p>` : ''}
      </div>
    `;
    }
    getSlackColor(level) {
        switch (level) {
            case AlertLevel.INFO: return '#36a64f';
            case AlertLevel.WARNING: return '#ff8c00';
            case AlertLevel.ERROR: return '#ff0000';
            case AlertLevel.CRITICAL: return '#8b0000';
            default: return '#cccccc';
        }
    }
    getEmailColor(level) {
        switch (level) {
            case AlertLevel.INFO: return '#28a745';
            case AlertLevel.WARNING: return '#ffc107';
            case AlertLevel.ERROR: return '#dc3545';
            case AlertLevel.CRITICAL: return '#721c24';
            default: return '#6c757d';
        }
    }
}
exports.AlertNotifier = AlertNotifier;
class AlertManager {
    constructor(notificationConfig) {
        this.store = new AlertStore();
        this.notifier = new AlertNotifier(notificationConfig);
    }
    async createAlert(type, level, title, message, details) {
        const alert = this.store.addAlert({
            type,
            level,
            title,
            message,
            details
        });
        await this.notifier.sendAlertNotification(alert);
        logger_1.logger.info('Alert created', {
            alertId: alert.id,
            type: alert.type,
            level: alert.level,
            title: alert.title,
            timestamp: new Date().toISOString()
        });
        return alert;
    }
    resolveAlert(alertId, resolvedBy) {
        const success = this.store.resolveAlert(alertId, resolvedBy);
        if (success) {
            logger_1.logger.info('Alert resolved', {
                alertId,
                resolvedBy,
                timestamp: new Date().toISOString()
            });
        }
        return success;
    }
    getAllAlerts() {
        return this.store.getAllAlerts();
    }
    getActiveAlerts() {
        return this.store.getActiveAlerts();
    }
    getAlertsByType(type) {
        return this.store.getAlertsByType(type);
    }
    getAlertsByLevel(level) {
        return this.store.getAlertsByLevel(level);
    }
    cleanupResolvedAlerts(olderThanDays = 7) {
        return this.store.cleanupResolvedAlerts(olderThanDays);
    }
    getAlertStatistics() {
        const allAlerts = this.store.getAllAlerts();
        const activeAlerts = this.store.getActiveAlerts();
        return {
            total: allAlerts.length,
            active: activeAlerts.length,
            resolved: allAlerts.length - activeAlerts.length,
            byType: Object.values(AlertType).reduce((acc, type) => {
                acc[type] = this.store.getAlertsByType(type).length;
                return acc;
            }, {}),
            byLevel: Object.values(AlertLevel).reduce((acc, level) => {
                acc[level] = this.store.getAlertsByLevel(level).length;
                return acc;
            }, {})
        };
    }
}
exports.AlertManager = AlertManager;
const defaultNotificationConfig = {
    email: {
        enabled: false,
        recipients: [],
        smtp: {
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER || '',
                pass: process.env.SMTP_PASS || ''
            }
        }
    },
    webhook: {
        enabled: false,
        url: process.env.WEBHOOK_URL || '',
        headers: {}
    },
    slack: {
        enabled: false,
        webhookUrl: process.env.SLACK_WEBHOOK_URL || '',
        channel: process.env.SLACK_CHANNEL || '#alerts'
    }
};
exports.alertManager = new AlertManager(defaultNotificationConfig);
//# sourceMappingURL=alertSystem.js.map