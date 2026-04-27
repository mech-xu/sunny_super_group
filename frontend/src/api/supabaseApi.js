import { supabase } from '../lib/supabaseClient.js';

export const supabaseApi = {
  // 获取商家列表
  getMerchants: async () => {
    const { data, error } = await supabase
      .from('merchants')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('获取商家列表失败:', error);
      throw error;
    }
    return data;
  },

  // 获取指定ID的商家详情
  getMerchantById: async (merchantId) => {
    const { data, error } = await supabase
      .from('merchants')
      .select('*')
      .eq('id', merchantId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 表示未找到记录
      console.error('获取商家详情失败:', error);
      throw error;
    }
    return data;
  },

  // 获取商品列表
  getProducts: async (filters = {}) => {
    let query = supabase
      .from('products')
      .select('*')
      .order('sort', { ascending: true })
      .order('name', { ascending: true });

    if (filters.status !== undefined) {
      query = query.eq('status', filters.status);
    }
    if (filters.merchant_id) {
      query = query.eq('merchant_id', filters.merchant_id);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('获取商品列表失败:', error);
      throw error;
    }
    return data;
  },

  // 获取用户信息（通过手机号）
  getUserByPhone: async (phone) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('获取用户信息失败:', error);
      throw error;
    }
    return data;
  },

  // 获取订单列表
  getOrders: async (filters = {}) => {
    let query = supabase.from('orders').select('*');

    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.order_type) {
      query = query.eq('order_type', filters.order_type);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('获取订单列表失败:', error);
      throw error;
    }
    return data;
  },

  // 创建订单
  createOrder: async (orderData) => {
    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();
    
    if (error) {
      console.error('创建订单失败:', error);
      throw error;
    }
    return data;
  },

  // 验证取货码
  verifyPickupCode: async (pickupCode) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('pickup_code', pickupCode)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('验证取货码失败:', error);
      throw error;
    }
    return data;
  }
};