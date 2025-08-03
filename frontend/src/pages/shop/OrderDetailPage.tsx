import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { toast } from 'react-hot-toast';

interface OrderItem {
  id: string;
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

interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'refunded';
  totalAmount: number;
  paymentAmount: number;
  discountAmount: number;
  shippingFee: number;
  shippingAddress: ShippingAddress;
  paymentMethod: 'wechat' | 'alipay' | 'bank_card';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentTime?: string;
  shippedTime?: string;
  deliveredTime?: string;
  completedTime?: string;
  cancelledTime?: string;
  cancelReason?: string;
  remark?: string;
  createdAt: string;
  orderItems: OrderItem[];
}

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', text: '待支付' },
    paid: { color: 'bg-blue-100 text-blue-800', text: '已支付' },
    shipped: { color: 'bg-purple-100 text-purple-800', text: '已发货' },
    delivered: { color: 'bg-indigo-100 text-indigo-800', text: '已送达' },
    completed: { color: 'bg-green-100 text-green-800', text: '已完成' },
    cancelled: { color: 'bg-red-100 text-red-800', text: '已取消' },
    refunded: { color: 'bg-gray-100 text-gray-800', text: '已退款' },
  };

  const paymentMethodConfig = {
    wechat: { name: '微信支付', icon: '💳' },
    alipay: { name: '支付宝', icon: '💳' },
    bank_card: { name: '银行卡', icon: '💳' },
  };

  useEffect(() => {
    if (id) {
      fetchOrderDetail();
    }
  }, [id]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const result = await response.json();
      
      if (result.success) {
        setOrder(result.data);
      } else {
        toast.error(result.message || '获取订单详情失败');
        navigate('/shop/orders');
      }
    } catch (error) {
      console.error('获取订单详情失败:', error);
      toast.error('获取订单详情失败');
      navigate('/shop/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;

    try {
      const response = await fetch(`/api/orders/${order.id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          cancelReason: '用户取消',
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('订单取消成功');
        fetchOrderDetail(); // 重新获取订单详情
      } else {
        toast.error(result.message || '订单取消失败');
      }
    } catch (error) {
      console.error('取消订单失败:', error);
      toast.error('取消订单失败');
    }
  };

  const handleConfirmOrder = async () => {
    if (!order) return;

    try {
      const response = await fetch(`/api/orders/${order.id}/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('确认收货成功');
        fetchOrderDetail(); // 重新获取订单详情
      } else {
        toast.error(result.message || '确认收货失败');
      }
    } catch (error) {
      console.error('确认收货失败:', error);
      toast.error('确认收货失败');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('zh-CN');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">❌</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">订单不存在</h3>
          <p className="text-gray-600 mb-6">您访问的订单不存在或已被删除</p>
          <button
            onClick={() => navigate('/shop/orders')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回订单列表
          </button>
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">订单详情</h1>
                <p className="text-blue-100 mt-1">订单号：{order.orderNumber}</p>
              </div>
              <button
                onClick={() => navigate('/shop/orders')}
                className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors"
              >
                返回列表
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* 订单状态 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">订单状态</h2>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig[order.status].color}`}>
                  {statusConfig[order.status].text}
                </span>
                <span className="text-sm text-gray-600">
                  下单时间：{formatDate(order.createdAt)}
                </span>
              </div>
              
              {/* 状态时间线 */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>订单创建：{formatDate(order.createdAt)}</span>
                </div>
                {order.paymentTime && (
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>支付完成：{formatDate(order.paymentTime)}</span>
                  </div>
                )}
                {order.shippedTime && (
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>商品发货：{formatDate(order.shippedTime)}</span>
                  </div>
                )}
                {order.deliveredTime && (
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span>商品送达：{formatDate(order.deliveredTime)}</span>
                  </div>
                )}
                {order.completedTime && (
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>订单完成：{formatDate(order.completedTime)}</span>
                  </div>
                )}
                {order.cancelledTime && (
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>订单取消：{formatDate(order.cancelledTime)}</span>
                    {order.cancelReason && (
                      <span className="text-gray-500">（{order.cancelReason}）</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 收货地址 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">收货地址</h2>
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-medium text-gray-900">{order.shippingAddress.name}</span>
                  <span className="text-gray-600">{order.shippingAddress.phone}</span>
                </div>
                <p className="text-gray-600">
                  {order.shippingAddress.province} {order.shippingAddress.city} {order.shippingAddress.district} {order.shippingAddress.address}
                  {order.shippingAddress.zipCode && ` (${order.shippingAddress.zipCode})`}
                </p>
              </div>
            </div>

            {/* 商品信息 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">商品信息</h2>
              <div className="space-y-4">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg p-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.productName}</h3>
                        {item.specifications && (
                          <p className="text-sm text-gray-600 mt-1">
                            规格: {item.specifications.color || '默认'} / {item.specifications.size || '默认'}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 mt-1">
                          单价: ¥{item.unitPrice.toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">¥{item.totalPrice.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 支付信息 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">支付信息</h2>
              <div className="bg-white rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">支付方式</span>
                  <span className="flex items-center space-x-2">
                    <span>{paymentMethodConfig[order.paymentMethod].icon}</span>
                    <span>{paymentMethodConfig[order.paymentMethod].name}</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">支付状态</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.paymentStatus === 'paid' ? '已支付' : '待支付'}
                  </span>
                </div>
                {order.paymentTime && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">支付时间</span>
                    <span>{formatDate(order.paymentTime)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 订单金额 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">订单金额</h2>
              <div className="bg-white rounded-lg p-4 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>商品总额</span>
                  <span>¥{order.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>运费</span>
                  <span>¥{order.shippingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>优惠金额</span>
                  <span>-¥{order.discountAmount.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>实付金额</span>
                    <span className="text-red-600">¥{order.paymentAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 订单备注 */}
            {order.remark && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">订单备注</h2>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-gray-700">{order.remark}</p>
                </div>
              </div>
            )}
          </div>

          {/* 底部操作栏 */}
          <div className="bg-white border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                实付金额: <span className="text-lg font-semibold text-red-600">¥{order.paymentAmount.toFixed(2)}</span>
              </div>
              <div className="flex space-x-4">
                {order.status === 'pending' && (
                  <>
                    <button
                      onClick={handleCancelOrder}
                      className="px-6 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      取消订单
                    </button>
                    <button
                      onClick={() => navigate(`/shop/payment/${order.id}`)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      立即支付
                    </button>
                  </>
                )}
                {order.status === 'delivered' && (
                  <button
                    onClick={handleConfirmOrder}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    确认收货
                  </button>
                )}
                {order.status === 'completed' && (
                  <button
                    onClick={() => navigate(`/shop/products/${order.orderItems[0]?.productId}`)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    再次购买
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage; 