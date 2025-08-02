interface InterestTag {
    category: string;
    score: number;
    frequency: number;
}
interface BehaviorPattern {
    patternType: string;
    frequency: number;
    timeSlot: string;
    context: any;
}
interface UserValueMetrics {
    totalPurchases: number;
    totalSpent: number;
    avgOrderValue: number;
    purchaseFrequency: number;
    lastPurchaseDate: Date | null;
    engagementScore: number;
}
export declare class UserProfileAnalysis {
    static analyzeUserInterests(userId: string): Promise<InterestTag[]>;
    static analyzeBehaviorPatterns(userId: string): Promise<BehaviorPattern[]>;
    private static analyzeTimePatterns;
    private static analyzeSequencePatterns;
    private static analyzePagePatterns;
    static evaluateUserValue(userId: string): Promise<UserValueMetrics>;
    private static calculateEngagementScore;
    static determineUserSegment(userId: string): Promise<string>;
    static updateUserProfile(userId: string): Promise<void>;
    private static getBehaviorScore;
    static batchUpdateUserProfiles(): Promise<void>;
}
export default UserProfileAnalysis;
//# sourceMappingURL=userProfileAnalysis.d.ts.map