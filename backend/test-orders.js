const axios = require('axios');

async function testOrdersAPI() {
  try {
    // 测试健康检查
    console.log('Testing health check...');
    const healthResponse = await axios.get('http://localhost:5000/health');
    console.log('Health check response:', healthResponse.data);
    
    // 测试订单列表API
    console.log('\nTesting orders API...');
    const ordersResponse = await axios.get('http://localhost:5000/api/orders', {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });
    console.log('Orders API response:', ordersResponse.data);
    
  } catch (error) {
    console.error('Error testing API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testOrdersAPI(); 