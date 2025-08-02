import { Model, Optional } from 'sequelize';
interface SearchHistoryAttributes {
    id: number;
    userId: number;
    query: string;
    resultCount: number;
    timestamp: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
interface SearchHistoryCreationAttributes extends Optional<SearchHistoryAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class SearchHistory extends Model<SearchHistoryAttributes, SearchHistoryCreationAttributes> implements SearchHistoryAttributes {
    id: number;
    userId: number;
    query: string;
    resultCount: number;
    timestamp: Date;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default SearchHistory;
//# sourceMappingURL=SearchHistory.d.ts.map