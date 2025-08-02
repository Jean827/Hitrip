import axios from 'axios';
import { logger } from './logger';

// 短信服务配置
interface SMSConfig {
  provider: 'aliyun' | 'tencent' | 'twilio';
  accessKeyId?: string;
  accessKeySecret?: string;
  signName?: string;
  templateCode?: string;
  region?: string;
  appId?: string;
  appKey?: string;
}

// 获取短信配置
const getSMSConfig = (): SMSConfig => {
  return {
    provider: (process.env.SMS_PROVIDER as 'aliyun' | 'tencent' | 'twilio') || 'aliyun',
    accessKeyId: process.env.SMS_ACCESS_KEY_ID,
    accessKeySecret: process.env.SMS_ACCESS_KEY_SECRET,
    signName: process.env.SMS_SIGN_NAME || '海南文旅',
    templateCode: process.env.SMS_TEMPLATE_CODE,
    region: process.env.SMS_REGION || 'cn-hangzhou',
    appId: process.env.SMS_APP_ID,
    appKey: process.env.SMS_APP_KEY
  };
};

// 阿里云短信发送
const sendAliyunSMS = async (phone: string, message: string): Promise<void> => {
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
    const response = await axios.post(
      'https://dysmsapi.aliyuncs.com',
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    if (response.data.Code !== 'OK') {
      throw new Error(`阿里云短信发送失败: ${response.data.Message}`);
    }

    logger.info(`阿里云短信发送成功: ${phone}`);
  } catch (error) {
    logger.error('阿里云短信发送失败:', error);
    throw error;
  }
};

// 腾讯云短信发送
const sendTencentSMS = async (phone: string, message: string): Promise<void> => {
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
    const response = await axios.post(
      'https://sms.tencentcloudapi.com',
      params,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.appKey}`
        }
      }
    );

    if (response.data.Response.Error) {
      throw new Error(`腾讯云短信发送失败: ${response.data.Response.Error.Message}`);
    }

    logger.info(`腾讯云短信发送成功: ${phone}`);
  } catch (error) {
    logger.error('腾讯云短信发送失败:', error);
    throw error;
  }
};

// Twilio短信发送
const sendTwilioSMS = async (phone: string, message: string): Promise<void> => {
  const config = getSMSConfig();
  
  if (!config.accessKeyId || !config.accessKeySecret) {
    throw new Error('Twilio短信配置不完整');
  }

  try {
    const response = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${config.accessKeyId}/Messages.json`,
      {
        To: `+86${phone}`,
        From: config.signName || '+1234567890',
        Body: message
      },
      {
        auth: {
          username: config.accessKeyId,
          password: config.accessKeySecret
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    if (response.data.error_code) {
      throw new Error(`Twilio短信发送失败: ${response.data.error_message}`);
    }

    logger.info(`Twilio短信发送成功: ${phone}`);
  } catch (error) {
    logger.error('Twilio短信发送失败:', error);
    throw error;
  }
};

// 发送短信主函数
export const sendSMS = async (phone: string, message: string): Promise<void> => {
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
  } catch (error) {
    logger.error(`短信发送失败 [${phone}]:`, error);
    throw error;
  }
};

// 发送验证码短信
export const sendVerificationCode = async (phone: string, code: string): Promise<void> => {
  const message = `您的验证码是：${code}，5分钟内有效。`;
  await sendSMS(phone, message);
};

// 发送通知短信
export const sendNotificationSMS = async (phone: string, message: string): Promise<void> => {
  await sendSMS(phone, message);
};

// 批量发送短信
export const sendBatchSMS = async (phones: string[], message: string): Promise<void> => {
  const promises = phones.map(phone => sendSMS(phone, message));
  await Promise.all(promises);
}; 