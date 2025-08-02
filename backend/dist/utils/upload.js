"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFileName = exports.deleteFromCloud = exports.uploadToCloud = void 0;
const logger_1 = require("./logger");
const getCloudStorageConfig = () => {
    return {
        provider: process.env.CLOUD_STORAGE_PROVIDER || 'local',
        accessKeyId: process.env.CLOUD_STORAGE_ACCESS_KEY_ID,
        accessKeySecret: process.env.CLOUD_STORAGE_ACCESS_KEY_SECRET,
        bucket: process.env.CLOUD_STORAGE_BUCKET || 'hainan-tourism',
        region: process.env.CLOUD_STORAGE_REGION || 'cn-hangzhou',
        endpoint: process.env.CLOUD_STORAGE_ENDPOINT,
        uploadPath: process.env.CLOUD_STORAGE_UPLOAD_PATH || 'uploads'
    };
};
const uploadToAliyunOSS = async (buffer, fileName) => {
    const config = getCloudStorageConfig();
    if (!config.accessKeyId || !config.accessKeySecret || !config.bucket) {
        throw new Error('阿里云OSS配置不完整');
    }
    try {
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
        logger_1.logger.info(`阿里云OSS上传成功: ${key}`);
        return {
            url: result.url,
            key: key,
            size: buffer.length,
            mimeType: 'image/jpeg'
        };
    }
    catch (error) {
        logger_1.logger.error('阿里云OSS上传失败:', error);
        throw error;
    }
};
const uploadToTencentCOS = async (buffer, fileName) => {
    const config = getCloudStorageConfig();
    if (!config.accessKeyId || !config.accessKeySecret || !config.bucket) {
        throw new Error('腾讯云COS配置不完整');
    }
    try {
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
            }, (err, data) => {
                if (err)
                    reject(err);
                else
                    resolve(data);
            });
        });
        logger_1.logger.info(`腾讯云COS上传成功: ${key}`);
        return {
            url: `https://${config.bucket}.cos.${config.region}.myqcloud.com/${key}`,
            key: key,
            size: buffer.length,
            mimeType: 'image/jpeg'
        };
    }
    catch (error) {
        logger_1.logger.error('腾讯云COS上传失败:', error);
        throw error;
    }
};
const uploadToAWSS3 = async (buffer, fileName) => {
    const config = getCloudStorageConfig();
    if (!config.accessKeyId || !config.accessKeySecret || !config.bucket) {
        throw new Error('AWS S3配置不完整');
    }
    try {
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
        logger_1.logger.info(`AWS S3上传成功: ${key}`);
        return {
            url: result.Location,
            key: key,
            size: buffer.length,
            mimeType: 'image/jpeg'
        };
    }
    catch (error) {
        logger_1.logger.error('AWS S3上传失败:', error);
        throw error;
    }
};
const uploadToLocal = async (buffer, fileName) => {
    const config = getCloudStorageConfig();
    const fs = require('fs').promises;
    const path = require('path');
    try {
        const uploadDir = path.join(process.cwd(), 'public', config.uploadPath || 'uploads');
        const filePath = path.join(uploadDir, fileName);
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, buffer);
        logger_1.logger.info(`本地文件上传成功: ${filePath}`);
        return {
            url: `${process.env.BASE_URL || 'http://localhost:5000'}/${config.uploadPath}/${fileName}`,
            key: `${config.uploadPath}/${fileName}`,
            size: buffer.length,
            mimeType: 'image/jpeg'
        };
    }
    catch (error) {
        logger_1.logger.error('本地文件上传失败:', error);
        throw error;
    }
};
const uploadToCloud = async (buffer, fileName) => {
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
    }
    catch (error) {
        logger_1.logger.error(`文件上传失败 [${fileName}]:`, error);
        throw error;
    }
};
exports.uploadToCloud = uploadToCloud;
const deleteFromCloud = async (key) => {
    const config = getCloudStorageConfig();
    try {
        switch (config.provider) {
            case 'aliyun':
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
                    }, (err, data) => {
                        if (err)
                            reject(err);
                        else
                            resolve(data);
                    });
                });
                break;
            case 'aws':
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
                const fs = require('fs').promises;
                const path = require('path');
                const filePath = path.join(process.cwd(), 'public', key);
                await fs.unlink(filePath);
                break;
            default:
                throw new Error(`不支持的云存储提供商: ${config.provider}`);
        }
        logger_1.logger.info(`文件删除成功: ${key}`);
    }
    catch (error) {
        logger_1.logger.error(`文件删除失败 [${key}]:`, error);
        throw error;
    }
};
exports.deleteFromCloud = deleteFromCloud;
const generateFileName = (originalName, prefix = '') => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop();
    return `${prefix}${timestamp}_${random}.${extension}`;
};
exports.generateFileName = generateFileName;
//# sourceMappingURL=upload.js.map