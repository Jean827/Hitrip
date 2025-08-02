import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SearchComponent from '../SearchComponent';
import { searchApi } from '../../services/searchApi';

// Mock searchApi
jest.mock('../../services/searchApi');
const mockSearchApi = searchApi as jest.Mocked<typeof searchApi>;

// Mock auth context
jest.mock('../../store/slices/authSlice', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Test User' },
    isAuthenticated: true
  })
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('SearchComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('基础功能测试', () => {
    test('应该正确渲染搜索输入框', () => {
      renderWithRouter(<SearchComponent />);
      
      const searchInput = screen.getByPlaceholderText('搜索商品、分类...');
      expect(searchInput).toBeInTheDocument();
    });

    test('应该支持自定义占位符', () => {
      renderWithRouter(<SearchComponent placeholder="自定义占位符" />);
      
      const searchInput = screen.getByPlaceholderText('自定义占位符');
      expect(searchInput).toBeInTheDocument();
    });

    test('应该支持搜索输入', () => {
      renderWithRouter(<SearchComponent />);
      
      const searchInput = screen.getByPlaceholderText('搜索商品、分类...');
      fireEvent.change(searchInput, { target: { value: '测试搜索' } });
      
      expect(searchInput).toHaveValue('测试搜索');
    });
  });

  describe('搜索建议功能测试', () => {
    test('应该显示搜索建议', async () => {
      mockSearchApi.getSuggestions.mockResolvedValue({
        success: true,
        data: {
          products: ['测试商品1', '测试商品2'],
          categories: ['测试分类'],
          popular: ['热门搜索']
        }
      });

      renderWithRouter(<SearchComponent />);
      
      const searchInput = screen.getByPlaceholderText('搜索商品、分类...');
      fireEvent.change(searchInput, { target: { value: '测试' } });
      fireEvent.focus(searchInput);

      await waitFor(() => {
        expect(screen.getByText('测试商品1')).toBeInTheDocument();
        expect(screen.getByText('测试商品2')).toBeInTheDocument();
        expect(screen.getByText('测试分类')).toBeInTheDocument();
        expect(screen.getByText('热门搜索')).toBeInTheDocument();
      });
    });

    test('应该支持点击搜索建议', async () => {
      const onSearch = jest.fn();
      mockSearchApi.getSuggestions.mockResolvedValue({
        success: true,
        data: {
          products: ['测试商品'],
          categories: [],
          popular: []
        }
      });

      renderWithRouter(<SearchComponent onSearch={onSearch} />);
      
      const searchInput = screen.getByPlaceholderText('搜索商品、分类...');
      fireEvent.change(searchInput, { target: { value: '测试' } });
      fireEvent.focus(searchInput);

      await waitFor(() => {
        const suggestion = screen.getByText('测试商品');
        fireEvent.click(suggestion);
      });

      expect(onSearch).toHaveBeenCalledWith('测试商品');
    });
  });

  describe('搜索历史功能测试', () => {
    test('应该显示搜索历史', async () => {
      mockSearchApi.getHistory.mockResolvedValue({
        success: true,
        data: [
          { id: 1, query: '历史搜索1', resultCount: 10, timestamp: '2024-01-01T00:00:00Z' },
          { id: 2, query: '历史搜索2', resultCount: 5, timestamp: '2024-01-02T00:00:00Z' }
        ]
      });

      renderWithRouter(<SearchComponent />);
      
      const searchInput = screen.getByPlaceholderText('搜索商品、分类...');
      fireEvent.focus(searchInput);

      await waitFor(() => {
        expect(screen.getByText('历史搜索1')).toBeInTheDocument();
        expect(screen.getByText('历史搜索2')).toBeInTheDocument();
      });
    });

    test('应该支持删除搜索历史', async () => {
      const mockHistory = [
        { id: 1, query: '历史搜索1', resultCount: 10, timestamp: '2024-01-01T00:00:00Z' }
      ];

      mockSearchApi.getHistory.mockResolvedValue({
        success: true,
        data: mockHistory
      });

      mockSearchApi.deleteHistory.mockResolvedValue({
        success: true,
        message: '删除成功'
      });

      renderWithRouter(<SearchComponent />);
      
      const searchInput = screen.getByPlaceholderText('搜索商品、分类...');
      fireEvent.focus(searchInput);

      await waitFor(() => {
        const deleteButton = screen.getByRole('button', { name: /删除/i });
        fireEvent.click(deleteButton);
      });

      expect(mockSearchApi.deleteHistory).toHaveBeenCalledWith(1);
    });
  });

  describe('热门搜索功能测试', () => {
    test('应该显示热门搜索', async () => {
      mockSearchApi.getPopular.mockResolvedValue({
        success: true,
        data: [
          { query: '热门搜索1', count: 100 },
          { query: '热门搜索2', count: 50 }
        ]
      });

      renderWithRouter(<SearchComponent />);
      
      const searchInput = screen.getByPlaceholderText('搜索商品、分类...');
      fireEvent.focus(searchInput);

      await waitFor(() => {
        expect(screen.getByText('热门搜索1')).toBeInTheDocument();
        expect(screen.getByText('热门搜索2')).toBeInTheDocument();
      });
    });
  });

  describe('搜索纠错功能测试', () => {
    test('应该显示搜索纠错建议', async () => {
      mockSearchApi.spellCheck.mockResolvedValue({
        success: true,
        data: {
          original: '错误拼写',
          suggestions: ['正确拼写1', '正确拼写2']
        }
      });

      renderWithRouter(<SearchComponent />);
      
      const searchInput = screen.getByPlaceholderText('搜索商品、分类...');
      fireEvent.change(searchInput, { target: { value: '错误拼写' } });

      await waitFor(() => {
        expect(screen.getByText('您是否在搜索: 错误拼写?')).toBeInTheDocument();
        expect(screen.getByText('正确拼写1')).toBeInTheDocument();
        expect(screen.getByText('正确拼写2')).toBeInTheDocument();
      });
    });
  });

  describe('移动端优化测试', () => {
    test('应该支持移动端优化模式', () => {
      renderWithRouter(<SearchComponent mobileOptimized={true} />);
      
      const searchInput = screen.getByPlaceholderText('搜索商品、分类...');
      expect(searchInput).toBeInTheDocument();
      
      // 检查是否有移动端相关的样式类
      const searchComponent = searchInput.closest('.search-component');
      expect(searchComponent).toBeInTheDocument();
    });

    test('应该支持自定义显示选项', () => {
      renderWithRouter(
        <SearchComponent 
          showSuggestions={false}
          showHistory={false}
          showPopular={false}
        />
      );
      
      const searchInput = screen.getByPlaceholderText('搜索商品、分类...');
      fireEvent.focus(searchInput);
      
      // 由于禁用了所有建议，不应该显示任何建议面板
      expect(screen.queryByText('搜索历史')).not.toBeInTheDocument();
      expect(screen.queryByText('热门搜索')).not.toBeInTheDocument();
    });
  });

  describe('搜索结果测试', () => {
    test('应该显示搜索结果', async () => {
      const mockResults = [
        {
          id: 1,
          name: '测试商品',
          highlightedName: '测试<mark>商品</mark>',
          description: '测试商品描述',
          highlightedDescription: '测试<mark>商品</mark>描述',
          price: 100,
          image: 'test-image.jpg',
          category: { id: 1, name: '测试分类' }
        }
      ];

      mockSearchApi.fulltextSearch.mockResolvedValue({
        success: true,
        data: {
          results: mockResults,
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
          query: '测试'
        }
      });

      renderWithRouter(<SearchComponent />);
      
      const searchInput = screen.getByPlaceholderText('搜索商品、分类...');
      fireEvent.change(searchInput, { target: { value: '测试' } });
      fireEvent.submit(searchInput);

      await waitFor(() => {
        expect(screen.getByText('测试商品')).toBeInTheDocument();
        expect(screen.getByText('¥100')).toBeInTheDocument();
        expect(screen.getByText('测试分类')).toBeInTheDocument();
      });
    });

    test('应该支持搜索结果点击', async () => {
      const onResultClick = jest.fn();
      const mockResults = [
        {
          id: 1,
          name: '测试商品',
          highlightedName: '测试商品',
          description: '测试商品描述',
          highlightedDescription: '测试商品描述',
          price: 100,
          image: 'test-image.jpg',
          category: { id: 1, name: '测试分类' }
        }
      ];

      mockSearchApi.fulltextSearch.mockResolvedValue({
        success: true,
        data: {
          results: mockResults,
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
          query: '测试'
        }
      });

      renderWithRouter(<SearchComponent onResultClick={onResultClick} />);
      
      const searchInput = screen.getByPlaceholderText('搜索商品、分类...');
      fireEvent.change(searchInput, { target: { value: '测试' } });
      fireEvent.submit(searchInput);

      await waitFor(() => {
        const resultCard = screen.getByText('测试商品').closest('.ant-card');
        fireEvent.click(resultCard!);
      });

      expect(onResultClick).toHaveBeenCalledWith(mockResults[0]);
    });
  });

  describe('错误处理测试', () => {
    test('应该处理搜索API错误', async () => {
      mockSearchApi.fulltextSearch.mockRejectedValue(new Error('搜索失败'));

      renderWithRouter(<SearchComponent />);
      
      const searchInput = screen.getByPlaceholderText('搜索商品、分类...');
      fireEvent.change(searchInput, { target: { value: '测试' } });
      fireEvent.submit(searchInput);

      await waitFor(() => {
        expect(mockSearchApi.fulltextSearch).toHaveBeenCalledWith({ q: '测试' });
      });
    });

    test('应该处理建议API错误', async () => {
      mockSearchApi.getSuggestions.mockRejectedValue(new Error('获取建议失败'));

      renderWithRouter(<SearchComponent />);
      
      const searchInput = screen.getByPlaceholderText('搜索商品、分类...');
      fireEvent.change(searchInput, { target: { value: '测试' } });

      // 不应该因为API错误而崩溃
      expect(searchInput).toBeInTheDocument();
    });
  });

  describe('性能测试', () => {
    test('应该防抖搜索输入', async () => {
      jest.useFakeTimers();
      
      renderWithRouter(<SearchComponent />);
      
      const searchInput = screen.getByPlaceholderText('搜索商品、分类...');
      
      // 快速输入多个字符
      fireEvent.change(searchInput, { target: { value: 'a' } });
      fireEvent.change(searchInput, { target: { value: 'ab' } });
      fireEvent.change(searchInput, { target: { value: 'abc' } });

      // 在防抖延迟之前，不应该调用API
      expect(mockSearchApi.getSuggestions).not.toHaveBeenCalled();

      // 快进时间
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(mockSearchApi.getSuggestions).toHaveBeenCalledWith({ q: 'abc' });
      });

      jest.useRealTimers();
    });
  });
}); 