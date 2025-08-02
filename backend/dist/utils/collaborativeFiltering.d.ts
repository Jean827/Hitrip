declare class CollaborativeFiltering {
    private static readonly CACHE_TTL;
    private static readonly SIMILARITY_THRESHOLD;
    private static readonly MAX_RECOMMENDATIONS;
    static getUserBasedRecommendations(userId: number, limit?: number): Promise<any[]>;
    static getItemBasedRecommendations(userId: number, limit?: number): Promise<any[]>;
    static getHybridRecommendations(userId: number, limit?: number): Promise<any[]>;
    static calculateUserSimilarity(userId1: number, userId2: number): Promise<number>;
    static calculateItemSimilarity(productId1: number, productId2: number): Promise<number>;
    static updateRecommendations(userId: number, productId: number, behaviorType: string): Promise<void>;
    private static findSimilarUsers;
    private static calculateRecommendationScores;
    private static calculateItemBasedScores;
    private static mergeRecommendations;
    private static getBehaviorWeight;
    private static updateSimilarities;
}
export default CollaborativeFiltering;
//# sourceMappingURL=collaborativeFiltering.d.ts.map