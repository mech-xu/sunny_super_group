<template>
  <div class="order-preview">
    <iPhoneFrame>
      <SimpleHeader title="订单确认" :showBack="true" @back="goBack" />

      <main class="main-content">
        <!-- 商家信息 -->
        <div class="merchant-section">
          <h3>商家信息</h3>
          <div class="merchant-info">
            <div class="merchant-name">
              <strong>{{ merchant?.shop_name || '未知商家' }}</strong>
            </div>
            <div class="merchant-address">
              {{ merchant?.address || '暂无地址信息' }}
            </div>
          </div>
        </div>

        <!-- 商品列表 -->
        <div class="products-section">
          <h3>商品清单</h3>
          <div class="product-item" v-for="item in orderItems" :key="item.id">
            <img :src="item.image || 'https://placehold.co/60x60?text=Product'" alt="商品图片" class="product-image" />
            <div class="product-details">
              <div class="product-name">{{ item.name }}</div>
              <div class="product-price">CAD ${{ item.price }} × {{ item.quantity }}</div>
            </div>
            <div class="product-total">CAD ${{ (item.price * item.quantity).toFixed(2) }}</div>
          </div>
        </div>

        <!-- 订单总计 -->
        <div class="order-summary">
          <div class="summary-row">
            <span>商品总额:</span>
            <span>CAD ${{ subtotal.toFixed(2) }}</span>
          </div>
          <div class="summary-row">
            <span>配送费:</span>
            <span>CAD ${{ deliveryFee.toFixed(2) }}</span>
          </div>
          <div class="summary-row total">
            <span>总计:</span>
            <span>CAD ${{ totalAmount.toFixed(2) }}</span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <button @click="confirmOrder" class="confirm-btn">确认下单</button>
          <button @click="goBack" class="cancel-btn">返回修改</button>
        </div>
      </main>

      <SimpleFooter :activeTab="'cart'" @tab-change="handleTabChange" />
    </iPhoneFrame>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import iPhoneFrame from '../components/iPhoneFrame.vue';
import SimpleHeader from '../components/SimpleHeader.vue';
import SimpleFooter from '../components/SimpleFooter.vue';
import { api } from '../api.js';

const router = useRouter();
const route = useRoute();

const merchant = ref(null);
const orderItems = ref([]);
const deliveryFee = ref(5.00);

// 计算商品总额
const subtotal = computed(() => {
  return orderItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0);
});

// 计算总金额
const totalAmount = computed(() => {
  return subtotal.value + deliveryFee.value;
});

// 加载订单预览数据
const loadOrderPreview = async () => {
  try {
    // 从路由参数或localStorage获取订单数据
    const cartData = localStorage.getItem('cart');
    if (!cartData) {
      alert('购物车为空');
      router.push('/cart');
      return;
    }
    
    const cart = JSON.parse(cartData);
    const productIds = Object.keys(cart);
    if (productIds.length === 0) {
      alert('购物车为空');
      router.push('/cart');
      return;
    }
    
    // 获取商品详情
    const products = await api.getProductsByIds(productIds);
    orderItems.value = products.map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: cart[product.id],
      image: product.image
    }));
    
    // 获取商家信息
    if (products.length > 0 && products[0].merchant_id) {
      merchant.value = await api.getMerchantById(products[0].merchant_id);
    }
    
  } catch (error) {
    console.error('加载订单预览失败:', error);
    alert('加载订单信息失败');
    router.push('/cart');
  }
};

// 确认下单
const confirmOrder = async () => {
  try {
    const orderData = {
      merchant_id: merchant.value?.id,
      items: orderItems.value.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      })),
      total_amount: totalAmount.value,
      delivery_fee: deliveryFee.value
    };
    
    const result = await api.createOrder(orderData);
    if (result && result.order_id) {
      localStorage.removeItem('cart');
      alert('订单创建成功！');
      router.push(`/order/${result.order_id}`);
    }
  } catch (error) {
    console.error('创建订单失败:', error);
    alert('下单失败，请重试');
  }
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
  loadOrderPreview();
});
</script>

<style scoped>
.main-content {
  padding: 16px 0;
}

.merchant-section {
  padding: 0 16px 16px;
}

.merchant-section h3 {
  margin: 0 0 12px 0;
  font-size: 18px;
  color: #333;
}

.merchant-info {
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.merchant-name {
  font-size: 16px;
  margin-bottom: 8px;
}

.merchant-address {
  color: #666;
  font-size: 14px;
}

.products-section {
  padding: 0 16px 16px;
}

.products-section h3 {
  margin: 0 0 12px 0;
  font-size: 18px;
  color: #333;
}

.product-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: white;
  margin-bottom: 8px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.product-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 12px;
}

.product-details {
  flex: 1;
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.product-price {
  color: #666;
  font-size: 12px;
}

.product-total {
  font-weight: bold;
  color: #e74c3c;
}

.order-summary {
  padding: 0 16px 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.summary-row:last-child {
  border-bottom: none;
}

.total {
  font-size: 18px;
  font-weight: bold;
  color: #e74c3c;
  padding-top: 16px;
  border-top: 2px solid #eee;
}

.action-buttons {
  padding: 0 16px;
  display: flex;
  gap: 12px;
}

.confirm-btn {
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

.confirm-btn:hover {
  background: #06a852;
}

.cancel-btn {
  flex: 1;
  padding: 16px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.cancel-btn:hover {
  background: #5a6268;
}
</style>