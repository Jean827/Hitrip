import React from 'react';
import { render, screen } from '@testing-library/react';
import SearchComponent from '../SearchComponent';

// Mock searchApi
jest.mock('../../services/searchApi', () => ({
  searchApi: {
    fulltextSearch: jest.fn(),
    getSuggestions: jest.fn(),
    getHistory: jest.fn(),
    getPopular: jest.fn(),
    spellCheck: jest.fn(),
  }
}));

// Mock auth context
jest.mock('../../store/slices/authSlice', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Test User' },
    isAuthenticated: true
  })
}));

describe('SearchComponent - 简化测试', () => {
  test('应该正确渲染搜索输入框', () => {
    render(<SearchComponent />);
    
    const searchInput = screen.getByPlaceholderText('搜索商品、分类...');
    expect(searchInput).toBeInTheDocument();
  });

  test('应该支持自定义占位符', () => {
    render(<SearchComponent placeholder="自定义占位符" />);
    
    const searchInput = screen.getByPlaceholderText('自定义占位符');
    expect(searchInput).toBeInTheDocument();
  });

  test('应该支持移动端优化模式', () => {
    render(<SearchComponent mobileOptimized={true} />);
    
    const searchInput = screen.getByPlaceholderText('搜索商品、分类...');
    expect(searchInput).toBeInTheDocument();
  });
}); 