"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWelcomeEmail = exports.sendPasswordResetEmail = exports.sendVerificationEmail = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = require("./logger");
const emailTemplates = {
    'email-verification': {
        subject: '欢迎注册海南文旅 - 请验证您的邮箱',
        html: (data) => `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">海南文旅</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">欢迎加入我们的旅游社区</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-bottom: 20px;">您好，${data.username}！</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            感谢您注册海南文旅平台。为了确保您的账户安全，请点击下面的按钮验证您的邮箱地址：
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.verificationUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      display: inline-block; 
                      font-weight: bold;
                      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
              验证邮箱地址
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
            如果按钮无法点击，请复制以下链接到浏览器地址栏：
          </p>
          
          <p style="background: #e9ecef; padding: 15px; border-radius: 5px; word-break: break-all; color: #495057;">
            ${data.verificationUrl}
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-top: 25px;">
            此链接将在24小时后失效。如果您没有注册海南文旅账户，请忽略此邮件。
          </p>
          
          <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
          
          <p style="color: #999; font-size: 14px; text-align: center; margin: 0;">
            此邮件由系统自动发送，请勿回复。<br>
            如有疑问，请联系我们的客服团队。
          </p>
        </div>
      </div>
    `
    },
    'password-reset': {
        subject: '海南文旅 - 重置密码',
        html: (data) => `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">海南文旅</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">密码重置</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-bottom: 20px;">您好，${data.username}！</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            我们收到了您的密码重置请求。请点击下面的按钮重置您的密码：
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.resetUrl}" 
               style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      display: inline-block; 
                      font-weight: bold;
                      box-shadow: 0 4px 15px rgba(220, 53, 69, 0.4);">
              重置密码
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
            如果按钮无法点击，请复制以下链接到浏览器地址栏：
          </p>
          
          <p style="background: #e9ecef; padding: 15px; border-radius: 5px; word-break: break-all; color: #495057;">
            ${data.resetUrl}
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-top: 25px;">
            此链接将在10分钟后失效。如果您没有请求重置密码，请忽略此邮件。
          </p>
          
          <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
          
          <p style="color: #999; font-size: 14px; text-align: center; margin: 0;">
            此邮件由系统自动发送，请勿回复。<br>
            如有疑问，请联系我们的客服团队。
          </p>
        </div>
      </div>
    `
    },
    'welcome': {
        subject: '欢迎来到海南文旅',
        html: (data) => `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">海南文旅</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">欢迎加入我们的旅游社区</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-bottom: 20px;">欢迎您，${data.username}！</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            恭喜您成功注册海南文旅平台！我们很高兴您能加入我们的旅游社区。
          </p>
          
          <div style="background: #e8f5e8; border-left: 4px solid #28a745; padding: 20px; margin: 25px 0; border-radius: 0 5px 5px 0;">
            <h3 style="color: #155724; margin: 0 0 10px 0;">您的账户信息</h3>
            <p style="color: #155724; margin: 0;">
              用户名：${data.username}<br>
              邮箱：${data.email}<br>
              注册时间：${new Date().toLocaleString('zh-CN')}
            </p>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            现在您可以开始探索海南的美丽景点，分享您的旅游体验，并与其他旅行者交流。
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}" 
               style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      display: inline-block; 
                      font-weight: bold;
                      box-shadow: 0 4px 15px rgba(40, 167, 69, 0.4);">
              开始探索
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
          
          <p style="color: #999; font-size: 14px; text-align: center; margin: 0;">
            此邮件由系统自动发送，请勿回复。<br>
            如有疑问，请联系我们的客服团队。
          </p>
        </div>
      </div>
    `
    }
};
const createTransporter = () => {
    return nodemailer_1.default.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};
const sendEmail = async (options) => {
    try {
        const transporter = createTransporter();
        let html = options.html;
        let subject = options.subject;
        if (options.template && emailTemplates[options.template]) {
            const template = emailTemplates[options.template];
            html = template.html(options.data || {});
            subject = template.subject;
        }
        const mailOptions = {
            from: `"海南文旅" <${process.env.SMTP_USER}>`,
            to: options.to,
            subject: subject,
            html: html,
            text: options.text || ''
        };
        const info = await transporter.sendMail(mailOptions);
        logger_1.logger.info(`邮件发送成功: ${options.to} -> ${subject}`, {
            messageId: info.messageId,
            to: options.to,
            subject: subject
        });
    }
    catch (error) {
        logger_1.logger.error('邮件发送失败:', error);
        throw error;
    }
};
exports.sendEmail = sendEmail;
const sendVerificationEmail = async (email, username, token) => {
    await (0, exports.sendEmail)({
        to: email,
        template: 'email-verification',
        data: {
            username,
            verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${token}`
        }
    });
};
exports.sendVerificationEmail = sendVerificationEmail;
const sendPasswordResetEmail = async (email, username, token) => {
    await (0, exports.sendEmail)({
        to: email,
        template: 'password-reset',
        data: {
            username,
            resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${token}`
        }
    });
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const sendWelcomeEmail = async (email, username) => {
    await (0, exports.sendEmail)({
        to: email,
        template: 'welcome',
        data: {
            username,
            email
        }
    });
};
exports.sendWelcomeEmail = sendWelcomeEmail;
//# sourceMappingURL=email.js.map