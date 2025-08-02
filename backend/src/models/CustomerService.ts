import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

// 客服知识库模型
export interface KnowledgeBaseAttributes {
  id: number;
  category: string;
  title: string;
  content: string;
  keywords: string[];
  tags: string[];
  priority: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeBaseCreationAttributes extends Optional<KnowledgeBaseAttributes, 'id' | 'priority' | 'createdAt' | 'updatedAt'> {}

export class KnowledgeBase extends Model<KnowledgeBaseAttributes, KnowledgeBaseCreationAttributes> implements KnowledgeBaseAttributes {
  public id!: number;
  public category!: string;
  public title!: string;
  public content!: string;
  public keywords!: string[];
  public tags!: string[];
  public priority!: number;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

KnowledgeBase.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '知识分类',
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '知识标题',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '知识内容',
    },
    keywords: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '关键词列表',
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '标签列表',
    },
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '优先级，数字越大优先级越高',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '是否激活',
    },
  },
  {
    sequelize,
    tableName: 'knowledge_base',
    timestamps: true,
  }
);

// 客服工单模型
export interface CustomerTicketAttributes {
  id: number;
  userId: number;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: number;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerTicketCreationAttributes extends Optional<CustomerTicketAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class CustomerTicket extends Model<CustomerTicketAttributes, CustomerTicketCreationAttributes> implements CustomerTicketAttributes {
  public id!: number;
  public userId!: number;
  public title!: string;
  public description!: string;
  public category!: string;
  public priority!: 'low' | 'medium' | 'high' | 'urgent';
  public status!: 'open' | 'in_progress' | 'resolved' | 'closed';
  public assignedTo?: number;
  public resolvedAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CustomerTicket.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '用户ID',
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '工单标题',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '工单描述',
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '工单分类',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium',
      comment: '优先级',
    },
    status: {
      type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'),
      defaultValue: 'open',
      comment: '工单状态',
    },
    assignedTo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '分配给谁',
    },
    resolvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '解决时间',
    },
  },
  {
    sequelize,
    tableName: 'customer_tickets',
    timestamps: true,
  }
);

// 客服对话记录模型
export interface ChatMessageAttributes {
  id: number;
  sessionId: string;
  userId?: number;
  messageType: 'user' | 'bot' | 'agent';
  content: string;
  metadata?: any;
  createdAt: Date;
}

export interface ChatMessageCreationAttributes extends Optional<ChatMessageAttributes, 'id' | 'createdAt'> {}

export class ChatMessage extends Model<ChatMessageAttributes, ChatMessageCreationAttributes> implements ChatMessageAttributes {
  public id!: number;
  public sessionId!: string;
  public userId?: number;
  public messageType!: 'user' | 'bot' | 'agent';
  public content!: string;
  public metadata?: any;
  public readonly createdAt!: Date;
}

ChatMessage.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '会话ID',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '用户ID',
    },
    messageType: {
      type: DataTypes.ENUM('user', 'bot', 'agent'),
      allowNull: false,
      comment: '消息类型',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '消息内容',
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '元数据',
    },
  },
  {
    sequelize,
    tableName: 'chat_messages',
    timestamps: false,
  }
);

// 客服会话模型
export interface ChatSessionAttributes {
  id: string;
  userId?: number;
  status: 'active' | 'closed';
  agentId?: number;
  startedAt: Date;
  endedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatSessionCreationAttributes extends Optional<ChatSessionAttributes, 'createdAt' | 'updatedAt'> {}

export class ChatSession extends Model<ChatSessionAttributes, ChatSessionCreationAttributes> implements ChatSessionAttributes {
  public id!: string;
  public userId?: number;
  public status!: 'active' | 'closed';
  public agentId?: number;
  public startedAt!: Date;
  public endedAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ChatSession.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      comment: '会话ID',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '用户ID',
    },
    status: {
      type: DataTypes.ENUM('active', 'closed'),
      defaultValue: 'active',
      comment: '会话状态',
    },
    agentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '客服ID',
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '开始时间',
    },
    endedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '结束时间',
    },
  },
  {
    sequelize,
    tableName: 'chat_sessions',
    timestamps: true,
  }
);

export default {
  KnowledgeBase,
  CustomerTicket,
  ChatMessage,
  ChatSession,
}; 