<template>
  <div class="group-buying-order">
    <iPhoneFrame>
      <SimpleHeader title="团购下单">
        <template #left>
          <button @click="goBack" class="back-btn">←</button>
        </template>
        <template #right>
          <button @click="goHome" class="home-btn">🏠</button>
        </template>
      </SimpleHeader>

      <main class="main-content">
        <!-- 订单标题 -->
        <div class="order-title">
          <h2>确认订单信息</h2>
          <p>请核对商品信息和收货信息</p>
        </div>

        <!-- 商品列表 -->
        <div class="order-items">
          <div 
            v-for="(item, index) in cartItems" 
            :key="index" 
            class="order-item"
          >
            <img :src="item.product.image" :alt="item.product.name" class="product-image" />
            <div class="product-info">
              <h3 class="product-name">{{ item.product.name }}</h3>
              <p class="product-price">CAD${{ item.product.price.toFixed(2) }} × {{ item.quantity }}</p>
              <p class="product-subtotal">小计: CAD${{ (item.product.price * item.quantity).toFixed(2) }}</p>
            </div>
          </div>
        </div>

        <!-- 订单总计 -->
        <div class="order-summary">
          <div class="summary-row">
            <span>商品总数:</span>
            <span>{{ totalItems }} 件</span>
          </div>
          <div class="summary-row">
            <span>订单总额:</span>
            <span class="total-price">CAD${{ totalPrice.toFixed(2) }}</span>
          </div>
        </div>

        <!-- 客户信息表单 -->
        <div class="customer-info">
          <h3>客户信息</h3>
          <div class="form-group">
            <label for="customerName">姓名 *</label>
            <input 
              type="text" 
              id="customerName"
              v-model="customerName"
              placeholder="请输入您的姓名"
              required
            />
          </div>
          <div class="form-group">
            <label for="customerPhone">手机号 *</label>
            <input 
              type="tel" 
              id="customerPhone"
              v-model="customerPhone"
              placeholder="请输入您的手机号"
              required
            />
          </div>
          <div class="form-group">
            <label for="orderNotes">订单备注</label>
            <textarea 
              id="orderNotes"
              v-model="orderNotes"
              placeholder="请输入特殊要求或备注（可选）"
              rows="3"
            ></textarea>
          </div>
        </div>

        <!-- 提交按钮 -->
        <button @click="submitOrder" class="submit-btn" :disabled="!canSubmit">
          提交订单
        </button>
      </main>

      <SimpleFooter :activeTab="currentActiveTab" @tab-change="handleTabChange" />
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
const merchants = ref([]);
const selectedMerchantId = ref('');
const customerName = ref('');
const customerPhone = ref('');
const orderNotes = ref('');
const currentActiveTab = ref('goods');

// 从localStorage获取用户信息
const currentUser = ref(null);

onMounted(async () => {
  try {
    // 获取当前用户 - 确保从后端API获取完整用户数据
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const localUser = JSON.parse(storedUser);
      
      // 如果本地用户没有有效的UUID ID，尝试从后端获取真实用户数据
      if (!localUser.id || !localUser.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        if (localUser.phone) {
          try {
            // 从后端API获取真实用户数据
            const encodedPhone = encodeURIComponent(localUser.phone);
            const userDataResponse = await apiClient.get(`/users?phone=eq.${encodedPhone}`);
            if (userDataResponse.data && userDataResponse.data.length > 0) {
              currentUser.value = userDataResponse.data[0];
              // 更新localStorage中的用户数据
              localStorage.setItem('currentUser', JSON.stringify(currentUser.value));
              customerName.value = currentUser.value.nickname || '';
              customerPhone.value = currentUser.value.phone || '';
            } else {
              currentUser.value = localUser;
              customerName.value = localUser.nickname || '';
              customerPhone.value = localUser.phone || '';
            }
          } catch (error) {
            console.error('从后端获取用户数据失败:', error);
            currentUser.value = localUser;
            customerName.value = localUser.nickname || '';
            customerPhone.value = localUser.phone || '';
          }
        } else {
          currentUser.value = localUser;
          customerName.value = localUser.nickname || '';
          customerPhone.value = localUser.phone || '';
        }
      } else {
        // 用户ID已经是有效的UUID格式
        currentUser.value = localUser;
        customerName.value = localUser.nickname || '';
        customerPhone.value = localUser.phone || '';
      }
    }

    // 获取购物车商品
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      const cartData = JSON.parse(storedCart);
      const productIds = Object.keys(cartData);
      
      if (productIds.length > 0) {
        // 获取所有商品信息
        const allProducts = await api.getProducts();
        const productsMap = {};
        allProducts.forEach(product => {
          productsMap[product.id] = product;
        });

        // 构建购物车项目
        cartItems.value = productIds.map(productId => ({
          product: productsMap[productId],
          quantity: cartData[productId]
        })).filter(item => item.product); // 过滤掉不存在的商品
      }
    }

    // 设置默认值
    if (currentUser.value) {
      customerName.value = currentUser.value.nickname || '';
      customerPhone.value = currentUser.value.phone || '';
    }
  } catch (error) {
    console.error('初始化订单页面失败:', error);
    alert('加载失败，请重试');
  }
});

// 计算总数量和总价
const totalItems = computed(() => {
  return cartItems.value.reduce((total, item) => total + item.quantity, 0);
});

const totalPrice = computed(() => {
  return cartItems.value.reduce((total, item) => total + (item.product.price * item.quantity), 0);
});

// 验证是否可以提交
const canSubmit = computed(() => {
  return customerName.value.trim() !== '' && 
         customerPhone.value.trim() !== '' && 
         cartItems.value.length > 0;
});

// 提交订单
const submitOrder = async () => {
  try {
    // 验证输入
    if (!canSubmit.value) {
      alert('请填写完整的客户信息');
      return;
    }

    // 创建订单数据
    const orderData = {
      user_id: currentUser.value.id,
      merchant_id: cartItems.value[0].product.merchant_id, // 假设所有商品来自同一个商家
      total_price: totalPrice.value,
      status: '待确认',
      items: cartItems.value.map(item => ({
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        price: item.product.price
      })),
      customer_nickname: customerName.value,
      phone: customerPhone.value,
      notes: orderNotes.value || ''
    };

    // 创建团购订单
    const response = await api.createGroupOrder(orderData);
    
    if (response && response.id) {
      // 清空购物车
      localStorage.removeItem('cart');
      // 跳转到个人中心页面（我的订单）
      router.push('/user');
    }
  } catch (error) {
    // Log the actual server response message if available
    const serverMessage = error.response?.data?.error || error.response?. data?.message || error.message;
    console.error('提交订单失败 (Server Error):', serverMessage);
    console.dir(error.response?.data); // Inspect the full error body from the server
    alert('提交订单失败：' + serverMessage);
  }
};

// 导航方法
const goBack = () => {
  router.go(-1);
};

const goHome = () => {
  router.push('/products');
};

const handleTabChange = (tabName) => {
  currentActiveTab.value = tabName;
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
</script>

<style scoped>
.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
}

.order-title {
  text-align: center;
  margin-bottom: 20px;
  padding: 0 16px;
}

.order-title h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #333;
}

.order-title p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.order-items {
  padding: 0 16px;
  margin-bottom: 20px;
}

.order-item {
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

.product-price, .product-subtotal {
  color: #e74c3c;
  font-weight: bold;
  margin: 4px 0;
}

.order-summary {
  padding: 0 16px 20px;
  border-bottom: 1px solid #eee;
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

.customer-info {
  padding: 0 16px 20px;
}

.customer-info h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #333;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}

.submit-btn {
  width: calc(100% - 32px);
  margin: 0 16px 20px;
  padding: 16px;
  background: #07c160;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  background: #06a852;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.back-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #333;
  cursor: pointer;
  padding: 4px;
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