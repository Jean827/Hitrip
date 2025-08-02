"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendBatchSMS = exports.sendNotificationSMS = exports.sendVerificationCode = exports.sendSMS = void 0;
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("./logger");
const getSMSConfig = () => {
    return {
        provider: process.env.SMS_PROVIDER || 'aliyun',
        accessKeyId: process.env.SMS_ACCESS_KEY_ID,
        accessKeySecret: process.env.SMS_ACCESS_KEY_SECRET,
        signName: process.env.SMS_SIGN_NAME || '海南文旅',
        templateCode: process.env.SMS_TEMPLATE_CODE,
        region: process.env.SMS_REGION || 'cn-hangzhou',
        appId: process.env.SMS_APP_ID,
        appKey: process.env.SMS_APP_KEY
    };
};
const sendAliyunSMS = async (phone, message) => {
    const config = getSMSConfig();
    if (!config.accessKeyId || !config.accessKeySecret || !config.signName) {
        throw new Error('阿里云短信配置不完整');
    }
    const params = {
        Action: 'SendSms',
        Version: '2017-05-25',
        RegionId: config.region,
        PhoneNumbers: phone,
        SignName: config.signName,
        TemplateCode: config.templateCode || 'SMS_123456789',
        TemplateParam: JSON.stringify({ code: message })
    };
    try {
        const response = await axios_1.default.post('https://dysmsapi.aliyuncs.com', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        if (response.data.Code !== 'OK') {
            throw new Error(`阿里云短信发送失败: ${response.data.Message}`);
        }
        logger_1.logger.info(`阿里云短信发送成功: ${phone}`);
    }
    catch (error) {
        logger_1.logger.error('阿里云短信发送失败:', error);
        throw error;
    }
};
const sendTencentSMS = async (phone, message) => {
    const config = getSMSConfig();
    if (!config.appId || !config.appKey || !config.signName) {
        throw new Error('腾讯云短信配置不完整');
    }
    const params = {
        PhoneNumberSet: [`+86${phone}`],
        SmsSdkAppId: config.appId,
        SignName: config.signName,
        TemplateId: config.templateCode || '1234567',
        TemplateParamSet: [message]
    };
    try {
        const response = await axios_1.default.post('https://sms.tencentcloudapi.com', params, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.appKey}`
            }
        });
        if (response.data.Response.Error) {
            throw new Error(`腾讯云短信发送失败: ${response.data.Response.Error.Message}`);
        }
        logger_1.logger.info(`腾讯云短信发送成功: ${phone}`);
    }
    catch (error) {
        logger_1.logger.error('腾讯云短信发送失败:', error);
        throw error;
    }
};
const sendTwilioSMS = async (phone, message) => {
    const config = getSMSConfig();
    if (!config.accessKeyId || !config.accessKeySecret) {
        throw new Error('Twilio短信配置不完整');
    }
    try {
        const response = await axios_1.default.post(`https://api.twilio.com/2010-04-01/Accounts/${config.accessKeyId}/Messages.json`, {
            To: `+86${phone}`,
            From: config.signName || '+1234567890',
            Body: message
        }, {
            auth: {
                username: config.accessKeyId,
                password: config.accessKeySecret
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        if (response.data.error_code) {
            throw new Error(`Twilio短信发送失败: ${response.data.error_message}`);
        }
        logger_1.logger.info(`Twilio短信发送成功: ${phone}`);
    }
    catch (error) {
        logger_1.logger.error('Twilio短信发送失败:', error);
        throw error;
    }
};
const sendSMS = async (phone, message) => {
    const config = getSMSConfig();
    try {
        switch (config.provider) {
            case 'aliyun':
                await sendAliyunSMS(phone, message);
                break;
            case 'tencent':
                await sendTencentSMS(phone, message);
                break;
            case 'twilio':
                await sendTwilioSMS(phone, message);
                break;
            default:
                throw new Error(`不支持的短信服务提供商: ${config.provider}`);
        }
    }
    catch (error) {
        logger_1.logger.error(`短信发送失败 [${phone}]:`, error);
        throw error;
    }
};
exports.sendSMS = sendSMS;
const sendVerificationCode = async (phone, code) => {
    const message = `您的验证码是：${code}，5分钟内有效。`;
    await (0, exports.sendSMS)(phone, message);
};
exports.sendVerificationCode = sendVerificationCode;
const sendNotificationSMS = async (phone, message) => {
    await (0, exports.sendSMS)(phone, message);
};
exports.sendNotificationSMS = sendNotificationSMS;
const sendBatchSMS = async (phones, message) => {
    const promises = phones.map(phone => (0, exports.sendSMS)(phone, message));
    await Promise.all(promises);
};
exports.sendBatchSMS = sendBatchSMS;
//# sourceMappingURL=sms.js.map