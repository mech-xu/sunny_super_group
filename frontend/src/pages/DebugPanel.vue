<template>
  <div class="debug-panel">
    <iPhoneFrame>
      <SimpleHeader title="调试面板" :showBack="true" @back="goBack" />

      <main class="main-content">
        <div class="debug-section">
          <h2>调试功能</h2>
          
          <!-- 用户信息调试 -->
          <div class="debug-card">
            <h3>用户信息</h3>
            <div class="debug-content">
              <pre>{{ currentUserInfo }}</pre>
              <button @click="clearUserStorage" class="debug-btn">清除用户数据</button>
            </div>
          </div>
          
          <!-- 购物车调试 -->
          <div class="debug-card">
            <h3>购物车数据</h3>
            <div class="debug-content">
              <pre>{{ cartInfo }}</pre>
              <button @click="clearCartStorage" class="debug-btn">清除购物车</button>
            </div>
          </div>
          
          <!-- API 测试 -->
          <div class="debug-card">
            <h3>API 测试</h3>
            <div class="debug-content">
              <button @click="testApiConnection" class="debug-btn">测试API连接</button>
              <div v-if="apiTestResult" class="api-result">
                {{ apiTestResult }}
              </div>
            </div>
          </div>
        </div>
      </main>

      <SimpleFooter :activeTab="'user'" @tab-change="handleTabChange" />
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

const currentUserInfo = computed(() => {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
});

const cartInfo = computed(() => {
  const cart = localStorage.getItem('cart');
  return cart ? JSON.parse(cart) : null;
});

const apiTestResult = ref('');

const clearUserStorage = () => {
  localStorage.removeItem('currentUser');
  alert('用户数据已清除');
};

const clearCartStorage = () => {
  localStorage.removeItem('cart');
  alert('购物车数据已清除');
};

const testApiConnection = async () => {
  try {
    const response = await api.testConnection();
    apiTestResult.value = `API连接成功: ${JSON.stringify(response)}`;
  } catch (error) {
    apiTestResult.value = `API连接失败: ${error.message}`;
  }
};

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
</script>

<style scoped>
.main-content {
  padding: 16px 0;
}

.debug-section {
  padding: 0 16px;
}

.debug-section h2 {
  text-align: center;
  margin-bottom: 24px;
  color: #333;
}

.debug-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.debug-card h3 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 16px;
}

.debug-content {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-word;
}

.debug-btn {
  width: 100%;
  padding: 8px;
  margin-top: 8px;
  background: #07c160;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.debug-btn:hover {
  background: #06a852;
}

.api-result {
  margin-top: 8px;
  padding: 8px;
  background: #e9ecef;
  border-radius: 6px;
  font-size: 14px;
}
</style>