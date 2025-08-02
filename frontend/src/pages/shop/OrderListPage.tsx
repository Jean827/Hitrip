import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
}

interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'refunded';
  totalAmount: number;
  paymentAmount: number;
  shippingFee: number;
  createdAt: string;
  orderItems: OrderItem[];
}

const OrderListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const statusOptions = [
    { value: '', label: '全部订单' },
    { value: 'pending', label: '待支付' },
    { value: 'paid', label: '已支付' },
    { value: 'shipped', label: '已发货' },
    { value: 'delivered', label: '已送达' },
    { value: 'completed', label: '已完成' },
    { value: 'cancelled', label: '已取消' },
  ];

  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', text: '待支付' },
    paid: { color: 'bg-blue-100 text-blue-800', text: '已支付' },
    shipped: { color: 'bg-purple-100 text-purple-800', text: '已发货' },
    delivered: { color: 'bg-indigo-100 text-indigo-800', text: '已送达' },
    completed: { color: 'bg-green-100 text-green-800', text: '已完成' },
    cancelled: { color: 'bg-red-100 text-red-800', text: '已取消' },
    refunded: { color: 'bg-gray-100 text-gray-800', text: '已退款' },
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus, currentPage]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(selectedStatus && { status: selectedStatus }),
      });

      const response = await fetch(`/api/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      const result = await response.json();
      
      if (result.success) {
        setOrders(result.data.orders);
        setTotalPages(result.data.totalPages);
      } else {
        toast.error(result.message || '获取订单列表失败');
      }
    } catch (error) {
      console.error('获取订单列表失败:', error);
      toast.error('获取订单列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          cancelReason: '用户取消',
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('订单取消成功');
        fetchOrders(); // 重新获取订单列表
      } else {
        toast.error(result.message || '订单取消失败');
      }
    } catch (error) {
      console.error('取消订单失败:', error);
      toast.error('取消订单失败');
    }
  };

  const handleConfirmOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('确认收货成功');
        fetchOrders(); // 重新获取订单列表
      } else {
        toast.error(result.message || '确认收货失败');
      }
    } catch (error) {
      console.error('确认收货失败:', error);
      toast.error('确认收货失败');
    }
  };

  const formatDate = (dateString: string) => {
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* 页面标题 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">我的订单</h1>
              <p className="text-gray-600 mt-1">查看和管理您的所有订单</p>
            </div>
            <button
              onClick={() => navigate('/shop')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              继续购物
            </button>
          </div>
        </div>

        {/* 状态筛选 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setSelectedStatus(option.value);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedStatus === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 订单列表 */}
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无订单</h3>
              <p className="text-gray-600 mb-6">您还没有任何订单，快去购物吧！</p>
              <button
                onClick={() => navigate('/shop')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                去购物
              </button>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* 订单头部 */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-600">订单号：{order.orderNumber}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[order.status].color}`}>
                        {statusConfig[order.status].text}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      下单时间：{formatDate(order.createdAt)}
                    </div>
                  </div>
                </div>

                {/* 订单商品 */}
                <div className="p-6">
                  <div className="space-y-4">
                    {order.orderItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{item.productName}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            ¥{item.unitPrice.toFixed(2)} × {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">¥{item.totalPrice.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 订单金额 */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        共 {order.orderItems.length} 件商品
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          商品总额：¥{order.totalAmount.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600">
                          运费：¥{order.shippingFee.toFixed(2)}
                        </div>
                        <div className="text-lg font-semibold text-red-600">
                          实付：¥{order.paymentAmount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 订单操作 */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-4">
                      <button
                        onClick={() => navigate(`/shop/orders/${order.id}`)}
                        className="px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        查看详情
                      </button>
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="px-4 py-2 text-red-600 hover:text-red-700 transition-colors"
                        >
                          取消订单
                        </button>
                      )}
                      {order.status === 'delivered' && (
                        <button
                          onClick={() => handleConfirmOrder(order.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          确认收货
                        </button>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => navigate(`/shop/payment/${order.id}`)}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          立即支付
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
            ))
          )}
        </div>

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderListPage; 