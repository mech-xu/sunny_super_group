// 应用常量配置
export const APP_CONSTANTS = {
  // localStorage 键名
  STORAGE_KEYS: {
    CURRENT_USER: 'currentUser',
    CART: 'cart'
  },
  
  // 路由路径
  ROUTES: {
    HOME: '/',
    INDEX: '/index',
    GOODS: '/goods',
    CART: '/cart',
    USER: '/user',
    AUTH: '/auth',
    REGISTER: '/register',
    ADMIN_LOGIN: '/admin-login'
  },
  
  // 默认值
  DEFAULTS: {
    API_TIMEOUT: 10000,
    PAGE_SIZE: 20
  }
};

// 导出便捷访问方法
export const getStorageKey = (key) => APP_CONSTANTS.STORAGE_KEYS[key];
export const getRoutePath = (routeName) => APP_CONSTANTS.ROUTES[routeName];