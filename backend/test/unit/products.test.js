const request = require('supertest');
const { app } = require('../src/index');
const { Product } = require('../src/models/Product');
const { Category } = require('../src/models/Category');

describe('Products API Tests', () => {
  let testProduct;
  let testCategory;
  let authToken;

  beforeAll(async () => {
    // 清理测试数据
    await Product.destroy({ where: {} });
    await Category.destroy({ where: {} });
    
    // 创建测试分类
    testCategory = await Category.create({
      name: '测试分类',
      description: '测试分类描述',
      slug: 'test-category'
    });
    
    // 创建测试产品
    testProduct = await Product.create({
      name: '测试产品',
      description: '测试产品描述',
      price: 99.99,
      categoryId: testCategory.id,
      stock: 100,
      status: 'active'
    });
  });

  afterAll(async () => {
    // 清理测试数据
    await Product.destroy({ where: {} });
    await Category.destroy({ where: {} });
  });

  describe('GET /api/products', () => {
    it('should get all products successfully', async () => {
      const response = await request(app)
        .get('/api/products');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('products');
      expect(Array.isArray(response.body.products)).toBe(true);
      expect(response.body.products.length).toBeGreaterThan(0);
    });

    it('should get products with pagination', async () => {
      const response = await request(app)
        .get('/api/products?page=1&limit=10');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('products');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('currentPage', 1);
      expect(response.body.pagination).toHaveProperty('limit', 10);
    });

    it('should get products with category filter', async () => {
      const response = await request(app)
        .get(`/api/products?categoryId=${testCategory.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('products');
      expect(response.body.products.length).toBeGreaterThan(0);
      expect(response.body.products[0].categoryId).toBe(testCategory.id);
    });

    it('should get products with search query', async () => {
      const response = await request(app)
        .get('/api/products?search=测试');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('products');
      expect(response.body.products.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should get product by id successfully', async () => {
      const response = await request(app)
        .get(`/api/products/${testProduct.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('product');
      expect(response.body.product).toHaveProperty('id', testProduct.id);
      expect(response.body.product).toHaveProperty('name', '测试产品');
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .get('/api/products/999999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', '产品不存在');
    });
  });

  describe('POST /api/products', () => {
    it('should create product successfully', async () => {
      const newProduct = {
        name: '新产品',
        description: '新产品描述',
        price: 199.99,
        categoryId: testCategory.id,
        stock: 50,
        status: 'active'
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newProduct);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', '产品创建成功');
      expect(response.body).toHaveProperty('product');
      expect(response.body.product).toHaveProperty('name', '新产品');
    });

    it('should return error for invalid product data', async () => {
      const invalidProduct = {
        name: '',
        price: -10,
        stock: -5
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidProduct);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should return error for non-existent category', async () => {
      const productWithInvalidCategory = {
        name: '新产品',
        description: '新产品描述',
        price: 199.99,
        categoryId: 999999,
        stock: 50,
        status: 'active'
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productWithInvalidCategory);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update product successfully', async () => {
      const updateData = {
        name: '更新后的产品',
        price: 299.99,
        stock: 75
      };

      const response = await request(app)
        .put(`/api/products/${testProduct.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', '产品更新成功');
      expect(response.body).toHaveProperty('product');
      expect(response.body.product).toHaveProperty('name', '更新后的产品');
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .put('/api/products/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: '测试' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', '产品不存在');
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete product successfully', async () => {
      const response = await request(app)
        .delete(`/api/products/${testProduct.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', '产品删除成功');
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .delete('/api/products/999999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', '产品不存在');
    });
  });

  describe('GET /api/products/categories', () => {
    it('should get all categories successfully', async () => {
      const response = await request(app)
        .get('/api/products/categories');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('categories');
      expect(Array.isArray(response.body.categories)).toBe(true);
      expect(response.body.categories.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/products/recommendations', () => {
    it('should get product recommendations successfully', async () => {
      const response = await request(app)
        .get('/api/products/recommendations');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('recommendations');
      expect(Array.isArray(response.body.recommendations)).toBe(true);
    });

    it('should get recommendations for specific user', async () => {
      const response = await request(app)
        .get('/api/products/recommendations?userId=1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('recommendations');
    });
  });
}); 