import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import BehaviorTracker from '../BehaviorTracker';
import userSlice from '../../store/slices/userSlice';

// 创建测试用的store
const createTestStore = () => {
  return configureStore({
    reducer: {
      user: userSlice,
    },
    preloadedState: {
      user: {
        isAuthenticated: true,
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com'
        },
        loading: false,
        error: null
      }
    }
  });
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

describe('BehaviorTracker Component', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <Provider store={store}>
        {component}
      </Provider>
    );
  };

  it('should render without crashing', () => {
    renderWithProvider(<BehaviorTracker />);
    expect(screen.getByTestId('behavior-tracker')).toBeInTheDocument();
  });

  it('should track page view when component mounts', async () => {
    const mockTrackEvent = jest.fn();
    global.trackEvent = mockTrackEvent;

    renderWithProvider(<BehaviorTracker />);

    await waitFor(() => {
      expect(mockTrackEvent).toHaveBeenCalledWith('page_view', {
        page: window.location.pathname,
        title: document.title,
        timestamp: expect.any(Number)
      });
    });
  });

  it('should track scroll events', async () => {
    const mockTrackEvent = jest.fn();
    global.trackEvent = mockTrackEvent;

    renderWithProvider(<BehaviorTracker />);

    // 模拟滚动事件
    fireEvent.scroll(window, { target: { scrollY: 100 } });

    await waitFor(() => {
      expect(mockTrackEvent).toHaveBeenCalledWith('scroll', {
        scrollY: 100,
        scrollPercentage: expect.any(Number),
        timestamp: expect.any(Number)
      });
    });
  });

  it('should track click events', async () => {
    const mockTrackEvent = jest.fn();
    global.trackEvent = mockTrackEvent;

    renderWithProvider(<BehaviorTracker />);

    // 模拟点击事件
    const element = document.createElement('button');
    element.textContent = 'Test Button';
    document.body.appendChild(element);
    
    fireEvent.click(element);

    await waitFor(() => {
      expect(mockTrackEvent).toHaveBeenCalledWith('click', {
        element: 'button',
        text: 'Test Button',
        timestamp: expect.any(Number)
      });
    });

    document.body.removeChild(element);
  });

  it('should track form interactions', async () => {
    const mockTrackEvent = jest.fn();
    global.trackEvent = mockTrackEvent;

    renderWithProvider(<BehaviorTracker />);

    // 模拟表单输入事件
    const input = document.createElement('input');
    input.type = 'text';
    input.name = 'test-input';
    document.body.appendChild(input);
    
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'test value' } });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(mockTrackEvent).toHaveBeenCalledWith('form_interaction', {
        type: 'focus',
        field: 'test-input',
        timestamp: expect.any(Number)
      });
    });

    document.body.removeChild(input);
  });

  it('should track time spent on page', async () => {
    const mockTrackEvent = jest.fn();
    global.trackEvent = mockTrackEvent;

    jest.useFakeTimers();

    renderWithProvider(<BehaviorTracker />);

    // 模拟时间流逝
    jest.advanceTimersByTime(30000); // 30秒

    await waitFor(() => {
      expect(mockTrackEvent).toHaveBeenCalledWith('time_spent', {
        duration: 30000,
        page: window.location.pathname,
        timestamp: expect.any(Number)
      });
    });

    jest.useRealTimers();
  });

  it('should track user engagement metrics', async () => {
    const mockTrackEvent = jest.fn();
    global.trackEvent = mockTrackEvent;

    renderWithProvider(<BehaviorTracker />);

    // 模拟用户交互
    fireEvent.scroll(window, { target: { scrollY: 500 } });
    fireEvent.click(document.body);

    await waitFor(() => {
      expect(mockTrackEvent).toHaveBeenCalledWith('engagement', {
        scrollDepth: expect.any(Number),
        clickCount: expect.any(Number),
        timeSpent: expect.any(Number),
        timestamp: expect.any(Number)
      });
    });
  });

  it('should handle errors gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // 模拟trackEvent抛出错误
    global.trackEvent = jest.fn().mockImplementation(() => {
      throw new Error('Tracking error');
    });

    renderWithProvider(<BehaviorTracker />);

    // 触发一个事件
    fireEvent.click(document.body);

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should respect user privacy settings', () => {
    // 模拟用户禁用跟踪
    localStorage.setItem('privacy_tracking_disabled', 'true');

    const mockTrackEvent = jest.fn();
    global.trackEvent = mockTrackEvent;

    renderWithProvider(<BehaviorTracker />);

    // 触发事件
    fireEvent.click(document.body);

    expect(mockTrackEvent).not.toHaveBeenCalled();

    localStorage.removeItem('privacy_tracking_disabled');
  });

  it('should batch events for performance', async () => {
    const mockTrackEvent = jest.fn();
    global.trackEvent = mockTrackEvent;

    renderWithProvider(<BehaviorTracker />);

    // 快速触发多个事件
    for (let i = 0; i < 5; i++) {
      fireEvent.click(document.body);
    }

    await waitFor(() => {
      // 应该批量处理事件而不是每个都单独发送
      expect(mockTrackEvent).toHaveBeenCalledTimes(1);
    });
  });

  it('should track custom events', async () => {
    const mockTrackEvent = jest.fn();
    global.trackEvent = mockTrackEvent;

    renderWithProvider(<BehaviorTracker />);

    // 触发自定义事件
    const customEvent = new CustomEvent('custom_tracking', {
      detail: { action: 'test_action', data: { key: 'value' } }
    });
    document.dispatchEvent(customEvent);

    await waitFor(() => {
      expect(mockTrackEvent).toHaveBeenCalledWith('custom_tracking', {
        action: 'test_action',
        data: { key: 'value' },
        timestamp: expect.any(Number)
      });
    });
  });
}); 