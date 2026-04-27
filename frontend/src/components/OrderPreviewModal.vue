<template>
  <transition name="modal-fade">
    <div v-if="show" class="modal-backdrop" @click.self="hide">
      <div class="modal-content">
        <div class="modal-header">
          <h3>订单预览</h3>
          <button @click="hide" class="modal-close">&times;</button>
        </div>
        
        <div class="modal-body">
          <div v-if="!hasOrders" class="empty-state">
            <p>请先选择商品</p>
          </div>
          
          <div v-else class="order-preview-content">
            <div v-for="(order, index) in orders" :key="index" class="order-item">
              <div class="order-header">
                <span class="order-id">订单号: #{{ order.orderId }}</span>
                <span class="order-status" :class="[order.status.toLowerCase()]">{{ order.status }}</span>
              </div>
              
              <div class="order-items-list">
                <div v-for="(item, itemIndex) in order.items" :key="itemIndex" class="order-item-detail">
                  <div class="item-name">{{ item.productName }}</div>
                  <div class="item-info">
                    <span class="item-price">CAD {{ item.price }}</span>
                    <span class="item-quantity">× {{ item.quantity }}</span>
                  </div>
                </div>
              </div>
              
              <div class="order-footer">
                <span class="order-total">合计: CAD {{ order.totalAmount.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="goToMyOrders" class="modal-btn-primary">查看我的订单</button>
          <button @click="hide" class="modal-btn-secondary">关闭</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
});

const router = useRouter();
const show = ref(false);

// 同步props变化
watch(() => props.modelValue, (newVal) => {
  show.value = newVal;
});

watch(() => show.value, (newVal) => {
  emit('update:modelValue', newVal);
});

const emit = defineEmits(['update:modelValue']);

// 订单数据
const orders = ref([]);
const hasOrders = computed(() => orders.value.length > 0);

// 获取订单数据（从localStorage或API）
const loadOrders = () => {
  // 尝试从localStorage获取用户订单
  const storedOrders = localStorage.getItem('userOrders');
  if (storedOrders) {
    try {
      orders.value = JSON.parse(storedOrders);
    } catch (e) {
      console.error('Failed to parse orders from localStorage:', e);
      orders.value = [];
    }
  } else {
    // 如果没有本地订单，可以尝试从API获取（但需要用户登录）
    // 为简单起见，这里我们保持空数组
    orders.value = [];
  }
};

// 初始化加载
onMounted(() => {
  loadOrders();
});

// 方法
const hide = () => {
  show.value = false;
  emit('update:modelValue', false);
};

const goToMyOrders = () => {
  hide();
  router.push('/my-orders');
};
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.modal-close {
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

.modal-close:hover {
  color: #666;
}

.modal-body {
  padding: 20px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.empty-state p {
  margin: 0;
  font-size: 16px;
}

.order-preview-content {
  margin-bottom: 20px;
}

.order-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}

.order-id {
  font-size: 14px;
  color: #666;
}

.order-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.order-status.pending {
  background: #fff3cd;
  color: #856404;
}

.order-status.confirmed {
  background: #d4edda;
  color: #155724;
}

.order-status.shipped {
  background: #d1ecf1;
  color: #0c5460;
}

.order-status.delivered {
  background: #d4edda;
  color: #155724;
}

.order-status.cancelled {
  background: #f8d7da;
  color: #721c24;
}

.order-items-list {
  margin-bottom: 12px;
}

.order-item-detail {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.order-item-detail:last-child {
  margin-bottom: 0;
}

.item-name {
  flex: 1;
  color: #333;
}

.item-info {
  display: flex;
  gap: 12px;
  align-items: baseline;
}

.item-price {
  color: #e74c3c;
  font-weight: 500;
}

.item-quantity {
  color: #666;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  font-size: 16px;
  font-weight: bold;
  color: #333;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.order-total {
  color: #e74c3c;
}

.modal-footer {
  display: flex;
  padding: 16px 20px;
  border-top: 1px solid #eee;
  gap: 12px;
}

.modal-btn-primary,
.modal-btn-secondary {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-btn-primary {
  background: #07c160;
  color: white;
}

.modal-btn-primary:hover {
  background: #06a852;
}

.modal-btn-secondary {
  background: #f8f9fa;
  color: #666;
  border: 1px solid #ddd;
}

.modal-btn-secondary:hover {
  background: #e9ecef;
}
</style>