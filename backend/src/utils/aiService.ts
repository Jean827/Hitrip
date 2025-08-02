import { KnowledgeBase } from '../models/CustomerService';
import { Op, Sequelize } from 'sequelize';
import sequelize from '../config/sequelize';

// 在文件开头添加对话状态管理
interface ConversationContext {
  sessionId: string;
  messages: Array<{
    role: 'user' | 'bot';
    content: string;
    timestamp: Date;
    category?: string;
    questionType?: string;
    intent?: string;
    confidence?: number;
  }>;
  currentTopic?: string;
  userIntent?: string;
  lastQuestion?: string;
  conversationFlow?: string;
  userPreferences?: {
    language?: string;
    detailLevel?: 'brief' | 'detailed';
    responseStyle?: 'formal' | 'casual';
  };
  contextMemory?: {
    mentionedProducts?: string[];
    mentionedIssues?: string[];
    userActions?: string[];
    preferences?: any;
  };
}

// 对话状态存储
const conversationContexts = new Map<string, ConversationContext>();

// 扩展常见问题关键词映射，增加更多场景
const COMMON_QUESTIONS = {
  '订单': ['订单', '购买', '付款', '支付', '购买流程', '下单', '订单号', '订单状态', '订单查询'],
  '退款': ['退款', '退货', '取消', '退钱', '退款流程', '退换货', '退款申请', '退款时间', '退款条件'],
  '物流': ['物流', '快递', '配送', '发货', '收货', '运输', '物流信息', '快递单号', '配送时间', '收货地址'],
  '商品': ['商品', '产品', '价格', '质量', '规格', '库存', '商品详情', '商品评价', '商品图片', '商品分类'],
  '账户': ['账户', '注册', '登录', '密码', '个人信息', '设置', '实名认证', '手机绑定', '邮箱绑定', '安全设置'],
  '优惠': ['优惠', '折扣', '促销', '活动', '优惠券', '积分', '满减', '限时优惠', '会员优惠', '新人优惠'],
  '客服': ['客服', '人工', '联系', '电话', '邮箱', '在线客服', '客服时间', '客服电话', '客服邮箱'],
  '支付': ['支付', '付款', '支付宝', '微信支付', '银行卡', '支付失败', '支付安全', '支付方式'],
  '会员': ['会员', 'VIP', '等级', '权益', '会员卡', '会员优惠', '积分', '成长值'],
  '活动': ['活动', '促销', '限时', '秒杀', '团购', '拼团', '抽奖', '签到', '任务'],
};

// 问题类型映射，用于更精确的分类
const QUESTION_TYPES = {
  '查询类': ['怎么', '如何', '哪里', '什么时候', '多久', '查询', '查看', '了解'],
  '操作类': ['怎么', '如何', '操作', '设置', '修改', '添加', '删除', '更新'],
  '问题类': ['为什么', '怎么回事', '出错了', '失败', '异常', '问题', '故障'],
  '建议类': ['建议', '推荐', '最好', '合适', '选择', '比较'],
};

// 用户意图映射
const USER_INTENTS = {
  'clarification': ['什么意思', '没听懂', '再说一遍', '不明白', '听不懂', '解释一下'],
  'continuation': ['还有', '另外', '其他', '还有吗', '继续', '接着说'],
  'confirmation': ['是吗', '对吗', '确认', '真的吗', '确定吗', '是这样吗'],
  'gratitude': ['谢谢', '感谢', '好的', '明白了', '知道了', '谢谢您'],
  'farewell': ['再见', '拜拜', '结束', '不聊了', '走了', '下次见'],
  'complaint': ['投诉', '不满', '生气', '愤怒', '失望', '不满意'],
  'urgent': ['急', '紧急', '马上', '立刻', '现在', '立即'],
  'detailed': ['详细', '具体', '更多', '完整', '全面', '详细说明'],
  'simple': ['简单', '简短', '概括', '总结', '要点', '简单说'],
};

// 对话流程状态
const CONVERSATION_FLOWS = {
  'greeting': 'greeting',
  'question_answering': 'question_answering',
  'problem_solving': 'problem_solving',
  'confirmation': 'confirmation',
  'closing': 'closing',
};

// 智能问答服务类
export class AIService {
  /**
   * 智能问答处理
   * @param question 用户问题
   * @param userId 用户ID
   * @returns 回答内容
   */
  static async processQuestion(question: string, userId?: number): Promise<{
    answer: string;
    confidence: number;
    source?: string;
    suggestions?: string[];
    category?: string;
    questionType?: string;
  }> {
    try {
      // 1. 问题预处理
      const processedQuestion = this.preprocessQuestion(question);
      
      // 2. 关键词提取
      const keywords = this.extractKeywords(processedQuestion);
      
      // 3. 问题分类
      const category = this.classifyQuestion(processedQuestion);
      const questionType = this.classifyQuestionType(processedQuestion);
      
      // 4. 知识库搜索
      const knowledgeResults = await this.searchKnowledgeBase(keywords, category);
      
      // 5. 生成回答
      const answer = await this.generateAnswer(processedQuestion, knowledgeResults, category, questionType);
      
      // 6. 计算置信度
      const confidence = this.calculateConfidence(keywords, knowledgeResults, category, questionType);
      
      // 7. 生成建议问题
      const suggestions = this.generateSuggestions(category, questionType);
      
      return {
        answer: answer.content,
        confidence: confidence,
        source: answer.source,
        suggestions: suggestions,
        category: category,
        questionType: questionType,
      };
    } catch (error) {
      console.error('AI服务处理问题失败:', error);
      return {
        answer: '抱歉，我现在无法回答您的问题。请稍后再试或联系人工客服。',
        confidence: 0,
        suggestions: ['联系人工客服', '查看帮助中心', '重新提问'],
      };
    }
  }

  /**
   * 处理多轮对话 - 增强版本
   * @param question 用户问题
   * @param sessionId 会话ID
   * @param userId 用户ID
   * @returns 回答内容
   */
  static async processConversation(
    question: string, 
    sessionId: string, 
    userId?: number
  ): Promise<{
    answer: string;
    confidence: number;
    source?: string;
    suggestions?: string[];
    category?: string;
    questionType?: string;
    context?: any;
    intent?: string;
    flow?: string;
  }> {
    try {
      // 获取或创建对话上下文
      let context = conversationContexts.get(sessionId);
      if (!context) {
        context = {
          sessionId,
          messages: [],
          currentTopic: undefined,
          userIntent: undefined,
          lastQuestion: undefined,
          conversationFlow: CONVERSATION_FLOWS.greeting,
          userPreferences: {
            language: 'zh-CN',
            detailLevel: 'detailed',
            responseStyle: 'casual',
          },
          contextMemory: {
            mentionedProducts: [],
            mentionedIssues: [],
            userActions: [],
            preferences: {},
          },
        };
        conversationContexts.set(sessionId, context);
      }

      // 分析用户意图和上下文
      const intent = this.analyzeUserIntent(question, context);
      const flow = this.determineConversationFlow(question, context, intent);
      const enhancedQuestion = this.enhanceQuestionWithContext(question, context);

      // 处理问题
      const result = await this.processQuestion(enhancedQuestion, userId);

      // 根据意图和流程调整回答
      const adjustedAnswer = this.adjustAnswerBasedOnIntent(result.answer, intent, context);
      const adjustedSuggestions = this.adjustSuggestionsBasedOnFlow(result.suggestions, flow, context);

      // 更新对话上下文
      context.messages.push({
        role: 'user',
        content: question,
        timestamp: new Date(),
        category: result.category,
        questionType: result.questionType,
        intent: intent,
        confidence: result.confidence,
      });

      context.messages.push({
        role: 'bot',
        content: adjustedAnswer,
        timestamp: new Date(),
        category: result.category,
        questionType: result.questionType,
        intent: intent,
        confidence: result.confidence,
      });

      // 更新上下文信息
      this.updateContextMemory(context, question, result, intent);
      context.currentTopic = result.category;
      context.userIntent = intent;
      context.lastQuestion = question;
      context.conversationFlow = flow;

      // 如果对话超过20轮，清理早期消息但保留关键信息
      if (context.messages.length > 40) {
        this.cleanupOldMessages(context);
      }

      return {
        answer: adjustedAnswer,
        confidence: result.confidence,
        source: result.source,
        suggestions: adjustedSuggestions,
        category: result.category,
        questionType: result.questionType,
        context: {
          currentTopic: context.currentTopic,
          userIntent: context.userIntent,
          messageCount: context.messages.length,
          flow: context.conversationFlow,
        },
        intent: intent,
        flow: flow,
      };
    } catch (error) {
      console.error('处理多轮对话失败:', error);
      return {
        answer: '抱歉，我现在无法回答您的问题。请稍后再试或联系人工客服。',
        confidence: 0,
        suggestions: ['联系人工客服', '查看帮助中心', '重新提问'],
      };
    }
  }

  /**
   * 问题预处理 - 优化版本
   */
  private static preprocessQuestion(question: string): string {
    // 去除多余空格
    let processed = question.trim().replace(/\s+/g, ' ');
    
    // 去除特殊字符，保留中文、英文、数字和常用标点
    processed = processed.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s，。？！；：""''（）【】]/g, '');
    
    // 标准化标点符号
    processed = processed
      .replace(/[？?]/g, '？')
      .replace(/[！!]/g, '！')
      .replace(/[，,]/g, '，')
      .replace(/[。.]/g, '。');
    
    // 去除重复字符（如：啊啊啊 -> 啊）
    processed = processed.replace(/(.)\1{2,}/g, '$1$1');
    
    // 转换为小写
    processed = processed.toLowerCase();
    
    return processed;
  }

  /**
   * 提取关键词 - 优化版本
   */
  private static extractKeywords(question: string): string[] {
    const keywords: string[] = [];
    
    // 从常见问题映射中提取关键词
    for (const [category, words] of Object.entries(COMMON_QUESTIONS)) {
      for (const word of words) {
        if (question.includes(word)) {
          keywords.push(word);
          keywords.push(category);
        }
      }
    }
    
    // 提取中文词组（2-6个字符）
    const chineseWords = question.match(/[\u4e00-\u9fa5]{2,6}/g) || [];
    keywords.push(...chineseWords);
    
    // 提取英文单词
    const englishWords = question.match(/[a-zA-Z]{3,}/g) || [];
    keywords.push(...englishWords);
    
    // 提取数字
    const numbers = question.match(/\d+/g) || [];
    keywords.push(...numbers);
    
    // 去重并过滤太短的词
    const uniqueKeywords = [...new Set(keywords)].filter(word => word.length >= 2);
    
    return uniqueKeywords;
  }

  /**
   * 搜索知识库 - 优化版本
   */
  private static async searchKnowledgeBase(keywords: string[], category?: string): Promise<any[]> {
    try {
      const conditions = keywords.map(keyword => ({
        [Op.or]: [
          { title: { [Op.like]: `%${keyword}%` } },
          { content: { [Op.like]: `%${keyword}%` } },
          { keywords: { [Op.contains]: [keyword] } },
          { tags: { [Op.contains]: [keyword] } },
        ],
      }));

      const whereCondition: any = {
        isActive: true,
        [Op.or]: conditions,
      };

      // 如果确定了分类，优先搜索该分类的内容
      if (category && category !== '其他') {
        whereCondition.category = category;
      }

      const results = await KnowledgeBase.findAll({
        where: whereCondition,
        order: [
          ['priority', 'DESC'], // 优先级高的排在前面
          ['updatedAt', 'DESC'],
        ],
        limit: 10, // 增加搜索结果数量
      });

      // 如果没有找到结果，尝试模糊搜索
      if (results.length === 0) {
        const fuzzyConditions = keywords.slice(0, 3).map(keyword => ({
          [Op.or]: [
            { title: { [Op.like]: `%${keyword}%` } },
            { content: { [Op.like]: `%${keyword}%` } },
          ],
        }));

        const fuzzyResults = await KnowledgeBase.findAll({
          where: {
            isActive: true,
            [Op.or]: fuzzyConditions,
          },
          order: [['updatedAt', 'DESC']],
          limit: 5,
        });

        return fuzzyResults.map((result: any) => result.toJSON());
      }

      return results.map((result: any) => result.toJSON());
    } catch (error) {
      console.error('搜索知识库失败:', error);
      return [];
    }
  }

  /**
   * 问题分类 - 优化版本
   */
  private static classifyQuestion(question: string): string {
    // 计算每个分类的匹配分数
    const categoryScores: { [key: string]: number } = {};
    
    for (const [category, keywords] of Object.entries(COMMON_QUESTIONS)) {
      let score = 0;
      for (const keyword of keywords) {
        if (question.includes(keyword)) {
          score += 1;
          // 关键词越长，权重越高
          score += keyword.length * 0.1;
        }
      }
      categoryScores[category] = score;
    }
    
    // 找到得分最高的分类
    const bestCategory = Object.entries(categoryScores)
      .sort(([,a], [,b]) => b - a)[0];
    
    return bestCategory && bestCategory[1] > 0 ? bestCategory[0] : '其他';
  }

  /**
   * 问题类型分类
   */
  private static classifyQuestionType(question: string): string {
    for (const [type, keywords] of Object.entries(QUESTION_TYPES)) {
      for (const keyword of keywords) {
        if (question.includes(keyword)) {
          return type;
        }
      }
    }
    return '一般类';
  }

  /**
   * 生成回答 - 优化版本
   */
  private static async generateAnswer(
    question: string,
    knowledgeResults: any[],
    category: string,
    questionType: string
  ): Promise<{ content: string; source?: string }> {
    // 如果有知识库匹配结果，使用知识库内容
    if (knowledgeResults.length > 0) {
      const bestMatch = knowledgeResults[0];
      
      // 根据问题类型调整回答格式
      let content = bestMatch.content;
      if (questionType === '操作类') {
        content = `操作步骤：\n${content}`;
      } else if (questionType === '问题类') {
        content = `问题解决方案：\n${content}`;
      } else if (questionType === '建议类') {
        content = `建议：\n${content}`;
      }
      
      return {
        content: content,
        source: bestMatch.title,
      };
    }

    // 根据分类和问题类型生成更精确的默认回答
    const defaultAnswers: { [key: string]: { [key: string]: string } } = {
      '订单': {
        '查询类': '您可以在"我的订单"页面查看所有订单信息，包括订单状态、物流信息等。',
        '操作类': '请按照以下步骤操作：1. 进入"我的订单"页面 2. 找到对应订单 3. 点击查看详情',
        '问题类': '如果订单出现问题，请提供订单号，我们的客服会尽快为您处理。',
        '一般类': '关于订单问题，您可以查看订单详情页面，或者联系我们的客服人员获取帮助。',
      },
      '退款': {
        '查询类': '退款申请提交后，我们会在1-3个工作日内处理，退款到账时间取决于您的支付方式。',
        '操作类': '退款操作步骤：1. 进入订单详情 2. 点击"申请退款" 3. 选择退款原因 4. 提交申请',
        '问题类': '如果退款遇到问题，请提供订单号和具体问题，我们会优先处理。',
        '一般类': '退款申请可以通过订单详情页面进行操作，我们会在1-3个工作日内处理您的退款申请。',
      },
      '物流': {
        '查询类': '物流信息可以在订单详情页面查看，包括快递单号、配送状态、预计到达时间等。',
        '操作类': '查看物流步骤：1. 进入订单详情 2. 点击"查看物流" 3. 查看配送进度',
        '问题类': '如果物流出现问题，请联系快递公司或我们的客服人员。',
        '一般类': '物流信息可以在订单详情页面查看，如有疑问请联系我们的客服人员。',
      },
      '商品': {
        '查询类': '商品详细信息包括价格、规格、库存、评价等，都可以在商品详情页面查看。',
        '操作类': '购买商品步骤：1. 选择商品规格 2. 加入购物车 3. 确认订单 4. 完成支付',
        '问题类': '如果商品有问题，请在收货后7天内申请退换货。',
        '一般类': '商品相关信息可以在商品详情页面查看，包括价格、规格、库存等信息。',
      },
      '账户': {
        '查询类': '账户信息可以在个人中心查看，包括基本信息、安全设置、绑定信息等。',
        '操作类': '修改密码步骤：1. 进入个人中心 2. 点击"安全设置" 3. 选择"修改密码" 4. 验证身份后修改',
        '问题类': '如果账户出现问题，请及时联系客服，我们会协助您解决。',
        '一般类': '账户相关问题可以通过个人中心进行设置，或联系客服获取帮助。',
      },
      '优惠': {
        '查询类': '优惠活动信息可以在首页活动专区查看，包括优惠券、积分、满减活动等。',
        '操作类': '使用优惠券步骤：1. 选择商品 2. 进入结算页面 3. 选择可用优惠券 4. 确认使用',
        '问题类': '如果优惠券无法使用，请检查使用条件和有效期。',
        '一般类': '优惠活动信息可以在首页活动专区查看，或关注我们的官方通知。',
      },
      '客服': {
        '查询类': '我们的客服团队工作时间为9:00-21:00，您可以通过在线客服或电话联系我们。',
        '操作类': '联系客服方式：1. 在线客服：点击页面右下角客服图标 2. 电话客服：400-xxx-xxxx',
        '问题类': '我们会尽快处理您的问题，请耐心等待或选择其他联系方式。',
        '一般类': '我们的客服团队随时为您服务，您可以通过在线客服或电话联系我们。',
      },
    };

    const categoryAnswers = defaultAnswers[category] || defaultAnswers['客服'];
    const answer = categoryAnswers[questionType] || categoryAnswers['一般类'];
    
    return {
      content: answer,
    };
  }

  /**
   * 计算置信度 - 优化版本
   */
  private static calculateConfidence(
    keywords: string[], 
    knowledgeResults: any[], 
    category: string,
    questionType: string
  ): number {
    if (knowledgeResults.length === 0) {
      return 0.3; // 低置信度
    }

    let confidence = 0;

    // 关键词匹配分数
    const keywordScore = Math.min(keywords.length * 0.1, 0.3);
    confidence += keywordScore;

    // 知识库结果分数
    const resultScore = Math.min(knowledgeResults.length * 0.15, 0.4);
    confidence += resultScore;

    // 分类匹配分数
    if (category !== '其他') {
      confidence += 0.2;
    }

    // 问题类型匹配分数
    if (questionType !== '一般类') {
      confidence += 0.1;
    }

    // 最高置信度限制
    return Math.min(confidence, 0.95);
  }

  /**
   * 生成建议问题 - 优化版本
   */
  private static generateSuggestions(category: string, questionType: string): string[] {
    const suggestions: { [key: string]: { [key: string]: string[] } } = {
      '订单': {
        '查询类': ['如何查看订单状态？', '订单多久发货？', '如何查询订单号？'],
        '操作类': ['如何取消订单？', '如何修改收货地址？', '如何申请发票？'],
        '问题类': ['订单出错了怎么办？', '订单被取消了怎么办？', '订单状态异常怎么办？'],
        '一般类': ['如何查看订单状态？', '如何取消订单？', '订单多久发货？'],
      },
      '退款': {
        '查询类': ['退款多久到账？', '如何查询退款进度？', '退款条件是什么？'],
        '操作类': ['如何申请退款？', '如何选择退款方式？', '如何填写退款原因？'],
        '问题类': ['退款失败了怎么办？', '退款金额不对怎么办？', '退款被拒绝了怎么办？'],
        '一般类': ['退款多久到账？', '如何申请退款？', '退款条件是什么？'],
      },
      '物流': {
        '查询类': ['物流信息在哪里查看？', '多久能收到货？', '支持哪些快递？'],
        '操作类': ['如何修改收货地址？', '如何联系快递员？', '如何签收商品？'],
        '问题类': ['物流信息不更新怎么办？', '快递丢失了怎么办？', '配送超时了怎么办？'],
        '一般类': ['物流信息在哪里查看？', '多久能收到货？', '支持哪些快递？'],
      },
      '商品': {
        '查询类': ['商品质量如何？', '有售后服务吗？', '支持退换货吗？'],
        '操作类': ['如何购买商品？', '如何选择商品规格？', '如何添加购物车？'],
        '问题类': ['商品有质量问题怎么办？', '商品与描述不符怎么办？', '商品缺货了怎么办？'],
        '一般类': ['商品质量如何？', '有售后服务吗？', '支持退换货吗？'],
      },
      '账户': {
        '查询类': ['如何修改密码？', '如何绑定手机？', '如何实名认证？'],
        '操作类': ['如何注册账户？', '如何修改个人信息？', '如何设置支付密码？'],
        '问题类': ['账户被盗了怎么办？', '密码忘记了怎么办？', '手机号换了怎么办？'],
        '一般类': ['如何修改密码？', '如何绑定手机？', '如何实名认证？'],
      },
      '优惠': {
        '查询类': ['有什么优惠活动？', '如何使用优惠券？', '积分怎么获得？'],
        '操作类': ['如何领取优惠券？', '如何使用积分？', '如何参与活动？'],
        '问题类': ['优惠券无法使用怎么办？', '积分过期了怎么办？', '活动结束了怎么办？'],
        '一般类': ['有什么优惠活动？', '如何使用优惠券？', '积分怎么获得？'],
      },
      '客服': {
        '查询类': ['客服工作时间？', '如何联系客服？', '在线客服在哪？'],
        '操作类': ['如何联系客服？', '如何提交工单？', '如何反馈问题？'],
        '问题类': ['客服不理我怎么办？', '问题没解决怎么办？', '投诉怎么处理？'],
        '一般类': ['客服工作时间？', '如何联系客服？', '在线客服在哪？'],
      },
    };

    const categorySuggestions = suggestions[category] || suggestions['客服'];
    return categorySuggestions[questionType] || categorySuggestions['一般类'];
  }

  /**
   * 分析用户意图 - 增强版本
   */
  private static analyzeUserIntent(question: string, context: ConversationContext): string {
    const question_lower = question.toLowerCase();
    
    // 检查各种意图
    for (const [intent, keywords] of Object.entries(USER_INTENTS)) {
      for (const keyword of keywords) {
        if (question_lower.includes(keyword)) {
          return intent;
        }
      }
    }
    
    // 检查上下文相关的意图
    if (context.lastQuestion && question_lower.length < 10) {
      // 短问题可能是澄清或确认
      if (question_lower.includes('什么') || question_lower.includes('怎么')) {
        return 'clarification';
      }
      if (question_lower.includes('是') || question_lower.includes('对')) {
        return 'confirmation';
      }
    }
    
    // 检查是否是情绪表达
    if (question_lower.includes('生气') || question_lower.includes('愤怒') || question_lower.includes('不满')) {
      return 'complaint';
    }
    
    return 'new_question';
  }

  /**
   * 确定对话流程
   */
  private static determineConversationFlow(
    question: string, 
    context: ConversationContext, 
    intent: string
  ): string {
    // 如果是新会话
    if (context.messages.length === 0) {
      return CONVERSATION_FLOWS.greeting;
    }
    
    // 根据意图确定流程
    switch (intent) {
      case 'clarification':
        return CONVERSATION_FLOWS.question_answering;
      case 'confirmation':
        return CONVERSATION_FLOWS.confirmation;
      case 'complaint':
        return CONVERSATION_FLOWS.problem_solving;
      case 'farewell':
        return CONVERSATION_FLOWS.closing;
      case 'gratitude':
        return context.conversationFlow || CONVERSATION_FLOWS.question_answering;
      default:
        return CONVERSATION_FLOWS.question_answering;
    }
  }

  /**
   * 根据意图调整回答
   */
  private static adjustAnswerBasedOnIntent(
    answer: string, 
    intent: string, 
    context: ConversationContext
  ): string {
    switch (intent) {
      case 'clarification':
        return `让我重新解释一下：${answer}`;
      case 'confirmation':
        return `是的，${answer}`;
      case 'gratitude':
        return `${answer}\n\n很高兴能帮到您！如果还有其他问题，随时告诉我。`;
      case 'complaint':
        return `非常抱歉给您带来不便。${answer}\n\n我们会尽快处理您的问题，请稍等。`;
      case 'urgent':
        return `我理解您的紧急情况。${answer}\n\n我们会优先处理您的问题。`;
      case 'detailed':
        return `${answer}\n\n详细说明：${this.getDetailedExplanation(context.currentTopic)}`;
      case 'simple':
        return this.getSimpleAnswer(answer, context.currentTopic);
      default:
        return answer;
    }
  }

  /**
   * 根据流程调整建议
   */
  private static adjustSuggestionsBasedOnFlow(
    suggestions: string[], 
    flow: string, 
    context: ConversationContext
  ): string[] {
    switch (flow) {
      case CONVERSATION_FLOWS.greeting:
        return ['有什么可以帮助您的？', '您想了解什么？', '请告诉我您的问题'];
      case CONVERSATION_FLOWS.problem_solving:
        return ['还有其他问题吗？', '需要进一步帮助吗？', '问题解决了吗？'];
      case CONVERSATION_FLOWS.closing:
        return ['再见！', '欢迎下次再来！', '祝您愉快！'];
      default:
        return suggestions;
    }
  }

  /**
   * 更新上下文记忆
   */
  private static updateContextMemory(
    context: ConversationContext, 
    question: string, 
    result: any, 
    intent: string
  ): void {
    // 提取提到的产品
    const productKeywords = ['商品', '产品', '物品', '东西'];
    for (const keyword of productKeywords) {
      if (question.includes(keyword)) {
        const products = question.match(/[\u4e00-\u9fa5]+/g) || [];
        context.contextMemory!.mentionedProducts.push(...products);
      }
    }
    
    // 提取提到的问题
    const issueKeywords = ['问题', '故障', '错误', '异常'];
    for (const keyword of issueKeywords) {
      if (question.includes(keyword)) {
        const issues = question.match(/[\u4e00-\u9fa5]+/g) || [];
        context.contextMemory!.mentionedIssues.push(...issues);
      }
    }
    
    // 记录用户行为
    context.contextMemory!.userActions.push(intent);
    
    // 更新用户偏好
    if (question.length < 10) {
      context.userPreferences!.detailLevel = 'brief';
    } else if (question.length > 50) {
      context.userPreferences!.detailLevel = 'detailed';
    }
  }

  /**
   * 清理旧消息但保留关键信息
   */
  private static cleanupOldMessages(context: ConversationContext): void {
    // 保留最近10条消息
    const recentMessages = context.messages.slice(-10);
    
    // 保留关键信息
    const importantMessages = context.messages.filter(msg => 
      msg.intent === 'complaint' || 
      msg.intent === 'urgent' || 
      msg.confidence && msg.confidence > 0.8
    );
    
    // 合并重要消息和最近消息
    const allImportantMessages = [...importantMessages, ...recentMessages];
    const uniqueMessages = allImportantMessages.filter((msg, index, arr) => 
      arr.findIndex(m => m.content === msg.content) === index
    );
    
    context.messages = uniqueMessages.slice(-20); // 最多保留20条
  }

  /**
   * 获取详细解释
   */
  private static getDetailedExplanation(topic?: string): string {
    const explanations: { [key: string]: string } = {
      '订单': '订单处理流程包括：1. 确认订单信息 2. 支付验证 3. 库存检查 4. 发货准备 5. 物流配送 6. 签收确认',
      '退款': '退款流程包括：1. 申请退款 2. 审核处理 3. 商品退回 4. 退款到账 5. 完成退款',
      '物流': '物流配送包括：1. 订单确认 2. 仓库拣货 3. 包装发货 4. 物流运输 5. 配送上门 6. 签收确认',
      '商品': '商品信息包括：1. 基本信息 2. 规格参数 3. 价格信息 4. 库存状态 5. 用户评价 6. 售后服务',
      '账户': '账户管理包括：1. 基本信息 2. 安全设置 3. 绑定信息 4. 隐私设置 5. 通知设置 6. 账户注销',
    };
    
    return explanations[topic || '客服'] || '详细说明请参考相关帮助文档或联系客服。';
  }

  /**
   * 获取简化回答
   */
  private static getSimpleAnswer(answer: string, topic?: string): string {
    const simpleAnswers: { [key: string]: string } = {
      '订单': '订单状态可在"我的订单"页面查看。',
      '退款': '退款申请后1-3个工作日处理完成。',
      '物流': '物流信息在订单详情页面查看。',
      '商品': '商品详情在商品页面查看。',
      '账户': '账户信息在个人中心查看。',
    };
    
    return simpleAnswers[topic || '客服'] || answer.split('。')[0] + '。';
  }

  /**
   * 根据上下文增强问题
   */
  private static enhanceQuestionWithContext(question: string, context: ConversationContext): string {
    let enhancedQuestion = question;
    
    // 如果当前有话题，且新问题很短，尝试结合上下文
    if (context.currentTopic && question.length < 10) {
      const lastMessages = context.messages.slice(-4); // 获取最近4条消息
      const relevantContext = lastMessages
        .filter(msg => msg.role === 'user' && msg.category === context.currentTopic)
        .map(msg => msg.content)
        .join(' ');
      
      if (relevantContext) {
        enhancedQuestion = `${relevantContext} ${question}`;
      }
    }
    
    // 如果用户提到了特定产品，添加到问题中
    if (context.contextMemory!.mentionedProducts.length > 0) {
      const products = context.contextMemory!.mentionedProducts.slice(-2).join('、');
      if (!enhancedQuestion.includes(products)) {
        enhancedQuestion = `${enhancedQuestion} 关于${products}`;
      }
    }
    
    return enhancedQuestion;
  }

  /**
   * 获取对话历史
   */
  static getConversationHistory(sessionId: string): ConversationContext | null {
    return conversationContexts.get(sessionId) || null;
  }

  /**
   * 清理对话上下文
   */
  static clearConversationContext(sessionId: string): void {
    conversationContexts.delete(sessionId);
  }

  /**
   * 获取对话统计
   */
  static getConversationStats(): {
    activeSessions: number;
    totalMessages: number;
    averageMessagesPerSession: number;
  } {
    const sessions = Array.from(conversationContexts.values());
    const totalMessages = sessions.reduce((sum, session) => sum + session.messages.length, 0);
    const averageMessages = sessions.length > 0 ? totalMessages / sessions.length : 0;
    
    return {
      activeSessions: sessions.length,
      totalMessages,
      averageMessagesPerSession: Math.round(averageMessages * 100) / 100,
    };
  }

  /**
   * 添加知识库条目
   */
  static async addKnowledgeEntry(data: {
    category: string;
    title: string;
    content: string;
    keywords?: string[];
    tags?: string[];
    priority?: number;
  }): Promise<KnowledgeBase> {
    try {
      return await KnowledgeBase.create({
        ...data,
        keywords: data.keywords || [],
        tags: data.tags || [],
        priority: data.priority || 0,
        isActive: true,
      });
    } catch (error) {
      console.error('添加知识库条目失败:', error);
      throw error;
    }
  }

  /**
   * 更新知识库条目
   */
  static async updateKnowledgeEntry(
    id: number,
    data: Partial<{
      category: string;
      title: string;
      content: string;
      keywords: string[];
      tags: string[];
      priority: number;
      isActive: boolean;
    }>
  ): Promise<KnowledgeBase | null> {
    try {
      const entry = await KnowledgeBase.findByPk(id);
      if (!entry) {
        return null;
      }
      
      await entry.update(data);
      return entry;
    } catch (error) {
      console.error('更新知识库条目失败:', error);
      throw error;
    }
  }

  /**
   * 删除知识库条目
   */
  static async deleteKnowledgeEntry(id: number): Promise<boolean> {
    try {
      const entry = await KnowledgeBase.findByPk(id);
      if (!entry) {
        return false;
      }
      
      await entry.destroy();
      return true;
    } catch (error) {
      console.error('删除知识库条目失败:', error);
      throw error;
    }
  }

  /**
   * 获取知识库统计信息
   */
  static async getKnowledgeStats(): Promise<{
    total: number;
    active: number;
    categories: { [key: string]: number };
  }> {
    try {
      const total = await KnowledgeBase.count();
      const active = await KnowledgeBase.count({ where: { isActive: true } });
      
      const categories = await KnowledgeBase.findAll({
        attributes: [
          'category',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['category'],
        raw: true,
      });

      const categoryStats: { [key: string]: number } = {};
      categories.forEach((item: any) => {
        categoryStats[item.category] = parseInt(item.count);
      });

      return {
        total,
        active,
        categories: categoryStats,
      };
    } catch (error) {
      console.error('获取知识库统计失败:', error);
      return {
        total: 0,
        active: 0,
        categories: {},
      };
    }
  }
}

export default AIService; 