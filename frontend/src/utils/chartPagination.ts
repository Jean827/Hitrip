// 图表数据分页服务
export interface ChartDataPagination {
  page: number;
  pageSize: number;
  total: number;
  data: any[];
  hasMore: boolean;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export class ChartPaginationService {
  private static readonly DEFAULT_PAGE_SIZE = 100;
  private static readonly MAX_PAGE_SIZE = 1000;

  /**
   * 分页加载图表数据
   * @param dataSource 数据源函数
   * @param params 分页参数
   * @returns 分页数据
   */
  static async loadChartData(
    dataSource: (params: PaginationParams) => Promise<ChartDataPagination>,
    params: Partial<PaginationParams> = {}
  ): Promise<ChartDataPagination> {
    const paginationParams: PaginationParams = {
      page: params.page || 1,
      pageSize: Math.min(params.pageSize || this.DEFAULT_PAGE_SIZE, this.MAX_PAGE_SIZE),
      sortBy: params.sortBy,
      sortOrder: params.sortOrder || 'desc',
      filters: params.filters || {}
    };

    try {
      const result = await dataSource(paginationParams);
      return {
        ...result,
        hasMore: result.data.length === paginationParams.pageSize
      };
    } catch (error) {
      console.error('加载图表数据失败:', error);
      return {
        page: paginationParams.page,
        pageSize: paginationParams.pageSize,
        total: 0,
        data: [],
        hasMore: false
      };
    }
  }

  /**
   * 虚拟滚动数据加载
   * @param dataSource 数据源函数
   * @param startIndex 开始索引
   * @param endIndex 结束索引
   * @param pageSize 页面大小
   * @returns 虚拟滚动数据
   */
  static async loadVirtualScrollData(
    dataSource: (params: PaginationParams) => Promise<ChartDataPagination>,
    startIndex: number,
    endIndex: number,
    pageSize: number = this.DEFAULT_PAGE_SIZE
  ): Promise<any[]> {
    const startPage = Math.floor(startIndex / pageSize) + 1;
    const endPage = Math.floor(endIndex / pageSize) + 1;
    const results: any[] = [];

    for (let page = startPage; page <= endPage; page++) {
      try {
        const result = await dataSource({
          page,
          pageSize,
          sortBy: 'id',
          sortOrder: 'asc'
        });
        results.push(...result.data);
      } catch (error) {
        console.error(`加载第${page}页数据失败:`, error);
      }
    }

    // 返回指定范围的数据
    const startOffset = startIndex % pageSize;
    const endOffset = endIndex % pageSize;
    return results.slice(startOffset, startOffset + (endIndex - startIndex + 1));
  }

  /**
   * 预加载数据
   * @param dataSource 数据源函数
   * @param currentPage 当前页
   * @param pageSize 页面大小
   * @param preloadPages 预加载页数
   * @returns 预加载的数据
   */
  static async preloadData(
    dataSource: (params: PaginationParams) => Promise<ChartDataPagination>,
    currentPage: number,
    pageSize: number = this.DEFAULT_PAGE_SIZE,
    preloadPages: number = 2
  ): Promise<ChartDataPagination[]> {
    const preloadPromises: Promise<ChartDataPagination>[] = [];

    // 预加载后续页面
    for (let i = 1; i <= preloadPages; i++) {
      const nextPage = currentPage + i;
      preloadPromises.push(
        dataSource({
          page: nextPage,
          pageSize,
          sortBy: 'id',
          sortOrder: 'asc'
        })
      );
    }

    try {
      const results = await Promise.all(preloadPromises);
      return results;
    } catch (error) {
      console.error('预加载数据失败:', error);
      return [];
    }
  }

  /**
   * 优化大数据量图表渲染
   * @param data 原始数据
   * @param maxPoints 最大数据点数量
   * @returns 优化后的数据
   */
  static optimizeLargeDataset(data: any[], maxPoints: number = 1000): any[] {
    if (data.length <= maxPoints) {
      return data;
    }

    const step = Math.ceil(data.length / maxPoints);
    const optimizedData: any[] = [];

    for (let i = 0; i < data.length; i += step) {
      optimizedData.push(data[i]);
    }

    // 确保包含最后一个数据点
    if (optimizedData[optimizedData.length - 1] !== data[data.length - 1]) {
      optimizedData.push(data[data.length - 1]);
    }

    return optimizedData;
  }

  /**
   * 数据采样优化
   * @param data 原始数据
   * @param sampleSize 采样大小
   * @returns 采样后的数据
   */
  static sampleData(data: any[], sampleSize: number): any[] {
    if (data.length <= sampleSize) {
      return data;
    }

    const step = data.length / sampleSize;
    const sampledData: any[] = [];

    for (let i = 0; i < sampleSize; i++) {
      const index = Math.floor(i * step);
      sampledData.push(data[index]);
    }

    return sampledData;
  }

  /**
   * 计算最佳分页大小
   * @param totalDataSize 总数据大小
   * @param targetRenderTime 目标渲染时间（毫秒）
   * @returns 最佳分页大小
   */
  static calculateOptimalPageSize(totalDataSize: number, targetRenderTime: number = 2000): number {
    // 基于数据大小和渲染时间的启发式算法
    if (totalDataSize <= 1000) {
      return 100;
    } else if (totalDataSize <= 10000) {
      return 200;
    } else if (totalDataSize <= 100000) {
      return 500;
    } else {
      return 1000;
    }
  }
} 