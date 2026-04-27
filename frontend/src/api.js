import axios from 'axios';

// 默认超时时间
const DEFAULT_TIMEOUT = 10000;

// 使用环境变量配置API
const API_CONFIG = {
  baseURL: window.location.origin + (import.meta.env.VITE_API_BASE_PATH || '/api'),
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || DEFAULT_TIMEOUT,
  apiKey: import.meta.env.VITE_API_KEY || 'anon'
};

const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
    'apikey': API_CONFIG.apiKey, 
  }
});

// 添加请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 添加响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const api = {
  // 新增：检查手机号是否已存在
  checkUserExists: async (phone) => {
    try {
      // 对phone中的特殊字符进行URL编码，特别是+号
      const encodedPhone = encodeURIComponent(phone);
      const response = await apiClient.get(`/users?phone=eq.${encodedPhone}`);
      return response.data.length > 0;
    } catch (error) {
      console.error('检查用户存在性时出错:', error);
      // API调用失败时，降级到使用localStorage
      return this.checkUserExistsWithLocalStorage(phone);
    }
  },
  
  // 降级处理：使用localStorage检查用户是否存在
  checkUserExistsWithLocalStorage: (phone) => {
    const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
    return allUsers.some(user => user.phone === phone);
  },
  
  getPosts: async () => {
    const response = await apiClient.get('/posts');
    return response.data;
  },
  
  createPost: async (postData) => {
    const response = await apiClient.post('/posts', postData);
    return response.data;
  },
  
  getApplications: async () => {
    const response = await apiClient.get('/feedback?post_id=is.null');
    return response.data;
  },
  
  updateApplication: async (id, status) => {
    // 先获取当前状态
    const res = await apiClient.get(`/feedback?id=eq.${id}`);
    const current = res.data[0];
    // 更新为已处理
    return await apiClient.patch(`/feedback?id=eq.${id}`, {
      ...current,
      status: status,
      processed_at: new Date().toISOString()
    });
  },
  
  submitFeedback: async (feedbackData) => {
    const response = await apiClient.post('/feedback', feedbackData);
    return response.data;
  },
  
  getFeedback: async () => {
    const response = await apiClient.get('/feedback');
    return response.data;
  },
  
  // 新增团购订单相关API
  createGroupOrder: async (orderData) => {
    const response = await apiClient.post('/orders', {
      ...orderData,
      order_type: 'group_buying'  // 标记为团购订单
      // 不需要重新映射phone和customer_nickname，因为orderData中已经包含正确的字段
    });
    return response.data;
  },
  
  getGroupOrders: async (userId) => {
    const response = await apiClient.get(`/orders?user_id=eq.${userId}&order_type=eq.group_buying`);
    return response.data;
  },
  
  getGroupOrderById: async (orderId) => {
    const response = await apiClient.get(`/orders?id=eq.${orderId}&order_type=eq.group_buying`);
    return response.data[0];
  },
  
  updateGroupOrder: async (orderId, orderData) => {
    const response = await apiClient.patch(`/orders?id=eq.${orderId}&order_type=eq.group_buying`, orderData);
    return response.data;
  },
  
  // 删除团购订单
  deleteGroupOrder: async (orderId) => {
    const response = await apiClient.delete(`/orders?id=eq.${orderId}&order_type=eq.group_buying`);
    return response.data;
  },
  
  // 获取团购商品
  getGroupProducts: async () => {
    const response = await apiClient.get('/products?status=eq.true');
    return response.data;
  },
  
  // 验证取货码
  verifyPickupCode: async (pickupCode) => {
    const response = await apiClient.post('/orders/verify', {
      pickup_code: pickupCode
    });
    return response.data;
  },
  
  // 获取订单列表
  getOrders: async (params = {}) => {
    let queryString = '';
    if (params.phone) {
      queryString += `&phone=eq.${encodeURIComponent(params.phone)}`;
    }
    if (params.customer_nickname) {
      queryString += `&customer_nickname=eq.${encodeURIComponent(params.customer_nickname)}`;
    }
    if (params.status) {
      queryString += `&status=eq.${params.status}`;
    }
    
    const response = await apiClient.get(`/orders?${queryString.substring(1)}`);
    return response.data;
  },

  // 获取商家列表
  getMerchants: async () => {
    try {
      const response = await apiClient.get('/merchants');
      return response.data;
    } catch (error) {
      console.error('获取商家列表失败:', error);
      return [];
    }
  },

  // 获取指定ID的商家详情
  getMerchantById: async (merchantId) => {
    try {
      const response = await apiClient.get(`/merchants?id=eq.${merchantId}`);
      return response.data[0] || null;
    } catch (error) {
      console.error('获取商家详情失败:', error);
      return null;
    }
  },

  // 获取商品列表
  getProducts: async () => {
    try {
      // 只获取状态为true的商品 - 使用正确的查询参数格式
      const response = await apiClient.get('/products?status=true&order=sort.asc,name.asc');
      return response.data;
    } catch (error) {
      console.error('获取商品列表失败:', error);
      return [];
    }
  },

  // 创建新商品
  createProduct: async (productData) => {
    try {
      const response = await apiClient.post('/products', productData);
      return response.data;
    } catch (error) {
      console.error('创建商品失败:', error);
      throw error;
    }
  },

  // 更新商品
  updateProduct: async (productId, productData) => {
    try {
      const response = await apiClient.patch(`/products?id=eq.${productId}`, productData);
      return response.data;
    } catch (error) {
      console.error('更新商品失败:', error);
      throw error;
    }
  },

  // 删除商品
  deleteProduct: async (productId) => {
    try {
      await apiClient.delete(`/products?id=eq.${productId}`);
      return true;
    } catch (error) {
      console.error('删除商品失败:', error);
      throw error;
    }
  },

  // 获取指定商户的商品列表
  getProductsByMerchant: async (merchantId) => {
    try {
      const response = await apiClient.get(`/products?merchant_id=eq.${merchantId}&order=sort.asc,name.asc`);
      return response.data;
    } catch (error) {
      console.error('获取商户商品列表失败:', error);
      return [];
    }
  },
};

export default apiClient;
export { apiClient };