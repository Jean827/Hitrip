import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { PaymentMethod, PaymentStatus } from '../../types/payment';

interface PaymentParams {
  orderId: string;
}

const PaymentPage: React.FC = () => {
  const { orderId } = useParams<PaymentParams>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(PaymentMethod.WECHAT);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(PaymentStatus.PENDING);
  const [paymentParams, setPaymentParams] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const { user } = useSelector((state: RootState) => state.auth);
  const [order, setOrder] = useState<any>(null);

  // 获取订单信息
  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrder(data.data);
      } else {
        setError('获取订单信息失败');
      }
    } catch (error) {
      setError('获取订单信息失败');
    }
  };

  // 创建支付
  const createPayment = async () => {
    if (!order) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          orderId: order.id,
          paymentMethod: selectedPaymentMethod,
          amount: order.paymentAmount
        })
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentParams(data.data.paymentParams);
        setPaymentStatus(PaymentStatus.PENDING);
        
        // 根据支付方式处理支付
        handlePayment(selectedPaymentMethod, data.data.paymentParams);
      } else {
        const errorData = await response.json();
        setError(errorData.message || '创建支付失败');
      }
    } catch (error) {
      setError('创建支付失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理不同支付方式
  const handlePayment = (method: PaymentMethod, params: any) => {
    switch (method) {
      case PaymentMethod.WECHAT:
        handleWechatPayment(params);
        break;
      case PaymentMethod.ALIPAY:
        handleAlipayPayment(params);
        break;
      case PaymentMethod.BANK_CARD:
        handleBankCardPayment(params);
        break;
      default:
        setError('不支持的支付方式');
    }
  };

  // 微信支付
  const handleWechatPayment = (params: any) => {
    // 实际项目中需要调用微信支付SDK
    console.log('微信支付参数:', params);
    
    // 模拟支付过程
    setTimeout(() => {
      setPaymentStatus(PaymentStatus.PAID);
      setTimeout(() => {
        navigate(`/orders/${orderId}`);
      }, 2000);
    }, 3000);
  };

  // 支付宝支付
  const handleAlipayPayment = (params: any) => {
    // 实际项目中需要调用支付宝SDK
    console.log('支付宝支付参数:', params);
    
    // 模拟支付过程
    setTimeout(() => {
      setPaymentStatus(PaymentStatus.PAID);
      setTimeout(() => {
        navigate(`/orders/${orderId}`);
      }, 2000);
    }, 3000);
  };

  // 银行卡支付
  const handleBankCardPayment = (params: any) => {
    // 跳转到银行卡支付页面
    window.open(params.paymentUrl, '_blank');
  };

  // 支付方式选项
  const paymentMethods = [
    {
      value: PaymentMethod.WECHAT,
      label: '微信支付',
      icon: '💳',
      description: '使用微信扫码支付'
    },
    {
      value: PaymentMethod.ALIPAY,
      label: '支付宝',
      icon: '💰',
      description: '使用支付宝支付'
    },
    {
      value: PaymentMethod.BANK_CARD,
      label: '银行卡',
      icon: '🏦',
      description: '使用银行卡支付'
    }
  ];

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">订单支付</h1>
          <p className="text-gray-600 mt-2">请选择支付方式完成订单支付</p>
        </div>

        {/* 订单信息 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">订单信息</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">订单号:</span>
              <span className="font-medium">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">订单金额:</span>
              <span className="font-medium text-red-600">¥{order.paymentAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">商品数量:</span>
              <span className="font-medium">{order.orderItems?.length || 0}件</span>
            </div>
          </div>
        </div>

        {/* 支付方式选择 */}
        {paymentStatus === PaymentStatus.PENDING && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">选择支付方式</h2>
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <label
                  key={method.value}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedPaymentMethod === method.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.value}
                    checked={selectedPaymentMethod === method.value}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value as PaymentMethod)}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{method.icon}</div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{method.label}</div>
                      <div className="text-sm text-gray-600">{method.description}</div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedPaymentMethod === method.value
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedPaymentMethod === method.value && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* 支付状态 */}
        {paymentStatus !== PaymentStatus.PENDING && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">支付状态</h2>
            <div className="text-center">
              {paymentStatus === PaymentStatus.PAID ? (
                <div className="text-green-600">
                  <div className="text-4xl mb-2">✅</div>
                  <div className="text-lg font-medium">支付成功</div>
                  <div className="text-sm text-gray-600 mt-2">正在跳转到订单详情...</div>
                </div>
              ) : paymentStatus === PaymentStatus.FAILED ? (
                <div className="text-red-600">
                  <div className="text-4xl mb-2">❌</div>
                  <div className="text-lg font-medium">支付失败</div>
                  <div className="text-sm text-gray-600 mt-2">请重新尝试支付</div>
                </div>
              ) : (
                <div className="text-blue-600">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <div className="text-lg font-medium">支付处理中</div>
                  <div className="text-sm text-gray-600 mt-2">请稍候...</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 错误信息 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-red-600 mr-2">⚠️</div>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex space-x-4">
          <button
            onClick={() => navigate(`/orders/${orderId}`)}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            返回订单
          </button>
          
          {paymentStatus === PaymentStatus.PENDING && (
            <button
              onClick={createPayment}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '处理中...' : '立即支付'}
            </button>
          )}
          
          {paymentStatus === PaymentStatus.FAILED && (
            <button
              onClick={createPayment}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              重新支付
            </button>
          )}
        </div>

        {/* 支付说明 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">支付说明</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 支付成功后，订单将自动更新为已支付状态</li>
            <li>• 如遇到支付问题，请联系客服处理</li>
            <li>• 支付金额将根据实际支付情况为准</li>
            <li>• 支持微信支付、支付宝、银行卡等多种支付方式</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage; 