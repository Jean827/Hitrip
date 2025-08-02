import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  message, 
  Popconfirm, 
  Tag, 
  Space, 
  Tooltip, 
  Drawer,
  Descriptions,
  Tabs,
  Badge,
  Image,
  Row,
  Col,
  Upload,
  DatePicker,
  Switch,
  Rate,
  Statistic,
  Progress
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  UploadOutlined,
  PictureOutlined,
  FileTextOutlined,
  StarOutlined,
  EyeOutlined as ViewOutlined,
  FilterOutlined,
  ExportOutlined,
  ImportOutlined,
  SearchOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

interface Attraction {
  _id: string;
  name: string;
  description: string;
  location: string;
  category: string;
  images: string[];
  rating: number;
  price: number;
  status: 'published' | 'draft' | 'reviewing' | 'rejected';
  tags: string[];
  createdAt: string;
  updatedAt: string;
  statistics?: {
    viewCount: number;
    favoriteCount: number;
    reviewCount: number;
    averageRating: number;
  };
}

interface News {
  _id: string;
  title: string;
  content: string;
  summary: string;
  author: string;
  category: string;
  coverImage?: string;
  status: 'published' | 'draft' | 'reviewing' | 'rejected';
  tags: string[];
  publishAt?: string;
  createdAt: string;
  updatedAt: string;
  statistics?: {
    viewCount: number;
    likeCount: number;
    shareCount: number;
    commentCount: number;
  };
}

interface UserContent {
  _id: string;
  type: 'review' | 'comment' | 'post';
  title?: string;
  content: string;
  author: {
    _id: string;
    username: string;
    avatar?: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  relatedItem?: {
    type: 'attraction' | 'news' | 'product';
    id: string;
    name: string;
  };
}

const AdminContentPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('attractions');
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [userContents, setUserContents] = useState<UserContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [form] = Form.useForm();

  // 模拟数据
  const mockAttractions: Attraction[] = [
    {
      _id: '1',
      name: '三亚湾',
      description: '三亚湾是三亚市最美丽的海湾之一，拥有绵延的海岸线和清澈的海水。',
      location: '海南三亚',
      category: '海滩',
      images: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400'
      ],
      rating: 4.5,
      price: 0,
      status: 'published',
      tags: ['海滩', '免费', '日落'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-12-01T10:30:00Z',
      statistics: {
        viewCount: 12500,
        favoriteCount: 890,
        reviewCount: 234,
        averageRating: 4.5
      }
    },
    {
      _id: '2',
      name: '天涯海角',
      description: '天涯海角是海南最著名的旅游景点之一，象征着浪漫和永恒。',
      location: '海南三亚',
      category: '文化景点',
      images: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'
      ],
      rating: 4.2,
      price: 80,
      status: 'published',
      tags: ['文化', '历史', '浪漫'],
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-12-01T09:15:00Z',
      statistics: {
        viewCount: 8900,
        favoriteCount: 567,
        reviewCount: 156,
        averageRating: 4.2
      }
    },
    {
      _id: '3',
      name: '南山文化旅游区',
      description: '南山文化旅游区是集佛教文化、园林艺术、生态旅游于一体的综合性景区。',
      location: '海南三亚',
      category: '文化景点',
      images: [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400'
      ],
      rating: 4.8,
      price: 150,
      status: 'reviewing',
      tags: ['佛教', '文化', '园林'],
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: '2024-12-01T08:45:00Z',
      statistics: {
        viewCount: 6700,
        favoriteCount: 423,
        reviewCount: 98,
        averageRating: 4.8
      }
    }
  ];

  const mockNews: News[] = [
    {
      _id: '1',
      title: '海南旅游旺季即将到来，各大景区做好准备',
      content: '随着冬季的到来，海南旅游旺季即将开始...',
      summary: '海南旅游旺季即将到来，各大景区正在积极准备迎接游客。',
      author: '海南文旅',
      category: '旅游资讯',
      coverImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
      status: 'published',
      tags: ['旅游', '旺季', '景区'],
      publishAt: '2024-12-01T10:00:00Z',
      createdAt: '2024-11-30T00:00:00Z',
      updatedAt: '2024-12-01T10:00:00Z',
      statistics: {
        viewCount: 3200,
        likeCount: 156,
        shareCount: 89,
        commentCount: 45
      }
    },
    {
      _id: '2',
      title: '三亚新增多个网红打卡地，游客纷纷前往',
      content: '三亚市近期新增了多个网红打卡地...',
      summary: '三亚新增多个网红打卡地，成为游客新的热门选择。',
      author: '三亚日报',
      category: '地方新闻',
      status: 'published',
      tags: ['网红', '打卡', '三亚'],
      publishAt: '2024-11-28T14:30:00Z',
      createdAt: '2024-11-27T00:00:00Z',
      updatedAt: '2024-11-28T14:30:00Z',
      statistics: {
        viewCount: 2800,
        likeCount: 134,
        shareCount: 67,
        commentCount: 32
      }
    },
    {
      _id: '3',
      title: '海南美食文化节即将开幕',
      content: '海南美食文化节将于下月开幕...',
      summary: '海南美食文化节即将开幕，展示海南特色美食文化。',
      author: '美食频道',
      category: '美食文化',
      status: 'draft',
      tags: ['美食', '文化节', '海南'],
      createdAt: '2024-11-25T00:00:00Z',
      updatedAt: '2024-11-25T00:00:00Z',
      statistics: {
        viewCount: 0,
        likeCount: 0,
        shareCount: 0,
        commentCount: 0
      }
    }
  ];

  const mockUserContents: UserContent[] = [
    {
      _id: '1',
      type: 'review',
      title: '三亚湾真的很美',
      content: '三亚湾的海水很清澈，沙滩很干净，非常适合拍照和放松。',
      author: {
        _id: '1',
        username: 'user001',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user001'
      },
      status: 'approved',
      createdAt: '2024-12-01T09:30:00Z',
      updatedAt: '2024-12-01T09:30:00Z',
      relatedItem: {
        type: 'attraction',
        id: '1',
        name: '三亚湾'
      }
    },
    {
      _id: '2',
      type: 'comment',
      content: '这个景点值得一去，风景很美！',
      author: {
        _id: '2',
        username: 'user002',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user002'
      },
      status: 'pending',
      createdAt: '2024-12-01T08:15:00Z',
      updatedAt: '2024-12-01T08:15:00Z',
      relatedItem: {
        type: 'attraction',
        id: '2',
        name: '天涯海角'
      }
    },
    {
      _id: '3',
      type: 'post',
      title: '我的海南之旅',
      content: '分享我在海南的精彩旅程，包括美食、景点和住宿体验。',
      author: {
        _id: '3',
        username: 'user003',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user003'
      },
      status: 'rejected',
      createdAt: '2024-11-30T16:45:00Z',
      updatedAt: '2024-11-30T16:45:00Z'
    }
  ];

  // 统计数据
  const contentStats = [
    { name: '景点总数', value: 156, color: '#8884d8' },
    { name: '已发布', value: 142, color: '#82ca9d' },
    { name: '待审核', value: 8, color: '#ffc658' },
    { name: '草稿', value: 6, color: '#ff7300' }
  ];

  const newsStats = [
    { name: '文章总数', value: 89, color: '#8884d8' },
    { name: '已发布', value: 76, color: '#82ca9d' },
    { name: '待审核', value: 7, color: '#ffc658' },
    { name: '草稿', value: 6, color: '#ff7300' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // TODO: 调用API获取数据
      setAttractions(mockAttractions);
      setNews(mockNews);
      setUserContents(mockUserContents);
    } catch (error) {
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (record: any) => {
    setSelectedItem(record);
    setDrawerVisible(true);
  };

  const handleEdit = (record: any) => {
    setEditingItem(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      location: record.location,
      category: record.category,
      price: record.price,
      status: record.status,
      tags: record.tags
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      // TODO: 调用API删除内容
      message.success('删除成功');
      fetchData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      // TODO: 调用API更新状态
      message.success('状态更新成功');
      fetchData();
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingItem) {
        // TODO: 调用API更新内容
        message.success('更新成功');
      } else {
        // TODO: 调用API创建内容
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchData();
    } catch (error) {
      message.error(editingItem ? '更新失败' : '创建失败');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'green';
      case 'draft': return 'orange';
      case 'reviewing': return 'blue';
      case 'rejected': return 'red';
      case 'pending': return 'orange';
      case 'approved': return 'green';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return '已发布';
      case 'draft': return '草稿';
      case 'reviewing': return '审核中';
      case 'rejected': return '已拒绝';
      case 'pending': return '待审核';
      case 'approved': return '已通过';
      default: return '未知';
    }
  };

  const getContentTypeText = (type: string) => {
    switch (type) {
      case 'review': return '评论';
      case 'comment': return '留言';
      case 'post': return '帖子';
      default: return '未知';
    }
  };

  const filteredAttractions = attractions.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchText.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const filteredUserContents = userContents.filter(item => {
    const matchesSearch = (item.title || '').toLowerCase().includes(searchText.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchText.toLowerCase()) ||
                         item.author.username.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const attractionColumns = [
    {
      title: '景点信息',
      key: 'attractionInfo',
      render: (record: Attraction) => (
        <Space>
          <Image
            width={60}
            height={40}
            src={record.images[0]}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
            style={{ objectFit: 'cover', borderRadius: '4px' }}
          />
          <div>
            <div style={{ fontWeight: 'bold' }}>{record.name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.location}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <Tag color="blue">{category}</Tag>
    },
    {
      title: '评分',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number) => <Rate disabled defaultValue={rating} style={{ fontSize: '12px' }} />
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => price === 0 ? '免费' : `¥${price}`
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge 
          status={status === 'published' ? 'success' : 
                  status === 'reviewing' ? 'processing' : 
                  status === 'draft' ? 'warning' : 'error'} 
          text={getStatusText(status)} 
        />
      )
    },
    {
      title: '浏览量',
      dataIndex: ['statistics', 'viewCount'],
      key: 'viewCount',
      render: (count: number) => count?.toLocaleString() || '0'
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Attraction) => (
        <Space>
          <Tooltip title="查看详情">
            <Button 
              type="link" 
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button 
              type="link" 
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          {record.status === 'reviewing' && (
            <>
              <Tooltip title="通过">
                <Button 
                  type="link" 
                  icon={<CheckOutlined />}
                  onClick={() => handleStatusChange(record._id, 'published')}
                />
              </Tooltip>
              <Tooltip title="拒绝">
                <Button 
                  type="link" 
                  icon={<CloseOutlined />}
                  onClick={() => handleStatusChange(record._id, 'rejected')}
                />
              </Tooltip>
            </>
          )}
          <Popconfirm
            title="确定要删除这个景点吗？"
            onConfirm={() => handleDelete(record._id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const newsColumns = [
    {
      title: '文章信息',
      key: 'newsInfo',
      render: (record: News) => (
        <Space>
          {record.coverImage && (
            <Image
              width={60}
              height={40}
              src={record.coverImage}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
              style={{ objectFit: 'cover', borderRadius: '4px' }}
            />
          )}
          <div>
            <div style={{ fontWeight: 'bold' }}>{record.title}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.author}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <Tag color="blue">{category}</Tag>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge 
          status={status === 'published' ? 'success' : 
                  status === 'reviewing' ? 'processing' : 
                  status === 'draft' ? 'warning' : 'error'} 
          text={getStatusText(status)} 
        />
      )
    },
    {
      title: '浏览量',
      dataIndex: ['statistics', 'viewCount'],
      key: 'viewCount',
      render: (count: number) => count?.toLocaleString() || '0'
    },
    {
      title: '发布时间',
      dataIndex: 'publishAt',
      key: 'publishAt',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-'
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: News) => (
        <Space>
          <Tooltip title="查看详情">
            <Button 
              type="link" 
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button 
              type="link" 
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          {record.status === 'reviewing' && (
            <>
              <Tooltip title="通过">
                <Button 
                  type="link" 
                  icon={<CheckOutlined />}
                  onClick={() => handleStatusChange(record._id, 'published')}
                />
              </Tooltip>
              <Tooltip title="拒绝">
                <Button 
                  type="link" 
                  icon={<CloseOutlined />}
                  onClick={() => handleStatusChange(record._id, 'rejected')}
                />
              </Tooltip>
            </>
          )}
          <Popconfirm
            title="确定要删除这篇文章吗？"
            onConfirm={() => handleDelete(record._id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const userContentColumns = [
    {
      title: '内容信息',
      key: 'contentInfo',
      render: (record: UserContent) => (
        <Space>
          <Avatar src={record.author.avatar} icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 'bold' }}>{record.author.username}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.title || record.content.substring(0, 50)}...
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag color="purple">{getContentTypeText(type)}</Tag>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge 
          status={status === 'approved' ? 'success' : 
                  status === 'pending' ? 'warning' : 'error'} 
          text={getStatusText(status)} 
        />
      )
    },
    {
      title: '关联项目',
      dataIndex: 'relatedItem',
      key: 'relatedItem',
      render: (item: any) => item ? `${item.name} (${item.type})` : '-'
    },
    {
      title: '发布时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: UserContent) => (
        <Space>
          <Tooltip title="查看详情">
            <Button 
              type="link" 
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          {record.status === 'pending' && (
            <>
              <Tooltip title="通过">
                <Button 
                  type="link" 
                  icon={<CheckOutlined />}
                  onClick={() => handleStatusChange(record._id, 'approved')}
                />
              </Tooltip>
              <Tooltip title="拒绝">
                <Button 
                  type="link" 
                  icon={<CloseOutlined />}
                  onClick={() => handleStatusChange(record._id, 'rejected')}
                />
              </Tooltip>
            </>
          )}
          <Popconfirm
            title="确定要删除这个内容吗？"
            onConfirm={() => handleDelete(record._id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card 
        title="内容管理" 
        extra={
          <Space>
            <Button icon={<ImportOutlined />}>
              导入
            </Button>
            <Button icon={<ExportOutlined />}>
              导出
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
              新建内容
            </Button>
          </Space>
        }
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="景点管理" key="attractions">
            {/* 搜索和筛选 */}
            <div style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={6}>
                  <Input
                    placeholder="搜索景点名称或描述"
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </Col>
                <Col span={4}>
                  <Select
                    placeholder="状态筛选"
                    value={statusFilter}
                    onChange={setStatusFilter}
                    style={{ width: '100%' }}
                  >
                    <Option value="all">全部状态</Option>
                    <Option value="published">已发布</Option>
                    <Option value="draft">草稿</Option>
                    <Option value="reviewing">审核中</Option>
                    <Option value="rejected">已拒绝</Option>
                  </Select>
                </Col>
                <Col span={4}>
                  <Select
                    placeholder="分类筛选"
                    value={categoryFilter}
                    onChange={setCategoryFilter}
                    style={{ width: '100%' }}
                  >
                    <Option value="all">全部分类</Option>
                    <Option value="海滩">海滩</Option>
                    <Option value="文化景点">文化景点</Option>
                    <Option value="自然景观">自然景观</Option>
                  </Select>
                </Col>
              </Row>
            </div>

            <Table
              columns={attractionColumns}
              dataSource={filteredAttractions}
              rowKey="_id"
              loading={loading}
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
            />
          </TabPane>

          <TabPane tab="新闻管理" key="news">
            {/* 搜索和筛选 */}
            <div style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={6}>
                  <Input
                    placeholder="搜索文章标题或内容"
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </Col>
                <Col span={4}>
                  <Select
                    placeholder="状态筛选"
                    value={statusFilter}
                    onChange={setStatusFilter}
                    style={{ width: '100%' }}
                  >
                    <Option value="all">全部状态</Option>
                    <Option value="published">已发布</Option>
                    <Option value="draft">草稿</Option>
                    <Option value="reviewing">审核中</Option>
                    <Option value="rejected">已拒绝</Option>
                  </Select>
                </Col>
                <Col span={4}>
                  <Select
                    placeholder="分类筛选"
                    value={categoryFilter}
                    onChange={setCategoryFilter}
                    style={{ width: '100%' }}
                  >
                    <Option value="all">全部分类</Option>
                    <Option value="旅游资讯">旅游资讯</Option>
                    <Option value="地方新闻">地方新闻</Option>
                    <Option value="美食文化">美食文化</Option>
                  </Select>
                </Col>
              </Row>
            </div>

            <Table
              columns={newsColumns}
              dataSource={filteredNews}
              rowKey="_id"
              loading={loading}
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
            />
          </TabPane>

          <TabPane tab="用户内容审核" key="userContent">
            {/* 搜索和筛选 */}
            <div style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={6}>
                  <Input
                    placeholder="搜索用户或内容"
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </Col>
                <Col span={4}>
                  <Select
                    placeholder="状态筛选"
                    value={statusFilter}
                    onChange={setStatusFilter}
                    style={{ width: '100%' }}
                  >
                    <Option value="all">全部状态</Option>
                    <Option value="pending">待审核</Option>
                    <Option value="approved">已通过</Option>
                    <Option value="rejected">已拒绝</Option>
                  </Select>
                </Col>
              </Row>
            </div>

            <Table
              columns={userContentColumns}
              dataSource={filteredUserContents}
              rowKey="_id"
              loading={loading}
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* 内容详情抽屉 */}
      <Drawer
        title="内容详情"
        placement="right"
        width={600}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {selectedItem && (
          <div>
            <Tabs defaultActiveKey="basic">
              <TabPane tab="基本信息" key="basic">
                <Descriptions column={1} bordered>
                  {activeTab === 'attractions' && (
                    <>
                      <Descriptions.Item label="景点名称">{selectedItem.name}</Descriptions.Item>
                      <Descriptions.Item label="描述">{selectedItem.description}</Descriptions.Item>
                      <Descriptions.Item label="位置">{selectedItem.location}</Descriptions.Item>
                      <Descriptions.Item label="分类">{selectedItem.category}</Descriptions.Item>
                      <Descriptions.Item label="评分">{selectedItem.rating}</Descriptions.Item>
                      <Descriptions.Item label="价格">{selectedItem.price === 0 ? '免费' : `¥${selectedItem.price}`}</Descriptions.Item>
                      <Descriptions.Item label="状态">
                        <Badge 
                          status={selectedItem.status === 'published' ? 'success' : 
                                  selectedItem.status === 'reviewing' ? 'processing' : 
                                  selectedItem.status === 'draft' ? 'warning' : 'error'} 
                          text={getStatusText(selectedItem.status)} 
                        />
                      </Descriptions.Item>
                    </>
                  )}
                  {activeTab === 'news' && (
                    <>
                      <Descriptions.Item label="文章标题">{selectedItem.title}</Descriptions.Item>
                      <Descriptions.Item label="作者">{selectedItem.author}</Descriptions.Item>
                      <Descriptions.Item label="分类">{selectedItem.category}</Descriptions.Item>
                      <Descriptions.Item label="摘要">{selectedItem.summary}</Descriptions.Item>
                      <Descriptions.Item label="内容">{selectedItem.content}</Descriptions.Item>
                      <Descriptions.Item label="状态">
                        <Badge 
                          status={selectedItem.status === 'published' ? 'success' : 
                                  selectedItem.status === 'reviewing' ? 'processing' : 
                                  selectedItem.status === 'draft' ? 'warning' : 'error'} 
                          text={getStatusText(selectedItem.status)} 
                        />
                      </Descriptions.Item>
                    </>
                  )}
                  {activeTab === 'userContent' && (
                    <>
                      <Descriptions.Item label="作者">{selectedItem.author.username}</Descriptions.Item>
                      <Descriptions.Item label="类型">{getContentTypeText(selectedItem.type)}</Descriptions.Item>
                      <Descriptions.Item label="标题">{selectedItem.title || '-'}</Descriptions.Item>
                      <Descriptions.Item label="内容">{selectedItem.content}</Descriptions.Item>
                      <Descriptions.Item label="状态">
                        <Badge 
                          status={selectedItem.status === 'approved' ? 'success' : 
                                  selectedItem.status === 'pending' ? 'warning' : 'error'} 
                          text={getStatusText(selectedItem.status)} 
                        />
                      </Descriptions.Item>
                      {selectedItem.relatedItem && (
                        <Descriptions.Item label="关联项目">
                          {selectedItem.relatedItem.name} ({selectedItem.relatedItem.type})
                        </Descriptions.Item>
                      )}
                    </>
                  )}
                </Descriptions>
              </TabPane>
              
              <TabPane tab="统计数据" key="statistics">
                {activeTab === 'attractions' && selectedItem.statistics && (
                  <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={6}>
                      <Statistic title="浏览量" value={selectedItem.statistics.viewCount} />
                    </Col>
                    <Col span={6}>
                      <Statistic title="收藏数" value={selectedItem.statistics.favoriteCount} />
                    </Col>
                    <Col span={6}>
                      <Statistic title="评论数" value={selectedItem.statistics.reviewCount} />
                    </Col>
                    <Col span={6}>
                      <Statistic title="平均评分" value={selectedItem.statistics.averageRating} precision={1} />
                    </Col>
                  </Row>
                )}
                {activeTab === 'news' && selectedItem.statistics && (
                  <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={6}>
                      <Statistic title="浏览量" value={selectedItem.statistics.viewCount} />
                    </Col>
                    <Col span={6}>
                      <Statistic title="点赞数" value={selectedItem.statistics.likeCount} />
                    </Col>
                    <Col span={6}>
                      <Statistic title="分享数" value={selectedItem.statistics.shareCount} />
                    </Col>
                    <Col span={6}>
                      <Statistic title="评论数" value={selectedItem.statistics.commentCount} />
                    </Col>
                  </Row>
                )}
              </TabPane>
            </Tabs>
          </div>
        )}
      </Drawer>

      {/* 编辑内容模态框 */}
      <Modal
        title={editingItem ? '编辑内容' : '新建内容'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input placeholder="请输入名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: true, message: '请输入描述' }]}
          >
            <TextArea rows={4} placeholder="请输入描述" />
          </Form.Item>

          <Form.Item
            name="location"
            label="位置"
            rules={[{ required: true, message: '请输入位置' }]}
          >
            <Input placeholder="请输入位置" />
          </Form.Item>

          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select placeholder="请选择分类">
              <Option value="海滩">海滩</Option>
              <Option value="文化景点">文化景点</Option>
              <Option value="自然景观">自然景观</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="price"
            label="价格"
            rules={[{ required: true, message: '请输入价格' }]}
          >
            <Input type="number" placeholder="请输入价格" />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Option value="draft">草稿</Option>
              <Option value="reviewing">审核中</Option>
              <Option value="published">已发布</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="tags"
            label="标签"
          >
            <Select mode="tags" placeholder="请输入标签">
              <Option value="海滩">海滩</Option>
              <Option value="免费">免费</Option>
              <Option value="文化">文化</Option>
              <Option value="历史">历史</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingItem ? '更新' : '创建'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminContentPage; 