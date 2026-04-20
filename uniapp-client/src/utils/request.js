import Request from 'luch-request';

// API基础配置
const config = {
  baseURL: 'http://192.168.2.71:8000', // Canadian backend API address
  timeout: 10000,
  header: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// 创建请求实例
const http = new Request(config);

// 请求拦截器
http.interceptors.request.use(
  (config) => {
    // 添加认证token
    const token = uni.getStorageSync('token');
    if (token) {
      config.header.Authorization = `Bearer ${token}`;
    }
    
    console.log('Request Config:', config);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
http.interceptors.response.use(
  (response) => {
    console.log('Response Data:', response.data);
    return response.data;
  },
  (error) => {
    console.error('Response Error:', error);
    
    // 统一错误处理
    if (error.errMsg) {
      uni.showToast({
        title: '网络请求失败',
        icon: 'none'
      });
    } else if (error.statusCode === 401) {
      // Token失效，跳转登录页
      uni.removeStorageSync('token');
      uni.navigateTo({
        url: '/pages/index/login'
      });
    } else if (error.statusCode === 500) {
      uni.showToast({
        title: '服务器内部错误',
        icon: 'none'
      });
    }
    
    return Promise.reject(error);
  }
);

// API接口定义
export const api = {
  // 用户相关
  user: {
    // 登录
    login: (data) => http.post('/rpc/login', data),
    // 注册
    register: (data) => http.post('/rpc/register', data),
    // 获取用户信息
    getInfo: () => http.get('/users'),
    // 更新用户信息
    updateInfo: (data) => http.patch('/users', data)
  },
  
  // 商品相关
  goods: {
    // 获取商品列表
    getList: (params) => http.get('/products', params),
    // 获取商品详情
    getDetail: (id) => http.get(`/products/${id}`),
    // 获取分类列表
    getCategoryList: () => http.get('/merchants') // Using merchants as categories
  },
  
  // 订单相关
  order: {
    // 创建订单
    create: (data) => http.post('/orders', data),
    // 获取订单列表
    getList: (params) => http.get('/orders', params),
    // 获取订单详情
    getDetail: (id) => http.get(`/orders/${id}`)
  },
  
  // 购物车相关
  cart: {
    // 获取购物车
    getList: () => http.get('/cart'),
    // 添加到购物车
    add: (data) => http.post('/cart', data),
    // 更新购物车
    update: (data) => http.put('/cart', data),
    // 删除购物车商品
    remove: (id) => http.delete(`/cart/${id}`)
  }
};

export default http;