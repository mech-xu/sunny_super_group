<template>
  <div class="simple-mobile-debug">
    <!-- 调试控制面板 -->
    <div class="debug-header">
      <h2>📱 移动端调试工具</h2>
      <div class="debug-controls">
        <button @click="toggleDeviceFrame" class="control-btn">
          {{ showDeviceFrame ? '隐藏设备框架' : '显示设备框架' }}
        </button>
        <button @click="toggleNetworkStatus" class="control-btn" :class="{ offline: isOffline }">
          {{ isOffline ? '恢复网络' : '模拟离线' }}
        </button>
        <button @click="clearLocalStorage" class="control-btn">
          清空本地数据
        </button>
        <button @click="goToAdminLogin" class="control-btn admin-login-btn">
          管理员登录
        </button>
        <select v-model="currentView" @change="switchView" class="view-select">
          <option value="/products">商品目录</option>
          <option value="/cart">购物车</option>
          <option value="/group-buying-order">团购下单</option>
          <option value="/order-verification">订单核销</option>
          <option value="/merchant-dashboard">商家管理</option>
        </select>
      </div>
    </div>

    <!-- 设备模拟器 -->
    <div class="device-simulator" :class="{ 'with-frame': showDeviceFrame }">
      <!-- iPhone框架 -->
      <div v-if="showDeviceFrame" class="iphone-frame">
        <div class="notch"></div>
        
        <!-- 内容区域 -->
        <div class="simulator-content">
          <component 
            :is="currentComponent" 
            :key="componentKey"
            @debug-event="handleDebugEvent"
          />
        </div>
        
        <div class="home-indicator"></div>
      </div>
      
      <!-- 无框架模式 -->
      <div v-else class="no-frame-content">
        <component 
          :is="currentComponent" 
          :key="componentKey"
          @debug-event="handleDebugEvent"
        />
      </div>
    </div>

    <!-- 调试日志 -->
    <div class="debug-console">
      <div class="console-header">
        <span>📋 调试日志</span>
        <button @click="clearLogs" class="clear-btn">清空</button>
      </div>
      <div class="console-content" ref="consoleContent">
        <div 
          v-for="(log, index) in debugLogs" 
          :key="index" 
          class="log-item"
          :class="log.type"
        >
          <span class="log-time">{{ log.time }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 导航到管理员登录页面
const goToAdminLogin = () => {
  // 确保路径格式正确，避免双斜杠问题
  router.push({ path: '/admin-login' });
};

// 导入项目页面组件
import ProductDirectory from '../pages/ProductDirectory.vue';
import CartDetails from '../pages/CartDetails.vue';
import GroupBuyingOrder from '../pages/GroupBuyingOrder.vue';
import OrderVerification from '../pages/OrderVerification.vue';
import MerchantDashboard from '../pages/MerchantDashboard.vue';

// 调试状态
const showDeviceFrame = ref(true);
const isOffline = ref(false);
const currentView = ref('/products');
const componentKey = ref(0);
const debugLogs = ref([]);

// 组件映射
const componentMap = {
  '/products': ProductDirectory,
  '/cart': CartDetails,
  '/group-buying-order': GroupBuyingOrder,
  '/order-verification': OrderVerification,
  '/merchant-dashboard': MerchantDashboard
};

// 计算属性
const currentComponent = computed(() => componentMap[currentView.value] || ProductDirectory);

const consoleContent = ref(null);

// 方法
const toggleDeviceFrame = () => {
  showDeviceFrame.value = !showDeviceFrame.value;
  addLog('info', `设备框架已${showDeviceFrame.value ? '显示' : '隐藏'}`);
};

const toggleNetworkStatus = () => {
  isOffline.value = !isOffline.value;
  
  // 模拟网络状态变化
  if (isOffline.value) {
    // 禁用网络请求（通过覆盖fetch和XMLHttpRequest）
    window.originalFetch = window.fetch;
    window.fetch = () => Promise.reject(new Error('Network error: offline mode'));
    addLog('warn', '网络已离线 - 所有API请求将失败');
  } else {
    // 恢复网络
    if (window.originalFetch) {
      window.fetch = window.originalFetch;
      delete window.originalFetch;
    }
    addLog('info', '网络已恢复');
  }
};

const clearLocalStorage = () => {
  localStorage.clear();
  sessionStorage.clear();
  componentKey.value++; // 强制重新渲染组件
  addLog('info', '本地存储已清空');
};

const switchView = () => {
  addLog('info', `切换到视图: ${currentView.value}`);
  componentKey.value++; // 强制重新渲染组件
};

const addLog = (type, message) => {
  const time = new Date().toLocaleTimeString('zh-CN', { 
    hour12: false, 
    second: '2-digit' 
  });
  
  debugLogs.value.push({ type, message, time });
  
  // 自动滚动到底部
  nextTick(() => {
    if (consoleContent.value) {
      consoleContent.value.scrollTop = consoleContent.value.scrollHeight;
    }
  });
  
  // 限制日志数量
  if (debugLogs.value.length > 100) {
    debugLogs.value.shift();
  }
};

const clearLogs = () => {
  debugLogs.value = [];
};

const handleDebugEvent = (event) => {
  // 处理来自子组件的调试事件
  if (event.type && event.message) {
    addLog(event.type, event.message);
  }
};

// 初始化
onMounted(() => {
  // 设置默认用户数据用于调试
  const mockUser = {
    id: 'mock-user-id',
    phone: '4165829301',
    nickname: '测试用户',
    role: 'customer'
  };
  
  localStorage.setItem('currentUser', JSON.stringify(mockUser));
  
  // 设置模拟购物车数据
  const mockCart = {
    'product-1': 2,
    'product-2': 1
  };
  localStorage.setItem('cart', JSON.stringify(mockCart));
  
  addLog('info', '调试环境已初始化');
  addLog('info', '模拟用户: 测试用户 (4165829301)');
  addLog('info', '模拟购物车: 3件商品');
});

// 全局错误监听
window.addEventListener('error', (event) => {
  addLog('error', `JavaScript错误: ${event.error?.message || event.message}`);
});

window.addEventListener('unhandledrejection', (event) => {
  addLog('error', `未处理的Promise拒绝: ${event.reason?.message || event.reason}`);
});
</script>

<style scoped>
.simple-mobile-debug {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.debug-header {
  background: white;
  padding: 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.debug-header h2 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.debug-controls {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.control-btn {
  padding: 8px 12px;
  margin: 4px;
  border: 1px solid #007bff;
  background: white;
  color: #007bff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.admin-login-btn {
  background: #28a745;
  color: white;
  border-color: #28a745;
}

.admin-login-btn:hover {
  background: #218838;
  border-color: #1e7e34;
}

.offline {
  background: #dc3545;
  color: white;
  border-color: #dc3545;
}

.offline:hover {
  background: #c82333;
  border-color: #bd2130;
}

.view-select {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 12px;
  background: white;
}

.device-simulator {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow: hidden;
}

.device-simulator.with-frame {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.iphone-frame {
  width: 375px;
  height: 812px;
  background: black;
  border-radius: 40px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}

.notch {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 180px;
  height: 30px;
  background: black;
  border-radius: 0 0 20px 20px;
  z-index: 10;
}

.simulator-content {
  height: calc(100% - 74px); /* 减去顶部状态栏和底部home indicator */
  margin-top: 34px;
  overflow: hidden;
}

.home-indicator {
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.home-indicator::after {
  content: '';
  width: 134px;
  height: 5px;
  background: white;
  border-radius: 100px;
  opacity: 0.8;
}

.no-frame-content {
  width: 375px;
  height: 667px;
  overflow: hidden;
  border: 1px solid #ddd;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.debug-console {
  height: 200px;
  background: white;
  border-top: 1px solid #eee;
  display: flex;
  flex-direction: column;
}

.console-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
  font-size: 12px;
  font-weight: 500;
}

.clear-btn {
  padding: 4px 8px;
  border: 1px solid #6c757d;
  background: white;
  color: #6c757d;
  border-radius: 4px;
  cursor: pointer;
  font-size: 10px;
}

.console-content {
  flex: 1;
  padding: 8px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 11px;
}

.log-item {
  padding: 4px 0;
  border-bottom: 1px solid #f0f0f0;
}

.log-item.info {
  color: #07c160;
}

.log-item.warn {
  color: #ff8f00;
}

.log-item.error {
  color: #dc3545;
  font-weight: bold;
}

.log-time {
  opacity: 0.7;
  margin-right: 8px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .debug-header {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
  .debug-controls {
    justify-content: center;
  }
  
  .device-simulator {
    padding: 10px;
  }
  
  .iphone-frame {
    width: 320px;
    height: 690px;
  }
  
  .no-frame-content {
    width: 320px;
    height: 568px;
  }
}
</style>