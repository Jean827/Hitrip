import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Heart, 
  Clock, 
  TrendingUp, 
  ShoppingCart, 
  Eye,
  RefreshCw,
  BarChart3
} from 'lucide-react';

interface UserProfile {
  id: string;
  userId: string;
  interests: InterestTag[];
  behaviorPatterns: BehaviorPattern[];
  userValue: number;
  userSegment: string;
  lastUpdated: string;
}

interface InterestTag {
  id: string;
  name: string;
  score: number;
  frequency: number;
}

interface BehaviorPattern {
  patternType: string;
  frequency: number;
  timeSlot: string;
  context: any;
}

interface UserSegment {
  segment: string;
  segmentName: string;
  description: string;
  valueMetrics: {
    totalPurchases: number;
    totalSpent: number;
    avgOrderValue: number;
    purchaseFrequency: number;
    lastPurchaseDate: string | null;
    engagementScore: number;
  };
}

const UserProfilePage: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userSegment, setUserSegment] = useState<UserSegment | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      if (!token || !userId) {
        console.error('未找到用户认证信息');
        return;
      }

      // 获取用户画像
      const profileResponse = await fetch(`/api/user-profiles/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setUserProfile(profileData.data);
      }

      // 获取用户分群信息
      const segmentResponse = await fetch(`/api/user-profiles/${userId}/segments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (segmentResponse.ok) {
        const segmentData = await segmentResponse.json();
        setUserSegment(segmentData.data);
      }
    } catch (error) {
      console.error('加载用户画像失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshUserProfile = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      if (!token || !userId) {
        console.error('未找到用户认证信息');
        return;
      }

      // 更新用户画像
      await fetch(`/api/user-profiles/${userId}/update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // 重新加载数据
      await loadUserProfile();
    } catch (error) {
      console.error('更新用户画像失败:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'vip':
        return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'active':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      case 'new':
        return 'bg-gradient-to-r from-green-500 to-emerald-500';
      case 'inactive':
        return 'bg-gradient-to-r from-gray-500 to-slate-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getBehaviorPatternIcon = (patternType: string) => {
    switch (patternType) {
      case 'time':
        return <Clock className="w-4 h-4" />;
      case 'sequence':
        return <TrendingUp className="w-4 h-4" />;
      case 'page':
        return <Eye className="w-4 h-4" />;
      default:
        return <BarChart3 className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">用户画像分析</h1>
        <Button 
          onClick={refreshUserProfile} 
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? '更新中...' : '更新画像'}
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="interests">兴趣标签</TabsTrigger>
          <TabsTrigger value="patterns">行为模式</TabsTrigger>
          <TabsTrigger value="value">用户价值</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 用户分群卡片 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">用户分群</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userSegment?.segmentName || '未知'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {userSegment?.description || '暂无描述'}
                </p>
                {userSegment && (
                  <Badge className={`mt-2 ${getSegmentColor(userSegment.segment)}`}>
                    {userSegment.segmentName}
                  </Badge>
                )}
              </CardContent>
            </Card>

            {/* 用户价值卡片 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">用户价值</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userProfile?.userValue || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  参与度分数
                </p>
                <Progress value={userProfile?.userValue || 0} className="mt-2" />
              </CardContent>
            </Card>

            {/* 兴趣标签数量 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">兴趣标签</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userProfile?.interests?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  个兴趣分类
                </p>
              </CardContent>
            </Card>

            {/* 行为模式数量 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">行为模式</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userProfile?.behaviorPatterns?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  种行为模式
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 用户价值详情 */}
          {userSegment && (
            <Card>
              <CardHeader>
                <CardTitle>用户价值详情</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {userSegment.valueMetrics.totalPurchases}
                    </div>
                    <div className="text-sm text-muted-foreground">总购买次数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ¥{userSegment.valueMetrics.totalSpent.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">总消费金额</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      ¥{userSegment.valueMetrics.avgOrderValue.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">平均订单价值</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {userSegment.valueMetrics.purchaseFrequency}
                    </div>
                    <div className="text-sm text-muted-foreground">购买频率</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="interests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>兴趣标签分析</CardTitle>
            </CardHeader>
            <CardContent>
              {userProfile?.interests && userProfile.interests.length > 0 ? (
                <div className="space-y-4">
                  {userProfile.interests.map((interest, index) => (
                    <div key={interest.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">{index + 1}</Badge>
                        <div>
                          <div className="font-medium">{interest.name}</div>
                          <div className="text-sm text-muted-foreground">
                            频率: {interest.frequency} 次
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={interest.score * 100} className="w-20" />
                        <span className="text-sm font-medium">
                          {(interest.score * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  暂无兴趣标签数据
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>行为模式分析</CardTitle>
            </CardHeader>
            <CardContent>
              {userProfile?.behaviorPatterns && userProfile.behaviorPatterns.length > 0 ? (
                <div className="space-y-4">
                  {userProfile.behaviorPatterns.map((pattern, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        {getBehaviorPatternIcon(pattern.patternType)}
                        <div className="font-medium">
                          {pattern.patternType === 'time' && '时间模式'}
                          {pattern.patternType === 'sequence' && '行为序列'}
                          {pattern.patternType === 'page' && '页面访问'}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">频率: </span>
                          <span className="font-medium">{pattern.frequency}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">时间段: </span>
                          <span className="font-medium">{pattern.timeSlot}</span>
                        </div>
                      </div>
                      {pattern.context && (
                        <div className="mt-3 p-3 bg-gray-50 rounded text-xs">
                          <div className="font-medium mb-2">详细数据:</div>
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(pattern.context, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  暂无行为模式数据
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="value" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>用户价值评估</CardTitle>
            </CardHeader>
            <CardContent>
              {userSegment ? (
                <div className="space-y-6">
                  {/* 参与度分数 */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">参与度分数</span>
                      <span className="text-sm font-medium">
                        {userSegment.valueMetrics.engagementScore.toFixed(1)}/100
                      </span>
                    </div>
                    <Progress 
                      value={userSegment.valueMetrics.engagementScore} 
                      className="h-3"
                    />
                  </div>

                  {/* 购买行为统计 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <ShoppingCart className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">购买行为</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>总购买次数:</span>
                          <span className="font-medium">{userSegment.valueMetrics.totalPurchases}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>总消费金额:</span>
                          <span className="font-medium">¥{userSegment.valueMetrics.totalSpent.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>平均订单价值:</span>
                          <span className="font-medium">¥{userSegment.valueMetrics.avgOrderValue.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>购买频率:</span>
                          <span className="font-medium">{userSegment.valueMetrics.purchaseFrequency} 次/月</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-green-600" />
                        <span className="font-medium">时间信息</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>最后购买时间:</span>
                          <span className="font-medium">
                            {userSegment.valueMetrics.lastPurchaseDate 
                              ? new Date(userSegment.valueMetrics.lastPurchaseDate).toLocaleDateString()
                              : '暂无'
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>画像更新时间:</span>
                          <span className="font-medium">
                            {userProfile?.lastUpdated 
                              ? new Date(userProfile.lastUpdated).toLocaleDateString()
                              : '未知'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  暂无用户价值数据
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfilePage; 