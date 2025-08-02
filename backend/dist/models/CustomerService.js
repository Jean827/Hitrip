"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatSession = exports.ChatMessage = exports.CustomerTicket = exports.KnowledgeBase = void 0;
const sequelize_1 = require("sequelize");
const sequelize_2 = __importDefault(require("../config/sequelize"));
class KnowledgeBase extends sequelize_1.Model {
}
exports.KnowledgeBase = KnowledgeBase;
KnowledgeBase.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    category: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        comment: '知识分类',
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        comment: '知识标题',
    },
    content: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        comment: '知识内容',
    },
    keywords: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
        comment: '关键词列表',
    },
    tags: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
        comment: '标签列表',
    },
    priority: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 0,
        comment: '优先级，数字越大优先级越高',
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true,
        comment: '是否激活',
    },
}, {
    sequelize: sequelize_2.default,
    tableName: 'knowledge_base',
    timestamps: true,
});
class CustomerTicket extends sequelize_1.Model {
}
exports.CustomerTicket = CustomerTicket;
CustomerTicket.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        comment: '用户ID',
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        comment: '工单标题',
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        comment: '工单描述',
    },
    category: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        comment: '工单分类',
    },
    priority: {
        type: sequelize_1.DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
        defaultValue: 'medium',
        comment: '优先级',
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'),
        defaultValue: 'open',
        comment: '工单状态',
    },
    assignedTo: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        comment: '分配给谁',
    },
    resolvedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        comment: '解决时间',
    },
}, {
    sequelize: sequelize_2.default,
    tableName: 'customer_tickets',
    timestamps: true,
});
class ChatMessage extends sequelize_1.Model {
}
exports.ChatMessage = ChatMessage;
ChatMessage.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    sessionId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        comment: '会话ID',
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        comment: '用户ID',
    },
    messageType: {
        type: sequelize_1.DataTypes.ENUM('user', 'bot', 'agent'),
        allowNull: false,
        comment: '消息类型',
    },
    content: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        comment: '消息内容',
    },
    metadata: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
        comment: '元数据',
    },
}, {
    sequelize: sequelize_2.default,
    tableName: 'chat_messages',
    timestamps: false,
});
class ChatSession extends sequelize_1.Model {
}
exports.ChatSession = ChatSession;
ChatSession.init({
    id: {
        type: sequelize_1.DataTypes.STRING,
        primaryKey: true,
        comment: '会话ID',
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        comment: '用户ID',
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('active', 'closed'),
        defaultValue: 'active',
        comment: '会话状态',
    },
    agentId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        comment: '客服ID',
    },
    startedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        comment: '开始时间',
    },
    endedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        comment: '结束时间',
    },
}, {
    sequelize: sequelize_2.default,
    tableName: 'chat_sessions',
    timestamps: true,
});
exports.default = {
    KnowledgeBase,
    CustomerTicket,
    ChatMessage,
    ChatSession,
};
//# sourceMappingURL=CustomerService.js.map