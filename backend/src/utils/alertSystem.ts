import { logger } from './logger';
import nodemailer from 'nodemailer';

// 告警级别
export enum AlertLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// 告警类型
export enum AlertType {
  PERFORMANCE = 'performance',
  ERROR = 'error',
  SECURITY = 'security',
  BUSINESS = 'business',
  SYSTEM = 'system'
}

// 告警接口
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

// 告警通知配置
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

// 告警存储
class AlertStore {
  private alerts: Alert[] = [];
  private maxAlerts = 1000; // 最大告警数量

  // 添加告警
  addAlert(alert: Omit<Alert, 'id' | 'timestamp' | 'resolved'>): Alert {
    const newAlert: Alert = {
      ...alert,
      id: this.generateAlertId(),
      timestamp: new Date(),
      resolved: false
    };

    this.alerts.unshift(newAlert);

    // 保持最大告警数量
    if (this.alerts.length > this.maxAlerts) {
      this.alerts = this.alerts.slice(0, this.maxAlerts);
    }

    return newAlert;
  }

  // 获取所有告警
  getAllAlerts(): Alert[] {
    return [...this.alerts];
  }

  // 获取未解决的告警
  getActiveAlerts(): Alert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  // 获取特定类型的告警
  getAlertsByType(type: AlertType): Alert[] {
    return this.alerts.filter(alert => alert.type === type);
  }

  // 获取特定级别的告警
  getAlertsByLevel(level: AlertLevel): Alert[] {
    return this.alerts.filter(alert => alert.level === level);
  }

  // 解决告警
  resolveAlert(alertId: string, resolvedBy?: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
      alert.resolvedBy = resolvedBy;
      return true;
    }
    return false;
  }

  // 生成告警ID
  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 清理已解决的告警
  cleanupResolvedAlerts(olderThanDays: number = 7): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const initialCount = this.alerts.length;
    this.alerts = this.alerts.filter(alert => 
      !alert.resolved || (alert.resolvedAt && alert.resolvedAt > cutoffDate)
    );

    return initialCount - this.alerts.length;
  }
}

// 告警通知系统
class AlertNotifier {
  private config: AlertNotificationConfig;

  constructor(config: AlertNotificationConfig) {
    this.config = config;
  }

  // 发送告警通知
  async sendAlertNotification(alert: Alert): Promise<void> {
    try {
      // 发送邮件通知
      if (this.config.email.enabled) {
        await this.sendEmailNotification(alert);
      }

      // 发送Webhook通知
      if (this.config.webhook.enabled) {
        await this.sendWebhookNotification(alert);
      }

      // 发送Slack通知
      if (this.config.slack.enabled) {
        await this.sendSlackNotification(alert);
      }

      logger.info('Alert notification sent', {
        alertId: alert.id,
        type: alert.type,
        level: alert.level,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Failed to send alert notification', {
        alertId: alert.id,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // 发送邮件通知
  private async sendEmailNotification(alert: Alert): Promise<void> {
    if (!this.config.email.enabled || this.config.email.recipients.length === 0) {
      return;
    }

    const transporter = nodemailer.createTransporter(this.config.email.smtp);

    const mailOptions = {
      from: this.config.email.smtp.auth.user,
      to: this.config.email.recipients.join(', '),
      subject: `[${alert.level.toUpperCase()}] ${alert.title}`,
      html: this.generateEmailContent(alert)
    };

    await transporter.sendMail(mailOptions);
  }

  // 发送Webhook通知
  private async sendWebhookNotification(alert: Alert): Promise<void> {
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

  // 发送Slack通知
  private async sendSlackNotification(alert: Alert): Promise<void> {
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

  // 生成邮件内容
  private generateEmailContent(alert: Alert): string {
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

  // 获取Slack颜色
  private getSlackColor(level: AlertLevel): string {
    switch (level) {
      case AlertLevel.INFO: return '#36a64f';
      case AlertLevel.WARNING: return '#ff8c00';
      case AlertLevel.ERROR: return '#ff0000';
      case AlertLevel.CRITICAL: return '#8b0000';
      default: return '#cccccc';
    }
  }

  // 获取邮件颜色
  private getEmailColor(level: AlertLevel): string {
    switch (level) {
      case AlertLevel.INFO: return '#28a745';
      case AlertLevel.WARNING: return '#ffc107';
      case AlertLevel.ERROR: return '#dc3545';
      case AlertLevel.CRITICAL: return '#721c24';
      default: return '#6c757d';
    }
  }
}

// 告警管理器
class AlertManager {
  private store: AlertStore;
  private notifier: AlertNotifier;

  constructor(notificationConfig: AlertNotificationConfig) {
    this.store = new AlertStore();
    this.notifier = new AlertNotifier(notificationConfig);
  }

  // 创建告警
  async createAlert(
    type: AlertType,
    level: AlertLevel,
    title: string,
    message: string,
    details?: any
  ): Promise<Alert> {
    const alert = this.store.addAlert({
      type,
      level,
      title,
      message,
      details
    });

    // 发送通知
    await this.notifier.sendAlertNotification(alert);

    logger.info('Alert created', {
      alertId: alert.id,
      type: alert.type,
      level: alert.level,
      title: alert.title,
      timestamp: new Date().toISOString()
    });

    return alert;
  }

  // 解决告警
  resolveAlert(alertId: string, resolvedBy?: string): boolean {
    const success = this.store.resolveAlert(alertId, resolvedBy);
    
    if (success) {
      logger.info('Alert resolved', {
        alertId,
        resolvedBy,
        timestamp: new Date().toISOString()
      });
    }

    return success;
  }

  // 获取所有告警
  getAllAlerts(): Alert[] {
    return this.store.getAllAlerts();
  }

  // 获取活跃告警
  getActiveAlerts(): Alert[] {
    return this.store.getActiveAlerts();
  }

  // 获取特定类型的告警
  getAlertsByType(type: AlertType): Alert[] {
    return this.store.getAlertsByType(type);
  }

  // 获取特定级别的告警
  getAlertsByLevel(level: AlertLevel): Alert[] {
    return this.store.getAlertsByLevel(level);
  }

  // 清理已解决的告警
  cleanupResolvedAlerts(olderThanDays: number = 7): number {
    return this.store.cleanupResolvedAlerts(olderThanDays);
  }

  // 获取告警统计
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
      }, {} as Record<AlertType, number>),
      byLevel: Object.values(AlertLevel).reduce((acc, level) => {
        acc[level] = this.store.getAlertsByLevel(level).length;
        return acc;
      }, {} as Record<AlertLevel, number>)
    };
  }
}

// 默认告警通知配置
const defaultNotificationConfig: AlertNotificationConfig = {
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

// 创建全局告警管理器实例
export const alertManager = new AlertManager(defaultNotificationConfig);

// 导出类型和枚举
export { AlertManager, AlertStore, AlertNotifier };
export type { Alert, AlertNotificationConfig }; 