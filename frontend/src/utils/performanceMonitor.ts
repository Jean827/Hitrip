interface PerformanceMetrics {
  pageLoadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
  memoryUsage?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

interface PerformanceObserver {
  observe: (options: any) => void;
  disconnect: () => void;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.metrics = {
      pageLoadTime: 0,
      domContentLoaded: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      firstInputDelay: 0,
      cumulativeLayoutShift: 0,
      timeToInteractive: 0,
    };
  }

  /**
   * 初始化性能监控
   */
  public init(): void {
    this.observePageLoad();
    this.observePaintMetrics();
    this.observeLayoutShift();
    this.observeFirstInput();
    this.observeMemoryUsage();
  }

  /**
   * 监控页面加载性能
   */
  private observePageLoad(): void {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.metrics.pageLoadTime = navigation.loadEventEnd - navigation.loadEventStart;
        this.metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
        this.metrics.timeToInteractive = navigation.domInteractive - navigation.fetchStart;
      }
    });

    document.addEventListener('DOMContentLoaded', () => {
      this.metrics.domContentLoaded = performance.now();
    });
  }

  /**
   * 监控绘制性能指标
   */
  private observePaintMetrics(): void {
    // First Contentful Paint
    if ('PerformanceObserver' in window) {
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.firstContentfulPaint = entry.startTime;
          }
        }
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);
    }

    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.largestContentfulPaint = lastEntry.startTime;
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);
    }
  }

  /**
   * 监控布局偏移
   */
  private observeLayoutShift(): void {
    if ('PerformanceObserver' in window) {
      const layoutShiftObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            this.metrics.cumulativeLayoutShift += (entry as any).value;
          }
        }
      });
      layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(layoutShiftObserver);
    }
  }

  /**
   * 监控首次输入延迟
   */
  private observeFirstInput(): void {
    if ('PerformanceObserver' in window) {
      const firstInputObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.metrics.firstInputDelay = entry.processingStart - entry.startTime;
          break; // 只记录第一次输入
        }
      });
      firstInputObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(firstInputObserver);
    }
  }

  /**
   * 监控内存使用情况
   */
  private observeMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      };
    }
  }

  /**
   * 获取性能指标
   */
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * 发送性能数据到服务器
   */
  public async sendMetrics(): Promise<void> {
    try {
      const metrics = this.getMetrics();
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: window.location.href,
          timestamp: Date.now(),
          metrics,
        }),
      });
    } catch (error) {
      console.error('Failed to send performance metrics:', error);
    }
  }

  /**
   * 监控组件渲染性能
   */
  public measureComponentRender(componentName: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
      
      // 如果渲染时间过长，记录警告
      if (renderTime > 100) {
        console.warn(`${componentName} took ${renderTime.toFixed(2)}ms to render`);
      }
    };
  }

  /**
   * 监控API请求性能
   */
  public measureApiRequest(url: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const requestTime = endTime - startTime;
      
      console.log(`API request to ${url}: ${requestTime.toFixed(2)}ms`);
      
      // 如果请求时间过长，记录警告
      if (requestTime > 3000) {
        console.warn(`API request to ${url} took ${requestTime.toFixed(2)}ms`);
      }
    };
  }

  /**
   * 监控资源加载性能
   */
  public observeResourceLoading(): void {
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const resourceEntry = entry as PerformanceResourceTiming;
          const loadTime = resourceEntry.responseEnd - resourceEntry.requestStart;
          
          // 记录慢资源
          if (loadTime > 1000) {
            console.warn(`Slow resource: ${resourceEntry.name} took ${loadTime.toFixed(2)}ms`);
          }
        }
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);
    }
  }

  /**
   * 清理监控器
   */
  public destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }

  /**
   * 获取性能报告
   */
  public getPerformanceReport(): string {
    const metrics = this.getMetrics();
    const report = {
      pageLoad: {
        totalLoadTime: `${metrics.pageLoadTime.toFixed(2)}ms`,
        domContentLoaded: `${metrics.domContentLoaded.toFixed(2)}ms`,
        timeToInteractive: `${metrics.timeToInteractive.toFixed(2)}ms`,
      },
      paint: {
        firstContentfulPaint: `${metrics.firstContentfulPaint.toFixed(2)}ms`,
        largestContentfulPaint: `${metrics.largestContentfulPaint.toFixed(2)}ms`,
      },
      interaction: {
        firstInputDelay: `${metrics.firstInputDelay.toFixed(2)}ms`,
        cumulativeLayoutShift: metrics.cumulativeLayoutShift.toFixed(3),
      },
      memory: metrics.memoryUsage ? {
        usedJSHeapSize: `${(metrics.memoryUsage.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        totalJSHeapSize: `${(metrics.memoryUsage.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        jsHeapSizeLimit: `${(metrics.memoryUsage.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`,
      } : null,
    };

    return JSON.stringify(report, null, 2);
  }
}

// 创建全局性能监控实例
const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor; 