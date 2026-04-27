<template>
  <div class="product-detail">
    <iPhoneFrame>
      <SimpleHeader title="商品详情" :showBack="true" @back="goBack">
        <template #right>
          <button @click="toggleFavorite" class="favorite-btn">{{ isFavorite ? '❤️' : '🤍' }}</button>
        </template>
      </SimpleHeader>

      <main class="main-content">
        <div class="product-image-section">
          <img :src="product.image" :alt="product.name" class="product-main-image" />
        </div>

        <div class="product-info-section">
          <h1 class="product-name">{{ product.name }}</h1>
          <p class="product-description">{{ product.description }}</p>
          
          <div class="product-price-section">
            <span class="current-price">CAD ${{ product.price }}</span>
            <span v-if="originalPrice" class="original-price">CAD ${{ originalPrice }}</span>
          </div>
          
          <div class="product-meta">
            <div class="meta-item">
              <span class="meta-label">库存:</span>
              <span class="meta-value">{{ product.stock }} 件</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">分类:</span>
              <span class="meta-value">{{ product.category }}</span>
            </div>
          </div>
          
          <div class="action-buttons">
            <button @click="addToCart" class="add-to-cart-btn">加入购物车</button>
            <button @click="buyNow" class="buy-now-btn">立即购买</button>
          </div>
        </div>
      </main>

      <SimpleFooter :activeTab="'goods'" @tab-change="handleTabChange" />
    </iPhoneFrame>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import iPhoneFrame from '../components/iPhoneFrame.vue';
import SimpleHeader from '../components/SimpleHeader.vue';
import SimpleFooter from '../components/SimpleFooter.vue';
import { api } from '../api.js';

const router = useRouter();
const route = useRoute();

const product = ref({
  id: null,
  name: '',
  description: '',
  price: 0,
  stock: 0,
  category: '',
  image: ''
});
const originalPrice = ref(null);
const isFavorite = ref(false);

// 获取商品详情
const loadProduct = async () => {
  try {
    const productId = route.params.id;
    if (!productId) {
      console.error('缺少商品ID');
      router.push('/goods');
      return;
    }
    
    const productData = await api.getProductById(productId);
    if (productData) {
      product.value = productData;
      // 如果有促销价格，设置原价
      if (productData.original_price) {
        originalPrice.value = productData.original_price;
      }
    } else {
      console.error('商品不存在');
      router.push('/goods');
    }
  } catch (error) {
    console.error('加载商品详情失败:', error);
    router.push('/goods');
  }
};

// 添加到购物车
const addToCart = () => {
  try {
    const cart = localStorage.getItem('cart') || '{}';
    const cartObj = JSON.parse(cart);
    
    cartObj[product.value.id] = (cartObj[product.value.id] || 0) + 1;
    
    localStorage.setItem('cart', JSON.stringify(cartObj));
    alert(`${product.value.name} 已添加到购物车`);
  } catch (error) {
    console.error('添加到购物车失败:', error);
    alert('添加失败，请重试');
  }
};

// 立即购买
const buyNow = () => {
  // 设置购物车并跳转到结算页面
  try {
    const cart = {};
    cart[product.value.id] = 1;
    localStorage.setItem('cart', JSON.stringify(cart));
    router.push('/checkout');
  } catch (error) {
    console.error('立即购买失败:', error);
    alert('操作失败，请重试');
  }
};

// 收藏/取消收藏
const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value;
  // 这里可以添加实际的收藏逻辑
  alert(isFavorite.value ? '已收藏' : '已取消收藏');
};

// 导航方法
const goBack = () => {
  router.back();
};

// 底部标签切换
const handleTabChange = (tabName) => {
  if (tabName === 'home') {
    router.push('/');
  } else if (tabName === 'goods') {
    router.push('/goods');
  } else if (tabName === 'cart') {
    router.push('/cart');
  } else if (tabName === 'user') {
    router.push('/user');
  }
};

// 初始化
onMounted(() => {
  loadProduct();
});
</script>

<style scoped>
.main-content {
  padding: 16px 0;
}

.product-image-section {
  padding: 0 16px 16px;
}

.product-main-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: 12px;
}

.product-info-section {
  padding: 0 16px;
}

.product-name {
  font-size: 24px;
  font-weight: bold;
  margin: 0 0 16px 0;
  color: #333;
}

.product-description {
  font-size: 16px;
  color: #666;
  line-height: 1.5;
  margin: 0 0 24px 0;
}

.product-price-section {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.current-price {
  font-size: 28px;
  font-weight: bold;
  color: #e74c3c;
  margin-right: 16px;
}

.original-price {
  font-size: 18px;
  color: #999;
  text-decoration: line-through;
}

.product-meta {
  margin-bottom: 24px;
}

.meta-item {
  display: flex;
  margin-bottom: 12px;
}

.meta-label {
  font-weight: bold;
  color: #333;
  min-width: 60px;
}

.meta-value {
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 16px;
}

.add-to-cart-btn {
  flex: 1;
  padding: 16px;
  background: #f8f9fa;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.add-to-cart-btn:hover {
  background: #e9ecef;
}

.buy-now-btn {
  flex: 1;
  padding: 16px;
  background: #07c160;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.buy-now-btn:hover {
  background: #06a852;
}

.favorite-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
}
</style>