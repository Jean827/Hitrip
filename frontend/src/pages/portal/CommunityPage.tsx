import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Button, 
  Space, 
  List, 
  Tag, 
  Avatar, 
  Comment, 
  Input, 
  Divider,
  Tabs,
  Modal,
  Form,
  Upload,
  Select,
  message,
  Badge,
  Popconfirm,
  Tooltip
} from 'antd';
import { 
  PlusOutlined, 
  HeartOutlined, 
  HeartFilled,
  MessageOutlined, 
  ShareAltOutlined,
  EyeOutlined,
  UserOutlined,
  CameraOutlined,
  SendOutlined,
  LikeOutlined,
  DislikeOutlined,
  BookOutlined,
  TrophyOutlined,
  FireOutlined,
  StarOutlined,
  FilterOutlined,
  SortAscendingOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Option } = Select;

interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    level: number;
  };
  images: string[];
  tags: string[];
  category: string;
  likes: number;
  comments: number;
  views: number;
  createdAt: string;
  updatedAt: string;
  isLiked: boolean;
  isBookmarked: boolean;
}

interface CommentItem {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  likes: number;
  createdAt: string;
  replies: CommentItem[];
}

const CommunityPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [commentForm] = Form.useForm();
  const [replyTo, setReplyTo] = useState<string | null>(null);

  // 模拟数据
  useEffect(() => {
    const mockPosts: Post[] = [
      {
        id: '1',
        title: '三亚湾日落美景分享',
        content: `今天在三亚湾拍到了绝美的日落，金色的阳光洒在海面上，形成"海天一色"的壮美景色。分享给大家，希望大家也能感受到这份美好。

三亚湾的海滩真的很美，沙质细腻，海水清澈。傍晚时分，很多游客都会来这里观赏日落，场面非常壮观。

建议大家如果来三亚旅游，一定要安排时间来这里看日落，绝对不会失望的！`,
        author: {
          id: '1',
          name: '旅行者小王',
          avatar: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100',
          level: 5
        },
        images: [
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'
        ],
        tags: ['三亚湾', '日落', '摄影', '美景'],
        category: '游记',
        likes: 128,
        comments: 32,
        views: 1250,
        createdAt: '2024-01-15 18:30',
        updatedAt: '2024-01-15 18:30',
        isLiked: false,
        isBookmarked: false
      },
      {
        id: '2',
        title: '天涯海角一日游攻略',
        content: `刚刚从天涯海角回来，给大家分享一下详细的游玩攻略。

交通：从三亚市区可以乘坐8路公交车直达，车程约40分钟。也可以打车，费用约80元。

门票：成人票80元，学生票40元。建议提前在网上预订，可以享受优惠。

游玩时间：建议安排3-4小时，可以慢慢欣赏风景，拍照留念。

最佳拍照时间：上午9-11点或下午4-6点，光线最好。

注意事项：
1. 注意潮汐时间，安全第一
2. 准备防晒用品
3. 可以请专业摄影师拍摄纪念照

总的来说，天涯海角还是很值得一去的，特别是情侣们，这里有着浪漫的传说。`,
        author: {
          id: '2',
          name: '摄影爱好者',
          avatar: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100',
          level: 3
        },
        images: [
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'
        ],
        tags: ['天涯海角', '攻略', '交通', '门票'],
        category: '攻略',
        likes: 89,
        comments: 15,
        views: 890,
        createdAt: '2024-01-14 14:20',
        updatedAt: '2024-01-14 14:20',
        isLiked: true,
        isBookmarked: false
      },
      {
        id: '3',
        title: '南山文化旅游区深度体验',
        content: `今天去了南山文化旅游区，感受了深厚的佛教文化氛围。

景区很大，建议安排一整天的时间。主要景点包括：
- 海上观音像：108米高，非常壮观
- 南山寺：庄严肃穆的佛教建筑
- 不二法门：寓意深刻的文化景观
- 慈航普渡：美丽的园林景观

文化体验：
1. 可以请香祈福
2. 听导游讲解佛教文化
3. 品尝素斋
4. 购买佛教纪念品

注意事项：
- 着装要得体，尊重佛教文化
- 不要大声喧哗
- 拍照时注意角度，不要对着佛像正面拍摄

这里不仅是旅游景点，更是了解中国传统文化的重要场所。`,
        author: {
          id: '3',
          name: '文化探索者',
          avatar: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100',
          level: 4
        },
        images: [
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'
        ],
        tags: ['南山', '佛教', '文化', '观音'],
        category: '游记',
        likes: 156,
        comments: 28,
        views: 2100,
        createdAt: '2024-01-13 10:15',
        updatedAt: '2024-01-13 10:15',
        isLiked: false,
        isBookmarked: true
      }
    ];

    const mockComments: CommentItem[] = [
      {
        id: '1',
        content: '照片拍得真美！请问是用什么相机拍的？',
        author: {
          id: '4',
          name: '摄影新手',
          avatar: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100'
        },
        likes: 12,
        createdAt: '2024-01-15 19:00',
        replies: []
      },
      {
        id: '2',
        content: '感谢分享！正好计划去三亚，这些信息很有用。',
        author: {
          id: '5',
          name: '旅行达人',
          avatar: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100'
        },
        likes: 8,
        createdAt: '2024-01-15 18:45',
        replies: [
          {
            id: '2-1',
            content: '不客气！如果有什么问题随时问我。',
            author: {
              id: '1',
              name: '旅行者小王',
              avatar: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100'
            },
            likes: 3,
            createdAt: '2024-01-15 19:30',
            replies: []
          }
        ]
      }
    ];

    setPosts(mockPosts);
    setFilteredPosts(mockPosts);
    setComments(mockComments);
  }, []);

  // 筛选和排序逻辑
  useEffect(() => {
    let filtered = [...posts];

    // 分类筛选
    if (activeTab !== 'all') {
      filtered = filtered.filter(post => post.category === activeTab);
    }

    // 搜索筛选
    if (searchText) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchText.toLowerCase()) ||
        post.content.toLowerCase().includes(searchText.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchText.toLowerCase()))
      );
    }

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'latest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'popular':
          return b.likes - a.likes;
        case 'views':
          return b.views - a.views;
        case 'comments':
          return b.comments - a.comments;
        default:
          return 0;
      }
    });

    setFilteredPosts(filtered);
  }, [posts, activeTab, searchText, sortBy]);

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          isLiked: !post.isLiked
        };
      }
      return post;
    }));
  };

  const handleBookmark = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isBookmarked: !post.isBookmarked
        };
      }
      return post;
    }));
  };

  const handlePostSelect = (post: Post) => {
    setSelectedPost(post);
    setCommentModalVisible(true);
  };

  const handleCreatePost = (values: any) => {
    const newPost: Post = {
      id: Date.now().toString(),
      title: values.title,
      content: values.content,
      author: {
        id: 'current-user',
        name: '当前用户',
        avatar: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100',
        level: 3
      },
      images: values.images || [],
      tags: values.tags || [],
      category: values.category,
      likes: 0,
      comments: 0,
      views: 0,
      createdAt: new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString(),
      isLiked: false,
      isBookmarked: false
    };

    setPosts(prev => [newPost, ...prev]);
    setModalVisible(false);
    form.resetFields();
    message.success('发布成功！');
  };

  const handleAddComment = (values: any) => {
    const newComment: CommentItem = {
      id: Date.now().toString(),
      content: values.content,
      author: {
        id: 'current-user',
        name: '当前用户',
        avatar: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100'
      },
      likes: 0,
      createdAt: new Date().toLocaleString(),
      replies: []
    };

    setComments(prev => [newComment, ...prev]);
    commentForm.resetFields();
    message.success('评论发布成功！');
  };

  const categories = ['全部', '游记', '攻略', '问答', '分享'];

  return (
    <div className="community-page">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题和操作栏 */}
        <div className="page-header mb-6">
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={1}>社区交流</Title>
              <Paragraph className="text-gray-600">
                分享旅行体验，结识志同道合的旅行者
              </Paragraph>
            </Col>
            <Col>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                size="large"
                onClick={() => setModalVisible(true)}
              >
                发布内容
              </Button>
            </Col>
          </Row>
        </div>

        <Row gutter={24}>
          {/* 左侧内容列表 */}
          <Col xs={24} lg={16}>
            {/* 筛选和排序 */}
            <Card className="mb-4">
              <Row justify="space-between" align="middle">
                <Col>
                  <Tabs 
                    activeKey={activeTab} 
                    onChange={setActiveTab}
                    size="small"
                  >
                    {categories.map(category => (
                      <TabPane tab={category} key={category === '全部' ? 'all' : category} />
                    ))}
                  </Tabs>
                </Col>
                <Col>
                  <Space>
                    <Select
                      value={sortBy}
                      onChange={setSortBy}
                      style={{ width: 120 }}
                    >
                      <Option value="latest">最新发布</Option>
                      <Option value="popular">最受欢迎</Option>
                      <Option value="views">最多浏览</Option>
                      <Option value="comments">最多评论</Option>
                    </Select>
                  </Space>
                </Col>
              </Row>
            </Card>

            {/* 内容列表 */}
            <div className="posts-list">
              {filteredPosts.map(post => (
                <Card key={post.id} className="mb-4 post-card">
                  <div className="post-header mb-4">
                    <div className="author-info">
                      <Avatar 
                        src={post.author.avatar} 
                        size={48}
                        icon={<UserOutlined />}
                      />
                      <div className="author-details ml-3">
                        <div className="author-name">
                          <Text strong>{post.author.name}</Text>
                          <Badge count={post.author.level} style={{ backgroundColor: '#52c41a' }} />
                        </div>
                        <Text type="secondary">{post.createdAt}</Text>
                      </div>
                    </div>
                    <div className="post-category">
                      <Tag color="blue">{post.category}</Tag>
                    </div>
                  </div>

                  <div className="post-content mb-4">
                    <Title level={4} className="mb-2">
                      {post.title}
                    </Title>
                    <Paragraph className="mb-3">
                      {post.content}
                    </Paragraph>
                    
                    {post.images.length > 0 && (
                      <div className="post-images mb-3">
                        <Row gutter={[8, 8]}>
                          {post.images.map((image, index) => (
                            <Col span={8} key={index}>
                              <img
                                src={image}
                                alt={`图片${index + 1}`}
                                style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 4 }}
                              />
                            </Col>
                          ))}
                        </Row>
                      </div>
                    )}

                    <div className="post-tags">
                      {post.tags.map(tag => (
                        <Tag key={tag} color="green">{tag}</Tag>
                      ))}
                    </div>
                  </div>

                  <div className="post-actions">
                    <Row justify="space-between" align="middle">
                      <Col>
                        <Space size="large">
                          <Button
                            type="text"
                            icon={post.isLiked ? <HeartFilled style={{ color: '#f5222d' }} /> : <HeartOutlined />}
                            onClick={() => handleLike(post.id)}
                          >
                            {post.likes}
                          </Button>
                          <Button
                            type="text"
                            icon={<MessageOutlined />}
                            onClick={() => handlePostSelect(post)}
                          >
                            {post.comments}
                          </Button>
                          <Button
                            type="text"
                            icon={<EyeOutlined />}
                          >
                            {post.views}
                          </Button>
                          <Button
                            type="text"
                            icon={<ShareAltOutlined />}
                          >
                            分享
                          </Button>
                        </Space>
                      </Col>
                      <Col>
                        <Button
                          type="text"
                          icon={<BookOutlined />}
                          onClick={() => handleBookmark(post.id)}
                          style={{ color: post.isBookmarked ? '#faad14' : undefined }}
                        >
                          {post.isBookmarked ? '已收藏' : '收藏'}
                        </Button>
                      </Col>
                    </Row>
                  </div>
                </Card>
              ))}
            </div>
          </Col>

          {/* 右侧边栏 */}
          <Col xs={24} lg={8}>
            <div className="community-sidebar">
              {/* 搜索 */}
              <Card title="搜索" className="mb-4">
                <Input.Search
                  placeholder="搜索帖子、标签或用户"
                  onSearch={setSearchText}
                  allowClear
                />
              </Card>

              {/* 热门标签 */}
              <Card title="热门标签" className="mb-4">
                <div className="hot-tags">
                  <Tag color="red" className="mb-2">三亚湾</Tag>
                  <Tag color="orange" className="mb-2">天涯海角</Tag>
                  <Tag color="green" className="mb-2">南山</Tag>
                  <Tag color="blue" className="mb-2">攻略</Tag>
                  <Tag color="purple" className="mb-2">摄影</Tag>
                  <Tag color="cyan" className="mb-2">美食</Tag>
                  <Tag color="magenta" className="mb-2">住宿</Tag>
                  <Tag color="lime" className="mb-2">交通</Tag>
                </div>
              </Card>

              {/* 活跃用户 */}
              <Card title="活跃用户" className="mb-4">
                <List
                  size="small"
                  dataSource={[
                    { name: '旅行者小王', level: 5, posts: 25 },
                    { name: '摄影爱好者', level: 3, posts: 18 },
                    { name: '文化探索者', level: 4, posts: 22 },
                    { name: '美食达人', level: 2, posts: 15 }
                  ]}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} />}
                        title={
                          <Space>
                            <Text>{item.name}</Text>
                            <Badge count={item.level} style={{ backgroundColor: '#52c41a' }} />
                          </Space>
                        }
                        description={`发布 ${item.posts} 篇内容`}
                      />
                    </List.Item>
                  )}
                />
              </Card>

              {/* 社区统计 */}
              <Card title="社区统计">
                <div className="community-stats">
                  <Row gutter={16}>
                    <Col span={12}>
                      <div className="stat-item text-center">
                        <Title level={3}>1,234</Title>
                        <Text type="secondary">总用户</Text>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className="stat-item text-center">
                        <Title level={3}>5,678</Title>
                        <Text type="secondary">总帖子</Text>
                      </div>
                    </Col>
                  </Row>
                  <Divider />
                  <Row gutter={16}>
                    <Col span={12}>
                      <div className="stat-item text-center">
                        <Title level={3}>12,345</Title>
                        <Text type="secondary">总评论</Text>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className="stat-item text-center">
                        <Title level={3}>89,012</Title>
                        <Text type="secondary">总浏览</Text>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      </div>

      {/* 发布帖子模态框 */}
      <Modal
        title="发布新内容"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreatePost}
        >
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入标题" />
          </Form.Item>

          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select placeholder="请选择分类">
              <Option value="游记">游记</Option>
              <Option value="攻略">攻略</Option>
              <Option value="问答">问答</Option>
              <Option value="分享">分享</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入内容' }]}
          >
            <TextArea 
              rows={6} 
              placeholder="分享您的旅行体验..."
            />
          </Form.Item>

          <Form.Item
            name="tags"
            label="标签"
          >
            <Select
              mode="tags"
              placeholder="添加标签"
              style={{ width: '100%' }}
            >
              <Option value="三亚湾">三亚湾</Option>
              <Option value="天涯海角">天涯海角</Option>
              <Option value="南山">南山</Option>
              <Option value="攻略">攻略</Option>
              <Option value="摄影">摄影</Option>
              <Option value="美食">美食</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="images"
            label="图片"
          >
            <Upload
              listType="picture-card"
              maxCount={9}
              beforeUpload={() => false}
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>上传图片</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                发布
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 评论模态框 */}
      <Modal
        title={`评论 - ${selectedPost?.title}`}
        open={commentModalVisible}
        onCancel={() => setCommentModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedPost && (
          <div className="comments-section">
            {/* 原帖内容 */}
            <Card className="mb-4">
              <div className="post-summary">
                <Title level={5}>{selectedPost.title}</Title>
                <Paragraph ellipsis={{ rows: 3 }}>
                  {selectedPost.content}
                </Paragraph>
              </div>
            </Card>

            {/* 发表评论 */}
            <Card title="发表评论" className="mb-4">
              <Form
                form={commentForm}
                onFinish={handleAddComment}
              >
                <Form.Item
                  name="content"
                  rules={[{ required: true, message: '请输入评论内容' }]}
                >
                  <TextArea 
                    rows={3} 
                    placeholder="写下您的评论..."
                  />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" icon={<SendOutlined />}>
                    发表评论
                  </Button>
                </Form.Item>
              </Form>
            </Card>

            {/* 评论列表 */}
            <Card title={`评论 (${comments.length})`}>
              <List
                dataSource={comments}
                renderItem={comment => (
                  <List.Item>
                    <Comment
                      author={comment.author.name}
                      avatar={<Avatar src={comment.author.avatar} />}
                      content={comment.content}
                      datetime={comment.createdAt}
                      actions={[
                        <Button type="text" icon={<LikeOutlined />}>
                          {comment.likes}
                        </Button>,
                        <Button type="text" icon={<MessageOutlined />}>
                          回复
                        </Button>
                      ]}
                    />
                    {comment.replies.length > 0 && (
                      <div className="replies ml-8 mt-2">
                        {comment.replies.map(reply => (
                          <Comment
                            key={reply.id}
                            author={reply.author.name}
                            avatar={<Avatar src={reply.author.avatar} size="small" />}
                            content={reply.content}
                            datetime={reply.createdAt}
                            actions={[
                              <Button type="text" icon={<LikeOutlined />} size="small">
                                {reply.likes}
                              </Button>
                            ]}
                          />
                        ))}
                      </div>
                    )}
                  </List.Item>
                )}
              />
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CommunityPage; 