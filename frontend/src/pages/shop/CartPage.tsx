import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, InputNumber, Checkbox, Empty, Spin, message, Divider, Image } from 'antd';
import { DeleteOutlined, ShoppingOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    images: string[];
    price: number;
    originalPrice: number;
    stock: number;
    category: {
      name: string;
    };
  };
}

interface Cart {
  id: string;
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
}

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState<Cart | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/cart');
      setCart(response.data.data);
      // 默认全选
      setSelectedItems(response.data.data.items.map((item: CartItem) => item.id));
    } catch (error) {
      message.error('获取购物车失败');
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateItemQuantity = async (itemId: string, quantity: number) => {
    setUpdating(itemId);
    try {
      await axios.put(`/api/cart/items/${itemId}`, { quantity });
      await fetchCart();
      message.success('数量更新成功');
    } catch (error) {
      message.error('数量更新失败');
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await axios.delete(`/api/cart/items/${itemId}`);
      await fetchCart();
      message.success('商品已删除');
    } catch (error) {
      message.error('删除失败');
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete('/api/cart');
      await fetchCart();
      message.success('购物车已清空');
    } catch (error) {
      message.error('清空失败');
    }
  };

  const handleQuantityChange = (itemId: string, quantity: number | null) => {
    if (quantity && quantity > 0) {
      updateItemQuantity(itemId, quantity);
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(cart?.items.map(item => item.id) || []);
    } else {
      setSelectedItems([]);
    }
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      message.warning('请选择要结算的商品');
      return;
    }
    
    // 准备订单数据
    const orderData = {
      items: selectedItemsData.map(item => ({
        productId: item.productId,
        productName: item.product.name,
        productImage: item.product.images[0] || '',
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity,
      })),
      totalAmount: totalPrice,
      paymentAmount: totalPrice + (totalPrice >= 99 ? 0 : 10), // 运费计算
      shippingFee: totalPrice >= 99 ? 0 : 10,
      discountAmount: discount,
    };
    
    navigate('/shop/order-confirm', { state: { orderData } });
  };

  const continueShopping = () => {
    navigate('/shop');
  };

  // 计算选中商品的总价
  const selectedItemsData = cart?.items.filter(item => selectedItems.includes(item.id)) || [];
  const totalPrice = selectedItemsData.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalOriginalPrice = selectedItemsData.reduce((sum, item) => sum + item.product.originalPrice * item.quantity, 0);
  const discount = totalOriginalPrice - totalPrice;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <Empty
          image={<ShoppingOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />}
          description="购物车是空的"
          style={{ padding: '50px' }}
        >
          <Button type="primary" onClick={continueShopping}>
            去购物
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: '24px' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={continueShopping}
          style={{ marginBottom: '16px' }}
        >
          继续购物
        </Button>
        <h1 style={{ margin: 0 }}>购物车</h1>
      </div>

      <Row gutter={[24, 24]}>
        {/* 购物车商品列表 */}
        <Col xs={24} lg={16}>
          <Card>
            {/* 全选和清空 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <Checkbox
                checked={selectedItems.length === cart.items.length && cart.items.length > 0}
                indeterminate={selectedItems.length > 0 && selectedItems.length < cart.items.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
              >
                全选
              </Checkbox>
              <Button type="text" danger onClick={clearCart}>
                清空购物车
              </Button>
            </div>

            {/* 商品列表 */}
            <div>
              {cart.items.map((item) => (
                <div key={item.id} style={{ marginBottom: '16px', padding: '16px', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
                  <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={2}>
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                      />
                    </Col>
                    <Col xs={24} sm={4}>
                      <Image
                        src={item.product.images[0] || 'https://via.placeholder.com/100x100'}
                        alt={item.product.name}
                        width={80}
                        height={80}
                        style={{ objectFit: 'cover' }}
                      />
                    </Col>
                    <Col xs={24} sm={8}>
                      <div>
                        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                          {item.product.name}
                        </div>
                        <div style={{ color: '#666', fontSize: '12px' }}>
                          {item.product.category.name}
                        </div>
                      </div>
                    </Col>
                    <Col xs={24} sm={4}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                          ¥{item.price}
                        </div>
                        {item.product.originalPrice > item.price && (
                          <div style={{ color: '#999', textDecoration: 'line-through', fontSize: '12px' }}>
                            ¥{item.product.originalPrice}
                          </div>
                        )}
                      </div>
                    </Col>
                    <Col xs={24} sm={4}>
                      <InputNumber
                        min={1}
                        max={item.product.stock}
                        value={item.quantity}
                        onChange={(value) => handleQuantityChange(item.id, value)}

                        style={{ width: '100px' }}
                      />
                    </Col>
                    <Col xs={24} sm={2}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 'bold', color: '#ff4d4f' }}>
                          ¥{(item.price * item.quantity).toFixed(2)}
                        </div>
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => removeItem(item.id)}
                          size="small"
                        >
                          删除
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* 结算区域 */}
        <Col xs={24} lg={8}>
          <Card title="订单摘要">
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>商品总价:</span>
                <span>¥{totalOriginalPrice.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#52c41a' }}>
                  <span>优惠金额:</span>
                  <span>-¥{discount.toFixed(2)}</span>
                </div>
              )}
              <Divider style={{ margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold' }}>
                <span>应付总额:</span>
                <span style={{ color: '#ff4d4f' }}>¥{totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ color: '#666', fontSize: '12px' }}>
                已选择 {selectedItems.length} 件商品
              </div>
            </div>

            <Button
              type="primary"
              size="large"
              block
              onClick={handleCheckout}
              disabled={selectedItems.length === 0}
            >
              去结算
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CartPage; 