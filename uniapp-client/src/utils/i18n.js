// i18n.js - 多语言配置
// 为加拿大团购自提系统提供中英双语支持

const messages = {
  zh: {
    common: {
      home: '首页',
      category: '分类',
      cart: '购物车',
      my: '我的',
      submit: '提交',
      cancel: '取消',
      confirm: '确认',
      back: '返回',
      loading: '加载中...',
      noData: '暂无数据',
      refresh: '刷新',
      loadMore: '加载更多',
      search: '搜索',
      share: '分享',
      service: '客服'
    },
    goods: {
      detail: '商品详情',
      specs: '规格选择',
      quantity: '购买数量',
      addToCart: '加入购物车',
      buyNow: '立即购买',
      inventory: '库存',
      sales: '销量',
      description: '商品描述',
      detail: '商品详情'
    },
    order: {
      confirm: '确认订单',
      createSuccess: '订单创建成功',
      total: '合计',
      delivery: '配送费',
      remark: '订单备注',
      selectAddress: '请选择收货地址',
      empty: '订单商品不能为空'
    },
    user: {
      profile: '个人资料',
      login: '登录',
      register: '注册',
      logout: '退出登录',
      address: '收货地址',
      order: '我的订单',
      setting: '设置'
    },
    cart: {
      title: '购物车',
      empty: '购物车为空',
      edit: '编辑',
      done: '完成',
      delete: '删除',
      selectAll: '全选',
      unselectAll: '取消全选',
      total: '总计'
    }
  },
  en: {
    common: {
      home: 'Home',
      category: 'Category',
      cart: 'Cart',
      my: 'My',
      submit: 'Submit',
      cancel: 'Cancel',
      confirm: 'Confirm',
      back: 'Back',
      loading: 'Loading...',
      noData: 'No data',
      refresh: 'Refresh',
      loadMore: 'Load More',
      search: 'Search',
      share: 'Share',
      service: 'Service'
    },
    goods: {
      detail: 'Product Detail',
      specs: 'Specifications',
      quantity: 'Quantity',
      addToCart: 'Add to Cart',
      buyNow: 'Buy Now',
      inventory: 'Inventory',
      sales: 'Sales',
      description: 'Description',
      detail: 'Detail'
    },
    order: {
      confirm: 'Confirm Order',
      createSuccess: 'Order Created Successfully',
      total: 'Total',
      delivery: 'Delivery Fee',
      remark: 'Order Remark',
      selectAddress: 'Please Select Address',
      empty: 'Order items cannot be empty'
    },
    user: {
      profile: 'Profile',
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      address: 'Shipping Address',
      order: 'My Orders',
      setting: 'Setting'
    },
    cart: {
      title: 'Shopping Cart',
      empty: 'Cart is empty',
      edit: 'Edit',
      done: 'Done',
      delete: 'Delete',
      selectAll: 'Select All',
      unselectAll: 'Unselect All',
      total: 'Total'
    }
  }
};

// 当前语言
let currentLanguage = 'zh';

// 设置语言
const setLanguage = (lang) => {
  currentLanguage = lang || 'zh';
};

// 获取翻译文本
const t = (key) => {
  const keys = key.split('.');
  let result = messages[currentLanguage];
  
  for (let k of keys) {
    result = result ? result[k] : undefined;
  }
  
  return result || key;
};

export default {
  setLanguage,
  t,
  messages
};