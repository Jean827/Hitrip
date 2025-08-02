interface OptimizedConversationContext {
    sessionId: string;
    messages: Array<{
        role: 'user' | 'bot';
        content: string;
        timestamp: Date;
        category?: string;
        questionType?: string;
        intent?: string;
        confidence?: number;
        processingTime?: number;
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
        lastProcessedTime?: number;
    };
    performanceMetrics?: {
        averageResponseTime: number;
        totalRequests: number;
        successRate: number;
    };
}
export declare class OptimizedAIService {
    static processQuestion(question: string, userId?: number): Promise<{
        answer: string;
        confidence: number;
        source?: string;
        suggestions?: string[];
        category?: string;
        questionType?: string;
        processingTime?: number;
    }>;
    private static preprocessQuestionOptimized;
    private static extractKeywordsOptimized;
    private static searchKnowledgeBaseOptimized;
    private static classifyQuestionOptimized;
    private static classifyQuestionTypeOptimized;
    private static generateAnswerOptimized;
    private static calculateConfidenceOptimized;
    private static generateSuggestionsOptimized;
    private static analyzeUserIntentOptimized;
    private static determineConversationFlowOptimized;
    private static adjustAnswerBasedOnIntentOptimized;
    private static adjustSuggestionsBasedOnFlowOptimized;
    private static updateContextMemoryOptimized;
    private static updatePerformanceMetrics;
    private static cleanupOldMessagesOptimized;
    private static getDetailedExplanationOptimized;
    private static getSimpleAnswerOptimized;
    private static enhanceQuestionWithContextOptimized;
    static getConversationHistory(sessionId: string): OptimizedConversationContext | null;
    static clearConversationContext(sessionId: string): void;
    static getConversationStats(): {
        activeSessions: number;
        totalMessages: number;
        averageMessagesPerSession: number;
        cacheStats: {
            keywordCacheSize: number;
            categoryCacheSize: number;
            knowledgeCacheSize: number;
        };
    };
    static clearCaches(): void;
    static getPerformanceStats(): {
        averageResponseTime: number;
        totalRequests: number;
        successRate: number;
        cacheHitRate: number;
    };
}
export default OptimizedAIService;
//# sourceMappingURL=aiServiceOptimized.d.ts.map