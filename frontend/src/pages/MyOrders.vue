<template>
  <div class="my-orders">
    <iPhoneFrame>
      <SimpleHeader title="我的订单">
        <template #left>
          <button @click="goHome" class="home-btn">🏠</button>
        </template>
        <template #right>
          <button @click="refreshOrders" class="refresh-btn">🔄</button>
        </template>
      </SimpleHeader>

      <main class="main-content">
        <div class="orders-tabs">
          <div class="tab-buttons">
            <button 
              v-for="tab in orderTabs" 
              :key="tab.key"
              :class="['tab-btn', { active: activeTab === tab.key }]"
              @click="switchTab(tab.key)"
            >
              {{ tab.label }} ({{ tab.count }})
            </button>
          </div>
        </div>

        <div class="orders-list" v-if="filteredOrders.length > 0">
          <div 
            v-for="order in filteredOrders" 
            :key="order.orderId" 
            class="order-item"
          >
            <div class="order-header">
              <div class="order-id">订单号: {{ order.orderId }}</div>
              <div class="order-status" :class="order.status.toLowerCase()">{{ order.status }}</div>
            </div>
            
            <div class="order-details">
              <div class="order-products">
                <div 
                  v-for="(item, index) in order.items" 
                  :key="index" 
                  class="order-product"
                >
                  <h4>{{ item.productName }}</h4>
                  <p class="item-price">单价: CAD ${{ item.price }}</p>
                  <div class="quantity-control">
                    <label>数量:</label>
                    <input 
                      type="number" 
                      :value="item.quantity" 
                      @change="updateOrderItemQuantity(order.orderId, index, $event.target.value)"
                      min="1"
                    />
                  </div>
                  <p class="item-subtotal">小计: CAD ${{ (item.price * item.quantity).toFixed(2) }}</p>
                </div>
              </div>
              
              <div class="order-summary">
                <p>商品总数: {{ getOrderItemCount(order) }}</p>
                <p>订单总额: CAD ${{ getOrderTotal(order) }}</p>
                <p v-if="order.deliveryAddress">收货地址: {{ order.deliveryAddress }}</p>
                <p v-if="order.notes">备注: {{ order.notes }}</p>
              </div>
            </div>
            
            <div class="order-actions">
              <button @click="viewOrder(order)" class="view-btn">查看</button>
              <button @click="editOrder(order)" class="edit-btn">修改</button>
              <button @click="deleteOrder(order.orderId)" class="delete-btn" v-if="order.status === '待确认'">删除</button>
              <button 
                v-if="order.status === '待确认'" 
                @click="generateOrderConfirmation(order.orderId)" 
                class="confirm-btn"
              >
                确认订单
              </button>
              <div v-if="order.qrCode" class="qr-code">
                <p>提货码：</p>
                <img :src="order.qrCode" alt="订单二维码" />
                <p class="order-id-small">{{ order.orderId }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="empty-orders">
          <p>暂无{{ activeTabLabel }}订单</p>
        </div>
      </main>

      <SimpleFooter :activeTab="currentActiveTab" @tab-change="handleTabChange" />
    </iPhoneFrame>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import iPhoneFrame from '../components/iPhoneFrame.vue';
import SimpleHeader from '../components/SimpleHeader.vue';
import SimpleFooter from '../components/SimpleFooter.vue';
import { api } from '../api.js';

const router = useRouter();
const orders = ref([]);
const activeTab = ref('all'); // all, pending, confirmed, completed, cancelled

// 当前激活的底部标签
const currentActiveTab = ref('user');

// 订单标签配置
const orderTabs = ref([
  { key: 'all', label: '全部', count: 0 },
  { key: 'pending', label: '待确认', count: 0 },
  { key: 'confirmed', label: '待自提', count: 0 },
  { key: 'completed', label: '已完成', count: 0 },
  { key: 'cancelled', label: '已取消', count: 0 }
]);

// 从 API 加载订单数据
const loadOrdersFromAPI = async () => {
  try {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.id) {
        const userOrders = await api.getGroupOrders(user.id);
        orders.value = userOrders || [];
      }
    }
  } catch (error) {
    console.error('Failed to load orders from API:', error);
    orders.value = [];
  }
};

// 初始化订单数据 - 从 API 而不是 localStorage
onMounted(async () => {
  await loadOrdersFromAPI();
  updateTabCounts();
});

// 更新标签计数
const updateTabCounts = () => {
  const allCount = orders.value.length;
  const pendingCount = orders.value.filter(o => o.status === '待确认').length;
  const confirmedCount = orders.value.filter(o => o.status === '已确认').length;
  const completedCount = orders.value.filter(o => o.status === '已完成').length;
  const cancelledCount = orders.value.filter(o => o.status === '已取消').length;
  
  orderTabs.value[0].count = allCount;
  orderTabs.value[1].count = pendingCount;
  orderTabs.value[2].count = confirmedCount;
  orderTabs.value[3].count = completedCount;
  orderTabs.value[4].count = cancelledCount;
};

// 根据当前标签过滤订单
const filteredOrders = computed(() => {
  if (activeTab.value === 'all') {
    return orders.value;
  } else if (activeTab.value === 'pending') {
    return orders.value.filter(order => order.status === '待确认');
  } else if (activeTab.value === 'confirmed') {
    return orders.value.filter(order => order.status === '已确认');
  } else if (activeTab.value === 'completed') {
    return orders.value.filter(order => order.status === '已完成');
  } else if (activeTab.value === 'cancelled') {
    return orders.value.filter(order => order.status === '已取消');
  }
  return orders.value;
});

// 获取当前标签的名称
const activeTabLabel = computed(() => {
  const tab = orderTabs.value.find(t => t.key === activeTab.value);
  return tab ? tab.label : '全部';
});

// 获取订单商品总数
const getOrderItemCount = (order) => {
  return order.items.reduce((total, item) => total + item.quantity, 0);
};

// 获取订单总额
const getOrderTotal = (order) => {
  return order.items.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
};

// 查看订单详情
const viewOrder = (order) => {
  alert(`查看订单详情:\n订单号: ${order.orderId}\n状态: ${order.status}`);
};

// 编辑订单
const editOrder = (order) => {
  alert(`编辑订单: ${order.orderId}`);
};

// 删除订单
const deleteOrder = async (orderId) => {
  if (confirm('确定要删除这个订单吗？')) {
    try {
      // 从 API 删除订单
      await api.deleteGroupOrder(orderId);
      // 重新加载订单
      await loadOrdersFromAPI();
      updateTabCounts();
    } catch (error) {
      console.error('删除订单失败:', error);
      alert('删除订单失败，请重试');
    }
  }
};

// 更新订单商品数量
const updateOrderItemQuantity = async (orderId, itemIndex, newQuantity) => {
  const parsedQty = parseInt(newQuantity);
  if (isNaN(parsedQty) || parsedQty < 1) {
    alert('商品数量至少为1');
    return;
  }

  try {
    // 从 API 获取当前订单
    const order = await api.getGroupOrderById(orderId);
    if (order) {
      const item = order.items[itemIndex];
      if (item) {
        item.quantity = parsedQty;
        // 更新订单到 API
        await api.updateGroupOrder(orderId, order);
        // 重新加载订单
        await loadOrdersFromAPI();
      }
    }
  } catch (error) {
    console.error('更新订单数量失败:', error);
    alert('更新订单数量失败，请重试');
  }
};

// 生成订单确认（订单号和二维码）
const generateOrderConfirmation = async (orderId) => {
  try {
    // 从 API 获取当前订单
    const order = await api.getGroupOrderById(orderId);
    if (order) {
      // 生成模拟订单号（实际项目中应该由后端生成）
      const confirmationNumber = `SN${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      // 生成模拟二维码（实际项目中应该使用二维码库生成真实的二维码）
      // 这里只是一个占位符，实际应用中需要引入二维码生成库
      order.qrCode = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='100%' height='100%' fill='white'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='14' fill='black'>QR:${confirmationNumber}</text></svg>`;
      
      order.status = '已确认';
      
      // 更新订单到 API
      await api.updateGroupOrder(orderId, order);
      
      alert(`订单已确认！\n订单号: ${confirmationNumber}`);
      
      // 重新加载订单
      await loadOrdersFromAPI();
      updateTabCounts();
      
      // 清空本地购物车数据
      localStorage.removeItem('cart');
      
      // 跳转到产品首页
      router.push('/products');
    }
  } catch (error) {
    console.error('确认订单失败:', error);
    alert('确认订单失败，请重试');
  }
};

// 切换订单标签
const switchTab = (tabKey) => {
  activeTab.value = tabKey;
};

// 返回首页
const goHome = () => {
  router.push('/products');
};

// 刷新订单
const refreshOrders = async () => {
  await loadOrdersFromAPI();
  updateTabCounts();
};

// 底部标签切换
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

.orders-tabs {
  margin-bottom: 16px;
}

.tab-buttons {
  display: flex;
  overflow-x: auto;
  gap: 8px;
  padding-bottom: 8px;
}

.tab-btn {
  flex-shrink: 0;
  padding: 8px 16px;
  background: #f8f9fa;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  white-space: nowrap;
}

.tab-btn.active {
  background: #07c160;
  color: white;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.order-item {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.order-id {
  font-weight: bold;
  color: #333;
}

.order-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: white;
}

.order-status.pending {
  background-color: #f56c6c;
}

.order-status.confirmed {
  background-color: #e6a23c;
}

.order-status.completed {
  background-color: #67c23a;
}

.order-status.cancelled {
  background-color: #909399;
}

.order-details {
  margin-bottom: 15px;
}

.order-products {
  margin-bottom: 10px;
}

.order-product {
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ddd;
}

.item-price, .item-subtotal {
  color: #e74c3c;
  font-weight: bold;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
}

.quantity-control label {
  font-size: 14px;
  color: #666;
}

.quantity-control input {
  width: 60px;
  padding: 4px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.order-summary {
  font-weight: bold;
  color: #333;
}

.order-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.view-btn, .edit-btn, .delete-btn, .confirm-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.view-btn {
  background: #409eff;
  color: white;
}

.edit-btn {
  background: #e6a23c;
  color: white;
}

.delete-btn {
  background: #f56c6c;
  color: white;
}

.confirm-btn {
  background: #67c23a;
  color: white;
}

.qr-code {
  margin-top: 10px;
  text-align: center;
}

.qr-code img {
  width: 150px;
  height: 150px;
  margin: 10px auto;
}

.order-id-small {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

.empty-orders {
  text-align: center;
  padding: 40px 16px;
  color: #999;
  font-size: 16px;
}

.home-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #333;
  cursor: pointer;
  padding: 4px;
}

.refresh-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #333;
  cursor: pointer;
  padding: 4px;
}
</style>