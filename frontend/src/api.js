import axios from 'axios';

// 修改为使用代理路径，解决CORS问题
const BASE_URL = window.location.origin;  // 使用当前页面的协议和主机

const apiClient = axios.create({
  baseURL: BASE_URL + '/rest',  // 使用代理路径
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'apikey': 'anon', 
  }
});

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
      // 当网络错误时，尝试使用一个备用方法来判断用户是否存在
      // 但在这种情况下，我们只能返回false，因为无法确定用户是否存在
      // 更好的方式是让用户知道网络连接有问题
      throw error; // 抛出错误，让调用者知道网络连接有问题
    }
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
      order_type: 'group_buying',  // 标记为团购订单
      phone: orderData.cell,       // 使用cell字段替代原来的phone
      customer_nickname: orderData.nickname  // 使用昵称字段
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

  // 获取商品列表
  getProducts: async () => {
    try {
      // 只获取状态为true的商品
      const response = await apiClient.get('/products?status=eq.true&order=sort.asc,name.asc');
      return response.data;
    } catch (error) {
      console.error('获取商品列表失败:', error);
      return [];
    }
  },

};

export default apiClient;
export { apiClient };