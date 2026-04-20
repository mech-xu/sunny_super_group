<template>
  <div class="debug-page">
    <iPhoneFrame>
      <WeChatHeader title="调试面板">
        <template #left>
          <button @click="goBack" class="back-btn">←</button>
        </template>
        <template #right>
          <button @click="refreshPage" class="refresh-btn">↻</button>
        </template>
      </WeChatHeader>

      <main class="main-content">
        <div class="debug-section">
          <h2>UI/UX & 订单流程调试面板</h2>
          <p>当前时间: {{ currentTime }}</p>
          
          <div class="debug-controls">
            <div class="control-group">
              <h3>页面导航</h3>
              <div class="nav-buttons">
                <button @click="navigateTo('/')" class="nav-btn">首页</button>
                <button @click="navigateTo('/products')" class="nav-btn">商品列表</button>
                <button @click="navigateTo('/cart')" class="nav-btn">购物车</button>
                <button @click="navigateTo('/orders')" class="nav-btn">我的订单</button>
                <button @click="navigateTo('/profile')" class="nav-btn">个人中心</button>
              </div>
            </div>

            <div class="control-group">
              <h3>订单流程测试</h3>
              <div class="flow-buttons">
                <button @click="testFlow('login')" class="flow-btn">登录流程</button>
                <button @click="testFlow('add-to-cart')" class="flow-btn">添加商品到购物车</button>
                <button @click="testFlow('checkout')" class="flow-btn">结账流程</button>
                <button @click="testFlow('order-status')" class="flow-btn">订单状态变更</button>
              </div>
            </div>

            <div class="control-group">
              <h3>UI组件测试</h3>
              <div class="ui-buttons">
                <button @click="testComponent('header')" class="ui-btn">头部组件</button>
                <button @click="testComponent('footer')" class="ui-btn">底部导航</button>
                <button @click="testComponent('modal')" class="ui-btn">弹窗组件</button>
                <button @click="testComponent('form')" class="ui-btn">表单组件</button>
              </div>
            </div>

            <div class="control-group">
              <h3>设备信息</h3>
              <div class="device-info">
                <p>屏幕宽度: {{ screenWidth }}px</p>
                <p>屏幕高度: {{ screenHeight }}px</p>
                <p>设备像素比: {{ devicePixelRatio }}</p>
                <p>用户代理: {{ userAgent }}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <WeChatFooter :activeTab="currentActiveTab" @tab-change="handleTabChange" />
    </iPhoneFrame>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import iPhoneFrame from '../components/iPhoneFrame.vue';
import WeChatHeader from '../components/WeChatHeader.vue';
import WeChatFooter from '../components/WeChatFooter.vue';

const router = useRouter();
const currentTime = ref('');
const currentActiveTab = ref('home');
const screenWidth = ref(0);
const screenHeight = ref(0);
const devicePixelRatio = ref(0);
const userAgent = ref('');

onMounted(() => {
  updateTime();
  setInterval(updateTime, 1000);
  
  // 获取设备信息
  screenWidth.value = window.screen.width;
  screenHeight.value = window.screen.height;
  devicePixelRatio.value = window.devicePixelRatio;
  userAgent.value = navigator.userAgent;
});

const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleString('zh-CN');
};

const goBack = () => {
  window.history.back();
};

const refreshPage = () => {
  window.location.reload();
};

const navigateTo = (path) => {
  router.push(path);
};

const testFlow = (flowType) => {
  console.log(`Testing flow: ${flowType}`);
  switch(flowType) {
    case 'login':
      router.push('/auth');
      break;
    case 'add-to-cart':
      alert('添加商品到购物车测试');
      break;
    case 'checkout':
      router.push('/order-preview');
      break;
    case 'order-status':
      router.push('/my-orders');
      break;
  }
};

const testComponent = (componentType) => {
  console.log(`Testing component: ${componentType}`);
  switch(componentType) {
    case 'modal':
      alert('模态框组件测试');
      break;
    case 'form':
      alert('表单组件测试');
      break;
  }
};

const handleTabChange = (tab) => {
  currentActiveTab.value = tab.name;
  router.push(tab.path);
};
</script>

<style scoped>
.debug-page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.main-content {
  padding: 20px 10px;
  background-color: #f5f5f5;
  min-height: calc(100vh - 120px);
}

.debug-section {
  background: white;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
}

.debug-section h2 {
  color: #333;
  font-size: 1.4em;
  margin-bottom: 10px;
}

.debug-section p {
  color: #666;
  font-size: 0.9em;
}

.debug-controls .control-group {
  margin: 25px 0;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.debug-controls .control-group:last-child {
  border-bottom: none;
}

.debug-controls .control-group h3 {
  color: #333;
  font-size: 1.1em;
  margin-bottom: 15px;
}

.nav-buttons, .flow-buttons, .ui-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.nav-btn, .flow-btn, .ui-btn {
  padding: 10px 15px;
  border: 1px solid #07c160;
  background: white;
  color: #07c160;
  border-radius: 5px;
  font-size: 0.9em;
  cursor: pointer;
  transition: all 0.3s;
}

.nav-btn:hover, .flow-btn:hover, .ui-btn:hover {
  background: #07c160;
  color: white;
}

.device-info p {
  margin: 8px 0;
  font-size: 0.9em;
  color: #555;
}
</style>