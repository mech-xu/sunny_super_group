<template>
  <div v-if="showValidator" class="api-validator">
    <div class="validator-header">
      <h3>API 验证状态</h3>
      <button @click="toggleValidator" class="close-btn">×</button>
    </div>
    <div class="validator-content">
      <div v-for="endpoint in endpoints" :key="endpoint.name" class="endpoint-status">
        <span class="endpoint-name">{{ endpoint.name }}</span>
        <span 
          :class="['status-indicator', 
            endpoint.status === 'success' ? 'success' : 
            endpoint.status === 'error' ? 'error' : 'pending']"
        >
          {{ endpoint.status === 'success' ? '✅' : endpoint.status === 'error' ? '❌' : '🔄' }}
        </span>
        <span v-if="endpoint.error" class="error-message">{{ endpoint.error }}</span>
      </div>
    </div>
    <button @click="validateAll" class="validate-btn">重新验证</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from '../api.js';

const showValidator = ref(false);
const endpoints = ref([
  { name: '获取商家列表', status: 'pending', error: null },
  { name: '获取商品列表', status: 'pending', error: null },
  { name: '获取用户信息', status: 'pending', error: null },
  { name: '获取订单列表', status: 'pending', error: null }
]);

const toggleValidator = () => {
  showValidator.value = !showValidator.value;
};

const validateEndpoint = async (endpoint, index) => {
  try {
    let result;
    switch (endpoint.name) {
      case '获取商家列表':
        result = await api.getMerchants();
        break;
      case '获取商品列表':
        result = await api.getProducts();
        break;
      case '获取用户信息':
        // 使用测试手机号
        result = await api.getUserByPhone('test123');
        break;
      case '获取订单列表':
        result = await api.getOrders();
        break;
      default:
        throw new Error('Unknown endpoint');
    }
    
    endpoints.value[index].status = 'success';
    endpoints.value[index].error = null;
  } catch (error) {
    endpoints.value[index].status = 'error';
    endpoints.value[index].error = error.message.substring(0, 50) + '...';
  }
};

const validateAll = async () => {
  // 重置所有状态
  endpoints.value = endpoints.value.map(ep => ({
    ...ep,
    status: 'pending',
    error: null
  }));
  
  // 并行验证所有端点
  const promises = endpoints.value.map((endpoint, index) => 
    validateEndpoint(endpoint, index)
  );
  
  await Promise.all(promises);
};

// 开发环境下自动显示验证器
onMounted(() => {
  if (import.meta.env.DEV) {
    setTimeout(() => {
      showValidator.value = true;
      validateAll();
    }, 2000);
  }
});
</script>

<style scoped>
.api-validator {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 16px;
  border-radius: 8px;
  z-index: 10000;
  min-width: 300px;
  font-size: 12px;
}

.validator-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
}

.endpoint-status {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  gap: 8px;
}

.endpoint-name {
  flex: 1;
}

.status-indicator {
  width: 20px;
  text-align: center;
}

.status-indicator.success {
  color: #4ade80;
}

.status-indicator.error {
  color: #f87171;
}

.error-message {
  color: #fbbf24;
  font-size: 10px;
  flex: 1;
}

.validate-btn {
  width: 100%;
  padding: 8px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 12px;
}
</style>