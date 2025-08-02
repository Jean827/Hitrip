import { KnowledgeBase } from '../models/CustomerService';
interface ConversationContext {
    sessionId: string;
    messages: Array<{
        role: 'user' | 'bot';
        content: string;
        timestamp: Date;
        category?: string;
        questionType?: string;
        intent?: string;
        confidence?: number;
    }>;
    currentTopic?: string;
    userIntent?: string;
    lastQuestion?: string;
    conversationFlow?: string;
    userPreferences?: {
        language?: string;
        detailLevel?: 'brief' | 'detailed';
        responseStyle?: 'formal' | 'casual';
    };
    contextMemory?: {
        mentionedProducts?: string[];
        mentionedIssues?: string[];
        userActions?: string[];
        preferences?: any;
    };
}
export declare class AIService {
    static processQuestion(question: string, userId?: number): Promise<{
        answer: string;
        confidence: number;
        source?: string;
        suggestions?: string[];
        category?: string;
        questionType?: string;
    }>;
    static processConversation(question: string, sessionId: string, userId?: number): Promise<{
        answer: string;
        confidence: number;
        source?: string;
        suggestions?: string[];
        category?: string;
        questionType?: string;
        context?: any;
        intent?: string;
        flow?: string;
    }>;
    private static preprocessQuestion;
    private static extractKeywords;
    private static searchKnowledgeBase;
    private static classifyQuestion;
    private static classifyQuestionType;
    private static generateAnswer;
    private static calculateConfidence;
    private static generateSuggestions;
    private static analyzeUserIntent;
    private static determineConversationFlow;
    private static adjustAnswerBasedOnIntent;
    private static adjustSuggestionsBasedOnFlow;
    private static updateContextMemory;
    private static cleanupOldMessages;
    private static getDetailedExplanation;
    private static getSimpleAnswer;
    private static enhanceQuestionWithContext;
    static getConversationHistory(sessionId: string): ConversationContext | null;
    static clearConversationContext(sessionId: string): void;
    static getConversationStats(): {
        activeSessions: number;
        totalMessages: number;
        averageMessagesPerSession: number;
    };
    static addKnowledgeEntry(data: {
        category: string;
        title: string;
        content: string;
        keywords?: string[];
        tags?: string[];
        priority?: number;
    }): Promise<KnowledgeBase>;
    static updateKnowledgeEntry(id: number, data: Partial<{
        category: string;
        title: string;
        content: string;
        keywords: string[];
        tags: string[];
        priority: number;
        isActive: boolean;
    }>): Promise<KnowledgeBase | null>;
    static deleteKnowledgeEntry(id: number): Promise<boolean>;
    static getKnowledgeStats(): Promise<{
        total: number;
        active: number;
        categories: {
            [key: string]: number;
        };
    }>;
}
export default AIService;
//# sourceMappingURL=aiService.d.ts.map