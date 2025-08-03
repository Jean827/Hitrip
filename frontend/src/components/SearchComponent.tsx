import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input, List, Card, Tag, Button, Spin, Empty, message, Tooltip } from 'antd';
import { SearchOutlined, HistoryOutlined, FireOutlined, DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { searchApi } from '../services/searchApi';
import { useAuth } from '../store/slices/authSlice';

const { Search } = Input;

interface SearchResult {
  id: number;
  name: string;
  highlightedName: string;
  description: string;
  highlightedDescription: string;
  price: number;
  image: string;
  category: {
    id: number;
    name: string;
  };
}

interface SearchSuggestions {
  products: string[];
  categories: string[];
  popular: string[];
}

interface SearchHistory {
  id: number;
  query: string;
  resultCount: number;
  timestamp: string;
}

interface SpellCheckResult {
  original: string;
  suggestions: string[];
}

interface SearchComponentProps {
  onSearch?: (query: string) => void;
  onResultClick?: (result: SearchResult) => void;
  placeholder?: string;
  className?: string;
  showSuggestions?: boolean;
  showHistory?: boolean;
  showPopular?: boolean;
  mobileOptimized?: boolean;
}

const SearchComponent: React.FC<SearchComponentProps> = ({
  onSearch,
  onResultClick,
  placeholder = '搜索商品、分类...',
  className,
  showSuggestions = true,
  showHistory = true,
  showPopular = true,
  mobileOptimized = false
}) => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestions | null>(null);
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [popular, setPopular] = useState<{ query: string; count: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestionsPanel, setShowSuggestionsPanel] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [spellCheck, setSpellCheck] = useState<SpellCheckResult | null>(null);
  const searchTimeout = useRef<NodeJS.Timeout>();
  const inputRef = useRef<any>(null);

  // 获取搜索建议
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions(null);
      return;
    }

    try {
      const response = await searchApi.getSuggestions({ q: searchQuery });
      if (response.success) {
        setSuggestions(response.data);
      }
    } catch (error) {
      console.error('获取搜索建议失败:', error);
    }
  }, []);

  // 获取搜索历史
  const fetchHistory = useCallback(async () => {
    if (!user) return;

    try {
      const response = await searchApi.getHistory();
      if (response.success) {
        setHistory(response.data);
      }
    } catch (error) {
      console.error('获取搜索历史失败:', error);
    }
  }, [user]);

  // 获取热门搜索
  const fetchPopular = useCallback(async () => {
    try {
      const response = await searchApi.getPopular();
      if (response.success) {
        setPopular(response.data);
      }
    } catch (error) {
      console.error('获取热门搜索失败:', error);
    }
  }, []);

  // 搜索纠错
  const fetchSpellCheck = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSpellCheck(null);
      return;
    }

    try {
      const response = await searchApi.spellCheck({ q: searchQuery });
      if (response.success && response.data.suggestions.length > 0) {
        setSpellCheck(response.data);
      } else {
        setSpellCheck(null);
      }
    } catch (error) {
      console.error('搜索纠错失败:', error);
    }
  }, []);

  // 执行搜索
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const response = await searchApi.fulltextSearch({ q: searchQuery });
      if (response.success) {
        setSearchResults(response.data.results);
        onSearch?.(searchQuery);
      }
    } catch (error) {
      console.error('搜索失败:', error);
      message.error('搜索失败，请重试');
    } finally {
      setSearching(false);
    }
  }, [onSearch]);

  // 处理搜索输入
  const handleSearchInput = (value: string) => {
    setQuery(value);
    setShowSuggestionsPanel(true);

    // 防抖处理
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      fetchSuggestions(value);
      fetchSpellCheck(value);
    }, 300);
  };

  // 处理搜索提交
  const handleSearchSubmit = (value: string) => {
    if (!value.trim()) return;

    setShowSuggestionsPanel(false);
    performSearch(value);
  };

  // 处理建议点击
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestionsPanel(false);
    performSearch(suggestion);
  };

  // 处理历史点击
  const handleHistoryClick = (historyItem: SearchHistory) => {
    setQuery(historyItem.query);
    setShowSuggestionsPanel(false);
    performSearch(historyItem.query);
  };

  // 删除搜索历史
  const handleDeleteHistory = async (historyId: number) => {
    try {
      const response = await searchApi.deleteHistory(historyId);
      if (response.success) {
        message.success('删除成功');
        fetchHistory();
      }
    } catch (error) {
      console.error('删除搜索历史失败:', error);
      message.error('删除失败');
    }
  };

  // 清空搜索历史
  const handleClearHistory = async () => {
    try {
      const response = await searchApi.clearHistory();
      if ('success' in response && response.success) {
        message.success('清空成功');
        setHistory([]);
      }
    } catch (error) {
      console.error('清空搜索历史失败:', error);
      message.error('清空失败');
    }
  };

  // 处理结果点击
  const handleResultClick = (result: SearchResult) => {
    onResultClick?.(result);
  };

  // 初始化数据
  useEffect(() => {
    fetchHistory();
    fetchPopular();
  }, [fetchHistory, fetchPopular]);

  // 点击外部关闭建议
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestionsPanel(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const renderSpellCheck = () => {
    if (!spellCheck || !showSuggestionsPanel) return null;

    return (
      <Card className="search-spell-check" style={{ 
        position: 'absolute', 
        top: '100%', 
        left: 0, 
        right: 0, 
        zIndex: 1000,
        marginTop: 4
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          <InfoCircleOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          <span style={{ fontSize: '14px', color: '#666' }}>
            您是否在搜索: <strong>{spellCheck.original}</strong>?
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {spellCheck.suggestions.map(suggestion => (
            <Tag
              key={suggestion}
              className="spell-check-tag"
              onClick={() => handleSuggestionClick(suggestion)}
              style={{ cursor: 'pointer', marginBottom: 4 }}
            >
              {suggestion}
            </Tag>
          ))}
        </div>
      </Card>
    );
  };

  const renderSuggestions = () => {
    if (!showSuggestionsPanel || !suggestions || !showSuggestions) return null;

    const allSuggestions = [
      ...suggestions.products.map(item => ({ text: item, type: 'product' })),
      ...suggestions.categories.map(item => ({ text: item, type: 'category' })),
      ...suggestions.popular.map(item => ({ text: item, type: 'popular' }))
    ];

    if (allSuggestions.length === 0) return null;

    return (
      <Card className="search-suggestions" style={{ 
        position: 'absolute', 
        top: '100%', 
        left: 0, 
        right: 0, 
        zIndex: 1000,
        marginTop: 4
      }}>
        <List
          size="small"
          dataSource={allSuggestions}
          renderItem={item => (
            <List.Item
              className="suggestion-item"
              onClick={() => handleSuggestionClick(item.text)}
              style={{ 
                cursor: 'pointer', 
                padding: mobileOptimized ? '12px 16px' : '8px 12px',
                fontSize: mobileOptimized ? '16px' : '14px'
              }}
            >
              <SearchOutlined style={{ marginRight: 8, color: '#999' }} />
              <span>{item.text}</span>
              <Tag color={item.type === 'product' ? 'blue' : item.type === 'category' ? 'green' : 'orange'}>
                {item.type === 'product' ? '商品' : item.type === 'category' ? '分类' : '热门'}
              </Tag>
            </List.Item>
          )}
        />
      </Card>
    );
  };

  const renderHistory = () => {
    if (!showSuggestionsPanel || history.length === 0 || !showHistory) return null;

    return (
      <Card className="search-history" style={{ 
        position: 'absolute', 
        top: '100%', 
        left: 0, 
        right: 0, 
        zIndex: 1000,
        marginTop: 4
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontWeight: 'bold', fontSize: mobileOptimized ? '16px' : '14px' }}>搜索历史</span>
          <Button size="small" onClick={handleClearHistory}>清空</Button>
        </div>
        <List
          size="small"
          dataSource={history}
          renderItem={item => (
            <List.Item
              className="history-item"
              onClick={() => handleHistoryClick(item)}
              style={{ 
                cursor: 'pointer', 
                padding: mobileOptimized ? '12px 16px' : '8px 12px',
                fontSize: mobileOptimized ? '16px' : '14px'
              }}
              actions={[
                <DeleteOutlined
                  key="delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteHistory(item.id);
                  }}
                />
              ]}
            >
              <HistoryOutlined style={{ marginRight: 8, color: '#999' }} />
              <span>{item.query}</span>
              <span style={{ color: '#999', fontSize: '12px' }}>
                {new Date(item.timestamp).toLocaleDateString()}
              </span>
            </List.Item>
          )}
        />
      </Card>
    );
  };

  const renderPopular = () => {
    if (!showSuggestionsPanel || popular.length === 0 || !showPopular) return null;

    return (
      <Card className="search-popular" style={{ 
        position: 'absolute', 
        top: '100%', 
        left: 0, 
        right: 0, 
        zIndex: 1000,
        marginTop: 4
      }}>
        <div style={{ marginBottom: 12 }}>
          <span style={{ fontWeight: 'bold', fontSize: mobileOptimized ? '16px' : '14px' }}>热门搜索</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {popular.map(item => (
            <Tag
              key={item.query}
              className="popular-tag"
              onClick={() => handleSuggestionClick(item.query)}
              style={{ 
                cursor: 'pointer',
                fontSize: mobileOptimized ? '14px' : '12px',
                padding: mobileOptimized ? '4px 8px' : '2px 6px'
              }}
            >
              <FireOutlined style={{ marginRight: 4 }} />
              {item.query}
            </Tag>
          ))}
        </div>
      </Card>
    );
  };

  const renderSearchResults = () => {
    if (searchResults.length === 0) return null;

    return (
      <div className="search-results" style={{ marginTop: 16 }}>
        <List
          grid={{ 
            gutter: 16, 
            xs: mobileOptimized ? 1 : 1, 
            sm: mobileOptimized ? 1 : 2, 
            md: mobileOptimized ? 2 : 3, 
            lg: mobileOptimized ? 2 : 4, 
            xl: mobileOptimized ? 3 : 4, 
            xxl: mobileOptimized ? 3 : 6 
          }}
          dataSource={searchResults}
          renderItem={item => (
            <List.Item>
              <Card
                hoverable
                cover={
                  <img
                    alt={item.name}
                    src={item.image}
                    style={{ 
                      height: mobileOptimized ? 150 : 200, 
                      objectFit: 'cover' 
                    }}
                  />
                }
                onClick={() => handleResultClick(item)}
                style={{ cursor: 'pointer' }}
              >
                <Card.Meta
                  title={
                    <div dangerouslySetInnerHTML={{ __html: item.highlightedName }} />
                  }
                  description={
                    <div>
                      <div dangerouslySetInnerHTML={{ __html: item.highlightedDescription }} />
                      <div style={{ marginTop: 8 }}>
                        <span style={{ color: '#f50', fontSize: mobileOptimized ? '14px' : '16px', fontWeight: 'bold' }}>
                          ¥{item.price}
                        </span>
                        <Tag color="blue" style={{ marginLeft: 8 }}>
                          {item.category.name}
                        </Tag>
                      </div>
                    </div>
                  }
                />
              </Card>
            </List.Item>
          )}
        />
      </div>
    );
  };

  return (
    <div className={`search-component ${className}`} style={{ position: 'relative' }}>
      <Search
        ref={inputRef}
        placeholder={placeholder}
        value={query}
        onChange={(e) => handleSearchInput(e.target.value)}
        onSearch={handleSearchSubmit}
        onFocus={() => setShowSuggestionsPanel(true)}
        loading={loading}
        enterButton={<SearchOutlined />}
        size={mobileOptimized ? "large" : "large"}
        style={{ 
          width: '100%',
          fontSize: mobileOptimized ? '16px' : '14px'
        }}
      />
      
      {renderSpellCheck()}
      {renderSuggestions()}
      {renderHistory()}
      {renderPopular()}
      
      {searching && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Spin size="large" />
          <div style={{ marginTop: 8 }}>搜索中...</div>
        </div>
      )}
      
      {renderSearchResults()}
    </div>
  );
};

export default SearchComponent; 