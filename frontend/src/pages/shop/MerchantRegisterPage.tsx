import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const MerchantRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo: '',
    banner: '',
    contactPhone: '',
    contactEmail: '',
    address: '',
    businessLicense: '',
    idCardFront: '',
    idCardBack: '',
    settlementAccount: '',
    settlementBank: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (file) {
      // 实际项目中需要上传文件到服务器
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          [field]: event.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/merchants/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/merchant/profile');
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || '商家入驻申请失败');
      }
    } catch (error) {
      setError('商家入驻申请失败');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">申请提交成功</h2>
          <p className="text-gray-600 mb-6">
            您的商家入驻申请已提交，我们将尽快审核。审核结果将通过邮件通知您。
          </p>
          <div className="text-sm text-gray-500">
            正在跳转到商家中心...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">商家入驻</h1>
          <p className="text-gray-600 mt-2">成为我们的合作伙伴，开启您的电商之旅</p>
        </div>

        {/* 入驻流程 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">入驻流程</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <div className="text-sm font-medium">填写信息</div>
              <div className="text-xs text-gray-500">完善商家基本信息</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <div className="text-sm font-medium">上传资质</div>
              <div className="text-xs text-gray-500">上传营业执照等资质</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <div className="text-sm font-medium">等待审核</div>
              <div className="text-xs text-gray-500">1-3个工作日完成审核</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-600 font-bold">4</span>
              </div>
              <div className="text-sm font-medium">开始营业</div>
              <div className="text-xs text-gray-500">审核通过后即可上架商品</div>
            </div>
          </div>
        </div>

        {/* 入驻表单 */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">商家信息</h2>

          {/* 错误信息 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="text-red-600 mr-2">⚠️</div>
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 基本信息 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  商家名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入商家名称"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  商家描述 <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请描述您的商家特色和经营范围"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  联系电话 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入联系电话"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  联系邮箱 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入联系邮箱"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  商家地址 <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入详细地址"
                />
              </div>
            </div>

            {/* 资质信息 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  商家Logo <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'logo')}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  商家横幅
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'banner')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  营业执照 <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'businessLicense')}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  身份证正面 <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'idCardFront')}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  身份证背面 <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'idCardBack')}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 结算信息 */}
          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">结算信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  结算银行 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="settlementBank"
                  value={formData.settlementBank}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入结算银行"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  结算账户 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="settlementAccount"
                  value={formData.settlementAccount}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入结算账户"
                />
              </div>
            </div>
          </div>

          {/* 提交按钮 */}
          <div className="mt-8 flex space-x-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '提交中...' : '提交申请'}
            </button>
          </div>
        </form>

        {/* 入驻说明 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-medium text-blue-900 mb-4">入驻说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">入驻条件</h4>
              <ul className="space-y-1">
                <li>• 具有合法经营资质的企业或个人</li>
                <li>• 提供真实有效的营业执照</li>
                <li>• 承诺遵守平台规则和法律法规</li>
                <li>• 具备良好的商业信誉</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">入驻优势</h4>
              <ul className="space-y-1">
                <li>• 零入驻费用，快速开店</li>
                <li>• 专业的运营指导和支持</li>
                <li>• 丰富的营销工具和活动</li>
                <li>• 安全可靠的支付结算</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantRegisterPage; 