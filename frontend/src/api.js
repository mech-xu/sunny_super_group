import axios from 'axios';

// 强制使用公网 API，彻底排除本地证书和 CORS 拦截问题
const BASE_URL = 'https://demo-api.sunnynow.net';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'apikey': 'anon', 
  }
});

export const api = {
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
  }
};

export default apiClient;
