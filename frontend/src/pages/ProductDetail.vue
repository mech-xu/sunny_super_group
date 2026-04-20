<template>
  <div class="product-detail">
    <iPhoneFrame>
      <WeChatHeader title="商品详情">
        <template #left>
          <button @click="goBack" class="back-btn">←</button>
        </template>
        <template #right>
          <button @click="toggleFavorite" class="favorite-btn">{{ isFavorite ? '❤️' : '🤍' }}</button>
        </template>
      </WeChatHeader>

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
              <span class="meta-label">销量:</span>
              <span class="meta-value">{{ product.sales_count || 0 }} 件</span>
            </div>
          </div>
        </div>

        <div class="product-specs-section">
          <h3>规格选择</h3>
          <div class="specs-options">
            <div 
              v-for="(spec, index) in specs" 
              :key="index"
              :class="['spec-option', { active: selectedSpec === spec.name }]"
              @click="selectSpec(spec.name)"
            >
              {{ spec.name }}
            </div>
          </div>
        </div>

        <div class="quantity-section">
          <h3>购买数量</h3>
          <div class="quantity-controls">
            <button @click="decreaseQuantity" class="quantity-btn" :disabled="quantity <= 1">-</button>
            <span class="quantity-value">{{ quantity }}</span>
            <button @click="increaseQuantity" class="quantity-btn" :disabled="quantity >= product.stock">+</button>
          </div>
        </div>

        <div class="product-details-section">
          <h3>商品详情</h3>
          <div class="details-content">
            <p v-for="(detail, index) in productDetails" :key="index" class="detail-paragraph">
              {{ detail }}
            </p>
          </div>
        </div>
      </main>

      <div class="action-bar">
        <div class="action-left">
          <button @click="goToCart" class="action-btn cart-btn">🛒 购物车</button>
          <button @click="callCustomerService" class="action-btn service-btn">📞 客服</button>
        </div>
        <div class="action-right">
          <button @click="addToCart" class="add-cart-btn">加入购物车</button>
          <button @click="buyNow" class="buy-now-btn">立即购买</button>
        </div>
      </div>
    </iPhoneFrame>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import iPhoneFrame from '../components/iPhoneFrame.vue';
import WeChatHeader from '../components/WeChatHeader.vue';

const router = useRouter();
const route = useRoute();

// 获取路由参数中的商品ID
const productId = route.params.id;

// 商品数据（实际项目中应从API获取）
const product = ref({
  id: 1,
  name: "示例商品",
  description: "这是一个示例商品的详细描述，展示了商品的主要特性和优势。",
  price: 29.99,
  stock: 50,
  sales_count: 128,
  image: "https://placehold.co/300x300?text=Product+Image"
});

// 响应式数据
const quantity = ref(1);
const selectedSpec = ref('');
const isFavorite = ref(false);

// 商品规格选项
const specs = ref([
  { name: 'S' },
  { name: 'M' },
  { name: 'L' },
  { name: 'XL' }
]);

// 商品详情描述
const productDetails = ref([
  "高品质材料制作，经久耐用",
  "精美工艺，细节处理到位",
  "舒适体验，适合日常使用",
  "多种颜色可选，满足不同喜好",
  "环保材料，安全健康"
]);

// 原价（如果有折扣的话）
const originalPrice = computed(() => {
  // 示例：如果有折扣，显示原价
  return product.value.price > 25 ? (product.value.price + 10).toFixed(2) : null;
});

// 选择规格
const selectSpec = (specName) => {
  selectedSpec.value = specName;
};

// 增加数量
const increaseQuantity = () => {
  if(quantity.value < product.value.stock) {
    quantity.value++;
  } else {
    alert('库存不足');
  }
};

// 减少数量
const decreaseQuantity = () => {
  if(quantity.value > 1) {
    quantity.value--;
  }
};

// 添加到购物车
const addToCart = () => {
  // 获取当前购物车数据
  const cart = JSON.parse(localStorage.getItem('cart') || '{}');
  
  // 更新商品数量
  const currentQty = cart[product.value.id] || 0;
  cart[product.value.id] = currentQty + quantity.value;
  
  // 保存到本地存储
  localStorage.setItem('cart', JSON.stringify(cart));
  
  alert('已添加到购物车');
};

// 立即购买
const buyNow = () => {
  // 创建订单数据
  const orderItem = {
    id: product.value.id,
    productName: product.value.name,
    description: product.value.description,
    price: product.value.price,
    quantity: quantity.value,
    stock: product.value.stock,
    cartGoodsFlag: 1  // 标记为已加入购物车的商品
  };
  
  // 跳转到订单预览页面
  router.push({
    name: 'OrderPreview',
    query: { 
      orderData: encodeURIComponent(JSON.stringify([orderItem])) 
    }
  });
};

// 切换收藏状态
const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value;
  const message = isFavorite.value ? '已收藏' : '已取消收藏';
  alert(message);
};

// 返回上一页
const goBack = () => {
  window.history.go(-1);
};

// 去购物车页面
const goToCart = () => {
  router.push('/cart');
};

// 联系客服
const callCustomerService = () => {
  alert('请联系客服：400-123-4567');
};
</script>

<style scoped>
.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 0 60px 0; /* 为底部操作栏留出空间 */
}

.product-image-section {
  width: 100%;
  height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f8f8;
}

.product-main-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
}

.product-info-section {
  padding: 15px;
  background: white;
  margin-bottom: 10px;
}

.product-name {
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: bold;
  color: #333;
  line-height: 1.3;
}

.product-description {
  margin: 0 0 15px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.4;
}

.product-price-section {
  margin: 15px 0;
}

.current-price {
  font-size: 22px;
  font-weight: bold;
  color: #e74c3c;
  margin-right: 10px;
}

.original-price {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.meta-item {
  display: flex;
  flex-direction: column;
}

.meta-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 3px;
}

.meta-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.product-specs-section, 
.quantity-section, 
.product-details-section {
  background: white;
  padding: 15px;
  margin-bottom: 10px;
}

.product-specs-section h3, 
.quantity-section h3, 
.product-details-section h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #333;
}

.specs-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.spec-option {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
}

.spec-option.active {
  border-color: #07c160;
  color: #07c160;
  background-color: rgba(7, 193, 96, 0.1);
}

.quantity-controls {
  display: flex;
  align-items: center;
}

.quantity-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  background: white;
  color: #666;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-value {
  margin: 0 15px;
  min-width: 20px;
  text-align: center;
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.details-content {
  line-height: 1.6;
}

.detail-paragraph {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 14px;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  height: 50px;
  background: white;
  border-top: 1px solid #eee;
  z-index: 100;
}

.action-left {
  display: flex;
  width: 40%;
}

.action-right {
  display: flex;
  width: 60%;
}

.action-btn {
  flex: 1;
  border: none;
  background: white;
  border-right: 1px solid #eee;
  font-size: 12px;
  color: #666;
  cursor: pointer;
}

.add-cart-btn {
  background: #ffd95a;
  color: #333;
  border: none;
  font-size: 14px;
}

.buy-now-btn {
  background: #ff6700;
  color: white;
  border: none;
  font-size: 14px;
}

.back-btn, .favorite-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #07c160;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}

.back-btn:hover, .favorite-btn:hover {
  background: #f5f5f5;
}
</style>