import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { toast } from 'react-hot-toast';

interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specifications?: any;
}

interface ShippingAddress {
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  address: string;
  zipCode?: string;
}

interface OrderConfirmData {
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: 'wechat' | 'alipay' | 'bank_card';
  totalAmount: number;
  paymentAmount: number;
  shippingFee: number;
  discountAmount: number;
}

const OrderConfirmPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [orderData, setOrderData] = useState<OrderConfirmData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<ShippingAddress | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'wechat' | 'alipay' | 'bank_card'>('wechat');
  const [remark, setRemark] = useState('');

  // 模拟地址数据
  const addresses: ShippingAddress[] = [
    {
      name: '张三',
      phone: '13800138000',
      province: '海南省',
      city: '海口市',
      district: '美兰区',
      address: '海府路123号',
      zipCode: '570000'
    },
    {
      name: '李四',
      phone: '13900139000',
      province: '海南省',
      city: '三亚市',
      district: '吉阳区',
      address: '三亚湾路456号',
      zipCode: '572000'
    }
  ];

  useEffect(() => {
    // 从购物车或商品详情页获取订单数据
    const data = location.state?.orderData;
    if (data) {
      setOrderData(data);
      setSelectedAddress(addresses[0]); // 默认选择第一个地址
    } else {
      // 如果没有订单数据，返回购物车页面
      navigate('/shop/cart');
    }
  }, [location.state, navigate]);

  const handleSubmitOrder = async () => {
    if (!selectedAddress) {
      toast.error('请选择收货地址');
      return;
    }

    if (!orderData) {
      toast.error('订单数据无效');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          items: orderData.items,
          shippingAddress: selectedAddress,
          paymentMethod: selectedPaymentMethod,
          remark,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('订单创建成功');
        // 跳转到支付页面或订单详情页
        navigate(`/shop/orders/${result.data.id}`);
      } else {
        toast.error(result.message || '订单创建失败');
      }
    } catch (error) {
      console.error('创建订单失败:', error);
      toast.error('订单创建失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  if (!orderData) {
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
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* 页面标题 */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">确认订单</h1>
            <p className="text-blue-100 mt-1">请确认订单信息并选择支付方式</p>
          </div>

          <div className="p-6 space-y-6">
            {/* 收货地址 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">收货地址</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((address, index) => (
                  <div
                    key={index}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedAddress === address
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedAddress(address)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-gray-900">{address.name}</span>
                          <span className="text-gray-600">{address.phone}</span>
                        </div>
                        <p className="text-gray-600 text-sm">
                          {address.province} {address.city} {address.district} {address.address}
                        </p>
                      </div>
                      {selectedAddress === address && (
                        <div className="text-blue-600">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 商品信息 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">商品信息</h2>
              <div className="space-y-4">
                {orderData.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 bg-white rounded-lg p-4">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.productName}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        规格: {item.specifications?.color || '默认'} / {item.specifications?.size || '默认'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-600">¥{item.unitPrice.toFixed(2)} × {item.quantity}</p>
                      <p className="font-semibold text-gray-900">¥{item.totalPrice.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 支付方式 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">支付方式</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'wechat', name: '微信支付', icon: '💳', color: 'bg-green-500' },
                  { id: 'alipay', name: '支付宝', icon: '💳', color: 'bg-blue-500' },
                  { id: 'bank_card', name: '银行卡', icon: '💳', color: 'bg-purple-500' },
                ].map((method) => (
                  <div
                    key={method.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedPaymentMethod === method.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPaymentMethod(method.id as any)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full ${method.color} flex items-center justify-center text-white`}>
                        <span className="text-lg">{method.icon}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{method.name}</p>
                        <p className="text-sm text-gray-600">安全快捷</p>
                      </div>
                      {selectedPaymentMethod === method.id && (
                        <div className="ml-auto text-blue-600">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 订单备注 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">订单备注</h2>
              <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="请输入订单备注（选填）"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            {/* 订单金额 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">订单金额</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>商品总额</span>
                  <span>¥{orderData.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>运费</span>
                  <span>¥{orderData.shippingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>优惠金额</span>
                  <span>-¥{orderData.discountAmount.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>实付金额</span>
                    <span className="text-red-600">¥{orderData.paymentAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 底部操作栏 */}
          <div className="bg-white border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                实付金额: <span className="text-lg font-semibold text-red-600">¥{orderData.paymentAmount.toFixed(2)}</span>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => navigate('/shop/cart')}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  返回购物车
                </button>
                <button
                  onClick={handleSubmitOrder}
                  disabled={loading}
                  className="px-8 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>提交中...</span>
                    </div>
                  ) : (
                    '提交订单'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmPage; 