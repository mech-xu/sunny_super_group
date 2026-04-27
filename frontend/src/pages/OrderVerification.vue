<template>
  <div class="order-verification">
    <iPhoneFrame>
      <SimpleHeader title="订单核销" :showBack="true" @back="goBack">
        <template #right>
          <button @click="goHome" class="home-btn">🏠</button>
        </template>
      </SimpleHeader>

      <main class="main-content">
        <div class="verification-title">
          <h2>订单核销</h2>
          <p>输入取货码验证订单</p>
        </div>

        <!-- 取货码输入 -->
        <div class="pickup-code-section">
          <div class="form-group">
            <label>取货码:</label>
            <input 
              type="text" 
              v-model="pickupCode" 
              placeholder="请输入6位取货码"
              class="form-input pickup-input"
              @keyup.enter="verifyOrder"
            />
          </div>
          <button 
            @click="verifyOrder"
            :disabled="!pickupCode || pickupCode.length !== 6"
            class="verify-btn"
          >
            验证订单
          </button>
        </div>

        <!-- 订单信息显示 -->
        <div v-if="verifiedOrder" class="order-info-section">
          <div class="order-header">
            <h3>订单信息</h3>
            <span class="order-status" :class="`status-${verifiedOrder.status}`">
              {{ getStatusText(verifiedOrder.status) }}
            </span>
          </div>
          
          <div class="order-details">
            <div class="detail-item">
              <span class="detail-label">订单号:</span>
              <span class="detail-value">{{ verifiedOrder.order_number }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">下单时间:</span>
              <span class="detail-value">{{ formatTime(verifiedOrder.created_at) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">商品:</span>
              <div class="products-list">
                <div 
                  v-for="item in verifiedOrder.items" 
                  :key="item.id"
                  class="product-item"
                >
                  <span>{{ item.name }} × {{ item.quantity }}</span>
                  <span>CAD ${{ (item.price * item.quantity).toFixed(2) }}</span>
                </div>
              </div>
            </div>
            <div class="detail-item total-row">
              <span class="detail-label">总计:</span>
              <span class="detail-value total-amount">CAD ${{ verifiedOrder.total_amount.toFixed(2) }}</span>
            </div>
          </div>

          <!-- 核销操作按钮 -->
          <div v-if="verifiedOrder.status === 'pending'" class="action-buttons">
            <button @click="confirmPickup" class="confirm-btn">确认取货</button>
            <button @click="cancelVerification" class="cancel-btn">取消</button>
          </div>
        </div>

        <!-- 错误信息 -->
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </main>

      <SimpleFooter :activeTab="'goods'" @tab-change="handleTabChange" />
    </iPhoneFrame>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import iPhoneFrame from '../components/iPhoneFrame.vue';
import SimpleHeader from '../components/SimpleHeader.vue';
import SimpleFooter from '../components/SimpleFooter.vue';
import { api } from '../api.js';

const router = useRouter();

const pickupCode = ref('');
const verifiedOrder = ref(null);
const errorMessage = ref('');

// 获取订单状态文本
const getStatusText = (status) => {
  const statusMap = {
    'pending': '待取货',
    'completed': '已完成',
    'cancelled': '已取消'
  };
  return statusMap[status] || status;
};

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 验证订单
const verifyOrder = async () => {
  if (!pickupCode.value || pickupCode.value.length !== 6) {
    errorMessage.value = '请输入6位取货码';
    return;
  }

  try {
    errorMessage.value = '';
    const orderData = await api.verifyOrder(pickupCode.value);
    if (orderData) {
      verifiedOrder.value = orderData;
    } else {
      errorMessage.value = '未找到对应的订单，请检查取货码是否正确';
    }
  } catch (error) {
    console.error('验证订单失败:', error);
    errorMessage.value = '验证失败，请稍后重试';
  }
};

// 确认取货
const confirmPickup = async () => {
  if (!verifiedOrder.value) return;

  try {
    await api.confirmOrderPickup(verifiedOrder.value.id);
    alert('订单已成功核销！');
    // 重置表单
    pickupCode.value = '';
    verifiedOrder.value = null;
  } catch (error) {
    console.error('确认取货失败:', error);
    alert('核销失败，请稍后重试');
  }
};

// 取消验证
const cancelVerification = () => {
  verifiedOrder.value = null;
  pickupCode.value = '';
};

// 导航方法
const goBack = () => {
  router.back();
};

const goHome = () => {
  router.push('/');
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
</script>

<style scoped>
.main-content {
  padding: 16px 0;
}

.verification-title {
  text-align: center;
  padding: 0 16px 24px;
}

.verification-title h2 {
  font-size: 24px;
  margin: 0 0 8px 0;
  color: #333;
}

.verification-title p {
  color: #666;
  font-size: 16px;
}

.pickup-code-section {
  padding: 0 16px 24px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #333;
}

.pickup-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  text-align: center;
  letter-spacing: 2px;
}

.verify-btn {
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

.verify-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.order-info-section {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin: 0 16px 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.order-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.order-status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-completed {
  background: #d4edda;
  color: #155724;
}

.status-cancelled {
  background: #f8d7da;
  color: #721c24;
}

.order-details {
  margin-bottom: 16px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.detail-label {
  font-weight: bold;
  color: #333;
}

.detail-value {
  color: #666;
}

.products-list {
  text-align: right;
}

.product-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 14px;
}

.total-row {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 2px solid #eee;
}

.total-amount {
  font-size: 18px;
  font-weight: bold;
  color: #e74c3c;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.confirm-btn {
  flex: 1;
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

.confirm-btn:hover {
  background: #06a852;
}

.cancel-btn {
  flex: 1;
  padding: 12px;
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

.error-message {
  text-align: center;
  color: #e74c3c;
  font-weight: bold;
  padding: 16px;
  margin: 0 16px;
}

.home-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
}
</style>