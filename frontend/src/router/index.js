import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { 
    path: '/', 
    component: () => import('../pages/Auth.vue') 
  },
  { 
    path: '/register', 
    component: () => import('../pages/Register.vue') 
  },
  { 
    path: '/products', 
    component: () => import('../pages/ProductDirectory.vue') 
  },
  { 
    path: '/profile', 
    component: () => import('../pages/Profile.vue') 
  },
  { 
    path: '/order-preview', 
    component: () => import('../pages/OrderPreview.vue') 
  },
  { 
    path: '/my-orders', 
    component: () => import('../pages/MyOrders.vue') 
  },
  { 
    path: '/cart', 
    component: () => import('../pages/CartDetails.vue') 
  },
  { 
    path: '/group-buying-order', 
    component: () => import('../pages/GroupBuyingOrder.vue') 
  },
  { 
    path: '/order-simulator', 
    component: () => import('../pages/OrderSimulator.vue') 
  },
  { 
    path: '/products/:id', 
    component: () => import('../pages/ProductDetail.vue') 
  },
  { 
    path: '/debug', 
    component: () => import('../pages/DebugPanel.vue') 
  },
  { 
    path: '/simple-debug', 
    component: () => import('../pages/SimpleDebug.vue') 
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;