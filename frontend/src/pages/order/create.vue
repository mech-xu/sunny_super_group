<template>
  <div class="order-create-page">
    <iPhoneFrame>
      <!-- 顶部导航栏 -->
      <SimpleHeader title="订单结算" :showBack="true" @back="goBack">
        <template #right>
          <div class="cart-icon">
            🛒 
            <span v-if="cartItemCount > 0" class="cart-badge">{{ cartItemCount }}</span>
          </div>
        </template>
      </SimpleHeader>

      <main class="main-content">
        <!-- 商家信息 -->
        <div class="pickup-section">
          <h3>自提点信息</h3>
          <div v-if="selectedMerchant" class="pickup-info">
            <div class="pickup-name">
              <strong>{{ t('common.merchantName') }}:</strong> {{ selectedMerchant.shop_name }}
            </div>
            <div class="pickup-address">
              <strong>{{ t('common.address') }}:</strong> {{ selectedMerchant.address || t('common.noAddress') }}
            </div>
            <div class="pickup-email">
              <strong>{{ t('common.email') }}:</strong> {{ selectedMerchant.email || t('common.noEmail') }}
            </div>
          </div>
          <div v-else class="pickup-default">
            <p>{{ t('common.noMerchant') }}</p>
          </div>
        </div>

        <!-- 订单商品 -->
        <div class="order-items-section">
          <h3>{{ t('order.products') }}</h3>
          <div class="order-item" v-for="(item, index) in orderItems" :key="index">
            <div class="item-info">
              <div class="item-name">{{ item.productName }}</div>
              <div class="item-price">CAD${{ item.price }} × {{ item.quantity }}</div>
            </div>
            <div class="item-total">CAD${{ (item.price * item.quantity).toFixed(2) }}</div>
          </div>
        </div>

        <!-- 费用明细 -->
        <div class="fee-section">
          <h3>{{ t('order.feeDetails') }}</h3>
          <div class="fee-item">
            <span>{{ t('order.subtotal') }}：</span>
            <span>CAD${{ subtotal.toFixed(2) }}</span>
          </div>
          <div class="fee-item discount">
            <span>{{ t('order.discount') }}：</span>
            <span>-CAD${{ discountAmount.toFixed(2) }}</span>
          </div>
          <div class="fee-item total">
            <span>{{ t('order.total') }}：</span>
            <span>CAD${{ totalAmount.toFixed(2) }}</span>
          </div>
        </div>

        <!-- 提交订单按钮 -->
        <div class="submit-section">
          <button @click="submitOrder" :disabled="!canSubmit" class="submit-btn">
            {{ t('common.submitOrder') }}
          </button>
          <div class="payment-info">{{ BUSINESS_RULES.paymentMethods.pickup }}</div>
        </div>
      </main>

      <SimpleFooter :activeTab="'cart'" @tab-change="handleTabChange" />
    </iPhoneFrame>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import iPhoneFrame from '../../components/iPhoneFrame.vue';
import SimpleHeader from '../../components/SimpleHeader.vue';
import SimpleFooter from '../../components/SimpleFooter.vue';
import { api } from '../../api.js';
import { BUSINESS_RULES } from '../../config/business.js';

const router = useRouter();
const route = useRoute();
const orderItems = ref([]);
const merchants = ref([]);
const currentUser = ref(null);

// 购物车商品数量
const cartItemCount = computed(() => {
  return orderItems.value.reduce((total, item) => total + item.quantity, 0);
});

// 商品小计
const subtotal = computed(() => {
  return orderItems.value.reduce((total, item) => total + (item.price * item.quantity), 0);
});

// 满减优惠 - 使用配置化规则
const discountAmount = computed(() => {
  if (!BUSINESS_RULES.discount.enabled) return 0;
  return subtotal.value >= BUSINESS_RULES.discount.threshold 
    ? BUSINESS_RULES.discount.amount 
    : 0;
});

// 订单总价
const totalAmount = computed(() => {
  return subtotal.value - discountAmount.value;
});

// 当前选中的商家ID（自动从商品中获取）
const selectedMerchantId = ref('');

// 是否可以提交订单
const canSubmit = computed(() => {
  return orderItems.value.length > 0 && selectedMerchantId.value !== '';
});

// 选中的商家信息
const selectedMerchant = computed(() => {
  return merchants.value.find(m => m.id === selectedMerchantId.value);
});

onMounted(async () => {
  try {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      currentUser.value = JSON.parse(storedUser);
      
      // 获取商家列表
      const merchantsResponse = await api.getMerchants();
      if (merchantsResponse) {
        merchants.value = merchantsResponse;
      }

      // 从路由参数获取订单数据
      if (route.query.orderData) {
        try {
          const parsedData = JSON.parse(decodeURIComponent(route.query.orderData));
          orderItems.value = Array.isArray(parsedData) ? parsedData : [];
          // 尝试从路由数据中的第一个商品获取商家ID
          if (orderItems.value.length > 0 && orderItems.value[0].merchant_id) {
             selectedMerchantId.value = orderItems.value[0].merchant_id;
          }
        } catch (e) {
          console.error('Failed to parse order data:', e);
          // 如果解析失败，尝试从localStorage获取购物车数据
          loadCartFromStorage();
        }
      } else {
        // 从购物车加载数据
        loadCartFromStorage();
      }
      
      // 验证商品是否存在
      if (orderItems.value.length === 0) {
        alert('购物车为空，请先添加商品');
        router.push('/cart');
      }
    } else {
      router.push('/auth');
    }
  } catch (error) {
    console.error('Error initializing order page:', error);
    router.push('/cart');
  }
});

// 从本地存储加载购物车数据
const loadCartFromStorage = async () => {
  const storedCart = localStorage.getItem('cart');
  if (storedCart) {
    const cartData = JSON.parse(storedCart);
    const productIds = Object.keys(cartData);
    
    if (productIds.length > 0) {
      try {
        // 获取所有商品信息
        const allProducts = await api.getProducts();
        const productsMap = {};
        allProducts.forEach(product => {
          productsMap[product.id] = product;
        });

        // 构建订单项目
        orderItems.value = productIds.map(productId => {
          const product = productsMap[productId];
          if (product) {
            return {
              id: product.id,
              productName: product.name,
              description: product.description,
              price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
              quantity: cartData[productId],
              stock: product.stock || 99,
              cartGoodsFlag: 1,
              merchant_id: product.merchant_id // 确保保存 merchant_id
            };
          }
          return null;
        }).filter(item => item !== null); // 过滤掉不存在的商品
        
        // 自动设置商家ID（从第一个商品获取）
        if (orderItems.value.length > 0 && orderItems.value[0].merchant_id) {
          selectedMerchantId.value = orderItems.value[0].merchant_id;
        }
        
        // 如果有商品已下架，提示用户
        if (Object.keys(cartData).length > orderItems.value.length) {
          alert('部分商品已下架，已自动移除');
        }
      } catch (error) {
        console.error('Failed to load products:', error);
        orderItems.value = [];
      }
    }
  }
};

// 导航方法
const goBack = () => {
  router.go(-1);
};

// 提交订单
const submitOrder = async () => {
  if (!canSubmit.value) return;

  try {
    // 验证商品库存
    const outOfStockItems = orderItems.value.filter(item => item.quantity > item.stock);
    if (outOfStockItems.length > 0) {
      alert('部分商品库存不足，请返回购物车修改');
      return;
    }

    // 创建订单数据
    const orderData = {
      merchant_id: selectedMerchantId.value,
      user_id: currentUser.value?.id,
      customer_nickname: currentUser.value?.nickname || '',
      phone: currentUser.value?.phone || '',
      notes: '',
      total_price: totalAmount.value,
      items: orderItems.value.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        name: item.productName
      }))
    };

    // 创建团购订单
    const response = await api.createGroupOrder(orderData);
    
    if (response && response.id) {
      // 清空购物车
      localStorage.removeItem('cart');
      
      // 跳转到订单成功页面或我的订单页面
      alert('订单提交成功！请凭取货码到店自提');
      router.push('/user');
    }
  } catch (error) {
    // Log the actual server response message if available
    const serverMessage = error.response?.data?.error || error.response?.data?.message || error.message;
    console.error('提交订单失败 (Server Error):', serverMessage);
    console.dir(error.response?.data); // Inspect the full error body from the server
    alert('提交订单失败：' + serverMessage);
  }
};

// 底部标签切换
const handleTabChange = (tab) => {
  router.push(tab.path);
};
</script>

<style scoped>
.order-create-page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
}

.cart-icon {
  position: relative;
  font-size: 18px;
}

.cart-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #e74c3c;
  color: white;
  font-size: 10px;
  font-weight: bold;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pickup-section {
  background: white;
  margin: 0 16px 16px;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.pickup-section h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #333;
}

.pickup-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pickup-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pickup-item label {
  font-weight: 500;
  color: #333;
}

.pickup-select, .time-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: white;
}

.pickup-details {
  padding: 12px;
  background: #f8f8f8;
  border-radius: 4px;
}

.merchant-name, .pickup-address, .pickup-email {
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}

.pickup-default {
  text-align: center;
  color: #999;
  font-size: 13px;
  padding: 12px;
}

.order-items-section {
  background: white;
  margin: 0 16px 16px;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.order-items-section h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #333;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.order-item:last-child {
  border-bottom: none;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.item-price {
  font-size: 12px;
  color: #666;
}

.item-total {
  font-weight: bold;
  color: #e74c3c;
}

.fee-section {
  background: white;
  margin: 0 16px 16px;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.fee-section h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #333;
}

.fee-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
  color: #666;
}

.fee-item.discount {
  color: #28a745;
}

.fee-item.total {
  font-weight: bold;
  color: #e74c3c;
  border-top: 1px solid #eee;
  padding-top: 12px;
}

.submit-section {
  text-align: center;
  padding: 0 16px;
}

.submit-btn {
  width: 100%;
  padding: 16px;
  background: #07c160;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s;
}

.submit-btn:hover:not(:disabled) {
  background: #06a852;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.payment-info {
  margin-top: 12px;
  font-size: 12px;
  color: #666;
}
</style>