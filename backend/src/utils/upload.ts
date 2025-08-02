import { logger } from './logger';

// 云存储配置
interface CloudStorageConfig {
  provider: 'aliyun' | 'tencent' | 'aws' | 'local';
  accessKeyId?: string;
  accessKeySecret?: string;
  bucket?: string;
  region?: string;
  endpoint?: string;
  uploadPath?: string;
}

// 获取云存储配置
const getCloudStorageConfig = (): CloudStorageConfig => {
  return {
    provider: (process.env.CLOUD_STORAGE_PROVIDER as 'aliyun' | 'tencent' | 'aws' | 'local') || 'local',
    accessKeyId: process.env.CLOUD_STORAGE_ACCESS_KEY_ID,
    accessKeySecret: process.env.CLOUD_STORAGE_ACCESS_KEY_SECRET,
    bucket: process.env.CLOUD_STORAGE_BUCKET || 'hainan-tourism',
    region: process.env.CLOUD_STORAGE_REGION || 'cn-hangzhou',
    endpoint: process.env.CLOUD_STORAGE_ENDPOINT,
    uploadPath: process.env.CLOUD_STORAGE_UPLOAD_PATH || 'uploads'
  };
};

// 上传结果接口
interface UploadResult {
  url: string;
  key: string;
  size: number;
  mimeType: string;
}

// 阿里云OSS上传
const uploadToAliyunOSS = async (buffer: Buffer, fileName: string): Promise<UploadResult> => {
  const config = getCloudStorageConfig();
  
  if (!config.accessKeyId || !config.accessKeySecret || !config.bucket) {
    throw new Error('阿里云OSS配置不完整');
  }

  try {
    // 这里应该使用阿里云OSS SDK
    // 为了简化，这里只是示例代码
    const OSS = require('ali-oss');
    
    const client = new OSS({
      accessKeyId: config.accessKeyId,
      accessKeySecret: config.accessKeySecret,
      bucket: config.bucket,
      region: config.region,
      endpoint: config.endpoint
    });

    const key = `${config.uploadPath}/${fileName}`;
    const result = await client.put(key, buffer);

    logger.info(`阿里云OSS上传成功: ${key}`);

    return {
      url: result.url,
      key: key,
      size: buffer.length,
      mimeType: 'image/jpeg'
    };
  } catch (error) {
    logger.error('阿里云OSS上传失败:', error);
    throw error;
  }
};

// 腾讯云COS上传
const uploadToTencentCOS = async (buffer: Buffer, fileName: string): Promise<UploadResult> => {
  const config = getCloudStorageConfig();
  
  if (!config.accessKeyId || !config.accessKeySecret || !config.bucket) {
    throw new Error('腾讯云COS配置不完整');
  }

  try {
    // 这里应该使用腾讯云COS SDK
    // 为了简化，这里只是示例代码
    const COS = require('cos-nodejs-sdk-v5');
    
    const cos = new COS({
      SecretId: config.accessKeyId,
      SecretKey: config.accessKeySecret,
      Region: config.region
    });

    const key = `${config.uploadPath}/${fileName}`;
    
    const result = await new Promise((resolve, reject) => {
      cos.putObject({
        Bucket: config.bucket,
        Region: config.region,
        Key: key,
        Body: buffer
      }, (err: any, data: any) => {
        if (err) reject(err);
        else resolve(data);
      });
    });

    logger.info(`腾讯云COS上传成功: ${key}`);

    return {
      url: `https://${config.bucket}.cos.${config.region}.myqcloud.com/${key}`,
      key: key,
      size: buffer.length,
      mimeType: 'image/jpeg'
    };
  } catch (error) {
    logger.error('腾讯云COS上传失败:', error);
    throw error;
  }
};

// AWS S3上传
const uploadToAWSS3 = async (buffer: Buffer, fileName: string): Promise<UploadResult> => {
  const config = getCloudStorageConfig();
  
  if (!config.accessKeyId || !config.accessKeySecret || !config.bucket) {
    throw new Error('AWS S3配置不完整');
  }

  try {
    // 这里应该使用AWS SDK
    // 为了简化，这里只是示例代码
    const AWS = require('aws-sdk');
    
    const s3 = new AWS.S3({
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.accessKeySecret,
      region: config.region
    });

    const key = `${config.uploadPath}/${fileName}`;
    
    const result = await s3.upload({
      Bucket: config.bucket,
      Key: key,
      Body: buffer,
      ContentType: 'image/jpeg'
    }).promise();

    logger.info(`AWS S3上传成功: ${key}`);

    return {
      url: result.Location,
      key: key,
      size: buffer.length,
      mimeType: 'image/jpeg'
    };
  } catch (error) {
    logger.error('AWS S3上传失败:', error);
    throw error;
  }
};

// 本地存储上传
const uploadToLocal = async (buffer: Buffer, fileName: string): Promise<UploadResult> => {
  const config = getCloudStorageConfig();
  const fs = require('fs').promises;
  const path = require('path');

  try {
    const uploadDir = path.join(process.cwd(), 'public', config.uploadPath || 'uploads');
    const filePath = path.join(uploadDir, fileName);
    
    // 确保目录存在
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    
    // 写入文件
    await fs.writeFile(filePath, buffer);

    logger.info(`本地文件上传成功: ${filePath}`);

    return {
      url: `${process.env.BASE_URL || 'http://localhost:5000'}/${config.uploadPath}/${fileName}`,
      key: `${config.uploadPath}/${fileName}`,
      size: buffer.length,
      mimeType: 'image/jpeg'
    };
  } catch (error) {
    logger.error('本地文件上传失败:', error);
    throw error;
  }
};

// 上传到云存储主函数
export const uploadToCloud = async (buffer: Buffer, fileName: string): Promise<UploadResult> => {
  const config = getCloudStorageConfig();
  
  try {
    switch (config.provider) {
      case 'aliyun':
        return await uploadToAliyunOSS(buffer, fileName);
      case 'tencent':
        return await uploadToTencentCOS(buffer, fileName);
      case 'aws':
        return await uploadToAWSS3(buffer, fileName);
      case 'local':
        return await uploadToLocal(buffer, fileName);
      default:
        throw new Error(`不支持的云存储提供商: ${config.provider}`);
    }
  } catch (error) {
    logger.error(`文件上传失败 [${fileName}]:`, error);
    throw error;
  }
};

// 删除云存储文件
export const deleteFromCloud = async (key: string): Promise<void> => {
  const config = getCloudStorageConfig();
  
  try {
    switch (config.provider) {
      case 'aliyun':
        // 删除阿里云OSS文件
        const OSS = require('ali-oss');
        const client = new OSS({
          accessKeyId: config.accessKeyId,
          accessKeySecret: config.accessKeySecret,
          bucket: config.bucket,
          region: config.region
        });
        await client.delete(key);
        break;
        
      case 'tencent':
        // 删除腾讯云COS文件
        const COS = require('cos-nodejs-sdk-v5');
        const cos = new COS({
          SecretId: config.accessKeyId,
          SecretKey: config.accessKeySecret,
          Region: config.region
        });
        await new Promise((resolve, reject) => {
          cos.deleteObject({
            Bucket: config.bucket,
            Region: config.region,
            Key: key
          }, (err: any, data: any) => {
            if (err) reject(err);
            else resolve(data);
          });
        });
        break;
        
      case 'aws':
        // 删除AWS S3文件
        const AWS = require('aws-sdk');
        const s3 = new AWS.S3({
          accessKeyId: config.accessKeyId,
          secretAccessKey: config.accessKeySecret,
          region: config.region
        });
        await s3.deleteObject({
          Bucket: config.bucket,
          Key: key
        }).promise();
        break;
        
      case 'local':
        // 删除本地文件
        const fs = require('fs').promises;
        const path = require('path');
        const filePath = path.join(process.cwd(), 'public', key);
        await fs.unlink(filePath);
        break;
        
      default:
        throw new Error(`不支持的云存储提供商: ${config.provider}`);
    }
    
    logger.info(`文件删除成功: ${key}`);
  } catch (error) {
    logger.error(`文件删除失败 [${key}]:`, error);
    throw error;
  }
};

// 生成唯一文件名
export const generateFileName = (originalName: string, prefix: string = ''): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  return `${prefix}${timestamp}_${random}.${extension}`;
}; 