<template>
  <div class="mobile-simulator-container">
    <!-- 控制面板 -->
    <div class="simulator-controls">
      <div class="control-group">
        <label>设备类型:</label>
        <select v-model="deviceType" @change="updateDeviceSize">
          <option value="iphone13">iPhone 13</option>
          <option value="iphone14">iPhone 14 Pro</option>
          <option value="pixel6">Pixel 6</option>
          <option value="samsungS22">Samsung S22</option>
        </select>
      </div>
      
      <div class="control-group">
        <label>方向:</label>
        <select v-model="orientation">
          <option value="portrait">竖屏</option>
          <option value="landscape">横屏</option>
        </select>
      </div>
      
      <div class="control-group">
        <label>网络状态:</label>
        <select v-model="networkStatus">
          <option value="online">在线</option>
          <option value="offline">离线</option>
          <option value="slow">慢速网络</option>
        </select>
      </div>
      
      <div class="control-group">
        <label>主题:</label>
        <select v-model="theme">
          <option value="light">浅色</option>
          <option value="dark">深色</option>
        </select>
      </div>
      
      <button @click="refreshSimulator" class="refresh-btn">🔄 刷新</button>
      <button @click="toggleFullscreen" class="fullscreen-btn">
        {{ isFullscreen ? '退出全屏' : '全屏模式' }}
      </button>
    </div>

    <!-- 模拟器容器 -->
    <div 
      class="mobile-simulator" 
      :class="[deviceType, orientation, theme]"
      :style="simulatorStyle"
    >
      <!-- 状态栏 -->
      <div class="status-bar">
        <div class="status-left">
          <span class="time">{{ currentTime }}</span>
        </div>
        <div class="status-right">
          <span class="network">{{ networkIcon }}</span>
          <span class="bluetooth">.bluetooth</span>
          <span class="battery">🔋 85%</span>
        </div>
      </div>
      
      <!-- 设备刘海/挖孔 -->
      <div v-if="hasNotch" class="notch"></div>
      
      <!-- 内容区域 -->
      <div class="simulator-content" ref="simulatorContent">
        <iframe 
          :src="currentUrl" 
          :class="['simulator-iframe', { 'offline': networkStatus === 'offline' }]"
          ref="simulatorFrame"
          @load="onFrameLoad"
        ></iframe>
      </div>
      
      <!-- 底部Home Indicator (iPhone) -->
      <div v-if="deviceType.includes('iphone')" class="home-indicator"></div>
      
      <!-- 调试信息面板 -->
      <div v-if="showDebugInfo" class="debug-overlay">
        <div class="debug-info">
          <div>设备: {{ deviceInfo.name }}</div>
          <div>尺寸: {{ deviceInfo.width }} × {{ deviceInfo.height }}px</div>
          <div>缩放: {{ scale }}%</div>
          <div>网络: {{ networkStatus }}</div>
          <div>URL: {{ currentUrl }}</div>
        </div>
      </div>
    </div>

    <!-- URL输入框 -->
    <div class="url-bar">
      <input 
        type="text" 
        v-model="currentUrl" 
        @keydown.enter="navigateToUrl"
        placeholder="输入要调试的URL地址"
        class="url-input"
      />
      <button @click="navigateToUrl" class="go-btn">前往</button>
      <button @click="toggleDebugInfo" class="debug-btn">
        {{ showDebugInfo ? '隐藏' : '显示' }}调试信息
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';

// 设备配置
const devices = {
  iphone13: {
    name: 'iPhone 13',
    width: 390,
    height: 844,
    hasNotch: true,
    aspectRatio: 390/844
  },
  iphone14: {
    name: 'iPhone 14 Pro',
    width: 393,
    height: 852,
    hasNotch: true,
    aspectRatio: 393/852
  },
  pixel6: {
    name: 'Pixel 6',
    width: 412,
    height: 915,
    hasNotch: false,
    aspectRatio: 412/915
  },
  samsungS22: {
    name: 'Samsung S22',
    width: 360,
    height: 780,
    hasNotch: false,
    aspectRatio: 360/780
  }
};

// 响应式数据
const deviceType = ref('iphone13');
const orientation = ref('portrait');
const networkStatus = ref('online');
const theme = ref('light');
const currentUrl = ref('http://localhost:5173/products');
const isFullscreen = ref(false);
const showDebugInfo = ref(true);
const scale = ref(100);
const currentTime = ref(new Date().toLocaleTimeString('zh-CN', { hour12: false }));

// 计算属性
const deviceInfo = computed(() => devices[deviceType.value]);
const hasNotch = computed(() => deviceInfo.value.hasNotch);
const simulatorStyle = computed(() => {
  const baseWidth = orientation.value === 'portrait' ? deviceInfo.value.width : deviceInfo.value.height;
  const baseHeight = orientation.value === 'portrait' ? deviceInfo.value.height : deviceInfo.value.width;
  
  return {
    width: `${baseWidth * scale.value / 100}px`,
    height: `${baseHeight * scale.value / 100}px`,
    transform: `scale(${scale.value / 100})`,
    transformOrigin: 'top left'
  };
});

const networkIcon = computed(() => {
  switch(networkStatus.value) {
    case 'online': return '📶';
    case 'offline': return '❌';
    case 'slow': return '🐢';
    default: return '📶';
  }
});

// 引用
const simulatorContent = ref(null);
const simulatorFrame = ref(null);

// 方法
const updateDeviceSize = () => {
  // 设备尺寸已通过计算属性自动更新
};

const refreshSimulator = () => {
  if (simulatorFrame.value) {
    simulatorFrame.value.contentWindow.location.reload();
  }
};

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
  if (isFullscreen.value) {
    scale.value = calculateOptimalScale();
  } else {
    scale.value = 100;
  }
};

const calculateOptimalScale = () => {
  if (!simulatorContent.value) return 100;
  
  const containerWidth = simulatorContent.value.clientWidth;
  const containerHeight = simulatorContent.value.clientHeight;
  const deviceWidth = deviceInfo.value.width;
  const deviceHeight = deviceInfo.value.height;
  
  const widthScale = (containerWidth / deviceWidth) * 100;
  const heightScale = (containerHeight / deviceHeight) * 100;
  
  return Math.min(widthScale, heightScale, 100);
};

const navigateToUrl = () => {
  if (simulatorFrame.value && currentUrl.value) {
    try {
      simulatorFrame.value.src = currentUrl.value;
    } catch (error) {
      console.error('导航失败:', error);
    }
  }
};

const toggleDebugInfo = () => {
  showDebugInfo.value = !showDebugInfo.value;
};

const onFrameLoad = () => {
  console.log('页面加载完成:', currentUrl.value);
  
  // 注入调试脚本
  if (simulatorFrame.value) {
    const frameDoc = simulatorFrame.value.contentDocument;
    if (frameDoc) {
      // 添加网络状态模拟
      if (networkStatus.value === 'offline') {
        frameDoc.body.classList.add('simulator-offline');
      } else {
        frameDoc.body.classList.remove('simulator-offline');
      }
    }
  }
};

// 时间更新
onMounted(() => {
  const timer = setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString('zh-CN', { hour12: false });
  }, 1000);
  
  // 组件卸载时清理定时器
  window.addEventListener('beforeunload', () => {
    clearInterval(timer);
  });
  
  // 监听窗口大小变化
  const resizeObserver = new ResizeObserver(() => {
    if (isFullscreen.value) {
      scale.value = calculateOptimalScale();
    }
  });
  
  if (simulatorContent.value) {
    resizeObserver.observe(simulatorContent.value);
  }
});

// 监听网络状态变化
watch(networkStatus, (newStatus) => {
  if (simulatorFrame.value) {
    const frameDoc = simulatorFrame.value.contentDocument;
    if (frameDoc) {
      if (newStatus === 'offline') {
        frameDoc.body.classList.add('simulator-offline');
        // 显示离线提示
        const offlineDiv = frameDoc.createElement('div');
        offlineDiv.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: #ff6b6b;
          color: white;
          text-align: center;
          padding: 8px;
          z-index: 9999;
          font-size: 14px;
        `;
        offlineDiv.textContent = '⚠️ 模拟器：当前为离线模式';
        frameDoc.body.appendChild(offlineDiv);
      } else {
        frameDoc.body.classList.remove('simulator-offline');
        // 移除离线提示
        const offlineDiv = frameDoc.querySelector('div[style*="simulator-offline"]');
        if (offlineDiv) {
          offlineDiv.remove();
        }
      }
    }
  }
});
</script>

<style scoped>
.mobile-simulator-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f0f0f0;
  overflow: hidden;
}

.simulator-controls {
  display: flex;
  gap: 16px;
  padding: 12px;
  background: white;
  border-bottom: 1px solid #ddd;
  flex-wrap: wrap;
  align-items: center;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-group label {
  font-weight: 500;
  color: #333;
  white-space: nowrap;
}

.control-group select {
  padding: 6px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.refresh-btn, .fullscreen-btn {
  padding: 6px 12px;
  border: 1px solid #07c160;
  background: white;
  color: #07c160;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.refresh-btn:hover, .fullscreen-btn:hover {
  background: #f0f8f0;
}

.url-bar {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: white;
  border-top: 1px solid #ddd;
  align-items: center;
}

.url-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.go-btn, .debug-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.go-btn {
  background: #07c160;
  color: white;
}

.go-btn:hover {
  background: #06a852;
}

.debug-btn {
  background: #6c757d;
  color: white;
}

.debug-btn:hover {
  background: #5a6268;
}

.mobile-simulator {
  flex: 1;
  margin: 20px auto;
  background: #222;
  border-radius: 40px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  display: flex;
  flex-direction: column;
}

/* iPhone 样式 */
.mobile-simulator.iphone13,
.mobile-simulator.iphone14 {
  border-radius: 40px;
}

/* Android 样式 */
.mobile-simulator.pixel6,
.mobile-simulator.samsungS22 {
  border-radius: 20px;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
  height: 20px;
  background: transparent;
  color: white;
  font-size: 14px;
  align-items: center;
  z-index: 10;
}

.status-left .time {
  font-weight: bold;
}

.status-right {
  display: flex;
  gap: 8px;
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
  z-index: 5;
}

.simulator-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.simulator-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: white;
}

.simulator-iframe.offline {
  filter: grayscale(50%) brightness(90%);
}

.home-indicator {
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}

.home-indicator::after {
  content: '';
  width: 134px;
  height: 5px;
  background: white;
  border-radius: 100px;
  opacity: 0.8;
}

.debug-overlay {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0,0,0,0.8);
  color: white;
  padding: 10px;
  border-radius: 8px;
  font-size: 12px;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.debug-info > div {
  margin: 2px 0;
}

/* 横屏样式 */
.mobile-simulator.landscape {
  border-radius: 20px;
}

/* 深色主题 */
.mobile-simulator.dark {
  background: #000;
}

.mobile-simulator.dark .status-bar {
  color: #fff;
}

/* 全屏模式 */
.mobile-simulator.fullscreen-mode {
  margin: 0;
  border-radius: 0;
  box-shadow: none;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .simulator-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .control-group {
    justify-content: space-between;
  }
  
  .url-bar {
    flex-direction: column;
  }
  
  .url-input {
    width: 100%;
  }
}
</style>