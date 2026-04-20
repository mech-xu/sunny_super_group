<template>
  <div class="order-preview">
    <iPhoneFrame>
      <WeChatHeader title="订单确认">
        <template #left>
          <button @click="goBack" class="back-btn">←</button>
        </template>
        <template #right>
          <button @click="goHome" class="home-btn">🏠</button>
        </template>
      </WeChatHeader>

      <main class="main-content">
        <div class="order-title">
          <h2>订单详情</h2>
          <p>请确认订单信息</p>
        </div>

        <div class="order-items">
          <div 
            v-for="(item, index) in filteredOrderItems" 
            :key="index"
            class="order-item"
          >
            <div class="item-info">
              <h3>{{ item.productName }}</h3>
              <p class="item-desc">{{ item.description }}</p>
              <div class="item-meta">
                <span class="item-price">CAD ${{ item.price }}</span>
                <div class="quantity-control">
                  <label>数量:</label>
                  <input 
                    type="number" 
                    :value="item.quantity" 
                    @change="updateQuantity(index, $event.target.value)"
                    min="1"
                    :max="item.stock"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="delivery-section">
          <h3>配送信息</h3>
          <div class="form-group">
            <label>收货姓名</label>
            <input 
              type="text" 
              v-model="recipientName" 
              placeholder="请输入收货人姓名"
            />
          </div>
          <div class="form-group">
            <label>联系电话</label>
            <input 
              type="tel" 
              v-model="recipientPhone" 
              placeholder="请输入联系电话"
            />
          </div>
          <div class="form-group">
            <label>收货地址</label>
            <input 
              type="text" 
              v-model="deliveryAddress" 
              placeholder="请输入收货地址"
            />
          </div>
        </div>

        <div class="order-notes">
          <h3>订单备注</h3>
          <textarea 
            v-model="orderNotes" 
            placeholder="如有特殊要求，请在此备注..."
            rows="3"
          ></textarea>
        </div>

        <div class="order-summary">
          <div class="summary-row">
            <span>商品小计</span>
            <span>CAD ${{ subtotalAmount }}</span>
          </div>
          <div class="summary-row">
            <span>运费</span>
            <span>+ CAD $5.00</span>
          </div>
          <div class="summary-row">
            <span>优惠</span>
            <span>- CAD $2.00</span>
          </div>
          <div class="summary-divider"></div>
          <div class="summary-row total">
            <span>实付金额</span>
            <span class="total-amount">CAD ${{ finalTotalAmount }}</span>
          </div>
        </div>

        <button @click="confirmOrder" class="confirm-btn">提交订单</button>
      </main>

      <WeChatFooter :activeTab="currentActiveTab" @tab-change="handleTabChange" />
    </iPhoneFrame>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import iPhoneFrame from '../components/iPhoneFrame.vue';
import WeChatHeader from '../components/WeChatHeader.vue';
import WeChatFooter from '../components/WeChatFooter.vue';

const router = useRouter();
const route = useRoute();

// 当前激活的底部标签
const currentActiveTab = ref('cart');

// 订单数据
const orderData = ref([]);
const recipientName = ref('');
const recipientPhone = ref('');
const deliveryAddress = ref('');
const orderNotes = ref('');

// 从路由参数或查询参数获取订单数据
onMounted(() => {
  if (route.query.orderData) {
    try {
      const parsedData = JSON.parse(decodeURIComponent(route.query.orderData));
      orderData.value = Array.isArray(parsedData) ? parsedData : [];
    } catch (e) {
      console.error('Failed to parse order data:', e);
      // 如果解析失败，尝试从localStorage获取购物车数据
      const cartData = JSON.parse(localStorage.getItem('cart') || '{}');
      // 这里可以根据需要处理从购物车获取数据的逻辑
    }
  }
});

// 过滤出已加入购物车的商品 (cartGoodsFlag = 1)
const filteredOrderItems = computed(() => {
  return orderData.value.filter(item => item.cartGoodsFlag === 1);
});

// 计算商品小计
const subtotalAmount = computed(() => {
  return filteredOrderItems.value.reduce((total, item) => {
    return total + (parseFloat(item.price) * item.quantity);
  }, 0).toFixed(2);
});

// 最终总金额（含运费和优惠）
const finalTotalAmount = computed(() => {
  const subtotal = parseFloat(subtotalAmount.value);
  const shipping = 5.00; // 运费
  const discount = 2.00; // 优惠
  return (subtotal + shipping - discount).toFixed(2);
});

// 更新商品数量
const updateQuantity = (index, newQuantity) => {
  const qty = parseInt(newQuantity);
  if (isNaN(qty) || qty < 1) {
    alert('商品数量至少为1');
    return;
  }
  
  // 检查是否有库存
  if (qty > filteredOrderItems.value[index].stock) {
    alert(`库存不足，最多可购买${filteredOrderItems.value[index].stock}件`);
    return;
  }
  
  filteredOrderItems.value[index].quantity = qty;
};

// 确认订单
const confirmOrder = async () => {
  // 验证必填字段
  if (!recipientName.value.trim()) {
    alert('请输入收货人姓名');
    return;
  }
  
  if (!recipientPhone.value.trim()) {
    alert('请输入联系电话');
    return;
  }
  
  if (!deliveryAddress.value.trim()) {
    alert('请输入收货地址');
    return;
  }
  
  // 获取当前时间作为订单创建时间
  const timestamp = new Date().toISOString();
  
  // 创建订单对象
  const newOrder = {
    orderId: `ORD${Date.now()}`, // 生成唯一的订单ID
    status: '待确认', // 初始状态为待确认
    items: JSON.parse(JSON.stringify(filteredOrderItems.value)), // 复制当前订单项目
    totalAmount: parseFloat(finalTotalAmount.value), // 最终总金额
    recipientName: recipientName.value, // 收货人姓名
    recipientPhone: recipientPhone.value, // 收货人电话
    deliveryAddress: deliveryAddress.value, // 收货地址
    notes: orderNotes.value, // 订单备注
    createdAt: timestamp, // 创建时间
    qrCode: null // 初始时没有二维码
  };

  // 从localStorage获取现有订单列表
  let existingOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
  
  // 添加新订单到列表
  existingOrders.push(newOrder);
  
  // 保存更新后的订单列表
  localStorage.setItem('userOrders', JSON.stringify(existingOrders));

  // 提交订单后跳转到我的订单页面
  router.push('/my-orders');
};

// 返回上一页
const goBack = () => {
  window.history.go(-1);
};

// 返回首页
const goHome = () => {
  router.push('/products');
};

// 底部标签切换
const handleTabChange = (tab) => {
  currentActiveTab.value = tab.name;
  router.push(tab.path);
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
}

.order-title h2 {
  margin: 0 0 5px 0;
  font-size: 20px;
  color: #333;
}

.order-title p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.order-items {
  margin-bottom: 20px;
}

.order-item {
  background: white;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.item-info h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
}

.item-desc {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #666;
}

.item-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-price {
  font-weight: bold;
  color: #e74c3c;
  font-size: 16px;
}

.quantity-control {
  display: flex;
  align-items: center;
}

.quantity-control label {
  margin-right: 8px;
  font-size: 14px;
  color: #666;
}

.quantity-control input {
  width: 60px;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
}

.delivery-section {
  background: white;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.delivery-section h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.order-notes {
  background: white;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.order-notes h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #333;
}

.order-notes textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  resize: vertical;
}

.order-summary {
  background: white;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
}

.summary-row.total {
  font-size: 16px;
  font-weight: bold;
  margin: 15px 0 0;
}

.total-amount {
  color: #e74c3c;
}

.summary-divider {
  height: 1px;
  background: #eee;
  margin: 10px 0;
}

.confirm-btn {
  width: 100%;
  padding: 16px;
  background: #07c160;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 10px;
}

.confirm-btn:active {
  background: #06a050;
}

.back-btn, .home-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #07c160;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}

.back-btn:hover, .home-btn:hover {
  background: #f5f5f5;
}
</style>