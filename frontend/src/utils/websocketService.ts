// WebSocket实时数据推送服务
export interface WebSocketMessage {
  type: 'data' | 'error' | 'ping' | 'pong';
  data?: any;
  error?: string;
  timestamp: number;
}

export interface WebSocketConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  compression?: boolean;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private messageHandlers: Map<string, (data: any) => void> = new Map();
  private connectionState: 'connecting' | 'connected' | 'disconnected' | 'reconnecting' = 'disconnected';

  constructor(config: WebSocketConfig) {
    this.config = {
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      compression: true,
      ...config
    };
  }

  /**
   * 连接WebSocket
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.connectionState = 'connecting';
        this.ws = new WebSocket(this.config.url);

        this.ws.onopen = () => {
          console.log('WebSocket连接已建立');
          this.connectionState = 'connected';
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket连接已关闭:', event.code, event.reason);
          this.connectionState = 'disconnected';
          this.stopHeartbeat();
          this.handleReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket连接错误:', error);
          this.connectionState = 'disconnected';
          reject(error);
        };

      } catch (error) {
        console.error('WebSocket连接失败:', error);
        reject(error);
      }
    });
  }

  /**
   * 断开WebSocket连接
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, '正常断开');
      this.ws = null;
    }
    this.connectionState = 'disconnected';
    this.stopHeartbeat();
    this.clearReconnectTimer();
  }

  /**
   * 发送数据
   * @param data 要发送的数据
   * @param type 消息类型
   */
  sendData(data: any, type: string = 'data'): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type,
        data,
        timestamp: Date.now()
      };

      let messageString = JSON.stringify(message);
      
      // 启用压缩
      if (this.config.compression) {
        // 简单的数据压缩（实际项目中可以使用更复杂的压缩算法）
        messageString = this.compressData(messageString);
      }

      this.ws.send(messageString);
    } else {
      console.warn('WebSocket未连接，无法发送数据');
    }
  }

  /**
   * 订阅消息
   * @param type 消息类型
   * @param handler 处理函数
   */
  subscribe(type: string, handler: (data: any) => void): void {
    this.messageHandlers.set(type, handler);
  }

  /**
   * 取消订阅
   * @param type 消息类型
   */
  unsubscribe(type: string): void {
    this.messageHandlers.delete(type);
  }

  /**
   * 获取连接状态
   */
  getConnectionState(): string {
    return this.connectionState;
  }

  /**
   * 检查是否已连接
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(event: MessageEvent): void {
    try {
      let messageString = event.data;
      
      // 解压缩数据
      if (this.config.compression) {
        messageString = this.decompressData(messageString);
      }

      const message: WebSocketMessage = JSON.parse(messageString);
      
      // 处理心跳消息
      if (message.type === 'ping') {
        this.sendData(null, 'pong');
        return;
      }

      if (message.type === 'pong') {
        return;
      }

      // 调用对应的消息处理器
      const handler = this.messageHandlers.get(message.type);
      if (handler) {
        handler(message.data);
      }

    } catch (error) {
      console.error('处理WebSocket消息失败:', error);
    }
  }

  /**
   * 处理重连
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts!) {
      console.error('WebSocket重连次数已达上限');
      return;
    }

    this.connectionState = 'reconnecting';
    this.reconnectAttempts++;

    console.log(`WebSocket重连尝试 ${this.reconnectAttempts}/${this.config.maxReconnectAttempts}`);

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch((error) => {
        console.error('WebSocket重连失败:', error);
        this.handleReconnect();
      });
    }, this.config.reconnectInterval);
  }

  /**
   * 开始心跳
   */
  private startHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }

    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        this.sendData(null, 'ping');
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * 停止心跳
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * 清除重连定时器
   */
  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * 简单的数据压缩
   */
  private compressData(data: string): string {
    // 这里可以实现更复杂的压缩算法
    // 目前只是简单的字符串优化
    return data.replace(/\s+/g, ' ').trim();
  }

  /**
   * 简单的数据解压缩
   */
  private decompressData(data: string): string {
    // 这里可以实现更复杂的解压缩算法
    return data;
  }
}

// 创建全局WebSocket服务实例
export const createWebSocketService = (config: WebSocketConfig): WebSocketService => {
  return new WebSocketService(config);
};

// 实时数据推送服务
export class RealtimeDataService {
  private wsService: WebSocketService;
  private dataCache: Map<string, any> = new Map();
  private subscribers: Map<string, Set<(data: any) => void>> = new Map();

  constructor(wsUrl: string) {
    this.wsService = createWebSocketService({
      url: wsUrl,
      reconnectInterval: 3000,
      maxReconnectAttempts: 20,
      heartbeatInterval: 30000,
      compression: true
    });

    this.setupMessageHandlers();
  }

  /**
   * 连接服务
   */
  async connect(): Promise<void> {
    await this.wsService.connect();
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    this.wsService.disconnect();
  }

  /**
   * 订阅实时数据
   * @param dataType 数据类型
   * @param callback 回调函数
   */
  subscribe(dataType: string, callback: (data: any) => void): () => void {
    if (!this.subscribers.has(dataType)) {
      this.subscribers.set(dataType, new Set());
    }

    this.subscribers.get(dataType)!.add(callback);

    // 返回取消订阅函数
    return () => {
      this.subscribers.get(dataType)?.delete(callback);
    };
  }

  /**
   * 获取缓存的数据
   * @param dataType 数据类型
   */
  getCachedData(dataType: string): any {
    return this.dataCache.get(dataType);
  }

  /**
   * 设置消息处理器
   */
  private setupMessageHandlers(): void {
    this.wsService.subscribe('data', (data) => {
      this.handleRealtimeData(data);
    });

    this.wsService.subscribe('error', (error) => {
      console.error('实时数据错误:', error);
    });
  }

  /**
   * 处理实时数据
   */
  private handleRealtimeData(data: any): void {
    const { type, payload } = data;
    
    // 更新缓存
    this.dataCache.set(type, payload);

    // 通知订阅者
    const subscribers = this.subscribers.get(type);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(payload);
        } catch (error) {
          console.error('实时数据回调执行失败:', error);
        }
      });
    }
  }

  /**
   * 获取连接状态
   */
  getConnectionState(): string {
    return this.wsService.getConnectionState();
  }

  /**
   * 检查是否已连接
   */
  isConnected(): boolean {
    return this.wsService.isConnected();
  }
} 