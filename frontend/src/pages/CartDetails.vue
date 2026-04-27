<template>
  <div class="cart-page">
    <iPhoneFrame>
      <!-- 顶部导航栏 -->
      <SimpleHeader title="购物车" :showBack="true" @back="goBack">
        <template #right>
          <button @click="goToHome" class="home-btn">🏠</button>
        </template>
      </SimpleHeader>

      <main class="main-content">
        <!-- 空购物车状态 -->
        <div v-if="cartItems.length === 0" class="empty-cart">
          <div class="empty-icon">🛒</div>
          <p class="empty-text">购物车是空的</p>
          <button @click="goToHome" class="go-home-btn">去逛逛</button>
        </div>

        <!-- 购物车商品列表 -->
        <div v-else class="cart-items">
          <div 
            v-for="(item, index) in cartItems" 
            :key="index" 
            class="cart-item"
          >
            <img :src="item.product.image" :alt="item.product.name" class="product-image" />
            
            <div class="product-info">
              <h3 class="product-name">{{ item.product.name }}</h3>
              <p class="product-price">CAD${{ item.product.price.toFixed(2) }}</p>
              
              <div class="quantity-controls">
                <button @click="decreaseQuantity(item)" class="quantity-btn">-</button>
                <span class="quantity-value">{{ item.quantity }}</span>
                <button @click="increaseQuantity(item)" class="quantity-btn">+</button>
              </div>
            </div>
          </div>

          <!-- 购物车总计 -->
          <div v-if="cartItems.length > 0" class="cart-summary">
            <div class="summary-row">
              <span>商品总数:</span>
              <span>{{ totalItems }} 件</span>
            </div>
            <div class="summary-row">
              <span>总计:</span>
              <span class="total-price">CAD${{ totalPrice.toFixed(2) }}</span>
            </div>
            
            <button @click="proceedToGroupOrder" class="checkout-btn">
              到店自提下单
            </button>
          </div>
        </div>
      </main>

      <SimpleFooter :activeTab="'cart'" @tab-change="handleTabChange" />
    </iPhoneFrame>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import iPhoneFrame from '../components/iPhoneFrame.vue';
import SimpleHeader from '../components/SimpleHeader.vue';
import SimpleFooter from '../components/SimpleFooter.vue';
import { api } from '../api.js';

const router = useRouter();
const cartItems = ref([]);
const currentUser = ref(null);

// 计算总数量和总价
const totalItems = computed(() => {
  return cartItems.value.reduce((total, item) => total + item.quantity, 0);
});

const totalPrice = computed(() => {
  return cartItems.value.reduce((total, item) => total + (item.product.price * item.quantity), 0);
});

// 获取购物车商品详情
const loadCartItems = async () => {
  try {
    const storedCart = localStorage.getItem('cart');
    if (!storedCart) {
      cartItems.value = [];
      return;
    }

    const cartData = JSON.parse(storedCart);
    const productIds = Object.keys(cartData);
    
    if (productIds.length === 0) {
      cartItems.value = [];
      return;
    }

    // 获取所有商品的最新信息
    const allProducts = await api.getProducts();
    const validProducts = allProducts.filter(product => 
      productIds.includes(product.id) && product.status !== false
    );

    // 构建购物车项目
    cartItems.value = validProducts.map(product => ({
      product: {
        ...product,
        price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
        image: product.image || 'https://placehold.co/100x100?text=No+Image',
        name: product.name || '未知商品'
      },
      quantity: cartData[product.id] || 1
    }));

    // 更新localStorage，移除无效商品
    const updatedCart = {};
    cartItems.value.forEach(item => {
      updatedCart[item.product.id] = item.quantity;
    });
    localStorage.setItem('cart', JSON.stringify(updatedCart));

  } catch (error) {
    console.error('加载购物车商品失败:', error);
    cartItems.value = [];
  }
};

// 减少商品数量
const decreaseQuantity = (item) => {
  if (item.quantity <= 1) {
    // 移除商品
    cartItems.value = cartItems.value.filter(i => i.product.id !== item.product.id);
    updateCartStorage();
  } else {
    item.quantity--;
    updateCartStorage();
  }
};

// 增加商品数量
const increaseQuantity = (item) => {
  item.quantity++;
  updateCartStorage();
};

// 更新购物车存储
const updateCartStorage = () => {
  const cartData = {};
  cartItems.value.forEach(item => {
    cartData[item.product.id] = item.quantity;
  });
  localStorage.setItem('cart', JSON.stringify(cartData));
};

// 跳转到团购订单页面
const proceedToGroupOrder = () => {
  if (cartItems.value.length === 0) return;
  
  // 确保有用户登录
  const storedUser = localStorage.getItem('currentUser');
  if (!storedUser || storedUser === 'null' || storedUser === 'undefined') {
    router.push('/auth');
    return;
  }
  
  router.push('/group-buying-order');
};

// 导航方法
const goBack = () => {
  router.go(-1);
};

const goToHome = () => {
  router.push('/');
};

const handleTabChange = (tabName) => {
  if (tabName === 'home') {
    router.push('/');
  } else if (tabName === 'goods') {
    router.push('/goods');
  } else if (tabName === 'cart') {
    // 已在购物车页面
  } else if (tabName === 'user') {
    router.push('/user');
  }
};

// 初始化页面
onMounted(async () => {
  try {
    // 获取当前用户
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
      try {
        currentUser.value = JSON.parse(storedUser);
      } catch (parseError) {
        console.error('解析用户数据失败:', parseError);
        currentUser.value = null;
        localStorage.removeItem('currentUser');
      }
    } else {
      currentUser.value = null;
    }
    
    if (!currentUser.value) {
      router.push('/auth');
      return;
    }
    
    // 加载购物车商品
    await loadCartItems();
    
  } catch (error) {
    console.error('初始化购物车页面失败:', error);
    router.push('/auth');
  }
});
</script>

<style scoped>
.cart-page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.main-content {
  padding: 16px 0;
  min-height: calc(100vh - 120px);
}

/* 空购物车样式 */
.empty-cart {
  text-align: center;
  padding: 60px 16px 80px;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 18px;
  margin: 0 0 24px 0;
  color: #666;
}

.go-home-btn {
  background: #07c160;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.go-home-btn:hover {
  background: #06a852;
}

/* 购物车商品列表 */
.cart-items {
  padding: 0 16px;
}

.cart-item {
  display: flex;
  padding: 16px 0;
  border-bottom: 1px solid #eee;
  align-items: flex-start;
}

.product-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 16px;
}

.product-info {
  flex: 1;
}

.product-name {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
}

.product-price {
  color: #e74c3c;
  font-weight: bold;
  margin-bottom: 12px;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantity-btn {
  width: 28px;
  height: 28px;
  border: 1px solid #ddd;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-value {
  min-width: 24px;
  text-align: center;
  font-weight: 500;
}

/* 购物车总计 */
.cart-summary {
  padding: 20px 16px 0;
  border-top: 1px solid #eee;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 16px;
}

.total-price {
  color: #e74c3c;
  font-weight: bold;
  font-size: 18px;
}

.checkout-btn {
  width: 100%;
  padding: 14px;
  background: #07c160;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 20px;
  transition: background 0.2s ease;
}

.checkout-btn:hover {
  background: #06a852;
}

.home-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #333;
  cursor: pointer;
  padding: 4px;
}
</style>