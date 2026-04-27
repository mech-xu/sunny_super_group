<template>
  <div v-if="show" class="order-detail-modal-overlay" @click="closeModal">
    <div class="order-detail-modal" @click.stop>
      <!-- 关闭按钮 -->
      <button class="close-button" @click="closeModal">✕</button>
      
      <!-- 取货码 -->
      <div class="pickup-code-section" v-if="order.pickup_code">
        <h3>取货码</h3>
        <div class="pickup-code">{{ order.pickup_code }}</div>
      </div>
      
      <!-- 自提点信息（仅显示一次） -->
      <div class="pickup-point-section">
        <!-- 商家名称 -->
        <div class="merchant-info">
          <div class="info-label">商家名称:</div>
          <div class="info-value">{{ merchantInfo.shop_name || '暂无商家信息' }}</div>
        </div>
        
        <!-- 地址 -->
        <div class="address-info">
          <div class="info-label">地址:</div>
          <div class="info-value">{{ merchantInfo.address || '暂无地址信息' }}</div>
        </div>
        
        <!-- Email -->
        <div class="email-info">
          <div class="info-label">Email:</div>
          <div class="info-value">{{ merchantInfo.email || '暂无邮箱信息' }}</div>
        </div>
      </div>
      
      <!-- 商家微信收款二维码 -->
      <div class="payment-qrcode-section">
        <h3>商家微信收款二维码</h3>
        <div class="qrcode-placeholder">
          <img src="https://placehold.co/200x200?text=微信收款码" alt="微信收款二维码" />
          <p class="qrcode-note">请向商家出示此二维码付款</p>
        </div>
      </div>
      
      <!-- 订单基本信息 -->
      <div class="order-basic-info">
        <div class="order-info-row">
          <span class="label">订单编号:</span>
          <span class="value">{{ order.order_no || 'N/A' }}</span>
        </div>
        <div class="order-info-row">
          <span class="label">下单时间:</span>
          <span class="value">{{ formatDate(order.created_at) }}</span>
        </div>
        <div class="order-info-row">
          <span class="label">订单状态:</span>
          <span class="value">{{ getStatusText(order.status) }}</span>
        </div>
        <div class="order-info-row">
          <span class="label">联系人:</span>
          <span class="value">{{ order.customer_nickname || '未设置' }}</span>
        </div>
        <div class="order-info-row">
          <span class="label">手机号:</span>
          <span class="value">{{ formatPhone(order.phone) }}</span>
        </div>
        <div class="order-info-row" v-if="order.notes">
          <span class="label">备注:</span>
          <span class="value">{{ order.notes }}</span>
        </div>
      </div>
      
      <!-- 订单商品 -->
      <div class="order-items-section">
        <h3>订单商品</h3>
        <div class="order-item" v-for="(item, index) in order.items" :key="index">
          <div class="item-name">{{ item.name }}</div>
          <div class="item-details">
            <span class="item-price">CAD ${{ item.price }}</span>
            <span class="item-quantity">×{{ item.quantity }}</span>
            <span class="item-total">CAD ${{ (item.price * item.quantity).toFixed(2) }}</span>
          </div>
        </div>
      </div>
      
      <!-- 订单总计 -->
      <div class="order-summary">
        <div class="summary-row">
          <span>商品总价:</span>
          <span>CAD ${{ getTotalPrice().toFixed(2) }}</span>
        </div>
        <div class="summary-row">
          <span>配送费用:</span>
          <span>免费</span>
        </div>
        <div class="summary-row total">
          <span>订单总计:</span>
          <span>CAD ${{ parseFloat(order.total_price).toFixed(2) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { api } from '../api.js';

const props = defineProps({
  show: Boolean,
  order: Object
});

const emit = defineEmits(['close']);

const merchantInfo = ref(null);

// 获取商家信息
const loadMerchantInfo = async () => {
  if (props.order?.merchant_id) {
    try {
      const merchants = await api.getMerchants();
      const merchant = merchants.find(m => m.id === props.order.merchant_id);
      merchantInfo.value = merchant || null;
    } catch (error) {
      console.error('加载商家信息失败:', error);
      merchantInfo.value = null;
    }
  }
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 获取订单状态文本
const getStatusText = (status) => {
  const statusMap = {
    'PENDING': '待取货',
    'CONFIRMED': '已确认',
    'PREPARING': '准备中',
    'READY': '可取货',
    'COMPLETED': '已完成',
    'CANCELLED': '已取消'
  };
  return statusMap[status] || status;
};

// 格式化手机号
const formatPhone = (phone) => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 10) {
    const last10 = digits.length > 10 ? digits.slice(-10) : digits;
    const areaCode = last10.slice(0, 3);
    return `(${areaCode}) ${last10.slice(3, 6)}-${last10.slice(6)}`;
  }
  return phone;
};

// 计算商品总价
const getTotalPrice = () => {
  if (!props.order?.items) return 0;
  return props.order.items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

// 关闭模态框
const closeModal = () => {
  emit('close');
};

// 监听订单变化并加载商家信息
watch(() => props.order, (newOrder) => {
  if (newOrder) {
    loadMerchantInfo();
  }
}, { immediate: true });
</script>

<style scoped>
.order-detail-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.order-detail-modal {
  background: white;
  border-radius: 12px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  padding: 20px;
  position: relative;
  margin: 20px;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  color: #333;
}

.pickup-code-section {
  text-align: center;
  margin-bottom: 20px;
}

.pickup-code-section h3 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 16px;
}

.pickup-code {
  font-size: 24px;
  font-weight: bold;
  color: #07c160;
  background: #f0f9ff;
  padding: 10px 20px;
  border-radius: 8px;
  display: inline-block;
}

.pickup-point-section {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.merchant-info, .address-info, .email-info {
  display: flex;
  margin-bottom: 8px;
}

.info-label {
  font-weight: bold;
  min-width: 80px;
  color: #333;
}

.info-value {
  color: #666;
  flex: 1;
}

.payment-qrcode-section {
  text-align: center;
  margin-bottom: 20px;
}

.payment-qrcode-section h3 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 16px;
}

.qrcode-placeholder {
  display: inline-block;
}

.qrcode-placeholder img {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.qrcode-note {
  margin-top: 8px;
  color: #666;
  font-size: 12px;
}

.order-basic-info {
  margin-bottom: 20px;
}

.order-info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.order-info-row:last-child {
  border-bottom: none;
}

.label {
  font-weight: bold;
  color: #333;
}

.value {
  color: #666;
  text-align: right;
  max-width: 70%;
  word-break: break-word;
}

.order-items-section {
  margin-bottom: 20px;
}

.order-items-section h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 16px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.order-item:last-child {
  border-bottom: none;
}

.item-name {
  flex: 1;
  color: #333;
}

.item-details {
  display: flex;
  gap: 10px;
  color: #666;
  min-width: 180px;
  justify-content: flex-end;
}

.item-price, .item-quantity, .item-total {
  min-width: 60px;
  text-align: right;
}

.order-summary {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

.summary-row.total {
  font-weight: bold;
  border-top: 2px solid #07c160;
  padding-top: 12px;
  margin-top: 8px;
}
</style>