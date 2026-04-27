<template>
  <div class="product-detail">
    <iPhoneFrame>
      <SimpleHeader title="商品详情" :showBack="true" @back="goBack" />

      <main class="main-content">
        <!-- 商品图片 -->
        <div class="product-image-section">
          <img :src="product.image || 'https://placehold.co/375x300?text=Product+Image'" :alt="product.name" class="product-main-image" />
        </div>

        <!-- 商品信息 -->
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
            <div class="meta-item" v-if="product.category">
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

      <SimpleFooter :activeTab="'category'" @tab-change="handleTabChange" />
    </iPhoneFrame>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import iPhoneFrame from '../../components/iPhoneFrame.vue';
import SimpleHeader from '../../components/SimpleHeader.vue';
import SimpleFooter from '../../components/SimpleFooter.vue';
import { api } from '../../api.js';

const router = useRouter();
const route = useRoute();

const product = ref({
  id: null,
  name: '加载中...',
  description: '',
  price: 0,
  stock: 0,
  category: '',
  image: ''
});
const originalPrice = ref(null);

// 获取商品详情
const loadProduct = async () => {
  try {
    // 兼容原有的 query.goodsId 和参考方案的 params.id
    const productId = route.query.goodsId || route.params.id;
    
    if (!productId) {
      console.error('缺少商品ID');
      alert('该商品已下架');
      router.push('/goods');
      return;
    }
    
    let productData = null;

    // 尝试使用 getProductById，如果不存在则回退到 getProducts 过滤
    if (typeof api.getProductById === 'function') {
      productData = await api.getProductById(productId);
    } else {
      const products = await api.getProducts();
      productData = products.find(p => p.id == productId);
    }

    if (productData) {
      product.value = {
        id: productData.id,
        name: productData.name,
        description: productData.description || '暂无描述',
        price: typeof productData.price === 'string' ? parseFloat(productData.price) : productData.price,
        stock: productData.stock || 99,
        category: productData.category || '',
        image: productData.image || 'https://placehold.co/375x300?text=No+Image'
      };

      // 如果有促销价格，设置原价
      if (productData.original_price) {
        originalPrice.value = productData.original_price;
      } else if (productData.originalPrice) {
         originalPrice.value = productData.originalPrice;
      }
    } else {
      console.error('商品不存在');
      alert('该商品已下架');
      router.push('/goods');
    }
  } catch (error) {
    console.error('加载商品详情失败:', error);
    alert('加载商品失败');
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
    router.push('/order/create');
  } catch (error) {
    console.error('立即购买失败:', error);
    alert('操作失败，请重试');
  }
};

// 导航方法
const goBack = () => {
  router.back();
};

// 底部标签切换
const handleTabChange = (tabName) => {
  if (tabName === 'home' || tabName === '/') {
    router.push('/');
  } else if (tabName === 'goods' || tabName === '/goods' || tabName === 'category') {
    router.push('/goods');
  } else if (tabName === 'cart' || tabName === '/cart') {
    router.push('/cart');
  } else if (tabName === 'user' || tabName === '/user') {
    router.push('/user');
  } else if (tabName && tabName.path) {
     // 兼容可能传递对象的情况
     router.push(tabName.path);
  }
};

// 初始化
onMounted(() => {
  loadProduct();
});
</script>

<style scoped>
.product-detail {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.main-content {
  padding: 16px 0;
  flex: 1;
  overflow-y: auto;
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
</style>