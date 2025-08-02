import { Model, Optional } from 'sequelize';
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
export interface KnowledgeBaseCreationAttributes extends Optional<KnowledgeBaseAttributes, 'id' | 'priority' | 'createdAt' | 'updatedAt'> {
}
export declare class KnowledgeBase extends Model<KnowledgeBaseAttributes, KnowledgeBaseCreationAttributes> implements KnowledgeBaseAttributes {
    id: number;
    category: string;
    title: string;
    content: string;
    keywords: string[];
    tags: string[];
    priority: number;
    isActive: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
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
export interface CustomerTicketCreationAttributes extends Optional<CustomerTicketAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
export declare class CustomerTicket extends Model<CustomerTicketAttributes, CustomerTicketCreationAttributes> implements CustomerTicketAttributes {
    id: number;
    userId: number;
    title: string;
    description: string;
    category: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    assignedTo?: number;
    resolvedAt?: Date;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export interface ChatMessageAttributes {
    id: number;
    sessionId: string;
    userId?: number;
    messageType: 'user' | 'bot' | 'agent';
    content: string;
    metadata?: any;
    createdAt: Date;
}
export interface ChatMessageCreationAttributes extends Optional<ChatMessageAttributes, 'id' | 'createdAt'> {
}
export declare class ChatMessage extends Model<ChatMessageAttributes, ChatMessageCreationAttributes> implements ChatMessageAttributes {
    id: number;
    sessionId: string;
    userId?: number;
    messageType: 'user' | 'bot' | 'agent';
    content: string;
    metadata?: any;
    readonly createdAt: Date;
}
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
export interface ChatSessionCreationAttributes extends Optional<ChatSessionAttributes, 'createdAt' | 'updatedAt'> {
}
export declare class ChatSession extends Model<ChatSessionAttributes, ChatSessionCreationAttributes> implements ChatSessionAttributes {
    id: string;
    userId?: number;
    status: 'active' | 'closed';
    agentId?: number;
    startedAt: Date;
    endedAt?: Date;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
declare const _default: {
    KnowledgeBase: typeof KnowledgeBase;
    CustomerTicket: typeof CustomerTicket;
    ChatMessage: typeof ChatMessage;
    ChatSession: typeof ChatSession;
};
export default _default;
//# sourceMappingURL=CustomerService.d.ts.map