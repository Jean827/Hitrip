export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIAL_REFUNDED = 'partial_refunded'
}

export enum PaymentMethod {
  WECHAT = 'wechat',
  ALIPAY = 'alipay',
  BANK_CARD = 'bank_card'
}

export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  paymentMethod: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  transactionId?: string;
  paymentTime?: Date;
  refundAmount: number;
  refundTime?: Date;
  refundReason?: string;
  callbackData?: any;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentParams {
  paymentId: string;
  paymentParams: any;
}

export interface PaymentCallback {
  transactionId: string;
  status: 'success' | 'failed';
  amount: number;
}

export interface RefundRequest {
  paymentId: string;
  refundAmount: number;
  refundReason: string;
}

export interface RefundResponse {
  success: boolean;
  refundId?: string;
  message?: string;
} 