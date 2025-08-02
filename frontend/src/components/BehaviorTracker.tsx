import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface BehaviorTrackerProps {
  userId?: string;
  sessionId?: string;
}

const BehaviorTracker: React.FC<BehaviorTrackerProps> = ({ userId, sessionId }) => {
  const location = useLocation();

  useEffect(() => {
    // 记录页面访问行为
    if (userId) {
      recordPageView();
    }
  }, [location, userId]);

  const recordPageView = async () => {
    try {
      const behaviorData = {
        behaviorType: 'view',
        targetType: 'page',
        targetId: location.pathname,
        context: {
          referrer: document.referrer,
          userAgent: navigator.userAgent,
          screenSize: `${screen.width}x${screen.height}`,
          timestamp: new Date().toISOString(),
        },
        sessionId: sessionId || 'unknown',
      };

      // TODO: 调用行为记录API
      console.log('记录页面访问:', behaviorData);
    } catch (error) {
      console.error('记录页面访问失败:', error);
    }
  };

  const recordClick = async (targetId: string, targetType: string, context?: any) => {
    try {
      const behaviorData = {
        behaviorType: 'click',
        targetType,
        targetId,
        context: {
          ...context,
          timestamp: new Date().toISOString(),
        },
        sessionId: sessionId || 'unknown',
      };

      // TODO: 调用行为记录API
      console.log('记录点击行为:', behaviorData);
    } catch (error) {
      console.error('记录点击行为失败:', error);
    }
  };

  const recordSearch = async (keyword: string, results: any[]) => {
    try {
      const behaviorData = {
        behaviorType: 'search',
        targetType: 'search',
        targetId: keyword,
        context: {
          resultsCount: results.length,
          timestamp: new Date().toISOString(),
        },
        sessionId: sessionId || 'unknown',
      };

      // TODO: 调用行为记录API
      console.log('记录搜索行为:', behaviorData);
    } catch (error) {
      console.error('记录搜索行为失败:', error);
    }
  };

  const recordPurchase = async (productId: string, amount: number, context?: any) => {
    try {
      const behaviorData = {
        behaviorType: 'purchase',
        targetType: 'product',
        targetId: productId,
        context: {
          amount,
          ...context,
          timestamp: new Date().toISOString(),
        },
        sessionId: sessionId || 'unknown',
      };

      // TODO: 调用行为记录API
      console.log('记录购买行为:', behaviorData);
    } catch (error) {
      console.error('记录购买行为失败:', error);
    }
  };

  const recordFavorite = async (targetId: string, targetType: string, context?: any) => {
    try {
      const behaviorData = {
        behaviorType: 'favorite',
        targetType,
        targetId,
        context: {
          ...context,
          timestamp: new Date().toISOString(),
        },
        sessionId: sessionId || 'unknown',
      };

      // TODO: 调用行为记录API
      console.log('记录收藏行为:', behaviorData);
    } catch (error) {
      console.error('记录收藏行为失败:', error);
    }
  };

  // 暴露方法给父组件使用
  useEffect(() => {
    if (window) {
      (window as any).behaviorTracker = {
        recordClick,
        recordSearch,
        recordPurchase,
        recordFavorite,
      };
    }
  }, []);

  return null; // 这是一个无渲染组件
};

export default BehaviorTracker; 