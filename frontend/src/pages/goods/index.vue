<template>
  <div class="goods-page">
    <iPhoneFrame>
      <!-- 顶部导航栏 -->
      <SimpleHeader :title="currentMerchantName" :showBack="true" @back="goBack">
        <template #right>
          <button @click="goToCart" class="cart-btn">🛒
            <span v-if="cartItemCount > 0" class="cart-badge">{{ cartItemCount }}</span>
          </button>
        </template>
      </SimpleHeader>

      <main class="main-content">
        <!-- 搜索框 -->
        <div class="search-section">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="搜索商品..." 
            class="search-input"
            @keyup.enter="searchProducts"
          />
        </div>

        <!-- 商品列表 -->
        <div class="product-list">
          <div 
            v-for="product in filteredProducts" 
            :key="product.id" 
            class="product-card" 
            @click="viewProductDetail(product)"
          >
            <div class="product-image">
              <img :src="product.image || 'https://placehold.co/120x120?text=Product'" :alt="product.name" />
            </div>
            <div class="product-info">
              <h3 class="product-name">{{ product.name }}</h3>
              <p class="product-description">{{ product.description }}</p>
              <div class="product-price">CAD${{ product.price }}</div>
            </div>
          </div>
          
          <div v-if="filteredProducts.length === 0" class="no-products">
            暂无商品数据
          </div>
        </div>
      </main>

      <!-- 商品详情弹出模态框 -->
      <div v-if="showProductModal && selectedProduct" class="product-modal-overlay" @click="closeProductModal">
        <div class="product-modal" @click.stop>
          <div class="modal-header">
            <h3>{{ selectedProduct.name }}</h3>
            <button @click="closeProductModal" class="close-btn">×</button>
          </div>
          <div class="modal-content">
            <img :src="selectedProduct.image || 'https://placehold.co/300x300?text=Product'" :alt="selectedProduct.name" class="modal-image" />
            <div class="modal-details">
              <p class="modal-description">{{ selectedProduct.description }}</p>
              <div class="modal-price">价格: CAD${{ selectedProduct.price }}</div>
              <div class="quantity-selector">
                <button @click="decreaseQuantity" class="quantity-btn">-</button>
                <span class="quantity">{{ selectedQuantity }}</span>
                <button @click="increaseQuantity" class="quantity-btn">+</button>
              </div>
              <button @click="addToCartFromModal" class="add-to-cart-btn">加入购物车</button>
            </div>
          </div>
        </div>
      </div>

      <SimpleFooter :activeTab="'goods'" @tab-change="handleTabChange" />
    </iPhoneFrame>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import iPhoneFrame from '../../components/iPhoneFrame.vue';
import SimpleHeader from '../../components/SimpleHeader.vue';
import SimpleFooter from '../../components/SimpleFooter.vue';
import { api } from '../../api.js';

const router = useRouter();
const route = useRoute();

// 状态管理
const currentMerchantName = ref('商品列表');
const products = ref([]);
const searchQuery = ref('');
const showProductModal = ref(false);
const selectedProduct = ref(null);
const selectedQuantity = ref(1);

// 从localStorage获取购物车数量
const cartItemCount = computed(() => {
  try {
    const cart = localStorage.getItem('cart');
    if (!cart) return 0;
    const cartObj = JSON.parse(cart);
    return Object.values(cartObj).reduce((sum, qty) => sum + qty, 0);
  } catch (error) {
    console.error('获取购物车数量失败:', error);
    return 0;
  }
});

// 过滤后的商品列表
const filteredProducts = computed(() => {
  if (!searchQuery.value) {
    return products.value;
  }
  const query = searchQuery.value.toLowerCase();
  return products.value.filter(product => 
    product.name.toLowerCase().includes(query) ||
    product.description.toLowerCase().includes(query)
  );
});

// 获取商品数据
const loadProducts = async () => {
  try {
    // 使用查询参数 merchantId 而不是路由参数
    const merchantId = route.query.merchantId;
    if (merchantId) {
      // 如果有商户ID，获取特定商户的商品
      const merchantData = await api.getMerchantById(merchantId);
      if (merchantData) {
        currentMerchantName.value = merchantData.shop_name || merchantData.name;
      }
      const productData = await api.getProductsByMerchant(merchantId);
      products.value = productData || [];
    } else {
      // 获取所有商品
      const productData = await api.getProducts();
      products.value = productData || [];
    }
  } catch (error) {
    console.error('加载商品失败:', error);
    products.value = [];
  }
};

// 搜索商品
const searchProducts = () => {
  // 搜索逻辑已在 computed 中处理
};

// 查看商品详情
const viewProductDetail = (product) => {
  selectedProduct.value = product;
  selectedQuantity.value = 1;
  showProductModal.value = true;
};

// 关闭商品详情模态框
const closeProductModal = () => {
  showProductModal.value = false;
  selectedProduct.value = null;
  selectedQuantity.value = 1;
};

// 调整商品数量
const increaseQuantity = () => {
  selectedQuantity.value++;
};

const decreaseQuantity = () => {
  if (selectedQuantity.value > 1) {
    selectedQuantity.value--;
  }
};

// 从模态框添加到购物车
const addToCartFromModal = () => {
  if (!selectedProduct.value) return;
  
  try {
    const cart = localStorage.getItem('cart') || '{}';
    const cartObj = JSON.parse(cart);
    
    const productId = selectedProduct.value.id;
    cartObj[productId] = (cartObj[productId] || 0) + selectedQuantity.value;
    
    localStorage.setItem('cart', JSON.stringify(cartObj));
    alert(`${selectedProduct.value.name} × ${selectedQuantity.value} 已添加到购物车`);
    closeProductModal();
  } catch (error) {
    console.error('添加到购物车失败:', error);
    alert('添加失败，请重试');
  }
};

// 导航方法
const goBack = () => {
  router.back();
};

const goToCart = () => {
  router.push('/cart');
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
  loadProducts();
});
</script>

<style scoped>
/* 样式保持不变 */
.goods-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.search-section {
  margin-bottom: 16px;
}

.search-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 16px;
}

.product-list {
  display: grid;
  gap: 16px;
}

.product-card {
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.product-card:hover {
  transform: translateY(-2px);
}

.product-image img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 12px;
}

.product-info {
  flex: 1;
}

.product-name {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
}

.product-description {
  margin: 0 0 8px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.4;
}

.product-price {
  color: #e74c3c;
  font-weight: bold;
  font-size: 16px;
}

.no-products {
  text-align: center;
  padding: 32px;
  color: #999;
}

.cart-btn {
  position: relative;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
}

.cart-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #e74c3c;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 商品详情模态框样式 */
.product-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.product-modal {
  background: white;
  border-radius: 16px;
  max-width: 90%;
  max-height: 90%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
}

.modal-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.modal-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 16px;
}

.modal-details {
  flex: 1;
}

.modal-description {
  margin: 0 0 16px 0;
  color: #666;
  line-height: 1.5;
}

.modal-price {
  font-size: 18px;
  color: #e74c3c;
  font-weight: bold;
  margin-bottom: 16px;
}

.quantity-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.quantity-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  background: white;
  font-size: 18px;
  cursor: pointer;
}

.quantity {
  width: 40px;
  text-align: center;
  font-size: 16px;
}

.add-to-cart-btn {
  width: 100%;
  padding: 12px;
  background: #07c160;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.add-to-cart-btn:hover {
  background: #06a852;
}
</style>