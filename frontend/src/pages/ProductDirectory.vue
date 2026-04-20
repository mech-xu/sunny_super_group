<template>
  <div class="product-directory">
    <iPhoneFrame>
      <WeChatHeader title="商品目录">
        <template #left>
          <button @click="goBack" class="back-btn">←</button>
        </template>
        <template #right>
          <button @click="showCart" class="cart-btn">🛒</button>
        </template>
      </WeChatHeader>

      <main class="main-content">
        <div class="welcome-section">
          <h2>欢迎回来，{{ currentUser?.nickname }}</h2>
          <p>精选团购商品</p>
        </div>

        <div class="filters">
          <select v-model="selectedMerchant" @change="filterByMerchant" class="category-select">
            <option value="">全部商家</option>
            <option v-for="merchant in merchants" :key="merchant.id" :value="merchant.id">
              {{ merchant.shop_name }}
            </option>
          </select>
        </div>

        <div class="products-grid">
          <div 
            v-for="product in filteredProducts" 
            :key="product.id" 
            class="product-card"
            @click="viewProduct(product)"
          >
            <div class="product-image" @click.stop="viewProductDetail(product)">
              <img :src="product.image || 'https://placehold.co/300x300?text=No+Image'" :alt="product.name" />
            </div>
            <div class="product-info">
              <h3 class="product-name">{{ product.name }}</h3>
              <p class="product-description">{{ product.description || '暂无描述' }}</p>
              <div class="product-price-cart">
                <span class="product-price">CAD ${{ product.price }}</span>
                <div class="quantity-controls">
                  <button @click.stop="decreaseQuantity(product)" class="quantity-btn">-</button>
                  <span class="quantity-value">{{ getQuantity(product) }}</span>
                  <button @click.stop="increaseQuantity(product)" class="quantity-btn">+</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <WeChatFooter :activeTab="currentActiveTab" @tab-change="handleTabChange" :cartItemCount="totalCartItems" />
    </iPhoneFrame>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import iPhoneFrame from '../components/iPhoneFrame.vue';
import WeChatHeader from '../components/WeChatHeader.vue';
import WeChatFooter from '../components/WeChatFooter.vue';
import { api } from '../api.js';

const router = useRouter();
const products = ref([]);
const cart = ref({});
const currentUser = ref(null);
const selectedMerchant = ref('');
const merchants = ref([]);

// 当前激活的底部标签
const currentActiveTab = ref('home');

// 计算属性：购物车总商品数量
const totalCartItems = computed(() => {
  return Object.values(cart.value).reduce((total, qty) => total + qty, 0);
});

// 从localStorage获取当前用户
onMounted(async () => {
  try {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      currentUser.value = JSON.parse(storedUser);
      
      // 获取商品数据
      const response = await api.getProducts();
      if (response) {
        products.value = response.map(p => ({
          ...p,
          price: typeof p.price === 'string' ? parseFloat(p.price) : p.price,
          image: p.image || 'https://placehold.co/300x300?text=No+Image',
          description: p.description || '暂无描述'
        }));
      }
      
      // 获取商家数据
      const merchantsResponse = await api.getMerchants();
      if (merchantsResponse) {
        merchants.value = merchantsResponse;
      }
      
      // 获取购物车数据
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        cart.value = JSON.parse(storedCart);
      }
    } else {
      router.push('/');
    }
  } catch (error) {
    console.error('Error initializing page:', error);
    router.push('/');
  }
});

// 过滤后的商品列表
const filteredProducts = computed(() => {
  if (!selectedMerchant.value) {
    return products.value;
  }
  return products.value.filter(p => p.merchant_id == selectedMerchant.value);
});

// 获取商品数量
const getQuantity = (product) => {
  return cart.value[product.id] || 0;
};

// 增加商品数量
const increaseQuantity = (product) => {
  if (!currentUser.value) {
    router.push('/');
    return;
  }

  const currentQty = cart.value[product.id] || 0;
  cart.value[product.id] = currentQty + 1;
  localStorage.setItem('cart', JSON.stringify(cart.value));
};

// 减少商品数量
const decreaseQuantity = (product) => {
  if (!cart.value[product.id]) return;

  const currentQty = cart.value[product.id];
  if (currentQty <= 1) {
    delete cart.value[product.id];  // 设置为0时从购物车中删除
  } else {
    cart.value[product.id] = currentQty - 1;
  }
  localStorage.setItem('cart', JSON.stringify(cart.value));
};

// 查看商品详情
const viewProductDetail = (product) => {
  router.push(`/products/${product.id}`);
};

// 查看商品（添加到购物车）
const viewProduct = (product) => {
  // 这里可以实现添加到购物车的逻辑
  console.log("Adding to cart:", product);
};

// 退出登录
const logout = () => {
  localStorage.removeItem('currentUser');
  router.push('/');
};

// 返回上一页
const goBack = () => {
  window.history.go(-1);
};

// 显示购物车
const showCart = () => {
  router.push('/cart');
};

// 按商家过滤
const filterByMerchant = () => {
  // 过滤逻辑已在computed属性中处理
};

// 底部标签切换
const handleTabChange = (tab) => {
  if (tab.name === 'cart') {
    // 检查购物车是否有商品，有则跳转到订单列表，否则提示用户
    if (totalCartItems.value > 0) {
      router.push('/my-orders');
    } else {
      alert('购物车为空，请先添加商品');
    }
  } else {
    currentActiveTab.value = tab.name;
    router.push(tab.path);
  }
};
</script>

<style scoped>
.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
}

.welcome-section {
  text-align: center;
  margin-bottom: 20px;
}

.welcome-section h2 {
  margin: 0 0 5px 0;
  font-size: 18px;
  color: #333;
}

.welcome-section p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.filters {
  margin-bottom: 16px;
}

.category-select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  font-size: 14px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.product-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  transition: box-shadow 0.3s;
  cursor: pointer;
}

.product-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.product-image {
  width: 100%;
  height: 120px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f8f8;
}

.product-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
}

.product-info {
  padding: 12px;
}

.product-name {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-description {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #888;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-price-cart {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  font-weight: bold;
  color: #e74c3c;
  font-size: 14px;
}

.quantity-controls {
  display: flex;
  align-items: center;
}

.quantity-btn {
  width: 24px;
  height: 24px;
  border: 1px solid #ddd;
  background: white;
  color: #666;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-value {
  margin: 0 8px;
  min-width: 20px;
  text-align: center;
  font-size: 14px;
  color: #333;
}

.back-btn, .cart-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #07c160;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}

.back-btn:hover, .cart-btn:hover {
  background: #f5f5f5;
}
</style>