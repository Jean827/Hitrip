import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, Alert, Button, Space, Tag } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

interface ServiceStatus {
  name: string;
  status: 'running' | 'stopped' | 'error';
  port: number;
  url: string;
  description: string;
}

interface ModuleStatus {
  name: string;
  status: 'completed' | 'in-progress' | 'pending';
  progress: number;
  description: string;
}

const StatusPage: React.FC = () => {
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: '前端服务 (React + Vite)',
      status: 'running',
      port: 3000,
      url: 'http://localhost:3000',
      description: '用户界面和交互功能'
    },
    {
      name: '后端服务 (Node.js + Express)',
      status: 'stopped',
      port: 5001,
      url: 'http://localhost:5001',
      description: 'API接口和业务逻辑'
    },
    {
      name: '数据库 (PostgreSQL)',
      status: 'running',
      port: 5432,
      url: 'localhost:5432',
      description: '数据存储和管理'
    },
    {
      name: '缓存服务 (Redis)',
      status: 'running',
      port: 6379,
      url: 'localhost:6379',
      description: '缓存和会话管理'
    }
  ]);

  const [modules] = useState<ModuleStatus[]>([
    {
      name: '用户认证系统',
      status: 'completed',
      progress: 100,
      description: '登录、注册、权限管理'
    },
    {
      name: '门户网站模块',
      status: 'completed',
      progress: 100,
      description: '景点展示、地图服务、导游功能'
    },
    {
      name: '商城系统模块',
      status: 'completed',
      progress: 100,
      description: '商品管理、购物车、订单处理'
    },
    {
      name: '智能功能模块',
      status: 'completed',
      progress: 100,
      description: 'AI客服、推荐系统、搜索功能'
    },
    {
      name: '后台管理系统',
      status: 'completed',
      progress: 100,
      description: '数据统计、用户管理、内容管理'
    },
    {
      name: '监控体系',
      status: 'completed',
      progress: 100,
      description: '性能监控、告警系统、日志管理'
    },
    {
      name: '安全防护系统',
      status: 'completed',
      progress: 100,
      description: '安全扫描、防护机制、数据加密'
    },
    {
      name: '部署环境配置',
      status: 'completed',
      progress: 100,
      description: '生产环境、自动化部署、备份策略'
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'stopped':
      case 'error':
        return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'in-progress':
        return <ClockCircleOutlined style={{ color: '#1890ff' }} />;
      default:
        return <ClockCircleOutlined style={{ color: '#faad14' }} />;
    }
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'running':
      case 'completed':
        return <Tag color="success">运行中</Tag>;
      case 'stopped':
      case 'error':
        return <Tag color="error">已停止</Tag>;
      case 'in-progress':
        return <Tag color="processing">进行中</Tag>;
      default:
        return <Tag color="warning">待处理</Tag>;
    }
  };

  const checkServiceStatus = async (service: ServiceStatus) => {
    try {
      const response = await fetch(service.url + '/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    const updateServiceStatus = async () => {
      const updatedServices = await Promise.all(
        services.map(async (service) => {
          if (service.name.includes('前端服务')) {
            return { ...service, status: 'running' as const };
          }
          if (service.name.includes('后端服务')) {
            const isRunning = await checkServiceStatus(service);
            return { ...service, status: isRunning ? 'running' : 'stopped' as const };
          }
          return service;
        })
      );
      setServices(updatedServices as ServiceStatus[]);
    };

    updateServiceStatus();
  }, []);

  const runningServices = services.filter(s => s.status === 'running').length;
  const completedModules = modules.filter(m => m.status === 'completed').length;

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '32px', color: '#1890ff' }}>
        海南文旅项目 - 系统状态监控
      </h1>

      {/* 总体统计 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="服务运行状态"
              value={runningServices}
              suffix={`/ ${services.length}`}
              valueStyle={{ color: runningServices === services.length ? '#52c41a' : '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="功能模块完成度"
              value={completedModules}
              suffix={`/ ${modules.length}`}
              valueStyle={{ color: completedModules === modules.length ? '#52c41a' : '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="项目进度"
              value={Math.round((completedModules / modules.length) * 100)}
              suffix="%"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 服务状态 */}
      <Card title="服务运行状态" style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]}>
          {services.map((service, index) => (
            <Col span={12} key={index}>
              <Card size="small">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0 }}>{service.name}</h4>
                    <p style={{ margin: '8px 0', color: '#666' }}>{service.description}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
                      端口: {service.port} | URL: {service.url}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {getStatusIcon(service.status)}
                    <br />
                    {getStatusTag(service.status)}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 功能模块状态 */}
      <Card title="功能模块完成情况">
        <Row gutter={[16, 16]}>
          {modules.map((module, index) => (
            <Col span={12} key={index}>
              <Card size="small">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0 }}>{module.name}</h4>
                    <p style={{ margin: '8px 0', color: '#666' }}>{module.description}</p>
                    <Progress percent={module.progress} size="small" />
                  </div>
                  <div style={{ textAlign: 'right', marginLeft: '16px' }}>
                    {getStatusIcon(module.status)}
                    <br />
                    {getStatusTag(module.status)}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 项目信息 */}
      <Card title="项目信息" style={{ marginTop: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <h4>技术栈</h4>
            <ul>
              <li><strong>前端:</strong> React + TypeScript + Vite + Ant Design</li>
              <li><strong>后端:</strong> Node.js + Express + TypeScript</li>
              <li><strong>数据库:</strong> PostgreSQL + Redis</li>
              <li><strong>部署:</strong> Docker + Nginx + PM2</li>
            </ul>
          </Col>
          <Col span={12}>
            <h4>主要功能</h4>
            <ul>
              <li>用户认证与权限管理</li>
              <li>景点展示与地图服务</li>
              <li>商城系统与订单管理</li>
              <li>AI客服与智能推荐</li>
              <li>数据分析与监控系统</li>
            </ul>
          </Col>
        </Row>
      </Card>

      {/* 操作按钮 */}
      <div style={{ textAlign: 'center', marginTop: '32px' }}>
        <Space size="large">
          <Button type="primary" size="large">
            访问应用
          </Button>
          <Button size="large">
            查看文档
          </Button>
          <Button size="large">
            系统监控
          </Button>
        </Space>
      </div>

      {/* 状态提示 */}
      {runningServices < services.length && (
        <Alert
          message="部分服务未运行"
          description="后端服务可能需要启动，请检查服务状态。"
          type="warning"
          showIcon
          style={{ marginTop: '24px' }}
        />
      )}
    </div>
  );
};

export default StatusPage; 